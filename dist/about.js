(() => {
  const shell=document.querySelector('.about-profile-shell');
  if(!shell)return;
  const profile=shell.querySelector('.profile-heading');
  let origin=0,queued=false;
  function paint(){queued=false;shell.classList.toggle('is-compact',scrollY>origin+100);}
  function measure(){
    const compact=shell.classList.contains('is-compact');
    shell.classList.add('is-measuring');shell.classList.remove('is-compact');
    shell.style.height=profile.offsetHeight+'px';
    origin=shell.offsetTop;
    shell.classList.toggle('is-compact',compact);shell.classList.remove('is-measuring');
    document.body.classList.add('profile-ready');paint();
  }
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(paint);}},{passive:true});
  addEventListener('resize',measure);document.fonts?.ready.then(measure);measure();
})();
