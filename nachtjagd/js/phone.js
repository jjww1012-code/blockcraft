/* ---------- Phone ---------- */
const ICONS={map:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',garage:'<path d="M4 15l2-5h12l2 5v3H4z"/><path d="M7 18v2M17 18v2M6.5 15h2M15.5 15h2"/>',
  shop:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',inv:'<path d="M7 7h10a2 2 0 0 1 2 2v11H5V9a2 2 0 0 1 2-2z"/><path d="M9 7V5h6v2M8 13h8"/>',
  news:'<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v8a2 2 0 0 1-2 2M7 9h7M7 12h7M7 15h4"/>',
  set:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>'};
const APPS=[['map','Karte','#2e7bff'],['garage','Garage','#d4253f'],['shop','Shop','#b8901c'],['inv','Rucksack','#1f8a55'],['news','News','#6f45d8'],['set','Einstellungen','#4a4f62']];
let phoneApp=null,garTab='own';
function itemRow(img,title,desc,button){
  const r=el('div','pitem');if(img){const im=el('img');im.src=img;im.alt='';r.appendChild(im);}else r.classList.add('noimg');
  const t=el('div','mtxt'),b=el('b'),s=el('span');b.textContent=title;s.textContent=desc;t.append(b,s);r.appendChild(t);if(button)r.appendChild(button);return r;
}
function openPhone(app,tab){
  if(state!=='play')return;closeWheel();$('modal').hidden=true;paused=true;$('pad').hidden=true;for(const k in K)K[k]=false;
  $('phone').hidden=false;if(tab)garTab=tab;showApp(app||null);
}
function closePhone(){$('phone').hidden=true;paused=false;if(state==='play')$('pad').hidden=false;}
$('phHome').addEventListener('click',()=>{if(phoneApp)showApp(null);else closePhone();});
$('phone').addEventListener('click',e=>{if(e.target.id==='phone')closePhone();});
function showApp(id){
  phoneApp=id;const sc=$('phScreen');sc.innerHTML='';sc.scrollTop=0;$('phTime').textContent=clockStr();$('phMoney').textContent=$$(SAVE.money);
  if(!id){
    sc.appendChild(el('div','wall',clockStr()+'<small>'+DNAME[curD]+(stars?' · '+'★'.repeat(stars):'')+'</small>'));
    const g=el('div','apps');
    for(const [aid,name,col] of APPS){const a=el('button','app');a.type='button';a.innerHTML=`<i style="background:${col}"><svg viewBox="0 0 24 24">${ICONS[aid]}</svg></i><span>${name}</span>`;a.addEventListener('click',()=>showApp(aid));g.appendChild(a);}
    sc.appendChild(g);return;
  }
  const hd=el('div','aph'),bk=el('button');bk.type='button';bk.textContent='‹';bk.setAttribute('aria-label','Zurück');bk.addEventListener('click',()=>showApp(null));
  const h=el('h4');h.textContent=APPS.find(a=>a[0]===id)[1];hd.append(bk,h);sc.appendChild(hd);
  ({map:appMap,garage:appGarage,shop:appShop,inv:appInv,news:appNews,set:appSet})[id](sc);
}
function mapXf(Wc){const pad=CELL*.5,x0=MI0*CELL-pad,y0=MJ0*CELL-pad,k=Wc/(MAPW*CELL+2*pad);return{k,X:x=>(x-x0)*k,Y:y=>(y-y0)*k,ix:px=>px/k+x0,iy:py=>py/k+y0};}
function drawFullMap(cv){
  const g=cv.getContext('2d'),Wc=cv.width,m=mapXf(Wc),k=m.k;
  g.fillStyle='#0e2a44';g.fillRect(0,0,Wc,Wc);
  g.fillStyle='#4a4f66';g.fillRect(m.X(BMIN),m.Y(BMIN),(BMAX-BMIN)*k,(BMAX-BMIN)*k);
  for(let i=MI0;i<MI0+MAPW;i++)for(let j=MJ0;j<MJ0+MAPW;j++){const c=getCell(i,j);
    if(c.open){g.fillStyle=DCOL.waste;g.fillRect(m.X(i*CELL)-.3,m.Y(j*CELL)-.3,CELL*k+.6,CELL*k+.6);}
    else{g.fillStyle=c.kind==='park'?DCOL.park:DCOL[c.d];g.fillRect(m.X(i*CELL+HALF),m.Y(j*CELL+HALF),S*k,S*k);
      if(c.place){g.globalAlpha=.35;g.fillStyle=c.place.t.col;g.fillRect(m.X(i*CELL+HALF),m.Y(j*CELL+HALF),S*k,S*k);g.globalAlpha=1;}}}
  if(stars>0){g.fillStyle='rgba(255,46,77,.18)';g.strokeStyle='rgba(255,46,77,.75)';g.lineWidth=3;g.beginPath();g.arc(m.X(lastSeen.x),m.Y(lastSeen.y),zoneR()*k,0,TAU);g.fill();g.stroke();}
  for(const p of PLACES)drawIcon(g,m.X(p.mx),m.Y(p.my),p.t,Wc*.026);
  for(const c of cops)if(!c.wreck&&c.mode==='chase'){g.fillStyle='#ff2e4d';g.beginPath();g.arc(m.X(c.x),m.Y(c.y),Wc*.009,0,TAU);g.fill();}
  for(const c of abandoned)if(c.own!==undefined&&!c.dead){g.fillStyle='#3af0ff';g.fillRect(m.X(c.x)-5,m.Y(c.y)-5,10,10);}
  if(waypoint)drawPin(g,m.X(waypoint.x),m.Y(waypoint.y),Wc*.03);
  drawArrow(g,m.X(P.x),m.Y(P.y),P.a,Wc*.03);
}
function appMap(sc){
  const cv=el('canvas');cv.id='phMap';cv.width=640;cv.height=640;sc.appendChild(cv);drawFullMap(cv);
  cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect(),m=mapXf(cv.width),x=(e.clientX-r.left)/r.width*cv.width,y=(e.clientY-r.top)/r.height*cv.height;
    waypoint={x:clamp(m.ix(x),BMIN+20,BMAX-20),y:clamp(m.iy(y),BMIN+20,BMAX-20)};drawFullMap(cv);toast('Wegpunkt gesetzt');});
  const ch=el('div','chips');
  for(const [ty,lab] of [['safe','Safehouse'],['kiosk','Kiosk'],['gun','Waffen'],['work','Werkstatt'],['dealer','Autohaus']]){
    const b=el('button');b.type='button';b.textContent=lab;
    b.addEventListener('click',()=>{let best=null,bd=1e9;for(const p of PLACES)if(p.type===ty){const d=Math.hypot(p.mx-P.x,p.my-P.y);if(d<bd){bd=d;best=p;}}waypoint={x:best.mx,y:best.my};drawFullMap(cv);toast('Wegpunkt: '+best.t.name);});ch.appendChild(b);}
  const cl=el('button');cl.type='button';cl.textContent='Löschen';cl.addEventListener('click',()=>{waypoint=null;drawFullMap(cv);});ch.appendChild(cl);sc.appendChild(ch);
  sc.appendChild(el('div','legend',[['#2c3046','Innenstadt'],['#1f3326','Wohngebiet'],['#3a3628','Industrie'],['#47391f','Brachland'],['#1d4a2c','Park'],['#0e2a44','Wasser']].map(([c,n])=>`<span style="--c:${c}">${n}</span>`).join('')));
  sc.appendChild(el('p','note','Tippe auf die Karte, um einen Wegpunkt zu setzen. Rot: Suchkreis der Polizei.'));
}
function appGarage(sc){
  const tb=el('div','tabs');
  for(const [t,l] of [['own','Meine'],['buy','Kaufen']]){const b=el('button',garTab===t?'on':'');b.type='button';b.textContent=l;b.addEventListener('click',()=>{garTab=t;showApp('garage');});tb.appendChild(b);}
  sc.appendChild(tb);const L=el('div','plist');
  VEH.forEach((v,i)=>{const own=SAVE.owned.includes(i);if((garTab==='own')!==own)return;let b;
    if(own){const active=!onFoot&&P.own===i;b=btn(active?'AKTIV':'LIEFERN','ok',()=>{deliver(i);},active||deliverT>0);}
    else b=btn($$(v.price),'',()=>buy(i),SAVE.money<v.price);
    L.appendChild(itemRow(PREV[i],v.name,v.type+' · '+Math.round(v.max*.36)+' km/h'+(v.offroad?' · Gelände':''),b));});
  if(!L.children.length)L.appendChild(el('div','empty',garTab==='own'?'Noch keine Fahrzeuge.':'Du besitzt schon alles. Respekt.'));
  sc.appendChild(L);
  if(garTab==='own')sc.appendChild(el('p','note',deliverT>0?'Nächste Lieferung in '+Math.ceil(deliverT)+' s.':'Geliefert wird direkt neben dich.'));
  else sc.appendChild(el('p','note','Gekaufte Fahrzeuge findest du unter „Meine“.'));
}
function buy(i){const v=VEH[i];if(SAVE.money<v.price)return;SAVE.money-=v.price;SAVE.owned.push(i);save();news(v.name+' im Autohaus verkauft, Käufer bleibt anonym');toast(v.name+' gekauft');garTab='own';showApp('garage');}
function deliver(i){
  if(deliverT>0||(!onFoot&&P.own===i))return;
  let pos=null;
  for(const da of [PI/2,-PI/2,PI,0,PI*.75,-PI*.75]){const d=onFoot?38:50,x=P.x+Math.cos(P.a+da)*d,y=P.y+Math.sin(P.a+da)*d;
    if(!blocked(x,y)&&!cops.some(c=>Math.hypot(c.x-x,c.y-y)<40)&&!abandoned.some(c=>c.own!==i&&Math.hypot(c.x-x,c.y-y)<40)){pos={x,y};break;}}
  if(!pos){toast('Kein Platz. Stell dich auf eine freie Straße.');return;}
  abandoned=abandoned.filter(c=>{if(c.own===i&&!c.dead){dropModel(c);return false;}return true;});
  abandoned.push(spawnOwned(i,pos.x,pos.y,P.a));deliverT=12;toast(VEH[i].name+' steht neben dir');closePhone();
}
function buyItem(k,price){if(SAVE.money<price)return;SFX.play('buy');SAVE.money-=price;SAVE.items[k]=(SAVE.items[k]||0)+1;save();toast(ITEMS[k].name+' gekauft');}
function appShop(sc){
  sc.appendChild(el('p','note','Wird sofort in deinen Rucksack geliefert. Im 24/7 Kiosk ist alles 20 % günstiger.'));
  const L=el('div','plist');
  for(const [k,it] of Object.entries(ITEMS)){const n=SAVE.items[k]||0;L.appendChild(itemRow(null,it.name+(n?' ('+n+')':''),it.desc,btn($$(it.price),'',()=>{buyItem(k,it.price);showApp('shop');},SAVE.money<it.price)));}
  sc.appendChild(L);
}
function useItem(k){
  const n=SAVE.items[k]||0;if(!n)return false;const fail=m=>{toast(m);return false;};
  switch(k){
    case 'repair':if(onFoot)return fail('Nur im Fahrzeug');if(P.hp>=P.v.hp)return fail('Dein Fahrzeug ist heil');P.hp=P.v.hp;break;
    case 'med':if((onFoot?P.hp:pedHp)>=100)return fail('Du bist fit');pedHp=100;if(onFoot)P.hp=100;SFX.play('buy');break;
    case 'vest':if(armor>=100)return fail('Du trägst schon eine volle Weste');armor=100;break;
    case 'nitro':if(onFoot)return fail('Nur im Fahrzeug');nitro=1;break;
    case 'spikes':dropSpikes();break;
    case 'jammer':if(!helis.length)return fail('Gerade kein Helikopter da');jamT=20;break;
    case 'lawyer':if(!stars)return fail('Du wirst gerade nicht gesucht');stars=Math.max(0,stars-2);if(!stars)clearWanted('ANWALT HAT ES GEREGELT');break;
  }
  SAVE.items[k]=n-1;save();toast(ITEMS[k].name+' benutzt');return true;
}
function appInv(sc){
  if(armor>0)sc.appendChild(el('p','note','Schutzweste: '+Math.round(armor)+' %'));
  const L=el('div','plist');
  for(const [k,it] of Object.entries(ITEMS)){const n=SAVE.items[k]||0;if(!n)continue;L.appendChild(itemRow(null,it.name+' ×'+n,it.desc,btn('BENUTZEN','ok',()=>{if(useItem(k)){if(k==='spikes')closePhone();else showApp('inv');}})));}
  if(!L.children.length)L.appendChild(el('div','empty','Dein Rucksack ist leer. Schau im Shop vorbei.'));
  sc.appendChild(L);
}
function appNews(sc){
  const L=el('div');
  for(const n of SAVE.news){const it=el('div','nitem'),t=el('time'),b=el('b');t.textContent=n.t;b.textContent=n.title;it.append(t,b);L.appendChild(it);}
  if(!SAVE.news.length)L.appendChild(el('div','empty','Keine Meldungen.'));sc.appendChild(L);
}
function appSet(sc){
  const L=el('div','plist');
  L.appendChild(itemRow(null,'Kamera',camMode?'Vogelperspektive':'Verfolger',btn('WECHSELN','alt',()=>{camMode^=1;showApp('set');})));
  L.appendChild(itemRow(null,'Ton',SFX.muted?'Aus':'An',btn('WECHSELN','alt',()=>{toggleMute();showApp('set');})));
  L.appendChild(itemRow(null,'Sichtweite',viewFar?'Weit, braucht mehr Leistung':'Normal',btn('WECHSELN','alt',()=>{viewFar=!viewFar;ensureT=0;showApp('set');})));
  L.appendChild(itemRow(null,'Statistik','Cops erledigt: '+SAVE.stats.cops+' · Überfälle: '+SAVE.stats.robs+' · Autos geklaut: '+SAVE.stats.steals,null));
  L.appendChild(itemRow(null,'Hauptmenü','Das Spiel wird vorher gespeichert.',btn('BEENDEN','',toMenu)));
  sc.appendChild(L);
}

