# MOFI platform cutover runbook (Level 1)

Phases align with the MOFI ECS migration infrastructure brief (build → staging → shadow → cutover → soak).

## Prerequisites

- Container image tagged `latest` in ECR (`EcrRepositoryUri` from CDK output).
- Secrets Manager secret `mofi-platform-api/{stage}/app` populated (DB, JWT, optional S3).
- Staging ALB DNS (`LoadBalancerDns`) reachable from QA.
- **Authorization:** Client traffic must go **API Gateway → authorizer Lambda → (VPC Link) → ALB → ECS** with `AUTH_ENFORCEMENT=gateway` on tasks. See [GATEWAY-AUTH.md](./GATEWAY-AUTH.md).

## Phase 1 — Staging ECS

```bash
cd infra/aws && npx cdk deploy -c stage=dev
# push image, update service
```

Verify: `GET http://{LoadBalancerDns}/health` → `200`.

## Phase 2 — Auth shadow

Run the same auth scenarios against API Gateway (Lambda) and ECS:

```bash
export MOFI_LAMBDA_API_URL=https://{existing-api-host}
export MOFI_PLATFORM_API_URL=http://{LoadBalancerDns}
npm run auth:shadow
```

Or:

```bash
node scripts/auth-shadow-compare.mjs --lambda "$MOFI_LAMBDA_API_URL" --ecs "$MOFI_PLATFORM_API_URL"
```

Cutover is blocked until statuses match for all cases in `contract-tests/auth-shadow.json`.

When ECS runs with `AUTH_ENFORCEMENT=gateway`, shadow compares **authorizer Lambda** vs **Gateway-fronted ECS** (not Nest `MofiAuthorizerGuard`). Public routes are owned by the authorizer; see `libs/auth/src/authorizer-public-routes.ts` for local-dev parity only.

Optional contract suite against ECS:

```bash
MOFI_PLATFORM_API_URL=http://{LoadBalancerDns} npm run test:contract
```

## Phase 3 — Pilot path cutover

At API Gateway or DNS, route only these base paths to the ALB target:

- `/agent`, `/pmb`, `/rsa`, `/developer`, `/uploader`, `/cooperative`

Leave all other paths on existing Lambdas.

Rollback: revert gateway/DNS mapping for MOFI domain paths only.

## Phase 4 — Soak

Monitor ECS logs (`/ecs/mofi-platform-api-{stage}`), error rates, and auth 401/403 spikes. Retire superseded Lambdas after agreed soak window; keep ECR images for rollback.
