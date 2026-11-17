// src/App.tsx
// AuraFlow AI - Refined Responsive Desktop UI with Two-Column Sanctuary Grid

import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Heart,
  KeyRound,
  Moon,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  StopCircle,
  Waves,
  Wind,
} from 'lucide-react';

import {
  SmartSpectraSDK,
  breathingMetrics,
  cardioMetrics,
} from '@smartspectra/node-sdk/renderer';
import { decodeMetrics } from '@smartspectra/node-sdk/messages';

import { AuraOrb } from './components/AuraOrb';
import { BreathingOcean } from './components/BreathingOcean';
import { MetricCard } from './components/MetricCard';
import { SignalIndicator } from './components/SignalIndicator';
import { CameraView } from './components/CameraView';
import { SettingsModal } from './components/SettingsModal';
import {
  BiometricVitals,
  INITIAL_VITALS,
  SensingStatus,
  VALIDATION_HINTS,
} from './types/vitals';

export default function App() {
  // Credentials & Configuration
  const [apiKey, setApiKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);

  // Sensing Lifecycle
  const [status, setStatus] = useState<SensingStatus>('idle');
  const [statusText, setStatusText] = useState('Camera sensing is off');
  const [vitals, setVitals] = useState<BiometricVitals>(INITIAL_VITALS);

  // Active View Tab ('orb' or 'ocean')
  const [tab, setTab] = useState<'orb' | 'ocean'>('orb');

  // Session Time
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Error notification
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // References
  const sdkRef = useRef<SmartSpectraSDK | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const simulationTimerRef = useRef<number | null>(null);

  // Load saved key from Electron secure storage on mount
  useEffect(() => {
    if (window.auraflow && typeof window.auraflow.getKey === 'function') {
      window.auraflow
        .getKey()
        .then((savedKey) => {
          if (savedKey) {
            setApiKey(savedKey);
            setKeySaved(true);
          }
        })
        .catch((err) => {
          console.warn('[AuraFlow] Could not retrieve saved key:', err);
        });
    }

    // Clean up hardware camera and SDK on unmount
    return () => {
      cleanupHardware();
    };
  }, []);

  // Session seconds counter
  useEffect(() => {
    if (status !== 'sensing') return;
    const interval = window.setInterval(() => {
      setSessionSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Clean hardware and streams safely
  const cleanupHardware = () => {
    if (simulationTimerRef.current) {
      window.clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch {
        // Ignore already closed tracks
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch {
        // Ignore
      }
    }

    if (sdkRef.current) {
      try {
        sdkRef.current.destroy();
      } catch {
        // Ignore
      }
      sdkRef.current = null;
    }
  };

  // Start Sensing (Live Hardware or Simulated)
  const handleStart = async () => {
    setErrorMessage(null);

    // If simulation mode is enabled, run realistic simulated bio-signals
    if (isSimulated) {
      startSimulation();
      return;
    }

    // Live mode requires API key
    if (!apiKey.trim()) {
      setSettingsOpen(true);
      setStatusText('Please enter your SmartSpectra API key in settings.');
      return;
    }

    setStatus('starting');
    setStatusText('Acquiring camera and preparing SmartSpectra pipeline…');
    setVitals({
      ...INITIAL_VITALS,
      signalQuality: 'searching',
      validationHint: 'Connecting to camera… Align your face inside the framing guide.',
      isSimulated: false,
    });

    try {
      cleanupHardware();

      const sdk = new SmartSpectraSDK({
        apiKey: apiKey.trim(),
        requestedMetrics: [...breathingMetrics, ...cardioMetrics],
        enableTelemetry: false,
      });
      sdkRef.current = sdk;

      // When SDK acquires camera stream, attach it to preview <video>
      sdk.on('streamAvailable', (stream: MediaStream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {});
        }
      });

      // Receive decoded real-time physiological metrics
      sdk.on('metrics', (buf: Uint8Array, _timestampUs: number) => {
        try {
          const decoded = decodeMetrics(buf) as any;
          if (!decoded) return;

          // Extract breathing rate
          const brList = decoded.breathing?.rate;
          const latestBr = Array.isArray(brList) && brList.length > 0 ? brList[brList.length - 1] : null;

          // Extract pulse rate
          const pulseList = decoded.cardio?.pulseRate;
          const latestPulse =
            Array.isArray(pulseList) && pulseList.length > 0 ? pulseList[pulseList.length - 1] : null;

          // Extract HRV
          const hrvList = decoded.cardio?.hrv;
          const latestHrv = Array.isArray(hrvList) && hrvList.length > 0 ? hrvList[hrvList.length - 1] : null;

          setVitals((prev) => ({
            ...prev,
            breathingRate:
              typeof latestBr?.value === 'number' && Number.isFinite(latestBr.value)
                ? latestBr.value
                : prev.breathingRate,
            breathingConfidence:
              typeof latestBr?.confidence === 'number' ? latestBr.confidence : prev.breathingConfidence,
            breathingStable: Boolean(latestBr?.stable),

            pulseRate:
              typeof latestPulse?.value === 'number' && Number.isFinite(latestPulse.value)
                ? latestPulse.value
                : prev.pulseRate,
            pulseConfidence:
              typeof latestPulse?.confidence === 'number' ? latestPulse.confidence : prev.pulseConfidence,
            pulseStable: Boolean(latestPulse?.stable),

            hrvRmssd:
              typeof latestHrv?.rmssd === 'number' && Number.isFinite(latestHrv.rmssd)
                ? latestHrv.rmssd
                : prev.hrvRmssd,
            hrvConfidence:
              typeof latestHrv?.confidence === 'number' ? latestHrv.confidence : prev.hrvConfidence,
            hrvStable: Boolean(latestHrv?.stable),
            hrvMeanNn: typeof latestHrv?.meanNn === 'number' ? latestHrv.meanNn : prev.hrvMeanNn,
            hrvSdnn: typeof latestHrv?.sdnn === 'number' ? latestHrv.sdnn : prev.hrvSdnn,

            isSimulated: false,
          }));
        } catch (err) {
          console.warn('[AuraFlow] Error decoding metrics:', err);
        }
      });

      // Handle measurement readiness & positioning status
      sdk.on('validationStatus', (code: number, _ts: number, hint: string) => {
        const hintInfo = VALIDATION_HINTS[code];
        const displayHint = hintInfo?.text || hint || 'Keep face and upper chest visible and steady.';
        const quality = hintInfo?.quality || (code === 0 ? 'optimal' : 'fair');

        setVitals((prev) => ({
          ...prev,
          validationCode: code,
          validationHint: displayHint,
          signalQuality: quality,
        }));
      });

      // Processing pipeline status
      sdk.on('processingStatus', (procStatus: number) => {
        if (procStatus === 3) {
          setStatusText('Biometric sensing is active');
        } else if (procStatus === 2) {
          setStatusText('Starting biometric pipeline…');
        } else if (procStatus === 4) {
          setStatusText('Stopping pipeline…');
        }
      });

      // Error event
      sdk.on('error', (code: number, message: string, retryable: boolean) => {
        console.error('[AuraFlow] SDK Error:', code, message, retryable);
        setStatusText(`SDK message: ${message}`);
      });

      await sdk.start();

      setStatus('sensing');
      setStatusText('Biometric sensing is active');
      setSessionSeconds(0);
    } catch (err: any) {
      console.error('[AuraFlow] Start failed:', err);
      cleanupHardware();
      setStatus('error');
      const errDetail = err?.message || 'Could not start SmartSpectra sensing.';
      setStatusText(errDetail);
      setErrorMessage(
        `${errDetail} Ensure camera access is allowed in Windows Settings and that another app is not holding the webcam.`
      );
    }
  };

  // Pause sensing
  const handlePause = () => {
    if (status !== 'sensing') return;
    setStatus('paused');
    setStatusText('Sensing paused');

    // Mute video track
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = false;
      });
    }

    if (simulationTimerRef.current) {
      window.clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
  };

  // Resume sensing
  const handleResume = () => {
    if (status !== 'paused') return;

    if (isSimulated) {
      setStatus('sensing');
      setStatusText('Simulated sensing resumed');
      startSimulationTimer();
      return;
    }

    // Unmute video track
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = true;
      });
    }

    setStatus('sensing');
    setStatusText('Biometric sensing is active');
  };

  // Stop sensing & release camera hardware
  const handleStop = async () => {
    setStatus('stopping');
    setStatusText('Releasing camera and stopping pipeline…');

    cleanupHardware();

    setStatus('idle');
    setStatusText('Camera sensing is off');
    setVitals(INITIAL_VITALS);
  };

  // Simulation mode loop
  const startSimulation = () => {
    cleanupHardware();
    setStatus('sensing');
    setStatusText('Simulated demo mode active');
    setSessionSeconds(0);

    setVitals({
      breathingRate: 14.2,
      breathingConfidence: 88,
      breathingStable: true,

      pulseRate: 72,
      pulseConfidence: 91,
      pulseStable: true,

      hrvRmssd: 48,
      hrvConfidence: 84,
      hrvStable: true,
      hrvMeanNn: 833,
      hrvSdnn: 52,

      signalQuality: 'optimal',
      validationCode: 0,
      validationHint: 'Simulated feedback: Optimal breathing rhythm and pulse resonance.',
      isSimulated: true,
    });

    startSimulationTimer();
  };

  const startSimulationTimer = () => {
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);

    let simTick = 0;
    simulationTimerRef.current = window.setInterval(() => {
      simTick += 1;
      const breathingWave = Math.sin(simTick * 0.15) * 1.5;
      const pulseWave = Math.sin(simTick * 0.08) * 3;

      setVitals((prev) => ({
        ...prev,
        breathingRate: Number((14.0 + breathingWave).toFixed(1)),
        pulseRate: Math.round(71 + pulseWave),
        hrvRmssd: Math.round(47 + Math.sin(simTick * 0.1) * 4),
        breathingConfidence: 88,
        pulseConfidence: 92,
        hrvConfidence: 85,
        isSimulated: true,
      }));
    }, 1000);
  };

  // Key storage helpers
  const handleSaveKey = async (newKey: string): Promise<boolean> => {
    try {
      if (window.auraflow && typeof window.auraflow.saveKey === 'function') {
        await window.auraflow.saveKey(newKey);
      }
      setApiKey(newKey);
      setKeySaved(true);
      setStatusText('API key encrypted and saved to Windows user profile.');
      return true;
    } catch (err: any) {
      console.error('[AuraFlow] Save key error:', err);
      setStatusText(err?.message || 'Could not save API key.');
      return false;
    }
  };

  const handleClearKey = async () => {
    try {
      if (window.auraflow && typeof window.auraflow.clearKey === 'function') {
        await window.auraflow.clearKey();
      }
      setApiKey('');
      setKeySaved(false);
      setStatusText('Saved API key was removed.');
    } catch (err: any) {
      console.error('[AuraFlow] Clear key error:', err);
    }
  };

  // Format session time
  const mins = String(Math.floor(sessionSeconds / 60)).padStart(2, '0');
  const secs = String(sessionSeconds % 60).padStart(2, '0');

  const isRunning = status === 'sensing';
  const isPaused = status === 'paused';
  const isStarting = status === 'starting';
  const isStopping = status === 'stopping';
  const isAcquiring = isStarting || vitals.signalQuality === 'searching';

  return (
    <div className="auraflow-shell">
      {/* Sleek Top Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">
            <Waves size={18} />
          </div>
          <span className="brand-name">AURAFLOW AI</span>
        </div>

        <div className="mode-switch-group">
          <button
            className={`mode-btn ${tab === 'orb' ? 'active' : ''}`}
            onClick={() => setTab('orb')}
          >
            <Moon size={13} /> Aura Orb
          </button>
          <button
            className={`mode-btn ${tab === 'ocean' ? 'active' : ''}`}
            onClick={() => setTab('ocean')}
          >
            <Waves size={13} /> Breathing Ocean
          </button>
        </div>

        <div className="header-actions">
          {isSimulated && (
            <div className="sim-badge" title="Simulated mode active">
              <Sparkles size={11} />
              <span>SIMULATED DEMO</span>
            </div>
          )}

          <div className="connection-state-pill">
            <span
              className={`state-dot ${isRunning ? 'active' : isPaused ? 'paused' : isStarting ? 'starting' : ''}`}
            />
            <span>
              {isRunning
                ? isSimulated
                  ? 'SIMULATING'
                  : 'SENSING'
                : isPaused
                ? 'PAUSED'
                : isStarting
                ? 'CONNECTING'
                : 'STANDBY'}
            </span>
          </div>

          <button
            className="settings-trigger-btn"
            onClick={() => setSettingsOpen(true)}
            title="Settings & API Key"
            aria-label="Settings"
          >
            <KeyRound size={15} />
          </button>
        </div>
      </header>

      {/* Main Sanctuary Two-Column Grid */}
      <main className="sanctuary-layout">
        {/* Error notification banner if needed */}
        {errorMessage && (
          <div className="notice-banner error">
            <AlertTriangle size={16} />
            <div className="notice-content">
              <strong>Measurement Notice</strong>
              <p>{errorMessage}</p>
            </div>
            <button className="notice-dismiss" onClick={() => setErrorMessage(null)}>
              Dismiss
            </button>
          </div>
        )}

        <div className="sanctuary-grid">
          {/* Left Column: Primary Breathing Experience */}
          <section className="breathing-experience-column">
            <div className="breathing-experience-card">
              {/* Card Title Bar */}
              <div className="experience-card-header">
                <div>
                  <h1 className="experience-title">Find your calm.</h1>
                  <p className="experience-subtitle">
                    {tab === 'orb'
                      ? 'Luminous respiratory synchronization'
                      : 'Generative ocean waves paced to your cadence'}
                  </p>
                </div>
                <div className="experience-live-tag">
                  <span className={`live-ring ${isRunning ? 'active' : ''}`} />
                  <span>{tab === 'orb' ? 'ORGANIC AURA' : 'OCEAN TIDE'}</span>
                </div>
              </div>

              {/* Central Visual Stage */}
              <div className="orb-visual-stage">
                {tab === 'orb' ? (
                  <AuraOrb
                    breathingRate={vitals.breathingRate}
                    isActive={isRunning}
                    isPaused={isPaused}
                    isAcquiring={isAcquiring}
                    isSimulated={vitals.isSimulated}
                  />
                ) : (
                  <BreathingOcean
                    breathingRate={vitals.breathingRate}
                    isActive={isRunning}
                    isPaused={isPaused}
                    isSimulated={vitals.isSimulated}
                  />
                )}
              </div>

              {/* Compact Bottom Controls Strip */}
              <div className="experience-controls-strip">
                <div className="session-timer-wrap">
                  <span className="timer-label">SESSION TIME</span>
                  <strong className="timer-digits">
                    {mins}:{secs}
                  </strong>
                </div>

                <div className="actions-button-group">
                  {status === 'idle' || status === 'error' ? (
                    <button
                      className="action-btn btn-primary"
                      onClick={handleStart}
                      disabled={isStarting}
                    >
                      <Play size={15} fill="currentColor" />
                      <span>{isStarting ? 'Connecting…' : isSimulated ? 'Begin Demo Sensing' : 'Begin sensing'}</span>
                    </button>
                  ) : (
                    <>
                      {isRunning ? (
                        <button
                          className="action-btn btn-secondary"
                          onClick={handlePause}
                          title="Pause session"
                        >
                          <Pause size={15} />
                          <span>Pause</span>
                        </button>
                      ) : (
                        <button
                          className="action-btn btn-secondary"
                          onClick={handleResume}
                          title="Resume session"
                        >
                          <Play size={15} fill="currentColor" />
                          <span>Resume</span>
                        </button>
                      )}

                      <button
                        className="action-btn btn-danger"
                        onClick={handleStop}
                        disabled={isStopping}
                        title="Stop sensing and release webcam"
                      >
                        <StopCircle size={15} />
                        <span>{isStopping ? 'Stopping…' : 'Stop'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Camera & Biometrics Sidebar */}
          <aside className="sidebar-metrics-column">
            {/* Camera Framing & Guidance Panel */}
            <CameraView
              videoRef={videoRef}
              isStreaming={isRunning || isPaused}
              isPaused={isPaused}
              isSimulated={vitals.isSimulated}
              statusText={statusText}
            />

            {/* Signal Quality & Face Alignment Indicator */}
            <SignalIndicator
              quality={vitals.signalQuality}
              validationHint={vitals.validationHint}
              isSimulated={vitals.isSimulated}
              isPaused={isPaused}
            />

            {/* Biometric Metric Cards (Compact Grid) */}
            <div className="sidebar-metrics-grid">
              {/* Pulse / Heart Rate */}
              <MetricCard
                icon={<Heart size={16} />}
                title="Pulse"
                value={vitals.pulseRate}
                unit="bpm"
                desc="Heart rate frequency"
                confidence={vitals.pulseConfidence}
                isStable={vitals.pulseStable}
                minMax={{ min: 45, max: 130 }}
                isSimulated={vitals.isSimulated}
              />

              {/* Breathing Rate */}
              <MetricCard
                icon={<Wind size={16} />}
                title="Breathing"
                value={vitals.breathingRate}
                unit="br/min"
                desc="Respiratory frequency"
                confidence={vitals.breathingConfidence}
                isStable={vitals.breathingStable}
                minMax={{ min: 6, max: 30 }}
                isSimulated={vitals.isSimulated}
              />

              {/* HRV */}
              <MetricCard
                icon={<Activity size={16} />}
                title="HRV"
                value={vitals.hrvRmssd}
                unit="ms"
                desc="Autonomic tone (RMSSD)"
                confidence={vitals.hrvConfidence}
                isStable={vitals.hrvStable}
                minMax={{ min: 15, max: 90 }}
                isSimulated={vitals.isSimulated}
              />
            </div>

            {/* Wellness & Privacy Guidance Snippet */}
            <div className="sidebar-wellness-guidance">
              <ShieldCheck size={14} className="guidance-shield-icon" />
              <p>
                Optical sensing runs strictly in local RAM. No video is ever stored or transmitted.
                Intended for mindfulness and general wellness.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Slim Bottom Status Bar */}
      <footer className="app-status-bar">
        <div className="status-bar-left">
          <span className={`status-pill-dot ${isRunning ? 'active' : isPaused ? 'paused' : isStarting ? 'starting' : ''}`} />
          <span className="status-bar-state">
            {isRunning
              ? isSimulated
                ? 'SIMULATED DEMO ACTIVE'
                : 'SENSING ACTIVE'
              : isPaused
              ? 'SENSING PAUSED'
              : isStarting
              ? 'CALIBRATING CAMERA'
              : 'STANDBY'}
          </span>
        </div>

        <div className="status-bar-center">
          <span className="status-bar-hint">{vitals.validationHint}</span>
        </div>

        <div className="status-bar-right">
          <span className="status-bar-tag">SmartSpectra SDK v3.4.0 • Zero Video Saved</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveKey}
        onClearKey={handleClearKey}
        isKeySaved={keySaved}
        isSimulated={isSimulated}
        onToggleSimulated={(enabled) => {
          setIsSimulated(enabled);
          if (enabled && status === 'idle') {
            setStatusText('Simulated demo mode enabled');
          }
        }}
        statusMessage={statusText}
      />
    </div>
  );
}
