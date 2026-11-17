/* ---------- Game state, save, inventory ---------- */
const K={left:false,right:false,hand:false,nitro:false,brake:false,gas:false,fire:false};
let state='menu',paused=false,timeScale=1,T=0,clock=22*60,combo=0,driftT=0,nitro=.5,stars=0,busted=0,shake=0,spawnT=2,spotted=false,seen=false,hiddenT=0,curD='city',camMode=0,viewFar=false,saveClock=0,hitFlash=0;
let P=null,V=null,cops=[],helis=[],onFoot=false,abandoned=[],traffic=[],humans=[],spikes=[],armor=0,pedHp=100,jamT=0,deliverT=0,waypoint=null,nextSpawn='hosp',pending=[],lastHeliDown=-99;
const lastSeen={x:0,y:0},lastPos={x:0,y:0};
const $$=n=>'$'+Math.round(n).toLocaleString('de-DE');
const ITEMS={
  repair:{name:'Reparatur-Kit',price:300,desc:'Repariert dein Fahrzeug sofort komplett.'},
  med:{name:'Verbandskasten',price:150,desc:'Füllt dein Leben wieder auf.'},
  vest:{name:'Schutzweste',price:500,desc:'100 Panzerung gegen Kugeln und Unfälle.'},
  nitro:{name:'Nitro-Kanister',price:200,desc:'Füllt den Nitro-Tank sofort.'},
  spikes:{name:'Nagelband',price:400,desc:'Wird hinter dir ausgelegt. Cops, die drüberfahren, crashen.'},
  jammer:{name:'Störsender',price:800,desc:'Helikopter verlieren dich 20 Sekunden lang.'},
  lawyer:{name:'Anwalt',price:1500,desc:'Senkt deine Fahndung um 2 Sterne.'}};
const WPN={
  fist:{name:'Fäuste',melee:true,dmg:24,rate:.42,range:24},
  pistol:{name:'Pistole',dmg:26,rate:.26,mag:12,range:360,spread:.035,snd:'pistol',price:1500,ammo:{n:24,price:80}},
  smg:{name:'MP',dmg:15,rate:.085,mag:30,range:300,spread:.075,snd:'smg',price:4500,ammo:{n:60,price:150},two:true},
  shotgun:{name:'Schrotflinte',dmg:14,pellets:8,rate:.8,mag:6,range:190,spread:.17,snd:'shotgun',price:6000,ammo:{n:12,price:120},two:true},
  rifle:{name:'Sturmgewehr',dmg:25,rate:.11,mag:30,range:480,spread:.035,snd:'rifle',price:12000,ammo:{n:60,price:240},two:true}};
const WORDER=['fist','pistol','smg','shotgun','rifle'];
let curW='fist',lastW='pistol',mags={},reloadT=0,fireCD=0,aimTarget=null,aimRe=0,wheelOpen=false,lastShotRep=-99;
const rob={pl:null,prog:0,active:false};
const FLAVOR=['Bürgermeister verspricht weniger Schlaglöcher, wieder mal','Hafen meldet Rekordumschlag bei Containern','Neue Neonreklame in der Innenstadt sorgt für Streit',
  'Taxifahrer fordern bessere Stoßdämpfer','Polizei bekommt neue Motorräder für die Innenstadt','Investoren wollen aus dem Brachland einen Freizeitpark machen',
  'Studie: 9 von 10 Einwohnern parken schief','Kioskbesitzer fordern mehr Streifen in der Nacht','Stadtpark bekommt neuen Brunnen, Anwohner skeptisch'];
let SAVE=null;
function defaultSave(){return{money:2500,owned:[4],cur:4,items:{repair:1,med:1},weapons:['fist','pistol'],ammo:{pistol:36},news:[],stats:{cops:0,robs:0,steals:0,kills:0}};}
function loadSave(){try{const s=JSON.parse(localStorage.getItem('nachtjagd-save2')||'null');if(s&&typeof s.money==='number'&&Array.isArray(s.owned)){const d=defaultSave();
  return Object.assign(d,s,{stats:Object.assign(d.stats,s.stats||{}),items:s.items||{},weapons:Array.isArray(s.weapons)?s.weapons:d.weapons,ammo:s.ammo||{}});}}catch(e){}return null;}
