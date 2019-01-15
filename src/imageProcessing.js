// TODO: Implement option to remove face features. Convex hull or flooding may work.
/**
 * Gray skin color out. Pixels that are not human skin may be grayed
 * out; some pixels that are human skin may be skipped.
 *
 * @param {array} rgbaArray
 */
function filterRgbaArray(rgbaArray) {
    for (let i = 0; i < rgbaArray.length; i += 4) {
        rIndex = i
        gIndex = i + 1
        bIndex = i + 2
        aIndex = i + 3

        r = rgbaArray[rIndex];
        g = rgbaArray[gIndex];
        b = rgbaArray[bIndex];

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
        actualImg.onload = loadProcessed;
    }
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
        actualEl[ATTR_PROCESSED] = true;
    }
}
/**
 * Set attributes and styles for elements which images have been
 * already processed.
 */
function loadProcessed() {
    removeCssClass(this, CSS_CLASS_HIDE);
    this.setAttribute(ATTR_PROCESSED, "true");
    this[ATTR_PROCESSED] = true;
    const uuid = this.getAttribute(ATTR_UUID);
    const canvas = document.getElementById("#" + uuid + "-canvas");
    if (canvas !== null) {
        canvas.parentNode.removeChild(canvas);
    }

    if (this[ATTR_PROCESSED]) { // already processed
        // Needed to enable eye icon in image
        doSkifImageBG(this, true);
        //DoImgSrc(this, true);
        return;
    }
}

function doSkifImageBG(el, toggle) {
    if (toggle && !el[ATTR_HAS_BACKGROUND_IMAGE]) {
        // var shade = Math.floor(Math.random() * 8);
        // el.skfShade = shade;
        // AddClass(el, 'skfPatternBgImg skfShade' + shade);
        el[ATTR_HAS_BACKGROUND_IMAGE] = true;
    } else if (!toggle && el[ATTR_HAS_BACKGROUND_IMAGE]) {
        // RemoveClass(el, 'skfPatternBgImg');
        // RemoveClass(el, 'skfShade' + el.skfShade);
        el[ATTR_HAS_BACKGROUND_IMAGE] = false;
    }
}