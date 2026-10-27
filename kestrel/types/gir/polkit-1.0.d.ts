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

declare module 'gi://Polkit?version=1.0' {

// Module dependencies
import type Gio from 'gi://Gio?version=2.0';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type GModule from 'gi://GModule?version=2.0';

export namespace Polkit {

    /**
     * Polkit-1.0
     */


    class Error extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static CANCELLED: number;

        static NOT_SUPPORTED: number;

        static NOT_AUTHORIZED: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace ImplicitAuthorization {
        export const $gtype: GObject.GType<ImplicitAuthorization>;
    }

    enum ImplicitAuthorization {
        UNKNOWN = -1,
        NOT_AUTHORIZED = 0,
        AUTHENTICATION_REQUIRED = 1,
        ADMINISTRATOR_AUTHENTICATION_REQUIRED = 2,
        AUTHENTICATION_REQUIRED_RETAINED = 3,
        ADMINISTRATOR_AUTHENTICATION_REQUIRED_RETAINED = 4,
        AUTHORIZED = 5,
    }


    function error_quark(): GLib.Quark;

    function identity_from_string(str: string): Identity | null;

    function implicit_authorization_from_string(string: string): [boolean, ImplicitAuthorization];

    function implicit_authorization_to_string(implicit_authorization: ImplicitAuthorization): string;

    function subject_from_string(str: string): Subject;

    export namespace AuthorityFeatures {
        export const $gtype: GObject.GType<AuthorityFeatures>;
    }

    enum AuthorityFeatures {
        NONE = 0,
        TEMPORARY_AUTHORIZATION = 1,
    }


    export namespace CheckAuthorizationFlags {
        export const $gtype: GObject.GType<CheckAuthorizationFlags>;
    }

    enum CheckAuthorizationFlags {
        NONE = 0,
        ALLOW_USER_INTERACTION = 1,
        ALWAYS_CHECK = 2,
    }


    namespace ActionDescription {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class ActionDescription extends GObject.Object {
        static $gtype: GObject.GType<ActionDescription>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ActionDescription.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ActionDescription.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ActionDescription.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ActionDescription.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ActionDescription.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ActionDescription.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ActionDescription.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ActionDescription.SignalSignatures[K]>): void;

        // Methods
        get_action_id(): string;

        get_annotation(key: string): string | null;

        get_annotation_keys(): string[];

        get_description(): string;

        get_icon_name(): string;

        get_implicit_active(): ImplicitAuthorization;

        get_implicit_any(): ImplicitAuthorization;

        get_implicit_inactive(): ImplicitAuthorization;

        get_message(): string;

        get_vendor_name(): string;

        get_vendor_url(): string;
    }


    namespace Authority {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            changed: () => void;
            /** @signal */
            "sessions-changed": () => void;
            "notify::backend-features": (pspec: GObject.ParamSpec) => void;
            "notify::backend-name": (pspec: GObject.ParamSpec) => void;
            "notify::backend-version": (pspec: GObject.ParamSpec) => void;
            "notify::owner": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Gio.AsyncInitable.ConstructorProps, Gio.Initable.ConstructorProps {
            backend_features: AuthorityFeatures;
            backendFeatures: AuthorityFeatures;
            backend_name: string;
            backendName: string;
            backend_version: string;
            backendVersion: string;
            owner: string | null;
        }
    }

    class Authority extends GObject.Object implements Gio.AsyncInitable<Authority>, Gio.Initable {
        static $gtype: GObject.GType<Authority>;

        // Properties
        get backend_features(): AuthorityFeatures;

        get backendFeatures(): AuthorityFeatures;

        get backend_name(): string;

        get backendName(): string;

        get backend_version(): string;

        get backendVersion(): string;

        get owner(): string | null;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Authority.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Authority.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Authority.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Authority.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Authority.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Authority.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Authority.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Authority.SignalSignatures[K]>): void;

        // Static methods
        static get(): Authority;

        static get_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Authority> | null): void;

        static get_finish(res: Gio.AsyncResult): Authority;

