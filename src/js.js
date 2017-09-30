//global variables
var showAll = false,
    extensionUrl = chrome.extension.getURL(''),
    urlExtensionUrl = 'url("' + extensionUrl,
    blankImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    urlBlankImg = 'url("' + blankImg + '")',
    patternCSSUrl = 'url(' + extensionUrl + "pattern.png" + ')',
    patternLightUrl = extensionUrl + "pattern-light.png",
    patternLightCSSUrl = 'url(' + patternLightUrl + ')',
    eyeCSSUrl = 'url(' + extensionUrl + "eye.png" + ')',
    undoCSSUrl = 'url(' + extensionUrl + "undo.png" + ')',
    tagList = ['IMG', 'DIV', 'SPAN', 'A', 'UL', 'LI', 'TD', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'I', 'STRONG', 'B', 'BIG', 'BUTTON', 'CENTER', 'SECTION', 'TABLE', 'FIGURE', 'ASIDE', 'HEADER', 'VIDEO', 'P', 'ARTICLE'],
    tagListCSS = tagList.join(),
    iframes = [],
    contentLoaded = false,
    settings = null,
    quotesRegex = /['"]/g;

function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

//keep track of contentLoaded
window.addEventListener('DOMContentLoaded', function () {
    canvas_global = document.createElement('canvas');
    canvas_global.setAttribute('id', 'skf_canvas');
    document.body.appendChild(canvas_global);
    $('#skf_canvas').css({
        'display': 'none',
    });

    canvases_room = document.createElement('div');
    canvases_room.setAttribute('id', 'skf_canvases_room');
    document.body.appendChild(canvases_room);
    $('#skf_canvases_room').css({
        'display': 'none',
    });

    contentLoaded = true; 
});

//start by seeing if is active or is paused etc.
chrome.runtime.sendMessage({ r: 'getSettings' }, function (s) {
    settings = s;
    //if is active - go
    if (settings && !settings.isExcluded && !settings.isExcludedForTab && !settings.isPaused && !settings.isPausedForTab) {
        //change icon
        chrome.runtime.sendMessage({ r: 'setColorIcon', toggle: true });
        //do main window
        DoWin(window, contentLoaded);
    }
});

//catch 'Show Images' option from browser actions
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.r == 'showImages') ShowImages();
    }
);

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
        }
        catch (err) { /*iframe may have been rewritten*/ }
    }
}

