/* =====================================================
   MY CITY — GAME.JS
   النسخة الأساسية:
   شخصية + مدينة + حركة + كاميرا + خريطة
   + ليل ونهار + إضاءة + مباني + شرطة
===================================================== */

import * as THREE from "three";


/* =====================================================
   GLOBALS
===================================================== */

let scene;
let camera;
let renderer;

let player;
let playerGroup;

let clock;

let gameStarted = false;

let dayTime = 0.35;

let isNight = false;

let jumpVelocity = 0;

let isGrounded = true;

let sprinting = false;


/* =====================================================
   INPUT
===================================================== */

window.input = {

  x: 0,

  y: 0

};


const keys = {};


/* =====================================================
   CAMERA
===================================================== */

let cameraYaw = 0;

let cameraPitch = 0.28;

let cameraDistance = 7;

let cameraHeight = 3.2;

let cameraTarget =
  new THREE.Vector3();


/* =====================================================
   CITY
===================================================== */

const cityObjects = [];

const streetLights = [];

const buildings = [];


/* =====================================================
   MESSAGE
===================================================== */

let messageElement;

window.showMessage = function(text) {

  if (!messageElement) {

    messageElement =
      document.getElementById(
        "message"
      );

  }

  if (!messageElement) {

    return;

  }

  messageElement.textContent =
    text;

  clearTimeout(
    window.messageTimer
  );

  window.messageTimer =
    setTimeout(
      () => {

        messageElement.textContent =
          "";

      },
      2500
    );

};


/* =====================================================
   START GAME
===================================================== */

function startGame() {

  if (gameStarted) {

    return;

  }

  gameStarted = true;

  const startScreen =
    document.getElementById(
      "startScreen"
    );

  if (startScreen) {

    startScreen.style.display =
      "none";

  }

  initGame();

}


/* =====================================================
   START BUTTON
===================================================== */

const startButton =
  document.getElementById(
    "startButton"
  );

if (startButton) {

  startButton.addEventListener(
    "click",
    startGame
  );

}


/* =====================================================
   AUTO START
   لأن START GAME تم حذفه من index
===================================================== */

if (!startButton) {

  window.addEventListener(
    "load",
    () => {

      startGame();

    }
  );

}


/* =====================================================
   INIT
===================================================== */

function initGame() {

  scene =
    new THREE.Scene();


  scene.background =
    new THREE.Color(
      0x87ceeb
    );


  clock =
    new THREE.Clock();


  /* CAMERA */

  camera =
    new THREE.PerspectiveCamera(
      70,
      window.innerWidth /
      window.innerHeight,
      0.1,
      1000
    );


  camera.position.set(
    0,
    5,
    8
  );


  /* RENDERER */

  renderer =
    new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });


  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );


  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      2
    )
  );


  renderer.shadowMap.enabled =
    true;


  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


  const game =
    document.getElementById(
      "game"
    );


  if (game) {

    game.innerHTML = "";

    game.appendChild(
      renderer.domElement
    );

  }


  /* GLOBAL ACCESS */

  window.scene =
    scene;

  window.camera =
    camera;

  window.renderer =
    renderer;


  createLighting();

  createGround();

  createRoads();

  createBuildings();

  createSchool();

  createHome();

  createMall();

  createShops();

  createPoliceStation();

  createStreetLights();

  createPlayer();

  setupInput();

  setupCameraControl();

  setupMap();

  setupResize();

  setupKeyboard();

  animate();


  showMessage(
    "🎮 أهلاً بك في MY CITY"
  );

}


/* =====================================================
   LIGHTING
===================================================== */

let sunLight;

let ambientLight;


function createLighting() {

  ambientLight =
    new THREE.HemisphereLight(
      0xbfe7ff,
      0x445544,
      1.4
    );


  scene.add(
    ambientLight
  );


  sunLight =
    new THREE.DirectionalLight(
      0xffffff,
      2
    );


  sunLight.position.set(
    100,
    150,
    80
  );


  sunLight.castShadow =
    true;


  sunLight.shadow.mapSize.width =
    2048;

  sunLight.shadow.mapSize.height =
    2048;


  sunLight.shadow.camera.left =
    -150;

  sunLight.shadow.camera.right =
    150;

  sunLight.shadow.camera.top =
    150;

  sunLight.shadow.camera.bottom =
    -150;


  scene.add(
    sunLight
  );

}


/* =====================================================
   GROUND
===================================================== */

