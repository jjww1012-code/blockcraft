/* ---------- Main loop: update, collisions, rendering sync, camera ---------- */
function updateDrive(dt){
  const st=(K.right?1:0)-(K.left?1:0),useN=K.nitro&&nitro>.02,off=groundAt(P.x,P.y)&&!V.offroad;
  if(useN)nitro=Math.max(0,nitro-dt*.33);
  const gas=useN||K.gas?1:K.brake?-1:0;
  physics(P,{steer:st,gas,hand:K.hand,acc:useN?V.acc*1.7:V.acc,max:(useN?V.nmax:V.max)*(off?.9:1),grip:V.grip*(off?.72:1),hgrip:V.hgrip,turn:V.turn,hturn:V.hturn},dt);
  const imp=collideWorld(P,V.r);
  if(imp>220){P.hp-=(imp-220)*.035*V.armor;shake=Math.max(shake,imp*.02);SFX.play('crash',Math.min(1,imp/600));}
  P.hp=Math.min(V.hp,P.hp+dt*4);
  const sp=Math.hypot(P.vx,P.vy),lat=Math.abs(P.vl),drifting=P.air<=0&&sp>190&&lat>105;
  skid(P,lat>90&&sp>120||(K.hand&&sp>100));
  const fx=Math.cos(P.a),fy=Math.sin(P.a);
  if(drifting){
    combo+=lat*dt*.6;driftT=.6;nitro=Math.min(1,nitro+dt*.17);
    if(Math.random()<.8)smoke(P.x-fx*V.L*.4+rnd(-6,6),P.y-fy*V.L*.4+rnd(-6,6),rnd(7,12),.35,0x9a9cac,3);
  }else if(combo>0){driftT-=dt;if(driftT<=0){const cash=Math.floor(combo*.035*(1+stars));if(cash>=5)addCash(cash,P.x,P.y,'DRIFT');combo=0;}}
  if(groundAt(P.x,P.y)&&sp>200&&P.air<=0&&Math.random()<.6)smoke(P.x-fx*V.L*.4+rnd(-8,8),P.y-fy*V.L*.4+rnd(-8,8),rnd(9,15),.4,0x8a6a44,3);
  if(useN){const bk=V.L/2+2;for(let k=0;k<3;k++)fire(P.x-fx*bk,P.y-fy*bk,V.kind==='car'?6:9,-fx*rnd(120,300)+rnd(-40,40),-fy*rnd(120,300)+rnd(-40,40),rnd(-10,20),rnd(5,9),rnd(.12,.28),true);}
}
function updateFoot(dt){
  const st=(K.right?1:0)-(K.left?1:0);P.a+=st*4.6*dt;
  const aiming=curW!=='fist'&&K.fire;
  const want=K.gas?(K.nitro&&!aiming?300:aiming?120:200):K.brake?-110:0;P.spd+=(want-P.spd)*Math.min(1,dt*9);
  if(K.hand&&!P.jh&&P.jy<=0)P.jv=250;P.jh=K.hand;
  if(P.jy>0||P.jv>0){P.jy+=P.jv*dt;P.jv-=720*dt;if(P.jy<=0){P.jy=0;P.jv=0;}}
  P.air=P.jy>12?1:0;
  const fx=Math.cos(P.a),fy=Math.sin(P.a);
  P.vx=fx*P.spd+P.kx;P.vy=fy*P.spd+P.ky;P.kx*=Math.exp(-5*dt);P.ky*=Math.exp(-5*dt);
  P.x+=P.vx*dt;P.y+=P.vy*dt;collideWorld(P,6);P.vx=fx*P.spd+P.kx;P.vy=fy*P.spd+P.ky;P.pvx=P.vx;P.pvy=P.vy;
  P.hp=Math.min(100,P.hp+dt*1.5);
}
function endScreen(title,sub,next){
  state='over';nextSpawn=next;for(const k in K)K[k]=false;closeWheel();$('why').textContent=title;$('whySub').textContent=sub;save();
  setTimeout(()=>{if(state==='over'){$('over').hidden=false;$('pad').hidden=true;}},1100);
}
function gotBusted(){const fine=Math.min(SAVE.money,500+stars*350);SAVE.money-=fine;news('Festnahme in '+DNAME[curD]+'. Verdächtiger zahlt '+$$(fine)+' Kaution');
  endScreen('BUSTED','Kaution: '+$$(fine)+'. Du kommst an der Polizeiwache wieder raus.','police');}
