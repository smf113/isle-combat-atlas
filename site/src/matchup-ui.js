/** Independent 1v1 calculator: shareable A/B builds with Entomb lineage imports. */
import {dinos,mutations,presets} from './data.js';
import {eligible,tierEffect,byName,MAX_GENERATION} from './entomb-model.js';
import {DEFAULT_SIDE,SCENARIO_DEFAULT,calculateMatchup,compareAcrossGrowth,extractLineageLink,validLineage,SLOT_GROWTH,standardPicks,advantagePosition} from './matchup-model.js';

const root=document.getElementById('origin-lab-v3'),panel=root?.querySelector('#tab-growth');
if(root&&panel){
  const storageKey='origin-matchup-calculator-v2',previousKey='origin-matchup-calculator-v1';
  const $=sel=>panel.querySelector(sel);
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const defaults=()=>({v:1,a:DEFAULT_SIDE('Allosaurus'),b:DEFAULT_SIDE('Ceratosaurus'),scenario:{...SCENARIO_DEFAULT}});
  let state=defaults(),info='';
  const planCopy=x=>JSON.parse(JSON.stringify(x));
  const sanitizeSide=x=>{
    const dino=dinos.some(d=>d.n===x?.dino)?x.dino:'Allosaurus';
    const side={...DEFAULT_SIDE(dino),source:['none','standard','manual','lineage'].includes(x?.source)?x.source:'standard',sex:x?.sex==='Female'?'Female':'Male',growth:Math.max(25,Math.min(100,Math.round(Number(x?.growth)||100))),prime:!!x?.prime,manual:Array.from({length:4},(_,i)=>typeof x?.manual?.[i]==='string'?x.manual[i].slice(0,128):''),generation:Math.max(1,Math.min(MAX_GENERATION,Math.trunc(Number(x?.generation)||1)))};
    if(validLineage(x?.lineage)&&x.lineage.dino===side.dino)side.lineage=planCopy(x.lineage);
    if(side.source==='lineage'&&!side.lineage)side.source='none';
    return side;
  };
  const restore=x=>{
    if(!x||x.v!==1)return false;
    state={v:1,a:sanitizeSide(x.a),b:sanitizeSide(x.b),scenario:Object.fromEntries(Object.keys(SCENARIO_DEFAULT).map(k=>[k,!!x.scenario?.[k]]))};return true;
  };
  const hashSnapshot=()=>{
    if(!location.hash.startsWith('#matchup='))return null;
    try{return JSON.parse(decodeURIComponent(location.hash.slice(9)))}catch{return null}
  };
  if(!restore(hashSnapshot())){
    try{
      const recent=localStorage.getItem(storageKey);
      if(recent)restore(JSON.parse(recent));
      else{
        const previous=JSON.parse(localStorage.getItem(previousKey));
        if(previous?.v===1){
          // Existing customized matchups and lineage imports survive migration.
          // The old untouched A/B unmutated initial state adopts new standard defaults.
          const oldFactory=previous.a?.dino==='Allosaurus'&&previous.b?.dino==='Ceratosaurus'&&
            ['a','b'].every(k=>previous[k]?.source==='none'&&previous[k]?.growth===100&&
              !previous[k]?.prime&&(!previous[k]?.manual||previous[k].manual.every(n=>!n)));
          if(restore(previous)&&oldFactory){state.a.source='standard';state.b.source='standard'}
        }
      }
    }catch{}
  }
  const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{}};
  function sideControls(key,name){
    const s=state[key],result=calculateMatchup(state.a,state.b,state.scenario)[key];
    const plan=s.source==='lineage'?s.lineage:null;
    const size=plan?plan.lives[s.generation-1]?.prime:false;
    const prime=s.source==='lineage'?size:s.prime;
    const standard=s.source==='standard'?standardPicks(s.dino,s.sex):null;
    const substituted=standard?.some((n,i)=>n!==presets[result.d.arch]?.[i]);
    const pool=(slot,selected)=>mutations.filter(m=>eligible(m,result.d,s.sex,slot) &&
      (m.n===selected || !s.manual.some((n,i)=>i!==slot-1&&n===m.n)))
      .sort((a,b)=>a.n.localeCompare(b.n)).map(m=>`<option value="${esc(m.n)}" ${m.n===selected?'selected':''}>${esc(m.n)}</option>`).join('');
    return `<article class="detail-card matchup-side" aria-label="${name} dinosaur configuration">
      <div class="matchup-side-heading"><span class="matchup-side-letter">${name}</span><strong>${esc(result.d.n)}</strong></div>
      <div class="matchup-fields">
        <label><span class="field-label">Dinosaur</span><select class="control w-full" data-side="${key}" data-field="dino">${dinos.map(d=>`<option ${d.n===s.dino?'selected':''}>${esc(d.n)}</option>`).join('')}</select></label>
        <label><span class="field-label">Mutation source</span><select class="control w-full" data-side="${key}" data-field="source"><option value="standard" ${s.source==='standard'?'selected':''}>Recommended standard build</option><option value="manual" ${s.source==='manual'?'selected':''}>Custom one-life build</option><option value="lineage" ${s.source==='lineage'?'selected':''}>Entomb lineage</option><option value="none" ${s.source==='none'?'selected':''}>Unmutated baseline</option></select></label>
        <label><span class="field-label">Growth · ${s.growth}%</span><input class="matchup-range" aria-label="${name} growth" data-side="${key}" data-field="growth" type="range" min="25" max="100" step="1" value="${s.growth}"></label>
        <label><span class="field-label">Sex</span><select class="control w-full" data-side="${key}" data-field="sex"><option ${s.sex==='Male'?'selected':''}>Male</option><option ${s.sex==='Female'?'selected':''}>Female</option></select></label>
      </div>
      ${s.source!=='lineage'?`<label class="matchup-check"><input type="checkbox" data-side="${key}" data-field="prime" ${prime?'checked':''}> Prime intended (4th slot becomes active at 75% growth)</label>`:''}
      ${s.source==='standard'?`<div class="matchup-standard"><div class="matchup-standard-heading"><strong>${esc(result.d.arch)} role preset</strong><button type="button" class="action-btn secondary" data-customize-standard="${key}">Customize build</button></div><p class="muted">Suggested choices, not automatically granted in-game. Unlock and growth requirements still apply.${substituted?' Ineligible or unavailable atlas picks were replaced with eligible alternatives.':''}</p><div class="matchup-standard-picks">${standard.slice(0,prime?4:3).map((n,i)=>`<span class="pill">S${i+1}: ${esc(n)}</span>`).join('')}</div></div>`:''}
      ${s.source==='manual'?`<div class="matchup-manual">${[1,2,3,4].map(slot=>`<label><span class="field-label">Mutation ${slot}${slot===4?' · Prime':''} · ~${SLOT_GROWTH[slot-1]}% growth</span><select class="control w-full" data-side="${key}" data-field="manual" data-slot="${slot}" ${slot===4&&!prime?'disabled':''}><option value="">— Empty —</option>${pool(slot,s.manual[slot-1])}</select></label>`).join('')}</div>`:''}
      ${s.source==='lineage'?`<div class="matchup-lineage-tools"><button type="button" class="action-btn secondary" data-import-planner="${key}">Import current Entomb Planner</button><label><span class="field-label">Or paste a copied lineage URL</span><input class="control w-full" data-paste-link="${key}" placeholder="Paste #lineage=... or shared website URL"></label><button type="button" class="action-btn secondary" data-import-link="${key}">Load pasted lineage</button></div>${plan?`<div class="matchup-lineage-meta"><span class="pill">Life ${s.generation}</span><span class="pill">${prime?'Prime life':'Normal life'}</span><span class="pill">${result.active.length} active now</span></div><label><span class="field-label">Entomb generation</span><select class="control w-full" data-side="${key}" data-field="generation">${Array.from({length:MAX_GENERATION},(_,i)=>`<option value="${i+1}" ${s.generation===i+1?'selected':''}>Life ${i+1}${i?' · '+i+' Entomb'+(i>1?'s':''):''}</option>`).join('')}</select></label>`:'<p class="muted">Import a lineage to activate inherited effects.</p>'}`:''}
      <div class="matchup-mutations"><div class="section-title">Active in this matchup</div><div class="chips mt-2">${result.active.map(x=>{const tier=tierEffect(x.name,result.generation);return `<span class="pill">${esc(x.name)}${tier?' · '+esc(tier.label):''}${x.inherited?' · inherited':''}</span>`}).join('')||'<span class="muted">No active mutations</span>'}</div>${result.pending.length?`<p class="muted mt-2">Not unlocked at ${result.growth}%: ${result.pending.map(x=>esc(x.name)).join(', ')}.</p>`:''}${result.sourceWarning?`<p class="muted">${esc(result.sourceWarning)}</p>`:''}${result.invalidSelections.length?`<div class="matchup-invalid" role="alert"><strong>Excluded selections (not counted):</strong><ul>${result.invalidSelections.map(x=>`<li>${esc(x.name)}${x.life?' (Life '+x.life+', slot '+x.slot+')':' (slot '+x.slot+')'}: ${esc(x.reason)}</li>`).join('')}</ul></div>`:''}${s.source!=='lineage'?`<p class="muted">Prime ${prime?'intended':'not selected'}; ${result.primeActive?'active now':'inactive at this growth'}. ${prime&&!result.primeActive?'Prime bonus and current-life fourth slot activate at 75% growth.':''}</p>`:prime&&!result.primeActive?'<p class="muted">Lineage Prime intended for this life; its bonus and newly earned fourth slot are inactive below 75%. Previously inherited slots remain usable.</p>':''}</div>
    </article>`;
  }
  const formatRatio=n=>Number(n).toFixed(2)+'×';
  function effectMarkup(fx,p){return `<div class="matchup-effect-col"><div class="section-title">${esc(p.d.n)}</div>${fx.events.length?fx.events.map(e=>`<div class="matchup-effect active"><strong>${esc(e.name)}</strong><div class="muted">${esc(e.note)} · Life ${p.generation}</div></div>`).join(''):'<p class="muted">No directly modeled combat mutation active.</p>'}${fx.exclusions.length?`<details class="matchup-exclusions"><summary>${fx.exclusions.length} conditional / unmodeled effect${fx.exclusions.length===1?'':'s'}</summary><ul>${fx.exclusions.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></details>`:''}</div>`}
  function renderResult(){
    const r=calculateMatchup(state.a,state.b,state.scenario);
    const tilt=advantagePosition(r.adjusted);
    $('#matchupResult').innerHTML=`<div class="matchup-verdict"><div><span class="field-label">Matchup assessment · equal player skill assumed</span><div class="matchup-verdict-title">${esc(r.category)}</div><div class="muted">${esc(r.a.d.n)} vs ${esc(r.b.d.n)} · relative combat-pressure index <strong>${formatRatio(r.adjusted)}</strong> (A ÷ B)</div></div><div class="matchup-verdict-metrics"><span class="pill">Baseline ${formatRatio(r.baseline)}</span><span class="pill">With modeled mutations ${formatRatio(r.adjusted)}</span></div></div>
      <div class="matchup-spectrum"><span>A advantage</span><div class="matchup-spectrum-track"><span class="matchup-spectrum-center"></span><span class="matchup-spectrum-marker" style="left:${tilt}%"></span></div><span>B advantage</span></div>
      <div class="muted matchup-qualifier">The marker is a relative heuristic, <strong>not a predicted win rate</strong>. Actual outcomes depend on player skill, attacks, terrain, positioning, bleed and stamina, most of which aren't measured here.</div>
      <div class="matchup-effect-grid">${effectMarkup(r.aFx,r.a)}${effectMarkup(r.bFx,r.b)}</div>
      <div class="matchup-qualifier"><strong>Existing matchup tendencies:</strong> ${esc(r.aCounter.factors.join('; ')||'No specific A-side matchup tag')}; ${esc(r.bCounter.factors.join('; ')||'no specific B-side matchup tag')}.</div>`;
    const rows=compareAcrossGrowth(state.a,state.b,state.scenario);
    $('#matchupGrowthCurve').innerHTML=rows.map(x=>`<div class="matchup-curve-row"><span>${x.growth}%</span><div class="matchup-curve-track"><span class="matchup-curve-marker" style="left:${advantagePosition(x.adjusted)}%"></span><i></i></div><strong>${formatRatio(x.adjusted)}</strong><span class="muted">${x.category}</span></div>`).join('');
    $('#matchupMethodNote').textContent=r.notes.join(' ');
  }
  function render(){
    $('#matchupSideA').innerHTML=sideControls('a','A');
    $('#matchupSideB').innerHTML=sideControls('b','B');
    $('#matchupConditions').innerHTML=[
      ['aBleeding','A is bleeding'],['bBleeding','B is bleeding'],['aLowHealth','A below 35% health'],['bLowHealth','B below 35% health']
    ].map(([k,label])=>`<label class="matchup-check"><input type="checkbox" data-condition="${k}" ${state.scenario[k]?'checked':''}> ${label}</label>`).join('');
    renderResult();$('#matchupStatus').textContent=info;
  }
  function persistRender(){save();render()}
  function importPlan(key,p){
    if(!validLineage(p)){info='That lineage is invalid. Open the Entomb Planner and save a lineage first.';render();return;}
    state[key]={...state[key],dino:p.dino,sex:p.sex==='Female'?'Female':'Male',source:'lineage',lineage:planCopy(p),generation:Math.max(1,Math.min(MAX_GENERATION,Number(p.generation)||1))};
    info=`Imported ${p.dino} Life ${state[key].generation} into side ${key.toUpperCase()}.`;persistRender();
  }
  panel.addEventListener('change',e=>{
    const t=e.target;
    if(t.matches('[data-condition]')){state.scenario[t.dataset.condition]=t.checked;info='';persistRender();return;}
    if(!t.matches('[data-side][data-field]'))return;
    const s=state[t.dataset.side],field=t.dataset.field;
    if(field==='dino'&&s.dino!==t.value){s.dino=t.value;s.lineage=null;s.manual=['','','',''];if(s.source==='lineage')s.source='standard';}
    else if(field==='source')s.source=t.value;
    else if(field==='growth')s.growth=Number(t.value);
    else if(field==='sex')s.sex=t.value;
    else if(field==='generation')s.generation=Number(t.value);
    else if(field==='prime'){s.prime=t.checked;}
    else if(field==='manual'){const slot=Number(t.dataset.slot);if(slot>=1&&slot<=4)s.manual[slot-1]=t.value;}
    info='';persistRender();
  });
  panel.addEventListener('click',async e=>{
    const p=e.target.closest('[data-import-planner]');if(p){
      try{
        const snapshot=window.originEntombPlanner?.getSnapshot?.();
        if(!snapshot)throw new Error('The live Entomb Planner is unavailable.');
        importPlan(p.dataset.importPlanner,snapshot);
      }catch{info='Could not read the current Entomb Planner. Open the planner and configure a lineage first.';render()}return;
    }
    const customize=e.target.closest('[data-customize-standard]');if(customize){
      const key=customize.dataset.customizeStandard,s=state[key];
      s.manual=standardPicks(s.dino,s.sex);s.source='manual';
      info=`${s.dino} standard mutation selections copied into editable slots.`;persistRender();return;
    }
    const l=e.target.closest('[data-import-link]');if(l){
      const key=l.dataset.importLink,entered=panel.querySelector(`[data-paste-link="${key}"]`)?.value;
      try{importPlan(key,extractLineageLink(entered))}catch(err){info=err.message;$('#matchupStatus').textContent=info}return;
    }
    if(e.target.closest('#matchupSwap')){[state.a,state.b]=[state.b,state.a];state.scenario={...state.scenario,aBleeding:state.scenario.bBleeding,bBleeding:state.scenario.aBleeding,aLowHealth:state.scenario.bLowHealth,bLowHealth:state.scenario.aLowHealth};info='Sides swapped.';persistRender();return;}
    if(e.target.closest('#matchupReset')){state=defaults();info='Calculator reset.';persistRender();return;}
    if(e.target.closest('#matchupShare')){
      const url=location.href.split('#')[0]+'#matchup='+encodeURIComponent(JSON.stringify(state));
      try{await navigator.clipboard.writeText(url);info='Matchup link copied. Both dinosaur builds and lineage generations are included.';$('#matchupShareFallback').classList.add('hidden');}
      catch{const fallback=$('#matchupShareFallback');fallback.value=url;fallback.classList.remove('hidden');fallback.focus();fallback.select();info='Copy the matchup link in the field below.';}
      $('#matchupStatus').textContent=info;
    }
  });
  window.addEventListener('hashchange',()=>{const s=hashSnapshot();if(s&&restore(s)){info='Shared matchup loaded.';persistRender();root.querySelector('[data-tab="growth"]')?.click()}});
  render();
  if(location.hash.startsWith('#matchup='))root.querySelector('[data-tab="growth"]')?.click();
}