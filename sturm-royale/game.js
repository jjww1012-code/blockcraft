'use strict';
/* Sturm Royale – Battle Royale für die Spielehalle */
const $=id=>document.getElementById(id),PI=Math.PI,TAU=PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
const store={get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const TOUCH=matchMedia('(pointer:coarse)').matches;
$('name').value=Profile.name;const myName=()=>{const n=$('name').value.trim().slice(0,14)||'Spieler';Profile.name=n;return n};
const SET={bots:19,diff:1,storm:1,gfx:store.get('br_gfx',TOUCH?0:1)};
document.querySelectorAll('#sGfx button').forEach(b=>b.classList.toggle('on',+b.dataset.v===SET.gfx));
for(const [id,k] of [['sBots','bots'],['sDiff','diff'],['sStorm','storm'],['sGfx','gfx']])$(id).onclick=e=>{const b=e.target.closest('button');if(!b)return;$(id).querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));SET[k]=+b.dataset.v;if(k==='gfx'){store.set('br_gfx',SET.gfx);applyGfx()}};
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const BOTN=['Blitz','Rocket','Ninja','Pixel','Toaster','Kaktus','Banane','Schatten','Turbo','Wolke','Knödel','Raptor','Glitch','Komet','Zebra','Nugget','Sushi','Wirbel','Laser','Bambus','Hai','Muffin','Panda','Frost','Donner','Echo','Mango','Viper','Krake','Funke'];
const COLS=[0xff4757,0x2e86de,0xffd23f,0x2ed573,0xff7ad9,0xff9f1a,0x7d5fff,0x18dcff,0xf5f5f5,0x3d3d3d,0x00b894,0xe17055];
let myCol=store.get('br_col',0)%COLS.length;
$('skinRow').innerHTML=COLS.map((c,i)=>`<button data-i="${i}" style="background:#${c.toString(16).padStart(6,'0')}"></button>`).join('');
const markSkin=()=>$('skinRow').querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.i===myCol));markSkin();
$('skinRow').onclick=e=>{const b=e.target.closest('button');if(b){myCol=+b.dataset.i;store.set('br_col',myCol);markSkin()}};
const RAR=[{n:'Gewöhnlich',c:'#b8bcc8',m:1},{n:'Selten',c:'#4cd964',m:1.1},{n:'Episch',c:'#3a9bff',m:1.2},{n:'Legendär',c:'#b15cff',m:1.35},{n:'Mythisch',c:'#ffb300',m:1.5}];
const WPN={
 pick:{n:'Spitzhacke',dmg:20,rate:.5,mag:0,melee:1},
 pistol:{n:'Pistole',dmg:23,rate:.28,mag:12,rel:1.1,spr:.018,rng:140,kick:.012},
 smg:{n:'MP',dmg:14,rate:.075,mag:30,rel:1.8,spr:.05,rng:90,auto:1,kick:.008},
 ar:{n:'Sturmgewehr',dmg:19,rate:.12,mag:30,rel:2,spr:.028,rng:220,auto:1,kick:.012},
 shot:{n:'Schrotflinte',dmg:11,pel:9,rate:.85,mag:5,rel:2.4,spr:.085,rng:45,kick:.06},
 snipe:{n:'Scharfschützengewehr',dmg:96,rate:1.3,mag:1,rel:2.1,spr:.001,rng:600,zoom:1,kick:.08}};
const GUNS=['pistol','smg','ar','shot','snipe'];
/* ===================== Renderer ===================== */
const renderer=new THREE.WebGLRenderer({canvas:$('cv'),antialias:!TOUCH,powerPreference:'high-performance'});

renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(70,1,.1,2400);
scene.fog=new THREE.Fog(0xcde8ff,220,900);
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',resize);
const hemi=new THREE.HemisphereLight(0xd8eeff,0x6a8a4a,.8);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d0,1.3);sun.position.set(120,220,80);scene.add(sun);scene.add(sun.target);
sun.shadow.camera.left=-70;sun.shadow.camera.right=70;sun.shadow.camera.top=70;sun.shadow.camera.bottom=-70;sun.shadow.camera.near=10;sun.shadow.camera.far=520;sun.shadow.bias=-.0006;sun.shadow.normalBias=.03;
let grass=null;
function applyGfx(){const g=SET.gfx;renderer.setPixelRatio(Math.min(devicePixelRatio,g===0?1:g===1?1.5:2));renderer.shadowMap.enabled=g>0;sun.castShadow=g>0;sun.shadow.mapSize.set(g===2?2048:1024,g===2?2048:1024);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}scene.fog.far=g===0?650:950;resize();
 scene.traverse(o=>{if(o.material){const m=Array.isArray(o.material)?o.material:[o.material];m.forEach(q=>q.needsUpdate=true)}});if(grass)grass.forEach(m=>m.visible=g>0)}
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:new THREE.Color(0x1f6fe8)},mid:{value:new THREE.Color(0x9fd4ff)},bot:{value:new THREE.Color(0xe8f6ff)},sunDir:{value:new THREE.Vector3(.45,.75,.3).normalize()}},
 vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform vec3 top,mid,bot,sunDir;varying vec3 vP;void main(){float h=vP.y;vec3 c=h>0.?mix(mid,top,pow(h,.6)):mix(mid,bot,min(1.,-h*4.));float s=max(dot(vP,sunDir),0.);c+=vec3(1.,.9,.6)*pow(s,400.)*3.+vec3(1.,.8,.5)*pow(s,8.)*.25;gl_FragColor=vec4(c,1.);}'});
const sky=new THREE.Mesh(new THREE.SphereGeometry(2000,32,16),skyMat);scene.add(sky);
/* ===================== Texturen ===================== */
function ctex(w,h,f,rep){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;if(rep)t.repeat.set(rep,rep);return t}
const noiseFill=(x,w,h,base,vars,n,sz)=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<n;i++){x.fillStyle=vars[i%vars.length];x.globalAlpha=.35+Math.random()*.4;const s=sz*(0.5+Math.random());x.fillRect(Math.random()*w,Math.random()*h,s,s)}x.globalAlpha=1};
const grassTex=ctex(256,256,(x,w,h)=>noiseFill(x,w,h,'#ffffff',['#e0edd4','#f6fff2','#d2e2c2','#eef8e4'],5000,4));
const woodTex=ctex(128,128,(x,w,h)=>{x.fillStyle='#b9824a';x.fillRect(0,0,w,h);for(let i=0;i<8;i++){x.fillStyle=i%2?'#a8743f':'#c48d55';x.fillRect(0,i*16,w,15);x.fillStyle='rgba(90,50,20,.35)';for(let k=0;k<6;k++)x.fillRect(Math.random()*w,i*16+Math.random()*14,20+Math.random()*30,1)}x.strokeStyle='#6e431d';x.lineWidth=6;x.strokeRect(3,3,w-6,h-6);x.beginPath();x.moveTo(3,3);x.lineTo(w-3,h-3);x.stroke()});
const plasterTex=ctex(128,128,(x,w,h)=>noiseFill(x,w,h,'#ffffff',['#eeeeee','#f7f7f7','#e2e2e2'],1400,3));
const brickTex=ctex(128,128,(x,w,h)=>{x.fillStyle='#bfb2a0';x.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=0;c<4;c++){const v=200+Math.random()*30|0;x.fillStyle=`rgb(${v},${v-60},${v-80})`;x.fillRect(c*32+(r%2)*16+1,r*16+1,30,14)}});
const roofTex=ctex(128,128,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=0;c<8;c++){x.fillStyle=`rgba(0,0,0,${.1+Math.random()*.12})`;x.fillRect(c*16+(r%2)*8,r*16+12,16,4);x.fillStyle=`rgba(0,0,0,${Math.random()*.08})`;x.fillRect(c*16+(r%2)*8,r*16,15,12)}});
const stoneTex=ctex(128,128,(x,w,h)=>{x.fillStyle='#8a8a86';x.fillRect(0,0,w,h);for(let r=0;r<6;r++)for(let c=0;c<4;c++){const v=150+Math.random()*50|0;x.fillStyle=`rgb(${v},${v},${v-6})`;x.fillRect(c*32+(r%2)*16+2,r*21+2,28,18)}});
const roadTex=ctex(64,256,(x,w,h)=>{noiseFill(x,w,h,'#4a4c52',['#55575d','#3f4146'],900,3);x.fillStyle='#f2f2f2';for(let y=0;y<h;y+=64)x.fillRect(w/2-2,y,4,34);x.fillStyle='#d8d8d8';x.fillRect(2,0,3,h);x.fillRect(w-5,0,3,h)});
const barkTex=ctex(64,128,(x,w,h)=>{x.fillStyle='#6e4a2c';x.fillRect(0,0,w,h);for(let i=0;i<40;i++){x.fillStyle=i%2?'#5a3a20':'#7d5634';x.fillRect(Math.random()*w,0,2+Math.random()*3,h)}});
const waterTex=ctex(256,256,(x,w,h)=>{x.fillStyle='#ffffff';x.fillRect(0,0,w,h);for(let i=0;i<220;i++){x.strokeStyle=`rgba(150,200,255,${.2+Math.random()*.3})`;x.lineWidth=1+Math.random()*2;const X=Math.random()*w,Y=Math.random()*h,L=8+Math.random()*24;x.beginPath();x.moveTo(X,Y);x.quadraticCurveTo(X+L/2,Y-3,X+L,Y);x.stroke()}},60);
const stripeTex=ctex(256,64,(x,w,h)=>{const c=['#ff4757','#ffd23f','#2e86de','#2ed573','#ff7ad9','#ff9f1a'];for(let i=0;i<12;i++){x.fillStyle=c[i%6];x.fillRect(i*w/12,0,w/12+1,h)}});
const M={};const mat=(k,o,lam)=>M[k]||(M[k]=new(lam?THREE.MeshLambertMaterial:THREE.MeshStandardMaterial)(Object.assign(lam?{}:{roughness:.85,metalness:0},o)));
/* ===================== Welt ===================== */
const ISL=360;let H=null,POI=[],world=null,boxes=[],trees=[],loot=new Map(),chests=new Map(),structs=new Map(),anims=[],water=null;
let bucket=new Map();
function addGeo(geo,m,px,py,pz,ry,rx,rz,sx,sy,sz){const o=new THREE.Object3D();o.position.set(px,py,pz);o.rotation.set(rx||0,ry||0,rz||0);if(sx)o.scale.set(sx,sy,sz);o.updateMatrix();let g=geo.clone();if(!g.index){const n=g.attributes.position.count;g.setIndex([...Array(n).keys()])}g.applyMatrix4(o.matrix);for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));let L=bucket.get(m);if(!L)bucket.set(m,L=[]);L.push(g)}
function flushBuckets(){for(const [m,L] of bucket){for(let i=0;i<L.length;i+=500){const part=L.slice(i,i+500);const g=THREE.BufferGeometryUtils.mergeBufferGeometries(part);part.forEach(q=>q.dispose());if(!g)continue;const mesh=new THREE.Mesh(g,m);mesh.castShadow=mesh.receiveShadow=true;world.add(mesh)}}bucket=new Map()}
const BOXG=new THREE.BoxGeometry(1,1,1);
function solid(cx,cy,cz,sx,sy,sz,m){addGeo(BOXG,m,cx,cy,cz,0,0,0,sx,sy,sz);boxes.push({min:new THREE.Vector3(cx-sx/2,cy-sy/2,cz-sz/2),max:new THREE.Vector3(cx+sx/2,cy+sy/2,cz+sz/2)})}
function deco(cx,cy,cz,sx,sy,sz,m,ry){addGeo(BOXG,m,cx,cy,cz,ry||0,0,0,sx,sy,sz)}
function makeWorldFn(seed){const r=rng(seed),rot=r()*TAU,s=r()*50;const R=(x,z)=>[x*Math.cos(rot)-z*Math.sin(rot),x*Math.sin(rot)+z*Math.cos(rot)];
 const P=(name,x,z,rad,h,kind)=>{const [X,Z]=R(x,z);return{name,x:X,z:Z,r:rad,h,kind}};
 POI=[P('Ziegelstadt',0,30,78,6,'town'),P('Heuhof',170,-120,60,5,'farm'),P('Burgberg',-170,-120,44,30,'castle'),P('Blauer See',-130,150,62,-5,'lake'),P('Leuchtturm',280,140,26,7,'light'),P('Tankstelle',115,135,30,6,'gas'),P('Dunkelwald',40,-235,70,null,'forest'),P('Klippen',-300,20,40,null,'cliff')];
 const base=(x,z)=>Math.sin(x*.011+s)*Math.cos(z*.009-s)*10+Math.sin(x*.027+z*.023+s*2)*3.5+Math.cos(x*.005-z*.007)*7+Math.sin(x*.07+s)*Math.cos(z*.06)*.8;
 H=(x,z)=>{const d=Math.hypot(x,z)/ISL;let fall=d<.78?1:Math.max(0,1-(d-.78)/.26);let y=(base(x,z)+13)*fall-5*(1-fall)-1;
  for(const p of POI){const dd=Math.hypot(x-p.x,z-p.z);if(p.kind==='castle'){const t=1-smooth((dd-p.r*.8)/(p.r*1.6));y=lerp(y,p.h-((dd>p.r*.8)?(dd-p.r*.8)*.35:0),t);continue}if(p.kind==='cliff'){y+=Math.max(0,1-dd/p.r)*22*fall;continue}if(p.h==null)continue;const t=1-smooth((dd-p.r*.75)/(p.r*.6));if(p.kind==='lake')y=lerp(y,p.h-(1-Math.min(1,dd/p.r))*4,t*.95);else y=lerp(y,p.h,t)}
  return y}}
function buildWorld(seed){
 if(world){scene.remove(world);world.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
 world=new THREE.Group();scene.add(world);boxes=[];trees=[];for(const l of loot.values())scene.remove(l.g);loot.clear();chests.clear();for(const s of structs.values())scene.remove(s.mesh);structs.clear();anims=[];lootN=0;
 makeWorldFn(seed);const r=rng(seed+1);
 const N=SET.gfx===0?150:210,g=new THREE.PlaneGeometry(ISL*2.8,ISL*2.8,N,N);g.rotateX(-PI/2);const p=g.attributes.position,cols=[];
 const farm=POI.find(q=>q.kind==='farm');
 for(let i=0;i<p.count;i++){const X=p.getX(i),Z=p.getZ(i),y=H(X,Z);p.setY(i,y);const n=Math.sin(X*.05)*Math.cos(Z*.04)*.05+Math.sin(X*.21+Z*.17)*.03;let c;
  if(y<.8)c=[.93,.85,.62];else if(y>26)c=[.6+n,.6+n,.57+n];else if(y>19)c=[.45+n,.55+n,.32];else c=[.36+n,.63+n*1.5,.25+n];
  if(Math.hypot(X-farm.x,Z-farm.z)<farm.r*.9&&y>.8)c=[.58+n,.47+n,.27];cols.push(...c)}
 g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.computeVertexNormals();
 const gt=grassTex.clone();gt.needsUpdate=true;gt.repeat.set(90,90);
 const ter=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,map:gt}));ter.receiveShadow=true;world.add(ter);
 water=new THREE.Mesh(new THREE.PlaneGeometry(6000,6000),new THREE.MeshStandardMaterial({color:0x2f9ee0,map:waterTex,roughness:.12,metalness:.25,transparent:true,opacity:.88}));water.rotation.x=-PI/2;water.position.y=-.4;world.add(water);
 const sand=new THREE.Mesh(new THREE.RingGeometry(ISL*.98,ISL*1.12,64),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.25}));sand.rotation.x=-PI/2;sand.position.y=-.3;world.add(sand);anims.push((dt,t)=>{sand.material.opacity=.15+.1*Math.sin(t*1.3)});
 for(let i=0;i<8;i++){const a=i/8*TAU+r(),d=1300+r()*250,m=new THREE.Mesh(new THREE.ConeGeometry(140+r()*140,70+r()*90,7),mat('far',{color:0x86a596},1));m.position.set(Math.cos(a)*d,-5,Math.sin(a)*d);world.add(m)}
 const T=POI.find(q=>q.kind==='town');
 const road=(q)=>{const L=Math.hypot(q.x-T.x,q.z-T.z),n=Math.ceil(L/5),pos=[],uv=[],idx=[];const dx=q.z-T.z,dz=-(q.x-T.x),dl=Math.hypot(dx,dz);for(let i=0;i<=n;i++){const t=i/n,w=Math.sin(t*PI)*10*Math.sin(q.x),X=lerp(T.x,q.x,t)+dx/dl*w,Z=lerp(T.z,q.z,t)+dz/dl*w;for(const s of[-1,1]){const px=X+dx/dl*3.6*s,pz=Z+dz/dl*3.6*s;pos.push(px,Math.max(H(px,pz),-.2)+.14,pz)}uv.push(0,t*L/8,1,t*L/8);if(i<n){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3)}}
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);gg.computeVertexNormals();const m=new THREE.Mesh(gg,mat('road',{map:roadTex,roughness:.9}));m.receiveShadow=true;world.add(m)};
 POI.filter(q=>['farm','castle','gas','light'].includes(q.kind)).forEach(road);
 for(const q of POI)buildPOI(q,r);
 for(let i=0;i<55;i++){const a=r()*TAU,d=Math.sqrt(r())*ISL*.75,x=Math.cos(a)*d,z=Math.sin(a)*d,y=H(x,z);if(y<.5)continue;spawnLoot(r,x,y+.2,z)}
 for(let i=0;i<14;i++){const a=r()*TAU,d=Math.sqrt(r())*ISL*.75,x=Math.cos(a)*d,z=Math.sin(a)*d,y=H(x,z);if(y<.5)continue;addChest(r,x,y,z,r()*TAU)}
 vegetation(r);flushBuckets()}
