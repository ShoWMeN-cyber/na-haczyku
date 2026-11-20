const villageNames=["Brzozowy Brzeg","Czaple Łąki","Kamienny Potok"];
const plazaLots=[[-12,-7],[-13,4],[-6,13],[5,14],[13,4],[12,-7]];
const townCache=new Map();
function townSite(){
 if(!townCache.has(life.lake)){const inn=innSite(),x=inn.x+30,z=inn.z+7;
  townCache.set(life.lake,{x,z,y:naturalGround(x,z),label:villageNames[life.lake],name:"town"});}
 return townCache.get(life.lake);
}
function townLane(){
 const p=townSite(),inn=innSite();return [{x:inn.x,z:inn.z-10.75},{x:inn.x+9,z:inn.z-10.75},{x:inn.x+9,z:p.z-2},{x:p.x,z:p.z-2}];
}
function inTownClearing(x,z){
 const p=townSite(),inn=innSite();
 return Math.abs(x-p.x)<19&&Math.abs(z-p.z)<20||
  x>inn.x-2&&x<inn.x+11.5&&z>inn.z-13&&z<p.z+.8;
}
function villageEvent(h=life.time){return h>=18&&h<24?"Wiejska potańcówka":h>=10&&h<18?"Targ na placu":h>=5?"Poranny obchód":"Wieś śpi";}
function cottage(m,x,z,i){
 const w=4.2+(i%3)*.45,d=3.4+(i%2)*.45,y=landY(x,z);
 const front=z>townSite().z?1:-1;m.at(x,y,z,front>0?0:Math.PI);
 const walls=[[0xd4be9b,0xcbb885,0xcfb69d],[0xc2b18e,0xa88c69,0xc1af8d],[0x977558,0x9d8268,0xaf8863]][life.lake];
 const roof=[0x9d5949,0x666f66,0x845643][(i+life.lake)%3],trim=[0x4c746a,0x627582,0x755b41][life.lake];
 m.box(0,-1.4,0,w+.18,1.64,d+.16,0x918874);m.box(0,.24,0,w,2.22,d,walls[i%3]);
 const ridge=3.55+.19*(i%2),e=2.38;
 for(const k of [-1,1]){
  m.quad([k*(w/2+.34),e,-d*.6],[0,ridge,-d*.6],[0,ridge,d*.6],[k*(w/2+.34),e,d*.6],roof);
  m.tri([-w*.50,e,k*d*.51],[w*.50,e,k*d*.51],[0,ridge,k*d*.51],walls[i%3]);
  m.box(k*w*.43,.24,-d*.5,.13,2.1,.15,trim);
 }
 m.box(-.62,.24,-d*.5,1.02,1.78,.15,trim);m.box(-.61,-.09,-d*.5-.27,1.25,.32,.58,0xa19780);
 for(const xx of [w*.28,-w*.35]){
  m.box(xx,1.11,-d*.51,.79,.78,.13,0xe2d4b7);m.box(xx,1.19,-d*.51-.072,.62,.62,.025,0x718f8c);
  m.box(xx,1.18,-d*.51-.091,.037,.65,.027,trim);m.box(xx,1.49,-d*.51-.091,.66,.035,.027,trim);
 }
 m.box(w*.22,2.83,d*.19,.35,.95,.4,0x9e7558);m.box(w*.22,3.75,d*.19,.42,.12,.45,0x785c49);
}
function buildTown(m){
 const p=townSite(),inn=innSite();plazaLots.forEach(([x,z],i)=>cottage(m,p.x+x,p.z+z,i));m.at(0,0,0);
 const road=(a,b,width)=>{
  const len=Math.hypot(b.x-a.x,b.z-a.z),nx=-(b.z-a.z)/len*width,nz=(b.x-a.x)/len*width;let last;
  for(let i=0;i<=16;i++){const x=lerp(a.x,b.x,i/16),z=lerp(a.z,b.z,i/16);
   const edges=[-1,1].map(k=>[x+k*nx,landY(x+k*nx,z+k*nz)+.08,z+k*nz]);
   if(last)m.quad(last[0],last[1],edges[1],edges[0],0xc1ad82);last=edges;}
 };
 const lane=townLane();for(let j=1;j<lane.length;j++)road(lane[j-1],lane[j],1.35);
 for(const [x,z] of plazaLots)road(p,{x:p.x+x,z:p.z+z+(z>0?-2.1:2.1)},.70);
 m.at(p.x,p.y,p.z);m.pole([0,.04,0],[0,.085,0],5.3,5.3,0xb6a27b,28);
 for(const side of [-1,1]){m.box(side*4,.42,1,1.76,.09,.39,0x946e48);for(const k of [-1,1])m.box(side*4+k*.67,0,1,.12,.44,.29,0x74604a);}
 for(const k of [-1,1])m.pole([k*4,-.04,-2.8],[k*4,3.25,-2.8],.068,.058,0x796040,8);
 for(let j=0;j<16;j++){const x=-4+j*.5,y=3.25-.40*Math.sin(Math.PI*j/16),y2=3.25-.40*Math.sin(Math.PI*(j+1)/16);
  m.pole([x,y,-2.8],[x+.5,y2,-2.8],.012,.012,0x4d5245,4);
  m.tri([x+.04,y-.02,-2.8],[x+.38,y2-.02,-2.8],[x+.22,y-.33,-2.79],[0xc5824f,0xaf5848,0xe0cda5,0x758d7a][j%4]);}
 m.at(p.x+4.2,p.y,p.z-4.2);m.box(0,.70,0,2.3,.10,1.15,0xa17e54);
 for(const k of [-1,1])for(const j of [-1,1])m.box(k*.97,0,j*.44,.07,2.28,.07,0x82623e);
 for(let i=0;i<6;i++)m.box(-1+i*.4,2.24,0,.399,.085,1.34,i%2?0xc89765:0xe0cc9f);
 for(let i=0;i<3;i++){m.box(-.72+i*.72,.80,0,.55,.095,.50,0x806443);for(let j=0;j<6;j++)m.oval(-.87+i*.72+j%3*.14,.936,-.09+Math.floor(j/3)*.16,.083,.075,.081,[0xaf6949,0xc9a558,0x78915c][i],6);}
 m.at(0,0,0);
}
function townPeople(m,t){
 const p=townSite();if(Math.hypot(p.x-me.x,p.z-me.z)>52)return;
 const event=villageEvent(),dance=event==="Wiejska potańcówka",night=life.time<5||life.time>=18;
 if(night){for(let i=0;i<6;i++){const [x,z]=plazaLots[i],k=z>0?-1:1;
  m.at(p.x+x,p.y,p.z+z);m.box((k<0?1:-1)*(4.2+i%3*.45)*.28,1.20,k*((3.4+i%2*.45)*.51+.10),.60,.58,.018,0xf3c285);}}
 if(life.time<5){m.at(0,0,0);return;}
 for(let i=0;i<6;i++){
  const r=residents[i],a=t*(dance?.73:.075)+i*2.28;
  let x,z,heading,step;
  if(dance&&i<4){const pair=i>>1,turn=t*.69+pair*1.8+(i%2)*Math.PI;x=(pair?1.65:-1.48)+Math.cos(turn)*.66;z=.05+Math.sin(turn)*.66;heading=Math.atan2(-Math.cos(turn),Math.sin(turn));step=Math.sin(t*5.3+i)*.49;}
  else if(dance){x=i===4?-1.0:2.1;z=-2.25;heading=Math.PI;step=.08*Math.sin(t*4);}
  else{const [hx,hz]=plazaLots[i],u=(1-Math.cos(a))*.5,dx=hx*.73,dz=hz*.70;x=lerp(dx,2.50-i*.48,u);z=lerp(dz,-1.1+i%3*.7,u);heading=Math.atan2((2.5-i*.48-dx)*Math.sin(a),-( -1.1+i%3*.7-dz)*Math.sin(a));step=Math.sin(t*3.6+i)*Math.abs(Math.sin(a));}
  const q=Math.round(step*3),key="town/"+i+"/"+q;
  if(!poseCache.has(key)){const model=pedestrianModel(r,q/3,false,true);model.data=new Float32Array(model.data);poseCache.set(key,model);}
  const y=landY(p.x+x,p.z+z)+.09;m.instance(poseCache.get(key),p.x+x,y,p.z+z,heading,r.height);
  if(dance&&i===4){m.at(p.x+x,y,p.z+z,heading);m.box(0,.97,-.18,.41,.24,.18,0x8d463b);for(let j=-3;j<=3;j++)m.box(j*.037,1.0,-.279,.016,.18,.02,0xcaa88a);}
 }
 m.at(0,0,0);
}
