const sceneVS=`attribute vec3 pos,nor,col;uniform vec3 eye,front,rightv,upv;uniform vec2 lens;uniform float mirror,clock,mode;varying vec3 wp,wn,wc;varying float mat;
uniform vec4 weather;
void main(){wp=pos;wn=nor;wc=col;mat=floor(col.r*.5);wc.r-=2.*mat;
 if(mode>1.5){wp+=rightv*nor.x+vec3(sin(clock*.85+pos.x*.36+pos.z*.19)*nor.y*.009,nor.y,0.);wc=vec3(nor.z,col.x,col.y);wn=vec3(0.,1.,0.);}
 else{float sway=max(0.,length(nor)-1.);if(sway>.001){float gust=sin(clock*1.6+pos.z*.51+pos.x*.24)*.064+sin(clock*.67+pos.x*.8)*.042;wp.xz+=sway*vec2(gust,gust*.46)*(.52+weather.w*2.9);}}
 vec3 p=vec3(wp.x,wp.y*mirror,wp.z)-eye;float d=dot(p,front);gl_Position=vec4(dot(p,rightv)/lens.x,dot(p,upv)/lens.y,d*1.00020-.12,d);}`;
const sceneFS=`precision highp float;varying vec3 wp,wn,wc;varying float mat;uniform vec3 eye,fog,sun,ambient;uniform float clock,mode,lighting;uniform vec2 resolution,actor;uniform sampler2D reflection,foliage,shadeMap;
float hash(vec2 p){vec3 a=fract(vec3(p.xyx)*.1031);a+=dot(a,a.yzx+33.33);return fract((a.x+a.y)*a.z);}
float noise(vec2 p){vec2 i=floor(p),u=fract(p);u=u*u*(3.-2.*u);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),u.x),u.y);}
uniform vec4 weather;
void main(){float dist=length(wp-eye);vec3 c;
 if(mode>1.5){vec4 leaf=texture2D(foliage,wc.xy);if(leaf.a<.36)discard;c=leaf.rgb/max(leaf.a,.1)*ambient*wc.z*(.98+.09*lighting);}
 else if(mode>.5){vec2 p=wp.xz;float t=clock;float patch=noise(p*.13+vec2(t*.027,0.));float a=sin(dot(p,vec2(.63,1.07))-t*1.18+patch*3.);
 float b=sin(dot(p,vec2(1.06,3.93))+t*1.72+2.1*patch),e=sin(dot(p,vec2(1.04,-.74))+t*.72);
 float cap=sin(p.y*12.6+p.x*2.1+t*2.55+3.*b),fine=1.-smoothstep(14.,68.,dist);
 vec2 rip=vec2(a*.43+e*.31+cap*.16*fine,b*.54+a*.21+cap*.22*fine)*(.56+.73*patch);
 rip*=.73+weather.w*1.5;vec3 n=normalize(vec3(rip.x*.16,1.,rip.y*.16));vec3 v=normalize(eye-wp);float edge=pow(1.-max(dot(n,v),0.),3.);
 vec3 reflected=texture2D(reflection,clamp(gl_FragCoord.xy/resolution+rip*vec2(.004,.007),vec2(.002),vec2(.998))).rgb;
 vec3 deep=wc*vec3(.66,.74,.70)*ambient*(.89+.16*patch);c=mix(deep,reflected,.21+.74*edge);
 float glitter=pow(max(dot(n,normalize(v+sun)),0.),165.);c+=vec3(1.,.87,.64)*glitter*.87*lighting;
 c+=vec3(.048,.056,.054)*max(cap-.68,0.)*fine*patch*lighting;
 }else{vec3 n=normalize(wn);float d=max(dot(n,sun),0.);float shade=texture2D(shadeMap,wp.xz/256.+.5).r;
 float textureGain=1.;
 if(mat>.5&&mat<1.5){textureGain=.77+.27*noise(wp.xz*.68)+.19*noise(wp.xz*6.2)+.10*noise(wp.xz*40.);}
 if(mat>1.5){vec2 wood=vec2(wp.x*1.4,wp.z*33.);float wobble=noise(vec2(wp.x*1.3,wp.z*4.8));
 float grain=noise(wood+vec2(0.,wobble*3.));textureGain=.73+.44*grain+.14*noise(wood*3.7); }
 vec2 shadowVec=wp.xz-actor+sun.xz*.65;float contact=exp(-dot(shadowVec,shadowVec)*2.4);
 float receiver=mat>.5?1.:.26;float shadow=mix(1.,(.65+.35*shade)*(1.-.25*contact),receiver*lighting);
 c=wc*ambient*(.56+.15*max(n.y,0.)+.45*d)*textureGain*shadow;c+=vec3(.025,.014,.002)*d*lighting;}
 float haze=1.-exp(-dist*dist*(.000025+.00020*weather.z*weather.z));gl_FragColor=vec4(mix(c,fog,haze*(mode>.5&&mode<1.5?.36:.90)),1.);}`;
