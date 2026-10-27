/// <reference path="./polkit-1.0.d.ts" />
/// <reference path="./gio-2.0.d.ts" />
/// <reference path="./gobject-2.0.d.ts" />
/// <reference path="./glib-2.0.d.ts" />
/// <reference path="./gmodule-2.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://PolkitAgent?version=1.0' {

// Module dependencies
import type Polkit from 'gi://Polkit?version=1.0';
import type Gio from 'gi://Gio?version=2.0';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type GModule from 'gi://GModule?version=2.0';

export namespace PolkitAgent {

    /**
     * PolkitAgent-1.0
     */


    function register_listener(listener: Listener, subject: Polkit.Subject, object_path: string): boolean;

    export namespace RegisterFlags {
        export const $gtype: GObject.GType<RegisterFlags>;
    }

    enum RegisterFlags {
        NONE = 0,
        RUN_IN_THREAD = 1,
    }


    namespace Listener {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class Listener extends GObject.Object {
        static $gtype: GObject.GType<Listener>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Listener.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Listener.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Listener.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Listener.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Listener.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Listener.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Listener.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Listener.SignalSignatures[K]>): void;

        // Static methods
        static unregister(registration_handle: null): void;

        // Virtual methods
        vfunc_initiate_authentication(action_id: string, message: string, icon_name: string, details: Polkit.Details, cookie: string, identities: Polkit.Identity[], cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_initiate_authentication_finish(res: Gio.AsyncResult): boolean;

        // Methods
        initiate_authentication(action_id: string, message: string, icon_name: string, details: Polkit.Details, cookie: string, identities: Polkit.Identity[], cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        initiate_authentication(action_id: string, message: string, icon_name: string, details: Polkit.Details, cookie: string, identities: Polkit.Identity[], cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        initiate_authentication(action_id: string, message: string, icon_name: string, details: Polkit.Details, cookie: string, identities: Polkit.Identity[], cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        initiate_authentication_finish(res: Gio.AsyncResult): boolean;

        register(flags: RegisterFlags, subject: Polkit.Subject, object_path: string, cancellable: Gio.Cancellable | null): null;

        register_with_options(flags: RegisterFlags, subject: Polkit.Subject, object_path: string, options: GLib.Variant | null, cancellable: Gio.Cancellable | null): null;
    }


    namespace Session {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            completed: (gained_authorization: boolean) => void;
            /** @signal */
            request: (request: string, echo_on: boolean) => void;
            /** @signal */
            "show-error": (text: string) => void;
            /** @signal */
            "show-info": (text: string) => void;
            "notify::cookie": (pspec: GObject.ParamSpec) => void;
            "notify::identity": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            cookie: string;
            identity: Polkit.Identity;
        }
    }

    class Session extends GObject.Object {
        static $gtype: GObject.GType<Session>;

        // Properties
        get cookie(): string;

        get identity(): Polkit.Identity;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Session.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Session.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](identity: Polkit.Identity, cookie: string): Session;

        // Signals
        /** @signal */
        connect<K extends keyof Session.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Session.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Session.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Session.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Session.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Session.SignalSignatures[K]>): void;

        // Methods
        cancel(): void;

        initiate(): void;

        response(response: string): void;
    }


    namespace TextListener {
        // Signal signatures
        interface SignalSignatures extends Listener.SignalSignatures {
            /** @signal */
            "tty-attrs-changed": (object: boolean) => void;
            "notify::delay": (pspec: GObject.ParamSpec) => void;
            "notify::use-alternate-buffer": (pspec: GObject.ParamSpec) => void;
            "notify::use-color": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Listener.ConstructorProps, Gio.Initable.ConstructorProps {
            delay: number;
            use_alternate_buffer: boolean;
            useAlternateBuffer: boolean;
            use_color: boolean;
            useColor: boolean;
        }
    }

    class TextListener extends Listener implements Gio.Initable {
        static $gtype: GObject.GType<TextListener>;

        // Properties
        get delay(): number;

        get use_alternate_buffer(): boolean;

        get useAlternateBuffer(): boolean;

        get use_color(): boolean;

        get useColor(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TextListener.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TextListener.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](cancellable: Gio.Cancellable | null): TextListener;

        // Signals
        /** @signal */
        connect<K extends keyof TextListener.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextListener.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TextListener.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextListener.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TextListener.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TextListener.SignalSignatures[K]>): void;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    type ListenerClass = typeof Listener;

    type SessionClass = typeof Session;

    const __name__: string;

    const __version__: string;
}

export default PolkitAgent;

}

declare module 'gi://PolkitAgent' {
    import PolkitAgent10 from 'gi://PolkitAgent?version=1.0';
    export default PolkitAgent10;
}
// END
