/// <reference types="vite/client" />

interface Window {
  auraflow: {
    getKey: () => Promise<string>;
    saveKey: (key: string) => Promise<boolean>;
    clearKey: () => Promise<boolean>;
    isPackaged: () => Promise<boolean>;
  };
  __smartspectraBridge?: {
    diagnostics: boolean;
    attach: () => void;
    postMessage: (message: any) => void;
    onMessage: (callback: (data: any) => void) => void;
    close: () => void;
  };
}
