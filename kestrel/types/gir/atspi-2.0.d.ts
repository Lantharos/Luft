/// <reference path="./gobject-2.0.d.ts" />
/// <reference path="./glib-2.0.d.ts" />
/// <reference path="./dbus-1.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://Atspi?version=2.0' {

// Module dependencies
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type DBus from 'gi://DBus?version=1.0';

export namespace Atspi {

    /**
     * Atspi-2.0
     */


    export namespace CollectionMatchType {
        export const $gtype: GObject.GType<CollectionMatchType>;
    }

    enum CollectionMatchType {
        INVALID = 0,
        ALL = 1,
        ANY = 2,
        NONE = 3,
        EMPTY = 4,
        LAST_DEFINED = 5,
    }


    export namespace CollectionSortOrder {
        export const $gtype: GObject.GType<CollectionSortOrder>;
    }

    enum CollectionSortOrder {
        INVALID = 0,
        CANONICAL = 1,
        FLOW = 2,
        TAB = 3,
        REVERSE_CANONICAL = 4,
        REVERSE_FLOW = 5,
        REVERSE_TAB = 6,
        LAST_DEFINED = 7,
    }


    export namespace CollectionTreeTraversalType {
        export const $gtype: GObject.GType<CollectionTreeTraversalType>;
    }

    enum CollectionTreeTraversalType {
        RESTRICT_CHILDREN = 0,
        RESTRICT_SIBLING = 1,
        INORDER = 2,
        LAST_DEFINED = 3,
    }


    export namespace ComponentLayer {
        export const $gtype: GObject.GType<ComponentLayer>;
    }

    enum ComponentLayer {
        INVALID = 0,
        BACKGROUND = 1,
        CANVAS = 2,
        WIDGET = 3,
        MDI = 4,
        POPUP = 5,
        OVERLAY = 6,
        WINDOW = 7,
        LAST_DEFINED = 8,
    }


    export namespace CoordType {
        export const $gtype: GObject.GType<CoordType>;
    }

    enum CoordType {
        SCREEN = 0,
        WINDOW = 1,
        PARENT = 2,
        LAST_DEFINED = 3,
    }


    export namespace EventType {
        export const $gtype: GObject.GType<EventType>;
    }

    enum EventType {
        KEY_PRESSED_EVENT = 0,
        KEY_RELEASED_EVENT = 1,
        BUTTON_PRESSED_EVENT = 2,
        BUTTON_RELEASED_EVENT = 3,
        EVENT_LAST_DEFINED = 4,
    }


    export namespace KeyEventType {
        export const $gtype: GObject.GType<KeyEventType>;
    }

    enum KeyEventType {
        PRESSED = 0,
        RELEASED = 1,
        EVENT_LAST_DEFINED = 2,
    }


    export namespace KeySynthType {
        export const $gtype: GObject.GType<KeySynthType>;
    }

    enum KeySynthType {
        PRESS = 0,
        RELEASE = 1,
        PRESSRELEASE = 2,
        SYM = 3,
        STRING = 4,
        LOCKMODIFIERS = 5,
        UNLOCKMODIFIERS = 6,
        SYNTH_LAST_DEFINED = 7,
    }


    export namespace Live {
        export const $gtype: GObject.GType<Live>;
    }

    enum Live {
        NONE = 0,
        POLITE = 1,
        ASSERTIVE = 2,
    }


    export namespace LocaleType {
        export const $gtype: GObject.GType<LocaleType>;
    }

    enum LocaleType {
        MESSAGES = 0,
        COLLATE = 1,
        CTYPE = 2,
        MONETARY = 3,
        NUMERIC = 4,
        TIME = 5,
        LAST_DEFINED = 6,
    }


    export namespace ModifierType {
        export const $gtype: GObject.GType<ModifierType>;
    }

    enum ModifierType {
        SHIFT = 0,
        SHIFTLOCK = 1,
        CONTROL = 2,
        ALT = 3,
        META = 4,
        META2 = 5,
        META3 = 6,
        SUPER = 6,
        NUMLOCK = 14,
    }


    export namespace RelationType {
        export const $gtype: GObject.GType<RelationType>;
    }

