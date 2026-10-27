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

declare module 'gi://Gst?version=1.0' {

// Module dependencies
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type GModule from 'gi://GModule?version=2.0';

export namespace Gst {

    /**
     * Gst-1.0
     */


    export namespace BufferingMode {
        export const $gtype: GObject.GType<BufferingMode>;
    }

    enum BufferingMode {
        STREAM = 0,
        DOWNLOAD = 1,
        TIMESHIFT = 2,
        LIVE = 3,
    }


    export namespace BusSyncReply {
        export const $gtype: GObject.GType<BusSyncReply>;
    }

    enum BusSyncReply {
        DROP = 0,
        PASS = 1,
        ASYNC = 2,
    }


    export namespace CapsIntersectMode {
        export const $gtype: GObject.GType<CapsIntersectMode>;
    }

    enum CapsIntersectMode {
        ZIG_ZAG = 0,
        FIRST = 1,
    }


    export namespace ClockEntryType {
        export const $gtype: GObject.GType<ClockEntryType>;
    }

    enum ClockEntryType {
        SINGLE = 0,
        PERIODIC = 1,
    }


    export namespace ClockReturn {
        export const $gtype: GObject.GType<ClockReturn>;
    }

    enum ClockReturn {
        OK = 0,
        EARLY = 1,
        UNSCHEDULED = 2,
        BUSY = 3,
        BADTIME = 4,
        ERROR = 5,
        UNSUPPORTED = 6,
        DONE = 7,
    }


    export namespace ClockType {
        export const $gtype: GObject.GType<ClockType>;
    }

    enum ClockType {
        REALTIME = 0,
        MONOTONIC = 1,
        OTHER = 2,
        TAI = 3,
    }


    class CoreError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static TOO_LAZY: number;

        static NOT_IMPLEMENTED: number;

        static STATE_CHANGE: number;

        static PAD: number;

        static THREAD: number;

        static NEGOTIATION: number;

        static EVENT: number;

        static SEEK: number;

        static CAPS: number;

        static TAG: number;

        static MISSING_PLUGIN: number;

        static CLOCK: number;

        static DISABLED: number;

        static NUM_ERRORS: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace DebugColorMode {
        export const $gtype: GObject.GType<DebugColorMode>;
    }

    enum DebugColorMode {
        OFF = 0,
        ON = 1,
        UNIX = 2,
    }


    export namespace DebugLevel {
        export const $gtype: GObject.GType<DebugLevel>;
    }

    enum DebugLevel {
        NONE = 0,
        ERROR = 1,
        WARNING = 2,
        FIXME = 3,
        INFO = 4,
        DEBUG = 5,
        LOG = 6,
        TRACE = 7,
        MEMDUMP = 9,
        COUNT = 10,
    }


    export namespace EventType {
        export const $gtype: GObject.GType<EventType>;
    }

    enum EventType {
        UNKNOWN = 0,
        FLUSH_START = 2563,
        FLUSH_STOP = 5127,
        STREAM_START = 10254,
        CAPS = 12814,
        SEGMENT = 17934,
        STREAM_COLLECTION = 19230,
        TAG = 20510,
        BUFFERSIZE = 23054,
        SINK_MESSAGE = 25630,
        STREAM_GROUP_DONE = 26894,
        EOS = 28174,
        TOC = 30750,
        PROTECTION = 33310,
        SEGMENT_DONE = 38406,
        GAP = 40966,
        INSTANT_RATE_CHANGE = 46090,
        QOS = 48641,
        SEEK = 51201,
        NAVIGATION = 53761,
        LATENCY = 56321,
        STEP = 58881,
        RECONFIGURE = 61441,
        TOC_SELECT = 64001,
        SELECT_STREAMS = 66561,
        INSTANT_RATE_SYNC_TIME = 66817,
        CUSTOM_UPSTREAM = 69121,
        CUSTOM_DOWNSTREAM = 71686,
        CUSTOM_DOWNSTREAM_OOB = 74242,
        CUSTOM_DOWNSTREAM_STICKY = 76830,
        CUSTOM_BOTH = 79367,
        CUSTOM_BOTH_OOB = 81923,
    }


    export namespace FlowReturn {
        export const $gtype: GObject.GType<FlowReturn>;
    }

    enum FlowReturn {
        CUSTOM_SUCCESS_2 = 102,
        CUSTOM_SUCCESS_1 = 101,
        CUSTOM_SUCCESS = 100,
        OK = 0,
        NOT_LINKED = -1,
        FLUSHING = -2,
        EOS = -3,
        NOT_NEGOTIATED = -4,
        ERROR = -5,
        NOT_SUPPORTED = -6,
        CUSTOM_ERROR = -100,
        CUSTOM_ERROR_1 = -101,
        CUSTOM_ERROR_2 = -102,
    }


    export namespace Format {
        export const $gtype: GObject.GType<Format>;
    }

    enum Format {
        UNDEFINED = 0,
        DEFAULT = 1,
        BYTES = 2,
        TIME = 3,
        BUFFERS = 4,
        PERCENT = 5,
    }


    export namespace IteratorItem {
        export const $gtype: GObject.GType<IteratorItem>;
    }

    enum IteratorItem {
        SKIP = 0,
        PASS = 1,
        END = 2,
    }


    export namespace IteratorResult {
        export const $gtype: GObject.GType<IteratorResult>;
    }

    enum IteratorResult {
        DONE = 0,
        OK = 1,
        RESYNC = 2,
        ERROR = 3,
    }


    class LibraryError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static TOO_LAZY: number;

        static INIT: number;

        static SHUTDOWN: number;

        static SETTINGS: number;

        static ENCODE: number;

        static NUM_ERRORS: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace PadDirection {
        export const $gtype: GObject.GType<PadDirection>;
    }

    enum PadDirection {
        UNKNOWN = 0,
        SRC = 1,
        SINK = 2,
    }


    export namespace PadLinkReturn {
        export const $gtype: GObject.GType<PadLinkReturn>;
    }

    enum PadLinkReturn {
        OK = 0,
        WRONG_HIERARCHY = -1,
        WAS_LINKED = -2,
        WRONG_DIRECTION = -3,
        NOFORMAT = -4,
        NOSCHED = -5,
        REFUSED = -6,
    }


    export namespace PadMode {
        export const $gtype: GObject.GType<PadMode>;
    }

    enum PadMode {
        NONE = 0,
        PUSH = 1,
        PULL = 2,
    }


    export namespace PadPresence {
        export const $gtype: GObject.GType<PadPresence>;
    }

    enum PadPresence {
        ALWAYS = 0,
        SOMETIMES = 1,
        REQUEST = 2,
    }


    export namespace PadProbeReturn {
        export const $gtype: GObject.GType<PadProbeReturn>;
    }

    enum PadProbeReturn {
        DROP = 0,
        OK = 1,
        REMOVE = 2,
        PASS = 3,
        HANDLED = 4,
    }


    class ParseError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static SYNTAX: number;

        static NO_SUCH_ELEMENT: number;

        static NO_SUCH_PROPERTY: number;

        static LINK: number;

        static COULD_NOT_SET_PROPERTY: number;

        static EMPTY_BIN: number;

        static EMPTY: number;

        static DELAYED_LINK: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    class PluginError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static MODULE: number;

        static DEPENDENCIES: number;

        static NAME_MISMATCH: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace ProgressType {
        export const $gtype: GObject.GType<ProgressType>;
    }

    enum ProgressType {
        START = 0,
        CONTINUE = 1,
        COMPLETE = 2,
        CANCELED = 3,
        ERROR = 4,
    }


    export namespace PromiseResult {
        export const $gtype: GObject.GType<PromiseResult>;
    }

    enum PromiseResult {
        PENDING = 0,
        INTERRUPTED = 1,
        REPLIED = 2,
        EXPIRED = 3,
    }


    export namespace QOSType {
        export const $gtype: GObject.GType<QOSType>;
    }

    enum QOSType {
        OVERFLOW = 0,
        UNDERFLOW = 1,
        THROTTLE = 2,
    }


    export namespace QueryType {
        export const $gtype: GObject.GType<QueryType>;
    }

    enum QueryType {
        UNKNOWN = 0,
        POSITION = 2563,
        DURATION = 5123,
        LATENCY = 7683,
        JITTER = 10243,
        RATE = 12803,
        SEEKING = 15363,
        SEGMENT = 17923,
        CONVERT = 20483,
        FORMATS = 23043,
        BUFFERING = 28163,
        CUSTOM = 30723,
        URI = 33283,
        ALLOCATION = 35846,
        SCHEDULING = 38401,
        ACCEPT_CAPS = 40963,
        CAPS = 43523,
        DRAIN = 46086,
        CONTEXT = 48643,
        BITRATE = 51202,
        SELECTABLE = 53763,
    }


    export namespace Rank {
        export const $gtype: GObject.GType<Rank>;
    }

    enum Rank {
        NONE = 0,
        MARGINAL = 64,
        SECONDARY = 128,
        PRIMARY = 256,
    }


    class ResourceError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static TOO_LAZY: number;

        static NOT_FOUND: number;

        static BUSY: number;

        static OPEN_READ: number;

        static OPEN_WRITE: number;

        static OPEN_READ_WRITE: number;

        static CLOSE: number;

        static READ: number;

        static WRITE: number;

        static SEEK: number;

        static SYNC: number;

        static SETTINGS: number;

        static NO_SPACE_LEFT: number;

        static NOT_AUTHORIZED: number;

        static NUM_ERRORS: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace SearchMode {
        export const $gtype: GObject.GType<SearchMode>;
    }

    enum SearchMode {
        EXACT = 0,
        BEFORE = 1,
        AFTER = 2,
    }


    export namespace SeekType {
        export const $gtype: GObject.GType<SeekType>;
    }

    enum SeekType {
        NONE = 0,
        SET = 1,
        END = 2,
    }


    export namespace State {
        export const $gtype: GObject.GType<State>;
    }

    enum State {
        VOID_PENDING = 0,
        NULL = 1,
        READY = 2,
        PAUSED = 3,
        PLAYING = 4,
    }


    export namespace StateChange {
        export const $gtype: GObject.GType<StateChange>;
    }

    enum StateChange {
        NULL_TO_READY = 10,
        READY_TO_PAUSED = 19,
        PAUSED_TO_PLAYING = 28,
        PLAYING_TO_PAUSED = 35,
        PAUSED_TO_READY = 26,
        READY_TO_NULL = 17,
        NULL_TO_NULL = 9,
        READY_TO_READY = 18,
        PAUSED_TO_PAUSED = 27,
        PLAYING_TO_PLAYING = 36,
    }


    export namespace StateChangeReturn {
        export const $gtype: GObject.GType<StateChangeReturn>;
    }

    enum StateChangeReturn {
        FAILURE = 0,
        SUCCESS = 1,
        ASYNC = 2,
        NO_PREROLL = 3,
    }


    class StreamError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static TOO_LAZY: number;

        static NOT_IMPLEMENTED: number;

        static TYPE_NOT_FOUND: number;

        static WRONG_TYPE: number;

        static CODEC_NOT_FOUND: number;

        static DECODE: number;

        static ENCODE: number;

        static DEMUX: number;

        static MUX: number;

        static FORMAT: number;

        static DECRYPT: number;

        static DECRYPT_NOKEY: number;

        static NUM_ERRORS: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace StreamStatusType {
        export const $gtype: GObject.GType<StreamStatusType>;
    }

    enum StreamStatusType {
        CREATE = 0,
        ENTER = 1,
        LEAVE = 2,
        DESTROY = 3,
        START = 8,
        PAUSE = 9,
        STOP = 10,
    }


    export namespace StructureChangeType {
        export const $gtype: GObject.GType<StructureChangeType>;
    }

    enum StructureChangeType {
        LINK = 0,
        UNLINK = 1,
    }


    export namespace TagFlag {
        export const $gtype: GObject.GType<TagFlag>;
    }

    enum TagFlag {
        UNDEFINED = 0,
        META = 1,
        ENCODED = 2,
        DECODED = 3,
        COUNT = 4,
    }


    export namespace TagMergeMode {
        export const $gtype: GObject.GType<TagMergeMode>;
    }

    enum TagMergeMode {
        UNDEFINED = 0,
        REPLACE_ALL = 1,
        REPLACE = 2,
        APPEND = 3,
        PREPEND = 4,
        KEEP = 5,
        KEEP_ALL = 6,
        COUNT = 7,
    }


    export namespace TagScope {
        export const $gtype: GObject.GType<TagScope>;
    }

    enum TagScope {
        STREAM = 0,
        GLOBAL = 1,
    }


    export namespace TaskState {
        export const $gtype: GObject.GType<TaskState>;
    }

    enum TaskState {
        STARTED = 0,
        STOPPED = 1,
        PAUSED = 2,
    }


    export namespace TocEntryType {
        export const $gtype: GObject.GType<TocEntryType>;
    }

    enum TocEntryType {
        ANGLE = -3,
        VERSION = -2,
        EDITION = -1,
        INVALID = 0,
        TITLE = 1,
        TRACK = 2,
        CHAPTER = 3,
    }


    export namespace TocLoopType {
        export const $gtype: GObject.GType<TocLoopType>;
    }

    enum TocLoopType {
        NONE = 0,
        FORWARD = 1,
        REVERSE = 2,
        PING_PONG = 3,
    }


    export namespace TocScope {
        export const $gtype: GObject.GType<TocScope>;
    }

    enum TocScope {
        GLOBAL = 1,
        CURRENT = 2,
    }


    export namespace TracerValueScope {
        export const $gtype: GObject.GType<TracerValueScope>;
    }

    enum TracerValueScope {
        PROCESS = 0,
        THREAD = 1,
        ELEMENT = 2,
        PAD = 3,
    }


    export namespace TypeFindProbability {
        export const $gtype: GObject.GType<TypeFindProbability>;
    }

    enum TypeFindProbability {
        NONE = 0,
        MINIMUM = 1,
        POSSIBLE = 50,
        LIKELY = 80,
        NEARLY_CERTAIN = 99,
        MAXIMUM = 100,
    }


    class URIError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static UNSUPPORTED_PROTOCOL: number;

        static BAD_URI: number;

        static BAD_STATE: number;

        static BAD_REFERENCE: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace URIType {
        export const $gtype: GObject.GType<URIType>;
    }

    enum URIType {
        UNKNOWN = 0,
        SINK = 1,
        SRC = 2,
    }


    const ALLOCATOR_SYSMEM: string;

    const BUFFER_COPY_ALL: BufferCopyFlags;

    const BUFFER_COPY_METADATA: BufferCopyFlags;

    const BUFFER_OFFSET_NONE: number;

    const CAN_INLINE: number;

    const CAPS_FEATURE_MEMORY_SYSTEM_MEMORY: string;

    const CLOCK_TIME_NONE: ClockTime;

    const DEBUG_BG_MASK: number;

    const DEBUG_FG_MASK: number;

    const DEBUG_FORMAT_MASK: number;

    const ELEMENT_FACTORY_KLASS_DECODER: string;

    const ELEMENT_FACTORY_KLASS_DECRYPTOR: string;

    const ELEMENT_FACTORY_KLASS_DEMUXER: string;

    const ELEMENT_FACTORY_KLASS_DEPAYLOADER: string;

    const ELEMENT_FACTORY_KLASS_ENCODER: string;

    const ELEMENT_FACTORY_KLASS_ENCRYPTOR: string;

    const ELEMENT_FACTORY_KLASS_FORMATTER: string;

    const ELEMENT_FACTORY_KLASS_HARDWARE: string;

    const ELEMENT_FACTORY_KLASS_MEDIA_AUDIO: string;

    const ELEMENT_FACTORY_KLASS_MEDIA_IMAGE: string;

    const ELEMENT_FACTORY_KLASS_MEDIA_METADATA: string;

    const ELEMENT_FACTORY_KLASS_MEDIA_SUBTITLE: string;

    const ELEMENT_FACTORY_KLASS_MEDIA_VIDEO: string;

    const ELEMENT_FACTORY_KLASS_MUXER: string;

    const ELEMENT_FACTORY_KLASS_PARSER: string;

    const ELEMENT_FACTORY_KLASS_PAYLOADER: string;

    const ELEMENT_FACTORY_KLASS_SINK: string;

    const ELEMENT_FACTORY_KLASS_SRC: string;

    const ELEMENT_FACTORY_TYPE_ANY: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_AUDIOVIDEO_SINKS: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_AUDIO_ENCODER: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_DECODABLE: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_DECODER: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_DECRYPTOR: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_DEMUXER: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_DEPAYLOADER: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_ENCODER: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_ENCRYPTOR: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_FORMATTER: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_HARDWARE: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_MAX_ELEMENTS: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_MEDIA_ANY: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_MEDIA_AUDIO: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_MEDIA_IMAGE: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_MEDIA_METADATA: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_MEDIA_SUBTITLE: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_MEDIA_VIDEO: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_MUXER: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_PARSER: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_PAYLOADER: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_SINK: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_SRC: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_TIMESTAMPER: ElementFactoryListType;

    const ELEMENT_FACTORY_TYPE_VIDEO_ENCODER: ElementFactoryListType;

    const ELEMENT_METADATA_AUTHOR: string;

    const ELEMENT_METADATA_DESCRIPTION: string;

    const ELEMENT_METADATA_DOC_URI: string;

    const ELEMENT_METADATA_ICON_NAME: string;

    const ELEMENT_METADATA_KLASS: string;

    const ELEMENT_METADATA_LONGNAME: string;

    const EVENT_NUM_SHIFT: number;

    const EVENT_TYPE_BOTH: EventTypeFlags;

    const FLAG_SET_MASK_EXACT: number;

    const FORMAT_PERCENT_MAX: number;

    const FORMAT_PERCENT_SCALE: number;

    const GROUP_ID_INVALID: number;

    const LICENSE_UNKNOWN: string;

    const LOCK_FLAG_READWRITE: LockFlags;

    const MAP_READWRITE: MapFlags;

    const META_TAG_MEMORY_REFERENCE_STR: string;

    const META_TAG_MEMORY_STR: string;

    const MSECOND: ClockTimeDiff;

    const NSECOND: ClockTimeDiff;

    const PARAM_CONDITIONALLY_AVAILABLE: number;

    const PARAM_CONTROLLABLE: number;

    const PARAM_DOC_SHOW_DEFAULT: number;

    const PARAM_MUTABLE_PAUSED: number;

    const PARAM_MUTABLE_PLAYING: number;

    const PARAM_MUTABLE_READY: number;

    const PARAM_USER_SHIFT: number;

    const PROTECTION_SYSTEM_ID_CAPS_FIELD: string;

    const PROTECTION_UNSPECIFIED_SYSTEM_ID: string;

    const QUERY_NUM_SHIFT: number;

    const QUERY_TYPE_BOTH: QueryTypeFlags;

    const SECOND: ClockTimeDiff;

    const SEGMENT_INSTANT_FLAGS: number;

    const SEQNUM_INVALID: number;

    const TAG_ALBUM: string;

    const TAG_ALBUM_ARTIST: string;

    const TAG_ALBUM_ARTIST_SORTNAME: string;

    const TAG_ALBUM_GAIN: string;

    const TAG_ALBUM_GAIN_R128: string;

    const TAG_ALBUM_PEAK: string;

    const TAG_ALBUM_SORTNAME: string;

    const TAG_ALBUM_VOLUME_COUNT: string;

    const TAG_ALBUM_VOLUME_NUMBER: string;

    const TAG_APPLICATION_DATA: string;

    const TAG_APPLICATION_NAME: string;

    const TAG_ARTIST: string;

    const TAG_ARTIST_SORTNAME: string;

    const TAG_ATTACHMENT: string;

    const TAG_AUDIO_CODEC: string;

    const TAG_BEATS_PER_MINUTE: string;

    const TAG_BITRATE: string;

    const TAG_CODEC: string;

    const TAG_COMMENT: string;

    const TAG_COMPOSER: string;

    const TAG_COMPOSER_SORTNAME: string;

    const TAG_CONDUCTOR: string;

    const TAG_CONTACT: string;

    const TAG_CONTAINER_FORMAT: string;

    const TAG_CONTAINER_SPECIFIC_TRACK_ID: string;

    const TAG_COPYRIGHT: string;

    const TAG_COPYRIGHT_URI: string;

    const TAG_DATE: string;

    const TAG_DATE_TIME: string;

    const TAG_DESCRIPTION: string;

    const TAG_DEVICE_MANUFACTURER: string;

    const TAG_DEVICE_MODEL: string;

    const TAG_DURATION: string;

    const TAG_ENCODED_BY: string;

    const TAG_ENCODER: string;

    const TAG_ENCODER_VERSION: string;

    const TAG_EXTENDED_COMMENT: string;

    const TAG_GENRE: string;

    const TAG_GEO_LOCATION_CAPTURE_DIRECTION: string;

    const TAG_GEO_LOCATION_CITY: string;

    const TAG_GEO_LOCATION_COUNTRY: string;

    const TAG_GEO_LOCATION_ELEVATION: string;

    const TAG_GEO_LOCATION_HORIZONTAL_ERROR: string;

    const TAG_GEO_LOCATION_LATITUDE: string;

    const TAG_GEO_LOCATION_LONGITUDE: string;

    const TAG_GEO_LOCATION_MOVEMENT_DIRECTION: string;

    const TAG_GEO_LOCATION_MOVEMENT_SPEED: string;

    const TAG_GEO_LOCATION_NAME: string;

    const TAG_GEO_LOCATION_SUBLOCATION: string;

    const TAG_GROUPING: string;

    const TAG_HOMEPAGE: string;

    const TAG_IMAGE: string;

    const TAG_IMAGE_ORIENTATION: string;

    const TAG_INTERPRETED_BY: string;

    const TAG_ISRC: string;

    const TAG_KEYWORDS: string;

    const TAG_LANGUAGE_CODE: string;

    const TAG_LANGUAGE_NAME: string;

    const TAG_LICENSE: string;

    const TAG_LICENSE_URI: string;

    const TAG_LOCATION: string;

    const TAG_LYRICS: string;

    const TAG_MAXIMUM_BITRATE: string;

    const TAG_MIDI_BASE_NOTE: string;

    const TAG_MINIMUM_BITRATE: string;

    const TAG_NOMINAL_BITRATE: string;

    const TAG_ORGANIZATION: string;

    const TAG_PERFORMER: string;

    const TAG_PREVIEW_IMAGE: string;

    const TAG_PRIVATE_DATA: string;

    const TAG_PUBLISHER: string;

    const TAG_REFERENCE_LEVEL: string;

    const TAG_SERIAL: string;

    const TAG_SHOW_EPISODE_NUMBER: string;

    const TAG_SHOW_NAME: string;

    const TAG_SHOW_SEASON_NUMBER: string;

    const TAG_SHOW_SORTNAME: string;

    const TAG_SUBTITLE_CODEC: string;

    const TAG_TITLE: string;

    const TAG_TITLE_SORTNAME: string;

    const TAG_TRACK_COUNT: string;

    const TAG_TRACK_GAIN: string;

    const TAG_TRACK_GAIN_R128: string;

    const TAG_TRACK_NUMBER: string;

    const TAG_TRACK_PEAK: string;

    const TAG_USER_RATING: string;

    const TAG_VERSION: string;

    const TAG_VIDEO_CODEC: string;

    const TASK_POOL_CONTEXT_TYPE: string;

    const TOC_REPEAT_COUNT_INFINITE: number;

    const URI_NO_PORT: number;

    const USECOND: ClockTimeDiff;

    const VALUE_EQUAL: number;

    const VALUE_GREATER_THAN: number;

    const VALUE_LESS_THAN: number;

    const VALUE_UNORDERED: number;

    const VERSION_MAJOR: number;

    const VERSION_MICRO: number;

    const VERSION_MINOR: number;

    const VERSION_NANO: number;

    function buffer_get_max_memory(): number;

    function buffer_list_replace(old_list: BufferList | null, new_list: BufferList | null): [boolean, BufferList | null];

