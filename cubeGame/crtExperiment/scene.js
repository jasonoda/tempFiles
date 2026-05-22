import * as THREE from "https://esm.sh/three@0.164.1";
import gsap from "https://esm.sh/gsap@3.12.5";

import { OrbitControls } from "https://esm.sh/three@0.164.1/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "https://esm.sh/three@0.164.1/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://esm.sh/three@0.164.1/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://esm.sh/three@0.164.1/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "https://esm.sh/three@0.164.1/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "https://esm.sh/three@0.164.1/examples/jsm/postprocessing/OutputPass.js";

const scene = new THREE.Scene();
const DARK_COLOR = 0x2a1510;

scene.background = new THREE.Color(DARK_COLOR);

const camera = new THREE.PerspectiveCamera(
  98,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById("root").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enabled = false;
controls.target.set(0, 0, 0);

const cameraDebugEl = document.getElementById("cameraDebug");
const cameraOffset = new THREE.Vector3();
const cameraSpherical = new THREE.Spherical();
const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

const cameraDistanceState = { value: 7 };
let cameraDistance = cameraDistanceState.value;
const cameraElevationState = { value: 65 };
let cameraElevation = cameraElevationState.value;
const baseAzimuthState = { value: 0 };
const azimuthAmountState = { value: 0 };
let cameraAzimuth = 0;
const AZIMUTH_ROTATE_SPEED = 6;
const spinRateState = { value: AZIMUTH_ROTATE_SPEED };
let azimuthSpinDirection = 1;
let azimuthTween = null;

function getCameraAzimuth() {
  return baseAzimuthState.value + azimuthAmountState.value;
}

function applyCameraFromSpherical() {
  cameraAzimuth = getCameraAzimuth();
  const phi = Math.PI / 2 - cameraElevation * DEG2RAD;
  const theta = cameraAzimuth * DEG2RAD;

  cameraOffset.setFromSphericalCoords(cameraDistance, phi, theta);
  camera.position.copy(controls.target).add(cameraOffset);
  camera.lookAt(controls.target);
}

function syncCameraFromPosition() {
  cameraOffset.subVectors(camera.position, controls.target);
  cameraSpherical.setFromVector3(cameraOffset);

  cameraDistance = cameraSpherical.radius;
  cameraDistanceState.value = cameraDistance;
  cameraElevation = (Math.PI / 2 - cameraSpherical.phi) * RAD2DEG;
  cameraElevationState.value = cameraElevation;
  cameraAzimuth = cameraSpherical.theta * RAD2DEG;
  baseAzimuthState.value = cameraAzimuth;
  azimuthAmountState.value = 0;
}

function updateCameraDebug() {
  cameraDebugEl.textContent =
    `azimuth:   ${cameraAzimuth.toFixed(1)}°\n` +
    `elevation: ${cameraElevation.toFixed(1)}°\n` +
    `distance:  ${cameraDistance.toFixed(2)}\n` +
    `orbit:     ${controls.enabled ? "ON (hold O)" : "auto"}`;
}

function tickAzimuthSpin() {
  if (Math.abs(spinRateState.value) < 0.001) {
    return;
  }

  azimuthAmountState.value +=
    spinRateState.value * (gsap.ticker.deltaRatio() / 60);
  applyCameraFromSpherical();
  updateCameraDebug();
}

function startContinuousAzimuthSpin() {
  azimuthTween?.kill();
  gsap.killTweensOf(spinRateState);
  spinRateState.value = AZIMUTH_ROTATE_SPEED * azimuthSpinDirection;
}

function pauseAzimuthRotation() {
  azimuthTween?.kill();
  gsap.killTweensOf(spinRateState);
  spinRateState.value = 0;
}

function resumeAzimuthRotation() {
  startContinuousAzimuthSpin();
}

gsap.ticker.add(tickAzimuthSpin);
applyCameraFromSpherical();
startContinuousAzimuthSpin();

window.addEventListener("keydown", (event) => {
  if (event.key !== "o" && event.key !== "O") {
    return;
  }

  if (controls.enabled) {
    return;
  }

  pauseAzimuthRotation();
  controls.enabled = true;
});

window.addEventListener("keyup", (event) => {
  if (event.key !== "o" && event.key !== "O") {
    return;
  }

  if (!controls.enabled) {
    return;
  }

  controls.enabled = false;
  syncCameraFromPosition();
  resumeAzimuthRotation();
});

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(180, 180),
  new THREE.MeshBasicMaterial({
    color: DARK_COLOR
  })
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

const glowGroup = new THREE.Group();
const glowElements = [];
const glowClock = new THREE.Clock();
const ORB_COUNT = 14;
const BIG_GLOW_COUNT = 3;
const GRADIENT_GLOW_COUNT = 12;
const GLOW_SPREAD = 44;

let radialGlowTexture = null;

function createRadialGlowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );

  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.18, "rgba(255, 255, 255, 0.6)");
  gradient.addColorStop(0.45, "rgba(255, 255, 255, 0.18)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);

  texture.needsUpdate = true;

  return texture;
}