function save(){if(!SAVE)return;try{localStorage.setItem('nachtjagd-save2',JSON.stringify(SAVE))}catch(e){}}
function clockStr(){const m=Math.floor(clock)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
function news(title){if(!SAVE)return;SAVE.news.unshift({t:clockStr(),title});if(SAVE.news.length>30)SAVE.news.length=30;}
function addCash(n,x,y,label){if(!SAVE)return;n=Math.round(n);SAVE.money=Math.max(0,SAVE.money+n);if(label)float(x,y,label+(n>=0?' +':' −')+$$(Math.abs(n)),n>=0?'#3dff9a':'#ff2e4d',1.1);}
const head=new THREE.SpotLight(0xfff0d0,2.4,520,.48,.55,1);head.target=new THREE.Object3D();
const copLights=[new THREE.PointLight(0xff2040,0,260,1.4),new THREE.PointLight(0x2060ff,0,260,1.4)];copLights.forEach(l=>scene.add(l));

function makeCar(x,y,a,v){return{x,y,a,v,vx:0,vy:0,vf:0,vl:0,steer:0,hp:v.hp||100,police:v===COPV||v===COPB,wreck:0,stuck:0,rev:0,hitP:-9,close:false,sl:null,sr:null,ph:Math.random()*2,air:0,airMax:0,gy:0};}
function dropModel(c){if(c&&c.m&&c.v!==PEDV){scene.remove(c.m.root);scene.remove(c.sh);if(c.m.geos)c.m.geos.forEach(g=>g.dispose());}}
let PEDM=null,PEDSH=null;
function attachHead(car){car.m.root.add(head);car.m.root.add(head.target);head.position.set(car.v.L/2,10,0);head.target.position.set(160,0,0);}
function spawnOwned(vi,x,y,a){const v=VEH[vi],c=makeCar(x,y,a,v);c.own=vi;c.gy=groundBase(x,y);c.m=buildVehicle(v);scene.add(c.m.root);c.sh=addShadow(v);return c;}
function makePedAt(x,y,a){
  const ped=makeCar(x,y,a,PEDV);Object.assign(ped,{spd:0,jy:0,jv:0,kx:0,ky:0,pvx:0,pvy:0,jh:false,gy:groundBase(x,y),m:PEDM,sh:PEDSH,hp:pedHp,punchT:0,isPlayer:true});
  PEDM.root.visible=true;PEDSH.visible=true;return ped;
}
function clearWorld(){
  if(P&&P.v!==PEDV)dropModel(P);cops.forEach(dropModel);abandoned.forEach(dropModel);traffic.forEach(dropModel);humans.forEach(dropHuman);
  helis.forEach(removeHeli);spikes.forEach(s=>scene.remove(s.m));
  cops=[];helis=[];abandoned=[];spikes=[];traffic=[];humans=[];pending=[];
  for(const p of PLACES){p.clerk=null;p.shopper=null;}
  parts.forEach(p=>{if(p.sp.owner===p)p.sp.visible=false;});parts=[];floats.forEach(f=>f.el.remove());floats=[];
  skPos.fill(0);skDirty=true;skI=0;
  if(!PEDM){PEDM=buildHuman(PLAYERSTYLE);PEDSH=addShadow(PEDV);}PEDM.root.visible=false;PEDSH.visible=false;
  stars=0;busted=0;shake=0;combo=0;driftT=0;spotted=false;seen=false;hiddenT=0;jamT=0;deliverT=0;spawnT=1;
  aimTarget=null;reloadT=0;rob.pl=null;rob.prog=0;rob.active=false;
}
function beginPlay(){
  state='play';paused=false;timeScale=1;$('menu').hidden=true;$('over').hidden=true;$('modal').hidden=true;$('phone').hidden=true;$('wheel').hidden=true;wheelOpen=false;
  $('hud').hidden=false;$('pad').hidden=false;
  for(const k in K)K[k]=false;camYaw=P.a;camDistS=80;camHS=34;ensureT=0;setLabels();
}
function initMags(){mags={};for(const w of SAVE.weapons)if(WPN[w].mag)mags[w]=Math.min(WPN[w].mag,SAVE.ammo[w]||0);}
function startGame(fresh){
  SFX.init();
  SAVE=fresh?defaultSave():(loadSave()||defaultSave());
  if(fresh)FLAVOR.slice().sort(()=>Math.random()-.5).slice(0,4).forEach(news);
  clearWorld();pedHp=100;armor=0;nitro=.5;waypoint=null;curW='fist';lastW='pistol';initMags();
  if(!SAVE.owned.includes(SAVE.cur))SAVE.cur=SAVE.owned[0];
  const sp=placeById('safe');P=spawnOwned(SAVE.cur,sp.sx,sp.sy,0);V=P.v;attachHead(P);onFoot=false;
  save();beginPlay();banner(fresh?'WILLKOMMEN IN DER STADT':'WILLKOMMEN ZURÜCK');
}
function respawn(type){
  SFX.init();
  const pl=nearestPlace(type,lastPos.x,lastPos.y);
  clearWorld();pedHp=100;armor=0;initMags();curW='fist';P=makePedAt(pl.sx,pl.sy-14,0);P.hp=100;onFoot=true;
  save();beginPlay();banner(pl.t.name.toUpperCase());
}
function toMenu(){
  save();$('phone').hidden=true;$('modal').hidden=true;$('wheel').hidden=true;wheelOpen=false;clearWorld();P=null;state='menu';paused=false;
  $('hud').hidden=true;$('pad').hidden=true;$('over').hidden=true;$('menu').hidden=false;$('speed').style.opacity=0;$('nitroTint').style.opacity=0;refreshMenu();
}
