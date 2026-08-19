/* =========================================================
   MY CITY — VEHICLES.JS
   سيارات + ركوب + قيادة + خروج
   متوافق مع game.js
   ========================================================= */

window.VehicleSystem = {

  vehicles: [],
  currentVehicle: null,
  driving: false,

  speed: 0,

  maxSpeed: 18,
  acceleration: 20,
  brakePower: 25,
  turnSpeed: 2.2,

  interactDistance: 5,


  /* =======================================================
     CREATE VEHICLE
     ======================================================= */

  createVehicle(x, z, color = 0x2563eb) {

    const vehicle = new THREE.Group();

    vehicle.position.set(
      x,
      0,
      z
    );


    /* BODY */

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(
        2.3,
        0.7,
        4.3
      ),
      new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.15
      })
    );

    body.position.y = 0.75;

    body.castShadow = true;
    body.receiveShadow = true;

    vehicle.add(body);


    /* ROOF */

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(
        1.75,
        0.7,
        2.1
      ),
      new THREE.MeshStandardMaterial({
        color: 0x20242b,
        roughness: 0.4,
        metalness: 0.2
      })
    );

    roof.position.set(
      0,
      1.3,
      -0.1
    );

    roof.castShadow = true;

    vehicle.add(roof);


    /* WINDOWS */

    const glass = new THREE.MeshStandardMaterial({
      color: 0x4f86a6,
      transparent: true,
      opacity: 0.65,
      roughness: 0.15,
      metalness: 0.3
    });


    const frontWindow = new THREE.Mesh(
      new THREE.BoxGeometry(
        1.55,
        0.45,
        0.08
      ),
      glass
    );

    frontWindow.position.set(
      0,
      1.28,
      -1.15
    );

    frontWindow.rotation.x = -0.12;

    vehicle.add(frontWindow);


    const backWindow = new THREE.Mesh(
      new THREE.BoxGeometry(
        1.55,
        0.45,
        0.08
      ),
      glass
    );

    backWindow.position.set(
      0,
      1.28,
      0.95
    );

    backWindow.rotation.x = 0.12;

    vehicle.add(backWindow);


    /* WHEELS */

    const wheelPositions = [

      [-1.08, 0.45, -1.4],
      [ 1.08, 0.45, -1.4],
      [-1.08, 0.45,  1.4],
      [ 1.08, 0.45,  1.4]

    ];


    for (
      const pos of wheelPositions
    ) {

      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.43,
          0.43,
          0.3,
          20
        ),
        new THREE.MeshStandardMaterial({
          color: 0x111111,
          roughness: 0.95
        })
      );

      wheel.rotation.z =
        Math.PI / 2;

      wheel.position.set(
        pos[0],
        pos[1],
        pos[2]
      );

      wheel.castShadow = true;

      vehicle.add(wheel);

    }


    /* HEADLIGHTS */

    const headlightMaterial =
      new THREE.MeshStandardMaterial({

        color: 0xfff2bb,

        emissive: 0xffd35a,

        emissiveIntensity: 1.5

      });


    const leftHeadlight =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.45,
          0.2,
          0.08
        ),
        headlightMaterial
      );

    leftHeadlight.position.set(
      -0.7,
      0.82,
      -2.17
    );

    vehicle.add(
      leftHeadlight
    );


    const rightHeadlight =
      leftHeadlight.clone();

    rightHeadlight.position.x =
      0.7;

    vehicle.add(
      rightHeadlight
    );


    /* DATA */

    vehicle.userData = {

      isVehicle: true,

      occupied: false

    };


    this.vehicles.push(
      vehicle
    );

    scene.add(
      vehicle
    );


    return vehicle;

  },


  /* =======================================================
     CREATE CITY VEHICLES
     ======================================================= */

  createCityCars() {

    this.createVehicle(
      18,
      18,
      0xc93434
    );

    this.createVehicle(
      -18,
      18,
      0x2563eb
    );

    this.createVehicle(
      30,
      55,
      0xf2c94c
    );

    this.createVehicle(
      -35,
      55,
      0xe7e7e7
    );

    this.createVehicle(
      65,
      -15,
      0x21a366
    );

    this.createVehicle(
      -65,
      -15,
      0x8e44ad
    );

  },


  /* =======================================================
     FIND NEAREST CAR
     ======================================================= */

  getNearestVehicle() {

    let nearest = null;

    let distance =
      this.interactDistance;


    for (
      const vehicle of
      this.vehicles
    ) {

      if (
        vehicle.userData.occupied
      ) {

        continue;

      }


      const d =
        player.position.distanceTo(
          vehicle.position
        );


      if (
        d < distance
      ) {

        distance = d;

        nearest = vehicle;

      }

    }


    return nearest;

  },


  /* =======================================================
     ENTER
     ======================================================= */

  enterVehicle() {

    if (
      this.driving
    ) {

      return;

    }


    const vehicle =
      this.getNearestVehicle();


    if (
      !vehicle
    ) {

      showVehicleMessage(
        "🚗 قرب من العربية الأول"
      );

      return;

    }


    this.currentVehicle =
      vehicle;

    this.driving =
      true;

    this.speed =
      0;


    vehicle.userData.occupied =
      true;


    /*
      اللاعب يبقى مرتبط بالعربية
    */

    player.visible =
      false;


    scene.attach(
      vehicle
    );


    this.showExitButton();


    showVehicleMessage(
      "🚗 ركبت العربية! حرّك الـJoystick للقيادة"
    );

  },


  /* =======================================================
     EXIT
     ======================================================= */

  exitVehicle() {

    if (
      !this.driving ||
      !this.currentVehicle
    ) {

      return;

    }


    const vehicle =
      this.currentVehicle;


    const exitPosition =
      new THREE.Vector3(
        3,
        0,
        0
      );


    exitPosition.applyQuaternion(
      vehicle.quaternion
    );


    exitPosition.add(
      vehicle.position
    );


    scene.attach(
      player
    );


    player.visible =
      true;


    player.position.copy(
      exitPosition
    );


    vehicle.userData.occupied =
      false;


    this.currentVehicle =
      null;

    this.driving =
      false;

    this.speed =
      0;


    this.hideExitButton();


    showVehicleMessage(
      "🚶 نزلت من العربية"
    );

  },


  /* =======================================================
     DRIVE
     ======================================================= */

  updateDriving(delta) {

    if (
      !this.driving ||
      !this.currentVehicle
    ) {

      return;

    }


    const vehicle =
      this.currentVehicle;


    const throttle =
      input.y;

    const steering =
      input.x;


    /* ACCELERATION */

    if (
      Math.abs(throttle) > 0.05
    ) {

      this.speed +=
        throttle *
        this.acceleration *
        delta;

    } else {

      if (
        this.speed > 0
      ) {

        this.speed -=
          this.brakePower *
          delta;

      }


      if (
        this.speed < 0
      ) {

        this.speed +=
          this.brakePower *
          delta;

      }


      if (
        Math.abs(this.speed) < 0.1
      ) {

        this.speed = 0;

      }

    }


    /* LIMIT */

    this.speed =
      THREE.MathUtils.clamp(
        this.speed,
        -this.maxSpeed * 0.45,
        this.maxSpeed
      );


    /* STEERING */

    if (
      Math.abs(this.speed) > 0.2
    ) {

      const amount =
        steering *
        this.turnSpeed *
        delta *
        (
          Math.abs(this.speed) /
          this.maxSpeed
        );


      vehicle.rotation.y -=
        amount *
        (
          this.speed >= 0
            ? 1
            : -1
        );

    }


    /* FORWARD */

    const forward =
      new THREE.Vector3(
        0,
        0,
        -1
      );


    forward.applyQuaternion(
      vehicle.quaternion
    );


    vehicle.position.addScaledVector(
      forward,
      this.speed * delta
    );


    vehicle.position.y =
      0;


    /* CAMERA */

    updateVehicleCamera(
      vehicle
    );

  },


  /* =======================================================
     EXIT BUTTON
     ======================================================= */

  showExitButton() {

    let button =
      document.getElementById(
        "exitVehicleButton"
      );


    if (
      !button
    ) {

      button =
        document.createElement(
          "button"
        );


      button.id =
        "exitVehicleButton";


      button.textContent =
        "🚪 نزول";


      button.style.position =
        "fixed";

      button.style.right =
        "25px";

      button.style.bottom =
        "120px";

      button.style.zIndex =
        "9999";

      button.style.padding =
        "15px 22px";

      button.style.border =
        "none";

      button.style.borderRadius =
        "14px";

      button.style.background =
        "#222";

      button.style.color =
        "#fff";

      button.style.fontSize =
        "17px";


      document.body.appendChild(
        button
      );


      button.onclick =
        () => {

          this.exitVehicle();

        };

    }


    button.style.display =
      "block";

  },


  hideExitButton() {

    const button =
      document.getElementById(
        "exitVehicleButton"
      );


    if (
      button
    ) {

      button.style.display =
        "none";

    }

  }

};


