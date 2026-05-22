/**
 * Cube Ninja — Fruit Ninja-style slicing game with procedural mesh plane cuts.
 */

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// CRT post-process (from crtExperiment)
const CRTSubPixelShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    pixelSize: { value: 8 },
    brightness: { value: 1.5 },
    subPixelGap: { value: 0.15 },
    scanlineIntensity: { value: 0.3 },
    uCRTEnabled: { value: 0 },
  },

  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float pixelSize;
    uniform float brightness;
    uniform float subPixelGap;
    uniform float scanlineIntensity;
    uniform float uCRTEnabled;

    varying vec2 vUv;

    void main() {
      vec4 source = texture2D(tDiffuse, vUv);
      if (uCRTEnabled < 0.5) {
        gl_FragColor = source;
        return;
      }

      vec2 dxy = pixelSize / resolution;
      vec2 cellCoord = dxy * floor(vUv / dxy) + dxy * 0.5;
      vec4 color = texture2D(tDiffuse, cellCoord);
      vec2 cellPos = fract(vUv / dxy);

      float subCol = cellPos.x * 3.0;
      float subIndex = floor(subCol);
      float subLocal = fract(subCol);

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
        color.rgb * mask * subShape * vShape * scanline * brightness;

      vec3 bleed =
        color.rgb * subShape * vShape * scanline * 0.18;

      gl_FragColor = vec4(result + bleed, 1.0);
    }
  `,
};

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEBUG = false;

const COLORS = [0xff00ff, 0x00ffff, 0xffff00];
const COLOR_NAMES = ["magenta", "cyan", "yellow"];
const BG_COLOR = 0x111111;

const GRAVITY_START = -6;
const GRAVITY_END = -18.5;
const GRAVITY_RAMP_DURATION = 240;
const GRAVITY_RAMP_OFFSET = 84;
/** Gravity ease-in: slow early, much heavier in the back half of a run. */
const GRAVITY_RAMP_POWER = 2.15;
const SPAWN_INTERVAL_MAX = 0.25;
const SPAWN_INTERVAL_START = 2.3;
const SPAWN_RAMP_DURATION = 186;
/** Pretend 45s of ramp at 0:00; longer duration = slower climb after that. */
const SPAWN_RAMP_OFFSET = 109;
const SPAWN_RAMP_POWER = 1.25;
const MAX_CUBES = 15;
const DIFFICULTY_DEBUG_INTERVAL = 10;
/** iPad portrait logical resolution (matches #game-stage CSS). */
const IPAD_PORTRAIT_WIDTH = 768;
const IPAD_PORTRAIT_HEIGHT = 1024;
/** Runtime layout tuned for iPad portrait. */
const Layout = {
  portrait: true,
  launchSpeedMin: 14,
  launchSpeedMax: 18,
  playBounds: { x: 13.5, yMin: -6, yMax: 22, z: 0.6 },
  cubeSizeMin: 1.35,
  cubeSizeMax: 1.9,
  spawnSpreadX: 1.0,
  spawnSpreadZ: 0.08,
  cameraFov: 54,
  cameraPos: new THREE.Vector3(0, 0.5, 18.5),
  cameraLookAt: new THREE.Vector3(0, 6.5, 0),
};

function applyLayout() {
  Layout.portrait = true;
  Layout.launchSpeedMin = 12;
  Layout.launchSpeedMax = 16;
  Layout.playBounds = { x: 5.5, yMin: -6, yMax: 22, z: 0.6 };
  Layout.cubeSizeMin = 1.35;
  Layout.cubeSizeMax = 1.9;
  Layout.spawnSpreadX = 2.0;
  Layout.spawnSpreadZ = 0.08;
  Layout.cameraFov = 54;
  Layout.cameraPos.set(0, 0.5, 18.5);
  Layout.cameraLookAt.set(0, 5.5, 0);
}
const CAP_OFFSET = 0.004;
const SLICE_SEPARATION_FORCE = 4.5;
const SLICE_LATERAL_FORCE = 4;
const SLICE_X_JITTER = 2.5;
const SLICE_SHRINK_DURATION = 2;
const SWIPE_MIN_DISTANCE = 10;
const SWIPE_TRAIL_MIN_POINT_DIST = 4;
const SWIPE_TRAIL_MAX_POINTS = 48;
const SWIPE_TAIL_SEGMENTS = 4;
const SCREEN_HIT_PADDING = 10;
const SCREEN_HIT_PADDING_MIN = 3;
const SCREEN_HIT_PADDING_RATIO = 0.05;
const SWIPE_RAY_SAMPLES = 14;
const SWIPE_MIN_RAY_HITS = 3;
const MAX_STRIKES = 3;
const CALLOUT_DURATION_MS = 1000;
/** No strike / red wrong-slice feedback for this long after a color-change callout. */
const COLOR_CHANGE_GRACE_MS = 2000;
const WRONG_SLICE_PAUSE_MS = 2000;
const WRONG_SLICE_REVEAL_MS = 200;
/** After a wrong strike, no additional X until this cooldown ends. */
const WRONG_STRIKE_COOLDOWN_MS = 1000;
const WRONG_SLICE_BLINK_HZ = 8;
const WRONG_SLICE_COLOR = 0xff2244;
const WRONG_SLICE_EMISSIVE = 0xff1133;
const BOTTOM_HIT_EPS = 0.08;
const BOTTOM_LEAVE_EPS = 0.4;
const BOTTOM_BLINK_HZ = 7;
const WRONG_SLICE_SEPARATION_SCALE = 0.4;
const WRONG_SLICE_LATERAL_SCALE = 0.3;

function getTargetChangeInterval(elapsed) {
  return elapsed < 60 ? 12 : 8;
}

/** Shared 0–1 spawn difficulty ramp. */
function getDifficultyRamp(
  elapsed,
  duration = SPAWN_RAMP_DURATION,
  offset = SPAWN_RAMP_OFFSET
) {
  const t = Math.min(Math.max(elapsed + offset, 0) / duration, 1);
  return 1 - Math.pow(1 - t, SPAWN_RAMP_POWER);
}

/** Seconds between spawns — ramps to SPAWN_INTERVAL_MAX (offset so t=0 matches old 45s pace). */
function getSpawnInterval(elapsed) {
  return THREE.MathUtils.lerp(
    SPAWN_INTERVAL_START,
    SPAWN_INTERVAL_MAX,
    getDifficultyRamp(elapsed, SPAWN_RAMP_DURATION)
  );
}

/** Gravity ramp — separate from spawn so falls feel clearly heavier over time. */
function getGravityRamp(elapsed) {
  const t = Math.min(
    Math.max(elapsed + GRAVITY_RAMP_OFFSET, 0) / GRAVITY_RAMP_DURATION,
    1
  );
  return Math.pow(t, GRAVITY_RAMP_POWER);
}

function getGravity(elapsed) {
  return THREE.MathUtils.lerp(
    GRAVITY_START,
    GRAVITY_END,
    getGravityRamp(elapsed)
  );
}

/** Match launch speed to gravity so peak height stays similar (h ∝ vy²/|g|). */
function getLaunchSpeedMultiplier(elapsed) {
  return Math.sqrt(Math.abs(getGravity(elapsed)) / Math.abs(GRAVITY_START));
}

function formatGameTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Mesh plane slicer — splits BufferGeometry along a THREE.Plane
// ---------------------------------------------------------------------------

class MeshSlicer {
  static EPSILON = 1e-6;

  /**
   * Slice geometry in local space; plane is in the same space as geometry vertices.
   * @returns {{ positive: THREE.BufferGeometry, negative: THREE.BufferGeometry } | null}
   */
  static slice(geometry, plane) {
    const posAttr = geometry.getAttribute("position");
    if (!posAttr) return null;

    const index = geometry.index;
    const triCount = index ? index.count / 3 : posAttr.count / 3;

    const posVerts = [];
    const negVerts = [];
    const capPoints = [];

    const va = new THREE.Vector3();
    const vb = new THREE.Vector3();
    const vc = new THREE.Vector3();
    const i0 = new THREE.Vector3();
    const i1 = new THREE.Vector3();

    const getVertex = (tri, corner) => {
      const idx = index ? index.getX(tri * 3 + corner) : tri * 3 + corner;
      return va.fromBufferAttribute(posAttr, idx);
    };

    for (let t = 0; t < triCount; t++) {
      const a = getVertex(t, 0).clone();
      const b = getVertex(t, 1).clone();
      const c = getVertex(t, 2).clone();

      const da = plane.distanceToPoint(a);
      const db = plane.distanceToPoint(b);
      const dc = plane.distanceToPoint(c);

      const sa = da >= -MeshSlicer.EPSILON;
      const sb = db >= -MeshSlicer.EPSILON;
      const sc = dc >= -MeshSlicer.EPSILON;

      const posCount = (sa ? 1 : 0) + (sb ? 1 : 0) + (sc ? 1 : 0);

      if (posCount === 3) {
        MeshSlicer._pushTri(posVerts, a, b, c);
      } else if (posCount === 0) {
        MeshSlicer._pushTri(negVerts, a, b, c);
      } else {
        MeshSlicer._clipTriangle(
          plane,
          a,
          b,
          c,
          da,
          db,
          dc,
          sa,
          sb,
          sc,
          posVerts,
          negVerts,
          capPoints,
          i0,
          i1
        );
      }
    }

    if (posVerts.length === 0 || negVerts.length === 0) return null;

    const capContour = MeshSlicer._dedupePoints(capPoints, 1e-4).map((p) =>
      MeshSlicer._projectOnPlane(p, plane)
    );

    const positive = MeshSlicer._buildGeometry(posVerts);
    const negative = MeshSlicer._buildGeometry(negVerts);
    return { positive, negative, capContour };
  }

  static _projectOnPlane(point, plane) {
    const dist = plane.distanceToPoint(point);
    return point
      .clone()
      .addScaledVector(plane.normal, -dist);
  }

  /**
   * Build a solid cap mesh lying on the cut plane with outward-facing normals.
   */
  static buildCapGeometry(contour, outwardNormal) {
    if (!contour || contour.length < 3) return null;

    const normal = outwardNormal.clone().normalize();
    const offsetContour = contour.map((p) =>
      p.clone().addScaledVector(normal, CAP_OFFSET)
    );

    const center = new THREE.Vector3();
    for (const p of offsetContour) center.add(p);
    center.divideScalar(offsetContour.length);

    const ordered = MeshSlicer._orderCapPoints(offsetContour, center, normal);
    const positions = [];
    const normals = [];

    for (let i = 1; i < ordered.length - 1; i++) {
      const tri = [ordered[0], ordered[i], ordered[i + 1]];
      for (const v of tri) {
        positions.push(v.x, v.y, v.z);
        normals.push(normal.x, normal.y, normal.z);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geo.computeBoundingSphere();
    return geo;
  }

  static _dedupePoints(points, tolerance) {
    const unique = [];
    for (const p of points) {
      let found = false;
      for (const q of unique) {
        if (p.distanceTo(q) < tolerance) {
          found = true;
          break;
        }
      }
      if (!found) unique.push(p.clone());
    }
    return unique;
  }

  static _pushTri(arr, a, b, c) {
    arr.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  }

  static _clipTriangle(
    plane,
    a,
    b,
    c,
    da,
    db,
    dc,
    sa,
    sb,
    sc,
    posVerts,
    negVerts,
    capPoints,
    i0,
    i1
  ) {
    const verts = [
      { v: a, d: da, s: sa },
      { v: b, d: db, s: sb },
      { v: c, d: dc, s: sc },
    ];

    const posSide = [];
    const negSide = [];

    for (let i = 0; i < 3; i++) {
      const cur = verts[i];
      const nxt = verts[(i + 1) % 3];
      if (cur.s) posSide.push(cur.v);
      else negSide.push(cur.v);

      if (cur.s !== nxt.s) {
        const t = cur.d / (cur.d - nxt.d);
        const p = cur.v.clone().lerp(nxt.v, t);
        capPoints.push(p);
        posSide.push(p);
        negSide.push(p);
      }
    }

    if (posSide.length >= 3) {
      MeshSlicer._fanTriangulate(posVerts, posSide);
    }
    if (negSide.length >= 3) {
      MeshSlicer._fanTriangulate(negVerts, negSide);
    }
  }

  static _fanTriangulate(arr, pts) {
    for (let i = 1; i < pts.length - 1; i++) {
      MeshSlicer._pushTri(arr, pts[0], pts[i], pts[i + 1]);
    }
  }

  static _orderCapPoints(points, center, normal) {
    const ref = new THREE.Vector3();
    if (Math.abs(normal.y) < 0.9) ref.set(0, 1, 0);
    else ref.set(1, 0, 0);

    const tangent = new THREE.Vector3().crossVectors(normal, ref).normalize();
    const bitangent = new THREE.Vector3().crossVectors(normal, tangent);

    const ordered = [...points].sort((p1, p2) => {
      const v1 = p1.clone().sub(center);
      const v2 = p2.clone().sub(center);
      const a1 = Math.atan2(v1.dot(bitangent), v1.dot(tangent));
      const a2 = Math.atan2(v2.dot(bitangent), v2.dot(tangent));
      return a1 - a2;
    });

    let signedArea = 0;
    for (let i = 0; i < ordered.length; i++) {
      const v1 = ordered[i].clone().sub(center);
      const v2 = ordered[(i + 1) % ordered.length].clone().sub(center);
      signedArea += new THREE.Vector3().crossVectors(v1, v2).dot(normal);
    }
    if (signedArea < 0) ordered.reverse();

    return ordered;
  }

  static _buildGeometry(verts) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));

    const triCount = verts.length / 9;
    const normals = new Float32Array(verts.length);
    const edge1 = new THREE.Vector3();
    const edge2 = new THREE.Vector3();
    const faceNormal = new THREE.Vector3();

    for (let t = 0; t < triCount; t++) {
      const i = t * 9;
      edge1.set(
        verts[i + 3] - verts[i],
        verts[i + 4] - verts[i + 1],
        verts[i + 5] - verts[i + 2]
      );
      edge2.set(
        verts[i + 6] - verts[i],
        verts[i + 7] - verts[i + 1],
        verts[i + 8] - verts[i + 2]
      );
      faceNormal.crossVectors(edge1, edge2).normalize();

      for (let v = 0; v < 3; v++) {
        const ni = (i + v * 3);
        normals[ni] = faceNormal.x;
        normals[ni + 1] = faceNormal.y;
        normals[ni + 2] = faceNormal.z;
      }
    }

    geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geo.computeBoundingSphere();
    return geo;
  }
}

// ---------------------------------------------------------------------------
// PhysicsSystem
// ---------------------------------------------------------------------------

class PhysicsSystem {
  update(objects, dt, gameTime = 0) {
    const gravity = getGravity(gameTime);
    for (const obj of objects) {
      if (!obj.alive) continue;
      obj.velocity.y += gravity * dt;
      obj.position.addScaledVector(obj.velocity, dt);
      obj.mesh.position.copy(obj.position);
      obj.mesh.rotation.x += obj.angularVelocity.x * dt;
      obj.mesh.rotation.y += obj.angularVelocity.y * dt;
      obj.mesh.rotation.z += obj.angularVelocity.z * dt;

      if (!obj.isWhole && !obj.freezeShrink) {
        obj.shrinkElapsed += dt;
        const t = Math.min(obj.shrinkElapsed / SLICE_SHRINK_DURATION, 1);
        const scale = 1 - t;
        obj.mesh.scale.setScalar(scale);
        if (t >= 1) obj.alive = false;
      }
    }
  }

  isOutOfBounds(obj) {
    const p = obj.position;
    const b = Layout.playBounds;
    const margin = obj.size * 0.6;

    if (!obj.isWhole) {
      return p.y < b.yMin - margin || p.y > b.yMax + margin * 2;
    }

    return (
      p.y < b.yMin ||
      p.y > b.yMax ||
      Math.abs(p.x) > b.x + margin ||
      Math.abs(p.z) > b.z + margin
    );
  }
}

// ---------------------------------------------------------------------------
// CubeObject
// ---------------------------------------------------------------------------

class CubeObject {
  static _idCounter = 0;

  constructor(mesh, size, colorIndex) {
    this.id = ++CubeObject._idCounter;
    this.mesh = mesh;
    this.size = size;
    this.colorIndex = colorIndex;
    this.alive = true;
    this.isWhole = true;
    this.shrinkElapsed = 0;
    this.freezeShrink = false;
    this.bottomBounceCount = 0;
    this.leftBottomSinceBounce = false;
    this.blinking = false;
    this.wrongSliceBlink = false;
    this.blinkPhase = 0;
    this.position = mesh.position.clone();
    this.velocity = new THREE.Vector3();
    this.angularVelocity = new THREE.Vector3();
    mesh.userData.cubeObject = this;
  }

  get color() {
    return COLORS[this.colorIndex];
  }

  static createMaterial(color) {
    return new THREE.MeshStandardMaterial({
      color,
      metalness: 0.08,
      roughness: 0.5,
      envMapIntensity: 0,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
  }

  static createMesh(size, colorIndex) {
    const color = COLORS[colorIndex];
    const geo = new THREE.BoxGeometry(size, size, size);
    const mat = CubeObject.createMaterial(color);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  dispose() {
    this.alive = false;
    this.mesh.geometry?.dispose();
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach((m) => m.dispose());
    } else {
      this.mesh.material?.dispose();
    }
  }
}

// ---------------------------------------------------------------------------
// CubeSpawner
// ---------------------------------------------------------------------------

class CubeSpawner {
  constructor(scene) {
    this.scene = scene;
    this.timer = 0;
  }

  update(dt, cubes, playing, gameTime, targetColorIndex) {
    if (!playing) return;
    const spawnInterval = getSpawnInterval(gameTime);
    this.timer += dt;
    if (this.timer < spawnInterval) return;
    if (cubes.filter((c) => c.isWhole && c.alive).length >= MAX_CUBES) return;

    this.timer = 0;
    this.spawn(cubes, targetColorIndex, gameTime);
  }

  spawn(cubes, targetColorIndex, gameTime) {
    const size =
      Layout.cubeSizeMin +
      Math.random() * (Layout.cubeSizeMax - Layout.cubeSizeMin);
    const colorIndex =
      gameTime < 60
        ? Math.random() < 0.4
          ? targetColorIndex
          : Math.floor(Math.random() * COLORS.length)
        : Math.floor(Math.random() * COLORS.length);
    const mesh = CubeObject.createMesh(size, colorIndex);
    const cube = new CubeObject(mesh, size, colorIndex);
    cube.spawnGameTime = gameTime;

    const x =
      (Math.random() - 0.5) * Layout.playBounds.x * Layout.spawnSpreadX;
    const z =
      (Math.random() - 0.5) * Layout.playBounds.z * Layout.spawnSpreadZ;
    cube.position.set(x, -5, z);
    mesh.position.copy(cube.position);

    const launchMul = getLaunchSpeedMultiplier(gameTime);
    const speed =
      (Layout.launchSpeedMin +
        Math.random() * (Layout.launchSpeedMax - Layout.launchSpeedMin)) *
      launchMul;
    const angle = (Math.random() - 0.5) * 0.35;
    const lateral = Layout.portrait ? 0.5 : 1.2;
    const depth = Layout.portrait ? 0.2 : 0.7;
    cube.velocity.set(Math.sin(angle) * lateral, speed, Math.cos(angle) * depth);

    cube.angularVelocity.set(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6
    );

    this.scene.add(mesh);
    cubes.push(cube);
  }
}

// ---------------------------------------------------------------------------
// SwipeTrail
// ---------------------------------------------------------------------------

class SwipeTrail {
  constructor(scene, maxPoints = SWIPE_TRAIL_MAX_POINTS) {
    this.maxPoints = maxPoints;
    this.points = [];
    this._tubeDirty = false;
    this._tubeRaf = null;
    this.geo = new THREE.BufferGeometry();
    this.mat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    });
    this.line = new THREE.Line(this.geo, this.mat);
    this.line.frustumCulled = false;
    scene.add(this.line);

    this.tubeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.tube = new THREE.Mesh(new THREE.BufferGeometry(), this.tubeMat);
    this.tube.frustumCulled = false;
    this.tube.visible = false;
    scene.add(this.tube);
    this._tubeRadius = 0.07;
  }

  addPoint(worldPoint, screenX, screenY) {
    const last = this.points[this.points.length - 1];
    if (
      last &&
      Math.hypot(screenX - last.screen.x, screenY - last.screen.y) <
        SWIPE_TRAIL_MIN_POINT_DIST
    ) {
      return false;
    }

    this.points.push({
      world: worldPoint.clone(),
      screen: { x: screenX, y: screenY },
    });
    if (this.points.length > this.maxPoints) this.points.shift();
    this._updateLineGeometry();
    this._scheduleTubeUpdate();
    return true;
  }

  clear() {
    if (this._tubeRaf !== null) {
      cancelAnimationFrame(this._tubeRaf);
      this._tubeRaf = null;
    }
    this._tubeDirty = false;
    this.points.length = 0;
    this.geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([], 3)
    );
    this.tube.visible = false;
    if (this.tube.geometry) this.tube.geometry.dispose();
    this.tube.geometry = new THREE.BufferGeometry();
  }

  getSegment() {
    if (this.points.length < 2) return null;
    const p0 = this.points[this.points.length - 2];
    const p1 = this.points[this.points.length - 1];
    return {
      a: p0.world,
      b: p1.world,
      screenA: p0.screen,
      screenB: p1.screen,
    };
  }

  getRecentSegments() {
    const segs = [];
    for (let i = 1; i < this.points.length; i++) {
      const p0 = this.points[i - 1];
      const p1 = this.points[i];
      segs.push({
        a: p0.world,
        b: p1.world,
        screenA: p0.screen,
        screenB: p1.screen,
      });
    }
    return segs;
  }

  getTailSegments(count = SWIPE_TAIL_SEGMENTS) {
    const all = this.getRecentSegments();
    if (all.length <= count) return all;
    return all.slice(-count);
  }

  _updateLineGeometry() {
    const arr = new Float32Array(this.points.length * 3);
    for (let i = 0; i < this.points.length; i++) {
      arr[i * 3] = this.points[i].world.x;
      arr[i * 3 + 1] = this.points[i].world.y;
      arr[i * 3 + 2] = this.points[i].world.z;
    }
    this.geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    this.geo.attributes.position.needsUpdate = true;
  }

  _scheduleTubeUpdate() {
    this._tubeDirty = true;
    if (this._tubeRaf !== null) return;
    this._tubeRaf = requestAnimationFrame(() => {
      this._tubeRaf = null;
      if (!this._tubeDirty) return;
      this._tubeDirty = false;
      this._updateTubeGeometry();
    });
  }

  _updateTubeGeometry() {
    if (this.points.length < 2) {
      this.tube.visible = false;
      return;
    }

    const curve = new THREE.CatmullRomCurve3(
      this.points.map((p) => p.world)
    );
    const segments = Math.max(8, this.points.length * 3);
    const tubeGeo = new THREE.TubeGeometry(
      curve,
      segments,
      this._tubeRadius,
      6,
      false
    );
    this.tube.geometry.dispose();
    this.tube.geometry = tubeGeo;
    this.tube.visible = true;
  }
}

// ---------------------------------------------------------------------------
// SliceSystem
// ---------------------------------------------------------------------------

class SliceSystem {
  constructor(scene, camera, canvas) {
    this.scene = scene;
    this.camera = camera;
    this.canvas = canvas;
    this.slicedThisFrame = new Set();
    this.slicedThisSwipe = new Set();
    this.debugGroup = new THREE.Group();
    this.scene.add(this.debugGroup);
    this._planeHelper = null;
    this._swipeDebug = null;
    this._proj = new THREE.Vector3();
    this._boxCorners = [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ];
    this._camPos = new THREE.Vector3();
    this._rayHit = new THREE.Vector3();
    this._sliceRay = new THREE.Raycaster();
    this._hitPoint = new THREE.Vector3();
    this._ndc = new THREE.Vector2();
  }

  _screenToNdc(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    this._ndc.x = ((screenX - rect.left) / rect.width) * 2 - 1;
    this._ndc.y = -((screenY - rect.top) / rect.height) * 2 + 1;
    return this._ndc;
  }

  /** Raycast along screen swipe; returns world hit points on this mesh. */
  _raycastSwipeOnMesh(mesh, screenA, screenB) {
    mesh.updateMatrixWorld(true);
    const hits = [];
    for (let i = 0; i <= SWIPE_RAY_SAMPLES; i++) {
      const t = i / SWIPE_RAY_SAMPLES;
      const sx = screenA.x + (screenB.x - screenA.x) * t;
      const sy = screenA.y + (screenB.y - screenA.y) * t;
      this._sliceRay.setFromCamera(this._screenToNdc(sx, sy), this.camera);
      const intersects = this._sliceRay.intersectObject(mesh, false);
      if (intersects.length > 0) hits.push(intersects[0].point);
    }
    return hits;
  }

  _averagePoints(points, target) {
    target.set(0, 0, 0);
    if (points.length === 0) return target;
    for (const p of points) target.add(p);
    target.multiplyScalar(1 / points.length);
    return target;
  }

  _screenToWorld(screenX, screenY, depth) {
    const rect = this.canvas.getBoundingClientRect();
    const ndcX = ((screenX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((screenY - rect.top) / rect.height) * 2 + 1;
    this._sliceRay.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);

    const planeNormal = new THREE.Vector3();
    this.camera.getWorldDirection(planeNormal);
    this.camera.getWorldPosition(this._camPos);
    const planePoint = this._camPos.clone().addScaledVector(planeNormal, depth);

    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      planeNormal,
      planePoint
    );
    const hit = new THREE.Vector3();
    if (!this._sliceRay.ray.intersectPlane(plane, hit)) return null;
    return hit;
  }

  resetFrame() {
    if (DEBUG) this._clearDebug();
  }

  resetSwipe() {
    this.slicedThisSwipe.clear();
    this.slicedThisFrame.clear();
  }

  /**
   * Build slicing plane from a world-space swipe segment.
   */
  planeFromSwipe(a, b) {
    const dir = new THREE.Vector3().subVectors(b, a);
    if (dir.lengthSq() < 1e-6) return null;
    dir.normalize();

    const camDir = new THREE.Vector3();
    this.camera.getWorldDirection(camDir);

    const normal = new THREE.Vector3().crossVectors(dir, camDir);
    if (normal.lengthSq() < 1e-6) {
      normal.crossVectors(dir, new THREE.Vector3(0, 1, 0));
    }
    normal.normalize();

    const midpoint = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      normal,
      midpoint
    );
    return { normal, midpoint };
  }

  trySlice(cubes, swipeSegment, onCubeSliced, targetColorIndex, penalizeWrong = true) {
    if (!swipeSegment || !onCubeSliced) return;

    const { screenA, screenB } = swipeSegment;
    if (!screenA || !screenB) return;
    if (
      Math.hypot(screenB.x - screenA.x, screenB.y - screenA.y) <
      SWIPE_TRAIL_MIN_POINT_DIST
    ) {
      return;
    }

    for (const cube of cubes) {
      if (!cube.alive || !cube.isWhole) continue;
      if (this.slicedThisSwipe.has(cube.id)) continue;
      const rayHits = this._raycastSwipeOnMesh(cube.mesh, screenA, screenB);
      if (rayHits.length < SWIPE_MIN_RAY_HITS) continue;
      if (!this._cubeSwipeNearScreenBox(cube, screenA, screenB)) continue;

      this._averagePoints(rayHits, this._hitPoint);
      this.camera.getWorldPosition(this._camPos);
      const depth = this._hitPoint.distanceTo(this._camPos);

      const a = this._screenToWorld(screenA.x, screenA.y, depth);
      const b = this._screenToWorld(screenB.x, screenB.y, depth);
      if (!a || !b) continue;

      const planeData = this.planeFromSwipe(a, b);
      if (!planeData) continue;

      const { normal } = planeData;
      if (DEBUG) {
        const debugPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
          normal,
          this._hitPoint
        );
        this._showDebugPlane(debugPlane, this._hitPoint, normal, a, b);
        this._showDebugBBox(cube);
      }

      const cutPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
        normal,
        this._hitPoint
      );
      const wrongColor = cube.colorIndex !== targetColorIndex;
      const penalize = wrongColor && penalizeWrong;
      const halves = this._sliceCube(cube, cutPlane, normal, a, b, penalize);
      if (!halves) continue;

      for (const half of halves) cubes.push(half);

      this.slicedThisSwipe.add(cube.id);
      this.slicedThisFrame.add(cube.id);
      onCubeSliced(cube, {
        wrong: penalize,
        halves,
        slicedAt: performance.now(),
      });

      if (DEBUG) {
        console.log(
          `[slice] cube #${cube.id} (${COLOR_NAMES[cube.colorIndex]})`
        );
      }
    }
  }

  trySliceAlongTrail(
    cubes,
    trail,
    onCubeSliced,
    targetColorIndex,
    fullTrail = false,
    penalizeWrong = true
  ) {
    const segs = fullTrail
      ? trail.getRecentSegments()
      : trail.getTailSegments();
    for (const seg of segs) {
      this.trySlice(cubes, seg, onCubeSliced, targetColorIndex, penalizeWrong);
    }
  }

  _worldToScreen(v) {
    this._proj.copy(v).project(this.camera);
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((this._proj.x + 1) * 0.5) * rect.width + rect.left,
      y: ((-this._proj.y + 1) * 0.5) * rect.height + rect.top,
    };
  }

  _getBoxScreenRect(box) {
    const { min, max } = box;
    const corners = this._boxCorners;
    corners[0].set(min.x, min.y, min.z);
    corners[1].set(max.x, min.y, min.z);
    corners[2].set(min.x, max.y, min.z);
    corners[3].set(max.x, max.y, min.z);
    corners[4].set(min.x, min.y, max.z);
    corners[5].set(max.x, min.y, max.z);
    corners[6].set(min.x, max.y, max.z);
    corners[7].set(max.x, max.y, max.z);

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const c of corners) {
      const s = this._worldToScreen(c);
      minX = Math.min(minX, s.x);
      minY = Math.min(minY, s.y);
      maxX = Math.max(maxX, s.x);
      maxY = Math.max(maxY, s.y);
    }

    return { minX, minY, maxX, maxY };
  }

  _segmentIntersectsRect(ax, ay, bx, by, rect, pad) {
    const minX = rect.minX - pad;
    const minY = rect.minY - pad;
    const maxX = rect.maxX + pad;
    const maxY = rect.maxY + pad;

    if (ax >= minX && ax <= maxX && ay >= minY && ay <= maxY) return true;
    if (bx >= minX && bx <= maxX && by >= minY && by <= maxY) return true;

    const samples = SWIPE_RAY_SAMPLES;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const x = ax + (bx - ax) * t;
      const y = ay + (by - ay) * t;
      if (x >= minX && x <= maxX && y >= minY && y <= maxY) return true;
    }

    const edges = [
      [minX, minY, maxX, minY],
      [maxX, minY, maxX, maxY],
      [maxX, maxY, minX, maxY],
      [minX, maxY, minX, minY],
    ];

    for (const [x1, y1, x2, y2] of edges) {
      if (SliceSystem._segmentsCross(ax, ay, bx, by, x1, y1, x2, y2)) return true;
    }

    return false;
  }

  static _segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
    const det = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
    if (Math.abs(det) < 1e-9) return false;
    const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / det;
    const u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / det;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  /** Tight screen bounds — swipe must cross the projected box, not a huge pad. */
  _cubeSwipeNearScreenBox(cube, screenA, screenB) {
    cube.mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(cube.mesh);
    const screenRect = this._getBoxScreenRect(box);
    const screenW = screenRect.maxX - screenRect.minX;
    const screenH = screenRect.maxY - screenRect.minY;
    const pad = Math.max(
      SCREEN_HIT_PADDING_MIN,
      Math.min(
        SCREEN_HIT_PADDING,
        Math.min(screenW, screenH) * SCREEN_HIT_PADDING_RATIO
      )
    );

    if (
      !this._segmentIntersectsRect(
        screenA.x,
        screenA.y,
        screenB.x,
        screenB.y,
        screenRect,
        pad
      )
    ) {
      return false;
    }

    const cx = (screenRect.minX + screenRect.maxX) * 0.5;
    const cy = (screenRect.minY + screenRect.maxY) * 0.5;
    const maxDist =
      Math.hypot(screenW, screenH) * 0.55 + pad;
    return (
      this._segmentDistanceToPoint(
        screenA.x,
        screenA.y,
        screenB.x,
        screenB.y,
        cx,
        cy
      ) <= maxDist
    );
  }

  _segmentDistanceToPoint(ax, ay, bx, by, px, py) {
    const abx = bx - ax;
    const aby = by - ay;
    const apx = px - ax;
    const apy = py - ay;
    const abLenSq = abx * abx + aby * aby;
    if (abLenSq < 1e-6) return Math.hypot(apx, apy);
    let t = (apx * abx + apy * aby) / abLenSq;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + abx * t;
    const cy = ay + aby * t;
    return Math.hypot(px - cx, py - cy);
  }

  _sliceCube(cube, worldPlane, worldNormal, swipeA, swipeB, gentleSeparation = false) {
    const mesh = cube.mesh;
    mesh.updateMatrixWorld(true);

    const invMatrix = new THREE.Matrix4().copy(mesh.matrixWorld).invert();
    const localPlane = worldPlane.clone().applyMatrix4(invMatrix);

    let geometry = mesh.geometry;
    if (geometry.index) {
      geometry = geometry.toNonIndexed();
    }

    const sliced = MeshSlicer.slice(geometry, localPlane);
    if (geometry !== mesh.geometry) geometry.dispose();
    if (!sliced) return false;

    const capGeos = [
      MeshSlicer.buildCapGeometry(sliced.capContour, localPlane.normal),
      MeshSlicer.buildCapGeometry(
        sliced.capContour,
        localPlane.normal.clone().negate()
      ),
    ];

    let separation = worldNormal
      .clone()
      .multiplyScalar(SLICE_SEPARATION_FORCE * 0.5);

    const sliceTangent = new THREE.Vector3().subVectors(swipeB, swipeA);
    sliceTangent.y *= 0.25;
    if (sliceTangent.lengthSq() < 1e-6) {
      sliceTangent.crossVectors(new THREE.Vector3(0, 1, 0), worldNormal);
    } else {
      sliceTangent.normalize();
    }
    sliceTangent.addScaledVector(
      worldNormal,
      -sliceTangent.dot(worldNormal)
    );
    if (sliceTangent.lengthSq() < 1e-6) {
      sliceTangent.set(1, 0, 0);
    } else {
      sliceTangent.normalize();
    }

    let lateral = sliceTangent.multiplyScalar(SLICE_LATERAL_FORCE);

    if (gentleSeparation) {
      separation.multiplyScalar(WRONG_SLICE_SEPARATION_SCALE);
      lateral.multiplyScalar(WRONG_SLICE_LATERAL_SCALE);
    }

    this.scene.remove(mesh);
    cube.dispose();
    cube.alive = false;
    cube.isWhole = false;

    const halves = [];
    const bodyGeos = [sliced.positive, sliced.negative];
    const signs = [1, -1];

    for (let i = 0; i < 2; i++) {
      const mat = CubeObject.createMaterial(
        gentleSeparation ? WRONG_SLICE_COLOR : cube.color
      );
      const halfMesh = new THREE.Mesh(bodyGeos[i], mat);
      halfMesh.castShadow = true;
      halfMesh.receiveShadow = true;
      halfMesh.position.copy(cube.position);
      halfMesh.rotation.copy(mesh.rotation);

      if (capGeos[i]) {
        const capMesh = new THREE.Mesh(capGeos[i], mat);
        capMesh.renderOrder = 2;
        halfMesh.add(capMesh);
      }

      halfMesh.updateMatrixWorld(true);

      const half = new CubeObject(halfMesh, cube.size * 0.5, cube.colorIndex);
      half.isWhole = false;
      half.shrinkElapsed = 0;
      half.mesh.scale.set(1, 1, 1);
      half.position.copy(cube.position);
      half.velocity.copy(cube.velocity);
      half.angularVelocity.copy(cube.angularVelocity);
      half.velocity.add(separation.clone().multiplyScalar(signs[i]));
      half.velocity.add(lateral.clone().multiplyScalar(signs[i]));
      const jitter = gentleSeparation ? SLICE_X_JITTER * 0.15 : SLICE_X_JITTER;
      const spin = gentleSeparation ? 2.5 : 8;
      half.velocity.x += (Math.random() - 0.5) * jitter;
      half.angularVelocity.add(
        new THREE.Vector3(
          (Math.random() - 0.5) * spin,
          (Math.random() - 0.5) * spin,
          (Math.random() - 0.5) * spin
        )
      );
      if (gentleSeparation) {
        half.freezeShrink = true;
        half.wrongSliceBlink = true;
        half.blinkPhase = 0;
      }

      this.scene.add(halfMesh);
      halves.push(half);
    }

    return halves;
  }

  _showDebugPlane(plane, midpoint, normal, a, b) {
    this._clearDebug();

    const size = 4;
    const planeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      })
    );
    planeMesh.position.copy(midpoint);
    planeMesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal.clone().normalize()
    );
    this.debugGroup.add(planeMesh);
    this._planeHelper = planeMesh;

    const swipeGeo = new THREE.BufferGeometry().setFromPoints([a, b]);
    const swipeLine = new THREE.Line(
      swipeGeo,
      new THREE.LineBasicMaterial({ color: 0xff4488 })
    );
    this.debugGroup.add(swipeLine);
    this._swipeDebug = swipeLine;

    const box = new THREE.Box3().setFromCenterAndSize(
      midpoint,
      new THREE.Vector3(size, size, 0.05)
    );
    const boxEdges = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(size, size, 0.05)
    );
    const boxLine = new THREE.LineSegments(
      boxEdges,
      new THREE.LineBasicMaterial({ color: 0xffff00 })
    );
    box.getCenter(boxLine.position);
    this.debugGroup.add(boxLine);
  }

  _showDebugBBox(cube) {
    const box = new THREE.Box3().setFromObject(cube.mesh);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const edges = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(size.x, size.y, size.z)
    );
    const lines = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffff00 })
    );
    lines.position.copy(center);
    this.debugGroup.add(lines);
  }

  _clearDebug() {
    while (this.debugGroup.children.length) {
      const child = this.debugGroup.children[0];
      child.geometry?.dispose();
      child.material?.dispose();
      this.debugGroup.remove(child);
    }
    this._planeHelper = null;
    this._swipeDebug = null;
  }
}

