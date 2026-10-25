# Development — Official EVRIMA baseline and source applicability

**Working name:** Isle Combat Atlas (Automation Workbench, externally hosted implementation)
**Tracking:** [Workbench #49](https://github.com/smf113/Workbench/issues/49)
**Active session:** official default + optional ORIGIN profiles + evidence/date presentation; approved October 25, 2026
**Inherited baseline (already on `main`):** v1.1.0 at `2a755ffc7958734d98a558abac44b57f40a0446e`. Verified successful deployment workflow [40215623954](https://github.com/smf113/isle-combat-atlas/actions/runs/40215623954).

## Approved boundaries

- Use official EVRIMA public branch 0.21.772 as the **last publicly identified release**, not a guarantee that all 22 dinosaur stats, mutation details or server settings are current.
- Default profile must make no ORIGIN-only assumptions; optional ORIGIN Main and Voice Chat profiles add only server-published features (such as 5× growth, storage, mod) and do not silently change combat coefficients.
- Existing qualitative solo/threat scores, adult masses, manual counter lists and fit/matchup formulas are site-authored September 2026 snapshot estimates. Preserve them transparently unless separately verified; do not imply official game values.
- Existing evidence registry is the single source for per-mutation, model and species provenance. Original September snapshot vs latest October 25 evidence review vs software release version remain distinct.
- Preserve historical mutation selections, shared eligibility, build/Entomb/matchup saved states and share links. Unknown server-specific mutation exceptions must remain unverified, not assumed.
- Record test evidence and documentation/version reconciliation before calling a release ready. [Workbench #49](https://github.com/smf113/Workbench/issues/49) owns the review register. Map and UI cleanup are future independent phases.

## Development checkpoint

State: active implementation branch; inherited v1.1.0 code is **not** introduced by this PR.
Current validation: existing v1.1.0 Pages CI passed; **new changes not yet validated** at session start.
Immediate next: implement profile resolver, official-first presentation, evidence applicability, documentation/version test guard; run Node + Chromium tests; review outstanding unknowns.
