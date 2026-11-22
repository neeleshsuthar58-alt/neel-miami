import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// NEEL – MIAMI UNDERWORLD v0.2. Mobile browser build.
const scene=new THREE.Scene();scene.background=new THREE.Color(0x83c6df);scene.fog=new THREE.Fog(0x83c6df,75,270);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,600);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xdaf3ff,0x6d5944,2.0));const sun=new THREE.DirectionalLight(0xffe0b3,2.0);sun.position.set(-40,80,35);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const M=(c,r=.85)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,600),M(0x93a77d));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
function cube(w,h,d,mat,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o}
const road=M(0x303943),line=M(0xe8dfc3),side=M(0xc8bda7);
cube(24,.09,360,road,0,.04,0);cube(360,.09,24,road,0,.05,0);
for(let n=-160;n<=160;n+=18){cube(.16,.025,5,line,0,.1,n);cube(5,.025,.16,line,n,.1,0)}
// City grid, different building silhouettes and shop-front colors.
const facade=[0xe7d6bd,0xc6d9df,0xd6b5a0,0xa6bdc5,0xf0e4d2,0xb9c3b9,0xe1c6a7];
for(let ix=-6;ix<=6;ix++)for(let iz=-6;iz<=6;iz++){if(Math.abs(ix)<=1||Math.abs(iz)<=1)continue;let x=ix*25+(Math.random()-.5)*4,z=iz*25+(Math.random()-.5)*4,w=10+Math.random()*7,d=10+Math.random()*7,h=9+Math.random()*42;cube(w,h,d,M(facade[Math.floor(Math.random()*facade.length)]),x,h/2,z);if(Math.random()>.55){cube(w*.65,.7,d*.65,M(0x637984),x,h+.35,z)}}
// Beachfront, ocean, promenade.
const ocean=new THREE.Mesh(new THREE.PlaneGeometry(125,560),M(0x22a9c3,.28));ocean.rotation.x=-Math.PI/2;ocean.position.set(175,.02,0);scene.add(ocean);cube(17,.1,560,side,95,.05,0);
function palm(x,z){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.2,.32,6,7),M(0x805331));trunk.position.set(x,3,z);scene.add(trunk);for(let i=0;i<7;i++){let leaf=new THREE.Mesh(new THREE.ConeGeometry(.55,4.5,5),M(0x287b48));leaf.position.set(x+Math.cos(i*Math.PI/3.5)*1.7,6,z+Math.sin(i*Math.PI/3.5)*1.7);leaf.rotation.z=Math.PI/2;scene.add(leaf)}}
for(let z=-160;z<=160;z+=17){palm(85,z);palm(-18,z+5);}
// Simple shop signs using canvas textures.
function sign(text,x,z,color='#143a50'){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,512,128);ctx.fillStyle='white';ctx.font='bold 58px Arial';ctx.textAlign='center';ctx.fillText(text,256,82);const tex=new THREE.CanvasTexture(c);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(8,2),new THREE.MeshBasicMaterial({map:tex}));mesh.position.set(x,4,z);scene.add(mesh)}
sign('OCEAN MARKET',-38,-22);sign('MIAMI MOTORS',39,22,'#8b352b');sign('SUNSET CAFE',-40,38,'#285c42');
// Character placeholders, with articulated-ish limbs.
function person(shirt,pants=0x202938){const g=new THREE.Group();const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.43,.82,4,8),M(shirt));torso.position.y=1.2;torso.castShadow=true;g.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.31,12,10),M(0xc58e69));head.position.y=2.05;g.add(head);for(const s of [-1,1]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.23,.72,.27),M(pants));leg.position.set(s*.18,.42,0);g.add(leg);const arm=new THREE.Mesh(new THREE.BoxGeometry(.18,.7,.2),M(shirt));arm.position.set(s*.52,1.25,0);g.add(arm)}return g}
const neel=person(0x1d344f);neel.position.set(0,0,6);scene.add(neel);
const jason=person(0x9b5932);jason.position.set(-4,0,2);scene.add(jason);
const pedestrians=[];for(let i=0;i<9;i++){let p=person([0x497b85,0x8a6546,0x5c587f,0x9d4f4b][i%4]);p.scale.setScalar(.82);p.position.set((Math.random()-.5)*95,0,(Math.random()-.5)*95);pedestrians.push({mesh:p,phase:Math.random()*6,speed:.6+Math.random()*.5});scene.add(p)}
// Vehicle with wheels and steering.
const car=new THREE.Group(),carBody=new THREE.Mesh(new THREE.BoxGeometry(2.25,.72,4.25),M(0xd33d35,.38));carBody.position.y=.78;carBody.castShadow=true;car.add(carBody);const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.72,.78,2.05),M(0x91bdca,.25));cabin.position.set(0,1.48,-.22);car.add(cabin);const wheels=[];for(const x of [-1.12,1.12])for(const z of [-1.38,1.38]){let w=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.22,14),M(0x17191c));w.rotation.z=Math.PI/2;w.position.set(x,.42,z);car.add(w);wheels.push(w)}car.position.set(8,0,10);scene.add(car);
// Patrol car and police officer.
const policeCar=new THREE.Group();const pc= new THREE.Mesh(new THREE.BoxGeometry(2.2,.7,4),M(0xeeeeea));pc.position.y=.75;policeCar.add(pc);const roof=new THREE.Mesh(new THREE.BoxGeometry(.7,.16,.3),M(0x2355c9));roof.position.set(0,1.2,0);policeCar.add(roof);policeCar.position.set(-65,0,-65);scene.add(policeCar);
let cash=500,wanted=0,inCar=false,speed=0,cameraMode=0,missionIndex=0,missionStage=0,phoneOpen=false,joy={x:0,y:0},targetYaw=0;
const missions=[{name:'Meet Jason',hint:'Find Jason near the red car.',goal:'Talk to Jason near the red car.'},{name:'A quick ride',hint:'Get into the red car and drive to the Ocean Market.',goal:'Drive close to the Ocean Market.'},{name:'A strange message',hint:'Return to Jason. He has something to tell you.',goal:'Meet Jason at the starting point.'}];
const $=id=>document.getElementById(id);function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('show'),2200)}
function updateHud(){$('cash').textContent='$ '+cash;$('mission').textContent='Mission '+Math.min(missionIndex+1,missions.length)+': '+(missions[missionIndex]?.name||'Free Roam');$('wanted').textContent='★'.repeat(wanted)+'☆'.repeat(5-wanted);$('hint').textContent=missions[missionIndex]?.hint||'Free roam: explore Miami.';$('speed').hidden=!inCar;$('speed').textContent=Math.round(Math.abs(speed)*5)+' km/h'}
function advanceMission(){missionIndex++;missionStage=0;if(missionIndex===1){cash+=150;toast('Mission complete! +$150')}else if(missionIndex===2){cash+=250;toast('Mission complete! +$250')}else toast('Story chapter complete! Free roam unlocked.');updateHud()}
const stick=$('stick'),knob=$('knob');let pointer=null;function setJoy(e){let r=stick.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),len=Math.hypot(dx,dy)||1,max=40;if(len>max){dx=dx/len*max;dy=dy/len*max}joy.x=dx/max;joy.y=dy/max;knob.style.transform=`translate(${dx}px,${dy}px)`}
stick.addEventListener('pointerdown',e=>{pointer=e.pointerId;stick.setPointerCapture(pointer);setJoy(e)});stick.addEventListener('pointermove',e=>{if(e.pointerId===pointer)setJoy(e)});function reset(){pointer=null;joy={x:0,y:0};knob.style.transform='translate(0,0)'}stick.addEventListener('pointerup',reset);stick.addEventListener('pointercancel',reset);
$('jump').onclick=()=>{if(!inCar){neel.position.y=.75;setTimeout(()=>neel.position.y=0,350)}};
$('action').onclick=()=>{if(inCar){inCar=false;neel.visible=true;neel.position.copy(car.position).add(new THREE.Vector3(2,0,0));speed=0;toast('Exited vehicle');return}let d=neel.position.distanceTo(car.position),jd=neel.position.distanceTo(jason.position);if(d<5){inCar=true;neel.visible=false;toast('Driving mode. Joystick steers and accelerates.')}else if(jd<5){toast('Jason: I got a weird message. We should check the phone.');if(missionIndex===0)advanceMission();else if(missionIndex===2)advanceMission()}else toast('Move closer to Jason or the red car.');};
$('camera').onclick=()=>{cameraMode=1-cameraMode;toast(cameraMode?'Close camera':'Third-person camera')};
function renderPhone(tab='contacts'){$('phoneContent').innerHTML='';const add=(html)=>{const d=document.createElement('div');d.className='phoneItem';d.innerHTML=html;$('phoneContent').appendChild(d)};if(tab==='contacts'){add('<strong>Jason</strong><br>Best friend · Available<br><button id="callJason">CALL JASON</button>');$('callJason').onclick=()=>toast('Jason: Hey Neel, I am right here.');add('<strong>Unknown Number</strong><br>No caller ID · 1 missed call');}if(tab==='gps'){add('<strong>GPS NAVIGATION</strong><br>Destination: Ocean Market<br>Current objective: '+(missions[missionIndex]?.goal||'Free roam'));add('Map marker: Ocean Market is near the central boulevard, west of the beach.');}if(tab==='missions'){missions.forEach((m,i)=>add('<strong>'+(i+1)+'. '+m.name+'</strong><br>'+m.goal+(i<missionIndex?'<br>STATUS: COMPLETE':i===missionIndex?'<br>STATUS: ACTIVE':'<br>STATUS: LOCKED')));}}
$('phone').onclick=()=>{$('phonePanel').hidden=false;phoneOpen=true;renderPhone()};$('closePhone').onclick=()=>{$('phonePanel').hidden=true;phoneOpen=false};document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>renderPhone(b.dataset.tab));
// Camera drag on empty screen for looking around.
let lastTouch=null;renderer.domElement.addEventListener('pointerdown',e=>{lastTouch={x:e.clientX,y:e.clientY}});renderer.domElement.addEventListener('pointerup',()=>lastTouch=null);renderer.domElement.addEventListener('pointermove',e=>{if(lastTouch){targetYaw-=(e.clientX-lastTouch.x)*.004;lastTouch={x:e.clientX,y:e.clientY}}});
const clock=new THREE.Clock();let policeTimer=0,calmTimer=0;
function clamp(v){return THREE.MathUtils.clamp(v,-165,165)}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);
if(inCar){speed+=(-joy.y*20-speed*1.7)*dt;speed=THREE.MathUtils.clamp(speed,-9,27);car.rotation.y-=joy.x*dt*1.25*(Math.abs(speed)/8+.2);car.position.x+=Math.sin(car.rotation.y)*speed*dt;car.position.z+=Math.cos(car.rotation.y)*speed*dt;car.position.x=clamp(car.position.x);car.position.z=clamp(car.position.z);wheels.forEach(w=>w.rotation.x+=speed*dt*1.7)}
else{let move=new THREE.Vector3(joy.x,0,-joy.y);if(move.length()>1)move.normalize();if(move.length()>.05){neel.position.x+=move.x*7*dt;neel.position.z+=move.z*7*dt;neel.rotation.y=Math.atan2(move.x,move.z)+Math.PI}}
const focus=inCar?car.position:neel.position;
// Jason follows, but stays a few metres away.
if(!inCar){let d=neel.position.clone().sub(jason.position),len=d.length();if(len>3){d.normalize();jason.position.add(d.multiplyScalar(Math.min(len-3,5*dt)));jason.rotation.y=Math.atan2(d.x,d.z)}}
pedestrians.forEach(p=>{p.phase+=dt*p.speed;p.mesh.position.x+=Math.sin(p.phase)*dt*.6;p.mesh.position.z+=Math.cos(p.phase)*dt*.6});
// Police investigation/pursuit responds to wanted stars.
policeTimer+=dt;if(wanted>0){const delta=focus.clone().sub(policeCar.position);if(delta.length()>5){delta.normalize();policeCar.position.add(delta.multiplyScalar((5+wanted*1.8)*dt));policeCar.lookAt(focus)}if(focus.distanceTo(policeCar.position)<7){toast('Police are close! Lose them to clear your wanted level.');calmTimer=0}}else{policeCar.position.x=-65+Math.sin(policeTimer*.12)*12;policeCar.position.z=-65+Math.cos(policeTimer*.12)*12}
if(missionIndex===1&&inCar&&car.position.distanceTo(new THREE.Vector3(-38,0,-22))<18)advanceMission();
if(missionIndex===2&&!inCar&&neel.position.distanceTo(new THREE.Vector3(0,0,6))<9&&neel.position.distanceTo(jason.position)<5){/* interact button completes */}
if(wanted>0){calmTimer+=dt;if(calmTimer>25){wanted=0;calmTimer=0;toast('You lost the police. Wanted level cleared.');updateHud()}}else calmTimer=0;
const angle=cameraMode?0:neel.rotation.y;const behind=new THREE.Vector3(0,cameraMode?3.1:6.4,cameraMode?6:10).applyAxisAngle(new THREE.Vector3(0,1,0),angle);const desired=focus.clone().add(behind);camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(focus.x,focus.y+1.35,focus.z);
renderer.render(scene,camera);
}
updateHud();renderPhone();animate();$('loading').style.display='none';toast('Welcome to Miami. Meet Jason and start your first mission.');
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
