/**
 * Site-wide context selector. Public branch evidence is the starting reference,
 * not proof that archived heuristic combat data matches the live game.
 * Server overlays describe only published features; they never modify damage.
 */
export const PUBLIC_PATCH = '0.21.772';
export const DEFAULT_PROFILE = 'official';
export const PROFILE_STORAGE = 'isle-atlas-profile-v1';
export const profiles = Object.freeze([
  Object.freeze({
    id: 'official', name: 'Official EVRIMA', badge: 'Official EVRIMA',
    growth: 'Standard growth', rules: 'Public branch',
    description: 'Public EVRIMA branch 0.21.772 is the latest published patch identified in this review. Exact combat and mutation values are not all verified for that patch.',
    growthAdvice: 'Use the normal in-game progression and verify migration, diets and mutation unlocks in the current client. The Atlas does not model growth duration.',
    evidenceNote: 'Public patch announcements establish release changes, but the Atlas combat ratings and most catalog details remain archival or community-reported; they are not official balance telemetry.',
    source: 'https://steamcommunity.com/games/TheIsle/announcements/',
    serverType: 'official', growthMultiplier: null
  }),
  Object.freeze({
    id: 'origin-main', name: 'ORIGIN Main', badge: 'ORIGIN Main',
    growth: '5× growth', rules: 'No rules',
    description: 'Unofficial ORIGIN Main server profile. ORIGIN publishes 5× growth, instant grows, dinosaur storage, a custom mod and no mixpacking/overpacking rules.',
    growthAdvice: 'ORIGIN advertises 5× growth, instant grows and dinosaur storage. Server features and exact current mechanics must be checked in-game.',
    evidenceNote: 'ORIGIN publishes custom server features, but the site has no independently verified ORIGIN mutation overrides, exact combat values or patch parity. The underlying Atlas model does not change.',
    source: 'https://playorigin.gg/',
    serverType: 'unofficial', growthMultiplier: 5
  }),
  Object.freeze({
    id: 'origin-voice', name: 'ORIGIN Voice Chat', badge: 'ORIGIN Voice',
    growth: '5× growth', rules: 'Proximity voice',
    description: 'Unofficial ORIGIN Voice Chat profile. ORIGIN publishes the shared custom mod and 5× growth, proximity voice chat, and apex population controls.',
    growthAdvice: 'ORIGIN advertises 5× growth, instant grows and dinosaur storage on its voice server, plus proximity voice chat and apex population controls.',
    evidenceNote: 'ORIGIN publishes custom server features, but the site has no independently verified ORIGIN mutation overrides, exact combat values or patch parity. The underlying Atlas model does not change.',
    source: 'https://playorigin.gg/',
    serverType: 'unofficial', growthMultiplier: 5
  })
]);
export const profileIds = profiles.map(p=>p.id);
export const resolveProfile = id => profiles.find(p=>p.id===id) || profiles[0];
export function initialProfileId(query='',stored=''){
  const candidate = new URLSearchParams(String(query).replace(/^\?/, '')).get('server');
  return resolveProfile(candidate && profileIds.includes(candidate) ? candidate : stored).id;
}
let activeId = DEFAULT_PROFILE;
if (typeof location !== 'undefined') {
  let stored = '';
  try { stored = localStorage.getItem(PROFILE_STORAGE) || ''; } catch {}
  activeId = initialProfileId(location.search, stored);
}
export const activeProfile = () => resolveProfile(activeId);
export function setActiveProfile(id){
  activeId = resolveProfile(id).id;
  try { localStorage.setItem(PROFILE_STORAGE, activeId); } catch {}
  if (typeof location !== 'undefined' && typeof history !== 'undefined') {
    const url = new URL(location.href);
    if(activeId===DEFAULT_PROFILE) url.searchParams.delete('server');
    else url.searchParams.set('server',activeId);
    history.replaceState(null,'',url);
  }
  renderProfile();
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('atlas:profile-change',{detail:{id:activeId}}));
}
export function shareUrlWithProfile(hash){
  const url = new URL(location.href);
  if(activeId===DEFAULT_PROFILE) url.searchParams.delete('server');
  else url.searchParams.set('server',activeId);
  url.hash = hash;
  return url.toString();
}
function setText(selector,text){
  document.querySelectorAll(selector).forEach(el=>{el.textContent=text;});
}
export function renderProfile(){
  if(typeof document==='undefined')return;
  const profile=activeProfile();
  document.querySelectorAll('[data-server-profile]').forEach(el=>{
    if(!el.options.length) profiles.forEach(p=>el.add(new Option(p.name,p.id)));
    el.value=profile.id;
  });
  setText('[data-profile-badge]',profile.badge);
  setText('[data-profile-growth]',profile.growth);
  setText('[data-profile-rules]',profile.rules);
  setText('[data-profile-name]',profile.name);
  setText('[data-profile-description]',profile.description);
  setText('[data-profile-grow-advice]',profile.growthAdvice);
  setText('[data-profile-evidence-note]',profile.evidenceNote);
}
export function initProfileUI(){
  if(typeof document==='undefined')return;
  document.querySelectorAll('[data-server-profile]').forEach(el=>el.addEventListener('change',()=>setActiveProfile(el.value)));
  renderProfile();
}
