// === Setup Scene, Camera, and Renderer ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.6, 5); // eye-level height

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gameCanvas") });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// === Lighting ===
const ambientLight = new THREE.AmbientLight(0x202020);
scene.add(ambientLight);

// Flashlight (attached to camera)
const flashlight = new THREE.SpotLight(0xffffff, 3, 30, Math.PI / 8, 0.3, 2);
flashlight.castShadow = true;
camera.add(flashlight);
camera.add(flashlight.target);
scene.add(camera); // add camera to scene so its lights render

// === Floor ===
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x111111 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// === Enemy Cube ===
const enemy = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
enemy.position.set(0, 0.5, -5);
enemy.castShadow = true;
scene.add(enemy);

// === Pointer Lock Controls ===
const controls = new THREE.PointerLockControls(camera, renderer.domElement);
scene.add(controls.getObject());

document.addEventListener("click", () => {
  controls.lock();
});

const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

let flashlightOn = true;
document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "f") {
    flashlightOn = !flashlightOn;
    flashlight.visible = flashlightOn;
  }
});

// === Movement ===
const moveSpeed = 0.1;
function handleMovement() {
  const direction = new THREE.Vector3();

  if (keys["w"]) direction.z -= moveSpeed;
  if (keys["s"]) direction.z += moveSpeed;
  if (keys["a"]) direction.x -= moveSpeed;
  if (keys["d"]) direction.x += moveSpeed;

  direction.applyQuaternion(camera.quaternion);
  controls.moveRight(direction.x);
  controls.moveForward(-direction.z);
}

// === Simple Enemy AI ===
function updateEnemy() {
  const playerPos = controls.getObject().position;
  const enemyPos = enemy.position;

  const dir = new THREE.Vector3().subVectors(playerPos, enemyPos);
  const distance = dir.length();

  if (distance > 1) {
    dir.normalize();
    enemy.position.add(dir.multiplyScalar(0.02));
  }
}

// === Animation Loop ===
function animate() {
  requestAnimationFrame(animate);
  handleMovement();
  updateEnemy();
  renderer.render(scene, camera);
}
animate();

// === Resize Handling ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
