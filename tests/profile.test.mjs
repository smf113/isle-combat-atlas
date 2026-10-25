import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DEFAULT_PROFILE,PUBLIC_PATCH,profiles,resolveProfile,initialProfileId,profileIds} from '../site/src/profiles.js';
import {DEFAULT_SIDE,calculateMatchup} from '../site/src/matchup-model.js';
import {mutationEvidence,modelEvidence,sources,reviewDate,snapshotDate} from '../site/src/evidence.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('official public branch is the default and unknown contexts fail closed',()=>{
 assert.equal(DEFAULT_PROFILE,'official');assert.equal(PUBLIC_PATCH,'0.21.772');
 assert.deepEqual(profileIds,['official','origin-main','origin-voice']);
 assert.equal(initialProfileId(),'official');
 assert.equal(initialProfileId('?server=origin-main'),'origin-main');
 assert.equal(initialProfileId('?server=origin-voice','origin-main'),'origin-voice');
 assert.equal(initialProfileId('?server=unexpected','origin-voice'),'origin-voice');
 assert.equal(initialProfileId('','origin-main'),'origin-main');
 assert.equal(initialProfileId('','untrusted'),'official');
 assert.equal(resolveProfile('unexpected').id,'official');
 assert.equal(profiles[0].serverType,'official');
 for(const profile of profiles.slice(1)){
  assert.equal(profile.serverType,'unofficial');
  assert.equal(profile.growthMultiplier,5);
  assert.equal(profile.source,'https://playorigin.gg/');
  assert.match(profile.evidenceNote,/not change|does not change/);
 }
 assert.equal(profiles[0].growthMultiplier,null);
});
test('selected server contexts are presentation overlays, never unsupported combat modifiers',()=>{
 const a=DEFAULT_SIDE('Allosaurus'),b=DEFAULT_SIDE('Ceratosaurus');
 const before=JSON.stringify(calculateMatchup(a,b));
 for(const profile of profiles) {
  assert.ok(profile.description && profile.evidenceNote && profile.growthAdvice);
  assert.ok(!('damageMultiplier' in profile));
  assert.equal(JSON.stringify(calculateMatchup(a,b)),before);
 }
});
test('research scope retains original source date, cites last public patch, and avoids overriding community status',()=>{
 assert.equal(snapshotDate,'September 2026');
 assert.equal(reviewDate,'October 25, 2026');
 assert.equal(sources.official772.status,'official');
 assert.match(sources.official772.claim,/not establish|not.*validate/i);
 assert.equal(mutationEvidence.length,42);
 assert.equal(mutationEvidence.find(m=>m.name==='Traumatic Thrombosis').status,'official');
 assert.ok(modelEvidence.some(m=>m.id==='public-patch'&&m.refs.includes('official772')));
 assert.ok(modelEvidence.some(m=>m.id==='adult-power'&&m.status==='model-assumption'));
});
test('pages expose profile scope and share formats retain existing hash payloads',()=>{
 const index=read('site/index.html'),sourcesPage=read('site/sources.html');
 const app=read('site/src/app.js'),entomb=read('site/src/entomb-ui.js'),match=read('site/src/matchup-ui.js');
 assert.match(index, /data-server-profile/);
 assert.match(index, /data-profile-badge/);
 assert.match(index, /data-profile-grow-advice/);
 assert.match(index, /Evidence reviewed/);
 assert.match(sourcesPage, /data-server-profile/);
 assert.match(sourcesPage, /data-profile-evidence-note/);
 assert.match(read('site/src/sources-ui.js'), /mutationScope\(m\)/);
 for(const js of [app,entomb,match])assert.match(js, /shareUrlWithProfile/);
 assert.match(app, /'build='\+encodeURIComponent/);
 assert.match(entomb, /'lineage='\+encodeURIComponent/);
 assert.match(match, /'matchup='\+encodeURIComponent/);
 assert.ok(!index.includes('<span class="server-badge">ORIGIN</span>'));
});