/* =========================================================
   VEHICLE CAMERA
   ========================================================= */

function updateVehicleCamera(
  vehicle
) {

  const offset =
    new THREE.Vector3(
      0,
      5.5,
      10
    );


  offset.applyQuaternion(
    vehicle.quaternion
  );


  const desired =
    vehicle.position
      .clone()
      .add(offset);


  camera.position.lerp(
    desired,
    0.12
  );


  const target =
    vehicle.position
      .clone();


  target.y +=
    1.2;


  camera.lookAt(
    target
  );

}


/* =========================================================
   VEHICLE MESSAGE
   ========================================================= */

function showVehicleMessage(
  text
) {

  const element =
    document.getElementById(
      "message"
    );


  if (
    !element
  ) {

    return;

  }


  element.textContent =
    text;


  clearTimeout(
    window.vehicleMessageTimer
  );


  window.vehicleMessageTimer =
    setTimeout(
      () => {

        element.textContent =
          "";

      },
      2500
    );

}


/* =========================================================
   ENTER BUTTON
   ========================================================= */

let enterButton =
  document.getElementById(
    "enterVehicleButton"
  );


if (
  !enterButton
) {

  enterButton =
    document.createElement(
      "button"
    );


  enterButton.id =
    "enterVehicleButton";


  enterButton.textContent =
    "🚗 ركوب";


  enterButton.style.position =
    "fixed";

  enterButton.style.right =
    "25px";

  enterButton.style.bottom =
    "55px";

  enterButton.style.zIndex =
    "9999";

  enterButton.style.padding =
    "15px 22px";

  enterButton.style.border =
    "none";

  enterButton.style.borderRadius =
    "14px";

  enterButton.style.background =
    "#1683ff";

  enterButton.style.color =
    "#fff";

  enterButton.style.fontSize =
    "17px";


  document.body.appendChild(
    enterButton
  );

}


enterButton.onclick =
  () => {

    VehicleSystem.enterVehicle();

  };


/* =========================================================
   KEYBOARD E
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key.toLowerCase() !==
      "e"
    ) {

      return;

    }


    if (
      VehicleSystem.driving
    ) {

      VehicleSystem.exitVehicle();

    } else {

      VehicleSystem.enterVehicle();

    }

  }
);


/* =========================================================
   CREATE CARS
   ========================================================= */

window.addEventListener(
  "load",
  () => {

    /*
      ننتظر لحد ما game.js
      ينشئ scene و player
    */

    setTimeout(
      () => {

        if (
          typeof scene !==
            "undefined" &&
          typeof player !==
            "undefined"
        ) {

          VehicleSystem.createCityCars();

        }

      },
      300
    );

  }
);
