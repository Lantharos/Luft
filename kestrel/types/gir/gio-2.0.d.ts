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

declare module 'gi://Gio?version=2.0' {

// Module dependencies
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type GModule from 'gi://GModule?version=2.0';

export namespace Gio {

/**
 * A convenient helper to create Promise wrappers for asynchronous functions in GJS.
 *
 * This utility replaces the original function on the class prototype with a Promise-based version,
 * allowing the function to be called on any instance of the class, including subclasses.
 * Simply pass the class prototype, the "async" function name, and the "finish" function name as arguments.
 *
 * The function can be used like any other Promise, without the need for a custom wrapper, by leaving out the callback argument.
 * The original function will still be available, and can be used by passing the callback.
 *
 * @param proto - The class prototype that contains the asynchronous function.
 * @param asyncFunc - The name of the asynchronous function.
 * @param finishFunc - The name of the "finish" function that is used to retrieve the result of the asynchronous function.
 *
 * @since 1.54
 * @see https://gjs.guide/guides/gjs/asynchronous-programming.html#promisify-helper
 *
 * @example
 * ```js
 * import Gio from "gi://Gio?version=2.0";
 *
 * Gio._promisify(Gio.InputStream.prototype, 'read_bytes_async', 'read_bytes_finish');
 *
 * try {
 *    const inputStream = new Gio.UnixInputStream({fd: 0});
 *    const bytes = await inputStream.read_bytes_async(4096, GLib.PRIORITY_DEFAULT, null);
 * } catch (e) {
 *    logError(e, 'Failed to read bytes');
 * }
 * ```
 *
 */
export function _promisify(proto: any, asyncFunc: string, finishFunc?: string): void;

/** Temporary Gio.File.prototype fix */
export const _LocalFilePrototype: typeof File.prototype;

    /**
     * Gio-2.0
     */


    export namespace BusType {
        export const $gtype: GObject.GType<BusType>;
    }

    enum BusType {
        STARTER = -1,
        NONE = 0,
        SYSTEM = 1,
        SESSION = 2,
    }


    export namespace ConverterResult {
        export const $gtype: GObject.GType<ConverterResult>;
    }

    enum ConverterResult {
        ERROR = 0,
        CONVERTED = 1,
        FINISHED = 2,
        FLUSHED = 3,
    }


    export namespace CredentialsType {
        export const $gtype: GObject.GType<CredentialsType>;
    }

    enum CredentialsType {
        INVALID = 0,
        LINUX_UCRED = 1,
        FREEBSD_CMSGCRED = 2,
        OPENBSD_SOCKPEERCRED = 3,
        SOLARIS_UCRED = 4,
        NETBSD_UNPCBID = 5,
        APPLE_XUCRED = 6,
        WIN32_PID = 7,
    }


    class DBusError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static NO_MEMORY: number;

        static SERVICE_UNKNOWN: number;

        static NAME_HAS_NO_OWNER: number;

        static NO_REPLY: number;

        static IO_ERROR: number;

        static BAD_ADDRESS: number;

        static NOT_SUPPORTED: number;

        static LIMITS_EXCEEDED: number;

        static ACCESS_DENIED: number;

        static AUTH_FAILED: number;

        static NO_SERVER: number;

        static TIMEOUT: number;

        static NO_NETWORK: number;

        static ADDRESS_IN_USE: number;

        static DISCONNECTED: number;

        static INVALID_ARGS: number;

        static FILE_NOT_FOUND: number;

        static FILE_EXISTS: number;

        static UNKNOWN_METHOD: number;

        static TIMED_OUT: number;

        static MATCH_RULE_NOT_FOUND: number;

        static MATCH_RULE_INVALID: number;

        static SPAWN_EXEC_FAILED: number;

        static SPAWN_FORK_FAILED: number;

        static SPAWN_CHILD_EXITED: number;

        static SPAWN_CHILD_SIGNALED: number;

        static SPAWN_FAILED: number;

        static SPAWN_SETUP_FAILED: number;

        static SPAWN_CONFIG_INVALID: number;

        static SPAWN_SERVICE_INVALID: number;

        static SPAWN_SERVICE_NOT_FOUND: number;

        static SPAWN_PERMISSIONS_INVALID: number;

        static SPAWN_FILE_INVALID: number;

        static SPAWN_NO_MEMORY: number;

        static UNIX_PROCESS_ID_UNKNOWN: number;

        static INVALID_SIGNATURE: number;

        static INVALID_FILE_CONTENT: number;

        static SELINUX_SECURITY_CONTEXT_UNKNOWN: number;

        static ADT_AUDIT_DATA_UNKNOWN: number;

        static OBJECT_PATH_IN_USE: number;

        static UNKNOWN_OBJECT: number;

        static UNKNOWN_INTERFACE: number;

        static UNKNOWN_PROPERTY: number;

        static PROPERTY_READ_ONLY: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static encode_gerror(error: GLib.Error): string;

        static get_remote_error(error: GLib.Error): string | null;

        static is_remote_error(error: GLib.Error): boolean;

        static new_for_dbus_error(dbus_error_name: string, dbus_error_message: string): GLib.Error;

        static quark(): GLib.Quark;

        static register_error(error_domain: GLib.Quark, error_code: number, dbus_error_name: string): boolean;

        static register_error_domain(error_domain_quark_name: string, entries: DBusErrorEntry[]): number;

        static set_dbus_error(dbus_error_name: string, dbus_error_message: string, format: string | null, ___: any[]): GLib.Error | null;

        static set_dbus_error_valist(dbus_error_name: string, dbus_error_message: string, format: string | null, var_args: any): GLib.Error | null;

        static strip_remote_error(error: GLib.Error): boolean;

        static unregister_error(error_domain: GLib.Quark, error_code: number, dbus_error_name: string): boolean;
    }


    export namespace DBusMessageByteOrder {
        export const $gtype: GObject.GType<DBusMessageByteOrder>;
    }

    enum DBusMessageByteOrder {
        BIG_ENDIAN = 66,
        LITTLE_ENDIAN = 108,
    }


    export namespace DBusMessageHeaderField {
        export const $gtype: GObject.GType<DBusMessageHeaderField>;
    }

    enum DBusMessageHeaderField {
        INVALID = 0,
        PATH = 1,
        INTERFACE = 2,
        MEMBER = 3,
        ERROR_NAME = 4,
        REPLY_SERIAL = 5,
        DESTINATION = 6,
        SENDER = 7,
        SIGNATURE = 8,
        NUM_UNIX_FDS = 9,
    }


    export namespace DBusMessageType {
        export const $gtype: GObject.GType<DBusMessageType>;
    }

    enum DBusMessageType {
        INVALID = 0,
        METHOD_CALL = 1,
        METHOD_RETURN = 2,
        ERROR = 3,
        SIGNAL = 4,
    }


    export namespace DataStreamByteOrder {
        export const $gtype: GObject.GType<DataStreamByteOrder>;
    }

    enum DataStreamByteOrder {
        BIG_ENDIAN = 0,
        LITTLE_ENDIAN = 1,
        HOST_ENDIAN = 2,
    }


    export namespace DataStreamNewlineType {
        export const $gtype: GObject.GType<DataStreamNewlineType>;
    }

    enum DataStreamNewlineType {
        LF = 0,
        CR = 1,
        CR_LF = 2,
        ANY = 3,
    }


    export namespace DriveStartStopType {
        export const $gtype: GObject.GType<DriveStartStopType>;
    }

    enum DriveStartStopType {
        UNKNOWN = 0,
        SHUTDOWN = 1,
        NETWORK = 2,
        MULTIDISK = 3,
        PASSWORD = 4,
    }


    export namespace EcnCodePoint {
        export const $gtype: GObject.GType<EcnCodePoint>;
    }

    enum EcnCodePoint {
        NO_ECN = 0,
        ECT_1 = 1,
        ECT_0 = 2,
        ECT_CE = 3,
    }


    export namespace EmblemOrigin {
        export const $gtype: GObject.GType<EmblemOrigin>;
    }

    enum EmblemOrigin {
        UNKNOWN = 0,
        DEVICE = 1,
        LIVEMETADATA = 2,
        TAG = 3,
    }


    export namespace FileAttributeStatus {
        export const $gtype: GObject.GType<FileAttributeStatus>;
    }

    enum FileAttributeStatus {
        UNSET = 0,
        SET = 1,
        ERROR_SETTING = 2,
    }


    export namespace FileAttributeType {
        export const $gtype: GObject.GType<FileAttributeType>;
    }

    enum FileAttributeType {
        INVALID = 0,
        STRING = 1,
        BYTE_STRING = 2,
        BOOLEAN = 3,
        UINT32 = 4,
        INT32 = 5,
        UINT64 = 6,
        INT64 = 7,
        OBJECT = 8,
        STRINGV = 9,
    }


    export namespace FileMonitorEvent {
        export const $gtype: GObject.GType<FileMonitorEvent>;
    }

    enum FileMonitorEvent {
        CHANGED = 0,
        CHANGES_DONE_HINT = 1,
        DELETED = 2,
        CREATED = 3,
        ATTRIBUTE_CHANGED = 4,
        PRE_UNMOUNT = 5,
        UNMOUNTED = 6,
        MOVED = 7,
        RENAMED = 8,
        MOVED_IN = 9,
        MOVED_OUT = 10,
    }


    export namespace FileType {
        export const $gtype: GObject.GType<FileType>;
    }

    enum FileType {
        UNKNOWN = 0,
        REGULAR = 1,
        DIRECTORY = 2,
        SYMBOLIC_LINK = 3,
        SPECIAL = 4,
        SHORTCUT = 5,
        MOUNTABLE = 6,
    }


    export namespace FilesystemPreviewType {
        export const $gtype: GObject.GType<FilesystemPreviewType>;
    }

    enum FilesystemPreviewType {
        IF_ALWAYS = 0,
        IF_LOCAL = 1,
        NEVER = 2,
    }


    class IOErrorEnum extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static NOT_FOUND: number;

        static EXISTS: number;

        static IS_DIRECTORY: number;

        static NOT_DIRECTORY: number;

        static NOT_EMPTY: number;

        static NOT_REGULAR_FILE: number;

        static NOT_SYMBOLIC_LINK: number;

        static NOT_MOUNTABLE_FILE: number;

        static FILENAME_TOO_LONG: number;

        static INVALID_FILENAME: number;

        static TOO_MANY_LINKS: number;

        static NO_SPACE: number;

        static INVALID_ARGUMENT: number;

        static PERMISSION_DENIED: number;

        static NOT_SUPPORTED: number;

        static NOT_MOUNTED: number;

        static ALREADY_MOUNTED: number;

        static CLOSED: number;

        static CANCELLED: number;

        static PENDING: number;

        static READ_ONLY: number;

        static CANT_CREATE_BACKUP: number;

        static WRONG_ETAG: number;

        static TIMED_OUT: number;

        static WOULD_RECURSE: number;

        static BUSY: number;

        static WOULD_BLOCK: number;

        static HOST_NOT_FOUND: number;

        static WOULD_MERGE: number;

        static FAILED_HANDLED: number;

        static TOO_MANY_OPEN_FILES: number;

        static NOT_INITIALIZED: number;

        static ADDRESS_IN_USE: number;

        static PARTIAL_INPUT: number;

        static INVALID_DATA: number;

        static DBUS_ERROR: number;

        static HOST_UNREACHABLE: number;

        static NETWORK_UNREACHABLE: number;

        static CONNECTION_REFUSED: number;

        static PROXY_FAILED: number;

        static PROXY_AUTH_FAILED: number;

        static PROXY_NEED_AUTH: number;

        static PROXY_NOT_ALLOWED: number;

        static BROKEN_PIPE: number;

        static CONNECTION_CLOSED: number;

        static NOT_CONNECTED: number;

        static MESSAGE_TOO_LARGE: number;

        static NO_SUCH_DEVICE: number;

        static DESTINATION_UNSET: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    export namespace MemoryMonitorWarningLevel {
        export const $gtype: GObject.GType<MemoryMonitorWarningLevel>;
    }

    enum MemoryMonitorWarningLevel {
        LOW = 50,
        MEDIUM = 100,
        CRITICAL = 255,
    }


    export namespace MountOperationResult {
        export const $gtype: GObject.GType<MountOperationResult>;
    }

    enum MountOperationResult {
        HANDLED = 0,
        ABORTED = 1,
        UNHANDLED = 2,
    }


    export namespace NetworkConnectivity {
        export const $gtype: GObject.GType<NetworkConnectivity>;
    }

    enum NetworkConnectivity {
        LOCAL = 1,
        LIMITED = 2,
        PORTAL = 3,
        FULL = 4,
    }


    export namespace NotificationPriority {
        export const $gtype: GObject.GType<NotificationPriority>;
    }

    enum NotificationPriority {
        NORMAL = 0,
        LOW = 1,
        HIGH = 2,
        URGENT = 3,
    }


    export namespace PasswordSave {
        export const $gtype: GObject.GType<PasswordSave>;
    }

    enum PasswordSave {
        NEVER = 0,
        FOR_SESSION = 1,
        PERMANENTLY = 2,
    }


    export namespace PollableReturn {
        export const $gtype: GObject.GType<PollableReturn>;
    }

    enum PollableReturn {
        FAILED = 0,
        OK = 1,
        WOULD_BLOCK = -27,
    }


    class ResolverError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static NOT_FOUND: number;

        static TEMPORARY_FAILURE: number;

        static INTERNAL: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace ResolverRecordType {
        export const $gtype: GObject.GType<ResolverRecordType>;
    }

    enum ResolverRecordType {
        SRV = 1,
        MX = 2,
        TXT = 3,
        SOA = 4,
        NS = 5,
    }


    class ResourceError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static NOT_FOUND: number;

        static INTERNAL: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace SocketClientEvent {
        export const $gtype: GObject.GType<SocketClientEvent>;
    }

    enum SocketClientEvent {
        RESOLVING = 0,
        RESOLVED = 1,
        CONNECTING = 2,
        CONNECTED = 3,
        PROXY_NEGOTIATING = 4,
        PROXY_NEGOTIATED = 5,
        TLS_HANDSHAKING = 6,
        TLS_HANDSHAKED = 7,
        COMPLETE = 8,
    }


    export namespace SocketFamily {
        export const $gtype: GObject.GType<SocketFamily>;
    }

    enum SocketFamily {
        INVALID = 0,
        UNIX = 1,
        IPV4 = 2,
        IPV6 = 10,
    }


    export namespace SocketListenerEvent {
        export const $gtype: GObject.GType<SocketListenerEvent>;
    }

    enum SocketListenerEvent {
        BINDING = 0,
        BOUND = 1,
        LISTENING = 2,
        LISTENED = 3,
    }


    export namespace SocketProtocol {
        export const $gtype: GObject.GType<SocketProtocol>;
    }

    enum SocketProtocol {
        UNKNOWN = -1,
        DEFAULT = 0,
        TCP = 6,
        UDP = 17,
        SCTP = 132,
    }


    export namespace SocketType {
        export const $gtype: GObject.GType<SocketType>;
    }

    enum SocketType {
        INVALID = 0,
        STREAM = 1,
        DATAGRAM = 2,
        SEQPACKET = 3,
    }


    export namespace TlsAuthenticationMode {
        export const $gtype: GObject.GType<TlsAuthenticationMode>;
    }

    enum TlsAuthenticationMode {
        NONE = 0,
        REQUESTED = 1,
        REQUIRED = 2,
    }


    class TlsChannelBindingError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static NOT_IMPLEMENTED: number;

        static INVALID_STATE: number;

        static NOT_AVAILABLE: number;

        static NOT_SUPPORTED: number;

        static GENERAL_ERROR: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace TlsChannelBindingType {
        export const $gtype: GObject.GType<TlsChannelBindingType>;
    }

    enum TlsChannelBindingType {
        UNIQUE = 0,
        SERVER_END_POINT = 1,
        EXPORTER = 2,
    }


    class TlsError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static UNAVAILABLE: number;

        static MISC: number;

        static BAD_CERTIFICATE: number;

        static NOT_TLS: number;

        static HANDSHAKE: number;

        static CERTIFICATE_REQUIRED: number;

        static EOF: number;

        static INAPPROPRIATE_FALLBACK: number;

        static BAD_CERTIFICATE_PASSWORD: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace TlsInteractionResult {
        export const $gtype: GObject.GType<TlsInteractionResult>;
    }

    enum TlsInteractionResult {
        UNHANDLED = 0,
        HANDLED = 1,
        FAILED = 2,
    }


    export namespace TlsProtocolVersion {
        export const $gtype: GObject.GType<TlsProtocolVersion>;
    }

    enum TlsProtocolVersion {
        UNKNOWN = 0,
        SSL_3_0 = 1,
        TLS_1_0 = 2,
        TLS_1_1 = 3,
        TLS_1_2 = 4,
        TLS_1_3 = 5,
        DTLS_1_0 = 201,
        DTLS_1_2 = 202,
    }


    export namespace TlsRehandshakeMode {
        export const $gtype: GObject.GType<TlsRehandshakeMode>;
    }

    enum TlsRehandshakeMode {
        NEVER = 0,
        SAFELY = 1,
        UNSAFELY = 2,
    }


    export namespace UnixSocketAddressType {
        export const $gtype: GObject.GType<UnixSocketAddressType>;
    }

    enum UnixSocketAddressType {
        INVALID = 0,
        ANONYMOUS = 1,
        PATH = 2,
        ABSTRACT = 3,
        ABSTRACT_PADDED = 4,
    }


    export namespace ZlibCompressorFormat {
        export const $gtype: GObject.GType<ZlibCompressorFormat>;
    }

    enum ZlibCompressorFormat {
        ZLIB = 0,
        GZIP = 1,
        RAW = 2,
    }


    const DBUS_METHOD_INVOCATION_HANDLED: boolean;

    const DBUS_METHOD_INVOCATION_UNHANDLED: boolean;

    const DEBUG_CONTROLLER_EXTENSION_POINT_NAME: string;

    const DRIVE_IDENTIFIER_KIND_UNIX_DEVICE: string;

    const FILE_ATTRIBUTE_ACCESS_CAN_DELETE: string;

    const FILE_ATTRIBUTE_ACCESS_CAN_EXECUTE: string;

    const FILE_ATTRIBUTE_ACCESS_CAN_READ: string;

    const FILE_ATTRIBUTE_ACCESS_CAN_RENAME: string;

    const FILE_ATTRIBUTE_ACCESS_CAN_TRASH: string;

    const FILE_ATTRIBUTE_ACCESS_CAN_WRITE: string;

    const FILE_ATTRIBUTE_DOS_IS_ARCHIVE: string;

    const FILE_ATTRIBUTE_DOS_IS_MOUNTPOINT: string;

    const FILE_ATTRIBUTE_DOS_IS_SYSTEM: string;

    const FILE_ATTRIBUTE_DOS_REPARSE_POINT_TAG: string;

    const FILE_ATTRIBUTE_ETAG_VALUE: string;

    const FILE_ATTRIBUTE_FILESYSTEM_FREE: string;

    const FILE_ATTRIBUTE_FILESYSTEM_READONLY: string;

    const FILE_ATTRIBUTE_FILESYSTEM_REMOTE: string;

    const FILE_ATTRIBUTE_FILESYSTEM_SIZE: string;

    const FILE_ATTRIBUTE_FILESYSTEM_TYPE: string;

    const FILE_ATTRIBUTE_FILESYSTEM_USED: string;

    const FILE_ATTRIBUTE_FILESYSTEM_USE_PREVIEW: string;

    const FILE_ATTRIBUTE_GVFS_BACKEND: string;

    const FILE_ATTRIBUTE_ID_FILE: string;

    const FILE_ATTRIBUTE_ID_FILESYSTEM: string;

    const FILE_ATTRIBUTE_MOUNTABLE_CAN_EJECT: string;

    const FILE_ATTRIBUTE_MOUNTABLE_CAN_MOUNT: string;

    const FILE_ATTRIBUTE_MOUNTABLE_CAN_POLL: string;

    const FILE_ATTRIBUTE_MOUNTABLE_CAN_START: string;

    const FILE_ATTRIBUTE_MOUNTABLE_CAN_START_DEGRADED: string;

    const FILE_ATTRIBUTE_MOUNTABLE_CAN_STOP: string;

    const FILE_ATTRIBUTE_MOUNTABLE_CAN_UNMOUNT: string;

    const FILE_ATTRIBUTE_MOUNTABLE_HAL_UDI: string;

    const FILE_ATTRIBUTE_MOUNTABLE_IS_MEDIA_CHECK_AUTOMATIC: string;

    const FILE_ATTRIBUTE_MOUNTABLE_START_STOP_TYPE: string;

    const FILE_ATTRIBUTE_MOUNTABLE_UNIX_DEVICE: string;

    const FILE_ATTRIBUTE_MOUNTABLE_UNIX_DEVICE_FILE: string;

    const FILE_ATTRIBUTE_OWNER_GROUP: string;

    const FILE_ATTRIBUTE_OWNER_USER: string;

    const FILE_ATTRIBUTE_OWNER_USER_REAL: string;

    const FILE_ATTRIBUTE_PREVIEW_ICON: string;

    const FILE_ATTRIBUTE_RECENT_MODIFIED: string;

    const FILE_ATTRIBUTE_SELINUX_CONTEXT: string;

    const FILE_ATTRIBUTE_STANDARD_ALLOCATED_SIZE: string;

    const FILE_ATTRIBUTE_STANDARD_CONTENT_TYPE: string;

    const FILE_ATTRIBUTE_STANDARD_COPY_NAME: string;

    const FILE_ATTRIBUTE_STANDARD_DESCRIPTION: string;

    const FILE_ATTRIBUTE_STANDARD_DISPLAY_NAME: string;

    const FILE_ATTRIBUTE_STANDARD_EDIT_NAME: string;

    const FILE_ATTRIBUTE_STANDARD_FAST_CONTENT_TYPE: string;

    const FILE_ATTRIBUTE_STANDARD_ICON: string;

    const FILE_ATTRIBUTE_STANDARD_IS_BACKUP: string;

    const FILE_ATTRIBUTE_STANDARD_IS_HIDDEN: string;

    const FILE_ATTRIBUTE_STANDARD_IS_SYMLINK: string;

    const FILE_ATTRIBUTE_STANDARD_IS_VIRTUAL: string;

    const FILE_ATTRIBUTE_STANDARD_IS_VOLATILE: string;

    const FILE_ATTRIBUTE_STANDARD_NAME: string;

    const FILE_ATTRIBUTE_STANDARD_SIZE: string;

    const FILE_ATTRIBUTE_STANDARD_SORT_ORDER: string;

    const FILE_ATTRIBUTE_STANDARD_SYMBOLIC_ICON: string;

    const FILE_ATTRIBUTE_STANDARD_SYMLINK_TARGET: string;

    const FILE_ATTRIBUTE_STANDARD_TARGET_URI: string;

    const FILE_ATTRIBUTE_STANDARD_TYPE: string;

    const FILE_ATTRIBUTE_THUMBNAILING_FAILED: string;

    const FILE_ATTRIBUTE_THUMBNAILING_FAILED_LARGE: string;

    const FILE_ATTRIBUTE_THUMBNAILING_FAILED_NORMAL: string;

    const FILE_ATTRIBUTE_THUMBNAILING_FAILED_XLARGE: string;

    const FILE_ATTRIBUTE_THUMBNAILING_FAILED_XXLARGE: string;

    const FILE_ATTRIBUTE_THUMBNAIL_IS_VALID: string;

    const FILE_ATTRIBUTE_THUMBNAIL_IS_VALID_LARGE: string;

    const FILE_ATTRIBUTE_THUMBNAIL_IS_VALID_NORMAL: string;

    const FILE_ATTRIBUTE_THUMBNAIL_IS_VALID_XLARGE: string;

    const FILE_ATTRIBUTE_THUMBNAIL_IS_VALID_XXLARGE: string;

    const FILE_ATTRIBUTE_THUMBNAIL_PATH: string;

    const FILE_ATTRIBUTE_THUMBNAIL_PATH_LARGE: string;

    const FILE_ATTRIBUTE_THUMBNAIL_PATH_NORMAL: string;

    const FILE_ATTRIBUTE_THUMBNAIL_PATH_XLARGE: string;

    const FILE_ATTRIBUTE_THUMBNAIL_PATH_XXLARGE: string;

    const FILE_ATTRIBUTE_TIME_ACCESS: string;

    const FILE_ATTRIBUTE_TIME_ACCESS_NSEC: string;

    const FILE_ATTRIBUTE_TIME_ACCESS_USEC: string;

    const FILE_ATTRIBUTE_TIME_CHANGED: string;

    const FILE_ATTRIBUTE_TIME_CHANGED_NSEC: string;

    const FILE_ATTRIBUTE_TIME_CHANGED_USEC: string;

    const FILE_ATTRIBUTE_TIME_CREATED: string;

    const FILE_ATTRIBUTE_TIME_CREATED_NSEC: string;

    const FILE_ATTRIBUTE_TIME_CREATED_USEC: string;

    const FILE_ATTRIBUTE_TIME_MODIFIED: string;

    const FILE_ATTRIBUTE_TIME_MODIFIED_NSEC: string;

    const FILE_ATTRIBUTE_TIME_MODIFIED_USEC: string;

    const FILE_ATTRIBUTE_TRASH_DELETION_DATE: string;

    const FILE_ATTRIBUTE_TRASH_ITEM_COUNT: string;

    const FILE_ATTRIBUTE_TRASH_ORIG_PATH: string;

    const FILE_ATTRIBUTE_UNIX_BLOCKS: string;

    const FILE_ATTRIBUTE_UNIX_BLOCK_SIZE: string;

    const FILE_ATTRIBUTE_UNIX_DEVICE: string;

    const FILE_ATTRIBUTE_UNIX_GID: string;

    const FILE_ATTRIBUTE_UNIX_INODE: string;

    const FILE_ATTRIBUTE_UNIX_IS_MOUNTPOINT: string;

    const FILE_ATTRIBUTE_UNIX_MODE: string;

    const FILE_ATTRIBUTE_UNIX_NLINK: string;

    const FILE_ATTRIBUTE_UNIX_RDEV: string;

    const FILE_ATTRIBUTE_UNIX_UID: string;

    const MEMORY_MONITOR_EXTENSION_POINT_NAME: string;

    const MENU_ATTRIBUTE_ACTION: string;

    const MENU_ATTRIBUTE_ACTION_NAMESPACE: string;

    const MENU_ATTRIBUTE_ICON: string;

    const MENU_ATTRIBUTE_LABEL: string;

    const MENU_ATTRIBUTE_TARGET: string;

    const MENU_EXPORTER_MAX_SECTION_SIZE: number;

    const MENU_LINK_SECTION: string;

    const MENU_LINK_SUBMENU: string;

    const NATIVE_VOLUME_MONITOR_EXTENSION_POINT_NAME: string;

    const NETWORK_MONITOR_EXTENSION_POINT_NAME: string;

    const POWER_PROFILE_MONITOR_EXTENSION_POINT_NAME: string;

    const PROXY_EXTENSION_POINT_NAME: string;

    const PROXY_RESOLVER_EXTENSION_POINT_NAME: string;

    const SETTINGS_BACKEND_EXTENSION_POINT_NAME: string;

    const TLS_BACKEND_EXTENSION_POINT_NAME: string;

    const TLS_DATABASE_PURPOSE_AUTHENTICATE_CLIENT: string;

    const TLS_DATABASE_PURPOSE_AUTHENTICATE_SERVER: string;

    const VFS_EXTENSION_POINT_NAME: string;

    const VOLUME_IDENTIFIER_KIND_CLASS: string;

    const VOLUME_IDENTIFIER_KIND_HAL_UDI: string;

    const VOLUME_IDENTIFIER_KIND_LABEL: string;

    const VOLUME_IDENTIFIER_KIND_NFS_MOUNT: string;

    const VOLUME_IDENTIFIER_KIND_UNIX_DEVICE: string;

    const VOLUME_IDENTIFIER_KIND_UUID: string;

    const VOLUME_MONITOR_EXTENSION_POINT_NAME: string;

    function action_name_is_valid(action_name: string): boolean;

    function action_parse_detailed_name(detailed_name: string): [boolean, string, GLib.Variant | null];

    function action_print_detailed_name(action_name: string, target_value: GLib.Variant | null): string;

    function app_info_create_from_commandline(commandline: string, application_name: string | null, flags: AppInfoCreateFlags): AppInfo;

    function app_info_get_all(): AppInfo[];

    function app_info_get_all_for_type(content_type: string): AppInfo[];

    function app_info_get_default_for_type(content_type: string, must_support_uris: boolean): AppInfo | null;

    function app_info_get_default_for_type_async(content_type: string, must_support_uris: boolean, cancellable: Cancellable | null): globalThis.Promise<AppInfo>;
    function app_info_get_default_for_type_async(content_type: string, must_support_uris: boolean, cancellable: Cancellable | null, callback: AsyncReadyCallback<string> | null): void;
    function app_info_get_default_for_type_async(content_type: string, must_support_uris: boolean, cancellable: Cancellable | null, callback: AsyncReadyCallback<string> | null): globalThis.Promise<AppInfo> | void;

    function app_info_get_default_for_type_finish(result: AsyncResult): AppInfo;

    function app_info_get_default_for_uri_scheme(uri_scheme: string): AppInfo | null;

    function app_info_get_default_for_uri_scheme_async(uri_scheme: string, cancellable: Cancellable | null): globalThis.Promise<AppInfo>;
    function app_info_get_default_for_uri_scheme_async(uri_scheme: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<string> | null): void;
    function app_info_get_default_for_uri_scheme_async(uri_scheme: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<string> | null): globalThis.Promise<AppInfo> | void;

    function app_info_get_default_for_uri_scheme_finish(result: AsyncResult): AppInfo;

    function app_info_get_fallback_for_type(content_type: string): AppInfo[];

    function app_info_get_recommended_for_type(content_type: string): AppInfo[];

    function app_info_launch_default_for_uri(uri: string, context: AppLaunchContext | null): boolean;

    function app_info_launch_default_for_uri_async(uri: string, context: AppLaunchContext | null, cancellable: Cancellable | null): globalThis.Promise<boolean>;
    function app_info_launch_default_for_uri_async(uri: string, context: AppLaunchContext | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<string> | null): void;
    function app_info_launch_default_for_uri_async(uri: string, context: AppLaunchContext | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<string> | null): globalThis.Promise<boolean> | void;

    function app_info_launch_default_for_uri_finish(result: AsyncResult): boolean;

    function app_info_reset_type_associations(content_type: string): void;

    function async_initable_newv_async(object_type: GObject.GType, n_parameters: number, parameters: GObject.Parameter, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<GObject.GType> | null): void;

    function bus_get(bus_type: BusType, cancellable: Cancellable | null): globalThis.Promise<DBusConnection>;
    function bus_get(bus_type: BusType, cancellable: Cancellable | null, callback: AsyncReadyCallback<BusType> | null): void;
    function bus_get(bus_type: BusType, cancellable: Cancellable | null, callback: AsyncReadyCallback<BusType> | null): globalThis.Promise<DBusConnection> | void;

    function bus_get_finish(res: AsyncResult): DBusConnection;

    function bus_get_sync(bus_type: BusType, cancellable: Cancellable | null): DBusConnection;

    function bus_own_name(bus_type: BusType, name: string, flags: BusNameOwnerFlags, bus_acquired_closure: GObject.Closure | null, name_acquired_closure: GObject.Closure | null, name_lost_closure: GObject.Closure | null): number;

    function bus_own_name_on_connection(connection: DBusConnection, name: string, flags: BusNameOwnerFlags, name_acquired_closure: GObject.Closure | null, name_lost_closure: GObject.Closure | null): number;

    function bus_unown_name(owner_id: number): void;

    function bus_unwatch_name(watcher_id: number): void;

    function bus_watch_name(bus_type: BusType, name: string, flags: BusNameWatcherFlags, name_appeared_closure: GObject.Closure | null, name_vanished_closure: GObject.Closure | null): number;

    function bus_watch_name_on_connection(connection: DBusConnection, name: string, flags: BusNameWatcherFlags, name_appeared_closure: GObject.Closure | null, name_vanished_closure: GObject.Closure | null): number;

    function content_type_can_be_executable(type: string): boolean;

    function content_type_equals(type1: string, type2: string): boolean;

    function content_type_from_mime_type(mime_type: string): string | null;

    function content_type_get_description(type: string): string;

    function content_type_get_generic_icon_name(type: string): string | null;

    function content_type_get_icon(type: string): Icon;

    function content_type_get_mime_dirs(): string[];

    function content_type_get_mime_type(type: string): string | null;

    function content_type_get_symbolic_icon(type: string): Icon;

    function content_type_guess(filename: string | null, data: Uint8Array | string | null): [string, boolean];

    function content_type_guess_for_tree(root: File): string[];

    function content_type_is_a(type: string, supertype: string): boolean;

    function content_type_is_mime_type(type: string, mime_type: string): boolean;

    function content_type_is_unknown(type: string): boolean;

    function content_type_set_mime_dirs(dirs: string[] | null): void;

    function content_types_get_registered(): string[];

    function dbus_address_escape_value(string: string): string;

    function dbus_address_get_for_bus_sync(bus_type: BusType, cancellable: Cancellable | null): string;

    function dbus_address_get_stream(address: string, cancellable: Cancellable | null): globalThis.Promise<[IOStream, string]>;
    function dbus_address_get_stream(address: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<string> | null): void;
    function dbus_address_get_stream(address: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<string> | null): globalThis.Promise<[IOStream, string]> | void;

    function dbus_address_get_stream_finish(res: AsyncResult): [IOStream, string];

    function dbus_address_get_stream_sync(address: string, cancellable: Cancellable | null): [IOStream, string];

    function dbus_annotation_info_lookup(annotations: DBusAnnotationInfo[] | null, name: string): string | null;

    function dbus_error_encode_gerror(error: GLib.Error): string;

    function dbus_error_get_remote_error(error: GLib.Error): string | null;

    function dbus_error_is_remote_error(error: GLib.Error): boolean;

    function dbus_error_new_for_dbus_error(dbus_error_name: string, dbus_error_message: string): GLib.Error;

    function dbus_error_quark(): GLib.Quark;

    function dbus_error_register_error(error_domain: GLib.Quark, error_code: number, dbus_error_name: string): boolean;

    function dbus_error_register_error_domain(error_domain_quark_name: string, entries: DBusErrorEntry[]): number;

    function dbus_error_strip_remote_error(error: GLib.Error): boolean;

    function dbus_error_unregister_error(error_domain: GLib.Quark, error_code: number, dbus_error_name: string): boolean;

    function dbus_escape_object_path(s: string): string;

    function dbus_escape_object_path_bytestring(bytes: Uint8Array | string): string;

    function dbus_generate_guid(): string;

    function dbus_gvalue_to_gvariant(gvalue: GObject.Value | any, type: GLib.VariantType): GLib.Variant;

    function dbus_gvariant_to_gvalue(value: GLib.Variant): unknown;

    function dbus_is_address(string: string): boolean;

    function dbus_is_error_name(string: string): boolean;

    function dbus_is_guid(string: string): boolean;

    function dbus_is_interface_name(string: string): boolean;

    function dbus_is_member_name(string: string): boolean;

    function dbus_is_name(string: string): boolean;

    function dbus_is_supported_address(string: string): boolean;

    function dbus_is_unique_name(string: string): boolean;

    function dbus_unescape_object_path(s: string): Uint8Array | null;

    function dtls_client_connection_new(base_socket: DatagramBased, server_identity: SocketConnectable | null): DtlsClientConnection;

    function dtls_server_connection_new(base_socket: DatagramBased, certificate: TlsCertificate | null): DtlsServerConnection;

    function file_new_build_filenamev(args: string[]): File;

    function file_new_for_commandline_arg(arg: string): File;

    function file_new_for_commandline_arg_and_cwd(arg: string, cwd: string): File;

    function file_new_for_path(path: string): File;

    function file_new_for_uri(uri: string): File;

    function file_new_tmp(tmpl: string | null): [File, FileIOStream];

    function file_new_tmp_async(tmpl: string | null, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<[File, FileIOStream]>;
    function file_new_tmp_async(tmpl: string | null, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<string | null> | null): void;
    function file_new_tmp_async(tmpl: string | null, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<string | null> | null): globalThis.Promise<[File, FileIOStream]> | void;

    function file_new_tmp_dir_async(tmpl: string | null, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<File>;
    function file_new_tmp_dir_async(tmpl: string | null, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<string | null> | null): void;
    function file_new_tmp_dir_async(tmpl: string | null, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<string | null> | null): globalThis.Promise<File> | void;

    function file_new_tmp_dir_finish(result: AsyncResult): File;

    function file_new_tmp_finish(result: AsyncResult): [File, FileIOStream];

    function file_parse_name(parse_name: string): File;

    function icon_deserialize(value: GLib.Variant): Icon | null;

    function icon_new_for_string(str: string): Icon;

    function initable_newv<T = GObject.Object>(object_type: GObject.GType, parameters: GObject.Parameter[], cancellable: Cancellable | null): T;

    function io_error_from_errno(err_no: number): IOErrorEnum;

    function io_error_from_file_error(file_error: GLib.FileError): IOErrorEnum;

    function io_error_quark(): GLib.Quark;

    function io_extension_point_implement(extension_point_name: string, type: GObject.GType, extension_name: string, priority: number): IOExtension;

    function io_extension_point_lookup(name: string): IOExtensionPoint;

    function io_extension_point_register(name: string): IOExtensionPoint;

    function io_modules_load_all_in_directory(dirname: string): IOModule[];

    function io_modules_load_all_in_directory_with_scope(dirname: string, scope: IOModuleScope): IOModule[];

    function io_modules_scan_all_in_directory(dirname: string): void;

    function io_modules_scan_all_in_directory_with_scope(dirname: string, scope: IOModuleScope): void;

    function io_scheduler_cancel_all_jobs(): void;

    function io_scheduler_push_job(job_func: IOSchedulerJobFunc, io_priority: number, cancellable: Cancellable | null): void;

    function keyfile_settings_backend_new(filename: string, root_path: string, root_group: string | null): SettingsBackend;

    function memory_monitor_dup_default(): MemoryMonitor;

    function memory_settings_backend_new(): SettingsBackend;

    function network_monitor_get_default(): NetworkMonitor;

    function networking_init(): void;

    function null_settings_backend_new(): SettingsBackend;

    function pollable_source_new(pollable_stream: GObject.Object): GLib.Source;

    function pollable_source_new_full(pollable_stream: GObject.Object, child_source: GLib.Source | null, cancellable: Cancellable | null): GLib.Source;

    function pollable_stream_read(stream: InputStream, buffer: Uint8Array | string, blocking: boolean, cancellable: Cancellable | null): number;

    function pollable_stream_write(stream: OutputStream, buffer: Uint8Array | string, blocking: boolean, cancellable: Cancellable | null): number;

    function pollable_stream_write_all(stream: OutputStream, buffer: Uint8Array | string, blocking: boolean, cancellable: Cancellable | null): [boolean, number];

    function power_profile_monitor_dup_default(): PowerProfileMonitor;

    function proxy_get_default_for_protocol(protocol: string): Proxy | null;

    function proxy_resolver_get_default(): ProxyResolver;

    function resolver_error_quark(): GLib.Quark;

    function resource_error_quark(): GLib.Quark;

    function resource_load(filename: string): Resource;

    function resources_enumerate_children(path: string, lookup_flags: ResourceLookupFlags): string[];

    function resources_get_info(path: string, lookup_flags: ResourceLookupFlags): [boolean, number, number];

    function resources_has_children(path: string): boolean;

    function resources_lookup_data(path: string, lookup_flags: ResourceLookupFlags): GLib.Bytes;

    function resources_open_stream(path: string, lookup_flags: ResourceLookupFlags): InputStream;

    function resources_register(resource: Resource): void;

    function resources_unregister(resource: Resource): void;

    function settings_schema_source_get_default(): SettingsSchemaSource | null;

    function simple_async_report_gerror_in_idle(object: GObject.Object | null, callback: AsyncReadyCallback<GObject.Object | null> | null, error: GLib.Error): void;

    function tls_backend_get_default(): TlsBackend;

    function tls_channel_binding_error_quark(): GLib.Quark;

    function tls_client_connection_new(base_io_stream: IOStream, server_identity: SocketConnectable | null): TlsClientConnection;

    function tls_error_quark(): GLib.Quark;

    function tls_file_database_new(anchors: string): TlsFileDatabase;

    function tls_server_connection_new(base_io_stream: IOStream, certificate: TlsCertificate | null): TlsServerConnection;

    interface AsyncReadyCallback<A = GObject.Object> {
        (source_object: A | null, res: AsyncResult, data: null): void;
    }

    interface BusAcquiredCallback {
        (connection: DBusConnection, name: string): void;
    }

    interface BusNameAcquiredCallback {
        (connection: DBusConnection, name: string): void;
    }

    interface BusNameAppearedCallback {
        (connection: DBusConnection, name: string, name_owner: string): void;
    }

    interface BusNameLostCallback {
        (connection: DBusConnection, name: string): void;
    }

    interface BusNameVanishedCallback {
        (connection: DBusConnection, name: string): void;
    }

    interface CancellableSourceFunc {
        (cancellable: Cancellable | null, data: null): boolean;
    }

    interface DBusInterfaceGetPropertyFunc {
        (connection: DBusConnection, sender: string | null, object_path: string, interface_name: string, property_name: string, error: GLib.Error): GLib.Variant;
    }

    interface DBusInterfaceMethodCallFunc {
        (connection: DBusConnection, sender: string | null, object_path: string, interface_name: string | null, method_name: string, parameters: GLib.Variant, invocation: DBusMethodInvocation): void;
    }

    interface DBusInterfaceSetPropertyFunc {
        (connection: DBusConnection, sender: string | null, object_path: string, interface_name: string, property_name: string, value: GLib.Variant, error: GLib.Error): boolean;
    }

    interface DBusMessageFilterFunction {
        (connection: DBusConnection, message: DBusMessage, incoming: boolean): DBusMessage | null;
    }

    interface DBusProxyTypeFunc {
        (manager: DBusObjectManagerClient, object_path: string, interface_name: string | null, data: null): GObject.GType;
    }

    interface DBusSignalCallback {
        (connection: DBusConnection, sender_name: string | null, object_path: string, interface_name: string, signal_name: string, parameters: GLib.Variant): void;
    }

    interface DBusSubtreeDispatchFunc {
        (connection: DBusConnection, sender: string, object_path: string, interface_name: string, node: string, out_user_data: null): DBusInterfaceVTable | null;
    }

    interface DBusSubtreeEnumerateFunc {
        (connection: DBusConnection, sender: string, object_path: string): string[];
    }

    interface DBusSubtreeIntrospectFunc {
        (connection: DBusConnection, sender: string, object_path: string, node: string): DBusInterfaceInfo[] | null;
    }

    interface DatagramBasedSourceFunc {
        (datagram_based: DatagramBased, condition: GLib.IOCondition, data: null): boolean;
    }

    interface FileMeasureProgressCallback {
        (reporting: boolean, current_size: number, num_dirs: number, num_files: number, data: null): void;
    }

    interface FileProgressCallback {
        (current_num_bytes: number, total_num_bytes: number, data: null): void;
    }

    interface FileReadMoreCallback {
        (file_contents: string, file_size: number, callback_data: null): boolean;
    }

    interface IOSchedulerJobFunc {
        (job: IOSchedulerJob, cancellable: Cancellable | null, data: null): boolean;
    }

    interface PollableSourceFunc<A = GObject.Object> {
        (pollable_stream: A, data: null): boolean;
    }

    interface ReallocFunc {
        (data: null, size: number): null;
    }

    interface SettingsBindGetMapping {
        (value: unknown, variant: GLib.Variant): boolean;
    }

    interface SettingsBindSetMapping {
        (value: unknown, expected_type: GLib.VariantType): GLib.Variant | null;
    }

    interface SettingsGetMapping {
        (value: GLib.Variant | null): boolean;
    }

    interface SimpleAsyncThreadFunc<A = GObject.Object> {
        (res: SimpleAsyncResult, object: A, cancellable: Cancellable | null): void;
    }

    interface SocketSourceFunc {
        (socket: Socket, condition: GLib.IOCondition, data: null): boolean;
    }

    interface TaskThreadFunc<A = GObject.Object> {
        (task: Task, source_object: A, task_data: null, cancellable: Cancellable | null): void;
    }

    interface VfsFileLookupFunc {
        (vfs: Vfs, identifier: string): File | null;
    }

    export namespace AppInfoCreateFlags {
        export const $gtype: GObject.GType<AppInfoCreateFlags>;
    }

    enum AppInfoCreateFlags {
        NONE = 0,
        NEEDS_TERMINAL = 1,
        SUPPORTS_URIS = 2,
        SUPPORTS_STARTUP_NOTIFICATION = 4,
    }


    export namespace ApplicationFlags {
        export const $gtype: GObject.GType<ApplicationFlags>;
    }

    enum ApplicationFlags {
        FLAGS_NONE = 0,
        DEFAULT_FLAGS = 0,
        IS_SERVICE = 1,
        IS_LAUNCHER = 2,
        HANDLES_OPEN = 4,
        HANDLES_COMMAND_LINE = 8,
        SEND_ENVIRONMENT = 16,
        NON_UNIQUE = 32,
        CAN_OVERRIDE_APP_ID = 64,
        ALLOW_REPLACEMENT = 128,
        REPLACE = 256,
    }


    export namespace AskPasswordFlags {
        export const $gtype: GObject.GType<AskPasswordFlags>;
    }

    enum AskPasswordFlags {
        NEED_PASSWORD = 1,
        NEED_USERNAME = 2,
        NEED_DOMAIN = 4,
        SAVING_SUPPORTED = 8,
        ANONYMOUS_SUPPORTED = 16,
        TCRYPT = 32,
    }


    export namespace BusNameOwnerFlags {
        export const $gtype: GObject.GType<BusNameOwnerFlags>;
    }

    enum BusNameOwnerFlags {
        NONE = 0,
        ALLOW_REPLACEMENT = 1,
        REPLACE = 2,
        DO_NOT_QUEUE = 4,
    }


    export namespace BusNameWatcherFlags {
        export const $gtype: GObject.GType<BusNameWatcherFlags>;
    }

    enum BusNameWatcherFlags {
        NONE = 0,
        AUTO_START = 1,
    }


    export namespace ConverterFlags {
        export const $gtype: GObject.GType<ConverterFlags>;
    }

    enum ConverterFlags {
        NONE = 0,
        INPUT_AT_END = 1,
        FLUSH = 2,
    }


    export namespace DBusCallFlags {
        export const $gtype: GObject.GType<DBusCallFlags>;
    }

    enum DBusCallFlags {
        NONE = 0,
        NO_AUTO_START = 1,
        ALLOW_INTERACTIVE_AUTHORIZATION = 2,
    }


    export namespace DBusCapabilityFlags {
        export const $gtype: GObject.GType<DBusCapabilityFlags>;
    }

    enum DBusCapabilityFlags {
        NONE = 0,
        UNIX_FD_PASSING = 1,
    }


    export namespace DBusConnectionFlags {
        export const $gtype: GObject.GType<DBusConnectionFlags>;
    }

    enum DBusConnectionFlags {
        NONE = 0,
        AUTHENTICATION_CLIENT = 1,
        AUTHENTICATION_SERVER = 2,
        AUTHENTICATION_ALLOW_ANONYMOUS = 4,
        MESSAGE_BUS_CONNECTION = 8,
        DELAY_MESSAGE_PROCESSING = 16,
        AUTHENTICATION_REQUIRE_SAME_USER = 32,
        CROSS_NAMESPACE = 64,
    }


    export namespace DBusInterfaceSkeletonFlags {
        export const $gtype: GObject.GType<DBusInterfaceSkeletonFlags>;
    }

    enum DBusInterfaceSkeletonFlags {
        NONE = 0,
        HANDLE_METHOD_INVOCATIONS_IN_THREAD = 1,
    }


    export namespace DBusMessageFlags {
        export const $gtype: GObject.GType<DBusMessageFlags>;
    }

    enum DBusMessageFlags {
        NONE = 0,
        NO_REPLY_EXPECTED = 1,
        NO_AUTO_START = 2,
        ALLOW_INTERACTIVE_AUTHORIZATION = 4,
    }


    export namespace DBusObjectManagerClientFlags {
        export const $gtype: GObject.GType<DBusObjectManagerClientFlags>;
    }

    enum DBusObjectManagerClientFlags {
        NONE = 0,
        DO_NOT_AUTO_START = 1,
    }


    export namespace DBusPropertyInfoFlags {
        export const $gtype: GObject.GType<DBusPropertyInfoFlags>;
    }

    enum DBusPropertyInfoFlags {
        NONE = 0,
        READABLE = 1,
        WRITABLE = 2,
    }


    export namespace DBusProxyFlags {
        export const $gtype: GObject.GType<DBusProxyFlags>;
    }

    enum DBusProxyFlags {
        NONE = 0,
        DO_NOT_LOAD_PROPERTIES = 1,
        DO_NOT_CONNECT_SIGNALS = 2,
        DO_NOT_AUTO_START = 4,
        GET_INVALIDATED_PROPERTIES = 8,
        DO_NOT_AUTO_START_AT_CONSTRUCTION = 16,
        NO_MATCH_RULE = 32,
    }


    export namespace DBusSendMessageFlags {
        export const $gtype: GObject.GType<DBusSendMessageFlags>;
    }

    enum DBusSendMessageFlags {
        NONE = 0,
        PRESERVE_SERIAL = 1,
    }


    export namespace DBusServerFlags {
        export const $gtype: GObject.GType<DBusServerFlags>;
    }

    enum DBusServerFlags {
        NONE = 0,
        RUN_IN_THREAD = 1,
        AUTHENTICATION_ALLOW_ANONYMOUS = 2,
        AUTHENTICATION_REQUIRE_SAME_USER = 4,
    }


    export namespace DBusSignalFlags {
        export const $gtype: GObject.GType<DBusSignalFlags>;
    }

    enum DBusSignalFlags {
        NONE = 0,
        NO_MATCH_RULE = 1,
        MATCH_ARG0_NAMESPACE = 2,
        MATCH_ARG0_PATH = 4,
    }


    export namespace DBusSubtreeFlags {
        export const $gtype: GObject.GType<DBusSubtreeFlags>;
    }

    enum DBusSubtreeFlags {
        NONE = 0,
        DISPATCH_TO_UNENUMERATED_NODES = 1,
    }


    export namespace DriveStartFlags {
        export const $gtype: GObject.GType<DriveStartFlags>;
    }

    enum DriveStartFlags {
        NONE = 0,
    }


    export namespace FileAttributeInfoFlags {
        export const $gtype: GObject.GType<FileAttributeInfoFlags>;
    }

    enum FileAttributeInfoFlags {
        NONE = 0,
        COPY_WITH_FILE = 1,
        COPY_WHEN_MOVED = 2,
    }


    export namespace FileCopyFlags {
        export const $gtype: GObject.GType<FileCopyFlags>;
    }

    enum FileCopyFlags {
        NONE = 0,
        OVERWRITE = 1,
        BACKUP = 2,
        NOFOLLOW_SYMLINKS = 4,
        ALL_METADATA = 8,
        NO_FALLBACK_FOR_MOVE = 16,
        TARGET_DEFAULT_PERMS = 32,
        TARGET_DEFAULT_MODIFIED_TIME = 64,
    }


    export namespace FileCreateFlags {
        export const $gtype: GObject.GType<FileCreateFlags>;
    }

    enum FileCreateFlags {
        NONE = 0,
        PRIVATE = 1,
        REPLACE_DESTINATION = 2,
    }


    export namespace FileMeasureFlags {
        export const $gtype: GObject.GType<FileMeasureFlags>;
    }

    enum FileMeasureFlags {
        NONE = 0,
        REPORT_ANY_ERROR = 2,
        APPARENT_SIZE = 4,
        NO_XDEV = 8,
    }


    export namespace FileMonitorFlags {
        export const $gtype: GObject.GType<FileMonitorFlags>;
    }

    enum FileMonitorFlags {
        NONE = 0,
        WATCH_MOUNTS = 1,
        SEND_MOVED = 2,
        WATCH_HARD_LINKS = 4,
        WATCH_MOVES = 8,
    }


    export namespace FileQueryInfoFlags {
        export const $gtype: GObject.GType<FileQueryInfoFlags>;
    }

    enum FileQueryInfoFlags {
        NONE = 0,
        NOFOLLOW_SYMLINKS = 1,
    }


    export namespace IOModuleScopeFlags {
        export const $gtype: GObject.GType<IOModuleScopeFlags>;
    }

    enum IOModuleScopeFlags {
        NONE = 0,
        BLOCK_DUPLICATES = 1,
    }


    export namespace IOStreamSpliceFlags {
        export const $gtype: GObject.GType<IOStreamSpliceFlags>;
    }

    enum IOStreamSpliceFlags {
        NONE = 0,
        CLOSE_STREAM1 = 1,
        CLOSE_STREAM2 = 2,
        WAIT_FOR_BOTH = 4,
    }


    export namespace MountMountFlags {
        export const $gtype: GObject.GType<MountMountFlags>;
    }

    enum MountMountFlags {
        NONE = 0,
    }


    export namespace MountUnmountFlags {
        export const $gtype: GObject.GType<MountUnmountFlags>;
    }

    enum MountUnmountFlags {
        NONE = 0,
        FORCE = 1,
    }


    export namespace OutputStreamSpliceFlags {
        export const $gtype: GObject.GType<OutputStreamSpliceFlags>;
    }

    enum OutputStreamSpliceFlags {
        NONE = 0,
        CLOSE_SOURCE = 1,
        CLOSE_TARGET = 2,
    }


    export namespace ResolverNameLookupFlags {
        export const $gtype: GObject.GType<ResolverNameLookupFlags>;
    }

    enum ResolverNameLookupFlags {
        DEFAULT = 0,
        IPV4_ONLY = 1,
        IPV6_ONLY = 2,
    }


    export namespace ResourceFlags {
        export const $gtype: GObject.GType<ResourceFlags>;
    }

    enum ResourceFlags {
        NONE = 0,
        COMPRESSED = 1,
    }


    export namespace ResourceLookupFlags {
        export const $gtype: GObject.GType<ResourceLookupFlags>;
    }

    enum ResourceLookupFlags {
        NONE = 0,
    }


    export namespace SettingsBindFlags {
        export const $gtype: GObject.GType<SettingsBindFlags>;
    }

    enum SettingsBindFlags {
        DEFAULT = 0,
        GET = 1,
        SET = 2,
        NO_SENSITIVITY = 4,
        GET_NO_CHANGES = 8,
        INVERT_BOOLEAN = 16,
    }


    export namespace SocketMsgFlags {
        export const $gtype: GObject.GType<SocketMsgFlags>;
    }

    enum SocketMsgFlags {
        NONE = 0,
        OOB = 1,
        PEEK = 2,
        DONTROUTE = 4,
    }


    export namespace SubprocessFlags {
        export const $gtype: GObject.GType<SubprocessFlags>;
    }

    enum SubprocessFlags {
        NONE = 0,
        STDIN_PIPE = 1,
        STDIN_INHERIT = 2,
        STDOUT_PIPE = 4,
        STDOUT_SILENCE = 8,
        STDERR_PIPE = 16,
        STDERR_SILENCE = 32,
        STDERR_MERGE = 64,
        INHERIT_FDS = 128,
        SEARCH_PATH_FROM_ENVP = 256,
    }


    export namespace TestDBusFlags {
        export const $gtype: GObject.GType<TestDBusFlags>;
    }

    enum TestDBusFlags {
        NONE = 0,
    }


    export namespace TlsCertificateFlags {
        export const $gtype: GObject.GType<TlsCertificateFlags>;
    }

    enum TlsCertificateFlags {
        NO_FLAGS = 0,
        UNKNOWN_CA = 1,
        BAD_IDENTITY = 2,
        NOT_ACTIVATED = 4,
        EXPIRED = 8,
        REVOKED = 16,
        INSECURE = 32,
        GENERIC_ERROR = 64,
        VALIDATE_ALL = 127,
    }


    export namespace TlsCertificateRequestFlags {
        export const $gtype: GObject.GType<TlsCertificateRequestFlags>;
    }

    enum TlsCertificateRequestFlags {
        NONE = 0,
    }


    export namespace TlsDatabaseLookupFlags {
        export const $gtype: GObject.GType<TlsDatabaseLookupFlags>;
    }

    enum TlsDatabaseLookupFlags {
        NONE = 0,
        KEYPAIR = 1,
    }


    export namespace TlsDatabaseVerifyFlags {
        export const $gtype: GObject.GType<TlsDatabaseVerifyFlags>;
    }

    enum TlsDatabaseVerifyFlags {
        NONE = 0,
    }


    export namespace TlsPasswordFlags {
        export const $gtype: GObject.GType<TlsPasswordFlags>;
    }

    enum TlsPasswordFlags {
        NONE = 0,
        RETRY = 2,
        MANY_TRIES = 4,
        FINAL_TRY = 8,
        PKCS11_USER = 16,
        PKCS11_SECURITY_OFFICER = 32,
        PKCS11_CONTEXT_SPECIFIC = 64,
    }


    namespace AppInfoMonitor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            changed: () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class AppInfoMonitor extends GObject.Object {
        static $gtype: GObject.GType<AppInfoMonitor>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AppInfoMonitor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AppInfoMonitor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof AppInfoMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AppInfoMonitor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AppInfoMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AppInfoMonitor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AppInfoMonitor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AppInfoMonitor.SignalSignatures[K]>): void;

        // Static methods
        static get(): AppInfoMonitor;
    }


    namespace AppLaunchContext {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "launch-failed": (startup_notify_id: string) => void;
            /** @signal */
            "launch-started": (info: AppInfo, platform_data: GLib.Variant | null) => void;
            /** @signal */
            launched: (info: AppInfo, platform_data: GLib.Variant) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class AppLaunchContext extends GObject.Object {
        static $gtype: GObject.GType<AppLaunchContext>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AppLaunchContext.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AppLaunchContext.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): AppLaunchContext;

        // Signals
        /** @signal */
        connect<K extends keyof AppLaunchContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AppLaunchContext.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AppLaunchContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AppLaunchContext.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AppLaunchContext.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AppLaunchContext.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_display(info: AppInfo, files: File[]): string | null;

        vfunc_get_startup_notify_id(info: AppInfo | null, files: File[] | null): string | null;

        vfunc_launch_failed(startup_notify_id: string): void;

        vfunc_launch_started(info: AppInfo, platform_data: GLib.Variant): void;

        vfunc_launched(info: AppInfo, platform_data: GLib.Variant): void;

        // Methods
        get_display(info: AppInfo, files: File[]): string | null;

        get_environment(): string[];

        get_startup_notify_id(info: AppInfo | null, files: File[] | null): string | null;

        launch_failed(startup_notify_id: string): void;

        setenv(variable: string, value: string): void;

        unsetenv(variable: string): void;
    }


    namespace Application {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, ActionGroup.SignalSignatures {
            /** @signal */
            activate: () => void;
            /** @signal */
            "command-line": (command_line: ApplicationCommandLine) => number;
            /** @signal */
            "handle-local-options": (options: GLib.VariantDict) => number;
            /** @signal */
            "name-lost": () => boolean | void;
            /** @signal */
            open: (files: File[], hint: string) => void;
            /** @signal */
            shutdown: () => void;
            /** @signal */
            startup: () => void;
            "notify::action-group": (pspec: GObject.ParamSpec) => void;
            "notify::application-id": (pspec: GObject.ParamSpec) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::inactivity-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::is-busy": (pspec: GObject.ParamSpec) => void;
            "notify::is-registered": (pspec: GObject.ParamSpec) => void;
            "notify::is-remote": (pspec: GObject.ParamSpec) => void;
            "notify::resource-base-path": (pspec: GObject.ParamSpec) => void;
            "notify::version": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, ActionGroup.ConstructorProps, ActionMap.ConstructorProps {
            action_group: ActionGroup;
            actionGroup: ActionGroup;
            application_id: string | null;
            applicationId: string | null;
            flags: ApplicationFlags;
            inactivity_timeout: number;
            inactivityTimeout: number;
            is_busy: boolean;
            isBusy: boolean;
            is_registered: boolean;
            isRegistered: boolean;
            is_remote: boolean;
            isRemote: boolean;
            resource_base_path: string | null;
            resourceBasePath: string | null;
            version: string | null;
        }
    }

    class Application extends GObject.Object implements ActionGroup, ActionMap {
        static $gtype: GObject.GType<Application>;

        // Properties
        set action_group(val: ActionGroup);

        set actionGroup(val: ActionGroup);

        get application_id(): string | null;
        set application_id(val: string | null);

        get applicationId(): string | null;
        set applicationId(val: string | null);

        get flags(): ApplicationFlags;
        set flags(val: ApplicationFlags);

        get inactivity_timeout(): number;
        set inactivity_timeout(val: number);

        get inactivityTimeout(): number;
        set inactivityTimeout(val: number);

        get is_busy(): boolean;

        get isBusy(): boolean;

        get is_registered(): boolean;

        get isRegistered(): boolean;

        get is_remote(): boolean;

        get isRemote(): boolean;

        get resource_base_path(): string | null;
        set resource_base_path(val: string | null);

        get resourceBasePath(): string | null;
        set resourceBasePath(val: string | null);

        get version(): string | null;
        set version(val: string | null);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Application.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Application.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](application_id: string | null, flags: ApplicationFlags): Application;

        // Signals
        /** @signal */
        connect<K extends keyof Application.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Application.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Application.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Application.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Application.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Application.SignalSignatures[K]>): void;

        // Static methods
        static get_default(): Application | null;

        static id_is_valid(application_id: string): boolean;

        // Virtual methods
        vfunc_activate(): void;

        vfunc_add_platform_data(builder: GLib.VariantBuilder): void;

        vfunc_after_emit(platform_data: GLib.Variant): void;

        vfunc_before_emit(platform_data: GLib.Variant): void;

        vfunc_command_line(command_line: ApplicationCommandLine): number;

        vfunc_dbus_register(connection: DBusConnection, object_path: string): boolean;

        vfunc_dbus_unregister(connection: DBusConnection, object_path: string): void;

        vfunc_handle_local_options(options: GLib.VariantDict): number;

        vfunc_local_command_line(_arguments: string[]): [boolean, string[], number];

        vfunc_name_lost(): boolean;

        vfunc_open(files: File[], hint: string): void;

        vfunc_quit_mainloop(): void;

        vfunc_run_mainloop(): void;

        vfunc_shutdown(): void;

        vfunc_startup(): void;

        // Methods
        activate(): void;

        add_main_option(long_name: string, short_name: number, flags: GLib.OptionFlags, arg: GLib.OptionArg, description: string, arg_description: string | null): void;

        add_main_option_entries(entries: GLib.OptionEntry[]): void;

        add_option_group(group: GLib.OptionGroup): void;

        bind_busy_property(object: GObject.Object, property: string): void;

        get_application_id(): string | null;

        get_dbus_connection(): DBusConnection | null;

        get_dbus_object_path(): string | null;

        get_flags(): ApplicationFlags;

        get_inactivity_timeout(): number;

        get_is_busy(): boolean;

        get_is_registered(): boolean;

        get_is_remote(): boolean;

        get_resource_base_path(): string | null;

        get_version(): string | null;

        hold(): void;

        mark_busy(): void;

        open(files: File[], hint: string): void;

        quit(): void;

        register(cancellable: Cancellable | null): boolean;

        release(): void;

        run(argv: string[] | null): number;

        send_notification(id: string | null, notification: Notification): void;

        set_action_group(action_group: ActionGroup | null): void;

        set_application_id(application_id: string | null): void;

        set_default(): void;

        set_flags(flags: ApplicationFlags): void;

        set_inactivity_timeout(inactivity_timeout: number): void;

        set_option_context_description(description: string | null): void;

        set_option_context_parameter_string(parameter_string: string | null): void;

        set_option_context_summary(summary: string | null): void;

        set_resource_base_path(resource_path: string | null): void;

        set_version(version: string): void;

        unbind_busy_property(object: GObject.Object, property: string): void;

        unmark_busy(): void;

        withdraw_notification(id: string): void;

        runAsync(argv?: string[]): Promise<number>;

        action_added(action_name: string): void;

        action_enabled_changed(action_name: string, enabled: boolean): void;

        action_removed(action_name: string): void;

        action_state_changed(action_name: string, state: GLib.Variant): void;

        activate_action(action_name: string, parameter: GLib.Variant | null): void;

        change_action_state(action_name: string, value: GLib.Variant): void;

        get_action_enabled(action_name: string): boolean;

        get_action_parameter_type(action_name: string): GLib.VariantType | null;

        get_action_state(action_name: string): GLib.Variant | null;

        get_action_state_hint(action_name: string): GLib.Variant | null;

        get_action_state_type(action_name: string): GLib.VariantType | null;

        has_action(action_name: string): boolean;

        list_actions(): string[];

        query_action(action_name: string): [boolean, boolean, GLib.VariantType | null, GLib.VariantType | null, GLib.Variant | null, GLib.Variant | null];

        vfunc_action_added(action_name: string): void;

        vfunc_action_enabled_changed(action_name: string, enabled: boolean): void;

        vfunc_action_removed(action_name: string): void;

        vfunc_action_state_changed(action_name: string, state: GLib.Variant): void;

        vfunc_activate_action(action_name: string, parameter: GLib.Variant | null): void;

        vfunc_change_action_state(action_name: string, value: GLib.Variant): void;

        vfunc_get_action_enabled(action_name: string): boolean;

        vfunc_get_action_parameter_type(action_name: string): GLib.VariantType | null;

        vfunc_get_action_state(action_name: string): GLib.Variant | null;

        vfunc_get_action_state_hint(action_name: string): GLib.Variant | null;

        vfunc_get_action_state_type(action_name: string): GLib.VariantType | null;

        vfunc_has_action(action_name: string): boolean;

        vfunc_list_actions(): string[];

        vfunc_query_action(action_name: string): [boolean, boolean, GLib.VariantType | null, GLib.VariantType | null, GLib.Variant | null, GLib.Variant | null];

        add_action(action: Action): void;

        add_action_entries(entries: ActionEntryObj[]): void;

        lookup_action(action_name: string): Action | null;

        remove_action(action_name: string): void;

        remove_action_entries(entries: ActionEntry[]): void;

        vfunc_add_action(action: Action): void;

        vfunc_lookup_action(action_name: string): Action | null;

        vfunc_remove_action(action_name: string): void;
    }


    namespace ApplicationCommandLine {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::arguments": (pspec: GObject.ParamSpec) => void;
            "notify::is-remote": (pspec: GObject.ParamSpec) => void;
            "notify::options": (pspec: GObject.ParamSpec) => void;
            "notify::platform-data": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            "arguments": GLib.Variant;
            is_remote: boolean;
            isRemote: boolean;
            options: GLib.Variant;
            platform_data: GLib.Variant | null;
            platformData: GLib.Variant;
        }
    }

    class ApplicationCommandLine extends GObject.Object {
        static $gtype: GObject.GType<ApplicationCommandLine>;

        // Properties
        set "arguments"(val: GLib.Variant);

        get is_remote(): boolean;

        get isRemote(): boolean;

        set options(val: GLib.Variant);

        set platform_data(val: GLib.Variant | null);

        set platformData(val: GLib.Variant);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ApplicationCommandLine.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ApplicationCommandLine.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ApplicationCommandLine.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ApplicationCommandLine.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ApplicationCommandLine.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ApplicationCommandLine.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ApplicationCommandLine.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ApplicationCommandLine.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_done(): void;

        vfunc_get_stdin(): InputStream | null;

        vfunc_print_literal(message: string): void;

        vfunc_printerr_literal(message: string): void;

        // Methods
        create_file_for_arg(arg: string): File;

        done(): void;

        get_arguments(): string[];

        get_cwd(): string | null;

        get_environ(): string[] | null;

        get_exit_status(): number;

        get_is_remote(): boolean;

        get_options_dict(): GLib.VariantDict;

        get_platform_data(): GLib.Variant | null;

        get_stdin(): InputStream | null;

        getenv(name: string): string | null;

        print_literal(message: string): void;

        printerr_literal(message: string): void;

        set_exit_status(exit_status: number): void;
    }


    namespace BufferedInputStream {
        // Signal signatures
        interface SignalSignatures extends FilterInputStream.SignalSignatures {
            "notify::buffer-size": (pspec: GObject.ParamSpec) => void;
            "notify::base-stream": (pspec: GObject.ParamSpec) => void;
            "notify::close-base-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends FilterInputStream.ConstructorProps, Seekable.ConstructorProps {
            buffer_size: number;
            bufferSize: number;
        }
    }

    class BufferedInputStream extends FilterInputStream implements Seekable {
        static $gtype: GObject.GType<BufferedInputStream>;

        // Properties
        get buffer_size(): number;
        set buffer_size(val: number);

        get bufferSize(): number;
        set bufferSize(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: BufferedInputStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<BufferedInputStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](base_stream: InputStream): BufferedInputStream;

        static new_sized(base_stream: InputStream, size: bigint | number): BufferedInputStream;

        // Signals
        /** @signal */
        connect<K extends keyof BufferedInputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BufferedInputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BufferedInputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BufferedInputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BufferedInputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BufferedInputStream.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_fill(count: number, cancellable: Cancellable | null): bigint | number;

        vfunc_fill_async(count: number, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_fill_finish(result: AsyncResult): bigint | number;

        // Methods
        fill(count: bigint | number, cancellable: Cancellable | null): number;

        fill_async(count: bigint | number, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<number>;

        fill_async(count: bigint | number, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        fill_async(count: bigint | number, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<number> | void;

        fill_finish(result: AsyncResult): number;

        get_available(): number;

        get_buffer_size(): number;

        peek(buffer: Uint8Array | string, offset: bigint | number): number;

        peek_buffer(): Uint8Array;

        read_byte(cancellable: Cancellable | null): number;

        set_buffer_size(size: bigint | number): void;

        can_seek(): boolean;

        can_truncate(): boolean;

        seek(offset: bigint | number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        tell(): number;

        truncate(offset: bigint | number, cancellable: Cancellable | null): boolean;

        vfunc_can_seek(): boolean;

        vfunc_can_truncate(): boolean;

        vfunc_seek(offset: number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        vfunc_tell(): bigint | number;

        vfunc_truncate_fn(offset: number, cancellable: Cancellable | null): boolean;
    }


    namespace BufferedOutputStream {
        // Signal signatures
        interface SignalSignatures extends FilterOutputStream.SignalSignatures {
            "notify::auto-grow": (pspec: GObject.ParamSpec) => void;
            "notify::buffer-size": (pspec: GObject.ParamSpec) => void;
            "notify::base-stream": (pspec: GObject.ParamSpec) => void;
            "notify::close-base-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends FilterOutputStream.ConstructorProps, Seekable.ConstructorProps {
            auto_grow: boolean;
            autoGrow: boolean;
            buffer_size: number;
            bufferSize: number;
        }
    }

    class BufferedOutputStream extends FilterOutputStream implements Seekable {
        static $gtype: GObject.GType<BufferedOutputStream>;

        // Properties
        get auto_grow(): boolean;
        set auto_grow(val: boolean);

        get autoGrow(): boolean;
        set autoGrow(val: boolean);

        get buffer_size(): number;
        set buffer_size(val: number);

        get bufferSize(): number;
        set bufferSize(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: BufferedOutputStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<BufferedOutputStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](base_stream: OutputStream): BufferedOutputStream;

        static new_sized(base_stream: OutputStream, size: bigint | number): BufferedOutputStream;

        // Signals
        /** @signal */
        connect<K extends keyof BufferedOutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BufferedOutputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BufferedOutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BufferedOutputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BufferedOutputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BufferedOutputStream.SignalSignatures[K]>): void;

        // Methods
        get_auto_grow(): boolean;

        get_buffer_size(): number;

        set_auto_grow(auto_grow: boolean): void;

        set_buffer_size(size: bigint | number): void;

        can_seek(): boolean;

        can_truncate(): boolean;

        seek(offset: bigint | number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        tell(): number;

        truncate(offset: bigint | number, cancellable: Cancellable | null): boolean;

        vfunc_can_seek(): boolean;

        vfunc_can_truncate(): boolean;

        vfunc_seek(offset: number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        vfunc_tell(): bigint | number;

        vfunc_truncate_fn(offset: number, cancellable: Cancellable | null): boolean;
    }


    namespace BytesIcon {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::bytes": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Icon.ConstructorProps, LoadableIcon.ConstructorProps {
            bytes: GLib.Bytes | Uint8Array;
        }
    }

    class BytesIcon extends GObject.Object implements Icon, LoadableIcon {
        static $gtype: GObject.GType<BytesIcon>;

        // Properties
        get bytes(): GLib.Bytes;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: BytesIcon.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<BytesIcon.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](bytes: GLib.Bytes | Uint8Array): BytesIcon;

        // Signals
        /** @signal */
        connect<K extends keyof BytesIcon.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BytesIcon.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BytesIcon.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BytesIcon.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BytesIcon.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BytesIcon.SignalSignatures[K]>): void;

        // Methods
        get_bytes(): GLib.Bytes;

        equal(icon2: Icon | null): boolean;

        hash(): number;

        serialize(): GLib.Variant | null;

        to_string(): string | null;

        vfunc_equal(icon2: Icon | null): boolean;

        vfunc_hash(): number;

        vfunc_serialize(): GLib.Variant | null;

        vfunc_to_tokens(): [boolean, string[], number];

        load(size: number, cancellable: Cancellable | null): [InputStream, string];

        load_async(size: number, cancellable: Cancellable | null): globalThis.Promise<[InputStream, string]>;

        load_async(size: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        load_async(size: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<[InputStream, string]> | void;

        load_finish(res: AsyncResult): [InputStream, string];

        vfunc_load(size: number, cancellable: Cancellable | null): [InputStream, string];

        vfunc_load_async(size: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_load_finish(res: AsyncResult): [InputStream, string];
    }


    namespace Cancellable {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            cancelled: () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Cancellable extends GObject.Object {
        static $gtype: GObject.GType<Cancellable>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Cancellable.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Cancellable.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Cancellable;

        // Signals
        /** @signal */
        connect<K extends keyof Cancellable.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Cancellable.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Cancellable.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Cancellable.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Cancellable.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Cancellable.SignalSignatures[K]>): void;

        // Static methods
        static get_current(): Cancellable | null;

        // Virtual methods
        vfunc_cancelled(): void;

        // Methods
        cancel(): void;

        connect(callback: GObject.Callback): number;

        connect(...args: never[]): any;

        disconnect(handler_id: bigint | number): void;

    // Conflicted with GObject.Object.disconnect
        disconnect(...args: never[]): any;

        get_fd(): number;

        is_cancelled(): boolean;

        make_pollfd(pollfd: GLib.PollFD): boolean;

        pop_current(): void;

        push_current(): void;

        release_fd(): void;

        reset(): void;

        set_error_if_cancelled(): boolean;

        source_new(): GLib.Source;
    }


    namespace CharsetConverter {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::from-charset": (pspec: GObject.ParamSpec) => void;
            "notify::to-charset": (pspec: GObject.ParamSpec) => void;
            "notify::use-fallback": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Converter.ConstructorProps, Initable.ConstructorProps {
            from_charset: string;
            fromCharset: string;
            to_charset: string;
            toCharset: string;
            use_fallback: boolean;
            useFallback: boolean;
        }
    }

    class CharsetConverter extends GObject.Object implements Converter, Initable {
        static $gtype: GObject.GType<CharsetConverter>;

        // Properties
        get from_charset(): string;

        get fromCharset(): string;

        get to_charset(): string;

        get toCharset(): string;

        get use_fallback(): boolean;
        set use_fallback(val: boolean);

        get useFallback(): boolean;
        set useFallback(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: CharsetConverter.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<CharsetConverter.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](to_charset: string, from_charset: string): CharsetConverter;

        // Signals
        /** @signal */
        connect<K extends keyof CharsetConverter.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CharsetConverter.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof CharsetConverter.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CharsetConverter.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof CharsetConverter.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<CharsetConverter.SignalSignatures[K]>): void;

        // Methods
        get_num_fallbacks(): number;

        get_use_fallback(): boolean;

        set_use_fallback(use_fallback: boolean): void;

        convert(inbuf: Uint8Array | string, outbuf: Uint8Array | string, flags: ConverterFlags): [ConverterResult, number, number];

        convert_bytes(bytes: GLib.Bytes | Uint8Array): GLib.Bytes;

        reset(): void;

        vfunc_convert(inbuf: Uint8Array | null, outbuf: Uint8Array, flags: ConverterFlags): [ConverterResult, bigint | number, bigint | number];

        vfunc_reset(): void;

        init(cancellable: Cancellable | null): boolean;

        vfunc_init(cancellable: Cancellable | null): boolean;
    }


    namespace ConverterInputStream {
        // Signal signatures
        interface SignalSignatures extends FilterInputStream.SignalSignatures {
            "notify::converter": (pspec: GObject.ParamSpec) => void;
            "notify::base-stream": (pspec: GObject.ParamSpec) => void;
            "notify::close-base-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends FilterInputStream.ConstructorProps, PollableInputStream.ConstructorProps {
            converter: Converter;
        }
    }

    class ConverterInputStream extends FilterInputStream implements PollableInputStream {
        static $gtype: GObject.GType<ConverterInputStream>;

        // Properties
        get converter(): Converter;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ConverterInputStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ConverterInputStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](base_stream: InputStream, converter: Converter): ConverterInputStream;

        // Signals
        /** @signal */
        connect<K extends keyof ConverterInputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ConverterInputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ConverterInputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ConverterInputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ConverterInputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ConverterInputStream.SignalSignatures[K]>): void;

        // Methods
        get_converter(): Converter;

        can_poll(): boolean;

        create_source(cancellable: Cancellable | null): GLib.Source;

        is_readable(): boolean;

        read_nonblocking(cancellable: Cancellable | null): [number, Uint8Array];

        vfunc_can_poll(): boolean;

        vfunc_create_source(cancellable: Cancellable | null): GLib.Source;

        vfunc_is_readable(): boolean;

        vfunc_read_nonblocking(): [bigint | number, Uint8Array | string | null];
    }


    namespace ConverterOutputStream {
        // Signal signatures
        interface SignalSignatures extends FilterOutputStream.SignalSignatures {
            "notify::converter": (pspec: GObject.ParamSpec) => void;
            "notify::base-stream": (pspec: GObject.ParamSpec) => void;
            "notify::close-base-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends FilterOutputStream.ConstructorProps, PollableOutputStream.ConstructorProps {
            converter: Converter;
        }
    }

    class ConverterOutputStream extends FilterOutputStream implements PollableOutputStream {
        static $gtype: GObject.GType<ConverterOutputStream>;

        // Properties
        get converter(): Converter;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ConverterOutputStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ConverterOutputStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](base_stream: OutputStream, converter: Converter): ConverterOutputStream;

        // Signals
        /** @signal */
        connect<K extends keyof ConverterOutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ConverterOutputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ConverterOutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ConverterOutputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ConverterOutputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ConverterOutputStream.SignalSignatures[K]>): void;

        // Methods
        get_converter(): Converter;

        can_poll(): boolean;

        create_source(cancellable: Cancellable | null): GLib.Source;

        is_writable(): boolean;

        write_nonblocking(buffer: Uint8Array | string, cancellable: Cancellable | null): number;

        writev_nonblocking(vectors: OutputVector[], cancellable: Cancellable | null): [PollableReturn, number];

        vfunc_can_poll(): boolean;

        vfunc_create_source(cancellable: Cancellable | null): GLib.Source;

        vfunc_is_writable(): boolean;

        vfunc_write_nonblocking(buffer: Uint8Array | null): bigint | number;

        vfunc_writev_nonblocking(vectors: OutputVector[]): [PollableReturn, bigint | number];
    }


    namespace Credentials {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Credentials extends GObject.Object {
        static $gtype: GObject.GType<Credentials>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Credentials.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Credentials.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Credentials;

        // Signals
        /** @signal */
        connect<K extends keyof Credentials.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Credentials.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Credentials.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Credentials.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Credentials.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Credentials.SignalSignatures[K]>): void;

        // Methods
        get_unix_pid(): never;

        get_unix_user(): never;

        is_same_user(other_credentials: Credentials): boolean;

        set_native(native_type: CredentialsType, _native: never): void;

        set_unix_user(uid: never): boolean;

        to_string(): string;
    }


    namespace DBusActionGroup {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, ActionGroup.SignalSignatures, RemoteActionGroup.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, ActionGroup.ConstructorProps, RemoteActionGroup.ConstructorProps {}
    }

    class DBusActionGroup extends GObject.Object implements ActionGroup, RemoteActionGroup {
        static $gtype: GObject.GType<DBusActionGroup>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DBusActionGroup.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DBusActionGroup.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DBusActionGroup.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusActionGroup.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DBusActionGroup.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusActionGroup.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DBusActionGroup.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DBusActionGroup.SignalSignatures[K]>): void;

        // Static methods
        static get(connection: DBusConnection, bus_name: string | null, object_path: string): DBusActionGroup;

        action_added(action_name: string): void;

        action_enabled_changed(action_name: string, enabled: boolean): void;

        action_removed(action_name: string): void;

        action_state_changed(action_name: string, state: GLib.Variant): void;

        activate_action(action_name: string, parameter: GLib.Variant | null): void;

        change_action_state(action_name: string, value: GLib.Variant): void;

        get_action_enabled(action_name: string): boolean;

        get_action_parameter_type(action_name: string): GLib.VariantType | null;

        get_action_state(action_name: string): GLib.Variant | null;

        get_action_state_hint(action_name: string): GLib.Variant | null;

        get_action_state_type(action_name: string): GLib.VariantType | null;

        has_action(action_name: string): boolean;

        list_actions(): string[];

        query_action(action_name: string): [boolean, boolean, GLib.VariantType | null, GLib.VariantType | null, GLib.Variant | null, GLib.Variant | null];

        vfunc_action_added(action_name: string): void;

        vfunc_action_enabled_changed(action_name: string, enabled: boolean): void;

        vfunc_action_removed(action_name: string): void;

        vfunc_action_state_changed(action_name: string, state: GLib.Variant): void;

        vfunc_activate_action(action_name: string, parameter: GLib.Variant | null): void;

        vfunc_change_action_state(action_name: string, value: GLib.Variant): void;

        vfunc_get_action_enabled(action_name: string): boolean;

        vfunc_get_action_parameter_type(action_name: string): GLib.VariantType | null;

        vfunc_get_action_state(action_name: string): GLib.Variant | null;

        vfunc_get_action_state_hint(action_name: string): GLib.Variant | null;

        vfunc_get_action_state_type(action_name: string): GLib.VariantType | null;

        vfunc_has_action(action_name: string): boolean;

        vfunc_list_actions(): string[];

        vfunc_query_action(action_name: string): [boolean, boolean, GLib.VariantType | null, GLib.VariantType | null, GLib.Variant | null, GLib.Variant | null];

        activate_action_full(action_name: string, parameter: GLib.Variant | null, platform_data: GLib.Variant): void;

        change_action_state_full(action_name: string, value: GLib.Variant, platform_data: GLib.Variant): void;

        vfunc_activate_action_full(action_name: string, parameter: GLib.Variant | null, platform_data: GLib.Variant): void;

        vfunc_change_action_state_full(action_name: string, value: GLib.Variant, platform_data: GLib.Variant): void;
    }


    namespace DBusAuthObserver {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "allow-mechanism": (mechanism: string) => boolean | void;
            /** @signal */
            "authorize-authenticated-peer": (stream: IOStream, credentials: Credentials | null) => boolean | void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class DBusAuthObserver extends GObject.Object {
        static $gtype: GObject.GType<DBusAuthObserver>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DBusAuthObserver.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DBusAuthObserver.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): DBusAuthObserver;

        // Signals
        /** @signal */
        connect<K extends keyof DBusAuthObserver.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusAuthObserver.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DBusAuthObserver.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusAuthObserver.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DBusAuthObserver.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DBusAuthObserver.SignalSignatures[K]>): void;

        // Methods
        allow_mechanism(mechanism: string): boolean;

        authorize_authenticated_peer(stream: IOStream, credentials: Credentials | null): boolean;
    }


    namespace DBusConnection {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            closed: (remote_peer_vanished: boolean, error: GLib.Error | null) => void;
            "notify::address": (pspec: GObject.ParamSpec) => void;
            "notify::authentication-observer": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::closed": (pspec: GObject.ParamSpec) => void;
            "notify::exit-on-close": (pspec: GObject.ParamSpec) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::guid": (pspec: GObject.ParamSpec) => void;
            "notify::stream": (pspec: GObject.ParamSpec) => void;
            "notify::unique-name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, AsyncInitable.ConstructorProps, Initable.ConstructorProps {
            address: string;
            authentication_observer: DBusAuthObserver;
            authenticationObserver: DBusAuthObserver;
            capabilities: DBusCapabilityFlags;
            closed: boolean;
            exit_on_close: boolean;
            exitOnClose: boolean;
            flags: DBusConnectionFlags;
            guid: string;
            stream: IOStream;
            unique_name: string | null;
            uniqueName: string | null;
        }
    }

    class DBusConnection extends GObject.Object implements AsyncInitable<DBusConnection>, Initable {
        static $gtype: GObject.GType<DBusConnection>;

        // Properties
        set address(val: string);

        set authentication_observer(val: DBusAuthObserver);

        set authenticationObserver(val: DBusAuthObserver);

        get capabilities(): DBusCapabilityFlags;

        get closed(): boolean;

        get exit_on_close(): boolean;
        set exit_on_close(val: boolean);

        get exitOnClose(): boolean;
        set exitOnClose(val: boolean);

        get flags(): DBusConnectionFlags;

        get guid(): string;

        get stream(): IOStream;

        get unique_name(): string | null;

        get uniqueName(): string | null;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DBusConnection.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DBusConnection.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_finish(res: AsyncResult): DBusConnection;

        // Conflicted with Gio.AsyncInitable.new_finish
        static new_finish(...args: never[]): any;

        static new_for_address_finish(res: AsyncResult): DBusConnection;

        static new_for_address_sync(address: string, flags: DBusConnectionFlags, observer: DBusAuthObserver | null, cancellable: Cancellable | null): DBusConnection;

        static new_sync(stream: IOStream, guid: string | null, flags: DBusConnectionFlags, observer: DBusAuthObserver | null, cancellable: Cancellable | null): DBusConnection;

        // Signals
        /** @signal */
        connect<K extends keyof DBusConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusConnection.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DBusConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusConnection.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DBusConnection.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DBusConnection.SignalSignatures[K]>): void;

        // Static methods
        static ["new"](stream: IOStream, guid: string | null, flags: DBusConnectionFlags, observer: DBusAuthObserver | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<DBusConnection> | null): void;

        static new_for_address(address: string, flags: DBusConnectionFlags, observer: DBusAuthObserver | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<DBusConnection> | null): void;

        // Methods
        add_filter(filter_function: DBusMessageFilterFunction): number;

        call<T extends string = any>(bus_name: string | null, object_path: string, interface_name: string, method_name: string, parameters: GLib.Variant | null, reply_type: GLib.VariantType<T> | null, flags: DBusCallFlags, timeout_msec: number, cancellable: Cancellable | null): globalThis.Promise<GLib.Variant<T>>;

        call<T extends string = any>(bus_name: string | null, object_path: string, interface_name: string, method_name: string, parameters: GLib.Variant | null, reply_type: GLib.VariantType<T> | null, flags: DBusCallFlags, timeout_msec: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        call<T extends string = any>(bus_name: string | null, object_path: string, interface_name: string, method_name: string, parameters: GLib.Variant | null, reply_type: GLib.VariantType<T> | null, flags: DBusCallFlags, timeout_msec: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<GLib.Variant<T>> | void;

        call_finish<T extends string = any>(res: AsyncResult): GLib.Variant<T>;

        call_sync(bus_name: string | null, object_path: string, interface_name: string, method_name: string, parameters: GLib.Variant | null, reply_type: GLib.VariantType | null, flags: DBusCallFlags, timeout_msec: number, cancellable: Cancellable | null): GLib.Variant;

        call_with_unix_fd_list(bus_name: string | null, object_path: string, interface_name: string, method_name: string, parameters: GLib.Variant | null, reply_type: GLib.VariantType | null, flags: DBusCallFlags, timeout_msec: number, fd_list: UnixFDList | null, cancellable: Cancellable | null): globalThis.Promise<[GLib.Variant, UnixFDList | null]>;

        call_with_unix_fd_list(bus_name: string | null, object_path: string, interface_name: string, method_name: string, parameters: GLib.Variant | null, reply_type: GLib.VariantType | null, flags: DBusCallFlags, timeout_msec: number, fd_list: UnixFDList | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        call_with_unix_fd_list(bus_name: string | null, object_path: string, interface_name: string, method_name: string, parameters: GLib.Variant | null, reply_type: GLib.VariantType | null, flags: DBusCallFlags, timeout_msec: number, fd_list: UnixFDList | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<[GLib.Variant, UnixFDList | null]> | void;

        call_with_unix_fd_list_finish(res: AsyncResult): [GLib.Variant, UnixFDList | null];

        call_with_unix_fd_list_sync(bus_name: string | null, object_path: string, interface_name: string, method_name: string, parameters: GLib.Variant | null, reply_type: GLib.VariantType | null, flags: DBusCallFlags, timeout_msec: number, fd_list: UnixFDList | null, cancellable: Cancellable | null): [GLib.Variant, UnixFDList | null];

        close(cancellable: Cancellable | null): globalThis.Promise<boolean>;

        close(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        close(cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        close_finish(res: AsyncResult): boolean;

        close_sync(cancellable: Cancellable | null): boolean;

        emit_signal(destination_bus_name: string | null, object_path: string, interface_name: string, signal_name: string, parameters: GLib.Variant | null): boolean;

        export_action_group(object_path: string, action_group: ActionGroup): number;

        export_menu_model(object_path: string, menu: MenuModel): number;

        flush(cancellable: Cancellable | null): globalThis.Promise<boolean>;

        flush(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        flush(cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        flush_finish(res: AsyncResult): boolean;

        flush_sync(cancellable: Cancellable | null): boolean;

        get_capabilities(): DBusCapabilityFlags;

        get_exit_on_close(): boolean;

        get_flags(): DBusConnectionFlags;

        get_guid(): string;

        get_last_serial(): number;

        get_peer_credentials(): Credentials | null;

        get_stream(): IOStream;

        get_unique_name(): string | null;

        is_closed(): boolean;

        register_object(object_path: string, interface_info: DBusInterfaceInfo, method_call_closure: GObject.Closure | null, get_property_closure: GObject.Closure | null, set_property_closure: GObject.Closure | null): number;

        register_object_with_closures2(object_path: string, interface_info: DBusInterfaceInfo, method_call_closure: GObject.Closure | null, get_property_closure: GObject.Closure | null, set_property_closure: GObject.Closure | null): number;

        register_subtree(object_path: string, vtable: DBusSubtreeVTable, flags: DBusSubtreeFlags, user_data: null): number;

        remove_filter(filter_id: number): void;

        send_message(message: DBusMessage, flags: DBusSendMessageFlags): [boolean, number];

        send_message_with_reply(message: DBusMessage, flags: DBusSendMessageFlags, timeout_msec: number, cancellable: Cancellable | null): [globalThis.Promise<DBusMessage>, number];

        send_message_with_reply(message: DBusMessage, flags: DBusSendMessageFlags, timeout_msec: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): number;

        send_message_with_reply(message: DBusMessage, flags: DBusSendMessageFlags, timeout_msec: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): [globalThis.Promise<DBusMessage> | void, number];

        send_message_with_reply_finish(res: AsyncResult): DBusMessage;

        send_message_with_reply_sync(message: DBusMessage, flags: DBusSendMessageFlags, timeout_msec: number, cancellable: Cancellable | null): [DBusMessage, number];

        set_exit_on_close(exit_on_close: boolean): void;

        signal_subscribe(sender: string | null, interface_name: string | null, member: string | null, object_path: string | null, arg0: string | null, flags: DBusSignalFlags, callback: DBusSignalCallback): number;

        signal_unsubscribe(subscription_id: number): void;

        start_message_processing(): void;

        unexport_action_group(export_id: number): void;

        unexport_menu_model(export_id: number): void;

        unregister_object(registration_id: number): boolean;

        unregister_subtree(registration_id: number): boolean;

        watch_name(name: string, flags: BusNameWatcherFlags, name_appeared_closure: GObject.Closure | null, name_vanished_closure: GObject.Closure | null): number;

        unwatch_name(watcher_id: number): void;

        own_name(name: string, flags: BusNameOwnerFlags, name_acquired_closure: GObject.Closure | null, name_lost_closure: GObject.Closure | null): number;

        unown_name(owner_id: number): void;

        init_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: AsyncResult): boolean;

        new_finish(res: AsyncResult): DBusConnection;

        vfunc_init_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: AsyncResult): boolean;

        init(cancellable: Cancellable | null): boolean;

        vfunc_init(cancellable: Cancellable | null): boolean;
    }


    namespace DBusInterfaceSkeleton {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "g-authorize-method": (invocation: DBusMethodInvocation) => boolean | void;
            "notify::g-flags": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, DBusInterface.ConstructorProps {
            g_flags: DBusInterfaceSkeletonFlags;
            gFlags: DBusInterfaceSkeletonFlags;
        }
    }

    abstract class DBusInterfaceSkeleton extends GObject.Object implements DBusInterface {
        static $gtype: GObject.GType<DBusInterfaceSkeleton>;

        // Properties
        get g_flags(): DBusInterfaceSkeletonFlags;
        set g_flags(val: DBusInterfaceSkeletonFlags);

        get gFlags(): DBusInterfaceSkeletonFlags;
        set gFlags(val: DBusInterfaceSkeletonFlags);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DBusInterfaceSkeleton.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DBusInterfaceSkeleton.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DBusInterfaceSkeleton.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusInterfaceSkeleton.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DBusInterfaceSkeleton.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusInterfaceSkeleton.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DBusInterfaceSkeleton.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DBusInterfaceSkeleton.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_flush(): void;

        vfunc_g_authorize_method(invocation: DBusMethodInvocation): boolean;

        vfunc_get_info(): DBusInterfaceInfo;

    // Conflicted with Gio.DBusInterface.vfunc_get_info
        vfunc_get_info(...args: never[]): any;

        vfunc_get_properties(): GLib.Variant;

        vfunc_get_vtable(): DBusInterfaceVTable;

        // Methods
        ["export"](connection: DBusConnection, object_path: string): boolean;

        flush(): void;

        get_connection(): DBusConnection | null;

        get_connections(): DBusConnection[];

        get_flags(): DBusInterfaceSkeletonFlags;

        get_info(): DBusInterfaceInfo;

    // Conflicted with Gio.DBusInterface.get_info
        get_info(...args: never[]): any;

        get_object_path(): string | null;

        get_properties(): GLib.Variant;

        get_vtable(): DBusInterfaceVTable;

        has_connection(connection: DBusConnection): boolean;

        set_flags(flags: DBusInterfaceSkeletonFlags): void;

        unexport(): void;

        unexport_from_connection(connection: DBusConnection): void;

        get_object(): DBusObject | null;

        set_object(object: DBusObject | null): void;

        vfunc_dup_object(): DBusObject | null;

        vfunc_set_object(object: DBusObject | null): void;
    }


    namespace DBusMenuModel {
        // Signal signatures
        interface SignalSignatures extends MenuModel.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends MenuModel.ConstructorProps {}
    }

    class DBusMenuModel extends MenuModel {
        static $gtype: GObject.GType<DBusMenuModel>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DBusMenuModel.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DBusMenuModel.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DBusMenuModel.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusMenuModel.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DBusMenuModel.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusMenuModel.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DBusMenuModel.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DBusMenuModel.SignalSignatures[K]>): void;

        // Static methods
        static get(connection: DBusConnection, bus_name: string | null, object_path: string): DBusMenuModel;
    }


    namespace DBusMessage {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::locked": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            locked: boolean;
        }
    }

    class DBusMessage extends GObject.Object {
        static $gtype: GObject.GType<DBusMessage>;

        // Properties
        get locked(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DBusMessage.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DBusMessage.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): DBusMessage;

        static new_from_blob(blob: Uint8Array | string, capabilities: DBusCapabilityFlags): DBusMessage;

        static new_method_call(name: string | null, path: string, interface_: string | null, method: string): DBusMessage;

        static new_signal(path: string, interface_: string, signal: string): DBusMessage;

        // Signals
        /** @signal */
        connect<K extends keyof DBusMessage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusMessage.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DBusMessage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusMessage.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DBusMessage.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DBusMessage.SignalSignatures[K]>): void;

        // Static methods
        static bytes_needed(blob: Uint8Array | string): number;

        // Methods
        copy(): DBusMessage;

        get_arg0(): string | null;

        get_arg0_path(): string | null;

        get_body(): GLib.Variant | null;

        get_byte_order(): DBusMessageByteOrder;

        get_destination(): string | null;

        get_error_name(): string | null;

        get_flags(): DBusMessageFlags;

        get_header(header_field: DBusMessageHeaderField): GLib.Variant | null;

        get_header_fields(): Uint8Array;

        get_interface(): string | null;

        get_locked(): boolean;

        get_member(): string | null;

        get_message_type(): DBusMessageType;

        get_num_unix_fds(): number;

        get_path(): string | null;

        get_reply_serial(): number;

        get_sender(): string | null;

        get_serial(): number;

        get_signature(): string;

        get_unix_fd_list(): UnixFDList | null;

        lock(): void;

        new_method_error_literal(error_name: string, error_message: string): DBusMessage;

        new_method_reply(): DBusMessage;

        print(indent: number): string;

        set_body(body: GLib.Variant): void;

        set_byte_order(byte_order: DBusMessageByteOrder): void;

        set_destination(value: string | null): void;

        set_error_name(value: string | null): void;

        set_flags(flags: DBusMessageFlags): void;

        set_header(header_field: DBusMessageHeaderField, value: GLib.Variant | null): void;

        set_interface(value: string | null): void;

        set_member(value: string | null): void;

        set_message_type(type: DBusMessageType): void;

        set_num_unix_fds(value: number): void;

        set_path(value: string | null): void;

        set_reply_serial(value: number): void;

        set_sender(value: string | null): void;

        set_serial(serial: number): void;

        set_signature(value: string | null): void;

        set_unix_fd_list(fd_list: UnixFDList | null): void;

        to_blob(capabilities: DBusCapabilityFlags): Uint8Array;

        to_gerror(): boolean;
    }


    namespace DBusMethodInvocation {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class DBusMethodInvocation extends GObject.Object {
        static $gtype: GObject.GType<DBusMethodInvocation>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DBusMethodInvocation.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DBusMethodInvocation.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DBusMethodInvocation.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusMethodInvocation.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DBusMethodInvocation.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusMethodInvocation.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DBusMethodInvocation.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DBusMethodInvocation.SignalSignatures[K]>): void;

        // Methods
        get_connection(): DBusConnection;

        get_interface_name(): string | null;

        get_message(): DBusMessage;

        get_method_info(): DBusMethodInfo | null;

        get_method_name(): string;

        get_object_path(): string;

        get_parameters(): GLib.Variant;

        get_property_info(): DBusPropertyInfo | null;

        get_sender(): string | null;

        return_dbus_error(error_name: string, error_message: string): void;

        return_error_literal(domain: GLib.Quark, code: number, message: string): void;

        return_gerror(error: GLib.Error): void;

        return_value(parameters: GLib.Variant | null): void;

        return_value_with_unix_fd_list(parameters: GLib.Variant | null, fd_list: UnixFDList | null): void;
    }


    namespace DBusObjectManagerClient {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, DBusObjectManager.SignalSignatures {
            /** @signal */
            "interface-proxy-properties-changed": (object_proxy: DBusObjectProxy, interface_proxy: DBusProxy, changed_properties: GLib.Variant, invalidated_properties: string[]) => void;
            /** @signal */
            "interface-proxy-signal": (object_proxy: DBusObjectProxy, interface_proxy: DBusProxy, sender_name: string, signal_name: string, parameters: GLib.Variant) => void;
            "notify::bus-type": (pspec: GObject.ParamSpec) => void;
            "notify::connection": (pspec: GObject.ParamSpec) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::get-proxy-type-destroy-notify": (pspec: GObject.ParamSpec) => void;
            "notify::get-proxy-type-func": (pspec: GObject.ParamSpec) => void;
            "notify::get-proxy-type-user-data": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::name-owner": (pspec: GObject.ParamSpec) => void;
            "notify::object-path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, AsyncInitable.ConstructorProps, DBusObjectManager.ConstructorProps, Initable.ConstructorProps {
            bus_type: BusType;
            busType: BusType;
            connection: DBusConnection;
            flags: DBusObjectManagerClientFlags;
            get_proxy_type_destroy_notify: never;
            getProxyTypeDestroyNotify: never;
            get_proxy_type_func: never;
            getProxyTypeFunc: never;
            get_proxy_type_user_data: never;
            getProxyTypeUserData: never;
            name: string;
            name_owner: string | null;
            nameOwner: string | null;
            object_path: string;
            objectPath: string;
        }
    }

    class DBusObjectManagerClient extends GObject.Object implements AsyncInitable<DBusObjectManagerClient>, DBusObjectManager, Initable {
        static $gtype: GObject.GType<DBusObjectManagerClient>;

        // Properties
        set bus_type(val: BusType);

        set busType(val: BusType);

        get connection(): DBusConnection;

        get flags(): DBusObjectManagerClientFlags;

        get get_proxy_type_destroy_notify(): null;

        get getProxyTypeDestroyNotify(): null;

        get get_proxy_type_func(): null;

        get getProxyTypeFunc(): null;

        get get_proxy_type_user_data(): null;

        get getProxyTypeUserData(): null;

        get name(): string;

        get name_owner(): string | null;

        get nameOwner(): string | null;

        get object_path(): string;

        get objectPath(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DBusObjectManagerClient.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DBusObjectManagerClient.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_finish(res: AsyncResult): DBusObjectManagerClient;

        // Conflicted with Gio.AsyncInitable.new_finish
        static new_finish(...args: never[]): any;

        static new_for_bus_finish(res: AsyncResult): DBusObjectManagerClient;

        static new_for_bus_sync(bus_type: BusType, flags: DBusObjectManagerClientFlags, name: string, object_path: string, get_proxy_type_func: DBusProxyTypeFunc | null, cancellable: Cancellable | null): DBusObjectManagerClient;

        static new_sync(connection: DBusConnection, flags: DBusObjectManagerClientFlags, name: string | null, object_path: string, get_proxy_type_func: DBusProxyTypeFunc | null, cancellable: Cancellable | null): DBusObjectManagerClient;

        // Signals
        /** @signal */
        connect<K extends keyof DBusObjectManagerClient.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusObjectManagerClient.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DBusObjectManagerClient.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusObjectManagerClient.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DBusObjectManagerClient.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DBusObjectManagerClient.SignalSignatures[K]>): void;

        // Static methods
        static ["new"](connection: DBusConnection, flags: DBusObjectManagerClientFlags, name: string, object_path: string, get_proxy_type_func: DBusProxyTypeFunc | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<DBusObjectManagerClient> | null): void;

        static new_for_bus(bus_type: BusType, flags: DBusObjectManagerClientFlags, name: string, object_path: string, get_proxy_type_func: DBusProxyTypeFunc | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<DBusObjectManagerClient> | null): void;

        // Virtual methods
        vfunc_interface_proxy_properties_changed(object_proxy: DBusObjectProxy, interface_proxy: DBusProxy, changed_properties: GLib.Variant, invalidated_properties: string): void;

        vfunc_interface_proxy_signal(object_proxy: DBusObjectProxy, interface_proxy: DBusProxy, sender_name: string, signal_name: string, parameters: GLib.Variant): void;

        // Methods
        get_connection(): DBusConnection;

        get_flags(): DBusObjectManagerClientFlags;

        get_name(): string;

        get_name_owner(): string | null;

        init_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: AsyncResult): boolean;

        new_finish(res: AsyncResult): DBusObjectManagerClient;

        vfunc_init_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: AsyncResult): boolean;

        get_interface(object_path: string, interface_name: string): DBusInterface | null;

        get_object(object_path: string): DBusObject | null;

        get_object_path(): string;

        get_objects(): DBusObject[];

        vfunc_get_interface(object_path: string, interface_name: string): DBusInterface | null;

        vfunc_get_object(object_path: string): DBusObject | null;

        vfunc_get_object_path(): string;

        vfunc_get_objects(): DBusObject[];

        vfunc_interface_added(object: DBusObject, interface_: DBusInterface): void;

        vfunc_interface_removed(object: DBusObject, interface_: DBusInterface): void;

        vfunc_object_added(object: DBusObject): void;

        vfunc_object_removed(object: DBusObject): void;

        init(cancellable: Cancellable | null): boolean;

        vfunc_init(cancellable: Cancellable | null): boolean;
    }


    namespace DBusObjectManagerServer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, DBusObjectManager.SignalSignatures {
            "notify::connection": (pspec: GObject.ParamSpec) => void;
            "notify::object-path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, DBusObjectManager.ConstructorProps {
            connection: DBusConnection | null;
            object_path: string;
            objectPath: string;
        }
    }

    class DBusObjectManagerServer extends GObject.Object implements DBusObjectManager {
        static $gtype: GObject.GType<DBusObjectManagerServer>;

        // Properties
        get connection(): DBusConnection | null;
        set connection(val: DBusConnection | null);

        get object_path(): string;

        get objectPath(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DBusObjectManagerServer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DBusObjectManagerServer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](object_path: string): DBusObjectManagerServer;

        // Signals
        /** @signal */
        connect<K extends keyof DBusObjectManagerServer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusObjectManagerServer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DBusObjectManagerServer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusObjectManagerServer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DBusObjectManagerServer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DBusObjectManagerServer.SignalSignatures[K]>): void;

        // Methods
        ["export"](object: DBusObjectSkeleton): void;

        export_uniquely(object: DBusObjectSkeleton): void;

        get_connection(): DBusConnection | null;

        is_exported(object: DBusObjectSkeleton): boolean;

        set_connection(connection: DBusConnection | null): void;

        unexport(object_path: string): boolean;

        get_interface(object_path: string, interface_name: string): DBusInterface | null;

        get_object(object_path: string): DBusObject | null;

        get_object_path(): string;

        get_objects(): DBusObject[];

        vfunc_get_interface(object_path: string, interface_name: string): DBusInterface | null;

        vfunc_get_object(object_path: string): DBusObject | null;

        vfunc_get_object_path(): string;

        vfunc_get_objects(): DBusObject[];

        vfunc_interface_added(object: DBusObject, interface_: DBusInterface): void;

        vfunc_interface_removed(object: DBusObject, interface_: DBusInterface): void;

        vfunc_object_added(object: DBusObject): void;

        vfunc_object_removed(object: DBusObject): void;
    }


    namespace DBusObjectProxy {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, DBusObject.SignalSignatures {
            "notify::g-connection": (pspec: GObject.ParamSpec) => void;
            "notify::g-object-path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, DBusObject.ConstructorProps {
            g_connection: DBusConnection;
            gConnection: DBusConnection;
            g_object_path: string;
            gObjectPath: string;
        }
    }

    class DBusObjectProxy extends GObject.Object implements DBusObject {
        static $gtype: GObject.GType<DBusObjectProxy>;

        // Properties
        get g_connection(): DBusConnection;

        get gConnection(): DBusConnection;

        get g_object_path(): string;

        get gObjectPath(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DBusObjectProxy.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DBusObjectProxy.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](connection: DBusConnection, object_path: string): DBusObjectProxy;

        // Signals
        /** @signal */
        connect<K extends keyof DBusObjectProxy.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusObjectProxy.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DBusObjectProxy.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusObjectProxy.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DBusObjectProxy.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DBusObjectProxy.SignalSignatures[K]>): void;

        // Methods
        get_connection(): DBusConnection;

        get_interface(interface_name: string): DBusInterface | null;

        get_interfaces(): DBusInterface[];

        get_object_path(): string;

        vfunc_get_interface(interface_name: string): DBusInterface | null;

        vfunc_get_interfaces(): DBusInterface[];

        vfunc_get_object_path(): string;

        vfunc_interface_added(interface_: DBusInterface): void;

        vfunc_interface_removed(interface_: DBusInterface): void;
    }


    namespace DBusObjectSkeleton {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, DBusObject.SignalSignatures {
            /** @signal */
            "authorize-method": (_interface: DBusInterfaceSkeleton, invocation: DBusMethodInvocation) => boolean | void;
            "notify::g-object-path": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, DBusObject.ConstructorProps {
            g_object_path: string;
            gObjectPath: string;
        }
    }

    class DBusObjectSkeleton extends GObject.Object implements DBusObject {
        static $gtype: GObject.GType<DBusObjectSkeleton>;

        // Properties
        get g_object_path(): string;
        set g_object_path(val: string);

        get gObjectPath(): string;
        set gObjectPath(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DBusObjectSkeleton.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DBusObjectSkeleton.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](object_path: string): DBusObjectSkeleton;

        // Signals
        /** @signal */
        connect<K extends keyof DBusObjectSkeleton.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusObjectSkeleton.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DBusObjectSkeleton.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusObjectSkeleton.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DBusObjectSkeleton.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DBusObjectSkeleton.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_authorize_method(interface_: DBusInterfaceSkeleton, invocation: DBusMethodInvocation): boolean;

        // Methods
        add_interface(interface_: DBusInterfaceSkeleton): void;

        flush(): void;

        remove_interface(interface_: DBusInterfaceSkeleton): void;

        remove_interface_by_name(interface_name: string): void;

        set_object_path(object_path: string): void;

        get_interface(interface_name: string): DBusInterface | null;

        get_interfaces(): DBusInterface[];

        get_object_path(): string;

        vfunc_get_interface(interface_name: string): DBusInterface | null;

        vfunc_get_interfaces(): DBusInterface[];

        vfunc_get_object_path(): string;

        vfunc_interface_added(interface_: DBusInterface): void;

        vfunc_interface_removed(interface_: DBusInterface): void;
    }


    namespace DBusProxy {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "g-properties-changed": (changed_properties: GLib.Variant, invalidated_properties: string[]) => void;
            /** @signal */
            "g-signal": (sender_name: string | null, signal_name: string, parameters: GLib.Variant) => void;
            "notify::g-bus-type": (pspec: GObject.ParamSpec) => void;
            "notify::g-connection": (pspec: GObject.ParamSpec) => void;
            "notify::g-default-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::g-flags": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-info": (pspec: GObject.ParamSpec) => void;
            "notify::g-interface-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name": (pspec: GObject.ParamSpec) => void;
            "notify::g-name-owner": (pspec: GObject.ParamSpec) => void;
            "notify::g-object-path": (pspec: GObject.ParamSpec) => void;
            /** @signal */
            "g-signal::g-bus-type": (sender_name: string | null, signal_name: string, parameters: GLib.Variant) => void;
            /** @signal */
            "g-signal::g-connection": (sender_name: string | null, signal_name: string, parameters: GLib.Variant) => void;
            /** @signal */
            "g-signal::g-default-timeout": (sender_name: string | null, signal_name: string, parameters: GLib.Variant) => void;
            /** @signal */
            "g-signal::g-flags": (sender_name: string | null, signal_name: string, parameters: GLib.Variant) => void;
            /** @signal */
            "g-signal::g-interface-info": (sender_name: string | null, signal_name: string, parameters: GLib.Variant) => void;
            /** @signal */
            "g-signal::g-interface-name": (sender_name: string | null, signal_name: string, parameters: GLib.Variant) => void;
            /** @signal */
            "g-signal::g-name": (sender_name: string | null, signal_name: string, parameters: GLib.Variant) => void;
            /** @signal */
            "g-signal::g-name-owner": (sender_name: string | null, signal_name: string, parameters: GLib.Variant) => void;
            /** @signal */
            "g-signal::g-object-path": (sender_name: string | null, signal_name: string, parameters: GLib.Variant) => void;
            [key: `g-signal::${string}`]: (sender_name: string | null, signal_name: string, parameters: GLib.Variant) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, AsyncInitable.ConstructorProps, DBusInterface.ConstructorProps, Initable.ConstructorProps {
            g_bus_type: BusType;
            gBusType: BusType;
            g_connection: DBusConnection;
            gConnection: DBusConnection;
            g_default_timeout: number;
            gDefaultTimeout: number;
            g_flags: DBusProxyFlags;
            gFlags: DBusProxyFlags;
            g_interface_info: DBusInterfaceInfo | null;
            gInterfaceInfo: DBusInterfaceInfo | null;
            g_interface_name: string;
            gInterfaceName: string;
            g_name: string | null;
            gName: string | null;
            g_name_owner: string | null;
            gNameOwner: string | null;
            g_object_path: string;
            gObjectPath: string;
        }
    }

    class DBusProxy extends GObject.Object implements AsyncInitable<DBusProxy>, DBusInterface, Initable {
        static $gtype: GObject.GType<DBusProxy>;

    [key: string]: any;


        // Properties
        set g_bus_type(val: BusType);

        set gBusType(val: BusType);

        get g_connection(): DBusConnection;

        get gConnection(): DBusConnection;

        get g_default_timeout(): number;
        set g_default_timeout(val: number);

        get gDefaultTimeout(): number;
        set gDefaultTimeout(val: number);

        get g_flags(): DBusProxyFlags;

        get gFlags(): DBusProxyFlags;

        get g_interface_info(): DBusInterfaceInfo | null;
        set g_interface_info(val: DBusInterfaceInfo | null);

        get gInterfaceInfo(): DBusInterfaceInfo | null;
        set gInterfaceInfo(val: DBusInterfaceInfo | null);

        get g_interface_name(): string;

        get gInterfaceName(): string;

        get g_name(): string | null;

        get gName(): string | null;

        get g_name_owner(): string | null;

        get gNameOwner(): string | null;

        get g_object_path(): string;

        get gObjectPath(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DBusProxy.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DBusProxy.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_finish(res: AsyncResult): DBusProxy;

        // Conflicted with Gio.AsyncInitable.new_finish
        static new_finish(...args: never[]): any;

        static new_for_bus_finish(res: AsyncResult): DBusProxy;

        static new_for_bus_sync(bus_type: BusType, flags: DBusProxyFlags, info: DBusInterfaceInfo | null, name: string, object_path: string, interface_name: string, cancellable: Cancellable | null): DBusProxy;

        static new_sync(connection: DBusConnection, flags: DBusProxyFlags, info: DBusInterfaceInfo | null, name: string | null, object_path: string, interface_name: string, cancellable: Cancellable | null): DBusProxy;

        // Signals
        /** @signal */
        connect<K extends keyof DBusProxy.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusProxy.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DBusProxy.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusProxy.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DBusProxy.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DBusProxy.SignalSignatures[K]>): void;

        // Static methods
        static ["new"](connection: DBusConnection, flags: DBusProxyFlags, info: DBusInterfaceInfo | null, name: string | null, object_path: string, interface_name: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<DBusProxy> | null): void;

        static new_for_bus(bus_type: BusType, flags: DBusProxyFlags, info: DBusInterfaceInfo | null, name: string, object_path: string, interface_name: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<DBusProxy> | null): void;

        static makeProxyWrapper<T>(...args: any[]): (bus: DBusConnection, name: string, object: string, asyncCallback?: (initable: (T & DBusProxy) | null, error: unknown | null) => void, cancellable?: Cancellable | null, flags?: DBusProxyFlags) => T & DBusProxy;

        // Virtual methods
        vfunc_g_properties_changed(changed_properties: GLib.Variant, invalidated_properties: string): void;

        vfunc_g_signal(sender_name: string, signal_name: string, parameters: GLib.Variant): void;

        // Methods
        call(method_name: string, parameters: GLib.Variant | null, flags: DBusCallFlags, timeout_msec: number, cancellable: Cancellable | null): globalThis.Promise<GLib.Variant>;

        call(method_name: string, parameters: GLib.Variant | null, flags: DBusCallFlags, timeout_msec: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        call(method_name: string, parameters: GLib.Variant | null, flags: DBusCallFlags, timeout_msec: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<GLib.Variant> | void;

        call_finish(res: AsyncResult): GLib.Variant;

        call_sync(method_name: string, parameters: GLib.Variant | null, flags: DBusCallFlags, timeout_msec: number, cancellable: Cancellable | null): GLib.Variant;

        call_with_unix_fd_list(method_name: string, parameters: GLib.Variant | null, flags: DBusCallFlags, timeout_msec: number, fd_list: UnixFDList | null, cancellable: Cancellable | null): globalThis.Promise<[GLib.Variant, UnixFDList | null]>;

        call_with_unix_fd_list(method_name: string, parameters: GLib.Variant | null, flags: DBusCallFlags, timeout_msec: number, fd_list: UnixFDList | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        call_with_unix_fd_list(method_name: string, parameters: GLib.Variant | null, flags: DBusCallFlags, timeout_msec: number, fd_list: UnixFDList | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<[GLib.Variant, UnixFDList | null]> | void;

        call_with_unix_fd_list_finish(res: AsyncResult): [GLib.Variant, UnixFDList | null];

        call_with_unix_fd_list_sync(method_name: string, parameters: GLib.Variant | null, flags: DBusCallFlags, timeout_msec: number, fd_list: UnixFDList | null, cancellable: Cancellable | null): [GLib.Variant, UnixFDList | null];

        get_cached_property(property_name: string): GLib.Variant | null;

        get_cached_property_names(): string[] | null;

        get_connection(): DBusConnection;

        get_default_timeout(): number;

        get_flags(): DBusProxyFlags;

        get_interface_info(): DBusInterfaceInfo | null;

        get_interface_name(): string;

        get_name(): string | null;

        get_name_owner(): string | null;

        get_object_path(): string;

        set_cached_property(property_name: string, value: GLib.Variant | null): void;

        set_default_timeout(timeout_msec: number): void;

        set_interface_info(info: DBusInterfaceInfo | null): void;

        connectSignal(proxy: this, name: string, args: any[]): any;

        disconnectSignal(...args: any[]): any;

        init_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: AsyncResult): boolean;

        new_finish(res: AsyncResult): DBusProxy;

        vfunc_init_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: AsyncResult): boolean;

        get_object(): DBusObject | null;

        get_info(): DBusInterfaceInfo | null;

        set_object(object: DBusObject | null): void;

        vfunc_dup_object(): DBusObject | null;

        vfunc_get_info(): DBusInterfaceInfo | null;

        vfunc_set_object(object: DBusObject | null): void;

        init(cancellable: Cancellable | null): boolean;

        vfunc_init(cancellable: Cancellable | null): boolean;
    }


    namespace DBusServer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "new-connection": (connection: DBusConnection) => boolean | void;
            "notify::active": (pspec: GObject.ParamSpec) => void;
            "notify::address": (pspec: GObject.ParamSpec) => void;
            "notify::authentication-observer": (pspec: GObject.ParamSpec) => void;
            "notify::client-address": (pspec: GObject.ParamSpec) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::guid": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Initable.ConstructorProps {
            active: boolean;
            address: string;
            authentication_observer: DBusAuthObserver;
            authenticationObserver: DBusAuthObserver;
            client_address: string;
            clientAddress: string;
            flags: DBusServerFlags;
            guid: string;
        }
    }

    class DBusServer extends GObject.Object implements Initable {
        static $gtype: GObject.GType<DBusServer>;

        // Properties
        get active(): boolean;

        get address(): string;

        get authentication_observer(): DBusAuthObserver;

        get authenticationObserver(): DBusAuthObserver;

        get client_address(): string;

        get clientAddress(): string;

        get flags(): DBusServerFlags;

        get guid(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DBusServer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DBusServer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_sync(address: string, flags: DBusServerFlags, guid: string, observer: DBusAuthObserver | null, cancellable: Cancellable | null): DBusServer;

        // Signals
        /** @signal */
        connect<K extends keyof DBusServer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusServer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DBusServer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusServer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DBusServer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DBusServer.SignalSignatures[K]>): void;

        // Methods
        get_client_address(): string;

        get_flags(): DBusServerFlags;

        get_guid(): string;

        is_active(): boolean;

        start(): void;

        stop(): void;

        init(cancellable: Cancellable | null): boolean;

        vfunc_init(cancellable: Cancellable | null): boolean;
    }


    namespace DataInputStream {
        // Signal signatures
        interface SignalSignatures extends BufferedInputStream.SignalSignatures {
            "notify::byte-order": (pspec: GObject.ParamSpec) => void;
            "notify::newline-type": (pspec: GObject.ParamSpec) => void;
            "notify::buffer-size": (pspec: GObject.ParamSpec) => void;
            "notify::base-stream": (pspec: GObject.ParamSpec) => void;
            "notify::close-base-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends BufferedInputStream.ConstructorProps, Seekable.ConstructorProps {
            byte_order: DataStreamByteOrder;
            byteOrder: DataStreamByteOrder;
            newline_type: DataStreamNewlineType;
            newlineType: DataStreamNewlineType;
        }
    }

    class DataInputStream extends BufferedInputStream implements Seekable {
        static $gtype: GObject.GType<DataInputStream>;

        // Properties
        get byte_order(): DataStreamByteOrder;
        set byte_order(val: DataStreamByteOrder);

        get byteOrder(): DataStreamByteOrder;
        set byteOrder(val: DataStreamByteOrder);

        get newline_type(): DataStreamNewlineType;
        set newline_type(val: DataStreamNewlineType);

        get newlineType(): DataStreamNewlineType;
        set newlineType(val: DataStreamNewlineType);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DataInputStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DataInputStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](base_stream: InputStream): DataInputStream;

        // Signals
        /** @signal */
        connect<K extends keyof DataInputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DataInputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DataInputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DataInputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DataInputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DataInputStream.SignalSignatures[K]>): void;

        // Methods
        get_byte_order(): DataStreamByteOrder;

        get_newline_type(): DataStreamNewlineType;

        read_byte(cancellable: Cancellable | null): number;

        read_int16(cancellable: Cancellable | null): number;

        read_int32(cancellable: Cancellable | null): number;

        read_int64(cancellable: Cancellable | null): number;

        read_line(cancellable: Cancellable | null): [Uint8Array | null, number];

        read_line_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<[Uint8Array | null, number]>;

        read_line_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        read_line_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<[Uint8Array | null, number]> | void;

        read_line_finish(result: AsyncResult): [Uint8Array | null, number];

        read_line_finish_utf8(result: AsyncResult): [string | null, number];

        read_line_utf8(cancellable: Cancellable | null): [string | null, number];

        read_uint16(cancellable: Cancellable | null): number;

        read_uint32(cancellable: Cancellable | null): number;

        read_uint64(cancellable: Cancellable | null): number;

        read_until(stop_chars: string, cancellable: Cancellable | null): [string, number];

        read_until_async(stop_chars: string, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<[string, number]>;

        read_until_async(stop_chars: string, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        read_until_async(stop_chars: string, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<[string, number]> | void;

        read_until_finish(result: AsyncResult): [string, number];

        read_upto(stop_chars: string, stop_chars_len: bigint | number, cancellable: Cancellable | null): [string, number];

        read_upto_async(stop_chars: string, stop_chars_len: bigint | number, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<[string, number]>;

        read_upto_async(stop_chars: string, stop_chars_len: bigint | number, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        read_upto_async(stop_chars: string, stop_chars_len: bigint | number, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<[string, number]> | void;

        read_upto_finish(result: AsyncResult): [string, number];

        set_byte_order(order: DataStreamByteOrder): void;

        set_newline_type(type: DataStreamNewlineType): void;

        can_seek(): boolean;

        can_truncate(): boolean;

        seek(offset: bigint | number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        tell(): number;

        truncate(offset: bigint | number, cancellable: Cancellable | null): boolean;

        vfunc_can_seek(): boolean;

        vfunc_can_truncate(): boolean;

        vfunc_seek(offset: number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        vfunc_tell(): bigint | number;

        vfunc_truncate_fn(offset: number, cancellable: Cancellable | null): boolean;
    }


    namespace DataOutputStream {
        // Signal signatures
        interface SignalSignatures extends FilterOutputStream.SignalSignatures {
            "notify::byte-order": (pspec: GObject.ParamSpec) => void;
            "notify::base-stream": (pspec: GObject.ParamSpec) => void;
            "notify::close-base-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends FilterOutputStream.ConstructorProps, Seekable.ConstructorProps {
            byte_order: DataStreamByteOrder;
            byteOrder: DataStreamByteOrder;
        }
    }

    class DataOutputStream extends FilterOutputStream implements Seekable {
        static $gtype: GObject.GType<DataOutputStream>;

        // Properties
        get byte_order(): DataStreamByteOrder;
        set byte_order(val: DataStreamByteOrder);

        get byteOrder(): DataStreamByteOrder;
        set byteOrder(val: DataStreamByteOrder);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DataOutputStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DataOutputStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](base_stream: OutputStream): DataOutputStream;

        // Signals
        /** @signal */
        connect<K extends keyof DataOutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DataOutputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DataOutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DataOutputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DataOutputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DataOutputStream.SignalSignatures[K]>): void;

        // Methods
        get_byte_order(): DataStreamByteOrder;

        put_byte(data: number, cancellable: Cancellable | null): boolean;

        put_int16(data: number, cancellable: Cancellable | null): boolean;

        put_int32(data: number, cancellable: Cancellable | null): boolean;

        put_int64(data: bigint | number, cancellable: Cancellable | null): boolean;

        put_string(str: string, cancellable: Cancellable | null): boolean;

        put_uint16(data: number, cancellable: Cancellable | null): boolean;

        put_uint32(data: number, cancellable: Cancellable | null): boolean;

        put_uint64(data: bigint | number, cancellable: Cancellable | null): boolean;

        set_byte_order(order: DataStreamByteOrder): void;

        can_seek(): boolean;

        can_truncate(): boolean;

        seek(offset: bigint | number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        tell(): number;

        truncate(offset: bigint | number, cancellable: Cancellable | null): boolean;

        vfunc_can_seek(): boolean;

        vfunc_can_truncate(): boolean;

        vfunc_seek(offset: number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        vfunc_tell(): bigint | number;

        vfunc_truncate_fn(offset: number, cancellable: Cancellable | null): boolean;
    }


    namespace DebugControllerDBus {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            authorize: (invocation: DBusMethodInvocation) => boolean | void;
            "notify::connection": (pspec: GObject.ParamSpec) => void;
            "notify::debug-enabled": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, DebugController.ConstructorProps, Initable.ConstructorProps {
            connection: DBusConnection;
        }
    }

    class DebugControllerDBus extends GObject.Object implements DebugController, Initable {
        static $gtype: GObject.GType<DebugControllerDBus>;

        // Properties
        get connection(): DBusConnection;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DebugControllerDBus.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DebugControllerDBus.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](connection: DBusConnection, cancellable: Cancellable | null): DebugControllerDBus;

        // Signals
        /** @signal */
        connect<K extends keyof DebugControllerDBus.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DebugControllerDBus.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DebugControllerDBus.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DebugControllerDBus.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DebugControllerDBus.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DebugControllerDBus.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_authorize(invocation: DBusMethodInvocation): boolean;

        // Methods
        stop(): void;

        /** @category Inherited from Gio.DebugController */
        get debug_enabled(): boolean;
        set debug_enabled(val: boolean);

        /** @category Inherited from Gio.DebugController */
        get debugEnabled(): boolean;
        set debugEnabled(val: boolean);

        get_debug_enabled(): boolean;

        set_debug_enabled(debug_enabled: boolean): void;

        init(cancellable: Cancellable | null): boolean;

        vfunc_init(cancellable: Cancellable | null): boolean;
    }


    namespace Emblem {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::icon": (pspec: GObject.ParamSpec) => void;
            "notify::origin": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Icon.ConstructorProps {
            icon: GObject.Object;
            origin: EmblemOrigin;
        }
    }

    class Emblem extends GObject.Object implements Icon {
        static $gtype: GObject.GType<Emblem>;

        // Properties
        get icon(): GObject.Object;

        get origin(): EmblemOrigin;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Emblem.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Emblem.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](icon: Icon): Emblem;

        static new_with_origin(icon: Icon, origin: EmblemOrigin): Emblem;

        // Signals
        /** @signal */
        connect<K extends keyof Emblem.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Emblem.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Emblem.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Emblem.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Emblem.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Emblem.SignalSignatures[K]>): void;

        // Methods
        get_icon(): Icon;

        get_origin(): EmblemOrigin;

        equal(icon2: Icon | null): boolean;

        hash(): number;

        serialize(): GLib.Variant | null;

        to_string(): string | null;

        vfunc_equal(icon2: Icon | null): boolean;

        vfunc_hash(): number;

        vfunc_serialize(): GLib.Variant | null;

        vfunc_to_tokens(): [boolean, string[], number];
    }


    namespace EmblemedIcon {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::gicon": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Icon.ConstructorProps {
            gicon: Icon;
        }
    }

    class EmblemedIcon extends GObject.Object implements Icon {
        static $gtype: GObject.GType<EmblemedIcon>;

        // Properties
        get gicon(): Icon;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: EmblemedIcon.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<EmblemedIcon.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](icon: Icon, emblem: Emblem | null): EmblemedIcon;

        // Signals
        /** @signal */
        connect<K extends keyof EmblemedIcon.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, EmblemedIcon.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof EmblemedIcon.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, EmblemedIcon.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof EmblemedIcon.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<EmblemedIcon.SignalSignatures[K]>): void;

        // Methods
        add_emblem(emblem: Emblem): void;

        clear_emblems(): void;

        get_emblems(): Emblem[];

        get_icon(): Icon;

        equal(icon2: Icon | null): boolean;

        hash(): number;

        serialize(): GLib.Variant | null;

        to_string(): string | null;

        vfunc_equal(icon2: Icon | null): boolean;

        vfunc_hash(): number;

        vfunc_serialize(): GLib.Variant | null;

        vfunc_to_tokens(): [boolean, string[], number];
    }


    namespace FileEnumerator {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::container": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            container: File;
        }
    }

    class FileEnumerator extends GObject.Object {
        static $gtype: GObject.GType<FileEnumerator>;

        // Properties
        set container(val: File);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FileEnumerator.SignalSignatures;

        // Fields
        [Symbol.iterator]: (() => IterableIterator<FileInfo>);

        [Symbol.asyncIterator]: (() => AsyncIterableIterator<FileInfo>);

        // Constructors
        constructor(properties?: Partial<FileEnumerator.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FileEnumerator.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FileEnumerator.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FileEnumerator.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FileEnumerator.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FileEnumerator.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FileEnumerator.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_close_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_close_finish(result: AsyncResult): boolean;

        vfunc_close_fn(cancellable: Cancellable | null): boolean;

        vfunc_next_file(cancellable: Cancellable | null): FileInfo | null;

        vfunc_next_files_async(num_files: number, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_next_files_finish(result: AsyncResult): FileInfo[];

        // Methods
        close(cancellable: Cancellable | null): boolean;

        close_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        close_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        close_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        close_finish(result: AsyncResult): boolean;

        get_child(info: FileInfo): File;

        get_container(): File;

        has_pending(): boolean;

        is_closed(): boolean;

        iterate(cancellable: Cancellable | null): [boolean, FileInfo | null, File | null];

        next_file(cancellable: Cancellable | null): FileInfo | null;

        next_files_async(num_files: number, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<FileInfo[]>;

        next_files_async(num_files: number, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        next_files_async(num_files: number, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<FileInfo[]> | void;

        next_files_finish(result: AsyncResult): FileInfo[];

        set_pending(pending: boolean): void;
    }


    namespace FileIOStream {
        // Signal signatures
        interface SignalSignatures extends IOStream.SignalSignatures {
            "notify::closed": (pspec: GObject.ParamSpec) => void;
            "notify::input-stream": (pspec: GObject.ParamSpec) => void;
            "notify::output-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends IOStream.ConstructorProps, Seekable.ConstructorProps {}
    }

    class FileIOStream extends IOStream implements Seekable {
        static $gtype: GObject.GType<FileIOStream>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FileIOStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FileIOStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FileIOStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FileIOStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FileIOStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FileIOStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FileIOStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FileIOStream.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_can_seek(): boolean;

        vfunc_can_truncate(): boolean;

        vfunc_get_etag(): string | null;

        vfunc_query_info(attributes: string, cancellable: Cancellable | null): FileInfo;

        vfunc_query_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_query_info_finish(result: AsyncResult): FileInfo;

        vfunc_seek(offset: number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        vfunc_tell(): bigint | number;

        vfunc_truncate_fn(size: number, cancellable: Cancellable | null): boolean;

        // Methods
        get_etag(): string | null;

        query_info(attributes: string, cancellable: Cancellable | null): FileInfo;

        query_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<FileInfo>;

        query_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        query_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<FileInfo> | void;

        query_info_finish(result: AsyncResult): FileInfo;

        can_seek(): boolean;

        can_truncate(): boolean;

        seek(offset: bigint | number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        tell(): number;

        truncate(offset: bigint | number, cancellable: Cancellable | null): boolean;
    }


    namespace FileIcon {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::file": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Icon.ConstructorProps, LoadableIcon.ConstructorProps {
            file: File;
        }
    }

    class FileIcon extends GObject.Object implements Icon, LoadableIcon {
        static $gtype: GObject.GType<FileIcon>;

        // Properties
        get file(): File;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FileIcon.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FileIcon.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](file: File): FileIcon;

        // Signals
        /** @signal */
        connect<K extends keyof FileIcon.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FileIcon.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FileIcon.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FileIcon.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FileIcon.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FileIcon.SignalSignatures[K]>): void;

        // Methods
        get_file(): File;

        equal(icon2: Icon | null): boolean;

        hash(): number;

        serialize(): GLib.Variant | null;

        to_string(): string | null;

        vfunc_equal(icon2: Icon | null): boolean;

        vfunc_hash(): number;

        vfunc_serialize(): GLib.Variant | null;

        vfunc_to_tokens(): [boolean, string[], number];

        load(size: number, cancellable: Cancellable | null): [InputStream, string];

        load_async(size: number, cancellable: Cancellable | null): globalThis.Promise<[InputStream, string]>;

        load_async(size: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        load_async(size: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<[InputStream, string]> | void;

        load_finish(res: AsyncResult): [InputStream, string];

        vfunc_load(size: number, cancellable: Cancellable | null): [InputStream, string];

        vfunc_load_async(size: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_load_finish(res: AsyncResult): [InputStream, string];
    }


    namespace FileInfo {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class FileInfo extends GObject.Object {
        static $gtype: GObject.GType<FileInfo>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FileInfo.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FileInfo.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): FileInfo;

        // Signals
        /** @signal */
        connect<K extends keyof FileInfo.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FileInfo.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FileInfo.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FileInfo.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FileInfo.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FileInfo.SignalSignatures[K]>): void;

        // Methods
        clear_status(): void;

        copy_into(dest_info: FileInfo): void;

        dup(): FileInfo;

        get_access_date_time(): GLib.DateTime | null;

        get_attribute_as_string(attribute: string): string | null;

        get_attribute_boolean(attribute: string): boolean;

        get_attribute_byte_string(attribute: string): string | null;

        get_attribute_data(attribute: string): [boolean, FileAttributeType | null, null, FileAttributeStatus | null];

        get_attribute_file_path(attribute: string): string | null;

        get_attribute_int32(attribute: string): number;

        get_attribute_int64(attribute: string): number;

        get_attribute_object<T = GObject.Object>(attribute: string): T;

        get_attribute_status(attribute: string): FileAttributeStatus;

        get_attribute_string(attribute: string): string | null;

        get_attribute_stringv(attribute: string): string[] | null;

        get_attribute_type(attribute: string): FileAttributeType;

        get_attribute_uint32(attribute: string): number;

        get_attribute_uint64(attribute: string): number;

        get_content_type(): string | null;

        get_creation_date_time(): GLib.DateTime | null;

        get_deletion_date(): GLib.DateTime | null;

        get_display_name(): string;

        get_edit_name(): string;

        get_etag(): string | null;

        get_file_type(): FileType;

        get_icon(): Icon | null;

        get_is_backup(): boolean;

        get_is_hidden(): boolean;

        get_is_symlink(): boolean;

        get_modification_date_time(): GLib.DateTime | null;

        get_modification_time(): GLib.TimeVal;

        get_name(): string;

        get_size(): number;

        get_sort_order(): number;

        get_symbolic_icon(): Icon | null;

        get_symlink_target(): string | null;

        has_attribute(attribute: string): boolean;

        has_namespace(name_space: string): boolean;

        list_attributes(name_space: string | null): string[] | null;

        remove_attribute(attribute: string): void;

        set_access_date_time(atime: GLib.DateTime): void;

        set_attribute(attribute: string, type: FileAttributeType, value_p: never): void;

        set_attribute_boolean(attribute: string, attr_value: boolean): void;

        set_attribute_byte_string(attribute: string, attr_value: string): void;

        set_attribute_file_path(attribute: string, attr_value: string): void;

        set_attribute_int32(attribute: string, attr_value: number): void;

        set_attribute_int64(attribute: string, attr_value: bigint | number): void;

        set_attribute_mask(mask: FileAttributeMatcher): void;

        set_attribute_object(attribute: string, attr_value: GObject.Object): void;

        set_attribute_status(attribute: string, status: FileAttributeStatus): boolean;

        set_attribute_string(attribute: string, attr_value: string): void;

        set_attribute_stringv(attribute: string, attr_value: string[]): void;

        set_attribute_uint32(attribute: string, attr_value: number): void;

        set_attribute_uint64(attribute: string, attr_value: bigint | number): void;

        set_content_type(content_type: string): void;

        set_creation_date_time(creation_time: GLib.DateTime): void;

        set_display_name(display_name: string): void;

        set_edit_name(edit_name: string): void;

        set_file_type(type: FileType): void;

        set_icon(icon: Icon): void;

        set_is_hidden(is_hidden: boolean): void;

        set_is_symlink(is_symlink: boolean): void;

        set_modification_date_time(mtime: GLib.DateTime): void;

        set_modification_time(mtime: GLib.TimeVal): void;

        set_name(name: string): void;

        set_size(size: bigint | number): void;

        set_sort_order(sort_order: number): void;

        set_symbolic_icon(icon: Icon): void;

        set_symlink_target(symlink_target: string): void;

        unset_attribute_mask(): void;
    }


    namespace FileInputStream {
        // Signal signatures
        interface SignalSignatures extends InputStream.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends InputStream.ConstructorProps, Seekable.ConstructorProps {}
    }

    class FileInputStream extends InputStream implements Seekable {
        static $gtype: GObject.GType<FileInputStream>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FileInputStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FileInputStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FileInputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FileInputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FileInputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FileInputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FileInputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FileInputStream.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_can_seek(): boolean;

        vfunc_query_info(attributes: string, cancellable: Cancellable | null): FileInfo;

        vfunc_query_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_query_info_finish(result: AsyncResult): FileInfo;

        vfunc_seek(offset: number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        vfunc_tell(): bigint | number;

        // Methods
        query_info(attributes: string, cancellable: Cancellable | null): FileInfo;

        query_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<FileInfo>;

        query_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        query_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<FileInfo> | void;

        query_info_finish(result: AsyncResult): FileInfo;

        can_seek(): boolean;

        can_truncate(): boolean;

        seek(offset: bigint | number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        tell(): number;

        truncate(offset: bigint | number, cancellable: Cancellable | null): boolean;

        vfunc_can_truncate(): boolean;

        vfunc_truncate_fn(offset: number, cancellable: Cancellable | null): boolean;
    }


    namespace FileMonitor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            changed: (file: File, other_file: File | null, event_type: FileMonitorEvent) => void;
            "notify::cancelled": (pspec: GObject.ParamSpec) => void;
            "notify::rate-limit": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            cancelled: boolean;
            rate_limit: number;
            rateLimit: number;
        }
    }

    abstract class FileMonitor extends GObject.Object {
        static $gtype: GObject.GType<FileMonitor>;

        // Properties
        get cancelled(): boolean;

        get rate_limit(): number;
        set rate_limit(val: number);

        get rateLimit(): number;
        set rateLimit(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FileMonitor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FileMonitor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FileMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FileMonitor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FileMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FileMonitor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FileMonitor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FileMonitor.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_cancel(): boolean;

        vfunc_changed(file: File, other_file: File, event_type: FileMonitorEvent): void;

        // Methods
        cancel(): boolean;

        emit_event(child: File, other_file: File | null, event_type: FileMonitorEvent): void;

        is_cancelled(): boolean;

        set_rate_limit(limit_msecs: number): void;
    }


    namespace FileOutputStream {
        // Signal signatures
        interface SignalSignatures extends OutputStream.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends OutputStream.ConstructorProps, Seekable.ConstructorProps {}
    }

    class FileOutputStream extends OutputStream implements Seekable {
        static $gtype: GObject.GType<FileOutputStream>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FileOutputStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FileOutputStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FileOutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FileOutputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FileOutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FileOutputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FileOutputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FileOutputStream.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_can_seek(): boolean;

        vfunc_can_truncate(): boolean;

        vfunc_get_etag(): string | null;

        vfunc_query_info(attributes: string, cancellable: Cancellable | null): FileInfo;

        vfunc_query_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_query_info_finish(result: AsyncResult): FileInfo;

        vfunc_seek(offset: number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        vfunc_tell(): bigint | number;

        vfunc_truncate_fn(size: number, cancellable: Cancellable | null): boolean;

        // Methods
        get_etag(): string | null;

        query_info(attributes: string, cancellable: Cancellable | null): FileInfo;

        query_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<FileInfo>;

        query_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        query_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<FileInfo> | void;

        query_info_finish(result: AsyncResult): FileInfo;

        can_seek(): boolean;

        can_truncate(): boolean;

        seek(offset: bigint | number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        tell(): number;

        truncate(offset: bigint | number, cancellable: Cancellable | null): boolean;
    }


    namespace FilenameCompleter {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "got-completion-data": () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class FilenameCompleter extends GObject.Object {
        static $gtype: GObject.GType<FilenameCompleter>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FilenameCompleter.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FilenameCompleter.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): FilenameCompleter;

        // Signals
        /** @signal */
        connect<K extends keyof FilenameCompleter.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FilenameCompleter.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FilenameCompleter.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FilenameCompleter.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FilenameCompleter.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FilenameCompleter.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_got_completion_data(): void;

        // Methods
        get_completion_suffix(initial_text: string): string | null;

        get_completions(initial_text: string): string[];

        set_dirs_only(dirs_only: boolean): void;
    }


    namespace FilterInputStream {
        // Signal signatures
        interface SignalSignatures extends InputStream.SignalSignatures {
            "notify::base-stream": (pspec: GObject.ParamSpec) => void;
            "notify::close-base-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends InputStream.ConstructorProps {
            base_stream: InputStream;
            baseStream: InputStream;
            close_base_stream: boolean;
            closeBaseStream: boolean;
        }
    }

    abstract class FilterInputStream extends InputStream {
        static $gtype: GObject.GType<FilterInputStream>;

        // Properties
        get base_stream(): InputStream;

        get baseStream(): InputStream;

        get close_base_stream(): boolean;
        set close_base_stream(val: boolean);

        get closeBaseStream(): boolean;
        set closeBaseStream(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FilterInputStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FilterInputStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FilterInputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FilterInputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FilterInputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FilterInputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FilterInputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FilterInputStream.SignalSignatures[K]>): void;

        // Methods
        get_base_stream(): InputStream;

        get_close_base_stream(): boolean;

        set_close_base_stream(close_base: boolean): void;
    }


    namespace FilterOutputStream {
        // Signal signatures
        interface SignalSignatures extends OutputStream.SignalSignatures {
            "notify::base-stream": (pspec: GObject.ParamSpec) => void;
            "notify::close-base-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends OutputStream.ConstructorProps {
            base_stream: OutputStream;
            baseStream: OutputStream;
            close_base_stream: boolean;
            closeBaseStream: boolean;
        }
    }

    abstract class FilterOutputStream extends OutputStream {
        static $gtype: GObject.GType<FilterOutputStream>;

        // Properties
        get base_stream(): OutputStream;

        get baseStream(): OutputStream;

        get close_base_stream(): boolean;

        get closeBaseStream(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FilterOutputStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FilterOutputStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FilterOutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FilterOutputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FilterOutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FilterOutputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FilterOutputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FilterOutputStream.SignalSignatures[K]>): void;

        // Methods
        get_base_stream(): OutputStream;

        get_close_base_stream(): boolean;

        set_close_base_stream(close_base: boolean): void;
    }


    namespace IOModule {
        // Signal signatures
        interface SignalSignatures extends GObject.TypeModule.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.TypeModule.ConstructorProps, GObject.TypePlugin.ConstructorProps {}
    }

    class IOModule extends GObject.TypeModule implements GObject.TypePlugin {
        static $gtype: GObject.GType<IOModule>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: IOModule.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<IOModule.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](filename: string): IOModule;

        // Signals
        /** @signal */
        connect<K extends keyof IOModule.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IOModule.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof IOModule.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IOModule.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof IOModule.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<IOModule.SignalSignatures[K]>): void;

        // Static methods
        static query(): string[];

        complete_interface_info(instance_type: GObject.GType, interface_type: GObject.GType, info: GObject.InterfaceInfo): void;

        complete_type_info(g_type: GObject.GType, info: GObject.TypeInfo, value_table: GObject.TypeValueTable): void;

        unuse(): void;

        use(): void;

        // Conflicted with GObject.TypeModule.use
        use(...args: never[]): any;
    }


    namespace IOStream {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::closed": (pspec: GObject.ParamSpec) => void;
            "notify::input-stream": (pspec: GObject.ParamSpec) => void;
            "notify::output-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            closed: boolean;
            input_stream: InputStream;
            inputStream: InputStream;
            output_stream: OutputStream;
            outputStream: OutputStream;
        }
    }

    abstract class IOStream extends GObject.Object {
        static $gtype: GObject.GType<IOStream>;

        // Properties
        get closed(): boolean;

        get input_stream(): InputStream;

        get inputStream(): InputStream;

        get output_stream(): OutputStream;

        get outputStream(): OutputStream;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: IOStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<IOStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof IOStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IOStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof IOStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IOStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof IOStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<IOStream.SignalSignatures[K]>): void;

        // Static methods
        static splice_finish(result: AsyncResult): boolean;

        // Virtual methods
        vfunc_close_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_close_finish(result: AsyncResult): boolean;

        vfunc_close_fn(cancellable: Cancellable | null): boolean;

        vfunc_get_input_stream(): InputStream;

        vfunc_get_output_stream(): OutputStream;

        // Methods
        clear_pending(): void;

        close(cancellable: Cancellable | null): boolean;

        close_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        close_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        close_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        close_finish(result: AsyncResult): boolean;

        get_input_stream(): InputStream;

        get_output_stream(): OutputStream;

        has_pending(): boolean;

        is_closed(): boolean;

        set_pending(): boolean;

        splice_async(stream2: IOStream, flags: IOStreamSpliceFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;
    }


    namespace IPTosMessage {
        // Signal signatures
        interface SignalSignatures extends SocketControlMessage.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends SocketControlMessage.ConstructorProps {}
    }

    class IPTosMessage extends SocketControlMessage {
        static $gtype: GObject.GType<IPTosMessage>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: IPTosMessage.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<IPTosMessage.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](dscp: number, ecn: EcnCodePoint): IPTosMessage;

        // Signals
        /** @signal */
        connect<K extends keyof IPTosMessage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IPTosMessage.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof IPTosMessage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IPTosMessage.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof IPTosMessage.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<IPTosMessage.SignalSignatures[K]>): void;

        // Methods
        get_dscp(): number;

        get_ecn(): EcnCodePoint;
    }


    namespace IPv6TclassMessage {
        // Signal signatures
        interface SignalSignatures extends SocketControlMessage.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends SocketControlMessage.ConstructorProps {}
    }

    class IPv6TclassMessage extends SocketControlMessage {
        static $gtype: GObject.GType<IPv6TclassMessage>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: IPv6TclassMessage.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<IPv6TclassMessage.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](dscp: number, ecn: EcnCodePoint): IPv6TclassMessage;

        // Signals
        /** @signal */
        connect<K extends keyof IPv6TclassMessage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IPv6TclassMessage.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof IPv6TclassMessage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IPv6TclassMessage.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof IPv6TclassMessage.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<IPv6TclassMessage.SignalSignatures[K]>): void;

        // Methods
        get_dscp(): number;

        get_ecn(): EcnCodePoint;
    }


    namespace InetAddress {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::bytes": (pspec: GObject.ParamSpec) => void;
            "notify::family": (pspec: GObject.ParamSpec) => void;
            "notify::flowinfo": (pspec: GObject.ParamSpec) => void;
            "notify::is-any": (pspec: GObject.ParamSpec) => void;
            "notify::is-link-local": (pspec: GObject.ParamSpec) => void;
            "notify::is-loopback": (pspec: GObject.ParamSpec) => void;
            "notify::is-mc-global": (pspec: GObject.ParamSpec) => void;
            "notify::is-mc-link-local": (pspec: GObject.ParamSpec) => void;
            "notify::is-mc-node-local": (pspec: GObject.ParamSpec) => void;
            "notify::is-mc-org-local": (pspec: GObject.ParamSpec) => void;
            "notify::is-mc-site-local": (pspec: GObject.ParamSpec) => void;
            "notify::is-multicast": (pspec: GObject.ParamSpec) => void;
            "notify::is-site-local": (pspec: GObject.ParamSpec) => void;
            "notify::scope-id": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            bytes: never;
            family: SocketFamily;
            flowinfo: number;
            is_any: boolean;
            isAny: boolean;
            is_link_local: boolean;
            isLinkLocal: boolean;
            is_loopback: boolean;
            isLoopback: boolean;
            is_mc_global: boolean;
            isMcGlobal: boolean;
            is_mc_link_local: boolean;
            isMcLinkLocal: boolean;
            is_mc_node_local: boolean;
            isMcNodeLocal: boolean;
            is_mc_org_local: boolean;
            isMcOrgLocal: boolean;
            is_mc_site_local: boolean;
            isMcSiteLocal: boolean;
            is_multicast: boolean;
            isMulticast: boolean;
            is_site_local: boolean;
            isSiteLocal: boolean;
            scope_id: number;
            scopeId: number;
        }
    }

    class InetAddress extends GObject.Object {
        static $gtype: GObject.GType<InetAddress>;

        // Properties
        get bytes(): null;

        get family(): SocketFamily;

        get flowinfo(): number;

        get is_any(): boolean;

        get isAny(): boolean;

        get is_link_local(): boolean;

        get isLinkLocal(): boolean;

        get is_loopback(): boolean;

        get isLoopback(): boolean;

        get is_mc_global(): boolean;

        get isMcGlobal(): boolean;

        get is_mc_link_local(): boolean;

        get isMcLinkLocal(): boolean;

        get is_mc_node_local(): boolean;

        get isMcNodeLocal(): boolean;

        get is_mc_org_local(): boolean;

        get isMcOrgLocal(): boolean;

        get is_mc_site_local(): boolean;

        get isMcSiteLocal(): boolean;

        get is_multicast(): boolean;

        get isMulticast(): boolean;

        get is_site_local(): boolean;

        get isSiteLocal(): boolean;

        get scope_id(): number;

        get scopeId(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: InetAddress.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<InetAddress.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_any(family: SocketFamily): InetAddress;

        static new_from_bytes(bytes: Uint8Array | string, family: SocketFamily): InetAddress;

        static new_from_bytes_with_ipv6_info(bytes: Uint8Array | string, family: SocketFamily, flowinfo: number, scope_id: number): InetAddress;

        static new_from_string(string: string): InetAddress;

        static new_loopback(family: SocketFamily): InetAddress;

        // Signals
        /** @signal */
        connect<K extends keyof InetAddress.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InetAddress.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof InetAddress.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InetAddress.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof InetAddress.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<InetAddress.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_to_string(): string;

        // Methods
        equal(other_address: InetAddress): boolean;

        get_family(): SocketFamily;

        get_flowinfo(): number;

        get_is_any(): boolean;

        get_is_link_local(): boolean;

        get_is_loopback(): boolean;

        get_is_mc_global(): boolean;

        get_is_mc_link_local(): boolean;

        get_is_mc_node_local(): boolean;

        get_is_mc_org_local(): boolean;

        get_is_mc_site_local(): boolean;

        get_is_multicast(): boolean;

        get_is_site_local(): boolean;

        get_native_size(): number;

        get_scope_id(): number;

        to_string(): string;
    }


    namespace InetAddressMask {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::address": (pspec: GObject.ParamSpec) => void;
            "notify::family": (pspec: GObject.ParamSpec) => void;
            "notify::length": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Initable.ConstructorProps {
            address: InetAddress;
            family: SocketFamily;
            length: number;
        }
    }

    class InetAddressMask extends GObject.Object implements Initable {
        static $gtype: GObject.GType<InetAddressMask>;

        // Properties
        get address(): InetAddress;
        set address(val: InetAddress);

        get family(): SocketFamily;

        get length(): number;
        set length(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: InetAddressMask.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<InetAddressMask.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](addr: InetAddress, length: number): InetAddressMask;

        static new_from_string(mask_string: string): InetAddressMask;

        // Signals
        /** @signal */
        connect<K extends keyof InetAddressMask.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InetAddressMask.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof InetAddressMask.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InetAddressMask.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof InetAddressMask.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<InetAddressMask.SignalSignatures[K]>): void;

        // Methods
        equal(mask2: InetAddressMask): boolean;

        get_address(): InetAddress;

        get_family(): SocketFamily;

        get_length(): number;

        matches(address: InetAddress): boolean;

        to_string(): string;

        init(cancellable: Cancellable | null): boolean;

        vfunc_init(cancellable: Cancellable | null): boolean;
    }


    namespace InetSocketAddress {
        // Signal signatures
        interface SignalSignatures extends SocketAddress.SignalSignatures {
            "notify::address": (pspec: GObject.ParamSpec) => void;
            "notify::flowinfo": (pspec: GObject.ParamSpec) => void;
            "notify::port": (pspec: GObject.ParamSpec) => void;
            "notify::scope-id": (pspec: GObject.ParamSpec) => void;
            "notify::family": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends SocketAddress.ConstructorProps, SocketConnectable.ConstructorProps {
            address: InetAddress;
            flowinfo: number;
            port: number;
            scope_id: number;
            scopeId: number;
        }
    }

    class InetSocketAddress extends SocketAddress implements SocketConnectable {
        static $gtype: GObject.GType<InetSocketAddress>;

        // Properties
        get address(): InetAddress;

        get flowinfo(): number;

        get port(): number;

        get scope_id(): number;

        get scopeId(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: InetSocketAddress.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<InetSocketAddress.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](address: InetAddress, port: number): InetSocketAddress;

        static new_from_string(address: string, port: number): InetSocketAddress;

        // Signals
        /** @signal */
        connect<K extends keyof InetSocketAddress.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InetSocketAddress.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof InetSocketAddress.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InetSocketAddress.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof InetSocketAddress.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<InetSocketAddress.SignalSignatures[K]>): void;

        // Methods
        get_address(): InetAddress;

        get_flowinfo(): number;

        get_port(): number;

        get_scope_id(): number;

        enumerate(): SocketAddressEnumerator;

        proxy_enumerate(): SocketAddressEnumerator;

        to_string(): string;

        vfunc_enumerate(): SocketAddressEnumerator;

        vfunc_proxy_enumerate(): SocketAddressEnumerator;

        vfunc_to_string(): string;
    }


    namespace InputStream {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class InputStream extends GObject.Object {
        static $gtype: GObject.GType<InputStream>;

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

        // Signals
        /** @signal */
        connect<K extends keyof InputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof InputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof InputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<InputStream.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_close_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_close_finish(result: AsyncResult): boolean;

        vfunc_close_fn(cancellable: Cancellable | null): boolean;

        vfunc_read_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): Uint8Array | string | null;

        vfunc_read_finish(result: AsyncResult): bigint | number;

        vfunc_read_fn(buffer: null, count: number, cancellable: Cancellable | null): bigint | number;

        vfunc_skip(count: number, cancellable: Cancellable | null): bigint | number;

        vfunc_skip_async(count: number, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_skip_finish(result: AsyncResult): bigint | number;

        // Methods
        clear_pending(): void;

        close(cancellable: Cancellable | null): boolean;

        close_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        close_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        close_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        close_finish(result: AsyncResult): boolean;

        has_pending(): boolean;

        is_closed(): boolean;

        read(cancellable: Cancellable | null): [number, Uint8Array];

        read_all(cancellable: Cancellable | null): [boolean, Uint8Array, number];

        read_all_async(io_priority: number, cancellable: Cancellable | null): [globalThis.Promise<number>, Uint8Array];

        read_all_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): Uint8Array;

        read_all_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): [globalThis.Promise<number> | void, Uint8Array];

        read_all_finish(result: AsyncResult): [boolean, number];

        read_async(io_priority: number, cancellable: Cancellable | null): [globalThis.Promise<number>, Uint8Array];

        read_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): Uint8Array;

        read_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): [globalThis.Promise<number> | void, Uint8Array];

        read_bytes(count: bigint | number, cancellable: Cancellable | null): GLib.Bytes;

        read_bytes_async(count: bigint | number, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<GLib.Bytes>;

        read_bytes_async(count: bigint | number, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        read_bytes_async(count: bigint | number, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<GLib.Bytes> | void;

        read_bytes_finish(result: AsyncResult): GLib.Bytes;

        read_finish(result: AsyncResult): number;

        set_pending(): boolean;

        skip(count: bigint | number, cancellable: Cancellable | null): number;

        skip_async(count: bigint | number, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<number>;

        skip_async(count: bigint | number, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        skip_async(count: bigint | number, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<number> | void;

        skip_finish(result: AsyncResult): number;

        createAsyncIterator(count?: number, priority?: number): AsyncIterableIterator<GLib.Bytes>;

        createSyncIterator(count?: number, priority?: number): IterableIterator<GLib.Bytes>;
    }


    namespace ListStore {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, ListModel.SignalSignatures {
            "notify::item-type": (pspec: GObject.ParamSpec) => void;
            "notify::n-items": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps<A extends GObject.Object = GObject.Object> extends GObject.Object.ConstructorProps, ListModel.ConstructorProps {
            item_type: GObject.GTypeInput;
            itemType: GObject.GTypeInput;
            n_items: number;
            nItems: number;
        }
    }

    class ListStore<A extends GObject.Object = GObject.Object> extends GObject.Object implements ListModel<A> {
        static $gtype: GObject.GType<ListStore>;

        // Properties
        get item_type(): GObject.GType;

        get itemType(): GObject.GType;

        get n_items(): number;

        get nItems(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ListStore.SignalSignatures;

        // Fields
        [Symbol.iterator]: (() => IterableIterator<A>);

        // Constructors
        constructor(properties?: Partial<ListStore.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](item_type: GObject.GType): ListStore;

        // Signals
        /** @signal */
        connect<K extends keyof ListStore.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ListStore.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ListStore.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ListStore.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ListStore.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ListStore.SignalSignatures[K]>): void;

        // Methods
        append(item: A): void;

        find(item: A): [boolean, number];

        find_with_equal_func(item: A | null, equal_func: GLib.EqualFunc): [boolean, number];

        find_with_equal_func_full(item: A | null, equal_func: GLib.EqualFuncFull): [boolean, number];

        insert(position: number, item: A): void;

        insert_sorted(item: A, compare_func: GLib.CompareDataFunc): number;

        remove(position: number): void;

        remove_all(): void;

        sort(compare_func: GLib.CompareDataFunc): void;

        splice(position: number, n_removals: number, additions: A[]): void;

        get_item_type(): GObject.GType;

        get_n_items(): number;

        get_item(position: number): A | null;

        items_changed(position: number, removed: number, added: number): void;

        vfunc_get_item(position: number): A | null;

        vfunc_get_item_type(): GObject.GType;

        vfunc_get_n_items(): number;
    }


    namespace MemoryInputStream {
        // Signal signatures
        interface SignalSignatures extends InputStream.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends InputStream.ConstructorProps, PollableInputStream.ConstructorProps, Seekable.ConstructorProps {}
    }

    class MemoryInputStream extends InputStream implements PollableInputStream, Seekable {
        static $gtype: GObject.GType<MemoryInputStream>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MemoryInputStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MemoryInputStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): MemoryInputStream;

        static new_from_bytes(bytes: GLib.Bytes | Uint8Array): MemoryInputStream;

        static new_from_data(data: Uint8Array | string): MemoryInputStream;

        // Signals
        /** @signal */
        connect<K extends keyof MemoryInputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MemoryInputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MemoryInputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MemoryInputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MemoryInputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MemoryInputStream.SignalSignatures[K]>): void;

        // Methods
        add_bytes(bytes: GLib.Bytes | Uint8Array): void;

        add_data(data: Uint8Array | string): void;

        can_poll(): boolean;

        create_source(cancellable: Cancellable | null): GLib.Source;

        is_readable(): boolean;

        read_nonblocking(cancellable: Cancellable | null): [number, Uint8Array];

        vfunc_can_poll(): boolean;

        vfunc_create_source(cancellable: Cancellable | null): GLib.Source;

        vfunc_is_readable(): boolean;

        vfunc_read_nonblocking(): [bigint | number, Uint8Array | string | null];

        can_seek(): boolean;

        can_truncate(): boolean;

        seek(offset: bigint | number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        tell(): number;

        truncate(offset: bigint | number, cancellable: Cancellable | null): boolean;

        vfunc_can_seek(): boolean;

        vfunc_can_truncate(): boolean;

        vfunc_seek(offset: number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        vfunc_tell(): bigint | number;

        vfunc_truncate_fn(offset: number, cancellable: Cancellable | null): boolean;
    }


    namespace MemoryOutputStream {
        // Signal signatures
        interface SignalSignatures extends OutputStream.SignalSignatures {
            "notify::data": (pspec: GObject.ParamSpec) => void;
            "notify::data-size": (pspec: GObject.ParamSpec) => void;
            "notify::size": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends OutputStream.ConstructorProps, PollableOutputStream.ConstructorProps, Seekable.ConstructorProps {
            data: never;
            data_size: bigint | number;
            dataSize: bigint | number;
            size: bigint | number;
        }
    }

    class MemoryOutputStream extends OutputStream implements PollableOutputStream, Seekable {
        static $gtype: GObject.GType<MemoryOutputStream>;

        // Properties
        get data(): null;

        get data_size(): number;

        get dataSize(): number;

        get size(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MemoryOutputStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MemoryOutputStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_resizable(): MemoryOutputStream;

        // Signals
        /** @signal */
        connect<K extends keyof MemoryOutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MemoryOutputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MemoryOutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MemoryOutputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MemoryOutputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MemoryOutputStream.SignalSignatures[K]>): void;

        // Methods
        get_data(): null;

        get_data_size(): number;

        get_size(): number;

        steal_as_bytes(): GLib.Bytes;

        steal_data(): null;

        can_poll(): boolean;

        create_source(cancellable: Cancellable | null): GLib.Source;

        is_writable(): boolean;

        write_nonblocking(buffer: Uint8Array | string, cancellable: Cancellable | null): number;

        writev_nonblocking(vectors: OutputVector[], cancellable: Cancellable | null): [PollableReturn, number];

        vfunc_can_poll(): boolean;

        vfunc_create_source(cancellable: Cancellable | null): GLib.Source;

        vfunc_is_writable(): boolean;

        vfunc_write_nonblocking(buffer: Uint8Array | null): bigint | number;

        vfunc_writev_nonblocking(vectors: OutputVector[]): [PollableReturn, bigint | number];

        can_seek(): boolean;

        can_truncate(): boolean;

        seek(offset: bigint | number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        tell(): number;

        truncate(offset: bigint | number, cancellable: Cancellable | null): boolean;

        vfunc_can_seek(): boolean;

        vfunc_can_truncate(): boolean;

        vfunc_seek(offset: number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        vfunc_tell(): bigint | number;

        vfunc_truncate_fn(offset: number, cancellable: Cancellable | null): boolean;
    }


    namespace Menu {
        // Signal signatures
        interface SignalSignatures extends MenuModel.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends MenuModel.ConstructorProps {}
    }

    class Menu extends MenuModel {
        static $gtype: GObject.GType<Menu>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Menu.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Menu.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Menu;

        // Signals
        /** @signal */
        connect<K extends keyof Menu.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Menu.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Menu.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Menu.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Menu.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Menu.SignalSignatures[K]>): void;

        // Methods
        append(label: string | null, detailed_action: string | null): void;

        append_item(item: MenuItem): void;

        append_section(label: string | null, section: MenuModel): void;

        append_submenu(label: string | null, submenu: MenuModel): void;

        freeze(): void;

        insert(position: number, label: string | null, detailed_action: string | null): void;

        insert_item(position: number, item: MenuItem): void;

        insert_section(position: number, label: string | null, section: MenuModel): void;

        insert_submenu(position: number, label: string | null, submenu: MenuModel): void;

        prepend(label: string | null, detailed_action: string | null): void;

        prepend_item(item: MenuItem): void;

        prepend_section(label: string | null, section: MenuModel): void;

        prepend_submenu(label: string | null, submenu: MenuModel): void;

        remove(position: number): void;

        remove_all(): void;
    }


    namespace MenuAttributeIter {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class MenuAttributeIter extends GObject.Object {
        static $gtype: GObject.GType<MenuAttributeIter>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MenuAttributeIter.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MenuAttributeIter.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof MenuAttributeIter.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MenuAttributeIter.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MenuAttributeIter.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MenuAttributeIter.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MenuAttributeIter.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MenuAttributeIter.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_next(): [boolean, string, GLib.Variant | null];

        // Methods
        get_name(): string;

        get_next(): [boolean, string, GLib.Variant | null];

        get_value(): GLib.Variant;

        next(): boolean;
    }


    namespace MenuItem {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class MenuItem extends GObject.Object {
        static $gtype: GObject.GType<MenuItem>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MenuItem.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MenuItem.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](label: string | null, detailed_action: string | null): MenuItem;

        static new_from_model(model: MenuModel, item_index: number): MenuItem;

        static new_section(label: string | null, section: MenuModel): MenuItem;

        static new_submenu(label: string | null, submenu: MenuModel): MenuItem;

        // Signals
        /** @signal */
        connect<K extends keyof MenuItem.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MenuItem.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MenuItem.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MenuItem.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MenuItem.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MenuItem.SignalSignatures[K]>): void;

        // Methods
        get_attribute_value(attribute: string, expected_type: GLib.VariantType | null): GLib.Variant | null;

        get_link(link: string): MenuModel | null;

        set_action_and_target_value(action: string | null, target_value: GLib.Variant | null): void;

        set_attribute_value(attribute: string, value: GLib.Variant | null): void;

        set_detailed_action(detailed_action: string): void;

        set_icon(icon: Icon): void;

        set_label(label: string | null): void;

        set_link(link: string, model: MenuModel | null): void;

        set_section(section: MenuModel | null): void;

        set_submenu(submenu: MenuModel | null): void;
    }


    namespace MenuLinkIter {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class MenuLinkIter extends GObject.Object {
        static $gtype: GObject.GType<MenuLinkIter>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MenuLinkIter.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MenuLinkIter.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof MenuLinkIter.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MenuLinkIter.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MenuLinkIter.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MenuLinkIter.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MenuLinkIter.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MenuLinkIter.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_next(): [boolean, string, MenuModel | null];

        // Methods
        get_name(): string;

        get_next(): [boolean, string, MenuModel | null];

        get_value(): MenuModel;

        next(): boolean;
    }


    namespace MenuModel {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "items-changed": (position: number, removed: number, added: number) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class MenuModel extends GObject.Object {
        static $gtype: GObject.GType<MenuModel>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MenuModel.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MenuModel.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof MenuModel.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MenuModel.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MenuModel.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MenuModel.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MenuModel.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MenuModel.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_item_attribute_value(item_index: number, attribute: string, expected_type: GLib.VariantType | null): GLib.Variant | null;

        vfunc_get_item_attributes(item_index: number): { [key: string]: GLib.Variant };

        vfunc_get_item_link(item_index: number, link: string): MenuModel | null;

        vfunc_get_item_links(item_index: number): { [key: string]: MenuModel };

        vfunc_get_n_items(): number;

        vfunc_is_mutable(): boolean;

        vfunc_iterate_item_attributes(item_index: number): MenuAttributeIter;

        vfunc_iterate_item_links(item_index: number): MenuLinkIter;

        // Methods
        get_item_attribute_value(item_index: number, attribute: string, expected_type: GLib.VariantType | null): GLib.Variant | null;

        get_item_link(item_index: number, link: string): MenuModel | null;

        get_n_items(): number;

        is_mutable(): boolean;

        items_changed(position: number, removed: number, added: number): void;

        iterate_item_attributes(item_index: number): MenuAttributeIter;

        iterate_item_links(item_index: number): MenuLinkIter;
    }


    namespace MountOperation {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            aborted: () => void;
            /** @signal */
            "ask-password": (message: string, default_user: string, default_domain: string, flags: AskPasswordFlags) => void;
            /** @signal */
            "ask-question": (message: string, choices: string[]) => void;
            /** @signal */
            reply: (result: MountOperationResult) => void;
            /** @signal */
            "show-processes": (message: string, processes: GLib.Pid[], choices: string[]) => void;
            /** @signal */
            "show-unmount-progress": (message: string, time_left: number, bytes_left: number) => void;
            "notify::anonymous": (pspec: GObject.ParamSpec) => void;
            "notify::choice": (pspec: GObject.ParamSpec) => void;
            "notify::domain": (pspec: GObject.ParamSpec) => void;
            "notify::is-tcrypt-hidden-volume": (pspec: GObject.ParamSpec) => void;
            "notify::is-tcrypt-system-volume": (pspec: GObject.ParamSpec) => void;
            "notify::password": (pspec: GObject.ParamSpec) => void;
            "notify::password-save": (pspec: GObject.ParamSpec) => void;
            "notify::pim": (pspec: GObject.ParamSpec) => void;
            "notify::username": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            anonymous: boolean;
            choice: number;
            domain: string | null;
            is_tcrypt_hidden_volume: boolean;
            isTcryptHiddenVolume: boolean;
            is_tcrypt_system_volume: boolean;
            isTcryptSystemVolume: boolean;
            password: string | null;
            password_save: PasswordSave;
            passwordSave: PasswordSave;
            pim: number;
            username: string | null;
        }
    }

    class MountOperation extends GObject.Object {
        static $gtype: GObject.GType<MountOperation>;

        // Properties
        get anonymous(): boolean;
        set anonymous(val: boolean);

        get choice(): number;
        set choice(val: number);

        get domain(): string | null;
        set domain(val: string | null);

        get is_tcrypt_hidden_volume(): boolean;
        set is_tcrypt_hidden_volume(val: boolean);

        get isTcryptHiddenVolume(): boolean;
        set isTcryptHiddenVolume(val: boolean);

        get is_tcrypt_system_volume(): boolean;
        set is_tcrypt_system_volume(val: boolean);

        get isTcryptSystemVolume(): boolean;
        set isTcryptSystemVolume(val: boolean);

        get password(): string | null;
        set password(val: string | null);

        get password_save(): PasswordSave;
        set password_save(val: PasswordSave);

        get passwordSave(): PasswordSave;
        set passwordSave(val: PasswordSave);

        get pim(): number;
        set pim(val: number);

        get username(): string | null;
        set username(val: string | null);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MountOperation.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MountOperation.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): MountOperation;

        // Signals
        /** @signal */
        connect<K extends keyof MountOperation.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MountOperation.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MountOperation.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MountOperation.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MountOperation.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MountOperation.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_aborted(): void;

        vfunc_ask_password(message: string, default_user: string, default_domain: string, flags: AskPasswordFlags): void;

        vfunc_ask_question(message: string, choices: string[]): void;

        vfunc_reply(result: MountOperationResult): void;

        vfunc_show_processes(message: string, processes: GLib.Pid[], choices: string[]): void;

        vfunc_show_unmount_progress(message: string, time_left: number, bytes_left: number): void;

        // Methods
        get_anonymous(): boolean;

        get_choice(): number;

        get_domain(): string | null;

        get_is_tcrypt_hidden_volume(): boolean;

        get_is_tcrypt_system_volume(): boolean;

        get_password(): string | null;

        get_password_save(): PasswordSave;

        get_pim(): number;

        get_username(): string | null;

        reply(result: MountOperationResult): void;

        set_anonymous(anonymous: boolean): void;

        set_choice(choice: number): void;

        set_domain(domain: string | null): void;

        set_is_tcrypt_hidden_volume(hidden_volume: boolean): void;

        set_is_tcrypt_system_volume(system_volume: boolean): void;

        set_password(password: string | null): void;

        set_password_save(save: PasswordSave): void;

        set_pim(pim: number): void;

        set_username(username: string | null): void;
    }


    namespace NativeSocketAddress {
        // Signal signatures
        interface SignalSignatures extends SocketAddress.SignalSignatures {
            "notify::family": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends SocketAddress.ConstructorProps, SocketConnectable.ConstructorProps {}
    }

    class NativeSocketAddress extends SocketAddress implements SocketConnectable {
        static $gtype: GObject.GType<NativeSocketAddress>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: NativeSocketAddress.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<NativeSocketAddress.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](_native: null, len: bigint | number): NativeSocketAddress;

        // Signals
        /** @signal */
        connect<K extends keyof NativeSocketAddress.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NativeSocketAddress.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof NativeSocketAddress.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NativeSocketAddress.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof NativeSocketAddress.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<NativeSocketAddress.SignalSignatures[K]>): void;

        enumerate(): SocketAddressEnumerator;

        proxy_enumerate(): SocketAddressEnumerator;

        to_string(): string;

        vfunc_enumerate(): SocketAddressEnumerator;

        vfunc_proxy_enumerate(): SocketAddressEnumerator;

        vfunc_to_string(): string;
    }


    namespace NativeVolumeMonitor {
        // Signal signatures
        interface SignalSignatures extends VolumeMonitor.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends VolumeMonitor.ConstructorProps {}
    }

    abstract class NativeVolumeMonitor extends VolumeMonitor {
        static $gtype: GObject.GType<NativeVolumeMonitor>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: NativeVolumeMonitor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<NativeVolumeMonitor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof NativeVolumeMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NativeVolumeMonitor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof NativeVolumeMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NativeVolumeMonitor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof NativeVolumeMonitor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<NativeVolumeMonitor.SignalSignatures[K]>): void;
    }


    namespace NetworkAddress {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::hostname": (pspec: GObject.ParamSpec) => void;
            "notify::port": (pspec: GObject.ParamSpec) => void;
            "notify::scheme": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, SocketConnectable.ConstructorProps {
            hostname: string;
            port: number;
            scheme: string | null;
        }
    }

    class NetworkAddress extends GObject.Object implements SocketConnectable {
        static $gtype: GObject.GType<NetworkAddress>;

        // Properties
        get hostname(): string;

        get port(): number;

        get scheme(): string | null;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: NetworkAddress.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<NetworkAddress.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](hostname: string, port: number): NetworkAddress;

        static new_loopback(port: number): NetworkAddress;

        // Signals
        /** @signal */
        connect<K extends keyof NetworkAddress.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NetworkAddress.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof NetworkAddress.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NetworkAddress.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof NetworkAddress.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<NetworkAddress.SignalSignatures[K]>): void;

        // Static methods
        static parse(host_and_port: string, default_port: number): NetworkAddress;

        static parse_uri(uri: string, default_port: number): NetworkAddress;

        // Methods
        get_hostname(): string;

        get_port(): number;

        get_scheme(): string | null;

        enumerate(): SocketAddressEnumerator;

        proxy_enumerate(): SocketAddressEnumerator;

        to_string(): string;

        vfunc_enumerate(): SocketAddressEnumerator;

        vfunc_proxy_enumerate(): SocketAddressEnumerator;

        vfunc_to_string(): string;
    }


    namespace NetworkService {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::domain": (pspec: GObject.ParamSpec) => void;
            "notify::protocol": (pspec: GObject.ParamSpec) => void;
            "notify::scheme": (pspec: GObject.ParamSpec) => void;
            "notify::service": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, SocketConnectable.ConstructorProps {
            domain: string;
            protocol: string;
            scheme: string;
            service: string;
        }
    }

    class NetworkService extends GObject.Object implements SocketConnectable {
        static $gtype: GObject.GType<NetworkService>;

        // Properties
        get domain(): string;

        get protocol(): string;

        get scheme(): string;
        set scheme(val: string);

        get service(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: NetworkService.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<NetworkService.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](service: string, protocol: string, domain: string): NetworkService;

        // Signals
        /** @signal */
        connect<K extends keyof NetworkService.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NetworkService.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof NetworkService.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NetworkService.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof NetworkService.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<NetworkService.SignalSignatures[K]>): void;

        // Methods
        get_domain(): string;

        get_protocol(): string;

        get_scheme(): string;

        get_service(): string;

        set_scheme(scheme: string): void;

        enumerate(): SocketAddressEnumerator;

        proxy_enumerate(): SocketAddressEnumerator;

        to_string(): string;

        vfunc_enumerate(): SocketAddressEnumerator;

        vfunc_proxy_enumerate(): SocketAddressEnumerator;

        vfunc_to_string(): string;
    }


    namespace Notification {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Notification extends GObject.Object {
        static $gtype: GObject.GType<Notification>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Notification.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Notification.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](title: string): Notification;

        // Signals
        /** @signal */
        connect<K extends keyof Notification.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Notification.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Notification.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Notification.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Notification.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Notification.SignalSignatures[K]>): void;

        // Methods
        add_button(label: string, detailed_action: string): void;

        add_button_with_target(label: string, action: string, target: GLib.Variant | null): void;

        set_body(body: string | null): void;

        set_category(category: string | null): void;

        set_default_action(detailed_action: string): void;

        set_default_action_and_target(action: string, target: GLib.Variant | null): void;

        set_icon(icon: Icon): void;

        set_priority(priority: NotificationPriority): void;

        set_title(title: string): void;

        set_urgent(urgent: boolean): void;
    }


    namespace OutputStream {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class OutputStream extends GObject.Object {
        static $gtype: GObject.GType<OutputStream>;

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

        // Signals
        /** @signal */
        connect<K extends keyof OutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, OutputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof OutputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, OutputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof OutputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<OutputStream.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_close_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_close_finish(result: AsyncResult): boolean;

        vfunc_close_fn(cancellable: Cancellable | null): boolean;

        vfunc_flush(cancellable: Cancellable | null): boolean;

        vfunc_flush_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_flush_finish(result: AsyncResult): boolean;

        vfunc_splice(source: InputStream, flags: OutputStreamSpliceFlags, cancellable: Cancellable | null): bigint | number;

        vfunc_splice_async(source: InputStream, flags: OutputStreamSpliceFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_splice_finish(result: AsyncResult): bigint | number;

        vfunc_write_async(buffer: Uint8Array | null, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_write_finish(result: AsyncResult): bigint | number;

        vfunc_write_fn(buffer: Uint8Array | null, cancellable: Cancellable | null): bigint | number;

        vfunc_writev_async(vectors: OutputVector[], io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_writev_finish(result: AsyncResult): [boolean, bigint | number];

        vfunc_writev_fn(vectors: OutputVector[], cancellable: Cancellable | null): [boolean, bigint | number];

        // Methods
        clear_pending(): void;

        close(cancellable: Cancellable | null): boolean;

        close_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        close_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        close_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        close_finish(result: AsyncResult): boolean;

        flush(cancellable: Cancellable | null): boolean;

        flush_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        flush_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        flush_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        flush_finish(result: AsyncResult): boolean;

        has_pending(): boolean;

        is_closed(): boolean;

        is_closing(): boolean;

        set_pending(): boolean;

        splice(source: InputStream, flags: OutputStreamSpliceFlags, cancellable: Cancellable | null): number;

        splice_async(source: InputStream, flags: OutputStreamSpliceFlags, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<number>;

        splice_async(source: InputStream, flags: OutputStreamSpliceFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        splice_async(source: InputStream, flags: OutputStreamSpliceFlags, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<number> | void;

        splice_finish(result: AsyncResult): number;

        write(buffer: Uint8Array | string, cancellable: Cancellable | null): number;

        write_all(buffer: Uint8Array | string, cancellable: Cancellable | null): [boolean, number];

        write_all_async(buffer: Uint8Array | string, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<number>;

        write_all_async(buffer: Uint8Array | string, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        write_all_async(buffer: Uint8Array | string, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<number> | void;

        write_all_finish(result: AsyncResult): [boolean, number];

        write_async(buffer: Uint8Array | string, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<number>;

        write_async(buffer: Uint8Array | string, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        write_async(buffer: Uint8Array | string, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<number> | void;

        write_bytes(bytes: GLib.Bytes | Uint8Array, cancellable: Cancellable | null): number;

        write_bytes_async(bytes: GLib.Bytes | Uint8Array, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<number>;

        write_bytes_async(bytes: GLib.Bytes | Uint8Array, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        write_bytes_async(bytes: GLib.Bytes | Uint8Array, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<number> | void;

        write_bytes_finish(result: AsyncResult): number;

        write_finish(result: AsyncResult): number;

        writev(vectors: OutputVector[], cancellable: Cancellable | null): [boolean, number];

        writev_all(vectors: OutputVector[], cancellable: Cancellable | null): [boolean, number];

        writev_all_async(vectors: OutputVector[], io_priority: number, cancellable: Cancellable | null): globalThis.Promise<number>;

        writev_all_async(vectors: OutputVector[], io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        writev_all_async(vectors: OutputVector[], io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<number> | void;

        writev_all_finish(result: AsyncResult): [boolean, number];

        writev_async(vectors: OutputVector[], io_priority: number, cancellable: Cancellable | null): globalThis.Promise<number>;

        writev_async(vectors: OutputVector[], io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        writev_async(vectors: OutputVector[], io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<number> | void;

        writev_finish(result: AsyncResult): [boolean, number];
    }


    namespace Permission {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::allowed": (pspec: GObject.ParamSpec) => void;
            "notify::can-acquire": (pspec: GObject.ParamSpec) => void;
            "notify::can-release": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            allowed: boolean;
            can_acquire: boolean;
            canAcquire: boolean;
            can_release: boolean;
            canRelease: boolean;
        }
    }

    abstract class Permission extends GObject.Object {
        static $gtype: GObject.GType<Permission>;

        // Properties
        get allowed(): boolean;

        get can_acquire(): boolean;

        get canAcquire(): boolean;

        get can_release(): boolean;

        get canRelease(): boolean;

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

        // Signals
        /** @signal */
        connect<K extends keyof Permission.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Permission.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Permission.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Permission.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Permission.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Permission.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_acquire(cancellable: Cancellable | null): boolean;

        vfunc_acquire_async(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_acquire_finish(result: AsyncResult): boolean;

        vfunc_release(cancellable: Cancellable | null): boolean;

        vfunc_release_async(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_release_finish(result: AsyncResult): boolean;

        // Methods
        acquire(cancellable: Cancellable | null): boolean;

        acquire_async(cancellable: Cancellable | null): globalThis.Promise<boolean>;

        acquire_async(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        acquire_async(cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        acquire_finish(result: AsyncResult): boolean;

        get_allowed(): boolean;

        get_can_acquire(): boolean;

        get_can_release(): boolean;

        impl_update(allowed: boolean, can_acquire: boolean, can_release: boolean): void;

        release(cancellable: Cancellable | null): boolean;

        release_async(cancellable: Cancellable | null): globalThis.Promise<boolean>;

        release_async(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        release_async(cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        release_finish(result: AsyncResult): boolean;
    }


    namespace PropertyAction {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::invert-boolean": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::object": (pspec: GObject.ParamSpec) => void;
            "notify::parameter-type": (pspec: GObject.ParamSpec) => void;
            "notify::property-name": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-type": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Action.ConstructorProps {
            enabled: boolean;
            invert_boolean: boolean;
            invertBoolean: boolean;
            name: string;
            object: GObject.Object;
            parameter_type: GLib.VariantType | any;
            parameterType: GLib.VariantType | any;
            property_name: string;
            propertyName: string;
            state: GLib.Variant | any;
            state_type: GLib.VariantType | any;
            stateType: GLib.VariantType | any;
        }
    }

    class PropertyAction extends GObject.Object implements Action {
        static $gtype: GObject.GType<PropertyAction>;

        // Properties
        get enabled(): boolean;

        get invert_boolean(): boolean;

        get invertBoolean(): boolean;

        get name(): string;

        set object(val: GObject.Object);

    // This accessor conflicts with another accessor's type in a parent class or interface.
        get parameter_type(): GLib.VariantType | any;

    // This accessor conflicts with another accessor's type in a parent class or interface.
        get parameterType(): GLib.VariantType | any;

        set property_name(val: string);

        set propertyName(val: string);

    // This accessor conflicts with another accessor's type in a parent class or interface.
        get state(): GLib.Variant | any;

    // This accessor conflicts with another accessor's type in a parent class or interface.
        get state_type(): GLib.VariantType | any;

    // This accessor conflicts with another accessor's type in a parent class or interface.
        get stateType(): GLib.VariantType | any;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: PropertyAction.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<PropertyAction.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](name: string, object: GObject.Object, property_name: string): PropertyAction;

        // Signals
        /** @signal */
        connect<K extends keyof PropertyAction.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PropertyAction.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PropertyAction.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PropertyAction.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PropertyAction.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PropertyAction.SignalSignatures[K]>): void;

        activate(parameter: GLib.Variant | null): void;

        change_state(value: GLib.Variant): void;

        get_enabled(): boolean;

        get_name(): string;

        get_parameter_type(): GLib.VariantType | null;

        get_state(): GLib.Variant | null;

        get_state_hint(): GLib.Variant | null;

        get_state_type(): GLib.VariantType | null;

        vfunc_activate(parameter: GLib.Variant | null): void;

        vfunc_change_state(value: GLib.Variant): void;

        vfunc_get_enabled(): boolean;

        vfunc_get_name(): string;

        vfunc_get_parameter_type(): GLib.VariantType | null;

        vfunc_get_state(): GLib.Variant | null;

        vfunc_get_state_hint(): GLib.Variant | null;

        vfunc_get_state_type(): GLib.VariantType | null;
    }


    namespace ProxyAddress {
        // Signal signatures
        interface SignalSignatures extends InetSocketAddress.SignalSignatures {
            "notify::destination-hostname": (pspec: GObject.ParamSpec) => void;
            "notify::destination-port": (pspec: GObject.ParamSpec) => void;
            "notify::destination-protocol": (pspec: GObject.ParamSpec) => void;
            "notify::password": (pspec: GObject.ParamSpec) => void;
            "notify::protocol": (pspec: GObject.ParamSpec) => void;
            "notify::uri": (pspec: GObject.ParamSpec) => void;
            "notify::username": (pspec: GObject.ParamSpec) => void;
            "notify::address": (pspec: GObject.ParamSpec) => void;
            "notify::flowinfo": (pspec: GObject.ParamSpec) => void;
            "notify::port": (pspec: GObject.ParamSpec) => void;
            "notify::scope-id": (pspec: GObject.ParamSpec) => void;
            "notify::family": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends InetSocketAddress.ConstructorProps, SocketConnectable.ConstructorProps {
            destination_hostname: string;
            destinationHostname: string;
            destination_port: number;
            destinationPort: number;
            destination_protocol: string;
            destinationProtocol: string;
            password: string | null;
            protocol: string;
            uri: string | null;
            username: string | null;
        }
    }

    class ProxyAddress extends InetSocketAddress implements SocketConnectable {
        static $gtype: GObject.GType<ProxyAddress>;

        // Properties
        get destination_hostname(): string;

        get destinationHostname(): string;

        get destination_port(): number;

        get destinationPort(): number;

        get destination_protocol(): string;

        get destinationProtocol(): string;

        get password(): string | null;

        get protocol(): string;

        get uri(): string | null;

        get username(): string | null;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ProxyAddress.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ProxyAddress.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](inetaddr: InetAddress, port: number, protocol: string, dest_hostname: string, dest_port: number, username: string | null, password: string | null): ProxyAddress;

        // Conflicted with Gio.InetSocketAddress.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof ProxyAddress.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ProxyAddress.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ProxyAddress.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ProxyAddress.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ProxyAddress.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ProxyAddress.SignalSignatures[K]>): void;

        // Methods
        get_destination_hostname(): string;

        get_destination_port(): number;

        get_destination_protocol(): string;

        get_password(): string | null;

        get_protocol(): string;

        get_uri(): string | null;

        get_username(): string | null;
    }


    namespace ProxyAddressEnumerator {
        // Signal signatures
        interface SignalSignatures extends SocketAddressEnumerator.SignalSignatures {
            "notify::connectable": (pspec: GObject.ParamSpec) => void;
            "notify::default-port": (pspec: GObject.ParamSpec) => void;
            "notify::proxy-resolver": (pspec: GObject.ParamSpec) => void;
            "notify::uri": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends SocketAddressEnumerator.ConstructorProps {
            connectable: SocketConnectable;
            default_port: number;
            defaultPort: number;
            proxy_resolver: ProxyResolver;
            proxyResolver: ProxyResolver;
            uri: string;
        }
    }

    class ProxyAddressEnumerator extends SocketAddressEnumerator {
        static $gtype: GObject.GType<ProxyAddressEnumerator>;

        // Properties
        get connectable(): SocketConnectable;

        get default_port(): number;

        get defaultPort(): number;

        get proxy_resolver(): ProxyResolver;
        set proxy_resolver(val: ProxyResolver);

        get proxyResolver(): ProxyResolver;
        set proxyResolver(val: ProxyResolver);

        get uri(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ProxyAddressEnumerator.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ProxyAddressEnumerator.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ProxyAddressEnumerator.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ProxyAddressEnumerator.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ProxyAddressEnumerator.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ProxyAddressEnumerator.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ProxyAddressEnumerator.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ProxyAddressEnumerator.SignalSignatures[K]>): void;
    }


    namespace Resolver {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            reload: () => void;
            "notify::timeout": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            timeout: number;
        }
    }

    abstract class Resolver extends GObject.Object {
        static $gtype: GObject.GType<Resolver>;

        // Properties
        get timeout(): number;
        set timeout(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Resolver.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Resolver.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Resolver.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Resolver.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Resolver.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Resolver.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Resolver.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Resolver.SignalSignatures[K]>): void;

        // Static methods
        static get_default(): Resolver;

        // Virtual methods
        vfunc_lookup_by_address(address: InetAddress, cancellable: Cancellable | null): string;

        vfunc_lookup_by_address_async(address: InetAddress, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_lookup_by_address_finish(result: AsyncResult): string;

        vfunc_lookup_by_name(hostname: string, cancellable: Cancellable | null): InetAddress[];

        vfunc_lookup_by_name_async(hostname: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_lookup_by_name_finish(result: AsyncResult): InetAddress[];

        vfunc_lookup_by_name_with_flags(hostname: string, flags: ResolverNameLookupFlags, cancellable: Cancellable | null): InetAddress[];

        vfunc_lookup_by_name_with_flags_async(hostname: string, flags: ResolverNameLookupFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_lookup_by_name_with_flags_finish(result: AsyncResult): InetAddress[];

        vfunc_lookup_records(rrname: string, record_type: ResolverRecordType, cancellable: Cancellable | null): GLib.Variant[];

        vfunc_lookup_records_async(rrname: string, record_type: ResolverRecordType, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_lookup_records_finish(result: AsyncResult): GLib.Variant[];

        vfunc_lookup_service_async(rrname: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_lookup_service_finish(result: AsyncResult): SrvTarget[];

        vfunc_reload(): void;

        // Methods
        get_timeout(): number;

        lookup_by_address(address: InetAddress, cancellable: Cancellable | null): string;

        lookup_by_address_async(address: InetAddress, cancellable: Cancellable | null): globalThis.Promise<string>;

        lookup_by_address_async(address: InetAddress, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        lookup_by_address_async(address: InetAddress, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<string> | void;

        lookup_by_address_finish(result: AsyncResult): string;

        lookup_by_name(hostname: string, cancellable: Cancellable | null): InetAddress[];

        lookup_by_name_async(hostname: string, cancellable: Cancellable | null): globalThis.Promise<InetAddress[]>;

        lookup_by_name_async(hostname: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        lookup_by_name_async(hostname: string, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<InetAddress[]> | void;

        lookup_by_name_finish(result: AsyncResult): InetAddress[];

        lookup_by_name_with_flags(hostname: string, flags: ResolverNameLookupFlags, cancellable: Cancellable | null): InetAddress[];

        lookup_by_name_with_flags_async(hostname: string, flags: ResolverNameLookupFlags, cancellable: Cancellable | null): globalThis.Promise<InetAddress[]>;

        lookup_by_name_with_flags_async(hostname: string, flags: ResolverNameLookupFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        lookup_by_name_with_flags_async(hostname: string, flags: ResolverNameLookupFlags, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<InetAddress[]> | void;

        lookup_by_name_with_flags_finish(result: AsyncResult): InetAddress[];

        lookup_records(rrname: string, record_type: ResolverRecordType, cancellable: Cancellable | null): GLib.Variant[];

        lookup_records_async(rrname: string, record_type: ResolverRecordType, cancellable: Cancellable | null): globalThis.Promise<GLib.Variant[]>;

        lookup_records_async(rrname: string, record_type: ResolverRecordType, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        lookup_records_async(rrname: string, record_type: ResolverRecordType, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<GLib.Variant[]> | void;

        lookup_records_finish(result: AsyncResult): GLib.Variant[];

        lookup_service(service: string, protocol: string, domain: string, cancellable: Cancellable | null): SrvTarget[];

        lookup_service_async(service: string, protocol: string, domain: string, cancellable: Cancellable | null): globalThis.Promise<SrvTarget[]>;

        lookup_service_async(service: string, protocol: string, domain: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        lookup_service_async(service: string, protocol: string, domain: string, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<SrvTarget[]> | void;

        lookup_service_finish(result: AsyncResult): SrvTarget[];

        set_default(): void;

        set_timeout(timeout_ms: number): void;
    }


    namespace Settings {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "change-event": (keys: GLib.Quark[] | null) => boolean | void;
            /** @signal */
            changed: (key: string) => void;
            /** @signal */
            "writable-change-event": (key: number) => boolean | void;
            /** @signal */
            "writable-changed": (key: string) => void;
            "notify::backend": (pspec: GObject.ParamSpec) => void;
            "notify::delay-apply": (pspec: GObject.ParamSpec) => void;
            "notify::has-unapplied": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::schema": (pspec: GObject.ParamSpec) => void;
            "notify::schema-id": (pspec: GObject.ParamSpec) => void;
            "notify::settings-schema": (pspec: GObject.ParamSpec) => void;
            /** @signal */
            "changed::backend": (key: string) => void;
            /** @signal */
            "changed::delay-apply": (key: string) => void;
            /** @signal */
            "changed::has-unapplied": (key: string) => void;
            /** @signal */
            "changed::path": (key: string) => void;
            /** @signal */
            "changed::schema": (key: string) => void;
            /** @signal */
            "changed::schema-id": (key: string) => void;
            /** @signal */
            "changed::settings-schema": (key: string) => void;
            [key: `changed::${string}`]: (key: string) => void;
            /** @signal */
            "writable-changed::backend": (key: string) => void;
            /** @signal */
            "writable-changed::delay-apply": (key: string) => void;
            /** @signal */
            "writable-changed::has-unapplied": (key: string) => void;
            /** @signal */
            "writable-changed::path": (key: string) => void;
            /** @signal */
            "writable-changed::schema": (key: string) => void;
            /** @signal */
            "writable-changed::schema-id": (key: string) => void;
            /** @signal */
            "writable-changed::settings-schema": (key: string) => void;
            [key: `writable-changed::${string}`]: (key: string) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            backend: SettingsBackend;
            delay_apply: boolean;
            delayApply: boolean;
            has_unapplied: boolean;
            hasUnapplied: boolean;
            path: string;
            schema: string;
            schema_id: string;
            schemaId: string;
            settings_schema: SettingsSchema;
            settingsSchema: SettingsSchema;
        }
    }

    class Settings extends GObject.Object {
        static $gtype: GObject.GType<Settings>;

        // Properties
        get backend(): SettingsBackend;

        get delay_apply(): boolean;

        get delayApply(): boolean;

        get has_unapplied(): boolean;

        get hasUnapplied(): boolean;

        get path(): string;

        get schema(): string;

        get schema_id(): string;

        get schemaId(): string;

        get settings_schema(): SettingsSchema;

        get settingsSchema(): SettingsSchema;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Settings.SignalSignatures;

        // Fields
        _realInit: (...args: any[]) => any;

        _realMethods: typeof Settings.prototype;

        _keys: string[];

        _children: string[];

        // Constructors
        constructor(properties?: Partial<Settings.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](schema_id: string): Settings;

        static new_full(schema: SettingsSchema, backend: SettingsBackend | null, path: string | null): Settings;

        static new_with_backend(schema_id: string, backend: SettingsBackend): Settings;

        static new_with_backend_and_path(schema_id: string, backend: SettingsBackend, path: string): Settings;

        static new_with_path(schema_id: string, path: string): Settings;

        // Signals
        /** @signal */
        connect<K extends keyof Settings.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Settings.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Settings.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Settings.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Settings.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Settings.SignalSignatures[K]>): void;

        // Static methods
        static list_relocatable_schemas(): string[];

        static list_schemas(): string[];

        static sync(): void;

        static unbind(object: GObject.Object, property: string): void;

        // Virtual methods
        vfunc_change_event(keys: GLib.Quark, n_keys: number): boolean;

        vfunc_changed(key: string): void;

        vfunc_writable_change_event(key: GLib.Quark): boolean;

        vfunc_writable_changed(key: string): void;

        // Methods
        apply(): void;

        bind(key: string, object: GObject.Object, property: string, flags: SettingsBindFlags): void;

        bind_with_mapping(key: string, object: GObject.Object, property: string, flags: SettingsBindFlags, get_mapping: GObject.Closure | null, set_mapping: GObject.Closure | null): void;

        bind_writable(key: string, object: GObject.Object, property: string, inverted: boolean): void;

        create_action(key: string): Action;

        delay(): void;

        get_boolean(key: string): boolean;

        get_child(name: string): Settings;

        get_default_value<T extends string = any>(key: string): GLib.Variant<T> | null;

        get_double(key: string): number;

        get_enum(key: string): number;

        get_flags(key: string): number;

        get_has_unapplied(): boolean;

        get_int(key: string): number;

        get_int64(key: string): number;

        get_mapped(key: string, mapping: SettingsGetMapping): null;

        get_range(key: string): GLib.Variant;

        get_string(key: string): string;

        get_strv(key: string): string[];

        get_uint(key: string): number;

        get_uint64(key: string): number;

        get_user_value<T extends string = any>(key: string): GLib.Variant<T> | null;

        get_value<T extends string = any>(key: string): GLib.Variant<T>;

        is_writable(name: string): boolean;

        list_children(): string[];

        list_keys(): string[];

        range_check(key: string, value: GLib.Variant): boolean;

        reset(key: string): void;

        revert(): void;

        set_boolean(key: string, value: boolean): boolean;

        set_double(key: string, value: number): boolean;

        set_enum(key: string, value: number): boolean;

        set_flags(key: string, value: number): boolean;

        set_int(key: string, value: number): boolean;

        set_int64(key: string, value: bigint | number): boolean;

        set_string(key: string, value: string): boolean;

        set_strv(key: string, value: string[] | null): boolean;

        set_uint(key: string, value: number): boolean;

        set_uint64(key: string, value: bigint | number): boolean;

        set_value(key: string, value: GLib.Variant): boolean;
    }


    namespace SettingsBackend {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class SettingsBackend extends GObject.Object {
        static $gtype: GObject.GType<SettingsBackend>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SettingsBackend.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SettingsBackend.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof SettingsBackend.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingsBackend.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SettingsBackend.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SettingsBackend.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SettingsBackend.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SettingsBackend.SignalSignatures[K]>): void;

        // Static methods
        static flatten_tree(tree: GLib.Tree): [string, string[], GLib.Variant[] | null];

        static get_default(): SettingsBackend;

        // Virtual methods
        vfunc_get_writable(key: string): boolean;

        vfunc_read(key: string, expected_type: GLib.VariantType, default_value: boolean): GLib.Variant;

        vfunc_read_user_value(key: string, expected_type: GLib.VariantType): GLib.Variant;

        vfunc_reset(key: string, origin_tag: null): void;

        vfunc_subscribe(name: string): void;

        vfunc_sync(): void;

        vfunc_unsubscribe(name: string): void;

        vfunc_write(key: string, value: GLib.Variant, origin_tag: null): boolean;

        vfunc_write_tree(tree: GLib.Tree, origin_tag: null): boolean;

        // Methods
        changed(key: string, origin_tag: null): void;

        changed_tree(tree: GLib.Tree, origin_tag: null): void;

        keys_changed(path: string, items: string[], origin_tag: null): void;

        path_changed(path: string, origin_tag: null): void;

        path_writable_changed(path: string): void;

        writable_changed(key: string): void;
    }


    namespace SimpleAction {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            activate: (parameter: GLib.Variant | null) => void;
            /** @signal */
            "change-state": (value: GLib.Variant | null) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parameter-type": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::state-type": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Action.ConstructorProps {
            enabled: boolean;
            name: string;
            parameter_type: GLib.VariantType | any;
            parameterType: GLib.VariantType | any;
            state: GLib.Variant | any;
            state_type: GLib.VariantType | any;
            stateType: GLib.VariantType | any;
        }
    }

    class SimpleAction extends GObject.Object implements Action {
        static $gtype: GObject.GType<SimpleAction>;

        // Properties
        get enabled(): boolean;
        set enabled(val: boolean);

        get name(): string;

    // This accessor conflicts with another accessor's type in a parent class or interface.
        get parameter_type(): GLib.VariantType | any;

    // This accessor conflicts with another accessor's type in a parent class or interface.
        get parameterType(): GLib.VariantType | any;

    // This accessor conflicts with another accessor's type in a parent class or interface.
        get state(): GLib.Variant | any;
    // This accessor conflicts with another accessor's type in a parent class or interface.
        set state(val: GLib.Variant | any);

    // This accessor conflicts with another accessor's type in a parent class or interface.
        get state_type(): GLib.VariantType | any;

    // This accessor conflicts with another accessor's type in a parent class or interface.
        get stateType(): GLib.VariantType | any;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SimpleAction.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SimpleAction.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](name: string, parameter_type: GLib.VariantType | null): SimpleAction;

        static new_stateful(name: string, parameter_type: GLib.VariantType | null, state: GLib.Variant): SimpleAction;

        // Signals
        /** @signal */
        connect<K extends keyof SimpleAction.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SimpleAction.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SimpleAction.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SimpleAction.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SimpleAction.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SimpleAction.SignalSignatures[K]>): void;

        // Methods
        set_enabled(enabled: boolean): void;

        set_state(value: GLib.Variant): void;

        set_state_hint(state_hint: GLib.Variant | null): void;

        activate(parameter: GLib.Variant | null): void;

        change_state(value: GLib.Variant): void;

        get_enabled(): boolean;

        get_name(): string;

        get_parameter_type(): GLib.VariantType | null;

        get_state(): GLib.Variant | null;

        get_state_hint(): GLib.Variant | null;

        get_state_type(): GLib.VariantType | null;

        vfunc_activate(parameter: GLib.Variant | null): void;

        vfunc_change_state(value: GLib.Variant): void;

        vfunc_get_enabled(): boolean;

        vfunc_get_name(): string;

        vfunc_get_parameter_type(): GLib.VariantType | null;

        vfunc_get_state(): GLib.Variant | null;

        vfunc_get_state_hint(): GLib.Variant | null;

        vfunc_get_state_type(): GLib.VariantType | null;
    }


    namespace SimpleActionGroup {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, ActionGroup.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, ActionGroup.ConstructorProps, ActionMap.ConstructorProps {}
    }

    class SimpleActionGroup extends GObject.Object implements ActionGroup, ActionMap {
        static $gtype: GObject.GType<SimpleActionGroup>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SimpleActionGroup.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SimpleActionGroup.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SimpleActionGroup;

        // Signals
        /** @signal */
        connect<K extends keyof SimpleActionGroup.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SimpleActionGroup.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SimpleActionGroup.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SimpleActionGroup.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SimpleActionGroup.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SimpleActionGroup.SignalSignatures[K]>): void;

        // Methods
        add_entries(entries: ActionEntry[], user_data: null): void;

        insert(action: Action): void;

        lookup(action_name: string): Action;

        remove(action_name: string): void;

        action_added(action_name: string): void;

        action_enabled_changed(action_name: string, enabled: boolean): void;

        action_removed(action_name: string): void;

        action_state_changed(action_name: string, state: GLib.Variant): void;

        activate_action(action_name: string, parameter: GLib.Variant | null): void;

        change_action_state(action_name: string, value: GLib.Variant): void;

        get_action_enabled(action_name: string): boolean;

        get_action_parameter_type(action_name: string): GLib.VariantType | null;

        get_action_state(action_name: string): GLib.Variant | null;

        get_action_state_hint(action_name: string): GLib.Variant | null;

        get_action_state_type(action_name: string): GLib.VariantType | null;

        has_action(action_name: string): boolean;

        list_actions(): string[];

        query_action(action_name: string): [boolean, boolean, GLib.VariantType | null, GLib.VariantType | null, GLib.Variant | null, GLib.Variant | null];

        vfunc_action_added(action_name: string): void;

        vfunc_action_enabled_changed(action_name: string, enabled: boolean): void;

        vfunc_action_removed(action_name: string): void;

        vfunc_action_state_changed(action_name: string, state: GLib.Variant): void;

        vfunc_activate_action(action_name: string, parameter: GLib.Variant | null): void;

        vfunc_change_action_state(action_name: string, value: GLib.Variant): void;

        vfunc_get_action_enabled(action_name: string): boolean;

        vfunc_get_action_parameter_type(action_name: string): GLib.VariantType | null;

        vfunc_get_action_state(action_name: string): GLib.Variant | null;

        vfunc_get_action_state_hint(action_name: string): GLib.Variant | null;

        vfunc_get_action_state_type(action_name: string): GLib.VariantType | null;

        vfunc_has_action(action_name: string): boolean;

        vfunc_list_actions(): string[];

        vfunc_query_action(action_name: string): [boolean, boolean, GLib.VariantType | null, GLib.VariantType | null, GLib.Variant | null, GLib.Variant | null];

        add_action(action: Action): void;

        add_action_entries(entries: ActionEntryObj[]): void;

        lookup_action(action_name: string): Action | null;

        remove_action(action_name: string): void;

        remove_action_entries(entries: ActionEntry[]): void;

        vfunc_add_action(action: Action): void;

        vfunc_lookup_action(action_name: string): Action | null;

        vfunc_remove_action(action_name: string): void;
    }


    namespace SimpleAsyncResult {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, AsyncResult.ConstructorProps {}
    }

    class SimpleAsyncResult extends GObject.Object implements AsyncResult {
        static $gtype: GObject.GType<SimpleAsyncResult>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SimpleAsyncResult.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SimpleAsyncResult.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](source_object: GObject.Object | null, callback: AsyncReadyCallback | null, source_tag: null): SimpleAsyncResult;

        static new_from_error(source_object: GObject.Object | null, callback: AsyncReadyCallback | null, error: GLib.Error): SimpleAsyncResult;

        // Signals
        /** @signal */
        connect<K extends keyof SimpleAsyncResult.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SimpleAsyncResult.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SimpleAsyncResult.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SimpleAsyncResult.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SimpleAsyncResult.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SimpleAsyncResult.SignalSignatures[K]>): void;

        // Static methods
        static is_valid(result: AsyncResult, source: GObject.Object | null, source_tag: null): boolean;

        // Methods
        complete(): void;

        complete_in_idle(): void;

        get_op_res_gboolean(): boolean;

        get_op_res_gssize(): number;

        propagate_error(): boolean;

        set_check_cancellable(check_cancellable: Cancellable | null): void;

        set_from_error(error: GLib.Error): void;

        set_handle_cancellation(handle_cancellation: boolean): void;

        set_op_res_gboolean(op_res: boolean): void;

        set_op_res_gssize(op_res: bigint | number): void;

        get_source_object<T = GObject.Object>(): T;

        get_user_data(): null;

        is_tagged(source_tag: null): boolean;

        legacy_propagate_error(): boolean;

        vfunc_get_source_object<T = GObject.Object>(): T;

        vfunc_get_user_data(): null;

        vfunc_is_tagged(source_tag: null): boolean;
    }


    namespace SimpleIOStream {
        // Signal signatures
        interface SignalSignatures extends IOStream.SignalSignatures {
            "notify::input-stream": (pspec: GObject.ParamSpec) => void;
            "notify::output-stream": (pspec: GObject.ParamSpec) => void;
            "notify::closed": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends IOStream.ConstructorProps {
            input_stream: InputStream;
            inputStream: InputStream;
            output_stream: OutputStream;
            outputStream: OutputStream;
        }
    }

    class SimpleIOStream extends IOStream {
        static $gtype: GObject.GType<SimpleIOStream>;

        // Properties
        get input_stream(): InputStream;

        get inputStream(): InputStream;

        get output_stream(): OutputStream;

        get outputStream(): OutputStream;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SimpleIOStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SimpleIOStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](input_stream: InputStream, output_stream: OutputStream): SimpleIOStream;

        // Signals
        /** @signal */
        connect<K extends keyof SimpleIOStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SimpleIOStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SimpleIOStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SimpleIOStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SimpleIOStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SimpleIOStream.SignalSignatures[K]>): void;
    }


    namespace SimplePermission {
        // Signal signatures
        interface SignalSignatures extends Permission.SignalSignatures {
            "notify::allowed": (pspec: GObject.ParamSpec) => void;
            "notify::can-acquire": (pspec: GObject.ParamSpec) => void;
            "notify::can-release": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Permission.ConstructorProps {}
    }

    class SimplePermission extends Permission {
        static $gtype: GObject.GType<SimplePermission>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SimplePermission.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SimplePermission.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](allowed: boolean): SimplePermission;

        // Signals
        /** @signal */
        connect<K extends keyof SimplePermission.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SimplePermission.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SimplePermission.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SimplePermission.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SimplePermission.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SimplePermission.SignalSignatures[K]>): void;
    }


    namespace SimpleProxyResolver {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::default-proxy": (pspec: GObject.ParamSpec) => void;
            "notify::ignore-hosts": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, ProxyResolver.ConstructorProps {
            default_proxy: string;
            defaultProxy: string;
            ignore_hosts: string[];
            ignoreHosts: string[];
        }
    }

    class SimpleProxyResolver extends GObject.Object implements ProxyResolver {
        static $gtype: GObject.GType<SimpleProxyResolver>;

        // Properties
        get default_proxy(): string;
        set default_proxy(val: string);

        get defaultProxy(): string;
        set defaultProxy(val: string);

        get ignore_hosts(): string[];
        set ignore_hosts(val: string[]);

        get ignoreHosts(): string[];
        set ignoreHosts(val: string[]);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SimpleProxyResolver.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SimpleProxyResolver.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof SimpleProxyResolver.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SimpleProxyResolver.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SimpleProxyResolver.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SimpleProxyResolver.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SimpleProxyResolver.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SimpleProxyResolver.SignalSignatures[K]>): void;

        // Static methods
        static ["new"](default_proxy: string | null, ignore_hosts: string[] | null): ProxyResolver;

        // Methods
        set_default_proxy(default_proxy: string | null): void;

        set_ignore_hosts(ignore_hosts: string[]): void;

        set_uri_proxy(uri_scheme: string, proxy: string): void;

        is_supported(): boolean;

        lookup(uri: string, cancellable: Cancellable | null): string[];

        lookup_async(uri: string, cancellable: Cancellable | null): globalThis.Promise<string[]>;

        lookup_async(uri: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        lookup_async(uri: string, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<string[]> | void;

        lookup_finish(result: AsyncResult): string[];

        vfunc_is_supported(): boolean;

        vfunc_lookup(uri: string, cancellable: Cancellable | null): string[];

        vfunc_lookup_async(uri: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_lookup_finish(result: AsyncResult): string[];
    }


    namespace Socket {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::blocking": (pspec: GObject.ParamSpec) => void;
            "notify::broadcast": (pspec: GObject.ParamSpec) => void;
            "notify::family": (pspec: GObject.ParamSpec) => void;
            "notify::fd": (pspec: GObject.ParamSpec) => void;
            "notify::keepalive": (pspec: GObject.ParamSpec) => void;
            "notify::listen-backlog": (pspec: GObject.ParamSpec) => void;
            "notify::local-address": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-loopback": (pspec: GObject.ParamSpec) => void;
            "notify::multicast-ttl": (pspec: GObject.ParamSpec) => void;
            "notify::protocol": (pspec: GObject.ParamSpec) => void;
            "notify::remote-address": (pspec: GObject.ParamSpec) => void;
            "notify::timeout": (pspec: GObject.ParamSpec) => void;
            "notify::ttl": (pspec: GObject.ParamSpec) => void;
            "notify::type": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, DatagramBased.ConstructorProps, Initable.ConstructorProps {
            blocking: boolean;
            broadcast: boolean;
            family: SocketFamily;
            fd: number;
            keepalive: boolean;
            listen_backlog: number;
            listenBacklog: number;
            local_address: SocketAddress;
            localAddress: SocketAddress;
            multicast_loopback: boolean;
            multicastLoopback: boolean;
            multicast_ttl: number;
            multicastTtl: number;
            protocol: SocketProtocol;
            remote_address: SocketAddress;
            remoteAddress: SocketAddress;
            timeout: number;
            ttl: number;
            type: SocketType;
        }
    }

    class Socket extends GObject.Object implements DatagramBased, Initable {
        static $gtype: GObject.GType<Socket>;

        // Properties
        get blocking(): boolean;
        set blocking(val: boolean);

        get broadcast(): boolean;
        set broadcast(val: boolean);

        get family(): SocketFamily;

        get fd(): number;

        get keepalive(): boolean;
        set keepalive(val: boolean);

        get listen_backlog(): number;
        set listen_backlog(val: number);

        get listenBacklog(): number;
        set listenBacklog(val: number);

        get local_address(): SocketAddress;

        get localAddress(): SocketAddress;

        get multicast_loopback(): boolean;
        set multicast_loopback(val: boolean);

        get multicastLoopback(): boolean;
        set multicastLoopback(val: boolean);

        get multicast_ttl(): number;
        set multicast_ttl(val: number);

        get multicastTtl(): number;
        set multicastTtl(val: number);

        get protocol(): SocketProtocol;

        get remote_address(): SocketAddress;

        get remoteAddress(): SocketAddress;

        get timeout(): number;
        set timeout(val: number);

        get ttl(): number;
        set ttl(val: number);

        get type(): SocketType;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Socket.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Socket.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](family: SocketFamily, type: SocketType, protocol: SocketProtocol): Socket;

        static new_from_fd(fd: number): Socket;

        // Signals
        /** @signal */
        connect<K extends keyof Socket.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Socket.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Socket.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Socket.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Socket.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Socket.SignalSignatures[K]>): void;

        // Methods
        accept(cancellable: Cancellable | null): Socket;

        bind(address: SocketAddress, allow_reuse: boolean): boolean;

        check_connect_result(): boolean;

        close(): boolean;

        condition_check(condition: GLib.IOCondition): GLib.IOCondition;

        condition_timed_wait(condition: GLib.IOCondition, timeout_us: bigint | number, cancellable: Cancellable | null): boolean;

        condition_wait(condition: GLib.IOCondition, cancellable: Cancellable | null): boolean;

    // Conflicted with Gio.DatagramBased.condition_wait
        condition_wait(...args: never[]): any;

        connect(address: SocketAddress, cancellable: Cancellable | null): boolean;

        connect(...args: never[]): any;

        connection_factory_create_connection(): SocketConnection;

        get_available_bytes(): number;

        get_blocking(): boolean;

        get_broadcast(): boolean;

        get_credentials(): Credentials;

        get_family(): SocketFamily;

        get_fd(): number;

        get_keepalive(): boolean;

        get_listen_backlog(): number;

        get_local_address(): SocketAddress;

        get_multicast_loopback(): boolean;

        get_multicast_ttl(): number;

        get_option(level: number, optname: number): [boolean, number];

        get_protocol(): SocketProtocol;

        get_remote_address(): SocketAddress;

        get_socket_type(): SocketType;

        get_timeout(): number;

        get_ttl(): number;

        is_closed(): boolean;

        is_connected(): boolean;

        join_multicast_group(group: InetAddress, source_specific: boolean, iface: string | null): boolean;

        join_multicast_group_ssm(group: InetAddress, source_specific: InetAddress | null, iface: string | null): boolean;

        leave_multicast_group(group: InetAddress, source_specific: boolean, iface: string | null): boolean;

        leave_multicast_group_ssm(group: InetAddress, source_specific: InetAddress | null, iface: string | null): boolean;

        listen(): boolean;

        receive(cancellable: Cancellable | null): [number, Uint8Array];

        receive_bytes(size: bigint | number, timeout_us: bigint | number, cancellable: Cancellable | null): GLib.Bytes;

        receive_bytes_from(size: bigint | number, timeout_us: bigint | number, cancellable: Cancellable | null): [GLib.Bytes, SocketAddress | null];

        receive_from(cancellable: Cancellable | null): [number, SocketAddress | null, Uint8Array];

        receive_message(vectors: InputVector[], flags: number, cancellable: Cancellable | null): [number, SocketAddress | null, SocketControlMessage[] | null, number];

        receive_messages(messages: InputMessage[], flags: number, cancellable: Cancellable | null): number;

    // Conflicted with Gio.DatagramBased.receive_messages
        receive_messages(...args: never[]): any;

        receive_with_blocking(blocking: boolean, cancellable: Cancellable | null): [number, Uint8Array];

        send(buffer: Uint8Array | string, cancellable: Cancellable | null): number;

        send_message(address: SocketAddress | null, vectors: OutputVector[], messages: SocketControlMessage[] | null, flags: number, cancellable: Cancellable | null): number;

        send_message_with_timeout(address: SocketAddress | null, vectors: OutputVector[], messages: SocketControlMessage[] | null, flags: number, timeout_us: bigint | number, cancellable: Cancellable | null): [PollableReturn, number];

        send_messages(messages: OutputMessage[], flags: number, cancellable: Cancellable | null): number;

    // Conflicted with Gio.DatagramBased.send_messages
        send_messages(...args: never[]): any;

        send_to(address: SocketAddress | null, buffer: Uint8Array | string, cancellable: Cancellable | null): number;

        send_with_blocking(buffer: Uint8Array | string, blocking: boolean, cancellable: Cancellable | null): number;

        set_blocking(blocking: boolean): void;

        set_broadcast(broadcast: boolean): void;

        set_keepalive(keepalive: boolean): void;

        set_listen_backlog(backlog: number): void;

        set_multicast_loopback(loopback: boolean): void;

        set_multicast_ttl(ttl: number): void;

        set_option(level: number, optname: number, value: number): boolean;

        set_timeout(timeout: number): void;

        set_ttl(ttl: number): void;

        shutdown(shutdown_read: boolean, shutdown_write: boolean): boolean;

        speaks_ipv4(): boolean;

        create_source(condition: GLib.IOCondition, cancellable: Cancellable | null): GLib.Source;

        vfunc_condition_check(condition: GLib.IOCondition): GLib.IOCondition;

        vfunc_condition_wait(condition: GLib.IOCondition, timeout: number, cancellable: Cancellable | null): boolean;

        vfunc_create_source(condition: GLib.IOCondition, cancellable: Cancellable | null): GLib.Source;

        vfunc_receive_messages(messages: InputMessage[], flags: number, timeout: number, cancellable: Cancellable | null): number;

        vfunc_send_messages(messages: OutputMessage[], flags: number, timeout: number, cancellable: Cancellable | null): number;

        init(cancellable: Cancellable | null): boolean;

        vfunc_init(cancellable: Cancellable | null): boolean;
    }


    namespace SocketAddress {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::family": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, SocketConnectable.ConstructorProps {
            family: SocketFamily;
        }
    }

    abstract class SocketAddress extends GObject.Object implements SocketConnectable {
        static $gtype: GObject.GType<SocketAddress>;

        // Properties
        get family(): SocketFamily;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SocketAddress.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SocketAddress.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_from_native(_native: never, len: bigint | number): SocketAddress;

        // Signals
        /** @signal */
        connect<K extends keyof SocketAddress.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SocketAddress.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SocketAddress.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SocketAddress.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SocketAddress.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SocketAddress.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_family(): SocketFamily;

        vfunc_get_native_size(): bigint | number;

        vfunc_to_native(dest: null, destlen: number): boolean;

        // Methods
        get_family(): SocketFamily;

        get_native_size(): number;

        to_native(dest: null, destlen: bigint | number): boolean;

        enumerate(): SocketAddressEnumerator;

        proxy_enumerate(): SocketAddressEnumerator;

        to_string(): string;

        vfunc_enumerate(): SocketAddressEnumerator;

        vfunc_proxy_enumerate(): SocketAddressEnumerator;

        vfunc_to_string(): string;
    }


    namespace SocketAddressEnumerator {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class SocketAddressEnumerator extends GObject.Object {
        static $gtype: GObject.GType<SocketAddressEnumerator>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SocketAddressEnumerator.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SocketAddressEnumerator.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof SocketAddressEnumerator.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SocketAddressEnumerator.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SocketAddressEnumerator.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SocketAddressEnumerator.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SocketAddressEnumerator.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SocketAddressEnumerator.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_next(cancellable: Cancellable | null): SocketAddress | null;

        vfunc_next_async(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_next_finish(result: AsyncResult): SocketAddress | null;

        // Methods
        next(cancellable: Cancellable | null): SocketAddress | null;

        next_async(cancellable: Cancellable | null): globalThis.Promise<SocketAddress | null>;

        next_async(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        next_async(cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<SocketAddress | null> | void;

        next_finish(result: AsyncResult): SocketAddress | null;
    }


    namespace SocketClient {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            event: (event: SocketClientEvent, connectable: SocketConnectable, connection: IOStream | null) => void;
            "notify::enable-proxy": (pspec: GObject.ParamSpec) => void;
            "notify::family": (pspec: GObject.ParamSpec) => void;
            "notify::local-address": (pspec: GObject.ParamSpec) => void;
            "notify::protocol": (pspec: GObject.ParamSpec) => void;
            "notify::proxy-resolver": (pspec: GObject.ParamSpec) => void;
            "notify::timeout": (pspec: GObject.ParamSpec) => void;
            "notify::tls": (pspec: GObject.ParamSpec) => void;
            "notify::tls-validation-flags": (pspec: GObject.ParamSpec) => void;
            "notify::type": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            enable_proxy: boolean;
            enableProxy: boolean;
            family: SocketFamily;
            local_address: SocketAddress | null;
            localAddress: SocketAddress | null;
            protocol: SocketProtocol;
            proxy_resolver: ProxyResolver;
            proxyResolver: ProxyResolver;
            timeout: number;
            tls: boolean;
            tls_validation_flags: TlsCertificateFlags;
            tlsValidationFlags: TlsCertificateFlags;
            type: SocketType;
        }
    }

    class SocketClient extends GObject.Object {
        static $gtype: GObject.GType<SocketClient>;

        // Properties
        get enable_proxy(): boolean;
        set enable_proxy(val: boolean);

        get enableProxy(): boolean;
        set enableProxy(val: boolean);

        get family(): SocketFamily;
        set family(val: SocketFamily);

        get local_address(): SocketAddress | null;
        set local_address(val: SocketAddress | null);

        get localAddress(): SocketAddress | null;
        set localAddress(val: SocketAddress | null);

        get protocol(): SocketProtocol;
        set protocol(val: SocketProtocol);

        get proxy_resolver(): ProxyResolver;
        set proxy_resolver(val: ProxyResolver);

        get proxyResolver(): ProxyResolver;
        set proxyResolver(val: ProxyResolver);

        get timeout(): number;
        set timeout(val: number);

        get tls(): boolean;
        set tls(val: boolean);

        get tls_validation_flags(): TlsCertificateFlags;
        set tls_validation_flags(val: TlsCertificateFlags);

        get tlsValidationFlags(): TlsCertificateFlags;
        set tlsValidationFlags(val: TlsCertificateFlags);

        get type(): SocketType;
        set type(val: SocketType);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SocketClient.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SocketClient.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SocketClient;

        // Signals
        /** @signal */
        connect<K extends keyof SocketClient.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SocketClient.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SocketClient.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SocketClient.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SocketClient.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SocketClient.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_event(event: SocketClientEvent, connectable: SocketConnectable, connection: IOStream): void;

        // Methods
        add_application_proxy(protocol: string): void;

        connect(connectable: SocketConnectable, cancellable: Cancellable | null): SocketConnection;

        connect(...args: never[]): any;

        connect_async(connectable: SocketConnectable, cancellable: Cancellable | null): globalThis.Promise<SocketConnection>;

        connect_async(connectable: SocketConnectable, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        connect_async(connectable: SocketConnectable, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<SocketConnection> | void;

        connect_finish(result: AsyncResult): SocketConnection;

        connect_to_host(host_and_port: string, default_port: number, cancellable: Cancellable | null): SocketConnection;

        connect_to_host_async(host_and_port: string, default_port: number, cancellable: Cancellable | null): globalThis.Promise<SocketConnection>;

        connect_to_host_async(host_and_port: string, default_port: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        connect_to_host_async(host_and_port: string, default_port: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<SocketConnection> | void;

        connect_to_host_finish(result: AsyncResult): SocketConnection;

        connect_to_service(domain: string, service: string, cancellable: Cancellable | null): SocketConnection;

        connect_to_service_async(domain: string, service: string, cancellable: Cancellable | null): globalThis.Promise<SocketConnection>;

        connect_to_service_async(domain: string, service: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        connect_to_service_async(domain: string, service: string, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<SocketConnection> | void;

        connect_to_service_finish(result: AsyncResult): SocketConnection;

        connect_to_uri(uri: string, default_port: number, cancellable: Cancellable | null): SocketConnection;

        connect_to_uri_async(uri: string, default_port: number, cancellable: Cancellable | null): globalThis.Promise<SocketConnection>;

        connect_to_uri_async(uri: string, default_port: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        connect_to_uri_async(uri: string, default_port: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<SocketConnection> | void;

        connect_to_uri_finish(result: AsyncResult): SocketConnection;

        get_enable_proxy(): boolean;

        get_family(): SocketFamily;

        get_local_address(): SocketAddress | null;

        get_protocol(): SocketProtocol;

        get_proxy_resolver(): ProxyResolver;

        get_socket_type(): SocketType;

        get_timeout(): number;

        get_tls(): boolean;

        get_tls_validation_flags(): TlsCertificateFlags;

        set_enable_proxy(enable: boolean): void;

        set_family(family: SocketFamily): void;

        set_local_address(address: SocketAddress | null): void;

        set_protocol(protocol: SocketProtocol): void;

        set_proxy_resolver(proxy_resolver: ProxyResolver | null): void;

        set_socket_type(type: SocketType): void;

        set_timeout(timeout: number): void;

        set_tls(tls: boolean): void;

        set_tls_validation_flags(flags: TlsCertificateFlags): void;
    }


    namespace SocketConnection {
        // Signal signatures
        interface SignalSignatures extends IOStream.SignalSignatures {
            "notify::socket": (pspec: GObject.ParamSpec) => void;
            "notify::closed": (pspec: GObject.ParamSpec) => void;
            "notify::input-stream": (pspec: GObject.ParamSpec) => void;
            "notify::output-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends IOStream.ConstructorProps {
            socket: Socket;
        }
    }

    class SocketConnection extends IOStream {
        static $gtype: GObject.GType<SocketConnection>;

        // Properties
        get socket(): Socket;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SocketConnection.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SocketConnection.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof SocketConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SocketConnection.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SocketConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SocketConnection.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SocketConnection.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SocketConnection.SignalSignatures[K]>): void;

        // Static methods
        static factory_lookup_type(family: SocketFamily, type: SocketType, protocol_id: number): GObject.GType;

        static factory_register_type(g_type: GObject.GType, family: SocketFamily, type: SocketType, protocol: number): void;

        // Methods
        connect(address: SocketAddress, cancellable: Cancellable | null): boolean;

        connect(...args: never[]): any;

        connect_async(address: SocketAddress, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        connect_async(address: SocketAddress, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        connect_async(address: SocketAddress, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        connect_finish(result: AsyncResult): boolean;

        get_local_address(): SocketAddress;

        get_remote_address(): SocketAddress;

        get_socket(): Socket;

        is_connected(): boolean;
    }


    namespace SocketControlMessage {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class SocketControlMessage extends GObject.Object {
        static $gtype: GObject.GType<SocketControlMessage>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SocketControlMessage.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SocketControlMessage.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof SocketControlMessage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SocketControlMessage.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SocketControlMessage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SocketControlMessage.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SocketControlMessage.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SocketControlMessage.SignalSignatures[K]>): void;

        // Static methods
        static deserialize(level: number, type: number, data: Uint8Array | string): SocketControlMessage | null;

        // Virtual methods
        vfunc_get_level(): number;

        vfunc_get_size(): bigint | number;

        vfunc_get_type(): number;

        vfunc_serialize(data: null): void;

        // Methods
        get_level(): number;

        get_msg_type(): number;

        get_size(): number;

        serialize(data: never): void;
    }


    namespace SocketListener {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            event: (event: SocketListenerEvent, socket: Socket) => void;
            "notify::listen-backlog": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            listen_backlog: number;
            listenBacklog: number;
        }
    }

    class SocketListener extends GObject.Object {
        static $gtype: GObject.GType<SocketListener>;

        // Properties
        get listen_backlog(): number;
        set listen_backlog(val: number);

        get listenBacklog(): number;
        set listenBacklog(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SocketListener.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SocketListener.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SocketListener;

        // Signals
        /** @signal */
        connect<K extends keyof SocketListener.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SocketListener.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SocketListener.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SocketListener.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SocketListener.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SocketListener.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_changed(): void;

        vfunc_event(event: SocketListenerEvent, socket: Socket): void;

        // Methods
        accept(cancellable: Cancellable | null): [SocketConnection, GObject.Object | null];

        accept_async(cancellable: Cancellable | null): globalThis.Promise<[SocketConnection, GObject.Object | null]>;

        accept_async(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        accept_async(cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<[SocketConnection, GObject.Object | null]> | void;

        accept_finish(result: AsyncResult): [SocketConnection, GObject.Object | null];

        accept_socket(cancellable: Cancellable | null): [Socket, GObject.Object | null];

        accept_socket_async(cancellable: Cancellable | null): globalThis.Promise<[Socket, GObject.Object | null]>;

        accept_socket_async(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        accept_socket_async(cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<[Socket, GObject.Object | null]> | void;

        accept_socket_finish(result: AsyncResult): [Socket, GObject.Object | null];

        add_address(address: SocketAddress, type: SocketType, protocol: SocketProtocol, source_object: GObject.Object | null): [boolean, SocketAddress | null];

        add_any_inet_port(source_object: GObject.Object | null): number;

        add_inet_port(port: number, source_object: GObject.Object | null): boolean;

        add_socket(socket: Socket, source_object: GObject.Object | null): boolean;

        close(): void;

        set_backlog(listen_backlog: number): void;
    }


    namespace SocketService {
        // Signal signatures
        interface SignalSignatures extends SocketListener.SignalSignatures {
            /** @signal */
            incoming: (connection: SocketConnection, source_object: GObject.Object | null) => boolean | void;
            "notify::active": (pspec: GObject.ParamSpec) => void;
            "notify::listen-backlog": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends SocketListener.ConstructorProps {
            active: boolean;
        }
    }

    class SocketService extends SocketListener {
        static $gtype: GObject.GType<SocketService>;

        // Properties
        get active(): boolean;
        set active(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SocketService.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SocketService.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SocketService;

        // Signals
        /** @signal */
        connect<K extends keyof SocketService.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SocketService.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SocketService.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SocketService.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SocketService.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SocketService.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_incoming(connection: SocketConnection, source_object: GObject.Object): boolean;

        // Methods
        is_active(): boolean;

        start(): void;

        stop(): void;
    }


    namespace Subprocess {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::argv": (pspec: GObject.ParamSpec) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Initable.ConstructorProps {
            argv: string[];
            flags: SubprocessFlags;
        }
    }

    class Subprocess extends GObject.Object implements Initable {
        static $gtype: GObject.GType<Subprocess>;

        // Properties
        set argv(val: string[]);

        set flags(val: SubprocessFlags);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Subprocess.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Subprocess.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](argv: string[], flags: SubprocessFlags): Subprocess;

        // Signals
        /** @signal */
        connect<K extends keyof Subprocess.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Subprocess.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Subprocess.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Subprocess.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Subprocess.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Subprocess.SignalSignatures[K]>): void;

        // Methods
        communicate(stdin_buf: GLib.Bytes | Uint8Array | null, cancellable: Cancellable | null): [boolean, GLib.Bytes | null, GLib.Bytes | null];

        communicate_async(stdin_buf: GLib.Bytes | Uint8Array | null, cancellable: Cancellable | null): globalThis.Promise<[GLib.Bytes | null, GLib.Bytes | null]>;

        communicate_async(stdin_buf: GLib.Bytes | Uint8Array | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        communicate_async(stdin_buf: GLib.Bytes | Uint8Array | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<[GLib.Bytes | null, GLib.Bytes | null]> | void;

        communicate_finish(result: AsyncResult): [boolean, GLib.Bytes | null, GLib.Bytes | null];

        communicate_utf8(stdin_buf: string | null, cancellable: Cancellable | null): [boolean, string, string];

        communicate_utf8_async(stdin_buf: string | null, cancellable: Cancellable | null): globalThis.Promise<[string, string]>;

        communicate_utf8_async(stdin_buf: string | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        communicate_utf8_async(stdin_buf: string | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<[string, string]> | void;

        communicate_utf8_finish(result: AsyncResult): [boolean, string, string];

        force_exit(): void;

        get_exit_status(): number;

        get_identifier(): string | null;

        get_if_exited(): boolean;

        get_if_signaled(): boolean;

        get_status(): number;

        get_stderr_pipe(): InputStream | null;

        get_stdin_pipe(): OutputStream | null;

        get_stdout_pipe(): InputStream | null;

        get_successful(): boolean;

        get_term_sig(): number;

        send_signal(signal_num: number): void;

        wait(cancellable: Cancellable | null): boolean;

        wait_async(cancellable: Cancellable | null): globalThis.Promise<boolean>;

        wait_async(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        wait_async(cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        wait_check(cancellable: Cancellable | null): boolean;

        wait_check_async(cancellable: Cancellable | null): globalThis.Promise<boolean>;

        wait_check_async(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        wait_check_async(cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        wait_check_finish(result: AsyncResult): boolean;

        wait_finish(result: AsyncResult): boolean;

        init(cancellable: Cancellable | null): boolean;

        vfunc_init(cancellable: Cancellable | null): boolean;
    }


    namespace SubprocessLauncher {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::flags": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            flags: SubprocessFlags;
        }
    }

    class SubprocessLauncher extends GObject.Object {
        static $gtype: GObject.GType<SubprocessLauncher>;

        // Properties
        set flags(val: SubprocessFlags);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SubprocessLauncher.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SubprocessLauncher.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](flags: SubprocessFlags): SubprocessLauncher;

        // Signals
        /** @signal */
        connect<K extends keyof SubprocessLauncher.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SubprocessLauncher.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SubprocessLauncher.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SubprocessLauncher.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SubprocessLauncher.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SubprocessLauncher.SignalSignatures[K]>): void;

        // Methods
        close(): void;

        getenv(variable: string): string | null;

        set_cwd(cwd: string): void;

        set_environ(env: string[]): void;

        set_flags(flags: SubprocessFlags): void;

        set_stderr_file_path(path: string | null): void;

        set_stdin_file_path(path: string | null): void;

        set_stdout_file_path(path: string | null): void;

        setenv(variable: string, value: string, overwrite: boolean): void;

        spawnv(argv: string[]): Subprocess;

        take_fd(source_fd: number, target_fd: number): void;

        take_stderr_fd(fd: number): void;

        take_stdin_fd(fd: number): void;

        take_stdout_fd(fd: number): void;

        unsetenv(variable: string): void;
    }


    namespace Task {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::completed": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, AsyncResult.ConstructorProps {
            completed: boolean;
        }
    }

    class Task extends GObject.Object implements AsyncResult {
        static $gtype: GObject.GType<Task>;

        // Properties
        get completed(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Task.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Task.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](source_object: GObject.Object | null, cancellable: Cancellable | null, callback: AsyncReadyCallback | null): Task;

        // Signals
        /** @signal */
        connect<K extends keyof Task.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Task.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Task.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Task.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Task.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Task.SignalSignatures[K]>): void;

        // Static methods
        static is_valid(result: AsyncResult, source_object: GObject.Object | null): boolean;

        static report_error(source_object: GObject.Object | null, callback: AsyncReadyCallback<Task> | null, source_tag: null, error: GLib.Error): void;

        // Methods
        get_cancellable(): Cancellable | null;

        get_check_cancellable(): boolean;

        get_completed(): boolean;

        get_context(): GLib.MainContext;

        get_name(): string | null;

        get_priority(): number;

        get_return_on_cancel(): boolean;

        get_source_object<T = GObject.Object>(): T;

        get_source_tag(): null;

        get_task_data(): null;

        had_error(): boolean;

        propagate_boolean(): boolean;

        propagate_int(): number;

        propagate_pointer(): null;

        propagate_value(): [boolean, unknown];

        return_boolean(result: boolean): void;

        return_error(error: GLib.Error): void;

        return_error_if_cancelled(): boolean;

        return_int(result: bigint | number): void;

        return_new_error_literal(domain: GLib.Quark, code: number, message: string): void;

        return_pointer(result: null): void;

        return_value(result: GObject.Value | any | null): void;

        run_in_thread(task_func: TaskThreadFunc): void;

        run_in_thread_sync(task_func: TaskThreadFunc): void;

        set_check_cancellable(check_cancellable: boolean): void;

        set_name(name: string | null): void;

        set_priority(priority: number): void;

        set_return_on_cancel(return_on_cancel: boolean): boolean;

        set_source_tag(source_tag: null): void;

        set_static_name(name: string | null): void;

        set_task_data(task_data: null): void;

        get_user_data(): null;

        is_tagged(source_tag: null): boolean;

        legacy_propagate_error(): boolean;

        vfunc_get_source_object<T = GObject.Object>(): T;

        vfunc_get_user_data(): null;

        vfunc_is_tagged(source_tag: null): boolean;
    }


    namespace TcpConnection {
        // Signal signatures
        interface SignalSignatures extends SocketConnection.SignalSignatures {
            "notify::graceful-disconnect": (pspec: GObject.ParamSpec) => void;
            "notify::socket": (pspec: GObject.ParamSpec) => void;
            "notify::closed": (pspec: GObject.ParamSpec) => void;
            "notify::input-stream": (pspec: GObject.ParamSpec) => void;
            "notify::output-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends SocketConnection.ConstructorProps {
            graceful_disconnect: boolean;
            gracefulDisconnect: boolean;
        }
    }

    class TcpConnection extends SocketConnection {
        static $gtype: GObject.GType<TcpConnection>;

        // Properties
        get graceful_disconnect(): boolean;
        set graceful_disconnect(val: boolean);

        get gracefulDisconnect(): boolean;
        set gracefulDisconnect(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TcpConnection.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TcpConnection.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect_after<K extends keyof TcpConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TcpConnection.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TcpConnection.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TcpConnection.SignalSignatures[K]>): void;

        // Methods
        get_graceful_disconnect(): boolean;

        set_graceful_disconnect(graceful_disconnect: boolean): void;
    }


    namespace TcpWrapperConnection {
        // Signal signatures
        interface SignalSignatures extends TcpConnection.SignalSignatures {
            "notify::base-io-stream": (pspec: GObject.ParamSpec) => void;
            "notify::graceful-disconnect": (pspec: GObject.ParamSpec) => void;
            "notify::socket": (pspec: GObject.ParamSpec) => void;
            "notify::closed": (pspec: GObject.ParamSpec) => void;
            "notify::input-stream": (pspec: GObject.ParamSpec) => void;
            "notify::output-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends TcpConnection.ConstructorProps {
            base_io_stream: IOStream;
            baseIoStream: IOStream;
        }
    }

    class TcpWrapperConnection extends TcpConnection {
        static $gtype: GObject.GType<TcpWrapperConnection>;

        // Properties
        get base_io_stream(): IOStream;

        get baseIoStream(): IOStream;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TcpWrapperConnection.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TcpWrapperConnection.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](base_io_stream: IOStream, socket: Socket): TcpWrapperConnection;

        // Signals
        /** @signal */
        connect_after<K extends keyof TcpWrapperConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TcpWrapperConnection.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TcpWrapperConnection.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TcpWrapperConnection.SignalSignatures[K]>): void;

        // Methods
        get_base_io_stream(): IOStream;
    }


    namespace TestDBus {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::flags": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            flags: TestDBusFlags;
        }
    }

    class TestDBus extends GObject.Object {
        static $gtype: GObject.GType<TestDBus>;

        // Properties
        get flags(): TestDBusFlags;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TestDBus.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TestDBus.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](flags: TestDBusFlags): TestDBus;

        // Signals
        /** @signal */
        connect<K extends keyof TestDBus.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TestDBus.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TestDBus.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TestDBus.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TestDBus.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TestDBus.SignalSignatures[K]>): void;

        // Static methods
        static unset(): void;

        // Methods
        add_service_dir(path: string): void;

        down(): void;

        get_bus_address(): string | null;

        get_flags(): TestDBusFlags;

        stop(): void;

        up(): void;
    }


    namespace ThemedIcon {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::names": (pspec: GObject.ParamSpec) => void;
            "notify::use-default-fallbacks": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Icon.ConstructorProps {
            name: string;
            names: string[];
            use_default_fallbacks: boolean;
            useDefaultFallbacks: boolean;
        }
    }

    class ThemedIcon extends GObject.Object implements Icon {
        static $gtype: GObject.GType<ThemedIcon>;

        // Properties
        set name(val: string);

        get names(): string[];

        get use_default_fallbacks(): boolean;

        get useDefaultFallbacks(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ThemedIcon.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ThemedIcon.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](iconname: string): ThemedIcon;

        static new_from_names(iconnames: string[]): ThemedIcon;

        static new_with_default_fallbacks(iconname: string): ThemedIcon;

        // Signals
        /** @signal */
        connect<K extends keyof ThemedIcon.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ThemedIcon.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ThemedIcon.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ThemedIcon.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ThemedIcon.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ThemedIcon.SignalSignatures[K]>): void;

        // Methods
        append_name(iconname: string): void;

        get_names(): string[];

        prepend_name(iconname: string): void;

        equal(icon2: Icon | null): boolean;

        hash(): number;

        serialize(): GLib.Variant | null;

        to_string(): string | null;

        vfunc_equal(icon2: Icon | null): boolean;

        vfunc_hash(): number;

        vfunc_serialize(): GLib.Variant | null;

        vfunc_to_tokens(): [boolean, string[], number];
    }


    namespace ThreadedResolver {
        // Signal signatures
        interface SignalSignatures extends Resolver.SignalSignatures {
            "notify::timeout": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Resolver.ConstructorProps {}
    }

    class ThreadedResolver extends Resolver {
        static $gtype: GObject.GType<ThreadedResolver>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ThreadedResolver.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ThreadedResolver.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ThreadedResolver.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ThreadedResolver.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ThreadedResolver.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ThreadedResolver.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ThreadedResolver.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ThreadedResolver.SignalSignatures[K]>): void;
    }


    namespace ThreadedSocketService {
        // Signal signatures
        interface SignalSignatures extends SocketService.SignalSignatures {
            /** @signal */
            run: (connection: SocketConnection, source_object: GObject.Object | null) => boolean | void;
            "notify::max-threads": (pspec: GObject.ParamSpec) => void;
            "notify::active": (pspec: GObject.ParamSpec) => void;
            "notify::listen-backlog": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends SocketService.ConstructorProps {
            max_threads: number;
            maxThreads: number;
        }
    }

    class ThreadedSocketService extends SocketService {
        static $gtype: GObject.GType<ThreadedSocketService>;

        // Properties
        get max_threads(): number;

        get maxThreads(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ThreadedSocketService.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ThreadedSocketService.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](max_threads: number): ThreadedSocketService;

        // Conflicted with Gio.SocketService.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof ThreadedSocketService.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ThreadedSocketService.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ThreadedSocketService.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ThreadedSocketService.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ThreadedSocketService.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ThreadedSocketService.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_run(connection: SocketConnection, source_object: GObject.Object): boolean;
    }


    namespace TlsCertificate {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::certificate": (pspec: GObject.ParamSpec) => void;
            "notify::certificate-pem": (pspec: GObject.ParamSpec) => void;
            "notify::dns-names": (pspec: GObject.ParamSpec) => void;
            "notify::ip-addresses": (pspec: GObject.ParamSpec) => void;
            "notify::issuer": (pspec: GObject.ParamSpec) => void;
            "notify::issuer-name": (pspec: GObject.ParamSpec) => void;
            "notify::not-valid-after": (pspec: GObject.ParamSpec) => void;
            "notify::not-valid-before": (pspec: GObject.ParamSpec) => void;
            "notify::password": (pspec: GObject.ParamSpec) => void;
            "notify::pkcs11-uri": (pspec: GObject.ParamSpec) => void;
            "notify::pkcs12-data": (pspec: GObject.ParamSpec) => void;
            "notify::private-key": (pspec: GObject.ParamSpec) => void;
            "notify::private-key-pem": (pspec: GObject.ParamSpec) => void;
            "notify::private-key-pkcs11-uri": (pspec: GObject.ParamSpec) => void;
            "notify::subject-name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            certificate: Uint8Array | string;
            certificate_pem: string;
            certificatePem: string;
            dns_names: never[] | null;
            dnsNames: never[] | null;
            ip_addresses: never[] | null;
            ipAddresses: never[] | null;
            issuer: TlsCertificate | null;
            issuer_name: string | null;
            issuerName: string | null;
            not_valid_after: GLib.DateTime | null;
            notValidAfter: GLib.DateTime | null;
            not_valid_before: GLib.DateTime | null;
            notValidBefore: GLib.DateTime | null;
            password: string;
            pkcs11_uri: string;
            pkcs11Uri: string;
            pkcs12_data: Uint8Array | string;
            pkcs12Data: Uint8Array | string;
            private_key: Uint8Array | string;
            privateKey: Uint8Array | string;
            private_key_pem: string;
            privateKeyPem: string;
            private_key_pkcs11_uri: string;
            privateKeyPkcs11Uri: string;
            subject_name: string | null;
            subjectName: string | null;
        }
    }

    abstract class TlsCertificate extends GObject.Object {
        static $gtype: GObject.GType<TlsCertificate>;

        // Properties
        get certificate(): Uint8Array;

        get certificate_pem(): string;

        get certificatePem(): string;

        get dns_names(): null[] | null;

        get dnsNames(): null[] | null;

        get ip_addresses(): null[] | null;

        get ipAddresses(): null[] | null;

        get issuer(): TlsCertificate | null;

        get issuer_name(): string | null;

        get issuerName(): string | null;

        get not_valid_after(): GLib.DateTime | null;

        get notValidAfter(): GLib.DateTime | null;

        get not_valid_before(): GLib.DateTime | null;

        get notValidBefore(): GLib.DateTime | null;

        set password(val: string);

        get pkcs11_uri(): string;

        get pkcs11Uri(): string;

        set pkcs12_data(val: Uint8Array | string);

        set pkcs12Data(val: Uint8Array | string);

        get private_key(): Uint8Array;

        get privateKey(): Uint8Array;

        get private_key_pem(): string;

        get privateKeyPem(): string;

        get private_key_pkcs11_uri(): string;

        get privateKeyPkcs11Uri(): string;

        get subject_name(): string | null;

        get subjectName(): string | null;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TlsCertificate.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TlsCertificate.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_from_file(file: string): TlsCertificate;

        static new_from_file_with_password(file: string, password: string): TlsCertificate;

        static new_from_files(cert_file: string, key_file: string): TlsCertificate;

        static new_from_pem(data: string, length: bigint | number): TlsCertificate;

        static new_from_pkcs11_uris(pkcs11_uri: string, private_key_pkcs11_uri: string | null): TlsCertificate;

        static new_from_pkcs12(data: Uint8Array | string, password: string | null): TlsCertificate;

        // Signals
        /** @signal */
        connect<K extends keyof TlsCertificate.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TlsCertificate.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TlsCertificate.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TlsCertificate.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TlsCertificate.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TlsCertificate.SignalSignatures[K]>): void;

        // Static methods
        static list_new_from_file(file: string): TlsCertificate[];

        // Virtual methods
        vfunc_verify(identity: SocketConnectable | null, trusted_ca: TlsCertificate | null): TlsCertificateFlags;

        // Methods
        get_dns_names(): GLib.Bytes[] | null;

        get_ip_addresses(): InetAddress[] | null;

        get_issuer(): TlsCertificate | null;

        get_issuer_name(): string | null;

        get_not_valid_after(): GLib.DateTime | null;

        get_not_valid_before(): GLib.DateTime | null;

        get_subject_name(): string | null;

        is_same(cert_two: TlsCertificate): boolean;

        verify(identity: SocketConnectable | null, trusted_ca: TlsCertificate | null): TlsCertificateFlags;
    }


    namespace TlsConnection {
        // Signal signatures
        interface SignalSignatures extends IOStream.SignalSignatures {
            /** @signal */
            "accept-certificate": (peer_cert: TlsCertificate, errors: TlsCertificateFlags) => boolean | void;
            "notify::advertised-protocols": (pspec: GObject.ParamSpec) => void;
            "notify::base-io-stream": (pspec: GObject.ParamSpec) => void;
            "notify::certificate": (pspec: GObject.ParamSpec) => void;
            "notify::ciphersuite-name": (pspec: GObject.ParamSpec) => void;
            "notify::database": (pspec: GObject.ParamSpec) => void;
            "notify::interaction": (pspec: GObject.ParamSpec) => void;
            "notify::negotiated-protocol": (pspec: GObject.ParamSpec) => void;
            "notify::peer-certificate": (pspec: GObject.ParamSpec) => void;
            "notify::peer-certificate-errors": (pspec: GObject.ParamSpec) => void;
            "notify::protocol-version": (pspec: GObject.ParamSpec) => void;
            "notify::rehandshake-mode": (pspec: GObject.ParamSpec) => void;
            "notify::require-close-notify": (pspec: GObject.ParamSpec) => void;
            "notify::use-system-certdb": (pspec: GObject.ParamSpec) => void;
            "notify::closed": (pspec: GObject.ParamSpec) => void;
            "notify::input-stream": (pspec: GObject.ParamSpec) => void;
            "notify::output-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends IOStream.ConstructorProps {
            advertised_protocols: string[];
            advertisedProtocols: string[];
            base_io_stream: IOStream;
            baseIoStream: IOStream;
            certificate: TlsCertificate | null;
            ciphersuite_name: string | null;
            ciphersuiteName: string | null;
            database: TlsDatabase | null;
            interaction: TlsInteraction | null;
            negotiated_protocol: string | null;
            negotiatedProtocol: string | null;
            peer_certificate: TlsCertificate | null;
            peerCertificate: TlsCertificate | null;
            peer_certificate_errors: TlsCertificateFlags;
            peerCertificateErrors: TlsCertificateFlags;
            protocol_version: TlsProtocolVersion;
            protocolVersion: TlsProtocolVersion;
            rehandshake_mode: TlsRehandshakeMode;
            rehandshakeMode: TlsRehandshakeMode;
            require_close_notify: boolean;
            requireCloseNotify: boolean;
            use_system_certdb: boolean;
            useSystemCertdb: boolean;
        }
    }

    abstract class TlsConnection extends IOStream {
        static $gtype: GObject.GType<TlsConnection>;

        // Properties
        get advertised_protocols(): string[];
        set advertised_protocols(val: string[]);

        get advertisedProtocols(): string[];
        set advertisedProtocols(val: string[]);

        get base_io_stream(): IOStream;

        get baseIoStream(): IOStream;

        get certificate(): TlsCertificate | null;
        set certificate(val: TlsCertificate | null);

        get ciphersuite_name(): string | null;

        get ciphersuiteName(): string | null;

        get database(): TlsDatabase | null;
        set database(val: TlsDatabase | null);

        get interaction(): TlsInteraction | null;
        set interaction(val: TlsInteraction | null);

        get negotiated_protocol(): string | null;

        get negotiatedProtocol(): string | null;

        get peer_certificate(): TlsCertificate | null;

        get peerCertificate(): TlsCertificate | null;

        get peer_certificate_errors(): TlsCertificateFlags;

        get peerCertificateErrors(): TlsCertificateFlags;

        get protocol_version(): TlsProtocolVersion;

        get protocolVersion(): TlsProtocolVersion;

        get rehandshake_mode(): TlsRehandshakeMode;
        set rehandshake_mode(val: TlsRehandshakeMode);

        get rehandshakeMode(): TlsRehandshakeMode;
        set rehandshakeMode(val: TlsRehandshakeMode);

        get require_close_notify(): boolean;
        set require_close_notify(val: boolean);

        get requireCloseNotify(): boolean;
        set requireCloseNotify(val: boolean);

        get use_system_certdb(): boolean;
        set use_system_certdb(val: boolean);

        get useSystemCertdb(): boolean;
        set useSystemCertdb(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TlsConnection.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TlsConnection.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof TlsConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TlsConnection.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TlsConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TlsConnection.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TlsConnection.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TlsConnection.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_accept_certificate(peer_cert: TlsCertificate, errors: TlsCertificateFlags): boolean;

        vfunc_get_binding_data(type: TlsChannelBindingType, data: Uint8Array): boolean;

        vfunc_get_negotiated_protocol(): string | null;

        vfunc_handshake(cancellable: Cancellable | null): boolean;

        vfunc_handshake_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_handshake_finish(result: AsyncResult): boolean;

        // Methods
        emit_accept_certificate(peer_cert: TlsCertificate, errors: TlsCertificateFlags): boolean;

        get_certificate(): TlsCertificate | null;

        get_channel_binding_data(type: TlsChannelBindingType): [boolean, Uint8Array | null];

        get_ciphersuite_name(): string | null;

        get_database(): TlsDatabase | null;

        get_interaction(): TlsInteraction | null;

        get_negotiated_protocol(): string | null;

        get_peer_certificate(): TlsCertificate | null;

        get_peer_certificate_errors(): TlsCertificateFlags;

        get_protocol_version(): TlsProtocolVersion;

        get_rehandshake_mode(): TlsRehandshakeMode;

        get_require_close_notify(): boolean;

        get_use_system_certdb(): boolean;

        handshake(cancellable: Cancellable | null): boolean;

        handshake_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        handshake_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        handshake_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        handshake_finish(result: AsyncResult): boolean;

        set_advertised_protocols(protocols: string[] | null): void;

        set_certificate(certificate: TlsCertificate): void;

        set_database(database: TlsDatabase | null): void;

        set_interaction(interaction: TlsInteraction | null): void;

        set_rehandshake_mode(mode: TlsRehandshakeMode): void;

        set_require_close_notify(require_close_notify: boolean): void;

        set_use_system_certdb(use_system_certdb: boolean): void;
    }


    namespace TlsDatabase {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class TlsDatabase extends GObject.Object {
        static $gtype: GObject.GType<TlsDatabase>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TlsDatabase.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TlsDatabase.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof TlsDatabase.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TlsDatabase.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TlsDatabase.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TlsDatabase.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TlsDatabase.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TlsDatabase.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_create_certificate_handle(certificate: TlsCertificate): string | null;

        vfunc_lookup_certificate_for_handle(handle: string, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null): TlsCertificate | null;

        vfunc_lookup_certificate_for_handle_async(handle: string, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_lookup_certificate_for_handle_finish(result: AsyncResult): TlsCertificate;

        vfunc_lookup_certificate_issuer(certificate: TlsCertificate, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null): TlsCertificate;

        vfunc_lookup_certificate_issuer_async(certificate: TlsCertificate, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_lookup_certificate_issuer_finish(result: AsyncResult): TlsCertificate;

        vfunc_lookup_certificates_issued_by(issuer_raw_dn: Uint8Array, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null): TlsCertificate[];

        vfunc_lookup_certificates_issued_by_async(issuer_raw_dn: Uint8Array, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_lookup_certificates_issued_by_finish(result: AsyncResult): TlsCertificate[];

        vfunc_verify_chain(chain: TlsCertificate, purpose: string, identity: SocketConnectable | null, interaction: TlsInteraction | null, flags: TlsDatabaseVerifyFlags, cancellable: Cancellable | null): TlsCertificateFlags;

        vfunc_verify_chain_async(chain: TlsCertificate, purpose: string, identity: SocketConnectable | null, interaction: TlsInteraction | null, flags: TlsDatabaseVerifyFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_verify_chain_finish(result: AsyncResult): TlsCertificateFlags;

        // Methods
        create_certificate_handle(certificate: TlsCertificate): string | null;

        lookup_certificate_for_handle(handle: string, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null): TlsCertificate | null;

        lookup_certificate_for_handle_async(handle: string, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null): globalThis.Promise<TlsCertificate>;

        lookup_certificate_for_handle_async(handle: string, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        lookup_certificate_for_handle_async(handle: string, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<TlsCertificate> | void;

        lookup_certificate_for_handle_finish(result: AsyncResult): TlsCertificate;

        lookup_certificate_issuer(certificate: TlsCertificate, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null): TlsCertificate;

        lookup_certificate_issuer_async(certificate: TlsCertificate, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null): globalThis.Promise<TlsCertificate>;

        lookup_certificate_issuer_async(certificate: TlsCertificate, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        lookup_certificate_issuer_async(certificate: TlsCertificate, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<TlsCertificate> | void;

        lookup_certificate_issuer_finish(result: AsyncResult): TlsCertificate;

        lookup_certificates_issued_by(issuer_raw_dn: Uint8Array | string, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null): TlsCertificate[];

        lookup_certificates_issued_by_async(issuer_raw_dn: Uint8Array | string, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null): globalThis.Promise<TlsCertificate[]>;

        lookup_certificates_issued_by_async(issuer_raw_dn: Uint8Array | string, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        lookup_certificates_issued_by_async(issuer_raw_dn: Uint8Array | string, interaction: TlsInteraction | null, flags: TlsDatabaseLookupFlags, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<TlsCertificate[]> | void;

        lookup_certificates_issued_by_finish(result: AsyncResult): TlsCertificate[];

        verify_chain(chain: TlsCertificate, purpose: string, identity: SocketConnectable | null, interaction: TlsInteraction | null, flags: TlsDatabaseVerifyFlags, cancellable: Cancellable | null): TlsCertificateFlags;

        verify_chain_async(chain: TlsCertificate, purpose: string, identity: SocketConnectable | null, interaction: TlsInteraction | null, flags: TlsDatabaseVerifyFlags, cancellable: Cancellable | null): globalThis.Promise<TlsCertificateFlags>;

        verify_chain_async(chain: TlsCertificate, purpose: string, identity: SocketConnectable | null, interaction: TlsInteraction | null, flags: TlsDatabaseVerifyFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        verify_chain_async(chain: TlsCertificate, purpose: string, identity: SocketConnectable | null, interaction: TlsInteraction | null, flags: TlsDatabaseVerifyFlags, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<TlsCertificateFlags> | void;

        verify_chain_finish(result: AsyncResult): TlsCertificateFlags;
    }


    namespace TlsInteraction {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class TlsInteraction extends GObject.Object {
        static $gtype: GObject.GType<TlsInteraction>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TlsInteraction.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TlsInteraction.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof TlsInteraction.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TlsInteraction.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TlsInteraction.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TlsInteraction.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TlsInteraction.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TlsInteraction.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_ask_password(password: TlsPassword, cancellable: Cancellable | null): TlsInteractionResult;

        vfunc_ask_password_async(password: TlsPassword, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_ask_password_finish(result: AsyncResult): TlsInteractionResult;

        vfunc_request_certificate(connection: TlsConnection, flags: TlsCertificateRequestFlags, cancellable: Cancellable | null): TlsInteractionResult;

        vfunc_request_certificate_async(connection: TlsConnection, flags: TlsCertificateRequestFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        vfunc_request_certificate_finish(result: AsyncResult): TlsInteractionResult;

        // Methods
        ask_password(password: TlsPassword, cancellable: Cancellable | null): TlsInteractionResult;

        ask_password_async(password: TlsPassword, cancellable: Cancellable | null): globalThis.Promise<TlsInteractionResult>;

        ask_password_async(password: TlsPassword, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        ask_password_async(password: TlsPassword, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<TlsInteractionResult> | void;

        ask_password_finish(result: AsyncResult): TlsInteractionResult;

        invoke_ask_password(password: TlsPassword, cancellable: Cancellable | null): TlsInteractionResult;

        invoke_request_certificate(connection: TlsConnection, flags: TlsCertificateRequestFlags, cancellable: Cancellable | null): TlsInteractionResult;

        request_certificate(connection: TlsConnection, flags: TlsCertificateRequestFlags, cancellable: Cancellable | null): TlsInteractionResult;

        request_certificate_async(connection: TlsConnection, flags: TlsCertificateRequestFlags, cancellable: Cancellable | null): globalThis.Promise<TlsInteractionResult>;

        request_certificate_async(connection: TlsConnection, flags: TlsCertificateRequestFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        request_certificate_async(connection: TlsConnection, flags: TlsCertificateRequestFlags, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<TlsInteractionResult> | void;

        request_certificate_finish(result: AsyncResult): TlsInteractionResult;
    }


    namespace TlsPassword {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::description": (pspec: GObject.ParamSpec) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::warning": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            description: string;
            flags: TlsPasswordFlags;
            warning: string;
        }
    }

    class TlsPassword extends GObject.Object {
        static $gtype: GObject.GType<TlsPassword>;

        // Properties
        get description(): string;
        set description(val: string);

        get flags(): TlsPasswordFlags;
        set flags(val: TlsPasswordFlags);

        get warning(): string;
        set warning(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TlsPassword.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TlsPassword.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](flags: TlsPasswordFlags, description: string): TlsPassword;

        // Signals
        /** @signal */
        connect<K extends keyof TlsPassword.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TlsPassword.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TlsPassword.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TlsPassword.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TlsPassword.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TlsPassword.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_default_warning(): string;

        vfunc_get_value(): Uint8Array | string;

        vfunc_set_value(value: Uint8Array): void;

        // Methods
        get_description(): string;

        get_flags(): TlsPasswordFlags;

        get_value(): Uint8Array;

        get_warning(): string;

        set_description(description: string): void;

        set_flags(flags: TlsPasswordFlags): void;

        set_value(value: Uint8Array | string): void;

        set_value_full(value: Uint8Array | string): void;

        set_warning(warning: string): void;
    }


    namespace UnixConnection {
        // Signal signatures
        interface SignalSignatures extends SocketConnection.SignalSignatures {
            "notify::socket": (pspec: GObject.ParamSpec) => void;
            "notify::closed": (pspec: GObject.ParamSpec) => void;
            "notify::input-stream": (pspec: GObject.ParamSpec) => void;
            "notify::output-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends SocketConnection.ConstructorProps {}
    }

    class UnixConnection extends SocketConnection {
        static $gtype: GObject.GType<UnixConnection>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: UnixConnection.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<UnixConnection.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect_after<K extends keyof UnixConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixConnection.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof UnixConnection.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<UnixConnection.SignalSignatures[K]>): void;

        // Methods
        receive_credentials(cancellable: Cancellable | null): Credentials;

        receive_credentials_async(cancellable: Cancellable | null): globalThis.Promise<Credentials>;

        receive_credentials_async(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        receive_credentials_async(cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<Credentials> | void;

        receive_credentials_finish(result: AsyncResult): Credentials;

        receive_fd(cancellable: Cancellable | null): number;

        send_credentials(cancellable: Cancellable | null): boolean;

        send_credentials_async(cancellable: Cancellable | null): globalThis.Promise<boolean>;

        send_credentials_async(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        send_credentials_async(cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        send_credentials_finish(result: AsyncResult): boolean;

        send_fd(fd: number, cancellable: Cancellable | null): boolean;
    }


    namespace UnixCredentialsMessage {
        // Signal signatures
        interface SignalSignatures extends SocketControlMessage.SignalSignatures {
            "notify::credentials": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends SocketControlMessage.ConstructorProps {
            credentials: Credentials;
        }
    }

    class UnixCredentialsMessage extends SocketControlMessage {
        static $gtype: GObject.GType<UnixCredentialsMessage>;

        // Properties
        get credentials(): Credentials;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: UnixCredentialsMessage.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<UnixCredentialsMessage.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): UnixCredentialsMessage;

        static new_with_credentials(credentials: Credentials): UnixCredentialsMessage;

        // Signals
        /** @signal */
        connect<K extends keyof UnixCredentialsMessage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixCredentialsMessage.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof UnixCredentialsMessage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixCredentialsMessage.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof UnixCredentialsMessage.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<UnixCredentialsMessage.SignalSignatures[K]>): void;

        // Static methods
        static is_supported(): boolean;

        // Methods
        get_credentials(): Credentials;
    }


    namespace UnixFDList {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class UnixFDList extends GObject.Object {
        static $gtype: GObject.GType<UnixFDList>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: UnixFDList.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<UnixFDList.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): UnixFDList;

        static new_from_array(fds: number[]): UnixFDList;

        // Signals
        /** @signal */
        connect<K extends keyof UnixFDList.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixFDList.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof UnixFDList.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixFDList.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof UnixFDList.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<UnixFDList.SignalSignatures[K]>): void;

        // Methods
        append(fd: number): number;

        append_take(fd: number): number;

        get(index_: number): number;

        get_length(): number;

        lookup(index_: bigint | number): number;

        peek(index_: bigint | number): number;

        peek_fds(): number[];

        steal_fds(): number[];
    }


    namespace UnixSocketAddress {
        // Signal signatures
        interface SignalSignatures extends SocketAddress.SignalSignatures {
            "notify::abstract": (pspec: GObject.ParamSpec) => void;
            "notify::address-type": (pspec: GObject.ParamSpec) => void;
            "notify::path": (pspec: GObject.ParamSpec) => void;
            "notify::path-as-array": (pspec: GObject.ParamSpec) => void;
            "notify::family": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends SocketAddress.ConstructorProps, SocketConnectable.ConstructorProps {
            "abstract": boolean;
            address_type: UnixSocketAddressType;
            addressType: UnixSocketAddressType;
            path: string;
            path_as_array: Uint8Array | string;
            pathAsArray: Uint8Array | string;
        }
    }

    class UnixSocketAddress extends SocketAddress implements SocketConnectable {
        static $gtype: GObject.GType<UnixSocketAddress>;

        // Properties
        get "abstract"(): boolean;

        get address_type(): UnixSocketAddressType;

        get addressType(): UnixSocketAddressType;

        get path(): string;

        get path_as_array(): Uint8Array;

        get pathAsArray(): Uint8Array;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: UnixSocketAddress.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<UnixSocketAddress.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](path: string): UnixSocketAddress;

        static new_abstract(path: number[]): UnixSocketAddress;

        static new_with_type(path: number[], type: UnixSocketAddressType): UnixSocketAddress;

        // Signals
        /** @signal */
        connect<K extends keyof UnixSocketAddress.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixSocketAddress.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof UnixSocketAddress.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, UnixSocketAddress.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof UnixSocketAddress.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<UnixSocketAddress.SignalSignatures[K]>): void;

        // Static methods
        static abstract_names_supported(): boolean;

        // Methods
        get_address_type(): UnixSocketAddressType;

        get_is_abstract(): boolean;

        get_path(): string;

        get_path_len(): number;

        enumerate(): SocketAddressEnumerator;

        proxy_enumerate(): SocketAddressEnumerator;

        to_string(): string;

        vfunc_enumerate(): SocketAddressEnumerator;

        vfunc_proxy_enumerate(): SocketAddressEnumerator;

        vfunc_to_string(): string;
    }


    namespace Vfs {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Vfs extends GObject.Object {
        static $gtype: GObject.GType<Vfs>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Vfs.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Vfs.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Vfs.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Vfs.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Vfs.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Vfs.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Vfs.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Vfs.SignalSignatures[K]>): void;

        // Static methods
        static get_default(): Vfs;

        static get_local(): Vfs;

        // Virtual methods
        vfunc_add_writable_namespaces(list: FileAttributeInfoList): void;

        vfunc_get_file_for_path(path: string): File;

        vfunc_get_file_for_uri(uri: string): File;

        vfunc_get_supported_uri_schemes(): string[];

        vfunc_is_active(): boolean;

        vfunc_local_file_add_info(filename: string, device: number, attribute_matcher: FileAttributeMatcher, info: FileInfo, cancellable: Cancellable | null, extra_data: null): void;

        vfunc_local_file_moved(source: string, dest: string): void;

        vfunc_local_file_removed(filename: string): void;

        vfunc_local_file_set_attributes(filename: string, info: FileInfo, flags: FileQueryInfoFlags, cancellable: Cancellable | null): boolean;

        vfunc_parse_name(parse_name: string): File;

        // Methods
        get_file_for_path(path: string): File;

        get_file_for_uri(uri: string): File;

        get_supported_uri_schemes(): string[];

        is_active(): boolean;

        parse_name(parse_name: string): File;

        register_uri_scheme(scheme: string, uri_func: VfsFileLookupFunc | null, parse_name_func: VfsFileLookupFunc | null): boolean;

        unregister_uri_scheme(scheme: string): boolean;
    }


    namespace VolumeMonitor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "drive-changed": (drive: Drive) => void;
            /** @signal */
            "drive-connected": (drive: Drive) => void;
            /** @signal */
            "drive-disconnected": (drive: Drive) => void;
            /** @signal */
            "drive-eject-button": (drive: Drive) => void;
            /** @signal */
            "drive-stop-button": (drive: Drive) => void;
            /** @signal */
            "mount-added": (mount: Mount) => void;
            /** @signal */
            "mount-changed": (mount: Mount) => void;
            /** @signal */
            "mount-pre-unmount": (mount: Mount) => void;
            /** @signal */
            "mount-removed": (mount: Mount) => void;
            /** @signal */
            "volume-added": (volume: Volume) => void;
            /** @signal */
            "volume-changed": (volume: Volume) => void;
            /** @signal */
            "volume-removed": (volume: Volume) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class VolumeMonitor extends GObject.Object {
        static $gtype: GObject.GType<VolumeMonitor>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: VolumeMonitor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<VolumeMonitor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof VolumeMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VolumeMonitor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof VolumeMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VolumeMonitor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof VolumeMonitor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<VolumeMonitor.SignalSignatures[K]>): void;

        // Static methods
        static adopt_orphan_mount(mount: Mount): Volume;

        static get(): VolumeMonitor;

        // Virtual methods
        vfunc_drive_changed(drive: Drive): void;

        vfunc_drive_connected(drive: Drive): void;

        vfunc_drive_disconnected(drive: Drive): void;

        vfunc_drive_eject_button(drive: Drive): void;

        vfunc_drive_stop_button(drive: Drive): void;

        vfunc_get_connected_drives(): Drive[];

        vfunc_get_mount_for_uuid(uuid: string): Mount | null;

        vfunc_get_mounts(): Mount[];

        vfunc_get_volume_for_uuid(uuid: string): Volume | null;

        vfunc_get_volumes(): Volume[];

        vfunc_mount_added(mount: Mount): void;

        vfunc_mount_changed(mount: Mount): void;

        vfunc_mount_pre_unmount(mount: Mount): void;

        vfunc_mount_removed(mount: Mount): void;

        vfunc_volume_added(volume: Volume): void;

        vfunc_volume_changed(volume: Volume): void;

        vfunc_volume_removed(volume: Volume): void;

        // Methods
        get_connected_drives(): Drive[];

        get_mount_for_uuid(uuid: string): Mount | null;

        get_mounts(): Mount[];

        get_volume_for_uuid(uuid: string): Volume | null;

        get_volumes(): Volume[];
    }


    namespace ZlibCompressor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::file-info": (pspec: GObject.ParamSpec) => void;
            "notify::format": (pspec: GObject.ParamSpec) => void;
            "notify::level": (pspec: GObject.ParamSpec) => void;
            "notify::os": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Converter.ConstructorProps {
            file_info: FileInfo | null;
            fileInfo: FileInfo | null;
            format: ZlibCompressorFormat;
            level: number;
            os: number;
        }
    }

    class ZlibCompressor extends GObject.Object implements Converter {
        static $gtype: GObject.GType<ZlibCompressor>;

        // Properties
        get file_info(): FileInfo | null;
        set file_info(val: FileInfo | null);

        get fileInfo(): FileInfo | null;
        set fileInfo(val: FileInfo | null);

        get format(): ZlibCompressorFormat;

        get level(): number;

        get os(): number;
        set os(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ZlibCompressor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ZlibCompressor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](format: ZlibCompressorFormat, level: number): ZlibCompressor;

        // Signals
        /** @signal */
        connect<K extends keyof ZlibCompressor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ZlibCompressor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ZlibCompressor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ZlibCompressor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ZlibCompressor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ZlibCompressor.SignalSignatures[K]>): void;

        // Methods
        get_file_info(): FileInfo | null;

        get_os(): number;

        set_file_info(file_info: FileInfo | null): void;

        set_os(os: number): void;

        convert(inbuf: Uint8Array | string, outbuf: Uint8Array | string, flags: ConverterFlags): [ConverterResult, number, number];

        convert_bytes(bytes: GLib.Bytes | Uint8Array): GLib.Bytes;

        reset(): void;

        vfunc_convert(inbuf: Uint8Array | null, outbuf: Uint8Array, flags: ConverterFlags): [ConverterResult, bigint | number, bigint | number];

        vfunc_reset(): void;
    }


    namespace ZlibDecompressor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::file-info": (pspec: GObject.ParamSpec) => void;
            "notify::format": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Converter.ConstructorProps {
            file_info: FileInfo | null;
            fileInfo: FileInfo | null;
            format: ZlibCompressorFormat;
        }
    }

    class ZlibDecompressor extends GObject.Object implements Converter {
        static $gtype: GObject.GType<ZlibDecompressor>;

        // Properties
        get file_info(): FileInfo | null;

        get fileInfo(): FileInfo | null;

        get format(): ZlibCompressorFormat;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ZlibDecompressor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ZlibDecompressor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](format: ZlibCompressorFormat): ZlibDecompressor;

        // Signals
        /** @signal */
        connect<K extends keyof ZlibDecompressor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ZlibDecompressor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ZlibDecompressor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ZlibDecompressor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ZlibDecompressor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ZlibDecompressor.SignalSignatures[K]>): void;

        // Methods
        get_file_info(): FileInfo | null;

        convert(inbuf: Uint8Array | string, outbuf: Uint8Array | string, flags: ConverterFlags): [ConverterResult, number, number];

        convert_bytes(bytes: GLib.Bytes | Uint8Array): GLib.Bytes;

        reset(): void;

        vfunc_convert(inbuf: Uint8Array | null, outbuf: Uint8Array, flags: ConverterFlags): [ConverterResult, bigint | number, bigint | number];

        vfunc_reset(): void;
    }


    class ActionEntry {
        static $gtype: GObject.GType<ActionEntry>;

        // Fields
        name: string;

        parameter_type: string;

        state: string;
    }


    type ActionGroupInterface = typeof ActionGroup;

    type ActionInterface = typeof Action;

    type ActionMapInterface = typeof ActionMap;

    type AppInfoIface = typeof AppInfo;

    type AppLaunchContextClass = typeof AppLaunchContext;

    abstract class AppLaunchContextPrivate {
        static $gtype: GObject.GType<AppLaunchContextPrivate>;
    }


    type ApplicationClass = typeof Application;

    type ApplicationCommandLineClass = typeof ApplicationCommandLine;

    abstract class ApplicationCommandLinePrivate {
        static $gtype: GObject.GType<ApplicationCommandLinePrivate>;
    }


    abstract class ApplicationPrivate {
        static $gtype: GObject.GType<ApplicationPrivate>;
    }


    type AsyncInitableIface = typeof AsyncInitable;

    type AsyncResultIface = typeof AsyncResult;

    type BufferedInputStreamClass = typeof BufferedInputStream;

    abstract class BufferedInputStreamPrivate {
        static $gtype: GObject.GType<BufferedInputStreamPrivate>;
    }


    type BufferedOutputStreamClass = typeof BufferedOutputStream;

    abstract class BufferedOutputStreamPrivate {
        static $gtype: GObject.GType<BufferedOutputStreamPrivate>;
    }


    type CancellableClass = typeof Cancellable;

    abstract class CancellablePrivate {
        static $gtype: GObject.GType<CancellablePrivate>;
    }


    type CharsetConverterClass = typeof CharsetConverter;

    type ConverterIface = typeof Converter;

    type ConverterInputStreamClass = typeof ConverterInputStream;

    abstract class ConverterInputStreamPrivate {
        static $gtype: GObject.GType<ConverterInputStreamPrivate>;
    }


    type ConverterOutputStreamClass = typeof ConverterOutputStream;

    abstract class ConverterOutputStreamPrivate {
        static $gtype: GObject.GType<ConverterOutputStreamPrivate>;
    }


    type CredentialsClass = typeof Credentials;

    type DBusActionGroupClass = typeof DBusActionGroup;

    class DBusAnnotationInfo {
        static $gtype: GObject.GType<DBusAnnotationInfo>;

        // Fields
        ref_count: number;

        key: string;

        value: string;

        annotations: DBusAnnotationInfo[];

        // Constructors

        constructor(properties?: Partial<{
            ref_count: number;
            key: string;
            value: string;
            annotations: DBusAnnotationInfo[];
        }>);

        // Static methods
        static lookup(annotations: DBusAnnotationInfo[] | null, name: string): string | null;

        // Methods
        ref(): DBusAnnotationInfo;

        unref(): void;
    }


    class DBusArgInfo {
        static $gtype: GObject.GType<DBusArgInfo>;

        // Fields
        ref_count: number;

        name: string;

        signature: string;

        annotations: DBusAnnotationInfo[];

        // Constructors

        constructor(properties?: Partial<{
            ref_count: number;
            name: string;
            signature: string;
            annotations: DBusAnnotationInfo[];
        }>);

        // Methods
        ref(): DBusArgInfo;

        unref(): void;
    }


    class DBusErrorEntry {
        static $gtype: GObject.GType<DBusErrorEntry>;

        // Fields
        error_code: number;

        dbus_error_name: string;

        // Constructors

        constructor(properties?: Partial<{
            error_code: number;
            dbus_error_name: string;
        }>);
    }


    type DBusInterfaceIface = typeof DBusInterface;

    class DBusInterfaceInfo {
        static $gtype: GObject.GType<DBusInterfaceInfo>;

        // Fields
        ref_count: number;

        name: string;

        methods: DBusMethodInfo[];

        signals: DBusSignalInfo[];

        properties: DBusPropertyInfo[];

        annotations: DBusAnnotationInfo[];

        // Constructors
        static new_for_xml(info: string): DBusInterfaceInfo;

        // Methods
        cache_build(): void;

        cache_release(): void;

        generate_xml(indent: number, string_builder: GLib.String): void;

        lookup_method(name: string): DBusMethodInfo | null;

        lookup_property(name: string): DBusPropertyInfo | null;

        lookup_signal(name: string): DBusSignalInfo | null;

        ref(): DBusInterfaceInfo;

        unref(): void;
    }


    type DBusInterfaceSkeletonClass = typeof DBusInterfaceSkeleton;

    abstract class DBusInterfaceSkeletonPrivate {
        static $gtype: GObject.GType<DBusInterfaceSkeletonPrivate>;
    }


    class DBusInterfaceVTable {
        static $gtype: GObject.GType<DBusInterfaceVTable>;

        // Fields
        method_call: DBusInterfaceMethodCallFunc;

        get_property: DBusInterfaceGetPropertyFunc;

        set_property: DBusInterfaceSetPropertyFunc;
    }


    class DBusMethodInfo {
        static $gtype: GObject.GType<DBusMethodInfo>;

        // Fields
        ref_count: number;

        name: string;

        in_args: DBusArgInfo[];

        out_args: DBusArgInfo[];

        annotations: DBusAnnotationInfo[];

        // Constructors

        constructor(properties?: Partial<{
            ref_count: number;
            name: string;
            in_args: DBusArgInfo[];
            out_args: DBusArgInfo[];
            annotations: DBusAnnotationInfo[];
        }>);

        // Methods
        ref(): DBusMethodInfo;

        unref(): void;
    }


    class DBusNodeInfo {
        static $gtype: GObject.GType<DBusNodeInfo>;

        // Fields
        ref_count: number;

        path: string;

        interfaces: DBusInterfaceInfo[];

        nodes: DBusNodeInfo[];

        annotations: DBusAnnotationInfo[];

        // Constructors
        constructor(xml_data: string);

        static new_for_xml(xml_data: string): DBusNodeInfo;

        static new_for_xml(info: string): DBusNodeInfo;

        // Methods
        generate_xml(indent: number, string_builder: GLib.String): void;

        lookup_interface(name: string): DBusInterfaceInfo | null;

        ref(): DBusNodeInfo;

        unref(): void;
    }


    type DBusObjectIface = typeof DBusObject;

    type DBusObjectManagerClientClass = typeof DBusObjectManagerClient;

    abstract class DBusObjectManagerClientPrivate {
        static $gtype: GObject.GType<DBusObjectManagerClientPrivate>;
    }


    type DBusObjectManagerIface = typeof DBusObjectManager;

    type DBusObjectManagerServerClass = typeof DBusObjectManagerServer;

    abstract class DBusObjectManagerServerPrivate {
        static $gtype: GObject.GType<DBusObjectManagerServerPrivate>;
    }


    type DBusObjectProxyClass = typeof DBusObjectProxy;

    abstract class DBusObjectProxyPrivate {
        static $gtype: GObject.GType<DBusObjectProxyPrivate>;
    }


    type DBusObjectSkeletonClass = typeof DBusObjectSkeleton;

    abstract class DBusObjectSkeletonPrivate {
        static $gtype: GObject.GType<DBusObjectSkeletonPrivate>;
    }


    class DBusPropertyInfo {
        static $gtype: GObject.GType<DBusPropertyInfo>;

        // Fields
        ref_count: number;

        name: string;

        signature: string;

        flags: DBusPropertyInfoFlags;

        annotations: DBusAnnotationInfo[];

        // Methods
        ref(): DBusPropertyInfo;

        unref(): void;
    }


    type DBusProxyClass = typeof DBusProxy;

    abstract class DBusProxyPrivate {
        static $gtype: GObject.GType<DBusProxyPrivate>;
    }


    class DBusSignalInfo {
        static $gtype: GObject.GType<DBusSignalInfo>;

        // Fields
        ref_count: number;

        name: string;

        args: DBusArgInfo[];

        annotations: DBusAnnotationInfo[];

        // Constructors

        constructor(properties?: Partial<{
            ref_count: number;
            name: string;
            args: DBusArgInfo[];
            annotations: DBusAnnotationInfo[];
        }>);

        // Methods
        ref(): DBusSignalInfo;

        unref(): void;
    }


    class DBusSubtreeVTable {
        static $gtype: GObject.GType<DBusSubtreeVTable>;

        // Fields
        enumerate: DBusSubtreeEnumerateFunc;

        introspect: DBusSubtreeIntrospectFunc;

        dispatch: DBusSubtreeDispatchFunc;
    }


    type DataInputStreamClass = typeof DataInputStream;

    abstract class DataInputStreamPrivate {
        static $gtype: GObject.GType<DataInputStreamPrivate>;
    }


    type DataOutputStreamClass = typeof DataOutputStream;

    abstract class DataOutputStreamPrivate {
        static $gtype: GObject.GType<DataOutputStreamPrivate>;
    }


    type DatagramBasedInterface = typeof DatagramBased;

    type DebugControllerDBusClass = typeof DebugControllerDBus;

    type DebugControllerInterface = typeof DebugController;

    type DriveIface = typeof Drive;

    type DtlsClientConnectionInterface = typeof DtlsClientConnection;

    type DtlsConnectionInterface = typeof DtlsConnection;

    type DtlsServerConnectionInterface = typeof DtlsServerConnection;

    type EmblemClass = typeof Emblem;

    type EmblemedIconClass = typeof EmblemedIcon;

    abstract class EmblemedIconPrivate {
        static $gtype: GObject.GType<EmblemedIconPrivate>;
    }


    class FileAttributeInfo {
        static $gtype: GObject.GType<FileAttributeInfo>;

        // Fields
        name: string;

        type: FileAttributeType;

        flags: FileAttributeInfoFlags;
    }


    class FileAttributeInfoList {
        static $gtype: GObject.GType<FileAttributeInfoList>;

        // Fields
        n_infos: number;

        // Constructors

        constructor(properties?: Partial<{
            n_infos: number;
        }>);

        static ["new"](): FileAttributeInfoList;

        // Methods
        add(name: string, type: FileAttributeType, flags: FileAttributeInfoFlags): void;

        dup(): FileAttributeInfoList;

        lookup(name: string): FileAttributeInfo;

        ref(): FileAttributeInfoList;

        unref(): void;
    }


    class FileAttributeMatcher {
        static $gtype: GObject.GType<FileAttributeMatcher>;

        // Constructors
        constructor(attributes: string);

        static ["new"](attributes: string): FileAttributeMatcher;

        // Methods
        enumerate_namespace(ns: string): boolean;

        enumerate_next(): string | null;

        matches(attribute: string): boolean;

        matches_only(attribute: string): boolean;

        ref(): FileAttributeMatcher;

        subtract(subtract: FileAttributeMatcher | null): FileAttributeMatcher | null;

        to_string(): string;

        unref(): void;
    }


    type FileEnumeratorClass = typeof FileEnumerator;

    abstract class FileEnumeratorPrivate {
        static $gtype: GObject.GType<FileEnumeratorPrivate>;
    }


    type FileIOStreamClass = typeof FileIOStream;

    abstract class FileIOStreamPrivate {
        static $gtype: GObject.GType<FileIOStreamPrivate>;
    }


    type FileIconClass = typeof FileIcon;

    type FileIface = typeof File;

    type FileInfoClass = typeof FileInfo;

    type FileInputStreamClass = typeof FileInputStream;

    abstract class FileInputStreamPrivate {
        static $gtype: GObject.GType<FileInputStreamPrivate>;
    }


    type FileMonitorClass = typeof FileMonitor;

    abstract class FileMonitorPrivate {
        static $gtype: GObject.GType<FileMonitorPrivate>;
    }


    type FileOutputStreamClass = typeof FileOutputStream;

    abstract class FileOutputStreamPrivate {
        static $gtype: GObject.GType<FileOutputStreamPrivate>;
    }


    type FilenameCompleterClass = typeof FilenameCompleter;

    type FilterInputStreamClass = typeof FilterInputStream;

    type FilterOutputStreamClass = typeof FilterOutputStream;

    abstract class IOExtension {
        static $gtype: GObject.GType<IOExtension>;

        // Methods
        get_name(): string;

        get_priority(): number;

        get_type(): GObject.GType;
    }


    abstract class IOExtensionPoint {
        static $gtype: GObject.GType<IOExtensionPoint>;

        // Static methods
        static implement(extension_point_name: string, type: GObject.GType, extension_name: string, priority: number): IOExtension;

        static lookup(name: string): IOExtensionPoint;

        static register(name: string): IOExtensionPoint;

        // Methods
        get_extension_by_name(name: string): IOExtension;

        get_extensions(): IOExtension[];

        get_required_type(): GObject.GType;

        set_required_type(type: GObject.GType): void;
    }


    type IOModuleClass = typeof IOModule;

    abstract class IOModuleScope {
        static $gtype: GObject.GType<IOModuleScope>;

        // Methods
        block(basename: string): void;

        free(): void;
    }


    abstract class IOSchedulerJob {
        static $gtype: GObject.GType<IOSchedulerJob>;

        // Methods
        send_to_mainloop(func: GLib.SourceFunc): boolean;

        send_to_mainloop_async(func: GLib.SourceFunc): void;
    }


    abstract class IOStreamAdapter {
        static $gtype: GObject.GType<IOStreamAdapter>;
    }


    type IOStreamClass = typeof IOStream;

    abstract class IOStreamPrivate {
        static $gtype: GObject.GType<IOStreamPrivate>;
    }


    type IPTosMessageClass = typeof IPTosMessage;

    type IPv6TclassMessageClass = typeof IPv6TclassMessage;

    type IconIface = typeof Icon;

    type InetAddressClass = typeof InetAddress;

    type InetAddressMaskClass = typeof InetAddressMask;

    abstract class InetAddressMaskPrivate {
        static $gtype: GObject.GType<InetAddressMaskPrivate>;
    }


    abstract class InetAddressPrivate {
        static $gtype: GObject.GType<InetAddressPrivate>;
    }


    type InetSocketAddressClass = typeof InetSocketAddress;

    abstract class InetSocketAddressPrivate {
        static $gtype: GObject.GType<InetSocketAddressPrivate>;
    }


    type InitableIface = typeof Initable;

    class InputMessage {
        static $gtype: GObject.GType<InputMessage>;

        // Fields
        address: SocketAddress;

        vectors: InputVector[];

        num_vectors: number;

        bytes_received: number;

        flags: number;

        control_messages: SocketControlMessage[];

        num_control_messages: number;
    }


    type InputStreamClass = typeof InputStream;

    abstract class InputStreamPrivate {
        static $gtype: GObject.GType<InputStreamPrivate>;
    }


    class InputVector {
        static $gtype: GObject.GType<InputVector>;

        // Fields
        buffer: null;

        size: number;
    }


    type ListModelInterface = typeof ListModel;

    type ListStoreClass = typeof ListStore;

    type LoadableIconIface = typeof LoadableIcon;

    type MemoryInputStreamClass = typeof MemoryInputStream;

    abstract class MemoryInputStreamPrivate {
        static $gtype: GObject.GType<MemoryInputStreamPrivate>;
    }


    type MemoryMonitorInterface = typeof MemoryMonitor;

    type MemoryOutputStreamClass = typeof MemoryOutputStream;

    abstract class MemoryOutputStreamPrivate {
        static $gtype: GObject.GType<MemoryOutputStreamPrivate>;
    }


    type MenuAttributeIterClass = typeof MenuAttributeIter;

    abstract class MenuAttributeIterPrivate {
        static $gtype: GObject.GType<MenuAttributeIterPrivate>;
    }


    type MenuLinkIterClass = typeof MenuLinkIter;

    abstract class MenuLinkIterPrivate {
        static $gtype: GObject.GType<MenuLinkIterPrivate>;
    }


    type MenuModelClass = typeof MenuModel;

    abstract class MenuModelPrivate {
        static $gtype: GObject.GType<MenuModelPrivate>;
    }


    type MountIface = typeof Mount;

    type MountOperationClass = typeof MountOperation;

    abstract class MountOperationPrivate {
        static $gtype: GObject.GType<MountOperationPrivate>;
    }


    type NativeSocketAddressClass = typeof NativeSocketAddress;

    abstract class NativeSocketAddressPrivate {
        static $gtype: GObject.GType<NativeSocketAddressPrivate>;
    }


    type NativeVolumeMonitorClass = typeof NativeVolumeMonitor;

    type NetworkAddressClass = typeof NetworkAddress;

    abstract class NetworkAddressPrivate {
        static $gtype: GObject.GType<NetworkAddressPrivate>;
    }


    type NetworkMonitorInterface = typeof NetworkMonitor;

    type NetworkServiceClass = typeof NetworkService;

    abstract class NetworkServicePrivate {
        static $gtype: GObject.GType<NetworkServicePrivate>;
    }


    class OutputMessage {
        static $gtype: GObject.GType<OutputMessage>;

        // Fields
        address: SocketAddress;

        num_vectors: number;

        bytes_sent: number;

        control_messages: SocketControlMessage[];

        num_control_messages: number;
    }


    type OutputStreamClass = typeof OutputStream;

    abstract class OutputStreamPrivate {
        static $gtype: GObject.GType<OutputStreamPrivate>;
    }


    class OutputVector {
        static $gtype: GObject.GType<OutputVector>;

        // Fields
        buffer: null;

        size: number;
    }


    type PermissionClass = typeof Permission;

    abstract class PermissionPrivate {
        static $gtype: GObject.GType<PermissionPrivate>;
    }


    type PollableInputStreamInterface = typeof PollableInputStream;

    type PollableOutputStreamInterface = typeof PollableOutputStream;

    type PowerProfileMonitorInterface = typeof PowerProfileMonitor;

    type ProxyAddressClass = typeof ProxyAddress;

    type ProxyAddressEnumeratorClass = typeof ProxyAddressEnumerator;

    abstract class ProxyAddressEnumeratorPrivate {
        static $gtype: GObject.GType<ProxyAddressEnumeratorPrivate>;
    }


    abstract class ProxyAddressPrivate {
        static $gtype: GObject.GType<ProxyAddressPrivate>;
    }


    type ProxyInterface = typeof Proxy;

    type ProxyResolverInterface = typeof ProxyResolver;

    type RemoteActionGroupInterface = typeof RemoteActionGroup;

    type ResolverClass = typeof Resolver;

    abstract class ResolverPrivate {
        static $gtype: GObject.GType<ResolverPrivate>;
    }


    class Resource {
        static $gtype: GObject.GType<Resource>;

        // Constructors
        constructor(data: GLib.Bytes | Uint8Array);

        static new_from_data(data: GLib.Bytes | Uint8Array): Resource;

        // Static methods
        static load(filename: string): Resource;

        // Methods
        _register(): void;

        _unregister(): void;

        enumerate_children(path: string, lookup_flags: ResourceLookupFlags): string[];

        get_info(path: string, lookup_flags: ResourceLookupFlags): [boolean, number, number];

        has_children(path: string): boolean;

        lookup_data(path: string, lookup_flags: ResourceLookupFlags): GLib.Bytes;

        open_stream(path: string, lookup_flags: ResourceLookupFlags): InputStream;

        ref(): Resource;

        unref(): void;
    }


    type SeekableIface = typeof Seekable;

    type SettingsBackendClass = typeof SettingsBackend;

    abstract class SettingsBackendPrivate {
        static $gtype: GObject.GType<SettingsBackendPrivate>;
    }


    type SettingsClass = typeof Settings;

    abstract class SettingsPrivate {
        static $gtype: GObject.GType<SettingsPrivate>;
    }


    abstract class SettingsSchema {
        static $gtype: GObject.GType<SettingsSchema>;

        // Fields
        _realGetKey: typeof SettingsSchema.prototype.get_key;

        // Methods
        get_id(): string;

        get_key(name: string): SettingsSchemaKey;

        get_path(): string | null;

        has_key(name: string): boolean;

        list_children(): string[];

        list_keys(): string[];

        ref(): SettingsSchema;

        unref(): void;
    }


    abstract class SettingsSchemaKey {
        static $gtype: GObject.GType<SettingsSchemaKey>;

        // Methods
        get_default_value(): GLib.Variant;

        get_description(): string | null;

        get_name(): string;

        get_range(): GLib.Variant;

        get_summary(): string | null;

        get_value_type(): GLib.VariantType;

        range_check(value: GLib.Variant): boolean;

        ref(): SettingsSchemaKey;

        unref(): void;
    }


    class SettingsSchemaSource {
        static $gtype: GObject.GType<SettingsSchemaSource>;

        // Constructors
        constructor(directory: string, parent: SettingsSchemaSource | null, trusted: boolean);

        static new_from_directory(directory: string, parent: SettingsSchemaSource | null, trusted: boolean): SettingsSchemaSource;

        // Static methods
        static get_default(): SettingsSchemaSource | null;

        // Methods
        list_schemas(recursive: boolean): [string[], string[]];

        lookup(schema_id: string, recursive: boolean): SettingsSchema | null;

        ref(): SettingsSchemaSource;

        unref(): void;
    }


    type SimpleActionGroupClass = typeof SimpleActionGroup;

    abstract class SimpleActionGroupPrivate {
        static $gtype: GObject.GType<SimpleActionGroupPrivate>;
    }


    type SimpleAsyncResultClass = typeof SimpleAsyncResult;

    type SimpleProxyResolverClass = typeof SimpleProxyResolver;

    abstract class SimpleProxyResolverPrivate {
        static $gtype: GObject.GType<SimpleProxyResolverPrivate>;
    }


    type SocketAddressClass = typeof SocketAddress;

    type SocketAddressEnumeratorClass = typeof SocketAddressEnumerator;

    type SocketClass = typeof Socket;

    type SocketClientClass = typeof SocketClient;

    abstract class SocketClientPrivate {
        static $gtype: GObject.GType<SocketClientPrivate>;
    }


    type SocketConnectableIface = typeof SocketConnectable;

    type SocketConnectionClass = typeof SocketConnection;

    abstract class SocketConnectionPrivate {
        static $gtype: GObject.GType<SocketConnectionPrivate>;
    }


    type SocketControlMessageClass = typeof SocketControlMessage;

    abstract class SocketControlMessagePrivate {
        static $gtype: GObject.GType<SocketControlMessagePrivate>;
    }


    type SocketListenerClass = typeof SocketListener;

    abstract class SocketListenerPrivate {
        static $gtype: GObject.GType<SocketListenerPrivate>;
    }


    abstract class SocketPrivate {
        static $gtype: GObject.GType<SocketPrivate>;
    }


    type SocketServiceClass = typeof SocketService;

    abstract class SocketServicePrivate {
        static $gtype: GObject.GType<SocketServicePrivate>;
    }


    class SrvTarget {
        static $gtype: GObject.GType<SrvTarget>;

        // Constructors
        constructor(hostname: string, port: number, priority: number, weight: number);

        static ["new"](hostname: string, port: number, priority: number, weight: number): SrvTarget;

        // Methods
        copy(): SrvTarget;

        free(): void;

        get_hostname(): string;

        get_port(): number;

        get_priority(): number;

        get_weight(): number;
    }


    class StaticResource {
        static $gtype: GObject.GType<StaticResource>;

        // Methods
        fini(): void;

        get_resource(): Resource;

        init(): void;
    }


    type TaskClass = typeof Task;

    type TcpConnectionClass = typeof TcpConnection;

    abstract class TcpConnectionPrivate {
        static $gtype: GObject.GType<TcpConnectionPrivate>;
    }


    type TcpWrapperConnectionClass = typeof TcpWrapperConnection;

    abstract class TcpWrapperConnectionPrivate {
        static $gtype: GObject.GType<TcpWrapperConnectionPrivate>;
    }


    type ThemedIconClass = typeof ThemedIcon;

    type ThreadedResolverClass = typeof ThreadedResolver;

    type ThreadedSocketServiceClass = typeof ThreadedSocketService;

    abstract class ThreadedSocketServicePrivate {
        static $gtype: GObject.GType<ThreadedSocketServicePrivate>;
    }


    type TlsBackendInterface = typeof TlsBackend;

    type TlsCertificateClass = typeof TlsCertificate;

    abstract class TlsCertificatePrivate {
        static $gtype: GObject.GType<TlsCertificatePrivate>;
    }


    type TlsClientConnectionInterface = typeof TlsClientConnection;

    type TlsConnectionClass = typeof TlsConnection;

    abstract class TlsConnectionPrivate {
        static $gtype: GObject.GType<TlsConnectionPrivate>;
    }


    type TlsDatabaseClass = typeof TlsDatabase;

    abstract class TlsDatabasePrivate {
        static $gtype: GObject.GType<TlsDatabasePrivate>;
    }


    type TlsFileDatabaseInterface = typeof TlsFileDatabase;

    type TlsInteractionClass = typeof TlsInteraction;

    abstract class TlsInteractionPrivate {
        static $gtype: GObject.GType<TlsInteractionPrivate>;
    }


    type TlsPasswordClass = typeof TlsPassword;

    abstract class TlsPasswordPrivate {
        static $gtype: GObject.GType<TlsPasswordPrivate>;
    }


    type TlsServerConnectionInterface = typeof TlsServerConnection;

    type UnixConnectionClass = typeof UnixConnection;

    abstract class UnixConnectionPrivate {
        static $gtype: GObject.GType<UnixConnectionPrivate>;
    }


    type UnixCredentialsMessageClass = typeof UnixCredentialsMessage;

    abstract class UnixCredentialsMessagePrivate {
        static $gtype: GObject.GType<UnixCredentialsMessagePrivate>;
    }


    type UnixFDListClass = typeof UnixFDList;

    abstract class UnixFDListPrivate {
        static $gtype: GObject.GType<UnixFDListPrivate>;
    }


    type UnixSocketAddressClass = typeof UnixSocketAddress;

    abstract class UnixSocketAddressPrivate {
        static $gtype: GObject.GType<UnixSocketAddressPrivate>;
    }


    type VfsClass = typeof Vfs;

    type VolumeIface = typeof Volume;

    type VolumeMonitorClass = typeof VolumeMonitor;

    type ZlibCompressorClass = typeof ZlibCompressor;

    type ZlibDecompressorClass = typeof ZlibDecompressor;

    namespace Action {
        /**
         * Interface for implementing Action.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_activate(parameter: GLib.Variant | null): void;

            vfunc_change_state(value: GLib.Variant): void;

            vfunc_get_enabled(): boolean;

            vfunc_get_name(): string;

            vfunc_get_parameter_type(): GLib.VariantType | null;

            vfunc_get_state(): GLib.Variant | null;

            vfunc_get_state_hint(): GLib.Variant | null;

            vfunc_get_state_type(): GLib.VariantType | null;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            enabled: boolean;
            name: string;
            parameter_type: GLib.VariantType | null;
            parameterType: GLib.VariantType | null;
            state: GLib.Variant | null;
            state_type: GLib.VariantType | null;
            stateType: GLib.VariantType | null;
        }
    }

    export interface ActionNamespace {
        $gtype: GObject.GType<Action>;
        prototype: Action;
        name_is_valid(action_name: string): boolean;
        parse_detailed_name(detailed_name: string): [boolean, string, GLib.Variant | null];
        print_detailed_name(action_name: string, target_value: GLib.Variant | null): string;
    }
    interface Action extends GObject.Object, Action.Interface {

        // Properties
        get enabled(): boolean;

        get name(): string;

        get parameter_type(): GLib.VariantType | null;

        get parameterType(): GLib.VariantType | null;

        get state(): GLib.Variant | null;

        get state_type(): GLib.VariantType | null;

        get stateType(): GLib.VariantType | null;

        // Methods
        activate(parameter: GLib.Variant | null): void;

        change_state(value: GLib.Variant): void;

        get_enabled(): boolean;

        get_name(): string;

        get_parameter_type(): GLib.VariantType | null;

        get_state(): GLib.Variant | null;

        get_state_hint(): GLib.Variant | null;

        get_state_type(): GLib.VariantType | null;
    }


    export const Action: ActionNamespace & {
        new (): Action; // This allows `obj instanceof Action`
    };

    namespace ActionGroup {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "action-added": (action_name: string) => void;
            /** @signal */
            "action-enabled-changed": (action_name: string, enabled: boolean) => void;
            /** @signal */
            "action-removed": (action_name: string) => void;
            /** @signal */
            "action-state-changed": (action_name: string, value: GLib.Variant) => void;
            [key: `action-added::${string}`]: (action_name: string) => void;
            [key: `action-enabled-changed::${string}`]: (action_name: string, enabled: boolean) => void;
            [key: `action-removed::${string}`]: (action_name: string) => void;
            [key: `action-state-changed::${string}`]: (action_name: string, value: GLib.Variant) => void;
        }
        /**
         * Interface for implementing ActionGroup.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_action_added(action_name: string): void;

            vfunc_action_enabled_changed(action_name: string, enabled: boolean): void;

            vfunc_action_removed(action_name: string): void;

            vfunc_action_state_changed(action_name: string, state: GLib.Variant): void;

            vfunc_activate_action(action_name: string, parameter: GLib.Variant | null): void;

            vfunc_change_action_state(action_name: string, value: GLib.Variant): void;

            vfunc_get_action_enabled(action_name: string): boolean;

            vfunc_get_action_parameter_type(action_name: string): GLib.VariantType | null;

            vfunc_get_action_state(action_name: string): GLib.Variant | null;

            vfunc_get_action_state_hint(action_name: string): GLib.Variant | null;

            vfunc_get_action_state_type(action_name: string): GLib.VariantType | null;

            vfunc_has_action(action_name: string): boolean;

            vfunc_list_actions(): string[];

            vfunc_query_action(action_name: string): [boolean, boolean, GLib.VariantType | null, GLib.VariantType | null, GLib.Variant | null, GLib.Variant | null];
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ActionGroupNamespace {
        $gtype: GObject.GType<ActionGroup>;
        prototype: ActionGroup;
    }
    interface ActionGroup extends GObject.Object, ActionGroup.Interface {

        // Methods
        action_added(action_name: string): void;

        action_enabled_changed(action_name: string, enabled: boolean): void;

        action_removed(action_name: string): void;

        action_state_changed(action_name: string, state: GLib.Variant): void;

        activate_action(action_name: string, parameter: GLib.Variant | null): void;

        change_action_state(action_name: string, value: GLib.Variant): void;

        get_action_enabled(action_name: string): boolean;

        get_action_parameter_type(action_name: string): GLib.VariantType | null;

        get_action_state(action_name: string): GLib.Variant | null;

        get_action_state_hint(action_name: string): GLib.Variant | null;

        get_action_state_type(action_name: string): GLib.VariantType | null;

        has_action(action_name: string): boolean;

        list_actions(): string[];

        query_action(action_name: string): [boolean, boolean, GLib.VariantType | null, GLib.VariantType | null, GLib.Variant | null, GLib.Variant | null];
    }


    export const ActionGroup: ActionGroupNamespace & {
        new (): ActionGroup; // This allows `obj instanceof ActionGroup`
    };

    namespace ActionMap {
        /**
         * Interface for implementing ActionMap.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_add_action(action: Action): void;

            vfunc_lookup_action(action_name: string): Action | null;

            vfunc_remove_action(action_name: string): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ActionMapNamespace {
        $gtype: GObject.GType<ActionMap>;
        prototype: ActionMap;
    }
    interface ActionMap extends GObject.Object, ActionMap.Interface {

        // Methods
        add_action(action: Action): void;

        add_action_entries(entries: ActionEntryObj[]): void;

        lookup_action(action_name: string): Action | null;

        remove_action(action_name: string): void;

        remove_action_entries(entries: ActionEntry[]): void;
    }


    export const ActionMap: ActionMapNamespace & {
        new (): ActionMap; // This allows `obj instanceof ActionMap`
    };

    namespace AppInfo {
        /**
         * Interface for implementing AppInfo.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_add_supports_type(content_type: string): boolean;

            vfunc_can_delete(): boolean;

            vfunc_can_remove_supports_type(): boolean;

            vfunc_do_delete(): boolean;

            vfunc_dup(): AppInfo;

            vfunc_equal(appinfo2: AppInfo): boolean;

            vfunc_get_commandline(): string | null;

            vfunc_get_description(): string | null;

            vfunc_get_display_name(): string;

            vfunc_get_executable(): string;

            vfunc_get_icon(): Icon | null;

            vfunc_get_id(): string | null;

            vfunc_get_name(): string;

            vfunc_get_supported_types(): string[] | null;

            vfunc_launch(files: File[] | null, context: AppLaunchContext | null): boolean;

            vfunc_launch_uris(uris: string[] | null, context: AppLaunchContext | null): boolean;

            vfunc_launch_uris_async(uris: string[] | null, context: AppLaunchContext | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_launch_uris_finish(result: AsyncResult): boolean;

            vfunc_remove_supports_type(content_type: string): boolean;

            vfunc_set_as_default_for_extension(extension: string): boolean;

            vfunc_set_as_default_for_type(content_type: string): boolean;

            vfunc_set_as_last_used_for_type(content_type: string): boolean;

            vfunc_should_show(): boolean;

            vfunc_supports_files(): boolean;

            vfunc_supports_uris(): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface AppInfoNamespace {
        $gtype: GObject.GType<AppInfo>;
        prototype: AppInfo;
        create_from_commandline(commandline: string, application_name: string | null, flags: AppInfoCreateFlags): AppInfo;
        get_all(): AppInfo[];
        get_all_for_type(content_type: string): AppInfo[];
        get_default_for_type(content_type: string, must_support_uris: boolean): AppInfo | null;
        get_default_for_type_async(content_type: string, must_support_uris: boolean, cancellable: Cancellable | null, callback: AsyncReadyCallback<AppInfo> | null): void;
        get_default_for_type_finish(result: AsyncResult): AppInfo;
        get_default_for_uri_scheme(uri_scheme: string): AppInfo | null;
        get_default_for_uri_scheme_async(uri_scheme: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<AppInfo> | null): void;
        get_default_for_uri_scheme_finish(result: AsyncResult): AppInfo;
        get_fallback_for_type(content_type: string): AppInfo[];
        get_recommended_for_type(content_type: string): AppInfo[];
        launch_default_for_uri(uri: string, context: AppLaunchContext | null): boolean;
        launch_default_for_uri_async(uri: string, context: AppLaunchContext | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<AppInfo> | null): void;
        launch_default_for_uri_finish(result: AsyncResult): boolean;
        reset_type_associations(content_type: string): void;
    }
    interface AppInfo extends GObject.Object, AppInfo.Interface {

        // Methods
        add_supports_type(content_type: string): boolean;

        can_delete(): boolean;

        can_remove_supports_type(): boolean;

        ["delete"](): boolean;

        dup(): AppInfo;

        equal(appinfo2: AppInfo): boolean;

        get_commandline(): string | null;

        get_description(): string | null;

        get_display_name(): string;

        get_executable(): string;

        get_icon(): Icon | null;

        get_id(): string | null;

        get_name(): string;

        get_supported_types(): string[] | null;

        launch(files: File[] | null, context: AppLaunchContext | null): boolean;

        launch_uris(uris: string[] | null, context: AppLaunchContext | null): boolean;

        launch_uris_async(uris: string[] | null, context: AppLaunchContext | null, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        launch_uris_async(uris: string[] | null, context: AppLaunchContext | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        launch_uris_async(uris: string[] | null, context: AppLaunchContext | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        launch_uris_finish(result: AsyncResult): boolean;

        remove_supports_type(content_type: string): boolean;

        set_as_default_for_extension(extension: string): boolean;

        set_as_default_for_type(content_type: string): boolean;

        set_as_last_used_for_type(content_type: string): boolean;

        should_show(): boolean;

        supports_files(): boolean;

        supports_uris(): boolean;
    }


    export const AppInfo: AppInfoNamespace & {
        new (): AppInfo; // This allows `obj instanceof AppInfo`
    };

    namespace AsyncInitable {
        /**
         * Interface for implementing AsyncInitable.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface<A extends GObject.Object = GObject.Object> {

            // Virtual methods
            vfunc_init_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_init_finish(res: AsyncResult): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps<A extends GObject.Object = GObject.Object> extends GObject.Object.ConstructorProps {}
    }

    export interface AsyncInitableNamespace {
        $gtype: GObject.GType<AsyncInitable>;
        prototype: AsyncInitable;
        newv_async(object_type: GObject.GType, n_parameters: number, parameters: GObject.Parameter, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<AsyncInitable> | null): void;
    }
    interface AsyncInitable<A extends GObject.Object = GObject.Object> extends GObject.Object, AsyncInitable.Interface<A> {

        // Methods
        init_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: AsyncResult): boolean;

        new_finish(res: AsyncResult): A;
    }


    export const AsyncInitable: AsyncInitableNamespace & {
        new (): AsyncInitable; // This allows `obj instanceof AsyncInitable`
    };

    namespace AsyncResult {
        /**
         * Interface for implementing AsyncResult.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_source_object<T = GObject.Object>(): T;

            vfunc_get_user_data(): null;

            vfunc_is_tagged(source_tag: null): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface AsyncResultNamespace {
        $gtype: GObject.GType<AsyncResult>;
        prototype: AsyncResult;
    }
    interface AsyncResult extends GObject.Object, AsyncResult.Interface {

        // Methods
        get_source_object<T = GObject.Object>(): T;

        get_user_data(): null;

        is_tagged(source_tag: null): boolean;

        legacy_propagate_error(): boolean;
    }


    export const AsyncResult: AsyncResultNamespace & {
        new (): AsyncResult; // This allows `obj instanceof AsyncResult`
    };

    namespace Converter {
        /**
         * Interface for implementing Converter.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_convert(inbuf: Uint8Array | null, outbuf: Uint8Array, flags: ConverterFlags): [ConverterResult, bigint | number, bigint | number];

            vfunc_reset(): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ConverterNamespace {
        $gtype: GObject.GType<Converter>;
        prototype: Converter;
    }
    interface Converter extends GObject.Object, Converter.Interface {

        // Methods
        convert(inbuf: Uint8Array | string, outbuf: Uint8Array | string, flags: ConverterFlags): [ConverterResult, number, number];

        convert_bytes(bytes: GLib.Bytes | Uint8Array): GLib.Bytes;

        reset(): void;
    }


    export const Converter: ConverterNamespace & {
        new (): Converter; // This allows `obj instanceof Converter`
    };

    namespace DBusInterface {
        /**
         * Interface for implementing DBusInterface.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_dup_object(): DBusObject | null;

            vfunc_get_info(): DBusInterfaceInfo | null;

            vfunc_set_object(object: DBusObject | null): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface DBusInterfaceNamespace {
        $gtype: GObject.GType<DBusInterface>;
        prototype: DBusInterface;
    }
    interface DBusInterface extends GObject.Object, DBusInterface.Interface {

        // Methods
        get_object(): DBusObject | null;

        get_info(): DBusInterfaceInfo | null;

        set_object(object: DBusObject | null): void;
    }


    export const DBusInterface: DBusInterfaceNamespace & {
        new (): DBusInterface; // This allows `obj instanceof DBusInterface`
    };

    namespace DBusObject {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "interface-added": (_interface: DBusInterface) => void;
            /** @signal */
            "interface-removed": (_interface: DBusInterface) => void;
        }
        /**
         * Interface for implementing DBusObject.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_interface(interface_name: string): DBusInterface | null;

            vfunc_get_interfaces(): DBusInterface[];

            vfunc_get_object_path(): string;

            vfunc_interface_added(interface_: DBusInterface): void;

            vfunc_interface_removed(interface_: DBusInterface): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface DBusObjectNamespace {
        $gtype: GObject.GType<DBusObject>;
        prototype: DBusObject;
    }
    interface DBusObject extends GObject.Object, DBusObject.Interface {

        // Methods
        get_interface(interface_name: string): DBusInterface | null;

        get_interfaces(): DBusInterface[];

        get_object_path(): string;
    }


    export const DBusObject: DBusObjectNamespace & {
        new (): DBusObject; // This allows `obj instanceof DBusObject`
    };

    namespace DBusObjectManager {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "interface-added": (object: DBusObject, _interface: DBusInterface) => void;
            /** @signal */
            "interface-removed": (object: DBusObject, _interface: DBusInterface) => void;
            /** @signal */
            "object-added": (object: DBusObject) => void;
            /** @signal */
            "object-removed": (object: DBusObject) => void;
        }
        /**
         * Interface for implementing DBusObjectManager.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_interface(object_path: string, interface_name: string): DBusInterface | null;

            vfunc_get_object(object_path: string): DBusObject | null;

            vfunc_get_object_path(): string;

            vfunc_get_objects(): DBusObject[];

            vfunc_interface_added(object: DBusObject, interface_: DBusInterface): void;

            vfunc_interface_removed(object: DBusObject, interface_: DBusInterface): void;

            vfunc_object_added(object: DBusObject): void;

            vfunc_object_removed(object: DBusObject): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface DBusObjectManagerNamespace {
        $gtype: GObject.GType<DBusObjectManager>;
        prototype: DBusObjectManager;
    }
    interface DBusObjectManager extends GObject.Object, DBusObjectManager.Interface {

        // Methods
        get_interface(object_path: string, interface_name: string): DBusInterface | null;

        get_object(object_path: string): DBusObject | null;

        get_object_path(): string;

        get_objects(): DBusObject[];
    }


    export const DBusObjectManager: DBusObjectManagerNamespace & {
        new (): DBusObjectManager; // This allows `obj instanceof DBusObjectManager`
    };

    namespace DatagramBased {
        /**
         * Interface for implementing DatagramBased.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_condition_check(condition: GLib.IOCondition): GLib.IOCondition;

            vfunc_condition_wait(condition: GLib.IOCondition, timeout: number, cancellable: Cancellable | null): boolean;

            vfunc_create_source(condition: GLib.IOCondition, cancellable: Cancellable | null): GLib.Source;

            vfunc_receive_messages(messages: InputMessage[], flags: number, timeout: number, cancellable: Cancellable | null): number;

            vfunc_send_messages(messages: OutputMessage[], flags: number, timeout: number, cancellable: Cancellable | null): number;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface DatagramBasedNamespace {
        $gtype: GObject.GType<DatagramBased>;
        prototype: DatagramBased;
    }
    interface DatagramBased extends GObject.Object, DatagramBased.Interface {

        // Methods
        condition_check(condition: GLib.IOCondition): GLib.IOCondition;

        condition_wait(condition: GLib.IOCondition, timeout: bigint | number, cancellable: Cancellable | null): boolean;

        create_source(condition: GLib.IOCondition, cancellable: Cancellable | null): GLib.Source;

        receive_messages(messages: InputMessage[], flags: number, timeout: bigint | number, cancellable: Cancellable | null): number;

        send_messages(messages: OutputMessage[], flags: number, timeout: bigint | number, cancellable: Cancellable | null): number;
    }


    export const DatagramBased: DatagramBasedNamespace & {
        new (): DatagramBased; // This allows `obj instanceof DatagramBased`
    };

    namespace DebugController {

        // Constructor properties interface
        interface ConstructorProps extends Initable.ConstructorProps {
            debug_enabled: boolean;
            debugEnabled: boolean;
        }
    }

    export interface DebugControllerNamespace {
        $gtype: GObject.GType<DebugController>;
        prototype: DebugController;
    }
    interface DebugController extends Initable {

        // Properties
        get debug_enabled(): boolean;
        set debug_enabled(val: boolean);

        get debugEnabled(): boolean;
        set debugEnabled(val: boolean);

        // Methods
        get_debug_enabled(): boolean;

        set_debug_enabled(debug_enabled: boolean): void;
    }


    export const DebugController: DebugControllerNamespace & {
        new (): DebugController; // This allows `obj instanceof DebugController`
    };

    namespace Drive {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            changed: () => void;
            /** @signal */
            disconnected: () => void;
            /** @signal */
            "eject-button": () => void;
            /** @signal */
            "stop-button": () => void;
        }
        /**
         * Interface for implementing Drive.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_can_eject(): boolean;

            vfunc_can_poll_for_media(): boolean;

            vfunc_can_start(): boolean;

            vfunc_can_start_degraded(): boolean;

            vfunc_can_stop(): boolean;

            vfunc_changed(): void;

            vfunc_disconnected(): void;

            vfunc_eject(flags: MountUnmountFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_eject_button(): void;

            vfunc_eject_finish(result: AsyncResult): boolean;

            vfunc_eject_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_eject_with_operation_finish(result: AsyncResult): boolean;

            vfunc_enumerate_identifiers(): string[];

            vfunc_get_icon(): Icon;

            vfunc_get_identifier(kind: string): string | null;

            vfunc_get_name(): string;

            vfunc_get_sort_key(): string | null;

            vfunc_get_start_stop_type(): DriveStartStopType;

            vfunc_get_symbolic_icon(): Icon;

            vfunc_get_volumes(): Volume[];

            vfunc_has_media(): boolean;

            vfunc_has_volumes(): boolean;

            vfunc_is_media_check_automatic(): boolean;

            vfunc_is_media_removable(): boolean;

            vfunc_is_removable(): boolean;

            vfunc_poll_for_media(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_poll_for_media_finish(result: AsyncResult): boolean;

            vfunc_start(flags: DriveStartFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_start_finish(result: AsyncResult): boolean;

            vfunc_stop(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_stop_button(): void;

            vfunc_stop_finish(result: AsyncResult): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface DriveNamespace {
        $gtype: GObject.GType<Drive>;
        prototype: Drive;
    }
    interface Drive extends GObject.Object, Drive.Interface {

        // Methods
        can_eject(): boolean;

        can_poll_for_media(): boolean;

        can_start(): boolean;

        can_start_degraded(): boolean;

        can_stop(): boolean;

        eject(flags: MountUnmountFlags, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        eject(flags: MountUnmountFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        eject(flags: MountUnmountFlags, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        eject_finish(result: AsyncResult): boolean;

        eject_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        eject_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        eject_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        eject_with_operation_finish(result: AsyncResult): boolean;

        enumerate_identifiers(): string[];

        get_icon(): Icon;

        get_identifier(kind: string): string | null;

        get_name(): string;

        get_sort_key(): string | null;

        get_start_stop_type(): DriveStartStopType;

        get_symbolic_icon(): Icon;

        get_volumes(): Volume[];

        has_media(): boolean;

        has_volumes(): boolean;

        is_media_check_automatic(): boolean;

        is_media_removable(): boolean;

        is_removable(): boolean;

        poll_for_media(cancellable: Cancellable | null): globalThis.Promise<boolean>;

        poll_for_media(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        poll_for_media(cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        poll_for_media_finish(result: AsyncResult): boolean;

        start(flags: DriveStartFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        start(flags: DriveStartFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        start(flags: DriveStartFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        start_finish(result: AsyncResult): boolean;

        stop(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        stop(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        stop(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        stop_finish(result: AsyncResult): boolean;
    }


    export const Drive: DriveNamespace & {
        new (): Drive; // This allows `obj instanceof Drive`
    };

    namespace DtlsClientConnection {

        // Constructor properties interface
        interface ConstructorProps extends DatagramBased.ConstructorProps {
            accepted_cas: never[];
            acceptedCas: never[];
            server_identity: SocketConnectable;
            serverIdentity: SocketConnectable;
            validation_flags: TlsCertificateFlags;
            validationFlags: TlsCertificateFlags;
        }
    }

    export interface DtlsClientConnectionNamespace {
        $gtype: GObject.GType<DtlsClientConnection>;
        prototype: DtlsClientConnection;
        ["new"](base_socket: DatagramBased, server_identity: SocketConnectable | null): DtlsClientConnection;
    }
    interface DtlsClientConnection extends DatagramBased {

        // Properties
        get accepted_cas(): null[];

        get acceptedCas(): null[];

        get server_identity(): SocketConnectable;
        set server_identity(val: SocketConnectable);

        get serverIdentity(): SocketConnectable;
        set serverIdentity(val: SocketConnectable);

        get validation_flags(): TlsCertificateFlags;
        set validation_flags(val: TlsCertificateFlags);

        get validationFlags(): TlsCertificateFlags;
        set validationFlags(val: TlsCertificateFlags);

        // Methods
        get_accepted_cas(): GLib.List;

        get_server_identity(): SocketConnectable;

        get_validation_flags(): TlsCertificateFlags;

        set_server_identity(identity: SocketConnectable): void;

        set_validation_flags(flags: TlsCertificateFlags): void;
    }


    export const DtlsClientConnection: DtlsClientConnectionNamespace & {
        new (): DtlsClientConnection; // This allows `obj instanceof DtlsClientConnection`
    };

    namespace DtlsConnection {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "accept-certificate": (peer_cert: TlsCertificate, errors: TlsCertificateFlags) => boolean | void;
        }
        /**
         * Interface for implementing DtlsConnection.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface extends DatagramBased.Interface {

            // Virtual methods
            vfunc_accept_certificate(peer_cert: TlsCertificate, errors: TlsCertificateFlags): boolean;

            vfunc_get_binding_data(type: TlsChannelBindingType, data: Uint8Array): boolean;

            vfunc_get_negotiated_protocol(): string | null;

            vfunc_handshake(cancellable: Cancellable | null): boolean;

            vfunc_handshake_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_handshake_finish(result: AsyncResult): boolean;

            vfunc_set_advertised_protocols(protocols: string[] | null): void;

            vfunc_shutdown(shutdown_read: boolean, shutdown_write: boolean, cancellable: Cancellable | null): boolean;

            vfunc_shutdown_async(shutdown_read: boolean, shutdown_write: boolean, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_shutdown_finish(result: AsyncResult): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends DatagramBased.ConstructorProps {
            advertised_protocols: string[];
            advertisedProtocols: string[];
            base_socket: DatagramBased;
            baseSocket: DatagramBased;
            certificate: TlsCertificate | null;
            ciphersuite_name: string | null;
            ciphersuiteName: string | null;
            database: TlsDatabase | null;
            interaction: TlsInteraction | null;
            negotiated_protocol: string | null;
            negotiatedProtocol: string | null;
            peer_certificate: TlsCertificate | null;
            peerCertificate: TlsCertificate | null;
            peer_certificate_errors: TlsCertificateFlags;
            peerCertificateErrors: TlsCertificateFlags;
            protocol_version: TlsProtocolVersion;
            protocolVersion: TlsProtocolVersion;
            rehandshake_mode: TlsRehandshakeMode;
            rehandshakeMode: TlsRehandshakeMode;
            require_close_notify: boolean;
            requireCloseNotify: boolean;
        }
    }

    export interface DtlsConnectionNamespace {
        $gtype: GObject.GType<DtlsConnection>;
        prototype: DtlsConnection;
    }
    interface DtlsConnection extends DatagramBased, DtlsConnection.Interface {

        // Properties
        get advertised_protocols(): string[];
        set advertised_protocols(val: string[]);

        get advertisedProtocols(): string[];
        set advertisedProtocols(val: string[]);

        get base_socket(): DatagramBased;

        get baseSocket(): DatagramBased;

        get certificate(): TlsCertificate | null;
        set certificate(val: TlsCertificate | null);

        get ciphersuite_name(): string | null;

        get ciphersuiteName(): string | null;

        get database(): TlsDatabase | null;
        set database(val: TlsDatabase | null);

        get interaction(): TlsInteraction | null;
        set interaction(val: TlsInteraction | null);

        get negotiated_protocol(): string | null;

        get negotiatedProtocol(): string | null;

        get peer_certificate(): TlsCertificate | null;

        get peerCertificate(): TlsCertificate | null;

        get peer_certificate_errors(): TlsCertificateFlags;

        get peerCertificateErrors(): TlsCertificateFlags;

        get protocol_version(): TlsProtocolVersion;

        get protocolVersion(): TlsProtocolVersion;

        get rehandshake_mode(): TlsRehandshakeMode;
        set rehandshake_mode(val: TlsRehandshakeMode);

        get rehandshakeMode(): TlsRehandshakeMode;
        set rehandshakeMode(val: TlsRehandshakeMode);

        get require_close_notify(): boolean;
        set require_close_notify(val: boolean);

        get requireCloseNotify(): boolean;
        set requireCloseNotify(val: boolean);

        // Methods
        close(cancellable: Cancellable | null): boolean;

        close_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        close_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        close_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        close_finish(result: AsyncResult): boolean;

        emit_accept_certificate(peer_cert: TlsCertificate, errors: TlsCertificateFlags): boolean;

        get_certificate(): TlsCertificate | null;

        get_channel_binding_data(type: TlsChannelBindingType): [boolean, Uint8Array | null];

        get_ciphersuite_name(): string | null;

        get_database(): TlsDatabase | null;

        get_interaction(): TlsInteraction | null;

        get_negotiated_protocol(): string | null;

        get_peer_certificate(): TlsCertificate | null;

        get_peer_certificate_errors(): TlsCertificateFlags;

        get_protocol_version(): TlsProtocolVersion;

        get_rehandshake_mode(): TlsRehandshakeMode;

        get_require_close_notify(): boolean;

        handshake(cancellable: Cancellable | null): boolean;

        handshake_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        handshake_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        handshake_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        handshake_finish(result: AsyncResult): boolean;

        set_advertised_protocols(protocols: string[] | null): void;

        set_certificate(certificate: TlsCertificate): void;

        set_database(database: TlsDatabase | null): void;

        set_interaction(interaction: TlsInteraction | null): void;

        set_rehandshake_mode(mode: TlsRehandshakeMode): void;

        set_require_close_notify(require_close_notify: boolean): void;

        shutdown(shutdown_read: boolean, shutdown_write: boolean, cancellable: Cancellable | null): boolean;

        shutdown_async(shutdown_read: boolean, shutdown_write: boolean, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        shutdown_async(shutdown_read: boolean, shutdown_write: boolean, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        shutdown_async(shutdown_read: boolean, shutdown_write: boolean, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        shutdown_finish(result: AsyncResult): boolean;
    }


    export const DtlsConnection: DtlsConnectionNamespace & {
        new (): DtlsConnection; // This allows `obj instanceof DtlsConnection`
    };

    namespace DtlsServerConnection {

        // Constructor properties interface
        interface ConstructorProps extends DatagramBased.ConstructorProps {
            authentication_mode: TlsAuthenticationMode;
            authenticationMode: TlsAuthenticationMode;
        }
    }

    export interface DtlsServerConnectionNamespace {
        $gtype: GObject.GType<DtlsServerConnection>;
        prototype: DtlsServerConnection;
        ["new"](base_socket: DatagramBased, certificate: TlsCertificate | null): DtlsServerConnection;
    }
    interface DtlsServerConnection extends DatagramBased {

        // Properties
        get authentication_mode(): TlsAuthenticationMode;
        set authentication_mode(val: TlsAuthenticationMode);

        get authenticationMode(): TlsAuthenticationMode;
        set authenticationMode(val: TlsAuthenticationMode);
    }


    export const DtlsServerConnection: DtlsServerConnectionNamespace & {
        new (): DtlsServerConnection; // This allows `obj instanceof DtlsServerConnection`
    };

    namespace File {
        /**
         * Interface for implementing File.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_append_to(flags: FileCreateFlags, cancellable: Cancellable | null): FileOutputStream;

            vfunc_append_to_async(flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_append_to_finish(res: AsyncResult): FileOutputStream;

            vfunc_copy(destination: File, flags: FileCopyFlags, cancellable: Cancellable | null, progress_callback: FileProgressCallback | null): boolean;

            vfunc_copy_async(destination: File, flags: FileCopyFlags, io_priority: number, cancellable: Cancellable | null, progress_callback: FileProgressCallback | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_copy_finish(res: AsyncResult): boolean;

            vfunc_create(flags: FileCreateFlags, cancellable: Cancellable | null): FileOutputStream;

            vfunc_create_async(flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_create_finish(res: AsyncResult): FileOutputStream;

            vfunc_create_readwrite(flags: FileCreateFlags, cancellable: Cancellable | null): FileIOStream;

            vfunc_create_readwrite_async(flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_create_readwrite_finish(res: AsyncResult): FileIOStream;

            vfunc_delete_file(cancellable: Cancellable | null): boolean;

            vfunc_delete_file_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_delete_file_finish(result: AsyncResult): boolean;

            vfunc_dup(): File;

            vfunc_eject_mountable(flags: MountUnmountFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_eject_mountable_finish(result: AsyncResult): boolean;

            vfunc_eject_mountable_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_eject_mountable_with_operation_finish(result: AsyncResult): boolean;

            vfunc_enumerate_children(attributes: string, flags: FileQueryInfoFlags, cancellable: Cancellable | null): FileEnumerator;

            vfunc_enumerate_children_async(attributes: string, flags: FileQueryInfoFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_enumerate_children_finish(res: AsyncResult): FileEnumerator;

            vfunc_equal(file2: File): boolean;

            vfunc_find_enclosing_mount(cancellable: Cancellable | null): Mount;

            vfunc_find_enclosing_mount_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_find_enclosing_mount_finish(res: AsyncResult): Mount;

            vfunc_get_basename(): string | null;

            vfunc_get_child_for_display_name(display_name: string): File;

            vfunc_get_parent(): File | null;

            vfunc_get_parse_name(): string;

            vfunc_get_path(): string | null;

            vfunc_get_relative_path(descendant: File): string | null;

            vfunc_get_uri(): string;

            vfunc_get_uri_scheme(): string | null;

            vfunc_has_uri_scheme(uri_scheme: string): boolean;

            vfunc_hash(): number;

            vfunc_is_native(): boolean;

            vfunc_make_directory(cancellable: Cancellable | null): boolean;

            vfunc_make_directory_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_make_directory_finish(result: AsyncResult): boolean;

            vfunc_make_symbolic_link(symlink_value: string, cancellable: Cancellable | null): boolean;

            vfunc_make_symbolic_link_async(symlink_value: string, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_make_symbolic_link_finish(result: AsyncResult): boolean;

            vfunc_measure_disk_usage(flags: FileMeasureFlags, cancellable: Cancellable | null, progress_callback: FileMeasureProgressCallback | null): [boolean, bigint | number, bigint | number, bigint | number];

            vfunc_measure_disk_usage_finish(result: AsyncResult): [boolean, bigint | number, bigint | number, bigint | number];

            vfunc_monitor_dir(flags: FileMonitorFlags, cancellable: Cancellable | null): FileMonitor;

            vfunc_monitor_file(flags: FileMonitorFlags, cancellable: Cancellable | null): FileMonitor;

            vfunc_mount_enclosing_volume(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_mount_enclosing_volume_finish(result: AsyncResult): boolean;

            vfunc_mount_mountable(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_mount_mountable_finish(result: AsyncResult): File;

            vfunc_move(destination: File, flags: FileCopyFlags, cancellable: Cancellable | null, progress_callback: FileProgressCallback | null): boolean;

            vfunc_move_async(destination: File, flags: FileCopyFlags, io_priority: number, cancellable: Cancellable | null, progress_callback: FileProgressCallback | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_move_finish(result: AsyncResult): boolean;

            vfunc_open_readwrite(cancellable: Cancellable | null): FileIOStream;

            vfunc_open_readwrite_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_open_readwrite_finish(res: AsyncResult): FileIOStream;

            vfunc_poll_mountable(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_poll_mountable_finish(result: AsyncResult): boolean;

            vfunc_prefix_matches(file: File): boolean;

            vfunc_query_exists(cancellable: Cancellable | null): boolean;

            vfunc_query_filesystem_info(attributes: string, cancellable: Cancellable | null): FileInfo;

            vfunc_query_filesystem_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_query_filesystem_info_finish(res: AsyncResult): FileInfo;

            vfunc_query_info(attributes: string, flags: FileQueryInfoFlags, cancellable: Cancellable | null): FileInfo;

            vfunc_query_info_async(attributes: string, flags: FileQueryInfoFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_query_info_finish(res: AsyncResult): FileInfo;

            vfunc_query_settable_attributes(cancellable: Cancellable | null): FileAttributeInfoList;

            vfunc_query_writable_namespaces(cancellable: Cancellable | null): FileAttributeInfoList;

            vfunc_read_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_read_finish(res: AsyncResult): FileInputStream;

            vfunc_read_fn(cancellable: Cancellable | null): FileInputStream;

            vfunc_replace(etag: string | null, make_backup: boolean, flags: FileCreateFlags, cancellable: Cancellable | null): FileOutputStream;

            vfunc_replace_async(etag: string | null, make_backup: boolean, flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_replace_finish(res: AsyncResult): FileOutputStream;

            vfunc_replace_readwrite(etag: string | null, make_backup: boolean, flags: FileCreateFlags, cancellable: Cancellable | null): FileIOStream;

            vfunc_replace_readwrite_async(etag: string | null, make_backup: boolean, flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_replace_readwrite_finish(res: AsyncResult): FileIOStream;

            vfunc_resolve_relative_path(relative_path: string): File;

            vfunc_set_attribute(attribute: string, type: FileAttributeType, value_p: null, flags: FileQueryInfoFlags, cancellable: Cancellable | null): boolean;

            vfunc_set_attributes_async(info: FileInfo, flags: FileQueryInfoFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_set_attributes_finish(result: AsyncResult): [boolean, FileInfo];

            vfunc_set_attributes_from_info(info: FileInfo, flags: FileQueryInfoFlags, cancellable: Cancellable | null): boolean;

            vfunc_set_display_name(display_name: string, cancellable: Cancellable | null): File;

            vfunc_set_display_name_async(display_name: string, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_set_display_name_finish(res: AsyncResult): File;

            vfunc_start_mountable(flags: DriveStartFlags, start_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_start_mountable_finish(result: AsyncResult): boolean;

            vfunc_stop_mountable(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_stop_mountable_finish(result: AsyncResult): boolean;

            vfunc_trash(cancellable: Cancellable | null): boolean;

            vfunc_trash_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_trash_finish(result: AsyncResult): boolean;

            vfunc_unmount_mountable(flags: MountUnmountFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_unmount_mountable_finish(result: AsyncResult): boolean;

            vfunc_unmount_mountable_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_unmount_mountable_with_operation_finish(result: AsyncResult): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface FileNamespace {
        $gtype: GObject.GType<File>;
        prototype: File;
        new_build_filenamev(args: string[]): File;
        new_for_commandline_arg(arg: string): File;
        new_for_commandline_arg_and_cwd(arg: string, cwd: string): File;
        new_for_path(path: string): File;
        new_for_uri(uri: string): File;
        new_tmp(tmpl: string | null): [File, FileIOStream];
        new_tmp_async(tmpl: string | null, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<File> | null): void;
        new_tmp_dir_async(tmpl: string | null, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<File> | null): void;
        new_tmp_dir_finish(result: AsyncResult): File;
        new_tmp_finish(result: AsyncResult): [File, FileIOStream];
        parse_name(parse_name: string): File;
    }
    interface File extends GObject.Object, File.Interface {

        // Methods
        append_to(flags: FileCreateFlags, cancellable: Cancellable | null): FileOutputStream;

        append_to_async(flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<FileOutputStream>;

        append_to_async(flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        append_to_async(flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<FileOutputStream> | void;

        append_to_finish(res: AsyncResult): FileOutputStream;

        build_attribute_list_for_copy(flags: FileCopyFlags, cancellable: Cancellable | null): string;

        copy(destination: File, flags: FileCopyFlags, cancellable: Cancellable | null, progress_callback: FileProgressCallback | null): boolean;

        copy_async(destination: File, flags: FileCopyFlags, io_priority: number, cancellable: Cancellable | null, progress_callback_closure: GObject.Closure | null, ready_callback_closure: GObject.Closure): void;

        copy_attributes(destination: File, flags: FileCopyFlags, cancellable: Cancellable | null): boolean;

        copy_finish(res: AsyncResult): boolean;

        create(flags: FileCreateFlags, cancellable: Cancellable | null): FileOutputStream;

        create_async(flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<FileOutputStream>;

        create_async(flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        create_async(flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<FileOutputStream> | void;

        create_finish(res: AsyncResult): FileOutputStream;

        create_readwrite(flags: FileCreateFlags, cancellable: Cancellable | null): FileIOStream;

        create_readwrite_async(flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<FileIOStream>;

        create_readwrite_async(flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        create_readwrite_async(flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<FileIOStream> | void;

        create_readwrite_finish(res: AsyncResult): FileIOStream;

        ["delete"](cancellable: Cancellable | null): boolean;

        delete_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        delete_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        delete_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        delete_finish(result: AsyncResult): boolean;

        dup(): File;

        eject_mountable(flags: MountUnmountFlags, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        eject_mountable(flags: MountUnmountFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        eject_mountable(flags: MountUnmountFlags, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        eject_mountable_finish(result: AsyncResult): boolean;

        eject_mountable_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        eject_mountable_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        eject_mountable_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        eject_mountable_with_operation_finish(result: AsyncResult): boolean;

        enumerate_children(attributes: string, flags: FileQueryInfoFlags, cancellable: Cancellable | null): FileEnumerator;

        enumerate_children_async(attributes: string, flags: FileQueryInfoFlags, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<FileEnumerator>;

        enumerate_children_async(attributes: string, flags: FileQueryInfoFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        enumerate_children_async(attributes: string, flags: FileQueryInfoFlags, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<FileEnumerator> | void;

        enumerate_children_finish(res: AsyncResult): FileEnumerator;

        equal(file2: File): boolean;

        find_enclosing_mount(cancellable: Cancellable | null): Mount;

        find_enclosing_mount_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<Mount>;

        find_enclosing_mount_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        find_enclosing_mount_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<Mount> | void;

        find_enclosing_mount_finish(res: AsyncResult): Mount;

        get_basename(): string | null;

        get_child(name: string): File;

        get_child_for_display_name(display_name: string): File;

        get_parent(): File | null;

        get_parse_name(): string;

        get_path(): string | null;

        get_relative_path(descendant: File): string | null;

        get_uri(): string;

        get_uri_scheme(): string | null;

        has_parent(parent: File | null): boolean;

        has_prefix(prefix: File): boolean;

        has_uri_scheme(uri_scheme: string): boolean;

        hash(): number;

        is_native(): boolean;

        load_bytes(cancellable: Cancellable | null): [GLib.Bytes, string];

        load_bytes_async(cancellable: Cancellable | null): globalThis.Promise<[GLib.Bytes, string]>;

        load_bytes_async(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        load_bytes_async(cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<[GLib.Bytes, string]> | void;

        load_bytes_finish(result: AsyncResult): [GLib.Bytes, string];

        load_contents(cancellable: Cancellable | null): [boolean, Uint8Array, string];

        load_contents_async(cancellable: Cancellable | null): globalThis.Promise<[Uint8Array, string]>;

        load_contents_async(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        load_contents_async(cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<[Uint8Array, string]> | void;

        load_contents_finish(res: AsyncResult): [boolean, Uint8Array, string];

        load_partial_contents_finish(res: AsyncResult): [boolean, Uint8Array, string];

        make_directory(cancellable: Cancellable | null): boolean;

        make_directory_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        make_directory_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        make_directory_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        make_directory_finish(result: AsyncResult): boolean;

        make_directory_with_parents(cancellable: Cancellable | null): boolean;

        make_symbolic_link(symlink_value: string, cancellable: Cancellable | null): boolean;

        make_symbolic_link_async(symlink_value: string, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        make_symbolic_link_async(symlink_value: string, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        make_symbolic_link_async(symlink_value: string, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        make_symbolic_link_finish(result: AsyncResult): boolean;

        measure_disk_usage(flags: FileMeasureFlags, cancellable: Cancellable | null, progress_callback: FileMeasureProgressCallback | null): [boolean, number, number, number];

        measure_disk_usage_finish(result: AsyncResult): [boolean, number, number, number];

        monitor(flags: FileMonitorFlags, cancellable: Cancellable | null): FileMonitor;

        monitor_directory(flags: FileMonitorFlags, cancellable: Cancellable | null): FileMonitor;

        monitor_file(flags: FileMonitorFlags, cancellable: Cancellable | null): FileMonitor;

        mount_enclosing_volume(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        mount_enclosing_volume(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        mount_enclosing_volume(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        mount_enclosing_volume_finish(result: AsyncResult): boolean;

        mount_mountable(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null): globalThis.Promise<File>;

        mount_mountable(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        mount_mountable(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<File> | void;

        mount_mountable_finish(result: AsyncResult): File;

        move(destination: File, flags: FileCopyFlags, cancellable: Cancellable | null, progress_callback: FileProgressCallback | null): boolean;

        move_async(destination: File, flags: FileCopyFlags, io_priority: number, cancellable: Cancellable | null, progress_callback_closure: GObject.Closure | null, ready_callback_closure: GObject.Closure): void;

        move_finish(result: AsyncResult): boolean;

        open_readwrite(cancellable: Cancellable | null): FileIOStream;

        open_readwrite_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<FileIOStream>;

        open_readwrite_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        open_readwrite_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<FileIOStream> | void;

        open_readwrite_finish(res: AsyncResult): FileIOStream;

        peek_path(): string | null;

        poll_mountable(cancellable: Cancellable | null): globalThis.Promise<boolean>;

        poll_mountable(cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        poll_mountable(cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        poll_mountable_finish(result: AsyncResult): boolean;

        query_default_handler(cancellable: Cancellable | null): AppInfo;

        query_default_handler_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<AppInfo>;

        query_default_handler_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        query_default_handler_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<AppInfo> | void;

        query_default_handler_finish(result: AsyncResult): AppInfo;

        query_exists(cancellable: Cancellable | null): boolean;

        query_file_type(flags: FileQueryInfoFlags, cancellable: Cancellable | null): FileType;

        query_filesystem_info(attributes: string, cancellable: Cancellable | null): FileInfo;

        query_filesystem_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<FileInfo>;

        query_filesystem_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        query_filesystem_info_async(attributes: string, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<FileInfo> | void;

        query_filesystem_info_finish(res: AsyncResult): FileInfo;

        query_info(attributes: string, flags: FileQueryInfoFlags, cancellable: Cancellable | null): FileInfo;

        query_info_async(attributes: string, flags: FileQueryInfoFlags, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<FileInfo>;

        query_info_async(attributes: string, flags: FileQueryInfoFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        query_info_async(attributes: string, flags: FileQueryInfoFlags, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<FileInfo> | void;

        query_info_finish(res: AsyncResult): FileInfo;

        query_settable_attributes(cancellable: Cancellable | null): FileAttributeInfoList;

        query_writable_namespaces(cancellable: Cancellable | null): FileAttributeInfoList;

        read(cancellable: Cancellable | null): FileInputStream;

        read_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<FileInputStream>;

        read_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        read_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<FileInputStream> | void;

        read_finish(res: AsyncResult): FileInputStream;

        replace(etag: string | null, make_backup: boolean, flags: FileCreateFlags, cancellable: Cancellable | null): FileOutputStream;

        replace_async(etag: string | null, make_backup: boolean, flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<FileOutputStream>;

        replace_async(etag: string | null, make_backup: boolean, flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        replace_async(etag: string | null, make_backup: boolean, flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<FileOutputStream> | void;

        replace_contents(contents: Uint8Array | string, etag: string | null, make_backup: boolean, flags: FileCreateFlags, cancellable: Cancellable | null): [boolean, string];

        replace_contents_async(contents: Uint8Array | string, etag: string | null, make_backup: boolean, flags: FileCreateFlags, cancellable: Cancellable | null): globalThis.Promise<string>;

        replace_contents_async(contents: Uint8Array | string, etag: string | null, make_backup: boolean, flags: FileCreateFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        replace_contents_async(contents: Uint8Array | string, etag: string | null, make_backup: boolean, flags: FileCreateFlags, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<string> | void;

        replace_contents_bytes_async(contents: GLib.Bytes | Uint8Array, etag: string | null, make_backup: boolean, flags: FileCreateFlags, cancellable: Cancellable | null): globalThis.Promise<string>;

        replace_contents_bytes_async(contents: GLib.Bytes | Uint8Array, etag: string | null, make_backup: boolean, flags: FileCreateFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        replace_contents_bytes_async(contents: GLib.Bytes | Uint8Array, etag: string | null, make_backup: boolean, flags: FileCreateFlags, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<string> | void;

        replace_contents_finish(res: AsyncResult): [boolean, string];

        replace_finish(res: AsyncResult): FileOutputStream;

        replace_readwrite(etag: string | null, make_backup: boolean, flags: FileCreateFlags, cancellable: Cancellable | null): FileIOStream;

        replace_readwrite_async(etag: string | null, make_backup: boolean, flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<FileIOStream>;

        replace_readwrite_async(etag: string | null, make_backup: boolean, flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        replace_readwrite_async(etag: string | null, make_backup: boolean, flags: FileCreateFlags, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<FileIOStream> | void;

        replace_readwrite_finish(res: AsyncResult): FileIOStream;

        resolve_relative_path(relative_path: string): File;

        set_attribute(attribute: string, type: FileAttributeType, value_p: null, flags: FileQueryInfoFlags, cancellable: Cancellable | null): boolean;

        set_attribute_byte_string(attribute: string, value: string, flags: FileQueryInfoFlags, cancellable: Cancellable | null): boolean;

        set_attribute_int32(attribute: string, value: number, flags: FileQueryInfoFlags, cancellable: Cancellable | null): boolean;

        set_attribute_int64(attribute: string, value: bigint | number, flags: FileQueryInfoFlags, cancellable: Cancellable | null): boolean;

        set_attribute_string(attribute: string, value: string, flags: FileQueryInfoFlags, cancellable: Cancellable | null): boolean;

        set_attribute_uint32(attribute: string, value: number, flags: FileQueryInfoFlags, cancellable: Cancellable | null): boolean;

        set_attribute_uint64(attribute: string, value: bigint | number, flags: FileQueryInfoFlags, cancellable: Cancellable | null): boolean;

        set_attributes_async(info: FileInfo, flags: FileQueryInfoFlags, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<FileInfo>;

        set_attributes_async(info: FileInfo, flags: FileQueryInfoFlags, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        set_attributes_async(info: FileInfo, flags: FileQueryInfoFlags, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<FileInfo> | void;

        set_attributes_finish(result: AsyncResult): [boolean, FileInfo];

        set_attributes_from_info(info: FileInfo, flags: FileQueryInfoFlags, cancellable: Cancellable | null): boolean;

        set_display_name(display_name: string, cancellable: Cancellable | null): File;

        set_display_name_async(display_name: string, io_priority: number, cancellable: Cancellable | null): globalThis.Promise<File>;

        set_display_name_async(display_name: string, io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        set_display_name_async(display_name: string, io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<File> | void;

        set_display_name_finish(res: AsyncResult): File;

        start_mountable(flags: DriveStartFlags, start_operation: MountOperation | null, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        start_mountable(flags: DriveStartFlags, start_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        start_mountable(flags: DriveStartFlags, start_operation: MountOperation | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        start_mountable_finish(result: AsyncResult): boolean;

        stop_mountable(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        stop_mountable(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        stop_mountable(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        stop_mountable_finish(result: AsyncResult): boolean;

        supports_thread_contexts(): boolean;

        trash(cancellable: Cancellable | null): boolean;

        trash_async(io_priority: number, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        trash_async(io_priority: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        trash_async(io_priority: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        trash_finish(result: AsyncResult): boolean;

        unmount_mountable(flags: MountUnmountFlags, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        unmount_mountable(flags: MountUnmountFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        unmount_mountable(flags: MountUnmountFlags, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        unmount_mountable_finish(result: AsyncResult): boolean;

        unmount_mountable_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        unmount_mountable_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        unmount_mountable_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        unmount_mountable_with_operation_finish(result: AsyncResult): boolean;

        replace_contents_async(contents: Uint8Array, etag: string, make_backup: boolean, flags: FileCreateFlags, cancellable: Cancellable, callback: AsyncReadyCallback): void;
    }


    export const File: FileNamespace & {
        new (): File; // This allows `obj instanceof File`
    };

    namespace Icon {
        /**
         * Interface for implementing Icon.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_equal(icon2: Icon | null): boolean;

            vfunc_hash(): number;

            vfunc_serialize(): GLib.Variant | null;

            vfunc_to_tokens(): [boolean, string[], number];
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface IconNamespace {
        $gtype: GObject.GType<Icon>;
        prototype: Icon;
        deserialize(value: GLib.Variant): Icon | null;
        new_for_string(str: string): Icon;
    }
    interface Icon extends GObject.Object, Icon.Interface {

        // Methods
        equal(icon2: Icon | null): boolean;

        hash(): number;

        serialize(): GLib.Variant | null;

        to_string(): string | null;
    }


    export const Icon: IconNamespace & {
        new (): Icon; // This allows `obj instanceof Icon`
    };

    namespace Initable {
        /**
         * Interface for implementing Initable.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_init(cancellable: Cancellable | null): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface InitableNamespace {
        $gtype: GObject.GType<Initable>;
        prototype: Initable;
        newv<T = GObject.Object>(object_type: GObject.GType, parameters: GObject.Parameter[], cancellable: Cancellable | null): T;
        newv(...args: never[]): any;
    }
    interface Initable extends GObject.Object, Initable.Interface {

        // Methods
        init(cancellable: Cancellable | null): boolean;
    }


    export const Initable: InitableNamespace & {
        new (): Initable; // This allows `obj instanceof Initable`
    };

    namespace ListModel {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "items-changed": (position: number, removed: number, added: number) => void;
        }
        /**
         * Interface for implementing ListModel.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface<A extends GObject.Object = GObject.Object> {

            // Virtual methods
            vfunc_get_item(position: number): A | null;

            vfunc_get_item_type(): GObject.GType;

            vfunc_get_n_items(): number;
        }


        // Constructor properties interface
        interface ConstructorProps<A extends GObject.Object = GObject.Object> extends GObject.Object.ConstructorProps {}
    }

    export interface ListModelNamespace {
        $gtype: GObject.GType<ListModel>;
        prototype: ListModel;
    }
    interface ListModel<A extends GObject.Object = GObject.Object> extends GObject.Object, ListModel.Interface<A> {

        // Methods
        get_item_type(): GObject.GType;

        get_n_items(): number;

        get_item(position: number): A | null;

        items_changed(position: number, removed: number, added: number): void;
    }


    export const ListModel: ListModelNamespace & {
        new (): ListModel; // This allows `obj instanceof ListModel`
    };

    namespace LoadableIcon {
        /**
         * Interface for implementing LoadableIcon.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface extends Icon.Interface {

            // Virtual methods
            vfunc_load(size: number, cancellable: Cancellable | null): [InputStream, string];

            vfunc_load_async(size: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_load_finish(res: AsyncResult): [InputStream, string];
        }


        // Constructor properties interface
        interface ConstructorProps extends Icon.ConstructorProps {}
    }

    export interface LoadableIconNamespace {
        $gtype: GObject.GType<LoadableIcon>;
        prototype: LoadableIcon;
    }
    interface LoadableIcon extends Icon, LoadableIcon.Interface {

        // Methods
        load(size: number, cancellable: Cancellable | null): [InputStream, string];

        load_async(size: number, cancellable: Cancellable | null): globalThis.Promise<[InputStream, string]>;

        load_async(size: number, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        load_async(size: number, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<[InputStream, string]> | void;

        load_finish(res: AsyncResult): [InputStream, string];
    }


    export const LoadableIcon: LoadableIconNamespace & {
        new (): LoadableIcon; // This allows `obj instanceof LoadableIcon`
    };

    namespace MemoryMonitor {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "low-memory-warning": (level: MemoryMonitorWarningLevel) => void;
        }
        /**
         * Interface for implementing MemoryMonitor.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface extends Initable.Interface {

            // Virtual methods
            vfunc_low_memory_warning(level: MemoryMonitorWarningLevel): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends Initable.ConstructorProps {}
    }

    export interface MemoryMonitorNamespace {
        $gtype: GObject.GType<MemoryMonitor>;
        prototype: MemoryMonitor;
        dup_default(): MemoryMonitor;
    }
    interface MemoryMonitor extends Initable, MemoryMonitor.Interface {
    }


    export const MemoryMonitor: MemoryMonitorNamespace & {
        new (): MemoryMonitor; // This allows `obj instanceof MemoryMonitor`
    };

    namespace Mount {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            changed: () => void;
            /** @signal */
            "pre-unmount": () => void;
            /** @signal */
            unmounted: () => void;
        }
        /**
         * Interface for implementing Mount.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_can_eject(): boolean;

            vfunc_can_unmount(): boolean;

            vfunc_changed(): void;

            vfunc_eject(flags: MountUnmountFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_eject_finish(result: AsyncResult): boolean;

            vfunc_eject_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_eject_with_operation_finish(result: AsyncResult): boolean;

            vfunc_get_default_location(): File;

            vfunc_get_drive(): Drive | null;

            vfunc_get_icon(): Icon;

            vfunc_get_name(): string;

            vfunc_get_root(): File;

            vfunc_get_sort_key(): string | null;

            vfunc_get_symbolic_icon(): Icon;

            vfunc_get_uuid(): string | null;

            vfunc_get_volume(): Volume | null;

            vfunc_guess_content_type(force_rescan: boolean, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_guess_content_type_finish(result: AsyncResult): string[];

            vfunc_guess_content_type_sync(force_rescan: boolean, cancellable: Cancellable | null): string[];

            vfunc_pre_unmount(): void;

            vfunc_remount(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_remount_finish(result: AsyncResult): boolean;

            vfunc_unmount(flags: MountUnmountFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_unmount_finish(result: AsyncResult): boolean;

            vfunc_unmount_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_unmount_with_operation_finish(result: AsyncResult): boolean;

            vfunc_unmounted(): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface MountNamespace {
        $gtype: GObject.GType<Mount>;
        prototype: Mount;
    }
    interface Mount extends GObject.Object, Mount.Interface {

        // Methods
        can_eject(): boolean;

        can_unmount(): boolean;

        eject(flags: MountUnmountFlags, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        eject(flags: MountUnmountFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        eject(flags: MountUnmountFlags, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        eject_finish(result: AsyncResult): boolean;

        eject_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        eject_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        eject_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        eject_with_operation_finish(result: AsyncResult): boolean;

        get_default_location(): File;

        get_drive(): Drive | null;

        get_icon(): Icon;

        get_name(): string;

        get_root(): File;

        get_sort_key(): string | null;

        get_symbolic_icon(): Icon;

        get_uuid(): string | null;

        get_volume(): Volume | null;

        guess_content_type(force_rescan: boolean, cancellable: Cancellable | null): globalThis.Promise<string[]>;

        guess_content_type(force_rescan: boolean, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        guess_content_type(force_rescan: boolean, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<string[]> | void;

        guess_content_type_finish(result: AsyncResult): string[];

        guess_content_type_sync(force_rescan: boolean, cancellable: Cancellable | null): string[];

        is_shadowed(): boolean;

        remount(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        remount(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        remount(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        remount_finish(result: AsyncResult): boolean;

        shadow(): void;

        unmount(flags: MountUnmountFlags, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        unmount(flags: MountUnmountFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        unmount(flags: MountUnmountFlags, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        unmount_finish(result: AsyncResult): boolean;

        unmount_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        unmount_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        unmount_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        unmount_with_operation_finish(result: AsyncResult): boolean;

        unshadow(): void;
    }


    export const Mount: MountNamespace & {
        new (): Mount; // This allows `obj instanceof Mount`
    };

    namespace NetworkMonitor {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "network-changed": (network_available: boolean) => void;
        }
        /**
         * Interface for implementing NetworkMonitor.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface extends Initable.Interface {

            // Virtual methods
            vfunc_can_reach(connectable: SocketConnectable, cancellable: Cancellable | null): boolean;

            vfunc_can_reach_async(connectable: SocketConnectable, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_can_reach_finish(result: AsyncResult): boolean;

            vfunc_network_changed(network_available: boolean): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends Initable.ConstructorProps {
            connectivity: NetworkConnectivity;
            network_available: boolean;
            networkAvailable: boolean;
            network_metered: boolean;
            networkMetered: boolean;
        }
    }

    export interface NetworkMonitorNamespace {
        $gtype: GObject.GType<NetworkMonitor>;
        prototype: NetworkMonitor;
        get_default(): NetworkMonitor;
    }
    interface NetworkMonitor extends Initable, NetworkMonitor.Interface {

        // Properties
        get connectivity(): NetworkConnectivity;

        get network_available(): boolean;

        get networkAvailable(): boolean;

        get network_metered(): boolean;

        get networkMetered(): boolean;

        // Methods
        can_reach(connectable: SocketConnectable, cancellable: Cancellable | null): boolean;

        can_reach_async(connectable: SocketConnectable, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        can_reach_async(connectable: SocketConnectable, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        can_reach_async(connectable: SocketConnectable, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        can_reach_finish(result: AsyncResult): boolean;

        get_connectivity(): NetworkConnectivity;

        get_network_available(): boolean;

        get_network_metered(): boolean;
    }


    export const NetworkMonitor: NetworkMonitorNamespace & {
        new (): NetworkMonitor; // This allows `obj instanceof NetworkMonitor`
    };

    namespace PollableInputStream {
        /**
         * Interface for implementing PollableInputStream.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_can_poll(): boolean;

            vfunc_create_source(cancellable: Cancellable | null): GLib.Source;

            vfunc_is_readable(): boolean;

            vfunc_read_nonblocking(): [bigint | number, Uint8Array | string | null];
        }


        // Constructor properties interface
        interface ConstructorProps extends InputStream.ConstructorProps {}
    }

    export interface PollableInputStreamNamespace {
        $gtype: GObject.GType<PollableInputStream>;
        prototype: PollableInputStream;
    }
    interface PollableInputStream extends InputStream, PollableInputStream.Interface {

        // Methods
        can_poll(): boolean;

        create_source(cancellable: Cancellable | null): GLib.Source;

        is_readable(): boolean;

        read_nonblocking(cancellable: Cancellable | null): [number, Uint8Array];
    }


    export const PollableInputStream: PollableInputStreamNamespace & {
        new (): PollableInputStream; // This allows `obj instanceof PollableInputStream`
    };

    namespace PollableOutputStream {
        /**
         * Interface for implementing PollableOutputStream.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_can_poll(): boolean;

            vfunc_create_source(cancellable: Cancellable | null): GLib.Source;

            vfunc_is_writable(): boolean;

            vfunc_write_nonblocking(buffer: Uint8Array | null): bigint | number;

            vfunc_writev_nonblocking(vectors: OutputVector[]): [PollableReturn, bigint | number];
        }


        // Constructor properties interface
        interface ConstructorProps extends OutputStream.ConstructorProps {}
    }

    export interface PollableOutputStreamNamespace {
        $gtype: GObject.GType<PollableOutputStream>;
        prototype: PollableOutputStream;
    }
    interface PollableOutputStream extends OutputStream, PollableOutputStream.Interface {

        // Methods
        can_poll(): boolean;

        create_source(cancellable: Cancellable | null): GLib.Source;

        is_writable(): boolean;

        write_nonblocking(buffer: Uint8Array | string, cancellable: Cancellable | null): number;

        writev_nonblocking(vectors: OutputVector[], cancellable: Cancellable | null): [PollableReturn, number];
    }


    export const PollableOutputStream: PollableOutputStreamNamespace & {
        new (): PollableOutputStream; // This allows `obj instanceof PollableOutputStream`
    };

    namespace PowerProfileMonitor {

        // Constructor properties interface
        interface ConstructorProps extends Initable.ConstructorProps {
            power_saver_enabled: boolean;
            powerSaverEnabled: boolean;
        }
    }

    export interface PowerProfileMonitorNamespace {
        $gtype: GObject.GType<PowerProfileMonitor>;
        prototype: PowerProfileMonitor;
        dup_default(): PowerProfileMonitor;
    }
    interface PowerProfileMonitor extends Initable {

        // Properties
        get power_saver_enabled(): boolean;

        get powerSaverEnabled(): boolean;

        // Methods
        get_power_saver_enabled(): boolean;
    }


    export const PowerProfileMonitor: PowerProfileMonitorNamespace & {
        new (): PowerProfileMonitor; // This allows `obj instanceof PowerProfileMonitor`
    };

    namespace Proxy {
        /**
         * Interface for implementing Proxy.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_connect(connection: IOStream, proxy_address: ProxyAddress, cancellable: Cancellable | null): IOStream;

            vfunc_connect_async(connection: IOStream, proxy_address: ProxyAddress, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_connect_finish(result: AsyncResult): IOStream;

            vfunc_supports_hostname(): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ProxyNamespace {
        $gtype: GObject.GType<Proxy>;
        prototype: Proxy;
        get_default_for_protocol(protocol: string): Proxy | null;
    }
    interface Proxy extends GObject.Object, Proxy.Interface {

        // Methods
        connect(connection: IOStream, proxy_address: ProxyAddress, cancellable: Cancellable | null): IOStream;

        connect(...args: never[]): any;

        connect_async(connection: IOStream, proxy_address: ProxyAddress, cancellable: Cancellable | null): globalThis.Promise<IOStream>;

        connect_async(connection: IOStream, proxy_address: ProxyAddress, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        connect_async(connection: IOStream, proxy_address: ProxyAddress, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<IOStream> | void;

        connect_finish(result: AsyncResult): IOStream;

        supports_hostname(): boolean;
    }


    export const Proxy: ProxyNamespace & {
        new (): Proxy; // This allows `obj instanceof Proxy`
    };

    namespace ProxyResolver {
        /**
         * Interface for implementing ProxyResolver.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_is_supported(): boolean;

            vfunc_lookup(uri: string, cancellable: Cancellable | null): string[];

            vfunc_lookup_async(uri: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_lookup_finish(result: AsyncResult): string[];
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ProxyResolverNamespace {
        $gtype: GObject.GType<ProxyResolver>;
        prototype: ProxyResolver;
        get_default(): ProxyResolver;
    }
    interface ProxyResolver extends GObject.Object, ProxyResolver.Interface {

        // Methods
        is_supported(): boolean;

        lookup(uri: string, cancellable: Cancellable | null): string[];

        lookup_async(uri: string, cancellable: Cancellable | null): globalThis.Promise<string[]>;

        lookup_async(uri: string, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        lookup_async(uri: string, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<string[]> | void;

        lookup_finish(result: AsyncResult): string[];
    }


    export const ProxyResolver: ProxyResolverNamespace & {
        new (): ProxyResolver; // This allows `obj instanceof ProxyResolver`
    };

    namespace RemoteActionGroup {
        // Signal signatures
        interface SignalSignatures extends ActionGroup.SignalSignatures {}
        /**
         * Interface for implementing RemoteActionGroup.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface extends ActionGroup.Interface {

            // Virtual methods
            vfunc_activate_action_full(action_name: string, parameter: GLib.Variant | null, platform_data: GLib.Variant): void;

            vfunc_change_action_state_full(action_name: string, value: GLib.Variant, platform_data: GLib.Variant): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends ActionGroup.ConstructorProps {}
    }

    export interface RemoteActionGroupNamespace {
        $gtype: GObject.GType<RemoteActionGroup>;
        prototype: RemoteActionGroup;
    }
    interface RemoteActionGroup extends ActionGroup, RemoteActionGroup.Interface {

        // Methods
        activate_action_full(action_name: string, parameter: GLib.Variant | null, platform_data: GLib.Variant): void;

        change_action_state_full(action_name: string, value: GLib.Variant, platform_data: GLib.Variant): void;
    }


    export const RemoteActionGroup: RemoteActionGroupNamespace & {
        new (): RemoteActionGroup; // This allows `obj instanceof RemoteActionGroup`
    };

    namespace Seekable {
        /**
         * Interface for implementing Seekable.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_can_seek(): boolean;

            vfunc_can_truncate(): boolean;

            vfunc_seek(offset: number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

            vfunc_tell(): bigint | number;

            vfunc_truncate_fn(offset: number, cancellable: Cancellable | null): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface SeekableNamespace {
        $gtype: GObject.GType<Seekable>;
        prototype: Seekable;
    }
    interface Seekable extends GObject.Object, Seekable.Interface {

        // Methods
        can_seek(): boolean;

        can_truncate(): boolean;

        seek(offset: bigint | number, type: GLib.SeekType, cancellable: Cancellable | null): boolean;

        tell(): number;

        truncate(offset: bigint | number, cancellable: Cancellable | null): boolean;
    }


    export const Seekable: SeekableNamespace & {
        new (): Seekable; // This allows `obj instanceof Seekable`
    };

    namespace SocketConnectable {
        /**
         * Interface for implementing SocketConnectable.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_enumerate(): SocketAddressEnumerator;

            vfunc_proxy_enumerate(): SocketAddressEnumerator;

            vfunc_to_string(): string;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface SocketConnectableNamespace {
        $gtype: GObject.GType<SocketConnectable>;
        prototype: SocketConnectable;
    }
    interface SocketConnectable extends GObject.Object, SocketConnectable.Interface {

        // Methods
        enumerate(): SocketAddressEnumerator;

        proxy_enumerate(): SocketAddressEnumerator;

        to_string(): string;
    }


    export const SocketConnectable: SocketConnectableNamespace & {
        new (): SocketConnectable; // This allows `obj instanceof SocketConnectable`
    };

    namespace TlsBackend {
        /**
         * Interface for implementing TlsBackend.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_default_database(): TlsDatabase;

            vfunc_supports_dtls(): boolean;

            vfunc_supports_tls(): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface TlsBackendNamespace {
        $gtype: GObject.GType<TlsBackend>;
        prototype: TlsBackend;
        get_default(): TlsBackend;
    }
    interface TlsBackend extends GObject.Object, TlsBackend.Interface {

        // Methods
        get_certificate_type(): GObject.GType;

        get_client_connection_type(): GObject.GType;

        get_default_database(): TlsDatabase;

        get_dtls_client_connection_type(): GObject.GType;

        get_dtls_server_connection_type(): GObject.GType;

        get_file_database_type(): GObject.GType;

        get_server_connection_type(): GObject.GType;

        set_default_database(database: TlsDatabase | null): void;

        supports_dtls(): boolean;

        supports_tls(): boolean;
    }


    export const TlsBackend: TlsBackendNamespace & {
        new (): TlsBackend; // This allows `obj instanceof TlsBackend`
    };

    namespace TlsClientConnection {
        /**
         * Interface for implementing TlsClientConnection.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_copy_session_state(source: TlsClientConnection): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends TlsConnection.ConstructorProps {
            accepted_cas: never[];
            acceptedCas: never[];
            server_identity: SocketConnectable | null;
            serverIdentity: SocketConnectable | null;
            use_ssl3: boolean;
            useSsl3: boolean;
            validation_flags: TlsCertificateFlags;
            validationFlags: TlsCertificateFlags;
        }
    }

    export interface TlsClientConnectionNamespace {
        $gtype: GObject.GType<TlsClientConnection>;
        prototype: TlsClientConnection;
        ["new"](base_io_stream: IOStream, server_identity: SocketConnectable | null): TlsClientConnection;
    }
    interface TlsClientConnection extends TlsConnection, TlsClientConnection.Interface {

        // Properties
        get accepted_cas(): null[];

        get acceptedCas(): null[];

        get server_identity(): SocketConnectable | null;
        set server_identity(val: SocketConnectable | null);

        get serverIdentity(): SocketConnectable | null;
        set serverIdentity(val: SocketConnectable | null);

        get use_ssl3(): boolean;
        set use_ssl3(val: boolean);

        get useSsl3(): boolean;
        set useSsl3(val: boolean);

        get validation_flags(): TlsCertificateFlags;
        set validation_flags(val: TlsCertificateFlags);

        get validationFlags(): TlsCertificateFlags;
        set validationFlags(val: TlsCertificateFlags);

        // Methods
        copy_session_state(source: TlsClientConnection): void;

        get_accepted_cas(): GLib.List;

        get_server_identity(): SocketConnectable | null;

        get_use_ssl3(): boolean;

        get_validation_flags(): TlsCertificateFlags;

        set_server_identity(identity: SocketConnectable): void;

        set_use_ssl3(use_ssl3: boolean): void;

        set_validation_flags(flags: TlsCertificateFlags): void;
    }


    export const TlsClientConnection: TlsClientConnectionNamespace & {
        new (): TlsClientConnection; // This allows `obj instanceof TlsClientConnection`
    };

    namespace TlsFileDatabase {

        // Constructor properties interface
        interface ConstructorProps extends TlsDatabase.ConstructorProps {
            anchors: string;
        }
    }

    export interface TlsFileDatabaseNamespace {
        $gtype: GObject.GType<TlsFileDatabase>;
        prototype: TlsFileDatabase;
        ["new"](anchors: string): TlsFileDatabase;
    }
    interface TlsFileDatabase extends TlsDatabase {

        // Properties
        get anchors(): string;
        set anchors(val: string);
    }


    export const TlsFileDatabase: TlsFileDatabaseNamespace & {
        new (): TlsFileDatabase; // This allows `obj instanceof TlsFileDatabase`
    };

    namespace TlsServerConnection {

        // Constructor properties interface
        interface ConstructorProps extends TlsConnection.ConstructorProps {
            authentication_mode: TlsAuthenticationMode;
            authenticationMode: TlsAuthenticationMode;
        }
    }

    export interface TlsServerConnectionNamespace {
        $gtype: GObject.GType<TlsServerConnection>;
        prototype: TlsServerConnection;
        ["new"](base_io_stream: IOStream, certificate: TlsCertificate | null): TlsServerConnection;
    }
    interface TlsServerConnection extends TlsConnection {

        // Properties
        get authentication_mode(): TlsAuthenticationMode;
        set authentication_mode(val: TlsAuthenticationMode);

        get authenticationMode(): TlsAuthenticationMode;
        set authenticationMode(val: TlsAuthenticationMode);
    }


    export const TlsServerConnection: TlsServerConnectionNamespace & {
        new (): TlsServerConnection; // This allows `obj instanceof TlsServerConnection`
    };

    namespace Volume {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            changed: () => void;
            /** @signal */
            removed: () => void;
        }
        /**
         * Interface for implementing Volume.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_can_eject(): boolean;

            vfunc_can_mount(): boolean;

            vfunc_changed(): void;

            vfunc_eject(flags: MountUnmountFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_eject_finish(result: AsyncResult): boolean;

            vfunc_eject_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_eject_with_operation_finish(result: AsyncResult): boolean;

            vfunc_enumerate_identifiers(): string[];

            vfunc_get_activation_root(): File | null;

            vfunc_get_drive(): Drive | null;

            vfunc_get_icon(): Icon;

            vfunc_get_identifier(kind: string): string | null;

            vfunc_get_mount(): Mount | null;

            vfunc_get_name(): string;

            vfunc_get_sort_key(): string | null;

            vfunc_get_symbolic_icon(): Icon;

            vfunc_get_uuid(): string | null;

            vfunc_mount_finish(result: AsyncResult): boolean;

            vfunc_mount_fn(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

            vfunc_removed(): void;

            vfunc_should_automount(): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface VolumeNamespace {
        $gtype: GObject.GType<Volume>;
        prototype: Volume;
    }
    interface Volume extends GObject.Object, Volume.Interface {

        // Methods
        can_eject(): boolean;

        can_mount(): boolean;

        eject(flags: MountUnmountFlags, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        eject(flags: MountUnmountFlags, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        eject(flags: MountUnmountFlags, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        eject_finish(result: AsyncResult): boolean;

        eject_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        eject_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        eject_with_operation(flags: MountUnmountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        eject_with_operation_finish(result: AsyncResult): boolean;

        enumerate_identifiers(): string[];

        get_activation_root(): File | null;

        get_drive(): Drive | null;

        get_icon(): Icon;

        get_identifier(kind: string): string | null;

        get_mount(): Mount | null;

        get_name(): string;

        get_sort_key(): string | null;

        get_symbolic_icon(): Icon;

        get_uuid(): string | null;

        mount(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null): globalThis.Promise<boolean>;

        mount(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback: AsyncReadyCallback<this> | null): void;

        mount(flags: MountMountFlags, mount_operation: MountOperation | null, cancellable: Cancellable | null, callback?: AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        mount_finish(result: AsyncResult): boolean;

        should_automount(): boolean;
    }


    export const Volume: VolumeNamespace & {
        new (): Volume; // This allows `obj instanceof Volume`
    };

    export interface DBusNamespace {
        prototype: DBus;
        readonly session: DBusConnection;
        readonly system: DBusConnection;
        get(bus_type: BusType, cancellable: Cancellable | null, callback: AsyncReadyCallback<BusType> | null): void;
        get_finish(res: AsyncResult): DBusConnection;
        get_sync(bus_type: BusType, cancellable: Cancellable | null): DBusConnection;
        own_name(bus_type: BusType, name: string, flags: BusNameOwnerFlags, bus_acquired_closure: GObject.Closure | null, name_acquired_closure: GObject.Closure | null, name_lost_closure: GObject.Closure | null): number;
        own_name_on_connection(connection: DBusConnection, name: string, flags: BusNameOwnerFlags, name_acquired_closure: GObject.Closure | null, name_lost_closure: GObject.Closure | null): number;
        unown_name(owner_id: number): void;
        watch_name(bus_type: BusType, name: string, flags: BusNameWatcherFlags, name_appeared_closure: GObject.Closure | null, name_vanished_closure: GObject.Closure | null): number;
        unwatch_name(watcher_id: number): void;
        watch_name_on_connection(connection: DBusConnection, name: string, flags: BusNameWatcherFlags, name_appeared_closure: GObject.Closure | null, name_vanished_closure: GObject.Closure | null): number;
    }
    interface DBus {
    }


    export const DBus: DBusNamespace & {
        new (): DBus; // This allows `obj instanceof DBus`
    };

    namespace DBusExportedObject {
        // Signal signatures
        interface SignalSignatures extends DBusInterfaceSkeleton.SignalSignatures {}
    }

    class DBusExportedObject extends DBusInterfaceSkeleton {
        static $gtype: GObject.GType<DBusExportedObject>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DBusExportedObject.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusExportedObject.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DBusExportedObject.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DBusExportedObject.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DBusExportedObject.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DBusExportedObject.SignalSignatures[K]>): void;

        // Static methods
        static wrapJSObject(info: string | DBusInterfaceInfo, obj: any): DBusExportedObject;

        // Methods
        emit_signal(name: string, variant: GLib.Variant | null): void;

        emit_property_changed(name: string, variant: GLib.Variant | null): void;
    }


    type ActionEntryObj = {
                    /** The name of the action */
                    name: string;
                    /** The type of the parameter that must match the parameter_type specified in the entry */
                    parameter_type?: string;
                    /** The initial state of the action */
                    state?: string;
                    /** The callback to connect to the "activate" signal of the action */
                    activate?: (_source: SimpleAction, parameter: GLib.Variant | null) => void;
                    /** The callback to connect to the "change-state" signal of the action */
                    change_state?: (_source: SimpleAction, value: GLib.Variant | null) => void;
                };

    const __name__: string;

    const __version__: string;

}

export default Gio;

}

declare module 'gi://Gio' {
    import Gio20 from 'gi://Gio?version=2.0';
    export default Gio20;
}
// END
