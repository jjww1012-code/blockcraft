'use strict';
/* Sturm Royale 3.0 – Battle Royale für die Spielehalle (eigene Figuren, große Insel, Bauen mit Vorschau) */
const $=id=>document.getElementById(id),PI=Math.PI,TAU=PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
const store={get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const TOUCH=matchMedia('(pointer:coarse)').matches;
$('name').value=Profile.name;const myName=()=>{const n=$('name').value.trim().slice(0,14)||'Spieler';Profile.name=n;return n};
const SET={bots:store.get('br_bots',29),diff:store.get('br_diff',1),storm:1,gfx:store.get('br_gfx',TOUCH?0:1)};
for(const [id,k] of [['sBots','bots'],['sDiff','diff'],['sStorm','storm'],['sGfx','gfx']]){$(id).querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.v===SET[k]));
 $(id).onclick=e=>{const b=e.target.closest('button');if(!b)return;$(id).querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));SET[k]=+b.dataset.v;if(k==='gfx'){store.set('br_gfx',SET.gfx);applyGfx()}if(k==='bots')store.set('br_bots',SET.bots);if(k==='diff')store.set('br_diff',SET.diff)}}
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const BOTN=['Blitz','Rocket','Ninja','Pixel','Toaster','Kaktus','Banane','Schatten','Turbo','Wolke','Knödel','Raptor','Glitch','Komet','Zebra','Nugget','Sushi','Wirbel','Laser','Bambus','Hai','Muffin','Panda','Frost','Donner','Echo','Mango','Viper','Krake','Funke','Brezel','Tornado','Keks','Lava','Igel','Nebel','Quarz','Rakete','Sternchen','Waffel','Yeti','Zimt','Biber','Chili','Dackel','Eule','Fuchs','Gecko','Hummel','Jojo'];
const COLS=[0xff4757,0x2e86de,0xffd23f,0x2ed573,0xff7ad9,0xff9f1a,0x7d5fff,0x18dcff,0xf5f5f5,0x3d3d3d,0x00b894,0xe17055];
/* ---------- Outfits (eigene Figuren) ---------- */
const PROC_OUT=[
 {n:'Rekrut',e:'🪖',skin:0xe8b98a,shirt:0x5d7b3a,pants:0x8b7b55,shoes:0x3a2a1a,acc:0x3f5528,hat:'helmet',back:'pack',hair:0x4a3020},
 {n:'Schattenläufer',e:'🥷',skin:0xd9a06b,shirt:0x1d1f26,pants:0x1d1f26,shoes:0x111111,acc:0xd63031,hat:'band',face:'mask',back:'sword',hair:0x111111},
 {n:'Sternenfahrerin',e:'👩‍🚀',skin:0xf2c9a0,shirt:0xf2f2f2,pants:0xf2f2f2,shoes:0x666e7a,acc:0xff7a1a,hat:'visor',back:'tank',hair:0x7a3b1a},
 {n:'Eisenritter',e:'🛡️',skin:0xe0b090,shirt:0xb8c0cc,pants:0x8a929e,shoes:0x5a606a,acc:0xd63031,hat:'knight',back:'cape',hair:0x6b4a2a},
 {n:'Kapitänin Rotbart',e:'🏴‍☠️',skin:0xe8b98a,shirt:0xb3262e,pants:0x23262e,shoes:0x2a1a10,acc:0xf4c20d,hat:'tricorn',face:'patch',back:'none',hair:0xa0401a},
 {n:'Neon-Punk',e:'🎸',skin:0xf1c27d,shirt:0x26272e,pants:0x2e5cde,shoes:0xeeeeee,acc:0xff3fb4,hat:'mohawk',back:'pack',hair:0xff3fb4},
 {n:'Kaktus-Karl',e:'🌵',skin:0x4caf50,shirt:0x3f9a42,pants:0x3f9a42,shoes:0x8d5524,acc:0xff6ec7,hat:'flower',back:'none',hair:0x4caf50,spikes:1},
 {n:'Blechkumpel',e:'🤖',skin:0xa9b4c2,shirt:0x7f8b9a,pants:0x5d6774,shoes:0x3a414b,acc:0x18dcff,hat:'antenna',face:'robot',back:'jet',hair:0xa9b4c2},
 {n:'Spürnase',e:'🕵️',skin:0xf1c27d,shirt:0xc8a46a,pants:0x4a3a2a,shoes:0x2a1a10,acc:0x7a5a30,hat:'fedora',back:'none',hair:0x5a3a20,coat:1},
 {n:'Feuerwehrfrau',e:'🧑‍🚒',skin:0xc68642,shirt:0xd63031,pants:0x2d3436,shoes:0x111111,acc:0xf4d03f,hat:'fire',back:'tank',hair:0x2a1a10}];
const OUTFITS=[{n:'Kommando',e:'🪖',f:'soldier'},{n:'Abenteurerin',e:'🧭',f:'adventurer'},{n:'Kapuzenjäger',e:'🏹',f:'hooded_adventurer'},{n:'Sternenfahrerin',e:'👩‍🚀',f:'astronaut'},{n:'Schattenläufer',e:'🥷',f:'ninja_brute'},
 {n:'Kapitän Rotbart',e:'🏴‍☠️',f:'pirate'},{n:'Bauarbeiter',e:'👷',f:'worker'},{n:'Knochenmatrose',e:'💀',f:'skeleton_crew'},{n:'Streunerin',e:'🗡️',f:'rogue'},{n:'Zombie',e:'🧟',f:'zombie'}];
let myOut=store.get('br_out',0)%OUTFITS.length;
$('skinRow').innerHTML=OUTFITS.map((o,i)=>`<button data-i="${i}" title="${o.n}"><span>${o.e}</span><small>${o.n}</small></button>`).join('');
const markSkin=()=>$('skinRow').querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.i===myOut));markSkin();
$('skinRow').onclick=e=>{const b=e.target.closest('button');if(b){myOut=+b.dataset.i;store.set('br_out',myOut);markSkin()}};
/* ---------- Waffen & Gegenstände ---------- */
const RAR=[{n:'Gewöhnlich',c:'#b8bcc8',m:1},{n:'Selten',c:'#4cd964',m:1.08},{n:'Episch',c:'#3a9bff',m:1.16},{n:'Legendär',c:'#b15cff',m:1.26},{n:'Mythisch',c:'#ffb300',m:1.38}];
const WPN={
 pick:{n:'Spitzhacke',dmg:20,rate:.45,mag:0,melee:1},
 pistol:{n:'Pistole',dmg:24,rate:.25,mag:16,rel:1.2,spr:.018,rng:140,kick:.012,am:'L'},
 smg:{n:'MP',dmg:15,rate:.072,mag:30,rel:1.9,spr:.05,rng:90,auto:1,kick:.008,am:'L'},
 ar:{n:'Sturmgewehr',dmg:21,rate:.12,mag:30,rel:2.1,spr:.026,rng:230,auto:1,kick:.012,am:'M'},
 burst:{n:'Salvengewehr',dmg:26,rate:.55,burst:3,bint:.075,mag:27,rel:2.4,spr:.02,rng:210,kick:.01,am:'M'},
 shot:{n:'Pump-Schrotflinte',dmg:11,pel:10,rate:.85,mag:5,rel:2.3,spr:.085,rng:45,kick:.06,am:'S'},
 tac:{n:'Taktik-Schrotflinte',dmg:8,pel:10,rate:.42,mag:8,rel:3,spr:.1,rng:38,kick:.04,am:'S'},
 snipe:{n:'Scharfschützengewehr',dmg:105,rate:1.4,mag:1,rel:2.2,spr:.001,rng:650,zoom:1,kick:.08,am:'H'},
 rocket:{n:'Raketenwerfer',dmg:75,rate:1.1,mag:1,rel:3,spr:.004,rng:400,kick:.09,am:'R',proj:1},
 gren:{n:'Granate',dmg:80,rate:.9,mag:0,throw:1}};
const GUNS=['pistol','smg','ar','burst','shot','tac','snipe','rocket'],GUNW=[14,13,16,10,12,9,6,4];
const AMMO={L:{n:'Leichte Munition',c:'#9fd4ff',box:36},M:{n:'Mittlere Munition',c:'#7dff6a',box:30},H:{n:'Schwere Munition',c:'#ffb36b',box:6},S:{n:'Schrot',c:'#ff6b6b',box:10},R:{n:'Raketen',c:'#c7a5ff',box:3}};
const CONS={band:{n:'Verband',e:'🩹',max:15,t:2.2,hp:15,cap:75},med:{n:'Medikit',e:'💊',max:3,t:4,hp:100,cap:100},mini:{n:'Mini-Schild',e:'🧃',max:6,t:1.2,sh:25,cap:50},shield:{n:'Schildtrank',e:'🧪',max:3,t:2.5,sh:50,cap:100}};
const MATS=['wood','stone','metal'],MATN={wood:'Holz',stone:'Stein',metal:'Metall'},MATE={wood:'🪵',stone:'🧱',metal:'🔩'},MATHP={wood:150,stone:300,metal:500},MATBT={wood:1.2,stone:2.4,metal:3.6};
/* ===================== Renderer ===================== */
const renderer=new THREE.WebGLRenderer({canvas:$('cv'),antialias:!TOUCH,powerPreference:'high-performance'});
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(70,1,.1,3600);
scene.fog=new THREE.Fog(0xcde8ff,260,1200);
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',resize);
const hemi=new THREE.HemisphereLight(0xd8eeff,0x6a8a4a,.85);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d0,1.3);sun.position.set(120,220,80);scene.add(sun);scene.add(sun.target);
sun.shadow.camera.left=-70;sun.shadow.camera.right=70;sun.shadow.camera.top=70;sun.shadow.camera.bottom=-70;sun.shadow.camera.near=10;sun.shadow.camera.far=520;sun.shadow.bias=-.0006;sun.shadow.normalBias=.03;
let grass=null;
function applyGfx(){const g=SET.gfx;renderer.setPixelRatio(Math.min(devicePixelRatio,g===0?1:g===1?1.5:2));renderer.shadowMap.enabled=g>0;sun.castShadow=g>0;sun.shadow.mapSize.set(g===2?2048:1024,g===2?2048:1024);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}scene.fog.far=g===0?800:g===1?1200:1600;resize();
 scene.traverse(o=>{if(o.material){const m=Array.isArray(o.material)?o.material:[o.material];m.forEach(q=>q.needsUpdate=true)}});if(grass)grass.forEach(m=>m.visible=g>0)}
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:new THREE.Color(0x1f6fe8)},mid:{value:new THREE.Color(0x9fd4ff)},bot:{value:new THREE.Color(0xe8f6ff)},sunDir:{value:new THREE.Vector3(.45,.75,.3).normalize()},t:{value:0}},
 vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform vec3 top,mid,bot,sunDir;uniform float t;varying vec3 vP;float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}void main(){float h=vP.y;vec3 c=h>0.?mix(mid,top,pow(h,.6)):mix(mid,bot,min(1.,-h*4.));float s=max(dot(vP,sunDir),0.);c+=vec3(1.,.9,.6)*pow(s,400.)*3.+vec3(1.,.8,.5)*pow(s,8.)*.25;if(h>.02){vec2 uv=vP.xz/(h+.15)*2.+vec2(t*.01,0.);float cl=n2(uv)*.6+n2(uv*2.3)*.3+n2(uv*5.)*.1;cl=smoothstep(.55,.85,cl)*smoothstep(.02,.25,h);c=mix(c,vec3(1.),cl*.85);}gl_FragColor=vec4(c,1.);}'});
const sky=new THREE.Mesh(new THREE.SphereGeometry(3000,32,16),skyMat);scene.add(sky);
/* ===================== Texturen ===================== */
function ctex(w,h,f,rep){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;if(rep)t.repeat.set(rep,rep);return t}
const noiseFill=(x,w,h,base,vars,n,sz)=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<n;i++){x.fillStyle=vars[i%vars.length];x.globalAlpha=.35+Math.random()*.4;const s=sz*(0.5+Math.random());x.fillRect(Math.random()*w,Math.random()*h,s,s)}x.globalAlpha=1};
const grassTex=ctex(256,256,(x,w,h)=>noiseFill(x,w,h,'#ffffff',['#e0edd4','#f6fff2','#d2e2c2','#eef8e4'],5000,4));
const woodTex=ctex(128,128,(x,w,h)=>{x.fillStyle='#b9824a';x.fillRect(0,0,w,h);for(let i=0;i<8;i++){x.fillStyle=i%2?'#a8743f':'#c48d55';x.fillRect(0,i*16,w,15);x.fillStyle='rgba(90,50,20,.35)';for(let k=0;k<6;k++)x.fillRect(Math.random()*w,i*16+Math.random()*14,20+Math.random()*30,1)}x.strokeStyle='#6e431d';x.lineWidth=6;x.strokeRect(3,3,w-6,h-6);x.beginPath();x.moveTo(3,3);x.lineTo(w-3,h-3);x.stroke()});
const plasterTex=ctex(128,128,(x,w,h)=>noiseFill(x,w,h,'#ffffff',['#eeeeee','#f7f7f7','#e2e2e2'],1400,3));
const brickTex=ctex(128,128,(x,w,h)=>{x.fillStyle='#bfb2a0';x.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=0;c<4;c++){const v=200+Math.random()*30|0;x.fillStyle=`rgb(${v},${v-60},${v-80})`;x.fillRect(c*32+(r%2)*16+1,r*16+1,30,14)}});
const roofTex=ctex(128,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=0;c<8;c++){x.fillStyle=`rgba(0,0,0,${.1+Math.random()*.12})`;x.fillRect(c*16+(r%2)*8,r*16+12,16,4);x.fillStyle=`rgba(0,0,0,${Math.random()*.08})`;x.fillRect(c*16+(r%2)*8,r*16,15,12)}});
const stoneTex=ctex(128,128,(x,w,h)=>{x.fillStyle='#8a8a86';x.fillRect(0,0,w,h);for(let r=0;r<6;r++)for(let c=0;c<4;c++){const v=150+Math.random()*50|0;x.fillStyle=`rgb(${v},${v},${v-6})`;x.fillRect(c*32+(r%2)*16+2,r*21+2,28,18)}});
const buildStoneTex=ctex(128,128,(x,w,h)=>{x.fillStyle='#7d7a74';x.fillRect(0,0,w,h);for(let r=0;r<4;r++)for(let c=0;c<3;c++){const v=165+Math.random()*40|0;x.fillStyle=`rgb(${v},${v-4},${v-12})`;x.fillRect(c*43+(r%2)*21-10,r*32+3,40,27)}x.strokeStyle='#4e4b46';x.lineWidth=6;x.strokeRect(3,3,w-6,h-6)});
const metalTex=ctex(128,128,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);for(let i=0;i<=8;i++)g.addColorStop(i/8,i%2?'#9aa3ad':'#c8d0d8');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='#6b737c';for(const [a,b] of[[10,10],[118,10],[10,118],[118,118],[64,64]]){x.beginPath();x.arc(a,b,4,0,TAU);x.fill()}x.strokeStyle='#5a626b';x.lineWidth=6;x.strokeRect(3,3,w-6,h-6)});
const containerTex=ctex(128,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);for(let i=0;i<16;i++){x.fillStyle=i%2?'rgba(0,0,0,.18)':'rgba(255,255,255,.1)';x.fillRect(i*8,0,8,h)}x.fillStyle='rgba(0,0,0,.3)';x.fillRect(0,0,w,5);x.fillRect(0,h-5,w,5)});
const roadTex=ctex(64,256,(x,w,h)=>{noiseFill(x,w,h,'#4a4c52',['#55575d','#3f4146'],900,3);x.fillStyle='#f2f2f2';for(let y=0;y<h;y+=64)x.fillRect(w/2-2,y,4,34);x.fillStyle='#d8d8d8';x.fillRect(2,0,3,h);x.fillRect(w-5,0,3,h)});
const barkTex=ctex(64,128,(x,w,h)=>{x.fillStyle='#6e4a2c';x.fillRect(0,0,w,h);for(let i=0;i<40;i++){x.fillStyle=i%2?'#5a3a20':'#7d5634';x.fillRect(Math.random()*w,0,2+Math.random()*3,h)}});
const waterTex=ctex(256,256,(x,w,h)=>{x.fillStyle='#ffffff';x.fillRect(0,0,w,h);for(let i=0;i<220;i++){x.strokeStyle=`rgba(150,200,255,${.2+Math.random()*.3})`;x.lineWidth=1+Math.random()*2;const X=Math.random()*w,Y=Math.random()*h,L=8+Math.random()*24;x.beginPath();x.moveTo(X,Y);x.quadraticCurveTo(X+L/2,Y-3,X+L,Y);x.stroke()}},60);
const stripeTex=ctex(256,64,(x,w,h)=>{const c=['#ff4757','#ffd23f','#2e86de','#2ed573','#ff7ad9','#ff9f1a'];for(let i=0;i<12;i++){x.fillStyle=c[i%6];x.fillRect(i*w/12,0,w/12+1,h)}});
const M={};const mat=(k,o,lam)=>M[k]||(M[k]=new(lam?THREE.MeshLambertMaterial:THREE.MeshStandardMaterial)(Object.assign(lam?{}:{roughness:.85,metalness:0},o)));

/* ===================== Welt ===================== */
const ISL=560;let H=null,POI=[],world=null,trees=[],loot=new Map(),chests=new Map(),structs=new Map(),anims=[],water=null,nBoxes=0;
/* Räumliches Raster für Kollision und Strahlen */
const GCS=16;let grid=new Map(),stampN=1;
function gAdd(b){b._c=[];const i0=Math.floor(b.min.x/GCS),i1=Math.floor(b.max.x/GCS),j0=Math.floor(b.min.z/GCS),j1=Math.floor(b.max.z/GCS);for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=(i+300)*1000+(j+300);let L=grid.get(k);if(!L)grid.set(k,L=[]);L.push(b);b._c.push(L)}nBoxes++}
function gDel(b){if(b._c)for(const L of b._c){const i=L.indexOf(b);if(i>=0)L.splice(i,1)}b._c=null}
function near(x,z,r,f){const s=++stampN,i0=Math.floor((x-r)/GCS),i1=Math.floor((x+r)/GCS),j0=Math.floor((z-r)/GCS),j1=Math.floor((z+r)/GCS);for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const L=grid.get((i+300)*1000+(j+300));if(!L)continue;for(const b of L){if(b._s===s)continue;b._s=s;f(b)}}}
function alongRay(o,d,L,f){const s=++stampN;const n=Math.ceil(L/(GCS*.5))+1;for(let k=0;k<=n;k++){const t=Math.min(L,k*GCS*.5),x=o.x+d.x*t,z=o.z+d.z*t;const i0=Math.floor((x-1)/GCS),i1=Math.floor((x+1)/GCS),j0=Math.floor((z-1)/GCS),j1=Math.floor((z+1)/GCS);for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const C=grid.get((i+300)*1000+(j+300));if(!C)continue;for(const b of C){if(b._s===s)continue;b._s=s;f(b)}}}}
let bucket=new Map();
function addGeo(geo,m,px,py,pz,ry,rx,rz,sx,sy,sz){const o=new THREE.Object3D();o.position.set(px,py,pz);o.rotation.set(rx||0,ry||0,rz||0);if(sx)o.scale.set(sx,sy,sz);o.updateMatrix();let g=geo.clone();if(!g.index){const n=g.attributes.position.count;g.setIndex([...Array(n).keys()])}g.applyMatrix4(o.matrix);for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));let L=bucket.get(m);if(!L)bucket.set(m,L=[]);L.push(g)}
function flushBuckets(){for(const [m,L] of bucket){for(let i=0;i<L.length;i+=500){const part=L.slice(i,i+500);const g=THREE.BufferGeometryUtils.mergeBufferGeometries(part);part.forEach(q=>q.dispose());if(!g)continue;const mesh=new THREE.Mesh(g,m);mesh.castShadow=mesh.receiveShadow=true;world.add(mesh)}}bucket=new Map()}
const BOXG=new THREE.BoxGeometry(1,1,1);
function addBox(minx,miny,minz,maxx,maxy,maxz,o){const b=Object.assign({min:new THREE.Vector3(minx,miny,minz),max:new THREE.Vector3(maxx,maxy,maxz)},o||{});gAdd(b);return b}
function solid(cx,cy,cz,sx,sy,sz,m,o){addGeo(BOXG,m,cx,cy,cz,0,0,0,sx,sy,sz);return addBox(cx-sx/2,cy-sy/2,cz-sz/2,cx+sx/2,cy+sy/2,cz+sz/2,o)}
function deco(cx,cy,cz,sx,sy,sz,m,ry){addGeo(BOXG,m,cx,cy,cz,ry||0,0,0,sx,sy,sz)}
const inSnow=(x,z)=>z<-330+Math.sin(x*.02)*30;
let MESA=null;const inDesert=(x,z)=>MESA&&Math.hypot(x-MESA.x,z-MESA.z)<MESA.r*2.1+Math.sin(x*.05+z*.03)*14;
function makeWorldFn(seed){const r=rng(seed),rot=(r()-.5)*.5,s=r()*50;const R=(x,z)=>[x*Math.cos(rot)-z*Math.sin(rot),x*Math.sin(rot)+z*Math.cos(rot)];
 const P=(name,x,z,rad,h,kind)=>{const [X,Z]=R(x,z);return{name,x:X,z:Z,r:rad,h,kind}};
 POI=[P('Ziegelstadt',0,40,80,6,'town'),P('Neustadt',-70,-180,62,7,'town2'),P('Heuhof',270,-170,60,5,'farm'),P('Burgberg',-290,-170,44,30,'castle'),P('Blauer See',-210,230,62,-5,'lake'),P('Leuchtturm',460,210,26,7,'light'),P('Tankstelle',170,190,30,6,'gas'),
  P('Dunkelwald',90,-330,90,null,'forest'),P('Klippen',-480,40,44,null,'cliff'),P('Hafen',-60,440,72,2.6,'harbor'),P('Fabrik',300,40,62,7,'factory'),P('Frostgipfel',-300,-420,80,null,'peak'),P('Wüstenschlucht',320,380,70,8,'mesa'),P('Villenhügel',-330,40,40,14,'villa'),P('Wohnwagenpark',140,-120,40,6,'trailer'),P('Hochhausviertel',-170,40,58,6,'city')];
 MESA=POI.find(q=>q.kind==='mesa');
 const base=(x,z)=>Math.sin(x*.011+s)*Math.cos(z*.009-s)*10+Math.sin(x*.027+z*.023+s*2)*3.5+Math.cos(x*.005-z*.007)*7+Math.sin(x*.07+s)*Math.cos(z*.06)*.8;
 H=(x,z)=>{const d=Math.hypot(x,z)/ISL;let fall=d<.8?1:Math.max(0,1-(d-.8)/.24);let y=(base(x,z)+13)*fall-5*(1-fall)-1;
  for(const p of POI){const dd=Math.hypot(x-p.x,z-p.z);if(p.kind==='castle'){const t=1-smooth((dd-p.r*.8)/(p.r*1.6));y=lerp(y,p.h-((dd>p.r*.8)?(dd-p.r*.8)*.35:0),t);continue}
   if(p.kind==='cliff'){y+=Math.max(0,1-dd/p.r)*22*fall;continue}if(p.kind==='peak'){const k=Math.max(0,1-dd/(p.r*1.6));y+=Math.pow(k,1.5)*58*fall;if(dd<14)y=lerp(y,y-Math.pow(k,1.5)*58*fall+58*Math.pow(Math.max(0,1-14/(p.r*1.6)),1.5)*fall,1-dd/14);continue}
   if(p.h==null)continue;const t=1-smooth((dd-p.r*.75)/(p.r*.6));if(p.kind==='lake')y=lerp(y,p.h-(1-Math.min(1,dd/p.r))*4,t*.95);else if(p.kind==='harbor')y=lerp(y,p.h,t*(dd<p.r*1.1?1:.8));else y=lerp(y,p.h,t)}
  return y}}
function buildWorld(seed){
 if(world){scene.remove(world);world.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
 world=new THREE.Group();scene.add(world);grid=new Map();HOUSES=[];nBoxes=0;trees=[];for(const l of loot.values())scene.remove(l.g);loot.clear();for(const c of chests.values())if(c.drop)scene.remove(c.g);chests.clear();for(const s of structs.values())scene.remove(s.mesh);structs.clear();anims=[];lootN=0;
 makeWorldFn(seed);const r=rng(seed+1);
 const N=SET.gfx===0?180:SET.gfx===1?240:300,g=new THREE.PlaneGeometry(ISL*2.8,ISL*2.8,N,N);g.rotateX(-PI/2);const p=g.attributes.position,cols=[];
 const farm=POI.find(q=>q.kind==='farm');
 for(let i=0;i<p.count;i++){const X=p.getX(i),Z=p.getZ(i),y=H(X,Z);p.setY(i,y);const n=Math.sin(X*.05)*Math.cos(Z*.04)*.05+Math.sin(X*.21+Z*.17)*.03;let c;
  if(y<.8)c=[.93,.85,.62];else if(inSnow(X,Z))c=y>30?[.95+n,.96+n,1]:[.88+n,.92+n,.95];else if(inDesert(X,Z))c=[.86+n,.68+n,.42+n];else if(y>34)c=[.6+n,.6+n,.57+n];else if(y>24)c=[.45+n,.55+n,.32];else c=[.36+n,.63+n*1.5,.25+n];
  if(Math.hypot(X-farm.x,Z-farm.z)<farm.r*.9&&y>.8)c=[.58+n,.47+n,.27];cols.push(...c)}
 g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.computeVertexNormals();
 const gt=grassTex.clone();gt.needsUpdate=true;gt.repeat.set(140,140);
 const ter=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,map:gt}));ter.receiveShadow=true;world.add(ter);
 water=new THREE.Mesh(new THREE.PlaneGeometry(8000,8000),new THREE.MeshStandardMaterial({color:0x2f9ee0,map:waterTex,roughness:.12,metalness:.25,transparent:true,opacity:.88}));water.rotation.x=-PI/2;water.position.y=-.4;world.add(water);
 const sand=new THREE.Mesh(new THREE.RingGeometry(ISL*.99,ISL*1.1,96),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.25}));sand.rotation.x=-PI/2;sand.position.y=-.3;world.add(sand);anims.push((dt,t)=>{sand.material.opacity=.15+.1*Math.sin(t*1.3)});
 for(let i=0;i<10;i++){const a=i/10*TAU+r(),d=1900+r()*300,m=new THREE.Mesh(new THREE.ConeGeometry(180+r()*160,90+r()*110,7),mat('far',{color:0x86a596},1));m.position.set(Math.cos(a)*d,-5,Math.sin(a)*d);world.add(m)}
 const T=POI.find(q=>q.kind==='town');
 const road=(A,q)=>{const L=Math.hypot(q.x-A.x,q.z-A.z),n=Math.ceil(L/5),pos=[],uv=[],idx=[];const dx=q.z-A.z,dz=-(q.x-A.x),dl=Math.hypot(dx,dz);for(let i=0;i<=n;i++){const t=i/n,w=Math.sin(t*PI)*10*Math.sin(q.x),X=lerp(A.x,q.x,t)+dx/dl*w,Z=lerp(A.z,q.z,t)+dz/dl*w;for(const s of[-1,1]){const px=X+dx/dl*3.6*s,pz=Z+dz/dl*3.6*s;pos.push(px,Math.max(H(px,pz),-.2)+.14,pz)}uv.push(0,t*L/8,1,t*L/8);if(i<n){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3)}}
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();const m=new THREE.Mesh(gg,mat('road',{map:roadTex,roughness:.9}));m.receiveShadow=true;world.add(m)};
 POI.filter(q=>['farm','castle','gas','light','factory','harbor','town2','trailer','city'].includes(q.kind)).forEach(q=>road(T,q));road(POI.find(q=>q.kind==='factory'),POI.find(q=>q.kind==='mesa'));road(POI.find(q=>q.kind==='town2'),POI.find(q=>q.kind==='villa'));
 for(const q of POI)buildPOI(q,r);
 for(let i=0;i<140;i++){const a=r()*TAU,d=Math.sqrt(r())*ISL*.78,x=Math.cos(a)*d,z=Math.sin(a)*d,y=H(x,z);if(y<.5)continue;spawnLoot(r,x,y+.2,z)}
 for(let i=0;i<34;i++){const a=r()*TAU,d=Math.sqrt(r())*ISL*.78,x=Math.cos(a)*d,z=Math.sin(a)*d,y=H(x,z);if(y<.5)continue;addChest(r,x,y,z,r()*TAU)}
 vegetation(r);flushBuckets()}
const WALLC=[0xf4e1c1,0xd9e8f5,0xf5d0c5,0xe0f0d0,0xfff2b3,0xe8d5f0];
function gable(cx,cy,cz,w,d,hh,m,alongZ){const ang=Math.atan2(hh,w/2),L=Math.hypot(w/2,hh)+.4;
 if(!alongZ){for(const s of[-1,1])addGeo(BOXG,m,cx+s*w/4,cy+hh/2,cz,0,0,-s*ang,L,.3,d+.8)}else{for(const s of[-1,1])addGeo(BOXG,m,cx,cy+hh/2,cz+s*w/4,0,s*ang,0,d+.8,.3,L)}
 addBox(cx-(alongZ?d:w)/2,cy,cz-(alongZ?w:d)/2,cx+(alongZ?d:w)/2,cy+hh*.45,cz+(alongZ?w:d)/2)}
