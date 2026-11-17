// src/components/AuraOrb.tsx
// AuraFlow AI - Cinematic Ambient Luminous Energy Sphere
// Faithfully and accurately matching the uploaded reference artwork:
// - Deep electric-blue volumetric inner sphere
// - Luminous cyan/turquoise arc along the upper rim
// - Flowing magenta/rose/amber flame-like aurora ribbon in lower-left
// - Ethereal wispy violet filament trailing down from upper-center
// - Glowing equatorial caustic spindle floating in the center
// - Warm violet/magenta/peach volumetric refraction plume on the right
// - Intensely bright white-cyan crescent flare along the bottom rim
// - Delicate horizontal optical interference threads across the body
// - Smooth 60fps breathing animation paced by validated SmartSpectra biometrics

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Wind } from 'lucide-react';

interface AuraOrbProps {
  breathingRate: number | null;
  isActive: boolean;
  isPaused: boolean;
  isAcquiring?: boolean;
  isSimulated?: boolean;
}

export const AuraOrb: React.FC<AuraOrbProps> = ({
  breathingRate,
  isActive,
  isPaused,
  isAcquiring = false,
  isSimulated = false,
}) => {
  // Use actual measured breathing rate when valid (4-35 br/min), or default to 10 br/min (6s cycle)
  const currentBr = breathingRate && breathingRate >= 4 && breathingRate <= 35 ? breathingRate : 10;
  const cycleDurationSec = 60 / currentBr;

  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const startTime = performance.now();
    let lastPhase: 'inhale' | 'hold' | 'exhale' | 'rest' = 'inhale';

    const targetCycle = isActive ? cycleDurationSec : 6.0;
    const minScale = isActive ? 0.94 : 0.975;
    const maxScale = isActive ? 1.12 : 1.025;

    const render = (now: number) => {
      // Handle high-DPI retina canvas scaling
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = canvas.clientWidth || 360;
      const displayHeight = canvas.clientHeight || 360;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      const elapsed = isPaused ? 0 : (now - startTime) / 1000;
      const progress = (elapsed % targetCycle) / targetCycle;

      let currentScale = minScale;
      let glowFactor = 1.0;
      let currentPhase: 'inhale' | 'hold' | 'exhale' | 'rest' = 'inhale';

      // 4-Phase Breathing Cadence:
      // 0.00 - 0.40 : Inhale (smooth expansion, rim glow intensifies)
      // 0.40 - 0.50 : Hold (plateau with gentle shimmer)
      // 0.50 - 0.90 : Exhale (smooth contraction, glow softens)
      // 0.90 - 1.00 : Rest (settled resting state)
      if (progress < 0.4) {
        currentPhase = 'inhale';
        const p = progress / 0.4;
        const ease = Math.sin((p * Math.PI) / 2);
        currentScale = minScale + ease * (maxScale - minScale);
        glowFactor = 0.9 + ease * 0.45;
      } else if (progress < 0.5) {
        currentPhase = 'hold';
        const p = (progress - 0.4) / 0.1;
        const pulse = Math.sin(p * Math.PI) * 0.01;
        currentScale = maxScale + pulse;
        glowFactor = 1.35 + Math.sin(p * Math.PI) * 0.08;
      } else if (progress < 0.9) {
        currentPhase = 'exhale';
        const p = (progress - 0.5) / 0.4;
        const ease = Math.sin((p * Math.PI) / 2);
        currentScale = maxScale - ease * (maxScale - minScale);
        glowFactor = 1.35 - ease * 0.45;
      } else {
        currentPhase = 'rest';
        currentScale = minScale;
        glowFactor = 0.9;
      }

      if (currentPhase !== lastPhase) {
        lastPhase = currentPhase;
        setPhase(currentPhase);
      }

      // Render the photorealistic volumetric energy sphere
      drawReferenceOrb(
        ctx,
        displayWidth,
        displayHeight,
        currentScale,
        glowFactor,
        elapsed,
        isAcquiring
      );

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive, isPaused, cycleDurationSec, isAcquiring]);

  // Master rendering pipeline matching the reference image precisely
  const drawReferenceOrb = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    scale: number,
    glow: number,
    time: number,
    acquiring: boolean
  ) => {
    const cx = w / 2;
    const cy = h / 2 - 8;
    const baseRadius = (Math.min(w, h) / 2) * 0.8;
    const r = baseRadius * scale;

    // 1. Gentle Deep-Blue Ambient Space Nebula Behind the Sphere
    ctx.save();
    const bgGlow = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.55);
    bgGlow.addColorStop(0, `rgba(18, 65, 215, ${0.45 * glow})`);
    bgGlow.addColorStop(0.42, `rgba(80, 30, 190, ${0.22 * glow})`);
    bgGlow.addColorStop(0.75, `rgba(8, 20, 80, ${0.08 * glow})`);
    bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Acquisition Scanning Waves (When calibrating sensors)
    if (acquiring) {
      ctx.save();
      for (let i = 0; i < 2; i++) {
        const scanPhase = ((time * 0.6 + i * 0.5) % 1);
        const scanR = r * (0.95 + scanPhase * 0.45);
        const scanAlpha = (1 - scanPhase) * 0.65;
        ctx.strokeStyle = `rgba(0, 240, 255, ${scanAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, scanR, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Clipped Spherical Volume
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // 3A. Deep Cobalt/Sapphire Blue Volumetric Sphere Body
    const sphereGrad = ctx.createRadialGradient(
      cx - r * 0.1,
      cy - r * 0.1,
      r * 0.05,
      cx,
      cy,
      r
    );
    sphereGrad.addColorStop(0, '#1548be');
    sphereGrad.addColorStop(0.28, '#0c2e88');
    sphereGrad.addColorStop(0.58, '#071c5c');
    sphereGrad.addColorStop(0.84, '#030c34');
    sphereGrad.addColorStop(1, '#010416');
    ctx.fillStyle = sphereGrad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    // 3B. Right Hemisphere Volumetric Refraction Plume (Warm internal reflection)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const plumeGrad = ctx.createRadialGradient(
      cx + r * 0.42,
      cy + r * 0.06,
      0,
      cx + r * 0.42,
      cy + r * 0.06,
      r * 0.64
    );
    plumeGrad.addColorStop(0, `rgba(168, 85, 247, ${0.52 * glow})`);
    plumeGrad.addColorStop(0.36, `rgba(225, 29, 72, ${0.35 * glow})`);
    plumeGrad.addColorStop(0.72, `rgba(249, 115, 22, ${0.16 * glow})`);
    plumeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = plumeGrad;
    ctx.beginPath();
    ctx.arc(cx + r * 0.42, cy + r * 0.06, r * 0.64, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3C. Delicate Optical Interference Filaments (Fine horizontal caustics threads)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 18; i++) {
      const lineProgress = i / 17;
      const yOffset = (lineProgress - 0.48) * r * 0.76;
      const waveAlpha = (0.1 + Math.sin(lineProgress * Math.PI) * 0.16) * glow;

      const waveGrad = ctx.createLinearGradient(cx - r * 0.65, 0, cx + r * 0.65, 0);
      waveGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      waveGrad.addColorStop(0.25, `rgba(56, 189, 248, ${waveAlpha * 0.85})`);
      waveGrad.addColorStop(0.55, `rgba(168, 85, 247, ${waveAlpha})`);
      waveGrad.addColorStop(0.82, `rgba(236, 72, 153, ${waveAlpha * 0.9})`);
      waveGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.strokeStyle = waveGrad;
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      const startX = cx - r * 0.62;
      const endX = cx + r * 0.62;
      const py = cy + yOffset;
      const waveDrift = Math.sin(time * 0.8 + i * 0.3) * 3.5;

      ctx.moveTo(startX, py);
      ctx.bezierCurveTo(
        cx - r * 0.28,
        py - 14 + waveDrift,
        cx + r * 0.22,
        py + 12 - waveDrift,
        endX,
        py - 4
      );
      ctx.stroke();
    }
    ctx.restore();

    // 3D. The Distinct Internal Light Caustic Formations
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Formation 1: Left Aurora Ribbon (Warm Amber, Rose, Magenta Flame)
    // Starts lower-left, curves gently upward hugging the left contour, tapers out in upper volume
    const p1_start = { x: cx - r * 0.54, y: cy + r * 0.62 };
    const p1_c1 = { x: cx - r * 0.72, y: cy + r * 0.2 };
    const p1_c2 = { x: cx - r * 0.58, y: cy - r * 0.16 };
    const p1_end = { x: cx - r * 0.3, y: cy - r * 0.44 };

    const ribbon1Grad = ctx.createLinearGradient(
      p1_start.x,
      p1_start.y,
      p1_end.x,
      p1_end.y
    );
    ribbon1Grad.addColorStop(0, '#f97316');
    ribbon1Grad.addColorStop(0.25, '#f43f5e');
    ribbon1Grad.addColorStop(0.65, '#e879f9');
    ribbon1Grad.addColorStop(1, '#a855f7');

    // Pass 1: Broad diffuse glow
    ctx.strokeStyle = ribbon1Grad;
    ctx.lineWidth = 26 * scale;
    ctx.globalAlpha = 0.28 * glow;
    ctx.beginPath();
    ctx.moveTo(p1_start.x, p1_start.y);
    ctx.bezierCurveTo(p1_c1.x, p1_c1.y, p1_c2.x, p1_c2.y, p1_end.x, p1_end.y);
    ctx.stroke();

    // Pass 2: Soft volumetric body
    ctx.lineWidth = 12 * scale;
    ctx.globalAlpha = 0.62 * glow;
    ctx.stroke();

    // Pass 3: Luminous core
    ctx.lineWidth = 3.6 * scale;
    ctx.globalAlpha = 0.92 * glow;
    ctx.stroke();

    // Pass 4: Specular highlight spine
    ctx.strokeStyle = '#fff1f2';
    ctx.lineWidth = 1.3;
    ctx.globalAlpha = 0.98 * glow;
    ctx.stroke();

    // Formation 2: Top Luminous Cyan/Turquoise Arc
    // Hugs the top curve of the sphere inside the rim
    const topArcStartAngle = Math.PI * 1.08;
    const topArcEndAngle = Math.PI * 1.84;
    const topArcRadius = r * 0.935;

    const topArcGrad = ctx.createLinearGradient(
      cx - r * 0.6,
      cy - r * 0.8,
      cx + r * 0.6,
      cy - r * 0.5
    );
    topArcGrad.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
    topArcGrad.addColorStop(0.2, '#00f5ff');
    topArcGrad.addColorStop(0.65, '#38bdf8');
    topArcGrad.addColorStop(0.9, '#6366f1');
    topArcGrad.addColorStop(1, 'rgba(168, 85, 247, 0.2)');

    // Wide diffuse arc
    ctx.strokeStyle = topArcGrad;
    ctx.lineWidth = 18 * scale;
    ctx.globalAlpha = 0.3 * glow;
    ctx.beginPath();
    ctx.arc(cx, cy, topArcRadius, topArcStartAngle, topArcEndAngle);
    ctx.stroke();

    // Sharp bright arc
    ctx.lineWidth = 3.6 * scale;
    ctx.globalAlpha = 0.95 * glow;
    ctx.stroke();

    // White-hot highlight on top arc
    ctx.strokeStyle = '#e0fcff';
    ctx.lineWidth = 1.3;
    ctx.globalAlpha = 0.98 * glow;
    ctx.beginPath();
    ctx.arc(cx, cy, topArcRadius, Math.PI * 1.25, Math.PI * 1.65);
    ctx.stroke();

    // Formation 3: Top-Center Ethereal Wispy Filament (Trailing down)
    const p3_start = { x: cx - r * 0.16, y: cy - r * 0.72 };
    const p3_c1 = { x: cx - r * 0.12, y: cy - r * 0.54 };
    const p3_c2 = { x: cx - r * 0.04, y: cy - r * 0.38 };
    const p3_end = { x: cx + r * 0.05, y: cy - r * 0.24 };

    const wispyGrad = ctx.createLinearGradient(
      p3_start.x,
      p3_start.y,
      p3_end.x,
      p3_end.y
    );
    wispyGrad.addColorStop(0, '#e879f9');
    wispyGrad.addColorStop(0.5, '#a855f7');
    wispyGrad.addColorStop(1, 'rgba(99, 102, 241, 0.1)');

    ctx.strokeStyle = wispyGrad;
    ctx.lineWidth = 8 * scale;
    ctx.globalAlpha = 0.4 * glow;
    ctx.beginPath();
    ctx.moveTo(p3_start.x, p3_start.y);
    ctx.bezierCurveTo(p3_c1.x, p3_c1.y, p3_c2.x, p3_c2.y, p3_end.x, p3_end.y);
    ctx.stroke();

    ctx.lineWidth = 2.2 * scale;
    ctx.globalAlpha = 0.85 * glow;
    ctx.stroke();

    // Formation 4: Center-Right Equatorial Caustic Spindle (Galaxy/silk wave)
    const p4_start = { x: cx - r * 0.2, y: cy + r * 0.15 };
    const p4_c1 = { x: cx + r * 0.14, y: cy - r * 0.02 };
    const p4_end = { x: cx + r * 0.44, y: cy + r * 0.04 };
    const p4_c2 = { x: cx + r * 0.12, y: cy + r * 0.08 };

    const spindleGrad = ctx.createLinearGradient(p4_start.x, 0, p4_end.x, 0);
    spindleGrad.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
    spindleGrad.addColorStop(0.35, 'rgba(139, 92, 246, 0.85)');
    spindleGrad.addColorStop(0.7, 'rgba(0, 212, 255, 0.75)');
    spindleGrad.addColorStop(1, 'rgba(56, 189, 248, 0.15)');

    ctx.fillStyle = spindleGrad;
    ctx.globalAlpha = 0.65 * glow;
    ctx.beginPath();
    ctx.moveTo(p4_start.x, p4_start.y);
    ctx.quadraticCurveTo(p4_c1.x, p4_c1.y, p4_end.x, p4_end.y);
    ctx.quadraticCurveTo(p4_c2.x, p4_c2.y, p4_start.x, p4_start.y);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // 3E. Bottom-Right Blazing White-Cyan Crescent Flare (Matching target artwork)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const flareGrad = ctx.createRadialGradient(
      cx + r * 0.08,
      cy + r * 0.88,
      0,
      cx + r * 0.08,
      cy + r * 0.88,
      r * 0.52
    );
    flareGrad.addColorStop(0, `rgba(255, 255, 255, ${0.98 * glow})`);
    flareGrad.addColorStop(0.25, `rgba(56, 189, 248, ${0.88 * glow})`);
    flareGrad.addColorStop(0.58, `rgba(14, 165, 233, ${0.4 * glow})`);
    flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = flareGrad;
    ctx.beginPath();
    ctx.arc(cx + r * 0.08, cy + r * 0.88, r * 0.52, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3F. Inner Perimeter Inset Optical Rim
    ctx.save();
    const innerRimGrad = ctx.createRadialGradient(cx, cy, r * 0.82, cx, cy, r);
    innerRimGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
    innerRimGrad.addColorStop(0.8, `rgba(0, 240, 255, ${0.28 * glow})`);
    innerRimGrad.addColorStop(1, `rgba(0, 240, 255, ${0.72 * glow})`);
    ctx.fillStyle = innerRimGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore(); // Exit clipped sphere

    // 4. Luminous Outer Rim (Crisp, brilliant perimeter stroke + corona bloom)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // 4A. Outer Corona Bloom
    ctx.strokeStyle = `rgba(0, 240, 255, ${0.35 * glow})`;
    ctx.lineWidth = 6 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // 4B. Razor-Sharp Brilliant Luminous Rim Stroke
    const rimGrad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    rimGrad.addColorStop(0, `rgba(244, 63, 94, ${0.55 * glow})`);
    rimGrad.addColorStop(0.2, `rgba(192, 132, 252, ${0.75 * glow})`);
    rimGrad.addColorStop(0.5, `rgba(0, 245, 255, ${0.98 * glow})`);
    rimGrad.addColorStop(0.85, `rgba(56, 189, 248, ${0.95 * glow})`);
    rimGrad.addColorStop(1, `rgba(0, 245, 255, ${0.95 * glow})`);

    ctx.strokeStyle = rimGrad;
    ctx.lineWidth = 2.4 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // 4C. White Hot Flare on Bottom Perimeter
    const flareAngleStart = Math.PI * 0.32;
    const flareAngleEnd = Math.PI * 0.68;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.98 * glow})`;
    ctx.lineWidth = 3.2 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, r, flareAngleStart, flareAngleEnd);
    ctx.stroke();

    ctx.restore();
  };

  // Phase-specific guided meditation copy
  const getInstruction = () => {
    if (!isActive) {
      return 'Breathe naturally. Let your rhythm guide you.';
    }
    if (isPaused) {
      return 'Session paused. Rest in calm stillness.';
    }
    if (isAcquiring) {
      return 'Align your face in frame. Calibrating optical biometrics…';
    }
    switch (phase) {
      case 'inhale':
        return 'Inhale slowly and deeply, letting your chest expand…';
      case 'hold':
        return 'Hold gently at the peak, resting in quiet ease…';
      case 'exhale':
        return 'Release and exhale smoothly, softening all tension…';
      case 'rest':
      default:
        return 'Pause and rest before your next natural breath…';
    }
  };

  return (
    <div className={`cinematic-orb-stage ${isPaused ? 'is-paused' : ''} ${isAcquiring ? 'is-acquiring' : ''}`}>
      {/* High-Resolution 60fps Energy Sphere Canvas */}
      <canvas ref={canvasRef} className="cinematic-orb-canvas" />

      {/* Small & Elegant Breathing Phase Text Directly Below the Orb */}
      <div className="cinematic-guidance-cluster">
        <div className="cinematic-phase-badge">
          <Wind size={12} className="cinematic-phase-icon" />
          <span className="cinematic-phase-label">
            {!isActive
              ? 'AURA RESTING'
              : isPaused
              ? 'PAUSED'
              : isAcquiring
              ? 'CALIBRATING'
              : phase.toUpperCase()}
          </span>

          {isActive && !isPaused && !isAcquiring && (
            <span className="cinematic-rate-pill">
              {breathingRate !== null
                ? `${breathingRate.toFixed(1)} br/min${isSimulated ? ' (Sim)' : ''}`
                : `Pacing ${currentBr.toFixed(0)} br/min`}
            </span>
          )}

          {isSimulated && (
            <span className="cinematic-sim-pill" title="Simulated demo data">
              <Sparkles size={9} /> Sim
            </span>
          )}
        </div>

        <p className="cinematic-instruction-text">{getInstruction()}</p>
      </div>
    </div>
  );
};
