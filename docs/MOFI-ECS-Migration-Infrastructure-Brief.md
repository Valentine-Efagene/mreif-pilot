MOFI Platform API — ECS Migration (Pilot)

Infrastructure brief for engineering leadership

Audience: CTO / engineering leadership

Status: **Pilot scope — architecture validated** (dev ECS proof, November 2026). Ready for staging + Gateway wiring and Phase 2 shadow against Lambdas.

Date: November 2026

Author: Platform / MOFI engineering

# 1. EXECUTIVE SUMMARY

Pilot domain APIs move from separate NestJS Lambdas to one ECS Fargate **multicontainer** service (MOFI Platform API), using a strangler cutover so URL paths stay the same for clients, including MofixQshelter Admin.

Unchanged in AWS for **production cutover**: existing S3 bucket, **existing MySQL**, external notification service (HTTP via `NOTIFICATION_URL`). New: ECS Fargate (eight containers per task), Application Load Balancer, ECR, Amazon MQ for RabbitMQ in the ECS VPC, Secrets Manager, and (for agent, TBD) Redis/ElastiCache.

The main cutover risk for clients is not path routing but **authorization**: the **API Gateway custom authorizer Lambda** remains the JWT gate; ECS Fargate runs behind Gateway (VPC Link → ALB) with **no duplicate global JWT guard**. Handler roles use the shared **@qshelter/nest-auth** library (Section 6).

## 1.1 What we proved (November 2026)

The **Level 3 deployment model is implemented and exercised in AWS**, not only on paper:

| Area | Outcome |
| :---- | :---- |
| **Runtime layout** | One Fargate task = **edge** (ALB target) + **six domain processes** + **worker** (`MOFI_CONTAINER_ROLE`); single ECR image, [`docker/entrypoint.sh`](../docker/entrypoint.sh). Local **kind/Helm** matches the same layout. |
| **Repo structure** | Domains under `domains/{name}/` (split-ready); shared edge/worker under `apps/`. Monolith / `deploymentMode` **removed** — multicontainer only. |
| **IaC (CDK)** | VPC, ECS service, ALB, RDS MySQL (dev accounts), stage S3, Amazon MQ, Secrets Manager, task IAM. `AUTH_ENFORCEMENT=gateway`, `TYPEORM_SYNCHRONIZE=false`, async feature flags wired. |
| **Health & routing** | `GET /health`, `GET /{domain}/health` green on ALB; edge preserves domain path prefix on upstream hops. |
| **Automated checks** | `npm run test:contract` (domain routes, public-route parity); `npm run auth:shadow` for Phase 2 Gateway vs Lambda comparison. |
| **Messaging** | Topic exchange `mofi.domain.commands`; domain containers consume their queues (`developer.#`, …); worker handles notifications + verifier only; catalog in `docs/async-events.md`. |
| **Developer experience** | Per-domain OpenAPI at `GET /{domain}/docs` via edge (Swagger); tunable via `SWAGGER_ENABLED`. |

Dev/staging accounts can stand up and tear down the stack with `npx cdk deploy|destroy -c stage=dev`. **Production cutover** still requires pointing API Gateway pilot integrations at the MOFI ALB (VPC Link) and shadowing against live Lambdas (Phases 2–4).

# 2. CURRENT STATE (AS-IS)

Clients call one API host. API Gateway maps path prefixes to separate Lambda functions (agent, PMB, RSA, developer, uploader, cooperative, and others). Each pilot Lambda reads and writes the same existing MySQL and S3. A dedicated authorizer Lambda validates JWTs before traffic reaches domain Lambdas. The notification service is invoked asynchronously over HTTP and remains outside the domain Lambdas.

Figure 1: Current state architecture

![Current state architecture](./diagrams/mofi-ecs-migration-as-is.png)

Non-pilot routes (onboarding, apply, mortgage, propy, backoffice, wallet, and similar) stay on legacy Lambdas on the same host.

# 3. TARGET STATE (PILOT)

Pilot traffic stays on the **same API host**: API Gateway (custom authorizer) → VPC Link → Application Load Balancer → ECS Fargate (**edge + six domains + worker**). Non-pilot paths continue to existing Lambdas until later migration waves.

