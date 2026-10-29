/// <reference path="./xlib-2.0.d.ts" />
/// <reference path="./xfixes-4.0.d.ts" />
/// <reference path="./mtk-51.d.ts" />
/// <reference path="./graphene-1.0.d.ts" />
/// <reference path="./gobject-2.0.d.ts" />
/// <reference path="./glib-2.0.d.ts" />
/// <reference path="./gio-2.0.d.ts" />
/// <reference path="./gmodule-2.0.d.ts" />
/// <reference path="./gdesktopenums-3.0.d.ts" />
/// <reference path="./cogl-51.d.ts" />
/// <reference path="./gl-1.0.d.ts" />
/// <reference path="./clutter-51.d.ts" />
/// <reference path="./pango-1.0.d.ts" />
/// <reference path="./cairo-1.0.d.ts" />
/// <reference path="./cairo.d.ts" />
/// <reference path="./harfbuzz-0.0.d.ts" />
/// <reference path="./freetype2-2.0.d.ts" />
/// <reference path="./atk-1.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://Meta?version=51' {

// Module dependencies
import type xlib from 'gi://xlib?version=2.0';
import type xfixes from 'gi://xfixes?version=4.0';
import type Mtk from 'gi://Mtk?version=51';
import type Graphene from 'gi://Graphene?version=1.0';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type Gio from 'gi://Gio?version=2.0';
import type GModule from 'gi://GModule?version=2.0';
import type GDesktopEnums from 'gi://GDesktopEnums?version=3.0';
import type Cogl from 'gi://Cogl?version=51';
import type GL from 'gi://GL?version=1.0';
import type Clutter from 'gi://Clutter?version=51';
import type Pango from 'gi://Pango?version=1.0';
import type cairo from 'cairo';
import type HarfBuzz from 'gi://HarfBuzz?version=0.0';
import type freetype2 from 'gi://freetype2?version=2.0';
import type Atk from 'gi://Atk?version=1.0';

export namespace Meta {

    /**
     * Meta-51
     */


    export namespace ButtonFunction {
        export const $gtype: GObject.GType<ButtonFunction>;
    }

    enum ButtonFunction {
        MENU = 0,
        MINIMIZE = 1,
        MAXIMIZE = 2,
        CLOSE = 3,
        LAST = 4,
    }


    export namespace CloseDialogResponse {
        export const $gtype: GObject.GType<CloseDialogResponse>;
    }

    enum CloseDialogResponse {
        WAIT = 0,
        FORCE_CLOSE = 1,
    }


    export namespace CompEffect {
        export const $gtype: GObject.GType<CompEffect>;
    }

    enum CompEffect {
        CREATE = 0,
        UNMINIMIZE = 1,
        DESTROY = 2,
        MINIMIZE = 3,
        NONE = 4,
    }


    export namespace DisplayCorner {
        export const $gtype: GObject.GType<DisplayCorner>;
    }

    enum DisplayCorner {
        TOPLEFT = 0,
        TOPRIGHT = 1,
        BOTTOMLEFT = 2,
        BOTTOMRIGHT = 3,
    }


    export namespace DisplayDirection {
        export const $gtype: GObject.GType<DisplayDirection>;
    }

    enum DisplayDirection {
        UP = 0,
        DOWN = 1,
        LEFT = 2,
        RIGHT = 3,
    }


    export namespace EdgeType {
        export const $gtype: GObject.GType<EdgeType>;
    }

    enum EdgeType {
        WINDOW = 0,
        MONITOR = 1,
        SCREEN = 2,
    }


    export namespace ExitCode {
        export const $gtype: GObject.GType<ExitCode>;
    }

    enum ExitCode {
        SUCCESS = 0,
        ERROR = 1,
    }


    export namespace FrameType {
        export const $gtype: GObject.GType<FrameType>;
    }

    enum FrameType {
        NORMAL = 0,
        DIALOG = 1,
        MODAL_DIALOG = 2,
        UTILITY = 3,
        MENU = 4,
        BORDER = 5,
        ATTACHED = 6,
        LAST = 7,
    }


    export namespace GrabOp {
        export const $gtype: GObject.GType<GrabOp>;
    }

    enum GrabOp {
        NONE = 0,
        WINDOW_BASE = 1,
        MOVING = 1,
        MOVING_UNCONSTRAINED = 1025,
        RESIZING_NW = 36865,
        RESIZING_N = 32769,
        RESIZING_NE = 40961,
        RESIZING_E = 8193,
        RESIZING_SW = 20481,
        RESIZING_S = 16385,
        RESIZING_SE = 24577,
        RESIZING_W = 4097,
        KEYBOARD_MOVING = 257,
        KEYBOARD_RESIZING_UNKNOWN = 769,
        KEYBOARD_RESIZING_NW = 37121,
        KEYBOARD_RESIZING_N = 33025,
        KEYBOARD_RESIZING_NE = 41217,
        KEYBOARD_RESIZING_E = 8449,
        KEYBOARD_RESIZING_SW = 20737,
        KEYBOARD_RESIZING_S = 16641,
        KEYBOARD_RESIZING_SE = 24833,
        KEYBOARD_RESIZING_W = 4353,
    }


    export namespace Gravity {
        export const $gtype: GObject.GType<Gravity>;
    }

    enum Gravity {
        NONE = 0,
        NORTH_WEST = 1,
        NORTH = 2,
        NORTH_EAST = 3,
        WEST = 4,
        CENTER = 5,
        EAST = 6,
        SOUTH_WEST = 7,
        SOUTH = 8,
        SOUTH_EAST = 9,
        STATIC = 10,
    }


    export namespace InhibitShortcutsDialogResponse {
        export const $gtype: GObject.GType<InhibitShortcutsDialogResponse>;
    }

    enum InhibitShortcutsDialogResponse {
        ALLOW = 0,
        DENY = 1,
    }


    export namespace KeyBindingAction {
        export const $gtype: GObject.GType<KeyBindingAction>;
    }

    enum KeyBindingAction {
        NONE = 0,
        WORKSPACE_1 = 1,
        WORKSPACE_2 = 2,
        WORKSPACE_3 = 3,
        WORKSPACE_4 = 4,
        WORKSPACE_5 = 5,
        WORKSPACE_6 = 6,
        WORKSPACE_7 = 7,
        WORKSPACE_8 = 8,
        WORKSPACE_9 = 9,
        WORKSPACE_10 = 10,
        WORKSPACE_11 = 11,
        WORKSPACE_12 = 12,
        WORKSPACE_LEFT = 13,
        WORKSPACE_RIGHT = 14,
        WORKSPACE_UP = 15,
        WORKSPACE_DOWN = 16,
        WORKSPACE_LAST = 17,
        SWITCH_APPLICATIONS = 18,
        SWITCH_APPLICATIONS_BACKWARD = 19,
        SWITCH_GROUP = 20,
        SWITCH_GROUP_BACKWARD = 21,
        SWITCH_WINDOWS = 22,
        SWITCH_WINDOWS_BACKWARD = 23,
        SWITCH_PANELS = 24,
        SWITCH_PANELS_BACKWARD = 25,
        CYCLE_GROUP = 26,
        CYCLE_GROUP_BACKWARD = 27,
        CYCLE_WINDOWS = 28,
        CYCLE_WINDOWS_BACKWARD = 29,
        CYCLE_PANELS = 30,
        CYCLE_PANELS_BACKWARD = 31,
        SHOW_DESKTOP = 32,
        PANEL_RUN_DIALOG = 33,
        TOGGLE_RECORDING = 34,
        SET_SPEW_MARK = 35,
        ACTIVATE_WINDOW_MENU = 36,
        TOGGLE_FULLSCREEN = 37,
        TOGGLE_MAXIMIZED = 38,
        TOGGLE_TILED_LEFT = 39,
        TOGGLE_TILED_RIGHT = 40,
        TOGGLE_ABOVE = 41,
        MAXIMIZE = 42,
        UNMAXIMIZE = 43,
        TOGGLE_SHADED = 44,
        MINIMIZE = 45,
        CLOSE = 46,
        BEGIN_MOVE = 47,
        BEGIN_RESIZE = 48,
        TOGGLE_ON_ALL_WORKSPACES = 49,
        MOVE_TO_WORKSPACE_1 = 50,
        MOVE_TO_WORKSPACE_2 = 51,
        MOVE_TO_WORKSPACE_3 = 52,
        MOVE_TO_WORKSPACE_4 = 53,
        MOVE_TO_WORKSPACE_5 = 54,
        MOVE_TO_WORKSPACE_6 = 55,
        MOVE_TO_WORKSPACE_7 = 56,
        MOVE_TO_WORKSPACE_8 = 57,
        MOVE_TO_WORKSPACE_9 = 58,
        MOVE_TO_WORKSPACE_10 = 59,
        MOVE_TO_WORKSPACE_11 = 60,
        MOVE_TO_WORKSPACE_12 = 61,
        MOVE_TO_WORKSPACE_LEFT = 62,
        MOVE_TO_WORKSPACE_RIGHT = 63,
        MOVE_TO_WORKSPACE_UP = 64,
        MOVE_TO_WORKSPACE_DOWN = 65,
        MOVE_TO_WORKSPACE_LAST = 66,
        MOVE_TO_MONITOR_LEFT = 67,
        MOVE_TO_MONITOR_RIGHT = 68,
        MOVE_TO_MONITOR_UP = 69,
        MOVE_TO_MONITOR_DOWN = 70,
        RAISE_OR_LOWER = 71,
        RAISE = 72,
        LOWER = 73,
        MAXIMIZE_VERTICALLY = 74,
        MAXIMIZE_HORIZONTALLY = 75,
        MOVE_TO_CORNER_NW = 76,
        MOVE_TO_CORNER_NE = 77,
        MOVE_TO_CORNER_SW = 78,
        MOVE_TO_CORNER_SE = 79,
        MOVE_TO_SIDE_N = 80,
        MOVE_TO_SIDE_S = 81,
        MOVE_TO_SIDE_E = 82,
        MOVE_TO_SIDE_W = 83,
        MOVE_TO_CENTER = 84,
        OVERLAY_KEY = 85,
        LOCATE_POINTER_KEY = 86,
        ISO_NEXT_GROUP = 87,
        ALWAYS_ON_TOP = 88,
        SWITCH_MONITOR = 89,
        ROTATE_MONITOR = 90,
        LAST = 91,
    }


    export namespace LaterType {
        export const $gtype: GObject.GType<LaterType>;
    }

    enum LaterType {
        RESIZE = 0,
        CALC_SHOWING = 1,
        CHECK_FULLSCREEN = 2,
        SYNC_STACK = 3,
        BEFORE_REDRAW = 4,
        IDLE = 5,
    }


    export namespace MonitorSwitchConfigType {
        export const $gtype: GObject.GType<MonitorSwitchConfigType>;
    }

    enum MonitorSwitchConfigType {
        ALL_MIRROR = 0,
        ALL_LINEAR = 1,
        EXTERNAL = 2,
        BUILTIN = 3,
        UNKNOWN = 4,
    }


    export namespace MotionDirection {
        export const $gtype: GObject.GType<MotionDirection>;
    }

    enum MotionDirection {
        UP = -1,
        DOWN = -2,
        LEFT = -3,
        RIGHT = -4,
        UP_LEFT = -5,
        UP_RIGHT = -6,
        DOWN_LEFT = -7,
        DOWN_RIGHT = -8,
    }


    export namespace MultiTextureAlphaMode {
        export const $gtype: GObject.GType<MultiTextureAlphaMode>;
    }

    enum MultiTextureAlphaMode {
        META_MULTI_TEXTURE_ALPHA_MODE_NONE = 0,
        META_MULTI_TEXTURE_ALPHA_MODE_PREMULT_ELECTRICAL = 1,
        META_MULTI_TEXTURE_ALPHA_MODE_STRAIGHT = 2,
        N_META_MULTI_TEXTURE_ALPHA_MODES = 3,
    }


    export namespace MultiTextureChromaLoc {
        export const $gtype: GObject.GType<MultiTextureChromaLoc>;
    }

    enum MultiTextureChromaLoc {
        NONE = 0,
        DEFINED = 1,
    }


    export namespace MultiTextureCoefficients {
        export const $gtype: GObject.GType<MultiTextureCoefficients>;
    }

    enum MultiTextureCoefficients {
        META_MULTI_TEXTURE_COEFFICIENTS_NONE = 0,
        META_MULTI_TEXTURE_COEFFICIENTS_IDENTITY_FULL = 1,
        META_MULTI_TEXTURE_COEFFICIENTS_IDENTITY_LIMITED = 2,
        META_MULTI_TEXTURE_COEFFICIENTS_BT709_FULL = 3,
        META_MULTI_TEXTURE_COEFFICIENTS_BT709_LIMITED = 4,
        META_MULTI_TEXTURE_COEFFICIENTS_BT601_FULL = 5,
        META_MULTI_TEXTURE_COEFFICIENTS_BT601_LIMITED = 6,
        META_MULTI_TEXTURE_COEFFICIENTS_BT2020_FULL = 7,
        META_MULTI_TEXTURE_COEFFICIENTS_BT2020_LIMITED = 8,
        N_META_MULTI_TEXTURE_COEFFICIENTS = 9,
    }


    export namespace MultiTextureFormat {
        export const $gtype: GObject.GType<MultiTextureFormat>;
    }

    enum MultiTextureFormat {
        META_MULTI_TEXTURE_FORMAT_INVALID = 0,
        META_MULTI_TEXTURE_FORMAT_SIMPLE = 1,
        META_MULTI_TEXTURE_FORMAT_YUYV = 2,
        META_MULTI_TEXTURE_FORMAT_YVYU = 3,
        META_MULTI_TEXTURE_FORMAT_UYVY = 4,
        META_MULTI_TEXTURE_FORMAT_VYUY = 5,
        META_MULTI_TEXTURE_FORMAT_NV12 = 6,
        META_MULTI_TEXTURE_FORMAT_NV21 = 7,
        META_MULTI_TEXTURE_FORMAT_NV16 = 8,
        META_MULTI_TEXTURE_FORMAT_NV61 = 9,
        META_MULTI_TEXTURE_FORMAT_NV24 = 10,
        META_MULTI_TEXTURE_FORMAT_NV42 = 11,
        META_MULTI_TEXTURE_FORMAT_P010 = 12,
        META_MULTI_TEXTURE_FORMAT_P012 = 13,
        META_MULTI_TEXTURE_FORMAT_P016 = 14,
        META_MULTI_TEXTURE_FORMAT_YUV420 = 15,
        META_MULTI_TEXTURE_FORMAT_YVU420 = 16,
        META_MULTI_TEXTURE_FORMAT_YUV422 = 17,
        META_MULTI_TEXTURE_FORMAT_YVU422 = 18,
        META_MULTI_TEXTURE_FORMAT_YUV444 = 19,
        META_MULTI_TEXTURE_FORMAT_YVU444 = 20,
        META_MULTI_TEXTURE_FORMAT_S010 = 21,
        META_MULTI_TEXTURE_FORMAT_S210 = 22,
        META_MULTI_TEXTURE_FORMAT_S410 = 23,
        META_MULTI_TEXTURE_FORMAT_S012 = 24,
        META_MULTI_TEXTURE_FORMAT_S212 = 25,
        META_MULTI_TEXTURE_FORMAT_S412 = 26,
        META_MULTI_TEXTURE_FORMAT_S016 = 27,
        META_MULTI_TEXTURE_FORMAT_S216 = 28,
        META_MULTI_TEXTURE_FORMAT_S416 = 29,
        N_META_MULTI_TEXTURE_FORMATS = 30,
    }


    export namespace Orientation {
        export const $gtype: GObject.GType<Orientation>;
    }

    enum Orientation {
        UNDEFINED = 0,
        NORMAL = 1,
        BOTTOM_UP = 2,
        LEFT_UP = 3,
        RIGHT_UP = 4,
    }


    export namespace PadDirection {
        export const $gtype: GObject.GType<PadDirection>;
    }

    enum PadDirection {
        UP = 1,
        DOWN = 2,
        CW = 3,
        CCW = 4,
    }


    export namespace PadFeatureType {
        export const $gtype: GObject.GType<PadFeatureType>;
    }

