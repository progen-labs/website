// The landing hero: the Progen Labs Seed — a spinning ribbon of light bars
// over a hologram emitter — floating over a dark reflective floor, lit by
// studio softboxes. Slim light pillars mark the projects; choosing one flies the
// camera to it. Restraint over decoration: one hero object, two accents.
// The light theme swaps glow for ink: normal-blended light bars and beams in
// deeper colours, a pale studio floor and gunmetal reflections.
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Lightformer, MeshReflectorMaterial, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';

const FLOOR_Y = -2.1;

// ---------------------------------------------------------------- the mark
// The Progen Labs Seed in 3D: a ribbon of light bars that grows from a point,
// turns a turn and a quarter about its spine and closes to a point, spinning
// slowly. Bars facing the viewer burn brightest (cyan on the front face,
// violet on the back), a scan pulse climbs them and an energy dot runs the
// spine; an orbit ring and an emitter disc frame it. The geometry is the
// SVG logo's (scripts/brand.mjs), so the hero and the logo are one mark.
const SEED = { rungs: 56, height: 3.0, turn: 8, pulse: 4 };
SEED.width = (SEED.height * 24) / 84; // the logo's proportions
const seedWidth = s => Math.sin(Math.PI * s) ** 0.8 * (0.82 + 0.3 * s);
const seedTwist = s => -0.7 * Math.PI + 1.25 * Math.PI * s;
const BAR = 0.034; // thickness of a light bar
const EDGE = 0.016;
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);

const SEED_PALETTES = {
  dark: { front: ['#5ef0ff', '#38bdf8', '#5b8cff', '#7c83ff'], back: ['#d0b4ff', '#a78bfa', '#8b5cf6'], hot: '#effdff', edge: '#cfefff', hud: '#7fd8ff', min: 0.22 },
  light: { front: ['#0891b2', '#0284c7', '#2563eb', '#4338ca'], back: ['#8b5cf6', '#7c3aed', '#5b21b6'], hot: '#0e7490', edge: '#312e81', hud: '#3b5b8f', min: 0.4 },
};

