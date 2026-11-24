import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $ = id => document.getElementById(id);
const loading = $('loading'), errorBox = $('errorBox');
function showError(err){
  loading?.classList.add('hidden');
  errorBox?.classList.remove('hidden');
  if(errorBox) errorBox.textContent = 'GAME START ERROR\n' + (err?.message || String(err)) + '\n\nCheck your internet connection and reload.';
  console.error(err);
}
addEventListener('error', e => showError(e.error || e.message));
addEventListener('unhandledrejection', e => showError(e.reason));

try {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x86c9e8);
  scene.fog = new THREE.Fog(0x86c9e8, 180, 850);
  const camera = new THREE.PerspectiveCamera(65, innerWidth/innerHeight, .1, 1200);
  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.domElement.id = 'gameCanvas';
  document.body.insertBefore(renderer.domElement, document.body.firstChild);
  scene.add(new THREE.HemisphereLight(0xffffff,0x59616a,2));
  const sun = new THREE.DirectionalLight(0xffffff,2);
  sun.position.set(-80,120,70); sun.castShadow=true; scene.add(sun);
  const material = c => new THREE.MeshStandardMaterial({color:c,roughness:.82});
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1100,1100),material(0x75a96c));
  ground.rotation.x=-Math.PI/2; ground.position.y=-.08; ground.receiveShadow=true; scene.add(ground);

  const obstacles=[];
  function addObstacle(mesh, halfX, halfZ, x, z){
    mesh.position.set(x,mesh.position.y,z); mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
    obstacles.push({x,z,hx:halfX,hz:halfZ});
    return mesh;
  }
  const roadMat=material(0x343a40), lineMat=material(0xf5e6a8);
  for(let z=-360;z<=360;z+=80){
    const r=new THREE.Mesh(new THREE.BoxGeometry(820,.08,14),roadMat); r.position.set(0,0,z); scene.add(r);
  }
  for(let x=-400;x<=400;x+=80){
    const r=new THREE.Mesh(new THREE.BoxGeometry(14,.08,760),roadMat); r.position.set(x,0,0); scene.add(r);
  }
  for(let z=-360;z<=360;z+=80) for(let x=-390;x<=390;x+=20){
    const l=new THREE.Mesh(new THREE.BoxGeometry(7,.025,.18),lineMat); l.position.set(x,.055,z); scene.add(l);
  }
  const colors=[0xe6b77e,0xf0d2a2,0xd6a4a0,0xb7c7d8,0xe2dfc8,0xc5d6b5,0xd9c0e8];
  for(let z=-325;z<=325;z+=80) for(let x=-355;x<=355;x+=80){
    if(Math.abs(x)<55 && Math.abs(z)<55) continue;
    const h=18+(Math.abs(x*3+z*7)%5)*5;
    const b=new THREE.Mesh(new THREE.BoxGeometry(43,h,48),material(colors[Math.abs(Math.floor(x+z))%colors.length]));
    b.position.y=h/2; addObstacle(b,22,25,x,z);
    // simple windows
    for(let yy=4;yy<h-2;yy+=5){
      for(let xx of [-12,0,12]){
        const win=new THREE.Mesh(new THREE.BoxGeometry(4,2,.12),material(0x7bb6cc));
        win.position.set(x+xx,yy,z-24.1); scene.add(win);
      }
    }
  }
  const beach=new THREE.Mesh(new THREE.PlaneGeometry(820,70),material(0xe7d49c));
  beach.rotation.x=-Math.PI/2; beach.position.set(0,-.025,-410); scene.add(beach);
  const ocean=new THREE.Mesh(new THREE.PlaneGeometry(820,250),material(0x168fbd));
  ocean.rotation.x=-Math.PI/2; ocean.position.set(0,-.03,-570); scene.add(ocean);

  // Palms are solid obstacles at their trunks.
  for(let i=0;i<48;i++){
    const x=-330+i*14,z=-370-(i%3)*8;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.34,4.4,7),material(0x795334));
    trunk.position.set(x,2.2,z); scene.add(trunk);
    const leaves=new THREE.Mesh(new THREE.SphereGeometry(2.2,8,6),material(0x23834a));
    leaves.position.set(x,4.8,z); leaves.scale.set(1.2,.55,1.2); scene.add(leaves);
    obstacles.push({x,z,hx:.65,hz:.65});
  }

  function makePlayer(){
    const g=new THREE.Group(), skin=material(0xc98f68), shirt=material(0x2457bd), pants=material(0x252b36), hair=material(0x24201d), shoe=material(0x202329);
    function part(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;}
    part(new THREE.BoxGeometry(.95,1.05,.48),shirt,0,1.55,0);
    part(new THREE.CylinderGeometry(.16,.17,.22,8),skin,0,2.18,0);
    part(new THREE.SphereGeometry(.38,16,12),skin,0,2.52,0);
    part(new THREE.SphereGeometry(.39,12,8,0,Math.PI*2,0,Math.PI*.52),hair,0,2.62,-.015);
    for(const x of [-.14,.14]){
      part(new THREE.SphereGeometry(.045,8,6),material(0xffffff),x,2.55,-.342);
      part(new THREE.SphereGeometry(.022,8,6),material(0x171717),x,2.55,-.38);
    }
    const arms=[],legs=[];
    for(const s of [-1,1]){
      const arm=new THREE.Group(); arm.position.set(s*.59,1.88,0);
      const upper=new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,.65,8),shirt);upper.position.y=-.28;arm.add(upper);
      const fore=new THREE.Mesh(new THREE.CylinderGeometry(.105,.12,.55,8),skin);fore.position.y=-.83;arm.add(fore);
      const hand=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),skin);hand.position.y=-1.13;arm.add(hand);g.add(arm);arms.push(arm);
      const leg=new THREE.Group();leg.position.set(s*.25,1.02,0);
      const thigh=new THREE.Mesh(new THREE.CylinderGeometry(.17,.19,.62,8),pants);thigh.position.y=-.28;leg.add(thigh);
      const shin=new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,.55,8),pants);shin.position.y=-.83;leg.add(shin);
      const foot=new THREE.Mesh(new THREE.BoxGeometry(.25,.16,.42),shoe);foot.position.set(0,-1.15,-.1);leg.add(foot);g.add(leg);legs.push(leg);
    }
    g.userData={arms,legs}; return g;
  }
  const player=makePlayer(); player.position.set(-15,0,18); scene.add(player);

  const car=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(3.8,1.05,7),material(0xc82032));body.position.y=.9;body.castShadow=true;car.add(body);
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(3,1,3.3),new THREE.MeshStandardMaterial({color:0x8fc7d8,transparent:true,opacity:.48,roughness:.25}));cabin.position.set(0,1.62,-.35);car.add(cabin);
  for(const x of [-1.5,1.5])for(const z of [-2.25,2.25]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,.36,14),material(0x151515));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.48,z);car.add(wheel);
  }
  for(const x of [-.72,.72]){const seat=new THREE.Mesh(new THREE.BoxGeometry(.85,.55,.9),material(0x252a32));seat.position.set(x,1.15,.1);car.add(seat);}
  car.position.set(5,0,0);scene.add(car);
  obstacles.push({x:5,z:0,hx:2.2,hz:3.8});

  const phone=new THREE.Group();
  const pb=new THREE.Mesh(new THREE.BoxGeometry(.22,.38,.045),material(0x111820));
  const ps=new THREE.Mesh(new THREE.BoxGeometry(.18,.31,.012),material(0x3c9bd0));ps.position.z=-.03;phone.add(pb,ps);
  phone.position.set(.7,1.85,-.28);phone.rotation.x=-.25;player.add(phone);phone.visible=false;

  const state={keys:{},joyX:0,joyY:0,driving:false,speed:0,steer:0,accel:0,reverse:0,brake:0,phoneOpen:false,cameraMode:0,yaw:0,pitch:.22};
  const clamp=THREE.MathUtils.clamp;
  function say(t){$('message').textContent=t;}
  function collides(x,z,r=.65,ignoreCar=false){
    for(const o of obstacles){
      if(ignoreCar && o.x===5 && o.z===0) continue;
      const dx=Math.max(Math.abs(x-o.x)-o.hx,0), dz=Math.max(Math.abs(z-o.z)-o.hz,0);
      if(dx*dx+dz*dz<r*r)return true;
    }
    return false;
  }
  function moveWithCollision(obj,dx,dz,r=.65,ignoreCar=false){
    const nx=obj.position.x+dx,nz=obj.position.z+dz;
    if(!collides(nx,obj.position.z,r,ignoreCar))obj.position.x=nx;
    if(!collides(obj.position.x,nz,r,ignoreCar))obj.position.z=nz;
  }
  function setDriving(on){
    state.driving=on; $('driveControls').classList.toggle('hidden',!on);
    $('joystick').classList.toggle('hidden',on);
    $('jump').classList.toggle('hidden',on);
    if(on){player.visible=false;phone.visible=false;state.phoneOpen=false;$('phonePanel').classList.add('hidden');say('Driving. Use the car controls.');}
    else{player.visible=true;player.position.set(car.position.x+3,0,car.position.z);say('Back on foot.');}
  }
  $('action').addEventListener('click',()=>{
    if(!state.driving && player.position.distanceTo(car.position)<8)setDriving(true);
    else if(state.driving)setDriving(false);
    else say('Move closer to the red car to enter.');
  });
  $('jump').addEventListener('click',()=>{if(!state.driving)player.position.y=1.1;});
  $('camera').addEventListener('click',()=>{state.cameraMode=(state.cameraMode+1)%2;say(state.cameraMode?'Closer camera':'Third-person camera');});
  $('phone').addEventListener('click',()=>{
    state.phoneOpen=!state.phoneOpen;$('phonePanel').classList.toggle('hidden',!state.phoneOpen);
    phone.visible=state.phoneOpen&&!state.driving;
  });
  $('closePhone').addEventListener('click',()=>{state.phoneOpen=false;phone.visible=false;$('phonePanel').classList.add('hidden');});
  $('phonePanel').querySelectorAll('[data-app]').forEach(btn=>btn.addEventListener('click',()=>{
    const app=btn.dataset.app, content=$('phoneContent');
    const pages={
      contacts:'CONTACTS<br><br>No contacts saved yet.',
      gps:'GPS<br><br>Neel is exploring Miami. The green marker shows your location.',
      missions:'MISSIONS<br><br>Free roam mode. Missions are not available yet.',
      settings:'SETTINGS<br><br>Camera look is controlled by swiping the open game screen.'
    };
    content.innerHTML=pages[app]||'';
  }));

  // Correct joystick convention: up is negative screen Y, mapped to forward.
  const joy=$('joystick'),knob=joy.querySelector('.stick');let joyActive=false;
  function joyMove(e){
    const r=joy.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,len=Math.max(1,Math.hypot(dx,dy)),scale=Math.min(1,48/len);
    state.joyX=dx/48*scale;state.joyY=dy/48*scale;
    knob.style.transform=`translate(${state.joyX*30}px,${state.joyY*30}px)`;
  }
  function joyEnd(){joyActive=false;state.joyX=0;state.joyY=0;knob.style.transform='translate(0,0)';}
  joy.addEventListener('pointerdown',e=>{joyActive=true;joy.setPointerCapture(e.pointerId);joyMove(e);});
  joy.addEventListener('pointermove',e=>{if(joyActive)joyMove(e);});
  joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);

  // Hold-to-drive buttons.
  function hold(id,key){
    const el=$(id);
    const down=e=>{e.preventDefault();state[key]=1;};
    const up=()=>state[key]=0;
    el.addEventListener('pointerdown',down);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('pointerleave',up);
  }
  hold('accelerate','accel');hold('reverse','reverse');hold('brake','brake');hold('left','steerLeft');hold('right','steerRight');
  addEventListener('keydown',e=>state.keys[e.key.toLowerCase()]=true);
  addEventListener('keyup',e=>state.keys[e.key.toLowerCase()]=false);

  // Swipe camera: only gestures on the 3D canvas, not on controls.
  let lookPointer=null,lastX=0,lastY=0;
  renderer.domElement.addEventListener('pointerdown',e=>{lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;});
  renderer.domElement.addEventListener('pointermove',e=>{
    if(lookPointer!==e.pointerId)return;
    const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
    state.yaw-=dx*.006;state.pitch=clamp(state.pitch+dy*.004,-.12,1.05);
  });
  const endLook=()=>lookPointer=null;
  renderer.domElement.addEventListener('pointerup',endLook);renderer.domElement.addEventListener('pointercancel',endLook);

  const map=$('minimap'),ctx=map.getContext('2d');
  function drawMap(){
    const w=map.width,h=map.height,cx=w/2,cy=h/2,scale=.16;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#172532';ctx.fillRect(0,0,w,h);
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-player.rotation.y);
    ctx.strokeStyle='#647786';ctx.lineWidth=5;
    for(let v=-500;v<=500;v+=80){ctx.beginPath();ctx.moveTo(v*scale,-h);ctx.lineTo(v*scale,h);ctx.stroke();ctx.beginPath();ctx.moveTo(-w,v*scale);ctx.lineTo(w,v*scale);ctx.stroke();}
    ctx.restore();
    const px=state.driving?car.position.x:player.position.x,pz=state.driving?car.position.z:player.position.z;
    const markerAngle=state.driving?car.rotation.y:player.rotation.y;
    ctx.fillStyle='#ef4444';ctx.beginPath();ctx.arc(cx+(5-px)*scale,cy+(0-pz)*scale,4,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-markerAngle);
    ctx.fillStyle='#4ade80';ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(6,7);ctx.lineTo(0,4);ctx.lineTo(-6,7);ctx.closePath();ctx.fill();ctx.restore();
  }

  const clock=new THREE.Clock();let walkTime=0;
  function animate(){
    requestAnimationFrame(animate);
    const dt=Math.min(clock.getDelta(),.04),k=state.keys;
    if(state.driving){
      const forward=(state.accel||k.w||k.arrowup?1:0)-(state.reverse||k.s||k.arrowdown?1:0);
      const steer=(state.steerLeft||k.a||k.arrowleft?1:0)-(state.steerRight||k.d||k.arrowright?1:0);
      if(state.brake||k[' '])state.speed=THREE.MathUtils.damp(state.speed,0,8,dt);
      else state.speed=THREE.MathUtils.damp(state.speed,forward*24,forward?2.4:1.1,dt);
      car.rotation.y-=steer*dt*(.9+Math.abs(state.speed)*.035);
      const dx=Math.sin(car.rotation.y)*state.speed*dt,dz=Math.cos(car.rotation.y)*state.speed*dt;
      const old=car.position.clone();moveWithCollision(car,dx,dz,2.0,true);
      if(old.distanceTo(car.position)<Math.hypot(dx,dz)*.45)state.speed=0;
      $('speed').textContent=Math.round(Math.abs(state.speed)*3)+' km/h';
    } else {
      const forward=-(state.joyY || 0)-(k.w||k.arrowup?1:0)+(k.s||k.arrowdown?1:0);
      const strafe=state.joyX+(k.d||k.arrowright?1:0)-(k.a||k.arrowleft?1:0);
      const cameraForward=new THREE.Vector3(-Math.sin(state.yaw),0,-Math.cos(state.yaw));
      const cameraRight=new THREE.Vector3(Math.cos(state.yaw),0,-Math.sin(state.yaw));
      const dir=cameraForward.multiplyScalar(forward).add(cameraRight.multiplyScalar(strafe));
      if(dir.lengthSq()>.01){
        dir.normalize();const angle=Math.atan2(dir.x,dir.z);player.rotation.y=THREE.MathUtils.damp(player.rotation.y,angle,12,dt);
        const step=dir.multiplyScalar(7*dt);moveWithCollision(player,step.x,step.z,.7,true);walkTime+=dt*9;
        player.userData.legs[0].rotation.x=Math.sin(walkTime)*.55;player.userData.legs[1].rotation.x=-Math.sin(walkTime)*.55;
        player.userData.arms[0].rotation.x=-Math.sin(walkTime)*.35;player.userData.arms[1].rotation.x=Math.sin(walkTime)*.35;
      } else {
        player.userData.legs.forEach(a=>a.rotation.x=THREE.MathUtils.damp(a.rotation.x,0,8,dt));
        player.userData.arms.forEach(a=>a.rotation.x=THREE.MathUtils.damp(a.rotation.x,0,8,dt));
      }
      player.position.y=THREE.MathUtils.damp(player.position.y,0,9,dt);
      $('speed').textContent='0 km/h';
    }

    const target=state.driving?car:player;
    const distance=state.cameraMode?5.5:9;
    const horizontal=Math.cos(state.pitch)*distance;
    const offset=new THREE.Vector3(Math.sin(state.yaw)*horizontal,2.4+Math.sin(state.pitch)*distance,Math.cos(state.yaw)*horizontal);
    const desired=target.position.clone().add(offset);
    camera.position.lerp(desired,1-Math.exp(-7*dt));
    camera.lookAt(target.position.clone().add(new THREE.Vector3(0,state.driving?1.1:1.45,0)));
    drawMap();renderer.render(scene,camera);
  }
  animate();
  loading.classList.add('hidden');
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
} catch(err){showError(err);}
    
