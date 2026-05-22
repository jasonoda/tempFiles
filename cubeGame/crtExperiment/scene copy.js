import * as THREE from "https://esm.sh/three@0.164.1";

import { OrbitControls } from "https://esm.sh/three@0.164.1/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "https://esm.sh/three@0.164.1/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://esm.sh/three@0.164.1/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://esm.sh/three@0.164.1/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "https://esm.sh/three@0.164.1/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "https://esm.sh/three@0.164.1/examples/jsm/postprocessing/OutputPass.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000005);
scene.fog = new THREE.FogExp2(0x000005, 0.04);

const camera = new THREE.PerspectiveCamera(
  98,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 5, -12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.getElementById("root").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0x88aaff, 2.0));

const dirLight = new THREE.DirectionalLight(0x99bbff, 2.5);
dirLight.position.set(8, 18, -5);
scene.add(dirLight);

const blueLight = new THREE.PointLight(0x225cff, 8, 100);
scene.add(blueLight);

const cyanLight = new THREE.PointLight(0x20fff0, 7, 100);
scene.add(cyanLight);

const purpleLight = new THREE.PointLight(0x8844ff, 6, 100);
scene.add(purpleLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.MeshStandardMaterial({
    color: 0x02050a,
    roughness: 1
  })
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.1;
scene.add(floor);

const grid = new THREE.GridHelper(
  80,
  80,
  0x143a44,
  0x10252c
);

grid.position.y = -0.05;
scene.add(grid);

const cubes = [];

const gridSize = 22;
const spacing = 1.25;

const cubeGeo = new THREE.BoxGeometry(1, 0.1, 1);

const palette = [
  0x071733,
  0x003d62,
  0x006d80,
  0x00a0a0,
  0x3c28cc,
  0x151a46
];

for (let z = 0; z < gridSize; z++) {
  for (let x = 0; x < gridSize; x++) {
    const color = new THREE.Color(
      palette[(x + z) % palette.length]
    );

    color.multiplyScalar(0.5 + Math.random() * 0.6);

    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: Math.random() < 0.15 ? 1.3 : 0.2,
      roughness: 0.9
    });

    const cube = new THREE.Mesh(cubeGeo, mat);

    cube.position.set(
      (x - gridSize / 2) * spacing,
      0,
      (z - gridSize / 2) * spacing
    );

    cube.userData = {
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random(),
      dist: Math.hypot(
        x - gridSize / 2,
        z - gridSize / 2
      )
    };

    scene.add(cube);
    cubes.push(cube);
  }
}

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
  0.45,
  0.35,
  0.45
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

const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();

  blueLight.position.x =
    Math.sin(t * 0.35) * 18;

  blueLight.position.z =
    Math.cos(t * 0.35) * 18;

  cyanLight.position.x =
    Math.sin(t * 0.25 + 2) * 16;

  cyanLight.position.z =
    Math.cos(t * 0.28 + 2) * 16;

  purpleLight.position.x =
    Math.sin(t * 0.2 + 4) * 14;

  purpleLight.position.z =
    Math.cos(t * 0.31 + 4) * 14;

  cubes.forEach((cube) => {
    const wave = Math.sin(
      t * cube.userData.speed +
      cube.userData.phase +
      cube.userData.dist * 0.22
    );

    cube.position.y =
      wave * 0.18;

    cube.scale.y =
      1 + Math.max(0, wave) * 2.0;

    cube.material.emissiveIntensity =
      0.2 + Math.max(0, wave) * 0.8;
  });

  controls.update();
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