const skyVS=`attribute vec2 pt;varying vec2 uv;void main(){uv=pt;gl_Position=vec4(pt,0.,1.);}`;
const skyFS=`precision highp float;varying vec2 uv;uniform vec3 front,rightv,upv,sun,fog,high;uniform vec2 lens;uniform float mirror,lighting,clock;
float hash(vec2 p){return fract(sin(dot(p,vec2(67.1,39.7)))*4131.53);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
uniform vec4 weather;
void main(){vec3 ray=normalize(front+rightv*uv.x*lens.x+upv*uv.y*lens.y);ray.y*=mirror;float h=max(ray.y,0.);vec3 col=mix(fog,high,pow(clamp(h*1.65,0.,1.),.69));float s=max(dot(ray,sun),0.);
 col+=vec3(1.,.78,.49)*(pow(s,28.)*.19+smoothstep(.9992,.9996,s)*.89)*lighting;
 vec2 p=ray.xz/(h+.14)*vec2(2.1,3.1)+vec2(clock*(.0014+.004*weather.w),0.);p+=.38*noise(p*.61);
 float cloud=noise(p)*.48+noise(p*2.13)*.27+noise(p*4.31)*.14+noise(p*8.77)*.075+noise(p*18.42)*.035;
 float cloudShade=mix(.78,1.03,smoothstep(.39,.74,cloud+noise(p+sun.xz*.29)*.09));
 col=mix(col,mix(fog,vec3(.995,.976,.94),.78)*cloudShade*(1.-weather.x*.25),smoothstep(.51-weather.x*.29,.70-weather.x*.22,cloud)*smoothstep(.014,.095,h)*(.16+.77*lighting));
 float star=step(.9976,hash(floor(ray.xz/(h+.16)*325.)))*smoothstep(.03,.26,h)*(1.-smoothstep(.04,.34,lighting))*(1.-weather.x);col+=vec3(star*.8);
 gl_FragColor=vec4(col,1.);}`;
const roomFS=`precision highp float;varying vec3 wp,wn,wc;varying float mat;uniform vec3 eye;uniform float daylight;
float grain(vec2 p){return fract(sin(dot(p,vec2(37.1,17.7)))*1315.23);}
void main(){vec3 n=normalize(wn),c=wc;vec3 lamp=vec3(-.72,2.25,-.42)-wp;
 float warm=(.65+.35*abs(dot(n,normalize(lamp))))/(1.+dot(lamp,lamp)*.11);
 float sky=(.40+.60*max(dot(n,normalize(vec3(-.5,.75,-1.))),0.))*daylight;
 float ambient=.62+.19*max(n.y,0.);c*=vec3(1.,.89,.75)*(ambient+.50*warm)+vec3(.24,.29,.29)*sky;
 if(mat>1.5){float g=sin(wp.x*3.+sin(wp.z*65.)*1.3+wp.z*165.);c*=.95+.042*g+.025*grain(floor(wp.xz*145.));}
 if(wp.z< -5.)c=wc*(.44+.62*daylight);gl_FragColor=vec4(c,1.);}`;
