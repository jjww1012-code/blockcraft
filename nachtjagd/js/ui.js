/* ---------- Input, interactions, shop menus, HUD, minimap ---------- */
const KEYMAP={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'hand',ShiftLeft:'nitro',ShiftRight:'nitro',ArrowUp:'gas',KeyW:'gas',ArrowDown:'brake',KeyS:'brake',KeyK:'fire',ControlLeft:'fire'};
addEventListener('keydown',e=>{
  if(e.code==='Escape'){if(wheelOpen)closeWheel();else if(!$('phone').hidden)closePhone();else if(!$('modal').hidden)closeModal();return;}
  if((e.code==='Tab'||e.code==='KeyP')&&state==='play'){e.preventDefault();if(!$('phone').hidden)closePhone();else if($('modal').hidden){closeWheel();openPhone();}return;}
  if(e.code==='Enter'&&state==='menu'){(loadSave()?$('cont'):$('newg')).click();return;}
  if(e.code==='KeyM'){toggleMute();return;}
  if(state!=='play'||paused)return;
  if(e.code==='KeyQ'&&!e.repeat){if(wheelOpen)closeWheel();else openWheel();return;}
  if(wheelOpen){const n=+(e.code.match(/^Digit([1-5])$/)||[])[1];if(n){selectWeapon(WORDER[n-1]);closeWheel();}return;}
  const k=KEYMAP[e.code];if(k){K[k]=true;e.preventDefault();}
  const n=+(e.code.match(/^Digit([1-5])$/)||[])[1];if(n)selectWeapon(WORDER[n-1]);
  if(e.code==='KeyR')startReload();
  if(e.code==='KeyX'&&!e.repeat)holster();
  if(e.code==='KeyC')camMode^=1;
  if((e.code==='KeyE'||e.code==='KeyF')&&!e.repeat)doContext();
});
addEventListener('keyup',e=>{const k=KEYMAP[e.code];if(k)K[k]=false;});
cv.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0&&state==='play'&&!paused)K.fire=true;});
addEventListener('pointerup',e=>{if(e.pointerType==='mouse')K.fire=false;});
cv.addEventListener('contextmenu',e=>e.preventDefault());
function bind(id,key){
  const b=$(id);
  const on=e=>{e.preventDefault();K[key]=true;b.classList.add('on');try{b.setPointerCapture(e.pointerId)}catch(_){}};
  const off=()=>{K[key]=false;b.classList.remove('on');};
  b.addEventListener('pointerdown',on);['pointerup','pointercancel','lostpointercapture'].forEach(t=>b.addEventListener(t,off));
  b.addEventListener('contextmenu',e=>e.preventDefault());
}
bind('bL','left');bind('bR','right');bind('bD','hand');bind('bN','nitro');bind('bG','gas');bind('bB','brake');bind('bF','fire');
$('bW').addEventListener('pointerdown',e=>{e.preventDefault();if(wheelOpen)closeWheel();else openWheel();});
$('wbox').addEventListener('click',()=>{if(wheelOpen)closeWheel();else openWheel();});
$('wheel').addEventListener('click',e=>{if(e.target.id==='wheel'||e.target.id==='wslots')closeWheel();});
$('camBtn').addEventListener('click',()=>{camMode^=1;});
$('phoneBtn').addEventListener('click',()=>{closeWheel();if($('phone').hidden)openPhone();else closePhone();});
$('muteBtn').addEventListener('click',toggleMute);
$('bE').addEventListener('pointerdown',e=>{e.preventDefault();doContext();});
function toggleMute(){SFX.init();const m=SFX.toggle();$('muteBtn').textContent=m?'STUMM':'TON AN';toast(m?'Ton aus':'Ton an');}
$('muteBtn').textContent=SFX.muted?'STUMM':'TON AN';
function setLabels(){
  $('bD').textContent=onFoot?'SPRING':'DRIFT';$('bN').textContent=onFoot?'SPRINT':'NITRO';
  $('bG').textContent=onFoot?'LAUF':'GAS';$('bB').textContent=onFoot?'ZURÜCK':'BREMSE';
}

