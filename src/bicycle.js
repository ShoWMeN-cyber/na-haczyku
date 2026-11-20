const cyclePoses=new Map();
function cycleModel(coat,paint,step,style){
 const key=[coat,paint,step,style].join("/");
 if(cyclePoses.has(key))return cyclePoses.get(key);
 const m=new Geometry(),metal=0xa6aaa2,tire=0x363d38,angle=step*TAU/10;
 for(const z of [-.58,.53]){
  let prev=[0,.334,z+.33];
  for(let j=1;j<=20;j++){
   const a=j*TAU/20,p=[0,.334+Math.sin(a)*.33,z+Math.cos(a)*.33];
   m.pole(prev,p,.027,.027,tire,5);
   if(j%2===0)m.pole([0,.334,z],[0,.334+.30*Math.sin(a+angle),z+.30*Math.cos(a+angle)],.006,.006,metal,3);
   prev=p;
  }
 }
 const crank=[0,.35,.04],seat=[0,.83,.21],head=[0,.81,-.44],joint=[0,.49,-.18];
 const tube=(a,b,w=.028,c=paint)=>m.pole(a,b,w,w,c,7);
 tube([0,.334,.53],crank);tube([0,.334,.53],seat,.022);tube(crank,seat);
 tube(seat,joint,.043);tube(joint,head,.044);m.box(0,.473,-.18,.093,.069,.086,metal);
 for(const k of [-1,1])tube([k*.027,.334,-.58],head,.018);
 tube(head,[0,1.07,-.46],.021,metal);tube([-.24,1.08,-.46],[.24,1.08,-.46],.019,metal);
 m.oval(0,.875,.20,.126,.049,.144,0x493d32,8);tube(seat,[0,.89,.20],.02,metal);
 m.box(0,.70,.55,.21,.027,.33,metal);m.oval(0,.61,.77,.032,.045,.019,0xb55d48,6);
 m.oval(0,.90,.166,.167,.10,.13,0x535746,8);
 m.at(0,.915,.12);personJacket(m,0,coat,.207,true);personHead(m,0,style,0x655742,style===0);
 m.at(0,0,0);
 for(const k of [-1,1]){
  const a=angle+(k===1?0:Math.PI),foot=[k*.14,.36+.134*Math.sin(a),.035+.134*Math.cos(a)],knee=[k*.143,.61+.066*Math.sin(a),-.16+.10*Math.cos(a)];
  tube([k*.086,.91,.17],knee,.084,0x565c4d);tube(knee,foot,.062,0x565c4d);
  m.oval(foot[0],foot[1],foot[2]-.044,.067,.053,.108,0x443f37,7);
  tube(crank,foot,.014,metal);m.box(foot[0],foot[1]-.065,foot[2],.13,.025,.073,tire);
  const elbow=[k*.22,1.15,-.10],hand=[k*.215,1.09,-.45];
  tube([k*.18,1.30,.10],elbow,.070,coat);tube(elbow,hand,.056,coat);m.oval(...hand,.045,.047,.047,skinTones[style],6);
 }
 m.data=new Float32Array(m.data);cyclePoses.set(key,m);return m;
}
function drawCycles(m,t){
 const routes=[[.63,1.27],[1.64,2.31],[3.56,4.45]],colors=[0x557a79,0xb16648,0x7c814b];
 routes.forEach(([a,b],i)=>{
  if(life.time<5||life.time>=22)return;
  const phase=t*[.084,.07,.046][i]+i*2.63,u=(1-Math.cos(phase))*.5;
  const ang=lerp(a,b,u),p=trailPoint(ang),q=trailPoint(ang+(Math.sin(phase)>=0?.003:-.003));
  if(Math.hypot(p.x-me.x,p.z-me.z)>64)return;
  m.instance(cycleModel(residents[i+1].coat,colors[i],Math.round(t*6.4+i)%10,i+1),p.x,p.y+.045,p.z,Math.atan2(q.x-p.x,p.z-q.z));
 });
}
function toggleCycle(){
 if(!life.owned.includes("skladak")||me.aboard||me.room||phase!=="idle"||book.open||inMenu)return;
 me.cycling=!me.cycling;keys.clear();resetStick();sceneTick=-1;
 if(me.cycling)sound.tone(1130,865,.15,.065);
 say(me.cycling?"Wsiadasz na składak. Kieruj tak jak podczas chodzenia.":"Składasz rower i idziesz pieszo.");save();updateHUD();
}
