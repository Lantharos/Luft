/// <reference path="./cairo-1.0.d.ts" />
/// <reference path="./cairo.d.ts" />
/// <reference path="./gobject-2.0.d.ts" />
/// <reference path="./glib-2.0.d.ts" />
/// <reference path="./pango-1.0.d.ts" />
/// <reference path="./harfbuzz-0.0.d.ts" />
/// <reference path="./freetype2-2.0.d.ts" />
/// <reference path="./gio-2.0.d.ts" />
/// <reference path="./gmodule-2.0.d.ts" />
/// <reference path="./gdkpixbuf-2.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://Gdk?version=3.0' {

// Module dependencies
import type cairo from 'cairo';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type Pango from 'gi://Pango?version=1.0';
import type HarfBuzz from 'gi://HarfBuzz?version=0.0';
import type freetype2 from 'gi://freetype2?version=2.0';
import type Gio from 'gi://Gio?version=2.0';
import type GModule from 'gi://GModule?version=2.0';
import type GdkPixbuf from 'gi://GdkPixbuf?version=2.0';

export namespace Gdk {

    /**
     * Gdk-3.0
     */


    export namespace AxisUse {
        export const $gtype: GObject.GType<AxisUse>;
    }

    enum AxisUse {
        IGNORE = 0,
        X = 1,
        Y = 2,
        PRESSURE = 3,
        XTILT = 4,
        YTILT = 5,
        WHEEL = 6,
        DISTANCE = 7,
        ROTATION = 8,
        SLIDER = 9,
        LAST = 10,
    }


    export namespace ByteOrder {
        export const $gtype: GObject.GType<ByteOrder>;
    }

    enum ByteOrder {
        LSB_FIRST = 0,
        MSB_FIRST = 1,
    }


    export namespace CrossingMode {
        export const $gtype: GObject.GType<CrossingMode>;
    }

    enum CrossingMode {
        NORMAL = 0,
        GRAB = 1,
        UNGRAB = 2,
        GTK_GRAB = 3,
        GTK_UNGRAB = 4,
        STATE_CHANGED = 5,
        TOUCH_BEGIN = 6,
        TOUCH_END = 7,
        DEVICE_SWITCH = 8,
    }


    export namespace CursorType {
        export const $gtype: GObject.GType<CursorType>;
    }

    enum CursorType {
        X_CURSOR = 0,
        ARROW = 2,
        BASED_ARROW_DOWN = 4,
        BASED_ARROW_UP = 6,
        BOAT = 8,
        BOGOSITY = 10,
        BOTTOM_LEFT_CORNER = 12,
        BOTTOM_RIGHT_CORNER = 14,
        BOTTOM_SIDE = 16,
        BOTTOM_TEE = 18,
        BOX_SPIRAL = 20,
        CENTER_PTR = 22,
        CIRCLE = 24,
        CLOCK = 26,
        COFFEE_MUG = 28,
        CROSS = 30,
        CROSS_REVERSE = 32,
        CROSSHAIR = 34,
        DIAMOND_CROSS = 36,
        DOT = 38,
        DOTBOX = 40,
        DOUBLE_ARROW = 42,
        DRAFT_LARGE = 44,
        DRAFT_SMALL = 46,
        DRAPED_BOX = 48,
        EXCHANGE = 50,
        FLEUR = 52,
        GOBBLER = 54,
        GUMBY = 56,
        HAND1 = 58,
        HAND2 = 60,
        HEART = 62,
        ICON = 64,
        IRON_CROSS = 66,
        LEFT_PTR = 68,
        LEFT_SIDE = 70,
        LEFT_TEE = 72,
        LEFTBUTTON = 74,
        LL_ANGLE = 76,
        LR_ANGLE = 78,
        MAN = 80,
        MIDDLEBUTTON = 82,
        MOUSE = 84,
        PENCIL = 86,
        PIRATE = 88,
        PLUS = 90,
        QUESTION_ARROW = 92,
        RIGHT_PTR = 94,
        RIGHT_SIDE = 96,
        RIGHT_TEE = 98,
        RIGHTBUTTON = 100,
        RTL_LOGO = 102,
        SAILBOAT = 104,
        SB_DOWN_ARROW = 106,
        SB_H_DOUBLE_ARROW = 108,
        SB_LEFT_ARROW = 110,
        SB_RIGHT_ARROW = 112,
        SB_UP_ARROW = 114,
        SB_V_DOUBLE_ARROW = 116,
        SHUTTLE = 118,
        SIZING = 120,
        SPIDER = 122,
        SPRAYCAN = 124,
        STAR = 126,
        TARGET = 128,
        TCROSS = 130,
        TOP_LEFT_ARROW = 132,
        TOP_LEFT_CORNER = 134,
        TOP_RIGHT_CORNER = 136,
        TOP_SIDE = 138,
        TOP_TEE = 140,
        TREK = 142,
        UL_ANGLE = 144,
        UMBRELLA = 146,
        UR_ANGLE = 148,
        WATCH = 150,
        XTERM = 152,
        LAST_CURSOR = 153,
        BLANK_CURSOR = -2,
        CURSOR_IS_PIXMAP = -1,
    }


    export namespace DevicePadFeature {
        export const $gtype: GObject.GType<DevicePadFeature>;
    }

    enum DevicePadFeature {
        BUTTON = 0,
        RING = 1,
        STRIP = 2,
    }


    export namespace DeviceToolType {
        export const $gtype: GObject.GType<DeviceToolType>;
    }

    enum DeviceToolType {
        UNKNOWN = 0,
        PEN = 1,
        ERASER = 2,
        BRUSH = 3,
        PENCIL = 4,
        AIRBRUSH = 5,
        MOUSE = 6,
        LENS = 7,
    }


    export namespace DeviceType {
        export const $gtype: GObject.GType<DeviceType>;
    }

    enum DeviceType {
        MASTER = 0,
        SLAVE = 1,
        FLOATING = 2,
    }


    export namespace DragCancelReason {
        export const $gtype: GObject.GType<DragCancelReason>;
    }

    enum DragCancelReason {
        NO_TARGET = 0,
        USER_CANCELLED = 1,
        ERROR = 2,
    }


    export namespace DragProtocol {
        export const $gtype: GObject.GType<DragProtocol>;
    }

    enum DragProtocol {
        NONE = 0,
        MOTIF = 1,
        XDND = 2,
        ROOTWIN = 3,
        WIN32_DROPFILES = 4,
        OLE2 = 5,
        LOCAL = 6,
        WAYLAND = 7,
    }


    export namespace EventType {
        export const $gtype: GObject.GType<EventType>;
    }

    enum EventType {
        NOTHING = -1,
        DELETE = 0,
        DESTROY = 1,
        EXPOSE = 2,
        MOTION_NOTIFY = 3,
        BUTTON_PRESS = 4,
        "2BUTTON_PRESS" = 5,
        DOUBLE_BUTTON_PRESS = 5,
        "3BUTTON_PRESS" = 6,
        TRIPLE_BUTTON_PRESS = 6,
        BUTTON_RELEASE = 7,
        KEY_PRESS = 8,
        KEY_RELEASE = 9,
        ENTER_NOTIFY = 10,
        LEAVE_NOTIFY = 11,
        FOCUS_CHANGE = 12,
        CONFIGURE = 13,
        MAP = 14,
        UNMAP = 15,
        PROPERTY_NOTIFY = 16,
        SELECTION_CLEAR = 17,
        SELECTION_REQUEST = 18,
        SELECTION_NOTIFY = 19,
        PROXIMITY_IN = 20,
        PROXIMITY_OUT = 21,
        DRAG_ENTER = 22,
        DRAG_LEAVE = 23,
        DRAG_MOTION = 24,
        DRAG_STATUS = 25,
        DROP_START = 26,
        DROP_FINISHED = 27,
        CLIENT_EVENT = 28,
        VISIBILITY_NOTIFY = 29,
        SCROLL = 31,
        WINDOW_STATE = 32,
        SETTING = 33,
        OWNER_CHANGE = 34,
        GRAB_BROKEN = 35,
        DAMAGE = 36,
        TOUCH_BEGIN = 37,
        TOUCH_UPDATE = 38,
        TOUCH_END = 39,
        TOUCH_CANCEL = 40,
        TOUCHPAD_SWIPE = 41,
        TOUCHPAD_PINCH = 42,
        PAD_BUTTON_PRESS = 43,
        PAD_BUTTON_RELEASE = 44,
        PAD_RING = 45,
        PAD_STRIP = 46,
        PAD_GROUP_MODE = 47,
        EVENT_LAST = 48,
    }


    export namespace FilterReturn {
        export const $gtype: GObject.GType<FilterReturn>;
    }

    enum FilterReturn {
        CONTINUE = 0,
        TRANSLATE = 1,
        REMOVE = 2,
    }


    export namespace FullscreenMode {
        export const $gtype: GObject.GType<FullscreenMode>;
    }

    enum FullscreenMode {
        CURRENT_MONITOR = 0,
        ALL_MONITORS = 1,
    }


    class GLError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static NOT_AVAILABLE: number;

        static UNSUPPORTED_FORMAT: number;

        static UNSUPPORTED_PROFILE: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace GrabOwnership {
        export const $gtype: GObject.GType<GrabOwnership>;
    }

    enum GrabOwnership {
        NONE = 0,
        WINDOW = 1,
        APPLICATION = 2,
    }


    export namespace GrabStatus {
        export const $gtype: GObject.GType<GrabStatus>;
    }

    enum GrabStatus {
        SUCCESS = 0,
        ALREADY_GRABBED = 1,
        INVALID_TIME = 2,
        NOT_VIEWABLE = 3,
        FROZEN = 4,
        FAILED = 5,
    }


    export namespace Gravity {
        export const $gtype: GObject.GType<Gravity>;
    }

    enum Gravity {
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


    export namespace InputMode {
        export const $gtype: GObject.GType<InputMode>;
    }

    enum InputMode {
        DISABLED = 0,
        SCREEN = 1,
        WINDOW = 2,
    }


    export namespace InputSource {
        export const $gtype: GObject.GType<InputSource>;
    }

    enum InputSource {
        MOUSE = 0,
        PEN = 1,
        ERASER = 2,
        CURSOR = 3,
        KEYBOARD = 4,
        TOUCHSCREEN = 5,
        TOUCHPAD = 6,
        TRACKPOINT = 7,
        TABLET_PAD = 8,
    }


    export namespace ModifierIntent {
        export const $gtype: GObject.GType<ModifierIntent>;
    }

    enum ModifierIntent {
        PRIMARY_ACCELERATOR = 0,
        CONTEXT_MENU = 1,
        EXTEND_SELECTION = 2,
        MODIFY_SELECTION = 3,
        NO_TEXT_INPUT = 4,
        SHIFT_GROUP = 5,
        DEFAULT_MOD_MASK = 6,
    }


    export namespace NotifyType {
        export const $gtype: GObject.GType<NotifyType>;
    }

    enum NotifyType {
        ANCESTOR = 0,
        VIRTUAL = 1,
        INFERIOR = 2,
        NONLINEAR = 3,
        NONLINEAR_VIRTUAL = 4,
        UNKNOWN = 5,
    }


    export namespace OwnerChange {
        export const $gtype: GObject.GType<OwnerChange>;
    }

    enum OwnerChange {
        NEW_OWNER = 0,
        DESTROY = 1,
        CLOSE = 2,
    }


    export namespace PropMode {
        export const $gtype: GObject.GType<PropMode>;
    }

    enum PropMode {
        REPLACE = 0,
        PREPEND = 1,
        APPEND = 2,
    }


    export namespace PropertyState {
        export const $gtype: GObject.GType<PropertyState>;
    }

    enum PropertyState {
        NEW_VALUE = 0,
        DELETE = 1,
    }


    export namespace ScrollDirection {
        export const $gtype: GObject.GType<ScrollDirection>;
    }

    enum ScrollDirection {
        UP = 0,
        DOWN = 1,
        LEFT = 2,
        RIGHT = 3,
        SMOOTH = 4,
    }


    export namespace SettingAction {
        export const $gtype: GObject.GType<SettingAction>;
    }

    enum SettingAction {
        NEW = 0,
        CHANGED = 1,
        DELETED = 2,
    }


    export namespace Status {
        export const $gtype: GObject.GType<Status>;
    }

    enum Status {
        OK = 0,
        ERROR = -1,
        ERROR_PARAM = -2,
        ERROR_FILE = -3,
        ERROR_MEM = -4,
    }


    export namespace SubpixelLayout {
        export const $gtype: GObject.GType<SubpixelLayout>;
    }

    enum SubpixelLayout {
        UNKNOWN = 0,
        NONE = 1,
        HORIZONTAL_RGB = 2,
        HORIZONTAL_BGR = 3,
        VERTICAL_RGB = 4,
        VERTICAL_BGR = 5,
    }


    export namespace TouchpadGesturePhase {
        export const $gtype: GObject.GType<TouchpadGesturePhase>;
    }

    enum TouchpadGesturePhase {
        BEGIN = 0,
        UPDATE = 1,
        END = 2,
        CANCEL = 3,
    }


    export namespace VisibilityState {
        export const $gtype: GObject.GType<VisibilityState>;
    }

    enum VisibilityState {
        UNOBSCURED = 0,
        PARTIAL = 1,
        FULLY_OBSCURED = 2,
    }


    export namespace VisualType {
        export const $gtype: GObject.GType<VisualType>;
    }

    enum VisualType {
        STATIC_GRAY = 0,
        GRAYSCALE = 1,
        STATIC_COLOR = 2,
        PSEUDO_COLOR = 3,
        TRUE_COLOR = 4,
        DIRECT_COLOR = 5,
    }


    export namespace WindowEdge {
        export const $gtype: GObject.GType<WindowEdge>;
    }

    enum WindowEdge {
        NORTH_WEST = 0,
        NORTH = 1,
        NORTH_EAST = 2,
        WEST = 3,
        EAST = 4,
        SOUTH_WEST = 5,
        SOUTH = 6,
        SOUTH_EAST = 7,
    }


    export namespace WindowType {
        export const $gtype: GObject.GType<WindowType>;
    }

    enum WindowType {
        ROOT = 0,
        TOPLEVEL = 1,
        CHILD = 2,
        TEMP = 3,
        FOREIGN = 4,
        OFFSCREEN = 5,
        SUBSURFACE = 6,
    }


    export namespace WindowTypeHint {
        export const $gtype: GObject.GType<WindowTypeHint>;
    }

    enum WindowTypeHint {
        NORMAL = 0,
        DIALOG = 1,
        MENU = 2,
        TOOLBAR = 3,
        SPLASHSCREEN = 4,
        UTILITY = 5,
        DOCK = 6,
        DESKTOP = 7,
        DROPDOWN_MENU = 8,
        POPUP_MENU = 9,
        TOOLTIP = 10,
        NOTIFICATION = 11,
        COMBO = 12,
        DND = 13,
    }


    export namespace WindowWindowClass {
        export const $gtype: GObject.GType<WindowWindowClass>;
    }

    enum WindowWindowClass {
        INPUT_OUTPUT = 0,
        INPUT_ONLY = 1,
    }


    const BUTTON_MIDDLE: number;

    const BUTTON_PRIMARY: number;

    const BUTTON_SECONDARY: number;

    const CURRENT_TIME: number;

    const EVENT_PROPAGATE: boolean;

    const EVENT_STOP: boolean;

    const KEY_0: number;

    const KEY_1: number;

    const KEY_2: number;

    const KEY_3: number;

    const KEY_3270_AltCursor: number;

    const KEY_3270_Attn: number;

    const KEY_3270_BackTab: number;

    const KEY_3270_ChangeScreen: number;

    const KEY_3270_Copy: number;

    const KEY_3270_CursorBlink: number;

    const KEY_3270_CursorSelect: number;

    const KEY_3270_DeleteWord: number;

    const KEY_3270_Duplicate: number;

    const KEY_3270_Enter: number;

    const KEY_3270_EraseEOF: number;

    const KEY_3270_EraseInput: number;

    const KEY_3270_ExSelect: number;

    const KEY_3270_FieldMark: number;

    const KEY_3270_Ident: number;

    const KEY_3270_Jump: number;

    const KEY_3270_KeyClick: number;

    const KEY_3270_Left2: number;

    const KEY_3270_PA1: number;

    const KEY_3270_PA2: number;

    const KEY_3270_PA3: number;

    const KEY_3270_Play: number;

    const KEY_3270_PrintScreen: number;

    const KEY_3270_Quit: number;

    const KEY_3270_Record: number;

    const KEY_3270_Reset: number;

    const KEY_3270_Right2: number;

    const KEY_3270_Rule: number;

    const KEY_3270_Setup: number;

    const KEY_3270_Test: number;

    const KEY_4: number;

    const KEY_5: number;

    const KEY_6: number;

    const KEY_7: number;

    const KEY_8: number;

    const KEY_9: number;

    const KEY_A: number;

    const KEY_AE: number;

    const KEY_Aacute: number;

    const KEY_Abelowdot: number;

    const KEY_Abreve: number;

    const KEY_Abreveacute: number;

    const KEY_Abrevebelowdot: number;

    const KEY_Abrevegrave: number;

    const KEY_Abrevehook: number;

    const KEY_Abrevetilde: number;

    const KEY_AccessX_Enable: number;

    const KEY_AccessX_Feedback_Enable: number;

    const KEY_Acircumflex: number;

    const KEY_Acircumflexacute: number;

    const KEY_Acircumflexbelowdot: number;

    const KEY_Acircumflexgrave: number;

    const KEY_Acircumflexhook: number;

    const KEY_Acircumflextilde: number;

    const KEY_AddFavorite: number;

    const KEY_Adiaeresis: number;

    const KEY_Agrave: number;

    const KEY_Ahook: number;

    const KEY_Alt_L: number;

    const KEY_Alt_R: number;

    const KEY_Amacron: number;

    const KEY_Aogonek: number;

    const KEY_ApplicationLeft: number;

    const KEY_ApplicationRight: number;

    const KEY_Arabic_0: number;

    const KEY_Arabic_1: number;

    const KEY_Arabic_2: number;

    const KEY_Arabic_3: number;

    const KEY_Arabic_4: number;

    const KEY_Arabic_5: number;

    const KEY_Arabic_6: number;

    const KEY_Arabic_7: number;

    const KEY_Arabic_8: number;

    const KEY_Arabic_9: number;

    const KEY_Arabic_ain: number;

    const KEY_Arabic_alef: number;

    const KEY_Arabic_alefmaksura: number;

    const KEY_Arabic_beh: number;

    const KEY_Arabic_comma: number;

    const KEY_Arabic_dad: number;

    const KEY_Arabic_dal: number;

    const KEY_Arabic_damma: number;

    const KEY_Arabic_dammatan: number;

    const KEY_Arabic_ddal: number;

    const KEY_Arabic_farsi_yeh: number;

    const KEY_Arabic_fatha: number;

    const KEY_Arabic_fathatan: number;

    const KEY_Arabic_feh: number;

    const KEY_Arabic_fullstop: number;

    const KEY_Arabic_gaf: number;

    const KEY_Arabic_ghain: number;

    const KEY_Arabic_ha: number;

    const KEY_Arabic_hah: number;

    const KEY_Arabic_hamza: number;

    const KEY_Arabic_hamza_above: number;

    const KEY_Arabic_hamza_below: number;

    const KEY_Arabic_hamzaonalef: number;

    const KEY_Arabic_hamzaonwaw: number;

    const KEY_Arabic_hamzaonyeh: number;

    const KEY_Arabic_hamzaunderalef: number;

    const KEY_Arabic_heh: number;

    const KEY_Arabic_heh_doachashmee: number;

    const KEY_Arabic_heh_goal: number;

    const KEY_Arabic_jeem: number;

    const KEY_Arabic_jeh: number;

    const KEY_Arabic_kaf: number;

    const KEY_Arabic_kasra: number;

    const KEY_Arabic_kasratan: number;

    const KEY_Arabic_keheh: number;

    const KEY_Arabic_khah: number;

    const KEY_Arabic_lam: number;

    const KEY_Arabic_madda_above: number;

    const KEY_Arabic_maddaonalef: number;

    const KEY_Arabic_meem: number;

    const KEY_Arabic_noon: number;

    const KEY_Arabic_noon_ghunna: number;

    const KEY_Arabic_peh: number;

    const KEY_Arabic_percent: number;

    const KEY_Arabic_qaf: number;

    const KEY_Arabic_question_mark: number;

