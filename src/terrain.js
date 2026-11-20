class Geometry {
 constructor(){this.data=[];this.origin=[0,0,0];this.angle=0;this.material=0;}
 at(x,y,z,a=0){this.origin=[x,y,z];this.angle=a;}
 instance(model,x,y,z,angle,size=1){
  const ca=Math.cos(angle),sa=Math.sin(angle),p=model.data;
  for(let i=0;i<p.length;i+=9)this.data.push(x+(p[i]*ca-p[i+2]*sa)*size,y+p[i+1]*size,z+(p[i]*sa+p[i+2]*ca)*size,
   p[i+3]*ca-p[i+5]*sa,p[i+4],p[i+3]*sa+p[i+5]*ca,p[i+6],p[i+7],p[i+8]);
 }
 point(v){let c=Math.cos(this.angle),s=Math.sin(this.angle);return [this.origin[0]+v[0]*c-v[2]*s,this.origin[1]+v[1],this.origin[2]+v[0]*s+v[2]*c];}
 tri(p,q,r,color,shade=1){
   let a=this.point(p),b=this.point(q),c=this.point(r),n=norm(cross(sub(b,a),sub(c,a))),col=mul(hex(color),shade);
   col[0]+=2*this.material;
   if(this.wind){
    for(const [world,local] of [[a,p],[b,q],[c,r]]){
     const weight=sat((local[1]-.08)*this.wind);
     this.data.push(...world,...mul(n,1+weight),...col);
    }
   }else this.data.push(...a,...n,...col,...b,...n,...col,...c,...n,...col);
 }
 quad(a,b,c,d,color,k=1){this.tri(a,b,c,color,k);this.tri(a,c,d,color,k);}
 box(x,y,z,w,h,d,c){
   const rim=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,j])=>[x+i*w/2,y,z+j*d/2]),top=rim.map(p=>add(p,[0,h,0]));
   for(let i=0;i<4;i++){let j=(i+1)%4;this.quad(rim[i],top[i],top[j],rim[j],c,1-i*.024);}
   this.quad(top[0],top[3],top[2],top[1],c,1.04);
 }
 pole(a,b,r,s,col,sides=6){
   let up=norm(sub(b,a)),u=norm(cross(Math.abs(up[1])>.85?[0,0,1]:[0,1,0],up)),v=cross(up,u);
   const rim=(p,w,i)=>add(p,add(mul(u,w*Math.cos(i*TAU/sides)),mul(v,w*Math.sin(i*TAU/sides))));
   for(let i=0;i<sides;i++){let p=rim(a,r,i),q=rim(a,r,i+1),m=rim(b,s,i+1),n=rim(b,s,i);
     this.tri(p,q,n,col,1+(i%3)*.019);if(s){this.tri(q,m,n,col);this.tri(b,n,m,col,1.04);}
   }
 }
 oval(x,y,z,w,h,d,color,n=8){
   const start=this.data.length,center=this.point([x,y,z]);
   const ring=(k,i)=>{let a=i*TAU/n+k*.23,t=[-.6,-.04,.54][k],r=[.71,1,.78][k];return [x+Math.cos(a)*w*r,y+h*t,z+Math.sin(a)*d*r];};
   for(let i=0;i<n;i++){
    this.tri([x,y-h,z],ring(0,i),ring(0,i+1),color,.81);
    for(let j=0;j<2;j++)this.quad(ring(j,i),ring(j+1,i),ring(j+1,i+1),ring(j,i+1),color,.89+j*.1+.045*Math.sin(i*3));
    this.tri(ring(2,i),[x+w*.05,y+h,z],ring(2,i+1),color,1.03);
   }
   const ca=Math.cos(this.angle),sa=Math.sin(this.angle);
   for(let i=start;i<this.data.length;i+=9){
    const dx=this.data[i]-center[0],dy=this.data[i+1]-center[1],dz=this.data[i+2]-center[2];
    const nx=(dx*ca+dz*sa)/(w*w),nz=(-dx*sa+dz*ca)/(d*d);
    const normal=norm([nx*ca-nz*sa,dy/(h*h),nx*sa+nz*ca]);
    const len=Math.hypot(this.data[i+3],this.data[i+4],this.data[i+5]);
    for(let j=0;j<3;j++)this.data[i+3+j]=normal[j]*len;
   }
 }
 ring(x,y,z,r,width,color){
   for(let i=0;i<36;i++){let a=i*TAU/36,b=(i+1)*TAU/36;
    const p=(ang,rad)=>[x+Math.cos(ang)*rad,y,z+Math.sin(ang)*rad];
    this.quad(p(a,r),p(a,r+width),p(b,r+width),p(b,r),color);
   }
 }
}

