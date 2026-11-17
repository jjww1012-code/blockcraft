/* ---------- City: fixed 20x20 map ---------- */
const CELL=520,ROAD=170,HALF=ROAD/2,S=CELL-ROAD;
const ROOFS=[['#2b2f42','#171a26'],['#33293f','#1c1724'],['#243540','#141e24'],['#3b2e2b','#211a18'],['#2d2d36','#19191f'],['#22293b','#131722']];
const HOUSES=[['#6a3a30','#4a423a'],['#2f3a4c','#3e4250'],['#3b3b40','#48464a'],['#5a4a2a','#4a4236'],['#3a4a3a','#4a5248']];
const CONT=[['#c4561c','#6a2e10'],['#1f5aa8','#10305a'],['#2f7d4a','#174027'],['#a82638','#58141e'],['#8a8f99','#474a52']];
const CARC=['#8a93a8','#a82638','#1f5aa8','#d9d9de','#2f2f36','#c9a227','#2f7d4a'];
const NEON=['#ff2e9a','#3af0ff','#ffd23a','#8a5cff','#3dff9a'];
const DNAME={city:'Innenstadt',resi:'Wohngebiet',ind:'Industriegebiet',waste:'Brachland',park:'Stadtpark',water:'Hafenbecken'};
const MAPW=20,MI0=-10,MJ0=-10;
const MAPG=[
 'RRRRRPRRRCCIIIIIIBBB',
 'RRRRRRRRCCCIIIIIIBBB',
 'RRPRRRRCCCCCIIIIIIBB',
 'RRRRRRCCCCCCCIIIIIIB',
 'RRRRRCCCPCCCCCIIIIII',
 'PRRRRCCCCCCCCCCIIIII',
 'RRRRCCCCCCCPCCCCIIII',
 'RRRRCCCCCCCCCCCCRRII',
 'RRRPCCCCCCCCCCCCRRRI',
 'RRRRCCCCCPCCCCCRRRRR',
 'BRRRRCCCCCCCCCCRRPRR',
 'BBRRRRCCCCCCCCRRRRRR',
 'BBBRRRRCCCCCCRRRRRRR',
 'BBBBRRRRCCCCRRRPRRRR',
 'BBBBBRRRRRRRRRRRRRRR',
 'BBBBBRRRPRRRRRRRRRRB',
 'BBBBBBRRRRRRRRRRRRBB',
 'BBBBBBBRRRRRPRRRRBBB',
 'BBBBBBBBRRRRRRRRBBBB',
 'BBBBBBBBBRRRRRRBBBBB'];
const BMIN=MI0*CELL-HALF+6,BMAX=(MI0+MAPW)*CELL+HALF-6;
const inMap=(i,j)=>i>=MI0&&i<MI0+MAPW&&j>=MJ0&&j<MJ0+MAPW;
function district(i,j){if(!inMap(i,j))return 'water';return {C:'city',R:'resi',I:'ind',B:'waste',P:'park'}[MAPG[j-MJ0][i-MI0]];}

const PTYPE={
  safe:{col:'#3dff9a',sign:'SAFEHOUSE',ico:'S',name:'Safehouse',room:true,foot:true},
  police:{col:'#2e7bff',sign:'POLIZEI',ico:'P',name:'Polizeiwache'},
  hosp:{col:'#ff4060',sign:'KLINIK',ico:'+',name:'Krankenhaus'},
  kiosk:{col:'#ffd23a',sign:'24/7',ico:'K',name:'24/7 Kiosk',room:true,foot:true,clerk:true,rob:true,loot:[400,1100],floor:'tile'},
  gun:{col:'#ff5a3a',sign:'WAFFEN',ico:'G',name:'Waffenladen',room:true,foot:true,clerk:true,rob:true,loot:[900,2200],floor:'concrete'},
  work:{col:'#ff9a2e',sign:'WERKSTATT',ico:'W',name:'Werkstatt',garage:true,car:true,floor:'concrete'},
  dealer:{col:'#3af0ff',sign:'AUTOHAUS',ico:'A',name:'Autohaus',room:true,foot:true,clerk:true,floor:'shiny'}};
