const skyTypes=[
 {name:"Pogodnie",cloud:.08,rain:0,haze:.05,wind:.18},
 {name:"Zachmurzenie",cloud:.74,rain:0,haze:.17,wind:.39},
 {name:"Przelotny deszcz",cloud:.95,rain:.86,haze:.51,wind:.67},
 {name:"Wietrznie",cloud:.38,rain:0,haze:.09,wind:.97},
 {name:"Mgła",cloud:.53,rain:0,haze:.97,wind:.10}
];
const weatherFronts=[0,1,2,3,0,4,1,0,3,2,1,0,3,4,0,1,2,1,3];
function weatherAt(day=life.day,hour=life.time,id=life.lake){
 const t=((day-1)*24+hour-7-1/3)/.62+[0,4,7][id]+weatherFronts.length*5;
 const block=Math.floor(t),phase=t-block,blend=sat((phase-.66)/.34),s=blend*blend*(3-2*blend);
 const first=skyTypes[weatherFronts[block%weatherFronts.length]],next=skyTypes[weatherFronts[(block+1)%weatherFronts.length]];
 return {name:s>.5?next.name:first.name,cloud:lerp(first.cloud,next.cloud,s),rain:lerp(first.rain,next.rain,s),haze:lerp(first.haze,next.haze,s),wind:lerp(first.wind,next.wind,s)};
}
const rainFS=`precision mediump float;
varying vec2 uv;uniform float clock,intensity;uniform vec2 resolution;
float streak(vec2 p,float seed){
 p.x+=p.y*.17;p.y+=clock*(2.5+seed*.3);
 vec2 cell=floor(p);float h=fract(sin(dot(cell,vec2(13.17,31.7))+seed)*787.42);
 vec2 st=fract(p);return step(.56,h)*(1.-smoothstep(.006,.046,abs(st.x-(.16+.7*h))))*(1.-smoothstep(.03,.23,abs(st.y-.55)));
}
void main(){vec2 p=uv*vec2(resolution.x/resolution.y,1.);
 float alpha=streak(p*vec2(27.,4.8),1.)*.39+streak(p*vec2(45.,8.0)+.37,3.)*.22;
 gl_FragColor=vec4(.79,.85,.88,alpha*intensity);}`;
