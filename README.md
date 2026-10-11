# Progen Labs — website

The official website of **Progen Labs**, a nonprofit, completely open-source,
always-free developer community — built as an explorable **3D game world**.

Drive a character around the Progen Labs world with the keyboard, find the
glowing project gates, and walk up to **Spectra**. Press **Enter** at the gate
for a cinematic entry into the Spectra world, where everything about the
project — what it does, how to use it, framework support — is laid out.

Built with **React + Vite**, **Three.js** (react-three-fiber + drei) for the
world, character, portals and camera, **Framer Motion** for the UI/overlays,
and **GSAP** available for motion.

## Controls

- **W A S D** / **arrow keys** — move the character
- **Enter** — open a gate when you're standing in front of it

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

## Deploy

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and publishes
to **GitHub Pages** on every push to `main`. Enable it once under
**Settings → Pages → Build and deployment → Source: GitHub Actions**. The site
serves from `https://progen-labs.github.io/website/` (relative Vite base, so a
custom domain works too).

## Structure

```
src/
  App.jsx                 # game state machine (explore → entering → inside) + canvas
  data.js                 # all Spectra copy (features, usage, frameworks)
  game/
    World.jsx             # the 3D world: grid, stars, lights, portals, crystals
    Character.jsx         # the player avatar + keyboard movement
    Portal.jsx            # a project gate with sliding doors
    CameraRig.jsx         # third-person follow camera + gate cinematic
    useKeyboard.js        # key-state hook
  components/
    Hud.jsx               # explore HUD: title, controls, gate prompt
    SpectraWorld.jsx      # the world behind the Spectra gate (all the details)
    Icons.jsx             # brand mark
```

MIT licensed · © Progen Labs
