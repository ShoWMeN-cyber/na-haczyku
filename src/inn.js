const commonTable={x:-.72,z:-.52};
const tableChairs=[{x:-1.39,z:-1.54,a:Math.PI-.15},{x:-.03,z:-1.54,a:Math.PI+.15},{x:-.72,z:.49,a:0}];
const roomStart={x:0,z:2.65,seated:false};
let conversation={speaker:0,topic:"hello"},lastConversation="";

function innChair(m,p){
 m.at(p.x,0,p.z,p.a);
 m.box(0,.39,0,.47,.06,.46,0xa88154);
 for(const k of [-1,1])for(const f of [-1,1])m.box(k*.185,.005,f*.174,.052,f===1?.89:.39,.052,0x785837);
 m.box(0,.706,.19,.45,.067,.047,0x99734d);m.box(0,.835,.19,.45,.078,.046,0xa38359);
}
function mug(m,x,y,z,c){
 m.pole([x,y,z],[x,y+.108,z],.047,.058,c,12);
 m.pole([x,y+.107,z],[x,y+.111,z],.047,.047,0x493324,12);
 for(const [a,b] of [[[.04,.086],[.085,.085]],[[.085,.085],[.088,.04]],[[.088,.04],[.044,.033]]])
  m.pole([x+a[0],y+a[1],z],[x+b[0],y+b[1],z],.008,.008,c,5);
}
function roomWindow(m){
 const x=-1.31,z=-3.79,w=2.78,h=1.39,y=1.03;
 m.box(x,.0,z,w,y,.16,0xd5bc94);m.box(x,y+h,z,w,3-y-h,.16,0xd5bc94);
 for(const k of [-1,1])m.box(x+k*w*.5,y-.06,z,.106,h+.12,.20,0x73563c);
 for(const yy of [y,y+h])m.box(x,yy,z,w+.17,.083,.24,0x806344);
 m.box(x,y,z,.073,h,.17,0x8a7458);m.box(x,y+.82,z,w,.055,.14,0x8a7458);
 m.box(x,y-.075,z+.045,w+.34,.082,.39,0x9b7652);
 for(const k of [-1,1])for(let j=0;j<6;j++){
  const xx=x+k*(w/2-.044-j*.063);
  m.box(xx,1.38+j*.074,z+.075,.080,1.11-j*.074,.052,j%2?0xc1af87:0xe4d4ac);
 }
 const rnd=seeded(lake().seed);
 m.box(x,-1,-14,32,5,.13,0xbaccc0);m.box(x,.74,-11,23,.59,.12,lake().water);
 for(let i=0;i<28;i++){
  const xx=-10+i*.72,hh=.36+rnd()*(life.lake===2?1.32:.77);
  m.oval(xx,1.35+hh*.46,-10.7-rnd(),.55+rnd()*.46,hh,.35,life.lake===2?0x587768:0x74935c,7);
 }
}
function buildInnRoom(){
 const m=new Geometry(),cream=0xd5bc94,oak=0x775331,green=0x516a58;
 const plank=[0xa48057,0xb18d62,0xac895f,0xba976c];
 m.material=2;
 for(let i=0;i<35;i++)m.box(0,-.081,-3.75+i*.222,9.4,.08,.218,plank[(i*7+Math.floor(i/3))%4]);
 m.material=0;
 m.box(-4.71,0,0,.16,3.05,7.8,cream);m.box(4.71,0,0,.16,3.05,7.8,cream);m.box(0,0,3.85,9.5,3.05,.16,cream);
 m.box(-3.72,0,-3.79,2.04,3.05,.16,cream);m.box(2.38,0,-3.79,4.60,3.05,.16,cream);
 roomWindow(m);
 m.quad([-4.8,3,-3.91],[4.8,3,-3.91],[4.8,3,3.95],[-4.8,3,3.95],0xbd9d76);
 for(const z of [-3.35,-1.38,.58,2.56]){m.box(0,2.76,z,9.5,.23,.16,oak);m.quad([-4.7,2.761,z-.081],[-4.7,2.761,z+.081],[4.7,2.761,z+.081],[4.7,2.761,z-.081],oak);}
 for(const side of [-1,1]){
  m.box(side*4.58,0,0,.12,.75,7.68,green);m.box(side*4.55,.74,0,.16,.08,7.68,oak);
  for(let i=0;i<19;i++)m.box(side*4.50,.04,-3.65+i*.4,.035,.68,.028,0x637867);
 }
 m.box(0,0,-3.67,9.35,.76,.12,green);m.box(0,.75,-3.64,9.35,.08,.14,oak);
 for(let i=0;i<23;i++)m.box(-4.45+i*.4,.04,-3.595,.033,.67,.033,0x637867);
 m.box(0,0,3.72,1.45,2.26,.12,oak);m.box(0,.06,3.63,1.22,2.09,.075,0x886649);
 m.box(0,1.25,3.58,.76,.63,.045,0x9baea0);m.box(.46,1.02,3.56,.13,.046,.04,0xc9ac70);
 const {x,z}=commonTable;
 m.material=2;m.box(x,.735,z,2.68,.087,1.24,0xa37649);m.material=0;
 for(const k of [-1,1])for(const f of [-1,1])m.box(x+k*1.14,0,z+f*.46,.107,.74,.107,oak);
 m.box(x,.82,z,.48,.016,1.25,0xaa503c);
 for(let i=-4;i<=4;i++){m.box(x,.837,z+i*.146,.48,.003,.019,0xe5d4ac);}
 for(const xx of [-1.4,-.03,-.70]){const zz=xx===-.70?-.08:-.92;m.pole([xx,.823,zz],[xx,.835,zz],.113,.14,0xeee2c7,13);mug(m,xx+.18,.825,zz,xx< -1?0x456e6a:0xd6bc8f);}
 m.pole([x,.84,z],[x,.98,z],.057,.052,0x688379,10);
 for(let i=0;i<6;i++){const a=i*2.4,tip=[x+.09*Math.cos(a),1.10+i%3*.035,z+.08*Math.sin(a)];m.pole([x,.96,z],tip,.006,.005,0x68804c,4);m.oval(...tip,.029,.028,.027,i%2?0xbb6453:0xe9cb81,6);}
 tableChairs.forEach(p=>innChair(m,p));m.at(0,0,0);
 // The bar, the plate rack and the tiled stove sit on opposite sides of the room.
 m.box(3.55,0,-2,1.03,.95,2.76,green);m.box(3.55,.95,-2,1.17,.105,2.88,oak);
 for(let i=0;i<7;i++)m.box(3.024,.10,-3.16+i*.37,.036,.74,.027,0x7c8c70);
 for(const yy of [1.27,1.91]){m.box(3.11,yy,-3.57,2.59,.065,.32,oak);
  for(let i=0;i<7;i++){let xx=2.04+i*.34;if(yy<1.5)mug(m,xx,yy+.067,-3.50,0xe1d4b1);else{
   m.pole([xx,yy+.19,-3.56],[xx,yy+.19,-3.53],.149,.158,0xede1bf,14);
   m.pole([xx,yy+.19,-3.529],[xx,yy+.19,-3.522],.093,.093,0x66848b,12);}}}
 for(let j=0;j<7;j++)for(let i=0;i<3;i++)m.box(-4.09+i*.31,.03+j*.246,-2.99,.30,.239,.82,j%2===0?0x698573:0x718e7a);
 m.box(-3.78,1.75,-2.99,1.12,.11,.98,0x466454);m.box(-3.78,.34,-2.55,.51,.44,.055,0x464b40);
 m.pole([-3.78,1.85,-2.99],[-3.78,3,-2.99],.14,.13,0x655b49,10);
 // A carved pike on a stained board by the plate rack.
 m.box(.97,1.45,-3.66,1.51,.78,.12,oak);
 m.oval(.99,1.84,-3.54,.458,.137,.075,0xa4a573,10);m.tri([.63,1.84,-3.53],[.37,2.01,-3.53],[.38,1.69,-3.53],0x9b925b);
 m.oval(1.31,1.87,-3.48,.019,.019,.016,0x353c2e);
 for(const xx of [-.7,2.7]){
  const zz=xx<0?-.42:-1.1;m.pole([xx,2.93,zz],[xx,2.44,zz],.012,.012,0x655841,5);
  m.pole([xx,2.21,zz],[xx,2.45,zz],.29,.078,0x456457,12);
  m.oval(xx,2.213,zz,.248,.041,.248,0xffdc94,12);
 }
 return m;
}
function innVisitors(t){
 const m=new Geometry();
 for(let i=0;i<3;i++){
  if(i===2&&!me.room.seated)continue;
  const p=tableChairs[i],style=i===2?3:i===0?1:0,step=i===2?0:Math.round(4*sat(Math.sin(t*.81+i*2.2)-.08));
  const outfit=i===2?{coat:stat("coat"),pants:0x555b45,hair:0x514538}:residents[((i===0?4:3)+life.lake)%residents.length];
  const key="inn/"+life.lake+"/"+i+"/"+outfit.coat+"/"+step;
  if(!poseCache.has(key)){const body=new Geometry();seatedGuest(body,outfit,style,step/4,i===2);body.data=new Float32Array(body.data);poseCache.set(key,body);}
  m.instance(poseCache.get(key),p.x,0,p.z,p.a);
 }
 return m;
}
function roomCamera(){
 const r=me.room,f=F(cam),p=r.seated?tableChairs[2]:r;
 if(r.seated){
  const wide=cv.clientWidth>cv.clientHeight;
  return {eye:[p.x+(wide?.90:.31),1.65,p.z+(wide?1.65:2.1)],target:[commonTable.x,1.04,commonTable.z-.55],fov:wide?.92:1.13};
 }
 const eye=[r.x,1.58+.016*Math.sin(walkCycle),r.z];
 return {eye,target:[eye[0]+f[0]*3,eye[1]-.23-pitch*.75,eye[2]+f[2]*3],fov:1.03};
}
function roomWalkable(x,z){
 if(Math.abs(x)>4.30||Math.abs(z)>3.48)return false;
 if(Math.abs(x-commonTable.x)<1.55&&Math.abs(z-commonTable.z)<.81)return false;
 if(tableChairs.some(p=>Math.hypot(x-p.x,z-p.z)<.37))return false;
 return !(x>2.80&&z<-.38||x< -3.15&&z< -2.25);
}
function updateInnHUD(place){
 const seated=!!me.room?.seated;
 $("roomActions").hidden=!me.room||seated;$("tableTalk").hidden=!seated;
 $("game").classList.toggle("at-table",seated);
 if(seated){const key=[life.lake,life.day,period(life.time),conversation.speaker,conversation.topic,markedReport()?.slot].join("/");
  if(key!==lastConversation){$("tableTalk").innerHTML=tableDialogue();lastConversation=key;}}
 $("destination").hidden=!me.guide&&(me.aboard||me.room||place!=="pier"||phase!=="idle");
 if(me.guide){const {trail,next}=routeStep(),p=trail[next],angle=Math.atan2(p.x-me.x,me.z-p.z)-cam;
  const arrow=["↑","↗","→","↘","↓","↙","←","↖"][(Math.round(angle/(TAU/8))%8+8)%8];
  $("destination").textContent=arrow+"  "+v[me.guide].label+" · "+Math.round(Math.hypot(me.x-trail.at(-1).x,me.z-trail.at(-1).z))+" m";
 }else $("destination").textContent="Drogowskaz · dom i gospoda";
}
function setRoomSeat(seated){
 const r=me.room;if(!r)return;
 Object.assign(r,seated?{...tableChairs[2],seated:true}:{x:-.72,z:1.18,seated:false});
 resetStick();keys.clear();cam=0;pitch=0;conversation={speaker:0,topic:"hello"};lastConversation="";sceneTick=-1;updateHUD();save();
}
function enterInn(){
 closeBook();resetCast();keys.clear();resetStick();
 delete me.guide;Object.assign(me,{x:v.restaurant.x,y:v.restaurant.y,z:v.restaurant.z-3.24,cycling:false});
 me.room={...roomStart};cam=-.14;pitch=0;sceneTick=-1;conversation={speaker:0,topic:"hello"};lastConversation="";updateHUD();save();
}
function exitInn(){
 delete me.room;cam=0;pitch=0;const p=v.restaurant;
 Object.assign(me,{x:p.x,y:p.y,z:p.z-3.24,a:0});closeBook();resetStick();sceneTick=-1;updateHUD();save();
}