/* entering and leaving vehicles */
function exitVehicle(){
  if(P.air>0)return;const car=P,fx=Math.cos(car.a),fy=Math.sin(car.a),off=car.v.Wd/2+10;
  let px=car.x-fy*off,py=car.y+fx*off;if(blocked(px,py)){px=car.x+fy*off;py=car.y-fx*off;}
  car.steer=0;abandoned.push(car);P=makePedAt(px,py,car.a);P.hp=pedHp;onFoot=true;combo=0;setLabels();SFX.play('door');
}
function nearestEnter(){
  let best=null,bd=48;
  for(const c of abandoned){if(c.dead||c.wreck)continue;const d=Math.hypot(c.x-P.x,c.y-P.y);if(d<bd){bd=d;best={car:c,d};}}
  for(const c of traffic){if(c.taken||c.dead)continue;const d=Math.hypot(c.x-P.x,c.y-P.y);if(d<bd&&Math.hypot(c.vx,c.vy)<170){bd=d;best={car:c,d,jack:true};}}
  const ci=Math.floor(P.x/CELL),cj=Math.floor(P.y/CELL);
  for(let i=ci-1;i<=ci+1;i++)for(let j=cj-1;j<=cj+1;j++)for(const b of getCell(i,j).b){if(b.kind!=='parked')continue;
    const d=Math.hypot(b.x+b.w/2-P.x,b.y+b.h/2-P.y);if(d<bd-6){bd=d;best={b,i,j,d};}}
  return best;
}
function tryEnter(){
  const t=nearestEnter();if(!t)return;let car=t.car;
  if(t.jack){
    car.taken=true;const fx=Math.cos(car.a),fy=Math.sin(car.a),off=car.v.Wd/2+9;
    const h=makeHuman(car.x-fy*off,car.y+fx*off,car.a,'civ');h.state='walk';fleeFrom(h,P.x,P.y,10);h.kx=-fy*120;h.ky=fx*120;
    car.stolen=true;SAVE.stats.steals++;report(1,'Carjacking');
  }else if(!car){
    const b=t.b,cell=getCell(t.i,t.j);cell.b.splice(cell.b.indexOf(b),1);
    const k=t.i+','+t.j,bl=built.get(k);if(bl)disposeCell(k,bl);ensureCells(P.x,P.y,true);
    const sv=Object.assign(npcCarSpec(),{style:'sedan',type:'Limousine',name:'Limousine',L:46,Wd:22,r:17,max:650,body:b.roof});
    car=makeCar(b.x+b.w/2,b.y+b.h/2,b.h>b.w?(P.y<b.y+b.h/2?PI/2:-PI/2):0,sv);
    car.stolen=true;car.npc=true;car.gy=groundBase(car.x,car.y);car.m=buildVehicle(sv);scene.add(car.m.root);car.sh=addShadow(sv);SAVE.stats.steals++;
    report(1,'Autodiebstahl');
  }else{abandoned.splice(abandoned.indexOf(car),1);if(car.copcar&&!car.stolen){car.stolen=true;report(1,'Polizeiwagen gestohlen');}}
  traffic=traffic.filter(c=>c!==car);
  abandoned=abandoned.filter(c=>c!==car);
  pedHp=P.hp;attachHead(car);PEDM.root.visible=false;PEDSH.visible=false;P=car;V=car.v;onFoot=false;
  if(car.own!==undefined)SAVE.cur=car.own;setLabels();SFX.play('door');
}
function nearPlace(){
  let best=null;
  for(const p of PLACES){if(!p.ix)continue;if(!(onFoot?p.t.foot:p.t.car))continue;const d=Math.hypot(P.x-p.ix,P.y-p.iy);if(d<(p.type==='work'?50:30)&&(!best||d<best.d))best={p,d};}
  return best;
}
function context(){
  const np=nearPlace(),en=onFoot?nearestEnter():null;
  if(np&&!(en&&en.d<np.d)){
    const pl=np.p;
    if(pl.t.clerk&&!(pl.clerk&&pl.clerk.state==='idle'))return{label:'NIEMAND DA',hint:'',fn:null,dim:true};
    const lab={kiosk:'KAUFEN',gun:'KAUFEN',dealer:'AUTOHAUS',safe:'SCHLAFEN',work:'WERKSTATT'}[pl.type];
    if(onFoot||Math.hypot(P.vx,P.vy)<170)return{label:lab,hint:pl.t.name,fn:()=>openPlace(pl),hot:true};
  }
  if(onFoot){
    if(en)return{label:en.jack?'RAUSZIEHEN':en.car?'EINSTEIGEN':'KLAUEN',hint:en.jack?'Fahrer rausziehen':en.car?'Einsteigen':'Auto klauen',fn:tryEnter,hot:true};
    return{label:'AKTION',hint:'',fn:null,dim:true};
  }
  return{label:'AUSSTEIGEN',hint:'',fn:exitVehicle};
}
function doContext(){if(state!=='play'||paused)return;const c=context();if(c.fn)c.fn();}

