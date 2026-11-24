import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x86c9e8);
scene.fog = new THREE.Fog(0x86c9e8, 150, 520);

const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 900);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
renderer.domElement.id = 'gameCanvas';

scene.add(new THREE.HemisphereLight(0xffffff, 0x58606a, 2));
const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(-70, 110, 60);
sun.castShadow = true;
scene.add(sun);

const mat = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.82 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), mat(0x75a96c));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.08;
ground.receiveShadow = true;
scene.add(ground);

const roadMat = mat(0x343a40);
const mark = mat(0xf5e6a8);
function road(x, z, w, d) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), roadMat);
  m.position.set(x, 0, z);
  scene.add(m);
}
for (let z = -240; z <= 240; z += 80) road(0, z, 620, 14);
for (let x = -280; x <= 280; x += 80) road(x, 0, 14, 520);

for (let z = -240; z <= 240; z += 80) {
  for (let x = -300; x < 300; x += 18) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(7, 0.025, 0.18), mark);
    l.position.set(x, 0.055, z);
    scene.add(l);
  }
}

const colors = [0xe6b77e, 0xf0d2a2, 0xd6a4a0, 0xb7c7d8, 0xe2dfc8, 0xc5d6b5, 0xd9c0e8];
for (let z = -205; z <= 205; z += 80) {
  for (let x = -245; x <= 245; x += 80) {
    if (Math.abs(x) < 55 && Math.abs(z) < 55) continue;
    const h = 15 + (Math.abs(x * 3 + z * 7) % 5) * 5;
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(43, h, 48),
      mat(colors[Math.abs(Math.floor(x + z)) % colors.length])
    );
    b.position.set(x, h / 2, z);
    b.castShadow = true;
    b.receiveShadow = true;
    scene.add(b);
  }
}

const beach = new THREE.Mesh(new THREE.PlaneGeometry(620, 55), mat(0xe7d49c));
beach.rotation.x = -Math.PI / 2;
beach.position.set(0, -0.025, -285);
scene.add(beach);

const ocean = new THREE.Mesh(new THREE.PlaneGeometry(620, 230), mat(0x168fbd));
ocean.rotation.x = -Math.PI / 2;
ocean.position.set(0, -0.03, -425);
scene.add(ocean);

for (let i = 0; i < 40; i++) {
  const x = -285 + i * 14;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 4.4, 7), mat(0x795334));
  trunk.position.set(x, 2.2, -245 - (i % 3) * 7);
  scene.add(trunk);
  const leaves = new THREE.Mesh(new THREE.SphereGeometry(2.2, 8, 6), mat(0x23834a));
  leaves.position.set(x, 4.8, -245 - (i % 3) * 7);
  leaves.scale.set(1.2, 0.55, 1.2);
  scene.add(leaves);
}

function character(shirtColor, pantsColor, hairColor) {
  const g = new THREE.Group();
  const skin = mat(0xc98f68);
  const shirt = mat(shirtColor);
  const pants = mat(pantsColor);
  const hair = mat(hairColor);
  const shoe = mat(0x202329);

  function add(geo, material, x, y, z) {
    const o = new THREE.Mesh(geo, material);
    o.position.set(x, y, z);
    g.add(o);
    return o;
  }

  add(new THREE.BoxGeometry(0.95, 1.05, 0.48), shirt, 0, 1.55, 0);
  add(new THREE.CylinderGeometry(0.16, 0.17, 0.22, 8), skin, 0, 2.18, 0);
  add(new THREE.SphereGeometry(0.38, 16, 12), skin, 0, 2.52, 0);
  add(new THREE.SphereGeometry(0.39, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.52), hair, 0, 2.62, -0.015);

  for (const x of [-0.14, 0.14]) {
    add(new THREE.SphereGeometry(0.045, 8, 6), mat(0xffffff), x, 2.55, -0.342);
    add(new THREE.SphereGeometry(0.022, 8, 6), mat(0x171717), x, 2.55, -0.38);
  }
  add(new THREE.SphereGeometry(0.055, 8, 6), skin, 0, 2.44, -0.37);
  add(new THREE.BoxGeometry(0.13, 0.025, 0.025), mat(0x713f36), 0, 2.34, -0.36);

  const arms = [];
  const legs = [];
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(s * 0.59, 1.88, 0);
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.65, 8), shirt);
    upper.position.y = -0.28;
    arm.add(upper);
    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.12, 0.55, 8), skin);
    forearm.position.y = -0.83;
    arm.add(forearm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), skin);
    hand.position.y = -1.13;
    arm.add(hand);
    g.add(arm);
    arms.push(arm);

    const leg = new THREE.Group();
    leg.position.set(s * 0.25, 1.02, 0);
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.62, 8), pants);
    thigh.position.y = -0.28;
    leg.add(thigh);
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.55, 8), pants);
    shin.position.y = -0.83;
    leg.add(shin);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.16, 0.42), shoe);
    foot.position.set(0, -1.15, -0.1);
    leg.add(foot);
    g.add(leg);
    legs.push(leg);
  }
  g.userData = { arms, legs };
  return g;
}