const WALLC=[0xf4e1c1,0xd9e8f5,0xf5d0c5,0xe0f0d0,0xfff2b3,0xe8d5f0];
function gable(cx,cy,cz,w,d,hh,m,alongZ){const ang=Math.atan2(hh,w/2),L=Math.hypot(w/2,hh)+.4;
 if(!alongZ){for(const s of[-1,1])addGeo(BOXG,m,cx+s*w/4,cy+hh/2,cz,0,0,-s*ang,L,.3,d+.8)}else{for(const s of[-1,1])addGeo(BOXG,m,cx,cy+hh/2,cz+s*w/4,0,s*ang,0,d+.8,.3,L)}
 boxes.push({min:new THREE.Vector3(cx-(alongZ?d:w)/2,cy,cz-(alongZ?w:d)/2),max:new THREE.Vector3(cx+(alongZ?d:w)/2,cy+hh*.45,cz+(alongZ?w:d)/2)})}
function house(x,z,r,face){
 const by=Math.max(H(x,z),H(x-7,z-6),H(x+7,z-6),H(x-7,z+6),H(x+7,z+6))+.15,w=14,d=11,hh=4.2,two=r()<.45,lv=two?2:1;
 const wc=WALLC[r()*WALLC.length|0],wm=mat('wall'+wc,{color:wc,map:plasterTex}),fm=mat('floor',{color:0x9a7450,map:woodTex}),trim=mat('trim',{color:0xffffff}),glass=mat('glass',{color:0x7fb8e6,roughness:.1,metalness:.6,emissive:0x0a2030});
 const roofC=[0xc0392b,0x6d4c41,0x34495e,0x2e7d32][r()*4|0],rm=mat('roof'+roofC,{color:roofC,map:roofTex});
 solid(x,by-2.2,z,w+1,4.4,d+1,mat('found',{color:0x9f9a90,map:stoneTex}));
 const dz=face>0?1:-1;
 for(let L=0;L<lv;L++){const y0=by+L*hh;
  solid(x,y0+hh/2,z-dz*d/2,w,hh,.4,wm);solid(x-w/2,y0+hh/2,z,.4,hh,d,wm);solid(x+w/2,y0+hh/2,z,.4,hh,d,wm);
  solid(x-w/2+3,y0+hh/2,z+dz*d/2,6,hh,.4,wm);solid(x+w/2-3,y0+hh/2,z+dz*d/2,6,hh,.4,wm);solid(x,y0+hh-.6,z+dz*d/2,2,1.2,.4,wm);
  for(const s of[-1,1]){deco(x+s*(w/2+.03),y0+2.3,z,.08,1.3,2.2,glass);deco(x+s*(w/2+.05),y0+2.3,z,.1,1.5,.12,trim);deco(x+s*(w/2+.05),y0+2.3,z,.1,.12,2.4,trim);deco(x+s*3.5,y0+2.4,z-dz*(d/2+.03),1.8,1.2,.08,glass);deco(x+s*3.5,y0+1.72,z-dz*(d/2+.07),2.1,.12,.15,trim);deco(x+s*3.5,y0+2.4,z+dz*(d/2+.03),1.8,1.2,.08,glass)}
  if(L>0)solid(x+2,y0,z,w-4,.3,d,fm)}
 solid(x,by+.05,z,w-.2,.1,d-.2,fm);deco(x,by+1.1,z+dz*(d/2+.25),2.4,.1,.6,trim);
 if(two)for(let s=0;s<8;s++)solid(x-w/2+1.3,by+.25+s*.52,z+dz*(d/2-1.6-s*.85),2.2,.5,.9,fm);
 solid(x,by+lv*hh+.15,z,w+.6,.3,d+.6,trim);gable(x,by+lv*hh+.3,z,w+.6,d+.6,3.2,rm,false);
 deco(x+w/2-3,by+lv*hh+2,z-2,1,3,1,mat('chim',{color:0x8a5a44,map:brickTex}));
 // Möbel
 deco(x-3,by+.5,z-dz*2,2.4,1,1.2,mat('sofa',{color:[0x3d5a80,0x9b2226,0x386641][r()*3|0]}));deco(x+3.5,by+.45,z-dz*2.5,1.6,.9,1,mat('table',{color:0x7a4a26}));
 for(let L=0;L<lv;L++){spawnLoot(r,x+(r()-.5)*8,by+L*hh+.3,z+(r()-.5)*6);if(r()<.6)spawnLoot(r,x+(r()-.5)*8,by+L*hh+.3,z+(r()-.5)*6)}
 addChest(r,x+(r()<.5?-1:1)*(w/2-1.4),by+(two&&r()<.5?hh+.15:0)+.05,z-dz*(d/2-1.3),0)}
function streetLamp(x,z){const y=H(x,z);addGeo(new THREE.CylinderGeometry(.12,.16,6,6),mat('metal',{color:0x3b3f46,metalness:.6,roughness:.4}),x,y+3,z);deco(x+.7,y+6,z,1.6,.15,.15,mat('metal'));deco(x+1.4,y+5.85,z,.5,.18,.5,mat('lamp',{color:0xfff3c4,emissive:0xffe9a0,emissiveIntensity:.6}))}
function car(x,z,ry,c){const y=H(x,z),cm=mat('car'+c,{color:c,metalness:.5,roughness:.35}),tire=mat('tire',{color:0x16171a});const cs=Math.cos(ry),sn=Math.sin(ry),P=(lx,lz)=>[x+lx*cs+lz*sn,z-lx*sn+lz*cs];
 addGeo(BOXG,cm,x,y+.85,z,ry,0,0,2,.8,4.4);const [gx,gz]=P(0,.3);addGeo(BOXG,cm,gx,y+1.55,gz,ry,0,0,1.8,.65,2.3);addGeo(BOXG,mat('glass'),gx,y+1.55,gz,ry,0,0,1.86,.5,2.1);
 for(const [lx,lz] of[[-1,1.4],[1,1.4],[-1,-1.4],[1,-1.4]]){const [a,b]=P(lx,lz);addGeo(new THREE.CylinderGeometry(.42,.42,.3,12).rotateZ(PI/2),tire,a,y+.42,b,ry)}
 for(const s of[-.6,.6]){const [a,b]=P(s,-2.21);addGeo(BOXG,mat('lamp'),a,y+.95,b,ry,0,0,.4,.15,.05)}
 boxes.push({min:new THREE.Vector3(x-2.1,y,z-2.1),max:new THREE.Vector3(x+2.1,y+1.9,z+2.1)})}