function createGround() {

  const ground =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        300,
        300
      ),

      new THREE.MeshStandardMaterial({
        color: 0x5f8f4f,
        roughness: 0.95
      })

    );


  ground.rotation.x =
    -Math.PI / 2;


  ground.receiveShadow =
    true;


  scene.add(
    ground
  );


  cityObjects.push(
    ground
  );

}


/* =====================================================
   ROAD
===================================================== */

function createRoad(
  x,
  z,
  width,
  depth
) {

  const road =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        width,
        0.05,
        depth
      ),

      new THREE.MeshStandardMaterial({
        color: 0x33363a,
        roughness: 0.9
      })

    );


  road.position.set(
    x,
    0.025,
    z
  );


  road.receiveShadow =
    true;


  scene.add(
    road
  );


  cityObjects.push(
    road
  );

}


/* =====================================================
   ROADS
===================================================== */

function createRoads() {

  createRoad(
    0,
    0,
    20,
    300
  );


  createRoad(
    0,
    0,
    300,
    20
  );


  createRoad(
    0,
    70,
    300,
    12
  );


  createRoad(
    0,
    -70,
    300,
    12
  );


  createRoad(
    70,
    0,
    12,
    300
  );


  createRoad(
    -70,
    0,
    12,
    300
  );

}


/* =====================================================
   BUILDING
===================================================== */

function createBuilding(
  x,
  z,
  width,
  height,
  depth,
  color
) {

  const building =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),

      new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.8
      })

    );


  building.position.set(
    x,
    height / 2,
    z
  );


  building.castShadow =
    true;

  building.receiveShadow =
    true;


  scene.add(
    building
  );


  buildings.push(
    building
  );


  return building;

}


/* =====================================================
   CITY BUILDINGS
===================================================== */

function createBuildings() {

  const colors = [
    0xd9d1bd,
    0xc7c7c7,
    0xe1b980,
    0xb7c4cf,
    0xd4a373
  ];


  const positions = [

    [-45, -45],
    [45, -45],

    [-45, 45],
    [45, 45],

    [-95, -35],
    [95, -35],

    [-95, 35],
    [95, 35],

    [-35, -100],
    [35, -100],

    [-35, 100],
    [35, 100]

  ];


  positions.forEach(
    (position, index) => {

      createBuilding(
        position[0],
        position[1],
        22,
        8 + (index % 3) * 4,
        22,
        colors[
          index %
          colors.length
        ]
      );

    }
  );

}


/* =====================================================
   SCHOOL
===================================================== */

function createSchool() {

  const school =
    createBuilding(
      -80,
      75,
      30,
      9,
      22,
      0xf0d58c
    );


  addLabel(
    school,
    "🏫 المدرسة"
  );

}


/* =====================================================
   HOME
===================================================== */

function createHome() {

  const home =
    createBuilding(
      75,
      75,
      20,
      6,
      18,
      0xc9875b
    );


  addLabel(
    home,
    "🏠 البيت"
  );

}


/* =====================================================
   MALL
===================================================== */

function createMall() {

  const mall =
    createBuilding(
      80,
      -80,
      38,
      12,
      28,
      0xb8c8d9
    );


  addLabel(
    mall,
    "🛍️ MALL"
  );

}


/* =====================================================
   SHOPS
===================================================== */

function createShops() {

  const shopPositions = [

    [-80, -80],
    [-80, -105],
    [80, -110],
    [110, -80]

  ];


  shopPositions.forEach(
    (position, index) => {

      const shop =
        createBuilding(
          position[0],
          position[1],
          15,
          5,
          14,
          0xd8895a
        );


      addLabel(
        shop,
        "🏪 SHOP"
      );

    }
  );

}


/* =====================================================
   POLICE
===================================================== */

function createPoliceStation() {

  const police =
    createBuilding(
      80,
      35,
      25,
      7,
      20,
      0xd9d9d9
    );


  addLabel(
    police,
    "🚓 POLICE"
  );


  createPoliceCar(
    70,
    25
  );

  createPoliceCar(
    92,
    25
  );

}


/* =====================================================
   POLICE CAR
===================================================== */

