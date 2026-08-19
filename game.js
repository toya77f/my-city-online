import * as THREE from "three";

/* =====================================================
   GLOBAL GAME OBJECTS
===================================================== */

const game = document.getElementById("game");
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const mapButton = document.getElementById("mapButton");
const mapScreen = document.getElementById("mapScreen");
const closeMap = document.getElementById("closeMap");

const locationText = document.getElementById("location");
const missionBox = document.getElementById("mission");
const message = document.getElementById("message");
const mapPlayer = document.getElementById("mapPlayer");


/* =====================================================
   SCENE
===================================================== */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x82b5df);

scene.fog = new THREE.Fog(
  0x82b5df,
  35,
  180
);


/* =====================================================
   CAMERA
===================================================== */

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);

camera.position.set(
  0,
  5,
  18
);


/* =====================================================
   RENDERER
===================================================== */

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

game.appendChild(
  renderer.domElement
);


/* =====================================================
   MAKE VARIABLES AVAILABLE TO vehicles.js
===================================================== */

window.scene = scene;
window.camera = camera;
window.renderer = renderer;


/* =====================================================
   GAME STATE
===================================================== */

let gameStarted = false;

let money = 0;
let xp = 0;

let currentMission = 0;
let missionCompleted = false;

let timeOfDay = 8;

let isNight = false;


/* =====================================================
   LIGHTING
===================================================== */

const sun = new THREE.DirectionalLight(
  0xffffff,
  2.8
);

sun.position.set(
  40,
  70,
  30
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

scene.add(sun);


const ambient = new THREE.HemisphereLight(
  0xbad9ff,
  0x293126,
  1.8
);

scene.add(ambient);


/* =====================================================
   DAY / NIGHT
===================================================== */

const streetLights = [];
const buildingLights = [];


function updateDayNight(delta) {

  timeOfDay += delta * 0.08;

  if (timeOfDay >= 24) {
    timeOfDay = 0;
  }


  const daylight = Math.max(
    0,
    Math.sin(
      ((timeOfDay - 6) / 24) *
      Math.PI *
      2
    )
  );


  const nightAmount = 1 - daylight;


  const dayColor =
    new THREE.Color(0x82b5df);

  const nightColor =
    new THREE.Color(0x08101f);


  scene.background =
    dayColor.clone().lerp(
      nightColor,
      nightAmount
    );


  scene.fog.color =
    scene.background;


  sun.intensity =
    0.35 + daylight * 2.7;


  ambient.intensity =
    0.45 + daylight * 1.4;


  isNight =
    nightAmount > 0.55;


  updateStreetLights();
  updateBuildingLights();
}


/* =====================================================
   GROUND
===================================================== */

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(
    300,
    300
  ),
  new THREE.MeshStandardMaterial({
    color: 0x4e7448,
    roughness: 0.95
  })
);

ground.rotation.x =
  -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);


/* =====================================================
   ROAD FUNCTION
===================================================== */

function createRoad(
  x,
  z,
  width,
  depth
) {

  const road = new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      0.08,
      depth
    ),
    new THREE.MeshStandardMaterial({
      color: 0x28292d,
      roughness: 0.95
    })
  );

  road.position.set(
    x,
    0.04,
    z
  );

  road.receiveShadow = true;

  scene.add(road);
}


/* =====================================================
   CITY ROADS
===================================================== */

createRoad(
  0,
  0,
  22,
  300
);

createRoad(
  0,
  0,
  300,
  22
);

createRoad(
  55,
  0,
  12,
  300
);

createRoad(
  -55,
  0,
  12,
  300
);

createRoad(
  0,
  55,
  300,
  12
);

createRoad(
  0,
  -55,
  300,
  12
);


/* =====================================================
   BUILDINGS
===================================================== */

function createBuilding(
  x,
  z,
  width,
  height,
  depth,
  color
) {

  const building = new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      height,
      depth
    ),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.82
    })
  );

  building.position.set(
    x,
    height / 2,
    z
  );

  building.castShadow = true;
  building.receiveShadow = true;

  scene.add(building);
}


/* =====================================================
   CITY BUILDINGS
===================================================== */

createBuilding(
  75,
  75,
  25,
  25,
  20,
  0x8c7270
);

createBuilding(
  -75,
  75,
  22,
  30,
  20,
  0x737c89
);

createBuilding(
  75,
  -75,
  25,
  20,
  22,
  0x9a806d
);

createBuilding(
  -75,
  -75,
  20,
  24,
  20,
  0x777f67
);


