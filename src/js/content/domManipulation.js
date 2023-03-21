import {
  IS_HIDDEN,
  IS_TOGGLED,
  IS_PROCESSED,
  HAS_LOAD_LISTENER,
  HAS_PROCESS_IMAGE_LISTENER,
  HAS_BACKGROUND_IMAGE,
  CSS_CLASS_HIDE,
  ATTR_UUID,
} from "./constants";
/**
 * Add css style to the head of a
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Document|document}.
 *
 * @param {Document} doc - Document to hold the style.
 * @param {object} headStyles - Object to keep reference of the style
 * added.
 * @param {string} styleName - Name of the css style.
 * @param {string} style - Css style.
 *
 * @example
 * const headStyles = {};
 * const styleName = 'classA';
 * const style = '{background-image: none !important;}'
 *
 * addHeadStyle(document, headStyles, styleName, style);
 */
export function addHeadStyle(doc, headStyles, styleName, style) {
    const styleElement = doc.createElement('style');
    styleElement.type = 'text/css';
    styleElement.appendChild(doc.createTextNode(styleName + style));
    doc.head.appendChild(styleElement);
    headStyles[styleName] = styleElement;
}
/**
 * Remove css style from the head of a
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Document|document}.
 *
 * @param {Document} doc - Document that holds the style to be
 * removed.
 * @param {object} headStyles - Object that keeps the reference of the
 * styles.
 * @param {string} styleName - Name of the css style.
 *
 * @example
 * const headStyles = {};
 * const styleName = 'classA';
 * const style = '{background-image: none !important;}'
 *
 * addHeadStyle(document, headStyles, styleName, style);
 * removeHeadStyle(document, headStyles, styleName);
 */
export function removeHeadStyle(doc, headStyles, styleName) {
    doc.head.removeChild(headStyles[styleName]);
    delete headStyles[styleName];
}
/**
 * Add script to the head of a
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Document|document}.
 *
 * @param {Document} doc - Document to hold the script
 * @param {string} [src] - Path or url to the script.
 * @param {string} [code] - Code of the script.
 * @param {function} [onload]- Callback to be called once the script element
 * is loaded.
 *
 * @example
 * const src = './js/script.js';
 * const code = "const a = 'example'; console.log(a);"
 * const onload = () => {
 *      // do something
 * };
 *
 * addHeadScript(document, src);
 * addHeadScript(document, src, code);
 * addHeadScript(document, src, code, onload);
 * addHeadScript(document, src, null, onload);
 * addHeadScript(document, null, code);
 */
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
/**
 * Add css class to an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 *
 * @param {Element} domElement
 * @param {string} className
 *
 * @example
 * const domElement = document.getElementById('id');
 * const className = 'classA';
 * addCssClass(domElement, className);
 */
export function addCssClass(domElement, className) {
    domElement.className += ' ' + className;
}
/**
 * Remove css class from an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 *
 * @param {Element} domElement
 * @param {string} className
 *
 * @example
 * const domElement = document.getElementById('id');
 * const className = 'classA';
 * removeCssClass(domElement, className);
 */
export function removeCssClass(domElement, className) {
    const oldClass = domElement.className;
    const newClass = domElement.className.replace(new RegExp('\\b' + className + '\\b'), '');

    if (oldClass !== newClass) {
        domElement.className = newClass;
    }
}
/**
 * Add|remove listeners to|from an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * for different types of
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Event|events}.
 *
 * @param {Element} domElement
 * @param {object} listeners - Object that define the events and the
 * callbacks.
 * @param {boolean} add - Flag to add|remove the listeners.
 * @param {string} flag - Name of the property to be added to the
 * element. It is used to check if listeners have been added to the
 * element.
 *
 * @example
 * const mousemove = () => {
 *      // do something
 * };
 * const mouseover = () => {
 *      // do something
 * };
 * const listeners = {
 *   'mousemove': mousemove,
 *   'mouseover': mouseover
 * };
 * const element = document.getElementById('id');
 * const flag = 'has-mouse-listeners';
 *
 * handleListeners(element, listeners, true, flag); // add listeners
 * handleListeners(element, listeners, false, flag); // remove listeners
 */
