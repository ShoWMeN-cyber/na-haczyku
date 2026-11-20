const mapPlaces=["restaurant","home","town","pier","camp"];
let mapView=null;
function resetMap(){const p=townSite();mapView={lake:life.lake,x:p.x*.34,z:p.z*.21,zoom:.72};}
function mapControl(op){
 if(where!=="map")return;
 if(op==="region"){
  resetMap();const l=lake(),totalScale=Math.min(760/(l.rx*9.5),390/(l.rz*9.5)),localScale=Math.min(760/(l.rx*2.6+36),390/(v.town.z+24+l.rz*1.22));
  Object.assign(mapView,{x:0,z:0,zoom:totalScale/localScale});
 }else if(op==="me"){mapView.x=me.x;mapView.z=me.z;mapView.zoom=2.4;}
 else mapView.zoom=sat(mapView.zoom*(op==="plus"?1.45:1/1.45),.32,5);
 chart();
}
function chart(){
 const c=$("chart"),g=c.getContext("2d"),l=lake();
 if(!mapView||mapView.lake!==life.lake)resetMap();
 const w=c.width,h=c.height,scale=mapView.zoom*Math.min(w/(l.rx*2.6+36),h/(v.town.z+24+l.rz*1.22));
 const px=x=>w/2+(x-mapView.x)*scale,pz=z=>h/2+(z-mapView.z)*scale;
 const contour=r=>{g.beginPath();for(let j=0;j<=140;j++){const [x,z]=polar(l,j*TAU/140,r);if(!j)g.moveTo(px(x),pz(z));else g.lineTo(px(x),pz(z));}g.closePath();};
 g.fillStyle="#ded9bd";g.fillRect(0,0,w,h);
 drawCountryside(g,px,pz,scale);
 for(let k=1;k<31;k++){contour(1+k*.11);g.strokeStyle=k%5?"#83947835":"#788e754f";g.lineWidth=k%5?.8:1.3;g.stroke();}
 contour(1);g.fillStyle=["#81b2ae","#9eaf88","#80a6b6"][life.lake];g.fill();g.strokeStyle="#527771";g.lineWidth=2;g.stroke();
 for(const r of [.8,.6,.4]){contour(r);g.strokeStyle="#ffffff39";g.lineWidth=1;g.stroke();}
 if(life.lake===1)for(const p of reedIslands){g.fillStyle="#909463";g.beginPath();g.ellipse(px(p.x),pz(p.z),p.rx*scale,p.rz*scale,0,0,TAU);g.fill();}
 if(life.lake===2){const z=-.77*l.rz;g.beginPath();let first=true;for(let x=-l.rx*1.3;x<l.rx*1.3;x+=.5)if(ratio(x,z)<=1.01){if(first)g.moveTo(px(x),pz(z));else g.lineTo(px(x),pz(z));first=false;}g.strokeStyle="#616b68";g.lineWidth=5;g.stroke();}
 for(const id of ["town","restaurant","home"]){const points=footRoute(id);g.beginPath();points.forEach((p,i)=>{if(i===0)g.moveTo(px(p.x),pz(p.z));else g.lineTo(px(p.x),pz(p.z));});g.strokeStyle=id===me.guide?"#a4652b":"#9a825e";g.lineWidth=id===me.guide?4:2;g.stroke();}
 g.fillStyle="#a77a55";plazaLots.forEach(([x,z])=>g.fillRect(px(v.town.x+x)-2*scale,pz(v.town.z+z)-1.6*scale,4*scale,3.2*scale));
 labelCountryside(g,px,pz,w,h);
 g.textAlign="center";g.font="bold 15px system-ui";const pins=[];
 mapPlaces.forEach((id,i)=>{const p=v[id],ax=px(p.x),az=pz(p.z);
  const clear=(x,z)=>Math.hypot(x-px(me.x),z-pz(me.z))>17&&pins.every(q=>Math.hypot(x-q.x,z-q.z)>24);
  let x=ax,z=az;
  for(let k=0;k<32&&!clear(x,z);k++){
   const a=(i*1.7+k%8)*TAU/8,r=19+Math.floor(k/8)*12;x=ax+Math.cos(a)*r;z=az+Math.sin(a)*r;
  }
  if(x!==ax||z!==az){g.beginPath();g.moveTo(ax,az);g.lineTo(x,z);g.strokeStyle="#6d6656";g.lineWidth=1.4;g.stroke();}
  pins.push({id,x,z});
  g.beginPath();g.arc(x,z,11,0,TAU);g.fillStyle=["#86563b","#5b6e4e","#685477","#536e75","#9b7942"][i];g.fill();g.strokeStyle="#fff2cc";g.lineWidth=1.7;g.stroke();g.fillStyle="#fff4d7";g.fillText(String(i+1),x,z+5.2);});
 const tip=markedReport();if(tip){g.beginPath();g.arc(px(tip.x),pz(tip.z),6.5,0,TAU);g.strokeStyle="#ad5226";g.lineWidth=3;g.stroke();}
 g.beginPath();g.arc(px(me.x),pz(me.z),4.7,0,TAU);g.fillStyle="#b03b32";g.fill();g.strokeStyle="#fff3d5";g.lineWidth=1.8;g.stroke();
 g.fillStyle="#3b5147";g.textAlign="left";g.font="bold 17px Georgia";g.fillText("N ↑",14,26);
 const len=scale*20;g.fillRect(13,h-15,len,2);g.font="13px system-ui";g.fillText("20 m",13,h-20);
 c.onpointerdown=e=>{e.preventDefault();c.setPointerCapture(e.pointerId);c.dragStart={mx:e.clientX,my:e.clientY,x:mapView.x,z:mapView.z};};
 c.onpointermove=e=>{const d=c.dragStart;if(!d)return;const rect=c.getBoundingClientRect();mapView.x=sat(d.x-(e.clientX-d.mx)*w/rect.width/scale,-l.rx*4,l.rx*4);mapView.z=sat(d.z-(e.clientY-d.my)*h/rect.height/scale,-l.rz*4,l.rz*4);chart();};
 c.onpointerup=e=>{const d=c.dragStart;c.dragStart=null;if(!d||Math.hypot(e.clientX-d.mx,e.clientY-d.my)>5)return;
  const rect=c.getBoundingClientRect(),x=(e.clientX-rect.left)*w/rect.width,z=(e.clientY-rect.top)*h/rect.height;
  const pin=pins.find(p=>Math.hypot(p.x-x,p.z-z)<16);if(pin)document.querySelector('[data-do="go|'+pin.id+'"]')?.focus();};
 c.onlostpointercapture=()=>{c.dragStart=null;};
}