function getRadialGlowTexture() {
  if (!radialGlowTexture) {
    radialGlowTexture = createRadialGlowTexture();
  }

  return radialGlowTexture;
}

const glowHelperDir = new THREE.Vector3();
const glowHelperRight = new THREE.Vector3();
const glowHelperUp = new THREE.Vector3();

function placeGlowRelativeToCamera(entry, t) {
  glowHelperDir.subVectors(controls.target, camera.position).normalize();
  glowHelperRight.crossVectors(glowHelperDir, new THREE.Vector3(0, 1, 0)).normalize();
  glowHelperUp.crossVectors(glowHelperRight, glowHelperDir).normalize();

  const driftX = Math.sin(t * 0.75) * 1.2;
  const driftY = Math.sin(t * 0.55) * 0.7;

  entry.mesh.position
    .copy(camera.position)
    .addScaledVector(glowHelperDir, entry.distForward)
    .addScaledVector(glowHelperRight, entry.offsetX + driftX)
    .addScaledVector(glowHelperUp, entry.offsetY + driftY);
}

scene.add(glowGroup);

function addGlowMesh(radius, color, opacity, position, kind) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 20, 20),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );

  mesh.position.copy(position);
  glowGroup.add(mesh);

  const entry = {
    mesh,
    material: mesh.material,
    basePosition: position.clone(),
    baseOpacity: opacity,
    phase: Math.random() * Math.PI * 2,
    drift: kind === "big" ? 0.12 + Math.random() * 0.08 : 0.35 + Math.random() * 0.25,
    kind
  };

  glowElements.push(entry);
  return entry;
}

function addGradientGlowSprite(size, color, opacity, index, total) {
  const material = new THREE.SpriteMaterial({
    map: getRadialGlowTexture(),
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true
  });

  const sprite = new THREE.Sprite(material);

  sprite.scale.set(size, size, 1);
  sprite.renderOrder = 2;
  glowGroup.add(sprite);

  const entry = {
    mesh: sprite,
    material,
    baseOpacity: opacity,
    baseScale: size,
    offsetX: ((index + 0.5) / total - 0.5) * 14,
    offsetY: 1.2 + (index % 4) * 1.1,
    distForward: 2 + Math.random() * 2.5,
    phase: Math.random() * Math.PI * 2,
    drift: 0.1 + Math.random() * 0.08,
    kind: "sprite"
  };

  glowElements.push(entry);
  return entry;
}

for (let i = 0; i < ORB_COUNT; i++) {
  addGlowMesh(
    0.14 + Math.random() * 0.16,
    0xd45a6a,
    0.45 + Math.random() * 0.3,
    new THREE.Vector3(
      (Math.random() - 0.5) * GLOW_SPREAD * 2,
      1.8 + Math.random() * 5.5,
      (Math.random() - 0.5) * GLOW_SPREAD * 2
    ),
    "orb"
  );
}

for (let i = 0; i < BIG_GLOW_COUNT; i++) {
  addGlowMesh(
    3.5 + Math.random() * 2.5,
    0xb89048,
    0.07 + Math.random() * 0.05,
    new THREE.Vector3(
      (Math.random() - 0.5) * GLOW_SPREAD * 1.6,
      3 + Math.random() * 4,
      (Math.random() - 0.5) * GLOW_SPREAD * 1.6
    ),
    "big"
  );
}

for (let i = 0; i < GRADIENT_GLOW_COUNT; i++) {
  addGradientGlowSprite(
    7 + Math.random() * 4,
    0xd45a6a,
    0.55 + Math.random() * 0.18,
    i,
    GRADIENT_GLOW_COUNT
  );
}

