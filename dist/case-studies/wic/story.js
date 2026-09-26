import {beatAt,openingAt,clamp,produceTotal,checkoutAt} from './model.mjs';
const scenes=[...document.querySelectorAll('.scene')],opening=document.querySelector('.opening');
const basket=JSON.parse(document.querySelector('#basket-data').textContent);
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const visible=new Set(); let queued=false;
const money=n=>'$'+(n/100).toFixed(2);
function travel(path,person,p,svg=false){
 const length=path.getTotalLength(),point=path.getPointAtLength(length*clamp(p));
 if(svg){person.setAttribute('transform',`translate(${point.x} ${point.y})`);path.style.strokeDasharray=length;path.style.strokeDashoffset=length*(1-clamp(p));}
 else {person.style.left=point.x/12+'%';person.style.top=`clamp(40px, ${point.y/6.2}%, calc(100% - 65px))`;}
 return point;
}
function environment(scene,current,local,progress){
 const t=current+(reduced.matches?.95:local);
 if(scene.querySelector('.real-map')){
  travel(scene.querySelector('.map-route-right'),scene.querySelector('.map-traveler-right'),clamp(t/2.8),true);
 }
 if(scene.querySelector('.store-camera')){
  travel(scene.querySelector('.left-route'),scene.querySelector('.shopper-left'),clamp((t-2)/1.4));
  const point=travel(scene.querySelector('.right-route'),scene.querySelector('.shopper-right'),clamp(t/4.8));
  const stage=scene.querySelector('.store-environment');
  scene.style.setProperty('--camera-x',Math.min(0,Math.max(stage.clientWidth-1000,stage.clientWidth/2-point.x/1200*1000))+'px');
  scene.style.setProperty('--wrong-opacity',current===1?1:0);
 }
 if(scene.querySelector('.conveyor')){
  const clock=t/5*basket.length;const state=checkoutAt(clock,basket);scene.querySelector('.checkout-environment').classList.toggle('is-rejected',current===4);scene.querySelector('.checkout-environment').classList.toggle('compare-left',current===6);
  scene.querySelectorAll('.belt-item').forEach((item,i)=>{const phase=clock-i;item.style.left=(-25+phase*140)+'%';item.style.opacity=phase>-.3&&phase<1.15?'1':'0';});
  scene.querySelector('.belt-texture').style.backgroundPositionX=clock*280+'px';
  scene.querySelectorAll('.receipt-row').forEach((row,i)=>row.classList.toggle('scanned',i<state.count));
  for(const [key,value] of Object.entries({total:state.total,without:state.total,own:state.own,covered:state.covered}))scene.querySelector('[data-'+key+']').textContent=money(value);
  const rows=[...scene.querySelectorAll('.receipt-row')];
  const latest=rows[Math.max(0,state.count-1)];
  const window=scene.querySelector('.receipt-window');
  const offset=Math.max(0,latest.offsetTop+latest.offsetHeight-window.clientHeight);
  scene.querySelector('.receipt-roll').style.transform=`translateY(${-offset}px)`;
  rows.forEach((row,i)=>row.classList.toggle('current-item',i===state.count-1));
  if(current===6){scene.querySelector('[data-covered]').textContent='$0.00';scene.querySelector('[data-own]').textContent=money(state.total);}

 }
}
function renderScene(scene){
 const rect=scene.getBoundingClientRect(),frames=[...scene.querySelectorAll('.frame')];
 const current=beatAt(rect.top,rect.height,innerHeight,frames.length),progress=clamp(-rect.top/Math.max(1,rect.height-innerHeight)),local=clamp(progress*frames.length-current);
 scene.dataset.activeBeat=current;
 frames.forEach((frame,i)=>{const active=i===current;frame.classList.toggle('is-active',active);frame.inert=!active;if(active)frame.removeAttribute('aria-hidden');else frame.setAttribute('aria-hidden','true');});
 const frame=frames[current];frame.style.setProperty('--enter',1);frame.style.setProperty('--local',0);scene.style.setProperty('--scene-progress',progress);frame.style.setProperty('--caption-reveal',reduced.matches?1:current===0?clamp((local-.12)/.16):1);scene.dataset.focus=frame.dataset.focus;if(frame.dataset.focus==='ending')frame.style.setProperty('--caption-reveal',reduced.matches?1:clamp(local/.32));
 scene.classList.toggle('has-research',Boolean(frame.querySelector('.research')));
 if(scene.classList.contains('immersive')){environment(scene,current,local,progress);}
 const produce=frame.querySelector('[data-months]');
 if(produce){const end=Number(produce.dataset.months),previous=current?Number(frames[current-1].querySelector('[data-months]')?.dataset.months||1):1,month=reduced.matches?end:Math.round(previous+(end-previous)*clamp(local/.75));produce.querySelectorAll('.month').forEach((cell,i)=>cell.classList.toggle('filled',i<month));produce.querySelector('.money span:last-child strong').textContent='$'+produceTotal(month).toLocaleString('en-US');produce.querySelector('.axis-note').textContent=month+' of 60 months · available produce benefits';}
 scene.querySelectorAll('.beat-progress i').forEach((mark,i)=>mark.classList.toggle('passed',i<=current));
}
function render(all=false){queued=false;const rect=opening.getBoundingClientRect(),state=openingAt(rect.top,rect.height,innerHeight);opening.style.setProperty('--symbol-scale',state.scale);opening.style.setProperty('--word-opacity',state.words);opening.style.setProperty('--cue-opacity',state.cue);(all?scenes:visible).forEach(renderScene);}
function schedule(){if(!queued){queued=true;requestAnimationFrame(()=>render());}}
try{document.documentElement.classList.add('enhanced');render(true);const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);renderScene(entry.target);}},{rootMargin:'100% 0px'});scenes.forEach(s=>observer.observe(s));addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>render(true));addEventListener('pageshow',()=>render(true));addEventListener('hashchange',()=>requestAnimationFrame(()=>render(true)));reduced.addEventListener('change',()=>render(true));document.fonts?.ready.then(()=>render(true));}catch(error){document.documentElement.classList.remove('enhanced');document.querySelectorAll('.frame').forEach(f=>{f.inert=false;f.removeAttribute('aria-hidden');});console.error('Story enhancement unavailable',error);}

const details=document.querySelector('#source-dialog');let detailTrigger;
document.querySelectorAll('.source-link').forEach(link=>link.addEventListener('click',event=>{
 const source=document.querySelector(link.getAttribute('href'));if(!source||!details.showModal)return;
 event.preventDefault();detailTrigger=link;details.querySelector('.detail-content').innerHTML=source.innerHTML;
 details.querySelector('h3').id='detail-title';details.showModal();
}));
details.querySelector('.close-details').addEventListener('click',()=>details.close());
details.addEventListener('click',event=>{if(event.target===details){const r=details.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)details.close();}});
details.addEventListener('close',()=>detailTrigger?.focus({preventScroll:true}));
