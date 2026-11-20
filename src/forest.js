// Paint bark, boughs and individual leaf clusters into an offline, mipmapped canopy atlas.
function canopyAtlas(){
 const canvas=document.createElement("canvas");canvas.width=canvas.height=1024;
 const g=canvas.getContext("2d");
 for(let variant=0;variant<8;variant++){
  const rand=seeded(69017+variant*551),pine=variant<4;
  const range=(a,b)=>lerp(a,b,rand());
  g.save();g.translate(variant%4*256,Math.floor(variant/4)*512);g.beginPath();g.rect(1,1,254,510);g.clip();
  const trunkX=129+range(-8,8),peak=range(12,31),ground=504,tilt=range(-10,10),atY=y=>trunkX+(1-(y-peak)/(ground-peak))*tilt+Math.sin(y*.009+variant)*2;
  function stroke(x,y,ex,ey,w,color){
   g.strokeStyle=color;g.lineWidth=w;g.lineCap="round";g.beginPath();g.moveTo(x,y);g.lineTo(ex,ey);g.stroke();
  }
  function bark(y1,y2,w){
   for(let y=y1;y<y2;y+=5){
    let x=atY(y),width=w*(.08+.92*Math.pow((y-peak)/(ground-peak),.78));
    stroke(x,y,x+atY(y+5)-x,y+5,width,pine?"#675c48":"#c0bc9e");
    stroke(x-width*.27,y,x-width*.26,y+5,width*.23,pine?"#82745c":"#ded7ba");
    if(rand()<(pine?.42:.78))stroke(x+width*.11,y+1,x+width*range(-.34,.39),y+range(.1,2.2),range(.5,1.65),pine?"#463d32":"#666657");
   }
  }
  bark(peak,ground,pine?11:9);
  if(pine){
   // Project branches from whorls at different azimuths. Needle sprays overlap from back to front.
   const rows=28,low=range(337,402);
   for(let i=rows;i>=0;i--){
    let u=i/rows,y=lerp(peak,low,u)+range(-4,4),radius=(12+88*Math.pow(u,.83))*range(.87,1.09);
    for(let j=0;j<8;j++){
     const a=j*2.4+i*1.53,side=Math.cos(a),fore=Math.sin(a);
     let len=radius*side*range(.75,1.10),x=atY(y),ey=y+range(9,22)*u+fore*9;
     stroke(x,y,x+len,ey,1.45,"#4b5140");
     for(let k=0;k<19;k++){
      const s=k/18,xx=x+len*s,yy=lerp(y,ey,s)+Math.sin(s*Math.PI)*(6+u*6);
      const fan=(1-s*.72)*(4+u*13),br=range(.72,1.15)+fore*.10-s*.07-side*.08;
      const col=(gain)=>'rgb('+[64,83,56].map((v,n)=>Math.round(v*br*gain+(n===1?variant*2:0))).join(",")+')';
      for(let t=0;t<6;t++){
       const ex=xx+range(-fan,fan),end=yy+range(-.15,1.6)*fan;
       stroke(xx,yy,ex,end,range(1.1,3.3),col(t%3===0?1.20:.91));
       stroke(ex,end,ex+range(-3,3),end+range(-3,1.3),1.4,col(1.34));
      }
     }
    }
   }
  }else{
   const clusters=[];
   function twig(x,y,angle,length,width,depth){
    const ex=x+Math.sin(angle)*length,ey=y-Math.cos(angle)*length;
    stroke(x,y,ex,ey,width,depth>1?"#888671":"#74795d");
    if(depth<=1)clusters.push([ex,ey,range(8,17),range(.78,1.22)]);
    if(depth===0)return;
    twig(ex,ey,angle*.81+range(-.49,.49),length*range(.60,.78),width*.64,depth-1);
    twig(ex,ey,angle*.56+range(.41,.91)*(rand()<.5?-1:1),length*range(.52,.73),width*.54,depth-1);
   }
   for(let j=0;j<31;j++){
    const y=range(105,355),side=j%2?-1:1;
    twig(atY(y),y,side*range(.30,1.10),range(24,57)*(1-.0014*Math.abs(y-230)),range(2.4,5.5),3);
   }
   for(const [x,y,r,base] of clusters){
    if(x<8||x>248||y<10)continue;
    const shade=base*(1.16-x*.0011)*(1.03-y*.00038);
    for(let j=0;j<55;j++){
     const a=rand()*TAU,dist=Math.sqrt(rand())*r,dx=Math.cos(a)*dist,dy=Math.sin(a)*dist;
     const k=shade*range(.79,1.25)*(1-dy*.011),v=variant-4;
     g.fillStyle='rgb('+[88+v*3,106+v,60-v*2].map(n=>Math.round(n*k)).join(",")+')';
     g.beginPath();g.ellipse(x+dx,y+dy,range(1.3,3.7),range(1.1,2.7),a,0,TAU);g.fill();
    }
   }
  }
  g.restore();
 }
 return canvas;
}
function buildForest(v){
 const l=lake(),rand=seeded(93467+l.seed),trees=[],mesh=new Geometry();
 function canopy(x,y,z,type,wide,h,tint,flipped){
  for(const [u,vv] of [[0,1],[1,1],[0,0],[1,1],[1,0],[0,0]]){
   const utex=((type%4)*256+1.5+(flipped?1-u:u)*253)/1024,vtex=(Math.floor(type/4)*512+1.5+vv*509)/1024;
   mesh.data.push(x,y,z,(u-.5)*wide,(1-vv)*h,utex,vtex,tint,0);
  }
 }
 const outskirts=countryside();
 for(let i=0;i<[820,190,670][life.lake];i++){
  const angle=rand()*TAU,r=1.045+rand()**1.24*1.96,[x,z]=polar(l,angle,r);
  if(inTownClearing(x,z)||innClearing(x,z,v)||[v.home,v.restaurant,v.camp,v.pier].some(p=>Math.hypot(p.x-x,p.z-z)<8)||z>v.tip&&Math.abs(x)<5.6)continue;
  if(r<1.095&&angle>.95&&angle<2.38)continue;
  if(life.lake===0&&angle>4.35&&angle<5.30&&r<1.37)continue;
  if(life.lake===1&&r<1.40&&Math.sin(angle)<.70)continue;
  if(life.lake===2&&Math.sin(angle)<.32&&r<1.47)continue;
  const birch=rand()<[.89,.93,.065][life.lake];
  const type=(birch?4:0)+Math.floor(rand()*4),h=((birch?6.1:7.3)+rand()**1.2*(birch?7.4:9.3))*(life.lake===1?.48:1);
  const wide=h*(birch?.68:.55)*(.82+rand()*.35),y=landY(x,z)-.09,tint=.85+rand()*.26;
  const flipped=rand()<.5;
  if(nearTrail({x,z},outskirts.lane,2.1))continue;
  canopy(x,y,z,type,wide,h,tint,flipped);
  trees.push({x,z,h,wide});
 }
 for(const t of outskirts.trees){
  const pine=t.type==="spruce",h=t.size*(pine?10:t.type==="alder"?6.4:8.5);
  canopy(t.x,landY(t.x,t.z)-.15,t.z,(pine?0:4)+t.variant,h*(pine?.52:.72),h,.88+.05*t.variant,t.variant%2===0);
 }
 outskirts.nearTrees=trees.map(t=>({x:t.x,z:t.z,size:t.h*.095,type:life.lake===2?"spruce":"birch"}));
 return {mesh,trees};
}
function canopyShadows(trees,sun,canvas){
 const g=canvas.getContext("2d"),s=canvas.width/256;
 g.setTransform(s,0,0,s,canvas.width/2,canvas.height/2);
 g.fillStyle="#fff";g.fillRect(-128,-128,256,256);
 const lightAngle=Math.atan2(-sun[2],-sun[0]),slope=Math.min(2.8,Math.hypot(sun[0],sun[2])/Math.max(.24,sun[1]));
 for(const tree of trees){
  const len=tree.h*slope*.71,r=tree.wide*.37;
  g.save();g.translate(tree.x+Math.cos(lightAngle)*len*.64,tree.z+Math.sin(lightAngle)*len*.64);g.rotate(lightAngle);
  g.scale(Math.max(r,len*.59),r);let grad=g.createRadialGradient(0,0,.28,0,0,1);
  grad.addColorStop(0,"rgba(24,36,31,.54)");grad.addColorStop(.62,"rgba(30,40,34,.42)");grad.addColorStop(1,"rgba(49,54,42,0)");
  g.fillStyle=grad;g.fillRect(-1,-1,2,2);g.restore();
 }
}
