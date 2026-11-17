/* ---------- Effects: particles, skid marks, tracers, popups ---------- */
const POOLN=180;
function makePool(tex,blend){const a=[];for(let k=0;k<POOLN;k++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:blend}));s.visible=false;scene.add(s);a.push(s);}return{a,i:0};}
const poolN=makePool(smokeTex,THREE.NormalBlending),poolA=makePool(glowTex,THREE.AdditiveBlending);
let parts=[];
function part(p){const pool=p.t==='smoke'?poolN:poolA,s=pool.a[pool.i];pool.i=(pool.i+1)%POOLN;s.owner=p;p.sp=s;s.visible=true;s.material.color.setHex(p.col||0xffffff);s.position.set(p.x,p.h,p.y);parts.push(p);}
function sparks(x,y,n,nx,ny,h){for(let k=0;k<n;k++){const a=Math.atan2(ny,nx)+rnd(-1.2,1.2),s=rnd(150,520);part({t:'spark',x,y,h:h||8,vx:Math.cos(a)*s,vy:Math.sin(a)*s,vh:rnd(60,220),l:rnd(.25,.55),m:.55,s:3,col:0xffd27a});}}
function smoke(x,y,s,a,col,h){part({t:'smoke',x,y,h:h||4,vx:rnd(-20,20),vy:rnd(-20,20),vh:rnd(8,26),l:rnd(.6,1.2),m:1.2,s:s||8,a:a||.4,col:col||0x8a8c9c});}
function fire(x,y,h,vx,vy,vh,s,l,blue){part({t:'fire',x,y,h,vx,vy,vh,l,m:l,s,col:blue?0x4ac8ff:0xff7a2e});}
function blood(x,y,h){for(let k=0;k<5;k++)part({t:'smoke',x,y,h,vx:rnd(-40,40),vy:rnd(-40,40),vh:rnd(-20,30),l:rnd(.3,.6),m:.6,s:rnd(2,4),a:.8,col:0x8a0a14});}
function boom(x,y,h){
  h=h||0;
  for(let k=0;k<40;k++){const a=rnd(0,TAU),s=rnd(60,380);fire(x,y,h+rnd(4,20),Math.cos(a)*s,Math.sin(a)*s,rnd(20,160),rnd(8,18),rnd(.3,.8));}
  sparks(x,y,18,1,0,h+8);sparks(x,y,18,-1,0,h+8);
  for(let k=0;k<14;k++)smoke(x+rnd(-20,20),y+rnd(-20,20),rnd(14,26),.55,0x55565e,h+rnd(5,25));
  flashL.position.set(x,h+30,y);flashL.intensity=6;flashL.distance=420;
}
const SKN=1500,skPos=new Float32Array(SKN*18),skGeo=new THREE.BufferGeometry();
skGeo.setAttribute('position',new THREE.BufferAttribute(skPos,3));
const skMesh=new THREE.Mesh(skGeo,new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
skMesh.frustumCulled=false;scene.add(skMesh);let skI=0,skDirty=false;
function addSkid(x1,y1,x2,y2,w){
  const dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy);if(l<.5||l>60)return;
  const nx=-dy/l*w/2,ny=dx/l*w/2,h=groundBase((x1+x2)/2,(y1+y2)/2)+.4;
  skPos.set([x1+nx,h,y1+ny,x1-nx,h,y1-ny,x2+nx,h,y2+ny,x1-nx,h,y1-ny,x2-nx,h,y2-ny,x2+nx,h,y2+ny],skI*18);skI=(skI+1)%SKN;skDirty=true;
}
const TRM=new THREE.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false});
const tracers=[];for(let k=0;k<48;k++){const m=new THREE.Mesh(BOX,TRM);m.visible=false;scene.add(m);tracers.push({m,l:0});}let trI=0;
function tracer(x1,h1,y1,x2,h2,y2){
  const t=tracers[trI];trI=(trI+1)%tracers.length;const len=Math.hypot(x2-x1,h2-h1,y2-y1);if(len<1)return;
  t.m.position.set((x1+x2)/2,(h1+h2)/2,(y1+y2)/2);tmpV.set(x2,h2,y2);t.m.lookAt(tmpV);t.m.scale.set(.45,.45,len);t.m.visible=true;t.l=.05;
}
const flashL=new THREE.PointLight(0xffc070,0,180,2);scene.add(flashL);
function flash(x,h,y){flashL.position.set(x,h,y);flashL.intensity=Math.max(flashL.intensity,2.4);flashL.distance=180;fire(x,y,h,0,0,0,3.5,.05);}
function tickParticles(dt){
  for(const t of tracers)if(t.m.visible){t.l-=dt;if(t.l<=0)t.m.visible=false;}
  flashL.intensity*=Math.exp(-dt*22);
  parts=parts.filter(p=>{
    if(p.sp.owner!==p)return false;p.l-=dt;if(p.l<=0){p.sp.visible=false;return false;}
    const a=p.l/p.m,f=p.t==='smoke'?1.2:p.t==='spark'?2.5:2.4;
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.h+=p.vh*dt;p.vx*=Math.exp(-f*dt);p.vy*=Math.exp(-f*dt);
    if(p.t==='spark'){p.vh-=500*dt;if(p.h<1){p.h=1;p.vh*=-.3;}}
    let s;if(p.t==='smoke'){p.s+=dt*18;s=p.s*2;p.sp.material.opacity=a*p.a;}else if(p.t==='fire'){s=p.s*2*(.5+.5*a);p.sp.material.opacity=a;}else{s=4;p.sp.material.opacity=a;}
    p.sp.scale.set(s,s,1);p.sp.position.set(p.x,p.h,p.y);return true;
  });
  if(skDirty){skGeo.attributes.position.needsUpdate=true;skDirty=false;}
}
let floats=[];
function float(x,y,txt,col,big){const el=document.createElement('div');el.className='pop';el.textContent=txt;el.style.color=col;el.style.fontSize=Math.round(20*(big||1))+'px';$('pops').appendChild(el);floats.push({x,y,h:45,el,l:1.4});}
function banner(t){const b=$('banner');b.textContent=t;b.classList.remove('go');void b.offsetWidth;b.classList.add('go');}
let toastTimer=0;
function toast(m){const t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{t.hidden=true;},2300);}
function vol(x,y){if(!P)return 0;return clamp(1-Math.hypot(x-P.x,y-P.y)/1300,0,1);}
