# Progen Labs — website

The official website of **Progen Labs**, a nonprofit, completely open-source,
always-free developer community — and home of [Spectra](https://github.com/progen-labs/spectra),
the frontend performance profiler.

Built with **React + Vite**, **Three.js** (react-three-fiber) for the animated
spectrum field and infinity brand mark, **Framer Motion** for section reveals and
interactions, and **GSAP** (ScrollTrigger) for scroll-driven motion.

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

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the site and
publishes it to **GitHub Pages** on every push to `main`. To turn it on once:
**Settings → Pages → Build and deployment → Source: GitHub Actions**. The site
then serves from `https://progen-labs.github.io/website/` (the Vite `base` is
relative, so a custom domain works too).

## Structure

```
src/
  App.jsx                 # layout + GSAP ScrollTrigger setup
  data.js                 # all site copy (values, Spectra features, usage)
  components/
    Hero.jsx              # 3D spectrum hero + Framer Motion intro
    SpectrumField.jsx     # Three.js spectrum-colored point wave
    BrandMark.jsx         # the infinity brand moment
    InfinityLogo.jsx      # Three.js animated infinity (lemniscate) mark
    About.jsx             # what Progen Labs is (nonprofit / open / free / community)
    SpectraSection.jsx    # Spectra features, golden-path matrix, frameworks
    Install.jsx           # install & usage with tabbed code blocks
    Footer.jsx            # contribute CTA + footer
```

MIT licensed · © Progen Labs
