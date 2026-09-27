(function(root){
  // Find the largest equal squares that fit the available rectangle, including gaps.
  function fit(count,width,height){
    if(!count||width<=0||height<=0)return {cols:1,rows:0,size:0,gap:0,step:0,width:0,height:0};
    let best={size:0};
    for(let cols=1;cols<=count;cols++){
      const rows=Math.ceil(count/cols),pitch=Math.min(width/cols,height/rows);
      const gap=Math.min(7,pitch*.16),size=pitch-gap;
      if(size>best.size)best={cols,rows,size,gap,step:pitch,width:cols*pitch-gap,height:rows*pitch-gap};
    }
    return best;
  }
  function hit(x,y,geometry,count){
    if(x<0||y<0||!geometry.step)return -1;
    const col=Math.floor(x/geometry.step),row=Math.floor(y/geometry.step),i=row*geometry.cols+col;
    return col<geometry.cols&&row<geometry.rows&&i<count&&x%geometry.step<=geometry.size&&y%geometry.step<=geometry.size?i:-1;
  }
  const api={fit,hit};root.GridFit=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