    enum RelationType {
        NULL = 0,
        LABEL_FOR = 1,
        LABELLED_BY = 2,
        CONTROLLER_FOR = 3,
        CONTROLLED_BY = 4,
        MEMBER_OF = 5,
        TOOLTIP_FOR = 6,
        NODE_CHILD_OF = 7,
        NODE_PARENT_OF = 8,
        EXTENDED = 9,
        FLOWS_TO = 10,
        FLOWS_FROM = 11,
        SUBWINDOW_OF = 12,
        EMBEDS = 13,
        EMBEDDED_BY = 14,
        POPUP_FOR = 15,
        PARENT_WINDOW_OF = 16,
        DESCRIPTION_FOR = 17,
        DESCRIBED_BY = 18,
        DETAILS = 19,
        DETAILS_FOR = 20,
        ERROR_MESSAGE = 21,
        ERROR_FOR = 22,
        LAST_DEFINED = 23,
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
        FOCUS_TRAVERSABLE = 21,
        FONT_CHOOSER = 22,
        FRAME = 23,
        GLASS_PANE = 24,
        HTML_CONTAINER = 25,
        ICON = 26,
        IMAGE = 27,
        INTERNAL_FRAME = 28,
        LABEL = 29,
        LAYERED_PANE = 30,
        LIST = 31,
        LIST_ITEM = 32,
        MENU = 33,
        MENU_BAR = 34,
        MENU_ITEM = 35,
        OPTION_PANE = 36,
        PAGE_TAB = 37,
        PAGE_TAB_LIST = 38,
        PANEL = 39,
        PASSWORD_TEXT = 40,
        POPUP_MENU = 41,
        PROGRESS_BAR = 42,
        BUTTON = 43,
        RADIO_BUTTON = 44,
        RADIO_MENU_ITEM = 45,
        ROOT_PANE = 46,
        ROW_HEADER = 47,
        SCROLL_BAR = 48,
        SCROLL_PANE = 49,
        SEPARATOR = 50,
        SLIDER = 51,
        SPIN_BUTTON = 52,
        SPLIT_PANE = 53,
        STATUS_BAR = 54,
        TABLE = 55,
        TABLE_CELL = 56,
        TABLE_COLUMN_HEADER = 57,
        TABLE_ROW_HEADER = 58,
        TEAROFF_MENU_ITEM = 59,
        TERMINAL = 60,
        TEXT = 61,
        TOGGLE_BUTTON = 62,
        TOOL_BAR = 63,
        TOOL_TIP = 64,
        TREE = 65,
        TREE_TABLE = 66,
        UNKNOWN = 67,
        VIEWPORT = 68,
        WINDOW = 69,
        EXTENDED = 70,
        HEADER = 71,
        FOOTER = 72,
        PARAGRAPH = 73,
        RULER = 74,
        APPLICATION = 75,
        AUTOCOMPLETE = 76,
        EDITBAR = 77,
        EMBEDDED = 78,
        ENTRY = 79,
        CHART = 80,
        CAPTION = 81,
        DOCUMENT_FRAME = 82,
        HEADING = 83,
        PAGE = 84,
        SECTION = 85,
        REDUNDANT_OBJECT = 86,
        FORM = 87,
        LINK = 88,
        INPUT_METHOD_WINDOW = 89,
        TABLE_ROW = 90,
        TREE_ITEM = 91,
        DOCUMENT_SPREADSHEET = 92,
        DOCUMENT_PRESENTATION = 93,
        DOCUMENT_TEXT = 94,
        DOCUMENT_WEB = 95,
        DOCUMENT_EMAIL = 96,
        COMMENT = 97,
        LIST_BOX = 98,
        GROUPING = 99,
        IMAGE_MAP = 100,
        NOTIFICATION = 101,
        INFO_BAR = 102,
        LEVEL_BAR = 103,
        TITLE_BAR = 104,
        BLOCK_QUOTE = 105,
        AUDIO = 106,
        VIDEO = 107,
        DEFINITION = 108,
        ARTICLE = 109,
        LANDMARK = 110,
        LOG = 111,
        MARQUEE = 112,
        MATH = 113,
        RATING = 114,
        TIMER = 115,
        STATIC = 116,
        MATH_FRACTION = 117,
        MATH_ROOT = 118,
        SUBSCRIPT = 119,
        SUPERSCRIPT = 120,
        DESCRIPTION_LIST = 121,
        DESCRIPTION_TERM = 122,
        DESCRIPTION_VALUE = 123,
        FOOTNOTE = 124,
        CONTENT_DELETION = 125,
        CONTENT_INSERTION = 126,
        MARK = 127,
        SUGGESTION = 128,
        PUSH_BUTTON_MENU = 129,
        SWITCH = 130,
        LAST_DEFINED = 131,
        PUSH_BUTTON = 43,
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
        LAST_DEFINED = 7,
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
        COLLAPSED = 5,
        DEFUNCT = 6,
        EDITABLE = 7,
        ENABLED = 8,
        EXPANDABLE = 9,
        EXPANDED = 10,
        FOCUSABLE = 11,
        FOCUSED = 12,
        HAS_TOOLTIP = 13,
        HORIZONTAL = 14,
        ICONIFIED = 15,
        MODAL = 16,
        MULTI_LINE = 17,
        MULTISELECTABLE = 18,
        OPAQUE = 19,
        PRESSED = 20,
        RESIZABLE = 21,
        SELECTABLE = 22,
        SELECTED = 23,
        SENSITIVE = 24,
        SHOWING = 25,
        SINGLE_LINE = 26,
        STALE = 27,
        TRANSIENT = 28,
        VERTICAL = 29,
        VISIBLE = 30,
        MANAGES_DESCENDANTS = 31,
        INDETERMINATE = 32,
        REQUIRED = 33,
        TRUNCATED = 34,
        ANIMATED = 35,
        INVALID_ENTRY = 36,
        SUPPORTS_AUTOCOMPLETION = 37,
        SELECTABLE_TEXT = 38,
        IS_DEFAULT = 39,
        VISITED = 40,
        CHECKABLE = 41,
        HAS_POPUP = 42,
        READ_ONLY = 43,
        LAST_DEFINED = 44,
        DEFAULT = 39,
    }


    export namespace TextBoundaryType {
        export const $gtype: GObject.GType<TextBoundaryType>;
    }

    enum TextBoundaryType {
        CHAR = 0,
        WORD_START = 1,
        WORD_END = 2,
        SENTENCE_START = 3,
        SENTENCE_END = 4,
        LINE_START = 5,
        LINE_END = 6,
        LAST_DEFINED = 7,
    }


    export namespace TextClipType {
        export const $gtype: GObject.GType<TextClipType>;
    }

    enum TextClipType {
        NONE = 0,
        MIN = 1,
        MAX = 2,
        BOTH = 3,
        LAST_DEFINED = 4,
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


    const ACCESSIBLE_VERSION: number;

    const ACTION_VERSION: number;

    const APPLICATION_VERSION: number;

    const CACHE_VERSION: number;

    const COLLECTION_VERSION: number;

    const COMPONENTLAYER_COUNT: number;

    const COMPONENT_VERSION: number;

    const COORD_TYPE_COUNT: number;

    const DBUS_INTERFACE_ACCESSIBLE: string;

    const DBUS_INTERFACE_ACTION: string;

    const DBUS_INTERFACE_APPLICATION: string;

    const DBUS_INTERFACE_CACHE: string;

    const DBUS_INTERFACE_COLLECTION: string;

    const DBUS_INTERFACE_COMPONENT: string;

    const DBUS_INTERFACE_DEC: string;

    const DBUS_INTERFACE_DEVICE_EVENT_LISTENER: string;

    const DBUS_INTERFACE_DOCUMENT: string;

    const DBUS_INTERFACE_EDITABLE_TEXT: string;

    const DBUS_INTERFACE_EVENT_KEYBOARD: string;

    const DBUS_INTERFACE_EVENT_MOUSE: string;

    const DBUS_INTERFACE_EVENT_OBJECT: string;

    const DBUS_INTERFACE_EVENT_SCREEN_READER: string;

    const DBUS_INTERFACE_HYPERLINK: string;

    const DBUS_INTERFACE_HYPERTEXT: string;

    const DBUS_INTERFACE_IMAGE: string;

    const DBUS_INTERFACE_KEYBOARD_MONITOR: string;

    const DBUS_INTERFACE_POINTER_LOCATOR: string;

    const DBUS_INTERFACE_REGISTRY: string;

    const DBUS_INTERFACE_SELECTION: string;

