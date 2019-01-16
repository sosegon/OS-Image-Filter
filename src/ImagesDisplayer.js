class ImagesDisplayer {
    constructor() {
        this.showAll = false;
        this.iframes = [];
    }
    setShowAll(show) {
        this.showAll = show;
    }
    isShowAll() {
        return this.showAll;
    }
    addIFrame(iframe) {
        this.iframes.push(iframe);
    }
    /**
     * Display images in webpage and iframes
     */
    showImages() {
        if (this.showAll) {
            return;
        }

        this.showAll = true;

        if (window === top) {
            chrome.runtime.sendMessage({
                r: 'setColorIcon',
                toggle: false
            });
        }

        if (window.skfShowImages !== null) {
            window.skfShowImages();
        }

        this.iframes.map(iframe => {
            try {
                if (iframe.contentWindow && iframe.contentWindow.skfShowImages) {
                    iframe.contentWindow.skfShowImages();
                }

            } catch (err) {

            }
        });
    }
}