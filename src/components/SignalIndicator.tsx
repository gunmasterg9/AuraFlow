// src/components/SignalIndicator.tsx
// Real-time signal quality, positioning validation, and status banner

import React from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, Radio, Sparkles } from 'lucide-react';

interface SignalIndicatorProps {
  quality: 'optimal' | 'good' | 'fair' | 'poor' | 'searching' | 'standby';
  validationHint: string;
  isSimulated: boolean;
  isPaused: boolean;
}

export const SignalIndicator: React.FC<SignalIndicatorProps> = ({
  quality,
  validationHint,
  isSimulated,
  isPaused,
}) => {
  const getQualityDetails = () => {
    if (isSimulated) {
      return {
        label: 'SIMULATED DEMO',
        colorClass: 'simulated',
        bars: 4,
        icon: <Sparkles size={14} />,
      };
    }

    if (isPaused) {
      return {
        label: 'PAUSED',
        colorClass: 'paused',
        bars: 0,
        icon: <Radio size={14} />,
      };
    }

    switch (quality) {
      case 'optimal':
        return {
          label: 'OPTIMAL SIGNAL',
          colorClass: 'optimal',
          bars: 4,
          icon: <CheckCircle2 size={14} />,
        };
      case 'good':
        return {
          label: 'GOOD SIGNAL',
          colorClass: 'good',
          bars: 3,
          icon: <CheckCircle2 size={14} />,
        };
      case 'fair':
        return {
          label: 'ADJUSTING POSITION',
          colorClass: 'fair',
          bars: 2,
          icon: <AlertCircle size={14} />,
        };
      case 'poor':
        return {
          label: 'POOR SIGNAL',
          colorClass: 'poor',
          bars: 1,
          icon: <AlertCircle size={14} />,
        };
      case 'searching':
        return {
          label: 'SEARCHING FOR FACE',
          colorClass: 'searching',
          bars: 1,
          icon: <Radio size={14} className="spin-slow" />,
        };
      case 'standby':
      default:
        return {
          label: 'STANDBY',
          colorClass: 'standby',
          bars: 0,
          icon: <HelpCircle size={14} />,
        };
    }
  };

  const details = getQualityDetails();

  return (
    <div className={`signal-indicator-bar ${details.colorClass}`}>
      <div className="signal-badge-wrap">
        <span className="signal-icon">{details.icon}</span>
        <span className="signal-label">{details.label}</span>

        {/* 4-bar Signal Strength Meter */}
        <div className="signal-bars" title={`Signal quality: ${details.label}`}>
          {[1, 2, 3, 4].map((barIndex) => (
            <span
              key={barIndex}
              className={`signal-bar ${barIndex <= details.bars ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="signal-hint">
        <span className="hint-bullet" />
        <span className="hint-text">{validationHint}</span>
      </div>
    </div>
  );
};

