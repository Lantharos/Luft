/// <reference path="./gobject-2.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://GL?version=1.0' {

// Module dependencies
import type GObject from 'gi://GObject?version=2.0';

export namespace GL {

    /**
     * GL-1.0
     */


    function InitNames(): void;

    class bitfield {
        static $gtype: GObject.GType<bitfield>;
    }


    class charARB {
        static $gtype: GObject.GType<charARB>;
    }


    class clampf {
        static $gtype: GObject.GType<clampf>;
    }


    class __boolean {
        static $gtype: GObject.GType<__boolean>;
    }


    class __enum {
        static $gtype: GObject.GType<__enum>;
    }


    class float {
        static $gtype: GObject.GType<float>;
    }


    class handleARB {
        static $gtype: GObject.GType<handleARB>;
    }


    class int {
        static $gtype: GObject.GType<int>;
    }


    class intptr {
        static $gtype: GObject.GType<intptr>;
    }


    class sizei {
        static $gtype: GObject.GType<sizei>;
    }


    class sizeiptr {
        static $gtype: GObject.GType<sizeiptr>;
    }


    class uint {
        static $gtype: GObject.GType<uint>;
    }


    class __void {
        static $gtype: GObject.GType<__void>;
    }


    const __name__: string;

    const __version__: string;
}

export default GL;

}

declare module 'gi://GL' {
    import GL10 from 'gi://GL?version=1.0';
    export default GL10;
}
// END
