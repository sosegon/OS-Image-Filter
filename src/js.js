//global variables
var showAll = false,
    extensionUrl = chrome.extension.getURL(''),
    urlExtensionUrl = 'url("' + extensionUrl,
    blankImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    urlBlankImg = 'url("' + blankImg + '")',
    eyeCSSUrl = 'url(' + extensionUrl + "eye.png" + ')',
    undoCSSUrl = 'url(' + extensionUrl + "undo.png" + ')',
    // This is the list of elements that can
    // actually hold images. These are the ones
    // that have to be checked.
    tagList = ['IMG', 'DIV', 'SPAN', 'A', 'UL', 'LI', 'TD', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'I', 'STRONG', 'B', 'BIG', 'BUTTON', 'CENTER', 'SECTION', 'TABLE', 'FIGURE', 'ASIDE', 'HEADER', 'VIDEO', 'P', 'ARTICLE'],
    tagListCSS = tagList.join(),

    // List of iframes within the webpage
    iframes = [],

    // Flag the trigger the process of iterating
    // over  the entire structure to process the
    // images and add elements like the eye icon
    contentLoaded = false,
    settings = null,
    quotesRegex = /['"]/g;

// Detects if the script is being executed
// within an iframe, it is usseful when trying
// to accomplish something just in the main
// page e.g. displaying a bar for donations
function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

// Keeps track of contentLoaded
// Once the DOM tree is ready we can start to
// modify it. In this case, we add the canvas
// element to process images fetched with XHR
// and the container for the canvas elements
// to process images fetched directly.
window.addEventListener('DOMContentLoaded', function() {
    canvas_global = document.createElement('canvas');
    canvas_global.setAttribute('id', CANVAS_GLOBAL_ID);
    document.body.appendChild(canvas_global);
    $('#' + CANVAS_GLOBAL_ID).css({
        'display': 'none',
    });

    canvases_room = document.createElement('div');
    canvases_room.setAttribute('id', CANVAS_CONTAINER_ID);
    document.body.appendChild(canvases_room);
    $('#' + CANVAS_CONTAINER_ID).css({
        'display': 'none',
    });

    contentLoaded = true;
});

// Gets settings to check if it is active or is paused etc.
chrome.runtime.sendMessage({ r: 'getSettings' }, function(s) {
    settings = s;
    //if is active - go
    if (settings && !settings.isExcluded && !settings.isExcludedForTab && !settings.isPaused && !settings.isPausedForTab) {
        //change icon
        chrome.runtime.sendMessage({ r: 'setColorIcon', toggle: true });
        //do main window
        DoWin(window, contentLoaded);
    }
});

// Catches 'Show Images' option from browser actions
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.r == 'showImages') ShowImages();
    }
);

// Displays images within the webpage and the
// iframes
function ShowImages() {
    if (showAll) return;
    showAll = true;
    if (window == top)
        chrome.runtime.sendMessage({ r: 'setColorIcon', toggle: false });
    window.skfShowImages();
    for (var i = 0, max = iframes.length; i < max; i++) {
        try {
            if (iframes[i].contentWindow && iframes[i].contentWindow.skfShowImages)
                iframes[i].contentWindow.skfShowImages();
        } catch (err) { /*iframe may have been rewritten*/ }
    }
}


