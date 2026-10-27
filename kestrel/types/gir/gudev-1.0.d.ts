/// <reference path="./gobject-2.0.d.ts" />
/// <reference path="./glib-2.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://GUdev?version=1.0' {

// Module dependencies
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';

export namespace GUdev {

    /**
     * GUdev-1.0
     */


    export namespace DeviceType {
        export const $gtype: GObject.GType<DeviceType>;
    }

    enum DeviceType {
        NONE = 0,
        BLOCK = 98,
        CHAR = 99,
    }


    namespace Client {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            uevent: (action: string, device: Device) => void;
            "notify::subsystems": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            subsystems: string[];
        }
    }

    class Client extends GObject.Object {
        static $gtype: GObject.GType<Client>;

        // Properties
        get subsystems(): string[];

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Client.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Client.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](subsystems: string[] | null): Client;

        // Signals
        /** @signal */
        connect<K extends keyof Client.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Client.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Client.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Client.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Client.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Client.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_uevent(action: string, device: Device): void;

        // Methods
        query_by_device_file(device_file: string): Device | null;

        query_by_device_number(type: DeviceType, number: DeviceNumber): Device | null;

        query_by_subsystem(subsystem: string | null): Device[] | null;

        query_by_subsystem_and_name(subsystem: string, name: string): Device | null;

        query_by_sysfs_path(sysfs_path: string): Device | null;
    }


    namespace Device {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Device extends GObject.Object {
        static $gtype: GObject.GType<Device>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Device.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Device.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Device.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Device.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Device.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Device.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Device.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Device.SignalSignatures[K]>): void;

        // Methods
        get_action(): string;

        get_current_tags(): string[];

        get_device_file(): string | null;

        get_device_file_symlinks(): string[];

        get_device_number(): DeviceNumber;

        get_device_type(): DeviceType;

        get_devtype(): string;

        get_driver(): string | null;

        get_is_initialized(): boolean;

        get_name(): string;

        get_number(): string;

        get_parent(): Device | null;

        get_parent_with_subsystem(subsystem: string, devtype: string | null): Device | null;

        get_property(key: string): string | null;

    // Conflicted with GObject.Object.get_property
        get_property(...args: never[]): any;

        get_property_as_boolean(key: string): boolean;

        get_property_as_double(key: string): number;

        get_property_as_int(key: string): number;

        get_property_as_strv(key: string): string[] | null;

        get_property_as_uint64(key: string): number;

        get_property_keys(): string[];

        get_seqnum(): number;

        get_subsystem(): string;

        get_sysfs_attr(name: string): string | null;

        get_sysfs_attr_as_boolean(name: string): boolean;

        get_sysfs_attr_as_boolean_uncached(name: string): boolean;

        get_sysfs_attr_as_double(name: string): number;

        get_sysfs_attr_as_double_uncached(name: string): number;

        get_sysfs_attr_as_int(name: string): number;

        get_sysfs_attr_as_int_uncached(name: string): number;

        get_sysfs_attr_as_strv(name: string): string[] | null;

        get_sysfs_attr_as_strv_uncached(name: string): string[] | null;

        get_sysfs_attr_as_uint64(name: string): number;

        get_sysfs_attr_as_uint64_uncached(name: string): number;

        get_sysfs_attr_keys(): string[];

        get_sysfs_attr_uncached(name: string): string | null;

        get_sysfs_path(): string;

        get_tags(): string[];

        get_usec_since_initialized(): number;

        has_property(key: string): boolean;

        has_sysfs_attr(key: string): boolean;

        has_sysfs_attr_uncached(key: string): boolean;
    }


    namespace Enumerator {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::client": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            client: Client;
        }
    }

    class Enumerator extends GObject.Object {
        static $gtype: GObject.GType<Enumerator>;

        // Properties
        get client(): Client;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Enumerator.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Enumerator.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](client: Client): Enumerator;

        // Signals
        /** @signal */
        connect<K extends keyof Enumerator.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Enumerator.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Enumerator.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Enumerator.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Enumerator.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Enumerator.SignalSignatures[K]>): void;

        // Methods
        add_match_is_initialized(): Enumerator;

        add_match_name(name: string): Enumerator;

        add_match_property(name: string, value: string): Enumerator;

        add_match_subsystem(subsystem: string): Enumerator;

        add_match_sysfs_attr(name: string, value: string): Enumerator;

        add_match_tag(tag: string): Enumerator;

        add_nomatch_subsystem(subsystem: string): Enumerator;

        add_nomatch_sysfs_attr(name: string, value: string): Enumerator;

        add_sysfs_path(sysfs_path: string): Enumerator;

        execute(): Device[];
    }


    type ClientClass = typeof Client;

    abstract class ClientPrivate {
        static $gtype: GObject.GType<ClientPrivate>;
    }


    type DeviceClass = typeof Device;

    abstract class DevicePrivate {
        static $gtype: GObject.GType<DevicePrivate>;
    }


    type EnumeratorClass = typeof Enumerator;

    abstract class EnumeratorPrivate {
        static $gtype: GObject.GType<EnumeratorPrivate>;
    }


    type DeviceNumber = bigint | number;

    const __name__: string;

    const __version__: string;
}

export default GUdev;

}

declare module 'gi://GUdev' {
    import GUdev10 from 'gi://GUdev?version=1.0';
    export default GUdev10;
}
// END