/* ---------- Richtig gebaute Häuser: Räume, Türen, Fenster, Treppen, Möbel ---------- */
const sidingTex=ctex(128,128,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?'#f2f2f2':'#e6e6e6';x.fillRect(0,i*16,w,16);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(0,i*16+14,w,2)}});
const shingleTex=ctex(128,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=0;c<6;c++){x.fillStyle=`rgba(0,0,0,${.06+Math.random()*.14})`;x.fillRect(c*22+(r%2)*11,r*16,21,15);x.fillStyle='rgba(0,0,0,.3)';x.fillRect(c*22+(r%2)*11,r*16+14,21,2)}});
const tileTex=ctex(128,128,(x,w,h)=>{x.fillStyle='#e9e4da';x.fillRect(0,0,w,h);x.strokeStyle='#b9b2a4';x.lineWidth=2;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*32,0);x.lineTo(i*32,h);x.moveTo(0,i*32);x.lineTo(w,i*32);x.stroke()}});
const parquetTex=ctex(128,128,(x,w,h)=>{for(let r=0;r<8;r++)for(let c=0;c<2;c++){const v=150+Math.random()*40|0;x.fillStyle=`rgb(${v},${v*.68|0},${v*.42|0})`;x.fillRect(c*64+(r%2)*32-32,r*16,64,16);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(c*64+(r%2)*32-32,r*16,1,16);x.fillRect(0,r*16+15,w,1)}});
const wallpaperTex=ctex(64,64,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='rgba(0,0,0,.06)';for(let i=0;i<4;i++)x.fillRect(i*16,0,6,h)});
let HOUSES=[];const SIDING=[0xf4e1c1,0xcfe3f5,0xf5d0c5,0xd8ecc8,0xfff0a8,0xe2d3f0,0xf5f5f5,0xb8d8e8];
function mkBuilder(x,z,rot,by){// lokale Koordinaten (Front = +z) → Welt, Drehung in 90°-Schritten
 const c=[1,0,-1,0][rot],s=[0,1,0,-1][rot];const T=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];const odd=rot%2===1;
 const B={T,by,rot,
  box(lx,ly,lz,sx,sy,sz,m,coll,o){const [wx,wz]=T(lx,lz);const ax=odd?sz:sx,az=odd?sx:sz;addGeo(BOXG,m,wx,by+ly,wz,0,0,0,ax,sy,az);if(coll!==false)addBox(wx-ax/2,by+ly-sy/2,wz-az/2,wx+ax/2,by+ly+sy/2,wz+az/2,o)},
  deco(lx,ly,lz,sx,sy,sz,m){B.box(lx,ly,lz,sx,sy,sz,m,false)},
  // Wand entlang x (bei lz) oder entlang z (bei lx) mit Öffnungen [{a,b,lo,hi,win}]
  wall(axis,at,p0,p1,y0,h,ops,m,th){th=th||.3;ops=(ops||[]).slice().sort((u,v)=>u.a-v.a);let cur=p0;const seg=(a,b,yb,yt)=>{if(b-a<.02||yt-yb<.02)return;const mid=(a+b)/2,len=b-a,ym=y0+(yb+yt)/2,hh=yt-yb;if(axis==='x')B.box(mid,ym,at,len,hh,th,m,true,{mat:'wood'});else B.box(at,ym,mid,th,hh,len,m,true,{mat:'wood'})};
   for(const o of ops){seg(cur,o.a,0,h);seg(o.a,o.b,0,o.lo);seg(o.a,o.b,o.hi,h);
    const mid=(o.a+o.b)/2,len=o.b-o.a;const fr=mat('frame',{color:0xffffff}),gl=mat('glassW',{color:0x9fd0f0,roughness:.05,metalness:.3,transparent:true,opacity:.35});
    if(o.win){if(axis==='x'){B.deco(mid,y0+(o.lo+o.hi)/2,at,len,o.hi-o.lo,.05,gl);B.deco(mid,y0+o.lo-.05,at,len+.2,.1,th+.16,fr);B.deco(mid,y0+o.hi+.05,at,len+.2,.1,th+.12,fr);B.deco(mid,y0+(o.lo+o.hi)/2,at,.06,o.hi-o.lo,th+.06,fr)}
     else{B.deco(at,y0+(o.lo+o.hi)/2,mid,.05,o.hi-o.lo,len,gl);B.deco(at,y0+o.lo-.05,mid,th+.16,.1,len+.2,fr);B.deco(at,y0+o.hi+.05,mid,th+.12,.1,len+.2,fr);B.deco(at,y0+(o.lo+o.hi)/2,mid,th+.06,o.hi-o.lo,.06,fr)}}
    else{if(axis==='x'){B.deco(o.a-.06,y0+o.hi/2,at,.12,o.hi,th+.1,fr);B.deco(o.b+.06,y0+o.hi/2,at,.12,o.hi,th+.1,fr);B.deco(mid,y0+o.hi+.06,at,len+.24,.12,th+.1,fr)}else{B.deco(at,y0+o.hi/2,o.a-.06,th+.1,o.hi,.12,fr);B.deco(at,y0+o.hi/2,o.b+.06,th+.1,o.hi,.12,fr);B.deco(at,y0+o.hi+.06,mid,th+.1,.12,len+.24,fr)}}
    cur=o.b}seg(cur,p1,0,h)},
  stairs(lx0,lz0,lz1,w,y0,y1,m){const n=Math.max(6,Math.round((y1-y0)/.36)),dz=(lz1-lz0)/n,dy=(y1-y0)/n;for(let i=0;i<n;i++)B.box(lx0,y0+dy*(i+.5),lz0+dz*(i+.5),w,dy,Math.abs(dz)+.02,m,true,{mat:'wood'})},
  floorWithHole(y,x0,x1,z0,z1,hole,m){// Bodenplatte mit Treppenloch
   const t=.25,ry=y-t/2;if(!hole){B.box((x0+x1)/2,ry,(z0+z1)/2,x1-x0,t,z1-z0,m);return}const [hx0,hx1,hz0,hz1]=hole;
   B.box((x0+hx0)/2,ry,(z0+z1)/2,hx0-x0,t,z1-z0,m);B.box((hx1+x1)/2,ry,(z0+z1)/2,x1-hx1,t,z1-z0,m);B.box((hx0+hx1)/2,ry,(z0+hz0)/2,hx1-hx0,t,hz0-z0,m);B.box((hx0+hx1)/2,ry,(hz1+z1)/2,hx1-hx0,t,z1-hz1,m)}};
 return B}
/* Möbel */
const FM={wood:()=>mat('fwood',{color:0x8a5a34,map:woodTex}),dark:()=>mat('fdark',{color:0x3b3f46}),white:()=>mat('fwhite',{color:0xf4f4f0}),red:()=>mat('fred',{color:0xb8333a}),blue:()=>mat('fblue',{color:0x3d5a80}),green:()=>mat('fgreen',{color:0x4a7a52}),bed:()=>mat('fbed',{color:0xf0ead8}),metal:()=>mat('fmet',{color:0xc0c6cc,metalness:.6,roughness:.3}),screen:()=>mat('fscr',{color:0x111820,emissive:0x0a1a30,roughness:.2})};
function sofa(B,lx,lz,ry,y,col){const m=col||FM.blue();if(ry){B.deco(lx,y+.25,lz,.9,.5,2.2,m);B.deco(lx-.35*ry,y+.6,lz,.2,.8,2.2,m);B.deco(lx,y+.45,lz-1.05,.9,.4,.15,m);B.deco(lx,y+.45,lz+1.05,.9,.4,.15,m)}else{B.deco(lx,y+.25,lz,2.2,.5,.9,m);B.deco(lx,y+.6,lz-.35,2.2,.8,.2,m)}}
function table(B,lx,lz,y,w,d){const m=FM.wood();B.deco(lx,y+.75,lz,w,.08,d,m);for(const [a,b] of[[-1,-1],[1,-1],[-1,1],[1,1]])B.deco(lx+a*(w/2-.08),y+.37,lz+b*(d/2-.08),.08,.74,.08,m);for(const s of[-1,1]){B.deco(lx+s*(w/2+.35),y+.45,lz,.45,.06,.45,m);B.deco(lx+s*(w/2+.55),y+.75,lz,.06,.6,.45,m)}}
function bed(B,lx,lz,y,ry){const w=ry?2.1:1.5,d=ry?1.5:2.1;B.deco(lx,y+.25,lz,w,.5,d,FM.wood());B.deco(lx,y+.55,lz,w-.1,.15,d-.1,FM.bed());B.deco(lx+(ry?-(w/2-.3):0),y+.68,lz+(ry?0:-(d/2-.3)),ry?.4:w-.3,.12,ry?d-.3:.4,FM.white());B.deco(lx+(ry?.25:0),y+.64,lz+(ry?0:.25),ry?w*.6:w-.05,.08,ry?d-.05:d*.6,[FM.red(),FM.blue(),FM.green()][(lx*7+lz*3&3)%3])}
function kitchen(B,lx,lz,y,len,axis){const m=FM.white(),top=mat('ftop',{color:0x6b6158,roughness:.4});if(axis==='x'){B.box(lx,y+.45,lz,len,.9,.65,m,true,{mat:'wood'});B.deco(lx,y+.93,lz,len+.04,.06,.7,top);B.deco(lx+len/2-.45,y+1,lz,.5,.05,.4,FM.metal());B.box(lx-len/2-.45,y+1,lz,.75,2,.7,FM.metal(),true,{mat:'metal'})}else{B.box(lx,y+.45,lz,.65,.9,len,m,true,{mat:'wood'});B.deco(lx,y+.93,lz,.7,.06,len+.04,top);B.box(lx,y+1,lz-len/2-.45,.7,2,.75,FM.metal(),true,{mat:'metal'})}}
function shelf(B,lx,lz,y,axis){const m=FM.wood();if(axis==='x'){B.deco(lx,y+1,lz,1.6,2,.4,m);for(let i=0;i<4;i++)B.deco(lx,y+.3+i*.5,lz+.02,1.4,.3,.36,[FM.red(),FM.blue(),FM.green(),FM.white()][i])}else{B.deco(lx,y+1,lz,.4,2,1.6,m);for(let i=0;i<4;i++)B.deco(lx+.02,y+.3+i*.5,lz,.36,.3,1.4,[FM.red(),FM.blue(),FM.green(),FM.white()][i])}}
function tv(B,lx,lz,y,axis){B.deco(lx,y+.3,lz,axis==='x'?1.6:.5,.6,axis==='x'?.5:1.6,FM.dark());B.deco(lx,y+1,lz,axis==='x'?1.4:.06,.8,axis==='x'?.06:1.4,FM.screen())}
function bath(B,lx,lz,y){B.deco(lx,y+.3,lz,1.6,.6,.8,FM.white());B.deco(lx,y+.58,lz,1.4,.04,.6,mat('water2',{color:0x7fc6ff,roughness:.1}));B.deco(lx+1.4,y+.25,lz,.45,.5,.6,FM.white())}
function rug(B,lx,lz,y,w,d){B.deco(lx,y+.02,lz,w,.03,d,mat('rug'+((lx*13|0)%3),{color:[0x9b2226,0x386641,0x3d5a80][Math.abs(lx*13|0)%3]}))}
/* Familienhaus (2 Stockwerke, Satteldach) oder Bungalow (1 Stockwerk, Flachdach mit Leiter) */
function house(x,z,r,face,opt){opt=opt||{};const rot=face<0?2:face>1?1:0;const two=opt.two??r()<.6;const W=14,D=12,FH=3.5;
 const by=Math.max(H(x,z),H(x-7,z-7),H(x+7,z-7),H(x-7,z+7),H(x+7,z+7))+.2;const B=mkBuilder(x,z,rot,by);HOUSES.push({x,z,rot,by,two});
 const sc=opt.wall??SIDING[r()*SIDING.length|0],wm=mat('sid'+sc,{color:sc,map:sidingTex}),im=mat('inw',{color:0xf3efe6,map:wallpaperTex}),fl=mat('parq',{map:parquetTex}),tl=mat('tile',{map:tileTex}),found=mat('found',{color:0x9f9a90,map:stoneTex});
 const roofC=opt.roof??[0xa23b2a,0x5d4037,0x34495e,0x2e5d3a,0x4a4a52][r()*5|0],rm=mat('shg'+roofC,{color:roofC,map:shingleTex});
 B.box(0,-1.6,0,W+.6,3.2,D+.6,found,true,{mat:'stone'});
 B.box(-W/4,.06,0,W/2,.12,D-.3,fl);B.box(W/4,.06,0,W/2,.12,D-.3,tl);
 const win=(a,b)=>({a,b,lo:.95,hi:2.35,win:1}),door=(a,b)=>({a,b,lo:0,hi:2.4});
 // Erdgeschoss: Wohnzimmer (links) | Küche (rechts), Treppe rechts hinten
 B.wall('x',D/2,-W/2,W/2,0,FH,[win(-5.6,-3.8),door(-1.8,-.4),win(2.6,4.6)],wm);
 B.wall('x',-D/2,-W/2,W/2,0,FH,[win(-4.8,-2.8),door(4.6,5.9),win(.6,2)],wm);
 B.wall('z',-W/2,-D/2,D/2,0,FH,[win(-1,1)],wm);B.wall('z',W/2,-D/2,D/2,0,FH,[win(1,3)],wm);
 B.wall('z',.8,-D/2+.15,D/2-.15,0,FH,[door(1.6,2.9)],im,.15);
 sofa(B,-4,1.4,0,0);tv(B,-4,-1.2,0,'x');rug(B,-4,.2,0,3.2,2.4);shelf(B,-6.6,-3.6,0,'z');table(B,-4,-4,0,1.6,1);
 kitchen(B,4,5.4,0,4,'x');table(B,4.2,1.8,0,1.4,1);
 spawnLoot(r,B.T(-3,3)[0],by+.3,B.T(-3,3)[1]);spawnLoot(r,B.T(3.5,0)[0],by+.3,B.T(3.5,0)[1]);
 const porch=mat('porch',{color:0x8a6a4a,map:woodTex});B.box(-1.1,-.05,D/2+1.2,3.4,.2,2.2,porch,true,{mat:'wood'});B.box(-1.1,-.35,D/2+2.6,3.4,.3,.8,porch);
 if(two){// Treppe (rechts hinten) und Obergeschoss
  B.stairs(1.6,D/2-2.3,-D/2+1.8,1.3,0,FH,fl);B.box(.95+.02,FH/2,-.2,.06,FH,.06,FM.wood(),false);
  B.floorWithHole(FH,-W/2+.15,W/2-.15,-D/2+.15,D/2-.15,[.9,2.35,-D/2+.15,D/2-1.9],fl);B.deco(2.4,FH+.5,D/2-1.95,0.05,.9,.05,FM.wood());B.box(2.4,FH+.95,(-D/2+D/2-1.9)/2,.08,.08,D-2.2,FM.wood(),false);
  const y1=FH;B.wall('x',D/2,-W/2,W/2,y1,FH,[win(-5.6,-3.8),win(-1.8,-.4),win(2.6,4.6)],wm);B.wall('x',-D/2,-W/2,W/2,y1,FH,[win(-4.8,-2.8),win(4,5.4)],wm);
  B.wall('z',-W/2,-D/2,D/2,y1,FH,[win(-3,-1.4),win(1.4,3)],wm);B.wall('z',W/2,-D/2,D/2,y1,FH,[win(-3,-1.5),win(1.5,3)],wm);
  B.wall('x',0,-W/2+.15,.8,y1,FH,[door(-1.6,-.4)],im,.15);B.wall('z',.8,-D/2+.15,D/2-.15,y1,FH,[door(-1,.2),door(3.2,4.4)],im,.15);B.wall('x',1.6,2.5,W/2-.15,y1,FH,[door(3.6,4.8)],im,.15);
  bed(B,-4.2,-3.4,y1,0);bed(B,-4.2,3.6,y1,0);shelf(B,-6.6,-.9,y1,'z');B.deco(5,y1+.05,-3.5,3.6,.06,3.6,tl);bath(B,4.4,-4.9,y1);table(B,4.6,4.2,y1,1.2,.8);
  spawnLoot(r,B.T(-2,-3)[0],by+y1+.3,B.T(-2,-3)[1]);addChest(r,B.T(-6,4.8)[0],by+y1+.02,B.T(-6,4.8)[1],rot*PI/2);
  B.box(0,2*FH+.15,0,W+.5,.3,D+.5,mat('trim',{color:0xffffff}),true);roofOn(B,x,z,rot,by+2*FH+.3,W,D,rm,wm)}
 else{// Bungalow: Flachdach mit Brüstung und Leiter
  const y1=FH;B.box(0,y1+.15,0,W+.5,.3,D+.5,mat('flat',{color:0x6d6d6d,map:plasterTex}));for(const [lx,lz,sx,sz] of[[0,D/2+.1,W+.5,.25],[0,-D/2-.1,W+.5,.25],[W/2+.1,0,.25,D+.5],[-W/2-.1,0,.25,D+.5]])B.box(lx,y1+.75,lz,sx,.9,sz,wm);
  for(let i=0;i<10;i++)B.deco(W/2+.35,i*.42+.2,-3,.08,.08,.7,FM.metal());B.deco(W/2+.35,FH/2+.4,-3.35,.08,FH+.8,.08,FM.metal());B.deco(W/2+.35,FH/2+.4,-2.65,.08,FH+.8,.08,FM.metal());
  for(let i=0;i<9;i++)B.box(W/2+.6,i*.42+.25,-3,.5,.1,.7,FM.metal(),true,{mat:'metal'});
  bed(B,4.5,-3.8,0,1);addChest(r,B.T(6,2)[0],by+.12,B.T(6,2)[1],rot*PI/2);deco(B.T(3,-1.5)[0],by+2,B.T(3,-1.5)[1],.1,.1,.1,FM.white());spawnLoot(r,B.T(0,4)[0],by+y1+.6,B.T(0,4)[1])}
 // Schornstein, Briefkasten, Garten
 const [mx,mz]=B.T(-1.1,D/2+3.4);addGeo(new THREE.CylinderGeometry(.05,.05,1.1,6),FM.dark(),mx+1.6,H(mx,mz)+.55,mz);deco(mx+1.6,H(mx,mz)+1.15,mz,.35,.25,.5,FM.red())}
function roofOn(B,x,z,rot,y,W,D,rm,wm){const odd=rot%2===1,hh=3.2;
 if(!odd)gable(x,y,z,D+.8,W+.8,hh,rm,true);else gable(x,y,z,D+.8,W+.8,hh,rm,false);
 const sh=new THREE.Shape();sh.moveTo(-D/2,0);sh.lineTo(D/2,0);sh.lineTo(0,hh);sh.lineTo(-D/2,0);const tg=new THREE.ExtrudeGeometry(sh,{depth:.3,bevelEnabled:false}).translate(0,0,-.15);
 for(const sx of[-1,1]){const [wx,wz]=B.T(sx*W/2,0);addGeo(tg,wm,wx,y,wz,PI/2+rot*PI/2)}
 const [cx,cz]=B.T(W/2-3,-2);deco(cx,y+2,cz,1,3,1,mat('chim',{color:0x8a5a44,map:brickTex}))}
/* Importierte Modelle (CC0) als Kulisse/Requisiten */
function prop(f,x,z,ry,o){const M=MODELS[f];if(!M)return null;o=o||{};const g=new THREE.Group();const m=M.scene.clone(true);
 const s=o.h?o.h/M.size.y:o.L?o.L/Math.max(M.size.x,M.size.z):1;m.scale.setScalar(s);m.position.set(-M.center.x*s,-M.min.y*s,-M.center.z*s);g.add(m);
 const y=o.y??Math.max(H(x,z),-.3);g.position.set(x,y,z);g.rotation.y=ry||0;m.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true}});world.add(g);
 if(o.coll!==false){const c=Math.abs(Math.cos(ry||0)),sn=Math.abs(Math.sin(ry||0)),hx=(M.size.x*c+M.size.z*sn)*s/2*(o.shrink||.95),hz=(M.size.x*sn+M.size.z*c)*s/2*(o.shrink||.95);addBox(x-hx,y,z-hz,x+hx,y+M.size.y*s,z+hz,{mat:o.mat||'metal'})}
 return g}
/* Halle mit Toren an zwei Seiten und Flachdach */
function shed(x,z,w,d,h,wm,r,opt){opt=opt||{};const by=Math.max(H(x,z),H(x-w/2,z-d/2),H(x+w/2,z+d/2),H(x-w/2,z+d/2),H(x+w/2,z-d/2))+.1;const gate=Math.min(8,w*.4);
 solid(x,by-2,z,w+1,4,d+1,mat('found',{color:0x9f9a90,map:stoneTex}));solid(x,by+.05,z,w,.1,d,mat('concrete',{color:0xa9a9a2,map:plasterTex}));
 solid(x-w/2,by+h/2,z,.5,h,d,wm,{mat:'metal'});solid(x+w/2,by+h/2,z,.5,h,d,wm,{mat:'metal'});
 for(const s of[-1,1]){const zz=z+s*d/2;solid(x-(w+gate)/4,by+h/2,zz,(w-gate)/2,h,.5,wm,{mat:'metal'});solid(x+(w+gate)/4,by+h/2,zz,(w-gate)/2,h,.5,wm,{mat:'metal'});solid(x,by+h-1,zz,gate,2,.5,wm)}
 solid(x,by+h+.2,z,w+.8,.4,d+.8,mat('roofm',{color:0x6b737c,map:metalTex}));
 for(let i=0;i<3;i++)deco(x-w/2+.3,by+h*.7,z-d/3+i*d/3,.08,1.2,d/4,mat('glass',{color:0x7fb8e6,roughness:.1,metalness:.6,emissive:0x0a2030}));
 if(opt.floor){solid(x+w/4,by+h/2,z,w/2-1,.3,d-2,mat('grate',{color:0x555b63,metalness:.6,roughness:.4}));for(let s=0;s<9;s++)solid(x-1+s*0,by+.25+s*h/18,z-d/2+2+s*1.1,2,.5,1,mat('grate'))}
 for(let i=0;i<(opt.loot||3);i++)spawnLoot(r,x+(r()-.5)*(w-4),by+.3,z+(r()-.5)*(d-4));if(opt.chest!==false)addChest(r,x-w/2+1.6,by+.1,z+(r()-.5)*(d-4),PI/2);return by}
function container(x,z,ry,c,lvl,r){const y=Math.max(H(x,z),H(x+3,z+3),H(x-3,z-3))+lvl*2.6;const cm=mat('cont'+c,{color:c,map:containerTex,metalness:.3,roughness:.6});const alongX=Math.abs(Math.sin(ry))>.5;
 if(r&&r()<.25&&lvl===0){// offener Container mit Beute
  const L=6,Wd=2.5;if(alongX){solid(x,y+1.3,z-Wd/2,L,2.6,.15,cm,{mat:'metal'});solid(x,y+1.3,z+Wd/2,L,2.6,.15,cm,{mat:'metal'});solid(x-L/2,y+1.3,z,.15,2.6,Wd,cm,{mat:'metal'});solid(x,y+2.6,z,L,.15,Wd,cm)}else{solid(x-Wd/2,y+1.3,z,.15,2.6,L,cm,{mat:'metal'});solid(x+Wd/2,y+1.3,z,.15,2.6,L,cm,{mat:'metal'});solid(x,y+1.3,z-L/2,Wd,2.6,.15,cm,{mat:'metal'});solid(x,y+2.6,z,Wd,.15,L,cm)}
  spawnLoot(r,x,y+.3,z);return}
 if(alongX)solid(x,y+1.3,z,6,2.6,2.5,cm,{mat:'metal'});else solid(x,y+1.3,z,2.5,2.6,6,cm,{mat:'metal'})}
function streetLamp(x,z){const y=H(x,z);addGeo(new THREE.CylinderGeometry(.12,.16,6,6),mat('metal',{color:0x3b3f46,metalness:.6,roughness:.4}),x,y+3,z);deco(x+.7,y+6,z,1.6,.15,.15,mat('metal'));deco(x+1.4,y+5.85,z,.5,.18,.5,mat('lamp',{color:0xfff3c4,emissive:0xffe9a0,emissiveIntensity:.6}))}
const CARM=['sedan','taxi','police_car','van','suv','hatchback_sports','ambulance','truck'];
function car(x,z,ry,c){if(MODELS.sedan){const f=CARM[Math.abs((x*7+z*13)|0)%CARM.length];prop(f,x,z,ry+PI/2,{L:f==='truck'?7:f==='van'||f==='ambulance'?5.4:4.6,mat:'metal'});return}const y=H(x,z),cm=mat('car'+c,{color:c,metalness:.5,roughness:.35}),tire=mat('tire',{color:0x16171a});const cs=Math.cos(ry),sn=Math.sin(ry),P=(lx,lz)=>[x+lx*cs+lz*sn,z-lx*sn+lz*cs];
 addGeo(BOXG,cm,x,y+.85,z,ry,0,0,2,.8,4.4);const [gx,gz]=P(0,.3);addGeo(BOXG,cm,gx,y+1.55,gz,ry,0,0,1.8,.65,2.3);addGeo(BOXG,mat('glass'),gx,y+1.55,gz,ry,0,0,1.86,.5,2.1);
 for(const [lx,lz] of[[-1,1.4],[1,1.4],[-1,-1.4],[1,-1.4]]){const [a,b]=P(lx,lz);addGeo(new THREE.CylinderGeometry(.42,.42,.3,12).rotateZ(PI/2),tire,a,y+.42,b,ry)}
 for(const s of[-.6,.6]){const [a,b]=P(s,-2.21);addGeo(BOXG,mat('lamp'),a,y+.95,b,ry,0,0,.4,.15,.05)}
 addBox(x-2.1,y,z-2.1,x+2.1,y+1.9,z+2.1,{mat:'metal'})}
function townGrid(x,z,r,blocks,sp,roadLen){
 for(const ry of[0,PI/2]){const g=new THREE.PlaneGeometry(8,roadLen,1,40);g.rotateX(-PI/2);g.rotateY(ry);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,H(x+p.getX(i),z+p.getZ(i))+.16);g.computeVertexNormals();const m=new THREE.Mesh(g,mat('road',{map:roadTex,roughness:.9}));m.position.set(x,0,z);m.receiveShadow=true;world.add(m)}
 for(const [qx,qz] of[[-1,-1],[1,-1],[-1,1],[1,1]])for(const [ox,oz] of blocks){if(r()<.12)continue;house(x+qx*(16+ox*sp),z+qz*(16+oz*sp),r,-qz)}
 for(let i=-3;i<=3;i++){if(!i)continue;streetLamp(x+i*roadLen/8,z+5.5);streetLamp(x-5.5,z+i*roadLen/8)}}
