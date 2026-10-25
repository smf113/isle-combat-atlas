/**
 * ORIGIN Combat & Build Lab — source-data snapshot.
 * Recovered from the final interactive app in the supplied conversation export.
 * Reviewed Sep 2026; NOT a live feed. Modify with evidence and update docs/DATA_NOTES.md.
 */
    const contexts={
      coastal:'Coastal / saltwater',cannibal:'Cannibal diet',night:'Night hunting',nesting:'Nesting / breeding',group:'Group leader / group play',weather:'Rain / storms',aquatic:'Aquatic lifestyle',vertical:'Climbing / fall risk',stealth:'Stealth / quiet comms',day:'Daytime activity'
    };

    const M=(n,cat,diet,slots,effect,v,opt={})=>({n,cat,diet,slots,effect,v,tags:opt.tags||[],ctx:opt.ctx||{},sex:opt.sex||'Any',note:opt.note||'',unlock:opt.unlock||''});
    const mutations=[
      M('Accelerated Prey Drive','Lifecycle','Carnivore',[1,2,3,4],'10% more damage to targets below 35% health.',{off:5,def:0,sus:0,mob:1,util:1},{tags:['Combat']}),
      M('Advanced Gestation','Lifecycle','Any',[1,2,3,4],'50% faster egg gestation, incubation and breeding cooldown.',{off:0,def:0,sus:0,mob:0,util:1},{tags:['Circumstantial','Breeding'],ctx:{nesting:7},sex:'Female'}),
      M('Barometric Sensitivity','Lifecycle','Herbivore',[1,2,3,4],'Warns of approaching storms or droughts.',{off:0,def:0,sus:0,mob:0,util:1},{tags:['Circumstantial'],ctx:{weather:6}}),
      M('Cannibalistic','Lifecycle','Carnivore',[2,4],'Adds your own species as preferred prey if it is not already part of the species diet.',{off:0,def:0,sus:1,mob:0,util:1},{tags:['Circumstantial','Survival'],ctx:{cannibal:8},note:'Little or no value if your species already naturally receives nutrients from its own species.'}),
      M('Cellular Regeneration','Lifecycle','Any',[1,2,3,4],'15% faster health recovery.',{off:0,def:4,sus:4,mob:0,util:1},{tags:['Survival']}),
      M('Congenital Hypoalgesia','Lifecycle','Any',[1,2,3,4],'15% less incoming damage when fighting a larger species.',{off:0,def:5,sus:1,mob:0,util:1},{tags:['Combat','Survival']}),
      M('Efficient Digestion','Lifecycle','Any',[1,2,3,4],'Food drains 20% more slowly.',{off:0,def:0,sus:4,mob:1,util:1},{tags:['Survival']}),
      M('Enlarged Meniscus','Lifecycle','Any',[1,2,3,4],'Fall damage drains stamina before health.',{off:0,def:2,sus:0,mob:2,util:2},{tags:['Circumstantial','Mobility'],ctx:{vertical:6}}),
      M('Epidermal Fibrosis','Lifecycle','Any',[1,2,3,4],'15% increased bleed resistance.',{off:0,def:5,sus:2,mob:0,util:1},{tags:['Combat','Survival']}),
      M('Featherweight','Lifecycle','Any',[1,2,3,4],'Footprints disappear substantially faster.',{off:1,def:1,sus:0,mob:2,util:5},{tags:['Mobility','Circumstantial'],ctx:{stealth:3}}),
      M('Hematophagy','Lifecycle','Carnivore',[1,2,3,4],'Restore some thirst while eating corpses.',{off:0,def:0,sus:4,mob:1,util:2},{tags:['Survival']}),
      M('Hemomania','Lifecycle','Carnivore',[1,2,3,4],'5% additional damage to bleeding targets.',{off:5,def:0,sus:0,mob:0,util:2},{tags:['Combat']}),
      M('Hydrodynamic','Lifecycle','Any',[1,2,3,4],'15% increased swimming speed.',{off:1,def:1,sus:0,mob:5,util:3},{tags:['Mobility','Circumstantial'],ctx:{aquatic:4,coastal:2}}),
      M('Hydro-regenerative','Lifecycle','Any',[1,2,3,4],'25% faster health recovery during rainy weather.',{off:0,def:2,sus:2,mob:0,util:1},{tags:['Circumstantial','Survival'],ctx:{weather:7}}),
      M('Hypervigilance','Lifecycle','Herbivore',[1,2,3,4],'Wider camera while eating/drinking and greater awareness of other animals’ footsteps.',{off:0,def:2,sus:0,mob:0,util:5},{tags:['Survival']}),
      M('Increased Inspiratory Capacity','Lifecycle','Any',[1,2,3,4],'15% greater oxygen capacity.',{off:0,def:1,sus:1,mob:4,util:3},{tags:['Mobility','Circumstantial'],ctx:{aquatic:3}}),
      M('Infrasound Communication','Lifecycle','Any',[1,2,3,4],'Makes communication substantially quieter.',{off:0,def:0,sus:0,mob:0,util:2},{tags:['Circumstantial'],ctx:{stealth:6,group:2}}),
      M('Nocturnal','Lifecycle','Any',[1,2,3,4],'5% faster health and locked-health recovery at night.',{off:1,def:2,sus:3,mob:0,util:2},{tags:['Circumstantial','Survival'],ctx:{night:5}}),
      M('Osteosclerosis','Lifecycle','Any',[1,2,3,4],'20% fracture resistance / fracture-damage reduction.',{off:0,def:5,sus:2,mob:0,util:2},{tags:['Combat','Survival']}),
      M('Photosynthetic Regeneration','Lifecycle','Herbivore',[1,2,3,4],'10% faster stamina regeneration during daytime.',{off:0,def:1,sus:2,mob:5,util:2},{tags:['Circumstantial','Mobility'],ctx:{day:5}}),
      M('Photosynthetic Tissue','Lifecycle','Any',[1,2,3,4],'5% faster health / locked-health recovery during daytime.',{off:0,def:2,sus:3,mob:0,util:1},{tags:['Circumstantial','Survival'],ctx:{day:5}}),
      M('Reabsorption','Lifecycle','Any',[1,2,3,4],'Recover a small amount of water in rain or while swimming in drinkable water.',{off:0,def:0,sus:2,mob:0,util:1},{tags:['Circumstantial','Survival'],ctx:{weather:4,aquatic:3}}),
      M('Sequential Hermaphroditism','Lifecycle','Any',[1,2,3,4],'Allows the dinosaur to change sex; it is not inherited.',{off:0,def:0,sus:0,mob:0,util:0},{tags:['Circumstantial','Breeding'],ctx:{nesting:5}}),
      M('Social Behavior','Lifecycle','Herbivore/Omnivore',[1,2,3,4],'Increases maximum group size while you are group leader.',{off:0,def:0,sus:0,mob:0,util:1},{tags:['Circumstantial'],ctx:{group:8},note:'Group Leader only; intentionally scores poorly for a solo build.'}),
      M('Submerged Optical Retention','Lifecycle','Any',[1,2,3,4],'5% increased underwater vision range.',{off:1,def:0,sus:0,mob:1,util:4},{tags:['Circumstantial','Mobility'],ctx:{aquatic:6}}),
      M('Sustained Hydration','Lifecycle','Any',[1,2,3,4],'Water drains 20% more slowly.',{off:0,def:0,sus:4,mob:1,util:1},{tags:['Survival']}),
      M('Truculency','Lifecycle','Herbivore',[1,2,3,4],'5% increased chance for bucking to dismount a latched attacker.',{off:1,def:4,sus:0,mob:0,util:4},{tags:['Combat']}),
      M('Wader','Lifecycle','Any',[1,2,3,4],'25% less movement penalty in shallow water.',{off:0,def:0,sus:0,mob:4,util:3},{tags:['Circumstantial','Mobility'],ctx:{aquatic:4,coastal:3}}),
      M('Xerocole Adaptation','Lifecycle','Herbivore',[1,2,3,4],'Eating plants restores some water.',{off:0,def:0,sus:4,mob:1,util:1},{tags:['Survival']}),

      M('Tactile Endurance','Slot 2','Herbivore',[2,4],'Converts incoming damage pressure into stamina pressure.',{off:0,def:5,sus:2,mob:1,util:3},{tags:['Combat','Survival']}),
      M('Traumatic Thrombosis','Slot 2','Any',[2],'Prevents death from blood loss while resting.',{off:0,def:5,sus:3,mob:0,util:3},{tags:['Combat','Survival']}),
      M('Gastronomic Regeneration','Slot 2','Any',[2,4],'Eating restores a small amount of health.',{off:0,def:3,sus:5,mob:0,util:2},{tags:['Survival']}),
      M('Hypermetabolic Inanition','Slot 2','Carnivore',[2,4],'Damage increases as hunger decreases.',{off:5,def:0,sus:0,mob:0,util:2},{tags:['Combat']}),

      M('Augmented Tapetum','Unlockable','Carnivore',[2],'Increases night-vision range.',{off:2,def:1,sus:0,mob:0,util:4},{tags:['Circumstantial','Unlockable'],ctx:{night:7},unlock:'Kill 5 players at night.'}),
      M('Enhanced Digestion','Unlockable','Any',[2,3],'Decreases nutrition-decay rate.',{off:0,def:0,sus:4,mob:1,util:2},{tags:['Survival','Unlockable'],unlock:'Maintain nutrients for 60 minutes.'}),
      M('Heightened Ghrelin','Unlockable','Any',[2],'Greatly increases overeating capacity.',{off:0,def:0,sus:3,mob:0,util:2},{tags:['Circumstantial','Survival','Unlockable'],ctx:{nesting:2},unlock:'Maintain hunger above 80% for 30 minutes.'}),
      M('Multichambered Lungs','Unlockable','Any',[2,3],'Raises the stamina-regeneration threshold.',{off:1,def:1,sus:2,mob:5,util:2},{tags:['Mobility','Unlockable'],unlock:'Drain 4,500 stamina by sprinting or fast-swimming.'}),
      M('Osteophagic','Unlockable','Carnivore',[1,2,3,4],'Allows consumption of bones to regenerate fractures faster.',{off:0,def:4,sus:2,mob:0,util:3},{tags:['Circumstantial','Survival','Unlockable'],unlock:'Eat bones while fractured.'}),
      M('Parthenogenesis','Unlockable','Any',[2],'Allows nesting without a mate; not inherited.',{off:0,def:0,sus:0,mob:0,util:1},{tags:['Circumstantial','Breeding','Unlockable'],ctx:{nesting:9},sex:'Female'}),
      M('Prolific Reproduction','Unlockable','Any',[2],'Offspring gain better health/stamina regeneration, need less food and grow faster.',{off:0,def:0,sus:0,mob:0,util:1},{tags:['Circumstantial','Breeding','Unlockable'],ctx:{nesting:9},sex:'Female'}),
      M('Reinforced Tendons','Unlockable','Any',[1,2,3,4],'Jumping costs less stamina; also reduces Pteranodon takeoff cost.',{off:1,def:0,sus:1,mob:5,util:3},{tags:['Mobility','Circumstantial','Unlockable'],ctx:{vertical:5},unlock:'Jump 50 times.'}),
      M('Reniculate Kidneys','Unlockable','Any',[2,3],'Enables saltwater drinking under its special thirst rules.',{off:0,def:0,sus:1,mob:0,util:1},{tags:['Circumstantial','Survival','Unlockable'],ctx:{coastal:10},unlock:'Lose 1,250 thirst by drinking saltwater.'})
    ];

    const dinos=[
      {n:'Stegosaurus',diet:'Herbivore',kg:6000,solo:5,threat:5,arch:'defender',role:'Apex area defender',area:'Open migration outskirts with long sight lines.',fav:['Allosaurus','Ceratosaurus','Carnotaurus','Tenontosaurus','Maiasaura','Kentrosaurus'],danger:['Tyrannosaurus','Triceratops','Deinosuchus']},
      {n:'Diabloceratops',diet:'Herbivore',kg:3000,solo:5,threat:4,arch:'defender',role:'Frontal control defender',area:'Highlands or open Plains.',fav:['Carnotaurus','Ceratosaurus','Omniraptor','Dilophosaurus'],danger:['Allosaurus','Kentrosaurus','Tyrannosaurus','Stegosaurus']},
      {n:'Kentrosaurus',diet:'Herbivore',kg:1950,solo:5,threat:4,arch:'defender',role:'Contact-punishment defender',area:'Open migration lanes.',fav:['Carnotaurus','Ceratosaurus','Omniraptor','Pachycephalosaurus'],danger:['Allosaurus','Diabloceratops','Tyrannosaurus','Stegosaurus']},
      {n:'Ceratosaurus',diet:'Carnivore',kg:1450,solo:5,threat:4,arch:'brawler',role:'Carrion bruiser',area:'Forested edge of active traffic.',fav:['Dilophosaurus','Omniraptor','Pachycephalosaurus','Herrerasaurus','Austroraptor'],danger:['Allosaurus','Diabloceratops','Kentrosaurus','Tyrannosaurus','Stegosaurus']},
      {n:'Carnotaurus',diet:'Carnivore',kg:1300,solo:5,threat:4,arch:'runner',role:'High-speed pursuit hunter',area:'Outer South Plains and open woodland.',fav:['Dilophosaurus','Omniraptor','Pachycephalosaurus','Herrerasaurus','Austroraptor'],danger:['Allosaurus','Ceratosaurus','Diabloceratops','Kentrosaurus','Tenontosaurus']},
      {n:'Herrerasaurus',diet:'Carnivore',kg:175,solo:5,threat:3,arch:'climber',role:'Vertical ambush hunter',area:'Dense climbable forest.',fav:['Troodon','Pteranodon','Beipiaosaurus','Dryosaurus','Hypsilophodon'],danger:['Omniraptor','Dilophosaurus','Pachycephalosaurus','Austroraptor']},
      {n:'Gallimimus',diet:'Omnivore',kg:535,solo:5,threat:2,arch:'runner',role:'Mobile escape specialist',area:'Open Plains/Highlands routes.',fav:['Troodon','Pteranodon','Beipiaosaurus','Hypsilophodon'],danger:['Carnotaurus','Allosaurus','Ceratosaurus','Dilophosaurus','Omniraptor']},
      {n:'Pteranodon',diet:'Carnivore',kg:90,solo:5,threat:2,arch:'flyer',role:'Aerial scout and fisher',area:'Quiet water with a safe roost.',fav:['Hypsilophodon'],danger:['Herrerasaurus','Austroraptor','Omniraptor','Troodon']},
      {n:'Triceratops',diet:'Herbivore',kg:9500,solo:4,threat:5,arch:'defender',role:'Apex frontal defender',area:'Open Highlands/Plains away from apex traffic.',fav:['Allosaurus','Ceratosaurus','Carnotaurus','Diabloceratops','Tenontosaurus','Maiasaura','Kentrosaurus'],danger:['Tyrannosaurus','Stegosaurus','Deinosuchus']},
      {n:'Deinosuchus',diet:'Carnivore',kg:8000,solo:4,threat:5,arch:'aquatic',role:'Shoreline ambush apex',area:'Quiet secondary freshwater.',fav:['Allosaurus','Carnotaurus','Ceratosaurus','Maiasaura','Diabloceratops'],danger:['Deinosuchus','Tyrannosaurus','Triceratops','Stegosaurus']},
      {n:'Allosaurus',diet:'Carnivore',kg:2600,solo:4,threat:4,arch:'bleed',role:'Bleed pursuit hunter',area:'Highlands/Redwoods edge or outer South Plains.',fav:['Carnotaurus','Ceratosaurus','Tenontosaurus','Maiasaura','Dilophosaurus','Omniraptor','Pachycephalosaurus'],danger:['Tyrannosaurus','Triceratops','Stegosaurus','Diabloceratops','Kentrosaurus','Deinosuchus']},
      {n:'Tenontosaurus',diet:'Herbivore',kg:1600,solo:4,threat:4,arch:'defender',role:'All-round defender',area:'Mixed open ground and cover.',fav:['Dilophosaurus','Omniraptor','Pachycephalosaurus','Herrerasaurus','Austroraptor'],danger:['Allosaurus','Diabloceratops','Kentrosaurus','Tyrannosaurus']},
      {n:'Maiasaura',diet:'Herbivore',kg:3700,solo:4,threat:3,arch:'runner',role:'Fast large survivor',area:'Outer South Plains / Highlands.',fav:['Dilophosaurus','Omniraptor','Pachycephalosaurus','Herrerasaurus','Austroraptor'],danger:['Allosaurus','Diabloceratops','Tyrannosaurus','Triceratops']},
      {n:'Pachycephalosaurus',diet:'Herbivore',kg:500,solo:4,threat:3,arch:'defender',role:'Fracture impact defender',area:'Woodland/open slope transitions.',fav:['Herrerasaurus','Austroraptor','Troodon','Pteranodon','Beipiaosaurus'],danger:['Allosaurus','Carnotaurus','Ceratosaurus','Tenontosaurus','Diabloceratops']},
      {n:'Austroraptor',diet:'Carnivore',kg:240,solo:4,threat:3,arch:'aquatic',role:'Shoreline hunter',area:'Quiet ponds and river margins.',fav:['Troodon','Pteranodon','Beipiaosaurus','Dryosaurus','Hypsilophodon'],danger:['Omniraptor','Dilophosaurus','Pachycephalosaurus','Deinosuchus']},
      {n:'Beipiaosaurus',diet:'Omnivore',kg:90,solo:4,threat:2,arch:'aquatic',role:'Semi-aquatic survivor',area:'Quiet freshwater with bank cover.',fav:['Hypsilophodon'],danger:['Austroraptor','Omniraptor','Herrerasaurus','Dilophosaurus','Deinosuchus']},
      {n:'Dryosaurus',diet:'Herbivore',kg:130,solo:4,threat:1,arch:'small',role:'Evasive forager',area:'Dense vegetation outside traffic.',fav:['Hypsilophodon'],danger:['Omniraptor','Herrerasaurus','Austroraptor','Dilophosaurus','Carnotaurus']},
      {n:'Hypsilophodon',diet:'Herbivore',kg:20,solo:4,threat:1,arch:'small',role:'Tiny escape specialist',area:'Dense vegetation near safe water.',fav:[],danger:['Troodon','Herrerasaurus','Austroraptor','Omniraptor','Dilophosaurus']},
      {n:'Tyrannosaurus',diet:'Carnivore',kg:9300,solo:3,threat:5,arch:'apex',role:'Apex ambush predator',area:'Forested approaches outside migration concentrations.',fav:['Allosaurus','Ceratosaurus','Carnotaurus','Maiasaura','Tenontosaurus','Diabloceratops'],danger:['Triceratops','Stegosaurus','Deinosuchus','Tyrannosaurus']},
      {n:'Dilophosaurus',diet:'Carnivore',kg:700,solo:3,threat:4,arch:'night',role:'Nocturnal pressure hunter',area:'Forested margins of player traffic.',fav:['Omniraptor','Herrerasaurus','Austroraptor','Troodon','Pteranodon','Beipiaosaurus'],danger:['Allosaurus','Carnotaurus','Ceratosaurus','Tenontosaurus','Diabloceratops']},
      {n:'Omniraptor',diet:'Carnivore',kg:395,solo:3,threat:4,arch:'bleed',role:'Agile bleed skirmisher',area:'Brush outside migration/water traffic.',fav:['Herrerasaurus','Austroraptor','Troodon','Pteranodon','Beipiaosaurus','Dryosaurus','Hypsilophodon'],danger:['Dilophosaurus','Pachycephalosaurus','Tenontosaurus','Carnotaurus','Ceratosaurus','Allosaurus']},
      {n:'Troodon',diet:'Carnivore',kg:60,solo:2,threat:3,arch:'small',role:'Pack venom specialist',area:'Dense woodland around active traffic.',fav:['Hypsilophodon'],danger:['Omniraptor','Herrerasaurus','Austroraptor','Dilophosaurus','Gallimimus']}
    ];

    const presets={
      bleed:['Hemomania','Congenital Hypoalgesia','Epidermal Fibrosis','Accelerated Prey Drive'],
      brawler:['Cellular Regeneration','Gastronomic Regeneration','Epidermal Fibrosis','Osteosclerosis'],
      runner:['Efficient Digestion','Multichambered Lungs','Sustained Hydration','Cellular Regeneration'],
      defender:['Osteosclerosis','Tactile Endurance','Epidermal Fibrosis','Cellular Regeneration'],
      aquatic:['Hydrodynamic','Gastronomic Regeneration','Increased Inspiratory Capacity','Submerged Optical Retention'],
      climber:['Featherweight','Cellular Regeneration','Reinforced Tendons','Hydrodynamic'],
      flyer:['Reinforced Tendons','Multichambered Lungs','Increased Inspiratory Capacity','Sustained Hydration'],
      apex:['Congenital Hypoalgesia','Hypermetabolic Inanition','Epidermal Fibrosis','Cellular Regeneration'],
      night:['Nocturnal','Augmented Tapetum','Sustained Hydration','Cellular Regeneration'],
      small:['Featherweight','Cellular Regeneration','Sustained Hydration','Epidermal Fibrosis']
    };

    const weights={
      bleed:{off:.43,def:.23,sus:.08,mob:.12,util:.14},brawler:{off:.24,def:.42,sus:.18,mob:.05,util:.11},runner:{off:.07,def:.12,sus:.16,mob:.51,util:.14},defender:{off:.08,def:.55,sus:.12,mob:.07,util:.18},aquatic:{off:.10,def:.16,sus:.12,mob:.36,util:.26},climber:{off:.10,def:.12,sus:.10,mob:.34,util:.34},flyer:{off:.05,def:.10,sus:.13,mob:.51,util:.21},apex:{off:.34,def:.39,sus:.12,mob:.06,util:.09},night:{off:.30,def:.10,sus:.10,mob:.10,util:.40},small:{off:.03,def:.20,sus:.13,mob:.43,util:.21}
    };
    const synergies=[['Hemomania','Accelerated Prey Drive',.34,'Bleed pressure converts naturally into finishing damage.'],['Hydrodynamic','Increased Inspiratory Capacity',.30,'Swimming speed and oxygen reinforce aquatic control.'],['Hydrodynamic','Submerged Optical Retention',.24,'Aquatic mobility and vision reinforce the same role.'],['Nocturnal','Augmented Tapetum',.36,'Night recovery and night vision reinforce each other.'],['Reinforced Tendons','Multichambered Lungs',.25,'Strong movement and stamina-efficiency pairing.'],['Cellular Regeneration','Gastronomic Regeneration',.25,'Passive and food-triggered healing complement each other.'],['Osteosclerosis','Cellular Regeneration',.20,'Fracture protection plus recovery improves resilience.'],['Reniculate Kidneys','Hydrodynamic',.25,'Coastal access and aquatic mobility form a coherent shoreline build.'],['Cannibalistic','Hematophagy',.18,'Conspecific prey can also provide hydration while feeding.']];
    const dims=['off','def','sus','mob','util'],dimNames={off:'Offense',def:'Defense',sus:'Sustain',mob:'Mobility',util:'Utility'};
    const growthSteps=[25,35,45,55,65,75,87,100];