    enum PadFeatureType {
        RING = 0,
        STRIP = 1,
        DIAL = 2,
    }


    export namespace PowerSaveChangeReason {
        export const $gtype: GObject.GType<PowerSaveChangeReason>;
    }

    enum PowerSaveChangeReason {
        MODE_CHANGE = 0,
        HOTPLUG = 1,
    }


    export namespace Preference {
        export const $gtype: GObject.GType<Preference>;
    }

    enum Preference {
        MOUSE_BUTTON_MODS = 0,
        FOCUS_MODE = 1,
        FOCUS_NEW_WINDOWS = 2,
        ATTACH_MODAL_DIALOGS = 3,
        RAISE_ON_CLICK = 4,
        ACTION_DOUBLE_CLICK_TITLEBAR = 5,
        ACTION_MIDDLE_CLICK_TITLEBAR = 6,
        ACTION_RIGHT_CLICK_TITLEBAR = 7,
        AUTO_RAISE = 8,
        AUTO_RAISE_DELAY = 9,
        FOCUS_CHANGE_ON_POINTER_REST = 10,
        NUM_WORKSPACES = 11,
        DYNAMIC_WORKSPACES = 12,
        KEYBINDINGS = 13,
        DISABLE_WORKAROUNDS = 14,
        BUTTON_LAYOUT = 15,
        WORKSPACE_NAMES = 16,
        VISUAL_BELL = 17,
        AUDIBLE_BELL = 18,
        VISUAL_BELL_TYPE = 19,
        GNOME_ACCESSIBILITY = 20,
        GNOME_ANIMATIONS = 21,
        CURSOR_THEME = 22,
        CURSOR_SIZE = 23,
        RESIZE_WITH_RIGHT_BUTTON = 24,
        EDGE_TILING = 25,
        FORCE_FULLSCREEN = 26,
        WORKSPACES_ONLY_ON_PRIMARY = 27,
        DRAGGABLE_BORDER_WIDTH = 28,
        AUTO_MAXIMIZE = 29,
        CENTER_NEW_WINDOWS = 30,
        DRAG_THRESHOLD = 31,
        LOCATE_POINTER = 32,
        CHECK_ALIVE_TIMEOUT = 33,
    }


    export namespace SelectionType {
        export const $gtype: GObject.GType<SelectionType>;
    }

    enum SelectionType {
        SELECTION_PRIMARY = 0,
        SELECTION_CLIPBOARD = 1,
        SELECTION_DND = 2,
        N_SELECTION_TYPES = 3,
    }


    export namespace Side {
        export const $gtype: GObject.GType<Side>;
    }

    enum Side {
        LEFT = 1,
        RIGHT = 2,
        TOP = 4,
        BOTTOM = 8,
    }


    export namespace SizeChange {
        export const $gtype: GObject.GType<SizeChange>;
    }

    enum SizeChange {
        MAXIMIZE = 0,
        UNMAXIMIZE = 1,
        FULLSCREEN = 2,
        UNFULLSCREEN = 3,
        MONITOR_MOVE = 4,
    }


    export namespace StackLayer {
        export const $gtype: GObject.GType<StackLayer>;
    }

    enum StackLayer {
        DESKTOP = 0,
        BOTTOM = 1,
        NORMAL = 2,
        TOP = 4,
        DOCK = 4,
        OVERRIDE_REDIRECT = 7,
        LAST = 8,
    }


    export namespace TabList {
        export const $gtype: GObject.GType<TabList>;
    }

    enum TabList {
        NORMAL = 0,
        DOCKS = 1,
        GROUP = 2,
        NORMAL_ALL = 3,
        NORMAL_ALL_MRU = 4,
    }


    export namespace TabShowType {
        export const $gtype: GObject.GType<TabShowType>;
    }

    enum TabShowType {
        ICON = 0,
        INSTANTLY = 1,
    }


    export namespace WindowClientType {
        export const $gtype: GObject.GType<WindowClientType>;
    }

    enum WindowClientType {
        WAYLAND = 0,
        X11 = 1,
    }


    export namespace WindowContentType {
        export const $gtype: GObject.GType<WindowContentType>;
    }

    enum WindowContentType {
        NONE = 0,
        PHOTO = 1,
        VIDEO = 2,
        GAME = 3,
    }


    export namespace WindowMenuType {
        export const $gtype: GObject.GType<WindowMenuType>;
    }

    enum WindowMenuType {
        WM = 0,
        APP = 1,
    }


    export namespace WindowType {
        export const $gtype: GObject.GType<WindowType>;
    }

    enum WindowType {
        NORMAL = 0,
        DESKTOP = 1,
        DOCK = 2,
        DIALOG = 3,
        MODAL_DIALOG = 4,
        TOOLBAR = 5,
        MENU = 6,
        UTILITY = 7,
        SPLASHSCREEN = 8,
        DROPDOWN_MENU = 9,
        POPUP_MENU = 10,
        TOOLTIP = 11,
        NOTIFICATION = 12,
        COMBO = 13,
        DND = 14,
        OVERRIDE_OTHER = 15,
    }


    const CURRENT_TIME: number;

    const CURSOR_EXTENSION_POINT_NAME: string;

    const N_ORIENTATIONS: number;

    const PRIORITY_BEFORE_REDRAW: number;

    const PRIORITY_PREFS_NOTIFY: number;

    const PRIORITY_REDRAW: number;

    const PRIORITY_RESIZE: number;

    const VIRTUAL_CORE_KEYBOARD_ID: number;

    const VIRTUAL_CORE_POINTER_ID: number;

    function accelerator_name(accelerator_mods: Clutter.ModifierType, accelerator_key: number): string;

    function add_debug_paint_flag(flag: DebugPaintFlag): void;

    function add_verbose_topic(topic: DebugTopic): void;

    function create_context(name: string): Context;

    function exit(code: ExitCode): void;

    function external_binding_name_for_action(keybinding_action: number): string;

    function frame_type_to_string(type: FrameType): string;

    function g_utf8_strndup(src: string, n: bigint | number): string;

    function get_debug_paint_flags(): DebugPaintFlag;

    function gravity_to_string(gravity: Gravity): string;

    function is_topic_enabled(topic: DebugTopic): boolean;

    function is_verbose(): boolean;

    function keybindings_set_custom_handler(name: string, handler: KeyHandlerFunc | null): boolean;

    function orientation_to_transform(orientation: Orientation): Mtk.MonitorTransform;

    function preference_to_string(pref: Preference): string;

    function prefs_bell_is_audible(): boolean;

    function prefs_change_workspace_name(i: number, name: string): void;

    function prefs_get_action_double_click_titlebar(): GDesktopEnums.TitlebarAction;

    function prefs_get_action_middle_click_titlebar(): GDesktopEnums.TitlebarAction;

    function prefs_get_action_right_click_titlebar(): GDesktopEnums.TitlebarAction;

    function prefs_get_attach_modal_dialogs(): boolean;

    function prefs_get_auto_maximize(): boolean;

    function prefs_get_auto_raise(): boolean;

    function prefs_get_auto_raise_delay(): number;

    function prefs_get_button_layout(): ButtonLayout;

    function prefs_get_center_new_windows(): boolean;

    function prefs_get_check_alive_timeout(): number;

    function prefs_get_cursor_size(): number;

    function prefs_get_cursor_theme(): string;

    function prefs_get_disable_workarounds(): boolean;

    function prefs_get_drag_threshold(): number;

    function prefs_get_draggable_border_width(): number;

    function prefs_get_dynamic_workspaces(): boolean;

    function prefs_get_edge_tiling(): boolean;

    function prefs_get_focus_change_on_pointer_rest(): boolean;

    function prefs_get_focus_mode(): GDesktopEnums.FocusMode;

    function prefs_get_focus_new_windows(): GDesktopEnums.FocusNewWindows;

    function prefs_get_force_fullscreen(): boolean;

    function prefs_get_gnome_accessibility(): boolean;

    function prefs_get_gnome_animations(): boolean;

    function prefs_get_keybinding_action(name: string): KeyBindingAction;

    function prefs_get_keybinding_label(name: string): string | null;

    function prefs_get_mouse_button_menu(): number;

    function prefs_get_mouse_button_mods(): Clutter.ModifierType;

    function prefs_get_mouse_button_resize(): number;

    function prefs_get_num_workspaces(): number;

    function prefs_get_raise_on_click(): boolean;

    function prefs_get_show_fallback_app_menu(): boolean;

    function prefs_get_visual_bell(): boolean;

    function prefs_get_visual_bell_type(): GDesktopEnums.VisualBellType;

    function prefs_get_workspace_name(i: number): string;

    function prefs_get_workspaces_only_on_primary(): boolean;

    function prefs_set_force_fullscreen(whether: boolean): void;

    function prefs_set_num_workspaces(n_workspaces: number): void;

    function prefs_set_show_fallback_app_menu(whether: boolean): void;

    function read_bytes(fd: number, offset: number, length: number): globalThis.Promise<boolean>;
    function read_bytes(fd: number, offset: number, length: number, callback: Gio.AsyncReadyCallback<number> | null): void;
    function read_bytes(fd: number, offset: number, length: number, callback: Gio.AsyncReadyCallback<number> | null): globalThis.Promise<boolean> | void;

    function read_bytes_finish(result: Gio.AsyncResult, bytes: number, length: number): boolean;

    function remove_debug_paint_flag(flag: DebugPaintFlag): void;

    function remove_verbose_topic(topic: DebugTopic): void;

    function topic_to_string(topic: DebugTopic): string;

    function unsigned_long_equal(v1: null, v2: null): number;

    function unsigned_long_hash(v: null): number;

    interface IdleMonitorWatchFunc {
        (monitor: IdleMonitor, watch_id: number): void;
    }

    interface KeyHandlerFunc {
        (display: Display, window: Window, event: Clutter.Event, binding: KeyBinding): void;
    }

    interface PrefsChangedFunc {
        (pref: Preference): void;
    }

    interface StageRedrawClipFilterFunc {
        (stage: Stage, stage_view: Clutter.StageView, redraw_clip: Mtk.Region): boolean;
    }

    interface WindowForeachFunc {
        (window: Window): boolean;
    }

    export namespace BackendCapabilities {
        export const $gtype: GObject.GType<BackendCapabilities>;
    }

    enum BackendCapabilities {
        NONE = 0,
        BARRIERS = 1,
    }


    export namespace BarrierDirection {
        export const $gtype: GObject.GType<BarrierDirection>;
    }

    enum BarrierDirection {
        POSITIVE_X = 1,
        POSITIVE_Y = 2,
        NEGATIVE_X = 4,
        NEGATIVE_Y = 8,
    }


    export namespace BarrierFlags {
        export const $gtype: GObject.GType<BarrierFlags>;
    }

    enum BarrierFlags {
        NONE = 1,
        STICKY = 2,
    }


    export namespace DebugPaintFlag {
        export const $gtype: GObject.GType<DebugPaintFlag>;
    }

    enum DebugPaintFlag {
        NONE = 0,
        OPAQUE_REGION = 1,
        SYNC_CURSOR_PRIMARY = 2,
        DISABLE_DIRECT_SCANOUT = 4,
        IGNORE_COLOR_STATE_FOR_DIRECT_SCANOUT = 8,
    }


    export namespace DebugTopic {
        export const $gtype: GObject.GType<DebugTopic>;
    }

    enum DebugTopic {
        VERBOSE = -1,
        FOCUS = 1,
        WORKAREA = 2,
        STACK = 4,
        SM = 8,
        EVENTS = 16,
        WINDOW_STATE = 32,
        WINDOW_OPS = 64,
        GEOMETRY = 128,
        PLACEMENT = 256,
        DISPLAY = 512,
        KEYBINDINGS = 1024,
        SYNC = 2048,
        STARTUP = 4096,
        PREFS = 8192,
        EDGE_RESISTANCE = 16384,
        DBUS = 32768,
        INPUT = 65536,
        WAYLAND = 131072,
        KMS = 262144,
        SCREEN_CAST = 524288,
        REMOTE_DESKTOP = 1048576,
        BACKEND = 2097152,
        RENDER = 4194304,
        COLOR = 8388608,
        INPUT_EVENTS = 16777216,
        EIS = 33554432,
        KMS_DEADLINE = 67108864,
        SESSION_MANAGEMENT = 134217728,
        X11 = 268435456,
        WORKSPACES = 536870912,
    }


    export namespace Direction {
        export const $gtype: GObject.GType<Direction>;
    }

    enum Direction {
        LEFT = 1,
        RIGHT = 2,
        TOP = 4,
        BOTTOM = 8,
        UP = 4,
        DOWN = 8,
        HORIZONTAL = 3,
        VERTICAL = 12,
    }


    export namespace ExternalConstraintFlags {
        export const $gtype: GObject.GType<ExternalConstraintFlags>;
    }

    enum ExternalConstraintFlags {
        NONE = 0,
        MOVE = 1,
        RESIZE = 2,
    }


    export namespace IdleMonitorWatchFlags {
        export const $gtype: GObject.GType<IdleMonitorWatchFlags>;
    }

    enum IdleMonitorWatchFlags {
        NONE = 0,
        UNINHIBITABLE = 1,
        START_NOW = 2,
    }


    export namespace KeyBindingFlags {
        export const $gtype: GObject.GType<KeyBindingFlags>;
    }

    enum KeyBindingFlags {
        NONE = 0,
        PER_WINDOW = 1,
        BUILTIN = 2,
        IS_REVERSED = 4,
        NON_MASKABLE = 8,
        IGNORE_AUTOREPEAT = 16,
        NO_AUTO_GRAB = 32,
        CUSTOM_TRIGGER = 64,
        TRIGGER_RELEASE = 128,
    }


    export namespace KeyboardA11yFlags {
        export const $gtype: GObject.GType<KeyboardA11yFlags>;
    }

    enum KeyboardA11yFlags {
        KEYBOARD_ENABLED = 1,
        TIMEOUT_ENABLED = 2,
        MOUSE_KEYS_ENABLED = 4,
        SLOW_KEYS_ENABLED = 8,
        SLOW_KEYS_BEEP_PRESS = 16,
        SLOW_KEYS_BEEP_ACCEPT = 32,
        SLOW_KEYS_BEEP_REJECT = 64,
        BOUNCE_KEYS_ENABLED = 128,
        BOUNCE_KEYS_BEEP_REJECT = 256,
        TOGGLE_KEYS_ENABLED = 512,
        STICKY_KEYS_ENABLED = 1024,
        STICKY_KEYS_TWO_KEY_OFF = 2048,
        STICKY_KEYS_BEEP = 4096,
        FEATURE_STATE_CHANGE_BEEP = 8192,
    }


    export namespace MaximizeFlags {
        export const $gtype: GObject.GType<MaximizeFlags>;
    }

    enum MaximizeFlags {
        NONE = 0,
        HORIZONTAL = 1,
        VERTICAL = 2,
        BOTH = 3,
    }


