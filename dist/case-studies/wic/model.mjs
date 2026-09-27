/** Pure absolute-position state: reverse scroll and jumps have no animation history. */
export const clamp = (n, lo=0, hi=1) => Math.min(hi, Math.max(lo, n));
export function beatAt(top, height, viewport, count) {
 const distance=Math.max(1,height-viewport);
 return Math.min(count-1,Math.floor(clamp(-top/distance)*count));
}
export function openingAt(top, height, viewport) {
 const p=clamp(-top/Math.max(1,height-viewport));
 return {scale:1-.78*clamp(p/.85),words:clamp((p-.25)/.5),cue:1-clamp(p*3)};
}
export function produceTotal(months) {
 const m=clamp(Math.floor(months),0,60);
 return Math.min(m,12)*52+Math.max(m-12,0)*26;
}
export function checkoutAt(time,items){
 const count=Math.min(items.length,Math.max(0,Math.floor(time+1-75/140)));
 return items.slice(0,count).reduce((s,item)=>({count,total:s.total+item.cents,covered:s.covered+(item.covered?item.cents:0),own:s.own+(item.covered?0:item.cents)}),{count,total:0,covered:0,own:0});
}

/** Measure the road's ordered vertices once; never reveal disconnected dash fragments. */
export function measureRoad(d){
 const vertices=[...d.matchAll(/[ML]\s*(-?[\d.]+),\s*(-?[\d.]+)/g)].map(m=>({x:Number(m[1]),y:Number(m[2])}));
 if(!vertices.length)throw new Error('Missing road geometry');
 let length=0;
 const points=vertices.map((point,i)=>{if(i)length+=Math.hypot(point.x-vertices[i-1].x,point.y-vertices[i-1].y);return {...point,distance:length};});
 return {points,length};
}
export function roadAt(road,progress){
 const distance=road.length*clamp(progress),points=road.points;
 let end=1;
 while(end<points.length&&points[end].distance<=distance)end++;
 const start=points[end-1],next=points[end];
 const fraction=next?(distance-start.distance)/(next.distance-start.distance):0;
 const x=next?start.x+(next.x-start.x)*fraction:start.x;
 const y=next?start.y+(next.y-start.y)*fraction:start.y;
 const d=points.slice(0,end).map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' ')+(next&&fraction>0?` L${x},${y}`:'');
 return {d,x,y};
}
