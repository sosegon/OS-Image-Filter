function ImagesDisplayer() {
    let mShowAll = false;
    let mIframes = [];

    function setShowAll(show) {
        mShowAll = show;
    }

    function isShowAll() {
        return mShowAll;
    }

    function addIFrame(iframe) {
        mIframes.push(iframe);
    }
    /**
     * Display images in webpage and iframes
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