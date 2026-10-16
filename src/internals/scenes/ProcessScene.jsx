// Tabs → the multi-process architecture: one privileged browser process,
// sandboxed renderers (one per site), the GPU process and the network service,
// all talking over Mojo IPC (the travelling particles).
import { Block, C, Cage, CardMat, FaceText, Flow, INK_DIM, Orb, Wire, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0, 4, 24], tgt: [0, 0.3, 0], span: 27, height: 12.5 };

const RENDERERS = [
  { x: -6.4, site: 'progenlabs.dev', tab: -3 },
  { x: 0, site: 'react.dev', tab: 0 },
  { x: 6.4, site: 'github.com', tab: 3 },
];

export default function ProcessScene() {
  return (
    <group>
      {/* browser process with the tab strip on its face */}
      <Block id="browser" position={[0, 4.6, 0]} size={[10.4, 2.5, 1.6]} color={C.blue} label="Browser process" sub="UI · navigation · storage · permissions" labelPos={[0, 1.6, 0]}>
        {RENDERERS.map((r, i) => (
          <group key={r.site} position={[r.tab, 0.55, 0.81]}>
            <mesh raycast={noRaycast}>
              <boxGeometry args={[2.6, 0.56, 0.06]} />
              <CardMat color={C.blue} level={0.34} />
            </mesh>
            <FaceText position={[0, 0, 0.05]} size={0.3}>{`tab ${i + 1}`}</FaceText>
          </group>
        ))}
        <FaceText position={[-3.3, -0.45, 0.82]} size={0.3} color={INK_DIM}>UI thread</FaceText>
        <FaceText position={[0, -0.45, 0.82]} size={0.3} color={INK_DIM}>IO thread</FaceText>
        <FaceText position={[3.3, -0.45, 0.82]} size={0.3} color={INK_DIM}>profile & storage</FaceText>
      </Block>

      {/* each tab's content is drawn by a renderer */}
      {RENDERERS.map(r => (
        <Wire key={`t-${r.site}`} points={[[r.tab, 4.85, 1.0], [r.x, 0.0, 1.0]]} color={C.blue} dashed opacity={0.45} />
      ))}

      {/* renderers, each inside an OS sandbox */}
      {RENDERERS.map(r => (
        <group key={r.site}>
          <Block id="renderer" position={[r.x, -1.3, 0]} size={[4.8, 2.2, 1.6]} color={C.green} label="Renderer process" sub={`site: ${r.site}`} labelPos={[0, -2.15, 0]}>
            <group position={[0, 0.25, 0.82]}>
              {[
                ['Blink', -1.05, C.amber],
                ['V8', 1.05, C.green],
              ].map(([name, x, col]) => (
                <group key={name} position={[x, 0, 0]}>
                  <mesh raycast={noRaycast}>
                    <boxGeometry args={[1.9, 0.64, 0.08]} />
                    <CardMat color={col} level={0.36} />
                  </mesh>
                  <FaceText position={[0, 0, 0.06]} size={0.32}>{name}</FaceText>
                </group>
              ))}
            </group>
            <FaceText position={[0, -0.6, 0.82]} size={0.28} color={INK_DIM}>main · compositor · raster</FaceText>
          </Block>
          <Cage size={[5.5, 3.0, 2.4]} color={C.red} position={[r.x, -1.3, 0]} />
          <Block id="sandbox" position={[r.x + 1.85, 0.4, 1.25]} size={[1.8, 0.52, 0.25]} color={C.red} text="SANDBOX" textSize={0.28} />
        </group>
      ))}

      {/* gpu + network service */}
      <Block id="gpu" position={[11, 1.4, 0]} size={[3.4, 2.1, 1.6]} color={C.pink} label="GPU process" sub="Viz · raster · video" text={'draws\nframes'} textSize={0.34} />
      <Block id="netsvc" position={[-11, 1.4, 0]} size={[3.4, 2.1, 1.6]} color={C.amber} label="Network service" sub="DNS · TLS · HTTP · cache" text={'sockets\nlive here'} textSize={0.34} />

      {/* Mojo IPC — messages travelling between processes */}
      {RENDERERS.map((r, i) => (
        <Flow key={`ipc-${r.site}`} points={[[r.x * 0.25, 3.3, 0.9], [r.x * 0.7, 1.6, 1.3], [r.x, 0.0, 0.9]]} color={C.violet} count={3} speed={0.22} offset={i * 0.3} />
      ))}
      <Flow points={[[-5.2, 4.0, 0.6], [-8.6, 3.4, 1.0], [-11, 2.5, 0.6]]} color={C.violet} count={3} speed={0.25} />
      <Flow points={[[5.2, 4.0, 0.6], [8.6, 3.4, 1.0], [11, 2.5, 0.6]]} color={C.violet} count={3} speed={0.25} offset={0.5} />
      {/* compositor frames from a renderer to the GPU */}
      <Flow points={[[2.3, -1.2, 0.9], [6.5, -3.4, 1.4], [10.4, 0.3, 0.9]]} color={C.pink} count={4} speed={0.2} />

      <Orb id="ipc" position={[3.6, 2.15, 1.5]} color={C.violet} r={0.4} label="Mojo IPC" sub="message pipes" />

      <Block id="isolation" position={[0, -5.2, 0]} size={[15, 0.85, 0.35]} color={C.green} text="SITE ISOLATION — one renderer process per site" textSize={0.34} />
    </group>
  );
}
