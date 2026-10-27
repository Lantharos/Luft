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

declare module 'gi://Soup?version=3.0' {

// Module dependencies
import type Gio from 'gi://Gio?version=2.0';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type GModule from 'gi://GModule?version=2.0';

export namespace Soup {

    /**
     * Soup-3.0
     */


    export namespace CacheType {
        export const $gtype: GObject.GType<CacheType>;
    }

    enum CacheType {
        SINGLE_USER = 0,
        SHARED = 1,
    }


    export namespace CookieJarAcceptPolicy {
        export const $gtype: GObject.GType<CookieJarAcceptPolicy>;
    }

    enum CookieJarAcceptPolicy {
        ALWAYS = 0,
        NEVER = 1,
        NO_THIRD_PARTY = 2,
        GRANDFATHERED_THIRD_PARTY = 3,
    }


    class CookieJarError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static DB: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace DateFormat {
        export const $gtype: GObject.GType<DateFormat>;
    }

    enum DateFormat {
        HTTP = 1,
        COOKIE = 2,
    }


    export namespace Encoding {
        export const $gtype: GObject.GType<Encoding>;
    }

    enum Encoding {
        UNRECOGNIZED = 0,
        NONE = 1,
        CONTENT_LENGTH = 2,
        EOF = 3,
        CHUNKED = 4,
        BYTERANGES = 5,
    }


    export namespace HTTPVersion {
        export const $gtype: GObject.GType<HTTPVersion>;
    }

    enum HTTPVersion {
        HTTP_1_0 = 0,
        HTTP_1_1 = 1,
        HTTP_2_0 = 2,
    }


    export namespace LoggerLogLevel {
        export const $gtype: GObject.GType<LoggerLogLevel>;
    }

    enum LoggerLogLevel {
        NONE = 0,
        MINIMAL = 1,
        HEADERS = 2,
        BODY = 3,
    }


    export namespace MemoryUse {
        export const $gtype: GObject.GType<MemoryUse>;
    }

    enum MemoryUse {
        STATIC = 0,
        TAKE = 1,
        COPY = 2,
    }


    export namespace MessageHeadersType {
        export const $gtype: GObject.GType<MessageHeadersType>;
    }

    enum MessageHeadersType {
        REQUEST = 0,
        RESPONSE = 1,
        MULTIPART = 2,
    }


    export namespace MessagePriority {
        export const $gtype: GObject.GType<MessagePriority>;
    }

    enum MessagePriority {
        VERY_LOW = 0,
        LOW = 1,
        NORMAL = 2,
        HIGH = 3,
        VERY_HIGH = 4,
    }


    export namespace SameSitePolicy {
        export const $gtype: GObject.GType<SameSitePolicy>;
    }

    enum SameSitePolicy {
        NONE = 0,
        LAX = 1,
        STRICT = 2,
    }


    class SessionError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static PARSING: number;

        static ENCODING: number;

        static TOO_MANY_REDIRECTS: number;

        static TOO_MANY_RESTARTS: number;

        static REDIRECT_NO_LOCATION: number;

        static REDIRECT_BAD_URI: number;

        static MESSAGE_ALREADY_IN_QUEUE: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace Status {
        export const $gtype: GObject.GType<Status>;
    }

    enum Status {
        NONE = 0,
        CONTINUE = 100,
        SWITCHING_PROTOCOLS = 101,
        PROCESSING = 102,
        OK = 200,
        CREATED = 201,
        ACCEPTED = 202,
        NON_AUTHORITATIVE = 203,
        NO_CONTENT = 204,
        RESET_CONTENT = 205,
        PARTIAL_CONTENT = 206,
        MULTI_STATUS = 207,
        MULTIPLE_CHOICES = 300,
        MOVED_PERMANENTLY = 301,
        FOUND = 302,
        MOVED_TEMPORARILY = 302,
        SEE_OTHER = 303,
        NOT_MODIFIED = 304,
        USE_PROXY = 305,
        NOT_APPEARING_IN_THIS_PROTOCOL = 306,
        TEMPORARY_REDIRECT = 307,
        PERMANENT_REDIRECT = 308,
        BAD_REQUEST = 400,
        UNAUTHORIZED = 401,
        PAYMENT_REQUIRED = 402,
        FORBIDDEN = 403,
        NOT_FOUND = 404,
        METHOD_NOT_ALLOWED = 405,
        NOT_ACCEPTABLE = 406,
        PROXY_AUTHENTICATION_REQUIRED = 407,
        PROXY_UNAUTHORIZED = 407,
        REQUEST_TIMEOUT = 408,
        CONFLICT = 409,
        GONE = 410,
        LENGTH_REQUIRED = 411,
        PRECONDITION_FAILED = 412,
        REQUEST_ENTITY_TOO_LARGE = 413,
        REQUEST_URI_TOO_LONG = 414,
        UNSUPPORTED_MEDIA_TYPE = 415,
        REQUESTED_RANGE_NOT_SATISFIABLE = 416,
        INVALID_RANGE = 416,
        EXPECTATION_FAILED = 417,
        MISDIRECTED_REQUEST = 421,
        UNPROCESSABLE_ENTITY = 422,
        LOCKED = 423,
        FAILED_DEPENDENCY = 424,
        INTERNAL_SERVER_ERROR = 500,
        NOT_IMPLEMENTED = 501,
        BAD_GATEWAY = 502,
        SERVICE_UNAVAILABLE = 503,
        GATEWAY_TIMEOUT = 504,
        HTTP_VERSION_NOT_SUPPORTED = 505,
        INSUFFICIENT_STORAGE = 507,
        NOT_EXTENDED = 510,
    }


    class TLDError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static INVALID_HOSTNAME: number;

        static IS_IP_ADDRESS: number;

        static NOT_ENOUGH_DOMAINS: number;

        static NO_BASE_DOMAIN: number;

        static NO_PSL_DATA: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace URIComponent {
        export const $gtype: GObject.GType<URIComponent>;
    }

    enum URIComponent {
        NONE = 0,
        SCHEME = 1,
        USER = 2,
        PASSWORD = 3,
        AUTH_PARAMS = 4,
        HOST = 5,
        PORT = 6,
        PATH = 7,
        QUERY = 8,
        FRAGMENT = 9,
    }


    export namespace WebsocketCloseCode {
        export const $gtype: GObject.GType<WebsocketCloseCode>;
    }

    enum WebsocketCloseCode {
        NORMAL = 1000,
        GOING_AWAY = 1001,
        PROTOCOL_ERROR = 1002,
        UNSUPPORTED_DATA = 1003,
        NO_STATUS = 1005,
        ABNORMAL = 1006,
        BAD_DATA = 1007,
        POLICY_VIOLATION = 1008,
        TOO_BIG = 1009,
        NO_EXTENSION = 1010,
        SERVER_ERROR = 1011,
        TLS_HANDSHAKE = 1015,
    }


    export namespace WebsocketConnectionType {
        export const $gtype: GObject.GType<WebsocketConnectionType>;
    }

    enum WebsocketConnectionType {
        UNKNOWN = 0,
        CLIENT = 1,
        SERVER = 2,
    }


    export namespace WebsocketDataType {
        export const $gtype: GObject.GType<WebsocketDataType>;
    }

    enum WebsocketDataType {
        TEXT = 1,
        BINARY = 2,
    }


    class WebsocketError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static NOT_WEBSOCKET: number;

        static BAD_HANDSHAKE: number;

        static BAD_ORIGIN: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace WebsocketState {
        export const $gtype: GObject.GType<WebsocketState>;
    }

    enum WebsocketState {
        OPEN = 1,
        CLOSING = 2,
        CLOSED = 3,
    }


    const COOKIE_MAX_AGE_ONE_DAY: number;

    const COOKIE_MAX_AGE_ONE_HOUR: number;

    const COOKIE_MAX_AGE_ONE_WEEK: number;

    const COOKIE_MAX_AGE_ONE_YEAR: number;

    const FORM_MIME_TYPE_MULTIPART: string;

    const FORM_MIME_TYPE_URLENCODED: string;

    const HSTS_POLICY_MAX_AGE_PAST: number;

    const HTTP_URI_FLAGS: number;

    const MAJOR_VERSION: number;

    const MICRO_VERSION: number;

    const MINOR_VERSION: number;

    const VERSION_MIN_REQUIRED: number;

    function check_version(major: number, minor: number, micro: number): boolean;

    function cookie_jar_error_quark(): GLib.Quark;

    function cookie_parse(header: string, origin: GLib.Uri | null): Cookie | null;

    function cookies_from_request(msg: Message): Cookie[];

    function cookies_from_response(msg: Message): Cookie[];

    function cookies_to_cookie_header(cookies: Cookie[]): string;

    function cookies_to_request(cookies: Cookie[], msg: Message): void;

    function cookies_to_response(cookies: Cookie[], msg: Message): void;

    function date_time_new_from_http_string(date_string: string): GLib.DateTime | null;

    function date_time_to_string(date: GLib.DateTime, format: DateFormat): string;

    function form_decode(encoded_form: string): { [key: string]: string };

    function form_decode_multipart(multipart: Multipart, file_control_name: string | null): [{ [key: string]: string } | null, string, string, GLib.Bytes | null];

    function form_encode_datalist(form_data_set: GLib.Data): string;

    function form_encode_hash(form_data_set: { [key: string]: string }): string;

    function get_major_version(): number;

    function get_micro_version(): number;

    function get_minor_version(): number;

    function header_contains(header: string, token: string): boolean;

    function header_contains_case_sensitive(header: string, token: string): boolean;

    function header_free_param_list(param_list: { [key: string]: string }): void;

    function header_g_string_append_param(string: GLib.String, name: string, value: string | null): void;

