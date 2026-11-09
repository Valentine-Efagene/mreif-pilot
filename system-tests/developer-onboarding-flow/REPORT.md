# Test report

| Field | Value |
|-------|-------|
| Scenario | developer-onboarding-flow |
| Mode | in-process |
| **Overall** | **PASSED** |
| Failed at | — |
| Milestones passed | 6 / 6 |
| Started | 2026-11-09T13:07:23.689Z |
| Finished | 2026-11-09T13:07:25.476Z |

## Milestone flow

Where the run stopped (if it failed) is shown on the chart.

```mermaid
flowchart TD
  classDef passed fill:#d4edda,stroke:#28a745,color:#155724
  classDef failed fill:#f8d7da,stroke:#dc3545,color:#721c24
  classDef skipped fill:#e2e3e5,stroke:#6c757d,color:#383d41
  classDef pending fill:#fff3cd,stroke:#ffc107,color:#856404
  start([Start])
  m0["✓ Stub project manager (admin notification audience)"]
  start --> m0
  class m0 passed
  m1["✓ Stub external registration (POST /developer/users)"]
  m0 --> m1
  class m1 passed
  m2["✓ Complete developer onboarding (POST /developer/developers)"]
  m1 --> m2
  class m2 passed
  m3["✓ Fetch developer by user (GET /developer/developers/by-user/:id)"]
  m2 --> m3
  class m3 passed
  m4["✓ All onboarding stages marked complete"]
  m3 --> m4
  class m4 passed
  m5["✓ Company registration notification (RMQ → worker → HTTP)"]
  m4 --> m5
  class m5 passed
  endNode([End: PASSED])
  m5 --> endNode
  class endNode passed
```

## Milestone checklist

| # | Milestone | Status | Detail |
|---|-----------|--------|--------|
| 1 | Stub project manager (admin notification audience) | ✅ passed | pm+fadnbf@system-tests.mofi |
| 2 | Stub external registration (POST /developer/users) | ✅ passed | userId=28, email=developer-onboarding+wdg0igfk@system-tests.mofi |
| 3 | Complete developer onboarding (POST /developer/developers) | ✅ passed | developerId=14 |
| 4 | Fetch developer by user (GET /developer/developers/by-user/:id) | ✅ passed |  |
| 5 | All onboarding stages marked complete | ✅ passed | BUSINESS_DETAILS, GROUP_ENTITIES, DEVELOPER_DOCUMENTS, BANK_INFORMATION, DIRECTORS_FORM, TERMS_AND_CONDITION |
| 6 | Company registration notification (RMQ → worker → HTTP) | ✅ passed | /admin/developer-company-registration |

## ASCII flow

```
START
 │ ✓ Stub project manager (admin notification audience)
 │ ✓ Stub external registration (POST /developer/users)
 │ ✓ Complete developer onboarding (POST /developer/developers)
 │ ✓ Fetch developer by user (GET /developer/developers/by-user/:id)
 │ ✓ All onboarding stages marked complete
 │ ✓ Company registration notification (RMQ → worker → HTTP)
 └── END (PASSED)
```

## Step log

- **Stub project manager (admin notification audience)** — passed: pm+fadnbf@system-tests.mofi
- **Stub external registration (POST /developer/users)** — passed: userId=28, email=developer-onboarding+wdg0igfk@system-tests.mofi
- **Complete developer onboarding (POST /developer/developers)** — passed: developerId=14
- **Fetch developer by user (GET /developer/developers/by-user/:id)** — passed
- **All onboarding stages marked complete** — passed: BUSINESS_DETAILS, GROUP_ENTITIES, DEVELOPER_DOCUMENTS, BANK_INFORMATION, DIRECTORS_FORM, TERMS_AND_CONDITION
- **Company registration notification (RMQ → worker → HTTP)** — passed: /admin/developer-company-registration

## Notes

- developerId=14, userId=28, pm=pm+fadnbf@system-tests.mofi, notificationTarget=shim

_This file is overwritten on each test run. Every scenario report includes a milestone flow chart._