export function handleListeners(domElement, listeners, add, flag) {
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
/**
 * Add|remove css classes to|from an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 *
 * @param {Element} domElement
 * @param {array} classNames - List of css class names.
 * @param {boolean} add - Flag to add|remove the class names.
 * @param {string} flag - Name of the property to be added to the
 * element. It is used to check if css classes have been added to the
 * element.
 *
 * @example
 * const cssClasses = ['classA', 'classB'];
 * const element = document.getElementById('id');
 * const flag = 'has-extra-classes';
 *
 * handleStyleClasses(element, cssClasses, true, flag); // adds css classes
 * handleStyleClasses(element, cssClasses, false, flag); // removes css classes
 */
function handleStyleClasses(domElement, classNames, add, flag) {
    if (add && !domElement[flag]) {
        classNames.map(className => {
            addClassToStyle(domElement, className);
        });
        domElement[flag] = true;
    } else if (!add && domElement[flag]) {
        classNames.map(className => {
            removeClassFromStyle(domElement, className);
        });
        domElement[flag] = false;
    }
}
/**
 * Add a css class to an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 *
 * @param {Element} domElement
 * @param {string} className - Css class name.
 *
 * @example
 * const element = document.getElementById('id');
 * const cssClass = 'classA';
 * addClassToStyle(element, cssClass);
 */
function addClassToStyle(domElement, className) {
    domElement.className += ' ' + className;
}
/**
 * Remove a css class from an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 *
 * @param {Element} domElement
 * @param {string} className - Css class name.
 *
 * @example
 * const element = document.getElementById('id');
 * const cssClass = 'classA';
 * removeClassFromStyle(element, cssClass);
 */
function removeClassFromStyle(domElement, className) {
    const oldClass = domElement.className;
    const newClass = domElement.className.replace(new RegExp('\\b' + className + '\\b'), '');
    if (oldClass !== newClass) {
        domElement.className = newClass;
    }
}
/**
 * Create a
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement|canvas}.
 *
 * @param {string} id - Identifier for the canvas.
 * @returns {Canvas}
 *
 * @example
 * const canvas = createCanvas('new-canvas');
 */
export function createCanvas(id) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', id);
    canvas.style.display = 'none';
    return canvas;
}
/**
 * Hide|show an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * It works by handling the css style of the element by using the
 * {@link CSS_CLASS_HIDE} css class, the {@link IS_HIDDEN} flag, and
 * the {@link handleStyleClasses} function.
 *
 * @param {Element} domElement
 * @param {boolean} toggle
 *
 * @example
 * const element = document.getElementById('id');
 * hideElement(element, true); // hide
 * hideElement(element, false); // show
 */
export function hideElement(domElement, toggle) {
    handleStyleClasses(domElement, [CSS_CLASS_HIDE], toggle, IS_HIDDEN);
}
/**
 * Swap the original srcset parameter of an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement|image}.
 * It uses the {@link IS_TOGGLED} flag.
 *
 * @param {HTMLImageElement} domElement
 * @param {boolean} toggle
 *
 * @example
 * const image = document.getElementById('id');
 * image.src = 'imageA.jpg'
 * image.srcset = 'imageA_4x.jpg 4x, imageA_2x.jpg 2x'
 *
 * handleSourceOfImage(element, true);
 *
 * console.log(image.src); // 'imageA.jpg'
 * console.log(image.srcset); // ''
 *
 * handleSourceOfImage(element, false);
 *
 * console.log(image.src); // 'imageA.jpg'
 * console.log(image.srcset); // 'imageA_4x.jpg 4x, imageA_2x.jpg 2x'
 */
export function handleSourceOfImage(domElement, toggle) {
    if (toggle && !domElement.getAttribute(IS_TOGGLED)) {
        domElement.oldsrc = domElement.src;
        domElement.oldsrcset = domElement.srcset;
        // Do not set to empty string, otherwise the processing
        // will result in an empty image
        // el.src = el.srcset = '';

        // Empty string to make sure filtered images are displayed
        // in the img elements
        domElement.srcset = '';
        domElement.setAttribute(IS_TOGGLED, 'true');
    } else if (!toggle && domElement.getAttribute(IS_TOGGLED) === 'true') {
        const oldsrc = domElement.oldsrc;
        domElement.oldsrc = domElement.src;
        domElement.src = oldsrc;
        domElement.srcset = domElement.oldsrcset;
    }
}
/**
 * Sets the {@link HAS_BACKGROUND_IMAGE} flag in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}
 * by setting the {@link handleStyleClasses} function.
 *
 * @param {Element} domElement
 * @param {boolean} toggle
 *
 * @example
 * const element = document.getElementById('id');
 * console.log(element[HAS_BACKGROUND_IMAGE]); // undefined
 *
 * handleBackgroundForElement(element, true);
 * console.log(element[HAS_BACKGROUND_IMAGE]); // true
 *
 * handleBackgroundForElement(element, false);
 * console.log(element[HAS_BACKGROUND_IMAGE]); // false
 */
