# MOFI Platform API — AWS CDK

Deploys MOFI Platform API on ECS Fargate (eight containers per task), ALB, ECR, RDS, ElastiCache Valkey, S3, Secrets Manager, and CloudWatch logs.

## Prerequisites

- AWS CLI configured
- Docker image pushed to the ECR repo (tag `latest`) after first deploy creates the repository

## Commands

From this directory (`infra/aws`):

```bash
npm install
export CDK_DEFAULT_ACCOUNT=123456789012
# Region defaults to us-east-1 in bin/mofi-platform-api.ts; set CDK_DEFAULT_REGION to override.
npx cdk synth -c stage=dev
npx cdk deploy -c stage=dev
```

Bootstrap (once per account/region), if needed:

```bash
npx cdk bootstrap aws://$CDK_DEFAULT_ACCOUNT/us-east-1
```

Data plane (created by the stack):

- **RDS MySQL** — credentials in `mofi-platform-api/{stage}/db` (injected into ECS as `DB_*`)
- **S3 uploads bucket** — name in stack output `UploadsBucketName`; ECS uses the **task role** (no access keys in secrets)

Populate secrets:

- `mofi-platform-api/{stage}/app` — JWT (`JWT_SECRET` generated on create)
- `mofi-platform-api/{stage}/valkey` — ElastiCache Valkey AUTH token
- Optional Grafana OTLP: add `OTEL_EXPORTER_OTLP_HEADERS` to the app secret and deploy with `-c grafanaOtlpEndpoint=https://…/otlp` (see [docs/observability.md](../../docs/observability.md))

Deploy:

- `npx cdk deploy -c stage=dev` — multicontainer Fargate task (60 GiB / 8 vCPU) + RDS MySQL
Cutover runbook: [CUTOVER.md](./CUTOVER.md)

Gateway authorizer + Fargate: [GATEWAY-AUTH.md](./GATEWAY-AUTH.md)

## Outputs

- **LoadBalancerDns** — point API Gateway or Route53 at this host (future cutover)
- **EcrRepositoryUri** — push container images here
