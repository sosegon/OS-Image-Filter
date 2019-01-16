class ImagesDisplayer {
    constructor() {
        this.showAll = false;
        this.iframes = [];
    }
    setShowAll(show) {
        this.showAll = show;
    }
    isShowAll() {
        return this.showAll;
    }
    addIFrame(iframe) {
        this.iframes.push(iframe);
    }
    /**
     * Display images in webpage and iframes
     */
    showImages() {
        if (this.showAll) {
            return;
        }

        this.showAll = true;

        if (window === top) {
            chrome.runtime.sendMessage({
                r: 'setColorIcon',
                toggle: false
            });
        }

        if (window.skfShowImages !== null) {
            window.skfShowImages();
        }

        this.iframes.map(iframe => {
            try {
                if (iframe.contentWindow && iframe.contentWindow.skfShowImages) {
                    iframe.contentWindow.skfShowImages();
                }

            } catch (err) {

            }
        });
    }
    /**
     * Store the original src of the image.
     *
     * @param {HTMLImageElement} domElement
     * @param {boolean} toggle
     */
    handleSourceOfImage(domElement, toggle) {
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
    /**
     * Hide element.
     *
     * @param {Element} domElement
     * @param {boolean} toggle
     */
    hideElement(domElement, toggle) {
        handleStyleClasses(domElement, [CSS_CLASS_HIDE], toggle, ATTR_IS_HID);
    }
}