/** Read-only catalog. Never writes to the build, lineage or matchup state. */
import {roster,mutations,contexts,availabilityReason,removedMutations,historicalRemoval,disputedOmnivoreMutations} from './data.js';
import {activeProfile,PUBLIC_PATCH} from './profiles.js';
export function catalogEligibility(m,d,profile='official'){
  const server=profile==='official'?'Official EVRIMA':profile==='origin-main'?'ORIGIN Main':'ORIGIN Voice Chat';
  const common={species:d.n,build:PUBLIC_PATCH,server,sex:m.sex,slots:[...m.slots],unlock:m.unlock|| (m.cat==='Unlockable'?'In-game unlock required; exact condition unverified':'No documented unlock in the retained catalog'),inheritance:['Parthenogenesis','Sequential Hermaphroditism'].includes(m.n)?'Reported not inherited by hatchlings':'Hatchling assignment and slot rules unverified; 0.22.159 prevents duplicate parental copies',sources:['Isla Sonora','Evrima Quick Guide']};
  if(removedMutations.has(m.n))return {...common,status:'historical',reason:'Removed '+historicalRemoval(m.n)+'; not selectable'};
  if(d.diet==='Omnivore'&&disputedOmnivoreMutations.has(m.n))return {...common,status:'unverified',reason:'Isla Sonora includes omnivores; Quick Guide says herbivores only. No '+server+' 0.22.159 menu proof; not selectable.'};
  if(d.catalogOnly)return {...common,status:'unverified',reason:'New species; no '+server+' menu verification or model values. Not selectable.'};
  const allowed=m.slots.some(slot=>['Male','Female'].some(sex=>!availabilityReason(m,d,sex,slot)));
  return {...common,status:allowed?'reported':'excluded',reason:allowed?'Community-reported model pool; '+server+' current menu and unlock not independently verified.':'Excluded by conservative catalog diet/species rules; not proof of actual in-game absence.'};
}
export const catalogAudit=(profile='official')=>roster.flatMap(d=>mutations.map(m=>({mutation:m.n,...catalogEligibility(m,d,profile)})));
export function catalogEntries(species='',showExcluded=false,profile='official'){
  const d=roster.find(x=>x.n===species);
  return mutations.filter(m=>!d||showExcluded||catalogEligibility(m,d,profile).status!=='excluded');
}
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const anchor=n=>'mutation-'+n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function initMutationCatalog(root){
  const $=id=>root.querySelector('#'+id),species=$('mutationSpecies'),show=$('mutationShowExcluded'),search=$('mutationSearch'),filter=$('mutationFilter'),list=$('mutationList'),context=$('mutationContext');
  roster.forEach(d=>species.add(new Option(d.n,d.n)));
  function render(){
    const d=roster.find(x=>x.n===species.value),profile=activeProfile(),q=search.value.trim().toLowerCase(),f=filter.value;
    show.disabled=!d;
    const entries=catalogEntries(species.value,show.checked,profile.id).filter(m=>(f==='all'||m.cat===f||m.tags.includes(f))&&(!q||[m.n,m.effect,m.note,m.unlock].join(' ').toLowerCase().includes(q)));
    context.innerHTML='<strong>'+esc(d?'Mutation evidence for '+d.n:'All Mutations — no dinosaur selected')+'</strong><p class="muted">'+entries.length+' of '+mutations.length+' catalog entries · '+esc(profile.name)+' · Public patch reference '+PUBLIC_PATCH+'. '+(profile.id==='official'?'Current official menus not verified.':'No verified ORIGIN overrides or patch parity; no eligibility is promoted by the server overlay.')+'</p>';
    list.replaceChildren();
    for(const m of entries){
      const card=document.createElement('article');card.className='mutation-card';
      const rows=roster.map(s=>catalogEligibility(m,s,profile.id)),row=d?rows.find(x=>x.species===d.n):null;
      const grouped=['reported','unverified','excluded','historical'].map(status=>{const names=rows.filter(x=>x.status===status).map(x=>x.species);return names.length?'<p><strong>'+esc(({reported:'Community-reported pool',unverified:'Unverified — not selectable',excluded:'Model-excluded',historical:'Historical only'})[status])+'</strong>: '+esc(names.join(', '))+'</p>':'';}).join('');
      card.innerHTML='<div class="flex justify-between gap-2"><strong>'+esc(m.n)+'</strong><span class="pill">'+esc(m.cat)+'</span></div><p class="muted">'+esc(m.effect)+'</p>'+
        (removedMutations.has(m.n)?'<p class="muted">REMOVED '+historicalRemoval(m.n)+' · historical reference only</p>':'')+
        (row?'<p><strong>'+esc(row.status==='reported'?'Community-reported':row.status==='unverified'?'Unverified — not selectable':row.status==='excluded'?'Model-excluded':'Historical only')+'</strong>: '+esc(row.reason)+'</p>':'<details><summary>Species eligibility (all 23 roster entries)</summary>'+grouped+'</details>')+
        '<p class="muted">Reported diet: '+esc(m.diet)+' · Sex: '+esc(m.sex)+' · Slots: '+esc(m.slots.join(', ')||'Unknown')+(m.slots.includes(4)?' (slot 4 requires Prime)':'')+'</p>'+
        (m.cat==='Unlockable'?'<p class="muted"><strong>Locked until in-game unlock:</strong> '+esc(m.unlock||'Exact condition unknown')+'; current threshold unverified.</p>':'')+
        (['Xerocole Adaptation','Hematophagy'].includes(m.n)?'<p class="muted">0.22.157 reports a value fix; current numeric values unknown.</p>':'')+
        (Object.keys(m.ctx).length?'<p class="muted">Situational: '+esc(Object.keys(m.ctx).map(k=>contexts[k]).join(', '))+'</p>':'')+
        '<p class="muted">Inheritance: '+esc(rows[0].inheritance)+'</p>'+
        (m.note?'<p class="muted">'+esc(m.note)+'</p>':'')+
        '<a href="./sources.html#'+anchor(m.n)+'">Inspect evidence</a>';
      list.appendChild(card);
    }
  }
  species.addEventListener('change',()=>{show.checked=false;search.value='';filter.value='all';render();});
  show.addEventListener('change',render);search.addEventListener('input',render);filter.addEventListener('change',render);
  window.addEventListener('atlas:profile-change',render);render();
}
