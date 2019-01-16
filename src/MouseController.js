class MouseController {
    constructor() {
        this.moved = false;
        this.event = null;
        this.element = null;
        this.eye = null;
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
    setEye(eye) {
        this.eye = eye;
    }
    isMouseIn(event, coords) {
        return event.x >= coords.left && event.x < coords.right && event.y >= coords.top && event.y < coords.bottom;
    }
    /**
     * Control when the mouse pointer is over an element.
     *
     * @param {Element} domElement
     * @param {boolean} toggle
     * @param {Event} event
     */
    toggleHover(domElement, toggle, event) {
        const coords = domElement[ATTR_RECTANGLE];

        if (toggle && !domElement[ATTR_HAS_HOVER]) {

            if (this.hasElement() && !this.hasThatElement(domElement)) {

                this.toggleHover(this.element, false);

            }

            this.toggleHoverVisual(domElement, true, coords);
            this.setElement(domElement);
            this.setAttrElement(ATTR_HAS_HOVER, true);

        } else if (!toggle && domElement[ATTR_HAS_HOVER] && (!event || !this.isMouseIn(event, coords))) {

            this.toggleHoverVisual(domElement, false, coords);
            domElement[ATTR_HAS_HOVER] = false;

            if (this.hasThatElement(domElement)) {

                this.clearElement();

            }
        }
    }
    /**
     * Position and display the eye icon ver the image hovered by the
     * mouse pointer.
     *
     * @param {Element} domElement
     * @param {boolean} toggle
     * @param {object} coords
     */
    toggleHoverVisual(domElement, toggle, coords) {
        if (toggle && !domElement[ATTR_HAS_HOVER_VISUAL] && domElement[ATTR_HAS_BACKGROUND_IMAGE]) {

            if (!settings.isNoEye) {

                this.eye.position(domElement, coords, doc);
                this.eye.show();
                this.eye.setAnchor(domElement, showElement, eyeCSSUrl);

            } else {

                addCssClass(domElement, CSS_CLASS_BACKGROUND_LIGHT_PATTERN);

            }

            this.toggleHoverVisualClearTimer(domElement, true);
            domElement[ATTR_HAS_HOVER_VISUAL] = true;

        } else if (!toggle && domElement[ATTR_HAS_HOVER_VISUAL]) {

            if (!settings.isNoEye) {

                this.eye.hide();

            } else {

                removeCssClass(domElement, CSS_CLASS_BACKGROUND_LIGHT_PATTERN);

            }

            this.toggleHoverVisualClearTimer(domElement, false);
            domElement[ATTR_HAS_HOVER_VISUAL] = false;

        }
    }

    toggleHoverVisualClearTimer(domElement, toggle) {
        if (toggle) {
            const self = this;
            this.toggleHoverVisualClearTimer(domElement, false);
            domElement[ATTR_CLEAR_HOVER_VISUAL_TIMER] = setTimeout(() => {
                self.toggleHoverVisual(domElement, false);
            }, 2500);

        } else if (!toggle && domElement[ATTR_CLEAR_HOVER_VISUAL_TIMER]) {

            clearTimeout(domElement[ATTR_CLEAR_HOVER_VISUAL_TIMER]);
            domElement[ATTR_CLEAR_HOVER_VISUAL_TIMER] = null;

        }
    }
    /**
     * Add/remove mouse event listeners.
     *
     * @param {Element} domElement
     * @param {boolean} toggle
     */
    toggleMouseEventListeners(domElement, toggle) {
        const mouseEntered = this.mouseEntered.bind(this);
        const mouseLeft = this.mouseLeft.bind(this);

        handleListeners(domElement, {
            'mouseover': mouseEntered,
            'mouseout': mouseLeft
        }, toggle, ATTR_HAS_MOUSE_LISTENERS);
    }

    /**
     * Keep track in which **IMG** element the mouse is over.
     *
     * @param {Event} event
     */
    mouseEntered(event) {
        this.toggleHover(event.target, true, event);
        event.stopPropagation();
    }

    mouseLeft(event) {
        this.toggleHover(event.target, false, event);
    }
}