function buildPOI(q,r){const {x,z}=q;
 if(q.kind==='town'){
  for(const ry of[0,PI/2]){const g=new THREE.PlaneGeometry(8,150,1,40);g.rotateX(-PI/2);g.rotateY(ry);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,H(x+p.getX(i),z+p.getZ(i))+.16);g.computeVertexNormals();const m=new THREE.Mesh(g,mat('road',{map:roadTex,roughness:.9}));m.position.set(x,0,z);m.receiveShadow=true;world.add(m)}
  for(const [qx,qz] of[[-1,-1],[1,-1],[-1,1],[1,1]])for(const [ox,oz] of[[0,0],[1,0],[0,1]]){if(r()<.12)continue;house(x+qx*(16+ox*22),z+qz*(16+oz*22),r,-qz)}
  for(let i=-3;i<=3;i++){if(!i)continue;streetLamp(x+i*18,z+5.5);streetLamp(x-5.5,z+i*18)}
  for(let i=0;i<5;i++){const a=r()<.5;car(a?x+(r()-.5)*120:x+2.6,a?z+2.6:z+(r()-.5)*120,a?PI/2:0,[0xd63031,0x0984e3,0xfdcb6e,0xffffff,0x2d3436][i])}
  const y=H(x,z);addGeo(new THREE.CylinderGeometry(3.2,3.4,.8,20),mat('stone',{color:0xc0bcb4,map:stoneTex}),x,y+.4,z);addGeo(new THREE.CylinderGeometry(2.8,2.8,.1,20),mat('pool',{color:0x4fb3ff,emissive:0x0a3050,roughness:.1}),x,y+.75,z);addGeo(new THREE.CylinderGeometry(.4,.5,2.4,8),mat('stone'),x,y+1.6,z);addGeo(new THREE.SphereGeometry(.7,10,8),mat('pool'),x,y+3,z);boxes.push({min:new THREE.Vector3(x-3.2,y,z-3.2),max:new THREE.Vector3(x+3.2,y+.8,z+3.2)})}
 else if(q.kind==='farm'){const y=H(x,z)+.1,red=mat('barn',{color:0xb03a2e,map:woodTex}),wt=mat('trim',{color:0xffffff}),hay=mat('hay',{color:0xe8c04a});
  const bx=x-10,bz=z-6,w=18,d=14,hh=8;solid(bx,y+hh/2,bz-d/2,w,hh,.5,red);solid(bx-w/2,y+hh/2,bz,.5,hh,d,red);solid(bx+w/2,y+hh/2,bz,.5,hh,d,red);solid(bx-w/2+3.5,y+hh/2,bz+d/2,7,hh,.5,red);solid(bx+w/2-3.5,y+hh/2,bz+d/2,7,hh,.5,red);solid(bx,y+hh-1.2,bz+d/2,4,2.4,.5,red);
  deco(bx,y+5.8,bz+d/2+.3,4.2,.25,.3,wt);for(const s of[-1,1])deco(bx+s*2.1,y+2.9,bz+d/2+.3,.25,5.8,.3,wt);deco(bx,y+2.9,bz+d/2+.3,.2,5.8,.3,wt,PI/4);
  solid(bx+3,y+4,bz,w-6,.3,d,mat('floor',{color:0x9a7450,map:woodTex}));for(let s=0;s<8;s++)solid(bx-w/2+1.3,y+.25+s*.5,bz-d/2+1.6+s*.85,2.2,.5,.9,mat('floor'));
  gable(bx,y+hh,bz,w+.5,d+.6,5,mat('roofg',{color:0x5d4037,map:roofTex}),false);
  spawnLoot(r,bx+3,y+4.3,bz);spawnLoot(r,bx-3,y+.3,bz+2);addChest(r,bx+5,y+4.35,bz-3,0);
  addGeo(new THREE.CylinderGeometry(3,3,14,16),mat('silo',{color:0xc8c8c8,metalness:.5,roughness:.4}),x+10,y+7,z-12);addGeo(new THREE.SphereGeometry(3,16,8,0,TAU,0,PI/2),mat('silo'),x+10,y+14,z-12);boxes.push({min:new THREE.Vector3(x+7,y,z-15),max:new THREE.Vector3(x+13,y+14,z-9)});
  for(let i=0;i<10;i++){const hx=x+(r()-.5)*70,hz=z+14+r()*28,hy=H(hx,hz);addGeo(new THREE.CylinderGeometry(1.1,1.1,1.6,14).rotateZ(PI/2),hay,hx,hy+1.1,hz,r()*PI);boxes.push({min:new THREE.Vector3(hx-1,hy,hz-1),max:new THREE.Vector3(hx+1,hy+2.2,hz+1)})}
  for(let rr=0;rr<12;rr++)for(let k=0;k<18;k++){const cx=x-32+k*3.6,cz=z+46+rr*2.2,cy=H(cx,cz);if(cy<1)continue;addGeo(new THREE.ConeGeometry(.45,1.4,5),mat('crop',{color:0x8fcf4f},1),cx,cy+.6,cz)}
  for(let k=0;k<40;k++){const a=k/40*TAU,fx=x+Math.cos(a)*50,fz=z+Math.sin(a)*42,fy=H(fx,fz);if(fy<.5)continue;deco(fx,fy+.6,fz,.15,1.2,.15,mat('fence',{color:0xd7ccc8}));const a2=(k+.5)/40*TAU;deco(x+Math.cos(a2)*50,fy+.9,z+Math.sin(a2)*42,.08,.12,7.6,mat('fence'),-a2)}
  const wy=H(x+28,z-20);addGeo(new THREE.CylinderGeometry(.3,.7,16,8),mat('metal',{color:0x3b3f46,metalness:.6,roughness:.4}),x+28,wy+8,z-20);const rot=new THREE.Group();rot.position.set(x+28,wy+16,z-19.3);for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.7,7,.1),mat('trim'));b.position.y=3.5;b.castShadow=true;const p=new THREE.Group();p.rotation.z=i*PI/2;p.add(b);rot.add(p)}world.add(rot);anims.push(dt=>rot.rotation.z+=dt*1.2)}
 else if(q.kind==='castle'){const y=q.h,sm=mat('stone',{color:0xc0bcb4,map:stoneTex}),R=24;
  for(let i=0;i<4;i++){const a=i*PI/2+PI/4,tx=x+Math.cos(a)*R,tz=z+Math.sin(a)*R;addGeo(new THREE.CylinderGeometry(4,4.6,18,14),sm,tx,y+7,tz);addGeo(new THREE.ConeGeometry(5.2,6,14),mat('roofc',{color:0x34495e,map:roofTex}),tx,y+19,tz);boxes.push({min:new THREE.Vector3(tx-3.4,y-4,tz-3.4),max:new THREE.Vector3(tx+3.4,y+16,tz+3.4)})}
  const W=R*Math.SQRT2;for(const [dx,dz,sx,sz] of[[0,-1,W,1.6],[0,1,W,1.6],[-1,0,1.6,W],[1,0,1.6,W]]){const cx=x+dx*R*.707,cz=z+dz*R*.707;if(dz===1){solid(cx-W/4-2,y+4,cz,W/2-4,8,1.6,sm);solid(cx+W/4+2,y+4,cz,W/2-4,8,1.6,sm);solid(cx,y+7,cz,8,2,1.6,sm)}else solid(cx,y+4,cz,sx,8,sz,sm);
   for(let k=-4;k<=4;k++){const ox=sx>sz?k*W/9:0,oz=sz>sx?k*W/9:0;deco(cx+ox,y+8.6,cz+oz,sx>sz?1.4:1.8,1.2,sz>sx?1.4:1.8,sm)}}
  for(let s=0;s<10;s++)solid(x-W/2+3,y+.4+s*.8,z-W/2+4+s*1.6,3,.6,1.6,mat('floor'));solid(x,y+7.8,z-W/2+2.6,W-4,.4,3,mat('floor'));
  solid(x,y+6,z,10,12,10,sm);gable(x,y+12,z,10.4,10.4,4,mat('roofc'),false);
  for(let i=0;i<3;i++)spawnLoot(r,x+(r()-.5)*24,y+.3,z+(r()-.5)*24);addChest(r,x+7,y,z+7,0);addChest(r,x,y+8.05,z-W/2+2.6,0);
  for(let i=0;i<4;i++){const a=i*PI/2+PI/4,tx=x+Math.cos(a)*R,tz=z+Math.sin(a)*R;addGeo(new THREE.CylinderGeometry(.08,.08,5,5),mat('metal'),tx,y+24,tz);const f=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.5,6,1),new THREE.MeshLambertMaterial({color:COLS[i],side:THREE.DoubleSide}));f.position.set(tx+1.3,y+25.6,tz);world.add(f);const fp=f.geometry.attributes.position,base=fp.array.slice();anims.push((dt,t)=>{for(let k=0;k<fp.count;k++){const X=base[k*3];fp.setZ(k,Math.sin(t*5+X*2+i)*.25*(X+1.3)/2.6)}fp.needsUpdate=true})}}
 else if(q.kind==='light'){const y=H(x,z),wm=mat('lw',{color:0xffffff}),rd=mat('lr',{color:0xd63031});
  for(let i=0;i<6;i++)addGeo(new THREE.CylinderGeometry(3.2-i*.3,3.4-i*.3,4,16),i%2?rd:wm,x,y+2+i*4,z);addGeo(new THREE.CylinderGeometry(2.2,2.2,2.6,12),mat('glass',{color:0x7fb8e6,roughness:.1,metalness:.6,emissive:0x0a2030}),x,y+25.3,z);addGeo(new THREE.ConeGeometry(2.6,2.5,12),rd,x,y+27.8,z);
  boxes.push({min:new THREE.Vector3(x-3,y,z-3),max:new THREE.Vector3(x+3,y+24,z+3)});
  const beam=new THREE.Mesh(new THREE.ConeGeometry(4,60,16,1,true).rotateZ(PI/2).translate(30,0,0),new THREE.MeshBasicMaterial({color:0xfff6c0,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide}));beam.position.set(x,y+25.3,z);world.add(beam);anims.push(dt=>beam.rotation.y+=dt*.8);
  for(let s=0;s<40;s++){const a=s*.32,sx=x+Math.cos(a)*4.4,sz=z+Math.sin(a)*4.4;solid(sx,y+.3+s*.6,sz,1.6,.3,1.6,mat('floor'))}
  addChest(r,x+6,y+.05,z+6,0);spawnLoot(r,x-7,y+.3,z)}
 else if(q.kind==='gas'){const y=H(x,z)+.15;solid(x-6,y+2,z-6,10,4,7,mat('shop',{color:0xffffff,map:plasterTex}));deco(x-6,y+4.3,z-2.4,10.2,.8,.2,mat('sign',{color:0xff3b30,emissive:0x550000}));deco(x-6,y+1.6,z-2.45,6,2,.1,mat('glass'));
  for(const s of[-1,1])addGeo(new THREE.CylinderGeometry(.25,.25,5,8),mat('metal'),x+6+s*5,y+2.5,z+4);deco(x+6,y+5.2,z+4,14,.5,9,mat('canopy',{color:0xf5f5f5}));deco(x+6,y+4.85,z+4,14.2,.25,9.2,mat('sign'));
  for(const s of[-1,1])solid(x+6+s*2.5,y+.8,z+4,.8,1.6,.6,mat('pump',{color:0x2e86de}));
  car(x+10,z+10,.3,0xfdcb6e);spawnLoot(r,x-6,y+.3,z-6);addChest(r,x-9,y+.05,z-8,0)}
 else if(q.kind==='lake'){for(let k=0;k<10;k++)solid(x+q.r*.6+k*2,.15,z,2,.3,3.2,mat('floor'));for(let k=0;k<6;k++)deco(x+q.r*.6+k*4,-.8,z+1.5,.3,2,.3,mat('floor'));addChest(r,x+q.r*.6+18,.3,z,0);
  for(let i=0;i<14;i++){const a=r()*TAU,d=q.r*(.95+r()*.2),lx=x+Math.cos(a)*d,lz=z+Math.sin(a)*d;addGeo(new THREE.CylinderGeometry(.05,.05,1.6,4),mat('reed',{color:0x6b8e23},1),lx,H(lx,lz)+.8,lz)}}
}
const DM=new THREE.Object3D();
function inst(geo,m,list,f,shadow){const im=new THREE.InstancedMesh(geo,m,Math.max(1,list.length));im.count=list.length;list.forEach((s,i)=>{f(DM,s,i);DM.updateMatrix();im.setMatrixAt(i,DM.matrix)});im.castShadow=!!shadow;im.receiveShadow=true;world.add(im);return im}
function freeSpot(x,z,rad){for(const b of boxes){if(x>b.min.x-rad&&x<b.max.x+rad&&z>b.min.z-rad&&z<b.max.z+rad)return false}for(const q of POI){const d=Math.hypot(x-q.x,z-q.z);if((q.kind==='town'||q.kind==='farm'||q.kind==='gas')&&d<q.r*.8)return false;if(q.kind==='castle'&&d<36)return false}return true}
function vegetation(r){const pines=[],oaks=[],birch=[],bush=[],rocks=[];const fr=POI.find(q=>q.kind==='forest');
 for(let k=0;k<5000&&pines.length+oaks.length+birch.length<(SET.gfx===0?330:520);k++){let x=(r()-.5)*ISL*1.6,z=(r()-.5)*ISL*1.6;if(k%3===0){const a=r()*TAU,d=r()*fr.r;x=fr.x+Math.cos(a)*d;z=fr.z+Math.sin(a)*d}
  const y=H(x,z);if(y<1.2||y>27||!freeSpot(x,z,3))continue;const t={x,z,y,s:.8+r()*.6,hp:150,ry:r()*TAU};const q=r();(y>16||k%3===0?pines:q<.6?oaks:birch).push(t)}
 const parts=[],place=(d,t)=>{d.position.set(t.x,t.y-.2,t.z);d.rotation.set(0,t.ry,0);d.scale.setScalar(t.s)};
 const bark=mat('bark',{map:barkTex});
 const pt=new THREE.CylinderGeometry(.25,.45,4,7).translate(0,2,0),pc=[new THREE.ConeGeometry(2.8,4,8).translate(0,4.5,0),new THREE.ConeGeometry(2.2,3.4,8).translate(0,6.6,0),new THREE.ConeGeometry(1.5,3,8).translate(0,8.6,0)];
 const pg=[mat('pine1',{color:0x2a6e40,flatShading:true}),mat('pine2',{color:0x347f4b,flatShading:true}),mat('pine3',{color:0x3f9157,flatShading:true})];
 parts.push([inst(pt,bark,pines,place,1),pines]);pc.forEach((g,i)=>parts.push([inst(g,pg[i],pines,place,1),pines]));
 const ot=new THREE.CylinderGeometry(.35,.55,4.5,7).translate(0,2.25,0),oc=[new THREE.IcosahedronGeometry(2.6,0).translate(0,5.8,0),new THREE.IcosahedronGeometry(2,0).translate(1.6,5,.6),new THREE.IcosahedronGeometry(1.9,0).translate(-1.3,5.4,-.9),new THREE.IcosahedronGeometry(1.7,0).translate(.2,7.4,-.4)];
 const og=[0x55a234,0x66b33f,0x4a922e,0x77c34c].map((c,i)=>mat('oak'+i,{color:c,flatShading:true}));
 parts.push([inst(ot,bark,oaks,place,1),oaks]);oc.forEach((g,i)=>parts.push([inst(g,og[i],oaks,place,1),oaks]));
 const bt=new THREE.CylinderGeometry(.2,.3,6,6).translate(0,3,0),bc=[new THREE.IcosahedronGeometry(1.6,0).translate(0,6.4,0),new THREE.IcosahedronGeometry(1.3,0).translate(.6,5.2,.3)];
 parts.push([inst(bt,mat('birch',{color:0xf2efe6}),birch,place,1),birch]);bc.forEach((g,i)=>parts.push([inst(g,mat('bl'+i,{color:i?0xb5d96a:0x9cc95a,flatShading:true}),birch,place,1),birch]));
 for(const L of[pines,oaks,birch])L.forEach((t,i)=>{t.list=L;t.id=i});trees=[...pines,...oaks,...birch];world.treeParts=parts;
 for(let k=0;k<1500&&bush.length<260;k++){const x=(r()-.5)*ISL*1.6,z=(r()-.5)*ISL*1.6,y=H(x,z);if(y<1||!freeSpot(x,z,1.5))continue;bush.push({x,z,y,s:.6+r()*.8})}
 inst(new THREE.IcosahedronGeometry(1.2,1),mat('bush',{color:0x4c9a3a,flatShading:true}),bush,(d,t)=>{d.position.set(t.x,t.y+.4*t.s,t.z);d.scale.set(t.s*1.3,t.s,t.s*1.3);d.rotation.set(0,t.x,0)});
 for(let k=0;k<600&&rocks.length<90;k++){const x=(r()-.5)*ISL*1.6,z=(r()-.5)*ISL*1.6,y=H(x,z);if(y<-2||!freeSpot(x,z,2))continue;rocks.push({x,z,y,s:.8+r()*1.6,a:r()*6})}
 inst(new THREE.DodecahedronGeometry(1.4,0),mat('rock',{color:0x8f949c,flatShading:true}),rocks,(d,t)=>{d.position.set(t.x,t.y+.2,t.z);d.scale.set(t.s*1.3,t.s*.8,t.s);d.rotation.set(t.a,t.a*2,0)},1);
 rocks.forEach(t=>boxes.push({min:new THREE.Vector3(t.x-t.s*1.2,t.y-1,t.z-t.s*1.2),max:new THREE.Vector3(t.x+t.s*1.2,t.y+t.s*1,t.z+t.s*1.2)}));
 const gl=[],fl=[];const n=SET.gfx===2?16000:8000;for(let k=0;k<n*3&&gl.length<n;k++){const x=(r()-.5)*ISL*1.6,z=(r()-.5)*ISL*1.6,y=H(x,z);if(y<1||y>22)continue;if(r()<.08)fl.push({x,z,y,c:r()});else gl.push({x,z,y,s:.6+r()*.8,a:r()*PI})}
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
 if(k==='pistol'){B(.09,.12,.42,gunMetal,0,.04,-.12);B(.08,.2,.1,gunDark,0,-.1,.02,-.25);B(.1,.03,.3,rm,0,.115,-.12);C(.025,.025,.1,gunDark,0,.05,-.37);tip=-.43}
 if(k==='smg'){B(.1,.14,.55,gunMetal,0,.03,-.15);B(.07,.24,.08,gunDark,0,-.14,-.2,.15);B(.08,.18,.09,gunDark,0,-.08,.06,-.3);C(.03,.03,.22,gunDark,0,.05,-.52);B(.1,.04,.3,rm,0,.115,-.15);B(.06,.06,.25,gunDark,0,.02,.22);tip=-.63}
 if(k==='ar'){B(.1,.15,.8,gunMetal,0,.03,-.2);B(.11,.06,.5,rm,0,.13,-.2);B(.08,.26,.11,gunDark,0,-.16,-.28,.2);B(.08,.2,.1,gunDark,0,-.1,.05,-.3);B(.09,.17,.36,gunDark,0,0,.36);C(.032,.03,.4,gunDark,0,.06,-.78);B(.04,.08,.12,gunDark,0,.18,-.05);B(.05,.06,.05,rm,0,.07,-.98);tip=-1.02}
 if(k==='shot'){B(.11,.14,.62,gunMetal,0,.02,-.1);C(.045,.045,.65,gunDark,0,.07,-.6);C(.04,.04,.4,gunWood,0,-.03,-.5);B(.1,.22,.38,gunWood,0,-.04,.36,-.12);B(.08,.18,.1,gunDark,0,-.1,.08,-.3);B(.1,.03,.4,rm,0,.105,-.1);tip=-.95}
 if(k==='snipe'){B(.1,.14,1,gunMetal,0,.02,-.2);C(.03,.026,.7,gunDark,0,.05,-1.05);C(.06,.06,.42,gunDark,0,.2,-.25);C(.07,.07,.04,rm,0,.2,-.47);C(.07,.07,.04,rm,0,.2,-.03);B(.06,.08,.06,gunDark,0,.12,-.25);B(.1,.24,.4,gunWood,0,-.04,.48,-.1);B(.08,.2,.1,gunDark,0,-.12,.12,-.3);B(.03,.3,.03,gunDark,-.05,-.18,-.95,.4);B(.03,.3,.03,gunDark,.05,-.18,-.95,.4);tip=-1.42}
 g.userData.tip=new THREE.Vector3(0,.06,tip);return g}
const iconCache={};function weaponIcon(k,rar){const key=k+rar;if(iconCache[key])return iconCache[key];const c=document.createElement('canvas');c.width=108;c.height=62;const x=c.getContext('2d'),col=k==='pick'?'#9fb3c8':RAR[rar||0].c;x.translate(54,32);x.lineJoin='round';
 const draw=(fill,stroke,lw)=>{x.fillStyle=fill;x.strokeStyle=stroke;x.lineWidth=lw;const R=(X,Y,w,h)=>{x.fillRect(X,Y,w,h);if(lw)x.strokeRect(X,Y,w,h)};
  if(k==='pick'){x.save();x.rotate(-.7);R(-3,-22,6,48);x.restore();x.beginPath();x.moveTo(-12,-22);x.quadraticCurveTo(10,-30,30,-12);x.lineTo(26,-8);x.quadraticCurveTo(8,-22,-10,-16);x.closePath();x.fill();if(lw)x.stroke();return}
  const L={pistol:30,smg:42,ar:60,shot:56,snipe:72}[k];R(-L/2,-8,L,10);R(-L/2-6,-5,8,5);R(-L/2+8,2,9,15);if(k!=='pistol')R(L/2-2,-7,14,12);if(k==='ar'||k==='smg')R(-6,2,7,14);if(k==='snipe')R(-12,-18,26,7);if(k==='shot')R(-L/2,3,24,6)};
 draw('#000','#000',8);draw('#e8ecf2',col,0);x.fillStyle=col;if(k!=='pick'){const L={pistol:30,smg:42,ar:60,shot:56,snipe:72}[k];x.fillRect(-L/2,-8,L,3)}
 iconCache[key]=c.toDataURL();return iconCache[key]}
/* ===================== Figuren ===================== */
let ROBOT=null,ROBOT_H=1;
function mkChar(col,name){
 const root=new THREE.Group();scene.add(root);const C={root,col,cur:null,actions:{},bones:{}};
 if(ROBOT){const m=THREE.SkeletonUtils.clone(ROBOT.scene);m.scale.setScalar(1.9/ROBOT_H);root.add(m);C.model=m;
  m.traverse(o=>{if(o.isMesh||o.isSkinnedMesh){o.castShadow=true;o.receiveShadow=false;o.frustumCulled=false;const mm=Array.isArray(o.material)?o.material:[o.material];const nm=mm.map(q=>{const n=q.clone();if(q.name==='Main')n.color.setHex(col);if(q.name==='Grey')n.color.setHex(0xb8bec8);return n});o.material=nm.length===1?nm[0]:nm}
   if(o.isBone){C.bones[o.name.replace(/[^A-Za-z0-9]/g,'')]=o}});
  C.mixer=new THREE.AnimationMixer(m);for(const clip of ROBOT.animations)C.actions[clip.name]=C.mixer.clipAction(clip);
  for(const k of['Death','Jump','Punch','WalkJump'])if(C.actions[k]){C.actions[k].clampWhenFinished=true;C.actions[k].setLoop(THREE.LoopOnce)}
  play(C,'Idle')}
 else{const b=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,1.8,10),new THREE.MeshStandardMaterial({color:col}));b.position.y=.95;b.castShadow=true;root.add(b)}
 const gl=new THREE.Group();const fab=new THREE.MeshStandardMaterial({color:col,side:THREE.DoubleSide,roughness:.6}),fab2=new THREE.MeshStandardMaterial({color:0xffffff,side:THREE.DoubleSide,roughness:.6});
 for(const s of[-1,1]){const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(s*3.4,1.1);sh.lineTo(s*3.1,1.8);sh.lineTo(0,.9);sh.lineTo(0,0);const w=new THREE.Mesh(new THREE.ShapeGeometry(sh),s>0?fab:fab2);w.rotation.x=-PI/2+.12;w.position.set(0,2.6,-.6);w.castShadow=true;gl.add(w)}
 const bar=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,6.6,6).rotateZ(PI/2),gunMetal);bar.position.set(0,2.62,-.9);gl.add(bar);const keel=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,2,6).rotateX(PI/2),gunMetal);keel.position.set(0,2.6,0);gl.add(keel);
 for(const s of[-1,1]){const st=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.3,5),gunMetal);st.position.set(s*.35,2.05,-.15);st.rotation.z=s*.3;gl.add(st)}
 gl.visible=false;root.add(gl);C.glider=gl;
 if(name){const c=document.createElement('canvas');c.width=256;c.height=48;const x=c.getContext('2d');x.font='bold 28px sans-serif';x.textAlign='center';x.fillStyle='rgba(0,0,0,.45)';x.fillRect(20,4,216,40);x.fillStyle='#fff';x.fillText(name,128,34);const tag=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c)}));tag.scale.set(2,.38,1);tag.position.y=2.45;root.add(tag);C.tag=tag}
 return C}
