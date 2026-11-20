// Small groups share soil, scale and colour. Open space around paths and the boat stays navigable.
function addUndergrowth(m,v){
 const l=lake(),rnd=seeded(591+l.seed*37);
 const bushes=[[0x4b683b,0x637f47,0x758e4e],[0x505f3c,0x718447,0x879357],[0x415e4b,0x5e7851,0x79915e]][life.lake];
 function isPath(x,z){
  if(inTownClearing(x,z)||innClearing(x,z,v))return true;
  if(Math.abs(x)<3.4&&z>v.tip)return true;
  for(const key of ["home","restaurant","camp"]){const p=v[key];if(Math.hypot(p.x-x,p.z-z)<(key==="restaurant"?7.1:5.1))return true;}
  return false;
 }
 function shrub(x,z,size){
  if(isPath(x,z))return;
  m.at(x,landY(x,z)-.02,z,rnd()*TAU);
  const sprays=3+Math.floor(rnd()*3);
  m.wind=.24;
  for(let i=0;i<sprays;i++){
   let a=i*2.4+size,reach=size*(.22+rnd()*.46),dx=Math.cos(a)*reach,dz=Math.sin(a)*reach,h=size*(.5+rnd()*.48);
   m.pole([0,.04,0],[dx,h*.9,dz],size*.035,.015,0x6f664c,4);
   m.oval(dx,h*.64,dz,size*.48,h*.58,size*.49,bushes[i%3],6);
  }
  m.wind=0;
 }
 for(let i=0;i<125;i++){
  const angle=rnd()*TAU,ratio=1.028+rnd()**1.52*.47,[x,z]=polar(l,angle,ratio);
  const size=.42+rnd()**1.15*1.12;
  shrub(x,z,size);
  if(i%3===0)shrub(x+size*1.1,z+size*.39,size*.75);
 }
 // Willows overhang the shallows. The split trunks and trailing sprays break up the forest edge.
 for(const a of (life.lake===2?[2.35]:life.lake===0?[.15,2.53,3.34]:[.15,.69,1.02,2.53,3.34,4.18,5.0,5.76])){
  const [x,z]=polar(l,a,1.044);if(isPath(x,z))continue;
  m.at(x,landY(x,z),z,a);const h=3.6+rnd()*1.4;
  m.pole([0,0,0],[-.38,h*.63,.12],.31,.17,0x756e55,7);
  for(let i=0;i<5;i++){
   const rad=i*TAU/5+.32,dx=-.49+Math.cos(rad)*1.13,dz=Math.sin(rad)*1.12;
   m.pole([-.19,h*.43,.05],[dx,h*.84,dz],.155,.072,0x726e55,5);
   m.wind=.18;m.oval(dx,h*.89,dz,1.39,1.13,1.32,[0x788a53,0x86985e,0x92a066][i%3],7);
   for(let j=0;j<10;j++){let theta=rnd()*TAU,sx=dx+Math.cos(theta)*1.17,sz=dz+Math.sin(theta)*1.16,top=h*.95,base=h*(.39+rnd()*.23);
    m.tri([sx-.14,top,sz],[sx+.11,top,sz],[sx+Math.sin(theta)*.16,base,sz+.14],i%2?0x859458:0x74884f);
   }
   m.wind=0;
  }
 }
 function reedBed(x,z,radius,count){
  for(let i=0;i<count;i++){
   const a=rnd()*TAU,dist=Math.sqrt(rnd())*radius,px=x+Math.cos(a)*dist,pz=z+Math.sin(a)*dist*.68;
   if(Math.abs(px)<2.55&&pz>v.tip-1.2)continue;
   const h=.62+rnd()*.93,base=Math.max(-.06,landY(px,pz)-.04),lean=(rnd()-.5)*.20;
   m.at(px,base,pz,rnd()*TAU);m.wind=.77;
   for(let j=0;j<3;j++){
    const theta=j*2.12,dx=Math.sin(theta),dz=Math.cos(theta),height=h*(.52+j*.145),bend=.32+rnd()*.18;
    const mid=[dx*bend*.37,height*.68,dz*bend*.37],end=[dx*bend,height,dz*bend],width=.034+rnd()*.021;
    const L=[mid[0]+dz*width,mid[1],mid[2]-dx*width],Q=[mid[0]-dz*width,mid[1],mid[2]+dx*width],c=[0x718848,0x95a257,0x839a50][j];
    m.tri([0,.02,0],L,Q,c,.89);m.tri(L,end,Q,c,1.08);
   }
   if(i%4===0){
    const top=[lean,h+.15,.07];m.pole([0,0,0],top,.019,.012,0xa29757,4);
    m.pole([lean*.82,h*.76,.056],[lean*.96,h*.98,.067],.041,.038,0x775735,5);
   }
   m.wind=0;
  }
 }
 for(let i=0;i<[22,68,4][life.lake];i++){let [x,z]=polar(l,rnd()*TAU,.938+rnd()*.061);reedBed(x,z,1+rnd()*1.75,13+Math.floor(rnd()*16));}
 if(life.lake===0)reedBed(-4.2,v.tip-.5,.95,18);
 if(life.lake===1){reedBed(-3.9,v.tip-1.2,1.83,62);reedBed(5.36,v.tip-4.4,2.2,77);reedBed(8.1,v.tip-7.2,1.83,45);}
 for(let i=0;i<[37,165,0][life.lake];i++){
  const cluster=i%3,px=[-4.4,6.85,-8.5][cluster]+(rnd()-.5)*4,pz=v.tip-[4,9,10][cluster]+(rnd()-.5)*3.6;
  m.at(px,.024+rnd()*.006,pz,rnd()*TAU);
  const sz=.076+rnd()*.119;
  for(let j=0;j<7;j++){let a=.38+j*TAU/8,b=a+TAU/8;m.tri([0,0,0],[Math.cos(b)*sz,0,Math.sin(b)*sz],[Math.cos(a)*sz,0,Math.sin(a)*sz],j%3?0x789154:0x83975f);}
  if(i%19===0)for(let j=0;j<5;j++){const a=j*TAU/5;m.oval(Math.cos(a)*.036,.024,Math.sin(a)*.036,.042,.043,.039,0xe7dcb4,5);}
 }
 // A few fallen branches, ferns and flowers make the walk between buildings readable at eye level.
 for(let i=0;i<210;i++){
  const [x,z]=polar(l,rnd()*TAU,1.055+rnd()*.20);if(isPath(x,z))continue;
  m.at(x,landY(x,z),z,rnd()*TAU);
  if(i%20===0){
   const len=1.25+rnd()*1.34;m.pole([-len*.5,.21,.07],[len*.5,.13,0],.16,.10,0x71674c,7);
   m.pole([len*.13,.16,0],[len*.31,.36,.36],.056,.016,0x81745a,5);
  }else{
   m.wind=.8;
   for(let j=0;j<6;j++){const a=j*TAU/6,s=.19+rnd()*.27,dx=Math.cos(a)*s,dz=Math.sin(a)*s;
    m.tri([0,0,0],[dx*.48+.045,s*.8,dz*.48],[dx,s*.73,dz],j%2?0x64804a:0x859652);
    if(i%8===0)m.oval(dx,s*.76,dz,.045,.038,.047,i%3?0xd9b969:0xd9d2bb,5);
   }m.wind=0;
  }
 }
 m.at(0,0,0);
}