function buildPOI(q,r){const {x,z}=q;
 if(q.kind==='town'){townGrid(x,z,r,[[0,0],[1,0],[0,1]],22,170);
  for(let i=0;i<6;i++){const a=r()<.5;car(a?x+(r()-.5)*140:x+2.6,a?z+2.6:z+(r()-.5)*140,a?PI/2:0,[0xd63031,0x0984e3,0xfdcb6e,0xffffff,0x2d3436,0x00b894][i])}
  const y=H(x,z);addGeo(new THREE.CylinderGeometry(3.2,3.4,.8,20),mat('stone',{color:0xc0bcb4,map:stoneTex}),x,y+.4,z);addGeo(new THREE.CylinderGeometry(2.8,2.8,.1,20),mat('pool',{color:0x4fb3ff,emissive:0x0a3050,roughness:.1}),x,y+.75,z);addGeo(new THREE.CylinderGeometry(.4,.5,2.4,8),mat('stone'),x,y+1.6,z);addGeo(new THREE.SphereGeometry(.7,10,8),mat('pool'),x,y+3,z);addBox(x-3.2,y,z-3.2,x+3.2,y+.8,z+3.2,{mat:'stone'})}
 else if(q.kind==='city'){const y=H(x,z);
  for(const ry of[0,PI/2])for(const o of[-22,22]){const g=new THREE.PlaneGeometry(9,120,1,30);g.rotateX(-PI/2);g.rotateY(ry);const p=g.attributes.position;for(let i=0;i<p.count;i++){const X=p.getX(i)+(ry?0:o),Z=p.getZ(i)+(ry?o:0);p.setX(i,X);p.setZ(i,Z);p.setY(i,H(x+X,z+Z)+.17)}g.computeVertexNormals();const m=new THREE.Mesh(g,mat('road',{map:roadTex,roughness:.9}));m.position.set(x,0,z);m.receiveShadow=true;world.add(m)}
  const lots=[];for(const i of[-1,0,1])for(const j of[-1,0,1])lots.push([i*44,j*44]);const SK=['skyscraper_a','skyscraper_b','skyscraper_c'],BL=['building_a','building_b','building_c','building_d','building_e','building_f','building_g','building_h'];
  lots.forEach(([ox,oz],k)=>{if(!ox&&!oz){spawnLoot(r,x,y+.3,z);addChest(r,x+4,H(x+4,z),z,0);for(let i=0;i<6;i++)prop(i%2?'barrel':'crate',x+(r()-.5)*24,z+(r()-.5)*24,r()*TAU,{h:i%2?1.2:1,mat:'wood'});return}
   const big=Math.abs(ox)+Math.abs(oz)<50;const f=big?SK[k%3]:BL[k%8];prop(f,x+ox,z+oz,(k%4)*PI/2,{h:big?34+r()*14:12+r()*6,shrink:.85,mat:'stone'});const bx=x+ox*.62,bz=z+oz*.62;spawnLoot(r,bx,H(bx,bz)+.3,bz);if(k%2)addChest(r,bx+3,H(bx+3,bz),bz,0)});
  for(let i=0;i<5;i++){const a=r()<.5;car(a?x+(r()-.5)*100:x+22+2.5,a?z+22+2.5:z+(r()-.5)*100,a?PI/2:0,0)}}
 else if(q.kind==='town2'){townGrid(x,z,r,[[0,0],[1,0],[0,1],[1,1]],20,150);for(let i=0;i<4;i++){const a=r()<.5;car(a?x+(r()-.5)*110:x-2.6,a?z-2.6:z+(r()-.5)*110,a?PI/2:0,[0x6c5ce7,0xe17055,0x00cec9,0xfab1a0][i])}
  const y=H(x,z);solid(x+15,y+5,z-15,8,10,8,mat('tower',{color:0xe8d5b5,map:plasterTex}));gable(x+15,y+10,z-15,8.6,8.6,4,mat('roofc',{color:0x34495e,map:roofTex}),false);addChest(r,x+15,y+10.1,z-15,0)}
 else if(q.kind==='farm'){const y=H(x,z)+.1,red=mat('barn',{color:0xb03a2e,map:woodTex}),wt=mat('trim',{color:0xffffff}),hay=mat('hay',{color:0xe8c04a});
  const bx=x-10,bz=z-6,w=18,d=14,hh=8;solid(bx,y+hh/2,bz-d/2,w,hh,.5,red);solid(bx-w/2,y+hh/2,bz,.5,hh,d,red);solid(bx+w/2,y+hh/2,bz,.5,hh,d,red);solid(bx-w/2+3.5,y+hh/2,bz+d/2,7,hh,.5,red);solid(bx+w/2-3.5,y+hh/2,bz+d/2,7,hh,.5,red);solid(bx,y+hh-1.2,bz+d/2,4,2.4,.5,red);
  deco(bx,y+5.8,bz+d/2+.3,4.2,.25,.3,wt);for(const s of[-1,1])deco(bx+s*2.1,y+2.9,bz+d/2+.3,.25,5.8,.3,wt);deco(bx,y+2.9,bz+d/2+.3,.2,5.8,.3,wt,PI/4);
  solid(bx+3,y+4,bz,w-6,.3,d,mat('floor',{color:0x9a7450,map:woodTex}));for(let s=0;s<8;s++)solid(bx-w/2+1.3,y+.25+s*.5,bz-d/2+1.6+s*.85,2.2,.5,.9,mat('floor'));
  gable(bx,y+hh,bz,w+.5,d+.6,5,mat('roofg',{color:0x5d4037,map:roofTex}),false);
  spawnLoot(r,bx+3,y+4.3,bz);spawnLoot(r,bx-3,y+.3,bz+2);addChest(r,bx+5,y+4.35,bz-3,0);
  addGeo(new THREE.CylinderGeometry(3,3,14,16),mat('silo',{color:0xc8c8c8,metalness:.5,roughness:.4}),x+10,y+7,z-12);addGeo(new THREE.SphereGeometry(3,16,8,0,TAU,0,PI/2),mat('silo'),x+10,y+14,z-12);addBox(x+7,y,z-15,x+13,y+14,z-9,{mat:'metal'});
  for(let i=0;i<10;i++){const hx=x+(r()-.5)*70,hz=z+14+r()*28,hy=H(hx,hz);addGeo(new THREE.CylinderGeometry(1.1,1.1,1.6,14).rotateZ(PI/2),hay,hx,hy+1.1,hz,r()*PI);addBox(hx-1,hy,hz-1,hx+1,hy+2.2,hz+1)}
  for(let rr=0;rr<12;rr++)for(let k=0;k<18;k++){const cx=x-32+k*3.6,cz=z+46+rr*2.2,cy=H(cx,cz);if(cy<1)continue;addGeo(new THREE.ConeGeometry(.45,1.4,5),mat('crop',{color:0x8fcf4f},1),cx,cy+.6,cz)}
  for(let k=0;k<40;k++){const a=k/40*TAU,fx=x+Math.cos(a)*50,fz=z+Math.sin(a)*42,fy=H(fx,fz);if(fy<.5)continue;deco(fx,fy+.6,fz,.15,1.2,.15,mat('fence',{color:0xd7ccc8}));const a2=(k+.5)/40*TAU;deco(x+Math.cos(a2)*50,fy+.9,z+Math.sin(a2)*42,.08,.12,7.6,mat('fence'),-a2)}
  const wy=H(x+28,z-20);addGeo(new THREE.CylinderGeometry(.3,.7,16,8),mat('metal',{color:0x3b3f46,metalness:.6,roughness:.4}),x+28,wy+8,z-20);const rot=new THREE.Group();rot.position.set(x+28,wy+16,z-19.3);for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.7,7,.1),mat('trim'));b.position.y=3.5;b.castShadow=true;const p=new THREE.Group();p.rotation.z=i*PI/2;p.add(b);rot.add(p)}world.add(rot);anims.push(dt=>rot.rotation.z+=dt*1.2)}
 else if(q.kind==='castle'){const y=q.h,sm=mat('stone',{color:0xc0bcb4,map:stoneTex}),R=24;
  for(let i=0;i<4;i++){const a=i*PI/2+PI/4,tx=x+Math.cos(a)*R,tz=z+Math.sin(a)*R;addGeo(new THREE.CylinderGeometry(4,4.6,18,14),sm,tx,y+7,tz);addGeo(new THREE.ConeGeometry(5.2,6,14),mat('roofc',{color:0x34495e,map:roofTex}),tx,y+19,tz);addBox(tx-3.4,y-4,tz-3.4,tx+3.4,y+16,tz+3.4,{mat:'stone'})}
  const W=R*Math.SQRT2;for(const [dx,dz,sx,sz] of[[0,-1,W,1.6],[0,1,W,1.6],[-1,0,1.6,W],[1,0,1.6,W]]){const cx=x+dx*R*.707,cz=z+dz*R*.707;if(dz===1){solid(cx-W/4-2,y+4,cz,W/2-4,8,1.6,sm,{mat:'stone'});solid(cx+W/4+2,y+4,cz,W/2-4,8,1.6,sm,{mat:'stone'});solid(cx,y+7,cz,8,2,1.6,sm)}else solid(cx,y+4,cz,sx,8,sz,sm,{mat:'stone'});
   for(let k=-4;k<=4;k++){const ox=sx>sz?k*W/9:0,oz=sz>sx?k*W/9:0;deco(cx+ox,y+8.6,cz+oz,sx>sz?1.4:1.8,1.2,sz>sx?1.4:1.8,sm)}}
  for(let s=0;s<10;s++)solid(x-W/2+3,y+.4+s*.8,z-W/2+4+s*1.6,3,.6,1.6,mat('floor'));solid(x,y+7.8,z-W/2+2.6,W-4,.4,3,mat('floor'));
  solid(x,y+6,z,10,12,10,sm,{mat:'stone'});gable(x,y+12,z,10.4,10.4,4,mat('roofc'),false);
  for(let i=0;i<3;i++)spawnLoot(r,x+(r()-.5)*24,y+.3,z+(r()-.5)*24);addChest(r,x+7,y,z+7,0);addChest(r,x,y+8.05,z-W/2+2.6,0);
  for(let i=0;i<4;i++){const a=i*PI/2+PI/4,tx=x+Math.cos(a)*R,tz=z+Math.sin(a)*R;addGeo(new THREE.CylinderGeometry(.08,.08,5,5),mat('metal'),tx,y+24,tz);const f=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.5,6,1),new THREE.MeshLambertMaterial({color:COLS[i],side:THREE.DoubleSide}));f.position.set(tx+1.3,y+25.6,tz);world.add(f);const fp=f.geometry.attributes.position,base=fp.array.slice();anims.push((dt,t)=>{for(let k=0;k<fp.count;k++){const X=base[k*3];fp.setZ(k,Math.sin(t*5+X*2+i)*.25*(X+1.3)/2.6)}fp.needsUpdate=true})}}
 else if(q.kind==='light'){const y=H(x,z),wm=mat('lw',{color:0xffffff}),rd=mat('lr',{color:0xd63031});
  for(let i=0;i<6;i++)addGeo(new THREE.CylinderGeometry(3.2-i*.3,3.4-i*.3,4,16),i%2?rd:wm,x,y+2+i*4,z);addGeo(new THREE.CylinderGeometry(2.2,2.2,2.6,12),mat('glass',{color:0x7fb8e6,roughness:.1,metalness:.6,emissive:0x0a2030}),x,y+25.3,z);addGeo(new THREE.ConeGeometry(2.6,2.5,12),rd,x,y+27.8,z);
  addBox(x-3,y,z-3,x+3,y+24,z+3,{mat:'stone'});
  const beam=new THREE.Mesh(new THREE.ConeGeometry(4,60,16,1,true).rotateZ(PI/2).translate(30,0,0),new THREE.MeshBasicMaterial({color:0xfff6c0,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide}));beam.position.set(x,y+25.3,z);world.add(beam);anims.push(dt=>beam.rotation.y+=dt*.8);
  for(let s=0;s<40;s++){const a=s*.32,sx=x+Math.cos(a)*4.4,sz=z+Math.sin(a)*4.4;solid(sx,y+.3+s*.6,sz,1.6,.3,1.6,mat('floor'))}
  addChest(r,x+6,y+.05,z+6,0);spawnLoot(r,x-7,y+.3,z);addChest(r,x,y+24.2,z+3.5,0)}
 else if(q.kind==='gas'){const y=H(x,z)+.15;solid(x-6,y+2,z-6,10,4,7,mat('shop',{color:0xffffff,map:plasterTex}));deco(x-6,y+4.3,z-2.4,10.2,.8,.2,mat('sign',{color:0xff3b30,emissive:0x550000}));deco(x-6,y+1.6,z-2.45,6,2,.1,mat('glass'));
  for(const s of[-1,1])addGeo(new THREE.CylinderGeometry(.25,.25,5,8),mat('metal'),x+6+s*5,y+2.5,z+4);deco(x+6,y+5.2,z+4,14,.5,9,mat('canopy',{color:0xf5f5f5}));deco(x+6,y+4.85,z+4,14.2,.25,9.2,mat('sign'));
  for(const s of[-1,1])solid(x+6+s*2.5,y+.8,z+4,.8,1.6,.6,mat('pump',{color:0x2e86de}),{mat:'metal'});
  car(x+10,z+10,.3,0xfdcb6e);spawnLoot(r,x-6,y+.3,z-6);addChest(r,x-9,y+.05,z-8,0)}
 else if(q.kind==='forest'){for(let i=0;i<4;i++){const a=i*1.6+r(),d=q.r*(.25+r()*.4),cx=x+Math.cos(a)*d,cz=z+Math.sin(a)*d;if(H(cx,cz)<1)continue;prop('tent',cx,cz,r()*TAU,{L:3.2,mat:'wood'});prop('campfire',cx+3.5,cz+1,0,{L:1.4,coll:false});spawnLoot(r,cx+2,H(cx+2,cz)+.3,cz-2);if(i%2)addChest(r,cx-2.5,H(cx-2.5,cz),cz+1,0)}}
 else if(q.kind==='lake'){for(let k=0;k<10;k++)solid(x+q.r*.6+k*2,.15,z,2,.3,3.2,mat('floor'));for(let k=0;k<6;k++)deco(x+q.r*.6+k*4,-.8,z+1.5,.3,2,.3,mat('floor'));addChest(r,x+q.r*.6+18,.3,z,0);
  for(let i=0;i<14;i++){const a=r()*TAU,d=q.r*(.95+r()*.2),lx=x+Math.cos(a)*d,lz=z+Math.sin(a)*d;addGeo(new THREE.CylinderGeometry(.05,.05,1.6,4),mat('reed',{color:0x6b8e23},1),lx,H(lx,lz)+.8,lz)}}
 else if(q.kind==='harbor'){const y=q.h+.1,dk=mat('dock',{color:0x8a6a4a,map:woodTex});
  // Lagerhalle, Container, Kran, Stege ins Wasser
  shed(x-24,z-18,22,16,7,mat('shedB',{color:0x2e6fb0,map:metalTex}),r,{floor:1,loot:4});
  const CC=[0xd63031,0x0984e3,0xf39c12,0x27ae60,0x8e44ad,0x16a085];
  for(let i=0;i<14;i++){const cx=x+4+(i%4)*7.5,cz=z-20+(i/4|0)*9;container(cx,cz,0,CC[i%CC.length],0,r);if(r()<.35)container(cx,cz,0,CC[(i+3)%CC.length],1,null)}
  for(let k=0;k<4;k++){const sx=x-30+k*16;for(let j=0;j<8;j++)solid(sx,y-.1,z+18+j*3,4,.3,3,dk);for(let j=0;j<4;j++)deco(sx+(j%2?1.8:-1.8),y-1.4,z+20+j*6,.35,3,.35,dk);if(k%2)addChest(r,sx,y+.1,z+38,0);else spawnLoot(r,sx,y+.3,z+36)}
  const cy=H(x+30,z+6);for(const [ox,oz] of[[-2,-2],[2,-2],[-2,2],[2,2]])solid(x+30+ox,cy+8,z+6+oz,.6,16,.6,mat('crane',{color:0xf1c40f,metalness:.4,roughness:.5}));solid(x+30,cy+16.5,z+6,5,1,5,mat('crane'));deco(x+30,cy+17.5,z+14,1.2,1,24,mat('crane'));deco(x+30,cy+17.5,z-6,2.5,2.5,4,mat('crane'));solid(x+30,cy+18.4,z+6,2.6,1.8,2.6,mat('glass'));addChest(r,x+30,cy+17.05,z+6,0);
  for(let s=0;s<16;s++)solid(x+27.4,cy+.5+s*1,z+6-1.9+((s%2)?.8:0),1,.25,1,mat('crane'));
  const boat=new THREE.Group();const hull=new THREE.Mesh(new THREE.BoxGeometry(5,2,14),mat('hull',{color:0xffffff}));hull.position.y=.4;boat.add(hull);const cab=new THREE.Mesh(new THREE.BoxGeometry(3.6,2,4),mat('cab',{color:0x2e86de}));cab.position.set(0,2.4,-2);boat.add(cab);boat.position.set(x+8,-.3,z+36);world.add(boat);anims.push((dt,t)=>{boat.position.y=-.3+Math.sin(t*1.2)*.15;boat.rotation.z=Math.sin(t*.9)*.03})}
 else if(q.kind==='factory'){const y=H(x,z)+.1,wm=mat('fact',{color:0xb5651d,map:brickTex});
  const b1=shed(x-14,z-10,26,18,9,wm,r,{floor:1,loot:5});shed(x+18,z+14,18,14,7,mat('fact2',{color:0x95a5a6,map:metalTex}),r,{loot:3});
  for(const [cx,cz,h] of[[x+10,z-18,26],[x+16,z-18,22]]){const cy=H(cx,cz);addGeo(new THREE.CylinderGeometry(1.3,1.7,h,12),mat('chimney',{color:0x8a5a44,map:brickTex}),cx,cy+h/2,cz);addBox(cx-1.6,cy,cz-1.6,cx+1.6,cy+h,cz+1.6,{mat:'stone'});deco(cx,cy+h-1,cz,3.6,.6,3.6,mat('trim'))}
  for(let i=0;i<3;i++){const tx=x-28+i*7,tz=z+18,ty=H(tx,tz);addGeo(new THREE.CylinderGeometry(2.8,2.8,8,16),mat('tank',{color:0xdfe6e9,metalness:.6,roughness:.3}),tx,ty+4,tz);addBox(tx-2.6,ty,tz-2.6,tx+2.6,ty+8,tz+2.6,{mat:'metal'})}
  addGeo(new THREE.CylinderGeometry(.5,.5,30,8).rotateZ(PI/2),mat('pipe',{color:0x7f8c8d,metalness:.6}),x-14,y+11,z+18);
  for(let i=0;i<6;i++)container(x+4+(i%3)*7.5,z+30+(i/3|0)*8,0,[0xd35400,0x2980b9,0x27ae60][i%3],0,r);
  for(let i=0;i<8;i++)prop(['barrels','barrel','crate','generator'][i%4],x-30+r()*50,z-28+r()*10,r()*TAU,{h:[1.3,1.2,1,1.8][i%4]})}
 else if(q.kind==='peak'){const y=H(x,z);house(x,z,r,1,{two:false,wall:0x8d6e63,roof:0x5d4037});for(let i=0;i<5;i++){const a=i/5*TAU,px=x+Math.cos(a)*18,pz=z+Math.sin(a)*18;spawnLoot(r,px,H(px,pz)+.3,pz)}
  const fy=H(x,z+14);addGeo(new THREE.CylinderGeometry(.1,.1,6,6),mat('metal'),x+8,fy+3,z+14);const f=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.4),new THREE.MeshLambertMaterial({color:0x18dcff,side:THREE.DoubleSide}));f.position.set(x+9.2,fy+5.3,z+14);world.add(f);anims.push((dt,t)=>f.rotation.y=Math.sin(t*2)*.3)}
 else if(q.kind==='mesa'){const y=H(x,z),sm=mat('mesa',{color:0xc2703d,map:stoneTex}),sm2=mat('mesa2',{color:0xd99058,map:stoneTex});
  for(let i=0;i<9;i++){const a=i/9*TAU+r(),d=q.r*(.75+r()*.6),mx=x+Math.cos(a)*d,mz=z+Math.sin(a)*d,my=H(mx,mz),h=10+r()*16,w=6+r()*8;solid(mx,my+h/2-1,mz,w,h,w*.8,i%2?sm:sm2,{mat:'stone'});deco(mx,my+h,mz,w+1,1.2,w*.8+1,sm2)}
  house(x-10,z+4,r,1,{wall:0xe8c39e,roof:0x8d5524});house(x+14,z-12,r,-1,{wall:0xf0d5b0,roof:0xa0522d});
  const wy=H(x+2,z+22);addGeo(new THREE.CylinderGeometry(2.2,2.2,4,12),mat('wtank',{color:0x8d6e63,map:woodTex}),x+2,wy+10,z+22);for(const [ox,oz] of[[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]])solid(x+2+ox,wy+4,z+22+oz,.4,8,.4,mat('floor'));solid(x+2,wy+8,z+22,4.6,.3,4.6,mat('floor'));addChest(r,x+2,wy+8.15,z+22,0);
  for(let s=0;s<10;s++)solid(x-.6,wy+.4+s*.8,z+19.4-s*.0,1,.25,.8,mat('floor'))}
 else if(q.kind==='villa'){const y=q.h+.1,wm=mat('villa',{color:0xf7f7f2,map:plasterTex}),dk=mat('vdk',{color:0x3d3d3d}),gl=mat('glass',{color:0x7fb8e6,roughness:.1,metalness:.6,emissive:0x0a2030}),fm=mat('vfl',{color:0xd7c7a7,map:woodTex});
  const w=24,d=16,h=4.4;solid(x,y-2,z,w+2,4,d+2,mat('found',{color:0x9f9a90,map:stoneTex}));solid(x,y+.05,z,w,.1,d,fm);
  for(let L=0;L<2;L++){const y0=y+L*h,ww=L?w*.7:w,ox=L?-w*.15:0;solid(x+ox,y0+h/2,z-d/2,ww,h,.4,wm);solid(x+ox-ww/2,y0+h/2,z,.4,h,d,wm);solid(x+ox+ww/2,y0+h/2,z,.4,h,d,wm);
   solid(x+ox-ww/2+3,y0+h/2,z+d/2,6,h,.4,wm);deco(x+ox+3,y0+h/2,z+d/2,ww-12,h-.6,.12,gl);solid(x+ox+ww/2-1.5,y0+h/2,z+d/2,3,h,.4,wm);solid(x+ox+3,y0+h-.4,z+d/2,ww-12,.8,.4,wm);
   solid(x+ox,y0+h,z,ww+.6,.35,d+.6,dk)}
  for(let s=0;s<8;s++)solid(x-w/2+1.4,y+.3+s*.55,z-d/2+2+s*.9,2.2,.5,.9,fm);
  const px=x+w*.35,pz=z+d/2+6;addGeo(BOXG,mat('pool',{color:0x4fb3ff,emissive:0x0a3050,roughness:.1}),px,y-.2,pz,0,0,0,8,.2,6);deco(px,y-.05,pz-3.4,9,.2,.8,mat('trim',{color:0xffffff}));
  for(let i=0;i<4;i++)spawnLoot(r,x+(r()-.5)*(w-4),y+(i%2)*h+.4,z+(r()-.5)*(d-4));addChest(r,x-w/2+2,y+h+.4,z+d/2-2,0);addChest(r,x+w/2-2,y+.1,z-d/2+2,0)}
 else if(q.kind==='trailer'){const y=H(x,z);const TC=[0xf5f5f5,0xffeaa7,0x81ecec,0xfab1a0,0xdfe6e9];
  for(let i=0;i<9;i++){const a=i/9*TAU,tx=x+Math.cos(a)*24,tz=z+Math.sin(a)*24,ty=H(tx,tz),ry=a;const alongX=Math.abs(Math.cos(a))<.7;const tm=mat('trl'+i%5,{color:TC[i%5],map:containerTex});
   if(alongX){solid(tx,ty+1.8,tz,8,2.6,3,tm,{mat:'metal'});deco(tx,ty+1.9,tz+1.52,5,.9,.05,mat('glass'))}else{solid(tx,ty+1.8,tz,3,2.6,8,tm,{mat:'metal'});deco(tx+1.52,ty+1.9,tz,.05,.9,5,mat('glass'))}
   deco(tx,ty+.4,tz,2.4,.6,2.4,mat('tire'));if(i%2)spawnLoot(r,tx+Math.cos(a)*-3,ty+.3,tz+Math.sin(a)*-3);if(i%3===0)addChest(r,tx-Math.cos(a)*3.5,ty+.05,tz-Math.sin(a)*3.5,-a)}
  const fy=H(x,z);solid(x,fy+1.6,z,5,3.2,9,mat('food',{color:0xff7675,map:containerTex}),{mat:'metal'});deco(x+2.55,fy+2.2,z,.1,1.2,6,mat('glass'));deco(x+3,fy+3.2,z,1.4,.15,7,mat('canopy',{color:0xf5f5f5}));spawnLoot(r,x+4,fy+.3,z)}
}
const DM=new THREE.Object3D();
function inst(geo,m,list,f,shadow){const im=new THREE.InstancedMesh(geo,m,Math.max(1,list.length));im.count=list.length;list.forEach((s,i)=>{f(DM,s,i);DM.updateMatrix();im.setMatrixAt(i,DM.matrix)});im.castShadow=!!shadow;im.receiveShadow=true;world.add(im);return im}
function freeSpot(x,z,rad){let ok=true;near(x,z,rad+1,b=>{if(x>b.min.x-rad&&x<b.max.x+rad&&z>b.min.z-rad&&z<b.max.z+rad)ok=false});if(!ok)return false;for(const q of POI){const d=Math.hypot(x-q.x,z-q.z);if(['town','town2','farm','gas','harbor','factory','villa','trailer','city'].includes(q.kind)&&d<q.r*.85)return false;if(q.kind==='castle'&&d<36)return false;if(q.kind==='mesa'&&d<q.r*.5)return false}return true}
function vegetation(r){const pines=[],snowp=[],oaks=[],birch=[],bush=[],rocks=[],cacti=[];const fr=POI.find(q=>q.kind==='forest');const maxT=SET.gfx===0?800:1250;
 for(let k=0;k<12000&&pines.length+oaks.length+birch.length+snowp.length+cacti.length<maxT;k++){let x=(r()-.5)*ISL*1.65,z=(r()-.5)*ISL*1.65;if(k%3===0){const a=r()*TAU,d=r()*fr.r;x=fr.x+Math.cos(a)*d;z=fr.z+Math.sin(a)*d}
  const y=H(x,z);if(y<1.2||y>48||!freeSpot(x,z,3))continue;const t={x,z,y,s:.8+r()*.6,hp:150,ry:r()*TAU};
  if(inDesert(x,z)){if(r()<.5)cacti.push(t);continue}if(inSnow(x,z)){snowp.push(t);continue}const q=r();(y>22||k%3===0?pines:q<.6?oaks:birch).push(t)}
 const parts=[],place=(d,t)=>{d.position.set(t.x,t.y-.2,t.z);d.rotation.set(0,t.ry,0);d.scale.setScalar(t.s)};
 const bark=mat('bark',{map:barkTex});
 const pt=new THREE.CylinderGeometry(.25,.45,4,7).translate(0,2,0),pc=[new THREE.ConeGeometry(2.8,4,8).translate(0,4.5,0),new THREE.ConeGeometry(2.2,3.4,8).translate(0,6.6,0),new THREE.ConeGeometry(1.5,3,8).translate(0,8.6,0)];
 const pg=[mat('pine1',{color:0x2a6e40,flatShading:true}),mat('pine2',{color:0x347f4b,flatShading:true}),mat('pine3',{color:0x3f9157,flatShading:true})];
 parts.push([inst(pt,bark,pines,place,1),pines]);pc.forEach((g,i)=>parts.push([inst(g,pg[i],pines,place,1),pines]));
 const sg=[mat('spine1',{color:0x3c6b55,flatShading:true}),mat('spine2',{color:0xe8f0f5,flatShading:true}),mat('spine3',{color:0xf5faff,flatShading:true})];
 parts.push([inst(pt,bark,snowp,place,1),snowp]);pc.forEach((g,i)=>parts.push([inst(g,sg[i],snowp,place,1),snowp]));
 const ot=new THREE.CylinderGeometry(.35,.55,4.5,7).translate(0,2.25,0),oc=[new THREE.IcosahedronGeometry(2.6,0).translate(0,5.8,0),new THREE.IcosahedronGeometry(2,0).translate(1.6,5,.6),new THREE.IcosahedronGeometry(1.9,0).translate(-1.3,5.4,-.9),new THREE.IcosahedronGeometry(1.7,0).translate(.2,7.4,-.4)];
 const og=[0x55a234,0x66b33f,0x4a922e,0x77c34c].map((c,i)=>mat('oak'+i,{color:c,flatShading:true}));
 parts.push([inst(ot,bark,oaks,place,1),oaks]);oc.forEach((g,i)=>parts.push([inst(g,og[i],oaks,place,1),oaks]));
 const bt=new THREE.CylinderGeometry(.2,.3,6,6).translate(0,3,0),bc=[new THREE.IcosahedronGeometry(1.6,0).translate(0,6.4,0),new THREE.IcosahedronGeometry(1.3,0).translate(.6,5.2,.3)];
 parts.push([inst(bt,mat('birch',{color:0xf2efe6}),birch,place,1),birch]);bc.forEach((g,i)=>parts.push([inst(g,mat('bl'+i,{color:i?0xb5d96a:0x9cc95a,flatShading:true}),birch,place,1),birch]));
 const cm=mat('cactus',{color:0x4c9a3a,flatShading:true}),ctr=new THREE.CylinderGeometry(.45,.5,4.2,8).translate(0,2.1,0),ca=[new THREE.CylinderGeometry(.3,.3,1.6,7).translate(1,2.6,0),new THREE.CylinderGeometry(.3,.3,1.4,7).translate(-.95,1.9,0),new THREE.CylinderGeometry(.28,.3,1.1,7).rotateZ(PI/2).translate(.6,1.9,0),new THREE.CylinderGeometry(.28,.3,1.1,7).rotateZ(PI/2).translate(-.55,1.3,0)];
 parts.push([inst(ctr,cm,cacti,place,1),cacti]);ca.forEach(g=>parts.push([inst(g,cm,cacti,place,1),cacti]));
 for(const L of[pines,snowp,oaks,birch,cacti])L.forEach((t,i)=>{t.list=L;t.id=i});trees=[...pines,...snowp,...oaks,...birch,...cacti];world.treeParts=parts;
 for(let k=0;k<4000&&bush.length<620;k++){const x=(r()-.5)*ISL*1.65,z=(r()-.5)*ISL*1.65,y=H(x,z);if(y<1||inSnow(x,z)||!freeSpot(x,z,1.5))continue;bush.push({x,z,y,s:.6+r()*.8,d:inDesert(x,z)})}
 inst(new THREE.IcosahedronGeometry(1.2,1),mat('bush',{color:0x4c9a3a,flatShading:true}),bush.filter(b=>!b.d),(d,t)=>{d.position.set(t.x,t.y+.4*t.s,t.z);d.scale.set(t.s*1.3,t.s,t.s*1.3);d.rotation.set(0,t.x,0)});
 inst(new THREE.IcosahedronGeometry(1,0),mat('dbush',{color:0x9c8a4a,flatShading:true}),bush.filter(b=>b.d),(d,t)=>{d.position.set(t.x,t.y+.3*t.s,t.z);d.scale.set(t.s,t.s*.6,t.s);d.rotation.set(0,t.x,0)});
 for(let k=0;k<1600&&rocks.length<230;k++){const x=(r()-.5)*ISL*1.65,z=(r()-.5)*ISL*1.65,y=H(x,z);if(y<-2||!freeSpot(x,z,2))continue;rocks.push({x,z,y,s:.8+r()*1.6,a:r()*6,snow:inSnow(x,z)})}
 inst(new THREE.DodecahedronGeometry(1.4,0),mat('rock',{color:0x8f949c,flatShading:true}),rocks,(d,t)=>{d.position.set(t.x,t.y+.2,t.z);d.scale.set(t.s*1.3,t.s*.8,t.s);d.rotation.set(t.a,t.a*2,0)},1);
 rocks.forEach(t=>addBox(t.x-t.s*1.2,t.y-1,t.z-t.s*1.2,t.x+t.s*1.2,t.y+t.s*1,t.z+t.s*1.2,{mat:'stone'}));
 const gl=[],fl=[];const n=SET.gfx===2?26000:13000;for(let k=0;k<n*3&&gl.length<n;k++){const x=(r()-.5)*ISL*1.65,z=(r()-.5)*ISL*1.65,y=H(x,z);if(y<1||y>26||inSnow(x,z)||inDesert(x,z))continue;if(r()<.08)fl.push({x,z,y,c:r()});else gl.push({x,z,y,s:.6+r()*.8,a:r()*PI})}
 const gg=new THREE.PlaneGeometry(.9,.8).translate(0,.4,0),g2=gg.clone().rotateY(PI/2),gm=THREE.BufferGeometryUtils.mergeBufferGeometries([gg,g2]);
 const gtx=ctex(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);for(let i=0;i<9;i++){x.strokeStyle=['#5aa83c','#6dbb45','#4c9a32'][i%3];x.lineWidth=3;x.beginPath();const bx=6+i*6.5;x.moveTo(bx,h);x.quadraticCurveTo(bx+(Math.random()-.5)*10,h*.5,bx+(Math.random()-.5)*14,6+Math.random()*16);x.stroke()}});
 const gmat=new THREE.MeshLambertMaterial({map:gtx,alphaTest:.5,side:THREE.DoubleSide});
 grass=[inst(gm,gmat,gl,(d,t)=>{d.position.set(t.x,t.y-.05,t.z);d.rotation.set(0,t.a,0);d.scale.setScalar(t.s)})];
 [0xff5a7a,0xffd23f,0xffffff,0xb15cff].forEach((c,i)=>{const L=fl.filter(f=>Math.floor(f.c*4)===i);grass.push(inst(new THREE.IcosahedronGeometry(.13,0),new THREE.MeshBasicMaterial({color:c}),L,(d,t)=>{d.position.set(t.x,t.y+.45,t.z);d.rotation.set(0,0,0);d.scale.setScalar(1)}));grass.push(inst(new THREE.CylinderGeometry(.02,.02,.45,3),mat('stem',{color:0x4c9a32},1),L,(d,t)=>{d.position.set(t.x,t.y+.22,t.z)}))});
 grass.forEach(m=>m.visible=SET.gfx>0)}

