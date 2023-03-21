/**
 * Factory function to handle the movement of a mouse.
 */
export default function MouseController() {
    let mMoved = false;
    let mEvent = null;
    let mElement = null;
    /**
     * Watch the movement of the mouse in a
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Document|document}.
     *
     * @param {Document} doc
     */
    function watchDocument(doc) {
        doc.addEventListener('mousemove', mouseMoveCallback);
    }
    /**
     * Unwatch the movement of the mouse in a
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Document|document}.
     *
     * @param {Document} doc
     */
    function unwatchDocument(doc) {
        doc.removeEventListener('mousemove', mouseMoveCallback);
    }
    /*
     * Interal use
     */
    function mouseMoveCallback(event) {
        mMoved = true;
        mEvent = event;
    }
    /**
     * Determine if the local
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}
     * has been set.
     *
     * @returns {boolean}
     */
    function hasElement() {
        return mElement !== null;
    }
    /**
     * Reset the local
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
     */
    function clearElement() {
        mElement = null;
    }
    /**
     * Set the local
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
     *
     * @param {Element} domElement
     */
    function setElement(domElement) {
        mElement = domElement;
    }
    /**
     * Get the local
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
     *
     * @returns {Element}
     */
    function getElement() {
        return mElement;
    }
    /**
     * Set an attribute in the local
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
     *
     * @param {string} name
     * @param {string} value
     */
    function setAttrElement(name, value) {
        mElement[name] = value;
    }
    /**
     * Get an attribute's value in the local
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
     *
     * @param {string} name
     *
     * @returns value
     */
    function getAttrValueElement(name) {
        return mElement[name];
    }
    /**
     * Determine if the local
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}
     * is the same passed in the argument
     *
     * @returns {boolean}
     */
    function hasThatElement(domElement) {
        return mElement === domElement;
    }
    /**
     * Set the local flag to determine that the mouse has moved.
     */
    function move() {
        mMoved = true;
    }
    /**
     * Set the local flag to determine that the mouse has not moved.
     */
    function unmove() {
        mMoved = false;
    }
    /**
     * Get the local flag to determine that the mouse has moved.
     *
     * @returns {boolean}
     */
    function hasMoved() {
        mMoved;
    }
    /**
     * Determine if the local
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent|mouse event}
     * is set.
     */
    function hasEvent() {
        mEvent !== null;
    }
    /**
     * Get the local
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent|mouse event}
     *
     * @returns {MouseEvent}
     */
    function getEvent() {
        mEvent;
    }

    return Object.freeze({
        watchDocument,
        unwatchDocument,
        hasElement,
        clearElement,
        setElement,
        getElement,
        setAttrElement,
        getAttrValueElement,
        hasThatElement,
        move,
        unmove,
        hasMoved,
        hasEvent,
        getEvent
    });
}