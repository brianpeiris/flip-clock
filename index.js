import "./global";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Renderer, Camera } from "holoplay";
window.THREE = THREE;

import { Clock } from "./clock";

const queryParams = new URLSearchParams(location.search);

(async () => {
  const textureLoader = new THREE.TextureLoader();

  const noiseImageData = await createImageBitmap(await fetch("noise-normal.png").then((r) => r.blob()));
  const brushedImageData = await createImageBitmap(await fetch("brushed-normal.png").then((r) => r.blob()));

  const scene = new THREE.Scene();

  // scene.background = new THREE.Color("white");

  // scene.background = textureLoader.load("hotel_room.jpg");
  // scene.background.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = textureLoader.load("hotel_room.jpg");
  scene.environment.mapping = THREE.EquirectangularReflectionMapping;

  const directionalLight = new THREE.DirectionalLight("white", 0.5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.setScalar(2048);
  directionalLight.position.set(1, 0.5, 5);
  scene.add(directionalLight);

  const frame = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 2), new THREE.MeshStandardMaterial({ wireframe: true }));
  //scene.add(frame);

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(3, 4, 0.1),
    new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, metalness: 0 })
  );
  back.receiveShadow = true;
  if (!queryParams.has("forward")) {
    back.position.z = -1;
  }
  scene.add(back);

  const clock = new Clock(noiseImageData, brushedImageData);
  clock.scale.setScalar(0.3);
  if (queryParams.has("forward")) {
    clock.position.z = 0.7;
  } 
  scene.add(clock);

  const renderer = new Renderer({disableFullscreenUi: queryParams.has("2d") });
  renderer.render2d = queryParams.has("2d");
  renderer.renderQuilt = queryParams.has("quilt");
  renderer.domElement.className = "gl";
  renderer.webglRenderer.physicallyCorrectLights = true;
  renderer.webglRenderer.shadowMap.enabled = true;
  document.body.append(renderer.domElement);

  const camera = new Camera();
  camera.position.z = 20;
  if (queryParams.has("2d")) {
    new OrbitControls(camera, renderer.domElement);
  }

  renderer.webglRenderer.setAnimationLoop(() => {
    clock.update();
    renderer.render(scene, camera);
  });
})();
