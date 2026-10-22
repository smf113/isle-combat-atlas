import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_SIDE,SCENARIO_DEFAULT,maturity,resolveSide,calculateMatchup,compareAcrossGrowth,extractLineageLink} from '../site/src/matchup-model.js';
import {emptyLineage,MAX_GENERATION} from '../site/src/entomb-model.js';
const side=(dino='Allosaurus',extras={})=>({...DEFAULT_SIDE(dino),...extras});
function entomb(dino='Allosaurus',g=3){const lives=emptyLineage();return {v:1,dino,sex:'Male',generation:g,lives,contexts:[]};}

test('symmetric default combatants: index = 1, no unsupported probability',()=>{
 const result=calculateMatchup(side(),side());
 assert.equal(result.adjusted,1);assert.equal(result.category,'Competitive / uncertain');
 assert.equal(result.a.active.length,0);assert.equal(result.b.active.length,0);
});
test('Prime affects adult maturity but remains inactive before 75% growth',()=>{
 const young=resolveSide(side('Allosaurus',{growth:60,prime:true,source:'manual',manual:['','','','Cellular Regeneration']}));
 assert.equal(young.primeActive,false);assert.equal(young.active.length,0);
 assert.equal(maturity(60,true),maturity(60,false));
 const at75=resolveSide(side('Allosaurus',{growth:75,prime:true,source:'manual',manual:['','','','Cellular Regeneration']}));
 assert.equal(at75.primeActive,true);assert.equal(at75.active.length,1);
});
test('conditional bleed damage changes only when opponent is bleeding and uses Life 3 tier',()=>{
 const l=entomb();l.lives[0].picks[0]='Hemomania';
 const a=side('Allosaurus',{source:'lineage',generation:3,lineage:l,growth:100});
 const b=side('Allosaurus');
 const initial=calculateMatchup(a,b);
 const changed=calculateMatchup(a,b,{bBleeding:true});
 assert.equal(initial.a.active.length,1);
 assert.equal(initial.adjusted,1);
 assert.equal(changed.aFx.events[0].val,10);
 assert.ok(Math.abs(changed.adjusted-1.1)<1e-10);
 assert.equal(changed.bFx.events.length,0);
});
test('inherited mutations work at 25%; newly chosen current-life mutations wait for approximate slot unlock',()=>{
 const l=entomb();l.lives[0].picks[0]='Hemomania';l.lives[2].picks[2]='Accelerated Prey Drive';
 const at25=resolveSide(side('Allosaurus',{source:'lineage',lineage:l,generation:3,growth:25}));
 assert.deepEqual(at25.active.map(m=>m.name),['Hemomania']);
 assert.deepEqual(at25.pending.map(m=>m.name),['Accelerated Prey Drive']);
 const at75=resolveSide(side('Allosaurus',{source:'lineage',lineage:l,generation:3,growth:75}));
 assert.equal(at75.active.length,2);assert.equal(at75.pending.length,0);
});
test('A and B can import distinct entomb lineages with separate generations',()=>{
 const la=entomb('Allosaurus',3);la.lives[0].picks[0]='Hemomania';
 const lb=entomb('Omniraptor',2);lb.lives[0].picks[0]='Hemomania';
 const r=calculateMatchup(side('Allosaurus',{source:'lineage',lineage:la,generation:3}),side('Omniraptor',{source:'lineage',lineage:lb,generation:2}),{aBleeding:true,bBleeding:true});
 assert.equal(r.aFx.events[0].val,10);
 assert.equal(r.bFx.events[0].val,7);
 assert.equal(r.b.generation,2);
});
test('defensive hypoalgesia applies vs larger species, only against incoming pressure',()=>{
 const a=side('Allosaurus',{source:'manual',manual:['Congenital Hypoalgesia','','','']});
 const b=side('Tyrannosaurus');
 const base=calculateMatchup(side('Allosaurus'),b);
 const buff=calculateMatchup(a,b);
 assert.equal(buff.aFx.events[0].val,15);
 assert.ok(buff.adjusted>base.adjusted);
 const reversed=calculateMatchup(side('Tyrannosaurus',{source:'manual',manual:['Congenital Hypoalgesia','','','']}),side('Allosaurus'));
 assert.equal(reversed.aFx.events.length,0);
});
test('bleed resistance is visible but not improperly treated as direct damage reduction',()=>{
 const a=side('Allosaurus',{source:'manual',manual:['Epidermal Fibrosis','','','']});
 const b=side('Omniraptor');
 const r=calculateMatchup(a,b);
 const baseline=calculateMatchup(side('Allosaurus'),b);
 assert.equal(r.adjusted,baseline.adjusted);
 assert.ok(r.aFx.exclusions.some(s=>s.includes('15% bleed resistance')));
});
test('irrelevant and invalid mutation names cannot be applied',()=>{
 const a=resolveSide(side('Allosaurus',{source:'manual',manual:['Not a real mutation','Cannibalistic','','']}));
 assert.equal(a.active.length,1);
 const c=resolveSide(side('Ceratosaurus',{source:'manual',manual:['Cannibalistic','Hemomania','Hemomania','']}));
 assert.deepEqual(c.active.map(x=>x.name),['Hemomania']);
});
test('lineage imports reject wrong dinosaur and malformed URL; roundtrip imported URI',()=>{
 const l=entomb();l.lives[0].picks[0]='Hemomania';
 const uri='https://smf113.github.io/isle-combat-atlas/#lineage='+encodeURIComponent(JSON.stringify(l));
 const imported=extractLineageLink(uri);
 assert.deepEqual(imported,l);
 const p=resolveSide(side('Ceratosaurus',{source:'lineage',lineage:imported}));
 assert.equal(p.active.length,0);assert.match(p.sourceWarning,/No matching lineage/);
 assert.throws(()=>extractLineageLink('#build=abc'));
});
test('growth ladder consistently evaluates relative to a fixed opponent',()=>{
 const rows=compareAcrossGrowth(side('Allosaurus',{prime:true}),side('Ceratosaurus'));
 assert.deepEqual(rows.map(r=>r.growth),[25,35,45,55,65,75,87,100]);
 assert.equal(rows[0].a.primeActive,false);
 assert.equal(rows.at(-1).a.primeActive,true);
 assert.ok(rows.at(-1).adjusted>rows[0].adjusted);
});