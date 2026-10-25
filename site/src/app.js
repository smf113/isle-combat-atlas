/** Browser application controller. Keeps gameplay data separate in data.js. */
import {contexts,mutations,dinos,weights,synergies,dims,dimNames,growthSteps,eligibleMutation,availabilityReason,removedMutations} from './data.js';
import {standardPicks} from './matchup-model.js';

  (()=>{
    const root=document.getElementById('origin-lab-v3'); if(!root||root.dataset.ready)return; root.dataset.ready='1';
    const activeContexts = new Set();

    let selected='Allosaurus',prime=false,growth=75,sex='Male';
    const maxCache=new Map();

    const byName=n=>mutations.find(m=>m.n===n), scoreDino=d=>d.solo*14+d.threat*6, ranked=()=>[...dinos].sort((a,b)=>scoreDino(b)-scoreDino(a)||b.kg-a.kg), fmtKg=v=>v>=1000?(v/1000).toFixed(v%1000?1:0)+' t':v+' kg';
    const chips=(a,c)=>a.length?a.map(x=>`<span class='pill ${c}'>${x}</span>`).join(''):`<span class='muted'>None I'd voluntarily choose.</span>`;
    const legal=(m,d,slot)=>eligibleMutation(m,d,sex,slot);
    const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const anchor=name=>'mutation-'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

    function contextBonus(m){let n=0;Object.entries(m.ctx).forEach(([k,v])=>{if(activeContexts.has(k))n+=v});return n;}
    function rawScore(d,names){let raw=0;const w=weights[d.arch];names.filter(Boolean).forEach(n=>{const m=byName(n);if(!m)return;let r=dims.reduce((s,k)=>s+m.v[k]*w[k],0);if(['Efficient Digestion','Sustained Hydration','Hematophagy','Xerocole Adaptation'].includes(n))r*=.82;r+=contextBonus(m)*.22;raw+=r});synergies.forEach(([a,b,x])=>{if(names.includes(a)&&names.includes(b))raw+=x});return raw;}
    function bestRaw(d){const slots=prime?4:3,key=[d.n,slots,sex,[...activeContexts].sort().join(',')].join('|');if(maxCache.has(key))return maxCache.get(key);const opts=[];for(let s=1;s<=slots;s++){opts.push(mutations.filter(m=>legal(m,d,s)).sort((a,b)=>(dims.reduce((z,k)=>z+b.v[k]*weights[d.arch][k],0)+contextBonus(b)*.22)-(dims.reduce((z,k)=>z+a.v[k]*weights[d.arch][k],0)+contextBonus(a)*.22)).slice(0,14));}let best=0;function go(i,p){if(i===slots){best=Math.max(best,rawScore(d,p));return;}opts[i].forEach(m=>{if(!p.includes(m.n))go(i+1,[...p,m.n])});}go(0,[]);maxCache.set(key,best||1);return best||1;}
    function evaluate(d,names){const used=new Set(),excluded=[];
    const active=(prime?names:names.slice(0,3)).map((n,i)=>{
      if(!n)return '';
      const m=byName(n),why=availabilityReason(m,d,sex,i+1)||(used.has(n)?'duplicate selection':'');
      if(why){excluded.push({name:n,slot:i+1,reason:why});return ''}
      used.add(n);return n;
    }),filled=active.filter(Boolean),raw=rawScore(d,active),max=bestRaw(d),complete=filled.length/(prime?4:3),score=Math.round(Math.max(0,Math.min(100,raw/max*100*complete)));const sums={off:0,def:0,sus:0,mob:0,util:0};filled.forEach(n=>{const m=byName(n);dims.forEach(k=>sums[k]+=m.v[k])});const pct={};dims.forEach(k=>pct[k]=Math.round(sums[k]/Math.max(1,filled.length)/5*100));const syn=[];synergies.forEach(([a,b,x,t])=>{if(active.includes(a)&&active.includes(b))syn.push(t)});const conditional=[];filled.forEach(n=>{const m=byName(n);if(Object.keys(m.ctx).length){const hits=Object.keys(m.ctx).filter(k=>activeContexts.has(k));conditional.push({name:n,active:hits.length>0,hits:hits.map(k=>contexts[k]),note:m.note})}});return {score,pct,syn,conditional,complete,excluded,active};}
    function procon(d,names,r){const p=[],c=[];const sorted=[...dims].sort((a,b)=>r.pct[b]-r.pct[a]);if(r.complete<1)c.push('The build is incomplete, so its fit score is intentionally capped.');sorted.slice(0,2).forEach(k=>{if(r.pct[k]>=55)p.push(`${dimNames[k]} is a clear strength (${r.pct[k]}).`)});sorted.slice(-2).forEach(k=>{if(r.pct[k]<35)c.push(`${dimNames[k]} is thin (${r.pct[k]}).`)});r.syn.forEach(x=>p.push(x));r.conditional.forEach(x=>{if(x.active)p.push(`${x.name} is currently receiving situational value: ${x.hits.join(', ')}.`);else c.push(`${x.name} is circumstantial and none of its relevant contexts are enabled.`)});if(d.arch==='bleed'&&!names.includes('Hemomania'))c.push('A bleed-oriented species is leaving obvious bleed synergy unused.');if(!p.length)p.push('Generalist configuration without one dominant strength.');if(!c.length)c.push('No obvious structural weakness detected.');return {p:[...new Set(p)].slice(0,6),c:[...new Set(c)].slice(0,6)};}

    function sync(name){selected=name;['buildDino','customDino','growthDino'].forEach(id=>root.querySelector('#'+id).value=name);root.querySelector('#selectedBadge').textContent=name;fillSelects();renderRankings();renderRankDetail();renderBuild();renderCustom();renderGrowth();renderMutations();}
    function setPrime(x){prime=x;if(prime&&growth<75)growth=75;root.querySelectorAll('.prime-btn').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.prime==='true')===prime)));root.querySelector('#primeNote').textContent=prime?'Prime · 4 active slots · eligible from 75% growth.':'Normal · 3 active mutation slots. Prime becomes eligible at 75% growth.';fillSelects();renderBuild();renderCustom();renderGrowth();renderMutations();}

    function renderContexts(){const box=root.querySelector('#contextButtons');box.innerHTML=Object.entries(contexts).map(([k,v])=>`<button type='button' class='context-btn' data-context='${k}' aria-pressed='${activeContexts.has(k)}'>${v}</button>`).join('');box.querySelectorAll('[data-context]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.context;activeContexts.has(k)?activeContexts.delete(k):activeContexts.add(k);maxCache.clear();renderContexts();renderCustom();renderMutations();}));}

    function renderRankings(){const q=root.querySelector('#dinoSearch').value.trim().toLowerCase(),diet=root.querySelector('#dietFilter').value,min=root.querySelector('#soloFilter').value==='all'?0:Number(root.querySelector('#soloFilter').value),all=ranked(),list=root.querySelector('#rankList');list.innerHTML='';all.filter(d=>(!q||`${d.n} ${d.role}`.toLowerCase().includes(q))&&(diet==='all'||d.diet===diet)&&d.solo>=min).forEach(d=>{const r=all.findIndex(x=>x.n===d.n)+1,b=document.createElement('button');b.type='button';b.className='rank-row';b.setAttribute('aria-current',String(d.n===selected));b.innerHTML=`<span class='rank-num'>${r}</span><span><strong>${d.n}</strong><span class='muted block'>${d.diet} · ${fmtKg(d.kg)} · ${d.role}</span></span><span class='score-wrap'><span class='flex justify-between text-xs'><span>Score</span><strong>${scoreDino(d)}</strong></span><span class='score-track block'><span class='score-fill block' style='width:${scoreDino(d)}%'></span></span></span><strong class='text-center'>${d.solo}/5</strong><strong class='text-center'>${d.threat}/5</strong>`;b.addEventListener('click',()=>sync(d.n));list.appendChild(b);});}
    function renderRankDetail(){const d=dinos.find(x=>x.n===selected);root.querySelector('#rankDetail').innerHTML=`<div class='flex flex-wrap justify-between gap-3'><div><div class='text-xl font-bold'>${d.n}</div><div class='muted'>${d.role} · ${fmtKg(d.kg)}</div></div><div class='text-right'><div class='text-2xl font-extrabold'>${scoreDino(d)}</div><div class='muted'>ORIGIN Solo Score</div></div></div><div class='grid md:grid-cols-2 gap-4 mt-4'><div><div class='section-title'>Reasonable adult targets</div><div class='chips mt-2'>${chips(d.fav,'good')}</div></div><div><div class='section-title'>Biggest threats</div><div class='chips mt-2'>${chips(d.danger,'danger')}</div></div></div>`;}
    function renderBuild(){const d=dinos.find(x=>x.n===selected),p=standardPicks(d.n,sex),active=prime?p:p.slice(0,3),ev=evaluate(d,p);root.querySelector('#buildDetail').innerHTML=`<div class='detail-card'><div class='flex flex-wrap justify-between gap-3'><div><div class='text-xl font-bold'>${d.n}</div><div class='muted'>Recommended natural-grow staging area</div></div><span class='pill'>${prime?'Prime · 4 slots':'Normal · 3 slots'}</span></div><div class='font-semibold mt-2'>${d.area}</div></div><div class='detail-card mt-3'><div class='flex flex-wrap justify-between gap-2'><div class='section-title'>Default ${d.arch} build</div><strong>${ev.score}/100 fit</strong></div><div class='chips mt-2'>${active.map((m,i)=>`<span class='pill'>S${i+1}: ${m}</span>`).join('')}</div><div class='muted mt-3'>This is the baseline combat/survival build. Situational alternatives can outperform it when you deliberately select a matching environment or objective in Custom Build.</div></div>`;}

    function fillSelects(){
      const d=dinos.find(x=>x.n===selected);
      root.querySelectorAll('.mutation-select').forEach(sel=>{
        const slot=Number(sel.dataset.slot),current=sel.value;
        sel.innerHTML="<option value=''>— Empty —</option>";
        mutations.filter(m=>legal(m,d,slot)).forEach(m=>sel.add(new Option(m.n+(m.tags.includes('Circumstantial')?' ◇':''),m.n)));
        if(current){
          if(![...sel.options].some(o=>o.value===current)){
            const why=availabilityReason(byName(current),d,sex,slot);
            sel.add(new Option(current+' — EXCLUDED: '+(why||'unavailable'),current));
          }
          sel.value=current;
        }
      });
      root.querySelector('#slot4').disabled=!prime;
      root.querySelector('#slot4Wrap').classList.toggle('disabled-slot',!prime);
    }
    function renderCustom(){const d=dinos.find(x=>x.n===selected),names=[1,2,3,4].map(i=>root.querySelector('#slot'+i).value),r=evaluate(d,names),pc=procon(d,r.active,r),label=r.score>=90?'Near-optimal fit':r.score>=75?'Strong fit':r.score>=60?'Good / specialized':r.score>=40?'Niche':'Low fit';root.querySelector('#customResult').innerHTML=`${r.excluded.length?`<div class='detail-card' role='alert'><strong>Excluded historical / invalid selections (not scored)</strong><ul>${r.excluded.map(x=>`<li>Slot ${x.slot}: ${esc(x.name)} — ${esc(x.reason)}. <a href='./sources.html#${anchor(x.name)}'>Evidence</a></li>`).join('')}</ul><p class='muted'>Clear or replace the value in its original slot. Saved identifiers are retained.</p></div>`:''}<div class='detail-card'><div class='score-hero'><div class='score-circle'><div class='score-number'>${r.score}</div><div class='muted'>/100 fit</div></div><div><div class='text-xl font-bold'>${label}</div><div class='muted'>Normalized against the strongest legal ${prime?'4':'3'}-slot ${d.arch} combination under your currently selected circumstances.</div></div></div><div class='mt-4'>${dims.map(k=>`<div class='metric'><span>${dimNames[k]}</span><span class='metric-track'><span class='metric-fill block' style='width:${r.pct[k]}%'></span></span><strong>${r.pct[k]}</strong></div>`).join('')}</div></div>${r.conditional.length?`<div class='detail-card mt-3'><div class='section-title'>Circumstantial mutation check</div>${r.conditional.map(x=>`<div class='mt-3 ${x.active?'context-hit':'context-miss'}'><strong>${x.name}</strong><div class='muted'>${x.active?'Active context: '+x.hits.join(', '):'No relevant situational context currently enabled.'}${x.note?' '+x.note:''}</div></div>`).join('')}</div>`:''}<div class='detail-card mt-3'><div class='procon'><div><div class='section-title'>Pros</div><ul>${pc.p.map(x=>`<li>${x}</li>`).join('')}</ul></div><div><div class='section-title'>Cons</div><ul>${pc.c.map(x=>`<li>${x}</li>`).join('')}</ul></div></div></div>`;}

    function maturity(g,usePrime){const lerp=(a,b,t)=>a+(b-a)*t,pts=[[25,.15],[35,.24],[45,.36],[55,.50],[65,.67],[75,.82],[87,.94],[100,1]];if(usePrime&&g>=75){const p=[[75,.90],[87,1.08],[100,1.02]];for(let i=1;i<p.length;i++)if(g<=p[i][0])return lerp(p[i-1][1],p[i][1],(g-p[i-1][0])/(p[i][0]-p[i-1][0]));return 1.02}for(let i=1;i<pts.length;i++)if(g<=pts[i][0])return lerp(pts[i-1][1],pts[i][1],(g-pts[i-1][0])/(pts[i][0]-pts[i-1][0]));return 1;}
    function adultPower(d){return 16+Math.log2(d.kg+20)*8+d.threat*11+d.solo*2}
    function matchup(d,o,g,mode){let r=adultPower(d)*maturity(g,prime&&g>=75)/(adultPower(o)*(mode==='same'?maturity(g,false):1));if(d.fav.includes(o.n))r*=1.16;if(d.danger.includes(o.n))r*=.80;return r>=1.08?'favored':r>=.88?'even':'avoid';}
    function renderGrowth(){const d=dinos.find(x=>x.n===selected),mode=root.querySelector('#opponentMode').value;root.querySelector('#growthButtons').innerHTML=growthSteps.map(g=>`<button type='button' class='growth-btn' data-growth='${g}' aria-pressed='${g===growth}'>${g}%</button>`).join('');root.querySelectorAll('[data-growth]').forEach(b=>b.addEventListener('click',()=>{growth=Number(b.dataset.growth);if(prime&&growth<75)setPrime(false);else renderGrowth();}));const f=maturity(growth,prime&&growth>=75),out=dinos.filter(o=>o.n!==d.n).map(o=>({n:o.n,c:matchup(d,o,growth,mode)})),fav=out.filter(x=>x.c==='favored').map(x=>x.n),even=out.filter(x=>x.c==='even').map(x=>x.n),avoid=out.filter(x=>x.c==='avoid').map(x=>x.n);root.querySelector('#growthStateNote').textContent=`Estimated combat maturity: ${Math.round(f*100)}% of the normal adult reference${prime&&growth>=75?' · Prime curve active':''}.`;root.querySelector('#growthSummary').innerHTML=`<div class='text-xl font-bold'>${d.n} · ${growth}%</div><div class='muted'>${mode==='adult'?'Compared with full adults':'Compared with opponents at the same growth percentage'}.</div><div class='section-title mt-4'>Favored</div><div class='chips mt-2'>${chips(fav,'good')}</div><div class='section-title mt-4'>Comparable</div><div class='chips mt-2'>${chips(even,'even')}</div><div class='section-title mt-4'>Avoid</div><div class='chips mt-2'>${chips(avoid,'danger')}</div>`;root.querySelector('#growthChart').innerHTML=growthSteps.map(g=>{const ff=maturity(g,prime&&g>=75),targets=dinos.filter(o=>o.n!==d.n&&matchup(d,o,g,mode)==='favored').map(o=>o.n);return `<div class='growth-row ${g===growth?'current':''}'><strong>${g}%</strong><div><div class='power-track'><span class='power-fill block' style='width:${Math.min(100,Math.round(ff*92))}%'></span></div><div class='muted mt-1'>Index ${Math.round(ff*100)}</div></div><div><strong class='text-sm'>Expected favorable targets</strong><div class='chips mt-1'>${targets.slice(0,9).map(x=>`<span class='pill'>${x}</span>`).join('')||`<span class='muted'>None reliably.</span>`}</div></div></div>`}).join('');}

    function renderMutations(){const d=dinos.find(x=>x.n===selected),q=root.querySelector('#mutationSearch').value.trim().toLowerCase(),f=root.querySelector('#mutationFilter').value,list=root.querySelector('#mutationList');root.querySelector('#mutationContext').innerHTML=`<div class='flex flex-wrap justify-between gap-2'><div><div class='section-title'>Mutation pool for ${d.n}</div><div class='muted'>Filtered by ${d.diet}${sex==='Female'?' · Female':' · Male'}. Circumstantial mutations show which context makes them valuable.</div></div><span class='pill'>${prime?'Prime · Slots 1–4':'Normal · Slots 1–3'}</span></div>`;list.innerHTML='';mutations.filter(m=>(removedMutations.has(m.n)||[1,2,3,4].some(slot=>legal(m,d,slot)))&&(f==='all'||m.cat===f||m.tags.includes(f))&&(!q||`${m.n} ${m.effect} ${m.note} ${m.unlock}`.toLowerCase().includes(q))).forEach(m=>{const active=Object.keys(m.ctx).filter(k=>activeContexts.has(k)),removed=removedMutations.has(m.n);const card=document.createElement('article');card.className='mutation-card';card.innerHTML=`<div class='flex justify-between gap-2'><strong>${esc(m.n)}</strong><span class='pill ${m.tags.includes('Circumstantial')?'circ':''}'>${m.cat}</span></div><div class='muted mt-2'>${esc(m.effect)}</div>${removed?"<div class='muted'>REMOVED 0.21.720 · historical reference only</div>":''}<div><a href='./sources.html#${anchor(m.n)}'>Inspect evidence</a></div><div class='chips mt-2'>${m.tags.map(t=>`<span class='pill'>${t}</span>`).join('')}<span class='pill'>Slots ${m.slots.filter(s=>prime||s<4).join(', ')||'Prime only'}</span>${m.sex!=='Any'?`<span class='pill'>${m.sex} only</span>`:''}</div>${Object.keys(m.ctx).length?`<div class='mt-3 ${active.length?'context-hit':'context-miss'}'><div class='muted'>Relevant when: ${Object.keys(m.ctx).map(k=>contexts[k]).join(', ')}.${active.length?' Active now: '+active.map(k=>contexts[k]).join(', ')+'.':''}</div></div>`:''}${m.unlock?`<div class='muted mt-2'><strong>Unlock (community report; verify in game):</strong> ${esc(m.unlock)}</div>`:''}${m.note?`<div class='muted mt-2'><strong>Note:</strong> ${m.note}</div>`:''}`;list.appendChild(card);});}

    function loadRecommended(){const d=dinos.find(x=>x.n===selected),p=standardPicks(d.n,sex);fillSelects();p.forEach((n,i)=>{if(i===3&&!prime)return;const s=root.querySelector('#slot'+(i+1));if([...s.options].some(o=>o.value===n))s.value=n});renderCustom();}
    function initSelects(){const options=ranked().map(d=>`<option value='${d.n}'>${d.n}</option>`).join('');['buildDino','customDino','growthDino'].forEach(id=>{root.querySelector('#'+id).innerHTML=options;root.querySelector('#'+id).value=selected});}

    root.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click',()=>{const t=b.dataset.tab;root.querySelectorAll('.tab-btn').forEach(x=>x.setAttribute('aria-selected',String(x===b)));root.querySelectorAll('.tab-panel').forEach(x=>x.classList.add('hidden'));root.querySelector('#tab-'+t).classList.remove('hidden');}));
    root.querySelectorAll('.prime-btn').forEach(b=>b.addEventListener('click',()=>setPrime(b.dataset.prime==='true')));
    ['buildDino','customDino','growthDino'].forEach(id=>root.querySelector('#'+id).addEventListener('change',e=>sync(e.target.value)));
    root.querySelector('#sexSelect').addEventListener('change',e=>{sex=e.target.value;maxCache.clear();fillSelects();renderCustom();renderMutations();});
    ['dinoSearch','dietFilter','soloFilter'].forEach(id=>root.querySelector('#'+id).addEventListener(id==='dinoSearch'?'input':'change',renderRankings));
    root.querySelectorAll('.mutation-select').forEach(s=>s.addEventListener('change',renderCustom));
    root.querySelector('#loadRecommended').addEventListener('click',loadRecommended);root.querySelector('#clearBuild').addEventListener('click',()=>{root.querySelectorAll('.mutation-select').forEach(s=>s.value='');renderCustom();});
    root.querySelector('#opponentMode').addEventListener('change',renderGrowth);root.querySelector('#mutationSearch').addEventListener('input',renderMutations);root.querySelector('#mutationFilter').addEventListener('change',renderMutations);

    initSelects();renderContexts();fillSelects();renderRankings();renderRankDetail();renderBuild();renderGrowth();renderMutations();loadRecommended();setPrime(false);

    // A build can travel between devices as a URL; localStorage only restores this browser.
    const storageKey='origin-evrima-build-lab-v1';
    function captureBuild(){return {v:1,d:selected,prime,sex,growth,contexts:[...activeContexts],slots:[1,2,3,4].map(i=>root.querySelector('#slot'+i).value)};}
    function validSnapshot(obj){return obj&&typeof obj==='object'&&dinos.some(d=>d.n===obj.d)&&Array.isArray(obj.slots);}
    function readSnapshot(){
      try {
        if(location.hash.startsWith('#build=')){
          const fromUrl=JSON.parse(decodeURIComponent(location.hash.slice(7)));
          if(validSnapshot(fromUrl))return fromUrl;
        }
      } catch(e){console.warn('Invalid shared build link',e);}
      try {const local=JSON.parse(localStorage.getItem(storageKey));return validSnapshot(local)?local:null;}
      catch {return null;}
    }
    function restoreBuild(s){
      if(!validSnapshot(s))return;
      sex=s.sex==='Female'?'Female':'Male';root.querySelector('#sexSelect').value=sex;
      growth=growthSteps.includes(s.growth)?s.growth:75;
      activeContexts.clear();(Array.isArray(s.contexts)?s.contexts:[]).filter(k=>Object.hasOwn(contexts,k)).forEach(k=>activeContexts.add(k));
      maxCache.clear();renderContexts();sync(s.d);setPrime(Boolean(s.prime)&&growth>=75);
      s.slots.slice(0,4).forEach((n,i)=>{
        const sel=root.querySelector('#slot'+(i+1));
        if(typeof n==='string'&&n){
          if(![...sel.options].some(o=>o.value===n)){
            const d=dinos.find(x=>x.n===selected),why=availabilityReason(byName(n),d,sex,i+1);
            sel.add(new Option(n+' — EXCLUDED: '+(why||'unavailable'),n));
          }
          sel.value=n;
        }
      });
      renderCustom();
    }
    function saveBuild(){try {localStorage.setItem(storageKey,JSON.stringify(captureBuild()));}catch{}}
    root.querySelector('#shareBuild').addEventListener('click',async()=>{
      const u=location.href.split('#')[0]+'#build='+encodeURIComponent(JSON.stringify(captureBuild()));
      const status=root.querySelector('#shareStatus');const fallback=root.querySelector('#shareFallback');
      try {await navigator.clipboard.writeText(u);status.textContent='Build link copied. Open it on any device.';fallback.classList.add('hidden');}
      catch {fallback.value=u;fallback.classList.remove('hidden');fallback.focus();fallback.select();status.textContent='Copy this link to share or open on another device.';}
    });
    const prior=readSnapshot();if(prior)restoreBuild(prior);
    if(location.hash.startsWith('#build='))root.querySelector('[data-tab="custom"]').click();
    ['click','change','input'].forEach(type=>root.addEventListener(type,saveBuild));
    window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#build=')){const s=readSnapshot();if(s)restoreBuild(s);}});

  })();