ECS tasks do **not** re-validate JWTs on the hot path in staging/production (`AUTH_ENFORCEMENT=gateway`). **@qshelter/nest-auth** supplies role checks and request helpers inside handlers. Tasks connect to **existing MySQL** and S3 at cutover, publish async work to **Amazon MQ**, and call the notification HTTP API unchanged.

Pilot AWS infrastructure (IaC): VPC, ECS cluster and service (multicontainer task definition), ECR, load balancer, RDS **for non-prod accounts** or connectivity to **existing RDS** in prod, Amazon MQ, Secrets Manager, logging, and IAM for S3 access from tasks.

Figure 2: Target state (pilot) architecture

![Target state (pilot) architecture](./diagrams/mofi-ecs-migration-pilot.png)

# 4. PILOT SCOPE

Table 1: Pilot base paths

| Base path | Former Lambda | Notes |
| :---- | :---- | :---- |
| /agent | agent-api | Confirm Redis/ElastiCache before production |
| /pmb | pmb-api | |
| /rsa | rsa-api | Legacy approve/decline routes on RSA paths |
| /developer | Mofi-x-Qshelter-developers-func | |
| /uploader | Mofi-x-Qshelter-uploader-func | Existing S3 bucket |
| /cooperative | cooperative-api | |

Table 2: Unchanged dependencies

| Dependency | Role |
| :---- | :---- |
| Existing S3 bucket | Production uploads; ECS task IAM |
| Existing MySQL | Domain data at prod cutover; credentials in Secrets Manager |
| Notification HTTP API | `NOTIFICATION_URL`; stays external for pilot |
| Non-pilot Lambdas | Remain on API Gateway until later waves |

Deferred domains: bank-statement, publications, wallet, backoffice, mortgage, propy, onboarding, and others.

# 5. MIGRATION PHASES

| Phase | Activity | Rollback | Status |
| :---- | :---- | :---- | :---- |
| 0 — Build | **Multicontainer** platform repo, CDK, contract + auth shadow tests, k8s parity | N/A | **Done** (Nov 2026) |
| 1 — Staging ECS | Deploy ALB + Fargate; QA on pilot paths (direct ALB or via Gateway) | Production stays on Lambdas | **Proven** on dev account; repeat for long-lived staging |
| 2 — Shadow | Compare Gateway-fronted ECS vs Lambdas on pilot paths; authorizer outcomes vs ECS | N/A | Tooling ready (`auth:shadow`); **blocked on Gateway → ALB** for prod-like path |
| 3 — Cutover | Route pilot base paths to load balancer | Revert gateway or DNS mapping | Not started |
| 4 — Soak | Retire pilot Lambdas | Keep container images for emergency | Not started |

Implementation runbooks: [`infra/aws/CUTOVER.md`](../infra/aws/CUTOVER.md), [`infra/aws/GATEWAY-AUTH.md`](../infra/aws/GATEWAY-AUTH.md).

# 6. AUTHORIZATION CARRYOVER

Today, API Gateway invokes a **custom authorizer Lambda** on protected routes. Clients (including MofixQshelter Admin) send `Authorization: Bearer <JWT>`; many routes also send a **`user_id` header** that must align with claims in the token. Domain Lambdas and middleware rely on those headers and claims after API Gateway has already allowed the request.

When pilot paths are routed **API Gateway (authorizer) → Application Load Balancer → ECS**, the authorizer step **remains in the path** for client traffic. ECS must **not** duplicate JWT validation on every domain container.

**Client contract (unchanged):**

Protected pilot routes continue to require a Bearer token. The `user_id` header remains part of the contract where it is used today. Public routes stay configured on the **authorizer Lambda** (cooperative login, selected “names” list endpoints, health, Swagger `/docs` if exposed, OPTIONS preflight).

**Inside ECS (Nest):**

Use **@qshelter/nest-auth** for handler-level authorization (`RolesGuard`, `@Roles`, `AuthHelper`, `RequestHelper`, Swagger decorators). Do not maintain a second global JWT gate in Fargate for production. Local `npm run start:dev` may use `AUTH_ENFORCEMENT=local` to approximate authorizer public routes when Gateway is not in the loop.

