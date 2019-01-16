class MouseController {
    constructor() {
        this.moved = false;
        this.event = null;
        this.element = null;
    }
    watchDocument(doc) {
        doc.addEventListener('mousemove', this.mouseMoveCallback);
    }
    unwatchDocument(doc) {
        doc.removeEventListener('mousemove', this.mouseMoveCallback);
    }
    mouseMoveCallback(event) {
        this.moved = true;
        this.event = event;
    }
    hasElement() {
        return this.element !== null;
    }
    clearElement() {
        this.element = null;
    }
    setElement(domElement) {
        this.element = domElement;
    }
    getElement() {
        return this.element;
    }
    setAttrElement(flag, value) {
        this.element[flag] = value;
    }
    getAttrValueElement(flag) {
        return this.element[flag];
    }
    hasThatElement(domElement) {
        return this.element === domElement;
    }
    move() {
        this.moved = true;
    }
    unmove() {
        this.moved = false;
    }
    hasMoved() {
        return this.moved;
    }
    hasEvent() {
        return this.event !== null;
    }
    getEvent() {
        return this.event;
    }
    setEvent(event) {
        this.event = event;
    }
}