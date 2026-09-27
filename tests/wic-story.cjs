const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom'),css=require('css-tree');
(async()=>{
 const root=path.resolve(__dirname,'../dist/case-studies/wic');
 const {beatAt,openingAt,produceTotal,checkoutAt}=await import(path.join(root,'model.mjs'));
 for(const count of [3,4,5,6,7]){
  const height=900+(count-1)*648;
  assert.equal(beatAt(100,height,900,count),0);
  assert.equal(beatAt(-height,height,900,count),count-1);
  let prev=-1;
  for(let y=0;y<height;y+=17){const b=beatAt(-y,height,900,count);assert(b>=prev&&b<count);prev=b;}
  const positions=[0,-2000,-700,-200,-4000,0,-500];
  const before=positions.map(y=>beatAt(y,height,900,count));
  assert.deepEqual(positions.toReversed().map(y=>beatAt(y,height,900,count)).toReversed(),before);
 }
 assert.equal(openingAt(0,1890,900).scale,1);
 assert.equal(openingAt(-990,1890,900).words,1);
 assert.deepEqual([1,12,24,36,48,60].map(produceTotal),[52,624,936,1248,1560,1872]);
 const basket=JSON.parse(fs.readFileSync(path.join(root,'basket.json'))).items;
 basket.forEach(item=>assert.equal(Math.round(item.unit_cents*item.units),item.cents));
 assert.deepEqual(checkoutAt(12,basket),{count:11,total:4984,covered:4610,own:374});
 assert.deepEqual(checkoutAt(0,basket),{count:0,total:0,covered:0,own:0});
 assert.equal(checkoutAt(2,basket).total,534);
 const data=JSON.parse(fs.readFileSync(path.join(root,'evidence.json')));
 assert.equal(data.states.length,50);assert.equal(new Set(data.states.map(x=>x.state)).size,50);
 const mx=data.states.reduce((a,r)=>a+r.without_convenient_access_pct,0)/50;
 const my=data.states.reduce((a,r)=>a+r.eligible_covered_pct,0)/50;
 const sum=fn=>data.states.reduce((a,r)=>a+fn(r),0);
 const corr=sum(r=>(r.without_convenient_access_pct-mx)*(r.eligible_covered_pct-my))/Math.sqrt(sum(r=>(r.without_convenient_access_pct-mx)**2)*sum(r=>(r.eligible_covered_pct-my)**2));
 assert(Math.abs(corr-data.pearson_r)<1e-12);assert.equal(corr.toFixed(2),'-0.47');
 assert.equal((100*(1-254506/365738)).toFixed(1),'30.4');
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'));
 const d=dom.window.document;
 assert.equal(d.querySelectorAll('.scene').length,10);assert.equal(d.querySelectorAll('.frame').length,55);
 assert.equal(d.querySelectorAll('nav,[data-reading-toggle],#reading-mode').length,0);
 assert.equal(d.querySelectorAll('.opening a,.introduction a').length,0);
 for(const meta of ['robots','googlebot'])assert.equal(d.querySelector(`meta[name=${meta}]`).content,'noindex, nofollow, noarchive');
 assert.deepEqual([...d.querySelectorAll('script[src]')].map(x=>x.getAttribute('src')),['story.js?v=20260927-families4']);
 assert.deepEqual([...d.querySelectorAll('link[rel=stylesheet]')].map(x=>x.getAttribute('href')),['story.css?v=20260927-families4']);
 for(const frame of d.querySelectorAll('.frame')){
  assert.equal(frame.querySelectorAll('.caption').length,1);assert(frame.querySelector('.line,.opening-exchange').textContent.length);
  assert(frame.querySelector('.research')||frame.querySelector('.pair')||frame.querySelector('.anchors')||frame.closest('.immersive')||frame.querySelector('.ending-art')||frame.querySelector('.single-family'));
  if(frame.querySelector('.pair'))assert.deepEqual([...frame.querySelectorAll('.path-label')].map(x=>x.textContent),['✓ With WIC','○ Without WIC']);
 }
 for(const a of d.querySelectorAll('a[href^="#"]'))assert(d.getElementById(a.getAttribute('href').slice(1)));
 for(const el of d.querySelectorAll('[id]'))assert.equal(d.querySelectorAll(`[id="${el.id}"]`).length,1);
 const errors=[];css.parse(fs.readFileSync(path.join(root,'story.css'),'utf8'),{onParseError:e=>errors.push(e.message)});assert.deepEqual(errors,[]);
 assert.equal(d.querySelectorAll('img').length,1);
 assert.equal(d.querySelectorAll('.national-map .state-tile').length,100);
 assert.equal(d.querySelectorAll('.scatter,.speaker').length,0);
 assert(d.querySelector('#source-dialog'));
 assert([...d.querySelectorAll('.sources a')].every(a=>a.target==='_blank' && a.rel.includes('noopener')));
 assert.equal(d.querySelectorAll('.sources details').length,10);
 assert.equal(d.querySelector('#scene-1').dataset.count,'7');
 assert(d.querySelector('#scene-1 .split-stage').textContent.includes('With WIC'));
 for(const crowd of d.querySelectorAll('.crowd-camera')){assert.equal(crowd.querySelectorAll('[data-people]').length,50);assert.equal(crowd.querySelectorAll('.receives').length*2,56);}
 assert(d.querySelector('#scene-1 .frame[data-beat="2"] .crowd-view'));
 assert(d.querySelector('#scene-1 .frame[data-beat="4"] .national-map'));
 assert(d.querySelector('#scene-1 .frame[data-beat="6"] .caption').textContent.includes('two versions'));
 assert.equal(d.querySelectorAll('.opening-exchange').length,1);
 assert.equal(d.querySelectorAll('.opening-message').length,0);
 assert.equal(d.querySelectorAll('.crowd-maya').length,2);
 assert([...d.querySelectorAll('.caption .source-link')].every(a=>a.closest('.citation-tail')));
 assert.deepEqual([...d.querySelectorAll('.scene')].slice(0,3).map(s=>s.id),['scene-1','scene-3','scene-5']);
 assert([...d.querySelectorAll('.source-link')].every(x=>/^\d+$/.test(x.textContent)));
 assert(!d.body.textContent.includes('States with more families far from a WIC store'));
 const route=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../research/wic-rebuild/focus-revision/driving-route.json'))).routes[0];
 assert.equal((route.distance/1609.344).toFixed(1),'21.5');
 assert.equal(d.querySelectorAll('.conveyor .belt-item').length,11);
 assert(![...d.querySelectorAll('.caption')].some(x=>/illustrative|not a reported|no mileage|cannot infer|not the share of dollars/.test(x.textContent)));
 const code=fs.readFileSync(path.join(root,'story.js'),'utf8');assert(!/setInterval|setTimeout|fetch\(|localStorage|sessionStorage/.test(code));assert(!code.includes('scrollHeight'));assert(!code.includes('--caption-height'));

 // Actual renderer: native narration geometry, reverse jumps, reduced motion,
 // receipt visibility, and scene ownership. No scroll-history assumptions.
 for(const reduced of [false,true]){
  const runtime=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{runScripts:'outside-only',pretendToBeVisual:true});
  const w=runtime.window;let pending=[];
  w.matchMedia=()=>({matches:reduced,addEventListener(){}});
  w.requestAnimationFrame=fn=>{pending.push(fn);};
  Object.defineProperty(w,'innerHeight',{value:900});
  w.Element.prototype.getBoundingClientRect=function(){
   if(this.classList.contains('split-family'))return {top:50,width:500,height:540,bottom:590};
   const scene=this.closest('.scene'),top=Number(scene?.dataset.top??10000);
   if(this.classList.contains('story-step')){const t=top+585+Number(this.dataset.beat)*765;return {top:t,height:765,bottom:t+765};}
   const height=scene?Number(scene.dataset.count)*765+720:900;return {top,height,bottom:top+height};
  };
  w.SVGElement.prototype.getTotalLength=()=>100;
  w.SVGElement.prototype.getPointAtLength=n=>({x:n,y:n});
  Object.assign(w,{checkoutAt,clamp:(n,l=0,h=1)=>Math.min(h,Math.max(l,n)),produceTotal});
  w.eval(code.replace(/^import .*?;\n/,''));
  assert(w.document.documentElement.classList.contains('enhanced'));
  assert.equal(w.document.querySelectorAll('.story-step').length,55);
  assert.equal(w.document.querySelectorAll('.frame .caption').length,0,'Narration is outside the pinned art');
  const flush=()=>{w.dispatchEvent(new w.Event('scroll'));pending.splice(0).forEach(fn=>fn());};
  for(const scene of w.document.querySelectorAll('.scene')){
   const count=Number(scene.dataset.count);
   for(const position of [0,.45,1.02,count-1+.6,1.6,.02]){
    scene.dataset.top=-position*765;flush();
    assert.equal(Number(scene.dataset.activeBeat),Math.floor(position));
    assert.equal(scene.querySelectorAll('.frame.is-active').length,1);
    assert.equal(scene.querySelector('.sticky').style.transform,'','Native sticky owns positioning');
   }
   scene.dataset.top=10000;
  }
  const checkout=w.document.querySelector('#scene-7');
  for(const clock of [0,.5,.54,1.5,1.54,2.6,0]){
   checkout.dataset.top=-(clock/3)*765;flush();
   const state=checkoutAt(reduced?2.85:clock,basket);
   assert.equal(checkout.querySelectorAll('.receipt-row:not([hidden])').length,state.count);
   assert.equal(checkout.querySelector('[data-total]').textContent,'$'+(state.total/100).toFixed(2));
  }
  checkout.dataset.top=10000;
  const first=w.document.querySelector('#scene-1'),second=w.document.querySelector('#scene-3');
  // The focal mother has identical screen coordinates before and after every zoom sample.
  let anchor;
  for(const position of [1.5,1.99,2.001,2.5,3.2,3.79,2.001,1.99]){
   first.dataset.top=-position*765;flush();
   const camera=first.querySelector('.crowd-camera'),origin=camera.querySelector('.crowd-origin');
   const c=camera.getAttribute('transform').match(/[-\d.]+/g).map(Number),o=origin.getAttribute('transform').match(/[-\d.]+/g).map(Number);
   const point=[c[0]+o[0]*c[2],c[1]+o[1]*c[2]];
   assert(point.every(Number.isFinite));
   if(anchor)point.forEach((v,i)=>assert(Math.abs(v-anchor[i])<.001,'Focal mother must remain anchored'));
   anchor=point;
  }
  first.dataset.top=-5700;second.dataset.top=215;flush();
  assert.equal(w.document.querySelectorAll('.is-present').length,2);
  assert.equal(w.document.querySelectorAll('.is-speaking').length,1);
  runtime.window.close();
 }
 // Item center crosses the 50% scanner at phase 75/140.
 for(let item=0;item<basket.length;item++){
  assert.equal(checkoutAt(item+75/140-.0001,basket).count,item);
  assert.equal(checkoutAt(item+75/140+.0001,basket).count,item+1);
 }
 dom.window.close();console.log('PASS: 55 native narrative steps; all scene jumps/reversals; reduced motion; scanner threshold and hidden receipt rows; arithmetic; sources; CSS syntax.');
})().catch(e=>{console.error(e);process.exitCode=1});