function SeedMark({ motion, light }) {
  const N = SEED.rungs;
  const rungs = useRef();
  const edges = useRef();
  const dot = useRef();
  const node = useRef();
  const pulses = useRef([]);
  const pal = useMemo(() => {
    const p = SEED_PALETTES[light ? 'light' : 'dark'];
    const c = v => new THREE.Color(v);
    return { front: p.front.map(c), back: p.back.map(c), hot: c(p.hot), edge: c(p.edge), hud: c(p.hud), bg: c(light ? '#eef2f8' : '#000000'), min: p.min };
  }, [light]);
  const glow = light ? THREE.NormalBlending : THREE.AdditiveBlending;
  const mats = useMemo(
    () => ({
      bar: new THREE.MeshBasicMaterial({ toneMapped: false, transparent: !light, blending: glow, depthWrite: light }),
      edge: new THREE.MeshBasicMaterial({ color: pal.edge, toneMapped: false, transparent: true, opacity: light ? 0.75 : 0.32, blending: glow, depthWrite: false }),
      hud: new THREE.MeshBasicMaterial({ color: pal.hud, toneMapped: false, transparent: true, opacity: light ? 0.55 : 0.6, blending: glow, depthWrite: false }),
      hot: new THREE.MeshBasicMaterial({ color: pal.hot, toneMapped: false, transparent: true, blending: glow, depthWrite: false }),
      cone: new THREE.ShaderMaterial({
        uniforms: { uColor: { value: pal.hud }, uPower: { value: light ? 0.7 : 1.2 }, uLight: { value: light ? 1 : 0 } },
        vertexShader: beamVertex,
        fragmentShader: beamFragment,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: glow,
      }),
    }),
    [light, glow, pal],
  );
  const geo = useMemo(
    () => ({
      box: new THREE.BoxGeometry(1, 1, 1),
      spine: new THREE.CylinderGeometry(0.008, 0.008, SEED.height, 8),
      orbit: new THREE.TorusGeometry(2.05, 0.007, 6, 180),
      ring: new THREE.TorusGeometry(0.55, 0.012, 6, 96),
      inner: new THREE.TorusGeometry(0.33, 0.009, 6, 72),
      cone: new THREE.CylinderGeometry(0.16, 0.55, 1.5, 48, 1, true),
      sphere: new THREE.SphereGeometry(1, 20, 20),
    }),
    [],
  );
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), s: new THREE.Vector3(), c: new THREE.Color(), d: new THREE.Vector3(), ends: new Float32Array((N + 1) * 6) }), [N]);

  const ramp = (stops, t, out) => {
    const x = Math.max(0, Math.min(1, t)) * (stops.length - 1);
    const i = Math.min(stops.length - 2, Math.floor(x));
    return out.copy(stops[i]).lerp(stops[i + 1], x - i);
  };
  const yAt = s => SEED.height / 2 - SEED.height * s;

  // place every bar and edge segment for one moment of the turn
  const draw = (phase, scan) => {
    const { m, q, p, s: sc, c, d, ends } = tmp;
    for (let i = 0; i <= N; i++) {
      const s = i / N, th = seedTwist(s) + phase, half = SEED.width * seedWidth(s), y = yAt(s);
      q.setFromAxisAngle(Y_AXIS, -th);
      m.compose(p.set(0, y, 0), q, sc.set(Math.max(2 * half, 1e-3), BAR, BAR));
      rungs.current.setMatrixAt(i, m);
      const face = Math.cos(th); // >0: the front face is toward the camera
      const lit = Math.abs(face);
      const boost = Math.exp(-(((s - scan) / 0.07) ** 2));
      ramp(face >= 0 ? pal.front : pal.back, s, c).lerp(pal.hot, Math.min(1, 0.22 * lit ** 10 + 0.8 * boost));
      const strength = Math.min(1, pal.min + (1 - pal.min) * (0.22 + 0.78 * lit) + 0.55 * boost);
      if (light) c.lerp(pal.bg, 1 - strength);
      else c.multiplyScalar(strength * 0.72); // additive: overlapping bars add up, so keep each one dim
      rungs.current.setColorAt(i, c);
      const k = i * 6, ex = Math.cos(th) * half, ez = Math.sin(th) * half;
      ends.set([-ex, y, -ez, ex, y, ez], k);
    }
    for (let i = 0; i < N; i++)
      for (let side = 0; side < 2; side++) {
        const a = i * 6 + side * 3, b = a + 6;
        d.set(ends[b] - ends[a], ends[b + 1] - ends[a + 1], ends[b + 2] - ends[a + 2]);
        const len = d.length();
        q.setFromUnitVectors(X_AXIS, d.normalize());
        p.set((ends[a] + ends[b]) / 2, (ends[a + 1] + ends[b + 1]) / 2, (ends[a + 2] + ends[b + 2]) / 2);
        m.compose(p, q, sc.set(len + EDGE, EDGE, EDGE));
        edges.current.setMatrixAt(i * 2 + side, m);
      }
    rungs.current.instanceMatrix.needsUpdate = true;
    rungs.current.instanceColor.needsUpdate = true;
    edges.current.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => draw(0.35, -1), [pal]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(({ clock }) => {
    if (!motion) return;
    const t = clock.getElapsedTime();
    const scan = 1.15 - 1.3 * ((t / SEED.pulse) % 1);
    draw(0.35 + (t / SEED.turn) * Math.PI * 2, scan);
    const inside = scan >= 0 && scan <= 1;
    dot.current.visible = inside;
    if (inside) dot.current.position.y = yAt(scan);
    const a = (t / 6) * Math.PI * 2;
    node.current.position.set(Math.cos(a) * 2.05, Math.sin(a) * 2.05, 0);
    node.current.material.opacity = Math.sin(a) > 0 ? 1 : 0.25; // dim behind the ribbon
    pulses.current.forEach((r, i) => {
      if (!r) return;
      const f = ((t + i * 1.5) / 3) % 1;
      r.scale.setScalar(0.5 + f * 2.4);
      r.material.opacity = (1 - f) * (light ? 0.5 : 0.8);
    });
  });

  const base = -SEED.height / 2 - 0.42;
  return (
    <Float speed={motion ? 1.1 : 0} rotationIntensity={0.08} floatIntensity={motion ? 0.45 : 0}>
      <group position={[0, 0.45, 0]}>
        <instancedMesh ref={rungs} args={[geo.box, mats.bar, N + 1]} frustumCulled={false} />
        <instancedMesh ref={edges} args={[geo.box, mats.edge, N * 2]} frustumCulled={false} />
        <mesh geometry={geo.spine} material={mats.hud} />
        <mesh ref={dot} geometry={geo.sphere} material={mats.hot} scale={0.05} visible={false} />
        {/* orbit ring, tilted toward the viewer, with a node riding it */}
        <group rotation={[Math.PI / 2 - 0.22, 0.1, -0.24]}>
          <mesh geometry={geo.orbit} material={mats.hud} />
          <mesh ref={node} geometry={geo.sphere} scale={0.06} position={[2.05, 0, 0]}>
            <meshBasicMaterial color={pal.hot} toneMapped={false} transparent blending={glow} depthWrite={false} />
          </mesh>
        </group>
        {/* the emitter the seed floats above, and its beam */}
        <group position={[0, base, 0]}>
          <mesh geometry={geo.ring} material={mats.hud} rotation-x={Math.PI / 2} />
          <mesh geometry={geo.inner} material={mats.hud} rotation-x={Math.PI / 2} />
          <mesh geometry={geo.cone} material={mats.cone} position={[0, 0.75, 0]} />
          {motion &&
            [0, 1].map(i => (
              <mesh key={i} ref={r => (pulses.current[i] = r)} geometry={geo.inner} rotation-x={Math.PI / 2}>
                <meshBasicMaterial color={pal.hud} toneMapped={false} transparent blending={glow} depthWrite={false} />
              </mesh>
            ))}
        </group>
      </group>
    </Float>
  );
}

