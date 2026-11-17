/* ---------- Vehicles, people, weapons ---------- */
const VEH=[
 {name:'Viper',price:22000,kind:'car',type:'Sportwagen',desc:'Schnell, rutschig, driftet wie verrückt.',max:700,acc:960,nmax:1080,grip:7.6,hgrip:1.1,turn:3.4,hturn:4.7,hp:170,r:17,L:46,Wd:22,ram:1,armor:1,body:'#ff2e4d',a2:'#ffd23a',dk:'#2a0a12',style:'sport'},
 {name:'Bulldog',price:14000,kind:'car',type:'Muscle-Car',desc:'Schwer und laut. Rammt Cops einfach weg.',max:670,acc:1000,nmax:1020,grip:7.2,hgrip:1.1,turn:3.1,hturn:4.2,hp:260,r:18,L:50,Wd:24,ram:1.7,armor:.8,body:'#22263a',a2:'#ff7a2e',dk:'#0e0f15',style:'muscle'},
 {name:'Panzer',price:18000,kind:'car',type:'Gelände-SUV',desc:'Fast unzerstörbar und im Dreck kaum langsamer.',max:610,acc:820,nmax:920,grip:8.6,hgrip:1.5,turn:2.9,hturn:3.9,hp:380,r:20,L:52,Wd:27,ram:2.1,armor:.6,offroad:true,body:'#4f6b44',a2:'#c9d1b0',dk:'#2e4129',style:'suv'},
 {name:'Blitz',price:45000,kind:'car',type:'Hypercar',desc:'Brutal schnell, klebt auf der Straße.',max:830,acc:1280,nmax:1260,grip:9.6,hgrip:1.2,turn:3.6,hturn:4.8,hp:130,r:16,L:46,Wd:22,ram:.8,armor:1.2,body:'#3af0ff',a2:'#0b0d16',dk:'#0b0d16',style:'hyper'},
 {name:'Kanarie',price:0,kind:'car',type:'Taxi',desc:'Ausgewogen. Verzeiht viele Fehler.',max:670,acc:920,nmax:1000,grip:9,hgrip:1.3,turn:3.5,hturn:4.5,hp:210,r:17,L:46,Wd:22,ram:1.1,armor:.9,body:'#ffd23a',a2:'#14151d',dk:'#14151d',style:'taxi'},
 {name:'Raptor',price:16000,kind:'bike',type:'Superbike',desc:'Vollverkleidet, irre Beschleunigung.',max:800,acc:1420,nmax:1180,grip:11,hgrip:1.9,turn:4.2,hturn:5.4,hp:115,r:10,L:34,Wd:9,ram:.5,armor:1.2,body:'#8a5cff',a2:'#f1f1f5',dk:'#2a1a55',style:'bike'},
 {name:'Staub',price:7000,kind:'bike',type:'Crossbike',desc:'König im Gelände und auf Rampen.',max:690,acc:1220,nmax:1020,grip:10.5,hgrip:1.6,turn:4.4,hturn:5.7,hp:125,r:10,L:32,Wd:9,ram:.5,armor:1.1,offroad:true,jump:1.35,body:'#ff7a2e',a2:'#1d1f2a',dk:'#1d1f2a',style:'dirt'},
 {name:'Wespe',price:2500,kind:'scooter',type:'Roller',desc:'Klein, frech und wendig wie nichts sonst.',max:570,acc:1020,nmax:900,grip:12,hgrip:2,turn:5.2,hturn:6.4,hp:100,r:9,L:24,Wd:10,ram:.3,armor:1.2,body:'#3dff9a',a2:'#f5f5f7',dk:'#1a6e44',style:'scooter'},
];
const COPV={name:'Streifenwagen',type:'Polizei',kind:'car',style:'police',L:46,Wd:22,r:17,hp:110,body:'#eef1f8',a2:'#1f5aa8',dk:'#0d0f16',max:650,acc:920,nmax:1000,grip:8.4,hgrip:1.1,turn:3.4,hturn:4.4,ram:1.3,armor:.9};
const COPB={name:'Polizei-Bike',type:'Polizei',kind:'bike',style:'policebike',L:34,Wd:9,r:10,hp:50,body:'#eef1f8',a2:'#1f5aa8',dk:'#0d0f16',max:720,acc:1250,nmax:1040,grip:11,hgrip:1.8,turn:4.2,hturn:5.3,ram:.5,armor:1.2};
const HUMV={kind:'foot',L:10,Wd:9,r:6,hp:100,armor:1,ram:0},PEDV=HUMV;
const CIVCOL=['#8a93a8','#a82638','#1f5aa8','#d9d9de','#2f2f36','#c9a227','#2f7d4a','#5a3a8a','#6a4a2a','#3a6a7a','#c4561c'];
const NPCCARS=[
 {style:'sedan',type:'Limousine',L:46,Wd:22,r:17,max:650,w:5},
 {style:'hatch',type:'Kleinwagen',L:40,Wd:21,r:16,max:610,w:4},
 {style:'van',type:'Transporter',L:52,Wd:24,r:19,max:540,w:2},
 {style:'pickup',type:'Pickup',L:52,Wd:24,r:19,max:600,w:2},
 {style:'taxi',type:'Taxi',L:46,Wd:22,r:17,max:650,w:2,body:'#ffd23a',a2:'#14151d'},
 {style:'sport',type:'Sportwagen',L:46,Wd:22,r:17,max:730,w:1,a2:'#f1f1f5'},
];
function npcCarSpec(){
  const tot=NPCCARS.reduce((s,c)=>s+c.w,0);let r=Math.random()*tot,t=NPCCARS[0];
  for(const c of NPCCARS){r-=c.w;if(r<=0){t=c;break;}}
  return Object.assign({kind:'car',name:t.type,hp:140,acc:t.max*1.35,nmax:t.max*1.45,grip:8.2,hgrip:1.1,turn:3.3,hturn:4.3,
    ram:t.style==='van'||t.style==='pickup'?1.5:1.1,armor:.9,a2:'#c9ccd4',dk:'#111',body:pick(CIVCOL),rim:pick(['#a8adb8','#2a2d36','#c9a24a'])},t);
}