function wasted(){const fine=Math.min(SAVE.money,300+stars*200);SAVE.money-=fine;news('Schwerverletzter in '+DNAME[curD]+' ins Krankenhaus gebracht');
  endScreen('WASTED','Krankenhausrechnung: '+$$(fine)+'.','hosp');}
const isFoot=b=>b.v.kind==='foot';
function massOf(c){
  if(c===P)return onFoot?.25:(V.kind==='car'?1:.5)*(V.ram>1.5?1.6:1);
  if(isFoot(c))return .25;if(c.police)return c.v.kind==='car'?1:.45;return c.npc?1.2:1.3;
}
function collisions(){
  const bodies=[P,...cops,...traffic,...abandoned];for(const h of humans)if(h.state!=='dead')bodies.push(h);
  for(let a=0;a<bodies.length;a++)for(let b=a+1;b<bodies.length;b++){
    const A=bodies[a],B=bodies[b];if(A.air>0||B.air>0)continue;
    const rs=A.v.r+B.v.r,dx=B.x-A.x,dy=B.y-A.y;if(Math.abs(dx)>rs||Math.abs(dy)>rs)continue;
    const d=Math.hypot(dx,dy);if(d>=rs||d<.01)continue;
    const fa=isFoot(A),fb=isFoot(B),nx=dx/d,ny=dy/d,o=(rs-d)/2;
    if(fa&&fb){A.x-=nx*o;A.y-=ny*o;B.x+=nx*o;B.y+=ny*o;continue;}
    const ma=massOf(A),mb=massOf(B),wa=1/ma/(1/ma+1/mb);
    A.x-=nx*o*2*wa;A.y-=ny*o*2*wa;B.x+=nx*o*2*(1-wa);B.y+=ny*o*2*(1-wa);
    const rel=(B.vx-A.vx)*nx+(B.vy-A.vy)*ny;if(rel>=0)continue;
    const impact=-rel,j=-1.5*rel/(1/ma+1/mb);
    if(fa||fb){
      const hu=fa?A:B,ve=fa?B:A,sgn=fa?-1:1;
      hu.kx=(hu.kx||0)+sgn*nx*impact*.8;hu.ky=(hu.ky||0)+sgn*ny*impact*.8;
      if(hu===P){if(impact>60&&!ve.dead){damagePlayer((impact-60)*.14);shake=Math.max(shake,impact*.02);}}
      else if(impact>85){damage(hu,impact*.42,ve===P?'player':'world',Math.atan2(sgn*ny,sgn*nx));if(ve===P)SFX.play('hit',.8);}
      continue;
    }
    A.vx-=j/ma*nx;A.vy-=j/ma*ny;B.vx+=j/mb*nx;B.vy+=j/mb*ny;
    if(impact>120)sparks(A.x+nx*A.v.r,A.y+ny*A.v.r,Math.min(14,impact/30),-nx,-ny);
    const withP=A===P?B:B===P?A:null;
    if(withP){
      if(impact>140)SFX.play('crash',Math.min(1,impact/500));
      if(withP.police&&!withP.wreck&&cops.includes(withP)){
        withP.hitP=T;if(impact>90&&stars<2)crime(2,'Angriff auf Polizei');
        P.hp-=Math.max(0,impact-140)*.025*V.armor;withP.hp-=Math.max(0,impact-60)*.3*V.ram;shake=Math.max(shake,impact*.015);if(withP.hp<=0)wreckCop(withP,'GERAMMT',true);
      }else{
        P.hp-=Math.max(0,impact-170)*.03*V.armor;
        if(withP.npc&&!withP.dead){withP.hp-=Math.max(0,impact-80)*.25*V.ram;withP.panic=Math.max(withP.panic||0,5);if(withP.hp<=0)explodeVehicle(withP,'player');}
      }
    }else{
      for(const C of [A,B]){
        if(C.police&&!C.wreck&&cops.includes(C)){C.hp-=Math.max(0,impact-120)*.3;if(C.hp<=0)wreckCop(C,A.police&&B.police?'MASSENKARAMBOLAGE':'COP GECRASHT',false);}
        else if(C.npc&&!C.dead){C.hp-=Math.max(0,impact-120)*.2;if(C.hp<=0)explodeVehicle(C,'world');}
      }
    }
  }
  if(onFoot){P.kx+=P.vx-P.pvx;P.ky+=P.vy-P.pvy;}
}
function update(dt){
  T+=dt;clock=(clock+dt)%1440;jamT=Math.max(0,jamT-dt);deliverT=Math.max(0,deliverT-dt);hitFlash=Math.max(0,hitFlash-dt);
  if(onFoot)updateFoot(dt);else updateDrive(dt);
  nitro=Math.min(1,nitro+dt*.025);lastPos.x=P.x;lastPos.y=P.y;
  curD=getCell(Math.floor(P.x/CELL),Math.floor(P.y/CELL)).d;
  updateCombat(dt);updatePlaces();updateHumans(dt);updateTraffic(dt);updatePolice(dt);
  for(const c of abandoned){c.vx*=Math.exp(-2.5*dt);c.vy*=Math.exp(-2.5*dt);c.x+=c.vx*dt;c.y+=c.vy*dt;c.steer*=.9;collideWorld(c,c.v.r);
    if(c.dead&&Math.random()<.25)smoke(c.x+rnd(-8,8),c.y+rnd(-8,8),rnd(10,18),.45,0x45464e,12);}
  collisions();
  pending=pending.filter(p=>{p.t-=dt;if(p.t<=0){crime(p.min,p.reason,p.bump);return false;}return true;});
  const sp=Math.hypot(P.vx,P.vy);
  if(stars>0){
    let near=0;
    for(const c of cops)if(!c.wreck&&c.mode==='chase'&&P.air<=0&&Math.hypot(c.x-P.x,c.y-P.y)<(onFoot?75:100))near++;
    for(const h of humans)if(h.role==='cop'&&h.state!=='dead'&&Math.hypot(h.x-P.x,h.y-P.y)<42)near+=1.5;
    if(!onFoot)for(const c of cops){if(c.wreck||c.mode!=='chase')continue;const d=Math.hypot(c.x-P.x,c.y-P.y);if(d<72&&sp>320)c.close=true;
      if(c.close&&d>105){c.close=false;if(T-c.hitP>.8){addCash(25*(1+stars),P.x,P.y,'KNAPP!');nitro=Math.min(1,nitro+.12);}}}
    const slow=onFoot?Math.abs(P.spd)<60:sp<130;
    if(near&&slow)busted+=dt*(1+.4*(near-1))*(onFoot?1.3:1);else busted=Math.max(0,busted-dt*.9);
    seen=copSees(P.x,P.y);
    if(seen){lastSeen.x=P.x;lastSeen.y=P.y;hiddenT=0;}
    else{hiddenT+=dt;if(Math.hypot(P.x-lastSeen.x,P.y-lastSeen.y)>zoneR()&&hiddenT>3+1.1*stars)clearWanted('ABGEHÄNGT');}
    if(busted>POL.bust){gotBusted();return;}
  }else{busted=0;seen=false;}
  if(P.hp<=0){
    if(onFoot){killPlayer();return;}
    const car=P,fx=Math.cos(car.a),fy=Math.sin(car.a);car.dead=true;car.hp=0;
    car.m.root.traverse(o=>{if(o.isMesh)o.material=wreckMat;});blast(car.x,car.y,'world');abandoned.push(car);
    P=makePedAt(car.x-fy*(car.v.Wd/2+16),car.y+fx*(car.v.Wd/2+16),car.a);P.hp=Math.min(pedHp,45);P.kx=-fy*160;P.ky=fx*160;onFoot=true;setLabels();
    news('Fahrzeug explodiert in '+DNAME[curD]+', Fahrer flüchtet zu Fuß');banner('FAHRZEUG ZERSTÖRT');shake=16;
  }
  let pc=0;
  cops=cops.filter(c=>{const d=Math.hypot(c.x-P.x,c.y-P.y);let keep=c.wreck?(c.wreck<9&&d<2200):d<2400;
    if(keep&&!c.wreck&&c.mode==='patrol'){pc++;if((pc>PATROL&&d>700)||d>1700)keep=false;}if(!keep)dropModel(c);return keep;});
  abandoned=abandoned.filter(c=>{const d=Math.hypot(c.x-P.x,c.y-P.y);const keep=c.own!==undefined?d<3600:c.dead?d<1500:d<2200;if(!keep)dropModel(c);return keep;});
  spikes=spikes.filter(s=>{s.t-=dt;if(s.t<=0){scene.remove(s.m);return false;}return true;});
  if(waypoint&&Math.hypot(P.x-waypoint.x,P.y-waypoint.y)<70){waypoint=null;toast('Ziel erreicht');}
  if((saveClock+=dt)>10){saveClock=0;save();}
}
function killPlayer(){
  P.hp=0;PEDM.dead=true;setGun(PEDM,null);wasted();
}

