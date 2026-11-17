/* ---------- Physics ---------- */
function physics(c,inp,dt){
  if(c.air>0){c.air-=dt;c.x+=c.vx*dt;c.y+=c.vy*dt;if(c.air<=0)land(c);return;}
  const fx=Math.cos(c.a),fy=Math.sin(c.a);
  let vf=c.vx*fx+c.vy*fy,vl=-c.vx*fy+c.vy*fx;
  if(inp.gas>0&&vf<inp.max)vf+=inp.gas*inp.acc*dt;
  else if(inp.gas<0){if(vf>15)vf-=1000*dt;else vf-=430*dt;}
  else vf-=Math.sign(vf)*Math.min(Math.abs(vf),35*dt);
  if(vf<-210)vf=-210;
  vf-=vf*.1*dt;
  if(vf>inp.max)vf+=(inp.max-vf)*2.5*dt;
  vl*=Math.exp(-(inp.hand?inp.hgrip:inp.grip)*dt);
  if(inp.hand)vf*=Math.exp(-.18*dt);
  c.steer+=(inp.steer-c.steer)*Math.min(1,dt*15);
  c.a+=c.steer*(inp.hand?inp.hturn:inp.turn)*clamp(vf/170,-1,1)*dt;
  c.vx=fx*vf-fy*vl;c.vy=fy*vf+fx*vl;
  c.x+=c.vx*dt;c.y+=c.vy*dt;c.vf=vf;c.vl=vl;
  tryJump(c);
}
function tryJump(c){
  const ci=Math.floor(c.x/CELL),cj=Math.floor(c.y/CELL),sp=Math.hypot(c.vx,c.vy);if(sp<200)return;
  for(let i=ci-1;i<=ci+1;i++)for(let j=cj-1;j<=cj+1;j++)for(const r of getCell(i,j).ramps){
    if(c.x<r.x||c.x>r.x+r.w||c.y<r.y||c.y>r.y+r.h)continue;
    if(c.vx*Math.cos(r.dir)+c.vy*Math.sin(r.dir)<200)continue;
    const boost=c.v.jump||1;c.airMax=clamp(sp/650,.45,1.15)*boost;c.air=c.airMax;
    const k=1+.15*boost;c.vx*=k;c.vy*=k;c.sl=null;
    if(c===P)float(c.x,c.y,'SPRUNG!','#ffd23a',1);return;
  }
}
function land(c){
  c.air=0;for(let k=0;k<8;k++)smoke(c.x+rnd(-14,14),c.y+rnd(-14,14),rnd(8,14),.35);
  if(c===P){SFX.play('land',.8);shake=Math.max(shake,5);if(state==='play'){addCash(60*(1+stars)*c.airMax,c.x,c.y,'SPRUNG');nitro=Math.min(1,nitro+.15);}}
}
function collideWorld(c,r){
  const ci=Math.floor(c.x/CELL),cj=Math.floor(c.y/CELL),air=c.air>0;let impact=0;
  const hit=(nx,ny,px,py)=>{const vn=c.vx*nx+c.vy*ny;if(vn<0){c.vx-=1.3*vn*nx;c.vy-=1.3*vn*ny;c.vx*=.86;c.vy*=.86;if(-vn>impact)impact=-vn;if(-vn>140)sparks(px,py,Math.min(16,-vn/30),nx,ny);}};
  for(let i=ci-1;i<=ci+1;i++)for(let j=cj-1;j<=cj+1;j++){
    const cell=getCell(i,j);
    for(const b of cell.b){
      if(air&&b.hf<.075)continue;
      const px=clamp(c.x,b.x,b.x+b.w),py=clamp(c.y,b.y,b.y+b.h),dx=c.x-px,dy=c.y-py,d=Math.hypot(dx,dy);
      if(d>=r)continue;let nx,ny;
      if(d<.001){const l=c.x-b.x,rr=b.x+b.w-c.x,t=c.y-b.y,bt=b.y+b.h-c.y,m=Math.min(l,rr,t,bt);
        if(m===l){nx=-1;ny=0;c.x=b.x-r}else if(m===rr){nx=1;ny=0;c.x=b.x+b.w+r}else if(m===t){nx=0;ny=-1;c.y=b.y-r}else{nx=0;ny=1;c.y=b.y+b.h+r}}
      else{nx=dx/d;ny=dy/d;c.x=px+nx*r;c.y=py+ny*r;}
      hit(nx,ny,c.x-nx*r,c.y-ny*r);
    }
    for(const o of cell.o){
      if(air&&o.hf<.075)continue;
      const cr=o.kind==='tree'?o.r*.4:o.r,dx=c.x-o.x,dy=c.y-o.y,d=Math.hypot(dx,dy);
      if(d>=r+cr||d<.001)continue;const nx=dx/d,ny=dy/d;c.x=o.x+nx*(r+cr);c.y=o.y+ny*(r+cr);hit(nx,ny,o.x+nx*cr,o.y+ny*cr);
    }
  }
  impact=Math.max(impact,clampMap(c,r));
  return impact;
}
function skid(c,on){
  if(!on||c.air>0){c.sl=null;return;}
  const fx=Math.cos(c.a),fy=Math.sin(c.a),rl=c.v.L/2-8,hw=c.v.kind==='car'?c.v.Wd*.4:0;
  const rx=c.x-fx*rl,ry=c.y-fy*rl,L=[rx-fy*hw,ry+fx*hw],R=[rx+fy*hw,ry-fx*hw];
  if(c.sl){addSkid(c.sl[0],c.sl[1],L[0],L[1],c.v.kind==='car'?4.5:3);if(hw)addSkid(c.sr[0],c.sr[1],R[0],R[1],4.5);}
  c.sl=L;c.sr=R;
}

