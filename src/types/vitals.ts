// src/types/vitals.ts
// AuraFlow AI - Physiological types and sensing interfaces

export interface BiometricVitals {
  breathingRate: number | null;
  breathingConfidence: number | null;
  breathingStable: boolean;

  pulseRate: number | null;
  pulseConfidence: number | null;
  pulseStable: boolean;

  hrvRmssd: number | null;
  hrvConfidence: number | null;
  hrvStable: boolean;
  hrvMeanNn: number | null;
  hrvSdnn: number | null;

  signalQuality: 'optimal' | 'good' | 'fair' | 'poor' | 'searching' | 'standby';
  validationCode: number;
  validationHint: string;
  isSimulated: boolean;
}

export type SensingStatus = 'idle' | 'starting' | 'sensing' | 'paused' | 'stopping' | 'error';

export const INITIAL_VITALS: BiometricVitals = {
  breathingRate: null,
  breathingConfidence: null,
  breathingStable: false,

  pulseRate: null,
  pulseConfidence: null,
  pulseStable: false,

  hrvRmssd: null,
  hrvConfidence: null,
  hrvStable: false,
  hrvMeanNn: null,
  hrvSdnn: null,

  signalQuality: 'standby',
  validationCode: 0,
  validationHint: 'Press "Begin sensing" and align your face in frame.',
  isSimulated: false,
};

// Human-friendly guidance corresponding to SmartSpectra ValidationCode
export const VALIDATION_HINTS: Record<number, { text: string; quality: 'optimal' | 'good' | 'fair' | 'poor' }> = {
  0: { text: 'Optimal alignment. Breathe naturally.', quality: 'optimal' },
  1: { text: 'No face detected. Sit facing the camera.', quality: 'poor' },
  2: { text: 'Multiple faces detected. Please be alone in view.', quality: 'poor' },
  3: { text: 'Center your face in the camera frame.', quality: 'fair' },
  4: { text: 'Adjust your distance from the camera.', quality: 'fair' },
  5: { text: 'Lighting is too dark. Add soft front illumination.', quality: 'poor' },
  6: { text: 'Lighting is too bright. Avoid strong direct glare.', quality: 'fair' },
  7: { text: 'Keep your upper chest visible for breathing analysis.', quality: 'good' },
  10: { text: 'Camera sensor adjusting exposure. Hold steady.', quality: 'fair' },
  11: { text: 'Camera frame rate is low. Check lighting conditions.', quality: 'poor' },
  12: { text: 'Excessive motion detected. Please sit still and relax.', quality: 'poor' },
  13: { text: 'Move a little farther from the camera.', quality: 'fair' },
  14: { text: 'Move a little closer to the camera.', quality: 'fair' },
  15: { text: 'Position your face a little lower in frame.', quality: 'fair' },
  16: { text: 'Position your face a little higher in frame.', quality: 'fair' },
  17: { text: 'Face the camera directly.', quality: 'fair' },
};