    const DBUS_INTERFACE_SOCKET: string;

    const DBUS_INTERFACE_TABLE: string;

    const DBUS_INTERFACE_TABLE_CELL: string;

    const DBUS_INTERFACE_TEXT: string;

    const DBUS_INTERFACE_VALUE: string;

    const DBUS_NAME_A11Y_MANAGER: string;

    const DBUS_NAME_REGISTRY: string;

    const DBUS_PATH_A11Y_MANAGER: string;

    const DBUS_PATH_DEC: string;

    const DBUS_PATH_NULL: string;

    const DBUS_PATH_REGISTRY: string;

    const DBUS_PATH_ROOT: string;

    const DBUS_PATH_SCREEN_READER: string;

    const DEVICE_A11Y_MANAGER_VIRTUAL_MOD_END: number;

    const DEVICE_A11Y_MANAGER_VIRTUAL_MOD_START: number;

    const DEVICE_EVENT_CONTROLLER_VERSION: number;

    const DEVICE_EVENT_LISTENER_VERSION: number;

    const DOCUMENT_VERSION: number;

    const EDITABLE_TEXT_VERSION: number;

    const EVENTTYPE_COUNT: number;

    const EVENT_VERSION: number;

    const HYPERLINK_VERSION: number;

    const HYPERTEXT_VERSION: number;

    const IMAGE_VERSION: number;

    const KEYEVENTTYPE_COUNT: number;

    const KEYSYNTHTYPE_COUNT: number;

    const LOCALE_TYPE_COUNT: number;

    const MATCHTYPES_COUNT: number;

    const MAX_CHILDREN: number;

    const MODIFIERTYPE_COUNT: number;

    const REGISTRY_VERSION: number;

    const RELATIONTYPE_COUNT: number;

    const ROLE_COUNT: number;

    const SCROLLTYPE_COUNT: number;

    const SELECTION_VERSION: number;

    const SOCKET_VERSION: number;

    const SORTORDER_COUNT: number;

    const STATETYPE_COUNT: number;

    const TABLE_CELL_VERSION: number;

    const TABLE_VERSION: number;

    const TEXT_BOUNDARY_TYPE_COUNT: number;

    const TEXT_CLIP_TYPE_COUNT: number;

    const TEXT_VERSION: number;

    const TREETRAVERSALTYPE_COUNT: number;

    const VALUE_VERSION: number;

    function deregister_device_event_listener(listener: DeviceListener, filter: null): boolean;

    function deregister_keystroke_listener(listener: DeviceListener, key_set: KeyDefinition[] | null, modmask: KeyMaskType, event_types: KeyEventMask): boolean;

    function event_main(): void;

    function event_quit(): void;

    function exit(): number;

    function generate_keyboard_event(keyval: bigint | number, keystring: string | null, synth_type: KeySynthType): boolean;

    function generate_mouse_event(x: bigint | number, y: bigint | number, name: string): boolean;

    function generate_mouse_event_async(x: bigint | number, y: bigint | number, name: string, callback: GenerateMouseEventCB): void;

    function get_desktop(i: number): Accessible;

    function get_desktop_count(): number;

    function get_desktop_list(): Accessible[];

    function get_version(): [number, number, number];

    function init(): number;

    function is_initialized(): boolean;

    function register_device_event_listener(listener: DeviceListener, event_types: DeviceEventMask, filter: null): boolean;

    function register_keystroke_listener(listener: DeviceListener, key_set: KeyDefinition[] | null, modmask: KeyMaskType, event_types: KeyEventMask, sync_type: KeyListenerSyncType): boolean;

    function role_get_localized_name(role: Role): string;

    function role_get_name(role: Role): string;

    function set_g_main_loop_reentrancy(enabled: boolean): void;

    function set_main_context(cnx: GLib.MainContext): void;

    function set_reference_window(accessible: Accessible): void;

    function set_timeout(val: number, startup_time: number): void;

    interface DeviceListenerCB {
        (stroke: DeviceEvent): boolean;
    }

    interface DeviceListenerSimpleCB {
        (stroke: DeviceEvent): boolean;
    }

    interface EventListenerCB {
        (event: Event): void;
    }

    interface EventListenerSimpleCB {
        (event: Event): void;
    }

    interface GenerateMouseEventCB {
        (user_data: null): void;
    }

    interface KeyCallback {
        (device: Device, pressed: boolean, keycode: number, keysym: number, modifiers: number, keystring: string): void;
    }

    export namespace Cache {
        export const $gtype: GObject.GType<Cache>;
    }

    enum Cache {
        NONE = 0,
        PARENT = 1,
        CHILDREN = 2,
        NAME = 4,
        DESCRIPTION = 8,
        STATES = 16,
        ROLE = 32,
        INTERFACES = 64,
        ATTRIBUTES = 128,
        ALL = 1073741823,
        DEFAULT = 127,
        UNDEFINED = 1073741824,
    }


    export namespace DeviceCapability {
        export const $gtype: GObject.GType<DeviceCapability>;
    }

    enum DeviceCapability {
        KEYBOARD_MONITOR = 1,
        KEYBOARD_SYNTH = 2,
        KEYBOARD_GRAB = 4,
        POINTER_MONITOR = 8,
        POINTER_SYNTH = 16,
        TOUCH_MONITOR = 32,
        TOUCH_SYNTH = 64,
    }


    export namespace KeyListenerSyncType {
        export const $gtype: GObject.GType<KeyListenerSyncType>;
    }

    enum KeyListenerSyncType {
        NOSYNC = 0,
        SYNCHRONOUS = 1,
        CANCONSUME = 2,
        ALL_WINDOWS = 4,
    }


    namespace Accessible {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {
            /** @signal */
            "mode-changed": (arg1: number, why: string) => void;
            /** @signal */
            "region-changed": (arg1: number, arg2: number) => void;
            [key: `mode-changed::${string}`]: (arg1: number, why: string) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps, Action.ConstructorProps, Collection.ConstructorProps, Component.ConstructorProps, Document.ConstructorProps, EditableText.ConstructorProps, Hypertext.ConstructorProps, Image.ConstructorProps, Selection.ConstructorProps, Table.ConstructorProps, TableCell.ConstructorProps, Text.ConstructorProps, Value.ConstructorProps {}
    }

