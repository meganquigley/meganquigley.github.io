(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], D=window.WIC_DATA;
if(!D)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'), body=document.body;
body.classList.add('enhanced');
let reading=reduced.matches||new URLSearchParams(location.search).get('motion')==='off', counts=false, revealed=false, stateTouched=false, lastPhase={};
const fmt=n=>Math.round(n).toLocaleString('en-US');
const foodRules=[
 'Milk: approved low-fat (1%) or nonfat milk for this four-year-old, in a permitted container size. It must be on the issued food balance.',
 'Eggs: large white eggs in approved packages. California permits qualifying cage-free white eggs; brown and specialty eggs do not qualify under these rules.',
 'Bread: this example uses an approved 20 oz Nature’s Own 100% whole-wheat loaf. California’s April 2026 rules allow qualifying 100% whole-wheat bread in 12–48 oz packages. Enough whole-grain benefit must remain.',
 'Peanut butter: an approved product and container size, with peanut butter included in the child’s issued package. Added jams, chocolate, or specialty spreads do not automatically qualify.',
 'Apples: eligible fresh fruit can use the fruit-and-vegetable dollar balance. If produce costs more than the balance, the household can pay the difference.',
 'Frozen peas: qualifying frozen vegetables can use the fruit-and-vegetable balance. Added sauces and other ingredients can change eligibility; check the approved product.',
 'Dish soap: a household expense, outside the WIC food package. It stays on the list and in the basket, but it is not highlighted as covered.'
];
$$('[data-cover]').forEach(b=>b.addEventListener('click',()=>{ $$('[data-cover]').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#food-explanation').textContent=foodRules[+b.dataset.cover]; }));
function drawGuess(){const g=+$('#guess').value;$('#guess-value').value=g;$$('.person').forEach((p,i)=>{p.classList.toggle('guessed',!revealed&&i<g);p.classList.toggle('filled',revealed&&i<56);});}
function reveal(skip=false){revealed=true;$('#scene-4').classList.add('revealed');const g=+$('#guess').value;$('#guess-feedback').textContent=skip?'Exact estimate: 56.1%. The grid rounds to 56 marks.':`Your guess: ${g}%. The estimate: 56.1%.`;drawGuess();}
$('#guess').addEventListener('input',drawGuess);$('#reveal').addEventListener('click',()=>reveal());$('#skip-guess').addEventListener('click',()=>reveal(true));$('#guess-again').addEventListener('click',()=>{revealed=false;$('#scene-4').classList.remove('revealed');drawGuess();$('#guess').focus();});drawGuess();
function renderAges(){ $('#age-bars').classList.toggle('counts',counts);
 $('#age-bars').innerHTML=D.ages.map((a,i)=>{const gap=a.eligible-a.participants, height=counts?a.eligible/2000000*100:100;
 return `<div class="age-col" data-age="${i}"><div class="column" style="height:${height}%;--rate:${a.participants/a.eligible*100}%"><i></i><b class="age-value">${counts?(a.participants/1e6).toFixed(2)+'m':a.rate.toFixed(1)+'%'}</b>${counts?`<span class="age-count">${(gap/1e6).toFixed(2)}m</span>`:''}</div><span class="age-label">${a.age}</span></div>`;
 }).join('');
 $('#age-bars').setAttribute('role','img');$('#age-bars').setAttribute('aria-label',D.ages.map(a=>`${a.age}: ${a.rate}% participating, ${fmt(a.participants)} of ${fmt(a.eligible)} eligible`).join('; '));
 $('#age-toggle').textContent=counts?'Show percentages':'Show numbers of children';$('#age-toggle').setAttribute('aria-pressed',counts);
 $('#age-units').textContent=counts?'Common scale: 0–2 million · labels in millions · gaps = eligible minus participating':'Share of eligible people in each age group · 0–100%';
 agePhase(lastPhase[5]??0);
}
function agePhase(phase){$$('.age-col').forEach((el,i)=>el.style.opacity=reading||i<=[0,2,4,4][phase]?1:.15);}
$('#age-toggle').addEventListener('click',()=>{counts=!counts;renderAges()});renderAges();
const mapRows=[['','','','','','','','','','','','ME'],['AK','','','','','','WI','','','VT','NH',''],['','WA','ID','MT','ND','MN','IL','MI','','NY','MA',''],['','OR','NV','WY','SD','IA','IN','OH','PA','NJ','CT','RI'],['','CA','UT','CO','NE','MO','KY','WV','VA','MD','DE',''],['','','AZ','NM','KS','AR','TN','NC','SC','DC','',''],['HI','','','','OK','LA','MS','AL','GA','','',''],['','','','','TX','','','','FL','','','PR']];
const lookup=Object.fromEntries(D.states.map(s=>[s.id,s]));
$('#state-select').innerHTML=D.states.map(s=>`<option value="${s.id}" ${s.id==='CA'?'selected':''}>${s.name}</option>`).join('');
$('#state-map').innerHTML=mapRows.flatMap((row,y)=>row.map((id,x)=>{if(!id)return '';const s=lookup[id];return `<button class="state-tile" data-state="${id}" aria-label="${s.name}, ${s.rate}% coverage" aria-pressed="${id==='CA'}" style="grid-row:${y+1};grid-column:${x+1};--tile-color:rgb(${Math.round(255-(255-100)*s.rate/100)},${Math.round(249-(249-163)*s.rate/100)},${Math.round(233-(233-198)*s.rate/100)})">${id}</button>`;})).join('');
$('#state-plot').classList.add('state-plot');
$('#state-plot').innerHTML='<p class="small">0–100% · line = 95% interval · red guide = national 56.1%</p>'+[...D.states].sort((a,b)=>b.rate-a.rate).map(s=>`<button class="dot-row" data-state="${s.id}" aria-label="${s.name}: ${s.rate}%, interval ${s.low} to ${s.high}%"><span>${s.id}</span><span class="dot-line" style="--low:${s.low}%;--width:${s.high-s.low}%;--point:${s.rate}%"><i></i><b></b></span><span>${s.rate.toFixed(1)}%</span></button>`).join('');
function selectState(id){const s=lookup[id];$('#state-select').value=id;$('#state-name').textContent=s.name;$('#state-rate').textContent=s.rate.toFixed(1)+'%';$('#state-eligible').textContent=fmt(s.eligible);$('#state-participants').textContent=fmt(s.participants);$('#state-ci').textContent=`${s.low.toFixed(1)}–${s.high.toFixed(1)}%`;$$('[data-state]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.state===id));}
$$('[data-state]').forEach(b=>b.addEventListener('click',()=>{stateTouched=true;selectState(b.dataset.state)}));$('#state-select').addEventListener('change',e=>{stateTouched=true;selectState(e.target.value)});selectState('CA');
$('#map-toggle').addEventListener('click',()=>{const plot=$('#state-plot').hidden;$('#state-plot').hidden=!plot;$('#state-map').hidden=plot;$('#map-toggle').setAttribute('aria-pressed',plot);$('#map-toggle').textContent=plot?'Tile map':'Dot plot'});
$$('[data-egg]').forEach(b=>b.addEventListener('click',()=>{$$('[data-egg]').forEach(x=>x.setAttribute('aria-pressed',b===x));const carton=$('.egg-carton');carton.classList.toggle('brown',b.dataset.egg==='brown');carton.setAttribute('aria-label',b.dataset.egg==='brown'?'Carton of brown eggs':'Carton of large white eggs');$('#egg-feedback').textContent=b.dataset.egg==='white'?'Yes—qualifying large white eggs. California’s restrictions aim to contain costs; approved cage-free white eggs can qualify.':'Brown eggs are outside these California rules. The state cites cost containment. Similar-looking groceries can have different approval rules.'}));
function trend(){const xs=i=>45+i*52, ys=v=>270-v*2.25;const path=key=>D.trends.map((d,i)=>`${i?'L':'M'}${xs(i)},${ys(d[key])}`).join(' ');
 $('#trend-chart').innerHTML=`<svg viewBox="0 0 515 315" role="img" aria-label="WIC coverage 2016 to 2023: infants 85.7 to 82.3 percent; children ages 1–4, 43.5 to 47.9 percent. Full series available in downloaded data.">${[0,25,50,75,100].map(v=>`<line x1="45" y1="${ys(v)}" x2="409" y2="${ys(v)}" stroke="#292824" opacity=".18"/><text x="35" y="${ys(v)+5}" text-anchor="end">${v}</text>`).join('')}<text x="45" y="20">% of eligible people</text><path d="${path('infants')}" fill="none" stroke="#292824" stroke-width="3"/><path d="${path('children')}" fill="none" stroke="#a74130" stroke-width="3"/>${D.trends.map((d,i)=>`<circle cx="${xs(i)}" cy="${ys(d.infants)}" r="4" fill="#fff9e9" stroke="#292824"/><circle cx="${xs(i)}" cy="${ys(d.children)}" r="4" fill="#fff9e9" stroke="#a74130"/><text x="${xs(i)}" y="295" text-anchor="middle">${String(d.year).slice(2)}</text>`).join('')}<text x="422" y="${ys(82.3)-5}">Infants</text><text x="422" y="${ys(82.3)+14}">82.3%</text><text x="422" y="${ys(47.9)-5}">Children</text><text x="422" y="${ys(47.9)+14}">47.9%</text><text x="43" y="${ys(43.5)+23}">43.5%</text><text x="230" y="314" text-anchor="middle">Year (2016–2023)</text></svg>`;
}trend();
function setPhase(scene,phase){const n=+scene.dataset.scene;if(n===6&&stateTouched)phase=2;if(lastPhase[n]===phase)return;lastPhase[n]=phase;scene.classList.remove('phase-0','phase-1','phase-2','phase-3','phase-4');scene.classList.add('phase-'+phase);scene.dataset.phase=phase;scene.querySelectorAll('.beat').forEach((b,i)=>b.classList.toggle('active',i===phase));
 if(n===1){const num=reading?7:[0,1,3,7,7][phase];$$('.shopping-list [data-item]').forEach((l,i)=>l.classList.toggle('bought',i<num));$$('[data-food]').forEach((f,i)=>f.classList.toggle('packed',i<num));}
 if(n===3){scene.querySelector('h2').innerHTML=phase===3&&!reading?'The savings from this basket<br>could add up over time.':'WIC could cover $19.14<br>of this $22.63 grocery bill.';const before=phase===0&&!reading;scene.querySelector('.receipt-1 .wic-subtotal').textContent=before?'$0.00':'$19.14';scene.querySelector('.receipt-1 .receipt-total strong').textContent=before?'$22.63':'$3.49';}
 if(n===5)agePhase(phase);
 if(n===6&&!stateTouched)selectState(phase===0?'CA':'LA');
 if(n===9){$('.discontinuation').style.opacity=reading||phase===2?1:0;$('.discontinuation').style.visibility=reading||phase===2?'visible':'hidden';}
}
function renderMonths(months){const money=c=>(c/100).toLocaleString('en-US',{style:'currency',currency:'USD'});$('#cost-without').textContent=money(2263*months);$('#cost-with').textContent=money(349*months);$('#cost-saved').textContent=money(1914*months);$('#cost-without-bar').style.width=(2263*months/120000*100)+'%';$('#cost-with-bar').style.width=(349*months/120000*100)+'%';$$('[data-months]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.months===months));}
$$('[data-months]').forEach(b=>b.addEventListener('click',()=>renderMonths(+b.dataset.months)));renderMonths(48);
let scheduled=false;function update(){scheduled=false;const vh=innerHeight, max=document.documentElement.scrollHeight-vh;$('.progress span').style.width=`${max?scrollY/max*100:0}%`;
 if(reading)return;$$('.scene').forEach(s=>{const r=s.getBoundingClientRect();const total=r.height-vh;const progress=Math.max(0,Math.min(.999,(-r.top+vh*.1)/Math.max(1,total)));const phase=Math.floor(progress*+s.dataset.steps);setPhase(s,phase)});}
function setReading(on){reading=on;body.classList.toggle('reading',on);$('#reading-mode').setAttribute('aria-pressed',on);$('#reading-mode').textContent=on?'Use scrolling effects':'Read without scrolling effects';lastPhase={};$$('.scene').forEach(s=>setPhase(s,on?+s.dataset.steps-1:0));if(on)reveal(true);update();}
$('#reading-mode').addEventListener('click',()=>setReading(!reading));reduced.addEventListener('change',e=>{if(e.matches)setReading(true)});setReading(reading);
document.fonts.ready.then(()=>{const el=document.getElementById(location.hash.slice(1));if(el)el.scrollIntoView({behavior:'instant',block:'start'});update();});addEventListener('hashchange',()=>{const el=document.getElementById(location.hash.slice(1));if(el)el.scrollIntoView({behavior:'instant',block:'start'});update();});
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);update();
})();
