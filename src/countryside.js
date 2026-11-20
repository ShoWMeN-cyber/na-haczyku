// The paper map and the landscape share world coordinates, including the bends in the trail.
const hinterlandTypes = [
 ["birch","hay","orchard","birch","hay","orchard","birch","hay"],
 ["alder","marsh","meadow","alder","marsh","alder","meadow","marsh"],
 ["spruce","scree","spruce","pasture","spruce","scree","spruce","pasture"]
];
const hinterlandNames = {
 birch:"Brzezina",hay:"Pola żyta",orchard:"Stary sad",alder:"Olszyna",marsh:"Mokradła",meadow:"Wilgotne łąki",
 spruce:"Bór świerkowy",scree:"Piarg",pasture:"Hala"
};
const mapTints={birch:"#a5b488",hay:"#d5bd83",orchard:"#b2bb86",alder:"#91a78d",marsh:"#acc2a5",meadow:"#c0c899",spruce:"#8daba0",scree:"#b5b3a5",pasture:"#b7bf92"};
const trailNames=["Droga między polami","Grobla olszowa","Ścieżka pod granią"];
const countrysideCache=new Map();
const trailRadius=a=>3.13+.13*Math.sin(3*a+lake().phase)+.10*Math.cos(5*a);
const terrainColors={birch:0x839260,orchard:0x92a261,alder:0x78885c,marsh:0x979761,meadow:0xa1ab6e,spruce:0x647b63,scree:0x94978b,pasture:0x98a06b,hay:0xc5b16f};
const parcelSites=[
 [[.31,2.52,29,14],[.91,2.58,18,10],[1.88,2.42,23,13],[2.75,2.66,35,17],[3.38,2.14,20,13],[4.23,2.08,15,12],[4.83,2.76,34,18],[5.64,2.31,23,12]],
 [[.22,2.20,26,13],[1.18,2.60,24,10],[2.17,2.53,29,12],[2.84,2.22,31,13],[3.41,2.46,34,15],[4.07,2.19,23,12],[4.90,2.58,22,11],[5.81,2.12,25,13]],
 [[.40,2.46,28,16],[1.09,2.27,17,11],[1.86,2.44,21,15],[2.61,2.17,18,10],[3.43,2.51,28,14],[4.11,2.42,24,11],[4.74,2.61,25,15],[5.72,2.20,18,12]]
];
function countrysideGround(x,z,original,sector){
 for(const p of countryside().patches){
  const dx=x-p.center.x,dz=z-p.center.z;if(Math.abs(dx)>p.w+p.h||Math.abs(dz)>p.w+p.h)continue;
  const u=(dx*p.cos+dz*p.sin)/p.w,v=(-dx*p.sin+dz*p.cos)/p.h;
  if(Math.abs(u)**p.power+Math.abs(v)**p.power>1)continue;
  return p.type==="hay"&&sector%4===0?0xbba66b:terrainColors[p.type];
 }
 return original;
}
function countryside(){
 if(countrysideCache.has(life.lake))return countrysideCache.get(life.lake);
 const l=lake(),rand=seeded(59121+l.seed),point=(a,r)=>{const [x,z]=polar(l,a,r);return {x,z};};

 const trail=Array.from({length:193},(_,i)=>{const a=i*TAU/192;return point(a,trailRadius(a));});
 const town=townSite(),gate={x:town.x+19,z:town.z-2};
 const junction=trail.slice(0,49).reduce((best,p)=>p.x>=gate.x&&Math.hypot(p.x-gate.x,p.z-gate.z)<Math.hypot(best.x-gate.x,best.z-gate.z)?p:best,trail[0]);
 const lane=[{x:town.x,z:gate.z},gate,{x:lerp(gate.x,junction.x,.55),z:lerp(gate.z,junction.z,.32)},junction];
 const patches=[],trees=[],props=[];
 for(let i=0;i<8;i++){
  const type=hinterlandTypes[life.lake][i],[a,r,w,h]=parcelSites[life.lake][i],center=point(a,r);
  const angle=a+1.22+.51*Math.sin(i*1.7+l.phase),cos=Math.cos(angle),sin=Math.sin(angle);
  const power=type==="hay"||type==="orchard"?5:2;
  const worldPoint=(u,v)=>({x:center.x+u*w*cos-v*h*sin,z:center.z+u*w*sin+v*h*cos});
  const rim=Array.from({length:44},(_,j)=>{const b=j*TAU/44,k=power===2?1+.09*Math.sin(3*b+i)+.06*Math.cos(5*b+.7*i):1;
   const edge=n=>Math.sign(n)*Math.abs(n)**(2/power)*k;return worldPoint(edge(Math.cos(b)),edge(Math.sin(b)));});
  patches.push({type,center,w,h,cos,sin,power,rim});
  for(let j=0;j<80;j++){
   const u=rand()*2-1,vv=rand()*2-1;if(Math.abs(u)**power+Math.abs(vv)**power>.92)continue;
   const p=worldPoint(u,vv);if(ratio(p.x,p.z)<1.2||nearTrail(p,trail,2.4))continue;
   if(inTownClearing(p.x,p.z)||innClearing(p.x,p.z,{restaurant:innSite()})||nearTrail(p,lane,3.5))continue;
   if(["birch","alder","spruce"].includes(type))trees.push({...p,type,size:.6+rand()*.8,variant:j%4});
   else if(j<18)props.push({...p,type,size:.72+rand()*.48,angle:a+j*.41});
  }
 }
 // A broken, layered tree line encloses the entire playable area, also behind open fields.
 for(let i=0;i<480;i++){
  const a=(i+rand())*TAU/480,r=3.60+rand()*.52+.12*Math.sin(a*7)+.08*Math.cos(a*3),p=point(a,r);
  if(inTownClearing(p.x,p.z)||nearTrail(p,lane,3))continue;
  trees.push({...p,type:["birch","alder","spruce"][life.lake],size:.6+rand()*.82,variant:i%4});
 }
 const result={trail,lane,patches,trees,props};countrysideCache.set(life.lake,result);return result;
}
function nearTrail(p,path,width){
 for(let i=1;i<path.length;i++){
  const a=path[i-1],b=path[i],dx=b.x-a.x,dz=b.z-a.z,t=sat(((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz||1));
  if(Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz)<width)return true;
 }
 return false;
}
function addCountryside(m){
 const {trail,lane,props}=countryside();
 m.at(0,0,0);
 function road(points,halfWidth){
  let prev;
  points.forEach((p,i)=>{
   const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],len=Math.hypot(b.x-a.x,b.z-a.z)||1;
   const edges=[-1,1].map(k=>{const x=p.x-k*(b.z-a.z)*halfWidth/len,z=p.z+k*(b.x-a.x)*halfWidth/len;return [x,landY(x,z)+.13,z];});
   if(prev)m.quad(prev[0],edges[0],edges[1],prev[1],life.lake===2?0xaa9d82:0xc4b38d);
   prev=edges;
  });
 }
 road(trail,1.05);
 const approach=[];lane.slice(1).forEach((b,i)=>{const a=lane[i],n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/2);for(let j=0;j<n;j++)approach.push({x:lerp(a.x,b.x,j/n),z:lerp(a.z,b.z,j/n)});});approach.push(lane.at(-1));road(approach,1.12);
 for(const p of props){
  const {x,z,type,size:s}=p;m.at(x,landY(x,z)-.05,z,p.angle);
  if(type==="orchard"){m.pole([0,0,0],[.1,1.85*s,0],.17*s,.11*s,0x725a44);for(let j=0;j<3;j++){const a=j*2.1;m.oval(Math.cos(a)*.7*s,(2.05+j*.18)*s,Math.sin(a)*.7*s,1.20*s,1.03*s,1.17*s,j%2?0x788a4a:0x677e44,6);}}
  else if(type==="hay"){m.pole([-.73*s,.83*s,0],[.73*s,.83*s,0],.82*s,.82*s,0xb69a59,10);for(const k of [-.42,.42])m.pole([k*s,.83*s,0],[(k+.036)*s,.83*s,0],.831*s,.831*s,0x948153,10);}
  else if(type==="scree")m.oval(0,.32*s,0,1.66*s,.91*s,1.28*s,0x91938b,7);
  else if(type==="marsh"||type==="meadow"){for(let j=0;j<18;j++){let a=j*2.4,dx=Math.cos(a)*j*.09,dz=Math.sin(a)*j*.09;m.tri([dx-.065,0,dz],[dx+.08,0,dz],[dx+.22,s*(.53+j%6*.12),dz+.18],j%2?0x8c9357:0x79834e);}}
  else if(type==="pasture"){for(const dx of [-1.8,0,1.8])m.pole([dx,-.35,0],[dx,1.12,0],.08,.065,0x806c51);for(const h of [.42,.84])m.pole([-1.85,h,0],[1.85,h,0],.046,.046,0x9c8968);}
 }
 for(let i=0;i<192;i+=8){
  const p=trail[i],q=trail[i+1],len=Math.hypot(q.x-p.x,q.z-p.z)||1,x=p.x+(q.z-p.z)*1.55/len,z=p.z-(q.x-p.x)*1.55/len;
  m.at(x,landY(x,z)-.14,z);m.box(0,0,0,.20,1.55,.21,0x81694b);m.box(0,1.12,0,.211,.30,.221,0xe7dbb5);m.box(0,1.22,0,.214,.095,.224,[0x9a6544,0x507854,0x5b7888][life.lake]);
 }
 m.at(0,0,0);
}
function drawCountryside(g,px,pz,scale){
 const world=countryside();
 const line=(pts,close=false)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(px(p.x),pz(p.z)):g.moveTo(px(p.x),pz(p.z)));if(close)g.closePath();};
 for(const patch of world.patches){
  line(patch.rim,true);g.fillStyle=mapTints[patch.type];g.fill();
  if(patch.type==="hay"||patch.type==="orchard"){
   g.save();g.clip();g.strokeStyle=patch.type==="hay"?"#aa925e90":"#81966194";g.lineWidth=1;
   for(let j=-patch.h;j<patch.h;j+=3.4){
    const row=[-1,1].map(k=>({x:patch.center.x+k*patch.w*patch.cos-j*patch.sin,z:patch.center.z+k*patch.w*patch.sin+j*patch.cos}));
    line(row);g.stroke();
   }g.restore();
  }
 }
 for(const t of [...(world.nearTrees||[]),...world.trees]){
  const x=px(t.x),y=pz(t.z),r=Math.min(4.4,Math.max(.9,scale*1.28))*t.size;
  g.fillStyle=t.type==="spruce"?"#587f70aa":"#708d63a0";g.beginPath();
  if(t.type==="spruce"){g.moveTo(x,y-r*1.5);g.lineTo(x+r,y+r);g.lineTo(x-r,y+r);g.closePath();}
  else g.arc(x,y,r,0,TAU);g.fill();
 }
 for(const p of world.props){const x=px(p.x),y=pz(p.z);g.fillStyle=p.type==="scree"?"#919388":p.type==="orchard"?"#748850":p.type==="hay"?"#ad955c":"#8d9e73";g.fillRect(x,y,Math.max(1,scale*1.4),Math.max(1,scale*.7));}
 for(const path of [world.trail,world.lane]){line(path);g.strokeStyle="#8e7658";g.lineWidth=3.3;g.stroke();g.strokeStyle="#f1deac";g.lineWidth=1.7;g.stroke();}
}
function labelCountryside(g,px,pz,w,h){
 const used=[],positions=[2,4,6,0,3,7];g.save();g.font="italic 13px Georgia";g.textAlign="center";g.lineWidth=3;g.strokeStyle="#ede7c9";g.fillStyle="#3e594b";
 for(const i of positions){const {type,center}=countryside().patches[i],label=ui(hinterlandNames[type]),x=px(center.x),y=pz(center.z);
  if(x<64||x>w-64||y<35||y>h-30||used.some(p=>Math.abs(p.x-x)<105&&Math.abs(p.y-y)<17))continue;
  g.strokeText(label,x,y);g.fillText(label,x,y);used.push({x,y});}
 g.restore();
}