function linkGL(gl,vs,fs){
 const p=gl.createProgram();
 for(const [type,src] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){
  let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));gl.attachShader(p,s);gl.deleteShader(s);
 }
 gl.bindAttribLocation(p,0,vs===skyVS?"pt":"pos");if(vs===sceneVS){gl.bindAttribLocation(p,1,"nor");gl.bindAttribLocation(p,2,"col");}
 gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
 const u={};for(let i=0;i<gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);i++){const k=gl.getActiveUniform(p,i).name;u[k]=gl.getUniformLocation(p,k);}
 return {p,u};
}
class Engine{
 constructor(canvas){
  this.el=canvas;const gl=this.gl=canvas.getContext("webgl",{alpha:false,antialias:true,powerPreference:"high-performance"});
  if(!gl)throw Error("WebGL");this.surface=linkGL(gl,sceneVS,sceneFS);this.sky=linkGL(gl,skyVS,skyFS);this.rain=linkGL(gl,skyVS,rainFS);
  this.interior=linkGL(gl,sceneVS,roomFS);this.roomBuffer=gl.createBuffer();
  this.terrain=gl.createBuffer();this.water=gl.createBuffer();this.entities=gl.createBuffer();this.full=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,this.full);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  this.rt=gl.createTexture();this.fb=gl.createFramebuffer();this.depth=gl.createRenderbuffer();this.width=0;
  this.forest=gl.createBuffer();this.treeTexture=gl.createTexture();this.shadowTexture=gl.createTexture();
  this.shadowCanvas=document.createElement("canvas");this.shadowCanvas.width=this.shadowCanvas.height=512;
  this.canvasTexture(1,this.treeTexture,canopyAtlas(),true);
  this.lightStep=-1;this.mobile=matchMedia("(pointer:coarse)").matches;
  this.renderScale=this.mobile?1:1.4;
 }
 canvasTexture(unit,texture,source,mips){
  const gl=this.gl;gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,mips);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,mips?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  for(const k of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE);
  if(mips)gl.generateMipmap(gl.TEXTURE_2D);gl.activeTexture(gl.TEXTURE0);
 }
 load(buf,mesh,dynamic=false){const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(mesh.data),dynamic?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);return mesh.data.length/9;}
 rebuild(){let {land,water}=buildLand();this.landCount=this.load(this.terrain,land);this.waterCount=this.load(this.water,water);
  const f=buildForest(village());this.trees=f.trees;this.treeCount=this.load(this.forest,f.mesh);this.lightStep=-1;
  this.roomCount=this.load(this.roomBuffer,buildInnRoom());
 }
 resize(){
  let gl=this.gl,c=this.el,r=Math.min(devicePixelRatio||1,this.renderScale,1600/c.clientWidth,(this.mobile?800:1000)/c.clientHeight),w=Math.max(2,Math.round(c.clientWidth*r)),h=Math.max(2,Math.round(c.clientHeight*r));
  if(this.width===w&&this.height===h)return;this.width=c.width=w;this.height=c.height=h;
  this.rw=Math.max(1,w>>1);this.rh=Math.max(1,h>>1);
  gl.bindTexture(gl.TEXTURE_2D,this.rt);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,this.rw,this.rh,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  for(const t of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,t,gl.LINEAR);
  for(const t of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,t,gl.CLAMP_TO_EDGE);
  gl.bindRenderbuffer(gl.RENDERBUFFER,this.depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,this.rw,this.rh);
  gl.bindFramebuffer(gl.FRAMEBUFFER,this.fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.rt,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,this.depth);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  gl.bindTexture(gl.TEXTURE_2D,null);
 }
 draw(buf,count){
  const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,buf);for(let i=0;i<3;i++){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,3,gl.FLOAT,false,36,i*12);}gl.drawArrays(gl.TRIANGLES,0,count);
 }
 frame(eye,target,fov,mesh,t){
  this.resize();const gl=this.gl,front=norm(sub(target,eye)),rightv=norm(cross(front,[0,1,0])),upv=cross(rightv,front);
  const h=Math.tan(fov*.5),lens=[h*this.width/this.height,h],hour=life.time,alt=Math.sin((hour-5.6)/24*TAU);
  if(me.room){
   const u=this.interior.u;gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,this.width,this.height);
   gl.clearColor(.48,.56,.56,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.useProgram(this.interior.p);
   for(const [key,value] of Object.entries({eye,front,rightv,upv}))gl.uniform3fv(u[key],value);
   gl.uniform2fv(u.lens,lens);gl.uniform1f(u.mirror,1);gl.uniform1f(u.mode,0);gl.uniform1f(u.clock,t);
   gl.uniform4f(u.weather,0,0,0,0);gl.uniform1f(u.daylight,sat((alt+.2)*2));
   this.draw(this.roomBuffer,this.roomCount);const count=this.load(this.entities,mesh,true);this.draw(this.entities,count);return;
  }
  const light=sat((alt+.2)*2.9),warm=sat(1-Math.abs(alt)*2)*light;
  const palette=(a,b,c)=>hex(a).map((v,i)=>lerp(lerp(v,hex(b)[i],light),hex(c)[i],warm*.67));
  const w=weatherAt(),cover=w.cloud;
  const overcast=(colors,gain)=>colors.map((c,i)=>lerp(c,(.16+.53*light)*[.93,1,1.03][i],gain));
  const fog=overcast(palette(0x35445c,0xc5d4d2,0xf2cc9f),cover*.65+w.haze*.20);
  const high=overcast(palette(0x111d34,0x568eb2,0x81a7ba),cover*.79+w.haze*.16);
  const ambient=overcast(palette(0x73879a,0xfffdf2,0xffe6c1),cover*.67);
  const sun=norm([-.71*Math.cos((hour-7)*TAU/24),Math.max(.12,alt),-.75]),count=this.load(this.entities,mesh,true);
  if(Math.floor(hour*4)!==this.lightStep){canopyShadows(this.trees,sun,this.shadowCanvas);this.canvasTexture(2,this.shadowTexture,this.shadowCanvas,false);this.lightStep=Math.floor(hour*4);}
  const basis=(u,mirror)=>{for(const [k,v] of Object.entries({front,rightv,upv,fog,sun}))gl.uniform3fv(u[k],v);gl.uniform2fv(u.lens,lens);gl.uniform4f(u.weather,cover,w.rain,w.haze,w.wind);gl.uniform1f(u.mirror,mirror);gl.uniform1f(u.lighting,light*(1-cover*.55));gl.uniform1f(u.clock,t);};
  for(const mirror of [-1,1]){
   const reflected=mirror===-1;gl.bindTexture(gl.TEXTURE_2D,null);
   gl.bindFramebuffer(gl.FRAMEBUFFER,reflected?this.fb:null);gl.viewport(0,0,reflected?this.rw:this.width,reflected?this.rh:this.height);gl.clear(gl.DEPTH_BUFFER_BIT);
   gl.disable(gl.DEPTH_TEST);gl.useProgram(this.sky.p);basis(this.sky.u,mirror);gl.uniform3fv(this.sky.u.high,high);
   gl.disableVertexAttribArray(1);gl.disableVertexAttribArray(2);gl.bindBuffer(gl.ARRAY_BUFFER,this.full);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,3);
   const u=this.surface.u;gl.useProgram(this.surface.p);basis(u,mirror);gl.uniform3fv(u.eye,eye);gl.uniform3fv(u.ambient,ambient);gl.uniform2f(u.resolution,this.width,this.height);
   gl.uniform2f(u.actor,me.x,me.z);gl.uniform1i(u.foliage,1);gl.uniform1i(u.shadeMap,2);
   gl.enable(gl.DEPTH_TEST);gl.uniform1f(u.mode,0);this.draw(this.terrain,this.landCount);this.draw(this.entities,count);
   gl.uniform1f(u.mode,2);this.draw(this.forest,this.treeCount);
   if(!reflected){gl.bindTexture(gl.TEXTURE_2D,this.rt);gl.uniform1f(u.mode,1);this.draw(this.water,this.waterCount);}
  }
  if(w.rain>.01){
   const u=this.rain.u;gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
   gl.useProgram(this.rain.p);gl.uniform1f(u.clock,t%120);gl.uniform1f(u.intensity,w.rain);gl.uniform2f(u.resolution,this.width,this.height);
   gl.disableVertexAttribArray(1);gl.disableVertexAttribArray(2);gl.bindBuffer(gl.ARRAY_BUFFER,this.full);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,3);gl.disable(gl.BLEND);
  }
 }
}

