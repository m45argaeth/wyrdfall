'use strict';
var SAVE_KEY='wyrdfall_save_v1';
var EMOJI={sand:'🟩',tree:'🌳',rock:'🪨',hill:'⛰️',wall:'🧱',npc:'🏛️',monster:'👹',drop:'🧪'};
var DROP_KINDS=['hp','mana','stamina'];
var DROP_CHANCE=0.25;

function spr(key,emo){var u=(window.SPRITES&&window.SPRITES[key]);return u?'<img class="sp" src="'+u+'" alt="">':'<span class="emo">'+(emo||'')+'</span>';}
function heroKey(cls){return 'cls_'+String(cls||'einherjar').toLowerCase().replace(/[^a-z0-9]/g,'');}

function defaultSave(){
 return {player:{cls:'Einherjar',level:1,xp:0,base:{STR:6,DEX:3,END:9,RUN:2},hp:140,hpMax:140,mana:30,manaMax:30,stamina:20,staminaMax:20,gold:0,weaponBase:5,pet:false,pos:null,lastRegen:Date.now()},maps:{},usedSeeds:{}};
}
function load(){try{var s=JSON.parse(localStorage.getItem(SAVE_KEY));if(!s)return defaultSave();if(!s.maps)s.maps={};if(!s.usedSeeds)s.usedSeeds={};return s;}catch(e){return defaultSave();}}
function save(s){localStorage.setItem(SAVE_KEY,JSON.stringify(s));}

function xpToNext(lv){var xp=100;for(var l=1;l<lv;l++){xp*=l<40?1.06:1.10;}return Math.round(xp);}
function critPct(d){return 60*d/(d+150);}
function dodgePct(d){return 50*d/(d+200);}
function hitPct(d){return Math.min(99,85+d);}

function applyRegen(p){
 var now=Date.now();var m=Math.floor((now-(p.lastRegen||now))/60000);
 if(m>0){
  p.hp=Math.min(p.hpMax,Math.round(p.hp+p.hpMax*0.10*m));
  p.mana=Math.min(p.manaMax,Math.round(p.mana+p.manaMax*0.10*m));
  p.stamina=Math.min(p.staminaMax,p.stamina+m);
  p.lastRegen=(p.lastRegen||now)+m*60000;
 }
}

function getMap(s,id){
 if(!s.maps[id]){
  var base=MAPS[id];
  var tiles=JSON.parse(JSON.stringify(base.grid));
  tiles.forEach(function(row){row.forEach(function(t){if(t.type==='monster')t.hp=MONSTERS[t.monster].hp;});});
  s.maps[id]={tiles:tiles};
 }
 return s.maps[id];
}

function startPos(map){
 var sr=-1,sc=-1;
 map.tiles.forEach(function(row,r){row.forEach(function(t,c){if(t.start&&sr<0){sr=r;sc=c;}});});
 if(sr<0)map.tiles.forEach(function(row,r){row.forEach(function(t,c){if(sr<0&&t.type==='sand'){sr=r;sc=c;}});});
 if(sr<0){sr=Math.floor(map.tiles.length/2);sc=Math.floor(map.tiles[0].length/2);}
 return{r:sr,c:sc};
}

function portalEntry(map,fromId){
 var pr=-1,pc=-1;
 map.tiles.forEach(function(row,r){row.forEach(function(t,c){if(t.type==='portal'&&t.target===fromId){pr=r;pc=c;}});});
 if(pr<0)return null;
 var dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
 for(var i=0;i<dirs.length;i++){var nr=pr+dirs[i][0],nc=pc+dirs[i][1];var row=map.tiles[nr];if(row&&row[nc]&&row[nc].type==='sand')return{r:nr,c:nc};}
 return{r:pr,c:pc};
}

function seed(){return Math.random().toString(36).slice(2,10);}
function go(params){var u=new URLSearchParams(params);u.set('r',seed());location.search=u.toString();}
function el(html){var d=document.createElement('div');d.innerHTML=html.trim();return d.firstChild;}
function flash(msg){var f=el('<div class="toast">'+msg+'</div>');document.body.appendChild(f);setTimeout(function(){f.remove();},1600);}
function parseM(idm){var parts=idm.split('-');var c=+parts.pop();var r=+parts.pop();return{mapId:parts.join('-'),r:r,c:c};}

