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
 assert.deepEqual(rows.map(r=>r.growth),[25,35,45,50,55,65,75,87,100]);
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

test('unmutated Prime intent persists and activates precisely at 75%, independently of mutations',()=>{
 const s=side('Allosaurus',{source:'none',prime:true});
 for(const growth of [25,74]){const r=resolveSide({...s,growth});assert.equal(r.earnedPrime,true);assert.equal(r.primeActive,false);assert.equal(r.maturity,maturity(growth,false));assert.equal(r.active.length,0);}
 for(const growth of [75,87,100]){const r=resolveSide({...s,growth});assert.equal(r.primeActive,true);assert.equal(r.maturity,maturity(growth,true));}
 assert.equal(resolveSide({...s,growth:87}).maturity,1.08);
 assert.equal(resolveSide({...s,growth:100,prime:false}).maturity,1);
});
test('invalid custom selections are excluded with explicit, inspectable reasons',()=>{
 const d=resolveSide(side('Allosaurus',{source:'manual',prime:false,manual:['Hemomania','Hemomania','Unknown Mutation','Cellular Regeneration']}));
 assert.deepEqual(d.active.map(r=>r.name),['Hemomania']);
 assert.deepEqual(d.invalidSelections.map(r=>r.reason),['duplicate mutation','unknown mutation','requires Prime in the current life']);
 const c=resolveSide(side('Ceratosaurus',{source:'manual',manual:['Cannibalistic','','','']}));
 assert.match(c.invalidSelections[0].reason,/not eligible/);
});
test('inherited fourth slot remains active for juvenile descendants without current-life Prime',()=>{
 const plan=entomb('Allosaurus',2);plan.lives[0].prime=true;plan.lives[0].picks[3]='Cellular Regeneration';plan.lives[1].prime=false;
 const kid=resolveSide(side('Allosaurus',{source:'lineage',lineage:plan,generation:2,growth:25}));
 assert.equal(kid.earnedPrime,false);assert.equal(kid.primeActive,false);
 assert.ok(kid.active.some(p=>p.name==='Cellular Regeneration'&&p.inherited&&p.slot===4));
});
test('swapping combatants and injuries yields reciprocal unclamped ratios and mirrored markers',()=>{
 const a=side('Allosaurus',{source:'manual',manual:['Hemomania','','','']});
 const b=side('Ceratosaurus',{source:'manual',manual:['Hemomania','','','']});
 const ab=calculateMatchup(a,b,{aBleeding:true,bBleeding:false,aLowHealth:true,bLowHealth:false});
 const ba=calculateMatchup(b,a,{aBleeding:false,bBleeding:true,aLowHealth:false,bLowHealth:true});
 assert.ok(Math.abs(ab.adjusted*ba.adjusted-1)<1e-12);
 assert.ok(Math.abs(ab.baseline*ba.baseline-1)<1e-12);
 assert.ok(Math.abs(advantagePosition(ab.adjusted)+advantagePosition(ba.adjusted)-100)<1e-10);
 for(const row of compareAcrossGrowth(a,b,{},[25,50,75,87]))assert.equal(row.b.growth,b.growth);
});
test('Prime source switching retains selections without activating fourth slot early',()=>{
 const manual=['Hemomania','Efficient Digestion','Epidermal Fibrosis','Cellular Regeneration'];
 for(const source of ['manual','none','standard','manual']){
  const r=resolveSide(side('Allosaurus',{source,manual,prime:true,growth:74}));
  assert.equal(r.earnedPrime,true);assert.equal(r.primeActive,false);
  assert.equal(r.maturity,maturity(74,false));assert.ok(!r.active.some(row=>row.slot===4));
 }
 assert.ok(resolveSide(side('Allosaurus',{source:'manual',manual,prime:true,growth:75})).active.some(row=>row.slot===4));
});
test('lineage Prime comes from selected life, not standalone side flag',()=>{
 const p=entomb('Allosaurus',2);p.lives[0].prime=true;p.lives[1].prime=false;
 const r=resolveSide(side('Allosaurus',{source:'lineage',lineage:p,prime:true,generation:2,growth:100}));
 assert.equal(r.earnedPrime,false);assert.equal(r.primeActive,false);assert.equal(r.maturity,1);
 const parent=resolveSide(side('Allosaurus',{source:'lineage',lineage:p,prime:false,generation:1,growth:100}));
 assert.equal(parent.earnedPrime,true);assert.equal(parent.primeActive,true);
});
test('50% growth retains previous rows and second slot transition',()=>{
 const a=side('Allosaurus',{source:'standard'}),b=side('Ceratosaurus');
 assert.deepEqual(compareAcrossGrowth(a,b).map(x=>x.growth),[25,35,45,50,55,65,75,87,100]);
 const young=resolveSide({...a,growth:49}),unlocked=resolveSide({...a,growth:50});
 assert.equal(young.active.length,1);assert.equal(unlocked.active.length,2);
 assert.equal(young.pending.length,2);assert.equal(unlocked.pending.length,1);
});

test('fight circumstances trigger the attacker against the affected opponent, not the injured attacker',()=>{
  const base=side('Allosaurus');
  const hemomania=side('Allosaurus',{source:'manual',manual:['Hemomania','','','']});
  const neutral=calculateMatchup(hemomania,base);
  assert.equal(neutral.adjusted,1);
  assert.equal(calculateMatchup(hemomania,base,{aBleeding:true}).adjusted,1);
  const bBleeds=calculateMatchup(hemomania,base,{bBleeding:true});
  assert.ok(Math.abs(bBleeds.adjusted-1.05)<1e-10);
  assert.equal(bBleeds.aFx.events[0].name,'Hemomania');
  assert.deepEqual(bBleeds.scenario.bBleeding,true);
  const aBleeds=calculateMatchup(base,hemomania,{aBleeding:true});
  assert.ok(Math.abs(aBleeds.adjusted-1/1.05)<1e-10);
  assert.equal(aBleeds.bFx.events[0].name,'Hemomania');
  assert.equal(calculateMatchup(base,base,{aBleeding:true,bBleeding:true}).adjusted,1);
});

test('low-health conditions trigger only the opposing active Accelerated Prey Drive',()=>{
  const base=side('Allosaurus');
  const drive=side('Allosaurus',{source:'manual',manual:['Accelerated Prey Drive','','','']});
  assert.equal(calculateMatchup(drive,base,{aLowHealth:true}).adjusted,1);
  assert.ok(Math.abs(calculateMatchup(drive,base,{bLowHealth:true}).adjusted-1.10)<1e-10);
  assert.ok(Math.abs(calculateMatchup(base,drive,{aLowHealth:true}).adjusted-1/1.10)<1e-10);
  assert.equal(calculateMatchup(base,base,{aLowHealth:true,bLowHealth:true}).adjusted,1);
  const both=calculateMatchup(drive,drive,{aLowHealth:true,bLowHealth:true});
  assert.equal(both.adjusted,1);
  assert.equal(both.aFx.events[0].name,'Accelerated Prey Drive');
  assert.equal(both.bFx.events[0].name,'Accelerated Prey Drive');
});
