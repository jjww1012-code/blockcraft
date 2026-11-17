/* ---------- Police: wanted level, patrols, cops on foot, helicopters ---------- */
const CHASE=[0,1,2,3,4,5],PATROL=3,HELIN=[0,0,0,1,1,2];
/* Polizei-Stärke (Menü): sp = Tempo, acc = Treffsicherheit, n = Anzahl */
const POLDIFF=[{sp:.82,acc:.55,n:-1,bust:4},{sp:.92,acc:.75,n:0,bust:3.3},{sp:1.04,acc:1,n:1,bust:2.6}];
let POL=POLDIFF[+(localStorage.getItem('nachtjagd-pol')||1)]||POLDIFF[1];
const COPGUN={pistol:{rate:1.05,dmg:7,acc:.62,snd:'pistol'},smg:{rate:.32,dmg:5,acc:.5,snd:'smg'},rifle:{rate:.38,dmg:8,acc:.6,snd:'rifle'}};
const zoneR=()=>350+130*stars;
let lastBump=-99;
/* Crime table: min = stars this crime gives at least, bump = one more star if already wanted for it */
function crime(min,reason,bump){
  if(state!=='play')return;const old=stars;let n=Math.max(stars,min);
  if(bump&&stars>=min&&T-lastBump>5){n=stars+1;lastBump=T;}
  stars=Math.min(5,n);lastSeen.x=P.x;lastSeen.y=P.y;hiddenT=0;seen=true;
  if(stars>old){
    banner(stars===1?'GESUCHT':stars+' STERNE');SFX.play('alarm',.5);
    news(reason+' in '+DNAME[curD]+'. Fahndung: '+stars+(stars>1?' Sterne':' Stern'));if(old===0)spawnT=0;
    if(old<3&&stars>=3)setTimeout(()=>{if(stars>=3&&state==='play')banner('HELIKOPTER IM ANFLUG');},1900);
    for(const h of humans)if(h.role==='cop'&&h.mode==='leave')h.mode='chase';
  }
}
function copSees(x,y,r){
  r=r||520;if(spotted)return true;
  for(const c of cops)if(!c.wreck&&Math.hypot(c.x-x,c.y-y)<r)return true;
  for(const h of humans)if(h.role==='cop'&&h.state!=='dead'&&Math.hypot(h.x-x,h.y-y)<r*.8)return true;
  return false;
}
function witness(x,y){for(const h of humans)if((h.role==='civ'||h.role==='clerk')&&h.state!=='dead'&&Math.hypot(h.x-x,h.y-y)<380)return true;return false;}
function report(min,reason,bump){
  if(copSees(P.x,P.y))crime(min,reason,bump);
  else if(witness(P.x,P.y)&&!pending.some(p=>p.reason===reason)){pending.push({t:4,min,reason,bump});toast('Ein Zeuge ruft die Polizei');}
}
function clearWanted(msg){
  stars=0;busted=0;seen=false;pending=[];banner(msg);news('Polizei bricht Fahndung in '+DNAME[curD]+' ab');
  helis.forEach(h=>{if(!h.dead)h.leave=true;});
  for(const c of cops){c.mode='patrol';c.tg=null;}
  for(const h of humans)if(h.role==='cop')h.mode='leave';
}
function roadPoint(dmin,dmax){
  for(let k=0;k<16;k++){
    const a=rnd(0,TAU),d=rnd(dmin,dmax);let x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;
    if(Math.random()<.5)x=clamp(Math.round(x/CELL),MI0,MI0+MAPW)*CELL;else y=clamp(Math.round(y/CELL),MJ0,MJ0+MAPW)*CELL;
    x=clamp(x,BMIN+30,BMAX-30);y=clamp(y,BMIN+30,BMAX-30);
    if(!blocked(x,y)&&Math.hypot(x-P.x,y-P.y)>dmin*.6)return{x,y};
  }
  return null;
}
function spawnCop(v,mode){
  const p=roadPoint(mode==='chase'?780:520,mode==='chase'?1150:1100);if(!p)return;
  const c=makeCar(p.x,p.y,Math.atan2(P.y-p.y,P.x-p.x),v);c.mode=mode;c.gy=groundBase(p.x,p.y);
  c.m=buildVehicle(v);scene.add(c.m.root);c.sh=addShadow(v);cops.push(c);
}
function copDriveAI(c){
  const sp=Math.hypot(c.vx,c.vy),isB=c.v.kind==='bike',off=groundAt(c.x,c.y),chase=c.mode==='chase';
  let tx,ty,max;
  if(chase){
    if(seen){const d=Math.hypot(P.x-c.x,P.y-c.y),lead=spotted?.65:.45;tx=P.x+P.vx*lead;ty=P.y+P.vy*lead;if(d<170){tx=P.x;ty=P.y;}}
    else{c.sT=(c.sT||0)-1/60;if(c.sT<=0||c.sx===undefined){c.sT=3;const a=rnd(0,TAU),r=rnd(0,zoneR());c.sx=lastSeen.x+Math.cos(a)*r;c.sy=lastSeen.y+Math.sin(a)*r;}tx=c.sx;ty=c.sy;}
    max=((isB?560:520)+stars*18+(spotted?20:0))*POL.sp;
  }else{
    if(!c.tg||Math.hypot(c.tg.x-c.x,c.tg.y-c.y)<60){
      const gi=Math.round(c.x/CELL),gj=Math.round(c.y/CELL),d=pick(nodeDirs(gi,gj,c.dir));c.dir=d;c.tg=nodeTarget(gi+d[0],gj+d[1],d);
    }
    tx=c.tg.x;ty=c.tg.y;max=isB?300:260;
  }
  let want=Math.atan2(ty-c.y,tx-c.x);const fa=c.a,look=55+sp*.35,dT=Math.hypot(tx-c.x,ty-c.y);
  if(dT>120&&blocked(c.x+Math.cos(fa)*look,c.y+Math.sin(fa)*look)){
    const lb=blocked(c.x+Math.cos(fa-.75)*look,c.y+Math.sin(fa-.75)*look),rb=blocked(c.x+Math.cos(fa+.75)*look,c.y+Math.sin(fa+.75)*look);
    if(!lb&&rb)want=fa-1.3;else if(!rb&&lb)want=fa+1.3;else if(!lb&&!rb)want=adiff(want,fa)<0?fa-1.3:fa+1.3;
  }
  const diff=adiff(want,c.a);let steer=clamp(diff*2.4,-1,1),gas=chase?1:(Math.abs(diff)>.6?.35:1),hand=chase&&Math.abs(diff)>1.15&&sp>260;
  if(chase&&seen){const d=Math.hypot(P.x-c.x,P.y-c.y),ps=Math.hypot(P.vx,P.vy);if((onFoot||ps<90)&&d<240){gas=sp>60?-1:d>130?.4:0;hand=false;}}
  if(sp<45)c.stuck+=1/60;else c.stuck=0;
  if(c.stuck>.9){c.rev=.85;c.stuck=0;}
  if(c.rev>0){c.rev-=1/60;gas=-1;steer=-steer;hand=false;}
  return{steer,gas,hand,max:max*(off?(isB?.95:.85):1),acc:isB?1260:900,grip:off?5.5:(isB?11:8.4),hgrip:1.1,turn:isB?4.3:3.4,hturn:isB?5.3:4.4};
}
function wreckCop(c,why,byP){
  if(c.wreck)return;c.wreck=.001;c.air=0;
  c.m.root.traverse(o=>{if(o.isMesh)o.material=wreckMat;});if(c.m.glow)c.m.glow.visible=false;
  if(byP){SAVE.stats.cops++;addCash(150*(1+stars),c.x,c.y,why);crime(3,'Streifenwagen zerstört',true);}
  else addCash(80*(1+stars),c.x,c.y,why);
  blast(c.x,c.y,byP?'player':'world');
}
function exitCop(c){
  const n=c.v.kind==='car'&&stars>=3?2:1,fx=Math.cos(c.a),fy=Math.sin(c.a),off=c.v.Wd/2+9;
  for(let k=0;k<n;k++){const s=k?-1:1,h=makeHuman(c.x-fy*off*s,c.y+fx*off*s,c.a,'cop',COPSTYLE);h.mode='chase';}
  c.exited=true;c.mode='parked';cops.splice(cops.indexOf(c),1);c.copcar=true;abandoned.push(c);c.vx*=.3;c.vy*=.3;
}
function npcShoot(h,dmg,acc,snd){
  const ox=h.x+Math.cos(h.a)*9,oy=h.y+Math.sin(h.a)*9,oh=h.gy+15;
  const sp=Math.hypot(P.vx,P.vy),d=Math.hypot(P.x-ox,P.y-oy),th=P.m.root.position.y+(onFoot?13:10);
  const chance=clamp(acc*POL.acc-d/700-sp/1100,.05,.8);
  if(Math.random()<chance){tracer(ox,oh,oy,P.x,th,P.y);damagePlayer(dmg);}
  else{const a=Math.atan2(P.y-oy,P.x-ox)+rnd(-.2,.2),r=castRay(ox,oy,a,d+60,h);tracer(ox,oh,oy,r.x,th+rnd(-4,6),r.y);if(r.wall)sparks(r.x,r.y,3,-Math.cos(a),-Math.sin(a),th);}
  flash(ox,oh,oy);SFX.play(snd,vol(ox,oy));
  for(const q of humans)if(q.role==='civ'&&Math.hypot(q.x-ox,q.y-oy)<350)fleeFrom(q,ox,oy);
}
function copAI(h,dt){
  const d=Math.hypot(P.x-h.x,P.y-h.y);
  h.losT-=dt;if(h.losT<=0){h.losT=.25;h.los=los(h.x,h.y,P.x,P.y);}
  if(stars===0||h.mode==='leave'){h.mode='leave';h.aim=false;setGun(h.m,null);steerAvoid(h,Math.atan2(h.y-P.y,h.x-P.x),dt);h.spd+=(70-h.spd)*Math.min(1,dt*3);return;}
  const w=stars>=5?'rifle':stars>=4?'smg':'pistol';setGun(h.m,w);
  if(stars>=2&&h.los&&d<330&&state==='play'){
    h.aim=true;h.a+=adiff(Math.atan2(P.y-h.y,P.x-h.x),h.a)*Math.min(1,dt*10);h.spd+=((d>200?55:0)-h.spd)*Math.min(1,dt*8);
    h.fireT-=dt;if(h.fireT<=0){const c=COPGUN[w];h.fireT=c.rate*rnd(.8,1.3);npcShoot(h,c.dmg,c.acc,c.snd);}
  }else{
    h.aim=false;steerAvoid(h,Math.atan2(P.y-h.y,P.x-h.x),dt);h.spd+=((d<24?0:185)-h.spd)*Math.min(1,dt*4);
  }
}
function updatePolice(dt){
  const alive=cops.filter(c=>!c.wreck);spawnT-=dt;
  if(stars>0){for(const c of alive)c.mode='chase';if(spawnT<=0&&alive.length<Math.max(1,CHASE[stars]+POL.n)){spawnCop(stars>=2&&Math.random()<.35?COPB:COPV,'chase');spawnT=2.6;}}
  else if(spawnT<=0&&alive.length<PATROL){spawnCop(Math.random()<.25?COPB:COPV,'patrol');spawnT=3;}
  const exits=[];let footCops=0;for(const h of humans)if(h.role==='cop'&&h.state!=='dead')footCops++;
  for(const c of cops){
    if(c.wreck){
      c.wreck+=dt;c.vx*=Math.exp(-3*dt);c.vy*=Math.exp(-3*dt);c.x+=c.vx*dt;c.y+=c.vy*dt;collideWorld(c,c.v.r);
      if(Math.random()<.3)smoke(c.x+rnd(-8,8),c.y+rnd(-8,8),rnd(10,18),.45,0x45464e,12);
      if(c.wreck<3&&Math.random()<.5)fire(c.x+rnd(-10,10),c.y+rnd(-6,6),rnd(6,14),rnd(-15,15),rnd(-15,15),rnd(20,60),rnd(6,11),rnd(.2,.5));
      continue;
    }
    physics(c,copDriveAI(c),dt);
    const ci=collideWorld(c,c.v.r);
    if(ci>170){c.hp-=(ci-170)*.4;if(c.hp<=0){wreckCop(c,'COP GEGEN WAND',false);continue;}}
    for(const s of spikes){const dx=c.x-s.x,dy=c.y-s.y,ux=Math.cos(s.a),uy=Math.sin(s.a);if(Math.abs(dx*ux+dy*uy)<38&&Math.abs(-dx*uy+dy*ux)<10+c.v.r){wreckCop(c,'NAGELBAND',false);break;}}
    if(c.wreck)continue;
    skid(c,Math.abs(c.vl)>120);
    if(c.mode==='chase'&&stars>=1&&footCops<10){
      const d=Math.hypot(c.x-P.x,c.y-P.y),sp=Math.hypot(c.vx,c.vy);
      if(d<170&&sp<110&&(onFoot||Math.hypot(P.vx,P.vy)<140||(stars>=3&&d<110))){exits.push(c);footCops+=2;}
    }
  }
  exits.forEach(exitCop);
  updateHelis(dt);
}
/* helicopters */
function spawnHeli(){const a=rnd(0,TAU),h=buildHeli();h.x=clamp(P.x+Math.cos(a)*1200,BMIN,BMAX);h.y=clamp(P.y+Math.sin(a)*1200,BMIN,BMAX);
  h.off=helis.length?PI:0;h.a=0;h.alt=240;h.hp=420;h.isHeli=true;h.fireT=2;h.v={r:40};helis.push(h);}