// ---------------------------------------------------------------------------
// Game
// ---------------------------------------------------------------------------

class Game {
  constructor() {
    this.gameStageEl = document.getElementById("game-stage");
    this.canvas = document.getElementById("game-canvas");
    this.cubes = [];
    this.clock = new THREE.Clock();
    this.pointer = new THREE.Vector2();
    this.isDragging = false;
    this._swipeGestureActive = false;
    this.lastScreen = new THREE.Vector2();
    this.swipeScreenDist = 0;
    this.raycaster = new THREE.Raycaster();
    this.slicePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    this.state = "menu";
    this.gameTime = 0;
    this.targetColorIndex = 0;
    this.targetChangeTimer = 0;
    this.strikes = 0;
    this.correctSlices = 0;
    this.wrongSlices = 0;
    this._calloutTimer = null;
    this._wrongSliceTimer = null;
    this._wrongRevealTimer = null;
    this._wrongRevealHalves = [];
    this._swipeSliceQueue = [];
    this._missTimer = null;
    this._colorGraceEndAt = null;
    this._wrongStrikeCooldownUntil = 0;
    this._pausedByUser = false;
    this.targetColorSince = 0;
    this._difficultyDebugTimer = 0;

    this.startScreenEl = document.getElementById("start-screen");
    this.wrongFlashEl = document.getElementById("wrong-flash");
    this.startBtn = document.getElementById("start-btn");
    this.targetCalloutEl = document.getElementById("target-callout");
    this.missCalloutEl = document.getElementById("miss-callout");
    this.livesEl = document.getElementById("lives");
    this.lifeEls = [...this.livesEl.querySelectorAll(".life")];
    this.gameTimeEl = document.getElementById("game-time");
    this.gameOverEl = document.getElementById("game-over");
    this.gameOverTimeEl = document.getElementById("game-over-time");
    this.restartBtn = document.getElementById("restart-btn");

    this._initRenderer();
    this._initScene();
    this._initLights();
    this._initPost();
    this._initCRT();
    this._initGlowControl();
    this.physics = new PhysicsSystem();
    this.spawner = new CubeSpawner(this.scene);
    this.trail = new SwipeTrail(this.scene);
    this.slicer = new SliceSystem(this.scene, this.camera, this.canvas);
    this._bindUI();
    this._bindInput();
    this._onResize();
    window.addEventListener("resize", () => this._onResize());
    if (this.gameStageEl) {
      this._resizeObserver = new ResizeObserver(() => this._onResize());
      this._resizeObserver.observe(this.gameStageEl);
    }
    this._animate();
  }

