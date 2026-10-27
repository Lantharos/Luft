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

declare module 'gi://Atk?version=1.0' {

// Module dependencies
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';

export namespace Atk {

    /**
     * Atk-1.0
     */


    export namespace CoordType {
        export const $gtype: GObject.GType<CoordType>;
    }

    enum CoordType {
        SCREEN = 0,
        WINDOW = 1,
        PARENT = 2,
    }


    export namespace KeyEventType {
        export const $gtype: GObject.GType<KeyEventType>;
    }

    enum KeyEventType {
        PRESS = 0,
        RELEASE = 1,
        LAST_DEFINED = 2,
    }


    export namespace Layer {
        export const $gtype: GObject.GType<Layer>;
    }

    enum Layer {
        INVALID = 0,
        BACKGROUND = 1,
        CANVAS = 2,
        WIDGET = 3,
        MDI = 4,
        POPUP = 5,
        OVERLAY = 6,
        WINDOW = 7,
    }


    export namespace Live {
        export const $gtype: GObject.GType<Live>;
    }

    enum Live {
        NONE = 0,
        POLITE = 1,
        ASSERTIVE = 2,
    }


    export namespace RelationType {
        export const $gtype: GObject.GType<RelationType>;
    }

    enum RelationType {
        NULL = 0,
        CONTROLLED_BY = 1,
        CONTROLLER_FOR = 2,
        LABEL_FOR = 3,
        LABELLED_BY = 4,
        MEMBER_OF = 5,
        NODE_CHILD_OF = 6,
        FLOWS_TO = 7,
        FLOWS_FROM = 8,
        SUBWINDOW_OF = 9,
        EMBEDS = 10,
        EMBEDDED_BY = 11,
        POPUP_FOR = 12,
        PARENT_WINDOW_OF = 13,
        DESCRIBED_BY = 14,
        DESCRIPTION_FOR = 15,
        NODE_PARENT_OF = 16,
        DETAILS = 17,
        DETAILS_FOR = 18,
        ERROR_MESSAGE = 19,
        ERROR_FOR = 20,
        LAST_DEFINED = 21,
    }


    export namespace Role {
        export const $gtype: GObject.GType<Role>;
    }

    enum Role {
        INVALID = 0,
        ACCELERATOR_LABEL = 1,
        ALERT = 2,
        ANIMATION = 3,
        ARROW = 4,
        CALENDAR = 5,
        CANVAS = 6,
        CHECK_BOX = 7,
        CHECK_MENU_ITEM = 8,
        COLOR_CHOOSER = 9,
        COLUMN_HEADER = 10,
        COMBO_BOX = 11,
        DATE_EDITOR = 12,
        DESKTOP_ICON = 13,
        DESKTOP_FRAME = 14,
        DIAL = 15,
        DIALOG = 16,
        DIRECTORY_PANE = 17,
        DRAWING_AREA = 18,
        FILE_CHOOSER = 19,
        FILLER = 20,
        FONT_CHOOSER = 21,
        FRAME = 22,
        GLASS_PANE = 23,
        HTML_CONTAINER = 24,
        ICON = 25,
        IMAGE = 26,
        INTERNAL_FRAME = 27,
        LABEL = 28,
        LAYERED_PANE = 29,
        LIST = 30,
        LIST_ITEM = 31,
        MENU = 32,
        MENU_BAR = 33,
        MENU_ITEM = 34,
        OPTION_PANE = 35,
        PAGE_TAB = 36,
        PAGE_TAB_LIST = 37,
        PANEL = 38,
        PASSWORD_TEXT = 39,
        POPUP_MENU = 40,
        PROGRESS_BAR = 41,
        BUTTON = 42,
        RADIO_BUTTON = 43,
        RADIO_MENU_ITEM = 44,
        ROOT_PANE = 45,
        ROW_HEADER = 46,
        SCROLL_BAR = 47,
        SCROLL_PANE = 48,
        SEPARATOR = 49,
        SLIDER = 50,
        SPLIT_PANE = 51,
        SPIN_BUTTON = 52,
        STATUSBAR = 53,
        TABLE = 54,
        TABLE_CELL = 55,
        TABLE_COLUMN_HEADER = 56,
        TABLE_ROW_HEADER = 57,
        TEAR_OFF_MENU_ITEM = 58,
        TERMINAL = 59,
        TEXT = 60,
        TOGGLE_BUTTON = 61,
        TOOL_BAR = 62,
        TOOL_TIP = 63,
        TREE = 64,
        TREE_TABLE = 65,
        UNKNOWN = 66,
        VIEWPORT = 67,
        WINDOW = 68,
        HEADER = 69,
        FOOTER = 70,
        PARAGRAPH = 71,
        RULER = 72,
        APPLICATION = 73,
        AUTOCOMPLETE = 74,
        EDIT_BAR = 75,
        EMBEDDED = 76,
        ENTRY = 77,
        CHART = 78,
        CAPTION = 79,
        DOCUMENT_FRAME = 80,
        HEADING = 81,
        PAGE = 82,
        SECTION = 83,
        REDUNDANT_OBJECT = 84,
        FORM = 85,
        LINK = 86,
        INPUT_METHOD_WINDOW = 87,
        TABLE_ROW = 88,
        TREE_ITEM = 89,
        DOCUMENT_SPREADSHEET = 90,
        DOCUMENT_PRESENTATION = 91,
        DOCUMENT_TEXT = 92,
        DOCUMENT_WEB = 93,
        DOCUMENT_EMAIL = 94,
        COMMENT = 95,
        LIST_BOX = 96,
        GROUPING = 97,
        IMAGE_MAP = 98,
        NOTIFICATION = 99,
        INFO_BAR = 100,
        LEVEL_BAR = 101,
        TITLE_BAR = 102,
        BLOCK_QUOTE = 103,
        AUDIO = 104,
        VIDEO = 105,
        DEFINITION = 106,
        ARTICLE = 107,
        LANDMARK = 108,
        LOG = 109,
        MARQUEE = 110,
        MATH = 111,
        RATING = 112,
        TIMER = 113,
        DESCRIPTION_LIST = 114,
        DESCRIPTION_TERM = 115,
        DESCRIPTION_VALUE = 116,
        STATIC = 117,
        MATH_FRACTION = 118,
        MATH_ROOT = 119,
        SUBSCRIPT = 120,
        SUPERSCRIPT = 121,
        FOOTNOTE = 122,
        CONTENT_DELETION = 123,
        CONTENT_INSERTION = 124,
        MARK = 125,
        SUGGESTION = 126,
        PUSH_BUTTON_MENU = 127,
        SWITCH = 128,
        LAST_DEFINED = 129,
        PUSH_BUTTON = 42,
    }


    export namespace ScrollType {
        export const $gtype: GObject.GType<ScrollType>;
    }

    enum ScrollType {
        TOP_LEFT = 0,
        BOTTOM_RIGHT = 1,
        TOP_EDGE = 2,
        BOTTOM_EDGE = 3,
        LEFT_EDGE = 4,
        RIGHT_EDGE = 5,
        ANYWHERE = 6,
    }


    export namespace StateType {
        export const $gtype: GObject.GType<StateType>;
    }

    enum StateType {
        INVALID = 0,
        ACTIVE = 1,
        ARMED = 2,
        BUSY = 3,
        CHECKED = 4,
        DEFUNCT = 5,
        EDITABLE = 6,
        ENABLED = 7,
        EXPANDABLE = 8,
        EXPANDED = 9,
        FOCUSABLE = 10,
        FOCUSED = 11,
        HORIZONTAL = 12,
        ICONIFIED = 13,
        MODAL = 14,
        MULTI_LINE = 15,
        MULTISELECTABLE = 16,
        OPAQUE = 17,
        PRESSED = 18,
        RESIZABLE = 19,
        SELECTABLE = 20,
        SELECTED = 21,
        SENSITIVE = 22,
        SHOWING = 23,
        SINGLE_LINE = 24,
        STALE = 25,
        TRANSIENT = 26,
        VERTICAL = 27,
        VISIBLE = 28,
        MANAGES_DESCENDANTS = 29,
        INDETERMINATE = 30,
        TRUNCATED = 31,
        REQUIRED = 32,
        INVALID_ENTRY = 33,
        SUPPORTS_AUTOCOMPLETION = 34,
        SELECTABLE_TEXT = 35,
        DEFAULT = 36,
        ANIMATED = 37,
        VISITED = 38,
        CHECKABLE = 39,
        HAS_POPUP = 40,
        HAS_TOOLTIP = 41,
        READ_ONLY = 42,
        COLLAPSED = 43,
        LAST_DEFINED = 44,
    }


    export namespace TextAttribute {
        export const $gtype: GObject.GType<TextAttribute>;
    }

    enum TextAttribute {
        INVALID = 0,
        LEFT_MARGIN = 1,
        RIGHT_MARGIN = 2,
        INDENT = 3,
        INVISIBLE = 4,
        EDITABLE = 5,
        PIXELS_ABOVE_LINES = 6,
        PIXELS_BELOW_LINES = 7,
        PIXELS_INSIDE_WRAP = 8,
        BG_FULL_HEIGHT = 9,
        RISE = 10,
        UNDERLINE = 11,
        STRIKETHROUGH = 12,
        SIZE = 13,
        SCALE = 14,
        WEIGHT = 15,
        LANGUAGE = 16,
        FAMILY_NAME = 17,
        BG_COLOR = 18,
        FG_COLOR = 19,
        BG_STIPPLE = 20,
        FG_STIPPLE = 21,
        WRAP_MODE = 22,
        DIRECTION = 23,
        JUSTIFICATION = 24,
        STRETCH = 25,
        VARIANT = 26,
        STYLE = 27,
        TEXT_POSITION = 28,
        MARK = 29,
        LAST_DEFINED = 30,
    }


