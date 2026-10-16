// Shared 3D building blocks for the Internals Explorer: clickable hotspots,
// labelled cards, flowing particles, arrows and callouts. Every scene is
// assembled from these, so the look and the accessibility rules live here:
//
//  • Anything that carries text is a dark "card": a tinted face (never more
//    than ~40% of the accent mixed into the surface colour) with a coloured
//    border. Light text on it measures ≥ 7:1 contrast (WCAG AAA for large
//    text, AA for body text). Glow lives on borders and decorative shapes,
//    never behind text.
//  • Floating labels sit on a dark backing plate and are drawn in front of
//    nearby geometry, so a gear or a line can never cover them.
//  • 3D text has a floor (TEXT_MIN world units ≈ 13px on a laptop screen at
//    the default framing). Zooming the camera enlarges everything uniformly.
//  • Multi-line text is laid out line by line (no stray glyph boxes).
import { createContext, useContext, useMemo, useRef, useState } from 'react';
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

/** Text colours, chosen for contrast on the dark card faces / plates. */
export const INK = '#f5f7ff'; // primary (≈ 15:1 on #0a0f1e, ≥ 5.5:1 on the brightest card tint)
export const INK_DIM = '#c3cbe2'; // secondary (≥ 4.5:1 on every card tint)
export const TEXT_MIN = 0.28; // world units — the smallest 3D text allowed
export const SURFACE = '#0a0f1e';

// hovered / selected / pick / clickGuard — provided inside the Canvas
export const PickContext = createContext(null);
export const usePick = () => useContext(PickContext);

export const noRaycast = () => null;

/** sRGB hex mix: t = 0 → a, t = 1 → b. */
export function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = s => {
    const x = (pa >> s) & 255;
    const y = (pb >> s) & 255;
    return Math.round(x + (y - x) * t);
  };
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}

/** Card face colour for an accent at a given strength. Keep ≤ 0.42 so light
 *  text on top stays above 4.5:1 for every accent in the palette. */
export const cardTint = (accent, level = 0.22) => mix(SURFACE, accent, Math.min(level, 0.42));
export const CARD = { dim: 0.1, idle: 0.22, hot: 0.36, active: 0.42 };

/** Repaint a card material from an animation (e.g. "this one is re-rendering"). */
export function paintCard(mat, accent, level) {
  if (!mat) return;
  mat.emissive.set(cardTint(accent, level));
  mat.emissiveIntensity = 1;
}

/** Unlit-looking card face: black diffuse + tinted emissive = exact colour. */
export function CardMat({ color, level = CARD.idle, opacity = 1, matRef }) {
  return (
    <meshStandardMaterial
      ref={matRef}
      color="#000000"
      emissive={cardTint(color, level)}
      emissiveIntensity={1}
      roughness={0.8}
      metalness={0}
      transparent={opacity < 1}
      opacity={opacity}
    />
  );
}

/** A thin rectangular border on the front face of a card. */
export function Border({ size, color, width = 1.4, z }) {
  const [w, h, d] = size;
  const zz = z ?? d / 2 + 0.006;
  const pts = useMemo(
    () => [
      [-w / 2, -h / 2, zz],
      [w / 2, -h / 2, zz],
      [w / 2, h / 2, zz],
      [-w / 2, h / 2, zz],
      [-w / 2, -h / 2, zz],
    ],
    [w, h, zz],
  );
  return <Line points={pts} color={color} lineWidth={width} raycast={noRaycast} />;
}

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

/** Glowing material for DECORATIVE shapes only (never put text on it). */
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

/**
 * Text printed flat on a surface. Enforces TEXT_MIN unless `raw` (for tiny
 * decorative mock-UI text), and lays out "\n" line by line.
 */
