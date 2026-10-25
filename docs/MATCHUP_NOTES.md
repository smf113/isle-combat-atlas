# Side-by-side matchups: evidence, model, limitations (October 2026)

**Scope:** Compare two configured dinosaurs, including Entomb lineages, rather than assume both are healthy unmutated adults. Neither this app nor GitHub Pages accesses the actual in-game server, health, statuses, combat damage formulas, or hidden species-specific curves. **A numeric index is not a win probability.** Treat it as a discussion aid and broad strategy categorization.

## Calculator defaults and visual direction

- Both contestants initially use **Recommended standard build**, a single-life set of three role-based mutations at adult growth; checking Prime enables a fourth.
- Recommendations start from the existing archetype presets, retaining valid slot choices. Previously flagged unavailable/invalid picks (e.g. Traumatic Thrombosis) are substituted with legal, unique role-weighted options. The standard recommendations are advisory, not server-granted mutations; real unlock requirements still apply.
- **Customize build** copies the recommended picks into editable single-life slots. **Unmutated baseline** and **Entomb lineage** remain alternate sources. A new `v2` browser save key migrates existing user-customized `v1` builds while upgrading untouched initial comparisons to standard defaults. Shared `#matchup=` snapshots remain version 1 for compatibility.
- Both the main assessment and growth progression spectrum are ordered **A advantage | even | B advantage** (left to right). A÷B index above 1 therefore moves the marker LEFT of center. The growth visualization uses position markers, not a misleading filled progress bar.

## Calculation

- **Power baseline:** Preserves the existing atlas heuristic: `16 + log2(adult kg + 20)*8 + threat*11 + solo*2`, adjusted by the existing piecewise growth/Prime maturity curve.
- **Matchup evidence:** Existing species-specific favorable and dangerous lists contribute symmetric adjustment factors, now applied separately to both contestants (1.12 for a listed favorable matchup; 0.86 for a listed danger). Those coefficients are assumptions, not official game constants.
- **Conditional direct effects:** `Hemomania` boosts offensive pressure only if the *opponent* is already bleeding (Life 1/2/3+ = 5/7/10%); `Accelerated Prey Drive` only if the opponent is already below 35% health (10/15/20%); `Congenital Hypoalgesia` reduces incoming raw-pressure only when the opponent belongs to an adult-size-larger species (15/20/25%). Offense bonuses multiply; defense mitigates the opposing side's pressure. These are the only mutations used in the numeric ratio. Two mutations that apply simultaneously multiply; the model does not validate in-game multiplicative stacking behavior. The ratio is a *relative heuristic* so its absolute result cannot be interpreted as damage dealt or health remaining.
- **Other relevant mutations:** `Epidermal Fibrosis` tier bleed resistance (15/20/25%) appears explicitly but **not** in the generic power ratio: bleed is a different damage channel and the amount/weight of bleeding in each attack sequence is not known. Unquantified fracture, venom, mobility, regeneration, stamina, dietary and environmental effects are shown (where tagged) but not treated as universal combat multipliers. Quantifying those requires species/attack-specific validated data.
- **Growth and Prime:** User sets growth (25–100%) independently. Prime is life-specific, not automatically inherited. Current-life slot selection appears at *approximate* growth 25%/50%/75%/75%, with the fourth requiring Prime. Inherited Entomb mutations are available at 25% juvenile. Future slots display as pending. The exact stage thresholds can vary across game versions.
- **Generation:** `activeAt()` from the Entomb Planner resolves inherited and current-life mutation picks, excludes non-replicators and duplicates, and rotates oldest slots after four cohorts. Tier effects scale by *current* Life 1/2/3+, not their originally selected life. Comparisons can load two different lineage snapshots; no planner data is modified by import.
- **1v1 assumption:** Equal skill, no extra teammates, and healthy at baseline unless the user marks health/bleeding. Real fight outcomes also depend on attacks, hitboxes, terrain, stamina, poison, bleed, previous damage, and species-specific growth; these are **not measured**.

## References

- Existing repository's Sep 2026 snapshot and [data notes](DATA_NOTES.md).
- Existing [Entomb evidence and assumptions](ENTOMB_NOTES.md).
- [Community September 2026 Entomb observations](https://www.reddit.com/r/theisle/comments/1whcqrf/entombing_and_mutations_how_mutations_get/) — inherited perks, new picks at current generation tier, 16 limit.
- [Mutation list with Life 1/2/3 values](https://isla-sonora.com/docs/mutations?_locale=en) — community reference, may differ by server or patch.
- [The Isle mutation guide](https://www.theisle.info/guide/mutations) — mutation conditions and values (May 2026).

**Interpretation safeguard:** New rankings should not be presented as authoritative combat outcomes. We deliberately do not use Entomb role-fit scores as combat multipliers, and do not grant every mutation an arbitrary damage/health boost.
### Focused October 2026 state corrections

- The Prime checkbox remains visible in **all non-lineage sources**, including unmutated baseline. Prime is only *active* at or above 75% growth, but remains selected while changing mutation sources. An Entomb life uses that life's own Prime flag.
- "Import current Entomb Planner" copies a detached snapshot from the in-memory planner state, including restored initial `#lineage=` URLs and subsequent hash changes. It does **not** trust a potentially stale local-storage cache and does not modify the planner or the other matchup side.
- Editing custom mutations excludes already selected names from other dropdowns. Invalid shared or previously saved selections remain visible by name in a warning and do **not** count towards scoring. The model continues to validate duplicates and eligibility independently of the interface.
- The A-versus-fixed-B growth progression adds **50%** alongside all existing rows, displaying the approximate second-slot unlock. No score calibration was changed.

## Evidence transparency — October 25, 2026

The [Sources & Methodology page](../site/sources.html) documents exact implemented matchup coefficients, subjective species data, conditional mutation sources, multiplicative modeling and the separate older ladder. The snapshot remains September 2026, not the review date. Favorable/danger modifiers (1.12/0.86), Prime and growth curves, adult-power terms, favored threshold 1.2, clamp and logarithmic marker mapping are assumptions, not game data. Current Prime peak at 87% differs from a community 87.5% guide and normal growth-to-100% conflicts with a reported frail decline. Both await applicability verification and remain unchanged.
