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
    handleStyleClasses(domElement, [CSS_CLASS_HIDE], toggle, IS_HIDDEN);
}
/**
 * Store the original src of the image.
 *
 * @param {HTMLImageElement} domElement
 * @param {boolean} toggle
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

function handleBackgroundForElement(domElement, toggle) {
    handleStyleClasses(domElement, [], toggle, HAS_BACKGROUND_IMAGE)
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
    }, toggle, HAS_PROCESS_IMAGE_LISTENER);
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
    }, toggle, HAS_LOAD_LISTENER);
}

function processDomImage(domElement) {
    const canvas = this.addCanvasSibling(domElement);
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
                    const { width, height } = this;

                    const canvas_global = document.getElementById(CANVAS_GLOBAL_ID);
                    canvas_global.setAttribute("width", width);
                    canvas_global.setAttribute("height", height);

                    filterImageElement(canvas_global, this, this.uuid);
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
 * Process the image of an element passed in its style. Since the
 * image is in the style, it is referenced with an url. The url is
 * used to retrieve the image with an XHR object. It uses the
 * global canvas to filter the image.
 *
 * @param {Element} domElement
 * @param {ImageBitmap} backgrounfImage
 * @param {number} width
 * @param {number} height
 * @param {string} uuid
 */
function processBackgroundImage(domElement, backgroundImage, width, height, uuid) {
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

                const canvasGlobal = document.getElementById(CANVAS_GLOBAL_ID);
                canvasGlobal.setAttribute("width", width);
                canvasGlobal.setAttribute("height", height);

                filterBackgroundImageContent(canvasGlobal, this, uuid);
            };
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open("GET", backgroundImage);
    xhr.responseType = "blob";
    xhr.send();
}
/**
 * Filter the background image in an element.
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
    const uuid = domElement.getAttribute(ATTR_UUID);
    const canvas = document.getElementById("#" + uuid + "-canvas");
    if (canvas !== null) {
        canvas.parentNode.removeChild(canvas);
    }

    if (domElement[IS_PROCESSED]) { // already processed
        // Needed to enable eye icon in image
        handleBackgroundForElement(domElement, true);
        //DoImgSrc(this, true);
        return;
    }
}
// TODO: Use only the global canvas to
// improve perfomance. Workers may be helpful
/**
 * Add a canvas sibling for an element containing an image. The
 * canvas is meant to be used to get the data in a readable format to
 * be filtered.
 *
 * @param {Element} domElement
 */
function addCanvasSibling(domElement) {
    const uuid = domElement.getAttribute(ATTR_UUID) + "-canvas";
    const canvas = document.getElementById(uuid);

    if (canvas === undefined || canvas === null) {
        const canvas = document.createElement("canvas");
        canvas.setAttribute("id", uuid);

        const room = document.getElementById(CANVAS_CONTAINER_ID);
        room.appendChild(canvas);
        addCssClass(canvas, CSS_CLASS_HIDE);
    }

    return canvas;
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