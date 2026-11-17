// src/components/MetricCard.tsx
// Biometric feedback card with stability, confidence, and physiological indicators

import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | null;
  unit: string;
  desc: string;
  confidence: number | null;
  isStable: boolean;
  minMax?: { min: number; max: number };
  isSimulated?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  value,
  unit,
  desc,
  confidence,
  isStable,
  minMax = { min: 40, max: 140 },
  isSimulated = false,
}) => {
  const hasValue = value !== null && Number.isFinite(value);
  const formattedValue = hasValue
    ? Number(value).toFixed(value < 10 ? 1 : 0)
    : '—';

  // Normalize progress meter based on expected range
  const normalizedPercentage = hasValue
    ? Math.min(100, Math.max(8, ((value - minMax.min) / (minMax.max - minMax.min)) * 100))
    : 0;

  // Pulse animation duration if this is heart rate
  const beatDurationSec = title === 'Pulse' && hasValue && value > 30 ? (60 / value).toFixed(2) : null;

  return (
    <article className={`metric-card ${hasValue ? 'has-data' : 'waiting'} ${isSimulated ? 'simulated' : ''}`}>
      <div className="metric-header">
        <div
          className={`metric-icon-wrap ${title === 'Pulse' && hasValue ? 'pulsing-heart' : ''}`}
          style={beatDurationSec ? ({ '--beat-speed': `${beatDurationSec}s` } as React.CSSProperties) : undefined}
        >
          {icon}
        </div>
        <div className="metric-title-group">
          <span className="metric-title">{title}</span>
          <span className="metric-desc">{desc}</span>
        </div>

        {hasValue && (
          <div className="metric-badges">
            {isSimulated ? (
              <span className="badge simulated" title="Simulated value for preview">
                <Sparkles size={11} /> Sim
              </span>
            ) : isStable ? (
              <span className="badge stable" title="Validated above clinical accuracy threshold">
                <ShieldCheck size={11} /> Stable
              </span>
            ) : (
              <span className="badge calibrating" title="Signal settling">
                Calibrating
              </span>
            )}
          </div>
        )}
      </div>

      <div className="metric-body">
        <div className="metric-value-wrap">
          <span className="metric-primary-value">{formattedValue}</span>
          {hasValue && <span className="metric-unit">{unit}</span>}
        </div>

        {/* Confidence rating indicator */}
        <div className="metric-confidence-group">
          <div className="confidence-label">
            <span>Confidence</span>
            <span>
              {confidence !== null ? `${Math.round(confidence)}%` : hasValue ? 'Evaluating' : 'Waiting'}
            </span>
          </div>
          <div className="confidence-track">
            <div
              className={`confidence-bar ${
                confidence && confidence >= 70 ? 'high' : confidence && confidence >= 40 ? 'med' : 'low'
              }`}
              style={{ width: `${confidence !== null ? Math.max(6, Math.min(100, confidence)) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Level Track */}
      <div className="metric-level-track">
        <div className="metric-level-fill" style={{ width: `${normalizedPercentage}%` }} />
      </div>
    </article>
  );
};

