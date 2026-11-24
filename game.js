import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const loading = document.getElementById('loading');
const errorBox = document.getElementById('errorBox');
function showError(error) {
  if (loading) loading.classList.add('hidden');
  if (errorBox) {
    errorBox.classList.remove('hidden');
    errorBox.textContent = 'GAME START ERROR\n' + (error?.message || String(error)) +
      '\n\nCheck your internet connection, then reload the page.';
  }
  console.error(error);
}
window.addEventListener('error', e => showError(e.error || e.message));
window.addEventListener('unhandledrejection', e => showError(e.reason));

try {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x86c9e8);
  scene.fog = new THREE.Fog(0x86c9e8, 170, 650);

  const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.domElement.id = 'gameCanvas';
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x58606a, 2));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(-70, 110, 60);
  sun.castShadow = true;
  scene.add(sun);

  const mat = color => new THREE.MeshStandardMaterial({ color, roughness: 0.82 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), mat(0x75a96c));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.08;
  ground.receiveShadow = true;
  scene.add(ground);

  const roadMat = mat(0x343a40), lineMat = mat(0xf5e6a8);
  function road(x,z,w,d) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,.08,d),roadMat);
    m.position.set(x,0,z); scene.add(m);
  }
  for(let z=-320;z<=320;z+=80) road(0,z,760,14);
  for(let x=-360;x<=360;x+=80) road(x,0,14,680);
  for(let z=-320;z<=320;z+=80) for(let x=-360;x<=360;x+=18) {
    const m=new THREE.Mesh(new THREE.BoxGeometry(7,.025,.18),lineMat);
    m.position.set(x,.055,z); scene.add(m);
  }

  const buildingColors=[0xe6b77e,0xf0d2a2,0xd6a4a0,0xb7c7d8,0xe2dfc8,0xc5d6b5,0xd9c0e8];
  for(let z=-285;z<=285;z+=80) for(let x=-325;x<=325;x+=80) {
    if(Math.abs(x)<55&&Math.abs(z)<55) continue;
    const h=15+(Math.abs(x*3+z*7)%5)*5;
    const b=new THREE.Mesh(new THREE.BoxGeometry(43,h,48),mat(buildingColors[Math.abs(Math.floor(x+z))%buildingColors.length]));
    b.position.set(x,h/2,z); b.castShadow=true; b.receiveShadow=true; scene.add(b);
  }

  const beach=new THREE.Mesh(new THREE.PlaneGeometry(760,60),mat(0xe7d49c));
  beach.rotation.x=-Math.PI/2; beach.position.set(0,-.025,-365); scene.add(beach);
  const ocean=new THREE.Mesh(new THREE.PlaneGeometry(760,230),mat(0x168fbd));
  ocean.rotation.x=-Math.PI/2; ocean.position.set(0,-.03,-510); scene.add(ocean);

  for(let i=0;i<48;i++){
    const x=-330+i*14, z=-330-(i%3)*7;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.34,4.4,7),mat(0x795334));
    trunk.position.set(x,2.2,z); scene.add(trunk);
    const leaves=new THREE.Mesh(new THREE.SphereGeometry(2.2,8,6),mat(0x23834a));
    leaves.position.set(x,4.8,z); leaves.scale.set(1.2,.55,1.2); scene.add(leaves);
  }

  function character(shirtColor,pantsColor,hairColor){
    const g=new THREE.Group(), skin=mat(0xc98f68), shirt=mat(shirtColor), pants=mat(pantsColor), hair=mat(hairColor), shoe=mat(0x202329);
    function add(geo,m,x,y,z){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o;}
    add(new THREE.BoxGeometry(.95,1.05,.48),shirt,0,1.55,0);
    add(new THREE.CylinderGeometry(.16,.17,.22,8),skin,0,2.18,0);
    add(new THREE.SphereGeometry(.38,16,12),skin,0,2.52,0);
    add(new THREE.SphereGeometry(.39,12,8,0,Math.PI*2,0,Math.PI*.52),hair,0,2.62,-.015);
    for(const x of [-.14,.14]){
      add(new THREE.SphereGeometry(.045,8,6),mat(0xffffff),x,2.55,-.342);
      add(new THREE.SphereGeometry(.022,8,6),mat(0x171717),x,2.55,-.38);
    }
    add(new THREE.SphereGeometry(.055,8,6),skin,0,2.44,-.37);
    add(new THREE.BoxGeometry(.13,.025,.025),mat(0x713f36),0,2.34,-.36);
    const arms=[],legs=[];
    for(const s of [-1,1]){
      const arm=new THREE.Group(); arm.position.set(s*.59,1.88,0);
      const upper=new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,.65,8),shirt); upper.position.y=-.28; arm.add(upper);
      const fore=new THREE.Mesh(new THREE.CylinderGeometry(.105,.12,.55,8),skin); fore.position.y=-.83; arm.add(fore);
      const hand=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),skin); hand.position.y=-1.13; arm.add(hand); g.add(arm); arms.push(arm);
      const leg=new THREE.Group(); leg.position.set(s*.25,1.02,0);
      const thigh=new THREE.Mesh(new THREE.CylinderGeometry(.17,.19,.62,8),pants); thigh.position.y=-.28; leg.add(thigh);
      const shin=new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,.55,8),pants); shin.position.y=-.83; leg.add(shin);
      const foot=new THREE.Mesh(new THREE.BoxGeometry(.25,.16,.42),shoe); foot.position.set(0,-1.15,-.1); leg.add(foot); g.add(leg); legs.push(leg);
    }
    g.userData={arms,legs}; return g;
  }

  const player=character(0x2457bd,0x252b36,0x24201d); player.position.set(-15,0,18); scene.add(player);
  const jason=character(0x30343b,0x414b5b,0x171717); jason.position.set(13,0,10); scene.add(jason);

  const car=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(3.8,1.05,7),mat(0xc82032)); body.position.y=.9; car.add(body);
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(3,1,3.3),new THREE.MeshStandardMaterial({color:0x8fc7d8,transparent:true,opacity:.48,roughness:.25})); cabin.position.set(0,1.62,-.35); car.add(cabin);
  for(const x of [-1.5,1.5]) for(const z of [-2.25,2.25]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,.36,14),mat(0x151515)); wheel.rotation.z=Math.PI/2; wheel.position.set(x,.48,z); car.add(wheel);
  }
  for(const x of [-.72,.72]){
    const seat=new THREE.Mesh(new THREE.BoxGeometry(.85,.55,.9),mat(0x252a32)); seat.position.set(x,1.15,.1); car.add(seat);
  }
  car.position.set(5,0,0); scene.add(car);

  const phone=new THREE.Group();
  const phoneBody=new THREE.Mesh(new THREE.BoxGeometry(.22,.38,.045),mat(0x111820));
  const phoneScreen=new THREE.Mesh(new THREE.BoxGeometry(.18,.31,.012),mat(0x3c9bd0));
  phone.add(phoneBody,phoneScreen); phoneScreen.position.z=-.03;
  phone.position.set(.7,1.85,-.28); phone.rotation.x=-.25; player.add(phone); phone.visible=false;

  const $=id=>document.getElementById(id);
  const keys={}; let driving=false,phoneOpen=false,speed=0,yaw=0,cameraMode=0,jasonInCar=false;
  addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);
  addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
  function message(t){$('message').textContent=t;}

  function action(id){
    if(id==='phone'){phoneOpen=!phoneOpen;phone.visible=phoneOpen&&!driving;$('phonePanel').classList.toggle('hidden',!phoneOpen);}
    if(id==='closePhone'){phoneOpen=false;phone.visible=false;$('phonePanel').classList.add('hidden');}
    if(id==='camera') cameraMode=(cameraMode+1)%2;
    if(id==='jump'&&!driving) player.position.y=1.2;
    if(id==='action'){
      if(!driving&&player.position.distanceTo(car.position)<7){
        driving=true;phone.visible=false;phoneOpen=false;$('phonePanel').classList.add('hidden');
        jasonInCar=true;jason.visible=true;message('Neel is driving. Jason takes the passenger seat.');
      }else if(driving){
        driving=false;player.position.copy(car.position).add(new THREE.Vector3(3.2,0,0));
        if(jasonInCar){jason.position.copy(car.position).add(new THREE.Vector3(-.8,0,-.2));jason.position.y=0;jason.visible=true;jasonInCar=false;}
        message('You exited the car. Jason got out too.');
      }else if(player.position.distanceTo(jason.position)<7) message('Jason: Come on, Neel. Let us explore Miami.');
      else message('Move closer to Jason or the red car.');
    }
  }
  for(const id of ['jump','action','phone','camera','closePhone']) $(id).addEventListener('click',()=>action(id));

  const joy={x:0,y:0},joyEl=document.createElement('div'); joyEl.id='joystick';joyEl.innerHTML='<div></div>';document.body.appendChild(joyEl);
  let active=false;
  function moveJoy(e){const r=joyEl.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,len=Math.max(1,Math.hypot(dx,dy));joy.x=dx/Math.max(55,len);joy.y=dy/Math.max(55,len);joyEl.firstElementChild.style.transform=`translate(${joy.x*32}px,${joy.y*32}px)`;}
  function release(){active=false;joy.x=0;joy.y=0;joyEl.firstElementChild.style.transform='translate(0,0)';}
  joyEl.addEventListener('pointerdown',e=>{active=true;joyEl.setPointerCapture(e.pointerId);moveJoy(e);});
  joyEl.addEventListener('pointermove',e=>{if(active)moveJoy(e);});
  joyEl.addEventListener('pointerup',release);joyEl.addEventListener('pointercancel',release);

  const map=$('minimap'),ctx=map.getContext('2d');
  function drawMap(){
    const w=map.width,h=map.height,cx=w/2,cy=h/2,scale=.19;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#172532';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#647786';ctx.lineWidth=5;
    for(let v=-300;v<=300;v+=80){ctx.beginPath();ctx.moveTo(cx+v*scale,0);ctx.lineTo(cx+v*scale,h);ctx.stroke();ctx.beginPath();ctx.moveTo(0,cy+v*scale);ctx.lineTo(w,cy+v*scale);ctx.stroke();}
    function dot(o,c,r){const x=cx+(o.position.x-player.position.x)*scale,y=cy+(o.position.z-player.position.z)*scale;ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
    dot(car,'#ef4444',5);if(!jasonInCar)dot(jason,'#facc15',4);ctx.fillStyle='#4ade80';ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);ctx.fill();
  }

  const clock=new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const dt=Math.min(clock.getDelta(),.04);
    const forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0)-joy.y;
    const turn=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joy.x;
    if(driving){
      yaw-=turn*dt*1.6;car.rotation.y=yaw;
      speed=THREE.MathUtils.damp(speed,forward*22,2.8,dt);
      car.position.x+=Math.sin(yaw)*speed*dt;car.position.z+=Math.cos(yaw)*speed*dt;
      player.position.copy(car.position);
      if(jasonInCar){jason.position.copy(car.position);jason.position.y=.55;jason.rotation.y=yaw;}
      $('speed').textContent=Math.round(Math.abs(speed)*3)+' km/h';
    }else{
      const moving=Math.abs(forward)+Math.abs(turn)>.05;
      if(moving){const angle=Math.atan2(turn,forward||.0001);player.rotation.y=angle;player.position.x+=Math.sin(angle)*Math.abs(forward)*dt*7+turn*dt*2;player.position.z+=Math.cos(angle)*Math.abs(forward)*dt*7;}
      player.position.y=Math.max(0,player.position.y-dt*3);$('speed').textContent='0 km/h';if(phoneOpen)phone.visible=true;
    }
    if(!jasonInCar){const d=jason.position.distanceTo(player.position);if(d>3.2){const dir=player.position.clone().sub(jason.position).normalize();jason.position.add(dir.multiplyScalar(dt*2.4));jason.rotation.y=Math.atan2(dir.x,dir.z);}}
    const target=driving?car:player;
    const offset=(cameraMode===0?new THREE.Vector3(0,8,14):new THREE.Vector3(0,2.4,-.1)).applyAxisAngle(new THREE.Vector3(0,1,0),target.rotation.y);
    camera.position.lerp(target.position.clone().add(offset),cameraMode===0?.12:.18);
    camera.lookAt(target.position.clone().add(new THREE.Vector3(0,cameraMode===0?1.2:1.8,0)));
    drawMap();renderer.render(scene,camera);
  }
  animate();
  loading.classList.add('hidden');
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
} catch (error) {
  showError(error);
}
