import {clamp,produceTotal,checkoutAt} from './model.mjs?v=20260927-continuity2';
const scenes=[...document.querySelectorAll('.scene')];
const basket=JSON.parse(document.querySelector('#basket-data').textContent);
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let queued=false;
// Keep narration in document flow; only the artwork is pinned.
const sceneFrames=new Map();
function prepareStory(){
 scenes.forEach(scene=>{
  const frames=[...scene.querySelectorAll('.frame')];sceneFrames.set(scene,frames);
  const steps=document.createElement('div');steps.className='story-steps';
  const person=frames.find(f=>!f.classList.contains('phone-frame')&&f.querySelector('.pair'));
  frames.forEach((frame,i)=>{
   const step=document.createElement('div');step.className='story-step';step.dataset.beat=i;
   const caption=frame.querySelector('.caption');
   if(frame.classList.contains('phone-frame')){
    const chat=frame.querySelector('.phone-chat');
    caption.replaceChildren(chat.cloneNode(true));caption.classList.add('conversation-caption');
    if(person)frame.querySelector('.visual').replaceChildren(person.querySelector('.pair').cloneNode(true));
    frame.classList.remove('phone-frame');
   }
   step.append(caption);steps.append(step);
   frame.querySelectorAll('.crowd-view>svg').forEach(svg=>svg.setAttribute('preserveAspectRatio','xMidYMid slice'));
  });
  // Identical pictures persist while successive captions pass over them.
  const pictures=new Map();
  frames.forEach((frame,i)=>{
   const key=frame.querySelector('.visual').innerHTML.replace(' final-art','');
   if(!pictures.has(key))pictures.set(key,i);
   frame.dataset.artFrame=pictures.get(key);
  });
  scene.append(steps);
 });
}
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
  scene.querySelectorAll('.receipt-row').forEach((row,i)=>{row.classList.toggle('scanned',i<state.count);row.hidden=i>=state.count;});
  for(const [key,value] of Object.entries({total:state.total,without:state.total,own:state.own,covered:state.covered}))scene.querySelector('[data-'+key+']').textContent=money(value);
  const rows=[...scene.querySelectorAll('.receipt-row')];
  const latest=rows[Math.max(0,state.count-1)];
  const window=scene.querySelector('.receipt-window');
  const offset=state.count?Math.max(0,latest.offsetTop+latest.offsetHeight-window.clientHeight):0;
  scene.querySelector('.receipt-roll').style.transform=`translateY(${-offset}px)`;
  rows.forEach((row,i)=>row.classList.toggle('current-item',i===state.count-1));
  if(current===6){scene.querySelector('[data-covered]').textContent='$0.00';scene.querySelector('[data-own]').textContent=money(state.total);}

 }
}
function renderScene(scene,speaking){
 const frames=sceneFrames.get(scene),steps=[...scene.querySelectorAll('.story-step')];
 const first=steps[0].getBoundingClientRect(),stepHeight=Math.max(1,first.height);
 const position=clamp((innerHeight*.65-first.top)/stepHeight,0,frames.length-.00001);
 const current=Math.floor(position),local=position-current,progress=position/frames.length;
 scene.dataset.activeBeat=current;
 const artIndex=Number(frames[current].dataset.artFrame);
 frames.forEach((frame,i)=>{const active=i===current,visible=i===artIndex;frame.classList.toggle('is-active',active);frame.classList.toggle('is-art-active',visible);frame.inert=!(visible&&speaking);frame.setAttribute('aria-hidden',String(!(visible&&speaking)));});
 const frame=frames[artIndex];scene.dataset.focus=frames[current].dataset.focus;
 scene.classList.toggle('has-research',Boolean(frame.querySelector('.research')));
 scene.style.setProperty('--scene-progress',progress);
 scene.classList.toggle('is-crowd',Boolean(frame.querySelector('.crowd-view')));
 scene.classList.toggle('is-ending',frame.dataset.focus==='ending');
 if(scene.classList.contains('immersive'))environment(scene,current,local,progress);
 if(scene.querySelector('.split-stage')){
  const t=current+local;
  const p=reduced.matches?(current===2?1:0):clamp((t-1.6)/1.1)*(1-clamp(t-3));
  scene.classList.toggle('has-message',current>=1);
  scene.style.setProperty('--message',reduced.matches?(current>=1?1:0):clamp((current+local-.8)/.3));
  scene.style.setProperty('--split',p);
  scene.style.setProperty('--room-opacity',1-clamp((t-3.2)/.7));scene.classList.toggle('is-split',p>.55);
 }
 if(frame.querySelector('.crowd-camera')){
  const view=frame.querySelector('.crowd-view'),svg=view.querySelector('svg');
  const width=svg.clientWidth||900,height=svg.clientHeight||540,columns=width<600?5:10,rows=100/columns;
  const cellWidth=width/columns,cellHeight=(height-120)/rows,figureScale=Math.min(cellWidth/40,cellHeight/48)*.88;
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  view.querySelectorAll('.crowd-person').forEach((person,i)=>person.setAttribute('transform',`translate(${(i%columns+.5)*cellWidth} ${(Math.floor(i/columns)+.5)*cellHeight}) scale(${figureScale})`));
  const crowdStart=frames.findIndex(f=>f.querySelector('.crowd-camera'));
  const p=reduced.matches?(current===crowdStart?0:1):clamp((current+local-crowdStart-.15)/1.5);
  const startScale=Math.min(width*.65,height*.5)/(52*figureScale),scale=startScale+(1-startScale)*p;
  const originX=(44%columns+.5)*cellWidth,originY=(Math.floor(44/columns)+.5)*cellHeight;
  frame.querySelector('.crowd-camera').setAttribute('transform',`translate(${(width/2-originX*startScale)*(1-p)} ${(height*.32-originY*startScale)*(1-p)}) scale(${scale})`);
  view.style.setProperty('--crowd',p);view.classList.toggle('is-wide',p>.65);
 }
 const produce=frame.querySelector('[data-months]');
 if(produce){const end=Number(produce.dataset.months),previous=current?Number(frames[current-1].querySelector('[data-months]')?.dataset.months||1):1,month=reduced.matches?end:Math.round(previous+(end-previous)*clamp(local/.75));produce.querySelectorAll('.month').forEach((cell,i)=>cell.classList.toggle('filled',i<month));produce.querySelector('.money span:last-child strong').textContent='$'+produceTotal(month).toLocaleString('en-US');produce.querySelector('.axis-note').textContent=month+' of 60 months · available produce benefits';}
}
const colors=['#dedec5','#ecd0bd','#f0ebdc','#c9dadd','#dde5d4','#e6dcc7','#ddd8cd','#eeeadd','#c4d3d9','#dedec9','#ede2cc','#dce7e3'];
function render(){
 queued=false;
 scenes.forEach((scene,i)=>{
  const rect=scene.getBoundingClientRect();
  const present=rect.top<innerHeight&&rect.bottom>0;
  const speaking=rect.top<=innerHeight*.5&&rect.bottom>innerHeight*.5;
  scene.classList.toggle('is-present',present);scene.classList.toggle('is-speaking',speaking);
  scene.style.setProperty('--scene-background',colors[Number(scene.id.split('-')[1])-1]);
  scene.querySelector('.sticky').inert=!speaking;
  if(present)renderScene(scene,speaking);
 });
}

function schedule(){if(!queued){queued=true;requestAnimationFrame(render);}}
try{prepareStory();document.documentElement.classList.add('enhanced');render();addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('pageshow',schedule);addEventListener('hashchange',schedule);reduced.addEventListener('change',schedule);document.fonts?.ready.then(schedule);}catch(error){document.documentElement.classList.remove('enhanced');document.querySelectorAll('.frame').forEach(f=>{f.inert=false;f.removeAttribute('aria-hidden');});console.error('Story enhancement unavailable',error);}

const details=document.querySelector('#source-dialog');let detailTrigger;
document.querySelectorAll('.source-link').forEach(link=>link.addEventListener('click',event=>{
 const source=document.querySelector(link.getAttribute('href'));if(!source||!details.showModal)return;
 event.preventDefault();detailTrigger=link;details.querySelector('.detail-content').innerHTML=source.innerHTML;
 details.querySelector('h3').id='detail-title';details.showModal();
}));
details.querySelector('.close-details').addEventListener('click',()=>details.close());
details.addEventListener('click',event=>{if(event.target===details){const r=details.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)details.close();}});
details.addEventListener('close',()=>detailTrigger?.focus({preventScroll:true}));