    const KEY_Arabic_ra: number;

    const KEY_Arabic_rreh: number;

    const KEY_Arabic_sad: number;

    const KEY_Arabic_seen: number;

    const KEY_Arabic_semicolon: number;

    const KEY_Arabic_shadda: number;

    const KEY_Arabic_sheen: number;

    const KEY_Arabic_sukun: number;

    const KEY_Arabic_superscript_alef: number;

    const KEY_Arabic_switch: number;

    const KEY_Arabic_tah: number;

    const KEY_Arabic_tatweel: number;

    const KEY_Arabic_tcheh: number;

    const KEY_Arabic_teh: number;

    const KEY_Arabic_tehmarbuta: number;

    const KEY_Arabic_thal: number;

    const KEY_Arabic_theh: number;

    const KEY_Arabic_tteh: number;

    const KEY_Arabic_veh: number;

    const KEY_Arabic_waw: number;

    const KEY_Arabic_yeh: number;

    const KEY_Arabic_yeh_baree: number;

    const KEY_Arabic_zah: number;

    const KEY_Arabic_zain: number;

    const KEY_Aring: number;

    const KEY_Armenian_AT: number;

    const KEY_Armenian_AYB: number;

    const KEY_Armenian_BEN: number;

    const KEY_Armenian_CHA: number;

    const KEY_Armenian_DA: number;

    const KEY_Armenian_DZA: number;

    const KEY_Armenian_E: number;

    const KEY_Armenian_FE: number;

    const KEY_Armenian_GHAT: number;

    const KEY_Armenian_GIM: number;

    const KEY_Armenian_HI: number;

    const KEY_Armenian_HO: number;

    const KEY_Armenian_INI: number;

    const KEY_Armenian_JE: number;

    const KEY_Armenian_KE: number;

    const KEY_Armenian_KEN: number;

    const KEY_Armenian_KHE: number;

    const KEY_Armenian_LYUN: number;

    const KEY_Armenian_MEN: number;

    const KEY_Armenian_NU: number;

    const KEY_Armenian_O: number;

    const KEY_Armenian_PE: number;

    const KEY_Armenian_PYUR: number;

    const KEY_Armenian_RA: number;

    const KEY_Armenian_RE: number;

    const KEY_Armenian_SE: number;

    const KEY_Armenian_SHA: number;

    const KEY_Armenian_TCHE: number;

    const KEY_Armenian_TO: number;

    const KEY_Armenian_TSA: number;

    const KEY_Armenian_TSO: number;

    const KEY_Armenian_TYUN: number;

    const KEY_Armenian_VEV: number;

    const KEY_Armenian_VO: number;

    const KEY_Armenian_VYUN: number;

    const KEY_Armenian_YECH: number;

    const KEY_Armenian_ZA: number;

    const KEY_Armenian_ZHE: number;

    const KEY_Armenian_accent: number;

    const KEY_Armenian_amanak: number;

    const KEY_Armenian_apostrophe: number;

    const KEY_Armenian_at: number;

    const KEY_Armenian_ayb: number;

    const KEY_Armenian_ben: number;

    const KEY_Armenian_but: number;

    const KEY_Armenian_cha: number;

    const KEY_Armenian_da: number;

    const KEY_Armenian_dza: number;

    const KEY_Armenian_e: number;

    const KEY_Armenian_exclam: number;

    const KEY_Armenian_fe: number;

    const KEY_Armenian_full_stop: number;

    const KEY_Armenian_ghat: number;

    const KEY_Armenian_gim: number;

    const KEY_Armenian_hi: number;

    const KEY_Armenian_ho: number;

    const KEY_Armenian_hyphen: number;

    const KEY_Armenian_ini: number;

    const KEY_Armenian_je: number;

    const KEY_Armenian_ke: number;

    const KEY_Armenian_ken: number;

    const KEY_Armenian_khe: number;

    const KEY_Armenian_ligature_ew: number;

    const KEY_Armenian_lyun: number;

    const KEY_Armenian_men: number;

    const KEY_Armenian_nu: number;

    const KEY_Armenian_o: number;

    const KEY_Armenian_paruyk: number;

    const KEY_Armenian_pe: number;

    const KEY_Armenian_pyur: number;

    const KEY_Armenian_question: number;

    const KEY_Armenian_ra: number;

    const KEY_Armenian_re: number;

    const KEY_Armenian_se: number;

    const KEY_Armenian_separation_mark: number;

    const KEY_Armenian_sha: number;

    const KEY_Armenian_shesht: number;

    const KEY_Armenian_tche: number;

    const KEY_Armenian_to: number;

    const KEY_Armenian_tsa: number;

    const KEY_Armenian_tso: number;

    const KEY_Armenian_tyun: number;

    const KEY_Armenian_verjaket: number;

    const KEY_Armenian_vev: number;

    const KEY_Armenian_vo: number;

    const KEY_Armenian_vyun: number;

    const KEY_Armenian_yech: number;

    const KEY_Armenian_yentamna: number;

    const KEY_Armenian_za: number;

    const KEY_Armenian_zhe: number;

    const KEY_Atilde: number;

    const KEY_AudibleBell_Enable: number;

    const KEY_AudioCycleTrack: number;

    const KEY_AudioForward: number;

    const KEY_AudioLowerVolume: number;

    const KEY_AudioMedia: number;

    const KEY_AudioMicMute: number;

    const KEY_AudioMute: number;

    const KEY_AudioNext: number;

    const KEY_AudioPause: number;

    const KEY_AudioPlay: number;

    const KEY_AudioPreset: number;

    const KEY_AudioPrev: number;

    const KEY_AudioRaiseVolume: number;

    const KEY_AudioRandomPlay: number;

    const KEY_AudioRecord: number;

    const KEY_AudioRepeat: number;

    const KEY_AudioRewind: number;

    const KEY_AudioStop: number;

    const KEY_Away: number;

    const KEY_B: number;

    const KEY_Babovedot: number;

    const KEY_Back: number;

    const KEY_BackForward: number;

    const KEY_BackSpace: number;

    const KEY_Battery: number;

    const KEY_Begin: number;

    const KEY_Blue: number;

    const KEY_Bluetooth: number;

    const KEY_Book: number;

    const KEY_BounceKeys_Enable: number;

    const KEY_Break: number;

    const KEY_BrightnessAdjust: number;

    const KEY_Byelorussian_SHORTU: number;

    const KEY_Byelorussian_shortu: number;

    const KEY_C: number;

    const KEY_CD: number;

    const KEY_CH: number;

    const KEY_C_H: number;

    const KEY_C_h: number;

    const KEY_Cabovedot: number;

    const KEY_Cacute: number;

    const KEY_Calculator: number;

    const KEY_Calendar: number;

    const KEY_Cancel: number;

    const KEY_Caps_Lock: number;

    const KEY_Ccaron: number;

    const KEY_Ccedilla: number;

    const KEY_Ccircumflex: number;

    const KEY_Ch: number;

    const KEY_Clear: number;

    const KEY_ClearGrab: number;

    const KEY_Close: number;

    const KEY_Codeinput: number;

    const KEY_ColonSign: number;

    const KEY_Community: number;

    const KEY_ContrastAdjust: number;

    const KEY_Control_L: number;

    const KEY_Control_R: number;

    const KEY_Copy: number;

    const KEY_CruzeiroSign: number;

    const KEY_Cut: number;

    const KEY_CycleAngle: number;

    const KEY_Cyrillic_A: number;

    const KEY_Cyrillic_BE: number;

    const KEY_Cyrillic_CHE: number;

    const KEY_Cyrillic_CHE_descender: number;

    const KEY_Cyrillic_CHE_vertstroke: number;

    const KEY_Cyrillic_DE: number;

    const KEY_Cyrillic_DZHE: number;

    const KEY_Cyrillic_E: number;

    const KEY_Cyrillic_EF: number;

    const KEY_Cyrillic_EL: number;

    const KEY_Cyrillic_EM: number;

    const KEY_Cyrillic_EN: number;

    const KEY_Cyrillic_EN_descender: number;

    const KEY_Cyrillic_ER: number;

    const KEY_Cyrillic_ES: number;

    const KEY_Cyrillic_GHE: number;

    const KEY_Cyrillic_GHE_bar: number;

    const KEY_Cyrillic_HA: number;

    const KEY_Cyrillic_HARDSIGN: number;

    const KEY_Cyrillic_HA_descender: number;

    const KEY_Cyrillic_I: number;

    const KEY_Cyrillic_IE: number;

    const KEY_Cyrillic_IO: number;

    const KEY_Cyrillic_I_macron: number;

    const KEY_Cyrillic_JE: number;

    const KEY_Cyrillic_KA: number;

    const KEY_Cyrillic_KA_descender: number;

    const KEY_Cyrillic_KA_vertstroke: number;

    const KEY_Cyrillic_LJE: number;

    const KEY_Cyrillic_NJE: number;

    const KEY_Cyrillic_O: number;

    const KEY_Cyrillic_O_bar: number;

    const KEY_Cyrillic_PE: number;

    const KEY_Cyrillic_SCHWA: number;

    const KEY_Cyrillic_SHA: number;

    const KEY_Cyrillic_SHCHA: number;

    const KEY_Cyrillic_SHHA: number;

    const KEY_Cyrillic_SHORTI: number;

    const KEY_Cyrillic_SOFTSIGN: number;

    const KEY_Cyrillic_TE: number;

    const KEY_Cyrillic_TSE: number;

    const KEY_Cyrillic_U: number;

    const KEY_Cyrillic_U_macron: number;

    const KEY_Cyrillic_U_straight: number;

    const KEY_Cyrillic_U_straight_bar: number;

    const KEY_Cyrillic_VE: number;

    const KEY_Cyrillic_YA: number;

    const KEY_Cyrillic_YERU: number;

    const KEY_Cyrillic_YU: number;

    const KEY_Cyrillic_ZE: number;

    const KEY_Cyrillic_ZHE: number;

    const KEY_Cyrillic_ZHE_descender: number;

    const KEY_Cyrillic_a: number;

    const KEY_Cyrillic_be: number;

    const KEY_Cyrillic_che: number;

    const KEY_Cyrillic_che_descender: number;

    const KEY_Cyrillic_che_vertstroke: number;

    const KEY_Cyrillic_de: number;

    const KEY_Cyrillic_dzhe: number;

    const KEY_Cyrillic_e: number;

    const KEY_Cyrillic_ef: number;

    const KEY_Cyrillic_el: number;

    const KEY_Cyrillic_em: number;

    const KEY_Cyrillic_en: number;

    const KEY_Cyrillic_en_descender: number;

    const KEY_Cyrillic_er: number;

    const KEY_Cyrillic_es: number;

    const KEY_Cyrillic_ghe: number;

    const KEY_Cyrillic_ghe_bar: number;

    const KEY_Cyrillic_ha: number;

    const KEY_Cyrillic_ha_descender: number;

    const KEY_Cyrillic_hardsign: number;

    const KEY_Cyrillic_i: number;

    const KEY_Cyrillic_i_macron: number;

    const KEY_Cyrillic_ie: number;

    const KEY_Cyrillic_io: number;

    const KEY_Cyrillic_je: number;

    const KEY_Cyrillic_ka: number;

    const KEY_Cyrillic_ka_descender: number;

    const KEY_Cyrillic_ka_vertstroke: number;

    const KEY_Cyrillic_lje: number;

    const KEY_Cyrillic_nje: number;

    const KEY_Cyrillic_o: number;

    const KEY_Cyrillic_o_bar: number;

    const KEY_Cyrillic_pe: number;

    const KEY_Cyrillic_schwa: number;

    const KEY_Cyrillic_sha: number;

    const KEY_Cyrillic_shcha: number;

    const KEY_Cyrillic_shha: number;

    const KEY_Cyrillic_shorti: number;

    const KEY_Cyrillic_softsign: number;

    const KEY_Cyrillic_te: number;

    const KEY_Cyrillic_tse: number;

    const KEY_Cyrillic_u: number;

    const KEY_Cyrillic_u_macron: number;

    const KEY_Cyrillic_u_straight: number;

    const KEY_Cyrillic_u_straight_bar: number;

    const KEY_Cyrillic_ve: number;

    const KEY_Cyrillic_ya: number;

    const KEY_Cyrillic_yeru: number;

    const KEY_Cyrillic_yu: number;

    const KEY_Cyrillic_ze: number;

    const KEY_Cyrillic_zhe: number;

    const KEY_Cyrillic_zhe_descender: number;

    const KEY_D: number;

    const KEY_DOS: number;

    const KEY_Dabovedot: number;

    const KEY_Dcaron: number;

    const KEY_Delete: number;

    const KEY_Display: number;

    const KEY_Documents: number;

    const KEY_DongSign: number;

    const KEY_Down: number;

    const KEY_Dstroke: number;

    const KEY_E: number;

    const KEY_ENG: number;

    const KEY_ETH: number;

    const KEY_EZH: number;

    const KEY_Eabovedot: number;

    const KEY_Eacute: number;

    const KEY_Ebelowdot: number;

    const KEY_Ecaron: number;

    const KEY_Ecircumflex: number;

    const KEY_Ecircumflexacute: number;

    const KEY_Ecircumflexbelowdot: number;

    const KEY_Ecircumflexgrave: number;

    const KEY_Ecircumflexhook: number;

    const KEY_Ecircumflextilde: number;

    const KEY_EcuSign: number;

    const KEY_Ediaeresis: number;

    const KEY_Egrave: number;

    const KEY_Ehook: number;

    const KEY_Eisu_Shift: number;

    const KEY_Eisu_toggle: number;

    const KEY_Eject: number;

    const KEY_Emacron: number;

    const KEY_End: number;

    const KEY_Eogonek: number;

    const KEY_Escape: number;

    const KEY_Eth: number;

    const KEY_Etilde: number;

    const KEY_EuroSign: number;

    const KEY_Excel: number;

    const KEY_Execute: number;

    const KEY_Explorer: number;

    const KEY_F: number;

    const KEY_F1: number;

    const KEY_F10: number;

    const KEY_F11: number;

    const KEY_F12: number;

    const KEY_F13: number;

    const KEY_F14: number;

    const KEY_F15: number;

    const KEY_F16: number;

    const KEY_F17: number;

    const KEY_F18: number;

    const KEY_F19: number;

    const KEY_F2: number;

    const KEY_F20: number;

    const KEY_F21: number;

    const KEY_F22: number;

    const KEY_F23: number;

    const KEY_F24: number;

    const KEY_F25: number;

    const KEY_F26: number;

    const KEY_F27: number;

    const KEY_F28: number;

    const KEY_F29: number;

    const KEY_F3: number;

    const KEY_F30: number;

    const KEY_F31: number;

    const KEY_F32: number;

    const KEY_F33: number;

    const KEY_F34: number;

    const KEY_F35: number;

    const KEY_F4: number;

    const KEY_F5: number;

    const KEY_F6: number;

    const KEY_F7: number;

    const KEY_F8: number;

    const KEY_F9: number;

    const KEY_FFrancSign: number;

    const KEY_Fabovedot: number;

    const KEY_Farsi_0: number;

    const KEY_Farsi_1: number;

    const KEY_Farsi_2: number;

    const KEY_Farsi_3: number;

    const KEY_Farsi_4: number;

    const KEY_Farsi_5: number;

    const KEY_Farsi_6: number;

    const KEY_Farsi_7: number;

    const KEY_Farsi_8: number;

    const KEY_Farsi_9: number;

    const KEY_Farsi_yeh: number;

    const KEY_Favorites: number;

    const KEY_Finance: number;

    const KEY_Find: number;

    const KEY_First_Virtual_Screen: number;

    const KEY_Forward: number;

    const KEY_FrameBack: number;

    const KEY_FrameForward: number;

    const KEY_G: number;

    const KEY_Gabovedot: number;

    const KEY_Game: number;

    const KEY_Gbreve: number;

    const KEY_Gcaron: number;

    const KEY_Gcedilla: number;

    const KEY_Gcircumflex: number;

    const KEY_Georgian_an: number;

    const KEY_Georgian_ban: number;

    const KEY_Georgian_can: number;

    const KEY_Georgian_char: number;

    const KEY_Georgian_chin: number;

    const KEY_Georgian_cil: number;

    const KEY_Georgian_don: number;

    const KEY_Georgian_en: number;

    const KEY_Georgian_fi: number;

    const KEY_Georgian_gan: number;

    const KEY_Georgian_ghan: number;

    const KEY_Georgian_hae: number;

    const KEY_Georgian_har: number;

    const KEY_Georgian_he: number;

    const KEY_Georgian_hie: number;

    const KEY_Georgian_hoe: number;

    const KEY_Georgian_in: number;

    const KEY_Georgian_jhan: number;

    const KEY_Georgian_jil: number;

    const KEY_Georgian_kan: number;

    const KEY_Georgian_khar: number;

    const KEY_Georgian_las: number;

    const KEY_Georgian_man: number;

    const KEY_Georgian_nar: number;

    const KEY_Georgian_on: number;

    const KEY_Georgian_par: number;

    const KEY_Georgian_phar: number;

    const KEY_Georgian_qar: number;

    const KEY_Georgian_rae: number;

    const KEY_Georgian_san: number;

    const KEY_Georgian_shin: number;

    const KEY_Georgian_tan: number;

    const KEY_Georgian_tar: number;

    const KEY_Georgian_un: number;

    const KEY_Georgian_vin: number;

    const KEY_Georgian_we: number;

    const KEY_Georgian_xan: number;

    const KEY_Georgian_zen: number;

    const KEY_Georgian_zhar: number;

    const KEY_Go: number;

    const KEY_Greek_ALPHA: number;

    const KEY_Greek_ALPHAaccent: number;

    const KEY_Greek_BETA: number;

    const KEY_Greek_CHI: number;

    const KEY_Greek_DELTA: number;

    const KEY_Greek_EPSILON: number;

    const KEY_Greek_EPSILONaccent: number;

    const KEY_Greek_ETA: number;

    const KEY_Greek_ETAaccent: number;

    const KEY_Greek_GAMMA: number;

    const KEY_Greek_IOTA: number;

    const KEY_Greek_IOTAaccent: number;

    const KEY_Greek_IOTAdiaeresis: number;

    const KEY_Greek_IOTAdieresis: number;

    const KEY_Greek_KAPPA: number;

    const KEY_Greek_LAMBDA: number;

    const KEY_Greek_LAMDA: number;

    const KEY_Greek_MU: number;

    const KEY_Greek_NU: number;

    const KEY_Greek_OMEGA: number;

    const KEY_Greek_OMEGAaccent: number;

    const KEY_Greek_OMICRON: number;

    const KEY_Greek_OMICRONaccent: number;

    const KEY_Greek_PHI: number;

    const KEY_Greek_PI: number;

    const KEY_Greek_PSI: number;

    const KEY_Greek_RHO: number;

    const KEY_Greek_SIGMA: number;

    const KEY_Greek_TAU: number;

    const KEY_Greek_THETA: number;

    const KEY_Greek_UPSILON: number;

    const KEY_Greek_UPSILONaccent: number;

    const KEY_Greek_UPSILONdieresis: number;

    const KEY_Greek_XI: number;

    const KEY_Greek_ZETA: number;

    const KEY_Greek_accentdieresis: number;

    const KEY_Greek_alpha: number;

    const KEY_Greek_alphaaccent: number;

    const KEY_Greek_beta: number;

    const KEY_Greek_chi: number;

    const KEY_Greek_delta: number;

    const KEY_Greek_epsilon: number;

    const KEY_Greek_epsilonaccent: number;

    const KEY_Greek_eta: number;

    const KEY_Greek_etaaccent: number;

    const KEY_Greek_finalsmallsigma: number;

    const KEY_Greek_gamma: number;

    const KEY_Greek_horizbar: number;

    const KEY_Greek_iota: number;

    const KEY_Greek_iotaaccent: number;

    const KEY_Greek_iotaaccentdieresis: number;

    const KEY_Greek_iotadieresis: number;

    const KEY_Greek_kappa: number;

    const KEY_Greek_lambda: number;

    const KEY_Greek_lamda: number;

    const KEY_Greek_mu: number;

    const KEY_Greek_nu: number;

    const KEY_Greek_omega: number;

    const KEY_Greek_omegaaccent: number;

    const KEY_Greek_omicron: number;

    const KEY_Greek_omicronaccent: number;

    const KEY_Greek_phi: number;

    const KEY_Greek_pi: number;

