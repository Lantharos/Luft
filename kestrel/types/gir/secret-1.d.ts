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

declare module 'gi://Secret?version=1' {

// Module dependencies
import type Gio from 'gi://Gio?version=2.0';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type GModule from 'gi://GModule?version=2.0';

export namespace Secret {

    /**
     * Secret-1
     */


    export namespace BackendFlags {
        export const $gtype: GObject.GType<BackendFlags>;
    }

    enum BackendFlags {
        NONE = 0,
        OPEN_SESSION = 2,
        LOAD_COLLECTIONS = 4,
    }


    export namespace Error {
        export const $gtype: GObject.GType<Error>;
    }

    enum Error {
        PROTOCOL = 1,
        IS_LOCKED = 2,
        NO_SUCH_OBJECT = 3,
        ALREADY_EXISTS = 4,
        INVALID_FILE_FORMAT = 5,
        MISMATCHED_SCHEMA = 6,
        NO_MATCHING_ATTRIBUTE = 7,
        WRONG_TYPE = 8,
        EMPTY_TABLE = 9,
    }


    export namespace SchemaAttributeType {
        export const $gtype: GObject.GType<SchemaAttributeType>;
    }

    enum SchemaAttributeType {
        STRING = 0,
        INTEGER = 1,
        BOOLEAN = 2,
    }


    export namespace SchemaType {
        export const $gtype: GObject.GType<SchemaType>;
    }

    enum SchemaType {
        NOTE = 0,
        COMPAT_NETWORK = 1,
    }


    const BACKEND_EXTENSION_POINT_NAME: string;

    const COLLECTION_DEFAULT: string;

    const COLLECTION_SESSION: string;

    const MAJOR_VERSION: number;

    const MICRO_VERSION: number;

    const MINOR_VERSION: number;

    function attributes_validate(schema: Schema, attributes: never): boolean;

    function backend_get(flags: BackendFlags, cancellable: Gio.Cancellable | null): globalThis.Promise<Backend>;
    function backend_get(flags: BackendFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<BackendFlags> | null): void;
    function backend_get(flags: BackendFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<BackendFlags> | null): globalThis.Promise<Backend> | void;

    function backend_get_finish(result: Gio.AsyncResult): Backend;

    function error_get_quark(): GLib.Quark;

    function get_schema(type: SchemaType): Schema;

    function password_clear_finish(result: Gio.AsyncResult): boolean;

