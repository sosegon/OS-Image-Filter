/**
 * Global variables.
 */
let extensionUrl = chrome.extension.getURL(''),
    urlExtensionUrl = 'url("' + extensionUrl,
    blankImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    urlBlankImg = 'url("' + blankImg + '")',
    eyeCSSUrl = 'url(' + extensionUrl + "eye.png" + ')',
    undoCSSUrl = 'url(' + extensionUrl + "undo.png" + ')',
    /**
     * This is the list of elements that can actually hold images.
     * These are the ones that have to be checked.
     */
    tagList = ['IMG', 'DIV', 'SPAN',
        'A', 'UL', 'LI',
        'TD', 'H1', 'H2',
        'H3', 'H4', 'H5',
        'H6', 'I', 'STRONG',
        'B', 'BIG', 'BUTTON',
        'CENTER', 'SECTION', 'TABLE',
        'FIGURE', 'ASIDE', 'HEADER',
        'VIDEO', 'P', 'ARTICLE'
    ],
    tagListCSS = tagList.join(),

    /**
     * Flag that triggers the process of iterating over the entire
     * structure to process the images and add elements like the eye
     * icon.
     */
    contentLoaded = false,
    settings = null,
    quotesRegex = /['"]/g;

/**
 * Detect if the script is being executed within an iframe. It is
 * useful when trying to accomplish something just in the main page
 * e.g. displaying a bar for donations.
 */
function inIframe() {
    try {

        return window.self !== window.top;

    } catch (e) {

        return true;

    }
}

/**
 * Keep track of flag **contentLoaded**. Once the DOM tree is ready we
 * can start to modify it. In this case, we add the canvas element to
 * process images fetched with XHR and the container for the canvas
 * elements to process images fetched directly.
 */
window.addEventListener('DOMContentLoaded', () => {

    document.body.appendChild(createCanvas(CANVAS_GLOBAL_ID));
    document.body.appendChild(createCanvas(CANVAS_CONTAINER_ID));
    contentLoaded = true;

});

/**
 * Get settings to check status of extension.
 */
chrome.runtime.sendMessage({
    r: 'getSettings'
}, (s) => {
    settings = s;
    // If it is active, do the stuff
    if (settings && !settings.isExcluded && !settings.isExcludedForTab && !settings.isPaused && !settings.isPausedForTab) {

        chrome.runtime.sendMessage({
            r: 'setColorIcon',
            toggle: true
        });
        doWin(window, contentLoaded);

    }
});

/**
 * Catches 'Show Images' option from browser actions
 */
chrome.runtime.onMessage.addListener(request => {

    if (request.r === 'showImages') {

        displayer.showImages();

    }
});

const displayer = new ImagesDisplayer();

/**
 * Contain all the logic related to handle the DOM structure and
 * process the images.
 *
 * @param {object} win
 * @param {boolean} winContentLoaded
 */
function doWin(win, winContentLoaded) {
    const suspects = new Suspects();
    const imageProcessor = new DomImageProcessor();
    const eye = new Eye(win.document);
    const mouseController = new MouseController();
    mouseController.setEye(eye);

    let doc = win.document,
        headStyles = {},
        observer = null,
        /**
         * This flag is used to check if the iteration over the
         * structure to find the elements and process the images has
         * started.
         */
        hasStarted = false;

    /**
     * Start, or register start. There is no way to control the order
     * in which the listener for **DOMContentLoaded** and the callback
     * to get the settings from background are executed. This
     * condition is the way to handle that situation. **doWin** is
     * called after receiving the settings from the background.
     * However, at that moment, the listener for **DOMContentLoaded**
     * that sets the flag **contentLoaded** passed here as
     * **winContentLoaded** has been already triggered. In short, the
     * listener was executed first.
     */
    if (winContentLoaded) {

        Start();

    }
    // The callback was executed first
    else {

        win.addEventListener('DOMContentLoaded', Start);

    }

    /**
     * Set some css as soon as possible. These styles are going to be
     * used in the elements containing images, and other additional
     * items added by the chrome extension. The logic is set to repeat
     * every 1ms. At this point we do not know if the DOM tree is
     * ready for manipulation. The variable doc.head is check to see
     * if the styles can be added.
     */
    const pollID = setInterval(function() {
        // Nothing to add. All images will be shown. Stop the
        // iteration.
        if (displayer.isShowAll()) {

            clearInterval(pollID);

        } else if (doc.head) {
            // If process has not started. Make the webpage
            // transparent. That way no images are displayed.
            if (!hasStarted) {

                addHeadStyle(doc, headStyles, 'body', '{opacity: 0 !important; }');

            }

            addHeadStyle(doc, headStyles, 'body ', '{background-image: none !important;}');
            addHeadStyle(doc, headStyles, '.' + CSS_CLASS_HIDE, '{opacity: 0 !important;}');
            addHeadStyle(doc, headStyles, '.' + CSS_CLASS_BACKGROUND_PATTERN, '{ background-repeat: repeat !important;text-indent:0 !important;}'); //text-indent to show alt text
            addHeadStyle(doc, headStyles, '.' + CSS_CLASS_PAYPAL_DONATION, '{left: 0px; bottom: 0px; width: 100%; z-index: 9000; background: #d09327}');

            for (let i = 0; i < 8; i++) {

                addHeadStyle(doc, headStyles, '.' + CSS_CLASS_BACKGROUND_PATTERN + '.' + CSS_CLASS_SHADE + i, '{background-image: ' + (settings.isNoPattern ? 'none' : 'url(' + extensionUrl + "pattern" + i + ".png" + ')') + ' !important; }');
                addHeadStyle(doc, headStyles, '.' + CSS_CLASS_BACKGROUND_PATTERN + '.' + CSS_CLASS_BACKGROUND_LIGHT_PATTERN + '.' + CSS_CLASS_SHADE + i, '{background-image: ' + (settings.isNoPattern ? 'none' : 'url(' + extensionUrl + "pattern-light" + i + ".png" + ')') + ' !important; }');

            }

            clearInterval(pollID);
        }
    }, 1);

    //ALT-a, ALT-z
    mouseController.watchDocument(doc);
    doc.addEventListener('keydown', docKeyDown);
    win.addEventListener('scroll', windowScroll);

    win.skfShowImages = () => {
        mouseController.unwatchDocument(doc);
        doc.removeEventListener('keydown', docKeyDown);
        win.removeEventListener('scroll', windowScroll);
        suspects.applyCallback(showElement);

        win.removeEventListener('DOMContentLoaded', Start);

        for (let s in headStyles) {

            removeHeadStyle(doc, headStyles, s);

        }

        if (mouseController.hasElement()) {

            mouseController.toggleHover(mouseController.getElement(), false);
            mouseController.clearElement();

        }

        if (eye.getDomElement()) {

            for (let i = 0, bodyChildren = doc.body.children; i < bodyChildren.length; i++) { //for some reason, sometimes the eye is removed before

                if (bodyChildren[i] === eye.getDomElement()) {

                    doc.body.removeChild(eye.getDomElement());

                }
            }
        }

        if (observer) {

            observer.disconnect();

        }
    }

    function windowScroll() {
        mouseController.move();
        suspects.updateSuspectsRectangles();
        checkMousePosition();
    }

    function docKeyDown(event) {
        if (event.altKey && event.keyCode == 80 && !settings.isPaused) { //ALT-p

            settings.isPaused = true;
            chrome.runtime.sendMessage({ r: 'pause', toggle: true });
            displayer.showImages();

        } else if (mouseController.hasElement() && event.altKey) {

            if (event.keyCode == 65 && mouseController.getAttrValueElement(ATTR_HAS_BACKGROUND_IMAGE)) { //ALT-a

                showElement(mouseController.getElement());
                eye.hide();

            } else if (event.keyCode == 90 && !mouseController.getAttrValueElement(ATTR_HAS_BACKGROUND_IMAGE)) { //ALT-z

                doElement.call(mouseController.getElement());
                eye.hide();

            }
        }
    }

    /**
     * Keep track in which **IMG** element the mouse is over.
     *
     * @param {Event} event
     */
    function mouseEntered(event) {

        mouseController.toggleHover(this, true, event);
        event.stopPropagation();

    }

    function mouseLeft(event) {

        mouseController.toggleHover(this, false, event);

    }

    /**
     * Start the process to filter images.
     */
    function Start() {
        // With iFrames it happens.
        if (!doc.body) {

            return;

        }

        // Do not hide an image opened in the browser. The user
        // actually WANTS to see it.
        if (win == top &&
            doc.body.children.length == 1 &&
            doc.body.children[0].tagName == 'IMG') {

            displayer.showImages();
            return;

        }


        // Filter any image in the body. Here the image can be a
        // background set in a css style.
        doElements(doc.body, false);

        // Once body has been done, show it.
        if (headStyles['body']) {

            removeHeadStyle(doc, headStyles, 'body');

        }

        eye.attachTo(doc.body);

        // Create temporary div, to eager load background img light
        // for noEye to avoid flicker.
        if (settings.isNoEye) {

            for (let i = 0; i < 8; i++) {

                const div = doc.createElement('div');
                div.style.opacity = div.style.width = div.style.height = 0;
                div.className = CSS_CLASS_BACKGROUND_PATTERN + ' ' + CSS_CLASS_BACKGROUND_LIGHT_PATTERN + ' ' + CSS_CLASS_SHADE + i;
                doc.body.appendChild(div);

            }

        }

        // Mutation observer checks when a change in the DOM tree has
        // occured.
        observer = new WebKitMutationObserver((mutations, observer) => {

            mutations.map(m => {
                // This is for changes in the nodes already in the DOM
                // tree.
                if (m.type == 'attributes') {

                    if (m.attributeName == 'class') {

                        const oldHasLazy = m.oldValue != null && m.oldValue.indexOf('lazy') > -1;
                        const newHasLazy = m.target.className != null && m.target.className.indexOf('lazy') > -1;

                        if (oldHasLazy != newHasLazy) {

                            doElements(m.target, true);

                        }

                    } else if (m.attributeName == 'style' && m.target.style.backgroundImage.indexOf('url(') > -1) {

                        let oldBgImg, oldBgImgMatch;
                        if (m.oldValue == null || !(oldBgImgMatch = /background(?:-image)?:[^;]*url\(['"]?(.+?)['"]?\)/.exec(m.oldValue))) {

                            oldBgImg = '';

                        } else {

                            oldBgImg = oldBgImgMatch[1];

                        }
                        if (oldBgImg != /url\(['"]?(.+?)['"]?\)/.exec(m.target.style.backgroundImage)[1]) {

                            doElement.call(m.target);

                        }
                    }
                }
                // When new nodes have been added.
                else if (m.addedNodes != null && m.addedNodes.length > 0) {

                    m.addedNodes.forEach(domElement => {

                        if (domElement.tagName && domElement.tagName === 'IFRAME') {

                            doIframe(domElement);

                        } else if (domElement.tagName && domElement.tagName !== 'CANVAS') {

                            doElements(domElement, true);

                        }
                    });
                }
            });
        });
        observer.observe(doc, { subtree: true, childList: true, attributes: true, attributeOldValue: true });

        // checkMousePosition every so often. This is to update the
        // positon of the eye when the mouse pointer is over an image.
        setInterval(checkMousePosition, 250);

        // Update the bounding boxes for every element with an image.
        setInterval(() => {
            suspects.updateSuspectsRectangles()
        }, 3000);

        // This is likely to be set based on an average time for a web
        // page to be loaded.
        // TODO: Improve this
        for (let i = 1; i < 7; i++) {

            if ((i % 2) > 0) {

                setTimeout(() => {
                    suspects.updateSuspectsRectangles()
                }, i * 1500);

            }
        }

        // At this point, the frame elements are already in the DOM
        // tree, but their content may not have been loaded.
        const iframes = doc.getElementsByTagName('iframe');
        Array.from(iframes).map(iframe => {
            doIframe(iframe);
        });

        // Now the process has officially started.
        hasStarted = true;
    }

    /**
     * Get an element to star the process.
     *
     * @param {Element} domElement
     * @param {boolean} includeChildren
     */
    function doElements(domElement, includeChildren) {

        if (includeChildren && tagList.indexOf(domElement.tagName) > -1) {

            doElement.call(domElement);

        }

        domElement.querySelectorAll(tagListCSS).forEach(domElement => {
            doElement.call(domElement);
        });
    }

    /**
     * Do the process over an iframe. An iframe contains another
     * webpage embedded in the main one.
     *
     * @param {HTMLIFrameElement} iframe
     */
    function doIframe(iframe) {

        if (iframe.src && iframe.src != "about:blank" && iframe.src.substr(0, 11) != 'javascript:') {

            return;

        }

        displayer.addIFrame(iframe);

        const win = iframe.contentWindow;
        if (!win) {

            return; //with iFrames it happens.

        }

        // Similar to the main page. The logic is set to be executed
        // until the iframe is ready to be processed.
        let pollNum = 0;
        const pollID = setInterval(() => {
            if (doc.body) {

                clearInterval(pollID);
                doWin(win, true);

            }

            if (++pollNum == 500) {

                clearInterval(pollID);

            }
        }, 10);
    }

    function processImage() {

        imageProcessor.processDomImage(this);
        imageProcessor.handleLoadProcessImageListener(this, processImage, false);
        imageProcessor.handleLoadEventListener(this, doElement, false);

    }
    /**
     * Analyse an element to proceed to process its image if it has
     * one.
     */
    function doElement() {
        // No need to do anything when all the images are going to be
        // displayed.
        if (displayer.isShowAll()) {

            return;

        }

        if (this.tagName == 'IMG') {
            // this.crossOrigin = "Anonymous"; // To process images from other domains

            /**
             * wiz-to-process class does not exist. It is just a
             * workaround to avoid setting an wiz-uuid in an element
             * that already has one and it is also in the lists of
             * suspects. This is due to the fact that this function is
             * executed more than once over the same element.
             */
            if (!this.classList.contains('wiz-to-process')) {

                addRandomWizUuid(this);
                addCssClass(this, "wiz-to-process");
                suspects.addSuspect(this);

            }

            /**
             * Attach load event need for the following:
             *
             * 1) As we need to catch it after, it is switched for the
             * base64 image.
             *
             * 2) In case the img gets changed to something else later
             */
            imageProcessor.handleLoadProcessImageListener(this, processImage, true);
            imageProcessor.handleLoadEventListener(this, doElement, true);

            // See if not yet loaded
            if (!this.complete) {

                // Hide, to avoid flash until load event is handled.
                displayer.hideElement(this, true);
                return;

            }

            const { width, height } = this;

            // It was successfully replace.
            // TODO: Check this because it comes from the original
            // extension.
            if (this.src == blankImg) {

                displayer.hideElement(this, false);
                imageProcessor.handleBackgroundForElement(this, true);
                this[ATTR_IS_BLOCKED] = true;

            }

            // An image greater than the dimensions in settings needs
            // to be filtered. We need to catch 0 too, as sometimes
            // images start off as zero.
            else if ((width == 0 || width > settings.maxSafe) && (height == 0 || height > settings.maxSafe)) {

                doMouseEventListeners(this, true);

                if (!this[ATTR_HAS_TITLE_AND_SIZE]) {
                    // this.style.width = elWidth + 'px';
                    // this.style.height = elHeight + 'px';
                    if (!this.title) {

                        if (this.alt) {

                            this.title = this.alt;

                        } else {

                            this.src.match(/([-\w]+)(\.[\w]+)?$/i);
                            this.title = RegExp.$1;

                        }
                    }

                    this[ATTR_HAS_TITLE_AND_SIZE] = true;
                }

                displayer.hideElement(this, true);
                displayer.handleSourceOfImage(this, true);

                if (this.parentElement && this.parentElement.tagName == 'PICTURE') {

                    this.parentElement.childNodes.forEach(node => {
                        if (node.tagName == 'SOURCE') {

                            displayer.handleSourceOfImage(node, true);

                        }
                    });
                }
                //this.src = blankImg;
            }
            // Small images are simply hidden.
            // TODO: Add a rule in the settings to let the user know
            // that this happens.
            else {

                displayer.hideElement(this, false);

            }
            // TODO: Uncomment this when the logic for video is
            // implemented.
            // else if (this.tagName == 'VIDEO') {
            //     addAsSuspect(this);
            //     displayer.hideElement(this, true);
            //     imageProcessor.handleBackgroundForElement(this, true);
            // }

        } else {
            // Here the images are added in the styles as backgrounds.
            const compStyle = getComputedStyle(this),
                bgImg = compStyle['background-image'],
                width = parseInt(compStyle['width']) || this.clientWidth,
                height = parseInt(compStyle['height']) || this.clientHeight; //as per https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle, getComputedStyle will return the 'used values' for width and height, which is always in px. We also use clientXXX, since sometimes compStyle returns NaN.

            // Image greater than the dimensions in the settings needs
            // to be filtered. We need to catch 0 too, as sometimes
            // images start off as zero.
            if (bgImg != 'none' && (width == 0 || width > settings.maxSafe) && (height == 0 || height > settings.maxSafe) &&
                bgImg.indexOf('url(') != -1 &&
                !bgImg.startsWith(urlExtensionUrl) && bgImg != urlBlankImg &&
                !this[ATTR_PROCESSED]
            ) {
                // Used to fetch image with xhr.
                const bgImgUrl = bgImg.slice(5, -2);
                // Avoids quick display of original image
                this.style.backgroundImage = "url('')";
                // Reference for the element once the image is
                // processed.
                addRandomWizUuid(this);
                const uuid = this.getAttribute(ATTR_UUID);
                imageProcessor.processBackgroundImage(this, bgImgUrl, width, height, uuid);

                suspects.addSuspect(this);
                imageProcessor.handleBackgroundForElement(this, true);
                doMouseEventListeners(this, true);

                if (this[ATTR_LAST_CHECKED_SRC] != bgImg) {

                    this[ATTR_LAST_CHECKED_SRC] = bgImg;

                    const image = new Image();
                    image.owner = this;
                    image.onload = () => {
                        const { height, width } = this;

                        if (height <= settings.maxSafe || width <= settings.maxSafe) {

                            showElement(this.owner);

                        }
                        this.onload = null;
                    };

                    const urlMatch = /\burl\(["']?(.*?)["']?\)/.exec(bgImg);

                    if (urlMatch) {

                        image.src = urlMatch[1];

                    }
                }

                this[ATTR_IS_BLOCKED] = true;

            }
        }
    }
    /**
     * Add/remove mouse event listeners.
     *
     * @param {Element} domElement
     * @param {boolean} toggle
     */
    function doMouseEventListeners(domElement, toggle) {

        handleListeners(domElement, {
            'mouseover': mouseEntered,
            'mouseout': mouseLeft
        }, toggle, ATTR_HAS_MOUSE_LISTENERS);

    }

    function checkMousePosition() {
        if (!mouseController.hasMoved() ||
            !mouseController.hasEvent() ||
            !contentLoaded ||
            displayer.isShowAll()) {
            return;
        }

        mouseController.unmove();

        // See if needs to defocus current.
        if (mouseController.hasElement()) {
            const coords = mouseController.getAttrValueElement(ATTR_RECTANGLE);

            if (!isMouseIn(mouseController.getEvent(), coords)) {

                mouseController.toggleHover(mouseController.getElement(), false);

            } else if (mouseController.getAttrValueElement(ATTR_HAS_BACKGROUND_IMAGE)) {

                if (!mouseController.getAttrValueElement(ATTR_HAS_HOVER_VISUAL)) {

                    mouseController.toggleHoverVisual(mouseController.getElement(), true, coords);

                } else {

                    mouseController.toggleHoverVisualClearTimer(mouseController.getElement(), true);
                    eye.position(mouseController.getElement(), coords, doc);

                }
            }
        }
        // Find element under mouse.
        let foundElement = mouseController.getElement();
        let found = false;

        const foundElements = suspects.findSuspectsUnderMouse(
            mouseController.getElement(), mouseController.getEvent(), isMouseIn);

        if (foundElements.length > 0) {

            found = true;
            foundElement = foundElements[foundElements.length - 1];

        }

        if (found && (foundElement[ATTR_HAS_BACKGROUND_IMAGE] || mouseController.hasElement())) {

            mouseController.toggleHover(foundElement, true);

        }
    }

    function isMouseIn(event, coords) {
        return event.x >= coords.left && event.x < coords.right && event.y >= coords.top && event.y < coords.bottom;
    }

    function showElement(domElement) {
        // Unhide element
        displayer.hideElement(domElement, false);

        if (domElement.tagName === 'IMG') {
            // Remove callback for 'load'.
            imageProcessor.handleLoadEventListener(domElement, doElement, false);

            // Swap the src and srcset attributes of element.
            displayer.handleSourceOfImage(domElement, false);

            // Do the same for source tags if picture is used
            if (domElement.parentElement && domElement.parentElement.tagName === 'PICTURE') {

                domElement.parentElement.childNodes.forEach(node => {

                    if (node.tagName === 'SOURCE') {

                        displayer.handleSourceOfImage(node, false);

                    }

                });
            }
        }

        imageProcessor.handleBackgroundForElement(domElement, false);

        if (displayer.isShowAll()) {

            doMouseEventListeners(domElement, false);

        }
    }

    function addRandomWizUuid(domElement) {

        if (domElement.getAttribute(ATTR_UUID) === null) {

            domElement.setAttribute(ATTR_UUID, guid());

        }
    }
    /**
     * Generate a uuid number.
     *
     * @returns {number}
     */
    function guid() {
        // See https://stackoverflow.com/a/105074/1065981
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
}