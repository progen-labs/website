import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ---------------- the 3D dragon ----------------
function DragonModel({ wingRefs, color = '#2fae6b' }) {
  const mem = '#7a3db0';
  return (
    <group>
      <mesh scale={[0.8, 0.72, 1.7]}>
        <sphereGeometry args={[0.6, 20, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.2, 1.05]}>
        <sphereGeometry args={[0.33, 16, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.2, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.18, 0.5, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0.15, 0.32, 1.25]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ffd34d" emissive="#ffd34d" emissiveIntensity={1.8} />
      </mesh>
      <mesh position={[-0.15, 0.32, 1.25]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ffd34d" emissive="#ffd34d" emissiveIntensity={1.8} />
      </mesh>
      {[0.13, -0.13].map((x, i) => (
        <mesh key={i} position={[x, 0.48, 1.08]} rotation={[-0.5, 0, 0]}>
          <coneGeometry args={[0.05, 0.26, 8]} />
          <meshStandardMaterial color="#efe7d6" />
        </mesh>
      ))}
      <group ref={wingRefs[0]} position={[-0.5, 0.2, 0]}>
        <mesh position={[-0.95, 0, 0]} scale={[1.9, 0.06, 1.2]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={mem} emissive={mem} emissiveIntensity={0.35} roughness={0.6} side={2} />
        </mesh>
      </group>
      <group ref={wingRefs[1]} position={[0.5, 0.2, 0]}>
        <mesh position={[0.95, 0, 0]} scale={[1.9, 0.06, 1.2]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={mem} emissive={mem} emissiveIntensity={0.35} roughness={0.6} side={2} />
        </mesh>
      </group>
      <mesh position={[0, 0, -1.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.24, 1.5, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  );
}

// ---------------- world ----------------
function Terrain() {
  const mountains = useMemo(
    () =>
      Array.from({ length: 46 }, () => {
        const r = 40 + Math.random() * 230;
        const a = Math.random() * Math.PI * 2;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, h: 20 + Math.random() * 60, rad: 10 + Math.random() * 20 };
      }),
    [],
  );
  const trees = useMemo(
    () =>
      Array.from({ length: 90 }, () => {
        const r = 20 + Math.random() * 240;
        const a = Math.random() * Math.PI * 2;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: 1.4 + Math.random() * 2.2 };
      }),
    [],
  );
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[320, 48]} />
        <meshStandardMaterial color="#244a33" roughness={1} />
      </mesh>
      {mountains.map((m, i) => (
        <mesh key={i} position={[m.x, m.h / 2, m.z]}>
          <coneGeometry args={[m.rad, m.h, 7]} />
          <meshStandardMaterial color="#4a4068" emissive="#1a1636" emissiveIntensity={0.3} roughness={0.9} flatShading />
        </mesh>
      ))}
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 1.4, 6]} />
            <meshStandardMaterial color="#3a2616" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.9, 0]}>
            <coneGeometry args={[0.8, 2, 7]} />
            <meshStandardMaterial color="#1f6b3f" emissive="#0e3a22" emissiveIntensity={0.4} roughness={0.8} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const ENEMY_N = 14;
const BALL_N = 26;
const ORB_N = 10;
const XP_THRESH = [0, 40, 100, 190, 320];