function updateGlowElements(elapsed) {
  for (const entry of glowElements) {
    const t = elapsed * entry.drift + entry.phase;
    const pulse = 0.88 + Math.sin(t * 1.4) * 0.12;

    if (entry.kind === "sprite") {
      placeGlowRelativeToCamera(entry, t);

      const scale = entry.baseScale * (0.94 + Math.sin(t * 0.9) * 0.06);
      entry.mesh.scale.set(scale, scale, 1);
      entry.material.opacity = entry.baseOpacity * pulse;
      continue;
    }

    const xzAmp = entry.kind === "big" ? 7 : 2.8;
    const yAmp = entry.kind === "big" ? 2.2 : 1.1;

    entry.mesh.position.x =
      entry.basePosition.x + Math.sin(t * 0.75) * xzAmp;
    entry.mesh.position.y =
      entry.basePosition.y + Math.sin(t * 0.55) * yAmp;
    entry.mesh.position.z =
      entry.basePosition.z + Math.cos(t * 0.65) * xzAmp;
    entry.material.opacity = entry.baseOpacity * pulse;
  }
}

function updateGlowColors(section, tween = false) {
  const accent = new THREE.Color(section.accentColor);
  const light = new THREE.Color(section.lightColor);

  glowElements.forEach((entry, index) => {
    const target =
      entry.kind === "big" || entry.kind === "sprite"
        ? light.clone().lerp(accent, 0.35)
        : accent.clone().lerp(light, (index % 4) / 4);

    if (tween) {
      gsap.to(entry.material.color, {
        r: target.r,
        g: target.g,
        b: target.b,
        duration: SECTION_TWEEN_DURATION,
        ease: SECTION_TWEEN_EASE
      });
    } else {
      entry.material.color.copy(target);
    }
  });
}

const gridSize = 56;
const spacing = 1.75;
const center = (gridSize - 1) / 2;

const cubeGeo = new THREE.BoxGeometry(1.25, 0.12, 1.25);
const cubeHeight = 0.12;

const colorDark = new THREE.Color(DARK_COLOR);
const colorAccent = new THREE.Color(0xd45a6a);
const colorLight = new THREE.Color(0xe8b84a);

const WAVE_COUNT = 4;
const WAVE_SPEED = 2;
const WAVE_SIGMA = 1;
const LIFT_AMOUNT = 0.9;
const GLOW_BRIGHTNESS = 0.55;
const GLOW_CUTOFF = 0.01;
const RING_RESOLUTION = 0.25;

const cubeVertexShader = `
  void main() {
    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`;

const cubeFragmentShader = `
  uniform vec3 uColor;
  uniform float uGlow;

  void main() {
    vec3 col = uColor * (1.0 + uGlow * ${GLOW_BRIGHTNESS.toFixed(2)});

    gl_FragColor = vec4(col, 1.0);
  }
`;

function createCubeMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: colorDark.clone() },
      uGlow: { value: 0 }
    },
    vertexShader: cubeVertexShader,
    fragmentShader: cubeFragmentShader
  });
}

const ringsByIndex = new Map();

for (let z = 0; z < gridSize; z++) {
  for (let x = 0; x < gridSize; x++) {
    const ringDistance =
      Math.round(
        Math.hypot(x - center, z - center) / RING_RESOLUTION
      ) * RING_RESOLUTION;

    if (!ringsByIndex.has(ringDistance)) {
      const group = new THREE.Group();
      const state = {
        waves: Array.from({ length: WAVE_COUNT }, () => ({ amount: 0 }))
      };

      ringsByIndex.set(ringDistance, {
        group,
        state,
        ringDistance,
        material: createCubeMaterial(),
        cubes: []
      });

      scene.add(group);
    }

    const ring = ringsByIndex.get(ringDistance);
    const cube = new THREE.Mesh(cubeGeo, ring.material);

    cube.position.set(
      (x - gridSize / 2) * spacing,
      cubeHeight / 2,
      (z - gridSize / 2) * spacing
    );

    ring.group.add(cube);
    ring.cubes.push(cube);
  }
}

const ringEntries = [...ringsByIndex.values()].sort(
  (a, b) => a.ringDistance - b.ringDistance
);