  _getStageSize() {
    if (!this.gameStageEl) {
      return { width: IPAD_PORTRAIT_WIDTH, height: IPAD_PORTRAIT_HEIGHT };
    }
    const width = this.gameStageEl.clientWidth;
    const height = this.gameStageEl.clientHeight;
    if (width < 1 || height < 1) {
      return { width: IPAD_PORTRAIT_WIDTH, height: IPAD_PORTRAIT_HEIGHT };
    }
    return { width, height };
  }

  _bindUI() {
    this.startBtn.addEventListener("click", () => this._startGame());
    this.restartBtn.addEventListener("click", () => this._returnToStartScreen());
  }

  _returnToStartScreen() {
    this._clearAllCubes();
    this._clearRunTimers();
    this._wrongRevealHalves = [];
    this._swipeSliceQueue = [];
    this.isDragging = false;
    this._swipeGestureActive = false;
    this.slicer.resetSwipe();
    this.trail.clear();
    this._hideMissCallout();
    this._hideTargetCallout();
    if (this.wrongFlashEl) this.wrongFlashEl.classList.remove("active");

    this.state = "menu";
    this.gameTime = 0;
    this.targetChangeTimer = 0;
    this.strikes = 0;
    this.correctSlices = 0;
    this.wrongSlices = 0;
    this.spawner.timer = 0;
    this._colorGraceEndAt = null;
    this._wrongStrikeCooldownUntil = 0;
    this._pausedByUser = false;

    this.startScreenEl.classList.remove("hidden");
    this.gameOverEl.classList.add("hidden");
    this.gameTimeEl.classList.add("hidden");
    this.livesEl.classList.add("hidden");
    this._updateSpawnDebug();
  }

