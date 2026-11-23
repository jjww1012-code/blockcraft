/* Spielehalle-Kit: Bildschirme, Sound, Online-Lobby, Partikel, Canvas */
(function(){
'use strict';
const K={};window.K=K;
K.$=id=>document.getElementById(id);
K.esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
K.clamp=(v,a,b)=>v<a?a:v>b?b:v;K.lerp=(a,b,t)=>a+(b-a)*t;K.rnd=(a,b)=>a+Math.random()*(b-a);K.ri=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
K.pick=a=>a[Math.floor(Math.random()*a.length)];K.shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
K.rng=a=>function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
K.store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
K.BOTS=['Robo','Kiki','Blitz','Nova','Pixel','Turbo','Mango','Zack','Luna','Bolt','Fizz','Momo','Rocket','Sushi','Panda','Viper'];
K.COLS=['#ff4757','#2e86de','#ffd23f','#2ed573','#ff7ad9','#ff9f1a','#7d5fff','#18dcff','#eeeeee','#00b894'];
K.name=()=>{try{return (window.Profile&&Profile.name)||'Spieler'}catch(e){return'Spieler'}};
K.setName=n=>{n=String(n||'').trim().slice(0,14);if(n&&window.Profile)Profile.name=n;return n||K.name()};
K.uid=()=>window.SH_UID||'me';
K.touch=matchMedia('(pointer:coarse)').matches;
/* ---------- Sound ---------- */
let AC=null,nb=null;K.ac=()=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}return AC};
addEventListener('pointerdown',()=>K.ac(),{passive:true});addEventListener('keydown',()=>K.ac());
K.muted=K.store.get('k_mute',false);
K.tone=(f,d=.1,v=.08,type='triangle',at=0,f2)=>{const a=AC;if(!a||K.muted)return;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,a.currentTime+at);if(f2)o.frequency.exponentialRampToValueAtTime(f2,a.currentTime+at+d);g.gain.setValueAtTime(v,a.currentTime+at);g.gain.exponentialRampToValueAtTime(.0008,a.currentTime+at+d);o.connect(g);g.connect(a.destination);o.start(a.currentTime+at);o.stop(a.currentTime+at+d+.02)};
K.noise=(d=.2,v=.2,f=1200,at=0)=>{const a=AC;if(!a||K.muted)return;if(!nb){nb=a.createBuffer(1,a.sampleRate,a.sampleRate);const c=nb.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=Math.random()*2-1}const s=a.createBufferSource(),g=a.createGain(),fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.value=f;s.buffer=nb;g.gain.setValueAtTime(v,a.currentTime+at);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+at+d);s.connect(fl);fl.connect(g);g.connect(a.destination);s.start(a.currentTime+at);s.stop(a.currentTime+at+d)};
K.sfx=(k,v=1)=>{const T=K.tone,N=K.noise;switch(k){
 case'click':T(660,.05,.05*v);break;case'pop':T(520,.08,.07*v,'sine',0,900);break;case'coin':T(988,.07,.06*v,'square');T(1318,.14,.06*v,'square',.06);break;
 case'win':[523,659,784,1046,1318].forEach((f,i)=>T(f,.3,.09*v,'triangle',i*.1));break;case'lose':T(392,.25,.09*v,'sawtooth');T(311,.3,.08*v,'sawtooth',.2);T(233,.5,.08*v,'sawtooth',.4);break;
 case'hit':T(180,.12,.12*v,'square',0,60);N(.08,.15*v,2000);break;case'boom':N(.6,.5*v,700);T(90,.5,.2*v,'sawtooth',0,30);break;case'shoot':N(.12,.25*v,3000);T(400,.08,.05*v,'square',0,120);break;
 case'whoosh':N(.3,.15*v,900);break;case'card':N(.06,.15*v,4000);T(1200,.03,.03*v);break;case'dice':for(let i=0;i<5;i++)N(.04,.12*v,3000,i*.06);break;case'tick':T(1500,.03,.04*v,'square');break;
 case'good':T(660,.1,.07*v);T(880,.15,.07*v,'triangle',.08);break;case'bad':T(200,.25,.1*v,'sawtooth');break;case'jump':T(300,.12,.07*v,'square',0,700);break;case'blip':T(880,.04,.04*v,'square');break;case'level':[392,523,659,784].forEach((f,i)=>T(f,.18,.08*v,'square',i*.07));break}};
