import { isMouseIn } from './domManipulation';
import { HAS_BACKGROUND_IMAGE, ATTR_RECTANGLE } from "./constants";
/**
 * Factory function to handle a list of potential
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|elements}.
 */
export default function Suspects() {

    let mList = [];
    /**
     * Apply a callback to the list of
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|elements}.
     *
     * @param {function} callback
     */
    function applyCallback(callback) {
        mList.map(suspect => {
            callback(suspect);
        });
    }
    /**
     * Add an
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}
     * to the list.
     *
     * @param {Element} domElement
     */
    function addSuspect(domElement) {
        if (mList.indexOf(domElement) === -1) {
            mList.push(domElement);
            domElement[ATTR_RECTANGLE] = domElement.getBoundingClientRect();
        }
    }
    /**
     * Update the bounding rectangles of the
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|elements}
     * in the list.
     */
    function updateSuspectsRectangles() {
        mList.map(suspect => {
            suspect[ATTR_RECTANGLE] = suspect.getBoundingClientRect();
        });
    }
    /**
     * Find the
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|elements}
     * that are under the mouse pointer.
     *
     * @param {Element} defaultElement
     * @param {MouseEvent} mouseEvent
     */
    function findSuspectsUnderMouse(defaultElement, mouseEvent) {
        let foundSize = defaultElement ?
            defaultElement[ATTR_RECTANGLE].width * defaultElement[ATTR_RECTANGLE].height :
            null;

        return mList.filter(suspect => {
            if (suspect === defaultElement) {
                return false;
            }

            const rect = suspect[ATTR_RECTANGLE];
            if (isMouseIn(mouseEvent, rect)) {
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