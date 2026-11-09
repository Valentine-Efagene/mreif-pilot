# ECS migration brief diagrams

| File | Use |
|------|-----|
| `mofi-ecs-migration-as-is.mmd` | Section 2 — current state |
| `mofi-ecs-migration-pilot.mmd` | Section 3 — pilot target |

The brief embeds the **exported PNGs** only (not live Mermaid). Re-export after editing source:

```bash
cd mofi-platform-api/docs/diagrams
npx @mermaid-js/mermaid-cli@11 -i mofi-ecs-migration-as-is.mmd -o mofi-ecs-migration-as-is.png -b white
npx @mermaid-js/mermaid-cli@11 -i mofi-ecs-migration-pilot.mmd -o mofi-ecs-migration-pilot.png -b white
```

Brief (validated Nov 2026): [`../MOFI-ECS-Migration-Infrastructure-Brief.md`](../MOFI-ECS-Migration-Infrastructure-Brief.md). Sync to the leadership Google Doc when the brief changes.