export default function DragonFlight({ playing, onHud, onOver, input }) {
  const { camera } = useThree();
  const dragon = useRef();
  const wingRefs = [useRef(), useRef()];
  const enemyRefs = useRef([]);
  const ballRefs = useRef([]);
  const orbRefs = useRef([]);

  const sim = useRef(null);
  if (!sim.current) {
    sim.current = {
      pos: new THREE.Vector3(0, 30, -60),
      yaw: 0,
      pitch: 0,
      roll: 0,
      speed: 22,
      stage: 0,
      xp: 0,
      hp: 100,
      score: 0,
      fire: 0,
      espawn: 2.4,
      t: 0,
      over: false,
      enemies: Array.from({ length: ENEMY_N }, () => ({ active: false, p: new THREE.Vector3(), hp: 0, max: 1 })),
      balls: Array.from({ length: BALL_N }, () => ({ active: false, p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0 })),
      orbs: Array.from({ length: ORB_N }, () => ({ active: false, p: new THREE.Vector3(), hue: 0 })),
    };
    // seed orbs
    sim.current.orbs.forEach(o => placeOrb(o, sim.current.pos));
  }

  function placeOrb(o, near) {
    const a = Math.random() * Math.PI * 2;
    o.p.set(near.x + Math.cos(a) * (40 + Math.random() * 120), 14 + Math.random() * 50, near.z + Math.sin(a) * (40 + Math.random() * 120));
    o.hue = Math.random();
    o.active = true;
  }

  const fwd = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  let hudT = 0;

  useFrame((_, delta) => {
    const s = sim.current;
    const dt = Math.min(0.04, delta);
    const t = performance.now() / 1000;

    // wing flap
    const flap = Math.sin(t * 9) * 0.6;
    if (wingRefs[0].current) wingRefs[0].current.rotation.z = 0.25 + flap;
    if (wingRefs[1].current) wingRefs[1].current.rotation.z = -0.25 - flap;

    if (playing && !s.over) {
      s.t += dt;
      const inp = input.current;
      const yawInput = inp.x + (inp.left ? -1 : 0) + (inp.right ? 1 : 0);
      const pitchTarget = THREE.MathUtils.clamp(inp.y * 0.6 + (inp.down ? 0.5 : 0) - (inp.up ? 0.5 : 0), -0.6, 0.6);
      s.yaw += yawInput * 1.3 * dt;
      s.pitch += (pitchTarget - s.pitch) * Math.min(1, dt * 4);
      s.roll += (-yawInput * 0.5 - s.roll) * Math.min(1, dt * 4);

      const rot = new THREE.Euler(s.pitch, s.yaw, s.roll, 'YXZ');
      fwd.set(0, 0, 1).applyEuler(rot);
      s.pos.addScaledVector(fwd, s.speed * dt);
      s.pos.y = THREE.MathUtils.clamp(s.pos.y, 7, 95);
      s.pos.x = THREE.MathUtils.clamp(s.pos.x, -290, 290);
      s.pos.z = THREE.MathUtils.clamp(s.pos.z, -290, 290);

      if (dragon.current) {
        dragon.current.position.copy(s.pos);
        dragon.current.rotation.copy(rot);
        const sc = 1 + s.stage * 0.22;
        dragon.current.scale.setScalar(sc);
      }

      // camera chase
      camPos.copy(s.pos).addScaledVector(fwd, -13).add(new THREE.Vector3(0, 4.5, 0));
      camera.position.lerp(camPos, Math.min(1, dt * 4));
      lookAt.copy(s.pos).addScaledVector(fwd, 10);
      camera.lookAt(lookAt);

      // auto-fire
      s.fire -= dt;
      if (s.fire <= 0) {
        const b = s.balls.find(x => !x.active);
        if (b) {
          let tgt = null;
          let nd = 120;
          for (const e of s.enemies) {
            if (e.active) {
              const dd = s.pos.distanceTo(e.p);
              if (dd < nd) {
                nd = dd;
                tgt = e;
              }
            }
          }
          const dir = tgt ? new THREE.Vector3().subVectors(tgt.p, s.pos).normalize() : fwd.clone();
          b.active = true;
          b.life = 2.4;
          b.p.copy(s.pos).addScaledVector(dir, 2);
          b.v.copy(dir).multiplyScalar(135);
        }
        s.fire = Math.max(0.26, 0.7 - s.stage * 0.09);
      }

      // spawn enemies ahead
      s.espawn -= dt;
      if (s.espawn <= 0) {
        s.espawn = Math.max(0.9, 2.2 - s.t * 0.015);
        const e = s.enemies.find(x => !x.active);
        if (e) {
          e.active = true;
          e.max = 14 + s.stage * 6;
          e.hp = e.max;
          const side = new THREE.Vector3((Math.random() - 0.5) * 34, (Math.random() - 0.5) * 22, 0);
          e.p.copy(s.pos).addScaledVector(fwd, 95 + Math.random() * 45).add(side);
          e.p.y = Math.max(8, e.p.y);
        }
      }
    }

    // balls update
    for (let i = 0; i < s.balls.length; i++) {
      const b = s.balls[i];
      const m = ballRefs.current[i];
      if (!b.active) {
        if (m) m.visible = false;
        continue;
      }
      b.p.addScaledVector(b.v, dt);
      b.life -= dt;
      for (const e of s.enemies) {
        if (e.active && b.p.distanceTo(e.p) < 3.4) {
          e.hp -= 16 + s.stage * 7;
          b.active = false;
          if (e.hp <= 0) {
            e.active = false;
            s.score += 15;
            s.xp += 14;
          }
          break;
        }
      }
      if (b.life <= 0) b.active = false;
      if (m) {
        m.visible = b.active;
        m.position.copy(b.p);
      }
    }

    // enemies update
    for (let i = 0; i < s.enemies.length; i++) {
      const e = s.enemies[i];
      const m = enemyRefs.current[i];
      if (!e.active) {
        if (m) m.visible = false;
        continue;
      }
      if (playing && !s.over) {
        const dir = new THREE.Vector3().subVectors(s.pos, e.p);
        const d = dir.length();
        dir.normalize();
        e.p.addScaledVector(dir, 9 * dt);
        if (d < 3) {
          e.active = false;
          s.hp -= 12;
          if (s.hp <= 0 && !s.over) {
            s.over = true;
            onOver(s.score);
          }
        }
      }
      if (m) {
        m.visible = true;
        m.position.copy(e.p);
        m.rotation.y += dt * 2;
      }
    }

    // orbs
    for (let i = 0; i < s.orbs.length; i++) {
      const o = s.orbs[i];
      const m = orbRefs.current[i];
      if (!o.active) {
        if (m) m.visible = false;
        continue;
      }
      if (playing && !s.over && s.pos.distanceTo(o.p) < 3.2) {
        s.xp += 18;
        s.score += 8;
        placeOrb(o, s.pos);
      }
      if (m) {
        m.visible = true;
        m.position.copy(o.p);
        m.position.y += Math.sin(t * 2 + i) * 0.01;
        m.rotation.y += dt * 1.6;
      }
    }

    // evolve
    if (s.stage < XP_THRESH.length - 1 && s.xp >= XP_THRESH[s.stage + 1]) {
      s.stage++;
      s.speed += 4;
    }

    // hud throttle
    hudT += dt;
    if (hudT > 0.12) {
      hudT = 0;
      onHud({ score: s.score, hp: Math.max(0, s.hp), stage: s.stage, xp: s.xp });
    }
  });

  return (
    <group>
      <group ref={dragon} position={[0, 30, -60]}>
        <DragonModel wingRefs={wingRefs} />
      </group>

      {Array.from({ length: ENEMY_N }).map((_, i) => (
        <mesh key={`e${i}`} ref={el => (enemyRefs.current[i] = el)} visible={false}>
          <icosahedronGeometry args={[1.6, 0]} />
          <meshStandardMaterial color="#1a0a14" emissive="#ff2a5a" emissiveIntensity={1.1} roughness={0.4} flatShading />
        </mesh>
      ))}
      {Array.from({ length: BALL_N }).map((_, i) => (
        <mesh key={`b${i}`} ref={el => (ballRefs.current[i] = el)} visible={false}>
          <sphereGeometry args={[0.55, 10, 10]} />
          <meshBasicMaterial color="#ffb347" />
        </mesh>
      ))}
      {Array.from({ length: ORB_N }).map((_, i) => (
        <mesh key={`o${i}`} ref={el => (orbRefs.current[i] = el)} visible={false}>
          <icosahedronGeometry args={[1.1, 0]} />
          <meshStandardMaterial color="#0a1330" emissive="#49e0ff" emissiveIntensity={1.6} roughness={0.2} />
        </mesh>
      ))}

      <Terrain />
    </group>
  );
}
