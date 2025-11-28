'use client';

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions, MoveDirection, OutMode } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

const ParticleBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const particlesLoaded = async (container?: Container) => {
    console.log(container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      background: { color: { value: "transparent" } },
      fpsLimit: 120,
      interactivity: {
        events: { onClick: { enable: true, mode: "push" }, onHover: { enable: true, mode: "repulse" } },
        modes: { push: { quantity: 4 }, repulse: { distance: 200, duration: 0.4 } },
      },
      particles: {
        color: { value: "#ffffff" },
        links: { enable: true, color: "#ffffff", distance: 150, opacity: 0.5, width: 1 },
        move: { enable: true, speed: 6, direction: MoveDirection.none, outModes: { default: OutMode.out }, straight: false },
        number: { value: 80, density: { enable: true } },
        opacity: { value: 0.5 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 5 } },
      },
      detectRetina: true,
    }),
    [],
  );

  if (!init) return null;

  return <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={options} className="absolute inset-0 -z-10" />;
};

export default ParticleBackground;
