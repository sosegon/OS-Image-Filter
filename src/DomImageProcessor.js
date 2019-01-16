class DomImageProcessor {
    constructor() {

    }
    processDomImage(domElement) {
        const canvas = this.addCanvasSibling(domElement);
        const uuid = domElement.getAttribute(ATTR_UUID);

        domElement[ATTR_PROCESSED] = true;

        try {
            filterImageElement(canvas, domElement, uuid);
        } catch (err) {
            const self = this;
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

                        self.filterImageElement(canvas_global, this, this.uuid);
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
    processBackgroundImage(domElement, backgroundImage, width, height, uuid) {
        const self = this;
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

                    self.filterBackgroundImageContent(canvasGlobal, this, uuid);
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
    filterBackgroundImageContent(canvas, imgElement, uuid) {
        const { width, height } = imgElement;
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);

        const context = canvas.getContext('2d');
        context.drawImage(imgElement, 0, 0);

        const imageData = context.getImageData(0, 0, width, height);
        const rgbaArray = imageData.data;

        this.filterRgbaArray(rgbaArray);
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
    // TODO: Implement option to remove face features. Convex hull or flooding may work.
    /**
     * Gray skin color out. Pixels that are not human skin may be grayed
     * out; some pixels that are human skin may be skipped.
     *
     * @param {array} rgbaArray
     */
    filterRgbaArray(rgbaArray) {
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
    filterImageElement(canvas, imgElement, uuid) {
        const { width, height } = imgElement;
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);

        const context = canvas.getContext('2d');
        context.drawImage(imgElement, 0, 0);

        const imageData = context.getImageData(0, 0, width, height);
        const rgbaArray = imageData.data;

        this.filterRgbaArray(rgbaArray);
        imageData.data.set(rgbaArray);
        context.putImageData(imageData, 0, 0);
        const urlData = canvas.toDataURL('image/png');

        let images = document.querySelectorAll('[' + ATTR_UUID + ']');
        images = [...images];
        const actualImg = images.filter((img) => {
            return img.getAttribute(ATTR_UUID) === uuid;
        })[0];

        if (actualImg !== undefined) {
            const self = this;
            actualImg.src = urlData;
            actualImg.srcset = '';
            actualImg.onload = () => {
                self.loadProcessed(actualImg);
            }
        }
    }
    /**
     * Set attributes and styles for elements which images have been
     * already processed.
     */
    loadProcessed(domElement) {
        removeCssClass(domElement, CSS_CLASS_HIDE);
        domElement.setAttribute(ATTR_PROCESSED, "true");
        domElement[ATTR_PROCESSED] = true;
        const uuid = domElement.getAttribute(ATTR_UUID);
        const canvas = document.getElementById("#" + uuid + "-canvas");
        if (canvas !== null) {
            canvas.parentNode.removeChild(canvas);
        }

        if (domElement[ATTR_PROCESSED]) { // already processed
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
    addCanvasSibling(domElement) {
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

}