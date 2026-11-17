'use strict';
/* ---------- Core: helpers, renderer, shared assets ---------- */
const $=id=>document.getElementById(id);
const TAU=Math.PI*2,PI=Math.PI,clamp=(v,a,b)=>v<a?a:v>b?b:v,rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
function adiff(a,b){let d=(a-b)%TAU;if(d>PI)d-=TAU;if(d<-PI)d+=TAU;return d;}
function hash(i,j){let h=(Math.imul(i,374761393)+Math.imul(j,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function fatal(msg){document.body.insertAdjacentHTML('beforeend','<div id="err">'+msg+'</div>');throw new Error(msg);}
if(!window.THREE)fatal('3D-Engine konnte nicht geladen werden. Lade die Seite neu.');
const MOBILE=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
const cv=$('game'),mm=$('mm'),mx=mm.getContext('2d');
let W=innerWidth,H=innerHeight,renderer;
try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});}
catch(e){fatal('Dein Gerät unterstützt kein WebGL.');}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,MOBILE?1.25:1.5));
const scene=new THREE.Scene(),FOG=0x0b0d18;
scene.background=new THREE.Color(FOG);scene.fog=new THREE.Fog(FOG,320,1120);
const camera=new THREE.PerspectiveCamera(68,1,2,2600);
let baseFov=68;
function resize(){W=innerWidth;H=innerHeight;renderer.setSize(W,H,false);camera.aspect=W/H;baseFov=W<H?78:64;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
scene.add(new THREE.HemisphereLight(0x5a6a9a,0x1a1214,.85));
const moon=new THREE.DirectionalLight(0x8a9ad0,.5);moon.position.set(-.5,1,-.3);scene.add(moon);
const tmpV=new THREE.Vector3();

/* ---------- Textures ---------- */
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c);}
const radial=stops=>canvasTex(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);stops.forEach(s=>r.addColorStop(s[0],s[1]));g.fillStyle=r;g.fillRect(0,0,64,64);});
const glowTex=radial([[0,'rgba(255,255,255,1)'],[.35,'rgba(255,255,255,.4)'],[1,'rgba(255,255,255,0)']]);
const smokeTex=radial([[0,'rgba(255,255,255,.9)'],[.6,'rgba(255,255,255,.35)'],[1,'rgba(255,255,255,0)']]);
const shadowTex=radial([[0,'rgba(0,0,0,.8)'],[.6,'rgba(0,0,0,.5)'],[1,'rgba(0,0,0,0)']]);
const dashTex=canvasTex(8,64,g=>{g.clearRect(0,0,8,64);g.fillStyle='#fff';g.fillRect(0,0,8,32);});
dashTex.wrapS=dashTex.wrapT=THREE.RepeatWrapping;
const WINC=['#ffd890','#fff2c8','#9ad0ff','#ffb070','#ffe9b0'];
const winMats=['#1c2030','#221c2a','#18242a','#2a201c','#1d1d24'].map(base=>{
  const t=canvasTex(128,128,g=>{g.fillStyle=base;g.fillRect(0,0,128,128);
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){const lit=Math.random()<.42;g.fillStyle=lit?WINC[Math.floor(Math.random()*WINC.length)]:'#07080c';g.fillRect(c*32+6,r*32+9,20,15);
      g.fillStyle='rgba(255,255,255,.08)';g.fillRect(c*32+4,r*32+24,24,2);}
    g.fillStyle='rgba(0,0,0,.25)';for(let r=0;r<4;r++)g.fillRect(0,r*32+28,128,3);});
  t.wrapS=t.wrapT=THREE.RepeatWrapping;
  return new THREE.MeshLambertMaterial({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.8});
});
function floorTex(kind){
  const t=canvasTex(128,128,g=>{
    if(kind==='tile'){g.fillStyle='#d9d4c6';g.fillRect(0,0,128,128);g.fillStyle='#c2bdae';g.fillRect(0,0,64,64);g.fillRect(64,64,64,64);g.strokeStyle='rgba(0,0,0,.14)';g.lineWidth=2;for(const o of [0,64]){g.strokeRect(o,0,64,64);g.strokeRect(o,64,64,64);}}
    else if(kind==='wood'){g.fillStyle='#7a5a3a';g.fillRect(0,0,128,128);for(let r=0;r<8;r++){g.fillStyle=r%2?'#6e5034':'#83613f';g.fillRect(0,r*16,128,15);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(((r*37)%128),r*16,2,15);}}
    else if(kind==='shiny'){g.fillStyle='#e8e8ee';g.fillRect(0,0,128,128);g.strokeStyle='rgba(0,0,0,.08)';g.lineWidth=2;g.strokeRect(0,0,128,128);}
    else{g.fillStyle='#4a4d55';g.fillRect(0,0,128,128);for(let k=0;k<200;k++){g.fillStyle=`rgba(0,0,0,${Math.random()*.15})`;g.fillRect(Math.random()*128,Math.random()*128,3,3);}g.strokeStyle='rgba(255,210,58,.5)';g.lineWidth=4;g.strokeRect(4,4,120,120);}
  });
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6,6);
  return new THREE.MeshLambertMaterial({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:kind==='concrete'?.25:.42});
}