function removeHeli(h){scene.remove(h.g);scene.remove(h.beam);scene.remove(h.spot);h.removed=true;}
function downHeli(h){
  if(h.dead)return;h.dead=true;h.fall=0;boom(h.x,h.y,h.alt-20);SFX.play('boom',vol(h.x,h.y));
  addCash(2500,h.x,h.y,'HELI ABGESCHOSSEN');crime(5,'Polizeihubschrauber abgeschossen');lastHeliDown=T;news('Polizeihubschrauber über '+DNAME[curD]+' abgeschossen');
}
function heliShoot(h){
  const ox=h.x,oy=h.y,oh=h.alt-12,sp=Math.hypot(P.vx,P.vy),th=P.m.root.position.y+10;
  if(Math.random()<clamp(.42*POL.acc-sp/1400,.06,.42)){tracer(ox,oh,oy,P.x,th,P.y);damagePlayer(9);}
  else{const mx=P.x+rnd(-40,40),my=P.y+rnd(-40,40);tracer(ox,oh,oy,mx,1,my);sparks(mx,my,3,0,0,2);}
  SFX.play('rifle',vol(ox,oy)*.8);
}
function updateHelis(dt){
  const live=helis.filter(h=>!h.dead&&!h.leave).length,nh=HELIN[stars];
  if(live<nh&&T-lastHeliDown>20)spawnHeli();
  if(live>nh){const h=helis.find(h=>!h.dead&&!h.leave);if(h)h.leave=true;}
  spotted=false;
  for(const h of helis){
    if(h.dead){h.fall+=dt;h.alt-=(60+h.fall*220)*dt;h.a+=dt*5;if(Math.random()<.6)smoke(h.x,h.y,rnd(10,18),.5,0x45464e,h.alt);
      if(h.alt<=groundBase(h.x,h.y)+6){blast(h.x,h.y,'player');removeHeli(h);}continue;}
    let tx,ty;
    if(h.leave){tx=h.x+Math.cos(h.a)*500;ty=h.y+Math.sin(h.a)*500;if(Math.hypot(h.x-P.x,h.y-P.y)>1600){removeHeli(h);continue;}}
    else if(jamT>0){tx=lastSeen.x+Math.cos(T*.4+h.off)*400;ty=lastSeen.y+Math.sin(T*.4+h.off)*400;}
    else{const ox=Math.cos(T*.6+h.off)*(h.off?70:30),oy=Math.sin(T*.6+h.off)*(h.off?70:30);tx=P.x+P.vx*.25+ox;ty=P.y+P.vy*.25+oy;}
    const dx=tx-h.x,dy=ty-h.y,d=Math.hypot(dx,dy)||1,v=Math.min(d*1.8,(430+stars*12)*POL.sp);
    h.x+=dx/d*v*dt;h.y+=dy/d*v*dt;if(d>20)h.a+=adiff(Math.atan2(dy,dx),h.a)*Math.min(1,dt*2);h.spd=v;
    if(!h.leave&&jamT<=0&&Math.hypot(P.x-h.x,P.y-h.y)<135)spotted=true;
    if(!h.leave&&stars>=4&&jamT<=0&&state==='play'){h.fireT-=dt;if(h.fireT<=0){h.fireT=rnd(1.3,2.1);heliShoot(h);}}
  }
  helis=helis.filter(h=>!h.removed);
}
function dropSpikes(){
  const fx=Math.cos(P.a),fy=Math.sin(P.a),back=onFoot?24:P.v.L/2+34,x=P.x-fx*back,y=P.y-fy*back,g=new THREE.Group();
  box(g,72,1.6,8,0,1,0,lamb('#202228'));for(let k=-32;k<=32;k+=6.4)mk(g,CONE4,lamb('#c0c4cc'),1.8,4.5,1.8,k,3.6,0);
  g.position.set(x,groundBase(x,y),y);g.rotation.y=-(P.a+PI/2);scene.add(g);spikes.push({x,y,a:P.a+PI/2,t:45,m:g});
}
