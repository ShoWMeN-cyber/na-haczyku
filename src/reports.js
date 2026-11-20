const fishingSpots=[
 [["przy piaszczystym brzegu",1.33,.78],["na lewo od pomostu",1.86,.82],["na wodzie przed stanicą",4.69,.52],["w głębi brzozowej zatoki",3.65,.41]],
 [["przy skraju szuwarów",1.32,.78],["przy trzcinach obok obozu",2.22,.81],["od zachodniej strony wieży",3.90,.41],["w przesmyku na wschodzie",.12,.48]],
 [["przy kamienistym brzegu",.64,.79],["przy brzegu pod lasem",2.15,.81],["na głębokiej wodzie przed zaporą",4.76,.40],["w głębi górskiej zatoki",3.47,.38]]
];
function dailyReport(speaker,time=life.time,day=life.day){
 const slot=2*speaker+((day-1+life.lake)%2),[spot,angle,r]=fishingSpots[life.lake][slot];
 const [x,z]=polar(lake(),angle,r),depth=1-r,afloat=speaker===1,ids=eligibleFish(depth,afloat,time);
 const id=ids[(day-1+life.lake+speaker)%ids.length];
 return {id,x,z,spot,slot,afloat,day,period:period(time),lake:life.lake};
}
function markedReport(){
 const tip=life.fishingTip;
 if(!tip||tip.lake!==life.lake||tip.day!==life.day||tip.period!==period(life.time)||![0,1].includes(tip.speaker))return null;
 return dailyReport(tip.speaker);
}
function tableDialogue(){
 const {speaker,topic}=conversation,locals=localInn().guests,r=dailyReport(speaker),f=fish[r.id],name=f[0].toLocaleLowerCase("pl"),bait={robak:"robaka",kukurydza:"kukurydzę",błystka:"błystkę",plankton:"kostkę planktonową"}[f[5]];
 const activeMark=markedReport()?.slot===r.slot;
 const nextHour={świt:10,dzień:17,wieczór:21,noc:5}[r.period],next=dailyReport(speaker,nextHour,life.day+(nextHour<=life.time?1:0));
 const lines=speaker===0?{
  hello:"Przysuń krzesło. Ja zwykle łowię z brzegu. Co chcesz wiedzieć?",
  spot:"Dzisiaj bierze "+name+". Spróbuj "+r.spot+". Z brzegu spokojnie dorzucisz.",
  bait:"Załóż "+bait+". Rzuć tam, gdzie ci pokazałam. Jak spławik pójdzie pod wodę, zacinaj.",
  later:"O "+String(nextHour).padStart(2,"0")+":00 spróbuj jeszcze raz. Wtedy bierze "+fish[next.id][0].toLocaleLowerCase("pl")+" "+next.spot+"."
 }:{
  hello:"Dosiądź się. Z łódki dobrze widać, gdzie drobnica ucieka spod drapieżnika.",
  spot:"Weź łódkę i stań "+r.spot+". Dziś dobrze chodzi tam "+name+".",
  bait:"U mnie sprawdza się zestaw na "+bait+". Zatrzymaj łódkę obok łowiska i rzuć w stronę znacznika.",
  later:"O "+String(nextHour).padStart(2,"0")+":00 bierze "+fish[next.id][0].toLocaleLowerCase("pl")+". Wypatruj spławika "+next.spot+"."
 };
 const person=(i)=>'<button data-do="speaker|'+i+'" aria-pressed="'+(i===speaker)+'">'+locals[i]+'</button>';
 return '<div class="company">'+person(0)+person(1)+'<button class="stand" data-do="stand">Wstań</button></div><p aria-live="polite"><b>'+locals[speaker]+'</b> „'+lines[topic]+'”</p><div class="questions">'+btn("Gdzie biorą?","ask|spot")+btn("Na co łowić?","ask|bait")+btn("A później?","ask|later")+(["spot","bait"].includes(topic)?btn(activeMark?"Na mapie ✓":"Zaznacz łowisko","pinFish",activeMark):"")+'</div>';
}