/* =====================================================
   HOUSE
===================================================== */

const house = new THREE.Group();


const houseWalls = new THREE.Mesh(
  new THREE.BoxGeometry(
    14,
    5,
    11
  ),
  new THREE.MeshStandardMaterial({
    color: 0xe2c0aa
  })
);

houseWalls.position.y = 2.5;

houseWalls.castShadow = true;

house.add(houseWalls);


const houseRoof = new THREE.Mesh(
  new THREE.ConeGeometry(
    10,
    3.5,
    4
  ),
  new THREE.MeshStandardMaterial({
    color: 0x7e3545
  })
);

houseRoof.rotation.y =
  Math.PI / 4;

houseRoof.position.y =
  6.8;

houseRoof.castShadow = true;

house.add(houseRoof);


house.position.set(
  -32,
  0,
  -28
);

scene.add(house);


/* =====================================================
   SCHOOL
===================================================== */

const school = new THREE.Group();


const schoolBody = new THREE.Mesh(
  new THREE.BoxGeometry(
    25,
    8,
    16
  ),
  new THREE.MeshStandardMaterial({
    color: 0xd5d9df
  })
);

schoolBody.position.y = 4;

schoolBody.castShadow = true;

school.add(schoolBody);


const schoolRoof = new THREE.Mesh(
  new THREE.BoxGeometry(
    26,
    0.8,
    17
  ),
  new THREE.MeshStandardMaterial({
    color: 0x313848
  })
);

schoolRoof.position.y =
  8.4;

school.add(schoolRoof);


school.position.set(
  32,
  0,
  -30
);

scene.add(school);


/* =====================================================
   SCHOOL CLASSROOMS
===================================================== */

function createClassroom(
  x,
  z
) {

  const room = new THREE.Mesh(
    new THREE.BoxGeometry(
      5,
      3,
      4
    ),
    new THREE.MeshStandardMaterial({
      color: 0xbfc5cc
    })
  );

  room.position.set(
    x,
    1.5,
    z
  );

  room.castShadow = true;

  scene.add(room);
}


createClassroom(
  23,
  -22
);

createClassroom(
  33,
  -22
);

createClassroom(
  43,
  -22
);


/* =====================================================
   MALL
===================================================== */

const mall = new THREE.Group();


const mallBody = new THREE.Mesh(
  new THREE.BoxGeometry(
    35,
    12,
    24
  ),
  new THREE.MeshStandardMaterial({
    color: 0x777b87,
    metalness: 0.15,
    roughness: 0.6
  })
);

mallBody.position.y = 6;

mallBody.castShadow = true;

mall.add(mallBody);


const mallEntrance = new THREE.Mesh(
  new THREE.BoxGeometry(
    12,
    7,
    1
  ),
  new THREE.MeshStandardMaterial({
    color: 0x6c3f8a,
    emissive: 0x241032,
    emissiveIntensity: 0.5
  })
);

mallEntrance.position.set(
  0,
  3.5,
  12.3
);

mall.add(mallEntrance);


mall.position.set(
  55,
  0,
  35
);

scene.add(mall);


/* =====================================================
   SHOPS
===================================================== */

function createShop(
  x,
  z,
  color
) {

  const shop = new THREE.Mesh(
    new THREE.BoxGeometry(
      10,
      5,
      9
    ),
    new THREE.MeshStandardMaterial({
      color
    })
  );

  shop.position.set(
    x,
    2.5,
    z
  );

  shop.castShadow = true;

  scene.add(shop);
}


createShop(
  -32,
  30,
  0x47729a
);

createShop(
  -48,
  30,
  0x9a5e65
);

createShop(
  15,
  35,
  0x8067a4
);


/* =====================================================
   STREET LIGHTS
===================================================== */

function createStreetLight(
  x,
  z
) {

  const group =
    new THREE.Group();


  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.08,
      0.13,
      5,
      12
    ),
    new THREE.MeshStandardMaterial({
      color: 0x34363a,
      metalness: 0.7
    })
  );

  pole.position.y = 2.5;

  group.add(pole);


  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.25,
      16,
      16
    ),
    new THREE.MeshStandardMaterial({
      color: 0xffedb0,
      emissive: 0xffb52e,
      emissiveIntensity: 0
    })
  );

  lamp.position.y = 5.05;

  group.add(lamp);


  const light = new THREE.PointLight(
    0xffd27d,
    0,
    15,
    2
  );

  light.position.y = 5;

  group.add(light);


  group.position.set(
    x,
    0,
    z
  );

  scene.add(group);


  streetLights.push({
    lamp,
    light
  });
}


