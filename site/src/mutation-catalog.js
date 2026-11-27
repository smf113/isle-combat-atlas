/** Read-only catalog. Never writes to the build, lineage or matchup state. */
import {roster,mutations,contexts,availabilityReason,removedMutations,historicalRemoval,disputedOmnivoreMutations} from './data.js';
import {activeProfile,PUBLIC_PATCH} from './profiles.js';
export function catalogEligibility(m,d,profile='official'){
  const server=profile==='official'?'Official EVRIMA':profile==='origin-main'?'ORIGIN Main':'ORIGIN Voice Chat';
  const common={species:d.n,build:PUBLIC_PATCH,buildScope:'Public patch reference only; exact observed server build unknown',observedBuild:null,server,sex:m.sex,slots:[...m.slots],unlock:m.unlock|| (m.cat==='Unlockable'?'In-game unlock required; exact condition unverified':'No documented unlock in the retained catalog'),inheritance:['Parthenogenesis','Sequential Hermaphroditism'].includes(m.n)?'Reported not inherited by hatchlings':'Hatchling assignment and slot rules unverified; 0.22.159 prevents duplicate parental copies',note:m.note||'',sources:m.n==='Traumatic Thrombosis'?['https://steamcommunity.com/games/TheIsle/announcements/detail/679628250084806361','https://isla-sonora.com/docs/mutations?_locale=en']:m.n==='Intraspecific Aggression'?['https://www.evrimaquickguide.com/gameplay/health-statuses/mutations']:['https://isla-sonora.com/docs/mutations?_locale=en','https://www.evrimaquickguide.com/gameplay/health-statuses/mutations',...(['Xerocole Adaptation','Hematophagy'].includes(m.n)?['https://store.steampowered.com/news/app/376210/view/672886171588625748']:[])],evidenceNeeded:'Build-stamped menu for this species, server, sex, growth/Prime, all slots and unlock states; nested/Entomb tier if applicable.'};
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
// Presentation only: historical numbers, disputed thresholds and eligibility evidence
// stay on Sources & Methodology. catalogEntries and the shared build rules are unchanged.
const playerEffects={
  'Accelerated Prey Drive':'More damage to low-health targets.',
  'Efficient Digestion':'Food drains more slowly.',
  'Sustained Hydration':'Water drains more slowly.',
  'Sequential Hermaphroditism':'Allows the dinosaur to change sex.',
  'Parthenogenesis':'Allows nesting without a mate.'
};
const playerEffect=m=>playerEffects[m.n]||m.effect.replace(/^\d+% /,'').replace(/^./,x=>x.toUpperCase());
export function playerCatalogEntries(species='',profile='official'){
  const d=roster.find(x=>x.n===species);
  return catalogEntries(species,false,profile).filter(m=>!removedMutations.has(m.n)&&(!d||catalogEligibility(m,d,profile).status==='reported'));
}
export function initMutationCatalog(root){
  const $=id=>root.querySelector('#'+id),species=$('mutationSpecies'),search=$('mutationSearch'),filter=$('mutationFilter'),list=$('mutationList'),context=$('mutationContext');
  roster.forEach(d=>species.add(new Option(d.n,d.n)));
  function render(){
    const q=search.value.trim().toLowerCase(),f=filter.value;
    const entries=playerCatalogEntries(species.value,activeProfile().id).filter(m=>(f==='all'||m.cat===f||m.tags.includes(f))&&(!q||[m.n,playerEffect(m)].join(' ').toLowerCase().includes(q)));
    context.textContent=entries.length+' mutations';
    list.replaceChildren();
    for(const m of entries){
      const card=document.createElement('article');card.className='mutation-card';
      const restrictions=[
        !disputedOmnivoreMutations.has(m.n)&&m.diet!=='Any'?m.diet:'',
        m.sex!=='Any'?m.sex+' only':'',
        m.slots.length!==4?'Slots '+m.slots.join(', '):'',
        m.cat==='Unlockable'?'Unlock required':''
      ].filter(Boolean);
      card.innerHTML='<strong>'+esc(m.n)+'</strong><p class="muted">'+esc(playerEffect(m))+'</p>'+
        (restrictions.length?'<p class="muted">'+esc(restrictions.join(' · '))+'</p>':'');
      list.appendChild(card);
    }
  }
  species.addEventListener('change',()=>{search.value='';filter.value='all';render();});
  search.addEventListener('input',render);filter.addEventListener('change',render);
  window.addEventListener('atlas:profile-change',render);render();
}