/* ---------- Canvas mit festem Spielfeld (letterbox) ---------- */
K.canvas=(W,H,opt={})=>{const cv=document.createElement('canvas');cv.className='game';document.body.prepend(cv);const x=cv.getContext('2d');const C={cv,x,W,H,s:1,ox:0,oy:0,D:1};
 C.fit=()=>{C.D=Math.min(devicePixelRatio||1,2);cv.width=innerWidth*C.D;cv.height=innerHeight*C.D;if(opt.fill){C.W=innerWidth;C.H=innerHeight;C.s=1;C.ox=C.oy=0}else{C.s=Math.min(innerWidth/W,innerHeight/H);C.ox=(innerWidth-W*C.s)/2;C.oy=(innerHeight-H*C.s)/2}if(opt.onResize)opt.onResize(C)};
 C.begin=(bg)=>{x.setTransform(C.D,0,0,C.D,0,0);if(bg){x.fillStyle=bg;x.fillRect(0,0,innerWidth,innerHeight)}x.translate(C.ox,C.oy);x.scale(C.s,C.s)};
 C.pt=e=>({x:(e.clientX-C.ox)/C.s,y:(e.clientY-C.oy)/C.s});
 addEventListener('resize',C.fit);C.fit();return C};
K.loop=f=>{let last=performance.now();const L=n=>{requestAnimationFrame(L);const dt=Math.min(.05,(n-last)/1000);last=n;f(dt,n/1000)};requestAnimationFrame(L)};
K.rr=(x,X,Y,w,h,r)=>{x.beginPath();if(x.roundRect)x.roundRect(X,Y,w,h,r);else x.rect(X,Y,w,h)};
/* ---------- Partikel ---------- */
K.parts=[];K.burst=(X,Y,n,col,sp=200,life=.7,size=4)=>{for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=sp*(.3+Math.random());K.parts.push({x:X,y:Y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:life*(.6+Math.random()*.6),L:life,c:Array.isArray(col)?K.pick(col):col,s:size*(.6+Math.random()*.8)})}};
K.partsStep=(dt,g=0)=>{for(let i=K.parts.length-1;i>=0;i--){const p=K.parts[i];p.l-=dt;p.vy+=g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.98;p.vy*=.98;if(p.l<=0)K.parts.splice(i,1)}};
K.partsDraw=x=>{for(const p of K.parts){x.globalAlpha=Math.max(0,p.l/p.L);x.fillStyle=p.c;x.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}x.globalAlpha=1};
/* ---------- Toast ---------- */
let tEl=null,tT=0;K.toast=(t,ms=2200)=>{if(!tEl){tEl=document.createElement('div');tEl.className='k-toast';document.body.appendChild(tEl)}tEl.textContent=t;tEl.style.opacity=1;clearTimeout(tT);tT=setTimeout(()=>tEl.style.opacity=0,ms)};
/* ---------- Bildschirme ---------- */
const screens={};K.screen=(id,html)=>{let el=screens[id];if(!el){el=document.createElement('div');el.className='k-scr';el.id='scr-'+id;document.body.appendChild(el);screens[id]=el}if(html!=null)el.innerHTML='<div class="k-panel">'+html+'</div>';return el};
K.show=id=>{for(const k in screens)screens[k].classList.toggle('show',k===id);K.cur=id||null};
K.hideAll=()=>K.show(null);
K.chips=(id,opts,val,on)=>{setTimeout(()=>{const el=K.$(id);if(!el)return;el.onclick=e=>{const b=e.target.closest('button');if(!b)return;el.querySelectorAll('button').forEach(q=>q.classList.toggle('on',q===b));K.sfx('click');on(isNaN(+b.dataset.v)?b.dataset.v:+b.dataset.v)}});return`<div class="k-chips" id="${id}">${opts.map(([v,t])=>`<button data-v="${v}" class="${v==val?'on':''}">${t}</button>`).join('')}</div>`};
/* Standard-Menü. cfg: {title,emoji,sub,body,solo:[{t,f}],online:{game,max,onStart},help,back:true} */
K.menu=cfg=>{const el=K.screen('menu',`<a class="k-back" href="../">← Alle Spiele</a>${cfg.emoji?`<div class="k-emoji">${cfg.emoji}</div>`:''}<h1 class="k-title">${cfg.title}</h1>${cfg.sub?`<div class="k-sub">${cfg.sub}</div>`:''}
 ${cfg.noName?'':`<div class="k-box"><input id="k-name" maxlength="14" placeholder="Dein Name" value="${K.esc(K.name())}"></div>`}
 ${cfg.body||''}
 ${(cfg.solo||[]).map((b,i)=>`<button class="${i?'':'pri k-big'}" id="k-solo${i}">${b.t}</button>`).join('')}
 ${cfg.online?`<div class="k-box"><h3>🌐 Online mit Freunden</h3><button id="k-create">Raum erstellen</button><div class="k-row"><input id="k-code" maxlength="4" placeholder="CODE" style="text-transform:uppercase;text-align:center;letter-spacing:6px;font-weight:800"><button id="k-join" style="flex:0 0 auto">Beitreten</button></div><div class="k-err" id="k-err"></div></div>`:''}
 ${cfg.help?`<p class="k-mut">${cfg.help}</p>`:''}`);
 const nm=()=>{const i=K.$('k-name');return K.setName(i?i.value:'')};
 (cfg.solo||[]).forEach((b,i)=>K.$('k-solo'+i).onclick=()=>{K.ac();nm();K.sfx('click');b.f()});
 if(cfg.online){const o=cfg.online,err=t=>K.$('k-err').textContent=t;
  const q=new URLSearchParams(location.search).get('code');if(q)K.$('k-code').value=q.toUpperCase();
  K.$('k-create').onclick=async()=>{K.ac();const n=nm();err('Erstelle Raum …');try{const r=await Room.create(o.game,Object.assign({name:n},o.info?o.info():{}),o.max||8);K.room=r;wireLobby(o);K.lobby(o)}catch(e){err('Online geht gerade nicht.')}};
  K.$('k-join').onclick=async()=>{K.ac();const n=nm(),c=K.$('k-code').value.trim().toUpperCase();if(c.length!==4){err('Bitte den 4-stelligen Code eingeben.');return}err('Verbinde …');try{const r=await Room.join(o.game,c,Object.assign({name:n},o.info?o.info():{}));K.room=r;wireLobby(o);K.lobby(o)}catch(e){err(e.message||'Raum nicht gefunden.')}}}
 K.show('menu');return el};
