(() => {
  const body=document.body, reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const clamp=x=>Math.max(0,Math.min(1,x));
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
  const progress=(el,start=.9,end=.25)=>{const r=el.getBoundingClientRect();return smooth((innerHeight*start-r.top)/(innerHeight*(start-end)));};
  const geography=document.querySelector('.geography-story');
  const states=[...document.querySelectorAll('.geo-state')];
  const people=[...document.querySelectorAll('.person:not(.outside)')];
  const audit=[...document.querySelectorAll('.audit-mark')];
  let queued=false, printing=false, previousMapMotion;
  function paint(){
    queued=false;
    const motion=!printing&&!reduce.matches&&!body.classList.contains('reading');
    const mapMotion=motion&&innerWidth>800&&innerHeight>780;
    if(body.classList.contains('enhanced-motion')!==mapMotion)body.classList.toggle('enhanced-motion',mapMotion);
    if(geography){
      const travel=Math.max(1,geography.offsetHeight-document.querySelector('.geography-pin').offsetHeight);
      const t=mapMotion?smooth((65-geography.getBoundingClientRect().top)/travel):0;
      states.forEach(el=>{const d=el.dataset,scale=1-t*.95;const dx=t*(+d.tx-+d.cx),dy=t*(+d.ty-+d.cy);el.setAttribute('transform',`translate(${dx+Number(d.cx)} ${dy+Number(d.cy)}) scale(${scale}) translate(${-d.cx} ${-d.cy})`);el.querySelector('path').style.opacity=1-t;el.querySelector('.geo-dot').style.opacity=t;});
      document.querySelector('.geo-chart-labels').style.opacity=smooth((t-.55)/.45);
      document.querySelector('.geo-map-labels').style.opacity=1-smooth(t/.3);
      const table=document.querySelector('.geography-table');
      // On small screens / reading mode the full ranked table replaces the morph.
      if(!mapMotion&&previousMapMotion!==mapMotion)table.open=true;
      previousMapMotion=mapMotion;
    }
    if(people.length){const panel=people[0].closest('figure')||people[0].parentElement;const p=motion?progress(panel):1;people.forEach((el,i)=>el.style.setProperty('--person-fill',clamp(p*1.5-i/people.length*.5)));}
    document.querySelectorAll('.age-row').forEach((row,i)=>row.style.setProperty('--age-fill',motion?clamp(progress(row)*1.3):1));
    document.querySelectorAll('.process li').forEach(el=>el.style.setProperty('--step-fill',motion?progress(el):1));
    document.querySelectorAll('.door-row').forEach(row=>{const p=motion?progress(row):1;row.querySelectorAll('.denied').forEach((el,i)=>el.style.setProperty('--door-fill',clamp(p*2-i/100)));});
    document.querySelectorAll('.lease-morph').forEach(svg=>{const p=motion?progress(svg,.95,.1):1;svg.querySelectorAll('.lease-mark').forEach(el=>{const d=el.dataset;el.setAttribute('cx',+d.sx+(d.x-d.sx)*p);el.setAttribute('cy',+d.sy+(d.y-d.sy)*p);});});
    document.querySelectorAll('.bar-row').forEach(row=>row.style.setProperty('--bar-progress',motion?progress(row):1));
    if(audit.length){const svg=document.querySelector('.audit-morph');const t=motion?progress(svg,.95,.1):1;svg.querySelector('.audit-labels').style.opacity=smooth((t-.55)/.45);audit.forEach(el=>{const d=el.dataset;el.setAttribute('x',+d.sx+(d.x-d.sx)*t);el.setAttribute('y',+d.sy+(d.y-d.sy)*t);});}
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(paint);}}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduce.addEventListener('change',schedule);
  new MutationObserver(schedule).observe(body,{attributes:true,attributeFilter:['class']});
  // Avoid a render loop: classList.toggle above only changes the class when needed.
  addEventListener('beforeprint',()=>{printing=true;paint();});
  addEventListener('afterprint',()=>{printing=false;paint();});
  paint();
})();