function woodenSign(m,word,y=2.83,z=-3.01,unit=.077){
 const letters={P:["110","101","110","100","100"],O:["010","101","101","101","010"],D:["110","101","101","101","110"],W:["101","101","111","111","101"],I:["111","010","010","010","111"],S:["011","100","010","001","110"],Ł:["100","101","110","100","111"],E:["111","100","110","100","111"],M:["10001","11011","10101","10001","10001"]};
 Object.assign(letters,{C:["011","100","100","100","011"],Z:["111","001","010","100","111"],A:["010","101","111","101","101"],Ą:["010","101","111","101","101","001"],U:["101","101","101","101","111"],F:["111","100","110","100","100"],L:["100","100","100","100","111"],K:["101","110","100","110","101"]});
 letters.R=["110","101","110","101","101"];letters.T=["111","010","010","010","010"];
 const wide=([...word].reduce((sum,c)=>sum+(c===" "?2.4:letters[c][0].length+1),0)+3)*unit;
 m.box(0,y,z,wide,unit*7.3,.12,0x344239);
 let x=-unit*([...word].reduce((width,ch)=>width+(ch===" "?2.4:letters[ch][0].length+1),0)-2)/2;
 for(const ch of word){
  if(ch===" "){x+=unit*2.4;continue;}
  const pattern=letters[ch];
  pattern.forEach((line,j)=>[...line].forEach((pixel,i)=>{
   if(pixel==="1")m.box(-(x+i*unit),y+unit*(1+4-j),z-.067,unit*.95,unit*.94,.013,0xf1d698);
  }));
  x+=(pattern[0].length+1)*unit;
 }
}
function buildTerrace(m,p){
 const base=Math.min(...[-5.2,0,5.2].flatMap(dx=>[-9.2,-3,2.8].map(dz=>landY(p.x+dx,p.z+dz))))-p.y-.55;
 m.at(p.x,p.y,p.z);
 m.box(0,base,-3.15,10.4,-base-.075,12.1,0x827d6a);
 for(let i=0;i<24;i++)m.box(0,-.08,-9.05+i*.286,10.37,.08,.277,i%4?0xa58e6f:0x9b8265);
 for(let i=0;i<4;i++){
  const dz=-10.45+i*.34,h=lerp(landY(p.x,p.z-10.8)-p.y,0,(i+1)/5);
  m.box(0,base,dz,3.35,h-base,.37,0xa69c82);
 }
 for(const x of [-2.55,2.55]){
  m.oval(x,.001,-5.8,.88,.003,.56,0x8b795d,12);
  m.box(x,.74,-5.8,1.54,.08,.89,0x907354);
  for(const k of [-1,1])for(const f of [-1,1])m.box(x+k*.63,0,-5.8+f*.32,.087,.74,.087,0x6e5b45);
  m.box(x,.818,-5.8,.56,.012,.92,0xab5141);
  for(let j=-3;j<=3;j++)m.box(x,.831,-5.8+j*.13,.56,.004,.015,0xf0d9bd);
  for(const k of [-1,1]){
   m.pole([x,.829,-5.8+k*.25],[x,.846,-5.8+k*.25],.137,.143,0xe5deca,12);
   m.oval(x-.025,.855,-5.8+k*.25,.085,.025,.046,0xae8344,7);
  }
 }
 for(const p of diningSeats){
  const zback=p.a===0?.22:-.22;
  m.oval(p.x,.001,p.z,.30,.003,.27,0x89775d,10);
  for(const k of [-1,1])for(const f of [-1,1])m.box(p.x+k*.19,0,p.z+f*.17,.052,.39,.055,0x63543f);
  m.box(p.x,.39,p.z,.46,.055,.45,0x88704f);
  for(const k of [-1,1])m.box(p.x+k*.19,.43,p.z+zback,.054,.42,.052,0x715e46);
  m.box(p.x,.72,p.z+zback,.43,.104,.05,0x8d7552);
 }
 for(const k of [-1,1]){
  m.box(k*4.98,.26,-5.75,.12,.13,6.46,0x837459);m.box(k*4.98,.83,-5.75,.13,.095,6.46,0x8c795c);
  for(const dz of [-8.9,-6,-3])m.box(k*4.98,0,dz,.11,.97,.11,0x77674f);
  m.box(k*2.38,.99,-2.63,1.52,.21,.32,0x82563f);
  for(let i=-2;i<=2;i++){m.oval(k*2.38+i*.26,1.23,-2.69,.145,.134,.112,0x5c7442,6);m.oval(k*2.38+i*.26,1.32,-2.73,.085,.067,.071,i%2?0xbb4c48:0xd66d59,6);}
  for(const j of [-1,1]){
   const x=k*2.38+j*.89;
   m.box(x,1.01,-2.46,.43,1.26,.08,0x576455);
   for(let row=0;row<5;row++)m.box(x,1.09+row*.226,-2.516,.37,.044,.022,0x69755f);
  }
  m.pole([k*4.22,2.88,-2.91],[0,4.64,-2.91],.082,.081,0x72583f,6);
  m.pole([k*1.17,2.91,-2.92],[0,3.88,-2.92],.060,.057,0xaf8966,5);
  m.pole([k*3.21,.02,-3.60],[k*3.21,2.42,-3.60],.059,.057,0x806c51,7);
 }
 m.pole([0,3.1,-2.92],[0,4.52,-2.92],.064,.064,0x806448,6);
 m.box(0,.25,-2.49,1.23,2.06,.09,0x6d5943);
 m.box(0,1.34,-2.55,.75,.72,.03,0x77908c);m.box(0,1.32,-2.575,.045,.76,.026,0xb7a27d);
 for(const x of [-.26,.26])m.box(x,.42,-2.55,.36,.62,.03,0x7d654a);
 m.box(.45,1.14,-2.59,.11,.035,.06,0xc4ad77);
 woodenSign(m,localInn().sign);
}
function house(m,p,dining){
 const w=dining?7.7:5.3,d=dining?4.8:4.2,h=3,wood=dining?0x985f45:0xa38c68,trim=0xd7c8a5;
 m.at(p.x,p.y-.1,p.z);
 m.box(0,0,0,w+.15,.35,d+.2,0x8b8975);
 for(let i=0;i<12;i++)m.box(0,.35+i*.225,0,w,.22,d,wood);
 const a=[-w*.56,h,-d*.6],b=[w*.56,h,-d*.6],c=[w*.56,h,d*.6],e=[-w*.56,h,d*.6],f=[0,h+1.75,-d*.6],g=[0,h+1.75,d*.6];
 m.quad(a,f,g,e,0x596159);m.quad(f,b,c,g,0x52564e);m.tri(a,b,f,wood);m.tri(c,e,g,wood);
 for(const side of [-1,1]){
   const z=side*(d*.5+.025);
   m.box(0,.3,z,1.22,2.18,.13,0x544f3e);
   for(const x of [-w*.31,w*.31]){
    m.box(x,1.09,z,1.2,1.28,.15,trim);m.box(x,1.19,z+side*.084,1.02,1.05,.025,0x608081);
    m.box(x,1.15,z+side*.11,.07,1.13,.03,trim);m.box(x,1.68,z+side*.11,1.08,.065,.03,trim);
   }
 }
 m.box(w*.28,h+.25,d*.13,.53,1.8,.55,0x9a735a);
 if(dining){
   for(let i=-4;i<4;i++)m.quad([i*.83,2.73,-d*.5],[(i+1)*.83,2.73,-d*.5],[(i+1)*.83,2.49,-d*.5-1.25],[i*.83,2.49,-d*.5-1.25],i%2?0xdcc9a6:0x9a5343);
   buildTerrace(m,p);
 }else woodenSign(m,localInn().homeSign,2.55,-d*.61,.064);
}
function tent(m,x,z,size,color){
 m.at(x,landY(x,z)-.01,z,.12);
 const a=[-size,0,-1.33*size],b=[size,0,-1.33*size],c=[size,0,1.33*size],d=[-size,0,1.33*size],f=[0,1.45*size,-1.33*size],g=[0,1.45*size,1.33*size];
 m.quad(a,f,g,d,color);m.quad(f,b,c,g,color,.89);m.tri(c,d,g,color);m.tri(a,b,f,color,.85);
 m.tri([-.65*size,.02,a[2]-.02],[.52*size,.02,a[2]-.02],[0,1.15*size,a[2]-.02],0x373d30);
 for(const k of [-1,1])for(const j of [-1,1])m.pole([k*size*.5,.75*size,j*size],[k*size*1.5,.04,j*size*1.35],.014,.015,0xc4b99b,3);
}
function buildLand(){
 const m=new Geometry(),w=new Geometry(),l=lake(),v=village(),rnd=seeded(l.seed),grass=l.ground;
 const levels=[.998,1.019,1.06,1.10,1.14,1.20,1.26,1.34,1.46,...Array.from({length:30},(_,i)=>1.50+.045*i),2.9,...(life.lake===2?[4.0]:Array.from({length:22},(_,i)=>3+i*.08))];
 if(life.lake===2)levels.splice(-1,1,...Array.from({length:34},(_,i)=>3+i*.10));
 const sectors=192;
 m.material=1;
 for(let i=0;i<sectors;i++){
   const a=i*TAU/sectors,b=(i+1)*TAU/sectors;
   const p=(ang,r)=>{const [x,z]=polar(l,ang,r);return [x,landY(x,z),z];};
   const u=p(a,1.007),vv=p(b,1.007);w.tri([0,.005,0],[vv[0],.005,vv[2]],[u[0],.005,u[2]],l.water);
   for(let j=0;j<levels.length-1;j++){
    let color=grass;
    if(life.lake===0&&j<(Math.sin(a)<.45?5:2))color=j<2?0xd8c59d:0xc7be8b;
    if(life.lake===1&&j<3)color=j===0?0x807851:0x9a9153;
    if(life.lake===2&&Math.sin(a)<.30&&j<7)color=[0x7b8589,0x989b95,0x858b8b,0xa2a49a,0x838780,0x92968a,0x858c7e][j];
    if(life.lake===2&&levels[j]>2.6)color=levels[j]>4.55?0x72847e:0x586f5a;
    m.quad(p(a,levels[j]),p(b,levels[j]),p(b,levels[j+1]),p(a,levels[j+1]),color,.92+rnd()*.1);
   }
 }
 if(life.lake!==2)backdrop(m,rnd);
 const clear=(x,z)=>[v.home,v.restaurant,v.camp,v.pier].every(p=>Math.hypot(p.x-x,p.z-z)>8)&&!(z>v.tip&&Math.abs(x)<6);
 m.material=0;
 m.at(0,0,0);
 for(let i=0;i<(life.lake===1?1450:800);i++){
   const a=rnd()*TAU,[x,z]=polar(l,a,.948+rnd()*.137);
   if(z>0&&Math.abs(x)<4.5)continue;
   const y=Math.max(-.07,landY(x,z)),h=.36+rnd()*1.0,c=[0x82934c,0x98a05e,0x687c45,0xb0a960][i%4];
   m.tri([x-.04,y,z],[x+.05,y,z],[x+.19,y+h,z+.1],c);
   m.tri([x,y,z-.035],[x,y,z+.04],[x-.12,y+h*1.15,z+.04],c);
   if(i%10===0)m.pole([x+.13,y+h*.74,z+.08],[x+.17,y+h*.99,z+.1],.038,.035,0x755f42,4);
 }
 for(let i=0;i<155;i++){
  let [x,z]=polar(l,rnd()*TAU,.99+rnd()*.25);if(!clear(x,z))continue;
  let s=.19+rnd()**2*1.15;m.oval(x,landY(x,z),z,s,s*.54,s*.81,0x929383,6);
 }
 m.material=2;
 for(let z=v.tip+.13;z<v.shore+3;z+=.3){
  m.box(0,.59,z,3.84+rnd()*.08,.13,.284,0x957f65+(Math.floor(rnd()*15)*0x010101));
  for(const x of [-1.48,1.48])m.pole([x,.72,z],[x,.723,z],.018,.018,0x635e50,6);
 }
 for(let z=v.tip+.4;z<v.shore+2.8;z+=2.7)for(const x of [-1.82,1.82]){m.pole([x,-.65,z],[x,1.05,z],.14,.11,0x73664b,7);m.pole([x,1.045,z],[x,1.08,z],.12,.12,0xb09a71,7);}
 m.material=0;house(m,v.home,false);house(m,v.restaurant,true);tent(m,v.camp.x-2.5,v.camp.z,1.25,0x97724a);tent(m,v.camp.x-4,v.camp.z+3.7,1,0x687e63);
 m.at(v.camp.x,v.camp.y,v.camp.z);
 for(let j=0;j<12;j++){let a=j*TAU/12;m.oval(Math.cos(a)*.66,.10,Math.sin(a)*.66,.16,.13,.18,0x8f8876,6);}
 m.pole([-.45,.12,-.25],[.48,.15,.3],.11,.1,0x654732);m.pole([-.28,.13,.46],[.3,.12,-.47],.12,.1,0x5b3e30);
 addUndergrowth(m,v);
 buildFootpaths(m);
 addLandmarks(m);
 buildTown(m);
 return {land:m,water:w};
}
