function doSkifImageBG(el, toggle) {
    if (toggle && !el[ATTR_HAS_BACKGROUND_IMAGE]) {
        // var shade = Math.floor(Math.random() * 8);
        // el.skfShade = shade;
        // AddClass(el, 'skfPatternBgImg skfShade' + shade);
        el[ATTR_HAS_BACKGROUND_IMAGE] = true;
    } else if (!toggle && el[ATTR_HAS_BACKGROUND_IMAGE]) {
        // RemoveClass(el, 'skfPatternBgImg');
        // RemoveClass(el, 'skfShade' + el.skfShade);
        el[ATTR_HAS_BACKGROUND_IMAGE] = false;
    }
}