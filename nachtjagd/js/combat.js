/* ---------- Weapons, damage, explosions, robbery, weapon wheel ---------- */
const WICON={
  fist:'<rect x="16" y="6" width="16" height="12" rx="4"/><rect x="12" y="9" width="6" height="8" rx="2"/>',
  pistol:'<rect x="10" y="7" width="26" height="5" rx="1"/><rect x="12" y="11" width="6" height="9" rx="1"/>',
  smg:'<rect x="6" y="8" width="32" height="6" rx="1"/><rect x="18" y="13" width="4" height="9"/><rect x="10" y="13" width="5" height="6"/><rect x="38" y="10" width="6" height="2"/>',
  shotgun:'<rect x="2" y="9" width="42" height="3"/><rect x="2" y="12" width="12" height="6" rx="2"/><rect x="22" y="12" width="10" height="3"/>',
  rifle:'<rect x="4" y="9" width="38" height="4"/><rect x="4" y="12" width="9" height="7" rx="1"/><rect x="22" y="13" width="4" height="8"/><rect x="42" y="10" width="5" height="2"/>'};
const canDriveBy=()=>curW==='pistol'||curW==='smg';
function validTarget(e){if(!e)return false;if(e.isHeli)return !e.dead&&!e.removed;if(e.v.kind!=='foot')return !(e.wreck||e.dead)&&(cops.includes(e)||traffic.includes(e));return e.state!=='dead'&&humans.includes(e);}
function pickTarget(){
  const w=WPN[curW];if(w.melee)return null;
  const veh=!onFoot,range=w.range,cone=veh?.6:1,ox=P.x,oy=P.y,c=[];
  const add=(e,pri)=>{const dx=e.x-ox,dy=e.y-oy,d=Math.hypot(dx,dy);if(d>range||d<2)return;const ad=Math.abs(adiff(Math.atan2(dy,dx),P.a));if(ad>cone)return;c.push({e,s:d+ad*220-pri});};
  for(const h of humans)if(h.state!=='dead')add(h,h.role==='cop'?120:h.role==='clerk'?60:0);
  for(const v of cops)if(!v.wreck)add(v,80);
  for(const v of traffic)add(v,-40);
  for(const h of helis)if(!h.dead&&!h.leave)add(h,40);
  c.sort((a,b)=>a.s-b.s);
  for(const q of c.slice(0,4))if(q.e.isHeli||los(ox,oy,q.e.x,q.e.y))return q.e;
  return null;
}
function castRay(ox,oy,ang,range,self){
  const dx=Math.cos(ang),dy=Math.sin(ang);let best=range,be=null;
  const test=(e,r)=>{if(e===self)return;const fx=e.x-ox,fy=e.y-oy,t=fx*dx+fy*dy;if(t<0||t>best+r)return;const l2=fx*fx+fy*fy-t*t;if(l2>r*r)return;const th=t-Math.sqrt(r*r-l2);if(th<best){best=Math.max(0,th);be=e;}};
  if(self!==P)test(P,P.v.r+(onFoot?.5:1));
  for(const h of humans)if(h.state!=='dead')test(h,6.5);
  for(const c of cops)if(!c.wreck)test(c,c.v.r);
  for(const c of traffic)test(c,c.v.r);
  for(const c of abandoned)if(!c.dead)test(c,c.v.r);
  let wall=false;for(let s=6;s<best;s+=6)if(solidAt(ox+dx*s,oy+dy*s)){best=s;be=null;wall=true;break;}
  return{e:be,wall,x:ox+dx*best,y:oy+dy*best};
}
function fire(){
  const w=WPN[curW];
  if(w.melee){punch();fireCD=w.rate;return;}
  if(reloadT>0)return;
  if((mags[curW]||0)<=0){if((SAVE.ammo[curW]||0)>0)startReload();else{SFX.play('empty');fireCD=.35;toast('Keine Munition. Kauf welche im Waffenladen.');}return;}
  mags[curW]--;SAVE.ammo[curW]=Math.max(0,(SAVE.ammo[curW]||0)-1);fireCD=w.rate;
  const veh=!onFoot,fa=P.a,ox=P.x+Math.cos(fa)*(veh?4:9),oy=P.y+Math.sin(fa)*(veh?4:9),oh=P.m.root.position.y+(veh?13:15);
  const t=aimTarget,base=t?Math.atan2(t.y-oy,t.x-ox):fa,spr=w.spread*(Math.hypot(P.vx,P.vy)>60?1.6:1)*(veh?1.5:1);
  for(let k=0;k<(w.pellets||1);k++){
    const ang=base+rnd(-spr,spr);
    if(t&&t.isHeli){tracer(ox,oh,oy,t.x+rnd(-24,24),t.alt+rnd(-8,8),t.y+rnd(-24,24));if(Math.random()<.55)damage(t,w.dmg,'player');continue;}
    const r=castRay(ox,oy,ang,w.range,P);
    const th=r.e?(r.e.v.kind!=='foot'?r.e.gy+9:r.e.gy+12):oh-2;
    tracer(ox,oh,oy,r.x,th,r.y);
    if(r.e)damage(r.e,w.dmg,'player',ang);else if(r.wall)sparks(r.x,r.y,3,-Math.cos(ang),-Math.sin(ang),oh);
  }
  flash(ox,oh,oy);SFX.play(w.snd,1);shake=Math.max(shake,w.pellets?4:1.2);
  for(const q of humans)if(q.role==='civ'&&Math.hypot(q.x-P.x,q.y-P.y)<520)fleeFrom(q,P.x,P.y);
  for(const c of traffic)if(Math.hypot(c.x-P.x,c.y-P.y)<380)c.panic=Math.max(c.panic,6);
  if(stars===0&&T-lastShotRep>4){lastShotRep=T;if(copSees(P.x,P.y,700))crime(1,'Schüsse in der Öffentlichkeit');else report(1,'Schüsse in der Öffentlichkeit');}
  if(mags[curW]<=0&&(SAVE.ammo[curW]||0)>0)startReload();
}
function punch(){
  P.punchT=.25;SFX.play('punch',.6);
  let best=null,bd=26;for(const h of humans){if(h.state==='dead')continue;const dx=h.x-P.x,dy=h.y-P.y,d=Math.hypot(dx,dy);if(d<bd&&Math.abs(adiff(Math.atan2(dy,dx),P.a))<1.1){bd=d;best=h;}}
  if(best){damage(best,WPN.fist.dmg,'player',P.a);best.kx+=Math.cos(P.a)*130;best.ky+=Math.sin(P.a)*130;}
}
function damage(e,dmg,src,ang){
  const byP=src==='player';
  if(e.isHeli){if(e.dead)return;e.hp-=dmg;sparks(e.x,e.y,2,0,0,e.alt);if(byP&&stars<3)crime(3,'Schüsse auf Polizeihubschrauber');if(e.hp<=0)downHeli(e);return;}
  if(e.v.kind!=='foot'){
    if(e.dead||e.wreck)return;
    sparks(e.x+rnd(-6,6),e.y+rnd(-6,6),2,rnd(-1,1),rnd(-1,1),10);e.hp-=dmg*.5;
    if(e.police){if(byP&&stars<2)crime(2,'Schüsse auf Polizei');if(e.hp<=0){if(cops.includes(e))wreckCop(e,'COP ZERSTÖRT',byP);else explodeVehicle(e,src);}}
    else{if(e.npc){e.panic=8;if(traffic.includes(e)&&!e.taken&&e.hp<80)bail(e);}if(e.hp<=0)explodeVehicle(e,src);}
    return;
  }
  if(e.state==='dead')return;
  e.hp-=dmg;blood(e.x,e.y,e.gy+12);
  if(ang!==undefined){e.kx+=Math.cos(ang)*40;e.ky+=Math.sin(ang)*40;}
  const kill=e.hp<=0;
  if(byP){
    if(e.role==='civ'){fleeFrom(e,P.x,P.y,8);report(kill?2:1,kill?'Mord an Passant':'Angriff auf Passant',kill);if(kill)SAVE.stats.kills++;}
    else if(e.role==='cop'){crime(kill?3:2,kill?'Polizist erschossen':'Angriff auf Polizei',kill);if(kill)SAVE.stats.cops++;}
    else if(e.role==='clerk'){report(2,kill?'Verkäufer getötet':'Angriff auf Verkäufer',kill);}
  }else if(e.role==='civ')fleeFrom(e,P.x,P.y,8);
  if(kill)killHuman(e,ang);
}
function damagePlayer(dmg){
  if(state!=='play'||!P)return;hitFlash=.35;
  if(onFoot){if(armor>0){const a=Math.min(armor,dmg);armor-=a;dmg-=a;}P.hp-=dmg;}
  else P.hp-=dmg*.6*(V.armor||1);
}
function explodeVehicle(c,src){
  if(c.dead)return;c.dead=true;c.hp=0;
  c.m.root.traverse(o=>{if(o.isMesh)o.material=wreckMat;});if(c.m.glow)c.m.glow.visible=false;
  if(traffic.includes(c)&&!c.taken){c.taken=true;abandoned.push(c);}
  if(src==='player'&&c.npc)report(1,'Fahrzeug gesprengt');
  blast(c.x,c.y,src);
}
function blast(x,y,src){
  boom(x,y);SFX.play('boom',vol(x,y));shake=Math.max(shake,18*vol(x,y));panic(x,y,600);
  const R=95;
  for(const h of humans){if(h.state==='dead')continue;const d=Math.hypot(h.x-x,h.y-y);if(d<R){const a=Math.atan2(h.y-y,h.x-x);damage(h,150*(1-d/R),src,a);h.kx+=Math.cos(a)*220;h.ky+=Math.sin(a)*220;}}
  for(const c of [...cops,...traffic,...abandoned]){if(c.dead||c.wreck)continue;const d=Math.hypot(c.x-x,c.y-y);if(d<R&&d>2)damage(c,220*(1-d/R),src);}
  if(P&&state==='play'){const d=Math.hypot(P.x-x,P.y-y);if(d<R)damagePlayer((onFoot?95:170)*(1-d/R));}
}
function startReload(){const w=WPN[curW];if(w.melee||reloadT>0)return;const have=SAVE.ammo[curW]||0,m=mags[curW]||0;if(m>=w.mag||have<=m)return;reloadT=1.1;SFX.play('reload');}
function selectWeapon(w){
  if(!SAVE.weapons.includes(w))return;
  if(w!==curW){if(curW!=='fist')lastW=curW;curW=w;reloadT=0;aimTarget=null;if(WPN[w].mag&&mags[w]===undefined)mags[w]=Math.min(WPN[w].mag,SAVE.ammo[w]||0);SFX.play('reload',.6);}
}
function holster(){if(curW!=='fist')selectWeapon('fist');else if(SAVE.weapons.includes(lastW))selectWeapon(lastW);}
let lastDB=-9;
function updateCombat(dt){
  fireCD=Math.max(0,fireCD-dt);P.punchT=Math.max(0,(P.punchT||0)-dt);
  if(reloadT>0){reloadT-=dt;if(reloadT<=0)mags[curW]=Math.min(WPN[curW].mag,SAVE.ammo[curW]||0);}
  const armed=curW!=='fist',usable=armed&&(onFoot||canDriveBy());
  aimRe-=dt;
  if(usable){if(aimRe<=0||!validTarget(aimTarget)){aimRe=.2;aimTarget=pickTarget();}}else aimTarget=null;
  if(K.fire&&fireCD<=0){
    if(!onFoot&&armed&&!canDriveBy()){if(T-lastDB>3){lastDB=T;toast('Aus dem Fahrzeug nur mit Pistole oder MP');}}
    else if(onFoot||armed)fire();
  }
  if(onFoot&&K.fire&&aimTarget){P.a+=adiff(Math.atan2(aimTarget.y-P.y,aimTarget.x-P.x),P.a)*Math.min(1,dt*14);}
  if(aimTarget&&stars===0&&(aimTarget.role==='cop'||aimTarget.police))crime(1,'Waffe auf Polizei gerichtet');
  if(aimTarget&&onFoot&&aimTarget.role==='civ')fleeFrom(aimTarget,P.x,P.y,6);
  updateRobbery(dt);
}
function updateRobbery(dt){
  const t=aimTarget,pl=(t&&t.role==='clerk'&&t.state!=='dead'&&onFoot&&curW!=='fist'&&t.place&&t.place.t.rob&&insidePlace(P.x,P.y)===t.place)?t.place:null;
  if(pl){
    const clerk=t;
    if(T-(pl.robT??-999)<180){if(rob.pl!==pl){rob.pl=pl;rob.prog=0;toast('Die Kasse ist noch leer. Komm später wieder.');}if(clerk.state!=='shoot'){clerk.state='hands';clerk.handsT=2;}rob.active=false;return;}
    if(rob.pl!==pl){rob.pl=pl;rob.prog=0;panic(P.x,P.y,300);
      if(Math.random()<.35){crime(2,'Stiller Alarm im '+pl.t.name);}
      if(pl.type==='gun'&&Math.random()<.5)clerk.fightT=rnd(.8,1.5);}
    if(clerk.state!=='shoot'){clerk.state='hands';clerk.handsT=2.5;}
    rob.active=true;rob.prog+=dt;
    if(rob.prog>=3.2){
      const cash=Math.round(rnd(pl.t.loot[0],pl.t.loot[1])/10)*10;addCash(cash,P.x,P.y,'BEUTE');SFX.play('cash');
      pl.robT=T;SAVE.stats.robs++;rob.prog=0;rob.active=false;
      crime(2,'Raubüberfall auf '+pl.t.name);news('Raubüberfall auf '+pl.t.name+' in '+DNAME[curD]+', Täter flüchtig');
    }
  }else{rob.active=false;rob.prog=Math.max(0,rob.prog-dt*.6);if(rob.prog<=0)rob.pl=null;}
}
/* weapon wheel */
function openWheel(){if(state!=='play'||paused||wheelOpen)return;wheelOpen=true;timeScale=.15;$('wheel').hidden=false;renderWheel();}
function closeWheel(){if(!wheelOpen)return;wheelOpen=false;timeScale=1;$('wheel').hidden=true;}
function renderWheel(){
  const box=$('wslots');box.querySelectorAll('.wslot').forEach(b=>b.remove());
  WORDER.forEach((w,i)=>{
    const own=SAVE.weapons.includes(w),a=-PI/2+i*TAU/WORDER.length,b=document.createElement('button');
    b.type='button';b.className='wslot'+(w===curW?' on':'')+(own?'':' off');b.style.left=(50+Math.cos(a)*35)+'%';b.style.top=(50+Math.sin(a)*35)+'%';
    const info=w==='fist'?'Einstecken':own?(SAVE.ammo[w]||0)+' Schuss':'Im Waffenladen';
    b.innerHTML=`<svg viewBox="0 0 48 24" aria-hidden="true">${WICON[w]}</svg><b>${WPN[w].name}</b><span>${info}</span><i>${i+1}</i>`;
    b.disabled=!own;b.addEventListener('click',e=>{e.stopPropagation();selectWeapon(w);closeWheel();});box.appendChild(b);
  });
  $('wName').textContent=WPN[curW].name;
}
