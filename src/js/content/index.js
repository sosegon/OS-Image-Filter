import {
  createCanvas,
} from './domManipulation';
import {
  CANVAS_GLOBAL_ID,
} from "./constants";
import ImagesDisplayer from './ImagesDisplayer';
import WindowScanner from './WindowScanner';

let quotesRegex = /['"]/g;
const displayer = new ImagesDisplayer();
const windowScanner = new WindowScanner(window, displayer);

// Detect if the script is being executed within an iframe. It is
// useful when trying to accomplish something just in the main page
// e.g. displaying a bar for donations.
function inIframe() {
    try {

        return window.self !== window.top;

    } catch (e) {

        return true;

    }
}

// Once the DOM tree is ready we
// can start to modify it. In this case, we add the canvas element to
// process images fetched with XHR and the container for the canvas
// elements to process images fetched directly.
window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(createCanvas(CANVAS_GLOBAL_ID));
    windowScanner.readinessValidator.pageContentLoaded = true;
});

// Get settings to check status of extension.
chrome.runtime.sendMessage({
    r: 'getSettings'
}, (settings) => {
    // If it is active, do the stuff
    if (settings && !settings.isExcluded && !settings.isExcludedForTab && !settings.isPaused && !settings.isPausedForTab) {
        chrome.runtime.sendMessage({
            r: 'setColorIcon',
            toggle: true
        });
        windowScanner.readinessValidator.settings = settings;
    }
});

// Catches 'Show Images' option from browser actions
chrome.runtime.onMessage.addListener(request => {

    if (request.r === 'showImages') {

        displayer.showImages();

    }
});