function createPoliceCar(
  x,
  z
) {

  const car =
    new THREE.Group();


  car.position.set(
    x,
    0,
    z
  );


  const body =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        2.2,
        0.7,
        4
      ),

      new THREE.MeshStandardMaterial({
        color: 0xffffff
      })

    );


  body.position.y =
    0.7;


  body.castShadow =
    true;


  car.add(
    body
  );


  const stripe =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        2.25,
        0.25,
        1.3
      ),

      new THREE.MeshStandardMaterial({
        color: 0x111111
      })

    );


  stripe.position.y =
    0.9;


  stripe.position.z =
    0;


  car.add(
    stripe
  );


  const light =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        0.8,
        0.25,
        0.35
      ),

      new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        emissive: 0x2563eb,
        emissiveIntensity: 2
      })

    );


  light.position.y =
    1.25;


  car.add(
    light
  );


  scene.add(
    car
  );

}


/* =====================================================
   LABEL
===================================================== */

function addLabel(
  object,
  text
) {

  const canvas =
    document.createElement(
      "canvas"
    );


  canvas.width =
    512;

  canvas.height =
    128;


  const context =
    canvas.getContext(
      "2d"
    );


  context.fillStyle =
    "rgba(0,0,0,0.65)";


  context.roundRect(
    10,
    10,
    492,
    108,
    25
  );


  context.fill();


  context.fillStyle =
    "#ffffff";


  context.font =
    "bold 48px Arial";


  context.textAlign =
    "center";

  context.textBaseline =
    "middle";


  context.fillText(
    text,
    256,
    64
  );


  const texture =
    new THREE.CanvasTexture(
      canvas
    );


  const material =
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });


  const sprite =
    new THREE.Sprite(
      material
    );


  sprite.scale.set(
    7,
    1.75,
    1
  );


  sprite.position.y =
    object.position.y +
    7;


  scene.add(
    sprite
  );

}


/* =====================================================
   STREET LIGHT
===================================================== */

function createStreetLight(
  x,
  z
) {

  const group =
    new THREE.Group();


  group.position.set(
    x,
    0,
    z
  );


  const pole =
    new THREE.Mesh(

      new THREE.CylinderGeometry(
        0.08,
        0.12,
        5,
        10
      ),

      new THREE.MeshStandardMaterial({
        color: 0x222222
      })

    );


  pole.position.y =
    2.5;


  pole.castShadow =
    true;


  group.add(
    pole
  );


  const lamp =
    new THREE.PointLight(
      0xffd27d,
      0,
      18
    );


  lamp.position.y =
    5;


  lamp.castShadow =
    true;


  group.add(
    lamp
  );


  const bulb =
    new THREE.Mesh(

      new THREE.SphereGeometry(
        0.18,
        12,
        12
      ),

      new THREE.MeshStandardMaterial({
        color: 0xffffcc,
        emissive: 0xffd27d,
        emissiveIntensity: 2
      })

    );


  bulb.position.y =
    5;


  group.add(
    bulb
  );


  scene.add(
    group
  );


  streetLights.push(
    lamp
  );

}


/* =====================================================
   STREET LIGHTS
===================================================== */

function createStreetLights() {

  const positions = [

    [-12, -35],
    [12, -35],

    [-12, 35],
    [12, 35],

    [-35, -12],
    [-35, 12],

    [35, -12],
    [35, 12],

    [-65, -12],
    [-65, 12],

    [65, -12],
    [65, 12],

    [-12, -65],
    [12, -65],

    [-12, 65],
    [12, 65]

  ];


  positions.forEach(
    position => {

      createStreetLight(
        position[0],
        position[1]
      );

    }
  );

}


/* =====================================================
   PLAYER
===================================================== */

function createPlayer() {

  playerGroup =
    new THREE.Group();


  player =
    playerGroup;


  player.position.set(
    0,
    0,
    25
  );


  /* LEGS */

  const legMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x22252b
    });


  const leftLeg =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.35,
        1.1,
        0.35
      ),
      legMaterial
    );


  leftLeg.position.set(
    -0.22,
    0.55,
    0
  );


  leftLeg.castShadow =
    true;


  player.add(
    leftLeg
  );


  const rightLeg =
    leftLeg.clone();


  rightLeg.position.x =
    0.22;


  player.add(
    rightLeg
  );


  /* BODY */

  const shirt =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        0.9,
        1.15,
        0.5
      ),

      new THREE.MeshStandardMaterial({
        color: 0x2563eb
      })

    );


  shirt.position.y =
    1.45;


  shirt.castShadow =
    true;


  player.add(
    shirt
  );


  /* HEAD */

  const head =
    new THREE.Mesh(

      new THREE.SphereGeometry(
        0.38,
        20,
        20
      ),

      new THREE.MeshStandardMaterial({
        color: 0xd99b72
      })

    );


  head.position.y =
    2.35;


  head.castShadow =
    true;


  player.add(
    head
  );


  /* ARMS */

  const armMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xd99b72
    });


  const leftArm =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        0.25,
        1,
        0.25
      ),

      armMaterial

    );


  leftArm.position.set(
    -0.62,
    1.45,
    0
  );


  leftArm.castShadow =
    true;


  player.add(
    leftArm
  );


  const rightArm =
    leftArm.clone();


  rightArm.position.x =
    0.62;


  player.add(
    rightArm
  );


  scene.add(
    player
  );


  window.player =
    player;

}


