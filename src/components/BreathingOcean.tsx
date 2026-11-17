// src/components/BreathingOcean.tsx
// Calming, generative breathing ocean visualization rendered via HTML5 Canvas

import React, { useEffect, useRef } from 'react';
import { Waves } from 'lucide-react';

interface BreathingOceanProps {
  breathingRate: number | null;
  isActive: boolean;
  isPaused: boolean;
  isSimulated: boolean;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
}

export const BreathingOcean: React.FC<BreathingOceanProps> = ({
  breathingRate,
  isActive,
  isPaused,
  isSimulated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Target breathing rate: measured or default relaxing rhythm
  const currentBpm = breathingRate && breathingRate >= 4 && breathingRate <= 40 ? breathingRate : 10;
  const cycleDurationSec = 60 / currentBpm;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;
    const particles: Particle[] = [];

    // Initialize ambient shimmering sea particles
    const initParticles = (width: number, height: number) => {
      particles.length = 0;
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * width,
          y: height * 0.55 + Math.random() * (height * 0.4),
          radius: Math.random() * 1.8 + 0.6,
          speedY: Math.random() * 0.3 + 0.1,
          opacity: Math.random() * 0.6 + 0.2,
          fadeSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        });
      }
    };

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      initParticles(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const startTime = performance.now();

    const draw = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (!isPaused) {
        step += 0.018;
      }

      // Breathing swell modulation
      const elapsedSec = (now - startTime) / 1000;
      const breathingPhase = (elapsedSec * (2 * Math.PI)) / cycleDurationSec;
      const swell = isActive && !isPaused ? Math.sin(breathingPhase) * 14 : Math.sin(step * 0.5) * 8;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Sky Background gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0a0d1a');
      skyGrad.addColorStop(0.55, '#131b31');
      skyGrad.addColorStop(1, '#0e172a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Celestial Moon
      const moonX = width * 0.5;
      const moonY = height * 0.22;
      const moonRadius = 26;

      // Soft Moon Glow
      const glowGrad = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 3.5);
      glowGrad.addColorStop(0, 'rgba(215, 225, 255, 0.45)');
      glowGrad.addColorStop(0.4, 'rgba(170, 195, 255, 0.15)');
      glowGrad.addColorStop(1, 'rgba(170, 195, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Moon Disc
      const moonDiscGrad = ctx.createLinearGradient(moonX - moonRadius, moonY - moonRadius, moonX + moonRadius, moonY + moonRadius);
      moonDiscGrad.addColorStop(0, '#f0f4ff');
      moonDiscGrad.addColorStop(1, '#d0d8f0');
      ctx.fillStyle = moonDiscGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Light Beam / Water Reflection
      const beamGrad = ctx.createLinearGradient(0, moonY + moonRadius, 0, height);
      beamGrad.addColorStop(0, 'rgba(220, 235, 255, 0.16)');
      beamGrad.addColorStop(0.5, 'rgba(140, 190, 255, 0.08)');
      beamGrad.addColorStop(1, 'rgba(100, 150, 255, 0.0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(moonX - 25, moonY + moonRadius);
      ctx.lineTo(moonX + 25, moonY + moonRadius);
      ctx.lineTo(moonX + 110, height);
      ctx.lineTo(moonX - 110, height);
      ctx.closePath();
      ctx.fill();

      // Draw Multi-Layered Undulating Waves
      const waves = [
        {
          baseline: height * 0.62 + swell * 0.35,
          amplitude: 14,
          frequency: 0.007,
          speed: step * 0.7,
          colorA: 'rgba(56, 78, 138, 0.45)',
          colorB: 'rgba(23, 35, 68, 0.9)',
          crestColor: 'rgba(145, 185, 240, 0.4)',
        },
        {
          baseline: height * 0.69 + swell * 0.55,
          amplitude: 18,
          frequency: 0.009,
          speed: -step * 0.85,
          colorA: 'rgba(48, 86, 145, 0.55)',
          colorB: 'rgba(18, 30, 58, 0.95)',
          crestColor: 'rgba(130, 210, 235, 0.45)',
        },
        {
          baseline: height * 0.77 + swell * 0.75,
          amplitude: 22,
          frequency: 0.006,
          speed: step * 1.1,
          colorA: 'rgba(38, 70, 128, 0.7)',
          colorB: 'rgba(14, 24, 48, 0.98)',
          crestColor: 'rgba(165, 215, 255, 0.55)',
        },
        {
          baseline: height * 0.86 + swell * 1.0,
          amplitude: 26,
          frequency: 0.008,
          speed: -step * 1.3,
          colorA: 'rgba(28, 56, 108, 0.85)',
          colorB: 'rgba(10, 18, 36, 1.0)',
          crestColor: 'rgba(190, 230, 255, 0.65)',
        },
      ];

      waves.forEach((w) => {
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 8) {
          const y =
            w.baseline +
            Math.sin(x * w.frequency + w.speed) * w.amplitude +
            Math.cos(x * w.frequency * 0.5 + w.speed * 0.4) * (w.amplitude * 0.4);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, w.baseline - w.amplitude, 0, height);
        waveGrad.addColorStop(0, w.colorA);
        waveGrad.addColorStop(1, w.colorB);
        ctx.fillStyle = waveGrad;
        ctx.fill();

        // Crest line
        ctx.strokeStyle = w.crestColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Ambient Shimmer Particles
      particles.forEach((p) => {
        p.opacity += p.fadeSpeed;
        if (p.opacity > 0.8 || p.opacity < 0.15) {
          p.fadeSpeed = -p.fadeSpeed;
        }
        p.y -= p.speedY;
        if (p.y < height * 0.55) {
          p.y = height * 0.95;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = `rgba(180, 220, 255, ${Math.max(0, p.opacity)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive, isPaused, cycleDurationSec]);

  return (
    <div className="ocean-stage">
      <canvas ref={canvasRef} className="ocean-canvas" />

      {/* Floating Dynamic Caption */}
      <div className="ocean-guidance">
        <span className="guidance-icon">
          <Waves size={15} />
        </span>
        <span className="guidance-text">
          {!isActive
            ? 'Ocean Waters At Rest'
            : isPaused
            ? 'Breathing Waves Paused'
            : 'Waves Rise & Recede With Your Breath'}
        </span>
        {isActive && !isPaused && (
          <span className="guidance-rate">
            {breathingRate !== null
              ? `${breathingRate.toFixed(1)} br/min · ${isSimulated ? 'Simulated' : 'Sensing Rhythm'}`
              : `Guided Rhythm · ${currentBpm.toFixed(0)} br/min`}
          </span>
        )}
      </div>
    </div>
  );
};