/* ===================== Waffenmodelle ===================== */
const gunMetal=mat('gunM',{color:0x2b2e35,metalness:.7,roughness:.35}),gunDark=mat('gunD',{color:0x16181d,metalness:.5,roughness:.5}),gunWood=mat('gunW',{color:0x7a4a26,roughness:.7});
const rarMat=i=>mat('rar'+i,{color:new THREE.Color(RAR[i].c),emissive:new THREE.Color(RAR[i].c),emissiveIntensity:.35,metalness:.4,roughness:.4});
function makeWeapon(k,rar){const g=new THREE.Group(),B=(w,h,d,m,x,y,z,rx)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);if(rx)o.rotation.x=rx;o.castShadow=true;g.add(o);return o},C=(r1,r2,l,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,l,10).rotateX(PI/2),m);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o};
 const rm=rarMat(rar||0);let tip=-.6;
 if(k==='pick'){const h=new THREE.Mesh(new THREE.CylinderGeometry(.035,.04,1.1,8),gunWood);h.position.y=.1;g.add(h);const head=new THREE.Mesh(new THREE.BoxGeometry(.75,.09,.09),mat('pickH',{color:0x9fb3c8,metalness:.8,roughness:.25}));head.position.y=.6;g.add(head);for(const s of[-1,1]){const t=new THREE.Mesh(new THREE.ConeGeometry(.05,.22,6),mat('pickH'));t.rotation.z=-s*PI/2;t.position.set(s*.47,.6,0);g.add(t)}const grip=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.25,8),mat('grip',{color:0xd63031}));grip.position.y=-.32;g.add(grip);g.traverse(o=>{if(o.isMesh)o.castShadow=true});g.userData.tip=new THREE.Vector3(.5,.6,0);return g}
 if(k==='gren'){const s=new THREE.Mesh(new THREE.SphereGeometry(.11,10,8),mat('gren',{color:0x3f5528,roughness:.6}));g.add(s);const p=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.08,6),gunMetal);p.position.y=.12;g.add(p);const ring=new THREE.Mesh(new THREE.TorusGeometry(.04,.01,4,10),mat('pickH',{color:0x9fb3c8,metalness:.8,roughness:.25}));ring.position.set(.05,.16,0);g.add(ring);g.userData.tip=new THREE.Vector3(0,0,0);return g}
 if(k==='pistol'){B(.09,.12,.42,gunMetal,0,.04,-.12);B(.08,.2,.1,gunDark,0,-.1,.02,-.25);B(.1,.03,.3,rm,0,.115,-.12);C(.025,.025,.1,gunDark,0,.05,-.37);tip=-.43}
 if(k==='smg'){B(.1,.14,.55,gunMetal,0,.03,-.15);B(.07,.24,.08,gunDark,0,-.14,-.2,.15);B(.08,.18,.09,gunDark,0,-.08,.06,-.3);C(.03,.03,.22,gunDark,0,.05,-.52);B(.1,.04,.3,rm,0,.115,-.15);B(.06,.06,.25,gunDark,0,.02,.22);tip=-.63}
 if(k==='ar'){B(.1,.15,.8,gunMetal,0,.03,-.2);B(.11,.06,.5,rm,0,.13,-.2);B(.08,.26,.11,gunDark,0,-.16,-.28,.2);B(.08,.2,.1,gunDark,0,-.1,.05,-.3);B(.09,.17,.36,gunDark,0,0,.36);C(.032,.03,.4,gunDark,0,.06,-.78);B(.04,.08,.12,gunDark,0,.18,-.05);B(.05,.06,.05,rm,0,.07,-.98);tip=-1.02}
 if(k==='burst'){B(.11,.16,.85,mat('gunT',{color:0x4a5240,metalness:.4,roughness:.5}),0,.03,-.2);B(.12,.05,.6,rm,0,.13,-.2);B(.08,.26,.11,gunDark,0,-.16,-.22,.1);B(.08,.2,.1,gunDark,0,-.1,.08,-.3);B(.1,.19,.34,gunDark,0,0,.38);C(.035,.03,.38,gunDark,0,.06,-.8);C(.05,.05,.24,gunDark,0,.24,-.12);tip=-1.0}
 if(k==='shot'){B(.11,.14,.62,gunMetal,0,.02,-.1);C(.045,.045,.65,gunDark,0,.07,-.6);C(.04,.04,.4,gunWood,0,-.03,-.5);B(.1,.22,.38,gunWood,0,-.04,.36,-.12);B(.08,.18,.1,gunDark,0,-.1,.08,-.3);B(.1,.03,.4,rm,0,.105,-.1);tip=-.95}
 if(k==='tac'){B(.12,.15,.66,gunDark,0,.02,-.12);C(.05,.05,.55,gunMetal,0,.07,-.62);B(.1,.12,.3,rm,0,-.06,-.48);B(.08,.2,.1,gunDark,0,-.1,.08,-.3);B(.09,.16,.32,gunDark,0,0,.34);B(.05,.05,.3,rm,0,.13,-.15);tip=-.92}
 if(k==='snipe'){B(.1,.14,1,gunMetal,0,.02,-.2);C(.03,.026,.7,gunDark,0,.05,-1.05);C(.06,.06,.42,gunDark,0,.2,-.25);C(.07,.07,.04,rm,0,.2,-.47);C(.07,.07,.04,rm,0,.2,-.03);B(.06,.08,.06,gunDark,0,.12,-.25);B(.1,.24,.4,gunWood,0,-.04,.48,-.1);B(.08,.2,.1,gunDark,0,-.12,.12,-.3);B(.03,.3,.03,gunDark,-.05,-.18,-.95,.4);B(.03,.3,.03,gunDark,.05,-.18,-.95,.4);tip=-1.42}
 if(k==='rocket'){C(.11,.11,1.25,mat('rl',{color:0x4b6043,roughness:.6}),0,.12,-.15);C(.13,.11,.15,rm,0,.12,-.78);C(.13,.13,.12,rm,0,.12,.45);B(.06,.18,.1,gunDark,0,-.06,0,-.2);B(.06,.18,.1,gunDark,0,-.06,-.35,-.2);B(.08,.1,.16,gunDark,-.13,.22,-.2);tip=-.85}
 g.userData.tip=new THREE.Vector3(0,.06,tip);return g}
const iconCache={};function weaponIcon(k,rar){const key=k+rar;if(iconCache[key])return iconCache[key];const c=document.createElement('canvas');c.width=108;c.height=62;const x=c.getContext('2d'),col=k==='pick'?'#9fb3c8':RAR[rar||0].c;x.translate(54,32);x.lineJoin='round';
 const LEN={pistol:30,smg:42,ar:60,burst:62,shot:56,tac:54,snipe:72,rocket:74};
 const draw=(fill,stroke,lw)=>{x.fillStyle=fill;x.strokeStyle=stroke;x.lineWidth=lw;const R=(X,Y,w,h)=>{x.fillRect(X,Y,w,h);if(lw)x.strokeRect(X,Y,w,h)};
  if(k==='pick'){x.save();x.rotate(-.7);R(-3,-22,6,48);x.restore();x.beginPath();x.moveTo(-12,-22);x.quadraticCurveTo(10,-30,30,-12);x.lineTo(26,-8);x.quadraticCurveTo(8,-22,-10,-16);x.closePath();x.fill();if(lw)x.stroke();return}
  if(k==='gren'){x.beginPath();x.arc(0,4,15,0,TAU);x.fill();if(lw)x.stroke();R(-4,-16,8,8);return}
  if(k==='rocket'){R(-37,-8,74,14);R(-12,6,8,12);R(14,6,8,12);R(-42,-10,8,18);return}
  const L=LEN[k];R(-L/2,-8,L,10);R(-L/2-6,-5,8,5);R(-L/2+8,2,9,15);if(k!=='pistol')R(L/2-2,-7,14,12);if(k==='ar'||k==='smg'||k==='burst')R(-6,2,7,14);if(k==='snipe'||k==='burst')R(-12,-18,26,7);if(k==='shot'||k==='tac')R(-L/2,3,24,6)};
 draw('#000','#000',8);draw('#e8ecf2',col,0);x.fillStyle=col;if(LEN[k]){x.fillRect(-LEN[k]/2,-8,LEN[k],3)}
 iconCache[key]=c.toDataURL();return iconCache[key]}
/* ===================== Figuren (eigene Modelle) ===================== */
const CG={box:new THREE.BoxGeometry(1,1,1),sph:new THREE.SphereGeometry(1,14,10),cyl:new THREE.CylinderGeometry(1,1,1,10),cylT:new THREE.CylinderGeometry(.8,1,1,10),cone:new THREE.ConeGeometry(1,1,10),hemi:new THREE.SphereGeometry(1,14,8,0,TAU,0,PI/2),tor:new THREE.TorusGeometry(1,.25,6,14)};
const cmat=(c,o)=>mat('c'+c.toString(16)+(o?JSON.stringify(o):''),Object.assign({color:c,roughness:.65},o||{}));
function part(parent,geo,m,px,py,pz,sx,sy,sz,rx,ry,rz){const o=new THREE.Mesh(geo,m);o.position.set(px,py,pz);o.scale.set(sx,sy,sz);if(rx||ry||rz)o.rotation.set(rx||0,ry||0,rz||0);o.castShadow=true;parent.add(o);return o}
function mkProcChar(oi,name){const O=PROC_OUT[oi%PROC_OUT.length];const root=new THREE.Group();scene.add(root);const C={root,J:{},cur:{},ph:Math.random()*6};
 const skin=cmat(O.skin),shirt=cmat(O.shirt),pants=cmat(O.pants),shoes=cmat(O.shoes),acc=cmat(O.acc),hair=cmat(O.hair),dark=cmat(0x15161a),white=cmat(0xffffff),metalM=cmat(0xb8c0cc,{metalness:.7,roughness:.3});
 const body=new THREE.Group();root.add(body);const hips=new THREE.Group();hips.position.y=1.0;body.add(hips);
 part(hips,CG.box,pants,0,-.02,0,.4,.22,.25);part(hips,CG.box,acc,0,.08,0,.42,.06,.27);
 const chest=new THREE.Group();chest.position.y=.08;hips.add(chest);
 part(chest,CG.box,shirt,0,.3,0,.46,.5,.27);part(chest,CG.box,shirt,0,.5,0,.54,.16,.29);
 if(O.coat){part(chest,CG.box,shirt,0,.04,0,.48,.42,.3);part(chest,CG.box,acc,0,.36,.141,.06,.42,.02)}
 if(O.n==='Rekrut'){part(chest,CG.box,acc,0,.32,.14,.4,.36,.04);for(const s of[-1,1])part(chest,CG.box,acc,s*.12,.3,.17,.12,.12,.04)}
 if(O.n==='Eisenritter'){part(chest,CG.box,metalM,0,.34,.13,.48,.44,.06);part(chest,CG.box,acc,0,.34,.165,.08,.4,.02)}
 if(O.n==='Feuerwehrfrau'){for(const y of[.18,.42])part(chest,CG.box,acc,0,y,0,.47,.05,.28)}
 if(O.n==='Sternenfahrerin'){part(chest,CG.box,acc,0,.36,.14,.18,.14,.04);part(chest,CG.box,cmat(0x18dcff,{emissive:0x0a5a70}),-.08,.38,.165,.04,.04,.02)}
 if(O.spikes)for(let i=0;i<10;i++){const a=i*.9,y=.1+(i%5)*.1;part(chest,CG.cone,cmat(0xf5f0d0),Math.sin(a)*.24,y,Math.cos(a)*.15,.02,.08,.02,PI/2*Math.cos(a),0,-PI/2*Math.sin(a))}
 part(chest,CG.cyl,skin,0,.62,0,.08,.1,.08);
 const head=new THREE.Group();head.position.y=.78;chest.add(head);
 part(head,CG.sph,skin,0,0,0,.2,.22,.2);
 // Gesicht
 if(O.face==='robot'){part(head,CG.box,dark,0,.03,.17,.3,.1,.06);for(const s of[-1,1])part(head,CG.sph,cmat(O.acc,{emissive:O.acc,emissiveIntensity:.8}),s*.07,.03,.2,.035,.035,.02)}
 else{for(const s of[-1,1]){part(head,CG.sph,white,s*.075,.03,.17,.045,.05,.03);if(!(O.face==='patch'&&s>0))part(head,CG.sph,dark,s*.075,.03,.195,.024,.028,.015)}part(head,CG.box,cmat(0x8a3a2a),0,-.09,.185,.08,.018,.01);for(const s of[-1,1])part(head,CG.box,hair,s*.075,.1,.18,.07,.015,.01)}
 if(O.face==='mask')part(head,CG.box,dark,0,-.06,.1,.4,.15,.22);
 if(O.face==='patch'){part(head,CG.sph,dark,.075,.03,.19,.05,.05,.02);part(head,CG.box,dark,0,.07,0,.42,.02,.42)}
 // Haare / Hüte
 const H0=O.hat;
 if(H0!=='visor'&&H0!=='knight'&&H0!=='helmet'&&H0!=='fire')part(head,CG.hemi,hair,0,.02,-.01,.215,.22,.215);
 if(H0==='helmet'){part(head,CG.hemi,acc,0,.04,0,.24,.22,.25);part(head,CG.box,acc,0,.05,.05,.5,.03,.5)}
 if(H0==='band'){part(head,CG.box,acc,0,.08,0,.43,.06,.43);part(head,CG.box,acc,0,.07,-.24,.05,.14,.06,.4)}
 if(H0==='visor'){part(head,CG.sph,white,0,.01,0,.27,.28,.27);part(head,CG.sph,cmat(0x2a4a6a,{metalness:.8,roughness:.1,emissive:0x0a1a30}),0,.02,.1,.2,.17,.19)}
 if(H0==='knight'){part(head,CG.cyl,metalM,0,.02,0,.24,.42,.24);part(head,CG.box,dark,0,.04,.235,.3,.04,.02);part(head,CG.cone,acc,0,.36,-.04,.06,.3,.12)}
 if(H0==='tricorn'){part(head,CG.cyl,dark,0,.17,0,.3,.06,.3);part(head,CG.cylT,dark,0,.26,0,.16,.16,.16);part(head,CG.box,acc,0,.2,.25,.2,.03,.02)}
 if(H0==='mohawk')for(let i=0;i<5;i++)part(head,CG.box,hair,0,.22+Math.sin(i/4*PI)*.03,.12-i*.07,.05,.16,.06);
 if(H0==='flower'){part(head,CG.sph,acc,.08,.24,0,.07,.05,.07);part(head,CG.sph,cmat(0xffd23f),.08,.27,0,.03,.03,.03)}
 if(H0==='antenna'){part(head,CG.cyl,metalM,0,.29,0,.012,.16,.012);part(head,CG.sph,cmat(O.acc,{emissive:O.acc}),0,.38,0,.04,.04,.04)}
 if(H0==='fedora'){part(head,CG.cyl,acc,0,.15,0,.34,.025,.34);part(head,CG.cylT,acc,0,.24,0,.19,.17,.19);part(head,CG.cyl,dark,0,.19,0,.2,.04,.2)}
 if(H0==='fire'){part(head,CG.hemi,acc,0,.05,0,.25,.23,.26);part(head,CG.cyl,acc,0,.06,-.03,.3,.025,.33);part(head,CG.box,cmat(0xd63031),0,.2,.21,.08,.08,.02)}
 // Rücken
 if(O.back==='pack'){part(chest,CG.box,acc,0,.32,-.21,.36,.4,.16);part(chest,CG.box,shirt,0,.24,-.3,.26,.16,.04)}
 if(O.back==='tank'){for(const s of[-1,1])part(chest,CG.cyl,O.n==='Feuerwehrfrau'?cmat(0xf4d03f):white,s*.09,.32,-.22,.08,.42,.08);}
 if(O.back==='cape'){const cp=part(chest,CG.box,acc,0,.05,-.18,.5,.9,.02,.18);C.cape=cp}
 if(O.back==='sword'){const sw=new THREE.Group();sw.position.set(0,.3,-.2);sw.rotation.z=.6;chest.add(sw);part(sw,CG.box,metalM,0,.1,0,.05,.8,.015);part(sw,CG.box,acc,0,-.32,0,.2,.04,.05);part(sw,CG.box,dark,0,-.44,0,.04,.2,.04)}
 if(O.back==='jet'){for(const s of[-1,1]){part(chest,CG.cyl,metalM,s*.1,.3,-.22,.08,.36,.08);part(chest,CG.cone,cmat(0xff9f1a,{emissive:0xff6a00}),s*.1,.07,-.22,.06,.12,.06,PI)}}
 // Arme
 const mkArm=s=>{const sh=new THREE.Group();sh.position.set(s*.3,.52,0);chest.add(sh);part(sh,CG.sph,shirt,0,0,0,.085,.085,.085);part(sh,CG.cyl,shirt,0,-.15,0,.07,.3,.07);const el=new THREE.Group();el.position.y=-.3;sh.add(el);part(el,CG.cyl,O.n==='Eisenritter'||O.n==='Blechkumpel'?metalM:O.coat?shirt:skin,0,-.13,0,.06,.26,.06);
  const hand=new THREE.Group();hand.position.y=-.29;el.add(hand);part(hand,CG.sph,O.n==='Feuerwehrfrau'||O.n==='Schattenläufer'?dark:skin,0,0,0,.065,.07,.065);return{sh,el,hand}};
 const AL=mkArm(-1),AR=mkArm(1);
 const mkLeg=s=>{const hp=new THREE.Group();hp.position.set(s*.12,-.08,0);hips.add(hp);part(hp,CG.cylT,pants,0,-.21,0,.105,.42,.105);const kn=new THREE.Group();kn.position.y=-.43;hp.add(kn);part(kn,CG.cylT,pants,0,-.2,0,.085,.4,.085);part(kn,CG.box,shoes,0,-.43,.05,.13,.1,.25);return{hp,kn}};
 const LL=mkLeg(-1),LR=mkLeg(1);
 const mount=new THREE.Group();mount.position.set(0,.47,0);chest.add(mount);
 Object.assign(C.J,{body,hips,chest,head,AL,AR,LL,LR,mount});C.out=O;
 // Gleiter
 const gl=new THREE.Group();const cols=[O.acc,O.shirt,0xffffff];const can=new THREE.Group();can.position.y=3.3;gl.add(can);
 for(let i=0;i<7;i++){const a=(i-3)/3*.9;const p=new THREE.Mesh(new THREE.BoxGeometry(.98,.06,2),new THREE.MeshStandardMaterial({color:cols[i%3],roughness:.6,side:THREE.DoubleSide}));p.position.set(Math.sin(a)*3,Math.cos(a)*1.2-1.2,0);p.rotation.z=-a;p.castShadow=true;can.add(p)}
 for(const s of[-1,1])for(const z of[-.8,.8]){const L=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,3.2,3),mat('line',{color:0xdddddd}));L.position.set(s*1.4,1.85,z*.5);L.rotation.z=s*.62;gl.add(L)}
 gl.visible=false;root.add(gl);C.glider=gl;
 if(name){const c=document.createElement('canvas');c.width=256;c.height=48;const x=c.getContext('2d');x.font='bold 28px sans-serif';x.textAlign='center';x.fillStyle='rgba(0,0,0,.45)';x.fillRect(20,4,216,40);x.fillStyle='#fff';x.fillText(name,128,34);const tag=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthWrite:false}));tag.scale.set(2,.38,1);tag.position.y=2.45;root.add(tag);C.tag=tag}
 return C}
const _v1=new THREE.Vector3(),_v2=new THREE.Vector3(),_v3=new THREE.Vector3();
const aimDir=new THREE.Vector3(),rightV=new THREE.Vector3();
function jr(o,x,y,z,k){o.rotation.x+=(x-o.rotation.x)*k;o.rotation.y+=(y-o.rotation.y)*k;o.rotation.z+=(z-o.rotation.z)*k}
function animProc(e,dt,far){const C=e.m;if(!C)return;const root=C.root,J=C.J;
 root.position.set(e.x,e.y,e.z);root.rotation.y=e.yaw+PI;if(C.tag)C.tag.visible=Math.hypot(e.x-camera.position.x,e.z-camera.position.z)>5;root.visible=(e.alive||e.deadT<3.5)&&!e.inBus;
 if(!root.visible){if(e.wpn)e.wpn.visible=false;return}
 const sp=Math.hypot(e.vx||0,e.vz||0),p=e.pitch||0,t=performance.now()/1000;let k=Math.min(1,dt*14);
 if(far&&(frameN+e.col)%3!==0&&e.alive){return}
 if(far)k=Math.min(1,dt*30);
 const st=!e.alive?'dead':e.dance>0?'dance':e.fall?'fall':e.glide?'glide':!e.onG?'air':e.heal>0?'heal':sp>.6?'move':'idle';
 const moving=st==='move';const run=sp>4.5;if(moving)C.ph+=dt*sp*(run?1.9:2.4);
 const ph=C.ph,sw=moving?Math.sin(ph):0,amp=run?.95:.6;
 let lL=sw*amp,lR=-sw*amp,kL=moving?Math.max(0,-Math.cos(ph))*1.1+.1:.05,kR=moving?Math.max(0,Math.cos(ph))*1.1+.1:.05,bx=0,by=0,bz=0,bY=0,chx=moving&&run?.18:0,chy=0,hx=-p*.4;
 let aL=[sw*.6,0,-.08],aR=[-sw*.6,0,.08],eL=-.25,eR=-.25;
 const holdGun=e.alive&&e.w!=='pick'&&e.w!=='gren'&&!(e.dance>0)&&st!=='fall'&&st!=='glide'&&st!=='heal'&&!e.build;
 if(st==='idle'){const b=Math.sin(t*2+e.col)*.02;bY=b;aL=[0,0,-.12];aR=[0,0,.12]}
 if(st==='air'){lL=-.6;lR=.3;kL=.9;kR=.4;aL=[-.4,0,-.5];aR=[-.4,0,.5]}
 if(st==='fall'){bx=1.35;lL=.25;lR=.25;kL=.4;kR=.4;aL=[-.3,0,-1.3];aR=[-.3,0,1.3];eL=-.4;eR=-.4;hx=-.9}
 if(st==='glide'){aL=[-2.9,0,-.25];aR=[-2.9,0,.25];eL=-.15;eR=-.15;lL=.15;lR=-.1;kL=.3;kR=.3;bz=(e.bank||0)*-.25;by=0}
 if(st==='heal'){aL=[-1.3,0,.3];aR=[-1.3,0,-.3];eL=-1;eR=-1;hx=.35}
 if(st==='dance'){const d=(e.col+(e.danceN||0))%3,q=t*6;if(d===0){aL=[-2.6+Math.sin(q)*.4,0,-.4];aR=[-2.6-Math.sin(q)*.4,0,.4];bY=Math.abs(Math.sin(q))*.12;lL=Math.sin(q)*.3;lR=-Math.sin(q)*.3}else if(d===1){bz=Math.sin(q*.5)*.2;aL=[-1.2,0,-.9+Math.sin(q)*.6];aR=[-1.2,0,.9-Math.sin(q)*.6];eL=-1.4;eR=-1.4;chy=Math.sin(q*.5)*.5;kL=.3+Math.sin(q)*.2;kR=.3-Math.sin(q)*.2}else{aL=[Math.sin(q)*1.2,0,-.3];aR=[-Math.sin(q)*1.2,0,.3];lL=Math.sin(q)*.6;lR=-Math.sin(q)*.6;bY=Math.abs(Math.cos(q))*.08;hx=Math.sin(q*2)*.2}}
 if(st==='dead'){bx=-1.5;by=-.6;aL=[-2.8,0,-.4];aR=[-2.8,0,.4];k=Math.min(1,dt*5)}
 if(holdGun){const two=!(e.w==='pistol');aR=[-PI/2-p,0,0];eR=-.05;if(two){aL=[-PI/2-p+.15,0,.6];eL=-.9}else{aL=[-PI/2-p+.2,0,.35];eL=-.4}chy=-.15;if(e.kickT>0)aR[0]+=e.kickT*2}
 if(e.alive&&(e.w==='pick'||e.w==='gren')&&!(e.dance>0)&&st!=='fall'&&st!=='glide'&&st!=='heal'){const swg=e.swing>0?1-e.swing/.45:0;if(swg>0){const q=swg<.35?swg/.35:1-(swg-.35)/.65;aR=[-.5-q*2.6,0,.2];eR=-.6+q*.4;chy=.25*q-.2;chx=.15}else if(!moving){aR=[-.35,0,.15];eR=-.7}}
 if(e.build&&e.alive&&st!=='fall'&&st!=='glide'){aR=[-1.1-p,0,.1];eR=-.5;aL=[-1-p,0,-.2];eL=-.6}
 jr(J.body,bx,0,bz,k);J.body.position.y+=(by-J.body.position.y)*k;J.hips.position.y=1+bY;
 jr(J.chest,chx,chy,0,k);jr(J.head,hx,0,0,k);jr(J.AL.sh,aL[0],aL[1],aL[2],k);jr(J.AR.sh,aR[0],aR[1],aR[2],k);jr(J.AL.el,eL,0,0,k);jr(J.AR.el,eR,0,0,k);
 jr(J.LL.hp,lL,0,0,k);jr(J.LR.hp,lR,0,0,k);jr(J.LL.kn,kL,0,0,k);jr(J.LR.kn,kR,0,0,k);
 if(C.cape)C.cape.rotation.x=.18+Math.min(.9,sp*.08)+Math.sin(t*6)*.04;
 C.glider.visible=!!e.glide&&e.alive;if(C.glider.visible)C.glider.rotation.z=(e.bank||0)*.35;
 // Waffe
 const rk=e.rar&&e.rar[e.sel]||0,key=e.w+':'+rk;if(e.wKey!==key){if(e.wpn&&e.wpn.parent)e.wpn.parent.remove(e.wpn);e.wpn=makeWeapon(e.w,rk);e.wKey=key;e.wpnMode=null}
 const mode=holdGun?'gun':'hand';if(e.wpnMode!==mode){if(e.wpn.parent)e.wpn.parent.remove(e.wpn);if(mode==='gun'){J.mount.add(e.wpn);e.wpn.position.set(.17,-.04,.28);e.wpn.rotation.set(0,PI,0)}else{J.AR.hand.add(e.wpn);if(e.w==='pick'){e.wpn.position.set(0,-.02,.02);e.wpn.rotation.set(PI/2,0,PI/2)}else{e.wpn.position.set(0,-.06,0);e.wpn.rotation.set(0,0,0)}}e.wpnMode=mode}
 if(mode==='gun'){J.mount.rotation.x=-p+(e.kickT>0?-e.kickT*1.2:0);e.wpn.position.z=.28-(e.kickT>0?e.kickT*.6:0)}
 e.wpn.visible=e.alive&&st!=='fall'&&st!=='glide'&&!(e.dance>0)&&st!=='heal'&&!e.build}
/* ===================== Importierte Figuren (CC0: Quaternius) ===================== */
const MODELS={};
const MODEL_FILES=['soldier','adventurer','hooded_adventurer','astronaut','ninja_brute','pirate','worker','skeleton_crew','rogue','zombie','sedan','taxi','police_car','van','suv','truck','ambulance','hatchback_sports','barrel','barrels','crate','generator','tent','campfire','rock_large','rock_tall','building_a','building_b','building_c','building_d','building_e','building_f','building_g','building_h','skyscraper_a','skyscraper_b','skyscraper_c','hangar'];
function loadModels(done){if(!THREE.GLTFLoader){done();return}const L=new THREE.GLTFLoader();let n=0;const tot=MODEL_FILES.length;
 MODEL_FILES.forEach(f=>L.load('assets/m/'+f+'.glb',g=>{g.scene.updateMatrixWorld(true);let b=new THREE.Box3().setFromObject(g.scene);const bb=new THREE.Box3(),v=new THREE.Vector3();let nb=0;g.scene.traverse(o=>{if(o.isBone){o.getWorldPosition(v);bb.expandByPoint(v);nb++}});if(nb>3){const hgt=(bb.max.y-bb.min.y)*1.13;b=new THREE.Box3(new THREE.Vector3(bb.min.x,bb.min.y-hgt*.02,bb.min.z),new THREE.Vector3(bb.max.x,bb.min.y+hgt,bb.max.z))}const size=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3());
   g.scene.traverse(o=>{if(o.isMesh){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(m.map)m.map.anisotropy=4;if(m.type==='MeshBasicMaterial'){const n2=new THREE.MeshStandardMaterial({color:m.color,map:m.map,roughness:.8});o.material=n2}})}});
   MODELS[f]={scene:g.scene,anims:g.animations,size,center,min:b.min.clone()};step()},undefined,err=>{console.warn('Modell fehlt',f,err);step()}));
 function step(){n++;$('loadBar').style.width=(n/tot*90)+'%';$('loadTxt').textContent='Lade 3D-Modelle … '+n+'/'+tot;if(n===tot)done()}}
const ANIM={idleG:['Idle_Gun','Idle_Shoot','Idle_Gun_Pointing','Attacking_Idle','Idle','Man_Idle'],idle:['Idle','Idle_Neutral','Man_Idle','Man_Standing'],runG:['Run_Gun','Run_Shoot','Run','Man_Run'],run:['Run','Man_Run'],walkG:['Walk_Gun','Walk','Man_Walk','Run'],walk:['Walk','Man_Walk','Run'],
 jump:['Jump_Idle','Jump','Man_Jump'],death:['Death','Man_Death'],punch:['Punch_Right','Punch','Sword_Slash','Sword','Dagger_Attack','Man_Punch','Attack'],dance:['Wave','Yes','Man_Clapping','Interact'],shoot:['Idle_Gun_Shoot','Gun_Shoot','Run_Gun_Shoot','Shoot']};
