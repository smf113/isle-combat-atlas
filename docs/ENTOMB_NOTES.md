# Entomb lineage model (October 2026)

This is a **community-based simulator**, not a live game feed, save editor, or verified server backend integration. The ordinary Rankings/Custom Build scores are unchanged. The separate Entomb Planner models multiple lives and uses a relative role-fit heuristic to visualize composition; **a fit of 90 is not a 90% chance of winning a fight.**

## Rules modeled

- Life 1 is the original dinosaur. Entomb becomes available at 100% growth and starts another life of the **same species** (typically ~25% juvenile) with old mutations retained and empowered. Ordinary death ends lineage progression.
- Each life allows 3 normal choices or 4 if that particular life earned Prime. Prime eligibility and growth must be reacquired; Prime is not an account flag.
- After 3 successful Entombs, a fully Prime lineage can contain 4 + 4 + 4 + 4 = 16 distinct mutations. The planner supports Life 5 as an illustrative rollover: the oldest four-mutation cohort drops out, leaving the 12 previous slots plus new choices. Individual entries may be missing due to non-Prime generations or non-replicating mutations.
- Mutations are **not reselected** to make them stronger. The same mutation cannot be active twice. The effective level of each mutation depends on current lineage life, **not which generation first selected it**.
- The first Entomb increases documented effects to Life 2; the second increases them to Life 3; most documented values stop growing after that.
- Parthenogenesis and Sequential Hermaphroditism are modeled as **non-replicating** between Entombs. Community reports on this are sometimes inconsistent, so check in-game before relying on it. They are also not inherited through nesting, which is a separate process.
- A new mutation acquired in Life 3 starts at the Life 3 tier. A few effects have no documented tiers; the calculator retains their base strategic weight rather than fabricating multiplier values.
- The old source catalog still contains Traumatic Thrombosis, which community reference says was removed from new selections in patch 0.21.720. It is excluded from fresh Entomb Planner selections, but a historical/legacy entry may exist in old stored configurations. That caveat does not silently rewrite the original tool's presets.
- Cannibalistic is omitted for Deinosuchus and Ceratosaurus, per the source's already-cannibal baseline.
- Egg/nesting mutation inheritance is **not** simulated. It differs from Entombing (children are not given all 16 mutations), and the model starts without inherited egg mutations.

## Effect values and confidence

In `site/src/entomb-model.js`, `ENTOMB_TIERS` contains **mutation-specific** tier values drawn from Isla Sonora's Oct 2026 mutation reference. Most values are percentages. `Reabsorption` and `Social Behavior` are unlabeled internal values, not percentages. `tierEffect(name, generation)` returns `null` if there are no adequately grounded numeric values; it does not guess an increase. The strategy scoring ratios tier/base are **heuristic weights**, not exact simulations of combat formulas, risk, or damage multipliers; many effects are conditional, nonlinear, or qualitative. No numeric effects are applied to the original base ranking.

## Sources

- [Evrima Entomb mechanics, caps, and replacement](https://efg.io.vn/guides/entomb?lang=en) — updated Oct 14, 2026; community-derived 16-slot explanation.
- [Isla Sonora mutation descriptions and Life 1 / 2 / 3+ values](https://isla-sonora.com/docs/mutations?_locale=en) — current community/server reference; source may have server-specific restrictions.
- [The Isle community lineage observations](https://www.reddit.com/r/theisle/comments/1whcqrf/entombing_and_mutations_how_mutations_get/) — September 15, 2026; chart and discussion; not official confirmation.
- [The Isle: Ultimate Survival Guide on Steam](https://steamcommunity.com/sharedfiles/filedetails/?id=3440690332) — entomb rollover after fourth life, risk, and slot commentary.
- [Divergent community reports on non-replicating mutations](https://www.reddit.com/r/theisle/comments/1skeubh/how_does_parthenogenesis_interact_with_entombing/) — practical loss of Parthenogenesis after Entomb; [another thread](https://www.reddit.com/r/The_Isle/comments/1te6cur/entombment_mutations_question/) contains conflicting replies.

These sources are **not official live validation** of every public or unofficial server implementation. Recheck after game updates. The source dataset and current mutation availability may be stale; this planner is scoped to documenting the new life-cycle system without making unsupported blanket claims.