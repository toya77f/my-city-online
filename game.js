import * as THREE from "three";

/* =====================================================
   MY CITY — GAME.JS
   ===================================================== */

window.THREE = THREE;


/* =====================================================
   HTML
   ===================================================== */

const game =
  document.getElementById("game");

const locationElement =
  document.getElementById("location");

const statsElement =
  document.getElementById("stats");

const messageElement =
  document.getElementById("message");

const missionElement =
  document.getElementById("mission");

const mapButton =
  document.getElementById("mapButton");

const mapScreen =
  document.getElementById("mapScreen");

const closeMap =
  document.getElementById("closeMap");

const mapPlayer =
  document.getElementById("mapPlayer");

const jumpButton =
  document.getElementById("jumpButton");

const sprintButton =
  document.getElementById("sprintButton");


/* =====================================================
   GAME STATE
   ===================================================== */

let gameStarted = true;

let money = 0;
let xp = 0;

let gameTime = 12;

let messageTimer = null;

let currentMission = 0;
let missionComplete = false;


/* =====================================================
   SCENE
   ===================================================== */

const scene =
  new THREE.Scene();

scene.background =
  new THREE.Color(0x82b5df);

scene.fog =
  new THREE.Fog(
    0x82b5df,
    50,
    200
  );


/* =====================================================
   CAMERA
   ===================================================== */

const camera =
  new THREE.PerspectiveCamera(
    65,
    window.innerWidth /
      window.innerHeight,
    0.1,
    500
  );

camera.position.set(
  0,
  5,
  17
);


/* =====================================================
   RENDERER
   ===================================================== */

const renderer =
  new THREE.WebGLRenderer({
    antialias: true,
    powerPreference:
      "high-performance"
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

game.appendChild(
  renderer.domElement
);


/* =====================================================
   LIGHTS
   ===================================================== */

const sun =
  new THREE.DirectionalLight(
    0xffffff,
    3
  );

sun.position.set(
  40,
  70,
  30
);

sun.castShadow = true;

sun.shadow.mapSize.width =
  2048;

sun.shadow.mapSize.height =
  2048;

scene.add(sun);


const ambient =
  new THREE.HemisphereLight(
    0xbad9ff,
    0x304020,
    1.8
  );

scene.add(ambient);


/* =====================================================
   DAY / NIGHT
   ===================================================== */

const streetLights = [];


function createStreetLight(
  x,
  z
) {

  const group =
    new THREE.Group();


  const pole =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.08,
        0.13,
        5,
        12
      ),
      new THREE.MeshStandardMaterial({
        color: 0x333333
      })
    );

  pole.position.y = 2.5;

  group.add(pole);


  const bulb =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.25,
        16,
        16
      ),
      new THREE.MeshStandardMaterial({
        color: 0xffefb0,
        emissive: 0xffb52e,
        emissiveIntensity: 0.2
      })
    );

  bulb.position.y = 5;

  group.add(bulb);


  const light =
    new THREE.PointLight(
      0xffc875,
      0,
      18
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
    light,
    bulb
  });

}


for (
  let i = -140;
  i <= 140;
  i += 20
) {

  createStreetLight(
    -7,
    i
  );

  createStreetLight(
    7,
    i
  );

}


function updateDayNight(
  delta
) {

  gameTime +=
    delta * 0.08;


  if (
    gameTime >= 24
  ) {

    gameTime = 0;

  }


  const daylight =
    Math.max(
      0,
      Math.sin(
        (
          gameTime - 6
        ) /
        24 *
        Math.PI *
        2
      )
    );


  const night =
    1 - daylight;


  const dayColor =
    new THREE.Color(
      0x82b5df
    );

  const nightColor =
    new THREE.Color(
      0x07101f
    );


  scene.background =
    dayColor.clone().lerp(
      nightColor,
      night
    );


  scene.fog.color =
    scene.background;


  sun.intensity =
    0.25 +
    daylight * 2.75;


  ambient.intensity =
    0.4 +
    daylight * 1.5;


  for (
    const lamp of
    streetLights
  ) {

    lamp.light.intensity =
      night > 0.5
        ? 2.8
        : 0;


    lamp.bulb.material
      .emissiveIntensity =
      night > 0.5
        ? 2.5
        : 0.2;

  }

}


