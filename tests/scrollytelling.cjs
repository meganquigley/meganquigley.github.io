// DOM/logic regression checks. No layout engine: rendered QA is still required.
// NODE_PATH=<test dependencies>/node_modules node tests/scrollytelling.cjs
const fs=require('fs'), path=require('path'), assert=require('node:assert/strict');
const {JSDOM}=require('jsdom'),css=require('css-tree');
const root=path.resolve(__dirname,'../dist');
function setup(route,{width=1440,height=1000,reduced=false}={}){
 const dom=new JSDOM(fs.readFileSync(path.join(root,route),'utf8'),{url:'https://example.org/'+route,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;let frames=[];let media=[];
 Object.defineProperties(w,{innerWidth:{value:width,writable:true},innerHeight:{value:height,writable:true},scrollY:{value:0,writable:true}});
 w.matchMedia=()=>{const m={matches:reduced,addEventListener:(name,fn)=>m.listener=fn};media.push(m);return m};
 w.requestAnimationFrame=fn=>{frames.push(fn);return frames.length};
 w.IntersectionObserver=class{constructor(fn){this.fn=fn}observe(el){this.fn([{target:el,isIntersecting:true}])}unobserve(){}};
 w.ResizeObserver=class{observe(){}};
 w.HTMLElement.prototype.scrollTo=function(){};
 w.Element.prototype.getBoundingClientRect=function(){const top=+(this.dataset.testTop||0);return {top,bottom:top+300,left:0,right:600,width:600,height:300}};
 Object.defineProperty(w.HTMLElement.prototype,'offsetHeight',{get(){return this.classList.contains('collection-intro')?1900:this.classList.contains('geography-story')?1500:this.classList.contains('geography-pin')?700:300}});
 for(const script of w.document.querySelectorAll('script[src]'))w.eval(fs.readFileSync(path.join(root,script.getAttribute('src').split('?')[0]),'utf8'));
 return {w,d:w.document,media,flush(){const f=frames;frames=[];f.forEach(fn=>fn(100));},scroll(y){w.scrollY=y;w.dispatchEvent(new w.Event('scroll'));this.flush();},reduce(){media.forEach(m=>{m.matches=true;m.listener?.({matches:true})});this.flush();}};
}
(async()=>{
// CSS syntax and all script entry points.
for(const name of ['collection.css','wic-investigation.css','access-stories.css','story-refinements.css']){const errors=[];css.parse(fs.readFileSync(path.join(root,name),'utf8'),{onParseError:e=>errors.push(e.message)});assert.deepEqual(errors,[],name);}
let h=setup('index.html');const cue=h.d.querySelector('.journey-cue');const stories=h.d.querySelector('#case-studies');stories.dataset.testTop=1500;
h.scroll(0);assert.equal(cue.style.getPropertyValue('--explore-opacity'),'1');h.scroll(260);assert.equal(cue.style.getPropertyValue('--explore-opacity'),'0');assert.equal(cue.style.getPropertyValue('--stories-opacity'),'0');h.scroll(600);assert.equal(cue.style.getPropertyValue('--stories-opacity'),'1');stories.dataset.testTop=600;h.scroll(900);assert(+cue.style.getPropertyValue('--cue-opacity')<.2);stories.dataset.testTop=1500;h.scroll(0);assert.equal(cue.style.getPropertyValue('--explore-opacity'),'1');assert.equal(h.d.querySelectorAll('.journey-cue').length,1);h.w.close();
let w=setup('case-studies/wic/index.html');w.flush();assert.equal(w.d.querySelectorAll('.geo-state').length,52);assert.equal(w.d.querySelectorAll('.geography-table tbody tr').length,52);assert.equal(w.d.querySelectorAll('.person').length,100);assert.equal(w.d.querySelectorAll('.person:not(.outside)').length,56);
const geo=w.d.querySelector('.geography-story');geo.dataset.testTop=-735;w.scroll(1000);assert.equal(w.d.querySelector('.geo-chart-labels').style.opacity,'1');assert(w.d.querySelector('[data-state=CA]').getAttribute('transform').includes('scale(0.050000000000000044)'));
geo.dataset.testTop=1000;w.scroll(0);assert.equal(w.d.querySelector('.geo-chart-labels').style.opacity,'0');
const la=w.d.querySelector('[data-state=LA]');la.dispatchEvent(new w.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));assert(w.d.querySelector('#state-result').textContent.includes('Louisiana: 41.3%'));assert.equal(la.getAttribute('aria-pressed'),'true');
w.d.querySelector('#reading-mode').click();await Promise.resolve();w.flush();assert(w.d.body.classList.contains('reading'));assert(w.d.querySelector('.geography-table').open);assert.equal(w.d.querySelector('.person').style.getPropertyValue('--person-fill'),'1');
assert(!w.d.querySelector('.sequence-steps [aria-hidden=true]'));assert.equal(w.d.querySelector('.start').textContent.trim(),'↓');assert(w.d.querySelector('.start').hasAttribute('aria-label'));
const basket=w.d.querySelector('#basket-size');basket.value='large';basket.dispatchEvent(new w.w.Event('change'));assert.equal(w.d.querySelector('#trip-saving').textContent,'$39.48');w.w.close();
for(const route of ['housing','health']){
 for(const options of [{},{width:375,height:667},{width:740,height:400},{reduced:true}]){
  const t=setup(`case-studies/${route}/index.html`,options);t.flush();assert(t.d.querySelector('h1').textContent.startsWith('What does it take'));assert(t.d.querySelector('.chapter-nav [aria-current]'));
  if(route==='housing'){assert.equal(t.d.querySelectorAll('.lease-mark').length,100);assert.equal(t.d.querySelectorAll('.lease-mark.success').length,57);}
  if(route==='health'){assert.equal(t.d.querySelectorAll('.audit-mark').length,320);assert.equal(t.d.querySelectorAll('.group-0').length,57);assert.equal(t.d.querySelectorAll('.group-1').length,30);assert.equal(t.d.querySelectorAll('.group-2').length,233);assert(t.d.querySelector('.nyc-finding').textContent.includes('36.3%'));}
  t.d.querySelector('[data-reading-toggle]').click();await Promise.resolve();t.flush();assert(t.d.body.classList.contains('reading'));t.w.close();
 }
}
for(const options of [{width:375,height:667},{width:740,height:400},{reduced:true}]){const t=setup('case-studies/wic/index.html',options);t.flush();assert(t.d.querySelector('.geography-table').open);assert(!t.d.body.classList.contains('enhanced-motion'));t.w.close();}
console.log('PASS: CSS syntax; reversible cue and map; 52 jurisdictions; keyboard selection; reading/reduced-motion modes; exact mark counts; NYC focus; receipt controls. DOM simulation only.');

})().catch(e=>{console.error(e);process.exitCode=1});
