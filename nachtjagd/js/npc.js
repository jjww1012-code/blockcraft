/* ---------- People on the street, shop staff, traffic ---------- */
function makeHuman(x,y,a,role,style){
  const m=buildHuman(style),h={x,y,a,v:HUMV,vx:0,vy:0,spd:0,kx:0,ky:0,hp:role==='cop'?100:55,role,state:'walk',m,sh:addShadow(HUMV),
    gy:groundBase(x,y),air:0,jy:0,fireT:rnd(.6,1.4),losT:0,los:false,fleeT:0,deadT:0,fallDir:1};
  humans.push(h);return h;
}
function dropHuman(h){scene.remove(h.m.root);scene.remove(h.sh);h.m.geos.forEach(g=>g.dispose());}
function steerAvoid(h,want,dt,rate){
  const look=16;
  if(blocked(h.x+Math.cos(want)*look,h.y+Math.sin(want)*look)&&!insidePlace(h.x,h.y)){
    for(const da of [.7,-.7,1.4,-1.4,2.2,-2.2])if(!blocked(h.x+Math.cos(want+da)*look,h.y+Math.sin(want+da)*look)){want+=da;break;}
  }
  h.a+=adiff(want,h.a)*Math.min(1,dt*(rate||8));
}
function fleeFrom(h,x,y,t){
  if(!h||h.state==='dead'||h.role!=='civ')return;
  if(h.state!=='flee'){h.state='flee';h.cross=null;}
  h.fx=x;h.fy=y;h.fleeT=Math.max(h.fleeT,t||rnd(6,10));
}
function panic(x,y,r){
  for(const h of humans)if(h.role==='civ'&&h.state!=='dead'&&Math.hypot(h.x-x,h.y-y)<r)fleeFrom(h,x,y);
  for(const c of traffic)if(Math.hypot(c.x-x,c.y-y)<r*.8)c.panic=Math.max(c.panic,6);
}
let pedT=0;
function spawnPeds(dt){
  pedT-=dt;if(pedT>0)return;pedT=.35;
  const want={city:26,resi:15,ind:7,park:12,waste:3,water:0}[curD]??10;
  let n=0;for(const h of humans)if(h.role==='civ'&&!h.shop&&h.state!=='dead')n++;if(n>=want)return;
  const ci=Math.floor(P.x/CELL),cj=Math.floor(P.y/CELL);
  for(let k=0;k<4;k++){
    const i=ci+Math.floor(rnd(-2,3)),j=cj+Math.floor(rnd(-2,3));if(!pedCell(i,j))continue;
    const c=Math.floor(Math.random()*4),dir=Math.random()<.5?1:-1,a=cornerPos(i,j,c),nc=(c+dir+4)%4,b=cornerPos(i,j,nc),f=Math.random(),x=a.x+(b.x-a.x)*f,y=a.y+(b.y-a.y)*f;
    const d=Math.hypot(x-P.x,y-P.y);if(d<260||d>820)continue;
    const h=makeHuman(x,y,Math.atan2(b.y-a.y,b.x-a.x),'civ');h.bi=i;h.bj=j;h.ci=nc;h.dir=dir;h.walkS=rnd(36,52);break;
  }
}
function crossOpts(h){
  const c=h.ci,i=h.bi,j=h.bj,o=[];
  if(c===1||c===2)o.push({i:i+1,j,c:c===1?0:3});else o.push({i:i-1,j,c:c===0?1:2});
  if(c===0||c===1)o.push({i,j:j-1,c:c===0?3:2});else o.push({i,j:j+1,c:c===3?0:1});
  const f=o.filter(q=>pedCell(q.i,q.j));return f.length?pick(f):null;
}
function resumeWalk(h){
  const i=Math.floor(h.x/CELL),j=Math.floor(h.y/CELL);let best=null,bd=1e9;
  for(let a=i-1;a<=i+1;a++)for(let b=j-1;b<=j+1;b++){if(!pedCell(a,b))continue;for(let c=0;c<4;c++){const p=cornerPos(a,b,c),d=Math.hypot(p.x-h.x,p.y-h.y);if(d<bd){bd=d;best={a,b,c};}}}
  if(!best){h.gone=true;return;}
  h.state='walk';h.bi=best.a;h.bj=best.b;h.ci=best.c;h.dir=h.dir||1;h.walkS=h.walkS||44;h.cross=null;h.shop=null;
}
function civAI(h,dt){
  if(h.state==='walk'){
    const tg=h.cross||cornerPos(h.bi,h.bj,h.ci);
    if(Math.hypot(tg.x-h.x,tg.y-h.y)<9){
      if(h.cross)h.cross=null;
      else if(Math.random()<.3){const o=crossOpts(h);if(o){h.bi=o.i;h.bj=o.j;h.ci=o.c;h.cross=cornerPos(o.i,o.j,o.c);}else h.ci=(h.ci+h.dir+4)%4;}
      else h.ci=(h.ci+h.dir+4)%4;
    }
    h.a+=adiff(Math.atan2(tg.y-h.y,tg.x-h.x),h.a)*Math.min(1,dt*6);h.spd+=(h.walkS-h.spd)*Math.min(1,dt*4);
    if(!onFoot){const d=Math.hypot(P.x-h.x,P.y-h.y);if(d<75&&Math.hypot(P.vx,P.vy)>230)fleeFrom(h,P.x,P.y,4);}
  }else if(h.state==='flee'){
    h.fleeT-=dt;const pl=insidePlace(h.x,h.y);let want;
    if(pl){want=Math.atan2(pl.door.y+30-h.y,pl.door.x-h.x);h.a+=adiff(want,h.a)*Math.min(1,dt*10);}
    else{want=Math.atan2(h.y-h.fy,h.x-h.fx);steerAvoid(h,want,dt,7);}
    h.spd+=(165-h.spd)*Math.min(1,dt*5);
    if(h.fleeT<=0)resumeWalk(h);
  }else{h.spd=0;}
}
function clerkAI(h,dt){
  h.spd=0;const pl=h.place;
  if(h.fightT>0&&h.state!=='shoot'){h.fightT-=dt;if(h.fightT<=0){h.state='shoot';h.fireT=.4;setGun(h.m,'shotgun');}}
  if(h.state==='shoot'){
    if(insidePlace(P.x,P.y)!==pl){h.state='idle';setGun(h.m,null);return;}
    h.a+=adiff(Math.atan2(P.y-h.y,P.x-h.x),h.a)*Math.min(1,dt*10);
    h.fireT-=dt;if(h.fireT<=0){h.fireT=1;npcShoot(h,14,.72,'shotgun');}
    return;
  }
  if(h.state==='hands'){h.handsT-=dt;if(h.handsT<=0&&!(rob.active&&rob.pl===pl))h.state='idle';}
  if(h.state==='idle')h.a+=adiff(h.homeA,h.a)*Math.min(1,dt*4);
  h.kx*=.5;h.ky*=.5;h.x+=(h.hx-h.x)*Math.min(1,dt*2);h.y+=(h.hy-h.y)*Math.min(1,dt*2);
}
function updatePlaces(){
  for(const p of PLACES){
    if(!p.t.clerk)continue;const d=Math.hypot(P.x-p.mx,P.y-p.my);
    if(!p.clerk&&d<760&&T-(p.clerkDeadT??-999)>150){
      const c=p.clerkPos,h=makeHuman(c.x,c.y,PI/2,'clerk',{shirt:p.type==='gun'?'#3a4a2a':p.type==='dealer'?'#22263a':'#f1f1f5',apron:p.type==='kiosk'?'#c42a2a':null,long:p.type!=='kiosk'});
      h.place=p;h.hx=c.x;h.hy=c.y;h.homeA=PI/2;h.state='idle';h.hp=70;p.clerk=h;
      if(p.shopPos&&Math.random()<.75){const s=makeHuman(p.shopPos.x,p.shopPos.y,rnd(0,TAU),'civ');s.state='idle';s.shop=p;p.shopper=s;}
    }else if(p.clerk&&d>1250){p.clerk.gone=true;if(p.shopper&&p.shopper.shop===p)p.shopper.gone=true;p.clerk=null;p.shopper=null;}
  }
}
function updateHumans(dt){
  spawnPeds(dt);
  for(const h of humans){
    if(h.state==='dead'){h.deadT+=dt;h.spd=0;h.kx*=Math.exp(-4*dt);h.ky*=Math.exp(-4*dt);h.x+=h.kx*dt;h.y+=h.ky*dt;collideWorld(h,5);continue;}
    if(h.role==='civ')civAI(h,dt);else if(h.role==='cop')copAI(h,dt);else if(h.role==='clerk')clerkAI(h,dt);
    const fx=Math.cos(h.a),fy=Math.sin(h.a);
    h.vx=fx*h.spd+h.kx;h.vy=fy*h.spd+h.ky;h.x+=h.vx*dt;h.y+=h.vy*dt;h.kx*=Math.exp(-5*dt);h.ky*=Math.exp(-5*dt);
    collideWorld(h,5);
  }
  humans=humans.filter(h=>{
    const d=Math.hypot(h.x-P.x,h.y-P.y);let keep;
    if(h.gone)keep=false;
    else if(h.role==='clerk'||h.shop)keep=true;
    else if(h.role==='cop')keep=h.state==='dead'?(h.deadT<30&&d<1100):d<(h.mode==='leave'?650:1500);
    else keep=h.state==='dead'?(h.deadT<25&&d<1000):d<950;
    if(!keep)dropHuman(h);return keep;
  });
}
function killHuman(h,ang){
  if(h.state==='dead')return;
  h.state='dead';h.deadT=0;h.hp=0;h.spd=0;h.fallDir=Math.random()<.5?1:-1;setGun(h.m,null);
  if(h.role==='clerk'&&h.place)h.place.clerkDeadT=T;
  if(h.shop&&h.shop.shopper===h)h.shop.shopper=null;
  SFX.play('hit',vol(h.x,h.y));panic(h.x,h.y,420);
}