/* =====================================================
   GROUND
   ===================================================== */

const ground =
  new THREE.Mesh(
    new THREE.PlaneGeometry(
      320,
      320
    ),
    new THREE.MeshStandardMaterial({
      color: 0x4f7449,
      roughness: 0.95
    })
  );

ground.rotation.x =
  -Math.PI / 2;

ground.receiveShadow =
  true;

scene.add(ground);


/* =====================================================
   ROADS
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
        0.08,
        depth
      ),
      new THREE.MeshStandardMaterial({
        color: 0x292a2d,
        roughness: 0.95
      })
    );

  road.position.set(
    x,
    0.04,
    z
  );

  road.receiveShadow =
    true;

  scene.add(road);

}


createRoad(
  0,
  0,
  22,
  320
);

createRoad(
  0,
  0,
  320,
  22
);

createRoad(
  55,
  0,
  12,
  320
);

createRoad(
  -55,
  0,
  12,
  320
);

createRoad(
  0,
  55,
  320,
  12
);

createRoad(
  0,
  -55,
  320,
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

  const building =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      new THREE.MeshStandardMaterial({
        color,
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

  scene.add(building);

}


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
   PLAYER
   ===================================================== */

const player =
  new THREE.Group();

player.position.set(
  0,
  0,
  10
);

scene.add(player);


/* =====================================================
   PLAYER MATERIALS
   ===================================================== */

const skin =
  new THREE.MeshStandardMaterial({
    color: 0xc98c70
  });

const shirt =
  new THREE.MeshStandardMaterial({
    color: 0x8e4da8
  });

const pants =
  new THREE.MeshStandardMaterial({
    color: 0x252a42
  });

const shoes =
  new THREE.MeshStandardMaterial({
    color: 0x111111
  });

const hair =
  new THREE.MeshStandardMaterial({
    color: 0x251812
  });


/* BODY */

const body =
  new THREE.Mesh(
    new THREE.CapsuleGeometry(
      0.55,
      0.8,
      8,
      16
    ),
    shirt
  );

body.position.y =
  1.55;

body.scale.set(
  0.9,
  1.05,
  0.65
);

body.castShadow =
  true;

player.add(body);


/* HEAD */

const head =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      0.48,
      24,
      24
    ),
    skin
  );

head.position.y =
  2.6;

head.castShadow =
  true;

player.add(head);


/* HAIR */

const hairMesh =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      0.51,
      24,
      24
    ),
    hair
  );

hairMesh.position.y =
  2.78;

hairMesh.scale.y =
  0.8;

player.add(hairMesh);


/* ARMS */

function createArm(
  x
) {

  const arm =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.14,
        0.75,
        8,
        12
      ),
      skin
    );

  arm.position.set(
    x,
    1.55,
    0
  );

  player.add(arm);

}


createArm(-0.68);
createArm(0.68);


/* LEGS */

function createLeg(
  x
) {

  const leg =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.19,
        0.9,
        8,
        12
      ),
      pants
    );

  leg.position.set(
    x,
    0.58,
    0
  );

  player.add(leg);

}


createLeg(-0.28);
createLeg(0.28);


/* SHOES */

function createShoe(
  x
) {

  const shoe =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.38,
        0.18,
        0.65
      ),
      shoes
    );

  shoe.position.set(
    x,
    0.1,
    -0.1
  );

  player.add(shoe);

}


createShoe(-0.28);
createShoe(0.28);


/* =====================================================
   INPUT
   ===================================================== */

const input = {

  x: 0,
  y: 0,
  sprint: false

};


/* =====================================================
   CAMERA
   ===================================================== */

let cameraYaw = 0;

let cameraPitch = 0.25;

const cameraDistance = 7.5;

const cameraHeight = 4.3;


/* =====================================================
   JOYSTICK
   ===================================================== */

let joystickPointer =
  null;

let cameraPointer =
  null;

let lastCameraX = 0;

let lastCameraY = 0;


function resetJoystick() {

  input.x = 0;

  input.y = 0;


  const stick =
    document.getElementById(
      "joystickStick"
    );


  if (
    stick
  ) {

    stick.style.transform =
      "translate(-50%, -50%)";

  }

}


