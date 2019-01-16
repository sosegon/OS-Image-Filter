function addHeadStyle(doc, headStyles, styleName, style) {
    const styleElement = doc.createElement('style');
    styleElement.type = 'text/css';
    styleElement.appendChild(doc.createTextNode(styleName + style));
    doc.head.appendChild(styleElement);
    headStyles[styleName] = styleElement;
}

function removeHeadStyle(doc, headStyles, styleName) {
    doc.head.removeChild(headStyles[styleName]);
    delete headStyles[styleName];
}

function addHeadScript(doc, src, code, onload) {
    const scriptElement = doc.createElement('script');
    scriptElement.type = 'text/javascript';
    if (src) {
        scriptElement.src = src;
    }
    if (code) {
        scriptElement.appendChild(doc.createTextNode(code));
    }
    if (onload) {
        scriptElement.onload = onload;
    }
    doc.head.appendChild(scriptElement);
}

function addCssClass(domElement, className) {
    domElement.className += ' ' + className;
}

function removeCssClass(domElement, className) {
    const oldClass = domElement.className;
    const newClass = domElement.className.replace(new RegExp('\\b' + className + '\\b'), '');

    if (oldClass !== newClass) {
        domElement.className = newClass;
    }
}

function handleListeners(domElement, listeners, add, flag) {
    if (add && !domElement[flag]) {
        for (const key of Object.keys(listeners)) {
            domElement.addEventListener(key, listeners[key]);
        }
        domElement[flag] = true;
    } else if (!add && domElement[flag]) {
        for (const key of Object.keys(listeners)) {
            domElement.removeEventListener(key, listeners[key]);
        }
        domElement[flag] = false;
    }
}

function handleStyleClasses(domElement, classNames, add, flag) {
    if (add && domElement[flag]) {
        classNames.map(className => {
            self.addClassToStyle(domElement, className);
        });
        domElement[flag] = true;
    } else if (!add && domElement[flag]) {
        classNames.map(className => {
            self.removeClassFromStyle(domElement, className);
        });
        domElement[flag] = false;
    }
}

function createCanvas(id) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', id);
    canvas.style.display = 'none';
    return canvas;
}
/**
 * Hide element.
 *
 * @param {Element} domElement
 * @param {boolean} toggle
 */
function hideElement(domElement, toggle) {
    handleStyleClasses(domElement, [CSS_CLASS_HIDE], toggle, ATTR_IS_HID);
}
/**
 * Store the original src of the image.
 *
 * @param {HTMLImageElement} domElement
 * @param {boolean} toggle
 */
function handleSourceOfImage(domElement, toggle) {
    if (toggle && !domElement.getAttribute(ATTR_ALREADY_TOGGLED)) {
        domElement.oldsrc = domElement.src;
        domElement.oldsrcset = domElement.srcset;
        // Do not set to empty string, otherwise the processing
        // will result in an empty image
        // el.src = el.srcset = '';

        // Empty string to make sure filtered images are displayed
        // in the img elements
        domElement.srcset = '';
        domElement.setAttribute(ATTR_ALREADY_TOGGLED, 'true');
    } else if (!toggle && domElement.getAttribute(ATTR_ALREADY_TOGGLED) === 'true') {
        const oldsrc = domElement.oldsrc;
        domElement.oldsrc = domElement.src;
        domElement.src = oldsrc;
        domElement.srcset = domElement.oldsrcset;
    }
}

function handleBackgroundForElement(domElement, toggle) {
    handleStyleClasses(domElement, [], toggle, ATTR_HAS_BACKGROUND_IMAGE)
}
/**
 * Add or remove the listener for a **load** event in an IMG
 * element.
 *
 * @param {HTMLImageElement} domElement
 * @param {boolean} toggle
 */
function handleLoadProcessImageListener(domElement, callback, toggle) {
    handleListeners(domElement, {
        'load': callback
    }, toggle, ATTR_HAS_PROCESS_IMAGE_LISTENER);
}
/**
 * Add / remove a load event listener.
 *
 * @param {Element} domElement
 * @param {boolean} toggle
 */
function handleLoadEventListener(domElement, callback, toggle) {
    handleListeners(domElement, {
        'load': callback
    }, toggle, ATTR_HAS_LOAD_LISTENER);
}