// src/components/CameraView.tsx
// Camera preview with positioning overlay, privacy shield, and stream management

import React, { RefObject } from 'react';
import { CameraOff, EyeOff, ShieldCheck, Video } from 'lucide-react';

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  isPaused: boolean;
  isSimulated: boolean;
  statusText: string;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  isStreaming,
  isPaused,
  isSimulated,
  statusText,
}) => {
  return (
    <div className="camera-framing-panel">
      <div className="camera-panel-header">
        <div className="camera-title-wrap">
          <span className="eyebrow">OPTICAL FRAMING</span>
          <h3 className="camera-panel-title">Camera Guidance</h3>
        </div>
        <div className="camera-header-status">
          {isSimulated ? (
            <span className="camera-status-pill simulated">
              <EyeOff size={11} /> Simulation
            </span>
          ) : isStreaming && !isPaused ? (
            <span className="camera-status-pill live">
              <span className="status-dot live" /> Active Stream
            </span>
          ) : isPaused ? (
            <span className="camera-status-pill paused">
              <span className="status-dot paused" /> Paused
            </span>
          ) : (
            <span className="camera-status-pill standby">
              <CameraOff size={11} /> Camera Off
            </span>
          )}
        </div>
      </div>

      <div className="camera-viewport">
        {/* Real-time Video Stream */}
        <video
          ref={videoRef}
          className={`camera-video ${isStreaming && !isPaused ? 'visible' : 'hidden'}`}
          muted
          playsInline
          autoPlay
        />

        {/* Framing Alignment Reticle */}
        {isStreaming && !isPaused && (
          <div className="reticle-overlay" aria-hidden="true">
            <div className="reticle-oval">
              <span className="reticle-corner top-left" />
              <span className="reticle-corner top-right" />
              <span className="reticle-corner bottom-left" />
              <span className="reticle-corner bottom-right" />
              <span className="reticle-tag">Face Area</span>
            </div>
            <div className="reticle-chest-line">
              <span>Upper Chest Area</span>
            </div>
          </div>
        )}

        {/* Empty / Inactive Placeholder State */}
        {(!isStreaming || isPaused) && (
          <div className="camera-empty-state">
            <div className="empty-icon-wrap">
              {isPaused ? <Video size={24} /> : <CameraOff size={24} />}
            </div>
            <p className="empty-headline">
              {isPaused
                ? 'Camera stream paused'
                : isSimulated
                ? 'Simulated mode running'
                : 'Camera is off'}
            </p>
            <p className="empty-guidance">
              {isPaused
                ? 'Press "Resume" to re-engage optical feed.'
                : isSimulated
                ? 'Simulated signals are running. No camera accessed.'
                : 'Sensing has not started. Press "Begin sensing" to align your face.'}
            </p>
          </div>
        )}

        {/* Privacy Watermark */}
        <div className="camera-privacy-badge" title="Local optical privacy">
          <ShieldCheck size={11} />
          <span>Local Memory Only</span>
        </div>
      </div>
    </div>
  );
};