const PLACES=[
  {id:'safe',type:'safe',i:0,j:0},{id:'police',type:'police',i:-2,j:-4},{id:'police2',type:'police',i:4,j:4},
  {id:'hosp',type:'hosp',i:3,j:-2},{id:'hosp2',type:'hosp',i:-5,j:5},
  {id:'k1',type:'kiosk',i:-1,j:1},{id:'k2',type:'kiosk',i:-6,j:-2},{id:'k3',type:'kiosk',i:3,j:0},{id:'k4',type:'kiosk',i:6,j:6},{id:'k5',type:'kiosk',i:-3,j:-7},{id:'k6',type:'kiosk',i:1,j:6},
  {id:'g1',type:'gun',i:2,j:-1},{id:'g2',type:'gun',i:-4,j:3},{id:'g3',type:'gun',i:7,j:-5},
  {id:'w1',type:'work',i:2,j:-5},{id:'w2',type:'work',i:-3,j:2},{id:'w3',type:'work',i:5,j:3},
  {id:'dealer',type:'dealer',i:1,j:-1}];
PLACES.forEach(p=>{
  const x0=p.i*CELL+HALF,y0=p.j*CELL+HALF,t=p.t=PTYPE[p.type];p.x0=x0;p.y0=y0;
  p.sx=x0+S/2;p.sy=(p.j+1)*CELL+34;p.mx=x0+S/2;p.my=y0+S/2;
  if(t.room||t.garage){
    const bx=x0+30,by=y0+50,bw=S-60,bh=S-90,dw=t.garage?150:38;
    p.box={bx,by,bw,bh,dw};p.inside={x0:bx+6,y0:by+6,x1:bx+bw-6,y1:by+bh-6};p.door={x:bx+bw/2,y:by+bh+24};p.my=by+bh+10;
    if(p.type==='kiosk'){p.ix=bx+90;p.iy=by+128;p.clerkPos={x:bx+90,y:by+62};p.shopPos={x:bx+165,y:by+150};}
    else if(p.type==='gun'){p.ix=bx+bw/2;p.iy=by+140;p.clerkPos={x:bx+bw/2,y:by+62};p.shopPos={x:bx+70,y:by+190};}
    else if(p.type==='dealer'){p.ix=bx+60;p.iy=by+84;p.clerkPos={x:bx+60,y:by+18};}
    else if(p.type==='safe'){p.ix=bx+50;p.iy=by+140;}
    else if(p.type==='work'){p.ix=bx+bw/2;p.iy=by+bh/2;}
  }
});
const placeAt=new Map(PLACES.map(p=>[p.i+','+p.j,p]));
const placeById=id=>PLACES.find(p=>p.id===id);
function nearestPlace(type,x,y){let best=null,bd=1e12;for(const p of PLACES)if(p.type===type){const d=Math.hypot(p.mx-x,p.my-y);if(d<bd){bd=d;best=p;}}return best;}
function insidePlace(x,y){const p=placeAt.get(Math.floor(x/CELL)+','+Math.floor(y/CELL));if(p&&p.inside&&x>p.inside.x0&&x<p.inside.x1&&y>p.inside.y0&&y<p.inside.y1)return p;return null;}

