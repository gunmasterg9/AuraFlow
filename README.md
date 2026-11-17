# AuraFlow AI

> **Your body sets the rhythm. AuraFlow creates the calm.**

AuraFlow AI is an Electron + React + TypeScript desktop application for Windows, powered by the **Presage SmartSpectra SDK** (`@smartspectra/node-sdk` v3.4.0). It transforms real-time optical human-sensing biometrics (breathing rate, pulse, and heart rate variability) into calming, breathing-synchronized interactive generative visual art.

---

## Visual Experience & Features

1. **Aura Orb**:
   - An animated, breathing-responsive luminous orb with layered atmospheric glow, rotating celestial orbits, and iridescent specular depth.
   - Dynamically expands and contracts in real time to match the user's measured respiratory rate (or a guided 10 br/min coherence pacing rhythm when resting).
   - Displays gentle phase guidance (*Breathe in slowly*, *Hold gently*, *Release and exhale*).

2. **Breathing Ocean**:
   - A generative 60fps HTML5 Canvas visualization featuring layered undulating sinusoidal waves, moonlight reflections, shimmering ambient sea particles, and tidal swells synchronized with respiratory cadence.

3. **Live Human-Sensing Dashboard**:
   - **Breathing Rate**: Measured in breaths per minute (`br/min`) with stability validation and confidence indicators.
   - **Pulse Rate**: Heart rate in beats per minute (`bpm`) with animated heartbeat icon synchronized to measured rate.
   - **Heart Rate Variability (HRV)**: Root mean square of successive differences (`RMSSD` in ms) for autonomic tone awareness.
   - **Signal Quality Indicator**: Real-time signal strength meter (Optimal, Good, Fair, Poor, Searching, Standby) providing actionable positioning hints derived from SmartSpectra `ValidationCode`.
   - **Integrity**: Never fabricates or estimates measurements as real biometrics. Values remain empty (`—`) until adequate signal stability is verified.

4. **Lifecycle & Hardware Controls**:
   - Explicit **Start**, **Pause**, **Resume**, and **Stop** controls.
   - Stopping or closing the application halts camera tracks and immediately releases the webcam hardware handle, turning off the physical indicator LED.

5. **Simulated Demo Mode**:
   - Allows previewing visualizations and application flows without an active webcam or Presage API key.
   - Prominently labeled with amber badges and disclaimers so simulated data is never mistaken for clinical or physical biometrics.

---

## Electron Security & Privacy

- **Process Isolation**: Built with `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`.
- **Preload Bridge**: Employs `@smartspectra/node-sdk/preload` over an isolated `MessagePort` channel (`smartspectra:attach`).
- **Encrypted Credential Storage**: Presage API keys are encrypted on disk in Electron's `userData` using Windows DPAPI via `safeStorage.encryptString()`.
- **Restricted Permissions**: The camera permission request handler explicitly verifies requesting origins and restricts access only to local application URLs (`file://` and `http://127.0.0.1:5173`).
- **Strict Content Security Policy (CSP)**: Allows only authorized local resources and worker scripts (`worker-src 'self' blob:; media-src 'self' blob:;`).
- **Zero Video Retention**: Raw webcam frames are processed strictly in-memory by the native SmartSpectra engine. Video is never saved to disk or uploaded to external servers.
- **Telemetry Opt-Out**: Aggregate SDK telemetry is explicitly disabled (`enableTelemetry: false`).
- **Wellness Notice**: Not a medical device. Intended solely for general wellness, relaxation, and mindfulness.

---

## Prerequisites

- **OS**: Windows 10 / 11 (x64)
- **Node.js**: v20+ (Node.js LTS recommended)
- **Webcam**: Any standard built-in or USB webcam
- **SmartSpectra API Key**: Obtainable from [Presage Technologies](https://physiology.presagetech.com/) (or use Simulated Demo Mode)

---

## Quick Start (.bat files)

You can launch and stop the application directly with the included Windows batch files:

- **Launch Application**: Double-click [`run.bat`](file:///d:/Desktop/Challenge/AuraFlow-AI/run.bat) (or run `.\run.bat dev` for live development mode with hot-reload).
- **Stop Application**: Double-click [`stop.bat`](file:///d:/Desktop/Challenge/AuraFlow-AI/stop.bat) to safely terminate all running AuraFlow AI and background dev server processes.

---

## Windows PowerShell Setup & Launch

Open **Windows PowerShell** in the project root directory:

### 1. Install Dependencies
```powershell
npm install
```

### 2. Run in Development Mode
```powershell
# If launching from an Electron-based editor terminal (e.g. VS Code), clear the node-mode flag
$env:ELECTRON_RUN_AS_NODE = $null

npm run dev
```

### 3. Type Checking & Production Build
```powershell
# Run TypeScript validation
npm run typecheck

# Build Vite frontend assets into dist/
npm run build
```

### 4. Run Production Desktop App
```powershell
$env:ELECTRON_RUN_AS_NODE = $null
npm start
```

### 5. Package Windows Installer & Unpacked Binary
```powershell
npm run dist
```
- Creates the portable unpacked binary at: `release\win-unpacked\AuraFlow AI.exe`
- Creates the standalone NSIS installer at: `release\AuraFlow AI Setup 1.0.0.exe`

---

## SmartSpectra Integration Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   Renderer Process                     │
│  - React 18 + Vite                                     │
│  - @smartspectra/node-sdk/renderer (MediaStreamTrack)  │
│  - @smartspectra/node-sdk/messages (decodeMetrics)     │
└───────────▲────────────────────────────────┬───────────┘
            │ MessagePort                   │ OffscreenCanvas RGBA frames
┌───────────┴────────────────────────────────▼───────────┐
│                    Preload Bridge                      │
│  - @smartspectra/node-sdk/preload                      │
│  - window.__smartspectraBridge                         │
│  - contextBridge.exposeInMainWorld('auraflow', ...)    │
└───────────▲────────────────────────────────┬───────────┘
            │ IPC Transfer                  │
┌───────────┴────────────────────────────────▼───────────┐
│                     Main Process                       │
│  - electron/main.cjs                                   │
│  - @smartspectra/node-sdk/main (bindSmartSpectraIpc)   │
│  - koffi FFI C ABI Shim                                │
│  - @smartspectra/node-sdk-win32-x64 (C++ Runtime)      │
│  - safeStorage encrypted credentials                   │
└────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

- **Camera Not Found or In Use**: Close other video conferencing or camera applications. Ensure camera access is allowed in *Windows Settings > Privacy & security > Camera*.
- **Low Signal Quality**: Sit centered in front of the camera with your upper chest visible. Ensure soft, even lighting on your face and avoid strong backlights or sudden motion.
- **Authentication**: Confirm that your API key is active and has available processing credits in the Presage portal.
- **Offline / Hardware-Free Testing**: Enable **Simulation / Demo Mode** in the in-app settings (gear/key icon) to evaluate visualizations without a webcam or API key.
