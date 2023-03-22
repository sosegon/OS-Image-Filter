/**
 * Factory function to handle the visibility of images in a
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Window|window}
 * and within its
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement|iframes}.
 */
export default function ImagesDisplayer() {
    let showAll = false;
    let iframes = [];

    /**
     * Add an
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement|iframe}.
     *
     * @param {HTMLIFrameElement}
     */
    function addIFrame(iframe) {
        iframes.push(iframe);
    }
    /**
     * Display images in a
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Window|window}
     * and in its
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement|iframes}.
     */
    function showImages() {
        if (showAll) {
            return;
        }

        showAll = true;

        if (window === top) {
            chrome.runtime.sendMessage({
                r: 'setColorIcon',
                toggle: false
            });
        }

        if (window.skfShowImages !== null) {
            window.skfShowImages();
        }

        iframes.map(iframe => {
            try {
                if (iframe.contentWindow && iframe.contentWindow.skfShowImages) {
                    iframe.contentWindow.skfShowImages();
                }

            } catch (err) {

            }
        });
    }

    return {
        showAll,
        get showAllFlag() {
            return showAll;
        },
        set showAllFlag(isShowAll) {
            showAll = isShowAll;
        },
        addIFrame,
        showImages
    };
}