export function FaceText({ children, size = 0.32, color = INK, anchorX = 'center', anchorY = 'middle', lineHeight = 1.28, position = [0, 0, 0], raw, textAlign, ...rest }) {
  const s = raw ? size : Math.max(size, TEXT_MIN);
  const str = children == null ? '' : String(children);
  const align = textAlign || (anchorX === 'left' ? 'left' : anchorX === 'right' ? 'right' : 'center');
  if (!str.includes('\n')) {
    return (
      <Text position={position} fontSize={s} color={color} anchorX={anchorX} anchorY={anchorY} textAlign={align} raycast={noRaycast} {...rest}>
        {str}
      </Text>
    );
  }
  const lines = str.split('\n');
  const lh = s * lineHeight;
  const total = lines.length * lh;
  const top = anchorY === 'top' ? 0 : anchorY === 'bottom' ? total : total / 2;
  return (
    <group position={position}>
      {lines.map((l, i) => (
        <Text key={i} position={[0, top - lh * (i + 0.5), 0]} fontSize={s} color={color} anchorX={anchorX} anchorY="middle" textAlign={align} raycast={noRaycast} {...rest}>
          {l.length ? l : ' '}
        </Text>
      ))}
    </group>
  );
}

/**
 * Camera-facing title + optional subtitle on a dark plate, nudged towards the
 * camera so nearby geometry never covers it. With place="above" (default) the
 * whole label sits above `position`; with place="below" it hangs beneath it —
 * so a label never overlaps the object it describes.
 */