const maxRing = ringEntries.at(-1)?.ringDistance ?? 0;
const WAVE_SPACING = (maxRing + WAVE_SIGMA * 3) / WAVE_COUNT;
const waveStagger = WAVE_SPACING / WAVE_SPEED;
const waveTravel = maxRing + WAVE_SIGMA * 3;
const waveDuration = waveTravel / WAVE_SPEED;

function ringWaveGlow(ringDistance, front) {
  const d = ringDistance - front;
  return Math.exp(-(d * d) / (2 * WAVE_SIGMA * WAVE_SIGMA));
}

function colorFromAmount(amount) {
  const c = colorDark.clone();

  if (amount <= 0) {
    return c;
  }

  const t = Math.min(amount, 1);

  if (t < 0.55) {
    c.lerpColors(colorDark, colorAccent, t / 0.55);
  } else {
    c.lerpColors(colorAccent, colorLight, (t - 0.55) / 0.45);
  }

  return c;
}

function getRingAmount(ring) {
  return Math.max(
    ...ring.state.waves.map((wave) => wave.amount)
  );
}

function applyRing(ring) {
  const amount = Math.min(1, Math.max(0, getRingAmount(ring)));
  const col = colorFromAmount(amount);

  ring.material.uniforms.uColor.value.copy(col);
  ring.material.uniforms.uGlow.value = amount;

  const lift = amount * LIFT_AMOUNT;

  for (const cube of ring.cubes) {
    cube.position.y = cubeHeight / 2 + lift;
  }
}

const waveFronts = Array.from({ length: WAVE_COUNT }, () => ({
  front: -WAVE_SIGMA * 2
}));

function updateRingAmounts() {
  for (const ring of ringEntries) {
    for (let i = 0; i < WAVE_COUNT; i++) {
      let amount = ringWaveGlow(
        ring.ringDistance,
        waveFronts[i].front
      );

      if (amount < GLOW_CUTOFF) {
        amount = 0;
      }

      ring.state.waves[i].amount = amount;
    }

    applyRing(ring);
  }
}

waveFronts.forEach((wave, waveIndex) => {
  gsap.to(wave, {
    front: waveTravel,
    duration: waveDuration,
    ease: "none",
    repeat: -1,
    delay: waveIndex * waveStagger
  });
});

gsap.ticker.add(updateRingAmounts);
ringEntries.forEach(applyRing);

const sections = [
  {
    id: 1,
    label: "Ember",
    distance: 6.6,
    elevation: 62,
    darkColor: 0x2a1510,
    accentColor: 0xd45a6a,
    lightColor: 0xe8b84a
  },
  {
    id: 2,
    label: "Forest",
    distance: 7.4,
    elevation: 70,
    darkColor: 0x1a3220,
    accentColor: 0x5cb870,
    lightColor: 0x78c088
  },
  {
    id: 3,
    label: "Ocean",
    distance: 6.2,
    elevation: 58,
    darkColor: 0x142838,
    accentColor: 0x48a8c8,
    lightColor: 0x68a8c0
  },
  {
    id: 4,
    label: "Violet",
    distance: 7.9,
    elevation: 74,
    darkColor: 0x281838,
    accentColor: 0xb070d0,
    lightColor: 0x9870b0
  },
  {
    id: 5,
    label: "Sunset",
    distance: 6.8,
    elevation: 64,
    darkColor: 0x3d2818,
    accentColor: 0xe88858,
    lightColor: 0xc89868
  },
  {
    id: 6,
    label: "Slate",
    distance: 8.2,
    elevation: 52,
    darkColor: 0x242830,
    accentColor: 0x7890a8,
    lightColor: 0x8898a8
  },
  {
    id: 7,
    label: "Wine",
    distance: 7.1,
    elevation: 68,
    darkColor: 0x301820,
    accentColor: 0xc86888,
    lightColor: 0xb88878
  },
  {
    id: 8,
    label: "Jade",
    distance: 5.9,
    elevation: 56,
    darkColor: 0x143028,
    accentColor: 0x40b8a0,
    lightColor: 0x68b898
  },
  {
    id: 9,
    label: "Honey",
    distance: 8.5,
    elevation: 76,
    darkColor: 0x342818,
    accentColor: 0xd0a040,
    lightColor: 0xc0a050
  },
  {
    id: 10,
    label: "Neon",
    distance: 7.6,
    elevation: 60,
    darkColor: 0x201030,
    accentColor: 0xff60a8,
    lightColor: 0x58c0a8
  }
];

