class Suspects {
    constructor() {
        this.list = [];
    }
    applyCallback(callback) {
        this.list.map(suspect => {
            callback(suspect);
        });
    }
    /**
     * Add element to the lists of suspects.
     *
     * @param {Element} domElement
     */
    addSuspect(domElement) {
        if (this.list.indexOf(domElement) === -1) {
            this.list.push(domElement);
            domElement[ATTR_RECTANGLE] = domElement.getBoundingClientRect();
        }
    }
    updateSuspectsRectangles() {
        this.list.map(suspect => {
            suspect[ATTR_RECTANGLE] = suspect.getBoundingClientRect();
        });
    }
    findSuspectsUnderMouse(defaultElement, mouseEvent, checkMouseCallback) {
        let foundSize = defaultElement ?
            defaultElement[ATTR_RECTANGLE].width * defaultElement[ATTR_RECTANGLE].height :
            null;

        return this.list.filter(suspect => {
            if (suspect === defaultElement) {
                return false;
            }

            const rect = suspect[ATTR_RECTANGLE];
            if (checkMouseCallback(mouseEvent, rect)) {
                let isValid = false;
                if (!defaultElement) {
                    isValid = true;
                } else if (!defaultElement[HAS_BACKGROUND_IMAGE] &&
                    suspect[HAS_BACKGROUND_IMAGE]) {
                    isValid = true;
                } else if ((foundSize > rect.width * rect.height) &&
                    defaultElement[HAS_BACKGROUND_IMAGE] === suspect[HAS_BACKGROUND_IMAGE]) {
                    isValid = true;
                }
                if (isValid) {
                    foundSize = rect.width * rect.height;
                }
            }

            return false;
        });
    }
}