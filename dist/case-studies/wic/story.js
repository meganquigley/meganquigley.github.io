import {beatAt,openingAt,clamp,produceTotal} from './model.mjs';
const scenes=[...document.querySelectorAll('.scene')];
const opening=document.querySelector('.opening');
const short=matchMedia('(max-height:560px)');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let queued=false;
const visible=new Set();
function renderScene(scene){
 const rect=scene.getBoundingClientRect();
 const frames=[...scene.querySelectorAll('.frame')];
 const current=beatAt(rect.top,rect.height,innerHeight,frames.length);
 scene.dataset.activeBeat=current;
 const progress=clamp(-rect.top/Math.max(1,rect.height-innerHeight));
 const local=clamp(progress*frames.length-current);
 const activeFrame=frames[current];
 // Continuous travel is computed from absolute scroll position, never elapsed time.
 const traveler=activeFrame.querySelector('.right .cart, .map-traveler.far');
 if(traveler&&!short.matches){
  const route=traveler.parentElement.querySelector('.cart-route,.route');
  if(route){
   const isMap=traveler.classList.contains('map-traveler');
   const start=isMap?0:current===1?.2:current===3?.55:0;
   const end=isMap?1:current===1?.55:current===3?1:.2;
   const amount=reduced.matches?end:start+(end-start)*clamp(local/.8);
   const point=route.getPointAtLength(route.getTotalLength()*amount);
   traveler.style.left=`${point.x/(isMap?330:320)*100}%`;
   traveler.style.top=`${point.y/(isMap?270:320)*100}%`;
   traveler.style.transform='translate(-50%,-50%)';
  }
 }
 const produce=activeFrame.querySelector('[data-months]');
 if(produce&&!short.matches){
  const end=Number(produce.dataset.months);
  const previous=current?Number(frames[current-1].querySelector('[data-months]').dataset.months):1;
  const month=reduced.matches?end:Math.round(previous+(end-previous)*clamp(local/.75));
  produce.querySelectorAll('.month').forEach((cell,i)=>cell.classList.toggle('filled',i<month));
  produce.querySelector('.money span:last-child strong').textContent='$'+produceTotal(month).toLocaleString('en-US');
  produce.querySelector('.axis-note').textContent=month+' of 60 months illustrated · available, not redeemed.';
 }
 frames.forEach((frame,i)=>{
  const active=i===current;
  frame.classList.toggle('is-active',active);
  // Short viewports show every frame in normal flow, including at 200% zoom.
  frame.inert=!short.matches&&!active;
  if(!short.matches&&!active)frame.setAttribute('aria-hidden','true');
  else frame.removeAttribute('aria-hidden');
 });
 scene.querySelectorAll('.beat-progress i').forEach((mark,i)=>mark.classList.toggle('passed',i<=current));
}
function render(all=false){
 queued=false;
 const rect=opening.getBoundingClientRect();
 const state=openingAt(rect.top,rect.height,innerHeight);
 opening.style.setProperty('--symbol-scale',state.scale);
 opening.style.setProperty('--word-opacity',state.words);
 opening.style.setProperty('--cue-opacity',state.cue);
 (all?scenes:visible).forEach(renderScene);
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(()=>render());}}
// Populate every state before enabling the sticky enhancement (also works on a deep link).
try {
 document.documentElement.classList.add('enhanced');
 render(true);
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);renderScene(entry.target);}
 },{rootMargin:'100% 0px'});
 scenes.forEach(scene=>observer.observe(scene));
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',()=>render(true));
 addEventListener('pageshow',()=>render(true));
 addEventListener('hashchange',()=>requestAnimationFrame(()=>render(true)));
 short.addEventListener('change',()=>render(true));
 reduced.addEventListener('change',()=>render(true));
 document.fonts?.ready.then(()=>render(true));
} catch(error) {
 document.documentElement.classList.remove('enhanced');
 document.querySelectorAll('.frame').forEach(f=>{f.inert=false;f.removeAttribute('aria-hidden');});
 console.error('Story enhancement unavailable; showing complete static story.',error);
}
