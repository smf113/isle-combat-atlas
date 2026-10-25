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

## Development checkpoint — October 25, 2026

State: active implementation **draft PR #6**, built on the inherited v1.1.0 baseline already on `main`. Proposed application version **v1.2.0**, not a released/default-branch version.

Implemented on branch:
- Official EVRIMA public branch is the default in header, rankings and growth framing. ORIGIN Main and ORIGIN Voice Chat are optional, explicitly sourced server-profile overlays without invented damage or mutation overrides.
- Profile choice is browser-persistent; new share links carry `?server=` while existing `#build=`, `#lineage=` and `#matchup=` payload formats remain unchanged.
- Evidence registry includes sourced 0.21.772 public patch; Sources page displays selected profile and per-mutation uncertainty. Original September snapshot and October 25 evidence-review dates are intentionally distinct.
- App/changelog/README/methodology/data notes updated; tests enforce matching package/footer/changelog/Sources/README versions, including deliberate negative cases. Remaining misleading ORIGIN-only copy was reconciled.

Validation evidence and limits:
- Previous v1.1.0 Pages run [40215623954](https://github.com/smf113/isle-combat-atlas/actions/runs/40215623954): **passed on `main` before this session**.
- New Node test suite succeeded in workflow [40226185615](https://github.com/smf113/isle-combat-atlas/actions/runs/40226185615); that run's Chromium stage did **not complete**, due to an automatic cancellation triggered by subsequent commits during slow system dependency installation.
- **Branch head `f84c0b0aa49d5ffe358e2efc716d2d36abb9581a` passed CI** in [run 40226564880](https://github.com/smf113/isle-combat-atlas/actions/runs/40226564880): 57/57 Node tests, Chromium browser smoke, 390px viewport geometry, source navigation and historical save/lineage checks. New profile-switch tests passed in that real Chromium run.
- This checkpoint-only update has a newer head and will also require current-head CI confirmation before PR review. Browser-based validation on mobile Safari and user environment is **still unverified**; do not equate headless 390px Chromium with iOS acceptance.
- No independent live-game validation of 22 historical masses, role scores, individual mutation effects, Prime curve or ORIGIN combat overrides. Those remain explicitly documented as estimated/unverified.

## Live-first validation preference and blocked direct deployment

On October 25, 2026 the user declined local site setup and approved **reviewing the deployed production GitHub Pages site**, with a separate development site reserved as a possible future workflow change. This did **not** expressly authorize merging PR #6.

A temporary branch-push Pages trigger was tried without merging. The branch [push run 40227364840](https://github.com/smf113/isle-combat-atlas/actions/runs/40227364840) passed Node and Chromium verification, but the `github-pages` deployment job failed before any steps ran. The connector reported no available deployment job log, so the exact reason is not established; environment branch restrictions are a plausible explanation, not verified fact. **No successful v1.2.0 live deployment resulted from this attempt.**

The temporary workflow push trigger and concurrency changes were **reverted** so this PR does not permanently alter the standard `main`-only deployment workflow. The existing v1.1.0 production release is the last verified successful deployment. Review the final PR diff and CI before any merge.

Next: user reviews [PR #6](https://github.com/smf113/isle-combat-atlas/pull/6) and **explicitly authorizes merge of its current head** if they want the current Pages pipeline to publish v1.2.0. After an authorized merge, verify `main`, deployment workflow success and available production evidence, then user reviews the live site on desktop/iOS; record issues for correction in a new branch if needed. No local checkout is required. Map and UI cleanup remain later phases.
