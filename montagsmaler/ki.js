'use strict';
/* Montagsmaler-KI: kleines neuronales Netz (CNN), trainiert auf dem
   Google „Quick, Draw!“-Datensatz (CC BY 4.0). Läuft komplett im Browser. */
(function(){
const KI={ready:false,cats:[],draws:null};
let W=null;
function f16(b64){const bin=atob(b64),n=bin.length/2,out=new Float32Array(n);
 for(let i=0;i<n;i++){const h=bin.charCodeAt(2*i)|(bin.charCodeAt(2*i+1)<<8);const s=h&0x8000?-1:1,e=(h>>10)&31,m=h&1023;
  out[i]=e===0?s*m*Math.pow(2,-24):e===31?s*Infinity:s*(1+m/1024)*Math.pow(2,e-15)}return out}
KI.load=async function(){if(KI.ready)return true;if(KI._p)return KI._p;
 KI._p=(async()=>{const [m,d]=await Promise.all([fetch('ki-modell.json').then(r=>r.json()),fetch('ki-striche.json').then(r=>r.json())]);
  W={};for(const k of ['w1','b1','w2','b2','w3','b3','w4','b4'])W[k]=f16(m[k].d);KI.cats=m.cats;KI.draws=d;KI.ready=true;return true})();
 try{return await KI._p}catch(e){KI._p=null;return false}};
// 3x3-Faltung mit Padding 1; x: C*H*W, w: O*C*9
function conv(x,C,H,Wd,w,b,O){const out=new Float32Array(O*H*Wd);
 for(let o=0;o<O;o++){const ob=o*H*Wd;for(let i=0;i<H*Wd;i++)out[ob+i]=b[o];
  for(let c=0;c<C;c++){const xb=c*H*Wd,wb=(o*C+c)*9;
   for(let ky=0;ky<3;ky++)for(let kx=0;kx<3;kx++){const wv=w[wb+ky*3+kx];if(wv===0)continue;
    for(let y=0;y<H;y++){const yy=y+ky-1;if(yy<0||yy>=H)continue;const xr=xb+yy*Wd,orow=ob+y*Wd;
     for(let xx=0;xx<Wd;xx++){const sx=xx+kx-1;if(sx<0||sx>=Wd)continue;out[orow+xx]+=wv*x[xr+sx]}}}}}
 for(let i=0;i<out.length;i++)if(out[i]<0)out[i]=0;return out}
function pool(x,C,H,Wd){const h=H/2,w2=Wd/2,out=new Float32Array(C*h*w2);
 for(let c=0;c<C;c++)for(let y=0;y<h;y++)for(let x0=0;x0<w2;x0++){const b=c*H*Wd+2*y*Wd+2*x0;
  out[c*h*w2+y*w2+x0]=Math.max(x[b],x[b+1],x[b+Wd],x[b+Wd+1])}return out}
function fc(x,w,b,n,relu){const m=b.length,out=new Float32Array(b);
 for(let i=0;i<n;i++){const v=x[i];if(v===0)continue;const r=i*m;for(let j=0;j<m;j++)out[j]+=v*w[r+j]}
 if(relu)for(let j=0;j<m;j++)if(out[j]<0)out[j]=0;return out}
function forward(img){let a=conv(img,1,28,28,W.w1,W.b1,16);a=pool(a,16,28,28);a=conv(a,16,14,14,W.w2,W.b2,32);a=pool(a,32,14,14);
 const h=fc(a,W.w3,W.b3,1568,true);const o=fc(h,W.w4,W.b4,128,false);let mx=-1e9;for(const v of o)mx=Math.max(mx,v);
 let s=0;const p=Array.from(o).map(v=>{const e=Math.exp(v-mx);s+=e;return e});return p.map(v=>v/s)}
// Striche wie im Datensatz aufbereiten: Ausschnitt zuschneiden, auf 28x28 skalieren, weiße Tinte auf Schwarz
const pc=document.createElement('canvas');pc.width=pc.height=112;const px=pc.getContext('2d',{willReadFrequently:true});
KI.image=function(strokes){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const ink=strokes.filter(s=>s.c!=='#ffffff'&&s.p.length);
 for(const s of ink)for(let i=0;i<s.p.length;i+=2){x0=Math.min(x0,s.p[i]);x1=Math.max(x1,s.p[i]);y0=Math.min(y0,s.p[i+1]);y1=Math.max(y1,s.p[i+1])}
 if(x0>x1)return null;const sz=Math.max(x1-x0,y1-y0,1),sc=96/sz,ox=8+(96-(x1-x0)*sc)/2,oy=8+(96-(y1-y0)*sc)/2;
 px.fillStyle='#000';px.fillRect(0,0,112,112);px.lineCap=px.lineJoin='round';
 for(const s of strokes){if(!s.p.length)continue;const er=s.c==='#ffffff';px.strokeStyle=er?'#000':'#fff';px.lineWidth=er?Math.max(6,s.w*sc):6.5;
  px.beginPath();px.moveTo((s.p[0]-x0)*sc+ox,(s.p[1]-y0)*sc+oy);if(s.p.length===2)px.lineTo((s.p[0]-x0)*sc+ox+.5,(s.p[1]-y0)*sc+oy);
  for(let i=2;i<s.p.length;i+=2)px.lineTo((s.p[i]-x0)*sc+ox,(s.p[i+1]-y0)*sc+oy);px.stroke()}
 const d=px.getImageData(0,0,112,112).data,img=new Float32Array(784);
 for(let y=0;y<28;y++)for(let x=0;x<28;x++){let v=0;for(let a=0;a<4;a++)for(let b=0;b<4;b++)v+=d[((y*4+a)*112+x*4+b)*4];img[y*28+x]=Math.min(1,v/16/255*1.15)}
 return img};
KI.predict=function(strokes,n=3){if(!KI.ready)return[];const img=KI.image(strokes);if(!img)return[];const p=forward(img);
 return p.map((v,i)=>[KI.cats[i],v]).sort((a,b)=>b[1]-a[1]).slice(0,n)};
// eine Datensatz-Zeichnung in Striche fürs 800x600-Feld umwandeln
KI.drawing=function(word){const list=KI.draws&&KI.draws[word];if(!list)return null;const dr=list[Math.floor(Math.random()*list.length)];
 let x1=0,y1=0;for(const s of dr){const n=s.length/2;for(let i=0;i<n;i++){x1=Math.max(x1,s[i]);y1=Math.max(y1,s[n+i])}}
 const sc=Math.min(640/Math.max(x1,1),480/Math.max(y1,1)),ox=(800-x1*sc)/2,oy=(600-y1*sc)/2;
 return dr.map(s=>{const n=s.length/2,p=[];for(let i=0;i<n;i++)p.push(Math.round(s[i]*sc+ox),Math.round(s[n+i]*sc+oy));return p})};
window.MMKI=KI;
})();
