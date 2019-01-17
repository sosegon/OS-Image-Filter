/**
 * Add css style to the head of a
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Document|document}.
 *
 * @param {Document} doc
 * @param {object} headStyles - Object to keep reference of the style
 * added.
 * @param {string} styleName - Name of the css style.
 * @param {string} style - css style.
 */
function addHeadStyle(doc, headStyles, styleName, style) {
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
 * @param {Document} doc
 * @param {object} headStyles - Object that keeps the reference of the
 * style.
 * @param {string} styleName - Name of the css style.
 */
function removeHeadStyle(doc, headStyles, styleName) {
    doc.head.removeChild(headStyles[styleName]);
    delete headStyles[styleName];
}
/**
 * Add script tp the head of a
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Document|document}.
 *
 * @param {Document} doc
 * @param {string} - Path or url to the script.
 * @param {string} - Code of the script.
 * @param {function} - Callback to be called once the script element
 * is loaded.
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
 * Add css class to
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 *
 * @param {Element} domElement
 * @param {string} className
 */
function addCssClass(domElement, className) {
    domElement.className += ' ' + className;
}
/**
 * Remove css class from
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 *
 * @param {Element} domElement
 * @param {string} className
 */
function removeCssClass(domElement, className) {
    const oldClass = domElement.className;
    const newClass = domElement.className.replace(new RegExp('\\b' + className + '\\b'), '');

    if (oldClass !== newClass) {
        domElement.className = newClass;
    }
}
/**
 * Add/remove listeners to/from an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * for different types of
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Event|events}.
 *
 * @param {Element} domElement
 * @param {object} listeners - Object that define the events and the
 * callbacks.
 * @param {boolean} add - Flag to add/remove the listeners.
 * @param {string} flag - Name of the property to be added to the
 * element. It is used to check if listeners have been added to the
 * element.
 *
 * @example
 * const mousemove = () => {// do something};
 * const mouseover = () => {// do something};
 * const listeners = {
 *   'mousemove': mousemove,
 *   'mouseover': mouseover
 * };
 * const element = document.getElementById('id');
 * const flag = 'has-mouse-listeners';
 *
 * handleListeners(element, listeners, true, flag); // adds listeners
 * handleListeners(element, listeners, false, flag); // removes listeners
 */
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
/**
 * Add/remove css classes to/from an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 *
 * @param {Element} domElement
 * @param {array} classNames - List of css class names.
 * @param {boolean} add - Flag to add/remove the class names.
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
 * @param {string} className - css class name.
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
 * @param {string} className - css class name.
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
function createCanvas(id) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', id);
    canvas.style.display = 'none';
    return canvas;
}
/**
 * Hide / show an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * It works by handling the css style of the element.
 *
 * @param {Element} domElement
 * @param {boolean} toggle
 *
 * @example
 * const element = document.getElementById('id');
 * hideElement(element, true); // hide
 * hideElement(element, false); // show
 */
function hideElement(domElement, toggle) {
    handleStyleClasses(domElement, [CSS_CLASS_HIDE], toggle, IS_HIDDEN);
}
/**
 * Swap the original srcset parameter of an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement|image}.
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
function handleSourceOfImage(domElement, toggle) {
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
 * Sets the {@link HAS_BACKGROUND_IMAGE} attribute in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
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
function handleBackgroundForElement(domElement, toggle) {
    handleStyleClasses(domElement, [], toggle, HAS_BACKGROUND_IMAGE)
}
/**
 * Add / remove a listener for load event in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement|image}.
 * The listener is meant to process the actual image.
 *
 * @param {HTMLImageElement} domElement
 * @param {function} callback
 * @param {boolean} toggle
 *
 * @example
 * const element = document.getElementById('id');
 * const processImage = () => {// Do stuff to process the image};
 *
 * handleLoadProcessImageListener(element, processImage, true); // Add listener
 * handleLoadProcessImageListener(element, processImage, false); // Remove listener
 *
 */
function handleLoadProcessImageListener(domElement, callback, toggle) {
    handleListeners(domElement, {
        'load': callback
    }, toggle, HAS_PROCESS_IMAGE_LISTENER);
}
/**
 * Add / remove a listener for load event in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement|image}.
 *
 * @param {HTMLImageElement} domElement
 * @param {function} callback
 * @param {boolean} toggle
 *
 * @example
 * const element = document.getElementById('id');
 * const listener = () => {// Do stuff};
 *
 * handleLoadProcessImageListener(element, listener, true); // Add listener
 * handleLoadProcessImageListener(element, listener, false); // Remove listener
 *
 */
function handleLoadEventListener(domElement, callback, toggle) {
    handleListeners(domElement, {
        'load': callback
    }, toggle, HAS_LOAD_LISTENER);
}
/**
 * Process the bitmap in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement|image}.
 *
 * @param {HTMLImageElement} domElement
 * @param {HTMLCanvasElement} canvas
 *
 * @example
 * const image = document.getElementById('image-to-process');
 * const canvas = document.getElementById('canvas-to-do-processing');
 * processDomImage(image, canvas);
 */
function processDomImage(domElement, canvas) {
    const uuid = domElement.getAttribute(ATTR_UUID);

    domElement[IS_PROCESSED] = true;

    try {
        filterImageElement(canvas, domElement, uuid);
    } catch (err) {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
            const reader = new FileReader();
            reader.uuid = uuid;
            reader.onloadend = function() {
                const image = new Image();
                image.crossOrigin = "anonymous";
                image.src = reader.result;
                image.uuid = this.uuid;
                image.onload = function() {
                    filterImageElement(canvas, this, this.uuid);
                };
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open("GET", domElement.src);
        xhr.responseType = "blob";
        xhr.send();
    }
}
/**
 * Process the image of an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * that has been passed as url in the background-image css attribute.
 * The url is used to retrieve the image with an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest|XHR}
 * object.
 *
 * @param {HTMLImageElement} domElement
 * @param {string} url - Url obtained from the background-image css
 * attribute in the style of the element.s
 * @param {number} width
 * @param {number} height
 * @param {string} uuid - Custom unique identifier of the domElement.
 * @param {HTMLCanvasElement} canvas
 */
function processBackgroundImage(domElement, url, width, height, uuid, canvas) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        const reader = new FileReader();
        reader.uuid = uuid;
        reader.onloadend = function() {
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.src = reader.result;
            image.uuid = this.uuid;
            image.onload = function() {
                filterBackgroundImageContent(canvas, this, uuid);
            };
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
}
/**
 * Filter the background image in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLImageElement} imgElement
 * @param {number} uuid
 */
function filterBackgroundImageContent(canvas, imgElement, uuid) {
    const { width, height } = imgElement;
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);

    const context = canvas.getContext('2d');
    context.drawImage(imgElement, 0, 0);

    const imageData = context.getImageData(0, 0, width, height);
    const rgbaArray = imageData.data;

    filterRgbaArray(rgbaArray);
    imageData.data.set(rgbaArray);
    context.putImageData(imageData, 0, 0);
    const base64Img = canvas.toDataURL("image/png");
    const newBkgImgUrl = "url('" + base64Img + "')";

    let images = document.querySelectorAll('[' + ATTR_UUID + ']');
    images = [...images];
    const actualEl = images.filter((img) => {
        return img.getAttribute(ATTR_UUID) === uuid;
    })[0];

    if (actualEl !== undefined) {
        actualEl.style.backgroundImage = newBkgImgUrl;
        actualEl[IS_PROCESSED] = true;
    }
}
// TODO: Implement option to remove face features. Convex hull or flooding may work.
/**
 * Gray skin color out. Pixels that are not human skin may be grayed
 * out; some pixels that are human skin may be skipped.
 *
 * @param {array} rgbaArray
 */
function filterRgbaArray(rgbaArray) {
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
}
/**
 * Filter the image in an IMG element.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLImageElement} imgElement
 * @param {number} uuid
 */
function filterImageElement(canvas, imgElement, uuid) {
    const { width, height } = imgElement;
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);

    const context = canvas.getContext('2d');
    context.drawImage(imgElement, 0, 0);

    const imageData = context.getImageData(0, 0, width, height);
    const rgbaArray = imageData.data;

    filterRgbaArray(rgbaArray);
    imageData.data.set(rgbaArray);
    context.putImageData(imageData, 0, 0);
    const urlData = canvas.toDataURL('image/png');

    let images = document.querySelectorAll('[' + ATTR_UUID + ']');
    images = [...images];
    const actualImg = images.filter((img) => {
        return img.getAttribute(ATTR_UUID) === uuid;
    })[0];

    if (actualImg !== undefined) {
        actualImg.src = urlData;
        actualImg.srcset = '';
        actualImg.onload = () => {
            loadProcessed(actualImg);
        }
    }
}
/**
 * Set attributes and styles for elements which images have been
 * already processed.
 */
function loadProcessed(domElement) {
    removeCssClass(domElement, CSS_CLASS_HIDE);
    domElement.setAttribute(IS_PROCESSED, "true");
    domElement[IS_PROCESSED] = true;

    if (domElement[IS_PROCESSED]) { // already processed
        // Needed to enable eye icon in image
        handleBackgroundForElement(domElement, true);
        //DoImgSrc(this, true);
        return;
    }
}

function addRandomWizUuid(domElement) {

    if (domElement.getAttribute(ATTR_UUID) === null) {

        domElement.setAttribute(ATTR_UUID, guid());

    }
}
/**
 * Generate a uuid number.
 *
 * @returns {number}
 */
function guid() {
    // See https://stackoverflow.com/a/105074/1065981
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function isMouseIn(event, coords) {
    return event.x >= coords.left && event.x < coords.right && event.y >= coords.top && event.y < coords.bottom;
}