function buildVehicle(v){
  const root=new THREE.Group();root.rotation.order='YXZ';const lean=new THREE.Group();root.add(lean);
  const out={root,lean,geos:[]};
  if(v.kind==='car')buildCar(lean,v,out);else if(v.kind==='scooter')buildScooter(lean,v,out);else buildBike(lean,v,out);
  mergeGroup(lean,out.geos);
  return out;
}
const CARP={
 sport:{bh:6,cl:3.4,cf:.08,cr:-.24,ch:5.2,ws:10,rs:9,wr:4.4},
 muscle:{bh:8,cl:3.8,cf:.04,cr:-.22,ch:6,ws:8,rs:7,wr:4.8},
 suv:{bh:11,cl:5.6,cf:.2,cr:-.44,ch:8.5,ws:5,rs:1.5,wr:5.6},
 hyper:{bh:5,cl:2.8,cf:.16,cr:-.16,ch:4.6,ws:13,rs:11,wr:4.3},
 taxi:{bh:7.5,cl:3.8,cf:.14,cr:-.26,ch:7,ws:7.5,rs:6.5,wr:4.4},
 police:{bh:7.5,cl:3.8,cf:.14,cr:-.26,ch:7,ws:7.5,rs:6.5,wr:4.4},
 sedan:{bh:7.5,cl:3.8,cf:.14,cr:-.26,ch:7,ws:7.5,rs:6.5,wr:4.4},
 hatch:{bh:7.5,cl:3.8,cf:.2,cr:-.44,ch:7.5,ws:7,rs:1.5,wr:4.2},
 van:{bh:17,cl:4.2,cf:0,cr:0,ch:0,ws:0,rs:0,wr:5},
 pickup:{bh:8.5,cl:5.4,cf:.16,cr:-.1,ch:8,ws:6,rs:1,wr:5.4},
};
function buildCar(lean,v,out){
  const p=CARP[v.style]||CARP.sedan,L=v.L,Wd=v.Wd,hl=L/2,hw=Wd/2,B=phong(v.body),dk=lamb('#0d0e12'),trim=lamb('#18191f');
  const A2=phong(v.a2||'#c9ccd4'),D=phong(v.dk||'#111'),top=p.cl+p.bh,wr=p.wr,wx=hl-wr-2.6;
  // body shell with rounded nose and tail
  box(lean,L-3,p.bh,Wd,0,p.cl+p.bh/2,0,B);
  box(lean,1.6,p.bh-1.8,Wd-1.2,hl-1.3,p.cl+p.bh/2-.5,0,B);
  box(lean,1.6,p.bh-1.4,Wd-1.2,-hl+1.3,p.cl+p.bh/2-.2,0,B);
  box(lean,L-5,1,Wd-1.6,0,top+.4,0,B);
  // bumpers, grille, skirts
  box(lean,1.6,p.bh*.4,Wd+.4,hl+.1,p.cl+p.bh*.22,0,trim);
  box(lean,1.6,p.bh*.4,Wd+.4,-hl-.1,p.cl+p.bh*.22,0,trim);
  box(lean,.6,p.bh*.28,Wd*.46,hl+.15,p.cl+p.bh*.6,0,dk);
  box(lean,L*.6,1,Wd+.3,0,p.cl+.5,0,trim);
  // wheels in dark arches
  for(const sx of [wx,-wx]){
    box(lean,wr*2.5,wr*1.2,Wd+.25,sx,p.cl+.3,0,dk);
    for(const sz of [hw-1.6,-hw+1.6]){
      const t=cyl(lean,wr,3.2,sx,wr,sz,tire);t.rotation.x=PI/2;
      const r=cyl(lean,wr*.62,3.3,sx,wr,sz,phong(v.rim||'#a8adb8'));r.rotation.x=PI/2;
      const h=cyl(lean,wr*.2,3.5,sx,wr,sz,dk);h.rotation.x=PI/2;
    }
  }
  const cf=L*p.cf,cr=L*p.cr,ctop=top+p.ch;
  if(v.style==='van'){
    box(lean,.6,6.5,Wd*.86,hl-.1,top-4.5,0,glass);
    box(lean,10,6,Wd+.2,hl-7.5,top-4.5,0,glass);
    box(lean,L-4,1.2,Wd+.25,0,p.cl+p.bh*.45,0,A2);
    box(lean,.4,p.bh*.8,Wd+.2,hl-14,p.cl+p.bh*.5,0,dk);box(lean,.4,p.bh*.8,Wd+.2,-hl+.9,p.cl+p.bh*.5,0,dk);
    box(lean,12,1.5,8,-6,top+.9,0,lamb('#8a8f99'));
  }else{
    const cl2=cf-cr,ang=Math.atan2(p.ch,p.ws);
    box(lean,cl2,p.ch,Wd*.86,(cf+cr)/2,top+p.ch/2,0,glass);
    box(lean,cl2*.94,1.1,Wd*.88,(cf+cr)/2,ctop+.5,0,B);
    const wl=Math.hypot(p.ws,p.ch);
    let m=box(lean,wl,.5,Wd*.84,cf+p.ws/2,top+p.ch/2,0,glass);m.rotation.z=-ang;
    for(const z of [hw*.86,-hw*.86]){m=box(lean,wl,.9,.9,cf+p.ws/2,top+p.ch/2,z,B);m.rotation.z=-ang;}
    if(p.rs>0){const ra=Math.atan2(p.ch,p.rs),rl=Math.hypot(p.rs,p.ch);
      m=box(lean,rl,.5,Wd*.84,cr-p.rs/2,top+p.ch/2,0,glass);m.rotation.z=ra;
      for(const z of [hw*.86,-hw*.86]){m=box(lean,rl,.9,.9,cr-p.rs/2,top+p.ch/2,z,B);m.rotation.z=ra;}}
    for(const z of [hw*.86,-hw*.86])box(lean,1.1,p.ch,.9,(cf+cr)/2+cl2*.08,top+p.ch/2,z,B);
    for(const z of [hw+.9,-hw-.9])box(lean,1.6,1.3,1.8,cf-.6,top+1.1,z,B);
    box(lean,.25,p.bh*.75,Wd+.2,cf-1.2,p.cl+p.bh*.5,0,dk);
    box(lean,.25,p.bh*.75,Wd+.2,(cf+cr)/2+cl2*.08,p.cl+p.bh*.5,0,dk);
    for(const z of [hw+.15,-hw-.15])box(lean,1.8,.5,.3,(cf+cr)/2+cl2*.25,p.cl+p.bh*.72,z,trim);
  }
  // lights and plate
  const HL=basic('#fff4d6');
  box(lean,.8,1.8,4.2,hl+.25,p.cl+p.bh*.72,hw-3.4,HL);box(lean,.8,1.8,4.2,hl+.25,p.cl+p.bh*.72,-hw+3.4,HL);
  box(lean,.6,1,1.6,hl+.2,p.cl+p.bh*.5,hw-1.1,basic('#ffa030'));box(lean,.6,1,1.6,hl+.2,p.cl+p.bh*.5,-hw+1.1,basic('#ffa030'));
  out.brake=new THREE.MeshBasicMaterial({color:0x6a0e1c});
  box(lean,.8,1.8,4.6,-hl-.25,p.cl+p.bh*.72,hw-3,out.brake);box(lean,.8,1.8,4.6,-hl-.25,p.cl+p.bh*.72,-hw+3,out.brake);
  box(lean,.4,1.8,5,-hl-.95,p.cl+p.bh*.3,0,basic('#e8e8e8'));box(lean,.4,1.8,5,hl+.95,p.cl+p.bh*.3,0,basic('#e8e8e8'));
  // per-style details
  switch(v.style){
    case 'sport':
      box(lean,L-4,.3,1.8,0,top+.95,1.6,A2);box(lean,L-4,.3,1.8,0,top+.95,-1.6,A2);
      box(lean,4,.8,Wd+1,-hl+2.5,top+4.6,0,D);box(lean,1.2,4,1.2,-hl+2.5,top+2.5,5,D);box(lean,1.2,4,1.2,-hl+2.5,top+2.5,-5,D);
      for(const z of [hw+.12,-hw-.12])box(lean,7,2,.3,-wx+7,p.cl+p.bh*.6,z,dk);break;
    case 'muscle':
      box(lean,L-3,.3,3.6,0,top+.95,2.6,A2);box(lean,L-3,.3,3.6,0,top+.95,-2.6,A2);
      box(lean,9,3,7,hl*.45,top+1.8,0,lamb('#0a0a0e'));box(lean,.4,1.6,6,hl*.45+4.6,top+2,0,dk);
      for(const z of [4,-4]){const e=cyl(lean,1.4,6,-hl-1,p.cl+2,z,phong('#9aa0ac'));e.rotation.z=PI/2;}break;
    case 'suv':
      for(const z of [hw*.72,-hw*.72])box(lean,(cf-cr)*.9,1,1.2,(cf+cr)/2,ctop+1.7,z,lamb('#2a2a2e'));
      for(let k=-1;k<=1;k++)box(lean,1.2,1,Wd*.75,(cf+cr)/2+k*8,ctop+2.4,0,lamb('#2a2a2e'));
      {const t=cyl(lean,5.6,3,-hl-1.8,top-3,0,tire);t.rotation.z=PI/2;const r=cyl(lean,3.2,3.2,-hl-1.8,top-3,0,phong('#8a8f99'));r.rotation.z=PI/2;}
      box(lean,2.2,7,Wd*.82,hl+1.6,p.cl+4,0,lamb('#1a1a1e'));box(lean,1.2,1.2,Wd*.8,hl+2.4,p.cl+7.5,0,lamb('#1a1a1e'));
      for(const sx of [wx,-wx])box(lean,wr*2.7,1.4,Wd+1.4,sx,p.cl+wr*1.15,0,lamb('#1a1a1e'));break;
    case 'hyper':
      box(lean,4,.9,Wd+5,-hl+2,top+8,0,lamb('#0b0d16'));box(lean,1.5,7,1.5,-hl+2.5,top+4,6,lamb('#0b0d16'));box(lean,1.5,7,1.5,-hl+2.5,top+4,-6,lamb('#0b0d16'));
      for(const z of [hw+.1,-hw-.1])box(lean,9,3,.4,-hl*.3,p.cl+p.bh*.55,z,lamb('#0b0d16'));
      box(lean,4,.6,Wd+2,hl,p.cl+.4,0,lamb('#0b0d16'));
      box(lean,L*.3,.3,Wd*.6,hl*.55,top+1,0,lamb('#0b0d16'));break;
    case 'taxi':
      box(lean,6,3.4,10,(cf+cr)/2,ctop+2.4,0,basic('#fff3b0'));
      for(let k=0;k<8;k++)for(const z of [hw+.15,-hw-.15])box(lean,2.6,1.3,.3,-hl+6+k*4.4,p.cl+p.bh*.5+((k%2)?.65:-.65),z,dk);break;
    case 'police':
      box(lean,8,p.bh+.2,Wd+.25,hl-4.6,p.cl+p.bh/2,0,lamb('#0d0f16'));box(lean,8,p.bh+.2,Wd+.25,-hl+4.6,p.cl+p.bh/2,0,lamb('#0d0f16'));
      box(lean,L*.42,1.6,Wd+.3,-1,p.cl+p.bh*.5,0,phong('#1f5aa8'));
      box(lean,4.5,1.2,13,(cf+cr)/2,ctop+1.3,0,lamb('#111'));
      out.red=new THREE.MeshBasicMaterial({color:0xff2040});out.blue=new THREE.MeshBasicMaterial({color:0x2060ff});
      box(lean,4,2.2,5.5,(cf+cr)/2,ctop+2.6,3.6,out.red);box(lean,4,2.2,5.5,(cf+cr)/2,ctop+2.6,-3.6,out.blue);
      box(lean,1.6,5,Wd*.7,hl+1.4,p.cl+3.6,0,lamb('#111'));
      out.glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xff2040,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));
      out.glow.scale.set(80,80,1);out.glow.position.set((cf+cr)/2,ctop+6,0);lean.add(out.glow);break;
    case 'pickup':{
      const bl=hl+cr-1,bx=(cr-hl)/2;
      for(const z of [hw-.5,-hw+.5])box(lean,bl,4,1,bx,top+2.4,z,B);
      box(lean,1,4,Wd,-hl+.5,top+2.4,0,B);box(lean,bl,.3,Wd-2,bx,top+1.1,0,lamb('#16171d'));
      box(lean,1.2,3,Wd*.9,cr-1,top+1.8,0,lamb('#16171d'));break;}
    case 'hatch':box(lean,3,.7,Wd*.8,cr-.5,ctop+.3,0,B);break;
  }
}
function buildScooter(lean,v,out){
  const L=v.L,Wd=v.Wd,hl=L/2,B=phong(v.body),A2=phong(v.a2),wr=3.6;
  for(const sx of [hl-wr,-hl+wr])bWheel(lean,sx,wr,2.4,'#c9ccd4',false);
  box(lean,L-6,2.6,Wd*.9,0,5.2,0,B);box(lean,3,13,Wd*.85,hl-6,10.5,0,B);box(lean,8,4.5,7,-hl+6,9.5,0,phong(v.dk));
  box(lean,10,2,6.5,-2,11.4,0,lamb('#1a1c26'));box(lean,1.2,1.2,Wd+5,hl-6,17.6,0,lamb('#222'));
  box(lean,2,2.4,3.4,hl-4.3,13,0,basic('#fff4d6'));
  const t=box(lean,6,10,7,-3,17,0,lamb('#1a1c26'));t.rotation.z=-.15;sph(lean,3.8,-2,25,0,A2);box(lean,1.6,2,5,1.4,25,0,glass);
  for(const z of [3.4,-3.4]){const a=box(lean,6,1.8,1.8,1.2,18.6,z,lamb('#1a1c26'));a.rotation.z=-.5;}
  out.brake=new THREE.MeshBasicMaterial({color:0x6a0e1c});box(lean,1,1.6,2.4,-hl-.3,9,0,out.brake);
}