let activeSection = sections[0];

const SECTION_TWEEN_DURATION = 4;
const SECTION_TWEEN_EASE = "sine.inOut";

function hexToCss(hex) {
  return `#${hex.toString(16).padStart(6, "0")}`;
}

function refreshAllRings() {
  ringEntries.forEach(applyRing);
}

function updateCameraFromState() {
  cameraDistance = cameraDistanceState.value;
  cameraElevation = cameraElevationState.value;
  applyCameraFromSpherical();
  updateCameraDebug();
}

function signedAzimuthDelta(previousBase) {
  let delta = gsap.utils.random(-180, 180);
  const proposed = previousBase + delta;

  if (proposed < previousBase) {
    delta = -Math.abs(delta);
  } else if (proposed > previousBase) {
    delta = Math.abs(delta);
  }

  return delta;
}

function setSectionImmediate(section) {
  activeSection = section;
  colorDark.set(section.darkColor);
  colorAccent.set(section.accentColor);
  colorLight.set(section.lightColor);
  scene.background.set(section.darkColor);
  floor.material.color.set(section.darkColor);
  document.body.style.background = hexToCss(section.darkColor);
  cameraDistanceState.value = section.distance;
  cameraDistance = section.distance;
  cameraElevationState.value = section.elevation;
  cameraElevation = section.elevation;
  applyCameraFromSpherical();
  updateCameraDebug();
  refreshAllRings();
  updateGlowColors(section);
  updateSectionButtons();
}

function applySection(section) {
  activeSection = section;

  pauseAzimuthRotation();
  azimuthTween?.kill();

  const currentAzimuth = getCameraAzimuth();
  baseAzimuthState.value = currentAzimuth;
  azimuthAmountState.value = 0;

  const targetBase = currentAzimuth + signedAzimuthDelta(currentAzimuth);

  azimuthSpinDirection = targetBase < currentAzimuth || targetBase < 0 ? -1 : 1;

  const targetDark = new THREE.Color(section.darkColor);
  const targetAccent = new THREE.Color(section.accentColor);
  const targetLight = new THREE.Color(section.lightColor);

  updateGlowColors(section, true);

  gsap.killTweensOf([
    colorDark,
    colorAccent,
    colorLight,
    scene.background,
    floor.material.color,
    cameraDistanceState,
    cameraElevationState,
    baseAzimuthState,
    azimuthAmountState,
    spinRateState
  ]);

  const tweenVars = {
    duration: SECTION_TWEEN_DURATION,
    ease: SECTION_TWEEN_EASE
  };

  const tl = gsap.timeline({
    onComplete: updateSectionButtons
  });

  spinRateState.value = 0;

  tl.to(
    baseAzimuthState,
    {
      value: targetBase,
      ...tweenVars,
      onUpdate: updateCameraFromState
    }
  );

  tl.to(
    cameraDistanceState,
    {
      value: section.distance,
      ...tweenVars,
      onUpdate: updateCameraFromState
    },
    "<"
  );

  tl.to(
    cameraElevationState,
    {
      value: section.elevation,
      ...tweenVars,
      onUpdate: updateCameraFromState
    },
    "<"
  );

  tl.to(
    spinRateState,
    {
      value: AZIMUTH_ROTATE_SPEED * azimuthSpinDirection,
      duration: SECTION_TWEEN_DURATION,
      ease: "power2.in",
      onUpdate: updateCameraFromState
    },
    "<"
  );

  tl.to(
    colorDark,
    {
      r: targetDark.r,
      g: targetDark.g,
      b: targetDark.b,
      ...tweenVars,
      onUpdate: refreshAllRings
    },
    "<"
  );

  tl.to(
    colorAccent,
    {
      r: targetAccent.r,
      g: targetAccent.g,
      b: targetAccent.b,
      ...tweenVars,
      onUpdate: refreshAllRings
    },
    "<"
  );

  tl.to(
    colorLight,
    {
      r: targetLight.r,
      g: targetLight.g,
      b: targetLight.b,
      ...tweenVars,
      onUpdate: refreshAllRings
    },
    "<"
  );

  tl.to(
    scene.background,
    {
      r: targetDark.r,
      g: targetDark.g,
      b: targetDark.b,
      ...tweenVars
    },
    "<"
  );

  tl.to(
    floor.material.color,
    {
      r: targetDark.r,
      g: targetDark.g,
      b: targetDark.b,
      ...tweenVars,
      onComplete: () => {
        document.body.style.background = hexToCss(section.darkColor);
      }
    },
    "<"
  );

  updateSectionButtons();
}

