import test from 'node:test';
import assert from 'node:assert/strict';
import {dinos,roster,mutations,disputedOmnivoreMutations,eligibleMutation,removedMutations} from '../site/src/data.js';
import {catalogEligibility,catalogAudit,catalogEntries} from '../site/src/mutation-catalog.js';
import {standardPicks} from '../site/src/matchup-model.js';
import {activeAt,emptyLineage} from '../site/src/entomb-model.js';
import {sources} from '../site/src/evidence.js';

test('Oviraptor is present in roster, not the archived model; no invented numbers',()=>{
  assert.equal(roster.length,23);assert.equal(dinos.length,22);
  const o=roster.find(d=>d.n==='Oviraptor');
  assert.equal(o.catalogOnly,true);
  for(const key of ['kg','solo','threat','arch','fav','danger'])assert.equal(o[key],null);
  assert.deepEqual(standardPicks(o.n),['','','','']);
  assert.ok(mutations.every(m=>!m.slots.some(slot=>eligibleMutation(m,o,'Female',slot))));
});
test('all species and mutations have scoped audit records, and disputed omnivores remain excluded',()=>{
  for(const profile of ['official','origin-main','origin-voice']){
    const audit=catalogAudit(profile);assert.equal(audit.length,roster.length*mutations.length);
    assert.equal(new Set(audit.map(r=>r.species+'/'+r.mutation)).size,audit.length);
    for(const name of ['Gallimimus','Beipiaosaurus','Oviraptor'])for(const m of mutations.filter(m=>disputedOmnivoreMutations.has(m.n))){
      const d=roster.find(d=>d.n===name),record=catalogEligibility(m,d,profile);
      assert.equal(record.status,'unverified');assert.equal(record.build,'0.22.159');assert.equal(record.observedBuild,null);assert.match(record.buildScope,/reference only/);assert.ok(record.sources.every(s=>s.startsWith('https://')));
      assert.ok(m.slots.every(slot=>!eligibleMutation(m,d,'Female',slot)));
      assert.ok(catalogEntries(name,false,profile).includes(m));
    }
  }
});
test('All Mutations ignores dinosaur restrictions and historical entries remain unselectable',()=>{
  assert.deepEqual(catalogEntries(),mutations);
  const galli=roster.find(d=>d.n==='Gallimimus');
  assert.ok(catalogEntries(galli.n).length<mutations.length);
  assert.equal(catalogEntries(galli.n,true).length,mutations.length);
  for(const m of mutations.filter(m=>removedMutations.has(m.n))){
    assert.equal(catalogEligibility(m,galli).status,'historical');
    assert.ok(!eligibleMutation(m,galli,'Male',1));
  }
  assert.ok(!mutations.some(m=>m.n==='NHJ'));
});
test('single-lineage duplicates still deduplicated; nesting changes are documented not fabricated',()=>{
  const lives=emptyLineage();lives[0].picks[0]='Cellular Regeneration';lives[1].picks[1]='Cellular Regeneration';
  const result=activeAt(lives,2);assert.equal(result.active.length,1);assert.equal(result.duplicates.length,1);
  assert.match(sources.official159.claim,/duplicate/);assert.match(sources.official157.claim,/parental Entomb levels/);
});
