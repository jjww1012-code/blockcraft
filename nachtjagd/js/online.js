'use strict';
/* ---------- Online: andere Spieler in derselben Stadt (jeder hat seine eigene Polizei) ---------- */
const NET={room:null,remotes:new Map(),sendT:0,specT:0,lastSpec:''};
const ONCOL=['#3dff9a','#3af0ff','#ffd23a','#ff7ad9','#ff8a2e','#a98bff','#ffffff','#7dff4a'];
function onColor(id){let h=0;for(const ch of String(id))h=(h*31+ch.charCodeAt(0))|0;return ONCOL[Math.abs(h)%ONCOL.length];}
$('onName').value=Profile.name;
const onName=()=>{const n=$('onName').value.trim().slice(0,14)||'Spieler';Profile.name=n;return n;};
// Polizei-Stärke
function markPol(){const i=POLDIFF.indexOf(POL);$('polSel').querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.v===i));}
$('polSel').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;POL=POLDIFF[+b.dataset.v];try{localStorage.setItem('nachtjagd-pol',b.dataset.v);}catch(_){}markPol();});
markPol();
const qc=new URLSearchParams(location.search).get('code');if(qc)$('onCode').value=qc.toUpperCase();

function onStatus(t){$('onStat').textContent=t;}
function wireRoom(r){
  NET.room=r;
  r.on('msg',(m,from)=>{if(m.t==='p')remoteState(from,m);else if(m.t==='hi'&&SAVE)toast(m.n+' ist in der Stadt');else if(m.t==='honk')remoteHonk(from);});
  r.on('peers',()=>{updateOnTag();for(const id of [...NET.remotes.keys()])if(!r.peers.some(p=>p.id===id))dropRemote(id);});
  r.on('leave',id=>{const R=NET.remotes.get(id);if(R&&state==='play')toast(R.name+' hat die Stadt verlassen');dropRemote(id);updateOnTag();});
  r.on('close',()=>{toast('Verbindung zum Raum verloren');for(const id of [...NET.remotes.keys()])dropRemote(id);NET.room=null;updateOnTag();onStatus('Nicht verbunden.');});
  NET.specT=0;NET.lastSpec='';updateOnTag();
  onStatus('✅ Verbunden – Raum '+r.code+'. Jetzt WEITERSPIELEN oder NEUES SPIEL drücken!');
}
$('onCreate').addEventListener('click',async()=>{
  if(NET.room)NET.room.leave();onStatus('Erstelle Raum …');
  try{wireRoom(await Room.create('nachtjagd',{name:onName()},8));}catch(e){onStatus('Online geht gerade nicht.');}
});
$('onJoin').addEventListener('click',async()=>{
  const code=$('onCode').value.trim().toUpperCase();if(code.length!==4){onStatus('Bitte den 4-stelligen Code eingeben.');return;}
  if(NET.room)NET.room.leave();onStatus('Verbinde …');
  try{wireRoom(await Room.join('nachtjagd',code,{name:onName()}));}catch(e){onStatus(e.message||'Raum nicht gefunden.');}
});
function updateOnTag(){
  const t=$('onTag');if(!NET.room){t.hidden=true;return;}
  const others=NET.room.peers.filter(p=>p.id!==SH_UID);
  t.hidden=false;t.textContent='🌐 '+NET.room.code+' · '+(others.length?others.map(p=>p.name).join(', '):'warte auf Freunde');
}