const sectionNav = document.getElementById("sectionNav");
let sectionButtons = [];

function buildSectionNav() {
  sectionNav.innerHTML = "";

  sectionButtons = sections.map((section) => {
    const button = document.createElement("button");

    button.type = "button";
    button.dataset.section = section.id;
    button.textContent = section.label;
    button.style.borderColor = `${hexToCss(section.accentColor)}99`;

    button.addEventListener("click", () => {
      if (section.id !== activeSection.id) {
        applySection(section);
      }
    });

    sectionNav.appendChild(button);
    return button;
  });
}

function updateSectionButtons() {
  sectionButtons.forEach((button) => {
    const id = Number(button.dataset.section);
    button.classList.toggle("active", id === activeSection.id);
  });
}

buildSectionNav();

setSectionImmediate(sections[0]);

const CRTSubPixelShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: {
      value: new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
      )
    },
    pixelSize: { value: 8 },
    brightness: { value: 1.5 },
    subPixelGap: { value: 0.15 },
    scanlineIntensity: { value: 0.3 }
  },

  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;

      gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;

    uniform float pixelSize;
    uniform float brightness;
    uniform float subPixelGap;
    uniform float scanlineIntensity;

    varying vec2 vUv;

    void main() {
      vec2 dxy = pixelSize / resolution;

      vec2 cellCoord =
        dxy * floor(vUv / dxy) +
        dxy * 0.5;

      vec4 color =
        texture2D(tDiffuse, cellCoord);

      vec2 cellPos =
        fract(vUv / dxy);

      float subCol =
        cellPos.x * 3.0;

      float subIndex =
        floor(subCol);

      float subLocal =
        fract(subCol);

      vec3 mask = vec3(0.0);

      if (subIndex < 1.0) {
        mask.r = 1.0;
      } else if (subIndex < 2.0) {
        mask.g = 1.0;
      } else {
        mask.b = 1.0;
      }

      float subShape =
        smoothstep(0.0, subPixelGap, subLocal) *
        smoothstep(0.0, subPixelGap, 1.0 - subLocal);

      float vShape =
        smoothstep(0.0, 0.08, cellPos.y) *
        smoothstep(0.0, 0.08, 1.0 - cellPos.y);

      float scanline =
        1.0 -
        scanlineIntensity *
        (
          1.0 -
          smoothstep(0.4, 0.5, cellPos.y) *
          smoothstep(0.4, 0.5, 1.0 - cellPos.y)
        );

      vec3 result =
        color.rgb *
        mask *
        subShape *
        vShape *
        scanline *
        brightness;

      vec3 bleed =
        color.rgb *
        subShape *
        vShape *
        scanline *
        0.08;

      gl_FragColor = vec4(result + bleed, 1.0);
    }
  `
};

const composer = new EffectComposer(renderer);

composer.addPass(
  new RenderPass(scene, camera)
);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(
    window.innerWidth,
    window.innerHeight
  ),
  0.5,
  0.4,
  0.32
);

composer.addPass(bloomPass);

composer.addPass(
  new OutputPass()
);

const crtPass =
  new ShaderPass(CRTSubPixelShader);

composer.addPass(crtPass);

const scanlines =
  document.querySelector(".scanlines");

const vignette =
  document.querySelector(".vignette");

const toggleButton =
  document.getElementById("toggleCRT");

let crtEnabled = true;

toggleButton.addEventListener("click", () => {
  crtEnabled = !crtEnabled;

  crtPass.enabled = crtEnabled;

  scanlines.style.display =
    crtEnabled ? "block" : "none";

  vignette.style.display =
    crtEnabled ? "block" : "none";

  toggleButton.textContent =
    crtEnabled ? "CRT ON" : "CRT OFF";
});

function animate() {
  updateGlowElements(glowClock.getElapsedTime());
  controls.update();
  updateCameraDebug();
  composer.render();
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {
  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  composer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  bloomPass.setSize(
    window.innerWidth,
    window.innerHeight
  );

  crtPass.uniforms.resolution.value.set(
    window.innerWidth,
    window.innerHeight
  );
});