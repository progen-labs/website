// Context: the Provider's value flips; a wave spreads down the tree and only
// the consumers light up — straight through the memoized Layout. Left: the
// prop-drilling chain that context replaces.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Arrow, Block, C, Chip, FaceText, Region, Wire, noRaycast, paintCard } from '../primitives.jsx';

export const pose = { pos: [0, 1.5, 22], tgt: [0.6, 0.8, 0], span: 25, height: 10.5 };

const OX = 3;
const N = {
  App: [0, 3.8],
  Provider: [0, 2.4],
  Layout: [0, 1.0],
  Header: [-3.2, -0.4],
  Sidebar: [0, -0.4],
  Main: [3.2, -0.4],
  Card: [2.0, -1.8],
  Button: [4.4, -1.8],
};
const EDGES = [
  ['App', 'Provider'],
  ['Provider', 'Layout'],
  ['Layout', 'Header'],
  ['Layout', 'Sidebar'],
  ['Layout', 'Main'],
  ['Main', 'Card'],
  ['Main', 'Button'],
];
const P = n => [OX + N[n][0], N[n][1], 0];
const GOLD = '#ffd166';
const PERIOD = 4;

export default function ContextScene() {
  const wave = useRef();
  const header = useRef();
  const button = useRef();
  const valueText = useRef();
  const last = useRef(-1);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const cycle = Math.floor(t / PERIOD);
    const u = (t % PERIOD) / 1.6; // wave lasts 1.6s of each period
    const r = 0.3 + Math.min(u, 1) * 6.5;
    if (wave.current) {
      wave.current.scale.setScalar(r);
      wave.current.material.opacity = u < 1 ? 0.55 * (1 - u) : 0;
    }
    const reach = (n, mat) => {
      if (!mat) return;
      const [x, y] = N[n];
      const d = Math.hypot(x - N.Provider[0], y - N.Provider[1]);
      paintCard(mat, GOLD, u < 1.6 && r >= d ? 0.42 : 0.2);
    };
    reach('Header', header.current);
    reach('Button', button.current);
    if (cycle !== last.current && valueText.current) {
      last.current = cycle;
      valueText.current.text = `value = "${cycle % 2 ? 'light' : 'dark'}"`;
      valueText.current.sync();
    }
  });

  return (
    <group>
      {EDGES.map(([a, b]) => (
        <Wire key={a + b} points={[P(a), P(b)]} color="#5d6a92" opacity={0.6} />
      ))}
      {['App', 'Sidebar', 'Main', 'Card'].map(n => (
        <Chip key={n} position={P(n)} color={C.react} text={`<${n}>`} intensity={0.45} />
      ))}

      <Region id="provider" position={P('Provider')} size={[7.8, 0.9, 0.6]} center={[1.8, 0, 0]} color={GOLD} label="Provider" sub="broadcasts a value">
        {hot => (
          <>
            <Chip size={[3.9, 0.7, 0.45]} color={GOLD} text="<ThemeContext.Provider>" textSize={0.28} hot={hot} />
            <Chip position={[3.75, 0, 0]} size={[2.9, 0.62, 0.35]} color={GOLD} hot={hot}>
              <Text ref={valueText} position={[0, 0, 0.19]} fontSize={0.29} color="#fff3c4" anchorX="center" anchorY="middle" raycast={noRaycast}>
                value = "dark"
              </Text>
            </Chip>
          </>
        )}
      </Region>

      {/* the change wave */}
      <mesh ref={wave} position={[OX + N.Provider[0], N.Provider[1], 0.3]} raycast={noRaycast}>
        <torusGeometry args={[1, 0.02, 8, 80]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0} />
      </mesh>

      <Region id="propagation" position={P('Layout')} size={[3.1, 0.8, 0.6]} color={C.grey} label="memo skipped — consumers still update" labelY={0.4}>
        {hot => <Chip size={[2.9, 0.62, 0.4]} color={C.grey} text="<Layout> memo" textSize={0.3} dim={!hot} hot={hot} />}
      </Region>

      <Region id="consumer" position={P('Header')} size={[2.4, 0.8, 0.6]} color={GOLD} label="useContext" labelY={-0.95}>
        {hot => <Chip size={[2.2, 0.62, 0.4]} color={GOLD} text="<Header>" hot={hot} matRef={header} />}
      </Region>
      <Region id="consumer" position={P('Button')} size={[2.4, 0.8, 0.6]} color={GOLD} label="useContext" labelY={-0.95}>
        {hot => <Chip size={[2.2, 0.62, 0.4]} color={GOLD} text="<Button>" hot={hot} matRef={button} />}
      </Region>

      {/* prop drilling, for contrast */}
      <Region id="drilling" position={[-9.3, 0.6, 0]} size={[3.4, 6.2, 0.8]} color={C.red} label="Prop drilling" sub="without context" labelY={3.4}>
        {hot => (
          <>
            {['<App theme>', '<Page theme>', '<Panel theme>', '<Button theme>'].map((t, i) => (
              <Chip key={t} position={[0, 2.3 - i * 1.55, 0]} size={[2.9, 0.62, 0.4]} color={i === 3 ? GOLD : C.red} text={t} textSize={0.29} hot={hot} />
            ))}
            {[0, 1, 2].map(i => (
              <group key={i}>
                <Arrow from={[0, 1.95 - i * 1.55, 0.25]} to={[0, 1.1 - i * 1.55, 0.25]} color="#ffb3bd" head={0.2} />
                <FaceText position={[0.2, 1.52 - i * 1.55, 0.25]} size={0.28} color="#ffc2c9" anchorX="left">props.theme</FaceText>
              </group>
            ))}
          </>
        )}
      </Region>

      <Block id="split" position={[11.3, 3.4, 0]} size={[3.6, 1.1, 0.35]} color={GOLD} text={'useMemo the value\nsplit contexts'} textSize={0.3} label="Keep it fast" labelPos={[0, 0.8, 0]} />
    </group>
  );
}