        static get_sync(cancellable: Gio.Cancellable | null): Authority;

        // Methods
        authentication_agent_response(cookie: string, identity: Identity, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        authentication_agent_response(cookie: string, identity: Identity, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        authentication_agent_response(cookie: string, identity: Identity, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        authentication_agent_response_finish(res: Gio.AsyncResult): boolean;

        authentication_agent_response_sync(cookie: string, identity: Identity, cancellable: Gio.Cancellable | null): boolean;

        authentication_agent_response_with_subject(cookie: string, identity: Identity, subject: Subject, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        authentication_agent_response_with_subject_sync(cookie: string, identity: Identity, subject: Subject, cancellable: Gio.Cancellable | null): boolean;

        check_authorization(subject: Subject, action_id: string, details: Details | null, flags: CheckAuthorizationFlags, cancellable: Gio.Cancellable | null): globalThis.Promise<AuthorizationResult>;

        check_authorization(subject: Subject, action_id: string, details: Details | null, flags: CheckAuthorizationFlags, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        check_authorization(subject: Subject, action_id: string, details: Details | null, flags: CheckAuthorizationFlags, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<AuthorizationResult> | void;

        check_authorization_finish(res: Gio.AsyncResult): AuthorizationResult;

        check_authorization_sync(subject: Subject, action_id: string, details: Details | null, flags: CheckAuthorizationFlags, cancellable: Gio.Cancellable | null): AuthorizationResult;

        enumerate_actions(cancellable: Gio.Cancellable | null): globalThis.Promise<ActionDescription[]>;

        enumerate_actions(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        enumerate_actions(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<ActionDescription[]> | void;

        enumerate_actions_finish(res: Gio.AsyncResult): ActionDescription[];

        enumerate_actions_sync(cancellable: Gio.Cancellable | null): ActionDescription[];

        enumerate_temporary_authorizations(subject: Subject, cancellable: Gio.Cancellable | null): globalThis.Promise<TemporaryAuthorization[]>;

        enumerate_temporary_authorizations(subject: Subject, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        enumerate_temporary_authorizations(subject: Subject, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<TemporaryAuthorization[]> | void;

        enumerate_temporary_authorizations_finish(res: Gio.AsyncResult): TemporaryAuthorization[];

        enumerate_temporary_authorizations_sync(subject: Subject, cancellable: Gio.Cancellable | null): TemporaryAuthorization[];

        get_backend_features(): AuthorityFeatures;

        get_backend_name(): string;

        get_backend_version(): string;

        get_owner(): string | null;

        register_authentication_agent(subject: Subject, locale: string, object_path: string, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        register_authentication_agent(subject: Subject, locale: string, object_path: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        register_authentication_agent(subject: Subject, locale: string, object_path: string, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        register_authentication_agent_finish(res: Gio.AsyncResult): boolean;

        register_authentication_agent_sync(subject: Subject, locale: string, object_path: string, cancellable: Gio.Cancellable | null): boolean;

        register_authentication_agent_with_options(subject: Subject, locale: string, object_path: string, options: GLib.Variant | null, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        register_authentication_agent_with_options(subject: Subject, locale: string, object_path: string, options: GLib.Variant | null, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        register_authentication_agent_with_options(subject: Subject, locale: string, object_path: string, options: GLib.Variant | null, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        register_authentication_agent_with_options_finish(res: Gio.AsyncResult): boolean;

        register_authentication_agent_with_options_sync(subject: Subject, locale: string, object_path: string, options: GLib.Variant | null, cancellable: Gio.Cancellable | null): boolean;

        revoke_temporary_authorization_by_id(id: string, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        revoke_temporary_authorization_by_id(id: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        revoke_temporary_authorization_by_id(id: string, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        revoke_temporary_authorization_by_id_finish(res: Gio.AsyncResult): boolean;

        revoke_temporary_authorization_by_id_sync(id: string, cancellable: Gio.Cancellable | null): boolean;

        revoke_temporary_authorizations(subject: Subject, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        revoke_temporary_authorizations(subject: Subject, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        revoke_temporary_authorizations(subject: Subject, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        revoke_temporary_authorizations_finish(res: Gio.AsyncResult): boolean;

        revoke_temporary_authorizations_sync(subject: Subject, cancellable: Gio.Cancellable | null): boolean;

        unregister_authentication_agent(subject: Subject, object_path: string, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        unregister_authentication_agent(subject: Subject, object_path: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        unregister_authentication_agent(subject: Subject, object_path: string, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        unregister_authentication_agent_finish(res: Gio.AsyncResult): boolean;

        unregister_authentication_agent_sync(subject: Subject, object_path: string, cancellable: Gio.Cancellable | null): boolean;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: Gio.AsyncResult): boolean;

        new_finish(res: Gio.AsyncResult): Authority;

        vfunc_init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: Gio.AsyncResult): boolean;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace AuthorizationResult {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class AuthorizationResult extends GObject.Object {
        static $gtype: GObject.GType<AuthorizationResult>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AuthorizationResult.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AuthorizationResult.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](is_authorized: boolean, is_challenge: boolean, details: Details | null): AuthorizationResult;

        // Signals
        /** @signal */
        connect<K extends keyof AuthorizationResult.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthorizationResult.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AuthorizationResult.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthorizationResult.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AuthorizationResult.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AuthorizationResult.SignalSignatures[K]>): void;

        // Methods
        get_details(): Details | null;

        get_dismissed(): boolean;

        get_is_authorized(): boolean;

        get_is_challenge(): boolean;

        get_retains_authorization(): boolean;

        get_temporary_authorization_id(): string | null;
    }


    namespace Details {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Details extends GObject.Object {
        static $gtype: GObject.GType<Details>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Details.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Details.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Details;

        // Signals
        /** @signal */
        connect<K extends keyof Details.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Details.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Details.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Details.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Details.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Details.SignalSignatures[K]>): void;

        // Methods
        get_keys(): string[] | null;

        insert(key: string, value: string | null): void;

        lookup(key: string): string | null;
    }


    namespace Permission {
        // Signal signatures
        interface SignalSignatures extends Gio.Permission.SignalSignatures {
            "notify::action-id": (pspec: GObject.ParamSpec) => void;
            "notify::subject": (pspec: GObject.ParamSpec) => void;
            "notify::allowed": (pspec: GObject.ParamSpec) => void;
            "notify::can-acquire": (pspec: GObject.ParamSpec) => void;
            "notify::can-release": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gio.Permission.ConstructorProps, Gio.AsyncInitable.ConstructorProps, Gio.Initable.ConstructorProps {
            action_id: string;
            actionId: string;
            subject: Subject;
        }
    }

    class Permission extends Gio.Permission implements Gio.AsyncInitable<Permission>, Gio.Initable {
        static $gtype: GObject.GType<Permission>;

        // Properties
        get action_id(): string;

        get actionId(): string;

        get subject(): Subject;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Permission.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Permission.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_finish(res: Gio.AsyncResult): Permission;

        // Conflicted with Gio.AsyncInitable.new_finish
        static new_finish(...args: never[]): any;

        static new_sync(action_id: string, subject: Subject | null, cancellable: Gio.Cancellable | null): Permission;

        // Signals
        /** @signal */
        connect<K extends keyof Permission.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Permission.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Permission.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Permission.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Permission.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Permission.SignalSignatures[K]>): void;

        // Static methods
        static ["new"](action_id: string, subject: Subject | null, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Permission> | null): void;

        // Methods
        get_action_id(): string;

        get_subject(): Subject;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: Gio.AsyncResult): boolean;

        new_finish(res: Gio.AsyncResult): Permission;

        vfunc_init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: Gio.AsyncResult): boolean;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace SystemBusName {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Subject.ConstructorProps {
            name: string;
        }
    }

    class SystemBusName extends GObject.Object implements Subject {
        static $gtype: GObject.GType<SystemBusName>;

        // Properties
        get name(): string;
        set name(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SystemBusName.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SystemBusName.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof SystemBusName.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SystemBusName.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SystemBusName.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SystemBusName.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SystemBusName.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SystemBusName.SignalSignatures[K]>): void;

        // Static methods
        static ["new"](name: string): Subject;

        // Methods
        get_name(): string;

        get_process_sync(cancellable: Gio.Cancellable | null): Subject | null;

        get_user_sync(cancellable: Gio.Cancellable | null): UnixUser | null;

        set_name(name: string): void;

        equal(b: Subject): boolean;

        exists(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        exists(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        exists(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        exists_finish(res: Gio.AsyncResult): boolean;

        exists_sync(cancellable: Gio.Cancellable | null): boolean;

        hash(): number;

        to_string(): string;

        vfunc_equal(b: Subject): boolean;

        vfunc_exists(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_exists_finish(res: Gio.AsyncResult): boolean;

        vfunc_exists_sync(cancellable: Gio.Cancellable | null): boolean;

        vfunc_hash(): number;

        vfunc_to_string(): string;
    }


    namespace TemporaryAuthorization {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class TemporaryAuthorization extends GObject.Object {
        static $gtype: GObject.GType<TemporaryAuthorization>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TemporaryAuthorization.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TemporaryAuthorization.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof TemporaryAuthorization.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TemporaryAuthorization.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TemporaryAuthorization.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TemporaryAuthorization.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TemporaryAuthorization.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TemporaryAuthorization.SignalSignatures[K]>): void;

        // Methods
        get_action_id(): string;

        get_id(): string;

        get_subject(): Subject;

        get_time_expires(): number;

        get_time_obtained(): number;
    }


    namespace UnixGroup {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::gid": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Identity.ConstructorProps {
            gid: number;
        }
    }

    class UnixGroup extends GObject.Object implements Identity {
        static $gtype: GObject.GType<UnixGroup>;

        // Properties
        get gid(): number;
        set gid(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: UnixGroup.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<UnixGroup.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof UnixGroup.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixGroup.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof UnixGroup.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixGroup.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof UnixGroup.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<UnixGroup.SignalSignatures[K]>): void;

        // Static methods
        static ["new"](gid: number): Identity;

        static new_for_name(name: string): Identity | null;

        // Methods
        get_gid(): number;

        set_gid(gid: number): void;

        equal(b: Identity): boolean;

        hash(): number;

        to_string(): string;

        vfunc_equal(b: Identity): boolean;

        vfunc_hash(): number;

        vfunc_to_string(): string;
    }


    namespace UnixNetgroup {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Identity.ConstructorProps {
            name: string;
        }
    }

    class UnixNetgroup extends GObject.Object implements Identity {
        static $gtype: GObject.GType<UnixNetgroup>;

        // Properties
        get name(): string;
        set name(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: UnixNetgroup.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<UnixNetgroup.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof UnixNetgroup.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixNetgroup.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof UnixNetgroup.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixNetgroup.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof UnixNetgroup.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<UnixNetgroup.SignalSignatures[K]>): void;

        // Static methods
        static ["new"](name: string): Identity;

        // Methods
        get_name(): string;

        set_name(name: string): void;

        equal(b: Identity): boolean;

        hash(): number;

        to_string(): string;

        vfunc_equal(b: Identity): boolean;

        vfunc_hash(): number;

        vfunc_to_string(): string;
    }


    namespace UnixProcess {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::cgroupid": (pspec: GObject.ParamSpec) => void;
            "notify::ctty": (pspec: GObject.ParamSpec) => void;
            "notify::gids": (pspec: GObject.ParamSpec) => void;
            "notify::pid": (pspec: GObject.ParamSpec) => void;
            "notify::pidfd": (pspec: GObject.ParamSpec) => void;
            "notify::pidfd-is-safe": (pspec: GObject.ParamSpec) => void;
            "notify::ppidfd": (pspec: GObject.ParamSpec) => void;
            "notify::start-time": (pspec: GObject.ParamSpec) => void;
            "notify::uid": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Subject.ConstructorProps {
            cgroupid: bigint | number;
            ctty: number;
            gids: never[] | null;
            pid: number;
            pidfd: number;
            pidfd_is_safe: boolean;
            pidfdIsSafe: boolean;
            ppidfd: number;
            start_time: bigint | number;
            startTime: bigint | number;
            uid: number;
        }
    }

    class UnixProcess extends GObject.Object implements Subject {
        static $gtype: GObject.GType<UnixProcess>;

        // Properties
        get cgroupid(): number;

        get ctty(): number;

        get gids(): null[] | null;
        set gids(val: never[] | null);

        get pid(): number;
        set pid(val: number);

        get pidfd(): number;
        set pidfd(val: number);

        get pidfd_is_safe(): boolean;

        get pidfdIsSafe(): boolean;

        get ppidfd(): number;

        get start_time(): number;
        set start_time(val: bigint | number);

        get startTime(): number;
        set startTime(val: bigint | number);

        get uid(): number;
        set uid(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: UnixProcess.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<UnixProcess.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof UnixProcess.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixProcess.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof UnixProcess.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixProcess.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof UnixProcess.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<UnixProcess.SignalSignatures[K]>): void;

        // Static methods
        static ["new"](pid: number): Subject;

        static new_for_owner(pid: number, start_time: bigint | number, uid: number): Subject;

        static new_full(pid: number, start_time: bigint | number): Subject;

        static new_pidfd(pidfd: number, uid: number, gids: number[] | null): Subject;

        // Methods
        get_cgroupid(): number;

        get_ctty(): number;

        get_gids(): null[][] | null;

        get_owner(): number;

        get_pid(): number;

        get_pidfd(): number;

        get_pidfd_is_safe(): boolean;

        get_ppid(): number;

        get_ppidfd(): number;

        get_start_time(): number;

        get_uid(): number;

        set_gids(gids: never[][]): void;

        set_pid(pid: number): void;

        set_pidfd(pidfd: number): void;

        set_start_time(start_time: bigint | number): void;

        set_uid(uid: number): void;

        equal(b: Subject): boolean;

        exists(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        exists(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        exists(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        exists_finish(res: Gio.AsyncResult): boolean;

        exists_sync(cancellable: Gio.Cancellable | null): boolean;

        hash(): number;

        to_string(): string;

        vfunc_equal(b: Subject): boolean;

        vfunc_exists(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_exists_finish(res: Gio.AsyncResult): boolean;

        vfunc_exists_sync(cancellable: Gio.Cancellable | null): boolean;

        vfunc_hash(): number;

        vfunc_to_string(): string;
    }


    namespace UnixSession {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::pid": (pspec: GObject.ParamSpec) => void;
            "notify::session-id": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Gio.AsyncInitable.ConstructorProps, Gio.Initable.ConstructorProps, Subject.ConstructorProps {
            pid: number;
            session_id: string;
            sessionId: string;
        }
    }

    class UnixSession extends GObject.Object implements Gio.AsyncInitable<UnixSession>, Gio.Initable, Subject {
        static $gtype: GObject.GType<UnixSession>;

        // Properties
        set pid(val: number);

        get session_id(): string;
        set session_id(val: string);

        get sessionId(): string;
        set sessionId(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: UnixSession.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<UnixSession.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof UnixSession.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixSession.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof UnixSession.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixSession.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof UnixSession.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<UnixSession.SignalSignatures[K]>): void;

        // Static methods
        static ["new"](session_id: string): Subject;

        static new_for_process(pid: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<UnixSession> | null): void;

        static new_for_process_finish(res: Gio.AsyncResult): Subject | null;

        static new_for_process_sync(pid: number, cancellable: Gio.Cancellable | null): Subject | null;

        // Methods
        get_session_id(): string;

        set_session_id(session_id: string): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: Gio.AsyncResult): boolean;

        new_finish(res: Gio.AsyncResult): UnixSession;

        vfunc_init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: Gio.AsyncResult): boolean;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;

        equal(b: Subject): boolean;

        exists(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        exists(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        exists(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        exists_finish(res: Gio.AsyncResult): boolean;

        exists_sync(cancellable: Gio.Cancellable | null): boolean;

        hash(): number;

        to_string(): string;

        vfunc_equal(b: Subject): boolean;

        vfunc_exists(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_exists_finish(res: Gio.AsyncResult): boolean;

        vfunc_exists_sync(cancellable: Gio.Cancellable | null): boolean;

        vfunc_hash(): number;

        vfunc_to_string(): string;
    }


    namespace UnixUser {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::uid": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Identity.ConstructorProps {
            uid: number;
        }
    }

    class UnixUser extends GObject.Object implements Identity {
        static $gtype: GObject.GType<UnixUser>;

        // Properties
        get uid(): number;
        set uid(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: UnixUser.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<UnixUser.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof UnixUser.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixUser.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof UnixUser.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixUser.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof UnixUser.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<UnixUser.SignalSignatures[K]>): void;

        // Static methods
        static ["new"](uid: number): Identity;

        static new_for_name(name: string): Identity | null;

        // Methods
        get_name(): string | null;

        get_uid(): number;

        set_uid(uid: number): void;

        equal(b: Identity): boolean;

        hash(): number;

        to_string(): string;

        vfunc_equal(b: Identity): boolean;

        vfunc_hash(): number;

        vfunc_to_string(): string;
    }


    type ActionDescriptionClass = typeof ActionDescription;

    type AuthorityClass = typeof Authority;

    type AuthorizationResultClass = typeof AuthorizationResult;

    type DetailsClass = typeof Details;

    type IdentityIface = typeof Identity;

    type SubjectIface = typeof Subject;

    type SystemBusNameClass = typeof SystemBusName;

    type TemporaryAuthorizationClass = typeof TemporaryAuthorization;

    type UnixGroupClass = typeof UnixGroup;

    type UnixNetgroupClass = typeof UnixNetgroup;

    type UnixProcessClass = typeof UnixProcess;

    type UnixSessionClass = typeof UnixSession;

    type UnixUserClass = typeof UnixUser;

    namespace Identity {
        /**
         * Interface for implementing Identity.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_equal(b: Identity): boolean;

            vfunc_hash(): number;

            vfunc_to_string(): string;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface IdentityNamespace {
        $gtype: GObject.GType<Identity>;
        prototype: Identity;
        from_string(str: string): Identity | null;
    }
    interface Identity extends GObject.Object, Identity.Interface {

        // Methods
        equal(b: Identity): boolean;

        hash(): number;

        to_string(): string;
    }


    export const Identity: IdentityNamespace & {
        new (): Identity; // This allows `obj instanceof Identity`
    };

    namespace Subject {
        /**
         * Interface for implementing Subject.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_equal(b: Subject): boolean;

            vfunc_exists(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

            vfunc_exists_finish(res: Gio.AsyncResult): boolean;

            vfunc_exists_sync(cancellable: Gio.Cancellable | null): boolean;

            vfunc_hash(): number;

            vfunc_to_string(): string;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface SubjectNamespace {
        $gtype: GObject.GType<Subject>;
        prototype: Subject;
        from_string(str: string): Subject;
    }
    interface Subject extends GObject.Object, Subject.Interface {

        // Methods
        equal(b: Subject): boolean;

        exists(cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        exists(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        exists(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        exists_finish(res: Gio.AsyncResult): boolean;

        exists_sync(cancellable: Gio.Cancellable | null): boolean;

        hash(): number;

        to_string(): string;
    }


    export const Subject: SubjectNamespace & {
        new (): Subject; // This allows `obj instanceof Subject`
    };

    const __name__: string;

    const __version__: string;
}

export default Polkit;

}

declare module 'gi://Polkit' {
    import Polkit10 from 'gi://Polkit?version=1.0';
    export default Polkit10;
}
// END
