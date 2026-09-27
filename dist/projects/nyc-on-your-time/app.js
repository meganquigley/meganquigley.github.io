/* All filters run locally. No analytics, accounts, or personal-data collection. */
(function(){
  'use strict';
  const D=window.SCHEDULE_DATA,E=window.ScheduleEngine,$=id=>document.getElementById(id);
  const names=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const fullNames=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const labels={conflict:'No regular window',possible:'Possible window',special:'Special-date hours',unknown:'Hours unverified',closed:'Listed closed'};
  let settings={days:[0,1,2,3,4],start:'09:00',end:'17:00',duration:30,travel:30,breakEnabled:false,breakStart:'12:00',breakEnd:'13:00'};
  let fit='all',limit=24,selected=D.records.find(r=>r.name==='Union Square')?.id||D.records[0].id,current=[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clock=n=>{n=((n%1440)+1440)%1440;const h=Math.floor(n/60),m=n%60;return `${h%12||12}${m?':'+String(m).padStart(2,'0'):''} ${h<12?'a.m.':'p.m.'}`;};
  const hms=n=>n>=60?`${Math.floor(n/60)}h${n%60?' '+n%60+'m':''}`:`${n}m`;
  const safeLink=u=>/^https:\/\//.test(u||'')?esc(u):'#';
  function firstWindow(a){if(!a.windows.length)return '';const [s,e]=a.windows[0];return `${names[Math.floor(s/1440)]} ${clock(s)}–${clock(e)}`;}
  function syncInputs(){
    for(const [id,key] of [['workStart','start'],['workEnd','end'],['duration','duration'],['travel','travel'],['breakStart','breakStart'],['breakEnd','breakEnd']])$(id).value=settings[key];
    $('breakEnabled').checked=settings.breakEnabled;
    $('days').innerHTML=names.map((d,i)=>`<button type="button" aria-label="Work on ${fullNames[i]}" aria-pressed="${settings.days.includes(i)}" class="${settings.days.includes(i)?'selected':''}" data-day="${i}">${d[0]}${i===3?'h':i===5?'a':i===6?'u':''}</button>`).join('');
  }
  function baseRows(){
    const q=$('search').value.trim().toLowerCase(),cat=$('category').value,borough=$('borough').value;
    return D.records.filter(r=>(cat==='all'||r.category===cat)&&(borough==='all'||r.borough===borough)&&(!$('requiredOnly').checked||r.visitRequired===true)&&(!q||`${r.name} ${r.service} ${r.agency} ${r.address} ${r.borough}`.toLowerCase().includes(q))).map(r=>({r,a:E.analyze(r,settings)}));
  }
  function render(){
    const base=baseRows(),counts={conflict:0,possible:0,special:0,unknown:0,closed:0};
    base.forEach(x=>counts[x.a.kind]++);
    const known=counts.conflict+counts.possible+counts.special;
    $('conflictCount').textContent=counts.conflict;
    $('findingTitle').innerHTML=counts.conflict===1?'schedule has no regular<br>window outside work.':'schedules have no regular<br>window outside work.';
    $('findingDescription').textContent=`Out of ${known} modeled schedules in your current selection.`;
    $('metrics').innerHTML=`<span class="metric"><strong>${counts.possible}</strong> schedules with a window</span><span class="metric special"><strong>${counts.special}</strong> special-date options</span><span class="metric unknown"><strong>${counts.unknown}</strong> unverified · <strong>${counts.closed}</strong> listed closed</span>`;
    $('denominator').textContent=`${settings.duration}-minute visit · ${settings.travel}-minute travel buffer around work for in-person visits. Counts are service-location/channel records, not unique buildings or all NYC services. Remote alternatives may still be available. Unverified and closed listings are excluded from the modeled denominator.`;
    current=base.filter(x=>fit==='all'||(fit==='other'?['special','unknown','closed'].includes(x.a.kind):x.a.kind===fit));
    const order={conflict:0,special:1,possible:2,unknown:3,closed:4};
    current.sort((x,y)=>order[x.a.kind]-order[y.a.kind]||x.r.service.localeCompare(y.r.service)||x.r.name.localeCompare(y.r.name));
    $('resultCount').textContent=`${current.length} matching records · ${base.length} in this selection · Showing ${Math.min(limit,current.length)}`;
    $('cards').innerHTML=current.length?current.slice(0,limit).map(({r,a})=>{
      const alt=r.visitRequired===false?'Remote route offered · details below':r.visitRequired===true?'In-person step required':'Visit requirement depends on the task';
      return `<article class="service-card ${r.id===selected?'selected':''}" data-record="${esc(r.id)}"><div><p class="card-category">${esc(r.category)} / ${esc(r.borough)}${r.channel!=='in_person'?' / '+esc(r.channel):''}</p><h3>${esc(r.service)}</h3><p class="place">${esc(r.name)}</p><p class="hours">${esc(r.hoursText)}</p>${r.exceptionsText?`<p class="extra">◷ ${esc(r.exceptionsText)}</p>`:''}<p class="alt">${alt}</p></div><div class="card-actions"><span class="badge ${a.kind}">${labels[a.kind]}</span>${a.kind==='possible'?`<span class="window-text">${esc(firstWindow(a))}</span>`:''}<button data-action="calendar" data-id="${esc(r.id)}" aria-label="Show ${esc(r.name)} on the calendar">See the week ↗</button><button data-action="details" data-id="${esc(r.id)}" aria-label="Details and source for ${esc(r.name)}">Details & source</button></div></article>`;
    }).join(''):'<div class="empty"><strong>No matching records.</strong><p>Try another service or borough. An empty result means no match in this dataset, not that no service exists.</p><button class="reset" id="clearFilters">Clear filters</button></div>';
    $('showMore').hidden=current.length<=limit;
    // Keep the closer-look example within the selected search/filter results.
    if(current.length&&!current.some(x=>x.r.id===selected))selected=current[0].r.id;
    renderCalendar();
  }
  function renderCalendar(){
    if(!current.length){
      $('calendarTitle').textContent='No service selected';
      $('calendarSubtitle').textContent='Change the filters to inspect a matching service.';
      $('calendar').innerHTML='';$('calendarNote').textContent='';$('calendarDetails').hidden=true;return;
    }
    $('calendarDetails').hidden=false;
    const r=D.records.find(x=>x.id===selected);if(!r)return;
    const a=E.analyze(r,settings);
    $('calendarTitle').textContent=r.name;
    $('calendarSubtitle').textContent=`${r.service} · ${r.borough} · ${r.channel==='in_person'?'In person':r.channel}`;
    const busy=E.workIntervals(settings,r.channel==='in_person'?settings.travel:0);
    const min=0,max=1440,span=max-min;
    function segments(intervals,day,cls){
      return intervals.map(([s,e])=>[Math.max(min,s-day*1440),Math.min(max,e-day*1440)]).filter(([s,e])=>e>s).map(([s,e])=>`<span class="time-block ${cls}" style="left:${(s-min)/span*100}%;width:${(e-s)/span*100}%" title="${esc(clock(s)+'–'+clock(e))}"></span>`).join('');
    }
    $('calendar').innerHTML=`<div class="time-axis"><span></span><div class="time-labels">${[0,360,720,1080,1440].map(t=>`<span style="left:${t/1440*100}%">${t===0||t===1440?'12a':t===720?'12p':t===360?'6a':'6p'}</span>`).join('')}</div>`+names.map((n,d)=>`<div class="cal-row"><span>${n}</span><div class="track" role="img" aria-label="${esc(fullNames[d]+': '+dayDescription(r,d))}">${segments(busy,d,'work')}${segments(a.open,d,'open')}${segments(a.free,d,'available')}<span class="time-grid"></span></div></div>`).join('');
    $('calendarNote').textContent=(a.kind==='unknown'?'The source does not establish this channel’s hours. Blank space does not mean closed. ':a.kind==='closed'?'This location is listed as closed; it is excluded from schedule comparisons. ':`${labels[a.kind]}. Green marks time outside work; a usable modeled window must last at least ${settings.duration} minutes. `)+(r.exceptionsText? r.exceptionsText+' ':'')+'Regular week only; holidays, live slots and queue times are not modeled.';
  }
  function dayDescription(r,d){
    if(r.status==='closed')return 'Listed closed';if(!r.schedule)return 'Hours unverified';
    const xs=r.schedule.filter(x=>x.days.includes(d));return xs.length?xs.map(x=>`${clock(E.minutes(x.start))} to ${clock(E.minutes(x.end))}`).join('; '):'No regular hours listed';
  }
  function showDetails(id){
    const r=D.records.find(x=>x.id===id),a=E.analyze(r,settings);
    const sourceLinks=[r.sourceUrl,...(r.additionalSources||[])].map((u,i)=>`<a target="_blank" rel="noopener" href="${safeLink(u)}">${i?'Related official guidance':'Official schedule source'} ↗</a>`).join('<br>');
    $('detailContent').innerHTML=`<span class="detail-tag">${esc(r.agency)} · ${esc(r.channel)}</span><h2 id="detailTitle">${esc(r.name)}</h2><p class="sub">${esc(r.service)}<br>${esc(r.address)} · ${esc(r.borough)}</p><span class="badge ${a.kind}">${labels[a.kind]}</span>${a.windows.length?`<p>First modeled window: <strong>${esc(firstWindow(a))}</strong>. Availability must still be confirmed.</p>`:''}<h3>Published regular hours</h3><table><tbody>${names.map((d,i)=>`<tr><td>${d}</td><td>${esc(dayDescription(r,i))}</td></tr>`).join('')}</tbody></table>${r.exceptionsText?`<h3>Schedule exceptions</h3><p>${esc(r.exceptionsText)}</p>`:''}<h3>Before you go</h3><p>${esc(r.appointment)}</p><p>${esc(r.notes)}</p><h3>Can you avoid the trip?</h3><p>${esc(r.remoteAlternative)}</p><p class="sub">${r.visitRequired===true?'An in-person step is documented for the named transaction.':r.visitRequired===false?'A remote route is documented. It may not resolve every case.':'Whether a visit is required has not been established for every case.'}</p><div class="source-box">${sourceLinks}<p>Checked ${esc(r.checkedDate)}. ${esc(r.collectionMethod||D.collection)}</p><p>Recorded schedule: ${esc(r.sourceExcerpt||r.hoursText)}</p></div>`;
    $('detailDialog').showModal();
  }
  function showMethod(){
    const sources=[...new Set(D.records.map(r=>r.sourceUrl))];
    $('methodContent').innerHTML=`<span class="eyebrow">COVERAGE & METHOD</span><h2 id="methodTitle">Make the claim<br>no bigger than the data.</h2><p>This research edition contains <strong>${D.records.length} service-location/channel records</strong> across <strong>${new Set(D.records.map(r=>r.service)).size} service types</strong>. It is a broad first collection, <strong>not all NYC public services</strong> and not a representative sample.</p><h3>What was collected</h3><p>Official NYC and agency pages were extracted with a web reader, and state DMV records were downloaded from official APIs, then normalized into recurring schedules. Source text snapshots and a rebuild script are included in the project. Complete lists were used where feasible: IDNYC, main HRA Benefits Access Centers, SNAP, Medicaid, Family Welcome Centers, City Clerk borough offices, sexual-health clinics, TB centers, Finance business centers, OCSS, Family Justice Centers, DOB borough offices, OATH hearing locations listed SBS centers, and NYC DMV district offices. Homebase and Workforce1 locations are included with unverified schedules. Some specialized counters are separate records.</p><p>Each row is one service at one location or remote channel. Shared buildings are counted more than once when their services or counter hours differ. The headline applies only to the current selection, never to the whole city.</p><h3>How the comparison works</h3><ol><li>Your selected workdays and hours become unavailable intervals. Overnight shifts continue into the next day.</li><li>For in-person services, your travel buffer extends each work interval at both ends. This is an assumption, not a route calculation.</li><li>We subtract those intervals from the published service windows, respecting lunch closures.</li><li>A “possible window” is an uninterrupted remaining interval at least as long as your selected visit duration. It is not a confirmed appointment.</li></ol><p>“No regular window” describes a schedule clash with this location/channel. It does not mean the service is impossible to obtain. Remote alternatives are shown. Special-date extra hours are flagged separately; unverified hours and closed listings are excluded from the modeled denominator.</p><h3>What is not measured</h3><p>Appointment inventory, last admission unless explicitly documented, queue length, actual visit length, eligibility, cancellations, holidays, staffing, service quality, disability access, lost wages, or whether someone postponed care. Regular hours can change. Always check the official source before traveling.</p><h3>Coverage still to collect</h3><ul>${D.gaps.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p>Protected time off can cover certain benefits and housing appointments. <a target="_blank" rel="noopener" href="https://www.nyc.gov/site/dca/about/paid-sick-leave-FAQs.page">Read NYC’s current rules ↗</a>. This explorer does not determine your leave entitlement.</p><h3>Download and inspect</h3><p><a href="data/schedules.csv" download>Complete CSV ↓</a> · <a href="data/schedules.json" download>Complete JSON ↓</a> · <a href="README.md">Research & maintenance notes ↗</a></p><h3>${sources.length} official source URLs</h3><ul class="source-list">${sources.map(u=>`<li><a target="_blank" rel="noopener" href="${safeLink(u)}">${esc(u.replace(/^https:\/\//,''))} ↗</a></li>`).join('')}</ul><p class="sub">Snapshot checked ${esc(D.checkedDate)}. Your selections stay in this browser; no analytics or accounts.</p>`;
    $('methodDialog').showModal();
  }
  function download(){
    const fields=['name','service','agency','borough','address','channel','published_hours','modeled_fit','first_window','remote_alternative','exceptions','source','checked_date','workdays','work_start','work_end','visit_minutes','travel_minutes','break'];
    const csv=[fields,...current.map(({r,a})=>[r.name,r.service,r.agency,r.borough,r.address,r.channel,r.hoursText,labels[a.kind],firstWindow(a),r.remoteAlternative,r.exceptionsText,r.sourceUrl,r.checkedDate,settings.days.map(d=>names[d]).join(';'),settings.start,settings.end,settings.duration,settings.travel,settings.breakEnabled?`${settings.breakStart}-${settings.breakEnd}`:'none'])].map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='nyc-service-schedule-comparison.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  $('coverageCount').textContent=`${D.records.length} records · ${new Set(D.records.map(r=>r.service)).size} service types · Coverage in progress`;
  $('checked').textContent='September 24, 2026';
  $('category').insertAdjacentHTML('beforeend',[...new Set(D.records.map(r=>r.category))].sort().map(x=>`<option>${esc(x)}</option>`).join(''));
  $('days').addEventListener('click',e=>{const b=e.target.closest('[data-day]');if(!b)return;const d=+b.dataset.day;settings.days=settings.days.includes(d)?settings.days.filter(x=>x!==d):[...settings.days,d].sort();$('preset').value='custom';syncInputs();render();});
  $('preset').addEventListener('change',()=>{
    const p=$('preset').value;
    if(p==='standard'){settings.days=[0,1,2,3,4];settings.start='09:00';settings.end='17:00';}
    if(p==='early'){settings.days=[0,1,2,3,4];settings.start='08:00';settings.end='18:00';}
    if(p==='shift'){settings.days=[1,2,3,4,5];settings.start='10:00';settings.end='18:00';}
    if(p==='night'){settings.days=[0,1,2,3,4];settings.start='22:00';settings.end='06:00';}
    syncInputs();render();
  });
  for(const [id,key] of [['workStart','start'],['workEnd','end'],['duration','duration'],['travel','travel'],['breakStart','breakStart'],['breakEnd','breakEnd']])$(id).addEventListener('change',()=>{if(!$(id).value)return;settings[key]=['duration','travel'].includes(key)?+$(id).value:$(id).value;if(['start','end'].includes(key))$('preset').value='custom';render();});
  $('breakEnabled').addEventListener('change',()=>{settings.breakEnabled=$('breakEnabled').checked;render();});
  $('reset').addEventListener('click',()=>{settings={days:[0,1,2,3,4],start:'09:00',end:'17:00',duration:30,travel:30,breakEnabled:false,breakStart:'12:00',breakEnd:'13:00'};$('preset').value='standard';syncInputs();render();});
  for(const id of ['category','borough','requiredOnly'])$(id).addEventListener('change',()=>{limit=24;render();});
  $('search').addEventListener('input',()=>{limit=24;render();});
  document.querySelector('.status-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-fit]');if(!b)return;fit=b.dataset.fit;limit=24;document.querySelectorAll('[data-fit]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});render();});
  $('cards').addEventListener('click',e=>{
    if(e.target.id==='clearFilters'){$('search').value='';$('category').value='all';$('borough').value='all';$('requiredOnly').checked=false;fit='all';document.querySelectorAll('[data-fit]').forEach(x=>x.classList.toggle('active',x.dataset.fit==='all'));render();return;}
    const b=e.target.closest('[data-action]');if(!b)return;
    if(b.dataset.action==='details')showDetails(b.dataset.id);
    else{selected=b.dataset.id;render();document.querySelector('.calendar-panel').scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  });
  $('calendarDetails').addEventListener('click',()=>showDetails(selected));
  $('showMore').addEventListener('click',()=>{limit+=24;render();});
  $('download').addEventListener('click',download);
  for(const id of ['about','coverageButton','footerMethod'])$(id).addEventListener('click',showMethod);
  document.querySelectorAll('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  document.querySelectorAll('[data-fit]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.fit===fit)));
  syncInputs();render();
})();
