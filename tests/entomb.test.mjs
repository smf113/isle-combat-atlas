import test from 'node:test';
import assert from 'node:assert/strict';
import {dinos} from '../site/src/data.js';
import {emptyLineage,activeAt,capacityAt,blankLife,eligible,tierEffect,lineageFit,ENTOMB_TIERS,MAX_MUTATIONS,byName} from '../site/src/entomb-model.js';
const d=dinos.find(x=>x.n==='Allosaurus');
test('entomb keeps distinct old picks and increases tier only to life three',()=>{
 const x=emptyLineage();x[0]={prime:true,picks:['Hemomania','Epidermal Fibrosis','Cellular Regeneration','Osteosclerosis']};
 x[1]={prime:true,picks:['Hydrodynamic','Wader','Reinforced Tendons','Sustained Hydration']};
 assert.equal(activeAt(x,2).active.length,8);
 assert.equal(tierEffect('Epidermal Fibrosis',2).value,20);
 assert.equal(tierEffect('Epidermal Fibrosis',4).value,25);
 assert.equal(tierEffect('Wader',3).value,75);
 assert.equal(tierEffect('Wader',5).value,75);
});
test('all prime gives 4 / 8 / 12 / 16 slots, fifth generation rolls oldest off',()=>{
 const x=emptyLineage();x.forEach(y=>y.prime=true);
 assert.deepEqual([1,2,3,4,5].map(g=>capacityAt(x,g)),[4,8,12,16,16]);
 x[0].picks=['Hemomania','Epidermal Fibrosis','Cellular Regeneration','Osteosclerosis'];
 x[1].picks=['Hydrodynamic','Wader','Reinforced Tendons','Sustained Hydration'];
 const five=activeAt(x,5);
 assert.equal(five.active.some(r=>r.life===1),false);
 assert.equal(five.overwritten.length,4);
 assert.equal(MAX_MUTATIONS,16);
});
test('non-replicating are dropped, not silently treated as inherited',()=>{
 const x=emptyLineage();x[0]={prime:true,picks:['Parthenogenesis','Sequential Hermaphroditism','Reabsorption','Wader']};
 const gen2=activeAt(x,2);assert.equal(gen2.active.length,2);assert.equal(gen2.dropped.length,2);
});
test('picks cannot stack duplicate names, even if repeated in a later life',()=>{
 const x=emptyLineage();x[0].picks=['Hemomania','','',''];x[1].picks=['Hemomania','','',''];
 assert.equal(activeAt(x,2).active.length,1);assert.equal(activeAt(x,2).duplicates.length,1);
});
test('mutation restrictions include special slot four and removed mutation',()=>{
 assert.equal(eligible({n:'Traumatic Thrombosis',slots:[2],diet:'Any',sex:'Any',cat:'Slot 2'},d,'Male',2),false);
 assert.equal(eligible(byName('Gastronomic Regeneration'),d,'Male',4),true);
});
test('known tier data is monotonic and relative fit remains bounded',()=>{
 for(const [name,values] of Object.entries(ENTOMB_TIERS)){assert.equal(values.length,3,name);assert.ok(values[0]>0);assert.ok(values[1]>=values[0]);assert.ok(values[2]>=values[1]);}
 const r=lineageFit([{name:'Hemomania'}],d,2,[],4);assert.ok(r.fit>=0&&r.fit<=100);
});