    export namespace TextBoundary {
        export const $gtype: GObject.GType<TextBoundary>;
    }

    enum TextBoundary {
        CHAR = 0,
        WORD_START = 1,
        WORD_END = 2,
        SENTENCE_START = 3,
        SENTENCE_END = 4,
        LINE_START = 5,
        LINE_END = 6,
    }


    export namespace TextClipType {
        export const $gtype: GObject.GType<TextClipType>;
    }

    enum TextClipType {
        NONE = 0,
        MIN = 1,
        MAX = 2,
        BOTH = 3,
    }


    export namespace TextGranularity {
        export const $gtype: GObject.GType<TextGranularity>;
    }

    enum TextGranularity {
        CHAR = 0,
        WORD = 1,
        SENTENCE = 2,
        LINE = 3,
        PARAGRAPH = 4,
    }


    export namespace ValueType {
        export const $gtype: GObject.GType<ValueType>;
    }

    enum ValueType {
        VERY_WEAK = 0,
        WEAK = 1,
        ACCEPTABLE = 2,
        STRONG = 3,
        VERY_STRONG = 4,
        VERY_LOW = 5,
        LOW = 6,
        MEDIUM = 7,
        HIGH = 8,
        VERY_HIGH = 9,
        VERY_BAD = 10,
        BAD = 11,
        GOOD = 12,
        VERY_GOOD = 13,
        BEST = 14,
        LAST_DEFINED = 15,
    }


    const BINARY_AGE: number;

    const INTERFACE_AGE: number;

    const MAJOR_VERSION: number;

    const MICRO_VERSION: number;

    const MINOR_VERSION: number;

    const VERSION_MIN_REQUIRED: number;

    function attribute_set_free(attrib_set: AttributeSet): void;

    function focus_tracker_notify(object: Object): void;

    function get_binary_age(): number;

    function get_default_registry(): Registry;

    function get_focus_object(): Object;

    function get_interface_age(): number;

    function get_major_version(): number;

    function get_micro_version(): number;

    function get_minor_version(): number;

    function get_root(): Object;

    function get_toolkit_name(): string;

    function get_toolkit_version(): string;

    function get_version(): string;

    function relation_type_for_name(name: string): RelationType;

    function relation_type_get_name(type: RelationType): string;

    function relation_type_register(name: string): RelationType;

    function remove_focus_tracker(tracker_id: number): void;

    function remove_global_event_listener(listener_id: number): void;

    function remove_key_event_listener(listener_id: number): void;

    function role_for_name(name: string): Role;

    function role_get_localized_name(role: Role): string;

    function role_get_name(role: Role): string;

    function role_register(name: string): Role;

    function state_type_for_name(name: string): StateType;

    function state_type_get_name(type: StateType): string;

    function state_type_register(name: string): StateType;

    function text_attribute_for_name(name: string): TextAttribute;

    function text_attribute_get_name(attr: TextAttribute): string;

    function text_attribute_get_value(attr: TextAttribute, index_: number): string | null;

    function text_attribute_register(name: string): TextAttribute;

    function text_free_ranges(ranges: TextRange[]): void;

    function value_type_get_localized_name(value_type: ValueType): string;

    function value_type_get_name(value_type: ValueType): string;

    interface EventListener {
        (obj: Object): void;
    }

    interface EventListenerInit {
        (): void;
    }

    interface FocusHandler {
        (object: Object, focus_in: boolean): void;
    }

    interface Function {
        (user_data: null): boolean;
    }

    interface KeySnoopFunc {
        (event: KeyEventStruct): number;
    }

    interface PropertyChangeHandler {
        (obj: Object, vals: PropertyValues): void;
    }

    export namespace HyperlinkStateFlags {
        export const $gtype: GObject.GType<HyperlinkStateFlags>;
    }

    enum HyperlinkStateFlags {
        INLINE = 1,
    }


    namespace GObjectAccessible {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            "notify::accessible-component-layer": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-component-mdi-zorder": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-description": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-help-text": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-hypertext-nlinks": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-id": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-name": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-parent": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-role": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-caption": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-caption-object": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-column-description": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-column-header": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-row-description": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-row-header": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-summary": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-value": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    class GObjectAccessible extends Object {
        static $gtype: GObject.GType<GObjectAccessible>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: GObjectAccessible.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<GObjectAccessible.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof GObjectAccessible.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GObjectAccessible.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof GObjectAccessible.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GObjectAccessible.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof GObjectAccessible.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<GObjectAccessible.SignalSignatures[K]>): void;

        // Static methods
        static for_object(obj: GObject.Object): Object;

        // Methods
        get_object<T = GObject.Object>(): T;
    }


    namespace Hyperlink {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "link-activated": () => void;
            "notify::end-index": (pspec: GObject.ParamSpec) => void;
            "notify::number-of-anchors": (pspec: GObject.ParamSpec) => void;
            "notify::selected-link": (pspec: GObject.ParamSpec) => void;
            "notify::start-index": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Action.ConstructorProps {
            end_index: number;
            endIndex: number;
            number_of_anchors: number;
            numberOfAnchors: number;
            selected_link: boolean;
            selectedLink: boolean;
            start_index: number;
            startIndex: number;
        }
    }

    class Hyperlink extends GObject.Object implements Action {
        static $gtype: GObject.GType<Hyperlink>;

        // Properties
        get end_index(): number;

        get endIndex(): number;

        get number_of_anchors(): number;

        get numberOfAnchors(): number;

        get selected_link(): boolean;

        get selectedLink(): boolean;

        get start_index(): number;

        get startIndex(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Hyperlink.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Hyperlink.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Hyperlink.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Hyperlink.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Hyperlink.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Hyperlink.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Hyperlink.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Hyperlink.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_end_index(): number;

        vfunc_get_n_anchors(): number;

        vfunc_get_object(i: number): Object;

        vfunc_get_start_index(): number;

        vfunc_get_uri(i: number): string;

        vfunc_is_selected_link(): boolean;

        vfunc_is_valid(): boolean;

        vfunc_link_activated(): void;

        vfunc_link_state(): number;

        // Methods
        get_end_index(): number;

        get_n_anchors(): number;

        get_object(i: number): Object;

        get_start_index(): number;

        get_uri(i: number): string;

        is_inline(): boolean;

        is_selected_link(): boolean;

        is_valid(): boolean;

        do_action(i: number): boolean;

        get_description(i: number): string | null;

        get_keybinding(i: number): string | null;

        get_localized_name(i: number): string | null;

        get_n_actions(): number;

        get_name(i: number): string | null;

        set_description(i: number, desc: string): boolean;

        vfunc_do_action(i: number): boolean;

        vfunc_get_description(i: number): string | null;

        vfunc_get_keybinding(i: number): string | null;

        vfunc_get_localized_name(i: number): string | null;

        vfunc_get_n_actions(): number;

        vfunc_get_name(i: number): string | null;

        vfunc_set_description(i: number, desc: string): boolean;
    }


    namespace Misc {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Misc extends GObject.Object {
        static $gtype: GObject.GType<Misc>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Misc.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Misc.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Misc.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Misc.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Misc.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Misc.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Misc.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Misc.SignalSignatures[K]>): void;

        // Static methods
        static get_instance(): Misc;

        // Virtual methods
        vfunc_threads_enter(): void;

        vfunc_threads_leave(): void;

        // Methods
        threads_enter(): void;

        threads_leave(): void;
    }


    namespace NoOpObject {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures, Component.SignalSignatures, Document.SignalSignatures, Hypertext.SignalSignatures, Selection.SignalSignatures, Table.SignalSignatures, Text.SignalSignatures, Value.SignalSignatures, Window.SignalSignatures {
            "notify::accessible-component-layer": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-component-mdi-zorder": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-description": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-help-text": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-hypertext-nlinks": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-id": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-name": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-parent": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-role": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-caption": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-caption-object": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-column-description": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-column-header": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-row-description": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-row-header": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-summary": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-value": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps, Action.ConstructorProps, Component.ConstructorProps, Document.ConstructorProps, EditableText.ConstructorProps, Hypertext.ConstructorProps, Image.ConstructorProps, Selection.ConstructorProps, Table.ConstructorProps, TableCell.ConstructorProps, Text.ConstructorProps, Value.ConstructorProps, Window.ConstructorProps {}
    }

    class NoOpObject extends Object implements Action, Component, Document, EditableText, Hypertext, Image, Selection, Table, TableCell, Text, Value, Window {
        static $gtype: GObject.GType<NoOpObject>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: NoOpObject.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<NoOpObject.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](obj: GObject.Object): NoOpObject;

        // Signals
        /** @signal */
        connect<K extends keyof NoOpObject.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NoOpObject.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof NoOpObject.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NoOpObject.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof NoOpObject.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<NoOpObject.SignalSignatures[K]>): void;

        do_action(i: number): boolean;

        get_description(i: number): string | null;

        // Conflicted with Atk.Object.get_description
        get_description(...args: never[]): any;

        get_keybinding(i: number): string | null;

        get_localized_name(i: number): string | null;

        get_n_actions(): number;

        get_name(i: number): string | null;

        // Conflicted with Atk.Object.get_name
        get_name(...args: never[]): any;

        set_description(i: number, desc: string): boolean;

        // Conflicted with Atk.Object.set_description
        set_description(...args: never[]): any;

        vfunc_do_action(i: number): boolean;

        vfunc_get_description(i: number): string | null;

        // Conflicted with Atk.Object.vfunc_get_description
        vfunc_get_description(...args: never[]): any;

        vfunc_get_keybinding(i: number): string | null;

        vfunc_get_localized_name(i: number): string | null;

