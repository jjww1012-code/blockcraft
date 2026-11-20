/* Verhindert Doppeltipp-Zoom und Pinch-Zoom auf iPad/iPhone (Safari ignoriert user-scalable=no) */
(function(){
  var st=document.createElement('style');
  st.textContent=':where(*){touch-action:manipulation}html,body{-webkit-text-size-adjust:100%}';
  (document.head||document.documentElement).appendChild(st);
  ['gesturestart','gesturechange','gestureend'].forEach(function(n){document.addEventListener(n,function(e){e.preventDefault()},{passive:false})});
  document.addEventListener('dblclick',function(e){e.preventDefault()},{passive:false});
  // zweiter schneller Tipp auf Flächen ohne eigene Funktion (z. B. Text, Hintergrund) -> kein Zoom
  var last=0;
  document.addEventListener('touchend',function(e){
    var now=Date.now(),t=e.target;
    if(now-last<350&&e.touches.length===0&&t&&!t.closest('input,textarea,select,a,button,[onclick],canvas,label')){e.preventDefault()}
    last=now;
  },{passive:false});
  document.addEventListener('touchmove',function(e){if(e.touches.length>1)e.preventDefault()},{passive:false});
})();