// Contains all the logic related
// to handle the dom structure
// and process the images.
function DoWin(win, winContentLoaded) {
    var doc = win.document,
        headStyles = {},
        observer = null,
        eye = null,
        mouseMoved = false,
        mouseEvent = null,
        mouseOverEl = null,
        elList = [],
        // This flag is used to check if the process
        // of iteration over the structure to find
        // the elements and process the images
        // has started
        hasStarted = false;
    // Start, or register start
    // There is no way to control the order in which
    // the listener for 'DOMContentLoaded' and the
    // callback to get the settings from background
    // are executed. This condition is the way to handle
    // tha situation.
    // DoWin is called after receiving the settings
    // from the background. However, at that moment,
    // the listener for 'DOMContentLoaded' that sets
    // the flag contentLoaded passed here as
    // winContentLoaded has been already triggered
    // In short, the listener was executed first
    if (winContentLoaded)
        Start();
    // The callback was executed first
    else
        win.addEventListener('DOMContentLoaded', Start);

    // Set some css as soon as possible.
    // These styles are going to be used in the elements
    // containing images, and other additional
    // items added by the chrome extension
    // The logic is set to repeat every 1ms:
    // at this point we do not know if the
    // dom is ready for manipulation. The
    // variable doc.head is check to see
    // if the styles can be added.
    var pollID = setInterval(function() {
        // Nothing to add. All images will be
        // shown. Stop the iteration.
        if (showAll) clearInterval(pollID);
        else if (doc.head) {
            // If process has not started.
            // Make the webpage transparent
            // That way no images are displayed.
            if (!hasStarted) addHeadStyle(doc, headStyles, 'body', '{opacity: 0 !important; }');

            addHeadStyle(doc, headStyles, 'body ', '{background-image: none !important;}');
            addHeadStyle(doc, headStyles, '.' + CSS_CLASS_HIDE, '{opacity: 0 !important;}');
            addHeadStyle(doc, headStyles, '.' + CSS_CLASS_BACKGROUND_PATTERN, '{ background-repeat: repeat !important;text-indent:0 !important;}'); //text-indent to show alt text
            addHeadStyle(doc, headStyles, '.' + CSS_CLASS_PAYPAL_DONATION, '{left: 0px; bottom: 0px; width: 100%; z-index: 9000; background: #d09327}');
            for (var i = 0; i < 8; i++) {
                addHeadStyle(doc, headStyles, '.' + CSS_CLASS_BACKGROUND_PATTERN + '.' + CSS_CLASS_SHADE + i, '{background-image: ' + (settings.isNoPattern ? 'none' : 'url(' + extensionUrl + "pattern" + i + ".png" + ')') + ' !important; }');
                addHeadStyle(doc, headStyles, '.' + CSS_CLASS_BACKGROUND_PATTERN + '.' + CSS_CLASS_BACKGROUND_LIGHT_PATTERN + '.' + CSS_CLASS_SHADE + i, '{background-image: ' + (settings.isNoPattern ? 'none' : 'url(' + extensionUrl + "pattern-light" + i + ".png" + ')') + ' !important; }');
            }
            clearInterval(pollID);
        }
    }, 1);
    //ALT-a, ALT-z
    doc.addEventListener('keydown', DocKeyDown);
    //notice when mouse has moved
    doc.addEventListener('mousemove', DocMouseMove);
    win.addEventListener('scroll', WindowScroll);

    function DocMouseMove(e) {
        mouseEvent = e;
        mouseMoved = true;
    };

    function WindowScroll() {
        mouseMoved = true;
        UpdateElRects();
        CheckMousePosition();
    }

    function DocKeyDown(e) {
        if (e.altKey && e.keyCode == 80 && !settings.isPaused) { //ALT-p
            settings.isPaused = true;
            chrome.runtime.sendMessage({ r: 'pause', toggle: true });
            ShowImages();
        } else if (mouseOverEl && e.altKey) {
            if (e.keyCode == 65 && mouseOverEl[ATTR_HAS_BACKGROUND_IMAGE]) { //ALT-a
                ShowEl.call(mouseOverEl);
                eye.style.display = 'none';
            } else if (e.keyCode == 90 && !mouseOverEl[ATTR_HAS_BACKGROUND_IMAGE]) { //ALT-z
                DoElement.call(mouseOverEl);
                eye.style.display = 'none';
            }
        }
    }
    //keep track of which image-element mouse if over
    function mouseEntered(e) {
        DoHover(this, true, e);
        e.stopPropagation();
    }

    function mouseLeft(e) {
        DoHover(this, false, e);
    }

    // Starts the process to filter images
    function Start() {
        // With iFrames it happens
        if (!doc.body) return;

        // Do not hide an image opened in the browser
        // The user actually WANTS to see it.
        if (win == top && doc.body.children.length == 1 && doc.body.children[0].tagName == 'IMG') {
            ShowImages();
            return;
        }

        // Filter any image in the body.
        // Here the image can be a background
        // set in a css style
        DoElements(doc.body, false);

        // Once body has been done, show it
        if (headStyles['body']) removeHeadStyle(doc, headStyles, 'body');

        // Create eye icon
        // There is one single icon that is
        // positioned accordingly in the
        // corresponding element that can be
        // displayed at that moment
        eye = doc.createElement('div');
        eye.style.display = 'none';
        eye.style.width = eye.style.height = '16px';
        eye.style.position = 'fixed';
        eye.style.zIndex = 1e8;
        eye.style.cursor = 'pointer';
        eye.style.padding = '0';
        eye.style.margin = '0';
        eye.style.opacity = '.5';
        doc.body.appendChild(eye);

        // Create temporary div,
        // to eager load background img
        // light for noEye to avoid flicker
        if (settings.isNoEye) {
            for (var i = 0; i < 8; i++) {
                var div = doc.createElement('div');
                div.style.opacity = div.style.width = div.style.height = 0;
                div.className = CSS_CLASS_BACKGROUND_PATTERN + ' ' + CSS_CLASS_BACKGROUND_LIGHT_PATTERN + ' ' + CSS_CLASS_SHADE + i;
                doc.body.appendChild(div);
            }
        }

        // Mutation observer checks when a change
        // in the dom has occured
        observer = new WebKitMutationObserver(function(mutations, observer) {
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                // This is for changes in the nodes
                // already in the tree
                if (m.type == 'attributes') {
                    if (m.attributeName == 'class') {
                        var oldHasLazy = m.oldValue != null && m.oldValue.indexOf('lazy') > -1,
                            newHasLazy = m.target.className != null && m.target.className.indexOf('lazy') > -1;
                        if (oldHasLazy != newHasLazy)
                            DoElements(m.target, true);
                    } else if (m.attributeName == 'style' && m.target.style.backgroundImage.indexOf('url(') > -1) {
                        var oldBgImg, oldBgImgMatch;
                        if (m.oldValue == null || !(oldBgImgMatch = /background(?:-image)?:[^;]*url\(['"]?(.+?)['"]?\)/.exec(m.oldValue)))
                            oldBgImg = '';
                        else
                            oldBgImg = oldBgImgMatch[1];
                        if (oldBgImg != /url\(['"]?(.+?)['"]?\)/.exec(m.target.style.backgroundImage)[1]) {
                            DoElement.call(m.target);
                        }
                    }
                }
                // When new nodes have been added
                else if (m.addedNodes != null && m.addedNodes.length > 0)
                    for (var j = 0; j < m.addedNodes.length; j++) {
                        var el = m.addedNodes[j];
                        if (!el.tagName) //eg text nodes
                            continue;
                        if (el.tagName == 'CANVAS')
                            continue;
                        if (el.tagName == 'IFRAME')
                            DoIframe(el);
                        else
                            DoElements(el, true);
                    }
            }
        });
        observer.observe(doc, { subtree: true, childList: true, attributes: true, attributeOldValue: true });

        // CheckMousePosition every so often
        // This is to update the positon of
        // the eye when the mouse pointer is
        // over an image
        setInterval(CheckMousePosition, 250);

        // Update the bounding boxes for every
        // element with an image
        setInterval(UpdateElRects, 3000);

        // This is likely to be set based on
        // an average time for a web page to be loaded
        // TODO: Improve this
        for (var i = 1; i < 7; i++)
            if ((i % 2) > 0)
                setTimeout(UpdateElRects, i * 1500);

        // At this point the frame elements
        // are already in the dom, but their
        // content may not have been loaded.
        var iframes = doc.getElementsByTagName('iframe');
        for (var i = 0, max = iframes.length; i < max; i++) {
            DoIframe(iframes[i]);
        }

        // Now the process has officially started
        hasStarted = true;
    }

    // Gets an elements to star the process over
    // its descendants and itself if specified
    function DoElements(el, includeEl) {
        if (includeEl && tagList.indexOf(el.tagName) > -1)
            DoElement.call(el);
        var all = el.querySelectorAll(tagListCSS);
        for (var i = 0, max = all.length; i < max; i++)
            DoElement.call(all[i]);
    }

    // Do the process over an iframe
    // Remember that an iframe contains
    // another webpage embedded in the main
    // one.
    function DoIframe(iframe) {
        if (iframe.src && iframe.src != "about:blank" && iframe.src.substr(0, 11) != 'javascript:') return;
        iframes.push(iframe);
        var win = iframe.contentWindow;
        if (!win) return; //with iFrames it happens

        // Similar to the main page. The
        // logic is set to be executed until
        // the iframe is ready to be processed
        var pollNum = 0,
            pollID = setInterval(function() {
                if (doc.body) {
                    clearInterval(pollID);
                    DoWin(win, true);
                }
                if (++pollNum == 500)
                    clearInterval(pollID);
            }, 10);
    }

    // Adds a sibling canvas for the corresponding
    // element with an image. The it tries to
    // filter the content of the image by directly
    // getting the data from the canvas; if that fails,
    // it retrieves the data of the image with
    // an XHR and passes processes the result.
    function ProcessImage() {
        var canvas = AddCanvasSibling(this);
        if (canvas) {
            this[ATTR_PROCESSED] = true;
            var uuid = this.getAttribute(ATTR_UUID)
            try {
                filterImageElement(canvas, this, uuid);
            } catch (err) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    var reader = new FileReader();
                    reader.uuid = uuid;
                    reader.onloadend = function() {
                        var image = new Image();
                        image.crossOrigin = "anonymous";
                        image.src = reader.result;
                        image.uuid = this.uuid;
                        image.onload = function() {
                            var width = this.width;
                            var height = this.height;

                            var canvas_global = document.getElementById(CANVAS_GLOBAL_ID);
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

            DoLoadProcessImageListener(this, false);
            DoLoadEventListener(this, false);
        }
    }

    // Process the image of an image passed in
    // its style. Since the image in the style
    // is referenced with an url, it uses it
    // to retrieve it with an XHR object.
    // It uses the global canvas to filter the
    // image.
    function ProcessBkgImage(el, bkgImage, width, height, uuid) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var reader = new FileReader();
            reader.uuid = uuid;
            reader.onloadend = function() {
                var image = new Image();
                image.crossOrigin = "anonymous";
                image.src = reader.result;
                image.uuid = this.uuid;
                image.onload = function() {

                    var canvasGlobal = document.getElementById(CANVAS_GLOBAL_ID);
                    canvasGlobal.setAttribute("width", width);
                    canvasGlobal.setAttribute("height", height);

                    filterBackgroundImageContent(canvasGlobal, this, uuid);
                };
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open("GET", bkgImage);
        xhr.responseType = "blob";
        xhr.send();
    }

    // Adds a canvas sibling for an element
    // containing an image. The canvas is
    // meant to be used to get the data in
    // a readable format to be filtered
    // TODO: Use only the global canvas to
    // improve perfomance. Workers may be helpful
    function AddCanvasSibling(el) {
        var uuid = el.getAttribute(ATTR_UUID) + "-canvas";
        var canvas = document.getElementById(uuid);

        if (canvas === undefined || canvas === null) {
            var canvas = document.createElement("canvas");
            canvas.setAttribute("id", uuid);

            var room = document.getElementById(CANVAS_CONTAINER_ID);
            room.appendChild(canvas);
            //el.parentNode.insertBefore(canvas, el.nextSibling);
            addCssClass(canvas, CSS_CLASS_HIDE);
        }
        return canvas;
    }

    // Adds or removes the listener for a
    // load event in an IMG element
    function DoLoadProcessImageListener(el, toggle) {
        handleListeners(el, {
            'load': ProcessImage
        }, toggle, ATTR_HAS_PROCESS_IMAGE_LISTENER);
    }

    // Analyses an element to proceed to
    // process its image if it has one
    function DoElement() {
        // No need to do anything when
        // all the images are going to
        // be dispolayed
        if (showAll) return;

        // IMG elements
        if (this.tagName == 'IMG') {
            //this.crossOrigin = "Anonymous"; // To process images from other domains

            // wiz-to-process class does not exist
            // it is just a workaround to avoid setting
            // an wiz-uuid in an element that already
            // has one and it is also in the lists
            // of suspects. This is due to the fact
            // that this function is executed more than
            // once over the same element.
            if (!$(this).hasClass("wiz-to-process")) {
                AddRandomWizUuid(this);
                addCssClass(this, "wiz-to-process") // class used to trigger the load event once Nacl module is loaded
                AddAsSuspect(this);
            }

            // Attach load event need for:
            // 1) As we need to catch it after
            // it is switched for the base64 image
            //
            // 2) In case the img gets changed to
            // something else later
            DoLoadProcessImageListener(this, true);
            DoLoadEventListener(this, true);

            // See if not yet loaded
            if (!this.complete) {

                // Hide, to avoid flash until load
                // event is handled
                DoHidden(this, true);
                return;
            }

            var elWidth = this.width,
                elHeight = this.height;

            // It was successfully replace
            // TODO: Check this because it comes
            // from the original extension
            if (this.src == blankImg) {
                DoHidden(this, false);
                DoSkifImageBG(this, true);
                this[ATTR_IS_BLOCKED] = true;
            }

            // Image greater than the dimensions
            // in the settings needs to be filtered
            // we need to catch 0 too, as sometimes
            // images start off as zero
            else if ((elWidth == 0 || elWidth > settings.maxSafe) && (elHeight == 0 || elHeight > settings.maxSafe)) {
                DoMouseEventListeners(this, true);
                if (!this[ATTR_HAS_TITLE_AND_SIZE]) {
                    // this.style.width = elWidth + 'px';
                    // this.style.height = elHeight + 'px';
                    if (!this.title)
                        if (this.alt)
                            this.title = this.alt;
                        else {
                            this.src.match(/([-\w]+)(\.[\w]+)?$/i);
                            this.title = RegExp.$1;
                        }
                    this[ATTR_HAS_TITLE_AND_SIZE] = true;
                }
                DoHidden(this, true);
                DoImgSrc(this, true);
                if (this.parentElement && this.parentElement.tagName == 'PICTURE') {
                    for (var i = 0; i < this.parentElement.childNodes.length; i++) {
                        var node = this.parentElement.childNodes[i];
                        if (node.tagName == 'SOURCE')
                            DoImgSrc(node, true);
                    }
                }
                //this.src = blankImg;
            }
            // Small images are simply hidden
            // TODO: Add a rule in the settings
            // to let the user know that this happens
            else {
                DoHidden(this, false);
            }
            // TODO: Uncomment this when the
            // logic for video is implemented
            // }
            // else if (this.tagName == 'VIDEO') {
            //     AddAsSuspect(this);
            //     DoHidden(this, true);
            //     DoSkifImageBG(this, true);

            // Any element other than IMG and VIDEO
        } else {
            // Here the images are added in the
            // styles as backgrounds
            var compStyle = getComputedStyle(this),
                bgImg = compStyle['background-image'],
                width = parseInt(compStyle['width']) || this.clientWidth,
                height = parseInt(compStyle['height']) || this.clientHeight; //as per https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle, getComputedStyle will return the 'used values' for width and height, which is always in px. We also use clientXXX, since sometimes compStyle returns NaN.

            // Image greater than the dimensions
            // in the settings needs to be filtered
            // we need to catch 0 too, as sometimes
            // images start off as zero
            if (bgImg != 'none' && (width == 0 || width > settings.maxSafe) && (height == 0 || height > settings.maxSafe) &&
                bgImg.indexOf('url(') != -1 &&
                !bgImg.startsWith(urlExtensionUrl) && bgImg != urlBlankImg &&
                !this[ATTR_PROCESSED]
            ) {

                // Used to fetch image with xhr
                var bgImgUrl = bgImg.slice(5, -2);
                // Avoids quick display of original image
                $(this).css("background-image", "url('')");
                // Reference for the element once the image is processed
                AddRandomWizUuid(this);
                var uuid = $(this).attr(ATTR_UUID);
                ProcessBkgImage(this, bgImgUrl, width, height, uuid);

                AddAsSuspect(this);
                DoSkifImageBG(this, true);
                DoMouseEventListeners(this, true);
                if (this[ATTR_LAST_CHECKED_SRC] != bgImg) {
                    this[ATTR_LAST_CHECKED_SRC] = bgImg;
                    var i = new Image();
                    i.owner = this;
                    i.onload = CheckBgImg;
                    var urlMatch = /\burl\(["']?(.*?)["']?\)/.exec(bgImg);
                    if (urlMatch)
                        i.src = urlMatch[1];
                }
                this[ATTR_IS_BLOCKED] = true;
            }
        }
    }
    //
    function CheckBgImg() {
        if (this.height <= settings.maxSafe || this.width <= settings.maxSafe) ShowEl.call(this.owner);
        this.onload = null;
    };
    // Add to the lists of suspects
    function AddAsSuspect(el) {
        if (elList.indexOf(el) == -1) {
            elList.push(el);
            el[ATTR_RECTANGLE] = el.getBoundingClientRect();
        }
    }


    // Stores the original src of the image
    function DoImgSrc(el, toggle) {
        if (toggle && !$(el).attr(ATTR_ALREADY_TOGGLED)) {
            //console.log("DoImgSrc: " + el.src.slice(0, 80));
            el.oldsrc = el.src;
            el.oldsrcset = el.srcset;
            // Do not set to empty string, otherwise the processing
            // will result in an empty image
            //el.src = el.srcset = '';
            el.srcset = ''; // empty string to make sure filtered images are displayed in the img elements
            $(el).attr(ATTR_ALREADY_TOGGLED, "true")
        } else if (!toggle && $(el).attr(ATTR_ALREADY_TOGGLED) === "true") {
            var oldsrc = el.oldsrc;
            el.oldsrc = el.src;
            el.src = oldsrc;
            el.srcset = el.oldsrcset;
        }
    }
    // Hides elements using styles
    function DoHidden(el, toggle) {
        handleStyleClasses(el, [CSS_CLASS_HIDE], toggle, ATTR_IS_HID);
    }
    // Adds / removes mouse event listeners
    function DoMouseEventListeners(el, toggle) {
        handleListeners(el, {
            'mouseover': mouseEntered,
            'mouseout': mouseLeft
        }, toggle, ATTR_HAS_MOUSE_LISTENERS);
    }
    // Adds / removes the load event
    function DoLoadEventListener(el, toggle) {
        handleListeners(el, {
            'load': DoElement
        }, toggle, ATTR_HAS_LOAD_LISTENER);
    }
    // Contorls when the mouse pointer is over
    // an element
    function DoHover(el, toggle, evt) {
        var coords = el[ATTR_RECTANGLE];
        if (toggle && !el[ATTR_HAS_HOVER]) {
            if (mouseOverEl && mouseOverEl != el){
                DoHover(mouseOverEl, false);
            }
            mouseOverEl = el;
            DoHoverVisual(el, true, coords);
            el[ATTR_HAS_HOVER] = true;
        } else if (!toggle && el[ATTR_HAS_HOVER] && (!evt || !IsMouseIn(evt, coords))) {
            DoHoverVisual(el, false, coords);
            el[ATTR_HAS_HOVER] = false;
            if (el == mouseOverEl)
                mouseOverEl = null;
        }
    }

    // Positions and displays the eye icon
    // over the image hovered by the mouse
    // pointer
    function DoHoverVisual(el, toggle, coords) {
        if (toggle && !el[ATTR_HAS_HOVER_VISUAL] && el[ATTR_HAS_BACKGROUND_IMAGE]) {
            if (!settings.isNoEye) {
                //eye
                PositionEye(el, coords);
                eye.style.display = 'block';

                function setupEye() {
                    eye.style.backgroundImage = eyeCSSUrl;
                    eye.onclick = function(e) {
                        e.stopPropagation();
                        ShowEl.call(el);
                        // hide the eye icon and not allow undo option for now
                        // TODO: Implement undo option
                        eye.style.display = 'none';
                        // eye.style.backgroundImage = undoCSSUrl;
                        // DoHoverVisualClearTimer(el, true);
                        // eye.onclick = function (e) {
                        //     e.stopPropagation();
                        //     DoElement.call(el);
                        //     setupEye();
                        //     DoHoverVisualClearTimer(el, true);
                        // }
                    }
                }
                setupEye();
            } else
                addCssClass(el, CSS_CLASS_BACKGROUND_LIGHT_PATTERN);
            DoHoverVisualClearTimer(el, true);
            el[ATTR_HAS_HOVER_VISUAL] = true;
        } else if (!toggle && el[ATTR_HAS_HOVER_VISUAL]) {
            if (!settings.isNoEye)
                eye.style.display = 'none';
            else
                removeCssClass(el, CSS_CLASS_BACKGROUND_LIGHT_PATTERN);
            DoHoverVisualClearTimer(el, false);
            el[ATTR_HAS_HOVER_VISUAL] = false;
        }
    }

    function DoHoverVisualClearTimer(el, toggle) {
        if (toggle) {
            DoHoverVisualClearTimer(el, false);
            el[ATTR_CLEAR_HOVER_VISUAL_TIMER] = setTimeout(function() { DoHoverVisual(el, false); }, 2500);
        } else if (!toggle && el[ATTR_CLEAR_HOVER_VISUAL_TIMER]) {
            clearTimeout(el[ATTR_CLEAR_HOVER_VISUAL_TIMER]);
            el[ATTR_CLEAR_HOVER_VISUAL_TIMER] = null;
        }
    }
    // Positions the eye in the top right
    // corner of an image
    function PositionEye(el, coords) {
        eye.style.top = (coords.top < 0 ? 0 : coords.top) + 'px';
        var left = coords.right;
        if (left > doc.documentElement.clientWidth) left = doc.documentElement.clientWidth;
        eye.style.left = (left - 16) + 'px';

    }

    function UpdateElRects() {
        for (var i = 0, max = elList.length; i < max; i++) {
            var el = elList[i];
            el[ATTR_RECTANGLE] = el.getBoundingClientRect();
        }
    }

    function CheckMousePosition() {
        if (!mouseMoved || !mouseEvent || !contentLoaded || showAll) return;
        mouseMoved = false;
        //see if needs to defocus current
        if (mouseOverEl) {
            var coords = mouseOverEl[ATTR_RECTANGLE];
            if (!IsMouseIn(mouseEvent, coords))
                DoHover(mouseOverEl, false);
            else if (mouseOverEl[ATTR_HAS_BACKGROUND_IMAGE]) {
                if (!mouseOverEl[ATTR_HAS_HOVER_VISUAL])
                    DoHoverVisual(mouseOverEl, true, coords);
                else {
                    DoHoverVisualClearTimer(mouseOverEl, true);
                    PositionEye(mouseOverEl, coords);
                }
            }
        }
        //find element under mouse
        var foundEl = mouseOverEl,
            found = false,
            foundSize = foundEl ? foundEl[ATTR_RECTANGLE].width * foundEl[ATTR_RECTANGLE].height : null;
        for (var i = 0, max = elList.length; i < max; i++) {
            var el = elList[i];
            if (el == foundEl)
                continue;
            var rect = el[ATTR_RECTANGLE];
            if (IsMouseIn(mouseEvent, rect)) {
                //If not foundEl yet, use this. Else if foundEl has not got skfBG, then if ours does, use it. Else if foundEl is bigger, use this.
                var useThis = false;
                if (!foundEl)
                    useThis = true;
                else if (!foundEl[ATTR_HAS_BACKGROUND_IMAGE]) {
                    if (el[ATTR_HAS_BACKGROUND_IMAGE])
                        useThis = true;
                } else if ((foundSize > rect.width * rect.height) && foundEl[ATTR_HAS_BACKGROUND_IMAGE] == el[ATTR_HAS_BACKGROUND_IMAGE])
                    useThis = true;
                if (useThis) {
                    foundEl = el;
                    foundSize = rect.width * rect.height;
                    found = true;
                }
            }
        }
        if (found && (foundEl[ATTR_HAS_BACKGROUND_IMAGE] || !mouseOverEl)) {
            DoHover(foundEl, true);
        }
    }

    function IsMouseIn(mouseEvt, coords) {
        return mouseEvt.x >= coords.left && mouseEvt.x < coords.right && mouseEvt.y >= coords.top && mouseEvt.y < coords.bottom;
    }

    function ShowEl() {
        DoHidden(this, false);
        if (this.tagName == 'IMG') {
            DoLoadEventListener(this, false);
            DoImgSrc(this, false);
            if (this.parentElement && this.parentElement.tagName == 'PICTURE') {
                for (var i = 0; i < this.parentElement.childNodes.length; i++) {
                    var node = this.parentElement.childNodes[i];
                    if (node.tagName == 'SOURCE')
                        DoImgSrc(node, false);
                }
            }
        }
        DoSkifImageBG(this, false);
        if (this[ATTR_CHECK_TIMEOUT]) {
            clearTimeout(this[ATTR_CHECK_TIMEOUT]);
            this[ATTR_CHECK_TIMEOUT] = null;
        }
        if (showAll) {
            DoMouseEventListeners(this, false);
        }
    }

    function AddRandomWizUuid(el) {
        if ($(el).attr(ATTR_UUID) == null) {
            $(el).attr(ATTR_UUID, guid());
        }
    }
    // from https://stackoverflow.com/a/105074/1065981
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    win.skfShowImages = function() {
        doc.removeEventListener('keydown', DocKeyDown);
        doc.removeEventListener('mousemove', DocMouseMove);
        win.removeEventListener('scroll', WindowScroll);
        for (var i = 0, max = elList.length; i < max; i++)
            ShowEl.call(elList[i]);
        win.removeEventListener('DOMContentLoaded', Start);
        for (var s in headStyles)
            removeHeadStyle(doc, headStyles, s);
        if (mouseOverEl) {
            DoHover(mouseOverEl, false);
            mouseOverEl = null;
        }
        if (eye) {
            for (var i = 0, bodyChildren = doc.body.children; i < bodyChildren.length; i++) //for some reason, sometimes the eye is removed before
                if (bodyChildren[i] == eye)
                    doc.body.removeChild(eye);
        }
        if (observer)
            observer.disconnect();
    }
}