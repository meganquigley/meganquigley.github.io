(() => {
  const shell=document.querySelector('.about-profile-shell');
  if(!shell)return;
  const profile=shell.querySelector('.profile-heading');
  const reduce=matchMedia('(prefers-reduced-motion:reduce)');
  let origin=0,queued=false,wideFont=64,widePhoto=160,wideGap=64;
  const mix=(a,b,p)=>a+(b-a)*p;
  function apply(p){
    shell.style.setProperty('--profile-progress',p.toFixed(5));
    shell.style.setProperty('--profile-gap',mix(wideGap,28,p)+'px');
    shell.style.setProperty('--profile-padding',mix(24,12,p)+'px');
    shell.style.setProperty('--profile-font',mix(wideFont,20,p)+'px');
    shell.style.setProperty('--profile-photo',mix(widePhoto,52,p)+'px');
  }
  function paint(){
    queued=false;
    const distance=scrollY-origin,range=Math.max(340,Math.min(520,innerHeight*.6));
    let p=Math.max(0,Math.min(1,distance/range));
    // Reduced motion uses a stable compact row, without a scroll-triggered jump.
    p=reduce.matches?1:p*p*(3-2*p);
    apply(p);
  }
  function measure(){
    shell.classList.add('is-measuring');
    const mobile=innerWidth<=650,tiny=innerWidth<=360;
    widePhoto=tiny?76:mobile?96:160;
    wideGap=tiny?24:mobile?28:64;
    wideFont=tiny?30:mobile?36:64;
    apply(reduce.matches?1:0);
    shell.style.height=profile.offsetHeight+'px';origin=shell.offsetTop;
    shell.classList.remove('is-measuring');document.body.classList.add('profile-ready');paint();
  }
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(paint);}},{passive:true});
  addEventListener('resize',measure);reduce.addEventListener('change',measure);document.fonts?.ready.then(measure);measure();
})();
