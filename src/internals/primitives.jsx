// Shared 3D building blocks for the Internals Explorer: clickable hotspots,
// labelled blocks, flowing particles, arrows and callouts. Every scene is
// assembled from these so the look (dark glass + emissive accent) stays
// consistent and every interactive piece behaves the same way.
import { createContext, useContext, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Edges, Line, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

export const C = {
  blue: '#5b8bff',
  cyan: '#36d6ff',
  react: '#61dafb',
  green: '#46e2a0',
  amber: '#ffb86b',
  yellow: '#ffd166',
  pink: '#ff6ad5',
  violet: '#a78bfa',
  red: '#ff6b7a',
  grey: '#8a93ad',
};

// hovered / selected / pick / clickGuard — provided inside the Canvas
export const PickContext = createContext(null);
export const usePick = () => useContext(PickContext);

export const noRaycast = () => null;

/** A group that hovers, highlights and picks as one unit. Children may be a
 *  render function `(hot, selected) => …`. */
export function Hotspot({ id, disabled, children, ...props }) {
  const ctx = usePick();
  const hot = !disabled && ctx.hovered === id;
  const sel = !disabled && ctx.selected === id;
  const handlers = disabled
    ? {}
    : {
        onPointerOver: e => {
          e.stopPropagation();
          ctx.setHovered(id);
          document.body.style.cursor = 'pointer';
        },
        onPointerOut: () => {
          ctx.setHovered(h => (h === id ? null : h));
          document.body.style.cursor = '';
        },
        onClick: e => {
          e.stopPropagation();
          if (ctx.clickGuard.current.drag) return;
          ctx.pick(id);
        },
      };
  return (
    <group {...props} {...handlers}>
      {typeof children === 'function' ? children(hot, sel) : children}
    </group>
  );
}

/** Invisible but raycastable volume, so a hotspot is easy to hit. */
export function HitBox({ size, position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

/** Dark glass with an emissive accent; brightens when hot. */
export function Glass({ color, hot, intensity = 0.55, opacity = 1, base = '#0b1226' }) {
  return (
    <meshStandardMaterial
      color={base}
      emissive={color}
      emissiveIntensity={hot ? intensity * 2.3 : intensity}
      roughness={0.35}
      metalness={0.35}
      transparent={opacity < 1}
      opacity={opacity}
    />
  );
}

export function Outline({ size, color, pad = 0.16, position }) {
  return (
    <mesh position={position} raycast={noRaycast}>
      <boxGeometry args={[size[0] + pad, size[1] + pad, size[2] + pad]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      <Edges color={color} threshold={15} />
    </mesh>
  );
}

export function Cage({ size, color, position }) {
  return (
    <mesh position={position} raycast={noRaycast}>
      <boxGeometry args={size} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      <Edges color={color} />
    </mesh>
  );
}

/** Camera-facing title + optional subtitle. The title sits above `position`. */
export function Label({ position, title, sub, color = '#ffffff', subColor = '#9fb0d8', size = 0.42, maxWidth = 9 }) {
  return (
    <Billboard position={position}>
      <Text fontSize={size} color={color} anchorX="center" anchorY="bottom" outlineWidth={size * 0.05} outlineColor="#05060e" maxWidth={maxWidth} textAlign="center">
        {title}
      </Text>
      {sub ? (
        <Text position={[0, -size * 0.3, 0]} fontSize={size * 0.58} color={subColor} anchorX="center" anchorY="top" outlineWidth={size * 0.03} outlineColor="#05060e" maxWidth={maxWidth} textAlign="center">
          {sub}
        </Text>
      ) : null}
    </Billboard>
  );
}

/** Text printed flat on a surface (does not face the camera). */
export function FaceText({ children, size = 0.3, color = '#e8ecff', anchorX = 'center', anchorY = 'middle', ...rest }) {
  return (
    <Text fontSize={size} color={color} anchorX={anchorX} anchorY={anchorY} raycast={noRaycast} {...rest}>
      {children}
    </Text>
  );
}

/** The workhorse: a rounded glass block that is a hotspot, with face text and a label. */
export function Block({
  id,
  position,
  rotation,
  size = [2, 1, 0.6],
  color = C.cyan,
  label,
  sub,
  labelPos,
  text,
  textSize = 0.3,
  textColor = '#eef2ff',
  radius = 0.12,
  opacity = 1,
  intensity = 0.55,
  disabled,
  children,
}) {
  const r = Math.max(0.01, Math.min(radius, size[0] / 2 - 0.01, size[1] / 2 - 0.01, size[2] / 2 - 0.01));
  return (
    <Hotspot id={id} position={position} rotation={rotation} disabled={disabled}>
      {(hot, sel) => (
        <>
          <RoundedBox args={size} radius={r} smoothness={3}>
            <Glass color={color} hot={hot || sel} opacity={opacity} intensity={intensity} />
          </RoundedBox>
          {(hot || sel) && <Outline size={size} color={color} />}
          {text != null && (
            <FaceText position={[0, 0, size[2] / 2 + 0.012]} size={textSize} color={textColor} maxWidth={size[0] * 0.92} textAlign="center" lineHeight={1.25}>
              {text}
            </FaceText>
          )}
          {label && <Label position={labelPos || [0, size[1] / 2 + 0.3, 0]} title={label} sub={sub} color={hot || sel ? '#ffffff' : '#dfe6ff'} subColor={color} />}
          {typeof children === 'function' ? children(hot, sel) : children}
        </>
      )}
    </Hotspot>
  );
}

/** A labelled node that is NOT a hotspot itself — its glow is driven by the
 *  parent (e.g. a Region), so many chips can highlight as one concept. */
export function Chip({ position, size = [1.9, 0.62, 0.4], color = C.react, text, textSize = 0.22, hot, dim, intensity = 0.6, textColor, matRef, children }) {
  return (
    <group position={position}>
      <RoundedBox args={size} radius={Math.max(0.01, Math.min(0.12, size[1] / 2 - 0.01, size[2] / 2 - 0.01))} smoothness={3} raycast={noRaycast}>
        <meshStandardMaterial
          ref={matRef}
          color="#0b1226"
          emissive={color}
          emissiveIntensity={hot ? Math.min(1.3, Math.max(0.9, intensity * 2.2)) : dim ? intensity * 0.4 : intensity}
          roughness={0.35}
          metalness={0.3}
          transparent={!!dim}
          opacity={dim ? 0.6 : 1}
        />
      </RoundedBox>
      {text != null && (
        <FaceText
          position={[0, 0, size[2] / 2 + 0.012]}
          size={textSize}
          color={textColor || (dim ? '#9aa3bd' : '#ffffff')}
          maxWidth={size[0] * 0.92}
          textAlign="center"
          lineHeight={1.2}
          outlineWidth={textSize * 0.07}
          outlineColor="#05060e"
        >
          {text}
        </FaceText>
      )}
      {children}
    </group>
  );
}

/** A hotspot area: hit box + outline + label; children may be `(hot) => …`. */
export function Region({ id, position, size, color = C.cyan, label, sub, labelY, center = [0, 0, 0], children }) {
  return (
    <Hotspot id={id} position={position}>
      {(hot, sel) => (
        <>
          {typeof children === 'function' ? children(hot || sel) : children}
          <HitBox size={size} position={center} />
          {(hot || sel) && <Outline size={size} position={center} color={color} pad={0.1} />}
          {label && (
            <Label position={[center[0], labelY ?? center[1] + size[1] / 2 + 0.25, center[2]]} title={label} sub={sub} subColor={color} size={0.36} color={hot || sel ? '#ffffff' : '#dfe6ff'} />
          )}
        </>
      )}
    </Hotspot>
  );
}

/** A glowing sphere hotspot (for "things" rather than "boxes"). */
export function Orb({ id, position, color, r = 0.45, label, sub, labelPos }) {
  return (
    <Hotspot id={id} position={position}>
      {(hot, sel) => (
        <>
          <mesh scale={hot || sel ? 1.25 : 1}>
            <icosahedronGeometry args={[r, 2]} />
            <meshStandardMaterial color="#0b1226" emissive={color} emissiveIntensity={hot || sel ? 2.4 : 1.3} roughness={0.3} />
          </mesh>
          <mesh raycast={noRaycast}>
            <sphereGeometry args={[r * 1.7, 20, 20]} />
            <meshBasicMaterial color={color} transparent opacity={0.1} depthWrite={false} />
          </mesh>
          <HitBox size={[r * 3, r * 3, r * 3]} />
          {label && <Label position={labelPos || [0, r + 0.35, 0]} title={label} sub={sub} subColor={color} size={0.36} />}
        </>
      )}
    </Hotspot>
  );
}

export function Wire({ points, color = '#9fb0d8', width = 1.2, opacity = 0.5, dashed = false }) {
  return <Line points={points} color={color} lineWidth={width} transparent opacity={opacity} dashed={dashed} dashSize={0.22} gapSize={0.14} raycast={noRaycast} />;
}

export function Arrow({ from, to, color = '#9fb0d8', width = 1.6, dashed, opacity = 0.9, head = 0.3 }) {
  const { end, quat } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a).normalize();
    return {
      end: b.clone().addScaledVector(dir, -head / 2),
      quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir),
    };
  }, [from, to, head]);
  return (
    <group>
      <Wire points={[from, end.toArray()]} color={color} width={width} dashed={dashed} opacity={opacity} />
      <mesh position={end} quaternion={quat} raycast={noRaycast}>
        <coneGeometry args={[head * 0.4, head, 14]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

/** Particles travelling along a smooth path — data, messages, packets. */
export function Flow({ points, color, count = 5, speed = 0.16, size = 0.1, closed = false, opacity = 0.32, width = 1.1, offset = 0, line = true }) {
  const key = JSON.stringify(points);
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), closed, 'centripetal'),
    [key, closed], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const linePts = useMemo(() => curve.getPoints(Math.max(32, points.length * 18)), [curve, points.length]);
  const refs = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    for (let i = 0; i < count; i++) {
      const m = refs.current[i];
      if (m) curve.getPointAt((((t + i / count) % 1) + 1) % 1, m.position);
    }
  });
  return (
    <group>
      {line && <Line points={linePts} color={color} lineWidth={width} transparent opacity={opacity} raycast={noRaycast} />}
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={el => (refs.current[i] = el)} raycast={noRaycast}>
          <sphereGeometry args={[size, 12, 12]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

/** A labelled leader line from a part out to a floating title. */
export function Callout({ from, to, title, sub, color }) {
  return (
    <group>
      <Wire points={[from, to]} color={color} opacity={0.75} width={1.3} />
      <mesh position={from} raycast={noRaycast}>
        <sphereGeometry args={[0.1, 14, 14]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Label position={to} title={title} sub={sub} subColor={color} size={0.5} />
    </group>
  );
}

export function Spin({ speed = 0.5, axis = 'y', children, ...props }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation[axis] += dt * speed;
  });
  return (
    <group ref={ref} {...props}>
      {children}
    </group>
  );
}

export function Bob({ amp = 0.15, speed = 1, phase = 0, children, ...props }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.getElapsedTime() * speed + phase) * amp;
  });
  return (
    <group {...props}>
      <group ref={ref}>{children}</group>
    </group>
  );
}

/** A cog wheel facing the camera. */
export function Gear({ r = 0.9, color, teeth = 10 }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.35, 32]} />
        <Glass color={color} intensity={0.8} />
      </mesh>
      {Array.from({ length: teeth }, (_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * (r + 0.14), Math.sin(a) * (r + 0.14), 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.32, 0.26, 0.35]} />
            <Glass color={color} intensity={0.8} />
          </mesh>
        );
      })}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]}>
        <cylinderGeometry args={[r * 0.35, r * 0.35, 0.4, 20]} />
        <meshBasicMaterial color="#05060e" />
      </mesh>
    </group>
  );
}

/** Small padlock (TLS, sandbox). */
export function Padlock({ color = C.green, scale = 1 }) {
  return (
    <group scale={scale}>
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.5, 0.4, 0.2]} />
        <Glass color={color} intensity={0.9} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <torusGeometry args={[0.16, 0.05, 10, 24, Math.PI]} />
        <meshStandardMaterial color="#c9d4ee" metalness={0.8} roughness={0.25} />
      </mesh>
    </group>
  );
}
