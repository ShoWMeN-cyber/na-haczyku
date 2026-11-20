let inMenu=false,started=false,menuTime=0,confirmSlot=0,saveFeedback="",awardToast="";
let hasAdventure=!!readLife(saveID);
const trophies=[
 ["first","Pierwszy połów","Wyholuj pierwszą rybę.",1,()=>Number(life.xp>0)],
 ["owner","Własna przystań","Kup pierwszą łódź.",1,()=>Number(life.owned.some(id=>stock[id]?.[1]==="boat"))],
 ["camp","Kuchnia polowa","Upiecz rybę na grillu.",1,()=>life.counts.oboz||0],
 ["explore","Trzy jeziora","Odwiedź wszystkie trzy jeziora.",3,l=>l.lakes.length],
 ["moon","Nocne branie","Wyholuj rybę pomiędzy 21:00 a 5:00.",1,l=>Number(l.night)],
 ["heavy","Okaz","Złów rybę o masie co najmniej 5 kg.",5,l=>l.best],
 ["atlas","Żywy atlas","Złów dziewięć różnych gatunków.",9,l=>l.species.length],
 ["fullAtlas","Polskie wody","Złów osiemnaście różnych gatunków.",18,l=>l.species.length],
 ["master","Człowiek znad jeziora","Odbierz nagrody za cztery zlecenia.",4,()=>life.paid.length],
 ["company","Wśród swoich","Zapytaj miejscowego wędkarza o łowisko.",1,l=>Number(!!l.talked)],
 ["tip","Poczta wędkarska","Złów wskazany gatunek w miejscu zaznaczonym po rozmowie.",1,l=>Number(!!l.tipped)],
 ["expert","Pewna ręka","Wyholuj rybę na piątym poziomie trudności.",1,l=>Number(!!l.expert)],
 ...lakes.map((l,i)=>["region"+i,"Znawca regionu · "+l.region,"Złów wszystkie gatunki w tym regionie.",l.fish.length,log=>l.fish.filter(id=>log.species.includes(id)).length]),
 ["atlas30","Pełny atlas","Złów wszystkie trzydzieści gatunków.",30,l=>l.species.length],
 ["allJobs","Na każde zawołanie","Rozlicz wszystkie zlecenia u rybaków.",quests.length,()=>life.paid.length]
];
function achievementLog(){
 if(!life.log){
  const species=[["pierwsza","ploc"],["zęby","szczupak"],["noc","sum"]].filter(([k])=>life.counts[k]>0).map(([,id])=>id);
  life.log={lakes:[life.lake],species,best:life.counts["zęby"]?2:0,night:false,unlocked:{}};
 }
 return life.log;
}
function checkAwards(){
 const log=achievementLog(),fresh=[];
 for(const [id,name,,goal,progress] of trophies){
  if(!log.unlocked[id]&&progress(log)>=goal){log.unlocked[id]={day:life.day,time:clockText()};fresh.push(name);}
 }
 if(fresh.length){awardToast=fresh.join(" · ");if(started)say("Osiągnięcie · "+awardToast);}
}
function showMenu(){
 inMenu=true;keys.clear();held=false;resetStick();sceneTick=-1;
 $("game").classList.add("at-menu");$("frontMenu").hidden=false;
 $("resumeGame").firstElementChild.textContent=ui(started?"Wróć do gry":hasAdventure?"Kontynuuj wyprawę":"Rozpocznij wyprawę");
 $("newGame").hidden=!(started||hasAdventure);$("menuLake").textContent=ui(lake().region+" · "+lake().name);
 $("menuStamp").textContent=ui("Dzień "+life.day+"  /  "+clockText());
 $("menuAwards").textContent=Object.keys(achievementLog().unlocked).length+" / "+trophies.length;
 $("resumeGame").focus({preventScroll:true});
}
function resumeGame(){
 if(book.open)closeBook();inMenu=false;started=true;hasAdventure=true;prev=0;sceneTick=-1;saveTimer=0;
 $("frontMenu").hidden=true;$("game").classList.remove("at-menu");keys.clear();resetStick();cv.focus({preventScroll:true});save();updateHUD();
}
function restoreAdventure(data){
 for(const k of Object.keys(life))delete life[k];
 Object.assign(life,data);latest=null;awardToast="";elapsed=0;menuTime=0;range=14;walkCycle=0;firstHelp=true;
 setupLake(life.lake,data.position,false);resumeGame();
}
const slotKey=i=>saveID+"-slot-"+i;
function stamp(d){
 const minutes=Math.floor(d.time*60)%1440,clock=String(Math.floor(minutes/60)).padStart(2,"0")+":"+String(minutes%60).padStart(2,"0");
 return lakes[d.lake].name+" · dzień "+d.day+" · "+clock+" · "+zl(d.cash);
}
function savePanel(){
 const auto=readLife(saveID),canSave=started||hasAdventure;
 let html=row("Zapis automatyczny",auto?stamp(auto):"Pojawi się po rozpoczęciu wyprawy.",btn("Wczytaj","restore|auto",!auto));
 for(let i=1;i<=3;i++){
  const s=readLife(slotKey(i));
  html+=row("Zapis "+i,s?stamp(s):"Wolne miejsce",btn("Zapisz","store|"+i,!canSave)+btn("Wczytaj","restore|"+i,!s));
 }
 return html+'<p class="saveStatus" role="status">'+(saveFeedback||"Zapisy są przechowywane w tej przeglądarce.")+"</p>";
}
function awardPanel(){
 const log=achievementLog(),n=Object.keys(log.unlocked).length;
 return '<p class="awardSummary">'+n+" z "+trophies.length+" zdobytych</p><div class='awardGrid'>"+trophies.map(([id,name,desc,goal,progress])=>{
  const earned=log.unlocked[id],value=Math.min(goal,progress(log)),unit=id==="heavy"?" kg":"";
  const count=(id==="heavy"?value.toFixed(2).replace(".",","):value)+" / "+goal+unit;
  return '<section class="award '+(earned?"earned":"")+'"><div class="awardState">'+(earned?"✓  Dzień "+earned.day+" · "+earned.time:count)+'</div><h3>'+name+"</h3><p>"+desc+'</p><progress max="'+goal+'" value="'+value+'"></progress></section>';
 }).join("")+"</div>";
}
function saveAction(op,id){
 if(op==="store"||op==="overwrite"){
  const slot=Number(id);if(![1,2,3].includes(slot))return;
  if(op==="store"&&readLife(slotKey(slot))){confirmSlot=slot;openBook("overwrite");return;}
  saveFeedback=save(slotKey(slot))?"Zapisano wyprawę w miejscu "+slot+".":"Przeglądarka zablokowała zapis. Sprawdź dostęp do pamięci witryny.";openBook("saves");
 }else if(op==="restore"){
  const data=readLife(id==="auto"?saveID:slotKey(Number(id)));if(!data){saveFeedback="Tego zapisu nie udało się odczytać.";openBook("saves");return;}
  restoreAdventure(data);say("Wczytano wyprawę.");
 }else if(op==="restart")restoreAdventure(newLife());
}