/* =====================================================
   KEYBOARD
===================================================== */

function setupKeyboard() {

  window.addEventListener(
    "keydown",
    event => {

      keys[
        event.key.toLowerCase()
      ] = true;


      if (
        event.key.toLowerCase() ===
        " "
      ) {

        jump();

      }

    }
  );


  window.addEventListener(
    "keyup",
    event => {

      keys[
        event.key.toLowerCase()
      ] = false;

    }
  );

}


/* =====================================================
   INPUT
===================================================== */

function setupInput() {

  const joystick =
    document.getElementById(
      "joystick"
    );


  const stick =
    document.getElementById(
      "joystickStick"
    );


  if (!joystick || !stick) {

    return;

  }


  let active = false;


  const maxDistance =
    38;


  function moveStick(
    clientX,
    clientY
  ) {

    const rect =
      joystick.getBoundingClientRect();


    const centerX =
      rect.left +
      rect.width / 2;


    const centerY =
      rect.top +
      rect.height / 2;


    let dx =
      clientX -
      centerX;


    let dy =
      clientY -
      centerY;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (
      distance >
      maxDistance
    ) {

      dx =
        dx /
        distance *
        maxDistance;


      dy =
        dy /
        distance *
        maxDistance;

    }


    stick.style.transform =
      `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;


    window.input.x =
      dx /
      maxDistance;


    window.input.y =
      -dy /
      maxDistance;

  }


  function resetStick() {

    active = false;


    stick.style.transform =
      "translate(-50%, -50%)";


    window.input.x =
      0;


    window.input.y =
      0;

  }


  joystick.addEventListener(
    "pointerdown",
    event => {

      active = true;

      joystick.setPointerCapture(
        event.pointerId
      );

      moveStick(
        event.clientX,
        event.clientY
      );

    }
  );


  joystick.addEventListener(
    "pointermove",
    event => {

      if (!active) {

        return;

      }

      moveStick(
        event.clientX,
        event.clientY
      );

    }
  );


  joystick.addEventListener(
    "pointerup",
    resetStick
  );


  joystick.addEventListener(
    "pointercancel",
    resetStick
  );


  const jumpButton =
    document.getElementById(
      "jumpButton"
    );


  if (jumpButton) {

    jumpButton.addEventListener(
      "pointerdown",
      jump
    );

  }


  const sprintButton =
    document.getElementById(
      "sprintButton"
    );


  if (sprintButton) {

    sprintButton.addEventListener(
      "pointerdown",
      () => {

        sprinting = true;

      }
    );


    sprintButton.addEventListener(
      "pointerup",
      () => {

        sprinting = false;

      }
    );


    sprintButton.addEventListener(
      "pointercancel",
      () => {

        sprinting = false;

      }
    );

  }

}


/* =====================================================
   CAMERA CONTROL
   تحريك الكاميرا باللمس من اليمين
===================================================== */

function setupCameraControl() {

  let active = false;

  let lastX = 0;

  let lastY = 0;


  renderer.domElement.addEventListener(
    "pointerdown",
    event => {

      if (
        event.clientX <
        window.innerWidth * 0.45
      ) {

        return;

      }


      active = true;

      lastX =
        event.clientX;

      lastY =
        event.clientY;


      renderer.domElement.setPointerCapture(
        event.pointerId
      );

    }
  );


  renderer.domElement.addEventListener(
    "pointermove",
    event => {

      if (!active) {

        return;

      }


      const dx =
        event.clientX -
        lastX;


      const dy =
        event.clientY -
        lastY;


      lastX =
        event.clientX;


      lastY =
        event.clientY;


      cameraYaw -=
        dx *
        0.006;


      cameraPitch -=
        dy *
        0.004;


      cameraPitc