    function header_g_string_append_param_quoted(string: GLib.String, name: string, value: string): void;

    function header_parse_list(header: string): string[];

    function header_parse_param_list(header: string): { [key: string]: string };

    function header_parse_param_list_strict(header: string): { [key: string]: string } | null;

    function header_parse_quality_list(header: string): [string[], string[] | null];

    function header_parse_semi_param_list(header: string): { [key: string]: string };

    function header_parse_semi_param_list_strict(header: string): { [key: string]: string } | null;

    function headers_parse(str: string, len: number, dest: MessageHeaders): boolean;

    function headers_parse_request(str: string, len: number, req_headers: MessageHeaders): [number, string, string, HTTPVersion | null];

    function headers_parse_response(str: string, len: number, headers: MessageHeaders): [boolean, HTTPVersion | null, number, string];

    function headers_parse_status_line(status_line: string): [boolean, HTTPVersion | null, number, string];

    function message_headers_iter_init(hdrs: MessageHeaders): MessageHeadersIter;

    function message_headers_iter_next(iter: MessageHeadersIter): [boolean, MessageHeadersIter, string, string];

    function session_error_quark(): GLib.Quark;

    function status_get_phrase(status_code: number): string;

    function tld_domain_is_public_suffix(domain: string): boolean;

    function tld_error_quark(): GLib.Quark;

    function tld_get_base_domain(hostname: string): string;

    function uri_decode_data_uri(uri: string): [GLib.Bytes, string];

    function uri_equal(uri1: GLib.Uri, uri2: GLib.Uri): boolean;

    function websocket_client_prepare_handshake(msg: Message, origin: string | null, protocols: string[] | null, supported_extensions: GObject.TypeClass[] | null): void;

    function websocket_client_verify_handshake(msg: Message, supported_extensions: GObject.TypeClass[] | null): [boolean, WebsocketExtension[] | null];

    function websocket_error_quark(): GLib.Quark;

    function websocket_server_check_handshake(msg: ServerMessage, origin: string | null, protocols: string[] | null, supported_extensions: GObject.TypeClass[] | null): boolean;

    function websocket_server_process_handshake(msg: ServerMessage, expected_origin: string | null, protocols: string[] | null, supported_extensions: GObject.TypeClass[] | null): [boolean, WebsocketExtension[] | null];

    interface AuthDomainBasicAuthCallback {
        (domain: AuthDomainBasic, msg: ServerMessage, username: string, password: string): boolean;
    }

    interface AuthDomainDigestAuthCallback {
        (domain: AuthDomainDigest, msg: ServerMessage, username: string): string | null;
    }

    interface AuthDomainFilter {
        (domain: AuthDomain, msg: ServerMessage): boolean;
    }

    interface AuthDomainGenericAuthCallback {
        (domain: AuthDomain, msg: ServerMessage, username: string): boolean;
    }

    interface LoggerFilter {
        (logger: Logger, msg: Message): LoggerLogLevel;
    }

    interface LoggerPrinter {
        (logger: Logger, level: LoggerLogLevel, direction: number, data: string): void;
    }

    interface MessageHeadersForeachFunc {
        (name: string, value: string): void;
    }

    interface ServerCallback {
        (server: Server, msg: ServerMessage, path: string, query: { [key: string]: string } | null): void;
    }

    interface ServerWebsocketCallback {
        (server: Server, msg: ServerMessage, path: string, connection: WebsocketConnection): void;
    }

    export namespace Cacheability {
        export const $gtype: GObject.GType<Cacheability>;
    }

    enum Cacheability {
        CACHEABLE = 1,
        UNCACHEABLE = 2,
        INVALIDATES = 4,
        VALIDATES = 8,
    }


    export namespace Expectation {
        export const $gtype: GObject.GType<Expectation>;
    }

    enum Expectation {
        UNRECOGNIZED = 1,
        CONTINUE = 2,
    }


    export namespace MessageFlags {
        export const $gtype: GObject.GType<MessageFlags>;
    }

    enum MessageFlags {
        NO_REDIRECT = 2,
        NEW_CONNECTION = 4,
        IDEMPOTENT = 8,
        DO_NOT_USE_AUTH_CACHE = 16,
        COLLECT_METRICS = 32,
    }


    export namespace ServerListenOptions {
        export const $gtype: GObject.GType<ServerListenOptions>;
    }

    enum ServerListenOptions {
        HTTPS = 1,
        IPV4_ONLY = 2,
        IPV6_ONLY = 4,
    }


    namespace Auth {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::authority": (pspec: GObject.ParamSpec) => void;
            "notify::is-authenticated": (pspec: GObject.ParamSpec) => void;
            "notify::is-cancelled": (pspec: GObject.ParamSpec) => void;
            "notify::is-for-proxy": (pspec: GObject.ParamSpec) => void;
            "notify::realm": (pspec: GObject.ParamSpec) => void;
            "notify::scheme-name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            authority: string;
            is_authenticated: boolean;
            isAuthenticated: boolean;
            is_cancelled: boolean;
            isCancelled: boolean;
            is_for_proxy: boolean;
            isForProxy: boolean;
            realm: string;
            scheme_name: string;
            schemeName: string;
        }
    }

    abstract class Auth extends GObject.Object {
        static $gtype: GObject.GType<Auth>;

        // Properties
        get authority(): string;
        set authority(val: string);

        get is_authenticated(): boolean;

        get isAuthenticated(): boolean;

        get is_cancelled(): boolean;

        get isCancelled(): boolean;

        get is_for_proxy(): boolean;
        set is_for_proxy(val: boolean);

        get isForProxy(): boolean;
        set isForProxy(val: boolean);

        get realm(): string;
        set realm(val: string);

        get scheme_name(): string;

        get schemeName(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Auth.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Auth.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](type: GObject.GType, msg: Message, auth_header: string): Auth;

        // Signals
        /** @signal */
        connect<K extends keyof Auth.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Auth.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Auth.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Auth.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Auth.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Auth.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_authenticate(username: string, password: string): void;

        vfunc_can_authenticate(): boolean;

        vfunc_get_authorization(msg: Message): string;

        vfunc_get_protection_space(source_uri: GLib.Uri): string[];

        vfunc_is_authenticated(): boolean;

        vfunc_is_ready(msg: Message): boolean;

        vfunc_update(msg: Message, auth_header: never): boolean;

        // Methods
        authenticate(username: string, password: string): void;

        can_authenticate(): boolean;

        cancel(): void;

        get_authority(): string;

        get_authorization(msg: Message): string;

        get_info(): string;

        get_protection_space(source_uri: GLib.Uri): string[];

        get_realm(): string;

        get_scheme_name(): string;

        is_ready(msg: Message): boolean;

        update(msg: Message, auth_header: string): boolean;
    }


    namespace AuthBasic {
        // Signal signatures
        interface SignalSignatures extends Auth.SignalSignatures {
            "notify::authority": (pspec: GObject.ParamSpec) => void;
            "notify::is-authenticated": (pspec: GObject.ParamSpec) => void;
            "notify::is-cancelled": (pspec: GObject.ParamSpec) => void;
            "notify::is-for-proxy": (pspec: GObject.ParamSpec) => void;
            "notify::realm": (pspec: GObject.ParamSpec) => void;
            "notify::scheme-name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Auth.ConstructorProps {}
    }

    class AuthBasic extends Auth {
        static $gtype: GObject.GType<AuthBasic>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AuthBasic.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AuthBasic.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof AuthBasic.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthBasic.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AuthBasic.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthBasic.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AuthBasic.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AuthBasic.SignalSignatures[K]>): void;
    }


    namespace AuthDigest {
        // Signal signatures
        interface SignalSignatures extends Auth.SignalSignatures {
            "notify::authority": (pspec: GObject.ParamSpec) => void;
            "notify::is-authenticated": (pspec: GObject.ParamSpec) => void;
            "notify::is-cancelled": (pspec: GObject.ParamSpec) => void;
            "notify::is-for-proxy": (pspec: GObject.ParamSpec) => void;
            "notify::realm": (pspec: GObject.ParamSpec) => void;
            "notify::scheme-name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Auth.ConstructorProps {}
    }

    class AuthDigest extends Auth {
        static $gtype: GObject.GType<AuthDigest>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AuthDigest.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AuthDigest.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof AuthDigest.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthDigest.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AuthDigest.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthDigest.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AuthDigest.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AuthDigest.SignalSignatures[K]>): void;
    }