/* ---------- People ---------- */
const SKINS=['#e0b48a','#c8996e','#9a6a44','#6e4a30','#f1c9a0'],HAIRS=['#1a1410','#3a2414','#6a4a24','#c9a24a','#2a2a2a','#8a3a1a'];
const PLAYERSTYLE={shirt:'#ff2e4d',pants:'#1f2a44',skin:'#c8996e',hair:'#1a1410',shoes:'#f1f1f5',stripe:'#ffd23a',long:true};
const COPSTYLE={shirt:'#24407a',pants:'#141a2e',cap:'#141a2e',badge:true,long:true,shoes:'#0d0e12',vest:'#1a1d26'};
function buildHuman(o){
  o=o||{};
  const root=new THREE.Group();root.rotation.order='YXZ';const lean=new THREE.Group();root.add(lean);
  const shirt=lamb(o.shirt||pick(CIVCOL)),pants=lamb(o.pants||pick(['#1a1c26','#2a3a5a','#3a3a40','#4a3a2a','#202024','#5a5a62'])),
    skin=lamb(o.skin||pick(SKINS)),hair=lamb(o.hair||pick(HAIRS)),shoe=lamb(o.shoes||pick(['#f1f1f5','#14151d','#5a3a20'])),dark=lamb('#111');
  const limb=(x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);g.userData.keep=true;lean.add(g);return g;};
  const legs=[1.55,-1.55].map(z=>{const g=limb(0,9.2,z);box(g,2.4,5,2.5,0,-2.4,0,pants);box(g,2.2,4.4,2.3,0,-6.9,0,pants);box(g,3.6,1.3,2.6,.6,-8.6,0,shoe);return g;});
  box(lean,3,2.2,5.6,0,9.6,0,pants);
  box(lean,3.2,6.2,5.8,0,13.6,0,shirt);box(lean,3.4,2.2,6.3,.1,15.8,0,shirt);
  if(o.vest)box(lean,3.6,5,6.1,0,13.8,0,lamb(o.vest));
  if(o.stripe)box(lean,3.3,.8,5.9,0,12.6,0,lamb(o.stripe));
  if(o.apron)box(lean,.4,7.4,4.6,1.7,12.4,0,lamb(o.apron));
  if(o.badge)box(lean,.3,.9,.9,1.95,14.9,1.5,basic('#ffd23a'));
  box(lean,3.2,.6,5.7,0,10.9,0,dark);
  box(lean,1.5,1.2,1.5,0,17.3,0,skin);
  box(lean,3.1,3.3,2.9,.15,19.2,0,skin);
  box(lean,.3,.5,.6,1.72,19.6,.7,dark);box(lean,.3,.5,.6,1.72,19.6,-.7,dark);box(lean,.6,.6,.6,1.75,18.8,0,skin);
  if(o.cap){box(lean,3.5,1.2,3.3,0,21.3,0,lamb(o.cap));box(lean,1.8,.35,3.2,1.9,20.8,0,lamb(o.cap));}
  else{box(lean,3.3,1.1,3.1,-.1,21.1,0,hair);box(lean,1,2.6,3.1,-1.35,19.9,0,hair);}
  const sleeve=o.long?shirt:skin;
  const arms=[3.75,-3.75].map(z=>{const g=limb(0,16,z);box(g,2,4,2,0,-1.9,0,shirt);box(g,1.8,3.6,1.8,0,-5.4,0,sleeve);box(g,1.9,1.7,1.9,0,-7.8,0,skin);return g;});
  const gun=new THREE.Group();gun.position.set(0,-8.3,0);gun.userData.keep=true;arms[0].add(gun);
  const geos=[];mergeGroup(lean,geos);legs.forEach(l=>mergeGroup(l,geos));arms.forEach(a=>mergeGroup(a,geos));
  scene.add(root);
  return{root,lean,legs,arms,gun,geos,ph:Math.random()*6,gunType:null};
}
const GUNM=lamb('#16171c'),GUNM2=lamb('#3a3d46'),WOOD=lamb('#5a3a22');
function gunMesh(t){
  const g=new THREE.Group();
  if(t==='pistol'){box(g,1.1,4.2,1,0,-1.6,0,GUNM);box(g,2.6,1.2,.9,-1.1,.2,0,GUNM2);}
  else if(t==='smg'){box(g,1.6,6.5,1.2,0,-2.6,0,GUNM);box(g,3.2,1,.9,-1.8,-2.2,0,GUNM2);box(g,1,2.4,1,.2,1.4,0,GUNM2);}
  else if(t==='shotgun'){box(g,1.1,12,1,0,-4.5,0,GUNM);box(g,1.6,4,1.3,-.2,-1.6,0,WOOD);box(g,2,5,1.2,-.6,3,0,WOOD);}
  else if(t==='rifle'){box(g,1.4,12.5,1.2,0,-4.2,0,GUNM);box(g,3.2,1.2,1,-1.9,-2.8,0,GUNM2);box(g,2.2,4.6,1.1,-.5,3.2,0,GUNM2);box(g,1,1.4,1,.9,-3,0,GUNM2);}
  return g;
}
function setGun(m,t){if(m.gunType===t)return;m.gunType=t;while(m.gun.children.length)m.gun.remove(m.gun.children[0]);if(t)m.gun.add(gunMesh(t));}
function addShadow(v){const m=new THREE.Mesh(CIRC,new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));m.scale.set(v.L*.68,1,Math.max(v.Wd,9)*.95);scene.add(m);return m;}
function bWheel(g,x,r,w,rimC,knobby){
  const t=mk(g,knobby?KNOB:CYL,tire,r,w,r,x,r,0);t.rotation.x=PI/2;
  const rm=cyl(g,r*.66,w+.2,x,r,0,phong(rimC));rm.rotation.x=PI/2;
  const hub=cyl(g,r*.22,w+.6,x,r,0,phong('#c9ccd4'));hub.rotation.x=PI/2;
  const d=cyl(g,r*.48,.5,x,r,w/2+.5,phong('#b8bcc6'));d.rotation.x=PI/2;
}
function buildBike(lean,v,out){
  const hl=v.L/2,B=phong(v.body),A2=phong(v.a2),blk=lamb('#111216'),met=phong('#c0c4cc'),HL=basic('#fff4d6');
  const dirt=v.style==='dirt',pol=v.style==='policebike',wr=dirt?6.2:5.4;
  const suit=lamb(pol?'#1a2a55':'#1a1c26'),helm=phong(pol?'#f1f1f5':v.body);
  bWheel(lean,hl-wr,wr,dirt?3:3.4,dirt?'#c9ccd4':v.dk,dirt);bWheel(lean,-hl+wr,wr,dirt?3.2:4.2,dirt?'#c9ccd4':v.dk,dirt);
  for(const z of [2.4,-2.4]){const f=box(lean,1.3,dirt?20:15,1.3,hl-wr-2.4,wr+(dirt?9:7),z,dirt?phong('#d9a020'):met);f.rotation.z=dirt?.3:.42;}
  for(const z of [2.2,-2.2]){const a=box(lean,hl-wr+2,1.8,1.4,-hl/2+1.5,wr+1,z,blk);a.rotation.z=.12;}
  out.brake=new THREE.MeshBasicMaterial({color:0x6a0e1c});
  if(dirt){
    box(lean,9,6.5,4.6,1,wr+5,0,blk);
    const sh=box(lean,9,6,7.4,4,wr+11,0,B);sh.rotation.z=-.15;
    box(lean,17,1.8,5,-2.5,wr+13.6,0,B);box(lean,15,1.4,4.4,-2.5,wr+14.8,0,lamb('#1d1f2a'));
    const ff=box(lean,10,1,4.6,hl-wr+1,wr*2+2.5,0,B);ff.rotation.z=-.15;
    const np=box(lean,1,7,7,hl-wr+2.6,wr+15,0,lamb('#f1f1f5'));np.rotation.z=.32;
    box(lean,.4,3,3,hl-wr+3.3,wr+15.3,0,lamb('#1d1f2a'));
    const rf=box(lean,10,1,4.4,-hl+4,wr+11.5,0,B);rf.rotation.z=-.28;
    const ex=cyl(lean,1.3,13,-hl/2,wr+10,3.2,met);ex.rotation.z=PI/2-.35;
    box(lean,1.2,1.2,14,hl-wr-4.6,wr+17,0,blk);box(lean,1,2,3,hl-wr+2.4,wr+12,0,HL);
    box(lean,1,1.4,2.4,-hl+.5,wr+12.8,0,out.brake);
    const tor=box(lean,6.5,11,7,-1.5,wr+22,0,suit);tor.rotation.z=-.32;
    box(lean,6.6,3,7.1,-1.4,wr+21,0,phong(v.body));
    sph(lean,3.9,2.4,wr+29,0,helm);const pk=box(lean,4,.6,5,5,wr+31,0,phong(v.body));pk.rotation.z=-.2;
    box(lean,1.6,2.2,4.6,5.6,wr+28.4,0,lamb('#2a2d36'));
    for(const z of [3.6,-3.6]){const a=box(lean,8,1.8,1.8,2.4,wr+21,z,suit);a.rotation.z=-.55;
      const th=box(lean,7,2.8,2.8,-2,wr+15.6,z,suit);th.rotation.z=.35;const sn=box(lean,2.6,7,2.6,.5,wr+10,z,suit);sn.rotation.z=.15;
      box(lean,4.4,2.4,3,1.4,wr+6.4,z,lamb('#f1f1f5'));}
  }else{
    box(lean,9,6.5,5,0,wr+3.5,0,blk);
    const bp=box(lean,14,5.5,6.2,1.5,wr+5,0,B);bp.rotation.z=.05;
    const uf=box(lean,8,7.5,6.6,hl-7.5,wr+9.5,0,B);uf.rotation.z=-.38;
    const ns=box(lean,5,4,5.4,hl-3.6,wr+8.6,0,B);ns.rotation.z=-.62;
    const ws=box(lean,6,.6,5,hl-7,wr+13.6,0,glass);ws.rotation.z=.6;
    box(lean,9,4.6,6.6,.5,wr+11.4,0,B);box(lean,7,1.6,5.4,-5.5,wr+11.6,0,blk);
    const tl=box(lean,11,3.2,4.6,-hl+5.6,wr+12.4,0,B);tl.rotation.z=-.24;
    box(lean,13,1.2,6.8,1.5,wr+7.6,0,A2);const st=box(lean,7,1,7,hl-7.5,wr+10.5,0,A2);st.rotation.z=-.38;
    const ex=cyl(lean,1.5,10,-hl+8,wr+6.5,3,met);ex.rotation.z=PI/2-.32;
    box(lean,.8,1.4,1.6,hl-1.2,wr+8.6,1.3,HL);box(lean,.8,1.4,1.6,hl-1.2,wr+8.6,-1.3,HL);
    box(lean,1,1,10,hl-9,wr+12.8,0,blk);
    box(lean,1,1.4,3.6,-hl+.7,wr+13.4,0,out.brake);
    if(pol){
      box(lean,7,5,2.4,-hl+7,wr+9.5,4.2,B);box(lean,7,5,2.4,-hl+7,wr+9.5,-4.2,B);
      box(lean,7.2,1.4,2.6,-hl+7,wr+10.5,4.3,A2);box(lean,7.2,1.4,2.6,-hl+7,wr+10.5,-4.3,A2);
      out.red=new THREE.MeshBasicMaterial({color:0xff2040});out.blue=new THREE.MeshBasicMaterial({color:0x2060ff});
      box(lean,1.4,2.4,2.4,-hl+3,wr+16,2,out.red);box(lean,1.4,2.4,2.4,-hl+3,wr+16,-2,out.blue);
      box(lean,1,1.6,1.6,hl-2,wr+11,2.2,out.red);box(lean,1,1.6,1.6,hl-2,wr+11,-2.2,out.blue);
      out.glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xff2040,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));
      out.glow.scale.set(60,60,1);out.glow.position.set(-hl+3,wr+18,0);lean.add(out.glow);
    }
    const tor=box(lean,10,4.8,7,-.5,wr+16.6,0,suit);tor.rotation.z=.18;
    box(lean,10.2,1.2,7.2,-.5,wr+17.4,0,pol?A2:phong(v.body));
    sph(lean,3.8,6.4,wr+19.2,0,helm);box(lean,1.4,2.2,5.2,9.4,wr+19.2,0,glass);
    box(lean,4,1,1.2,5.4,wr+22.2,0,pol?A2:A2);
    for(const z of [3.5,-3.5]){const a=box(lean,7,1.8,1.8,7,wr+15.2,z,suit);a.rotation.z=-.55;
      const th=box(lean,8,2.8,2.8,-1.5,wr+13.2,z,suit);th.rotation.z=-.12;const sn=box(lean,2.6,6.5,2.6,2,wr+9.6,z,suit);sn.rotation.z=.6;
      box(lean,4,2,3,-.5,wr+6.6,z,blk);}
  }
}
function buildHeli(){
  const g=new THREE.Group(),Wm=phong('#e9edf6'),Bl=phong('#1f5aa8'),Dk=lamb('#22252e');
  sph(g,1,0,0,0,Wm).scale.set(30,15,16);box(g,40,3,30,2,-4,0,Bl);
  sph(g,1,15,3,0,glass).scale.set(15,10,13);
  box(g,62,5,5,-46,5,0,Wm);box(g,12,18,2,-76,13,0,Bl);box(g,8,2,18,-74,6,0,Bl);
  box(g,48,2,2,0,-18,11,Dk);box(g,48,2,2,0,-18,-11,Dk);box(g,2,6,2,8,-14,11,Dk);box(g,2,6,2,8,-14,-11,Dk);box(g,2,6,2,-8,-14,11,Dk);box(g,2,6,2,-8,-14,-11,Dk);
  const rot=new THREE.Group();rot.position.y=18;g.add(rot);box(rot,170,1,7,0,0,0,Dk);box(rot,7,1,170,0,0,0,Dk);cyl(g,3,6,0,15,0,Dk);
  const tr=new THREE.Group();tr.position.set(-76,13,3);g.add(tr);box(tr,2,30,1,0,0,0,Dk);
  const blink=sph(g,2,-80,20,0,basic('#ff2040'));
  const beam=new THREE.Mesh(new THREE.ConeGeometry(1,1,24,1,true),new THREE.MeshBasicMaterial({color:0xdfe8ff,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  const spot=new THREE.Mesh(CIRC,new THREE.MeshBasicMaterial({map:glowTex,color:0xdfe8ff,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));
  scene.add(g);scene.add(beam);scene.add(spot);
  return{g,rot,tr,blink,beam,spot};
}
