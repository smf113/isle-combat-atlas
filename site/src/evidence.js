/** Evidence registry for the October 25, 2026 audit.
 * Every record is attribution metadata, not a claim of in-game ORIGIN verification.
 * Mutation definitions and heuristic dimensions remain in data.js; never duplicate that catalog.
 */
import {mutations,dinos,removedMutations} from './data.js';
import {ENTOMB_TIERS} from './entomb-model.js';
export const snapshotDate='September 2026';
export const reviewDate='October 25, 2026';
export const branchScope='The Isle EVRIMA public branch; latest publicly confirmed patch in this review: 0.21.772 (August 4, 2026). Server-specific overrides and patch parity remain unverified.';
export const slug=name=>'mutation-'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const sources={
 official772:{title:'Patch 0.21.772 is now available!',publisher:'Afterthought Studios / The Isle',type:'Official patch announcement',date:'August 4, 2026',access:reviewDate,url:'https://steamcommunity.com/ogg/376210/announcements/detail/717912016810936297',scope:'EVRIMA Public Branch 0.21.772, not custom-server configuration',claim:'0.21.772 is a published public-branch patch; includes Austroraptor and changes to playable physics. Does not establish mutation percentages or model-derived combat values.',status:'official'},
 official720:{title:'Patch 0.21.720 Now Available!',publisher:'Afterthought Studios / The Isle',type:'Official patch announcement',date:'July 3, 2026',access:reviewDate,url:'https://steamcommunity.com/games/TheIsle/announcements/detail/679628250084806361',scope:'EVRIMA public branch 0.21.720',claim:'Traumatic Thrombosis removed for future reintegration',status:'official'},
 officialEntomb:{title:'Patch 0.21.321 — Entomb introduction',publisher:'Afterthought Studios / The Isle',type:'Official patch announcement',date:'December 23, 2025',access:reviewDate,url:'https://steamcommunity.com/games/TheIsle/announcements/detail/507348444540569207',scope:'Public branch; Steam detail only partially retrievable here',claim:'Entomb feature introduction; full article text not independently retrieved',status:'unverified'},
 quick:{title:'Evrima Quick Guide — Mutations',publisher:'Evrima Quick Guide',type:'Community guide',date:'Undated; site warns information may be outdated',access:reviewDate,url:'https://www.evrimaquickguide.com/gameplay/health-statuses/mutations',scope:'Community description; not ORIGIN-verified',claim:'Mutation categories, several slot constraints, life tiers and nesting distinction',status:'community-reported'},
 elder:{title:'Evrima Quick Guide — Elder System',publisher:'Evrima Quick Guide',type:'Community guide',date:'Undated',access:reviewDate,url:'https://www.evrimaquickguide.com/gameplay/elder-system',scope:'Community description; branch/time applicability uncertain',claim:'Reports Prime peak at 87.5% and frail decline after 87.5%',status:'community-reported'},
 isla:{title:'Isla Sonora — Mutation list',publisher:'Isla Sonora',type:'Community/server reference',date:'Undated; live page',access:reviewDate,url:'https://isla-sonora.com/docs/mutations?_locale=en',scope:'Isla Sonora reference, not ORIGIN configuration',claim:'Current mutation descriptions, effect tiers, 2/4 selections and removed content',status:'community-reported'},
 isleinfo:{title:'The Isle Info — Mutations explained',publisher:'The Isle Info / Jurassic Isle of Exo',type:'Community guide',date:'May 28, 2026',access:reviewDate,url:'https://www.theisle.info/guide/mutations',scope:'Older guide; predates 0.21.720 removal',claim:'Historical slot and unlock requirements; Hordetest-only content is not production proof',status:'community-reported'},
 efg:{title:'EFG — Entomb retention and full slots',publisher:'EFG',type:'Community/editorial guide',date:'Published Sep 9, updated Oct 14, 2026',access:reviewDate,url:'https://efg.io.vn/guides/entomb?lang=en',scope:'Community interpretation, not server telemetry',claim:'100% Entomb, inherited cohorts up to 16, rollover and nesting distinction',status:'community-reported'},
 origin:{title:'ORIGIN — Official server website',publisher:'ORIGIN',type:'Server-published',date:'Undated; live page',access:reviewDate,url:'https://playorigin.gg/',scope:'ORIGIN server features only, not exact mutation and damage rules',claim:'Publishes custom mod, growth, storage, mutation and Prime features',status:'server-published'},
 snapshot:{title:'ORIGIN Combat & Build Lab — Original research snapshot',publisher:'Site authors',type:'Model assumption / archival snapshot',date:snapshotDate,access:reviewDate,url:'./methodology.html',scope:'Local model inputs, not direct game observations',claim:'Species masses, role ratings, counter lists, curves, weights and formulas are site-authored assumptions',status:'model-assumption'}
};
const ambiguousSlots=new Set(['Augmented Tapetum','Heightened Ghrelin','Parthenogenesis','Prolific Reproduction']);
const dietConflict=new Set(['Barometric Sensitivity','Hypervigilance','Photosynthetic Regeneration','Truculency','Xerocole Adaptation','Tactile Endurance']);
const duplicateProof=new Set(['Gastronomic Regeneration','Hypermetabolic Inanition','Tactile Endurance','Cannibalistic']);
export const mutationEvidence=mutations.map(m=>{
  const removed=removedMutations.has(m.n),unlocked=m.cat==='Unlockable';
  let status=removed?'official':dietConflict.has(m.n)?'disputed':'community-reported';
  return {
    id:slug(m.n),name:m.n,status,slot:m.slots.join(', '),diet:m.diet,sex:m.sex,
    references:removed?['official720','isla']:duplicateProof.has(m.n)?['quick','isla','isleinfo']:unlocked?['isla','isleinfo']:['isla','quick','isleinfo'],
    claim:removed?'Removed in 0.21.720; preserved in old saves but excluded from new builds':
      `Catalog records: ${m.effect} Allowed new-selection slots: ${m.slots.join(', ')}; diet ${m.diet}; sex ${m.sex}.`,
    tier:ENTOMB_TIERS[m.n]||null,
    caveat:removed?'Legacy selections must not gain build-fit or combat value.':
      dietConflict.has(m.n)?'Herbivore versus omnivore application is reported differently; no ORIGIN-specific proof. Conservative current restriction retained.':
      ambiguousSlots.has(m.n)?'No supported blanket slot-4 unlock for this mutation; slot 2 retained.':
      unlocked?'Exact unlock count/duration may change; not validated for ORIGIN. Consult the current in-game menu.':
      'Community effect and slot data may lag public builds or be overridden on ORIGIN.'
  };
});
export const modelEvidence=[
 {id:'public-patch',label:'Public-branch release scope',expression:'EVRIMA Public Branch patch 0.21.772 (August 2026)',status:'official',refs:['official772'],description:'This patch was officially announced. It does not verify every catalog mutation, estimated dinosaur mass or PvP formula at this patch level.'},
 {id:'ranking',label:'Solo ranking',expression:'14 × solo + 6 × threat',status:'model-assumption',refs:['snapshot'],description:'1–5 solo and threat ratings are authored judgments, not measured win rates.'},
 {id:'adult-power',label:'Adult combat pressure',expression:'16 + 8 × log₂(kg + 20) + 11 × threat + 2 × solo',status:'model-assumption',refs:['snapshot'],description:'Reference masses (kg), solo and threat scores come from data.js; not verified health or attack-damage telemetry.'},
 {id:'species-inputs',label:'Species data',expression:'22 rows: kg, solo, threat, favored and danger lists',status:'model-assumption',refs:['snapshot'],description:'Each listed species mass and preferred/opponent matchup is an estimate. Source-specific data are not game telemetry.'},
 {id:'growth',label:'Normal maturity curve',expression:'(25,.15), (35,.24), (45,.36), (55,.50), (65,.67), (75,.82), (87,.94), (100,1.00); linear interpolation',status:'disputed',refs:['snapshot','elder'],description:'Site curve rises through 100%, although the community guide reports post-87.5% frail decline. Do not treat this as a validated in-game growth curve.'},
 {id:'prime',label:'Prime maturity curve',expression:'At growth ≥75%: (75,.90), (87,1.08), (100,1.02); linear interpolation',status:'disputed',refs:['snapshot','elder'],description:'Site Prime peak at 87% differs from community guide peak of 87.5%. Applicability unresolved, so the curve is unchanged.'},
 {id:'counter',label:'Directional species matchup multipliers',expression:'×1.12 when favored; ×0.86 when danger; independently for A and B',status:'model-assumption',refs:['snapshot'],description:'Qualitative counter lists in data.js are authored classifications. Not source-validated damage bonuses.'},
 {id:'conditional',label:'Conditional mutation effects',expression:'Hemomania +5/7/10% if opponent bleeding; Accelerated Prey Drive +10/15/20% if opponent below 35% health; Congenital Hypoalgesia 15/20/25% incoming damage reduction vs larger adult-species mass',status:'community-reported',refs:['quick','isla'],description:'Individual percentages have community citations; this does not validate a full-matchup prediction. Conditions alone apply no generic HP penalty.'},
 {id:'stacking',label:'Combining modeled direct effects',expression:'A/B = ((powerA × counterA) / (powerB × counterB)) × ((offenseA × (1 − mitigationB)) / (offenseB × (1 − mitigationA)))',status:'model-assumption',refs:['snapshot','quick'],description:'Multiplicative stacking and the use of adult species mass for defense eligibility are site-authored, not verified combat rules.'},
 {id:'threshold',label:'Favor categories and output clamp',expression:'A favored ≥1.20; B favored ≤1/1.20; otherwise competitive. Ratio clamped to [0.01, 100]',status:'model-assumption',refs:['snapshot'],description:'Interpretive thresholds; not victory odds.'},
 {id:'marker',label:'A-left / B-right visual marker',expression:'position = clamp(50 − 24 × ln(max(.01, ratio)), 8, 92)%',status:'model-assumption',refs:['snapshot'],description:'Visual position maps a heuristic ratio. It is not a measured probability.'},
 {id:'fit',label:'Build-fit and Entomb fit',expression:'0–5 hand-assigned attributes, role weights, context ×.22, named synergies; bounded top-14-per-slot search; normalized 0–100. Entomb tiers change role-fit heuristically.',status:'model-assumption',refs:['snapshot','efg'],description:'Eligibility corrections change candidate pools and can change fit scores. No numeric game benefit is implied by site-assigned weights.'},
 {id:'legacy',label:'Older growth ladder (separate)',expression:'×1.16 favorable / ×.80 danger; favored ≥1.08, even ≥.88, otherwise avoid; same-growth or adult reference',status:'model-assumption',refs:['snapshot'],description:'Legacy Build & Growth view has different heuristic thresholds from the newer 1v1 calculator; do not conflate their outputs.'},
 {id:'entomb',label:'Entomb and nesting',expression:'100% Entomb; up to 16 slots in community examples; nonreplicating exclusions, cohort rollover and tier cap at Life 3+',status:'community-reported',refs:['efg','quick','officialEntomb'],description:'Entomb retained cohorts are not nesting inheritance. Precise server-specific storage/mod settings remain unverified.'},
 {id:'unlock',label:'Unlock and availability',expression:'Only explicit catalog slots; exact unlock tasks are advisory, not simulated',status:'disputed',refs:['isleinfo','isla','official720'],description:'Hordetest-only mutations are excluded; not every unlockable in slot 2 may be chosen in slot 4.'}
];
export const speciesEvidence=dinos.map(d=>({name:d.n,kg:d.kg,solo:d.solo,threat:d.threat,fav:d.fav,danger:d.danger,source:'snapshot'}));