/* Fahrzeug-Beschreibung, die andere nachbauen können */
function mySpec(){
  if(!P)return null;if(onFoot)return 'f';
  const v=P.v,o={};for(const k in v){const x=v[k];if(typeof x==='string'||typeof x==='number'||typeof x==='boolean')o[k]=x;}
  return JSON.stringify(o);
}
function remoteState(id,m){
  if(id===SH_UID)return;
  let R=NET.remotes.get(id);
  if(!R){R={id,name:m.n||'Spieler',x:m.x,y:m.y,a:m.a,tx:m.x,ty:m.y,ta:m.a,spec:null,specStr:'',m:null,sh:null,el:null,col:onColor(id),spd:0,jy:0,gy:groundBase(m.x,m.y),st:0,wn:null};NET.remotes.set(id,R);
    R.el=document.createElement('div');R.el.className='ntag';R.el.style.borderLeft='4px solid '+R.col;$('pops').appendChild(R.el);}
  R.name=m.n||R.name;R.tx=m.x;R.ty=m.y;R.ta=m.a;R.spd=m.s||0;R.jy=m.j||0;R.st=m.st||0;R.wn=m.w||null;R.seen=performance.now();R.vx=m.vx||0;R.vy=m.vy||0;R.inMenu=!!m.menu;
  if(m.v&&m.v!==R.specStr){setRemoteModel(R,m.v);}
}
function setRemoteModel(R,specStr){
  if(R.m){scene.remove(R.m.root);if(R.m!==R.hm&&R.m.geos)R.m.geos.forEach(g=>g.dispose());}
  if(R.sh)scene.remove(R.sh);
  R.specStr=specStr;
  if(specStr==='f'){
    if(!R.hm)R.hm=buildHuman({shirt:R.col,pants:'#1f2a44',skin:'#c8996e',hair:'#1a1410',shoes:'#f1f1f5',stripe:'#ffffff',long:true});
    R.m=R.hm;R.v=HUMV;R.foot=true;
  }else{
    let v;try{v=JSON.parse(specStr);}catch(e){v=VEH[4];}
    try{R.m=buildVehicle(v);}catch(e){R.m=buildVehicle(VEH[4]);v=VEH[4];}
    R.v=v;R.foot=false;
  }
  R.sh=addShadow(R.v);scene.add(R.m.root);R.m.root.visible=true;
}
function dropRemote(id){
  const R=NET.remotes.get(id);if(!R)return;
  if(R.m){scene.remove(R.m.root);if(!R.foot&&R.m.geos)R.m.geos.forEach(g=>g.dispose());}
  if(R.hm&&R.hm!==R.m)R.hm.geos.forEach(g=>g.dispose());
  if(R.sh)scene.remove(R.sh);if(R.el)R.el.remove();NET.remotes.delete(id);
}
function remoteHonk(id){const R=NET.remotes.get(id);if(R&&P&&Math.hypot(R.x-P.x,R.y-P.y)<900){SFX.play('hit',.5);float(R.x,R.y,'HUP HUP!',R.col,1);}}