    const KEY_Greek_psi: number;

    const KEY_Greek_rho: number;

    const KEY_Greek_sigma: number;

    const KEY_Greek_switch: number;

    const KEY_Greek_tau: number;

    const KEY_Greek_theta: number;

    const KEY_Greek_upsilon: number;

    const KEY_Greek_upsilonaccent: number;

    const KEY_Greek_upsilonaccentdieresis: number;

    const KEY_Greek_upsilondieresis: number;

    const KEY_Greek_xi: number;

    const KEY_Greek_zeta: number;

    const KEY_Green: number;

    const KEY_H: number;

    const KEY_Hangul: number;

    const KEY_Hangul_A: number;

    const KEY_Hangul_AE: number;

    const KEY_Hangul_AraeA: number;

    const KEY_Hangul_AraeAE: number;

    const KEY_Hangul_Banja: number;

    const KEY_Hangul_Cieuc: number;

    const KEY_Hangul_Codeinput: number;

    const KEY_Hangul_Dikeud: number;

    const KEY_Hangul_E: number;

    const KEY_Hangul_EO: number;

    const KEY_Hangul_EU: number;

    const KEY_Hangul_End: number;

    const KEY_Hangul_Hanja: number;

    const KEY_Hangul_Hieuh: number;

    const KEY_Hangul_I: number;

    const KEY_Hangul_Ieung: number;

    const KEY_Hangul_J_Cieuc: number;

    const KEY_Hangul_J_Dikeud: number;

    const KEY_Hangul_J_Hieuh: number;

    const KEY_Hangul_J_Ieung: number;

    const KEY_Hangul_J_Jieuj: number;

    const KEY_Hangul_J_Khieuq: number;

    const KEY_Hangul_J_Kiyeog: number;

    const KEY_Hangul_J_KiyeogSios: number;

    const KEY_Hangul_J_KkogjiDalrinIeung: number;

    const KEY_Hangul_J_Mieum: number;

    const KEY_Hangul_J_Nieun: number;

    const KEY_Hangul_J_NieunHieuh: number;

    const KEY_Hangul_J_NieunJieuj: number;

    const KEY_Hangul_J_PanSios: number;

    const KEY_Hangul_J_Phieuf: number;

    const KEY_Hangul_J_Pieub: number;

    const KEY_Hangul_J_PieubSios: number;

    const KEY_Hangul_J_Rieul: number;

    const KEY_Hangul_J_RieulHieuh: number;

    const KEY_Hangul_J_RieulKiyeog: number;

    const KEY_Hangul_J_RieulMieum: number;

    const KEY_Hangul_J_RieulPhieuf: number;

    const KEY_Hangul_J_RieulPieub: number;

    const KEY_Hangul_J_RieulSios: number;

    const KEY_Hangul_J_RieulTieut: number;

    const KEY_Hangul_J_Sios: number;

    const KEY_Hangul_J_SsangKiyeog: number;

    const KEY_Hangul_J_SsangSios: number;

    const KEY_Hangul_J_Tieut: number;

    const KEY_Hangul_J_YeorinHieuh: number;

    const KEY_Hangul_Jamo: number;

    const KEY_Hangul_Jeonja: number;

    const KEY_Hangul_Jieuj: number;

    const KEY_Hangul_Khieuq: number;

    const KEY_Hangul_Kiyeog: number;

    const KEY_Hangul_KiyeogSios: number;

    const KEY_Hangul_KkogjiDalrinIeung: number;

    const KEY_Hangul_Mieum: number;

    const KEY_Hangul_MultipleCandidate: number;

    const KEY_Hangul_Nieun: number;

    const KEY_Hangul_NieunHieuh: number;

    const KEY_Hangul_NieunJieuj: number;

    const KEY_Hangul_O: number;

    const KEY_Hangul_OE: number;

    const KEY_Hangul_PanSios: number;

    const KEY_Hangul_Phieuf: number;

    const KEY_Hangul_Pieub: number;

    const KEY_Hangul_PieubSios: number;

    const KEY_Hangul_PostHanja: number;

    const KEY_Hangul_PreHanja: number;

    const KEY_Hangul_PreviousCandidate: number;

    const KEY_Hangul_Rieul: number;

    const KEY_Hangul_RieulHieuh: number;

    const KEY_Hangul_RieulKiyeog: number;

    const KEY_Hangul_RieulMieum: number;

    const KEY_Hangul_RieulPhieuf: number;

    const KEY_Hangul_RieulPieub: number;

    const KEY_Hangul_RieulSios: number;

    const KEY_Hangul_RieulTieut: number;

    const KEY_Hangul_RieulYeorinHieuh: number;

    const KEY_Hangul_Romaja: number;

    const KEY_Hangul_SingleCandidate: number;

    const KEY_Hangul_Sios: number;

    const KEY_Hangul_Special: number;

    const KEY_Hangul_SsangDikeud: number;

    const KEY_Hangul_SsangJieuj: number;

    const KEY_Hangul_SsangKiyeog: number;

    const KEY_Hangul_SsangPieub: number;

    const KEY_Hangul_SsangSios: number;

    const KEY_Hangul_Start: number;

    const KEY_Hangul_SunkyeongeumMieum: number;

    const KEY_Hangul_SunkyeongeumPhieuf: number;

    const KEY_Hangul_SunkyeongeumPieub: number;

    const KEY_Hangul_Tieut: number;

    const KEY_Hangul_U: number;

    const KEY_Hangul_WA: number;

    const KEY_Hangul_WAE: number;

    const KEY_Hangul_WE: number;

    const KEY_Hangul_WEO: number;

    const KEY_Hangul_WI: number;

    const KEY_Hangul_YA: number;

    const KEY_Hangul_YAE: number;

    const KEY_Hangul_YE: number;

    const KEY_Hangul_YEO: number;

    const KEY_Hangul_YI: number;

    const KEY_Hangul_YO: number;

    const KEY_Hangul_YU: number;

    const KEY_Hangul_YeorinHieuh: number;

    const KEY_Hangul_switch: number;

    const KEY_Hankaku: number;

    const KEY_Hcircumflex: number;

    const KEY_Hebrew_switch: number;

    const KEY_Help: number;

    const KEY_Henkan: number;

    const KEY_Henkan_Mode: number;

    const KEY_Hibernate: number;

    const KEY_Hiragana: number;

    const KEY_Hiragana_Katakana: number;

    const KEY_History: number;

    const KEY_Home: number;

    const KEY_HomePage: number;

    const KEY_HotLinks: number;

    const KEY_Hstroke: number;

    const KEY_Hyper_L: number;

    const KEY_Hyper_R: number;

    const KEY_I: number;

    const KEY_ISO_Center_Object: number;

    const KEY_ISO_Continuous_Underline: number;

    const KEY_ISO_Discontinuous_Underline: number;

    const KEY_ISO_Emphasize: number;

    const KEY_ISO_Enter: number;

    const KEY_ISO_Fast_Cursor_Down: number;

    const KEY_ISO_Fast_Cursor_Left: number;

    const KEY_ISO_Fast_Cursor_Right: number;

    const KEY_ISO_Fast_Cursor_Up: number;

    const KEY_ISO_First_Group: number;

    const KEY_ISO_First_Group_Lock: number;

    const KEY_ISO_Group_Latch: number;

    const KEY_ISO_Group_Lock: number;

    const KEY_ISO_Group_Shift: number;

    const KEY_ISO_Last_Group: number;

    const KEY_ISO_Last_Group_Lock: number;

    const KEY_ISO_Left_Tab: number;

    const KEY_ISO_Level2_Latch: number;

    const KEY_ISO_Level3_Latch: number;

    const KEY_ISO_Level3_Lock: number;

    const KEY_ISO_Level3_Shift: number;

    const KEY_ISO_Level5_Latch: number;

    const KEY_ISO_Level5_Lock: number;

    const KEY_ISO_Level5_Shift: number;

    const KEY_ISO_Lock: number;

    const KEY_ISO_Move_Line_Down: number;

    const KEY_ISO_Move_Line_Up: number;

    const KEY_ISO_Next_Group: number;

    const KEY_ISO_Next_Group_Lock: number;

    const KEY_ISO_Partial_Line_Down: number;

    const KEY_ISO_Partial_Line_Up: number;

    const KEY_ISO_Partial_Space_Left: number;

    const KEY_ISO_Partial_Space_Right: number;

    const KEY_ISO_Prev_Group: number;

    const KEY_ISO_Prev_Group_Lock: number;

    const KEY_ISO_Release_Both_Margins: number;

    const KEY_ISO_Release_Margin_Left: number;

    const KEY_ISO_Release_Margin_Right: number;

    const KEY_ISO_Set_Margin_Left: number;

    const KEY_ISO_Set_Margin_Right: number;

    const KEY_Iabovedot: number;

    const KEY_Iacute: number;

    const KEY_Ibelowdot: number;

    const KEY_Ibreve: number;

    const KEY_Icircumflex: number;

    const KEY_Idiaeresis: number;

    const KEY_Igrave: number;

    const KEY_Ihook: number;

    const KEY_Imacron: number;

    const KEY_Insert: number;

    const KEY_Iogonek: number;

    const KEY_Itilde: number;

    const KEY_J: number;

    const KEY_Jcircumflex: number;

    const KEY_K: number;

    const KEY_KP_0: number;

    const KEY_KP_1: number;

    const KEY_KP_2: number;

    const KEY_KP_3: number;

    const KEY_KP_4: number;

    const KEY_KP_5: number;

    const KEY_KP_6: number;

    const KEY_KP_7: number;

    const KEY_KP_8: number;

    const KEY_KP_9: number;

    const KEY_KP_Add: number;

    const KEY_KP_Begin: number;

    const KEY_KP_Decimal: number;

    const KEY_KP_Delete: number;

    const KEY_KP_Divide: number;

    const KEY_KP_Down: number;

    const KEY_KP_End: number;

    const KEY_KP_Enter: number;

    const KEY_KP_Equal: number;

    const KEY_KP_F1: number;

    const KEY_KP_F2: number;

    const KEY_KP_F3: number;

    const KEY_KP_F4: number;

    const KEY_KP_Home: number;

    const KEY_KP_Insert: number;

    const KEY_KP_Left: number;

    const KEY_KP_Multiply: number;

    const KEY_KP_Next: number;

    const KEY_KP_Page_Down: number;

    const KEY_KP_Page_Up: number;

    const KEY_KP_Prior: number;

    const KEY_KP_Right: number;

    const KEY_KP_Separator: number;

    const KEY_KP_Space: number;

    const KEY_KP_Subtract: number;

    const KEY_KP_Tab: number;

    const KEY_KP_Up: number;

    const KEY_Kana_Lock: number;

    const KEY_Kana_Shift: number;

    const KEY_Kanji: number;

    const KEY_Kanji_Bangou: number;

    const KEY_Katakana: number;

    const KEY_KbdBrightnessDown: number;

    const KEY_KbdBrightnessUp: number;

    const KEY_KbdLightOnOff: number;

    const KEY_Kcedilla: number;

    const KEY_Keyboard: number;

    const KEY_Korean_Won: number;

    const KEY_L: number;

    const KEY_L1: number;

    const KEY_L10: number;

    const KEY_L2: number;

    const KEY_L3: number;

    const KEY_L4: number;

    const KEY_L5: number;

    const KEY_L6: number;

    const KEY_L7: number;

    const KEY_L8: number;

    const KEY_L9: number;

    const KEY_Lacute: number;

    const KEY_Last_Virtual_Screen: number;

    const KEY_Launch0: number;

    const KEY_Launch1: number;

    const KEY_Launch2: number;

    const KEY_Launch3: number;

    const KEY_Launch4: number;

    const KEY_Launch5: number;

    const KEY_Launch6: number;

    const KEY_Launch7: number;

    const KEY_Launch8: number;

    const KEY_Launch9: number;

    const KEY_LaunchA: number;

    const KEY_LaunchB: number;

    const KEY_LaunchC: number;

    const KEY_LaunchD: number;

    const KEY_LaunchE: number;

    const KEY_LaunchF: number;

    const KEY_Lbelowdot: number;

    const KEY_Lcaron: number;

    const KEY_Lcedilla: number;

    const KEY_Left: number;

    const KEY_LightBulb: number;

    const KEY_Linefeed: number;

    const KEY_LiraSign: number;

    const KEY_LogGrabInfo: number;

    const KEY_LogOff: number;

    const KEY_LogWindowTree: number;

    const KEY_Lstroke: number;

    const KEY_M: number;

    const KEY_Mabovedot: number;

    const KEY_Macedonia_DSE: number;

    const KEY_Macedonia_GJE: number;

    const KEY_Macedonia_KJE: number;

    const KEY_Macedonia_dse: number;

    const KEY_Macedonia_gje: number;

    const KEY_Macedonia_kje: number;

    const KEY_Mae_Koho: number;

    const KEY_Mail: number;

    const KEY_MailForward: number;

    const KEY_Market: number;

    const KEY_Massyo: number;

    const KEY_Meeting: number;

    const KEY_Memo: number;

    const KEY_Menu: number;

    const KEY_MenuKB: number;

    const KEY_MenuPB: number;

    const KEY_Messenger: number;

    const KEY_Meta_L: number;

    const KEY_Meta_R: number;

    const KEY_MillSign: number;

    const KEY_ModeLock: number;

    const KEY_Mode_switch: number;

    const KEY_MonBrightnessDown: number;

    const KEY_MonBrightnessUp: number;

    const KEY_MouseKeys_Accel_Enable: number;

    const KEY_MouseKeys_Enable: number;

    const KEY_Muhenkan: number;

    const KEY_Multi_key: number;

    const KEY_MultipleCandidate: number;

    const KEY_Music: number;

    const KEY_MyComputer: number;

    const KEY_MySites: number;

    const KEY_N: number;

    const KEY_Nacute: number;

    const KEY_NairaSign: number;

    const KEY_Ncaron: number;

    const KEY_Ncedilla: number;

    const KEY_New: number;

    const KEY_NewSheqelSign: number;

    const KEY_News: number;

    const KEY_Next: number;

    const KEY_Next_VMode: number;

    const KEY_Next_Virtual_Screen: number;

    const KEY_Ntilde: number;

    const KEY_Num_Lock: number;

    const KEY_O: number;

    const KEY_OE: number;

    const KEY_Oacute: number;

    const KEY_Obarred: number;

    const KEY_Obelowdot: number;

    const KEY_Ocaron: number;

    const KEY_Ocircumflex: number;

    const KEY_Ocircumflexacute: number;

    const KEY_Ocircumflexbelowdot: number;

    const KEY_Ocircumflexgrave: number;

    const KEY_Ocircumflexhook: number;

    const KEY_Ocircumflextilde: number;

    const KEY_Odiaeresis: number;

    const KEY_Odoubleacute: number;

    const KEY_OfficeHome: number;

    const KEY_Ograve: number;

    const KEY_Ohook: number;

    const KEY_Ohorn: number;

    const KEY_Ohornacute: number;

    const KEY_Ohornbelowdot: number;

    const KEY_Ohorngrave: number;

    const KEY_Ohornhook: number;

    const KEY_Ohorntilde: number;

    const KEY_Omacron: number;

    const KEY_Ooblique: number;

    const KEY_Open: number;

    const KEY_OpenURL: number;

    const KEY_Option: number;

    const KEY_Oslash: number;

    const KEY_Otilde: number;

    const KEY_Overlay1_Enable: number;

    const KEY_Overlay2_Enable: number;

    const KEY_P: number;

    const KEY_Pabovedot: number;

    const KEY_Page_Down: number;

    const KEY_Page_Up: number;

    const KEY_Paste: number;

    const KEY_Pause: number;

    const KEY_PesetaSign: number;

    const KEY_Phone: number;

    const KEY_Pictures: number;

    const KEY_Pointer_Accelerate: number;

    const KEY_Pointer_Button1: number;

    const KEY_Pointer_Button2: number;

    const KEY_Pointer_Button3: number;

    const KEY_Pointer_Button4: number;

    const KEY_Pointer_Button5: number;

    const KEY_Pointer_Button_Dflt: number;

    const KEY_Pointer_DblClick1: number;

    const KEY_Pointer_DblClick2: number;

    const KEY_Pointer_DblClick3: number;

    const KEY_Pointer_DblClick4: number;

    const KEY_Pointer_DblClick5: number;

    const KEY_Pointer_DblClick_Dflt: number;

    const KEY_Pointer_DfltBtnNext: number;

    const KEY_Pointer_DfltBtnPrev: number;

    const KEY_Pointer_Down: number;

    const KEY_Pointer_DownLeft: number;

    const KEY_Pointer_DownRight: number;

    const KEY_Pointer_Drag1: number;

    const KEY_Pointer_Drag2: number;

    const KEY_Pointer_Drag3: number;

    const KEY_Pointer_Drag4: number;

    const KEY_Pointer_Drag5: number;

    const KEY_Pointer_Drag_Dflt: number;

    const KEY_Pointer_EnableKeys: number;

    const KEY_Pointer_Left: number;

    const KEY_Pointer_Right: number;

    const KEY_Pointer_Up: number;

    const KEY_Pointer_UpLeft: number;

    const KEY_Pointer_UpRight: number;

    const KEY_PowerDown: number;

    const KEY_PowerOff: number;

    const KEY_Prev_VMode: number;

    const KEY_Prev_Virtual_Screen: number;

    const KEY_PreviousCandidate: number;

    const KEY_Print: number;

    const KEY_Prior: number;

    const KEY_Q: number;

    const KEY_R: number;

    const KEY_R1: number;

    const KEY_R10: number;

    const KEY_R11: number;

    const KEY_R12: number;

    const KEY_R13: number;

    const KEY_R14: number;

    const KEY_R15: number;

    const KEY_R2: number;

    const KEY_R3: number;

    const KEY_R4: number;

    const KEY_R5: number;

    const KEY_R6: number;

    const KEY_R7: number;

    const KEY_R8: number;

    const KEY_R9: number;

    const KEY_RFKill: number;

    const KEY_Racute: number;

    const KEY_Rcaron: number;

    const KEY_Rcedilla: number;

    const KEY_Red: number;

    const KEY_Redo: number;

    const KEY_Refresh: number;

    const KEY_Reload: number;

    const KEY_RepeatKeys_Enable: number;

    const KEY_Reply: number;

    const KEY_Return: number;

    const KEY_Right: number;

    const KEY_RockerDown: number;

    const KEY_RockerEnter: number;

    const KEY_RockerUp: number;

    const KEY_Romaji: number;

    const KEY_RotateWindows: number;

    const KEY_RotationKB: number;

    const KEY_RotationPB: number;

    const KEY_RupeeSign: number;

    const KEY_S: number;

    const KEY_SCHWA: number;

    const KEY_Sabovedot: number;

    const KEY_Sacute: number;

    const KEY_Save: number;

    const KEY_Scaron: number;

    const KEY_Scedilla: number;

    const KEY_Scircumflex: number;

    const KEY_ScreenSaver: number;

    const KEY_ScrollClick: number;

    const KEY_ScrollDown: number;

    const KEY_ScrollUp: number;

    const KEY_Scroll_Lock: number;

    const KEY_Search: number;

    const KEY_Select: number;

    const KEY_SelectButton: number;

    const KEY_Send: number;

    const KEY_Serbian_DJE: number;

    const KEY_Serbian_DZE: number;

    const KEY_Serbian_JE: number;

    const KEY_Serbian_LJE: number;

    const KEY_Serbian_NJE: number;

    const KEY_Serbian_TSHE: number;

    const KEY_Serbian_dje: number;

    const KEY_Serbian_dze: number;

    const KEY_Serbian_je: number;

    const KEY_Serbian_lje: number;

    const KEY_Serbian_nje: number;

    const KEY_Serbian_tshe: number;

    const KEY_Shift_L: number;

    const KEY_Shift_Lock: number;

    const KEY_Shift_R: number;

    const KEY_Shop: number;

    const KEY_SingleCandidate: number;

    const KEY_Sinh_a: number;

    const KEY_Sinh_aa: number;

    const KEY_Sinh_aa2: number;

    const KEY_Sinh_ae: number;

    const KEY_Sinh_ae2: number;

    const KEY_Sinh_aee: number;

    const KEY_Sinh_aee2: number;

    const KEY_Sinh_ai: number;

    const KEY_Sinh_ai2: number;

    const KEY_Sinh_al: number;

    const KEY_Sinh_au: number;

    const KEY_Sinh_au2: number;

