/**
 * Identifier for the global
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement|canvas}
 * to process the images of a webpage and gray them out.
 */
export const CANVAS_GLOBAL_ID = 'skf-canvas-global';
/**
 * Attribute to set an uuid for an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}
 * that have to be processed. This attribute is set in the html tag.
 */
export const ATTR_UUID = 'skf-uuid';
/**
 * Attribute to set the bounding rectangle of an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * This attribute is set in the html tag.
 */
export const ATTR_RECTANGLE = 'skf-rectangle';
/**
 * Attribute to set the background-image value of the css style of an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * This attribute is set in the javascript object.
 */
export const ATTR_LAST_CHECKED_SRC = 'skf-last-checked-src';
/**
 * Name of the flag to be set as an attribute in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * This flag helps to determine if the element has been hidden.
 * This flag is set in the javascript object.
 */
export const IS_HIDDEN = 'skf-is-hidden';
/**
 * Name of the flag to be set as an attribute in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement|image}.
 * This flag helps to determine if the src attribute of the image
 * element has been toggled.
 * This attribute is set in the html tag.
 */
export const IS_TOGGLED = 'skf-is-toggled';
/**
 * Name of the flag to be set as an attribute in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * This flag helps to determine if the element has been already
 * processed to filter the skin color. This flag is set in the
 * javascript object as well as in the html tag.
 */
export const IS_PROCESSED = 'skf-is-processed';
/**
 * Name of the flag to be set as an attribute in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * This flag is used when the mouse pointer is hovering the eleement.
 * This flag is set in the javascript object.
 */
export const HAS_HOVER = 'skf-has-hover';
/**
 * Name of the flag to be set as an attribute in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * This flag is used to determine if the show icon has to be displayed
 * in the element.
 * This flag is set in the javascript object.
 */
export const HAS_HOVER_VISUAL = 'skf-has-hover-visual';
/**
 * Name of the flag to be set as an attribute in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * This flag is used to determine if the element as a listener to be
 * called when the load event is triggered.
 * This flag is set in the javascript object.
 */
export const HAS_LOAD_LISTENER = 'skf-has-load-listener';
/**
 * Name of the flag to be set as an attribute in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * This flag is used to determine if the element as a listener to be
 * called when the load event is triggered. The listener is meant to
 * do the skin filtering.
 * This flag is set in the javascript object.
 */
export const HAS_PROCESS_IMAGE_LISTENER = 'skf-has-process-image-listener';
/**
 * Name of the flag to be set as an attribute in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * This flag is used to determine if the element has listeners for
 * mouse events.
 * This flag is set in the javascript object.
 */
export const HAS_MOUSE_LISTENERS = 'skf-has-mouse-listeners';
/**
 * Name of the flag to be set as an attribute in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement|image}.
 * This flag is used to determine if the image element has title and
 * size attributes.
 * This flag is set in the javascript object.
 */
export const HAS_TITLE_AND_SIZE = 'skf-has-title-and-size';
/**
 * Name of the flag to be set as an attribute in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * This flag is used to determine if the element has a css class for
 * that defines a background image for the element.
 * This flag is set in the javascript object.
 */
export const HAS_BACKGROUND_IMAGE = 'skf-has-background-image';
/**
 * Attribute to set a timeout in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 * The timeout is meant to collaborate in the positioning of the show
 * icon.
 * This flag is set in the javascript object.
 */
export const ATTR_CLEAR_HOVER_VISUAL_TIMER = 'skf-clear-hover-visual-timer';
/**
 * Css class name that hides an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 */
export const CSS_CLASS_HIDE = 'skf-hide';
/**
 * Css class name that shades an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|element}.
 */
export const CSS_CLASS_SHADE = 'skf-shade';
/**
 * Css class name for the paypal donation section
 */
export const CSS_CLASS_PAYPAL_DONATION = 'skf-paypal-donation';
/**
 * Css class name that puts a background image pattern in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|elements}.
 */
export const CSS_CLASS_BACKGROUND_PATTERN = 'skf-background-pattern-image';
/**
 * Css class name that puts a light background image pattern in an
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|elements}.
 */
export const CSS_CLASS_BACKGROUND_LIGHT_PATTERN = 'skf-background-light-pattern-image';