    function password_clear(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;
    function password_clear(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Schema | null> | null): void;
    function password_clear(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Schema | null> | null): globalThis.Promise<boolean> | void;

    function password_clear_sync(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null): boolean;

    function password_lookup_finish(result: Gio.AsyncResult): string;

    function password_lookup(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null): globalThis.Promise<string>;
    function password_lookup(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Schema | null> | null): void;
    function password_lookup(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Schema | null> | null): globalThis.Promise<string> | void;

    function password_lookup_sync(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null): string;

    function password_search_finish(result: Gio.AsyncResult): Retrievable[];

    function password_search(schema: Schema | null, attributes: { [key: string]: string }, flags: SearchFlags, cancellable: Gio.Cancellable | null): globalThis.Promise<Retrievable[]>;
    function password_search(schema: Schema | null, attributes: { [key: string]: string }, flags: SearchFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Schema | null> | null): void;
    function password_search(schema: Schema | null, attributes: { [key: string]: string }, flags: SearchFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Schema | null> | null): globalThis.Promise<Retrievable[]> | void;

    function password_search_sync(schema: Schema | null, attributes: { [key: string]: string }, flags: SearchFlags, cancellable: Gio.Cancellable | null): Retrievable[];

    function password_store_finish(result: Gio.AsyncResult): boolean;

    function password_store(schema: Schema | null, attributes: { [key: string]: string }, collection: string | null, label: string, password: string, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;
    function password_store(schema: Schema | null, attributes: { [key: string]: string }, collection: string | null, label: string, password: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Schema | null> | null): void;
    function password_store(schema: Schema | null, attributes: { [key: string]: string }, collection: string | null, label: string, password: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Schema | null> | null): globalThis.Promise<boolean> | void;

    function password_store_binary(schema: Schema | null, attributes: { [key: string]: string }, collection: string | null, label: string, value: Value, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Schema | null> | null): void;

    function password_store_binary_sync(schema: Schema | null, attributes: { [key: string]: string }, collection: string | null, label: string, value: Value, cancellable: Gio.Cancellable | null): boolean;

    function password_store_sync(schema: Schema | null, attributes: { [key: string]: string }, collection: string | null, label: string, password: string, cancellable: Gio.Cancellable | null): boolean;

    function password_wipe(password: string | null): void;

    export namespace CollectionCreateFlags {
        export const $gtype: GObject.GType<CollectionCreateFlags>;
    }

    enum CollectionCreateFlags {
        NONE = 0,
    }


    export namespace CollectionFlags {
        export const $gtype: GObject.GType<CollectionFlags>;
    }

    enum CollectionFlags {
        NONE = 0,
        LOAD_ITEMS = 2,
    }


    export namespace ItemCreateFlags {
        export const $gtype: GObject.GType<ItemCreateFlags>;
    }

    enum ItemCreateFlags {
        NONE = 0,
        REPLACE = 2,
    }


    export namespace ItemFlags {
        export const $gtype: GObject.GType<ItemFlags>;
    }

    enum ItemFlags {
        NONE = 0,
        LOAD_SECRET = 2,
    }


    export namespace SchemaFlags {
        export const $gtype: GObject.GType<SchemaFlags>;
    }

    enum SchemaFlags {
        NONE = 0,
        DONT_MATCH_NAME = 2,
    }


    export namespace SearchFlags {
        export const $gtype: GObject.GType<SearchFlags>;
    }

    enum SearchFlags {
        NONE = 0,
        ALL = 2,
        UNLOCK = 4,
        LOAD_SECRETS = 8,
    }


    export namespace ServiceFlags {
        export const $gtype: GObject.GType<ServiceFlags>;
    }

    enum ServiceFlags {
        NONE = 0,
        OPEN_SESSION = 2,
        LOAD_COLLECTIONS = 4,
    }


    namespace Collection {
        // Signal signatures
        interface SignalSignatures extends Gio.DBusProxy.SignalSignatures {
            "notify::created": (pspec: GObject.ParamSpec) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::label": (pspec: GObject.ParamSpec) => void;
            "notify::locked": (pspec: GObject.ParamSpec) => void;
            "notify::modified": (pspec: GObject.ParamSpec) => void;
            "notify::service": (pspec: GObject.ParamSpec) => void;
            "notify::g-bus-type": (pspec: GObject.ParamSpec) => void;
            "notify::g-connection": (pspec: GObject.ParamSpec) => void;
            "notify::g-default-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::g-flags": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-info": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name-owner": (pspec: GObject.ParamSpec) => void;
            "notify::g-object-path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gio.DBusProxy.ConstructorProps, Gio.AsyncInitable.ConstructorProps, Gio.DBusInterface.ConstructorProps, Gio.Initable.ConstructorProps {
            created: bigint | number;
            flags: CollectionFlags;
            label: string;
            locked: boolean;
            modified: bigint | number;
            service: Service;
        }
    }

    class Collection extends Gio.DBusProxy implements Gio.AsyncInitable<Collection>, Gio.DBusInterface, Gio.Initable {
        static $gtype: GObject.GType<Collection>;

        // Properties
        get created(): number;
        set created(val: bigint | number);

        get flags(): CollectionFlags;

        get label(): string;
        set label(val: string);

        get locked(): boolean;

        get modified(): number;
        set modified(val: bigint | number);

        get service(): Service;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Collection.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Collection.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Collection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Collection.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Collection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Collection.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Collection.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Collection.SignalSignatures[K]>): void;

        // Static methods
        static create(service: Service | null, label: string, alias: string | null, flags: CollectionCreateFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Collection> | null): void;

        static create_finish(result: Gio.AsyncResult): Collection;

        static create_sync(service: Service | null, label: string, alias: string | null, flags: CollectionCreateFlags, cancellable: Gio.Cancellable | null): Collection;

        static for_alias(service: Service | null, alias: string, flags: CollectionFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Collection> | null): void;

        static for_alias_finish(result: Gio.AsyncResult): Collection | null;

        static for_alias_sync(service: Service | null, alias: string, flags: CollectionFlags, cancellable: Gio.Cancellable | null): Collection | null;

        // Methods
        ["delete"](cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        ["delete"](cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        ["delete"](cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        delete_finish(result: Gio.AsyncResult): boolean;

        delete_sync(cancellable: Gio.Cancellable | null): boolean;

        get_created(): number;

        get_flags(): CollectionFlags;

    // Conflicted with Gio.DBusProxy.get_flags
        get_flags(...args: never[]): any;

        get_items(): Item[];

        get_label(): string;

        get_locked(): boolean;

        get_modified(): number;

        get_service(): Service;

        load_items(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        load_items(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        load_items(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        load_items_finish(result: Gio.AsyncResult): boolean;

        load_items_sync(cancellable: Gio.Cancellable | null): boolean;

        refresh(): void;

        search(schema: Schema | null, attributes: { [key: string]: string }, flags: SearchFlags, cancellable: Gio.Cancellable | null): globalThis.Promise<Item[]>;

        search(schema: Schema | null, attributes: { [key: string]: string }, flags: SearchFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        search(schema: Schema | null, attributes: { [key: string]: string }, flags: SearchFlags, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Item[]> | void;

        search_finish(result: Gio.AsyncResult): Item[];

        search_sync(schema: Schema | null, attributes: { [key: string]: string }, flags: SearchFlags, cancellable: Gio.Cancellable | null): Item[];

        set_label(label: string, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        set_label(label: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        set_label(label: string, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        set_label_finish(result: Gio.AsyncResult): boolean;

        set_label_sync(label: string, cancellable: Gio.Cancellable | null): boolean;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: Gio.AsyncResult): boolean;

        new_finish(res: Gio.AsyncResult): Collection;

        // Conflicted with Gio.DBusProxy.new_finish
        new_finish(...args: never[]): any;

        vfunc_init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: Gio.AsyncResult): boolean;

        get_object(): Gio.DBusObject | null;

        get_info(): Gio.DBusInterfaceInfo | null;

        set_object(object: Gio.DBusObject | null): void;

        vfunc_dup_object(): Gio.DBusObject | null;

        vfunc_get_info(): Gio.DBusInterfaceInfo | null;

        vfunc_set_object(object: Gio.DBusObject | null): void;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace Item {
        // Signal signatures
        interface SignalSignatures extends Gio.DBusProxy.SignalSignatures {
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::locked": (pspec: GObject.ParamSpec) => void;
            "notify::service": (pspec: GObject.ParamSpec) => void;
            "notify::g-bus-type": (pspec: GObject.ParamSpec) => void;
            "notify::g-connection": (pspec: GObject.ParamSpec) => void;
            "notify::g-default-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::g-flags": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-info": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name-owner": (pspec: GObject.ParamSpec) => void;
            "notify::g-object-path": (pspec: GObject.ParamSpec) => void;
            "notify::attributes": (pspec: GObject.ParamSpec) => void;
            "notify::created": (pspec: GObject.ParamSpec) => void;
            "notify::label": (pspec: GObject.ParamSpec) => void;
            "notify::modified": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gio.DBusProxy.ConstructorProps, Gio.AsyncInitable.ConstructorProps, Gio.DBusInterface.ConstructorProps, Gio.Initable.ConstructorProps, Retrievable.ConstructorProps {
            flags: ItemFlags;
            locked: boolean;
            service: Service;
        }
    }

    class Item extends Gio.DBusProxy implements Gio.AsyncInitable<Item>, Gio.DBusInterface, Gio.Initable, Retrievable {
        static $gtype: GObject.GType<Item>;

        // Properties
        get flags(): ItemFlags;

        get locked(): boolean;

        get service(): Service;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Item.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Item.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Item.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Item.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Item.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Item.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Item.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Item.SignalSignatures[K]>): void;

        // Static methods
        static create(collection: Collection, schema: Schema | null, attributes: { [key: string]: string }, label: string, value: Value, flags: ItemCreateFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Item> | null): void;

        static create_finish(result: Gio.AsyncResult): Item;

        static create_sync(collection: Collection, schema: Schema | null, attributes: { [key: string]: string }, label: string, value: Value, flags: ItemCreateFlags, cancellable: Gio.Cancellable | null): Item;

        static load_secrets(items: Item[], cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Item> | null): void;

        static load_secrets_finish(result: Gio.AsyncResult): boolean;

        static load_secrets_sync(items: Item[], cancellable: Gio.Cancellable | null): boolean;

        // Methods
        ["delete"](cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        ["delete"](cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        ["delete"](cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        delete_finish(result: Gio.AsyncResult): boolean;

        delete_sync(cancellable: Gio.Cancellable | null): boolean;

        get_attributes(): { [key: string]: string };

        get_created(): number;

        get_flags(): ItemFlags;

    // Conflicted with Gio.DBusProxy.get_flags
        get_flags(...args: never[]): any;

        get_label(): string;

        get_locked(): boolean;

        get_modified(): number;

        get_schema_name(): string | null;

        get_secret(): Value | null;

        get_service(): Service;

        load_secret(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        load_secret(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        load_secret(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        load_secret_finish(result: Gio.AsyncResult): boolean;

        load_secret_sync(cancellable: Gio.Cancellable | null): boolean;

        refresh(): void;

        set_attributes(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        set_attributes(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        set_attributes(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        set_attributes_finish(result: Gio.AsyncResult): boolean;

        set_attributes_sync(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null): boolean;

        set_label(label: string, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        set_label(label: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        set_label(label: string, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        set_label_finish(result: Gio.AsyncResult): boolean;

        set_label_sync(label: string, cancellable: Gio.Cancellable | null): boolean;

        set_secret(value: Value, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        set_secret(value: Value, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        set_secret(value: Value, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        set_secret_finish(result: Gio.AsyncResult): boolean;

        set_secret_sync(value: Value, cancellable: Gio.Cancellable | null): boolean;

        /** @category Inherited from Secret.Retrievable */
        get attributes(): { [key: string]: string };
        set attributes(val: { [key: string]: string });

        /** @category Inherited from Secret.Retrievable */
        get created(): number;
        set created(val: bigint | number);

        /** @category Inherited from Secret.Retrievable */
        get label(): string;
        set label(val: string);

        /** @category Inherited from Secret.Retrievable */
        get modified(): number;
        set modified(val: bigint | number);

        init_async(io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: Gio.AsyncResult): boolean;

        new_finish(res: Gio.AsyncResult): Item;

        // Conflicted with Gio.DBusProxy.new_finish
        new_finish(...args: never[]): any;

        vfunc_init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: Gio.AsyncResult): boolean;

        get_object(): Gio.DBusObject | null;

        get_info(): Gio.DBusInterfaceInfo | null;

        set_object(object: Gio.DBusObject | null): void;

        vfunc_dup_object(): Gio.DBusObject | null;

        vfunc_get_info(): Gio.DBusInterfaceInfo | null;

        vfunc_set_object(object: Gio.DBusObject | null): void;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;

        retrieve_secret(cancellable: Gio.Cancellable | null): globalThis.Promise<Value | null>;

        retrieve_secret(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        retrieve_secret(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Value | null> | void;

        retrieve_secret_finish(result: Gio.AsyncResult): Value | null;

        retrieve_secret_sync(cancellable: Gio.Cancellable | null): Value | null;

        vfunc_retrieve_secret(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_retrieve_secret_finish(result: Gio.AsyncResult): Value | null;
    }


    namespace Prompt {
        // Signal signatures
        interface SignalSignatures extends Gio.DBusProxy.SignalSignatures {
            "notify::g-bus-type": (pspec: GObject.ParamSpec) => void;
            "notify::g-connection": (pspec: GObject.ParamSpec) => void;
            "notify::g-default-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::g-flags": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-info": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name-owner": (pspec: GObject.ParamSpec) => void;
            "notify::g-object-path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gio.DBusProxy.ConstructorProps, Gio.AsyncInitable.ConstructorProps, Gio.DBusInterface.ConstructorProps, Gio.Initable.ConstructorProps {}
    }

    class Prompt extends Gio.DBusProxy implements Gio.AsyncInitable<Prompt>, Gio.DBusInterface, Gio.Initable {
        static $gtype: GObject.GType<Prompt>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Prompt.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Prompt.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Prompt.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Prompt.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Prompt.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Prompt.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Prompt.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Prompt.SignalSignatures[K]>): void;

        // Methods
        perform(window_id: string | null, return_type: GLib.VariantType, cancellable: Gio.Cancellable | null): globalThis.Promise<GLib.Variant>;

        perform(window_id: string | null, return_type: GLib.VariantType, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        perform(window_id: string | null, return_type: GLib.VariantType, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<GLib.Variant> | void;

        perform_finish(result: Gio.AsyncResult): GLib.Variant;

        perform_sync(window_id: string | null, cancellable: Gio.Cancellable | null, return_type: GLib.VariantType): GLib.Variant;

        run(window_id: string | null, cancellable: Gio.Cancellable | null, return_type: GLib.VariantType): GLib.Variant;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: Gio.AsyncResult): boolean;

        new_finish(res: Gio.AsyncResult): Prompt;

        // Conflicted with Gio.DBusProxy.new_finish
        new_finish(...args: never[]): any;

        vfunc_init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: Gio.AsyncResult): boolean;

        get_object(): Gio.DBusObject | null;

        get_info(): Gio.DBusInterfaceInfo | null;

        set_object(object: Gio.DBusObject | null): void;

        vfunc_dup_object(): Gio.DBusObject | null;

        vfunc_get_info(): Gio.DBusInterfaceInfo | null;

        vfunc_set_object(object: Gio.DBusObject | null): void;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace Service {
        // Signal signatures
        interface SignalSignatures extends Gio.DBusProxy.SignalSignatures {
            "notify::g-bus-type": (pspec: GObject.ParamSpec) => void;
            "notify::g-connection": (pspec: GObject.ParamSpec) => void;
            "notify::g-default-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::g-flags": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-info": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name-owner": (pspec: GObject.ParamSpec) => void;
            "notify::g-object-path": (pspec: GObject.ParamSpec) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gio.DBusProxy.ConstructorProps, Gio.AsyncInitable.ConstructorProps, Gio.DBusInterface.ConstructorProps, Gio.Initable.ConstructorProps, Backend.ConstructorProps {}
    }

    class Service extends Gio.DBusProxy implements Gio.AsyncInitable<Service>, Gio.DBusInterface, Gio.Initable, Backend {
        static $gtype: GObject.GType<Service>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Service.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Service.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Service.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Service.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Service.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Service.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Service.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Service.SignalSignatures[K]>): void;

        // Static methods
        static disconnect(): void;

        static get(flags: ServiceFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Service> | null): void;

    // Conflicted with Secret.Backend.get
        static get(...args: never[]): any;

        static get_finish(result: Gio.AsyncResult): Service;

        static get_sync(flags: ServiceFlags, cancellable: Gio.Cancellable | null): Service;

        static open(service_gtype: GObject.GType, service_bus_name: string | null, flags: ServiceFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Service> | null): void;

        static open_finish(result: Gio.AsyncResult): Service;

        static open_sync(service_gtype: GObject.GType, service_bus_name: string | null, flags: ServiceFlags, cancellable: Gio.Cancellable | null): Service;

        // Virtual methods
        vfunc_get_collection_gtype(): GObject.GType;

        vfunc_get_item_gtype(): GObject.GType;

        vfunc_prompt_async(prompt: Prompt, return_type: GLib.VariantType, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_prompt_finish(result: Gio.AsyncResult): GLib.Variant;

        vfunc_prompt_sync(prompt: Prompt, cancellable: Gio.Cancellable | null, return_type: GLib.VariantType): GLib.Variant;

        // Methods
        clear(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        clear(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        clear(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        clear_finish(result: Gio.AsyncResult): boolean;

        clear_sync(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null): boolean;

        create_item_dbus_path_sync(collection_path: string, properties: { [key: string]: GLib.Variant }, value: Value, flags: ItemCreateFlags, cancellable: Gio.Cancellable | null): string;

        decode_dbus_secret(value: GLib.Variant): Value;

        encode_dbus_secret(value: Value): GLib.Variant;

        ensure_session(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        ensure_session(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        ensure_session(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        ensure_session_finish(result: Gio.AsyncResult): boolean;

        ensure_session_sync(cancellable: Gio.Cancellable | null): boolean;

        get_collection_gtype(): GObject.GType;

        get_collections(): Collection[] | null;

        get_flags(): ServiceFlags;

    // Conflicted with Gio.DBusProxy.get_flags
        get_flags(...args: never[]): any;

        get_item_gtype(): GObject.GType;

        get_session_algorithms(): string | null;

        get_session_dbus_path(): string | null;

        load_collections(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        load_collections(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        load_collections(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        load_collections_finish(result: Gio.AsyncResult): boolean;

        load_collections_sync(cancellable: Gio.Cancellable | null): boolean;

        lock(objects: Gio.DBusProxy[], cancellable: Gio.Cancellable | null): globalThis.Promise<[number, Gio.DBusProxy[] | null]>;

        lock(objects: Gio.DBusProxy[], cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        lock(objects: Gio.DBusProxy[], cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<[number, Gio.DBusProxy[] | null]> | void;

        lock_finish(result: Gio.AsyncResult): [number, Gio.DBusProxy[] | null];

        lock_sync(objects: Gio.DBusProxy[], cancellable: Gio.Cancellable | null): [number, Gio.DBusProxy[] | null];

        lookup(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null): globalThis.Promise<Value>;

        lookup(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        lookup(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Value> | void;

        lookup_finish(result: Gio.AsyncResult): Value;

        lookup_sync(schema: Schema | null, attributes: { [key: string]: string }, cancellable: Gio.Cancellable | null): Value;

        prompt(prompt: Prompt, return_type: GLib.VariantType | null, cancellable: Gio.Cancellable | null): globalThis.Promise<GLib.Variant>;

        prompt(prompt: Prompt, return_type: GLib.VariantType | null, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        prompt(prompt: Prompt, return_type: GLib.VariantType | null, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<GLib.Variant> | void;

        prompt_finish(result: Gio.AsyncResult): GLib.Variant;

        prompt_sync(prompt: Prompt, cancellable: Gio.Cancellable | null, return_type: GLib.VariantType): GLib.Variant;

        search(schema: Schema | null, attributes: { [key: string]: string }, flags: SearchFlags, cancellable: Gio.Cancellable | null): globalThis.Promise<Item[]>;

        search(schema: Schema | null, attributes: { [key: string]: string }, flags: SearchFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        search(schema: Schema | null, attributes: { [key: string]: string }, flags: SearchFlags, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Item[]> | void;

        search_finish(result: Gio.AsyncResult): Item[];

        search_sync(schema: Schema | null, attributes: { [key: string]: string }, flags: SearchFlags, cancellable: Gio.Cancellable | null): Item[];

        set_alias(alias: string, collection: Collection | null, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        set_alias(alias: string, collection: Collection | null, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        set_alias(alias: string, collection: Collection | null, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        set_alias_finish(result: Gio.AsyncResult): boolean;

        set_alias_sync(alias: string, collection: Collection | null, cancellable: Gio.Cancellable | null): boolean;

        store(schema: Schema | null, attributes: { [key: string]: string }, collection: string | null, label: string, value: Value, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        store(schema: Schema | null, attributes: { [key: string]: string }, collection: string | null, label: string, value: Value, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        store(schema: Schema | null, attributes: { [key: string]: string }, collection: string | null, label: string, value: Value, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        store_finish(result: Gio.AsyncResult): boolean;

        store_sync(schema: Schema | null, attributes: { [key: string]: string }, collection: string | null, label: string, value: Value, cancellable: Gio.Cancellable | null): boolean;

        unlock(objects: Gio.DBusProxy[], cancellable: Gio.Cancellable | null): globalThis.Promise<[number, Gio.DBusProxy[] | null]>;

        unlock(objects: Gio.DBusProxy[], cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        unlock(objects: Gio.DBusProxy[], cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<[number, Gio.DBusProxy[] | null]> | void;

        unlock_finish(result: Gio.AsyncResult): [number, Gio.DBusProxy[] | null];

        unlock_sync(objects: Gio.DBusProxy[], cancellable: Gio.Cancellable | null): [number, Gio.DBusProxy[] | null];

        /** @category Inherited from Secret.Backend */
        get flags(): ServiceFlags;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: Gio.AsyncResult): boolean;

        new_finish(res: Gio.AsyncResult): Service;

        // Conflicted with Gio.DBusProxy.new_finish
        new_finish(...args: never[]): any;

        vfunc_init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: Gio.AsyncResult): boolean;

        get_object(): Gio.DBusObject | null;

        get_info(): Gio.DBusInterfaceInfo | null;

        set_object(object: Gio.DBusObject | null): void;

        vfunc_dup_object(): Gio.DBusObject | null;

        vfunc_get_info(): Gio.DBusInterfaceInfo | null;

        vfunc_set_object(object: Gio.DBusObject | null): void;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_clear(schema: Schema, attributes: never, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_clear_finish(result: Gio.AsyncResult): boolean;

        vfunc_ensure_for_flags(flags: BackendFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_ensure_for_flags_finish(result: Gio.AsyncResult): boolean;

        vfunc_lookup(schema: Schema, attributes: never, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_lookup_finish(result: Gio.AsyncResult): Value;

        vfunc_search(schema: Schema, attributes: never, flags: SearchFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_store(schema: Schema, attributes: never, collection: string, label: string, value: Value, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_store_finish(result: Gio.AsyncResult): boolean;
    }


    type BackendInterface = typeof Backend;

    type CollectionClass = typeof Collection;

    abstract class CollectionPrivate {
        static $gtype: GObject.GType<CollectionPrivate>;
    }


    type ItemClass = typeof Item;

    abstract class ItemPrivate {
        static $gtype: GObject.GType<ItemPrivate>;
    }


    type PromptClass = typeof Prompt;

    abstract class PromptPrivate {
        static $gtype: GObject.GType<PromptPrivate>;
    }


    type RetrievableInterface = typeof Retrievable;

    class Schema {
        static $gtype: GObject.GType<Schema>;

        // Fields
        name: string;

        flags: SchemaFlags;

        attributes: SchemaAttribute[];

        // Constructors
        constructor(name: string, flags: SchemaFlags, ___: any[]);

        static ["new"](name: string, flags: SchemaFlags, attribute_names_and_types: { [key: string]: SchemaAttributeType }): Schema;

        // Methods
        ref(): Schema;

        unref(): void;
    }


    class SchemaAttribute {
        static $gtype: GObject.GType<SchemaAttribute>;

        // Fields
        name: string;

        type: SchemaAttributeType;
    }


    type ServiceClass = typeof Service;

    abstract class ServicePrivate {
        static $gtype: GObject.GType<ServicePrivate>;
    }


    class Value {
        static $gtype: GObject.GType<Value>;

        // Constructors
        constructor(secret: string, length: bigint | number, content_type: string);

        static ["new"](secret: string, length: bigint | number, content_type: string): Value;

        static new_full(secret: string, length: bigint | number, content_type: string): Value;

        // Methods
        get(): Uint8Array;

        get_content_type(): string;

        get_text(): string | null;

        ref(): Value;

        unref(): void;

        unref_to_password(length: bigint | number): [string, number];
    }


    namespace Backend {
        /**
         * Interface for implementing Backend.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface extends Gio.AsyncInitable.Interface {

            // Virtual methods
            vfunc_clear(schema: Schema, attributes: never, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

            vfunc_clear_finish(result: Gio.AsyncResult): boolean;

            vfunc_ensure_for_flags(flags: BackendFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

            vfunc_ensure_for_flags_finish(result: Gio.AsyncResult): boolean;

            vfunc_lookup(schema: Schema, attributes: never, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

            vfunc_lookup_finish(result: Gio.AsyncResult): Value;

            vfunc_search(schema: Schema, attributes: never, flags: SearchFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

            vfunc_store(schema: Schema, attributes: never, collection: string, label: string, value: Value, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

            vfunc_store_finish(result: Gio.AsyncResult): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends Gio.AsyncInitable.ConstructorProps<Backend> {
            flags: ServiceFlags;
        }
    }

    export interface BackendNamespace {
        $gtype: GObject.GType<Backend>;
        prototype: Backend;
        get(flags: BackendFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Backend> | null): void;
        get_finish(result: Gio.AsyncResult): Backend;
    }
    interface Backend extends Gio.AsyncInitable, Backend.Interface {

        // Properties
        get flags(): ServiceFlags;
    }


    export const Backend: BackendNamespace & {
        new (): Backend; // This allows `obj instanceof Backend`
    };

    namespace Retrievable {
        /**
         * Interface for implementing Retrievable.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_retrieve_secret(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

            vfunc_retrieve_secret_finish(result: Gio.AsyncResult): Value | null;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            attributes: { [key: string]: string };
            created: bigint | number;
            label: string;
            modified: bigint | number;
        }
    }

    export interface RetrievableNamespace {
        $gtype: GObject.GType<Retrievable>;
        prototype: Retrievable;
    }
    interface Retrievable extends GObject.Object, Retrievable.Interface {

        // Properties
        get attributes(): { [key: string]: string };
        set attributes(val: { [key: string]: string });

        get created(): number;
        set created(val: bigint | number);

        get label(): string;
        set label(val: string);

        get modified(): number;
        set modified(val: bigint | number);

        // Methods
        get_attributes(): { [key: string]: string };

        get_created(): number;

        get_label(): string;

        get_modified(): number;

        retrieve_secret(cancellable: Gio.Cancellable | null): globalThis.Promise<Value | null>;

        retrieve_secret(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        retrieve_secret(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Value | null> | void;

        retrieve_secret_finish(result: Gio.AsyncResult): Value | null;

        retrieve_secret_sync(cancellable: Gio.Cancellable | null): Value | null;
    }


    export const Retrievable: RetrievableNamespace & {
        new (): Retrievable; // This allows `obj instanceof Retrievable`
    };

    const __name__: string;

    const __version__: string;
}

export default Secret;

}

declare module 'gi://Secret' {
    import Secret1 from 'gi://Secret?version=1';
    export default Secret1;
}
// END
