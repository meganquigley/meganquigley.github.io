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
