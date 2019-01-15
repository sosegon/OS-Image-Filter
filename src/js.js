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
    let doc = win.document,
        headStyles = {},
        observer = null,
        eye = null,
        mouseMoved = false,
        mouseEvent = null,
        mouseOverEl = null,
        elList = [],
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
    doc.addEventListener('keydown', docKeyDown);
    doc.addEventListener('mousemove', docMouseMove);
    win.addEventListener('scroll', windowScroll);

    win.skfShowImages = () => {
        doc.removeEventListener('keydown', docKeyDown);
        doc.removeEventListener('mousemove', docMouseMove);
        win.removeEventListener('scroll', windowScroll);
        for (let i = 0, max = elList.length; i < max; i++) {
            showElement(elList[i]);
        }
        win.removeEventListener('DOMContentLoaded', Start);
        for (let s in headStyles) {
            removeHeadStyle(doc, headStyles, s);
        }
        if (mouseOverEl) {
            doHover(mouseOverEl, false);
            mouseOverEl = null;
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

    /**
     * Set **mouseEvent** object and **mouseMoved** flag.
     *
     * @param {Event} event
     */
    function docMouseMove(event) {
        mouseEvent = event;
        mouseMoved = true;
    };

    function windowScroll() {
        mouseMoved = true;
        updateElementRectangles();
        checkMousePosition();
    }

    function docKeyDown(event) {
        if (event.altKey && event.keyCode == 80 && !settings.isPaused) { //ALT-p
            settings.isPaused = true;
            chrome.runtime.sendMessage({ r: 'pause', toggle: true });
            displayer.showImages();
        } else if (mouseOverEl && event.altKey) {
            if (event.keyCode == 65 && mouseOverEl[ATTR_HAS_BACKGROUND_IMAGE]) { //ALT-a
                showElement(mouseOverEl);
                eye.getDomElement().style.display = 'none';
            } else if (event.keyCode == 90 && !mouseOverEl[ATTR_HAS_BACKGROUND_IMAGE]) { //ALT-z
                doElement.call(mouseOverEl);
                eye.getDomElement().style.display = 'none';
            }
        }
    }

    /**
     * Keep track in which **IMG** element the mouse is over.
     *
     * @param {Event} event
     */
    function mouseEntered(event) {
        doHover(this, true, event);
        event.stopPropagation();
    }

    function mouseLeft(event) {
        doHover(this, false, event);
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

        eye = new Eye(doc);
        doc.body.appendChild(eye.getDomElement());

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
        observer = new WebKitMutationObserver(function(mutations, observer) {
            for (let i = 0; i < mutations.length; i++) {
                const m = mutations[i];
                // This is for changes in the nodes already in the DOM
                // tree.
                if (m.type == 'attributes') {
                    if (m.attributeName == 'class') {
                        const oldHasLazy = m.oldValue != null && m.oldValue.indexOf('lazy') > -1,
                            newHasLazy = m.target.className != null && m.target.className.indexOf('lazy') > -1;
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
                    for (let j = 0; j < m.addedNodes.length; j++) {
                        const domElement = m.addedNodes[j];
                        if (!domElement.tagName) { //eg text nodes
                            continue;
                        }
                        if (domElement.tagName == 'CANVAS') {
                            continue;
                        }
                        if (domElement.tagName == 'IFRAME') {
                            doIframe(domElement);
                        } else {
                            doElements(domElement, true);
                        }
                    }
                }
            }
        });
        observer.observe(doc, { subtree: true, childList: true, attributes: true, attributeOldValue: true });

        // checkMousePosition every so often. This is to update the
        // positon of the eye when the mouse pointer is over an image.
        setInterval(checkMousePosition, 250);

        // Update the bounding boxes for every element with an image.
        setInterval(updateElementRectangles, 3000);

        // This is likely to be set based on an average time for a web
        // page to be loaded.
        // TODO: Improve this
        for (let i = 1; i < 7; i++) {
            if ((i % 2) > 0) {
                setTimeout(updateElementRectangles, i * 1500);
            }
        }

        // At this point, the frame elements are already in the DOM
        // tree, but their content may not have been loaded.
        const iframes = doc.getElementsByTagName('iframe');
        for (let i = 0, max = iframes.length; i < max; i++) {
            doIframe(iframes[i]);
        }

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
        const all = domElement.querySelectorAll(tagListCSS);
        for (let i = 0, max = all.length; i < max; i++) {
            doElement.call(all[i]);
        }
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
        const pollNum = 0,
            pollID = setInterval(() => {
                if (doc.body) {
                    clearInterval(pollID);
                    doWin(win, true);
                }
                if (++pollNum == 500) {
                    clearInterval(pollID);
                }
            }, 10);
    }

    /**
     * Add a sibling canvas for the corresponding IMG element. Then,
     * it tries to filter the content of the image by directly
     * getting the data from the canvas. If that fails, it retrieves
     * the data of the image with an XHR and passes processes the
     * result.
     */
    function processImage() {
        const canvas = addCanvasSibling(this);
        if (canvas) {
            this[ATTR_PROCESSED] = true;
            const uuid = this.getAttribute(ATTR_UUID)
            try {
                filterImageElement(canvas, this, uuid);
            } catch (err) {
                const xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    const reader = new FileReader();
                    reader.uuid = uuid;
                    reader.onloadend = function() {
                        const image = new Image();
                        image.crossOrigin = "anonymous";
                        image.src = reader.result;
                        image.uuid = this.uuid;
                        image.onload = function() {
                            const { width, height } = this;

                            const canvas_global = document.getElementById(CANVAS_GLOBAL_ID);
                            canvas_global.setAttribute("width", width);
                            canvas_global.setAttribute("height", height);

                            filterImageElement(canvas_global, this, this.uuid);
                        };
                    }
                    reader.readAsDataURL(xhr.response);
                };
                xhr.open("GET", this.src);
                xhr.responseType = "blob";
                xhr.send();
            }

            doLoadProcessImageListener(this, false);
            doLoadEventListener(this, false);
        }
    }
    /**
     * Process the image of an element passed in its style. Since the
     * image is in the style, it is referenced with an url. The url is
     * used to retrieve the image with an XHR object. It uses the
     * global canvas to filter the image.
     *
     * @param {Element} domElement
     * @param {ImageBitmap} backgrounfImage
     * @param {number} width
     * @param {number} height
     * @param {string} uuid
     */
    function processBackgroundImage(domElement, backgroundImage, width, height, uuid) {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
            const reader = new FileReader();
            reader.uuid = uuid;
            reader.onloadend = function() {
                const image = new Image();
                image.crossOrigin = "anonymous";
                image.src = reader.result;
                image.uuid = this.uuid;
                image.onload = function() {

                    const canvasGlobal = document.getElementById(CANVAS_GLOBAL_ID);
                    canvasGlobal.setAttribute("width", width);
                    canvasGlobal.setAttribute("height", height);

                    filterBackgroundImageContent(canvasGlobal, this, uuid);
                };
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open("GET", backgroundImage);
        xhr.responseType = "blob";
        xhr.send();
    }

    /**
     * Add or remove the listener for a **load** event in an IMG
     * element.
     *
     * @param {HTMLImageElement} domElement
     * @param {boolean} toggle
     */
    function doLoadProcessImageListener(domElement, toggle) {
        handleListeners(domElement, {
            'load': processImage
        }, toggle, ATTR_HAS_PROCESS_IMAGE_LISTENER);
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
                addAsSuspect(this);
            }

            /**
             * Attach load event need for the following:
             *
             * 1) As we need to catch it after, it is switched for the
             * base64 image.
             *
             * 2) In case the img gets changed to something else later
             */
            doLoadProcessImageListener(this, true);
            doLoadEventListener(this, true);

            // See if not yet loaded
            if (!this.complete) {

                // Hide, to avoid flash until load event is handled.
                doHidden(this, true);
                return;
            }

            const { width, height } = this;

            // It was successfully replace.
            // TODO: Check this because it comes from the original
            // extension.
            if (this.src == blankImg) {
                doHidden(this, false);
                doSkifImageBG(this, true);
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
                doHidden(this, true);
                doImgSrc(this, true);
                if (this.parentElement && this.parentElement.tagName == 'PICTURE') {
                    for (let i = 0; i < this.parentElement.childNodes.length; i++) {
                        const node = this.parentElement.childNodes[i];
                        if (node.tagName == 'SOURCE') {
                            doImgSrc(node, true);
                        }
                    }
                }
                //this.src = blankImg;
            }
            // Small images are simply hidden.
            // TODO: Add a rule in the settings to let the user know
            // that this happens.
            else {
                doHidden(this, false);
            }
            // TODO: Uncomment this when the logic for video is
            // implemented.
            // else if (this.tagName == 'VIDEO') {
            //     addAsSuspect(this);
            //     doHidden(this, true);
            //     doSkifImageBG(this, true);
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
                processBackgroundImage(this, bgImgUrl, width, height, uuid);

                addAsSuspect(this);
                doSkifImageBG(this, true);
                doMouseEventListeners(this, true);
                if (this[ATTR_LAST_CHECKED_SRC] != bgImg) {
                    this[ATTR_LAST_CHECKED_SRC] = bgImg;
                    const image = new Image();
                    image.owner = this;
                    image.onload = checkBackgroundImage;
                    const urlMatch = /\burl\(["']?(.*?)["']?\)/.exec(bgImg);
                    if (urlMatch) {
                        image.src = urlMatch[1];
                    }
                }
                this[ATTR_IS_BLOCKED] = true;
            }
        }
    }

    function checkBackgroundImage() {
        const { height, width } = this;
        if (height <= settings.maxSafe || width <= settings.maxSafe) {
            showElement(this.owner);
        }
        this.onload = null;
    };
    /**
     * Add element to the lists of suspects.
     *
     * @param {Element} domElement
     */
    function addAsSuspect(domElement) {
        if (elList.indexOf(domElement) == -1) {
            elList.push(domElement);
            domElement[ATTR_RECTANGLE] = domElement.getBoundingClientRect();
        }
    }

    /**
     * Store the original src of the image.
     *
     * @param {HTMLImageElement} domElement
     * @param {boolean} toggle
     */
    function doImgSrc(domElement, toggle) {
        if (toggle && !domElement.getAttribute(ATTR_ALREADY_TOGGLED)) {
            domElement.oldsrc = domElement.src;
            domElement.oldsrcset = domElement.srcset;
            // Do not set to empty string, otherwise the processing
            // will result in an empty image
            // el.src = el.srcset = '';

            // Empty string to make sure filtered images are displayed
            // in the img elements
            domElement.srcset = '';
            domElement.setAttribute(ATTR_ALREADY_TOGGLED, 'true');
        } else if (!toggle && domElement.getAttribute(ATTR_ALREADY_TOGGLED) === 'true') {
            const oldsrc = domElement.oldsrc;
            domElement.oldsrc = domElement.src;
            domElement.src = oldsrc;
            domElement.srcset = domElement.oldsrcset;
        }
    }
    /**
     * Hide element.
     *
     * @param {Element} domElement
     * @param {boolean} toggle
     */
    function doHidden(domElement, toggle) {
        handleStyleClasses(domElement, [CSS_CLASS_HIDE], toggle, ATTR_IS_HID);
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
    /**
     * Add / remove a load event listener.
     *
     * @param {Element} domElement
     * @param {boolean} toggle
     */
    function doLoadEventListener(domElement, toggle) {
        handleListeners(domElement, {
            'load': doElement
        }, toggle, ATTR_HAS_LOAD_LISTENER);
    }
    /**
     * Control when the mouse pointer is over an element.
     *
     * @param {Element} domElement
     * @param {boolean} toggle
     * @param {Event} event
     */
    function doHover(domElement, toggle, event) {
        const coords = domElement[ATTR_RECTANGLE];
        if (toggle && !domElement[ATTR_HAS_HOVER]) {
            if (mouseOverEl && mouseOverEl != domElement) {
                doHover(mouseOverEl, false);
            }
            mouseOverEl = domElement;
            doHoverVisual(domElement, true, coords);
            domElement[ATTR_HAS_HOVER] = true;
        } else if (!toggle && domElement[ATTR_HAS_HOVER] && (!event || !isMouseIn(event, coords))) {
            doHoverVisual(domElement, false, coords);
            domElement[ATTR_HAS_HOVER] = false;
            if (domElement == mouseOverEl) {
                mouseOverEl = null;
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
    function doHoverVisual(domElement, toggle, coords) {
        if (toggle && !domElement[ATTR_HAS_HOVER_VISUAL] && domElement[ATTR_HAS_BACKGROUND_IMAGE]) {
            if (!settings.isNoEye) {
                eye.position(domElement, coords, doc);
                eye.getDomElement().style.display = 'block';

                function setupEye() {
                    eye.getDomElement().style.backgroundImage = eyeCSSUrl;
                    eye.getDomElement().onclick = function(e) {
                        e.stopPropagation();
                        showElement(domElement);
                        // Hide the eye icon and not allow undo option
                        // for now.
                        // TODO: Implement undo option
                        eye.getDomElement().style.display = 'none';
                        // eye.style.backgroundImage = undoCSSUrl;
                        // doHoverVisualClearTimer(el, true);
                        // eye.onclick = function (e) {
                        //     e.stopPropagation();
                        //     doElement.call(el);
                        //     setupEye();
                        //     doHoverVisualClearTimer(el, true);
                        // }
                    }
                }
                setupEye();
            } else {
                addCssClass(domElement, CSS_CLASS_BACKGROUND_LIGHT_PATTERN);
            }
            doHoverVisualClearTimer(domElement, true);
            domElement[ATTR_HAS_HOVER_VISUAL] = true;
        } else if (!toggle && domElement[ATTR_HAS_HOVER_VISUAL]) {
            if (!settings.isNoEye) {
                eye.getDomElement().style.display = 'none';
            } else {
                removeCssClass(domElement, CSS_CLASS_BACKGROUND_LIGHT_PATTERN);
            }
            doHoverVisualClearTimer(domElement, false);
            domElement[ATTR_HAS_HOVER_VISUAL] = false;
        }
    }

    function doHoverVisualClearTimer(domElement, toggle) {
        if (toggle) {
            doHoverVisualClearTimer(domElement, false);
            domElement[ATTR_CLEAR_HOVER_VISUAL_TIMER] = setTimeout(function() { doHoverVisual(domElement, false); }, 2500);
        } else if (!toggle && domElement[ATTR_CLEAR_HOVER_VISUAL_TIMER]) {
            clearTimeout(domElement[ATTR_CLEAR_HOVER_VISUAL_TIMER]);
            domElement[ATTR_CLEAR_HOVER_VISUAL_TIMER] = null;
        }
    }

    function updateElementRectangles() {
        for (let i = 0, max = elList.length; i < max; i++) {
            const domElement = elList[i];
            domElement[ATTR_RECTANGLE] = domElement.getBoundingClientRect();
        }
    }

    function checkMousePosition() {
        if (!mouseMoved || !mouseEvent || !contentLoaded || displayer.isShowAll()) {
            return;
        }
        mouseMoved = false;
        // See if needs to defocus current.
        if (mouseOverEl) {
            const coords = mouseOverEl[ATTR_RECTANGLE];
            if (!isMouseIn(mouseEvent, coords)) {
                doHover(mouseOverEl, false);
            } else if (mouseOverEl[ATTR_HAS_BACKGROUND_IMAGE]) {
                if (!mouseOverEl[ATTR_HAS_HOVER_VISUAL]) {
                    doHoverVisual(mouseOverEl, true, coords);
                } else {
                    doHoverVisualClearTimer(mouseOverEl, true);
                    eye.position(mouseOverEl, coords, doc);
                }
            }
        }
        // Find element under mouse.
        let foundElement = mouseOverEl,
            found = false,
            foundSize = foundElement ? foundElement[ATTR_RECTANGLE].width * foundElement[ATTR_RECTANGLE].height : null;
        for (let i = 0, max = elList.length; i < max; i++) {
            let domElement = elList[i];
            if (domElement == foundElement) {
                continue;
            }
            const rect = domElement[ATTR_RECTANGLE];
            if (isMouseIn(mouseEvent, rect)) {
                // If not foundElement yet, use this. Else if
                // foundElement has not got skfBG, then if ours does,
                // use it. Else if foundElement is bigger, use this.
                let useThis = false;
                if (!foundElement) {
                    useThis = true;
                } else if (!foundElement[ATTR_HAS_BACKGROUND_IMAGE]) {
                    if (domElement[ATTR_HAS_BACKGROUND_IMAGE]) {
                        useThis = true;
                    }
                } else if ((foundSize > rect.width * rect.height) && foundElement[ATTR_HAS_BACKGROUND_IMAGE] == domElement[ATTR_HAS_BACKGROUND_IMAGE]) {
                    useThis = true;
                }
                if (useThis) {
                    foundElement = domElement;
                    foundSize = rect.width * rect.height;
                    found = true;
                }
            }
        }
        if (found && (foundElement[ATTR_HAS_BACKGROUND_IMAGE] || !mouseOverEl)) {
            doHover(foundElement, true);
        }
    }

    function isMouseIn(event, coords) {
        return event.x >= coords.left && event.x < coords.right && event.y >= coords.top && event.y < coords.bottom;
    }

    function showElement(domElement) {
        doHidden(domElement, false);
        if (domElement.tagName == 'IMG') {
            doLoadEventListener(domElement, false);
            doImgSrc(domElement, false);
            if (domElement.parentElement && domElement.parentElement.tagName == 'PICTURE') {
                for (let i = 0; i < domElement.parentElement.childNodes.length; i++) {
                    let node = domElement.parentElement.childNodes[i];
                    if (node.tagName == 'SOURCE') {
                        doImgSrc(node, false);
                    }
                }
            }
        }
        doSkifImageBG(domElement, false);
        if (domElement[ATTR_CHECK_TIMEOUT]) {
            clearTimeout(domElement[ATTR_CHECK_TIMEOUT]);
            domElement[ATTR_CHECK_TIMEOUT] = null;
        }
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