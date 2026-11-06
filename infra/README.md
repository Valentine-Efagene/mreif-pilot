# MOFI Platform API — Infrastructure

| Path | Purpose |
|------|---------|
| [`aws/`](aws/) | AWS CDK — ECS Fargate, ALB, ECR, Secrets Manager |
| [`local/dev/`](local/dev/) | Local development — MySQL, Redis, **MinIO** (required) |
| [`local/test/`](local/test/) | Automated tests / CI — same stack, isolated ports |

## Quick start

**AWS:** see [aws/README.md](aws/README.md)

**Local dev:**

```bash
npm run local:dev:up
# merge infra/local/dev/.env.example into repo-root .env
npm run start:dev
```

**Local test stack:**

```bash
npm run local:test:up
```