function clipFor(anims,cands){for(const c of cands){const lc=c.toLowerCase();for(const a of anims){const segs=a.name.toLowerCase().split('|');if(segs.includes(lc))return a}}return null}
function mkChar(oi,name){const O=OUTFITS[oi%OUTFITS.length],M=MODELS[O.f];if(!M||!THREE.SkeletonUtils)return mkProcChar(oi,name);
 const root=new THREE.Group();scene.add(root);const C={root,gltf:1,actions:{},cur:null,O};
 const m=THREE.SkeletonUtils.clone(M.scene);const s=1.9/M.size.y;m.scale.setScalar(s);m.position.y=-M.min.y*s;root.add(m);C.model=m;
 const hide=/sword|pistol|weapon|dagger|cutlass|knife|axe|rifle|gun|nurbs|shield/i;
 m.traverse(o=>{if(o.isMesh||o.isSkinnedMesh){o.castShadow=true;o.frustumCulled=false;if(!o.isSkinnedMesh&&hide.test(o.name+(o.parent?o.parent.name:'')))o.visible=false}
  if(o.isBone){const k=o.name.toLowerCase().replace(/[^a-z0-9]/g,'');const pr=['wristr','fistr','palmr','middlehandr','lowerarmr'].indexOf(k);if(pr>=0&&(C.handP==null||pr<C.handP)){C.hand=o;C.handP=pr}
   if(!C.spine&&/^(chest|torso|spine1|spine|body|abdomen)$/.test(k))C.spine=o;if(k==='head')C.head=o}});
 if(!C.hand)m.traverse(o=>{if(!C.hand&&o.isBone&&/lowerarm.?r$|hand.?r$|arm.?r$/i.test(o.name.replace(/[^A-Za-z]/g,'')))C.hand=o});
 C.mixer=new THREE.AnimationMixer(m);for(const k in ANIM){const c=clipFor(M.anims,ANIM[k]);if(c)C.actions[k]=C.mixer.clipAction(c)}
 for(const k of['death','punch','jump'])if(C.actions[k]){C.actions[k].clampWhenFinished=true;C.actions[k].setLoop(k==='jump'?THREE.LoopRepeat:THREE.LoopOnce)}
 playA(C,'idle');addGlider(C,[0xffd23f,0x2e86de,0xffffff]);addTag(C,name);return C}
function playA(C,k,fade=.18,speed=1){let a=C.actions[k];if(!a){const fb={idleG:'idle',runG:'run',walkG:'walk',walk:'run',shoot:'idleG',dance:'idle',jump:'idle',punch:'idle'}[k];if(fb)return playA(C,fb,fade,speed);return}
 if(C.cur===k){a.setEffectiveTimeScale(speed);return}const prev=C.cur&&C.actions[C.cur];a.reset();a.setEffectiveTimeScale(speed);a.setEffectiveWeight(1);a.play();if(prev&&prev!==a)prev.crossFadeTo(a,fade,false);C.cur=k}
function addGlider(C,cols){const gl=new THREE.Group();const can=new THREE.Group();can.position.y=3.3;gl.add(can);
 for(let i=0;i<7;i++){const a=(i-3)/3*.9;const p=new THREE.Mesh(new THREE.BoxGeometry(.98,.06,2),new THREE.MeshStandardMaterial({color:cols[i%3],roughness:.6,side:THREE.DoubleSide}));p.position.set(Math.sin(a)*3,Math.cos(a)*1.2-1.2,0);p.rotation.z=-a;p.castShadow=true;can.add(p)}
 for(const s of[-1,1])for(const z of[-.8,.8]){const L=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,3.2,3),mat('line',{color:0xdddddd}));L.position.set(s*1.4,1.85,z*.5);L.rotation.z=s*.62;gl.add(L)}
 gl.visible=false;C.root.add(gl);C.glider=gl}
function addTag(C,name){if(!name)return;const c=document.createElement('canvas');c.width=256;c.height=48;const x=c.getContext('2d');x.font='bold 28px sans-serif';x.textAlign='center';x.fillStyle='rgba(0,0,0,.45)';x.fillRect(20,4,216,40);x.fillStyle='#fff';x.fillText(name,128,34);const tag=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthWrite:false}));tag.scale.set(2,.38,1);tag.position.y=2.45;C.root.add(tag);C.tag=tag}
function animChar(e,dt,far){const C=e.m;if(!C)return;if(!C.gltf)return animProc(e,dt,far);const root=C.root;
 root.position.set(e.x,e.y,e.z);root.rotation.y=e.yaw+PI;if(C.tag)C.tag.visible=Math.hypot(e.x-camera.position.x,e.z-camera.position.z)>5;root.visible=(e.alive||e.deadT<4)&&!e.inBus;
 if(!root.visible){if(e.wpn)e.wpn.visible=false;return}
 const sp=Math.hypot(e.vx||0,e.vz||0),p=e.pitch||0;
 const gun=e.alive&&e.w!=='pick'&&e.w!=='gren'&&!(e.dance>0)&&!e.build&&!(e.heal>0);
 let k='idle',spd=1;
 if(!e.alive)k='death';else if(e.dance>0)k='dance';else if(e.glide||e.fall||!e.onG)k='jump';else if(e.swing>0)k='punch';
 else if(sp>4.5){k=gun?'runG':'run';spd=clamp(sp/6.4,.7,1.4)}else if(sp>.6){k=gun?'walkG':'walk';spd=clamp(sp/2.6,.6,1.5)}else k=gun?'idleG':'idle';
 if(k==='punch'&&C.cur==='punch'&&!C.actions.punch.isRunning())C.cur=null;
 playA(C,k,.15,k==='punch'?1.7:spd);
 C.glider.visible=!!e.glide&&e.alive;if(C.glider.visible)C.glider.rotation.z=(e.bank||0)*.35;
 C.model.rotation.x=lerp(C.model.rotation.x,e.fall&&e.alive?1.2:0,Math.min(1,dt*6));
 if(!far||(frameN+e.col)%3===0)C.mixer.update(far?dt*3:dt);
 if(gun&&C.spine&&!far){C.spine.rotation.x+=-p*.55;if(e.kickT>0)C.spine.rotation.x-=e.kickT*.6}
 // Waffe in der Hand
 const rk=e.rar&&e.rar[e.sel]||0,key=e.w+':'+rk;if(e.wKey!==key){if(e.wpn&&e.wpn.parent)e.wpn.parent.remove(e.wpn);e.wpn=makeWeapon(e.w,rk);scene.add(e.wpn);e.wKey=key}
 aimDir.set(-Math.sin(e.yaw)*Math.cos(p),Math.sin(p),-Math.cos(e.yaw)*Math.cos(p));rightV.set(Math.cos(e.yaw),0,-Math.sin(e.yaw));
 if(C.hand&&!far){C.hand.getWorldPosition(e.wpn.position)}else e.wpn.position.set(e.x+rightV.x*.3+aimDir.x*.4,e.y+1.2,e.z+rightV.z*.3+aimDir.z*.4);
 e.wpn.visible=e.alive&&!e.glide&&!e.fall&&!(e.dance>0)&&!e.build&&!(e.heal>0)&&root.visible;
 if(e.w==='pick'||e.w==='gren'){if(C.hand&&!far){C.hand.getWorldQuaternion(e.wpn.quaternion);if(e.w==='pick'){e.wpn.rotateX(-PI/2);e.wpn.rotateZ(PI/2)}}else e.wpn.rotation.set(0,e.yaw,-.3)}
 else{e.wpn.rotation.set(p,e.yaw,0,'YXZ');e.wpn.position.addScaledVector(aimDir,.12);if(e.kickT>0)e.wpn.position.addScaledVector(aimDir,-e.kickT*.8)}}

/* ===================== Ballon-Bus ===================== */
const bus=new THREE.Group();{const bal=new THREE.Mesh(new THREE.SphereGeometry(9,24,16),new THREE.MeshStandardMaterial({map:stripeTex,roughness:.7}));bal.scale.set(1,1.15,1);bal.position.y=16;bus.add(bal);
 const body=new THREE.Mesh(new THREE.BoxGeometry(4,3.2,10),new THREE.MeshStandardMaterial({color:0x2e86de,metalness:.3,roughness:.5}));bus.add(body);
 const roof=new THREE.Mesh(new THREE.BoxGeometry(4.2,.4,10.2),new THREE.MeshStandardMaterial({color:0xffffff}));roof.position.y=1.8;bus.add(roof);
 for(let i=0;i<4;i++)for(const s of[-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(.1,1.2,1.6),new THREE.MeshStandardMaterial({color:0xbfe4ff,emissive:0x203040}));w.position.set(s*2.02,.4,-3.3+i*2.2);bus.add(w)}
 for(const [sx,sz] of[[-1,-1],[1,-1],[-1,1],[1,1]]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,9,4),gunMetal);r.position.set(sx*2.5,6.2,sz*3.5);r.rotation.set(sz*.2,0,-sx*.25);bus.add(r)}
 const fl=new THREE.Mesh(new THREE.ConeGeometry(1.4,3,10),new THREE.MeshBasicMaterial({color:0xffa53a,transparent:true,opacity:.85}));fl.position.y=5.5;fl.rotation.x=PI;bus.add(fl);bus.userData.fl=fl;
 for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.4,.4,.2),new THREE.MeshBasicMaterial({color:0xfff6c0}));p.position.set(s*1.3,-.6,-5.05);bus.add(p)}
 for(const s of[-1,1]){const pr=new THREE.Group();pr.position.set(s*2.6,0,4.6);const bl=new THREE.Mesh(new THREE.BoxGeometry(.15,2.6,.3),gunMetal);pr.add(bl);bus.add(pr);anims.push&&0;bus.userData['p'+s]=pr}
 bus.traverse(o=>{if(o.isMesh)o.castShadow=true});bus.visible=false;scene.add(bus)}
const BUS={cx:1,cz:0,dur:55};function busPos(t,out){const k=clamp(t/BUS.dur,0,1),R=ISL*1.1;return out.set(lerp(-BUS.cx,BUS.cx,k)*R+BUS.ox,165,lerp(-BUS.cz,BUS.cz,k)*R+BUS.oz)}
BUS.ox=0;BUS.oz=0;

/* ===================== Beute & Kisten ===================== */
let lootN=0;
function rollGun(r,minR){let q=r()*GUNW.reduce((a,b)=>a+b,0),i=0;while(q>GUNW[i]){q-=GUNW[i];i++}const k=GUNS[i];let rr=r(),rar=rr<.38?0:rr<.68?1:rr<.87?2:rr<.97?3:4;if(k==='rocket')rar=Math.max(rar,2);return{k,r:Math.max(rar,minR||0)}}
function rollItem(r){const q=r();if(q<.12)return{k:'band',n:5};if(q<.18)return{k:'med',n:1};if(q<.27)return{k:'mini',n:3};if(q<.33)return{k:'shield',n:1};
 if(q<.45){const a=['L','M','M','S','H','R'][r()*6|0];return{k:'ammo',a,n:AMMO[a].box}}if(q<.5)return{k:'gren',n:3};if(q<.55)return{k:'mat',m:MATS[r()*3|0],n:30};return rollGun(r)}
function itemModel(it){const g=new THREE.Group();
 if(WPN[it.k]&&it.k!=='gren'){const w=makeWeapon(it.k,it.r);w.rotation.y=PI/2;g.add(w)}
 else if(it.k==='gren'){for(let i=0;i<Math.min(3,it.n||1);i++){const w=makeWeapon('gren',0);w.position.set((i-1)*.25,0,0);g.add(w)}}
 else if(it.k==='med'){g.add(new THREE.Mesh(new THREE.BoxGeometry(.6,.4,.45),mat('medk',{color:0xffffff})));g.add(new THREE.Mesh(new THREE.BoxGeometry(.38,.12,.47),mat('medc',{color:0xff3b3b,emissive:0x500000})));g.add(new THREE.Mesh(new THREE.BoxGeometry(.12,.32,.47),mat('medc')))}
 else if(it.k==='band'){for(let i=0;i<2;i++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.18,12).rotateZ(PI/2),mat('bandg',{color:0xf5f0e6}));b.position.x=(i-.5)*.25;g.add(b)}}
 else if(it.k==='mini'){for(let i=0;i<Math.min(3,it.n||1);i++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.08,.11,.26,10),mat('minip',{color:0x7fdcff,emissive:0x1a6aff,emissiveIntensity:.5,transparent:true,opacity:.9}));b.position.x=(i-1)*.22;g.add(b)}}
 else if(it.k==='shield'){g.add(new THREE.Mesh(new THREE.CylinderGeometry(.18,.22,.45,10),mat('shp',{color:0x3a9bff,emissive:0x1a4aff,emissiveIntensity:.6,transparent:true,opacity:.85})));const n=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.2,8),mat('cork',{color:0xd7ccc8}));n.position.y=.3;g.add(n)}
 else if(it.k==='ammo'){const b=new THREE.Mesh(new THREE.BoxGeometry(.5,.3,.35),mat('ammoB',{color:0x4b5320}));g.add(b);const s=new THREE.Mesh(new THREE.BoxGeometry(.52,.08,.37),mat('ammo'+it.a,{color:new THREE.Color(AMMO[it.a].c),emissive:new THREE.Color(AMMO[it.a].c),emissiveIntensity:.3}));g.add(s)}
 else if(it.k==='mat'){const m=it.m==='wood'?mat('planks',{map:woodTex}):it.m==='stone'?mat('bstone',{map:buildStoneTex}):mat('bmetal',{map:metalTex,metalness:.5,roughness:.4});for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.9,.12,.3),m);p.position.set(0,i*.13,(i-1)*.08);p.rotation.y=i*.25;g.add(p)}}
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
const beamGeo=new THREE.CylinderGeometry(.35,.6,5,10,1,true).translate(0,2.5,0),beamMats={};
function lootCol(it){return it.k==='med'||it.k==='band'?0xff4d6d:it.k==='shield'||it.k==='mini'?0x3a9bff:it.k==='mat'?0xc48d55:it.k==='ammo'?new THREE.Color(AMMO[it.a].c).getHex():it.k==='gren'?0x8bc34a:new THREE.Color(RAR[it.r||0].c).getHex()}
function spawnLoot(r,x,y,z,it,id){it=it||rollItem(r);id=id||('L'+(lootN++));const col=lootCol(it);
 const g=new THREE.Group();g.position.set(x,y,z);const m=itemModel(it);m.position.y=.55;g.add(m);const big=WPN[it.k]&&it.r>=2;
 const bk=col+':'+(big?1:0);const beam=new THREE.Mesh(beamGeo,beamMats[bk]||(beamMats[bk]=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:big?.24:.1,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending})));if(big)beam.scale.set(1.2,1.6,1.2);g.add(beam);
 scene.add(g);loot.set(id,{id,x,y,z,it,g,m});return id}
function removeLoot(id){const l=loot.get(id);if(!l)return;scene.remove(l.g);loot.delete(id)}
function chestItems(r,rare){const g=rollGun(r,rare?3:0);return rare?[g,rollGun(r,3),{k:'shield',n:2},{k:'mat',m:'metal',n:100},{k:'ammo',a:WPN[g.k].am||'M',n:AMMO[WPN[g.k].am||'M'].box*2}]:[g,{k:'ammo',a:WPN[g.k].am||'M',n:AMMO[WPN[g.k].am||'M'].box},rollItem(r),{k:'mat',m:'wood',n:30}]}
function chestMesh(rare){const g=new THREE.Group();const gold=mat(rare?'chestP':'chestG',rare?{color:0x7fdcff,metalness:.6,roughness:.3,emissive:0x0a3a6a}:{color:0xffc83d,metalness:.8,roughness:.3,emissive:0x5a3a00}),wd=mat(rare?'chestB':'chestW',rare?{color:0x2e5cde}:{color:0x8a5a2b,map:woodTex});
 const base=new THREE.Mesh(new THREE.BoxGeometry(1.4,.6,.85),wd);base.position.y=.3;g.add(base);const lidP=new THREE.Group();lidP.position.set(0,.6,-.42);const lid=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,1.4,12,1,false,0,PI).rotateZ(PI/2),wd);lid.position.z=.42;lidP.add(lid);g.add(lidP);
 for(const s of[-.55,.55]){const b=new THREE.Mesh(new THREE.BoxGeometry(.1,.62,.88),gold);b.position.set(s,.3,0);g.add(b)}const lk=new THREE.Mesh(new THREE.BoxGeometry(.2,.25,.06),gold);lk.position.set(0,.55,.45);g.add(lk);
 const glow=new THREE.Mesh(new THREE.SphereGeometry(1.1,12,8),new THREE.MeshBasicMaterial({color:rare?0x7fdcff:0xffd23f,transparent:true,opacity:.12,depthWrite:false,blending:THREE.AdditiveBlending}));glow.position.y=.5;g.add(glow);
 g.traverse(o=>{if(o.isMesh&&o!==glow)o.castShadow=true});return{g,lid:lidP,glow}}
function addChest(r,x,y,z,ry){const id='C'+chests.size;const items=chestItems(r);const {g,lid,glow}=chestMesh(false);g.position.set(x,y,z);g.rotation.y=ry||0;world.add(g);chests.set(id,{id,x,y,z,g,lid,glow,items,open:false,openT:0})}
function openChest(id,local){const c=chests.get(id);if(!c||c.open||c.falling)return;c.open=true;c.glow.visible=false;c.openT=0;
 c.items.forEach((it,i)=>spawnLoot(null,c.x+Math.cos(i*1.6+.5)*1.6,c.y,c.z+Math.sin(i*1.6+.5)*1.6,it,id+'-'+i));sparkle(new THREE.Vector3(c.x,c.y+1,c.z),c.drop?0x7fdcff:0xffd23f,24);
 if(local){sfx('chest');if(room)room.send({t:'chest',id})}}
/* Versorgungskiste */
let dropN=0,dropT=0;
function supplyDrop(x,z,id,items){const {g,lid,glow}=chestMesh(true);const bal=new THREE.Mesh(new THREE.SphereGeometry(2,16,12),new THREE.MeshStandardMaterial({map:stripeTex,roughness:.6}));bal.position.y=5;g.add(bal);for(const [a,b] of[[-.6,-.35],[.6,-.35],[-.6,.35],[.6,.35]]){const L=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,3.4,3),gunMetal);L.position.set(a*.7,2.7,b*.7);g.add(L)}
 const sm=new THREE.Mesh(new THREE.CylinderGeometry(.6,1.6,60,10,1,true).translate(0,30,0),new THREE.MeshBasicMaterial({color:0x7fdcff,transparent:true,opacity:.18,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));g.add(sm);
 const gy=groundAt(x,z,200);g.position.set(x,gy+130,z);scene.add(g);chests.set(id,{id,x,y:gy,z,g,lid,glow,items,open:false,openT:0,drop:1,falling:1,bal,sm});feed('📦 Eine Versorgungskiste fällt vom Himmel!');if(me&&me.alive&&Math.hypot(x-me.x,z-me.z)<250)sfx('drop')}
/* ===================== Bauen ===================== */
const BMAT={};for(const m of MATS){const tex=m==='wood'?woodTex:m==='stone'?buildStoneTex:metalTex;BMAT[m]=new THREE.MeshStandardMaterial({map:tex,roughness:m==='metal'?.45:.8,metalness:m==='metal'?.5:0});BMAT[m+'L']=new THREE.MeshStandardMaterial({map:tex,color:0xff9a7a,roughness:.8})}
const GEOW={wx:new THREE.BoxGeometry(.3,4,4),wz:new THREE.BoxGeometry(4,4,.3),floor:new THREE.BoxGeometry(4,.25,4),ramp:new THREE.BoxGeometry(4,.25,Math.hypot(4,4)),cone:new THREE.ConeGeometry(2.83,2,4,1).rotateY(PI/4)};
function structKey(k,ix,iy,iz,d){return k+':'+ix+':'+iy+':'+iz+':'+d}
function structGeo(k,ix,iy,iz,d){const cx=ix*4,cz=iz*4,by=iy*4;const dx=[0,1,0,-1][d],dz=[1,0,-1,0][d];
 if(k==='wall'){const sx=dx?.3:4,sz=dz?.3:4;return{geo:dx?GEOW.wx:GEOW.wz,p:[cx+dx*2,by+2,cz+dz*2],r:null,b:{min:new THREE.Vector3(cx+dx*2-sx/2,by,cz+dz*2-sz/2),max:new THREE.Vector3(cx+dx*2+sx/2,by+4,cz+dz*2+sz/2)}}}
 if(k==='floor')return{geo:GEOW.floor,p:[cx,by+.12,cz],b:{min:new THREE.Vector3(cx-2,by,cz-2),max:new THREE.Vector3(cx+2,by+.25,cz+2)}};
 if(k==='cone')return{geo:GEOW.cone,p:[cx,by+1,cz],cone:1,b:{cone:1,cx,cz,by,min:new THREE.Vector3(cx-2,by,cz-2),max:new THREE.Vector3(cx+2,by+2,cz+2)}};
 return{geo:GEOW.ramp,p:[cx,by+2,cz],ramp:[Math.atan2(dx,dz)],b:{ramp:1,cx,cz,by,dx,dz,min:new THREE.Vector3(cx-2,by,cz-2),max:new THREE.Vector3(cx+2,by+4,cz+2)}}}
function placeStruct(k,ix,iy,iz,d,m,local){const key=structKey(k,ix,iy,iz,k==='floor'||k==='cone'?0:d);if(structs.has(key))return false;m=MATS.includes(m)?m:'wood';
 const G=structGeo(k,ix,iy,iz,d);const mesh=new THREE.Mesh(G.geo,BMAT[m]);mesh.position.set(...G.p);if(G.ramp){mesh.rotation.order='YXZ';mesh.rotation.y=G.ramp[0];mesh.rotation.x=-PI/4}
 mesh.castShadow=mesh.receiveShadow=true;scene.add(mesh);const s=G.b;s.mesh=mesh;s.st=1;s.key=key;s.m=m;s.max=MATHP[m];s.hp=s.max*.25;s.grow=0;s.bt=MATBT[m];s.px=mesh.position.x;mesh.scale.setScalar(.01);structs.set(key,s);if(!s.ramp&&!s.cone)gAdd(s);
 if(local){sfx('build');if(room)room.send({t:'build',k,ix,iy,iz,d,m})}return true}
function damageStruct(key,dmg,local){const s=structs.get(key);if(!s)return;s.hp-=dmg;if(local&&room)room.send({t:'sdmg',key,dmg});s.shake=.15;
 if(s.hp<=0){scene.remove(s.mesh);structs.delete(key);gDel(s);debris(s.mesh.position,s.m==='wood'?0xc48d55:s.m==='stone'?0x9a9690:0xaab4bd,14);if(me&&s.mesh.position.distanceTo(me.m.root.position)<60)sfx('break')}
 else s.mesh.material=s.hp<s.max*.35?BMAT[s.m+'L']:BMAT[s.m]}
function rampY(s,x,z){const lx=x-s.cx,lz=z-s.cz;if(Math.abs(lx)>2||Math.abs(lz)>2)return null;const t=(lx*s.dx+lz*s.dz+2)/4;return s.by+clamp(t,0,1)*4}
function coneY(s,x,z){const lx=Math.abs(x-s.cx),lz=Math.abs(z-s.cz);if(lx>2||lz>2)return null;return s.by+2*(1-Math.max(lx,lz)/2)}
/* Bau-Vorschau */
const ghostM=new THREE.MeshBasicMaterial({color:0x4fc3ff,transparent:true,opacity:.35,depthWrite:false}),ghostBad=new THREE.MeshBasicMaterial({color:0xff5a5a,transparent:true,opacity:.3,depthWrite:false});
const ghost=new THREE.Mesh(GEOW.floor,ghostM);ghost.visible=false;scene.add(ghost);const ghostE=new THREE.LineSegments(new THREE.EdgesGeometry(GEOW.floor),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.7}));ghost.add(ghostE);
function buildTarget(e,k){const fx=-Math.sin(e.yaw),fz=-Math.cos(e.yaw),p=e.pitch||0;let d;if(Math.abs(fx)>Math.abs(fz))d=fx>0?1:3;else d=fz>0?0:2;const dx=[0,1,0,-1][d],dz=[1,0,-1,0][d];
 let ix=Math.round(e.x/4),iz=Math.round(e.z/4),iy=Math.floor((e.y+.3)/4);
 if(k==='wall'){if(p>.55)iy++}
 else if(k==='ramp'){iy=Math.floor((e.y+2.3)/4);ix+=dx;iz+=dz;if(p<-.75){ix-=dx;iz-=dz}}
 else if(k==='floor'){if(p<-.6){}else{ix+=dx;iz+=dz;if(p>.55)iy++}}
 else if(k==='cone'){if(p>.25)iy++;else{ix+=dx;iz+=dz}}
 return{k,ix,iy,iz,d}}
function canBuild(e,T){return(e.mats[e.bmat]||0)>=10&&!structs.has(structKey(T.k,T.ix,T.iy,T.iz,T.k==='floor'||T.k==='cone'?0:T.d))&&Math.abs(T.iy*4-e.y)<10}
function buildFor(e,k,T){if(e.glide||e.fall||e.inBus||!e.alive)return false;T=T||buildTarget(e,k);if(!canBuild(e,T)){if(e.local&&(e.mats[e.bmat]||0)<10&&!e._nm){e._nm=1;feed('Zu wenig '+MATN[e.bmat]+' – sammle mit der Spitzhacke!');setTimeout(()=>e._nm=0,2000)}return false}
 const ok=placeStruct(k,T.ix,T.iy,T.iz,T.d,e.bmat,e.local||(e.bot&&isHost));if(ok)e.mats[e.bmat]-=10;if(e.local)refreshSlots();return ok}
function updateGhost(){if(!me||!me.alive||!me.build||me.glide||me.fall||me.inBus){ghost.visible=false;return}const T=buildTarget(me,me.build),G=structGeo(T.k,T.ix,T.iy,T.iz,T.d);if(ghost.geometry!==G.geo){ghost.geometry=G.geo;ghostE.geometry.dispose();ghostE.geometry=new THREE.EdgesGeometry(G.geo)}
 ghost.position.set(...G.p);ghost.rotation.set(0,0,0);if(G.ramp){ghost.rotation.order='YXZ';ghost.rotation.y=G.ramp[0];ghost.rotation.x=-PI/4}ghost.material=canBuild(me,T)?ghostM:ghostBad;ghost.visible=true;me._T=T}
/* ===================== Effekte ===================== */
const fx=[];const traceM=new THREE.MeshBasicMaterial({color:0xfff2a0,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false});
const traceG=new THREE.CylinderGeometry(.025,.025,1,4,1,true).rotateX(PI/2).translate(0,0,.5);
function tracer(a,b){const L=a.distanceTo(b);if(L<.1)return;const m=new THREE.Mesh(traceG,traceM);m.position.copy(a);m.lookAt(b);m.scale.set(1,1,L);scene.add(m);fx.push({o:m,t:.06,keep:1})}
const flashTex=ctex(64,64,(x,w,h)=>{const g=x.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(255,255,230,1)');g.addColorStop(.3,'rgba(255,200,80,.9)');g.addColorStop(1,'rgba(255,120,0,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});
const flashM=new THREE.SpriteMaterial({map:flashTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true});
const smokeTex=ctex(64,64,(x,w,h)=>{const g=x.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(120,120,120,.8)');g.addColorStop(1,'rgba(120,120,120,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});
function muzzle(p,s){const sp=new THREE.Sprite(flashM);sp.position.copy(p);sp.scale.setScalar(s||.8);scene.add(sp);fx.push({o:sp,t:.05,keep:1})}
const pG=new THREE.BoxGeometry(.12,.12,.12);const pMats={};const pMat=c=>pMats[c]||(pMats[c]=new THREE.MeshBasicMaterial({color:c}));
function debris(p,c,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(pG,pMat(c));m.position.copy(p);m.scale.setScalar(1+Math.random()*2);m.userData.v=new THREE.Vector3((Math.random()-.5)*8,Math.random()*6+1,(Math.random()-.5)*8);scene.add(m);fx.push({o:m,t:.7+Math.random()*.4,phys:1,keep:1})}}
function sparkle(p,c,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(pG,pMat(c));m.position.copy(p);m.userData.v=new THREE.Vector3((Math.random()-.5)*6,Math.random()*7,(Math.random()-.5)*6);scene.add(m);fx.push({o:m,t:.6+Math.random()*.4,phys:1,keep:1,spin:1})}}
function impact(p,c){for(let i=0;i<5;i++){const m=new THREE.Mesh(pG,pMat(c));m.position.copy(p);m.scale.setScalar(.6);m.userData.v=new THREE.Vector3((Math.random()-.5)*5,Math.random()*4,(Math.random()-.5)*5);scene.add(m);fx.push({o:m,t:.35,phys:1,keep:1})}}
function smoke(p,s,t){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,transparent:true,depthWrite:false,opacity:.7}));sp.position.copy(p);sp.scale.setScalar(s);scene.add(sp);fx.push({o:sp,t:t||1.2,grow:1,T:t||1.2})}
function dmgNum(p,n,head,shield){const c=document.createElement('canvas');c.width=160;c.height=64;const x=c.getContext('2d');x.font='900 46px sans-serif';x.textAlign='center';x.lineWidth=7;x.strokeStyle='#000';x.strokeText(n,80,50);x.fillStyle=head?'#ffd23f':shield?'#7fdcff':'#fff';x.fillText(n,80,50);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));s.scale.set(1.8,.72,1);s.position.copy(p);s.position.x+=(Math.random()-.5)*.6;s.position.y+=.6;scene.add(s);fx.push({o:s,t:.9,up:1})}
function tickFx(dt){for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t-=dt;if(f.phys){f.o.userData.v.y-=16*dt;f.o.position.addScaledVector(f.o.userData.v,dt);if(f.spin)f.o.rotation.x+=dt*10}if(f.up)f.o.position.y+=dt*1.6;
 if(f.grow){f.o.scale.multiplyScalar(1+dt*1.2);f.o.material.opacity=.7*f.t/f.T;f.o.position.y+=dt*1.5}
 if(f.t<=0){scene.remove(f.o);if(!f.keep){f.o.material.map&&f.o.material.map!==smokeTex&&f.o.material.map.dispose();f.o.material.dispose()}fx.splice(i,1)}}}