  _clearRunTimers() {
    clearTimeout(this._calloutTimer);
    clearTimeout(this._wrongSliceTimer);
    clearTimeout(this._wrongRevealTimer);
    clearTimeout(this._missTimer);
    this._calloutTimer = null;
    this._wrongSliceTimer = null;
    this._wrongRevealTimer = null;
    this._missTimer = null;
  }

  _startGame() {
    this._clearAllCubes();
    this._clearRunTimers();
    this._wrongRevealHalves = [];
    this._swipeSliceQueue = [];
    this.isDragging = false;
    this._swipeGestureActive = false;
    this.slicer.resetSwipe();
    this._hideMissCallout();
    this._hideTargetCallout();
    if (this.wrongFlashEl) this.wrongFlashEl.classList.remove("active");
    this.gameTime = 0;
    this.targetChangeTimer = 0;
    this.strikes = 0;
    this.correctSlices = 0;
    this.wrongSlices = 0;
    this.spawner.timer = 0;
    this._difficultyDebugTimer = 0;
    this._colorGraceEndAt = null;
    this._wrongStrikeCooldownUntil = 0;
    this._pausedByUser = false;
    this.state = "paused";

    this._pickNewTargetColor(false);
    this.targetColorSince = 0;
    this._updateHudColors();

    this.startScreenEl.classList.add("hidden");
    this.gameOverEl.classList.add("hidden");
    this.gameTimeEl.classList.remove("hidden");
    this.livesEl.classList.remove("hidden");
    this._updateLives();
    this._updateSpawnDebug();
    this._showTargetCallout();
  }

