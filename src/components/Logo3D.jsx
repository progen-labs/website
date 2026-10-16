// The Progen Labs mark in 3D, sized for a header. An infinity loop drawn as
// three parallel lanes: a twisted ribbon, so the lane that runs outside on
// one lobe runs inside on the other. Circuit nodes sit on the loops, a node
// hub at the crossing, a diamond on the right tip and a code bracket on the
// left. Light flows along the dashed lanes. Two finishes: neon on dark, deep
// ink blues on light. Purely decorative: the brand link carries the name.
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const A = 1; // half-width of the loop
const B = 0.84; // loop height: y = B sin t cos t
const H = 0.17; // over/under depth at the crossing
const LANE = 0.11; // lane spacing
const TIP = A + LANE; // outermost lane at either tip

const PALETTES = {
  dark: {
    lanes: [
      ['#4f8dff', '#5ef0ff'],
      ['#7df6ff', '#c9fbff'],
      ['#5b9dff', '#3fd4ff'],
    ],
    node: '#c9fbff',
    pad: '#5ef0ff',
    hub: '#eafdff',
    ring: '#5ef0ff',
    diamond: '#5ef0ff',
    bracket: '#5b9dff',
    halo: '#3fb8ff',
  },
  light: {
    lanes: [
      ['#1d4ed8', '#0891b2'],
      ['#0e7490', '#1e40af'],
      ['#2563eb', '#0369a1'],
    ],
    node: '#0e7490',
    pad: '#1d4ed8',
    hub: '#1e3a8a',
    ring: '#0891b2',
    diamond: '#0891b2',
    bracket: '#1d4ed8',
    halo: null,
  },
};

// a figure-eight (lemniscate of Gerono) with an over/under crossing
function point(t, offset = 0) {
  const x = A * Math.cos(t);
  const y = B * Math.sin(t) * Math.cos(t);
  // 2D normal of the path; the same side is "outside" on one lobe and
  // "inside" on the other, which is what twists the lanes into a ribbon
  const dx = -A * Math.sin(t);
  const dy = B * Math.cos(2 * t);
  const len = Math.hypot(dx, dy) || 1;
  return new THREE.Vector3(x - (dy / len) * offset, y + (dx / len) * offset, H * Math.sin(t));
}

function laneCurve(offset) {
  const pts = [];
  for (let i = 0; i < 240; i++) pts.push(point((i / 240) * Math.PI * 2, offset));
  return new THREE.CatmullRomCurve3(pts, true, 'centripetal');
}

const laneVertex = /* glsl */ `
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
const laneFragment = /* glsl */ `
  uniform float uTime;
  uniform float uDash;
  uniform float uDuty;
  uniform float uPulse;
  uniform vec3 uFlash;
  uniform vec3 uA;
  uniform vec3 uB;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float u = vUv.x;
    if (uDash > 0.0 && fract(u * uDash - uTime) > uDuty) discard;
    vec3 col = mix(uA, uB, 0.5 + 0.5 * sin(u * 6.2831853));
    float shade = 0.62 + 0.38 * max(dot(vN, vV), 0.0);
    // a short bright packet travelling round the loop
    float p = fract(u - uTime * 0.18);
    float pulse = smoothstep(0.86, 0.995, p) * (1.0 - smoothstep(0.995, 1.0, p));
    gl_FragColor = vec4(mix(col * shade, uFlash, pulse * uPulse), 1.0);
    #include <colorspace_fragment>
  }
