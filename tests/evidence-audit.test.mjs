import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dinos,mutations,presets,eligibleMutation,availabilityReason,removedMutations} from '../site/src/data.js';
import {eligible,activeAt,emptyLineage,byName} from '../site/src/entomb-model.js';
import {standardPicks,resolveSide,DEFAULT_SIDE,calculateMatchup,compareAcrossGrowth} from '../site/src/matchup-model.js';
import {sources,mutationEvidence,modelEvidence,slug,snapshotDate,reviewDate} from '../site/src/evidence.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const d=dinos.find(d=>d.n==='Allosaurus');
test('retained historical mutation is excluded everywhere and never recommended',()=>{
 assert.equal(mutations.length,42);assert.equal(mutationEvidence.length,42);
 assert.equal(new Set(mutations.map(x=>x.n)).size,42);
 const removed=byName('Traumatic Thrombosis');assert.ok(removed);assert.ok(removedMutations.has(removed.n));
 for(const species of dinos)for(const sex of ['Male','Female'])for(const slot of [1,2,3,4]){
   assert.equal(eligibleMutation(removed,species,sex,slot),false);assert.equal(eligible(removed,species,sex,slot),false);
 }
 assert.match(availabilityReason(removed,d,'Male',2),/removed/);
 const result=resolveSide({...DEFAULT_SIDE(),source:'manual',manual:['Hemomania','Traumatic Thrombosis','Epidermal Fibrosis','']});
 assert.ok(!result.active.some(x=>x.name===removed.n));assert.ok(result.invalidSelections.some(x=>x.name===removed.n));
 const lives=emptyLineage();lives[0].picks[1]=removed.n;
 assert.ok(!activeAt(lives,1).active.some(x=>x.name===removed.n));
 for(const [role,items] of Object.entries(presets))assert.ok(!items.includes(removed.n),role);
});
test('documented slot 2 and 4 choices and conservative unlock restrictions',()=>{
 for(const name of ['Gastronomic Regeneration','Hypermetabolic Inanition','Tactile Endurance']){
  const m=byName(name);assert.deepEqual(m.slots,[2,4]);
  assert.equal(eligibleMutation(m,{...d,diet:name==='Tactile Endurance'?'Herbivore':'Carnivore'},'Male',4),true);
  assert.equal(eligibleMutation(m,d,'Male',1),false);
 }
 for(const name of ['Augmented Tapetum','Heightened Ghrelin','Parthenogenesis','Prolific Reproduction']){
  assert.deepEqual(byName(name).slots,[2]);assert.equal(eligibleMutation(byName(name),d,'Female',4),false);
 }
 for(const name of ['Pit Organ','Paratrepsis','Cochlear Sensitivity','Intraspecific Aggression'])assert.equal(byName(name),undefined);
});
test('legacy and Entomb keep excluded historical selections visible',()=>{
 const app=read('site/src/app.js'),entomb=read('site/src/entomb-ui.js'),match=read('site/src/matchup-model.js');
 assert.ok(app.includes('eligibleMutation(m,d,sex,slot)'));
 assert.ok(app.includes('EXCLUDED:'));assert.ok(app.includes('availabilityReason(byName(n),d,sex,i+1)'));
 assert.ok(entomb.includes('EXCLUDED:'));assert.ok(match.includes('standardPicks'));
});
test('every standard recommendation is legal in all slots for all 22 species and both sexes',()=>{
 assert.equal(dinos.length,22);
 for(const d of dinos)for(const sex of ['Male','Female']){
  const picks=standardPicks(d.n,sex);assert.equal(picks.length,4);assert.equal(new Set(picks).size,4);
  picks.forEach((name,i)=>assert.equal(eligibleMutation(byName(name),d,sex,i+1),true,d.n+'/'+sex+'/'+name));
 }
});
test('every mutation and calculation component has a typed, dated source record',()=>{
 assert.equal(snapshotDate,'September 2026');assert.equal(reviewDate,'October 25, 2026');
 for(const m of mutations){
   const row=mutationEvidence.find(x=>x.name===m.n);assert.ok(row);assert.equal(row.id,slug(m.n));assert.ok(row.references.length);
   for(const ref of row.references){const src=sources[ref];assert.ok(src,ref);assert.ok(src.url.startsWith('https://')||src.url.startsWith('./'));assert.ok(src.title&&src.publisher&&src.date&&src.access&&src.scope&&src.claim&&src.status);}
 }
 for(const id of ['ranking','adult-power','species-inputs','growth','prime','counter','conditional','stacking','threshold','marker','fit','legacy','entomb','unlock']){
   const item=modelEvidence.find(x=>x.id===id);assert.ok(item,id);assert.ok(item.expression&&item.description&&item.status);item.refs.forEach(r=>assert.ok(sources[r]));
 }
 assert.equal(sources.official720.status,'official');assert.equal(mutationEvidence.find(x=>x.name==='Traumatic Thrombosis').status,'official');
});
test('sources page, model links, version and old research snapshot coexist',()=>{
 const index=read('site/index.html'),page=read('site/sources.html'),ui=read('site/src/sources-ui.js'),method=read('site/methodology.html');
 const version=JSON.parse(read('package.json')).version;
 assert.ok(index.includes('<a class="snapshot-chip" href="./sources.html" id="researchChip" aria-label='));
 assert.ok(index.includes('href="./sources.html">Sources &amp; Methodology</a>'));
 assert.ok(method.includes('href="./sources.html"'));
 assert.ok(index.includes('Version '+version+' · Changelog'));
 assert.ok(page.includes(version+' (software, not a data-refresh date)')&&page.includes('id="evidenceSearch"')&&page.includes('id="evidenceStatus"'));
 assert.ok(ui.includes('mutationEvidence')&&ui.includes('safe(m.id)')&&ui.includes('revealHash'));
 assert.ok(read('site/assets/sources.css').includes('@media(max-width:720px)'));
 assert.ok(read('site/src/matchup-ui.js').includes('./sources.html#calculation-stacking'));
 const log=read('site/changelog.html');
 assert.ok(log.includes('<h2>Version '+version+' — October 25, 2026</h2>'));
 assert.ok(log.indexOf('Version '+version)<log.indexOf('Version 1.0.3'));
});
test('fight condition, growth row and reciprocal baseline numeric semantics preserved',()=>{
 const a={...DEFAULT_SIDE('Allosaurus'),source:'manual',manual:['Hemomania','','','']},b={...DEFAULT_SIDE('Ceratosaurus'),source:'none'};
 const normal=calculateMatchup(a,b),bleeding=calculateMatchup(a,b,{bBleeding:true});
 assert.ok(bleeding.adjusted>normal.adjusted);
 const reverse=calculateMatchup(b,a,{aBleeding:true});
 assert.ok(Math.abs(bleeding.adjusted*reverse.adjusted-1)<1e-9);
 assert.deepEqual(compareAcrossGrowth(a,b).map(r=>r.growth),[25,35,45,50,55,65,75,87,100]);
});