  _pickNewTargetColor(avoidRepeat = true) {
    if (!avoidRepeat || COLORS.length < 2) {
      this.targetColorIndex = Math.floor(Math.random() * COLORS.length);
    } else {
      let next = this.targetColorIndex;
      while (next === this.targetColorIndex) {
        next = Math.floor(Math.random() * COLORS.length);
      }
      this.targetColorIndex = next;
    }
    this.targetColorSince = this.gameTime;
    this._updateHudColors();
  }

  _updateHudColors() {
    const name = COLOR_NAMES[this.targetColorIndex];
    const colorClasses = ["color-magenta", "color-cyan", "color-yellow"];
    for (const el of [this.gameTimeEl, this.livesEl]) {
      if (!el) continue;
      colorClasses.forEach((c) => el.classList.remove(c));
      el.classList.add(`color-${name}`);
    }
  }

  _hideTargetCallout() {
    this.targetCalloutEl.classList.remove("show");
    this.targetCalloutEl.classList.add("hidden");
  }

  _beginColorChangeGrace(durationMs = COLOR_CHANGE_GRACE_MS) {
    this._colorGraceEndAt = performance.now() + durationMs;
    console.log(
      `[grace] started (${(durationMs / 1000).toFixed(2)}s until penalized wrong slices)`
    );
  }