`;

function laneMaterial([a, b], dash, light) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDash: { value: dash },
      uDuty: { value: 0.62 },
      uPulse: { value: light ? 0.8 : 0.85 },
      uFlash: { value: new THREE.Color(light ? '#38bdf8' : '#ffffff') },
      uA: { value: new THREE.Color(a) },
      uB: { value: new THREE.Color(b) },
    },
    vertexShader: laneVertex,
    fragmentShader: laneFragment,
  });
}

function Mark({ theme, active, motion }) {
  const light = theme === 'light';
  const pal = PALETTES[light ? 'light' : 'dark'];

  const { lanes, halo, nodes } = useMemo(() => {
    const offsets = [LANE, 0, -LANE];
    const built = offsets.map((off, i) => {
      const dashed = i !== 1;
      return {
        geometry: new THREE.TubeGeometry(laneCurve(off), 360, dashed ? 0.026 : 0.036, 10, true),
        material: laneMaterial(pal.lanes[i], dashed ? 22 : 0, light),
      };
    });
    // circuit nodes on the outer lane of each lobe (the +LANE side is
    // outside on the left lobe, -LANE outside on the right lobe)
    const pads = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map(t =>
      point(t, Math.cos(t) < 0 ? LANE : -LANE),
    );
    return {
      lanes: built,
      halo: pal.halo ? new THREE.TubeGeometry(laneCurve(0), 240, 0.1, 10, true) : null,
      nodes: pads,
    };
  }, [light]); // eslint-disable-line react-hooks/exhaustive-deps

  const group = useRef();
  const ring = useRef();
  const diamond = useRef();
  const flow = useRef(0);
  const spin = useRef({ value: 0, target: 0, was: false });

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    const step = Math.min(dt, 0.05);
    if (motion) flow.current += step * (active ? 1.4 : 0.45);
    for (const lane of lanes) lane.material.uniforms.uTime.value = flow.current;

    // hovering the brand turns the mark over once
    const s = spin.current;
    if (active && !s.was && motion) s.target += Math.PI * 2;
    s.was = active;
    s.value = THREE.MathUtils.lerp(s.value, s.target, Math.min(1, step * 3.2));

    if (group.current) {
      group.current.rotation.y = motion ? Math.sin(t * 0.5) * 0.36 + s.value : 0.2;
      group.current.rotation.x = motion ? Math.sin(t * 0.33) * 0.12 - 0.04 : -0.1;
    }
    if (ring.current) ring.current.rotation.y = motion ? t * 1.6 : 0.9;
    if (diamond.current) diamond.current.rotation.y = motion ? t * 1.1 : 0.6;
  });

  return (
    // nudged left: the diamond reaches further out than the bracket
    <group ref={group} position={[-0.05, 0, 0]}>
      {halo && (
        <mesh geometry={halo}>
          <meshBasicMaterial color={pal.halo} transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
      {lanes.map((lane, i) => (
        <mesh key={i} geometry={lane.geometry} material={lane.material} />
      ))}

      {/* circuit nodes: a solid pad ringed by a thin collar */}
      {nodes.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[0.052, 18, 12]} />
            <meshBasicMaterial color={pal.node} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.085, 0.013, 8, 28]} />
            <meshBasicMaterial color={pal.pad} />
          </mesh>
        </group>
      ))}

      {/* node hub at the crossing, joining the over and under strands */}
      <mesh>
        <sphereGeometry args={[0.15, 28, 20]} />
        <meshStandardMaterial color={pal.hub} emissive={pal.hub} emissiveIntensity={light ? 0.15 : 0.9} roughness={0.35} metalness={0.2} />
      </mesh>
      <group ref={ring}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.24, 0.016, 8, 48]} />
          <meshBasicMaterial color={pal.ring} />
        </mesh>
        <mesh position={[0.24, 0, 0]}>
          <sphereGeometry args={[0.036, 12, 8]} />
          <meshBasicMaterial color={pal.node} />
        </mesh>
        <mesh position={[-0.24, 0, 0]}>
          <sphereGeometry args={[0.036, 12, 8]} />
          <meshBasicMaterial color={pal.node} />
        </mesh>
      </group>

      {/* diamond on the right tip */}
      <group ref={diamond} position={[TIP + 0.19, 0, 0]}>
        <mesh scale={[0.78, 1.12, 0.78]}>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color={pal.diamond} emissive={pal.diamond} emissiveIntensity={light ? 0.2 : 0.75} roughness={0.25} metalness={0.3} flatShading />
        </mesh>
      </group>

      {/* code bracket on the left tip */}
      <group position={[-TIP - 0.16, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.042, 0.36, 0.042]} />
          <meshBasicMaterial color={pal.bracket} />
        </mesh>
        <mesh position={[0.045, 0.159, 0]}>
          <boxGeometry args={[0.09, 0.042, 0.042]} />
          <meshBasicMaterial color={pal.bracket} />
        </mesh>
        <mesh position={[0.045, -0.159, 0]}>
          <boxGeometry args={[0.09, 0.042, 0.042]} />
          <meshBasicMaterial color={pal.bracket} />
        </mesh>
      </group>
    </group>
  );
}

// A flat SVG of the same mark, shown if WebGL is unavailable.
function FlatMark({ theme }) {
  const pal = PALETTES[theme === 'light' ? 'light' : 'dark'];
  const path = offset => {
    let d = '';
    for (let i = 0; i <= 120; i++) {
      const p = point((i / 120) * Math.PI * 2, offset);
      d += `${i ? 'L' : 'M'}${(p.x * 30 + 46).toFixed(2)} ${(-p.y * 30 + 20).toFixed(2)}`;
    }
    return d;
  };
  return (
    <svg viewBox="0 0 92 40" width="100%" height="100%" fill="none" aria-hidden="true">
      {[LANE, 0, -LANE].map((off, i) => (
        <path key={i} d={path(off)} stroke={pal.lanes[i][0]} strokeWidth={i === 1 ? 2 : 1.4} strokeDasharray={i === 1 ? undefined : '3 2'} />
      ))}
      <circle cx="46" cy="20" r="3" fill={pal.hub} />
      <path d={`M${46 + (TIP + 0.19) * 30} 15.5l3 4.5-3 4.5-3-4.5Z`} fill={pal.diamond} />
      <path d={`M${46 - (TIP + 0.1) * 30} 14.6h-2.4v10.8h2.4`} stroke={pal.bracket} strokeWidth="1.3" />
    </svg>
  );
}

export default function Logo3D({ theme = 'dark', active = false, motion = true }) {
  return (
    <span className="pl-logo" data-theme={theme} aria-hidden="true">
      <Canvas
        flat
        dpr={[1, 3]}
        frameloop={motion ? 'always' : 'demand'}
        camera={{ position: [0, 0, 6], fov: 15 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        fallback={<FlatMark theme={theme} />}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 4]} intensity={1.4} />
        <Mark theme={theme} active={active} motion={motion} />
      </Canvas>
    </span>
  );
}
