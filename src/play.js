const $=s=>document.getElementById(s),cv=$("view"),book=$("book"),keys=new Set();
let eng,v,me,boat,where="",shopTab="rod",bagTab="fish",cam=0,pitch=0,phase="idle",cast=null,held=false,walkCycle=0,zoom=0,boarding=0,elapsed=0,prev=0,frameHUD=0,saveTimer=0,range=14,latest=null,timer=0,saveError=false;
let lessonBoat=false,firstHelp=true;
function save(key=saveID){
 if(!me)return false;
 checkAwards();lakeAccess();life.savedAt=Date.now();
 life.position={me:{...me},boat:{...boat},cam,pitch,range,elapsed,phase,cast:cast?{...cast}:null};
 try{localStorage.setItem(key,JSON.stringify(life));saveError=false;return true;}catch{saveError=true;return false;}
}
function say(text){$("notice").textContent=text;$("notice").hidden=false;clearTimeout(timer);timer=setTimeout(()=>$("notice").hidden=true,3600);}
function resetCast(){phase="idle";cast=null;held=false;}
function clockText(){const m=Math.floor(life.time*60)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");}
function setupLake(i,position=null,write=true){
 life.lake=i;v=village();me={x:-.38,y:.72,z:v.tip+1.65,a:0,aboard:false};boat={x:3.08,z:v.tip+2.24,a:0,speed:0};
 cam=0;pitch=0;zoom=0;boarding=0;lessonBoat=false;resetCast();
 if(position&&[position.me?.x,position.me?.z,position.me?.y,position.me?.a,position.boat?.x,position.boat?.z,position.boat?.a,position.cam].every(Number.isFinite)){
  Object.assign(me,position.me);Object.assign(boat,position.boat);boat.speed=0;cam=position.cam;
  if(!["restaurant","home","town"].includes(me.guide))delete me.guide;
  me.cycling=me.cycling===true&&life.owned.includes("skladak")&&!me.room&&!me.aboard;
  if(me.room){
   const r=me.room;if(!me.aboard&&r.seated===true)me.room={...tableChairs[2],seated:true};
   else if(!me.aboard&&Number.isFinite(r.x)&&Number.isFinite(r.z)&&roomWalkable(r.x,r.z))me.room={x:r.x,z:r.z,seated:false};
   else delete me.room;
  }
  pitch=sat(position.pitch||0,-1.7,3);range=sat(position.range||14,5,stat("rod"));elapsed=Math.max(0,position.elapsed||0);
  if(position.cast&&["throw","wait","bite","fight"].includes(position.phase)&&Number.isFinite(position.cast.age)&&Number.isFinite(position.cast.x)&&Number.isFinite(position.cast.z)&&
    (!["bite","fight"].includes(position.phase)||fish[position.cast.fish?.id])){phase=position.phase;cast={...position.cast};}
  if(!lakeWater(boat.x,boat.z,.85)||Math.abs(boat.x)<2.45&&boat.z>v.tip-.7)Object.assign(boat,{x:3.08,z:v.tip+2.24,a:0});
  if(me.room){Object.assign(me,{x:v.restaurant.x,z:v.restaurant.z-3.24,y:v.restaurant.y});delete me.guide;resetCast();}
  else if(me.aboard&&life.gear.boat){Object.assign(me,{x:boat.x,z:boat.z,a:boat.a,y:.21});}
  else{
   const ground=walkHeight(me.x,me.z);
   if(ground===null||me.aboard){Object.assign(me,{x:-.38,y:.72,z:v.tip+1.65,a:0,aboard:false});cam=0;resetCast();}
   else me.y=ground;
  }
  if(cast&&(!lakeWater(cast.x,cast.z,.2)||Math.hypot(cast.x-me.x,cast.z-me.z)>stat("rod")+1))resetCast();
 }
 const log=achievementLog();if(!log.lakes.includes(i))log.lakes.push(i);
 eng.rebuild();if(write)save();updateHUD();
}
function docked(){return Math.hypot(me.x-3.05,me.z-(v.tip+2.25))<(me.aboard?7:5.1);}
function findPlace(){
 if(me.room)return "restaurant";
 if(me.aboard)return docked()?"land":"";
 if(Math.hypot(me.x,me.z-v.pier.z)<4.8)return "pier";
 if(Math.hypot(me.x-v.town.x,me.z-v.town.z)<6.3)return "town";
 const p=v.restaurant;if(Math.abs(me.x-p.x)<6.1&&me.z>p.z-12&&me.z<p.z+3.3)return "restaurant";
 for(const k of ["home","camp"]){const p=v[k];if(Math.hypot(me.x-p.x,me.z-p.z)<6.7)return k;}
 return "";
}
function walkHeight(x,z){
 if(Math.abs(x)<1.94&&z>v.tip&&z<v.shore+3.1)return .72;
 const inn=v.restaurant,dx=x-inn.x,dz=z-inn.z;
 if(Math.abs(dx)<5.2&&dz>=-9.2&&dz<2.9){
  if(Math.abs(dx)<3.94&&dz> -2.49||diningSeats.some(s=>Math.abs(dx-s.x)<.7&&Math.abs(dz-s.z)<.48)||Math.abs(Math.abs(dx)-2.55)<.91&&Math.abs(dz+5.8)<.55)return null;
  return inn.y;
 }
 if(Math.abs(dx)<1.69&&dz>=-10.65&&dz< -9.2)return lerp(landY(x,inn.z-10.8),inn.y,sat((dz+10.8)/1.6));
 if(ratio(x,z)<1.003||ratio(x,z)>3.7&&!inTownClearing(x,z))return null;
 if(plazaLots.some(([dx,dz])=>Math.abs(x-v.town.x-dx)<2.76&&Math.abs(z-v.town.z-dz)<2.03))return null;
 for(const k of ["home","restaurant"]){let p=v[k];if(Math.abs(x-p.x)<(k==="home"?2.83:4.04)&&Math.abs(z-p.z)<(k==="home"?2.25:2.53))return null;}
 return landY(x,z);
}
function goPlace(key){
 if(me.aboard){say("Najpierw wróć łodzią do pomostu.");return;}
 delete me.room;delete me.guide;me.cycling=false;
 const p=v[key];let x=p.x,z=p.z,y;
 if(key!=="pier"){
  const dz=key==="camp"?1.9:key==="restaurant"?10.6:2.9;
  z=p.z-dz;y=walkHeight(x,z);
  if(y===null){z=p.z+dz;y=walkHeight(x,z);}
 }else{y=.72;}
 if(y===null){say("Podejdź do tego miejsca wzdłuż brzegu.");return;}
 Object.assign(me,{x,z,y,a:key==="pier"?0:Math.PI});cam=me.a;pitch=0;zoom=0;
 closeBook();if(key==="restaurant")enterInn();else if(key==="town")say(v.town.label+" · "+villageEvent());else if(key!=="pier")openBook(key);else say("Jesteś na pomoście.");
}
function interact(){
 if(phase!=="idle")return;
 if(me.room){if(me.room.seated)setRoomSeat(false);else if(me.room.z>3.1&&Math.abs(me.room.x)<.9)exitInn();
  else if(Math.hypot(me.room.x+.72,me.room.z-.49)>2.5){Object.assign(me.room,{x:-.72,z:1.42});cam=0;pitch=0;updateHUD();}else setRoomSeat(true);return;}
 const k=findPlace();
  if(k==="land"){Object.assign(me,{x:.65,y:.72,z:v.tip+2,a:0,aboard:false});Object.assign(boat,{x:3.08,z:v.tip+2.24,a:0,speed:0});cam=0;lessonBoat=false;sound.play("water");}
 else if(k==="pier"){
  if(!life.gear.boat){openBook("pier");return;}
  Object.assign(me,{x:boat.x,z:boat.z,y:.21,a:boat.a,aboard:true,cycling:false});delete me.guide;cam=boat.a;boarding=1;sound.play("water");
  if(life.firstBoat){lessonBoat=true;life.firstBoat=false;save();}
 }else if(k==="restaurant"){enterInn();}else if(k){if(me.guide===k)delete me.guide;openBook(k);}
 updateHUD();
}
function move(dt){
 if(phase!=="idle")return;
 if(me.room?.seated)return;
 cam+=(Number(keys.has("ArrowRight"))-Number(keys.has("ArrowLeft")))*dt*1.65;
 pitch=sat(pitch+(Number(keys.has("ArrowUp"))-Number(keys.has("ArrowDown")))*dt*1.5,-1.7,3);
 const f=sat(Number(keys.has("KeyW"))-Number(keys.has("KeyS"))+stick.y,-1,1);
 const drift=(life.buzz/100)**1.3*Math.sin(elapsed*1.67)*Math.abs(f)*.39;
 const side=sat(Number(keys.has("KeyD"))-Number(keys.has("KeyA"))+stick.x+drift,-1,1);
 if(me.room){
  if(!f&&!side)return;
  const r=me.room,dir=add(mul(F(cam),f),mul(R(cam),side)),step=mul(dir,dt*2.65/Math.max(1,Math.hypot(f,side)));
  const x=r.x+step[0],z=r.z+step[2];
  if(Math.abs(x)<.65&&z>=3.46){exitInn();return;}
  if(roomWalkable(x,r.z))r.x=x;if(roomWalkable(r.x,z))r.z=z;walkCycle+=dt*8;return;
 }
 if(me.aboard){
  const turn=side*dt*1.42;boat.a+=turn;cam+=turn;
  const rowing=life.gear.boat==="wiosla";
  const target=f*stat("boat")*(f<0?.5:1)*(rowing&&life.energy<10?.56:1);
  boat.speed=lerp(boat.speed,target,sat(dt*(f?2.4:3.1)));
  const step=mul(F(boat.a),boat.speed*dt),x=boat.x+step[0],z=boat.z+step[2];
  if(lakeWater(x,z,1.35)&&!(Math.abs(x)<2.68&&z>v.tip-.76)&&trafficClear(x,z)){boat.x=x;boat.z=z;}else boat.speed=0;
  Object.assign(me,{x:boat.x,z:boat.z,a:boat.a});if(rowing&&f)life.energy=sat(life.energy-dt*.105,0,100);
 }else if(f||side){
  const speed=me.cycling?(life.energy<10?4.5:7):3.6;
  const dir=norm(add(mul(F(cam),f),mul(R(cam),side))),d=mul(dir,dt*speed*Math.min(1,Math.hypot(f,side)));
  for(const [x,z] of [[me.x+d[0],me.z+d[2]],[me.x+d[0],me.z],[me.x,me.z+d[2]]]){
   if(Math.abs(x-v.restaurant.x)<.65&&me.z<v.restaurant.z-2.49&&z>=v.restaurant.z-2.60&&z>me.z){enterInn();return;}
   const y=walkHeight(x,z);if(y===null||(x===me.x&&z===me.z))continue;
   Object.assign(me,{x,y,z,a:Math.atan2(dir[0],-dir[2])});walkCycle+=dt*11;if(me.cycling)life.energy=Math.max(0,life.energy-dt*.064);break;
  }
 }
}
function targetPoint(){
 let f=F(cam),x=me.x+f[0]*range,z=me.z+f[2]*range;
 return {x,z,valid:lakeWater(x,z,.40)&&!(Math.abs(x)<1.98&&z>v.tip)};
}
function spawnCatch(id){
 let info=fish[id],mass=Math.round((info[1]+(info[2]-info[1])*Math.random()**1.5)*100)/100;
 return {id,mass,value:fishValue(id,mass)};
}
function act(){
 if(book.open||me.room||me.cycling)return;
 if(phase==="idle"){
  if(life.energy<5){say("Brakuje energii. Zjedz coś z plecaka albo prześpij się w namiocie.");return;}
  let p=targetPoint();if(!p.valid){say("Obróć widok i skieruj znacznik na wodę.");return;}
  let id=pickFish(1-ratio(p.x,p.z),me.aboard,p);
  cast={...p,age:0,bite:2.7+Math.random()*2.4,fish:id?spawnCatch(id):null,tension:.52,progress:0,risk:0,fightAge:0};
  phase="throw";me.a=cam;boat.speed=0;sound.play("cast");
 }else if(phase==="bite"){phase="fight";held=false;sound.play("hook");life.energy=Math.max(0,life.energy-.7);}
 else if(phase==="wait"||phase==="throw"){resetCast();say("Zestaw zwinięty.");}
 updateHUD();
}
function landCatch(){
 const e=cast.fish;latest=e;life.fish.push(e);life.xp+=Math.max(2,Math.ceil(e.mass));life.tutorial=false;life.energy=Math.max(0,life.energy-1.7);
 const log=achievementLog();if(!log.species.includes(e.id))log.species.push(e.id);log.best=Math.max(log.best,e.mass);
 if(period(life.time)==="noc")log.night=true;
 const k=e.id==="ploc"?"pierwsza":e.id==="szczupak"&&e.mass>=2?"zęby":e.id==="sum"&&me.aboard?"noc":null;
 if(k)life.counts[k]=(life.counts[k]||0)+1;
 for(const job of ["kosz",...(["ukleja","kielb"].includes(e.id)&&life.lake===0?["drobnica"]:[]),...(life.lake===1?["trzciny"]:[])])life.counts[job]=(life.counts[job]||0)+1;
 const tip=markedReport();if(tip&&e.id===tip.id&&Math.hypot(cast.x-tip.x,cast.z-tip.z)<6)log.tipped=true;
 if(fishRanks[e.id]===5)log.expert=true;
 resetCast();save();sound.play("land");openBook("catch");
}
function fightProfile(c){
 const {id,mass}=c.fish,f=fish[id],rank=fishRanks[id],size=sat((mass-f[1])/(f[2]-f[1])),load=(rank-1)/4;
 const t=c.fightAge||0,beat=t*(1.65+load*1.25)+size*2+f[6]*4;
 const pull=Math.max(0,Math.sin(beat))**3,half=.185-.068*load,center=.52+.105*load*Math.sin(beat*.78);
 return {rank,low:center-half,high:center+half,pull,load,size,window:1.68-.73*load-.13*size};
}
function fishing(dt){
 if(!cast)return;cast.age+=dt;
 if(phase==="throw"&&cast.age>.53){phase="wait";sound.play("water");updateHUD();}
 if(phase==="wait"&&cast.age>cast.bite){if(!cast.fish){resetCast();say("Cisza na wodzie. Sprawdź pory żerowania w poradniku.");}else{phase="bite";sound.play("bite");}updateHUD();}
 if(phase==="bite"&&cast.age>cast.bite+fightProfile(cast).window){resetCast();say("Ryba wypluła przynętę. Zatnij tuż po zanurzeniu spławika.");updateHUD();}
 if(phase!=="fight")return;
 const c=cast,power=1+Math.min(1.8,c.fish.mass*.083)/(1+strength()*.11);c.fightAge+=dt;
 const q=fightProfile(c),surge=q.pull*(.10+.43*q.load)+.065*Math.sin(c.fightAge*4.7);
 c.tension=sat(c.tension+dt*(held?(.53+.19*q.load+surge)*power/stat("line"):-.43-.14*q.load+surge*.55));
 if(held){
  life.energy=Math.max(0,life.energy-dt*(.32+.35*q.load));
  if(c.tension>=q.low&&c.tension<=q.high)c.progress+=dt*(.42-.17*q.load)*stat("reel")*(1+strength()*.048)/(power+.3*q.size);
 }
 if(c.tension>q.high+.11||c.tension<q.low-.14)c.progress=Math.max(0,c.progress-dt*(.014+.025*q.load));
 c.risk=c.tension>.94||c.tension<.09?c.risk+dt*(c.tension<.09?1/stat("hook"):1):Math.max(0,c.risk-dt*1.8);
 if(c.risk>.47-.12*q.load){say(c.tension>.94?"Żyłka pękła. Puść zwijanie, kiedy ryba szarpie.":"Ryba zeszła z haczyka. Zwijaj, gdy żyłka się luzuje.");resetCast();updateHUD();}
 else if(c.progress>=1)landCatch();
}
function traffic(t){
 const l=lake();return [0,1,2,3].map((i)=>{
  const sail=i<2,a=t*(sail?.014:.019)*(i%2?-1:1)+[2.12,-.72,.77,3.73][i]+l.phase*.23;
  const [rx,rz,ox,oz]=life.lake===1?[[6.2,5.1,-3,11],[8.8,3.9,-20,-10],[4,5.1,33,0],[3,3.4,-9,-1]][i]:
   [l.rx*[.57,.39,.66,.41][i],l.rz*[.42,.56,.54,.42][i],[-1,5,-5,1][i],[-6,-3,0,5][i]];
  const dx=-rx*Math.sin(a)*(i%2?-1:1),dz=rz*Math.cos(a)*(i%2?-1:1);
  return {x:ox+rx*Math.cos(a),z:oz+rz*Math.sin(a),a:Math.atan2(dx,-dz),sail};
 });
}
function trafficClear(x,z){return traffic(elapsed).every(p=>Math.hypot(p.x-x,p.z-z)>(p.sail?3.1:2.4));}
function looseLine(mesh,from,to,color,sag){
 let last=from;for(let i=1;i<=8;i++){let t=i/8,pos=from.map((v,j)=>lerp(v,to[j],t));pos[1]-=Math.sin(t*Math.PI)*sag;mesh.pole(last,pos,.012,.012,color,3);last=pos;}
}
function boatDetail(m,motor,t,active){
 hull(m,motor?0x476a70:0x916845,false);
 if(motor){m.box(0,.26,1.82,.44,.7,.43,0x4a514c);m.box(0,.88,1.83,.53,.23,.57,0x6d7064);}
 else for(const k of [-1,1]){
  let stroke=active?Math.sin(t*3.8)*.52:.0;
  m.pole([k*.41,.74,.1],[k*1.46,.20,.48+stroke],.042,.043,0x987954);
  m.pole([k*1.46,.20,.48+stroke],[k*1.84,.025,.76+stroke],.078,.123,0xb09568,5);
 }
}
function swimmingFish(m,id,x,y,z,heading,size,t){
 if(id==="wegorz"){
  m.at(x,y,z,heading);let pt=[0,0,-.60*size];m.oval(0,0,pt[2],.079*size,.072*size,.13*size,fish[id][7],7);
  for(let j=1;j<=9;j++){const f=j/9,q=[Math.sin(t*7-f*5)*f*.22*size,0,(-.61+1.47*f)*size];
   m.pole(pt,q, (.087-.059*(j-1)/9)*size,(.087-.059*f)*size,fish[id][7],7);pt=q;}return;
 }
 const col=fish[id][7],long=["sum","sandacz","szczupak"].includes(id),length=size*(long?1.32:1);
 m.at(x,y,z,heading);m.oval(0,0,0,.16*size,(long?.12:.19)*size,length*.54,col,7);
 const base=[0,0,length*.43],tail=[Math.sin(t*8)*size*.105,0,length*.81];
 m.tri(base,[tail[0],size*.145,tail[2]],[tail[0],-size*.13,tail[2]],col,.87);
 m.tri([0,size*.14,-length*.09],[0,size*.31,length*.04],[0,size*.14,length*.21],col,.82);
}
function makeScene(t){
 if(me.room)return innVisitors(t);
 const m=new Geometry();let k=0;
 for(const p of traffic(t)){
  if(p.sail)sailboat(m,p.x,p.z,p.a,t,k?0xd5a981:0xeadcc1);
  else {m.at(p.x,.035+Math.sin(t*1.9+k)*.035,p.z,p.a);boatDetail(m,false,t,false);
   const tip=angler(m,p.x,.17,p.z,p.a+[.7,-.7][k%2],k%2?0x806844:0x687779,0,.14,true);
   m.at(0,0,0);looseLine(m,tip,add([p.x,.06,p.z],mul(F(p.a+.7),6)),0xa5ad98,.3);
  }wake(m,p.x,p.z,p.a,p.sail?1.24:.82,t);k++;
 }
 for(let i=0;i<3;i++){
  const [x,z]=polar(lake(),[1.02,2.14,-.7][i],1.031),face=Math.atan2(-x,z);
  const tip=angler(m,x,landY(x,z),z,face,[0x8d674e,0x65777d,0x8a814e][i],0,.12+.11*Math.sin(t*.6+i),false);
  m.at(0,0,0);looseLine(m,tip,add([x,.03,z],mul(F(face),8)),0xa3b3a2,.25);
 }
 if(life.gear.boat){m.at(boat.x,.04+Math.sin(t*1.7)*.027,boat.z,boat.a);boatDetail(m,life.gear.boat==="silnik",t,Math.abs(boat.speed)>.5);}
 if(life.owned.includes("grill")){
  m.at(v.camp.x+1.65,v.camp.y,v.camp.z+.2);
  m.box(0,.64,0,.85,.31,.56,0x464940);
  for(let i=-3;i<=3;i++)m.pole([i*.105,.96,-.27],[i*.105,.96,.27],.018,.018,0x999887,4);
  for(const k of [-1,1])for(const j of [-1,1])m.pole([k*.31,.68,j*.21],[k*.4,0,j*.27],.036,.036,0x6a6a5e);
 }
 m.at(v.camp.x,v.camp.y,v.camp.z);
 for(let i=0;i<5;i++)m.pole([Math.sin(i*2.3)*.19,.18,Math.cos(i*2.2)*.15],[Math.sin(t*3+i)*.11,.49+.24*(1+Math.sin(t*5+i)),Math.cos(i)*.1],.13,0,i%2?0xfbb84b:0xda7031,5);
 const bend=phase==="throw"?Math.sin(sat(cast.age/.56)*Math.PI)*1.38:phase==="fight"?.74+.09*Math.sin(t*6):.10;
 const base=me.aboard?.19+.055*Math.sin(t*1.7)+Math.sin(boarding*Math.PI)*.62:me.y;
 let tip;
 if(me.cycling)m.instance(cycleModel(stat("coat"),0xa5573e,Math.floor(walkCycle*.65)%10,0),me.x,base,me.z,me.a);
 else tip=angler(m,me.x,base,me.z,me.a,stat("coat"),walkCycle,bend,me.aboard,phase!=="idle"||!["restaurant","town"].includes(findPlace()));m.at(0,0,0);
 if(cast){
  let f=phase==="fight"?cast.progress*.91:0,px=lerp(cast.x,me.x,f),pz=lerp(cast.z,me.z,f);
  const b=phase==="throw"?sat(cast.age/.53):1;px=lerp(tip[0],px,b);pz=lerp(tip[2],pz,b);
  let py=lerp(tip[1],.13,b)+Math.sin(b*Math.PI)*2.65+.034*Math.sin(t*3.23);
  if(phase==="bite")py-=.14+.096*Math.sin(t*12);
  m.oval(px,py,pz,.078,.125,.078,0xe5d4a9,7);m.pole([px,py+.075,pz],[px,py+.34,pz],.033,.028,0xc14929,5);
  looseLine(m,tip,[px,py+.09,pz],0xb0bcac,phase==="fight"?.04:.22);
  if(phase==="fight"&&cast.fish){
   const size=.46+Math.sqrt(cast.fish.mass)*.27;
   swimmingFish(m,cast.fish.id,px+Math.sin(t*4)*.16,Math.sin(t*4.7)*.049,pz+.23,Math.atan2(me.x-px,pz-me.z)+Math.sin(t*4)*.45,size,t);
   m.at(0,0,0);
  }
  if(b===1){const radius=.25+(t*.45%1);m.ring(px,.026,pz,radius,.017,0x8ab9b0);}
 }else{
  const p=targetPoint();if(!me.cycling&&p.valid){m.ring(p.x,.036,p.z,.42,.042,0xf2d9a1);m.ring(p.x,.037,p.z,.075,.026,0xe9cc92);}
 }
 drawWildlife(m,t);
 drawVillagers(m,t);
 townPeople(m,t);
 drawCycles(m,t);
 drawRoute(m);
 const remembered=markedReport();if(remembered){m.at(0,0,0);m.ring(remembered.x,.047,remembered.z,1.28,.075,0xf2bb68);}
 return m;
}
function cameraView(dt){
 if(me.room)return roomCamera();
 const focus=cast&&phase!=="throw"?1:0;zoom=lerp(zoom,focus,sat(3.4*dt));
 let origin=[me.x,me.aboard?.42:me.y,me.z],f=F(cam),r=R(cam);
 const shoulder=sat(cv.clientWidth/Math.max(1,cv.clientHeight),.30,1);
 let eye=add(add(origin,mul(f,me.aboard?-6.45:-5.35)),mul(r,1.30*shoulder));eye[1]+=2.74+pitch;
 let target=add(add(origin,mul(f,8.4)),mul(r,1.02*shoulder));target[1]+=1.24;
 if(cast&&zoom>.001){let prog=phase==="fight"?cast.progress*.91:0;
  const b=[lerp(cast.x,me.x,prog),.17,lerp(cast.z,me.z,prog)],dir=norm([b[0]-me.x,0,b[2]-me.z]);
  let close=add(b,mul(dir,-5.12));close[1]=1.58;
  eye=eye.map((n,i)=>lerp(n,close[i],zoom));target=target.map((n,i)=>lerp(n,b[i]+(i===1?.47:0),zoom));
 }
 const sway=(life.buzz/100)**1.35,rock=Math.sin(elapsed*1.2)*sway;
 eye=add(eye,mul(r,.26*rock));target=add(target,mul(r,-.49*rock));target[1]+=.12*sway*Math.sin(elapsed*1.72);
 eye[1]=Math.max(eye[1],landY(eye[0],eye[2])+.36);
 if(!me.aboard&&zoom<.01&&life.lake===2){
  const head=[me.x,me.y+1.64,me.z];let safe=1;
  for(let i=1;i<=12;i++){const u=i/12,x=lerp(head[0],eye[0],u),z=lerp(head[2],eye[2],u);
   if(lerp(head[1],eye[1],u)<landY(x,z)+.20){safe=(i-1)/12;break;}}
  if(safe<1)eye=head.map((n,i)=>lerp(n,eye[i],safe));
 }
 return {eye,target,fov:lerp(.91,.73,zoom)};
}