function play(C,name,fade=.2,speed=1){if(!C.mixer)return;const a=C.actions[name];if(!a)return;if(C.cur===name){a.setEffectiveTimeScale(speed);return}const prev=C.cur&&C.actions[C.cur];a.reset();a.setEffectiveTimeScale(speed);a.setEffectiveWeight(1);a.play();if(prev)prev.crossFadeTo(a,fade,false);C.cur=name}
const _v1=new THREE.Vector3(),_v2=new THREE.Vector3(),_v3=new THREE.Vector3(),_q1=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_qI=new THREE.Quaternion();
function aimBone(bone,child,dir){if(!bone||!child)return;bone.updateMatrixWorld(true);bone.getWorldPosition(_v1);child.getWorldPosition(_v2);_v2.sub(_v1).normalize();_q1.setFromUnitVectors(_v2,dir);bone.getWorldQuaternion(_q2);_q1.multiply(_q2);bone.parent.getWorldQuaternion(_q2).invert();bone.quaternion.copy(_q2.multiply(_q1))}
const aimDir=new THREE.Vector3(),rightV=new THREE.Vector3(),downV=new THREE.Vector3(0,-1,0);
function animChar(e,dt,far){const C=e.m;if(!C)return;const root=C.root;
 root.position.set(e.x,e.y,e.z);root.rotation.y=e.yaw+PI;if(C.tag)C.tag.visible=Math.hypot(e.x-camera.position.x,e.z-camera.position.z)>5;root.visible=(e.alive||e.deadT<3)&&!e.inBus;
 if(!root.visible){if(e.wpn)e.wpn.visible=false;return}
 const sp=Math.hypot(e.vx||0,e.vz||0);let an='Idle',spd=1;
 if(!e.alive)an='Death';else if(e.dance>0)an='Dance';else if(e.glide||e.fall||!e.onG)an='Jump';else if(e.swing>0)an='Punch';else if(sp>4.5){an='Running';spd=clamp(sp/6.4,.6,1.4)}else if(sp>.6){an='Walking';spd=clamp(sp/2.4,.6,1.6)}
 if(an==='Punch'&&C.cur==='Punch'&&!C.actions.Punch.isRunning()){C.cur=null}
 play(C,an,.15,an==='Punch'?1.6:spd);
 C.glider.visible=!!e.glide&&e.alive;if(C.glider.visible){C.glider.rotation.z=(e.bank||0)*.35}
 if(e.fall&&C.model){C.model.rotation.x=lerp(C.model.rotation.x,1.1,dt*4)}else if(C.model)C.model.rotation.x=lerp(C.model.rotation.x,0,dt*8);
 if(C.mixer&&(!far||(frameN+e.col)%3===0))C.mixer.update(far?dt*3:dt);
 const p=e.pitch||0;aimDir.set(-Math.sin(e.yaw)*Math.cos(p),Math.sin(p),-Math.cos(e.yaw)*Math.cos(p)).normalize();rightV.set(Math.cos(e.yaw),0,-Math.sin(e.yaw));
 const holdGun=e.alive&&e.w!=='pick'&&!e.glide&&!e.fall&&!(e.dance>0)&&C.bones.UpperArmR;
 if(holdGun&&!far){const B=C.bones;aimBone(B.UpperArmR,B.LowerArmR,_v3.copy(aimDir).addScaledVector(downV,.45).addScaledVector(rightV,-.15).normalize());aimBone(B.LowerArmR,B.Palm2R||B.HandR,aimDir);
  aimBone(B.UpperArmL,B.LowerArmL,_v3.copy(aimDir).addScaledVector(rightV,.95).addScaledVector(downV,.5).normalize());aimBone(B.LowerArmL,B.Palm2L||B.HandL,_v3.copy(aimDir).addScaledVector(rightV,.55).normalize())}
 const rk=e.rar&&e.rar[e.sel]||0,key=e.w+':'+rk;if(e.wKey!==key){if(e.wpn)scene.remove(e.wpn);e.wpn=makeWeapon(e.w,rk);scene.add(e.wpn);e.wKey=key}
 const hb=C.bones.Palm2R||C.bones.HandR||C.bones.LowerArmR;if(hb&&!far)hb.getWorldPosition(e.wpn.position);else e.wpn.position.set(e.x+rightV.x*.35+aimDir.x*.4,e.y+1.15,e.z+rightV.z*.35+aimDir.z*.4);
 e.wpn.visible=e.alive&&!e.glide&&!e.fall&&!(e.dance>0);
 if(e.w==='pick'){if(hb&&!far){hb.getWorldQuaternion(e.wpn.quaternion);e.wpn.rotateX(-PI/2);e.wpn.rotateZ(PI/2)}else e.wpn.rotation.set(0,e.yaw,-.3)}
 else{e.wpn.rotation.set(p,e.yaw,0,'YXZ');if(e.kickT>0)e.wpn.position.addScaledVector(aimDir,-e.kickT*.8)}}
/* ===================== Ballon-Bus ===================== */
const bus=new THREE.Group();{const bal=new THREE.Mesh(new THREE.SphereGeometry(9,24,16),new THREE.MeshStandardMaterial({map:stripeTex,roughness:.7}));bal.scale.set(1,1.15,1);bal.position.y=16;bus.add(bal);
 const body=new THREE.Mesh(new THREE.BoxGeometry(4,3.2,10),new THREE.MeshStandardMaterial({color:0x2e86de,metalness:.3,roughness:.5}));bus.add(body);
 const roof=new THREE.Mesh(new THREE.BoxGeometry(4.2,.4,10.2),new THREE.MeshStandardMaterial({color:0xffffff}));roof.position.y=1.8;bus.add(roof);
 for(let i=0;i<4;i++)for(const s of[-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(.1,1.2,1.6),new THREE.MeshStandardMaterial({color:0xbfe4ff,emissive:0x203040}));w.position.set(s*2.02,.4,-3.3+i*2.2);bus.add(w)}
 for(const [sx,sz] of[[-1,-1],[1,-1],[-1,1],[1,1]]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,9,4),gunMetal);r.position.set(sx*2.5,6.2,sz*3.5);r.rotation.set(sz*.2,0,-sx*.25);bus.add(r)}
 const fl=new THREE.Mesh(new THREE.ConeGeometry(1.4,3,10),new THREE.MeshBasicMaterial({color:0xffa53a,transparent:true,opacity:.85}));fl.position.y=5.5;fl.rotation.x=PI;bus.add(fl);bus.userData.fl=fl;
 for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.4,.4,.2),new THREE.MeshBasicMaterial({color:0xfff6c0}));p.position.set(s*1.3,-.6,-5.05);bus.add(p)}
 bus.traverse(o=>{if(o.isMesh)o.castShadow=true});bus.visible=false;scene.add(bus)}
const BUS={cx:1,cz:0,dur:42};function busPos(t,out){const k=clamp(t/BUS.dur,0,1),R=ISL*1.15;return out.set(lerp(-BUS.cx,BUS.cx,k)*R,150,lerp(-BUS.cz,BUS.cz,k)*R)}
/* ===================== Loot & Kisten ===================== */
let lootN=0;
function rollItem(r){const q=r();if(q<.16)return{k:'med',n:1};if(q<.3)return{k:'shield',n:1};if(q<.38)return{k:'wood',n:30};const g=GUNS[Math.floor(r()*GUNS.length)];let rr=r(),rar=rr<.4?0:rr<.7?1:rr<.88?2:rr<.97?3:4;return{k:g,r:rar}}
function itemModel(it){const g=new THREE.Group();
 if(WPN[it.k]){const w=makeWeapon(it.k,it.r);w.rotation.y=PI/2;g.add(w)}
 else if(it.k==='med'){g.add(new THREE.Mesh(new THREE.BoxGeometry(.6,.4,.45),mat('medk',{color:0xffffff})));const c1=new THREE.Mesh(new THREE.BoxGeometry(.38,.12,.47),mat('medc',{color:0xff3b3b,emissive:0x500000}));g.add(c1);g.add(new THREE.Mesh(new THREE.BoxGeometry(.12,.32,.47),mat('medc')))}
 else if(it.k==='shield'){g.add(new THREE.Mesh(new THREE.CylinderGeometry(.18,.22,.45,10),mat('shp',{color:0x3a9bff,emissive:0x1a4aff,emissiveIntensity:.6,transparent:true,opacity:.85})));const n=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.2,8),mat('cork',{color:0xd7ccc8}));n.position.y=.3;g.add(n)}
 else if(it.k==='wood'){for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.9,.12,.25),mat('planks',{map:woodTex}));p.position.set(0,i*.13,(i-1)*.08);p.rotation.y=i*.25;g.add(p)}}
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
const beamGeo=new THREE.CylinderGeometry(.35,.6,5,10,1,true).translate(0,2.5,0),beamMats={};
function spawnLoot(r,x,y,z,it,id){it=it||rollItem(r);id=id||('L'+(lootN++));const col=it.k==='med'?0xff4d6d:it.k==='shield'?0x3a9bff:it.k==='wood'?0xc48d55:new THREE.Color(RAR[it.r].c).getHex();
 const g=new THREE.Group();g.position.set(x,y,z);const m=itemModel(it);m.position.y=.55;g.add(m);
 const bk=col+':'+(WPN[it.k]&&it.r>=2?1:0);const beam=new THREE.Mesh(beamGeo,beamMats[bk]||(beamMats[bk]=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:WPN[it.k]&&it.r>=2?.22:.12,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending})));g.add(beam);
 scene.add(g);loot.set(id,{id,x,y,z,it,g,m});return id}
function removeLoot(id){const l=loot.get(id);if(!l)return;scene.remove(l.g);loot.delete(id)}
function addChest(r,x,y,z,ry){const id='C'+chests.size;const items=[rollItem(r),rollItem(r),{k:'wood',n:20}];
 const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry||0;const gold=mat('chestG',{color:0xffc83d,metalness:.8,roughness:.3,emissive:0x5a3a00}),wd=mat('chestW',{color:0x8a5a2b,map:woodTex});
 const base=new THREE.Mesh(new THREE.BoxGeometry(1.4,.6,.85),wd);base.position.y=.3;g.add(base);const lidP=new THREE.Group();lidP.position.set(0,.6,-.42);const lid=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,1.4,12,1,false,0,PI).rotateZ(PI/2),wd);lid.position.z=.42;lidP.add(lid);g.add(lidP);
 for(const s of[-.55,.55]){const b=new THREE.Mesh(new THREE.BoxGeometry(.1,.62,.88),gold);b.position.set(s,.3,0);g.add(b)}const lk=new THREE.Mesh(new THREE.BoxGeometry(.2,.25,.06),gold);lk.position.set(0,.55,.45);g.add(lk);
 const glow=new THREE.Mesh(new THREE.SphereGeometry(1.1,12,8),new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:.12,depthWrite:false,blending:THREE.AdditiveBlending}));glow.position.y=.5;g.add(glow);
 g.traverse(o=>{if(o.isMesh&&o!==glow)o.castShadow=true});world.add(g);chests.set(id,{id,x,y,z,g,lid:lidP,glow,items,open:false,openT:0})}
function openChest(id,local){const c=chests.get(id);if(!c||c.open)return;c.open=true;c.glow.visible=false;c.openT=0;
 c.items.forEach((it,i)=>spawnLoot(null,c.x+Math.cos(i*2.1+.5)*1.5,c.y,c.z+Math.sin(i*2.1+.5)*1.5,it,id+'-'+i));sparkle(new THREE.Vector3(c.x,c.y+1,c.z),0xffd23f,24);
 if(local){sfx('chest');if(room)room.send({t:'chest',id})}}
/* ===================== Bauen ===================== */
const BM=new THREE.MeshStandardMaterial({map:woodTex,roughness:.8}),BMlow=new THREE.MeshStandardMaterial({map:woodTex,color:0xff9a7a,roughness:.8});
function structKey(k,ix,iy,iz,d){return k+':'+ix+':'+iy+':'+iz+':'+d}
function placeStruct(k,ix,iy,iz,d,local){const key=structKey(k,ix,iy,iz,k==='floor'?0:d);if(structs.has(key))return false;
 const cx=ix*4,cz=iz*4,by=iy*4;const dx=[0,1,0,-1][d],dz=[1,0,-1,0][d];let s,mesh;
 if(k==='wall'){const sx=dx?.3:4,sz=dz?.3:4;mesh=new THREE.Mesh(new THREE.BoxGeometry(sx,4,sz),BM);mesh.position.set(cx+dx*2,by+2,cz+dz*2);s={min:new THREE.Vector3(cx+dx*2-sx/2,by,cz+dz*2-sz/2),max:new THREE.Vector3(cx+dx*2+sx/2,by+4,cz+dz*2+sz/2)}}
 else if(k==='floor'){mesh=new THREE.Mesh(new THREE.BoxGeometry(4,.25,4),BM);mesh.position.set(cx,by+.12,cz);s={min:new THREE.Vector3(cx-2,by,cz-2),max:new THREE.Vector3(cx+2,by+.25,cz+2)}}
 else{const len=Math.hypot(4,4);mesh=new THREE.Mesh(new THREE.BoxGeometry(4,.25,len),BM);mesh.position.set(cx,by+2,cz);mesh.rotation.order='YXZ';mesh.rotation.y=Math.atan2(dx,dz);mesh.rotation.x=-PI/4;s={ramp:1,cx,cz,by,dx,dz,min:new THREE.Vector3(cx-2,by,cz-2),max:new THREE.Vector3(cx+2,by+4,cz+2)}}
 mesh.castShadow=mesh.receiveShadow=true;scene.add(mesh);s.mesh=mesh;s.st=1;s.key=key;s.hp=150;s.grow=0;s.px=mesh.position.x;mesh.scale.setScalar(.01);structs.set(key,s);if(!s.ramp)boxes.push(s);
 if(local){sfx('build');if(room)room.send({t:'build',k,ix,iy,iz,d})}return true}
function damageStruct(key,dmg,local){const s=structs.get(key);if(!s)return;s.hp-=dmg;if(local&&room)room.send({t:'sdmg',key,dmg});s.shake=.15;
 if(s.hp<=0){scene.remove(s.mesh);s.mesh.geometry.dispose();structs.delete(key);const i=boxes.indexOf(s);if(i>=0)boxes.splice(i,1);debris(s.mesh.position,0xc48d55,14)}
 else s.mesh.material=s.hp<60?BMlow:BM}
function rampY(s,x,z){const lx=x-s.cx,lz=z-s.cz;if(Math.abs(lx)>2||Math.abs(lz)>2)return null;const t=(lx*s.dx+lz*s.dz+2)/4;return s.by+clamp(t,0,1)*4}
/* ===================== Effekte ===================== */
const fx=[];const traceM=new THREE.MeshBasicMaterial({color:0xfff2a0,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false});
const traceG=new THREE.CylinderGeometry(.025,.025,1,4,1,true).rotateX(PI/2).translate(0,0,.5);
function tracer(a,b){const L=a.distanceTo(b);if(L<.1)return;const m=new THREE.Mesh(traceG,traceM);m.position.copy(a);m.lookAt(b);m.scale.set(1,1,L);scene.add(m);fx.push({o:m,t:.06,keep:1})}
const flashTex=ctex(64,64,(x,w,h)=>{const g=x.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(255,255,230,1)');g.addColorStop(.3,'rgba(255,200,80,.9)');g.addColorStop(1,'rgba(255,120,0,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});
const flashM=new THREE.SpriteMaterial({map:flashTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true});
function muzzle(p,s){const sp=new THREE.Sprite(flashM);sp.position.copy(p);sp.scale.setScalar(s||.8);scene.add(sp);fx.push({o:sp,t:.05,keep:1})}
const pG=new THREE.BoxGeometry(.12,.12,.12);const pMats={};const pMat=c=>pMats[c]||(pMats[c]=new THREE.MeshBasicMaterial({color:c}));
function debris(p,c,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(pG,pMat(c));m.position.copy(p);m.scale.setScalar(1+Math.random()*2);m.userData.v=new THREE.Vector3((Math.random()-.5)*8,Math.random()*6+1,(Math.random()-.5)*8);scene.add(m);fx.push({o:m,t:.7+Math.random()*.4,phys:1,keep:1})}}
function sparkle(p,c,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(pG,pMat(c));m.position.copy(p);m.userData.v=new THREE.Vector3((Math.random()-.5)*6,Math.random()*7,(Math.random()-.5)*6);scene.add(m);fx.push({o:m,t:.6+Math.random()*.4,phys:1,keep:1,spin:1})}}
function impact(p,c){for(let i=0;i<5;i++){const m=new THREE.Mesh(pG,pMat(c));m.position.copy(p);m.scale.setScalar(.6);m.userData.v=new THREE.Vector3((Math.random()-.5)*5,Math.random()*4,(Math.random()-.5)*5);scene.add(m);fx.push({o:m,t:.35,phys:1,keep:1})}}
function dmgNum(p,n,head,shield){const c=document.createElement('canvas');c.width=160;c.height=64;const x=c.getContext('2d');x.font='900 46px sans-serif';x.textAlign='center';x.lineWidth=7;x.strokeStyle='#000';x.strokeText(n,80,50);x.fillStyle=head?'#ffd23f':shield?'#7fdcff':'#fff';x.fillText(n,80,50);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));s.scale.set(1.8,.72,1);s.position.copy(p);s.position.x+=(Math.random()-.5)*.6;s.position.y+=.6;scene.add(s);fx.push({o:s,t:.9,up:1})}
function tickFx(dt){for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t-=dt;if(f.phys){f.o.userData.v.y-=16*dt;f.o.position.addScaledVector(f.o.userData.v,dt);if(f.spin)f.o.rotation.x+=dt*10}if(f.up)f.o.position.y+=dt*1.6;
 if(f.t<=0){scene.remove(f.o);if(!f.keep){f.o.material.map&&f.o.material.map.dispose();f.o.material.dispose()}fx.splice(i,1)}}}