function wireLobby(o){const r=K.room;r.on('peers',()=>{if(K.cur==='lobby')K.lobby(o);o.onPeers&&o.onPeers(r)});r.on('close',()=>{K.toast('❌ Verbindung zum Raum verloren');o.onClose&&o.onClose()});if(o.onMsg)r.on('msg',o.onMsg);if(o.onLeave)r.on('leave',o.onLeave)}
K.lobby=o=>{const r=K.room;K.screen('lobby',`<h1 class="k-title" style="font-size:40px">LOBBY</h1><div class="k-box" style="text-align:center"><b>Raum-Code</b><div class="k-code">${r.code}</div><div class="k-mut">Freunde geben diesen Code ein.</div></div>
 <div class="k-box"><h3>Spieler (${r.peers.length}/${o.max||8})</h3><div class="k-plist">${r.peers.map(p=>`<div><span>${K.esc(p.name)}${p.id===K.uid()?' (du)':''}</span><span>${p.host?'👑':''}</span></div>`).join('')}</div>
 ${o.lobbyExtra&&r.isHost?o.lobbyExtra():''}<p class="k-mut">${r.isHost?(o.botsNote||'Leere Plätze füllen Bots auf.'):'Warte auf den Start durch den Gastgeber …'}</p></div>
 ${r.isHost?`<button class="pri k-big" id="k-go" ${r.peers.length<(o.min||1)?'disabled':''}>▶ Starten</button>`:''}<button id="k-leave">Verlassen</button>`);
 if(r.isHost)K.$('k-go').onclick=()=>{K.sfx('click');o.onStart(r)};K.$('k-leave').onclick=()=>{r.leave();K.room=null;K.show('menu')};K.show('lobby')};