    const KEY_Sinh_ba: number;

    const KEY_Sinh_bha: number;

    const KEY_Sinh_ca: number;

    const KEY_Sinh_cha: number;

    const KEY_Sinh_dda: number;

    const KEY_Sinh_ddha: number;

    const KEY_Sinh_dha: number;

    const KEY_Sinh_dhha: number;

    const KEY_Sinh_e: number;

    const KEY_Sinh_e2: number;

    const KEY_Sinh_ee: number;

    const KEY_Sinh_ee2: number;

    const KEY_Sinh_fa: number;

    const KEY_Sinh_ga: number;

    const KEY_Sinh_gha: number;

    const KEY_Sinh_h2: number;

    const KEY_Sinh_ha: number;

    const KEY_Sinh_i: number;

    const KEY_Sinh_i2: number;

    const KEY_Sinh_ii: number;

    const KEY_Sinh_ii2: number;

    const KEY_Sinh_ja: number;

    const KEY_Sinh_jha: number;

    const KEY_Sinh_jnya: number;

    const KEY_Sinh_ka: number;

    const KEY_Sinh_kha: number;

    const KEY_Sinh_kunddaliya: number;

    const KEY_Sinh_la: number;

    const KEY_Sinh_lla: number;

    const KEY_Sinh_lu: number;

    const KEY_Sinh_lu2: number;

    const KEY_Sinh_luu: number;

    const KEY_Sinh_luu2: number;

    const KEY_Sinh_ma: number;

    const KEY_Sinh_mba: number;

    const KEY_Sinh_na: number;

    const KEY_Sinh_ndda: number;

    const KEY_Sinh_ndha: number;

    const KEY_Sinh_ng: number;

    const KEY_Sinh_ng2: number;

    const KEY_Sinh_nga: number;

    const KEY_Sinh_nja: number;

    const KEY_Sinh_nna: number;

    const KEY_Sinh_nya: number;

    const KEY_Sinh_o: number;

    const KEY_Sinh_o2: number;

    const KEY_Sinh_oo: number;

    const KEY_Sinh_oo2: number;

    const KEY_Sinh_pa: number;

    const KEY_Sinh_pha: number;

    const KEY_Sinh_ra: number;

    const KEY_Sinh_ri: number;

    const KEY_Sinh_rii: number;

    const KEY_Sinh_ru2: number;

    const KEY_Sinh_ruu2: number;

    const KEY_Sinh_sa: number;

    const KEY_Sinh_sha: number;

    const KEY_Sinh_ssha: number;

    const KEY_Sinh_tha: number;

    const KEY_Sinh_thha: number;

    const KEY_Sinh_tta: number;

    const KEY_Sinh_ttha: number;

    const KEY_Sinh_u: number;

    const KEY_Sinh_u2: number;

    const KEY_Sinh_uu: number;

    const KEY_Sinh_uu2: number;

    const KEY_Sinh_va: number;

    const KEY_Sinh_ya: number;

    const KEY_Sleep: number;

    const KEY_SlowKeys_Enable: number;

    const KEY_Spell: number;

    const KEY_SplitScreen: number;

    const KEY_Standby: number;

    const KEY_Start: number;

    const KEY_StickyKeys_Enable: number;

    const KEY_Stop: number;

    const KEY_Subtitle: number;

    const KEY_Super_L: number;

    const KEY_Super_R: number;

    const KEY_Support: number;

    const KEY_Suspend: number;

    const KEY_Switch_VT_1: number;

    const KEY_Switch_VT_10: number;

    const KEY_Switch_VT_11: number;

    const KEY_Switch_VT_12: number;

    const KEY_Switch_VT_2: number;

    const KEY_Switch_VT_3: number;

    const KEY_Switch_VT_4: number;

    const KEY_Switch_VT_5: number;

    const KEY_Switch_VT_6: number;

    const KEY_Switch_VT_7: number;

    const KEY_Switch_VT_8: number;

    const KEY_Switch_VT_9: number;

    const KEY_Sys_Req: number;

    const KEY_T: number;

    const KEY_THORN: number;

    const KEY_Tab: number;

    const KEY_Tabovedot: number;

    const KEY_TaskPane: number;

    const KEY_Tcaron: number;

    const KEY_Tcedilla: number;

    const KEY_Terminal: number;

    const KEY_Terminate_Server: number;

    const KEY_Thai_baht: number;

    const KEY_Thai_bobaimai: number;

    const KEY_Thai_chochan: number;

    const KEY_Thai_chochang: number;

    const KEY_Thai_choching: number;

    const KEY_Thai_chochoe: number;

    const KEY_Thai_dochada: number;

    const KEY_Thai_dodek: number;

    const KEY_Thai_fofa: number;

    const KEY_Thai_fofan: number;

    const KEY_Thai_hohip: number;

    const KEY_Thai_honokhuk: number;

    const KEY_Thai_khokhai: number;

    const KEY_Thai_khokhon: number;

    const KEY_Thai_khokhuat: number;

    const KEY_Thai_khokhwai: number;

    const KEY_Thai_khorakhang: number;

    const KEY_Thai_kokai: number;

    const KEY_Thai_lakkhangyao: number;

    const KEY_Thai_lekchet: number;

    const KEY_Thai_lekha: number;

    const KEY_Thai_lekhok: number;

    const KEY_Thai_lekkao: number;

    const KEY_Thai_leknung: number;

    const KEY_Thai_lekpaet: number;

    const KEY_Thai_leksam: number;

    const KEY_Thai_leksi: number;

    const KEY_Thai_leksong: number;

    const KEY_Thai_leksun: number;

    const KEY_Thai_lochula: number;

    const KEY_Thai_loling: number;

    const KEY_Thai_lu: number;

    const KEY_Thai_maichattawa: number;

    const KEY_Thai_maiek: number;

    const KEY_Thai_maihanakat: number;

    const KEY_Thai_maihanakat_maitho: number;

    const KEY_Thai_maitaikhu: number;

    const KEY_Thai_maitho: number;

    const KEY_Thai_maitri: number;

    const KEY_Thai_maiyamok: number;

    const KEY_Thai_moma: number;

    const KEY_Thai_ngongu: number;

    const KEY_Thai_nikhahit: number;

    const KEY_Thai_nonen: number;

    const KEY_Thai_nonu: number;

    const KEY_Thai_oang: number;

    const KEY_Thai_paiyannoi: number;

    const KEY_Thai_phinthu: number;

    const KEY_Thai_phophan: number;

    const KEY_Thai_phophung: number;

    const KEY_Thai_phosamphao: number;

    const KEY_Thai_popla: number;

    const KEY_Thai_rorua: number;

    const KEY_Thai_ru: number;

    const KEY_Thai_saraa: number;

    const KEY_Thai_saraaa: number;

    const KEY_Thai_saraae: number;

    const KEY_Thai_saraaimaimalai: number;

    const KEY_Thai_saraaimaimuan: number;

    const KEY_Thai_saraam: number;

    const KEY_Thai_sarae: number;

    const KEY_Thai_sarai: number;

    const KEY_Thai_saraii: number;

    const KEY_Thai_sarao: number;

    const KEY_Thai_sarau: number;

    const KEY_Thai_saraue: number;

    const KEY_Thai_sarauee: number;

    const KEY_Thai_sarauu: number;

    const KEY_Thai_sorusi: number;

    const KEY_Thai_sosala: number;

    const KEY_Thai_soso: number;

    const KEY_Thai_sosua: number;

    const KEY_Thai_thanthakhat: number;

    const KEY_Thai_thonangmontho: number;

    const KEY_Thai_thophuthao: number;

    const KEY_Thai_thothahan: number;

    const KEY_Thai_thothan: number;

    const KEY_Thai_thothong: number;

    const KEY_Thai_thothung: number;

    const KEY_Thai_topatak: number;

    const KEY_Thai_totao: number;

    const KEY_Thai_wowaen: number;

    const KEY_Thai_yoyak: number;

    const KEY_Thai_yoying: number;

    const KEY_Thorn: number;

    const KEY_Time: number;

    const KEY_ToDoList: number;

    const KEY_Tools: number;

    const KEY_TopMenu: number;

    const KEY_TouchpadOff: number;

    const KEY_TouchpadOn: number;

    const KEY_TouchpadToggle: number;

    const KEY_Touroku: number;

    const KEY_Travel: number;

    const KEY_Tslash: number;

    const KEY_U: number;

    const KEY_UWB: number;

    const KEY_Uacute: number;

    const KEY_Ubelowdot: number;

    const KEY_Ubreve: number;

    const KEY_Ucircumflex: number;

    const KEY_Udiaeresis: number;

    const KEY_Udoubleacute: number;

    const KEY_Ugrave: number;

    const KEY_Uhook: number;

    const KEY_Uhorn: number;

    const KEY_Uhornacute: number;

    const KEY_Uhornbelowdot: number;

    const KEY_Uhorngrave: number;

    const KEY_Uhornhook: number;

    const KEY_Uhorntilde: number;

    const KEY_Ukrainian_GHE_WITH_UPTURN: number;

    const KEY_Ukrainian_I: number;

    const KEY_Ukrainian_IE: number;

    const KEY_Ukrainian_YI: number;

    const KEY_Ukrainian_ghe_with_upturn: number;

    const KEY_Ukrainian_i: number;

    const KEY_Ukrainian_ie: number;

    const KEY_Ukrainian_yi: number;

    const KEY_Ukranian_I: number;

    const KEY_Ukranian_JE: number;

    const KEY_Ukranian_YI: number;

    const KEY_Ukranian_i: number;

    const KEY_Ukranian_je: number;

    const KEY_Ukranian_yi: number;

    const KEY_Umacron: number;

    const KEY_Undo: number;

    const KEY_Ungrab: number;

    const KEY_Uogonek: number;

    const KEY_Up: number;

    const KEY_Uring: number;

    const KEY_User1KB: number;

    const KEY_User2KB: number;

    const KEY_UserPB: number;

    const KEY_Utilde: number;

    const KEY_V: number;

    const KEY_VendorHome: number;

    const KEY_Video: number;

    const KEY_View: number;

    const KEY_VoidSymbol: number;

    const KEY_W: number;

    const KEY_WLAN: number;

    const KEY_WWAN: number;

    const KEY_WWW: number;

    const KEY_Wacute: number;

    const KEY_WakeUp: number;

    const KEY_Wcircumflex: number;

    const KEY_Wdiaeresis: number;

    const KEY_WebCam: number;

    const KEY_Wgrave: number;

    const KEY_WheelButton: number;

    const KEY_WindowClear: number;

    const KEY_WonSign: number;

    const KEY_Word: number;

    const KEY_X: number;

    const KEY_Xabovedot: number;

    const KEY_Xfer: number;

    const KEY_Y: number;

    const KEY_Yacute: number;

    const KEY_Ybelowdot: number;

    const KEY_Ycircumflex: number;

    const KEY_Ydiaeresis: number;

    const KEY_Yellow: number;

    const KEY_Ygrave: number;

    const KEY_Yhook: number;

    const KEY_Ytilde: number;

    const KEY_Z: number;

    const KEY_Zabovedot: number;

    const KEY_Zacute: number;

    const KEY_Zcaron: number;

    const KEY_Zen_Koho: number;

    const KEY_Zenkaku: number;

    const KEY_Zenkaku_Hankaku: number;

    const KEY_ZoomIn: number;

    const KEY_ZoomOut: number;

    const KEY_Zstroke: number;

    const KEY_a: number;

    const KEY_aacute: number;

    const KEY_abelowdot: number;

    const KEY_abovedot: number;

    const KEY_abreve: number;

    const KEY_abreveacute: number;

    const KEY_abrevebelowdot: number;

    const KEY_abrevegrave: number;

    const KEY_abrevehook: number;

    const KEY_abrevetilde: number;

    const KEY_acircumflex: number;

    const KEY_acircumflexacute: number;

    const KEY_acircumflexbelowdot: number;

    const KEY_acircumflexgrave: number;

    const KEY_acircumflexhook: number;

    const KEY_acircumflextilde: number;

    const KEY_acute: number;

    const KEY_adiaeresis: number;

    const KEY_ae: number;

    const KEY_agrave: number;

    const KEY_ahook: number;

    const KEY_amacron: number;

    const KEY_ampersand: number;

    const KEY_aogonek: number;

    const KEY_apostrophe: number;

    const KEY_approxeq: number;

    const KEY_approximate: number;

    const KEY_aring: number;

    const KEY_asciicircum: number;

    const KEY_asciitilde: number;

    const KEY_asterisk: number;

    const KEY_at: number;

    const KEY_atilde: number;

    const KEY_b: number;

    const KEY_babovedot: number;

    const KEY_backslash: number;

    const KEY_ballotcross: number;

    const KEY_bar: number;

    const KEY_because: number;

    const KEY_blank: number;

    const KEY_botintegral: number;

    const KEY_botleftparens: number;

    const KEY_botleftsqbracket: number;

    const KEY_botleftsummation: number;

    const KEY_botrightparens: number;

    const KEY_botrightsqbracket: number;

    const KEY_botrightsummation: number;

    const KEY_bott: number;

    const KEY_botvertsummationconnector: number;

    const KEY_braceleft: number;

    const KEY_braceright: number;

    const KEY_bracketleft: number;

    const KEY_bracketright: number;

    const KEY_braille_blank: number;

    const KEY_braille_dot_1: number;

    const KEY_braille_dot_10: number;

    const KEY_braille_dot_2: number;

    const KEY_braille_dot_3: number;

    const KEY_braille_dot_4: number;

    const KEY_braille_dot_5: number;

    const KEY_braille_dot_6: number;

    const KEY_braille_dot_7: number;

    const KEY_braille_dot_8: number;

    const KEY_braille_dot_9: number;

    const KEY_braille_dots_1: number;

    const KEY_braille_dots_12: number;

    const KEY_braille_dots_123: number;

    const KEY_braille_dots_1234: number;

    const KEY_braille_dots_12345: number;

    const KEY_braille_dots_123456: number;

    const KEY_braille_dots_1234567: number;

    const KEY_braille_dots_12345678: number;

    const KEY_braille_dots_1234568: number;

    const KEY_braille_dots_123457: number;

    const KEY_braille_dots_1234578: number;

    const KEY_braille_dots_123458: number;

    const KEY_braille_dots_12346: number;

    const KEY_braille_dots_123467: number;

    const KEY_braille_dots_1234678: number;

    const KEY_braille_dots_123468: number;

    const KEY_braille_dots_12347: number;

    const KEY_braille_dots_123478: number;

    const KEY_braille_dots_12348: number;

    const KEY_braille_dots_1235: number;

    const KEY_braille_dots_12356: number;

    const KEY_braille_dots_123567: number;

    const KEY_braille_dots_1235678: number;

    const KEY_braille_dots_123568: number;

    const KEY_braille_dots_12357: number;

    const KEY_braille_dots_123578: number;

    const KEY_braille_dots_12358: number;

    const KEY_braille_dots_1236: number;

    const KEY_braille_dots_12367: number;

    const KEY_braille_dots_123678: number;

    const KEY_braille_dots_12368: number;

    const KEY_braille_dots_1237: number;

    const KEY_braille_dots_12378: number;

    const KEY_braille_dots_1238: number;

    const KEY_braille_dots_124: number;

    const KEY_braille_dots_1245: number;

    const KEY_braille_dots_12456: number;

    const KEY_braille_dots_124567: number;

    const KEY_braille_dots_1245678: number;

    const KEY_braille_dots_124568: number;

    const KEY_braille_dots_12457: number;

    const KEY_braille_dots_124578: number;

    const KEY_braille_dots_12458: number;

    const KEY_braille_dots_1246: number;

    const KEY_braille_dots_12467: number;

    const KEY_braille_dots_124678: number;

    const KEY_braille_dots_12468: number;

    const KEY_braille_dots_1247: number;

    const KEY_braille_dots_12478: number;

    const KEY_braille_dots_1248: number;

    const KEY_braille_dots_125: number;

    const KEY_braille_dots_1256: number;

    const KEY_braille_dots_12567: number;

    const KEY_braille_dots_125678: number;

    const KEY_braille_dots_12568: number;

    const KEY_braille_dots_1257: number;

    const KEY_braille_dots_12578: number;

    const KEY_braille_dots_1258: number;

    const KEY_braille_dots_126: number;

    const KEY_braille_dots_1267: number;

    const KEY_braille_dots_12678: number;

    const KEY_braille_dots_1268: number;

    const KEY_braille_dots_127: number;

    const KEY_braille_dots_1278: number;

    const KEY_braille_dots_128: number;

    const KEY_braille_dots_13: number;

    const KEY_braille_dots_134: number;

    const KEY_braille_dots_1345: number;

    const KEY_braille_dots_13456: number;

    const KEY_braille_dots_134567: number;

    const KEY_braille_dots_1345678: number;

    const KEY_braille_dots_134568: number;

    const KEY_braille_dots_13457: number;

    const KEY_braille_dots_134578: number;

    const KEY_braille_dots_13458: number;

    const KEY_braille_dots_1346: number;

    const KEY_braille_dots_13467: number;

    const KEY_braille_dots_134678: number;

    const KEY_braille_dots_13468: number;

    const KEY_braille_dots_1347: number;

    const KEY_braille_dots_13478: number;

    const KEY_braille_dots_1348: number;

    const KEY_braille_dots_135: number;

    const KEY_braille_dots_1356: number;

    const KEY_braille_dots_13567: number;

    const KEY_braille_dots_135678: number;

    const KEY_braille_dots_13568: number;

    const KEY_braille_dots_1357: number;

    const KEY_braille_dots_13578: number;

    const KEY_braille_dots_1358: number;

    const KEY_braille_dots_136: number;

    const KEY_braille_dots_1367: number;

    const KEY_braille_dots_13678: number;

    const KEY_braille_dots_1368: number;

    const KEY_braille_dots_137: number;

    const KEY_braille_dots_1378: number;

    const KEY_braille_dots_138: number;

    const KEY_braille_dots_14: number;

    const KEY_braille_dots_145: number;

    const KEY_braille_dots_1456: number;

    const KEY_braille_dots_14567: number;

    const KEY_braille_dots_145678: number;

    const KEY_braille_dots_14568: number;

    const KEY_braille_dots_1457: number;

    const KEY_braille_dots_14578: number;

    const KEY_braille_dots_1458: number;

    const KEY_braille_dots_146: number;

    const KEY_braille_dots_1467: number;

    const KEY_braille_dots_14678: number;

    const KEY_braille_dots_1468: number;

    const KEY_braille_dots_147: number;

    const KEY_braille_dots_1478: number;

    const KEY_braille_dots_148: number;

    const KEY_braille_dots_15: number;

    const KEY_braille_dots_156: number;

    const KEY_braille_dots_1567: number;

    const KEY_braille_dots_15678: number;

    const KEY_braille_dots_1568: number;

    const KEY_braille_dots_157: number;

    const KEY_braille_dots_1578: number;

    const KEY_braille_dots_158: number;

    const KEY_braille_dots_16: number;

    const KEY_braille_dots_167: number;

    const KEY_braille_dots_1678: number;

    const KEY_braille_dots_168: number;

    const KEY_braille_dots_17: number;

    const KEY_braille_dots_178: number;

    const KEY_braille_dots_18: number;

    const KEY_braille_dots_2: number;

    const KEY_braille_dots_23: number;

    const KEY_braille_dots_234: number;

    const KEY_braille_dots_2345: number;

    const KEY_braille_dots_23456: number;

    const KEY_braille_dots_234567: number;

    const KEY_braille_dots_2345678: number;

    const KEY_braille_dots_234568: number;

    const KEY_braille_dots_23457: number;

    const KEY_braille_dots_234578: number;

    const KEY_braille_dots_23458: number;

    const KEY_braille_dots_2346: number;

    const KEY_braille_dots_23467: number;

    const KEY_braille_dots_234678: number;

    const KEY_braille_dots_23468: number;

    const KEY_braille_dots_2347: number;

    const KEY_braille_dots_23478: number;

    const KEY_braille_dots_2348: number;

    const KEY_braille_dots_235: number;

    const KEY_braille_dots_2356: number;

    const KEY_braille_dots_23567: number;

    const KEY_braille_dots_235678: number;

    const KEY_braille_dots_23568: number;

    const KEY_braille_dots_2357: number;

    const KEY_braille_dots_23578: number;

    const KEY_braille_dots_2358: number;

    const KEY_braille_dots_236: number;

    const KEY_braille_dots_2367: number;

