function handle(action){
 const [op,id]=action.split("|");
 let updated=true;
 if(["store","overwrite","restore","restart"].includes(op)){saveAction(op,id);return;}
 if(op==="open"){openBook(id);return;}
 if(op==="back"){closeBook();return;}
 if(op==="language"){setLanguage(id);return;}
 if(op==="rod"){toggleRod();return;}
 if(op==="cycle"){toggleCycle();return;}
 if(op==="bikes"&&where==="home"){shopTab="kit";openBook("shop");return;}
 if(op==="mapZoom"){mapControl(id);return;}
 if(op==="atBar"&&me.room){openBook("restaurant");return;}
 if(op==="exitInn"&&me.room){exitInn();return;}
 if(op==="stand"&&me.room?.seated){setRoomSeat(false);return;}
 if(op==="route"&&["restaurant","home","town"].includes(id)&&!me.aboard&&phase==="idle"){
  if(me.room)exitInn();me.guide=id;closeBook();save();updateHUD();return;
 }
 if(me.room?.seated&&["ask","speaker","pinFish"].includes(op)){
  if(op==="speaker"&&["0","1"].includes(id))conversation={speaker:Number(id),topic:"hello"};
  if(op==="ask"&&["spot","bait","later"].includes(id)){conversation.topic=id;achievementLog().talked=true;}
  if(op==="pinFish"&&conversation.topic!=="hello"){const t=dailyReport(conversation.speaker);life.fishingTip={lake:t.lake,day:t.day,period:t.period,speaker:conversation.speaker};}
  lastConversation="";updateHUD();save();return;
 }
 if(op==="go"){if(phase==="idle")goPlace(id);return;}
 if(op==="lake"){
  if(me.aboard||phase!=="idle"||!lakeAccess().includes(Number(id)))return;
  passTime(.33);setupLake(Number(id));closeBook();return;
 }
 if(op==="shopTab")shopTab=id;
 else if(op==="bagTab")bagTab=id;
 else if(op==="guideTab")guideTab=id;
 else if(op==="stock"||op==="equip"){
  if(phase!=="idle")return;
  let item=stock[id],g=item[1];
  if(g==="boat"&&me.aboard)return;
  if(!life.owned.includes(id)){
   if(where!=="shop"||life.cash<item[2])return;
   life.cash-=item[2];life.owned.push(id);sound.play("buy");
  }
  if(g!=="kit")life.gear[g]=id;
  range=Math.min(range,stat("rod"));
 }else if(op==="reward"&&where==="quests"){
  const q=quests.find(q=>q[0]===id);
  if(!q||life.paid.includes(id)||(life.counts[id]||0)<q[3])return;
  life.cash+=q[4];life.paid.push(id);sound.play("buy");
 }else if(op==="sellAll"&&where==="restaurant"){
  life.cash+=life.fish.reduce((n,e)=>n+e.value,0);life.fish=[];sound.play("buy");
 }else if(op==="sell"&&where==="restaurant"){
  const e=life.fish[Number(id)];if(!e)return;life.cash+=e.value;life.fish.splice(Number(id),1);sound.play("buy");
 }else if(op==="buyFish"&&where==="restaurant"){
  const e=marketFish(id);if(life.cash<e.price)return;life.cash-=e.price;life.fish.push({id:e.id,mass:e.mass,value:e.value});sound.play("buy");
 }else if(op==="buyFood"&&where==="restaurant"){
  const cost=foods[id][1];if(life.cash<cost)return;life.cash-=cost;life.food[id]++;sound.play("buy");
 }else if(op==="drink"&&where==="restaurant"){
  const b=beers[id];if(!b||life.cash<b.price||life.buzz>=100)return;
  life.cash-=b.price;life.buzz=Math.min(100,life.buzz+b.buzz);sound.play("buy");
  say(b.name+" · "+buzzLabel());
 }else if(op==="special"&&where==="restaurant"){
  const s=specials[life.lake];if(life.cash<s.price||life.energy>=100)return;
  life.cash-=s.price;life.energy=Math.min(100,life.energy+s.energy);sound.play("buy");
 }else if(op==="eat"&&where==="bag"){
  if(id==="tin"||!life.food[id]||life.energy>=99.99)return;life.food[id]--;life.energy=sat(life.energy+foods[id][2],0,100);
 }else if(op==="heat"&&where==="camp"){
  if(life.food.tin<1)return;life.food.tin--;life.food.stew++;passTime(5/60);say("Gorąca fasolka jest w plecaku.");
 }else if(op==="cook"&&where==="camp"){
  if(!life.owned.includes("grill")||!life.fish[Number(id)])return;
  life.fish.splice(Number(id),1);life.food.grilled++;life.counts.oboz=(life.counts.oboz||0)+1;passTime(.25);say("Pieczona ryba jest w plecaku.");
 }else if(op==="sleep"&&where==="sleep"){
  const delta=(Number(id)-life.time+24)%24||24;passTime(delta);life.time=Number(id);life.energy=100;save();closeBook();say("Pobudka · "+clockText()+" · "+period(life.time));return;
 }else updated=false;
 if(updated){save();drawBook();updateHUD();}
}
const sound={
 ctx:null,master:null,enabled:true,nextBird:0,
 start(){
  if(!this.enabled)return;
  try{
   if(!this.ctx){
    const ctx=this.ctx=new (window.AudioContext||window.webkitAudioContext)(),master=this.master=ctx.createGain();master.gain.value=.31;master.connect(ctx.destination);
    const buf=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),arr=buf.getChannelData(0);let n=0;
    for(let i=0;i<arr.length;i++){n=(n+.025*(Math.random()-.5))/.998;if(Math.abs(n)>.55)n*=.87;arr[i]=n*.21;}
    const noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter();noise.buffer=buf;noise.loop=true;filter.type="lowpass";filter.frequency.value=680;noise.connect(filter);filter.connect(master);noise.start();
   }
   if(this.ctx.state==="suspended")this.ctx.resume().catch(()=>{});
  }catch{}
 },
 tone(f,to,dur,amp,delay=0,type="sine"){
  if(!this.ctx||!this.enabled)return;const ctx=this.ctx,t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(to,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(amp,t+.013);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+.015);
 },
 play(k){
  if(k==="water"){this.tone(200,57,.18,.23);this.tone(610,235,.08,.055,.035);}
  if(k==="bite"){this.tone(750,1090,.13,.14);this.tone(920,1300,.09,.11,.18);}
  if(k==="cast")this.tone(490,155,.13,.07,0,"triangle");
  if(k==="hook")this.tone(130,290,.09,.14,0,"triangle");
  if(k==="buy"||k==="land"){this.tone(340,420,.12,.1);this.tone(540,660,.17,.11,.12);}
 },
 tick(t){
  if(this.ctx&&this.enabled&&phase==="fight"&&held&&t>(this.nextClick||0)){this.nextClick=t+.145;this.tone(460,170,.034,.065,0,"triangle");}
  if(this.ctx&&this.enabled&&!me.room&&t>this.nextBird){
   this.nextBird=t+5+Math.random()*10+weatherAt().rain*18;
   if(period(life.time)!=="noc"){this.tone(1890,2880,.13,.045);this.tone(2410,1530,.17,.04,.18);}
   else this.tone(2800,3020,.07,.021);
  }
  if(this.ctx&&this.enabled&&!me.room&&villageEvent()==="Wiejska potańcówka"&&t>(this.nextBar||0)){
   this.nextBar=t+.36;const d=Math.hypot(me.x-v.town.x,me.z-v.town.z);
   if(d<23){const notes=[293.7,370,440,493.9,440,370,329.6,370,440,370,329.6,293.7],f=notes[Math.floor(t/.36)%notes.length];this.tone(f,f*1.002,.28,.066*(1-d/23),0,"triangle");}
  }
 }
};
function updateHUD(){
 if(!me)return;
 $("clock").textContent=clockText();$("lake").textContent=ui(me.room?localInn().name:lake().name);$("cash").textContent=zl(life.cash);$("strength").textContent=strength();$("energy").textContent=Math.ceil(life.energy)+"/100";$("energybar").style.width=life.energy+"%";
 const place=findPlace(),location=me.aboard?stock[life.gear.boat][0]:place==="pier"?"Pomost":v[place]?.label||"Brzeg";
 $("location").textContent=ui(lake().region+" · "+weatherAt().name+" · "+location+(life.buzz>=1?" · "+buzzLabel():""));
 const interactLabels={pier:life.gear.boat?"Wsiądź do łodzi":"Przystań",land:"Przybij do pomostu",home:"Wejdź do domu rybaka",restaurant:"Wejdź do restauracji",camp:"Namioty i ognisko"};
 interactLabels.home="Wejdź · "+localInn().home;
 interactLabels.town="Plac · "+villageEvent();
 interactLabels.restaurant=me.room?(me.room.z>3.1&&Math.abs(me.room.x)<.9?"Otwórz drzwi na taras":Math.hypot(me.room.x+.72,me.room.z-.49)>2.5?"Podejdź do stolika":"Usiądź z wędkarzami"):"Wejdź · "+localInn().name;
 updateInnHUD(place);
 $("ride").hidden=!life.owned.includes("skladak")||!!me.room||me.aboard||phase!=="idle";
 $("ride").textContent=ui(me.cycling?"Zsiądź z roweru · B":"Wsiądź na składak · B");
 $("interact").hidden=!place||phase!=="idle";if(place)$("interact").innerHTML="<b>"+ui(interactLabels[place])+"</b><kbd>E</kbd>";
 const labels={idle:"Zarzuć wędkę",throw:"Zwiń zestaw",wait:"Zwiń zestaw",bite:"Zatnij!",fight:held?"Zwijasz · puść, by odpuścić":"Przytrzymaj i zwijaj"};
 $("cast").firstElementChild.textContent=ui(labels[phase]);$("cast").style.background=phase==="bite"?"#ffae63":phase==="fight"?"#b5c597":"";
 const rodButton=$("toggleRod");rodButton.hidden=!!me.room||!!me.cycling;rodButton.disabled=phase==="fight"||phase==="bite";
 rodButton.firstElementChild.textContent=ui(life.rodStowed?"Wyjmij wędkę":"Schowaj wędkę");
 const atInn=life.rodStowed||!!me.room||me.cycling||["restaurant","town"].includes(place)&&phase==="idle"&&!targetPoint().valid;
 $("cast").hidden=atInn;$("rangeLabel").hidden=phase!=="idle"||atInn;$("range").max=stat("rod");$("range").value=range;$("rangeText").textContent=range+" m";$("baitBtn").textContent=ui(stock[life.gear.bait][0]);
 $("fightInfo").hidden=phase==="idle";$("fightInfo").querySelector(".tension").hidden=phase!=="fight";
 $("fishStatus").textContent=ui(phase==="bite"?"Branie!":phase==="fight"?"Napięcie żyłki":phase==="throw"?"Rzut":"Obserwuj spławik");
 $("fightProgress").textContent=ui(phase==="fight"?"Hol "+Math.floor(cast.progress*100)+"% · "+(cast.tension>.74?"puść zwijanie":cast.tension<.36?"zwijaj teraz":"zielone pole"):phase==="bite"?"Naciśnij spację lub przycisk zacięcia.":"");
 if(phase==="fight"){const q=fightProfile(cast);$("pin").style.left=cast.tension*100+"%";
  $("zone").style.left=q.low*100+"%";$("zone").style.width=(q.high-q.low)*100+"%";
  $("fishStatus").textContent=ui("Hol · trudność "+q.rank+"/5");$("fightProgress").textContent=ui(Math.floor(cast.progress*100)+"% · "+(cast.tension>q.high?"odpuść":cast.tension<q.low?"zwijaj":q.pull>.68?"zryw ryby":"zielone pole"));}
 $("lesson").hidden=!!life.rodStowed||!!me.room||!!me.guide||me.cycling||place==="town"||(!life.tutorial&&!lessonBoat)||!firstHelp||phase!=="idle";
 $("lessonTitle").textContent=ui(lessonBoat?"Pierwsze wypłynięcie":"Pierwszy połów");
 $("lessonText").textContent=ui(lessonBoat?"Wypłyń na jezioro, zatrzymaj łódź i zarzuć wędkę. Po powrocie wybierz „Przybij do pomostu”.":"Zarzuć wędkę w jasny okrąg. Gdy spławik zanurkuje, zatnij. Podczas holu przytrzymuj i puszczaj zwijanie.");
}
function onPrimaryDown(e){
 sound.start();if(e.button!==undefined&&e.button!==0)return;
 if(phase==="fight"){held=true;updateHUD();}else act();
}
let reelPointer=null;
$("cast").addEventListener("pointerdown",e=>{if(reelPointer!==null)return;e.preventDefault();reelPointer=e.pointerId;$("cast").setPointerCapture(e.pointerId);onPrimaryDown(e);});
$("cast").addEventListener("click",e=>{if(e.detail===0)onPrimaryDown(e);});
function release(){if(held){held=false;updateHUD();}}
$("cast").addEventListener("lostpointercapture",e=>{if(reelPointer===e.pointerId){reelPointer=null;release();}});
document.addEventListener("pointerdown",()=>sound.start(),{once:true});
document.addEventListener("click",e=>{
 let b=e.target.closest("button");if(!b||b.disabled)return;
 if(b.dataset.menu)openBook(b.dataset.menu);else if(b.dataset.do)handle(b.dataset.do);
});
$("close").onclick=closeBook;book.addEventListener("cancel",e=>{e.preventDefault();closeBook();});
book.addEventListener("click",e=>{if(e.target===book){const r=book.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeBook();}});
$("dismiss").onclick=()=>{life.tutorial=false;lessonBoat=false;save();updateHUD();};
$("baitBtn").onclick=()=>openBook("bait");$("interact").onclick=interact;
$("sound").onclick=()=>{sound.enabled=!sound.enabled;if(sound.enabled)sound.start();if(sound.master)sound.master.gain.value=sound.enabled?.31:0;$("sound").textContent=sound.enabled?"♪":"♩";$("sound").setAttribute("aria-label",ui(sound.enabled?"Wycisz dźwięk":"Włącz dźwięk"));$("sound").style.opacity=sound.enabled?1:.55;};
$("range").oninput=e=>{range=Number(e.target.value);updateHUD();};
let dragging=null;
cv.addEventListener("pointerdown",e=>{if(book.open||inMenu||dragging)return;cv.focus();cv.setPointerCapture(e.pointerId);dragging=[e.clientX,e.clientY,e.pointerId];});
cv.addEventListener("pointermove",e=>{if(!dragging||dragging[2]!==e.pointerId)return;if(phase==="idle"){cam+=(e.clientX-dragging[0])*.007;pitch=sat(pitch+(e.clientY-dragging[1])*.018,-1.7,3);}dragging=[e.clientX,e.clientY,e.pointerId];});
cv.addEventListener("lostpointercapture",e=>{if(dragging?.[2]===e.pointerId)dragging=null;});
const stick={x:0,y:0,id:null};
function resetStick(){stick.x=0;stick.y=0;stick.id=null;$("stick").style.transform="translate(-50%,-50%)";}
function aimStick(e){
 const box=$("pad").getBoundingClientRect(),radius=box.width*.40;
 let dx=(e.clientX-box.left-box.width/2)/radius,dy=(e.clientY-box.top-box.height/2)/radius;
 const n=Math.max(1,Math.hypot(dx,dy));dx/=n;dy/=n;
 stick.x=Math.abs(dx)<.12?0:dx;stick.y=Math.abs(dy)<.12?0:-dy;
 $("stick").style.transform="translate(calc(-50% + "+dx*radius*.7+"px),calc(-50% + "+dy*radius*.7+"px))";
}
$("pad").addEventListener("pointerdown",e=>{if(stick.id!==null||inMenu||book.open)return;e.preventDefault();stick.id=e.pointerId;$("pad").setPointerCapture(e.pointerId);aimStick(e);});
$("pad").addEventListener("pointermove",e=>{if(stick.id===e.pointerId)aimStick(e);});
$("pad").addEventListener("lostpointercapture",e=>{if(stick.id===e.pointerId)resetStick();});
$("menuKey").onclick=()=>{saveFeedback="";save();showMenu();};
$("resumeGame").onclick=()=>{sound.start();resumeGame();};
window.addEventListener("keydown",e=>{
 if(book.open||e.altKey||e.ctrlKey||e.metaKey)return;
 if(e.code==="Escape"&&!e.repeat){e.preventDefault();if(inMenu)resumeGame();else{saveFeedback="";save();showMenu();}return;}
 if(inMenu)return;
 if(e.target.matches("input")&&["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.code))return;
 if(e.code==="Space"&&e.target.closest("button")&&e.target.closest("button")!==$("cast"))return;
 if(["Space","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.code))e.preventDefault();
 if(e.repeat)return;sound.start();keys.add(e.code);
 if(e.code==="Space")onPrimaryDown(e);
 if(e.code==="KeyE")interact();
 if(e.code==="KeyR")toggleRod();
 if(e.code==="KeyB")toggleCycle();
 if(e.code==="KeyI")openBook("bag");if(e.code==="KeyM")openBook("map");if(e.code==="KeyH")openBook("guide");
});
window.addEventListener("keyup",e=>{keys.delete(e.code);if(e.code==="Space")release();});
function pauseInput(){keys.clear();dragging=null;held=false;resetStick();prev=0;if(started)save();}
window.addEventListener("blur",pauseInput);document.addEventListener("visibilitychange",pauseInput);window.addEventListener("pagehide",pauseInput);
let lastMesh=null,sceneTick=-1;
function loop(now){
 let dt=prev?Math.min(.09,Math.max(0,(now-prev)/1000)):0;prev=now;
 if(!book.open&&!document.hidden&&!inMenu){
  elapsed+=dt;passTime(dt/135);boarding=Math.max(0,boarding-dt*1.7);move(dt);fishing(dt);sound.tick(elapsed);saveTimer+=dt;
  if(saveTimer>12){save();saveTimer=0;}
 }
 // The journal covers the scene, so a paused arrangement only needs one draw.
 if(inMenu&&!book.open&&!document.hidden)menuTime+=dt*.85;
 const renderTime=elapsed+(inMenu?menuTime:0),tick=Math.floor(renderTime*(eng.mobile?22:30));
 if(sceneTick!==tick||!lastMesh||eng.width!==cv.width||cv.clientWidth!==eng.cssWidth||cv.clientHeight!==eng.cssHeight){
  sceneTick=tick;lastMesh=makeScene(renderTime);
  const camera=inMenu&&!me.room?{eye:[-5.2+.85*Math.sin(menuTime*.04),3.45,v.tip+9.4],target:[1.6,2.7,v.tip-20],fov:.94}:cameraView(dt||.033);
  eng.frame(camera.eye,camera.target,camera.fov,lastMesh,renderTime);eng.cssWidth=cv.clientWidth;eng.cssHeight=cv.clientHeight;
 }
 if((frameHUD+=dt)>.12){updateHUD();frameHUD=0;}
 requestAnimationFrame(loop);
}
function boot(){
 prepareLanguage();
 try{eng=new Engine(cv);setupLake(life.lake,life.position,false);checkAwards();showMenu();requestAnimationFrame(loop);}
 catch(e){console.error(e);$("error").hidden=false;$("error").textContent=ui("Do uruchomienia widoku 3D włącz przyspieszenie grafiki w przeglądarce i otwórz grę ponownie.");}
}
cv.addEventListener("webglcontextlost",e=>{e.preventDefault();pauseInput();$("error").hidden=false;$("error").textContent=ui("Przywracanie obrazu 3D…");});
cv.addEventListener("webglcontextrestored",()=>location.reload());
boot();
