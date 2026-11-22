import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87c9df);
scene.fog = new THREE.Fog(0x87c9df, 55, 230);
const camera = new THREE.PerspectiveCamera(65, innerWidth/innerHeight, .1, 500);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xc8edff,0x6b5947,2.0));
const sun = new THREE.DirectionalLight(0xffe0ad,2.2);
sun.position.set(-35,65,25); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); scene.add(sun);

const mat=(color,roughness=.85)=>new THREE.MeshStandardMaterial({color,roughness});
const groundMat=mat(0x9baf82), roadMat=mat(0x303943), sidewalkMat=mat(0xbab8aa);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(500,500),groundMat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);

function box(w,h,d,m,x,y,z,shadow=true){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;scene.add(o);return o;}
// Roads, sidewalks and lane markings
box(22,.08,300,roadMat,0,.04,0,false);box(300,.08,22,roadMat,0,.045,0,false);
for(let z=-135;z<=135;z+=18){box(.18,.025,5,mat(0xe9e5ca),0,.1,z,false)}
for(let x=-135;x<=135;x+=18){box(5,.025,.18,mat(0xe9e5ca),x,.1,0,false)}
// City blocks with varied heights and windows
const buildingColors=[0xe8d8bd,0xd1dce0,0xd6b8a0,0x9db7c2,0xe8e2d5,0xc5c6c1];
for(let ix=-5;ix<=5;ix++) for(let iz=-5;iz<=5;iz++){
 if(Math.abs(ix)<=1||Math.abs(iz)<=1) continue;
 const x=ix*25+(Math.random()-.5)*3,z=iz*25+(Math.random()-.5)*3;
 const w=10+Math.random()*7,d=10+Math.random()*7,h=8+Math.random()*35;
 const b=box(w,h,d,mat(buildingColors[Math.floor(Math.random()*buildingColors.length)]),x,h/2,z);
 // simple rooftop detail
 if(h>25) box(w*.55,1,d*.55,mat(0x697b84),x,h+.5,z);
}
// Beach + water strip to the east
const water=new THREE.Mesh(new THREE.PlaneGeometry(110,500),new THREE.MeshStandardMaterial({color:0x27a9c3,roughness:.25,metalness:.1}));
water.rotation.x=-Math.PI/2;water.position.set(145,.015,0);scene.add(water);
box(15,.12,500,mat(0xe4d0a0),78,.04,0,false);
// Palm trees
function palm(x,z){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.38,6,7),mat(0x805331));trunk.position.set(x,3,z);trunk.castShadow=true;scene.add(trunk);for(let i=0;i<7;i++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(.55,5,5),mat(0x287b48));leaf.position.set(x+Math.cos(i*Math.PI*2/7)*1.8,6.1,z+Math.sin(i*Math.PI*2/7)*1.8);leaf.rotation.z=Math.PI/2;leaf.rotation.y=-i*Math.PI*2/7;scene.add(leaf)}}
for(let z=-135;z<=135;z+=18){palm(69,z);palm(-17,z+7)}
// Character builder: stylized capsule body with head and limbs
function person(color){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.9,4,8),mat(color));body.position.y=1.15;body.castShadow=true;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),mat(0xc58f68));head.position.y=2.05;head.castShadow=true;g.add(head);const legmat=mat(0x252b35);for(const s of [-1,1]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.25,.72,.3),legmat);leg.position.set(s*.2,.42,0);g.add(leg)}return g}
const neel=person(0x1d344f);neel.position.set(0,0,5);scene.add(neel);
const jason=person(0x9b5932);jason.position.set(-4,0,2);scene.add(jason);
// Car
const car=new THREE.Group();const chassis=new THREE.Mesh(new THREE.BoxGeometry(2.2,.7,4.2),mat(0xd33d35));chassis.position.y=.75;chassis.castShadow=true;car.add(chassis);
const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.7,.75,2),mat(0x8eb9c7,.35));cabin.position.set(0,1.42,-.25);car.add(cabin);
for(const x of [-1,1])for(const z of [-1.35,1.35]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.22,12),mat(0x17191c));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.42,z);car.add(wheel)}
car.position.set(7,0,9);scene.add(car);

