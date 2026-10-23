import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dinos} from '../site/src/data.js';
import {emptyLineage,MAX_GENERATION,normalizeGeneration} from '../site/src/entomb-model.js';
import {DEFAULT_SIDE,resolveSide,standardPicks,extractLineageLink,normalizeLineage,compareAcrossGrowth,calculateMatchup,advantagePosition} from '../site/src/matchup-model.js';
const side=(dino='Allosaurus',props={})=>({...DEFAULT_SIDE(dino),...props});
const lineage=g=>({v:1,dino:'Allosaurus',sex:'Male',generation:g,contexts:[],lives:emptyLineage()});
test('standard non-Prime picks never create optional-slot warnings (22 species, both sexes)',()=>{
 assert.equal(dinos.length,22);
 for(const d of dinos)for(const sex of ['Male','Female']){
  const base=resolveSide(side(d.n,{sex,prime:false}));
  assert.equal(base.invalidSelections.length,0,d.n+'/'+sex);
  assert.equal(base.active.length,3);
  assert.equal(standardPicks(d.n,sex).length,4);
  const prime=resolveSide(side(d.n,{sex,prime:true}));
  assert.equal(prime.invalidSelections.length,0);assert.equal(prime.active.length,4);
 }
});
test('retained fourth pick remains excluded without Prime and counts once on reactivation',()=>{
 const picks=['Hemomania','Hypermetabolic Inanition','Epidermal Fibrosis','Accelerated Prey Drive'];
 const p=side('Allosaurus',{source:'manual',prime:false,manual:picks});
 assert.equal(resolveSide(p).active.length,3);
 assert.match(resolveSide(p).invalidSelections[0].reason,/Prime/);
 assert.equal(resolveSide({...p,prime:true}).active.length,4);
 const duplicate=resolveSide({...p,prime:true,manual:[...picks.slice(0,2),'Accelerated Prey Drive','Accelerated Prey Drive']});
 assert.equal(duplicate.active.filter(v=>v.name==='Accelerated Prey Drive').length,1);
 assert.match(duplicate.invalidSelections[0].reason,/duplicate/);
});
test('invalid sex, unknown, duplicate saved mutations show reasons and never score',()=>{
 const p=side('Allosaurus',{source:'manual',sex:'Male',manual:['Hemomania','Parthenogenesis','Hemomania','Restored Unknown Mutation']});
 const before=JSON.stringify(p);const res=resolveSide(p);
 assert.deepEqual(res.invalidSelections.map(x=>x.slot),[2,3,4]);
 assert.deepEqual(res.invalidSelections.map(x=>x.reason),['not eligible for this dinosaur, sex or slot','duplicate mutation','unknown mutation']);
 assert.equal(JSON.stringify(p),before);
});
test('lineage generation normalization consistent for malformed numeric/optional inputs',()=>{
 for(const [g,expected] of [[1.5,1],[2.9,2],[undefined,1],[null,1],['nonsense',1],[-99,1],[999,MAX_GENERATION],['4',4]]){
  assert.equal(normalizeGeneration(g),expected);
  assert.equal(normalizeLineage(lineage(g)).generation,expected);
  assert.equal(extractLineageLink('#lineage='+encodeURIComponent(JSON.stringify(lineage(g)))).generation,expected);
  assert.equal(resolveSide(side('Allosaurus',{source:'lineage',lineage:lineage(g),generation:g})).generation,expected);
 }
 const bad=lineage(1);bad.lives[2].picks='not an array';
 assert.equal(normalizeLineage(bad),null);
 assert.throws(()=>extractLineageLink('#lineage='+encodeURIComponent(JSON.stringify(bad))));
});
test('A/B swap remains reciprocal and mirrored; 50% row with fixed B preserved',()=>{
 const a=side('Allosaurus',{source:'none'}),b=side('Ceratosaurus',{source:'none'});
 const ab=calculateMatchup(a,b,{bBleeding:true}),ba=calculateMatchup(b,a,{aBleeding:true});
 assert.ok(Math.abs(ab.adjusted*ba.adjusted-1)<1e-9);
 assert.ok(Math.abs(advantagePosition(ab.adjusted)+advantagePosition(ba.adjusted)-100)<1e-9);
 const rows=compareAcrossGrowth(a,b,{});
 assert.deepEqual(rows.map(r=>r.growth),[25,35,45,50,55,65,75,87,100]);
 assert.ok(rows.every(r=>r.b.growth===100));
});
const releaseFiles=()=>({
  pkg:JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8')),
  index:readFileSync(new URL('../site/index.html',import.meta.url),'utf8'),
  log:readFileSync(new URL('../site/changelog.html',import.meta.url),'utf8')
});
const attribute=(tag,name)=>tag.match(new RegExp('\\\\b'+name+'="([^"]*)"'))?.[1];
function verifyRelease({pkg,index,log}){
  const version=pkg.version;
  assert.match(version,/^\\d+\\.\\d+\\.\\d+$/,'Package must use semantic major.minor.patch format');
  // Constrain version checks to the actual footer anchor, not a random mention elsewhere.
  const footer=index.match(/<footer\\b[^>]*>([\\s\\S]*?)<\\/footer>/i)?.[1];
  assert.ok(footer,'Expected the site footer');
  const anchor=footer.match(/<a\\b(?=[^>]*\\bid="siteVersion")[^>]*>[\\s\\S]*?<\\/a>/i)?.[0];
  assert.ok(anchor,'Expected #siteVersion anchor in footer');
  assert.equal(attribute(anchor,'href'),'./changelog.html');
  assert.equal(attribute(anchor,'aria-label'),`View changelog for version ${version}`);
  assert.equal(anchor.replace(/<[^>]*>/g,'').trim(),`Version ${version} · Changelog`);
  // Only the first release section is authoritative. Historical entries cannot mask staleness.
  const firstReleaseHeading=log.match(/<section\\b[^>]*class="detail-card"[^>]*>\\s*<h2\\b[^>]*>([^<]*)<\\/h2>/i)?.[1];
  assert.ok(firstReleaseHeading,'Expected first release heading in changelog');
  const latest=firstReleaseHeading.match(/^Version (\\d+\\.\\d+\\.\\d+) — (.+)$/);
  assert.ok(latest,'Expected a version and date in first release heading');
  assert.equal(latest[1],version,'Latest changelog heading must match package.json');
  assert.match(latest[2],/^(January|February|March|April|May|June|July|August|September|October|November|December) \\d{1,2}, \\d{4}$/);
  const snapshot=log.match(/<strong>Gameplay-data snapshot: ([^<]+)<\\/strong>/)?.[1];
  assert.equal(snapshot,'September 2026.','Gameplay snapshot is not tied to application release date');
  return version;
}
test('package version matches footer text, accessible name, linked changelog and latest heading',()=>{
  const files=releaseFiles();
  assert.equal(verifyRelease(files),files.pkg.version);
});
test('release checks reject stale footer labels, accessible names and historical-entry false positives',()=>{
  const files=releaseFiles(),version=files.pkg.version;
  assert.throws(()=>verifyRelease({...files,index:files.index.replace(
    `Version ${version} · Changelog`, 'Version 0.0.0 · Changelog'
  )}),/Version/);
  assert.throws(()=>verifyRelease({...files,index:files.index.replace(
    `View changelog for version ${version}`, 'View changelog for version 0.0.0'
  )}),/version/);
  assert.throws(()=>verifyRelease({...files,index:files.index.replace(
    'href="./changelog.html" id="siteVersion"', 'href="./missing.html" id="siteVersion"'
  )}),/changelog/);
  assert.throws(()=>verifyRelease({...files,log:files.log.replace(
    `<h2>Version ${version} —`, '<h2>Version 0.0.0 —'
  )}),/Latest changelog/);
  assert.throws(()=>verifyRelease({...files,log:files.log.replace(
    'Gameplay-data snapshot: September 2026.','Gameplay-data snapshot:'
  )}),/Gameplay snapshot/);
});
