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