/* ---------- Scene sync ---------- */
let camYaw=0,camDistS=80,camHS=34,inShopNow=null;
const wpBeam=new THREE.Mesh(BEAMG,new THREE.MeshBasicMaterial({color:0xffd23a,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
wpBeam.scale.set(10,700,10);wpBeam.visible=false;scene.add(wpBeam);
function place(c,dt){
  const m=c.m,base=groundBase(c.x,c.y);c.gy+=(base-c.gy)*Math.min(1,dt*12);
  const p=c.air>0?1-c.air/c.airMax:0,jump=c.air>0?Math.sin(PI*p)*c.airMax*80:0;
  m.root.position.set(c.x,c.gy+jump,c.y);m.root.rotation.y=-c.a;m.root.rotation.z=c.air>0?(.22-.44*p)*.6:0;
  const sp=Math.hypot(c.vx,c.vy);
  if(c.v.kind!=='car')m.lean.rotation.x=c.steer*.45*Math.min(1,sp/300);else m.lean.rotation.x=-c.steer*.04*Math.min(1,sp/300);
  c.sh.position.set(c.x+jump*.3,c.gy+.5,c.y+jump*.3);c.sh.rotation.y=-c.a;c.sh.material.opacity=c.air>0?.5:1;
  const s=1-jump/220;c.sh.scale.set(c.v.L*.68*s,1,Math.max(c.v.Wd,9)*.95*s);
}
function animHuman(h,dt,o){
  const m=h.m,base=groundBase(h.x,h.y);h.gy+=(base-h.gy)*Math.min(1,dt*12);
  m.root.position.set(h.x,h.gy+(h.jy||0),h.y);m.root.rotation.y=-h.a;
  h.sh.position.set(h.x,h.gy+.5,h.y);
  if(h.state==='dead'||m.dead){
    const k=Math.min(1,dt*7),tz=(h.fallDir||1)*1.52;m.lean.rotation.z+=(tz-m.lean.rotation.z)*k;m.lean.position.y=1.4*Math.abs(m.lean.rotation.z)/1.52;
    m.legs.forEach(l=>l.rotation.z*=.85);m.arms[0].rotation.set(0,0,.6);m.arms[1].rotation.set(0,0,-.4);return;
  }
  m.lean.position.y=0;
  const s=Math.abs(h.spd||0);m.ph+=s*dt*.13*((h.spd||0)<0?-1:1);const amp=Math.min(1,s/150)*.95,air=(h.jy||0)>0;
  m.legs[0].rotation.z=air?.9:Math.sin(m.ph)*amp;m.legs[1].rotation.z=air?-.4:-Math.sin(m.ph)*amp;
  m.lean.rotation.z=-Math.min(.28,s/1000);m.lean.position.y=air?0:Math.abs(Math.sin(m.ph))*amp*1.2;
  const pose=o||h.state;
  if(pose==='hands'){m.arms[0].rotation.set(.3,0,PI*.93);m.arms[1].rotation.set(-.3,0,PI*.93);}
  else if(pose==='aim'||h.aim||h.state==='shoot'){const two=m.gunType&&m.gunType!=='pistol';m.arms[0].rotation.set(0,0,1.5);m.arms[1].rotation.set(two?.42:0,0,two?1.35:-.2);}
  else if(pose==='punch'){m.arms[0].rotation.set(0,0,1.65);m.arms[1].rotation.set(0,0,.5);}
  else if(pose==='flee'){m.arms[0].rotation.set(.2,0,2.6+Math.sin(m.ph*2)*.3);m.arms[1].rotation.set(-.2,0,2.6-Math.sin(m.ph*2)*.3);}
  else{m.arms[0].rotation.set(0,0,-Math.sin(m.ph)*amp*.9);m.arms[1].rotation.set(0,0,Math.sin(m.ph)*amp*.9);}
  if(air){m.arms[0].rotation.z=-2.4;m.arms[1].rotation.z=-2.4;}
}
const menuCam={x:0,y:0};
function sync(dt){
  const menu=state==='menu'||!P,fX=menu?menuCam.x:P.x,fY=menu?menuCam.y:P.y;
  ensureCells(fX,fY);groundPlane.position.set(Math.round(fX/100)*100,0,Math.round(fY/100)*100);
  if(P){P.m.root.visible=!menu;P.sh.visible=!menu;}
  head.intensity=!menu&&!onFoot?2.4:0;
  if(!menu){
    if(onFoot){PEDM.dead=P.hp<=0;const armed=curW!=='fist';setGun(PEDM,armed?curW:null);
      animHuman(P,dt,P.punchT>0?'punch':armed&&(K.fire||aimTarget)?'aim':null);}
    else{place(P,dt);if(P.m.brake)P.m.brake.color.setHex(K.brake?0xff2040:0x6a0e1c);}
  }
  for(const c of abandoned){place(c,dt);if(c.copcar&&c.m.red){const on=stars>0&&((T*7)%2)<1;c.m.red.color.setHex(on?0xff2040:0x3a0810);c.m.blue.color.setHex(stars>0&&!on?0x2a70ff:0x0a1840);if(c.m.glow)c.m.glow.visible=stars>0&&!c.dead;}}
  for(const c of traffic)place(c,dt);
  for(const h of humans)animHuman(h,dt,h.state==='flee'?'flee':null);
  const blinkOn=t=>((T*7+t)%2)<1;
  for(const c of cops){place(c,dt);if(!c.wreck&&c.m.red){const ch=c.mode==='chase',on=blinkOn(c.ph);
    c.m.red.color.setHex(ch&&on?0xff2040:0x3a0810);c.m.blue.color.setHex(ch&&!on?0x2a70ff:0x0a1840);if(c.m.glow){c.m.glow.visible=ch;if(ch)c.m.glow.material.color.setHex(on?0xff2040:0x2a60ff);}}}
  const act=menu?[]:cops.filter(c=>!c.wreck&&c.mode==='chase').sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y));
  copLights.forEach((l,k)=>{const c=act[k];if(!c){l.intensity=0;return;}l.intensity=2.2;l.position.set(c.x,c.gy+30,c.y);l.color.setHex(blinkOn(c.ph)?0xff2040:0x2a60ff);});
  for(const h of helis){
    h.g.position.set(h.x,h.alt+(h.dead?0:Math.sin(T*1.3)*4),h.y);h.g.rotation.y=-h.a;h.g.rotation.z=h.dead?.5:-Math.min(.25,(h.spd||0)/2000);
    h.rot.rotation.y+=dt*24;h.tr.rotation.z+=dt*30;h.blink.visible=(T*2%1)<.5;
    const on=jamT<=0&&!h.dead&&!h.leave;h.beam.visible=h.spot.visible=on;h.beam.scale.set(115,h.alt,115);h.beam.position.set(h.x,h.alt/2,h.y);
    h.spot.scale.set(140,1,140);h.spot.position.set(h.x,groundBase(h.x,h.y)+.8,h.y);
  }
  const pulse=.55+.35*Math.sin(performance.now()/280);for(const k in RINGM)RINGM[k].opacity=pulse;
  wpBeam.visible=!!waypoint&&!menu;if(waypoint)wpBeam.position.set(waypoint.x,350,waypoint.y);
  inShopNow=menu?null:insidePlace(P.x,P.y);
  for(const [id,v] of SHOPVIS){const hide=!!inShopNow&&inShopNow.id===id;v.roof.visible=!hide;v.front.visible=!hide;}
  tickParticles(dt);
  // sound loops
  if(menu||paused||state!=='play')SFX.loops({engine:-1});
  else{
    const sp=Math.hypot(P.vx,P.vy);let siren=0,heli=0;
    for(const c of cops)if(!c.wreck&&c.mode==='chase')siren=Math.max(siren,1-Math.hypot(c.x-P.x,c.y-P.y)/900);
    for(const h of helis)if(!h.dead)heli=Math.max(heli,1-Math.hypot(h.x-P.x,h.y-P.y)/1200);
    SFX.loops({engine:onFoot?-1:clamp(sp/V.max,0,1.25),kind:onFoot?'car':V.kind,siren:Math.max(0,siren),sirenHi:(T*1.6%1)<.5,skid:!onFoot&&P.air<=0&&Math.abs(P.vl)>110?1:0,heli:Math.max(0,heli)});
  }
  if(menu){
    $('speed').style.opacity=0;$('nitroTint').style.opacity=0;
    const t=performance.now()/1000;camera.position.set(menuCam.x+Math.cos(t*.12)*260,170,menuCam.y+Math.sin(t*.12)*260);camera.lookAt(menuCam.x,40,menuCam.y);
    camera.fov=baseFov;camera.updateProjectionMatrix();return;
  }
  if(dt===0)return;
  const sp=Math.hypot(P.vx,P.vy),by=P.m.root.position.y,sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;
  if(inShopNow){
    const b=inShopNow.box;tmpV.set(clamp(P.x,b.bx+60,b.bx+b.bw-60)+sx,by+175,Math.min(P.y,b.by+b.bh-90)+120+sy);
    camera.position.lerp(tmpV,1-Math.exp(-6*dt));camera.lookAt(P.x,by+8,P.y);
    camera.fov+=(baseFov-camera.fov)*Math.min(1,dt*4);camera.updateProjectionMatrix();camYaw=P.a;
    $('speed').style.opacity=0;$('nitroTint').style.opacity=0;return;
  }
  camYaw+=adiff(P.a,camYaw)*Math.min(1,dt*(P.air>0?1.5:onFoot?(K.fire?9:5):3.8));
  const fx=Math.cos(camYaw),fz=Math.sin(camYaw);
  let dist,hgt;
  if(camMode===0){dist=onFoot?46:68+sp*.035;hgt=onFoot?24:28+sp*.012;
    for(const t of [.3,.55,.8,1])if(tallAt(P.x-fx*dist*t,P.y-fz*dist*t)){dist=Math.max(26,dist*t-16);hgt+=34;break;}}
  else{dist=onFoot?90:150;hgt=onFoot?260:430;}
  camDistS+=(dist-camDistS)*Math.min(1,dt*5);camHS+=(hgt-camHS)*Math.min(1,dt*4);
  tmpV.set(P.x-fx*camDistS+sx,by+camHS+sy,P.y-fz*camDistS+sx);
  camera.position.lerp(tmpV,1-Math.exp(-12*dt));
  const la=camMode===0?(onFoot?18:44):10;camera.lookAt(P.x+fx*la,by+(camMode===0?(onFoot?14:10):0),P.y+fz*la);
  if(sp>520&&!onFoot&&state==='play'){const q=(sp-520)*.004;camera.position.x+=(Math.random()-.5)*q;camera.position.y+=(Math.random()-.5)*q;}
  const nOn=!onFoot&&K.nitro&&nitro>.02&&state==='play';
  const sl=onFoot||state!=='play'?0:clamp((sp-380)/520,0,.9),spd=$('speed');spd.style.opacity=sl;spd.style.transform=`rotate(${Math.random()*9}deg)`;
  $('nitroTint').style.opacity=nOn?1:0;
  const ft=baseFov+Math.min(24,sp*.027)+(nOn?10:0);camera.fov+=(ft-camera.fov)*Math.min(1,dt*4);camera.updateProjectionMatrix();
}
function tickFX(dt){
  shake*=Math.exp(-7*dt);
  if(state==='menu'){menuCam.y-=40*dt;if(menuCam.y<BMIN+700)menuCam.y=BMAX-700;}
  floats=floats.filter(f=>{f.l-=dt;f.h+=34*dt;if(f.l<=0){f.el.remove();return false;}
    tmpV.set(f.x,f.h+(P?P.m.root.position.y:0),f.y).project(camera);
    if(tmpV.z>1){f.el.style.opacity=0;return true;}
    f.el.style.opacity=Math.min(1,f.l*2);f.el.style.transform=`translate(-50%,-50%) translate(${(tmpV.x*.5+.5)*W}px,${(-tmpV.y*.5+.5)*H}px)`;return true;});
}

/* ---------- Menu, previews, loop ---------- */
const PREV=[];
(function makePreviews(){
  try{
    const pc=document.createElement('canvas'),pr=new THREE.WebGLRenderer({canvas:pc,antialias:true,alpha:true,preserveDrawingBuffer:true});
    pr.setPixelRatio(1);pr.setSize(400,200,false);
    const s=new THREE.Scene();s.add(new THREE.HemisphereLight(0x9aa8d8,0x201418,1));
    const d1=new THREE.DirectionalLight(0xffffff,.95);d1.position.set(1,2,1.4);s.add(d1);const d2=new THREE.DirectionalLight(0xff2e4d,.6);d2.position.set(-2,1,-1.2);s.add(d2);
    const d3=new THREE.DirectionalLight(0x3af0ff,.4);d3.position.set(-1,.5,2);s.add(d3);
    const sh=new THREE.Mesh(CIRC,new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));s.add(sh);
    const cam=new THREE.PerspectiveCamera(26,2,1,2000);
    VEH.forEach((v,i)=>{const m=buildVehicle(v);s.add(m.root);m.root.rotation.y=-.5;sh.scale.set(v.L*.8,1,v.Wd*1.4);
      const r=Math.max(v.L,24);cam.position.set(r*1.55,r*1.05,r*2.1);cam.lookAt(0,v.kind==='car'?6:11,0);
      pr.render(s,cam);PREV[i]=pc.toDataURL();s.remove(m.root);m.geos.forEach(g=>g.dispose());});
    pr.dispose();
  }catch(e){}
})();
let newArm=false;
function refreshMenu(){
  const s=loadSave();$('cont').hidden=!s;newArm=false;$('newg').textContent='NEUES SPIEL';$('newg').classList.toggle('alt',!!s);
  $('saveInfo').textContent=s?'Spielstand: '+$$(s.money)+' · '+s.owned.length+(s.owned.length>1?' Fahrzeuge':' Fahrzeug')+' · '+s.weapons.length+' Waffen':'';
}
$('cont').addEventListener('click',()=>startGame(false));
$('newg').addEventListener('click',()=>{if(loadSave()&&!newArm){newArm=true;$('newg').textContent='SICHER? NOCHMAL TIPPEN';return;}startGame(true);});
$('again').addEventListener('click',()=>respawn(nextSpawn));
refreshMenu();
let last=performance.now();
function frame(now){
  const raw=Math.min(.033,(now-last)/1000);last=now;
  const dt=paused?0:raw*timeScale;
  if(state==='play'&&!paused)update(dt);
  tickFX(dt);sync(dt);renderer.render(scene,camera);
  if(state!=='menu'&&P)renderMinimap();hud(now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
document.addEventListener('visibilitychange',()=>{last=performance.now();for(const k in K)K[k]=false;if(document.hidden)save();});
