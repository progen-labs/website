import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard, Line, OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { CONCEPT_BY_ID, GROUPS, conceptsOf } from './internals-data.js';

const TILT = 0.52;

// phase offset of PI/n keeps the top and bottom of the ring clear (no node
// sits dead-centre under the hub/star label).
function ringPos(center, radius, i, n, phase = -Math.PI / 2 + Math.PI / n) {
  const a = phase + (i / n) * Math.PI * 2;
  return [
    center[0] + radius * Math.cos(a),
    center[1] + radius * Math.sin(a) * Math.sin(TILT),
    center[2] + radius * Math.sin(a) * Math.cos(TILT),
  ];
}

const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// --- camera: smoothly fly to the pose for the current view, then hand back to OrbitControls
function CameraManager({ pose, controlsRef }) {
  const { camera } = useThree();
  const anim = useRef(null);

  useEffect(() => {
    const from = camera.position.clone();
    const fromT = controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3();
    anim.current = { t: 0, from, fromT, toP: new THREE.Vector3(...pose.pos), toT: new THREE.Vector3(...pose.tgt) };
    if (controlsRef.current) controlsRef.current.enabled = false;
  }, [pose.key]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    const a = anim.current;
    if (!a) return;
    a.t = Math.min(1, a.t + dt / 0.75);
    const e = easeInOut(a.t);
    camera.position.lerpVectors(a.from, a.toP, e);
    if (controlsRef.current) {
      controlsRef.current.target.lerpVectors(a.fromT, a.toT, e);
      controlsRef.current.update();
    }
    if (a.t >= 1) {
      anim.current = null;
      if (controlsRef.current) controlsRef.current.enabled = true;
    }
  });
  return null;
}

function Shape({ idx, color, scale, emissive }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.3;
      ref.current.rotation.x += dt * 0.08;
    }
  });
  const g = idx % 5;
  return (
    <mesh ref={ref} scale={scale}>
      {g === 0 && <icosahedronGeometry args={[1, 0]} />}
      {g === 1 && <octahedronGeometry args={[1.1, 0]} />}
      {g === 2 && <dodecahedronGeometry args={[0.95, 0]} />}
      {g === 3 && <torusGeometry args={[0.8, 0.3, 14, 32]} />}
      {g === 4 && <boxGeometry args={[1.35, 1.35, 1.35]} />}
      <meshStandardMaterial color="#0a1024" emissive={color} emissiveIntensity={emissive} roughness={0.25} metalness={0.5} flatShading />
    </mesh>
  );
}

function Node({ position, idx, color, title, tag, baseSize, hovered, active, showTag, onOver, onOut, onClick, clickGuard }) {
  const ref = useRef();
  const lift = hovered || active;
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * 1.2 + idx) * 0.18;
    const target = lift ? 1.28 : 1;
    ref.current.scale.x = THREE.MathUtils.lerp(ref.current.scale.x, target, 0.15);
    ref.current.scale.y = ref.current.scale.x;
    ref.current.scale.z = ref.current.scale.x;
  });
  return (
    <group position={position}>
      <group
        ref={ref}
        onPointerOver={e => {
          e.stopPropagation();
          onOver();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onOut();
          document.body.style.cursor = '';
        }}
        onClick={e => {
          e.stopPropagation();
          if (clickGuard.current && clickGuard.current.drag) return;
          onClick();
        }}
      >
        <Shape idx={idx} color={color} scale={baseSize} emissive={lift ? 2.3 : 1.15} />
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[baseSize * 1.6, 0.03, 8, 48]} />
          <meshBasicMaterial color={color} transparent opacity={lift ? 0.95 : 0.4} />
        </mesh>
        <pointLight color={color} intensity={lift ? 20 : 7} distance={12} />
      </group>

      <Billboard position={[0, baseSize * 1.9, 0]}>
        <Text fontSize={0.6} color="#ffffff" anchorX="center" anchorY="bottom" outlineWidth={0.014} outlineColor="#05060e" maxWidth={7}>
          {title}
        </Text>
        {(showTag || lift) && tag && (
          <Text position={[0, -0.16, 0]} fontSize={0.32} color={color} anchorX="center" anchorY="top" maxWidth={8}>
            {tag}
          </Text>
        )}
      </Billboard>
    </group>
  );
}

function Star({ position, color, label }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.12;
  });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.7, 1]} />
        <meshStandardMaterial color="#120a04" emissive={color} emissiveIntensity={1.8} roughness={0.4} metalness={0.3} flatShading />
      </mesh>
      <pointLight color={color} intensity={40} distance={30} />
      <Billboard position={[0, 4.6, 0]}>
        <Text fontSize={1.0} color={color} anchorX="center" outlineWidth={0.02} outlineColor="#05060e" letterSpacing={0.04}>
          {label}
        </Text>
      </Billboard>
    </group>
  );
}

