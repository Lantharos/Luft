/// <reference path="./gobject-2.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://xlib?version=2.0' {

// Module dependencies
import type GObject from 'gi://GObject?version=2.0';

export namespace xlib {

    /**
     * xlib-2.0
     */


    function open_display(): void;

    class Display {
        static $gtype: GObject.GType<Display>;
    }


    class Screen {
        static $gtype: GObject.GType<Screen>;
    }


    class Visual {
        static $gtype: GObject.GType<Visual>;
    }


    class XConfigureEvent {
        static $gtype: GObject.GType<XConfigureEvent>;
    }


    class XImage {
        static $gtype: GObject.GType<XImage>;
    }


    class XFontStruct {
        static $gtype: GObject.GType<XFontStruct>;
    }


    class XTrapezoid {
        static $gtype: GObject.GType<XTrapezoid>;
    }


    class XVisualInfo {
        static $gtype: GObject.GType<XVisualInfo>;
    }


    class XWindowAttributes {
        static $gtype: GObject.GType<XWindowAttributes>;
    }


    class XEvent {
        static $gtype: GObject.GType<XEvent>;
    }


    type Atom = bigint | number;

    type Colormap = bigint | number;

    type Cursor = bigint | number;

    type Drawable = bigint | number;

    type GC = never;

    type KeyCode = number;

    type KeySym = bigint | number;

    type Picture = bigint | number;

    type Time = bigint | number;

    type VisualID = bigint | number;

    type Window = bigint | number;

    type XID = bigint | number;

    type Pixmap = bigint | number;

    const __name__: string;

    const __version__: string;
}

export default xlib;

}

declare module 'gi://xlib' {
    import Xlib20 from 'gi://xlib?version=2.0';
    export default Xlib20;
}
// END