for (
  let z = -130;
  z <= 130;
  z += 20
) {

  createStreetLight(
    -7,
    z
  );

  createStreetLight(
    7,
    z
  );
}


for (
  let x = -130;
  x <= 130;
  x += 20
) {

  createStreetLight(
    x,
    -7
  );

  createStreetLight(
    x,
    7
  );
}


function updateStreetLights() {

  for (
    const item of streetLights
  ) {

    item.light.intensity =
      isNight ? 2.8 : 0;

    item.lamp.material.emissiveIntensity =
      isNight ? 2.2 : 0.1;
  }
}


/* =====================================================
   BUILDING LIGHTS
===================================================== */

function addBuildingLight(
  x,
  y,
  z
) {

  const light = new THREE.PointLight(
    0xffd68a,
    0,
    18,
    2
  );

  light.position.set(
    x,
    y,
    z
  );

  scene.add(light);

  buildingLights.push(light);
}


addBuildingLight(
  -32,
  4,
  -22
);

addBuildingLight(
  32,
  6,
  -21
);

addBuildingLight(
  55,
  9,
  48
);

addBuildingLight(
  -32,
  4,
  35
);

addBuildingLight(
  -48,
  4,
  35
);


function updateBuildingLights() {

  for (
    const light of buildingLights
  ) {

    light.intensity =
      isNight ? 3 : 0;
  }
}


/* =====================================================
   PLAYER
===================================================== */

const player =
  new THREE.Group();

scene.add(player);

window.player = player;


/* =====================================================
   PLAYER MATERIALS
===================================================== */

const skinMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xc98d70,
    roughness: 0.72
  });


const shirtMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x8d4ca4,
    roughness: 0.8
  });


const pantsMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x252b45,
    roughness: 0.9
  });


const shoeMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x141414
  });


const hairMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x251814
  });


/* =====================================================
   HEAD
===================================================== */

const head = new THREE.Mesh(
  new THREE.SphereGeometry(
    0.48,
    32,
    32
  ),
  skinMaterial
);

head.position.y = 2.65;

head.castShadow = true;

player.add(head);


/* =====================================================
   HAIR
===================================================== */

const hair = new THREE.Mesh(
  new THREE.SphereGeometry(
    0.51,
    32,
    24
  ),
  hairMaterial
);

hair.position.y = 2.82;

hair.scale.set(
  1,
  0.82,
  1
);

hair.castShadow = true;

player.add(hair);


/* =====================================================
   FACE
===================================================== */

function createEye(x) {

  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.055,
      16,
      16
    ),
    new THREE.MeshBasicMaterial({
      color: 0x111111
    })
  );

  eye.position.set(
    x,
    2.66,
    -0.44
  );

  player.add(eye);
}


createEye(-0.16);
createEye(0.16);


/* =====================================================
   BODY / SHIRT
===================================================== */

const body = new THREE.Mesh(
  new THREE.CapsuleGeometry(
    0.57,
    0.95,
    8,
    16
  ),
  shirtMaterial
);

body.position.y = 1.55;

body.scale.set(
  0.9,
  1,
  0.6
);

body.castShadow = true;

player.add(body);


/* =====================================================
   NECK
===================================================== */

const neck = new THREE.Mesh(
  new THREE.CylinderGeometry(
    0.17,
    0.17,
    0.22,
    12
  ),
  skinMaterial
);

neck.position.y = 2.25;

player.add(neck);


/* =====================================================
   ARMS
===================================================== */

function createArm(x) {

  const arm = new THREE.Mesh(
    new THREE.CapsuleGeometry(
      0.14,
      0.8,
      8,
      12
    ),
    skinMaterial
  );

  arm.position.set(
    x,
    1.55,
    0
  );

  arm.rotation.z =
    x < 0
      ? -0.08
      : 0.08;

  arm.castShadow = true;

  player.add(arm);
}


createArm(-0.68);
createArm(0.68);


/* =====================================================
   PANTS / LEGS
===================================================== */

function createLeg(x) {

  const leg = new THREE.Mesh(
    new THREE.CapsuleGeometry(
      0.2,
      0.95,
      8,
      12
    ),
    pantsMaterial
  );

  leg.position.set(
    x,
    0.55,
    0
  );

  leg.castShadow = true;

  player.add(leg);
}


createLeg(-0.28);
createLeg(0.28);


/* =====================================================
   SHOES
===================================================== */