/* shop menus */
function openModal(title,sub,rows){
  paused=true;closeWheel();$('pad').hidden=true;for(const k in K)K[k]=false;$('mTitle').textContent=title;$('mSub').textContent=sub||'';
  const body=$('mBody');body.innerHTML='';rows.forEach(r=>body.appendChild(r));$('modal').hidden=false;
}
function closeModal(){$('modal').hidden=true;if($('phone').hidden){paused=false;if(state==='play')$('pad').hidden=false;}}
$('mClose').addEventListener('click',closeModal);
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e;}
function btn(label,cls,fn,dis){const b=el('button','mbtn'+(cls?' '+cls:''));b.type='button';b.textContent=label;b.disabled=!!dis;b.addEventListener('click',fn);return b;}
function rowEl(name,desc,label,fn,o){
  o=o||{};const d=el('div','mrow'+(o.danger?' danger':'')),t=el('div','mtxt'),b=el('b'),s=el('span');
  b.textContent=name;s.textContent=desc;t.append(b,s);d.appendChild(t);if(label)d.appendChild(btn(label,o.danger?'':'ok',fn,o.disabled));return d;
}
const sellPrice=c=>Math.round(c.v.max*1.8/50)*50;
function openPlace(pl){
  const t=pl.type,rows=[];
  if(t==='dealer'){openPhone('garage','buy');return;}
  if(t==='kiosk'){
    for(const [k,it] of Object.entries(ITEMS)){if(k==='lawyer')continue;const pr=Math.round(it.price*.8),n=SAVE.items[k]||0;
      rows.push(rowEl(it.name+(n?' ('+n+')':''),it.desc,$$(pr),()=>{buyItem(k,pr);openPlace(pl);},{disabled:SAVE.money<pr}));}
    openModal(pl.t.name,'Alles 20 % günstiger als im Online-Shop. Tipp: Mit gezogener Waffe auf den Verkäufer zielen ist ein Überfall.',rows);return;
  }
  if(t==='gun'){
    for(const w of WORDER){if(w==='fist')continue;const W=WPN[w],own=SAVE.weapons.includes(w);
      if(!own)rows.push(rowEl(W.name,'Schaden '+W.dmg+(W.pellets?' ×'+W.pellets:'')+' · Magazin '+W.mag+' · inkl. '+W.ammo.n+' Schuss',$$(W.price),()=>{if(SAVE.money<W.price)return;SAVE.money-=W.price;SAVE.weapons.push(w);SAVE.ammo[w]=(SAVE.ammo[w]||0)+W.ammo.n;mags[w]=Math.min(W.mag,SAVE.ammo[w]);selectWeapon(w);save();SFX.play('buy');toast(W.name+' gekauft');openPlace(pl);},{disabled:SAVE.money<W.price}));
      else rows.push(rowEl(W.name+' Munition','+'+W.ammo.n+' Schuss · du hast '+(SAVE.ammo[w]||0),$$(W.ammo.price),()=>{if(SAVE.money<W.ammo.price)return;SAVE.money-=W.ammo.price;SAVE.ammo[w]=(SAVE.ammo[w]||0)+W.ammo.n;save();SFX.play('buy');openPlace(pl);},{disabled:SAVE.money<W.ammo.price}));}
    rows.push(rowEl('Schutzweste'+(SAVE.items.vest?' ('+SAVE.items.vest+')':''),ITEMS.vest.desc,$$(450),()=>{buyItem('vest',450);openPlace(pl);},{disabled:SAVE.money<450}));
    openModal(pl.t.name,'Gekaufte Waffen findest du im Waffenrad (Q oder WAFFE).',rows);return;
  }
  if(t==='work'){
    rows.push(rowEl('Reparieren & umlackieren','Voll repariert, neue Farbe. Sieht dich dabei kein Cop, ist die Fahndung weg.',$$(200),respray,{disabled:SAVE.money<200}));
    if(P.stolen)rows.push(rowEl('Geklautes Fahrzeug verkaufen','Keine Fragen, nur Bargeld.',$$(sellPrice(P)),sellCar));
    openModal(pl.t.name,P.stolen?'Dieses Fahrzeug ist geklaut.':'',rows);return;
  }
  if(t==='safe'){
    rows.push(rowEl('Schlafen & speichern',stars?'Geht nicht während einer Fahndung.':'Leben wird aufgefüllt, das Spiel gespeichert.','SCHLAFEN',()=>{pedHp=100;if(onFoot)P.hp=100;else P.hp=P.v.hp;clock=(clock+480)%1440;save();closeModal();toast('Spiel gespeichert');},{disabled:stars>0}));
    rows.push(rowEl('Garage','Lass dir eins deiner Fahrzeuge vor die Tür bringen.','ÖFFNEN',()=>{closeModal();openPhone('garage','own');}));
    openModal(pl.t.name,'',rows);
  }
}
function respray(){
  if(SAVE.money<200)return;SAVE.money-=200;
  const cols=['#ff2e4d','#3af0ff','#ffd23a','#8a5cff','#3dff9a','#f1f1f5','#22263a','#ff7a2e','#2e7bff','#c9a227'];let col;
  do col=pick(cols);while(col===P.v.body);
  const car=P,nv=Object.assign({},car.v,{body:col});dropModel(car);car.v=nv;car.m=buildVehicle(nv);scene.add(car.m.root);car.sh=addShadow(nv);attachHead(car);V=nv;car.hp=nv.hp;car.copcar=false;
  closeModal();SFX.play('buy');
  if(stars>0){const watched=spotted||cops.some(c=>!c.wreck&&Math.hypot(c.x-P.x,c.y-P.y)<450);if(watched)toast('Die Cops haben dich gesehen. Fahndung bleibt.');else clearWanted('NEUE FARBE, NEUES GLÜCK');}
  else toast('Wie neu');
}
function sellCar(){
  const car=P,pr=sellPrice(car),fx=Math.cos(car.a),fy=Math.sin(car.a),off=car.v.Wd/2+10;closeModal();
  P=makePedAt(car.x-fy*off,car.y+fx*off,car.a);P.hp=pedHp;onFoot=true;dropModel(car);setLabels();
  addCash(pr,P.x,P.y,'VERKAUFT');SFX.play('cash');news('Gestohlenes Fahrzeug in Werkstatt aufgetaucht, Besitzer sucht weiter');
}