K.leaveRoom=()=>{if(K.room){K.room.leave();K.room=null}};
/* Ergebnis-Bildschirm */
K.result=(title,html,btns)=>{K.screen('res',`<h1 class="k-title">${title}</h1><div class="k-box">${html}</div>${btns.map((b,i)=>`<button class="${i?'':'pri k-big'}" id="k-r${i}">${b.t}</button>`).join('')}`);btns.forEach((b,i)=>K.$('k-r'+i).onclick=()=>{K.sfx('click');b.f()});K.show('res')};
/* Joystick (virtuell): irgendwo auf der linken Hälfte ziehen */
K.stick=(opts={})=>{const S={x:0,y:0,on:false,id:null,sx:0,sy:0,cx:0,cy:0,R:opts.r||55};
 addEventListener('pointerdown',e=>{if(K.cur||S.on||(opts.left&&e.clientX>innerWidth*.5)||e.target.closest('button,a,input,.k-scr'))return;S.on=true;S.id=e.pointerId;S.sx=S.cx=e.clientX;S.sy=S.cy=e.clientY;S.x=S.y=0});
 addEventListener('pointermove',e=>{if(!S.on||e.pointerId!==S.id)return;S.cx=e.clientX;S.cy=e.clientY;let dx=S.cx-S.sx,dy=S.cy-S.sy;const d=Math.hypot(dx,dy);if(d>S.R&&opts.follow!==false){S.sx+=dx/d*(d-S.R);S.sy+=dy/d*(d-S.R);dx=S.cx-S.sx;dy=S.cy-S.sy}S.x=K.clamp(dx/S.R,-1,1);S.y=K.clamp(dy/S.R,-1,1);if(Math.hypot(S.x,S.y)<.12)S.x=S.y=0});
 const end=e=>{if(e.pointerId===S.id){S.on=false;S.x=S.y=0}};addEventListener('pointerup',end);addEventListener('pointercancel',end);
 S.draw=x=>{if(!S.on)return;x.setTransform(devicePixelRatio>1?Math.min(devicePixelRatio,2):1,0,0,devicePixelRatio>1?Math.min(devicePixelRatio,2):1,0,0);x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=3;x.beginPath();x.arc(S.sx,S.sy,S.R,0,7);x.stroke();x.fillStyle='rgba(255,255,255,.45)';x.beginPath();x.arc(S.sx+S.x*S.R,S.sy+S.y*S.R,22,0,7);x.fill()};
 return S};
K.keys={};addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;K.keys[e.key.toLowerCase()]=1});addEventListener('keyup',e=>{K.keys[e.key.toLowerCase()]=0});
K.dirKeys=()=>({x:(K.keys.d||K.keys.arrowright?1:0)-(K.keys.a||K.keys.arrowleft?1:0),y:(K.keys.s||K.keys.arrowdown?1:0)-(K.keys.w||K.keys.arrowup?1:0)});
/* Karten zeichnen (für Kartenspiele) */
K.suitCol=s=>s==='♥'||s==='♦'?'#e03131':'#111';
})();