function createShoe(x) {

  const shoe = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.38,
      0.18,
      0.65
    ),
    shoeMaterial
  );

  shoe.position.set(
    x,
    0.08,
    -0.08
  );

  shoe.castShadow = true;

  player.add(shoe);
}


createShoe(-0.28);
createShoe(0.28);


/* =====================================================
   PLAYER START
===================================================== */

player.position.set(
  0,
  0,
  10
);


/* =====================================================
   INPUT
===================================================== */

const input = {
  x: 0,
  y: 0,
  sprint: false
};

window.input = input;


/* =====================================================
   CAMERA CONTROL
===================================================== */

let cameraYaw = 0;

let cameraPitch = 0.25;

const cameraDistance = 8;

const cameraHeight = 4.5;


/* =====================================================
   JOYSTICK
===================================================== */

const joystick =
  document.getElementById("joystick");

const stick =
  document.getElementById("joystickStick");

let joystickPointer = null;

let cameraPointer = null;

let lastCameraX = 0;

let lastCameraY = 0;


function updateJoystick(touch) {

  if (!joystick || !stick) {
    return;
  }


  const rect =
    joystick.getBoundingClientRect();


  const centerX =
    rect.left +
    rect.width / 2;


  const centerY =
    rect.top +
    rect.height / 2;


  let dx =
    touch.clientX -
    centerX;


  let dy =
    touch.clientY -
    centerY;


  const max = 48;


  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );


  if (distance > max) {

    dx =
      (dx / distance) *
      max;

    dy =
      (dy / distance) *
      max;
  }


  input.x =
    dx / max;

  input.y =
    -dy / max;


  stick.style.transform =
    `translate(
      calc(-50% + ${dx}px),
      calc(-50% + ${dy}px)
    )`;
}


function resetJoystick() {

  input.x = 0;
  input.y = 0;


  if (stick) {

    stick.style.transform =
      "translate(-50%, -50%)";
  }
}


function getTouchById(
  touches,
  id
) {

  for (
    const touch of touches
  ) {

    if (
      touch.identifier === id
    ) {

      return touch;
    }
  }


  return null;
}


/* =====================================================
   TOUCH START
===================================================== */

window.addEventListener(
  "touchstart",
  event => {

    for (
      const touch of event.changedTouches
    ) {

      if (joystick) {

        const rect =
          joystick.getBoundingClientRect();


        const inside =
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom;


        if (
          inside &&
          joystickPointer === null
        ) {

          joystickPointer =
            touch.identifier;

          updateJoystick(touch);

          continue;
        }
      }


      /* RIGHT SIDE = CAMERA */

      if (
        touch.clientX >
          window.innerWidth / 2 &&
        cameraPointer === null
      ) {

        cameraPointer =
          touch.identifier;

        lastCameraX =
          touch.clientX;

        lastCameraY =
          touch.clientY;
      }
    }
  },
  {
    passive: true
  }
);


/* =====================================================
   TOUCH MOVE
===================================================== */

window.addEventListener(
  "touchmove",
  event => {

    if (
      joystickPointer !== null
    ) {

      const touch =
        getTouchById(
          event.touches,
          joystickPointer
        );


      if (touch) {

        updateJoystick(touch);
      }
    }


    if (
      cameraPointer !== null
    ) {

      const touch =
        getTouchById(
          event.touches,
          cameraPointer
        );


      if (touch) {

        const dx =
          touch.clientX -
          lastCameraX;


        const dy =
          touch.clientY -
          lastCameraY;


        cameraYaw -=
          dx * 0.006;


        cameraPitch -=
          dy * 0.006;


        cameraPitch =
          Math.max(
            -0.25,
            Math.min(
              0.65,
              cameraPitch
            )
          );


        lastCameraX =
          touch.clientX;

        lastCameraY =
          touch.clientY;
      }
    }
  },
  {
    passive: true
  }
);


/* =====================================================
   TOUCH END
===================================================== */

window.addEventListener(
  "touchend",
  event => {

    for (
      const touch of event.changedTouches
    ) {

      if (
        touch.identifier ===
        joystickPointer
      ) {

        joystickPointer = null;

        resetJoystick();
      }


      if (
        touch.identifier ===
        cameraPointer
      ) {

        cameraPointer = null;
      }
    }
  },
  {
    passive: true
  }
);


/* =====================================================
   PLAYER MOVEMENT
===================================================== */

let velocityY = 0;

let grounded = true;


function movePlayer(delta) {

  /* لا تحرك الشخصية وهي راكبة */

  if (
    window.VehicleSy