/* ===================== Sturm ===================== */
const stormMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{t:{value:0}},
 vertexShader:'varying vec2 vU;varying float vY;void main(){vU=uv;vY=position.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform float t;varying vec2 vU;varying float vY;void main(){float n=sin(vU.x*120.+t*1.7)*.5+sin(vU.x*47.-t*2.3+vY*.03)*.5;float a=.26+.12*n;vec3 c=mix(vec3(.45,.15,.9),vec3(.8,.4,1.),n*.5+.5);gl_FragColor=vec4(c,a);}'});
const stormMesh=new THREE.Mesh(new THREE.CylinderGeometry(1,1,500,96,1,true),stormMat);stormMesh.renderOrder=5;scene.add(stormMesh);
let PH=[],storm={x:0,z:0,r:ISL*1.2,dmg:1};
function makeStorm(seed){const r=rng(seed+99),sp=[1.45,1,.65][SET.storm];PH=[];let x=0,z=0,rad=ISL*1.2,t=BUS.dur+50*sp;
 PH.push({t0:0,t1:t,x0:x,z0:z,r0:rad,x1:x,z1:z,r1:rad,dmg:1});
 for(const [f,dmg] of[[.55,1],[.5,2],[.45,4],[.4,6],[.35,8],[0,10]]){const nr=rad*f||0,a=r()*TAU,off=r()*(rad-nr)*.8;const nx=x+Math.cos(a)*off,nz=z+Math.sin(a)*off;const wait=Math.max(15,40*sp-dmg*2),shrink=Math.max(15,45*sp-dmg*2);
  PH.push({t0:t,t1:t+wait,x0:x,z0:z,r0:rad,x1:x,z1:z,r1:rad,dmg,next:{x:nx,z:nz,r:nr}});t+=wait;PH.push({t0:t,t1:t+shrink,x0:x,z0:z,r0:rad,x1:nx,z1:nz,r1:nr,dmg,shrinking:1});t+=shrink;x=nx;z=nz;rad=nr}}
function stormAt(t){let p=PH[PH.length-1];for(const q of PH)if(t<q.t1){p=q;break}const k=clamp((t-p.t0)/(p.t1-p.t0),0,1);return{x:lerp(p.x0,p.x1,k),z:lerp(p.z0,p.z1,k),r:lerp(p.r0,p.r1,k),dmg:p.dmg,left:p.t1-t,shrinking:!!p.shrinking,next:p.next}}
/* ===================== Spieler ===================== */
let ents=new Map(),me=null,state='load',room=null,isHost=true,matchT=0,seed=1,kills=0,spect=null,myPlace=0,netT=0,lastPlayers=[],ended=false,frameN=0;
function newEnt(o){const e=Object.assign({x:0,y:150,z:0,vx:0,vy:0,vz:0,yaw:0,pitch:0,hp:100,sh:0,alive:true,onG:false,glide:false,fall:false,inBus:true,w:'pick',slots:['pick',null,null,null,null],rar:[0,0,0,0,0],sel:0,wood:0,med:0,shieldN:0,cd:0,swing:0,kills:0,mag:{},reload:0,heal:0,dance:0,deadT:0,kickT:0},o);
 e.m=mkChar(COLS[e.col%COLS.length],e.local?null:e.name);ents.set(e.id,e);return e}
function clearEnts(){for(const e of ents.values()){scene.remove(e.m.root);if(e.wpn)scene.remove(e.wpn)}ents.clear()}
function startMatch(players,set,sd){
 Object.assign(SET,set);seed=sd;const r=rng(seed+7),a=r()*TAU;BUS.cx=Math.cos(a);BUS.cz=Math.sin(a);
 buildWorld(seed);makeStorm(seed);clearEnts();kills=0;ended=false;myPlace=0;spect=null;camInit=false;
 players.forEach(p=>{const e=newEnt({id:p.id,name:p.name,col:p.col,bot:!!p.bot,local:p.id===SH_UID,remote:!p.bot&&p.id!==SH_UID,think:0,tgt:null});
  if(e.bot){e.dropAt=4+r()*(BUS.dur-8);e.dest={x:(r()-.5)*ISL*1.3,z:(r()-.5)*ISL*1.3};if(r()<.5){const q=POI[Math.floor(r()*POI.length)];e.dest={x:q.x+(r()-.5)*30,z:q.z+(r()-.5)*30}}e.aimErr=[.11,.06,.03][SET.diff]}if(e.local)me=e});
 if(me){look.yaw=Math.atan2(BUS.cx,BUS.cz);look.pitch=-.25}
 matchT=0;state='play';show(null);$('hud').style.display='block';$('touch').style.display=TOUCH?'block':'none';big('🎈 ALLE AN BORD!',2.5);refreshSlots();
 feed('Spring aus dem Ballon-Bus, wann du willst!')}
function dropFromBus(e){if(!e.inBus)return;e.inBus=false;e.fall=true;e.fallT=0;busPos(matchT,_v1);e.x=_v1.x+(Math.random()-.5)*3;e.y=_v1.y-3;e.z=_v1.z+(Math.random()-.5)*3;e.vx=e.vz=e.vy=0;if(e.local){sfx('jumpbus');big('',0)}}
/* ---------- Physik ---------- */
function groundAt(x,z,y){let g=H(x,z);if(g<-.4)g=-.4;
 for(const b of boxes){if(x<b.min.x-.3||x>b.max.x+.3||z<b.min.z-.3||z>b.max.z+.3)continue;if(b.max.y<=y+.65&&b.max.y>g)g=b.max.y}
 for(const s of structs.values())if(s.ramp){const ry=rampY(s,x,z);if(ry!==null&&ry<=y+.9&&ry>g)g=ry}return g}
function collideXZ(e){const r=.42;for(const b of boxes){if(e.x<b.min.x-1||e.x>b.max.x+1||e.z<b.min.z-1||e.z>b.max.z+1)continue;if(e.y+1.8<b.min.y||e.y+.6>b.max.y)continue;
 const cx=clamp(e.x,b.min.x,b.max.x),cz=clamp(e.z,b.min.z,b.max.z),dx=e.x-cx,dz=e.z-cz,d=Math.hypot(dx,dz);
 if(d<r){if(d>1e-4){e.x=cx+dx/d*r;e.z=cz+dz/d*r}else{const o=[e.x-b.min.x,b.max.x-e.x,e.z-b.min.z,b.max.z-e.z],m=Math.min(...o);if(m===o[0])e.x=b.min.x-r;else if(m===o[1])e.x=b.max.x+r;else if(m===o[2])e.z=b.min.z-r;else e.z=b.max.z+r}}}
 for(const t of trees){const dx=e.x-t.x,dz=e.z-t.z;if(Math.abs(dx)>2||Math.abs(dz)>2)continue;const d=Math.hypot(dx,dz),rr=.45*t.s+r;if(d<rr&&e.y<t.y+4){e.x=t.x+dx/(d||1)*rr;e.z=t.z+dz/(d||1)*rr}}
 const d=Math.hypot(e.x,e.z);if(d>ISL*1.3){e.x*=ISL*1.3/d;e.z*=ISL*1.3/d}}
function physics(e,mx,mz,jump,dt){
 if(e.fall){e.vx=lerp(e.vx,mx*26,dt*2);e.vz=lerp(e.vz,mz*26,dt*2);e.vy=lerp(e.vy,-38,dt*1.5);e.fallT+=dt;const gh=e.y-H(e.x,e.z);if(gh<38||(jump&&gh<130&&e.fallT>1)){e.fall=false;e.glide=true;if(e.local)sfx('glide')}}
 else if(e.glide){e.vx=lerp(e.vx,mx*17,dt*1.5);e.vz=lerp(e.vz,mz*17,dt*1.5);e.vy=lerp(e.vy,-7.5,dt*3);e.bank=lerp(e.bank||0,clamp(mx*Math.cos(e.yaw)-mz*Math.sin(e.yaw),-1,1),dt*3)}
 else{const sp=e.heal>0?2.6:6.4;const acc=e.onG?14:4;e.vx=lerp(e.vx,mx*sp,Math.min(1,dt*acc));e.vz=lerp(e.vz,mz*sp,Math.min(1,dt*acc));e.vy-=24*dt;if(jump&&e.onG){e.vy=8.8;e.onG=false;if(e.local)sfx('jump')}}
 e.x+=e.vx*dt;e.z+=e.vz*dt;collideXZ(e);
 const ny=e.y+e.vy*dt,g=groundAt(e.x,e.z,e.y);
 if(e.vy>0)for(const b of boxes){if(e.x>b.min.x-.3&&e.x<b.max.x+.3&&e.z>b.min.z-.3&&e.z<b.max.z+.3&&e.y+1.9<=b.min.y&&ny+1.9>b.min.y){e.vy=0;break}}
 if(ny<=g){if(e.fall||e.glide){e.fall=false;e.glide=false;if(e.local){sfx('land');dust(e)}}else if(!e.onG&&e.vy<-12&&e.local)dust(e);e.y=g;e.vy=0;e.onG=true}else{e.y=ny;e.onG=e.y-g<.06}
 if(e.y<-.2&&!e.glide&&!e.fall){e.vx*=.9;e.vz*=.9}}
function dust(e){for(let i=0;i<10;i++){const m=new THREE.Mesh(pG,pMat(0xd8c9a8));m.position.set(e.x,e.y+.1,e.z);m.scale.setScalar(2);m.userData.v=new THREE.Vector3(Math.cos(i)*4,1.5,Math.sin(i)*4);scene.add(m);fx.push({o:m,t:.4,phys:1,keep:1})}}
/* ---------- Schießen ---------- */
function rayBox(o,d,b,maxT){let t0=0,t1=maxT;for(const ax of['x','y','z']){const inv=1/(d[ax]||1e-9);let ta=(b.min[ax]-o[ax])*inv,tb=(b.max[ax]-o[ax])*inv;if(ta>tb){const q=ta;ta=tb;tb=q}t0=Math.max(t0,ta);t1=Math.min(t1,tb);if(t0>t1)return null}return t0}
function castShot(o,d,range,shooter){let best={t:range,kind:null};
 for(const b of boxes){const t=rayBox(o,d,b,best.t);if(t!==null&&t<best.t)best={t,kind:b.st?'struct':'box',ref:b}}
 for(const s of structs.values())if(s.ramp){const t=rayBox(o,d,s,best.t);if(t!==null&&t<best.t){const p=o.clone().addScaledVector(d,t+.3),ry=rampY(s,p.x,p.z);if(ry!==null&&p.y<=ry+.3)best={t,kind:'struct',ref:s}}}
 for(const e of ents.values()){if(e===shooter||!e.alive||e.inBus)continue;const b={min:{x:e.x-.45,y:e.y,z:e.z-.45},max:{x:e.x+.45,y:e.y+1.95,z:e.z+.45}};const t=rayBox(o,d,b,best.t);if(t!==null&&t<best.t){const hy=o.y+d.y*t;best={t,kind:'ent',ref:e,head:hy>e.y+1.45}}}
 for(const tr of trees){const dx=o.x-tr.x,dz=o.z-tr.z,a=d.x*d.x+d.z*d.z,bq=2*(dx*d.x+dz*d.z),c=dx*dx+dz*dz-(.5*tr.s)**2,D=bq*bq-4*a*c;if(D<0||a<1e-6)continue;const t=(-bq-Math.sqrt(D))/(2*a);if(t>0&&t<best.t){const y=o.y+d.y*t;if(y>tr.y&&y<tr.y+5*tr.s)best={t,kind:'tree',ref:tr}}}
 for(let t=1;t<best.t;t+=1.5){const y=o.y+d.y*t;if(y<H(o.x+d.x*t,o.z+d.z*t)){best={t,kind:'ground'};break}}
 best.p=o.clone().addScaledVector(d,best.t);return best}
const camDir=new THREE.Vector3(),tmp=new THREE.Vector3();
function gunTip(e,out){if(e.wpn&&e.wpn.userData.tip){e.wpn.updateMatrixWorld();out.copy(e.wpn.userData.tip);e.wpn.localToWorld(out)}else out.set(e.x,e.y+1.4,e.z);return out}
function fire(e,dirOverride){
 const W=WPN[e.w];if(e.cd>0||e.reload>0||e.heal>0||e.glide||e.fall||e.inBus||!e.alive)return;e.dance=0;
 const rar=RAR[e.rar[e.sel]||0].m;
 if(W.melee){e.cd=W.rate;e.swing=.45;const o=new THREE.Vector3(e.x,e.y+1.3,e.z),d=new THREE.Vector3(-Math.sin(e.yaw),0,-Math.cos(e.yaw));const h=castShot(o,d,2.8,e);
  if(e.local)sfx('swing');
  setTimeout(()=>{if(!e.alive)return;if(h.kind==='tree'){e.wood=Math.min(999,e.wood+12);h.ref.hp-=W.dmg;if(e.local){sfx('chop');dmgNum(h.p,'+12',false,false);refreshSlots()}debris(h.p,0x8a5a2b,6);if(h.ref.hp<=0)fellTree(h.ref,true)}
   else if(h.kind==='struct'){damageStruct(h.ref.key,50,e.local||(e.bot&&isHost));if(e.local){e.wood=Math.min(999,e.wood+5);sfx('chop')}}
   else if(h.kind==='box'){if(e.local)sfx('clang');impact(h.p,0xcccccc)}
   else if(h.kind==='ent')hitEnt(e,h.ref,W.dmg,false)},180);return}
 const mg=e.mag[e.sel]??W.mag;if(mg<=0){startReload(e);return}
 e.mag[e.sel]=mg-1;e.cd=W.rate;e.kickT=.08;
 const o=e.local?camera.position.clone():new THREE.Vector3(e.x,e.y+1.6,e.z);const base=dirOverride||(e.local?camDir.clone():new THREE.Vector3(-Math.sin(e.yaw),0,-Math.cos(e.yaw)));
 if(e.local)sfx(e.w);const tipP=gunTip(e,new THREE.Vector3());muzzle(tipP,W.pel?1.1:W.zoom?1.2:.7);
 const pel=W.pel||1,moving=Math.hypot(e.vx,e.vz)>1,spr=W.spr*(e.onG?1:1.8)*(moving?1.3:.85)*(scoped&&e.local?.15:1);
 for(let i=0;i<pel;i++){const d=base.clone();d.x+=(Math.random()-.5)*spr*2;d.y+=(Math.random()-.5)*spr*2;d.z+=(Math.random()-.5)*spr*2;d.normalize();
  const h=castShot(o,d,W.rng,e);if(i<3)tracer(tipP,h.p);
  if(h.kind==='ent'){const dm=Math.round(W.dmg*rar*(h.head?(W.zoom?2.2:1.5):1)*(1-Math.max(0,h.t-W.rng*.5)/W.rng*.5));hitEnt(e,h.ref,dm,h.head);impact(h.p,0xff5050)}
  else if(h.kind==='struct'){damageStruct(h.ref.key,Math.round(W.dmg*rar*.8),e.local||(e.bot&&isHost));impact(h.p,0xc48d55)}
  else if(h.kind)impact(h.p,h.kind==='tree'?0x8a5a2b:h.kind==='ground'?0x9a8a6a:0xbbbbbb)}
 if(room&&(e.local||e.bot))room.send({t:'tr',a:[tipP.x,tipP.y,tipP.z].map(v=>+v.toFixed(1)),w:e.w,id:e.id});
 if(e.local){recoil+=W.kick;crossKick=Math.min(2,crossKick+W.kick*12);if(e.mag[e.sel]===0)startReload(e);refreshAmmo()}}