    class Accessible extends Object implements Action, Collection, Component, Document, EditableText, Hypertext, Image, Selection, Table, TableCell, Text, Value {
        static $gtype: GObject.GType<Accessible>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Accessible.SignalSignatures;

        // Fields
        accessible_parent: Accessible;

        children: null[];

        role: Role;

        interfaces: number;

        name: string;

        description: string;

        states: StateSet;

        cached_properties: number;

        // Constructors
        constructor(properties?: Partial<Accessible.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Accessible.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Accessible.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Accessible.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Accessible.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Accessible.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Accessible.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_mode_changed(enabled: boolean): void;

        vfunc_region_changed(current_offset: number, last_offset: number): void;

        // Methods
        clear_cache(): void;

        clear_cache_single(): void;

        get_accessible_id(): string;

        get_action(): Action;

        get_action_iface(): Action;

        get_application(): Accessible;

        get_atspi_version(): string;

        get_attributes(): { [key: string]: string };

        get_attributes_as_array(): string[];

        get_child_at_index(child_index: number): Accessible;

        get_child_count(): number;

        get_collection(): Collection;

        get_collection_iface(): Collection;

        get_component(): Component;

        get_component_iface(): Component;

        get_description(): string;

        get_document(): Document;

        get_document_iface(): Document;

        get_editable_text(): EditableText;

        get_editable_text_iface(): EditableText;

        get_help_text(): string;

        get_hyperlink(): Hyperlink;

        get_hypertext(): Hypertext;

        get_hypertext_iface(): Hypertext;

        get_id(): number;

        get_image(): Image;

        get_image_iface(): Image;

        get_index_in_parent(): number;

        get_interfaces(): string[];

        get_localized_role_name(): string;

        get_name(): string;

        get_object_locale(): string;

        get_parent(): Accessible | null;

        get_process_id(): number;

        get_relation_set(): Relation[];

        get_role(): Role;

        get_role_name(): string;

        get_selection(): Selection;

    // Conflicted with Atspi.Text.get_selection
        get_selection(...args: never[]): any;

        get_selection_iface(): Selection;

        get_state_set(): StateSet;

        get_table(): Table;

    // Conflicted with Atspi.TableCell.get_table
        get_table(...args: never[]): any;

        get_table_cell(): TableCell;

        get_table_iface(): Table;

        get_text(): Text;

    // Conflicted with Atspi.Text.get_text
        get_text(...args: never[]): any;

        get_text_iface(): Text;

        get_toolkit_name(): string;

        get_toolkit_version(): string;

        get_value(): Value;

        get_value_iface(): Value;

        is_action(): boolean;

        is_application(): boolean;

        is_collection(): boolean;

        is_component(): boolean;

        is_document(): boolean;

        is_editable_text(): boolean;

        is_hyperlink(): boolean;

        is_hypertext(): boolean;

        is_image(): boolean;

        is_selection(): boolean;

        is_table(): boolean;

        is_table_cell(): boolean;

        is_text(): boolean;

        is_value(): boolean;

        set_cache_mask(mask: Cache): void;

        do_action(i: number): boolean;

        get_action_description(i: number): string;

        get_key_binding(i: number): string;

        get_localized_name(i: number): string;

        get_n_actions(): number;

        get_action_name(i: number): string;

        get_active_descendant(): Accessible;

        get_matches(rule: MatchRule, sortby: CollectionSortOrder, count: number, traverse: boolean): Accessible[];

        get_matches_from(current_object: Accessible, rule: MatchRule, sortby: CollectionSortOrder, tree: CollectionTreeTraversalType, count: number, traverse: boolean): Accessible[];

        get_matches_to(current_object: Accessible, rule: MatchRule, sortby: CollectionSortOrder, tree: CollectionTreeTraversalType, limit_scope: boolean, count: number, traverse: boolean): Accessible[];

        is_ancestor_of(test: Accessible): boolean;

        contains(x: number, y: number, ctype: CoordType): boolean;

        get_accessible_at_point(x: number, y: number, ctype: CoordType): Accessible | null;

        get_alpha(): number;

        get_extents(ctype: CoordType): Rect;

        get_layer(): ComponentLayer;

        get_mdi_z_order(): number;

        get_position(ctype: CoordType): Point;

        // Conflicted with Atspi.TableCell.get_position
        get_position(...args: never[]): any;

        get_size(): Point;

        grab_focus(): boolean;

        scroll_to(type: ScrollType): boolean;

        scroll_to_point(coords: CoordType, x: number, y: number): boolean;

        set_extents(x: number, y: number, width: number, height: number, ctype: CoordType): boolean;

        set_position(x: number, y: number, ctype: CoordType): boolean;

        set_size(width: number, height: number): boolean;

        get_document_attribute_value(attribute: string): string;

        get_document_attributes(): { [key: string]: string };

        get_current_page_number(): number;

        get_locale(): string;

        get_page_count(): number;

        get_text_selections(): TextSelection[];

        set_text_selections(selections: TextSelection[]): boolean;

        copy_text(start_pos: number, end_pos: number): boolean;

        cut_text(start_pos: number, end_pos: number): boolean;

        delete_text(start_pos: number, end_pos: number): boolean;

        insert_text(position: number, text: string, length: number): boolean;

        paste_text(position: number): boolean;

        set_text_contents(new_contents: string): boolean;

        get_link(link_index: number): Hyperlink | null;

        get_link_index(character_offset: number): number;

        get_n_links(): number;

        get_image_description(): string;

        get_image_extents(ctype: CoordType): Rect;

        get_image_locale(): string;

        get_image_position(ctype: CoordType): Point;

        get_image_size(): Point;

        clear_selection(): boolean;

        deselect_child(child_index: number): boolean;

        deselect_selected_child(selected_child_index: number): boolean;

        get_n_selected_children(): number;

        get_selected_child(selected_child_index: number): Accessible;

        is_child_selected(child_index: number): boolean;

        select_all(): boolean;

        select_child(child_index: number): boolean;

        add_column_selection(column: number): boolean;

        add_row_selection(row: number): boolean;

        get_accessible_at(row: number, column: number): Accessible;

        get_caption(): Accessible;

        get_column_at_index(index: number): number;

        get_column_description(column: number): string;

        get_column_extent_at(row: number, column: number): number;

        get_column_header(column: number): Accessible;

        get_index_at(row: number, column: number): number;

        get_n_columns(): number;

        get_n_rows(): number;

        get_n_selected_columns(): number;

        get_n_selected_rows(): number;

        get_row_at_index(index: number): number;

        get_row_column_extents_at_index(index: number): [boolean, number, number, number, number, boolean];

        get_row_description(row: number): string;

        get_row_extent_at(row: number, column: number): number;

        get_row_header(row: number): Accessible;

        get_selected_columns(): number[];

        get_selected_rows(): number[];

        get_summary(): Accessible;

        is_column_selected(column: number): boolean;

        is_row_selected(row: number): boolean;

        is_selected(row: number, column: number): boolean;

        remove_column_selection(column: number): boolean;

        remove_row_selection(row: number): boolean;

        get_column_header_cells(): Accessible[];

        get_column_index(): number;

        get_column_span(): number;

        get_row_column_span(): [number, number, number, number];

        get_row_header_cells(): Accessible[];

        get_row_span(): number;

        add_selection(start_offset: number, end_offset: number): boolean;

        get_attribute_run(offset: number, include_defaults: boolean): [{ [key: string]: string }, number, number];

        get_text_attribute_value(offset: number, attribute_name: string): string | null;

        get_text_attributes(offset: number): [{ [key: string]: string }, number, number];

        get_bounded_ranges(x: number, y: number, width: number, height: number, type: CoordType, clipTypeX: TextClipType, clipTypeY: TextClipType): TextRange[];

        get_caret_offset(): number;

        get_character_at_offset(offset: number): number;

        get_character_count(): number;

        get_character_extents(offset: number, type: CoordType): Rect;

        get_default_attributes(): { [key: string]: string };

        get_n_selections(): number;

        get_offset_at_point(x: number, y: number, type: CoordType): number;

        get_range_extents(start_offset: number, end_offset: number, type: CoordType): Rect;

        get_string_at_offset(offset: number, granularity: TextGranularity): TextRange;

        get_text_after_offset(offset: number, type: TextBoundaryType): TextRange;

        get_text_at_offset(offset: number, type: TextBoundaryType): TextRange;

        get_text_before_offset(offset: number, type: TextBoundaryType): TextRange;

        remove_selection(selection_num: number): boolean;

        scroll_substring_to(start_offset: number, end_offset: number, type: ScrollType): boolean;

        scroll_substring_to_point(start_offset: number, end_offset: number, coords: CoordType, x: number, y: number): boolean;

        set_caret_offset(new_offset: number): boolean;

        set_selection(selection_num: number, start_offset: number, end_offset: number): boolean;

        get_current_value(): number;

        get_maximum_value(): number;

        get_minimum_increment(): number;

        get_minimum_value(): number;

        set_current_value(new_value: number): boolean;
    }


