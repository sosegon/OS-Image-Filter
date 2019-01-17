function Suspects() {
    let mList = [];

    function applyCallback(callback) {
        mList.map(suspect => {
            callback(suspect);
        });
    }
    /**
     * Add element to the lists of suspects.
     *
     * @param {Element} domElement
     */
    function addSuspect(domElement) {
        if (mList.indexOf(domElement) === -1) {
            mList.push(domElement);
            domElement[ATTR_RECTANGLE] = domElement.getBoundingClientRect();
        }
    }

    function updateSuspectsRectangles() {
        mList.map(suspect => {
            suspect[ATTR_RECTANGLE] = suspect.getBoundingClientRect();
        });
    }

    function findSuspectsUnderMouse(defaultElement, mouseEvent, checkMouseCallback) {
        let foundSize = defaultElement ?
            defaultElement[ATTR_RECTANGLE].width * defaultElement[ATTR_RECTANGLE].height :
            null;

        return mList.filter(suspect => {
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

    return Object.freeze({
        applyCallback,
        addSuspect,
        updateSuspectsRectangles,
        findSuspectsUnderMouse
    });
}