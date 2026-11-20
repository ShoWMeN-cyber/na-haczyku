const skinTones=[0xd1a282,0xb98564,0xe1b89a,0xc59579,0xd6ab88,0xcba589];
function personHead(m,base,style,hair,hat=false){
 const skin=skinTones[style%skinTones.length],y=base+.67,w=.128+(style%3)*.007;
 m.pole([0,base+.43,.006],[0,y-.084,-.01],.071,.068,skin,8);
 m.oval(0,y,-.014,w,.181,.134,skin,11);
 if(!m.distant)for(const k of [-1,1]){
  m.oval(k*w,y-.009,-.002,.024,.037,.022,skin,6);
  const x=k*.053;
  m.box(x,y+.019,-.139,.041,.012,.014,0x5f4a38);
  m.box(x,y+.044,-.135,.057,.010,.012,hair);
 }
 if(!m.distant){m.oval(0,y-.008,-.145,.026,.036,.029,skin,6);m.box(0,y-.067,-.136,.049,.009,.013,0x9b6655);}
 m.oval(0,y+.075,.036,w*1.035,.126,.121,hair,10);
 if(!m.distant)for(const k of [-1,1])m.oval(k*w*.88,y+.041,.014,.028,.070,.077,hair,6);
 if(!hat&&style%3===1){m.oval(0,y+.021,.159,.079,.076,.075,hair,8);m.oval(0,y-.059,.177,.053,.108,.040,hair,7);}
 if(style%5===0){m.oval(0,y-.09,-.075,.105,.079,.074,hair,8);m.box(0,y-.055,-.145,.07,.009,.008,0x956a56);}
 if(hat){
  const fabric=[0x70765a,0x68675b,0x54666a][style%3];
  m.oval(0,y+.13,.003,.157,.104,.151,fabric,10);
  m.oval(0,y+.094,-.066,.169,.022,.174,style%2?0x5e6254:0x5c6249,10);
 }else if(style%3===2){
  m.oval(0,y+.115,.001,.147,.102,.145,0x705d53,10);
  m.oval(0,y+.085,-.002,.15,.043,.15,0x867266,10);
 }
 return skin;
}
function personJacket(m,base,coat,wide,vest=false){
 const layers=[[0,.78,.78],[.07,.89,.89],[.25,1,1],[.41,1.11,.96],[.46,.85,.86],[.50,.46,.63]];
 const ring=(layer,i)=>{const [y,x,z]=layer,a=i*TAU/10;return [Math.cos(a)*wide*x,base+y,Math.sin(a)*.146*z+.01];};
 for(let j=1;j<layers.length;j++)for(let i=0;i<10;i++)m.quad(ring(layers[j-1],i),ring(layers[j],i),ring(layers[j],i+1),ring(layers[j-1],i+1),coat,.94+.035*(i%3));
 m.pole([0,base+.06,-.114],[0,base+.393,-.135],.007,.006,0x544e3f,4);
 for(const k of [-1,1]){
  m.tri([k*.023,base+.39,-.14],[k*.123,base+.46,-.101],[k*.063,base+.491,-.091],coat,.72);
  const x=k*wide*.56;
  m.box(x,base+.11,-.105,wide*.39,.083,.030,vest?0x79764e:coat);
  m.box(x,base+.18,-.11,wide*.43,.023,.035,vest?0x676747:coat);
 }
}
function seatedGuest(m,person,style,gesture,hat=false){
 const hip=.535,shirt=hip+.015,skin=skinTones[style%skinTones.length];
 m.oval(0,hip+.008,.014,.189,.108,.133,person.pants,9);
 for(const k of [-1,1]){
  const knee=[k*.13,.46,-.36],ankle=[k*.14,.103,-.40];
  m.pole([k*.111,hip,.027],knee,.108,.095,person.pants,7);m.pole(knee,ankle,.092,.064,person.pants,7);
  m.oval(ankle[0],.084,ankle[2]-.043,.084,.075,.146,0x48433a,7);
 }
 personJacket(m,shirt,person.coat,.212);personHead(m,shirt,style,person.hair,hat);
 for(const k of [-1,1]){
  const active=k===1,elbow=[k*.255,shirt+.17,-.13];
  const hand=active?[.185,shirt+.26+gesture*.285,-.36+gesture*.17]:[-.13,shirt+.24,-.36];
  m.pole([k*.209,shirt+.40,0],elbow,.09,.071,person.coat,7);m.pole(elbow,hand,.072,.049,person.coat,7);
  m.oval(...hand,.048,.055,.055,skin,6);
  if(active&&style%2===0){
   const [x,y,z]=hand;m.pole([x-.048,y-.04,z],[x-.048,y+.064,z],.045,.051,0xb88949,8);
   m.pole([x-.048,y+.064,z],[x-.048,y+.074,z],.051,.051,0xe6d6ae,8);
  }else if(active&&style===1)m.pole(hand,[hand[0]-.04,hand[1]+.12,hand[2]-.08],.008,.015,0xa8aa9c,4);
 }
}
const diningSeats=[{x:-2.55,z:-4.87,a:0},{x:-2.55,z:-6.72,a:Math.PI},{x:2.55,z:-4.87,a:0},{x:2.55,z:-6.72,a:Math.PI}];
function drawDiners(m,t){
 if(Math.hypot(me.x-v.restaurant.x,me.z-v.restaurant.z)>36)return;
 for(let i=0;i<diningSeats.length;i++){
  const p=diningSeats[i],step=Math.round(4*sat(Math.sin(t*.72+i*2)*1.65-.36)),key="seat/"+i+"/"+step;
  if(!poseCache.has(key)){const model=new Geometry();seatedGuest(model,residents[[3,2,5,0][i]],i,step/4);model.data=new Float32Array(model.data);poseCache.set(key,model);}
  m.instance(poseCache.get(key),v.restaurant.x+p.x,v.restaurant.y,v.restaurant.z+p.z,p.a);
 }
}