export function handleBackgroundForElement(domElement, toggle) {
    handleStyleClasses(domElement, [], toggle, HAS_BACKGROUND_IMAGE)
}
/**
 * Add|remove a listener for load event in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement|image}.
 * The listener is meant to process the actual bitmap of the image.
 *
 * @param {HTMLImageElement} domElement
 * @param {function} callback
 * @param {boolean} toggle
 *
 * @example
 * const element = document.getElementById('id');
 * const processImage = () => {
 *      // Do stuff to process the image
 * };
 *
 * handleLoadProcessImageListener(element, processImage, true); // Add listener
 * handleLoadProcessImageListener(element, processImage, false); // Remove listener
 */
export function handleLoadProcessImageListener(domElement, callback, toggle) {
    handleListeners(domElement, {
        'load': callback
    }, toggle, HAS_PROCESS_IMAGE_LISTENER);
}
/**
 * Add|remove a listener for load event in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement|image}.
 *
 * @param {HTMLImageElement} domElement
 * @param {function} callback
 * @param {boolean} toggle
 *
 * @example
 * const element = document.getElementById('id');
 * const listener = () => {
 *      // Do stuff
 * };
 *
 * handleLoadProcessImageListener(element, listener, true); // Add listener
 * handleLoadProcessImageListener(element, listener, false); // Remove listener
 *
 */
export function handleLoadEventListener(domElement, callback, toggle) {
    handleListeners(domElement, {
        'load': callback
    }, toggle, HAS_LOAD_LISTENER);
}
/**
 * Process the bitmap in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement|image}.
 *
 * @param {HTMLImageElement} domElement
 * @param {HTMLCanvasElement} canvas - Canvas to make the processing.
 *
 * @example
 * const image = document.getElementById('image-to-process');
 * const canvas = document.getElementById('canvas-to-do-processing');
 * processDomImage(image, canvas);
 */
export function processDomImage(domElement, canvas) {
    const uuid = domElement.getAttribute(ATTR_UUID);

    try {
        filterImageElement(domElement, uuid, canvas);
    } catch (err) {
        fetchAndReadImage(domElement.src).then(image => {
            filterImageElement(image, uuid, canvas);
        });
    }
}
/**
 * Process the bitmap of an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}
 * that has been passed as url in the background-image css attribute.
 * The url is used to retrieve the image with an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest|XHR}
 * object.
 *
 * @param {Element} domElement
 * @param {string} url - Url obtained from the background-image css
 * attribute in the style of the element.
 * @param {HTMLCanvasElement} canvas - Canvas to do the processing.
 *
 * @example
 * const element = document.getElementById('id');
 * const url = 'http://example.com/image.jpg';
 * const canvas = document.getElementById('canvas-id');
 *
 * processBackgroundImage(element, url, canvas);
 */
export function processBackgroundImage(domElement, url, canvas) {
    const uuid = domElement.getAttribute(ATTR_UUID);

    fetchAndReadImage(url).then(image => {
        filterImageElementAsBackground(image, uuid, canvas);
    });
}
/**
 * Fetch and read an image from an url.
 *
 * @param {string} url
 *
 * @returns {Promise}
 *
 * @example
 * const url = 'http://example.com/image.jpg';
 * fetchAndReadImage(url).then(image => {
 *      // do something
 * });
 */
function fetchAndReadImage(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();

    return new Promise((resolve, reject) => {
        xhr.onload = resolve;
    }).then(() => {
        const reader = new FileReader();
        reader.readAsDataURL(xhr.response);

        return new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader);
        });
    }).then(reader => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = reader.result;

        return new Promise((resolve, reject) => {
            image.onload = () => resolve(image);
        })
    });
}
/**
 * Filter the bitmap in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement|image}.
 * and update the background-image attribute in the style of the
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}
 * identified with an uuid.
 *
 * @param {HTMLImageElement} imgElement
 * @param {string} uuid - Unique identifier of the element which
 * background-image style attribute will be updated.
 * @param {HTMLCanvasElement} canvas - Canvas to do the filtering.
 *
 * @example
 * const element = document.getElementById('id');
 * const uuid = 'some-unique-identifier';
 * const canvas = document.getElementById('canvas-id');
 *
 * filterImageElementAsBackground(element, uuid, canvas);
 */
