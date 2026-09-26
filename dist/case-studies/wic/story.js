import {clamp,produceTotal,checkoutAt} from './model.mjs';
const scenes=[...document.querySelectorAll('.scene')];
const basket=JSON.parse(document.querySelector('#basket-data').textContent);
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let queued=false;
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
 if(scene.querySelector('.store-floor')){
  travel(scene.querySelector('.with-route'),scene.querySelector('.shopper-with'),clamp(t/4.8),true);
  travel(scene.querySelector('.without-route'),scene.querySelector('.shopper-without'),clamp(t/3.2),true);
  scene.style.setProperty('--wrong-opacity',current===1?1:0);
 }
 if(scene.querySelector('.conveyor')){
  const cuts=[0,3,5,7,9,11,11,11];const clock=cuts[current]+(cuts[current+1]-cuts[current])*(reduced.matches?.95:local);const state=checkoutAt(clock,basket);scene.querySelector('.checkout-environment').classList.toggle('is-rejected',current===4);scene.querySelector('.checkout-environment').classList.toggle('compare-left',current===6);
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
function renderScene(scene,speaking){
 const rect=scene.getBoundingClientRect(),frames=[...scene.querySelectorAll('.frame')];
 const distance=Math.max(1,rect.height-Number(scene.dataset.hold||0)*innerHeight);
 const progress=clamp(-rect.top/distance),current=Math.min(frames.length-1,Math.floor(progress*frames.length)),local=clamp(progress*frames.length-current);
 scene.dataset.activeBeat=current;
 frames.forEach((frame,i)=>{const active=i===current;frame.classList.toggle('is-active',active);frame.inert=!(active&&speaking);frame.setAttribute('aria-hidden',String(!(active&&speaking)));});
 const frame=frames[current];scene.dataset.focus=frame.dataset.focus;
 scene.classList.toggle('has-research',Boolean(frame.querySelector('.research')));
 scene.style.setProperty('--scene-progress',progress);
 if(scene.classList.contains('immersive'))environment(scene,current,local,progress);
 if(scene.querySelector('.split-stage')){
  const p=reduced.matches?(current===2?1:0):clamp((current+local-1.35)/1.15);
  scene.style.setProperty('--split',p);scene.classList.toggle('is-split',p>.55);
 }
 if(frame.querySelector('.crowd-camera')){
  const p=reduced.matches?(current===0?0:1):clamp((current+local-.15)/1.5),scale=8-7*p;
  frame.querySelector('.crowd-camera').setAttribute('transform',`translate(${(450-407*8)*(1-p)} ${(270-226*8)*(1-p)}) scale(${scale})`);
  frame.querySelector('.crowd-view').style.setProperty('--crowd',p);frame.querySelector('.crowd-view').classList.toggle('is-wide',p>.65);
 }
 const produce=frame.querySelector('[data-months]');
 if(produce){const end=Number(produce.dataset.months),previous=current?Number(frames[current-1].querySelector('[data-months]')?.dataset.months||1):1,month=reduced.matches?end:Math.round(previous+(end-previous)*clamp(local/.75));produce.querySelectorAll('.month').forEach((cell,i)=>cell.classList.toggle('filled',i<month));produce.querySelector('.money span:last-child strong').textContent='$'+produceTotal(month).toLocaleString('en-US');produce.querySelector('.axis-note').textContent=month+' of 60 months · available produce benefits';}
}
const colors=['#dedec5','#ecd0bd','#f0ebdc','#c9dadd','#dde5d4','#e6dcc7','#ddd8cd','#eeeadd','#c4d3d9','#dedec9','#ede2cc','#dce7e3'];
function mix(a,b,p){return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-p)+parseInt(b.slice(i,i+2),16)*p).toString(16).padStart(2,'0')).join('');}
function render(){
 queued=false;
 const landing=document.querySelector('.introduction'),lr=document.querySelector('.landing-track').getBoundingClientRect(),fade=innerHeight*.24;
 const rects=scenes.map(s=>s.getBoundingClientRect());
 let active=rects.findIndex(r=>r.top<=0&&r.bottom>0),next=active+1;
 const edge=active<0?lr.bottom:rects[active].bottom;
 const cross=next<scenes.length&&edge>=0&&edge<fade?1-edge/fade:0;
 const alpha=reduced.matches?(lr.bottom>0?1:0):clamp(lr.bottom/fade);
 landing.style.opacity=alpha;landing.style.visibility=lr.bottom>0?'visible':'hidden';landing.inert=lr.bottom<=0;
 scenes.forEach((scene,i)=>{
  const present=i===active||(i===next&&cross>0),speaking=present&&(cross>.5?i===next:i===active);
  scene.classList.toggle('is-present',present);scene.classList.toggle('is-speaking',speaking);
  scene.style.setProperty('--scene-alpha',reduced.matches?1:i===next?cross:1-cross);
  scene.querySelector('.sticky').inert=!speaking;
  if(present)renderScene(scene,speaking);
 });
 const base=active>=0?colors[active]:'#f8f6f0';document.body.style.setProperty('--story-background',cross?mix(base,colors[next],cross):base);
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(render);}}
try{document.documentElement.classList.add('enhanced');render();addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('pageshow',schedule);addEventListener('hashchange',schedule);reduced.addEventListener('change',schedule);document.fonts?.ready.then(schedule);}catch(error){document.documentElement.classList.remove('enhanced');document.querySelectorAll('.frame').forEach(f=>{f.inert=false;f.removeAttribute('aria-hidden');});console.error('Story enhancement unavailable',error);}

const details=document.querySelector('#source-dialog');let detailTrigger;
document.querySelectorAll('.source-link').forEach(link=>link.addEventListener('click',event=>{
 const source=document.querySelector(link.getAttribute('href'));if(!source||!details.showModal)return;
 event.preventDefault();detailTrigger=link;details.querySelector('.detail-content').innerHTML=source.innerHTML;
 details.querySelector('h3').id='detail-title';details.showModal();
}));
details.querySelector('.close-details').addEventListener('click',()=>details.close());
details.addEventListener('click',event=>{if(event.target===details){const r=details.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)details.close();}});
details.addEventListener('close',()=>detailTrigger?.focus({preventScroll:true}));