    namespace Application {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Application extends GObject.Object {
        static $gtype: GObject.GType<Application>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Application.SignalSignatures;

        // Fields
        bus_name: string;

        root: null;

        cache: Cache;

        toolkit_name: string;

        toolkit_version: string;

        atspi_version: string;

        time_added: null;

        pid: never;

        get_items_finished: boolean;

        // Constructors
        constructor(properties?: Partial<Application.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Application.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Application.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Application.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Application.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Application.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Application.SignalSignatures[K]>): void;
    }


    namespace Device {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "key-pressed": (object: number, p0: number, p1: ModifierType, p2: string) => void;
            /** @signal */
            "key-released": (object: number, p0: number, p1: ModifierType, p2: string) => void;
            /** @signal */
            "pointer-moved": (accessible: Accessible, x: number, y: number) => void;
            "notify::app-id": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            app_id: string;
            appId: string;
        }
    }

    class Device extends GObject.Object {
        static $gtype: GObject.GType<Device>;

        // Properties
        get app_id(): string;

        get appId(): string;

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

        static ["new"](): Device;

        static new_full(app_id: string | null): Device;

        // Signals
        /** @signal */
        connect<K extends keyof Device.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Device.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Device.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Device.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Device.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Device.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_add_key_grab(kd: KeyDefinition): boolean;

        vfunc_generate_mouse_event(obj: Accessible, x: number, y: number, name: string): void;

        vfunc_get_capabilities(): DeviceCapability;

        vfunc_get_keysym_modifier(keysym: number): number;

        vfunc_get_locked_modifiers(): number;

        vfunc_get_modifier(keycode: number): number;

        vfunc_grab_keyboard(): boolean;

        vfunc_map_keysym_modifier(keysym: number): number;

        vfunc_map_modifier(keycode: number): number;

        vfunc_remove_key_grab(id: number): void;

        vfunc_set_capabilities(capabilities: DeviceCapability): DeviceCapability;

        vfunc_ungrab_keyboard(): void;

        vfunc_unmap_keysym_modifier(keysym: number): void;

        vfunc_unmap_modifier(keycode: number): void;

        // Methods
        add_key_grab(kd: KeyDefinition, callback: KeyCallback | null): number;

        add_key_watcher(callback: KeyCallback): void;

        clear_key_grabs(): void;

        generate_mouse_event(obj: Accessible, x: number, y: number, name: string): void;

        get_app_id(): string;

        get_capabilities(): DeviceCapability;

        get_grab_by_id(id: number): KeyDefinition;

        get_keysym_modifier(keysym: number): number;

        get_locked_modifiers(): number;

        get_modifier(keycode: number): number;

        grab_keyboard(): boolean;

        map_keysym_modifier(keysym: number): number;

        map_modifier(keycode: number): number;

        notify_key(pressed: boolean, keycode: number, keysym: number, state: number, text: string): boolean;

        remove_key_grab(id: number): void;

        set_app_id(app_id: string): void;

        set_capabilities(capabilities: DeviceCapability): DeviceCapability;

        ungrab_keyboard(): void;

        unmap_keysym_modifier(keysym: number): void;

        unmap_modifier(keycode: number): void;
    }


    namespace DeviceA11yManager {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::app-id": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {}
    }

    class DeviceA11yManager extends Device {
        static $gtype: GObject.GType<DeviceA11yManager>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceA11yManager.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceA11yManager.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static try_new(): DeviceA11yManager;

        static try_new_full(app_id: string | null): DeviceA11yManager;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceA11yManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceA11yManager.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceA11yManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceA11yManager.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceA11yManager.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceA11yManager.SignalSignatures[K]>): void;
    }


    namespace DeviceLegacy {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::app-id": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {}
    }

