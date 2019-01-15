class Eye {
    constructor(doc) {
        this.domElement = this.createEye(doc);
    }
    /**
     * Create eye icon. There is one single icon that is positioned
     * accordingly in the corresponding element that can be displayed at
     * that moment.
     *
     * @param {Document} doc
     */
    createEye(doc) {
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
    getDomElement() {
        return this.domElement;
    }
    /**
     * Position the eye in the top right corner of an image.
     *
     * @param {Element} domElement
     * @param {object} coords
     */
    position(domElement, coords, doc) {
        this.domElement.style.top = (coords.top < 0 ? 0 : coords.top) + 'px';
        let left = coords.right;
        if (left > doc.documentElement.clientWidth) {
            left = doc.documentElement.clientWidth;
        }
        this.domElement.style.left = (left - 16) + 'px';
    }
    hide() {
    	this.domElement.style.display = 'none';
    }
    show() {
    	this.domElement.style.display = 'block';
    }
}