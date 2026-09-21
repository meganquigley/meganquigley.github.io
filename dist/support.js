const limits={mainland:[29526,40034,50542,61050,71558,82066,92574,103082],alaska:[36908,50043,63178,76313,89448,102583,115718,128853],hawaii:[33966,46047,58127,70208,82288,94369,106449,118530]};
function screenNutrition(a,today=new Date()){
 if(!['yes','no','unsure'].includes(a.family)||!['yes','no','unsure'].includes(a.benefits))throw new Error('Please answer the two required questions.');
 let result={status:'check',title:'The official checker is your next step.',text:'A few more details are needed to check your family’s situation. You can also ask a local agency for help.',limit:null};
 if(a.family==='no')return {...result,status:'other',title:'Start with other food support.',text:'This nutrition program has specific pregnancy, postpartum, breastfeeding, and child-age categories. Based on your answer, food assistance for a wider range of households may be a better starting point. If you are unsure about a category, use the official nutrition-program checker.'};
 if(a.family==='unsure')return result;
 if(a.benefits==='yes')return {...result,status:'pathway',title:'You may have an income-eligibility pathway.',text:'Your family-stage answer fits a basic program category. The benefits you receive may also establish income eligibility. A local agency still needs to confirm all requirements and complete a nutrition assessment.'};
 const current=today>=new Date('2026-07-01T00:00:00Z')&&today<new Date('2027-07-01T00:00:00Z');
 if(!current)return {...result,text:'The income guide on this page needs updating. Use the official checker for current limits; no income comparison was made.'};
 if(!limits[a.region]||a.size===''||a.income==='')return result;
 const size=Number(a.size),income=Number(a.income);
 if(!Number.isInteger(size)||size<1||size>8||!Number.isFinite(income)||income<0)throw new Error('Enter a household size from 1 to 8 and a nonnegative annual income, or leave the optional fields blank.');
 const limit=limits[a.region][size-1];
 if(income<=limit)return {...result,status:'within',limit,title:'Your answers are within the basic guide.',text:'Your family-stage answer fits a program category, and the income you entered is at or below the federal maximum income guide. This is a reason to check—not an approval. Your agency confirms local rules, income counting, residency, and nutrition requirements.'};
 return {...result,status:'above',limit,title:'Above the income guide? Still check the details.',text:'The amount entered is above this federal guide. That is not a denial. Income exclusions, household counting, or eligibility through another benefit may matter. Use the official checker before ruling support out.'};
}
const pathButtons=[...document.querySelectorAll('[data-path]')];
const pathPanels=[...document.querySelectorAll('.support-path')];
function choosePath(name,focus=true){
 if(!['food','tax','other'].includes(name))return;
 pathPanels.forEach(panel=>{panel.hidden=panel.id!=='path-'+name;});
 pathButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.path===name)));
 if(focus){const heading=document.querySelector('#path-'+name+' .path-heading');heading.scrollIntoView({block:'start'});heading.focus({preventScroll:true});}
}
pathPanels.forEach(panel=>panel.hidden=true);
pathButtons.forEach(button=>button.addEventListener('click',()=>choosePath(button.dataset.path)));
if(['#food','#tax','#other'].includes(location.hash))choosePath(location.hash.slice(1),false);
const form=document.querySelector('#benefit-form'),resultBox=document.querySelector('#check-result');
const steps=[...document.querySelectorAll('.quiz-step')];let step=0;
function showStep(n){step=n;steps.forEach((s,i)=>{s.hidden=i!==n;for(const field of s.querySelectorAll('select,input'))field.disabled=i!==n;});document.querySelector('#form-progress').textContent=['Step 1 of 3 · Your family','Step 2 of 3 · Existing support','Step 3 of 3 · Optional income check'][n];document.querySelector('#quiz-back').hidden=n===0;document.querySelector('#quiz-next').hidden=n===2;document.querySelector('#quiz-submit').hidden=n!==2;}
showStep(0);
document.querySelector('#quiz-next').addEventListener('click',()=>{if(!form.reportValidity())return;showStep(Math.min(2,step+1));steps[step].querySelector('select,input').focus();});
document.querySelector('#quiz-back').addEventListener('click',()=>{showStep(Math.max(0,step-1));steps[step].querySelector('select,input').focus();});

form.addEventListener('submit',e=>{e.preventDefault();if(step<2){document.querySelector('#quiz-next').click();return;}if(!form.reportValidity())return;try{const a=Object.fromEntries(['family','benefits','region','size','income'].map(id=>[id,document.getElementById(id).value]));const r=screenNutrition(a);resultBox.replaceChildren();const label=document.createElement('p');label.className='eyebrow';label.textContent='YOUR NEXT STEP';const h=document.createElement('h3');h.textContent=r.title;const p=document.createElement('p');p.textContent=r.text;resultBox.append(label,h,p);if(r.limit!==null){const guide=document.createElement('p');guide.className='small';guide.textContent='Federal maximum annual income guide for this location and household size: $'+r.limit.toLocaleString('en-US')+'. July 2026–June 2027.';resultBox.append(guide);}const link=document.createElement('a');link.className='action inline';link.href=r.status==='other'?'https://www.usa.gov/food-stamps':'https://fns-prod.azureedge.us/wic/eligibility-tool';link.textContent=r.status==='other'?'Explore food assistance ↗':'Continue to the official eligibility tool ↗';resultBox.append(link);const note=document.createElement('p');note.className='small';note.textContent='Your answers are not transferred. The official service will ask its own questions.';resultBox.append(note);resultBox.hidden=false;resultBox.focus();}catch(error){resultBox.hidden=false;resultBox.textContent=error.message;resultBox.focus();}});
form.addEventListener('input',()=>{resultBox.hidden=true;resultBox.replaceChildren();});
function openSource(hash){if(!/^#source-[a-z-]+$/.test(hash))return;const t=document.querySelector(hash);if(t){t.closest('details').open=true;t.setAttribute('tabindex','-1');requestAnimationFrame(()=>{t.scrollIntoView();t.focus({preventScroll:true});});}}
document.querySelectorAll('a[href^="#source-"]').forEach(a=>a.addEventListener('click',()=>openSource(a.getAttribute('href'))));openSource(location.hash);
// Only navigate to the form through the agent interface; do not expose a tool that reads private answers.
const mc=document.modelContext;if(mc?.registerTool){const life=new AbortController();window.addEventListener('pagehide',()=>life.abort(),{once:true});try{Promise.resolve(mc.registerTool({name:'open_benefit_checker',description:'Navigate to the nutrition-benefit screening form without reading or submitting answers.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:()=>{choosePath('food',false);document.querySelector('#check').scrollIntoView();document.querySelector('#family').focus({preventScroll:true});return {opened:true};}},{signal:life.signal})).catch(()=>{});}catch{}}