    function buffer_list_take(old_list: BufferList, new_list: BufferList | null): [boolean, BufferList];

    function call_async(func: CallAsyncFunc): void;

    function caps_features_from_string(features: string): CapsFeatures | null;

    function caps_from_string(string: string): Caps | null;

    function check_version(major: number, minor: number, micro: number): boolean;

    function context_replace(old_context: Context, new_context: Context | null): [boolean, Context];

    function core_error_quark(): GLib.Quark;

    function cpuid_supports_arm_neon(): boolean;

    function cpuid_supports_arm_neon64(): boolean;

    function cpuid_supports_x86_3dnow(): boolean;

    function cpuid_supports_x86_avx(): boolean;

    function cpuid_supports_x86_avx2(): boolean;

    function cpuid_supports_x86_mmx(): boolean;

    function cpuid_supports_x86_mmxext(): boolean;

    function cpuid_supports_x86_sse2(): boolean;

    function cpuid_supports_x86_sse3(): boolean;

    function cpuid_supports_x86_sse4_1(): boolean;

    function cpuid_supports_x86_sse4_2(): boolean;

    function cpuid_supports_x86_ssse3(): boolean;

    function debug_add_log_function(func: LogFunction): void;

    function debug_add_ring_buffer_logger(max_size_per_thread: number, thread_timeout: number): void;

    function debug_bin_to_dot_data(bin: Bin, details: DebugGraphDetails): string;

    function debug_bin_to_dot_file(bin: Bin, details: DebugGraphDetails, file_name: string): void;

    function debug_bin_to_dot_file_with_ts(bin: Bin, details: DebugGraphDetails, file_name: string): void;

    function debug_construct_term_color(colorinfo: number): string;

    function debug_construct_win_color(colorinfo: number): number;

    function debug_get_all_categories(): DebugCategory[];

    function debug_get_color_mode(): DebugColorMode;

    function debug_get_default_threshold(): DebugLevel;

    function debug_get_stack_trace(flags: StackTraceFlags): string | null;

    function debug_is_active(): boolean;

    function debug_is_colored(): boolean;

    function debug_level_get_name(level: DebugLevel): string;

    function debug_log_default(category: DebugCategory, level: DebugLevel, file: string, _function: string, line: number, object: GObject.Object | null, message: DebugMessage, user_data: null): void;

    function debug_log_get_line(category: DebugCategory, level: DebugLevel, file: string, _function: string, line: number, object: GObject.Object | null, message: DebugMessage): string;

    function debug_log_id_literal(category: DebugCategory, level: DebugLevel, file: string, _function: string, line: number, id: string | null, message_string: string): void;

    function debug_log_id_literal_with_context(ctx: LogContext, level: DebugLevel, file: string, _function: string, line: number, id: string | null, message: string): void;

    function debug_log_literal(category: DebugCategory, level: DebugLevel, file: string, _function: string, line: number, object: GObject.Object | null, message_string: string): void;

    function debug_log_literal_with_context(ctx: LogContext, level: DebugLevel, file: string, _function: string, line: number, object: GObject.Object | null, message: string): void;

    function debug_print_object(ptr: null): string;

    function debug_print_segment(segment: Segment | null): string;

    function debug_print_stack_trace(): void;

    function debug_remove_log_function(func: LogFunction | null): number;

    function debug_remove_log_function_by_data(data: null): number;

    function debug_remove_ring_buffer_logger(): void;

    function debug_ring_buffer_logger_get_logs(): string[];

    function debug_set_active(active: boolean): void;

    function debug_set_color_mode(mode: DebugColorMode): void;

    function debug_set_color_mode_from_string(mode: string): void;

    function debug_set_colored(colored: boolean): void;

    function debug_set_default_threshold(level: DebugLevel): void;

    function debug_set_threshold_for_name(name: string, level: DebugLevel): void;

    function debug_set_threshold_from_string(list: string, reset: boolean): void;

    function debug_unset_threshold_for_name(name: string): void;

    function deinit(): void;

    function dynamic_type_register(plugin: Plugin, type: GObject.GType): boolean;

    function error_get_message(domain: GLib.Quark, code: number): string;

    function event_type_get_flags(type: EventType): EventTypeFlags;

    function event_type_get_name(type: EventType): string;

    function event_type_to_quark(type: EventType): GLib.Quark;

    function event_type_to_sticky_ordering(type: EventType): number;

    function filename_to_uri(filename: string): string | null;

    function flow_get_name(ret: FlowReturn): string;

    function flow_to_quark(ret: FlowReturn): GLib.Quark;

    function format_get_by_nick(nick: string): Format;

    function format_get_details(format: Format): FormatDefinition | null;

    function format_get_name(format: Format): string | null;

    function format_iterate_definitions(): Iterator;

    function format_register(nick: string, description: string): Format;

    function format_to_quark(format: Format): GLib.Quark;

    function formats_contains(formats: Format[], format: Format): boolean;

    function get_main_executable_path(): string | null;

    function init(argv?: string[]): string[];

    function init_check(argv?: string[]): [boolean, string[]];

    function is_caps_features(obj: null): boolean;

    function is_initialized(): boolean;

    function library_error_quark(): GLib.Quark;

    function message_take(old_message: Message, new_message: Message | null): [boolean, Message];

    function message_type_get_name(type: MessageType): string;

    function message_type_to_quark(type: MessageType): GLib.Quark;

    function meta_api_type_aggregate_params(api: GObject.GType, aggregated_params: Structure, params0: Structure, params1: Structure): boolean;

    function meta_api_type_get_tags(api: GObject.GType): string[];

    function meta_api_type_has_tag(api: GObject.GType, tag: GLib.Quark): boolean;

    function meta_api_type_register(api: string, tags: string[]): GObject.GType;

    function meta_api_type_set_params_aggregator(api: GObject.GType, aggregator: AllocationMetaParamsAggregator): void;

    function meta_api_type_tags_contain_only(api: GObject.GType, valid_tags: string[]): boolean;

    function meta_deserialize(buffer: Buffer, data: Uint8Array | string): [Meta | null, number];

    function meta_get_info(impl: string): MetaInfo | null;

    function meta_register_custom(name: string, tags: string[], transform_func: CustomMetaTransformFunction | null): MetaInfo;

    function meta_register_custom_simple(name: string): MetaInfo;

    function mini_object_replace(olddata: MiniObject | null, newdata: MiniObject | null): [boolean, MiniObject | null];

    function mini_object_take(olddata: MiniObject, newdata: MiniObject): [boolean, MiniObject];

    function pad_mode_get_name(mode: PadMode): string;

    function param_spec_array(name: string, nick: string, blurb: string, element_spec: GObject.ParamSpec, flags: GObject.ParamFlags): GObject.ParamSpec;

    function param_spec_fraction(name: string, nick: string, blurb: string, min_num: number, min_denom: number, max_num: number, max_denom: number, default_num: number, default_denom: number, flags: GObject.ParamFlags): GObject.ParamSpec | null;

    function parent_buffer_meta_api_get_type(): GObject.GType;

    function parent_buffer_meta_get_info(): MetaInfo;

    function parse_bin_from_description(bin_description: string, ghost_unlinked_pads: boolean): Bin;

    function parse_bin_from_description_full(bin_description: string, ghost_unlinked_pads: boolean, context: ParseContext | null, flags: ParseFlags): Element;

    function parse_error_quark(): GLib.Quark;

    function parse_launch(pipeline_description: string): Element;

    function parse_launch_full(pipeline_description: string, context: ParseContext | null, flags: ParseFlags): Element;

    function parse_launchv(argv: string[]): Element;

    function parse_launchv_full(argv: string[], context: ParseContext | null, flags: ParseFlags): Element;

    function plugin_error_quark(): GLib.Quark;

    function preset_get_app_dir(): string | null;

    function preset_set_app_dir(app_dir: string): boolean;

    function protection_filter_systems_by_available_decryptors(system_identifiers: string[]): string[] | null;

    function protection_meta_api_get_type(): GObject.GType;

    function protection_meta_get_info(): MetaInfo;

    function protection_select_system(system_identifiers: string[]): string | null;

    function query_take(old_query: Query | null, new_query: Query | null): [boolean, Query | null];

    function query_type_get_flags(type: QueryType): QueryTypeFlags;

    function query_type_get_name(type: QueryType): string;

    function query_type_to_quark(type: QueryType): GLib.Quark;

    function reference_timestamp_meta_api_get_type(): GObject.GType;

    function reference_timestamp_meta_get_info(): MetaInfo;

    function resource_error_quark(): GLib.Quark;

    function segtrap_is_enabled(): boolean;

    function segtrap_set_enabled(enabled: boolean): void;

    function state_change_get_name(transition: StateChange): string;

    function state_change_return_get_name(state_ret: StateChangeReturn): string;

    function state_get_name(state: State): string;

    function stream_error_quark(): GLib.Quark;

    function stream_type_get_name(stype: StreamType): string;

    function structure_take(oldstr_ptr: Structure | null, newstr: Structure | null): [boolean, Structure | null];

    function tag_exists(tag: string): boolean;

    function tag_get_description(tag: string): string;

    function tag_get_flag(tag: string): TagFlag;

    function tag_get_nick(tag: string): string;

    function tag_get_type(tag: string): GObject.GType;

    function tag_is_fixed(tag: string): boolean;

    function tag_list_copy_value(list: TagList, tag: string): [boolean, unknown];

    function tag_list_replace(old_taglist: TagList | null, new_taglist: TagList | null): [boolean, TagList | null];

    function tag_list_take(old_taglist: TagList, new_taglist: TagList | null): [boolean, TagList];

    function tag_merge_strings_with_comma(src: GObject.Value | any): unknown;

    function tag_merge_use_first(src: GObject.Value | any): unknown;

    function toc_entry_type_get_nick(type: TocEntryType): string;

    function tracing_get_active_tracers(): Tracer[];

    function tracing_register_hook(tracer: Tracer, detail: string, func: GObject.Callback): void;

    function type_find_register(plugin: Plugin | null, name: string, rank: number, func: TypeFindFunction, extensions: string | null, possible_caps: Caps | null): boolean;

    function type_is_plugin_api(type: GObject.GType): [boolean, PluginAPIFlags | null];

    function type_mark_as_plugin_api(type: GObject.GType, flags: PluginAPIFlags): void;

    function update_registry(): boolean;

    function uri_construct(protocol: string, location: string): string;

    function uri_error_quark(): GLib.Quark;

    function uri_from_string(uri: string): Uri | null;

    function uri_from_string_escaped(uri: string): Uri | null;

    function uri_get_location(uri: string): string | null;

    function uri_get_protocol(uri: string): string | null;

    function uri_has_protocol(uri: string, protocol: string): boolean;

    function uri_is_valid(uri: string): boolean;

    function uri_join_strings(base_uri: string, ref_uri: string): string | null;

    function uri_protocol_is_supported(type: URIType, protocol: string): boolean;

    function uri_protocol_is_valid(protocol: string): boolean;

    function util_array_binary_search(array: null, num_elements: number, element_size: bigint | number, search_func: GLib.CompareDataFunc, mode: SearchMode, search_data: null): null;

    function util_ceil_log2(v: number): number;

    function util_double_to_fraction(src: number): [number, number];

    function util_dump_buffer(buf: Buffer): void;

    function util_dump_mem(mem: Uint8Array | string): void;

    function util_filename_compare(a: string, b: string): number;

    function util_floor_log2(v: number): number;

    function util_fraction_add(a_n: number, a_d: number, b_n: number, b_d: number): [boolean, number, number];

    function util_fraction_compare(a_n: number, a_d: number, b_n: number, b_d: number): number;

    function util_fraction_multiply(a_n: number, a_d: number, b_n: number, b_d: number): [boolean, number, number];

    function util_fraction_multiply_int64(a_n: bigint | number, a_d: bigint | number, b_n: bigint | number, b_d: bigint | number): [boolean, number, number];

    function util_fraction_to_double(src_n: number, src_d: number): number;

    function util_gdouble_to_guint64(value: number): number;

    function util_get_object_array(object: GObject.Object, name: string): [boolean, GObject.ValueArray];

    function util_get_timestamp(): ClockTime;

    function util_greatest_common_divisor(a: number, b: number): number;

    function util_greatest_common_divisor_int64(a: bigint | number, b: bigint | number): number;

    function util_group_id_next(): number;

    function util_guint64_to_gdouble(value: bigint | number): number;

    function util_seqnum_compare(s1: number, s2: number): number;

    function util_seqnum_next(): number;

    function util_set_object_arg(object: GObject.Object, name: string, value: string): void;

    function util_set_object_array(object: GObject.Object, name: string, array: GObject.ValueArray): boolean;

    function util_set_value_from_string(value_str: string): unknown;

    function util_simplify_fraction(numerator: number, denominator: number, n_terms: number, threshold: number): [number, number];

    function util_uint64_scale(val: bigint | number, num: bigint | number, denom: bigint | number): number;

    function util_uint64_scale_ceil(val: bigint | number, num: bigint | number, denom: bigint | number): number;

    function util_uint64_scale_int(val: bigint | number, num: number, denom: number): number;

    function util_uint64_scale_int_ceil(val: bigint | number, num: number, denom: number): number;

    function util_uint64_scale_int_round(val: bigint | number, num: number, denom: number): number;

    function util_uint64_scale_round(val: bigint | number, num: bigint | number, denom: bigint | number): number;

    function value_can_compare(value1: GObject.Value | any, value2: GObject.Value | any): boolean;

    function value_can_intersect(value1: GObject.Value | any, value2: GObject.Value | any): boolean;

    function value_can_subtract(minuend: GObject.Value | any, subtrahend: GObject.Value | any): boolean;

    function value_can_union(value1: GObject.Value | any, value2: GObject.Value | any): boolean;

    function value_compare(value1: GObject.Value | any, value2: GObject.Value | any): number;

    function value_deserialize(src: string): [boolean, unknown];

    function value_deserialize_with_pspec(src: string, pspec: GObject.ParamSpec | null): [boolean, unknown];

    function value_fixate(dest: GObject.Value | any, src: GObject.Value | any): boolean;

    function value_fraction_multiply(product: GObject.Value | any, factor1: GObject.Value | any, factor2: GObject.Value | any): boolean;

    function value_fraction_subtract(dest: GObject.Value | any, minuend: GObject.Value | any, subtrahend: GObject.Value | any): boolean;

    function value_get_bitmask(value: GObject.Value | any): number;

    function value_get_caps(value: GObject.Value | any): Caps;

    function value_get_caps_features(value: GObject.Value | any): CapsFeatures;

    function value_get_double_range_max(value: GObject.Value | any): number;

    function value_get_double_range_min(value: GObject.Value | any): number;

    function value_get_flagset_flags(value: GObject.Value | any): number;

    function value_get_flagset_mask(value: GObject.Value | any): number;

    function value_get_fraction_denominator(value: GObject.Value | any): number;

    function value_get_fraction_numerator(value: GObject.Value | any): number;

    function value_get_fraction_range_max(value: GObject.Value | any): unknown | null;

    function value_get_fraction_range_min(value: GObject.Value | any): unknown | null;

    function value_get_int64_range_max(value: GObject.Value | any): number;

    function value_get_int64_range_min(value: GObject.Value | any): number;

    function value_get_int64_range_step(value: GObject.Value | any): number;

    function value_get_int_range_max(value: GObject.Value | any): number;

    function value_get_int_range_min(value: GObject.Value | any): number;

    function value_get_int_range_step(value: GObject.Value | any): number;

    function value_get_structure(value: GObject.Value | any): Structure;

    function value_hash(value: GObject.Value | any): [boolean, number];

    function value_init_and_copy(src: GObject.Value | any): unknown;

    function value_intersect(value1: GObject.Value | any, value2: GObject.Value | any): [boolean, unknown | null];

    function value_is_fixed(value: GObject.Value | any): boolean;

    function value_is_subset(value1: GObject.Value | any, value2: GObject.Value | any): boolean;

    function value_register(table: ValueTable): void;

    function value_serialize(value: GObject.Value | any): string | null;

    function value_set_bitmask(value: GObject.Value | any, bitmask: bigint | number): void;

    function value_set_caps(value: GObject.Value | any, caps: Caps): void;

    function value_set_caps_features(value: GObject.Value | any, features: CapsFeatures): void;

    function value_set_double_range(value: GObject.Value | any, start: number, end: number): void;

    function value_set_flagset(value: GObject.Value | any, flags: number, mask: number): void;

    function value_set_fraction(value: GObject.Value | any, numerator: number, denominator: number): void;

    function value_set_fraction_range(value: GObject.Value | any, start: GObject.Value | any, end: GObject.Value | any): void;

    function value_set_fraction_range_full(value: GObject.Value | any, numerator_start: number, denominator_start: number, numerator_end: number, denominator_end: number): void;

    function value_set_int64_range(value: GObject.Value | any, start: bigint | number, end: bigint | number): void;

    function value_set_int64_range_step(value: GObject.Value | any, start: bigint | number, end: bigint | number, step: bigint | number): void;

    function value_set_int_range(value: GObject.Value | any, start: number, end: number): void;

    function value_set_int_range_step(value: GObject.Value | any, start: number, end: number, step: number): void;

    function value_set_structure(value: GObject.Value | any, structure: Structure): void;

    function value_subtract(minuend: GObject.Value | any, subtrahend: GObject.Value | any): [boolean, unknown | null];

    function value_union(value1: GObject.Value | any, value2: GObject.Value | any): [boolean, unknown];

    function version(): [number, number, number, number];

    function version_string(): string;

    interface AllocationMetaParamsAggregator {
        (aggregated_params: Structure, params0: Structure, params1: Structure): boolean;
    }

    interface BufferForeachMetaFunc {
        (buffer: Buffer, meta: Meta | null): boolean;
    }

    interface BufferListFunc {
        (buffer: Buffer | null, idx: number): boolean;
    }

    interface BusFunc {
        (bus: Bus, message: Message): boolean;
    }

    interface BusSyncHandler {
        (bus: Bus, message: Message): BusSyncReply;
    }

    interface CallAsyncFunc {
        (user_data: null): void;
    }

    interface CapsFilterMapFunc {
        (features: CapsFeatures, structure: Structure): boolean;
    }

    interface CapsForeachFunc {
        (features: CapsFeatures, structure: Structure): boolean;
    }

    interface CapsMapFunc {
        (features: CapsFeatures, structure: Structure): boolean;
    }

    interface ClockCallback {
        (clock: Clock, time: ClockTime, id: ClockID): boolean;
    }

    interface ControlBindingConvert {
        (binding: ControlBinding, src_value: number, dest_value: unknown): void;
    }

    interface ControlSourceGetValue {
        (self: ControlSource, timestamp: ClockTime, value: number): boolean;
    }

    interface ControlSourceGetValueArray {
        (self: ControlSource, timestamp: ClockTime, interval: ClockTime, n_values: number, values: number): boolean;
    }

    interface CustomMetaTransformFunction {
        (transbuf: Buffer, meta: CustomMeta, buffer: Buffer, type: GLib.Quark, data: null): boolean;
    }

    interface DebugFuncPtr {
        (): void;
    }

    interface ElementCallAsyncFunc {
        (element: Element): void;
    }

    interface ElementForeachPadFunc {
        (element: Element, pad: Pad): boolean;
    }

    interface IteratorCopyFunction {
        (it: Iterator, copy: Iterator): void;
    }

    interface IteratorFoldFunction {
        (item: unknown, ret: unknown): boolean;
    }

    interface IteratorForeachFunction {
        (item: unknown): void;
    }

    interface IteratorFreeFunction {
        (it: Iterator): void;
    }

    interface IteratorItemFunction {
        (it: Iterator, item: unknown): IteratorItem;
    }

    interface IteratorNextFunction {
        (it: Iterator, result: unknown): IteratorResult;
    }

    interface IteratorResyncFunction {
        (it: Iterator): void;
    }

    interface LogFunction<A = GObject.Object> {
        (category: DebugCategory, level: DebugLevel, file: string, _function: string, line: number, object: A, message: DebugMessage): void;
    }

    interface MemoryCopyFunction {
        (mem: Memory, offset: number, size: number): Memory;
    }

    interface MemoryIsSpanFunction {
        (mem1: Memory, mem2: Memory, offset: number): boolean;
    }

    interface MemoryMapFullFunction {
        (mem: Memory, info: MapInfo, maxsize: number): null;
    }

    interface MemoryMapFunction {
        (mem: Memory, maxsize: number, flags: MapFlags): null;
    }

    interface MemoryShareFunction {
        (mem: Memory, offset: number, size: number): Memory;
    }

    interface MemoryUnmapFullFunction {
        (mem: Memory, info: MapInfo): void;
    }

    interface MemoryUnmapFunction {
        (mem: Memory): void;
    }

    interface MetaClearFunction {
        (buffer: Buffer, meta: Meta): void;
    }

    interface MetaDeserializeFunction {
        (info: MetaInfo, buffer: Buffer, data: number, size: number, version: number): Meta | null;
    }

    interface MetaFreeFunction {
        (meta: Meta, buffer: Buffer): void;
    }

    interface MetaInitFunction {
        (meta: Meta, params: null, buffer: Buffer): boolean;
    }

    interface MetaSerializeFunction {
        (meta: Meta, data: ByteArrayInterface): boolean;
    }

    interface MetaTransformFunction {
        (transbuf: Buffer, meta: Meta, buffer: Buffer, type: GLib.Quark, data: null): boolean;
    }

    interface MiniObjectCopyFunction {
        (obj: MiniObject): MiniObject;
    }

    interface MiniObjectDisposeFunction {
        (obj: MiniObject): boolean;
    }

    interface MiniObjectFreeFunction {
        (obj: MiniObject): void;
    }

    interface MiniObjectNotify {
        (user_data: null, obj: MiniObject): void;
    }

    interface ObjectCallAsyncFunc {
        (object: Object): void;
    }

    interface PadActivateFunction {
        (pad: Pad, parent: Object): boolean;
    }

    interface PadActivateModeFunction {
        (pad: Pad, parent: Object, mode: PadMode, active: boolean): boolean;
    }

    interface PadChainFunction {
        (pad: Pad, parent: Object | null, buffer: Buffer): FlowReturn;
    }

    interface PadChainListFunction {
        (pad: Pad, parent: Object | null, list: BufferList): FlowReturn;
    }

    interface PadEventFullFunction {
        (pad: Pad, parent: Object | null, event: Event): FlowReturn;
    }

    interface PadEventFunction {
        (pad: Pad, parent: Object | null, event: Event): boolean;
    }

    interface PadForwardFunction {
        (pad: Pad): boolean;
    }

    interface PadGetRangeFunction {
        (pad: Pad, parent: Object | null, offset: number, length: number, buffer: Buffer): FlowReturn;
    }

    interface PadIterIntLinkFunction {
        (pad: Pad, parent: Object | null): Iterator;
    }

    interface PadLinkFunction {
        (pad: Pad, parent: Object | null, peer: Pad): PadLinkReturn;
    }

    interface PadProbeCallback {
        (pad: Pad, info: PadProbeInfo): PadProbeReturn;
    }

    interface PadQueryFunction {
        (pad: Pad, parent: Object | null, query: Query): boolean;
    }

    interface PadStickyEventsForeachFunction {
        (pad: Pad, event: Event | null): boolean;
    }

    interface PadUnlinkFunction {
        (pad: Pad, parent: Object | null): void;
    }

    interface PluginFeatureFilter {
        (feature: PluginFeature): boolean;
    }

    interface PluginFilter {
        (plugin: Plugin): boolean;
    }

    interface PluginInitFullFunc {
        (plugin: Plugin): boolean;
    }

    interface PluginInitFunc {
        (plugin: Plugin): boolean;
    }

    interface PromiseChangeFunc {
        (promise: Promise): void;
    }

    interface StructureFilterMapFunc {
        (field_id: GLib.Quark, value: unknown): boolean;
    }

    interface StructureFilterMapIdStrFunc {
        (fieldname: IdStr, value: unknown): boolean;
    }

