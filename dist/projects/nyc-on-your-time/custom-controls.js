(() => {
  const menus=[];
  const titleCase=text=>window.PlacePreview.casing(text);
  const iconPaths={all:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',appointment:'M5 5h14v15H5zM8 3v4m8-4v4M5 10h14m-10 5 2 2 4-4',walkin:'M13 5a2 2 0 1 0 0-.1M10 10l3-2 3 4 3 1M13 9l-2 6-4 5m4-5 5 5M6 13l4-3',booking:'M5 5h14v15H5zM8 3v4m8-4v4M5 10h14m-7 3v5m-2.5-2.5h5',unknown:'M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 3h.01',housing:'m3 11 9-8 9 8M5 10v11h14V10M10 21v-7h4v7',health:'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',food:'M5 3v7m3-7v7M4 7h5m-2.5 3v11M16 3v18m0-18c5 4 5 9 0 9',work:'M3 7h18v14H3zM8 7V3h8v4M3 12h18',people:'M9 8a3 3 0 1 0 0-.1M3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5',benefits:'M12 3 3 7l9 4 9-4-9-4ZM3 12l9 4 9-4M3 17l9 4 9-4'};
  function iconFor(value){const v=value.toLowerCase();const key=iconPaths[value]?value:!value?'all':/housing/.test(v)?'housing':/health/.test(v)?'health':/food/.test(v)?'food':/employment|work/.test(v)?'work':/aging|child|veteran|disability/.test(v)?'people':'benefits';const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');for(const [k,v]of Object.entries({viewBox:'0 0 24 24',width:17,height:17,fill:'none',stroke:'currentColor','stroke-width':1.5,'stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'}))svg.setAttribute(k,v);const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',iconPaths[key]);svg.append(path);return svg;}

  function closeMenus(){for(const m of menus){m.panel.hidden=true;m.button.setAttribute('aria-expanded','false');}}
  function picker(host,options,get,set,label,icons=false){
    const wrap=document.createElement('div');wrap.className='choice';
    const button=document.createElement('button');button.type='button';button.className='choice-trigger';button.setAttribute('aria-label',label);button.setAttribute('aria-expanded','false');
    const panel=document.createElement('div');panel.className='choice-menu';panel.hidden=true;panel.setAttribute('role','group');panel.setAttribute('aria-label',label);
    const sync=()=>{button.textContent=options.find(o=>o.value===get())?.label||label;if(button.classList.contains('time-options'))button.innerHTML="<svg viewBox=\"0 0 16 16\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m4 6 4 4 4-4\"/></svg>";if(icons)button.prepend(iconFor(get()));for(const b of panel.children)b.setAttribute('aria-pressed',b.dataset.value===get());};
    for(const o of options){const b=document.createElement('button');b.type='button';b.textContent=o.label;b.dataset.value=o.value;if(icons)b.prepend(iconFor(o.value));b.addEventListener('click',()=>{set(o.value);sync();closeMenus();button.focus();});panel.append(b);}
    button.addEventListener('click',()=>{const open=panel.hidden;closeMenus();panel.hidden=!open;button.setAttribute('aria-expanded',open);if(open){const selected=[...panel.children].find(b=>b.dataset.value===get());selected?.focus({preventScroll:true});selected?.scrollIntoView({block:'nearest'});}});
    wrap.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();closeMenus();button.focus();}if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();if(panel.hidden)button.click();else{const bs=[...panel.children],i=bs.indexOf(document.activeElement);bs[e.key==='Home'?0:e.key==='End'?bs.length-1:(i+(e.key==='ArrowDown'?1:-1)+bs.length)%bs.length].focus();}}});
    wrap.append(button,panel);host.append(wrap);menus.push({panel,button,wrap});sync();return {sync,button};
  }
  for(const id of ['category','borough']){
    const select=document.getElementById(id);select.hidden=true;
    const c=picker(select.parentElement,[...select.options].map(o=>({value:o.value,label:titleCase(o.textContent)})),()=>select.value,v=>{select.value=v;select.dispatchEvent(new Event('change'));},id==='category'?'Service category':id==='borough'?'Borough':'Access Type',id!=='borough');
    select.after(c.button.parentElement);
  }
  const syncs=[],typedFields=[];
  for(const id of ['custom-start','custom-end']){
    const input=document.getElementById(id),host=document.createElement('div');host.className='clock-input';input.after(host);
    const parts=()=>{const [h,m]=input.value.split(':').map(Number);return {hour:String(h%12||12),minute:String(m).padStart(2,'0'),period:h>=12?'PM':'AM'};};
    const controls=[];
    function set(part,value){const next={...parts(),[part]:value};input.value=String(Number(next.hour)%12+(next.period==='PM'?12:0)).padStart(2,'0')+':'+next.minute;controls.forEach(c=>c.sync());}
    const specs=[['hour',Array.from({length:12},(_,i)=>String(i+1))],['minute',Array.from({length:60},(_,i)=>String(i).padStart(2,'0'))],['period',['AM','PM']]];
    for(const [part,values]of specs){
      const label=(id==='custom-start'?'Start ':'End ')+part;
      const c=picker(host,values.map(v=>({value:v,label:v})),()=>parts()[part],v=>set(part,v),label);
      const field=document.createElement('input');field.type='text';field.className='time-digit';field.maxLength=2;field.autocomplete='off';field.spellcheck=false;field.inputMode=part==='period'?'text':'numeric';field.setAttribute('aria-label',label);field.value=parts()[part];
      c.button.before(field);c.button.classList.add('time-options');c.button.setAttribute('aria-label','Choose '+label.toLowerCase());
      const originalSync=c.sync;c.sync=()=>{originalSync();c.button.innerHTML='<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';field.value=parts()[part];field.setCustomValidity('');field.disabled=document.getElementById('custom-all-day').checked;};
      const commit=()=>{if(field.disabled)return true;let value=field.value.trim().toUpperCase();if(part==='period'&&/^[AP]$/.test(value))value+='M';const valid=part==='period'?['AM','PM'].includes(value):/^\d{1,2}$/.test(value)&&Number(value)>=(part==='hour'?1:0)&&Number(value)<=(part==='hour'?12:59);field.setCustomValidity(valid?'':part==='hour'?'Enter an hour from 1 to 12.':part==='minute'?'Enter minutes from 00 to 59.':'Enter AM or PM.');if(valid)set(part,part==='minute'?value.padStart(2,'0'):part==='hour'?String(Number(value)):value);return valid;};
      field.addEventListener('focus',()=>field.select());field.addEventListener('input',()=>field.setCustomValidity(''));field.addEventListener('change',commit);
      field.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();e.stopPropagation();const i=values.indexOf(parts()[part]);set(part,values[(i+(e.key==='ArrowUp'?1:-1)+values.length)%values.length]);field.select();}else if(['Home','End'].includes(e.key))e.stopPropagation();});
      typedFields.push({field,commit});controls.push(c);c.sync();
    }
    const sync=()=>{controls.forEach(c=>{c.sync();c.button.disabled=document.getElementById('custom-all-day').checked;});};syncs.push(sync);
  }
  document.getElementById('custom-form').addEventListener('submit',e=>{for(const item of typedFields){if(!item.commit()){e.preventDefault();e.stopImmediatePropagation();item.field.reportValidity();return;}}},true);
  document.getElementById('custom-all-day').addEventListener('change',()=>{closeMenus();syncs.forEach(s=>s());});
  document.addEventListener('time-controls-sync',()=>{closeMenus();syncs.forEach(s=>s());});
  document.addEventListener('click',e=>{if(!e.target.closest('.choice'))closeMenus();});
  document.addEventListener('focusin',e=>{if(!e.target.closest('.choice'))closeMenus();});
})();