        vfunc_get_n_actions(): number;

        vfunc_get_name(i: number): string | null;

        // Conflicted with Atk.Object.vfunc_get_name
        vfunc_get_name(...args: never[]): any;

        vfunc_set_description(i: number, desc: string): boolean;

        // Conflicted with Atk.Object.vfunc_set_description
        vfunc_set_description(...args: never[]): any;

        contains(x: number, y: number, coord_type: CoordType): boolean;

        get_alpha(): number;

        get_extents(coord_type: CoordType): [number, number, number, number];

        get_layer(): Layer;

        get_mdi_zorder(): number;

        get_position(coord_type: CoordType): [number, number];

        // Conflicted with Atk.TableCell.get_position
        get_position(...args: never[]): any;

        get_size(): [number, number];

        grab_focus(): boolean;

        ref_accessible_at_point(x: number, y: number, coord_type: CoordType): Object | null;

        remove_focus_handler(handler_id: number): void;

        scroll_to(type: ScrollType): boolean;

        scroll_to_point(coords: CoordType, x: number, y: number): boolean;

        set_extents(x: number, y: number, width: number, height: number, coord_type: CoordType): boolean;

        set_position(x: number, y: number, coord_type: CoordType): boolean;

        set_size(width: number, height: number): boolean;

        vfunc_bounds_changed(bounds: Rectangle): void;

        vfunc_contains(x: number, y: number, coord_type: CoordType): boolean;

        vfunc_get_alpha(): number;

        vfunc_get_extents(coord_type: CoordType): [number, number, number, number];

        vfunc_get_layer(): Layer;

        vfunc_get_mdi_zorder(): number;

        vfunc_get_position(coord_type: CoordType): [number, number];

        // Conflicted with Atk.TableCell.vfunc_get_position
        vfunc_get_position(...args: never[]): any;

        vfunc_get_size(): [number, number];

        vfunc_grab_focus(): boolean;

        vfunc_ref_accessible_at_point(x: number, y: number, coord_type: CoordType): Object | null;

        vfunc_remove_focus_handler(handler_id: number): void;

        vfunc_scroll_to(type: ScrollType): boolean;

        vfunc_scroll_to_point(coords: CoordType, x: number, y: number): boolean;

        vfunc_set_extents(x: number, y: number, width: number, height: number, coord_type: CoordType): boolean;

        vfunc_set_position(x: number, y: number, coord_type: CoordType): boolean;

        vfunc_set_size(width: number, height: number): boolean;

        get_attribute_value(attribute_name: string): string | null;

        get_attributes(): AttributeSet;

        get_current_page_number(): number;

        get_document(): null;

        get_document_type(): string;

        get_locale(): string;

        get_page_count(): number;

        get_text_selections(): TextSelection[];

        set_attribute_value(attribute_name: string, attribute_value: string): boolean;

        set_text_selections(selections: TextSelection[]): boolean;

        vfunc_get_current_page_number(): number;

        vfunc_get_document(): null;

        vfunc_get_document_attribute_value(attribute_name: string): string | null;

        vfunc_get_document_attributes(): AttributeSet;

        vfunc_get_document_locale(): string;

        vfunc_get_document_type(): string;

        vfunc_get_page_count(): number;

        vfunc_get_text_selections(): TextSelection[];

        vfunc_set_document_attribute(attribute_name: string, attribute_value: string): boolean;

        vfunc_set_text_selections(selections: TextSelection[]): boolean;

        copy_text(start_pos: number, end_pos: number): void;

        cut_text(start_pos: number, end_pos: number): void;

        delete_text(start_pos: number, end_pos: number): void;

        insert_text(string: string, length: number, position: number): void;

        paste_text(position: number): void;

        set_run_attributes(attrib_set: AttributeSet, start_offset: number, end_offset: number): boolean;

        set_text_contents(string: string): void;

        vfunc_copy_text(start_pos: number, end_pos: number): void;

        vfunc_cut_text(start_pos: number, end_pos: number): void;

        vfunc_delete_text(start_pos: number, end_pos: number): void;

        vfunc_insert_text(string: string, length: number, position: number): void;

        vfunc_paste_text(position: number): void;

        vfunc_set_run_attributes(attrib_set: AttributeSet, start_offset: number, end_offset: number): boolean;

        vfunc_set_text_contents(string: string): void;

        get_link(link_index: number): Hyperlink;

        get_link_index(char_index: number): number;

        get_n_links(): number;

        vfunc_get_link(link_index: number): Hyperlink;

        vfunc_get_link_index(char_index: number): number;

        vfunc_get_n_links(): number;

        vfunc_link_selected(link_index: number): void;

        get_image_description(): string;

        get_image_locale(): string | null;

        get_image_position(coord_type: CoordType): [number, number];

        get_image_size(): [number, number];

        set_image_description(description: string): boolean;

        vfunc_get_image_description(): string;

        vfunc_get_image_locale(): string | null;

        vfunc_get_image_position(coord_type: CoordType): [number, number];

        vfunc_get_image_size(): [number, number];

        vfunc_set_image_description(description: string): boolean;

        add_selection(i: number): boolean;

        clear_selection(): boolean;

        get_selection_count(): number;

        is_child_selected(i: number): boolean;

        ref_selection(i: number): Object | null;

        remove_selection(i: number): boolean;

        select_all_selection(): boolean;

        vfunc_add_selection(i: number): boolean;

        vfunc_clear_selection(): boolean;

        vfunc_get_selection_count(): number;

        vfunc_is_child_selected(i: number): boolean;

        vfunc_ref_selection(i: number): Object | null;

        vfunc_remove_selection(i: number): boolean;

        vfunc_select_all_selection(): boolean;

        vfunc_selection_changed(): void;

        add_column_selection(column: number): boolean;

        add_row_selection(row: number): boolean;

        get_caption(): Object | null;

        get_column_at_index(index_: number): number;

        get_column_description(column: number): string;

        get_column_extent_at(row: number, column: number): number;

        get_column_header(column: number): Object | null;

        get_index_at(row: number, column: number): number;

        get_n_columns(): number;

        get_n_rows(): number;

        get_row_at_index(index_: number): number;

        get_row_description(row: number): string | null;

        get_row_extent_at(row: number, column: number): number;

        get_row_header(row: number): Object | null;

        get_selected_columns(selected: number): number;

        get_selected_rows(selected: number): number;

        get_summary(): Object;

        is_column_selected(column: number): boolean;

        is_row_selected(row: number): boolean;

        is_selected(row: number, column: number): boolean;

        ref_at(row: number, column: number): Object;

        remove_column_selection(column: number): boolean;

        remove_row_selection(row: number): boolean;

        set_caption(caption: Object): void;

        set_column_description(column: number, description: string): void;

        set_column_header(column: number, header: Object): void;

        set_row_description(row: number, description: string): void;

        set_row_header(row: number, header: Object): void;

        set_summary(accessible: Object): void;

        vfunc_add_column_selection(column: number): boolean;

        vfunc_add_row_selection(row: number): boolean;

        vfunc_column_deleted(column: number, num_deleted: number): void;

        vfunc_column_inserted(column: number, num_inserted: number): void;

        vfunc_column_reordered(): void;

        vfunc_get_caption(): Object | null;

        vfunc_get_column_at_index(index_: number): number;

        vfunc_get_column_description(column: number): string;

        vfunc_get_column_extent_at(row: number, column: number): number;

        vfunc_get_column_header(column: number): Object | null;

        vfunc_get_index_at(row: number, column: number): number;

        vfunc_get_n_columns(): number;

        vfunc_get_n_rows(): number;

        vfunc_get_row_at_index(index_: number): number;

        vfunc_get_row_description(row: number): string | null;

        vfunc_get_row_extent_at(row: number, column: number): number;

        vfunc_get_row_header(row: number): Object | null;

        vfunc_get_selected_columns(selected: number): number;

        vfunc_get_selected_rows(selected: number): number;

        vfunc_get_summary(): Object;

        vfunc_is_column_selected(column: number): boolean;

        vfunc_is_row_selected(row: number): boolean;

        vfunc_is_selected(row: number, column: number): boolean;

        vfunc_model_changed(): void;

        vfunc_ref_at(row: number, column: number): Object;

        vfunc_remove_column_selection(column: number): boolean;

        vfunc_remove_row_selection(row: number): boolean;

        vfunc_row_deleted(row: number, num_deleted: number): void;

        vfunc_row_inserted(row: number, num_inserted: number): void;

        vfunc_row_reordered(): void;

        vfunc_set_caption(caption: Object): void;

        vfunc_set_column_description(column: number, description: string): void;

        vfunc_set_column_header(column: number, header: Object): void;

        vfunc_set_row_description(row: number, description: string): void;

        vfunc_set_row_header(row: number, header: Object): void;

        vfunc_set_summary(accessible: Object): void;

        get_column_header_cells(): Object[];

        get_column_span(): number;

        get_row_column_span(): [boolean, number, number, number, number];

        get_row_header_cells(): Object[];

        get_row_span(): number;

        get_table(): Object;

        vfunc_get_column_header_cells(): Object[];

        vfunc_get_column_span(): number;

        vfunc_get_row_column_span(): [boolean, number, number, number, number];

        vfunc_get_row_header_cells(): Object[];

        vfunc_get_row_span(): number;

        vfunc_get_table(): Object;

        get_bounded_ranges(rect: TextRectangle, coord_type: CoordType, x_clip_type: TextClipType, y_clip_type: TextClipType): TextRange[];

        get_caret_offset(): number;

        get_character_at_offset(offset: number): string;

        get_character_count(): number;

        get_character_extents(offset: number, coords: CoordType): [number, number, number, number];

        get_default_attributes(): AttributeSet;

