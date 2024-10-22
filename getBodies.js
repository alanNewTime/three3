import * as THREE from "three";

//DEFINE THE CENTER OF OUR SCENE
const sceneMiddle = new THREE.Vector3(0, 0, 0);

//--------LOGIC BEHIND THE BALLS START---------
function getBody(RAPIER, world) {
  const size = 0.1 + Math.random() * 0.25; //size of the bodies
  const range = 6;
  const density = size * 1.0;
  let x = Math.random() * range - range * 0.5;
  let y = Math.random() * range - range * 0.5 + 3;
  let z = Math.random() * range - range * 0.5;
  // using the imported physics (rapier) to set up a DYNAMIC RIGID BODY
  let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
  let rigid = world.createRigidBody(rigidBodyDesc);
  let colliderDesc = RAPIER.ColliderDesc.ball(size).setDensity(density);
  world.createCollider(colliderDesc, rigid);

  //geaometry and standard material of the balls
  const geometry = new THREE.IcosahedronGeometry(size, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);

  //adding wire frame material to the balls
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x990000,
    wireframe: true,
  });
  const wireMesh = new THREE.Mesh(geometry, wireMat);
  wireMesh.scale.setScalar(1.01);
  mesh.add(wireMesh);

  // in this function i reset all the forces
  //and indicate the center of our scene as the point where
  //all the balls will tend to collaps
  function update() {
    rigid.resetForces(true);
    let { x, y, z } = rigid.translation();
    let pos = new THREE.Vector3(x, y, z);
    let dir = pos.clone().sub(sceneMiddle).normalize();
    rigid.addForce(dir.multiplyScalar(-0.5), true);
    mesh.position.set(x, y, z);
  }
  return { mesh, rigid, update };
}
//--------LOGIC BEHIND THE BALLS END-------------

//--------LOGIC BEHIND THE BRIGHT BALL START---------
function getMouseBall(RAPIER, world) {
  const mouseSize = 0.25; //bright ball size
  const geometry = new THREE.IcosahedronGeometry(mouseSize, 8);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
  });
  const mouseLight = new THREE.PointLight(0xffffff, 1);
  const mouseMesh = new THREE.Mesh(geometry, material);
  mouseMesh.add(mouseLight);
  // using the imported physics (rapier) to set up a RIGID BODY
  let bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
    0,
    0,
    0
  );
  let mouseRigid = world.createRigidBody(bodyDesc); //create a rigid body
  let dynamicCollider = RAPIER.ColliderDesc.ball(mouseSize * 3.0); //create a collider (in this case a ball collider with a given size)
  world.createCollider(dynamicCollider, mouseRigid);
  //the update function makes sure that the ball moves where the mouse moves
  function update(mousePos) {
    mouseRigid.setTranslation({ x: mousePos.x * 5, y: mousePos.y * 5, z: 0.2 });
    let { x, y, z } = mouseRigid.translation();
    mouseMesh.position.set(x, y, z);
  }
  return { mesh: mouseMesh, update };
}
//--------LOGIC BEHIND THE BRIGHT BALL END---------

export { getBody, getMouseBall };