**Signature and secret parity:**

The authorizer Lambda validates tokens against production signing material. ECS role checks read claims from headers the client already sent; cutover is blocked until Phase 2 shadow tests match authorizer outcomes on Gateway-fronted ECS.

**Shadow and cutover checks:**

During Phase 2, run the same authenticated and unauthenticated calls against Lambda-backed staging and **Gateway-fronted** ECS staging on every pilot base path. Compare HTTP status codes and bodies for protected, public, and edge cases. Cutover proceeds only when outcomes match within agreed tolerance. The repo includes `npm run auth:shadow` for automated status comparison.

**Split-host behaviour during pilot:**

Non-pilot paths still use API Gateway plus the authorizer Lambda; pilot paths use Gateway → ALB → ECS. Tokens issued for the same environment must work on **both** sides until non-pilot domains migrate.

**Ops inputs for auth:**

Confirm authorizer public-route configuration matches platform expectations. Wire VPC Link from API Gateway to the MOFI ALB before production cutover. Confirm whether any pilot route depends on API Gateway authorizer context beyond headers.

# 7. DATA AND SECURITY

| Concern | Approach |
| :---- | :---- |
| Database | **Production cutover:** existing MySQL; no schema change required for infrastructure pilot. **Dev proof:** RDS MySQL provisioned in CDK for isolated accounts. |
| Object storage | Existing S3 bucket in AWS (stage-specific bucket in dev IaC) |
| Authentication | Section 6 — API Gateway authorizer; @qshelter/nest-auth in Nest; no duplicate JWT guard on Fargate in prod |
| Secrets | Application, DB, and broker secrets in Secrets Manager |
| Network | Dedicated VPC for ECS; security groups to RDS and Amazon MQ |

# 8. RISKS

| Risk | Mitigation |
| :---- | :---- |
| Authorization regression | Section 6 shadow tests; Gateway-only JWT; public-route checklist |
| Path regression | Automated API checks; RSA legacy routes; contract tests on ALB |
| MySQL connections | Eight processes × pool tuning; `TYPEORM_SYNCHRONIZE=false`; monitoring |
| Task memory / startup | Dev validated 60 GiB / 8 vCPU task; tune for `main`; health `startPeriod` |
| Redis timing | Agent domain review before ElastiCache in production |
| Partial cutover | Pilot paths only; gateway rollback; unified tokens across Lambda and ECS |

# 9. OPS INPUTS

1. RDS and network path from the ECS VPC to **production** existing MySQL (replace in-stack RDS used for dev proof).
2. Redis requirement for the agent domain (ElastiCache vs defer).
3. Authorizer JWT secrets and validation rules for staging/production parity on ECS.
4. Staging cutover window and rollback owner.
5. VPC Link + API Gateway route updates for pilot paths (see GATEWAY-AUTH.md).
6. Ordering of post-pilot migration waves after soak.

# 10. PLATFORM ARCHITECTURE (DELIVERED)

The following was previously described as Levels 2–3 “after cutover”; it is **now the implemented baseline** validated in dev:

**Messaging**

- Amazon MQ for RabbitMQ in the ECS VPC (private; task security groups only) — **in CDK**.
- Domains publish notification and Lambda-invoke work to durable queues; worker container calls the existing notification HTTP API and Lambda functions.
- RabbitMQ required for notifications, verifier lambda invokes, and domain command consumers.

**Single Fargate service, one runtime per domain**

- One task definition, one deploy pipeline, one ECR image.
- Containers: **edge** (ALB target, path routing), **six** pilot domain runtimes (each may host Nest RMQ consumers for its domain commands), **worker** for platform notification/Lambda queues (eight containers total).
- Inter-domain integration via RabbitMQ; external HTTP paths unchanged for clients.
- Rollback: redeploy prior ECR image; **no** monolith / single-container fallback.

**Level 4 (optional, unchanged)**

- Split Fargate services per domain only if leadership accepts multiple deploy pipelines; messaging contracts stay stable.