    class DeviceLegacy extends Device {
        static $gtype: GObject.GType<DeviceLegacy>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceLegacy.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceLegacy.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): DeviceLegacy;

        static new_full(app_id: string | null): DeviceLegacy;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceLegacy.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceLegacy.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceLegacy.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceLegacy.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceLegacy.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceLegacy.SignalSignatures[K]>): void;
    }


    namespace DeviceListener {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class DeviceListener extends GObject.Object {
        static $gtype: GObject.GType<DeviceListener>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceListener.SignalSignatures;

        // Fields
        id: number;

        callbacks: null[];

        // Constructors
        constructor(properties?: Partial<DeviceListener.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](callback: DeviceListenerCB | null): DeviceListener;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceListener.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceListener.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceListener.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceListener.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceListener.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceListener.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_device_event(event: DeviceEvent): boolean;

        // Methods
        add_callback(callback: DeviceListenerCB): void;

        remove_callback(callback: DeviceListenerCB): void;
    }


    namespace DeviceX11 {
        // Signal signatures
        interface SignalSignatures extends Device.SignalSignatures {
            "notify::app-id": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {}
    }

    class DeviceX11 extends Device {
        static $gtype: GObject.GType<DeviceX11>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceX11.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceX11.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): DeviceX11;

        static new_full(app_id: string | null): DeviceX11;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceX11.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceX11.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceX11.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceX11.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceX11.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceX11.SignalSignatures[K]>): void;
    }


    namespace EventListener {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class EventListener extends GObject.Object {
        static $gtype: GObject.GType<EventListener>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: EventListener.SignalSignatures;

        // Fields
        callback: EventListenerCB;

        user_data: null;

        cb_destroyed: GLib.DestroyNotify;

        // Constructors
        constructor(properties?: Partial<EventListener.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](callback: EventListenerCB): EventListener;

        // Signals
        /** @signal */
        connect<K extends keyof EventListener.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, EventListener.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof EventListener.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, EventListener.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof EventListener.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<EventListener.SignalSignatures[K]>): void;

        // Static methods
        static deregister_from_callback(callback: EventListenerCB, event_type: string): boolean;

        static register_from_callback(callback: EventListenerCB, event_type: string): boolean;

        static register_from_callback_full(callback: EventListenerCB, event_type: string, properties: string[]): boolean;

        static register_from_callback_with_app(callback: EventListenerCB, event_type: string, properties: string[], app: Accessible | null): boolean;

        // Methods
        deregister(event_type: string): boolean;

        register(event_type: string): boolean;

        register_full(event_type: string, properties: string[] | null): boolean;

        register_with_app(event_type: string, properties: string[] | null, app: Accessible | null): boolean;
    }


    namespace Hyperlink {
        // Signal signatures
        interface SignalSignatures extends Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends Object.ConstructorProps {}
    }

    class Hyperlink extends Object {
        static $gtype: GObject.GType<Hyperlink>;

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

        // Methods
        get_end_index(): number;

        get_index_range(): Range;

        get_n_anchors(): number;

        get_object(i: number): Accessible;

        get_start_index(): number;

        get_uri(i: number): string;

        is_valid(): boolean;
    }


    namespace MatchRule {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class MatchRule extends GObject.Object {
        static $gtype: GObject.GType<MatchRule>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MatchRule.SignalSignatures;

        // Fields
        states: StateSet;

        statematchtype: CollectionMatchType;

        attributematchtype: CollectionMatchType;

        interfaces: null[];

        interfacematchtype: CollectionMatchType;

        roles: number[];

        rolematchtype: CollectionMatchType;

        invert: boolean;

        // Constructors
        constructor(properties?: Partial<MatchRule.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](states: StateSet | null, statematchtype: CollectionMatchType, attributes: { [key: string]: string } | null, attributematchtype: CollectionMatchType, roles: Role[] | null, rolematchtype: CollectionMatchType, interfaces: string[] | null, interfacematchtype: CollectionMatchType, invert: boolean): MatchRule;

        // Signals
        /** @signal */
        connect<K extends keyof MatchRule.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MatchRule.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MatchRule.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MatchRule.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MatchRule.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MatchRule.SignalSignatures[K]>): void;
    }


    namespace Object {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Object extends GObject.Object {
        static $gtype: GObject.GType<Object>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Object.SignalSignatures;

        // Fields
        app: Application;

        path: string;

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
    }


    namespace Relation {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Relation extends GObject.Object {
        static $gtype: GObject.GType<Relation>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Relation.SignalSignatures;

        // Fields
        relation_type: RelationType;

        targets: null[];

        // Constructors
        constructor(properties?: Partial<Relation.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Relation.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Relation.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Relation.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Relation.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Relation.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Relation.SignalSignatures[K]>): void;

        // Methods
        get_n_targets(): number;

        get_relation_type(): RelationType;

        get_target(i: number): Accessible;
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

        // Fields
        accessible: null;

        states: number;

        // Constructors
        constructor(properties?: Partial<StateSet.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](states: StateType[]): StateSet;

        // Signals
        /** @signal */
        connect<K extends keyof StateSet.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StateSet.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof StateSet.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StateSet.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof StateSet.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<StateSet.SignalSignatures[K]>): void;

        // Methods
        add(state: StateType): void;

        compare(set2: StateSet): StateSet;

        contains(state: StateType): boolean;

        equals(set2: StateSet): boolean;

        get_states(): StateType[];

        is_empty(): boolean;

        remove(state: StateType): void;

        set_by_name(name: string, enabled: boolean): void;
    }


    type AccessibleClass = typeof Accessible;

    abstract class AccessiblePrivate {
        static $gtype: GObject.GType<AccessiblePrivate>;
    }


    type ApplicationClass = typeof Application;

    type DeviceA11yManagerClass = typeof DeviceA11yManager;

    type DeviceClass = typeof Device;

    class DeviceEvent {
        static $gtype: GObject.GType<DeviceEvent>;

        // Fields
        type: EventType;

        id: number;

        hw_code: number;

        modifiers: number;

        timestamp: number;

        event_string: string;

        is_text: boolean;
    }


    type DeviceLegacyClass = typeof DeviceLegacy;

    type DeviceListenerClass = typeof DeviceListener;

    type DeviceX11Class = typeof DeviceX11;

    class Event {
        static $gtype: GObject.GType<Event>;

