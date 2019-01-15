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

        for (let i = 0, max = this.iframes.length; i < max; i++) {
            try {
                if (this.iframes[i].contentWindow && this.iframes[i].contentWindow.skfShowImages) {
                    this.iframes[i].contentWindow.skfShowImages();
                }
            } catch (err) {
                // Iframe may have been rewritten.
            }
        }
    }
}