    namespace Backend {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "gpu-added": (gpu: null) => void;
            /** @signal */
            "keymap-changed": () => void;
            /** @signal */
            "keymap-layout-group-changed": (object: number) => void;
            /** @signal */
            "last-device-changed": (object: Clutter.InputDevice) => void;
            /** @signal */
            "lid-is-closed-changed": (object: boolean) => void;
            /** @signal */
            "override-cursor": () => Clutter.CursorType;
            /** @signal */
            "prepare-shutdown": () => void;
            /** @signal */
            "reset-keymap-description": () => KeymapDescription;
            /** @signal */
            "reset-keymap-layout-index": () => number;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::last-input-device": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Gio.Initable.ConstructorProps {
            capabilities: BackendCapabilities;
            context: Context;
            last_input_device: Clutter.InputDevice | null;
            lastInputDevice: Clutter.InputDevice | null;
        }
    }

    abstract class Backend extends GObject.Object implements Gio.Initable {
        static $gtype: GObject.GType<Backend>;

        // Properties
        get capabilities(): BackendCapabilities;

        get context(): Context;

        get last_input_device(): Clutter.InputDevice | null;

        get lastInputDevice(): Clutter.InputDevice | null;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Backend.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Backend.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Backend.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Backend.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Backend.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Backend.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Backend.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Backend.SignalSignatures[K]>): void;

        // Methods
        get_capabilities(): BackendCapabilities;

        get_context(): Context;

        get_core_idle_monitor(): IdleMonitor;

        get_current_logical_monitor(): LogicalMonitor | null;

        get_cursor_tracker(): CursorTracker;

        get_dnd(): Dnd;

        get_keymap_description(): KeymapDescription;

        get_last_input_device(): Clutter.InputDevice | null;

        get_monitor_manager(): MonitorManager;

        get_orientation_manager(): OrientationManager;

        get_presentation_wait_us(): number;

        get_remote_access_controller(): RemoteAccessController;

        get_stage(): Clutter.Actor;

        is_headless(): boolean;

        is_rendering_hardware_accelerated(): boolean;

        renderdoc_capture(): void;

        set_keymap_async(description: KeymapDescription, layout_index: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        set_keymap_async(description: KeymapDescription, layout_index: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        set_keymap_async(description: KeymapDescription, layout_index: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        set_keymap_finish(result: Gio.AsyncResult): boolean;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace Background {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            changed: () => void;
            "notify::meta-display": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            meta_display: Display;
            metaDisplay: Display;
        }
    }

    class Background extends GObject.Object {
        static $gtype: GObject.GType<Background>;

        // Properties
        get meta_display(): Display;

        get metaDisplay(): Display;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Background.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Background.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](display: Display): Background;

        // Signals
        /** @signal */
        connect<K extends keyof Background.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Background.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Background.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Background.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Background.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Background.SignalSignatures[K]>): void;

        // Methods
        set_blend_textures(texture1: Cogl.Texture | null, texture2: Cogl.Texture | null, blend_factor: number, style: GDesktopEnums.BackgroundStyle, color_state: Clutter.ColorState | null): void;

        set_color(color: Cogl.Color): void;

        set_focus(x: number, y: number): void;

        set_gradient(shading_direction: GDesktopEnums.BackgroundShading, color: Cogl.Color, second_color: Cogl.Color): void;

        set_texture(texture: Cogl.Texture | null, style: GDesktopEnums.BackgroundStyle, color_state: Clutter.ColorState | null): void;
    }


    namespace BackgroundActor {
        // Signal signatures
        interface SignalSignatures extends Clutter.Actor.SignalSignatures {
            "notify::meta-display": (pspec: GObject.ParamSpec) => void;
            "notify::monitor": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-name": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-role": (pspec: GObject.ParamSpec) => void;
            "notify::actions": (pspec: GObject.ParamSpec) => void;
            "notify::allocation": (pspec: GObject.ParamSpec) => void;
            "notify::background-color": (pspec: GObject.ParamSpec) => void;
            "notify::background-color-set": (pspec: GObject.ParamSpec) => void;
            "notify::child-transform": (pspec: GObject.ParamSpec) => void;
            "notify::child-transform-set": (pspec: GObject.ParamSpec) => void;
            "notify::clip-rect": (pspec: GObject.ParamSpec) => void;
            "notify::clip-to-allocation": (pspec: GObject.ParamSpec) => void;
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::constraints": (pspec: GObject.ParamSpec) => void;
            "notify::content": (pspec: GObject.ParamSpec) => void;
            "notify::content-box": (pspec: GObject.ParamSpec) => void;
            "notify::content-gravity": (pspec: GObject.ParamSpec) => void;
            "notify::content-repeat": (pspec: GObject.ParamSpec) => void;
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::cursor-type": (pspec: GObject.ParamSpec) => void;
            "notify::effect": (pspec: GObject.ParamSpec) => void;
            "notify::first-child": (pspec: GObject.ParamSpec) => void;
            "notify::fixed-position-set": (pspec: GObject.ParamSpec) => void;
            "notify::fixed-x": (pspec: GObject.ParamSpec) => void;
            "notify::fixed-y": (pspec: GObject.ParamSpec) => void;
            "notify::has-clip": (pspec: GObject.ParamSpec) => void;
            "notify::has-pointer": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::last-child": (pspec: GObject.ParamSpec) => void;
            "notify::layout-manager": (pspec: GObject.ParamSpec) => void;
            "notify::magnification-filter": (pspec: GObject.ParamSpec) => void;
            "notify::mapped": (pspec: GObject.ParamSpec) => void;
            "notify::margin-bottom": (pspec: GObject.ParamSpec) => void;
            "notify::margin-left": (pspec: GObject.ParamSpec) => void;
            "notify::margin-right": (pspec: GObject.ParamSpec) => void;
            "notify::margin-top": (pspec: GObject.ParamSpec) => void;
            "notify::min-height": (pspec: GObject.ParamSpec) => void;
            "notify::min-height-set": (pspec: GObject.ParamSpec) => void;
            "notify::min-width": (pspec: GObject.ParamSpec) => void;
            "notify::min-width-set": (pspec: GObject.ParamSpec) => void;
            "notify::minification-filter": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::natural-height": (pspec: GObject.ParamSpec) => void;
            "notify::natural-height-set": (pspec: GObject.ParamSpec) => void;
            "notify::natural-width": (pspec: GObject.ParamSpec) => void;
            "notify::natural-width-set": (pspec: GObject.ParamSpec) => void;
            "notify::offscreen-redirect": (pspec: GObject.ParamSpec) => void;
            "notify::opacity": (pspec: GObject.ParamSpec) => void;
            "notify::pivot-point": (pspec: GObject.ParamSpec) => void;
            "notify::pivot-point-z": (pspec: GObject.ParamSpec) => void;
            "notify::position": (pspec: GObject.ParamSpec) => void;
            "notify::reactive": (pspec: GObject.ParamSpec) => void;
            "notify::realized": (pspec: GObject.ParamSpec) => void;
            "notify::request-mode": (pspec: GObject.ParamSpec) => void;
            "notify::rotation-angle-x": (pspec: GObject.ParamSpec) => void;
            "notify::rotation-angle-y": (pspec: GObject.ParamSpec) => void;
            "notify::rotation-angle-z": (pspec: GObject.ParamSpec) => void;
            "notify::scale-x": (pspec: GObject.ParamSpec) => void;
            "notify::scale-y": (pspec: GObject.ParamSpec) => void;
            "notify::scale-z": (pspec: GObject.ParamSpec) => void;
            "notify::show-on-set-parent": (pspec: GObject.ParamSpec) => void;
            "notify::size": (pspec: GObject.ParamSpec) => void;
            "notify::text-direction": (pspec: GObject.ParamSpec) => void;
            "notify::transform": (pspec: GObject.ParamSpec) => void;
            "notify::transform-set": (pspec: GObject.ParamSpec) => void;
            "notify::translation-x": (pspec: GObject.ParamSpec) => void;
            "notify::translation-y": (pspec: GObject.ParamSpec) => void;
            "notify::translation-z": (pspec: GObject.ParamSpec) => void;
            "notify::visible": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
            "notify::x": (pspec: GObject.ParamSpec) => void;
            "notify::x-align": (pspec: GObject.ParamSpec) => void;
            "notify::x-expand": (pspec: GObject.ParamSpec) => void;
            "notify::y": (pspec: GObject.ParamSpec) => void;
            "notify::y-align": (pspec: GObject.ParamSpec) => void;
            "notify::y-expand": (pspec: GObject.ParamSpec) => void;
            "notify::z-position": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Clutter.Actor.ConstructorProps<Clutter.LayoutManager, BackgroundContent>, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {
            meta_display: Display;
            metaDisplay: Display;
            monitor: number;
        }
    }

    class BackgroundActor extends Clutter.Actor<Clutter.LayoutManager, BackgroundContent> implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<BackgroundActor>;

        // Properties
        get meta_display(): Display;

        get metaDisplay(): Display;

        get monitor(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: BackgroundActor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<BackgroundActor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](display: Display, monitor: number): BackgroundActor;

        // Conflicted with Clutter.Actor.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof BackgroundActor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BackgroundActor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BackgroundActor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BackgroundActor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BackgroundActor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BackgroundActor.SignalSignatures[K]>): void;

        find_property(property_name: string): GObject.ParamSpec;

        get_actor(): Clutter.Actor;

        get_initial_state(property_name: string, value: GObject.Value | any): void;

        interpolate_value(property_name: string, interval: Clutter.Interval, progress: number): [boolean, unknown];

        set_final_state(property_name: string, value: GObject.Value | any): void;

        vfunc_find_property(property_name: string): GObject.ParamSpec;

        vfunc_get_actor(): Clutter.Actor;

        vfunc_get_initial_state(property_name: string, value: unknown): void;

        vfunc_interpolate_value(property_name: string, interval: Clutter.Interval, progress: number): [boolean, GObject.Value | any];

        vfunc_set_final_state(property_name: string, value: unknown): void;
    }


    namespace BackgroundContent {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, Clutter.Content.SignalSignatures {
            "notify::background": (pspec: GObject.ParamSpec) => void;
            "notify::brightness": (pspec: GObject.ParamSpec) => void;
            "notify::gradient": (pspec: GObject.ParamSpec) => void;
            "notify::gradient-height": (pspec: GObject.ParamSpec) => void;
            "notify::gradient-max-darkness": (pspec: GObject.ParamSpec) => void;
            "notify::meta-display": (pspec: GObject.ParamSpec) => void;
            "notify::monitor": (pspec: GObject.ParamSpec) => void;
            "notify::rounded-clip-radius": (pspec: GObject.ParamSpec) => void;
            "notify::vignette": (pspec: GObject.ParamSpec) => void;
            "notify::vignette-sharpness": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Clutter.Content.ConstructorProps {
            background: Background;
            brightness: number;
            gradient: boolean;
            gradient_height: number;
            gradientHeight: number;
            gradient_max_darkness: number;
            gradientMaxDarkness: number;
            meta_display: Display;
            metaDisplay: Display;
            monitor: number;
            rounded_clip_radius: number;
            roundedClipRadius: number;
            vignette: boolean;
            vignette_sharpness: number;
            vignetteSharpness: number;
        }
    }

    class BackgroundContent extends GObject.Object implements Clutter.Content {
        static $gtype: GObject.GType<BackgroundContent>;

        // Properties
        get background(): Background;
        set background(val: Background);

        get brightness(): number;
        set brightness(val: number);

        get gradient(): boolean;
        set gradient(val: boolean);

        get gradient_height(): number;
        set gradient_height(val: number);

        get gradientHeight(): number;
        set gradientHeight(val: number);

        get gradient_max_darkness(): number;
        set gradient_max_darkness(val: number);

        get gradientMaxDarkness(): number;
        set gradientMaxDarkness(val: number);

        get meta_display(): Display;

        get metaDisplay(): Display;

        get monitor(): number;

        get rounded_clip_radius(): number;
        set rounded_clip_radius(val: number);

        get roundedClipRadius(): number;
        set roundedClipRadius(val: number);

        get vignette(): boolean;
        set vignette(val: boolean);

        get vignette_sharpness(): number;
        set vignette_sharpness(val: number);

        get vignetteSharpness(): number;
        set vignetteSharpness(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: BackgroundContent.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<BackgroundContent.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof BackgroundContent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BackgroundContent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BackgroundContent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BackgroundContent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BackgroundContent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BackgroundContent.SignalSignatures[K]>): void;

        // Static methods
        static ["new"](display: Display, monitor: number): Clutter.Content;

        // Methods
        set_background(background: Background): void;

        set_gradient(enabled: boolean, height: number, tone_start: number): void;

        set_rounded_clip_bounds(bounds: Graphene.Rect | null): void;

        set_rounded_clip_radius(radius: number): void;

        set_vignette(enabled: boolean, brightness: number, sharpness: number): void;

        get_preferred_size(): [boolean, number, number];

        invalidate(): void;

        invalidate_size(): void;

        vfunc_attached(actor: Clutter.Actor): void;

        vfunc_detached(actor: Clutter.Actor): void;

        vfunc_get_preferred_size(): [boolean, number, number];

        vfunc_invalidate(): void;

        vfunc_invalidate_size(): void;

        vfunc_paint_content(actor: Clutter.Actor, node: Clutter.PaintNode, paint_context: Clutter.PaintContext): void;
    }


    namespace BackgroundGroup {
        // Signal signatures
        interface SignalSignatures extends Clutter.Actor.SignalSignatures {
            "notify::accessible-name": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-role": (pspec: GObject.ParamSpec) => void;
            "notify::actions": (pspec: GObject.ParamSpec) => void;
            "notify::allocation": (pspec: GObject.ParamSpec) => void;
            "notify::background-color": (pspec: GObject.ParamSpec) => void;
            "notify::background-color-set": (pspec: GObject.ParamSpec) => void;
            "notify::child-transform": (pspec: GObject.ParamSpec) => void;
            "notify::child-transform-set": (pspec: GObject.ParamSpec) => void;
            "notify::clip-rect": (pspec: GObject.ParamSpec) => void;
            "notify::clip-to-allocation": (pspec: GObject.ParamSpec) => void;
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::constraints": (pspec: GObject.ParamSpec) => void;
            "notify::content": (pspec: GObject.ParamSpec) => void;
            "notify::content-box": (pspec: GObject.ParamSpec) => void;
            "notify::content-gravity": (pspec: GObject.ParamSpec) => void;
            "notify::content-repeat": (pspec: GObject.ParamSpec) => void;
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::cursor-type": (pspec: GObject.ParamSpec) => void;
            "notify::effect": (pspec: GObject.ParamSpec) => void;
            "notify::first-child": (pspec: GObject.ParamSpec) => void;
            "notify::fixed-position-set": (pspec: GObject.ParamSpec) => void;
            "notify::fixed-x": (pspec: GObject.ParamSpec) => void;
            "notify::fixed-y": (pspec: GObject.ParamSpec) => void;
            "notify::has-clip": (pspec: GObject.ParamSpec) => void;
            "notify::has-pointer": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::last-child": (pspec: GObject.ParamSpec) => void;
            "notify::layout-manager": (pspec: GObject.ParamSpec) => void;
            "notify::magnification-filter": (pspec: GObject.ParamSpec) => void;
            "notify::mapped": (pspec: GObject.ParamSpec) => void;
            "notify::margin-bottom": (pspec: GObject.ParamSpec) => void;
            "notify::margin-left": (pspec: GObject.ParamSpec) => void;
            "notify::margin-right": (pspec: GObject.ParamSpec) => void;
            "notify::margin-top": (pspec: GObject.ParamSpec) => void;
            "notify::min-height": (pspec: GObject.ParamSpec) => void;
            "notify::min-height-set": (pspec: GObject.ParamSpec) => void;
            "notify::min-width": (pspec: GObject.ParamSpec) => void;
            "notify::min-width-set": (pspec: GObject.ParamSpec) => void;
            "notify::minification-filter": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::natural-height": (pspec: GObject.ParamSpec) => void;
            "notify::natural-height-set": (pspec: GObject.ParamSpec) => void;
            "notify::natural-width": (pspec: GObject.ParamSpec) => void;
            "notify::natural-width-set": (pspec: GObject.ParamSpec) => void;
            "notify::offscreen-redirect": (pspec: GObject.ParamSpec) => void;
            "notify::opacity": (pspec: GObject.ParamSpec) => void;
            "notify::pivot-point": (pspec: GObject.ParamSpec) => void;
            "notify::pivot-point-z": (pspec: GObject.ParamSpec) => void;
            "notify::position": (pspec: GObject.ParamSpec) => void;
            "notify::reactive": (pspec: GObject.ParamSpec) => void;
            "notify::realized": (pspec: GObject.ParamSpec) => void;
            "notify::request-mode": (pspec: GObject.ParamSpec) => void;
            "notify::rotation-angle-x": (pspec: GObject.ParamSpec) => void;
            "notify::rotation-angle-y": (pspec: GObject.ParamSpec) => void;
            "notify::rotation-angle-z": (pspec: GObject.ParamSpec) => void;
            "notify::scale-x": (pspec: GObject.ParamSpec) => void;
            "notify::scale-y": (pspec: GObject.ParamSpec) => void;
            "notify::scale-z": (pspec: GObject.ParamSpec) => void;
            "notify::show-on-set-parent": (pspec: GObject.ParamSpec) => void;
            "notify::size": (pspec: GObject.ParamSpec) => void;
            "notify::text-direction": (pspec: GObject.ParamSpec) => void;
            "notify::transform": (pspec: GObject.ParamSpec) => void;
            "notify::transform-set": (pspec: GObject.ParamSpec) => void;
            "notify::translation-x": (pspec: GObject.ParamSpec) => void;
            "notify::translation-y": (pspec: GObject.ParamSpec) => void;
            "notify::translation-z": (pspec: GObject.ParamSpec) => void;
            "notify::visible": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
            "notify::x": (pspec: GObject.ParamSpec) => void;
            "notify::x-align": (pspec: GObject.ParamSpec) => void;
            "notify::x-expand": (pspec: GObject.ParamSpec) => void;
            "notify::y": (pspec: GObject.ParamSpec) => void;
            "notify::y-align": (pspec: GObject.ParamSpec) => void;
            "notify::y-expand": (pspec: GObject.ParamSpec) => void;
            "notify::z-position": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Clutter.Actor.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {}
    }

    class BackgroundGroup extends Clutter.Actor implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<BackgroundGroup>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: BackgroundGroup.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<BackgroundGroup.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): BackgroundGroup;

        // Signals
        /** @signal */
        connect<K extends keyof BackgroundGroup.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BackgroundGroup.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BackgroundGroup.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BackgroundGroup.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BackgroundGroup.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BackgroundGroup.SignalSignatures[K]>): void;

        find_property(property_name: string): GObject.ParamSpec;

        get_actor(): Clutter.Actor;

        get_initial_state(property_name: string, value: GObject.Value | any): void;

        interpolate_value(property_name: string, interval: Clutter.Interval, progress: number): [boolean, unknown];

        set_final_state(property_name: string, value: GObject.Value | any): void;

        vfunc_find_property(property_name: string): GObject.ParamSpec;

        vfunc_get_actor(): Clutter.Actor;

        vfunc_get_initial_state(property_name: string, value: unknown): void;

        vfunc_interpolate_value(property_name: string, interval: Clutter.Interval, progress: number): [boolean, GObject.Value | any];

        vfunc_set_final_state(property_name: string, value: unknown): void;
    }


    namespace Backlight {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::backend": (pspec: GObject.ParamSpec) => void;
            "notify::brightness": (pspec: GObject.ParamSpec) => void;
            "notify::brightness-max": (pspec: GObject.ParamSpec) => void;
            "notify::brightness-min": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            backend: Backend;
            brightness: number;
            brightness_max: number;
            brightnessMax: number;
            brightness_min: number;
            brightnessMin: number;
            name: string;
        }
    }

    abstract class Backlight extends GObject.Object {
        static $gtype: GObject.GType<Backlight>;

        // Properties
        get backend(): Backend;

        get brightness(): number;
        set brightness(val: number);

        get brightness_max(): number;

        get brightnessMax(): number;

        get brightness_min(): number;

        get brightnessMin(): number;

        get name(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Backlight.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Backlight.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Backlight.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Backlight.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Backlight.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Backlight.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Backlight.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Backlight.SignalSignatures[K]>): void;

        // Methods
        get_brightness(): number;

        get_brightness_info(): [number, number];

        set_brightness(brightness: number): void;
    }


    namespace Barrier {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            hit: (event: BarrierEvent) => void;
            /** @signal */
            left: (event: BarrierEvent) => void;
            "notify::backend": (pspec: GObject.ParamSpec) => void;
            "notify::directions": (pspec: GObject.ParamSpec) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::x1": (pspec: GObject.ParamSpec) => void;
            "notify::x2": (pspec: GObject.ParamSpec) => void;
            "notify::y1": (pspec: GObject.ParamSpec) => void;
            "notify::y2": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Gio.Initable.ConstructorProps {
            backend: Backend;
            directions: BarrierDirection;
            flags: BarrierFlags;
            x1: number;
            x2: number;
            y1: number;
            y2: number;
        }
    }

    class Barrier extends GObject.Object implements Gio.Initable {
        static $gtype: GObject.GType<Barrier>;

        // Properties
        get backend(): Backend;

        get directions(): BarrierDirection;

        get flags(): BarrierFlags;

        get x1(): number;

        get x2(): number;

        get y1(): number;

        get y2(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Barrier.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Barrier.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](backend: Backend, x1: number, y1: number, x2: number, y2: number, directions: BarrierDirection, flags: BarrierFlags): Barrier;

        // Signals
        /** @signal */
        connect<K extends keyof Barrier.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Barrier.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Barrier.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Barrier.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Barrier.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Barrier.SignalSignatures[K]>): void;

        // Methods
        destroy(): void;

        is_active(): boolean;

        release(event: BarrierEvent): void;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace Compositor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::backend": (pspec: GObject.ParamSpec) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            backend: Backend;
            display: Display;
        }
    }

    abstract class Compositor extends GObject.Object {
        static $gtype: GObject.GType<Compositor>;

        // Properties
        get backend(): Backend;

        get display(): Display;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Compositor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Compositor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Compositor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Compositor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Compositor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Compositor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Compositor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Compositor.SignalSignatures[K]>): void;

        // Methods
        disable_unredirect(): void;

        enable_unredirect(): void;

        get_backend(): Backend;

        get_background_blur_params(): [number, number, number];

        get_feedback_group(): Clutter.Actor;

        get_input_panel_group(): Clutter.Actor;

        get_laters(): Laters;

        get_stage(): Clutter.Stage;

        get_top_window_group(): Clutter.Actor;

        get_window_actors(): Clutter.Actor[];

        get_window_group(): Clutter.Actor;

        set_background_blur_params(blur_radius: number, saturation: number, noise: number): void;
    }


    namespace Context {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "prepare-compositor-shutdown": () => void;
            /** @signal */
            "prepare-shutdown": () => void;
            /** @signal */
            started: () => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::nick": (pspec: GObject.ParamSpec) => void;
            "notify::unsafe-mode": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            name: string;
            nick: string;
            unsafe_mode: boolean;
            unsafeMode: boolean;
        }
    }

    class Context extends GObject.Object {
        static $gtype: GObject.GType<Context>;

        // Properties
        get name(): string;

        get nick(): string;

        get unsafe_mode(): boolean;
        set unsafe_mode(val: boolean);

        get unsafeMode(): boolean;
        set unsafeMode(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Context.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Context.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Context.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Context.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Context.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Context.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Context.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Context.SignalSignatures[K]>): void;

        // Methods
        add_option_entries(entries: GLib.OptionEntry[], translation_domain: string | null): void;

        add_option_group(group: GLib.OptionGroup): void;

        configure(argv: string[] | null): [boolean, string[] | null];

        destroy(): void;

        enable_cogl_display_features(features: Cogl.DisplayFeature): void;

        get_backend(): Backend;

        get_cogl_display_features(): Cogl.DisplayFeature;

        get_debug_control(): DebugControl;

        get_display(): Display;

        get_wayland_compositor(): WaylandCompositor | null;

        identify_sender(connection: Gio.DBusConnection, sender: string, cancellable: Gio.Cancellable | null): globalThis.Promise<string>;

        identify_sender(connection: Gio.DBusConnection, sender: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        identify_sender(connection: Gio.DBusConnection, sender: string, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<string> | void;

        identify_sender_finish(result: Gio.AsyncResult): string;

        is_app_permitted(permission: string, app_id: string): boolean;

        notify_ready(): void;

        raise_rlimit_nofile(): boolean;

        restore_rlimit_nofile(): boolean;

        run_main_loop(): boolean;

        set_gnome_wm_keybindings(wm_keybindings: string): void;

        set_permitted_apps(permission: string, app_ids: string[] | null): void;

        set_plugin_gtype(plugin_gtype: GObject.GType): void;

        set_plugin_name(plugin_name: string): void;

        setup(): boolean;

        start(): boolean;

        terminate(): void;

        terminate_with_error(error: GLib.Error): void;
    }


    namespace Cursor {
        // Signal signatures
        interface SignalSignatures extends Clutter.Cursor.SignalSignatures {
            "notify::backend": (pspec: GObject.ParamSpec) => void;
            "notify::size": (pspec: GObject.ParamSpec) => void;
            "notify::theme-name": (pspec: GObject.ParamSpec) => void;
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::cursor-type": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Clutter.Cursor.ConstructorProps {
            backend: Backend;
            size: number;
            theme_name: string;
            themeName: string;
        }
    }

    abstract class Cursor extends Clutter.Cursor {
        static $gtype: GObject.GType<Cursor>;

        // Properties
        set backend(val: Backend);

        set size(val: number);

        set theme_name(val: string);

        set themeName(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Cursor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Cursor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Cursor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Cursor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Cursor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Cursor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Cursor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Cursor.SignalSignatures[K]>): void;

        // Methods
        get_backend(): Backend;

        get_size(): number;

        get_theme_name(): string;
    }


    namespace CursorTracker {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "cursor-changed": () => void;
            /** @signal */
            "cursor-prefs-changed": () => void;
            /** @signal */
            "position-invalidated": () => void;
            /** @signal */
            "visibility-changed": () => void;
            "notify::backend": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            backend: Backend;
        }
    }

    class CursorTracker extends GObject.Object {
        static $gtype: GObject.GType<CursorTracker>;

        // Properties
        get backend(): Backend;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: CursorTracker.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<CursorTracker.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof CursorTracker.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CursorTracker.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof CursorTracker.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CursorTracker.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof CursorTracker.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<CursorTracker.SignalSignatures[K]>): void;

        // Methods
        get_hot(): [number, number];

        get_pointer(): [Graphene.Point | null, Clutter.ModifierType | null];

        get_pointer_visible(): boolean;

        get_scale(): number;

        get_sprite(): Cogl.Texture | null;

        inhibit_cursor_visibility(): void;

        uninhibit_cursor_visibility(): void;
    }


    namespace DebugControl {
        // Signal signatures
        interface SignalSignatures extends Gio.DBusInterfaceSkeleton.SignalSignatures {
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::exported": (pspec: GObject.ParamSpec) => void;
            "notify::g-flags": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gio.DBusInterfaceSkeleton.ConstructorProps, Gio.DBusInterface.ConstructorProps {
            context: Context;
            exported: boolean;
        }
    }

    class DebugControl extends Gio.DBusInterfaceSkeleton implements Gio.DBusInterface {
        static $gtype: GObject.GType<DebugControl>;

        // Properties
        get context(): Context;

        get exported(): boolean;
        set exported(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DebugControl.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DebugControl.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DebugControl.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DebugControl.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DebugControl.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DebugControl.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DebugControl.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DebugControl.SignalSignatures[K]>): void;

        // Methods
        set_exported(exported: boolean): void;

        get_object(): Gio.DBusObject | null;

        get_info(): Gio.DBusInterfaceInfo | null;

        // Conflicted with Gio.DBusInterfaceSkeleton.get_info
        get_info(...args: never[]): any;

        set_object(object: Gio.DBusObject | null): void;

        vfunc_dup_object(): Gio.DBusObject | null;

        vfunc_get_info(): Gio.DBusInterfaceInfo | null;

        // Conflicted with Gio.DBusInterfaceSkeleton.vfunc_get_info
        vfunc_get_info(...args: never[]): any;

        vfunc_set_object(object: Gio.DBusObject | null): void;
    }


    namespace Display {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "accelerator-activated": (object: number, p0: Clutter.InputDevice, p1: number) => void;
            /** @signal */
            "accelerator-deactivated": (object: number, p0: Clutter.InputDevice, p1: number) => void;
            /** @signal */
            bell: (window: Window | null) => boolean | void;
            /** @signal */
            closing: () => void;
            /** @signal */
            "focus-window": (object: Window, p0: number) => void;
            /** @signal */
            "grab-op-begin": (object: Window, p0: GrabOp, p1: Clutter.Sprite) => void;
            /** @signal */
            "grab-op-end": (object: Window, p0: GrabOp) => void;
            /** @signal */
            "in-fullscreen-changed": () => void;
            /** @signal */
            "init-xserver": (object: Gio.Task) => boolean | void;
            /** @signal */
            "modifiers-accelerator-activated": () => void;
            /** @signal */
            "overlay-key": () => void;
            /** @signal */
            "pad-mode-switch": (object: Clutter.InputDevice, p0: number, p1: number) => void;
            /** @signal */
            restacked: () => void;
            /** @signal */
            "show-osd": (object: number, p0: string, p1: string) => void;
            /** @signal */
            "show-pad-osd": (pad: Clutter.InputDevice, settings: Gio.Settings, layout_path: string, edition_mode: boolean, monitor_idx: number) => Clutter.Actor | null;
            /** @signal */
            "show-resize-popup": (object: boolean, p0: Mtk.Rectangle, p1: number, p2: number) => boolean | void;
            /** @signal */
            "showing-desktop-changed": () => void;
            /** @signal */
            "window-created": (object: Window) => void;
            /** @signal */
            "window-demands-attention": (object: Window) => void;
            /** @signal */
            "window-entered-monitor": (object: number, p0: Window) => void;
            /** @signal */
            "window-left-monitor": (object: number, p0: Window) => void;
            /** @signal */
            "window-marked-urgent": (object: Window) => void;
            /** @signal */
            "window-visibility-updated": (object: null, p0: null, p1: null) => void;
            /** @signal */
            "workareas-changed": () => void;
            /** @signal */
            "x11-display-closing": () => void;
            /** @signal */
            "x11-display-opened": () => void;
            /** @signal */
            "x11-display-setup": () => void;
            "notify::compositor-modifiers": (pspec: GObject.ParamSpec) => void;
            "notify::focus-window": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            compositor_modifiers: Clutter.ModifierType;
            compositorModifiers: Clutter.ModifierType;
            focus_window: Window;
            focusWindow: Window;
        }
    }

    class Display extends GObject.Object {
        static $gtype: GObject.GType<Display>;

        // Properties
        get compositor_modifiers(): Clutter.ModifierType;

        get compositorModifiers(): Clutter.ModifierType;

        get focus_window(): Window;

        get focusWindow(): Window;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Display.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Display.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Display.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Display.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Display.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Display.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Display.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Display.SignalSignatures[K]>): void;

        // Methods
        add_keybinding(name: string, settings: Gio.Settings, flags: KeyBindingFlags, handler: KeyHandlerFunc): number;

        clear_mouse_mode(): void;

        close(timestamp: number): void;

        focus_default_window(timestamp: number): void;

        get_compositor(): Compositor;

        get_compositor_modifiers(): Clutter.ModifierType;

        get_context(): Context;

        get_current_monitor(): number;

        get_current_time(): number;

        get_current_time_roundtrip(): number;

        get_focus_window(): Window;

        get_keybinding_action(keycode: number, mask: bigint | number): number;

        get_last_user_time(): number;

        get_monitor_geometry(monitor: number): Mtk.Rectangle;

        get_monitor_in_fullscreen(monitor: number): boolean;

        get_monitor_index_for_rect(rect: Mtk.Rectangle): number;

        get_monitor_neighbor_index(which_monitor: number, dir: DisplayDirection): number;

        get_monitor_scale(monitor: number): number;

        get_n_monitors(): number;

        get_pad_button_label(pad: Clutter.InputDevice, button_number: number): string;

        get_pad_feature_label(pad: Clutter.InputDevice, feature: PadFeatureType, direction: PadDirection, feature_number: number): string;

        get_primary_monitor(): number;

        get_selection(): Selection;

        get_size(): [number, number];

        get_sound_player(): SoundPlayer;

        get_tab_current(type: TabList, workspace: Workspace): Window;

        get_tab_list(type: TabList, workspace: Workspace | null): Window[];

        get_tab_next(type: TabList, workspace: Workspace, window: Window | null, backward: boolean): Window;

        get_workspace_manager(): WorkspaceManager;

        grab_accelerator(accelerator: string, flags: KeyBindingFlags): number;

        is_grabbed(): boolean;

        list_all_windows(): Window[];

        remove_keybinding(name: string): boolean;

        request_pad_osd(pad: Clutter.InputDevice, edition_mode: boolean): void;

        set_input_focus(window: Window, timestamp: number): void;

        set_x11_origin(x: number, y: number): void;

        sort_windows_by_stacking(windows: Window[]): Window[];

        ungrab_accelerator(action_id: number): boolean;

        unset_input_focus(timestamp: number): void;

        xserver_time_is_before(time1: number, time2: number): boolean;
    }


    namespace Dnd {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "dnd-enter": () => void;
            /** @signal */
            "dnd-leave": () => void;
            /** @signal */
            "dnd-position-change": (object: number, p0: number) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Dnd extends GObject.Object {
        static $gtype: GObject.GType<Dnd>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Dnd.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Dnd.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Dnd.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Dnd.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Dnd.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Dnd.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Dnd.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Dnd.SignalSignatures[K]>): void;
    }


    namespace IdleMonitor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class IdleMonitor extends GObject.Object {
        static $gtype: GObject.GType<IdleMonitor>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: IdleMonitor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<IdleMonitor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof IdleMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IdleMonitor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof IdleMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IdleMonitor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof IdleMonitor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<IdleMonitor.SignalSignatures[K]>): void;

        // Methods
        add_idle_watch(interval_msec: bigint | number, callback: IdleMonitorWatchFunc | null): number;

        add_idle_watch_full(interval_msec: bigint | number, callback: IdleMonitorWatchFunc | null, flags: IdleMonitorWatchFlags): number;

        add_user_active_watch(callback: IdleMonitorWatchFunc | null): number;

        get_idletime(): number;

        remove_watch(id: number): void;
    }


    namespace Laters {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Laters extends GObject.Object {
        static $gtype: GObject.GType<Laters>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Laters.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Laters.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Laters.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Laters.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Laters.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Laters.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Laters.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Laters.SignalSignatures[K]>): void;

        // Methods
        add(when: LaterType, func: GLib.SourceFunc): number;

        remove(later_id: number): void;
    }


    namespace LaunchContext {
        // Signal signatures
        interface SignalSignatures extends Gio.AppLaunchContext.SignalSignatures {
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::timestamp": (pspec: GObject.ParamSpec) => void;
            "notify::workspace": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gio.AppLaunchContext.ConstructorProps {
            display: Display;
            timestamp: number;
            workspace: Workspace;
        }
    }

    class LaunchContext extends Gio.AppLaunchContext {
        static $gtype: GObject.GType<LaunchContext>;

        // Properties
        get display(): Display;

        get timestamp(): number;
        set timestamp(val: number);

        get workspace(): Workspace;
        set workspace(val: Workspace);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: LaunchContext.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<LaunchContext.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof LaunchContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LaunchContext.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof LaunchContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LaunchContext.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof LaunchContext.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<LaunchContext.SignalSignatures[K]>): void;

        // Methods
        set_timestamp(timestamp: number): void;

        set_workspace(workspace: Workspace): void;
    }


    namespace LogicalMonitor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class LogicalMonitor extends GObject.Object {
        static $gtype: GObject.GType<LogicalMonitor>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: LogicalMonitor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<LogicalMonitor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof LogicalMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LogicalMonitor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof LogicalMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LogicalMonitor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof LogicalMonitor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<LogicalMonitor.SignalSignatures[K]>): void;

        // Methods
        get_monitors(): Monitor[];

        get_number(): number;
    }


    namespace Monitor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Monitor extends GObject.Object {
        static $gtype: GObject.GType<Monitor>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Monitor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Monitor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Monitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Monitor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Monitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Monitor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Monitor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Monitor.SignalSignatures[K]>): void;

        // Methods
        get_backlight(): Backlight | null;

        get_color_mode_string(): string;

        get_connector(): string;

        get_display_name(): string;

        get_product(): string;

        get_serial(): string;

        get_vendor(): string;

        is_active(): boolean;

        is_available(): boolean;

        is_builtin(): boolean;

        is_primary(): boolean;

        is_virtual(): boolean;
    }


    namespace MonitorManager {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "confirm-display-change": () => void;
            /** @signal */
            "monitor-privacy-screen-changed": (logical_monitor: LogicalMonitor, enabled: boolean) => void;
            /** @signal */
            "monitors-changed": () => void;
            /** @signal */
            "monitors-changed-internal": () => void;
            /** @signal */
            "monitors-changing": () => void;
            /** @signal */
            "power-save-mode-changed": (object: PowerSaveChangeReason) => void;
            /** @signal */
            rotating: (monitor: number, from: number, to: number) => void;
            "notify::backend": (pspec: GObject.ParamSpec) => void;
            "notify::has-builtin-panel": (pspec: GObject.ParamSpec) => void;
            "notify::night-light-supported": (pspec: GObject.ParamSpec) => void;
            "notify::panel-orientation-managed": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            backend: Backend;
            has_builtin_panel: boolean;
            hasBuiltinPanel: boolean;
            night_light_supported: boolean;
            nightLightSupported: boolean;
            panel_orientation_managed: boolean;
            panelOrientationManaged: boolean;
        }
    }

    class MonitorManager extends GObject.Object {
        static $gtype: GObject.GType<MonitorManager>;

        // Properties
        get backend(): Backend;

        get has_builtin_panel(): boolean;

        get hasBuiltinPanel(): boolean;

        get night_light_supported(): boolean;

        get nightLightSupported(): boolean;

        get panel_orientation_managed(): boolean;

        get panelOrientationManaged(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MonitorManager.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MonitorManager.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof MonitorManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MonitorManager.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MonitorManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MonitorManager.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MonitorManager.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MonitorManager.SignalSignatures[K]>): void;

        // Methods
        can_switch_config(): boolean;

        get_backend(): Backend;

        get_display_configuration_timeout(): number;

        get_is_builtin_display_on(): boolean;

        get_logical_monitors(): LogicalMonitor[] | null;

        get_monitor_for_connector(connector: string): number;

        get_monitors(): Monitor[] | null;

        get_panel_orientation_managed(): boolean;

        get_switch_config(): MonitorSwitchConfigType;

        switch_config(config_type: MonitorSwitchConfigType): void;
    }


    namespace MultiTexture {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class MultiTexture extends GObject.Object {
        static $gtype: GObject.GType<MultiTexture>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MultiTexture.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MultiTexture.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](format: MultiTextureFormat, planes: Cogl.Texture, n_planes: number): MultiTexture;

        static new_simple(plane: Cogl.Texture): MultiTexture;

        // Signals
        /** @signal */
        connect<K extends keyof MultiTexture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MultiTexture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MultiTexture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MultiTexture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MultiTexture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MultiTexture.SignalSignatures[K]>): void;

        // Methods
        add_pipeline_sampling(coeffs: MultiTextureCoefficients, premult: MultiTextureAlphaMode, pipeline: Cogl.Pipeline): void;

        get_format(): MultiTextureFormat;

        get_height(): number;

        get_n_planes(): number;

        get_plane(index: number): Cogl.Texture;

        get_width(): number;

        is_simple(): boolean;

        to_string(): string;
    }


    namespace OrientationManager {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "orientation-changed": () => void;
            /** @signal */
            "sensor-active": () => void;
            "notify::has-accelerometer": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            has_accelerometer: boolean;
            hasAccelerometer: boolean;
        }
    }

    class OrientationManager extends GObject.Object {
        static $gtype: GObject.GType<OrientationManager>;

        // Properties
        get has_accelerometer(): boolean;

        get hasAccelerometer(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: OrientationManager.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<OrientationManager.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof OrientationManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, OrientationManager.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof OrientationManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, OrientationManager.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof OrientationManager.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<OrientationManager.SignalSignatures[K]>): void;

        // Methods
        get_orientation(): Orientation;

        inhibit_tracking(): void;

        uninhibit_tracking(): void;
    }


    namespace Plugin {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class Plugin extends GObject.Object {
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
        static manager_set_plugin_type(gtype: GObject.GType): void;

        // Virtual methods
        vfunc_confirm_display_change(): void;

        vfunc_create_close_dialog(window: Window): CloseDialog | null;

        vfunc_create_inhibit_shortcuts_dialog(window: Window): InhibitShortcutsDialog;

        vfunc_destroy(actor: WindowActor): void;

        vfunc_hide_tile_preview(): void;

        vfunc_keybinding_filter(binding: KeyBinding): boolean;

        vfunc_kill_switch_workspace(): void;

        vfunc_kill_window_effects(actor: WindowActor): void;

        vfunc_locate_pointer(): void;

        vfunc_map(actor: WindowActor): void;

        vfunc_minimize(actor: WindowActor): void;

        vfunc_show_tile_preview(window: Window, tile_rect: Mtk.Rectangle, tile_monitor_number: number): void;

        vfunc_show_window_menu(window: Window, menu: WindowMenuType, x: number, y: number): void;

        vfunc_show_window_menu_for_rect(window: Window, menu: WindowMenuType, rect: Mtk.Rectangle): void;

        vfunc_size_change(actor: WindowActor, which_change: SizeChange, old_frame_rect: Mtk.Rectangle, old_buffer_rect: Mtk.Rectangle): void;

        vfunc_size_changed(actor: WindowActor): void;

        vfunc_start(): void;

        vfunc_switch_workspace(from: number, to: number, direction: MotionDirection): void;

        vfunc_unminimize(actor: WindowActor): void;

        // Methods
        complete_display_change(ok: boolean): void;

        destroy_completed(actor: WindowActor): void;

        get_display(): Display;

        map_completed(actor: WindowActor): void;

        minimize_completed(actor: WindowActor): void;

        size_change_completed(actor: WindowActor): void;

        switch_workspace_completed(): void;

        unminimize_completed(actor: WindowActor): void;
    }


    namespace RemoteAccessController {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "new-handle": (object: RemoteAccessHandle) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class RemoteAccessController extends GObject.Object {
        static $gtype: GObject.GType<RemoteAccessController>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: RemoteAccessController.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<RemoteAccessController.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof RemoteAccessController.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RemoteAccessController.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof RemoteAccessController.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RemoteAccessController.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof RemoteAccessController.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<RemoteAccessController.SignalSignatures[K]>): void;

        // Methods
        inhibit_remote_access(): void;

        uninhibit_remote_access(): void;
    }


    namespace RemoteAccessHandle {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            stopped: () => void;
            "notify::is-recording": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            is_recording: boolean;
            isRecording: boolean;
        }
    }

    class RemoteAccessHandle extends GObject.Object {
        static $gtype: GObject.GType<RemoteAccessHandle>;

        // Properties
        get is_recording(): boolean;

        get isRecording(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: RemoteAccessHandle.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<RemoteAccessHandle.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof RemoteAccessHandle.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RemoteAccessHandle.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof RemoteAccessHandle.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RemoteAccessHandle.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof RemoteAccessHandle.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<RemoteAccessHandle.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_stop(): void;

        // Methods
        get_disable_animations(): boolean;

        stop(): void;
    }


    namespace Selection {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "owner-changed": (object: number, p0: SelectionSource) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Selection extends GObject.Object {
        static $gtype: GObject.GType<Selection>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Selection.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Selection.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](display: Display): Selection;

        // Signals
        /** @signal */
        connect<K extends keyof Selection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Selection.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Selection.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Selection.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Selection.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Selection.SignalSignatures[K]>): void;

        // Methods
        get_mimetypes(selection_type: SelectionType): string[];

        set_owner(selection_type: SelectionType, owner: SelectionSource): void;

        transfer_async(selection_type: SelectionType, mimetype: string, size: bigint | number, output: Gio.OutputStream, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        transfer_async(selection_type: SelectionType, mimetype: string, size: bigint | number, output: Gio.OutputStream, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        transfer_async(selection_type: SelectionType, mimetype: string, size: bigint | number, output: Gio.OutputStream, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        transfer_finish(result: Gio.AsyncResult): boolean;

        unset_owner(selection_type: SelectionType, owner: SelectionSource): void;
    }


    namespace SelectionSource {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            activated: () => void;
            /** @signal */
            deactivated: () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class SelectionSource extends GObject.Object {
        static $gtype: GObject.GType<SelectionSource>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SelectionSource.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SelectionSource.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof SelectionSource.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SelectionSource.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SelectionSource.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SelectionSource.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SelectionSource.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SelectionSource.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_activated(): void;

        vfunc_deactivated(): void;

        vfunc_get_mimetypes(): string[];

        vfunc_read_async(mimetype: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_read_finish(result: Gio.AsyncResult): Gio.InputStream;

        // Methods
        get_mimetypes(): string[];

        is_active(): boolean;

        read_async(mimetype: string, cancellable: Gio.Cancellable | null): globalThis.Promise<Gio.InputStream>;

        read_async(mimetype: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        read_async(mimetype: string, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Gio.InputStream> | void;

        read_finish(result: Gio.AsyncResult): Gio.InputStream;
    }


    namespace SelectionSourceMemory {
        // Signal signatures
        interface SignalSignatures extends SelectionSource.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends SelectionSource.ConstructorProps {}
    }

    class SelectionSourceMemory extends SelectionSource {
        static $gtype: GObject.GType<SelectionSourceMemory>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SelectionSourceMemory.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SelectionSourceMemory.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](mimetype: string, content: GLib.Bytes | Uint8Array): SelectionSourceMemory;

        // Signals
        /** @signal */
        connect<K extends keyof SelectionSourceMemory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SelectionSourceMemory.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SelectionSourceMemory.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SelectionSourceMemory.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SelectionSourceMemory.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SelectionSourceMemory.SignalSignatures[K]>): void;
    }


    namespace ShapedTexture {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, Clutter.Content.SignalSignatures {
            /** @signal */
            "size-changed": () => void;
            "notify::clutter-context": (pspec: GObject.ParamSpec) => void;
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Clutter.Content.ConstructorProps {
            clutter_context: Clutter.Context;
            clutterContext: Clutter.Context;
            color_state: Clutter.ColorState;
            colorState: Clutter.ColorState;
        }
    }

    class ShapedTexture extends GObject.Object implements Clutter.Content {
        static $gtype: GObject.GType<ShapedTexture>;

        // Properties
        get clutter_context(): Clutter.Context;

        get clutterContext(): Clutter.Context;

        get color_state(): Clutter.ColorState;

        get colorState(): Clutter.ColorState;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ShapedTexture.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ShapedTexture.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ShapedTexture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ShapedTexture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ShapedTexture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ShapedTexture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ShapedTexture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ShapedTexture.SignalSignatures[K]>): void;

        // Methods
        get_texture(): MultiTexture;

        paint_to_bitmap(clip: Mtk.Rectangle | null, format: Cogl.PixelFormat): Cogl.Bitmap | null;

        set_create_mipmaps(create_mipmaps: boolean): void;

        set_mask_texture(mask_texture: Cogl.Texture): void;

        get_preferred_size(): [boolean, number, number];

        invalidate(): void;

        invalidate_size(): void;

        vfunc_attached(actor: Clutter.Actor): void;

        vfunc_detached(actor: Clutter.Actor): void;

        vfunc_get_preferred_size(): [boolean, number, number];

        vfunc_invalidate(): void;

        vfunc_invalidate_size(): void;

        vfunc_paint_content(actor: Clutter.Actor, node: Clutter.PaintNode, paint_context: Clutter.PaintContext): void;
    }


    namespace SoundPlayer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class SoundPlayer extends GObject.Object {
        static $gtype: GObject.GType<SoundPlayer>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SoundPlayer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SoundPlayer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof SoundPlayer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SoundPlayer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SoundPlayer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SoundPlayer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SoundPlayer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SoundPlayer.SignalSignatures[K]>): void;

        // Methods
        play_from_file(file: Gio.File, description: string, cancellable: Gio.Cancellable | null): void;

        play_from_theme(name: string, description: string, cancellable: Gio.Cancellable | null): void;
    }


    namespace Stage {
        // Signal signatures
        interface SignalSignatures extends Clutter.Stage.SignalSignatures {
            "notify::is-grabbed": (pspec: GObject.ParamSpec) => void;
            "notify::key-focus": (pspec: GObject.ParamSpec) => void;
            "notify::perspective": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-name": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-role": (pspec: GObject.ParamSpec) => void;
            "notify::actions": (pspec: GObject.ParamSpec) => void;
            "notify::allocation": (pspec: GObject.ParamSpec) => void;
            "notify::background-color": (pspec: GObject.ParamSpec) => void;
            "notify::background-color-set": (pspec: GObject.ParamSpec) => void;
            "notify::child-transform": (pspec: GObject.ParamSpec) => void;
            "notify::child-transform-set": (pspec: GObject.ParamSpec) => void;
            "notify::clip-rect": (pspec: GObject.ParamSpec) => void;
            "notify::clip-to-allocation": (pspec: GObject.ParamSpec) => void;
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::constraints": (pspec: GObject.ParamSpec) => void;
            "notify::content": (pspec: GObject.ParamSpec) => void;
            "notify::content-box": (pspec: GObject.ParamSpec) => void;
            "notify::content-gravity": (pspec: GObject.ParamSpec) => void;
            "notify::content-repeat": (pspec: GObject.ParamSpec) => void;
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::cursor-type": (pspec: GObject.ParamSpec) => void;
            "notify::effect": (pspec: GObject.ParamSpec) => void;
            "notify::first-child": (pspec: GObject.ParamSpec) => void;
            "notify::fixed-position-set": (pspec: GObject.ParamSpec) => void;
            "notify::fixed-x": (pspec: GObject.ParamSpec) => void;
            "notify::fixed-y": (pspec: GObject.ParamSpec) => void;
            "notify::has-clip": (pspec: GObject.ParamSpec) => void;
            "notify::has-pointer": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::last-child": (pspec: GObject.ParamSpec) => void;
            "notify::layout-manager": (pspec: GObject.ParamSpec) => void;
            "notify::magnification-filter": (pspec: GObject.ParamSpec) => void;
            "notify::mapped": (pspec: GObject.ParamSpec) => void;
            "notify::margin-bottom": (pspec: GObject.ParamSpec) => void;
            "notify::margin-left": (pspec: GObject.ParamSpec) => void;
            "notify::margin-right": (pspec: GObject.ParamSpec) => void;
            "notify::margin-top": (pspec: GObject.ParamSpec) => void;
            "notify::min-height": (pspec: GObject.ParamSpec) => void;
            "notify::min-height-set": (pspec: GObject.ParamSpec) => void;
            "notify::min-width": (pspec: GObject.ParamSpec) => void;
            "notify::min-width-set": (pspec: GObject.ParamSpec) => void;
            "notify::minification-filter": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::natural-height": (pspec: GObject.ParamSpec) => void;
            "notify::natural-height-set": (pspec: GObject.ParamSpec) => void;
            "notify::natural-width": (pspec: GObject.ParamSpec) => void;
            "notify::natural-width-set": (pspec: GObject.ParamSpec) => void;
            "notify::offscreen-redirect": (pspec: GObject.ParamSpec) => void;
            "notify::opacity": (pspec: GObject.ParamSpec) => void;
            "notify::pivot-point": (pspec: GObject.ParamSpec) => void;
            "notify::pivot-point-z": (pspec: GObject.ParamSpec) => void;
            "notify::position": (pspec: GObject.ParamSpec) => void;
            "notify::reactive": (pspec: GObject.ParamSpec) => void;
            "notify::realized": (pspec: GObject.ParamSpec) => void;
            "notify::request-mode": (pspec: GObject.ParamSpec) => void;
            "notify::rotation-angle-x": (pspec: GObject.ParamSpec) => void;
            "notify::rotation-angle-y": (pspec: GObject.ParamSpec) => void;
            "notify::rotation-angle-z": (pspec: GObject.ParamSpec) => void;
            "notify::scale-x": (pspec: GObject.ParamSpec) => void;
            "notify::scale-y": (pspec: GObject.ParamSpec) => void;
            "notify::scale-z": (pspec: GObject.ParamSpec) => void;
            "notify::show-on-set-parent": (pspec: GObject.ParamSpec) => void;
            "notify::size": (pspec: GObject.ParamSpec) => void;
            "notify::text-direction": (pspec: GObject.ParamSpec) => void;
            "notify::transform": (pspec: GObject.ParamSpec) => void;
            "notify::transform-set": (pspec: GObject.ParamSpec) => void;
            "notify::translation-x": (pspec: GObject.ParamSpec) => void;
            "notify::translation-y": (pspec: GObject.ParamSpec) => void;
            "notify::translation-z": (pspec: GObject.ParamSpec) => void;
            "notify::visible": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
            "notify::x": (pspec: GObject.ParamSpec) => void;
            "notify::x-align": (pspec: GObject.ParamSpec) => void;
            "notify::x-expand": (pspec: GObject.ParamSpec) => void;
            "notify::y": (pspec: GObject.ParamSpec) => void;
            "notify::y-align": (pspec: GObject.ParamSpec) => void;
            "notify::y-expand": (pspec: GObject.ParamSpec) => void;
            "notify::z-position": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Clutter.Stage.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {}
    }

    class Stage extends Clutter.Stage implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<Stage>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Stage.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Stage.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Stage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Stage.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Stage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Stage.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Stage.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Stage.SignalSignatures[K]>): void;
    }


    namespace StartupNotification {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            changed: (object: StartupSequence) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            display: Display;
        }
    }

    class StartupNotification extends GObject.Object {
        static $gtype: GObject.GType<StartupNotification>;

        // Properties
        get display(): Display;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: StartupNotification.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<StartupNotification.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof StartupNotification.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StartupNotification.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof StartupNotification.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StartupNotification.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof StartupNotification.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<StartupNotification.SignalSignatures[K]>): void;

        // Methods
        create_launcher(): LaunchContext;

        get_sequences(): StartupSequence[];
    }


    namespace StartupSequence {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            complete: () => void;
            /** @signal */
            timeout: () => void;
            "notify::application-id": (pspec: GObject.ParamSpec) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::icon-name": (pspec: GObject.ParamSpec) => void;
            "notify::id": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::timestamp": (pspec: GObject.ParamSpec) => void;
            "notify::wmclass": (pspec: GObject.ParamSpec) => void;
            "notify::workspace": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            application_id: string | null;
            applicationId: string | null;
            display: Display;
            icon_name: string | null;
            iconName: string | null;
            id: string;
            name: string;
            timestamp: bigint | number;
            wmclass: string | null;
            workspace: number;
        }
    }

    class StartupSequence extends GObject.Object {
        static $gtype: GObject.GType<StartupSequence>;

        // Properties
        get application_id(): string | null;

        get applicationId(): string | null;

        get display(): Display;

        get icon_name(): string | null;

        get iconName(): string | null;

        get id(): string;

        get name(): string;

        get timestamp(): number;

        get wmclass(): string | null;

        get workspace(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: StartupSequence.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<StartupSequence.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof StartupSequence.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StartupSequence.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof StartupSequence.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StartupSequence.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof StartupSequence.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<StartupSequence.SignalSignatures[K]>): void;

        // Methods
        complete(): void;

        get_application_id(): string | null;

        get_completed(): boolean;

        get_icon_name(): string | null;

        get_id(): string;

        get_name(): string;

        get_timestamp(): number;

        get_wmclass(): string | null;

        get_workspace(): number;
    }


    namespace WaylandClient {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "client-destroyed": () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class WaylandClient extends GObject.Object {
        static $gtype: GObject.GType<WaylandClient>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WaylandClient.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WaylandClient.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_subprocess(context: Context, launcher: Gio.SubprocessLauncher, argv: string[]): WaylandClient;

        // Signals
        /** @signal */
        connect<K extends keyof WaylandClient.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WaylandClient.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WaylandClient.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WaylandClient.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WaylandClient.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WaylandClient.SignalSignatures[K]>): void;

        // Methods
        get_pid(): never;

        get_subprocess(): Gio.Subprocess;

        owns_window(window: Window): boolean;
    }


    namespace WaylandCompositor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "prepare-shutdown": () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class WaylandCompositor extends GObject.Object {
        static $gtype: GObject.GType<WaylandCompositor>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WaylandCompositor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WaylandCompositor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof WaylandCompositor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WaylandCompositor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WaylandCompositor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WaylandCompositor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WaylandCompositor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WaylandCompositor.SignalSignatures[K]>): void;

        // Methods
        get_wayland_display(): null;

        keep_touchpad_gestures(keep: boolean): void;
    }


    namespace WaylandSurface {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "actor-changed": () => void;
            /** @signal */
            configure: () => void;
            /** @signal */
            destroy: () => void;
            /** @signal */
            "geometry-changed": () => void;
            /** @signal */
            "pre-state-applied": () => void;
            /** @signal */
            "shortcuts-inhibited": () => void;
            /** @signal */
            "shortcuts-restored": () => void;
            /** @signal */
            unmapped: () => void;
            "notify::main-monitor": (pspec: GObject.ParamSpec) => void;
            "notify::window": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            main_monitor: LogicalMonitor;
            mainMonitor: LogicalMonitor;
            window: Window | null;
        }
    }

    class WaylandSurface extends GObject.Object {
        static $gtype: GObject.GType<WaylandSurface>;

        // Properties
        get main_monitor(): LogicalMonitor;
        set main_monitor(val: LogicalMonitor);

        get mainMonitor(): LogicalMonitor;
        set mainMonitor(val: LogicalMonitor);

        get window(): Window | null;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WaylandSurface.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WaylandSurface.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof WaylandSurface.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WaylandSurface.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WaylandSurface.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WaylandSurface.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WaylandSurface.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WaylandSurface.SignalSignatures[K]>): void;

        // Methods
        get_window(): Window | null;
    }


    namespace Window {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            configure: (window_config: WindowConfig) => void;
            /** @signal */
            focus: () => void;
            /** @signal */
            "highest-scale-monitor-changed": () => void;
            /** @signal */
            "position-changed": () => void;
            /** @signal */
            raised: () => void;
            /** @signal */
            shown: () => void;
            /** @signal */
            "size-changed": () => void;
            /** @signal */
            unmanaged: () => void;
            /** @signal */
            unmanaging: () => void;
            /** @signal */
            "workspace-changed": () => void;
            "notify::a11y-dbus-name": (pspec: GObject.ParamSpec) => void;
            "notify::a11y-object-path": (pspec: GObject.ParamSpec) => void;
            "notify::above": (pspec: GObject.ParamSpec) => void;
            "notify::appears-focused": (pspec: GObject.ParamSpec) => void;
            "notify::content-type": (pspec: GObject.ParamSpec) => void;
            "notify::decorated": (pspec: GObject.ParamSpec) => void;
            "notify::demands-attention": (pspec: GObject.ParamSpec) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::effect": (pspec: GObject.ParamSpec) => void;
            "notify::fullscreen": (pspec: GObject.ParamSpec) => void;
            "notify::gtk-app-menu-object-path": (pspec: GObject.ParamSpec) => void;
            "notify::gtk-application-id": (pspec: GObject.ParamSpec) => void;
            "notify::gtk-application-object-path": (pspec: GObject.ParamSpec) => void;
            "notify::gtk-menubar-object-path": (pspec: GObject.ParamSpec) => void;
            "notify::gtk-unique-bus-name": (pspec: GObject.ParamSpec) => void;
            "notify::gtk-window-object-path": (pspec: GObject.ParamSpec) => void;
            "notify::is-alive": (pspec: GObject.ParamSpec) => void;
            "notify::magnification": (pspec: GObject.ParamSpec) => void;
            "notify::main-monitor": (pspec: GObject.ParamSpec) => void;
            "notify::mapped": (pspec: GObject.ParamSpec) => void;
            "notify::maximized-horizontally": (pspec: GObject.ParamSpec) => void;
            "notify::maximized-vertically": (pspec: GObject.ParamSpec) => void;
            "notify::minimized": (pspec: GObject.ParamSpec) => void;
            "notify::mutter-hints": (pspec: GObject.ParamSpec) => void;
            "notify::on-all-workspaces": (pspec: GObject.ParamSpec) => void;
            "notify::resizeable": (pspec: GObject.ParamSpec) => void;
            "notify::skip-taskbar": (pspec: GObject.ParamSpec) => void;
            "notify::tag": (pspec: GObject.ParamSpec) => void;
            "notify::title": (pspec: GObject.ParamSpec) => void;
            "notify::titlebar-height": (pspec: GObject.ParamSpec) => void;
            "notify::toplevel-icon": (pspec: GObject.ParamSpec) => void;
            "notify::unconstrained": (pspec: GObject.ParamSpec) => void;
            "notify::urgent": (pspec: GObject.ParamSpec) => void;
            "notify::user-time": (pspec: GObject.ParamSpec) => void;
            "notify::variable-refresh": (pspec: GObject.ParamSpec) => void;
            "notify::window-type": (pspec: GObject.ParamSpec) => void;
            "notify::wm-class": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Gio.Initable.ConstructorProps {
            a11y_dbus_name: string;
            a11yDbusName: string;
            a11y_object_path: string;
            a11yObjectPath: string;
            above: boolean;
            appears_focused: boolean;
            appearsFocused: boolean;
            content_type: WindowContentType;
            contentType: WindowContentType;
            decorated: boolean;
            demands_attention: boolean;
            demandsAttention: boolean;
            display: Display;
            effect: number;
            fullscreen: boolean;
            gtk_app_menu_object_path: string | null;
            gtkAppMenuObjectPath: string | null;
            gtk_application_id: string | null;
            gtkApplicationId: string | null;
            gtk_application_object_path: string | null;
            gtkApplicationObjectPath: string | null;
            gtk_menubar_object_path: string | null;
            gtkMenubarObjectPath: string | null;
            gtk_unique_bus_name: string | null;
            gtkUniqueBusName: string | null;
            gtk_window_object_path: string | null;
            gtkWindowObjectPath: string | null;
            is_alive: boolean;
            isAlive: boolean;
            magnification: number;
            main_monitor: LogicalMonitor;
            mainMonitor: LogicalMonitor;
            mapped: boolean;
            maximized_horizontally: boolean;
            maximizedHorizontally: boolean;
            maximized_vertically: boolean;
            maximizedVertically: boolean;
            minimized: boolean;
            mutter_hints: string | null;
            mutterHints: string | null;
            on_all_workspaces: boolean;
            onAllWorkspaces: boolean;
            resizeable: boolean;
            skip_taskbar: boolean;
            skipTaskbar: boolean;
            tag: string | null;
            title: string;
            titlebar_height: number;
            titlebarHeight: number;
            toplevel_icon: Gio.Icon | null;
            toplevelIcon: Gio.Icon | null;
            unconstrained: boolean;
            urgent: boolean;
            user_time: number;
            userTime: number;
            variable_refresh: boolean;
            variableRefresh: boolean;
            window_type: WindowType;
            windowType: WindowType;
            wm_class: string | null;
            wmClass: string | null;
        }
    }

    abstract class Window extends GObject.Object implements Gio.Initable {
        static $gtype: GObject.GType<Window>;

        // Properties
        get a11y_dbus_name(): string;

        get a11yDbusName(): string;

        get a11y_object_path(): string;

        get a11yObjectPath(): string;

        get above(): boolean;

        get appears_focused(): boolean;

        get appearsFocused(): boolean;

        get content_type(): WindowContentType;

        get contentType(): WindowContentType;

        get decorated(): boolean;

        get demands_attention(): boolean;

        get demandsAttention(): boolean;

        get display(): Display;

        get effect(): number;

        get fullscreen(): boolean;

        get gtk_app_menu_object_path(): string | null;

        get gtkAppMenuObjectPath(): string | null;

        get gtk_application_id(): string | null;

        get gtkApplicationId(): string | null;

        get gtk_application_object_path(): string | null;

        get gtkApplicationObjectPath(): string | null;

        get gtk_menubar_object_path(): string | null;

        get gtkMenubarObjectPath(): string | null;

        get gtk_unique_bus_name(): string | null;

        get gtkUniqueBusName(): string | null;

        get gtk_window_object_path(): string | null;

        get gtkWindowObjectPath(): string | null;

        get is_alive(): boolean;

        get isAlive(): boolean;

        get magnification(): number;
        set magnification(val: number);

        get main_monitor(): LogicalMonitor;

        get mainMonitor(): LogicalMonitor;

        get mapped(): boolean;

        get maximized_horizontally(): boolean;

        get maximizedHorizontally(): boolean;

        get maximized_vertically(): boolean;

        get maximizedVertically(): boolean;

        get minimized(): boolean;

        get mutter_hints(): string | null;

        get mutterHints(): string | null;

        get on_all_workspaces(): boolean;

        get onAllWorkspaces(): boolean;

        get resizeable(): boolean;

        get skip_taskbar(): boolean;

        get skipTaskbar(): boolean;

        get tag(): string | null;

        get title(): string;

        get titlebar_height(): number;

        get titlebarHeight(): number;

        get toplevel_icon(): Gio.Icon | null;

        get toplevelIcon(): Gio.Icon | null;

        get unconstrained(): boolean;
        set unconstrained(val: boolean);

        get urgent(): boolean;

        get user_time(): number;

        get userTime(): number;

        get variable_refresh(): boolean;
        set variable_refresh(val: boolean);

        get variableRefresh(): boolean;
        set variableRefresh(val: boolean);

        get window_type(): WindowType;

        get windowType(): WindowType;

        get wm_class(): string | null;

        get wmClass(): string | null;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Window.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Window.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Window.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Window.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Window.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Window.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Window.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Window.SignalSignatures[K]>): void;

        // Methods
        activate(current_time: number): void;

        activate_with_workspace(current_time: number, workspace: Workspace): void;

        add_external_constraint(constraint: ExternalConstraint): void;

        allows_move(): boolean;

        allows_resize(): boolean;

        begin_grab_op(op: GrabOp, sprite: Clutter.Sprite | null, timestamp: number, pos_hint: Graphene.Point | null): boolean;

        can_close(): boolean;

        can_maximize(): boolean;

        can_minimize(): boolean;

        change_workspace(workspace: Workspace): void;

        change_workspace_by_index(space_index: number, append: boolean): void;

        check_alive(timestamp: number): void;

        client_rect_to_frame_rect(client_rect: Mtk.Rectangle): Mtk.Rectangle;

        ["delete"](timestamp: number): void;

        find_root_ancestor(): Window;

        focus(timestamp: number): void;

        force_restore_shortcuts(source: Clutter.InputDevice): void;

        foreach_ancestor(func: WindowForeachFunc): void;

        foreach_transient(func: WindowForeachFunc): void;

        frame_rect_to_client_rect(frame_rect: Mtk.Rectangle): Mtk.Rectangle;

        get_buffer_rect(): Mtk.Rectangle;

        get_client_content_rect(): Mtk.Rectangle;

        get_client_type(): WindowClientType;

        get_compositor_private<T = GObject.Object>(): T;

        get_content_type(): WindowContentType;

        get_description(): string;

        get_display(): Display;

        get_frame_rect(): Mtk.Rectangle;

        get_frame_type(): FrameType;

        get_gtk_app_menu_object_path(): string | null;

        get_gtk_application_id(): string | null;

        get_gtk_application_object_path(): string | null;

        get_gtk_menubar_object_path(): string | null;

        get_gtk_unique_bus_name(): string | null;

        get_gtk_window_object_path(): string | null;

        get_icon_geometry(): [boolean, Mtk.Rectangle];

        get_id(): number;

        get_layer(): StackLayer;

        get_magnification(): number;

        get_max_size(): [boolean, number, number];

        get_maximize_flags(): MaximizeFlags;

        get_min_size(): [boolean, number, number];

        get_monitor(): number;

        get_mutter_hints(): string | null;

        get_pid(): never;

        get_role(): string;

        get_sandboxed_app_id(): string | null;

        get_stable_sequence(): number;

        get_startup_id(): string | null;

        get_tag(): string | null;

        get_target_frame_rect(): Mtk.Rectangle;

        get_tile_match(): Window | null;

        get_tiled_edges(): Direction;

        get_title(): string;

        get_titlebar_height(): number;

        get_toplevel_icon(): Gio.Icon | null;

        get_transient_for(): Window | null;

        get_user_time(): number;

        get_variable_refresh(): boolean;

        get_window_type(): WindowType;

        get_wm_class(): string | null;

        get_wm_class_instance(): string | null;

        get_work_area_all_monitors(): Mtk.Rectangle;

        get_work_area_current_monitor(): Mtk.Rectangle;

        get_work_area_for_monitor(which_monitor: number): Mtk.Rectangle;

        get_workspace(): Workspace;

        has_attached_dialogs(): boolean;

        has_focus(): boolean;

        has_pointer(): boolean;

        has_rounded_corners(): boolean;

        hide_from_window_list(): void;

        inhibit_mapped(): void;

        is_above(): boolean;

        is_always_on_all_workspaces(): boolean;

        is_ancestor_of_transient(_transient: Window): boolean;

        is_attached_dialog(): boolean;

        is_fullscreen(): boolean;

        is_hidden(): boolean;

        is_mapped_inhibited(): boolean;

        is_maximized(): boolean;

        is_monitor_sized(): boolean;

        is_on_all_workspaces(): boolean;

        is_on_primary_monitor(): boolean;

        is_override_redirect(): boolean;

        is_remote(): boolean;

        is_screen_sized(): boolean;

        is_skip_taskbar(): boolean;

        is_unconstrained(): boolean;

        is_unsandboxed(): boolean;

        kill(): void;

        located_on_workspace(workspace: Workspace): boolean;

        lower(): void;

        lower_with_transients(timestamp: number): void;

        make_above(): void;

        make_fullscreen(): void;

        maximize(): void;

        minimize(): void;

        move_frame(user_op: boolean, root_x_nw: number, root_y_nw: number): void;

        move_resize_frame(user_op: boolean, root_x_nw: number, root_y_nw: number, w: number, h: number): void;

        move_to_monitor(monitor: number): void;

        protocol_to_stage_rect(protocol_rect: Mtk.Rectangle): Mtk.Rectangle;

        raise(): void;

        raise_and_make_recent_on_workspace(workspace: Workspace): void;

        remove_external_constraint(constraint: ExternalConstraint): void;

        set_compositor_private(priv: GObject.Object): void;

        set_demands_attention(): void;

        set_icon_geometry(rect: Mtk.Rectangle | null): void;

        set_magnification(magnification: number): void;

        set_maximize_flags(directions: MaximizeFlags): void;

        set_tiled_edges(edges: Direction): void;

        set_type(type: WindowType): void;

        set_unconstrained(unconstrained: boolean): void;

        set_unmaximize_flags(directions: MaximizeFlags): void;

        set_variable_refresh(variable_refresh: boolean): void;

        shortcuts_inhibited(source: Clutter.InputDevice): boolean;

        show_in_window_list(): void;

        showing_on_its_workspace(): boolean;

        stage_to_protocol_rect(stage_rect: Mtk.Rectangle): Mtk.Rectangle;

        stick(): void;

        uninhibit_mapped(): void;

        unmake_above(): void;

        unmake_fullscreen(): void;

        unmaximize(): void;

        unminimize(): void;

        unset_demands_attention(): void;

        unstick(): void;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace WindowActor {
        // Signal signatures
        interface SignalSignatures extends Clutter.Actor.SignalSignatures {
            /** @signal */
            damaged: () => void;
            /** @signal */
            "effects-completed": () => void;
            /** @signal */
            "first-frame": () => void;
            /** @signal */
            thawed: () => void;
            "notify::meta-window": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-name": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-role": (pspec: GObject.ParamSpec) => void;
            "notify::actions": (pspec: GObject.ParamSpec) => void;
            "notify::allocation": (pspec: GObject.ParamSpec) => void;
            "notify::background-color": (pspec: GObject.ParamSpec) => void;
            "notify::background-color-set": (pspec: GObject.ParamSpec) => void;
            "notify::child-transform": (pspec: GObject.ParamSpec) => void;
            "notify::child-transform-set": (pspec: GObject.ParamSpec) => void;
            "notify::clip-rect": (pspec: GObject.ParamSpec) => void;
            "notify::clip-to-allocation": (pspec: GObject.ParamSpec) => void;
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::constraints": (pspec: GObject.ParamSpec) => void;
            "notify::content": (pspec: GObject.ParamSpec) => void;
            "notify::content-box": (pspec: GObject.ParamSpec) => void;
            "notify::content-gravity": (pspec: GObject.ParamSpec) => void;
            "notify::content-repeat": (pspec: GObject.ParamSpec) => void;
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::cursor-type": (pspec: GObject.ParamSpec) => void;
            "notify::effect": (pspec: GObject.ParamSpec) => void;
            "notify::first-child": (pspec: GObject.ParamSpec) => void;
            "notify::fixed-position-set": (pspec: GObject.ParamSpec) => void;
            "notify::fixed-x": (pspec: GObject.ParamSpec) => void;
            "notify::fixed-y": (pspec: GObject.ParamSpec) => void;
            "notify::has-clip": (pspec: GObject.ParamSpec) => void;
            "notify::has-pointer": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::last-child": (pspec: GObject.ParamSpec) => void;
            "notify::layout-manager": (pspec: GObject.ParamSpec) => void;
            "notify::magnification-filter": (pspec: GObject.ParamSpec) => void;
            "notify::mapped": (pspec: GObject.ParamSpec) => void;
            "notify::margin-bottom": (pspec: GObject.ParamSpec) => void;
            "notify::margin-left": (pspec: GObject.ParamSpec) => void;
            "notify::margin-right": (pspec: GObject.ParamSpec) => void;
            "notify::margin-top": (pspec: GObject.ParamSpec) => void;
            "notify::min-height": (pspec: GObject.ParamSpec) => void;
            "notify::min-height-set": (pspec: GObject.ParamSpec) => void;
            "notify::min-width": (pspec: GObject.ParamSpec) => void;
            "notify::min-width-set": (pspec: GObject.ParamSpec) => void;
            "notify::minification-filter": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::natural-height": (pspec: GObject.ParamSpec) => void;
            "notify::natural-height-set": (pspec: GObject.ParamSpec) => void;
            "notify::natural-width": (pspec: GObject.ParamSpec) => void;
            "notify::natural-width-set": (pspec: GObject.ParamSpec) => void;
            "notify::offscreen-redirect": (pspec: GObject.ParamSpec) => void;
            "notify::opacity": (pspec: GObject.ParamSpec) => void;
            "notify::pivot-point": (pspec: GObject.ParamSpec) => void;
            "notify::pivot-point-z": (pspec: GObject.ParamSpec) => void;
            "notify::position": (pspec: GObject.ParamSpec) => void;
            "notify::reactive": (pspec: GObject.ParamSpec) => void;
            "notify::realized": (pspec: GObject.ParamSpec) => void;
            "notify::request-mode": (pspec: GObject.ParamSpec) => void;
            "notify::rotation-angle-x": (pspec: GObject.ParamSpec) => void;
            "notify::rotation-angle-y": (pspec: GObject.ParamSpec) => void;
            "notify::rotation-angle-z": (pspec: GObject.ParamSpec) => void;
            "notify::scale-x": (pspec: GObject.ParamSpec) => void;
            "notify::scale-y": (pspec: GObject.ParamSpec) => void;
            "notify::scale-z": (pspec: GObject.ParamSpec) => void;
            "notify::show-on-set-parent": (pspec: GObject.ParamSpec) => void;
            "notify::size": (pspec: GObject.ParamSpec) => void;
            "notify::text-direction": (pspec: GObject.ParamSpec) => void;
            "notify::transform": (pspec: GObject.ParamSpec) => void;
            "notify::transform-set": (pspec: GObject.ParamSpec) => void;
            "notify::translation-x": (pspec: GObject.ParamSpec) => void;
            "notify::translation-y": (pspec: GObject.ParamSpec) => void;
            "notify::translation-z": (pspec: GObject.ParamSpec) => void;
            "notify::visible": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
            "notify::x": (pspec: GObject.ParamSpec) => void;
            "notify::x-align": (pspec: GObject.ParamSpec) => void;
            "notify::x-expand": (pspec: GObject.ParamSpec) => void;
            "notify::y": (pspec: GObject.ParamSpec) => void;
            "notify::y-align": (pspec: GObject.ParamSpec) => void;
            "notify::y-expand": (pspec: GObject.ParamSpec) => void;
            "notify::z-position": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Clutter.Actor.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {
            meta_window: Window | null;
            metaWindow: Window | null;
        }
    }

    abstract class WindowActor extends Clutter.Actor implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<WindowActor>;

        // Properties
        get meta_window(): Window | null;

        get metaWindow(): Window | null;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WindowActor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WindowActor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof WindowActor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WindowActor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WindowActor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WindowActor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WindowActor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WindowActor.SignalSignatures[K]>): void;

        // Methods
        freeze(): void;

        get_meta_window(): Window | null;

        get_texture(): ShapedTexture | null;

        is_destroyed(): boolean;

        paint_to_bitmap(clip: Mtk.Rectangle | null, format: Cogl.PixelFormat): Cogl.Bitmap | null;

        paint_to_content(clip: Mtk.Rectangle | null): Clutter.Content | null;

        paint_to_content_full(clip: Mtk.Rectangle | null, format: Cogl.PixelFormat, color_state: Clutter.ColorState | null): Clutter.Content | null;

        sync_visibility(): void;

        thaw(): void;

        find_property(property_name: string): GObject.ParamSpec;

        get_actor(): Clutter.Actor;

        get_initial_state(property_name: string, value: GObject.Value | any): void;

        interpolate_value(property_name: string, interval: Clutter.Interval, progress: number): [boolean, unknown];

        set_final_state(property_name: string, value: GObject.Value | any): void;

        vfunc_find_property(property_name: string): GObject.ParamSpec;

        vfunc_get_actor(): Clutter.Actor;

        vfunc_get_initial_state(property_name: string, value: unknown): void;

        vfunc_interpolate_value(property_name: string, interval: Clutter.Interval, progress: number): [boolean, GObject.Value | any];

        vfunc_set_final_state(property_name: string, value: unknown): void;
    }


    namespace WindowConfig {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::is-fullscreen": (pspec: GObject.ParamSpec) => void;
            "notify::rect": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            is_fullscreen: boolean;
            isFullscreen: boolean;
            rect: Mtk.Rectangle;
        }
    }

    class WindowConfig extends GObject.Object {
        static $gtype: GObject.GType<WindowConfig>;

        // Properties
        get is_fullscreen(): boolean;
        set is_fullscreen(val: boolean);

        get isFullscreen(): boolean;
        set isFullscreen(val: boolean);

        get rect(): Mtk.Rectangle;
        set rect(val: Mtk.Rectangle);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WindowConfig.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WindowConfig.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): WindowConfig;

        // Signals
        /** @signal */
        connect<K extends keyof WindowConfig.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WindowConfig.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WindowConfig.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WindowConfig.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WindowConfig.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WindowConfig.SignalSignatures[K]>): void;

        // Methods
        get_is_fullscreen(): boolean;

        get_is_initial(): boolean;

        get_maximize_flags(): MaximizeFlags;

        get_position(x: number, y: number): void;

        get_rect(): Mtk.Rectangle;

        get_size(width: number, height: number): void;

        set_is_fullscreen(is_fullscreen: boolean): void;

        set_maximize_flags(flags: MaximizeFlags): void;

        set_position(x: number, y: number): void;

        set_rect(rect: Mtk.Rectangle): void;

        set_size(width: number, height: number): void;

        unset_maximize_flags(flags: MaximizeFlags): void;
    }


    namespace WindowGroup {
        // Signal signatures
        interface SignalSignatures extends Clutter.Actor.SignalSignatures {
            "notify::accessible-name": (pspec: GObject.ParamSpec) => void;
            "notify::accessible-role": (pspec: GObject.ParamSpec) => void;
            "notify::actions": (pspec: GObject.ParamSpec) => void;
            "notify::allocation": (pspec: GObject.ParamSpec) => void;
            "notify::background-color": (pspec: GObject.ParamSpec) => void;
            "notify::background-color-set": (pspec: GObject.ParamSpec) => void;
            "notify::child-transform": (pspec: GObject.ParamSpec) => void;
            "notify::child-transform-set": (pspec: GObject.ParamSpec) => void;
            "notify::clip-rect": (pspec: GObject.ParamSpec) => void;
            "notify::clip-to-allocation": (pspec: GObject.ParamSpec) => void;
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::constraints": (pspec: GObject.ParamSpec) => void;
            "notify::content": (pspec: GObject.ParamSpec) => void;
            "notify::content-box": (pspec: GObject.ParamSpec) => void;
            "notify::content-gravity": (pspec: GObject.ParamSpec) => void;
            "notify::content-repeat": (pspec: GObject.ParamSpec) => void;
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::cursor-type": (pspec: GObject.ParamSpec) => void;
            "notify::effect": (pspec: GObject.ParamSpec) => void;
            "notify::first-child": (pspec: GObject.ParamSpec) => void;
            "notify::fixed-position-set": (pspec: GObject.ParamSpec) => void;
            "notify::fixed-x": (pspec: GObject.ParamSpec) => void;
            "notify::fixed-y": (pspec: GObject.ParamSpec) => void;
            "notify::has-clip": (pspec: GObject.ParamSpec) => void;
            "notify::has-pointer": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::last-child": (pspec: GObject.ParamSpec) => void;
            "notify::layout-manager": (pspec: GObject.ParamSpec) => void;
            "notify::magnification-filter": (pspec: GObject.ParamSpec) => void;
            "notify::mapped": (pspec: GObject.ParamSpec) => void;
            "notify::margin-bottom": (pspec: GObject.ParamSpec) => void;
            "notify::margin-left": (pspec: GObject.ParamSpec) => void;
            "notify::margin-right": (pspec: GObject.ParamSpec) => void;
            "notify::margin-top": (pspec: GObject.ParamSpec) => void;
            "notify::min-height": (pspec: GObject.ParamSpec) => void;
            "notify::min-height-set": (pspec: GObject.ParamSpec) => void;
            "notify::min-width": (pspec: GObject.ParamSpec) => void;
            "notify::min-width-set": (pspec: GObject.ParamSpec) => void;
            "notify::minification-filter": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::natural-height": (pspec: GObject.ParamSpec) => void;
            "notify::natural-height-set": (pspec: GObject.ParamSpec) => void;
            "notify::natural-width": (pspec: GObject.ParamSpec) => void;
            "notify::natural-width-set": (pspec: GObject.ParamSpec) => void;
            "notify::offscreen-redirect": (pspec: GObject.ParamSpec) => void;
            "notify::opacity": (pspec: GObject.ParamSpec) => void;
            "notify::pivot-point": (pspec: GObject.ParamSpec) => void;
            "notify::pivot-point-z": (pspec: GObject.ParamSpec) => void;
            "notify::position": (pspec: GObject.ParamSpec) => void;
            "notify::reactive": (pspec: GObject.ParamSpec) => void;
            "notify::realized": (pspec: GObject.ParamSpec) => void;
            "notify::request-mode": (pspec: GObject.ParamSpec) => void;
            "notify::rotation-angle-x": (pspec: GObject.ParamSpec) => void;
            "notify::rotation-angle-y": (pspec: GObject.ParamSpec) => void;
            "notify::rotation-angle-z": (pspec: GObject.ParamSpec) => void;
            "notify::scale-x": (pspec: GObject.ParamSpec) => void;
            "notify::scale-y": (pspec: GObject.ParamSpec) => void;
            "notify::scale-z": (pspec: GObject.ParamSpec) => void;
            "notify::show-on-set-parent": (pspec: GObject.ParamSpec) => void;
            "notify::size": (pspec: GObject.ParamSpec) => void;
            "notify::text-direction": (pspec: GObject.ParamSpec) => void;
            "notify::transform": (pspec: GObject.ParamSpec) => void;
            "notify::transform-set": (pspec: GObject.ParamSpec) => void;
            "notify::translation-x": (pspec: GObject.ParamSpec) => void;
            "notify::translation-y": (pspec: GObject.ParamSpec) => void;
            "notify::translation-z": (pspec: GObject.ParamSpec) => void;
            "notify::visible": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
            "notify::x": (pspec: GObject.ParamSpec) => void;
            "notify::x-align": (pspec: GObject.ParamSpec) => void;
            "notify::x-expand": (pspec: GObject.ParamSpec) => void;
            "notify::y": (pspec: GObject.ParamSpec) => void;
            "notify::y-align": (pspec: GObject.ParamSpec) => void;
            "notify::y-expand": (pspec: GObject.ParamSpec) => void;
            "notify::z-position": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Clutter.Actor.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {}
    }

    class WindowGroup extends Clutter.Actor implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<WindowGroup>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WindowGroup.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WindowGroup.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof WindowGroup.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WindowGroup.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WindowGroup.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WindowGroup.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WindowGroup.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WindowGroup.SignalSignatures[K]>): void;

        find_property(property_name: string): GObject.ParamSpec;

        get_actor(): Clutter.Actor;

        get_initial_state(property_name: string, value: GObject.Value | any): void;

        interpolate_value(property_name: string, interval: Clutter.Interval, progress: number): [boolean, unknown];

        set_final_state(property_name: string, value: GObject.Value | any): void;

        vfunc_find_property(property_name: string): GObject.ParamSpec;

        vfunc_get_actor(): Clutter.Actor;

        vfunc_get_initial_state(property_name: string, value: unknown): void;

        vfunc_interpolate_value(property_name: string, interval: Clutter.Interval, progress: number): [boolean, GObject.Value | any];

        vfunc_set_final_state(property_name: string, value: unknown): void;
    }


    namespace Workspace {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "window-added": (object: Window) => void;
            /** @signal */
            "window-removed": (object: Window) => void;
            "notify::active": (pspec: GObject.ParamSpec) => void;
            "notify::n-windows": (pspec: GObject.ParamSpec) => void;
            "notify::workspace-index": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            active: boolean;
            n_windows: number;
            nWindows: number;
            workspace_index: number;
            workspaceIndex: number;
        }
    }

    class Workspace extends GObject.Object {
        static $gtype: GObject.GType<Workspace>;

        // Properties
        get active(): boolean;

        get n_windows(): number;

        get nWindows(): number;

        get workspace_index(): number;

        get workspaceIndex(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Workspace.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Workspace.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Workspace.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Workspace.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Workspace.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Workspace.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Workspace.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Workspace.SignalSignatures[K]>): void;

        // Methods
        activate(timestamp: number): void;

        activate_with_focus(focus_this: Window, timestamp: number): void;

        get_display(): Display;

        get_neighbor(direction: MotionDirection): Workspace;

        get_work_area_all_monitors(): Mtk.Rectangle;

        get_work_area_for_monitor(which_monitor: number): Mtk.Rectangle;

        index(): number;

        list_windows(): Window[];

        set_builtin_struts(struts: Strut[]): void;
    }


    namespace WorkspaceManager {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "active-workspace-changed": () => void;
            /** @signal */
            "showing-desktop-changed": () => void;
            /** @signal */
            "workspace-added": (object: number) => void;
            /** @signal */
            "workspace-removed": (object: number) => void;
            /** @signal */
            "workspace-switched": (object: number, p0: number, p1: MotionDirection) => void;
            /** @signal */
            "workspaces-reordered": () => void;
            "notify::layout-columns": (pspec: GObject.ParamSpec) => void;
            "notify::layout-rows": (pspec: GObject.ParamSpec) => void;
            "notify::n-workspaces": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            layout_columns: number;
            layoutColumns: number;
            layout_rows: number;
            layoutRows: number;
            n_workspaces: number;
            nWorkspaces: number;
        }
    }

    class WorkspaceManager extends GObject.Object {
        static $gtype: GObject.GType<WorkspaceManager>;

        // Properties
        get layout_columns(): number;

        get layoutColumns(): number;

        get layout_rows(): number;

        get layoutRows(): number;

        get n_workspaces(): number;

        get nWorkspaces(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WorkspaceManager.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WorkspaceManager.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof WorkspaceManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WorkspaceManager.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WorkspaceManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WorkspaceManager.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WorkspaceManager.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WorkspaceManager.SignalSignatures[K]>): void;

        // Methods
        append_new_workspace(activate: boolean, timestamp: number): Workspace;

        get_active_workspace(): Workspace;

        get_active_workspace_index(): number;

        get_layout_columns(): number;

        get_layout_rows(): number;

        get_n_workspaces(): number;

        get_workspace_by_index(index: number): Workspace | null;

        override_workspace_layout(starting_corner: DisplayCorner, vertical_layout: boolean, n_rows: number, n_columns: number): void;

        remove_workspace(workspace: Workspace, timestamp: number): void;

        reorder_workspace(workspace: Workspace, new_index: number): void;
    }


    namespace X11Display {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class X11Display extends GObject.Object {
        static $gtype: GObject.GType<X11Display>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: X11Display.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<X11Display.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof X11Display.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, X11Display.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof X11Display.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, X11Display.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof X11Display.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<X11Display.SignalSignatures[K]>): void;

        // Methods
        lookup_xwindow(window: Window): xlib.Window;

        redirect_windows(display: Display): void;
    }


    type BackendClass = typeof Backend;

    type BackgroundActorClass = typeof BackgroundActor;

    type BackgroundClass = typeof Background;

    type BackgroundContentClass = typeof BackgroundContent;

    type BackgroundGroupClass = typeof BackgroundGroup;

    type BacklightClass = typeof Backlight;

    type BarrierClass = typeof Barrier;

    class BarrierEvent {
        static $gtype: GObject.GType<BarrierEvent>;

        // Fields
        event_id: number;

        dt: number;

        time: number;

        x: number;

        y: number;

        dx: number;

        dy: number;

        released: boolean;

        grabbed: boolean;

        // Constructors

        constructor(properties?: Partial<{
            event_id: number;
            dt: number;
            time: number;
            x: number;
            y: number;
            dx: number;
            dy: number;
            released: boolean;
            grabbed: boolean;
        }>);
    }


    class ButtonLayout {
        static $gtype: GObject.GType<ButtonLayout>;

        // Fields
        left_buttons: ButtonFunction[];

        left_buttons_has_spacer: boolean[];

        right_buttons: ButtonFunction[];

        right_buttons_has_spacer: boolean[];
    }


    type CloseDialogInterface = typeof CloseDialog;

    type CompositorClass = typeof Compositor;

    type ContextClass = typeof Context;

    type CursorClass = typeof Cursor;

    type CursorTrackerClass = typeof CursorTracker;

    type DebugControlClass = typeof DebugControl;

    type DisplayClass = typeof Display;

    type DndClass = typeof Dnd;

    class Edge {
        static $gtype: GObject.GType<Edge>;

        // Fields
        rect: Mtk.Rectangle;

        side_type: Side;

        edge_type: EdgeType;
    }


    class ExternalConstraintInfo {
        static $gtype: GObject.GType<ExternalConstraintInfo>;

        // Fields
        new_rect: Mtk.Rectangle;

        flags: ExternalConstraintFlags;

        resize_gravity: Gravity;

        // Methods
        set_rect(rect: Mtk.Rectangle): void;
    }


    type ExternalConstraintInterface = typeof ExternalConstraint;

    class FrameBorder {
        static $gtype: GObject.GType<FrameBorder>;

        // Fields
        left: number;

        right: number;

        top: number;

        bottom: number;

        // Constructors

        constructor(properties?: Partial<{
            left: number;
            right: number;
            top: number;
            bottom: number;
        }>);
    }


    class FrameBorders {
        static $gtype: GObject.GType<FrameBorders>;

        // Fields
        visible: FrameBorder;

        invisible: FrameBorder;

        total: FrameBorder;

        // Constructors

        constructor(properties?: Partial<{
            visible: FrameBorder;
            invisible: FrameBorder;
            total: FrameBorder;
        }>);

        // Methods
        clear(): void;
    }


    type IdleMonitorClass = typeof IdleMonitor;

    type InhibitShortcutsDialogInterface = typeof InhibitShortcutsDialog;

    abstract class KeyBinding {
        static $gtype: GObject.GType<KeyBinding>;

        // Methods
        get_mask(): number;

        get_modifiers(): Clutter.ModifierType;

        get_name(): string;

        is_builtin(): boolean;

        is_reversed(): boolean;
    }


    class KeymapDescription {
        static $gtype: GObject.GType<KeymapDescription>;

        // Constructors
        constructor(model: string, layout: string, variant: string, options: string, display_names: string[], short_names: string[]);

        static new_from_rules(model: string, layout: string, variant: string, options: string, display_names: string[], short_names: string[]): KeymapDescription;

        // Methods
        direct_equal(other: KeymapDescription): boolean;

        is_locked(): boolean;

        ref(): KeymapDescription;

        unref(): void;
    }


    type LatersClass = typeof Laters;

    type LaunchContextClass = typeof LaunchContext;

    type LogicalMonitorClass = typeof LogicalMonitor;

    type MonitorClass = typeof Monitor;

    type MonitorManagerClass = typeof MonitorManager;

    type MultiTextureClass = typeof MultiTexture;

    type OrientationManagerClass = typeof OrientationManager;

    type PluginClass = typeof Plugin;

    type RemoteAccessControllerClass = typeof RemoteAccessController;

    type RemoteAccessHandleClass = typeof RemoteAccessHandle;

    type SelectionClass = typeof Selection;

    type SelectionSourceClass = typeof SelectionSource;

    type SelectionSourceMemoryClass = typeof SelectionSourceMemory;

    abstract class Settings {
        static $gtype: GObject.GType<Settings>;

        // Methods
        get_font_dpi(): number;

        get_ui_scaling_factor(): number;
    }


    type ShapedTextureClass = typeof ShapedTexture;

    type SoundPlayerClass = typeof SoundPlayer;

    type StageClass = typeof Stage;

    abstract class StageRedrawClipFilter {
        static $gtype: GObject.GType<StageRedrawClipFilter>;
    }


    type StartupNotificationClass = typeof StartupNotification;

    type StartupSequenceClass = typeof StartupSequence;

    class Strut {
        static $gtype: GObject.GType<Strut>;

        // Fields
        rect: Mtk.Rectangle;

        side: Side;
    }


    type WaylandClientClass = typeof WaylandClient;

    type WaylandCompositorClass = typeof WaylandCompositor;

    type WaylandSurfaceClass = typeof WaylandSurface;

    type WindowActorClass = typeof WindowActor;

    type WindowClass = typeof Window;

    type WindowConfigClass = typeof WindowConfig;

    type WindowGroupClass = typeof WindowGroup;

    type WorkspaceClass = typeof Workspace;

    type WorkspaceManagerClass = typeof WorkspaceManager;

    type X11DisplayClass = typeof X11Display;

    namespace CloseDialog {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            response: (object: CloseDialogResponse) => void;
        }
        /**
         * Interface for implementing CloseDialog.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_focus(): void;

            vfunc_hide(): void;

            vfunc_show(): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            window: Window;
        }
    }

    export interface CloseDialogNamespace {
        $gtype: GObject.GType<CloseDialog>;
        prototype: CloseDialog;
    }
    interface CloseDialog extends GObject.Object, CloseDialog.Interface {

        // Properties
        get window(): Window;

        // Methods
        focus(): void;

        hide(): void;

        is_visible(): boolean;

        response(response: CloseDialogResponse): void;

        show(): void;
    }


    export const CloseDialog: CloseDialogNamespace & {
        new (): CloseDialog; // This allows `obj instanceof CloseDialog`
    };

    namespace ExternalConstraint {
        /**
         * Interface for implementing ExternalConstraint.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_constrain(window: Window, info: ExternalConstraintInfo): boolean;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ExternalConstraintNamespace {
        $gtype: GObject.GType<ExternalConstraint>;
        prototype: ExternalConstraint;
    }
    interface ExternalConstraint extends GObject.Object, ExternalConstraint.Interface {

        // Methods
        constrain(window: Window, info: ExternalConstraintInfo): boolean;
    }


    export const ExternalConstraint: ExternalConstraintNamespace & {
        new (): ExternalConstraint; // This allows `obj instanceof ExternalConstraint`
    };

    namespace InhibitShortcutsDialog {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            response: (object: InhibitShortcutsDialogResponse) => void;
        }
        /**
         * Interface for implementing InhibitShortcutsDialog.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_hide(): void;

            vfunc_show(): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            window: Window;
        }
    }

    export interface InhibitShortcutsDialogNamespace {
        $gtype: GObject.GType<InhibitShortcutsDialog>;
        prototype: InhibitShortcutsDialog;
    }
    interface InhibitShortcutsDialog extends GObject.Object, InhibitShortcutsDialog.Interface {

        // Properties
        get window(): Window;

        // Methods
        hide(): void;

        response(response: InhibitShortcutsDialogResponse): void;

        show(): void;
    }


    export const InhibitShortcutsDialog: InhibitShortcutsDialogNamespace & {
        new (): InhibitShortcutsDialog; // This allows `obj instanceof InhibitShortcutsDialog`
    };

    const __name__: string;

    const __version__: string;
}

export default Meta;

}

declare module 'gi://Meta' {
    import Meta51 from 'gi://Meta?version=51';
    export default Meta51;
}
// END
