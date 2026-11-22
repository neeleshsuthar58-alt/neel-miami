import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87c9e8);
scene.fog = new THREE.Fog(0x87c9e8, 70, 240);

const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
renderer.domElement.id = 'gameCanvas';

scene.add(new THREE.HemisphereLight(0xffffff, 0x526070, 2));
const sun = new THREE.DirectionalLight(0xffffff, 2.1);
sun.position.set(-35, 70, 35);
sun.castShadow = true;
scene.add(sun);

const mat = (color) => new THREE.MeshStandardMaterial({color, roughness:0.85});
const ground = new THREE.Mesh(new THREE.PlaneGeometry(260,260), mat(0x69a96c));
ground.rotation.x = -Math.PI/2; ground.position.y = -0.06; ground.receiveShadow = true; scene.add(ground);

const roadMat = mat(0x343a40);
function road(x,z,w,d){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,0.08,d),roadMat);
 m.position.set(x,0,z); scene.add(m);
}
road(0,0,220,13); road(0,-42,220,12); road(0,42,220,12);
road(-48,0,12,110); road(48,0,12,110);
const lineMat = new THREE.MeshBasicMaterial({color:0xf5e6a8});
for(let x=-100;x<105;x+=12){const l=new THREE.Mesh(new THREE.BoxGeometry(6,.025,.18),lineMat);l.position.set(x,.06,0);scene.add(l);}

function building(x,z,w,h,d,color){
 const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));
 b.position.set(x,h/2,z); b.castShadow=true;b.receiveShadow=true;scene.add(b);
 const winMat=new THREE.MeshStandardMaterial({color:0x9ed9e8,emissive:0x23495a});
 for(let y=2.5;y<h-1;y+=3) for(let xx=-w/2+1.3;xx<w/2-0.5;xx+=2.4){
  const win=new THREE.Mesh(new THREE.BoxGeometry(.9,1.1,.08),winMat);
  win.position.set(x+xx,y,z+d/2+.05);scene.add(win);
 }
}
const colors=[0xe7b77d,0xf0d2a2,0xd6a4a0,0xb7c7d8,0xe2dfc8];
for(let i=0;i<18;i++){
 const x=-95+(i%9)*24, z=i<9?-65:65;
 building(x,z,15,12+(i%4)*5,18,colors[i%colors.length]);
}
const ocean=new THREE.Mesh(new THREE.PlaneGeometry(260,80),mat(0x168fbd));
ocean.rotation.x=-Math.PI/2;ocean.position.set(0,-.02,-145);scene.add(ocean);
for(let i=0;i<18;i++){
 const x=-105+i*12;
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.35,4,7),mat(0x795334));
 trunk.position.set(x,2,-17-(i%3)*3);scene.add(trunk);
 const leaves=new THREE.Mesh(new THREE.SphereGeometry(2.1,8,6),mat(0x23834a));
 leaves.position.set(x,4.5,-17-(i%3)*3);leaves.scale.set(1.2,.55,1.2);scene.add(leaves);
}

function makePerson(color){
 const g=new THREE.Group();
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.9,4,8),mat(color));body.position.y=1.05;body.castShadow=true;g.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.32,12,10),mat(0xd7a77d));head.position.y=1.95;g.add(head);
 return g;
}
const player=makePerson(0x2457bd);player.position.set(-12,0,8);scene.add(player);
const jason=makePerson(0x30343b);jason.position.set(12,0,5);scene.add(jason);

const car=new THREE.Group();
const carBody=new THREE.Mesh(new THREE.BoxGeometry(3.4,1,6),mat(0xc82032));carBody.position.y=.85;carBody.castShadow=true;car.add(carBody);
const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.6,.9,2.8),mat(0x9dc8d8));cabin.position.set(0,1.55,-.3);car.add(cabin);
for(const x of [-1.35,1.35]) for(const z of [-1.9,1.9]){
 const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,.32,12),mat(0x151515));
 wheel.rotation.z=Math.PI/2;wheel.position.set(x,.48,z);car.add(wheel);
}
car.position.set(5,0,0);scene.add(car);

