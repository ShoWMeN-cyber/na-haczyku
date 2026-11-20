const residents=[
 {coat:0xa46048,pants:0x505a5c,hair:0x523f31,height:.97,route:"pier",offset:3,pack:false},
 {coat:0x738490,pants:0x5a5950,hair:0x5d5147,height:1.02,route:"market",offset:12,pack:true},
 {coat:0xb69560,pants:0x54616b,hair:0x79624a,height:.96,route:"camp",offset:2,pack:true},
 {coat:0x797953,pants:0x4d5758,hair:0x674e3b,height:1.04,route:"pair",offset:19,pack:false},
 {coat:0x935e6c,pants:0x535960,hair:0x453c32,height:.94,route:"pair",offset:19,pack:false},
 {coat:0x668b81,pants:0x746556,hair:0xa0937d,height:1.0,route:"far",offset:8,pack:false}
];
function trailPoint(angle,offset=0){
 const [x,z]=polar(lake(),angle,1.055+.008*Math.sin(angle*9)+offset/lake().rx);
 return {x,z,y:landY(x,z)};
}
const routeCache=new Map();
function footRoute(key){
 const cacheKey=life.lake+"/"+key;
 if(routeCache.has(cacheKey))return routeCache.get(cacheKey);
 if(key==="town"){
  const route=footRoute("restaurant").slice(0,33),lane=townLane();
  for(let i=1;i<lane.length;i++){const a=lane[i-1],b=lane[i],steps=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/1.35);
   for(let j=1;j<=steps;j++)route.push({x:lerp(a.x,b.x,j/steps),z:lerp(a.z,b.z,j/steps)});}
  routeCache.set(cacheKey,route);return route;
 }
 const inn=key==="restaurant",v=village(),end=v[key],angle=inn?1.25:1.90;
 const route=[{x:0,z:v.tip+1},{x:0,z:v.shore+2}];
 for(let j=0;j<=12;j++)route.push(trailPoint(lerp(Math.PI/2,angle,j/12)));
 const start=route.at(-1);
 for(let j=1;j<=18;j++){const u=j/18;route.push({x:lerp(start.x,end.x,u)+(inn?1.3*Math.sin(u*Math.PI):0),z:lerp(start.z,end.z-(inn?10.75:2.95),u)});}
 if(inn)for(let z=-10;z< -2.5;z+=.6)route.push({x:end.x,z:end.z+z});
 routeCache.set(cacheKey,route);return route;
}
function routeStep(){
 const trail=footRoute(me.guide);let closest=0,min=Infinity;
 for(let j=0;j<trail.length;j++){const d=Math.hypot(trail[j].x-me.x,trail[j].z-me.z);if(d<min){min=d;closest=j;}}
 let next=closest;while(next<trail.length-1&&Math.hypot(trail[next].x-me.x,trail[next].z-me.z)<2.25)next++;
 return {trail,closest,next};
}
function drawRoute(m){
 if(!me.guide)return;
 const {trail,closest}=routeStep();m.at(0,0,0);
 let last=null;
 for(const p of trail.slice(closest)){if(last&&Math.hypot(p.x-last.x,p.z-last.z)<1.12)continue;
  const y=walkHeight(p.x,p.z);if(y===null)continue;
  m.ring(p.x,y+.079,p.z,.14,.053,0xf3c86c);last=p;
 }
}
function buildFootpaths(m){
 m.at(0,0,0);m.material=1;const rand=seeded(lake().seed*718+10);
 for(const [from,to] of [[.85,2.43],[3.48,4.83]]){
  let edge=null;
  for(let i=0;i<=105;i++){
   const angle=lerp(from,to,i/105),pair=[-.74,.74].map(w=>{const p=trailPoint(angle,w+rand()*.13);return [p.x,p.y+.041,p.z];});
   if(edge)m.quad(edge[0],pair[0],pair[1],edge[1],0xa89c79,.95+rand()*.072);
   edge=pair;
  }
 }
 for(const key of ["home","restaurant"]){
  let last=null;for(const p of footRoute(key).slice(14,33)){
   const edge=[-.90,.90].map(dx=>[p.x+dx,landY(p.x+dx,p.z)+.055,p.z]);
   if(last)m.quad(last[0],edge[0],edge[1],last[1],0xbba985);last=edge;
  }
 }
 m.material=0;
 const v=village(),x=2.58,z=v.shore+2.48;m.at(x,landY(x,z),z);
 m.box(0,0,0,.14,2.05,.14,0x725538);
 woodenSign(m,localInn().homeSign,1.25,-.09,.043);woodenSign(m,localInn().sign,1.65,-.09,.043);
 for(const [h,side] of [[1.36,-1],[1.76,1]]){
  m.tri([side*1.26,h,-.16],[side*.99,h+.10,-.16],[side*.99,h-.10,-.16],0xf5d99b);
 }
 m.at(0,0,0);
}
function pedestrianRoute(id,t){
 const r=residents[id],night=period(life.time)==="noc";
 const stops=r.route==="pier"?[7.5,4]:[4.2,3.5],span=r.route==="pier"?9.1:r.route==="far"?27:19;
 const duration=span/(night?.68:r.route==="pair"?.86:1.09),cycle=2*duration+stops[0]+stops[1],s=(t+r.offset)%cycle;
 const moving=s<duration||s>duration+stops[0]&&s<2*duration+stops[0],back=s>duration+stops[0];
 const u=s<duration?s/duration:s<duration+stops[0]?1:s<2*duration+stops[0]?1-(s-duration-stops[0])/duration:0;
 const pose=moving?Math.sin((u*span)*4.85+(id%2)*.47):0;
 if(r.route==="pier"){const x=-1.14,z=v.shore+1.5-u*span;return {x,z,y:.72,a:back?Math.PI:0,pose,stopped:!moving};}
 const limits={market:[.94,1.54],camp:[1.70,2.22],pair:[1.28,1.86],far:[3.52,4.60]},interval=limits[r.route];
 const a=lerp(interval[0],interval[1],u),offset=r.route==="pair"?(id===3?-.35:.35):0;
 const p=trailPoint(a,offset),q=trailPoint(a+(back?-.002:.002),offset);
 return {...p,a:Math.atan2(q.x-p.x,p.z-q.z),pose,stopped:!moving};
}
function pedestrianModel(person,pose,gesture,distant){
 const style=residents.indexOf(person),m=new Geometry(),skin=skinTones[style],foot=0x48443c;
 const bob=.028*Math.abs(pose),hip=.85+bob;
 m.distant=distant;m.oval(0,hip,.008,.19,.115,.135,person.pants,9);
 for(const k of [-1,1]){
  const swing=k*pose,knee=[k*.116,.43+bob+Math.max(0,swing)*.065,-swing*.14-.055],ankle=[k*.123,.107+Math.max(0,-swing)*.073,-swing*.245];
  m.pole([k*.119,hip,0],knee,.109,.086,person.pants,6);m.pole(knee,ankle,.087,.063,person.pants,6);
  m.oval(ankle[0],ankle[1]-.023,ankle[2]-.048,.083,.078,.146,foot,7);
  m.box(ankle[0],ankle[1]-.092,ankle[2]-.049,.136,.022,.203,0x383833);
 }
 personJacket(m,hip,person.coat,.217);personHead(m,hip,style,person.hair);
 if(person.pack){m.oval(0,hip+.25,.164,.155,.20,.09,0x6e6047);for(const k of [-1,1])m.pole([k*.125,hip+.10,-.086],[k*.16,hip+.47,-.081],.022,.026,0x5d5844,5);}
 for(const k of [-1,1]){
  let s=k*pose,el=[k*.259,hip+.19,s*.125],hand=[k*.248,hip-.023,s*.219-.045];
  if(gesture&&k===1){el=[.31,hip+.26,-.10];hand=[.13,hip+.68,-.17];}
  m.pole([k*.192,hip+.424,.008],el,.084,.07,person.coat,6);
  m.pole(el,hand,.069,.048,person.coat,6);m.oval(...hand,.053,.071,.05,skin,6);
  m.oval(hand[0]-k*.033,hand[1]+.007,hand[2]-.036,.021,.035,.021,skin,5);
  if(gesture&&k===1)m.box(.06,hip+.65,-.204,.12,.075,.045,0x44484a);
 }
 return m;
}
const poseCache=new Map();
function drawVillagers(m,t){
 drawDiners(m,t);
 const night=period(life.time)==="noc";
 for(let i=0;i<residents.length;i++){
  if(night&&i!==1&&i!==2)continue;
  const p=pedestrianRoute(i,t),r=residents[i],step=Math.round(p.pose*5),gesture=p.stopped&&i===0,distant=Math.hypot(p.x-me.x,p.z-me.z)>18,key=i+"/"+step+(gesture?"p":"")+(distant?"d":"");
  if(!poseCache.has(key)){const model=pedestrianModel(r,step/5,gesture,distant);model.data=new Float32Array(model.data);poseCache.set(key,model);}
  m.instance(poseCache.get(key),p.x,p.y,p.z,p.a,r.height);
  if(i===2){
   m.at(p.x,p.y,p.z,p.a);const w=Math.sin(t*7.2)*(p.stopped?0:1);
   m.oval(.69,.33,-.52,.106,.155,.30,0x927048,7);
   m.oval(.68,.49,-.74,.112,.13,.13,0x927048,7);
   m.oval(.68,.465,-.851,.067,.061,.087,0x816143,5);
   for(const s of [-1,1]){
    m.oval(.68+s*.103,.46,-.72,.037,.11,.057,0x684e39,5);
    for(const f of [-1,1])m.pole([.69+s*.065,.28,-.52+f*.16],[.69+s*.07,.04,-.52+f*.16+w*s*f*.066],.041,.032,0x826044,5);
   }
   m.pole([.69,.38,-.27],[.69+Math.sin(t*5)*.06,.54,-.07],.042,.023,0x896744,5);
   m.pole([.235,.86,-.035],[.49,.56,-.37],.012,.012,0x655b4c,4);
   m.pole([.49,.56,-.37],[.68,.48,-.67],.012,.012,0x655b4c,4);
  }
 }
 m.at(0,0,0);
}
function wake(m,x,z,heading,size,t){
 m.at(x,.034,z,heading);const color=0x98b5ac;
 for(const k of [-1,1])for(let i=0;i<6;i++){
  const s=i/6,e=(i+.72)/6,drift=.042*Math.sin(t*2+i);
  const a=[k*(.64+s*1.25)*size,0,(1.12+s*3.1+drift)*size],b=[k*(.64+e*1.25)*size,0,(1.12+e*3.1+drift)*size];
  m.quad(a,b,[b[0]+k*.036,0,b[2]],[a[0]+k*.042,0,a[2]],color,.91);
 }
}
