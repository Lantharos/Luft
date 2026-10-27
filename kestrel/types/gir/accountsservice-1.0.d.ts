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

declare module 'gi://AccountsService?version=1.0' {

// Module dependencies
import type Gio from 'gi://Gio?version=2.0';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type GModule from 'gi://GModule?version=2.0';

export namespace AccountsService {

    /**
     * AccountsService-1.0
     */


    export namespace UserAccountType {
        export const $gtype: GObject.GType<UserAccountType>;
    }

    enum UserAccountType {
        STANDARD = 0,
        ADMINISTRATOR = 1,
    }


    class UserManagerError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static USER_EXISTS: number;

        static USER_DOES_NOT_EXIST: number;

        static PERMISSION_DENIED: number;

        static NOT_SUPPORTED: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace UserPasswordMode {
        export const $gtype: GObject.GType<UserPasswordMode>;
    }

    enum UserPasswordMode {
        REGULAR = 0,
        SET_AT_LOGIN = 1,
        NONE = 2,
    }


    function user_manager_error_quark(): GLib.Quark;

    namespace User {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            changed: () => void;
            /** @signal */
            "sessions-changed": () => void;
            "notify::account-type": (pspec: GObject.ParamSpec) => void;
            "notify::automatic-login": (pspec: GObject.ParamSpec) => void;
            "notify::email": (pspec: GObject.ParamSpec) => void;
            "notify::home-directory": (pspec: GObject.ParamSpec) => void;
            "notify::icon-file": (pspec: GObject.ParamSpec) => void;
            "notify::is-loaded": (pspec: GObject.ParamSpec) => void;
            "notify::language": (pspec: GObject.ParamSpec) => void;
            "notify::local-account": (pspec: GObject.ParamSpec) => void;
            "notify::location": (pspec: GObject.ParamSpec) => void;
            "notify::locked": (pspec: GObject.ParamSpec) => void;
            "notify::login-frequency": (pspec: GObject.ParamSpec) => void;
            "notify::login-history": (pspec: GObject.ParamSpec) => void;
            "notify::login-time": (pspec: GObject.ParamSpec) => void;
            "notify::nonexistent": (pspec: GObject.ParamSpec) => void;
            "notify::password-hint": (pspec: GObject.ParamSpec) => void;
            "notify::password-mode": (pspec: GObject.ParamSpec) => void;
            "notify::real-name": (pspec: GObject.ParamSpec) => void;
            "notify::shell": (pspec: GObject.ParamSpec) => void;
            "notify::system-account": (pspec: GObject.ParamSpec) => void;
            "notify::uid": (pspec: GObject.ParamSpec) => void;
            "notify::user-name": (pspec: GObject.ParamSpec) => void;
            "notify::x-session": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            account_type: number;
            accountType: number;
            automatic_login: boolean;
            automaticLogin: boolean;
            email: string;
            home_directory: string;
            homeDirectory: string;
            icon_file: string;
            iconFile: string;
            is_loaded: boolean;
            isLoaded: boolean;
            language: string | null;
            local_account: boolean;
            localAccount: boolean;
            location: string;
            locked: boolean;
            login_frequency: number;
            loginFrequency: number;
            login_history: GLib.Variant;
            loginHistory: GLib.Variant;
            login_time: bigint | number;
            loginTime: bigint | number;
            nonexistent: boolean;
            password_hint: string;
            passwordHint: string;
            password_mode: number;
            passwordMode: number;
            real_name: string;
            realName: string;
            shell: string;
            system_account: boolean;
            systemAccount: boolean;
            uid: number;
            user_name: string;
            userName: string;
            x_session: string;
            xSession: string;
        }
    }

    class User extends GObject.Object {
        static $gtype: GObject.GType<User>;

        // Properties
        get account_type(): number;

        get accountType(): number;

        get automatic_login(): boolean;

        get automaticLogin(): boolean;

        get email(): string;

        get home_directory(): string;

        get homeDirectory(): string;

        get icon_file(): string;

        get iconFile(): string;

        get is_loaded(): boolean;

        get isLoaded(): boolean;

        get language(): string | null;

        get local_account(): boolean;

        get localAccount(): boolean;

        get location(): string;

        get locked(): boolean;

        get login_frequency(): number;

        get loginFrequency(): number;

        get login_history(): GLib.Variant;

        get loginHistory(): GLib.Variant;

        get login_time(): number;

        get loginTime(): number;

        get nonexistent(): boolean;

        get password_hint(): string;

        get passwordHint(): string;

        get password_mode(): number;

        get passwordMode(): number;

        get real_name(): string;

        get realName(): string;

        get shell(): string;

        get system_account(): boolean;

        get systemAccount(): boolean;

        get uid(): number;

        get user_name(): string;

        get userName(): string;

        get x_session(): string;

        get xSession(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: User.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<User.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof User.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, User.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof User.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, User.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof User.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<User.SignalSignatures[K]>): void;

        // Methods
        collate(user2: User): number;

        get_account_type(): UserAccountType;

        get_automatic_login(): boolean;

        get_email(): string;

        get_home_dir(): string;

        get_icon_file(): string;

        get_language(): string | null;

        get_languages(): string[] | null;

        get_location(): string;

        get_locked(): boolean;

        get_login_frequency(): number;

        get_login_history(): GLib.Variant;

        get_login_time(): number;