let keys={}, driving=false, speed=0, yaw=0, cameraMode=0, cash=500;
addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
const buttons=['jump','action','phone','camera'];
for(const id of buttons){document.getElementById(id).addEventListener('click',()=>handleButton(id));}
function handleButton(id){
 if(id==='phone') document.getElementById('phonePanel').classList.toggle('hidden');
 if(id==='closePhone') document.getElementById('phonePanel').classList.add('hidden');
 if(id==='camera') cameraMode=(cameraMode+1)%2;
 if(id==='jump' && !driving) player.position.y=1.3;
 if(id==='action'){
  const dist=player.position.distanceTo(car.position);
  if(!driving && dist<5){driving=true;document.getElementById('message').textContent='You entered the red car. Use the joystick or arrow keys to drive.';}
  else if(driving){driving=false;player.position.copy(car.position).add(new THREE.Vector3(3,0,0));document.getElementById('message').textContent='You exited the car.';}
  else if(player.position.distanceTo(jason.position)<5){document.getElementById('message').textContent='Jason: Neel, we need to explore the city.';document.getElementById('cash').textContent=cash;}
 }
}
document.getElementById('closePhone').addEventListener('click',()=>document.getElementById('phonePanel').classList.add('hidden'));

let joy={x:0,y:0};
const joyEl=document.createElement('div');joyEl.id='joystick';joyEl.innerHTML='<div></div>';document.body.appendChild(joyEl);
let active=false;
joyEl.addEventListener('pointerdown',e=>{active=true;joyEl.setPointerCapture(e.pointerId);moveJoy(e);});
joyEl.addEventListener('pointermove',e=>{if(active)moveJoy(e);});
joyEl.addEventListener('pointerup',()=>{active=false;joy.x=0;joy.y=0;joyEl.firstElementChild.style.transform='translate(0,0)';});
function moveJoy(e){const r=joyEl.getBoundingClientRect();const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);const len=Math.max(1,Math.hypot(dx,dy));joy.x=dx/Math.max(55,len);joy.y=dy/Math.max(55,len);joyEl.firstElementChild.style.transform=`translate(${joy.x*32}px,${joy.y*32}px)`;}

const clock=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.04);
 let forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0)-joy.y;
 let turn=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joy.x;
 if(driving){
  yaw-=turn*dt*1.8;car.rotation.y=yaw;
  speed=THREE.MathUtils.damp(speed,forward*18,3,dt);
  car.position.x+=Math.sin(yaw)*speed*dt;car.position.z+=Math.cos(yaw)*speed*dt;
  player.position.copy(car.position);
  document.getElementById('speed').textContent=Math.round(Math.abs(speed)*3)+' km/h';
 }else{
  player.rotation.y=Math.atan2(turn,forward||.0001);
  player.position.x+=turn*dt*5;
  player.position.z+=forward*dt*7;
  player.position.y=Math.max(0,player.position.y-dt*3);
  speed=0;document.getElementById('speed').textContent='0 km/h';
 }
 if(jason.position.distanceTo(player.position)>4){
  const dir=player.position.clone().sub(jason.position).normalize();
  jason.position.add(dir.multiplyScalar(dt*2.3));
  jason.rotation.y=Math.atan2(dir.x,dir.z);
 }
 const target=driving?car:player;
 if(cameraMode===0){
  const offset=new THREE.Vector3(0,8,13).applyAxisAngle(new THREE.Vector3(0,1,0),target.rotation.y);
  camera.position.lerp(target.position.clone().add(offset),.12);
  camera.lookAt(target.position.clone().add(new THREE.Vector3(0,1,0)));
 }else{
  camera.position.lerp(target.position.clone().add(new THREE.Vector3(0,2,0)),.18);
  camera.rotation.set(0,target.rotation.y,0);
 }
 renderer.render(scene,camera);
}
animate();
document.getElementById('loading').style.display='none';
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
