(() => {
  const legacy={'scene-1':'part-6','scene-2':'part-8','scene-3':'part-7','scene-4':'part-12','scene-5':'part-12','scene-6':'part-13','scene-7':'part-3','scene-8':'part-2','scene-9':'part-10','scene-10':'part-14','scene-11':'part-15','scene-12':'part-15','sources':'resources','wic-purpose':'part-1'};
  const hash=location.hash.slice(1);
  if(location.pathname==='/'&&legacy[hash]){location.replace('/case-studies/wic/#'+legacy[hash]);return;}
  const reduce=matchMedia('(prefers-reduced-motion:reduce)'),home=document.body.classList.contains('collection-home');
  const clamp=x=>Math.max(0,Math.min(1,x));
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
  let queued=false;
  function paint(){
    queued=false;
    const moving=home&&!reduce.matches&&innerHeight>650;
    const p=home&&!moving?1:clamp(scrollY/(innerHeight*.65));
    if(home)document.body.classList.toggle('home-motion',moving);
    document.documentElement.style.setProperty('--intro-reveal',p.toFixed(4));
    document.body.classList.toggle('intro-revealed',p>.12);
    document.body.classList.toggle('has-scrolled',scrollY>8);
    const equation=document.querySelector('.collection-home .opening-equation');
    if(equation){
      const symbol=equation.querySelector('.not-equal'),copy=document.querySelector('.intro-copy p');
      const style=getComputedStyle(copy);
      const copyHeight=copy.offsetHeight+parseFloat(style.marginTop)+parseFloat(style.marginBottom);
      const symbolHeight=symbol.offsetHeight;
      equation.style.setProperty('--equation-height',symbolHeight*(1-.65*p)+'px');
      document.documentElement.style.setProperty('--intro-copy-height',copyHeight+'px');
      // The final title/question group is centered. Cards arrive just below it.
      // Compute from its final size, not scroll position, so document height stays stable.
      const finalGroupHeight=symbolHeight*.35+copyHeight;
      const overlap=Math.max(0,innerHeight/2-finalGroupHeight/2-32);
      document.documentElement.style.setProperty('--story-overlap',overlap+'px');
    }
    const cue=document.querySelector('.journey-cue');
    if(cue){
      const intro=document.querySelector('.collection-intro'),stories=document.getElementById('case-studies');
      const travel=Math.max(1,intro.offsetHeight-innerHeight),q=clamp(scrollY/travel);
      cue.style.setProperty('--explore-opacity',moving?1-smooth(q/.24):1);
      cue.style.setProperty('--stories-opacity',moving?smooth((q-.32)/.23):0);
      cue.style.setProperty('--cue-opacity',moving?1-smooth((innerHeight*1.3-stories.getBoundingClientRect().top)/(innerHeight*.3)):1);
    }
    const header=document.querySelector('.global-header');
    if(home&&header)header.inert=moving&&p<=.12;
    document.documentElement.style.setProperty('--object-shift',reduce.matches?'0px':(1-p)*60+'px');
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(paint);}}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduce.addEventListener('change',schedule);document.fonts?.ready.then(schedule);paint();
  document.addEventListener('click',e=>{document.querySelectorAll('.case-menu[open]').forEach(d=>{if(!d.contains(e.target))d.open=false;});});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.case-menu[open]').forEach(d=>{d.open=false;d.querySelector('summary').focus();});});
})();
