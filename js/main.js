// Nova 3D — a minimal Three.js scene.
// Plain ES modules loaded from a CDN via the import map in index.html.
// No build step: this file is served as-is by Nginx.

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const container = document.getElementById("scene-container");

// --- Scene, camera, renderer ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0e1a);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// --- Orbit controls (drag to rotate, scroll to zoom) ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 3;
controls.maxDistance = 9;

// --- Lighting ---
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(5, 5, 5);
scene.add(keyLight);
const rimLight = new THREE.PointLight(0xa371f7, 1.5, 20);
rimLight.position.set(-5, -3, -4);
scene.add(rimLight);

// --- The animated mesh ---
const palette = [0x5eead4, 0xa371f7, 0xf9e795, 0xf96167, 0x388bfd];
const geometries = [
  new THREE.IcosahedronGeometry(1.4, 0),
  new THREE.TorusKnotGeometry(1, 0.32, 128, 24),
  new THREE.OctahedronGeometry(1.5, 0),
  new THREE.DodecahedronGeometry(1.4, 0),
  new THREE.TorusGeometry(1.1, 0.42, 24, 80),
];
let shapeIndex = 0;
let colorIndex = 0;
let spinning = true;

const material = new THREE.MeshStandardMaterial({
  color: palette[colorIndex],
  metalness: 0.4,
  roughness: 0.25,
  flatShading: true,
});

let mesh = new THREE.Mesh(geometries[shapeIndex], material);
scene.add(mesh);

// A subtle wireframe halo around the shape
const halo = new THREE.Mesh(
  new THREE.IcosahedronGeometry(2.6, 1),
  new THREE.MeshBasicMaterial({ color: 0x1c2942, wireframe: true })
);
scene.add(halo);

// --- Interactive buttons ---
document.getElementById("btn-color").addEventListener("click", () => {
  colorIndex = (colorIndex + 1) % palette.length;
  material.color.setHex(palette[colorIndex]);
});

document.getElementById("btn-shape").addEventListener("click", () => {
  shapeIndex = (shapeIndex + 1) % geometries.length;
  mesh.geometry.dispose();
  mesh.geometry = geometries[shapeIndex];
});

document.getElementById("btn-spin").addEventListener("click", () => {
  spinning = !spinning;
});

// --- Handle window resize ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Animation loop ---
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (spinning) {
    mesh.rotation.x += 0.004;
    mesh.rotation.y += 0.006;
  }
  halo.rotation.y = t * 0.05;
  mesh.position.y = Math.sin(t * 0.8) * 0.15;

  controls.update();
  renderer.render(scene, camera);
}
animate();

// --- Show build info if injected by CI (see the deploy workflow) ---
fetch("build.json")
  .then((r) => (r.ok ? r.json() : null))
  .then((info) => {
    if (info && info.commit) {
      document.getElementById("build-info").textContent =
        `build: ${info.commit.slice(0, 7)} · ${info.date}`;
    }
  })
  .catch(() => {});
