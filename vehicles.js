/* =====================================================
   MY CITY — VEHICLES.JS
   سيارات + ركوب + قيادة + خروج
===================================================== */

const VehicleSystem = {

  vehicles: [],

  currentVehicle: null,

  driving: false,

  speed: 0,

  maxSpeed: 18,

  acceleration: 22,

  brakePower: 30,

  turnSpeed: 2.2,

  interactDistance: 5,


  /* ===================================================
     CREATE VEHICLE
  =================================================== */

  createVehicle(x, z, color = 0x2563eb) {

    const vehicle = new THREE.Group();

    vehicle.position.set(
      x,
      0,
      z
    );


    /* BODY */

    const body =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          2.2,
          0.65,
          4.2
        ),
        new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.65,
          metalness: 0.15
        })
      );

    body.position.y = 0.75;

    body.castShadow = true;

    vehicle.add(body);


    /* ROOF */

    const roof =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.7,
          0.65,
          2
        ),
        new THREE.MeshStandardMaterial({
          color: 0x22252b,
          roughness: 0.35,
          metalness: 0.2
        })
      );

    roof.position.set(
      0,
      1.25,
      0
    );

    roof.castShadow = true;

    vehicle.add(roof);


    /* WINDOWS */

    const windowMaterial =
      new THREE.MeshStandardMaterial({

        color: 0x4b7c99,

        transparent: true,

        opacity: 0.7,

        metalness: 0.2,

        roughness: 0.15

      });


    const frontWindow =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.5,
          0.45,
          0.08
        ),
        windowMaterial
      );

    frontWindow.position.set(
      0,
      1.25,
      -1.05
    );

    frontWindow.rotation.x =
      -0.15;

    vehicle.add(
      frontWindow
    );


    const backWindow =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.5,
          0.45,
          0.08
        ),
        windowMaterial
      );

    backWindow.position.set(
      0,
      1.25,
      1.05
    );

    backWindow.rotation.x =
      0.15;

    vehicle.add(
      backWindow
    );


    /* WHEELS */

    const wheelPositions = [

      [-1.08, 0.45, -1.35],
      [ 1.08, 0.45, -1.35],
      [-1.08, 0.45,  1.35],
      [ 1.08, 0.45,  1.35]

    ];


    for (
      const position of wheelPositions
    ) {

      const wheel =
        new THREE.Mesh(

          new THREE.CylinderGeometry(
            0.42,
            0.42,
            0.28,
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
        position[0],
        position[1],
        position[2]
      );


      wheel.castShadow = true;

      vehicle.add(wheel);

    }


    /* HEADLIGHTS */

    const lightMaterial =
      new THREE.MeshStandardMaterial({

        color: 0xfff2bb,

        emissive: 0xffd35a,

        emissiveIntensity: 1.5

      });


    const leftLight =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          0.45,
          0.2,
          0.08
        ),

        lightMaterial

      );


    leftLight.position.set(
      -0.7,
      0.8,
      -2.12
    );


    vehicle.add(
      leftLight
    );


    const rightLight =
      leftLight.clone();

    rightLight.position.x =
      0.7;

    vehicle.add(
      rightLight
    );


    /* VEHICLE DATA */

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


  /* ===================================================
     CITY CARS
  =================================================== */

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
      0xeeeeee
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


  /* ===================================================
     NEAREST VEHICLE
  =================================================== */

  getNearestVehicle() {

    let nearest = null;

    let nearestDistance =
      this.interactDistance;


    if (
      !window.player
    ) {

      return null;

    }


    for (
      const vehicle of this.vehicles
    ) {

      if (
        vehicle.userData.occupied
      ) {

        continue;

      }


      const distance =
        player.position.distanceTo(
          vehicle.position
        );


      if (
        distance <
        nearestDistance
      ) {

        nearest =
          vehicle;

        nearestDistance =
          distance;

      }

    }


    return nearest;

  },


  /* ===================================================
     ENTER VEHICLE
  =================================================== */

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

      this.showMessage(
        "🚗 قرب من العربية الأول"
      );

      return;

    }


    this.currentVehicle =
      vehicle;

    this.driving =
      true;

    vehicle.userData.occupied =
      true;

    this.speed =
      0;


    /* Hide player */

    player.visible =
      false;


    /* Attach player to car */

    vehicle.add(
      player
    );


    player.position.set(
      0,
      0,
      0
    );


    this.showMessage(
      "🚗 ركبت العربية"
    );


    this.showExitButton();

  },


  /* ===================================================
     EXIT VEHICLE
  =================================================== */

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


    scene.add(
      player
    );


    player.visible =
      true;


    player.position.copy(
      exitPosition
    );


    player.rotation.y =
      vehicle.rotation.y;


    vehicle.userData.occupied =
      false;


    this.currentVehicle =
      null;

    this.driving =
      false;

    this.speed =
      0;


    this.hideExitButton();


    this.showMessage(
      "🚶 نزلت من العربية"
    );

  },


  /* ===================================================
     DRIVE
  =================================================== */

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
      Math.abs(throttle) >
      0.05
    ) {

      this.speed +=
        throttle *
        this.acceleration *
        delta;

    }

    else {

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

    }


    /* STOP */

    if (
      Math.abs(this.speed) <
      0.15
    ) {

      this.speed =
        0;

    }


    /* SPEED LIMIT */

    this.speed =
      THREE.MathUtils.clamp(
        this.speed,
        -this.maxSpeed * 0.45,
        this.maxSpeed
      );


    /* STEERING */

    if (
      Math.abs(this.speed) >
      0.2
    ) {

      const steeringAmount =
        steering *
        this.turnSpeed *
        delta *
        (
          Math.abs(this.speed) /
          this.maxSpeed
        );


      vehicle.rotation.y -=
        steeringAmount *
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


    /* PLAYER */

    player.position.set(
      0,
      0,
      0
    );


    /* CAMERA */

    updateVehicleCamera(
      vehicle
    );

  },


  /* ===================================================
     VEHICLE CAMERA
  =================================================== */

  vehicleCamera(
    vehicle
  ) {

    updateVehicleCamera(
      vehicle
    );

  },


  /* ===================================================
     ENTER BUTTON
  =================================================== */

  createEnterButton() {

    let button =
      document.getElementById(
        "enterVehicleButton"
      );


    if (
      button
    ) {

      return button;

    }


    button =
      document.createElement(
        "button"
      );


    button.id =
      "enterVehicleButton";


    button.textContent =
      "🚗 ENTER";


    button.style.position =
      "fixed";


    button.style.right =
      "25px";


    button.style.bottom =
      "55px";


    button.style.zIndex =
      "2000";


    button.style.padding =
      "15px 20px";


    button.style.border =
      "none";


    button.style.borderRadius =
      "15px";


    button.style.background =
      "#1683ff";


    button.style.color =
      "#fff";


    button.style.fontSize =
      "16px";


    button.style.fontWeight =
      "bold";


    document.body.appendChild(
      button
    );


    button.addEventListener(
      "click",
      () => {

        this.enterVehicle();

      }
    );


    return button;

  },


  /* ===================================================
     EXIT BUTTON
  =================================================== */

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
        "🚪 EXIT";


      button.style.position =
        "fixed";


      button.style.right =
        "25px";


      button.style.bottom =
        "120px";


      button.style.zIndex =
        "2000";


      button.style.padding =
        "15px 20px";


      button.style.border =
        "none";


      button.style.borderRadius =
        "15px";


      button.style.background =
        "#222";


      button.style.color =
        "#fff";


      button.style.fontSize =
        "16px";


      button.style.fontWeight =
        "bold";


      document.body.appendChild(
        button
      );


      button.addEventListener(
        "click",
        () => {

          this.exitVehicle();

        }
      );

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

  },


  /* ===================================================
     MESSAGE
  =================================================== */

  showMessage(text) {

    if (
      typeof window.showMessage ===
      "function"
    ) {

      window.showMessage(
        text
      );

    }

  }

};


/* =====================================================
   CAMERA
===================================================== */

function updateVehicleCamera(
  vehicle
) {

  if (
    !window.camera
  ) {

    return;

  }


  const distance =
    10;

  const height =
    5.5;


  const offset =
    new THREE.Vector3(
      0,
      height,
      distance
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


  const lookAt =
    vehicle.position
      .clone();


  lookAt.y +=
    1;


  camera.lookAt(
    lookAt
  );

}


/* =====================================================
   KEYBOARD ENTER / EXIT
===================================================== */

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

    }

    else {

      VehicleSystem.enterVehicle();

    }

  }
);


/* =====================================================
   CREATE VEHICLES
===================================================== */

function initializeVehicles() {

  if (
    !window.scene ||
    !window.player
  ) {

    setTimeout(
      initializeVehicles,
      100
    );

    return;

  }


  VehicleSystem.createCityCars();

  VehicleSystem.createEnterButton();

}


if (
  document.readyState ===
  "loading"
) {

  window.addEventListener(
    "load",
    initializeVehicles
  );

}

else {

  initializeVehicles();

}


/* =====================================================
   GLOBAL
===================================================== */

window.VehicleSystem =
  VehicleSystem;