function updateJoystick(
  touch
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
    touch.clientX -
    centerX;


  let dy =
    touch.clientY -
    centerY;


  const max =
    48;


  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );


  if (
    distance > max
  ) {

    dx =
      dx / distance *
      max;

    dy =
      dy / distance *
      max;

  }


  input.x =
    dx / max;

  input.y =
    -dy / max;


  joystickStick.style.transform =
    `translate(
      calc(-50% + ${dx}px),
      calc(-50% + ${dy}px)
    )`;

}


if (
  joystick
) {

  joystick.addEventListener(
    "touchstart",
    event => {

      const touch =
        event.changedTouches[0];

      joystickPointer =
        touch.identifier;

      updateJoystick(
        touch
      );

    },
    {
      passive: true
    }
  );


  joystick.addEventListener(
    "touchmove",
    event => {

      for (
        const touch of
        event.touches
      ) {

        if (
          touch.identifier ===
          joystickPointer
        ) {

          updateJoystick(
            touch
          );

        }

      }

    },
    {
      passive: true
    }
  );


  joystick.addEventListener(
    "touchend",
    () => {

      joystickPointer =
        null;

      resetJoystick();

    },
    {
      passive: true
    }
  );

}


/* =====================================================
   CAMERA TOUCH
   ===================================================== */