    interface StructureForeachFunc {
        (field_id: GLib.Quark, value: unknown): boolean;
    }

    interface StructureForeachIdStrFunc {
        (fieldname: IdStr, value: unknown): boolean;
    }

    interface StructureMapFunc {
        (field_id: GLib.Quark, value: unknown): boolean;
    }

    interface StructureMapIdStrFunc {
        (fieldname: IdStr, value: unknown): boolean;
    }

    interface TagForeachFunc {
        (list: TagList, tag: string): void;
    }

    interface TagMergeFunc {
        (dest: unknown, src: unknown): void;
    }

    interface TaskFunction {
        (user_data: null): void;
    }

    interface TaskPoolFunction {
        (user_data: null): void;
    }

    interface TaskThreadFunc {
        (task: Task, thread: GLib.Thread): void;
    }

    interface TypeFindFunction {
        (find: TypeFind): void;
    }

    interface ValueCompareFunc {
        (value1: unknown, value2: unknown): number;
    }

    interface ValueDeserializeFunc {
        (dest: unknown, s: string): boolean;
    }

    interface ValueDeserializeWithPSpecFunc {
        (dest: unknown, s: string, pspec: GObject.ParamSpec): boolean;
    }

    interface ValueHashFunc {
        (value: unknown): boolean;
    }

    interface ValueSerializeFunc {
        (value1: unknown): string;
    }

    export namespace AllocatorFlags {
        export const $gtype: GObject.GType<AllocatorFlags>;
    }

    enum AllocatorFlags {
        CUSTOM_ALLOC = 16,
        NO_COPY = 32,
        LAST = 1048576,
    }


    export namespace BinFlags {
        export const $gtype: GObject.GType<BinFlags>;
    }

    enum BinFlags {
        NO_RESYNC = 16384,
        STREAMS_AWARE = 32768,
        LAST = 524288,
    }


    export namespace BufferCopyFlags {
        export const $gtype: GObject.GType<BufferCopyFlags>;
    }

    enum BufferCopyFlags {
        NONE = 0,
        FLAGS = 1,
        TIMESTAMPS = 2,
        META = 4,
        MEMORY = 8,
        MERGE = 16,
        DEEP = 32,
    }


    export namespace BufferFlags {
        export const $gtype: GObject.GType<BufferFlags>;
    }

    enum BufferFlags {
        LIVE = 16,
        DECODE_ONLY = 32,
        DISCONT = 64,
        RESYNC = 128,
        CORRUPTED = 256,
        MARKER = 512,
        HEADER = 1024,
        GAP = 2048,
        DROPPABLE = 4096,
        DELTA_UNIT = 8192,
        TAG_MEMORY = 16384,
        SYNC_AFTER = 32768,
        NON_DROPPABLE = 65536,
        LAST = 1048576,
    }


    export namespace BufferPoolAcquireFlags {
        export const $gtype: GObject.GType<BufferPoolAcquireFlags>;
    }

    enum BufferPoolAcquireFlags {
        NONE = 0,
        KEY_UNIT = 1,
        DONTWAIT = 2,
        DISCONT = 4,
        LAST = 65536,
    }


    export namespace BusFlags {
        export const $gtype: GObject.GType<BusFlags>;
    }

    enum BusFlags {
        FLUSHING = 16,
        FLAG_LAST = 32,
    }


    export namespace CapsFlags {
        export const $gtype: GObject.GType<CapsFlags>;
    }

    enum CapsFlags {
        ANY = 16,
    }


    export namespace ClockFlags {
        export const $gtype: GObject.GType<ClockFlags>;
    }

    enum ClockFlags {
        CAN_DO_SINGLE_SYNC = 16,
        CAN_DO_SINGLE_ASYNC = 32,
        CAN_DO_PERIODIC_SYNC = 64,
        CAN_DO_PERIODIC_ASYNC = 128,
        CAN_SET_RESOLUTION = 256,
        CAN_SET_MASTER = 512,
        NEEDS_STARTUP_SYNC = 1024,
        LAST = 4096,
    }


    export namespace DebugColorFlags {
        export const $gtype: GObject.GType<DebugColorFlags>;
    }

    enum DebugColorFlags {
        FG_BLACK = 0,
        FG_RED = 1,
        FG_GREEN = 2,
        FG_YELLOW = 3,
        FG_BLUE = 4,
        FG_MAGENTA = 5,
        FG_CYAN = 6,
        FG_WHITE = 7,
        BG_BLACK = 0,
        BG_RED = 16,
        BG_GREEN = 32,
        BG_YELLOW = 48,
        BG_BLUE = 64,
        BG_MAGENTA = 80,
        BG_CYAN = 96,
        BG_WHITE = 112,
        BOLD = 256,
        UNDERLINE = 512,
    }


    export namespace DebugGraphDetails {
        export const $gtype: GObject.GType<DebugGraphDetails>;
    }

    enum DebugGraphDetails {
        MEDIA_TYPE = 1,
        CAPS_DETAILS = 2,
        NON_DEFAULT_PARAMS = 4,
        STATES = 8,
        FULL_PARAMS = 16,
        ALL = 15,
        VERBOSE = 4294967295,
    }


    export namespace ElementFlags {
        export const $gtype: GObject.GType<ElementFlags>;
    }

    enum ElementFlags {
        LOCKED_STATE = 16,
        SINK = 32,
        SOURCE = 64,
        PROVIDE_CLOCK = 128,
        REQUIRE_CLOCK = 256,
        INDEXABLE = 512,
        LAST = 16384,
    }


    export namespace EventTypeFlags {
        export const $gtype: GObject.GType<EventTypeFlags>;
    }

    enum EventTypeFlags {
        UPSTREAM = 1,
        DOWNSTREAM = 2,
        SERIALIZED = 4,
        STICKY = 8,
        STICKY_MULTI = 16,
    }


    export namespace GapFlags {
        export const $gtype: GObject.GType<GapFlags>;
    }

    enum GapFlags {
        DATA = 1,
    }


    export namespace LockFlags {
        export const $gtype: GObject.GType<LockFlags>;
    }

    enum LockFlags {
        READ = 1,
        WRITE = 2,
        EXCLUSIVE = 4,
        LAST = 256,
    }


    export namespace LogContextFlags {
        export const $gtype: GObject.GType<LogContextFlags>;
    }

    enum LogContextFlags {
        NONE = 0,
        THROTTLE = 1,
    }


    export namespace LogContextHashFlags {
        export const $gtype: GObject.GType<LogContextHashFlags>;
    }

    enum LogContextHashFlags {
        DEFAULT = 0,
        IGNORE_OBJECT = 1,
        IGNORE_FORMAT = 2,
        IGNORE_FILE = 4,
        USE_LINE_NUMBER = 8,
        USE_STRING_ARGS = 16,
    }


    export namespace MapFlags {
        export const $gtype: GObject.GType<MapFlags>;
    }

    enum MapFlags {
        READ = 1,
        WRITE = 2,
        REF_MEMORY = 256,
        FLAG_LAST = 65536,
    }


    export namespace MemoryFlags {
        export const $gtype: GObject.GType<MemoryFlags>;
    }

    enum MemoryFlags {
        READONLY = 2,
        NO_SHARE = 16,
        ZERO_PREFIXED = 32,
        ZERO_PADDED = 64,
        PHYSICALLY_CONTIGUOUS = 128,
        NOT_MAPPABLE = 256,
        LAST = 1048576,
    }


    export namespace MessageType {
        export const $gtype: GObject.GType<MessageType>;
    }

    enum MessageType {
        UNKNOWN = 0,
        EOS = 1,
        ERROR = 2,
        WARNING = 4,
        INFO = 8,
        TAG = 16,
        BUFFERING = 32,
        STATE_CHANGED = 64,
        STATE_DIRTY = 128,
        STEP_DONE = 256,
        CLOCK_PROVIDE = 512,
        CLOCK_LOST = 1024,
        NEW_CLOCK = 2048,
        STRUCTURE_CHANGE = 4096,
        STREAM_STATUS = 8192,
        APPLICATION = 16384,
        ELEMENT = 32768,
        SEGMENT_START = 65536,
        SEGMENT_DONE = 131072,
        DURATION_CHANGED = 262144,
        LATENCY = 524288,
        ASYNC_START = 1048576,
        ASYNC_DONE = 2097152,
        REQUEST_STATE = 4194304,
        STEP_START = 8388608,
        QOS = 16777216,
        PROGRESS = 33554432,
        TOC = 67108864,
        RESET_TIME = 134217728,
        STREAM_START = 268435456,
        NEED_CONTEXT = 536870912,
        HAVE_CONTEXT = 1073741824,
        EXTENDED = 2147483648,
        DEVICE_ADDED = 2147483649,
        DEVICE_REMOVED = 2147483650,
        PROPERTY_NOTIFY = 2147483651,
        STREAM_COLLECTION = 2147483652,
        STREAMS_SELECTED = 2147483653,
        REDIRECT = 2147483654,
        DEVICE_CHANGED = 2147483655,
        INSTANT_RATE_REQUEST = 2147483656,
        DEVICE_MONITOR_STARTED = 2147483657,
        ANY = 4294967295,
    }


    export namespace MetaFlags {
        export const $gtype: GObject.GType<MetaFlags>;
    }

    enum MetaFlags {
        NONE = 0,
        READONLY = 1,
        POOLED = 2,
        LOCKED = 4,
        LAST = 65536,
    }


    export namespace MiniObjectFlags {
        export const $gtype: GObject.GType<MiniObjectFlags>;
    }

    enum MiniObjectFlags {
        LOCKABLE = 1,
        LOCK_READONLY = 2,
        MAY_BE_LEAKED = 4,
        LAST = 16,
    }


    export namespace ObjectFlags {
        export const $gtype: GObject.GType<ObjectFlags>;
    }

    enum ObjectFlags {
        MAY_BE_LEAKED = 1,
        CONSTRUCTED = 2,
        LAST = 16,
    }


    export namespace PadFlags {
        export const $gtype: GObject.GType<PadFlags>;
    }

    enum PadFlags {
        BLOCKED = 16,
        FLUSHING = 32,
        EOS = 64,
        BLOCKING = 128,
        NEED_PARENT = 256,
        NEED_RECONFIGURE = 512,
        PENDING_EVENTS = 1024,
        FIXED_CAPS = 2048,
        PROXY_CAPS = 4096,
        PROXY_ALLOCATION = 8192,
        PROXY_SCHEDULING = 16384,
        ACCEPT_INTERSECT = 32768,
        ACCEPT_TEMPLATE = 65536,
        LAST = 1048576,
    }


    export namespace PadLinkCheck {
        export const $gtype: GObject.GType<PadLinkCheck>;
    }

    enum PadLinkCheck {
        NOTHING = 0,
        HIERARCHY = 1,
        TEMPLATE_CAPS = 2,
        CAPS = 4,
        NO_RECONFIGURE = 8,
        DEFAULT = 5,
    }


    export namespace PadProbeType {
        export const $gtype: GObject.GType<PadProbeType>;
    }

    enum PadProbeType {
        INVALID = 0,
        IDLE = 1,
        BLOCK = 2,
        BUFFER = 16,
        BUFFER_LIST = 32,
        EVENT_DOWNSTREAM = 64,
        EVENT_UPSTREAM = 128,
        EVENT_FLUSH = 256,
        QUERY_DOWNSTREAM = 512,
        QUERY_UPSTREAM = 1024,
        PUSH = 4096,
        PULL = 8192,
        BLOCKING = 3,
        DATA_DOWNSTREAM = 112,
        DATA_UPSTREAM = 128,
        DATA_BOTH = 240,
        BLOCK_DOWNSTREAM = 114,
        BLOCK_UPSTREAM = 130,
        EVENT_BOTH = 192,
        QUERY_BOTH = 1536,
        ALL_BOTH = 1776,
        SCHEDULING = 12288,
    }


    export namespace PadTemplateFlags {
        export const $gtype: GObject.GType<PadTemplateFlags>;
    }

    enum PadTemplateFlags {
        LAST = 256,
    }


    export namespace ParseFlags {
        export const $gtype: GObject.GType<ParseFlags>;
    }

    enum ParseFlags {
        NONE = 0,
        FATAL_ERRORS = 1,
        NO_SINGLE_ELEMENT_BINS = 2,
        PLACE_IN_BIN = 4,
    }


    export namespace PipelineFlags {
        export const $gtype: GObject.GType<PipelineFlags>;
    }

    enum PipelineFlags {
        FIXED_CLOCK = 524288,
        LAST = 8388608,
    }


    export namespace PluginAPIFlags {
        export const $gtype: GObject.GType<PluginAPIFlags>;
    }

    enum PluginAPIFlags {
        MEMBERS = 1,
    }


    export namespace PluginDependencyFlags {
        export const $gtype: GObject.GType<PluginDependencyFlags>;
    }

    enum PluginDependencyFlags {
        NONE = 0,
        RECURSE = 1,
        PATHS_ARE_DEFAULT_ONLY = 2,
        FILE_NAME_IS_SUFFIX = 4,
        FILE_NAME_IS_PREFIX = 8,
        PATHS_ARE_RELATIVE_TO_EXE = 16,
    }


    export namespace PluginFlags {
        export const $gtype: GObject.GType<PluginFlags>;
    }

    enum PluginFlags {
        CACHED = 16,
        BLACKLISTED = 32,
    }


    export namespace QueryTypeFlags {
        export const $gtype: GObject.GType<QueryTypeFlags>;
    }

    enum QueryTypeFlags {
        UPSTREAM = 1,
        DOWNSTREAM = 2,
        SERIALIZED = 4,
    }


    export namespace SchedulingFlags {
        export const $gtype: GObject.GType<SchedulingFlags>;
    }

    enum SchedulingFlags {
        SEEKABLE = 1,
        SEQUENTIAL = 2,
        BANDWIDTH_LIMITED = 4,
    }


    export namespace SeekFlags {
        export const $gtype: GObject.GType<SeekFlags>;
    }

    enum SeekFlags {
        NONE = 0,
        FLUSH = 1,
        ACCURATE = 2,
        KEY_UNIT = 4,
        SEGMENT = 8,
        TRICKMODE = 16,
        SKIP = 16,
        SNAP_BEFORE = 32,
        SNAP_AFTER = 64,
        SNAP_NEAREST = 96,
        TRICKMODE_KEY_UNITS = 128,
        TRICKMODE_NO_AUDIO = 256,
        TRICKMODE_FORWARD_PREDICTED = 512,
        INSTANT_RATE_CHANGE = 1024,
    }


    export namespace SegmentFlags {
        export const $gtype: GObject.GType<SegmentFlags>;
    }

    enum SegmentFlags {
        NONE = 0,
        RESET = 1,
        TRICKMODE = 16,
        SKIP = 16,
        SEGMENT = 8,
        TRICKMODE_KEY_UNITS = 128,
        TRICKMODE_FORWARD_PREDICTED = 512,
        TRICKMODE_NO_AUDIO = 256,
    }


    export namespace SerializeFlags {
        export const $gtype: GObject.GType<SerializeFlags>;
    }

    enum SerializeFlags {
        NONE = 0,
        BACKWARD_COMPAT = 1,
        STRICT = 2,
    }


    export namespace StackTraceFlags {
        export const $gtype: GObject.GType<StackTraceFlags>;
    }

    enum StackTraceFlags {
        NONE = 0,
        FULL = 1,
    }


    export namespace StreamFlags {
        export const $gtype: GObject.GType<StreamFlags>;
    }

    enum StreamFlags {
        NONE = 0,
        SPARSE = 1,
        SELECT = 2,
        UNSELECT = 4,
    }


    export namespace StreamType {
        export const $gtype: GObject.GType<StreamType>;
    }

    enum StreamType {
        UNKNOWN = 1,
        AUDIO = 2,
        VIDEO = 4,
        CONTAINER = 8,
        TEXT = 16,
        METADATA = 32,
    }


    export namespace TracerValueFlags {
        export const $gtype: GObject.GType<TracerValueFlags>;
    }

    enum TracerValueFlags {
        NONE = 0,
        OPTIONAL = 1,
        AGGREGATED = 2,
    }


    namespace Allocator {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    abstract class Allocator extends Object {
        static $gtype: GObject.GType<Allocator>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Allocator.SignalSignatures;

        // Fields
        object: Object;

        mem_type: string;

        mem_map: MemoryMapFunction;

        mem_unmap: MemoryUnmapFunction;

        mem_copy: MemoryCopyFunction;

        mem_share: MemoryShareFunction;

        mem_is_span: MemoryIsSpanFunction;

        mem_map_full: MemoryMapFullFunction;

        mem_unmap_full: MemoryUnmapFullFunction;

        // Constructors
        constructor(properties?: Partial<Allocator.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Allocator.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Allocator.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Allocator.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Allocator.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Allocator.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Allocator.SignalSignatures[K]>): void;

        // Static methods
        static find(name: string | null): Allocator | null;

        static register(name: string, allocator: Allocator): void;

        // Virtual methods
        vfunc_alloc(size: number, params: AllocationParams | null): Memory | null;

        vfunc_free(memory: Memory): void;

        // Methods
        alloc(size: bigint | number, params: AllocationParams | null): Memory | null;

        free(memory: Memory): void;

        set_default(): void;
    }


    namespace Bin {
        // Signal signatures
        interface SignalSignatures extends Element.SignalSignatures, ChildProxy.SignalSignatures {
            /** @signal */
            "deep-element-added": (sub_bin: Bin, element: Element) => void;
            /** @signal */
            "deep-element-removed": (sub_bin: Bin, element: Element) => void;
            /** @signal */
            "do-latency": () => boolean | void;
            /** @signal */
            "element-added": (element: Element) => void;
            /** @signal */
            "element-removed": (element: Element) => void;
            "notify::async-handling": (pspec: GObject.ParamSpec) => void;
            "notify::message-forward": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Element.ConstructorProps, ChildProxy.ConstructorProps {
            async_handling: boolean;
            asyncHandling: boolean;
            message_forward: boolean;
            messageForward: boolean;
        }
    }

    class Bin extends Element implements ChildProxy {
        static $gtype: GObject.GType<Bin>;

        // Properties
        get async_handling(): boolean;
        set async_handling(val: boolean);

        get asyncHandling(): boolean;
        set asyncHandling(val: boolean);

        get message_forward(): boolean;
        set message_forward(val: boolean);

        get messageForward(): boolean;
        set messageForward(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Bin.SignalSignatures;

        // Fields
        element: Element;

        numchildren: number;

        children: Element[];

        children_cookie: number;

        child_bus: Bus;

        messages: Message[];

        polling: boolean;

        state_dirty: boolean;

        clock_dirty: boolean;

        provided_clock: Clock;

        clock_provider: Element;

        // Constructors
        constructor(properties?: Partial<Bin.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](name: string | null): Bin;

        // Signals
        /** @signal */
        connect<K extends keyof Bin.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Bin.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Bin.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Bin.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Bin.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Bin.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_add_element(element: Element): boolean;

        vfunc_deep_element_added(sub_bin: Bin, child: Element): void;

        vfunc_deep_element_removed(sub_bin: Bin, child: Element): void;

        vfunc_do_latency(): boolean;

        vfunc_element_added(child: Element): void;

        vfunc_element_removed(child: Element): void;

        vfunc_handle_message(message: Message): void;

        vfunc_remove_element(element: Element): boolean;

        // Methods
        add(element: Element): boolean;

        find_unlinked_pad(direction: PadDirection): Pad | null;

        get_by_interface(iface: GObject.GType): Element | null;

        get_by_name(name: string): Element | null;

        get_by_name_recurse_up(name: string): Element | null;

        get_suppressed_flags(): ElementFlags;

        iterate_all_by_element_factory_name(factory_name: string): Iterator;

        iterate_all_by_interface(iface: GObject.GType): Iterator;

        iterate_elements(): Iterator;

        iterate_recurse(): Iterator;

        iterate_sinks(): Iterator;

        iterate_sorted(): Iterator;

        iterate_sources(): Iterator;

        recalculate_latency(): boolean;

        remove(element: Element): boolean;

        set_suppressed_flags(flags: ElementFlags): void;

        sync_children_states(): boolean;

        child_added(child: GObject.Object, name: string): void;

        child_removed(child: GObject.Object, name: string): void;

        get_child_by_index<T = GObject.Object>(index: number): T;

        get_child_by_name<T = GObject.Object>(name: string): T;

        get_child_by_name_recurse<T = GObject.Object>(name: string): T;

        get_children_count(): number;

        get_property(name: string): unknown;

        // Conflicted with GObject.Object.get_property
        get_property(...args: never[]): any;

        lookup(name: string): [boolean, GObject.Object | null, GObject.ParamSpec | null];

        set_property(name: string, value: GObject.Value | any): void;

        vfunc_child_added(child: GObject.Object, name: string): void;

        vfunc_child_removed(child: GObject.Object, name: string): void;

        vfunc_get_child_by_index<T = GObject.Object>(index: number): T;

        vfunc_get_child_by_name<T = GObject.Object>(name: string): T;

        vfunc_get_children_count(): number;

        ref(): GObject.Object;

        // Conflicted with Gst.Object.ref
        ref(...args: never[]): any;

        unref(): void;
    }


    namespace Bitmask {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    class Bitmask {
        static $gtype: GObject.GType<Bitmask>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Bitmask.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Bitmask.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Bitmask.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Bitmask.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Bitmask.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Bitmask.SignalSignatures[K]>): void;
    }


    namespace BufferPool {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    class BufferPool extends Object {
        static $gtype: GObject.GType<BufferPool>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: BufferPool.SignalSignatures;

        // Fields
        object: Object;

        flushing: number;

        // Constructors
        constructor(properties?: Partial<BufferPool.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): BufferPool;

        // Signals
        /** @signal */
        connect<K extends keyof BufferPool.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BufferPool.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BufferPool.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BufferPool.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BufferPool.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BufferPool.SignalSignatures[K]>): void;

        // Static methods
        static config_add_option(config: Structure, option: string): void;

        static config_get_allocator(config: Structure): [boolean, Allocator | null, AllocationParams | null];

        static config_get_option(config: Structure, index: number): string | null;

        static config_get_params(config: Structure): [boolean, Caps | null, number, number, number];

        static config_has_option(config: Structure, option: string): boolean;

        static config_n_options(config: Structure): number;

        static config_set_allocator(config: Structure, allocator: Allocator | null, params: AllocationParams | null): void;

        static config_set_params(config: Structure, caps: Caps | null, size: number, min_buffers: number, max_buffers: number): void;

        static config_validate_params(config: Structure, caps: Caps | null, size: number, min_buffers: number, max_buffers: number): boolean;

        // Virtual methods
        vfunc_acquire_buffer(params: BufferPoolAcquireParams | null): [FlowReturn, Buffer | null];

        vfunc_alloc_buffer(params: BufferPoolAcquireParams | null): [FlowReturn, Buffer | null];

        vfunc_flush_start(): void;

        vfunc_flush_stop(): void;

        vfunc_free_buffer(buffer: Buffer): void;

        vfunc_get_options(): string[];

        vfunc_release_buffer(buffer: Buffer): void;

        vfunc_reset_buffer(buffer: Buffer): void;

        vfunc_set_config(config: Structure): boolean;

        vfunc_start(): boolean;

        vfunc_stop(): boolean;

        // Methods
        acquire_buffer(params: BufferPoolAcquireParams | null): [FlowReturn, Buffer | null];

        get_config(): Structure;

        get_options(): string[];

        has_option(option: string): boolean;

        is_active(): boolean;

        release_buffer(buffer: Buffer): void;

        set_active(active: boolean): boolean;

        set_config(config: Structure): boolean;

        set_flushing(flushing: boolean): void;
    }


