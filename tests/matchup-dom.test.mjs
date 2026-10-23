import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyLineage} from '../site/src/entomb-model.js';

const key='origin-matchup-calculator-v2',oldKey='origin-matchup-calculator-v1',planKey='origin-entomb-lineage-v1';
let sequence=0;
const lineage=(dino='Allosaurus',generation=2)=>{
 const lives=emptyLineage();lives[0].picks[0]='Hemomania';
 return {v:1,dino,generation,sex:'Male',lives,contexts:[]};
};
const element=()=>({innerHTML:'',textContent:'',value:'',checked:false,classList:{add(){},remove(){}},focus(){},select(){},dispatchEvent(){},click(){},addEventListener(){}});
async function harness({hash='',stored={}}={}){
 const store=new Map(Object.entries(stored));
 const local={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
 const events={};
 const panel=()=>{
  const nodes=new Map(),handlers={};
  return {querySelector(sel){if(!nodes.has(sel))nodes.set(sel,element());return nodes.get(sel)},
   addEventListener(type,fn){handlers[type]=fn},
   emit(type,target){assert.ok(handlers[type]);handlers[type]({target})}};
 };
 const matchup=panel(),entomb=panel(),nodes=new Map();
 nodes.set('#tab-growth',matchup);nodes.set('#tab-entomb',entomb);
 nodes.set('#selectedBadge',{textContent:'Allosaurus'});
 for(const name of ['#customDino','#sexSelect','[data-tab="entomb"]','[data-tab="growth"]'])nodes.set(name,element());
 nodes.get('#sexSelect').value='Male';
 const root={querySelector:sel=>nodes.get(sel)||element()};
 globalThis.document={getElementById:id=>id==='origin-lab-v3'?root:id==='tab-entomb'?entomb:null};
 globalThis.window={addEventListener:(kind,fn)=>(events[kind]??=[]).push(fn)};
 globalThis.location={hash,href:'https://example.test/isle-combat-atlas/'+hash};
 globalThis.localStorage=local;
 globalThis.MutationObserver=class {observe(){}};
 const suffix='?ui='+sequence++;
 await import('../site/src/entomb-ui.js'+suffix);
 await import('../site/src/matchup-ui.js'+suffix);
 const change=(side,field,value,extra={})=>matchup.emit('change',{
  dataset:{side,field,...extra},value,checked:!!value,
  matches:x=>x==='[data-side][data-field]'
 });
 const click=(selector,data={})=>matchup.emit('click',{closest:x=>x===selector?{dataset:data}:null});
 const snap=()=>JSON.parse(local.getItem(key));
 const markup=side=>matchup.querySelector('#matchupSide'+side).innerHTML;
 const setHash=value=>{location.hash=value;location.href='https://example.test/isle-combat-atlas/'+value;for(const fn of events.hashchange??[])fn()};
 return {change,click,snap,markup,setHash,matchup,local};
}
test('Prime remains controllable on unmutated baseline and only becomes active at 75%',async()=>{
 const ui=await harness();
 ui.change('a','prime',true);ui.change('a','source','none');
 assert.match(ui.markup('A'),/data-field="prime"[^>]*checked/);
 ui.change('a','growth',74);assert.match(ui.markup('A'),/Prime intended; inactive at this growth/);
 ui.change('a','growth',75);assert.match(ui.markup('A'),/Prime intended; active now/);
 ui.change('a','source','manual');ui.change('a','source','none');
 assert.equal(ui.snap().a.prime,true);
});
test('shared initial lineage import wins over empty and stale local storage',async()=>{
 for(const mode of ['empty','stale']){
  const shared=lineage('Omniraptor',3);
  const cache=mode==='stale'?{[planKey]:JSON.stringify(lineage('Ceratosaurus',2))}:{};
  const ui=await harness({hash:'#lineage='+encodeURIComponent(JSON.stringify(shared)),stored:cache});
  ui.change('a','source','lineage');ui.click('[data-import-planner]',{importPlanner:'a'});
  assert.deepEqual(ui.snap().a.lineage,shared);
  assert.equal(ui.snap().b.dino,'Ceratosaurus');
  assert.equal(ui.local.getItem(planKey),cache[planKey]??null);
 }
});
test('subsequent shared hash restoration and independent A/B lineage imports',async()=>{
 const ui=await harness({stored:{[planKey]:JSON.stringify(lineage('Ceratosaurus',1))}});
 const a=lineage('Allosaurus',2),b=lineage('Omniraptor',4);
 ui.setHash('#lineage='+encodeURIComponent(JSON.stringify(a)));
 ui.change('a','source','lineage');ui.click('[data-import-planner]',{importPlanner:'a'});
 ui.setHash('#lineage='+encodeURIComponent(JSON.stringify(b)));
 ui.change('b','source','lineage');ui.click('[data-import-planner]',{importPlanner:'b'});
 assert.deepEqual(ui.snap().a.lineage,a);
 assert.deepEqual(ui.snap().b.lineage,b);
 assert.deepEqual(window.originEntombPlanner.getSnapshot(),b);
});
test('custom duplicate exclusions appear while occupied mutations are omitted from other dropdowns',async()=>{
 const prior={v:1,a:{dino:'Allosaurus',growth:100,prime:false,sex:'Male',source:'manual',manual:['Hemomania','Hemomania','Unknown Mutation','Cellular Regeneration']},b:{dino:'Ceratosaurus',source:'standard'},scenario:{}};
 const ui=await harness({stored:{[key]:JSON.stringify(prior)}});
 assert.match(ui.markup('A'),/Excluded selections \(not counted\)/);
 assert.match(ui.markup('A'),/duplicate mutation/);
 assert.match(ui.markup('A'),/unknown mutation/);
 assert.match(ui.markup('A'),/requires Prime/);
 ui.change('a','manual','',{slot:2});
 const list=ui.markup('A').match(/data-slot="2"[^>]*>([\s\S]*?)<\/select>/)[1];
 assert.doesNotMatch(list,/value="Hemomania"/);
});
test('v1 defaults migrate while custom and lineage configurations remain',async()=>{
 const baseline={v:1,a:{dino:'Allosaurus',source:'none',growth:100,prime:false,manual:['','','','']},b:{dino:'Ceratosaurus',source:'none',growth:100,prime:false,manual:['','','','']},scenario:{}};
 let ui=await harness({stored:{[oldKey]:JSON.stringify(baseline)}});
 ui.change('a','growth',99);assert.equal(ui.snap().a.source,'standard');assert.equal(ui.snap().b.source,'standard');
 const customized=structuredClone(baseline);
 customized.a.prime=true;customized.b.source='manual';customized.b.manual[0]='Hemomania';
 ui=await harness({stored:{[oldKey]:JSON.stringify(customized)}});
 ui.change('a','growth',99);
 assert.equal(ui.snap().a.source,'none');assert.equal(ui.snap().a.prime,true);
 assert.equal(ui.snap().b.source,'manual');assert.equal(ui.snap().b.manual[0],'Hemomania');
 const imported=structuredClone(baseline);
 imported.a.source='lineage';imported.a.lineage=lineage();imported.a.generation=2;
 ui=await harness({stored:{[oldKey]:JSON.stringify(imported)}});
 ui.change('b','growth',99);
 assert.equal(ui.snap().a.source,'lineage');assert.deepEqual(ui.snap().a.lineage,imported.a.lineage);
});
test('A/B swap reverses injury flags, relative ratio and the two marker representations',async()=>{
 const ui=await harness();
 ui.matchup.emit('change',{dataset:{condition:'aBleeding'},checked:true,matches:x=>x==='[data-condition]'});
 const first=ui.snap();
 const before=ui.matchup.querySelector('#matchupResult').innerHTML;
 const oldRatio=Number(before.match(/index <strong>([\d.]+)×/)[1]);
 const oldMarker=Number(before.match(/matchup-spectrum-marker" style="left:([\d.]+)%/)[1]);
 ui.click('#matchupSwap');
 const swapped=ui.snap();
 assert.equal(swapped.a.dino,first.b.dino);assert.equal(swapped.b.dino,first.a.dino);
 assert.equal(swapped.scenario.aBleeding,false);assert.equal(swapped.scenario.bBleeding,true);
 const after=ui.matchup.querySelector('#matchupResult').innerHTML;
 const newRatio=Number(after.match(/index <strong>([\d.]+)×/)[1]);
 const newMarker=Number(after.match(/matchup-spectrum-marker" style="left:([\d.]+)%/)[1]);
 assert.ok(Math.abs(oldRatio*newRatio-1)<.05);
 assert.ok(Math.abs(oldMarker+newMarker-100)<.02);
 assert.match(ui.matchup.querySelector('#matchupGrowthCurve').innerHTML,/50%/);
});