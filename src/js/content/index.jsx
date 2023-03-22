import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { CANVAS_GLOBAL_ID, ROOT_GLOBAL_ID } from "./constants";
import ImagesDisplayer from "./ImagesDisplayer";
import WindowScanner from "./WindowScanner";

function App() {
  const displayer = new ImagesDisplayer();
  const windowScanner = new WindowScanner(window, displayer);
  windowScanner.readinessValidator.pageContentLoaded = true;

  useEffect(() => {
    chrome.runtime.sendMessage(
      {
        r: "getSettings",
      },
      (settings) => {
        if (
          settings &&
          !settings.isExcluded &&
          !settings.isExcludedForTab &&
          !settings.isPaused &&
          !settings.isPausedForTab
        ) {
          chrome.runtime.sendMessage({
            r: "setColorIcon",
            toggle: true,
          });
          windowScanner.readinessValidator.settings = settings;
        }
      }
    );
    chrome.runtime.onMessage.addListener((request) => {
      if (request.r === "showImages") {
        displayer.showImages();
      }
    });
  }, []);

  return <canvas id={CANVAS_GLOBAL_ID} style={{ display: "none" }} />;
}

window.addEventListener("DOMContentLoaded", () => {
  const rootDom = document.createElement("div");
  rootDom.id = ROOT_GLOBAL_ID;
  document.body.appendChild(rootDom);

  const root = createRoot(rootDom);
  root.render(<App />);
});