const player = character(0x2457bd, 0x252b36, 0x24201d);
player.position.set(-15, 0, 18);
scene.add(player);

const jason = character(0x30343b, 0x414b5b, 0x171717);
jason.position.set(13, 0, 10);
scene.add(jason);

const car = new THREE.Group();
const red = mat(0xc82032);
const glass = mat(0x8fc7d8);
const rubber = mat(0x151515);
const body = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.05, 7), red);
body.position.y = 0.9;
car.add(body);
const cabin = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 3.3), glass);
cabin.position.set(0, 1.62, -0.35);
car.add(cabin);

for (const x of [-1.5, 1.5]) {
  for (const z of [-2.25, 2.25]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.36, 14), rubber);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.48, z);
    car.add(wheel);
  }
}
for (const x of [-0.72, 0.72]) {
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.55, 0.9), mat(0x252a32));
  seat.position.set(x, 1.15, 0.1);
  car.add(seat);
}
car.position.set(5, 0, 0);
scene.add(car);

const phone = new THREE.Group();
const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.38, 0.045), mat(0x111820));
const phoneScreen = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.31, 0.012), mat(0x3c9bd0));
phone.add(phoneBody, phoneScreen);
phoneScreen.position.z = -0.03;
phone.position.set(0.7, 1.85, -0.28);
phone.rotation.x = -0.25;
player.add(phone);
phone.visible = false;

const keys = {};
let driving = false;
let phoneOpen = false;
let speed = 0;
let yaw = 0;
let cameraMode = 0;
let jasonInCar = false;

addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

const el = id => document.getElementById(id);
function msg(t) {
  const message = el('message');
  if (message) message.textContent = t;
}

function action(id) {
  if (id === 'phone') {
    phoneOpen = !phoneOpen;
    phone.visible = phoneOpen && !driving;
    el('phonePanel').classList.toggle('hidden', !phoneOpen);
  }
  if (id === 'closePhone') {
    phoneOpen = false;
    phone.visible = false;
    el('phonePanel').classList.add('hidden');
  }
  if (id === 'camera') cameraMode = (cameraMode + 1) % 2;

  if (id === 'jump' && !driving) player.position.y = 1.2;

  if (id === 'action') {
    if (!driving && player.position.distanceTo(car.position) < 7) {
      driving = true;
      phone.visible = false;
      phoneOpen = false;
      el('phonePanel').classList.add('hidden');
      msg('Neel is driving. Jason takes the passenger seat.');
      if (!jasonInCar) {
        jasonInCar = true;
        jason.visible = true;
      }
    } else if (driving) {
      driving = false;
      player.position.copy(car.position).add(new THREE.Vector3(3.2, 0, 0));
      if (jasonInCar) {
        jason.position.copy(car.position).add(new THREE.Vector3(-0.8, 0, -0.2));
        jason.position.y = 0;
        jason.visible = true;
        jasonInCar = false;
      }
      msg('You exited the car. Jason got out too.');
    } else if (player.position.distanceTo(jason.position) < 7) {
      msg('Jason: Come on, Neel. Let us explore Miami.');
    } else {
      msg('Move closer to Jason or the red car.');
    }
  }
}

for (const id of ['jump', 'action', 'phone', 'camera', 'closePhone']) {
  const button = el(id);
  if (button) button.addEventListener('click', () => action(id));
}

const joy = { x: 0, y: 0 };
const joyEl = document.createElement('div');
joyEl.id = 'joystick';
joyEl.innerHTML = '<div></div>';
document.body.appendChild(joyEl);

