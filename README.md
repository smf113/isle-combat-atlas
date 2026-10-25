# EVRIMA Combat Atlas

A responsive, **static**, unofficial fan-made app for [*The Isle: EVRIMA*](https://store.steampowered.com/app/376210/The_Isle/). The **official public-branch profile** is the default; ORIGIN Main and ORIGIN Voice Chat are explicit optional overlays for server-published features. Its original combat model remains a September 2026 archival heuristic, not live official balance data.

## Entomb Planner (October 2026)

The **Entomb Planner** tab lets you model generations 1 through 5, individual Prime flags, 3 or 4 new picks per life, inherited mutation stacks (up to 16), documented Life 1/2/3+ effect tiers, lineage rollover, and mutation combinations. It provides separate lineage share links and can import an existing Custom Build. It does not change the ordinary rankings or pretend to predict exact PvP damage.

See [Entomb modeling notes](docs/ENTOMB_NOTES.md) for sourcing, caveats, mutation availability, and the scoring distinction.

## Features

- Selectable public EVRIMA baseline (last official patch identified 0.21.772) or optional ORIGIN server context; overlays do not silently change combat formulas
- 22-dinosaur *Atlas-estimated* rankings, adult-matchup cards, solo ratings, and role details
- Recommended builds and growth areas
- Legal-mutation filtering by species, diet, sex, slot and Prime status
- Custom build scores (0–100), attribute splits, synergies, contextual bonuses, pros/cons
- Growth matchups at 25–100%, including Prime from 75%
- Expanded mutation glossary including situational options (Cannibalistic, Reniculate Kidneys etc.)
- Saves the current build **locally in the current browser**; **Copy shareable build link** transfers settings across devices

**Important:** This is a heuristic snapshot, not live match data, verified game balance information or a connection to any game server. Scores are relative *role fit*, not win probability. See [methodology](site/methodology.html) and [data notes](docs/DATA_NOTES.md).

## Run locally

No build tools or npm dependencies are required. From the repository root:

```shell
python -m http.server 8000 --directory site
```

Then open http://localhost:8000. A simple file:// launch may block ES modules: use the local server.

## Publish to GitHub Pages

1. Create a new **public** repository named `isle-combat-atlas` (or another name). On free GitHub accounts, public repositories are the easiest Pages option.
2. Upload this repository's files, preserving `.github/workflows/pages.yml`, `site/`, `tests/` and `docs/`. Or use Git to commit the files to `main`.
3. Go to **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Go to **Actions**, find **Deploy static site to GitHub Pages**, and run it if it has not run on the initial push.
5. Your URL should be `https://YOURUSERNAME.github.io/isle-combat-atlas/` (substitute repo name). Check the GitHub Pages settings for the actual URL.

The provided workflow deploys **only `site/`** when changes land on `main`; it does not require a paid hosting service or any API keys.

## Iterate without rebuilding

- `site/src/data.js` → dinosaur stats, threat/favored lists, mutation catalog, presets, weight models.
- `site/src/app.js` → scoring/search, calculations and UI behaviors.
- `site/index.html` → app structure; `site/assets/styles.css` → responsive visuals.
- `site/methodology.html` and `docs/DATA_NOTES.md` → scoring rationale, provenance, limitations.
- `tests/verify-data.mjs` → dependency-free data validation with `npm test` (Node.js 20+).

Suggested change process: open a GitHub issue, branch, modify, run `npm test`, preview locally, open a PR, merge to `main`. GitHub Pages publishes the next version automatically. For roster/rule updates, add dated supporting links to the data notes.

## Roadmap

- Separate current vs historical ruleset/version data; source citations per row
- Expand verified mutation legality per species, rather than diet/slot generalizations
- Add export/import of saved builds as JSON and optional comparison mode
- Replace heuristic growth estimates when authoritative growth curves become available
- Optionally add per-user cloud sync later (requires a backend or authentication; not supplied by static GitHub Pages)

### Disclaimer

Unofficial fan project. Not affiliated with *The Isle*, Afterthought LLC, or ORIGIN. No remote account connection, in-game manipulation, tracking or data collection. Hosted content is public once published on GitHub Pages.

## 1v1 Matchup Calculator (October 2026)

The former **Growth Matchups** tab now opens a side-by-side **Matchup Calculator**. Both sides have independent species, growth, Prime eligibility, sex, and one of three mutation sources: unmutated baseline, manual single-life build, or imported Entomb lineage. Select **Import current Entomb Planner** to read the current saved lineage; paste another lineage's `#lineage=` share URL for the opponent. You can compare different generations, switch sides, and copy a URL storing the complete matchup. The older baseline growth ladder is still available in a collapsed section below the calculator.

A growth projection shows how Side A changes against the currently configured Side B. A new mutation chosen in the current life is counted only after its *approximate* acquisition stage (25/50/75/75%, with the 4th slot requiring Prime); inherited mutations are modeled available immediately after Entomb. An intended Prime selection does not grant its growth curve or fourth slot below 75% growth.

**Interpretation:** The pressure ratio and categorical assessment are experimental comparative heuristics, **not a win probability or measured game damage**. They use the existing snapshot's adult size, solo/threat rating, growth multipliers, and manually documented favorable/dangerous opponents. Only specific quantified, applicable mutation effects (Hemomania, Accelerated Prey Drive, Congenital Hypoalgesia) change this ratio. The tool shows bleed resistance and other mutations without inventing a universal offense/defense multiplier. Conditions such as bleeding and low health are explicit per-side inputs. Entomb Life 1/2/3+ values follow the existing `entomb-model.js` tiers. See [matchup model notes](docs/MATCHUP_NOTES.md).
### Matchup calculator defaults (October 2026)

The 1v1 calculator now places **A advantage on the left** and **B advantage on the right** in the result spectrum and growth ladder. Both dinosaurs start with a role-specific, legal 3-slot **recommended standard mutation build**, with Prime enabling a fourth suggested slot; use **Customize build** to edit each side independently. Unmutated and separate Entomb lineage sources remain available. The score is still a heuristic, not a win-rate prediction. See [matchup notes](docs/MATCHUP_NOTES.md).

### Matchup UI/state remediation (October 2026)

- Non-lineage Prime remains visible across standard, custom and unmutated sources. **Intended** Prime is distinct from **active** Prime: the growth bonus and new fourth slot do not apply below **75%**; the selection is retained while switching sources. Lineage Prime is taken from the selected life.
- A/B import buttons copy the currently displayed Entomb Planner snapshot, including changes from a shared `#lineage=` URL or subsequent hash changes. Import never edits the planner or the other contestant.
- Custom dropdowns prevent duplicate selections, while restored invalid/duplicate mutation slots are plainly identified and omitted from the model. No auto-correction is made to a user's saved selections without notice.
- The A-growth-vs-fixed-B progression adds a **50%** row without removing existing steps; the original A-left/B-right markers and relative-pressure formula remain unchanged.
- Node tests (`npm test`) include pure state checks and controller-level DOM/event harnesses. A full interactive Chromium visual check is a separate optional validation step.

See [matchup notes](docs/MATCHUP_NOTES.md) for assumptions and constraints.

## Version and changelog

**Current release: v1.2.0** — October 25, 2026. Version 1.0.1 was the first documented release. The footer links to [the changelog](site/changelog.html). The gameplay-data research snapshot remains September 2026; the release is not a game-data refresh. Earlier changes were commits, not numbered releases.

For later releases: reconcile `package.json`, the footer label in `site/index.html`, the software-version field in `site/sources.html`, this README's **Current release** label, and the latest `site/changelog.html` heading. Do not change the original data snapshot or latest evidence review dates without a substantive corresponding review. Run `npm test` (reads version dynamically from package.json) and `python tests/browser_smoke.py` (real Playwright Chromium checks with deliberate negative controls), then open a PR and merge only when GitHub Actions passes. Browser screenshots are uploaded as CI artifacts for inspection. The browser smoke only checks 390px narrow-screen geometry, not every mobile device.

### Fight-condition behavior (October 25, 2026)

Fight circumstance checkboxes do not impose generic injury penalties on the ratio. Instead, **B bleeding** triggers A's active Hemomania and **A bleeding** triggers B's; **B below 35% health** triggers A's active Accelerated Prey Drive and **A below 35% health** triggers B's. When the relevant mutation is absent or not active, the checkbox is stored but the relative pressure index remains unchanged. The calculator displays an explanation for each selected condition; new Node and real Chromium tests check this. This is a UI clarity and validation release, not a gameplay-data or formula update.

## Source accuracy and evidence review — October 25, 2026 (v1.1.0)

Visit [Sources & Methodology](site/sources.html) for searchable per-mutation evidence, source type, publication and review dates, unresolved applicability, historic removals, and a traceable model walkthrough. Original gameplay snapshot remains **September 2026**; latest evidence review is **October 25, 2026**. This is not a claimed ORIGIN server content refresh.

Official 0.21.720 removes Traumatic Thrombosis from new choices. Its historical identifier remains loadable but is excluded from the legacy Custom Build, Entomb and matchup scores. Eligibility now uses a shared explicit slot/diet/sex/availability rule for all consumers; Gastronomic Regeneration, Hypermetabolic Inanition and Tactile Endurance are community-supported in slots 2 and 4; no blanket slot-4 unlock extension. All role presets that referenced removed content have legal alternatives. Eligibility and scoring candidate pools may change build-fit scores, even though the formula and author-created coefficients were not recalibrated.

Do not infer that mutation percentage citations validate combat ratings. Species mass, 1–5 solo/threat, favored/danger lists, interpolation, counter coefficients, multiplicative stacking and victory categories are authored heuristics. The current model Prime peak at 87% differs from a community elder reference's 87.5%; the normal curve still rises to 100% contrary to a reported late decline. Applicability not established; no curve change in this release. Consult in-game state before relying on unlock counts or ORIGIN-specific exceptions.

For subsequent releases, update version-bearing surfaces **together**: `package.json`, footer version in `site/index.html`, latest entry in `site/changelog.html`, this README release marker and `site/sources.html` software version. The regression suite checks those surfaces. Do not modify `evidence.js` snapshot or review dates without a genuine underlying data or evidence review. Track per-release documentation and validation review in [Workbench #49](https://github.com/smf113/Workbench/issues/49).