/** Shared conservative eligibility for all site consumers. A slot alone does not imply an unlock was earned.
 * Official patch 0.21.720 removed Traumatic Thrombosis from new selection.
 * Diet restrictions for omnivores are community-reported and remain unverified on ORIGIN.
 */
const removedMutations=new Set(['Traumatic Thrombosis']);
function availabilityReason(m,d,sex,slot){
  if(!m)return 'unknown mutation';
  if(removedMutations.has(m.n))return 'removed in public patch 0.21.720';
  if(!Number.isInteger(slot)||!m.slots.includes(slot))return 'slot not supported by available evidence';
  if(!d)return 'unknown species';
  const dietOK=m.diet==='Any'||m.diet===d.diet||(m.diet==='Herbivore/Omnivore'&&['Herbivore','Omnivore'].includes(d.diet));
  if(!dietOK)return 'diet restriction not satisfied (omnivore exceptions remain unverified)';
  if(m.sex!=='Any'&&m.sex!==sex)return 'sex restriction not satisfied';
  if(m.n==='Cannibalistic'&&['Deinosuchus','Ceratosaurus'].includes(d.n))return 'species naturally cannibalistic';
  return '';
}
const eligibleMutation=(m,d,sex,slot)=>!availabilityReason(m,d,sex,slot);
export {contexts,mutations,dinos,presets,weights,synergies,dims,dimNames,growthSteps,removedMutations,availabilityReason,eligibleMutation};