function startReload(e){const W=WPN[e.w];if(!W.mag||e.reload>0||(e.mag[e.sel]??W.mag)>=W.mag)return;e.reload=W.rel;if(e.local)sfx('reload')}
function fellTree(t,local){const i=trees.indexOf(t);if(i<0)return;DM.position.set(0,-999,0);DM.scale.setScalar(0);DM.updateMatrix();for(const [im,list] of world.treeParts){if(list===t.list){im.setMatrixAt(t.id,DM.matrix);im.instanceMatrix.needsUpdate=true}}trees.splice(i,1);debris(new THREE.Vector3(t.x,t.y+3,t.z),0x4e9a32,16);if(local&&room)room.send({t:'tree',x:Math.round(t.x),z:Math.round(t.z)})}
function hitEnt(by,tg,dmg,head){
 if(tg.remote||(tg.bot&&!isHost)){if(room)room.send({t:'hit',to:tg.id,dmg,by:by.id,bn:by.name,head})}
 else applyDmg(tg,dmg,by.id,by.name);
 if(by.local){const sh=tg.sh>0;dmgNum(new THREE.Vector3(tg.x,tg.y+1.9,tg.z),dmg,head,sh);hitMark(head);sfx(head?'head':sh?'hitsh':'hit')}}
function applyDmg(e,dmg,byId,byName){if(!e.alive)return;let d=dmg;const s=Math.min(e.sh,d);e.sh-=s;d-=s;e.hp-=d;e.heal=0;e.dance=0;
 if(e.local){$('dmgv').style.boxShadow=`inset 0 0 140px rgba(${s>0?'60,140,255':'255,0,0'},.6)`;setTimeout(()=>$('dmgv').style.boxShadow='inset 0 0 140px rgba(255,0,0,0)',180);sfx(s>0&&e.sh<=0?'shbreak':'hurt');shake=.25}
 if(e.bot&&byId){e.tgt=byId;e.hurtT=1.2;if(Math.random()<[.1,.35,.6][SET.diff]&&e.wood>=10)botBuild(e)}
 if(e.hp<=0)die(e,byId,byName)}
let dropN=0;
function die(e,byId,byName){if(!e.alive)return;e.alive=false;e.hp=0;e.deadT=0;e.glide=e.fall=false;
 const by=ents.get(byId);if(by)by.kills++;if(by&&by.local){kills++;elim('💀 '+e.name+' erledigt')}
 const place=[...ents.values()].filter(q=>q.alive).length+1;
 feed((byName?byName+' ➜ ':'🌪 ')+e.name+(byName?'':' (Sturm)'));
 if(e.local||(e.bot&&isHost)){const its=[];e.slots.forEach((s,i)=>{if(s&&s!=='pick')its.push({k:s,r:e.rar[i]||0})});if(e.med)its.push({k:'med',n:e.med});if(e.shieldN)its.push({k:'shield',n:e.shieldN});if(e.wood>0)its.push({k:'wood',n:e.wood});
  const L=its.map((it,i)=>({id:e.id+'#'+(++dropN),x:e.x+Math.cos(i*1.3)*1.4,y:e.y,z:e.z+Math.sin(i*1.3)*1.4,it}));L.forEach(l=>spawnLoot(null,l.x,l.y,l.z,l.it,l.id));if(room)room.send({t:'dead',id:e.id,by:byId,bn:byName,L})}
 if(e.local){myPlace=place;sfx('dead');scoped=false;setTimeout(()=>endScreen(false),2600)}
 checkWin()}
function checkWin(){if(ended||state!=='play')return;const alive=[...ents.values()].filter(e=>e.alive);if((alive.length<=1&&ents.size>1)||alive.length===0){ended=true;const w=alive[0];if(w){w.dance=99;if(w.local){myPlace=1;sfx('win');big('🏆 SIEG! #1',5);confetti();setTimeout(()=>endScreen(true),4500)}else if(!me||!me.alive)setTimeout(()=>endScreen(false),1500);feed('🏆 '+w.name+' gewinnt das Match!')}}}
function confetti(){for(let i=0;i<6;i++)setTimeout(()=>{if(me)sparkle(new THREE.Vector3(me.x,me.y+2.5,me.z),COLS[i*2%COLS.length],30)},i*300)}
/* ---------- Heilen & Aufheben ---------- */
function heal(e){if(e.heal>0||e.glide||e.fall)return;if(e.hp<100&&e.med>0){e.heal=3;e.healK='med'}else if(e.sh<100&&e.shieldN>0){e.heal=2;e.healK='shield'}else if(e.local)feed(e.med||e.shieldN?'Schon voll!':'Keine Heilung dabei')}
function finishHeal(e){if(e.healK==='med'&&e.med>0){e.med--;e.hp=Math.min(100,e.hp+50)}else if(e.healK==='shield'&&e.shieldN>0){e.shieldN--;e.sh=Math.min(100,e.sh+50)}if(e.local){sfx('heal');refreshSlots()}}
function pickup(e,l,local){const it=l.it;
 if(it.k==='med')e.med+=it.n||1;else if(it.k==='shield')e.shieldN+=it.n||1;else if(it.k==='wood')e.wood=Math.min(999,e.wood+(it.n||30));
 else{let i=e.slots.indexOf(null);if(i<0){i=e.sel||1;const old=e.slots[i];if(old)spawnLoot(null,e.x,e.y,e.z,{k:old,r:e.rar[i]||0},e.id+'#'+(++dropN))}
  e.slots[i]=it.k;e.rar[i]=it.r;e.mag[i]=WPN[it.k].mag;if(e.sel===0){e.sel=i;e.w=it.k}}
 removeLoot(l.id);if(local){sfx('pick');refreshSlots();if(room)room.send({t:'take',id:l.id});if(WPN[it.k])feed('✨ '+WPN[it.k].n+' ('+RAR[it.r].n+')')}}
function nearestLoot(e,R){let b=null,bd=R;for(const l of loot.values()){const d=Math.hypot(l.x-e.x,l.z-e.z)+Math.abs(l.y-e.y)*.5;if(d<bd){bd=d;b=l}}return b}
function nearestChest(e,R){let b=null,bd=R;for(const c of chests.values()){if(c.open)continue;const d=Math.hypot(c.x-e.x,c.z-e.z)+Math.abs(c.y-e.y)*.5;if(d<bd){bd=d;b=c}}return b}
function useAct(){if(!me||!me.alive)return;const c=nearestChest(me,2.6);if(c){openChest(c.id,true);return}const l=nearestLoot(me,2.4);if(l)pickup(me,l,true)}
function selSlot(i){if(!me||!me.slots[i])return;me.sel=i;me.w=me.slots[i];me.reload=0;scoped=false;refreshSlots();sfx('switch')}
function refreshSlots(){if(!me)return;$('slots').innerHTML=me.slots.map((s,i)=>{const W=s&&WPN[s],r=RAR[me.rar[i]||0].c;return`<div data-i="${i}" class="${i===me.sel?'sel':''}" style="${s&&s!=='pick'?'border-color:'+r+';box-shadow:inset 0 -12px 18px -10px '+r:''}">${W?`<img src="${weaponIcon(s,me.rar[i]||0)}" style="width:54px;height:31px;pointer-events:none">`:''}<small>${W?(W.mag?(me.mag[i]??W.mag)+'/'+W.mag:''):i+1}</small></div>`}).join('');
 $('res').textContent=`🪵 ${me.wood}   💊 ${me.med}   🧪 ${me.shieldN}`+(WPN[me.w]?'   ·   '+WPN[me.w].n+(me.w!=='pick'?' ('+RAR[me.rar[me.sel]||0].n+')':''):'')}
function refreshAmmo(){const s=$('slots').children[me.sel];if(s){const W=WPN[me.w];if(W.mag)s.lastChild.textContent=(me.mag[me.sel]??W.mag)+'/'+W.mag}}
$('slots').addEventListener('pointerdown',e=>{const d=e.target.closest('[data-i]');if(d){e.stopPropagation();selSlot(+d.dataset.i)}});
/* ---------- Bauen ---------- */
function buildFor(e,k){if(e.wood<10||e.glide||e.fall||e.inBus||!e.alive)return false;const fx=-Math.sin(e.yaw),fz=-Math.cos(e.yaw);let d;
 if(Math.abs(fx)>Math.abs(fz))d=fx>0?1:3;else d=fz>0?0:2;const dx=[0,1,0,-1][d],dz=[1,0,-1,0][d];
 let ix=Math.round(e.x/4),iz=Math.round(e.z/4);const iy=Math.floor((e.y+.3)/4);
 if(k!=='wall'){ix+=dx;iz+=dz}
 const ok=placeStruct(k,ix,iy,iz,d,e.local||(e.bot&&isHost));if(ok)e.wood-=10;if(e.local)refreshSlots();return ok}
function botBuild(e){const t=ents.get(e.tgt);if(t)e.yaw=Math.atan2(-(t.x-e.x),-(t.z-e.z));buildFor(e,'wall');if(Math.random()<.4)buildFor(e,'ramp')}
/* ===================== Bots ===================== */
function los(a,b){const o=new THREE.Vector3(a.x,a.y+1.6,a.z),d=new THREE.Vector3(b.x-a.x,b.y-a.y,b.z-a.z);const L=d.length();d.normalize();const h=castShot(o,d,L,a);return h.kind==='ent'&&h.ref===b}
function botThink(e,dt){
 e.think-=dt;e.hurtT=Math.max(0,(e.hurtT||0)-dt*.2);const st=storm;let mx=0,mz=0,jump=false;
 if(e.inBus){if(matchT>e.dropAt)dropFromBus(e);return{mx,mz,jump}}
 if(e.fall||e.glide){const d=Math.atan2(e.dest.x-e.x,e.dest.z-e.z);mx=Math.sin(d);mz=Math.cos(d);e.yaw=Math.atan2(-mx,-mz);return{mx,mz,jump:e.fall&&Math.hypot(e.dest.x-e.x,e.dest.z-e.z)<60}}
 if(e.think<=0){e.think=.4+Math.random()*.3;
  const armed=e.slots.some(s=>s&&s!=='pick'),early=matchT<BUS.dur+45,range=!armed?7:early?20:[45,65,85][SET.diff];let best=null,bd=range;
  for(const o of ents.values()){if(o===e||!o.alive||o.glide||o.fall||o.inBus)continue;const d=Math.hypot(o.x-e.x,o.z-e.z);const lim=o.id===e.tgt&&e.hurtT>0?90:bd;if(d<lim&&(o.id===e.tgt||Math.random()<(o.local||o.remote?.9:.55))){if(los(e,o)){bd=d;best=o}}}
  e.enemy=best?best.id:null;
  const guns=e.slots.map((s,i)=>s&&s!=='pick'?i:-1).filter(i=>i>=0);if(guns.length){let pick=guns[0];if(best){for(const i of guns){const k=e.slots[i];if(bd<12&&k==='shot')pick=i;else if(bd>60&&k==='snipe')pick=i;else if(k==='ar'&&e.slots[pick]!=='shot')pick=i}}e.sel=pick;e.w=e.slots[pick]}else{e.sel=0;e.w='pick'}
  const ds=Math.hypot(e.x-st.x,e.z-st.z);
  if(ds>st.r*.85||(st.next&&Math.hypot(e.x-st.next.x,e.z-st.next.z)>st.next.r*.9&&Math.random()<.5)){const tx=st.next?st.next.x:st.x,tz=st.next?st.next.z:st.z;e.dest={x:tx+(Math.random()-.5)*20,z:tz+(Math.random()-.5)*20}}
  else if(!guns.length||Math.random()<.5){const l=nearestLoot(e,50);const c=!l&&nearestChest(e,50);if(l)e.dest={x:l.x,z:l.z,loot:l.id};else if(c)e.dest={x:c.x,z:c.z,chest:c.id};else if(Math.hypot(e.dest.x-e.x,e.dest.z-e.z)<4){const a=Math.random()*TAU,r=Math.random()*st.r*.7;e.dest={x:st.x+Math.cos(a)*r,z:st.z+Math.sin(a)*r}}}
  if(e.hp<60&&e.med&&!best)heal(e);else if(e.sh<50&&e.shieldN&&!best)heal(e);
  if(!best&&e.wood<60&&Math.random()<.3){const t=trees.find(t=>Math.abs(t.x-e.x)<12&&Math.abs(t.z-e.z)<12);if(t)e.dest={x:t.x,z:t.z,tree:t}}}
 const en=e.enemy&&ents.get(e.enemy);
 if(en&&en.alive){const dx=en.x-e.x,dz=en.z-e.z,d=Math.hypot(dx,dz)||1;e.yaw=Math.atan2(-dx,-dz);const want=WPN[e.w].melee?1.5:e.w==='shot'?7:e.w==='snipe'?70:25;
  const st2=Math.sin(performance.now()/600+e.col)*.8;const f=d>want?1:d<want*.5?-1:0;mx=(dx/d)*f+(-dz/d)*st2;mz=(dz/d)*f+(dx/d)*st2;
  e.pitch=Math.atan2(en.y+1.2-(e.y+1.6),d);
  if(Math.random()<dt*[1.5,3,5][SET.diff]||WPN[e.w].auto){const err=e.aimErr*(1+d/80)*(en.vx||en.vz?1.4:1);const dir=new THREE.Vector3(dx+(Math.random()-.5)*err*d*2,en.y+1.2-(e.y+1.6)+(Math.random()-.5)*err*d*2,dz+(Math.random()-.5)*err*d*2).normalize();
   if(WPN[e.w].melee){if(d<2.6)fire(e)}else fire(e,dir)}
  if(Math.random()<dt*.4)jump=true}
 else{e.pitch=0;const dx=e.dest.x-e.x,dz=e.dest.z-e.z,d=Math.hypot(dx,dz);if(d>1.2){mx=dx/d;mz=dz/d;e.yaw=Math.atan2(-mx,-mz)}
  if(e.dest.tree&&d<2.4){e.sel=0;e.w='pick';e.yaw=Math.atan2(-dx,-dz);fire(e);mx=mz=0;if(!trees.includes(e.dest.tree))e.dest={x:e.x,z:e.z}}
  if(e.dest.loot){const l=loot.get(e.dest.loot);if(!l)e.dest.loot=null;else if(d<1.8){pickup(e,l,false);if(room)room.send({t:'take',id:l.id})}}
  if(e.dest.chest&&d<2.2){openChest(e.dest.chest,false);if(room)room.send({t:'chest',id:e.dest.chest});e.dest.chest=null}
  if(e.lastP&&Math.hypot(e.x-e.lastP.x,e.z-e.lastP.z)<dt*1.2&&d>2)jump=true;e.lastP={x:e.x,z:e.z}}
 return{mx,mz,jump}}
/* ===================== Eingabe ===================== */
const keys={};let look={yaw:0,pitch:-.1},firing=false,scoped=false,recoil=0,crossKick=0,shake=0,camInit=false;const joy={x:0,y:0,id:null};
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const k=e.key.toLowerCase();keys[k]=1;if(state!=='play'||!me||!me.alive)return;
 if(k===' '){e.preventDefault();if(me.inBus)dropFromBus(me)}
 if(k>='1'&&k<='5')selSlot(+k-1);if(k==='r')startReload(me);if(k==='e')useAct();if(k==='h')heal(me);if(k==='q')buildFor(me,'wall');if(k==='f')buildFor(me,'ramp');if(k==='c')buildFor(me,'floor');if(k==='b')emote()});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=0});
