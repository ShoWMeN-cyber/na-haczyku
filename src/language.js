// Translate only presentation text. Species, equipment, places and save keys stay stable.
const languageKey="na-haczyku-language";
function savedLanguage(){try{return localStorage.getItem(languageKey)==="en"?"en":"pl";}catch{return "pl";}}
let language=savedLanguage();
const english=new Map();
function addEnglish(lines){
 for(const line of lines.trim().split("\n")){const cut=line.indexOf("|");english.set(line.slice(0,cut),line.slice(cut+1));}
}
function ui(value){
 if(language==="pl"||typeof value!=="string")return value;
 const s=value.trim();if(!s)return value;
 const translated=english.get(s)??dynamicEnglish(s);
 return value.replace(s,()=>translated);
}
function dynamicEnglish(s){
 for(const [pattern,format] of englishPatterns){const m=s.match(pattern);if(m)return format(...m.slice(1));}
 for(const split of [" · "," / ",", "])if(s.includes(split))return s.split(split).map(ui).join(split);
 return s;
}
const englishPatterns=[
 [/^(.+) odkłada kubek na parapet\..+$/,n=>n+' sets his mug on the windowsill. “Come in. Let’s see what the kitchen needs today.”'],
 [/^Puszki w plecaku: (\d+)\. Podgrzanie jednej zajmuje 5 minut\.$/,n=>"Tins in your backpack: "+n+". Heating one takes 5 minutes."],
 [/^Obecna wyprawa zastąpi grę w miejscu (\d+)\.$/,n=>"Your current trip will replace the game in slot "+n+"."],
 [/^Zapisano wyprawę w miejscu (\d+)\.$/,n=>"Trip saved to slot "+n+"."],
 [/^(\d+) z (\d+) zdobytych$/, (n,t)=>n+" of "+t+" unlocked"],
 [/^Zapis (\d+)$/,n=>"Save slot "+n],
 [/^([Dd])zień (\d+)(.*)$/, (c,n,tail)=>(c==="D"?"Day ":"day ")+n+ui(tail)],
 [/^✓\s+Dzień (.+)$/,s=>"✓  Day "+s],
 [/^Żerują: (.+)$/,s=>"Fish feeding: "+ui(s)],
 [/^(\d+)\. (.+)$/, (n,s)=>n+". "+ui(s)],
 [/^Około (\d+) m$/,n=>"About "+n+" m"],
 [/^(Zlecenia|Portfel) (\d+\/\d+)( zł)?$/, (k,n,u)=>(k==="Zlecenia"?"Jobs ":"Wallet ")+n+(u||"")],
 [/^(\d+) szt\.$/,n=>n+" fish"],
 [/^\+(\d+) energii$/,n=>"+"+n+" energy"],
 [/^(.+) × (\d+)$/, (s,n)=>ui(s)+" × "+n],
 [/^doświadczenie (\d+)\. Kolejny poziom przy (\d+) punktach\.$/, (n,t)=>n+" XP. Next level at "+t+" XP."],
 [/^trudność (\d+\/5)$/,n=>"difficulty "+n],
 [/^wartość w restauracji (.+)$/,s=>"sale price at the inn "+s],
 [/^Rzut do (\d+) m$/,n=>"Casting range: "+n+" m"],
 [/^(\d+),(\d+) kg$/, (a,b)=>a+"."+b+" kg"],
 [/^(\d+),(\d+)$/, (a,b)=>a+"."+b],
 [/^Hol (\d+%)$/,s=>"Reeling "+s]
];
function uiMarkup(html){
 if(language==="pl")return html;
 return html.split(/(<[^>]+>)/g).map(part=>part.startsWith("<")?part.replace(/(aria-label|title)="([^"]+)"/g,(_,k,v)=>k+'="'+ui(v)+'"'):ui(part)).join("");
}
let languageBindings=[];
function prepareLanguage(){
 // Keep the original node and its Polish text so switching back preserves nested controls.
 for(const el of document.querySelectorAll("#game, #game *, title")){
  for(const node of el.childNodes)if(node.nodeType===3&&node.nodeValue.trim()&&el.tagName!=="SCRIPT"){
   const source=node.nodeValue;languageBindings.push(()=>{node.nodeValue=ui(source);});
  }
  for(const attr of ["aria-label","title"])if(el.hasAttribute(attr)){
   const source=el.getAttribute(attr);languageBindings.push(()=>el.setAttribute(attr,ui(source)));
  }
 }
 applyLanguage();
}
function applyLanguage(){
 if(document.documentElement)document.documentElement.lang=language;
 for(const write of languageBindings)write();
 for(const b of document.querySelectorAll(".languageSwitch button"))b.setAttribute("aria-pressed",String(b.lang===language));
}
function setLanguage(next){
 if(!["pl","en"].includes(next)||language===next)return;
 language=next;try{localStorage.setItem(languageKey,next);}catch{}
 applyLanguage();lastConversation="";saveFeedback="";
 if(me){updateHUD();if(inMenu)showMenu();if(book.open)drawBook();}
 if(noticeSource)$("notice").textContent=ui(noticeSource);
 $("sound").setAttribute("aria-label",ui(sound.enabled?"Wycisz dźwięk":"Włącz dźwięk"));
 document.querySelector?.('[data-do="language|'+next+'"]')?.focus();
}
let noticeSource="";
addEnglish(`Na haczyku — nad jeziorem|Na haczyku — At the lake
Jezioro w 3D|3D lake
Dźwięk|Sound
Wycisz dźwięk|Mute sound
Włącz dźwięk|Enable sound
Otwórz menu gry|Open game menu
Mapa|Map
Plecak|Backpack
Poradnik|Guide
Energia|Energy
Siła|Strength
Ukryj wskazówkę|Dismiss tip
Karta dań|Food and drink
Wyjdź na taras|Go out to the terrace
Zarzuć wędkę|Cast your line
SPACJA|SPACE
Odległość rzutu|Casting distance
ruch|move
lub przeciągnij widok|or drag to look around
Drążek ruchu|Movement joystick
Rozmowa przy stoliku|Table conversation
Menu główne|Main menu
Rozpocznij wyprawę|Start fishing
Wróć do gry|Resume game
Kontynuuj wyprawę|Continue trip
Zapisy gry|Saved games
Osiągnięcia|Achievements
Nowa wyprawa|New trip
Zamknij|Close
Język|Language
Drogowskaz|Signpost
dom i gospoda|cottage and inn
Dom rybaka|Fisherman’s cottage
Skład wędkarski|Tackle shop
Zlecenia rybaka|Fishing jobs
Obóz nad wodą|Lakeside camp
Wybierz godzinę pobudki|Set your alarm
Mapa okolicy|Area map
Twój plecak|Your backpack
Poradnik wędkarza|Fishing guide
Pudełko z przynętami|Bait box
Przystań|Boat landing
Ryba w podbieraku|In the landing net
Plac wiejski|Village square
Zastąpić zapis?|Replace saved game?
Jezioro Brzozowe|Lake Brzozowe
Jezioro Trzcinowe|Lake Trzcinowe
Jezioro Głębokie|Lake Głębokie
Piaszczysta zatoka i mazurska stanica|Sandy bay and a Masurian boathouse
Szuwary, wysepki i wieża obserwacyjna|Reed beds, small islands and a lookout tower
Skalista dolina z kamienną zaporą|Rocky valley with a stone dam
świt|dawn
dzień|daytime
wieczór|evening
noc|night
Świt|Dawn
Południe|Noon
Wieczór|Evening
Noc|Night
Brzeg|Shore
Pomost|Pier
Obóz i ognisko|Campsite and campfire
Pogodnie|Clear skies
Zachmurzenie|Overcast
Przelotny deszcz|Rain showers
Wietrznie|Windy
Mgła|Fog
Wędki|Rods
Kołowrotki|Reels
Żyłki|Lines
Haczyki|Hooks
Przynęty|Bait
Ubrania|Clothing
Łodzie|Boats
Obóz i rower|Camping and cycling
Wędka z leszczyny|Hazel rod
Wędka Trzcina|Trzcina rod
Wędka Głębia|Głębia rod
Zwykły kołowrotek|Basic reel
Zwykłe tempo zwijania|Standard retrieve speed
Kołowrotek Wicher|Wicher reel
Szybsze zwijanie żyłki|Faster retrieve
Żyłka 0,20 mm|0.20 mm line
Żyłka 0,32 mm|0.32 mm line
Lekka żyłka spławikowa|Light line for float fishing
Lepiej znosi zrywy dużych ryb|Withstands stronger runs from big fish
Haczyk nr 10|Size 10 hook
Podstawowy haczyk|Standard hook
Haczyk kuty|Forged hook
Dłużej trzyma rybę na luźnej żyłce|Keeps fish hooked longer when the line is slack
Robak|Worm
Kukurydza|Sweetcorn
Błystka|Spoon lure
Szczupak i sandacz|Pike and zander
Kurtka oliwkowa|Olive jacket
Oliwkowe płótno|Olive canvas
Kurtka ceglasta|Brick-red jacket
Ceglasty drelich|Brick-red twill
Kurtka granatowa|Navy jacket
Granatowy sztormiak|Navy storm jacket
Łódka wiosłowa|Rowboat
Motorówka|Motorboat
5 m/s, dwie ławki i wiosła|5 m/s, two benches and a pair of oars
10 m/s, silnik zaburtowy|10 m/s, outboard motor
Składany grill|Folding grill
Pieczenie ryb przy namiocie|Grill your catch by the tent
Kostka planktonowa|Plankton bait cube
Powoli uwalnia zanętę na tołpygę|Slow-release groundbait for silver carp
Składak turystyczny|Folding bicycle
Rower na drogi i leśne ścieżki · do 25 km/h|For village roads and forest tracks · up to 25 km/h
Trzy płocie|Three roach
Złów trzy płocie o świcie albo w dzień.|Catch three roach at dawn or during the day.
Szczupak na kolację|Pike for supper
Złów szczupaka o masie co najmniej 2 kg.|Catch a pike weighing at least 2 kg.
Noc na Głębokim|A night on Lake Głębokie
Złów suma z łodzi na głębokiej wodzie wieczorem lub nocą.|Catch a wels catfish from a boat in deep water in the evening or at night.
Obiad pod namiotem|A campsite dinner
Upiecz rybę na własnym grillu.|Cook a fish on your own grill.
Pełna siatka|A full keepnet
Wyholuj osiem ryb dowolnego gatunku.|Land eight fish of any species.
Drobny połów|Small fry
Złów trzy ukleje lub kiełbie na Brzozowym.|Catch three bleak or gudgeon on Lake Brzozowe.
Poleska wyprawa|A trip to Polesie
Złów cztery ryby na Trzcinowym.|Catch four fish on Lake Trzcinowe.
Kanapka z serem|Cheese sandwich
Puszka fasolki|Tin of beans
Gorąca fasolka|Hot beans
Pieczona ryba|Grilled fish
Dzyndzałki z hreczką|Masurian buckwheat dumplings
Pierogi z kaszą gryczaną i okrasą|Buckwheat dumplings with a savoury topping
Placki ziemniaczane ze śmietaną|Potato pancakes with sour cream
Z patelni, posypane szczypiorkiem|Fresh from the pan, topped with chives
Kwaśnica na żeberku|Highland sauerkraut and rib soup
Góralska zupa z kiszonej kapusty i ziemniaków|Beskid sauerkraut soup with pork ribs and potatoes
Jasne pełne|Pale lager
Złociste piwo z lokalnego browaru · kufel 0,5 l|Golden beer from the local brewery · 0.5 L mug
Porter bałtycki|Baltic porter
Ciemne, słodowe piwo · pokal 0,33 l|Dark, malty beer · 0.33 L glass
Trzeźwy|Sober
Lekko podchmielony|Slightly tipsy
Podchmielony|Tipsy
Mocne upojenie|Drunk
Targ na placu|Market on the square
Wiejska potańcówka|Village dance
Poranny obchód|Morning rounds
Wieś śpi|The village is asleep
Brzezina|Birch grove
Pola żyta|Rye fields
Stary sad|Old orchard
Olszyna|Alder woods
Mokradła|Wetlands
Wilgotne łąki|Water meadows
Bór świerkowy|Spruce forest
Piarg|Scree slope
Hala|Mountain pasture
Droga między polami|Farm track
Grobla olszowa|Alder causeway
Ścieżka pod granią|Ridge trail
Schowaj wędkę|Stow rod
Wyjmij wędkę|Take out rod`);
addEnglish(`Płoć|Roach
Leszcz|Common bream
Karaś|Crucian carp
Lin|Tench
Karp|Common carp
Szczupak|Northern pike
Okoń|European perch
Sandacz|Zander
Sum|Wels catfish
Wzdręga|Rudd
Ukleja|Bleak
Jaź|Ide
Amur|Grass carp
Węgorz|European eel
Krąp|White bream
Sieja|Whitefish
Sielawa|Vendace
Pstrąg jeziorowy|Lake trout
Kiełb|Gudgeon
Jazgarz|Ruffe
Stynka|European smelt
Boleń|Asp
Karaś srebrzysty|Prussian carp
Słonecznica|Sunbleak
Sumik karłowaty|Brown bullhead
Tołpyga biała|Silver carp
Kleń|Chub
Miętus|Burbot
Brzana|Barbel
Jelec|Dace
Pierwszy połów|First catch
Wyholuj pierwszą rybę.|Land your first fish.
Własna przystań|A boat of your own
Kup pierwszą łódź.|Buy your first boat.
Kuchnia polowa|Camp cook
Upiecz rybę na grillu.|Cook a fish on the grill.
Trzy jeziora|Three lakes
Odwiedź wszystkie trzy jeziora.|Visit all three lakes.
Nocne branie|Night bite
Wyholuj rybę pomiędzy 21:00 a 5:00.|Land a fish between 21:00 and 05:00.
Okaz|Trophy fish
Złów rybę o masie co najmniej 5 kg.|Catch a fish weighing at least 5 kg.
Żywy atlas|Living atlas
Złów dziewięć różnych gatunków.|Catch nine different species.
Polskie wody|Polish waters
Złów osiemnaście różnych gatunków.|Catch eighteen different species.
Człowiek znad jeziora|Lakeside regular
Odbierz nagrody za cztery zlecenia.|Claim rewards for four jobs.
Wśród swoich|One of the locals
Zapytaj miejscowego wędkarza o łowisko.|Ask a local angler where the fish are biting.
Poczta wędkarska|Word on the water
Złów wskazany gatunek w miejscu zaznaczonym po rozmowie.|Catch the suggested species at the spot a local marked for you.
Pewna ręka|Steady hand
Wyholuj rybę na piątym poziomie trudności.|Land a fish on difficulty level five.
Znawca regionu|Local expert
Złów wszystkie gatunki w tym regionie.|Catch every species in this region.
Pełny atlas|Complete atlas
Złów wszystkie trzydzieści gatunków.|Catch all thirty species.
Na każde zawołanie|At your service
Rozlicz wszystkie zlecenia u rybaków.|Complete every job for the fishermen.
Zapis automatyczny|Autosave
Pojawi się po rozpoczęciu wyprawy.|Your first trip will appear here.
Wczytaj|Load
Zapisz|Save
Wolne miejsce|Empty slot
Zapisy są przechowywane w tej przeglądarce.|Your games are saved in this browser.
Przeglądarka zablokowała zapis. Sprawdź dostęp do pamięci witryny.|Saving was blocked. Check this site’s storage permissions in your browser.
Tego zapisu nie udało się odczytać.|Could not read this saved game.
Wczytano wyprawę.|Trip loaded.
Osiągnięcie|Achievement
Zdobyte osiągnięcie|Achievement unlocked
Targ|Market
Od 10:00 do 18:00 mieszkańcy schodzą się na plac.|The villagers gather in the square between 10:00 and 18:00.
Potańcówka|Village dance
Od 18:00 do północy gra akordeon. Na placu tańczą pary.|From 18:00 until midnight, couples dance to an accordion in the square.
Wróć na plac|Return to the square
Rozpoczniesz pierwszy dzień z podstawową wędką. Nowa wyprawa zastąpi zapis automatyczny. Ręczne zapisy będą dostępne w menu.|Start again on day one with a basic rod. This replaces your autosave. Your manual saves will still be available in the menu.
Rozpocznij od nowa|Start over
Wróć|Back
Zastąp zapis|Replace save
Anuluj|Cancel
Zlecenia|Jobs
Zapłata za udane połowy i obozową kuchnię.|Earn money for landing fish and cooking at camp.
Zobacz zlecenia|View jobs
Sprzęt i łodzie|Tackle and boats
Wędki, kołowrotki, żyłki, haczyki, przynęty, ubrania i grill.|Browse rods, reels, lines, hooks, bait, clothing and a grill.
Otwórz sklep|Open shop
Masz już składak. Na dworze wybierz przycisk roweru lub naciśnij B.|You own the folding bike. Use the bike button or press B outdoors to ride.
Rower składany za 240 zł. Na dworze można wsiadać i zsiadać klawiszem B albo przyciskiem.|A folding bike costs 240 zł. Outdoors, press B or tap the bike button to get on or off.
Zobacz w sklepie|View in shop
Łóżko na poddaszu|Bed in the loft
Sen uzupełnia energię. Możesz wybrać godzinę pobudki.|Sleep restores energy. Choose the time you want to wake up.
Prześpij się|Get some sleep
W użyciu|In use
Wybierz|Select
Wróć do rybaka|Back to the fisherman
Rybak zapisuje postęp od pierwszego połowu. Po nagrodę zajrzyj do niego osobiście.|The fisherman keeps track from your first catch. Visit him to collect your pay.
Odebrano|Claimed
Odbierz|Claim
Twoja łódź będzie czekać przy prawej burcie pomostu. Po klucze zajdź do domu rybaka.|Your boat will be on the right side of the pier. Visit the fisherman’s cottage to buy one.
Idź do domu rybaka|Visit the fisherman’s cottage
Wróć do sali|Back to the dining room
Dziś w gospodzie|Today’s special
Zamów|Order
Piwo na miejscu|Beer on tap
Wypij|Drink
Stan postaci|Condition
Skup ryb u Basi|Sell your fish to Basia
Twój połów|Your catch
Sprzedaj wszystkie|Sell all
Sprzedaj|Sell
Na wynos|Takeaway
Gotowa do zjedzenia|Ready to eat
Do podgrzania na ognisku|Heat over the campfire
po podgrzaniu +40 energii|+40 energy when hot
Świeże ryby|Fresh fish
do pieczenia na grillu|ready for the grill
Przy namiotach pali się ognisko. Na kamieniach jest miejsce na puszkę.|A fire burns beside the tents. There’s room on the stones to heat a tin.
Namiot|Tent
Wybierz porę pobudki i odzyskaj energię.|Set a wake-up time and get your energy back.
Idź spać|Go to sleep
Ognisko|Campfire
Podgrzej puszkę|Heat a tin
Rozstawiony przy namiocie. Pieczenie trwa 15 minut.|Your grill is set up beside the tent. Cooking takes 15 minutes.
Składany grill kupisz w domu rybaka za 78 zł.|Buy a folding grill at the fisherman’s cottage for 78 zł.
Idź do rybaka|Visit the fisherman
Do pieczenia potrzebujesz surowej ryby.|You need a raw fish to use the grill.
Upiecz rybę|Grill fish
Budzik dzwoni o najbliższej wybranej godzinie. Po śnie energia wraca do 100.|Your alarm rings the next time the clock reaches your chosen hour. Sleep restores energy to 100.
Nastaw budzik|Set alarm
Mapa jeziora, osady i dróg. Czerwona kropka oznacza gracza.|Map of the lake, village and roads. The red dot marks your position.
Moja pozycja|My position
Cała okolica|Whole area
Miejsca nad jeziorem|Places by the lake
Restauracja|Restaurant
Osada|Village
Prowadź pieszo|Show walking route
Przejdź|Go there
Wskazówka ze stolika|Angler’s tip
Podróż na inne jezioro|Travel to another lake
Jesteś tutaj|You are here
Zablokowane|Locked
Jedź|Travel
Do podróży zejdź na pomost. Na mapie ma numer 4.|Step onto the pier before travelling. It is marked with a 4 on the map.
Ryby|Fish
Prowiant|Provisions
Wyposażenie|Equipment
Postać|Character
Siatka jest pusta. Zarzuć wędkę z pomostu albo z łodzi.|Your keepnet is empty. Cast from the pier or a boat.
W restauracji możesz sprzedać wybrane ryby. Przy namiocie możesz je upiec.|Sell your fish at the inn or grill them at camp.
Podgrzej na ognisku.|Heat over the campfire.
Zjedz|Eat
odpoczynek i jedzenie odnawiają energię.|rest and food restore energy.
Zapis|Save
Ta przeglądarka blokuje zapis.|This browser is blocking saves.
Automatycznie w tej przeglądarce.|Saved automatically in this browser.
Wybrano|Selected
Załóż|Equip
Ryba trafiła do siatki.|The fish is in your keepnet.
Wróć nad wodę|Back to the water
Życie nad wodą|Life by the lake
Atlas ryb|Fish atlas
Sterowanie|Controls
tylko z łodzi w głębi jeziora|only from a boat in deep water
Pogoda|Weather
Wstań|Stand up
Gdzie biorą?|Where are they biting?
Na co łowić?|Which bait works?
A później?|How about later?
Na mapie ✓|Marked on map ✓
Zaznacz łowisko|Mark fishing spot`);
addEnglish(`Znajdź miejsce|Find a spot
Stań nad wodą. Obróć widok i ustaw odległość suwakiem. Jasny okrąg na jeziorze wskazuje miejsce rzutu.|Stand by the water. Turn to aim and use the slider to set your distance. The pale ring shows where your float will land.
Obserwuj spławik|Watch the float
Zarzuć spacją lub przyciskiem. Gdy spławik zanurkuje i pojawi się „Zatnij!”, naciśnij ponownie.|Press Space or tap Cast to throw your line. When the float goes under and “Strike!” appears, press again.
Wyholuj rybę|Land the fish
Przytrzymuj spację lub przycisk zwijania, aż wskazówka zbliży się do końca zielonego pola. Puść na chwilę i powtarzaj. Na zbyt mocnej żyłce ryba ją zerwie, a na luźnej spadnie z haczyka.|Hold Space or the reel button until the marker nears the edge of the green zone. Release briefly and repeat. Too much tension snaps the line. Too little lets the fish slip free.
Pierwsza łódka|Your first boat
Za trzy płocie rybak wypłaca 115 zł. Dołóż pieniądze ze sprzedaży połowu lub rozlicz zlecenie „Pełna siatka”. Wiosłówka kosztuje 160 zł. Kup ją w składzie wędkarskim i wsiądź przy pomoście.|The fisherman pays 115 zł for three roach. Sell your catch or complete “A full keepnet” to earn the rest. A rowboat costs 160 zł. Buy one at the tackle shop and board at the pier.
Energia i siła|Energy and strength
Wiosłowanie i hol męczą. W restauracji kupisz kanapkę, puszkę fasolki lub rybę. Kanapkę zjesz od razu z plecaka. Puszkę podgrzej na ognisku. Do pieczenia ryb kup grill i podejdź do namiotów. Każdy udany połów daje doświadczenie i rozwija siłę.|Rowing and reeling use energy. The inn sells sandwiches, tinned beans and fish. Eat a sandwich from your backpack or heat a tin over the campfire. Buy a grill to cook fish by the tents. Every fish you land builds experience and strength.
Sen i sąsiedzi|Sleep and neighbours
W namiocie i w domu rybaka wybierz godzinę pobudki. Inne gatunki żerują o świcie (5–10), w dzień (10–17), wieczorem (17–21) i nocą (21–5). Żaglówki oraz łodzie miejscowych mają własne trasy. Omiń je podczas pływania.|Choose a wake-up time in the tent or cottage. Different fish feed at dawn (05–10), by day (10–17), in the evening (17–21) and at night (21–05). Give way to the sailboats and local anglers on the water.
— chodzenie. Na łodzi W i S sterują prędkością, A i D skręcają.|— walk. In a boat, W and S change speed, A and D steer.
Przeciąganie widoku lub strzałki|Drag the view or use the arrow keys
— obrót kamery.|— look around.
Spacja|Space
— rzut, zacięcie lub przytrzymanie do holu.|— cast, strike or hold to reel in.
— skorzystaj z miejsca obok postaci.|— interact with a nearby place.
— mapa i przejścia.|— map and travel.
— plecak.|— backpack.
— poradnik.|— guide.
— zamknij okno.|— close the window.
Na ekranie dotykowym do kierowania postacią lub łodzią służy okrągły drążek.|Use the round joystick on a touchscreen to walk or steer your boat.
Pogoda i woda|Weather and water
Obserwuj szuwary, fale i niebo. W trakcie dnia nadciągają chmury, deszcz i mgła. Na Trzcinowym opływaj wysepki, a na Głębokim trzymaj się jeziora przed zaporą.|Watch the reeds, waves and sky. Clouds, showers and fog move in throughout the day. Steer around the islands on Trzcinowe and stay on the lake side of the dam on Głębokie.
Rower i osada|Cycling and village life
Składak kosztuje 240 zł w domu rybaka. Wsiadaj i zsiadaj klawiszem B albo przyciskiem roweru. W osadzie od 10:00 działa targ, a o 18:00 na plac wychodzą tancerze.|A folding bike costs 240 zł at the fisherman’s cottage. Press B or tap the bike button to get on or off. The village market opens at 10:00. At 18:00 the dancing begins in the square.
Przy stoliku|At the anglers’ table
Na mapie wybierz gospodę i „Prowadź pieszo”. Idź po złotych śladach do drzwi. W sali zajmij krzesło, wybierz rozmówcę i zapytaj o ryby. Zaznaczone łowisko pojawi się na mapie i na wodzie do końca bieżącej pory żerowania.|Find the inn on the map and select “Show walking route”. Follow the gold markers to the door. Take a seat, pick a local and ask where the fish are biting. A marked spot stays on the map and water until the current feeding period ends.
Kolejne jeziora|Unlocking lakes
Trzcinowe wymaga dwóch rozliczonych zleceń i 450 zł w portfelu. Głębokie wymaga czterech i 1200 zł. Pieniądze zachowujesz.|To unlock Trzcinowe, claim two job rewards and have 450 zł in your wallet. Głębokie takes four jobs and 1,200 zł. You keep the money.
W gospodzie|At the inn
Na tablicy czeka inne danie w każdej okolicy. Basia nalewa jasne pełne i porter bałtycki. Stan upojenia sprawdzisz w plecaku. Po piwie postać kołysze się i trudniej utrzymuje kierunek. Efekt słabnie w miarę upływu czasu, także podczas snu.|Each inn serves a local speciality. Basia pours pale lager and Baltic porter. Check your condition in the backpack. Drinking makes you sway and affects your steering. It wears off with time, including while you sleep.
Na telefonie|On a phone
lewy drążek służy do ruchu, a przeciągnięcie po jeziorze obraca kamerę. Przytrzymaj duży przycisk, aby zwijać żyłkę. Przycisk Menu otwiera zapisy i osiągnięcia.|use the left joystick to move and drag across the lake to look around. Hold the large button to reel in. Open Menu to find saves and achievements.
Wsiadasz na składak. Kieruj tak jak podczas chodzenia.|You’re on your bike. Use the walking controls to steer.
Składasz rower i idziesz pieszo.|You fold the bike and continue on foot.
Najpierw wróć łodzią do pomostu.|Bring your boat back to the pier first.
Podejdź do tego miejsca wzdłuż brzegu.|Follow the shore to reach this spot.
Jesteś na pomoście.|You’re on the pier.
Brakuje energii. Zjedz coś z plecaka albo prześpij się w namiocie.|Low energy. Eat something from your backpack or sleep in the tent.
Obróć widok i skieruj znacznik na wodę.|Turn to aim the marker at the water.
Zestaw zwinięty.|Line retrieved.
Cisza na wodzie. Sprawdź pory żerowania w poradniku.|No bites. Check the feeding times in the guide.
Ryba wypluła przynętę. Zatnij tuż po zanurzeniu spławika.|The fish spat out the bait. Strike just as the float goes under.
Żyłka pękła. Puść zwijanie, kiedy ryba szarpie.|The line snapped. Ease off the reel when the fish surges.
Ryba zeszła z haczyka. Zwijaj, gdy żyłka się luzuje.|The fish slipped off the hook. Reel in when the line goes slack.
Gorąca fasolka jest w plecaku.|The hot beans are in your backpack.
Pieczona ryba jest w plecaku.|The grilled fish is in your backpack.
Pobudka|Wake-up
Wsiądź do łodzi|Board your boat
Przybij do pomostu|Dock at the pier
Wejdź do domu rybaka|Enter the fisherman’s cottage
Wejdź do restauracji|Enter the inn
Namioty i ognisko|Tents and campfire
Wejdź|Enter
Plac|Square
Otwórz drzwi na taras|Open the terrace door
Podejdź do stolika|Walk to the table
Usiądź z wędkarzami|Sit with the anglers
Zsiądź z roweru|Get off the bike
Wsiądź na składak|Get on the bike
Zwiń zestaw|Retrieve line
Zatnij!|Strike!
Zwijasz|Reeling
puść, by odpuścić|release to ease off
Przytrzymaj i zwijaj|Hold to reel
Branie!|A bite!
Napięcie żyłki|Line tension
Rzut|Casting
Hol|Reeling
puść zwijanie|ease off the reel
zwijaj teraz|reel now
zielone pole|green zone
Naciśnij spację lub przycisk zacięcia.|Press Space or tap Strike.
odpuść|ease off
zwijaj|reel in
zryw ryby|fish surging
Pierwsze wypłynięcie|Your first boat trip
Wypłyń na jezioro, zatrzymaj łódź i zarzuć wędkę. Po powrocie wybierz „Przybij do pomostu”.|Row out onto the lake, stop your boat and cast. When you return, select “Dock at the pier”.
Zarzuć wędkę w jasny okrąg. Gdy spławik zanurkuje, zatnij. Podczas holu przytrzymuj i puszczaj zwijanie.|Cast into the pale ring. Strike when the float goes under. Hold and release the reel button to bring the fish in.
Do uruchomienia widoku 3D włącz przyspieszenie grafiki w przeglądarce i otwórz grę ponownie.|To start the 3D view, enable graphics acceleration in your browser and reopen the game.
Przywracanie obrazu 3D…|Restoring the 3D view…
przy piaszczystym brzegu|by the sandy shore
na lewo od pomostu|to the left of the pier
na wodzie przed stanicą|out in front of the boathouse
w głębi brzozowej zatoki|farther into the birch-lined bay
przy skraju szuwarów|along the edge of the reed beds
przy trzcinach obok obozu|by the reeds beside the campsite
od zachodniej strony wieży|west of the lookout tower
w przesmyku na wschodzie|in the eastern channel
przy kamienistym brzegu|by the stony shore
przy brzegu pod lasem|by the wooded bank
na głębokiej wodzie przed zaporą|in deep water in front of the dam
w głębi górskiej zatoki|farther into the mountain bay
Na spacer lub rower|Walking and cycling
Z placu wyjedź na wschód. Szlak ze słupkami okrąża jezioro i wraca do tej samej drogi.|Head east from the village square. Follow the waymarked trail around the lake and back to the same road.
Na telefonie dotknij „Schowaj wędkę” lub „Wyjmij wędkę”. Na komputerze naciśnij R. Schowanie zarzuconego zestawu zwija żyłkę. Podczas brania i holu dokończ połów.|On a phone, tap “Stow rod” or “Take out rod”. On a computer, press R. Stowing a cast rod retrieves the line. If there’s a bite or you’re playing a fish, finish the catch first.`);
for(const f of Object.values(fish))english.set(f[0].toLocaleLowerCase("pl"),english.get(f[0]).toLowerCase());
