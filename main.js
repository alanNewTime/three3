import * as THREE from "three";
import { getBody, getMouseBall } from "./getBodies.js"; //importing the functions of the bright ball and balls from the other js file
import RAPIER from "https://cdn.skypack.dev/@dimforge/rapier3d-compat@0.11.2"; //import the rapier physics engine
//the three imports below are the post processes.
import { EffectComposer } from "./node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "./node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "./node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";

//-------------------TEMPLATE START----------------------
//CAMERA
const w = window.innerWidth;
const h = window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;

//RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

//SCENE
const scene = new THREE.Scene();
//-------------------TEMPLATE END----------------------

//INITIALIZING THE RAPIER PHYSICS ENGINE
await RAPIER.init();
const gravity = { x: 0.0, y: 0, z: 0.0 }; //define a gravity
const world = new RAPIER.World(gravity); //create a wordl passing in that gravity

//CONTAINER FOR MOUSE POSITION
let mousePos = new THREE.Vector2();

// POST PROCESSING START
const renderScene = new RenderPass(scene, camera);
// resolution, strength, radius, threshold
const resolution = new THREE.Vector2(w, h);
const strength = 2.0;
const radius = 0.0;
const threshold = 0.005;
const bloomPass = new UnrealBloomPass(resolution, strength, radius, threshold);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
// POST PROCESSING END

//BALLS START
const numBodies = 100; //number of balls
const bodies = [];
for (let i = 0; i < numBodies; i++) {
  const body = getBody(RAPIER, world); // container for balls, where i call the function linked to the balls and pass the physics
  bodies.push(body);
  scene.add(body.mesh);
}
//hemi light effect on the balls
const hemiLight = new THREE.HemisphereLight(0x00bbff, 0xaa00ff);
hemiLight.intensity = 0.2;
scene.add(hemiLight);
//BALLS END

//BRIGHT BALL START
const mouseBall = getMouseBall(RAPIER, world); //container for my bright mousebal,where i call the function linked to the ball and pass the physics
scene.add(mouseBall.mesh);
//BRIGHT BALL END

function animate() {
  requestAnimationFrame(animate);
  world.step(); //calling the physics engine after initialization
  mouseBall.update(mousePos);
  bodies.forEach((b) => b.update()); // calling the update() function for each ball element, thereby making them all collapse
  composer.render(scene, camera); // here i use the "composer" in the post processing section above and not the scene
}
animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);

function handleMouseMove(evt) {
  mousePos.x = (evt.clientX / window.innerWidth) * 2 - 1;
  mousePos.y = -(evt.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener("mousemove", handleMouseMove, false);