const cells=new Map();
function getCell(i,j){
  const k=i+','+j;let c=cells.get(k);if(c)return c;
  const d=district(i,j),r=hash(i,j),r2=hash(i+31,j-17),R=n=>hash(i*31+n*7+1,j*17-n*13+3);
  c={d,b:[],o:[],ramps:[],kind:'blocks',open:false,patches:[]};cells.set(k,c);
  if(d==='water'){c.kind='water';c.open=true;c.water=true;return c;}
  const x0=i*CELL+HALF,y0=j*CELL+HALF,cx0=i*CELL,cy0=j*CELL;
  const rect=(x,y,w,h,kind,hf,pal,extra)=>{c.b.push(Object.assign({x,y,w,h,kind,hf,roof:pal[0],wall:pal[1],seed:hash(Math.floor(x),Math.floor(y))},extra||{}));};
  const prop=(x,y,w,h,kind,hf)=>rect(x,y,w,h,kind,hf,['#000','#000'],{prop:true});
  const circ=(x,y,r,kind,hf,extra)=>{c.o.push(Object.assign({x,y,r,kind,hf},extra||{}));};
  const ramp=(x,y,dir)=>{const vert=Math.abs(Math.sin(dir))>.5,w=vert?96:64,h=vert?64:96;c.ramps.push({x:x-w/2,y:y-h/2,w,h,dir});};
  const cont=(x,y,vert,n)=>{const w=vert?38:118,h=vert?118:38;rect(x-w/2,y-h/2,w,h,'container',.05,CONT[Math.floor(R(n)*CONT.length)]);};
  const trees=()=>{c.kind='park';const n=5+Math.floor(R(2)*6);for(let q=0;q<n;q++)circ(x0+34+R(10+q)*(S-68),y0+34+R(30+q)*(S-68),12+R(50+q)*12,'tree',.05);};
  function parking(){
    c.kind='parking';
    for(let row=0;row<2;row++)for(let s=0;s<9;s++){if(R(100+row*10+s)>.7)continue;
      const x=x0+11+s*37,y=row?y0+S-18-46:y0+18;rect(x,y,24,46,'parked',.03,[CARC[Math.floor(R(130+row*10+s)*CARC.length)],'#0d0e13']);}
    if(R(5)<.4)ramp(x0+S/2,y0+S/2,R(6)<.5?0:PI);
  }
  const pl=placeAt.get(k);
  if(pl){
    c.kind='place';c.place=pl;
    if(!pl.box){rect(x0+14,y0+14,S-28,S-130,'shop',.1,['#30333f','#262935'],{place:pl});if(pl.type==='police')for(let q=0;q<3;q++)prop(x0+43+q*60,y0+257,22,46,'deco',.03);return c;}
    const {bx,by,bw,bh,dw}=pl.box,wt=6,fw=(bw-dw)/2,pal=['#3a3d4a','#2a2d38'];
    rect(bx,by,wt,bh,'wall',.2,pal,{prop:true});rect(bx+bw-wt,by,wt,bh,'wall',.2,pal,{prop:true});rect(bx,by,bw,wt,'wall',.2,pal,{prop:true});
    rect(bx,by+bh-wt,fw,wt,'wall',.2,pal,{prop:true});rect(bx+bw-fw,by+bh-wt,fw,wt,'wall',.2,pal,{prop:true});
    if(pl.type==='kiosk'){prop(bx+30,by+80,120,20,'counter',.03);for(const q of [40,100,160])prop(bx+190,by+q,70,16,'shelf',.044);prop(bx+8,by+150,18,80,'fridge',.07);}
    else if(pl.type==='gun'){prop(bx+40,by+90,bw-80,20,'counter',.03);}
    else if(pl.type==='dealer'){prop(bx+20,by+30,80,20,'counter',.03);prop(bx+155,by+30,80,80,'display',.05);prop(bx+155,by+140,80,80,'display',.05);}
    else if(pl.type==='safe'){prop(bx+20,by+20,60,90,'bed',.03);prop(bx+180,by+150,90,26,'sofa',.03);prop(bx+190,by+90,60,30,'table',.03);prop(bx+200,by+8,70,8,'tv',.05);prop(bx+6,by+bh-115,22,90,'kitchen',.04);}
    else if(pl.type==='work'){prop(bx+8,by+8,40,24,'bench',.04);prop(bx+bw-48,by+8,40,24,'bench',.04);}
    return c;
  }
  if(d==='waste'){
    c.open=true;c.kind='waste';
    for(let n=0;n<6;n++)c.patches.push({x:cx0+R(n)*CELL,y:cy0+R(n+20)*CELL,r:30+R(n+40)*70});
    const pad=80,span=CELL-2*pad,pt=n=>[cx0+pad+R(n)*span,cy0+pad+R(n+50)*span],t=R(1);
    if(t<.3){const n=2+Math.floor(R(2)*3);for(let q=0;q<n;q++){const [x,y]=pt(10+q);cont(x,y,R(30+q)>.5,60+q);}}
    else if(t<.52){const [x,y]=pt(10),vert=R(11)>.5,n=4+Math.floor(R(12)*3);for(let q=0;q<n;q++){const bx=vert?x:x-n*45+q*90,by=vert?y-n*45+q*90:y;rect(bx-(vert?8:28),by-(vert?28:8),vert?16:56,vert?56:16,'barrier',.02,['#b9bcc6','#5a5d66']);}}
    else if(t<.76){const n=1+Math.floor(R(2)*3);for(let q=0;q<n;q++){const [x,y]=pt(10+q);circ(x,y,34+R(30+q)*24,'silo',.1+R(40+q)*.1);}}
    else{const n=3+Math.floor(R(2)*4);for(let q=0;q<n;q++){const [x,y]=pt(10+q);circ(x,y,12+R(30+q)*16,'rock',.03);}}
    if(R(3)<.6){const [x,y]=pt(77);ramp(x,y,[0,PI/2,PI,-PI/2][Math.floor(R(4)*4)]);}
  }else if(d==='park'){trees();if(R(5)<.5)ramp(x0+S/2,y0+S/2,R(6)<.5?0:PI/2);}
  else if(d==='city'){
    if(r<.08){c.kind='plaza';circ(x0+S/2,y0+S/2,48,'fountain',.02);
      for(const [a,b] of [[46,46],[S-46,46],[46,S-46],[S-46,S-46]])circ(x0+a,y0+b,7,'bollard',.03);
      if(R(5)<.5)ramp(x0+S/2,y0+70,PI/2);}
    else if(r<.13)trees();
    else if(r<.2)parking();
    else{
      const m=14,inner=S-2*m,sp=hash(i+5,j+11),g=26,hw=(inner-g)/2;let rs;
      if(sp<.4)rs=[[0,0,inner,inner]];
      else if(sp<.7)rs=hash(i,j+2)>.5?[[0,0,hw,inner],[hw+g,0,hw,inner]]:[[0,0,inner,hw],[0,hw+g,inner,hw]];
      else rs=[[0,0,hw,hw],[hw+g,0,hw,hw],[0,hw+g,hw,hw],[hw+g,hw+g,hw,hw]];
      const dist=Math.hypot(i,j),tall=clamp(1.3-dist/14,.5,1.3);
      rs.forEach((q,n)=>{const hh=hash(i*13+n,j*17-n);rect(x0+m+q[0],y0+m+q[1],q[2],q[3],'tower',(.1+hh*.17)*tall+.02,ROOFS[Math.floor(hash(i+n,j-n)*ROOFS.length)],
        {neon:hh>.66?NEON[Math.floor(hash(n+1,i+j)*NEON.length)]:null,tex:Math.floor(hash(i-n,j+n)*winMats.length)});});
    }
  }else if(d==='resi'){
    if(r<.15)trees();
    else if(r<.24)parking();
    else{c.kind='resi';const m=22,g=46,hw=(S-2*m-g)/2;
      for(let q=0;q<4;q++){const qx=q%2,qy=q>>1,bx=x0+m+qx*(hw+g),by=y0+m+qy*(hw+g);
        if(R(q)<.78){const w=hw-R(10+q)*30,h=hw-R(20+q)*30;rect(bx+R(30+q)*(hw-w),by+R(40+q)*(hw-h),w,h,'house',.08+R(50+q)*.04,HOUSES[Math.floor(R(60+q)*HOUSES.length)]);}
        else{circ(bx+hw/2,by+hw/2,16+R(70+q)*8,'tree',.05);if(R(80+q)<.5)circ(bx+hw/2+40,by+hw/2-30,12,'tree',.05);}}}
  }else{
    if(r<.18)parking();
    else if(r<.42){c.kind='yard';const n=3+Math.floor(R(2)*3);for(let q=0;q<n;q++)cont(x0+70+R(10+q)*(S-140),y0+70+R(30+q)*(S-140),R(50+q)>.5,60+q);if(R(5)<.55)ramp(x0+S/2,y0+S/2,[0,PI/2,PI,-PI/2][Math.floor(R(6)*4)]);}
    else{c.kind='ind';const horiz=R(1)>.5,hf=.08+R(3)*.04,pal=['#4a505c','#2c3038'];
      if(horiz){rect(x0+14,y0+14,S-28,S*.55,'warehouse',hf,pal);cont(x0+80+R(4)*(S-160),y0+S*.82,false,61);}
      else{rect(x0+14,y0+14,S*.55,S-28,'warehouse',hf,pal);cont(x0+S*.82,y0+80+R(4)*(S-160),true,61);}}
  }
  const ld=district(i-1,j);
  if(!c.open&&r2<.09&&ld!=='waste'&&ld!=='water')ramp(i*CELL,y0+S/2,r2<.045?-PI/2:PI/2);
  return c;
}
function inCore(x,y){const lx=x-Math.floor(x/CELL)*CELL,ly=y-Math.floor(y/CELL)*CELL;return lx>HALF&&lx<CELL-HALF&&ly>HALF&&ly<CELL-HALF;}
function groundAt(x,y){const c=getCell(Math.floor(x/CELL),Math.floor(y/CELL));if(c.water)return 0;if(c.open)return 1;return inCore(x,y)&&(c.kind==='park'||c.kind==='resi')?1:0;}
function groundBase(x,y){const c=getCell(Math.floor(x/CELL),Math.floor(y/CELL));return !c.open&&inCore(x,y)?2:0;}
function blocked(x,y){
  if(x<BMIN+10||x>BMAX-10||y<BMIN+10||y>BMAX-10)return true;
  const c=getCell(Math.floor(x/CELL),Math.floor(y/CELL));
  for(const b of c.b)if(x>b.x-10&&x<b.x+b.w+10&&y>b.y-10&&y<b.y+b.h+10)return true;
  for(const o of c.o)if(Math.hypot(x-o.x,y-o.y)<o.r+10)return true;
  return false;
}
function tallAt(x,y){
  const c=getCell(Math.floor(x/CELL),Math.floor(y/CELL));
  for(const b of c.b)if(b.hf>=.075&&x>b.x-6&&x<b.x+b.w+6&&y>b.y-6&&y<b.y+b.h+6)return true;
  for(const o of c.o)if((o.kind==='silo'||o.kind==='tree')&&Math.hypot(x-o.x,y-o.y)<o.r+6)return true;
  return false;
}
function solidAt(x,y){
  if(x<BMIN||x>BMAX||y<BMIN||y>BMAX)return false;
  const c=getCell(Math.floor(x/CELL),Math.floor(y/CELL));
  for(const b of c.b)if(b.hf>=.048&&x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h)return true;
  for(const o of c.o){if(o.kind==='silo'&&Math.hypot(x-o.x,y-o.y)<o.r)return true;if(o.kind==='tree'&&Math.hypot(x-o.x,y-o.y)<o.r*.3)return true;}
  return false;
}
function los(x1,y1,x2,y2){const d=Math.hypot(x2-x1,y2-y1),n=Math.ceil(d/10);for(let k=1;k<n;k++){const t=k/n;if(solidAt(x1+(x2-x1)*t,y1+(y2-y1)*t))return false;}return true;}
function clampMap(c,r){
  let imp=0;const lo=BMIN+r,hi=BMAX-r;
  if(c.x<lo){c.x=lo;if(c.vx<0){imp=Math.max(imp,-c.vx);c.vx*=-.3;}}
  if(c.x>hi){c.x=hi;if(c.vx>0){imp=Math.max(imp,c.vx);c.vx*=-.3;}}
  if(c.y<lo){c.y=lo;if(c.vy<0){imp=Math.max(imp,-c.vy);c.vy*=-.3;}}
  if(c.y>hi){c.y=hi;if(c.vy>0){imp=Math.max(imp,c.vy);c.vy*=-.3;}}
  return imp;
}
/* sidewalk loops and road nodes for NPCs */
const CORN=[[0,0],[1,0],[1,1],[0,1]];
function cornerPos(i,j,c){return{x:i*CELL+HALF+5+CORN[c][0]*(S-10),y:j*CELL+HALF+5+CORN[c][1]*(S-10)};}
function pedCell(i,j){return inMap(i,j)&&!getCell(i,j).open;}
const LANE=34;
function segOK(gi,gj,d){
  let a,b;
  if(d[0]===1){a=[gi,gj-1];b=[gi,gj];}else if(d[0]===-1){a=[gi-1,gj-1];b=[gi-1,gj];}
  else if(d[1]===1){a=[gi-1,gj];b=[gi,gj];}else{a=[gi-1,gj-1];b=[gi,gj-1];}
  return inMap(a[0],a[1])||inMap(b[0],b[1]);
}
function nodeDirs(gi,gj,cur){
  const all=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>segOK(gi,gj,d));
  if(!cur)return all;const f=all.filter(d=>!(d[0]===-cur[0]&&d[1]===-cur[1]));return f.length?f:all;
}
const nodeTarget=(gi,gj,d)=>({x:gi*CELL-d[1]*LANE,y:gj*CELL+d[0]*LANE,gi,gj});
