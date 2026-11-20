const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path"),assert=require("node:assert/strict");
const js=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8").split("<script>")[1].split("</script>")[0].replace(/boot\(\);\s*$/,"");
const elements=new Map(),noop=()=>{};
const fake2d=new Proxy({createLinearGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function element(id){
 if(!elements.has(id))elements.set(id,{id,style:{},value:"",dataset:{},firstElementChild:{},classList:{add:noop,remove:noop,toggle:noop},querySelector:()=>({}),querySelectorAll:()=>[],setAttribute:noop,addEventListener:noop,focus:noop,getContext:()=>fake2d,showModal(){this.open=true;},close(){this.open=false;}});
 return elements.get(id);
}
const data=new Map();
const context=vm.createContext({console,assert,Math:Object.create(Math),document:{getElementById:element,addEventListener:noop,querySelectorAll:()=>[]},window:{addEventListener:noop},localStorage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)},setTimeout:()=>1,clearTimeout:noop});
context.Math.random=()=>.12;
vm.runInContext(js,context);
vm.runInContext(`
eng={rebuild(){}};
setupLake(0);assert.equal(findPlace(),"pier");
function hookAndReel(){
 act();assert.equal(phase,"throw");
 for(let f=0;f<850&&phase!=="bite";f++)fishing(.016);
 assert.equal(phase,"bite");act();assert.equal(phase,"fight");
 for(let f=0;f<2300&&phase==="fight";f++){
  if(cast.tension>.73)held=false;if(cast.tension<.39)held=true;
  fishing(.016);
 }
 assert.equal(where,"catch");closeBook();
}
for(let i=0;i<3;i++)hookAndReel();
assert.equal(life.fish.length,3);assert.equal(life.counts.pierwsza,3);assert.ok(life.energy<100);assert.ok(strength()>1);
for(let i=0;i<5;i++)hookAndReel();
goPlace("home");assert.equal(findPlace(),"home");openBook("quests");handle("reward|pierwsza");let after=life.cash;handle("reward|pierwsza");assert.equal(life.cash,after);
goPlace("restaurant");assert.equal(findPlace(),"restaurant");handle("atBar");handle("sellAll");assert.equal(life.fish.length,0);
goPlace("home");openBook("shop");handle("stock|wiosla");assert.equal(life.gear.boat,"wiosla");
goPlace("pier");interact();assert.ok(me.aboard);keys.add("KeyW");let z=me.z;
for(let f=0;f<60;f++)move(.016);keys.clear();assert.ok(me.z<z-1);assert.ok(docked());interact();assert.ok(!me.aboard);
goPlace("restaurant");handle("atBar");handle("buyFood|tin");assert.equal(life.food.tin,1);goPlace("camp");assert.equal(findPlace(),"camp");let hour=life.time;handle("heat");assert.equal(life.food.tin,0);assert.equal(life.food.stew,1);assert.ok(life.time>hour);
openBook("bag");handle("eat|stew");assert.equal(life.food.stew,0);assert.equal(life.energy,100);
goPlace("camp");openBook("sleep");handle("sleep|22");assert.equal(life.time,22);assert.deepEqual(Array.from(eligibleFish(.5,false)),["leszcz"]);
setupLake(2);assert.ok(!eligibleFish(.8,false).includes("sum"));assert.ok(eligibleFish(.8,true).includes("sum"));assert.ok(!eligibleFish(.3,true).includes("sum"));
goPlace("camp");openBook("sleep");handle("sleep|5");assert.equal(life.day,2);assert.equal(life.time,5);assert.ok(!eligibleFish(.9,true).includes("sum"));
for(let i=0;i<3;i++){
 setupLake(i);for(const k of ["restaurant","home","camp"]){goPlace(k);assert.equal(findPlace(),k,"place "+k+" lake "+i);closeBook();}
 let geometry=buildLand();assert.ok(geometry.land.data.length>200000);assert.ok(geometry.land.data.every(Number.isFinite));
 for(let t=0;t<650;t+=2){assert.ok(traffic(t).every(p=>lakeWater(p.x,p.z,1.7)),"boat passage lake "+i+" time "+t);}
}
life.cash=500;goPlace("home");openBook("shop");handle("stock|grill");handle("stock|ruda");assert.equal(life.gear.coat,"ruda");
goPlace("restaurant");handle("atBar");handle("buyFish|okon");goPlace("camp");handle("cook|0");assert.equal(life.food.grilled,1);assert.equal(life.counts.oboz,1);assert.equal(life.fish.length,0);
save();let restored=loadLife();assert.equal(restored.cash,life.cash);assert.ok(restored.owned.includes("grill"));assert.equal(restored.food.grilled,1);
console.log("PASS: casting, hooking, reeling, three catches, energy, strength, nonrepeatable mission reward, sale, boat purchase, rowing, docking, canned meal, campfire, eating, sleep, time-dependent species, deep-water catfish, nine destinations, traffic, finite 3D meshes, restaurant purchase, grilling, clothing, save/load.");
assert.ok(life.log.unlocked.first&&life.log.unlocked.owner&&life.log.unlocked.camp&&life.log.unlocked.explore);
goPlace("pier");interact();assert.ok(me.aboard);
cam=.4;range=11;boat.x=me.x=5;save(slotKey(1));const original=readLife(slotKey(1));
life.cash+=350;life.time=18;save(slotKey(2));restoreAdventure(original);
assert.equal(life.cash,original.cash);assert.equal(me.aboard,true);assert.equal(me.x,5);assert.equal(cam,.4);assert.equal(range,11);assert.equal(boat.x,5);
assert.equal(readLife(slotKey(2)).cash,original.cash+350);
saveAction("store","1");assert.equal(where,"overwrite");assert.equal(readLife(slotKey(1)).cash,original.cash);closeBook();
restoreAdventure(newLife());assert.equal(life.cash,25);assert.ok(!me.aboard);assert.equal(Object.keys(life.log.unlocked).length,0);
assert.equal(readLife(slotKey(1)).cash,original.cash);
act();assert.equal(phase,"throw");save(slotKey(3));resetCast();restoreAdventure(readLife(slotKey(3)));assert.equal(phase,"throw");resetCast();
life.time=22;cast={fish:{id:"sum",mass:6,value:200}};landCatch();assert.ok(life.log.unlocked.heavy&&life.log.unlocked.moon);
for(const id of Object.keys(fish)){cast={fish:{id,mass:1,value:27}};landCatch();}
assert.ok(life.log.unlocked.atlas);closeBook();
for(let i=0;i<3;i++){
 setupLake(i);let f=buildForest(v);assert.ok(f.trees.length>[500,70,300][i]&&f.trees.length<[850,220,700][i]&&f.mesh.data.every(Number.isFinite));
 for(let j=0;j<6;j++){let p=pedestrianRoute(j,0),q=pedestrianRoute(j,8);assert.ok(Math.hypot(p.x-q.x,p.z-q.z)>.1);}
 let scene=makeScene(7);assert.ok(scene.data.every(Number.isFinite));
}
console.log("PASS: separate manual slots, resume in a boat and during a cast, new game, overwrite confirmation, achievement triggers, all visitor routes, forest and animated mesh integrity.");
const allSpecies=new Set();assert.ok(life.log.unlocked.fullAtlas);
for(let i=0;i<3;i++){
 setupLake(i);
 let available=new Set(),weatherNames=new Set();
 for(let h=0;h<24;h+=.125){life.time=h;eligibleFish(.85,true).forEach(id=>available.add(id));let w=weatherAt();weatherNames.add(w.name);assert.ok([w.rain,w.haze,w.wind,w.cloud].every(n=>n>=0&&n<=1));}
 assert.equal(available.size,10);available.forEach(id=>allSpecies.add(id));assert.equal(weatherNames.size,5);
 const inn=v.restaurant;
 for(const dx of [-5.2,0,5.2])for(const dz of [-9.2,-4,2.9])assert.ok(ratio(inn.x+dx,inn.z+dz)>1.15);
 for(const seat of diningSeats){assert.ok(Math.abs(inn.y-landY(inn.x+seat.x,inn.z+seat.z)-.38)<1e-6);assert.equal(walkHeight(inn.x+seat.x,inn.z+seat.z),null);}
 goPlace("restaurant");assert.equal(findPlace(),"restaurant");assert.ok(makeScene(30).data.every(Number.isFinite));closeBook();
}
assert.equal(allSpecies.size,30);
setupLake(1);assert.ok(!lakeWater(reedIslands[0].x,reedIslands[0].z));
life.gear.boat="wiosla";let legacy={me:{x:-22,y:.21,z:6,a:0,aboard:true},boat:{x:-22,z:6,a:0},cam:0};
setupLake(1,legacy);assert.ok(me.aboard&&lakeWater(me.x,me.z,1));goPlace("pier");interact();assert.ok(!me.aboard);
life.cash=25;life.energy=70;life.buzz=0;goPlace("restaurant");handle("atBar");handle("drink|jasne");assert.equal(life.cash,16);assert.equal(life.buzz,19);handle("drink|porter");assert.equal(life.cash,2);assert.equal(life.buzz,51);
handle("drink|jasne");assert.equal(life.buzz,51);assert.equal(readLife(saveID).buzz,51);passTime(1);assert.equal(life.buzz,38);
life.cash=30;handle("special");assert.equal(life.cash,13);assert.equal(life.energy,100);
goPlace("camp");openBook("sleep");life.time=20;handle("sleep|5");assert.equal(life.buzz,0);
const old=JSON.parse(localStorage.getItem(saveID));delete old.buzz;localStorage.setItem("old",JSON.stringify(old));assert.equal(readLife("old").buzz,0);
console.log("PASS: 30 accessible local fish, all weather regimes, boat routes between islands, migrated boat saves, terrace foundations and seats, dining scene, regional meal, both beers, purchase limits, intoxication, saving and sleep.");
restoreAdventure(newLife());assert.deepEqual(lakeAccess(),[0]);life.cash=5000;handle("lake|1");assert.equal(life.lake,0);
life.cash=449;life.paid=["pierwsza","kosz"];assert.ok(!lakeAccess().includes(1));life.cash=450;save();assert.ok(lakeAccess().includes(1));
life.cash=0;assert.ok(lakeAccess().includes(1));life.paid.push("oboz","trzciny");life.cash=1199;assert.ok(!lakeAccess().includes(2));
life.cash=1200;handle("lake|2");assert.equal(life.cash,1200);assert.equal(life.lake,2);assert.ok(readLife(saveID).openLakes.includes(2));
function walkTo(point,viaStick=false){
 keys.clear();stick.y=viaStick?1:0;if(!viaStick)keys.add("KeyW");
 for(let steps=0;steps<1400;steps++){
  if(me.room)break;let dx=point.x-me.x,dz=point.z-me.z;
  if(Math.hypot(dx,dz)<.09)break;cam=Math.atan2(dx,-dz);move(.016);
 }
 keys.clear();stick.y=0;
 assert.ok(me.room||Math.hypot(point.x-me.x,point.z-me.z)<.16,"blocked on lake "+life.lake+" at "+JSON.stringify(point)+" from "+JSON.stringify(me));
}
for(let i=0;i<3;i++){
 for(const place of ["home","town","restaurant"]){
  setupLake(i);handle("route|"+place);for(const p of footRoute(place))walkTo(p,i===1);
  if(place==="restaurant"){walkTo({x:v.restaurant.x,z:v.restaurant.z-2.36});assert.ok(me.room);}
  else assert.equal(findPlace(),place);
 }
 assert.ok(buildInnRoom().data.every(Number.isFinite));interact();assert.equal(me.room.seated,true);
 handle("speaker|1");handle("ask|spot");handle("pinFish");assert.equal(markedReport().id,dailyReport(1).id);assert.ok(me.room.seated);
 save(slotKey(3));restoreAdventure(readLife(slotKey(3)));assert.ok(me.room.seated);handle("stand");assert.ok(!me.room.seated);
 handle("atBar");assert.equal(where,"restaurant");closeBook();handle("exitInn");assert.ok(!me.room&&walkHeight(me.x,me.z)!==null);
 for(let day=1;day<=3;day++)for(const t of [2,7,13,19])for(const person of [0,1]){let r=dailyReport(person,t,day);assert.ok(lakeWater(r.x,r.z,1));assert.ok(eligibleFish(1-ratio(r.x,r.z),r.afloat,t).includes(r.id));}
 for(const t of [2,7,14,19]){life.time=t;goPlace("town");let m=new Geometry();townPeople(m,23);assert.ok(m.data.length>0&&m.data.every(Number.isFinite));}
}
life.cash=240;goPlace("home");handle("bikes");handle("stock|skladak");assert.equal(life.cash,0);assert.ok(life.owned.includes("skladak"));
goPlace("pier");cam=Math.PI;const z0=me.z;keys.add("KeyW");move(.1);keys.clear();let walk=me.z-z0;
toggleCycle();assert.ok(me.cycling);keys.add("KeyW");move(.1);keys.clear();assert.ok(me.z-z0-walk>walk*1.7);
act();assert.equal(phase,"idle");save(slotKey(3));restoreAdventure(readLife(slotKey(3)));assert.ok(me.cycling);
assert.ok(makeScene(18).data.every(Number.isFinite));toggleCycle();assert.ok(!me.cycling);
for(const [id,f] of Object.entries(fish)){
 assert.ok(fishRanks[id]>=1&&fishRanks[id]<=5);assert.ok(fishValue(id,f[2])<Math.round(12+f[3]*f[2]));
 assert.ok(stock[f[5]]);const c={fish:{id,mass:f[2]},fightAge:1};assert.ok(fightProfile(c).high>fightProfile(c).low);
}
assert.ok(fightProfile({fish:{id:"sum",mass:9}}).window<fightProfile({fish:{id:"ploc",mass:.4}}).window);
const fightDuration={};
for(const [id,info] of Object.entries(fish)){
 resetCast();closeBook();phase="fight";life.energy=100;life.xp=6;
 cast={x:me.x+7,z:me.z-4,age:1,bite:0,fish:{id,mass:info[2],value:fishValue(id,info[2])},tension:.52,progress:0,risk:0,fightAge:0};
 let frames=0;for(;phase==="fight"&&frames<4500;frames++){
  const f=fightProfile(cast);if(cast.tension>f.high-.025)held=false;if(cast.tension<f.low+.029)held=true;fishing(.016);
 }
 assert.equal(where,"catch","catchable "+id);fightDuration[id]=frames*.016;
}
assert.ok(fightDuration.sum>fightDuration.ploc*1.6);closeBook();
console.log("PASS: physical route from every pier to house, square and inn, walking through doors, seated conversations, marked tips in legal water, dawn/noon/evening/night settlement activity, cash and mission locks, mounted/indoor saves, cycling speed and species-specific fight profiles.");
`,context);
vm.runInContext(`
restoreAdventure(newLife());goPlace("pier");
assert.equal(language,"pl");const before=JSON.stringify(life);setLanguage("en");assert.equal(JSON.stringify(life),before);
assert.equal(savedLanguage(),"en");assert.equal(ui("Zarzuć wędkę"),"Cast your line");
for(const species of Object.values(fish))assert.notEqual(ui(species[0]),species[0]);
assert.equal(uiMarkup('<button data-do="equip|robak">Załóż</button>'),'<button data-do="equip|robak">Equip</button>');
openBook("map");assert.ok($("content").innerHTML.includes("Farm track"));closeBook();handle("rod");
assert.equal(life.rodStowed,true);assert.equal($("cast").hidden,true);act();assert.equal(phase,"idle");
save(slotKey(1));restoreAdventure(readLife(slotKey(1)));assert.ok(life.rodStowed);handle("rod");act();assert.equal(phase,"throw");
handle("rod");assert.equal(phase,"idle");assert.ok(life.rodStowed);handle("rod");act();
for(let i=0;i<650&&phase!=="bite";i++)fishing(.016);
assert.equal(phase,"bite");toggleRod();assert.equal(phase,"bite");assert.equal(life.rodStowed,false);
act();assert.equal(phase,"fight");toggleRod();assert.equal(phase,"fight");resetCast();
for(let i=0;i<3;i++){
 setupLake(i);const detail=countryside();
 assert.ok(Math.hypot(detail.trail[0].x-detail.trail.at(-1).x,detail.trail[0].z-detail.trail.at(-1).z)<1e-8);
 for(const path of [detail.trail,detail.lane])for(let j=1;j<path.length;j++){
  const a=path[j-1],b=path[j];for(let u=0;u<=1;u+=.05){let x=lerp(a.x,b.x,u),z=lerp(a.z,b.z,u);assert.notEqual(walkHeight(x,z),null,"blocked trail at lake "+i+" "+x+","+z);}
 }
 assert.ok(detail.trees.length>500&&detail.props.length>10);goPlace("restaurant");interact();handle("ask|spot");assert.ok($("tableTalk").innerHTML.includes("Where are they biting?"));
 handle("ask|later");assert.ok($("tableTalk").innerHTML.includes("Try again at"));
}
setLanguage("pl");assert.equal(savedLanguage(),"pl");assert.ok($("tableTalk").innerHTML.includes("Gdzie biorą?"));
console.log("PASS: languages, save compatibility, English directions and table talk, stowing and retrieving the rod, protected fish fights, continuous walkable trails on all lakes.");
`,context);

