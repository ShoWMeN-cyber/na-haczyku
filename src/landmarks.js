const reedIslands=[
 {x:-22,z:6,rx:6.9,rz:2.9},{x:18,z:6,rx:6.8,rz:3.7},
 {x:6,z:-15,rx:5.8,rz:3.4},{x:-39,z:-10,rx:4.9,rz:3.1}
];
const islandEdge=a=>1+.068*Math.sin(3*a)+.057*Math.cos(5*a+.7);
function lakeWater(x,z,margin=0){
 if(ratio(x,z)>=1-margin/lake().rz)return false;
 if(life.lake===2&&z<=-.77*lake().rz+margin+.9)return false;
 if(life.lake!==1)return true;
 return !reedIslands.some(p=>{
  const u=(x-p.x)/(p.rx+margin),v=(z-p.z)/(p.rz+margin);
  return Math.hypot(u,v)<islandEdge(Math.atan2(v,u));
 });
}
function backdrop(m,rnd){
 const marsh=life.lake===1;
 for(let band=0;band<2;band++){
  const count=100,ring=[];
  for(let i=0;i<count;i++){
   const a=i*TAU/count,shoreRadius=1/ratio(Math.cos(a),Math.sin(a));
   const r=Math.max(235,4.05*shoreRadius/.81)+band*39+7*Math.sin(5*a+band);
   const h=marsh?2.6+band*1.8+1.7*Math.sin(a*4):
    6+band*3.8+3.6*Math.sin(3*a+band)+1.3*Math.cos(7*a);
   ring.push([Math.cos(a)*r,h,Math.sin(a)*r]);
  }
  for(let i=0;i<count;i++){
   const a=ring[i],b=ring[(i+1)%count],foot=p=>[p[0]*.81,-.20,p[2]*.81],mid=p=>[p[0]*.93,p[1]*.58,p[2]*.93];
   const color=(marsh?[0x87926f,0xa6a786]:[0x85976b,0x95a583])[band];
   m.quad(foot(a),mid(a),mid(b),foot(b),color,.94+.06*Math.sin(i*.28));
   m.tri(mid(a),a,b,color,.95+.075*Math.sin(i*.35));m.tri(mid(a),b,mid(b),color,.96+.07*Math.cos(i*.32));
  }
 }
}
function boathouse(m,x,z,angle,width){
 const y=landY(x,z)-.17,w=width,d=w*.91,h=2.5;
 m.at(x,y,z,angle);m.box(0,-.75,0,w+.25,1.02,d+.2,0x8f8d79);
 for(let j=0;j<10;j++)m.box(0,.27+j*.24,0,w,.238,d,j%3===0?0xa94737:0xb85c43);
 const roof=0x6b5648,peak=h+1.73;
 for(const k of [-1,1]){
  const tip=[0,peak,-d*.59],back=[0,peak,d*.59];
  m.quad([k*w*.57,h,-d*.59],tip,back,[k*w*.57,h,d*.59],roof);
  m.tri([-w*.5,h,k*d*.505],[w*.5,h,k*d*.505],[0,peak,k*d*.505],0xc6875e);
 }
 for(const k of [-1,1]){
  m.box(k*w*.2,.28,d*.51,w*.38,2.1,.12,0xf1e2bd);
  for(let i=-2;i<3;i++)m.box(k*w*.2+i*.25,.30,d*.535,.021,2.02,.02,0xb3a98b);
  m.box(k*w*.43,.28,d*.522,.15,2.31,.14,0xe3d7b4);
 }
 m.box(0,2.42,d*.526,w*.94,.16,.13,0xe6d8b3);
}
function lookout(m,x,z){
 m.at(x,.36,z,.1);
 for(const k of [-1,1])for(const f of [-1,1]){
  m.pole([k*1.33,-.8,f*1.33],[k*.98,6.10,f*.98],.145,.104,0x81674b,8);
 }
 for(const k of [-1,1]){
  for(const f of [-1,1]){
   m.pole([k*1.23,.40,f*1.16],[k*1.06,3.65,-f*1.06],.076,.075,0x8f7654,5);
   m.pole([k*1.20,.45,f*1.20],[-k*1.04,3.69,f*1.04],.071,.071,0x977b55,5);
  }
  m.box(k*1.2,3.87,0,.10,1.0,2.42,0x8d795a);
  m.box(0,3.87,k*1.2,2.42,1.0,.10,0x987f5e);
 }
 m.box(0,3.67,0,2.75,.2,2.76,0x655a47);
 for(let i=0;i<12;i++)m.box(0,.26*i+.15,-2.63+i*.135,.84,.11,.24,0x977e5e);
 for(let i=0;i<4;i++){let a=i*TAU/4+Math.PI/4,b=a+TAU/4;m.tri([Math.cos(a)*2.39,6.08,Math.sin(a)*2.39],[0,7.38,0],[Math.cos(b)*2.39,6.08,Math.sin(b)*2.39],0x596357,.93+i*.025);}
}
function marshScenery(m,rnd){
 for(const p of reedIslands){
  m.at(p.x,0,p.z);
  for(let i=0;i<42;i++){
   const pt=(j,r,y)=>{const a=j*TAU/42,k=islandEdge(a)*r;return [p.rx*k*Math.cos(a),y,p.rz*k*Math.sin(a)];};
   m.quad(pt(i,1,-.15),pt(i,.91,.22),pt(i+1,.91,.22),pt(i+1,1,-.15),0x887d50);
   m.tri([0,.35,0],pt(i+1,.91,.22),pt(i,.91,.22),0x9a9256);
  }
  for(let i=0;i<390;i++){
   const a=rnd()*TAU,r=Math.sqrt(rnd())*1.09,x=p.rx*r*Math.cos(a),z=p.rz*r*Math.sin(a);
   if(p===reedIslands[2]&&Math.abs(x)<1.65&&Math.abs(z)<1.65)continue;
   const h=.75+rnd()*1.26,base=r>.96?.01:.24,lean=(rnd()-.45)*.36,color=[0x9c984e,0xb9a45a,0x868644,0xb6a867][i%4];
   m.wind=.74;
   m.tri([x-.055,base,z],[x+.059,base,z],[x+lean,h,z+.16],color);
   m.tri([x,base,z-.049],[x,base,z+.05],[x+.22,h*.78,z+.23],color,.9);
   if(i%9===0){m.pole([x,base,z],[x+lean,h+.16,z+.075],.018,.009,0xa58a4d,4);m.oval(x+lean,h+.22,z+.075,.055,.17,.057,0xa98a58,5);}
   m.wind=0;
  }
 }
 lookout(m,reedIslands[2].x,reedIslands[2].z);
}
function reservoirDam(m){
 const z=-.77*lake().rz;
 let left=0,right=0;
 while(ratio(left,z)<1.055)left-=.5;
 while(ratio(right,z)<1.055)right+=.5;
 m.at(0,0,0);const span=right-left,mid=(left+right)/2,concrete=0x999b88;
 m.box(mid,-.62,z,span,5.9,1.55,concrete);m.box(mid,5.26,z,span+.35,.23,2.22,0x737765);
 for(let x=left+.25;x<right;x+=2.1){
  m.pole([x,5.48,z+.83],[x,6.24,z+.83],.036,.036,0x485656,5);
  if(x+2.1<right)m.pole([x,6.21,z+.83],[x+2.1,6.21,z+.83],.032,.032,0x4f6060,5);
 }
 for(let x=left+1;x<right-1;x+=3.9){
  m.quad([x-.22,0,z+2.36],[x-.22,5.22,z+.76],[x+.22,5.22,z+.76],[x+.22,0,z+2.36],0x828675);
  m.tri([x-.22,0,z+.69],[x-.22,5.22,z+.76],[x-.22,0,z+2.36],0x787e71);
 }
 const tower=mid-span*.18;m.box(tower,-.2,z+.5,3.2,8.1,2.75,0x9e9f8e);m.box(tower,7.65,z+.6,3.58,.48,3.1,0x626c66);
 for(let j=-1;j<=1;j++)m.box(tower+j*.86,6.74,z+1.90,.66,.61,.06,0x465b60);
}
function storkNest(m,p){
 const x=p.x-7.75,z=p.z-2.1,rnd=seeded(1519);
 m.at(x,landY(x,z)-.09,z,-.48);m.pole([0,0,0],[0,5.17,0],.133,.103,0x8c816a,8);
 m.box(0,4.91,0,1.07,.10,.84,0x655e4c);m.oval(0,5.13,0,.76,.225,.72,0x67583e,10);
 for(let i=0;i<72;i++){
  const a=rnd()*TAU,l=.6+rnd()*.28,y=5.14+rnd()*.23,d=.51+rnd()*.84;
  m.pole([Math.cos(a)*l,y,Math.sin(a)*l],[Math.cos(a+d)*l,y-.056+rnd()*.1,Math.sin(a+d)*l],.013,.012,i%3?0x827051:0x5a4a37,4);
 }
 for(const k of [-1,1])m.pole([k*.061,5.28,.014],[k*.064,5.74,0],.022,.019,0xa15e43,5);
 m.oval(0,5.78,.006,.148,.173,.314,0xe2dfcf,9);
 for(const k of [-1,1])m.oval(k*.087,5.79,.115,.086,.126,.243,0x42453f,7);
 m.pole([0,5.78,-.17],[0,6.13,-.208],.083,.054,0xe5dfcf,8);
 m.oval(0,6.13,-.231,.071,.074,.09,0xe3ded0,7);m.pole([0,6.12,-.29],[0,6.10,-.52],.034,.003,0xb55f45,5);
}
function addLandmarks(m){
 const l=lake();m.at(0,0,0);m.material=0;
 if(life.lake===0){
  for(const [a,size] of [[4.60,5.3],[4.77,5.0],[5.04,3.7]]){
   const [x,z]=polar(l,a,1.075);boathouse(m,x,z,.13,size);
  }
 }else if(life.lake===1)marshScenery(m,seeded(8862));
 else reservoirDam(m);
 if(life.lake<2)storkNest(m,village().restaurant);
 m.at(0,0,0);
}
