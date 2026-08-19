import * as THREE from "three";

/* =========================================================
   MY CITY — GAME.JS
   النسخة المتوافقة مع vehicles.js
   ========================================================= */


/* =========================================================
   1. HTML
   ========================================================= */

const game = document.getElementById("game");
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");

const mapButton = document.getElementById("mapButton");
const mapScreen = document.getElementById("mapScreen");
const closeMap = document.getElementById("closeMap");

const joystick = document.getElementById("joystick");
const joystickStick =
  document.getElementById("joystickStick");

const jumpButton =
  document.getElementById("jumpButton");

const sprintButton =
  document.getElementById("sprintButton");

const locationElement =
  document.getElementById("location");

const missionElement =
  document.getElementById("mission");

const messageElement =
  document.getElementById("message");

const statsElement =
  document.getElementById("stats");

const mapPlayer =
  document.getElementById("mapPlayer");


/* =========================================================
   2. GAME STATE
   ========================================================= */

let gameStarted = false;

let money = 0;
let xp = 0;

let currentMission = 0;
let missionFinished = false;

let gameTime = 12;

let isNight = false;

let messageTimer = null;


/* =========================================================
   3. SCENE
   ========================================================= */

const scene = new THREE.Scene();

scene.background =
  new THREE.Color(0x82b5df);

scene.fog =
  new THREE.Fog(
    0x82b5df,
    45,
    190
  );


/* =========================================================
   4. CAMERA
   ========================================================= */

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


/* =========================================================
   5. RENDERER
   ========================================================= */

const renderer =
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

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

game.appendChild(
  renderer.domElement
);


/* =========================================================
   6. LIGHTS
   ========================================================= */

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

sun.shadow.camera.left =
  -120;

sun.shadow.camera.right =
  120;

sun.shadow.camera.top =
  120;

sun.shadow.camera.bottom =
  -120;

scene.add(sun);


const ambientLight =
  new THREE.HemisphereLight(
    0xbad9ff,
    0x283522,
    2
  );

scene.add(
  ambientLight
);


/* =========================================================
   7. DAY / NIGHT
   ========================================================= */

const streetLights = [];
const buildingLights = [];


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
        color: 0x333333,
        metalness: 0.7
      })
    );

  pole.position.y = 2.5;

  group.add(pole);


  const lamp =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.25,
        16,
        16
      ),
      new THREE.MeshStandardMaterial({
        color: 0xffefb0,
        emissive: 0xffb52e,
        emissiveIntensity: 0.1
      })
    );

  lamp.position.y = 5;

  group.add(lamp);


  const light =
    new THREE.PointLight(
      0xffc875,
      0,
      18,
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
  let z = -140;
  z <= 140;
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
  let x = -140;
  x <= 140;
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


function createBuildingLight(
  x,
  y,
  z
) {

  const light =
    new THREE.PointLight(
      0xffd58a,
      0,
      20,
      2
    );

  light.position.set(
    x,
    y,
    z
  );

  scene.add(light);

  buildingLights.push(
    light
  );

}


createBuildingLight(
  -32,
  4,
  -28
);

createBuildingLight(
  32,
  5,
  -30
);

createBuildingLight(
  55,
  8,
  35
);

createBuildingLight(
  -32,
  4,
  30
);


/* =========================================================
   DAY NIGHT UPDATE
   ========================================================= */

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
          (gameTime - 6) /
          24
        ) *
        Math.PI *
        2
      )
    );


  const nightAmount =
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
      nightAmount
    );


  scene.fog.color =
    scene.background;


  sun.intensity =
    0.3 +
    daylight * 2.7;


  ambientLight.intensity =
    0.4 +
    daylight * 1.5;


  isNight =
    nightAmount > 0.55;


  for (
    const item of streetLights
  ) {

    item.light.intensity =
      isNight
        ? 2.8
        : 0;


    item.lamp.material
      .emissiveIntensity =
      isNight
        ? 2.5
        : 0.1;

  }


  for (
    const light of buildingLights
  ) {

    light.intensity =
      isNight
        ? 3
        : 0;

  }

}


/* =========================================================
   8. GROUND
   ========================================================= */

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

ground.receiveShadow = true;

scene.add(
  ground
);


/* =========================================================
   9. ROADS
   ========================================================= */

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

  road.receiveShadow = true;

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


/* =========================================================
   10. BUILDINGS
   ========================================================= */

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

createBuilding(
  100,
  20,
  18,
  18,
  20,
  0x687080
);

createBuilding(
  -100,
  20,
  18,
  22,
  20,
  0x907060
);


/* =========================================================
   11. PLAYER
   ========================================================= */

const player =
  new THREE.Group();

player.name =
  "Player";

scene.add(
  player
);


/* =========================================================
   PLAYER MATERIALS
   ========================================================= */

const skinMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xc98c70,
    roughness: 0.75
  });


const shirtMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x8e4da8,
    roughness: 0.8
  });


const pantsMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x252a42,
    roughness: 0.9
  });


const shoeMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.9
  });


const hairMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x251812,
    roughness: 0.8
  });


/* =========================================================
   BODY
   ========================================================= */

const body =
  new THREE.Mesh(
    new THREE.CapsuleGeometry(
      0.55,
      0.8,
      8,
      16
    ),
    shirtMaterial
  );

body.position.y =
  1.55;

body.scale.set(
  0.9,
  1.05,
  0.65
);

body.castShadow = true;

player.add(body);


/* NECK */

const neck =
  new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.17,
      0.17,
      0.25,
      16
    ),
    skinMaterial
  );

neck.position.y =
  2.1;

player.add(neck);


/* HEAD */

const head =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      0.48,
      32,
      32
    ),
    skinMaterial
  );

head.position.y =
  2.62;

head.castShadow = true;

player.add(head);


/* HAIR */

const hair =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      0.51,
      32,
      32
    ),
    hairMaterial
  );

hair.position.y =
  2.78;

hair.scale.set(
  1,
  0.82,
  1
);

hair.castShadow = true;

player.add(hair);


/* EYES */

const eyeMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x111111
  });


function createEye(
  x
) {

  const eye =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.055,
        16,
        16
      ),
      eyeMaterial
    );

  eye.position.set(
    x,
    2.64,
    -0.44
  );

  player.add(eye);

}


createEye(-0.16);
createEye(0.16);


/* NOSE */

const nose =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      0.055,
      12,
      12
    ),
    skinMaterial
  );

nose.position.set(
  0,
  2.54,
  -0.47
);

player.add(nose);


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
      pantsMaterial
    );

  leg.position.set(
    x,
    0.58,
    0
  );

  leg.castShadow = true;

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
      shoeMaterial
    );

  shoe.position.set(
    x,
    0.1,
    -0.1
  );

  shoe.castShadow = true;

  player.add(shoe);

}


createShoe(-0.28);
createShoe(0.28);


/* START POSITION */

player.position.set(
  0,
  0,
  10
);


/* =========================================================
   12. INPUT
   ========================================================= */

const input = {

  x: 0,
  y: 0,
  sprint: false

};


/* =========================================================
   13. CAMERA
   ========================================================= */

let cameraYaw = 0;
let cameraPitch = 0.25;

const cameraDistance = 7.5;
const cameraHeight = 4.3;


/* =========================================================
   14. JOYSTICK
   ========================================================= */

let joystickPointer = null;

let cameraPointer = null;

let lastCameraX = 0;
let lastCameraY = 0;


function updateJoystick(
  touch
) {

  if (
    !joystick ||
    !joystickStick
  ) {

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


  const maxDistance = 48;


  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );


  if (
    distance > maxDistance
  ) {

    dx =
      dx / distance *
      maxDistance;

    dy =
      dy / distance *
      maxDistance;

  }


  input.x =
    dx / maxDistance;


  input.y =
    -dy / maxDistance;


  joystickStick.style.transform =
    `translate(
      calc(-50% + ${dx}px),
      calc(-50% + ${dy}px)
    )`;

}


function resetJoystick() {

  input.x = 0;
  input.y = 0;

  if (
    joystickStick
  ) {

    joystickStick.style.transform =
      "translate(-50%, -50%)";

  }

}


/* =========================================================
   TOUCH
   ========================================================= */

window.addEventListener(
  "touchstart",
  event => {

    for (
      const touch of
      event.changedTouches
    ) {

      if (
        joystick
      ) {

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

          updateJoystick(
            touch
          );

          continue;

        }

      }


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


window.addEventListener(
  "touchmove",
  event => {

    if (
      joystickPointer !== null
    ) {

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

    }


    if (
      cameraPointer !== null
    ) {

      for (
        const touch of
        event.touches
      ) {

        if (
          touch.identifier ===
          cameraPointer
        ) {

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

      }

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
        joystickPointer
      ) {

        joystickPointer =
          null;

        resetJoystick();

      }


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


/* =========================================================
   15. KEYBOARD
   ========================================================= */

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

      input.sprint = true;

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

      input.sprint = false;

    }

  }
);


/* =========================================================
   16. JUMP
   ========================================================= */

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


  verticalVelocity = 8;

  grounded = false;

}


if (
  jumpButton
) {

  jumpButton.addEventListener(
    "click",
    jump
  );

}


/* =========================================================
   17. PLAYER MOVEMENT
   ========================================================= */

function movePlayer(
  delta
) {

  if (
    window.VehicleSystem &&
    window.VehicleSystem.driving
  ) {

    return;

  }


  const magnitude =
    Math.sqrt(
      input.x * input.x +
      input.y * input.y
    );


  if (
    magnitude > 0.05
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


      const targetRotation =
        Math.atan2(
          movement.x,
          movement.z
        );


      let difference =
        targetRotation -
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
    verticalVelocity * delta;


  if (
    player.position.y <= 0
  ) {

    player.position.y = 0;

    verticalVelocity = 0;

    grounded = true;

  }

}


/* =========================================================
   18. CAMERA FOLLOW
   ===
