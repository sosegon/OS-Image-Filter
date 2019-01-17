function Eye(doc) {

    let mDomElement = createEye(doc);

    /**
     * Create eye icon. There is one single icon that is positioned
     * accordingly in the corresponding element that can be displayed at
     * that moment.
     *
     * @param {Document} doc
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

    function getDomElement() {
        return mDomElement;
    }
    /**
     * Position the eye in the top right corner of an image.
     *
     * @param {Element} domElement
     * @param {object} coords
     */
    function position(domElement, coords, doc) {
        mDomElement.style.top = (coords.top < 0 ? 0 : coords.top) + 'px';
        let left = coords.right;
        if (left > doc.documentElement.clientWidth) {
            left = doc.documentElement.clientWidth;
        }
        mDomElement.style.left = (left - 16) + 'px';
    }

    function hide() {
        mDomElement.style.display = 'none';
    }

    function show() {
        mDomElement.style.display = 'block';
    }

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

    function attachTo(domElement) {
        domElement.appendChild(mDomElement);
    }

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