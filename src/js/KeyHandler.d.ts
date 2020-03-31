/**
 * A generic key handler.
 *
 * Example
 * =======
 *
 *	new KeyHandler( { trackAll : true } )
 *	    .down('enter',function() { console.log('ENTER was hit.'); } )
 *	    .press('enter',function() { console.log('ENTER was pressed.'); } )
 *	    .up('enter',function() { console.log('ENTER was released.'); } )
 *
 *          .down('e',function() { console.log('e was hit. shift is pressed?',keyHandler.isDown('shift')); } )
 *
 *	    .up('windows',function() { console.log('windows was released.'); } )
 *	;
 *
 * @author   Ikaros Kappler
 * @date     2018-11-11 (Alaaf)
 * @modified 2020-03-28 Ported this class from vanilla-JS to Typescript.
 * @version  1.0.1
 **/
export interface XKeyListener {
    key: string;
    keyCode: number;
    listener: (event: KeyboardEvent) => void;
}
export declare class KeyHandler {
    private element;
    private downListeners;
    private pressListeners;
    private upListeners;
    private keyStates;
    private trackAllKeys;
    private _keyDownListener;
    private _keyPressListener;
    private _keyUpListener;
    /**
     * The constructor.
     *
     * @param options.element (optional) The HTML element to listen on; if null then 'window' will be used.
     * @param options.trackAll (optional) Set to true if you want to keep track of _all_ keys (keyStatus).
    **/
    constructor(options: {
        element?: HTMLElement | Window;
        trackAll?: boolean;
    });
    /**
     * A helper function to fire key events from this KeyHandler.
     *
     * @param {KeyboardEvent} event - The key event to fire.
     * @param {Array<XKeyListener>} listener - The listeners to fire to.
     */
    private fireEvent;
    /**
     * Internal function to fire a new keydown event to all listeners.
     * You should not call this function on your own unless you know what you do.
     *
     * @param {KeyboardEvent} e
     * @param {KeyHandler} handler
     */
    private fireDownEvent;
    /**
     * Internal function to fire a new keypress event to all listeners.
     * You should not call this function on your own unless you know what you do.
     *
     * @param {KeyboardEvent} e
     * @param {KeyHandler} handler
     */
    private firePressEvent;
    /**
     * Internal function to fire a new keyup event to all listeners.
     * You should not call this function on your own unless you know what you do.
     *
     * @param {KeyboardEvent} e
     * @param {KeyHandler} handler
     */
    private fireUpEvent;
    /**
     * Resolve the key/name code.
     */
    static key2code(key: number | string): number;
    /**
     * Source:
     * https://keycode.info/
     */
    private static KEY_CODES;
    /**
     * Install the required listeners into the initially passed element.
     *
     * By default the listeners are installed into the root element specified on
     * construction (or 'window').
     */
    installListeners(): void;
    /**
     *  Remove all installed event listeners from the underlying element.
     */
    releaseListeners(): void;
    /**
     * Listen for key down. This function allows chaining.
     *
     * Example: new KeyHandler().down('enter',function() {console.log('Enter hit.')});
     *
     * @param {string|number} key -  Any key identifier, key code or one from the KEY_CODES list.
     * @param {(e:KeyboardEvent)=>void} e -  The callback to be triggered.
     */
    down(key: string | number, listener: (e: KeyboardEvent) => void): KeyHandler;
    /**
     * Listen for key press.
     *
     * Example: new KeyHandler().press('enter',function() {console.log('Enter pressed.')});
     *
     * @param {string|number} key - Any key identifier, key code or one from the KEY_CODES list.
     * @param {(e:KeyboardEvent)=>void} listener - The callback to be triggered.
     */
    press(key: string | number, listener: (e: KeyboardEvent) => void): KeyHandler;
    /**
     * Listen for key up.
     *
     * Example: new KeyHandler().up('enter',function() {console.log('Enter released.')});
     *
     *  @param {string} key - Any key identifier, key code or one from the KEY_CODES list.
     *  @param {(e:KeyboardEvent)=>void) e - The callback to be triggered.
     */
    up(key: string, listener: (e: KeyboardEvent) => void): KeyHandler;
    /**
     *  Check if a specific key is currently held pressed.
     *
     * @param {string|number} key - Any key identifier, key code or one from the KEY_CODES list.
     */
    isDown(key: string | number): boolean;
}
