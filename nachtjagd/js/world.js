/* ---------- 3D city chunks ---------- */
const coreMat={blocks:gphong('#23252f'),resi:gphong('#1a2a1e'),plaza:gphong('#2b2c37'),parking:gphong('#1a1b22'),yard:gphong('#25262c'),ind:gphong('#25262c'),park:gphong('#163222'),place:gphong('#262833')};
const dirtMat=gphong('#2a2419'),dirt2=gphong('#332c1f');
const waterSea=new THREE.MeshPhongMaterial({color:0x0c2a44,emissive:0x041626,shininess:160,specular:0x6688aa});
const ringTex=canvasTex(128,128,g=>{g.clearRect(0,0,128,128);g.strokeStyle='#fff';g.lineWidth=10;g.beginPath();g.arc(64,64,52,0,TAU);g.stroke();g.globalAlpha=.25;g.fillStyle='#fff';g.beginPath();g.arc(64,64,46,0,TAU);g.fill();});
const RINGM={},BEAMM={},STOREM={},LABELM={},SIGNM={},FLOORM={};
const ringMat=t=>RINGM[t]||(RINGM[t]=new THREE.MeshBasicMaterial({map:ringTex,color:PTYPE[t].col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
const beamMat=t=>BEAMM[t]||(BEAMM[t]=new THREE.MeshBasicMaterial({color:PTYPE[t].col,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
const floorMat=k=>FLOORM[k]||(FLOORM[k]=floorTex(k));
function storeMat(t){
  if(STOREM[t])return STOREM[t];const pt=PTYPE[t];
  const tx=canvasTex(512,256,g=>{g.fillStyle='#1b1d27';g.fillRect(0,0,512,256);
    g.fillStyle='#0d0e14';g.fillRect(14,14,484,70);g.strokeStyle=pt.col;g.lineWidth=6;g.strokeRect(17,17,478,64);
    g.fillStyle=pt.col;g.font='bold 52px Impact, "Arial Black", sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(pt.sign,256,51);
    for(let k=0;k<3;k++){g.fillStyle=k===1?'#3a2a14':'#ffd99a';g.fillRect(40+k*150,120,130,k===1?136:96);}});
  return STOREM[t]=new THREE.MeshLambertMaterial({map:tx,emissive:0xffffff,emissiveMap:tx,emissiveIntensity:.9});
}
function signMat(t){
  if(SIGNM[t])return SIGNM[t];const pt=PTYPE[t];
  const tx=canvasTex(512,96,g=>{g.fillStyle='#0d0e14';g.fillRect(0,0,512,96);g.strokeStyle=pt.col;g.lineWidth=6;g.strokeRect(5,5,502,86);
    g.fillStyle=pt.col;g.font='bold 60px Impact, "Arial Black", sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(pt.sign,256,50);});
  return SIGNM[t]=new THREE.MeshBasicMaterial({map:tx});
}
function labelMat(t){
  if(LABELM[t])return LABELM[t];const pt=PTYPE[t];
  const tx=canvasTex(512,128,g=>{g.clearRect(0,0,512,128);g.fillStyle='rgba(10,12,20,.82)';g.beginPath();g.moveTo(40,8);g.arcTo(504,8,504,120,30);g.arcTo(504,120,8,120,30);g.arcTo(8,120,8,8,30);g.arcTo(8,8,504,8,30);g.fill();
    g.strokeStyle=pt.col;g.lineWidth=5;g.stroke();g.fillStyle=pt.col;g.beginPath();g.arc(66,64,38,0,TAU);g.fill();
    g.fillStyle='#0b0c12';g.font='bold 48px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(pt.ico,66,67);
    g.fillStyle='#fff';g.font='bold 44px Impact, "Arial Black", sans-serif';g.textAlign='left';g.fillText(pt.name.toUpperCase(),120,66);});
  return LABELM[t]=new THREE.SpriteMaterial({map:tx,transparent:true,fog:false});
}
function towerGeo(w,h,d){const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv,T=56,dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
  for(let f=0;f<6;f++)for(let k=0;k<4;k++){const ix=f*4+k;uv.setXY(ix,uv.getX(ix)*dims[f][0]/T,uv.getY(ix)*dims[f][1]/T);}return g;}
const SHOPVIS=new Map();

function buildCell(i,j){
  const c=getCell(i,j),g=new THREE.Group(),geos=[],x0=i*CELL+HALF,y0=j*CELL+HALF,base=c.open?0:2;
  if(c.water){
    let xl=i*CELL,xr=(i+1)*CELL,yt=j*CELL,yb=(j+1)*CELL;
    if(inMap(i-1,j))xl+=HALF;if(inMap(i+1,j))xr-=HALF;if(inMap(i,j-1))yt+=HALF;if(inMap(i,j+1))yb-=HALF;
    if(xr>xl&&yb>yt){mk(g,PLANE,waterSea,xr-xl,1,yb-yt,(xl+xr)/2,.25,(yt+yb)/2);const wl=lamb('#3a3c46');
      if(inMap(i-1,j))box(g,4,7,yb-yt,xl,3.5,(yt+yb)/2,wl);if(inMap(i+1,j))box(g,4,7,yb-yt,xr,3.5,(yt+yb)/2,wl);
      if(inMap(i,j-1))box(g,xr-xl,7,4,(xl+xr)/2,3.5,yt,wl);if(inMap(i,j+1))box(g,xr-xl,7,4,(xl+xr)/2,3.5,yb,wl);}
    mergeGroup(g,geos);return{g,geos,i,j};
  }
  if(c.open){mk(g,PLANE,dirtMat,CELL,1,CELL,i*CELL+CELL/2,.3,j*CELL+CELL/2);for(const p of c.patches)mk(g,CIRC,dirt2,p.r,1,p.r,p.x,.45,p.y);}
  else{
    mk(g,BOX,coreMat[c.kind]||coreMat.blocks,S,2,S,x0+S/2,1,y0+S/2);
    const cb=lamb('#3a3c48');box(g,S+1,1,3,x0+S/2,2.1,y0+1,cb);box(g,S+1,1,3,x0+S/2,2.1,y0+S-1,cb);box(g,3,1,S+1,x0+1,2.1,y0+S/2,cb);box(g,3,1,S+1,x0+S-1,2.1,y0+S/2,cb);
    if(c.kind==='parking')for(let s=0;s<=9;s++)for(const zz of [y0+42,y0+S-42])mk(g,BOX,basic('#3a3d4a'),1.5,.3,56,x0+7+s*37,2.2,zz);
    cyl(g,1.6,72,x0-12,36,y0-12,lamb('#2a2c34'));box(g,14,2.4,4,x0-6,72,y0-12,lamb('#2a2c34'));box(g,8,1.6,5,x0,71,y0-12,basic('#ffd9a0'));
    mk(g,CIRC,lampGlowMat,95,1,95,x0+6,.6,y0-6);
    // street furniture
    cyl(g,2,6,x0+S-14,5,y0+S-14,lamb('#b02a2a'));cyl(g,2.6,1,x0+S-14,8.4,y0+S-14,lamb('#b02a2a'));
    if(hash(i+7,j+3)<.5){box(g,18,1.2,5,x0+S/2+60,6,y0+5,WOOD);box(g,18,5,1,x0+S/2+60,8.5,y0+3,WOOD);for(const s of [-7,7])box(g,1,4,4,x0+S/2+60+s,4,y0+5,lamb('#2a2c34'));}
    if(hash(i-4,j+9)<.5){cyl(g,3,9,x0+4.5,6.5,y0+S/2-40,lamb('#2a5a3a'));}
  }
  if(!c.open&&!getCell(i-1,j).open)mk(g,PLANE,dashMat,4,1,S,i*CELL,.35,y0+S/2);
  if(!c.open&&!getCell(i,j-1).open){const m=mk(g,PLANE,dashMat,4,1,S,x0+S/2,.35,j*CELL);m.rotation.y=PI/2;}
  if(!c.open&&!getCell(i-1,j).open&&!getCell(i,j-1).open&&!getCell(i-1,j-1).open){
    const zb=lamb('#d8d8dc'),x=i*CELL,y=j*CELL;
    for(let s=-3;s<=3;s++){box(g,8,.3,26,x+s*18,.4,y-HALF-16,zb);box(g,8,.3,26,x+s*18,.4,y+HALF+16,zb);box(g,26,.3,8,x-HALF-16,.4,y+s*18,zb);box(g,26,.3,8,x+HALF+16,.4,y+s*18,zb);}
  }
  for(const b of c.b){
    if(b.prop)continue;
    const cx=b.x+b.w/2,cz=b.y+b.h/2;
    if(b.kind==='tower'){
      const h=b.hf*1500,geo=towerGeo(b.w,h,b.h);geos.push(geo);const rm=lamb(b.roof),wm=winMats[b.tex||0];
      const m=new THREE.Mesh(geo,[wm,wm,rm,rm,wm,wm]);m.position.set(cx,base+h/2,cz);g.add(m);
      box(g,b.w+3,6,b.h+3,cx,base+3,cz,lamb('#2a2c36'));box(g,b.w*.9,1.4,6,cx,base+16,b.y+b.h+3,lamb('#1a1b22'));
      box(g,b.w+1.5,2.2,b.h+1.5,cx,base+h+1,cz,lamb('#4a4d5a'));
      box(g,b.w*.22,10,b.h*.18,cx-b.w*.18,base+h+5,cz+b.h*.15,lamb('#3a3d4a'));
      cyl(g,6,8,cx+b.w*.2,base+h+4,cz-b.h*.2,lamb('#5a5f6a'));
      if(b.neon)box(g,b.w+2.5,4,b.h+2.5,cx,base+h-3,cz,basic(b.neon));
      sph(g,2.2,cx+b.w*.3,base+h+3,cz-b.h*.3,basic('#ff2040'));
      if(h>260){cyl(g,1,40,cx-b.w*.3,base+h+20,cz+b.h*.3,lamb('#8a8f99'));sph(g,1.6,cx-b.w*.3,base+h+41,cz+b.h*.3,basic('#ff2040'));}
    }else if(b.kind==='house'){
      const h=b.hf*420,wl=lamb(b.wall),rf=lamb(b.roof),lit=basic('#ffc870'),dark=basic('#20242e'),frame=lamb('#d8d4c8');
      box(g,b.w,h,b.h,cx,base+h/2,cz,wl);box(g,b.w+1,2,b.h+1,cx,base+1,cz,lamb('#2a2a30'));
      mk(g,CONE4,rf,b.w/Math.SQRT2*1.14,24,b.h/Math.SQRT2*1.14,cx,base+h+12,cz);
      box(g,5,14,5,cx+b.w*.25,base+h+14,cz-b.h*.2,lamb('#5a3a30'));
      box(g,8,14,1,cx,base+7,b.y+b.h+.6,lamb('#4a2e1e'));box(g,12,1.2,5,cx,base+15,b.y+b.h+2.5,frame);
      for(const s of [-1,1]){box(g,9,8,1,cx+s*b.w*.28,base+h*.55,b.y+b.h+.6,b.seed>.3+s*.1?lit:dark);box(g,10.5,9.5,.6,cx+s*b.w*.28,base+h*.55,b.y+b.h+.4,frame);}
      box(g,9,8,1,cx,base+h*.55,b.y-.6,b.seed>.6?lit:dark);
      box(g,1,8,9,b.x-.6,base+h*.55,cz,b.seed>.5?lit:dark);box(g,1,8,9,b.x+b.w+.6,base+h*.55,cz,b.seed>.7?lit:dark);
    }else if(b.kind==='warehouse'){
      const h=b.hf*700;const m=new THREE.Mesh(BOX,[lamb(b.wall),lamb(b.wall),lamb(b.roof),lamb(b.roof),lamb(b.wall),lamb(b.wall)]);m.scale.set(b.w,h,b.h);m.position.set(cx,base+h/2,cz);g.add(m);
      for(let k=1;k<6;k++)box(g,b.w>b.h?1.2:b.w,1,b.w>b.h?b.h:1.2,b.w>b.h?b.x+b.w*k/6:cx,base+h+.5,b.w>b.h?cz:b.y+b.h*k/6,lamb('#3a3f48'));
      box(g,8,4,8,b.x+10,base+h+2,b.y+10,basic('#ffb060'));
      for(let k=0;k<3;k++)box(g,30,30,1,b.x+40+k*((b.w-80)/2),base+15,b.y+b.h+.6,lamb('#5a606c'));
    }else if(b.kind==='container'){
      box(g,b.w,26,b.h,cx,base+13,cz,lamb(b.roof));box(g,b.w+.4,2,b.h+.4,cx,base+25,cz,lamb(b.wall));box(g,b.w+.4,2,b.h+.4,cx,base+1,cz,lamb(b.wall));
      const along=b.w>b.h;for(let k=1;k<8;k++)box(g,along?.6:b.w+.5,22,along?b.h+.5:.6,along?b.x+b.w*k/8:cx,base+13,along?cz:b.y+b.h*k/8,lamb(b.wall));
    }else if(b.kind==='barrier'){
      box(g,b.w,11,b.h,cx,base+5.5,cz,lamb('#b9bcc6'));box(g,b.w>b.h?b.w*.3:b.w+.4,4,b.w>b.h?b.h+.4:b.h*.3,cx,base+7,cz,lamb('#c42a2a'));
    }else if(b.kind==='shop'){
      const pt=b.place.t,h=b.hf*1500,sm=lamb('#262935'),rm=lamb('#30333f');
      const m=new THREE.Mesh(BOX,[sm,sm,rm,rm,storeMat(b.place.type),sm]);m.scale.set(b.w,h,b.h);m.position.set(cx,base+h/2,cz);g.add(m);
      box(g,b.w*.86,2.5,16,cx,base+34,b.y+b.h+8,lamb(pt.col));box(g,b.w+3,4,b.h+3,cx,base+h-2,cz,basic(pt.col));
      const sp=new THREE.Sprite(labelMat(b.place.type));sp.scale.set(180,45,1);sp.position.set(cx,base+h+50,cz);g.add(sp);
      if(b.place.type==='hosp'){box(g,40,.6,40,cx,base+h+.4,cz,basic('#f1f1f5'));box(g,24,.8,6,cx,base+h+.6,cz,basic('#ff4060'));box(g,6,.8,24,cx,base+h+.6,cz,basic('#ff4060'));}
      if(b.place.type==='police')for(let k=0;k<3;k++){const pc=buildVehicle(COPV);pc.root.position.set(b.x+40+k*60,base,b.y+b.h+46);pc.root.rotation.y=PI/2;g.add(pc.root);geos.push(...pc.geos);}
    }else if(b.kind==='parked'){
      box(g,b.w*.95,8,b.h*.96,cx,base+7,cz,phong(b.roof));box(g,b.w*.8,6,b.h*.44,cx,base+14,cz-b.h*.04,glass);
      box(g,b.w*.9,1,b.h*.2,cx,base+11.5,cz+b.h*.32,phong(b.roof));box(g,b.w*.97,2.6,1.2,cx,base+4,b.y+.4,lamb('#18191f'));box(g,b.w*.97,2.6,1.2,cx,base+4,b.y+b.h-.4,lamb('#18191f'));
      for(const s of [-1,1])for(const t of [.22,.78])box(g,1.4,6,7,cx+s*b.w*.48,base+3,b.y+b.h*t,tire);
    }
  }
  for(const o of c.o){
    if(o.kind==='tree'){cyl(g,2.6,20,o.x,base+10,o.y,lamb('#2a1e16'));mk(g,SPH,lamb('#1e4a2c'),o.r,o.r*1.25,o.r,o.x,base+20+o.r,o.y);mk(g,SPH,lamb('#28603a'),o.r*.6,o.r*.7,o.r*.6,o.x-o.r*.3,base+24+o.r*1.6,o.y-o.r*.2);}
    else if(o.kind==='silo'){const h=o.hf*1000;cyl(g,o.r,h,o.x,base+h/2,o.y,lamb('#3a3e48'));mk(g,SPH,lamb('#50555f'),o.r,o.r*.4,o.r,o.x,base+h,o.y);
      for(let k=1;k<4;k++)cyl(g,o.r+.6,1.5,o.x,base+h*k/4,o.y,lamb('#2a2d35'));sph(g,2.5,o.x,base+h+o.r*.4+2,o.y,basic('#ff2040'));}
    else if(o.kind==='fountain'){cyl(g,o.r,7,o.x,base+3.5,o.y,lamb('#4a4c58'));cyl(g,o.r-5,7.4,o.x,base+3.7,o.y,waterMat);cyl(g,5,22,o.x,base+11,o.y,lamb('#5a5d6a'));cyl(g,12,3,o.x,base+20,o.y,lamb('#5a5d6a'));}
    else if(o.kind==='rock'){const m=mk(g,ROCK,lamb('#4a443a'),o.r,o.r*.75,o.r,o.x,base+o.r*.4,o.y);m.rotation.y=o.x;}
    else if(o.kind==='bollard'){cyl(g,o.r*.7,14,o.x,base+7,o.y,lamb('#3a3c48'));cyl(g,o.r*.75,2,o.x,base+14.5,o.y,basic('#ffb050'));}
  }
  if(c.place&&c.place.box)buildPlace(g,c.place,base,geos);
  for(const r of c.ramps){
    const vert=Math.abs(Math.sin(r.dir))>.5,len=vert?r.h:r.w,wid=vert?r.w:r.h,rb=groundBase(r.x+r.w/2,r.y+r.h/2);
    const m=mk(g,WEDGE,rampMat,len,16,wid,r.x+r.w/2,rb,r.y+r.h/2);m.rotation.y=-r.dir;
    for(const s of [-1,1]){const st=box(g,4,1,4,0,0,0,basic('#ffd23a'));st.position.set(r.x+r.w/2+Math.cos(r.dir)*len*.5+Math.sin(r.dir)*s*wid*.45,rb+16.5,r.y+r.h/2+Math.sin(r.dir)*len*.5-Math.cos(r.dir)*s*wid*.45);}
  }
  mergeGroup(g,geos);
  return{g,geos,i,j,place:c.place};
}

/* Walkable rooms: walls, door, interior props. Roof and front wall can be hidden while the player is inside. */
function buildPlace(g,p,base,geos){
  const {bx,by,bw,bh,dw}=p.box,t=p.t,H=t.garage?62:56,wt=6,fw=(bw-dw)/2,cx=bx+bw/2;
  const ext=lamb(t.garage?'#4a4f5a':'#3a3d4a'),inn=lamb(p.type==='safe'?'#8a7a6a':p.type==='gun'?'#4a4038':p.type==='work'?'#5a5f6a':'#cfcabd'),topm=lamb('#22242c');
  const wm=face=>{const a=[ext,ext,topm,topm,ext,ext];a[face]=inn;return a;};
  const wbox=(par,w,h,d,x,y,z,mats)=>{const m=new THREE.Mesh(BOX,mats);m.scale.set(w,h,d);m.position.set(x,y,z);par.add(m);return m;};
  mk(g,BOX,floorMat(t.floor||'tile'),bw-2*wt,1,bh-2*wt,cx,base+.6,by+bh/2);
  wbox(g,wt,H,bh,bx+wt/2,base+H/2,by+bh/2,wm(0));
  wbox(g,wt,H,bh,bx+bw-wt/2,base+H/2,by+bh/2,wm(1));
  wbox(g,bw,H,wt,cx,base+H/2,by+wt/2,wm(4));
  const front=new THREE.Group();front.userData.keep=true;g.add(front);
  wbox(front,fw,H,wt,bx+fw/2,base+H/2,by+bh-wt/2,wm(5));wbox(front,fw,H,wt,bx+bw-fw/2,base+H/2,by+bh-wt/2,wm(5));
  const dh=t.garage?40:34;wbox(front,dw,H-dh,wt,cx,base+dh+(H-dh)/2,by+bh-wt/2,wm(5));
  const sb=new THREE.Mesh(BOX,[topm,topm,topm,topm,signMat(p.type),topm]);sb.scale.set(Math.min(bw*.6,170),15,2);sb.position.set(cx,base+H-10,by+bh+1.4);front.add(sb);
  if(!t.garage)for(const s of [-1,1]){mk(front,BOX,shopWin,fw*.62,20,1,cx+s*(dw/2+fw/2),base+20,by+bh+.4);box(front,fw*.66,1.4,1.4,cx+s*(dw/2+fw/2),base+30.6,by+bh+.6,lamb('#1a1b22'));}
  box(front,dw+30,1.6,14,cx,base+dh+3,by+bh+7,lamb(t.col));
  for(const s of [-1,1])box(front,2,dh,2,cx+s*(dw/2+1),base+dh/2,by+bh+.6,lamb('#1a1b22'));
  const roof=new THREE.Group();roof.userData.keep=true;g.add(roof);
  box(roof,bw+4,3,bh+4,cx,base+H+1.5,by+bh/2,lamb('#2a2d38'));
  box(roof,bw+5,2.5,bh+5,cx,base+H-1,by+bh/2,basic(t.col));
  box(roof,30,10,24,bx+50,base+H+8,by+50,lamb('#3a3d4a'));cyl(roof,7,6,bx+bw-50,base+H+6,by+60,lamb('#5a5f6a'));
  const sp=new THREE.Sprite(labelMat(p.type));sp.scale.set(180,45,1);sp.position.set(cx,base+H+44,by+bh/2);roof.add(sp);
  mk(g,BEAMG,beamMat(p.type),10,150,10,p.door.x,base+77,p.door.y+4);
  if(p.ix){const r=p.type==='work'?44:15;mk(g,CIRC,ringMat(p.type),r,1,r,p.ix,base+1.4,p.iy);}
  for(let k=0;k<3;k++)box(g,24,.6,8,cx-30+k*30,base+H-.4,by+bh*(.3+k*.2),basic('#fff6e0'));
  const wood=lamb('#6b4a32'),dark=lamb('#22242c'),metal=lamb('#8a8f99');
  const counter=(x,y,w,h)=>{box(g,w,10,h,x+w/2,base+5.6,y+h/2,wood);box(g,w+2,1.2,h+2,x+w/2,base+11.2,y+h/2,dark);};
  const PC=['#ff2e4d','#3af0ff','#ffd23a','#3dff9a','#ff7a2e','#8a5cff','#f1f1f5'];
  if(p.type==='kiosk'){
    counter(bx+30,by+80,120,20);box(g,8,5,6,bx+70,base+14.3,by+88,dark);box(g,6,3.6,.6,bx+70,base+16,by+84.6,basic('#3dff9a'));
    box(g,14,4,8,bx+120,base+13.8,by+90,lamb('#c42a2a'));
    for(const q of [40,100,160]){box(g,70,18,16,bx+225,base+9.6,by+q+8,metal);
      for(let n=0;n<6;n++)for(const sd of [-1,1])for(const lv of [0,1])box(g,9,5,3,bx+196+n*11.4,base+7+lv*7,by+q+8+sd*8.6,lamb(PC[(n+lv*3+q)%PC.length]));}
    box(g,18,26,80,bx+17,base+13.6,by+190,lamb('#c9ccd4'));box(g,.8,22,74,bx+26.5,base+14,by+190,basic('#9ad0ff'));
    box(g,60,22,.6,bx+90,base+32,by+6.6,basic('#ffd23a'));box(g,50,10,.7,bx+90,base+32,by+6.8,basic('#14151d'));
    box(g,26,3,26,cx,base+1.4,by+bh-24,lamb('#3a2a4a'));
  }else if(p.type==='gun'){
    counter(bx+40,by+90,bw-80,20);box(g,bw-84,4,16,cx,base+13.8,by+100,new THREE.MeshPhongMaterial({color:0x5a6a7a,shininess:120,transparent:true,opacity:.7}));
    box(g,bw-60,30,1,cx,base+30,by+6.8,lamb('#3a2a1a'));
    for(let n=0;n<7;n++){box(g,28,2.4,1.2,bx+50+n*32,base+22+(n%3)*7,by+7.8,GUNM);box(g,6,3,1.2,bx+40+n*32,base+21+(n%3)*7,by+7.8,WOOD);}
    box(g,.6,32,32,bx+6.6,base+30,by+180,basic('#f1f1f5'));for(const r of [12,8,4])box(g,.7,r*2,r*2,bx+6.8+(12-r)*.02,base+30,by+180,basic(r===8?'#f1f1f5':'#c42a2a'));
    for(let k=0;k<4;k++)box(g,14,8,10,bx+bw-40,base+5+k*8.2,by+200,lamb(k%2?'#3a4a2a':'#4a5a32'));
    box(g,60,22,.6,cx,base+44,by+bh-6.6,basic('#ff5a3a'));
  }else if(p.type==='dealer'){
    counter(bx+20,by+30,80,20);box(g,10,8,1,bx+50,base+16,by+40,dark);box(g,9,6,.4,bx+50,base+16.4,by+40.6,basic('#3af0ff'));
    [[0,by+70],[1,by+180]].forEach(([k,yy])=>{cyl(g,40,2,bx+195,base+1.6,yy,lamb('#2a2d3a'));cyl(g,41,.6,bx+195,base+2.8,yy,basic('#3af0ff'));
      const car=buildVehicle(VEH[k?3:0]);car.root.position.set(bx+195,base+2.6,yy);car.root.rotation.y=k?2.4:-.7;g.add(car.root);geos.push(...car.geos);});
    for(const yy of [by+120,by+150])box(g,1,20,30,bx+6.6,base+22,yy,basic('#2e6aff'));
    box(g,26,16,26,bx+40,base+9,by+bh-40,lamb('#2a5a3a'));
  }else if(p.type==='safe'){
    box(g,60,6,90,bx+50,base+4,by+65,wood);box(g,56,4,84,bx+50,base+9,by+66,lamb('#e8e6e0'));box(g,57,1.4,55,bx+50,base+11.3,by+82,lamb('#2e4a7a'));box(g,40,3,14,bx+50,base+12,by+30,lamb('#f5f5f5'));
    box(g,110,.4,80,cx+40,base+1.3,by+130,lamb('#7a2a3a'));
    box(g,90,8,26,bx+225,base+5,by+163,lamb('#3a4a6a'));box(g,90,10,8,bx+225,base+12,by+172,lamb('#3a4a6a'));
    box(g,60,7,30,bx+220,base+4.4,by+105,wood);box(g,70,30,4,bx+235,base+24,by+12,dark);box(g,64,24,.6,bx+235,base+24,by+14.4,basic('#2e6aff'));
    box(g,22,12,90,bx+17,base+6.6,by+bh-70,lamb('#9a9aa4'));box(g,22,1,90,bx+17,base+13,by+bh-70,dark);
    box(g,24,20,.6,bx+120,base+30,by+6.6,basic('#3dff9a'));
  }else if(p.type==='work'){
    box(g,120,30,1,cx,base+28,by+6.8,lamb('#5a5f6a'));for(let n=0;n<8;n++)box(g,2,10,1,cx-50+n*14,base+28,by+7.6,metal);
    for(const sx of [bx+28,bx+bw-28]){box(g,40,10,24,sx,base+5.6,by+20,lamb('#c42a2a'));box(g,40,1,24,sx,base+11,by+20,dark);}
    for(let k=0;k<3;k++)cyl(g,6,4,bx+bw-30,base+3+k*4.2,by+bh-40,tire);
    box(g,8,2,90,cx-26,base+2,by+bh/2,lamb('#ffd23a'));box(g,8,2,90,cx+26,base+2,by+bh/2,lamb('#ffd23a'));
  }
  SHOPVIS.set(p.id,{roof,front});
}

const built=new Map();let ensureT=0;
function ensureCells(px,py,force){
  ensureT-=1;if(ensureT>0&&!force)return;ensureT=8;
  const R=viewFar||W>1200?3:2,ci=Math.floor(px/CELL),cj=Math.floor(py/CELL);
  scene.fog.far=R*CELL+120;scene.fog.near=R*CELL*.3;
  for(let i=ci-R;i<=ci+R;i++)for(let j=cj-R;j<=cj+R;j++){const k=i+','+j;if(!built.has(k)){const b=buildCell(i,j);scene.add(b.g);built.set(k,b);}}
  for(const [k,b] of built)if(Math.abs(b.i-ci)>R+1||Math.abs(b.j-cj)>R+1)disposeCell(k,b);
}
function disposeCell(k,b){scene.remove(b.g);b.geos.forEach(x=>x.dispose());built.delete(k);if(b.place)SHOPVIS.delete(b.place.id);}
const groundPlane=mk(scene,PLANE,gphong('#14151c'),4200,1,4200,0,0,0);
