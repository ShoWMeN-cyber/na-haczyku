"use strict";
const TAU=Math.PI*2, sat=(n,a=0,b=1)=>Math.max(a,Math.min(n,b)), lerp=(a,b,t)=>a+(b-a)*t;
const vec=(x,y,z)=>[x,y,z], add=(a,b)=>a.map((v,i)=>v+b[i]), sub=(a,b)=>a.map((v,i)=>v-b[i]), mul=(v,k)=>v.map(n=>n*k);
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2], cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=v=>mul(v,1/(Math.hypot(...v)||1)), hex=n=>[n>>16&255,n>>8&255,n&255].map(v=>v/255);
const F=a=>[Math.sin(a),0,-Math.cos(a)],R=a=>[Math.cos(a),0,Math.sin(a)];
function seeded(s){return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
const period=t=>t<5||t>=21?"noc":t<10?"świt":t<17?"dzień":"wieczór";
const lakes=[
 {name:"Jezioro Brzozowe",region:"Mazury",feature:"Piaszczysta zatoka i mazurska stanica",rx:49,rz:41,seed:5,phase:.14,water:0x398e91,ground:0x94a367,fish:["ploc","leszcz","karas","wzdrega","ukleja","jaz"]},
 {name:"Jezioro Trzcinowe",region:"Polesie",feature:"Szuwary, wysepki i wieża obserwacyjna",rx:68,rz:33,seed:17,phase:2.2,water:0x6a7952,ground:0x989059,fish:["lin","karp","szczupak","amur","wegorz","krap"]},
 {name:"Jezioro Głębokie",region:"Beskidy",feature:"Skalista dolina z kamienną zaporą",rx:36,rz:66,seed:44,phase:3.45,water:0x255679,ground:0x677951,fish:["okon","sandacz","sum","sieja","sielawa","pstrag"]}
];
const fish={
 ploc:["Płoć",.22,.8,35,"świt dzień","robak",.3,0x899c8a],leszcz:["Leszcz",.6,2.2,30,"wieczór noc","kukurydza",.59,0x948866],karas:["Karaś",.35,1.45,38,"dzień wieczór","kukurydza",.22,0xb09b57],
 lin:["Lin",.65,2.7,32,"świt wieczór","robak",.24,0x788650],karp:["Karp",1.3,5.6,28,"dzień noc","kukurydza",.52,0x98844e],szczupak:["Szczupak",1.5,5.8,34,"świt wieczór dzień","błystka",.44,0x7e914c],
 okon:["Okoń",.35,1.85,40,"świt dzień","robak",.28,0x7d9654],sandacz:["Sandacz",1.1,4.6,39,"dzień wieczór noc","błystka",.48,0x889a81],sum:["Sum",3.1,9.4,38,"wieczór noc","robak",.82,0x62736a],
 wzdrega:["Wzdręga",.16,.86,38,"dzień wieczór","kukurydza",.18,0xb59a62],ukleja:["Ukleja",.04,.14,65,"dzień wieczór","robak",.28,0xb9c8ca],jaz:["Jaź",.7,3.2,33,"świt wieczór","błystka",.59,0x8d9f88],
 amur:["Amur",2.1,8.2,27,"dzień wieczór","kukurydza",.42,0x889b64],wegorz:["Węgorz",.55,2.55,61,"wieczór noc","robak",.51,0x71724d],krap:["Krąp",.18,.85,34,"świt dzień","robak",.32,0xa1a99b],
 sieja:["Sieja",.65,2.7,46,"świt wieczór","robak",.67,0x94aab1],sielawa:["Sielawa",.15,.63,61,"wieczór noc","błystka",.76,0xaab7ca],pstrag:["Pstrąg jeziorowy",.85,4.8,49,"świt dzień","błystka",.55,0xab9771]
};
const inns=[
 {name:"Gospoda Pod Wiosłem",sign:"POD WIOSŁEM",home:"Chata u Witka",homeSign:"U WITKA",owner:"Witek",guests:["Halina","Franek"]},
 {name:"Karczma Pod Czaplą",sign:"POD CZAPLĄ",home:"Rybaczówka u Romka",homeSign:"U ROMKA",owner:"Romek",guests:["Irena","Leszek"]},
 {name:"Gospoda u Flisaka",sign:"U FLISAKA",home:"Chata u Staszka",homeSign:"U STASZKA",owner:"Staszek",guests:["Hanka","Józek"]}
];
const localInn=()=>inns[life.lake];
const groups={rod:"Wędki",reel:"Kołowrotki",line:"Żyłki",hook:"Haczyki",bait:"Przynęty",coat:"Ubrania",boat:"Łodzie",kit:"Obóz"};
Object.assign(fish,{
 kielb:["Kiełb",.025,.13,56,"świt dzień","robak",.16,0x998871],jazgarz:["Jazgarz",.035,.18,53,"dzień wieczór","robak",.42,0x988c5e],
 stynka:["Stynka",.015,.08,62,"świt wieczór","robak",.52,0xb0bfb4],bolen:["Boleń",1.25,6.8,49,"świt dzień","błystka",.48,0x8b9a99],
 srebrzysty:["Karaś srebrzysty",.26,1.95,31,"dzień wieczór","kukurydza",.21,0xa8ada1],slonecznica:["Słonecznica",.012,.055,59,"świt dzień","robak",.15,0xa6bab0],
 sumik:["Sumik karłowaty",.10,.75,36,"wieczór noc","robak",.42,0x746d53],tolpyga:["Tołpyga biała",2.7,11.8,33,"dzień wieczór","plankton",.62,0x9cafa6],
 klen:["Kleń",.42,3.9,41,"świt dzień","kukurydza",.32,0x83917a],mietus:["Miętus",.55,3.45,54,"wieczór noc","robak",.76,0x7b7755],
 brzana:["Brzana",.85,5.5,48,"świt wieczór","robak",.53,0x9d8b61],jelec:["Jelec",.07,.31,42,"dzień wieczór","robak",.26,0x98a7a4]
});
[["kielb","jazgarz","stynka","bolen"],["srebrzysty","slonecznica","sumik","tolpyga"],["klen","mietus","brzana","jelec"]].forEach((ids,i)=>lakes[i].fish.push(...ids));
const fishRanks={
 ploc:1,ukleja:2,kielb:1,karas:2,wzdrega:2,leszcz:3,jaz:4,jazgarz:2,stynka:3,bolen:5,
 lin:3,karp:4,szczupak:5,amur:4,wegorz:5,krap:2,srebrzysty:2,slonecznica:1,sumik:3,tolpyga:5,
 okon:2,sandacz:4,sum:5,sieja:3,sielawa:4,pstrag:5,klen:3,mietus:4,brzana:4,jelec:2
};
const stock={
 leszczyna:["Wędka z leszczyny","rod",0,20,"Rzut do 20 m"],trzcina:["Wędka Trzcina","rod",130,29,"Rzut do 29 m"],glebia:["Wędka Głębia","rod",330,38,"Rzut do 38 m"],
 mlynek:["Zwykły kołowrotek","reel",0,1,"Zwykłe tempo zwijania"],wicher:["Kołowrotek Wicher","reel",110,1.28,"Szybsze zwijanie żyłki"],
 nylon:["Żyłka 0,20 mm","line",0,1,"Lekka żyłka spławikowa"],mocna:["Żyłka 0,32 mm","line",95,1.33,"Lepiej znosi zrywy dużych ryb"],
 maly:["Haczyk nr 10","hook",0,1,"Podstawowy haczyk"],
 kuty:["Haczyk kuty","hook",70,1.55,"Dłużej trzyma rybę na luźnej żyłce"],
 robak:["Robak","bait",0,1,"Płoć, lin, okoń, sum"],kukurydza:["Kukurydza","bait",32,1,"Karaś, karp, leszcz"],błystka:["Błystka","bait",64,1,"Szczupak i sandacz"],
 oliwka:["Kurtka oliwkowa","coat",0,0x6b734c,"Oliwkowe płótno"],ruda:["Kurtka ceglasta","coat",62,0x9e513e,"Ceglasty drelich"],granat:["Kurtka granatowa","coat",80,0x45647c,"Granatowy sztormiak"],
 wiosla:["Łódka wiosłowa","boat",160,5,"5 m/s, dwie ławki i wiosła"],silnik:["Motorówka","boat",550,10,"10 m/s, silnik zaburtowy"],
 grill:["Składany grill","kit",78,1,"Pieczenie ryb przy namiocie"]
};
const startEquip={rod:"leszczyna",reel:"mlynek",line:"nylon",hook:"maly",bait:"robak",coat:"oliwka",boat:null};
stock.plankton=["Kostka planktonowa","bait",48,1,"Powoli uwalnia zanętę na tołpygę"];
stock.skladak=["Składak turystyczny","kit",240,1,"Rower na drogi i leśne ścieżki · do 25 km/h"];
groups.kit="Obóz i rower";
const quests=[
 ["pierwsza","Trzy płocie","Złów trzy płocie o świcie albo w dzień.",3,115],
 ["zęby","Szczupak na kolację","Złów szczupaka o masie co najmniej 2 kg.",1,210],
 ["noc","Noc na Głębokim","Złów suma z łodzi na głębokiej wodzie wieczorem lub nocą.",1,330],
 ["oboz","Obiad pod namiotem","Upiecz rybę na własnym grillu.",1,65]
];
const foods={sand:["Kanapka z serem",14,19],tin:["Puszka fasolki",19,0],stew:["Gorąca fasolka",0,40],grilled:["Pieczona ryba",0,48]};
quests.push(["kosz","Pełna siatka","Wyholuj osiem ryb dowolnego gatunku.",8,150],
 ["drobnica","Drobny połów","Złów trzy ukleje lub kiełbie na Brzozowym.",3,80],
 ["trzciny","Poleska wyprawa","Złów cztery ryby na Trzcinowym.",4,185]);
const lakeGates=[{jobs:0,cash:0},{jobs:2,cash:450},{jobs:4,cash:1200}];
function lakeAccess(){
 const opened=new Set([0,life.lake,...(life.openLakes||[]),...(life.log?.lakes||[])]);
 lakeGates.forEach((g,i)=>{if(life.paid.length>=g.jobs&&life.cash>=g.cash)opened.add(i);});
 return life.openLakes=[...opened].filter(i=>Number.isInteger(i)&&lakes[i]);
}
function fishValue(id,mass){return Math.max(1,Math.round(1.75+fish[id][3]*.53*mass));}
const specials=[
 {name:"Dzyndzałki z hreczką",description:"Pierogi z kaszą gryczaną i okrasą",price:22,energy:36},
 {name:"Placki ziemniaczane ze śmietaną",description:"Z patelni, posypane szczypiorkiem",price:17,energy:31},
 {name:"Kwaśnica na żeberku",description:"Góralska zupa z kiszonej kapusty i ziemniaków",price:24,energy:43}
];
const beers={jasne:{name:"Jasne pełne",description:"Złociste piwo z lokalnego browaru · kufel 0,5 l",price:9,buzz:19},porter:{name:"Porter bałtycki",description:"Ciemne, słodowe piwo · pokal 0,33 l",price:14,buzz:32}};
function buzzLabel(){return life.buzz<1?"Trzeźwy":life.buzz<35?"Lekko podchmielony":life.buzz<70?"Podchmielony":"Mocne upojenie";}
const saveID="przystan-rpg-v1";
function newLife(){return {lake:0,time:7+1/3,day:1,cash:25,energy:100,buzz:0,xp:0,fish:[],food:{sand:1,tin:0,stew:0,grilled:0},owned:Object.values(startEquip).filter(Boolean),gear:{...startEquip},counts:{},paid:[],tutorial:true,firstBoat:true};}
function readLife(key){
 try{
  const d=JSON.parse(localStorage.getItem(key));
  if(!d||!lakes[d.lake]||!Array.isArray(d.fish)||!Array.isArray(d.owned)||!d.food||!d.gear||!Number.isFinite(d.energy))return null;
  const base=newLife(),gear={...base.gear,...d.gear};
  if(Object.entries(gear).some(([group,id])=>!(group==="boat"&&id===null)&&stock[id]?.[1]!==group))return null;
  if(![d.time,d.day,d.xp,d.cash].every(Number.isFinite)||d.fish.some(e=>!fish[e?.id]||!Number.isFinite(e.mass)||!Number.isFinite(e.value)))return null;
  const catches=d.fish.map(e=>({...e,value:fishValue(e.id,e.mass)}));
  if(d.position?.cast?.fish){const e=d.position.cast.fish;if(fish[e.id]&&Number.isFinite(e.mass))e.value=fishValue(e.id,e.mass);}
  return {...base,...d,fish:catches,buzz:Number.isFinite(d.buzz)?sat(d.buzz,0,100):0,gear,food:{...base.food,...d.food}};
 }catch{return null;}
}
function loadLife(){return readLife(saveID)||newLife();}
const life=loadLife(), lake=()=>lakes[life.lake], stat=g=>stock[life.gear[g]][3], strength=()=>1+Math.floor(Math.sqrt(life.xp/6));
const zl=n=>Math.round(n)+" zł", kg=n=>n.toFixed(2).replace(".",",")+" kg";
function bounds(l,a){
 if(l===lakes[1])return 1+.16*Math.cos(3*a+.55)+.077*Math.sin(6*a+.8)+.036*Math.cos(10*a);
 if(l===lakes[2])return .98+.12*Math.sin(2*a-.6)+.048*Math.cos(4*a)+.033*Math.sin(7*a);
 return 1+.12*Math.sin(3*a+l.phase)+.056*Math.sin(5*a-.8+l.phase)+.027*Math.cos(8*a+l.phase);
}
function polar(l,a,r){const b=bounds(l,a)*r;return [l.rx*Math.cos(a)*b,l.rz*Math.sin(a)*b];}
function ratio(x,z,l=lake()){const a=x/l.rx,b=z/l.rz;return Math.hypot(a,b)/bounds(l,Math.atan2(b,a));}
function naturalGround(x,z){
 const r=ratio(x,z),base=-.09+sat((r-1)*9,0,1.25),slope=sat(r-1.1,0,2);
 if(life.lake===1)return base+slope*(.36+.14*Math.cos(x*.11));
 if(life.lake===2){
  const a=Math.atan2(z/lake().rz,x/lake().rx),side=sat((14-z)/30+.27*Math.abs(x)/lake().rx);
  const rise=sat((r-1.015)*1.50),bank=base+side*rise*rise*(3-2*rise)*(7+3*Math.cos(a*4-.7))+slope*(2.8+1.4*side);
  if(r<2.6)return bank;
  const ridge=(center,width,peak)=>{const u=sat(1-Math.abs(r-center)/width);return peak*u*u*(3-2*u);};
  const first=ridge(3.75+.19*Math.cos(3*a),.91,29+8*Math.sin(4*a+.2)+6*Math.cos(7*a-1));
  const second=ridge(5.25+.23*Math.sin(4*a),1.05,49+13*Math.sin(5*a+.5)+8*Math.cos(8*a));
  return bank+first+second;
 }
 return base+slope*(.7+.45*Math.sin(x*.09)+.4*Math.sin(z*.1))*2.5;
}
const innSites=new Map();
function innSite(){
 if(!innSites.has(life.lake)){
  const [sx,sz]=polar(lake(),1.25,1),x=sx+9,z=sz+32;
  innSites.set(life.lake,{name:"restaurant",label:localInn().name,x,z,y:naturalGround(x,z-8)+.38});
 }
 return innSites.get(life.lake);
}
function landY(x,z){
 const p=innSite(),town=townSite(),apron=sat((Math.max(Math.abs(x-town.x),Math.abs(z-town.z))-17)/7);
 const ground=lerp(town.y,naturalGround(x,z),apron*apron*(3-2*apron)),distance=Math.max(0,Math.abs(x-p.x)-6,p.z-10.7-z,z-p.z-3.7);
 if(distance>=5)return ground;
 const u=distance/5;return lerp(p.y-.38,ground,u*u*(3-2*u));
}
function village(){
 const l=lake(),shore=polar(l,Math.PI/2,1)[1],tip=shore-10;
 function place(name,label,angle,r){const [x,z]=polar(l,angle,r);return {name,label,x,z,y:landY(x,z)};}
 const restaurant=innSite();
 return {shore,tip,home:place("home",localInn().home,1.90,1.19),restaurant,town:townSite(),camp:place("camp","Obóz i ognisko",2.24,1.11),pier:{name:"pier",label:"Pomost",x:0,z:tip+1.7,y:.72}};
}
function eligibleFish(depth,boat,time=life.time){return lake().fish.filter(id=>fish[id][4].includes(period(time))&&(id!=="sum"||boat&&depth>.52));}
function innClearing(x,z,v){
 const inn=v.restaurant;
 if(Math.abs(x-inn.x)<7.6&&z>inn.z-12.5&&z<inn.z+5.3)return true;
 const [sx,sz]=polar(lake(),1.25,1.055+.008*Math.sin(1.25*9)),u=sat((z-sz)/(inn.z-9-sz));
 return Math.hypot(x-lerp(sx,inn.x,u)-1.3*Math.sin(u*Math.PI),z-lerp(sz,inn.z-9,u))<2.5;
}
function pickFish(depth,boat,point){
 const ids=eligibleFish(depth,boat);
 if(!ids.length)return null;
 const tips=point?[dailyReport(0),dailyReport(1)]:[];
 const weights=ids.map(id=>Math.exp(-Math.abs(fish[id][6]-depth)*4)*(fish[id][5]===life.gear.bait?4:1)*
  (tips.some(t=>t.id===id&&Math.hypot(point.x-t.x,point.z-t.z)<6)?3.5:1));
 let n=Math.random()*weights.reduce((a,b)=>a+b,0);
 return ids.find((_,i)=>(n-=weights[i])<=0)||ids.at(-1);
}
function passTime(hours){let t=life.time+hours;life.day+=Math.floor(t/24);life.time=t%24;life.buzz=Math.max(0,life.buzz-hours*13);}