function hud(p){
 var xpN=xpToNext(p.level);
 return '<div class="hud">'+
  '<div class="stat">🛡️ <b>'+p.cls+'</b> · Lv '+p.level+'</div>'+
  '<div class="stat hp">HP '+p.hp+'/'+p.hpMax+'<div class="bar"><i style="width:'+(100*p.hp/p.hpMax)+'%"></i></div></div>'+
  '<div class="stat mana">Mana '+p.mana+'/'+p.manaMax+'<div class="bar"><i style="width:'+(100*p.mana/p.manaMax)+'%"></i></div></div>'+
  '<div class="stat sta">Stamina '+p.stamina+'/'+p.staminaMax+'<div class="bar"><i style="width:'+(100*p.stamina/p.staminaMax)+'%"></i></div></div>'+
  '<div class="stat">XP '+p.xp+'/'+xpN+'</div>'+
  '<div class="stat">💰 '+p.gold+' Gull</div>'+
 '</div>';
}

function backPanel(mapId,msg){
 var app=document.getElementById('app');
 app.innerHTML=hud(load().player)+'<div class="panel"><p>'+msg+'</p><div class="row"><button class="btn" id="back">Back to map</button></div></div>';
 document.getElementById('back').onclick=function(){go({view:'maps',id:mapId});};
}

function tileSprite(t){
 if(t.type==='tree')return spr('tile_tree',EMOJI.tree);
 if(t.type==='rock')return spr('tile_rock',EMOJI.rock);
 if(t.type==='hill')return spr('tile_hill',EMOJI.hill);
 if(t.type==='wall')return spr('tile_wall',EMOJI.wall);
 if(t.type==='portal')return spr(t.dir==='up'?'portal_up':'portal_down',t.dir==='up'?'⬆️':'⬇️');
 if(t.type==='monster')return spr(MONSTERS[t.monster].sprite,EMOJI.monster);
 if(t.type==='npc')return spr(NPCS[t.npc].sprite,EMOJI.npc);
 if(t.type==='sand'&&t.drop){var k=t.drop==='random'?null:t.drop;return k?spr('item_'+k,EMOJI.drop):'<span class="emo">'+EMOJI.drop+'</span>';}
 return '';
}

function renderMap(s,id,from){
 if(!MAPS[id])id='hub_midgard';
 var map=getMap(s,id);var meta=MAPS[id];
 var p=s.player;
 if(!p.pos||p.pos.map!==id){
  var ep=from?portalEntry(map,from):null;
  var sp=ep||startPos(map);
  p.pos={map:id,r:sp.r,c:sp.c};
 }
 save(s);
 var app=document.getElementById('app');
 var sand=(window.SPRITES&&window.SPRITES.tile_sand);
 var hero=(window.SPRITES&&window.SPRITES[heroKey(p.cls)]);
 var cols=map.tiles[0].length;
 var cells='';
 map.tiles.forEach(function(row,r){row.forEach(function(t,c){
  if(t.type==='void'){cells+='<div class="cell void"></div>';return;}
  var cls='cell',data='';
  if(t.type==='tree'||t.type==='rock'||t.type==='hill'||t.type==='wall'){cls+=' block';}
  else if(t.type==='portal'){cls+=' click';data='data-act="portal" data-target="'+t.target+'"';}
  else if(t.type==='monster'){cls+=' click';data='data-act="monster" data-pos="'+r+'-'+c+'"';}
  else if(t.type==='npc'){cls+=' click';data='data-act="npc" data-npc="'+t.npc+'"';}
  else {cls+=' click';data='data-act="sand" data-pos="'+r+'-'+c+'"';}
  var inner=tileSprite(t);
  if(p.pos&&p.pos.r===r&&p.pos.c===c){cls+=' is-hero';inner+=hero?'<img class="hero" src="'+hero+'" alt="You" title="You">':'<span class="hero emo">🧍</span>';}
  cells+='<div class="'+cls+'" '+data+' title="'+t.type+'">'+inner+'</div>';
 });});
 var gstyle=' style="grid-template-columns:repeat('+cols+',var(--tile))'+(sand?';background-image:url('+sand+')':'')+'"';
 app.innerHTML=hud(p)+
  '<div class="maptitle">📍 <b>'+meta.name+'</b> · <code>'+meta.route+'&r='+seed()+'</code> · '+(meta.kind==='safe'?'🛟 Safe Zone':'⚔️ Combat Zone')+'</div>'+
  '<div class="grid"'+gstyle+'>'+cells+'</div>';
 app.querySelectorAll('.cell.click').forEach(function(cell){
  cell.addEventListener('click',function(){
   var act=cell.getAttribute('data-act');
   if(act==='portal')go({view:'maps',id:cell.getAttribute('data-target'),from:id});
   else if(act==='monster')go({view:'monster',id_monster:id+'-'+cell.getAttribute('data-pos')});
   else if(act==='npc')dialog(cell.getAttribute('data-npc'),s,id);
   else if(act==='sand')moveTo(s,map,id,cell.getAttribute('data-pos'));
  });
 });
}

