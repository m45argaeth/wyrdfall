'use strict';
const MONSTERS={
 gaunt_wolf:{name:'Gaunt Wolf',hp:42,atk:11,level:1,xp:18,gold:[3,9],sprite:'mon_gaunt_wolf'},
 decayed_draugr:{name:'Decayed Draugr',hp:55,atk:8,level:2,xp:25,gold:[5,12],sprite:'mon_decayed_draugr'},
 draugr_warrior:{name:'Draugr Warrior',hp:120,atk:17,level:6,xp:60,gold:[15,30],sprite:'mon_draugr_warrior'},
 ice_bear:{name:'Ice Bear',hp:165,atk:22,level:8,xp:85,gold:[20,40],sprite:'mon_ice_bear'}
};
const NPCS={
 alchemist:{name:'Alchemist',text:'Sells HP / Mana / Stamina potions (placeholder in test build).',sprite:'npc_alchemist'},
 vendor:{name:'General Vendor',text:'Sells basic gear.',sprite:'npc_vendor'},
 healer:{name:"Eir's Acolyte - Healer",text:'Restores HP & Mana to full (free during the test).',heal:true,sprite:'npc_healer'},
 quest:{name:'Quest Board',text:'No quests in the test build yet.',sprite:'npc_quest'},
 storage:{name:'Storage Keeper',text:'Store your items (coming soon).',sprite:'npc_storage'},
 clan:{name:'Warlord Bjorn - Clan Hall',text:'Join a clan & wage war (coming soon).',sprite:'npc_clan'},
 rebirth:{name:'Rune-Priest - Rebirth Altar',text:'Prestige / Supreme Potion, Lv 100 only.',sprite:'npc_rebirth'},
 trainer:{name:'Sigrun the Shieldmaiden - Trainer',text:'Train Einherjar skills (coming soon).',sprite:'npc_trainer'}
};
function _cell(code){
 if(code==='.')return{type:'sand'};
 if(code==='P')return{type:'sand',start:true};
 if(code==='#')return{type:'void'};
 if(code==='T')return{type:'tree'};
 if(code==='R')return{type:'rock'};
 if(code==='H')return{type:'hill'};
 if(code==='W')return{type:'wall'};
 if(code[0]==='N')return{type:'npc',npc:code.slice(2)};
 if(code[0]==='M')return{type:'monster',monster:code.slice(2)};
 if(code[0]==='U')return{type:'portal',dir:'up',target:code.slice(2)};
 if(code[0]==='D')return{type:'portal',dir:'down',target:code.slice(2)};
 return{type:'sand'};
}
function _grid(rows){return rows.map(function(r){return r.map(_cell);});}
const MAPS={
 hub_midgard:{name:"Midgard's Last Refuge",route:'/maps?id=hub_midgard',kind:'safe',grid:_grid([
  ['W','W','W','W','W','W','W','W','W'],
  ['W','N:alchemist','.','.','N:vendor','.','.','N:healer','W'],
  ['W','.','.','.','.','.','.','.','W'],
  ['W','N:quest','.','.','P','.','.','N:storage','W'],
  ['W','.','.','.','.','.','.','.','W'],
  ['W','N:clan','.','.','.','.','.','N:rebirth','W'],
  ['W','.','.','.','.','.','.','.','W'],
  ['W','N:trainer','.','.','.','.','.','N:vendor','W'],
  ['W','W','W','W','D:forest_01','W','W','W','W']
 ])},
 forest_01:{name:'Whispering Pines',route:'/maps?id=forest_01',kind:'combat',grid:_grid([
  ['#','#','T','T','U:hub_midgard','T','T','#','#'],
  ['#','T','.','.','.','.','.','T','#'],
  ['T','.','.','R','R','.','.','.','T'],
  ['T','.','M:gaunt_wolf','.','.','.','M:decayed_draugr','.','T'],
  ['.','.','.','.','.','.','.','.','.'],
  ['T','.','R','.','.','.','R','.','T'],
  ['T','.','M:decayed_draugr','.','.','.','M:gaunt_wolf','.','T'],
  ['#','T','.','.','.','.','.','T','#'],
  ['#','#','T','T','D:forest_02','T','T','#','#']
 ])},
 forest_02:{name:'Frostmaw Hollow',route:'/maps?id=forest_02',kind:'combat',grid:_grid([
  ['#','#','T','T','U:forest_01','T','T','#','#'],
  ['#','T','.','.','.','.','.','T','#'],
  ['T','.','M:draugr_warrior','.','H','.','M:ice_bear','.','T'],
  ['T','.','.','R','.','R','.','.','T'],
  ['.','.','.','.','M:draugr_warrior','.','.','.','.'],
  ['T','.','.','R','.','R','.','.','T'],
  ['T','.','M:ice_bear','.','H','.','M:draugr_warrior','.','T'],
  ['#','T','.','.','.','.','.','T','#'],
  ['#','#','T','T','D:city_ashenvalholl','T','T','#','#']
 ])},
 city_ashenvalholl:{name:'Ashen Valholl',route:'/maps?id=city_ashenvalholl',kind:'safe',grid:_grid([
  ['W','W','W','W','W','W','W','W','W'],
  ['W','N:trainer','.','.','N:alchemist','.','.','N:vendor','W'],
  ['W','.','.','.','.','.','.','.','W'],
  ['W','N:healer','.','.','P','.','.','N:quest','W'],
  ['W','.','.','.','.','.','.','.','W'],
  ['W','N:storage','.','.','.','.','.','N:rebirth','W'],
  ['W','.','.','.','.','.','.','.','W'],
  ['W','N:clan','.','.','.','.','.','N:vendor','W'],
  ['W','W','W','W','U:forest_02','W','W','W','W']
 ])}
};
