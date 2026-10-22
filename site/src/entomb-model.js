/** Lineage simulation, separate from the baseline single-life ranking model.
 * Sources and cautions: docs/ENTOMB_NOTES.md. All scores are heuristic.
 */
import {mutations,weights,synergies,dims} from './data.js';
export const MAX_MUTATIONS=16;
export const MAX_GENERATION=5; // Gen 5 demonstrates 12 retained + 4 new, oldest cohort rotates out.
export const NON_REPLICATING=new Set(['Parthenogenesis','Sequential Hermaphroditism']);
export const UNAVAILABLE=new Set(['Traumatic Thrombosis']);
/** Explicit, observed per-life effects: Life 3+ values stop increasing. No assumed multiplier otherwise. */
export const ENTOMB_TIERS={
  'Accelerated Prey Drive':[10,15,20],
  'Cellular Regeneration':[15,20,25],
  'Congenital Hypoalgesia':[15,20,25],
  'Efficient Digestion':[20,25,30],
  'Epidermal Fibrosis':[15,20,25],
  'Gastronomic Regeneration':[5,10,15],
  'Hydrodynamic':[15,20,25],
  'Hydro-regenerative':[25,50,75],
  'Increased Inspiratory Capacity':[15,20,25],
  'Infrasound Communication':[50,60,70],
  'Nocturnal':[5,7,10],
  'Osteosclerosis':[20,25,30],
  'Photosynthetic Tissue':[5,7,10],
  'Reabsorption':[1,2,3], // raw in-game value; not a percentage
  'Submerged Optical Retention':[5,10,20],
  'Sustained Hydration':[20,25,30],
  'Wader':[25,50,75],
  'Hematophagy':[15,25,35],
  'Hemomania':[5,7,10],
  'Hypermetabolic Inanition':[15,20,25],
  'Hypervigilance':[50,60,70],
  'Social Behavior':[1.5,2,3], // raw in-game value
  'Tactile Endurance':[25,35,50],
  'Truculency':[5,10,15],
  'Xerocole Adaptation':[15,20,25],
  'Enhanced Digestion':[10,15,25],
  'Heightened Ghrelin':[25,50,75],
  'Multichambered Lungs':[5,10,15],
  'Reinforced Tendons':[25,35,50]
};
export const RAW_TIERS=new Set(['Reabsorption','Social Behavior']);
export const byName=name=>mutations.find(m=>m.n===name);
export const blankLife=(prime=false)=>({prime,picks:['','','','']});
export const emptyLineage=()=>Array.from({length:MAX_GENERATION},()=>blankLife());
export const normalizeGeneration=n=>Math.min(MAX_GENERATION,Math.max(1,Math.trunc(Number(n)||1)));
export function eligible(m,d,sex,slot){
  if(!m||!d||UNAVAILABLE.has(m.n))return false;
  const slots=(m.slots.includes(slot)||(slot===4 && m.slots.includes(2) && (m.cat==='Slot 2'||m.cat==='Unlockable')));
  // Certain unlocks occupy both slots 2 & 4 in current reference; not every [2] mutation does.
  const slotOK=slots && !(slot===4&&['Enhanced Digestion','Multichambered Lungs','Reniculate Kidneys'].includes(m.n));
  const dietOK=m.diet==='Any'||m.diet===d.diet||(m.diet==='Herbivore/Omnivore'&&['Herbivore','Omnivore'].includes(d.diet));
  if(m.n==='Cannibalistic'&&['Deinosuchus','Ceratosaurus'].includes(d.n))return false;
  return slotOK && dietOK && (m.sex==='Any'||m.sex===sex);
}
export function tierEffect(name,generation){
  const a=ENTOMB_TIERS[name];if(!a)return null;
  const tier=Math.min(3,normalizeGeneration(generation));
  return {value:a[tier-1],base:a[0],label:`${a[tier-1]}${RAW_TIERS.has(name)?' (game value)':'%'}`,ratio:a[tier-1]/a[0],tier};
}
export function activeAt(lives,generation){
  const gen=normalizeGeneration(generation),start=Math.max(1,gen-3),active=[],dropped=[],overwritten=[],duplicates=[];
  for(let life=1;life<=gen;life++){
    const plan=lives[life-1]||blankLife(),available=plan.prime?4:3;
    for(let slot=1;slot<=Math.min(4,available);slot++){
      const name=typeof plan.picks?.[slot-1]==='string'?plan.picks[slot-1]:'';
      if(!name||!byName(name))continue;
      const row={name,life,slot,inherited:life<gen};
      if(life<start){overwritten.push(row);continue;}
      if(life<gen&&NON_REPLICATING.has(name)){dropped.push(row);continue;}
      if(active.some(x=>x.name===name)){duplicates.push(row);continue;}
      active.push(row);
    }
  }
  return {active:active.slice(-MAX_MUTATIONS),dropped,overwritten,duplicates,gen};
}
export function capacityAt(lives,generation){
  const gen=normalizeGeneration(generation),from=Math.max(1,gen-3);
  return Math.min(MAX_MUTATIONS,lives.slice(from-1,gen).reduce((sum,l)=>sum+(l?.prime?4:3),0));
}
export function lineageFit(rows,d,generation,enabledContexts=[],capacity=16){
  const ctx=new Set(enabledContexts),w=weights[d.arch],names=rows.map(r=>r.name);
  const value=name=>{
    const m=byName(name);if(!m)return 0;
    const tier=tierEffect(name,generation);
    const base=dims.reduce((s,k)=>s+m.v[k]*w[k],0);
    const special=['Efficient Digestion','Sustained Hydration','Hematophagy','Xerocole Adaptation'].includes(name)?0.82:1;
    const context=Object.entries(m.ctx).reduce((s,[k,v])=>s+(ctx.has(k)?v:0),0)*.22;
    return (base*special+context)*(tier?tier.ratio:1);
  };
  const measured=names.map(value).sort((a,b)=>b-a);
  const discount=(list)=>list.reduce((s,v,i)=>s+v*Math.pow(.95,i),0);
  const eligibleNames=mutations.filter(m=>!UNAVAILABLE.has(m.n)&&
    (m.diet==='Any'||m.diet===d.diet||(m.diet==='Herbivore/Omnivore'&&d.diet==='Omnivore')) &&
    (m.sex==='Any'||rows.some(r=>r.name===m.n))).map(m=>m.n);
  const benchmark=eligibleNames.map(value).sort((a,b)=>b-a).slice(0,capacity);
  const synergy=synergies.reduce((sum,[a,b,boost])=>sum+(names.includes(a)&&names.includes(b)?boost:0),0);
  const raw=discount(measured)+synergy,ceiling=Math.max(1,discount(benchmark));
  const fit=Math.round(Math.max(0,Math.min(100,raw/ceiling*100)));
  const stats=Object.fromEntries(dims.map(k=>[k,rows.reduce((s,r)=>{
    const m=byName(r.name),t=tierEffect(r.name,generation);
    return s+(m?.v[k]||0)*(t?t.ratio:1);
  },0)]));
  return {fit,stats,filled:rows.length,capacity,raw,synergy,unverified:rows.filter(r=>!tierEffect(r.name,generation)).length};
}