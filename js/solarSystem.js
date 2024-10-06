import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js";

// Creating renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Texture loader
const textureLoader = new THREE.TextureLoader();

// Import all textures
const starTexture = textureLoader.load("./image/star.jpg");
const sunTexture = textureLoader.load("./image/sun.jpg");
const mercuryTexture = textureLoader.load("./image/mercury.jpg");
const venusTexture = textureLoader.load("./image/venus.jpg");
const earthTexture = textureLoader.load("./image/earth.jpg");
const marsTexture = textureLoader.load("./image/mars.jpg");
const jupiterTexture = textureLoader.load("./image/jupiter.jpg");
const saturnTexture = textureLoader.load("./image/saturn.jpg");
const uranusTexture = textureLoader.load("./image/uranus.jpg");
const neptuneTexture = textureLoader.load("./image/neptune.jpg");
const plutoTexture = textureLoader.load("./image/pluto.jpg");
const saturnRingTexture = textureLoader.load("./image/saturn_ring.png");
const uranusRingTexture = textureLoader.load("./image/uranus_ring.png");
const asteroidTexture = textureLoader.load("./image/asteroid.png");

// Creating scene
const scene = new THREE.Scene();

// NOTE: Background workaround using a large sphere
const backgroundGeo = new THREE.SphereGeometry(500, 32, 32);
const backgroundMaterial = new THREE.MeshBasicMaterial({
  map: starTexture,
  side: THREE.BackSide, // Render inside the sphere
});
const backgroundSphere = new THREE.Mesh(backgroundGeo, backgroundMaterial);
scene.add(backgroundSphere);


// Perspective camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-50, 90, 150);

// Orbit controls
const orbit = new OrbitControls(camera, renderer.domElement);

// Sun creation
const sungeo = new THREE.SphereGeometry(15, 50, 50);
const sunMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture,
});
const sun = new THREE.Mesh(sungeo, sunMaterial);
scene.add(sun);

// Sun light (point light)
const sunLight = new THREE.PointLight(0xffffff, 4, 300);
scene.add(sunLight);

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0);
scene.add(ambientLight);