/* traffic */
let trafT=0;
function spawnTraffic(dt){
  trafT-=dt;if(trafT>0)return;trafT=.45;
  if(traffic.length>=(curD==='waste'?4:curD==='city'?13:10))return;
  for(let k=0;k<5;k++){
    const gi=Math.round(P.x/CELL)+Math.floor(rnd(-3,4)),gj=Math.round(P.y/CELL)+Math.floor(rnd(-3,4));
    const dirs=nodeDirs(gi,gj,null);if(!dirs.length)continue;const d=pick(dirs);
    const off=rnd(80,300),x=gi*CELL+d[0]*off-d[1]*LANE,y=gj*CELL+d[1]*off+d[0]*LANE;
    const dist=Math.hypot(x-P.x,y-P.y);if(dist<520||dist>1050)continue;
    if(blocked(x,y)||[...traffic,...cops,...abandoned].some(c=>Math.hypot(c.x-x,c.y-y)<70))continue;
    const v=npcCarSpec(),c=makeCar(x,y,Math.atan2(d[1],d[0]),v);c.gy=groundBase(x,y);c.m=buildVehicle(v);scene.add(c.m.root);c.sh=addShadow(v);
    c.dir=d;c.tg=nodeTarget(gi+d[0],gj+d[1],d);c.npc=true;c.panic=0;c.blockT=0;c.honkT=0;c.vx=Math.cos(c.a)*180;c.vy=Math.sin(c.a)*180;
    traffic.push(c);break;
  }
}
function trafficAI(c,dt){
  const sp=Math.hypot(c.vx,c.vy);
  if(Math.hypot(c.tg.x-c.x,c.tg.y-c.y)<55){const d=pick(nodeDirs(c.tg.gi,c.tg.gj,c.dir));c.dir=d;c.tg=nodeTarget(c.tg.gi+d[0],c.tg.gj+d[1],d);}
  const diff=adiff(Math.atan2(c.tg.y-c.y,c.tg.x-c.x),c.a);
  let steer=clamp(diff*2.6,-1,1),gas=Math.abs(diff)>.5?.4:1;const max=c.panic>0?c.v.max*.78:235;
  c.panic=Math.max(0,c.panic-dt);
  const fx=Math.cos(c.a),fy=Math.sin(c.a),look=30+sp*.45;let by=null;
  if(c.panic<=0){
    const chk=e=>{if(by||e===c)return;const dx=e.x-c.x,dy=e.y-c.y,f=dx*fx+dy*fy;if(f<0||f>look+e.v.r+c.v.L/2)return;if(Math.abs(-dx*fy+dy*fx)<c.v.Wd/2+e.v.r+3)by=e;};
    chk(P);for(const e of traffic)chk(e);for(const e of cops)chk(e);for(const e of abandoned)chk(e);for(const e of humans)if(e.state!=='dead')chk(e);
  }
  if(by){gas=sp>16?-1:0;c.blockT+=dt;if(by===P&&c.blockT>1.5&&T-c.honkT>2.5){c.honkT=T;SFX.play('honk',vol(c.x,c.y));}}else c.blockT=0;
  if(sp<30&&!by)c.stuck+=dt;else c.stuck=0;if(c.stuck>2){c.rev=.9;c.stuck=0;}
  if(c.rev>0){c.rev-=dt;gas=-1;steer=-steer;}
  return{steer,gas,hand:false,max,acc:c.v.acc*.6,grip:8,hgrip:1,turn:3.2,hturn:4};
}
function bail(c){
  if(c.taken)return;c.taken=true;const fx=Math.cos(c.a),fy=Math.sin(c.a),off=c.v.Wd/2+9;
  const h=makeHuman(c.x-fy*off,c.y+fx*off,c.a-PI/2,'civ');h.state='walk';fleeFrom(h,P.x,P.y,10);
  abandoned.push(c);return h;
}
function updateTraffic(dt){
  spawnTraffic(dt);
  for(const c of traffic){
    if(c.taken||c.dead)continue;
    physics(c,trafficAI(c,dt),dt);const imp=collideWorld(c,c.v.r);if(imp>200){c.hp-=(imp-200)*.2;c.panic=Math.max(c.panic,4);}
    if(c.hp<=0)explodeVehicle(c,'world');
  }
  traffic=traffic.filter(c=>{if(c.dead||c.taken)return false;const keep=Math.hypot(c.x-P.x,c.y-P.y)<1350;if(!keep)dropModel(c);return keep;});
}