    const KEY_braille_dots_23678: number;

    const KEY_braille_dots_2368: number;

    const KEY_braille_dots_237: number;

    const KEY_braille_dots_2378: number;

    const KEY_braille_dots_238: number;

    const KEY_braille_dots_24: number;

    const KEY_braille_dots_245: number;

    const KEY_braille_dots_2456: number;

    const KEY_braille_dots_24567: number;

    const KEY_braille_dots_245678: number;

    const KEY_braille_dots_24568: number;

    const KEY_braille_dots_2457: number;

    const KEY_braille_dots_24578: number;

    const KEY_braille_dots_2458: number;

    const KEY_braille_dots_246: number;

    const KEY_braille_dots_2467: number;

    const KEY_braille_dots_24678: number;

    const KEY_braille_dots_2468: number;

    const KEY_braille_dots_247: number;

    const KEY_braille_dots_2478: number;

    const KEY_braille_dots_248: number;

    const KEY_braille_dots_25: number;

    const KEY_braille_dots_256: number;

    const KEY_braille_dots_2567: number;

    const KEY_braille_dots_25678: number;

    const KEY_braille_dots_2568: number;

    const KEY_braille_dots_257: number;

    const KEY_braille_dots_2578: number;

    const KEY_braille_dots_258: number;

    const KEY_braille_dots_26: number;

    const KEY_braille_dots_267: number;

    const KEY_braille_dots_2678: number;

    const KEY_braille_dots_268: number;

    const KEY_braille_dots_27: number;

    const KEY_braille_dots_278: number;

    const KEY_braille_dots_28: number;

    const KEY_braille_dots_3: number;

    const KEY_braille_dots_34: number;

    const KEY_braille_dots_345: number;

    const KEY_braille_dots_3456: number;

    const KEY_braille_dots_34567: number;

    const KEY_braille_dots_345678: number;

    const KEY_braille_dots_34568: number;

    const KEY_braille_dots_3457: number;

    const KEY_braille_dots_34578: number;

    const KEY_braille_dots_3458: number;

    const KEY_braille_dots_346: number;

    const KEY_braille_dots_3467: number;

    const KEY_braille_dots_34678: number;

    const KEY_braille_dots_3468: number;

    const KEY_braille_dots_347: number;

    const KEY_braille_dots_3478: number;

    const KEY_braille_dots_348: number;

    const KEY_braille_dots_35: number;

    const KEY_braille_dots_356: number;

    const KEY_braille_dots_3567: number;

    const KEY_braille_dots_35678: number;

    const KEY_braille_dots_3568: number;

    const KEY_braille_dots_357: number;

    const KEY_braille_dots_3578: number;

    const KEY_braille_dots_358: number;

    const KEY_braille_dots_36: number;

    const KEY_braille_dots_367: number;

    const KEY_braille_dots_3678: number;

    const KEY_braille_dots_368: number;

    const KEY_braille_dots_37: number;

    const KEY_braille_dots_378: number;

    const KEY_braille_dots_38: number;

    const KEY_braille_dots_4: number;

    const KEY_braille_dots_45: number;

    const KEY_braille_dots_456: number;

    const KEY_braille_dots_4567: number;

    const KEY_braille_dots_45678: number;

    const KEY_braille_dots_4568: number;

    const KEY_braille_dots_457: number;

    const KEY_braille_dots_4578: number;

    const KEY_braille_dots_458: number;

    const KEY_braille_dots_46: number;

    const KEY_braille_dots_467: number;

    const KEY_braille_dots_4678: number;

    const KEY_braille_dots_468: number;

    const KEY_braille_dots_47: number;

    const KEY_braille_dots_478: number;

    const KEY_braille_dots_48: number;

    const KEY_braille_dots_5: number;

    const KEY_braille_dots_56: number;

    const KEY_braille_dots_567: number;

    const KEY_braille_dots_5678: number;

    const KEY_braille_dots_568: number;

    const KEY_braille_dots_57: number;

    const KEY_braille_dots_578: number;

    const KEY_braille_dots_58: number;

    const KEY_braille_dots_6: number;

    const KEY_braille_dots_67: number;

    const KEY_braille_dots_678: number;

    const KEY_braille_dots_68: number;

    const KEY_braille_dots_7: number;

    const KEY_braille_dots_78: number;

    const KEY_braille_dots_8: number;

    const KEY_breve: number;

    const KEY_brokenbar: number;

    const KEY_c: number;

    const KEY_c_h: number;

    const KEY_cabovedot: number;

    const KEY_cacute: number;

    const KEY_careof: number;

    const KEY_caret: number;

    const KEY_caron: number;

    const KEY_ccaron: number;

    const KEY_ccedilla: number;

    const KEY_ccircumflex: number;

    const KEY_cedilla: number;

    const KEY_cent: number;

    const KEY_ch: number;

    const KEY_checkerboard: number;

    const KEY_checkmark: number;

    const KEY_circle: number;

    const KEY_club: number;

    const KEY_colon: number;

    const KEY_comma: number;

    const KEY_containsas: number;

    const KEY_copyright: number;

    const KEY_cr: number;

    const KEY_crossinglines: number;

    const KEY_cuberoot: number;

    const KEY_currency: number;

    const KEY_cursor: number;

    const KEY_d: number;

    const KEY_dabovedot: number;

    const KEY_dagger: number;

    const KEY_dcaron: number;

    const KEY_dead_A: number;

    const KEY_dead_E: number;

    const KEY_dead_I: number;

    const KEY_dead_O: number;

    const KEY_dead_U: number;

    const KEY_dead_a: number;

    const KEY_dead_abovecomma: number;

    const KEY_dead_abovedot: number;

    const KEY_dead_abovereversedcomma: number;

    const KEY_dead_abovering: number;

    const KEY_dead_aboveverticalline: number;

    const KEY_dead_acute: number;

    const KEY_dead_belowbreve: number;

    const KEY_dead_belowcircumflex: number;

    const KEY_dead_belowcomma: number;

    const KEY_dead_belowdiaeresis: number;

    const KEY_dead_belowdot: number;

    const KEY_dead_belowmacron: number;

    const KEY_dead_belowring: number;

    const KEY_dead_belowtilde: number;

    const KEY_dead_belowverticalline: number;

    const KEY_dead_breve: number;

    const KEY_dead_capital_schwa: number;

    const KEY_dead_caron: number;

    const KEY_dead_cedilla: number;

    const KEY_dead_circumflex: number;

    const KEY_dead_currency: number;

    const KEY_dead_dasia: number;

    const KEY_dead_diaeresis: number;

    const KEY_dead_doubleacute: number;

    const KEY_dead_doublegrave: number;

    const KEY_dead_e: number;

    const KEY_dead_grave: number;

    const KEY_dead_greek: number;

    const KEY_dead_hook: number;

    const KEY_dead_horn: number;

    const KEY_dead_i: number;

    const KEY_dead_invertedbreve: number;

    const KEY_dead_iota: number;

    const KEY_dead_longsolidusoverlay: number;

    const KEY_dead_lowline: number;

    const KEY_dead_macron: number;

    const KEY_dead_o: number;

    const KEY_dead_ogonek: number;

    const KEY_dead_perispomeni: number;

    const KEY_dead_psili: number;

    const KEY_dead_semivoiced_sound: number;

    const KEY_dead_small_schwa: number;

    const KEY_dead_stroke: number;

    const KEY_dead_tilde: number;

    const KEY_dead_u: number;

    const KEY_dead_voiced_sound: number;

    const KEY_decimalpoint: number;

    const KEY_degree: number;

    const KEY_diaeresis: number;

    const KEY_diamond: number;

    const KEY_digitspace: number;

    const KEY_dintegral: number;

    const KEY_division: number;

    const KEY_dollar: number;

    const KEY_doubbaselinedot: number;

    const KEY_doubleacute: number;

    const KEY_doubledagger: number;

    const KEY_doublelowquotemark: number;

    const KEY_downarrow: number;

    const KEY_downcaret: number;

    const KEY_downshoe: number;

    const KEY_downstile: number;

    const KEY_downtack: number;

    const KEY_dstroke: number;

    const KEY_e: number;

    const KEY_eabovedot: number;

    const KEY_eacute: number;

    const KEY_ebelowdot: number;

    const KEY_ecaron: number;

    const KEY_ecircumflex: number;

    const KEY_ecircumflexacute: number;

    const KEY_ecircumflexbelowdot: number;

    const KEY_ecircumflexgrave: number;

    const KEY_ecircumflexhook: number;

    const KEY_ecircumflextilde: number;

    const KEY_ediaeresis: number;

    const KEY_egrave: number;

    const KEY_ehook: number;

    const KEY_eightsubscript: number;

    const KEY_eightsuperior: number;

    const KEY_elementof: number;

    const KEY_ellipsis: number;

    const KEY_em3space: number;

    const KEY_em4space: number;

    const KEY_emacron: number;

    const KEY_emdash: number;

    const KEY_emfilledcircle: number;

    const KEY_emfilledrect: number;

    const KEY_emopencircle: number;

    const KEY_emopenrectangle: number;

    const KEY_emptyset: number;

    const KEY_emspace: number;

    const KEY_endash: number;

    const KEY_enfilledcircbullet: number;

    const KEY_enfilledsqbullet: number;

    const KEY_eng: number;

    const KEY_enopencircbullet: number;

    const KEY_enopensquarebullet: number;

    const KEY_enspace: number;

    const KEY_eogonek: number;

    const KEY_equal: number;

    const KEY_eth: number;

    const KEY_etilde: number;

    const KEY_exclam: number;

    const KEY_exclamdown: number;

    const KEY_ezh: number;

    const KEY_f: number;

    const KEY_fabovedot: number;

    const KEY_femalesymbol: number;

    const KEY_ff: number;

    const KEY_figdash: number;

    const KEY_filledlefttribullet: number;

    const KEY_filledrectbullet: number;

    const KEY_filledrighttribullet: number;

    const KEY_filledtribulletdown: number;

    const KEY_filledtribulletup: number;

    const KEY_fiveeighths: number;

    const KEY_fivesixths: number;

    const KEY_fivesubscript: number;

    const KEY_fivesuperior: number;

    const KEY_fourfifths: number;

    const KEY_foursubscript: number;

    const KEY_foursuperior: number;

    const KEY_fourthroot: number;

    const KEY_function: number;

    const KEY_g: number;

    const KEY_gabovedot: number;

    const KEY_gbreve: number;

    const KEY_gcaron: number;

    const KEY_gcedilla: number;

    const KEY_gcircumflex: number;

    const KEY_grave: number;

    const KEY_greater: number;

    const KEY_greaterthanequal: number;

    const KEY_guillemotleft: number;

    const KEY_guillemotright: number;

    const KEY_h: number;

    const KEY_hairspace: number;

    const KEY_hcircumflex: number;

    const KEY_heart: number;

    const KEY_hebrew_aleph: number;

    const KEY_hebrew_ayin: number;

    const KEY_hebrew_bet: number;

    const KEY_hebrew_beth: number;

    const KEY_hebrew_chet: number;

    const KEY_hebrew_dalet: number;

    const KEY_hebrew_daleth: number;

    const KEY_hebrew_doublelowline: number;

    const KEY_hebrew_finalkaph: number;

    const KEY_hebrew_finalmem: number;

    const KEY_hebrew_finalnun: number;

    const KEY_hebrew_finalpe: number;

    const KEY_hebrew_finalzade: number;

    const KEY_hebrew_finalzadi: number;

    const KEY_hebrew_gimel: number;

    const KEY_hebrew_gimmel: number;

    const KEY_hebrew_he: number;

    const KEY_hebrew_het: number;

    const KEY_hebrew_kaph: number;

    const KEY_hebrew_kuf: number;

    const KEY_hebrew_lamed: number;

    const KEY_hebrew_mem: number;

    const KEY_hebrew_nun: number;

    const KEY_hebrew_pe: number;

    const KEY_hebrew_qoph: number;

    const KEY_hebrew_resh: number;

    const KEY_hebrew_samech: number;

    const KEY_hebrew_samekh: number;

    const KEY_hebrew_shin: number;

    const KEY_hebrew_taf: number;

    const KEY_hebrew_taw: number;

    const KEY_hebrew_tet: number;

    const KEY_hebrew_teth: number;

    const KEY_hebrew_waw: number;

    const KEY_hebrew_yod: number;

    const KEY_hebrew_zade: number;

    const KEY_hebrew_zadi: number;

    const KEY_hebrew_zain: number;

    const KEY_hebrew_zayin: number;

    const KEY_hexagram: number;

    const KEY_horizconnector: number;

    const KEY_horizlinescan1: number;

    const KEY_horizlinescan3: number;

    const KEY_horizlinescan5: number;

    const KEY_horizlinescan7: number;

    const KEY_horizlinescan9: number;

    const KEY_hstroke: number;

    const KEY_ht: number;

    const KEY_hyphen: number;

    const KEY_i: number;

    const KEY_iTouch: number;

    const KEY_iacute: number;

    const KEY_ibelowdot: number;

    const KEY_ibreve: number;

    const KEY_icircumflex: number;

    const KEY_identical: number;

    const KEY_idiaeresis: number;

    const KEY_idotless: number;

    const KEY_ifonlyif: number;

    const KEY_igrave: number;

    const KEY_ihook: number;

    const KEY_imacron: number;

    const KEY_implies: number;

    const KEY_includedin: number;

    const KEY_includes: number;

    const KEY_infinity: number;

    const KEY_integral: number;

    const KEY_intersection: number;

    const KEY_iogonek: number;

    const KEY_itilde: number;

    const KEY_j: number;

    const KEY_jcircumflex: number;

    const KEY_jot: number;

    const KEY_k: number;

    const KEY_kana_A: number;

    const KEY_kana_CHI: number;

    const KEY_kana_E: number;

    const KEY_kana_FU: number;

    const KEY_kana_HA: number;

    const KEY_kana_HE: number;

    const KEY_kana_HI: number;

    const KEY_kana_HO: number;

    const KEY_kana_HU: number;

    const KEY_kana_I: number;

    const KEY_kana_KA: number;

    const KEY_kana_KE: number;

    const KEY_kana_KI: number;

    const KEY_kana_KO: number;

    const KEY_kana_KU: number;

    const KEY_kana_MA: number;

    const KEY_kana_ME: number;

    const KEY_kana_MI: number;

    const KEY_kana_MO: number;

    const KEY_kana_MU: number;

    const KEY_kana_N: number;

    const KEY_kana_NA: number;

    const KEY_kana_NE: number;

    const KEY_kana_NI: number;

    const KEY_kana_NO: number;

    const KEY_kana_NU: number;

    const KEY_kana_O: number;

    const KEY_kana_RA: number;

    const KEY_kana_RE: number;

    const KEY_kana_RI: number;

    const KEY_kana_RO: number;

    const KEY_kana_RU: number;

    const KEY_kana_SA: number;

    const KEY_kana_SE: number;

    const KEY_kana_SHI: number;

    const KEY_kana_SO: number;

    const KEY_kana_SU: number;

    const KEY_kana_TA: number;

    const KEY_kana_TE: number;

    const KEY_kana_TI: number;

    const KEY_kana_TO: number;

    const KEY_kana_TSU: number;

    const KEY_kana_TU: number;

    const KEY_kana_U: number;

    const KEY_kana_WA: number;

    const KEY_kana_WO: number;

    const KEY_kana_YA: number;

    const KEY_kana_YO: number;

    const KEY_kana_YU: number;

    const KEY_kana_a: number;

    const KEY_kana_closingbracket: number;

    const KEY_kana_comma: number;

    const KEY_kana_conjunctive: number;

    const KEY_kana_e: number;

    const KEY_kana_fullstop: number;

    const KEY_kana_i: number;

    const KEY_kana_middledot: number;

    const KEY_kana_o: number;

    const KEY_kana_openingbracket: number;

    const KEY_kana_switch: number;

    const KEY_kana_tsu: number;

    const KEY_kana_tu: number;

    const KEY_kana_u: number;

    const KEY_kana_ya: number;

    const KEY_kana_yo: number;

    const KEY_kana_yu: number;

    const KEY_kappa: number;

    const KEY_kcedilla: number;

    const KEY_kra: number;

    const KEY_l: number;

    const KEY_lacute: number;

    const KEY_latincross: number;

    const KEY_lbelowdot: number;

    const KEY_lcaron: number;

    const KEY_lcedilla: number;

    const KEY_leftanglebracket: number;

    const KEY_leftarrow: number;

    const KEY_leftcaret: number;

    const KEY_leftdoublequotemark: number;

    const KEY_leftmiddlecurlybrace: number;

    const KEY_leftopentriangle: number;

    const KEY_leftpointer: number;

    const KEY_leftradical: number;

    const KEY_leftshoe: number;

    const KEY_leftsinglequotemark: number;

    const KEY_leftt: number;

    const KEY_lefttack: number;

    const KEY_less: number;

    const KEY_lessthanequal: number;

    const KEY_lf: number;

    const KEY_logicaland: number;

    const KEY_logicalor: number;

    const KEY_lowleftcorner: number;

    const KEY_lowrightcorner: number;

    const KEY_lstroke: number;

    const KEY_m: number;

    const KEY_mabovedot: number;

    const KEY_macron: number;

    const KEY_malesymbol: number;

    const KEY_maltesecross: number;

    const KEY_marker: number;

    const KEY_masculine: number;

    const KEY_minus: number;

    const KEY_minutes: number;

    const KEY_mu: number;

    const KEY_multiply: number;

    const KEY_musicalflat: number;

    const KEY_musicalsharp: number;

    const KEY_n: number;

    const KEY_nabla: number;

    const KEY_nacute: number;

    const KEY_ncaron: number;

    const KEY_ncedilla: number;

    const KEY_ninesubscript: number;

    const KEY_ninesuperior: number;

    const KEY_nl: number;

    const KEY_nobreakspace: number;

    const KEY_notapproxeq: number;

    const KEY_notelementof: number;

    const KEY_notequal: number;

    const KEY_notidentical: number;

    const KEY_notsign: number;

    const KEY_ntilde: number;

    const KEY_numbersign: number;

    const KEY_numerosign: number;

    const KEY_o: number;

    const KEY_oacute: number;

    const KEY_obarred: number;

    const KEY_obelowdot: number;

    const KEY_ocaron: number;

    const KEY_ocircumflex: number;

    const KEY_ocircumflexacute: number;

    const KEY_ocircumflexbelowdot: number;

    const KEY_ocircumflexgrave: number;

    const KEY_ocircumflexhook: number;

    const KEY_ocircumflextilde: number;

    const KEY_odiaeresis: number;

    const KEY_odoubleacute: number;

    const KEY_oe: number;

    const KEY_ogonek: number;

    const KEY_ograve: number;

    const KEY_ohook: number;

    const KEY_ohorn: number;

    const KEY_ohornacute: number;

    const KEY_ohornbelowdot: number;

    const KEY_ohorngrave: number;

    const KEY_ohornhook: number;

    const KEY_ohorntilde: number;

    const KEY_omacron: number;

    const KEY_oneeighth: number;

    const KEY_onefifth: number;

    const KEY_onehalf: number;

    const KEY_onequarter: number;

    const KEY_onesixth: number;

    const KEY_onesubscript: number;

    const KEY_onesuperior: number;

    const KEY_onethird: number;

    const KEY_ooblique: number;

    const KEY_openrectbullet: number;

    const KEY_openstar: number;

    const KEY_opentribulletdown: number;

    const KEY_opentribulletup: number;

    const KEY_ordfeminine: number;

    const KEY_oslash: number;

    const KEY_otilde: number;

    const KEY_overbar: number;

    const KEY_overline: number;

    const KEY_p: number;

    const KEY_pabovedot: number;

    const KEY_paragraph: number;

    const KEY_parenleft: number;

    const KEY_parenright: number;

    const KEY_partdifferential: number;

    const KEY_partialderivative: number;

    const KEY_percent: number;

    const KEY_period: number;

    const KEY_periodcentered: number;

    const KEY_permille: number;

    const KEY_phonographcopyright: number;

    const KEY_plus: number;

    const KEY_plusminus: number;

    const KEY_prescription: number;

    const KEY_prolongedsound: number;

    const KEY_punctspace: number;

    const KEY_q: number;

    const KEY_quad: number;

    const KEY_question: number;

    const KEY_questiondown: number;

    const KEY_quotedbl: number;

    const KEY_quoteleft: number;

    const KEY_quoteright: number;