window.addEventListener(
  "touchstart",
  event => {

    for (
      const touch of
      event.changedTouches
    ) {

      if (
        touch.clientX >
        window.innerWidth / 2
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


window.addEventListener(
  "touchmove",
  event => {

    if (
      cameraPointer ===
      null
    ) {

      return;

    }


    for (
      const touch of
      event.touches
    ) {

      if (
        touch.identifier !==
        cameraPointer
      ) {

        continue;

      }


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
        THREE.MathUtils.clamp(
          cameraPitch,
          -0.3,
          0.65
        );


      lastCameraX =
        touch.clientX;

      lastCameraY =
        touch.clientY;

    }

  },
  {
    passive: true
  }
);


window.addEventListener(
  "touchend",
  event => {

    for (
      const touch of
        event.changedTouches
    ) {

      if (
        touch.identifier ===
        cameraPointer
      ) {

        cameraPointer =
          null;

      }

    }

  },
  {
    passive: true
  }
);


/* =====================================================
   KEYBOARD
   ===================================================== */

window.addEventListener(
  "keydown",
  event => {

    const key =
      event.key.toLowerCase();


    if (
      key === "w" ||
      key === "arrowup"
    ) {

      input.y = 1;

    }


    if (
      key === "s" ||
      key === "arrowdown"
    ) {

      input.y = -1;

    }


    if (
      key === "a" ||
      key === "arrowleft"
    ) {

      input.x = -1;

    }


    if (
      key === "d" ||
      key === "arrowright"
    ) {

      input.x = 1;

    }


    if (
      key === "shift"
    ) {

      input.sprint =
        true;

    }


    if (
      key === " "
    ) {

      jump();

    }

  }
);


window.addEventListener(
  "keyup",
  event => {

    const key =
      event.key.toLowerCase();


    if (
      key === "w" ||
      key === "arrowup" ||
      key === "s" ||
      key === "arrowdown"
    ) {

      input.y = 0;

    }


    if (
      key === "a" ||
      key === "arrowleft" ||
      key === "d" ||
      key === "arrowright"
    ) {

      input.x = 0;

    }


    if (
      key === "shift"
    ) {

      input.sprint =
        false;

    }

  }
);


/* =====================================================
   JUMP
   ===================================================== */

let verticalVelocity = 0;

let grounded = true;


function jump() {

  if (
    window.VehicleSystem &&
    window.VehicleSystem.driving
  ) {

    return;

  }


  if (
    !grounded
  ) {

    return;

  }


  verticalVelocity =
    8;

  grounded =
    false;

}


if (
  jumpButton
) {

  jumpButton.addEventListener(
    "click",
    jump
  );

}


/* =====================================================
   PLAYER MOVEMENT
   ===================================================== */

function movePlayer(
  delta
) {

  if (
    window.VehicleSystem &&
    window.VehicleSystem.driving
  ) {

    return;

  }


  const length =
    Math.sqrt(
      input.x * input.x +
      input.y * input.y
    );


  if (
    length > 0.05
  ) {

    const speed =
      input.sprint
        ? 11
        : 6.5;


    const forward =
      new THREE.Vector3();


    camera.getWorldDirection(
      forward
    );


    forward.y = 0;

    forward.normalize();


    const right =
      new THREE.Vector3(
        forward.z,
        0,
        -forward.x
      );


    const movement =
      new THREE.Vector3();


    movement.addScaledVector(
      right,
      input.x
    );


    movement.addScaledVector(
      forward,
      input.y
    );


    if (
      movement.lengthSq() > 0
    ) {

      movement.normalize();


      player.position.addScaledVector(
        movement,
        speed * delta
      );


      const target =
        Math.atan2(
          movement.x,
          movement.z
        );


      let difference =
        target -
        player.rotation.y;


      while (
        difference > Math.PI
      ) {

        difference -=
          Math.PI * 2;

      }


      while (
        difference < -Math.PI
      ) {

        difference +=
          Math.PI * 2;

      }


      player.rotation.y +=
        difference *
        Math.min(
          delta * 12,
          1
        );

    }

  }


  verticalVelocity -=
    18 * delta;


  player.position.y +=
    verticalVelocity *
    delta;


  if (
    player.position.y <= 0
  ) {

    player.position.y =
      0;

    verticalVelocity =
      0;

    grounded =
      true;

  }

}


/* =====================================================
   CAMERA FOLLOW
   ===================================================== */

function updateCamera() {

  if (
    window.VehicleSystem &&
    window.VehicleSystem.driving
  ) {

    return;

  }


  const offset =
    new THREE.Vector3(
      Math.sin(cameraYaw) *
        cameraDistance,

      cameraHeight +
        cameraPitch * 5,

      Math.cos(cameraYaw) *
        cameraDistance
    );


  const desired =
    player.position
      .clone()
      .add(offset);


  camera.position.lerp(
    desired,
    0.12
  );


  camera.lookAt(
    player.position.x,
    player.position.y + 1.45,
    player.position.z
  );

}


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

  const building =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      new THREE.MeshStandardMaterial({
        color
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

}


createBuilding(
  -32,
  -28,
  14,
  5,
  11,
  0xe2c0aa
);

createBuilding(
  32,
  -30,
  25,
  8,
  16,
  0xd5d9df
);

createBuilding(
  55,
  35,
  35,
  12,
  24,
  0x777b87
);

createBuilding(
  -65,
  65,
  22,
  8,
  15,
  0x596477
);

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
   SHOPS
   ===================================================== */

createBuilding(
  -32,
  30,
  10,
  5,
  9,
  0x47729a
);

createBuilding(
  -48,
  30,
  10,
  5,
  9,
  0x9a5e65
);

createBuilding(
  15,
  35,
  10,
  5,
  9,
  0x8067a4
);


/* =====================================================
   MISSIONS
   ===================================================== */

const missions = [

  {
    name: "البيت",
    text: "اذهب إلى البيت",
    position:
      new THREE.Vector3(
        -32,
        0,
        -28
      ),
    reward: 100
  },

  {
    name: "المدرسة",
    text: "اذهب إلى المدرسة",
    position:
      new THREE.Vector3(
        32,
        0,
        -30
      ),
    reward: 150
  },

  {
    name: "المول",
    text: "اذهب إلى المول",
    position:
      new THREE.Vector3(
        55,
        0,
        35
      ),
    reward: 300
  },

  {
    name: "الشرطة",
    text: "اذهب إلى قسم الشرطة",
    position:
      new THREE.Vector3(
        -65,
        0,
        65
      ),
    reward: 500
  }

];


const missionMarker =
  new THREE.Mesh(
    new THREE.TorusGeometry(
      2.2,
      0.2,
      16,
      32
    ),
    new THREE.MeshBasicMaterial({
      color: 0xffd21f
    })
  );


missionMarker.rotation.x =
  Math.PI / 2;

missionMarker.position.y =
  0.2;

scene.add(
  missionMarker
);


function showMission() {

  const mission =
    missions[currentMission];


  if (
    !mission
  ) {

    missionElement.textContent =
      "🏆 خلصت كل المهمات!";

    missionMarker.visible 