        get_n_selections(): number;

        get_offset_at_point(x: number, y: number, coords: CoordType): number;

        get_range_extents(start_offset: number, end_offset: number, coord_type: CoordType): TextRectangle;

        get_run_attributes(offset: number): [AttributeSet, number, number];

        get_selection(selection_num: number): [string, number, number];

        get_string_at_offset(offset: number, granularity: TextGranularity): [string | null, number, number];

        get_text(start_offset: number, end_offset: number): string;

        get_text_after_offset(offset: number, boundary_type: TextBoundary): [string, number, number];

        get_text_at_offset(offset: number, boundary_type: TextBoundary): [string, number, number];

        get_text_before_offset(offset: number, boundary_type: TextBoundary): [string, number, number];

        scroll_substring_to(start_offset: number, end_offset: number, type: ScrollType): boolean;

        scroll_substring_to_point(start_offset: number, end_offset: number, coords: CoordType, x: number, y: number): boolean;

        set_caret_offset(offset: number): boolean;

        set_selection(selection_num: number, start_offset: number, end_offset: number): boolean;

        vfunc_get_bounded_ranges(rect: TextRectangle, coord_type: CoordType, x_clip_type: TextClipType, y_clip_type: TextClipType): TextRange[];

        vfunc_get_caret_offset(): number;

        vfunc_get_character_at_offset(offset: number): string;

        vfunc_get_character_count(): number;

        vfunc_get_character_extents(offset: number, coords: CoordType): [number, number, number, number];

        vfunc_get_default_attributes(): AttributeSet;

        vfunc_get_n_selections(): number;

        vfunc_get_offset_at_point(x: number, y: number, coords: CoordType): number;

        vfunc_get_range_extents(start_offset: number, end_offset: number, coord_type: CoordType): TextRectangle;

        vfunc_get_run_attributes(offset: number): [AttributeSet, number, number];

        vfunc_get_selection(selection_num: number): [string, number, number];

        vfunc_get_string_at_offset(offset: number, granularity: TextGranularity): [string | null, number, number];

        vfunc_get_text(start_offset: number, end_offset: number): string;

        vfunc_get_text_after_offset(offset: number, boundary_type: TextBoundary): [string, number, number];

        vfunc_get_text_at_offset(offset: number, boundary_type: TextBoundary): [string, number, number];

        vfunc_get_text_before_offset(offset: number, boundary_type: TextBoundary): [string, number, number];

        vfunc_scroll_substring_to(start_offset: number, end_offset: number, type: ScrollType): boolean;

        vfunc_scroll_substring_to_point(start_offset: number, end_offset: number, coords: CoordType, x: number, y: number): boolean;

        vfunc_set_caret_offset(offset: number): boolean;

        vfunc_set_selection(selection_num: number, start_offset: number, end_offset: number): boolean;

        vfunc_text_attributes_changed(): void;

        vfunc_text_caret_moved(location: number): void;

        vfunc_text_changed(position: number, length: number): void;

        vfunc_text_selection_changed(): void;

        get_current_value(): unknown;

        get_increment(): number;

        get_maximum_value(): unknown;

        get_minimum_increment(): unknown;

        get_minimum_value(): unknown;

        get_range(): Range | null;

        get_sub_ranges(): Range[];

        get_value_and_text(): [number, string];

        set_current_value(value: GObject.Value | any): boolean;

        set_value(new_value: number): void;

        vfunc_get_current_value(): GObject.Value | any;

        vfunc_get_increment(): number;

        vfunc_get_maximum_value(): GObject.Value | any;

        vfunc_get_minimum_increment(): GObject.Value | any;

        vfunc_get_minimum_value(): GObject.Value | any;

        vfunc_get_range(): Range | null;

        vfunc_get_sub_ranges(): Range[];

        vfunc_get_value_and_text(): [number, string];

        vfunc_set_current_value(value: unknown): boolean;

        vfunc_set_value(new_value: number): void;
    }


    namespace NoOpObjectFactory {
        // Signal signatures
        interface SignalSignatures extends ObjectFactory.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends ObjectFactory.ConstructorProps {}
    }

    class NoOpObjectFactory extends ObjectFactory {
        static $gtype: GObject.GType<NoOpObjectFactory>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: NoOpObjectFactory.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<NoOpObjectFactory.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): NoOpObjectFactory;

