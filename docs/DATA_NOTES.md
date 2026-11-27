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

## Public branch 0.22.159 — November 27, 2026

Latest published announcement: [0.22.159](https://store.steampowered.com/news/app/376210/view/672886805331182174), November 26. [0.22.157](https://store.steampowered.com/news/app/376210/view/672886171588625748), November 24, added Oviraptor, per-species Entomb storage and preservation of parental mutation levels. Full announcement text reviewed via [SteamDB 0.22.159](https://steamdb.info/patchnotes/26937194/) and [0.22.157](https://steamdb.info/patchnotes/26883519/). Oviraptor is a 23rd roster record, not a 23rd scored species: no mass, rating, role coefficients, counter lists or mutation numbers borrowed. Its diet class is community-reported by Isla Sonora, and official egg mechanics are described on the roster.

### Eligibility audit (public patch reference 0.22.159; reviewed November 27)
[Isla Sonora](https://isla-sonora.com/docs/mutations?_locale=en) names 11 carnivores, nine herbivores and three omnivores in its diet categories; [Evrima Quick Guide](https://www.evrimaquickguide.com/gameplay/health-statuses/mutations) is community-authored, last updated September 4, and warns of outdated material. Neither gives a build-stamped menu for Official or ORIGIN. `catalogAudit(profile)` enumerates every species × mutation with status, build reference, server context, sources, sex, slots, unlock and inheritance notes. Reported means existing model availability, not confirmed game availability. Model-excluded means conservative exclusion, not verified absence.

| Species | Barometric Sensitivity | Hypervigilance | Photosynthetic Regeneration | Tactile Endurance | Truculency | Xerocole Adaptation |
|---|---|---|---|---|---|---|
| Gallimimus | Unverified | Unverified | Unverified | Unverified (2/4) | Unverified | Unverified |
| Beipiaosaurus | Unverified | Unverified | Unverified | Unverified (2/4) | Unverified | Unverified |
| Oviraptor | Unverified | Unverified | Unverified | Unverified (2/4) | Unverified | Unverified |

For each cell Sonora reports eligibility and Quick Guide restricts the category to herbivores. No menu or developer statement establishes the specific assignments. The existing conservative exclusions remain; the disputed rows are now visible in species mode. All other Oviraptor assignments are unverified; none is selectable. Other species remain the archived community-rule model, including the Cannibalistic exception for Deinosuchus and Ceratosaurus, female-only selections, non-replicators and explicit restricted slots. No generalized new unlock, carnivore or omnivore exception is inferred. A catalog-wide comparison against both guides found the historic Intraspecific Aggression listing in Quick Guide; it is restored as reference only, with unknown former slot and values. No NHJ player entry: the patch note describes an AI bug, not player menu evidence. Xerocole Adaptation and Hematophagy have a developer value-fix note but no numbers, so existing historical tiers/fit inputs are retained and labeled not verified for 0.22.159.

### Evidence needed
For every species, capture version/build, Official server identity, sex, growth/Prime state, full menus for slots 1–4 (including locked/absent choices, after unlock tasks), fresh versus Entomb/nested life and tier tooltip. Repeat independently on ORIGIN Main and Voice Chat; record server version/mod and any changed restrictions. For inheritance, capture both parents' names, slots and levels plus hatchling inherited pool after the fix, including conflicting levels for the same mutation. For Oviraptor, verify diet, mass, combat stats, growth and all menu eligibility before enabling calculators. Do not interpret missing menu evidence as a negative observation.
