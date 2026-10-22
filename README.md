# ORIGIN Evrima Combat & Build Lab

A responsive, **static** fan-made web app for [*The Isle: EVRIMA*](https://store.steampowered.com/app/376210/The_Isle/), tailored to ORIGIN server assumptions. Recovered from the user's final interactive prototype (September 2026).

## Features

- 22-dinosaur rankings, adult-matchup cards, solo ratings, and role details
- Recommended builds and growth areas
- Legal-mutation filtering by species, diet, sex, slot and Prime status
- Custom build scores (0–100), attribute splits, synergies, contextual bonuses, pros/cons
- Growth matchups at 25–100%, including Prime from 75%
- Expanded mutation glossary including situational options (Cannibalistic, Reniculate Kidneys etc.)
- Saves the current build **locally in the current browser**; **Copy shareable build link** transfers settings across devices

**Important:** This is a heuristic snapshot, not live match data, official game information or an ORIGIN integration. Scores are relative *role fit*, not win probability. See [methodology](site/methodology.html) and [data notes](docs/DATA_NOTES.md).

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
5. Your URL should be `https://smf113.github.io/isle-combat-atlas/` (substitute repo name). Check the GitHub Pages settings for the actual URL.

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