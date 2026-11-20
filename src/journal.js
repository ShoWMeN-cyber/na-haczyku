const btn=(text,action,disabled=false,cls="")=>`<button class="${cls}" data-do="${action}" ${disabled?"disabled":""}>${text}</button>`;
const row=(title,desc,buttons="")=>`<div class="row"><div><b>${title}</b><small>${desc}</small></div>${buttons}</div>`;
const chipBar=(entries,current,action)=>'<div class="chips">'+entries.map(([id,label])=>btn(label,action+"|"+id,false,id===current?"on":"")).join("")+'</div>';
const titles={home:"Dom rybaka",shop:"Skład wędkarski",quests:"Zlecenia rybaka",restaurant:"Pod Wiosłem",camp:"Obóz nad wodą",sleep:"Wybierz godzinę pobudki",map:"Mapa okolicy",bag:"Twój plecak",guide:"Poradnik wędkarza",bait:"Pudełko z przynętami",pier:"Przystań",catch:"Ryba w podbieraku"};
let guideTab="start";
Object.assign(titles,{town:"Plac wiejski",saves:"Zapisy gry",awards:"Osiągnięcia",fresh:"Nowa wyprawa",overwrite:"Zastąpić zapis?"});
function openBook(k){
 if(!titles[k])return;
 if(!book.open){keys.clear();held=false;resetStick();book.showModal();}
 where=k;sceneTick=-1;drawBook();
}
function closeBook(){if(book.open)book.close();where="";keys.clear();held=false;if(inMenu)showMenu();else cv.focus({preventScroll:true});updateHUD();}
function drawBook(){
 $("bookTitle").textContent=where==="home"?localInn().home:where==="restaurant"?localInn().name:titles[where];$("bookKicker").textContent=lake().name+" · "+clockText()+" · "+zl(life.cash);
 let html="";
 if(where==="saves"){html=savePanel();}
 else if(where==="awards"){html=awardPanel();}
 else if(where==="town"){html=row(v.town.label,villageEvent())+row("Targ","Od 10:00 do 18:00 mieszkańcy schodzą się na plac.")+row("Potańcówka","Od 18:00 do północy gra akordeon. Na placu tańczą pary.")+btn("Wróć na plac","back");}
 else if(where==="fresh"){
  html='<p>Rozpoczniesz pierwszy dzień z podstawową wędką. Nowa wyprawa zastąpi zapis automatyczny. Ręczne zapisy będą dostępne w menu.</p>'+btn("Rozpocznij od nowa","restart",false,"solid")+" "+btn("Wróć","back");
 }else if(where==="overwrite"){
  html="<p>Obecna wyprawa zastąpi grę w miejscu "+confirmSlot+".</p>"+btn("Zastąp zapis","overwrite|"+confirmSlot,false,"solid")+" "+btn("Anuluj","open|saves");
 }else if(where==="home"){
  html='<p>'+localInn().owner+' odkłada kubek na parapet. „Wejdź. Zobacz, czego dzisiaj szukają w kuchni”.</p>'+
  row("Zlecenia","Zapłata za udane połowy i obozową kuchnię.",btn("Zobacz zlecenia","open|quests"))+
  row("Sprzęt i łodzie","Wędki, kołowrotki, żyłki, haczyki, przynęty, ubrania i grill.",btn("Otwórz sklep","open|shop"))+
  row("Składak turystyczny",life.owned.includes("skladak")?"Masz już składak. Na dworze wybierz przycisk roweru lub naciśnij B.":"Rower składany za 240 zł. Na dworze można wsiadać i zsiadać klawiszem B albo przyciskiem.",btn("Zobacz w sklepie","bikes"))+
  row("Łóżko na poddaszu","Sen uzupełnia energię. Możesz wybrać godzinę pobudki.",btn("Prześpij się","open|sleep"));
 }else if(where==="shop"){
  html=chipBar(Object.entries(groups),shopTab,"shopTab");
  for(const [id,[name,group,price,,desc]] of Object.entries(stock)){
   if(group!==shopTab)continue;
   const own=life.owned.includes(id),equipped=life.gear[group]===id||group==="kit"&&own;
   html+=row(name,desc,btn(equipped?"W użyciu":own?"Wybierz":zl(price),"stock|"+id,equipped||(!own&&price>life.cash),own?"":"solid"));
  }
  html+=btn("Wróć do rybaka","open|home");
 }else if(where==="quests"){
  html="<p>Rybak zapisuje postęp od pierwszego połowu. Po nagrodę zajrzyj do niego osobiście.</p>";
  for(const [id,name,desc,num,reward] of quests){
   const n=Math.min(life.counts[id]||0,num),paid=life.paid.includes(id);
   html+=row(name,desc+" · "+n+"/"+num+" · "+zl(reward),btn(paid?"Odebrano":"Odbierz","reward|"+id,paid||n<num));
  }
 }else if(where==="pier"){
  html="<p>Twoja łódź będzie czekać przy prawej burcie pomostu. Po klucze zajdź do domu rybaka.</p>"+btn("Idź do domu rybaka","go|home",false,"solid");
 }else if(where==="restaurant"){
  const s=specials[life.lake];
  html=btn("Wróć do sali","back")+"<h3>Dziś w gospodzie</h3>"+row(s.name,s.description+" · +"+s.energy+" energii",btn("Zamów · "+zl(s.price),"special",life.cash<s.price||life.energy>=100))+"<h3>Piwo na miejscu</h3>";
  for(const [id,b] of Object.entries(beers))html+=row(b.name,b.description,btn("Wypij · "+zl(b.price),"drink|"+id,life.cash<b.price||life.buzz>=100));
  html+=row("Stan postaci",buzzLabel())+"<h3>Skup ryb u Basi</h3>";
  const total=life.fish.reduce((n,e)=>n+e.value,0);
  html+=row("Twój połów",life.fish.length+" szt. · "+zl(total),btn("Sprzedaj wszystkie","sellAll",!total,"solid"));
  life.fish.forEach((e,i)=>html+=row(fish[e.id][0],kg(e.mass),btn("Sprzedaj · "+zl(e.value),"sell|"+i)));
  html+="<h3>Na wynos</h3>";
  for(const id of ["sand","tin"]){let f=foods[id];html+=row(f[0],id==="sand"?"Gotowa do zjedzenia · +19 energii":"Do podgrzania na ognisku · po podgrzaniu +40 energii",btn(zl(f[1]),"buyFood|"+id,life.cash<f[1]));}
  html+="<h3>Świeże ryby</h3>";
  for(const id of lake().fish){let e=marketFish(id);html+=row(fish[id][0],kg(e.mass)+" · do pieczenia na grillu",btn(zl(e.price),"buyFish|"+id,life.cash<e.price));}
 }else if(where==="camp"){
  html="<p>Przy namiotach pali się ognisko. Na kamieniach jest miejsce na puszkę.</p>"+
  row("Namiot","Wybierz porę pobudki i odzyskaj energię.",btn("Idź spać","open|sleep"))+
  row("Ognisko","Puszki w plecaku: "+life.food.tin+". Podgrzanie jednej zajmuje 5 minut.",btn("Podgrzej puszkę","heat",life.food.tin<1,"solid"))+
  row("Składany grill",life.owned.includes("grill")?"Rozstawiony przy namiocie. Pieczenie trwa 15 minut.":"Składany grill kupisz w domu rybaka za 78 zł.",life.owned.includes("grill")?"":btn("Idź do rybaka","go|home"));
  if(life.owned.includes("grill")){
   if(!life.fish.length)html+="<p>Do pieczenia potrzebujesz surowej ryby.</p>";
   life.fish.forEach((e,i)=>html+=row(fish[e.id][0],kg(e.mass),btn("Upiecz rybę","cook|"+i)));
  }
 }else if(where==="sleep"){
  html="<p>Budzik dzwoni o najbliższej wybranej godzinie. Po śnie energia wraca do 100.</p>";
  for(const [h,label] of [[5,"Świt"],[12,"Południe"],[18,"Wieczór"],[22,"Noc"]]){
   const ids=lake().fish.filter(id=>fish[id][4].includes(period(h)));
   html+=row(label+" · "+String(h).padStart(2,"0")+":00","Żerują: "+ids.map(id=>fish[id][0].toLocaleLowerCase("pl")).join(", "),btn("Nastaw budzik","sleep|"+h));
  }
 }else if(where==="map"){
  html='<canvas class="chart" id="chart" width="760" height="390" aria-label="Mapa jeziora, osady i dróg. Czerwona kropka oznacza gracza."></canvas><div class="mapTools">'+btn("−","mapZoom|minus")+btn("+","mapZoom|plus")+btn("Moja pozycja","mapZoom|me")+btn("Cała okolica","mapZoom|region")+'</div><h3>Miejsca nad jeziorem</h3>';
  for(const id of mapPlaces){
   const p=v[id],blocked=me.aboard||phase!=="idle",named=["restaurant","home","town"].includes(id);
   html+=row((mapPlaces.indexOf(id)+1)+". "+p.label,(id==="home"?"Dom rybaka · ":id==="restaurant"?"Restauracja · ":id==="town"?"Osada · "+villageEvent()+" · ":"")+"Około "+Math.round(Math.hypot(me.x-p.x,me.z-p.z))+" m",(named?btn("Prowadź pieszo","route|"+id,blocked):"")+btn("Przejdź","go|"+id,blocked));
  }
  const marked=markedReport();if(marked)html+=row("Wskazówka ze stolika",fish[marked.id][0]+" · "+marked.spot+" · "+marked.period);
  html+="<h3>Podróż na inne jezioro</h3>";
  const opened=lakeAccess();
  lakes.forEach((l,i)=>{const locked=!opened.includes(i),g=lakeGates[i];
   const requirements=locked?"<br><strong>Zlecenia "+Math.min(life.paid.length,g.jobs)+"/"+g.jobs+" · Portfel "+Math.min(life.cash,g.cash)+"/"+zl(g.cash)+"</strong>":"";
   html+=row(l.name+" · "+l.region,l.feature+"<br>"+l.fish.map(id=>fish[id][0]).join(" · ")+requirements,btn(i===life.lake?"Jesteś tutaj":locked?"Zablokowane":"Jedź","lake|"+i,locked||i===life.lake||me.aboard||phase!=="idle"));});
  if(me.aboard)html+="<small>Do podróży zejdź na pomost. Na mapie zaznaczono go kwadratem.</small>";
 }else if(where==="bag"){
  html=chipBar([["fish","Ryby"],["food","Prowiant"],["gear","Wyposażenie"],["stats","Postać"]],bagTab,"bagTab");
  if(bagTab==="fish"){
   if(!life.fish.length)html+="<p>Siatka jest pusta. Zarzuć wędkę z pomostu albo z łodzi.</p>";
   life.fish.forEach(e=>html+=row(fish[e.id][0],kg(e.mass),"<b>"+zl(e.value)+"</b>"));
   html+="<small>W restauracji możesz sprzedać wybrane ryby. Przy namiocie możesz je upiec.</small>";
  }else if(bagTab==="food"){
   for(const [id,f] of Object.entries(foods)){html+=row(f[0]+" × "+life.food[id],id==="tin"?"Podgrzej na ognisku.":"+"+f[2]+" energii",id==="tin"?"":btn("Zjedz","eat|"+id,!life.food[id]||life.energy>=99.99));}
  }else if(bagTab==="gear"){
   for(const id of life.owned){let [name,g,,,desc]=stock[id],on=life.gear[g]===id||g==="kit";html+=row(name,desc,btn(on?"W użyciu":"Wybierz","equip|"+id,on||phase!=="idle"||g==="boat"&&me.aboard));}
  }else html+=row("Energia",Math.ceil(life.energy)+" / 100 · odpoczynek i jedzenie odnawiają energię.")+row("Siła",strength()+" · doświadczenie "+life.xp+". Kolejny poziom przy "+(6*strength()**2)+" punktach.")+row("Dzień "+life.day,clockText()+" · "+period(life.time))+row("Zapis",saveError?"Ta przeglądarka blokuje zapis.":"Automatycznie w tej przeglądarce.");
 }else if(where==="bait"){
  for(const id of life.owned.filter(id=>stock[id][1]==="bait"))html+=row(stock[id][0],stock[id][4],btn(life.gear.bait===id?"Wybrano":"Załóż","equip|"+id,life.gear.bait===id||phase!=="idle"));
 }else if(where==="catch"&&latest){
  html='<div class="center"><canvas class="fishpic" id="fishpic" width="500" height="200"></canvas><h3>'+fish[latest.id][0]+'</h3><p>'+kg(latest.mass)+' · wartość w restauracji '+zl(latest.value)+'</p><p>Ryba trafiła do siatki.</p>'+btn("Wróć nad wodę","back",false,"solid")+'</div>';
 }else if(where==="guide"){
  html=chipBar([["start","Pierwszy połów"],["world","Życie nad wodą"],["fish","Atlas ryb"],["keys","Sterowanie"]],guideTab,"guideTab");
  if(guideTab==="start")html+="<h3>1. Znajdź miejsce</h3><p>Stań nad wodą. Obróć widok i ustaw odległość suwakiem. Jasny okrąg na jeziorze wskazuje miejsce rzutu.</p><h3>2. Obserwuj spławik</h3><p>Zarzuć spacją lub przyciskiem. Gdy spławik zanurkuje i pojawi się „Zatnij!”, naciśnij ponownie.</p><h3>3. Wyholuj rybę</h3><p>Przytrzymuj spację lub przycisk zwijania, aż wskazówka zbliży się do końca zielonego pola. Puść na chwilę i powtarzaj. Na zbyt mocnej żyłce ryba ją zerwie, a na luźnej spadnie z haczyka.</p>";
  if(guideTab==="world")html+="<h3>Pierwsza łódka</h3><p>Za trzy płocie rybak wypłaca 115 zł. Dołóż pieniądze ze sprzedaży połowu lub rozlicz zlecenie „Pełna siatka”. Wiosłówka kosztuje 160 zł. Kup ją w składzie wędkarskim i wsiądź przy pomoście.</p><h3>Energia i siła</h3><p>Wiosłowanie i hol męczą. W restauracji kupisz kanapkę, puszkę fasolki lub rybę. Kanapkę zjesz od razu z plecaka. Puszkę podgrzej na ognisku. Do pieczenia ryb kup grill i podejdź do namiotów. Każdy udany połów daje doświadczenie i rozwija siłę.</p><h3>Sen i sąsiedzi</h3><p>W namiocie i w domu rybaka wybierz godzinę pobudki. Inne gatunki żerują o świcie (5–10), w dzień (10–17), wieczorem (17–21) i nocą (21–5). Żaglówki oraz łodzie miejscowych mają własne trasy. Omiń je podczas pływania.</p>";
  if(guideTab==="fish")for(const l of lakes){html+="<h3>"+l.name+"</h3>";for(const id of l.fish){let f=fish[id];html+=row(f[0]+" · trudność "+fishRanks[id]+"/5",f[4].split(" ").join(" · ")+" / "+stock[f[5]][0]+(id==="sum"?" / tylko z łodzi w głębi jeziora":""));}}
  if(guideTab==="keys")html+="<p><b>WASD</b> — chodzenie. Na łodzi W i S sterują prędkością, A i D skręcają.</p><p><b>Przeciąganie widoku lub strzałki</b> — obrót kamery.</p><p><b>Spacja</b> — rzut, zacięcie lub przytrzymanie do holu.</p><p><b>E</b> — skorzystaj z miejsca obok postaci. <b>M</b> — mapa i przejścia. <b>I</b> — plecak. <b>H</b> — poradnik. <b>Esc</b> — zamknij okno.</p><p>Na ekranie dotykowym do kierowania postacią lub łodzią służy okrągły drążek.</p>";
 }
 if(where==="bag"&&bagTab==="stats")html+=row("Stan postaci",buzzLabel())+row("Pogoda",weatherAt().name+" · "+lake().region);
 if(where==="guide"&&guideTab==="world")html+="<h3>Pogoda i woda</h3><p>Obserwuj szuwary, fale i niebo. W trakcie dnia nadciągają chmury, deszcz i mgła. Na Trzcinowym opływaj wysepki, a na Głębokim trzymaj się jeziora przed zaporą.</p><h3>Rower i osada</h3><p>Składak kosztuje 240 zł w domu rybaka. Wsiadaj i zsiadaj klawiszem B albo przyciskiem roweru. W osadzie od 10:00 działa targ, a o 18:00 na plac wychodzą tancerze.</p><h3>Przy stoliku</h3><p>Na mapie wybierz gospodę i „Prowadź pieszo”. Idź po złotych śladach do drzwi. W sali zajmij krzesło, wybierz rozmówcę i zapytaj o ryby. Zaznaczone łowisko pojawi się na mapie i na wodzie do końca bieżącej pory żerowania.</p><h3>Kolejne jeziora</h3><p>Trzcinowe wymaga dwóch rozliczonych zleceń i 450 zł w portfelu. Głębokie wymaga czterech i 1200 zł. Pieniądze zachowujesz.</p><h3>W gospodzie</h3><p>Na tablicy czeka inne danie w każdej okolicy. Basia nalewa jasne pełne i porter bałtycki. Stan upojenia sprawdzisz w plecaku. Po piwie postać kołysze się i trudniej utrzymuje kierunek. Efekt słabnie w miarę upływu czasu, także podczas snu.</p>";
 if(where==="catch"&&awardToast){html+='<p class="awardSummary">Zdobyte osiągnięcie · '+awardToast+"</p>";awardToast="";}
 if(where==="guide"&&guideTab==="keys")html+="<p><b>Na telefonie</b> lewy drążek służy do ruchu, a przeciągnięcie po jeziorze obraca kamerę. Przytrzymaj duży przycisk, aby zwijać żyłkę. Przycisk Menu otwiera zapisy i osiągnięcia.</p>";
 $("content").innerHTML=html;
 if(where==="map")chart();
 if(where==="catch")fishPicture(latest.id);
}
function marketFish(id){const f=fish[id],mass=Math.round(f[1]*130)/100,value=fishValue(id,mass);return {id,mass,value,price:Math.ceil(value*1.45)};}
function fishPicture(id){
 const g=$("fishpic").getContext("2d"),f=fish[id],long=["szczupak","sum","sandacz","ukleja","sielawa","pstrag"].includes(id),h=long?31:50,col="#"+f[7].toString(16).padStart(6,"0");
 if(id==="wegorz"){
  g.translate(34,97);g.fillStyle=col;g.beginPath();g.moveTo(12,8);g.bezierCurveTo(14,-19,61,-18,112,-2);g.bezierCurveTo(218,44,282,-63,410,-12);g.bezierCurveTo(286,-45,236,65,109,20);g.bezierCurveTo(72,10,47,4,25,15);g.quadraticCurveTo(9,19,12,8);g.fill();
  g.fillStyle="#263324";g.beginPath();g.arc(31,0,3,0,TAU);g.fill();return;
 }
 g.translate(28,98);const grad=g.createLinearGradient(0,-h,0,h);grad.addColorStop(0,"#505d46");grad.addColorStop(.41,col);grad.addColorStop(.9,"#dacda4");
 const fin=(a,b,c)=>{g.fillStyle=["ploc","wzdrega","jaz","okon"].includes(id)?"#b67754":"#8d8263";g.beginPath();g.moveTo(...a);g.lineTo(...b);g.lineTo(...c);g.closePath();g.fill();};
 fin([312,-6],[408,-42],[377,2]);fin([312,5],[377,2],[408,44]);fin([175,-h*.72],[211,-h*1.49],[257,-h*.65]);fin([158,h*.59],[199,h*1.42],[216,h*.62]);
 g.fillStyle=grad;g.beginPath();g.moveTo(20,2);g.bezierCurveTo(56,-h*.72,146,-h*1.54,245,-h*.75);g.quadraticCurveTo(294,-10,338,-8);g.lineTo(338,8);g.bezierCurveTo(285,9,227,h*1.02,150,h);g.bezierCurveTo(96,h,40,23,20,2);g.fill();
 g.strokeStyle="#605e4477";g.lineWidth=1.3;
 if(id==="pstrag"){const rnd=seeded(132);for(let j=0;j<53;j++){const x=96+rnd()*160,y=(rnd()-.64)*30;g.beginPath();g.fillStyle=j%4?"#66583e":"#9e503d";g.arc(x,y,1+rnd()*1.5,0,TAU);g.fill();}}
 for(let i=0;i<12;i++)for(let j=-1;j<=1;j++){g.beginPath();g.arc(127+i*13+(j%2)*4,j*13,5.5,-.85,.85);g.stroke();}
 g.beginPath();g.moveTo(87,-h*.64);g.quadraticCurveTo(117,2,85,h*.62);g.stroke();
 g.fillStyle="#e4cf95";g.beginPath();g.arc(59,-8,8,0,TAU);g.fill();g.fillStyle="#273125";g.beginPath();g.arc(59,-8,4.4,0,TAU);g.fill();fin([112,9],[156,39],[142,17]);
}
