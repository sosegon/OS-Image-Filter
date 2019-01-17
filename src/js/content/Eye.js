/**
 * Factory function to create the
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|eye}
 * that allows to display the original filtered images.
 *
 * @param {Document} doc
 */
function Eye(doc) {

    let mDomElement = createEye(doc);
    /**
     * Create the
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|eye}
     * that is positioned accordingly in elements with filtered images
     * to show the original unfiltered images.
     *
     * @param {Document} doc
     *
     * @returns {Element}
     */
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
    /**
     * Get the
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|eye}
     * to show to original unfiltered images.
     *
     * @returns {Element}
     */
    function getDomElement() {
        return mDomElement;
    }
    /**
     * Position the
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|eye}
     * in the top right corner of an
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
     *
     * @param {Element} domElement
     * @param {object} coords
     * @param {Document} doc
     */
    function position(domElement, coords, doc) {
        mDomElement.style.top = (coords.top < 0 ? 0 : coords.top) + 'px';
        let left = coords.right;
        if (left > doc.documentElement.clientWidth) {
            left = doc.documentElement.clientWidth;
        }
        mDomElement.style.left = (left - 16) + 'px';
    }
    /**
     * Hide the
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|eye}.
     */
    function hide() {
        mDomElement.style.display = 'none';
    }
    /**
     * Show the
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|eye}.
     */
    function show() {
        mDomElement.style.display = 'block';
    }
    /**
     * Set the
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
     * which original unfiltered image might be show.
     *
     * @param {Element} domElement
     * @param {Function} domElementCallback
     * @param {string} eyeCSSUrl
     */
    function setAnchor(domElement, domElementCallback, eyeCSSUrl) {
        mDomElement.style.backgroundImage = eyeCSSUrl;
        mDomElement.onclick = event => {
            event.stopPropagation();
            domElementCallback(domElement);
            // Hide the eye icon and not allow undo option
            // for now.
            // TODO: Implement undo option
            hide();
            // eye.style.backgroundImage = undoCSSUrl;
            // doHoverVisualClearTimer(el, true);
            // eye.onclick = function (e) {
            //     e.stopPropagation();
            //     doElement.call(el);
            //     setupEye();
            //     doHoverVisualClearTimer(el, true);
            // }
        };
    }
    /**
     * Attach the
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|eye}
     * to an
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
     *
     * @param {Element} domElement
     */
    function attachTo(domElement) {
        domElement.appendChild(mDomElement);
    }
    /**
     * Detach the
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|eye}
     * from the current
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}
     * it is currently attached to.
     */
    function detach() {
        if (mDomElement && mDomElement.parentNode) {
            mDomElement.parentNode.removeChild(mDomElement);
        }
    }

    return Object.freeze({
        createEye,
        getDomElement,
        position,
        hide,
        show,
        setAnchor,
        attachTo,
        detach
    });
}