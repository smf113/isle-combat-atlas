import test from 'node:test';
import assert from 'node:assert/strict';
import {dinos,mutations,presets,weights,contexts,growthSteps} from '../site/src/data.js';

test('the full roster remains intact and unique',()=>{
  assert.equal(dinos.length,22);
  assert.equal(new Set(dinos.map(d=>d.n)).size,dinos.length);
  for(const d of dinos){assert.ok(d.n);assert.ok(d.kg>0);assert.ok(d.solo>=1&&d.solo<=5);assert.ok(d.threat>=1&&d.threat<=5);assert.ok(weights[d.arch],`Missing archetype ${d.arch}`);assert.ok(Array.isArray(d.fav)&&Array.isArray(d.danger));}
});
test('mutations are unique, slot-bounded and context-safe',()=>{
  assert.ok(mutations.length>=20);
  assert.equal(new Set(mutations.map(m=>m.n)).size,mutations.length);
  for(const m of mutations){assert.ok(m.slots.length);assert.ok(m.slots.every(x=>Number.isInteger(x)&&x>=1&&x<=4));for(const k of Object.keys(m.ctx))assert.ok(Object.hasOwn(contexts,k),`${m.n}: ${k}`);}
});
test('presets only refer to known mutations and have four entries',()=>{
  const known=new Set(mutations.map(m=>m.n));
  for(const [role,items] of Object.entries(presets)){assert.ok(weights[role]);assert.equal(items.length,4,role);for(const name of items)assert.ok(known.has(name),`${role}: ${name}`);}
});
test('growth support prime eligibility floor and adult marker',()=>{
  assert.deepEqual(growthSteps,[25,35,45,55,65,75,87,100]);
});