    namespace Bus {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            /** @signal */
            message: (message: Message) => void;
            /** @signal */
            "sync-message": (message: Message) => void;
            "notify::enable-async": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            /** @signal */
            "message::enable-async": (message: Message) => void;
            /** @signal */
            "message::name": (message: Message) => void;
            /** @signal */
            "message::parent": (message: Message) => void;
            [key: `message::${string}`]: (message: Message) => void;
            /** @signal */
            "sync-message::enable-async": (message: Message) => void;
            /** @signal */
            "sync-message::name": (message: Message) => void;
            /** @signal */
            "sync-message::parent": (message: Message) => void;
            [key: `sync-message::${string}`]: (message: Message) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            enable_async: boolean;
            enableAsync: boolean;
        }
    }

    class Bus extends Object {
        static $gtype: GObject.GType<Bus>;

        // Properties
        set enable_async(val: boolean);

        set enableAsync(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Bus.SignalSignatures;

        // Fields
        object: Object;

        // Constructors
        constructor(properties?: Partial<Bus.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Bus;

        // Signals
        /** @signal */
        connect<K extends keyof Bus.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Bus.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Bus.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Bus.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Bus.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Bus.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_message(message: Message): void;

        vfunc_sync_message(message: Message): void;

        // Methods
        add_signal_watch(): void;

        add_signal_watch_full(priority: number): void;

        add_watch(priority: number, func: BusFunc): number;

        async_signal_func(message: Message, data: null): boolean;

        create_watch(): GLib.Source | null;

        disable_sync_message_emission(): void;

        enable_sync_message_emission(): void;

        get_pollfd(): GLib.PollFD;

        have_pending(): boolean;

        peek(): Message | null;

        poll(events: MessageType, timeout: ClockTime): Message | null;

        pop(): Message | null;

        pop_filtered(types: MessageType): Message | null;

        post(message: Message): boolean;

        remove_signal_watch(): void;

        remove_watch(): boolean;

        set_flushing(flushing: boolean): void;

        set_sync_handler(func: BusSyncHandler | null): void;

        sync_signal_handler(message: Message, data: null): BusSyncReply;

        timed_pop(timeout: ClockTime): Message | null;

        timed_pop_filtered(timeout: ClockTime, types: MessageType): Message | null;
    }


    namespace Clock {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            /** @signal */
            synced: (synced: boolean) => void;
            "notify::timeout": (pspec: GObject.ParamSpec) => void;
            "notify::window-size": (pspec: GObject.ParamSpec) => void;
            "notify::window-threshold": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            timeout: bigint | number;
            window_size: number;
            windowSize: number;
            window_threshold: number;
            windowThreshold: number;
        }
    }

    abstract class Clock extends Object {
        static $gtype: GObject.GType<Clock>;

        // Properties
        get timeout(): number;
        set timeout(val: bigint | number);

        get window_size(): number;
        set window_size(val: number);

        get windowSize(): number;
        set windowSize(val: number);

        get window_threshold(): number;
        set window_threshold(val: number);

        get windowThreshold(): number;
        set windowThreshold(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Clock.SignalSignatures;

        // Fields
        object: Object;

        // Constructors
        constructor(properties?: Partial<Clock.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Clock.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Clock.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Clock.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Clock.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Clock.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Clock.SignalSignatures[K]>): void;

        // Static methods
        static id_compare_func(id1: null, id2: null): number;

        static id_get_clock(id: ClockID): Clock | null;

        static id_get_time(id: ClockID): ClockTime;

        static id_ref(id: ClockID): ClockID;

        static id_unref(id: ClockID): void;

        static id_unschedule(id: ClockID): void;

        static id_uses_clock(id: ClockID, clock: Clock): boolean;

        static id_wait(id: ClockID): [ClockReturn, ClockTimeDiff | null];

        static id_wait_async(id: ClockID, func: ClockCallback): ClockReturn;

        // Virtual methods
        vfunc_change_resolution(old_resolution: ClockTime, new_resolution: ClockTime): ClockTime;

        vfunc_get_internal_time(): ClockTime;

        vfunc_get_resolution(): ClockTime;

        vfunc_unschedule(entry: ClockEntry): void;

        vfunc_wait(entry: ClockEntry): [ClockReturn, ClockTimeDiff | null];

        vfunc_wait_async(entry: ClockEntry): ClockReturn;

        // Methods
        add_observation(observation_internal: ClockTime, observation_external: ClockTime): [boolean, number];

        add_observation_unapplied(observation_internal: ClockTime, observation_external: ClockTime): [boolean, number, ClockTime | null, ClockTime | null, ClockTime | null, ClockTime | null];

        adjust_unlocked(internal: ClockTime): ClockTime;

        adjust_with_calibration(internal_target: ClockTime, cinternal: ClockTime, cexternal: ClockTime, cnum: ClockTime, cdenom: ClockTime): ClockTime;

        get_calibration(): [ClockTime | null, ClockTime | null, ClockTime | null, ClockTime | null];

        get_internal_time(): ClockTime;

        get_master(): Clock | null;

        get_resolution(): ClockTime;

        get_time(): ClockTime;

        get_timeout(): ClockTime;

        is_synced(): boolean;

        is_system_monotonic(): boolean;

        new_periodic_id(start_time: ClockTime, interval: ClockTime): ClockID;

        new_single_shot_id(time: ClockTime): ClockID;

        periodic_id_reinit(id: ClockID, start_time: ClockTime, interval: ClockTime): boolean;

        set_calibration(internal: ClockTime, external: ClockTime, rate_num: ClockTime, rate_denom: ClockTime): void;

        set_master(master: Clock | null): boolean;

        set_resolution(resolution: ClockTime): ClockTime;

        set_synced(synced: boolean): void;

        set_timeout(timeout: ClockTime): void;

        single_shot_id_reinit(id: ClockID, time: ClockTime): boolean;

        unadjust_unlocked(external: ClockTime): ClockTime;

        unadjust_with_calibration(external_target: ClockTime, cinternal: ClockTime, cexternal: ClockTime, cnum: ClockTime, cdenom: ClockTime): ClockTime;

        wait_for_sync(timeout: ClockTime): boolean;
    }


    namespace ControlBinding {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::object": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            name: string | any;
            object: Object | any;
        }
    }

    abstract class ControlBinding extends Object {
        static $gtype: GObject.GType<ControlBinding>;

        // Properties
    // This accessor conflicts with another accessor's type in a parent class or interface.
        get name(): string | any;

    // This accessor conflicts with a property or field in a parent class or interface.
         object: Object | any;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ControlBinding.SignalSignatures;

        // Fields
        pspec: GObject.ParamSpec;

        // Constructors
        constructor(properties?: Partial<ControlBinding.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ControlBinding.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ControlBinding.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ControlBinding.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ControlBinding.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ControlBinding.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ControlBinding.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_g_value_array(timestamp: ClockTime, interval: ClockTime, values: unknown[]): boolean;

        vfunc_get_value(timestamp: ClockTime): GObject.Value | any | null;

        vfunc_sync_values(object: Object, timestamp: ClockTime, last_sync: ClockTime): boolean;

        // Methods
        get_g_value_array(timestamp: ClockTime, interval: ClockTime, values: (GObject.Value | any)[]): boolean;

    // Conflicted with Gst.Object.get_g_value_array
        get_g_value_array(...args: never[]): any;

        get_value(timestamp: ClockTime): unknown | null;

    // Conflicted with Gst.Object.get_value
        get_value(...args: never[]): any;

        is_disabled(): boolean;

        set_disabled(disabled: boolean): void;

        sync_values(object: Object, timestamp: ClockTime, last_sync: ClockTime): boolean;

    // Conflicted with Gst.Object.sync_values
        sync_values(...args: never[]): any;
    }


    namespace ControlSource {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    abstract class ControlSource extends Object {
        static $gtype: GObject.GType<ControlSource>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ControlSource.SignalSignatures;

        // Fields
        
    // This field conflicts with a function in a parent class or interface.
    get_value: ControlSourceGetValue | any;

        get_value_array: ControlSourceGetValueArray;

        // Constructors
        constructor(properties?: Partial<ControlSource.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ControlSource.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ControlSource.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ControlSource.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ControlSource.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ControlSource.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ControlSource.SignalSignatures[K]>): void;

        // Methods
        control_source_get_value(timestamp: ClockTime): [boolean, number];

        control_source_get_value_array(timestamp: ClockTime, interval: ClockTime, values: number[]): boolean;
    }


    namespace Device {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            /** @signal */
            removed: () => void;
            "notify::caps": (pspec: GObject.ParamSpec) => void;
            "notify::device-class": (pspec: GObject.ParamSpec) => void;
            "notify::display-name": (pspec: GObject.ParamSpec) => void;
            "notify::properties": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            caps: Caps | null;
            device_class: string;
            deviceClass: string;
            display_name: string;
            displayName: string;
            properties: Structure | null;
        }
    }

    abstract class Device extends Object {
        static $gtype: GObject.GType<Device>;

        // Properties
        get caps(): Caps | null;

        get device_class(): string;

        get deviceClass(): string;

        get display_name(): string;

        get displayName(): string;

        get properties(): Structure | null;

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

        // Virtual methods
        vfunc_create_element(name: string | null): Element | null;

        vfunc_reconfigure_element(element: Element): boolean;

        // Methods
        create_element(name: string | null): Element | null;

        get_caps(): Caps | null;

        get_device_class(): string;

        get_display_name(): string;

        get_properties(): Structure | null;

        has_classes(classes: string): boolean;

        has_classesv(classes: string[]): boolean;

        reconfigure_element(element: Element): boolean;
    }


    namespace DeviceMonitor {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::show-all": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            show_all: boolean;
            showAll: boolean;
        }
    }

    class DeviceMonitor extends Object {
        static $gtype: GObject.GType<DeviceMonitor>;

        // Properties
        get show_all(): boolean;
        set show_all(val: boolean);

        get showAll(): boolean;
        set showAll(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceMonitor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceMonitor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): DeviceMonitor;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceMonitor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceMonitor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceMonitor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceMonitor.SignalSignatures[K]>): void;

        // Methods
        add_filter(classes: string | null, caps: Caps | null): number;

        get_bus(): Bus;

        get_devices(): Device[] | null;

        get_providers(): string[];

        get_show_all_devices(): boolean;

        remove_filter(filter_id: number): boolean;

        set_show_all_devices(show_all: boolean): void;

        start(): boolean;

        stop(): void;
    }


    namespace DeviceProvider {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            /** @signal */
            "provider-hidden": (object: string) => void;
            /** @signal */
            "provider-unhidden": (object: string) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    abstract class DeviceProvider extends Object {
        static $gtype: GObject.GType<DeviceProvider>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceProvider.SignalSignatures;

        // Fields
        devices: null[];

        // Constructors
        constructor(properties?: Partial<DeviceProvider.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceProvider.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceProvider.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceProvider.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceProvider.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceProvider.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceProvider.SignalSignatures[K]>): void;

        // Static methods
        static register(plugin: Plugin | null, name: string, rank: number, type: GObject.GType): boolean;

        static add_metadata(key: string, value: string): void;

        static add_static_metadata(key: string, value: string): void;

        static get_metadata(key: string): string | null;

        static set_metadata(longname: string, classification: string, description: string, author: string): void;

        static set_static_metadata(longname: string, classification: string, description: string, author: string): void;

        // Virtual methods
        vfunc_start(): boolean;

        vfunc_stop(): void;

        // Methods
        can_monitor(): boolean;

        device_add(device: Device): void;

        device_changed(device: Device, changed_device: Device): void;

        device_remove(device: Device): void;

        get_bus(): Bus;

        get_devices(): Device[];

        get_factory(): DeviceProviderFactory | null;

        get_hidden_providers(): string[];

        get_metadata(key: string): string;

        hide_provider(name: string): void;

        is_started(): boolean;

        start(): boolean;

        stop(): void;

        unhide_provider(name: string): void;
    }


    namespace DeviceProviderFactory {
        // Signal signatures
        interface SignalSignatures extends PluginFeature.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends PluginFeature.ConstructorProps {}
    }

    class DeviceProviderFactory extends PluginFeature {
        static $gtype: GObject.GType<DeviceProviderFactory>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceProviderFactory.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceProviderFactory.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceProviderFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceProviderFactory.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceProviderFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceProviderFactory.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceProviderFactory.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceProviderFactory.SignalSignatures[K]>): void;

        // Static methods
        static find(name: string): DeviceProviderFactory | null;

        static get_by_name(factoryname: string): DeviceProvider | null;

        static list_get_device_providers(minrank: Rank): DeviceProviderFactory[];

        // Methods
        get(): DeviceProvider | null;

        get_device_provider_type(): GObject.GType;

        get_metadata(key: string): string | null;

        get_metadata_keys(): string[] | null;

        has_classes(classes: string | null): boolean;

        has_classesv(classes: string[] | null): boolean;
    }


    namespace DoubleRange {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    class DoubleRange {
        static $gtype: GObject.GType<DoubleRange>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DoubleRange.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DoubleRange.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DoubleRange.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DoubleRange.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DoubleRange.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DoubleRange.SignalSignatures[K]>): void;
    }


    namespace DynamicTypeFactory {
        // Signal signatures
        interface SignalSignatures extends PluginFeature.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends PluginFeature.ConstructorProps {}
    }

    class DynamicTypeFactory extends PluginFeature {
        static $gtype: GObject.GType<DynamicTypeFactory>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DynamicTypeFactory.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DynamicTypeFactory.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DynamicTypeFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DynamicTypeFactory.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DynamicTypeFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DynamicTypeFactory.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DynamicTypeFactory.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DynamicTypeFactory.SignalSignatures[K]>): void;

        // Static methods
        static load(factoryname: string): GObject.GType;
    }


    namespace Element {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            /** @signal */
            "no-more-pads": () => void;
            /** @signal */
            "pad-added": (new_pad: Pad) => void;
            /** @signal */
            "pad-removed": (old_pad: Pad) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    abstract class Element extends Object {
        static $gtype: GObject.GType<Element>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Element.SignalSignatures;

        // Fields
        object: Object;

        state_cookie: number;

        target_state: State;

        current_state: State;

        next_state: State;

        pending_state: State;

        last_return: StateChangeReturn;

        bus: Bus;

        clock: Clock;

        base_time: ClockTimeDiff;

        start_time: ClockTime;

        numpads: number;

        pads: Pad[];

        numsrcpads: number;

        srcpads: Pad[];

        numsinkpads: number;

        sinkpads: Pad[];

        pads_cookie: number;

        // Constructors
        constructor(properties?: Partial<Element.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Element.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Element.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Element.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Element.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Element.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Element.SignalSignatures[K]>): void;

        // Static methods
        static make_from_uri(type: URIType, uri: string, elementname: string | null): Element;

        static register(plugin: Plugin | null, name: string, rank: number, type: GObject.GType): boolean;

        static state_change_return_get_name(state_ret: StateChangeReturn): string;

        static state_get_name(state: State): string;

        static type_set_skip_documentation(type: GObject.GType): void;

        static add_metadata(key: string, value: string): void;

        static add_pad_template(templ: PadTemplate): void;

        static add_static_metadata(key: string, value: string): void;

        static add_static_pad_template(static_templ: StaticPadTemplate): void;

        static add_static_pad_template_with_gtype(static_templ: StaticPadTemplate, pad_type: GObject.GType): void;

        static get_metadata(key: string): string;

        static get_pad_template(name: string): PadTemplate | null;

        static get_pad_template_list(): PadTemplate[];

        static set_metadata(longname: string, classification: string, description: string, author: string): void;

        static set_static_metadata(longname: string, classification: string, description: string, author: string): void;

        // Virtual methods
        vfunc_change_state(transition: StateChange): StateChangeReturn;

        vfunc_get_state(timeout: ClockTime): [StateChangeReturn, State | null, State | null];

        vfunc_no_more_pads(): void;

        vfunc_pad_added(pad: Pad): void;

        vfunc_pad_removed(pad: Pad): void;

        vfunc_post_message(message: Message): boolean;

        vfunc_provide_clock(): Clock | null;

        vfunc_query(query: Query): boolean;

        vfunc_release_pad(pad: Pad): void;

        vfunc_request_new_pad(templ: PadTemplate, name: string | null, caps: Caps | null): Pad | null;

        vfunc_send_event(event: Event): boolean;

        vfunc_set_bus(bus: Bus | null): void;

        vfunc_set_clock(clock: Clock | null): boolean;

        vfunc_set_context(context: Context): void;

        vfunc_set_state(state: State): StateChangeReturn;

        vfunc_state_changed(oldstate: State, newstate: State, pending: State): void;

        // Methods
        abort_state(): void;

        add_pad(pad: Pad): boolean;

        add_property_deep_notify_watch(property_name: string | null, include_value: boolean): number;

        add_property_notify_watch(property_name: string | null, include_value: boolean): number;

        call_async(func: ElementCallAsyncFunc): void;

    // Conflicted with Gst.Object.call_async
        call_async(...args: never[]): any;

        change_state(transition: StateChange): StateChangeReturn;

        continue_state(ret: StateChangeReturn): StateChangeReturn;

        create_all_pads(): void;

        decorate_stream_id(stream_id: string): string;

        foreach_pad(func: ElementForeachPadFunc): boolean;

        foreach_sink_pad(func: ElementForeachPadFunc): boolean;

        foreach_src_pad(func: ElementForeachPadFunc): boolean;

        get_base_time(): ClockTime;

        get_bus(): Bus | null;

        get_clock(): Clock | null;

        get_compatible_pad(pad: Pad, caps: Caps | null): Pad | null;

        get_compatible_pad_template(compattempl: PadTemplate): PadTemplate | null;

        get_context(context_type: string): Context | null;

        get_context_unlocked(context_type: string): Context | null;

        get_contexts(): Context[];

        get_current_clock_time(): ClockTime;

        get_current_running_time(): ClockTime;

        get_factory(): ElementFactory | null;

        get_metadata(key: string): string;

        get_pad_template(name: string): PadTemplate | null;

        get_pad_template_list(): PadTemplate[];

        get_request_pad(name: string): Pad | null;

        get_start_time(): ClockTime;

        get_state(timeout: ClockTime): [StateChangeReturn, State | null, State | null];

        get_static_pad(name: string): Pad | null;

        is_locked_state(): boolean;

        iterate_pads(): Iterator;

        iterate_sink_pads(): Iterator;

        iterate_src_pads(): Iterator;

        link(dest: Element): boolean;

        link_filtered(dest: Element, filter: Caps | null): boolean;

        link_pads(srcpadname: string | null, dest: Element, destpadname: string | null): boolean;

        link_pads_filtered(srcpadname: string | null, dest: Element, destpadname: string | null, filter: Caps | null): boolean;

        link_pads_full(srcpadname: string | null, dest: Element, destpadname: string | null, flags: PadLinkCheck): boolean;

        lost_state(): void;

        message_full(type: MessageType, domain: GLib.Quark, code: number, text: string | null, debug: string | null, file: string, _function: string, line: number): void;

        message_full_with_details(type: MessageType, domain: GLib.Quark, code: number, text: string | null, debug: string | null, file: string, _function: string, line: number, structure: Structure): void;

        no_more_pads(): void;

        post_message(message: Message): boolean;

        provide_clock(): Clock | null;

        query(query: Query): boolean;

        query_convert(src_format: Format, src_val: bigint | number, dest_format: Format): [boolean, number];

        query_duration(format: Format): [boolean, number];

        query_position(format: Format): [boolean, number];

        release_request_pad(pad: Pad): void;

        remove_pad(pad: Pad): boolean;

        remove_property_notify_watch(watch_id: bigint | number): void;

        request_pad(templ: PadTemplate, name: string | null, caps: Caps | null): Pad | null;

        request_pad_simple(name: string): Pad | null;

        seek(rate: number, format: Format, flags: SeekFlags, start_type: SeekType, start: bigint | number, stop_type: SeekType, stop: bigint | number): boolean;

        seek_simple(format: Format, seek_flags: SeekFlags, seek_pos: bigint | number): boolean;

        send_event(event: Event): boolean;

        set_base_time(time: ClockTime): void;

        set_bus(bus: Bus | null): void;

        set_clock(clock: Clock | null): boolean;

        set_context(context: Context): void;

        set_locked_state(locked_state: boolean): boolean;

        set_start_time(time: ClockTime): void;

        set_state(state: State): StateChangeReturn;

        sync_state_with_parent(): boolean;

        unlink(dest: Element): void;

        unlink_pads(srcpadname: string, dest: Element, destpadname: string): void;
    }


    namespace ElementFactory {
        // Signal signatures
        interface SignalSignatures extends PluginFeature.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends PluginFeature.ConstructorProps {}
    }

    class ElementFactory extends PluginFeature {
        static $gtype: GObject.GType<ElementFactory>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ElementFactory.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ElementFactory.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ElementFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ElementFactory.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ElementFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ElementFactory.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ElementFactory.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ElementFactory.SignalSignatures[K]>): void;

        // Static methods
        static find(name: string): ElementFactory | null;

        static list_filter(list: ElementFactory[], caps: Caps, direction: PadDirection, subsetonly: boolean): ElementFactory[];

        static list_get_elements(type: ElementFactoryListType, minrank: Rank): ElementFactory[];

        static make(factoryname: string, name: string | null): Element | null;

        static make_with_properties(factoryname: string, names: string[] | null, values: (GObject.Value | any)[] | null): Element | null;

        // Methods
        can_sink_all_caps(caps: Caps): boolean;

        can_sink_any_caps(caps: Caps): boolean;

        can_src_all_caps(caps: Caps): boolean;

        can_src_any_caps(caps: Caps): boolean;

        create(name: string | null): Element | null;

        create_with_properties(names: string[] | null, values: (GObject.Value | any)[] | null): Element | null;

        get_element_type(): GObject.GType;

        get_metadata(key: string): string | null;

        get_metadata_keys(): string[] | null;

        get_num_pad_templates(): number;

        get_skip_documentation(): boolean;

        get_static_pad_templates(): StaticPadTemplate[];

        get_uri_protocols(): string[];

        get_uri_type(): URIType;

        has_interface(interfacename: string): boolean;

        list_is_type(type: ElementFactoryListType): boolean;
    }


    namespace FlagSet {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    class FlagSet {
        static $gtype: GObject.GType<FlagSet>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FlagSet.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FlagSet.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FlagSet.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FlagSet.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FlagSet.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FlagSet.SignalSignatures[K]>): void;

        // Static methods
        static register(flags_type: GObject.GType): GObject.GType;
    }


    namespace Fraction {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    class Fraction {
        static $gtype: GObject.GType<Fraction>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Fraction.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Fraction.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Fraction.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Fraction.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Fraction.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Fraction.SignalSignatures[K]>): void;
    }


    namespace FractionRange {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    class FractionRange {
        static $gtype: GObject.GType<FractionRange>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FractionRange.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FractionRange.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FractionRange.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FractionRange.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FractionRange.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FractionRange.SignalSignatures[K]>): void;
    }


    namespace GhostPad {
        // Signal signatures
        interface SignalSignatures extends ProxyPad.SignalSignatures {
            "notify::caps": (pspec: GObject.ParamSpec) => void;
            "notify::direction": (pspec: GObject.ParamSpec) => void;
            "notify::offset": (pspec: GObject.ParamSpec) => void;
            "notify::template": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends ProxyPad.ConstructorProps {}
    }

    class GhostPad extends ProxyPad {
        static $gtype: GObject.GType<GhostPad>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: GhostPad.SignalSignatures;

        // Fields
        pad: ProxyPad;

        // Constructors
        constructor(properties?: Partial<GhostPad.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](name: string | null, target: Pad): GhostPad;

        // Conflicted with Gst.Pad.new
        static ["new"](...args: never[]): any;

        static new_from_template(name: string | null, target: Pad, templ: PadTemplate): GhostPad;

        // Conflicted with Gst.Pad.new_from_template
        static new_from_template(...args: never[]): any;

        static new_no_target(name: string | null, dir: PadDirection): GhostPad;

        static new_no_target_from_template(name: string | null, templ: PadTemplate): GhostPad;

