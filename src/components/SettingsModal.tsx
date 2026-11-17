// src/components/SettingsModal.tsx
// Configuration modal for SmartSpectra credentials, security info, and simulation mode

import React, { useState } from 'react';
import {
  Check,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => Promise<boolean>;
  onClearKey: () => Promise<void>;
  isKeySaved: boolean;
  isSimulated: boolean;
  onToggleSimulated: (enabled: boolean) => void;
  statusMessage: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  onClearKey,
  isKeySaved,
  isSimulated,
  onToggleSimulated,
  statusMessage,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    setSaving(true);
    try {
      await onSaveKey(inputKey.trim());
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setInputKey('');
    await onClearKey();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="eyebrow">CONFIGURATION & SECURITY</span>
            <h2>SmartSpectra Settings</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <div className="modal-content">
          {/* Simulation Mode Switch */}
          <div className="settings-section simulation-toggle-section">
            <div className="section-meta">
              <div className="section-title-wrap">
                <Sparkles size={16} className="highlight-icon" />
                <strong>Simulation / Demo Mode</strong>
              </div>
              <p>
                Run a simulated biometric wellness session without requiring an active camera or
                Presage API key. All simulated metrics are prominently flagged.
              </p>
            </div>
            <label className="switch" title="Toggle simulation mode">
              <input
                type="checkbox"
                checked={isSimulated}
                onChange={(e) => onToggleSimulated(e.target.checked)}
              />
              <span className="slider round" />
            </label>
          </div>

          {/* API Key Form */}
          <form className="settings-section" onSubmit={handleSave}>
            <div className="section-meta">
              <div className="section-title-wrap">
                <KeyRound size={16} />
                <strong>Presage SmartSpectra API Key</strong>
              </div>
              <p>
                Required for live camera sensing. Your key is stored in your Windows user profile
                encrypted with Electron <code>safeStorage</code> (Windows DPAPI).
              </p>
            </div>

            <div className="key-input-row">
              <div className="password-input-wrapper">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder="Paste SmartSpectra API Key (e.g. psg_...)"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  className="toggle-vis-btn"
                  onClick={() => setShowKey(!showKey)}
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <button
                type="submit"
                className="save-key-btn"
                disabled={saving || !inputKey.trim()}
              >
                <Check size={16} />
                {saving ? 'Saving…' : isKeySaved ? 'Update Key' : 'Save Key'}
              </button>

              {isKeySaved && (
                <button
                  type="button"
                  className="clear-key-btn"
                  onClick={handleClear}
                  title="Remove saved key"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            {statusMessage && <div className="key-status-note">{statusMessage}</div>}
          </form>

          {/* Privacy Architecture Notice */}
          <div className="settings-section privacy-details">
            <div className="section-title-wrap">
              <ShieldCheck size={16} className="shield-icon" />
              <strong>Privacy & Security Architecture</strong>
            </div>
            <ul className="security-checklist">
              <li>
                <Lock size={13} />
                <span>
                  <strong>Zero Video Storage:</strong> Raw camera video frames are processed in-memory
                  and never recorded, written to disk, or saved.
                </span>
              </li>
              <li>
                <Lock size={13} />
                <span>
                  <strong>Camera Hardware Release:</strong> Stopping or closing the app cleanly releases
                  the camera hardware and turns off the indicator LED.
                </span>
              </li>
              <li>
                <Lock size={13} />
                <span>
                  <strong>Encrypted Storage:</strong> API credentials are encrypted with Windows DPAPI
                  via Electron <code>safeStorage</code>.
                </span>
              </li>
              <li>
                <Lock size={13} />
                <span>
                  <strong>Telemetry Opt-Out:</strong> Aggregate SDK telemetry is explicitly disabled
                  (<code>enableTelemetry: false</code>).
                </span>
              </li>
            </ul>
          </div>

          {/* Wellness Disclaimer */}
          <div className="disclaimer-callout">
            <HelpCircle size={15} className="disclaimer-icon" />
            <p>
              <strong>Informational Wellness Notice:</strong> AuraFlow AI is intended solely for mindful
              breathing and general wellness awareness. It is not a medical device and is not designed to
              diagnose, treat, cure, or prevent any medical condition. Always consult a qualified healthcare
              professional for clinical guidance.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

