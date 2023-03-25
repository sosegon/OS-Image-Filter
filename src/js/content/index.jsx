import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { WindowScanner } from 'Components';
import { ExtensionSettingsProvider } from 'Hooks/useExtensionSettingsContext';

function App() {

  const [initialSettings, setInitialSettings] = useState({});

  useEffect(() => {
    chrome.runtime.sendMessage(
      {
        r: 'getSettings',
      },
      (settings) => {
        setInitialSettings(settings);
      }
    );
  }, []);

  return (
    <ExtensionSettingsProvider settings={initialSettings}>
      <WindowScanner />
    </ExtensionSettingsProvider>
  );
}


window.addEventListener('DOMContentLoaded', () => {
  const rootDom = document.createElement('div');
  rootDom.id = 'skf-root';
  document.body.appendChild(rootDom);

  const root = createRoot(rootDom);
  root.render(<App />);

  // Defines styles
  const style = document.createElement('style');
  style.innerHTML = `
    .skf-hide-class {
      opacity: 0 !important;
    }
  `;
  document.head.appendChild(style);
});