        // Signals
        /** @signal */
        connect<K extends keyof GhostPad.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GhostPad.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof GhostPad.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GhostPad.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof GhostPad.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<GhostPad.SignalSignatures[K]>): void;

        // Static methods
        static activate_mode_default(pad: Pad, parent: Object | null, mode: PadMode, active: boolean): boolean;

        static internal_activate_mode_default(pad: Pad, parent: Object | null, mode: PadMode, active: boolean): boolean;

        // Methods
        construct(): boolean;

        get_target(): Pad | null;

        set_target(newtarget: Pad | null): boolean;
    }


    namespace Int64Range {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    class Int64Range {
        static $gtype: GObject.GType<Int64Range>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Int64Range.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Int64Range.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Int64Range.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Int64Range.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Int64Range.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Int64Range.SignalSignatures[K]>): void;
    }


    namespace IntRange {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    class IntRange {
        static $gtype: GObject.GType<IntRange>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof IntRange.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IntRange.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof IntRange.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IntRange.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof IntRange.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<IntRange.SignalSignatures[K]>): void;
    }


    namespace MetaFactory {
        // Signal signatures
        interface SignalSignatures extends PluginFeature.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends PluginFeature.ConstructorProps {}
    }

    class MetaFactory extends PluginFeature {
        static $gtype: GObject.GType<MetaFactory>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MetaFactory.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MetaFactory.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof MetaFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MetaFactory.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MetaFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MetaFactory.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MetaFactory.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MetaFactory.SignalSignatures[K]>): void;

        // Static methods
        static load(factoryname: string): MetaInfo;

        static register(plugin: Plugin, meta_info: MetaInfo): boolean;
    }


    namespace Object {
        // Signal signatures
        interface SignalSignatures extends GObject.InitiallyUnowned.SignalSignatures {
            /** @signal */
            "deep-notify": (prop_object: Object, prop: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            /** @signal */
            "deep-notify::name": (prop_object: Object, prop: GObject.ParamSpec) => void;
            /** @signal */
            "deep-notify::parent": (prop_object: Object, prop: GObject.ParamSpec) => void;
            [key: `deep-notify::${string}`]: (prop_object: Object, prop: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.InitiallyUnowned.ConstructorProps {
            name: string | null;
            parent: Object | null;
        }
    }

    abstract class Object extends GObject.InitiallyUnowned {
        static $gtype: GObject.GType<Object>;

        // Properties
        get name(): string | null;
        set name(val: string | null);

        get parent(): Object | null;
        set parent(val: Object | null);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Object.SignalSignatures;

        // Fields
        object: GObject.InitiallyUnowned;

        flags: number;

        // Constructors
        constructor(properties?: Partial<Object.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Object.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Object.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Object.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Object.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Object.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Object.SignalSignatures[K]>): void;

        // Static methods
        static check_uniqueness(list: Object[], name: string): boolean;

        static default_deep_notify(object: GObject.Object, orig: Object, pspec: GObject.ParamSpec, excluded_props: string[] | null): void;

        static replace(oldobj: Object | null, newobj: Object | null): [boolean, Object | null];

        // Virtual methods
        vfunc_deep_notify(orig: Object, pspec: GObject.ParamSpec): void;

        // Methods
        add_control_binding(binding: ControlBinding): boolean;

        call_async(func: ObjectCallAsyncFunc): void;

        default_error(error: GLib.Error, debug: string | null): void;

        get_control_binding(property_name: string): ControlBinding | null;

        get_control_rate(): ClockTime;

        get_g_value_array(property_name: string, timestamp: ClockTime, interval: ClockTime, values: (GObject.Value | any)[]): boolean;

        get_name(): string | null;

        get_parent(): Object | null;

        get_path_string(): string;

        get_toplevel(): Object;

        get_value(property_name: string, timestamp: ClockTime): unknown | null;

        has_active_control_bindings(): boolean;

        has_ancestor(ancestor: Object): boolean;

        has_as_ancestor(ancestor: Object): boolean;

        has_as_parent(parent: Object): boolean;

        ref(): Object;

        remove_control_binding(binding: ControlBinding): boolean;

        set_control_binding_disabled(property_name: string, disabled: boolean): void;

        set_control_bindings_disabled(disabled: boolean): void;

        set_control_rate(control_rate: ClockTime): void;

        set_name(name: string | null): boolean;

        set_parent(parent: Object): boolean;

        suggest_next_sync(): ClockTime;

        sync_values(timestamp: ClockTime): boolean;

        unparent(): void;

        unref(): void;
    }


    namespace Pad {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            /** @signal */
            linked: (peer: Pad) => void;
            /** @signal */
            unlinked: (peer: Pad) => void;
            "notify::caps": (pspec: GObject.ParamSpec) => void;
            "notify::direction": (pspec: GObject.ParamSpec) => void;
            "notify::offset": (pspec: GObject.ParamSpec) => void;
            "notify::template": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            caps: Caps;
            direction: PadDirection;
            offset: bigint | number;
            template: PadTemplate;
        }
    }

    class Pad extends Object {
        static $gtype: GObject.GType<Pad>;

        // Properties
        get caps(): Caps;

        get direction(): PadDirection;

        get offset(): number;
        set offset(val: bigint | number);

        get template(): PadTemplate;
        set template(val: PadTemplate);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Pad.SignalSignatures;

        // Fields
        object: Object;

        element_private: null;

        padtemplate: PadTemplate;

        // Constructors
        constructor(properties?: Partial<Pad.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](name: string | null, direction: PadDirection): Pad;

        static new_from_static_template(templ: StaticPadTemplate, name: string): Pad;

        static new_from_template(templ: PadTemplate, name: string | null): Pad;

        // Signals
        /** @signal */
        connect<K extends keyof Pad.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Pad.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Pad.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Pad.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Pad.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Pad.SignalSignatures[K]>): void;

        // Static methods
        static link_get_name(ret: PadLinkReturn): string;

        // Virtual methods
        vfunc_linked(peer: Pad): void;

        vfunc_unlinked(peer: Pad): void;

        // Methods
        activate_mode(mode: PadMode, active: boolean): boolean;

        add_probe(mask: PadProbeType, callback: PadProbeCallback): number;

        can_link(sinkpad: Pad): boolean;

        chain(buffer: Buffer): FlowReturn;

        chain_list(list: BufferList): FlowReturn;

        check_reconfigure(): boolean;

        create_stream_id(parent: Element, stream_id: string | null): string;

        event_default(parent: Object | null, event: Event): boolean;

        forward(forward: PadForwardFunction): boolean;

        get_allowed_caps(): Caps | null;

        get_current_caps(): Caps | null;

        get_direction(): PadDirection;

        get_element_private(): null;

        get_last_flow_return(): FlowReturn;

        get_offset(): number;

        get_pad_template(): PadTemplate | null;

        get_pad_template_caps(): Caps;

        get_parent_element(): Element | null;

        get_peer(): Pad | null;

        get_range(offset: bigint | number, size: number): [FlowReturn, Buffer];

        get_single_internal_link(): Pad | null;

        get_sticky_event(event_type: EventType, idx: number): Event | null;

        get_stream(): Stream | null;

        get_stream_id(): string | null;

        get_task_state(): TaskState;

        has_current_caps(): boolean;

        is_active(): boolean;

        is_blocked(): boolean;

        is_blocking(): boolean;

        is_linked(): boolean;

        iterate_internal_links(): Iterator | null;

        iterate_internal_links_default(parent: Object | null): Iterator | null;

        link(sinkpad: Pad): PadLinkReturn;

        link_full(sinkpad: Pad, flags: PadLinkCheck): PadLinkReturn;

        link_maybe_ghosting(sink: Pad): boolean;

        link_maybe_ghosting_full(sink: Pad, flags: PadLinkCheck): boolean;

        mark_reconfigure(): void;

        needs_reconfigure(): boolean;

        pause_task(): boolean;

        peer_query(query: Query): boolean;

        peer_query_accept_caps(caps: Caps): boolean;

        peer_query_caps(filter: Caps | null): Caps;

        peer_query_convert(src_format: Format, src_val: bigint | number, dest_format: Format): [boolean, number];

        peer_query_duration(format: Format): [boolean, number];

        peer_query_position(format: Format): [boolean, number];

        proxy_query_accept_caps(query: Query): boolean;

        proxy_query_caps(query: Query): boolean;

        pull_range(offset: bigint | number, size: number): [FlowReturn, Buffer];

        push(buffer: Buffer): FlowReturn;

        push_event(event: Event): boolean;

        push_list(list: BufferList): FlowReturn;

        query(query: Query): boolean;

        query_accept_caps(caps: Caps): boolean;

        query_caps(filter: Caps | null): Caps;

        query_convert(src_format: Format, src_val: bigint | number, dest_format: Format): [boolean, number];

        query_default(parent: Object | null, query: Query): boolean;

        query_duration(format: Format): [boolean, number];

        query_position(format: Format): [boolean, number];

        remove_probe(id: bigint | number): void;

        send_event(event: Event): boolean;

        set_activate_function_full(activate: PadActivateFunction): void;

        set_activatemode_function_full(activatemode: PadActivateModeFunction): void;

        set_active(active: boolean): boolean;

        set_chain_function_full(chain: PadChainFunction): void;

        set_chain_list_function_full(chainlist: PadChainListFunction): void;

        set_element_private(priv: null): void;

        set_event_full_function_full(event: PadEventFullFunction): void;

        set_event_function_full(event: PadEventFunction): void;

        set_getrange_function_full(get: PadGetRangeFunction): void;

        set_iterate_internal_links_function_full(iterintlink: PadIterIntLinkFunction): void;

        set_link_function_full(link: PadLinkFunction): void;

        set_offset(offset: bigint | number): void;

        set_query_function_full(query: PadQueryFunction): void;

        set_unlink_function_full(unlink: PadUnlinkFunction): void;

        start_task(func: TaskFunction): boolean;

        sticky_events_foreach(foreach_func: PadStickyEventsForeachFunction): void;

        stop_task(): boolean;

        store_sticky_event(event: Event): FlowReturn;

        unlink(sinkpad: Pad): boolean;

        use_fixed_caps(): void;
    }


    namespace PadTemplate {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            /** @signal */
            "pad-created": (pad: Pad) => void;
            "notify::caps": (pspec: GObject.ParamSpec) => void;
            "notify::direction": (pspec: GObject.ParamSpec) => void;
            "notify::gtype": (pspec: GObject.ParamSpec) => void;
            "notify::name-template": (pspec: GObject.ParamSpec) => void;
            "notify::presence": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            caps: Caps;
            direction: PadDirection;
            gtype: GObject.GTypeInput;
            name_template: string;
            nameTemplate: string;
            presence: PadPresence;
        }
    }

    class PadTemplate extends Object {
        static $gtype: GObject.GType<PadTemplate>;

        // Properties
        get caps(): Caps;

        get direction(): PadDirection;

        get gtype(): GObject.GType;

        get name_template(): string;

        get nameTemplate(): string;

        get presence(): PadPresence;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: PadTemplate.SignalSignatures;

        // Fields
        object: Object;

        // Constructors
        constructor(properties?: Partial<PadTemplate.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](name_template: string, direction: PadDirection, presence: PadPresence, caps: Caps): PadTemplate;

        static new_from_static_pad_template_with_gtype(pad_template: StaticPadTemplate, pad_type: GObject.GType): PadTemplate;

        static new_with_gtype(name_template: string, direction: PadDirection, presence: PadPresence, caps: Caps, pad_type: GObject.GType): PadTemplate;

        // Signals
        /** @signal */
        connect<K extends keyof PadTemplate.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PadTemplate.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PadTemplate.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PadTemplate.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PadTemplate.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PadTemplate.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_pad_created(pad: Pad): void;

        // Methods
        get_caps(): Caps;

        get_documentation_caps(): Caps;

        pad_created(pad: Pad): void;

        set_documentation_caps(caps: Caps): void;
    }


    namespace Pipeline {
        // Signal signatures
        interface SignalSignatures extends Bin.SignalSignatures, ChildProxy.SignalSignatures {
            "notify::auto-flush-bus": (pspec: GObject.ParamSpec) => void;
            "notify::delay": (pspec: GObject.ParamSpec) => void;
            "notify::latency": (pspec: GObject.ParamSpec) => void;
            "notify::async-handling": (pspec: GObject.ParamSpec) => void;
            "notify::message-forward": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Bin.ConstructorProps, ChildProxy.ConstructorProps {
            auto_flush_bus: boolean;
            autoFlushBus: boolean;
            delay: bigint | number;
            latency: bigint | number;
        }
    }

    class Pipeline extends Bin implements ChildProxy {
        static $gtype: GObject.GType<Pipeline>;

        // Properties
        get auto_flush_bus(): boolean;
        set auto_flush_bus(val: boolean);

        get autoFlushBus(): boolean;
        set autoFlushBus(val: boolean);

        get delay(): number;
        set delay(val: bigint | number);

        get latency(): number;
        set latency(val: bigint | number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Pipeline.SignalSignatures;

        // Fields
        bin: Bin;

        fixed_clock: Clock;

        stream_time: ClockTime;

        // Constructors
        constructor(properties?: Partial<Pipeline.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](name: string | null): Pipeline;

        // Signals
        /** @signal */
        connect<K extends keyof Pipeline.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Pipeline.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Pipeline.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Pipeline.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Pipeline.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Pipeline.SignalSignatures[K]>): void;

        // Methods
        auto_clock(): void;

        get_auto_flush_bus(): boolean;

        get_bus(): Bus;

    // Conflicted with Gst.Element.get_bus
        get_bus(...args: never[]): any;

        get_configured_latency(): ClockTime;

        get_delay(): ClockTime;

        get_latency(): ClockTime;

        get_pipeline_clock(): Clock;

        is_live(): boolean;

        set_auto_flush_bus(auto_flush: boolean): void;

        set_delay(delay: ClockTime): void;

        set_latency(latency: ClockTime): void;

        use_clock(clock: Clock | null): void;

        child_added(child: GObject.Object, name: string): void;

        child_removed(child: GObject.Object, name: string): void;

        get_child_by_index<T = GObject.Object>(index: number): T;

        get_child_by_name<T = GObject.Object>(name: string): T;

        get_child_by_name_recurse<T = GObject.Object>(name: string): T;

        get_children_count(): number;

        get_property(name: string): unknown;

        // Conflicted with GObject.Object.get_property
        get_property(...args: never[]): any;

        lookup(name: string): [boolean, GObject.Object | null, GObject.ParamSpec | null];

        set_property(name: string, value: GObject.Value | any): void;

        vfunc_child_added(child: GObject.Object, name: string): void;

        vfunc_child_removed(child: GObject.Object, name: string): void;

        vfunc_get_child_by_index<T = GObject.Object>(index: number): T;

        vfunc_get_child_by_name<T = GObject.Object>(name: string): T;

        vfunc_get_children_count(): number;

        ref(): GObject.Object;

        // Conflicted with Gst.Object.ref
        ref(...args: never[]): any;

        unref(): void;
    }


    namespace Plugin {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    class Plugin extends Object {
        static $gtype: GObject.GType<Plugin>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Plugin.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Plugin.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Plugin.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Plugin.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Plugin.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Plugin.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Plugin.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Plugin.SignalSignatures[K]>): void;

        // Static methods
        static list_free(list: Plugin[]): void;

        static load_by_name(name: string): Plugin | null;

        static load_file(filename: string): Plugin;

        static register_static(major_version: number, minor_version: number, name: string, description: string, init_func: PluginInitFunc, version: string, license: string, source: string, _package: string, origin: string): boolean;

        static register_static_full(major_version: number, minor_version: number, name: string, description: string, init_full_func: PluginInitFullFunc, version: string, license: string, source: string, _package: string, origin: string): boolean;

        // Methods
        add_dependency(env_vars: string[] | null, paths: string[] | null, names: string[] | null, flags: PluginDependencyFlags): void;

        add_dependency_simple(env_vars: string | null, paths: string | null, names: string | null, flags: PluginDependencyFlags): void;

        add_status_error(message: string): void;

        add_status_info(message: string): void;

        add_status_warning(message: string): void;

        get_cache_data(): Structure | null;

        get_description(): string;

        get_filename(): string | null;

        get_license(): string;

        get_name(): string;

    // Conflicted with Gst.Object.get_name
        get_name(...args: never[]): any;

        get_origin(): string;

        get_package(): string;

        get_release_date_string(): string | null;

        get_source(): string;

        get_status_errors(): string[] | null;

        get_status_infos(): string[] | null;

        get_status_warnings(): string[] | null;

        get_version(): string;

        is_loaded(): boolean;

        load(): Plugin | null;

        set_cache_data(cache_data: Structure): void;
    }


    namespace PluginFeature {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    abstract class PluginFeature extends Object {
        static $gtype: GObject.GType<PluginFeature>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: PluginFeature.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<PluginFeature.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof PluginFeature.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PluginFeature.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PluginFeature.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PluginFeature.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PluginFeature.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PluginFeature.SignalSignatures[K]>): void;

        // Static methods
        static list_copy(list: PluginFeature[]): PluginFeature[];

        static list_debug(list: PluginFeature[]): void;

        static list_free(list: PluginFeature[]): void;

        static rank_compare_func(p1: null, p2: null): number;

        // Methods
        check_version(min_major: number, min_minor: number, min_micro: number): boolean;

        get_plugin(): Plugin | null;

        get_plugin_name(): string | null;

        get_rank(): number;

        load(): PluginFeature | null;

        set_rank(rank: number): void;
    }


    namespace ProxyPad {
        // Signal signatures
        interface SignalSignatures extends Pad.SignalSignatures {
            "notify::caps": (pspec: GObject.ParamSpec) => void;
            "notify::direction": (pspec: GObject.ParamSpec) => void;
            "notify::offset": (pspec: GObject.ParamSpec) => void;
            "notify::template": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Pad.ConstructorProps {}
    }

    class ProxyPad extends Pad {
        static $gtype: GObject.GType<ProxyPad>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ProxyPad.SignalSignatures;

        // Fields
        pad: Pad;

        // Constructors
        constructor(properties?: Partial<ProxyPad.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ProxyPad.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ProxyPad.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ProxyPad.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ProxyPad.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ProxyPad.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ProxyPad.SignalSignatures[K]>): void;

        // Static methods
        static chain_default(pad: Pad, parent: Object | null, buffer: Buffer): FlowReturn;

        static chain_list_default(pad: Pad, parent: Object | null, list: BufferList): FlowReturn;

        static getrange_default(pad: Pad, parent: Object, offset: bigint | number, size: number): [FlowReturn, Buffer];

        static iterate_internal_links_default(pad: Pad, parent: Object | null): Iterator | null;

        // Methods
        get_internal(): ProxyPad | null;
    }


    namespace Registry {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            /** @signal */
            "feature-added": (feature: PluginFeature) => void;
            /** @signal */
            "plugin-added": (plugin: Plugin) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    class Registry extends Object {
        static $gtype: GObject.GType<Registry>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Registry.SignalSignatures;

        // Fields
        object: Object;

        // Constructors
        constructor(properties?: Partial<Registry.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Registry.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Registry.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Registry.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Registry.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Registry.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Registry.SignalSignatures[K]>): void;

        // Static methods
        static fork_is_enabled(): boolean;

        static fork_set_enabled(enabled: boolean): void;

        static get(): Registry;

        // Methods
        add_feature(feature: PluginFeature): boolean;

        add_plugin(plugin: Plugin): boolean;

        check_feature_version(feature_name: string, min_major: number, min_minor: number, min_micro: number): boolean;

        feature_filter(filter: PluginFeatureFilter, first: boolean): PluginFeature[];

        find_feature(name: string, type: GObject.GType): PluginFeature | null;

        find_plugin(name: string): Plugin | null;

        get_feature_list(type: GObject.GType): PluginFeature[];

        get_feature_list_by_plugin(name: string): PluginFeature[];

        get_feature_list_cookie(): number;

        get_plugin_list(): Plugin[];

        lookup(filename: string): Plugin | null;

        lookup_feature(name: string): PluginFeature | null;

        plugin_filter(filter: PluginFilter, first: boolean): Plugin[];

        remove_feature(feature: PluginFeature): void;

        remove_plugin(plugin: Plugin): void;

        scan_path(path: string): boolean;
    }


    namespace SharedTaskPool {
        // Signal signatures
        interface SignalSignatures extends TaskPool.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends TaskPool.ConstructorProps {}
    }

    class SharedTaskPool extends TaskPool {
        static $gtype: GObject.GType<SharedTaskPool>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SharedTaskPool.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SharedTaskPool.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): SharedTaskPool;

        // Signals
        /** @signal */
        connect<K extends keyof SharedTaskPool.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SharedTaskPool.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SharedTaskPool.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SharedTaskPool.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SharedTaskPool.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SharedTaskPool.SignalSignatures[K]>): void;

        // Methods
        get_max_threads(): number;

        set_max_threads(max_threads: number): void;
    }


    namespace Stream {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::caps": (pspec: GObject.ParamSpec) => void;
            "notify::stream-flags": (pspec: GObject.ParamSpec) => void;
            "notify::stream-id": (pspec: GObject.ParamSpec) => void;
            "notify::stream-type": (pspec: GObject.ParamSpec) => void;
            "notify::tags": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            caps: Caps | null;
            stream_flags: StreamFlags;
            streamFlags: StreamFlags;
            stream_id: string | null;
            streamId: string | null;
            stream_type: StreamType;
            streamType: StreamType;
            tags: TagList | null;
        }
    }

    class Stream extends Object {
        static $gtype: GObject.GType<Stream>;

        // Properties
        get caps(): Caps | null;
        set caps(val: Caps | null);

        get stream_flags(): StreamFlags;
        set stream_flags(val: StreamFlags);

        get streamFlags(): StreamFlags;
        set streamFlags(val: StreamFlags);

        get stream_id(): string | null;

        get streamId(): string | null;

        get stream_type(): StreamType;
        set stream_type(val: StreamType);

        get streamType(): StreamType;
        set streamType(val: StreamType);

        get tags(): TagList | null;
        set tags(val: TagList | null);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Stream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Stream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](stream_id: string | null, caps: Caps | null, type: StreamType, flags: StreamFlags): Stream;

        // Signals
        /** @signal */
        connect<K extends keyof Stream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Stream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Stream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Stream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Stream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Stream.SignalSignatures[K]>): void;

        // Methods
        get_caps(): Caps | null;

        get_stream_flags(): StreamFlags;

        get_stream_id(): string | null;

        get_stream_type(): StreamType;

        get_tags(): TagList | null;

        set_caps(caps: Caps | null): void;

        set_stream_flags(flags: StreamFlags): void;

        set_stream_type(stream_type: StreamType): void;

