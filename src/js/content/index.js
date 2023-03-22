import {
  createCanvas,
} from './domManipulation';
import {
  CANVAS_GLOBAL_ID,
} from "./constants";
import ImagesDisplayer from './ImagesDisplayer';
import WindowScanner from './WindowScanner';

// Flag that triggers the process of iterating over the entire
// structure to process the images and add elements like the eye
// icon.
let contentLoaded = false;
let settings = null;
let quotesRegex = /['"]/g;

const displayer = new ImagesDisplayer();
const windowScanner = new WindowScanner(window, contentLoaded, displayer);

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

// Keep track of flag contentLoaded. Once the DOM tree is ready we
// can start to modify it. In this case, we add the canvas element to
// process images fetched with XHR and the container for the canvas
// elements to process images fetched directly.
window.addEventListener('DOMContentLoaded', () => {

    document.body.appendChild(createCanvas(CANVAS_GLOBAL_ID));
    contentLoaded = true;

});

// Get settings to check status of extension.
chrome.runtime.sendMessage({
    r: 'getSettings'
}, (s) => {
    settings = s;
    // If it is active, do the stuff
    if (settings && !settings.isExcluded && !settings.isExcludedForTab && !settings.isPaused && !settings.isPausedForTab) {

        chrome.runtime.sendMessage({
            r: 'setColorIcon',
            toggle: true
        });
        windowScanner.setSettings(settings);
        windowScanner.setEverythingUp();

    }
});

// Catches 'Show Images' option from browser actions
chrome.runtime.onMessage.addListener(request => {

    if (request.r === 'showImages') {

        displayer.showImages();

    }
});