        // Signals
        /** @signal */
        connect<K extends keyof NoOpObjectFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NoOpObjectFactory.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof NoOpObjectFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NoOpObjectFactory.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof NoOpObjectFactory.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<NoOpObjectFactory.SignalSignatures[K]>): void;
    }


    namespace Object {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "active-descendant-changed": (arg1: Object) => void;
            /** @signal */
            announcement: (arg1: string) => void;
            /** @signal */
            "attribute-changed": (arg1: string, arg2: string) => void;
            /** @signal */
            "children-changed": (arg1: number, arg2: Object) => void;
            /** @signal */
            "focus-event": (arg1: boolean) => void;
            /** @signal */
            notification: (arg1: string, arg2: number) => void;
            /** @signal */
            "property-change": (arg1: PropertyValues) => void;
            /** @signal */
            "state-change": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "visible-data-changed": () => void;
            "notify::accessible-component-layer": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-component-mdi-zorder": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-description": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-help-text": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-hypertext-nlinks": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-id": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-name": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-parent": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-role": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-caption": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-caption-object": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-column-description": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-column-header": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-row-description": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-row-header": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-summary": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-value": (pspec: GObject.ParamSpec) => void;
            /** @signal */
            "active-descendant-changed::accessible-component-layer": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-component-mdi-zorder": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-description": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-help-text": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-hypertext-nlinks": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-id": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-name": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-parent": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-role": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-table-caption": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-table-caption-object": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-table-column-description": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-table-column-header": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-table-row-description": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-table-row-header": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-table-summary": (arg1: Object) => void;
            /** @signal */
            "active-descendant-changed::accessible-value": (arg1: Object) => void;
            [key: `active-descendant-changed::${string}`]: (arg1: Object) => void;
            /** @signal */
            "children-changed::accessible-component-layer": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-component-mdi-zorder": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-description": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-help-text": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-hypertext-nlinks": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-id": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-name": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-parent": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-role": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-table-caption": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-table-caption-object": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-table-column-description": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-table-column-header": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-table-row-description": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-table-row-header": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-table-summary": (arg1: number, arg2: Object) => void;
            /** @signal */
            "children-changed::accessible-value": (arg1: number, arg2: Object) => void;
            [key: `children-changed::${string}`]: (arg1: number, arg2: Object) => void;
            /** @signal */
            "property-change::accessible-component-layer": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-component-mdi-zorder": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-description": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-help-text": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-hypertext-nlinks": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-id": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-name": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-parent": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-role": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-table-caption": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-table-caption-object": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-table-column-description": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-table-column-header": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-table-row-description": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-table-row-header": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-table-summary": (arg1: PropertyValues) => void;
            /** @signal */
            "property-change::accessible-value": (arg1: PropertyValues) => void;
            [key: `property-change::${string}`]: (arg1: PropertyValues) => void;
            /** @signal */
            "state-change::accessible-component-layer": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-component-mdi-zorder": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-description": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-help-text": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-hypertext-nlinks": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-id": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-name": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-parent": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-role": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-table-caption": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-table-caption-object": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-table-column-description": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-table-column-header": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-table-row-description": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-table-row-header": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-table-summary": (arg1: string, arg2: boolean) => void;
            /** @signal */
            "state-change::accessible-value": (arg1: string, arg2: boolean) => void;
            [key: `state-change::${string}`]: (arg1: string, arg2: boolean) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            accessible_component_layer: number;
            accessibleComponentLayer: number;
            accessible_component_mdi_zorder: number;
            accessibleComponentMdiZorder: number;
            accessible_description: string;
            accessibleDescription: string;
            accessible_help_text: string;
            accessibleHelpText: string;
            accessible_hypertext_nlinks: number;
            accessibleHypertextNlinks: number;
            accessible_id: string;
            accessibleId: string;
            accessible_name: string;
            accessibleName: string;
            accessible_parent: Object;
            accessibleParent: Object;
            accessible_role: Role;
            accessibleRole: Role;
            accessible_table_caption: string;
            accessibleTableCaption: string;
            accessible_table_caption_object: Object;
            accessibleTableCaptionObject: Object;
            accessible_table_column_description: string;
            accessibleTableColumnDescription: string;
            accessible_table_column_header: Object;
            accessibleTableColumnHeader: Object;
            accessible_table_row_description: string;
            accessibleTableRowDescription: string;
            accessible_table_row_header: Object;
            accessibleTableRowHeader: Object;
            accessible_table_summary: Object;
            accessibleTableSummary: Object;
            accessible_value: number;
            accessibleValue: number;
        }
    }

    class Object extends GObject.Object {
        static $gtype: GObject.GType<Object>;

        // Properties
        get accessible_component_layer(): number;

        get accessibleComponentLayer(): number;

        get accessible_component_mdi_zorder(): number;

        get accessibleComponentMdiZorder(): number;

        get accessible_description(): string;
        set accessible_description(val: string);

        get accessibleDescription(): string;
        set accessibleDescription(val: string);

        get accessible_help_text(): string;
        set accessible_help_text(val: string);

        get accessibleHelpText(): string;
        set accessibleHelpText(val: string);

        get accessible_hypertext_nlinks(): number;

        get accessibleHypertextNlinks(): number;

        get accessible_id(): string;
        set accessible_id(val: string);

        get accessibleId(): string;
        set accessibleId(val: string);

        get accessible_name(): string;
        set accessible_name(val: string);

        get accessibleName(): string;
        set accessibleName(val: string);

        get accessible_parent(): Object;
        set accessible_parent(val: Object);

        get accessibleParent(): Object;
        set accessibleParent(val: Object);

        get accessible_role(): Role;
        set accessible_role(val: Role);

        get accessibleRole(): Role;
        set accessibleRole(val: Role);

        get accessible_table_caption(): string;
        set accessible_table_caption(val: string);

        get accessibleTableCaption(): string;
        set accessibleTableCaption(val: string);

        get accessible_table_caption_object(): Object;
        set accessible_table_caption_object(val: Object);

        get accessibleTableCaptionObject(): Object;
        set accessibleTableCaptionObject(val: Object);

        get accessible_table_column_description(): string;
        set accessible_table_column_description(val: string);

        get accessibleTableColumnDescription(): string;
        set accessibleTableColumnDescription(val: string);

        get accessible_table_column_header(): Object;
        set accessible_table_column_header(val: Object);

        get accessibleTableColumnHeader(): Object;
        set accessibleTableColumnHeader(val: Object);

        get accessible_table_row_description(): string;
        set accessible_table_row_description(val: string);

        get accessibleTableRowDescription(): string;
        set accessibleTableRowDescription(val: string);

        get accessible_table_row_header(): Object;
        set accessible_table_row_header(val: Object);

        get accessibleTableRowHeader(): Object;
        set accessibleTableRowHeader(val: Object);

        get accessible_table_summary(): Object;
        set accessible_table_summary(val: Object);

        get accessibleTableSummary(): Object;
        set accessibleTableSummary(val: Object);

        get accessible_value(): number;
        set accessible_value(val: number);

        get accessibleValue(): number;
        set accessibleValue(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Object.SignalSignatures;

        // Fields
        description: string;

        name: string;

        role: Role;

        relation_set: RelationSet;

        layer: Layer;

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

        // Virtual methods
        vfunc_active_descendant_changed(child: null): void;

        vfunc_children_changed(change_index: number, changed_child: null): void;

        vfunc_focus_event(focus_in: boolean): void;

        vfunc_get_attributes(): AttributeSet;

        vfunc_get_description(): string;

        vfunc_get_index_in_parent(): number;

        vfunc_get_layer(): Layer;

        vfunc_get_mdi_zorder(): number;

        vfunc_get_n_children(): number;

        vfunc_get_name(): string;

        vfunc_get_object_locale(): string;

        vfunc_get_parent(): Object;

        vfunc_get_role(): Role;

        vfunc_initialize(data: null): void;

        vfunc_property_change(values: PropertyValues): void;

        vfunc_ref_relation_set(): RelationSet;

        vfunc_ref_state_set(): StateSet;

        vfunc_remove_property_change_handler(handler_id: number): void;

        vfunc_set_description(description: string): void;

        vfunc_set_name(name: string): void;

        vfunc_set_parent(parent: Object): void;

        vfunc_set_role(role: Role): void;

        vfunc_state_change(name: string, state_set: boolean): void;

        vfunc_visible_data_changed(): void;

        // Methods
        add_relationship(relationship: RelationType, target: Object): boolean;

        get_accessible_id(): string;

        get_attributes(): AttributeSet;

        get_description(): string;

        get_help_text(): string;

        get_index_in_parent(): number;

        get_layer(): Layer;

        get_mdi_zorder(): number;

        get_n_accessible_children(): number;

        get_name(): string;

        get_object_locale(): string;

        get_parent(): Object;

        get_role(): Role;

        initialize(data: null): void;

        notify_state_change(state: State, value: boolean): void;

        peek_parent(): Object;

        ref_accessible_child(i: number): Object;

        ref_relation_set(): RelationSet;

        ref_state_set(): StateSet;

        remove_property_change_handler(handler_id: number): void;

        remove_relationship(relationship: RelationType, target: Object): boolean;

        set_accessible_id(id: string): void;

        set_description(description: string): void;

        set_help_text(help_text: string): void;

        set_name(name: string): void;

        set_parent(parent: Object): void;

        set_role(role: Role): void;
    }


    namespace ObjectFactory {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class ObjectFactory extends GObject.Object {
        static $gtype: GObject.GType<ObjectFactory>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ObjectFactory.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ObjectFactory.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ObjectFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ObjectFactory.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ObjectFactory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ObjectFactory.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ObjectFactory.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ObjectFactory.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_invalidate(): void;

        // Methods
        create_accessible(obj: GObject.Object): Object;

        get_accessible_type(): GObject.GType;

        invalidate(): void;
    }


    namespace Plug {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures, Component.SignalSignatures {
            "notify::accessible-component-layer": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-component-mdi-zorder": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-description": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-help-text": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-hypertext-nlinks": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-id": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-name": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-parent": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-role": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-caption": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-caption-object": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-column-description": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-column-header": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-row-description": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-row-header": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-summary": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-value": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps, Component.ConstructorProps {}
    }

    class Plug extends Object implements Component {
        static $gtype: GObject.GType<Plug>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Plug.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Plug.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Plug;

        // Signals
        /** @signal */
        connect<K extends keyof Plug.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Plug.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Plug.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Plug.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Plug.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Plug.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_object_id(): string;

        // Methods
        get_id(): string;

        set_child(child: Object): void;

        contains(x: number, y: number, coord_type: CoordType): boolean;

        get_alpha(): number;

        get_extents(coord_type: CoordType): [number, number, number, number];

        get_layer(): Layer;

        get_mdi_zorder(): number;

        get_position(coord_type: CoordType): [number, number];

        get_size(): [number, number];

        grab_focus(): boolean;

        ref_accessible_at_point(x: number, y: number, coord_type: CoordType): Object | null;

        remove_focus_handler(handler_id: number): void;

        scroll_to(type: ScrollType): boolean;

        scroll_to_point(coords: CoordType, x: number, y: number): boolean;

        set_extents(x: number, y: number, width: number, height: number, coord_type: CoordType): boolean;

        set_position(x: number, y: number, coord_type: CoordType): boolean;

        set_size(width: number, height: number): boolean;

        vfunc_bounds_changed(bounds: Rectangle): void;

        vfunc_contains(x: number, y: number, coord_type: CoordType): boolean;

        vfunc_get_alpha(): number;

        vfunc_get_extents(coord_type: CoordType): [number, number, number, number];

        vfunc_get_layer(): Layer;

        vfunc_get_mdi_zorder(): number;

        vfunc_get_position(coord_type: CoordType): [number, number];

        vfunc_get_size(): [number, number];

        vfunc_grab_focus(): boolean;

        vfunc_ref_accessible_at_point(x: number, y: number, coord_type: CoordType): Object | null;

        vfunc_remove_focus_handler(handler_id: number): void;

        vfunc_scroll_to(type: ScrollType): boolean;

        vfunc_scroll_to_point(coords: CoordType, x: number, y: number): boolean;

        vfunc_set_extents(x: number, y: number, width: number, height: number, coord_type: CoordType): boolean;

        vfunc_set_position(x: number, y: number, coord_type: CoordType): boolean;

        vfunc_set_size(width: number, height: number): boolean;
    }


    namespace Registry {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Registry extends GObject.Object {
        static $gtype: GObject.GType<Registry>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Registry.SignalSignatures;

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

        // Methods
        get_factory(type: GObject.GType): ObjectFactory;

        get_factory_type(type: GObject.GType): GObject.GType;

        set_factory_type(type: GObject.GType, factory_type: GObject.GType): void;
    }


    namespace Relation {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::relation-type": (pspec: GObject.ParamSpec) => void;
            "notify::target": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            relation_type: RelationType;
            relationType: RelationType;
            target: GObject.ValueArray;
        }
    }

    class Relation extends GObject.Object {
        static $gtype: GObject.GType<Relation>;

        // Properties
        get relation_type(): RelationType;
        set relation_type(val: RelationType);

        get relationType(): RelationType;
        set relationType(val: RelationType);

        get target(): GObject.ValueArray;
        set target(val: GObject.ValueArray);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Relation.SignalSignatures;

        // Fields
        relationship: RelationType;

        // Constructors
        constructor(properties?: Partial<Relation.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](targets: Object[], relationship: RelationType): Relation;

        // Signals
        /** @signal */
        connect<K extends keyof Relation.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Relation.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Relation.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Relation.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Relation.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Relation.SignalSignatures[K]>): void;

        // Methods
        add_target(target: Object): void;

        get_relation_type(): RelationType;

        get_target(): Object[];

        remove_target(target: Object): boolean;
    }


    namespace RelationSet {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class RelationSet extends GObject.Object {
        static $gtype: GObject.GType<RelationSet>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: RelationSet.SignalSignatures;

        // Fields
        relations: null[];

        // Constructors
        constructor(properties?: Partial<RelationSet.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): RelationSet;

        // Signals
        /** @signal */
        connect<K extends keyof RelationSet.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RelationSet.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof RelationSet.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RelationSet.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof RelationSet.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<RelationSet.SignalSignatures[K]>): void;

        // Methods
        add(relation: Relation): void;

        add_relation_by_type(relationship: RelationType, target: Object): void;

        contains(relationship: RelationType): boolean;

        contains_target(relationship: RelationType, target: Object): boolean;

        get_n_relations(): number;

        get_relation(i: number): Relation;

        get_relation_by_type(relationship: RelationType): Relation;

        remove(relation: Relation): void;
    }


    namespace Socket {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures, Component.SignalSignatures {
            "notify::accessible-component-layer": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-component-mdi-zorder": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-description": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-help-text": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-hypertext-nlinks": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-id": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-name": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-parent": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-role": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-caption": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-caption-object": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-column-description": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-column-header": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-row-description": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-row-header": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-table-summary": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-value": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps, Component.ConstructorProps {}
    }

    class Socket extends Object implements Component {
        static $gtype: GObject.GType<Socket>;

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

        static ["new"](): Socket;

        // Signals
        /** @signal */
        connect<K extends keyof Socket.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Socket.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Socket.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Socket.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Socket.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Socket.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_embed(plug_id: string): void;

        // Methods
        embed(plug_id: string): void;

        is_occupied(): boolean;

        contains(x: number, y: number, coord_type: CoordType): boolean;

        get_alpha(): number;

        get_extents(coord_type: CoordType): [number, number, number, number];

        get_layer(): Layer;

        get_mdi_zorder(): number;

        get_position(coord_type: CoordType): [number, number];

        get_size(): [number, number];

        grab_focus(): boolean;

        ref_accessible_at_point(x: number, y: number, coord_type: CoordType): Object | null;

        remove_focus_handler(handler_id: number): void;

        scroll_to(type: ScrollType): boolean;

        scroll_to_point(coords: CoordType, x: number, y: number): boolean;

        set_extents(x: number, y: number, width: number, height: number, coord_type: CoordType): boolean;

        set_position(x: number, y: number, coord_type: CoordType): boolean;

        set_size(width: number, height: number): boolean;

        vfunc_bounds_changed(bounds: Rectangle): void;

        vfunc_contains(x: number, y: number, coord_type: CoordType): boolean;

        vfunc_get_alpha(): number;

        vfunc_get_extents(coord_type: CoordType): [number, number, number, number];

        vfunc_get_layer(): Layer;

        vfunc_get_mdi_zorder(): number;

        vfunc_get_position(coord_type: CoordType): [number, number];

        vfunc_get_size(): [number, number];

        vfunc_grab_focus(): boolean;

        vfunc_ref_accessible_at_point(x: number, y: number, coord_type: CoordType): Object | null;

        vfunc_remove_focus_handler(handler_id: number): void;

        vfunc_scroll_to(type: ScrollType): boolean;

        vfunc_scroll_to_point(coords: CoordType, x: number, y: number): boolean;

        vfunc_set_extents(x: number, y: number, width: number, height: number, coord_type: CoordType): boolean;

        vfunc_set_position(x: number, y: number, coord_type: CoordType): boolean;

        vfunc_set_size(width: number, height: number): boolean;
    }


    namespace StateSet {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class StateSet extends GObject.Object {
        static $gtype: GObject.GType<StateSet>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: StateSet.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<StateSet.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): StateSet;

        // Signals
        /** @signal */
        connect<K extends keyof StateSet.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StateSet.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof StateSet.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StateSet.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof StateSet.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<StateSet.SignalSignatures[K]>): void;

        // Methods
        add_state(type: StateType): boolean;

        add_states(types: StateType[]): void;

        and_sets(compare_set: StateSet): StateSet;

        clear_states(): void;

        contains_state(type: StateType): boolean;

        contains_states(types: StateType[]): boolean;

        is_empty(): boolean;

        or_sets(compare_set: StateSet): StateSet | null;

        remove_state(type: StateType): boolean;

        xor_sets(compare_set: StateSet): StateSet;
    }


    namespace Util {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Util extends GObject.Object {
        static $gtype: GObject.GType<Util>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Util.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Util.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Util.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Util.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Util.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Util.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Util.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Util.SignalSignatures[K]>): void;
    }


    type ActionIface = typeof Action;

    class Attribute {
        static $gtype: GObject.GType<Attribute>;

        // Fields
        name: string;

        value: string;

        // Constructors

        constructor(properties?: Partial<{
            name: string;
            value: string;
        }>);

        // Static methods
        static set_free(attrib_set: AttributeSet): void;
    }


    type ComponentIface = typeof Component;

    type DocumentIface = typeof Document;

    type EditableTextIface = typeof EditableText;

    type GObjectAccessibleClass = typeof GObjectAccessible;

    type HyperlinkClass = typeof Hyperlink;

    type HyperlinkImplIface = typeof HyperlinkImpl;

    type HypertextIface = typeof Hypertext;

    type ImageIface = typeof Image;

    abstract class Implementor {
        static $gtype: GObject.GType<Implementor>;

        // Methods
        ref_accessible(): Object;
    }


    class KeyEventStruct {
        static $gtype: GObject.GType<KeyEventStruct>;

        // Fields
        type: number;

        state: number;

        keyval: number;

        length: number;

        string: string;

        keycode: number;

        timestamp: number;

        // Constructors

        constructor(properties?: Partial<{
            type: number;
            state: number;
            keyval: number;
            length: number;
            string: string;
            keycode: number;
            timestamp: number;
        }>);
    }


    type MiscClass = typeof Misc;

    type NoOpObjectClass = typeof NoOpObject;

    type NoOpObjectFactoryClass = typeof NoOpObjectFactory;

    type ObjectClass = typeof Object;

    type ObjectFactoryClass = typeof ObjectFactory;

    type PlugClass = typeof Plug;

    class PropertyValues {
        static $gtype: GObject.GType<PropertyValues>;

        // Fields
        property_name: string;
    }


    class Range {
        static $gtype: GObject.GType<Range>;

        // Constructors
        constructor(lower_limit: number, upper_limit: number, description: string);

        static ["new"](lower_limit: number, upper_limit: number, description: string): Range;

        // Methods
        copy(): Range;

        free(): void;

        get_description(): string;

        get_lower_limit(): number;

        get_upper_limit(): number;
    }


    class Rectangle {
        static $gtype: GObject.GType<Rectangle>;

        // Fields
        x: number;

        y: number;

        width: number;

        height: number;

        // Constructors

        constructor(properties?: Partial<{
            x: number;
            y: number;
            width: number;
            height: number;
        }>);
    }


    type RegistryClass = typeof Registry;

    type RelationClass = typeof Relation;

    type RelationSetClass = typeof RelationSet;

    type SelectionIface = typeof Selection;

    type SocketClass = typeof Socket;

    type StateSetClass = typeof StateSet;

    type StreamableContentIface = typeof StreamableContent;

    type TableCellIface = typeof TableCell;

    type TableIface = typeof Table;

    type TextIface = typeof Text;

    class TextRange {
        static $gtype: GObject.GType<TextRange>;

        // Fields
        bounds: TextRectangle;

        start_offset: number;

        end_offset: number;

        content: string;

        // Constructors

        constructor(properties?: Partial<{
            bounds: TextRectangle;
            start_offset: number;
            end_offset: number;
            content: string;
        }>);
    }


    class TextRectangle {
        static $gtype: GObject.GType<TextRectangle>;

        // Fields
        x: number;

        y: number;

        width: number;

        height: number;

        // Constructors

        constructor(properties?: Partial<{
            x: number;
            y: number;
            width: number;
            height: number;
        }>);
    }


    class TextSelection {
        static $gtype: GObject.GType<TextSelection>;

        // Fields
        start_object: Object;

        start_offset: number;

        end_object: Object;

        end_offset: number;

        start_is_active: boolean;
    }


    type UtilClass = typeof Util;

    type ValueIface = typeof Value;

    type WindowIface = typeof Window;

    namespace Action {
        /**
         * Interface for implementing Action.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_do_action(i: number): boolean;

            vfunc_get_description(i: number): string | null;

            vfunc_get_keybinding(i: number): string | null;

            vfunc_get_localized_name(i: number): string | null;

            vfunc_get_n_actions(): number;

            vfunc_get_name(i: number): string | null;

            vfunc_set_description(i: number, desc: string): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ActionNamespace {
        $gtype: GObject.GType<Action>;
        prototype: Action;
    }
    interface Action extends GObject.Object, Action.Interface {

        // Methods
        do_action(i: number): boolean;

        get_description(i: number): string | null;

        get_keybinding(i: number): string | null;

        get_localized_name(i: number): string | null;

        get_n_actions(): number;

        get_name(i: number): string | null;

        set_description(i: number, desc: string): boolean;
    }


    export const Action: ActionNamespace & {
        new (): Action; // This allows `obj instanceof Action`
    };

    namespace Component {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "bounds-changed": (arg1: Rectangle) => void;
        }
        /**
         * Interface for implementing Component.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_bounds_changed(bounds: Rectangle): void;

            vfunc_contains(x: number, y: number, coord_type: CoordType): boolean;

            vfunc_get_alpha(): number;

            vfunc_get_extents(coord_type: CoordType): [number, number, number, number];

            vfunc_get_layer(): Layer;

            vfunc_get_mdi_zorder(): number;

            vfunc_get_position(coord_type: CoordType): [number, number];

            vfunc_get_size(): [number, number];

            vfunc_grab_focus(): boolean;

            vfunc_ref_accessible_at_point(x: number, y: number, coord_type: CoordType): Object | null;

            vfunc_remove_focus_handler(handler_id: number): void;

            vfunc_scroll_to(type: ScrollType): boolean;

            vfunc_scroll_to_point(coords: CoordType, x: number, y: number): boolean;

            vfunc_set_extents(x: number, y: number, width: number, height: number, coord_type: CoordType): boolean;

            vfunc_set_position(x: number, y: number, coord_type: CoordType): boolean;

            vfunc_set_size(width: number, height: number): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ComponentNamespace {
        $gtype: GObject.GType<Component>;
        prototype: Component;
    }
    interface Component extends GObject.Object, Component.Interface {

        // Methods
        contains(x: number, y: number, coord_type: CoordType): boolean;

        get_alpha(): number;

        get_extents(coord_type: CoordType): [number, number, number, number];

        get_layer(): Layer;

        get_mdi_zorder(): number;

        get_position(coord_type: CoordType): [number, number];

        get_size(): [number, number];

        grab_focus(): boolean;

        ref_accessible_at_point(x: number, y: number, coord_type: CoordType): Object | null;

        remove_focus_handler(handler_id: number): void;

        scroll_to(type: ScrollType): boolean;

        scroll_to_point(coords: CoordType, x: number, y: number): boolean;

        set_extents(x: number, y: number, width: number, height: number, coord_type: CoordType): boolean;

        set_position(x: number, y: number, coord_type: CoordType): boolean;

        set_size(width: number, height: number): boolean;
    }


    export const Component: ComponentNamespace & {
        new (): Component; // This allows `obj instanceof Component`
    };

    namespace Document {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "document-attribute-changed": (arg1: string, arg2: string) => void;
            /** @signal */
            "load-complete": () => void;
            /** @signal */
            "load-stopped": () => void;
            /** @signal */
            "page-changed": (page_number: number) => void;
            /** @signal */
            reload: () => void;
        }
        /**
         * Interface for implementing Document.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_current_page_number(): number;

            vfunc_get_document(): null;

            vfunc_get_document_attribute_value(attribute_name: string): string | null;

            vfunc_get_document_attributes(): AttributeSet;

            vfunc_get_document_locale(): string;

            vfunc_get_document_type(): string;

            vfunc_get_page_count(): number;

            vfunc_get_text_selections(): TextSelection[];

            vfunc_set_document_attribute(attribute_name: string, attribute_value: string): boolean;

            vfunc_set_text_selections(selections: TextSelection[]): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface DocumentNamespace {
        $gtype: GObject.GType<Document>;
        prototype: Document;
    }
    interface Document extends GObject.Object, Document.Interface {

        // Methods
        get_attribute_value(attribute_name: string): string | null;

        get_attributes(): AttributeSet;

        get_current_page_number(): number;

        get_document(): null;

        get_document_type(): string;

        get_locale(): string;

        get_page_count(): number;

        get_text_selections(): TextSelection[];

        set_attribute_value(attribute_name: string, attribute_value: string): boolean;

        set_text_selections(selections: TextSelection[]): boolean;
    }


    export const Document: DocumentNamespace & {
        new (): Document; // This allows `obj instanceof Document`
    };

    namespace EditableText {
        /**
         * Interface for implementing EditableText.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_copy_text(start_pos: number, end_pos: number): void;

            vfunc_cut_text(start_pos: number, end_pos: number): void;

            vfunc_delete_text(start_pos: number, end_pos: number): void;

            vfunc_insert_text(string: string, length: number, position: number): void;

            vfunc_paste_text(position: number): void;

            vfunc_set_run_attributes(attrib_set: AttributeSet, start_offset: number, end_offset: number): boolean;

            vfunc_set_text_contents(string: string): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface EditableTextNamespace {
        $gtype: GObject.GType<EditableText>;
        prototype: EditableText;
    }
    interface EditableText extends GObject.Object, EditableText.Interface {

        // Methods
        copy_text(start_pos: number, end_pos: number): void;

        cut_text(start_pos: number, end_pos: number): void;

        delete_text(start_pos: number, end_pos: number): void;

        insert_text(string: string, length: number, position: number): void;

        paste_text(position: number): void;

        set_run_attributes(attrib_set: AttributeSet, start_offset: number, end_offset: number): boolean;

        set_text_contents(string: string): void;
    }


    export const EditableText: EditableTextNamespace & {
        new (): EditableText; // This allows `obj instanceof EditableText`
    };

    namespace HyperlinkImpl {
        /**
         * Interface for implementing HyperlinkImpl.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_hyperlink(): Hyperlink;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface HyperlinkImplNamespace {
        $gtype: GObject.GType<HyperlinkImpl>;
        prototype: HyperlinkImpl;
    }
    interface HyperlinkImpl extends GObject.Object, HyperlinkImpl.Interface {

        // Methods
        get_hyperlink(): Hyperlink;
    }


    export const HyperlinkImpl: HyperlinkImplNamespace & {
        new (): HyperlinkImpl; // This allows `obj instanceof HyperlinkImpl`
    };

    namespace Hypertext {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "link-selected": (arg1: number) => void;
        }
        /**
         * Interface for implementing Hypertext.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_link(link_index: number): Hyperlink;

            vfunc_get_link_index(char_index: number): number;

            vfunc_get_n_links(): number;

            vfunc_link_selected(link_index: number): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface HypertextNamespace {
        $gtype: GObject.GType<Hypertext>;
        prototype: Hypertext;
    }
    interface Hypertext extends GObject.Object, Hypertext.Interface {

        // Methods
        get_link(link_index: number): Hyperlink;

        get_link_index(char_index: number): number;

        get_n_links(): number;
    }


    export const Hypertext: HypertextNamespace & {
        new (): Hypertext; // This allows `obj instanceof Hypertext`
    };

    namespace Image {
        /**
         * Interface for implementing Image.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_image_description(): string;

            vfunc_get_image_locale(): string | null;

            vfunc_get_image_position(coord_type: CoordType): [number, number];

            vfunc_get_image_size(): [number, number];

            vfunc_set_image_description(description: string): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ImageNamespace {
        $gtype: GObject.GType<Image>;
        prototype: Image;
    }
    interface Image extends GObject.Object, Image.Interface {

        // Methods
        get_image_description(): string;

        get_image_locale(): string | null;

        get_image_position(coord_type: CoordType): [number, number];

        get_image_size(): [number, number];

        set_image_description(description: string): boolean;
    }


    export const Image: ImageNamespace & {
        new (): Image; // This allows `obj instanceof Image`
    };

    namespace ImplementorIface {

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ImplementorIfaceNamespace {
        $gtype: GObject.GType<ImplementorIface>;
        prototype: ImplementorIface;
    }
    interface ImplementorIface extends GObject.Object {
    }


    export const ImplementorIface: ImplementorIfaceNamespace & {
        new (): ImplementorIface; // This allows `obj instanceof ImplementorIface`
    };

    namespace Selection {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "selection-changed": () => void;
        }
        /**
         * Interface for implementing Selection.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_add_selection(i: number): boolean;

            vfunc_clear_selection(): boolean;

            vfunc_get_selection_count(): number;

            vfunc_is_child_selected(i: number): boolean;

            vfunc_ref_selection(i: number): Object | null;

            vfunc_remove_selection(i: number): boolean;

            vfunc_select_all_selection(): boolean;

            vfunc_selection_changed(): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface SelectionNamespace {
        $gtype: GObject.GType<Selection>;
        prototype: Selection;
    }
    interface Selection extends GObject.Object, Selection.Interface {

        // Methods
        add_selection(i: number): boolean;

        clear_selection(): boolean;

        get_selection_count(): number;

        is_child_selected(i: number): boolean;

        ref_selection(i: number): Object | null;

        remove_selection(i: number): boolean;

        select_all_selection(): boolean;
    }


    export const Selection: SelectionNamespace & {
        new (): Selection; // This allows `obj instanceof Selection`
    };

    namespace StreamableContent {
        /**
         * Interface for implementing StreamableContent.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_mime_type(i: number): string;

            vfunc_get_n_mime_types(): number;

            vfunc_get_stream(mime_type: string): GLib.IOChannel;

            vfunc_get_uri(mime_type: string): string | null;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface StreamableContentNamespace {
        $gtype: GObject.GType<StreamableContent>;
        prototype: StreamableContent;
    }
    interface StreamableContent extends GObject.Object, StreamableContent.Interface {

        // Methods
        get_mime_type(i: number): string;

        get_n_mime_types(): number;

        get_stream(mime_type: string): GLib.IOChannel;

        get_uri(mime_type: string): string | null;
    }


    export const StreamableContent: StreamableContentNamespace & {
        new (): StreamableContent; // This allows `obj instanceof StreamableContent`
    };

    namespace Table {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "column-deleted": (arg1: number, arg2: number) => void;
            /** @signal */
            "column-inserted": (arg1: number, arg2: number) => void;
            /** @signal */
            "column-reordered": () => void;
            /** @signal */
            "model-changed": () => void;
            /** @signal */
            "row-deleted": (arg1: number, arg2: number) => void;
            /** @signal */
            "row-inserted": (arg1: number, arg2: number) => void;
            /** @signal */
            "row-reordered": () => void;
        }
        /**
         * Interface for implementing Table.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_add_column_selection(column: number): boolean;

            vfunc_add_row_selection(row: number): boolean;

            vfunc_column_deleted(column: number, num_deleted: number): void;

            vfunc_column_inserted(column: number, num_inserted: number): void;

            vfunc_column_reordered(): void;

            vfunc_get_caption(): Object | null;

            vfunc_get_column_at_index(index_: number): number;

            vfunc_get_column_description(column: number): string;

            vfunc_get_column_extent_at(row: number, column: number): number;

            vfunc_get_column_header(column: number): Object | null;

            vfunc_get_index_at(row: number, column: number): number;

            vfunc_get_n_columns(): number;

            vfunc_get_n_rows(): number;

            vfunc_get_row_at_index(index_: number): number;

            vfunc_get_row_description(row: number): string | null;

            vfunc_get_row_extent_at(row: number, column: number): number;

            vfunc_get_row_header(row: number): Object | null;

            vfunc_get_selected_columns(selected: number): number;

            vfunc_get_selected_rows(selected: number): number;

            vfunc_get_summary(): Object;

            vfunc_is_column_selected(column: number): boolean;

            vfunc_is_row_selected(row: number): boolean;

            vfunc_is_selected(row: number, column: number): boolean;

            vfunc_model_changed(): void;

            vfunc_ref_at(row: number, column: number): Object;

            vfunc_remove_column_selection(column: number): boolean;

            vfunc_remove_row_selection(row: number): boolean;

            vfunc_row_deleted(row: number, num_deleted: number): void;

            vfunc_row_inserted(row: number, num_inserted: number): void;

            vfunc_row_reordered(): void;

            vfunc_set_caption(caption: Object): void;

            vfunc_set_column_description(column: number, description: string): void;

            vfunc_set_column_header(column: number, header: Object): void;

            vfunc_set_row_description(row: number, description: string): void;

            vfunc_set_row_header(row: number, header: Object): void;

            vfunc_set_summary(accessible: Object): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface TableNamespace {
        $gtype: GObject.GType<Table>;
        prototype: Table;
    }
    interface Table extends GObject.Object, Table.Interface {

        // Methods
        add_column_selection(column: number): boolean;

        add_row_selection(row: number): boolean;

        get_caption(): Object | null;

        get_column_at_index(index_: number): number;

        get_column_description(column: number): string;

        get_column_extent_at(row: number, column: number): number;

        get_column_header(column: number): Object | null;

        get_index_at(row: number, column: number): number;

        get_n_columns(): number;

        get_n_rows(): number;

        get_row_at_index(index_: number): number;

        get_row_description(row: number): string | null;

        get_row_extent_at(row: number, column: number): number;

        get_row_header(row: number): Object | null;

        get_selected_columns(selected: number): number;

        get_selected_rows(selected: number): number;

        get_summary(): Object;

        is_column_selected(column: number): boolean;

        is_row_selected(row: number): boolean;

        is_selected(row: number, column: number): boolean;

        ref_at(row: number, column: number): Object;

        remove_column_selection(column: number): boolean;

        remove_row_selection(row: number): boolean;

        set_caption(caption: Object): void;

        set_column_description(column: number, description: string): void;

        set_column_header(column: number, header: Object): void;

        set_row_description(row: number, description: string): void;

        set_row_header(row: number, header: Object): void;

        set_summary(accessible: Object): void;
    }


    export const Table: TableNamespace & {
        new (): Table; // This allows `obj instanceof Table`
    };

    namespace TableCell {
        /**
         * Interface for implementing TableCell.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_column_header_cells(): Object[];

            vfunc_get_column_span(): number;

            vfunc_get_position(): [boolean, number, number];

            vfunc_get_row_column_span(): [boolean, number, number, number, number];

            vfunc_get_row_header_cells(): Object[];

            vfunc_get_row_span(): number;

            vfunc_get_table(): Object;
        }


        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    export interface TableCellNamespace {
        $gtype: GObject.GType<TableCell>;
        prototype: TableCell;
    }
    interface TableCell extends Object, TableCell.Interface {

        // Methods
        get_column_header_cells(): Object[];

        get_column_span(): number;

        get_position(): [boolean, number, number];

        get_row_column_span(): [boolean, number, number, number, number];

        get_row_header_cells(): Object[];

        get_row_span(): number;

        get_table(): Object;
    }


    export const TableCell: TableCellNamespace & {
        new (): TableCell; // This allows `obj instanceof TableCell`
    };

    namespace Text {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "text-attributes-changed": () => void;
            /** @signal */
            "text-caret-moved": (arg1: number) => void;
            /** @signal */
            "text-changed": (arg1: number, arg2: number) => void;
            /** @signal */
            "text-insert": (arg1: number, arg2: number, arg3: string) => void;
            /** @signal */
            "text-remove": (arg1: number, arg2: number, arg3: string) => void;
            /** @signal */
            "text-selection-changed": () => void;
            [key: `text-changed::${string}`]: (arg1: number, arg2: number) => void;
            [key: `text-insert::${string}`]: (arg1: number, arg2: number, arg3: string) => void;
            [key: `text-remove::${string}`]: (arg1: number, arg2: number, arg3: string) => void;
        }
        /**
         * Interface for implementing Text.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_add_selection(start_offset: number, end_offset: number): boolean;

            vfunc_get_bounded_ranges(rect: TextRectangle, coord_type: CoordType, x_clip_type: TextClipType, y_clip_type: TextClipType): TextRange[];

            vfunc_get_caret_offset(): number;

            vfunc_get_character_at_offset(offset: number): string;

            vfunc_get_character_count(): number;

            vfunc_get_character_extents(offset: number, coords: CoordType): [number, number, number, number];

            vfunc_get_default_attributes(): AttributeSet;

            vfunc_get_n_selections(): number;

            vfunc_get_offset_at_point(x: number, y: number, coords: CoordType): number;

            vfunc_get_range_extents(start_offset: number, end_offset: number, coord_type: CoordType): TextRectangle;

            vfunc_get_run_attributes(offset: number): [AttributeSet, number, number];

            vfunc_get_selection(selection_num: number): [string, number, number];

            vfunc_get_string_at_offset(offset: number, granularity: TextGranularity): [string | null, number, number];

            vfunc_get_text(start_offset: number, end_offset: number): string;

            vfunc_get_text_after_offset(offset: number, boundary_type: TextBoundary): [string, number, number];

            vfunc_get_text_at_offset(offset: number, boundary_type: TextBoundary): [string, number, number];

            vfunc_get_text_before_offset(offset: number, boundary_type: TextBoundary): [string, number, number];

            vfunc_remove_selection(selection_num: number): boolean;

            vfunc_scroll_substring_to(start_offset: number, end_offset: number, type: ScrollType): boolean;

            vfunc_scroll_substring_to_point(start_offset: number, end_offset: number, coords: CoordType, x: number, y: number): boolean;

            vfunc_set_caret_offset(offset: number): boolean;

            vfunc_set_selection(selection_num: number, start_offset: number, end_offset: number): boolean;

            vfunc_text_attributes_changed(): void;

            vfunc_text_caret_moved(location: number): void;

            vfunc_text_changed(position: number, length: number): void;

            vfunc_text_selection_changed(): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface TextNamespace {
        $gtype: GObject.GType<Text>;
        prototype: Text;
        free_ranges(ranges: TextRange[]): void;
    }
    interface Text extends GObject.Object, Text.Interface {

        // Methods
        add_selection(start_offset: number, end_offset: number): boolean;

        get_bounded_ranges(rect: TextRectangle, coord_type: CoordType, x_clip_type: TextClipType, y_clip_type: TextClipType): TextRange[];

        get_caret_offset(): number;

        get_character_at_offset(offset: number): string;

        get_character_count(): number;

        get_character_extents(offset: number, coords: CoordType): [number, number, number, number];

        get_default_attributes(): AttributeSet;

        get_n_selections(): number;

        get_offset_at_point(x: number, y: number, coords: CoordType): number;

        get_range_extents(start_offset: number, end_offset: number, coord_type: CoordType): TextRectangle;

        get_run_attributes(offset: number): [AttributeSet, number, number];

        get_selection(selection_num: number): [string, number, number];

        get_string_at_offset(offset: number, granularity: TextGranularity): [string | null, number, number];

        get_text(start_offset: number, end_offset: number): string;

        get_text_after_offset(offset: number, boundary_type: TextBoundary): [string, number, number];

        get_text_at_offset(offset: number, boundary_type: TextBoundary): [string, number, number];

        get_text_before_offset(offset: number, boundary_type: TextBoundary): [string, number, number];

        remove_selection(selection_num: number): boolean;

        scroll_substring_to(start_offset: number, end_offset: number, type: ScrollType): boolean;

        scroll_substring_to_point(start_offset: number, end_offset: number, coords: CoordType, x: number, y: number): boolean;

        set_caret_offset(offset: number): boolean;

        set_selection(selection_num: number, start_offset: number, end_offset: number): boolean;
    }


    export const Text: TextNamespace & {
        new (): Text; // This allows `obj instanceof Text`
    };

    namespace Value {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "value-changed": (value: number, text: string) => void;
        }
        /**
         * Interface for implementing Value.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_current_value(): GObject.Value | any;

            vfunc_get_increment(): number;

            vfunc_get_maximum_value(): GObject.Value | any;

            vfunc_get_minimum_increment(): GObject.Value | any;

            vfunc_get_minimum_value(): GObject.Value | any;

            vfunc_get_range(): Range | null;

            vfunc_get_sub_ranges(): Range[];

            vfunc_get_value_and_text(): [number, string];

            vfunc_set_current_value(value: unknown): boolean;

            vfunc_set_value(new_value: number): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ValueNamespace {
        $gtype: GObject.GType<Value>;
        prototype: Value;
    }
    interface Value extends GObject.Object, Value.Interface {

        // Methods
        get_current_value(): unknown;

        get_increment(): number;

        get_maximum_value(): unknown;

        get_minimum_increment(): unknown;

        get_minimum_value(): unknown;

        get_range(): Range | null;

        get_sub_ranges(): Range[];

        get_value_and_text(): [number, string];

        set_current_value(value: GObject.Value | any): boolean;

        set_value(new_value: number): void;
    }


    export const Value: ValueNamespace & {
        new (): Value; // This allows `obj instanceof Value`
    };

    namespace Window {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            activate: () => void;
            /** @signal */
            create: () => void;
            /** @signal */
            deactivate: () => void;
            /** @signal */
            destroy: () => void;
            /** @signal */
            maximize: () => void;
            /** @signal */
            minimize: () => void;
            /** @signal */
            move: () => void;
            /** @signal */
            resize: () => void;
            /** @signal */
            restore: () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    export interface WindowNamespace {
        $gtype: GObject.GType<Window>;
        prototype: Window;
    }
    interface Window extends Object {
    }


    export const Window: WindowNamespace & {
        new (): Window; // This allows `obj instanceof Window`
    };

    type AttributeSet = GLib.SList;

    type State = bigint | number;

    const __name__: string;

    const __version__: string;
}

export default Atk;

}

declare module 'gi://Atk' {
    import Atk10 from 'gi://Atk?version=1.0';
    export default Atk10;
}
// END