        set_tags(tags: TagList | null): void;
    }


    namespace StreamCollection {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            /** @signal */
            "stream-notify": (prop_stream: Stream, prop: GObject.ParamSpec) => void;
            "notify::upstream-id": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
            /** @signal */
            "stream-notify::upstream-id": (prop_stream: Stream, prop: GObject.ParamSpec) => void;
            /** @signal */
            "stream-notify::name": (prop_stream: Stream, prop: GObject.ParamSpec) => void;
            /** @signal */
            "stream-notify::parent": (prop_stream: Stream, prop: GObject.ParamSpec) => void;
            [key: `stream-notify::${string}`]: (prop_stream: Stream, prop: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            upstream_id: string | null;
            upstreamId: string | null;
        }
    }

    class StreamCollection extends Object {
        static $gtype: GObject.GType<StreamCollection>;

        // Properties
        get upstream_id(): string | null;
        set upstream_id(val: string | null);

        get upstreamId(): string | null;
        set upstreamId(val: string | null);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: StreamCollection.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<StreamCollection.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](upstream_id: string | null): StreamCollection;

        // Signals
        /** @signal */
        connect<K extends keyof StreamCollection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StreamCollection.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof StreamCollection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StreamCollection.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof StreamCollection.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<StreamCollection.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_stream_notify(stream: Stream, pspec: GObject.ParamSpec): void;

        // Methods
        add_stream(stream: Stream): boolean;

        get_size(): number;

        get_stream(index: number): Stream | null;

        get_upstream_id(): string | null;
    }


    namespace SystemClock {
        // Signal signatures
        interface SignalSignatures extends Clock.SignalSignatures {
            "notify::clock-type": (pspec: GObject.ParamSpec) => void;
            "notify::timeout": (pspec: GObject.ParamSpec) => void;
            "notify::window-size": (pspec: GObject.ParamSpec) => void;
            "notify::window-threshold": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Clock.ConstructorProps {
            clock_type: ClockType;
            clockType: ClockType;
        }
    }

    class SystemClock extends Clock {
        static $gtype: GObject.GType<SystemClock>;

        // Properties
        get clock_type(): ClockType;
        set clock_type(val: ClockType);

        get clockType(): ClockType;
        set clockType(val: ClockType);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SystemClock.SignalSignatures;

        // Fields
        clock: Clock;

        // Constructors
        constructor(properties?: Partial<SystemClock.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof SystemClock.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SystemClock.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SystemClock.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SystemClock.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SystemClock.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SystemClock.SignalSignatures[K]>): void;

        // Static methods
        static obtain(): Clock;

        static set_default(new_clock: Clock | null): void;
    }


    namespace Task {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    class Task extends Object {
        static $gtype: GObject.GType<Task>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Task.SignalSignatures;

        // Fields
        object: Object;

        state: TaskState;

        func: TaskFunction;

        user_data: null;

        
    // This field conflicts with a function in a parent class or interface.
    notify: GLib.DestroyNotify | any;

        running: boolean;

        // Constructors
        constructor(properties?: Partial<Task.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](func: TaskFunction): Task;

        // Signals
        /** @signal */
        connect<K extends keyof Task.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Task.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Task.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Task.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Task.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Task.SignalSignatures[K]>): void;

        // Static methods
        static cleanup_all(): void;

        // Methods
        get_pool(): TaskPool;

        get_state(): TaskState;

        join(): boolean;

        pause(): boolean;

        resume(): boolean;

        set_enter_callback(enter_func: TaskThreadFunc): void;

        set_leave_callback(leave_func: TaskThreadFunc): void;

        set_lock(mutex: GLib.RecMutex): void;

        set_pool(pool: TaskPool): void;

        set_state(state: TaskState): boolean;

        start(): boolean;

        stop(): boolean;
    }


    namespace TaskPool {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    class TaskPool extends Object {
        static $gtype: GObject.GType<TaskPool>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TaskPool.SignalSignatures;

        // Fields
        object: Object;

        // Constructors
        constructor(properties?: Partial<TaskPool.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): TaskPool;

        // Signals
        /** @signal */
        connect<K extends keyof TaskPool.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TaskPool.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TaskPool.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TaskPool.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TaskPool.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TaskPool.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_cleanup(): void;

        vfunc_dispose_handle(id: null): void;

        vfunc_join(id: null): void;

        vfunc_prepare(): void;

        vfunc_push(func: TaskPoolFunction): null;

        // Methods
        cleanup(): void;

        dispose_handle(id: null): void;

        join(id: null): void;

        prepare(): void;

        push(func: TaskPoolFunction): null;
    }


    namespace Tracer {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::params": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {
            params: string;
        }
    }

    abstract class Tracer extends Object {
        static $gtype: GObject.GType<Tracer>;

        // Properties
        get params(): string;
        set params(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Tracer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Tracer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Tracer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Tracer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Tracer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Tracer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Tracer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Tracer.SignalSignatures[K]>): void;

        // Static methods
        static register(plugin: Plugin | null, name: string, type: GObject.GType): boolean;

        static set_use_structure_params(use_structure_params: boolean): void;

        static uses_structure_params(): boolean;
    }


    namespace TracerFactory {
        // Signal signatures
        interface SignalSignatures extends PluginFeature.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends PluginFeature.ConstructorProps {}
    }

    class TracerFactory extends PluginFeature {
        static $gtype: GObject.GType<TracerFactory>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TracerFactory.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TracerFactory.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof TracerFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TracerFactory.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TracerFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TracerFactory.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TracerFactory.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TracerFactory.SignalSignatures[K]>): void;

        // Static methods
        static get_list(): TracerFactory[];

        // Methods
        get_tracer_type(): GObject.GType;
    }


    namespace TracerRecord {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    class TracerRecord extends Object {
        static $gtype: GObject.GType<TracerRecord>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TracerRecord.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TracerRecord.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof TracerRecord.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TracerRecord.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TracerRecord.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TracerRecord.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TracerRecord.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TracerRecord.SignalSignatures[K]>): void;
    }


    namespace TypeFindFactory {
        // Signal signatures
        interface SignalSignatures extends PluginFeature.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::parent": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends PluginFeature.ConstructorProps {}
    }

    class TypeFindFactory extends PluginFeature {
        static $gtype: GObject.GType<TypeFindFactory>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TypeFindFactory.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TypeFindFactory.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof TypeFindFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TypeFindFactory.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TypeFindFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TypeFindFactory.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TypeFindFactory.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TypeFindFactory.SignalSignatures[K]>): void;

        // Static methods
        static get_list(): TypeFindFactory[];

        // Methods
        call_function(find: TypeFind): void;

        get_caps(): Caps | null;

        get_extensions(): string[] | null;

        has_function(): boolean;
    }


    namespace ValueArray {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    class ValueArray {
        static $gtype: GObject.GType<ValueArray>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ValueArray.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ValueArray.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ValueArray.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ValueArray.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ValueArray.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ValueArray.SignalSignatures[K]>): void;

        // Static methods
        static append_and_take_value(value: GObject.Value | any, append_value: GObject.Value | any): void;

        static append_value(value: GObject.Value | any, append_value: GObject.Value | any): void;

        static get_size(value: GObject.Value | any): number;

        static get_value(value: GObject.Value | any, index: number): unknown;

        static init(value: GObject.Value | any, prealloc: number): unknown;

        static prepend_value(value: GObject.Value | any, prepend_value: GObject.Value | any): void;
    }


    namespace ValueList {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    class ValueList {
        static $gtype: GObject.GType<ValueList>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ValueList.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ValueList.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ValueList.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ValueList.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ValueList.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ValueList.SignalSignatures[K]>): void;

        // Static methods
        static append_and_take_value(value: GObject.Value | any, append_value: GObject.Value | any): void;

        static append_value(value: GObject.Value | any, append_value: GObject.Value | any): void;

        static concat(value1: GObject.Value | any, value2: GObject.Value | any): unknown;

        static get_size(value: GObject.Value | any): number;

        static get_value(value: GObject.Value | any, index: number): unknown;

        static init(value: GObject.Value | any, prealloc: number): unknown;

        static merge(value1: GObject.Value | any, value2: GObject.Value | any): unknown;

        static prepend_value(value: GObject.Value | any, prepend_value: GObject.Value | any): void;
    }


    namespace ValueUniqueList {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    class ValueUniqueList {
        static $gtype: GObject.GType<ValueUniqueList>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ValueUniqueList.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ValueUniqueList.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ValueUniqueList.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ValueUniqueList.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ValueUniqueList.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ValueUniqueList.SignalSignatures[K]>): void;

        // Static methods
        static append_and_take_value(value: GObject.Value | any, append_value: GObject.Value | any): void;

        static append_value(value: GObject.Value | any, append_value: GObject.Value | any): void;

        static concat(value1: GObject.Value | any, value2: GObject.Value | any): unknown;

        static get_size(value: GObject.Value | any): number;

        static get_value(value: GObject.Value | any, index: number): unknown;

        static prepend_value(value: GObject.Value | any, prepend_value: GObject.Value | any): void;
    }


    class AllocationParams {
        static $gtype: GObject.GType<AllocationParams>;

        // Fields
        flags: MemoryFlags;

        align: number;

        prefix: number;

        padding: number;

        // Constructors

        constructor(properties?: Partial<{
            flags: MemoryFlags;
            align: number;
            prefix: number;
            padding: number;
        }>);

        static ["new"](): AllocationParams;

        // Methods
        copy(): AllocationParams | null;

        free(): void;

        init(): void;
    }


    type AllocatorClass = typeof Allocator;

    abstract class AllocatorPrivate {
        static $gtype: GObject.GType<AllocatorPrivate>;
    }


    class AtomicQueue {
        static $gtype: GObject.GType<AtomicQueue>;

        // Constructors
        constructor(initial_size: number);

        static ["new"](initial_size: number): AtomicQueue;

        // Methods
        length(): number;

        peek(): null;

        pop(): null;

        push(data: null): void;

        ref(): void;

        unref(): void;
    }


    type BinClass = typeof Bin;

    abstract class BinPrivate {
        static $gtype: GObject.GType<BinPrivate>;
    }


    class Buffer {
        static $gtype: GObject.GType<Buffer>;

        // Fields
        pool: BufferPool;

        pts: ClockTime;

        dts: ClockTime;

        duration: ClockTime;

        offset: number;

        offset_end: number;

        // Constructors

        constructor(properties?: Partial<{
            mini_object: MiniObject;
            pts: ClockTime;
            dts: ClockTime;
            duration: ClockTime;
            offset: number;
            offset_end: number;
        }>);

        static ["new"](): Buffer;

        static new_allocate(allocator: Allocator | null, size: bigint | number, params: AllocationParams | null): Buffer;

        static new_memdup(data: Uint8Array | string): Buffer;

        static new_wrapped(data: Uint8Array | string): Buffer;

        static new_wrapped_bytes(bytes: GLib.Bytes | Uint8Array): Buffer;

        static new_wrapped_full(flags: MemoryFlags, data: Uint8Array | string, maxsize: bigint | number, offset: bigint | number, notify: GLib.DestroyNotify | null): Buffer;

        // Static methods
        static get_max_memory(): number;

        // Methods
        add_custom_meta(name: string): CustomMeta | null;

        add_meta(info: MetaInfo, params: null): Meta | null;

        add_parent_buffer_meta(ref: Buffer): ParentBufferMeta | null;

        add_protection_meta(info: Structure): ProtectionMeta;

        add_reference_timestamp_meta(reference: Caps, timestamp: ClockTime, duration: ClockTime): ReferenceTimestampMeta | null;

        append(buf2: Buffer): Buffer;

        append_memory(mem: Memory): void;

        append_region(buf2: Buffer, offset: bigint | number, size: bigint | number): Buffer;

        copy(): Buffer | null;

        copy_deep(): Buffer | null;

        copy_into(src: Buffer, flags: BufferCopyFlags, offset: bigint | number, size: bigint | number): boolean;

        copy_region(flags: BufferCopyFlags, offset: bigint | number, size: bigint | number): Buffer | null;

        extract(offset: bigint | number): [number, Uint8Array];

        extract_dup(offset: bigint | number, size: bigint | number): Uint8Array;

        fill(offset: bigint | number, src: Uint8Array | string): number;

        find_memory(offset: bigint | number, size: bigint | number): [boolean, number, number, number];

        foreach_meta(func: BufferForeachMetaFunc): boolean;

        get_all_memory(): Memory | null;

        get_custom_meta(name: string): CustomMeta | null;

        get_flags(): BufferFlags;

        get_memory(idx: number): Memory | null;

        get_memory_range(idx: number, length: number): Memory | null;

        get_meta(api: GObject.GType): Meta | null;

        get_n_meta(api_type: GObject.GType): number;

        get_reference_timestamp_meta(reference: Caps | null): ReferenceTimestampMeta | null;

        get_size(): number;

        get_sizes(): [number, number, number];

        get_sizes_range(idx: number, length: number): [number, number, number];

        has_flags(flags: BufferFlags): boolean;

        insert_memory(idx: number, mem: Memory): void;

        is_all_memory_writable(): boolean;

        is_memory_range_writable(idx: number, length: number): boolean;

        map(flags: MapFlags): [boolean, MapInfo];

        map_range(idx: number, length: number, flags: MapFlags): [boolean, MapInfo];

        memcmp(offset: bigint | number, mem: Uint8Array | string): number;

        memset(offset: bigint | number, val: number, size: bigint | number): number;

        n_memory(): number;

        peek_memory(idx: number): Memory | null;

        prepend_memory(mem: Memory): void;

        ref(): Buffer;

        remove_all_memory(): void;

        remove_memory(idx: number): void;

        remove_memory_range(idx: number, length: number): void;

        remove_meta(meta: Meta): boolean;

        replace_all_memory(mem: Memory): void;

        replace_memory(idx: number, mem: Memory): void;

        replace_memory_range(idx: number, length: number, mem: Memory): void;

        resize(offset: bigint | number, size: bigint | number): void;

        resize_range(idx: number, length: number, offset: bigint | number, size: bigint | number): boolean;

        set_flags(flags: BufferFlags): boolean;

        set_size(size: bigint | number): void;

        unmap(info: MapInfo): void;

        unref(): void;

        unset_flags(flags: BufferFlags): boolean;
    }


    class BufferList {
        static $gtype: GObject.GType<BufferList>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): BufferList;

        static new_sized(size: number): BufferList;

        // Static methods
        static replace(old_list: BufferList | null, new_list: BufferList | null): [boolean, BufferList | null];

        static take(old_list: BufferList, new_list: BufferList | null): [boolean, BufferList];

        // Methods
        calculate_size(): number;

        copy(): BufferList;

        copy_deep(): BufferList;

        foreach(func: BufferListFunc): boolean;

        get(idx: number): Buffer;

        get_writable(idx: number): Buffer;

        insert(idx: number, buffer: Buffer): void;

        is_writable(): boolean;

        length(): number;

        make_writable(): BufferList;

        ref(): BufferList;

        remove(idx: number, length: number): void;

        unref(): void;
    }


    class BufferPoolAcquireParams {
        static $gtype: GObject.GType<BufferPoolAcquireParams>;

        // Fields
        format: Format;

        start: number;

        stop: number;

        flags: BufferPoolAcquireFlags;
    }


    type BufferPoolClass = typeof BufferPool;

    abstract class BufferPoolPrivate {
        static $gtype: GObject.GType<BufferPoolPrivate>;
    }


    type BusClass = typeof Bus;

    abstract class BusPrivate {
        static $gtype: GObject.GType<BusPrivate>;
    }


    class ByteArrayInterface {
        static $gtype: GObject.GType<ByteArrayInterface>;

        // Fields
        data: number;

        len: number;
    }


    class Caps {
        static $gtype: GObject.GType<Caps>;

        // Constructors

        constructor(properties?: Partial<{
            mini_object: MiniObject;
        }>);

        static new_any(): Caps;

        static new_empty(): Caps;

        static new_empty_simple(media_type: string): Caps;

        static new_id_str_empty_simple(media_type: IdStr): Caps;

        static new_static_str_empty_simple(media_type: string): Caps;

        // Static methods
        static from_string(string: string): Caps | null;

        // Methods
        append(caps2: Caps): void;

        append_structure(structure: Structure): void;

        append_structure_full(structure: Structure, features: CapsFeatures | null): void;

        can_intersect(caps2: Caps): boolean;

        copy(): Caps;

        copy_nth(nth: number): Caps;

        filter_and_map_in_place(func: CapsFilterMapFunc): void;

        fixate(): Caps;

        foreach(func: CapsForeachFunc): boolean;

        get_features(index: number): CapsFeatures | null;

        get_size(): number;

        get_structure(index: number): Structure;

        id_str_set_value(field: IdStr, value: GObject.Value | any): void;

        intersect(caps2: Caps): Caps;

        intersect_full(caps2: Caps, mode: CapsIntersectMode): Caps;

        is_always_compatible(caps2: Caps): boolean;

        is_any(): boolean;

        is_empty(): boolean;

        is_equal(caps2: Caps): boolean;

        is_equal_fixed(caps2: Caps): boolean;

        is_fixed(): boolean;

        is_strictly_equal(caps2: Caps): boolean;

        is_subset(superset: Caps): boolean;

        is_subset_structure(structure: Structure): boolean;

        is_subset_structure_full(structure: Structure, features: CapsFeatures | null): boolean;

        is_writable(): boolean;

        make_writable(): Caps;

        map_in_place(func: CapsMapFunc): boolean;

        merge(caps2: Caps): Caps;

        merge_structure(structure: Structure): Caps;

        merge_structure_full(structure: Structure, features: CapsFeatures | null): Caps;

        normalize(): Caps;

        ref(): Caps;

        remove_structure(idx: number): void;

        serialize(flags: SerializeFlags): string;

        set_features(index: number, features: CapsFeatures | null): void;

        set_features_simple(features: CapsFeatures | null): void;

        set_value(field: string, value: GObject.Value | any): void;

        set_value_static_str(field: string, value: GObject.Value | any): void;

        simplify(): Caps;

        steal_structure(index: number): Structure | null;

        subtract(subtrahend: Caps): Caps;

        to_string(): string;

        truncate(): Caps;

        unref(): void;
    }


    class CapsFeatures {
        static $gtype: GObject.GType<CapsFeatures>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static new_any(): CapsFeatures;

        static new_empty(): CapsFeatures;

        static new_single(feature: string): CapsFeatures;

        static new_single_static_str(feature: string): CapsFeatures;

        // Static methods
        static from_string(features: string): CapsFeatures | null;

        // Methods
        add(feature: string): void;

        add_id(feature: GLib.Quark): void;

        add_id_str(feature: IdStr): void;

        add_static_str(feature: string): void;

        contains(feature: string): boolean;

        contains_id(feature: GLib.Quark): boolean;

        contains_id_str(feature: IdStr): boolean;

        copy(): CapsFeatures;

        free(): void;

        get_nth(i: number): string | null;

        get_nth_id(i: number): GLib.Quark;

        get_nth_id_str(i: number): IdStr;

        get_size(): number;

        is_any(): boolean;

        is_equal(features2: CapsFeatures): boolean;

        remove(feature: string): void;

        remove_id(feature: GLib.Quark): void;

        remove_id_str(feature: IdStr): void;

        to_string(): string;
    }


    type ChildProxyInterface = typeof ChildProxy;

    type ClockClass = typeof Clock;

    class ClockEntry {
        static $gtype: GObject.GType<ClockEntry>;

        // Fields
        refcount: number;
    }


    abstract class ClockPrivate {
        static $gtype: GObject.GType<ClockPrivate>;
    }


    class Context {
        static $gtype: GObject.GType<Context>;

        // Constructors
        constructor(context_type: string, persistent: boolean);

        static ["new"](context_type: string, persistent: boolean): Context;

        // Static methods
        static replace(old_context: Context, new_context: Context | null): [boolean, Context];

        // Methods
        copy(): Context;

        get_context_type(): string;

        get_structure(): Structure;

        get_task_pool(): [boolean, TaskPool | null];

        has_context_type(context_type: string): boolean;

        is_persistent(): boolean;

        is_writable(): boolean;

        make_writable(): Context;

        ref(): Context;

        set_task_pool(pool: TaskPool | null): void;

        unref(): void;

        writable_structure(): Structure;
    }


    type ControlBindingClass = typeof ControlBinding;

    abstract class ControlBindingPrivate {
        static $gtype: GObject.GType<ControlBindingPrivate>;
    }


    type ControlSourceClass = typeof ControlSource;

    class CustomMeta {
        static $gtype: GObject.GType<CustomMeta>;

        // Methods
        get_structure(): Structure;

        has_name(name: string): boolean;
    }


    class DateTime {
        static $gtype: GObject.GType<DateTime>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](tzoffset: number, year: number, month: number, day: number, hour: number, minute: number, seconds: number): DateTime;

        static new_from_g_date_time(dt: GLib.DateTime | null): DateTime;

        static new_from_iso8601_string(string: string): DateTime;

        static new_from_unix_epoch_local_time(secs: bigint | number): DateTime;

        static new_from_unix_epoch_local_time_usecs(usecs: bigint | number): DateTime;

        static new_from_unix_epoch_utc(secs: bigint | number): DateTime;

        static new_from_unix_epoch_utc_usecs(usecs: bigint | number): DateTime;

        static new_local_time(year: number, month: number, day: number, hour: number, minute: number, seconds: number): DateTime;

        static new_now_local_time(): DateTime;

        static new_now_utc(): DateTime;

        static new_y(year: number): DateTime;

        static new_ym(year: number, month: number): DateTime;

        static new_ymd(year: number, month: number, day: number): DateTime;

        // Methods
        get_day(): number;

        get_hour(): number;

        get_microsecond(): number;

        get_minute(): number;

        get_month(): number;

        get_second(): number;

        get_time_zone_offset(): number;

        get_year(): number;

        has_day(): boolean;

        has_month(): boolean;

        has_second(): boolean;

        has_time(): boolean;

        has_year(): boolean;

        ref(): DateTime;

        to_g_date_time(): GLib.DateTime | null;

        to_iso8601_string(): string | null;

        unref(): void;
    }


    class DebugCategory {
        static $gtype: GObject.GType<DebugCategory>;

        // Constructors
        constructor(properties?: Partial<{}>);

        // Methods
        free(): void;

        get_color(): number;

        get_description(): string;

        get_name(): string;

        get_threshold(): DebugLevel;

        reset_threshold(): void;

        set_threshold(level: DebugLevel): void;
    }


    abstract class DebugMessage {
        static $gtype: GObject.GType<DebugMessage>;

        // Methods
        get(): string | null;

        get_id(): string | null;
    }


    type DeviceClass = typeof Device;

    type DeviceMonitorClass = typeof DeviceMonitor;

    abstract class DeviceMonitorPrivate {
        static $gtype: GObject.GType<DeviceMonitorPrivate>;
    }


    abstract class DevicePrivate {
        static $gtype: GObject.GType<DevicePrivate>;
    }


    type DeviceProviderClass = typeof DeviceProvider;

    type DeviceProviderFactoryClass = typeof DeviceProviderFactory;

    abstract class DeviceProviderPrivate {
        static $gtype: GObject.GType<DeviceProviderPrivate>;
    }


    type DynamicTypeFactoryClass = typeof DynamicTypeFactory;

    type ElementClass = typeof Element;

    type ElementFactoryClass = typeof ElementFactory;

    class Event {
        static $gtype: GObject.GType<Event>;

        // Fields
        type: EventType;

        timestamp: number;

        seqnum: number;

        // Constructors

        constructor(properties?: Partial<{
            mini_object: MiniObject;
            type: EventType;
            timestamp: number;
            seqnum: number;
        }>);

        static new_buffer_size(format: Format, minsize: bigint | number, maxsize: bigint | number, async: boolean): Event;

        static new_caps(caps: Caps): Event;

        static new_custom(type: EventType, structure: Structure): Event;

        static new_eos(): Event;

        static new_flush_start(): Event;

        static new_flush_stop(reset_time: boolean): Event;

        static new_gap(timestamp: ClockTime, duration: ClockTime): Event;

        static new_instant_rate_change(rate_multiplier: number, new_flags: SegmentFlags): Event;

        static new_instant_rate_sync_time(rate_multiplier: number, running_time: ClockTime, upstream_running_time: ClockTime): Event;

        static new_latency(latency: ClockTime): Event;

        static new_navigation(structure: Structure): Event;

        static new_protection(system_id: string, data: Buffer, origin: string): Event;

        static new_qos(type: QOSType, proportion: number, diff: ClockTimeDiff, timestamp: ClockTime): Event;

        static new_reconfigure(): Event;

        static new_seek(rate: number, format: Format, flags: SeekFlags, start_type: SeekType, start: bigint | number, stop_type: SeekType, stop: bigint | number): Event;

        static new_segment(segment: Segment): Event;

        static new_segment_done(format: Format, position: bigint | number): Event;

        static new_select_streams(streams: string[]): Event;

        static new_sink_message(name: string, msg: Message): Event;

        static new_step(format: Format, amount: bigint | number, rate: number, flush: boolean, intermediate: boolean): Event;

        static new_stream_collection(collection: StreamCollection): Event;

        static new_stream_group_done(group_id: number): Event;

        static new_stream_start(stream_id: string): Event;

        static new_tag(taglist: TagList): Event;

        static new_toc(toc: Toc, updated: boolean): Event;

        static new_toc_select(uid: string): Event;

        // Methods
        copy(): Event;

        copy_segment(segment: Segment): void;

        get_running_time_offset(): number;

        get_seqnum(): number;

        get_structure(): Structure | null;

        has_name(name: string): boolean;

        has_name_id(name: GLib.Quark): boolean;

        is_writable(): boolean;

        make_writable(): Event;

        parse_buffer_size(): [Format | null, number, number, boolean];

        parse_caps(): Caps | null;

        parse_flush_stop(): boolean;

        parse_gap(): [ClockTime | null, ClockTime | null];

        parse_gap_flags(): GapFlags | null;

        parse_group_id(): [boolean, number];

        parse_instant_rate_change(): [number, SegmentFlags | null];

        parse_instant_rate_sync_time(): [number, ClockTime | null, ClockTime | null];

        parse_latency(): ClockTime | null;

        parse_protection(): [string, Buffer | null, string];

        parse_qos(): [QOSType | null, number, ClockTimeDiff | null, ClockTime | null];

        parse_seek(): [number, Format | null, SeekFlags | null, SeekType | null, number, SeekType | null, number];

        parse_seek_trickmode_interval(): ClockTime | null;

        parse_segment(): Segment | null;

        parse_segment_done(): [Format | null, number];

        parse_select_streams(): string[] | null;

        parse_sink_message(): Message | null;

        parse_step(): [Format | null, number, number, boolean, boolean];

        parse_stream(): Stream | null;

        parse_stream_collection(): StreamCollection | null;

        parse_stream_flags(): StreamFlags | null;

        parse_stream_group_done(): number;

        parse_stream_start(): string;

        parse_tag(): TagList | null;

        parse_toc(): [Toc | null, boolean];

        parse_toc_select(): string;

        ref(): Event;

        set_gap_flags(flags: GapFlags): void;

        set_group_id(group_id: number): void;

        set_running_time_offset(offset: bigint | number): void;

        set_seek_trickmode_interval(interval: ClockTime): void;

        set_seqnum(seqnum: number): void;

        set_stream(stream: Stream): void;

        set_stream_flags(flags: StreamFlags): void;

        unref(): void;

        writable_structure(): Structure;
    }


    class FormatDefinition {
        static $gtype: GObject.GType<FormatDefinition>;

        // Fields
        value: Format;

        nick: string;

        description: string;

        quark: GLib.Quark;
    }


    type GhostPadClass = typeof GhostPad;

    abstract class GhostPadPrivate {
        static $gtype: GObject.GType<GhostPadPrivate>;
    }


    class IdStr {
        static $gtype: GObject.GType<IdStr>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): IdStr;

        // Methods
        as_str(): string;

        clear(): void;

        copy(): IdStr;

        copy_into(s: IdStr): void;

        free(): void;

        get_len(): number;

        init(): void;

        is_equal(s2: IdStr): boolean;

        is_equal_to_str(s2: string): boolean;

        is_equal_to_str_with_len(s2: string, len: bigint | number): boolean;

        move(s: IdStr): void;

        set(value: string): void;

        set_static_str(value: string): void;

        set_static_str_with_len(value: string, len: bigint | number): void;

        set_with_len(value: string, len: bigint | number): void;
    }


    class Iterator {
        static $gtype: GObject.GType<Iterator>;

        // Fields
        item: IteratorItemFunction;

        type: GObject.GType;

        cookie: number;

        master_cookie: number;

        size: number;

        // Constructors
        constructor(size: number, type: GObject.GType, lock: GLib.Mutex, master_cookie: null, copy: IteratorCopyFunction, next: IteratorNextFunction, item: IteratorItemFunction, resync: IteratorResyncFunction, free: IteratorFreeFunction);

        static new_single(type: GObject.GType, object: GObject.Value | any): Iterator;

        // Methods
        copy(): Iterator;

        filter(func: GLib.CompareFunc, user_data: GObject.Value | any): Iterator;

        find_custom(func: GLib.CompareFunc): [boolean, unknown];

        fold(func: IteratorFoldFunction, ret: GObject.Value | any): IteratorResult;

        foreach(func: IteratorForeachFunction): IteratorResult;

        free(): void;

        next(): [IteratorResult, unknown];

        push(other: Iterator): void;

        resync(): void;
    }


    abstract class LogContext {
        static $gtype: GObject.GType<LogContext>;

        // Methods
        free(): void;

        reset(): void;
    }


    abstract class LogContextBuilder {
        static $gtype: GObject.GType<LogContextBuilder>;
    }


    class MapInfo {
        static $gtype: GObject.GType<MapInfo>;

        // Fields
        flags: MapFlags;

        data: Uint8Array;

        size: number;

        maxsize: number;

        user_data: null[];

        // Methods
        clear(): void;

        get_data(): Uint8Array | null;

        init(): void;
    }


    class Memory {
        static $gtype: GObject.GType<Memory>;

        // Fields
        allocator: Allocator;

        maxsize: number;

        align: number;

        offset: number;

        size: number;

        // Constructors
        constructor(flags: MemoryFlags, data: Uint8Array | string, maxsize: bigint | number, offset: bigint | number, notify: GLib.DestroyNotify | null);

        static new_wrapped(flags: MemoryFlags, data: Uint8Array | string, maxsize: bigint | number, offset: bigint | number, notify: GLib.DestroyNotify | null): Memory;

        // Methods
        copy(offset: bigint | number, size: bigint | number): Memory | null;

        get_sizes(): [number, number, number];

        is_span(mem2: Memory): [boolean, number];

        is_type(mem_type: string): boolean;

        is_writable(): boolean;

        make_mapped(flags: MapFlags): [Memory | null, MapInfo];

        make_writable(): Memory;

        map(flags: MapFlags): [boolean, MapInfo];

        ref(): Memory;

        resize(offset: bigint | number, size: bigint | number): void;

        share(offset: bigint | number, size: bigint | number): Memory;

        unmap(info: MapInfo): void;

        unref(): void;
    }


    class Message {
        static $gtype: GObject.GType<Message>;

        // Fields
        type: MessageType;

        timestamp: number;

        src: Object;

        seqnum: number;

        // Constructors
        constructor(src: Object | null, structure: Structure);

        static new_application(src: Object | null, structure: Structure): Message;

        static new_async_done(src: Object | null, running_time: ClockTime): Message;

        static new_async_start(src: Object | null): Message;

        static new_buffering(src: Object | null, percent: number): Message;

        static new_clock_lost(src: Object | null, clock: Clock): Message;

        static new_clock_provide(src: Object | null, clock: Clock, ready: boolean): Message;

        static new_custom(type: MessageType, src: Object | null, structure: Structure | null): Message;

        static new_device_added(src: Object | null, device: Device): Message;

        static new_device_changed(src: Object | null, device: Device, changed_device: Device): Message;

        static new_device_monitor_started(src: Object | null, success: boolean): Message;

        static new_device_removed(src: Object | null, device: Device): Message;

        static new_duration_changed(src: Object | null): Message;

        static new_element(src: Object | null, structure: Structure): Message;

        static new_eos(src: Object | null): Message;

        static new_error(src: Object | null, error: GLib.Error, debug: string | null): Message;

        static new_error_with_details(src: Object | null, error: GLib.Error, debug: string | null, details: Structure | null): Message;

        static new_have_context(src: Object | null, context: Context): Message;

        static new_info(src: Object | null, error: GLib.Error, debug: string | null): Message;

        static new_info_with_details(src: Object | null, error: GLib.Error, debug: string | null, details: Structure | null): Message;

        static new_instant_rate_request(src: Object | null, rate_multiplier: number): Message;

        static new_latency(src: Object | null): Message;

        static new_need_context(src: Object | null, context_type: string): Message;

        static new_new_clock(src: Object | null, clock: Clock): Message;

        static new_progress(src: Object | null, type: ProgressType, code: string, text: string): Message;

        static new_property_notify(src: Object, property_name: string, val: GObject.Value | any | null): Message;

        static new_qos(src: Object | null, live: boolean, running_time: bigint | number, stream_time: bigint | number, timestamp: bigint | number, duration: bigint | number): Message;

        static new_redirect(src: Object | null, location: string, tag_list: TagList | null, entry_struct: Structure | null): Message;

        static new_request_state(src: Object | null, state: State): Message;

        static new_reset_time(src: Object | null, running_time: ClockTime): Message;

        static new_segment_done(src: Object | null, format: Format, position: bigint | number): Message;

        static new_segment_start(src: Object | null, format: Format, position: bigint | number): Message;

        static new_state_changed(src: Object | null, oldstate: State, newstate: State, pending: State): Message;

        static new_state_dirty(src: Object | null): Message;

        static new_step_done(src: Object | null, format: Format, amount: bigint | number, rate: number, flush: boolean, intermediate: boolean, duration: bigint | number, eos: boolean): Message;

        static new_step_start(src: Object | null, active: boolean, format: Format, amount: bigint | number, rate: number, flush: boolean, intermediate: boolean): Message;

        static new_stream_collection(src: Object | null, collection: StreamCollection): Message;

        static new_stream_start(src: Object | null): Message;

        static new_stream_status(src: Object | null, type: StreamStatusType, owner: Element): Message;

        static new_streams_selected(src: Object | null, collection: StreamCollection): Message;

        static new_structure_change(src: Object | null, type: StructureChangeType, owner: Element, busy: boolean): Message;

        static new_tag(src: Object | null, tag_list: TagList): Message;

        static new_toc(src: Object | null, toc: Toc, updated: boolean): Message;

        static new_warning(src: Object | null, error: GLib.Error, debug: string | null): Message;

        static new_warning_with_details(src: Object | null, error: GLib.Error, debug: string | null, details: Structure | null): Message;

        // Static methods
        static take(old_message: Message, new_message: Message | null): [boolean, Message];

        // Methods
        add_redirect_entry(location: string, tag_list: TagList | null, entry_struct: Structure | null): void;

        copy(): Message;

        get_details(): Structure | null;

        get_num_redirect_entries(): number;

        get_seqnum(): number;

        get_stream_status_object(): unknown | null;

        get_structure(): Structure | null;

        has_name(name: string): boolean;

        is_writable(): boolean;

        make_writable(): Message;

        parse_async_done(): ClockTime | null;

        parse_buffering(): number;

        parse_buffering_stats(): [BufferingMode | null, number, number, number];

        parse_clock_lost(): Clock | null;

        parse_clock_provide(): [Clock | null, boolean];

        parse_context_type(): [boolean, string];

        parse_device_added(): Device | null;

        parse_device_changed(): [Device | null, Device | null];

        parse_device_monitor_started(): boolean;

        parse_device_removed(): Device | null;

        parse_error(): [GLib.Error | null, string];

        parse_error_details(): Structure | null;

        parse_error_writable_details(): Structure | null;

        parse_group_id(): [boolean, number];

        parse_have_context(): Context | null;

        parse_info(): [GLib.Error | null, string];

        parse_info_details(): Structure | null;

        parse_info_writable_details(): Structure | null;

        parse_instant_rate_request(): number;

        parse_new_clock(): Clock | null;

        parse_progress(): [ProgressType | null, string, string];

        parse_property_notify(): [Object | null, string, unknown | null];

        parse_qos(): [boolean, number, number, number, number];

        parse_qos_stats(): [Format | null, number, number];

        parse_qos_values(): [number, number, number];

        parse_redirect_entry(entry_index: bigint | number): [string, TagList | null, Structure | null];

        parse_request_state(): State | null;

        parse_reset_time(): ClockTime | null;

        parse_segment_done(): [Format | null, number];

        parse_segment_start(): [Format | null, number];

        parse_state_changed(): [State | null, State | null, State | null];

        parse_step_done(): [Format | null, number, number, boolean, boolean, number, boolean];

        parse_step_start(): [boolean, Format | null, number, number, boolean, boolean];

        parse_stream_collection(): StreamCollection | null;

        parse_stream_status(): [StreamStatusType, Element];

        parse_streams_selected(): StreamCollection | null;

        parse_structure_change(): [StructureChangeType, Element | null, boolean];

        parse_tag(): TagList;

        parse_toc(): [Toc, boolean];

        parse_warning(): [GLib.Error | null, string];

        parse_warning_details(): Structure | null;

        parse_warning_writable_details(): Structure | null;

        ref(): Message;

        set_buffering_stats(mode: BufferingMode, avg_in: number, avg_out: number, buffering_left: bigint | number): void;

        set_details(details: Structure | null): void;

        set_group_id(group_id: number): void;

        set_qos_stats(format: Format, processed: bigint | number, dropped: bigint | number): void;

        set_qos_values(jitter: bigint | number, proportion: number, quality: number): void;

        set_seqnum(seqnum: number): void;

        set_stream_status_object(object: GObject.Value | any): void;

        streams_selected_add(stream: Stream): void;

        streams_selected_get_size(): number;

        streams_selected_get_stream(idx: number): Stream | null;

        unref(): void;

        writable_details(): Structure;

        writable_structure(): Structure;
    }


    class Meta {
        static $gtype: GObject.GType<Meta>;

        // Fields
        flags: MetaFlags;

        // Static methods
        static api_type_aggregate_params(api: GObject.GType, aggregated_params: Structure, params0: Structure, params1: Structure): boolean;

        static api_type_get_tags(api: GObject.GType): string[];

        static api_type_has_tag(api: GObject.GType, tag: GLib.Quark): boolean;

        static api_type_register(api: string, tags: string[]): GObject.GType;

        static api_type_set_params_aggregator(api: GObject.GType, aggregator: AllocationMetaParamsAggregator): void;

        static api_type_tags_contain_only(api: GObject.GType, valid_tags: string[]): boolean;

        static deserialize(buffer: Buffer, data: Uint8Array | string): [Meta | null, number];

        static get_info(impl: string): MetaInfo | null;

        static register_custom(name: string, tags: string[], transform_func: CustomMetaTransformFunction | null): MetaInfo;

        static register_custom_simple(name: string): MetaInfo;

        // Methods
        compare_seqnum(meta2: Meta): number;

        get_seqnum(): number;

        serialize(data: ByteArrayInterface): boolean;

        serialize_simple(data: Uint8Array | string): boolean;
    }


    type MetaFactoryClass = typeof MetaFactory;

    class MetaInfo {
        static $gtype: GObject.GType<MetaInfo>;

        // Fields
        api: GObject.GType;

        type: GObject.GType;

        size: number;

        init_func: MetaInitFunction;

        free_func: MetaFreeFunction;

        transform_func: MetaTransformFunction;

        serialize_func: MetaSerializeFunction;

        deserialize_func: MetaDeserializeFunction;

        clear_func: MetaClearFunction;

        // Methods
        is_custom(): boolean;

        register(): MetaInfo;
    }


    class MetaTransformCopy {
        static $gtype: GObject.GType<MetaTransformCopy>;

        // Fields
        region: boolean;

        offset: number;

        size: number;
    }


    class MiniObject {
        static $gtype: GObject.GType<MiniObject>;

        // Fields
        type: GObject.GType;

        refcount: number;

        lockstate: number;

        flags: number;

        dispose: MiniObjectDisposeFunction;

        free: MiniObjectFreeFunction;

        // Static methods
        static replace(olddata: MiniObject | null, newdata: MiniObject | null): [boolean, MiniObject | null];

        static take(olddata: MiniObject, newdata: MiniObject): [boolean, MiniObject];

        // Methods
        add_parent(parent: MiniObject): void;

        copy(): MiniObject | null;

        get_qdata(quark: GLib.Quark): null;

        is_writable(): boolean;

        lock(flags: LockFlags): boolean;

        ref(): MiniObject;

        remove_parent(parent: MiniObject): void;

        set_qdata(quark: GLib.Quark, data: null): void;

        steal_qdata(quark: GLib.Quark): null;

        unlock(flags: LockFlags): void;

        unref(): void;
    }


    type ObjectClass = typeof Object;

    type PadClass = typeof Pad;

    abstract class PadPrivate {
        static $gtype: GObject.GType<PadPrivate>;
    }


    class PadProbeInfo {
        static $gtype: GObject.GType<PadProbeInfo>;

        // Fields
        type: PadProbeType;

        id: number;

        data: null;

        offset: number;

        size: number;

        // Methods
        get_buffer(): Buffer | null;

        get_buffer_list(): BufferList | null;

        get_event(): Event | null;

        get_flow_return(): FlowReturn;

        get_id(): number;

        get_offset(): number;

        get_query(): Query | null;

        get_size(): number;

        get_type(): PadProbeType;

        set_buffer(buffer: Buffer | null): void;

        set_buffer_list(list: BufferList | null): void;

        set_event(event: Event | null): void;

        set_flow_return(flow_ret: FlowReturn): void;
    }


    type PadTemplateClass = typeof PadTemplate;

    class ParamSpecArray {
        static $gtype: GObject.GType<ParamSpecArray>;

        // Fields
        element_spec: GObject.ParamSpec;
    }


    class ParamSpecFraction {
        static $gtype: GObject.GType<ParamSpecFraction>;

        // Fields
        min_num: number;

        min_den: number;

        max_num: number;

        max_den: number;

        def_num: number;

        def_den: number;
    }


    class ParentBufferMeta {
        static $gtype: GObject.GType<ParentBufferMeta>;

        // Static methods
        static get_info(): MetaInfo;
    }


    class ParseContext {
        static $gtype: GObject.GType<ParseContext>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): ParseContext;

        // Methods
        copy(): ParseContext | null;

        free(): void;

        get_missing_elements(): string[] | null;
    }


    type PipelineClass = typeof Pipeline;

    abstract class PipelinePrivate {
        static $gtype: GObject.GType<PipelinePrivate>;
    }


    type PluginClass = typeof Plugin;

    class PluginDesc {
        static $gtype: GObject.GType<PluginDesc>;

        // Fields
        major_version: number;

        minor_version: number;

        name: string;

        description: string;

        plugin_init: PluginInitFunc;

        version: string;

        license: string;

        source: string;

        "package": string;

        origin: string;

        release_datetime: string;
    }


    type PluginFeatureClass = typeof PluginFeature;

    abstract class Poll {
        static $gtype: GObject.GType<Poll>;

        // Methods
        add_fd(fd: PollFD): boolean;

        fd_can_read(fd: PollFD): boolean;

        fd_can_write(fd: PollFD): boolean;

        fd_ctl_pri(fd: PollFD, active: boolean): boolean;

        fd_ctl_read(fd: PollFD, active: boolean): boolean;

        fd_ctl_write(fd: PollFD, active: boolean): boolean;

        fd_has_closed(fd: PollFD): boolean;

        fd_has_error(fd: PollFD): boolean;

        fd_has_pri(fd: PollFD): boolean;

        fd_ignored(fd: PollFD): void;

        free(): void;

        get_read_gpollfd(fd: GLib.PollFD): void;

        read_control(): boolean;

        remove_fd(fd: PollFD): boolean;

        restart(): void;

        set_controllable(controllable: boolean): boolean;

        set_flushing(flushing: boolean): void;

        wait(timeout: ClockTime): number;

        write_control(): boolean;
    }


    class PollFD {
        static $gtype: GObject.GType<PollFD>;

        // Fields
        fd: number;

        // Constructors

        constructor(properties?: Partial<{
            fd: number;
        }>);

        // Methods
        init(): void;
    }


    type PresetInterface = typeof Preset;

    class Promise {
        static $gtype: GObject.GType<Promise>;

        // Constructors

        constructor(properties?: Partial<{
            parent: MiniObject;
        }>);

        static ["new"](): Promise;

        static new_with_change_func(func: PromiseChangeFunc): Promise;

        // Methods
        expire(): void;

        get_reply(): Structure | null;

        interrupt(): void;

        ref(): Promise;

        reply(s: Structure | null): void;

        unref(): void;

        wait(): PromiseResult;
    }


    class ProtectionMeta {
        static $gtype: GObject.GType<ProtectionMeta>;

        // Static methods
        static get_info(): MetaInfo;
    }


    type ProxyPadClass = typeof ProxyPad;

    abstract class ProxyPadPrivate {
        static $gtype: GObject.GType<ProxyPadPrivate>;
    }


    class Query {
        static $gtype: GObject.GType<Query>;

        // Fields
        type: QueryType;

        // Constructors

        constructor(properties?: Partial<{
            mini_object: MiniObject;
            type: QueryType;
        }>);

        static new_accept_caps(caps: Caps): Query;

        static new_allocation(caps: Caps | null, need_pool: boolean): Query;

        static new_bitrate(): Query;

        static new_buffering(format: Format): Query;

        static new_caps(filter: Caps): Query;

        static new_context(context_type: string): Query;

        static new_convert(src_format: Format, value: bigint | number, dest_format: Format): Query;

        static new_custom(type: QueryType, structure: Structure | null): Query;

        static new_drain(): Query;

        static new_duration(format: Format): Query;

        static new_formats(): Query;

        static new_latency(): Query;

        static new_position(format: Format): Query;

        static new_scheduling(): Query;

        static new_seeking(format: Format): Query;

        static new_segment(format: Format): Query;

        static new_selectable(): Query;

        static new_uri(): Query;

        // Static methods
        static take(old_query: Query | null, new_query: Query | null): [boolean, Query | null];

        // Methods
        add_allocation_meta(api: GObject.GType, params: Structure | null): void;

        add_allocation_param(allocator: Allocator | null, params: AllocationParams | null): void;

        add_allocation_pool(pool: BufferPool | null, size: number, min_buffers: number, max_buffers: number): void;

        add_buffering_range(start: bigint | number, stop: bigint | number): boolean;

        add_scheduling_mode(mode: PadMode): void;

        copy(): Query;

        find_allocation_meta(api: GObject.GType): [boolean, number];

        get_n_allocation_metas(): number;

        get_n_allocation_params(): number;

        get_n_allocation_pools(): number;

        get_n_buffering_ranges(): number;

        get_n_scheduling_modes(): number;

        get_structure(): Structure | null;

        has_scheduling_mode(mode: PadMode): boolean;

        has_scheduling_mode_with_flags(mode: PadMode, flags: SchedulingFlags): boolean;

        is_writable(): boolean;

        make_writable(): Query;

        parse_accept_caps(): Caps;

        parse_accept_caps_result(): boolean;

        parse_allocation(): [Caps | null, boolean];

        parse_bitrate(): number;

        parse_buffering_percent(): [boolean, number];

        parse_buffering_range(): [Format | null, number, number, number];

        parse_buffering_stats(): [BufferingMode | null, number, number, number];

        parse_caps(): Caps;

        parse_caps_result(): Caps | null;

        parse_context(): Context | null;

        parse_context_type(): [boolean, string];

        parse_convert(): [Format | null, number, Format | null, number];

        parse_duration(): [Format | null, number];

        parse_latency(): [boolean, ClockTime | null, ClockTime | null];

        parse_n_formats(): number;

        parse_nth_allocation_meta(index: number): [GObject.GType, Structure | null];

        parse_nth_allocation_param(index: number): [Allocator | null, AllocationParams | null];

        parse_nth_allocation_pool(index: number): [BufferPool | null, number, number, number];

        parse_nth_buffering_range(index: number): [boolean, number, number];

        parse_nth_format(nth: number): Format | null;

        parse_nth_scheduling_mode(index: number): PadMode;

        parse_position(): [Format | null, number];

        parse_scheduling(): [SchedulingFlags | null, number, number, number];

        parse_seeking(): [Format | null, boolean, number, number];

        parse_segment(): [number, Format | null, number, number];

        parse_selectable(): boolean;

        parse_uri(): string;

        parse_uri_redirection(): string;

        parse_uri_redirection_permanent(): boolean;

        ref(): Query;

        remove_nth_allocation_meta(index: number): void;

        remove_nth_allocation_param(index: number): void;

        remove_nth_allocation_pool(index: number): void;

        set_accept_caps_result(result: boolean): void;

        set_bitrate(nominal_bitrate: number): void;

        set_buffering_percent(busy: boolean, percent: number): void;

        set_buffering_range(format: Format, start: bigint | number, stop: bigint | number, estimated_total: bigint | number): void;

        set_buffering_stats(mode: BufferingMode, avg_in: number, avg_out: number, buffering_left: bigint | number): void;

        set_caps_result(caps: Caps | null): void;

        set_context(context: Context | null): void;

        set_convert(src_format: Format, src_value: bigint | number, dest_format: Format, dest_value: bigint | number): void;

        set_duration(format: Format, duration: bigint | number): void;

        set_formatsv(formats: Format[]): void;

        set_latency(live: boolean, min_latency: ClockTime, max_latency: ClockTime): void;

        set_nth_allocation_param(index: number, allocator: Allocator | null, params: AllocationParams | null): void;

        set_nth_allocation_pool(index: number, pool: BufferPool | null, size: number, min_buffers: number, max_buffers: number): void;

        set_position(format: Format, cur: bigint | number): void;

        set_scheduling(flags: SchedulingFlags, minsize: number, maxsize: number, align: number): void;

        set_seeking(format: Format, seekable: boolean, segment_start: bigint | number, segment_end: bigint | number): void;

        set_segment(rate: number, format: Format, start_value: bigint | number, stop_value: bigint | number): void;

        set_selectable(selectable: boolean): void;

        set_uri(uri: string | null): void;

        set_uri_redirection(uri: string | null): void;

        set_uri_redirection_permanent(permanent: boolean): void;

        unref(): void;

        writable_structure(): Structure;
    }


    class ReferenceTimestampMeta {
        static $gtype: GObject.GType<ReferenceTimestampMeta>;

        // Fields
        timestamp: ClockTime;

        duration: ClockTime;

        // Static methods
        static get_info(): MetaInfo;
    }


    type RegistryClass = typeof Registry;

    abstract class RegistryPrivate {
        static $gtype: GObject.GType<RegistryPrivate>;
    }


    class Sample {
        static $gtype: GObject.GType<Sample>;

        // Constructors
        constructor(buffer: Buffer | null, caps: Caps | null, segment: Segment | null, info: Structure | null);

        static ["new"](buffer: Buffer | null, caps: Caps | null, segment: Segment | null, info: Structure | null): Sample;

        // Methods
        copy(): Sample;

        get_buffer(): Buffer | null;

        get_buffer_list(): BufferList | null;

        get_caps(): Caps | null;

        get_info(): Structure | null;

        get_segment(): Segment;

        is_writable(): boolean;

        make_writable(): Sample;

        ref(): Sample;

        set_buffer(buffer: Buffer): void;

        set_buffer_list(buffer_list: BufferList): void;

        set_caps(caps: Caps): void;

        set_info(info: Structure): boolean;

        set_segment(segment: Segment): void;

        unref(): void;
    }


    class Segment {
        static $gtype: GObject.GType<Segment>;

        // Fields
        flags: SegmentFlags;

        rate: number;

        applied_rate: number;

        format: Format;

        base: number;

        offset: number;

        start: number;

        stop: number;

        time: number;

        position: number;

        duration: number;

        // Constructors

        constructor(properties?: Partial<{
            flags: SegmentFlags;
            rate: number;
            applied_rate: number;
            format: Format;
            base: number;
            offset: number;
            start: number;
            stop: number;
            time: number;
            position: number;
            duration: number;
        }>);

        static ["new"](): Segment;

        // Methods
        clip(format: Format, start: bigint | number, stop: bigint | number): [boolean, number, number];

        copy(): Segment;

        copy_into(dest: Segment): void;

        do_seek(rate: number, format: Format, flags: SeekFlags, start_type: SeekType, start: bigint | number, stop_type: SeekType, stop: bigint | number): [boolean, boolean];

        free(): void;

        init(format: Format): void;

        is_equal(s1: Segment): boolean;

        offset_running_time(format: Format, offset: bigint | number): boolean;

        position_from_running_time(format: Format, running_time: bigint | number): number;

        position_from_running_time_full(format: Format, running_time: bigint | number): [number, number];

        position_from_stream_time(format: Format, stream_time: bigint | number): number;

        position_from_stream_time_full(format: Format, stream_time: bigint | number): [number, number];

        set_running_time(format: Format, running_time: bigint | number): boolean;

        to_position(format: Format, running_time: bigint | number): number;

        to_running_time(format: Format, position: bigint | number): number;

        to_running_time_full(format: Format, position: bigint | number): [number, number];

        to_stream_time(format: Format, position: bigint | number): number;

        to_stream_time_full(format: Format, position: bigint | number): [number, number];
    }


    type SharedTaskPoolClass = typeof SharedTaskPool;

    abstract class SharedTaskPoolPrivate {
        static $gtype: GObject.GType<SharedTaskPoolPrivate>;
    }


    class StaticCaps {
        static $gtype: GObject.GType<StaticCaps>;

        // Fields
        string: string;

        // Methods
        cleanup(): void;

        get(): Caps | null;
    }


    class StaticPadTemplate {
        static $gtype: GObject.GType<StaticPadTemplate>;

        // Fields
        name_template: string;

        direction: PadDirection;

        presence: PadPresence;

        // Methods
        get(): PadTemplate | null;

        get_caps(): Caps;
    }


    type StreamClass = typeof Stream;

    type StreamCollectionClass = typeof StreamCollection;

    abstract class StreamCollectionPrivate {
        static $gtype: GObject.GType<StreamCollectionPrivate>;
    }


    abstract class StreamPrivate {
        static $gtype: GObject.GType<StreamPrivate>;
    }


    class Structure {
        static $gtype: GObject.GType<Structure>;

        // Fields
        type: GObject.GType;

        // Constructors
        constructor(name: string, firstfield: string, ___: any[]);

        static from_string(string: string): Structure;

        static new_empty(name: string): Structure;

        static new_from_string(string: string): Structure;

        static new_id_empty(quark: GLib.Quark): Structure;

        static new_id_str_empty(name: IdStr): Structure;

        static new_static_str_empty(name: string): Structure;

        // Static methods
        static take(oldstr_ptr: Structure | null, newstr: Structure | null): [boolean, Structure | null];

        // Methods
        can_intersect(struct2: Structure): boolean;

        copy(): Structure;

        filter_and_map_in_place(func: StructureFilterMapFunc): void;

        filter_and_map_in_place_id_str(func: StructureFilterMapIdStrFunc): void;

        fixate(): void;

        fixate_field(field_name: string): boolean;

        fixate_field_boolean(field_name: string, target: boolean): boolean;

        fixate_field_nearest_double(field_name: string, target: number): boolean;

        fixate_field_nearest_fraction(field_name: string, target_numerator: number, target_denominator: number): boolean;

        fixate_field_nearest_int(field_name: string, target: number): boolean;

        fixate_field_string(field_name: string, target: string): boolean;

        foreach(func: StructureForeachFunc): boolean;

        foreach_id_str(func: StructureForeachIdStrFunc): boolean;

        free(): void;

        get_array(fieldname: string): [boolean, GObject.ValueArray];

        get_boolean(fieldname: string): [boolean, boolean];

        get_caps(fieldname: string): [boolean, Caps];

        get_clock_time(fieldname: string): [boolean, ClockTime];

        get_date(fieldname: string): [boolean, GLib.Date];

        get_date_time(fieldname: string): [boolean, DateTime];

        get_double(fieldname: string): [boolean, number];

        get_enum(fieldname: string, enumtype: GObject.GType): [boolean, number];

        get_field_type(fieldname: string): GObject.GType;

        get_flags(fieldname: string, flags_type: GObject.GType): [boolean, number];

        get_flagset(fieldname: string): [boolean, number, number];

        get_fraction(fieldname: string): [boolean, number, number];

        get_int(fieldname: string): [boolean, number];

        get_int64(fieldname: string): [boolean, number];

        get_list(fieldname: string): [boolean, GObject.ValueArray];

        get_name(): string;

        get_name_id(): GLib.Quark;

        get_name_id_str(): IdStr;

        get_string(fieldname: string): string | null;

        get_uint(fieldname: string): [boolean, number];

        get_uint64(fieldname: string): [boolean, number];

        get_value(fieldname: string): unknown | null;

        has_field(fieldname: string): boolean;

        has_field_typed(fieldname: string, type: GObject.GType): boolean;

        has_name(name: string): boolean;

        id_get_value(field: GLib.Quark): unknown | null;

        id_has_field(field: GLib.Quark): boolean;

        id_has_field_typed(field: GLib.Quark, type: GObject.GType): boolean;

        id_set_value(field: GLib.Quark, value: GObject.Value | any): void;

        id_str_get_field_type(fieldname: IdStr): GObject.GType;

        id_str_get_value(fieldname: IdStr): unknown | null;

        id_str_has_field(fieldname: IdStr): boolean;

        id_str_has_field_typed(fieldname: IdStr, type: GObject.GType): boolean;

        id_str_nth_field_name(index: number): IdStr;

        id_str_remove_field(fieldname: IdStr): void;

        id_str_set_value(fieldname: IdStr, value: GObject.Value | any): void;

        id_str_take_value(fieldname: IdStr, value: GObject.Value | any): void;

        id_take_value(field: GLib.Quark, value: GObject.Value | any): void;

        intersect(struct2: Structure): Structure | null;

        is_equal(structure2: Structure): boolean;

        is_subset(superset: Structure): boolean;

        is_writable(): boolean;

        map_in_place(func: StructureMapFunc): boolean;

        map_in_place_id_str(func: StructureMapIdStrFunc): boolean;

        n_fields(): number;

        nth_field_name(index: number): string;

        remove_all_fields(): void;

        remove_field(fieldname: string): void;

        serialize(flags: SerializeFlags): string;

        serialize_full(flags: SerializeFlags): string | null;

        set_array(fieldname: string, array: GObject.ValueArray): void;

        set_list(fieldname: string, array: GObject.ValueArray): void;

        set_name(name: string): void;

        set_name_id_str(name: IdStr): void;

        set_name_static_str(name: string): void;

        set_value(fieldname: string, value: GObject.Value | any): void;

        set_value_static_str(fieldname: string, value: GObject.Value | any): void;

        take_value(fieldname: string, value: GObject.Value | any): void;

        take_value_static_str(fieldname: string, value: GObject.Value | any): void;

        to_string(): string;
    }


    type SystemClockClass = typeof SystemClock;

    abstract class SystemClockPrivate {
        static $gtype: GObject.GType<SystemClockPrivate>;
    }


    class TagList {
        static $gtype: GObject.GType<TagList>;

        // Constructors

        constructor(properties?: Partial<{
            mini_object: MiniObject;
        }>);

        static new_empty(): TagList;

        static new_from_string(str: string): TagList;

        // Static methods
        static copy_value(list: TagList, tag: string): [boolean, unknown];

        static replace(old_taglist: TagList | null, new_taglist: TagList | null): [boolean, TagList | null];

        static take(old_taglist: TagList, new_taglist: TagList | null): [boolean, TagList];

        // Methods
        add_value(mode: TagMergeMode, tag: string, value: GObject.Value | any): void;

        copy(): TagList;

        foreach(func: TagForeachFunc): void;

        get_boolean(tag: string): [boolean, boolean];

        get_boolean_index(tag: string, index: number): [boolean, boolean];

        get_date(tag: string): [boolean, GLib.Date];

        get_date_index(tag: string, index: number): [boolean, GLib.Date];

        get_date_time(tag: string): [boolean, DateTime];

        get_date_time_index(tag: string, index: number): [boolean, DateTime];

        get_double(tag: string): [boolean, number];

        get_double_index(tag: string, index: number): [boolean, number];

        get_float(tag: string): [boolean, number];

        get_float_index(tag: string, index: number): [boolean, number];

        get_int(tag: string): [boolean, number];

        get_int64(tag: string): [boolean, number];

        get_int64_index(tag: string, index: number): [boolean, number];

        get_int_index(tag: string, index: number): [boolean, number];

        get_pointer(tag: string): [boolean, null];

        get_pointer_index(tag: string, index: number): [boolean, null];

        get_sample(tag: string): [boolean, Sample];

        get_sample_index(tag: string, index: number): [boolean, Sample];

        get_scope(): TagScope;

        get_string(tag: string): [boolean, string];

        get_string_index(tag: string, index: number): [boolean, string];

        get_tag_size(tag: string): number;

        get_uint(tag: string): [boolean, number];

        get_uint64(tag: string): [boolean, number];

        get_uint64_index(tag: string, index: number): [boolean, number];

        get_uint_index(tag: string, index: number): [boolean, number];

        get_value_index(tag: string, index: number): unknown | null;

        insert(from: TagList, mode: TagMergeMode): void;

        is_empty(): boolean;

        is_equal(list2: TagList): boolean;

        is_writable(): boolean;

        make_writable(): TagList;

        merge(list2: TagList | null, mode: TagMergeMode): TagList | null;

        n_tags(): number;

        nth_tag_name(index: number): string;

        peek_string_index(tag: string, index: number): [boolean, string];

        ref(): TagList;

        remove_tag(tag: string): void;

        set_scope(scope: TagScope): void;

        to_string(): string;

        unref(): void;
    }


    type TagSetterInterface = typeof TagSetter;

    type TaskClass = typeof Task;

    type TaskPoolClass = typeof TaskPool;

    abstract class TaskPrivate {
        static $gtype: GObject.GType<TaskPrivate>;
    }


    class TimedValue {
        static $gtype: GObject.GType<TimedValue>;

        // Fields
        timestamp: ClockTime;

        value: number;
    }


    class Toc {
        static $gtype: GObject.GType<Toc>;

        // Constructors
        constructor(scope: TocScope);

        static ["new"](scope: TocScope): Toc;

        // Methods
        append_entry(entry: TocEntry): void;

        dump(): void;

        find_entry(uid: string): TocEntry | null;

        get_entries(): TocEntry[];

        get_scope(): TocScope;

        get_tags(): TagList | null;

        merge_tags(tags: TagList | null, mode: TagMergeMode): void;

        set_tags(tags: TagList | null): void;
    }


    class TocEntry {
        static $gtype: GObject.GType<TocEntry>;

        // Constructors
        constructor(type: TocEntryType, uid: string);

        static ["new"](type: TocEntryType, uid: string): TocEntry;

        // Methods
        append_sub_entry(subentry: TocEntry): void;

        get_entry_type(): TocEntryType;

        get_loop(): [boolean, TocLoopType | null, number];

        get_parent(): TocEntry | null;

        get_start_stop_times(): [boolean, number, number];

        get_sub_entries(): TocEntry[];

        get_tags(): TagList | null;

        get_toc(): Toc | null;

        get_uid(): string;

        is_alternative(): boolean;

        is_sequence(): boolean;

        merge_tags(tags: TagList | null, mode: TagMergeMode): void;

        set_loop(loop_type: TocLoopType, repeat_count: number): void;

        set_start_stop_times(start: bigint | number, stop: bigint | number): void;

        set_tags(tags: TagList | null): void;
    }


    type TocSetterInterface = typeof TocSetter;

    type TracerClass = typeof Tracer;

    type TracerFactoryClass = typeof TracerFactory;

    abstract class TracerPrivate {
        static $gtype: GObject.GType<TracerPrivate>;
    }


    type TracerRecordClass = typeof TracerRecord;

    class TypeFind {
        static $gtype: GObject.GType<TypeFind>;

        // Fields
        data: null;

        // Constructors

        constructor(properties?: Partial<{
            data: null;
        }>);

        // Static methods
        static register(plugin: Plugin | null, name: string, rank: number, func: TypeFindFunction, extensions: string | null, possible_caps: Caps | null): boolean;

        // Methods
        get_length(): number;

        peek(offset: bigint | number): Uint8Array | null;

        suggest(probability: number, caps: Caps): void;

        suggest_empty_simple(probability: number, media_type: string): void;
    }


    type TypeFindFactoryClass = typeof TypeFindFactory;

    type URIHandlerInterface = typeof URIHandler;

    class Uri {
        static $gtype: GObject.GType<Uri>;

        // Constructors
        constructor(scheme: string | null, userinfo: string | null, host: string | null, port: number, path: string | null, query: string | null, fragment: string | null);

        static ["new"](scheme: string | null, userinfo: string | null, host: string | null, port: number, path: string | null, query: string | null, fragment: string | null): Uri;

        // Static methods
        static construct(protocol: string, location: string): string;

        static from_string(uri: string): Uri | null;

        static from_string_escaped(uri: string): Uri | null;

        static get_location(uri: string): string | null;

        static get_protocol(uri: string): string | null;

        static has_protocol(uri: string, protocol: string): boolean;

        static is_valid(uri: string): boolean;

        static join_strings(base_uri: string, ref_uri: string): string | null;

        static protocol_is_supported(type: URIType, protocol: string): boolean;

        static protocol_is_valid(protocol: string): boolean;

        // Methods
        append_path(relative_path: string | null): boolean;

        append_path_segment(path_segment: string | null): boolean;

        copy(): Uri;

        equal(second: Uri): boolean;

        from_string_with_base(uri: string): Uri | null;

        get_fragment(): string | null;

        get_host(): string | null;

        get_media_fragment_table(): { [key: string]: string } | null;

        get_path(): string | null;

        get_path_segments(): string[];

        get_path_string(): string | null;

        get_port(): number;

        get_query_keys(): string[];

        get_query_string(): string | null;

        get_query_string_ordered(keys: string[] | null): string | null;

        get_query_table(): { [key: string]: string } | null;

        get_query_value(query_key: string): string | null;

        get_scheme(): string | null;

        get_userinfo(): string | null;

        is_normalized(): boolean;

        is_writable(): boolean;

        join(ref_uri: Uri | null): Uri | null;

        make_writable(): Uri;

        new_with_base(scheme: string | null, userinfo: string | null, host: string | null, port: number, path: string | null, query: string | null, fragment: string | null): Uri;

        normalize(): boolean;

        query_has_key(query_key: string): boolean;

        ref(): Uri;

        remove_query_key(query_key: string): boolean;

        set_fragment(fragment: string | null): boolean;

        set_host(host: string): boolean;

        set_path(path: string | null): boolean;

        set_path_segments(path_segments: string[] | null): boolean;

        set_path_string(path: string): boolean;

        set_port(port: number): boolean;

        set_query_string(query: string | null): boolean;

        set_query_table(query_table: { [key: string]: string } | null): boolean;

        set_query_value(query_key: string, query_value: string | null): boolean;

        set_scheme(scheme: string): boolean;

        set_userinfo(userinfo: string): boolean;

        to_string(): string;

        to_string_with_keys(keys: string[] | null): string;

        unref(): void;
    }


    class ValueTable {
        static $gtype: GObject.GType<ValueTable>;

        // Fields
        type: GObject.GType;

        compare: ValueCompareFunc;

        serialize: ValueSerializeFunc;

        deserialize: ValueDeserializeFunc;

        deserialize_with_pspec: ValueDeserializeWithPSpecFunc;

        hash: ValueHashFunc;
    }


    namespace ChildProxy {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "child-added": (object: GObject.Object, name: string) => void;
            /** @signal */
            "child-removed": (object: GObject.Object, name: string) => void;
        }
        /**
         * Interface for implementing ChildProxy.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_child_added(child: GObject.Object, name: string): void;

            vfunc_child_removed(child: GObject.Object, name: string): void;

            vfunc_get_child_by_index<T = GObject.Object>(index: number): T;

            vfunc_get_child_by_name<T = GObject.Object>(name: string): T;

            vfunc_get_children_count(): number;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ChildProxyNamespace {
        $gtype: GObject.GType<ChildProxy>;
        prototype: ChildProxy;
    }
    interface ChildProxy extends GObject.Object, ChildProxy.Interface {

        // Methods
        child_added(child: GObject.Object, name: string): void;

        child_removed(child: GObject.Object, name: string): void;

        get_child_by_index<T = GObject.Object>(index: number): T;

        get_child_by_name<T = GObject.Object>(name: string): T;

        get_child_by_name_recurse<T = GObject.Object>(name: string): T;

        get_children_count(): number;

        get_property(name: string): unknown;

    // Conflicted with GObject.Object.get_property
        get_property(...args: never[]): any;

        lookup(name: string): [boolean, GObject.Object | null, GObject.ParamSpec | null];

        set_property(name: string, value: GObject.Value | any): void;
    }


    export const ChildProxy: ChildProxyNamespace & {
        new (): ChildProxy; // This allows `obj instanceof ChildProxy`
    };

    namespace Preset {
        /**
         * Interface for implementing Preset.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_delete_preset(name: string): boolean;

            vfunc_get_meta(name: string, tag: string): [boolean, string];

            vfunc_get_preset_names(): string[];

            vfunc_get_property_names(): string[];

            vfunc_load_preset(name: string): boolean;

            vfunc_rename_preset(old_name: string, new_name: string): boolean;

            vfunc_save_preset(name: string): boolean;

            vfunc_set_meta(name: string, tag: string, value: string | null): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface PresetNamespace {
        $gtype: GObject.GType<Preset>;
        prototype: Preset;
        get_app_dir(): string | null;
        set_app_dir(app_dir: string): boolean;
    }
    interface Preset extends GObject.Object, Preset.Interface {

        // Methods
        delete_preset(name: string): boolean;

        get_meta(name: string, tag: string): [boolean, string];

        get_preset_names(): string[];

        get_property_names(): string[];

        is_editable(): boolean;

        load_preset(name: string): boolean;

        rename_preset(old_name: string, new_name: string): boolean;

        save_preset(name: string): boolean;

        set_meta(name: string, tag: string, value: string | null): boolean;
    }


    export const Preset: PresetNamespace & {
        new (): Preset; // This allows `obj instanceof Preset`
    };

    namespace TagSetter {

        // Constructor properties interface
        interface ConstructorProps extends Element.ConstructorProps {}
    }

    export interface TagSetterNamespace {
        $gtype: GObject.GType<TagSetter>;
        prototype: TagSetter;
    }
    interface TagSetter extends Element {

        // Methods
        add_tag_value(mode: TagMergeMode, tag: string, value: GObject.Value | any): void;

        get_tag_list(): TagList | null;

        get_tag_merge_mode(): TagMergeMode;

        merge_tags(list: TagList, mode: TagMergeMode): void;

        reset_tags(): void;

        set_tag_merge_mode(mode: TagMergeMode): void;
    }


    export const TagSetter: TagSetterNamespace & {
        new (): TagSetter; // This allows `obj instanceof TagSetter`
    };

    namespace TocSetter {

        // Constructor properties interface
        interface ConstructorProps extends Element.ConstructorProps {}
    }

    export interface TocSetterNamespace {
        $gtype: GObject.GType<TocSetter>;
        prototype: TocSetter;
    }
    interface TocSetter extends Element {

        // Methods
        get_toc(): Toc | null;

        reset(): void;

        set_toc(toc: Toc | null): void;
    }


    export const TocSetter: TocSetterNamespace & {
        new (): TocSetter; // This allows `obj instanceof TocSetter`
    };

    namespace URIHandler {
        /**
         * Interface for implementing URIHandler.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_uri(): string | null;

            vfunc_set_uri(uri: string): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface URIHandlerNamespace {
        $gtype: GObject.GType<URIHandler>;
        prototype: URIHandler;
    }
    interface URIHandler extends GObject.Object, URIHandler.Interface {

        // Methods
        get_protocols(): string[] | null;

        get_uri(): string | null;

        get_uri_type(): URIType;

        set_uri(uri: string): boolean;
    }


    export const URIHandler: URIHandlerNamespace & {
        new (): URIHandler; // This allows `obj instanceof URIHandler`
    };

    type ClockID = never;

    type ClockTime = bigint | number;

    type ClockTimeDiff = bigint | number;

    type ElementFactoryListType = bigint | number;

    const __name__: string;

    const __version__: string;
}

export default Gst;

}

declare module 'gi://Gst' {
    import Gst10 from 'gi://Gst?version=1.0';
    export default Gst10;
}
// END
