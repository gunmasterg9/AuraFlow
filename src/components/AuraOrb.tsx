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
    const baseRadius = (Math.min(w, h) / 2) * 0.76;
    const r = baseRadius * scale;

    // 1. Gentle Deep-Blue Ambient Space Nebula Behind the Sphere
    // Smoothly fades to 0 before canvas boundaries to eliminate any box seams
    ctx.save();
    const bgGlow = ctx.createRadialGradient(
      cx + r * 0.25,
      cy - r * 0.3,
      r * 0.2,
      cx,
      cy,
      r * 1.22
    );
    bgGlow.addColorStop(0, `rgba(28, 85, 245, ${0.44 * glow})`);
    bgGlow.addColorStop(0.45, `rgba(18, 55, 185, ${0.22 * glow})`);
    bgGlow.addColorStop(0.85, `rgba(8, 24, 90, ${0.05 * glow})`);
    bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.22, 0, Math.PI * 2);
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
      cx + r * 0.56,
      cy + r * 0.04,
      0,
      cx + r * 0.56,
      cy + r * 0.04,
      r * 0.58
    );
    plumeGrad.addColorStop(0, `rgba(236, 72, 153, ${0.48 * glow})`);
    plumeGrad.addColorStop(0.32, `rgba(244, 63, 94, ${0.42 * glow})`);
    plumeGrad.addColorStop(0.68, `rgba(249, 115, 22, ${0.28 * glow})`);
    plumeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = plumeGrad;
    ctx.beginPath();
    ctx.arc(cx + r * 0.56, cy + r * 0.04, r * 0.58, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3C. 3D Holographic Longitudinal Meridians & Micro-Caustic Filaments
    // Renders the dense curved spherical meridian threads visible across the reference artwork
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const numMeridians = 44;
    for (let i = 0; i <= numMeridians; i++) {
      const u = (i / numMeridians) * 2 - 1; // -1.0 (left rim) to +1.0 (right rim)
      const absU = Math.abs(u);
      if (absU < 0.02) continue;

      const curveX = cx + u * r * 0.93;
      const alpha = (0.035 + Math.pow(absU, 1.4) * 0.14) * glow;
      const strokeCol =
        u < -0.15
          ? `rgba(220, 130, 245, ${alpha * 0.85})`
          : u > 0.22
          ? `rgba(251, 146, 60, ${alpha * 0.75})`
          : `rgba(56, 189, 248, ${alpha})`;

      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 0.65;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 0.96);
      ctx.bezierCurveTo(
        curveX,
        cy - r * 0.52,
        curveX,
        cy + r * 0.52,
        cx,
        cy + r * 0.96
      );
      ctx.stroke();
    }

    // Secondary subtle horizontal caustic wave threads
    for (let i = 0; i < 10; i++) {
      const lineProgress = i / 9;
      const yOffset = (lineProgress - 0.48) * r * 0.65;
      const waveAlpha = (0.08 + Math.sin(lineProgress * Math.PI) * 0.12) * glow;

      const waveGrad = ctx.createLinearGradient(cx - r * 0.55, 0, cx + r * 0.55, 0);
      waveGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      waveGrad.addColorStop(0.3, `rgba(56, 189, 248, ${waveAlpha * 0.85})`);
      waveGrad.addColorStop(0.6, `rgba(168, 85, 247, ${waveAlpha})`);
      waveGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.strokeStyle = waveGrad;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      const startX = cx - r * 0.52;
      const endX = cx + r * 0.52;
      const py = cy + yOffset;
      const waveDrift = Math.sin(time * 0.8 + i * 0.3) * 2.5;

      ctx.moveTo(startX, py);
      ctx.bezierCurveTo(
        cx - r * 0.22,
        py - 8 + waveDrift,
        cx + r * 0.18,
        py + 8 - waveDrift,
        endX,
        py - 2
      );
      ctx.stroke();
    }
    ctx.restore();

    // 3D. The Distinct Internal Light Caustic Formations
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Formation 1: Left Aurora Ribbon (Warm Amber, Rose, Magenta Flame)
    // Starts lower-left, hugs the left contour upward, curls inward at the top-left crest
    const p1_start = { x: cx - r * 0.44, y: cy + r * 0.72 };
    const p1_c1 = { x: cx - r * 0.68, y: cy + r * 0.24 };
    const p1_c2 = { x: cx - r * 0.64, y: cy - r * 0.22 };
    const p1_end = { x: cx - r * 0.45, y: cy - r * 0.16 };

    const ribbon1Grad = ctx.createLinearGradient(
      p1_start.x,
      p1_start.y,
      p1_end.x,
      p1_end.y
    );
    ribbon1Grad.addColorStop(0, '#f97316');
    ribbon1Grad.addColorStop(0.28, '#f43f5e');
    ribbon1Grad.addColorStop(0.68, '#e879f9');
    ribbon1Grad.addColorStop(1, '#a855f7');

    // Pass 1: Broad diffuse glow
    ctx.strokeStyle = ribbon1Grad;
    ctx.lineWidth = 28 * scale;
    ctx.globalAlpha = 0.32 * glow;
    ctx.beginPath();
    ctx.moveTo(p1_start.x, p1_start.y);
    ctx.bezierCurveTo(p1_c1.x, p1_c1.y, p1_c2.x, p1_c2.y, p1_end.x, p1_end.y);
    ctx.stroke();

    // Pass 2: Soft volumetric body
    ctx.lineWidth = 14 * scale;
    ctx.globalAlpha = 0.68 * glow;
    ctx.stroke();

    // Pass 3: Luminous core
    ctx.lineWidth = 4.2 * scale;
    ctx.globalAlpha = 0.94 * glow;
    ctx.stroke();

    // Pass 4: Specular highlight spine
    ctx.strokeStyle = '#fff1f2';
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.96 * glow;
    ctx.stroke();

    // Formation 2: Top Swooping Cyan/Turquoise Light Crest
    // Traverses dynamically across the upper-right hemisphere matching target artwork
    const p2_start = { x: cx - r * 0.12, y: cy - r * 0.93 };
    const p2_c1 = { x: cx + r * 0.32, y: cy - r * 0.82 };
    const p2_c2 = { x: cx + r * 0.66, y: cy - r * 0.5 };
    const p2_end = { x: cx + r * 0.76, y: cy - r * 0.02 };

    const topArcGrad = ctx.createLinearGradient(
      p2_start.x,
      p2_start.y,
      p2_end.x,
      p2_end.y
    );
    topArcGrad.addColorStop(0, 'rgba(192, 132, 252, 0.35)');
    topArcGrad.addColorStop(0.2, '#00f5ff');
    topArcGrad.addColorStop(0.65, '#38bdf8');
    topArcGrad.addColorStop(0.88, '#6366f1');
    topArcGrad.addColorStop(1, 'rgba(168, 85, 247, 0.15)');

    // Wide diffuse crest
    ctx.strokeStyle = topArcGrad;
    ctx.lineWidth = 26 * scale;
    ctx.globalAlpha = 0.42 * glow;
    ctx.beginPath();
    ctx.moveTo(p2_start.x, p2_start.y);
    ctx.bezierCurveTo(p2_c1.x, p2_c1.y, p2_c2.x, p2_c2.y, p2_end.x, p2_end.y);
    ctx.stroke();

    // Volumetric body
    ctx.lineWidth = 11 * scale;
    ctx.globalAlpha = 0.78 * glow;
    ctx.stroke();

    // Sharp bright core
    ctx.lineWidth = 3.6 * scale;
    ctx.globalAlpha = 0.96 * glow;
    ctx.stroke();

    // Specular highlight line
    ctx.strokeStyle = '#f0fdff';
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.85 * glow;
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
    const p4_start = { x: cx - r * 0.24, y: cy + r * 0.16 };
    const p4_c1 = { x: cx + r * 0.1, y: cy - r * 0.02 };
    const p4_end = { x: cx + r * 0.44, y: cy + r * 0.02 };
    const p4_c2 = { x: cx + r * 0.08, y: cy + r * 0.1 };

    const spindleGrad = ctx.createLinearGradient(p4_start.x, 0, p4_end.x, 0);
    spindleGrad.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
    spindleGrad.addColorStop(0.35, 'rgba(147, 51, 234, 0.95)');
    spindleGrad.addColorStop(0.72, 'rgba(59, 130, 246, 0.85)');
    spindleGrad.addColorStop(1, 'rgba(56, 189, 248, 0.2)');

    ctx.fillStyle = spindleGrad;
    ctx.globalAlpha = 0.78 * glow;
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

    // 4D. Specular Horizon Bloom at Bottom Pole
    const flareBloom = ctx.createRadialGradient(
      cx,
      cy + r * 0.97,
      0,
      cx,
      cy + r * 0.97,
      r * 0.38
    );
    flareBloom.addColorStop(0, `rgba(255, 255, 255, ${0.98 * glow})`);
    flareBloom.addColorStop(0.22, `rgba(180, 245, 255, ${0.82 * glow})`);
    flareBloom.addColorStop(0.52, `rgba(0, 212, 255, ${0.32 * glow})`);
    flareBloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = flareBloom;
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.97, r * 0.38, 0, Math.PI * 2);
    ctx.fill();

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
