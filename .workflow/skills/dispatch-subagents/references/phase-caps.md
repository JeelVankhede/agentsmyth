# Phase Caps

Caps are hard maximums:

| Phase | Role | Max | Allowed |
|---|---|---:|---|
| Think | explorer | 3 | read-only context exploration |
| Plan | explorer | 3 | read-only requirement/risk mapping |
| Build | worker | 3 | independent write workstreams |
| Review | worker-readonly | 4 | independent risk-category review |
| Test | none | 0 | no dispatch |
| Ship | none | 0 | no dispatch |
| Reflect | none | 0 | no dispatch |

Requested worker counts above the cap must be reduced or refused.
