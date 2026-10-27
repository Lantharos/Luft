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

declare module 'gi://GioUnix?version=2.0' {

// Module dependencies
import type Gio from 'gi://Gio?version=2.0';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type GModule from 'gi://GModule?version=2.0';

export namespace GioUnix {

    /**
     * GioUnix-2.0
     */


    const DESKTOP_APP_INFO_LOOKUP_EXTENSION_POINT_NAME: string;

    function is_mount_path_system_internal(mount_path: string): boolean;

    function is_system_device_path(device_path: string): boolean;

    function is_system_fs_type(fs_type: string): boolean;

    function mount_at(mount_path: string): [MountEntry | null, number];

    function mount_compare(mount1: MountEntry, mount2: MountEntry): number;

    function mount_copy(mount_entry: MountEntry): MountEntry;

    function mount_entries_changed_since(time: bigint | number): boolean;

    function mount_entries_get(): [MountEntry[], number];

    function mount_entries_get_from_file(table_path: string): [MountEntry[] | null, number];

    function mount_entry_at(mount_path: string): [MountEntry | null, number];

    function mount_entry_for(file_path: string): [MountEntry | null, number];

    function mount_for(file_path: string): [MountEntry | null, number];

    function mount_free(mount_entry: MountEntry): void;

    function mount_get_device_path(mount_entry: MountEntry): string;

    function mount_get_fs_type(mount_entry: MountEntry): string;

    function mount_get_mount_path(mount_entry: MountEntry): string;

    function mount_get_options(mount_entry: MountEntry): string | null;

    function mount_get_root_path(mount_entry: MountEntry): string | null;

    function mount_guess_can_eject(mount_entry: MountEntry): boolean;

    function mount_guess_icon(mount_entry: MountEntry): Gio.Icon;

    function mount_guess_name(mount_entry: MountEntry): string;

    function mount_guess_should_display(mount_entry: MountEntry): boolean;

    function mount_guess_symbolic_icon(mount_entry: MountEntry): Gio.Icon;

    function mount_is_readonly(mount_entry: MountEntry): boolean;

    function mount_is_system_internal(mount_entry: MountEntry): boolean;

    function mount_point_at(mount_path: string): [MountPoint | null, number];

    function mount_points_changed_since(time: bigint | number): boolean;

    function mount_points_get(): [MountPoint[], number];

    function mount_points_get_from_file(table_path: string): [MountPoint[] | null, number];

    function mounts_changed_since(time: bigint | number): boolean;

    function mounts_get(): [MountEntry[], number];

    function mounts_get_from_file(table_path: string): [MountEntry[] | null, number];

    interface DesktopAppLaunchCallback {
        (appinfo: DesktopAppInfo, pid: GLib.Pid): void;
    }

    namespace DesktopAppInfo {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::filename": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Gio.AppInfo.ConstructorProps {
            filename: string | null;
        }
    }

    class DesktopAppInfo extends GObject.Object implements Gio.AppInfo {
        static $gtype: GObject.GType<DesktopAppInfo>;

        // Properties
        get filename(): string | null;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DesktopAppInfo.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DesktopAppInfo.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](desktop_id: string): DesktopAppInfo;

        static new_from_filename(filename: string): DesktopAppInfo;

        static new_from_keyfile(key_file: GLib.KeyFile): DesktopAppInfo;

