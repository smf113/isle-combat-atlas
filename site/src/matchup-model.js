/** Transparent, scenario-conditioned relative matchup model. NOT combat telemetry or win probability.
 * Reuses the original growth curve and only models quantified direct combat mutation effects.
 */
import {dinos} from './data.js';
import {activeAt,byName,eligible,tierEffect,MAX_GENERATION} from './entomb-model.js';

export const MIN_GROWTH=25;
export const SLOT_GROWTH=[25,50,75,75]; // approximate unlock stages, not exact patch-verified percentages
export const SCENARIO_DEFAULT={aBleeding:false,bBleeding:false,aLowHealth:false,bLowHealth:false,bleedPressure:false};
export const DEFAULT_SIDE=(dino='Allosaurus')=>({dino,growth:100,prime:false,sex:'Male',source:'none',manual:['','','',''],lineage:null,generation:1});
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,Number.isFinite(+v)?+v:lo));
const findDino=n=>dinos.find(d=>d.n===n);
export const maturity=(g,usePrime)=>{
  const growth=clamp(g,MIN_GROWTH,100),lerp=(a,b,t)=>a+(b-a)*t;
  const pts=usePrime&&growth>=75?[[75,.90],[87,1.08],[100,1.02]]:[[25,.15],[35,.24],[45,.36],[55,.50],[65,.67],[75,.82],[87,.94],[100,1]];
  if(usePrime&&growth>=75){for(let i=1;i<pts.length;i++)if(growth<=pts[i][0])return lerp(pts[i-1][1],pts[i][1],(growth-pts[i-1][0])/(pts[i][0]-pts[i-1][0]));return 1.02;}
  for(let i=1;i<pts.length;i++)if(growth<=pts[i][0])return lerp(pts[i-1][1],pts[i][1],(growth-pts[i-1][0])/(pts[i][0]-pts[i-1][0]));return 1;
};
export const adultPower=d=>16+Math.log2(d.kg+20)*8+d.threat*11+d.solo*2;
export const validLineage=x=>Boolean(x&&x.v===1&&findDino(x.dino)&&Array.isArray(x.lives)&&x.lives.length===MAX_GENERATION&&x.lives.every(l=>l&&Array.isArray(l.picks)&&l.picks.length===4));
export function extractLineageLink(input){
  const text=String(input||'').trim();
  let payload=text;
  if(text.length>24000)throw new Error('Lineage link is too long.');
  if(text.includes('#lineage='))payload=text.slice(text.indexOf('#lineage=')+9);
  else if(text.startsWith('lineage='))payload=text.slice(8);
  else if(text.startsWith('#'))throw new Error('This is not an Entomb lineage link.');
  try{
    const x=JSON.parse(decodeURIComponent(payload));
    if(!validLineage(x))throw new Error('Unrecognized lineage data.');
    return JSON.parse(JSON.stringify(x));
  }catch(e){throw new Error('Could not read a valid Entomb Planner link or snapshot.');}
}
export function resolveSide(s){
  const d=findDino(s?.dino)||dinos.find(x=>x.n==='Allosaurus')||dinos[0];
  const growth=clamp(s?.growth,MIN_GROWTH,100),source=['none','manual','lineage'].includes(s?.source)?s.source:'none';
  const sex=s?.sex==='Female'?'Female':'Male';
  const lineage=source==='lineage'&&validLineage(s?.lineage)&&s.lineage.dino===d.n?s.lineage:null;
  const generation=lineage?clamp(Math.trunc(s?.generation),1,MAX_GENERATION):1;
  const life=lineage?lineage.lives[generation-1]:null;
  const earnedPrime=lineage?Boolean(life.prime):Boolean(s?.prime);
  const primeActive=earnedPrime&&growth>=75;
  const pending=[], active=[],used=new Set();
  let sourceWarning='';
  if(source==='lineage'&&!lineage)sourceWarning='No matching lineage imported; treated as unmutated.';
  if(source==='manual'){
    (Array.isArray(s?.manual)?s.manual:[]).slice(0,4).forEach((name,i)=>{
      const slot=i+1,m=byName(name);
      if(!m||used.has(name)||!eligible(m,d,sex,slot)||slot===4&&!earnedPrime)return;
      used.add(name);
      const row={name,slot,life:1,inherited:false,tier:1};
      if(growth<SLOT_GROWTH[i]||(slot===4&&!primeActive))pending.push(row);else active.push(row);
    });
  }
  if(lineage){
    const a=activeAt(lineage.lives,generation).active;
    for(const row of a){
      // Already-earned inherited mutations are available in the new juvenile; new slots grow in this life.
      const m=byName(row.name);
      if(!m||used.has(row.name)||!eligible(m,d,sex,row.slot))continue;
      used.add(row.name);
      const decorated={...row,tier:Math.min(3,generation)};
      if(row.life===generation&&(growth<SLOT_GROWTH[row.slot-1]||(row.slot===4&&!primeActive)))pending.push(decorated);
      else active.push(decorated);
    }
  }
  return {d,growth,source,sex,generation,earnedPrime,primeActive,active,pending,sourceWarning,
    basePower:adultPower(d)*maturity(growth,primeActive),maturity:maturity(growth,primeActive)};
}
const has=(p,n)=>p.active.some(m=>m.name===n);
const pct=(name,gen)=>tierEffect(name,gen)?.value??0;
function directEffects(p,target,scenario,isA){
  const events=[], exclusions=[],targetBleeding=isA?scenario.bBleeding:scenario.aBleeding,targetLow=isA?scenario.bLowHealth:scenario.aLowHealth;
  let offense=1,mitigation=0;
  const append=(name,kind,val,note)=>events.push({name,kind,val,note,tier:Math.min(3,p.generation)});
  if(has(p,'Hemomania')){
    const n=pct('Hemomania',p.generation);
    if(targetBleeding){offense*=1+n/100;append('Hemomania','damage',n,`+${n}% against an already-bleeding target`)}
    else exclusions.push('Hemomania needs the opponent to be bleeding');
  }
  if(has(p,'Accelerated Prey Drive')){
    const n=pct('Accelerated Prey Drive',p.generation);
    if(targetLow){offense*=1+n/100;append('Accelerated Prey Drive','damage',n,`+${n}% against a target below 35% health`)}
    else exclusions.push('Accelerated Prey Drive needs the opponent below 35% health');
  }
  if(has(p,'Congenital Hypoalgesia')){
    const n=pct('Congenital Hypoalgesia',p.generation);
    if(target.d.kg>p.d.kg){mitigation=1-(1-mitigation)*(1-n/100);append('Congenital Hypoalgesia','mitigation',n,`${n}% direct damage reduction versus larger adult-species reference`)}
    else exclusions.push('Congenital Hypoalgesia requires a larger opposing species');
  }
  if(has(p,'Epidermal Fibrosis')){
    const n=pct('Epidermal Fibrosis',p.generation);
    // No evidence-based bleed-vs-bite breakdown. Do not fold bleed resistance into generic health damage.
    exclusions.push(`Epidermal Fibrosis provides ${n}% bleed resistance; excluded from generic power ratio`);
  }
  for(const row of p.active){
    if(['Hemomania','Accelerated Prey Drive','Congenital Hypoalgesia','Epidermal Fibrosis'].includes(row.name))continue;
    const m=byName(row.name);
    if(m?.tags.includes('Combat'))exclusions.push(`${row.name} is not converted to damage without a validated encounter formula`);
  }
  return {offense,mitigation,events,exclusions};
}
function counter(d,opponent){const factors=[];let value=1;
  if(d.fav.includes(opponent.n)){value*=1.12;factors.push(`Existing favorable target: ${opponent.n}`)}
  if(d.danger.includes(opponent.n)){value*=.86;factors.push(`Existing major threat: ${opponent.n}`)}
  return {value,factors};
}
const category=index=>index>=1.2?'A favored':index<=1/1.2?'B favored':'Competitive / uncertain';
export function calculateMatchup(aInput,bInput,scenarioInput={}){
  const a=resolveSide(aInput),b=resolveSide(bInput),scenario={...SCENARIO_DEFAULT,...scenarioInput};
  const aCounter=counter(a.d,b.d),bCounter=counter(b.d,a.d);
  const aFx=directEffects(a,b,scenario,true),bFx=directEffects(b,a,scenario,false);
  // A mitigates B's incoming pressure; B mitigates A's incoming pressure.
  const baseline=(a.basePower*aCounter.value)/(b.basePower*bCounter.value);
  const adjusted=baseline*(aFx.offense*(1-bFx.mitigation))/(bFx.offense*(1-aFx.mitigation));
  const index=clamp(adjusted,.01,100);
  return {a,b,scenario,baseline,adjusted:index,category:category(index),baselineCategory:category(baseline),aFx,bFx,aCounter,bCounter,
    shift:Math.abs(Math.log(index)-Math.log(baseline))>.025,
    notes:['Derived from the original atlas adult-power and maturity heuristics, not live damage, HP or skill measurements.','Only conditional quantified damage and damage-reduction mutations affect the ratio. Bleed, fracture, recovery, movement and utility effects are shown separately rather than guessed into generic combat power.','Species mass comparison uses the reference adult weights; actual weight at growth may differ.','Mutation slot unlock growth thresholds (25/50/75/75%) are approximate; inherited Entomb mutations are modeled active from juvenile.']};
}
export function compareAcrossGrowth(a,b,scenario,values=[25,35,45,55,65,75,87,100]){
  return values.map(g=>({growth:g,...calculateMatchup({...a,growth:g},b,scenario)}));
}