// Path for planets
const path_of_planets = [];
function createLineLoopWithMesh(radius, color, width) {
  const material = new THREE.LineBasicMaterial({
    color: color,
    linewidth: width,
  });
  const geometry = new THREE.BufferGeometry();
  const lineLoopPoints = [];

  // Calculate points for the circular path
  const numSegments = 100; // Number of segments to create the circular path
  for (let i = 0; i <= numSegments; i++) {
    const angle = (i / numSegments) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    lineLoopPoints.push(x, 0, z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(lineLoopPoints, 3)
  );
  const lineLoop = new THREE.LineLoop(geometry, material);
  scene.add(lineLoop);
  path_of_planets.push(lineLoop);
}

// Create planet
const genratePlanet = (size, planetTexture, x, ring) => {
  const planetGeometry = new THREE.SphereGeometry(size, 50, 50);
  const planetMaterial = new THREE.MeshStandardMaterial({
    map: planetTexture,
  });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  const planetObj = new THREE.Object3D();
  planet.position.set(x, 0, 0);
  if (ring) {
    const ringGeo = new THREE.RingGeometry(
      ring.innerRadius,
      ring.outerRadius,
      32
    );
    const ringMat = new THREE.MeshBasicMaterial({
      map: ring.ringmat,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    planetObj.add(ringMesh);
    ringMesh.position.set(x, 0, 0);
    ringMesh.rotation.x = -0.5 * Math.PI;
  }
  scene.add(planetObj);

  planetObj.add(planet);
  createLineLoopWithMesh(x, 0xffffff, 3);
  return {
    planetObj: planetObj,
    planet: planet,
  };
};

const planets = [
  {
    ...genratePlanet(3.2, mercuryTexture, 28),
    rotaing_speed_around_sun: 0.004,
    self_rotation_speed: 0.004,
  },
  {
    ...genratePlanet(5.8, venusTexture, 44),
    rotaing_speed_around_sun: 0.015,
    self_rotation_speed: 0.002,
  },
  {
    ...genratePlanet(6, earthTexture, 62),
    rotaing_speed_around_sun: 0.01,
    self_rotation_speed: 0.02,
  },
  {
    ...genratePlanet(4, marsTexture, 78),
    rotaing_speed_around_sun: 0.008,
    self_rotation_speed: 0.018,
  },
  {
    ...genratePlanet(12, jupiterTexture, 100),
    rotaing_speed_around_sun: 0.002,
    self_rotation_speed: 0.04,
  },
  {
    ...genratePlanet(10, saturnTexture, 138, {
      innerRadius: 10,
      outerRadius: 20,
      ringmat: saturnRingTexture,
    }),
    rotaing_speed_around_sun: 0.0009,
    self_rotation_speed: 0.038,
  },
  {
    ...genratePlanet(7, uranusTexture, 176, {
      innerRadius: 7,
      outerRadius: 12,
      ringmat: uranusRingTexture,
    }),
    rotaing_speed_around_sun: 0.0004,
    self_rotation_speed: 0.03,
  },
  {
    ...genratePlanet(7, neptuneTexture, 200),
    rotaing_speed_around_sun: 0.0001,
    self_rotation_speed: 0.032,
  },
  {
    ...genratePlanet(2.8, plutoTexture, 216),
    rotaing_speed_around_sun: 0.0007,
    self_rotation_speed: 0.008,
  },
];

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Create a mapping for planet URLs
const planetURLs = {
  mercury: "https://science.nasa.gov/mercury/facts/",
  venus: "https://science.nasa.gov/venus/venus-facts/",
  earth: "https://science.nasa.gov/earth/facts/",
  mars: "https://science.nasa.gov/mars/facts/",
  jupiter: "https://science.nasa.gov/jupiter/jupiter-facts/",
  saturn: "https://science.nasa.gov/saturn/facts/",
  uranus: "https://science.nasa.gov/uranus/facts/",
  neptune: "https://science.nasa.gov/neptune/neptune-facts/",
  pluto: "https://science.nasa.gov/dwarf-planets/pluto/facts/",
};

// Function to handle the click event
function onDocumentMouseClick(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Array to hold all planets' objects to check for intersection
  const planetsObjects = planets.map((p) => p.planet);

  // Check for intersections between raycaster and planets
  const intersects = raycaster.intersectObjects(planetsObjects);

  // If there's an intersection (a planet is clicked)
  if (intersects.length > 0) {
    const clickedPlanet = intersects[0].object; // Get the first intersected object (planet)

    // Find which planet was clicked and redirect to the appropriate URL
    if (clickedPlanet === planets[0].planet) {
      window.location.href = planetURLs.mercury;
    } else if (clickedPlanet === planets[1].planet) {
      window.location.href = planetURLs.venus;
    } else if (clickedPlanet === planets[2].planet) {
      window.location.href = planetURLs.earth;
    } else if (clickedPlanet === planets[3].planet) {
      window.location.href = planetURLs.mars;
    } else if (clickedPlanet === planets[4].planet) {
      window.location.href = planetURLs.jupiter;
    } else if (clickedPlanet === planets[5].planet) {
      window.location.href = planetURLs.saturn;
    } else if (clickedPlanet === planets[6].planet) {
      window.location.href = planetURLs.uranus;
    } else if (clickedPlanet === planets[7].planet) {
      window.location.href = planetURLs.neptune;
    } else if (clickedPlanet === planets[8].planet) {
      window.location.href = planetURLs.pluto;
    }
  }
}

// Add event listener to the renderer DOM element for mouse clicks
renderer.domElement.addEventListener('click', onDocumentMouseClick);



// NOTE: Adding near-Earth comets and asteroids
// Function to generate random positions
const randomPosition = (radius) => {
  const angle = Math.random() * Math.PI * 2;
  const distance = radius + Math.random() * 30;
  const x = distance * Math.cos(angle);
  const z = distance * Math.sin(angle);
  return { x, y: Math.random() * 10 - 5, z };
};

// Function to create asteroid or comet
function createObject(size, texture, type) {
  const geometry = new THREE.IcosahedronGeometry(size, 1); // Creates a jagged, irregular shape

  const material = new THREE.MeshStandardMaterial({ map: texture });
  const obj = new THREE.Mesh(geometry, material);

  if (type === "comet") {
    const tailGeo = new THREE.ConeGeometry(size * 2, size * 5, 8);
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xffffaa, side: THREE.DoubleSide });
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.position.set(0, -size * 2, 0);
    tail.rotation.set(Math.PI / 2, 0, 0);
    obj.add(tail);
  }

  return obj;
}

// Arrays to keep track of the objects
const asteroids = [];
const potentiallyHazardousAsteroids = [];

// Adding near-Earth asteroids
for (let i = 0; i < 10; i++) {
  const position = randomPosition(80);
  const asteroid = createObject(3, asteroidTexture, "asteroid");
  asteroid.position.set(position.x, position.y, position.z);
  scene.add(asteroid);
  asteroids.push(asteroid);
}


// Adding potentially hazardous asteroids
for (let i = 0; i < 3; i++) {
  const position = randomPosition(120);
  const hazardousAsteroid = createObject(3, asteroidTexture, "hazardous");
  hazardousAsteroid.material.color.setHex(0xff0000); // Color them red to identify
  hazardousAsteroid.position.set(position.x, position.y, position.z);
  scene.add(hazardousAsteroid);
  potentiallyHazardousAsteroids.push(hazardousAsteroid);
}

//- GUI options
var GUI = dat.gui.GUI;
const gui = new GUI();
const options = {
  "Real view": true,
  "Show path": true,
  speed: 1,
};
gui.add(options, "Real view").onChange((e) => {
  ambientLight.intensity = e ? 0 : 0.5;
});
gui.add(options, "Show path").onChange((e) => {
  path_of_planets.forEach((dpath) => {
    dpath.visible = e;
  });
});
const maxSpeed = new URL(window.location.href).searchParams.get("ms") * 1;
gui.add(options, "speed", 0, maxSpeed ? maxSpeed : 20);



//- animate function
function animate(time) {
  sun.rotateY(options.speed * 0.004);
  planets.forEach(
    ({ planetObj, planet, rotaing_speed_around_sun, self_rotation_speed }) => {
      planetObj.rotateY(options.speed * rotaing_speed_around_sun);
      planet.rotateY(options.speed * self_rotation_speed);
    }
  );

  // Moving asteroids and comets
  asteroids.forEach((asteroid, index) => {
    asteroid.position.x += Math.sin(time * 0.0005 + index) * 0.02;
    asteroid.position.z += Math.cos(time * 0.0005 + index) * 0.02;
    asteroid.rotateY(0.01); // Rotate to add realism
  });

  potentiallyHazardousAsteroids.forEach((hazardousAsteroid, index) => {
    hazardousAsteroid.position.x += Math.sin(time * 0.0007 + index) * 0.04;
    hazardousAsteroid.position.z += Math.cos(time * 0.0007 + index) * 0.04;
    hazardousAsteroid.rotateY(0.01);
  });

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

//- resize camera view
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});