function moveTo(s,map,id,pos){
 var rc=pos.split('-');var r=+rc[0],c=+rc[1];
 s.player.pos={map:id,r:r,c:c};
 var t=map.tiles[r][c];var p=s.player;
 if(t.drop){
  var kind=t.drop==='random'?DROP_KINDS[Math.floor(Math.random()*3)]:t.drop;var msg='';
  if(kind==='hp'){var v=Math.round(p.hpMax*0.3);p.hp=Math.min(p.hpMax,p.hp+v);msg='+'+v+' HP';}
  else if(kind==='mana'){var vm=Math.round(p.manaMax*0.3);p.mana=Math.min(p.manaMax,p.mana+vm);msg='+'+vm+' Mana';}
  else {p.stamina=Math.min(p.staminaMax,p.stamina+3);msg='+3 Stamina';}
  delete t.drop;flash('🧪 '+msg);
 }
 save(s);renderMap(s,id);
}

function dialog(key,s,mapId){
 var n=NPCS[key]||{name:key,text:''};
 var ov=el('<div class="toast" style="position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:20px;left:0;bottom:0;transform:none;border:0;border-radius:0"><div class="panel" style="max-width:340px"><h3>'+n.name+'</h3><p>'+n.text+'</p><div class="row"></div></div></div>');
 var row=ov.querySelector('.row');
 function close(){ov.remove();}
 if(n.heal){var b=el('<button class="btn">Restore HP & Mana</button>');b.onclick=function(){s.player.hp=s.player.hpMax;s.player.mana=s.player.manaMax;save(s);close();renderMap(s,mapId);flash('✨ Fully restored.');};row.appendChild(b);}
 var cb=el('<button class="btn-ghost">Close</button>');cb.onclick=close;row.appendChild(cb);
 ov.addEventListener('click',function(e){if(e.target===ov)close();});
 document.body.appendChild(ov);
}

function renderMonster(s,idm){
 if(!idm){go({view:'maps',id:'hub_midgard'});return;}
 var pm=parseM(idm);var map=getMap(s,pm.mapId);var t=map.tiles[pm.r]&&map.tiles[pm.r][pm.c];
 if(!t||t.type!=='monster'){backPanel(pm.mapId,'The monster is no longer here.');return;}
 var m=MONSTERS[t.monster];var p=s.player;var app=document.getElementById('app');
 app.innerHTML=hud(p)+'<div class="panel">'+
  '<h2>'+m.name+'</h2>'+
  '<div class="mon-portrait">'+spr(m.sprite,EMOJI.monster)+'</div>'+
  '<div class="maptitle"><code>/monster/view?id_monster='+idm+'&r='+seed()+'</code></div>'+
  '<p>Level '+m.level+' · Attack ~'+m.atk+'/round</p>'+
  '<div class="stat hp" style="max-width:260px">HP '+t.hp+'/'+m.hp+'<div class="bar"><i style="width:'+(100*t.hp/m.hp)+'%"></i></div></div>'+
  '<div class="row">'+
   '<button class="btn" id="atk">⚔️ Attack (5 rounds'+(p.pet?' +1 pet':'')+', -1 stamina)</button>'+
   '<button class="btn-ghost" id="back">Back to map</button>'+
  '</div>'+
  (p.stamina<1?'<p class="hurt">Stamina depleted — wait for regen (1/min) or drink a Stamina Potion.</p>':'')+
  '</div>';
 document.getElementById('back').onclick=function(){go({view:'maps',id:pm.mapId});};
 var atk=document.getElementById('atk');
 if(p.stamina<1)atk.disabled=true;
 atk.onclick=function(){go({view:'battle',id_monster:idm});};
}

function respawn(map,type){
 var empties=[];
 map.tiles.forEach(function(row,r){row.forEach(function(t,c){if(t.type==='sand'&&!t.drop&&!t.start)empties.push([r,c]);});});
 if(empties.length){var pick=empties[Math.floor(Math.random()*empties.length)];map.tiles[pick[0]][pick[1]]={type:'monster',monster:type,hp:MONSTERS[type].hp};}
}