function Spokes({ from, tos, color }) {
  return tos.map((to, i) => (
    <Line key={i} points={[from, to]} color={color} lineWidth={1} transparent opacity={0.22} />
  ));
}

function Overview({ hoveredId, onHover, onPick, clickGuard }) {
  const browser = conceptsOf('browser');
  const react = conceptsOf('react');

  const layout = useMemo(() => {
    const map = {};
    for (const group of ['browser', 'react']) {
      const list = conceptsOf(group);
      list.forEach((c, i) => {
        map[c.id] = ringPos(GROUPS[group].center, 13.5, i, list.length);
      });
    }
    return map;
  }, []);

  const flow = group => {
    const list = conceptsOf(group);
    return list.map(c => layout[c.id]);
  };

  return (
    <>
      {['browser', 'react'].map(group => (
        <group key={group}>
          <Star position={GROUPS[group].center} color={GROUPS[group].accent} label={GROUPS[group].label.toUpperCase()} />
          <Line points={[...flow(group), layout[conceptsOf(group)[0].id]]} color={GROUPS[group].accent} lineWidth={1.2} transparent opacity={0.22} dashed dashSize={0.6} gapSize={0.4} />
        </group>
      ))}
      {[...browser, ...react].map((c, i) => (
        <Node
          key={c.id}
          position={layout[c.id]}
          idx={i}
          color={GROUPS[c.group].accent}
          title={c.title}
          tag={c.tag}
          baseSize={1.15}
          hovered={hoveredId === c.id}
          active={false}
          showTag={false}
          onOver={() => onHover(c.id)}
          onOut={() => onHover(null)}
          onClick={() => onPick(c.id)}
          clickGuard={clickGuard}
        />
      ))}
    </>
  );
}

function ConceptView({ concept, hoveredId, selectedSubId, onHover, onPick, clickGuard }) {
  const accent = GROUPS[concept.group].accent;
  const hub = [0, 2.5, 0];
  const childPos = useMemo(
    () => concept.children.map((_, i) => ringPos(hub, 9, i, concept.children.length)),
    [concept.id], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <>
      <Star position={hub} color={accent} label={concept.title.toUpperCase()} />
      <Billboard position={[0, hub[1] - 2.6, 0]}>
        <Text fontSize={0.4} color="#c7d2f0" anchorX="center" anchorY="middle" maxWidth={16} outlineWidth={0.008} outlineColor="#05060e">
          {concept.blurb}
        </Text>
      </Billboard>
      <Spokes from={hub} tos={childPos} color={accent} />
      {concept.children.map((ch, i) => (
        <Node
          key={ch.id}
          position={childPos[i]}
          idx={i + 2}
          color={accent}
          title={ch.title}
          tag={ch.blurb}
          baseSize={0.95}
          hovered={hoveredId === ch.id}
          active={selectedSubId === ch.id}
          showTag
          onOver={() => onHover(ch.id)}
          onOut={() => onHover(null)}
          onClick={() => onPick(ch.id)}
          clickGuard={clickGuard}
        />
      ))}
    </>
  );
}

export default function InternalsWorld({ view, focusId, hoveredId, selectedSubId, onHover, onPickConcept, onPickSub, controlsRef, clickGuard }) {
  const concept = focusId ? CONCEPT_BY_ID[focusId] : null;

  const pose = useMemo(() => {
    if (view === 'concept') return { key: `c:${focusId}`, pos: [0, 12, 24], tgt: [0, 2.5, 0] };
    return { key: 'overview', pos: [0, 34, 55], tgt: [0, 1, -1] };
  }, [view, focusId]);

  return (
    <>
      <color attach="background" args={['#05060f']} />
      <fog attach="fog" args={['#05060f', 55, 130]} />
      <ambientLight intensity={0.5} color="#c7d4ff" />
      <directionalLight position={[16, 28, 12]} intensity={0.6} color="#dfe8ff" />
      <directionalLight position={[-18, 12, -22]} intensity={0.3} color="#ffac7a" />

      <Stars radius={180} depth={80} count={3200} factor={4} fade speed={0.25} />
      <gridHelper args={[200, 80, '#1b2748', '#111a33']} position={[0, -6, 0]} />

      {view === 'concept' && concept ? (
        <ConceptView concept={concept} hoveredId={hoveredId} selectedSubId={selectedSubId} onHover={onHover} onPick={onPickSub} clickGuard={clickGuard} />
      ) : (
        <Overview hoveredId={hoveredId} onHover={onHover} onPick={onPickConcept} clickGuard={clickGuard} />
      )}

      <CameraManager pose={pose} controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={7}
        maxDistance={90}
        maxPolarAngle={Math.PI * 0.49}
        rotateSpeed={0.6}
        zoomSpeed={0.9}
      />
    </>
  );
}
