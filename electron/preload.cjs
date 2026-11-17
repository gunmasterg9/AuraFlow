// electron/preload.cjs
// AuraFlow AI - Secure Preload Bridge with SmartSpectra MessagePort Bridge

'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// -----------------------------------------------------------------------------
// SmartSpectra Preload Bridge
// -----------------------------------------------------------------------------
const ATTACH_CHANNEL = 'smartspectra:attach';

let port = null;
let messageListener = null;

const onPortMessage = (event) => {
  if (messageListener) {
    messageListener(event.data);
  }
};

contextBridge.exposeInMainWorld('__smartspectraBridge', {
  diagnostics: false,

  attach() {
    if (port) return; // idempotent
    const channel = new MessageChannel();
    port = channel.port1;
    port.onmessage = onPortMessage;
    ipcRenderer.postMessage(ATTACH_CHANNEL, null, [channel.port2]);
    port.start();
  },

  postMessage(message) {
    if (!port) {
      throw new Error('@smartspectra/node-sdk/preload: postMessage before attach()');
    }
    try {
      port.postMessage(message);
    } catch (err) {
      console.error('[AuraFlow/preload] port.postMessage failed for ' + (message && message.kind) + ':', err);
      throw err;
    }
  },

  onMessage(callback) {
    messageListener = typeof callback === 'function' ? callback : null;
  },

  close() {
    if (port) {
      try {
        port.close();
      } catch {
        /* already closed */
      }
      port = null;
    }
    messageListener = null;
  },
});

// -----------------------------------------------------------------------------
// AuraFlow Secure Bridge API
// -----------------------------------------------------------------------------
contextBridge.exposeInMainWorld('auraflow', {
  getKey: () => ipcRenderer.invoke('key:get'),
  saveKey: (key) => ipcRenderer.invoke('key:save', key),
  clearKey: () => ipcRenderer.invoke('key:clear'),
  isPackaged: () => ipcRenderer.invoke('app:is-packaged'),
});