/* ===================== Geschosse & Explosionen ===================== */
const proj=[];const rocketG=new THREE.Group();
function projMesh(kind){const g=new THREE.Group();if(kind==='rocket'){const b=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.7,8).rotateX(PI/2),mat('rk',{color:0xdfe6e9}));g.add(b);const n=new THREE.Mesh(new THREE.ConeGeometry(.09,.25,8).rotateX(-PI/2),mat('rkn',{color:0xd63031}));n.position.z=-.47;g.add(n);const f=new THREE.Sprite(flashM);f.scale.setScalar(.7);f.position.z=.45;g.add(f)}else{g.add(makeWeapon('gren',0))}scene.add(g);return g}
function launch(owner,kind,o,v,local){const p={owner,kind,x:o.x,y:o.y,z:o.z,vx:v.x,vy:v.y,vz:v.z,t:0,local,g:projMesh(kind)};proj.push(p);if(local&&room)room.send({t:'pj',k:kind,o:[o.x,o.y,o.z].map(q=>+q.toFixed(2)),v:[v.x,v.y,v.z].map(q=>+q.toFixed(2)),id:owner.id});return p}
function stepProj(dt){for(let i=proj.length-1;i>=0;i--){const p=proj[i];p.t+=dt;const o=_v1.set(p.x,p.y,p.z);let boom=false;
 if(p.kind==='gren')p.vy-=22*dt;const L=Math.hypot(p.vx,p.vy,p.vz)*dt;if(L>0){const d=_v2.set(p.vx,p.vy,p.vz).normalize();const h=castShot(o.clone(),d.clone(),L+.15,p.owner,true);
  if(h.kind){if(p.kind==='rocket')boom=true;else{// abprallen
    p.x=h.p.x-d.x*.1;p.y=h.p.y-d.y*.1;p.z=h.p.z-d.z*.1;if(h.kind==='ground'||Math.abs(d.y)>.7){p.vy=Math.abs(p.vy)*.35;p.vx*=.6;p.vz*=.6}else{p.vx*=-.4;p.vz*=-.4}}}
  if(!boom){p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;}else{p.x=h.p.x-d.x*.3;p.y=h.p.y-d.y*.3;p.z=h.p.z-d.z*.3}}
 if(p.kind==='rocket'&&Math.random()<.6)smoke(_v3.set(p.x,p.y,p.z),.8,.7);
 if(p.kind==='gren'&&p.t>2.2)boom=true;if(p.t>8)boom=true;
 p.g.position.set(p.x,p.y,p.z);if(p.kind==='rocket')p.g.lookAt(p.x-p.vx,p.y-p.vy,p.z-p.vz);else p.g.rotation.x+=dt*8;
 if(boom){explode(_v3.set(p.x,p.y,p.z).clone(),p.owner,p.local,p.kind);scene.remove(p.g);proj.splice(i,1)}}}
function explode(pos,owner,local,kind){const R=kind==='rocket'?5:5.5,dmg=WPN[kind].dmg;
 const f=new THREE.Sprite(flashM);f.position.copy(pos);f.scale.setScalar(9);scene.add(f);fx.push({o:f,t:.18,keep:1});for(let i=0;i<6;i++)smoke(pos.clone().add(new THREE.Vector3((Math.random()-.5)*3,Math.random()*2,(Math.random()-.5)*3)),3+Math.random()*2,1.6);debris(pos,0x444444,12);debris(pos,0xff8a2a,8);
 const dd=me?pos.distanceTo(_v2.set(me.x,me.y+1,me.z)):999;sfx('boom',clamp(1.4-dd/120,.15,1));if(dd<30)shake=Math.max(shake,.6*(1-dd/30));
 if(!local)return;
 for(const e of ents.values()){if(!e.alive||e.inBus)continue;const d=pos.distanceTo(_v2.set(e.x,e.y+1,e.z));if(d<R){hitEnt(owner,e,Math.round(dmg*(1-d/R*.6)),false)}}
 for(const s of [...structs.values()]){const c=s.mesh.position;if(c.distanceTo(pos)<R+1.5)damageStruct(s.key,kind==='rocket'?400:150,true)}
 if(room)room.send({t:'ex',p:[pos.x,pos.y,pos.z].map(q=>+q.toFixed(2)),k:kind})}
/* ===================== Sturm ===================== */
const stormMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{t:{value:0}},
 vertexShader:'varying vec2 vU;varying float vY;void main(){vU=uv;vY=position.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform float t;varying vec2 vU;varying float vY;void main(){float n=sin(vU.x*140.+t*1.7)*.5+sin(vU.x*53.-t*2.3+vY*.03)*.5+sin(vU.x*311.+vY*.08-t*4.)*.25;float a=.3+.12*n;vec3 c=mix(vec3(.42,.12,.85),vec3(.85,.45,1.),n*.5+.5);float bolt=step(.985,fract(sin(floor(vU.x*60.)+floor(t*3.))*4375.5))*step(.5,fract(vY*.02+t));c+=vec3(.8,.7,1.)*bolt*.6;gl_FragColor=vec4(c,a);}'});
const stormMesh=new THREE.Mesh(new THREE.CylinderGeometry(1,1,600,128,1,true),stormMat);stormMesh.renderOrder=5;scene.add(stormMesh);
let PH=[],storm={x:0,z:0,r:ISL*1.2,dmg:1};
function makeStorm(seed){const r=rng(seed+99),sp=[1.45,1,.65][SET.storm];PH=[];let x=0,z=0,rad=ISL*1.25,t=BUS.dur+60*sp;
 PH.push({t0:0,t1:t,x0:x,z0:z,r0:rad,x1:x,z1:z,r1:rad,dmg:1});
 for(const [f,dmg] of[[.58,1],[.55,2],[.5,3],[.45,5],[.4,7],[.35,9],[.3,10],[0,12]]){const nr=rad*f||0,a=r()*TAU,off=r()*(rad-nr)*.75;const nx=x+Math.cos(a)*off,nz=z+Math.sin(a)*off;const wait=Math.max(15,45*sp-dmg*2),shrink=Math.max(15,50*sp-dmg*2);
  PH.push({t0:t,t1:t+wait,x0:x,z0:z,r0:rad,x1:x,z1:z,r1:rad,dmg,next:{x:nx,z:nz,r:nr}});t+=wait;PH.push({t0:t,t1:t+shrink,x0:x,z0:z,r0:rad,x1:nx,z1:nz,r1:nr,dmg,shrinking:1});t+=shrink;x=nx;z=nz;rad=nr}}
function stormAt(t){let p=PH[PH.length-1];for(const q of PH)if(t<q.t1){p=q;break}const k=clamp((t-p.t0)/(p.t1-p.t0),0,1);return{x:lerp(p.x0,p.x1,k),z:lerp(p.z0,p.z1,k),r:lerp(p.r0,p.r1,k),dmg:p.dmg,left:p.t1-t,shrinking:!!p.shrinking,next:p.next,phase:PH.indexOf(p)}}

/* ===================== Spieler ===================== */
let ents=new Map(),me=null,state='load',room=null,isHost=true,matchT=0,seed=1,kills=0,spect=null,myPlace=0,netT=0,lastPlayers=[],ended=false,frameN=0,dmgDealt=0;
function newEnt(o){const e=Object.assign({x:0,y:150,z:0,vx:0,vy:0,vz:0,yaw:0,pitch:0,hp:100,sh:0,alive:true,onG:false,glide:false,fall:false,inBus:true,w:'pick',slots:['pick',null,null,null,null,null],rar:[0,0,0,0,0,0],sel:0,cd:0,swing:0,kills:0,mag:{},reload:0,heal:0,dance:0,deadT:0,kickT:0,
  ammo:{L:0,M:0,H:0,S:0,R:0},mats:{wood:0,stone:0,metal:0},bmat:'wood',cons:{band:0,med:0,mini:0,shield:0},gren:0,build:null,burstQ:0},o);
 e.col=o.out||0;e.m=mkChar(e.out||0,e.local?null:e.name);ents.set(e.id,e);return e}
function clearEnts(){for(const e of ents.values()){scene.remove(e.m.root);if(e.wpn&&e.wpn.parent===scene)scene.remove(e.wpn)}ents.clear();for(const p of proj)scene.remove(p.g);proj.length=0}
function startMatch(players,set,sd){
 Object.assign(SET,set);seed=sd;const r=rng(seed+7),a=r()*TAU;BUS.cx=Math.cos(a);BUS.cz=Math.sin(a);const off=(r()-.5)*ISL*.6;BUS.ox=-BUS.cz*off;BUS.oz=BUS.cx*off;
 buildWorld(seed);makeStorm(seed);clearEnts();kills=0;dmgDealt=0;ended=false;myPlace=0;spect=null;camInit=false;dropT=BUS.dur+70;dropN=0;
 players.forEach(p=>{const e=newEnt({id:p.id,name:p.name,out:(p.out??0)%OUTFITS.length,bot:!!p.bot,local:p.id===SH_UID,remote:!p.bot&&p.id!==SH_UID,think:0,tgt:null});
  if(e.bot){e.dropAt=3+r()*(BUS.dur-8);e.dest={x:(r()-.5)*ISL*1.3,z:(r()-.5)*ISL*1.3};if(r()<.6){const q=POI[Math.floor(r()*POI.length)];e.dest={x:q.x+(r()-.5)*30,z:q.z+(r()-.5)*30}}e.aimErr=[.11,.06,.03][SET.diff];e.skill=r()}if(e.local)me=e});
 if(me){look.yaw=Math.atan2(BUS.cx,BUS.cz);look.pitch=-.25}
 matchT=0;state='play';show(null);$('hud').style.display='block';$('touch').style.display=TOUCH?'block':'none';big('🎈 ALLE AN BORD!',2.5);refreshSlots();setBuild(null);
 feed('Spring aus dem Ballon-Bus, wann du willst!')}
function dropFromBus(e){if(!e.inBus)return;e.inBus=false;e.fall=true;e.fallT=0;busPos(matchT,_v1);e.x=_v1.x+(Math.random()-.5)*3;e.y=_v1.y-3;e.z=_v1.z+(Math.random()-.5)*3;e.vx=e.vz=e.vy=0;if(e.local){sfx('jumpbus');big('',0)}}
/* ---------- Physik ---------- */
function groundAt(x,z,y){let g=H(x,z);if(g<-.4)g=-.4;
 near(x,z,.5,b=>{if(x<b.min.x-.3||x>b.max.x+.3||z<b.min.z-.3||z>b.max.z+.3)return;if(b.max.y<=y+.65&&b.max.y>g)g=b.max.y});
 for(const s of structs.values()){if(s.ramp){const ry=rampY(s,x,z);if(ry!==null&&ry<=y+.9&&ry>g)g=ry}else if(s.cone){const cy=coneY(s,x,z);if(cy!==null&&cy<=y+.9&&cy>g)g=cy}}return g}
function collideXZ(e){const r=.42;near(e.x,e.z,1.5,b=>{if(e.x<b.min.x-1||e.x>b.max.x+1||e.z<b.min.z-1||e.z>b.max.z+1)return;if(e.y+1.8<b.min.y||e.y+.6>b.max.y)return;
 const cx=clamp(e.x,b.min.x,b.max.x),cz=clamp(e.z,b.min.z,b.max.z),dx=e.x-cx,dz=e.z-cz,d=Math.hypot(dx,dz);
 if(d<r){if(d>1e-4){e.x=cx+dx/d*r;e.z=cz+dz/d*r}else{const o=[e.x-b.min.x,b.max.x-e.x,e.z-b.min.z,b.max.z-e.z],m=Math.min(...o);if(m===o[0])e.x=b.min.x-r;else if(m===o[1])e.x=b.max.x+r;else if(m===o[2])e.z=b.min.z-r;else e.z=b.max.z+r}}});
 for(const t of trees){const dx=e.x-t.x,dz=e.z-t.z;if(Math.abs(dx)>2||Math.abs(dz)>2)continue;const d=Math.hypot(dx,dz),rr=.45*t.s+r;if(d<rr&&e.y<t.y+4){e.x=t.x+dx/(d||1)*rr;e.z=t.z+dz/(d||1)*rr}}
 const d=Math.hypot(e.x,e.z);if(d>ISL*1.3){e.x*=ISL*1.3/d;e.z*=ISL*1.3/d}}
function physics(e,mx,mz,jump,dt){
 if(e.fall){e.vx=lerp(e.vx,mx*28,dt*2);e.vz=lerp(e.vz,mz*28,dt*2);e.vy=lerp(e.vy,-42,dt*1.5);e.fallT+=dt;const gh=e.y-H(e.x,e.z);if(gh<40||(jump&&gh<140&&e.fallT>1)){e.fall=false;e.glide=true;if(e.local)sfx('glide')}}
 else if(e.glide){e.vx=lerp(e.vx,mx*18,dt*1.5);e.vz=lerp(e.vz,mz*18,dt*1.5);e.vy=lerp(e.vy,-7.5,dt*3);e.bank=lerp(e.bank||0,clamp(mx*Math.cos(e.yaw)-mz*Math.sin(e.yaw),-1,1),dt*3)}
 else{const sp=e.heal>0?2.6:e.sprint?8.8:e.build?6:6.6;const acc=e.onG?14:4;e.vx=lerp(e.vx,mx*sp,Math.min(1,dt*acc));e.vz=lerp(e.vz,mz*sp,Math.min(1,dt*acc));e.vy-=24*dt;if(jump&&e.onG){e.vy=8.8;e.onG=false;if(e.local)sfx('jump')}}
 e.x+=e.vx*dt;e.z+=e.vz*dt;collideXZ(e);
 const ny=e.y+e.vy*dt,g=groundAt(e.x,e.z,e.y);
 if(e.vy>0)near(e.x,e.z,.5,b=>{if(e.x>b.min.x-.3&&e.x<b.max.x+.3&&e.z>b.min.z-.3&&e.z<b.max.z+.3&&e.y+1.9<=b.min.y&&ny+1.9>b.min.y)e.vy=0});
 if(ny<=g){if(e.fall||e.glide){e.fall=false;e.glide=false;if(e.local){sfx('land');dust(e)}}else if(!e.onG&&e.vy<-12&&e.local)dust(e);if(!e.onG&&e.vy<-19&&!e.wasGlide){const fd=Math.round((-e.vy-19)*4);if(fd>0&&(e.local||(e.bot&&isHost)))applyDmg(e,fd,null,null,true)}e.y=g;e.vy=0;e.onG=true}else{e.y=ny;e.onG=e.y-g<.06}
 e.wasGlide=e.glide||e.fall;if(e.onG)e.wasGlide=false;
 if(e.y<-.2&&!e.glide&&!e.fall){e.vx*=.9;e.vz*=.9}}
function dust(e){for(let i=0;i<10;i++){const m=new THREE.Mesh(pG,pMat(0xd8c9a8));m.position.set(e.x,e.y+.1,e.z);m.scale.setScalar(2);m.userData.v=new THREE.Vector3(Math.cos(i)*4,1.5,Math.sin(i)*4);scene.add(m);fx.push({o:m,t:.4,phys:1,keep:1})}}
/* ---------- Schießen ---------- */
function rayBox(o,d,b,maxT){let t0=0,t1=maxT;for(const ax of['x','y','z']){const inv=1/(d[ax]||1e-9);let ta=(b.min[ax]-o[ax])*inv,tb=(b.max[ax]-o[ax])*inv;if(ta>tb){const q=ta;ta=tb;tb=q}t0=Math.max(t0,ta);t1=Math.min(t1,tb);if(t0>t1)return null}return t0}
function castShot(o,d,range,shooter){let best={t:range,kind:null};
 alongRay(o,d,range,b=>{const t=rayBox(o,d,b,best.t);if(t!==null&&t<best.t)best={t,kind:b.st?'struct':'box',ref:b}});
 for(const s of structs.values())if(s.ramp||s.cone){const t=rayBox(o,d,s,best.t);if(t!==null&&t<best.t){const p=o.clone().addScaledVector(d,t+.3),ry=s.ramp?rampY(s,p.x,p.z):coneY(s,p.x,p.z);if(ry!==null&&p.y<=ry+.3)best={t,kind:'struct',ref:s}}}
 for(const e of ents.values()){if(e===shooter||!e.alive||e.inBus)continue;const b={min:{x:e.x-.45,y:e.y,z:e.z-.45},max:{x:e.x+.45,y:e.y+1.95,z:e.z+.45}};const t=rayBox(o,d,b,best.t);if(t!==null&&t<best.t){const hy=o.y+d.y*t;best={t,kind:'ent',ref:e,head:hy>e.y+1.5}}}
 for(const tr of trees){if(Math.abs(tr.x-o.x)>best.t+3||Math.abs(tr.z-o.z)>best.t+3)continue;const dx=o.x-tr.x,dz=o.z-tr.z,a=d.x*d.x+d.z*d.z,bq=2*(dx*d.x+dz*d.z),c=dx*dx+dz*dz-(.5*tr.s)**2,D=bq*bq-4*a*c;if(D<0||a<1e-6)continue;const t=(-bq-Math.sqrt(D))/(2*a);if(t>0&&t<best.t){const y=o.y+d.y*t;if(y>tr.y&&y<tr.y+5*tr.s)best={t,kind:'tree',ref:tr}}}
 for(let t=.5;t<best.t;t+=1.5){const y=o.y+d.y*t;if(y<H(o.x+d.x*t,o.z+d.z*t)){best={t,kind:'ground'};break}}
 best.p=o.clone().addScaledVector(d,best.t);return best}
const camDir=new THREE.Vector3(),tmp=new THREE.Vector3();
function gunTip(e,out){if(e.wpn&&e.wpn.parent&&e.wpn.userData.tip){e.wpn.updateMatrixWorld(true);out.copy(e.wpn.userData.tip);e.wpn.localToWorld(out)}else out.set(e.x-Math.sin(e.yaw)*.6,e.y+1.45,e.z-Math.cos(e.yaw)*.6);return out}
function aimDirOf(e,dirOverride){return dirOverride||(e.local?camDir.clone():new THREE.Vector3(-Math.sin(e.yaw)*Math.cos(e.pitch||0),Math.sin(e.pitch||0),-Math.cos(e.yaw)*Math.cos(e.pitch||0)))}
function fire(e,dirOverride){
 if(dirOverride)e.lastDir=dirOverride;const W=WPN[e.w];if(e.cd>0||e.reload>0||e.heal>0||e.glide||e.fall||e.inBus||!e.alive)return;e.dance=0;
 const rar=RAR[e.rar[e.sel]||0].m;
 if(W.melee){e.cd=W.rate;e.swing=.45;const o=new THREE.Vector3(e.x,e.y+1.3,e.z),d=new THREE.Vector3(-Math.sin(e.yaw),Math.sin(e.pitch||0)*.6,-Math.cos(e.yaw)).normalize();const h=castShot(o,d,2.8,e);
  if(e.local)sfx('swing');
  setTimeout(()=>{if(!e.alive)return;const loc=e.local||(e.bot&&isHost);
   if(h.kind==='tree'){e.mats.wood=Math.min(999,e.mats.wood+12);h.ref.hp-=W.dmg;if(e.local){sfx('chop');dmgNum(h.p,'+12 🪵',false,false);refreshSlots()}debris(h.p,0x8a5a2b,6);if(h.ref.hp<=0)fellTree(h.ref,loc)}
   else if(h.kind==='struct'){damageStruct(h.ref.key,50,loc);if(e.local){e.mats[h.ref.m]=Math.min(999,e.mats[h.ref.m]+5);sfx('chop')}}
   else if(h.kind==='box'){const m=h.ref.mat;if(m){const n=m==='metal'?8:m==='stone'?10:6;e.mats[m==='wood'?'wood':m]=Math.min(999,e.mats[m==='wood'?'wood':m]+n);if(e.local){sfx(m==='metal'?'clang':'chop');dmgNum(h.p,'+'+n+' '+MATE[m],false,false);refreshSlots()}impact(h.p,m==='metal'?0xaab4bd:0x9a9690)}else if(e.local){sfx('clang');impact(h.p,0xcccccc)}}
   else if(h.kind==='ent')hitEnt(e,h.ref,W.dmg,false)},180);return}
 if(W.throw){if(e.gren<=0)return;e.gren--;e.cd=W.rate;e.swing=.45;const d=aimDirOf(e,dirOverride);d.y+=.35;d.normalize();const o=new THREE.Vector3(e.x,e.y+1.7,e.z).addScaledVector(d,.6);
  if(e.local||(e.bot&&isHost))launch(e,'gren',o,d.multiplyScalar(19),true);if(e.local)sfx('throw');if(e.gren<=0){const i=e.slots.indexOf('gren');if(i>=0){e.slots[i]=null;if(e.sel===i){e.sel=0;e.w='pick'}}}if(e.local)refreshSlots();return}
 const mg=e.mag[e.sel]??W.mag;if(mg<=0){startReload(e);return}
 e.mag[e.sel]=mg-1;e.cd=W.rate;e.kickT=.08;if(W.burst&&!e.burstQ)e.burstQ=W.burst-1;
 const o=e.local?camera.position.clone():new THREE.Vector3(e.x,e.y+1.6,e.z);const base=aimDirOf(e,dirOverride);
 if(e.local)sfx(e.w);const tipP=gunTip(e,new THREE.Vector3());muzzle(tipP,W.pel?1.1:W.zoom||W.proj?1.3:.7);
 if(W.proj){if(e.local||(e.bot&&isHost)){// Rakete startet an der Mündung, fliegt zum Zielpunkt
   const h=castShot(o,base,W.rng,e);const d=h.p.clone().sub(tipP).normalize();launch(e,'rocket',tipP.clone(),d.multiplyScalar(62),true)}
  if(e.local){recoil+=W.kick;crossKick=2;if(e.mag[e.sel]===0)startReload(e);refreshAmmo()}return}
 const pel=W.pel||1,moving=Math.hypot(e.vx,e.vz)>1,spr=W.spr*(e.onG?1:1.8)*(moving?1.3:.85)*(scoped&&e.local?.15:1)*(e.local&&e.burstQ>0&&W.burst?1.2:1);
 for(let i=0;i<pel;i++){const d=base.clone();d.x+=(Math.random()-.5)*spr*2;d.y+=(Math.random()-.5)*spr*2;d.z+=(Math.random()-.5)*spr*2;d.normalize();
  const h=castShot(o,d,W.rng,e);if(i<3)tracer(tipP,h.p);
  if(h.kind==='ent'){const dm=Math.round(W.dmg*rar*(h.head?(W.zoom?2.2:1.6):1)*(1-Math.max(0,h.t-W.rng*.5)/W.rng*.5));hitEnt(e,h.ref,dm,h.head);impact(h.p,0xff5050)}
  else if(h.kind==='struct'){damageStruct(h.ref.key,Math.round(W.dmg*rar*.8),e.local||(e.bot&&isHost));impact(h.p,0xc48d55)}
  else if(h.kind)impact(h.p,h.kind==='tree'?0x8a5a2b:h.kind==='ground'?0x9a8a6a:0xbbbbbb)}
 if(room&&(e.local||e.bot))room.send({t:'tr',a:[tipP.x,tipP.y,tipP.z].map(v=>+v.toFixed(1)),w:e.w,id:e.id});
 if(e.local){recoil+=W.kick;crossKick=Math.min(2,crossKick+W.kick*12);if(e.mag[e.sel]===0)startReload(e);refreshAmmo()}}
function startReload(e){const W=WPN[e.w];if(!W.mag||e.reload>0||(e.mag[e.sel]??W.mag)>=W.mag)return;if(e.local&&(e.ammo[W.am]||0)<=0){if(!e._na){e._na=1;feed('Keine '+AMMO[W.am].n+'!');sfx('empty');setTimeout(()=>e._na=0,1500)}return}e.reload=W.rel*(1-.04*(e.rar[e.sel]||0));if(e.local)sfx('reload')}
function finishReload(e){const W=WPN[e.w];if(!W.mag)return;const cur=e.mag[e.sel]??0,need=W.mag-cur;if(e.bot||!e.local){e.mag[e.sel]=W.mag;return}const n=Math.min(need,e.ammo[W.am]||0);e.ammo[W.am]-=n;e.mag[e.sel]=cur+n;refreshAmmo()}
function fellTree(t,local){const i=trees.indexOf(t);if(i<0)return;DM.position.set(0,-999,0);DM.scale.setScalar(0);DM.updateMatrix();for(const [im,list] of world.treeParts){if(list===t.list){im.setMatrixAt(t.id,DM.matrix);im.instanceMatrix.needsUpdate=true}}trees.splice(i,1);debris(new THREE.Vector3(t.x,t.y+3,t.z),0x4e9a32,16);if(local&&room)room.send({t:'tree',x:Math.round(t.x),z:Math.round(t.z)})}
function hitEnt(by,tg,dmg,head){
 if(tg.remote||(tg.bot&&!isHost)){if(room)room.send({t:'hit',to:tg.id,dmg,by:by.id,bn:by.name,head})}
 else applyDmg(tg,dmg,by.id,by.name);
 if(by.local){const sh=tg.sh>0;dmgDealt+=dmg;dmgNum(new THREE.Vector3(tg.x,tg.y+1.9,tg.z),dmg,head,sh);hitMark(head);sfx(head?'head':sh?'hitsh':'hit')}}
function applyDmg(e,dmg,byId,byName,fallDmg){if(!e.alive)return;let d=dmg;const s=fallDmg?0:Math.min(e.sh,d);e.sh-=s;d-=s;e.hp-=d;e.heal=0;e.dance=0;
 if(e.local){$('dmgv').style.boxShadow=`inset 0 0 140px rgba(${s>0?'60,140,255':'255,0,0'},.6)`;setTimeout(()=>$('dmgv').style.boxShadow='inset 0 0 140px rgba(255,0,0,0)',180);sfx(s>0&&e.sh<=0?'shbreak':'hurt');shake=Math.max(shake,.25);if(byId){const b=ents.get(byId);if(b)dmgDir(b)}}
 if(e.bot&&byId){e.tgt=byId;e.hurtT=1.2;if(Math.random()<[.15,.45,.75][SET.diff]*(.5+e.skill)&&e.mats.wood+e.mats.stone>=10)botBuild(e)}
 if(e.hp<=0)die(e,byId,byName)}
function die(e,byId,byName){if(!e.alive)return;e.alive=false;e.hp=0;e.deadT=0;e.glide=e.fall=false;e.build=null;
 const by=ents.get(byId);if(by)by.kills++;if(by&&by.local){kills++;elim('💀 '+e.name+' erledigt')}
 const place=[...ents.values()].filter(q=>q.alive).length+1;
 feed((byName?byName+' ➜ ':'🌪 ')+e.name+(byName?'':' (ausgeschieden)'));
 if(e.local||(e.bot&&isHost)){const its=[];e.slots.forEach((s,i)=>{if(s&&s!=='pick'&&s!=='gren')its.push({k:s,r:e.rar[i]||0})});for(const k in e.cons)if(e.cons[k])its.push({k,n:e.cons[k]});if(e.gren)its.push({k:'gren',n:e.gren});for(const m of MATS)if(e.mats[m]>0)its.push({k:'mat',m,n:Math.min(999,e.mats[m])});for(const a in e.ammo)if(e.ammo[a]>0)its.push({k:'ammo',a,n:e.ammo[a]});
  if(e.bot){const g=e.slots.find(s=>s&&WPN[s]&&WPN[s].am);if(g)its.push({k:'ammo',a:WPN[g].am,n:AMMO[WPN[g].am].box})}
  const L=its.slice(0,14).map((it,i)=>({id:e.id+'#'+(++dropN),x:e.x+Math.cos(i*1.1)*(1.2+i*.12),y:e.y,z:e.z+Math.sin(i*1.1)*(1.2+i*.12),it}));L.forEach(l=>spawnLoot(null,l.x,l.y,l.z,l.it,l.id));if(room)room.send({t:'dead',id:e.id,by:byId,bn:byName,L})}
 if(e.local){myPlace=place;sfx('dead');scoped=false;setBuild(null);setTimeout(()=>endScreen(false),2600)}
 checkWin()}
function checkWin(){if(ended||state!=='play')return;const alive=[...ents.values()].filter(e=>e.alive);if((alive.length<=1&&ents.size>1)||alive.length===0){ended=true;const w=alive[0];if(w){w.dance=99;if(w.local){myPlace=1;sfx('win');big('🏆 #1 SIEG!',5);confetti();setTimeout(()=>endScreen(true),4500)}else if(!me||!me.alive)setTimeout(()=>endScreen(false),1500);feed('🏆 '+w.name+' gewinnt das Match!')}}}
function confetti(){for(let i=0;i<6;i++)setTimeout(()=>{if(me)sparkle(new THREE.Vector3(me.x,me.y+2.5,me.z),COLS[i*2%COLS.length],30)},i*300)}
/* ---------- Heilen & Aufheben ---------- */
function healChoice(e){const c=e.cons;if(e.sh<50&&c.mini&&e.hp>=40)return'mini';if(e.hp<75&&c.band&&!(e.hp<35&&c.med))return'band';if(e.hp<100&&c.med)return'med';if(e.sh<100&&c.shield)return'shield';if(e.sh<50&&c.mini)return'mini';return null}
function heal(e,k){if(e.heal>0||e.glide||e.fall||e.inBus)return;k=k||healChoice(e);if(!k||!e.cons[k]){if(e.local)feed(Object.values(e.cons).some(v=>v)?'Gerade nicht nötig.':'Keine Heilung dabei');return}const C=CONS[k];if(C.hp&&e.hp>=C.cap||C.sh&&e.sh>=C.cap){if(e.local)feed(C.n+': schon voll!');return}
 e.heal=C.t;e.healT=C.t;e.healK=k;e.build=null;if(e.local){sfx('healst');setBuild(null)}}
