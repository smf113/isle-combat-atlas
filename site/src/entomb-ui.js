/** Interactive 1–5 generation lineage planner. Baseline single-life score stays unchanged. */
import {contexts,dinos,mutations,weights,dimNames,dims,availabilityReason} from './data.js';
import {shareUrlWithProfile} from './profiles.js';
import {MAX_GENERATION,normalizeGeneration,NON_REPLICATING,emptyLineage,activeAt,capacityAt,byName,eligible,tierEffect,lineageFit} from './entomb-model.js';

const root=document.getElementById('origin-lab-v3');
const panel=document.getElementById('tab-entomb');
if(root&&panel){
  const $=sel=>panel.querySelector(sel);
  const storageKey='origin-entomb-lineage-v1';
  const state={generation:1,sex:'Male',lives:emptyLineage(),contexts:[],dino:'Allosaurus'};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const saved=()=>({v:1,dino:state.dino,generation:state.generation,sex:state.sex,lives:state.lives.map(l=>({prime:Boolean(l.prime),picks:[...l.picks]})),contexts:[...state.contexts]});
  // The live, validated planner is authoritative; browser storage is only a persistence cache.
  // Return a detached value so the A/B calculator cannot mutate the visible planner.
  window.originEntombPlanner=Object.freeze({getSnapshot:()=>JSON.parse(JSON.stringify(saved()))});
  function validPlan(x){return x&&x.v===1&&dinos.some(d=>d.n===x.dino)&&Array.isArray(x.lives)&&x.lives.length===MAX_GENERATION&&x.lives.every(l=>l&&Array.isArray(l.picks)&&l.picks.length===4);}
  function applyPlan(x){
    if(!validPlan(x))return false;
    // Prepare normalized values before changing the visible plan.
    const next={dino:x.dino,generation:normalizeGeneration(x.generation),sex:x.sex==='Female'?'Female':'Male',
      contexts:(Array.isArray(x.contexts)?x.contexts:[]).filter(c=>Object.hasOwn(contexts,c)),
      lives:x.lives.map(l=>({prime:!!l.prime,picks:l.picks.map(v=>typeof v==='string'?v.slice(0,128):'')}))};
    Object.assign(state,next);
    return true;
  }
  function persist(){try{localStorage.setItem(storageKey,JSON.stringify(saved()));}catch{}}
  function initial(){
    try{if(location.hash.startsWith('#lineage=')){
      const v=JSON.parse(decodeURIComponent(location.hash.slice(9)));
      if(applyPlan(v))return;
    }}catch(e){console.warn('Invalid lineage link',e)}
    try{const v=JSON.parse(localStorage.getItem(storageKey));applyPlan(v)}catch{}
  }
  initial();

  const getDino=()=>dinos.find(d=>d.n===state.dino)||dinos[0];
  function legalChoices(slot){return mutations.filter(m=>eligible(m,getDino(),state.sex,slot)).sort((a,b)=>a.n.localeCompare(b.n));}
  const allOtherNames=(generation,slot)=>state.lives.flatMap((life,index)=>{
    if(index+1>generation || index+1<generation-3)return [];
    return life.picks.filter((name,i)=>name && !(index+1===generation&&i+1===slot) && (index+1===generation||!NON_REPLICATING.has(name)));
  });
  function makeSelector(slot){
    const current=state.lives[state.generation-1],enabled=slot<4||current.prime;
    const selected=current.picks[slot-1]||'',blocked=new Set(allOtherNames(state.generation,slot));
    const options=legalChoices(slot).filter(m=>!blocked.has(m.n));
    const why=selected?availabilityReason(byName(selected),getDino(),state.sex,slot):'';
    const excluded=selected&&(why||blocked.has(selected));
    return `<label class="lineage-slot ${enabled?'':'lineage-disabled'}"><span class="field-label">Mutation slot ${slot}${slot===4?' · Prime':''}</span><select class="control w-full" data-lineage-slot="${slot}" ${enabled?'':'disabled'}><option value="">— Empty —</option>${excluded?`<option value="${esc(selected)}" selected>${esc(selected)} — EXCLUDED: ${esc(why||'duplicate retained mutation')}</option>`:''}${options.filter(m=>m.n!==selected||!excluded).map(m=>`<option value="${esc(m.n)}" ${m.n===selected?'selected':''}>${esc(m.n)}${m.tags.includes('Unlockable')?' ◇':''}</option>`).join('')}</select></label>`;
  }
  function chosenRows(active){return active.map(r=>{
    const t=tierEffect(r.name,state.generation),m=byName(r.name);
    const isNew=r.life===state.generation;
    return `<div class="lineage-chip ${isNew?'fresh':'inherited'}"><span class="lineage-chip-name">${esc(r.name)}</span><span class="lineage-chip-meta">${isNew?'New':'Retained'} · L${r.life}${t?' · '+t.label:''}${!t&&m?' · effect unverified':''}</span></div>`;
  }).join('')||'<span class="muted">Select a mutation to see your lineage.</span>'}
  function render(){
    const life=state.lives[state.generation-1],lineage=activeAt(state.lives,state.generation),cap=capacityAt(state.lives,state.generation),d=getDino();
    // Retained old identifiers may remain displayed, but cannot influence fit if unavailable or ineligible.
    const effective=lineage.active.filter(row=>eligible(byName(row.name),d,state.sex,row.slot));
    const metrics=lineageFit(effective,d,state.generation,state.contexts,cap,state.sex);
    $('#entombDino').innerHTML=dinos.map(x=>`<option ${x.n===state.dino?'selected':''}>${esc(x.n)}</option>`).join('');
    $('#entombSex').value=state.sex;
    $('#entombGenerations').innerHTML=Array.from({length:MAX_GENERATION},(_,i)=>{
      const g=i+1,l=state.lives[i],t=activeAt(state.lives,g),prime=l.prime;
      return `<button type="button" class="generation-step" data-generation="${g}" aria-pressed="${g===state.generation}"><span class="gnum">Life ${g}</span><strong>${t.active.length} mutations</strong><span class="muted">${g===1?'Starting life':g===5?'Rotating oldest':`${g-1} Entomb${g===2?'':'s'}`} · ${prime?'Prime':'Normal'}</span></button>`;
    }).join('');
    $('#entombPrime').checked=life.prime;
    $('#entombPicks').innerHTML=[1,2,3,4].map(makeSelector).join('');
    $('#entombMetrics').innerHTML=`<div class="lineage-metrics"><div><span class="muted block">Effective mutations</span><strong>${effective.length}<span class="muted">/${cap}</span></strong></div><div><span class="muted block">Retained from prior lives</span><strong>${effective.filter(r=>r.inherited).length}</strong></div><div><span class="muted block">Relative build fit</span><strong>${metrics.fit}<span class="muted">/100</span></strong></div></div>
      <div class="muted mt-2">Relative fit is an experimental role-weighted heuristic, not a combat win probability. It compares this ${d.arch} build with other ${cap}-slot combinations and credits verified Entomb bonuses.</div>`;
    $('#entombChipList').innerHTML=chosenRows(effective);
    $('#entombContexts').innerHTML=Object.entries(contexts).map(([k,v])=>`<button type="button" class="context-btn" data-lineage-context="${k}" aria-pressed="${state.contexts.includes(k)}">${esc(v)}</button>`).join('');
    const tier=state.generation>=3?'Life 3+':`Life ${state.generation}`;
    $('#entombTiers').innerHTML=`<div class="section-title">Mutation effectiveness · ${tier}</div><div class="muted mt-1">Exact percentages only where separately documented; other bonuses are deliberately not extrapolated.</div><div class="lineage-tier-list mt-3">${effective.map(r=>{
      const t=tierEffect(r.name,state.generation);
      return `<div class="lineage-tier-row"><span>${esc(r.name)} <span class="muted">(L${r.life})</span></span><strong>${t?t.label:'Not quantified'}</strong></div>`;
    }).join('')||'<span class="muted">No mutations selected.</span>'}</div>`;
    $('#entombNotes').innerHTML=[
      state.generation===1?'<span>Reach 100% growth to Entomb and start Life 2.</span>':`<span>Life ${state.generation}: inherited benefits are calculated at ${tier} effectiveness. Each new pick starts at this life’s tier.</span>`,
      lineage.dropped.length?`<span class="lineage-warning">${lineage.dropped.length} non-replicating mutation${lineage.dropped.length===1?'':'s'} did not carry over: ${lineage.dropped.map(x=>esc(x.name)).join(', ')}.</span>`:'',
      lineage.overwritten.length?`<span class="lineage-warning">Oldest lineage cohort rotated out: ${lineage.overwritten.map(x=>esc(x.name)).join(', ')}.</span>`:'',
      state.lives.slice(Math.max(0,state.generation-4),state.generation).some(l=>l.picks.some((n,i)=>n&&availabilityReason(byName(n),d,state.sex,i+1)))?`<span class="lineage-warning">One or more historical or ineligible picks are preserved but excluded from effective mutations. Inspect the selected slot and <a href="./sources.html">mutation evidence</a>.</span>`:'',
      lineage.duplicates.length?`<span class="lineage-warning">${lineage.duplicates.length} duplicate selection${lineage.duplicates.length===1?'':'s'} ignored. You cannot stack the same mutation twice.</span>`:'',
      metrics.unverified?`<span>${metrics.unverified} active mutation effect${metrics.unverified===1?'':'s'} lack verified numeric progression; base contribution is held constant.</span>`:'',
      `<span>Normal death breaks the lineage; Unofficial-server storage/restore features and game updates may affect actual behavior.</span>`
    ].filter(Boolean).map(s=>`<p>${s}</p>`).join('');
    $('#entombDimensions').innerHTML=dims.map(k=>{const v=metrics.stats[k],max=Math.max(1,...dims.map(x=>metrics.stats[x]));return `<div class="metric"><span>${esc(dimNames[k])}</span><span class="metric-track"><span class="metric-fill block" style="width:${Math.min(100,Math.round(v/max*100))}%"></span></span><strong>${v.toFixed(1)}</strong></div>`}).join('');
    $('#entombShareStatus').textContent='';
  }
  function update(){persist();render()}
  panel.addEventListener('change',e=>{
    if(e.target.matches('#entombDino')){state.dino=e.target.value;state.lives=emptyLineage();state.generation=1;
      const main=root.querySelector('#customDino');main.value=state.dino;main.dispatchEvent(new Event('change',{bubbles:true}));update();return;
    }
    if(e.target.matches('#entombSex')){state.sex=e.target.value;update();return}
    if(e.target.matches('#entombPrime')){state.lives[state.generation-1].prime=e.target.checked;if(!e.target.checked)state.lives[state.generation-1].picks[3]='';update();return}
    if(e.target.matches('[data-lineage-slot]')){state.lives[state.generation-1].picks[Number(e.target.dataset.lineageSlot)-1]=e.target.value;update()}
  });
  panel.addEventListener('click',async e=>{
    const gen=e.target.closest('[data-generation]');if(gen){state.generation=Number(gen.dataset.generation);update();return}
    const ctx=e.target.closest('[data-lineage-context]');if(ctx){const k=ctx.dataset.lineageContext;state.contexts=state.contexts.includes(k)?state.contexts.filter(v=>v!==k):[...state.contexts,k];update();return}
    if(e.target.closest('#entombImport')){
      state.dino=root.querySelector('#customDino').value;
      state.sex=root.querySelector('#sexSelect').value;
      const currentPrime=root.querySelector('.prime-btn[data-prime="true"]').getAttribute('aria-pressed')==='true';
      state.lives[0]={prime:currentPrime,picks:[1,2,3,4].map(i=>root.querySelector(`#slot${i}`).value)};
      state.generation=1;update();return;
    }
    if(e.target.closest('#entombExample')){
      state.lives=emptyLineage();state.lives.forEach((l,i)=>{l.prime=true;
        const taken=new Set(state.lives.slice(Math.max(0,i-3),i).flatMap(p=>p.picks.filter(n=>n&&!NON_REPLICATING.has(n))));
        [1,2,3,4].forEach((slot)=>{
          const w=weights[getDino().arch];
          const m=legalChoicesFor(getDino(),state.sex,slot).filter(x=>!taken.has(x.n)&&!NON_REPLICATING.has(x.n))
            .sort((a,b)=>dims.reduce((sum,k)=>sum+b.v[k]*w[k],0)-dims.reduce((sum,k)=>sum+a.v[k]*w[k],0))[0];
          if(m){l.picks[slot-1]=m.n;taken.add(m.n)}
        });
      });state.generation=4;update();return;
    }
    if(e.target.closest('#entombClear')){state.lives=emptyLineage();state.generation=1;state.contexts=[];update();return}
    if(e.target.closest('#entombShare')){
      const url=shareUrlWithProfile('lineage='+encodeURIComponent(JSON.stringify(saved())));
      try{await navigator.clipboard.writeText(url);$('#entombShareStatus').textContent='Lineage link copied.';$('#entombShareFallback').classList.add('hidden')}
      catch{$('#entombShareFallback').value=url;$('#entombShareFallback').classList.remove('hidden');$('#entombShareFallback').focus();$('#entombShareFallback').select();$('#entombShareStatus').textContent='Copy this link to open your lineage on another device.'}
    }
  });
  function legalChoicesFor(d,sex,slot){
    return mutations.filter(m=>eligible(m,d,sex,slot)).sort((a,b)=>a.n.localeCompare(b.n));
  }
  // The main app's dinosaur and sex selectors are canonical; mirror them without changing other tabs.
  const globalBadge=root.querySelector('#selectedBadge');
  new MutationObserver(()=>{const newName=globalBadge.textContent.trim();if(newName!==state.dino && dinos.some(d=>d.n===newName)){
    state.dino=newName;state.lives=emptyLineage();state.generation=1;update();
  }}).observe(globalBadge,{childList:true,subtree:true,characterData:true});
  root.querySelector('#sexSelect').addEventListener('change',()=>{if(state.sex!==root.querySelector('#sexSelect').value){state.sex=root.querySelector('#sexSelect').value;update()}});
  window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#lineage=')){
    try{if(applyPlan(JSON.parse(decodeURIComponent(location.hash.slice(9))))){
      const main=root.querySelector('#customDino');main.value=state.dino;main.dispatchEvent(new Event('change',{bubbles:true}));
      render();root.querySelector('[data-tab="entomb"]').click();
    }}catch(e){console.warn('Invalid lineage link',e)}
  }});
  render();
  if(location.hash.startsWith('#lineage=')){
    const main=root.querySelector('#customDino');main.value=state.dino;main.dispatchEvent(new Event('change',{bubbles:true}));
    root.querySelector('[data-tab="entomb"]').click();
  }
}