function DoWin(win, winContentLoaded) {
    var doc = win.document,
        headStyles = {},
        observer = null,
        eye = null,
        mouseMoved = false,
        mouseEvent = null,
        mouseOverEl = null,
        elList = [],
        hasStarted = false;
    //start, or register start
    if (winContentLoaded)
        Start();
    else
        win.addEventListener('DOMContentLoaded', Start);
    //we need to set some css as soon as possible
    var pollID = setInterval(function () {
        if (showAll) clearInterval(pollID);
        else if (doc.head) {
            if (!hasStarted) AddHeadStyle('body', '{opacity: 0 !important; }');
            AddHeadStyle('body ', '{background-image: none !important;}');
            AddHeadStyle('.skfHide', '{opacity: 0 !important;}');
            AddHeadStyle('.skfPatternBgImg', '{ background-repeat: repeat !important;text-indent:0 !important;}'); //text-indent to show alt text
            AddHeadStyle('.skfPaypalDonation', '{left: 0px; bottom: 0px; width: 100%; z-index: 9000; background: #d09327}');
            for (var i = 0; i < 8; i++) {
                AddHeadStyle('.skfPatternBgImg.skfShade' + i, '{background-image: ' + (settings.isNoPattern ? 'none' : 'url(' + extensionUrl + "pattern" + i + ".png" + ')') + ' !important; }');
                AddHeadStyle('.skfPatternBgImg.skfPatternBgImgLight.skfShade' + i, '{background-image: ' + (settings.isNoPattern ? 'none' : 'url(' + extensionUrl + "pattern-light" + i + ".png" + ')') + ' !important; }');
            }
            clearInterval(pollID);
        }
    }, 1);
    //ALT-a, ALT-z
    doc.addEventListener('keydown', DocKeyDown);
    //notice when mouse has moved
    doc.addEventListener('mousemove', DocMouseMove);
    win.addEventListener('scroll', WindowScroll);

    function DocMouseMove(e) { mouseEvent = e; mouseMoved = true; };
    function WindowScroll() { mouseMoved = true; UpdateElRects(); CheckMousePosition(); }
    function DocKeyDown(e) {
        if (e.altKey && e.keyCode == 80 && !settings.isPaused) { //ALT-p
            settings.isPaused = true;
            chrome.runtime.sendMessage({ r: 'pause', toggle: true });
            ShowImages();
        }
        else if (mouseOverEl && e.altKey) {
            if (e.keyCode == 65 && mouseOverEl.skfHasWizmageBG) { //ALT-a
                ShowEl.call(mouseOverEl);
                eye.style.display = 'none';
            } else if (e.keyCode == 90 && !mouseOverEl.skfHasWizmageBG) { //ALT-z
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
    //process all elements with background-image, and observe mutations for new ones
    function Start() {
        if (!doc.body) return; //with iFrames it happens
        //when viewing an image (not a webpage)
        if (win == top && doc.body.children.length == 1 && doc.body.children[0].tagName == 'IMG') {
            ShowImages();
            return;
        }
        DoElements(doc.body, false);
        //show body
        if (headStyles['body']) RemoveHeadStyle('body');
        //create eye
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
        //create temporary div, to eager load background img light for noEye to avoid flicker
        if (settings.isNoEye) {
            for (var i = 0; i < 8; i++) {
                var div = doc.createElement('div');
                div.style.opacity = div.style.width = div.style.height = 0;
                div.className = 'skfPatternBgImg skfPatternBgImgLight skfShade' + i;
                doc.body.appendChild(div);
            }
        }
        //mutation observer
        observer = new WebKitMutationObserver(function (mutations, observer) {
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (m.type == 'attributes') {
                    if (m.attributeName == 'class') {
                        var oldHasLazy = m.oldValue != null && m.oldValue.indexOf('lazy') > -1, newHasLazy = m.target.className != null && m.target.className.indexOf('lazy') > -1;
                        if (oldHasLazy != newHasLazy)
                            DoElements(m.target, true);
                    } else if (m.attributeName == 'style' && m.target.style.backgroundImage.indexOf('url(') >- 1) {
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
                else if (m.addedNodes != null && m.addedNodes.length > 0)
                    for (var j = 0; j < m.addedNodes.length; j++) {
                        var el = m.addedNodes[j];
                        if (!el.tagName) //eg text nodes
                            continue;
                        if(el.tagName == 'CANVAS')
                            continue;
                        if (el.tagName == 'IFRAME')
                            DoIframe(el);
                        else
                            DoElements(el, true);
                    }
            }
        });
        observer.observe(doc, { subtree: true, childList: true, attributes: true, attributeOldValue: true });
        //CheckMousePosition every so often
        setInterval(CheckMousePosition, 250);
        setInterval(UpdateElRects, 3000);
        for (var i = 1; i < 7; i++)
            if ((i % 2) > 0)
                setTimeout(UpdateElRects, i * 1500);
        //empty iframes
        var iframes = doc.getElementsByTagName('iframe');
        for (var i = 0, max = iframes.length; i < max; i++) {
            DoIframe(iframes[i]);
        }
        //mark as started
        hasStarted = true;
    }
    function DoElements(el, includeEl) {
        if (includeEl && tagList.indexOf(el.tagName) > -1)
            DoElement.call(el);
        var all = el.querySelectorAll(tagListCSS);
        for (var i = 0, max = all.length; i < max; i++)
            DoElement.call(all[i]);
    }
    function DoIframe(iframe) {
        if (iframe.src && iframe.src != "about:blank" && iframe.src.substr(0, 11) != 'javascript:') return;
        iframes.push(iframe);
        var win = iframe.contentWindow;
        if (!win) return; //with iFrames it happens
        var pollNum = 0, pollID = setInterval(function () {
            if (doc.body) {
                clearInterval(pollID);
                DoWin(win, true);
            }
            if (++pollNum == 500)
                clearInterval(pollID);
        }, 10);
    }
    function load_processed() {
        $(this).removeClass("skfHide");
        $(this).attr("skf-processed", "true");
        this.skfProcessed = true;
        var uuid = $(this).attr("skf-uuid");
        $("#" + uuid + "-canvas").remove();

        if(this.skfProcessed) { // already processed
            DoSkifImageBG(this, true); // Needed to enable eye icon in image
            //DoImgSrc(this, true);
            return;
        } 
    }
    function filter_rgba_array(rgba_arr) {
        for(var i = 0; i < rgba_arr.length; i+=4) {
            rIndex = i
            gIndex = i + 1
            bIndex = i + 2
            aIndex = i + 3

            r = rgba_arr[rIndex];
            g = rgba_arr[gIndex];
            b = rgba_arr[bIndex];
           
            if(
                (r > 95 && g > 40 && b > 20) &&
                (Math.max(r, g, b) - Math.min(r, g, b) > 15) &&
                (Math.abs(r - g) > 15 && r > g && r > b)
                ) {
                rgba_arr[rIndex] = 127;
                rgba_arr[gIndex] = 127;
                rgba_arr[bIndex] = 127;
                rgba_arr[aIndex] = 255;
            }
        }
    }
    function filterImageContent(canvas, img, uuid) {
        canvas.setAttribute("width", img.width);
        canvas.setAttribute("height", img.height);

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0); // at this point the img is loaded

        var width       = img.width;
        var height      = img.height;
        var image_data  = ctx.getImageData(0, 0, width, height);
        var rgba_arr    = image_data.data;

        filter_rgba_array(rgba_arr);
        image_data.data.set(rgba_arr);
        ctx.putImageData(image_data, 0, 0)
        data_url = canvas.toDataURL("image/png");

        img_actual = $("img[skf-uuid="+ uuid + "]")[0];
        if(img_actual !== undefined) {
            img_actual.src = data_url;
            img_actual.srcset = '';
            img_actual.onload = load_processed;
        }
    }
    function ProcessImage() {

        var canvas = AddCanvasSibling(this);
        if(canvas) {
            this.skfProcessed = true;
            var uuid = this.getAttribute("skf-uuid")
            try {
                filterImageContent(canvas, this, uuid);
            } catch (err) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    var reader  = new FileReader();
                    reader.uuid = uuid;
                    reader.onloadend = function() {
                        var image         = new Image();
                        image.crossOrigin = "anonymous";
                        image.src         = reader.result;
                        image.uuid        = this.uuid;
                        image.onload = function(){
                            var width  = this.width;
                            var height = this.height;

                            var canvas_global = document.getElementById("skf_canvas");
                            canvas_global.setAttribute("width",  width );
                            canvas_global.setAttribute("height", height);

                            filterImageContent(canvas_global, this, this.uuid);
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
    function AddCanvasSibling(el) {
        var uuid = el.getAttribute("skf-uuid") + "-canvas";
        var canvas = document.getElementById(uuid);
        
        if(canvas === undefined || canvas === null) {
            var canvas = document.createElement("canvas");
            canvas.setAttribute("id", uuid);

            var room = document.getElementById("skf_canvases_room");
            room.appendChild(canvas);
            //el.parentNode.insertBefore(canvas, el.nextSibling);
            AddClass(canvas, "skfHide");
        }
        return canvas;
    }
    function DoLoadProcessImageListener(el, toggle) {
        if (toggle && !el.skfHasLoadProcessImageEventListener) {
            el.addEventListener('load', ProcessImage);
            el.skfHasLoadProcessImageEventListener = true;
        } else if (!toggle && el.skfHasLoadProcessImageEventListener) {
            el.removeEventListener('load', ProcessImage);
            el.skfHasLoadProcessImageEventListener = false;
        }
    }
    function DoElement() {
        if (showAll) return;
        if (this.tagName == 'IMG') {
            //console.log(this.src);
            //this.crossOrigin = "Anonymous"; // To process images from other domains
            if(!$(this).hasClass("wiz-to-process")) {
                AddRandomWizId(this);
                AddClass(this, "wiz-to-process") // class used to trigger the load event once Nacl module is loaded
                AddAsSuspect(this);
            }

            //attach load event - needed 1) as we need to catch it after it is switched for the blankImg, 2) in case the img gets changed to something else later
            DoLoadProcessImageListener(this, true);
            DoLoadEventListener(this, true);

            //see if not yet loaded
            if (!this.complete) {
                //hide, to avoid flash until load event is handled
                DoHidden(this, true);
                return;
            }

            var elWidth = this.width, elHeight = this.height;
            if (this.src == blankImg) { //was successfully replaced
                DoHidden(this, false);
                DoSkifImageBG(this, true);
                this.skfBeenBlocked = true;
            } else if ((elWidth == 0 || elWidth > settings.maxSafe) && (elHeight == 0 || elHeight > settings.maxSafe)) { //needs to be hidden - we need to catch 0 too, as sometimes images start off as zero
                DoMouseEventListeners(this, true);
                if (!this.skfHasTitleAndSizeSetup) {
                    // this.style.width = elWidth + 'px';
                    // this.style.height = elHeight + 'px';
                    if (!this.title)
                        if (this.alt)
                            this.title = this.alt;
                        else {
                            this.src.match(/([-\w]+)(\.[\w]+)?$/i);
                            this.title = RegExp.$1;
                        }
                    this.skfHasTitleAndSizeSetup = true;
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
            } else { //small image
                DoHidden(this, false);
            }
        }
        // else if (this.tagName == 'VIDEO') {
        //     AddAsSuspect(this);
        //     DoHidden(this, true);
        //     DoSkifImageBG(this, true);
        // } else {
        //     var compStyle = getComputedStyle(this), bgimg = compStyle['background-image'], width = parseInt(compStyle['width']) || this.clientWidth, height = parseInt(compStyle['height']) || this.clientHeight; //as per https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle, getComputedStyle will return the 'used values' for width and height, which is always in px. We also use clientXXX, since sometimes compStyle returns NaN.
        //     if (bgimg != 'none' && (width == 0 || width > settings.maxSafe) && (height == 0 || height > settings.maxSafe) we need to catch 0 too, as sometimes elements start off as zero
        //             && bgimg.indexOf('url(') != -1
        //             && !bgimg.startsWith(urlExtensionUrl) && bgimg != urlBlankImg
        //             ) {
        //         AddAsSuspect(this);
        //         DoSkifImageBG(this, true);
        //         DoMouseEventListeners(this, true);
        //         if (this.skfLastCheckedSrc != bgimg) {
        //             this.skfLastCheckedSrc = bgimg;
        //             var i = new Image();
        //             i.owner = this;
        //             i.onload = CheckBgImg;
        //             var urlMatch = /\burl\(["']?(.*?)["']?\)/.exec(bgimg);
        //             if (urlMatch)
        //                 i.src = urlMatch[1];
        //         }
        //         this.skfBeenBlocked = true;
        //     }
        // }
    }
    function CheckBgImg() {
        if (this.height <= settings.maxSafe || this.width <= settings.maxSafe) ShowEl.call(this.owner);
        this.onload = null;
    };

    function AddAsSuspect(el) {
        if (elList.indexOf(el) == -1) {
            elList.push(el);
            el.skfRect = el.getBoundingClientRect();
        }
    }
    function DoSkifImageBG(el, toggle) {
        if (toggle && !el.skfHasWizmageBG) {
            // var shade = Math.floor(Math.random() * 8);
            // el.skfShade = shade;
            // AddClass(el, 'skfPatternBgImg skfShade' + shade);
            el.skfHasWizmageBG = true;
        } else if (!toggle && el.skfHasWizmageBG) {
            // RemoveClass(el, 'skfPatternBgImg');
            // RemoveClass(el, 'skfShade' + el.skfShade);
            el.skfHasWizmageBG = false;
        }
    }
    // Used to store the original src of the image
    function DoImgSrc(el, toggle) {
        if (toggle && !$(el).attr("wiz-toggled-already")) {
            //console.log("DoImgSrc: " + el.src.slice(0, 80));
            el.oldsrc = el.src;
            el.oldsrcset = el.srcset;
            // Do not set to empty string, otherwise the processing
            // will result in an empty image
            //el.src = el.srcset = ''; 
            el.srcset = ''; // empty string to make sure filtered images are displayed in the img elements
            $(el).attr("wiz-toggled-already", "true")
        }
        else if (!toggle && $(el).attr("wiz-toggled-already") === "true"){
            var oldsrc = el.oldsrc;
            el.oldsrc = el.src;
            el.src = oldsrc;
            el.srcset = el.oldsrcset;
        }
    }
    function DoHidden(el, toggle) {
        if (toggle && !el.skfHidden) {
            AddClass(el, 'skfHide');
            el.skfHidden = true;
        } else if (!toggle && el.skfHidden) {
            RemoveClass(el, 'skfHide');
            el.skfHidden = false;
        }
    }
    function DoMouseEventListeners(el, toggle) {
        if (toggle && !el.skfHasMouseEventListeners) {
            el.addEventListener('mouseover', mouseEntered);
            el.addEventListener('mouseout', mouseLeft);
            el.skfHasMouseEventListeners = true;
        } else if (!toggle && el.skfHasMouseEventListeners) {
            el.removeEventListener('mouseover', mouseEntered);
            el.removeEventListener('mouseout', mouseLeft);
            el.skfHasMouseEventListeners = false;
        }
    }
    function DoLoadEventListener(el, toggle) {
        if (toggle && !el.skfHasLoadEventListener) {
            el.addEventListener('load', DoElement);
            el.skfHasLoadEventListener = true;
        } else if (!toggle && el.skfHasLoadEventListener) {
            el.removeEventListener('load', DoElement);
            el.skfHasLoadEventListener = false;
        }
    }

    function DoHover(el, toggle, evt) {
        var coords = el.skfRect;
        if (toggle && !el.skfHasHover) {
            if (mouseOverEl && mouseOverEl != el)
                DoHover(mouseOverEl, false);
            mouseOverEl = el;
            DoHoverVisual(el, true, coords);
            el.skfHasHover = true;
        } else if (!toggle && el.skfHasHover && (!evt || !IsMouseIn(evt, coords))) {
            DoHoverVisual(el, false, coords);
            el.skfHasHover = false;
            if (el == mouseOverEl)
                mouseOverEl = null;
        }
    }

    function DoHoverVisual(el, toggle, coords) {
        if (toggle && !el.skfHasHoverVisual && el.skfHasWizmageBG) {
            if (!settings.isNoEye) {
                //eye
                PositionEye(el, coords);
                eye.style.display = 'block';
                function setupEye() {
                    eye.style.backgroundImage = eyeCSSUrl;
                    eye.onclick = function (e) {
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
                AddClass(el, 'skfPatternBgImgLight');
            DoHoverVisualClearTimer(el, true);
            el.skfHasHoverVisual = true;
        } else if (!toggle && el.skfHasHoverVisual) {
            if (!settings.isNoEye)
                eye.style.display = 'none';
            else
                RemoveClass(el, 'skfPatternBgImgLight');
            DoHoverVisualClearTimer(el, false);
            el.skfHasHoverVisual = false;
        }
    }
    function DoHoverVisualClearTimer(el, toggle) {
        if (toggle) {
            DoHoverVisualClearTimer(el, false);
            el.skfClearHoverVisualTimer = setTimeout(function () { DoHoverVisual(el, false); }, 2500);
        }
        else if (!toggle && el.skfClearHoverVisualTimer) {
            clearTimeout(el.skfClearHoverVisualTimer);
            el.skfClearHoverVisualTimer = null;
        }
    }
    function PositionEye(el, coords) {
        eye.style.top = (coords.top < 0 ? 0 : coords.top) + 'px';
        var left = coords.right; if (left > doc.documentElement.clientWidth) left = doc.documentElement.clientWidth;
        eye.style.left = (left - 16) + 'px';

    }

    function UpdateElRects() {
        for (var i = 0, max = elList.length; i < max; i++) {
            var el = elList[i];
            el.skfRect = el.getBoundingClientRect();
        }
    }

    function CheckMousePosition() {
        if (!mouseMoved || !mouseEvent || !contentLoaded || showAll) return;
        mouseMoved = false;
        //see if needs to defocus current
        if (mouseOverEl) {
            var coords = mouseOverEl.skfRect;
            if (!IsMouseIn(mouseEvent, coords))
                DoHover(mouseOverEl, false);
            else if (mouseOverEl.skfHasWizmageBG) {
                if (!mouseOverEl.skfHasHoverVisual)
                    DoHoverVisual(mouseOverEl, true, coords);
                else {
                    DoHoverVisualClearTimer(mouseOverEl, true);
                    PositionEye(mouseOverEl, coords);
                }
            }
        }
        //find element under mouse
        var foundEl = mouseOverEl, found = false, foundSize = foundEl ? foundEl.skfRect.width * foundEl.skfRect.height : null;
        for (var i = 0, max = elList.length; i < max; i++) {
            var el = elList[i];
            if (el == foundEl)
                continue;
            var rect = el.skfRect;
            if (IsMouseIn(mouseEvent, rect)) {
                //If not foundEl yet, use this. Else if foundEl has not got skfBG, then if ours does, use it. Else if foundEl is bigger, use this.
                var useThis = false;
                if (!foundEl)
                    useThis = true;
                else if (!foundEl.skfHasWizmageBG) {
                    if (el.skfHasWizmageBG)
                        useThis = true;
                }
                else if ((foundSize > rect.width * rect.height) && foundEl.skfHasWizmageBG == el.skfHasWizmageBG)
                    useThis = true;
                if (useThis) {
                    foundEl = el;
                    foundSize = rect.width * rect.height;
                    found = true;
                }
            }
        }
        if (found && (foundEl.skfHasWizmageBG || !mouseOverEl)) {
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
        if (this.skfCheckTimeout) {
            clearTimeout(this.skfCheckTimeout);
            this.skfCheckTimeout = null;
        }
        if (showAll) {
            DoMouseEventListeners(this, false);
        }
    }

    function AddHeadStyle(n, s) {
        var styleel = doc.createElement('style');
        styleel.type = 'text/css';
        styleel.appendChild(doc.createTextNode(n + s));
        doc.head.appendChild(styleel);
        headStyles[n] = styleel;
    }
    function AddHeadScript(doc, src, code, onload) {
        var scriptel = doc.createElement('script');
        scriptel.type = 'text/javascript';
        if (src)
            scriptel.src = src;
        if (code)
            scriptel.appendChild(doc.createTextNode(code));
        if (onload)
            scriptel.onload = onload;
        doc.head.appendChild(scriptel);
    }
    function RemoveHeadStyle(n) {
        doc.head.removeChild(headStyles[n]);
        delete headStyles[n];
    }
    function RemoveClass(el, n) { //these assume long unique class names, so no need to check for word boundaries
        var oldClass = el.className, newClass = el.className.replace(new RegExp('\\b' + n + '\\b'), '');
        if (oldClass != newClass) {
            el.className = newClass;
        }
    }
    function AddClass(el, c) {
        el.className += ' ' + c;
    }
    function AddRandomWizId(el) {
        if($(el).attr("skf-uuid") == null) {
            $(el).attr("skf-uuid", guid());
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

    win.skfShowImages = function () {
        doc.removeEventListener('keydown', DocKeyDown);
        doc.removeEventListener('mousemove', DocMouseMove);
        win.removeEventListener('scroll', WindowScroll);
        for (var i = 0, max = elList.length; i < max; i++)
            ShowEl.call(elList[i]);
        win.removeEventListener('DOMContentLoaded', Start);
        for (var s in headStyles)
            RemoveHeadStyle(s);
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