/* minimap */
const DCOL={city:'#2c3046',resi:'#1f3326',ind:'#3a3628',waste:'#47391f',park:'#1d4a2c'};
function drawIcon(g,x,y,t,r){g.fillStyle=t.col;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.strokeStyle='#0b0c12';g.lineWidth=Math.max(1.5,r*.15);g.stroke();
  g.fillStyle='#0b0c12';g.font=`bold ${Math.round(r*1.15)}px sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(t.ico,x,y+1);}
function drawArrow(g,x,y,a,s){g.save();g.translate(x,y);g.rotate(a);g.fillStyle='#ffd23a';g.strokeStyle='#0b0c12';g.lineWidth=2;g.beginPath();g.moveTo(s,0);g.lineTo(-s*.65,-s*.65);g.lineTo(-s*.3,0);g.lineTo(-s*.65,s*.65);g.closePath();g.fill();g.stroke();g.restore();}
function drawPin(g,x,y,s){g.fillStyle='#ffd23a';g.strokeStyle='#0b0c12';g.lineWidth=2;g.beginPath();g.arc(x,y-s,s*.7,PI*.8,PI*.2);g.lineTo(x,y);g.closePath();g.fill();g.stroke();}
function renderMinimap(){
  const Sz=208,R=104,range=1500;mx.setTransform(1,0,0,1,0,0);mx.clearRect(0,0,Sz,Sz);
  mx.save();mx.beginPath();mx.arc(R,R,R,0,TAU);mx.clip();mx.fillStyle='#4a4f66';mx.fillRect(0,0,Sz,Sz);
  const k=R/range,px=P.x,py=P.y,X=x=>R+(x-px)*k,Y=y=>R+(y-py)*k;
  const ci0=Math.floor((px-range)/CELL),ci1=Math.floor((px+range)/CELL),cj0=Math.floor((py-range)/CELL),cj1=Math.floor((py+range)/CELL);
  mx.fillStyle='#0e2a44';
  if(X(BMIN)>0)mx.fillRect(0,0,X(BMIN),Sz);if(X(BMAX)<Sz)mx.fillRect(X(BMAX),0,Sz,Sz);if(Y(BMIN)>0)mx.fillRect(0,0,Sz,Y(BMIN));if(Y(BMAX)<Sz)mx.fillRect(0,Y(BMAX),Sz,Sz);
  for(let i=ci0;i<=ci1;i++)for(let j=cj0;j<=cj1;j++){if(!inMap(i,j))continue;const c=getCell(i,j);
    if(c.open){mx.fillStyle=DCOL.waste;mx.fillRect(X(i*CELL)-.5,Y(j*CELL)-.5,CELL*k+1,CELL*k+1);}
    else{mx.fillStyle=c.kind==='park'?DCOL.park:DCOL[c.d];mx.fillRect(X(i*CELL+HALF),Y(j*CELL+HALF),S*k,S*k);}}
  if(stars>0){mx.fillStyle=((T*2)%1<.5)?'rgba(255,46,77,.22)':'rgba(46,123,255,.22)';mx.beginPath();mx.arc(X(lastSeen.x),Y(lastSeen.y),zoneR()*k,0,TAU);mx.fill();}
  for(const p of PLACES){const x=X(p.mx),y=Y(p.my);if(x>-10&&x<Sz+10&&y>-10&&y<Sz+10)drawIcon(mx,x,y,p.t,10);}
  for(const c of abandoned)if(!c.dead&&c.own!==undefined){mx.fillStyle='#3af0ff';mx.fillRect(X(c.x)-5,Y(c.y)-5,10,10);}
  for(const h of humans)if(h.role==='cop'&&h.state!=='dead'&&stars>0){mx.fillStyle='#2e7bff';mx.beginPath();mx.arc(X(h.x),Y(h.y),4,0,TAU);mx.fill();}
  for(const c of cops){let dx=(c.x-px)*k,dy=(c.y-py)*k;const d=Math.hypot(dx,dy);if(c.mode==='patrol'&&d>R-6)continue;if(d>R-8){dx*=(R-8)/d;dy*=(R-8)/d;}
    mx.fillStyle=c.wreck?'#555':c.mode==='chase'?(((T*7+c.ph)%2)<1?'#ff2e4d':'#2e7bff'):'#8fa8ff';mx.beginPath();mx.arc(R+dx,R+dy,c.mode==='chase'?7:5,0,TAU);mx.fill();}
  for(const h of helis){if(h.dead)continue;let dx=(h.x-px)*k,dy=(h.y-py)*k;const d=Math.hypot(dx,dy);if(d>R-12){dx*=(R-12)/d;dy*=(R-12)/d;}mx.strokeStyle='#fff';mx.lineWidth=3;mx.beginPath();mx.arc(R+dx,R+dy,11,0,TAU);mx.stroke();}
  if(waypoint){let dx=(waypoint.x-px)*k,dy=(waypoint.y-py)*k;const d=Math.hypot(dx,dy);if(d>R-14){dx*=(R-14)/d;dy*=(R-14)/d;}drawPin(mx,R+dx,R+dy+8,12);}
  drawArrow(mx,R,R,P.a,14);mx.restore();
}

/* HUD */
const hpEl=$('hp'),hpI=hpEl.querySelector('i'),niI=$('ni').querySelector('i'),arI=$('ar').querySelector('i'),bu=$('busted'),buI=bu.querySelector('i'),rb=$('robbar'),rbI=rb.querySelector('i'),stars$=$('stars'),starEls=[...stars$.children],ret=$('ret');
let lastHud=0,lastCtx='';
function hud(now){
  if(state==='menu'||!P)return;
  // reticle every frame
  if(aimTarget&&state==='play'&&!paused){
    const t=aimTarget,h=t.isHeli?t.alt:(t.v.kind!=='foot'?t.gy+12:t.gy+14);tmpV.set(t.x,h,t.y).project(camera);
    if(tmpV.z<1){ret.hidden=false;ret.style.transform=`translate(${(tmpV.x*.5+.5)*W}px,${(-tmpV.y*.5+.5)*H}px)`;ret.classList.toggle('hostile',!!(t.role==='cop'||t.police||t.isHeli||t.state==='shoot'));}else ret.hidden=true;
  }else ret.hidden=true;
  if(now-lastHud<60)return;lastHud=now;
  $('score').textContent=$$(SAVE.money);
  $('combo').textContent=combo>5?'DRIFT +'+$$(Math.floor(combo*.035*(1+stars))):'';
  const HP=onFoot?100:P.v.hp;hpI.style.transform=`scaleX(${clamp(P.hp/HP,0,1)})`;hpEl.classList.toggle('low',P.hp/HP<.35);$('hpLbl').textContent=onFoot?'Leben':'Karosserie';
  $('arLbl').hidden=$('ar').hidden=armor<=0;arI.style.transform=`scaleX(${armor/100})`;
  $('niLbl').hidden=$('ni').hidden=onFoot;niI.style.transform=`scaleX(${nitro})`;
  starEls.forEach((s,i)=>s.classList.toggle('lit',i<stars));stars$.classList.toggle('hid',stars>0&&!seen);
  bu.style.opacity=busted>.05&&state==='play'?1:0;buI.style.transform=`scaleX(${Math.min(1,busted/2.4)})`;
  rb.style.opacity=rob.active&&state==='play'?1:0;rbI.style.transform=`scaleX(${Math.min(1,rob.prog/3.2)})`;
  $('dmg').style.opacity=state==='play'?Math.max(P.hp/HP<.35?(.35-P.hp/HP)/.35*.8:0,busted/2.4*.7,hitFlash*2):0;
  $('spd').firstChild.nodeValue=Math.round(Math.hypot(P.vx,P.vy)*.36);
  $('meta').textContent=clockStr()+' · '+DNAME[curD];$('spot').hidden=!spotted||state!=='play';
  const w=WPN[curW];$('wN').textContent=w.name.toUpperCase();
  $('wA').textContent=curW==='fist'?'Q: Waffenrad':reloadT>0?'LÄDT NACH':(mags[curW]||0)+' / '+Math.max(0,(SAVE.ammo[curW]||0)-(mags[curW]||0));
  $('wbox').classList.toggle('empty',curW!=='fist'&&(SAVE.ammo[curW]||0)<=0);
  if(state==='play'&&!paused){const c=context(),key=c.label+'|'+c.hint;if(key!==lastCtx){lastCtx=key;const b=$('bE');b.textContent=c.label;b.classList.toggle('ready',!!c.hot);b.classList.toggle('dim',!!c.dim);
    const h=$('hint');h.hidden=!c.hint;h.textContent='E: '+c.hint;}}
  else $('hint').hidden=true;
}
