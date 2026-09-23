(() => {
  const shell=document.querySelector('.about-profile-shell');
  if(!shell)return;
  const profile=shell.querySelector('.profile-heading'),title=profile.querySelector('h1');
  const given=title.querySelector('.given-name'),family=title.querySelector('.family-name');
  const deck=profile.querySelector('.about-deck'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
  let origin=0,queued=false,wideCopy=460,narrowCopy=170,wideFont=72,widePhoto=160,wideGap=28;
  const mix=(a,b,p)=>a+(b-a)*p;
  function apply(p){
    const font=mix(wideFont,22,p);
    shell.style.setProperty('--profile-progress',p.toFixed(5));
    shell.style.setProperty('--profile-copy-width',mix(wideCopy,narrowCopy,p)+'px');
    shell.style.setProperty('--profile-gap',mix(wideGap,20,p)+'px');
    shell.style.setProperty('--profile-padding',mix(32,10,p)+'px');
    shell.style.setProperty('--profile-font',font+'px');
    shell.style.setProperty('--profile-photo',mix(widePhoto,52,p)+'px');
    shell.style.setProperty('--profile-title-height',font*1.12*(2-p)+'px');
    shell.style.setProperty('--family-x',(given.offsetWidth+font*.28)*p+'px');
    shell.style.setProperty('--family-y',font*1.12*(1-p)+'px');
  }
  function paint(){
    queued=false;
    const distance=scrollY-origin,range=Math.max(340,Math.min(520,innerHeight*.6));
    let p=Math.max(0,Math.min(1,distance/range));
    p=reduce.matches?(distance>100?1:0):p*p*(3-2*p);
    apply(p);
  }
  function measure(){
    shell.classList.add('is-measuring');
    const mobile=innerWidth<=650,padding=getComputedStyle(profile);
    const available=profile.clientWidth-parseFloat(padding.paddingLeft)-parseFloat(padding.paddingRight);
    widePhoto=mobile?90:160;wideGap=mobile?20:28;wideFont=mobile?38:Math.min(72,Math.max(48,innerWidth*.06));
    wideCopy=Math.min(460,Math.max(140,available-widePhoto-wideGap));
    apply(1);narrowCopy=given.offsetWidth+family.offsetWidth+22*.28+2;
    apply(0);shell.style.setProperty('--profile-deck-height',deck.scrollHeight+'px');
    shell.style.height=profile.offsetHeight+'px';origin=shell.offsetTop;
    shell.classList.remove('is-measuring');document.body.classList.add('profile-ready');paint();
  }
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(paint);}},{passive:true});
  addEventListener('resize',measure);reduce.addEventListener('change',paint);document.fonts?.ready.then(measure);measure();
})();
