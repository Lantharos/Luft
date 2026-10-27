/// <reference path="./glib-2.0.d.ts" />
/// <reference path="./gobject-2.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://GModule?version=2.0' {

// Module dependencies
import type GLib from 'gi://GLib?version=2.0';
import type GObject from 'gi://GObject?version=2.0';

export namespace GModule {

    /**
     * GModule-2.0
     */


    class ModuleError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static CHECK_FAILED: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    const MODULE_IMPL_AR: number;

    const MODULE_IMPL_DL: number;

    const MODULE_IMPL_NONE: number;

    const MODULE_IMPL_WIN32: number;

    function module_build_path(directory: string | null, module_name: string): string;

    function module_error(): string;

    function module_error_quark(): GLib.Quark;

    function module_supported(): boolean;

    interface ModuleCheckInit {
        (module: Module): string;
    }

    interface ModuleUnload {
        (module: Module): void;
    }

    enum ModuleFlags {
        LAZY = 1,
        LOCAL = 2,
        MASK = 3,
    }


    abstract class Module {
        static $gtype: GObject.GType<Module>;

        // Static methods
        static build_path(directory: string | null, module_name: string): string;

        static error(): string;

        static error_quark(): GLib.Quark;

        static supported(): boolean;

        // Methods
        close(): boolean;

        make_resident(): void;

        name(): string;

        symbol(symbol_name: string): [boolean, null];
    }


    const __name__: string;

    const __version__: string;
}

export default GModule;

}

declare module 'gi://GModule' {
    import GModule20 from 'gi://GModule?version=2.0';
    export default GModule20;
}
// END