function hull(m,color,big){
 const k=big?1.38:1,rim=[[-.22,-2.12],[-.71,-1.28],[-.8,.8],[-.65,1.73],[.65,1.73],[.8,.8],[.71,-1.28],[.22,-2.12]];
 for(let i=0;i<rim.length;i++){
  const pt=(j,y,s)=>[rim[j%8][0]*k*s,y,rim[j%8][1]*k*s],j=i+1;
  m.quad(pt(i,-.07,.77),pt(i,.48,1),pt(j,.48,1),pt(j,-.07,.77),color);
  m.quad(pt(i,.48,1),pt(i,.55,1.02),pt(j,.55,1.02),pt(j,.48,1),0xd2b58a);
  m.tri([0,.13,0],pt(i,.18,.81),pt(j,.18,.81),0x8b7353);
 }
 for(const z of [-.78,.72])m.box(0,.35,z*k,1.37*k,.1,.3,0xaf946b);
}
function sailboat(m,x,z,a,t,color){
 m.at(x,.045+.045*Math.sin(t*1.4+x),z,a);hull(m,0x516f76,true);
 m.box(0,.39,.5,1.48,.51,1.38,0xc4bd9d);m.box(0,.9,.5,1.55,.10,1.42,0xf0e2c5);m.box(0,.59,-.21,.94,.18,.03,0x476771);
 m.pole([0,.34,-.35],[0,6.3,-.35],.056,.032,0x826d50);
 m.pole([0,1.31,-.35],[.59,1.3,1.91],.046,.039,0x8a7559);
 const top=[0,6.15,-.35],foot=[.07,1.4,-.34],corner=[.59,1.4,1.84],belly=[.53,3.13,.42];
 m.tri(top,foot,belly,0xf3e7cb);m.tri(foot,corner,belly,0xe4d4b7);m.tri(corner,top,belly,0xf4e7cb);
 m.tri([0,5.47,-.4],[0,.7,-2.63],[.35,1.38,-.81],color);
 for(const k of [-1,1])m.pole([0,6.14,-.35],[k*.84,.51,.2],.012,.012,0x8a8779,3);
 m.pole([0,6.18,-.35],[0,.57,-2.73],.014,.014,0x7f8174,3);
 m.quad([0,6.30,-.34],[.04,6.31,.11],[.04,6.18,.11],[0,6.17,-.34],0xefeadc);
 m.quad([0,6.17,-.34],[.04,6.18,.11],[.04,6.05,.11],[0,6.04,-.34],0xa4423c);
}
const anglerPoses=new Map();
function angler(m,x,y,z,a,coat,walk,bend,seated,rod=true){
 const distant=Math.hypot(me.x-x,me.z-z)>18,leg=Math.round(Math.sin(walk)*6),arm=Math.round(bend*16),key=[coat,leg,arm,seated,rod,distant].join("/");
 let model=anglerPoses.get(key);
 if(!model){
  model=new Geometry();model.distant=distant;model.tip=makeAngler(model,0,0,0,0,coat,Math.asin(leg/6),arm/16,seated,rod);
  model.data=new Float32Array(model.data);
  if(anglerPoses.size>=80)anglerPoses.delete(anglerPoses.keys().next().value);
  anglerPoses.set(key,model);
 }
 m.instance(model,x,y,z,a);m.at(x,y,z,a);return m.point(model.tip);
}
function makeAngler(m,x,y,z,a,coat,walk,bend,seated,rod=true){
 m.at(x,y,z,a);const pelvis=seated?.62:.98,shirt=pelvis+.04,sway=.045*Math.sin(walk);
 const style=[0x8d674e,0x65777d,0x8a814e,0x806844,0x687779].indexOf(coat)+1;
 const boot=0x423e33,pants=0x545840,skin=skinTones[style];
 m.oval(0,pelvis+.005,.008,.242,.143,.154,pants,10);
 for(const k of [-1,1]){
   const hip=[k*.145,pelvis,0],knee=[k*.16,seated?.48:.53,seated?-.37:k*sway*3],foot=[k*.17,.17,seated?-.34:-k*sway*4];
   m.pole(hip,knee,.121,.095,pants,8);m.pole(knee,foot,.097,.079,pants,8);
   m.pole([foot[0],.10,foot[2]],[lerp(foot[0],knee[0],.40),.31,lerp(foot[2],knee[2],.40)],.084,.096,boot,8);
   m.oval(foot[0],.095,foot[2]-.047,.092,.088,.159,boot);
 }
 personJacket(m,shirt,coat,.253,true);personHead(m,shirt,style,[0x534637,0x785b46,0x756f60][style%3],true);
 m.oval(0,shirt+.21,.135,.162,.137,.052,0x777456,8);m.box(0,shirt+.24,.17,.266,.052,.028,0x65614a);
 for(const k of [-1,1])m.pole([k*.13,shirt+.08,.12],[k*.18,shirt+.42,.11],.017,.023,0x71694f,5);
 const hand=[.27,shirt+.19+bend*.16,-.43],grip=[.13,shirt+.16+bend*.16,-.48];
 for(const k of [-1,1]){
   const shoulder=[k*.229,shirt+.384,.01],elbow=[k*.305,shirt+.142,rod?-.13:sway*k],end=rod?(k>0?hand:grip):[k*.271,shirt-.08,sway*k*2-.04];
   m.oval(...shoulder,.087,.084,.086,coat,7);m.pole(shoulder,elbow,.092,.077,coat,8);m.pole(elbow,end,.078,.053,coat,8);m.oval(...end,.058,.063,.063,skin,6);
 }
 const tip=[.47,shirt+.86+bend*1.3,-3.15+bend*.48];
 if(rod){
   const mid=[.36,shirt+.55+bend*.73,-1.88];
   m.pole([.24,hand[1]-.07,-.17],hand,.045,.037,0xb89866);
   m.pole(hand,mid,.031,.022,0x4a4436);m.pole(mid,tip,.023,.009,0x4c4636);
   m.oval(.28,hand[1]-.098,-.42,.073,.071,.07,0x555950);
 }
 return m.point(tip);
}