    const KEY_r: number;

    const KEY_racute: number;

    const KEY_radical: number;

    const KEY_rcaron: number;

    const KEY_rcedilla: number;

    const KEY_registered: number;

    const KEY_rightanglebracket: number;

    const KEY_rightarrow: number;

    const KEY_rightcaret: number;

    const KEY_rightdoublequotemark: number;

    const KEY_rightmiddlecurlybrace: number;

    const KEY_rightmiddlesummation: number;

    const KEY_rightopentriangle: number;

    const KEY_rightpointer: number;

    const KEY_rightshoe: number;

    const KEY_rightsinglequotemark: number;

    const KEY_rightt: number;

    const KEY_righttack: number;

    const KEY_s: number;

    const KEY_sabovedot: number;

    const KEY_sacute: number;

    const KEY_scaron: number;

    const KEY_scedilla: number;

    const KEY_schwa: number;

    const KEY_scircumflex: number;

    const KEY_script_switch: number;

    const KEY_seconds: number;

    const KEY_section: number;

    const KEY_semicolon: number;

    const KEY_semivoicedsound: number;

    const KEY_seveneighths: number;

    const KEY_sevensubscript: number;

    const KEY_sevensuperior: number;

    const KEY_signaturemark: number;

    const KEY_signifblank: number;

    const KEY_similarequal: number;

    const KEY_singlelowquotemark: number;

    const KEY_sixsubscript: number;

    const KEY_sixsuperior: number;

    const KEY_slash: number;

    const KEY_soliddiamond: number;

    const KEY_space: number;

    const KEY_squareroot: number;

    const KEY_ssharp: number;

    const KEY_sterling: number;

    const KEY_stricteq: number;

    const KEY_t: number;

    const KEY_tabovedot: number;

    const KEY_tcaron: number;

    const KEY_tcedilla: number;

    const KEY_telephone: number;

    const KEY_telephonerecorder: number;

    const KEY_therefore: number;

    const KEY_thinspace: number;

    const KEY_thorn: number;

    const KEY_threeeighths: number;

    const KEY_threefifths: number;

    const KEY_threequarters: number;

    const KEY_threesubscript: number;

    const KEY_threesuperior: number;

    const KEY_tintegral: number;

    const KEY_topintegral: number;

    const KEY_topleftparens: number;

    const KEY_topleftradical: number;

    const KEY_topleftsqbracket: number;

    const KEY_topleftsummation: number;

    const KEY_toprightparens: number;

    const KEY_toprightsqbracket: number;

    const KEY_toprightsummation: number;

    const KEY_topt: number;

    const KEY_topvertsummationconnector: number;

    const KEY_trademark: number;

    const KEY_trademarkincircle: number;

    const KEY_tslash: number;

    const KEY_twofifths: number;

    const KEY_twosubscript: number;

    const KEY_twosuperior: number;

    const KEY_twothirds: number;

    const KEY_u: number;

    const KEY_uacute: number;

    const KEY_ubelowdot: number;

    const KEY_ubreve: number;

    const KEY_ucircumflex: number;

    const KEY_udiaeresis: number;

    const KEY_udoubleacute: number;

    const KEY_ugrave: number;

    const KEY_uhook: number;

    const KEY_uhorn: number;

    const KEY_uhornacute: number;

    const KEY_uhornbelowdot: number;

    const KEY_uhorngrave: number;

    const KEY_uhornhook: number;

    const KEY_uhorntilde: number;

    const KEY_umacron: number;

    const KEY_underbar: number;

    const KEY_underscore: number;

    const KEY_union: number;

    const KEY_uogonek: number;

    const KEY_uparrow: number;

    const KEY_upcaret: number;

    const KEY_upleftcorner: number;

    const KEY_uprightcorner: number;

    const KEY_upshoe: number;

    const KEY_upstile: number;

    const KEY_uptack: number;

    const KEY_uring: number;

    const KEY_utilde: number;

    const KEY_v: number;

    const KEY_variation: number;

    const KEY_vertbar: number;

    const KEY_vertconnector: number;

    const KEY_voicedsound: number;

    const KEY_vt: number;

    const KEY_w: number;

    const KEY_wacute: number;

    const KEY_wcircumflex: number;

    const KEY_wdiaeresis: number;

    const KEY_wgrave: number;

    const KEY_x: number;

    const KEY_xabovedot: number;

    const KEY_y: number;

    const KEY_yacute: number;

    const KEY_ybelowdot: number;

    const KEY_ycircumflex: number;

    const KEY_ydiaeresis: number;

    const KEY_yen: number;

    const KEY_ygrave: number;

    const KEY_yhook: number;

    const KEY_ytilde: number;

    const KEY_z: number;

    const KEY_zabovedot: number;

    const KEY_zacute: number;

    const KEY_zcaron: number;

    const KEY_zerosubscript: number;

    const KEY_zerosuperior: number;

    const KEY_zstroke: number;

    const MAJOR_VERSION: number;

    const MAX_TIMECOORD_AXES: number;

    const MICRO_VERSION: number;

    const MINOR_VERSION: number;

    const PARENT_RELATIVE: number;

    const PRIORITY_REDRAW: number;

    function add_option_entries_libgtk_only(group: GLib.OptionGroup): void;

    function atom_intern(atom_name: string, only_if_exists: boolean): Atom;

    function atom_intern_static_string(atom_name: string): Atom;

    function beep(): void;

    function cairo_create(window: Window): cairo.Context;

    function cairo_draw_from_gl(cr: cairo.Context, window: Window, source: number, source_type: number, buffer_scale: number, x: number, y: number, width: number, height: number): void;

    function cairo_get_clip_rectangle(cr: cairo.Context): [boolean, Rectangle | null];

    function cairo_get_drawing_context(cr: cairo.Context): DrawingContext | null;

    function cairo_rectangle(cr: cairo.Context, rectangle: Rectangle): void;

    function cairo_region(cr: cairo.Context, region: cairo.Region): void;

    function cairo_region_create_from_surface(surface: cairo.Surface): cairo.Region;

    function cairo_set_source_color(cr: cairo.Context, color: Color): void;

    function cairo_set_source_pixbuf(cr: cairo.Context, pixbuf: GdkPixbuf.Pixbuf, pixbuf_x: number, pixbuf_y: number): void;

    function cairo_set_source_rgba(cr: cairo.Context, rgba: RGBA): void;

    function cairo_set_source_window(cr: cairo.Context, window: Window, x: number, y: number): void;

    function cairo_surface_create_from_pixbuf(pixbuf: GdkPixbuf.Pixbuf, scale: number, for_window: Window | null): cairo.Surface;

    function color_parse(spec: string): [boolean, Color];

    function disable_multidevice(): void;

    function drag_abort(context: DragContext, time_: number): void;

    function drag_begin(window: Window, targets: Atom[]): DragContext;

    function drag_begin_for_device(window: Window, device: Device, targets: Atom[]): DragContext;

    function drag_begin_from_point(window: Window, device: Device, targets: Atom[], x_root: number, y_root: number): DragContext;

    function drag_drop(context: DragContext, time_: number): void;

    function drag_drop_done(context: DragContext, success: boolean): void;

    function drag_drop_succeeded(context: DragContext): boolean;

    function drag_find_window_for_screen(context: DragContext, drag_window: Window, screen: Screen, x_root: number, y_root: number): [Window, DragProtocol];

    function drag_get_selection(context: DragContext): Atom;

    function drag_motion(context: DragContext, dest_window: Window, protocol: DragProtocol, x_root: number, y_root: number, suggested_action: DragAction, possible_actions: DragAction, time_: number): boolean;

    function drag_status(context: DragContext, action: DragAction, time_: number): void;

    function drop_finish(context: DragContext, success: boolean, time_: number): void;

    function drop_reply(context: DragContext, accepted: boolean, time_: number): void;

    function error_trap_pop(): number;

    function error_trap_pop_ignored(): void;

    function error_trap_push(): void;

    function event_get(): Event | null;

    function event_handler_set(func: EventFunc): void;

    function event_peek(): Event | null;

    function event_request_motions(event: EventMotion): void;

    function events_get_angle(event1: Event, event2: Event): [boolean, number];

    function events_get_center(event1: Event, event2: Event): [boolean, number, number];

    function events_get_distance(event1: Event, event2: Event): [boolean, number];

    function events_pending(): boolean;

    function flush(): void;

    function get_default_root_window(): Window;

    function get_display(): string;

    function get_display_arg_name(): string | null;

    function get_program_class(): string;

    function get_show_events(): boolean;

    function gl_error_quark(): GLib.Quark;

    function init(argv: string[]): string[];

    function init_check(argv: string[]): [boolean, string[]];

    function keyboard_grab(window: Window, owner_events: boolean, time_: number): GrabStatus;

    function keyboard_ungrab(time_: number): void;

    function keyval_convert_case(symbol: number): [number, number];

    function keyval_from_name(keyval_name: string): number;

    function keyval_is_lower(keyval: number): boolean;

    function keyval_is_upper(keyval: number): boolean;

    function keyval_name(keyval: number): string | null;

    function keyval_to_lower(keyval: number): number;

    function keyval_to_unicode(keyval: number): number;

    function keyval_to_upper(keyval: number): number;

    function list_visuals(): Visual[];

    function notify_startup_complete(): void;

    function notify_startup_complete_with_id(startup_id: string): void;

    function offscreen_window_get_embedder(window: Window): Window | null;

    function offscreen_window_get_surface(window: Window): cairo.Surface | null;

    function offscreen_window_set_embedder(window: Window, embedder: Window): void;

    function pango_context_get(): Pango.Context;

    function pango_context_get_for_display(display: Display): Pango.Context;

    function pango_context_get_for_screen(screen: Screen): Pango.Context;

    function parse_args(argv: string[]): string[];

    function pixbuf_get_from_surface(surface: cairo.Surface, src_x: number, src_y: number, width: number, height: number): GdkPixbuf.Pixbuf | null;

    function pixbuf_get_from_window(window: Window, src_x: number, src_y: number, width: number, height: number): GdkPixbuf.Pixbuf | null;

    function pointer_grab(window: Window, owner_events: boolean, event_mask: EventMask, confine_to: Window | null, cursor: Cursor | null, time_: number): GrabStatus;

    function pointer_is_grabbed(): boolean;

    function pointer_ungrab(time_: number): void;

    function pre_parse_libgtk_only(): void;

    function property_delete(window: Window, property: Atom): void;

    function property_get(window: Window, property: Atom, type: Atom, offset: bigint | number, length: bigint | number, pdelete: number): [boolean, Atom, number, Uint8Array];

    function query_depths(): number[];

    function query_visual_types(): VisualType[];

    function selection_convert(requestor: Window, selection: Atom, target: Atom, time_: number): void;

    function selection_owner_get(selection: Atom): Window | null;

    function selection_owner_get_for_display(display: Display, selection: Atom): Window | null;

    function selection_owner_set(owner: Window | null, selection: Atom, time_: number, send_event: boolean): boolean;

    function selection_owner_set_for_display(display: Display, owner: Window | null, selection: Atom, time_: number, send_event: boolean): boolean;

    function selection_send_notify(requestor: Window, selection: Atom, target: Atom, property: Atom, time_: number): void;

    function selection_send_notify_for_display(display: Display, requestor: Window, selection: Atom, target: Atom, property: Atom, time_: number): void;

    function set_allowed_backends(backends: string): void;

    function set_double_click_time(msec: number): void;

    function set_program_class(program_class: string): void;

    function set_show_events(show_events: boolean): void;

    function setting_get(name: string, value: GObject.Value | any): boolean;

    function synthesize_window_state(window: Window, unset_flags: WindowState, set_flags: WindowState): void;

    function test_render_sync(window: Window): void;

    function test_simulate_button(window: Window, x: number, y: number, button: number, modifiers: ModifierType, button_pressrelease: EventType): boolean;

    function test_simulate_key(window: Window, x: number, y: number, keyval: number, modifiers: ModifierType, key_pressrelease: EventType): boolean;

    function text_property_to_utf8_list_for_display(display: Display, encoding: Atom, format: number, text: Uint8Array | string): [number, string[]];

    function threads_add_idle(priority: number, _function: GLib.SourceFunc): number;

    function threads_add_timeout(priority: number, interval: number, _function: GLib.SourceFunc): number;

    function threads_add_timeout_seconds(priority: number, interval: number, _function: GLib.SourceFunc): number;

    function threads_enter(): void;

    function threads_init(): void;

    function threads_leave(): void;

    function unicode_to_keyval(wc: number): number;

    function utf8_to_string_target(str: string): string | null;

    interface EventFunc {
        (event: Event): void;
    }

    interface FilterFunc {
        (xevent: XEvent, event: Event): FilterReturn;
    }

    interface SeatGrabPrepareFunc {
        (seat: Seat, window: Window): void;
    }

    interface WindowChildFunc {
        (window: Window): boolean;
    }

    interface WindowInvalidateHandlerFunc {
        (window: Window, region: cairo.Region): void;
    }

    export namespace AnchorHints {
        export const $gtype: GObject.GType<AnchorHints>;
    }

    enum AnchorHints {
        FLIP_X = 1,
        FLIP_Y = 2,
        SLIDE_X = 4,
        SLIDE_Y = 8,
        RESIZE_X = 16,
        RESIZE_Y = 32,
        FLIP = 3,
        SLIDE = 12,
        RESIZE = 48,
    }


    export namespace AxisFlags {
        export const $gtype: GObject.GType<AxisFlags>;
    }

    enum AxisFlags {
        X = 2,
        Y = 4,
        PRESSURE = 8,
        XTILT = 16,
        YTILT = 32,
        WHEEL = 64,
        DISTANCE = 128,
        ROTATION = 256,
        SLIDER = 512,
    }


    export namespace DragAction {
        export const $gtype: GObject.GType<DragAction>;
    }

    enum DragAction {
        DEFAULT = 1,
        COPY = 2,
        MOVE = 4,
        LINK = 8,
        PRIVATE = 16,
        ASK = 32,
    }


    export namespace EventMask {
        export const $gtype: GObject.GType<EventMask>;
    }

    enum EventMask {
        EXPOSURE_MASK = 2,
        POINTER_MOTION_MASK = 4,
        POINTER_MOTION_HINT_MASK = 8,
        BUTTON_MOTION_MASK = 16,
        BUTTON1_MOTION_MASK = 32,
        BUTTON2_MOTION_MASK = 64,
        BUTTON3_MOTION_MASK = 128,
        BUTTON_PRESS_MASK = 256,
        BUTTON_RELEASE_MASK = 512,
        KEY_PRESS_MASK = 1024,
        KEY_RELEASE_MASK = 2048,
        ENTER_NOTIFY_MASK = 4096,
        LEAVE_NOTIFY_MASK = 8192,
        FOCUS_CHANGE_MASK = 16384,
        STRUCTURE_MASK = 32768,
        PROPERTY_CHANGE_MASK = 65536,
        VISIBILITY_NOTIFY_MASK = 131072,
        PROXIMITY_IN_MASK = 262144,
        PROXIMITY_OUT_MASK = 524288,
        SUBSTRUCTURE_MASK = 1048576,
        SCROLL_MASK = 2097152,
        TOUCH_MASK = 4194304,
        SMOOTH_SCROLL_MASK = 8388608,
        TOUCHPAD_GESTURE_MASK = 16777216,
        TABLET_PAD_MASK = 33554432,
        ALL_EVENTS_MASK = 67108862,
    }


    export namespace FrameClockPhase {
        export const $gtype: GObject.GType<FrameClockPhase>;
    }

    enum FrameClockPhase {
        NONE = 0,
        FLUSH_EVENTS = 1,
        BEFORE_PAINT = 2,
        UPDATE = 4,
        LAYOUT = 8,
        PAINT = 16,
        RESUME_EVENTS = 32,
        AFTER_PAINT = 64,
    }


    export namespace ModifierType {
        export const $gtype: GObject.GType<ModifierType>;
    }

    enum ModifierType {
        SHIFT_MASK = 1,
        LOCK_MASK = 2,
        CONTROL_MASK = 4,
        MOD1_MASK = 8,
        MOD2_MASK = 16,
        MOD3_MASK = 32,
        MOD4_MASK = 64,
        MOD5_MASK = 128,
        BUTTON1_MASK = 256,
        BUTTON2_MASK = 512,
        BUTTON3_MASK = 1024,
        BUTTON4_MASK = 2048,
        BUTTON5_MASK = 4096,
        MODIFIER_RESERVED_13_MASK = 8192,
        MODIFIER_RESERVED_14_MASK = 16384,
        MODIFIER_RESERVED_15_MASK = 32768,
        MODIFIER_RESERVED_16_MASK = 65536,
        MODIFIER_RESERVED_17_MASK = 131072,
        MODIFIER_RESERVED_18_MASK = 262144,
        MODIFIER_RESERVED_19_MASK = 524288,
        MODIFIER_RESERVED_20_MASK = 1048576,
        MODIFIER_RESERVED_21_MASK = 2097152,
        MODIFIER_RESERVED_22_MASK = 4194304,
        MODIFIER_RESERVED_23_MASK = 8388608,
        MODIFIER_RESERVED_24_MASK = 16777216,
        MODIFIER_RESERVED_25_MASK = 33554432,
        SUPER_MASK = 67108864,
        HYPER_MASK = 134217728,
        META_MASK = 268435456,
        MODIFIER_RESERVED_29_MASK = 536870912,
        RELEASE_MASK = 1073741824,
        MODIFIER_MASK = 1543512063,
    }


    export namespace SeatCapabilities {
        export const $gtype: GObject.GType<SeatCapabilities>;
    }

    enum SeatCapabilities {
        NONE = 0,
        POINTER = 1,
        TOUCH = 2,
        TABLET_STYLUS = 4,
        KEYBOARD = 8,
        ALL_POINTING = 7,
        ALL = 15,
    }


    export namespace WMDecoration {
        export const $gtype: GObject.GType<WMDecoration>;
    }

    enum WMDecoration {
        ALL = 1,
        BORDER = 2,
        RESIZEH = 4,
        TITLE = 8,
        MENU = 16,
        MINIMIZE = 32,
        MAXIMIZE = 64,
    }


    export namespace WMFunction {
        export const $gtype: GObject.GType<WMFunction>;
    }

    enum WMFunction {
        ALL = 1,
        RESIZE = 2,
        MOVE = 4,
        MINIMIZE = 8,
        MAXIMIZE = 16,
        CLOSE = 32,
    }


    export namespace WindowAttributesType {
        export const $gtype: GObject.GType<WindowAttributesType>;
    }

    enum WindowAttributesType {
        TITLE = 2,
        X = 4,
        Y = 8,
        CURSOR = 16,
        VISUAL = 32,
        WMCLASS = 64,
        NOREDIR = 128,
        TYPE_HINT = 256,
    }


    export namespace WindowHints {
        export const $gtype: GObject.GType<WindowHints>;
    }

    enum WindowHints {
        POS = 1,
        MIN_SIZE = 2,
        MAX_SIZE = 4,
        BASE_SIZE = 8,
        ASPECT = 16,
        RESIZE_INC = 32,
        WIN_GRAVITY = 64,
        USER_POS = 128,
        USER_SIZE = 256,
    }


    export namespace WindowState {
        export const $gtype: GObject.GType<WindowState>;
    }

    enum WindowState {
        WITHDRAWN = 1,
        ICONIFIED = 2,
        MAXIMIZED = 4,
        STICKY = 8,
        FULLSCREEN = 16,
        ABOVE = 32,
        BELOW = 64,
        FOCUSED = 128,
        TILED = 256,
        TOP_TILED = 512,
        TOP_RESIZABLE = 1024,
        RIGHT_TILED = 2048,
        RIGHT_RESIZABLE = 4096,
        BOTTOM_TILED = 8192,
        BOTTOM_RESIZABLE = 16384,
        LEFT_TILED = 32768,
        LEFT_RESIZABLE = 65536,
    }


    namespace AppLaunchContext {
        // Signal signatures
        interface SignalSignatures extends Gio.AppLaunchContext.SignalSignatures {
            "notify::display": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gio.AppLaunchContext.ConstructorProps {
            display: Display;
        }
    }

    class AppLaunchContext extends Gio.AppLaunchContext {
        static $gtype: GObject.GType<AppLaunchContext>;

        // Properties
        get display(): Display;

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

        // Methods
        set_desktop(desktop: number): void;

        set_display(display: Display): void;

        set_icon(icon: Gio.Icon | null): void;