        // Fields
        type: string;

        source: Accessible;

        detail1: number;

        detail2: number;

        sender: Accessible;

        // Static methods
        static main(): void;

        static quit(): void;
    }


    type EventListenerClass = typeof EventListener;

    class EventListenerMode {
        static $gtype: GObject.GType<EventListenerMode>;

        // Fields
        synchronous: boolean;

        preemptive: boolean;

        global: boolean;

        // Constructors

        constructor(properties?: Partial<{
            synchronous: boolean;
            preemptive: boolean;
            global: boolean;
        }>);
    }


    type HyperlinkClass = typeof Hyperlink;

    class KeyDefinition {
        static $gtype: GObject.GType<KeyDefinition>;

        // Fields
        keycode: number;

        keysym: number;

        keystring: string;

        modifiers: number;

        // Constructors

        constructor(properties?: Partial<{
            keycode: number;
            keysym: number;
            keystring: string;
            modifiers: number;
        }>);
    }


    class KeySet {
        static $gtype: GObject.GType<KeySet>;

        // Fields
        keysyms: number;

        keycodes: number;

        keystrings: string;

        len: number;

        // Constructors

        constructor(properties?: Partial<{
            keysyms: number;
            keycodes: number;
            keystrings: string;
            len: number;
        }>);
    }


    type MatchRuleClass = typeof MatchRule;

    type ObjectClass = typeof Object;

    class Point {
        static $gtype: GObject.GType<Point>;

        // Fields
        x: number;

        y: number;

        // Constructors

        constructor(properties?: Partial<{
            x: number;
            y: number;
        }>);

        // Methods
        copy(): Point;
    }


    class Range {
        static $gtype: GObject.GType<Range>;

        // Fields
        start_offset: number;

        end_offset: number;

        // Constructors

        constructor(properties?: Partial<{
            start_offset: number;
            end_offset: number;
        }>);

        // Methods
        copy(): Range;
    }


    class Rect {
        static $gtype: GObject.GType<Rect>;

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

        // Methods
        copy(): Rect;
    }


    type RelationClass = typeof Relation;

    type StateSetClass = typeof StateSet;

    class TextRange {
        static $gtype: GObject.GType<TextRange>;

        // Fields
        start_offset: number;

        end_offset: number;

        content: string;

        // Constructors

        constructor(properties?: Partial<{
            start_offset: number;
            end_offset: number;
            content: string;
        }>);
    }


    class TextSelection {
        static $gtype: GObject.GType<TextSelection>;

        // Fields
        start_object: Accessible;

        start_offset: number;

        end_object: Accessible;

        end_offset: number;

        start_is_active: boolean;
    }


    namespace Action {

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ActionNamespace {
        $gtype: GObject.GType<Action>;
        prototype: Action;
    }
    interface Action extends GObject.Object {

        // Methods
        do_action(i: number): boolean;

        get_action_description(i: number): string;

        get_key_binding(i: number): string;

        get_localized_name(i: number): string;

        get_n_actions(): number;

        get_action_name(i: number): string;
    }


    export const Action: ActionNamespace & {
        new (): Action; // This allows `obj instanceof Action`
    };

    namespace Collection {

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface CollectionNamespace {
        $gtype: GObject.GType<Collection>;
        prototype: Collection;
    }
    interface Collection extends GObject.Object {

        // Methods
        get_active_descendant(): Accessible;

        get_matches(rule: MatchRule, sortby: CollectionSortOrder, count: number, traverse: boolean): Accessible[];

        get_matches_from(current_object: Accessible, rule: MatchRule, sortby: CollectionSortOrder, tree: CollectionTreeTraversalType, count: number, traverse: boolean): Accessible[];

        get_matches_to(current_object: Accessible, rule: MatchRule, sortby: CollectionSortOrder, tree: CollectionTreeTraversalType, limit_scope: boolean, count: number, traverse: boolean): Accessible[];

        is_ancestor_of(test: Accessible): boolean;
    }


    export const Collection: CollectionNamespace & {
        new (): Collection; // This allows `obj instanceof Collection`
    };

    namespace Component {

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ComponentNamespace {
        $gtype: GObject.GType<Component>;
        prototype: Component;
    }
    interface Component extends GObject.Object {

        // Methods
        contains(x: number, y: number, ctype: CoordType): boolean;

        get_accessible_at_point(x: number, y: number, ctype: CoordType): Accessible | null;

        get_alpha(): number;

        get_extents(ctype: CoordType): Rect;

        get_layer(): ComponentLayer;

        get_mdi_z_order(): number;

        get_position(ctype: CoordType): Point;

        get_size(): Point;

        grab_focus(): boolean;

        scroll_to(type: ScrollType): boolean;

        scroll_to_point(coords: CoordType, x: number, y: number): boolean;

        set_extents(x: number, y: number, width: number, height: number, ctype: CoordType): boolean;

        set_position(x: number, y: number, ctype: CoordType): boolean;

        set_size(width: number, height: number): boolean;
    }


    export const Component: ComponentNamespace & {
        new (): Component; // This allows `obj instanceof Component`
    };

    namespace Document {

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface DocumentNamespace {
        $gtype: GObject.GType<Document>;
        prototype: Document;
    }
    interface Document extends GObject.Object {

        // Methods
        get_document_attribute_value(attribute: string): string;

        get_document_attributes(): { [key: string]: string };

        get_current_page_number(): number;

        get_locale(): string;

        get_page_count(): number;

        get_text_selections(): TextSelection[];

        set_text_selections(selections: TextSelection[]): boolean;
    }


    export const Document: DocumentNamespace & {
        new (): Document; // This allows `obj instanceof Document`
    };

    namespace EditableText {

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface EditableTextNamespace {
        $gtype: GObject.GType<EditableText>;
        prototype: EditableText;
    }
    interface EditableText extends GObject.Object {

        // Methods
        copy_text(start_pos: number, end_pos: number): boolean;

        cut_text(start_pos: number, end_pos: number): boolean;

        delete_text(start_pos: number, end_pos: number): boolean;

        insert_text(position: number, text: string, length: number): boolean;

        paste_text(position: number): boolean;

        set_text_contents(new_contents: string): boolean;
    }


    export const EditableText: EditableTextNamespace & {
        new (): EditableText; // This allows `obj instanceof EditableText`
    };

