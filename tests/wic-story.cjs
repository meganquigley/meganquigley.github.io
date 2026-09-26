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
 assert.deepEqual(checkoutAt(12,basket),{count:11,total:6408,covered:2397,own:4011});
 assert.deepEqual(checkoutAt(0,basket),{count:0,total:0,covered:0,own:0});
 assert.equal(checkoutAt(2,basket).total,367);
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
 assert.equal(d.querySelectorAll('.scene').length,12);assert.equal(d.querySelectorAll('.frame').length,57);
 assert.equal(d.querySelectorAll('nav,[data-reading-toggle],#reading-mode').length,0);
 assert.equal(d.querySelectorAll('.opening a,.introduction a').length,0);
 for(const meta of ['robots','googlebot'])assert.equal(d.querySelector(`meta[name=${meta}]`).content,'noindex, nofollow, noarchive');
 assert.deepEqual([...d.querySelectorAll('script[src]')].map(x=>x.getAttribute('src')),['story.js?v=20260925-focus5']);
 assert.deepEqual([...d.querySelectorAll('link[rel=stylesheet]')].map(x=>x.getAttribute('href')),['story.css?v=20260925-focus5']);
 for(const frame of d.querySelectorAll('.frame')){
  assert.equal(frame.querySelectorAll('.caption').length,1);assert(frame.querySelector('.line').textContent.length);
  assert(frame.querySelector('.pair')||frame.querySelector('.anchors')||frame.closest('.immersive')||frame.querySelector('.ending-art'));
  if(frame.querySelector('.pair'))assert.deepEqual([...frame.querySelectorAll('.path-label')].map(x=>x.textContent),['Without WIC','With WIC']);
 }
 for(const a of d.querySelectorAll('a[href^="#"]'))assert(d.getElementById(a.getAttribute('href').slice(1)));
 for(const el of d.querySelectorAll('[id]'))assert.equal(d.querySelectorAll(`[id="${el.id}"]`).length,1);
 const errors=[];css.parse(fs.readFileSync(path.join(root,'story.css'),'utf8'),{onParseError:e=>errors.push(e.message)});assert.deepEqual(errors,[]);
 assert.equal(d.querySelectorAll('img').length,0);
 assert.equal(d.querySelectorAll('.national-map .state-dot').length,150);
 assert.equal(d.querySelectorAll('.scatter,.speaker').length,0);
 assert(d.querySelector('#source-dialog'));
 assert([...d.querySelectorAll('.source-link')].every(x=>x.textContent==='See details'));
 assert(!d.body.textContent.includes('States with more families far from a WIC store'));
 const route=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../research/wic-rebuild/focus-revision/driving-route.json'))).routes[0];
 assert.equal((route.distance/1609.344).toFixed(1),'21.5');
 assert.equal(d.querySelectorAll('.conveyor .belt-item').length,11);
 assert(![...d.querySelectorAll('.caption')].some(x=>/illustrative|not a reported|no mileage|cannot infer|not the share of dollars/.test(x.textContent)));
 const code=fs.readFileSync(path.join(root,'story.js'),'utf8');assert(!/setInterval|setTimeout|fetch\(|localStorage|sessionStorage/.test(code));assert(!code.includes('scrollHeight'));assert(!code.includes('--caption-height'));

 // Exercise the actual DOM renderer with controlled geometry, including reduced motion.
 for(const reduced of [false,true]){
  const runtime=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{runScripts:'outside-only',pretendToBeVisual:true});
  const w=runtime.window;let pending=[];
  w.matchMedia=q=>({matches:q.includes('reduced-motion')?reduced:false,addEventListener(){}});
  w.requestAnimationFrame=fn=>{pending.push(fn);};
  Object.defineProperty(w,'innerHeight',{value:900});
  w.IntersectionObserver=class{constructor(fn){this.fn=fn}observe(target){this.fn([{target,isIntersecting:true}]);}};
  w.Element.prototype.getBoundingClientRect=function(){return {top:Number(this.dataset.top||0),height:this.classList.contains('scene')?900+(Number(this.dataset.count)-1)*648:1890};};
  w.SVGElement.prototype.getTotalLength=()=>100;
  w.SVGElement.prototype.getPointAtLength=n=>({x:n,y:n});
  w.checkoutAt=checkoutAt;w.beatAt=beatAt;w.openingAt=openingAt;w.clamp=(n,l=0,h=1)=>Math.min(h,Math.max(l,n));w.produceTotal=produceTotal;
  w.eval(code.replace(/^import .*?;\n/,''));
  assert(w.document.documentElement.classList.contains('enhanced'));
  const target=w.document.querySelector('#scene-11');
  for(const top of [-2000,-500,0,-3000]){
   target.dataset.top=top;w.dispatchEvent(new w.Event('scroll'));pending.splice(0).forEach(fn=>fn());
   const expected=beatAt(top,4140,900,6);
   assert.equal(target.querySelector('.is-active').dataset.beat,String(expected));
   assert.equal(target.querySelectorAll('.frame:not([aria-hidden])').length,1);
   const active=target.querySelector('.is-active');
   if(reduced)assert.equal(active.querySelector('.money span:last-child strong').textContent,'$'+produceTotal(Number(active.querySelector('[data-months]').dataset.months)).toLocaleString('en-US'));
  }
  const checkout=w.document.querySelector('#scene-7');
  for(const top of [-3888,0,-1600,-3888,-400]){
   checkout.dataset.top=top;w.dispatchEvent(new w.Event('scroll'));pending.splice(0).forEach(fn=>fn());
   const progress=Math.min(1,Math.max(0,-top/3888)),beat=beatAt(top,4788,900,7),time=(reduced?beat+.95:progress*7)/5*basket.length;
   const state=checkoutAt(time,basket);
   assert.equal(checkout.querySelector('[data-total]').textContent,'$'+(state.total/100).toFixed(2));
   assert.equal(checkout.querySelector('[data-covered]').textContent,'$'+((beat===6?0:state.covered)/100).toFixed(2));
   assert.equal(checkout.querySelectorAll('.receipt-row.scanned').length,state.count);
  }
  runtime.window.close();
 }
 dom.window.close();console.log('PASS: absolute scroll state, reverse/fast jumps, monthly arithmetic, 50-state correlation, redemption denominator, 57 complete scenes/frames, semantic captions, sources, noindex, asset isolation, CSS syntax.');
})().catch(e=>{console.error(e);process.exitCode=1});