export function Label({ position, title, sub, color = '#ffffff', subColor = INK_DIM, size = 0.46, maxWidth = 10, place = 'above' }) {
  const ts = Math.max(size, 0.44);
  const ss = Math.max(ts * 0.64, 0.3);
  const gap = ts * 0.2;
  const [tb, setTb] = useState(null);
  const [sb, setSb] = useState(null);

  // vertical layout of the two lines relative to `position`
  const above = place !== 'below';
  const subH = sub ? (sb ? sb[3] - sb[1] : ss * 1.2) : 0;
  const titleH = tb ? tb[3] - tb[1] : ts * 1.2;
  const titleY = above ? (sub ? subH + gap : 0) : 0;
  const subY = above ? 0 : -(titleH + gap);
  const titleAnchor = above ? 'bottom' : 'top';
  const subAnchor = above ? 'bottom' : 'top';

  let plate = null;
  if (tb) {
    let minX = tb[0];
    let maxX = tb[2];
    let minY = tb[1] + titleY;
    let maxY = tb[3] + titleY;
    if (sub && sb) {
      minX = Math.min(minX, sb[0]);
      maxX = Math.max(maxX, sb[2]);
      minY = Math.min(minY, sb[1] + subY);
      maxY = Math.max(maxY, sb[3] + subY);
    }
    const px = ts * 0.32;
    const py = ts * 0.16;
    plate = { w: maxX - minX + 2 * px, h: maxY - minY + 2 * py, x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  }

  return (
    <Billboard position={position}>
      <group position={[0, 0, 0.5]}>
        {plate && (
          <mesh position={[plate.x, plate.y, -0.02]} renderOrder={9} raycast={noRaycast}>
            <planeGeometry args={[plate.w, plate.h]} />
            <meshBasicMaterial color="#060914" transparent opacity={0.9} depthWrite={false} />
          </mesh>
        )}
        <Text
          renderOrder={10}
          position={[0, titleY, 0]}
          fontSize={ts}
          color={color}
          anchorX="center"
          anchorY={titleAnchor}
          maxWidth={maxWidth}
          textAlign="center"
          onSync={m => setTb(m.textRenderInfo ? [...m.textRenderInfo.blockBounds] : null)}
        >
          {title}
        </Text>
        {sub ? (
          <Text
            renderOrder={10}
            position={[0, subY, 0]}
            fontSize={ss}
            color={subColor}
            anchorX="center"
            anchorY={subAnchor}
            maxWidth={maxWidth}
            textAlign="center"
            onSync={m => setSb(m.textRenderInfo ? [...m.textRenderInfo.blockBounds] : null)}
          >
            {sub}
          </Text>
        ) : null}
      </group>
    </Billboard>
  );
}

/** A labelled card that is NOT a hotspot itself — its highlight is driven by
 *  the parent (e.g. a Region), so many chips can highlight as one concept. */
export function Chip({ position, size = [1.9, 0.62, 0.4], color = C.react, text, textSize = 0.32, hot, dim, textColor, matRef, children }) {
  const level = hot ? CARD.hot : dim ? CARD.dim : CARD.idle;
  return (
    <group position={position}>
      <RoundedBox args={size} radius={Math.max(0.01, Math.min(0.1, size[1] / 2 - 0.01, size[2] / 2 - 0.01))} smoothness={3} raycast={noRaycast}>
        <CardMat color={color} level={level} matRef={matRef} opacity={dim ? 0.75 : 1} />
      </RoundedBox>
      <Border size={size} color={hot ? color : mix(SURFACE, color, dim ? 0.35 : 0.7)} width={hot ? 2.2 : 1.3} />
      {text != null && (
        <FaceText position={[0, 0, size[2] / 2 + 0.012]} size={textSize} color={textColor || (dim ? INK_DIM : INK)} maxWidth={size[0] * 0.92}>
          {text}
        </FaceText>
      )}
      {children}
    </group>
  );
}

/** The workhorse hotspot card: face text, border, optional floating label. */
export function Block({ id, position, rotation, size = [2, 1, 0.6], color = C.cyan, label, sub, labelPos, text, textSize = 0.32, textColor = INK, opacity = 1, disabled, children }) {
  const r = Math.max(0.01, Math.min(0.12, size[0] / 2 - 0.01, size[1] / 2 - 0.01, size[2] / 2 - 0.01));
  return (
    <Hotspot id={id} position={position} rotation={rotation} disabled={disabled}>
      {(hot, sel) => (
        <>
          <RoundedBox args={size} radius={r} smoothness={3}>
            <CardMat color={color} level={hot || sel ? CARD.hot : CARD.idle} opacity={opacity} />
          </RoundedBox>
          <Border size={size} color={hot || sel ? color : mix(SURFACE, color, 0.7)} width={hot || sel ? 2.4 : 1.4} />
          {(hot || sel) && <Outline size={size} color={color} />}
          {text != null && (
            <FaceText position={[0, 0, size[2] / 2 + 0.012]} size={textSize} color={textColor} maxWidth={size[0] * 0.92}>
              {text}
            </FaceText>
          )}
          {label && (
            <Label
              // labelPos values were authored as the title's baseline; a label hung below starts ~0.4 higher
              position={labelPos ? [labelPos[0], labelPos[1] < 0 ? labelPos[1] + 0.4 : labelPos[1], labelPos[2]] : [0, size[1] / 2 + 0.25, 0]}
              title={label}
              sub={sub}
              subColor={mix(color, '#ffffff', 0.35)}
              place={labelPos && labelPos[1] < 0 ? 'below' : 'above'}
            />
          )}
          {typeof children === 'function' ? children(hot, sel) : children}
        </>
      )}
    </Hotspot>
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
            <Label
              position={[center[0], labelY == null ? center[1] + size[1] / 2 + 0.2 : labelY < center[1] ? labelY + 0.4 : labelY, center[2]]}
              title={label}
              sub={sub}
              subColor={mix(color, '#ffffff', 0.35)}
              place={labelY != null && labelY < center[1] ? 'below' : 'above'}
            />
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
          {label && <Label position={labelPos || [0, r + 0.35, 0]} title={label} sub={sub} subColor={mix(color, '#ffffff', 0.35)} />}
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
      <Label position={to} title={title} sub={sub} subColor={mix(color, '#ffffff', 0.35)} size={0.5} />
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

/** A cog wheel facing the camera (decorative). */
export function Gear({ r = 0.9, color, teeth = 10 }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.35, 32]} />
        <Glass color={color} intensity={0.7} />
      </mesh>
      {Array.from({ length: teeth }, (_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * (r + 0.14), Math.sin(a) * (r + 0.14), 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.32, 0.26, 0.35]} />
            <Glass color={color} intensity={0.7} />
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
