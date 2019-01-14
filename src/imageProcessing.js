// TODO: Implement option to remove face features. Convex hull or flooding may work.
// Grays out the filter corresponding to
// skin color. Does not make any other
// discrimination. Pixels that are not
// human skin may be grayed out; some
// pixels that are human skin may be
// skipped.
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
// Gets an IMG and a canvas to process the
// image of the former one
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

    const actualImg = $("img[" + ATTR_UUID + "=" + uuid + "]")[0];
    if (actualImg !== undefined) {
        actualImg.src = urlData;
        actualImg.srcset = '';
        actualImg.onload = LoadProcessed;
    }
}

// Gets an IMG and a canvas to process the
// image in the style of the former one
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

    const actualEl = $("[" + ATTR_UUID + "=" + uuid + "]")[0];
    if (actualEl !== undefined) {
        $(actualEl).css("background-image", newBkgImgUrl);
        actualEl[ATTR_PROCESSED] = true;
    }
}

// Sets attributes and styles for elements
// which images have been already processed
function LoadProcessed() {
    $(this).removeClass(CSS_CLASS_HIDE);
    $(this).attr(ATTR_PROCESSED, "true");
    this[ATTR_PROCESSED] = true;
    const uuid = $(this).attr(ATTR_UUID);
    $("#" + uuid + "-canvas").remove();

    if (this[ATTR_PROCESSED]) { // already processed
        DoSkifImageBG(this, true); // Needed to enable eye icon in image
        //DoImgSrc(this, true);
        return;
    }
}

function DoSkifImageBG(el, toggle) {
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