    namespace AuthDomain {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::filter": (pspec: GObject.ParamSpec) => void;
            "notify::filter-data": (pspec: GObject.ParamSpec) => void;
            "notify::generic-auth-callback": (pspec: GObject.ParamSpec) => void;
            "notify::generic-auth-data": (pspec: GObject.ParamSpec) => void;
            "notify::proxy": (pspec: GObject.ParamSpec) => void;
            "notify::realm": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            filter: AuthDomainFilter;
            filter_data: never;
            filterData: never;
            generic_auth_callback: AuthDomainGenericAuthCallback;
            genericAuthCallback: AuthDomainGenericAuthCallback;
            generic_auth_data: never;
            genericAuthData: never;
            proxy: boolean;
            realm: string;
        }
    }

    abstract class AuthDomain extends GObject.Object {
        static $gtype: GObject.GType<AuthDomain>;

        // Properties
        get filter(): AuthDomainFilter;
        set filter(val: AuthDomainFilter);

        get filter_data(): null;
        set filter_data(val: never);

        get filterData(): null;
        set filterData(val: never);

        get generic_auth_callback(): AuthDomainGenericAuthCallback;
        set generic_auth_callback(val: AuthDomainGenericAuthCallback);

        get genericAuthCallback(): AuthDomainGenericAuthCallback;
        set genericAuthCallback(val: AuthDomainGenericAuthCallback);

        get generic_auth_data(): null;
        set generic_auth_data(val: never);

        get genericAuthData(): null;
        set genericAuthData(val: never);

        get proxy(): boolean;

        get realm(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AuthDomain.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AuthDomain.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof AuthDomain.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthDomain.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AuthDomain.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthDomain.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AuthDomain.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AuthDomain.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_accepts(msg: ServerMessage, header: string): string;

        vfunc_challenge(msg: ServerMessage): string;

        vfunc_check_password(msg: ServerMessage, username: string, password: string): boolean;

        // Methods
        accepts(msg: ServerMessage): string | null;

        add_path(path: string): void;

        challenge(msg: ServerMessage): void;

        check_password(msg: ServerMessage, username: string, password: string): boolean;

        covers(msg: ServerMessage): boolean;

        get_realm(): string;

        remove_path(path: string): void;

        set_filter(filter: AuthDomainFilter): void;

        set_generic_auth_callback(auth_callback: AuthDomainGenericAuthCallback): void;
    }


    namespace AuthDomainBasic {
        // Signal signatures
        interface SignalSignatures extends AuthDomain.SignalSignatures {
            "notify::auth-callback": (pspec: GObject.ParamSpec) => void;
            "notify::auth-data": (pspec: GObject.ParamSpec) => void;
            "notify::filter": (pspec: GObject.ParamSpec) => void;
            "notify::filter-data": (pspec: GObject.ParamSpec) => void;
            "notify::generic-auth-callback": (pspec: GObject.ParamSpec) => void;
            "notify::generic-auth-data": (pspec: GObject.ParamSpec) => void;
            "notify::proxy": (pspec: GObject.ParamSpec) => void;
            "notify::realm": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends AuthDomain.ConstructorProps {
            auth_callback: AuthDomainBasicAuthCallback;
            authCallback: AuthDomainBasicAuthCallback;
            auth_data: never;
            authData: never;
        }
    }

    class AuthDomainBasic extends AuthDomain {
        static $gtype: GObject.GType<AuthDomainBasic>;

        // Properties
        get auth_callback(): AuthDomainBasicAuthCallback;
        set auth_callback(val: AuthDomainBasicAuthCallback);

        get authCallback(): AuthDomainBasicAuthCallback;
        set authCallback(val: AuthDomainBasicAuthCallback);

        get auth_data(): null;
        set auth_data(val: never);

        get authData(): null;
        set authData(val: never);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AuthDomainBasic.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AuthDomainBasic.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof AuthDomainBasic.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthDomainBasic.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AuthDomainBasic.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthDomainBasic.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AuthDomainBasic.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AuthDomainBasic.SignalSignatures[K]>): void;

        // Methods
        set_auth_callback(callback: AuthDomainBasicAuthCallback): void;
    }


    namespace AuthDomainDigest {
        // Signal signatures
        interface SignalSignatures extends AuthDomain.SignalSignatures {
            "notify::auth-callback": (pspec: GObject.ParamSpec) => void;
            "notify::auth-data": (pspec: GObject.ParamSpec) => void;
            "notify::filter": (pspec: GObject.ParamSpec) => void;
            "notify::filter-data": (pspec: GObject.ParamSpec) => void;
            "notify::generic-auth-callback": (pspec: GObject.ParamSpec) => void;
            "notify::generic-auth-data": (pspec: GObject.ParamSpec) => void;
            "notify::proxy": (pspec: GObject.ParamSpec) => void;
            "notify::realm": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends AuthDomain.ConstructorProps {
            auth_callback: AuthDomainDigestAuthCallback;
            authCallback: AuthDomainDigestAuthCallback;
            auth_data: never;
            authData: never;
        }
    }

    class AuthDomainDigest extends AuthDomain {
        static $gtype: GObject.GType<AuthDomainDigest>;

        // Properties
        get auth_callback(): AuthDomainDigestAuthCallback;
        set auth_callback(val: AuthDomainDigestAuthCallback);

        get authCallback(): AuthDomainDigestAuthCallback;
        set authCallback(val: AuthDomainDigestAuthCallback);

        get auth_data(): null;
        set auth_data(val: never);

        get authData(): null;
        set authData(val: never);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AuthDomainDigest.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AuthDomainDigest.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof AuthDomainDigest.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthDomainDigest.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AuthDomainDigest.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthDomainDigest.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AuthDomainDigest.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AuthDomainDigest.SignalSignatures[K]>): void;

        // Static methods
        static encode_password(username: string, realm: string, password: string): string;

        // Methods
        set_auth_callback(callback: AuthDomainDigestAuthCallback): void;
    }


    namespace AuthManager {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, SessionFeature.ConstructorProps {}
    }

    class AuthManager extends GObject.Object implements SessionFeature {
        static $gtype: GObject.GType<AuthManager>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AuthManager.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AuthManager.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof AuthManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthManager.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AuthManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthManager.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AuthManager.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AuthManager.SignalSignatures[K]>): void;

        // Methods
        clear_cached_credentials(): void;

        use_auth(uri: GLib.Uri, auth: Auth): void;
    }


    namespace AuthNTLM {
        // Signal signatures
        interface SignalSignatures extends Auth.SignalSignatures {
            "notify::authority": (pspec: GObject.ParamSpec) => void;
            "notify::is-authenticated": (pspec: GObject.ParamSpec) => void;
            "notify::is-cancelled": (pspec: GObject.ParamSpec) => void;
            "notify::is-for-proxy": (pspec: GObject.ParamSpec) => void;
            "notify::realm": (pspec: GObject.ParamSpec) => void;
            "notify::scheme-name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Auth.ConstructorProps {}
    }

    class AuthNTLM extends Auth {
        static $gtype: GObject.GType<AuthNTLM>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AuthNTLM.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AuthNTLM.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof AuthNTLM.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthNTLM.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AuthNTLM.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthNTLM.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AuthNTLM.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AuthNTLM.SignalSignatures[K]>): void;
    }


    namespace AuthNegotiate {
        // Signal signatures
        interface SignalSignatures extends Auth.SignalSignatures {
            "notify::authority": (pspec: GObject.ParamSpec) => void;
            "notify::is-authenticated": (pspec: GObject.ParamSpec) => void;
            "notify::is-cancelled": (pspec: GObject.ParamSpec) => void;
            "notify::is-for-proxy": (pspec: GObject.ParamSpec) => void;
            "notify::realm": (pspec: GObject.ParamSpec) => void;
            "notify::scheme-name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Auth.ConstructorProps {}
    }

    class AuthNegotiate extends Auth {
        static $gtype: GObject.GType<AuthNegotiate>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AuthNegotiate.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AuthNegotiate.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof AuthNegotiate.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthNegotiate.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AuthNegotiate.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AuthNegotiate.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AuthNegotiate.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AuthNegotiate.SignalSignatures[K]>): void;

        // Static methods
        static supported(): boolean;
    }


    namespace Cache {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::cache-dir": (pspec: GObject.ParamSpec) => void;
            "notify::cache-type": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, SessionFeature.ConstructorProps {
            cache_dir: string;
            cacheDir: string;
            cache_type: CacheType;
            cacheType: CacheType;
        }
    }

    class Cache extends GObject.Object implements SessionFeature {
        static $gtype: GObject.GType<Cache>;

        // Properties
        get cache_dir(): string;

        get cacheDir(): string;

        get cache_type(): CacheType;

        get cacheType(): CacheType;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Cache.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Cache.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](cache_dir: string | null, cache_type: CacheType): Cache;

        // Signals
        /** @signal */
        connect<K extends keyof Cache.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Cache.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Cache.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Cache.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Cache.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Cache.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_cacheability(msg: Message): Cacheability;

        // Methods
        clear(): void;

        dump(): void;

        flush(): void;

        get_max_size(): number;

        load(): void;

        set_max_size(max_size: number): void;
    }


    namespace CompressionDictionaryRequest {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::cancelled": (pspec: GObject.ParamSpec) => void;
            "notify::dictionary": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            cancelled: boolean;
            dictionary: GLib.Bytes | Uint8Array;
        }
    }

    class CompressionDictionaryRequest extends GObject.Object {
        static $gtype: GObject.GType<CompressionDictionaryRequest>;

        // Properties
        get cancelled(): boolean;

        get dictionary(): GLib.Bytes;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: CompressionDictionaryRequest.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<CompressionDictionaryRequest.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof CompressionDictionaryRequest.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CompressionDictionaryRequest.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof CompressionDictionaryRequest.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CompressionDictionaryRequest.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof CompressionDictionaryRequest.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<CompressionDictionaryRequest.SignalSignatures[K]>): void;

        // Methods
        cancel(): void;

        set_dictionary(dictionary: GLib.Bytes | Uint8Array): void;
    }


    namespace ContentDecoder {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, SessionFeature.ConstructorProps {}
    }

    class ContentDecoder extends GObject.Object implements SessionFeature {
        static $gtype: GObject.GType<ContentDecoder>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ContentDecoder.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ContentDecoder.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ContentDecoder.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ContentDecoder.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ContentDecoder.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ContentDecoder.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ContentDecoder.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ContentDecoder.SignalSignatures[K]>): void;
    }


    namespace ContentSniffer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, SessionFeature.ConstructorProps {}
    }

    class ContentSniffer extends GObject.Object implements SessionFeature {
        static $gtype: GObject.GType<ContentSniffer>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ContentSniffer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ContentSniffer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): ContentSniffer;

        // Signals
        /** @signal */
        connect<K extends keyof ContentSniffer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ContentSniffer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ContentSniffer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ContentSniffer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ContentSniffer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ContentSniffer.SignalSignatures[K]>): void;

        // Methods
        sniff(msg: Message, buffer: GLib.Bytes | Uint8Array): [string, { [key: string]: string } | null];
    }


    namespace CookieJar {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            changed: (old_cookie: Cookie | null, new_cookie: Cookie | null) => void;
            "notify::accept-policy": (pspec: GObject.ParamSpec) => void;
            "notify::read-only": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, SessionFeature.ConstructorProps {
            accept_policy: CookieJarAcceptPolicy;
            acceptPolicy: CookieJarAcceptPolicy;
            read_only: boolean;
            readOnly: boolean;
        }
    }

    class CookieJar extends GObject.Object implements SessionFeature {
        static $gtype: GObject.GType<CookieJar>;

        // Properties
        get accept_policy(): CookieJarAcceptPolicy;
        set accept_policy(val: CookieJarAcceptPolicy);

        get acceptPolicy(): CookieJarAcceptPolicy;
        set acceptPolicy(val: CookieJarAcceptPolicy);

        get read_only(): boolean;

        get readOnly(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: CookieJar.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<CookieJar.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): CookieJar;

        // Signals
        /** @signal */
        connect<K extends keyof CookieJar.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CookieJar.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof CookieJar.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CookieJar.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof CookieJar.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<CookieJar.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_changed(old_cookie: Cookie, new_cookie: Cookie): void;

        vfunc_is_persistent(): boolean;

        vfunc_save(): void;

        // Methods
        add_cookie(cookie: Cookie): void;

        add_cookie_full(cookie: Cookie, uri: GLib.Uri | null, first_party: GLib.Uri | null): void;

        add_cookie_with_first_party(first_party: GLib.Uri, cookie: Cookie): void;

        all_cookies(): Cookie[];

        delete_cookie(cookie: Cookie): void;

        get_accept_policy(): CookieJarAcceptPolicy;

        get_cookie_list(uri: GLib.Uri, for_http: boolean): Cookie[];

        get_cookie_list_with_same_site_info(uri: GLib.Uri, top_level: GLib.Uri | null, site_for_cookies: GLib.Uri | null, for_http: boolean, is_safe_method: boolean, is_top_level_navigation: boolean): Cookie[];

        get_cookies(uri: GLib.Uri, for_http: boolean): string | null;

        is_persistent(): boolean;

        set_accept_policy(policy: CookieJarAcceptPolicy): void;

        set_cookie(uri: GLib.Uri, cookie: string): void;

        set_cookie_with_first_party(uri: GLib.Uri, first_party: GLib.Uri, cookie: string): void;
    }


    namespace CookieJarDB {
        // Signal signatures
        interface SignalSignatures extends CookieJar.SignalSignatures {
            "notify::filename": (pspec: GObject.ParamSpec) => void;
            "notify::max-size": (pspec: GObject.ParamSpec) => void;
            "notify::accept-policy": (pspec: GObject.ParamSpec) => void;
            "notify::read-only": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends CookieJar.ConstructorProps, Gio.Initable.ConstructorProps, SessionFeature.ConstructorProps {
            filename: string;
            max_size: bigint | number;
            maxSize: bigint | number;
        }
    }

    class CookieJarDB extends CookieJar implements Gio.Initable, SessionFeature {
        static $gtype: GObject.GType<CookieJarDB>;

        // Properties
        get filename(): string;

        get max_size(): number;

        get maxSize(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: CookieJarDB.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<CookieJarDB.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](filename: string, read_only: boolean): CookieJarDB;

        // Conflicted with Soup.CookieJar.new
        static ["new"](...args: never[]): any;

        static new_with_error(filename: string, read_only: boolean): CookieJarDB;

        // Signals
        /** @signal */
        connect<K extends keyof CookieJarDB.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CookieJarDB.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof CookieJarDB.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CookieJarDB.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof CookieJarDB.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<CookieJarDB.SignalSignatures[K]>): void;

        // Methods
        get_max_size(): number;

        set_max_size(max_size: bigint | number): boolean;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace CookieJarText {
        // Signal signatures
        interface SignalSignatures extends CookieJar.SignalSignatures {
            "notify::filename": (pspec: GObject.ParamSpec) => void;
            "notify::accept-policy": (pspec: GObject.ParamSpec) => void;
            "notify::read-only": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends CookieJar.ConstructorProps, SessionFeature.ConstructorProps {
            filename: string;
        }
    }

    class CookieJarText extends CookieJar implements SessionFeature {
        static $gtype: GObject.GType<CookieJarText>;

        // Properties
        get filename(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: CookieJarText.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<CookieJarText.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](filename: string, read_only: boolean): CookieJarText;

        // Conflicted with Soup.CookieJar.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof CookieJarText.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CookieJarText.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof CookieJarText.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CookieJarText.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof CookieJarText.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<CookieJarText.SignalSignatures[K]>): void;
    }


    namespace HSTSEnforcer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            changed: (old_policy: HSTSPolicy, new_policy: HSTSPolicy) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, SessionFeature.ConstructorProps {}
    }

    class HSTSEnforcer extends GObject.Object implements SessionFeature {
        static $gtype: GObject.GType<HSTSEnforcer>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: HSTSEnforcer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<HSTSEnforcer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): HSTSEnforcer;

        // Signals
        /** @signal */
        connect<K extends keyof HSTSEnforcer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, HSTSEnforcer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof HSTSEnforcer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, HSTSEnforcer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof HSTSEnforcer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<HSTSEnforcer.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_changed(old_policy: HSTSPolicy, new_policy: HSTSPolicy): void;

        vfunc_has_valid_policy(domain: string): boolean;

        vfunc_is_persistent(): boolean;

        // Methods
        get_domains(session_policies: boolean): string[];

        get_policies(session_policies: boolean): HSTSPolicy[];

        has_valid_policy(domain: string): boolean;

        is_persistent(): boolean;

        set_policy(policy: HSTSPolicy): void;

        set_session_policy(domain: string, include_subdomains: boolean): void;
    }


    namespace HSTSEnforcerDB {
        // Signal signatures
        interface SignalSignatures extends HSTSEnforcer.SignalSignatures {
            "notify::filename": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends HSTSEnforcer.ConstructorProps, SessionFeature.ConstructorProps {
            filename: string;
        }
    }

    class HSTSEnforcerDB extends HSTSEnforcer implements SessionFeature {
        static $gtype: GObject.GType<HSTSEnforcerDB>;

        // Properties
        get filename(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: HSTSEnforcerDB.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<HSTSEnforcerDB.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](filename: string): HSTSEnforcerDB;

        // Conflicted with Soup.HSTSEnforcer.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof HSTSEnforcerDB.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, HSTSEnforcerDB.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof HSTSEnforcerDB.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, HSTSEnforcerDB.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof HSTSEnforcerDB.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<HSTSEnforcerDB.SignalSignatures[K]>): void;
    }


    namespace Logger {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::level": (pspec: GObject.ParamSpec) => void;
            "notify::max-body-size": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, SessionFeature.ConstructorProps {
            level: LoggerLogLevel;
            max_body_size: number;
            maxBodySize: number;
        }
    }

    class Logger extends GObject.Object implements SessionFeature {
        static $gtype: GObject.GType<Logger>;

        // Properties
        get level(): LoggerLogLevel;
        set level(val: LoggerLogLevel);

        get max_body_size(): number;
        set max_body_size(val: number);

        get maxBodySize(): number;
        set maxBodySize(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Logger.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Logger.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](level: LoggerLogLevel): Logger;

        // Signals
        /** @signal */
        connect<K extends keyof Logger.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Logger.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Logger.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Logger.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Logger.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Logger.SignalSignatures[K]>): void;

        // Methods
        get_max_body_size(): number;

        set_max_body_size(max_body_size: number): void;

        set_printer(printer: LoggerPrinter): void;

        set_request_filter(request_filter: LoggerFilter): void;

        set_response_filter(response_filter: LoggerFilter): void;
    }


    namespace Message {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "accept-certificate": (tls_peer_certificate: Gio.TlsCertificate, tls_peer_errors: Gio.TlsCertificateFlags) => boolean | void;
            /** @signal */
            authenticate: (auth: Auth, retrying: boolean) => boolean | void;
            /** @signal */
            "content-sniffed": (type: string, params: { [key: string]: string }) => void;
            /** @signal */
            finished: () => void;
            /** @signal */
            "got-body": () => void;
            /** @signal */
            "got-body-data": (chunk_size: number) => void;
            /** @signal */
            "got-headers": () => void;
            /** @signal */
            "got-informational": () => void;
            /** @signal */
            "hsts-enforced": () => void;
            /** @signal */
            "network-event": (event: Gio.SocketClientEvent, connection: Gio.IOStream) => void;
            /** @signal */
            "request-certificate": (tls_connection: Gio.TlsClientConnection) => boolean | void;
            /** @signal */
            "request-certificate-password": (tls_password: Gio.TlsPassword) => boolean | void;
            /** @signal */
            "request-compression-dictionary": (request: CompressionDictionaryRequest) => boolean | void;
            /** @signal */
            restarted: () => void;
            /** @signal */
            starting: () => void;
            /** @signal */
            "wrote-body": () => void;
            /** @signal */
            "wrote-body-data": (chunk_size: number) => void;
            /** @signal */
            "wrote-headers": () => void;
            "notify::first-party": (pspec: GObject.ParamSpec) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::http-version": (pspec: GObject.ParamSpec) => void;
            "notify::is-options-ping": (pspec: GObject.ParamSpec) => void;
            "notify::is-top-level-navigation": (pspec: GObject.ParamSpec) => void;
            "notify::method": (pspec: GObject.ParamSpec) => void;
            "notify::priority": (pspec: GObject.ParamSpec) => void;
            "notify::reason-phrase": (pspec: GObject.ParamSpec) => void;
            "notify::remote-address": (pspec: GObject.ParamSpec) => void;
            "notify::request-headers": (pspec: GObject.ParamSpec) => void;
            "notify::response-headers": (pspec: GObject.ParamSpec) => void;
            "notify::site-for-cookies": (pspec: GObject.ParamSpec) => void;
            "notify::status-code": (pspec: GObject.ParamSpec) => void;
            "notify::tls-ciphersuite-name": (pspec: GObject.ParamSpec) => void;
            "notify::tls-peer-certificate": (pspec: GObject.ParamSpec) => void;
            "notify::tls-peer-certificate-errors": (pspec: GObject.ParamSpec) => void;
            "notify::tls-protocol-version": (pspec: GObject.ParamSpec) => void;
            "notify::uri": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            first_party: GLib.Uri;
            firstParty: GLib.Uri;
            flags: MessageFlags;
            http_version: HTTPVersion;
            httpVersion: HTTPVersion;
            is_options_ping: boolean;
            isOptionsPing: boolean;
            is_top_level_navigation: boolean;
            isTopLevelNavigation: boolean;
            method: string;
            priority: MessagePriority;
            reason_phrase: string | null;
            reasonPhrase: string | null;
            remote_address: Gio.SocketAddress | null;
            remoteAddress: Gio.SocketAddress | null;
            request_headers: MessageHeaders;
            requestHeaders: MessageHeaders;
            response_headers: MessageHeaders;
            responseHeaders: MessageHeaders;
            site_for_cookies: GLib.Uri;
            siteForCookies: GLib.Uri;
            status_code: number;
            statusCode: number;
            tls_ciphersuite_name: string;
            tlsCiphersuiteName: string;
            tls_peer_certificate: Gio.TlsCertificate | null;
            tlsPeerCertificate: Gio.TlsCertificate | null;
            tls_peer_certificate_errors: Gio.TlsCertificateFlags;
            tlsPeerCertificateErrors: Gio.TlsCertificateFlags;
            tls_protocol_version: Gio.TlsProtocolVersion;
            tlsProtocolVersion: Gio.TlsProtocolVersion;
            uri: GLib.Uri;
        }
    }

    class Message extends GObject.Object {
        static $gtype: GObject.GType<Message>;

        // Properties
        get first_party(): GLib.Uri;
        set first_party(val: GLib.Uri);

        get firstParty(): GLib.Uri;
        set firstParty(val: GLib.Uri);

        get flags(): MessageFlags;
        set flags(val: MessageFlags);

        get http_version(): HTTPVersion;

        get httpVersion(): HTTPVersion;

        get is_options_ping(): boolean;
        set is_options_ping(val: boolean);

        get isOptionsPing(): boolean;
        set isOptionsPing(val: boolean);

        get is_top_level_navigation(): boolean;
        set is_top_level_navigation(val: boolean);

        get isTopLevelNavigation(): boolean;
        set isTopLevelNavigation(val: boolean);

        get method(): string;
        set method(val: string);

        get priority(): MessagePriority;
        set priority(val: MessagePriority);

        get reason_phrase(): string | null;

        get reasonPhrase(): string | null;

        get remote_address(): Gio.SocketAddress | null;

        get remoteAddress(): Gio.SocketAddress | null;

        get request_headers(): MessageHeaders;

        get requestHeaders(): MessageHeaders;

        get response_headers(): MessageHeaders;

        get responseHeaders(): MessageHeaders;

        get site_for_cookies(): GLib.Uri;
        set site_for_cookies(val: GLib.Uri);

        get siteForCookies(): GLib.Uri;
        set siteForCookies(val: GLib.Uri);

        get status_code(): number;

        get statusCode(): number;

        get tls_ciphersuite_name(): string;

        get tlsCiphersuiteName(): string;

        get tls_peer_certificate(): Gio.TlsCertificate | null;

        get tlsPeerCertificate(): Gio.TlsCertificate | null;

        get tls_peer_certificate_errors(): Gio.TlsCertificateFlags;

        get tlsPeerCertificateErrors(): Gio.TlsCertificateFlags;

        get tls_protocol_version(): Gio.TlsProtocolVersion;

        get tlsProtocolVersion(): Gio.TlsProtocolVersion;

        get uri(): GLib.Uri;
        set uri(val: GLib.Uri);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Message.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Message.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](method: string, uri_string: string): Message;

        static new_from_encoded_form(method: string, uri_string: string, encoded_form: string): Message;

        static new_from_multipart(uri_string: string, multipart: Multipart): Message;

        static new_from_uri(method: string, uri: GLib.Uri): Message;

        static new_options_ping(base_uri: GLib.Uri): Message;

        // Signals
        /** @signal */
        connect<K extends keyof Message.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Message.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Message.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Message.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Message.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Message.SignalSignatures[K]>): void;

        // Methods
        add_flags(flags: MessageFlags): void;

        disable_feature(feature_type: GObject.GType): void;

        get_compression_dictionary_hash(): GLib.Bytes | null;

        get_compression_dictionary_id(): string | null;

        get_connection_id(): number;

        get_first_party(): GLib.Uri;

        get_flags(): MessageFlags;

        get_force_http1(): boolean;

        get_http_version(): HTTPVersion;

        get_is_options_ping(): boolean;

        get_is_top_level_navigation(): boolean;

        get_method(): string;

        get_metrics(): MessageMetrics | null;

        get_priority(): MessagePriority;

        get_reason_phrase(): string | null;

        get_remote_address(): Gio.SocketAddress | null;

        get_request_headers(): MessageHeaders;

        get_response_headers(): MessageHeaders;

        get_site_for_cookies(): GLib.Uri;

        get_status(): Status;

        get_tls_ciphersuite_name(): string;

        get_tls_peer_certificate(): Gio.TlsCertificate | null;

        get_tls_peer_certificate_errors(): Gio.TlsCertificateFlags;

        get_tls_protocol_version(): Gio.TlsProtocolVersion;

        get_uri(): GLib.Uri;

        is_feature_disabled(feature_type: GObject.GType): boolean;

        is_keepalive(): boolean;

        query_flags(flags: MessageFlags): boolean;

        remove_flags(flags: MessageFlags): void;

        set_compression_dictionary_hash(hash: GLib.Bytes | Uint8Array | null): void;

        set_compression_dictionary_id(id: string | null): void;

        set_first_party(first_party: GLib.Uri): void;

        set_flags(flags: MessageFlags): void;

        set_force_http1(value: boolean): void;

        set_is_options_ping(is_options_ping: boolean): void;

        set_is_top_level_navigation(is_top_level_navigation: boolean): void;

        set_method(method: string): void;

        set_priority(priority: MessagePriority): void;

        set_request_body(content_type: string | null, stream: Gio.InputStream | null, content_length: bigint | number): void;

        set_request_body_from_bytes(content_type: string | null, bytes: GLib.Bytes | Uint8Array | null): void;

        set_site_for_cookies(site_for_cookies: GLib.Uri | null): void;

        set_tls_client_certificate(certificate: Gio.TlsCertificate | null): void;

        set_uri(uri: GLib.Uri): void;

        tls_client_certificate_password_request_complete(): void;
    }


    namespace MultipartInputStream {
        // Signal signatures
        interface SignalSignatures extends Gio.FilterInputStream.SignalSignatures {
            "notify::message": (pspec: GObject.ParamSpec) => void;
            "notify::base-stream": (pspec: GObject.ParamSpec) => void;
            "notify::close-base-stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gio.FilterInputStream.ConstructorProps, Gio.PollableInputStream.ConstructorProps {
            message: Message;
        }
    }

    class MultipartInputStream extends Gio.FilterInputStream implements Gio.PollableInputStream {
        static $gtype: GObject.GType<MultipartInputStream>;

        // Properties
        get message(): Message;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MultipartInputStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MultipartInputStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](msg: Message, base_stream: Gio.InputStream): MultipartInputStream;

        // Signals
        /** @signal */
        connect<K extends keyof MultipartInputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MultipartInputStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MultipartInputStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MultipartInputStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MultipartInputStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MultipartInputStream.SignalSignatures[K]>): void;

        // Methods
        get_headers(): MessageHeaders | null;

        next_part(cancellable: Gio.Cancellable | null): Gio.InputStream | null;

        next_part_async(io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<Gio.InputStream | null>;

        next_part_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        next_part_async(io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Gio.InputStream | null> | void;

        next_part_finish(result: Gio.AsyncResult): Gio.InputStream | null;

        can_poll(): boolean;

        create_source(cancellable: Gio.Cancellable | null): GLib.Source;

        is_readable(): boolean;

        read_nonblocking(cancellable: Gio.Cancellable | null): [number, Uint8Array];

        vfunc_can_poll(): boolean;

        vfunc_create_source(cancellable: Gio.Cancellable | null): GLib.Source;

        vfunc_is_readable(): boolean;

        vfunc_read_nonblocking(): [bigint | number, Uint8Array | string | null];
    }


    namespace Server {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "request-aborted": (message: ServerMessage) => void;
            /** @signal */
            "request-finished": (message: ServerMessage) => void;
            /** @signal */
            "request-read": (message: ServerMessage) => void;
            /** @signal */
            "request-started": (message: ServerMessage) => void;
            "notify::raw-paths": (pspec: GObject.ParamSpec) => void;
            "notify::server-header": (pspec: GObject.ParamSpec) => void;
            "notify::tls-auth-mode": (pspec: GObject.ParamSpec) => void;
            "notify::tls-certificate": (pspec: GObject.ParamSpec) => void;
            "notify::tls-database": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            raw_paths: boolean;
            rawPaths: boolean;
            server_header: string;
            serverHeader: string;
            tls_auth_mode: Gio.TlsAuthenticationMode;
            tlsAuthMode: Gio.TlsAuthenticationMode;
            tls_certificate: Gio.TlsCertificate | null;
            tlsCertificate: Gio.TlsCertificate | null;
            tls_database: Gio.TlsDatabase | null;
            tlsDatabase: Gio.TlsDatabase | null;
        }
    }

    class Server extends GObject.Object {
        static $gtype: GObject.GType<Server>;

        // Properties
        get raw_paths(): boolean;

        get rawPaths(): boolean;

        get server_header(): string;
        set server_header(val: string);

        get serverHeader(): string;
        set serverHeader(val: string);

        get tls_auth_mode(): Gio.TlsAuthenticationMode;
        set tls_auth_mode(val: Gio.TlsAuthenticationMode);

        get tlsAuthMode(): Gio.TlsAuthenticationMode;
        set tlsAuthMode(val: Gio.TlsAuthenticationMode);

        get tls_certificate(): Gio.TlsCertificate | null;
        set tls_certificate(val: Gio.TlsCertificate | null);

        get tlsCertificate(): Gio.TlsCertificate | null;
        set tlsCertificate(val: Gio.TlsCertificate | null);

        get tls_database(): Gio.TlsDatabase | null;
        set tls_database(val: Gio.TlsDatabase | null);

        get tlsDatabase(): Gio.TlsDatabase | null;
        set tlsDatabase(val: Gio.TlsDatabase | null);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Server.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Server.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Server.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Server.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Server.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Server.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Server.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Server.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_request_aborted(msg: ServerMessage): void;

        vfunc_request_finished(msg: ServerMessage): void;

        vfunc_request_read(msg: ServerMessage): void;

        vfunc_request_started(msg: ServerMessage): void;

        // Methods
        accept_iostream(stream: Gio.IOStream, local_addr: Gio.SocketAddress | null, remote_addr: Gio.SocketAddress | null): boolean;

        add_auth_domain(auth_domain: AuthDomain): void;

        add_early_handler(path: string | null, callback: ServerCallback): void;

        add_handler(path: string | null, callback: ServerCallback): void;

        add_websocket_extension(extension_type: GObject.GType): void;

        add_websocket_handler(path: string | null, origin: string | null, protocols: string[] | null, callback: ServerWebsocketCallback): void;

        disconnect(): void;

        get_listeners(): Gio.Socket[];

        get_tls_auth_mode(): Gio.TlsAuthenticationMode;

        get_tls_certificate(): Gio.TlsCertificate | null;

        get_tls_database(): Gio.TlsDatabase | null;

        get_uris(): GLib.Uri[];

        is_https(): boolean;

        listen(address: Gio.SocketAddress, options: ServerListenOptions): boolean;

        listen_all(port: number, options: ServerListenOptions): boolean;

        listen_local(port: number, options: ServerListenOptions): boolean;

        listen_socket(socket: Gio.Socket, options: ServerListenOptions): boolean;

        pause_message(msg: ServerMessage): void;

        remove_auth_domain(auth_domain: AuthDomain): void;

        remove_handler(path: string): void;

        remove_websocket_extension(extension_type: GObject.GType): void;

        set_tls_auth_mode(mode: Gio.TlsAuthenticationMode): void;

        set_tls_certificate(certificate: Gio.TlsCertificate): void;

        set_tls_database(tls_database: Gio.TlsDatabase): void;

        unpause_message(msg: ServerMessage): void;
    }


    namespace ServerMessage {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "accept-certificate": (tls_peer_certificate: Gio.TlsCertificate, tls_peer_errors: Gio.TlsCertificateFlags) => boolean | void;
            /** @signal */
            connected: () => void;
            /** @signal */
            disconnected: () => void;
            /** @signal */
            finished: () => void;
            /** @signal */
            "got-body": () => void;
            /** @signal */
            "got-chunk": (chunk: GLib.Bytes) => void;
            /** @signal */
            "got-headers": () => void;
            /** @signal */
            "wrote-body": () => void;
            /** @signal */
            "wrote-body-data": (chunk_size: number) => void;
            /** @signal */
            "wrote-chunk": () => void;
            /** @signal */
            "wrote-headers": () => void;
            /** @signal */
            "wrote-informational": () => void;
            "notify::tls-peer-certificate": (pspec: GObject.ParamSpec) => void;
            "notify::tls-peer-certificate-errors": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            tls_peer_certificate: Gio.TlsCertificate | null;
            tlsPeerCertificate: Gio.TlsCertificate | null;
            tls_peer_certificate_errors: Gio.TlsCertificateFlags;
            tlsPeerCertificateErrors: Gio.TlsCertificateFlags;
        }
    }

    class ServerMessage extends GObject.Object {
        static $gtype: GObject.GType<ServerMessage>;

        // Properties
        get tls_peer_certificate(): Gio.TlsCertificate | null;

        get tlsPeerCertificate(): Gio.TlsCertificate | null;

        get tls_peer_certificate_errors(): Gio.TlsCertificateFlags;

        get tlsPeerCertificateErrors(): Gio.TlsCertificateFlags;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ServerMessage.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ServerMessage.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ServerMessage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ServerMessage.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ServerMessage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ServerMessage.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ServerMessage.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ServerMessage.SignalSignatures[K]>): void;

        // Methods
        get_http_version(): HTTPVersion;

        get_local_address(): Gio.SocketAddress | null;

        get_method(): string;

        get_reason_phrase(): string | null;

        get_remote_address(): Gio.SocketAddress | null;

        get_remote_host(): string | null;

        get_request_body(): MessageBody;

        get_request_headers(): MessageHeaders;

        get_response_body(): MessageBody;

        get_response_headers(): MessageHeaders;

        get_socket(): Gio.Socket | null;

        get_status(): number;

        get_tls_peer_certificate(): Gio.TlsCertificate | null;

        get_tls_peer_certificate_errors(): Gio.TlsCertificateFlags;

        get_uri(): GLib.Uri;

        is_options_ping(): boolean;

        pause(): void;

        set_http_version(version: HTTPVersion): void;

        set_redirect(status_code: number, redirect_uri: string): void;

        set_response(content_type: string | null, resp_use: MemoryUse, resp_body: Uint8Array | string | null): void;

        set_status(status_code: number, reason_phrase: string | null): void;

        steal_connection(): Gio.IOStream;

        unpause(): void;
    }


    namespace Session {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "request-queued": (msg: Message) => void;
            /** @signal */
            "request-unqueued": (msg: Message) => void;
            "notify::accept-language": (pspec: GObject.ParamSpec) => void;
            "notify::accept-language-auto": (pspec: GObject.ParamSpec) => void;
            "notify::idle-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::local-address": (pspec: GObject.ParamSpec) => void;
            "notify::max-conns": (pspec: GObject.ParamSpec) => void;
            "notify::max-conns-per-host": (pspec: GObject.ParamSpec) => void;
            "notify::proxy-resolver": (pspec: GObject.ParamSpec) => void;
            "notify::remote-connectable": (pspec: GObject.ParamSpec) => void;
            "notify::timeout": (pspec: GObject.ParamSpec) => void;
            "notify::tls-database": (pspec: GObject.ParamSpec) => void;
            "notify::tls-interaction": (pspec: GObject.ParamSpec) => void;
            "notify::user-agent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            accept_language: string | null;
            acceptLanguage: string | null;
            accept_language_auto: boolean;
            acceptLanguageAuto: boolean;
            idle_timeout: number;
            idleTimeout: number;
            local_address: Gio.InetSocketAddress | null;
            localAddress: Gio.InetSocketAddress | null;
            max_conns: number;
            maxConns: number;
            max_conns_per_host: number;
            maxConnsPerHost: number;
            proxy_resolver: Gio.ProxyResolver | null;
            proxyResolver: Gio.ProxyResolver | null;
            remote_connectable: Gio.SocketConnectable | null;
            remoteConnectable: Gio.SocketConnectable | null;
            timeout: number;
            tls_database: Gio.TlsDatabase | null;
            tlsDatabase: Gio.TlsDatabase | null;
            tls_interaction: Gio.TlsInteraction | null;
            tlsInteraction: Gio.TlsInteraction | null;
            user_agent: string | null;
            userAgent: string | null;
        }
    }

    class Session extends GObject.Object {
        static $gtype: GObject.GType<Session>;

        // Properties
        get accept_language(): string | null;
        set accept_language(val: string | null);

        get acceptLanguage(): string | null;
        set acceptLanguage(val: string | null);

        get accept_language_auto(): boolean;
        set accept_language_auto(val: boolean);

        get acceptLanguageAuto(): boolean;
        set acceptLanguageAuto(val: boolean);

        get idle_timeout(): number;
        set idle_timeout(val: number);

        get idleTimeout(): number;
        set idleTimeout(val: number);

        get local_address(): Gio.InetSocketAddress | null;

        get localAddress(): Gio.InetSocketAddress | null;

        get max_conns(): number;

        get maxConns(): number;

        get max_conns_per_host(): number;

        get maxConnsPerHost(): number;

        get proxy_resolver(): Gio.ProxyResolver | null;
        set proxy_resolver(val: Gio.ProxyResolver | null);

        get proxyResolver(): Gio.ProxyResolver | null;
        set proxyResolver(val: Gio.ProxyResolver | null);

        get remote_connectable(): Gio.SocketConnectable | null;

        get remoteConnectable(): Gio.SocketConnectable | null;

        get timeout(): number;
        set timeout(val: number);

        get tls_database(): Gio.TlsDatabase | null;
        set tls_database(val: Gio.TlsDatabase | null);

        get tlsDatabase(): Gio.TlsDatabase | null;
        set tlsDatabase(val: Gio.TlsDatabase | null);

        get tls_interaction(): Gio.TlsInteraction | null;
        set tls_interaction(val: Gio.TlsInteraction | null);

        get tlsInteraction(): Gio.TlsInteraction | null;
        set tlsInteraction(val: Gio.TlsInteraction | null);

        get user_agent(): string | null;
        set user_agent(val: string | null);

        get userAgent(): string | null;
        set userAgent(val: string | null);

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

        static ["new"](): Session;

        // Signals
        /** @signal */
        connect<K extends keyof Session.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Session.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Session.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Session.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Session.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Session.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_request_queued(msg: Message): void;

        vfunc_request_unqueued(msg: Message): void;

        // Methods
        abort(): void;

        add_feature(feature: SessionFeature): void;

        add_feature_by_type(feature_type: GObject.GType): void;

        get_accept_language(): string | null;

        get_accept_language_auto(): boolean;

        get_async_result_message(result: Gio.AsyncResult): Message | null;

        get_feature(feature_type: GObject.GType): SessionFeature | null;

        get_feature_for_message(feature_type: GObject.GType, msg: Message): SessionFeature | null;

        get_idle_timeout(): number;

        get_local_address(): Gio.InetSocketAddress | null;

        get_max_conns(): number;

        get_max_conns_per_host(): number;

        get_proxy_resolver(): Gio.ProxyResolver | null;

        get_remote_connectable(): Gio.SocketConnectable | null;

        get_timeout(): number;

        get_tls_database(): Gio.TlsDatabase | null;

        get_tls_interaction(): Gio.TlsInteraction | null;

        get_user_agent(): string | null;

        has_feature(feature_type: GObject.GType): boolean;

        preconnect_async(msg: Message, io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        preconnect_async(msg: Message, io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        preconnect_async(msg: Message, io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        preconnect_finish(result: Gio.AsyncResult): boolean;

        remove_feature(feature: SessionFeature): void;

        remove_feature_by_type(feature_type: GObject.GType): void;

        send(msg: Message, cancellable: Gio.Cancellable | null): Gio.InputStream;

        send_and_read(msg: Message, cancellable: Gio.Cancellable | null): GLib.Bytes;

        send_and_read_async(msg: Message, io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<GLib.Bytes>;

        send_and_read_async(msg: Message, io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        send_and_read_async(msg: Message, io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<GLib.Bytes> | void;

        send_and_read_finish(result: Gio.AsyncResult): GLib.Bytes;

        send_and_splice(msg: Message, out_stream: Gio.OutputStream, flags: Gio.OutputStreamSpliceFlags, cancellable: Gio.Cancellable | null): number;

        send_and_splice_async(msg: Message, out_stream: Gio.OutputStream, flags: Gio.OutputStreamSpliceFlags, io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<number>;

        send_and_splice_async(msg: Message, out_stream: Gio.OutputStream, flags: Gio.OutputStreamSpliceFlags, io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        send_and_splice_async(msg: Message, out_stream: Gio.OutputStream, flags: Gio.OutputStreamSpliceFlags, io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<number> | void;

        send_and_splice_finish(result: Gio.AsyncResult): number;

        send_async(msg: Message, io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<Gio.InputStream>;

        send_async(msg: Message, io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        send_async(msg: Message, io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Gio.InputStream> | void;

        send_finish(result: Gio.AsyncResult): Gio.InputStream;

        set_accept_language(accept_language: string): void;

        set_accept_language_auto(accept_language_auto: boolean): void;

        set_idle_timeout(timeout: number): void;

        set_proxy_resolver(proxy_resolver: Gio.ProxyResolver | null): void;

        set_timeout(timeout: number): void;

        set_tls_database(tls_database: Gio.TlsDatabase | null): void;

        set_tls_interaction(tls_interaction: Gio.TlsInteraction | null): void;

        set_user_agent(user_agent: string): void;

        websocket_connect_async(msg: Message, origin: string | null, protocols: string[] | null, io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<WebsocketConnection>;

        websocket_connect_async(msg: Message, origin: string | null, protocols: string[] | null, io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        websocket_connect_async(msg: Message, origin: string | null, protocols: string[] | null, io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<WebsocketConnection> | void;

        websocket_connect_finish(result: Gio.AsyncResult): WebsocketConnection;
    }


    namespace WebsocketConnection {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            closed: () => void;
            /** @signal */
            closing: () => void;
            /** @signal */
            error: (error: GLib.Error) => void;
            /** @signal */
            message: (type: number, message: GLib.Bytes) => void;
            /** @signal */
            pong: (message: GLib.Bytes) => void;
            "notify::connection-type": (pspec: GObject.ParamSpec) => void;
            "notify::extensions": (pspec: GObject.ParamSpec) => void;
            "notify::io-stream": (pspec: GObject.ParamSpec) => void;
            "notify::keepalive-interval": (pspec: GObject.ParamSpec) => void;
            "notify::keepalive-pong-timeout": (pspec: GObject.ParamSpec) => void;
            "notify::max-incoming-payload-size": (pspec: GObject.ParamSpec) => void;
            "notify::max-total-message-size": (pspec: GObject.ParamSpec) => void;
            "notify::origin": (pspec: GObject.ParamSpec) => void;
            "notify::protocol": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::uri": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            connection_type: WebsocketConnectionType;
            connectionType: WebsocketConnectionType;
            extensions: never;
            io_stream: Gio.IOStream;
            ioStream: Gio.IOStream;
            keepalive_interval: number;
            keepaliveInterval: number;
            keepalive_pong_timeout: number;
            keepalivePongTimeout: number;
            max_incoming_payload_size: bigint | number;
            maxIncomingPayloadSize: bigint | number;
            max_total_message_size: bigint | number;
            maxTotalMessageSize: bigint | number;
            origin: string | null;
            protocol: string | null;
            state: WebsocketState;
            uri: GLib.Uri;
        }
    }

    class WebsocketConnection extends GObject.Object {
        static $gtype: GObject.GType<WebsocketConnection>;

        // Properties
        get connection_type(): WebsocketConnectionType;

        get connectionType(): WebsocketConnectionType;

        get extensions(): null;

        get io_stream(): Gio.IOStream;

        get ioStream(): Gio.IOStream;

        get keepalive_interval(): number;
        set keepalive_interval(val: number);

        get keepaliveInterval(): number;
        set keepaliveInterval(val: number);

        get keepalive_pong_timeout(): number;
        set keepalive_pong_timeout(val: number);

        get keepalivePongTimeout(): number;
        set keepalivePongTimeout(val: number);

        get max_incoming_payload_size(): number;
        set max_incoming_payload_size(val: bigint | number);

        get maxIncomingPayloadSize(): number;
        set maxIncomingPayloadSize(val: bigint | number);

        get max_total_message_size(): number;
        set max_total_message_size(val: bigint | number);

        get maxTotalMessageSize(): number;
        set maxTotalMessageSize(val: bigint | number);

        get origin(): string | null;

        get protocol(): string | null;

        get state(): WebsocketState;

        get uri(): GLib.Uri;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WebsocketConnection.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WebsocketConnection.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](stream: Gio.IOStream, uri: GLib.Uri, type: WebsocketConnectionType, origin: string | null, protocol: string | null, extensions: WebsocketExtension[]): WebsocketConnection;

        // Signals
        /** @signal */
        connect<K extends keyof WebsocketConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WebsocketConnection.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WebsocketConnection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WebsocketConnection.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WebsocketConnection.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WebsocketConnection.SignalSignatures[K]>): void;

        // Methods
        close(code: number, data: string | null): void;

        get_close_code(): number;

        get_close_data(): string;

        get_connection_type(): WebsocketConnectionType;

        get_extensions(): WebsocketExtension[];

        get_io_stream(): Gio.IOStream;

        get_keepalive_interval(): number;

        get_keepalive_pong_timeout(): number;

        get_max_incoming_payload_size(): number;

        get_max_total_message_size(): number;

        get_origin(): string | null;

        get_protocol(): string | null;

        get_state(): WebsocketState;

        get_uri(): GLib.Uri;

        send_binary(data: Uint8Array | string | null): void;

        send_message(type: WebsocketDataType, message: GLib.Bytes | Uint8Array): void;

        send_text(text: string): void;

        set_keepalive_interval(interval: number): void;

        set_keepalive_pong_timeout(pong_timeout: number): void;

        set_max_incoming_payload_size(max_incoming_payload_size: bigint | number): void;

        set_max_total_message_size(max_total_message_size: bigint | number): void;
    }


    namespace WebsocketExtension {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class WebsocketExtension extends GObject.Object {
        static $gtype: GObject.GType<WebsocketExtension>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WebsocketExtension.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WebsocketExtension.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof WebsocketExtension.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WebsocketExtension.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WebsocketExtension.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WebsocketExtension.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WebsocketExtension.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WebsocketExtension.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_configure(connection_type: WebsocketConnectionType, params: never | null): boolean;

        vfunc_get_request_params(): string | null;

        vfunc_get_response_params(): string | null;

        vfunc_process_incoming_message(header: number, payload: GLib.Bytes): [GLib.Bytes | Uint8Array, number];

        vfunc_process_incoming_message_with_limit(header: number, payload: GLib.Bytes, max_output_size: number): [GLib.Bytes | Uint8Array, number];

        vfunc_process_outgoing_message(header: number, payload: GLib.Bytes): [GLib.Bytes | Uint8Array, number];

        // Methods
        configure(connection_type: WebsocketConnectionType, params: never | null): boolean;

        get_request_params(): string | null;

        get_response_params(): string | null;

        process_incoming_message(header: number, payload: GLib.Bytes | Uint8Array): [GLib.Bytes, number];

        process_incoming_message_with_limit(header: number, payload: GLib.Bytes | Uint8Array, max_output_size: bigint | number): [GLib.Bytes, number];

        process_outgoing_message(header: number, payload: GLib.Bytes | Uint8Array): [GLib.Bytes, number];
    }


    namespace WebsocketExtensionDeflate {
        // Signal signatures
        interface SignalSignatures extends WebsocketExtension.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends WebsocketExtension.ConstructorProps {}
    }

    class WebsocketExtensionDeflate extends WebsocketExtension {
        static $gtype: GObject.GType<WebsocketExtensionDeflate>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WebsocketExtensionDeflate.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WebsocketExtensionDeflate.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof WebsocketExtensionDeflate.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WebsocketExtensionDeflate.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WebsocketExtensionDeflate.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WebsocketExtensionDeflate.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WebsocketExtensionDeflate.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WebsocketExtensionDeflate.SignalSignatures[K]>): void;
    }


    namespace WebsocketExtensionManager {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, SessionFeature.ConstructorProps {}
    }

    class WebsocketExtensionManager extends GObject.Object implements SessionFeature {
        static $gtype: GObject.GType<WebsocketExtensionManager>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WebsocketExtensionManager.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WebsocketExtensionManager.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof WebsocketExtensionManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WebsocketExtensionManager.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WebsocketExtensionManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WebsocketExtensionManager.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WebsocketExtensionManager.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WebsocketExtensionManager.SignalSignatures[K]>): void;
    }


    type AuthClass = typeof Auth;

    type AuthDomainBasicClass = typeof AuthDomainBasic;

    type AuthDomainClass = typeof AuthDomain;

    type AuthDomainDigestClass = typeof AuthDomainDigest;

    type AuthManagerClass = typeof AuthManager;

    type CacheClass = typeof Cache;

    type CompressionDictionaryRequestClass = typeof CompressionDictionaryRequest;

    type ContentDecoderClass = typeof ContentDecoder;

    type ContentSnifferClass = typeof ContentSniffer;

    class Cookie {
        static $gtype: GObject.GType<Cookie>;

        // Constructors
        constructor(name: string, value: string, domain: string, path: string, max_age: number);

        static ["new"](name: string, value: string, domain: string, path: string, max_age: number): Cookie;

        // Static methods
        static parse(header: string, origin: GLib.Uri | null): Cookie | null;

        // Methods
        applies_to_uri(uri: GLib.Uri): boolean;

        copy(): Cookie;

        domain_matches(host: string): boolean;

        equal(cookie2: Cookie): boolean;

        free(): void;

        get_domain(): string;

        get_expires(): GLib.DateTime | null;

        get_http_only(): boolean;

        get_name(): string;

        get_path(): string;

        get_same_site_policy(): SameSitePolicy;

        get_secure(): boolean;

        get_value(): string;

        set_domain(domain: string): void;

        set_expires(expires: GLib.DateTime): void;

        set_http_only(http_only: boolean): void;

        set_max_age(max_age: number): void;

        set_name(name: string): void;

        set_path(path: string): void;

        set_same_site_policy(policy: SameSitePolicy): void;

        set_secure(secure: boolean): void;

        set_value(value: string): void;

        to_cookie_header(): string;

        to_set_cookie_header(): string;
    }


    type CookieJarClass = typeof CookieJar;

    type CookieJarDBClass = typeof CookieJarDB;

    type CookieJarTextClass = typeof CookieJarText;

    type HSTSEnforcerClass = typeof HSTSEnforcer;

    type HSTSEnforcerDBClass = typeof HSTSEnforcerDB;

    class HSTSPolicy {
        static $gtype: GObject.GType<HSTSPolicy>;

        // Constructors
        constructor(domain: string, max_age: bigint | number, include_subdomains: boolean);

        static ["new"](domain: string, max_age: bigint | number, include_subdomains: boolean): HSTSPolicy;

        static new_from_response(msg: Message): HSTSPolicy;

        static new_full(domain: string, max_age: bigint | number, expires: GLib.DateTime, include_subdomains: boolean): HSTSPolicy;

        static new_session_policy(domain: string, include_subdomains: boolean): HSTSPolicy;

        // Methods
        copy(): HSTSPolicy;

        equal(policy2: HSTSPolicy): boolean;

        free(): void;

        get_domain(): string;

        get_expires(): GLib.DateTime;

        get_max_age(): number;

        includes_subdomains(): boolean;

        is_expired(): boolean;

        is_session_policy(): boolean;
    }


    type LoggerClass = typeof Logger;

    class MessageBody {
        static $gtype: GObject.GType<MessageBody>;

        // Fields
        data: Uint8Array;

        length: number;

        // Constructors

        constructor(properties?: Partial<{
            data: Uint8Array;
            length: number;
        }>);

        static ["new"](): MessageBody;

        // Methods
        append_bytes(buffer: GLib.Bytes | Uint8Array): void;

        append(data: Uint8Array | string): void;

        complete(): void;

        flatten(): GLib.Bytes;

        get_accumulate(): boolean;

        get_chunk(offset: bigint | number): GLib.Bytes | null;

        got_chunk(chunk: GLib.Bytes | Uint8Array): void;

        ref(): MessageBody;

        set_accumulate(accumulate: boolean): void;

        truncate(): void;

        unref(): void;

        wrote_chunk(chunk: GLib.Bytes | Uint8Array): void;
    }


    type MessageClass = typeof Message;

    class MessageHeaders {
        static $gtype: GObject.GType<MessageHeaders>;

        // Constructors
        constructor(type: MessageHeadersType);

        static ["new"](type: MessageHeadersType): MessageHeaders;

        // Methods
        append(name: string, value: string): void;

        clean_connection_headers(): void;

        clear(): void;

        foreach(func: MessageHeadersForeachFunc): void;

        free_ranges(ranges: Range): void;

        get_content_disposition(): [boolean, string, { [key: string]: string }];

        get_content_length(): number;

        get_content_range(): [boolean, number, number, number];

        get_content_type(): [string | null, { [key: string]: string } | null];

        get_encoding(): Encoding;

        get_expectations(): Expectation;

        get_headers_type(): MessageHeadersType;

        get_list(name: string): string | null;

        get_one(name: string): string | null;

        get_ranges(total_length: bigint | number): [boolean, Range[]];

        header_contains(name: string, token: string): boolean;

        header_equals(name: string, value: string): boolean;

        ref(): MessageHeaders;

        remove(name: string): void;

        replace(name: string, value: string): void;

        set_content_disposition(disposition: string, params: { [key: string]: string } | null): void;

        set_content_length(content_length: bigint | number): void;

        set_content_range(start: bigint | number, end: bigint | number, total_length: bigint | number): void;

        set_content_type(content_type: string, params: { [key: string]: string } | null): void;

        set_encoding(encoding: Encoding): void;

        set_expectations(expectations: Expectation): void;

        set_range(start: bigint | number, end: bigint | number): void;

        set_ranges(ranges: Range, length: number): void;

        unref(): void;
    }


    class MessageHeadersIter {
        static $gtype: GObject.GType<MessageHeadersIter>;

        // Constructors
        constructor(properties?: Partial<{}>);

        // Static methods
        static init(hdrs: MessageHeaders): MessageHeadersIter;

        static next(iter: MessageHeadersIter): [boolean, MessageHeadersIter, string, string];
    }


    abstract class MessageMetrics {
        static $gtype: GObject.GType<MessageMetrics>;

        // Methods
        copy(): MessageMetrics;

        free(): void;

        get_connect_end(): number;

        get_connect_start(): number;

        get_dns_end(): number;

        get_dns_start(): number;

        get_fetch_start(): number;

        get_request_body_bytes_sent(): number;

        get_request_body_size(): number;

        get_request_header_bytes_sent(): number;

        get_request_start(): number;

        get_response_body_bytes_received(): number;

        get_response_body_size(): number;

        get_response_end(): number;

        get_response_header_bytes_received(): number;

        get_response_start(): number;

        get_tls_start(): number;
    }


    class Multipart {
        static $gtype: GObject.GType<Multipart>;

        // Constructors
        constructor(mime_type: string);

        static ["new"](mime_type: string): Multipart;

        static new_from_message(headers: MessageHeaders, body: GLib.Bytes | Uint8Array): Multipart;

        // Methods
        append_form_file(control_name: string, filename: string | null, content_type: string | null, body: GLib.Bytes | Uint8Array): void;

        append_form_string(control_name: string, data: string): void;

        append_part(headers: MessageHeaders, body: GLib.Bytes | Uint8Array): void;

        free(): void;

        get_length(): number;

        get_part(part: number): [boolean, MessageHeaders, GLib.Bytes];

        to_message(dest_headers: MessageHeaders): GLib.Bytes;
    }


    type MultipartInputStreamClass = typeof MultipartInputStream;

    class Range {
        static $gtype: GObject.GType<Range>;

        // Fields
        start: number;

        end: number;
    }


    type ServerClass = typeof Server;

    type ServerMessageClass = typeof ServerMessage;

    type SessionClass = typeof Session;

    type SessionFeatureInterface = typeof SessionFeature;

    type WebsocketConnectionClass = typeof WebsocketConnection;

    type WebsocketExtensionClass = typeof WebsocketExtension;

    type WebsocketExtensionDeflateClass = typeof WebsocketExtensionDeflate;

    type WebsocketExtensionManagerClass = typeof WebsocketExtensionManager;

    namespace SessionFeature {

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface SessionFeatureNamespace {
        $gtype: GObject.GType<SessionFeature>;
        prototype: SessionFeature;
    }
    interface SessionFeature extends GObject.Object {
    }


    export const SessionFeature: SessionFeatureNamespace & {
        new (): SessionFeature; // This allows `obj instanceof SessionFeature`
    };

    const __name__: string;

    const __version__: string;
}

export default Soup;

}

declare module 'gi://Soup' {
    import Soup30 from 'gi://Soup?version=3.0';
    export default Soup30;
}
// END
