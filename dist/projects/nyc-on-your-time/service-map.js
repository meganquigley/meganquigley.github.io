/* GPU-rendered vector map; all service details and coordinates remain local. */
(() => {
 const status={open:'Hours fit',closed:'No overlap',unknown:'Hours unknown',appointment:'By appointment only'};
 window.ServiceMap=class {
  constructor(records,onSelect){
   this.records=records;this.onSelect=onSelect;this.indices=[];this.states=[];this.ready=false;this.visible=true;this.current=new Set();this.clusterImages=new Set();
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   this.map=new maplibregl.Map({container:'service-map',style:window.NYC_MAP_STYLE,center:[-73.97,40.71],zoom:10.6,minZoom:8.5,maxZoom:19,maxBounds:[[-75.1,40.15],[-72.7,41.25]],renderWorldCopies:false,attributionControl:false,dragRotate:false,pitchWithRotate:false,touchPitch:false,fadeDuration:reduced?0:150});
   this.map.touchZoomRotate.disableRotation();
   this.map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-left');
   const control=(id,fn)=>document.getElementById(id).addEventListener('click',fn);
   control('map-reset',()=>this.fit());control('map-zoom-in',()=>this.map.zoomIn({duration:reduced?0:180}));control('map-zoom-out',()=>this.map.zoomOut({duration:reduced?0:180}));
   control('map-place-close',()=>document.getElementById('map-place-dialog').close());
   this.map.on('error',()=>{const n=document.getElementById('map-notice');n.textContent=this.ready?'Some map details could not load.':'Map unavailable. You can still explore Grid.';n.hidden=false;});
   this.map.on('load',()=>{
    this.ready=true;document.getElementById('map-notice').hidden=true;
    this.map.addSource('services',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
    this.map.addLayer({id:'services',type:'circle',source:'services',paint:{'circle-radius':['case',['==',['get','count'],1],6,['interpolate',['linear'],['get','count'],2,13,25,19,100,24]],'circle-color':['match',['get','state'],'open','#35a56d','closed','#d7756d','appointment','#8170bc','unknown','#9ba4aa','#fff'],'circle-stroke-color':'#fff','circle-stroke-width':2,'circle-opacity':.96}});
    this.map.addLayer({id:'service-mixtures',type:'symbol',source:'services',filter:['==',['get','state'],'mixed'],layout:{'icon-image':['get','mixtureIcon'],'icon-size':['/', ['interpolate',['linear'],['get','count'],2,13,25,19,100,24],32],'icon-allow-overlap':true,'icon-ignore-placement':true}});
    this.map.addLayer({id:'service-counts',type:'symbol',source:'services',filter:['>', ['get','count'],1],layout:{'text-field':['to-string',['get','count']],'text-font':['General Sans'],'text-size':12,'text-allow-overlap':true,'text-ignore-placement':true},paint:{'text-color':'#fff','text-halo-color':'#244754','text-halo-width':0}});
    this.map.on('mousemove','services',e=>{this.map.getCanvas().style.cursor='pointer';const ids=this.ids(e.features?.[0]);if(ids.length===1)this.onSelect(ids[0],false);else document.dispatchEvent(new CustomEvent('map-dismiss'));});
    this.map.on('mouseleave','services',()=>{this.map.getCanvas().style.cursor='';document.dispatchEvent(new CustomEvent('map-dismiss'));});
    this.map.on('click',e=>{const f=this.map.queryRenderedFeatures(e.point,{layers:['services']})[0];if(!f){document.dispatchEvent(new CustomEvent('map-dismiss'));return;}const ids=this.ids(f);if(ids.length>1&&this.map.getZoom()<17){this.map.easeTo({center:f.geometry.coordinates,zoom:Math.min(17,this.map.getZoom()+2),duration:reduced?0:220});}else this.choose(ids);});
    this.map.on('idle',()=>{for(const key of this.clusterImages)if(!this.usedClusterImages?.has(key)){this.map.removeImage(key);this.clusterImages.delete(key);}});
    this.map.on('moveend',()=>this.draw());this.draw();this.fit();
   });
  }
  ids(feature){try{return JSON.parse(feature?.properties.records||'[]').filter(i=>this.current.has(i));}catch{return[];}}
  update(indices,states){this.indices=indices;this.current=new Set(indices);this.states=states;if(this.ready&&this.visible)this.draw();}
  hide(){this.visible=false;}
  show(){this.visible=true;requestAnimationFrame(()=>{this.map.resize();this.draw();});}
  fit(){const top=(document.querySelector('.controls')?.getBoundingClientRect().height||44)+28;this.map.fitBounds(window.MapModel.NYC_BOUNDS,{padding:{top,bottom:76,left:30,right:76},duration:0});}
  choose(indices){
   if(!indices.length)return;if(indices.length===1){this.onSelect(indices[0],true);return;}
   const dialog=document.getElementById('map-place-dialog'),list=document.getElementById('map-place-list');list.replaceChildren();document.getElementById('map-place-title').textContent=`${indices.length} services here`;
   for(const i of indices){const b=document.createElement('button');b.className='place-choice';const dot=document.createElement('i');dot.className='swatch '+this.states[i].state;dot.textContent={open:'✓',closed:'−',unknown:'?',appointment:'◷'}[this.states[i].state];const text=document.createElement('span');text.textContent=this.records[i].name+' · '+status[this.states[i].state]+(this.states[i].estimated?' · Estimated from location hours':'');b.append(dot,text);b.addEventListener('click',()=>{dialog.close();this.onSelect(i,true);});list.append(b);}dialog.showModal();
  }
  mixture(feature){
   const p=feature.properties,key='mix-'+[p.open,p.closed,p.appointment].join('-');
   if(!this.map.hasImage(key)){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d'),gradient=ctx.createLinearGradient(0,0,128,128);
    const portions=[[p.open,'#35a56d'],[p.closed,'#d7756d'],[p.appointment,'#8170bc']].filter(([n])=>n>0),total=portions.reduce((sum,[n])=>sum+n,0);let offset=0;
    gradient.addColorStop(0,portions[0]?.[1]||'#8170bc');
    for(const [n,color]of portions){gradient.addColorStop((offset+n/2)/total,color);offset+=n;}
    gradient.addColorStop(1,portions.at(-1)?.[1]||'#8170bc');ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(64,64,64,0,Math.PI*2);ctx.fill();
    this.map.addImage(key,ctx.getImageData(0,0,128,128),{pixelRatio:2});this.clusterImages.add(key);
   }
   p.mixtureIcon=key;return key;
 }
 draw(){if(!this.ready||!this.visible)return;const result=window.MapModel.group(this.records,this.indices,this.states,c=>this.map.project(c),this.map.getZoom());const used=new Set();for(const feature of result.data.features)if(feature.properties.state==='mixed')used.add(this.mixture(feature));this.map.getSource('services').setData(result.data);this.usedClusterImages=used;document.getElementById('map-coverage').textContent=`${result.mapped} locations mapped; ${result.missing} unmatched addresses are available in Grid.`;}
 };
})();