        // Signals
        /** @signal */
        connect<K extends keyof DesktopAppInfo.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DesktopAppInfo.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DesktopAppInfo.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DesktopAppInfo.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DesktopAppInfo.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DesktopAppInfo.SignalSignatures[K]>): void;

        // Static methods
        static get_implementations(_interface: string): DesktopAppInfo[];

        static search(search_string: string): string[][];

        static set_desktop_env(desktop_env: string): void;

        // Methods
        get_action_name(action_name: string): string;

        get_boolean(key: string): boolean;

        get_categories(): string | null;

        get_filename(): string | null;

        get_generic_name(): string | null;

        get_is_hidden(): boolean;

        get_keywords(): string[] | null;

        get_locale_string(key: string): string | null;

        get_nodisplay(): boolean;

        get_show_in(desktop_env: string | null): boolean;

        get_startup_wm_class(): string | null;

        get_string(key: string): string | null;

        get_string_list(key: string): string[] | null;

        has_key(key: string): boolean;

        launch_action(action_name: string, launch_context: Gio.AppLaunchContext | null): void;

        launch_uris_as_manager(uris: string[], launch_context: Gio.AppLaunchContext | null, spawn_flags: GLib.SpawnFlags, user_setup: GLib.SpawnChildSetupFunc | null, pid_callback: DesktopAppLaunchCallback | null): boolean;

        launch_uris_as_manager_with_fds(uris: string[], launch_context: Gio.AppLaunchContext | null, spawn_flags: GLib.SpawnFlags, user_setup: GLib.SpawnChildSetupFunc | null, pid_callback: DesktopAppLaunchCallback | null, stdin_fd: number, stdout_fd: number, stderr_fd: number): boolean;

        list_actions(): string[];

        add_supports_type(content_type: string): boolean;

        can_delete(): boolean;

        can_remove_supports_type(): boolean;

        ["delete"](): boolean;

        dup(): Gio.AppInfo;

        equal(appinfo2: Gio.AppInfo): boolean;

        get_commandline(): string | null;

        get_description(): string | null;

        get_display_name(): string;

        get_executable(): string;

        get_icon(): Gio.Icon | null;

        get_id(): string | null;

        get_name(): string;

        get_supported_types(): string[] | null;

        launch(files: Gio.File[] | null, context: Gio.AppLaunchContext | null): boolean;

        launch_uris(uris: string[] | null, context: Gio.AppLaunchContext | null): boolean;

        launch_uris_async(uris: string[] | null, context: Gio.AppLaunchContext | null, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        launch_uris_async(uris: string[] | null, context: Gio.AppLaunchContext | null, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        launch_uris_async(uris: string[] | null, context: Gio.AppLaunchContext | null, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        launch_uris_finish(result: Gio.AsyncResult): boolean;

        remove_supports_type(content_type: string): boolean;

        set_as_default_for_extension(extension: string): boolean;

        set_as_default_for_type(content_type: string): boolean;

        set_as_last_used_for_type(content_type: string): boolean;

        should_show(): boolean;

        supports_files(): boolean;

        supports_uris(): boolean;

        vfunc_add_supports_type(content_type: string): boolean;

        vfunc_can_delete(): boolean;

        vfunc_can_remove_supports_type(): boolean;

        vfunc_do_delete(): boolean;

        vfunc_dup(): Gio.AppInfo;

        vfunc_equal(appinfo2: Gio.AppInfo): boolean;

        vfunc_get_commandline(): string | null;

        vfunc_get_description(): string | null;

        vfunc_get_display_name(): string;

        vfunc_get_executable(): string;

        vfunc_get_icon(): Gio.Icon | null;

        vfunc_get_id(): string | null;

        vfunc_get_name(): string;

        vfunc_get_supported_types(): string[] | null;

        vfunc_launch(files: Gio.File[] | null, context: Gio.AppLaunchContext | null): boolean;

        vfunc_launch_uris(uris: string[] | null, context: Gio.AppLaunchContext | null): boolean;

        vfunc_launch_uris_async(uris: string[] | null, context: Gio.AppLaunchContext | null, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_launch_uris_finish(result: Gio.AsyncResult): boolean;

        vfunc_remove_supports_type(content_type: string): boolean;

        vfunc_set_as_default_for_extension(extension: string): boolean;

        vfunc_set_as_default_for_type(content_type: string): boolean;

        vfunc_set_as_last_used_for_type(content_type: string): boolean;

        vfunc_should_show(): boolean;

        vfunc_supports_files(): boolean;

        vfunc_supports_uris(): boolean;
    }


    namespace FDMessage {
        // Signal signatures
        interface SignalSignatures extends Gio.SocketControlMessage.SignalSignatures {
            "notify::fd-list": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gio.SocketControlMessage.ConstructorProps {
            fd_list: Gio.UnixFDList;
            fdList: Gio.UnixFDList;
        }
    }

    class FDMessage extends Gio.SocketControlMessage {
        static $gtype: GObject.GType<FDMessage>;

        // Properties
        get fd_list(): Gio.UnixFDList;

        get fdList(): Gio.UnixFDList;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FDMessage.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FDMessage.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): FDMessage;

        static new_with_fd_list(fd_list: Gio.UnixFDList): FDMessage;

        // Signals
        /** @signal */
        connect<K extends keyof FDMessage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FDMessage.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FDMessage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FDMessage.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FDMessage.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FDMessage.SignalSignatures[K]>): void;

        // Methods
        append_fd(fd: number): boolean;

        get_fd_list(): Gio.UnixFDList;

        steal_fds(): number[];
    }


    namespace InputStream {
        // Signal signatures
        interface SignalSignatures extends Gio.InputStream.SignalSignatures {
            "notify::close-fd": (pspec: GObject.ParamSpec) => void;
            "notify::fd": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gio.InputStream.ConstructorProps, Gio.PollableInputStream.ConstructorProps, FileDescriptorBased.ConstructorProps {
            close_fd: boolean;
            closeFd: boolean;
            fd: number;
        }
    }

    class InputStream extends Gio.InputStream implements Gio.PollableInputStream, FileDescriptorBased {
        static $gtype: GObject.GType<InputStream>;

        // Properties
        get close_fd(): boolean;
        set close_fd(val: boolean);

        get closeFd(): boolean;
        set closeFd(val: boolean);

        get fd(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: InputStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<InputStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](fd: number, close_fd: boolean): InputStream;

        // Signals
        /** @signal */
        connect<K extends keyof InputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof InputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof InputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<InputStream.SignalSignatures[K]>): void;

        // Methods
        get_close_fd(): boolean;

        get_fd(): number;

        set_close_fd(close_fd: boolean): void;

        can_poll(): boolean;

        create_source(cancellable: Gio.Cancellable | null): GLib.Source;

        is_readable(): boolean;

        read_nonblocking(cancellable: Gio.Cancellable | null): [number, Uint8Array];

        vfunc_can_poll(): boolean;

        vfunc_create_source(cancellable: Gio.Cancellable | null): GLib.Source;

        vfunc_is_readable(): boolean;

        vfunc_read_nonblocking(): [bigint | number, Uint8Array | string | null];

        vfunc_get_fd(): number;
    }


    namespace MountMonitor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "mountpoints-changed": () => void;
            /** @signal */
            "mounts-changed": () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class MountMonitor extends GObject.Object {
        static $gtype: GObject.GType<MountMonitor>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MountMonitor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MountMonitor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): MountMonitor;

        // Signals
        /** @signal */
        connect<K extends keyof MountMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MountMonitor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MountMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MountMonitor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MountMonitor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MountMonitor.SignalSignatures[K]>): void;

        // Static methods
        static get(): MountMonitor;

        // Methods
        set_rate_limit(limit_msec: number): void;
    }


    namespace OutputStream {
        // Signal signatures
        interface SignalSignatures extends Gio.OutputStream.SignalSignatures {
            "notify::close-fd": (pspec: GObject.ParamSpec) => void;
            "notify::fd": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gio.OutputStream.ConstructorProps, Gio.PollableOutputStream.ConstructorProps, FileDescriptorBased.ConstructorProps {
            close_fd: boolean;
            closeFd: boolean;
            fd: number;
        }
    }

    class OutputStream extends Gio.OutputStream implements Gio.PollableOutputStream, FileDescriptorBased {
        static $gtype: GObject.GType<OutputStream>;

        // Properties
        get close_fd(): boolean;
        set close_fd(val: boolean);

        get closeFd(): boolean;
        set closeFd(val: boolean);

        get fd(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: OutputStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<OutputStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](fd: number, close_fd: boolean): OutputStream;

        // Signals
        /** @signal */
        connect<K extends keyof OutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, OutputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof OutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, OutputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof OutputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<OutputStream.SignalSignatures[K]>): void;

        // Methods
        get_close_fd(): boolean;

        get_fd(): number;

        set_close_fd(close_fd: boolean): void;

        can_poll(): boolean;

        create_source(cancellable: Gio.Cancellable | null): GLib.Source;

        is_writable(): boolean;

        write_nonblocking(buffer: Uint8Array | string, cancellable: Gio.Cancellable | null): number;

        writev_nonblocking(vectors: Gio.OutputVector[], cancellable: Gio.Cancellable | null): [Gio.PollableReturn, number];

        vfunc_can_poll(): boolean;

        vfunc_create_source(cancellable: Gio.Cancellable | null): GLib.Source;

        vfunc_is_writable(): boolean;

        vfunc_write_nonblocking(buffer: Uint8Array | null): bigint | number;

        vfunc_writev_nonblocking(vectors: Gio.OutputVector[]): [Gio.PollableReturn, bigint | number];

        vfunc_get_fd(): number;
    }


    type DesktopAppInfoClass = typeof DesktopAppInfo;

    type DesktopAppInfoLookupIface = typeof DesktopAppInfoLookup;

    type FDMessageClass = typeof FDMessage;

    abstract class FDMessagePrivate {
        static $gtype: GObject.GType<FDMessagePrivate>;
    }


    type FileDescriptorBasedIface = typeof FileDescriptorBased;

    type InputStreamClass = typeof InputStream;

    abstract class InputStreamPrivate {
        static $gtype: GObject.GType<InputStreamPrivate>;
    }


    abstract class MountEntry {
        static $gtype: GObject.GType<MountEntry>;

        // Static methods
        static at(mount_path: string): [MountEntry | null, number];

        static ["for"](file_path: string): [MountEntry | null, number];

        // Methods
        compare(mount2: MountEntry): number;

        copy(): MountEntry;

        free(): void;

        get_device_path(): string;

        get_fs_type(): string;

        get_mount_path(): string;

        get_options(): string | null;

        get_root_path(): string | null;

        guess_can_eject(): boolean;

        guess_icon(): Gio.Icon;

        guess_name(): string;

        guess_should_display(): boolean;

        guess_symbolic_icon(): Gio.Icon;

        is_readonly(): boolean;

        is_system_internal(): boolean;
    }


    type MountMonitorClass = typeof MountMonitor;

    abstract class MountPoint {
        static $gtype: GObject.GType<MountPoint>;

        // Static methods
        static at(mount_path: string): [MountPoint | null, number];

        // Methods
        compare(mount2: MountPoint): number;

        copy(): MountPoint;

        free(): void;

        get_device_path(): string;

        get_fs_type(): string;

        get_mount_path(): string;

        get_options(): string | null;

        guess_can_eject(): boolean;

        guess_icon(): Gio.Icon;

        guess_name(): string;

        guess_symbolic_icon(): Gio.Icon;

        is_loopback(): boolean;

        is_readonly(): boolean;

        is_user_mountable(): boolean;
    }


    type OutputStreamClass = typeof OutputStream;

    abstract class OutputStreamPrivate {
        static $gtype: GObject.GType<OutputStreamPrivate>;
    }


    namespace DesktopAppInfoLookup {
        /**
         * Interface for implementing DesktopAppInfoLookup.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_default_for_uri_scheme(uri_scheme: string): Gio.AppInfo | null;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface DesktopAppInfoLookupNamespace {
        $gtype: GObject.GType<DesktopAppInfoLookup>;
        prototype: DesktopAppInfoLookup;
    }
    interface DesktopAppInfoLookup extends GObject.Object, DesktopAppInfoLookup.Interface {

        // Methods
        get_default_for_uri_scheme(uri_scheme: string): Gio.AppInfo | null;
    }


    export const DesktopAppInfoLookup: DesktopAppInfoLookupNamespace & {
        new (): DesktopAppInfoLookup; // This allows `obj instanceof DesktopAppInfoLookup`
    };

    namespace FileDescriptorBased {
        /**
         * Interface for implementing FileDescriptorBased.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_fd(): number;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface FileDescriptorBasedNamespace {
        $gtype: GObject.GType<FileDescriptorBased>;
        prototype: FileDescriptorBased;
    }
    interface FileDescriptorBased extends GObject.Object, FileDescriptorBased.Interface {

        // Methods
        get_fd(): number;
    }


    export const FileDescriptorBased: FileDescriptorBasedNamespace & {
        new (): FileDescriptorBased; // This allows `obj instanceof FileDescriptorBased`
    };

    const __name__: string;

    const __version__: string;
}

export default GioUnix;

}

declare module 'gi://GioUnix' {
    import GioUnix20 from 'gi://GioUnix?version=2.0';
    export default GioUnix20;
}
// END