let active = false;
joyEl.addEventListener('pointerdown', e => {
  active = true;
  joyEl.setPointerCapture(e.pointerId);
  moveJoy(e);
});
joyEl.addEventListener('pointermove', e => {
  if (active) moveJoy(e);
});
function release() {
  active = false;
  joy.x = 0;
  joy.y = 0;
  joyEl.firstElementChild.style.transform = 'translate(0,0)';
}
joyEl.addEventListener('pointerup', release);
joyEl.addEventListener('pointercancel', release);

function moveJoy(e) {
  const r = joyEl.getBoundingClientRect();
  const dx = e.clientX - r.left - r.width / 2;
  const dy = e.clientY - r.top - r.height / 2;
  const len = Math.max(1, Math.hypot(dx, dy));
  joy.x = dx / Math.max(55, len);
  joy.y = dy / Math.max(55, len);
  joyEl.firstElementChild.style.transform = `translate(${joy.x * 32}px,${joy.y * 32}px)`;
}

const map = el('minimap');
const ctx = map ? map.getContext('2d') : null;

function drawMap() {
  if (!map || !ctx) return;
  const w = map.width;
  const h = map.height;
  const cx = w / 2;
  const cy = h / 2;
  const scale = 0.19;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#172532';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#647786';
  ctx.lineWidth = 5;

  for (let v = -300; v <= 300; v += 80) {
    ctx.beginPath();
    ctx.moveTo(cx + v * scale, 0);
    ctx.lineTo(cx + v * scale, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, cy + v * scale);
    ctx.lineTo(w, cy + v * scale);
    ctx.stroke();
  }

  function dot(object, color, radius) {
    const x = cx + (object.position.x - player.position.x) * scale;
    const y = cy + (object.position.z - player.position.z) * scale;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  dot(car, '#ef4444', 5);
  if (!jasonInCar) dot(jason, '#facc15', 4);
  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.04);

  const forward =
    (keys.w || keys.arrowup ? 1 : 0) -
    (keys.s || keys.arrowdown ? 1 : 0) -
    joy.y;

  const turn =
    (keys.d || keys.arrowright ? 1 : 0) -
    (keys.a || keys.arrowleft ? 1 : 0) +
    joy.x;

  if (driving) {
    yaw -= turn * dt * 1.6;
    car.rotation.y = yaw;
    speed = THREE.MathUtils.damp(speed, forward * 22, 2.8, dt);
    car.position.x += Math.sin(yaw) * speed * dt;
    car.position.z += Math.cos(yaw) * speed * dt;
    player.position.copy(car.position);
    if (jasonInCar) {
      jason.position.copy(car.position);
      jason.position.y = 0.55;
      jason.rotation.y = yaw;
    }
    el('speed').textContent = Math.round(Math.abs(speed) * 3) + ' km/h';
  } else {
    const moving = Math.abs(forward) + Math.abs(turn) > 0.05;
    if (moving) {
      const angle = Math.atan2(turn, forward || 0.0001);
      player.rotation.y = angle;
      player.position.x += Math.sin(angle) * Math.abs(forward) * dt * 7 + turn * dt * 2;
      player.position.z += Math.cos(angle) * Math.abs(forward) * dt * 7;
    }
    player.position.y = Math.max(0, player.position.y - dt * 3);
    el('speed').textContent = '0 km/h';
    if (phoneOpen) phone.visible = true;
  }

  if (!jasonInCar) {
    const d = jason.position.distanceTo(player.position);
    if (d > 3.2) {
      const dir = player.position.clone().sub(jason.position).normalize();
      jason.position.add(dir.multiplyScalar(dt * 2.4));
      jason.rotation.y = Math.atan2(dir.x, dir.z);
    }
  }

  const target = driving ? car : player;
  if (cameraMode === 0) {
    const off = new THREE.Vector3(0, 8, 14).applyAxisAngle(new THREE.Vector3(0, 1, 0), target.rotation.y);
    camera.position.lerp(target.position.clone().add(off), 0.12);
    camera.lookAt(target.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
  } else {
    const off = new THREE.Vector3(0, 2.4, -0.1).applyAxisAngle(new THREE.Vector3(0, 1, 0), target.rotation.y);
    camera.position.lerp(target.position.clone().add(off), 0.18);
    camera.lookAt(target.position.clone().add(new THREE.Vector3(0, 1.8, 0)));
  }

  drawMap();
  renderer.render(scene, camera);
}

animate();
const loading = el('loading');
if (loading) loading.style.display = 'none';

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
