# Evidence / version notes

## Origin of data

The user supplied a complete exported conversation (`Branch · Find Omniraptor Codes`, 52 messages). The latest AppBlock in the September 27, 2026 reply, titled **ORIGIN Evrima Rankings & Build Lab**, is the canonical source snapshot for this initial conversion.

The data and logic in `site/src/data.js` and the initial calculations in `site/src/app.js` are extracted from that version. No authoritative game mechanics database was provided. The original narrative referenced public branch `0.21.772`, 22 playables, ORIGIN 5× growth, and several mutations. **These are dated historical claims, not independently revalidated by this migration.**

## Interpretation

- Scores are subjective/heuristic estimates, not measured win rates.
- `solo` and `threat` ratings are original qualitative 1–5 inputs. Derived solo score is `solo*14 + threat*6`.
- Mutation attribute values, build archetypes, synergies, unlock fields and circumstances are inherited from the original prototype. They must be reviewed against patch notes before describing them as current.
- Growth maturity, adult-power and matchup thresholds are derived heuristics and should be treated as experimental.
- The normalized build score compares against **top 14 per slot** candidate combinations for performance, not the mathematically global maximum.
- `prime` is modeled as eligible from 75% with a fourth mutation slot.
- Server-specific site features are not integrated; this site is an offline/static guide.

## Update protocol

1. Record game/server patch date and evidence links here before adjusting key claims.
2. Update `site/src/data.js` and `site/methodology.html` in the same PR when scoring assumptions change.
3. Run `npm test` and browser smoke tests.
4. Mark any unavailable/unverified feature as `unknown` rather than silently asserting it works.

## Historical reference

The initial tool was authored from Sept 26–27, 2026, with user-requested iterations covering solo ranking, ORIGIN growth, recommended mutation builds, normalized custom scores, Prime toggle, 25–100% growth chart, and situational mutation choices.

## Evidence-bound mutation reconciliation — October 25, 2026

See `site/src/evidence.js` and `site/sources.html`. September 2026 source-data snapshot is still the originating baseline; review date is separate. A 42-entry catalog does not prove ORIGIN exhaustive coverage (41 matches in one current community list plus historic Traumatic Thrombosis). Official public patch 0.21.720 removed Traumatic Thrombosis for future reintegration. The entry is intentionally retained as historical data, excluded from any new selection or scoring; the removed bleed synergy has also been dropped. Unsupported Hordetest-only Pit Organ, Paratrepsis and Cochlear Sensitivity and removed Intraspecific Aggression are not enabled.

Gastronomic Regeneration, Hypermetabolic Inanition and Tactile Endurance now explicitly allow slots [2,4] based on community sources; do not expand every slot-2 unlockable to slot 4. The other explicit slot restrictions are conservative. Diet/omnivore rules, unlock counts, inheritance details and server overrides remain uncertain. All consumers use `eligibleMutation`/`availabilityReason` in `data.js`; build-fit candidate sets can change. This does not validate site-assigned role/rank scores.

## Official-first context and release evidence — October 25, 2026

The site now defaults to an **official EVRIMA public-branch context**. The latest identified public update is 0.21.772, announced August 4, 2026 (official announcement: https://steamcommunity.com/ogg/376210/announcements/detail/717912016810936297). This establishes the published patch and select features, **not** an official validation of the site's 22 species masses, ratings, matchup estimates, Prime curves or all 42 mutation effects. The underlying 2026-09 source-data snapshot remains archived as site-authored heuristics.

Optional ORIGIN Main and ORIGIN Voice Chat profiles represent published features (https://playorigin.gg/), including 5× growth and custom server tools. Neither exact mutation/combat overrides nor the current server's patch parity has been independently verified, so switching the profile does **not** alter model formulas, legal mutation lists or damage ratios. The user-facing text and linked evidence make this limitation explicit. Share links preserve selected profile context with the optional `?server=` query parameter; existing local snapshot and hash formats remain unchanged.

The separate review date in `site/src/evidence.js` is October 25, 2026, not a renewal of the September data snapshot. Before release, reconcile the versioned package, footer, Sources page, README, and changelog as specified in [Workbench issue #49](https://github.com/smf113/Workbench/issues/49). Update `evidence.js` dates only for real evidence reviews.