    namespace Hypertext {

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface HypertextNamespace {
        $gtype: GObject.GType<Hypertext>;
        prototype: Hypertext;
    }
    interface Hypertext extends GObject.Object {

        // Methods
        get_link(link_index: number): Hyperlink | null;

        get_link_index(character_offset: number): number;

        get_n_links(): number;
    }


    export const Hypertext: HypertextNamespace & {
        new (): Hypertext; // This allows `obj instanceof Hypertext`
    };

    namespace Image {

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ImageNamespace {
        $gtype: GObject.GType<Image>;
        prototype: Image;
    }
    interface Image extends GObject.Object {

        // Methods
        get_image_description(): string;

        get_image_extents(ctype: CoordType): Rect;

        get_image_locale(): string;

        get_image_position(ctype: CoordType): Point;

        get_image_size(): Point;
    }


    export const Image: ImageNamespace & {
        new (): Image; // This allows `obj instanceof Image`
    };

    namespace Selection {

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface SelectionNamespace {
        $gtype: GObject.GType<Selection>;
        prototype: Selection;
    }
    interface Selection extends GObject.Object {

        // Methods
        clear_selection(): boolean;

        deselect_child(child_index: number): boolean;

        deselect_selected_child(selected_child_index: number): boolean;

        get_n_selected_children(): number;

        get_selected_child(selected_child_index: number): Accessible;

        is_child_selected(child_index: number): boolean;

        select_all(): boolean;

        select_child(child_index: number): boolean;
    }


    export const Selection: SelectionNamespace & {
        new (): Selection; // This allows `obj instanceof Selection`
    };

    namespace Table {

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface TableNamespace {
        $gtype: GObject.GType<Table>;
        prototype: Table;
    }
    interface Table extends GObject.Object {

        // Methods
        add_column_selection(column: number): boolean;

        add_row_selection(row: number): boolean;

        get_accessible_at(row: number, column: number): Accessible;

        get_caption(): Accessible;

        get_column_at_index(index: number): number;

        get_column_description(column: number): string;

        get_column_extent_at(row: number, column: number): number;

        get_column_header(column: number): Accessible;

        get_index_at(row: number, column: number): number;

        get_n_columns(): number;

        get_n_rows(): number;

        get_n_selected_columns(): number;

        get_n_selected_rows(): number;

        get_row_at_index(index: number): number;

        get_row_column_extents_at_index(index: number): [boolean, number, number, number, number, boolean];

        get_row_description(row: number): string;

        get_row_extent_at(row: number, column: number): number;

        get_row_header(row: number): Accessible;

        get_selected_columns(): number[];

        get_selected_rows(): number[];

        get_summary(): Accessible;

        is_column_selected(column: number): boolean;

        is_row_selected(row: number): boolean;

        is_selected(row: number, column: number): boolean;

        remove_column_selection(column: number): boolean;

        remove_row_selection(row: number): boolean;
    }


    export const Table: TableNamespace & {
        new (): Table; // This allows `obj instanceof Table`
    };

    namespace TableCell {

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface TableCellNamespace {
        $gtype: GObject.GType<TableCell>;
        prototype: TableCell;
    }
    interface TableCell extends GObject.Object {

        // Methods
        get_column_header_cells(): Accessible[];

        get_column_index(): number;

        get_column_span(): number;

        get_position(): [number, number, number];

        get_row_column_span(): [number, number, number, number];

        get_row_header_cells(): Accessible[];

        get_row_span(): number;

        get_table(): Accessible;
    }


    export const TableCell: TableCellNamespace & {
        new (): TableCell; // This allows `obj instanceof TableCell`
    };

    namespace Text {

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface TextNamespace {
        $gtype: GObject.GType<Text>;
        prototype: Text;
    }
    interface Text extends GObject.Object {

        // Methods
        add_selection(start_offset: number, end_offset: number): boolean;

        get_attribute_run(offset: number, include_defaults: boolean): [{ [key: string]: string }, number, number];

        get_text_attribute_value(offset: number, attribute_name: string): string | null;

        get_text_attributes(offset: number): [{ [key: string]: string }, number, number];

        get_bounded_ranges(x: number, y: number, width: number, height: number, type: CoordType, clipTypeX: TextClipType, clipTypeY: TextClipType): TextRange[];

        get_caret_offset(): number;

        get_character_at_offset(offset: number): number;

        get_character_count(): number;

        get_character_extents(offset: number, type: CoordType): Rect;

        get_default_attributes(): { [key: string]: string };

        get_n_selections(): number;

        get_offset_at_point(x: number, y: number, type: CoordType): number;

        get_range_extents(start_offset: number, end_offset: number, type: CoordType): Rect;

        get_selection(selection_num: number): Range;

        get_string_at_offset(offset: number, granularity: TextGranularity): TextRange;

        get_text(start_offset: number, end_offset: number): string;

        get_text_after_offset(offset: number, type: TextBoundaryType): TextRange;

        get_text_at_offset(offset: number, type: TextBoundaryType): TextRange;

        get_text_before_offset(offset: number, type: TextBoundaryType): TextRange;

        remove_selection(selection_num: number): boolean;

        scroll_substring_to(start_offset: number, end_offset: number, type: ScrollType): boolean;

        scroll_substring_to_point(start_offset: number, end_offset: number, coords: CoordType, x: number, y: number): boolean;

        set_caret_offset(new_offset: number): boolean;

        set_selection(selection_num: number, start_offset: number, end_offset: number): boolean;
    }


    export const Text: TextNamespace & {
        new (): Text; // This allows `obj instanceof Text`
    };

    namespace Value {

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ValueNamespace {
        $gtype: GObject.GType<Value>;
        prototype: Value;
    }
    interface Value extends GObject.Object {

        // Methods
        get_current_value(): number;

        get_maximum_value(): number;

        get_minimum_increment(): number;

        get_minimum_value(): number;

        get_text(): string;

        set_current_value(new_value: number): boolean;
    }


    export const Value: ValueNamespace & {
        new (): Value; // This allows `obj instanceof Value`
    };

    type ControllerEventMask = number;

    type DeviceEventMask = number;

    type KeyEventMask = number;

    type KeyMaskType = number;

    type KeystrokeListener = void;

    const __name__: string;

    const __version__: string;
}

export default Atspi;

}

declare module 'gi://Atspi' {
    import Atspi20 from 'gi://Atspi?version=2.0';
    export default Atspi20;
}
// END
