import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_SIDE,SCENARIO_DEFAULT,maturity,resolveSide,calculateMatchup,compareAcrossGrowth,extractLineageLink,standardPicks,advantagePosition} from '../site/src/matchup-model.js';
import {emptyLineage,MAX_GENERATION,eligible,byName} from '../site/src/entomb-model.js';
import {dinos} from '../site/src/data.js';
const side=(dino='Allosaurus',extras={})=>({...DEFAULT_SIDE(dino),source:'none',...extras});
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
test('fresh calculator sides default to a standard one-life build, not an unmutated baseline',()=>{
  const a=DEFAULT_SIDE('Allosaurus'),b=DEFAULT_SIDE('Ceratosaurus');
  assert.equal(a.source,'standard');assert.equal(b.source,'standard');
  assert.equal(resolveSide(a).active.length,3);
  assert.equal(resolveSide(b).active.length,3);
  assert.equal(resolveSide({...a,prime:true}).active.length,4);
});
test('each standard preset is distinct, slot-legal and never includes unavailable Traumatic Thrombosis',()=>{
  for(const d of dinos){
    for(const sex of ['Male','Female']){
      const names=standardPicks(d.n,sex);
      assert.equal(names.length,4,`${d.n}/${sex}: four recommendations`);
      assert.equal(new Set(names).size,4,`${d.n}/${sex}: no duplicates`);
      names.forEach((name,i)=>{
        assert.ok(name,`${d.n}/${sex}: slot ${i+1} must have a choice`);
        assert.ok(eligible(byName(name),d,sex,i+1),`${d.n}/${sex}: slot ${i+1} ${name} is legal`);
        assert.notEqual(name,'Traumatic Thrombosis');
      });
      assert.equal(resolveSide({...DEFAULT_SIDE(d.n),sex}).active.length,3);
    }
  }
});
test('recommended standard mutation selections respect juvenile unlock timing',()=>{
 const d=DEFAULT_SIDE('Allosaurus');
 assert.equal(resolveSide({...d,growth:25}).active.length,1);
 assert.equal(resolveSide({...d,growth:25}).pending.length,2);
 assert.equal(resolveSide({...d,growth:75,prime:true}).active.length,4);
});
test('advantage spectrum matches A on left and B on right; marker reverses with score',()=>{
  assert.equal(advantagePosition(1),50);
  assert.ok(advantagePosition(2)<50);
  assert.ok(advantagePosition(0.5)>50);
  assert.ok(Math.abs(advantagePosition(2)+advantagePosition(.5)-100)<1e-10);
  const ab=calculateMatchup(side('Allosaurus'),side('Ceratosaurus'));
  const ba=calculateMatchup(side('Ceratosaurus'),side('Allosaurus'));
  assert.ok(ab.adjusted>1);
  assert.ok(advantagePosition(ab.adjusted)<50);
  assert.ok(advantagePosition(ba.adjusted)>50);
});
