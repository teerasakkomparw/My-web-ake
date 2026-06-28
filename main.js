import './styles.css';
import * as THREE from 'https://esm.sh/three@0.185.0';

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x050507, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 0, 8);

const pointer = new THREE.Vector2(0, 0);
const targetRotation = new THREE.Vector2(0, 0);

const palette = {
  teal: new THREE.Color('#40f4c8'),
  amber: new THREE.Color('#ffbd4a'),
  rose: new THREE.Color('#ff4f8f'),
  ink: new THREE.Color('#11131f'),
};

const group = new THREE.Group();
scene.add(group);

const coreGeometry = new THREE.IcosahedronGeometry(1.55, 3);
const coreMaterial = new THREE.MeshStandardMaterial({
  color: palette.ink,
  metalness: 0.55,
  roughness: 0.24,
  emissive: '#15203a',
  emissiveIntensity: 0.35,
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
group.add(core);

const wire = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.62, 2),
  new THREE.MeshBasicMaterial({
    color: '#f9fbff',
    wireframe: true,
    transparent: true,
    opacity: 0.22,
  }),
);
group.add(wire);

function makeRing(radius, tube, color, rotation) {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 64, 160),
    new THREE.MeshStandardMaterial({
      color,
      metalness: 0.25,
      roughness: 0.18,
      emissive: color,
      emissiveIntensity: 0.18,
    }),
  );
  mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  group.add(mesh);
  return mesh;
}

const rings = [
  makeRing(2.1, 0.025, '#40f4c8', [Math.PI / 2.8, 0.2, 0.1]),
  makeRing(2.45, 0.018, '#ffbd4a', [0.25, Math.PI / 2.3, 0.35]),
  makeRing(2.78, 0.014, '#ff4f8f', [0.5, 0.12, Math.PI / 2.4]),
];

const markerGeometry = new THREE.SphereGeometry(0.07, 18, 18);
const markerMaterials = [
  new THREE.MeshStandardMaterial({ color: '#40f4c8', emissive: '#40f4c8', emissiveIntensity: 0.8 }),
  new THREE.MeshStandardMaterial({ color: '#ffbd4a', emissive: '#ffbd4a', emissiveIntensity: 0.75 }),
  new THREE.MeshStandardMaterial({ color: '#ff4f8f', emissive: '#ff4f8f', emissiveIntensity: 0.75 }),
];
const markers = Array.from({ length: 36 }, (_, index) => {
  const marker = new THREE.Mesh(markerGeometry, markerMaterials[index % markerMaterials.length]);
  marker.userData = {
    radius: 3.1 + Math.random() * 1.45,
    speed: 0.25 + Math.random() * 0.55,
    offset: Math.random() * Math.PI * 2,
    lift: -1.1 + Math.random() * 2.2,
  };
  scene.add(marker);
  return marker;
});

const particlesGeometry = new THREE.BufferGeometry();
const particleCount = 460;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let index = 0; index < particleCount; index += 1) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 4.5 + Math.random() * 6.5;
  positions[index * 3] = Math.cos(angle) * radius;
  positions[index * 3 + 1] = (Math.random() - 0.5) * 6.5;
  positions[index * 3 + 2] = Math.sin(angle) * radius - 2;

  const color = [palette.teal, palette.amber, palette.rose][index % 3];
  colors[index * 3] = color.r;
  colors[index * 3 + 1] = color.g;
  colors[index * 3 + 2] = color.b;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particles = new THREE.Points(
  particlesGeometry,
  new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.62,
  }),
);
scene.add(particles);

const keyLight = new THREE.PointLight('#ffffff', 3.5, 18);
keyLight.position.set(3.4, 4.5, 5.5);
scene.add(keyLight);

const tealLight = new THREE.PointLight('#40f4c8', 2.2, 14);
tealLight.position.set(-4, -1, 3);
scene.add(tealLight);

const roseLight = new THREE.PointLight('#ff4f8f', 1.8, 12);
roseLight.position.set(4, -3, 2);
scene.add(roseLight);

scene.add(new THREE.AmbientLight('#ffffff', 0.45));

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.position.z = width < 760 ? 9.2 : 7.8;
  group.position.x = width < 760 ? 0 : 2.15;
  group.position.y = width < 760 ? 1.15 : 0.1;
  group.scale.setScalar(width < 760 ? 0.78 : 1);
  camera.updateProjectionMatrix();
}

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  targetRotation.x = pointer.y * 0.22;
  targetRotation.y = pointer.x * 0.32;
}

window.addEventListener('resize', resize);
window.addEventListener('pointermove', onPointerMove);
resize();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clock = new THREE.Clock();

function render() {
  const elapsed = clock.getElapsedTime();
  const motion = reducedMotion.matches ? 0.18 : 1;

  group.rotation.x += (targetRotation.x - group.rotation.x) * 0.035;
  group.rotation.y += (targetRotation.y - group.rotation.y) * 0.035;
  core.rotation.x = elapsed * 0.16 * motion;
  core.rotation.y = elapsed * 0.21 * motion;
  wire.rotation.x = -elapsed * 0.11 * motion;
  wire.rotation.y = elapsed * 0.18 * motion;

  rings.forEach((ring, index) => {
    ring.rotation.z += (0.0028 + index * 0.0014) * motion;
    ring.rotation.x += 0.0014 * motion;
  });

  markers.forEach((marker, index) => {
    const { radius, speed, offset, lift } = marker.userData;
    const angle = elapsed * speed * motion + offset;
    marker.position.set(
      group.position.x + Math.cos(angle) * radius,
      group.position.y + lift + Math.sin(angle * 1.7) * 0.22,
      Math.sin(angle) * radius - 1.6,
    );
    marker.scale.setScalar(0.75 + Math.sin(elapsed * 2 + index) * 0.18);
  });

  particles.rotation.y = elapsed * 0.018 * motion;
  particles.rotation.x = Math.sin(elapsed * 0.08) * 0.06;

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