/* pro Frame: senden, Modelle bewegen, sanft schubsen, Namensschilder */
function netTick(dt){
  const room=NET.room,now=performance.now();
  if(room&&(NET.sendT-=dt)<=0){
    NET.sendT=.09;
    if(state!=='menu'&&P){
      const spec=mySpec(),m={t:'p',n:Profile.name,x:Math.round(P.x),y:Math.round(P.y),a:+P.a.toFixed(3),vx:Math.round(P.vx||0),vy:Math.round(P.vy||0),st:stars};
      if(onFoot){m.s=Math.round(P.spd||0);m.j=Math.round(P.jy||0);m.w=curW!=='fist'?curW:null;}
      if(spec!==NET.lastSpec||(NET.specT-=.09)<=0){m.v=spec;NET.lastSpec=spec;NET.specT=2;}
      room.send(m);
    }else if((NET.specT-=.09)<=0){NET.specT=2;room.send({t:'p',n:Profile.name,x:0,y:0,a:0,menu:1});}
  }
  const show=state!=='menu'&&!!P;
  for(const R of NET.remotes.values()){
    if(now-R.seen>8000){dropRemote(R.id);continue;}
    if(!R.m||R.inMenu||!show){if(R.m)R.m.root.visible=false;if(R.sh)R.sh.visible=false;R.el.style.opacity=0;continue;}
    R.m.root.visible=true;R.sh.visible=true;
    // Vorhersage + Glätten
    const k=Math.min(1,dt*10);R.tx+=R.vx*dt;R.ty+=R.vy*dt;
    R.x+=(R.tx-R.x)*k;R.y+=(R.ty-R.y)*k;if(Math.hypot(R.tx-R.x,R.ty-R.y)>400){R.x=R.tx;R.y=R.ty;}
    R.a+=adiff(R.ta,R.a)*k;
    const base=groundBase(R.x,R.y);R.gy+=(base-R.gy)*Math.min(1,dt*12);
    if(R.foot){
      const h={x:R.x,y:R.y,a:R.a,gy:R.gy,jy:R.jy,spd:R.spd,m:R.m,sh:R.sh,state:'walk'};animHuman(h,dt,R.wn?'aim':null);R.gy=h.gy;setGun(R.m,R.wn);
    }else{
      R.m.root.position.set(R.x,R.gy,R.y);R.m.root.rotation.y=-R.a;
      R.sh.position.set(R.x,R.gy+.5,R.y);R.sh.rotation.y=-R.a;R.sh.scale.set(R.v.L*.68,1,Math.max(R.v.Wd,9)*.95);
    }
    // Schubsen (nur der eigene Spieler wird bewegt)
    if(state==='play'&&P&&P.air<=0){
      const rs=(onFoot?6:V.r)+(R.v?R.v.r:8),dx=P.x-R.x,dy=P.y-R.y,d=Math.hypot(dx,dy);
      if(d<rs&&d>.01){const nx=dx/d,ny=dy/d,o=rs-d;P.x+=nx*o;P.y+=ny*o;
        const rel=(P.vx-R.vx)*nx+(P.vy-R.vy)*ny;if(rel<0){const j=onFoot?1.4:(R.foot?.15:.9);P.vx-=rel*nx*j;P.vy-=rel*ny*j;if(onFoot){P.kx=(P.kx||0)-rel*nx*.8;P.ky=(P.ky||0)-rel*ny*.8;}
          if(-rel>140){SFX.play('crash',Math.min(1,-rel/500));shake=Math.max(shake,-rel*.012);sparks(P.x-nx*8,P.y-ny*8,6,nx,ny);}}}
    }
    // Namensschild
    tmpV.set(R.x,R.gy+(R.foot?30:34),R.y).project(camera);
    const dist=P?Math.hypot(R.x-P.x,R.y-P.y):0;
    if(tmpV.z>1||dist>1600){R.el.style.opacity=0;}
    else{R.el.style.opacity=1;R.el.textContent=R.name+(R.st?' '+'★'.repeat(R.st):'');R.el.style.transform=`translate(-50%,-100%) translate(${(tmpV.x*.5+.5)*W}px,${(-tmpV.y*.5+.5)*H}px)`;}
  }
}
/* in die Hauptschleife einhängen */
const _sync0=sync;sync=function(dt){_sync0(dt);netTick(dt);};
const _mini0=renderMinimap;renderMinimap=function(){
  _mini0();if(!P||!NET.remotes.size)return;
  const Sz=208,R0=104,k=R0/1500;mx.save();mx.beginPath();mx.arc(R0,R0,R0,0,TAU);mx.clip();
  for(const R of NET.remotes.values()){if(!R.m||R.inMenu)continue;let dx=(R.x-P.x)*k,dy=(R.y-P.y)*k;const d=Math.hypot(dx,dy);if(d>R0-9){dx*=(R0-9)/d;dy*=(R0-9)/d;}
    mx.fillStyle=R.col;mx.strokeStyle='#000';mx.lineWidth=2;mx.beginPath();mx.arc(R0+dx,R0+dy,7,0,TAU);mx.fill();mx.stroke();}
  mx.restore();
};
/* Hupe: H-Taste schickt "Hup hup" an alle in der Nähe */
addEventListener('keydown',e=>{if((e.key==='h'||e.key==='H')&&NET.room&&state==='play'&&!onFoot){NET.room.send({t:'honk'});SFX.play('hit',.5);}});
window.NJ={NET,get P(){return P;},get state(){return state;},get stars(){return stars;},get POL(){return POL;}};