  /** True while within the 2s window after a color-change callout (play resumes). */
  _isInColorChangeGraceAt(time = performance.now()) {
    if (this._colorGraceEndAt === null) return false;
    return time < this._colorGraceEndAt;
  }

  _isInColorChangeGrace() {
    return this._isInColorChangeGraceAt(performance.now());
  }

  _isOnWrongStrikeCooldown() {
    return performance.now() < this._wrongStrikeCooldownUntil;
  }

  _beginWrongStrikeCooldown() {
    this._wrongStrikeCooldownUntil =
      performance.now() + WRONG_STRIKE_COOLDOWN_MS;
  }

  _canPenalizeWrongStrike() {
    return !this._isInColorChangeGrace() && !this._isOnWrongStrikeCooldown();
  }

  _penalizeWrongSlicesNow() {
    return this._canPenalizeWrongStrike();
  }

  _getGraceSecondsLeft(at = performance.now()) {
    if (this._colorGraceEndAt === null) return null;
    return Math.max(0, (this._colorGraceEndAt - at) / 1000);
  }

  _logGraceClockUpdate() {
    if (!this._isInColorChangeGrace()) return;
    const left = this._getGraceSecondsLeft();
    if (left === null) return;
    console.log(`[grace] ${left.toFixed(2)}s left`);
  }

  _toggleUserPause() {
    if (this.state === "playing") {
      this._pausedByUser = true;
      this.state = "paused";
      console.log("[pause] game paused (P)");
      return;
    }
    if (this.state === "paused" && this._pausedByUser) {
      this._pausedByUser = false;
      this.state = "playing";
      console.log("[pause] game resumed (P)");
    }
  }

  _showTargetCallout() {
    clearTimeout(this._calloutTimer);

    // Grace includes callout pause so 2s of playable time remain after the warning dismisses
    this._beginColorChangeGrace(CALLOUT_DURATION_MS + COLOR_CHANGE_GRACE_MS);

    // 1. Pause physics and show text
    this.state = "paused";
    const name = COLOR_NAMES[this.targetColorIndex];
    this.targetCalloutEl.innerHTML = `<span class="callout-label">SLICE</span><span class="callout-name">${name.toUpperCase()}</span>`;
    this.targetCalloutEl.classList.remove(
      "hidden",
      "show",
      "flash",
      "color-magenta",
      "color-cyan",
      "color-yellow"
    );
    this.targetCalloutEl.classList.add("show", "flash", `color-${name}`);
    void this.targetCalloutEl.offsetWidth;
    this._updateSpawnDebug();

    // 2. Wait 1 second, then hide text and resume
    this._calloutTimer = setTimeout(() => {
      this._hideTargetCallout();
      if (this.state === "paused" && !this._pausedByUser) {
        this.state = "playing";
      }
      this._updateSpawnDebug();
    }, CALLOUT_DURATION_MS);
  }

  _logSlice(cube, slicedAt) {
    const gameSec = this.gameTime.toFixed(2);
    const boxColor = COLOR_NAMES[cube.colorIndex] ?? "?";
    const targetColor = COLOR_NAMES[this.targetColorIndex] ?? "?";
    const boxAge = (this.gameTime - (cube.spawnGameTime ?? this.gameTime)).toFixed(
      2
    );
    const targetAge = (this.gameTime - (this.targetColorSince ?? 0)).toFixed(2);
    const wrongColor = cube.colorIndex !== this.targetColorIndex;
    const inGrace = wrongColor && this._isInColorChangeGraceAt(slicedAt);
    const graceLabel = inGrace
      ? `${this._getGraceSecondsLeft(slicedAt).toFixed(2)}s`
      : "—";
    let result = "right";
    if (wrongColor) {
      result = inGrace ? "grace" : "wrong";
    }
    console.log(
      `[slice] ${gameSec}s > ${boxColor}@${boxAge}s > ${targetColor}@${targetAge}s > ${graceLabel} > ${result}`
    );
  }

  _onCubeSliced(cube, info = {}) {
    if (this.state !== "playing") return;
    const slicedAt = info.slicedAt ?? performance.now();
    const wrongColor = cube.colorIndex !== this.targetColorIndex;
    const inGrace = wrongColor && this._isInColorChangeGraceAt(slicedAt);
    this._logSlice(cube, slicedAt);
    this._swipeSliceQueue.push({
      cube,
      info: {
        ...info,
        slicedAt,
        wrongColor,
        inGrace,
        wrong: wrongColor && !inGrace,
      },
    });
  }

  _finishSwipe() {
    const queue = this._swipeSliceQueue;
    this._swipeSliceQueue = [];
    if (queue.length === 0 || this.state !== "playing") return;

    const wrongHits = [];

    for (const { info, cube } of queue) {
      const wrongColor =
        info.wrongColor ?? cube.colorIndex !== this.targetColorIndex;
      const inGrace =
        info.inGrace ??
        (wrongColor && this._isInColorChangeGraceAt(info.slicedAt));
      const penalize = wrongColor && !inGrace;

      if (!wrongColor) {
        this.correctSlices += 1;
      } else if (penalize) {
        wrongHits.push({ cube, info });
      }
    }

    if (wrongHits.length === 0) {
      this._updateSpawnDebug();
      return;
    }

    this.wrongSlices += wrongHits.length;

    if (this._isOnWrongStrikeCooldown()) {
      this._updateSpawnDebug();
      return;
    }

    this.strikes += 1;
    for (const { info } of wrongHits) {
      if (info.halves?.length) {
        this._wrongRevealHalves.push(...info.halves);
      }
    }
    this._updateLives();

    clearTimeout(this._wrongRevealTimer);
    this.state = "wrongReveal";
    this._wrongRevealTimer = setTimeout(() => {
      this._wrongRevealTimer = null;
      this._wrongSliceFeedback(this.strikes >= MAX_STRIKES);
    }, WRONG_SLICE_REVEAL_MS);
    this._updateSpawnDebug();
  }

  _clearWrongRevealHalves() {
    for (let i = this.cubes.length - 1; i >= 0; i--) {
      const c = this.cubes[i];
      if (!c.freezeShrink) continue;
      this.scene.remove(c.mesh);
      c.dispose();
      this.cubes.splice(i, 1);
    }
    this._wrongRevealHalves = [];
  }

  _pauseWithFlash(onDone) {
    clearTimeout(this._wrongSliceTimer);
    clearTimeout(this._missTimer);
    this._wrongSliceTimer = null;
    this.state = "paused";

    if (this.wrongFlashEl) {
      this.wrongFlashEl.classList.remove("active");
      void this.wrongFlashEl.offsetWidth;
      this.wrongFlashEl.classList.add("active");
    }

    this._missTimer = setTimeout(() => {
      this._missTimer = null;
      if (this.wrongFlashEl) this.wrongFlashEl.classList.remove("active");
      onDone();
      this._updateSpawnDebug();
    }, WRONG_SLICE_PAUSE_MS);
  }

