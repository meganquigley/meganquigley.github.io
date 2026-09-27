(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MapModel=api;})(typeof window!=='undefined'?window:globalThis,()=>{
 const NYC_BOUNDS=[[-74.26,40.49],[-73.70,40.92]];
 function group(records,indices,states,project,zoom){const bins=new Map();let missing=0;
  for(const i of indices){const r=records[i];if(!r.coordinates){missing++;continue;}const p=project(r.coordinates),key=zoom<17?`${Math.floor(p.x/40)},${Math.floor(p.y/40)}`:r.coordinates.join(',');if(!bins.has(key))bins.set(key,[]);bins.get(key).push(i);}
  const features=[...bins.values()].map(ids=>{const coordinates=[0,0],counts={open:0,closed:0,appointment:0,unknown:0};for(const i of ids){coordinates[0]+=records[i].coordinates[0]/ids.length;coordinates[1]+=records[i].coordinates[1]/ids.length;counts[states[i].state]++;}const kinds=Object.keys(counts).filter(k=>counts[k]);return{type:'Feature',properties:{records:JSON.stringify(ids),count:ids.length,open:counts.open,closed:counts.closed,appointment:counts.appointment,state:kinds.length===1?kinds[0]:'mixed'},geometry:{type:'Point',coordinates}};});
  return {data:{type:'FeatureCollection',features},mapped:indices.length-missing,missing};
 }
 return{group,NYC_BOUNDS};
});