function renderBattle(s,idm){
 var pm=parseM(idm);var map=getMap(s,pm.mapId);var t=map.tiles[pm.r]&&map.tiles[pm.r][pm.c];
 if(!t||t.type!=='monster'){backPanel(pm.mapId,'The monster is gone.');return;}
 var p=s.player;var m=MONSTERS[t.monster];
 if(p.stamina<1){var app0=document.getElementById('app');app0.innerHTML=hud(p)+'<div class="panel"><p class="hurt">Stamina depleted.</p><div class="row"><button class="btn" id="back">Back to map</button></div></div>';document.getElementById('back').onclick=function(){go({view:'maps',id:pm.mapId});};return;}
 p.stamina-=1;
 var rounds=5+(p.pet?1:0);var log=[];var dead=false;
 var STR=p.base.STR,DEX=p.base.DEX;
 for(var i=1;i<=rounds&&t.hp>0&&p.hp>0;i++){
  log.push('— Round '+i+' —');
  if(Math.random()*100<hitPct(DEX)){
   var dmg=p.weaponBase+STR;var crit=Math.random()*100<critPct(DEX);if(crit)dmg=Math.round(dmg*1.5);
   t.hp=Math.max(0,t.hp-dmg);
   log.push((crit?'CRIT! ':'')+'You hit '+dmg+' → '+m.name+' '+t.hp+'/'+m.hp+' HP');
  } else log.push('Your attack missed.');
  if(t.hp<=0){dead=true;log.push('☠️ '+m.name+' slain!');break;}
  if(Math.random()*100<dodgePct(DEX))log.push('You dodged '+m.name+'.');
  else{p.hp=Math.max(0,p.hp-m.atk);log.push(m.name+' hits '+m.atk+' → your HP '+p.hp+'/'+p.hpMax);}
  if(p.hp<=0){log.push('😵 You went down! (HP partly restored for the test)');p.hp=Math.round(p.hpMax*0.25);break;}
 }
 var reward='';
 if(dead){
  var g=m.gold[0]+Math.floor(Math.random()*(m.gold[1]-m.gold[0]+1));
  p.xp+=m.xp;p.gold+=g;reward='<p class="dead">+'+m.xp+' XP, +'+g+' Gull.</p>';
  while(p.xp>=xpToNext(p.level)){p.xp-=xpToNext(p.level);p.level++;reward+='<p class="dead">⬆️ Leveled up to Lv '+p.level+'!</p>';}
  var type=t.monster;map.tiles[pm.r][pm.c]={type:'sand'};
  if(Math.random()<DROP_CHANCE){var dk=DROP_KINDS[Math.floor(Math.random()*3)];map.tiles[pm.r][pm.c].drop=dk;reward+='<p class="dead">🧪 It dropped a '+dk+' potion — walk over the tile to grab it.</p>';}
  respawn(map,type);
  reward+='<p>'+m.name+' respawns elsewhere on this map.</p>';
 }
 save(s);
 var app=document.getElementById('app');
 app.innerHTML=hud(p)+'<div class="panel">'+
  '<h2>⚔️ Battle vs '+m.name+'</h2>'+
  '<div class="maptitle"><code>/monster/battle/attack?id_monster='+idm+'&r='+seed()+'</code></div>'+
  '<div class="log">'+log.join('\n')+'</div>'+reward+
  '<div class="row">'+
   ((!dead&&t.hp>0&&p.stamina>0)?'<button class="btn" id="again">⚔️ Attack again</button>':'')+
   '<button class="btn-ghost" id="back">Back to map</button>'+
  '</div></div>';
 document.getElementById('back').onclick=function(){go({view:'maps',id:pm.mapId});};
 var again=document.getElementById('again');if(again)again.onclick=function(){go({view:'battle',id_monster:idm});};
}

function render(){
 var s=load();applyRegen(s.player);save(s);
 var q=new URLSearchParams(location.search);var view=q.get('view')||'maps';
 if(view==='monster')renderMonster(s,q.get('id_monster'));
 else if(view==='battle')renderBattle(s,q.get('id_monster'));
 else renderMap(s,q.get('id')||'hub_midgard',q.get('from'));
}
document.addEventListener('DOMContentLoaded',function(){
 var rb=document.getElementById('reset');
 if(rb)rb.onclick=function(){localStorage.removeItem(SAVE_KEY);go({view:'maps',id:'hub_midgard'});};
 render();
});