// soft aura behind the mark (radial gradient on an additive plane)
function Aura({ color, position, scale, light }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(255,255,255,0.9)');
    grd.addColorStop(0.35, 'rgba(255,255,255,0.25)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={tex}
        color={color}
        transparent
        opacity={light ? 0.5 : 0.55}
        blending={light ? THREE.NormalBlending : THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------- beacons
const beamVertex = /* glsl */ `
  varying float vY;
  void main() { vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uLight;
  varying float vY;
  void main() {
    float a = pow(1.0 - vY, 2.2) * 0.32 * uPower;
    if (uLight > 0.5) gl_FragColor = vec4(uColor, a * 0.9);
    else gl_FragColor = vec4(uColor * a * 2.0, a);
  }
`;

function Beacon({ project, position, hot, entering, onHover, onPick, light }) {
  const beam = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(project.color) }, uPower: { value: 1 }, uLight: { value: light ? 1 : 0 } },
        vertexShader: beamVertex,
        fragmentShader: beamFragment,
        transparent: true,
        depthWrite: false,
        blending: light ? THREE.NormalBlending : THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [project.color, light],
  );
  const core = useRef();
  const power = project.disabled ? 0.35 : hot || entering ? 2.0 : 1.0;

  useFrame((_, dt) => {
    beam.uniforms.uPower.value = THREE.MathUtils.lerp(beam.uniforms.uPower.value, power, Math.min(1, dt * 6));
    if (core.current) core.current.emissiveIntensity = THREE.MathUtils.lerp(core.current.emissiveIntensity, (project.disabled ? 0.6 : 1.6) * (hot ? 1.8 : 1), Math.min(1, dt * 6));
  });

  const interactive = !project.disabled;
  return (
    <group
      position={position}
      onPointerOver={
        interactive
          ? e => {
              e.stopPropagation();
              onHover(project.id);
              document.body.style.cursor = 'pointer';
            }
          : undefined
      }
      onPointerOut={
        interactive
          ? () => {
              onHover(null);
              document.body.style.cursor = '';
            }
          : undefined
      }
      onClick={interactive ? () => onPick(project.id) : undefined}
    >
      {/* the pillar */}
      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[0.12, 3.8, 0.12]} />
        <meshStandardMaterial ref={core} color={light ? '#1b2335' : '#05070c'} emissive={project.color} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      {/* light beam */}
      <mesh position={[0, 2.1, 0]} material={beam}>
        <cylinderGeometry args={[0.16, 1.0, 4.2, 48, 1, true]} />
      </mesh>
      {/* floor ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 0.96, 64]} />
        <meshBasicMaterial color={project.color} transparent opacity={project.disabled ? 0.25 : hot ? 0.95 : 0.6} toneMapped={false} />
      </mesh>
      {/* generous invisible hit area */}
      {interactive && (
        <mesh position={[0, 2.0, 0]}>
          <boxGeometry args={[1.8, 4.4, 1.8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      <Text position={[0, 4.3, 0]} fontSize={0.36} letterSpacing={0.18} color={light ? '#0b1020' : '#f5f7ff'} anchorX="center" anchorY="bottom">
        {project.name.toUpperCase()}
      </Text>
      <Text position={[0, 4.2, 0]} fontSize={0.26} color={light ? '#3e4a63' : project.disabled ? '#9aa3bd' : '#c3cbe2'} anchorX="center" anchorY="top">
        {project.tag}
      </Text>
    </group>
  );
}

// ---------------------------------------------------------------- camera
function CameraDirector({ entering, beacons, motion }) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3(0, 2.75, 0));
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const narrow = size.width / size.height < 1;

  useFrame(({ pointer }, dt) => {
    const k = Math.min(1, dt * (entering ? 1.6 : 2.2));
    // phones: the copy column is tall, so the mark sits low on the first screen
    const base = narrow ? [0, 3.0, 24] : [0, 2.3, 17.5];
    const lookY = narrow ? 6.2 : 2.75;
    if (entering && beacons[entering]) {
      const [bx, , bz] = beacons[entering];
      tmp.set(bx * 0.85, 2.6, bz + 2.6);
      camera.position.lerp(tmp, k);
      look.current.lerp(tmp.set(bx, 2.4, bz), k);
    } else {
      const px = motion ? pointer.x * 0.9 : 0;
      const py = motion ? pointer.y * 0.35 : 0;
      tmp.set(base[0] + px, base[1] + py, base[2]);
      camera.position.lerp(tmp, k);
      look.current.lerp(tmp.set(0, lookY, 0), k);
    }
    camera.lookAt(look.current);
  });
  return null;
}

// ---------------------------------------------------------------- scene
export default function LandingScene({ theme = 'dark', projects, hovered, setHovered, onPick, entering, motion }) {
  const { size } = useThree();
  const light = theme === 'light';
  const bg = light ? '#eef2f8' : '#04050a';
  const aspect = size.width / size.height;
  // keep the pillars inside the frame: ~72% of the visible half-width at their depth
  const spread = Math.min(9, 19 * Math.tan(THREE.MathUtils.degToRad(19)) * aspect * 0.72);
  const beacons = useMemo(() => ({ spectra: [-spread, FLOOR_Y, -1.5], core: [spread, FLOOR_Y, -1.5] }), [spread]);

  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 16, 46]} />
      <ambientLight intensity={light ? 0.7 : 0.25} />
      <directionalLight position={[4, 8, 6]} intensity={0.6} color="#dfe8ff" />

      {/* studio lighting, rendered once into an environment map (no HDR download) */}
      <Environment key={theme} resolution={256} frames={1}>
        {light && <color attach="background" args={['#273044']} />}
        <Lightformer form="rect" intensity={4} color="#36d6ff" position={[-6, 2.5, 5]} scale={[7, 1.4, 1]} rotation-y={Math.PI / 4} />
        <Lightformer form="rect" intensity={4} color="#8f7cff" position={[6, 1.5, 5]} scale={[7, 1.4, 1]} rotation-y={-Math.PI / 4} />
        <Lightformer form="rect" intensity={2.5} color="#ffffff" position={[0, 7, 2]} scale={[12, 0.8, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="ring" intensity={1.5} color="#ff6ad5" position={[0, 0.5, -9]} scale={5} />
      </Environment>

      <Aura light={light} color={light ? '#9fd0ff' : '#1f6fff'} position={[-2.2, 0.8, -3]} scale={[11, 7, 1]} />
      <Aura light={light} color={light ? '#c9bcff' : '#7b4dff'} position={[2.4, 0.6, -3.2]} scale={[11, 7, 1]} />
      <SeedMark motion={motion} light={light} />

      {aspect >= 1 && projects.filter(p => !p.disabled).map(p => (
        <Beacon
          key={p.id}
          project={p}
          position={beacons[p.id]}
          hot={hovered === p.id}
          entering={entering === p.id}
          onHover={setHovered}
          onPick={onPick}
          light={light}
        />
      ))}

      {/* mirror floor: dark glass, or pale studio floor in the light theme */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]}>
        <planeGeometry args={[120, 120]} />
        <MeshReflectorMaterial
          blur={[400, 120]}
          resolution={1024}
          mixBlur={1}
          mixStrength={light ? 2.2 : 14}
          roughness={light ? 0.95 : 0.85}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color={light ? '#e3e8f1' : '#07080e'}
          metalness={light ? 0.15 : 0.6}
          mirror={light ? 0.35 : 0.6}
        />
      </mesh>

      {motion && !light && <Sparkles count={70} scale={[24, 7, 14]} position={[0, 1.5, -2]} size={1.6} speed={0.18} opacity={0.35} color="#a9d8ff" />}

      <CameraDirector entering={entering} beacons={beacons} motion={motion} />
    </>
  );
}
