/**
 * Factory function to handle the visibility of images in a
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Window|window}
 * and within its
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement|iframes}.
 */
function ImagesDisplayer() {
    let mShowAll = false;
    let mIframes = [];
    /**
     * Set the flag used to show the images.
     *
     * @param {boolean} show
     */
    function setShowAll(show) {
        mShowAll = show;
    }
    /**
     * Get the flag used to shoe the images.
     *
     * @returns {boolean}
     */
    function isShowAll() {
        return mShowAll;
    }
    /**
     * Add an
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement|iframe}.
     *
     * @param {HTMLIFrameElement}
     */
    function addIFrame(iframe) {
        mIframes.push(iframe);
    }
    /**
     * Display images in a
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Window|window}
     * and in its
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement|iframes}.
     */
    function showImages() {
        if (mShowAll) {
            return;
        }

        mShowAll = true;

        if (window === top) {
            chrome.runtime.sendMessage({
                r: 'setColorIcon',
                toggle: false
            });
        }

        if (window.skfShowImages !== null) {
            window.skfShowImages();
        }

        mIframes.map(iframe => {
            try {
                if (iframe.contentWindow && iframe.contentWindow.skfShowImages) {
                    iframe.contentWindow.skfShowImages();
                }

            } catch (err) {

            }
        });
    }

    return Object.freeze({
        setShowAll,
        isShowAll,
        addIFrame,
        showImages
    });
}