  _wrongSliceFeedback(lost) {
    clearTimeout(this._wrongRevealTimer);
    this._wrongRevealTimer = null;
    this._pauseWithFlash(() => {
      this._clearWrongRevealHalves();
      if (lost) {
        this._gameOver();
      } else if (this.state === "paused") {
        this.state = "playing";
        this._beginWrongStrikeCooldown();
      }
    });
  }

  _hideMissCallout() {
    if (!this.missCalloutEl) return;
    this.missCalloutEl.classList.remove("show", "flash");
    this.missCalloutEl.classList.add("hidden");
  }

  _showMissCallout() {
    if (!this.missCalloutEl) return;
    this.missCalloutEl.classList.remove("hidden");
    this.missCalloutEl.classList.add("show", "flash");
    void this.missCalloutEl.offsetWidth;
  }

  _bottomMissFeedback(lost) {
    this._showMissCallout();
    this._pauseWithFlash(() => {
      this._hideMissCallout();
      if (lost) {
        this._gameOver();
      } else if (this.state === "paused") {
        this.state = "playing";
        this._beginWrongStrikeCooldown();
      }
    });
  }

  _removeCube(cube) {
    const idx = this.cubes.indexOf(cube);
    if (idx === -1) return;
    this._stopCubeBlink(cube);
    this.scene.remove(cube.mesh);
    cube.dispose();
    this.cubes.splice(idx, 1);
  }

  _stopCubeBlink(cube) {
    if (!cube.blinking) return;
    cube.blinking = false;
    const mat = cube.mesh.material;
    if (mat?.emissive) {
      mat.emissive.setHex(0x000000);
      mat.emissiveIntensity = 0;
    }
  }

  _bounceTargetCube(cube) {
    const yMin = Layout.playBounds.yMin;
    cube.bottomBounceCount = 1;
    cube.leftBottomSinceBounce = false;
    cube.blinking = true;
    cube.blinkPhase = 0;
    cube.position.y = yMin + cube.size * 0.5 + 0.15;
    const launchMul = getLaunchSpeedMultiplier(this.gameTime);
    cube.velocity.y =
      (Layout.launchSpeedMin +
        Math.random() * (Layout.launchSpeedMax - Layout.launchSpeedMin)) *
      launchMul;
    cube.velocity.x *= 0.55;
    cube.velocity.z *= 0.55;
    cube.mesh.position.copy(cube.position);
    const mat = cube.mesh.material;
    if (mat?.emissive) {
      mat.emissive.setHex(cube.color);
      mat.emissiveIntensity = 0;
    }
  }

  _onTargetBottomMiss(cube) {
    if (this.state !== "playing") return;
    this._removeCube(cube);
    if (this._isOnWrongStrikeCooldown()) return;
    this.strikes += 1;
    this._updateLives();
    this._bottomMissFeedback(this.strikes >= MAX_STRIKES);
  }

  _handleTargetBottomBounces() {
    if (this.state !== "playing") return;

    const yMin = Layout.playBounds.yMin;
    for (const cube of this.cubes) {
      if (!cube.alive || !cube.isWhole) continue;
      if (cube.colorIndex !== this.targetColorIndex) continue;

      const bottomY = cube.position.y - cube.size * 0.5;
      const atBottom = bottomY <= yMin + BOTTOM_HIT_EPS;

      if (!atBottom) {
        if (
          cube.bottomBounceCount > 0 &&
          bottomY > yMin + BOTTOM_LEAVE_EPS
        ) {
          cube.leftBottomSinceBounce = true;
        }
        continue;
      }

      if (cube.bottomBounceCount === 0) {
        this._bounceTargetCube(cube);
      } else if (cube.leftBottomSinceBounce) {
        this._onTargetBottomMiss(cube);
        return;
      }
    }
  }

  _updateCubeBlinks(dt) {
    for (const cube of this.cubes) {
      if (!cube.alive || !cube.blinking) continue;
      const mat = cube.mesh.material;
      if (!mat?.emissive) continue;
      cube.blinkPhase += dt * BOTTOM_BLINK_HZ * Math.PI * 2;
      const on = Math.sin(cube.blinkPhase) > 0;
      mat.emissive.setHex(cube.color);
      mat.emissiveIntensity = on ? 0.55 : 0.04;
    }
  }

  _updateWrongSliceBlinks(dt) {
    for (const cube of this.cubes) {
      if (!cube.alive || !cube.wrongSliceBlink) continue;
      const mat = cube.mesh.material;
      if (!mat?.emissive) continue;
      cube.blinkPhase += dt * WRONG_SLICE_BLINK_HZ * Math.PI * 2;
      const on = Math.sin(cube.blinkPhase) > 0;
      mat.color.setHex(WRONG_SLICE_COLOR);
      mat.emissive.setHex(WRONG_SLICE_EMISSIVE);
      mat.emissiveIntensity = on ? 0.9 : 0.12;
    }
  }

  _updateLives() {
    const n = this.lifeEls.length;
    this.lifeEls.forEach((el, i) => {
      const lost = i >= n - this.strikes;
      el.textContent = "X";
      el.classList.toggle("used", lost);
    });
  }

  _gameOver() {
    this._clearRunTimers();
    this._clearAllCubes();
    this._wrongRevealHalves = [];
    this._swipeSliceQueue = [];
    this.isDragging = false;
    this._swipeGestureActive = false;
    this.slicer.resetSwipe();
    this._hideMissCallout();
    this._hideTargetCallout();
    if (this.wrongFlashEl) this.wrongFlashEl.classList.remove("active");

    this.state = "lost";
    if (this.gameOverTimeEl) {
      this.gameOverTimeEl.textContent = formatGameTime(this.gameTime);
    }
    this.gameTimeEl.classList.add("hidden");
    this.livesEl.classList.add("hidden");
    this.gameOverEl.classList.remove("hidden");
    this._updateSpawnDebug();
  }

  _clearAllCubes() {
    for (const cube of this.cubes) {
      this.scene.remove(cube.mesh);
      cube.dispose();
    }
    this.cubes.length = 0;
  }

  _updateSpawnDebug() {
    if (this.gameTimeEl) {
      this.gameTimeEl.textContent = formatGameTime(this.gameTime);
    }
  }

  _logDifficultyDebug() {
    const t = this.gameTime;
    const spawnSec = getSpawnInterval(t);
    const gravity = getGravity(t);
    const whole = this.cubes.filter((c) => c.isWhole && c.alive).length;
    console.log(
      `[difficulty] ${t.toFixed(1)}s | spawn every ${spawnSec.toFixed(2)}s | gravity ${gravity.toFixed(2)} | ${whole}/${MAX_CUBES} cubes`
    );
  }