function finishHeal(e){const k=e.healK,C=CONS[k];if(!C||!e.cons[k])return;e.cons[k]--;if(C.hp)e.hp=Math.max(e.hp,Math.min(C.cap,e.hp+C.hp));else e.sh=Math.max(e.sh,Math.min(C.cap,e.sh+C.sh));if(e.local){sfx('heal');refreshSlots()}}
function pickup(e,l,local){const it=l.it;
 if(CONS[it.k])e.cons[it.k]=Math.min(CONS[it.k].max,e.cons[it.k]+(it.n||1));else if(it.k==='mat')e.mats[it.m]=Math.min(999,e.mats[it.m]+(it.n||30));else if(it.k==='ammo')e.ammo[it.a]=Math.min(999,(e.ammo[it.a]||0)+(it.n||10));
 else if(it.k==='gren'){e.gren=Math.min(9,e.gren+(it.n||1));if(!e.slots.includes('gren')){let i=e.slots.indexOf(null);if(i<0){i=e.sel||1;dropSlot(e,i)}e.slots[i]='gren';e.rar[i]=0}}
 else{let i=e.slots.indexOf(null);if(i<0){i=e.sel||1;dropSlot(e,i)}e.slots[i]=it.k;e.rar[i]=it.r;e.mag[i]=WPN[it.k].mag;if(e.local&&(e.ammo[WPN[it.k].am]||0)<WPN[it.k].mag)e.ammo[WPN[it.k].am]+=Math.ceil(WPN[it.k].mag*.5);if(e.sel===0||e.local&&!e.build){e.sel=i;e.w=it.k}}
 removeLoot(l.id);if(local){sfx('pick');refreshSlots();if(room)room.send({t:'take',id:l.id});if(WPN[it.k]&&it.k!=='gren')feed('✨ '+WPN[it.k].n+' ('+RAR[it.r].n+')')}}
function dropSlot(e,i){const old=e.slots[i];if(!old)return;if(old==='gren'){spawnLoot(null,e.x,e.y,e.z,{k:'gren',n:e.gren},e.id+'#'+(++dropN));e.gren=0}else spawnLoot(null,e.x,e.y,e.z,{k:old,r:e.rar[i]||0},e.id+'#'+(++dropN));e.slots[i]=null}
function nearestLoot(e,R){let b=null,bd=R;for(const l of loot.values()){const d=Math.hypot(l.x-e.x,l.z-e.z)+Math.abs(l.y-e.y)*.5;if(d<bd){bd=d;b=l}}return b}
function nearestChest(e,R){let b=null,bd=R;for(const c of chests.values()){if(c.open||c.falling)continue;const d=Math.hypot(c.x-e.x,c.z-e.z)+Math.abs(c.y-e.y)*.5;if(d<bd){bd=d;b=c}}return b}
function useAct(){if(!me||!me.alive)return;const c=nearestChest(me,2.6);if(c){openChest(c.id,true);return}const l=nearestLoot(me,2.4);if(l)pickup(me,l,true)}
function selSlot(i){if(!me||!me.slots[i])return;me.sel=i;me.w=me.slots[i];me.reload=0;scoped=false;setBuild(null);refreshSlots();sfx('switch')}
function setBuild(k){if(!me)return;if(k&&(me.glide||me.fall||me.inBus||!me.alive))return;me.build=k;scoped=false;if(k){me.reload=0;lastBuildPiece=k}$('buildBar').style.display=k?'flex':'none';document.querySelectorAll('[data-bp]').forEach(b=>b.classList.toggle('on',b.dataset.bp===k));['tWall','tRamp','tFloor','tCone'].forEach(id=>$(id).classList.toggle('on',$(id).dataset.k===k));$('tMat').style.display=k?'grid':'none';refreshSlots()}
let lastBuildPiece='wall';
function refreshSlots(){if(!me)return;$('slots').innerHTML=me.slots.map((s,i)=>{const W=s&&WPN[s],r=RAR[me.rar[i]||0].c;const cnt=s==='gren'?me.gren:W&&W.mag?(me.mag[i]??W.mag):'';return`<div data-i="${i}" class="${i===me.sel&&!me.build?'sel':''}" style="${s&&s!=='pick'&&s!=='gren'?'border-color:'+r+';background:linear-gradient(0deg,'+r+'55,rgba(10,14,30,.7) 70%)':''}">${W?`<img src="${weaponIcon(s,me.rar[i]||0)}">`:''}<small>${cnt!==''?cnt:''}</small><em>${i+1}</em></div>`}).join('');
 $('mats').innerHTML=MATS.map(m=>`<div class="${me.bmat===m?'on':''}" data-m="${m}">${MATE[m]}<b>${me.mats[m]}</b></div>`).join('');
 $('cons').innerHTML=Object.keys(CONS).map(k=>`<div class="${me.cons[k]?'':'zero'}" data-c="${k}">${CONS[k].e}<b>${me.cons[k]}</b></div>`).join('');
 const W=WPN[me.w];$('ammoInfo').innerHTML=me.build?`🔨 ${MATN[me.bmat]} · ${me.mats[me.bmat]}`:W&&W.am?`<b>${me.mag[me.sel]??W.mag}</b> / ${me.ammo[W.am]||0} <small>${AMMO[W.am].n}</small>`:W?W.n:'';
 $('res').textContent=me.build?'':W&&me.w!=='pick'&&me.w!=='gren'?W.n+' · '+RAR[me.rar[me.sel]||0].n:''}
function refreshAmmo(){if(!me)return;const s=$('slots').children[me.sel];const W=WPN[me.w];if(s&&W.mag)s.querySelector('small').textContent=me.mag[me.sel]??W.mag;if(W&&W.am&&!me.build)$('ammoInfo').innerHTML=`<b>${me.mag[me.sel]??W.mag}</b> / ${me.ammo[W.am]||0} <small>${AMMO[W.am].n}</small>`}
$('slots').addEventListener('pointerdown',e=>{const d=e.target.closest('[data-i]');if(d){e.stopPropagation();selSlot(+d.dataset.i)}});
$('mats').addEventListener('pointerdown',e=>{const d=e.target.closest('[data-m]');if(d&&me){e.stopPropagation();me.bmat=d.dataset.m;refreshSlots();sfx('switch')}});
$('cons').addEventListener('pointerdown',e=>{const d=e.target.closest('[data-c]');if(d&&me){e.stopPropagation();heal(me,d.dataset.c)}});
function cycleMat(){if(!me)return;me.bmat=MATS[(MATS.indexOf(me.bmat)+1)%3];refreshSlots();sfx('switch');$('tMat').textContent=MATE[me.bmat]}
function botBuild(e){const t=ents.get(e.tgt);if(t)e.yaw=Math.atan2(-(t.x-e.x),-(t.z-e.z));e.bmat=e.mats.stone>=10&&Math.random()<.5?'stone':e.mats.wood>=10?'wood':'stone';e.pitch=0;buildFor(e,'wall');if(Math.random()<.5){buildFor(e,'ramp')}if(Math.random()<.25)buildFor(e,'cone')}
/* ===================== Bots ===================== */
function los(a,b){const o=new THREE.Vector3(a.x,a.y+1.6,a.z),d=new THREE.Vector3(b.x-a.x,b.y-a.y,b.z-a.z);const L=d.length();d.normalize();const h=castShot(o,d,L,a);return h.kind==='ent'&&h.ref===b}
function botThink(e,dt){
 e.think-=dt;e.hurtT=Math.max(0,(e.hurtT||0)-dt*.2);const st=storm;let mx=0,mz=0,jump=false;
 if(e.inBus){if(matchT>e.dropAt)dropFromBus(e);return{mx,mz,jump}}
 if(e.fall||e.glide){const d=Math.atan2(e.dest.x-e.x,e.dest.z-e.z);mx=Math.sin(d);mz=Math.cos(d);e.yaw=Math.atan2(-mx,-mz);return{mx,mz,jump:e.fall&&Math.hypot(e.dest.x-e.x,e.dest.z-e.z)<70}}
 if(e.think<=0){e.think=.4+Math.random()*.3;
  const armed=e.slots.some(s=>s&&s!=='pick'&&s!=='gren'),early=matchT<BUS.dur+45,range=!armed?7:early?20:[45,65,90][SET.diff];let best=null,bd=range;
  for(const o of ents.values()){if(o===e||!o.alive||o.glide||o.fall||o.inBus)continue;const dx=o.x-e.x,dz=o.z-e.z;if(Math.abs(dx)>95||Math.abs(dz)>95)continue;const d=Math.hypot(dx,dz);const lim=o.id===e.tgt&&e.hurtT>0?95:bd;if(d<lim&&(o.id===e.tgt||Math.random()<(o.local||o.remote?.9:.55))){if(los(e,o)){bd=d;best=o}else if(o.id===e.tgt&&d<25&&e.slots.includes('rocket'))e.blocked=o.id}}
  e.enemy=best?best.id:null;
  const guns=e.slots.map((s,i)=>s&&s!=='pick'&&s!=='gren'?i:-1).filter(i=>i>=0);
  if(guns.length){let pick=guns[0],ps=-1;for(const i of guns){const k=e.slots[i];let sc=1+e.rar[i]*.2;if(best){if(bd<10&&(k==='shot'||k==='tac'))sc+=5;else if(bd<22&&(k==='smg'||k==='tac'))sc+=3;else if(bd>55&&k==='snipe')sc+=5;else if(bd>15&&(k==='ar'||k==='burst'))sc+=3;if(k==='rocket')sc+=bd>12&&bd<60?2.5:-3}else if(k==='ar'||k==='burst')sc+=1;if(sc>ps){ps=sc;pick=i}}e.sel=pick;e.w=e.slots[pick]}else{e.sel=0;e.w='pick'}
  if(best&&e.gren>0&&bd>8&&bd<26&&Math.random()<.12){const gi=e.slots.indexOf('gren');if(gi>=0){e.sel=gi;e.w='gren'}}
  const ds=Math.hypot(e.x-st.x,e.z-st.z);
  if(ds>st.r*.85||(st.next&&Math.hypot(e.x-st.next.x,e.z-st.next.z)>st.next.r*.9&&Math.random()<.5)){const tx=st.next?st.next.x:st.x,tz=st.next?st.next.z:st.z;e.dest={x:tx+(Math.random()-.5)*20,z:tz+(Math.random()-.5)*20}}
  else if(!guns.length||Math.random()<.5){const l=nearestLoot(e,55);const c=!l&&nearestChest(e,60);if(l)e.dest={x:l.x,z:l.z,loot:l.id};else if(c)e.dest={x:c.x,z:c.z,chest:c.id};else if(Math.hypot(e.dest.x-e.x,e.dest.z-e.z)<4){const a=Math.random()*TAU,r=Math.random()*st.r*.7;e.dest={x:st.x+Math.cos(a)*r,z:st.z+Math.sin(a)*r}}}
  if(!best){const k=healChoice(e);if(k&&(e.hp<70||e.sh<40||k!=='band'))heal(e,k)}
  if(!best&&e.mats.wood<80&&Math.random()<.3){const t=trees.find(t=>Math.abs(t.x-e.x)<14&&Math.abs(t.z-e.z)<14);if(t)e.dest={x:t.x,z:t.z,tree:t}}}
 const en=e.enemy&&ents.get(e.enemy);
 if(en&&en.alive&&e.heal<=0){const dx=en.x-e.x,dz=en.z-e.z,d=Math.hypot(dx,dz)||1;e.yaw=Math.atan2(-dx,-dz);const W=WPN[e.w];const want=W.melee?1.5:(e.w==='shot'||e.w==='tac')?6:e.w==='snipe'?70:e.w==='rocket'?30:24;
  const st2=Math.sin(performance.now()/600+e.col*7)*.8;const f=d>want?1:d<want*.5?-1:0;mx=(dx/d)*f+(-dz/d)*st2;mz=(dz/d)*f+(dx/d)*st2;
  e.pitch=Math.atan2(en.y+1.2-(e.y+1.6),d)+(W.throw?.1:0);
  if(Math.random()<dt*[1.6,3.2,5.5][SET.diff]||W.auto||e.burstQ){const err=e.aimErr*(1+d/80)*(en.vx||en.vz?1.4:1)*(1.2-e.skill*.4);const dir=new THREE.Vector3(dx+(Math.random()-.5)*err*d*2,en.y+1.2-(e.y+1.6)+(Math.random()-.5)*err*d*2,dz+(Math.random()-.5)*err*d*2).normalize();
   if(W.melee){if(d<2.6)fire(e)}else fire(e,dir)}
  if(Math.random()<dt*.5)jump=true;if(e.hurtT>0&&Math.random()<dt*.6*(e.skill+.3)&&(e.mats.wood+e.mats.stone)>=10)botBuild(e)}
 else{e.pitch=0;const dx=e.dest.x-e.x,dz=e.dest.z-e.z,d=Math.hypot(dx,dz);if(d>1.2){mx=dx/d;mz=dz/d;e.yaw=Math.atan2(-mx,-mz)}
  if(e.dest.tree&&d<2.4){e.sel=0;e.w='pick';e.yaw=Math.atan2(-dx,-dz);fire(e);mx=mz=0;if(!trees.includes(e.dest.tree))e.dest={x:e.x,z:e.z}}
  if(e.dest.loot){const l=loot.get(e.dest.loot);if(!l)e.dest.loot=null;else if(d<1.8){pickup(e,l,false);if(room)room.send({t:'take',id:l.id})}}
  if(e.dest.chest&&d<2.2){openChest(e.dest.chest,false);if(room)room.send({t:'chest',id:e.dest.chest});e.dest.chest=null}
  if(e.lastP&&Math.hypot(e.x-e.lastP.x,e.z-e.lastP.z)<dt*1.2&&d>2){jump=true;if(Math.random()<.02&&e.mats.wood>=10){e.pitch=0;buildFor(e,'ramp')}}e.lastP={x:e.x,z:e.z}}
 return{mx,mz,jump}}

/* ===================== Eingabe ===================== */
const keys={};let look={yaw:0,pitch:-.1},firing=false,scoped=false,recoil=0,crossKick=0,shake=0,camInit=false,lastPlaceKey='',placeT=0;const joy={x:0,y:0,id:null};
function toggleBuild(k){if(!me||!me.alive)return;if(me.build===k)setBuild(null);else{setBuild(k);sfx('switch')}}
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const k=e.key.toLowerCase();keys[k]=1;if(state!=='play'||!me)return;
 if(k==='m'){toggleMap();return}if(!me.alive)return;
 if(k===' '){e.preventDefault();if(me.inBus)dropFromBus(me)}
 if(k>='1'&&k<='6')selSlot(+k-1);if(k==='r'){if(me.build)cycleMat();else startReload(me)}if(k==='e')useAct();if(k==='h')heal(me);
 if(k==='q')toggleBuild('wall');if(k==='f')toggleBuild('ramp');if(k==='c')toggleBuild('floor');if(k==='v')toggleBuild('cone');if(k==='g')setBuild(me.build?null:lastBuildPiece);if(k==='b')emote()});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=0});
function emote(){if(!me||!me.alive||!me.onG||me.inBus)return;me.dance=me.dance>0?0:8;me.danceN=(me.danceN||0)+1;if(me.dance)sfx('dance')}
const cv=$('cv');
cv.addEventListener('mousedown',e=>{ac();if(state!=='play')return;if(document.pointerLockElement!==cv){cv.requestPointerLock&&cv.requestPointerLock();return}if(e.button===0)firing=true;if(e.button===2&&me&&WPN[me.w].zoom&&!me.build)scoped=!scoped});
addEventListener('mouseup',e=>{if(e.button===0)firing=false});cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('mousemove',e=>{if(document.pointerLockElement===cv){const s=scoped?.0007:.0023;look.yaw-=e.movementX*s;look.pitch=clamp(look.pitch-e.movementY*s,-1.35,1.25)}});
addEventListener('wheel',e=>{if(state==='play'&&me&&!me.build){let i=me.sel;for(let k=0;k<6;k++){i=(i+(e.deltaY>0?1:5))%6;if(me.slots[i])break}selSlot(i)}});
const tl={id:null,x:0,y:0};
addEventListener('pointerdown',e=>{if(!TOUCH||state!=='play'||e.pointerType==='mouse')return;ac();if(e.target===cv&&e.clientX>innerWidth*.35&&tl.id===null){tl.id=e.pointerId;tl.x=e.clientX;tl.y=e.clientY}});
addEventListener('pointermove',e=>{if(e.pointerId===tl.id){const s=scoped?.0016:.0055;look.yaw-=(e.clientX-tl.x)*s;look.pitch=clamp(look.pitch-(e.clientY-tl.y)*s,-1.35,1.25);tl.x=e.clientX;tl.y=e.clientY}});
const tlEnd=e=>{if(e.pointerId===tl.id)tl.id=null};addEventListener('pointerup',tlEnd);addEventListener('pointercancel',tlEnd);
const jz=$('joy'),kn=$('kn');function jm(e){const r=jz.getBoundingClientRect();let dx=(e.clientX-r.left-r.width/2)/(r.width/2),dy=(e.clientY-r.top-r.height/2)/(r.height/2);const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}joy.x=dx;joy.y=dy;kn.style.transform=`translate(${dx*44}px,${dy*44}px)`}
jz.addEventListener('pointerdown',e=>{e.stopPropagation();joy.id=e.pointerId;jz.setPointerCapture(e.pointerId);jm(e)});jz.addEventListener('pointermove',e=>{if(e.pointerId===joy.id)jm(e)});
const je=e=>{if(e.pointerId===joy.id){joy.id=null;joy.x=joy.y=0;kn.style.transform=''}};jz.addEventListener('pointerup',je);jz.addEventListener('pointercancel',je);
const tf=$('tFire');let tfp=null;tf.addEventListener('pointerdown',e=>{e.stopPropagation();ac();firing=true;tf.classList.add('on');tfp={id:e.pointerId,x:e.clientX,y:e.clientY};tf.setPointerCapture(e.pointerId)});
tf.addEventListener('pointermove',e=>{if(tfp&&e.pointerId===tfp.id){const s=scoped?.0016:.0045;look.yaw-=(e.clientX-tfp.x)*s;look.pitch=clamp(look.pitch-(e.clientY-tfp.y)*s,-1.35,1.25);tfp.x=e.clientX;tfp.y=e.clientY}});
const tfe=()=>{firing=false;tf.classList.remove('on');tfp=null};tf.addEventListener('pointerup',tfe);tf.addEventListener('pointercancel',tfe);
const tap=(id,f)=>$(id).addEventListener('pointerdown',e=>{e.stopPropagation();ac();if(state==='play'&&me&&me.alive)f();$(id).classList.add('hit');setTimeout(()=>$(id).classList.remove('hit'),120)});
tap('tWall',()=>toggleBuild('wall'));tap('tRamp',()=>toggleBuild('ramp'));tap('tFloor',()=>toggleBuild('floor'));tap('tCone',()=>toggleBuild('cone'));tap('tMat',cycleMat);
tap('tRel',()=>{if(me.build){setBuild(null);return}if(WPN[me.w].zoom&&!scoped)scoped=true;else if(scoped)scoped=false;else startReload(me)});tap('tHeal',()=>heal(me));tap('tUse',useAct);tap('tEmote',emote);
$('tJump').addEventListener('pointerdown',e=>{e.stopPropagation();if(me&&me.inBus){dropFromBus(me);return}keys[' ']=1;setTimeout(()=>keys[' ']=0,150)});
$('bDrop').addEventListener('pointerdown',e=>{e.stopPropagation();ac();if(me)dropFromBus(me)});
$('tMenu').addEventListener('pointerdown',e=>{e.stopPropagation();if(confirmLeave())toMenu()});
$('mini').addEventListener('pointerdown',e=>{e.stopPropagation();toggleMap()});$('bigMap').addEventListener('pointerdown',e=>{e.stopPropagation();toggleMap()});
document.querySelectorAll('[data-bp]').forEach(b=>b.addEventListener('pointerdown',e=>{e.stopPropagation();toggleBuild(b.dataset.bp)}));
function confirmLeave(){return !me||!me.alive||ended||window.confirm('Match verlassen?')}
/* ===================== Schleife ===================== */
let last=performance.now();
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;frameN++;const t=now/1000;
 stormMat.uniforms.t.value=t;skyMat.uniforms.t.value=t;if(water)water.material.map.offset.set(t*.004,t*.006);for(const a of anims)a(dt,t);
 if(state==='play'||state==='end'){matchT+=dt;storm=stormAt(matchT);
  stormMesh.position.set(storm.x,0,storm.z);stormMesh.scale.set(Math.max(.1,storm.r),1,Math.max(.1,storm.r));
  if(matchT<BUS.dur+4){busPos(matchT,bus.position);bus.rotation.y=Math.atan2(BUS.cx,BUS.cz);bus.userData.fl.scale.setScalar(.8+Math.random()*.4);bus.visible=true}else bus.visible=false;
  if(matchT>BUS.dur)for(const e of ents.values())if(e.inBus&&(e.local||(e.bot&&isHost)))dropFromBus(e);
  if(isHost&&matchT>dropT&&!ended){dropT=matchT+80+Math.random()*40;const s=storm.next||storm,a=Math.random()*TAU,rr=Math.sqrt(Math.random())*s.r*.7;const x=s.x+Math.cos(a)*rr,z=s.z+Math.sin(a)*rr;if(H(x,z)>1){const id='D'+(++sdN),items=chestItems(Math.random,true);supplyDrop(x,z,id,items);if(room)room.send({t:'sd',x,z,id,items})}}
  if(me&&me.alive){let ix=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joy.x,iz=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+joy.y;const l=Math.hypot(ix,iz);if(l>1){ix/=l;iz/=l}
   const cy=Math.cos(look.yaw),sy=Math.sin(look.yaw),mx=ix*cy+iz*sy,mz=-ix*sy+iz*cy;
   if(me.inBus){busPos(matchT,_v1);me.x=_v1.x;me.y=_v1.y;me.z=_v1.z}else{me.yaw=me.glide||me.fall?(l>.1?Math.atan2(-mx,-mz):me.yaw):look.yaw;me.pitch=look.pitch;me.sprint=(keys.shift||Math.hypot(joy.x,joy.y)>.97)&&iz<-.3&&!firing&&!scoped&&me.heal<=0;if(l>.1||firing)me.dance=0;physics(me,mx,mz,keys[' '],dt)}
   if(me.build){updateGhost();placeT-=dt;if(firing&&me._T){const key=me._T.k+me._T.ix+','+me._T.iy+','+me._T.iz+','+me._T.d;if(key!==lastPlaceKey||placeT<=0){if(buildFor(me,me.build,me._T)){lastPlaceKey=key;placeT=.35}else placeT=.15}}if(!firing)lastPlaceKey=''}
   else{ghost.visible=false;if(firing&&(WPN[me.w].auto||me.cd<=0)){fire(me);if(!WPN[me.w].auto&&!TOUCH)firing=false}}
   const l2=!me.glide&&!me.fall&&!me.inBus&&(nearestChest(me,2.6)||nearestLoot(me,2.4));const pr=$('prompt');if(l2){pr.style.display='block';pr.textContent=l2.items?(l2.drop?'✋ E: Versorgungskiste öffnen':'✋ E: Kiste öffnen'):'✋ E: '+itemName(l2.it);pr.onclick=useAct}else pr.style.display='none';
   if(TOUCH&&l2&&l2.it&&['mat','ammo','band','mini','med','shield'].includes(l2.it.k))useAct()}else ghost.visible=false;
  for(const e of ents.values()){
   if(!e.alive){e.deadT+=dt;animChar(e,dt,false);continue}
   e.cd=Math.max(0,e.cd-dt);e.swing=Math.max(0,e.swing-dt);e.kickT=Math.max(0,e.kickT-dt);e.dance=Math.max(0,e.dance-dt);
   if(e.burstQ>0){const W=WPN[e.w];if(!W.burst)e.burstQ=0;else{e.burstT=(e.burstT??W.bint)-dt;if(e.burstT<=0){e.burstT=W.bint;e.burstQ--;e.cd=0;fire(e,e.local?null:e.lastDir);e.cd=W.rate}}}
   if(e.reload>0){e.reload-=dt;if(e.reload<=0)finishReload(e)}
   if(e.heal>0){e.heal-=dt;if(e.heal<=0)finishHeal(e)}
   if(e.bot&&isHost){const c=botThink(e,dt);if(e.inBus){busPos(matchT,_v1);e.x=_v1.x;e.y=_v1.y;e.z=_v1.z}else physics(e,c.mx,c.mz,c.jump,dt)}
   if(e.remote||(e.bot&&!isHost)){const k=Math.min(1,dt*10);if(e.tx!==undefined){e.x+=(e.tx-e.x)*k;e.y+=(e.ty-e.y)*k;e.z+=(e.tz-e.z)*k;let d=e.tyaw-e.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));e.yaw+=d*k;e.vx=(e.tx-e.x)*4;e.vz=(e.tz-e.z)*4;e.onG=!e.glide&&!e.fall&&Math.abs(e.y-groundAt(e.x,e.z,e.y))<.3}}
   if((e.local||(e.bot&&isHost))&&!e.glide&&!e.fall&&!e.inBus&&Math.hypot(e.x-storm.x,e.z-storm.z)>storm.r){e.stT=(e.stT||0)+dt;if(e.stT>=1){e.stT=0;e.hp-=storm.dmg;if(e.local){sfx('storm');shake=.1}if(e.hp<=0)die(e,null,null)}}
   if(e.y<-30&&e.alive&&(e.local||(e.bot&&isHost)))die(e,null,null);
   const far=Math.hypot(e.x-camera.position.x,e.z-camera.position.z)>75;animChar(e,dt,far&&!e.local)}
  stepProj(dt);
  for(const s of structs.values()){if(s.grow<1){s.grow=Math.min(1,s.grow+dt*6);s.mesh.scale.setScalar(.2+.8*smooth(s.grow))}if(s.hp<s.max&&s.bt>0){s.hp=Math.min(s.max,s.hp+s.max*.75/s.bt*dt);s.bt-=dt}if(s.shake>0){s.shake-=dt;s.mesh.position.x=s.px+(s.shake>0?(Math.random()-.5)*.06:0)}}
  for(const c of chests.values()){if(c.falling){c.g.position.y-=8*dt;c.g.rotation.y+=dt*.3;if(c.g.position.y<=c.y){c.g.position.y=c.y;c.falling=false;c.bal.visible=false;sparkle(new THREE.Vector3(c.x,c.y+1,c.z),0x7fdcff,20)}}
   if(c.open){if(c.openT<1){c.openT=Math.min(1,c.openT+dt*3);c.lid.rotation.x=-c.openT*1.9}if(c.sm)c.sm.visible=false}else c.glow.scale.setScalar(1+.15*Math.sin(t*4+c.x))}
  if(room){netT-=dt;if(netT<=0){netT=.066;
   if(me&&me.alive)room.send({t:'s',p:[+me.x.toFixed(2),+me.y.toFixed(2),+me.z.toFixed(2),+me.yaw.toFixed(2),+me.pitch.toFixed(2)],hp:Math.round(me.hp),sh:Math.round(me.sh),w:me.w,ra:me.rar[me.sel]||0,g:me.glide?1:me.fall?2:me.inBus?3:0,sw:me.swing>0?1:0,dn:me.dance>0?1:0,bd:me.build?1:0,hl:me.heal>0?1:0});
   if(isHost&&ents.size)room.send({t:'B',L:[...ents.values()].filter(e=>e.bot&&e.alive).map(e=>[e.id,+e.x.toFixed(1),+e.y.toFixed(1),+e.z.toFixed(1),+e.yaw.toFixed(2),e.w,e.glide?1:e.fall?2:e.inBus?3:0,Math.round(e.hp),Math.round(e.sh),e.rar[e.sel]||0,+(e.pitch||0).toFixed(2),e.swing>0?1:0,e.heal>0?1:0]),T:+matchT.toFixed(1)})}}
  camUpdate(dt);hud();tickFx(dt);
  for(const l of loot.values()){l.m.rotation.y+=dt*1.6;l.m.position.y=.55+Math.sin(t*2.5+l.x)*.12}}
 else{const a=t*.04;camera.position.set(Math.sin(a)*520,140,Math.cos(a)*520);camera.lookAt(0,10,0);sun.position.set(120,220,80);sun.target.position.set(0,0,0)}
 sky.position.copy(camera.position);
 if(!NORENDER)renderer.render(scene,camera)}