const birdPoses=new Map();
function flyingBird(scene,x,y,z,heading,size,flap,color,swallow=false){
 const step=Math.round(flap*6),key=color+"/"+step;
 let m=birdPoses.get(key);
 if(!m){m=birdPose(step/6,color,swallow);m.data=new Float32Array(m.data);birdPoses.set(key,m);}
 scene.instance(m,x,y,z,heading,size);
}
function birdPose(flap,color,swallow){
 const m=new Geometry(),s=1,body=swallow?0x394949:0xdedcd0;
 m.oval(0,0,0,.093*s,.096*s,.33*s,body,6);
 m.oval(0,.053*s,-.243*s,.073*s,.089*s,.105*s,body,6);
 m.pole([0,.048*s,-.285*s],[0,.039*s,-.42*s],.043*s,.002*s,swallow?0x444440:0xc39c59,4);
 for(const sign of [-1,1]){
  const root=[sign*.044*s,.026*s,-.07*s],rear=[sign*.052*s,.005,.18*s],elbow=[sign*.51*s,flap*.26*s+.06*s,-.16*s],joint=[sign*.55*s,flap*.25*s,.085*s];
  const tip=[sign*(swallow?.86:1.07)*s,(flap*.48+.052)*s,(swallow?.28:.19)*s];
  m.quad(root,elbow,joint,rear,color);
  m.tri(elbow,tip,joint,swallow?0x2f4243:0x667475);
  m.tri([0,0,.2*s],[sign*.13*s,.018*s,(swallow?.65:.49)*s],[sign*.03*s,.018*s,.32*s],color);
 }
 return m;
}
function drawWildlife(m,t){
 const l=lake(),night=period(life.time)==="noc";
 if(!night){
  for(let i=0;i<5;i++){
   const a=t*(.097+i*.008)+i*1.19+.78,rx=13+i*1.8,rz=7+i*.89;
   const x=Math.cos(a)*rx+Math.sin(i*2)*7,z=v.tip-24+Math.sin(a)*rz-i*.9;
   const heading=Math.atan2(-Math.sin(a)*rx,-Math.cos(a)*rz),y=4.9+i*.62+Math.sin(a*1.7+i)*.68;
   const flap=Math.sin(t*5.4+i)*sat((Math.sin(t*.53+i)+.35)*1.2)+.17;
   flyingBird(m,x,y,z,heading,.78+i*.035,flap,i%2?0xc1c8bd:0xe3dfcf);
  }
  for(let i=0;i<3;i++){
   const a=t*.21+i*2.2,x=-9+Math.cos(a)*12,z=v.tip-11+Math.sin(a*1.1)*5;
   const y=1.15+1.4*(.5+.5*Math.cos(a*2+i));flyingBird(m,x,y,z,Math.atan2(-12*Math.sin(a),-5.5*Math.cos(a*1.1)),.44,Math.sin(t*12+i),0x465553,true);
  }
  const hx=5.41,hz=v.tip-5.05,nod=Math.sin(t*.70)*.045+Math.max(0,Math.sin(t*.28))**16*.26;
  m.at(hx,0,hz,-.78);
  for(const k of [-1,1]){m.pole([k*.072,-.06,k*.063],[k*.08,.52,k*.02],.023,.023,0x77745b,4);}
  m.oval(0,.59,0,.155,.192,.36,0xa1ada5,7);
  m.oval(.08,.62,.08,.107,.133,.29,0x748680,6);
  m.pole([0,.63,-.17],[.015,.89-nod*.55,-.36-nod],.085,.062,0xbeccbf,5);
  m.pole([.015,.89-nod*.55,-.36-nod],[0,1.05-nod,-.26-nod*1.35],.060,.049,0xc1c8b9,5);
  m.oval(0,1.045-nod,-.31-nod*1.35,.077,.078,.13,0xaab9ab,6);
  m.pole([0,1.047-nod,-.39-nod*1.35],[0,1.022-nod,-.66-nod*1.35],.039,.002,0xbf9d52,5);
 }
 // Fish break the surface in different parts of the lake. The same feeding schedule drives the atlas and the catch.
 for(let i=0;i<3;i++){
  const cycle=(t+i*6.3)%(13.6+i*2.7);
  if(cycle>2.15)continue;
  const a=t*.016+1.18+i*1.87,x=Math.cos(a)*l.rx*.40,z=Math.sin(a)*l.rz*.40;
  const available=eligibleFish(1-ratio(x,z),true);if(!available.length)continue;
  if(cycle<.66){
   const u=cycle/.66;swimmingFish(m,available[i%available.length],x+u*.76,Math.sin(u*Math.PI)*.39-.07,z+u*.16,-1.32,.50,t);
  }else{m.at(0,0,0);m.ring(x+.76,.028,z+.16,.084+(cycle-.66)*.67,.014,0x93b7ab);}
 }
 m.at(0,0,0);
}