function emote(){if(!me||!me.alive||!me.onG||me.inBus)return;me.dance=me.dance>0?0:6;if(me.dance)sfx('dance')}
const cv=$('cv');
cv.addEventListener('mousedown',e=>{ac();if(state!=='play')return;if(document.pointerLockElement!==cv){cv.requestPointerLock&&cv.requestPointerLock();return}if(e.button===0)firing=true;if(e.button===2&&me&&WPN[me.w].zoom)scoped=!scoped});
addEventListener('mouseup',e=>{if(e.button===0)firing=false});cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('mousemove',e=>{if(document.pointerLockElement===cv){const s=scoped?.0007:.0023;look.yaw-=e.movementX*s;look.pitch=clamp(look.pitch-e.movementY*s,-1.3,1.2)}});
addEventListener('wheel',e=>{if(state==='play'&&me){let i=me.sel;for(let k=0;k<5;k++){i=(i+(e.deltaY>0?1:4))%5;if(me.slots[i])break}selSlot(i)}});
const tl={id:null,x:0,y:0};
addEventListener('pointerdown',e=>{if(!TOUCH||state!=='play'||e.pointerType==='mouse')return;ac();if(e.target===cv&&e.clientX>innerWidth*.35&&tl.id===null){tl.id=e.pointerId;tl.x=e.clientX;tl.y=e.clientY}});
addEventListener('pointermove',e=>{if(e.pointerId===tl.id){const s=scoped?.0016:.0055;look.yaw-=(e.clientX-tl.x)*s;look.pitch=clamp(look.pitch-(e.clientY-tl.y)*s,-1.3,1.2);tl.x=e.clientX;tl.y=e.clientY}});
const tlEnd=e=>{if(e.pointerId===tl.id)tl.id=null};addEventListener('pointerup',tlEnd);addEventListener('pointercancel',tlEnd);
const jz=$('joy'),kn=$('kn');function jm(e){const r=jz.getBoundingClientRect();let dx=(e.clientX-r.left-r.width/2)/(r.width/2),dy=(e.clientY-r.top-r.height/2)/(r.height/2);const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}joy.x=dx;joy.y=dy;kn.style.transform=`translate(${dx*44}px,${dy*44}px)`}
jz.addEventListener('pointerdown',e=>{e.stopPropagation();joy.id=e.pointerId;jz.setPointerCapture(e.pointerId);jm(e)});jz.addEventListener('pointermove',e=>{if(e.pointerId===joy.id)jm(e)});
const je=e=>{if(e.pointerId===joy.id){joy.id=null;joy.x=joy.y=0;kn.style.transform=''}};jz.addEventListener('pointerup',je);jz.addEventListener('pointercancel',je);
const tf=$('tFire');let tfp=null;tf.addEventListener('pointerdown',e=>{e.stopPropagation();ac();firing=true;tf.classList.add('on');tfp={id:e.pointerId,x:e.clientX,y:e.clientY};tf.setPointerCapture(e.pointerId)});
tf.addEventListener('pointermove',e=>{if(tfp&&e.pointerId===tfp.id){const s=scoped?.0016:.0045;look.yaw-=(e.clientX-tfp.x)*s;look.pitch=clamp(look.pitch-(e.clientY-tfp.y)*s,-1.3,1.2);tfp.x=e.clientX;tfp.y=e.clientY}});
const tfe=()=>{firing=false;tf.classList.remove('on');tfp=null};tf.addEventListener('pointerup',tfe);tf.addEventListener('pointercancel',tfe);
const tap=(id,f)=>$(id).addEventListener('pointerdown',e=>{e.stopPropagation();ac();if(state==='play'&&me&&me.alive)f();$(id).classList.add('on');setTimeout(()=>$(id).classList.remove('on'),120)});
tap('tWall',()=>buildFor(me,'wall'));tap('tRamp',()=>buildFor(me,'ramp'));tap('tFloor',()=>buildFor(me,'floor'));tap('tRel',()=>{if(WPN[me.w].zoom&&!scoped)scoped=true;else if(scoped)scoped=false;else startReload(me)});tap('tHeal',()=>heal(me));tap('tUse',useAct);tap('tEmote',emote);
$('tJump').addEventListener('pointerdown',e=>{e.stopPropagation();if(me&&me.inBus){dropFromBus(me);return}keys[' ']=1;setTimeout(()=>keys[' ']=0,150)});
$('bDrop').addEventListener('pointerdown',e=>{e.stopPropagation();ac();if(me)dropFromBus(me)});
$('tMenu').addEventListener('pointerdown',e=>{e.stopPropagation();if(confirmLeave())toMenu()});
function confirmLeave(){return !me||!me.alive||ended||window.confirm('Match verlassen?')}
/* ===================== Schleife ===================== */
let last=performance.now();
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;frameN++;const t=now/1000;
 stormMat.uniforms.t.value=t;if(water)water.material.map.offset.set(t*.004,t*.006);for(const a of anims)a(dt,t);
 if(state==='play'||state==='end'){matchT+=dt;storm=stormAt(matchT);
  stormMesh.position.set(storm.x,0,storm.z);stormMesh.scale.set(Math.max(.1,storm.r),1,Math.max(.1,storm.r));
  if(matchT<BUS.dur+4){busPos(matchT,bus.position);bus.rotation.y=Math.atan2(BUS.cx,BUS.cz);bus.userData.fl.scale.setScalar(.8+Math.random()*.4);bus.visible=true}else bus.visible=false;
  if(matchT>BUS.dur)for(const e of ents.values())if(e.inBus&&(e.local||(e.bot&&isHost)))dropFromBus(e);
  if(me&&me.alive){let ix=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joy.x,iz=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+joy.y;const l=Math.hypot(ix,iz);if(l>1){ix/=l;iz/=l}
   const cy=Math.cos(look.yaw),sy=Math.sin(look.yaw),mx=ix*cy+iz*sy,mz=-ix*sy+iz*cy;
   if(me.inBus){busPos(matchT,_v1);me.x=_v1.x;me.y=_v1.y;me.z=_v1.z}else{me.yaw=me.glide||me.fall?(l>.1?Math.atan2(-mx,-mz):me.yaw):look.yaw;me.pitch=look.pitch;if(l>.1||firing)me.dance=0;physics(me,mx,mz,keys[' '],dt)}
   if(firing&&(WPN[me.w].auto||me.cd<=0)){fire(me);if(!WPN[me.w].auto&&!TOUCH)firing=false}
   const l2=!me.glide&&!me.fall&&!me.inBus&&(nearestChest(me,2.6)||nearestLoot(me,2.4));const pr=$('prompt');if(l2){pr.style.display='block';pr.textContent=l2.items?'✋ E: Kiste öffnen':'✋ E: '+itemName(l2.it);pr.onclick=useAct}else pr.style.display='none';
   if(TOUCH&&l2&&l2.it&&['wood','med','shield'].includes(l2.it.k))useAct()}
  for(const e of ents.values()){
   if(!e.alive){e.deadT+=dt;animChar(e,dt,false);continue}
   e.cd=Math.max(0,e.cd-dt);e.swing=Math.max(0,e.swing-dt);e.kickT=Math.max(0,e.kickT-dt);e.dance=Math.max(0,e.dance-dt);
   if(e.reload>0){e.reload-=dt;if(e.reload<=0){e.mag[e.sel]=WPN[e.w].mag;if(e.local)refreshAmmo()}}
   if(e.heal>0){e.heal-=dt;if(e.heal<=0)finishHeal(e)}
   if(e.bot&&isHost){const c=botThink(e,dt);if(e.inBus){busPos(matchT,_v1);e.x=_v1.x;e.y=_v1.y;e.z=_v1.z}else physics(e,c.mx,c.mz,c.jump,dt)}
   if(e.remote||(e.bot&&!isHost)){const k=Math.min(1,dt*10);if(e.tx!==undefined){e.x+=(e.tx-e.x)*k;e.y+=(e.ty-e.y)*k;e.z+=(e.tz-e.z)*k;let d=e.tyaw-e.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));e.yaw+=d*k;e.vx=(e.tx-e.x)*4;e.vz=(e.tz-e.z)*4;e.onG=!e.glide&&!e.fall&&Math.abs(e.y-groundAt(e.x,e.z,e.y))<.3}}
   if((e.local||(e.bot&&isHost))&&!e.glide&&!e.fall&&!e.inBus&&Math.hypot(e.x-storm.x,e.z-storm.z)>storm.r){e.stT=(e.stT||0)+dt;if(e.stT>=1){e.stT=0;e.hp-=storm.dmg;if(e.local){sfx('storm');shake=.1}if(e.hp<=0)die(e,null,null)}}
   if(e.y<-30&&e.alive&&(e.local||(e.bot&&isHost)))die(e,null,null);
   const far=Math.hypot(e.x-camera.position.x,e.z-camera.position.z)>70;animChar(e,dt,far&&!e.local)}
  for(const s of structs.values()){if(s.grow<1){s.grow=Math.min(1,s.grow+dt*6);s.mesh.scale.setScalar(.2+.8*smooth(s.grow))}if(s.shake>0){s.shake-=dt;s.mesh.position.x=s.px+(s.shake>0?(Math.random()-.5)*.06:0)}}
  for(const c of chests.values()){if(c.open){if(c.openT<1){c.openT=Math.min(1,c.openT+dt*3);c.lid.rotation.x=-c.openT*1.9}}else c.glow.scale.setScalar(1+.15*Math.sin(t*4+c.x))}
  if(room){netT-=dt;if(netT<=0){netT=.066;
   if(me&&me.alive)room.send({t:'s',p:[+me.x.toFixed(2),+me.y.toFixed(2),+me.z.toFixed(2),+me.yaw.toFixed(2),+me.pitch.toFixed(2)],hp:Math.round(me.hp),sh:Math.round(me.sh),w:me.w,ra:me.rar[me.sel]||0,g:me.glide?1:me.fall?2:me.inBus?3:0,sw:me.swing>0?1:0,dn:me.dance>0?1:0});
   if(isHost&&ents.size)room.send({t:'B',L:[...ents.values()].filter(e=>e.bot&&e.alive).map(e=>[e.id,+e.x.toFixed(1),+e.y.toFixed(1),+e.z.toFixed(1),+e.yaw.toFixed(2),e.w,e.glide?1:e.fall?2:e.inBus?3:0,Math.round(e.hp),Math.round(e.sh),e.rar[e.sel]||0,+(e.pitch||0).toFixed(2),e.swing>0?1:0]),T:+matchT.toFixed(1)})}}
  camUpdate(dt);hud();tickFx(dt);
  for(const l of loot.values()){l.m.rotation.y+=dt*1.6;l.m.position.y=.55+Math.sin(t*2.5+l.x)*.12}}
 else{const a=t*.05;camera.position.set(Math.sin(a)*330,110,Math.cos(a)*330);camera.lookAt(0,10,0);sun.position.set(120,220,80);sun.target.position.set(0,0,0)}
 sky.position.copy(camera.position);
 if(!NORENDER)renderer.render(scene,camera)}
const NORENDER=/norender/.test(location.search);
function itemName(it){if(it.k==='med')return'Medikit 💊';if(it.k==='shield')return'Schild-Trank 🧪';if(it.k==='wood')return'Holz 🪵';return WPN[it.k].n+' ('+RAR[it.r].n+')'}
let camOverride=null;function camUpdate(dt){if(camOverride){camera.position.copy(camOverride.p);camera.lookAt(camOverride.l);return}let t=me&&me.alive?me:spect&&ents.get(spect)||null;if(!t||(!t.alive&&t!==me)){const al=[...ents.values()].filter(e=>e.alive&&!e.inBus);if(al.length){spect=al[0].id;t=al[0]}else t=me}
 if(!t)return;recoil=Math.max(0,recoil-dt*.6);crossKick=Math.max(0,crossKick-dt*6);
 const yaw=t===me?look.yaw:t.yaw,pitch=(t===me?look.pitch:t.pitch||0)+recoil;
 if(t.inBus){busPos(matchT,_v1);const d=48,pp=clamp(pitch-.35,-1.2,.3);tmp.set(_v1.x+Math.sin(yaw)*d*Math.cos(pp),_v1.y+6-Math.sin(pp)*d,_v1.z+Math.cos(yaw)*d*Math.cos(pp));camera.position.lerp(tmp,camInit?Math.min(1,dt*5):1);camInit=true;camera.lookAt(_v1.x,_v1.y+4,_v1.z);camDir.set(-Math.sin(yaw),0,-Math.cos(yaw));setFov(70);sun.position.set(_v1.x+120,_v1.y+220,_v1.z+80);sun.target.position.copy(_v1);$('cross').style.display='none';return}
 const dist=scoped?0:t.glide?8:t.fall?7:3.9,side=scoped?0:t.glide||t.fall?0:1.05,up=scoped?1.62:t.glide?3.2:2.05;
 const fx=-Math.sin(yaw)*Math.cos(pitch),fy=Math.sin(pitch),fz=-Math.cos(yaw)*Math.cos(pitch);camDir.set(fx,fy,fz).normalize();
 const rx=Math.cos(yaw),rz=-Math.sin(yaw);
 tmp.set(t.x+rx*side-fx*dist,t.y+up-fy*dist,t.z+rz*side-fz*dist);
 if(dist>0){const o=new THREE.Vector3(t.x+rx*side*.5,t.y+up,t.z+rz*side*.5),d=tmp.clone().sub(o),L=d.length();d.normalize();let mn=L;for(const b of boxes){if(b.max.x<t.x-12||b.min.x>t.x+12||b.max.z<t.z-12||b.min.z>t.z+12)continue;const q=rayBox(o,d,b,L);if(q!==null&&q<mn)mn=q}if(mn<L)tmp.copy(o).addScaledVector(d,Math.max(.3,mn-.25))}
 const gy=H(tmp.x,tmp.z)+.4;if(tmp.y<gy)tmp.y=gy;
 camera.position.lerp(tmp,camInit?Math.min(1,dt*(t.fall||t.glide?6:20)):1);camInit=true;
 if(shake>0){shake-=dt;camera.position.x+=(Math.random()-.5)*shake*.5;camera.position.y+=(Math.random()-.5)*shake*.5}
 camera.lookAt(camera.position.x+fx*10,camera.position.y+fy*10,camera.position.z+fz*10);
 setFov(scoped?20:t.fall?84:70+(Math.hypot(t.vx,t.vz)>5?3:0));
 $('scope').style.display=scoped?'block':'none';if(me&&scoped){me.m.root.visible=false;if(me.wpn)me.wpn.visible=false}
 sun.position.set(t.x+120,t.y+220,t.z+80);sun.target.position.set(t.x,t.y,t.z);
 $('cross').style.transform=`scale(${1+crossKick*.6+(t.onG?0:.4)})`;$('cross').style.display=t.glide||t.fall||scoped||t!==me?'none':'block'}
function setFov(f){if(Math.abs(camera.fov-f)>.05){camera.fov+=(f-camera.fov)*.15;camera.updateProjectionMatrix()}}
let hudT=0;function hud(){hudT-=1;if(hudT>0)return;hudT=4;
 const al=[...ents.values()].filter(e=>e.alive).length;$('iAlive').textContent='👥 '+al;$('iKills').textContent='💀 '+kills;
 const s=storm;$('iStorm').textContent=(s.shrinking?'🌪 Sturm zieht zu ':'🌪 Sturm in ')+Math.max(0,Math.ceil(s.left))+'s';
 const t=me&&me.alive?me:null;if(t){$('bHp').firstChild.style.width=t.hp+'%';$('bHp').lastChild.textContent='❤ '+Math.ceil(t.hp)+(t.heal>0&&t.healK==='med'?'  …heilt':'');$('bSh').firstChild.style.width=t.sh+'%';$('bSh').lastChild.textContent='🛡 '+Math.ceil(t.sh)+(t.heal>0&&t.healK==='shield'?'  …lädt':'');
  $('storm').style.display=!t.glide&&!t.inBus&&Math.hypot(t.x-s.x,t.z-s.z)>s.r?'block':'none';$('msg').textContent=t.inBus?'':t.reload>0?'Nachladen …':t.fall?'⤓ Sturzflug – Leertaste/⤒ öffnet den Gleiter':t.glide?'🪂 Gleiten':'';
  $('busUI').style.display=t.inBus?'block':'none'}else $('busUI').style.display='none';
 compass();drawMini()}
function compass(){const yaw=me&&me.alive?look.yaw:0,deg=((-yaw*180/PI)%360+360)%360,W=$('compass').clientWidth||300;let h='';const marks=[[0,'N'],[45,'NO'],[90,'O'],[135,'SO'],[180,'S'],[225,'SW'],[270,'W'],[315,'NW']];
 for(const [a,n] of marks)for(const off of[-360,0,360]){const x=(a+off-deg)*2.4+W/2;if(x>-20&&x<W+20)h+=`<span style="position:absolute;left:${(x-14)|0}px;width:28px;text-align:center;color:${n.length===1?'#ffd23f':'#fff'}">${n}</span>`}
 $('compIn').innerHTML=h}
