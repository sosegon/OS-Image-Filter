import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { CANVAS_GLOBAL_ID, ROOT_GLOBAL_ID } from "./constants";
import ImagesDisplayer from "./ImagesDisplayer";
import WindowScanner from "./WindowScanner";
import Styler from "./Styler";

const displayer = new ImagesDisplayer();
const styler = new Styler();
const windowScanner = new WindowScanner(window, displayer, styler);

function App() {
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
  styler.initStyles(document);

  if(!displayer.showAll) {
    styler.hide(document.body);
  }

  const rootDom = document.createElement("div");
  rootDom.id = ROOT_GLOBAL_ID;
  document.body.appendChild(rootDom);

  const root = createRoot(rootDom);
  root.render(<App />);
});
