(function(root){
  'use strict';
  const DAY=1440,WEEK=10080;
  const minutes=t=>{const [h,m]=t.split(':').map(Number);return h*60+m;};
  function merge(xs){
    const out=[];
    for(const [s,e] of xs.filter(x=>x[1]>x[0]).sort((a,b)=>a[0]-b[0])){
      if(out.length&&s<=out[out.length-1][1])out[out.length-1][1]=Math.max(e,out[out.length-1][1]);
      else out.push([s,e]);
    }return out;
  }
  function subtract(windows,blocks){
    let out=windows.map(x=>x.slice());
    for(const [b,e] of merge(blocks))out=out.flatMap(([s,t])=>e<=s||b>=t?[[s,t]]:[[s,Math.min(t,b)],[Math.max(s,e),t]].filter(x=>x[1]>x[0]));
    return out;
  }
  function workIntervals(settings,buffer=0){
    const start=minutes(settings.start),end=minutes(settings.end),base=[];
    for(const day of settings.days){
      const s=day*DAY+start,e=day*DAY+end+(end<=start?DAY:0);
      let shifts=[[s,e]];
      if(settings.breakEnabled&&end>start){
        const bs=day*DAY+minutes(settings.breakStart),be=day*DAY+minutes(settings.breakEnd);
        if(be>bs)shifts=subtract(shifts,[[bs,be]]);
      }
      for(const [a,b] of shifts) for(const offset of [-WEEK,0,WEEK])base.push([a-buffer+offset,b+buffer+offset]);
    }
    return merge(base).filter(([s,e])=>s<WEEK&&e>0).map(([s,e])=>[Math.max(0,s),Math.min(WEEK,e)]);
  }
  function openIntervals(row){
    return merge((row.schedule||[]).flatMap(x=>x.days.map(d=>[d*DAY+minutes(x.start),d*DAY+minutes(x.end)])));
  }
  function analyze(row,settings){
    if(row.status==='closed')return {kind:'closed',open:[],free:[],windows:[],minutes:0};
    if(row.schedule===null||!row.schedule?.length)return {kind:'unknown',open:[],free:[],windows:[],minutes:0};
    const open=openIntervals(row),busy=workIntervals(settings,row.channel==='in_person'?settings.travel:0);
    const free=subtract(open,busy),windows=free.filter(([s,e])=>e-s>=settings.duration);
    const possible=windows.length>0;
    // Special-date extra sessions must not become a categorical no-access verdict.
    const extra=!!(row.scheduleExceptions?.length||row.extraHours);
    return {kind:possible?'possible':extra?'special':'conflict',open,free,windows,minutes:free.reduce((a,[s,e])=>a+e-s,0),busy};
  }
  function planVisit(row,settings){
    if(row.status==='closed')return {kind:'closed'};
    if(!row.schedule?.length)return {kind:'unknown'};
    const travel=row.channel==='in_person'?Number(settings.travel):0;
    const duration=Number(settings.duration)+Number(settings.wait||0);
    const work=workIntervals(settings),hard=merge(settings.unavailable||[]);
    let best=null;
    for(const [a,b] of openIntervals(row))for(let start=a;start+duration<=b;start++){
      const depart=start-travel,finish=start+duration,back=finish+travel;
      if(hard.some(([s,e])=>depart<e&&back>s))continue;
      const overlap=work.reduce((n,[s,e])=>n+Math.max(0,Math.min(e,back)-Math.max(s,depart)),0);
      if(!best||overlap<best.overlap)best={start,finish,depart,back,overlap,travel,duration};
    }
    return best?{kind:best.overlap?'overlap':'fits',...best,hasExceptions:!!(row.scheduleExceptions?.length||row.extraHours)}:{kind:'blocked'};
  }
  function routeVisit(row,s,day,kind,inbound,outbound){
    if(row.status==='closed')return {kind:'closed'};
    if(!row.schedule?.length)return {kind:'unknown'};
    if(![inbound,outbound].every(n=>Number.isFinite(n)&&n>=0))return {kind:'missing'};
    if(!s.days.includes(day))return {kind:'dayoff'};
    const ws=day*DAY+minutes(s.start),we=day*DAY+minutes(s.end)+(minutes(s.end)<=minutes(s.start)?DAY:0);
    const duration=Number(s.duration)+Number(s.wait||0),hard=s.unavailable||[];let best=null;
    // Before/after refers to this shift, including an overnight shift's following morning.
    for(const [a,b] of openIntervals(row))for(let start=a;start+duration<=b;start++){
      const depart=start-inbound,finish=start+duration,back=finish+outbound;
      if(kind==='before'&&Math.floor(start/DAY)!==Math.floor(ws/DAY))continue;
      if(kind==='after'&&Math.floor(start/DAY)!==Math.floor(we/DAY))continue;
      if(kind==='before'&&(depart<ws-DAY||depart>ws||back>we))continue;
      if(kind==='during'&&(depart<ws||back>we))continue;
      if(kind==='after'&&(depart<ws||back>we+DAY))continue;
      if(hard.some(([x,y])=>depart<y&&back>x))continue;
      const overlap=kind==='before'?Math.max(0,back-ws):kind==='after'?Math.max(0,we-depart):back-depart;
      // Ties favor leaving home later before work and getting home sooner afterward.
      const tie=kind==='before'?-depart:back;
      if(!best||overlap<best.overlap||(overlap===best.overlap&&tie<best.tie))best={start,finish,depart,back,overlap,tie};
    }
    return best?{kind:best.overlap?'overlap':'fits',...best}:{kind:'blocked'};
  }
  const api={DAY,WEEK,minutes,merge,subtract,workIntervals,openIntervals,analyze,planVisit,routeVisit};
  if(typeof module!=='undefined')module.exports=api;
  root.ScheduleEngine=api;
})(typeof window==='undefined'?globalThis:window);