        set_icon_name(icon_name: string | null): void;

        set_screen(screen: Screen): void;

        set_timestamp(timestamp: number): void;
    }


    namespace Cursor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::cursor-type": (pspec: GObject.ParamSpec) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            cursor_type: CursorType;
            cursorType: CursorType;
            display: Display;
        }
    }

    abstract class Cursor extends GObject.Object {
        static $gtype: GObject.GType<Cursor>;

        // Properties
        get cursor_type(): CursorType;

        get cursorType(): CursorType;

        get display(): Display;

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

        static ["new"](cursor_type: CursorType): Cursor;

        static new_for_display(display: Display, cursor_type: CursorType): Cursor;

        static new_from_name(display: Display, name: string): Cursor;

        static new_from_pixbuf(display: Display, pixbuf: GdkPixbuf.Pixbuf, x: number, y: number): Cursor;

        static new_from_surface(display: Display, surface: cairo.Surface, x: number, y: number): Cursor;

        // Signals
        /** @signal */
        connect<K extends keyof Cursor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Cursor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Cursor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Cursor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Cursor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Cursor.SignalSignatures[K]>): void;

        // Methods
        get_cursor_type(): CursorType;

        get_display(): Display;

        get_image(): GdkPixbuf.Pixbuf | null;

        get_surface(): [cairo.Surface | null, number, number];

        ref(): Cursor;

