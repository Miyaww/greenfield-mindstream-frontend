import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Buffer } from 'buffer';

window.Buffer = Buffer;
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  // <React.StrictMode>
  <>
    <script src="https://unpkg.com/@bnb-chain/greenfiled-file-handle@0.2.1-alpha.0/dist/browser/umd/index.js"></script>
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__PUBLIC_FILE_HANDLE_WASM_PATH__ = 'https://unpkg.com/@bnb-chain/greenfiled-file-handle@0.2.1-alpha.0/dist/node/file-handle.wasm'`,
      }}
    ></script>
    <App />
  </>,
  // </React.StrictMode>,
);
