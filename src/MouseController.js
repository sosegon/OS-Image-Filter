function MouseController() {
    let mMoved = false;
    let mEvent = null;
    let mElement = null;

    function watchDocument(doc) {
        doc.addEventListener('mousemove', mouseMoveCallback);
    }

    function unwatchDocument(doc) {
        doc.removeEventListener('mousemove', mouseMoveCallback);
    }

    function mouseMoveCallback(event) {
        mMoved = true;
        mEvent = event;
    }

    function hasElement() {
        return mElement !== null;
    }

    function clearElement() {
        mElement = null;
    }

    function setElement(domElement) {
        mElement = domElement;
    }

    function getElement() {
        return mElement;
    }

    function setAttrElement(flag, value) {
        mElement[flag] = value;
    }

    function getAttrValueElement(flag) {
        return mElement[flag];
    }

    function hasThatElement(domElement) {
        return mElement === domElement;
    }

    function move() {
        mMoved = true;
    }

    function unmove() {
        mMoved = false;
    }

    function hasMoved() {
        mMoved;
    }

    function hasEvent() {
        mEvent !== null;
    }

    function getEvent() {
        mEvent;
    }

    return Object.freeze({
        watchDocument,
        unwatchDocument,
        mouseMoveCallback,
        hasElement,
        clearElement,
        setElement,
        getEvent,
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