/* ---------- Materials ---------- */
const MC={};
const lamb=c=>MC['l'+c]||(MC['l'+c]=new THREE.MeshLambertMaterial({color:c}));
const phong=c=>MC['p'+c]||(MC['p'+c]=new THREE.MeshPhongMaterial({color:c,shininess:90,specular:0x555566}));
const gphong=c=>MC['g'+c]||(MC['g'+c]=new THREE.MeshPhongMaterial({color:c,shininess:8,specular:0x111111}));
const basic=c=>MC['b'+c]||(MC['b'+c]=new THREE.MeshBasicMaterial({color:c}));
const glass=new THREE.MeshPhongMaterial({color:0x0a0c14,shininess:150,specular:0x8899bb});
const tire=lamb('#0c0c10');
const dashMat=new THREE.MeshBasicMaterial({map:dashTex,color:0x8a7430,transparent:true,depthWrite:false});
const lampGlowMat=new THREE.MeshBasicMaterial({map:glowTex,color:0xffa050,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false});
const waterMat=new THREE.MeshPhongMaterial({color:0x1a5a8a,emissive:0x0a3050,shininess:120});
const rampMat=new THREE.MeshLambertMaterial({color:0xc9a227,side:THREE.DoubleSide});
const wreckMat=lamb('#221e1e');
const shopWin=new THREE.MeshBasicMaterial({color:0xd9c08a});

/* ---------- Geometry ---------- */
const BOX=new THREE.BoxGeometry(1,1,1),CYL=new THREE.CylinderGeometry(1,1,1,14),SPH=new THREE.SphereGeometry(1,14,10);
const CONE4=new THREE.ConeGeometry(1,1,4);CONE4.rotateY(PI/4);
const KNOB=new THREE.CylinderGeometry(1,1,1,10);
const ROCK=new THREE.DodecahedronGeometry(1,0),PLANE=new THREE.PlaneGeometry(1,1);PLANE.rotateX(-PI/2);
const CIRC=new THREE.CircleGeometry(1,28);CIRC.rotateX(-PI/2);
const BEAMG=new THREE.CylinderGeometry(1,1,1,16,1,true);
const WEDGE=(()=>{const A=[-.5,0,-.5],B=[.5,0,-.5],C=[.5,1,-.5],D=[-.5,0,.5],E=[.5,0,.5],F=[.5,1,.5];
  const t=[A,D,F,A,F,C,B,C,F,B,F,E,A,B,E,A,E,D,A,C,B,D,E,F];const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(t.flat()),3));
  g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(t.length*2),2));g.computeVertexNormals();return g;})();
function mk(g,geo,m,sx,sy,sz,x,y,z){const o=new THREE.Mesh(geo,m);o.scale.set(sx,sy,sz);o.position.set(x,y,z);g.add(o);return o;}
const box=(g,w,h,d,x,y,z,m)=>mk(g,BOX,m,w,h,d,x,y,z);
const cyl=(g,r,h,x,y,z,m)=>mk(g,CYL,m,r,h,r,x,y,z);
const sph=(g,r,x,y,z,m)=>mk(g,SPH,m,r,r,r,x,y,z);

/* Merge all static meshes below g into one mesh per material (fewer draw calls). Meshes inside groups flagged userData.keep stay separate. */
const NI=new WeakMap(),_nm=new THREE.Matrix3(),_m4=new THREE.Matrix4(),_inv=new THREE.Matrix4();
function niData(geo){let d=NI.get(geo);if(d)return d;const g=geo.index?geo.toNonIndexed():geo,A=g.attributes;
  d={p:A.position.array,n:A.normal?A.normal.array:null,u:A.uv?A.uv.array:null,c:A.position.count};NI.set(geo,d);return d;}
function mergeGroup(g,geos){
  g.updateMatrixWorld(true);_inv.copy(g.matrixWorld).invert();
  const buckets=new Map(),victims=[];
  g.traverse(o=>{
    if(!o.isMesh||o.userData.keep||Array.isArray(o.material))return;
    for(let p=o.parent;p&&p!==g;p=p.parent)if(p.userData.keep)return;
    let b=buckets.get(o.material);if(!b){b={list:[],n:0};buckets.set(o.material,b);}
    const d=niData(o.geometry);b.list.push([o,d]);b.n+=d.c;victims.push(o);
  });
  for(const o of victims)o.parent.remove(o);
  for(const [mat,b] of buckets){
    const Pa=new Float32Array(b.n*3),Na=new Float32Array(b.n*3),Ua=new Float32Array(b.n*2);let off=0;
    for(const [o,d] of b.list){
      _m4.multiplyMatrices(_inv,o.matrixWorld);const e=_m4.elements;_nm.getNormalMatrix(_m4);const q=_nm.elements;
      for(let k=0;k<d.c;k++){
        const x=d.p[k*3],y=d.p[k*3+1],z=d.p[k*3+2],o3=(off+k)*3;
        Pa[o3]=e[0]*x+e[4]*y+e[8]*z+e[12];Pa[o3+1]=e[1]*x+e[5]*y+e[9]*z+e[13];Pa[o3+2]=e[2]*x+e[6]*y+e[10]*z+e[14];
        if(d.n){const a=d.n[k*3],bb=d.n[k*3+1],c=d.n[k*3+2];const nx=q[0]*a+q[3]*bb+q[6]*c,ny=q[1]*a+q[4]*bb+q[7]*c,nz=q[2]*a+q[5]*bb+q[8]*c,l=Math.hypot(nx,ny,nz)||1;Na[o3]=nx/l;Na[o3+1]=ny/l;Na[o3+2]=nz/l;}
        if(d.u){Ua[(off+k)*2]=d.u[k*2];Ua[(off+k)*2+1]=d.u[k*2+1];}
      }
      off+=d.c;
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(Pa,3));geo.setAttribute('normal',new THREE.BufferAttribute(Na,3));geo.setAttribute('uv',new THREE.BufferAttribute(Ua,2));
    geo.computeBoundingSphere();g.add(new THREE.Mesh(geo,mat));geos.push(geo);
  }
}