        unref(): void;
    }


    namespace Device {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            changed: () => void;
            /** @signal */
            "tool-changed": (tool: DeviceTool) => void;
            "notify::associated-device": (pspec: GObject.ParamSpec) => void;
            "notify::axes": (pspec: GObject.ParamSpec) => void;
            "notify::device-manager": (pspec: GObject.ParamSpec) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::has-cursor": (pspec: GObject.ParamSpec) => void;
            "notify::input-mode": (pspec: GObject.ParamSpec) => void;
            "notify::input-source": (pspec: GObject.ParamSpec) => void;
            "notify::n-axes": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::num-touches": (pspec: GObject.ParamSpec) => void;
            "notify::product-id": (pspec: GObject.ParamSpec) => void;
            "notify::seat": (pspec: GObject.ParamSpec) => void;
            "notify::tool": (pspec: GObject.ParamSpec) => void;
            "notify::type": (pspec: GObject.ParamSpec) => void;
            "notify::vendor-id": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            associated_device: Device | null;
            associatedDevice: Device | null;
            axes: AxisFlags;
            device_manager: DeviceManager;
            deviceManager: DeviceManager;
            display: Display;
            has_cursor: boolean;
            hasCursor: boolean;
            input_mode: InputMode;
            inputMode: InputMode;
            input_source: InputSource;
            inputSource: InputSource;
            n_axes: number;
            nAxes: number;
            name: string;
            num_touches: number;
            numTouches: number;
            product_id: string | null;
            productId: string | null;
            seat: Seat;
            tool: DeviceTool;
            type: DeviceType;
            vendor_id: string | null;
            vendorId: string | null;
        }
    }

    abstract class Device extends GObject.Object {
        static $gtype: GObject.GType<Device>;

        // Properties
        get associated_device(): Device | null;

        get associatedDevice(): Device | null;

        get axes(): AxisFlags;

        get device_manager(): DeviceManager;

        get deviceManager(): DeviceManager;

        get display(): Display;

        get has_cursor(): boolean;

        get hasCursor(): boolean;

        get input_mode(): InputMode;
        set input_mode(val: InputMode);

        get inputMode(): InputMode;
        set inputMode(val: InputMode);

        get input_source(): InputSource;

        get inputSource(): InputSource;

        get n_axes(): number;

        get nAxes(): number;

        get name(): string;

        get num_touches(): number;

        get numTouches(): number;

        get product_id(): string | null;

        get productId(): string | null;

        get seat(): Seat;
        set seat(val: Seat);

        get tool(): DeviceTool;

        get type(): DeviceType;

        get vendor_id(): string | null;

        get vendorId(): string | null;

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

        // Static methods
        static grab_info_libgtk_only(display: Display, device: Device): [boolean, Window, boolean];

        // Methods
        get_associated_device(): Device | null;

        get_axes(): AxisFlags;

        get_axis_use(index_: number): AxisUse;

        get_device_type(): DeviceType;

        get_display(): Display;

        get_has_cursor(): boolean;

        get_key(index_: number): [boolean, number, ModifierType];

        get_last_event_window(): Window | null;

        get_mode(): InputMode;

        get_n_axes(): number;

        get_n_keys(): number;

        get_name(): string;

        get_position(): [Screen | null, number, number];

        get_position_double(): [Screen | null, number, number];

        get_product_id(): string | null;

        get_seat(): Seat;

        get_source(): InputSource;

        get_vendor_id(): string | null;

        get_window_at_position(): [Window | null, number, number];

        get_window_at_position_double(): [Window | null, number, number];

        grab(window: Window, grab_ownership: GrabOwnership, owner_events: boolean, event_mask: EventMask, cursor: Cursor | null, time_: number): GrabStatus;

        list_axes(): Atom[];

        list_slave_devices(): Device[] | null;

        set_axis_use(index_: number, use: AxisUse): void;

        set_key(index_: number, keyval: number, modifiers: ModifierType): void;

        set_mode(mode: InputMode): boolean;

        ungrab(time_: number): void;

        warp(screen: Screen, x: number, y: number): void;
    }


    namespace DeviceManager {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "device-added": (device: Device) => void;
            /** @signal */
            "device-changed": (device: Device) => void;
            /** @signal */
            "device-removed": (device: Device) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            display: Display | null;
        }
    }

    abstract class DeviceManager extends GObject.Object {
        static $gtype: GObject.GType<DeviceManager>;

        // Properties
        get display(): Display | null;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceManager.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceManager.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceManager.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceManager.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceManager.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceManager.SignalSignatures[K]>): void;

        // Methods
        get_client_pointer(): Device;

        get_display(): Display | null;

        list_devices(type: DeviceType): Device[];
    }


    namespace DeviceTool {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::axes": (pspec: GObject.ParamSpec) => void;
            "notify::hardware-id": (pspec: GObject.ParamSpec) => void;
            "notify::serial": (pspec: GObject.ParamSpec) => void;
            "notify::tool-type": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            axes: AxisFlags;
            hardware_id: bigint | number;
            hardwareId: bigint | number;
            serial: bigint | number;
            tool_type: DeviceToolType;
            toolType: DeviceToolType;
        }
    }

    class DeviceTool extends GObject.Object {
        static $gtype: GObject.GType<DeviceTool>;

        // Properties
        get axes(): AxisFlags;

        get hardware_id(): number;

        get hardwareId(): number;

        get serial(): number;

        get tool_type(): DeviceToolType;

        get toolType(): DeviceToolType;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeviceTool.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeviceTool.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeviceTool.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceTool.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeviceTool.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeviceTool.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeviceTool.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeviceTool.SignalSignatures[K]>): void;

        // Methods
        get_hardware_id(): number;

        get_serial(): number;

        get_tool_type(): DeviceToolType;
    }


    namespace Display {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            closed: (is_error: boolean) => void;
            /** @signal */
            "monitor-added": (monitor: Monitor) => void;
            /** @signal */
            "monitor-removed": (monitor: Monitor) => void;
            /** @signal */
            opened: () => void;
            /** @signal */
            "seat-added": (seat: Seat) => void;
            /** @signal */
            "seat-removed": (seat: Seat) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Display extends GObject.Object {
        static $gtype: GObject.GType<Display>;

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

        // Static methods
        static get_default(): Display | null;

        static open(display_name: string): Display | null;

        static open_default_libgtk_only(): Display | null;

        // Methods
        beep(): void;

        close(): void;

        device_is_grabbed(device: Device): boolean;

        flush(): void;

        get_app_launch_context(): AppLaunchContext;

        get_default_cursor_size(): number;

        get_default_group(): Window;

        get_default_screen(): Screen;

        get_default_seat(): Seat;

        get_device_manager(): DeviceManager | null;

        get_event(): Event | null;

        get_maximal_cursor_size(): [number, number];

        get_monitor(monitor_num: number): Monitor | null;

        get_monitor_at_point(x: number, y: number): Monitor;

        get_monitor_at_window(window: Window): Monitor;

        get_n_monitors(): number;

        get_n_screens(): number;

        get_name(): string;

        get_pointer(): [Screen | null, number, number, ModifierType | null];

        get_primary_monitor(): Monitor | null;

        get_screen(screen_num: number): Screen;

        get_window_at_pointer(): [Window | null, number, number];

        has_pending(): boolean;

        is_closed(): boolean;

        keyboard_ungrab(time_: number): void;

        list_devices(): Device[];

        list_seats(): Seat[];

        notify_startup_complete(startup_id: string): void;

        peek_event(): Event | null;

        pointer_is_grabbed(): boolean;

        pointer_ungrab(time_: number): void;

        put_event(event: Event): void;

        request_selection_notification(selection: Atom): boolean;

        set_double_click_distance(distance: number): void;

        set_double_click_time(msec: number): void;

        store_clipboard(clipboard_window: Window, time_: number, targets: Atom[] | null): void;

        supports_clipboard_persistence(): boolean;

        supports_composite(): boolean;

        supports_cursor_alpha(): boolean;

        supports_cursor_color(): boolean;

        supports_input_shapes(): boolean;

        supports_selection_notification(): boolean;

        supports_shapes(): boolean;

        sync(): void;

        warp_pointer(screen: Screen, x: number, y: number): void;
    }


    namespace DisplayManager {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "display-opened": (display: Display) => void;
            "notify::default-display": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            default_display: Display | null;
            defaultDisplay: Display | null;
        }
    }

    class DisplayManager extends GObject.Object {
        static $gtype: GObject.GType<DisplayManager>;

        // Properties
        get default_display(): Display | null;
        set default_display(val: Display | null);

        get defaultDisplay(): Display | null;
        set defaultDisplay(val: Display | null);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DisplayManager.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DisplayManager.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DisplayManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DisplayManager.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DisplayManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DisplayManager.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DisplayManager.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DisplayManager.SignalSignatures[K]>): void;

        // Static methods
        static get(): DisplayManager;

        // Methods
        get_default_display(): Display | null;

        list_displays(): Display[];

        open_display(name: string): Display | null;

        set_default_display(display: Display): void;
    }


    namespace DragContext {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "action-changed": (action: DragAction) => void;
            /** @signal */
            cancel: (reason: DragCancelReason) => void;
            /** @signal */
            "dnd-finished": () => void;
            /** @signal */
            "drop-performed": (time: number) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class DragContext extends GObject.Object {
        static $gtype: GObject.GType<DragContext>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DragContext.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DragContext.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DragContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DragContext.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DragContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DragContext.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DragContext.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DragContext.SignalSignatures[K]>): void;

        // Methods
        get_actions(): DragAction;

        get_dest_window(): Window;

        get_device(): Device;

        get_drag_window(): Window | null;

        get_protocol(): DragProtocol;

        get_selected_action(): DragAction;

        get_source_window(): Window;

        get_suggested_action(): DragAction;

        list_targets(): Atom[];

        manage_dnd(ipc_window: Window, actions: DragAction): boolean;

        set_device(device: Device): void;

        set_hotspot(hot_x: number, hot_y: number): void;
    }


    namespace DrawingContext {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::clip": (pspec: GObject.ParamSpec) => void;
            "notify::window": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            clip: cairo.Region | null;
            window: Window;
        }
    }

    class DrawingContext extends GObject.Object {
        static $gtype: GObject.GType<DrawingContext>;

        // Properties
        get clip(): cairo.Region | null;

        get window(): Window;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DrawingContext.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DrawingContext.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DrawingContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DrawingContext.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DrawingContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DrawingContext.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DrawingContext.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DrawingContext.SignalSignatures[K]>): void;

        // Methods
        get_cairo_context(): cairo.Context;

        get_clip(): cairo.Region | null;

        get_window(): Window;

        is_valid(): boolean;
    }


    namespace FrameClock {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "after-paint": () => void;
            /** @signal */
            "before-paint": () => void;
            /** @signal */
            "flush-events": () => void;
            /** @signal */
            layout: () => void;
            /** @signal */
            paint: () => void;
            /** @signal */
            "resume-events": () => void;
            /** @signal */
            update: () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class FrameClock extends GObject.Object {
        static $gtype: GObject.GType<FrameClock>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FrameClock.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FrameClock.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FrameClock.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FrameClock.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FrameClock.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FrameClock.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FrameClock.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FrameClock.SignalSignatures[K]>): void;

        // Methods
        begin_updating(): void;

        end_updating(): void;

        get_current_timings(): FrameTimings | null;

        get_frame_counter(): number;

        get_frame_time(): number;

        get_history_start(): number;

        get_refresh_info(base_time: bigint | number): [number, number];

        get_timings(frame_counter: bigint | number): FrameTimings | null;

        request_phase(phase: FrameClockPhase): void;
    }


    namespace GLContext {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::shared-context": (pspec: GObject.ParamSpec) => void;
            "notify::window": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            display: Display | null;
            shared_context: GLContext | null;
            sharedContext: GLContext | null;
            window: Window | null;
        }
    }

    abstract class GLContext extends GObject.Object {
        static $gtype: GObject.GType<GLContext>;

        // Properties
        get display(): Display | null;

        get shared_context(): GLContext | null;

        get sharedContext(): GLContext | null;

        get window(): Window | null;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: GLContext.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<GLContext.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof GLContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GLContext.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof GLContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GLContext.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof GLContext.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<GLContext.SignalSignatures[K]>): void;

        // Static methods
        static clear_current(): void;

        static get_current(): GLContext | null;

        // Methods
        get_debug_enabled(): boolean;

        get_display(): Display | null;

        get_forward_compatible(): boolean;

        get_required_version(): [number, number];

        get_shared_context(): GLContext | null;

        get_use_es(): boolean;

        get_version(): [number, number];

        get_window(): Window | null;

        is_legacy(): boolean;

        make_current(): void;

        realize(): boolean;

        set_debug_enabled(enabled: boolean): void;

        set_forward_compatible(compatible: boolean): void;

        set_required_version(major: number, minor: number): void;

        set_use_es(use_es: number): void;
    }


    namespace Keymap {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "direction-changed": () => void;
            /** @signal */
            "keys-changed": () => void;
            /** @signal */
            "state-changed": () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Keymap extends GObject.Object {
        static $gtype: GObject.GType<Keymap>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Keymap.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Keymap.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Keymap.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Keymap.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Keymap.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Keymap.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Keymap.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Keymap.SignalSignatures[K]>): void;

        // Static methods
        static get_default(): Keymap;

        static get_for_display(display: Display): Keymap;

        // Methods
        add_virtual_modifiers(state: ModifierType): ModifierType;

        get_caps_lock_state(): boolean;

        get_direction(): Pango.Direction;

        get_entries_for_keycode(hardware_keycode: number): [boolean, KeymapKey[] | null, number[] | null];

        get_entries_for_keyval(keyval: number): [boolean, KeymapKey[]];

        get_modifier_mask(intent: ModifierIntent): ModifierType;

        get_modifier_state(): number;

        get_num_lock_state(): boolean;

        get_scroll_lock_state(): boolean;

        have_bidi_layouts(): boolean;

        lookup_key(key: KeymapKey): number;

        map_virtual_modifiers(state: ModifierType): [boolean, ModifierType];

        translate_keyboard_state(hardware_keycode: number, state: ModifierType, group: number): [boolean, number, number, number, ModifierType | null];
    }


    namespace Monitor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            invalidate: () => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::geometry": (pspec: GObject.ParamSpec) => void;
            "notify::height-mm": (pspec: GObject.ParamSpec) => void;
            "notify::manufacturer": (pspec: GObject.ParamSpec) => void;
            "notify::model": (pspec: GObject.ParamSpec) => void;
            "notify::refresh-rate": (pspec: GObject.ParamSpec) => void;
            "notify::scale-factor": (pspec: GObject.ParamSpec) => void;
            "notify::subpixel-layout": (pspec: GObject.ParamSpec) => void;
            "notify::width-mm": (pspec: GObject.ParamSpec) => void;
            "notify::workarea": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            display: Display;
            geometry: Rectangle;
            height_mm: number;
            heightMm: number;
            manufacturer: string | null;
            model: string | null;
            refresh_rate: number;
            refreshRate: number;
            scale_factor: number;
            scaleFactor: number;
            subpixel_layout: SubpixelLayout;
            subpixelLayout: SubpixelLayout;
            width_mm: number;
            widthMm: number;
            workarea: Rectangle;
        }
    }

    class Monitor extends GObject.Object {
        static $gtype: GObject.GType<Monitor>;

        // Properties
        get display(): Display;

        get geometry(): Rectangle;

        get height_mm(): number;

        get heightMm(): number;

        get manufacturer(): string | null;

        get model(): string | null;

        get refresh_rate(): number;

        get refreshRate(): number;

        get scale_factor(): number;

        get scaleFactor(): number;

        get subpixel_layout(): SubpixelLayout;

        get subpixelLayout(): SubpixelLayout;

        get width_mm(): number;

        get widthMm(): number;

        get workarea(): Rectangle;

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
        get_display(): Display;

        get_geometry(): Rectangle;

        get_height_mm(): number;

        get_manufacturer(): string | null;

        get_model(): string | null;

        get_refresh_rate(): number;

        get_scale_factor(): number;

        get_subpixel_layout(): SubpixelLayout;

        get_width_mm(): number;

        get_workarea(): Rectangle;

        is_primary(): boolean;
    }


    namespace Screen {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "composited-changed": () => void;
            /** @signal */
            "monitors-changed": () => void;
            /** @signal */
            "size-changed": () => void;
            "notify::font-options": (pspec: GObject.ParamSpec) => void;
            "notify::resolution": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            font_options: null;
            fontOptions: null;
            resolution: number;
        }
    }

    class Screen extends GObject.Object {
        static $gtype: GObject.GType<Screen>;

        // Properties
        get font_options(): null;
        set font_options(val: null);

        get fontOptions(): null;
        set fontOptions(val: null);

        get resolution(): number;
        set resolution(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Screen.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Screen.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Screen.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Screen.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Screen.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Screen.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Screen.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Screen.SignalSignatures[K]>): void;

        // Static methods
        static get_default(): Screen | null;

        static height(): number;

        static height_mm(): number;

        static width(): number;

        static width_mm(): number;

        // Methods
        get_active_window(): Window | null;

        get_display(): Display;

        get_font_options(): cairo.FontOptions | null;

        get_height(): number;

        get_height_mm(): number;

        get_monitor_at_point(x: number, y: number): number;

        get_monitor_at_window(window: Window): number;

        get_monitor_geometry(monitor_num: number): Rectangle | null;

        get_monitor_height_mm(monitor_num: number): number;

        get_monitor_plug_name(monitor_num: number): string | null;

        get_monitor_scale_factor(monitor_num: number): number;

        get_monitor_width_mm(monitor_num: number): number;

        get_monitor_workarea(monitor_num: number): Rectangle | null;

        get_n_monitors(): number;

        get_number(): number;

        get_primary_monitor(): number;

        get_resolution(): number;

        get_rgba_visual(): Visual | null;

        get_root_window(): Window;

        get_setting(name: string, value: GObject.Value | any): boolean;

        get_system_visual(): Visual;

        get_toplevel_windows(): Window[];

        get_width(): number;

        get_width_mm(): number;

        get_window_stack(): Window[] | null;

        is_composited(): boolean;

        list_visuals(): Visual[];

        make_display_name(): string;

        set_font_options(options: cairo.FontOptions | null): void;

        set_resolution(dpi: number): void;
    }


    namespace Seat {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "device-added": (device: Device) => void;
            /** @signal */
            "device-removed": (device: Device) => void;
            /** @signal */
            "tool-added": (tool: DeviceTool) => void;
            /** @signal */
            "tool-removed": (tool: DeviceTool) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            display: Display;
        }
    }

    abstract class Seat extends GObject.Object {
        static $gtype: GObject.GType<Seat>;

        // Properties
        get display(): Display;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Seat.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Seat.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Seat.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Seat.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Seat.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Seat.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Seat.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Seat.SignalSignatures[K]>): void;

        // Methods
        get_capabilities(): SeatCapabilities;

        get_display(): Display;

        get_keyboard(): Device | null;

        get_pointer(): Device | null;

        get_slaves(capabilities: SeatCapabilities): Device[];

        grab(window: Window, capabilities: SeatCapabilities, owner_events: boolean, cursor: Cursor | null, event: Event | null, prepare_func: SeatGrabPrepareFunc | null): GrabStatus;

        ungrab(): void;
    }


    namespace Visual {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Visual extends GObject.Object {
        static $gtype: GObject.GType<Visual>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Visual.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Visual.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Visual.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Visual.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Visual.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Visual.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Visual.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Visual.SignalSignatures[K]>): void;

        // Static methods
        static get_best(): Visual;

        static get_best_depth(): number;

        static get_best_type(): VisualType;

        static get_best_with_both(depth: number, visual_type: VisualType): Visual | null;

        static get_best_with_depth(depth: number): Visual;

        static get_best_with_type(visual_type: VisualType): Visual;

        static get_system(): Visual;

        // Methods
        get_bits_per_rgb(): number;

        get_blue_pixel_details(): [number, number, number];

        get_byte_order(): ByteOrder;

        get_colormap_size(): number;

        get_depth(): number;

        get_green_pixel_details(): [number, number, number];

        get_red_pixel_details(): [number, number, number];

        get_screen(): Screen;

        get_visual_type(): VisualType;
    }


    namespace Window {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "create-surface": (width: number, height: number) => cairo.Surface;
            /** @signal */
            "from-embedder": (embedder_x: number, embedder_y: number, offscreen_x: number, offscreen_y: number) => void;
            /** @signal */
            "moved-to-rect": (flipped_rect: null, final_rect: null, flipped_x: boolean, flipped_y: boolean) => void;
            /** @signal */
            "pick-embedded-child": (x: number, y: number) => Window | null;
            /** @signal */
            "to-embedder": (offscreen_x: number, offscreen_y: number, embedder_x: number, embedder_y: number) => void;
            "notify::cursor": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            cursor: Cursor | null;
        }
    }

    abstract class Window extends GObject.Object {
        static $gtype: GObject.GType<Window>;

        // Properties
        get cursor(): Cursor | null;
        set cursor(val: Cursor | null);

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

        static ["new"](parent: Window | null, attributes: WindowAttr, attributes_mask: WindowAttributesType): Window;

        // Signals
        /** @signal */
        connect<K extends keyof Window.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Window.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Window.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Window.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Window.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Window.SignalSignatures[K]>): void;

        // Static methods
        static at_pointer(): [Window, number, number];

        static constrain_size(geometry: Geometry, flags: WindowHints, width: number, height: number): [number, number];

        static process_all_updates(): void;

        static set_debug_updates(setting: boolean): void;

        // Virtual methods
        vfunc_create_surface(width: number, height: number): cairo.Surface;

        vfunc_from_embedder(embedder_x: number, embedder_y: number, offscreen_x: number, offscreen_y: number): void;

        vfunc_to_embedder(offscreen_x: number, offscreen_y: number, embedder_x: number, embedder_y: number): void;

        // Methods
        beep(): void;

        begin_draw_frame(region: cairo.Region): DrawingContext;

        begin_move_drag(button: number, root_x: number, root_y: number, timestamp: number): void;

        begin_move_drag_for_device(device: Device, button: number, root_x: number, root_y: number, timestamp: number): void;

        begin_paint_rect(rectangle: Rectangle): void;

        begin_paint_region(region: cairo.Region): void;

        begin_resize_drag(edge: WindowEdge, button: number, root_x: number, root_y: number, timestamp: number): void;

        begin_resize_drag_for_device(edge: WindowEdge, device: Device, button: number, root_x: number, root_y: number, timestamp: number): void;

        configure_finished(): void;

        coords_from_parent(parent_x: number, parent_y: number): [number, number];

        coords_to_parent(x: number, y: number): [number, number];

        create_gl_context(): GLContext;

        create_similar_image_surface(format: cairo.Format, width: number, height: number, scale: number): cairo.Surface;

        create_similar_surface(content: cairo.Content, width: number, height: number): cairo.Surface;

        deiconify(): void;

        destroy(): void;

        destroy_notify(): void;

        enable_synchronized_configure(): void;

        end_draw_frame(context: DrawingContext): void;

        end_paint(): void;

        ensure_native(): boolean;

        flush(): void;

        focus(timestamp: number): void;

        freeze_toplevel_updates_libgtk_only(): void;

        freeze_updates(): void;

        fullscreen(): void;

        fullscreen_on_monitor(monitor: number): void;

        geometry_changed(): void;

        get_accept_focus(): boolean;

        get_background_pattern(): cairo.Pattern | null;

        get_children(): Window[];

        get_children_with_user_data(user_data: null): Window[];

        get_clip_region(): cairo.Region;

        get_composited(): boolean;

        get_cursor(): Cursor | null;

        get_decorations(): [boolean, WMDecoration];

        get_device_cursor(device: Device): Cursor | null;

        get_device_events(device: Device): EventMask;

        get_device_position(device: Device): [Window | null, number, number, ModifierType | null];

        get_device_position_double(device: Device): [Window | null, number, number, ModifierType | null];

        get_display(): Display;

        get_drag_protocol(): [DragProtocol, Window | null];

        get_effective_parent(): Window;

        get_effective_toplevel(): Window;

        get_event_compression(): boolean;

        get_events(): EventMask;

        get_focus_on_map(): boolean;

        get_frame_clock(): FrameClock;

        get_frame_extents(): Rectangle;

        get_fullscreen_mode(): FullscreenMode;

        get_geometry(): [number, number, number, number];

        get_group(): Window;

        get_height(): number;

        get_modal_hint(): boolean;

        get_origin(): [number, number, number];

        get_parent(): Window;

        get_pass_through(): boolean;

        get_pointer(): [Window | null, number, number, ModifierType | null];

        get_position(): [number, number];

        get_root_coords(x: number, y: number): [number, number];

        get_root_origin(): [number, number];

        get_scale_factor(): number;

        get_screen(): Screen;

        get_source_events(source: InputSource): EventMask;

        get_state(): WindowState;

        get_support_multidevice(): boolean;

        get_toplevel(): Window;

        get_type_hint(): WindowTypeHint;

        get_update_area(): cairo.Region;

        get_user_data(): null;

        get_visible_region(): cairo.Region;

        get_visual(): Visual;

        get_width(): number;

        get_window_type(): WindowType;

        has_native(): boolean;

        hide(): void;

        iconify(): void;

        input_shape_combine_region(shape_region: cairo.Region, offset_x: number, offset_y: number): void;

        invalidate_maybe_recurse(region: cairo.Region, child_func: WindowChildFunc | null): void;

        invalidate_rect(rect: Rectangle | null, invalidate_children: boolean): void;

        invalidate_region(region: cairo.Region, invalidate_children: boolean): void;

        is_destroyed(): boolean;

        is_input_only(): boolean;

        is_shaped(): boolean;

        is_viewable(): boolean;

        is_visible(): boolean;

        lower(): void;

        mark_paint_from_clip(cr: cairo.Context): void;

        maximize(): void;

        merge_child_input_shapes(): void;

        merge_child_shapes(): void;

        move(x: number, y: number): void;

        move_region(region: cairo.Region, dx: number, dy: number): void;

        move_resize(x: number, y: number, width: number, height: number): void;

        move_to_rect(rect: Rectangle, rect_anchor: Gravity, window_anchor: Gravity, anchor_hints: AnchorHints, rect_anchor_dx: number, rect_anchor_dy: number): void;

        peek_children(): Window[];

        process_updates(update_children: boolean): void;

        raise(): void;

        register_dnd(): void;

        reparent(new_parent: Window, x: number, y: number): void;

        resize(width: number, height: number): void;

        restack(sibling: Window | null, above: boolean): void;

        scroll(dx: number, dy: number): void;

        set_accept_focus(accept_focus: boolean): void;

        set_background(color: Color): void;

        set_background_pattern(pattern: cairo.Pattern | null): void;

        set_background_rgba(rgba: RGBA): void;

        set_child_input_shapes(): void;

        set_child_shapes(): void;

        set_composited(composited: boolean): void;

        set_cursor(cursor: Cursor | null): void;

        set_decorations(decorations: WMDecoration): void;

        set_device_cursor(device: Device, cursor: Cursor): void;

        set_device_events(device: Device, event_mask: EventMask): void;

        set_event_compression(event_compression: boolean): void;

        set_events(event_mask: EventMask): void;

        set_focus_on_map(focus_on_map: boolean): void;

        set_fullscreen_mode(mode: FullscreenMode): void;

        set_functions(functions: WMFunction): void;

        set_geometry_hints(geometry: Geometry, geom_mask: WindowHints): void;

        set_group(leader: Window | null): void;

        set_icon_list(pixbufs: GdkPixbuf.Pixbuf[]): void;

        set_icon_name(name: string | null): void;

        set_keep_above(setting: boolean): void;

        set_keep_below(setting: boolean): void;

        set_modal_hint(modal: boolean): void;

        set_opacity(opacity: number): void;

        set_opaque_region(region: cairo.Region | null): void;

        set_override_redirect(override_redirect: boolean): void;

        set_pass_through(pass_through: boolean): void;

        set_role(role: string): void;

        set_shadow_width(left: number, right: number, top: number, bottom: number): void;

        set_skip_pager_hint(skips_pager: boolean): void;

        set_skip_taskbar_hint(skips_taskbar: boolean): void;

        set_source_events(source: InputSource, event_mask: EventMask): void;

        set_startup_id(startup_id: string): void;

        set_static_gravities(use_static: boolean): boolean;

        set_support_multidevice(support_multidevice: boolean): void;

        set_title(title: string): void;

        set_transient_for(parent: Window): void;

        set_type_hint(hint: WindowTypeHint): void;

        set_urgency_hint(urgent: boolean): void;

        set_user_data(user_data: GObject.Object | null): void;

        shape_combine_region(shape_region: cairo.Region | null, offset_x: number, offset_y: number): void;

        show(): void;

        show_unraised(): void;

        show_window_menu(event: Event): boolean;

        stick(): void;

        thaw_toplevel_updates_libgtk_only(): void;

        thaw_updates(): void;

        unfullscreen(): void;

        unmaximize(): void;

        unstick(): void;

        withdraw(): void;
    }


    abstract class Atom {
        static $gtype: GObject.GType<Atom>;

        // Static methods
        static intern(atom_name: string, only_if_exists: boolean): Atom;

        static intern_static_string(atom_name: string): Atom;

        // Methods
        name(): string;
    }


    class Color {
        static $gtype: GObject.GType<Color>;

        // Fields
        pixel: number;

        red: number;

        green: number;

        blue: number;

        // Constructors

        constructor(properties?: Partial<{
            pixel: number;
            red: number;
            green: number;
            blue: number;
        }>);

        // Static methods
        static parse(spec: string): [boolean, Color];

        // Methods
        copy(): Color;

        equal(colorb: Color): boolean;

        free(): void;

        hash(): number;

        to_string(): string;
    }


    type DevicePadInterface = typeof DevicePad;

    type DrawingContextClass = typeof DrawingContext;

    class EventAny {
        static $gtype: GObject.GType<EventAny>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;
    }


    class EventButton {
        static $gtype: GObject.GType<EventButton>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        time: number;

        x: number;

        y: number;

        axes: number;

        state: ModifierType;

        button: number;

        device: Device;

        x_root: number;

        y_root: number;
    }


    class EventConfigure {
        static $gtype: GObject.GType<EventConfigure>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        x: number;

        y: number;

        width: number;

        height: number;
    }


    class EventCrossing {
        static $gtype: GObject.GType<EventCrossing>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        subwindow: Window;

        time: number;

        x: number;

        y: number;

        x_root: number;

        y_root: number;

        mode: CrossingMode;

        detail: NotifyType;

        focus: boolean;

        state: ModifierType;
    }


    class EventDND {
        static $gtype: GObject.GType<EventDND>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        context: DragContext;

        time: number;

        x_root: number;

        y_root: number;
    }


    class EventExpose {
        static $gtype: GObject.GType<EventExpose>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        area: Rectangle;

        count: number;
    }


    class EventFocus {
        static $gtype: GObject.GType<EventFocus>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        "in": number;
    }


    class EventGrabBroken {
        static $gtype: GObject.GType<EventGrabBroken>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        keyboard: boolean;

        implicit: boolean;

        grab_window: Window;
    }


    class EventKey {
        static $gtype: GObject.GType<EventKey>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        time: number;

        state: ModifierType;

        keyval: number;

        length: number;

        string: string;

        hardware_keycode: number;

        group: number;

        is_modifier: number;
    }


    class EventMotion {
        static $gtype: GObject.GType<EventMotion>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        time: number;

        x: number;

        y: number;

        axes: number;

        state: ModifierType;

        is_hint: number;

        device: Device;

        x_root: number;

        y_root: number;
    }


    class EventOwnerChange {
        static $gtype: GObject.GType<EventOwnerChange>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        owner: Window;

        reason: OwnerChange;

        time: number;

        selection_time: number;
    }


    class EventPadAxis {
        static $gtype: GObject.GType<EventPadAxis>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        time: number;

        group: number;

        index: number;

        mode: number;

        value: number;
    }


    class EventPadButton {
        static $gtype: GObject.GType<EventPadButton>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        time: number;

        group: number;

        button: number;

        mode: number;
    }


    class EventPadGroupMode {
        static $gtype: GObject.GType<EventPadGroupMode>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        time: number;

        group: number;

        mode: number;
    }


    class EventProperty {
        static $gtype: GObject.GType<EventProperty>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        time: number;

        state: PropertyState;
    }


    class EventProximity {
        static $gtype: GObject.GType<EventProximity>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        time: number;

        device: Device;
    }


    class EventScroll {
        static $gtype: GObject.GType<EventScroll>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        time: number;

        x: number;

        y: number;

        state: ModifierType;

        direction: ScrollDirection;

        device: Device;

        x_root: number;

        y_root: number;

        delta_x: number;

        delta_y: number;

        is_stop: number;
    }


    class EventSelection {
        static $gtype: GObject.GType<EventSelection>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        time: number;

        requestor: Window;
    }


    abstract class EventSequence {
        static $gtype: GObject.GType<EventSequence>;
    }


    class EventSetting {
        static $gtype: GObject.GType<EventSetting>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        action: SettingAction;

        name: string;
    }


    class EventTouch {
        static $gtype: GObject.GType<EventTouch>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        time: number;

        x: number;

        y: number;

        axes: number;

        state: ModifierType;

        emulating_pointer: boolean;

        device: Device;

        x_root: number;

        y_root: number;
    }


    class EventTouchpadPinch {
        static $gtype: GObject.GType<EventTouchpadPinch>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        phase: number;

        n_fingers: number;

        time: number;

        x: number;

        y: number;

        dx: number;

        dy: number;

        angle_delta: number;

        scale: number;

        x_root: number;

        y_root: number;

        state: ModifierType;
    }


    class EventTouchpadSwipe {
        static $gtype: GObject.GType<EventTouchpadSwipe>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        phase: number;

        n_fingers: number;

        time: number;

        x: number;

        y: number;

        dx: number;

        dy: number;

        x_root: number;

        y_root: number;

        state: ModifierType;
    }


    class EventVisibility {
        static $gtype: GObject.GType<EventVisibility>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        state: VisibilityState;
    }


    class EventWindowState {
        static $gtype: GObject.GType<EventWindowState>;

        // Fields
        type: EventType;

        window: Window;

        send_event: number;

        changed_mask: WindowState;

        new_window_state: WindowState;
    }


    type FrameClockClass = typeof FrameClock;

    abstract class FrameClockPrivate {
        static $gtype: GObject.GType<FrameClockPrivate>;
    }


    abstract class FrameTimings {
        static $gtype: GObject.GType<FrameTimings>;

        // Methods
        get_complete(): boolean;

        get_frame_counter(): number;

        get_frame_time(): number;

        get_predicted_presentation_time(): number;

        get_presentation_time(): number;

        get_refresh_interval(): number;

        ref(): FrameTimings;

        unref(): void;
    }


    class Geometry {
        static $gtype: GObject.GType<Geometry>;

        // Fields
        min_width: number;

        min_height: number;

        max_width: number;

        max_height: number;

        base_width: number;

        base_height: number;

        width_inc: number;

        height_inc: number;

        min_aspect: number;

        max_aspect: number;

        win_gravity: Gravity;
    }


    class KeymapKey {
        static $gtype: GObject.GType<KeymapKey>;

        // Fields
        keycode: number;

        group: number;

        level: number;

        // Constructors

        constructor(properties?: Partial<{
            keycode: number;
            group: number;
            level: number;
        }>);
    }


    type MonitorClass = typeof Monitor;

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
    }


    class RGBA {
        static $gtype: GObject.GType<RGBA>;

        // Fields
        red: number;

        green: number;

        blue: number;

        alpha: number;

        // Constructors

        constructor(properties?: Partial<{
            red: number;
            green: number;
            blue: number;
            alpha: number;
        }>);

        // Methods
        copy(): RGBA;

        equal(p2: RGBA): boolean;

        free(): void;

        hash(): number;

        parse(spec: string): boolean;

        to_string(): string;
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

        // Methods
        equal(rect2: Rectangle): boolean;

        intersect(src2: Rectangle): [boolean, Rectangle | null];

        union(src2: Rectangle): Rectangle;
    }


    class TimeCoord {
        static $gtype: GObject.GType<TimeCoord>;

        // Fields
        time: number;

        axes: number[];

        // Constructors

        constructor(properties?: Partial<{
            time: number;
            axes: number[];
        }>);
    }


    class WindowAttr {
        static $gtype: GObject.GType<WindowAttr>;

        // Fields
        title: string;

        event_mask: number;

        x: number;

        y: number;

        width: number;

        height: number;

        wclass: WindowWindowClass;

        visual: Visual;

        window_type: WindowType;

        cursor: Cursor;

        wmclass_name: string;

        wmclass_class: string;

        override_redirect: boolean;

        type_hint: WindowTypeHint;
    }


    type WindowClass = typeof Window;

    abstract class WindowRedirect {
        static $gtype: GObject.GType<WindowRedirect>;
    }


    class Event {
        static $gtype: GObject.GType<Event>;

        // Fields
        type: EventType;

        // Constructors
        constructor(type: EventType);

        static ["new"](type: EventType): Event;

        // Static methods
        static get(): Event | null;

        static handler_set(func: EventFunc): void;

        static peek(): Event | null;

        static request_motions(event: EventMotion): void;

        // Methods
        _get_angle(event2: Event): [boolean, number];

        _get_center(event2: Event): [boolean, number, number];

        _get_distance(event2: Event): [boolean, number];

        copy(): Event;

        free(): void;

        get_axis(axis_use: AxisUse): [boolean, number];

        get_button(): [boolean, number];

        get_click_count(): [boolean, number];

        get_coords(): [boolean, number, number];

        get_device(): Device | null;

        get_device_tool(): DeviceTool;

        get_event_sequence(): EventSequence;

        get_event_type(): EventType;

        get_keycode(): [boolean, number];

        get_keyval(): [boolean, number];

        get_pointer_emulated(): boolean;

        get_root_coords(): [boolean, number, number];

        get_scancode(): number;

        get_screen(): Screen;

        get_scroll_deltas(): [boolean, number, number];

        get_scroll_direction(): [boolean, ScrollDirection];

        get_seat(): Seat;

        get_source_device(): Device | null;

        get_state(): [boolean, ModifierType];

        get_time(): number;

        get_window(): Window;

        is_scroll_stop_event(): boolean;

        put(): void;

        set_device(device: Device): void;

        set_device_tool(tool: DeviceTool | null): void;

        set_screen(screen: Screen): void;

        set_source_device(device: Device): void;

        triggers_context_menu(): boolean;
    }


    namespace DevicePad {

        // Constructor properties interface
        interface ConstructorProps extends Device.ConstructorProps {}
    }

    export interface DevicePadNamespace {
        $gtype: GObject.GType<DevicePad>;
        prototype: DevicePad;
    }
    interface DevicePad extends Device {

        // Methods
        get_feature_group(feature: DevicePadFeature, feature_idx: number): number;

        get_group_n_modes(group_idx: number): number;

        get_n_features(feature: DevicePadFeature): number;

        get_n_groups(): number;
    }


    export const DevicePad: DevicePadNamespace & {
        new (): DevicePad; // This allows `obj instanceof DevicePad`
    };

    type XEvent = void;

    const __name__: string;

    const __version__: string;
}

export default Gdk;

}

// END
