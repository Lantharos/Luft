/// <reference path="./gobject-2.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://DBus?version=1.0' {

// Module dependencies
import type GObject from 'gi://GObject?version=2.0';

export namespace DBus {

    /**
     * DBus-1.0
     */


    enum BusType {
        SESSION = 0,
        SYSTEM = 1,
        STARTER = 2,
    }


    class Connection {
        static $gtype: GObject.GType<Connection>;
    }


    class Error {
        static $gtype: GObject.GType<Error>;
    }


    class Message {
        static $gtype: GObject.GType<Message>;
    }


    class MessageIter {
        static $gtype: GObject.GType<MessageIter>;
    }


    class PendingCall {
        static $gtype: GObject.GType<PendingCall>;
    }


    const __name__: string;

    const __version__: string;
}

export default DBus;

}

declare module 'gi://DBus' {
    import DBus10 from 'gi://DBus?version=1.0';
    export default DBus10;
}
// END
