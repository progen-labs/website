// The landing hero: a chrome infinity mark (the Progen Labs logo) with light
// streaking through it, floating over a dark reflective floor, lit by studio
// softboxes. Slim light pillars mark the projects; choosing one flies the
// camera to it. Restraint over decoration: one hero object, two accents.
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Lightformer, MeshReflectorMaterial, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';

const FLOOR_Y = -2.1;

// ---------------------------------------------------------------- the mark
function lemniscatePoints(a = 3.1, n = 360) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const d = 1 + Math.sin(t) ** 2;
    // an over/under crossing in the middle gives the mark real depth
    pts.push(new THREE.Vector3((a * Math.cos(t)) / d, (a * Math.sin(t) * Math.cos(t)) / d, 0.42 * Math.sin(t)));
  }
  return pts;
}

const streakVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const streakFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uA;
  uniform vec3 uB;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float s = fract(vUv.x * 2.0 - uTime * 0.11);
    float band = smoothstep(0.0, 0.04, s) * (1.0 - smoothstep(0.04, 0.42, s));
    float fres = pow(1.0 - abs(dot(vN, vV)), 2.2);
    vec3 col = mix(uA, uB, 0.5 + 0.5 * sin(vUv.x * 6.2831853));
    float a = band * 0.95 + fres * 0.45;
    gl_FragColor = vec4(col * (band * 1.7 + fres * 0.7), a);
  }
`;

function InfinityMark({ motion }) {
  const { tube, shell, streak } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(lemniscatePoints(), true, 'centripetal');
    return {
      tube: new THREE.TubeGeometry(curve, 480, 0.3, 40, true),
      shell: new THREE.TubeGeometry(curve, 480, 0.33, 40, true),
      streak: new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uA: { value: new THREE.Color('#36d6ff') }, uB: { value: new THREE.Color('#9b8cff') } },
        vertexShader: streakVertex,
        fragmentShader: streakFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    };
  }, []);
  const group = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    streak.uniforms.uTime.value = t;
    if (group.current && motion) group.current.rotation.y = Math.sin(t * 0.25) * 0.28;
  });

  return (
    <Float speed={motion ? 1.1 : 0} rotationIntensity={0.15} floatIntensity={motion ? 0.6 : 0}>
      <group ref={group} position={[0, 0.55, 0]}>
        <mesh geometry={tube}>
          <meshPhysicalMaterial color="#cfd8ff" metalness={1} roughness={0.14} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.6} />
        </mesh>
        <mesh geometry={shell} material={streak} />
      </group>
    </Float>
  );
}

// soft aura behind the mark (radial gradient on an additive plane)
function Aura({ color, position, scale }) {
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
      <meshBasicMaterial map={tex} color={color} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
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
  varying float vY;
  void main() { float a = pow(1.0 - vY, 2.2) * 0.32 * uPower; gl_FragColor = vec4(uColor * a * 2.0, a); }
`;

function Beacon({ project, position, hot, entering, onHover, onPick }) {
  const beam = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(project.color) }, uPower: { value: 1 } },
        vertexShader: beamVertex,
        fragmentShader: beamFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [project.color],
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
        <meshStandardMaterial ref={core} color="#05070c" emissive={project.color} emissiveIntensity={1.6} toneMapped={false} />
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
      <Text position={[0, 4.3, 0]} fontSize={0.36} letterSpacing={0.18} color="#f5f7ff" anchorX="center" anchorY="bottom">
        {project.name.toUpperCase()}
      </Text>
      <Text position={[0, 4.2, 0]} fontSize={0.26} color={project.disabled ? '#9aa3bd' : '#c3cbe2'} anchorX="center" anchorY="top">
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
export default function LandingScene({ projects, hovered, setHovered, onPick, entering, motion }) {
  const { size } = useThree();
  const aspect = size.width / size.height;
  // keep the pillars inside the frame: ~72% of the visible half-width at their depth
  const spread = Math.min(9, 19 * Math.tan(THREE.MathUtils.degToRad(19)) * aspect * 0.72);
  const beacons = useMemo(() => ({ spectra: [-spread, FLOOR_Y, -1.5], core: [spread, FLOOR_Y, -1.5] }), [spread]);

  return (
    <>
      <color attach="background" args={['#04050a']} />
      <fog attach="fog" args={['#04050a', 16, 46]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 8, 6]} intensity={0.6} color="#dfe8ff" />

      {/* studio lighting, rendered once into an environment map (no HDR download) */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} color="#36d6ff" position={[-6, 2.5, 5]} scale={[7, 1.4, 1]} rotation-y={Math.PI / 4} />
        <Lightformer form="rect" intensity={4} color="#8f7cff" position={[6, 1.5, 5]} scale={[7, 1.4, 1]} rotation-y={-Math.PI / 4} />
        <Lightformer form="rect" intensity={2.5} color="#ffffff" position={[0, 7, 2]} scale={[12, 0.8, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="ring" intensity={1.5} color="#ff6ad5" position={[0, 0.5, -9]} scale={5} />
      </Environment>

      <Aura color="#1f6fff" position={[-2.2, 0.8, -3]} scale={[11, 7, 1]} />
      <Aura color="#7b4dff" position={[2.4, 0.6, -3.2]} scale={[11, 7, 1]} />
      <InfinityMark motion={motion} />

      {aspect >= 1 && projects.filter(p => !p.disabled).map(p => (
        <Beacon
          key={p.id}
          project={p}
          position={beacons[p.id]}
          hot={hovered === p.id}
          entering={entering === p.id}
          onHover={setHovered}
          onPick={onPick}
        />
      ))}

      {/* dark mirror floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]}>
        <planeGeometry args={[120, 120]} />
        <MeshReflectorMaterial
          blur={[400, 120]}
          resolution={1024}
          mixBlur={1}
          mixStrength={14}
          roughness={0.85}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#07080e"
          metalness={0.6}
          mirror={0.6}
        />
      </mesh>

      {motion && <Sparkles count={70} scale={[24, 7, 14]} position={[0, 1.5, -2]} size={1.6} speed={0.18} opacity={0.35} color="#a9d8ff" />}

      <CameraDirector entering={entering} beacons={beacons} motion={motion} />
    </>
  );
}