let moving=false, inCar=false, speed=0, yaw=0, cameraMode=0;
let joy={x:0,y:0}; const stick=document.getElementById('stick'),knob=document.getElementById('knob');
let activePointer=null;
function setJoy(e){const r=stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const max=40,l=Math.hypot(dx,dy)||1;if(l>max){dx=dx/l*max;dy=dy/l*max}joy.x=dx/max;joy.y=dy/max;knob.style.transform=`translate(${dx}px,${dy}px)`}
stick.addEventListener('pointerdown',e=>{activePointer=e.pointerId;stick.setPointerCapture(e.pointerId);setJoy(e)});
stick.addEventListener('pointermove',e=>{if(e.pointerId===activePointer)setJoy(e)});
function resetJoy(){activePointer=null;joy={x:0,y:0};knob.style.transform='translate(0,0)'}
stick.addEventListener('pointerup',resetJoy);stick.addEventListener('pointercancel',resetJoy);
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1900)}
document.getElementById('jump').onclick=()=>{if(!inCar){neel.position.y=.8;setTimeout(()=>neel.position.y=0,380)}};
document.getElementById('action').onclick=()=>{
 if(inCar){inCar=false;neel.visible=true;neel.position.copy(car.position).add(new THREE.Vector3(2,0,0));toast('You exited the car');return}
 const d=neel.position.distanceTo(car.position);
 if(d<5){inCar=true;neel.visible=false;toast('Driving mode: use the joystick');return}
 if(neel.position.distanceTo(jason.position)<5)toast('Jason: Miami looks quiet... too quiet.');
 else toast('Nothing to interact with nearby.');
};
document.getElementById('camera').onclick=()=>{cameraMode=(cameraMode+1)%2;toast(cameraMode?'Close camera':'Third-person camera')};
function clampCity(v){return THREE.MathUtils.clamp(v,-145,145)}
const clock=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);
 if(inCar){
   speed += (-joy.y*18-speed*2.2)*dt; speed=THREE.MathUtils.clamp(speed,-8,22);
   car.rotation.y -= joy.x*dt*1.35*(Math.abs(speed)/8+.2);
   car.position.x+=Math.sin(car.rotation.y)*speed*dt;car.position.z+=Math.cos(car.rotation.y)*speed*dt;
   car.position.x=clampCity(car.position.x);car.position.z=clampCity(car.position.z);
 }else{
   const forward=new THREE.Vector3(0,0,-joy.y);const right=new THREE.Vector3(joy.x,0,0);
   const dir=forward.add(right);if(dir.length()>1)dir.normalize();
   if(dir.length()>.05){neel.position.x+=dir.x*7*dt;neel.position.z+=dir.z*7*dt;neel.rotation.y=Math.atan2(dir.x,dir.z)+Math.PI;}
   neel.position.x=clampCity(neel.position.x);neel.position.z=clampCity(neel.position.z);
 }
 // Jason follows Neel/car at a comfortable distance
 const target=inCar?car.position:neel.position;
 if(!inCar){const delta=target.clone().sub(jason.position);const dist=delta.length();if(dist>3.2){delta.normalize();jason.position.add(delta.multiplyScalar(Math.min(dist-3.2,4.5*dt)));jason.rotation.y=Math.atan2(delta.x,delta.z)}}
 const focus=inCar?car.position:neel.position;
 const behind=new THREE.Vector3(0, cameraMode?3.2:6.5, cameraMode?7:11).applyAxisAngle(new THREE.Vector3(0,1,0),inCar?car.rotation.y:neel.rotation.y);
 const desired=focus.clone().add(behind);camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(focus.x,focus.y+1.4,focus.z);
 renderer.render(scene,camera);
}
animate();
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
document.getElementById('loading').style.display='none';
toast('Welcome to Miami. Find Jason and the red car.');