const miniBg=document.createElement('canvas');miniBg.width=miniBg.height=300;let miniFor=-1;
function drawMini(){const c=$('mini'),x=c.getContext('2d'),S=300,k=S/(ISL*2.3),o=S/2;
 if(miniFor!==seed){miniFor=seed;const b=miniBg.getContext('2d'),img=b.createImageData(S,S);for(let py=0;py<S;py++)for(let px=0;px<S;px++){const X=(px-o)/k,Z=(py-o)/k,y=H(X,Z),i=(py*S+px)*4;const cc=y<-.4?[47,140,210]:y<.8?[230,210,160]:y>26?[160,160,150]:y>19?[120,145,85]:[90+y*2,165,70];img.data[i]=cc[0];img.data[i+1]=cc[1];img.data[i+2]=cc[2];img.data[i+3]=255}b.putImageData(img,0,0);b.font='bold 12px sans-serif';b.textAlign='center';for(const q of POI){b.fillStyle='rgba(0,0,0,.65)';b.fillText(q.name,o+q.x*k+1,o+q.z*k+1);b.fillStyle='#fff';b.fillText(q.name,o+q.x*k,o+q.z*k)}}
 x.drawImage(miniBg,0,0);
 const s=storm;x.fillStyle='rgba(120,40,200,.35)';x.beginPath();x.rect(0,0,S,S);x.arc(o+s.x*k,o+s.z*k,Math.max(1,s.r*k),0,TAU,true);x.fill('evenodd');x.strokeStyle='#c070ff';x.lineWidth=3;x.beginPath();x.arc(o+s.x*k,o+s.z*k,Math.max(1,s.r*k),0,TAU);x.stroke();
 if(s.next){x.strokeStyle='#fff';x.lineWidth=2;x.setLineDash([6,5]);x.beginPath();x.arc(o+s.next.x*k,o+s.next.z*k,Math.max(1,s.next.r*k),0,TAU);x.stroke();x.setLineDash([])}
 if(matchT<BUS.dur){x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=2;x.beginPath();x.moveTo(o-BUS.cx*ISL*1.15*k,o-BUS.cz*ISL*1.15*k);x.lineTo(o+BUS.cx*ISL*1.15*k,o+BUS.cz*ISL*1.15*k);x.stroke();busPos(matchT,_v1);x.font='20px sans-serif';x.textAlign='center';x.fillText('🎈',o+_v1.x*k,o+_v1.z*k+7)}
 for(const e of ents.values()){if(!e.alive||e.inBus)continue;if(e.local){x.save();x.translate(o+e.x*k,o+e.z*k);x.rotate(-e.yaw);x.fillStyle='#ffd23f';x.strokeStyle='#000';x.lineWidth=2;x.beginPath();x.moveTo(0,-10);x.lineTo(7,7);x.lineTo(-7,7);x.closePath();x.fill();x.stroke();x.restore()}else if(e.remote){x.fillStyle='#38e1ff';x.beginPath();x.arc(o+e.x*k,o+e.z*k,5,0,TAU);x.fill()}}}
let hmT=null;function hitMark(head){const h=$('hitm');h.style.opacity=1;h.querySelectorAll('i').forEach(i=>i.style.background=head?'#ffd23f':'#fff');clearTimeout(hmT);hmT=setTimeout(()=>h.style.opacity=0,130)}
let bigT=null;function big(t,s){const b=$('big');b.textContent=t;b.classList.toggle('on',!!t);clearTimeout(bigT);if(s)bigT=setTimeout(()=>b.classList.remove('on'),s*1000)}
let elT=null;function elim(t){const e=$('elim');e.textContent=t;e.style.opacity=1;clearTimeout(elT);elT=setTimeout(()=>e.style.opacity=0,2200);sfx('elim')}
function feed(t){const d=document.createElement('div');d.textContent=t;$('feed').prepend(d);setTimeout(()=>d.remove(),6000);while($('feed').children.length>6)$('feed').lastChild.remove()}
/* ===================== Menü / Online ===================== */
function show(id){for(const s of['menu','lobby','end'])$(s).style.display=s===id?'flex':'none';if(id){$('hud').style.display='none';$('touch').style.display='none';if(document.exitPointerLock)document.exitPointerLock()}}
function soloPlayers(){const ps=[{id:SH_UID,name:myName(),col:myCol}];for(let i=0;i<SET.bots;i++)ps.push({id:'bot'+i,name:BOTN[i%BOTN.length],col:(i+1+myCol)%COLS.length,bot:true});return ps}
$('bSolo').onclick=()=>{ac();room=null;isHost=true;lastPlayers=soloPlayers();startMatch(lastPlayers,{},Math.floor(Math.random()*1e9))};
$('bCreate').onclick=async()=>{ac();$('err').textContent='Erstelle Raum …';try{room=await Room.create('royale',{name:myName(),col:myCol},16)}catch(e){$('err').textContent='Online geht gerade nicht.';return}isHost=true;$('myCode').textContent=room.code;wire();lobby()};
$('bJoin').onclick=async()=>{ac();const code=$('code').value.trim().toUpperCase();if(code.length!==4){$('err').textContent='Bitte 4-stelligen Code eingeben.';return}$('err').textContent='Verbinde …';try{room=await Room.join('royale',code,{name:myName(),col:myCol})}catch(e){$('err').textContent=e.message||'Raum nicht gefunden';room=null;return}isHost=false;$('myCode').textContent=room.code;wire();lobby()};
function lobby(){show('lobby');$('plist').innerHTML=room.peers.map(p=>`<div>🎈 ${String(p.name).replace(/</g,'')}${p.id===SH_UID?' (du)':''}</div>`).join('');$('bGo').style.display=isHost?'':'none';$('lobTxt').textContent=isHost?`Bots füllen auf (${SET.bots} Bots, Stärke ${['Leicht','Mittel','Profi'][SET.diff]}).`:'Warte auf den Start durch den Gastgeber …'}
function hostStart(){const ps=room.peers.map((p,i)=>({id:p.id,name:p.name,col:(p.col??i)%COLS.length}));for(let i=0;i<SET.bots;i++)ps.push({id:'bot'+i,name:BOTN[i%BOTN.length],col:(i+ps.length)%COLS.length,bot:true});const sd=Math.floor(Math.random()*1e9);lastPlayers=ps;room.send({t:'go',ps,set:{bots:SET.bots,diff:SET.diff,storm:SET.storm},seed:sd});startMatch(ps,{},sd)}
$('bGo').onclick=hostStart;
function wire(){
 room.on('peers',()=>{if($('lobby').style.display!=='none')lobby()});
 room.on('msg',(m,from)=>{
  if(m.t==='go'){lastPlayers=m.ps;startMatch(m.ps,{bots:m.set.bots|0,diff:clamp(m.set.diff|0,0,2),storm:clamp(m.set.storm|0,0,2)},m.seed|0);return}
  if(state!=='play'&&state!=='end')return;
  if(m.t==='s'){const e=ents.get(from);if(!e||!e.alive)return;[e.tx,e.ty,e.tz,e.tyaw,e.pitch]=m.p;e.glide=m.g===1;e.fall=m.g===2;e.inBus=m.g===3;if(Math.hypot(e.tx-e.x,e.tz-e.z)>30||e.inBus){e.x=e.tx;e.y=e.ty;e.z=e.tz}e.hp=m.hp;e.sh=m.sh;e.w=WPN[m.w]?m.w:'pick';e.rar[e.sel]=clamp(m.ra|0,0,4);if(m.sw&&e.swing<=0)e.swing=.45;e.dance=m.dn?1:0}
  else if(m.t==='B'&&!isHost){for(const b of m.L){const e=ents.get(b[0]);if(!e||!e.alive)continue;e.tx=b[1];e.ty=b[2];e.tz=b[3];e.tyaw=b[4];e.w=WPN[b[5]]?b[5]:'pick';e.glide=b[6]===1;e.fall=b[6]===2;e.inBus=b[6]===3;e.hp=b[7];e.sh=b[8];e.rar[e.sel]=clamp(b[9]|0,0,4);e.pitch=b[10]||0;if(b[11]&&e.swing<=0)e.swing=.45;if(Math.hypot(e.tx-e.x,e.tz-e.z)>30||e.inBus){e.x=e.tx;e.y=e.ty;e.z=e.tz}}if(Math.abs(m.T-matchT)>2)matchT=m.T}
  else if(m.t==='tr'){const e=ents.get(m.id);if(e&&!e.local&&!(e.bot&&isHost)&&Array.isArray(m.a)){e.kickT=.08;const a=new THREE.Vector3(+m.a[0],+m.a[1],+m.a[2]),d=new THREE.Vector3(-Math.sin(e.yaw),Math.sin(e.pitch||0),-Math.cos(e.yaw)).normalize();const h=castShot(a,d,WPN[m.w]&&WPN[m.w].rng||60,e);tracer(a,h.p);muzzle(a,.8);if(me&&Math.hypot(e.x-me.x,e.z-me.z)<90)sfx(m.w,.35)}}
  else if(m.t==='hit'){const e=ents.get(m.to);if(!e)return;if(e.local||(e.bot&&isHost))applyDmg(e,clamp(m.dmg|0,0,250),m.by,String(m.bn||'').slice(0,14))}
  else if(m.t==='dead'){const e=ents.get(m.id);if(e&&e.alive){if(Array.isArray(m.L))m.L.slice(0,12).forEach(l=>{if(l&&l.it&&(WPN[l.it.k]||['med','shield','wood'].includes(l.it.k)))spawnLoot(null,+l.x,+l.y,+l.z,{k:l.it.k,r:clamp(l.it.r|0,0,4),n:Math.min(999,l.it.n|0)},String(l.id))});die(e,m.by,m.bn)}}
  else if(m.t==='take')removeLoot(m.id);
  else if(m.t==='chest')openChest(m.id,false);
  else if(m.t==='build'&&['wall','floor','ramp'].includes(m.k))placeStruct(m.k,m.ix|0,m.iy|0,m.iz|0,m.d&3,false);
  else if(m.t==='sdmg')damageStruct(m.key,+m.dmg||0,false);
  else if(m.t==='tree'){const t=trees.find(t=>Math.round(t.x)===m.x&&Math.round(t.z)===m.z);if(t)fellTree(t,false)}
 });
 room.on('leave',id=>{const e=ents.get(id);if(e&&e.alive){die(e,null,null);feed('👋 '+e.name+' hat verlassen')}if($('lobby').style.display!=='none')lobby()});
 room.on('close',()=>{feed('❌ Verbindung zum Gastgeber getrennt');room=null;isHost=true})}
$('bLobLeave').onclick=()=>{if(room)room.leave();room=null;show('menu')};
function endScreen(win){if(state!=='play')return;state='end';
 $('endT').textContent=win?'🏆 SIEG!':'#'+myPlace;$('endS').textContent=win?'Du bist der letzte Überlebende!':'Platz '+myPlace+' von '+ents.size;
 const L=[...ents.values()].sort((a,b)=>b.kills-a.kills).slice(0,8);$('endTab').innerHTML='<tr><td><b>Spieler</b></td><td><b>Erledigt</b></td></tr>'+L.map(e=>`<tr><td>${e.bot?'🤖 ':''}${String(e.name).replace(/</g,'')}${e.local?' (du)':''}${e.alive?' 🟢':''}</td><td>${e.kills}</td></tr>`).join('');
 store.set('br_wins',store.get('br_wins',0)+(win?1:0));
 show('end');$('bAgain').style.display=!room||isHost?'':'none';$('bSpec').style.display=win?'none':''}
$('bSpec').onclick=()=>{state='play';show(null);$('hud').style.display='block';feed('👀 Zuschauen – ☰ für Menü')};
$('bAgain').onclick=()=>{if(room&&isHost)hostStart();else{lastPlayers=soloPlayers();startMatch(lastPlayers,{},Math.floor(Math.random()*1e9))}};
function toMenu(){if(room)room.leave();room=null;state='menu';clearEnts();me=null;bus.visible=false;show('menu')}
$('bEndMenu').onclick=toMenu;
addEventListener('keydown',e=>{if(e.key==='Escape'&&state==='play'&&!document.pointerLockElement&&!TOUCH&&confirmLeave())toMenu()});
/* ===================== Klang ===================== */
let AC=null;function ac(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}return AC}
let nbuf=null;function noise(d,v,f){const a=AC;if(!a)return;if(!nbuf){nbuf=a.createBuffer(1,a.sampleRate,a.sampleRate);const c=nbuf.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=Math.random()*2-1}const s=a.createBufferSource(),g=a.createGain(),fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.value=f;s.buffer=nbuf;g.gain.setValueAtTime(v,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+d);s.connect(fl);fl.connect(g);g.connect(a.destination);s.start();s.stop(a.currentTime+d)}
function tone(f,d,v,type='square',at=0,f2){const a=AC;if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,a.currentTime+at);if(f2)o.frequency.exponentialRampToValueAtTime(f2,a.currentTime+at+d);g.gain.setValueAtTime(v,a.currentTime+at);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+at+d);o.connect(g);g.connect(a.destination);o.start(a.currentTime+at);o.stop(a.currentTime+at+d)}
function sfx(k,vol=1){if(!AC)return;switch(k){case'pistol':noise(.18,.45*vol,2600);tone(180,.08,.12*vol,'square',0,60);break;case'smg':noise(.09,.32*vol,3200);break;case'ar':noise(.14,.4*vol,2200);tone(120,.07,.1*vol,'square',0,50);break;case'shot':noise(.45,.7*vol,1400);tone(80,.2,.2*vol,'sawtooth',0,40);break;case'snipe':noise(.8,.65*vol,1100);tone(70,.5,.2*vol,'sawtooth',0,30);break;
 case'hit':tone(1500,.05,.08);break;case'hitsh':tone(2200,.05,.07,'triangle');break;case'head':tone(1900,.08,.1);tone(2800,.1,.08,'triangle',.04);break;case'hurt':tone(160,.15,.12,'sawtooth');break;case'shbreak':noise(.4,.35,5000);tone(1200,.3,.08,'triangle',0,300);break;case'chop':noise(.12,.35,900);tone(220,.06,.08,'square');break;case'clang':tone(900,.12,.06,'triangle');break;case'swing':noise(.12,.12,700);break;
 case'build':tone(260,.07,.1);noise(.08,.2,1500);tone(390,.07,.08,'square',.05);break;case'pick':tone(880,.07,.06,'triangle');tone(1320,.07,.05,'triangle',.05);break;case'switch':noise(.05,.15,4000);break;case'chest':[523,659,784,1046,1318].forEach((f,i)=>tone(f,.25,.07,'triangle',i*.07));break;case'reload':tone(500,.05,.05);noise(.05,.2,3000);tone(700,.05,.05,'square',.4);break;
 case'heal':tone(660,.3,.08,'sine');tone(990,.3,.06,'sine',.1);break;case'storm':tone(110,.25,.06,'sawtooth');break;case'land':noise(.25,.35,500);break;case'jump':noise(.08,.1,800);break;case'glide':noise(.5,.2,600);tone(300,.3,.05,'sine',0,600);break;case'jumpbus':noise(.6,.25,900);break;
 case'dead':tone(220,.6,.15,'sawtooth',0,60);break;case'elim':tone(880,.1,.1,'square');tone(1320,.18,.1,'square',.08);break;case'dance':[523,659,784].forEach((f,i)=>tone(f,.15,.06,'triangle',i*.15));break;case'win':[523,659,784,1046,1318,1568].forEach((f,i)=>tone(f,.4,.1,'triangle',i*.12));break}}
const qc=new URLSearchParams(location.search).get('code');if(qc)$('code').value=qc.toUpperCase();
/* ===================== Start ===================== */
applyGfx();
function boot(){$('loadTxt').textContent='Baue die Insel …';setTimeout(()=>{try{buildWorld(4242);makeStorm(4242);applyGfx()}catch(err){console.error(err)}$('load').style.display='none';state='menu';show('menu')},30)}
new THREE.GLTFLoader().load('assets/robot.glb',g=>{ROBOT=g;const b=new THREE.Box3().setFromObject(g.scene);ROBOT_H=(b.max.y-b.min.y)||1;$('loadBar').style.width='100%';boot()},x=>{if(x.total)$('loadBar').style.width=(x.loaded/x.total*90)+'%'},err=>{console.warn('Figur nicht geladen',err);boot()});
requestAnimationFrame(loop);
window.BR={setCam:(p,l)=>{camOverride=p?{p:new THREE.Vector3(...p),l:new THREE.Vector3(...l)}:null},get POI(){return POI},groundAt:(x,z)=>groundAt(x,z,200),camera,get me(){return me},get ents(){return ents},get state(){return state},get storm(){return storm},look,fire:()=>fire(me),buildFor:k=>buildFor(me,k),useAct,get loot(){return loot},get structs(){return structs},setFiring:v=>firing=v,keys,joy,drop:()=>me&&dropFromBus(me),get matchT(){return matchT},set matchT(v){matchT=v},SET,emote};
