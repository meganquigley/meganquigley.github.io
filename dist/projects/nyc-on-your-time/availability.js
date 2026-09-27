(async () => {
  'use strict';
  const $ = id => document.getElementById(id), M = window.AvailabilityModel;
  const publication=window.AVAILABILITY_DATA,P=window.PublicAvailability;
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const records=publication.records.filter(r=>P.disposition(r,today).included);
  const excluded=publication.records.length-records.length;
  const monthlyExcluded=publication.records.filter(r=>!P.disposition(r,today).included&&P.disposition(r,today).exclusionReason==='partial_or_date_specific_schedule').length;
  const closedExcluded=publication.records.filter(r=>P.disposition(r,today).exclusionReason==='service_closed').length;
  const unverifiedExcluded=excluded-monthlyExcluded-closedExcluded;
  $('coverage-note').textContent='We couldn’t verify usable hours or appointment-only access online for '+unverifiedExcluded.toLocaleString()+' additional service locations, so they aren’t shown here. When hours are hard to find, planning a visit becomes another barrier to getting help.'+(monthlyExcluded?' Another '+monthlyExcluded.toLocaleString()+' locations publish partial, monthly, or date-specific schedules that this typical-week view cannot reliably represent. Their published hours are preserved in the download.':'')+(closedExcluded?' '+closedExcluded.toLocaleString()+' confirmed '+(closedExcluded===1?'closure is':'closures are')+' also retained only in the download.':'');
  $('research-progress').textContent=publication.auditStatus==='complete'?'':'Research is in progress. The download includes excluded records and identifies pending checks and source-access limitations.';
  $('research-progress').hidden=publication.auditStatus==='complete';
  $('data-updated').textContent='Last updated: '+(publication.researchCompletionDate||publication.updatedDate||publication.checkedDate)+(publication.auditStatus==='complete'?'':' · Research in progress');
  const accessModes=records.map(window.AccessModel.classify);
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const words = {open:'Hours overlap',closed:'No regular overlap',unknown:'Hours uncertain',appointment:'By appointment only'};
  const symbols = {open:'✓',closed:'−',unknown:'?',appointment:'◷'};
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link = value => {try {const u=new URL(value);return ['https:','http:'].includes(u.protocol)?esc(u.href):'#';} catch{return '#';}};
  const searchable = records.map(r=>[r.name,r.service,r.agency,r.category,r.address,r.borough].join(' ').toLowerCase());
  const cache = Object.fromEntries(Object.entries(M.PRESETS).map(([key,value])=>{
    const selected=M.intervals([value]); return [key,records.map(r=>P.classify(r,selected,today))];
  }));
  let mapView=true,serviceMap;
  let preset='after', states=cache.after, filtered=[], list=false, cols=1, step=42;
  let active=0, detailIndex=null, pinned=false, closeTimer, suppressFocus=false;
  let geometry=null,dense=false,page=0,pageSize=8;
  const mounted=new Map(), viewport=$('viewport'), grid=$('service-grid'), detail=$('detail');
  const labels={daytime:'Monday–Friday · 9 AM–5 PM',before:'Monday–Friday · midnight–9 AM',after:'Monday–Friday · 5 PM–midnight',weekend:'Saturday & Sunday · all day'};
  const clock = n => {if(n===1440)return 'midnight'; const h=Math.floor(n/60)%24,m=n%60; return `${h%12||12}${m?':'+String(m).padStart(2,'0'):''} ${h<12?'AM':'PM'}`;};
  function matchingText(matches) {
    const parts=[];
    for(const [a,b] of matches) {
      for(let cursor=a;cursor<b;) {
        const d=Math.floor(cursor/1440),end=Math.min(b,(d+1)*1440);
        parts.push(`${days[d]} ${clock(cursor%1440)}–${clock(end-d*1440)}`);cursor=end;
      }
    }
    return parts.join('\n');
  }
  for(const id of ['category','borough']) {
    for(const value of [...new Set(records.map(r=>r[id]).filter(Boolean))].sort()) {
      const option=document.createElement('option');option.value=value;option.textContent=value;$(id).append(option);
    }
  }
  $('custom-days').innerHTML=[6,0,1,2,3,4,5].map(i=>`<label><input type="checkbox" value="${i}" ${i<5?'checked':''}><span>${days[i]}</span></label>`).join('');
  function hideDetail(restore=false) {
    clearTimeout(closeTimer);
    if(detailIndex!==null) grid.querySelector(`[data-record="${detailIndex}"]`)?.setAttribute('aria-expanded','false');
    detail.hidden=true;pinned=false;detailIndex=null;setExpanded(false);
    if(restore) {
      suppressFocus=true;
      if(mapView)$('grid-view').focus({preventScroll:true});else grid.querySelector(`[data-index="${active}"]`)?.focus({preventScroll:true});
      suppressFocus=false;
    }
  }
  function setExpanded(expanded) {
    detail.classList.toggle('expanded',expanded);
    $('detail-content').hidden=!expanded;
    $('detail-expand').setAttribute('aria-expanded',expanded);
    $('detail-expand').setAttribute('aria-label',expanded?'Collapse service details':'Expand service details');
  }
  let pointer={x:innerWidth/2,y:150};
  function positionDetail(){
    const w=detail.offsetWidth,h=detail.offsetHeight,gap=18;
    const x=pointer.x+w+gap>innerWidth?pointer.x-w-gap:pointer.x+gap;
    const y=pointer.y+h+gap>innerHeight?pointer.y-h-gap:pointer.y+gap;
    detail.style.setProperty('left',Math.max(8,Math.min(x,innerWidth-w-8))+'px','important');
    detail.style.setProperty('top',Math.max(8,Math.min(y,innerHeight-h-8))+'px','important');
  }
  document.addEventListener('pointermove',e=>{pointer={x:e.clientX,y:e.clientY};if(!detail.hidden)positionDetail();},{passive:true});
  function openPlace(index){const r=records[index];try{const url=new URL(r.website||r.websiteUrl||r.sourceUrl);if(['https:','http:'].includes(url.protocol))window.open(url.href,'_blank','noopener,noreferrer');}catch{};hideDetail();}
  function showDetail(button,pin=false) {
    if(!button)return;const index=Number(button.dataset.record);
    if(pin){openPlace(index);return;}
    clearTimeout(closeTimer);pinned=false;detailIndex=index;
    const r=records[index],s=states[index];
    $('toast-name').textContent=window.PlacePreview.title(r);
    $('toast-hours').textContent=window.PlacePreview.hours({...r,accessMode:accessModes[index]},s.estimated);
    $('detail-content').innerHTML=(s.estimated?'<p class="estimate-label">Estimated from location hours</p>':'')+'<p class="preview-description">'+esc(window.PlacePreview.description(r))+'</p><p class="preview-status">'+esc(accessModes[index]==='appointment'?'By appointment only':words[s.state])+'</p><p class="preview-address">'+esc(window.PlacePreview.casing(r.address||r.borough))+'</p><p class="preview-action">Click for details</p>';
    $('detail-content').hidden=false;detail.hidden=false;
    if(document.activeElement===button){const rect=button.getBoundingClientRect();pointer={x:rect.right,y:rect.top};}
    positionDetail();
  }
  function setActive(index) {
    grid.querySelector(`[data-index="${active}"]`)?.setAttribute('tabindex','-1');
    active=index;
    grid.querySelector(`[data-index="${active}"]`)?.setAttribute('tabindex','0');
  }
  function makeRow(row) {
    const el=document.createElement('div');el.className='grid-row';el.setAttribute('role','row');el.setAttribute('aria-rowindex',row+1);el.style.top=`${row*step}px`;
    const cells=[];
    for(let i=row*cols;i<Math.min((row+1)*cols,filtered.length);i++) {
      const ri=filtered[i],r=records[ri],s=states[ri];
      cells.push(`<button class="tile ${s.state}" data-index="${i}" data-record="${ri}" tabindex="${i===active?0:-1}" role="gridcell" aria-colindex="${i%cols+1}" aria-label="${esc(`${r.name}, ${r.service}, ${r.borough}. ${words[s.state]}.${s.estimated?' Estimated from location hours.':''}`)}" aria-haspopup="dialog" aria-expanded="false" aria-controls="detail"><span class="tile-symbol" aria-hidden="true">${symbols[s.state]}</span>${list?`<span class="tile-copy" aria-hidden="true"><strong>${esc(r.name)}</strong><small>${esc(r.service)} · ${esc(r.borough)} · ${words[s.state]}</small></span>`:''}</button>`);
    }
    el.innerHTML=cells.join('');return el;
  }
  function renderRows(reset=false) {
    const focused=grid.contains(document.activeElement)?Number(document.activeElement.dataset.index):null;
    if(reset){for(const node of mounted.values())node.remove();mounted.clear();}
    const rows=Math.ceil(filtered.length/cols);
    grid.style.setProperty('--cols',cols);
    grid.setAttribute('aria-rowcount',rows);grid.setAttribute('aria-colcount',cols);
    if(dense){drawCanvas();return;}
    const start=list?page*pageSize:0,end=list?Math.min(rows,start+pageSize):rows;
    const wanted=new Set();for(let r=start;r<end;r++)wanted.add(r);
    // Paginate the accessible list while the overview always fits the viewport.
    for(const [r,node] of mounted)if(!wanted.has(r)){node.remove();mounted.delete(r);}
    for(const r of [...wanted].sort((a,b)=>a-b))if(!mounted.has(r)){
      const row=makeRow(r);if(list)row.style.top=`${(r-start)*step}px`;mounted.set(r,row);
      const next=[...grid.children].find(n=>Number(n.getAttribute('aria-rowindex'))>r+1);
      grid.insertBefore(row,next||null);
    }
    if(reset && focused!==null){suppressFocus=true;grid.querySelector(`[data-index="${focused}"]`)?.focus({preventScroll:true});suppressFocus=false;}
  }
  function layout(reset=false) {
    if(mapView)return;
    const width=Math.max(1,viewport.clientWidth-6),height=Math.max(1,viewport.clientHeight-6-(list?40:0));
    const hadFocus=grid.contains(document.activeElement);
    geometry=window.GridFit.fit(filtered.length,width,height);
    dense=!list&&filtered.length>1500;
    cols=list?1:geometry.cols;step=list?Math.max(44,Math.min(height,Math.max(58,parseFloat(getComputedStyle(document.documentElement).fontSize)*4.5))):geometry.step;
    pageSize=Math.max(1,Math.floor(height/step));page=Math.min(page,Math.max(0,Math.ceil(filtered.length/pageSize)-1));
    grid.style.width=`${list?width:geometry.width}px`;grid.style.height=`${list?Math.min(pageSize,filtered.length)*step:geometry.height}px`;
    grid.style.setProperty('--tile',`${list?step-6:geometry.size}px`);grid.style.setProperty('--gap',`${list?6:geometry.gap}px`);
    grid.style.setProperty('--radius',`${Math.min(7,geometry.size*.18)}px`);
    grid.classList.toggle('micro-tiles',!list&&geometry.size<12);
    $('list-pages').hidden=!list;
    $('page-label').textContent=`${page+1} / ${Math.max(1,Math.ceil(filtered.length/pageSize))}`;
    $('page-prev').disabled=page===0;$('page-next').disabled=(page+1)*pageSize>=filtered.length;
    grid.replaceChildren();mounted.clear();renderRows(true);
    if(hadFocus){suppressFocus=true;grid.querySelector(`[data-index="${active}"]`)?.focus({preventScroll:true});suppressFocus=false;}
  }
  function canvasProxy(index){
    const b=grid.querySelector('.canvas-proxy');if(!b||index<0)return null;
    const ri=filtered[index],r=records[ri];active=index;
    b.tabIndex=0;b.dataset.index=index;b.dataset.record=ri;b.setAttribute('aria-colindex',index%cols+1);
    b.parentElement.setAttribute('aria-rowindex',Math.floor(index/cols)+1);
    b.style.left=`${index%cols*step}px`;b.style.top=`${Math.floor(index/cols)*step}px`;
    b.setAttribute('aria-label',`${r.name}, ${r.service}, ${r.borough}. ${words[states[ri].state]}.${states[ri].estimated?' Estimated from location hours.':''}`);return b;
  }
  function drawCanvas(){
    const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
    const ratio=devicePixelRatio||1;canvas.width=Math.ceil(geometry.width*ratio);canvas.height=Math.ceil(geometry.height*ratio);
    canvas.style.width=`${geometry.width}px`;canvas.style.height=`${geometry.height}px`;grid.append(canvas);
    const ctx=canvas.getContext('2d');ctx.scale(ratio,ratio);
    const css=getComputedStyle(document.documentElement),colors=Object.fromEntries(['open','closed','appointment','unknown'].map(s=>[s,css.getPropertyValue('--'+s).trim()]));
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 '+Math.min(14,Math.max(7,geometry.size*.28))+'px "General Sans", sans-serif';
    for(let i=0;i<filtered.length;i++){
      const state=states[filtered[i]].state,x=i%cols*step,y=Math.floor(i/cols)*step;
      ctx.fillStyle=colors[state];
      if(geometry.size>=12){ctx.beginPath();ctx.roundRect(x,y,geometry.size,geometry.size,Math.min(7,geometry.size*.18));ctx.fill();ctx.fillStyle='#fff';ctx.fillText(symbols[state],x+geometry.size/2,y+geometry.size/2);}
      else ctx.fillRect(x,y,geometry.size,geometry.size);
    }
    const row=document.createElement('div');row.setAttribute('role','row');row.innerHTML='<button class="tile canvas-proxy" role="gridcell" tabindex="0" aria-haspopup="dialog" aria-controls="detail"></button>';grid.append(row);canvasProxy(active);
    canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const box=canvas.getBoundingClientRect(),i=window.GridFit.hit(e.clientX-box.left,e.clientY-box.top,geometry,filtered.length);if(i>=0&&(detail.hidden||detailIndex!==filtered[i]))showDetail(canvasProxy(i));else if(i<0)hideDetail();});
    canvas.addEventListener('click',e=>{const box=canvas.getBoundingClientRect(),i=window.GridFit.hit(e.clientX-box.left,e.clientY-box.top,geometry,filtered.length);if(i>=0){showDetail(canvasProxy(i),true);}});
  }
  function update() {
    hideDetail();const q=$('search').value.trim().toLowerCase(),category=$('category').value,borough=$('borough').value;
    $('filter-count').textContent=[q,category,borough].filter(Boolean).length||'';
    filtered=[];const counts={open:0,closed:0,appointment:0,unknown:0};
    records.forEach((r,i)=>{if((!q||searchable[i].includes(q))&&(!category||r.category===category)&&(!borough||r.borough===borough)){filtered.push(i);counts[states[i].state]++;}});
    filtered.sort((a,b)=>({open:0,closed:1,appointment:2,unknown:3}[states[a].state]-{open:0,closed:1,appointment:2,unknown:3}[states[b].state])||a-b);
    for(const state of ['open','closed','appointment'])$(`count-${state}`).textContent=counts[state].toLocaleString();
    $('empty').hidden=filtered.length>0;viewport.hidden=mapView||!filtered.length;
    if(serviceMap)serviceMap.update(filtered,states);
    $('live-status').textContent=`${filtered.length} service locations: ${counts.open} with overlapping hours, ${counts.closed} without overlap, ${counts.appointment} by appointment only.`;
    active=0;page=0;layout(true);
  }
  const motionReduced=matchMedia('(prefers-reduced-motion: reduce)');
  const tabStrip=document.querySelector('.tabs');
  const indicator=document.createElement('span');indicator.className='tab-indicator';indicator.setAttribute('aria-hidden','true');tabStrip.prepend(indicator);
  function syncIndicator(animate=false){indicator.style.transition=animate?'':'none';const tab=tabStrip.querySelector('[aria-selected="true"]');if(!tab||tabStrip.hidden)return;indicator.style.width=tab.offsetWidth+'px';indicator.style.transform='translateX('+tab.offsetLeft+'px)';indicator.style.visibility='visible';if(!animate)void indicator.offsetWidth;}
  syncIndicator();new ResizeObserver(()=>syncIndicator()).observe(tabStrip);document.fonts?.ready.then(()=>syncIndicator());
  document.addEventListener('keydown',()=>document.body.classList.add('keyboard-motion'));
  document.addEventListener('pointerdown',()=>document.body.classList.remove('keyboard-motion'));
  let customDraft;
  function openCustom(){
    customDraft={days:[...$('custom-days').querySelectorAll('input')].map(x=>x.checked),start:$('custom-start').value,end:$('custom-end').value,all:$('custom-all-day').checked};
    $('filters-panel').hidden=true;$('filters-open').setAttribute('aria-expanded','false');
    document.querySelector('.tabs').hidden=true;$('custom-dialog').hidden=false;
    document.querySelector('.time-control').classList.add('editing');$('custom-error').textContent='';
    $('custom-close').focus();
  }
  function closeCustom(cancel=false){
    if(cancel&&customDraft){[...$('custom-days').querySelectorAll('input')].forEach((x,i)=>x.checked=customDraft.days[i]);$('custom-start').value=customDraft.start;$('custom-end').value=customDraft.end;$('custom-all-day').checked=customDraft.all;for(const id of ['custom-start','custom-end'])$(id).disabled=customDraft.all;}
    document.dispatchEvent(new Event('time-controls-sync'));
    $('custom-dialog').hidden=true;document.querySelector('.tabs').hidden=false;document.querySelector('.time-control').classList.remove('editing');syncIndicator();
    document.querySelector('[data-preset="'+preset+'"]').focus({preventScroll:true});
  }
  $('custom-close').addEventListener('click',()=>closeCustom(true));
  $('custom-dialog').addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();closeCustom(true);}});
  $('filters-open').addEventListener('click',()=>{const open=$('filters-panel').hidden;if(open&&!$('custom-dialog').hidden)closeCustom(true);$('filters-panel').hidden=!open;$('filters-open').setAttribute('aria-expanded',open);if(open)$('search').focus();});
  document.addEventListener('click',e=>{if(!e.target.closest('.filter-anchor')){$('filters-panel').hidden=true;$('filters-open').setAttribute('aria-expanded','false');}});
  $('filters-panel').addEventListener('keydown',e=>{if(e.key==='Escape'){$('filters-panel').hidden=true;$('filters-open').setAttribute('aria-expanded','false');$('filters-open').focus();e.stopPropagation();}});
  function selectPreset(key) {
    if(key==='custom'){hideDetail();openCustom();return;}
    preset=key;
    for(const tab of document.querySelectorAll('[data-preset]')) {const selected=tab.dataset.preset===key;tab.setAttribute('aria-selected',selected);tab.tabIndex=selected?0:-1;}
    $('results').setAttribute('aria-labelledby',`tab-${key}`);
    syncIndicator(true);states=cache[key];$('results').setAttribute('aria-label',labels[key]);update();
  }
  function applyCustom() {
    const all=$('custom-all-day').checked;
    const value={days:[...$('custom-days').querySelectorAll('input:checked')].map(e=>Number(e.value)),start:all?'00:00':$('custom-start').value,end:all?'24:00':$('custom-end').value};
    const error=M.validate(value);$('custom-error').textContent=error;
    if(error)return;
    preset='custom';for(const tab of document.querySelectorAll('[data-preset]')){const selected=tab.dataset.preset==='custom';tab.setAttribute('aria-selected',selected);tab.tabIndex=selected?0:-1;}
    $('results').setAttribute('aria-labelledby','tab-custom');closeCustom();
    const selected=M.intervals([value]);states=records.map(r=>P.classify(r,selected,today));
    $('results').ariaLabel=`${value.days.map(d=>days[d]).join(', ')} · ${all?'all day':`${clock(M.minute(value.start))}–${clock(M.minute(value.end))}${M.minute(value.end)<M.minute(value.start)?' next day':''}`}`;
    $('tab-custom').title=$('results').ariaLabel;
    update();
  }
  document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('[data-preset]');if(b)selectPreset(b.dataset.preset);});
  document.querySelector('.tabs').addEventListener('keydown',e=>{
    const tabs=[...document.querySelectorAll('[data-preset]')],i=tabs.indexOf(document.activeElement);
    if(i<0)return;const next=e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:e.key==='Home'?0:e.key==='End'?tabs.length-1:null;
    if(next!==null){e.preventDefault();tabs[next].focus();tabs[next].scrollIntoView({block:'nearest',inline:'nearest'});selectPreset(tabs[next].dataset.preset);}
  });
  $('custom-form').addEventListener('submit',e=>{e.preventDefault();applyCustom();});
  $('custom-all-day').addEventListener('change',()=>{for(const id of ['custom-start','custom-end'])$(id).disabled=$('custom-all-day').checked;});
  $('search').addEventListener('input',update);$('category').addEventListener('change',update);$('borough').addEventListener('change',update);
  $('view-toggle').addEventListener('click',()=>{list=true;setView(false);});
  for(const [id,delta] of [['page-prev',-1],['page-next',1]])$(id).addEventListener('click',()=>{hideDetail();page+=delta;active=page*pageSize;layout(true);});
  for(const name of ['about']){const dialog=$(name+'-dialog');$(name+'-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});}
  const openAbout=()=>{hideDetail();$('filters-panel').hidden=true;$('filters-open').setAttribute('aria-expanded','false');$('about-dialog').showModal();};
  $('about-open').addEventListener('click',openAbout);
  $('brand-home').addEventListener('click',openAbout);
  let hoverTiles=[];
  function gridHover(button){
    for(const tile of hoverTiles)tile.classList.remove('tile-hover','tile-neighbor');hoverTiles=[];
    if(list||dense||!button)return;const i=Number(button.dataset.index),row=Math.floor(i/cols),col=i%cols;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const y=row+dy,x=col+dx;if(y<0||x<0||x>=cols)continue;const tile=grid.querySelector('[data-index="'+(y*cols+x)+'"]');if(tile){tile.classList.add(dx===0&&dy===0?'tile-hover':'tile-neighbor');hoverTiles.push(tile);}}
  }
  grid.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const b=e.target.closest('.tile');if(b&&!b.contains(e.relatedTarget)){gridHover(b);showDetail(b);}});
  grid.addEventListener('pointerleave',()=>{gridHover(null);hideDetail();});
  grid.addEventListener('focusin',e=>{const b=e.target.closest('.tile');if(b){setActive(Number(b.dataset.index));if(!suppressFocus)showDetail(b);}});
  grid.addEventListener('click',e=>{const b=e.target.closest('.tile');if(b){setActive(Number(b.dataset.index));showDetail(b,true);if(e.pointerType==='touch')$('detail-expand').focus({preventScroll:true});}});
  grid.addEventListener('keydown',e=>{
    const b=e.target.closest('.tile');if(!b)return;
    const shifts={ArrowRight:1,ArrowLeft:-1,ArrowDown:cols,ArrowUp:-cols,PageDown:Math.max(1,Math.floor(viewport.clientHeight/step))*cols,PageUp:-Math.max(1,Math.floor(viewport.clientHeight/step))*cols};
    let next=e.key==='Home'?(e.ctrlKey?0:Math.floor(active/cols)*cols):e.key==='End'?(e.ctrlKey?filtered.length-1:Math.min(filtered.length-1,(Math.floor(active/cols)+1)*cols-1)):e.key in shifts?active+shifts[e.key]:null;
    if(next===null)return;e.preventDefault();hideDetail();setActive(Math.max(0,Math.min(filtered.length-1,next)));
    if(dense){showDetail(canvasProxy(active));}else if(list){page=Math.floor(active/pageSize);layout(true);}else renderRows();
    grid.querySelector(`[data-index="${active}"]`)?.focus({preventScroll:true});
  });
  $('detail-expand').addEventListener('click',()=>{pinned=true;setExpanded(!detail.classList.contains('expanded'));});
  $('detail-close').addEventListener('click',()=>hideDetail(true));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!detail.hidden){e.preventDefault();hideDetail(true);}});
  document.addEventListener('pointerdown',e=>{if(!detail.hidden&&!detail.contains(e.target)&&!e.target.closest('.tile'))hideDetail();});
  document.addEventListener('focusin',e=>{if(!detail.hidden&&!detail.contains(e.target)&&!grid.contains(e.target)&&!$('map-shell').contains(e.target))hideDetail();});
  detail.addEventListener('keydown',e=>{if(e.key==='Tab'&&e.shiftKey&&document.activeElement===$('detail-expand')){e.preventDefault();hideDetail(true);}});
  new ResizeObserver(()=>{hideDetail();layout();}).observe(viewport);
  window.addEventListener('resize',()=>{hideDetail();layout();});
  function setView(value){mapView=value;hideDetail();document.body.classList.toggle('map-active',value);$('results').classList.toggle('list-active',list&&!value);$('map-shell').hidden=!value;$('viewport').hidden=value||!filtered.length;$('view-toggle').hidden=false;viewport.classList.toggle('list-mode',list);$('view-toggle').setAttribute('aria-pressed',!value&&list);$('map-view').setAttribute('aria-pressed',value);$('grid-view').setAttribute('aria-pressed',!value&&!list);$('list-pages').hidden=value||!list;if(value)serviceMap?.show();else{serviceMap?.hide();layout(true);}}
  $('map-view').addEventListener('click',()=>setView(true));$('grid-view').addEventListener('click',()=>{list=false;setView(false);});
  document.addEventListener('map-dismiss',()=>hideDetail());
  await Promise.all([400,500,600,700].map(weight=>document.fonts?.load(weight+' 16px "General Sans"'))).catch(()=>{});
  try{serviceMap=new window.ServiceMap(records,(index,pin)=>{const button=document.createElement('button');button.dataset.record=index;showDetail(button,pin);});}catch(e){$('map-notice').hidden=false;$('map-notice').textContent='The map could not load. Switch to Grid to explore the locations.';console.error(e);}
  update();
})();
