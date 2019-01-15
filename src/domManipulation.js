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

// Adds a canvas sibling for an element
// containing an image. The canvas is
// meant to be used to get the data in
// a readable format to be filtered
// TODO: Use only the global canvas to
// improve perfomance. Workers may be helpful
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

function createCanvas(id) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', id);
    canvas.style.display = 'none';
    return canvas;
}

// Create eye icon
// There is one single icon that is
// positioned accordingly in the
// corresponding element that can be
// displayed at that moment
function createEye(doc) {
    const eye = doc.createElement('div');

    eye.style.display = 'none';
    eye.style.width = eye.style.height = '16px';
    eye.style.position = 'fixed';
    eye.style.zIndex = 1e8;
    eye.style.cursor = 'pointer';
    eye.style.padding = '0';
    eye.style.margin = '0';
    eye.style.opacity = '.5';

    return eye;
}