  _updateGameRules(dt) {
    if (this.state !== "playing") return;

    this.gameTime += dt;
    this.targetChangeTimer += dt;

    this._difficultyDebugTimer += dt;
    if (this._difficultyDebugTimer >= DIFFICULTY_DEBUG_INTERVAL) {
      this._difficultyDebugTimer = 0;
      this._logDifficultyDebug();
    }

    const interval = getTargetChangeInterval(this.gameTime);
    if (this.targetChangeTimer >= interval) {
      this.targetChangeTimer = 0;
      this._pickNewTargetColor(true);
      this._showTargetCallout();
    }

    this._updateSpawnDebug();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(BG_COLOR);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(BG_COLOR);
    this.scene.fog = new THREE.Fog(BG_COLOR, 12, 32);

    applyLayout();
    const { width: stageW, height: stageH } = this._getStageSize();
    const aspect = stageW / stageH;
    this.camera = new THREE.PerspectiveCamera(Layout.cameraFov, aspect, 0.1, 80);
    this.camera.position.copy(Layout.cameraPos);
    this.camera.lookAt(Layout.cameraLookAt);

    const floorGeo = new THREE.PlaneGeometry(36, 36);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -5;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  _initLights() {
    const ambient = new THREE.AmbientLight(0x222228, 0.18);
    this.scene.add(ambient);

    this.topLight = new THREE.DirectionalLight(0xfff8f0, 2.4);
    this.topLight.position.set(0, 20, 8);
    this.topLight.target.position.set(0, 4, 0);
    this.topLight.castShadow = true;
    this.topLight.shadow.mapSize.set(2048, 2048);
    this.topLight.shadow.camera.near = 0.5;
    this.topLight.shadow.camera.far = 40;
    this.topLight.shadow.camera.left = -16;
    this.topLight.shadow.camera.right = 16;
    this.topLight.shadow.camera.top = 18;
    this.topLight.shadow.camera.bottom = -14;
    this.topLight.shadow.bias = -0.0008;
    this.scene.add(this.topLight);
    this.scene.add(this.topLight.target);

    this.bottomLight = new THREE.DirectionalLight(0xe8eeff, 0.42);
    this.bottomLight.position.set(0, -16, 6);
    this.bottomLight.target.position.set(0, 5, 0);
    this.scene.add(this.bottomLight);
    this.scene.add(this.bottomLight.target);
  }

  _initPost() {
    const { width, height } = this._getStageSize();
    const size = new THREE.Vector2(width, height);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.bloomPass = new UnrealBloomPass(size, 0.45, 0.4, 0.72);
    this.composer.addPass(this.bloomPass);

    this.composer.addPass(new OutputPass());

    this.crtPass = new ShaderPass(CRTSubPixelShader);
    this.composer.addPass(this.crtPass);
  }

  _initCRT() {
    this.crtEnabled = true;
    this.scanlinesEl = document.querySelector(".scanlines");
    this.vignetteEl = document.querySelector(".vignette");
    this.crtToggleBtn = document.getElementById("toggleCRT");

    this._setCRTEnabled(true);

    if (this.crtToggleBtn) {
      this.crtToggleBtn.addEventListener("click", () => {
        this._setCRTEnabled(!this.crtEnabled);
      });
    }
  }

  _setCRTEnabled(enabled) {
    this.crtEnabled = enabled;
    this.crtPass.uniforms.uCRTEnabled.value = enabled ? 1 : 0;

    const overlayDisplay = enabled ? "block" : "none";
    if (this.scanlinesEl) this.scanlinesEl.style.display = overlayDisplay;
    if (this.vignetteEl) this.vignetteEl.style.display = "none";

    if (this.crtToggleBtn) {
      this.crtToggleBtn.textContent = enabled ? "CRT ON" : "CRT OFF";
      this.crtToggleBtn.classList.toggle("active", enabled);
    }
  }

  _initGlowControl() {
    this.glowSlider = document.getElementById("glowSlider");
    this.glowValueEl = document.getElementById("glowValue");

    const apply = (sliderValue) => {
      const t = sliderValue / 100;
      this.bloomPass.strength = t * 0.9;
      this.bloomPass.threshold = THREE.MathUtils.lerp(1.0, 0.38, t);
      if (this.glowValueEl) {
        this.glowValueEl.textContent = `${Math.round(sliderValue)}%`;
      }
    };

    apply(Number(this.glowSlider.value));

    this.glowSlider.addEventListener("input", (e) => {
      apply(Number(e.target.value));
    });
  }

  _bindInput() {
    const canPlay = () => this.state === "playing";

    const endSwipe = (fullTrailPass) => {
      if (!this._swipeGestureActive && !this.isDragging) return;
      const hadGesture = this._swipeGestureActive;
      const dist = this.swipeScreenDist;
      this.isDragging = false;

      if (hadGesture && canPlay() && dist >= SWIPE_MIN_DISTANCE) {
        this.slicer.trySliceAlongTrail(
          this.cubes,
          this.trail,
          (cube, info) => this._onCubeSliced(cube, info),
          this.targetColorIndex,
          fullTrailPass,
          this._penalizeWrongSlicesNow()
        );
      }
      if (hadGesture) {
        if (canPlay()) {
          this._finishSwipe();
        } else {
          this._swipeSliceQueue = [];
        }
      }

      this._swipeGestureActive = false;
      this.slicer.resetSwipe();
      setTimeout(() => this.trail.clear(), 120);
    };

    const onDown = (x, y) => {
      if (!canPlay()) return;
      if (this._swipeGestureActive || this.isDragging) {
        endSwipe(true);
      }
      this.isDragging = true;
      this._swipeGestureActive = true;
      this.swipeScreenDist = 0;
      this._swipeSliceQueue = [];
      this.slicer.resetSwipe();
      this.trail.clear();
      this._updatePointer(x, y);
      this.lastScreen.set(x, y);
      const world = this._screenToWorldAtCubeDepth(x, y);
      if (world) this.trail.addPoint(world, x, y);
    };

    const onMove = (x, y) => {
      if (!this.isDragging || !this._swipeGestureActive || !canPlay()) return;
      this._updatePointer(x, y);
      const dx = x - this.lastScreen.x;
      const dy = y - this.lastScreen.y;
      this.swipeScreenDist += Math.hypot(dx, dy);
      this.lastScreen.set(x, y);
      const world = this._screenToWorldAtCubeDepth(x, y);
      if (world) this.trail.addPoint(world, x, y);

      if (this.swipeScreenDist >= SWIPE_MIN_DISTANCE) {
        this.slicer.trySliceAlongTrail(
          this.cubes,
          this.trail,
          (cube, info) => this._onCubeSliced(cube, info),
          this.targetColorIndex,
          false,
          this._penalizeWrongSlicesNow()
        );
      }
    };

    const onUp = () => {
      if (!this.isDragging && !this._swipeGestureActive) return;
      endSwipe(true);
    };

    this.canvas.addEventListener("mousedown", (e) => onDown(e.clientX, e.clientY));
    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
    window.addEventListener("mouseup", onUp);
    window.addEventListener("blur", onUp);

    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        const t = e.touches[0];
        onDown(t.clientX, t.clientY);
      },
      { passive: false }
    );
    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        const t = e.touches[0];
        onMove(t.clientX, t.clientY);
      },
      { passive: false }
    );
    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      onUp();
    });
    this.canvas.addEventListener("touchcancel", (e) => {
      e.preventDefault();
      onUp();
    });

    window.addEventListener("keydown", (e) => {
      if (e.code !== "KeyP" && e.key !== "p" && e.key !== "P") return;
      if (e.repeat) return;
      this._toggleUserPause();
    });
  }

  _updatePointer(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((x - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((y - rect.top) / rect.height) * 2 + 1;
  }

  _screenToWorldAtCubeDepth(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const ndcX = ((x - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((y - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);

    const camPos = new THREE.Vector3();
    this.camera.getWorldPosition(camPos);
    let closestMeshHit = null;
    let closestDist = Infinity;

    for (const c of this.cubes) {
      if (!c.alive || !c.isWhole) continue;
      c.mesh.updateMatrixWorld(true);
      const hits = this.raycaster.intersectObject(c.mesh, false);
      if (hits.length > 0 && hits[0].distance < closestDist) {
        closestDist = hits[0].distance;
        closestMeshHit = hits[0].point;
      }
    }

    if (closestMeshHit) return closestMeshHit.clone();

    let depth = 12;
    const active = this.cubes.filter((c) => c.alive && c.isWhole);
    if (active.length > 0) {
      let sum = 0;
      for (const c of active) sum += c.position.distanceTo(camPos);
      depth = sum / active.length;
    }

    return this._screenToWorld(x, y, depth);
  }

  _projectWorldToScreen(v) {
    const p = v.clone().project(this.camera);
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((p.x + 1) * 0.5) * rect.width + rect.left,
      y: ((-p.y + 1) * 0.5) * rect.height + rect.top,
    };
  }

  _screenToWorld(x, y, depth = 3) {
    const rect = this.canvas.getBoundingClientRect();
    const ndcX = ((x - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((y - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);

    const planeNormal = new THREE.Vector3();
    this.camera.getWorldDirection(planeNormal);
    const planePoint = new THREE.Vector3();
    this.camera.getWorldPosition(planePoint);
    planePoint.addScaledVector(planeNormal, depth);

    this.slicePlane.setFromNormalAndCoplanarPoint(planeNormal, planePoint);

    const hit = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.slicePlane, hit)) return null;
    return hit;
  }

  _onResize() {
    const { width: w, height: h } = this._getStageSize();
    applyLayout();
    this.camera.fov = Layout.cameraFov;
    this.camera.aspect = w / h;
    this.camera.position.copy(Layout.cameraPos);
    this.camera.lookAt(Layout.cameraLookAt);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.bloomPass.setSize(w, h);
    this.crtPass.uniforms.resolution.value.set(w, h);
  }

  _cleanup() {
    for (let i = this.cubes.length - 1; i >= 0; i--) {
      const c = this.cubes[i];
      if (c.freezeShrink) continue;
      if (!c.alive || this.physics.isOutOfBounds(c)) {
        this.scene.remove(c.mesh);
        c.dispose();
        this.cubes.splice(i, 1);
      }
    }
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);

    this.slicer.resetFrame();
    this._updateGameRules(dt);
    this._logGraceClockUpdate();

    const playing = this.state === "playing";
    const menuPreview = this.state === "menu";
    const wrongReveal = this.state === "wrongReveal";
    const spawnActive = playing || menuPreview;
    const physicsActive = playing || menuPreview || wrongReveal;
    this.spawner.update(
      dt,
      this.cubes,
      spawnActive,
      menuPreview ? 0 : this.gameTime,
      this.targetColorIndex
    );
    if (physicsActive) {
      const physicsTime = menuPreview ? 0 : this.gameTime;
      this.physics.update(this.cubes, dt, physicsTime);
      if (playing) {
        this._handleTargetBottomBounces();
        this._updateCubeBlinks(dt);
      }
    }
    if (wrongReveal || this.state === "paused") {
      this._updateWrongSliceBlinks(dt);
    }
    this._cleanup();

    this.composer.render();
  }
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

new Game();
