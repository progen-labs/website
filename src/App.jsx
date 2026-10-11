import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import BrandMark from './components/BrandMark.jsx';
import About from './components/About.jsx';
import SpectraSection from './components/SpectraSection.jsx';
import Install from './components/Install.jsx';
import Footer from './components/Footer.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Top scroll-progress bar.
      gsap.to('.scroll-progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
      });

      // Hero content drifts up and fades as you scroll past it.
      gsap.to('.hero-content', {
        y: -80,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });

      // Section titles get a subtle parallax rise.
      gsap.utils.toArray('.section-title').forEach(el => {
        gsap.from(el, {
          backgroundPositionX: '40%',
          scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 40%', scrub: true },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} id="top">
      <div className="scroll-progress" />
      <Nav />
      <main>
        <Hero />
        <BrandMark />
        <About />
        <SpectraSection />
        <Install />
      </main>
      <Footer />
    </div>
  );
}