        get_num_sessions(): number;

        get_num_sessions_anywhere(): number;

        get_object_path(): string;

        get_password_expiration_policy(): [number, number, number, number, number, number];

        get_password_hint(): string;

        get_password_mode(): UserPasswordMode;

        get_primary_session_id(): string;

        get_real_name(): string;

        get_saved(): boolean;

        get_session(): string;

        get_session_type(): string;

        get_shell(): string;

        get_uid(): never;

        get_user_name(): string;

        get_x_session(): string;

        is_local_account(): boolean;

        is_logged_in(): boolean;

        is_logged_in_anywhere(): boolean;

        is_nonexistent(): boolean;

        is_system_account(): boolean;

        set_account_type(account_type: UserAccountType): void;

        set_automatic_login(enabled: boolean): void;

        set_email(email: string): void;

        set_icon_file(icon_file: string): void;

        set_language(language: string): void;

        set_languages(languages: string[]): void;

        set_location(location: string): void;

        set_locked(locked: boolean): void;

        set_password(password: string, hint: string): void;

        set_password_expiration_policy(min_days_between_changes: bigint | number, max_days_between_changes: bigint | number, days_to_warn: bigint | number, days_after_expiration_until_lock: bigint | number): void;

        set_password_hint(hint: string): void;

        set_password_mode(password_mode: UserPasswordMode): void;

        set_real_name(real_name: string): void;

        set_session(session: string): void;

        set_session_type(session_type: string): void;

        set_user_expiration_policy(expiration_time: bigint | number): void;

        set_user_name(user_name: string): void;

        set_x_session(x_session: string): void;

        uses_homed(): boolean;
    }


    namespace UserManager {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "user-added": (user: User) => void;
            /** @signal */
            "user-changed": (user: User) => void;
            /** @signal */
            "user-is-logged-in-changed": (user: User) => void;
            /** @signal */
            "user-removed": (user: User) => void;
            "notify::exclude-usernames-list": (pspec: GObject.ParamSpec) => void;
            "notify::has-multiple-users": (pspec: GObject.ParamSpec) => void;
            "notify::include-usernames-list": (pspec: GObject.ParamSpec) => void;
            "notify::is-loaded": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            exclude_usernames_list: never;
            excludeUsernamesList: never;
            has_multiple_users: boolean;
            hasMultipleUsers: boolean;
            include_usernames_list: never;
            includeUsernamesList: never;
            is_loaded: boolean;
            isLoaded: boolean;
        }
    }

    class UserManager extends GObject.Object {
        static $gtype: GObject.GType<UserManager>;

        // Properties
        get exclude_usernames_list(): null;
        set exclude_usernames_list(val: never);

        get excludeUsernamesList(): null;
        set excludeUsernamesList(val: never);

        get has_multiple_users(): boolean;
        set has_multiple_users(val: boolean);

        get hasMultipleUsers(): boolean;
        set hasMultipleUsers(val: boolean);

        get include_usernames_list(): null;
        set include_usernames_list(val: never);

        get includeUsernamesList(): null;
        set includeUsernamesList(val: never);

        get is_loaded(): boolean;

        get isLoaded(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: UserManager.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<UserManager.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof UserManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UserManager.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof UserManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UserManager.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof UserManager.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<UserManager.SignalSignatures[K]>): void;

        // Static methods
        static get_default(): UserManager;

        // Virtual methods
        vfunc_user_added(user: User): void;

        vfunc_user_changed(user: User): void;

        vfunc_user_is_logged_in_changed(user: User): void;

        vfunc_user_removed(user: User): void;

        // Methods
        activate_user_session(user: User): boolean;

        cache_user(username: string): User;

        cache_user_async(username: string, cancellable: Gio.Cancellable | null): globalThis.Promise<User>;

        cache_user_async(username: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        cache_user_async(username: string, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<User> | void;

        cache_user_finish(result: Gio.AsyncResult): User;

        can_switch(): boolean;

        create_user(username: string, fullname: string, accounttype: UserAccountType): User;

        create_user_async(username: string, fullname: string, accounttype: UserAccountType, cancellable: Gio.Cancellable | null): globalThis.Promise<User>;

        create_user_async(username: string, fullname: string, accounttype: UserAccountType, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        create_user_async(username: string, fullname: string, accounttype: UserAccountType, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<User> | void;

        create_user_finish(result: Gio.AsyncResult): User;

        delete_user(user: User, remove_files: boolean): boolean;

        delete_user_async(user: User, remove_files: boolean, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        delete_user_async(user: User, remove_files: boolean, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        delete_user_async(user: User, remove_files: boolean, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        delete_user_finish(result: Gio.AsyncResult): boolean;

        get_user(username: string): User;

        get_user_by_id(id: never): User;

        goto_login_session(): boolean;

        list_users(): User[];

        no_service(): boolean;

        uncache_user(username: string): boolean;

        uncache_user_async(username: string, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        uncache_user_async(username: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        uncache_user_async(username: string, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        uncache_user_finish(result: Gio.AsyncResult): boolean;
    }


    type UserClass = typeof User;

    type UserManagerClass = typeof UserManager;

    const __name__: string;

    const __version__: string;
}

export default AccountsService;

}

declare module 'gi://AccountsService' {
    import AccountsService10 from 'gi://AccountsService?version=1.0';
    export default AccountsService10;
}
// END
