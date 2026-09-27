(function(root){
 const minute=t=>{const [h,m]=t.split(':').map(Number);return h*60+m;};
 function state(r,d,t){if(!r.schedule?.length)return 'unknown';return r.schedule.some(s=>s.days.includes(d)&&t>=minute(s.start)&&t<minute(s.end))?'on':'off';}
 root.MapHours={state};if(typeof module!=='undefined')module.exports={state};
})(typeof window==='undefined'?globalThis:window);
