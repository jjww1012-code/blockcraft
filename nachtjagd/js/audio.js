/* ---------- Sound: everything synthesized with WebAudio ---------- */
const SFX=(()=>{
  let ac=null,master=null,noise=null,L=null,muted=false;
  try{muted=localStorage.getItem('nachtjagd-mute')==='1'}catch(e){}
  function init(){
    if(ac){if(ac.state==='suspended')ac.resume();return;}
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    try{ac=new AC();}catch(e){ac=null;return;}
    master=ac.createGain();master.gain.value=muted?0:.8;master.connect(ac.destination);
    const len=ac.sampleRate*2,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;noise=buf;
    const nsrc=()=>{const s=ac.createBufferSource();s.buffer=noise;s.loop=true;return s;};
    const gain=v=>{const g=ac.createGain();g.gain.value=v;return g;};
    const eo=ac.createOscillator();eo.type='sawtooth';const eo2=ac.createOscillator();eo2.type='square';
    const ef=ac.createBiquadFilter();ef.type='lowpass';ef.frequency.value=600;const eg=gain(0);
    eo.connect(ef);eo2.connect(ef);ef.connect(eg);eg.connect(master);eo.start();eo2.start();
    const so=ac.createOscillator();so.type='triangle';const sg=gain(0);so.connect(sg);sg.connect(master);so.start();
    const sk=nsrc(),sf=ac.createBiquadFilter();sf.type='bandpass';sf.frequency.value=1400;sf.Q.value=3;const skg=gain(0);sk.connect(sf);sf.connect(skg);skg.connect(master);sk.start();
    const hn=nsrc(),hf=ac.createBiquadFilter();hf.type='lowpass';hf.frequency.value=260;const hg=gain(0),lfo=ac.createOscillator(),lg=gain(0);lfo.frequency.value=13;
    lfo.connect(lg);lg.connect(hg.gain);hn.connect(hf);hf.connect(hg);hg.connect(master);hn.start();lfo.start();
    L={eo,eo2,ef,eg,so,sg,skg,hg,lg};
  }
  const set=(p,v,t)=>p.setTargetAtTime(v,ac.currentTime,t||.05);
  function loops(o){
    if(!L)return;
    const on=o.engine>=0,e=on?o.engine:0;
    set(L.eg.gain,on?.03+e*.05:0,.08);
    const base=o.kind==='car'?36:o.kind==='scooter'?85:58,f=base+e*(o.kind==='car'?150:250);
    set(L.eo.frequency,f,.06);set(L.eo2.frequency,f*.5,.06);set(L.ef.frequency,380+e*1800,.1);
    set(L.sg.gain,(o.siren||0)*.045,.1);set(L.so.frequency,o.sirenHi?960:690,.02);
    set(L.skg.gain,(o.skid||0)*.06,.05);
    set(L.hg.gain,(o.heli||0)*.12,.2);set(L.lg.gain,(o.heli||0)*.1,.2);
  }
  function burst(dur,type,freq,v,q,sweep){
    const s=ac.createBufferSource();s.buffer=noise;const f=ac.createBiquadFilter();f.type=type;f.frequency.value=freq;if(q)f.Q.value=q;
    const t=ac.currentTime;if(sweep){f.frequency.setValueAtTime(freq,t);f.frequency.exponentialRampToValueAtTime(sweep,t+dur);}
    const g=ac.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random()*1.5);s.stop(t+dur+.05);
  }
  function tone(type,f1,f2,dur,v,delay){
    const o=ac.createOscillator();o.type=type;const t=ac.currentTime+(delay||0);o.frequency.setValueAtTime(f1,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
    const g=ac.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.05);
  }
  const N={};
  function play(name,v){
    if(!ac||muted)return;v=v==null?1:v;if(v<.03)return;
    const now=ac.currentTime;if(N[name]&&now-N[name]<.03)return;N[name]=now;
    switch(name){
      case 'pistol':burst(.2,'lowpass',2800,.55*v,0,380);tone('sine',150,50,.12,.5*v);break;
      case 'smg':burst(.1,'lowpass',3200,.38*v,0,600);tone('sine',120,50,.07,.3*v);break;
      case 'shotgun':burst(.45,'lowpass',1900,.75*v,0,180);tone('sine',90,32,.28,.75*v);break;
      case 'rifle':burst(.17,'lowpass',3800,.55*v,0,480);tone('sine',115,40,.1,.5*v);break;
      case 'boom':burst(1.5,'lowpass',1300,.9*v,0,55);tone('sine',70,24,1,.9*v);break;
      case 'crash':burst(.3,'bandpass',700,.6*v,.8);tone('sine',90,40,.18,.4*v);break;
      case 'punch':tone('sine',170,60,.12,.5*v);burst(.06,'lowpass',900,.3*v);break;
      case 'hit':tone('sine',230,90,.08,.25*v);break;
      case 'cash':tone('sine',1318,0,.12,.25*v);tone('sine',1760,0,.45,.25*v,.09);break;
      case 'buy':tone('sine',880,0,.08,.15*v);tone('sine',1320,0,.16,.15*v,.07);break;
      case 'click':tone('square',1800,0,.03,.05*v);break;
      case 'reload':tone('square',900,0,.03,.08*v);tone('square',600,0,.04,.08*v,.25);break;
      case 'empty':tone('square',1300,0,.02,.06*v);break;
      case 'honk':tone('square',400,0,.35,.07*v);tone('square',505,0,.35,.07*v);break;
      case 'land':tone('sine',80,40,.15,.4*v);break;
      case 'alarm':for(let k=0;k<6;k++)tone('square',k%2?880:660,0,.18,.06*v,k*.2);break;
      case 'door':tone('sine',520,0,.06,.08*v);tone('sine',390,0,.1,.08*v,.06);break;
    }
  }
  return{init,loops,play,
    get muted(){return muted},
    toggle(){muted=!muted;try{localStorage.setItem('nachtjagd-mute',muted?'1':'0')}catch(e){}if(master)master.gain.setTargetAtTime(muted?0:.8,ac.currentTime,.05);return muted;}};
})();