function filterImageElementAsBackground(imgElement, uuid, canvas) {
    const base64Img = filterSkinColor(imgElement, uuid, canvas);
    const newBackgroundImgUrl = "url('" + base64Img + "')";
    const actualElement = findElementByUuid(document, uuid);

    if (actualElement) {
        actualElement.style.backgroundImage = newBackgroundImgUrl;
        actualElement[IS_PROCESSED] = true;
    }
}
/**
 * Filter the bitmap in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement|image}.
 * and update the src attribute in the
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}
 * identified with an uuid.
 *
 * @param {HTMLImageElement} imgElement
 * @param {number} uuid - Unique identifier of the element which
 * src attribute will be updated.
 * @param {HTMLCanvasElement} canvas - Canvas to do the filtering.
 *
 * @example
 * const element = document.getElementById('id');
 * const uuid = 'some-unique-identifier';
 * const canvas = document.getElementById('canvas-id');
 *
 * filterImageElement(element, uuid, canvas);
 */
function filterImageElement(imgElement, uuid, canvas) {
    const urlData = filterSkinColor(imgElement, uuid, canvas)
    const actualElement = findElementByUuid(document, uuid);

    if (actualElement) {
        actualElement.src = urlData;
        actualElement.srcset = '';
        actualElement.onload = () => {
            removeCssClass(actualElement, CSS_CLASS_HIDE);
            actualElement.setAttribute(IS_PROCESSED, 'true');
            actualElement[IS_PROCESSED] = true;
            handleBackgroundForElement(actualElement, true);
        }
    }
}
/**
 * Find the
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}
 * in the corresponding
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Document|document}
 * by using element's uuid.
 *
 * @param {Document} doc
 * @param {string} uuid
 *
 * @returns {Element}
 *
 * @example
 * const uuid = 'some-unique-identifier';
 * const actualElement = findElementByUuid(document, uuid);
 */
function findElementByUuid(doc, uuid) {
    let elements = doc.querySelectorAll('[' + ATTR_UUID + ']');
    elements = [...elements];

    elements = elements.filter((element) => {
        return element.getAttribute(ATTR_UUID) === uuid;
    });

    if (elements.length > 0) {
        return elements[0];
    }

    return null;
}
/**
 * Filter the pixels with skin color in the bitmap of an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement|image}.
 *
 * @param {HTMLImageElement} imgElement
 * @param {string} uuis
 * @param {HTMLCanvasElement} canvas - Canvas to do the filtering.
 *
 * @returns {string} Base64 string encoding the filtered bitmap.
 *
 * @example
 * const element = document.getElementById('id');
 * const uuid = 'some-unique-identifier';
 * const canvas = document.getElementById('canvas-id');
 *
 * const base64Image = filterSkinColor(element, uuid, canvas);
 */
function filterSkinColor(imgElement, uuid, canvas) {
    const { width, height } = imgElement;
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);

    const context = canvas.getContext('2d');
    context.drawImage(imgElement, 0, 0);

    const imageData = context.getImageData(0, 0, width, height);
    const rgbaArray = imageData.data;

    for (let i = 0; i < rgbaArray.length; i += 4) {
        const rIndex = i;
        const gIndex = i + 1;
        const bIndex = i + 2;
        const aIndex = i + 3;

        const r = rgbaArray[rIndex];
        const g = rgbaArray[gIndex];
        const b = rgbaArray[bIndex];

        if (
            (r > 95 && g > 40 && b > 20) &&
            (Math.max(r, g, b) - Math.min(r, g, b) > 15) &&
            (Math.abs(r - g) > 15 && r > g && r > b)
        ) {
            rgbaArray[rIndex] = 127;
            rgbaArray[gIndex] = 127;
            rgbaArray[bIndex] = 127;
            rgbaArray[aIndex] = 255;
        }
    }

    imageData.data.set(rgbaArray);
    context.putImageData(imageData, 0, 0);
    const base64Img = canvas.toDataURL("image/png");

    return base64Img;
}
/**
 * Add a random uuid to an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 *
 * @param {Element} domElement
 *
 * @example
 * const element = document.getElementById('id');
 * addRandomWizUuid(element);
 */
export function addRandomWizUuid(domElement) {

    if (domElement.getAttribute(ATTR_UUID) === null) {

        domElement.setAttribute(ATTR_UUID, guid());

    }
}
/**
 * Generate an uuid.
 *
 * @returns {string}
 *
 * @example
 * const uuid = guid();
 */
function guid() {
    return crypto.randomUUID();
}
/**
 * Determine if a
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent|mouse event}
 * ocurred within the boundaries of a rectangle.
 *
 * @param {Event} event
 * @param {object} coords - Object defining the coordinates of a
 * rectangle.
 *
 * @example
 * const event = new MouseEvent();
 * event.x = 50;
 * event.y = 50;
 * const coords = {left: 10, top: 10, right: 100, bottom: 100};
 *
 * console.log(isMouseIn(event, coords)); // true
 */
export function isMouseIn(event, coords) {
    return event.x >= coords.left && event.x < coords.right && event.y >= coords.top && event.y < coords.bottom;
}