// RTK Query: components subscribe to cache entries (two share one entry and
// one request). A mutation goes to the server, invalidates the `Post` tag,
// and every entry providing that tag flashes and refetches. The unused entry
// counts down its keepUnusedDataFor timer.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { C, Chip, Flow, Glass, Region, Wire, noRaycast } from '../primitives.jsx';

export const pose = { pos: [0, 1.4, 22], tgt: [-0.4, 0.6, 0], span: 23.5, height: 10.5 };

const COMPS = [
  { label: '<PostList>', hook: 'useGetPostsQuery()', y: 2.4, entry: 0 },
  { label: '<PostCount>', hook: 'useGetPostsQuery()', y: 0.8, entry: 0 },
  { label: '<PostDetail id=2>', hook: 'useGetPostQuery(2)', y: -0.8, entry: 1 },
];
const ENTRIES = [
  { text: 'getPosts(undefined) · 2 subs', y: 1.6 },
  { text: 'getPost(2) · 1 sub', y: 0.1 },
  { text: 'getPost(1) · 0 subs', y: -1.5 },
];
const SERVER = [8.2, 0.4, 0];
const PERIOD = 6.5;

export default function RtkqScene() {
  const entryMats = useRef([]);
  const tagMats = useRef([]);
  const mutation = useRef();
  const hand = useRef();
  const status = useRef();
  const last = useRef('');
  const mutCurve = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-7.4, -3.0, 0.4), new THREE.Vector3(1.0, -3.6, 0.9), new THREE.Vector3(SERVER[0] - 0.6, SERVER[1] - 1.2, 0.4)]), []);

  useFrame(({ clock }, dt) => {
    const u = clock.getElapsedTime() % PERIOD;
    if (mutation.current) {
      const k = u / 1.8;
      mutation.current.scale.setScalar(k < 1 ? 1 : 0.001);
      if (k < 1) mutCurve.getPointAt(k, mutation.current.position);
    }
    const invalid = u > 1.8 && u < 3.0;
    const refetch = u >= 3.0 && u < 4.2;
    entryMats.current.forEach((m, i) => {
      if (!m || i === 2) return;
      m.emissive.set(invalid ? C.amber : refetch ? C.cyan : C.green);
      m.emissiveIntensity = invalid || refetch ? 1.25 : 0.55;
    });
    tagMats.current.forEach(m => {
      if (m) m.emissiveIntensity = invalid ? 1.4 : 0.6;
    });
    if (hand.current) hand.current.rotation.z -= dt * 0.9;
    const text = u < 1.8 ? 'addPost({ title }) → POST /posts' : invalid ? 'success → invalidatesTags: [Post]' : refetch ? 'entries providing Post refetch automatically' : 'cache is fresh — components read it instantly';
    if (text !== last.current && status.current) {
      last.current = text;
      status.current.text = text;
      status.current.sync();
    }
  });

  return (
    <group>
      {/* components and their subscriptions */}
      {COMPS.map(c => (
        <group key={c.label}>
          <Chip position={[-9.0, c.y, 0]} size={[3.0, 0.9, 0.4]} color={C.react} text={`${c.label}\n${c.hook}`} textSize={0.17} intensity={0.5} />
          <Wire points={[[-7.5, c.y, 0.1], [-2.9, ENTRIES[c.entry].y, 0.1]]} color={C.violet} dashed opacity={0.6} />
        </group>
      ))}

      <Region id="dedup" position={[-5.2, 3.1, 0]} size={[3.6, 0.8, 0.6]} color={C.violet}>
        {hot => <Chip size={[3.4, 0.62, 0.35]} color={C.violet} text="2 subscribers → 1 request" textSize={0.19} hot={hot} intensity={0.5} />}
      </Region>

      <Region id="endpoints" position={[-0.6, 4.3, 0]} size={[8.6, 1.1, 0.6]} color={C.green} label="createApi" labelY={0.75}>
        {hot => <Chip size={[8.4, 0.9, 0.35]} color={C.green} text="endpoints: getPosts · getPost · addPost   →   generated hooks" textSize={0.22} hot={hot} intensity={0.35} />}
      </Region>

      {/* the cache shelf (lives in the Redux store under api.reducerPath) */}
      <Region id="q-cache" position={[-0.6, 0.85, 0]} size={[4.8, 2.9, 0.6]} color={C.green} label="cache in the store" sub="state.api.queries" labelY={2.1}>
        {hot =>
          ENTRIES.slice(0, 2).map((e, i) => (
            <Chip key={e.text} position={[0, e.y - 0.85, 0]} size={[4.6, 0.85, 0.4]} color={C.green} text={e.text} textSize={0.2} hot={hot} matRef={el => (entryMats.current[i] = el)} />
          ))
        }
      </Region>
      <Region id="lifetime" position={[-0.6, ENTRIES[2].y, 0]} size={[4.8, 1.0, 0.6]} color={C.grey} label="keepUnusedDataFor: 60s" labelY={-0.85}>
        {hot => (
          <Chip size={[4.6, 0.85, 0.4]} color={C.grey} text={ENTRIES[2].text} textSize={0.2} hot={hot} dim={!hot}>
            <group position={[2.0, 0, 0.3]}>
              <mesh raycast={noRaycast}>
                <torusGeometry args={[0.28, 0.04, 8, 32]} />
                <meshBasicMaterial color={C.yellow} />
              </mesh>
              <group ref={hand}>
                <mesh position={[0, 0.12, 0]} raycast={noRaycast}>
                  <boxGeometry args={[0.04, 0.24, 0.04]} />
                  <meshBasicMaterial color={C.yellow} />
                </mesh>
              </group>
            </group>
          </Chip>
        )}
      </Region>

      <Region id="tags" position={[3.4, 0.85, 0]} size={[1.9, 2.9, 0.6]} color={C.amber} label="tags" labelY={2.1}>
        {hot =>
          ['Post', 'Post:2'].map((t, i) => (
            <Chip key={t} position={[0, ENTRIES[i].y - 0.85, 0]} size={[1.6, 0.6, 0.35]} color={C.amber} text={t} textSize={0.2} hot={hot} matRef={el => (tagMats.current[i] = el)} />
          ))
        }
      </Region>

      {/* server */}
      <Flow points={[[1.8, 1.6, 0.3], [5.0, 1.6, 0.6], [SERVER[0] - 1.0, SERVER[1] + 0.5, 0.3]]} color={C.cyan} count={2} speed={0.4} size={0.08} />
      <Flow points={[[1.8, 0.1, 0.3], [5.0, 0.0, 0.6], [SERVER[0] - 1.0, SERVER[1] - 0.2, 0.3]]} color={C.cyan} count={2} speed={0.4} size={0.08} offset={0.5} />
      {[0.8, 0, -0.8].map(y => (
        <RoundedBox key={y} args={[2.2, 0.7, 1.4]} radius={0.07} position={[SERVER[0], SERVER[1] + y, 0]} raycast={noRaycast}>
          <Glass color={C.blue} intensity={0.45} />
        </RoundedBox>
      ))}
      <Text position={[SERVER[0], SERVER[1] + 1.6, 0]} fontSize={0.3} color="#ffffff" anchorX="center" raycast={noRaycast}>API server</Text>

      <Region id="mutation" position={[-9.0, -3.0, 0]} size={[3.4, 1.0, 0.6]} color={C.pink} label="mutation" labelY={0.7}>
        {hot => <Chip size={[3.2, 0.8, 0.4]} color={C.pink} text="useAddPostMutation()" textSize={0.19} hot={hot} />}
      </Region>
      <mesh ref={mutation} raycast={noRaycast}>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshStandardMaterial color="#0b1226" emissive={C.pink} emissiveIntensity={2.2} />
      </mesh>

      <Text ref={status} position={[1.2, -4.25, 0.3]} fontSize={0.26} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#05060e" raycast={noRaycast}>
        addPost
      </Text>
    </group>
  );
}