let sdN=0;
const NORENDER=/norender/.test(location.search);
function itemName(it){if(CONS[it.k])return CONS[it.k].n+' '+CONS[it.k].e+((it.n||1)>1?' ×'+it.n:'');if(it.k==='mat')return MATN[it.m]+' '+MATE[it.m]+' ×'+it.n;if(it.k==='ammo')return AMMO[it.a].n+' ×'+it.n;if(it.k==='gren')return'Granate 💣 ×'+(it.n||1);return WPN[it.k].n+' ('+RAR[it.r].n+')'}
let camOverride=null;function camUpdate(dt){if(camOverride){camera.position.copy(camOverride.p);camera.lookAt(camOverride.l);return}let t=me&&me.alive?me:spect&&ents.get(spect)||null;if(!t||(!t.alive&&t!==me)){const al=[...ents.values()].filter(e=>e.alive&&!e.inBus);if(al.length){spect=al[0].id;t=al[0]}else t=me}
 if(!t)return;recoil=Math.max(0,recoil-dt*.6);crossKick=Math.max(0,crossKick-dt*6);
 const yaw=t===me?look.yaw:t.yaw,pitch=(t===me?look.pitch:t.pitch||0)+recoil;
 if(t.inBus){busPos(matchT,_v1);const d=48,pp=clamp(pitch-.35,-1.2,.3);tmp.set(_v1.x+Math.sin(yaw)*d*Math.cos(pp),_v1.y+6-Math.sin(pp)*d,_v1.z+Math.cos(yaw)*d*Math.cos(pp));camera.position.lerp(tmp,camInit?Math.min(1,dt*5):1);camInit=true;camera.lookAt(_v1.x,_v1.y+4,_v1.z);camDir.set(-Math.sin(yaw),0,-Math.cos(yaw));setFov(70);sun.position.set(_v1.x+120,_v1.y+220,_v1.z+80);sun.target.position.copy(_v1);$('cross').style.display='none';return}
 const dist=scoped?0:t.glide?8:t.fall?7:t.build?4.4:3.9,side=scoped?0:t.glide||t.fall?0:1.05,up=scoped?1.62:t.glide?3.2:2.05;
 const fx=-Math.sin(yaw)*Math.cos(pitch),fy=Math.sin(pitch),fz=-Math.cos(yaw)*Math.cos(pitch);camDir.set(fx,fy,fz).normalize();
 const rx=Math.cos(yaw),rz=-Math.sin(yaw);
 tmp.set(t.x+rx*side-fx*dist,t.y+up-fy*dist,t.z+rz*side-fz*dist);
 if(dist>0){const o=new THREE.Vector3(t.x+rx*side*.5,t.y+up,t.z+rz*side*.5),d=tmp.clone().sub(o),L=d.length();d.normalize();let mn=L;near(t.x,t.z,8,b=>{const q=rayBox(o,d,b,L);if(q!==null&&q<mn)mn=q});if(mn<L)tmp.copy(o).addScaledVector(d,Math.max(.3,mn-.25))}
 const gy=H(tmp.x,tmp.z)+.4;if(tmp.y<gy)tmp.y=gy;
 camera.position.lerp(tmp,camInit?Math.min(1,dt*(t.fall||t.glide?6:20)):1);camInit=true;
 if(shake>0){shake-=dt;camera.position.x+=(Math.random()-.5)*shake*.5;camera.position.y+=(Math.random()-.5)*shake*.5}
 camera.lookAt(camera.position.x+fx*10,camera.position.y+fy*10,camera.position.z+fz*10);
 setFov(scoped?20:t.fall?84:70+(Math.hypot(t.vx,t.vz)>5?3:0));
 $('scope').style.display=scoped?'block':'none';if(me&&scoped){me.m.root.visible=false}
 sun.position.set(t.x+120,t.y+220,t.z+80);sun.target.position.set(t.x,t.y,t.z);
 $('cross').style.transform=`scale(${1+crossKick*.6+(t.onG?0:.4)})`;$('cross').style.display=t.glide||t.fall||scoped||t!==me?'none':'block';$('cross').classList.toggle('bld',!!(t===me&&me.build))}
function setFov(f){if(Math.abs(camera.fov-f)>.05){camera.fov+=(f-camera.fov)*.15;camera.updateProjectionMatrix()}}
let hudT=0;function hud(){hudT-=1;if(hudT>0)return;hudT=4;
 const al=[...ents.values()].filter(e=>e.alive).length;$('iAlive').textContent='👥 '+al;$('iKills').textContent='💀 '+kills;
 const s=storm;$('iStorm').innerHTML=(s.shrinking?'🌪 Sturm zieht zu ':'🌪 Sturm in ')+'<b>'+Math.max(0,Math.ceil(s.left))+'s</b>'+(s.phase>0?' · Phase '+Math.ceil(s.phase/2):'');
 const t=me&&me.alive?me:null;if(t){$('bHp').firstChild.style.width=t.hp+'%';$('bHp').lastChild.textContent='❤ '+Math.ceil(t.hp);$('bSh').firstChild.style.width=t.sh+'%';$('bSh').lastChild.textContent='🛡 '+Math.ceil(t.sh);
  $('storm').style.display=!t.glide&&!t.inBus&&Math.hypot(t.x-s.x,t.z-s.z)>s.r?'block':'none';
  $('msg').textContent=t.inBus?'':t.heal>0?CONS[t.healK].e+' '+CONS[t.healK].n+' … '+t.heal.toFixed(1)+'s':t.reload>0?'Nachladen …':t.fall?'⤓ Sturzflug – Leertaste/⤒ öffnet den Gleiter':t.glide?'🪂 Gleiten':'';
  $('healBar').style.display=t.heal>0?'block':'none';if(t.heal>0)$('healBar').firstChild.style.width=(1-t.heal/t.healT)*100+'%';
  $('busUI').style.display=t.inBus?'block':'none';
  const ds=Math.hypot(t.x-s.x,t.z-s.z);$('stormDist').textContent=ds>s.r?'⚠️ Im Sturm! '+Math.round(ds-s.r)+' m bis zur sicheren Zone':s.next&&Math.hypot(t.x-s.next.x,t.z-s.next.z)>s.next.r?'➜ Nächste Zone: '+Math.round(Math.hypot(t.x-s.next.x,t.z-s.next.z)-s.next.r)+' m':''}else{$('busUI').style.display='none';$('healBar').style.display='none'}
 compass();drawMini();if(mapOpen)drawBigMap()}
function compass(){const yaw=me&&me.alive?look.yaw:0,deg=((-yaw*180/PI)%360+360)%360,W=$('compass').clientWidth||300;let h='';const marks=[[0,'N'],[45,'NO'],[90,'O'],[135,'SO'],[180,'S'],[225,'SW'],[270,'W'],[315,'NW']];
 for(const [a,n] of marks)for(const off of[-360,0,360]){const x=(a+off-deg)*2.4+W/2;if(x>-20&&x<W+20)h+=`<span style="position:absolute;left:${(x-14)|0}px;width:28px;text-align:center;color:${n.length===1?'#ffd23f':'#fff'}">${n}</span>`}
 for(let a=15;a<360;a+=15){if(a%45===0)continue;for(const off of[-360,0,360]){const x=(a+off-deg)*2.4+W/2;if(x>-5&&x<W+5)h+=`<i style="position:absolute;left:${x|0}px;top:18px;width:1px;height:6px;background:rgba(255,255,255,.5)"></i>`}}
 $('compIn').innerHTML=h}
/* Karten */
const MAPS=600,miniBg=document.createElement('canvas');miniBg.width=miniBg.height=MAPS;let miniFor=-1;const MK=MAPS/(ISL*2.3),MO=MAPS/2;
function mapBg(){if(miniFor===seed)return;miniFor=seed;const b=miniBg.getContext('2d'),img=b.createImageData(MAPS,MAPS);for(let py=0;py<MAPS;py++)for(let px=0;px<MAPS;px++){const X=(px-MO)/MK,Z=(py-MO)/MK,y=H(X,Z),i=(py*MAPS+px)*4;
  const cc=y<-.4?[47,140,210]:y<.8?[230,210,160]:inSnow(X,Z)?[232,238,245]:inDesert(X,Z)?[214,170,110]:y>34?[160,160,150]:y>24?[120,145,85]:[90+y*2,165,70];const sh=(H(X+2,Z+2)-y)*6;img.data[i]=clamp(cc[0]-sh,0,255);img.data[i+1]=clamp(cc[1]-sh,0,255);img.data[i+2]=clamp(cc[2]-sh,0,255);img.data[i+3]=255}b.putImageData(img,0,0)}
function drawMini(){mapBg();const c=$('mini'),x=c.getContext('2d'),S=300,R=170;const t=me&&me.alive&&!me.inBus?me:null,cx=t?t.x:0,cz=t?t.z:0,sc=t?S/(R*2):S/(ISL*2.3),ox=S/2-cx*sc,oz=S/2-cz*sc;
 x.fillStyle='#2f8cd2';x.fillRect(0,0,S,S);x.save();x.translate(ox,oz);x.scale(sc,sc);x.drawImage(miniBg,-MO/MK,-MO/MK,MAPS/MK,MAPS/MK);
 const s=storm;x.fillStyle='rgba(120,40,200,.4)';x.beginPath();x.rect(-2000,-2000,4000,4000);x.arc(s.x,s.z,Math.max(1,s.r),0,TAU,true);x.fill('evenodd');x.strokeStyle='#c070ff';x.lineWidth=3/sc;x.beginPath();x.arc(s.x,s.z,Math.max(1,s.r),0,TAU);x.stroke();
 if(s.next){x.strokeStyle='#fff';x.lineWidth=2/sc;x.setLineDash([6/sc,5/sc]);x.beginPath();x.arc(s.next.x,s.next.z,Math.max(1,s.next.r),0,TAU);x.stroke();x.setLineDash([])}
 x.font=`bold ${12/sc}px sans-serif`;x.textAlign='center';for(const q of POI){x.fillStyle='rgba(0,0,0,.6)';x.fillText(q.name,q.x+1/sc,q.z+1/sc);x.fillStyle='#fff';x.fillText(q.name,q.x,q.z)}
 for(const c2 of chests.values())if(c2.drop&&!c2.open){x.fillStyle='#7fdcff';x.fillRect(c2.x-5/sc,c2.z-5/sc,10/sc,10/sc)}
 if(matchT<BUS.dur){x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=2/sc;busPos(0,_v1);busPos(BUS.dur,_v2);x.beginPath();x.moveTo(_v1.x,_v1.z);x.lineTo(_v2.x,_v2.z);x.stroke();busPos(matchT,_v1);x.font=`${20/sc}px sans-serif`;x.fillText('🎈',_v1.x,_v1.z+7/sc)}
 for(const e of ents.values()){if(!e.alive||e.inBus||e.local)continue;if(e.remote){x.fillStyle='#38e1ff';x.beginPath();x.arc(e.x,e.z,5/sc,0,TAU);x.fill()}}
 x.restore();if(t){x.save();x.translate(S/2,S/2);x.rotate(-look.yaw);x.fillStyle='#ffd23f';x.strokeStyle='#000';x.lineWidth=2;x.beginPath();x.moveTo(0,-11);x.lineTo(8,8);x.lineTo(-8,8);x.closePath();x.fill();x.stroke();x.restore()}}
let mapOpen=false;function toggleMap(){mapOpen=!mapOpen;$('bigMap').style.display=mapOpen?'block':'none';if(mapOpen)drawBigMap()}
function drawBigMap(){mapBg();const c=$('bigMap'),S=Math.min(innerWidth,innerHeight)*.9;if(c.width!==Math.round(S*1.5)){c.width=c.height=Math.round(S*1.5);c.style.width=c.style.height=S+'px'}const x=c.getContext('2d'),W=c.width,k=W/MAPS;x.drawImage(miniBg,0,0,W,W);x.save();x.scale(k*MK,k*MK);x.translate(MO/MK,MO/MK);
 const s=storm;x.fillStyle='rgba(120,40,200,.4)';x.beginPath();x.rect(-2000,-2000,4000,4000);x.arc(s.x,s.z,Math.max(1,s.r),0,TAU,true);x.fill('evenodd');x.strokeStyle='#c070ff';x.lineWidth=3;x.beginPath();x.arc(s.x,s.z,Math.max(1,s.r),0,TAU);x.stroke();
 if(s.next){x.strokeStyle='#fff';x.lineWidth=2.5;x.setLineDash([10,8]);x.beginPath();x.arc(s.next.x,s.next.z,Math.max(1,s.next.r),0,TAU);x.stroke();x.setLineDash([])}
 x.font='bold 17px sans-serif';x.textAlign='center';for(const q of POI){x.fillStyle='rgba(0,0,0,.65)';x.fillText(q.name.toUpperCase(),q.x+1.5,q.z+1.5);x.fillStyle='#fff';x.fillText(q.name.toUpperCase(),q.x,q.z)}
 if(matchT<BUS.dur){busPos(0,_v1);busPos(BUS.dur,_v2);x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=3;x.setLineDash([12,8]);x.beginPath();x.moveTo(_v1.x,_v1.z);x.lineTo(_v2.x,_v2.z);x.stroke();x.setLineDash([]);busPos(matchT,_v1);x.font='26px sans-serif';x.fillText('🎈',_v1.x,_v1.z+9)}
 for(const c2 of chests.values())if(c2.drop&&!c2.open){x.font='20px sans-serif';x.fillText('📦',c2.x,c2.z+7)}
 for(const e of ents.values()){if(!e.alive||e.inBus)continue;if(e.remote){x.fillStyle='#38e1ff';x.beginPath();x.arc(e.x,e.z,6,0,TAU);x.fill()}}
 if(me&&me.alive){const px=me.inBus?busPos(matchT,_v1).x:me.x,pz=me.inBus?_v1.z:me.z;x.save();x.translate(px,pz);x.rotate(-look.yaw);x.fillStyle='#ffd23f';x.strokeStyle='#000';x.lineWidth=3;x.beginPath();x.moveTo(0,-16);x.lineTo(12,12);x.lineTo(-12,12);x.closePath();x.fill();x.stroke();x.restore()}x.restore()}
let hmT=null;function hitMark(head){const h=$('hitm');h.style.opacity=1;h.querySelectorAll('i').forEach(i=>i.style.background=head?'#ffd23f':'#fff');clearTimeout(hmT);hmT=setTimeout(()=>h.style.opacity=0,130)}
function dmgDir(b){if(!me)return;const a=Math.atan2(b.x-me.x,b.z-me.z),rel=a-Math.atan2(-Math.sin(look.yaw),-Math.cos(look.yaw));const d=document.createElement('div');d.className='ddir';d.style.transform=`rotate(${(-rel*180/PI).toFixed(0)}deg)`;$('hud').appendChild(d);setTimeout(()=>d.remove(),800)}
let bigT=null;function big(t,s){const b=$('big');b.textContent=t;b.classList.toggle('on',!!t);clearTimeout(bigT);if(s)bigT=setTimeout(()=>b.classList.remove('on'),s*1000)}
let elT=null;function elim(t){const e=$('elim');e.textContent=t;e.style.opacity=1;clearTimeout(elT);elT=setTimeout(()=>e.style.opacity=0,2200);sfx('elim')}
function feed(t){const d=document.createElement('div');d.textContent=t;$('feed').prepend(d);setTimeout(()=>d.remove(),6000);while($('feed').children.length>6)$('feed').lastChild.remove()}
/* ===================== Menü / Online ===================== */
function show(id){for(const s of['menu','lobby','end'])$(s).style.display=s===id?'flex':'none';if(id){$('hud').style.display='none';$('touch').style.display='none';ghost.visible=false;if(mapOpen)toggleMap();if(document.exitPointerLock)document.exitPointerLock()}}
function soloPlayers(){const ps=[{id:SH_UID,name:myName(),out:myOut}];for(let i=0;i<SET.bots;i++)ps.push({id:'bot'+i,name:BOTN[i%BOTN.length],out:Math.random()*OUTFITS.length|0,bot:true});return ps}
$('bSolo').onclick=()=>{ac();room=null;isHost=true;lastPlayers=soloPlayers();startMatch(lastPlayers,{},Math.floor(Math.random()*1e9))};
$('bCreate').onclick=async()=>{ac();$('err').textContent='Erstelle Raum …';try{room=await Room.create('royale3',{name:myName(),out:myOut},16)}catch(e){$('err').textContent='Online geht gerade nicht.';return}isHost=true;$('myCode').textContent=room.code;wire();lobby()};
$('bJoin').onclick=async()=>{ac();const code=$('code').value.trim().toUpperCase();if(code.length!==4){$('err').textContent='Bitte 4-stelligen Code eingeben.';return}$('err').textContent='Verbinde …';try{room=await Room.join('royale3',code,{name:myName(),out:myOut})}catch(e){$('err').textContent=e.message||'Raum nicht gefunden';room=null;return}isHost=false;$('myCode').textContent=room.code;wire();lobby()};
function lobby(){show('lobby');$('plist').innerHTML=room.peers.map(p=>`<div>${(OUTFITS[p.out|0]||OUTFITS[0]).e} ${String(p.name).replace(/</g,'')}${p.id===SH_UID?' (du)':''}</div>`).join('');$('bGo').style.display=isHost?'':'none';$('lobTxt').textContent=isHost?`Bots füllen auf (${SET.bots} Bots, Stärke ${['Leicht','Mittel','Profi'][SET.diff]}).`:'Warte auf den Start durch den Gastgeber …'}
function hostStart(){const ps=room.peers.map(p=>({id:p.id,name:p.name,out:(p.out|0)%OUTFITS.length}));for(let i=0;i<SET.bots;i++)ps.push({id:'bot'+i,name:BOTN[i%BOTN.length],out:Math.random()*OUTFITS.length|0,bot:true});const sd=Math.floor(Math.random()*1e9);lastPlayers=ps;room.send({t:'go',ps,set:{bots:SET.bots,diff:SET.diff,storm:SET.storm},seed:sd});startMatch(ps,{},sd)}
$('bGo').onclick=hostStart;
function validIt(it){if(!it||typeof it!=='object')return null;if(WPN[it.k]&&it.k!=='pick'&&it.k!=='gren')return{k:it.k,r:clamp(it.r|0,0,4)};if(it.k==='gren')return{k:'gren',n:clamp(it.n|0,1,9)};if(CONS[it.k])return{k:it.k,n:clamp(it.n|0,1,CONS[it.k].max)};if(it.k==='mat'&&MATS.includes(it.m))return{k:'mat',m:it.m,n:clamp(it.n|0,1,999)};if(it.k==='ammo'&&AMMO[it.a])return{k:'ammo',a:it.a,n:clamp(it.n|0,1,999)};return null}
function wire(){
 room.on('peers',()=>{if($('lobby').style.display!=='none')lobby()});
 room.on('msg',(m,from)=>{
  if(m.t==='go'){lastPlayers=m.ps;startMatch(m.ps,{bots:m.set.bots|0,diff:clamp(m.set.diff|0,0,2),storm:clamp(m.set.storm|0,0,2)},m.seed|0);return}
  if(state!=='play'&&state!=='end')return;
  if(m.t==='s'){const e=ents.get(from);if(!e||!e.alive||!Array.isArray(m.p))return;[e.tx,e.ty,e.tz,e.tyaw,e.pitch]=m.p.map(Number);e.glide=m.g===1;e.fall=m.g===2;e.inBus=m.g===3;if(Math.hypot(e.tx-e.x,e.tz-e.z)>30||e.inBus){e.x=e.tx;e.y=e.ty;e.z=e.tz}e.hp=+m.hp||0;e.sh=+m.sh||0;e.w=WPN[m.w]?m.w:'pick';e.rar[e.sel]=clamp(m.ra|0,0,4);if(m.sw&&e.swing<=0)e.swing=.45;e.dance=m.dn?1:0;e.build=m.bd?'wall':null;e.heal=m.hl?1:0;e.healK='band'}
  else if(m.t==='B'&&!isHost){for(const b of m.L){const e=ents.get(b[0]);if(!e||!e.alive)continue;e.tx=b[1];e.ty=b[2];e.tz=b[3];e.tyaw=b[4];e.w=WPN[b[5]]?b[5]:'pick';e.glide=b[6]===1;e.fall=b[6]===2;e.inBus=b[6]===3;e.hp=b[7];e.sh=b[8];e.rar[e.sel]=clamp(b[9]|0,0,4);e.pitch=b[10]||0;if(b[11]&&e.swing<=0)e.swing=.45;e.heal=b[12]?1:0;e.healK='band';if(Math.hypot(e.tx-e.x,e.tz-e.z)>30||e.inBus){e.x=e.tx;e.y=e.ty;e.z=e.tz}}if(Math.abs(m.T-matchT)>2)matchT=m.T}
  else if(m.t==='tr'){const e=ents.get(m.id);if(e&&!e.local&&!(e.bot&&isHost)&&Array.isArray(m.a)){e.kickT=.08;const a=new THREE.Vector3(+m.a[0],+m.a[1],+m.a[2]),d=new THREE.Vector3(-Math.sin(e.yaw)*Math.cos(e.pitch||0),Math.sin(e.pitch||0),-Math.cos(e.yaw)*Math.cos(e.pitch||0)).normalize();const h=castShot(a,d,WPN[m.w]&&WPN[m.w].rng||60,e);tracer(a,h.p);muzzle(a,.8);if(me&&Math.hypot(e.x-me.x,e.z-me.z)<120)sfx(WPN[m.w]?m.w:'pistol',.35)}}
  else if(m.t==='hit'){const e=ents.get(m.to);if(!e)return;if(e.local||(e.bot&&isHost))applyDmg(e,clamp(m.dmg|0,0,250),m.by,String(m.bn||'').slice(0,14))}
  else if(m.t==='dead'){const e=ents.get(m.id);if(e&&e.alive){if(Array.isArray(m.L))m.L.slice(0,16).forEach(l=>{const it=l&&validIt(l.it);if(it)spawnLoot(null,+l.x,+l.y,+l.z,it,String(l.id))});die(e,m.by,m.bn)}}
  else if(m.t==='take')removeLoot(m.id);
  else if(m.t==='chest')openChest(m.id,false);
  else if(m.t==='build'&&['wall','floor','ramp','cone'].includes(m.k))placeStruct(m.k,m.ix|0,m.iy|0,m.iz|0,m.d&3,m.m,false);
  else if(m.t==='sdmg')damageStruct(m.key,+m.dmg||0,false);
  else if(m.t==='tree'){const t=trees.find(t=>Math.round(t.x)===m.x&&Math.round(t.z)===m.z);if(t)fellTree(t,false)}
  else if(m.t==='pj'&&(m.k==='rocket'||m.k==='gren')&&Array.isArray(m.o)&&Array.isArray(m.v)){const e=ents.get(m.id);if(e&&!e.local&&!(e.bot&&isHost)){launch(e,m.k,{x:+m.o[0],y:+m.o[1],z:+m.o[2]},{x:+m.v[0],y:+m.v[1],z:+m.v[2]},false);if(m.k==='rocket'&&me&&Math.hypot(e.x-me.x,e.z-me.z)<120)sfx('rocket',.4)}}
  else if(m.t==='ex'){}
  else if(m.t==='sd'&&!isHost&&!chests.has(m.id)&&Array.isArray(m.items)){supplyDrop(+m.x,+m.z,String(m.id),m.items.map(validIt).filter(Boolean))}
 });
 room.on('leave',id=>{const e=ents.get(id);if(e&&e.alive){die(e,null,null);feed('👋 '+e.name+' hat verlassen')}if($('lobby').style.display!=='none')lobby()});
 room.on('close',()=>{feed('❌ Verbindung zum Gastgeber getrennt');room=null;isHost=true})}
$('bLobLeave').onclick=()=>{if(room)room.leave();room=null;show('menu')};
function endScreen(win){if(state!=='play')return;state='end';
 $('endT').textContent=win?'🏆 #1 SIEG!':'#'+myPlace;$('endS').textContent=win?'Du bist der letzte Überlebende!':'Platz '+myPlace+' von '+ents.size;
 const L=[...ents.values()].sort((a,b)=>b.kills-a.kills).slice(0,8);$('endTab').innerHTML=`<tr><td colspan="2"><b>Deine Runde:</b> 💀 ${kills} erledigt · 💥 ${dmgDealt} Schaden · ⏱ ${Math.floor(matchT/60)}:${String(Math.floor(matchT%60)).padStart(2,'0')}</td></tr><tr><td><b>Spieler</b></td><td><b>Erledigt</b></td></tr>`+L.map(e=>`<tr><td>${(OUTFITS[e.out]||OUTFITS[0]).e} ${e.bot?'🤖 ':''}${String(e.name).replace(/</g,'')}${e.local?' (du)':''}${e.alive?' 🟢':''}</td><td>${e.kills}</td></tr>`).join('');
 store.set('br_wins',store.get('br_wins',0)+(win?1:0));store.set('br_kills',store.get('br_kills',0)+kills);statsLine();
 show('end');$('bAgain').style.display=!room||isHost?'':'none';$('bSpec').style.display=win?'none':''}
function statsLine(){$('stats').textContent=`🏆 ${store.get('br_wins',0)} Siege · 💀 ${store.get('br_kills',0)} erledigt`}statsLine();
$('bSpec').onclick=()=>{state='play';show(null);$('hud').style.display='block';feed('👀 Zuschauen – ☰ für Menü')};
$('bAgain').onclick=()=>{if(room&&isHost)hostStart();else{lastPlayers=soloPlayers();startMatch(lastPlayers,{},Math.floor(Math.random()*1e9))}};
function toMenu(){if(room)room.leave();room=null;state='menu';clearEnts();me=null;bus.visible=false;ghost.visible=false;show('menu')}
$('bEndMenu').onclick=toMenu;
addEventListener('keydown',e=>{if(e.key==='Escape'&&state==='play'&&!document.pointerLockElement&&!TOUCH){if(mapOpen){toggleMap();return}if(confirmLeave())toMenu()}});
/* ===================== Klang ===================== */
let AC=null;function ac(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}return AC}
let nbuf=null;function noise(d,v,f,at=0){const a=AC;if(!a)return;if(!nbuf){nbuf=a.createBuffer(1,a.sampleRate,a.sampleRate);const c=nbuf.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=Math.random()*2-1}const s=a.createBufferSource(),g=a.createGain(),fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.value=f;s.buffer=nbuf;g.gain.setValueAtTime(v,a.currentTime+at);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+at+d);s.connect(fl);fl.connect(g);g.connect(a.destination);s.start(a.currentTime+at);s.stop(a.currentTime+at+d)}
function tone(f,d,v,type='square',at=0,f2){const a=AC;if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,a.currentTime+at);if(f2)o.frequency.exponentialRampToValueAtTime(f2,a.currentTime+at+d);g.gain.setValueAtTime(v,a.currentTime+at);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+at+d);o.connect(g);g.connect(a.destination);o.start(a.currentTime+at);o.stop(a.currentTime+at+d)}
function sfx(k,vol=1){if(!AC)return;switch(k){case'pistol':noise(.18,.45*vol,2600);tone(180,.08,.12*vol,'square',0,60);break;case'smg':noise(.09,.32*vol,3200);break;case'ar':noise(.14,.4*vol,2200);tone(120,.07,.1*vol,'square',0,50);break;case'burst':noise(.13,.4*vol,2000);tone(140,.06,.1*vol,'square',0,50);break;case'shot':noise(.45,.7*vol,1400);tone(80,.2,.2*vol,'sawtooth',0,40);break;case'tac':noise(.3,.55*vol,1700);tone(100,.15,.15*vol,'sawtooth',0,50);break;case'snipe':noise(.8,.65*vol,1100);tone(70,.5,.2*vol,'sawtooth',0,30);break;case'rocket':noise(.6,.5*vol,700);tone(200,.5,.08*vol,'sawtooth',0,60);break;
 case'boom':noise(1.1,.9*vol,500);tone(60,.8,.3*vol,'sawtooth',0,25);break;case'throw':noise(.15,.15,1200);break;case'drop':[392,523,659].forEach((f,i)=>tone(f,.3,.06,'triangle',i*.12));break;case'break':noise(.3,.3,1200);tone(180,.1,.08,'square',0,80);break;case'empty':tone(900,.04,.05,'square');tone(700,.04,.05,'square',.06);break;case'healst':tone(500,.15,.05,'sine',0,700);break;
 case'hit':tone(1500,.05,.08);break;case'hitsh':tone(2200,.05,.07,'triangle');break;case'head':tone(1900,.08,.1);tone(2800,.1,.08,'triangle',.04);break;case'hurt':tone(160,.15,.12,'sawtooth');break;case'shbreak':noise(.4,.35,5000);tone(1200,.3,.08,'triangle',0,300);break;case'chop':noise(.12,.35,900);tone(220,.06,.08,'square');break;case'clang':tone(900,.12,.06,'triangle');tone(1350,.1,.04,'triangle',.02);break;case'swing':noise(.12,.12,700);break;
 case'build':tone(260,.07,.1);noise(.08,.2,1500);tone(390,.07,.08,'square',.05);break;case'pick':tone(880,.07,.06,'triangle');tone(1320,.07,.05,'triangle',.05);break;case'switch':noise(.05,.15,4000);break;case'chest':[523,659,784,1046,1318].forEach((f,i)=>tone(f,.25,.07,'triangle',i*.07));break;case'reload':tone(500,.05,.05);noise(.05,.2,3000);tone(700,.05,.05,'square',.4);break;
 case'heal':tone(660,.3,.08,'sine');tone(990,.3,.06,'sine',.1);break;case'storm':tone(110,.25,.06,'sawtooth');break;case'land':noise(.25,.35,500);break;case'jump':noise(.08,.1,800);break;case'glide':noise(.5,.2,600);tone(300,.3,.05,'sine',0,600);break;case'jumpbus':noise(.6,.25,900);break;
 case'dead':tone(220,.6,.15,'sawtooth',0,60);break;case'elim':tone(880,.1,.1,'square');tone(1320,.18,.1,'square',.08);break;case'dance':[523,659,784].forEach((f,i)=>tone(f,.15,.06,'triangle',i*.15));break;case'win':[523,659,784,1046,1318,1568].forEach((f,i)=>tone(f,.4,.1,'triangle',i*.12));break}}
const qc=new URLSearchParams(location.search).get('code');if(qc)$('code').value=qc.toUpperCase();
/* ===================== Start ===================== */
applyGfx();
function boot(){$('loadTxt').textContent='Baue die Insel …';$('loadBar').style.width='60%';setTimeout(()=>{try{buildWorld(4242);makeStorm(4242);applyGfx()}catch(err){console.error(err)}$('loadBar').style.width='100%';$('load').style.display='none';state='menu';show('menu')},40)}
loadModels(boot);
requestAnimationFrame(loop);
window.BR={setCam:(p,l)=>{camOverride=p?{p:new THREE.Vector3(...p),l:new THREE.Vector3(...l)}:null},get POI(){return POI},groundAt:(x,z)=>groundAt(x,z,200),camera,get me(){return me},get ents(){return ents},get state(){return state},get storm(){return storm},look,fire:()=>fire(me),buildFor:k=>buildFor(me,k),setBuild,useAct,get loot(){return loot},get structs(){return structs},setFiring:v=>firing=v,keys,joy,drop:()=>me&&dropFromBus(me),get matchT(){return matchT},set matchT(v){matchT=v},SET,emote,heal:()=>heal(me),get chests(){return chests},get HOUSES(){return HOUSES},toggleMap,pickup:(it)=>{const id=spawnLoot(null,me.x,me.y,me.z,it);pickup(me,loot.get(id),true)}};

