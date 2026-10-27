/// <reference path="./cairo-1.0.d.ts" />
/// <reference path="./cairo.d.ts" />
/// <reference path="./gobject-2.0.d.ts" />
/// <reference path="./glib-2.0.d.ts" />
/// <reference path="./pangocairo-1.0.d.ts" />
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

declare module 'gi://Gdk?version=4.0' {

// Module dependencies
import type cairo from 'cairo';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type PangoCairo from 'gi://PangoCairo?version=1.0';
import type Pango from 'gi://Pango?version=1.0';
import type HarfBuzz from 'gi://HarfBuzz?version=0.0';
import type freetype2 from 'gi://freetype2?version=2.0';
import type Gio from 'gi://Gio?version=2.0';
import type GModule from 'gi://GModule?version=2.0';
import type GdkPixbuf from 'gi://GdkPixbuf?version=2.0';

export namespace Gdk {

    /**
     * Gdk-4.0
     */


    export namespace AxisUse {
        export const $gtype: GObject.GType<AxisUse>;
    }

    enum AxisUse {
        IGNORE = 0,
        X = 1,
        Y = 2,
        DELTA_X = 3,
        DELTA_Y = 4,
        PRESSURE = 5,
        XTILT = 6,
        YTILT = 7,
        WHEEL = 8,
        DISTANCE = 9,
        ROTATION = 10,
        SLIDER = 11,
        LAST = 12,
    }


    export namespace CicpRange {
        export const $gtype: GObject.GType<CicpRange>;
    }

    enum CicpRange {
        NARROW = 0,
        FULL = 1,
    }


    export namespace ColorChannel {
        export const $gtype: GObject.GType<ColorChannel>;
    }

    enum ColorChannel {
        RED = 0,
        GREEN = 1,
        BLUE = 2,
        ALPHA = 3,
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


    class DmabufError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static NOT_AVAILABLE: number;

        static UNSUPPORTED_FORMAT: number;

        static CREATION_FAILED: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace DragCancelReason {
        export const $gtype: GObject.GType<DragCancelReason>;
    }

    enum DragCancelReason {
        NO_TARGET = 0,
        USER_CANCELLED = 1,
        ERROR = 2,
    }


    export namespace EventType {
        export const $gtype: GObject.GType<EventType>;
    }

    enum EventType {
        DELETE = 0,
        MOTION_NOTIFY = 1,
        BUTTON_PRESS = 2,
        BUTTON_RELEASE = 3,
        KEY_PRESS = 4,
        KEY_RELEASE = 5,
        ENTER_NOTIFY = 6,
        LEAVE_NOTIFY = 7,
        FOCUS_CHANGE = 8,
        PROXIMITY_IN = 9,
        PROXIMITY_OUT = 10,
        DRAG_ENTER = 11,
        DRAG_LEAVE = 12,
        DRAG_MOTION = 13,
        DROP_START = 14,
        SCROLL = 15,
        GRAB_BROKEN = 16,
        TOUCH_BEGIN = 17,
        TOUCH_UPDATE = 18,
        TOUCH_END = 19,
        TOUCH_CANCEL = 20,
        TOUCHPAD_SWIPE = 21,
        TOUCHPAD_PINCH = 22,
        PAD_BUTTON_PRESS = 23,
        PAD_BUTTON_RELEASE = 24,
        PAD_RING = 25,
        PAD_STRIP = 26,
        PAD_GROUP_MODE = 27,
        TOUCHPAD_HOLD = 28,
        PAD_DIAL = 29,
        EVENT_LAST = 30,
    }


    export namespace FrameResult {
        export const $gtype: GObject.GType<FrameResult>;
    }

    enum FrameResult {
        PREPARING = 0,
        SKIPPED = 1,
        EMPTY = 2,
        SUBMITTED = 3,
        OUTSTANDING = 4,
        DISCARDED = 5,
        PRESENTED = 6,
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

        static COMPILATION_FAILED: number;

        static LINK_FAILED: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
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


    export namespace InputSource {
        export const $gtype: GObject.GType<InputSource>;
    }

    enum InputSource {
        MOUSE = 0,
        PEN = 1,
        KEYBOARD = 2,
        TOUCHSCREEN = 3,
        TOUCHPAD = 4,
        TRACKPOINT = 5,
        TABLET_PAD = 6,
    }


    export namespace KeyMatch {
        export const $gtype: GObject.GType<KeyMatch>;
    }

    enum KeyMatch {
        NONE = 0,
        PARTIAL = 1,
        EXACT = 2,
    }


    export namespace MemoryFormat {
        export const $gtype: GObject.GType<MemoryFormat>;
    }

    enum MemoryFormat {
        B8G8R8A8_PREMULTIPLIED = 0,
        A8R8G8B8_PREMULTIPLIED = 1,
        R8G8B8A8_PREMULTIPLIED = 2,
        B8G8R8A8 = 3,
        A8R8G8B8 = 4,
        R8G8B8A8 = 5,
        A8B8G8R8 = 6,
        R8G8B8 = 7,
        B8G8R8 = 8,
        R16G16B16 = 9,
        R16G16B16A16_PREMULTIPLIED = 10,
        R16G16B16A16 = 11,
        R16G16B16_FLOAT = 12,
        R16G16B16A16_FLOAT_PREMULTIPLIED = 13,
        R16G16B16A16_FLOAT = 14,
        R32G32B32_FLOAT = 15,
        R32G32B32A32_FLOAT_PREMULTIPLIED = 16,
        R32G32B32A32_FLOAT = 17,
        G8A8_PREMULTIPLIED = 18,
        G8A8 = 19,
        G8 = 20,
        G16A16_PREMULTIPLIED = 21,
        G16A16 = 22,
        G16 = 23,
        A8 = 24,
        A16 = 25,
        A16_FLOAT = 26,
        A32_FLOAT = 27,
        A8B8G8R8_PREMULTIPLIED = 28,
        B8G8R8X8 = 29,
        X8R8G8B8 = 30,
        R8G8B8X8 = 31,
        X8B8G8R8 = 32,
        G8_B8R8_420 = 33,
        G8_R8B8_420 = 34,
        G8_B8R8_422 = 35,
        G8_R8B8_422 = 36,
        G8_B8R8_444 = 37,
        G8_R8B8_444 = 38,
        G10X6_B10X6R10X6_420 = 39,
        G12X4_B12X4R12X4_420 = 40,
        G16_B16R16_420 = 41,
        G8_B8_R8_410 = 42,
        G8_R8_B8_410 = 43,
        G8_B8_R8_411 = 44,
        G8_R8_B8_411 = 45,
        G8_B8_R8_420 = 46,
        G8_R8_B8_420 = 47,
        G8_B8_R8_422 = 48,
        G8_R8_B8_422 = 49,
        G8_B8_R8_444 = 50,
        G8_R8_B8_444 = 51,
        G8B8G8R8_422 = 52,
        G8R8G8B8_422 = 53,
        R8G8B8G8_422 = 54,
        B8G8R8G8_422 = 55,
        X6G10_X6B10_X6R10_420 = 56,
        X6G10_X6B10_X6R10_422 = 57,
        X6G10_X6B10_X6R10_444 = 58,
        X4G12_X4B12_X4R12_420 = 59,
        X4G12_X4B12_X4R12_422 = 60,
        X4G12_X4B12_X4R12_444 = 61,
        G16_B16_R16_420 = 62,
        G16_B16_R16_422 = 63,
        G16_B16_R16_444 = 64,
        ARGB2101010_PREMULTIPLIED = 65,
        ARGB2101010 = 66,
        XRGB2101010 = 67,
        ABGR2101010_PREMULTIPLIED = 68,
        ABGR2101010 = 69,
        XBGR2101010 = 70,
        N_FORMATS = 71,
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


    export namespace ScrollRelativeDirection {
        export const $gtype: GObject.GType<ScrollRelativeDirection>;
    }

    enum ScrollRelativeDirection {
        IDENTICAL = 0,
        INVERTED = 1,
        UNKNOWN = 2,
    }


    export namespace ScrollUnit {
        export const $gtype: GObject.GType<ScrollUnit>;
    }

    enum ScrollUnit {
        WHEEL = 0,
        SURFACE = 1,
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


    export namespace SurfaceEdge {
        export const $gtype: GObject.GType<SurfaceEdge>;
    }

    enum SurfaceEdge {
        NORTH_WEST = 0,
        NORTH = 1,
        NORTH_EAST = 2,
        WEST = 3,
        EAST = 4,
        SOUTH_WEST = 5,
        SOUTH = 6,
        SOUTH_EAST = 7,
    }


    class TextureError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static TOO_LARGE: number;

        static CORRUPT_IMAGE: number;

        static UNSUPPORTED_CONTENT: number;

        static UNSUPPORTED_FORMAT: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace TitlebarGesture {
        export const $gtype: GObject.GType<TitlebarGesture>;
    }

    enum TitlebarGesture {
        DOUBLE_CLICK = 1,
        RIGHT_CLICK = 2,
        MIDDLE_CLICK = 3,
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


    class VulkanError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static UNSUPPORTED: number;

        static NOT_AVAILABLE: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    const ACTION_ALL: number;

    const BUTTON_MIDDLE: number;

    const BUTTON_PRIMARY: number;

    const BUTTON_SECONDARY: number;

    const CURRENT_TIME: number;

    const EVENT_PROPAGATE: boolean;

    const EVENT_STOP: boolean;

    const KEY_0: number;

    const KEY_1: number;

    const KEY_10ChannelsDown: number;

    const KEY_10ChannelsUp: number;

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

    const KEY_3DMode: number;

    const KEY_4: number;

    const KEY_5: number;

    const KEY_6: number;

    const KEY_7: number;

    const KEY_8: number;

    const KEY_9: number;

    const KEY_A: number;

    const KEY_AE: number;

    const KEY_ALSToggle: number;

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

    const KEY_Accessibility: number;

    const KEY_Acircumflex: number;

    const KEY_Acircumflexacute: number;

    const KEY_Acircumflexbelowdot: number;

    const KEY_Acircumflexgrave: number;

    const KEY_Acircumflexhook: number;

    const KEY_Acircumflextilde: number;

    const KEY_AddFavorite: number;

    const KEY_Addressbook: number;

    const KEY_Adiaeresis: number;

    const KEY_Agrave: number;

    const KEY_Ahook: number;

    const KEY_Alt_L: number;

    const KEY_Alt_R: number;

    const KEY_Amacron: number;

    const KEY_Aogonek: number;

    const KEY_AppSelect: number;

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

    const KEY_AspectRatio: number;

    const KEY_Assistant: number;

    const KEY_Atilde: number;

    const KEY_AttendantOff: number;

    const KEY_AttendantOn: number;

    const KEY_AttendantToggle: number;

    const KEY_AudibleBell_Enable: number;

    const KEY_Audio: number;

    const KEY_AudioCycleTrack: number;

    const KEY_AudioDesc: number;

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

    const KEY_AutopilotEngageToggle: number;

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

    const KEY_BrightnessAuto: number;

    const KEY_BrightnessMax: number;

    const KEY_BrightnessMin: number;

    const KEY_Buttonconfig: number;

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

    const KEY_CameraAccessDisable: number;

    const KEY_CameraAccessEnable: number;

    const KEY_CameraAccessToggle: number;

    const KEY_CameraDown: number;

    const KEY_CameraFocus: number;

    const KEY_CameraLeft: number;

    const KEY_CameraRight: number;

    const KEY_CameraUp: number;

    const KEY_CameraZoomIn: number;

    const KEY_CameraZoomOut: number;

    const KEY_Cancel: number;

    const KEY_Caps_Lock: number;

    const KEY_Ccaron: number;

    const KEY_Ccedilla: number;

    const KEY_Ccircumflex: number;

    const KEY_Ch: number;

    const KEY_ChannelDown: number;

    const KEY_ChannelUp: number;

    const KEY_Clear: number;

    const KEY_ClearGrab: number;

    const KEY_ClearvuSonar: number;

    const KEY_Close: number;

    const KEY_Codeinput: number;

    const KEY_ColonSign: number;

    const KEY_Community: number;

    const KEY_ContextMenu: number;

    const KEY_ContrastAdjust: number;

    const KEY_ControlPanel: number;

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

    const KEY_DVD: number;

    const KEY_Dabovedot: number;

    const KEY_Data: number;

    const KEY_Database: number;

    const KEY_Dcaron: number;

    const KEY_Delete: number;

    const KEY_Dictate: number;

    const KEY_Display: number;

    const KEY_DisplayOff: number;

    const KEY_DisplayToggle: number;

    const KEY_DoNotDisturb: number;

    const KEY_Documents: number;

    const KEY_DongSign: number;

    const KEY_Down: number;

    const KEY_Dstroke: number;

    const KEY_DualRangeRadar: number;

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

    const KEY_Editor: number;

    const KEY_Egrave: number;

    const KEY_Ehook: number;

    const KEY_Eisu_Shift: number;

    const KEY_Eisu_toggle: number;

    const KEY_Eject: number;

    const KEY_Emacron: number;

    const KEY_EmojiPicker: number;

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

    const KEY_FastReverse: number;

    const KEY_Favorites: number;

    const KEY_Finance: number;

    const KEY_Find: number;

    const KEY_First_Virtual_Screen: number;

    const KEY_FishingChart: number;

    const KEY_Fn: number;

    const KEY_FnRightShift: number;

    const KEY_Fn_Esc: number;

    const KEY_Forward: number;

    const KEY_FrameBack: number;

    const KEY_FrameForward: number;

    const KEY_FullScreen: number;

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

    const KEY_GraphicsEditor: number;

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

    const KEY_HangupPhone: number;

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

    const KEY_Images: number;

    const KEY_Info: number;

    const KEY_Insert: number;

    const KEY_Iogonek: number;

    const KEY_Itilde: number;

    const KEY_J: number;

    const KEY_Jcircumflex: number;

    const KEY_Journal: number;

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

    const KEY_KbdInputAssistAccept: number;

    const KEY_KbdInputAssistCancel: number;

    const KEY_KbdInputAssistNext: number;

    const KEY_KbdInputAssistNextgroup: number;

    const KEY_KbdInputAssistPrev: number;

    const KEY_KbdInputAssistPrevgroup: number;

    const KEY_KbdLcdMenu1: number;

    const KEY_KbdLcdMenu2: number;

    const KEY_KbdLcdMenu3: number;

    const KEY_KbdLcdMenu4: number;

    const KEY_KbdLcdMenu5: number;

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

    const KEY_LeftDown: number;

    const KEY_LeftUp: number;

    const KEY_LightBulb: number;

    const KEY_LightsToggle: number;

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

    const KEY_Macro1: number;

    const KEY_Macro10: number;

    const KEY_Macro11: number;

    const KEY_Macro12: number;

    const KEY_Macro13: number;

    const KEY_Macro14: number;

    const KEY_Macro15: number;

    const KEY_Macro16: number;

    const KEY_Macro17: number;

    const KEY_Macro18: number;

    const KEY_Macro19: number;

    const KEY_Macro2: number;

    const KEY_Macro20: number;

    const KEY_Macro21: number;

    const KEY_Macro22: number;

    const KEY_Macro23: number;

    const KEY_Macro24: number;

    const KEY_Macro25: number;

    const KEY_Macro26: number;

    const KEY_Macro27: number;

    const KEY_Macro28: number;

    const KEY_Macro29: number;

    const KEY_Macro3: number;

    const KEY_Macro30: number;

    const KEY_Macro4: number;

    const KEY_Macro5: number;

    const KEY_Macro6: number;

    const KEY_Macro7: number;

    const KEY_Macro8: number;

    const KEY_Macro9: number;

    const KEY_MacroPreset1: number;

    const KEY_MacroPreset2: number;

    const KEY_MacroPreset3: number;

    const KEY_MacroPresetCycle: number;

    const KEY_MacroRecordStart: number;

    const KEY_MacroRecordStop: number;

    const KEY_Mae_Koho: number;

    const KEY_Mail: number;

    const KEY_MailForward: number;

    const KEY_MarkWaypoint: number;

    const KEY_Market: number;

    const KEY_Massyo: number;

    const KEY_MediaRepeat: number;

    const KEY_MediaTopMenu: number;

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

    const KEY_MonBrightnessCycle: number;

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

    const KEY_NavChart: number;

    const KEY_NavInfo: number;

    const KEY_Ncaron: number;

    const KEY_Ncedilla: number;

    const KEY_New: number;

    const KEY_NewSheqelSign: number;

    const KEY_News: number;

    const KEY_Next: number;

    const KEY_NextElement: number;

    const KEY_NextFavorite: number;

    const KEY_Next_VMode: number;

    const KEY_Next_Virtual_Screen: number;

    const KEY_NotificationCenter: number;

    const KEY_Ntilde: number;

    const KEY_Num_Lock: number;

    const KEY_Numeric0: number;

    const KEY_Numeric1: number;

    const KEY_Numeric11: number;

    const KEY_Numeric12: number;

    const KEY_Numeric2: number;

    const KEY_Numeric3: number;

    const KEY_Numeric4: number;

    const KEY_Numeric5: number;

    const KEY_Numeric6: number;

    const KEY_Numeric7: number;

    const KEY_Numeric8: number;

    const KEY_Numeric9: number;

    const KEY_NumericA: number;

    const KEY_NumericB: number;

    const KEY_NumericC: number;

    const KEY_NumericD: number;

    const KEY_NumericPound: number;

    const KEY_NumericStar: number;

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

    const KEY_OnScreenKeyboard: number;

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

    const KEY_PauseRecord: number;

    const KEY_PesetaSign: number;

    const KEY_Phone: number;

    const KEY_PickupPhone: number;

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

    const KEY_Presentation: number;

    const KEY_Prev_VMode: number;

    const KEY_Prev_Virtual_Screen: number;

    const KEY_PreviousCandidate: number;

    const KEY_PreviousElement: number;

    const KEY_Print: number;

    const KEY_Prior: number;

    const KEY_PrivacyScreenToggle: number;

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

    const KEY_RadarOverlay: number;

    const KEY_Rcaron: number;

    const KEY_Rcedilla: number;

    const KEY_Red: number;

    const KEY_Redo: number;

    const KEY_Refresh: number;

    const KEY_RefreshRateToggle: number;

    const KEY_Reload: number;

    const KEY_RepeatKeys_Enable: number;

    const KEY_Reply: number;

    const KEY_Return: number;

    const KEY_Right: number;

    const KEY_RightDown: number;

    const KEY_RightUp: number;

    const KEY_RockerDown: number;

    const KEY_RockerEnter: number;

    const KEY_RockerUp: number;

    const KEY_Romaji: number;

    const KEY_RootMenu: number;

    const KEY_RotateWindows: number;

    const KEY_RotationKB: number;

    const KEY_RotationLockToggle: number;

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

    const KEY_Screensaver: number;

    const KEY_ScrollClick: number;

    const KEY_ScrollDown: number;

    const KEY_ScrollUp: number;

    const KEY_Scroll_Lock: number;

    const KEY_Search: number;

    const KEY_Select: number;

    const KEY_SelectButton: number;

    const KEY_SelectiveScreenshot: number;

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

    const KEY_SidevuSonar: number;

    const KEY_SingleCandidate: number;

    const KEY_SingleRangeRadar: number;

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

    const KEY_SlowReverse: number;

    const KEY_Sos: number;

    const KEY_Spell: number;

    const KEY_SpellCheck: number;

    const KEY_SplitScreen: number;

    const KEY_Standby: number;

    const KEY_Start: number;

    const KEY_StickyKeys_Enable: number;

    const KEY_Stop: number;

    const KEY_StopRecord: number;

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

    const KEY_Taskmanager: number;

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

    const KEY_TraditionalSonar: number;

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

    const KEY_Unmute: number;

    const KEY_Uogonek: number;

    const KEY_Up: number;

    const KEY_Uring: number;

    const KEY_User1KB: number;

    const KEY_User2KB: number;

    const KEY_UserPB: number;

    const KEY_Utilde: number;

    const KEY_V: number;

    const KEY_VOD: number;

    const KEY_VendorHome: number;

    const KEY_Video: number;

    const KEY_VideoPhone: number;

    const KEY_View: number;

    const KEY_VoiceCommand: number;

    const KEY_Voicemail: number;

    const KEY_VoidSymbol: number;

    const KEY_W: number;

    const KEY_WLAN: number;

    const KEY_WPSButton: number;

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

    const KEY_ZoomReset: number;

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

    const KEY_combining_acute: number;

    const KEY_combining_belowdot: number;

    const KEY_combining_grave: number;

    const KEY_combining_hook: number;

    const KEY_combining_tilde: number;

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

    const KEY_dead_SCHWA: number;

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

    const KEY_dead_hamza: number;

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

    const KEY_dead_schwa: number;

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

    const KEY_guillemetleft: number;

    const KEY_guillemetright: number;

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

    const KEY_ordmasculine: number;

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

    const MODIFIER_MASK: number;

    const PRIORITY_REDRAW: number;

    function cairo_draw_from_gl(cr: cairo.Context, surface: Surface, source: number, source_type: number, buffer_scale: number, x: number, y: number, width: number, height: number): void;

    function cairo_rectangle(cr: cairo.Context, rectangle: Rectangle): void;

    function cairo_region(cr: cairo.Context, region: cairo.Region): void;

    function cairo_region_create_from_surface(surface: cairo.Surface): cairo.Region;

    function cairo_set_source_pixbuf(cr: cairo.Context, pixbuf: GdkPixbuf.Pixbuf, pixbuf_x: number, pixbuf_y: number): void;

    function cairo_set_source_rgba(cr: cairo.Context, rgba: RGBA): void;

    function color_state_get_oklab(): ColorState;

    function color_state_get_oklch(): ColorState;

    function color_state_get_rec2100_linear(): ColorState;

    function color_state_get_rec2100_pq(): ColorState;

    function color_state_get_srgb(): ColorState;

    function color_state_get_srgb_linear(): ColorState;

    function content_deserialize_async(stream: Gio.InputStream, mime_type: string, type: GObject.GType, io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<[unknown]>;
    function content_deserialize_async(stream: Gio.InputStream, mime_type: string, type: GObject.GType, io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Gio.InputStream> | null): void;
    function content_deserialize_async(stream: Gio.InputStream, mime_type: string, type: GObject.GType, io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Gio.InputStream> | null): globalThis.Promise<[unknown]> | void;

    function content_deserialize_finish(result: Gio.AsyncResult): [boolean, unknown];

    function content_formats_parse(string: string): ContentFormats | null;

    function content_register_deserializer(mime_type: string, type: GObject.GType, deserialize: ContentDeserializeFunc): void;

    function content_register_serializer(type: GObject.GType, mime_type: string, serialize: ContentSerializeFunc): void;

    function content_serialize_async(stream: Gio.OutputStream, mime_type: string, value: GObject.Value | any, io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;
    function content_serialize_async(stream: Gio.OutputStream, mime_type: string, value: GObject.Value | any, io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Gio.OutputStream> | null): void;
    function content_serialize_async(stream: Gio.OutputStream, mime_type: string, value: GObject.Value | any, io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Gio.OutputStream> | null): globalThis.Promise<boolean> | void;

    function content_serialize_finish(result: Gio.AsyncResult): boolean;

    function dmabuf_error_quark(): GLib.Quark;

    function drag_action_is_unique(action: DragAction): boolean;

    function events_get_angle(event1: Event, event2: Event): [boolean, number];

    function events_get_center(event1: Event, event2: Event): [boolean, number, number];

    function events_get_distance(event1: Event, event2: Event): [boolean, number];

    function gl_error_quark(): GLib.Quark;

    function intern_mime_type(string: string): string | null;

    function keyval_convert_case(symbol: number): [number, number];

    function keyval_from_name(keyval_name: string): number;

    function keyval_get_aliases(keyval: number): number[] | null;

    function keyval_is_lower(keyval: number): boolean;

    function keyval_is_upper(keyval: number): boolean;

    function keyval_name(keyval: number): string | null;

    function keyval_to_lower(keyval: number): number;

    function keyval_to_unicode(keyval: number): number;

    function keyval_to_upper(keyval: number): number;

    function paintable_new_empty(intrinsic_width: number, intrinsic_height: number): Paintable;

    function pixbuf_get_from_surface(surface: cairo.Surface, src_x: number, src_y: number, width: number, height: number): GdkPixbuf.Pixbuf | null;

    function pixbuf_get_from_texture(texture: Texture): GdkPixbuf.Pixbuf | null;

    function set_allowed_backends(backends: string): void;

    function texture_error_quark(): GLib.Quark;

    function unicode_to_keyval(wc: number): number;

    function vulkan_error_quark(): GLib.Quark;

    interface ContentDeserializeFunc {
        (deserializer: ContentDeserializer): void;
    }

    interface ContentSerializeFunc {
        (serializer: ContentSerializer): void;
    }

    interface CursorGetTextureCallback {
        (cursor: Cursor, cursor_size: number, scale: number, data: null): Texture | null;
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
        DELTA_X = 8,
        DELTA_Y = 16,
        PRESSURE = 32,
        XTILT = 64,
        YTILT = 128,
        WHEEL = 256,
        DISTANCE = 512,
        ROTATION = 1024,
        SLIDER = 2048,
    }


    export namespace DragAction {
        export const $gtype: GObject.GType<DragAction>;
    }

    enum DragAction {
        NONE = 0,
        COPY = 1,
        MOVE = 2,
        LINK = 4,
        ASK = 8,
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


    export namespace GLAPI {
        export const $gtype: GObject.GType<GLAPI>;
    }

    enum GLAPI {
        GL = 1,
        GLES = 2,
    }


    export namespace ModifierType {
        export const $gtype: GObject.GType<ModifierType>;
    }

    enum ModifierType {
        NO_MODIFIER_MASK = 0,
        SHIFT_MASK = 1,
        LOCK_MASK = 2,
        CONTROL_MASK = 4,
        ALT_MASK = 8,
        BUTTON1_MASK = 256,
        BUTTON2_MASK = 512,
        BUTTON3_MASK = 1024,
        BUTTON4_MASK = 2048,
        BUTTON5_MASK = 4096,
        SUPER_MASK = 67108864,
        HYPER_MASK = 134217728,
        META_MASK = 268435456,
    }


    export namespace PaintableFlags {
        export const $gtype: GObject.GType<PaintableFlags>;
    }

    enum PaintableFlags {
        STATIC_SIZE = 1,
        STATIC_CONTENTS = 2,
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
        TABLET_PAD = 16,
        ALL_POINTING = 7,
        ALL = 31,
    }


    export namespace ToplevelCapabilities {
        export const $gtype: GObject.GType<ToplevelCapabilities>;
    }

    enum ToplevelCapabilities {
        EDGE_CONSTRAINTS = 1,
        INHIBIT_SHORTCUTS = 2,
        TITLEBAR_GESTURES = 4,
        WINDOW_MENU = 8,
        MAXIMIZE = 16,
        FULLSCREEN = 32,
        MINIMIZE = 64,
        LOWER = 128,
    }


    export namespace ToplevelState {
        export const $gtype: GObject.GType<ToplevelState>;
    }

    enum ToplevelState {
        MINIMIZED = 1,
        MAXIMIZED = 2,
        STICKY = 4,
        FULLSCREEN = 8,
        ABOVE = 16,
        BELOW = 32,
        FOCUSED = 64,
        TILED = 128,
        TOP_TILED = 256,
        TOP_RESIZABLE = 512,
        RIGHT_TILED = 1024,
        RIGHT_RESIZABLE = 2048,
        BOTTOM_TILED = 4096,
        BOTTOM_RESIZABLE = 8192,
        LEFT_TILED = 16384,
        LEFT_RESIZABLE = 32768,
        SUSPENDED = 65536,
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

        // Signals
        /** @signal */
        connect<K extends keyof AppLaunchContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AppLaunchContext.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AppLaunchContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AppLaunchContext.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AppLaunchContext.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AppLaunchContext.SignalSignatures[K]>): void;

        // Methods
        get_display(): Display;

    // Conflicted with Gio.AppLaunchContext.get_display
        get_display(...args: never[]): any;

        set_desktop(desktop: number): void;

        set_icon(icon: Gio.Icon | null): void;

        set_icon_name(icon_name: string | null): void;

        set_timestamp(timestamp: number): void;
    }


    namespace ButtonEvent {
        // Signal signatures
        interface SignalSignatures extends Event.SignalSignatures {}
    }

    class ButtonEvent extends Event {
        static $gtype: GObject.GType<ButtonEvent>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ButtonEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ButtonEvent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ButtonEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ButtonEvent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ButtonEvent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ButtonEvent.SignalSignatures[K]>): void;

        // Methods
        get_button(): number;
    }


    namespace CairoContext {
        // Signal signatures
        interface SignalSignatures extends DrawContext.SignalSignatures {
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::surface": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends DrawContext.ConstructorProps {}
    }

    abstract class CairoContext extends DrawContext {
        static $gtype: GObject.GType<CairoContext>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: CairoContext.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<CairoContext.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof CairoContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CairoContext.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof CairoContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CairoContext.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof CairoContext.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<CairoContext.SignalSignatures[K]>): void;

        // Methods
        cairo_create(): cairo.Context | null;
    }


    namespace CicpParams {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::color-primaries": (pspec: GObject.ParamSpec) => void;
            "notify::matrix-coefficients": (pspec: GObject.ParamSpec) => void;
            "notify::range": (pspec: GObject.ParamSpec) => void;
            "notify::transfer-function": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            color_primaries: number;
            colorPrimaries: number;
            matrix_coefficients: number;
            matrixCoefficients: number;
            range: CicpRange;
            transfer_function: number;
            transferFunction: number;
        }
    }

    class CicpParams extends GObject.Object {
        static $gtype: GObject.GType<CicpParams>;

        // Properties
        get color_primaries(): number;
        set color_primaries(val: number);

        get colorPrimaries(): number;
        set colorPrimaries(val: number);

        get matrix_coefficients(): number;
        set matrix_coefficients(val: number);

        get matrixCoefficients(): number;
        set matrixCoefficients(val: number);

        get range(): CicpRange;
        set range(val: CicpRange);

        get transfer_function(): number;
        set transfer_function(val: number);

        get transferFunction(): number;
        set transferFunction(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: CicpParams.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<CicpParams.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): CicpParams;

        // Signals
        /** @signal */
        connect<K extends keyof CicpParams.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CicpParams.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof CicpParams.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CicpParams.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof CicpParams.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<CicpParams.SignalSignatures[K]>): void;

        // Methods
        build_color_state(): ColorState;

        get_color_primaries(): number;

        get_matrix_coefficients(): number;

        get_range(): CicpRange;

        get_transfer_function(): number;

        set_color_primaries(color_primaries: number): void;

        set_matrix_coefficients(matrix_coefficients: number): void;

        set_range(range: CicpRange): void;

        set_transfer_function(transfer_function: number): void;
    }


    namespace Clipboard {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            changed: () => void;
            "notify::content": (pspec: GObject.ParamSpec) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::formats": (pspec: GObject.ParamSpec) => void;
            "notify::local": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            content: ContentProvider | null;
            display: Display;
            formats: ContentFormats;
            local: boolean;
        }
    }

    class Clipboard extends GObject.Object {
        static $gtype: GObject.GType<Clipboard>;

        // Properties
        get content(): ContentProvider | null;

        get display(): Display;

        get formats(): ContentFormats;

        get local(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Clipboard.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Clipboard.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Clipboard.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Clipboard.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Clipboard.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Clipboard.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Clipboard.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Clipboard.SignalSignatures[K]>): void;

        // Methods
        get_content(): ContentProvider | null;

        get_display(): Display;

        get_formats(): ContentFormats;

        is_local(): boolean;

        read_async(mime_types: string[], io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<[Gio.InputStream | null, string]>;

        read_async(mime_types: string[], io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        read_async(mime_types: string[], io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<[Gio.InputStream | null, string]> | void;

        read_finish(result: Gio.AsyncResult): [Gio.InputStream | null, string];

        read_text_async(cancellable: Gio.Cancellable | null): globalThis.Promise<string | null>;

        read_text_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        read_text_async(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<string | null> | void;

        read_text_finish(result: Gio.AsyncResult): string | null;

        read_texture_async(cancellable: Gio.Cancellable | null): globalThis.Promise<Texture | null>;

        read_texture_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        read_texture_async(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Texture | null> | void;

        read_texture_finish(result: Gio.AsyncResult): Texture | null;

        read_value_async(type: GObject.GType, io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<unknown>;

        read_value_async(type: GObject.GType, io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        read_value_async(type: GObject.GType, io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<unknown> | void;

        read_value_finish(result: Gio.AsyncResult): unknown;

        set_content(provider: ContentProvider | null): boolean;

        set(value: GObject.Value | any): void;

    // Conflicted with GObject.Object.set
        set(...args: never[]): any;

        store_async(io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        store_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        store_async(io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        store_finish(result: Gio.AsyncResult): boolean;
    }


    namespace ContentDeserializer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Gio.AsyncResult.ConstructorProps {}
    }

    class ContentDeserializer extends GObject.Object implements Gio.AsyncResult {
        static $gtype: GObject.GType<ContentDeserializer>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ContentDeserializer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ContentDeserializer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ContentDeserializer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ContentDeserializer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ContentDeserializer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ContentDeserializer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ContentDeserializer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ContentDeserializer.SignalSignatures[K]>): void;

        // Methods
        get_cancellable(): Gio.Cancellable | null;

        get_gtype(): GObject.GType;

        get_input_stream(): Gio.InputStream;

        get_mime_type(): string;

        get_priority(): number;

        get_task_data(): null;

        get_user_data(): null;

        get_value(): unknown;

        return_error(error: GLib.Error): void;

        return_success(): void;

        set_task_data(data: null): void;

        get_source_object<T = GObject.Object>(): T;

        is_tagged(source_tag: null): boolean;

        legacy_propagate_error(): boolean;

        vfunc_get_source_object<T = GObject.Object>(): T;

        vfunc_get_user_data(): null;

        vfunc_is_tagged(source_tag: null): boolean;
    }


    namespace ContentProvider {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "content-changed": () => void;
            "notify::formats": (pspec: GObject.ParamSpec) => void;
            "notify::storable-formats": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            formats: ContentFormats;
            storable_formats: ContentFormats;
            storableFormats: ContentFormats;
        }
    }

    class ContentProvider extends GObject.Object {
        static $gtype: GObject.GType<ContentProvider>;

        // Properties
        get formats(): ContentFormats;

        get storable_formats(): ContentFormats;

        get storableFormats(): ContentFormats;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ContentProvider.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ContentProvider.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_for_bytes(mime_type: string, bytes: GLib.Bytes | Uint8Array): ContentProvider;

        static new_for_value(value: GObject.Value | any): ContentProvider;

        static new_union(providers: ContentProvider[] | null): ContentProvider;

        // Signals
        /** @signal */
        connect<K extends keyof ContentProvider.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ContentProvider.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ContentProvider.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ContentProvider.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ContentProvider.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ContentProvider.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_attach_clipboard(clipboard: Clipboard): void;

        vfunc_content_changed(): void;

        vfunc_detach_clipboard(clipboard: Clipboard): void;

        vfunc_get_value(): [boolean, GObject.Value | any];

        vfunc_ref_formats(): ContentFormats;

        vfunc_ref_storable_formats(): ContentFormats;

        vfunc_write_mime_type_async(mime_type: string, stream: Gio.OutputStream, io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_write_mime_type_finish(result: Gio.AsyncResult): boolean;

        // Methods
        content_changed(): void;

        get_value(): [boolean, unknown];

        ref_formats(): ContentFormats;

        ref_storable_formats(): ContentFormats;

        write_mime_type_async(mime_type: string, stream: Gio.OutputStream, io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        write_mime_type_async(mime_type: string, stream: Gio.OutputStream, io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        write_mime_type_async(mime_type: string, stream: Gio.OutputStream, io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        write_mime_type_finish(result: Gio.AsyncResult): boolean;
    }


    namespace ContentSerializer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Gio.AsyncResult.ConstructorProps {}
    }

    class ContentSerializer extends GObject.Object implements Gio.AsyncResult {
        static $gtype: GObject.GType<ContentSerializer>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ContentSerializer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ContentSerializer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ContentSerializer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ContentSerializer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ContentSerializer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ContentSerializer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ContentSerializer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ContentSerializer.SignalSignatures[K]>): void;

        // Methods
        get_cancellable(): Gio.Cancellable | null;

        get_gtype(): GObject.GType;

        get_mime_type(): string;

        get_output_stream(): Gio.OutputStream;

        get_priority(): number;

        get_task_data(): null;

        get_user_data(): null;

        get_value(): unknown;

        return_error(error: GLib.Error): void;

        return_success(): void;

        set_task_data(data: null): void;

        get_source_object<T = GObject.Object>(): T;

        is_tagged(source_tag: null): boolean;

        legacy_propagate_error(): boolean;

        vfunc_get_source_object<T = GObject.Object>(): T;

        vfunc_get_user_data(): null;

        vfunc_is_tagged(source_tag: null): boolean;
    }


    namespace CrossingEvent {
        // Signal signatures
        interface SignalSignatures extends Event.SignalSignatures {}
    }

    class CrossingEvent extends Event {
        static $gtype: GObject.GType<CrossingEvent>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof CrossingEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CrossingEvent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof CrossingEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CrossingEvent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof CrossingEvent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<CrossingEvent.SignalSignatures[K]>): void;

        // Methods
        get_detail(): NotifyType;

        get_focus(): boolean;

        get_mode(): CrossingMode;
    }


    namespace Cursor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::fallback": (pspec: GObject.ParamSpec) => void;
            "notify::hotspot-x": (pspec: GObject.ParamSpec) => void;
            "notify::hotspot-y": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::texture": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            fallback: Cursor | null;
            hotspot_x: number;
            hotspotX: number;
            hotspot_y: number;
            hotspotY: number;
            name: string | null;
            texture: Texture | null;
        }
    }

    class Cursor extends GObject.Object {
        static $gtype: GObject.GType<Cursor>;

        // Properties
        get fallback(): Cursor | null;

        get hotspot_x(): number;

        get hotspotX(): number;

        get hotspot_y(): number;

        get hotspotY(): number;

        get name(): string | null;

        get texture(): Texture | null;

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

        static new_from_callback(callback: CursorGetTextureCallback, fallback: Cursor | null): Cursor;

        static new_from_name(name: string, fallback: Cursor | null): Cursor;

        static new_from_texture(texture: Texture, hotspot_x: number, hotspot_y: number, fallback: Cursor | null): Cursor;

        // Signals
        /** @signal */
        connect<K extends keyof Cursor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Cursor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Cursor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Cursor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Cursor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Cursor.SignalSignatures[K]>): void;

        // Methods
        get_fallback(): Cursor | null;

        get_hotspot_x(): number;

        get_hotspot_y(): number;

        get_name(): string | null;

        get_texture(): Texture | null;
    }


    namespace DNDEvent {
        // Signal signatures
        interface SignalSignatures extends Event.SignalSignatures {}
    }

    class DNDEvent extends Event {
        static $gtype: GObject.GType<DNDEvent>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DNDEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DNDEvent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DNDEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DNDEvent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DNDEvent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DNDEvent.SignalSignatures[K]>): void;

        // Methods
        get_drop(): Drop | null;
    }


    namespace DeleteEvent {
        // Signal signatures
        interface SignalSignatures extends Event.SignalSignatures {}
    }

    class DeleteEvent extends Event {
        static $gtype: GObject.GType<DeleteEvent>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeleteEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeleteEvent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeleteEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeleteEvent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeleteEvent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeleteEvent.SignalSignatures[K]>): void;
    }


    namespace Device {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            changed: () => void;
            /** @signal */
            "tool-changed": (tool: DeviceTool) => void;
            "notify::active-layout-index": (pspec: GObject.ParamSpec) => void;
            "notify::caps-lock-state": (pspec: GObject.ParamSpec) => void;
            "notify::direction": (pspec: GObject.ParamSpec) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::has-bidi-layouts": (pspec: GObject.ParamSpec) => void;
            "notify::has-cursor": (pspec: GObject.ParamSpec) => void;
            "notify::layout-names": (pspec: GObject.ParamSpec) => void;
            "notify::modifier-state": (pspec: GObject.ParamSpec) => void;
            "notify::n-axes": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::num-lock-state": (pspec: GObject.ParamSpec) => void;
            "notify::num-touches": (pspec: GObject.ParamSpec) => void;
            "notify::product-id": (pspec: GObject.ParamSpec) => void;
            "notify::scroll-lock-state": (pspec: GObject.ParamSpec) => void;
            "notify::seat": (pspec: GObject.ParamSpec) => void;
            "notify::source": (pspec: GObject.ParamSpec) => void;
            "notify::tool": (pspec: GObject.ParamSpec) => void;
            "notify::vendor-id": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            active_layout_index: number;
            activeLayoutIndex: number;
            caps_lock_state: boolean;
            capsLockState: boolean;
            direction: Pango.Direction;
            display: Display;
            has_bidi_layouts: boolean;
            hasBidiLayouts: boolean;
            has_cursor: boolean;
            hasCursor: boolean;
            layout_names: string[] | null;
            layoutNames: string[] | null;
            modifier_state: ModifierType;
            modifierState: ModifierType;
            n_axes: number;
            nAxes: number;
            name: string;
            num_lock_state: boolean;
            numLockState: boolean;
            num_touches: number;
            numTouches: number;
            product_id: string | null;
            productId: string | null;
            scroll_lock_state: boolean;
            scrollLockState: boolean;
            seat: Seat;
            source: InputSource;
            tool: DeviceTool | null;
            vendor_id: string | null;
            vendorId: string | null;
        }
    }

    abstract class Device extends GObject.Object {
        static $gtype: GObject.GType<Device>;

        // Properties
        get active_layout_index(): number;

        get activeLayoutIndex(): number;

        get caps_lock_state(): boolean;

        get capsLockState(): boolean;

        get direction(): Pango.Direction;

        get display(): Display;

        get has_bidi_layouts(): boolean;

        get hasBidiLayouts(): boolean;

        get has_cursor(): boolean;

        get hasCursor(): boolean;

        get layout_names(): string[] | null;

        get layoutNames(): string[] | null;

        get modifier_state(): ModifierType;

        get modifierState(): ModifierType;

        get n_axes(): number;

        get nAxes(): number;

        get name(): string;

        get num_lock_state(): boolean;

        get numLockState(): boolean;

        get num_touches(): number;

        get numTouches(): number;

        get product_id(): string | null;

        get productId(): string | null;

        get scroll_lock_state(): boolean;

        get scrollLockState(): boolean;

        get seat(): Seat;
        set seat(val: Seat);

        get source(): InputSource;

        get tool(): DeviceTool | null;

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

        // Methods
        get_active_layout_index(): number;

        get_caps_lock_state(): boolean;

        get_device_tool(): DeviceTool | null;

        get_direction(): Pango.Direction;

        get_display(): Display;

        get_has_cursor(): boolean;

        get_layout_names(): string[] | null;

        get_modifier_state(): ModifierType;

        get_name(): string;

        get_num_lock_state(): boolean;

        get_num_touches(): number;

        get_product_id(): string | null;

        get_scroll_lock_state(): boolean;

        get_seat(): Seat;

        get_source(): InputSource;

        get_surface_at_position(): [Surface | null, number, number];

        get_timestamp(): number;

        get_vendor_id(): string | null;
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
        get_axes(): AxisFlags;

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
            opened: () => void;
            /** @signal */
            "seat-added": (seat: Seat) => void;
            /** @signal */
            "seat-removed": (seat: Seat) => void;
            /** @signal */
            "setting-changed": (setting: string) => void;
            "notify::composited": (pspec: GObject.ParamSpec) => void;
            "notify::dmabuf-formats": (pspec: GObject.ParamSpec) => void;
            "notify::input-shapes": (pspec: GObject.ParamSpec) => void;
            "notify::rgba": (pspec: GObject.ParamSpec) => void;
            "notify::shadow-width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            composited: boolean;
            dmabuf_formats: DmabufFormats;
            dmabufFormats: DmabufFormats;
            input_shapes: boolean;
            inputShapes: boolean;
            rgba: boolean;
            shadow_width: boolean;
            shadowWidth: boolean;
        }
    }

    class Display extends GObject.Object {
        static $gtype: GObject.GType<Display>;

        // Properties
        get composited(): boolean;

        get dmabuf_formats(): DmabufFormats;

        get dmabufFormats(): DmabufFormats;

        get input_shapes(): boolean;

        get inputShapes(): boolean;

        get rgba(): boolean;

        get shadow_width(): boolean;

        get shadowWidth(): boolean;

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

        static open(display_name: string | null): Display | null;

        // Methods
        beep(): void;

        close(): void;

        create_gl_context(): GLContext;

        device_is_grabbed(device: Device): boolean;

        flush(): void;

        get_app_launch_context(): AppLaunchContext;

        get_clipboard(): Clipboard;

        get_default_seat(): Seat | null;

        get_dmabuf_formats(): DmabufFormats;

        get_monitor_at_surface(surface: Surface): Monitor | null;

        get_monitors(): Gio.ListModel;

        get_name(): string;

        get_primary_clipboard(): Clipboard;

        get_setting(name: string, value: GObject.Value | any): boolean;

        get_startup_notification_id(): string | null;

        is_closed(): boolean;

        is_composited(): boolean;

        is_rgba(): boolean;

        list_seats(): Seat[];

        map_keycode(keycode: number): [boolean, KeymapKey[] | null, number[] | null];

        map_keyval(keyval: number): [boolean, KeymapKey[]];

        notify_startup_complete(startup_id: string): void;

        prepare_gl(): boolean;

        put_event(event: Event): void;

        supports_input_shapes(): boolean;

        supports_shadow_width(): boolean;

        sync(): void;

        translate_key(keycode: number, state: ModifierType, group: number): [boolean, number, number, number, ModifierType | null];
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

        open_display(name: string | null): Display | null;

        set_default_display(display: Display): void;
    }


    namespace DmabufTexture {
        // Signal signatures
        interface SignalSignatures extends Texture.SignalSignatures, Paintable.SignalSignatures {
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Texture.ConstructorProps, Paintable.ConstructorProps, Gio.Icon.ConstructorProps, Gio.LoadableIcon.ConstructorProps {}
    }

    class DmabufTexture extends Texture implements Paintable, Gio.Icon, Gio.LoadableIcon {
        static $gtype: GObject.GType<DmabufTexture>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DmabufTexture.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DmabufTexture.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DmabufTexture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DmabufTexture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DmabufTexture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DmabufTexture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DmabufTexture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DmabufTexture.SignalSignatures[K]>): void;

        compute_concrete_size(specified_width: number, specified_height: number, default_width: number, default_height: number): [number, number];

        get_current_image(): Paintable;

        get_flags(): PaintableFlags;

        get_intrinsic_aspect_ratio(): number;

        get_intrinsic_height(): number;

        get_intrinsic_width(): number;

        invalidate_contents(): void;

        invalidate_size(): void;

        snapshot(snapshot: Snapshot, width: number, height: number): void;

        vfunc_get_current_image(): Paintable;

        vfunc_get_flags(): PaintableFlags;

        vfunc_get_intrinsic_aspect_ratio(): number;

        vfunc_get_intrinsic_height(): number;

        vfunc_get_intrinsic_width(): number;

        vfunc_snapshot(snapshot: Snapshot, width: number, height: number): void;

        equal(icon2: Gio.Icon | null): boolean;

        hash(): number;

        serialize(): GLib.Variant | null;

        to_string(): string | null;

        vfunc_equal(icon2: Gio.Icon | null): boolean;

        vfunc_hash(): number;

        vfunc_serialize(): GLib.Variant | null;

        vfunc_to_tokens(): [boolean, string[], number];

        load(size: number, cancellable: Gio.Cancellable | null): [Gio.InputStream, string];

        load_async(size: number, cancellable: Gio.Cancellable | null): globalThis.Promise<[Gio.InputStream, string]>;

        load_async(size: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        load_async(size: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<[Gio.InputStream, string]> | void;

        load_finish(res: Gio.AsyncResult): [Gio.InputStream, string];

        vfunc_load(size: number, cancellable: Gio.Cancellable | null): [Gio.InputStream, string];

        vfunc_load_async(size: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_load_finish(res: Gio.AsyncResult): [Gio.InputStream, string];
    }


    namespace DmabufTextureBuilder {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::fourcc": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::modifier": (pspec: GObject.ParamSpec) => void;
            "notify::n-planes": (pspec: GObject.ParamSpec) => void;
            "notify::premultiplied": (pspec: GObject.ParamSpec) => void;
            "notify::update-region": (pspec: GObject.ParamSpec) => void;
            "notify::update-texture": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            color_state: ColorState | null;
            colorState: ColorState | null;
            display: Display;
            fourcc: number;
            height: number;
            modifier: bigint | number;
            n_planes: number;
            nPlanes: number;
            premultiplied: boolean;
            update_region: cairo.Region | null;
            updateRegion: cairo.Region | null;
            update_texture: Texture | null;
            updateTexture: Texture | null;
            width: number;
        }
    }

    class DmabufTextureBuilder extends GObject.Object {
        static $gtype: GObject.GType<DmabufTextureBuilder>;

        // Properties
        get color_state(): ColorState | null;
        set color_state(val: ColorState | null);

        get colorState(): ColorState | null;
        set colorState(val: ColorState | null);

        get display(): Display;
        set display(val: Display);

        get fourcc(): number;
        set fourcc(val: number);

        get height(): number;
        set height(val: number);

        get modifier(): number;
        set modifier(val: bigint | number);

        get n_planes(): number;
        set n_planes(val: number);

        get nPlanes(): number;
        set nPlanes(val: number);

        get premultiplied(): boolean;
        set premultiplied(val: boolean);

        get update_region(): cairo.Region | null;
        set update_region(val: cairo.Region | null);

        get updateRegion(): cairo.Region | null;
        set updateRegion(val: cairo.Region | null);

        get update_texture(): Texture | null;
        set update_texture(val: Texture | null);

        get updateTexture(): Texture | null;
        set updateTexture(val: Texture | null);

        get width(): number;
        set width(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DmabufTextureBuilder.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DmabufTextureBuilder.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): DmabufTextureBuilder;

        // Signals
        /** @signal */
        connect<K extends keyof DmabufTextureBuilder.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DmabufTextureBuilder.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DmabufTextureBuilder.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DmabufTextureBuilder.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DmabufTextureBuilder.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DmabufTextureBuilder.SignalSignatures[K]>): void;

        // Methods
        build(data: null): Texture | null;

        get_color_state(): ColorState | null;

        get_display(): Display;

        get_fd(plane: number): number;

        get_fourcc(): number;

        get_height(): number;

        get_modifier(): number;

        get_n_planes(): number;

        get_offset(plane: number): number;

        get_premultiplied(): boolean;

        get_stride(plane: number): number;

        get_update_region(): cairo.Region | null;

        get_update_texture(): Texture | null;

        get_width(): number;

        set_color_state(color_state: ColorState | null): void;

        set_display(display: Display): void;

        set_fd(plane: number, fd: number): void;

        set_fourcc(fourcc: number): void;

        set_height(height: number): void;

        set_modifier(modifier: bigint | number): void;

        set_n_planes(n_planes: number): void;

        set_offset(plane: number, offset: number): void;

        set_premultiplied(premultiplied: boolean): void;

        set_stride(plane: number, stride: number): void;

        set_update_region(region: cairo.Region | null): void;

        set_update_texture(texture: Texture | null): void;

        set_width(width: number): void;
    }


    namespace Drag {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            cancel: (reason: DragCancelReason) => void;
            /** @signal */
            "dnd-finished": () => void;
            /** @signal */
            "drop-performed": () => void;
            "notify::actions": (pspec: GObject.ParamSpec) => void;
            "notify::content": (pspec: GObject.ParamSpec) => void;
            "notify::device": (pspec: GObject.ParamSpec) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::formats": (pspec: GObject.ParamSpec) => void;
            "notify::selected-action": (pspec: GObject.ParamSpec) => void;
            "notify::surface": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            actions: DragAction;
            content: ContentProvider;
            device: Device;
            display: Display;
            formats: ContentFormats;
            selected_action: DragAction;
            selectedAction: DragAction;
            surface: Surface;
        }
    }

    abstract class Drag extends GObject.Object {
        static $gtype: GObject.GType<Drag>;

        // Properties
        get actions(): DragAction;
        set actions(val: DragAction);

        get content(): ContentProvider;

        get device(): Device;

        get display(): Display;

        get formats(): ContentFormats;

        get selected_action(): DragAction;
        set selected_action(val: DragAction);

        get selectedAction(): DragAction;
        set selectedAction(val: DragAction);

        get surface(): Surface;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Drag.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Drag.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Drag.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Drag.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Drag.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Drag.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Drag.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Drag.SignalSignatures[K]>): void;

        // Static methods
        static begin(surface: Surface, device: Device, content: ContentProvider, actions: DragAction, dx: number, dy: number): Drag | null;

        // Methods
        drop_done(success: boolean): void;

        get_actions(): DragAction;

        get_content(): ContentProvider;

        get_device(): Device;

        get_display(): Display;

        get_drag_surface(): Surface | null;

        get_formats(): ContentFormats;

        get_selected_action(): DragAction;

        get_surface(): Surface;

        set_hotspot(hot_x: number, hot_y: number): void;
    }


    namespace DrawContext {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::surface": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            display: Display | null;
            surface: Surface | null;
        }
    }

    abstract class DrawContext extends GObject.Object {
        static $gtype: GObject.GType<DrawContext>;

        // Properties
        get display(): Display | null;

        get surface(): Surface | null;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DrawContext.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DrawContext.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DrawContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DrawContext.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DrawContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DrawContext.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DrawContext.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DrawContext.SignalSignatures[K]>): void;

        // Methods
        begin_frame(region: cairo.Region): void;

        end_frame(): void;

        get_display(): Display | null;

        get_frame_region(): cairo.Region | null;

        get_surface(): Surface | null;

        is_in_frame(): boolean;
    }


    namespace Drop {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::actions": (pspec: GObject.ParamSpec) => void;
            "notify::device": (pspec: GObject.ParamSpec) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::drag": (pspec: GObject.ParamSpec) => void;
            "notify::formats": (pspec: GObject.ParamSpec) => void;
            "notify::surface": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            actions: DragAction;
            device: Device;
            display: Display;
            drag: Drag | null;
            formats: ContentFormats;
            surface: Surface;
        }
    }

    abstract class Drop extends GObject.Object {
        static $gtype: GObject.GType<Drop>;

        // Properties
        get actions(): DragAction;

        get device(): Device;

        get display(): Display;

        get drag(): Drag | null;

        get formats(): ContentFormats;

        get surface(): Surface;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Drop.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Drop.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Drop.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Drop.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Drop.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Drop.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Drop.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Drop.SignalSignatures[K]>): void;

        // Methods
        finish(action: DragAction): void;

        get_actions(): DragAction;

        get_device(): Device;

        get_display(): Display;

        get_drag(): Drag | null;

        get_formats(): ContentFormats;

        get_surface(): Surface;

        read_async(mime_types: string[], io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<[Gio.InputStream | null, string]>;

        read_async(mime_types: string[], io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        read_async(mime_types: string[], io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<[Gio.InputStream | null, string]> | void;

        read_finish(result: Gio.AsyncResult): [Gio.InputStream | null, string];

        read_value_async(type: GObject.GType, io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<unknown>;

        read_value_async(type: GObject.GType, io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        read_value_async(type: GObject.GType, io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<unknown> | void;

        read_value_finish(result: Gio.AsyncResult): unknown;

        status(actions: DragAction, preferred: DragAction): void;
    }


    namespace Event {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    abstract class Event {
        static $gtype: GObject.GType<Event>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Event.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Event.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Event.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Event.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Event.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Event.SignalSignatures[K]>): void;

        // Methods
        _get_angle(event2: Event): [boolean, number];

        _get_center(event2: Event): [boolean, number, number];

        _get_distance(event2: Event): [boolean, number];

        get_axes(): [boolean, number[]];

        get_axis(axis_use: AxisUse): [boolean, number];

        get_device(): Device | null;

        get_device_tool(): DeviceTool | null;

        get_display(): Display | null;

        get_event_sequence(): EventSequence;

        get_event_type(): EventType;

        get_history(): TimeCoord[] | null;

        get_modifier_state(): ModifierType;

        get_pointer_emulated(): boolean;

        get_position(): [boolean, number, number];

        get_seat(): Seat | null;

        get_surface(): Surface | null;

        get_time(): number;

        ref(): Event;

        triggers_context_menu(): boolean;

        unref(): void;
    }


    namespace FocusEvent {
        // Signal signatures
        interface SignalSignatures extends Event.SignalSignatures {}
    }

    class FocusEvent extends Event {
        static $gtype: GObject.GType<FocusEvent>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FocusEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FocusEvent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FocusEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FocusEvent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FocusEvent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FocusEvent.SignalSignatures[K]>): void;

        // Methods
        get_in(): boolean;
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

        get_fps(): number;

        get_frame_counter(): number;

        get_frame_time(): number;

        get_history_start(): number;

        get_refresh_info(base_time: bigint | number): [number, number];

        get_timings(frame_counter: bigint | number): FrameTimings | null;

        request_phase(phase: FrameClockPhase): void;
    }


    namespace GLContext {
        // Signal signatures
        interface SignalSignatures extends DrawContext.SignalSignatures {
            "notify::allowed-apis": (pspec: GObject.ParamSpec) => void;
            "notify::api": (pspec: GObject.ParamSpec) => void;
            "notify::shared-context": (pspec: GObject.ParamSpec) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::surface": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends DrawContext.ConstructorProps {
            allowed_apis: GLAPI;
            allowedApis: GLAPI;
            api: GLAPI;
            shared_context: GLContext | null;
            sharedContext: GLContext | null;
        }
    }

    abstract class GLContext extends DrawContext {
        static $gtype: GObject.GType<GLContext>;

        // Properties
        get allowed_apis(): GLAPI;
        set allowed_apis(val: GLAPI);

        get allowedApis(): GLAPI;
        set allowedApis(val: GLAPI);

        get api(): GLAPI;

        get shared_context(): GLContext | null;

        get sharedContext(): GLContext | null;

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
        get_allowed_apis(): GLAPI;

        get_api(): GLAPI;

        get_debug_enabled(): boolean;

        get_display(): Display | null;

        get_forward_compatible(): boolean;

        get_required_version(): [number, number];

        get_shared_context(): GLContext | null;

        get_surface(): Surface | null;

        get_use_es(): boolean;

        get_version(): [number, number];

        is_legacy(): boolean;

        is_shared(other: GLContext): boolean;

        make_current(): void;

        realize(): boolean;

        set_allowed_apis(apis: GLAPI): void;

        set_debug_enabled(enabled: boolean): void;

        set_forward_compatible(compatible: boolean): void;

        set_required_version(major: number, minor: number): void;

        set_use_es(use_es: number): void;
    }


    namespace GLTexture {
        // Signal signatures
        interface SignalSignatures extends Texture.SignalSignatures, Paintable.SignalSignatures {
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Texture.ConstructorProps, Paintable.ConstructorProps, Gio.Icon.ConstructorProps, Gio.LoadableIcon.ConstructorProps {}
    }

    class GLTexture extends Texture implements Paintable, Gio.Icon, Gio.LoadableIcon {
        static $gtype: GObject.GType<GLTexture>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: GLTexture.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<GLTexture.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](context: GLContext, id: number, width: number, height: number, data: null): GLTexture;

        // Signals
        /** @signal */
        connect<K extends keyof GLTexture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GLTexture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof GLTexture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GLTexture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof GLTexture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<GLTexture.SignalSignatures[K]>): void;

        // Methods
        release(): void;

        compute_concrete_size(specified_width: number, specified_height: number, default_width: number, default_height: number): [number, number];

        get_current_image(): Paintable;

        get_flags(): PaintableFlags;

        get_intrinsic_aspect_ratio(): number;

        get_intrinsic_height(): number;

        get_intrinsic_width(): number;

        invalidate_contents(): void;

        invalidate_size(): void;

        snapshot(snapshot: Snapshot, width: number, height: number): void;

        vfunc_get_current_image(): Paintable;

        vfunc_get_flags(): PaintableFlags;

        vfunc_get_intrinsic_aspect_ratio(): number;

        vfunc_get_intrinsic_height(): number;

        vfunc_get_intrinsic_width(): number;

        vfunc_snapshot(snapshot: Snapshot, width: number, height: number): void;

        equal(icon2: Gio.Icon | null): boolean;

        hash(): number;

        serialize(): GLib.Variant | null;

        to_string(): string | null;

        vfunc_equal(icon2: Gio.Icon | null): boolean;

        vfunc_hash(): number;

        vfunc_serialize(): GLib.Variant | null;

        vfunc_to_tokens(): [boolean, string[], number];

        load(size: number, cancellable: Gio.Cancellable | null): [Gio.InputStream, string];

        load_async(size: number, cancellable: Gio.Cancellable | null): globalThis.Promise<[Gio.InputStream, string]>;

        load_async(size: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        load_async(size: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<[Gio.InputStream, string]> | void;

        load_finish(res: Gio.AsyncResult): [Gio.InputStream, string];

        vfunc_load(size: number, cancellable: Gio.Cancellable | null): [Gio.InputStream, string];

        vfunc_load_async(size: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_load_finish(res: Gio.AsyncResult): [Gio.InputStream, string];
    }


    namespace GLTextureBuilder {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::format": (pspec: GObject.ParamSpec) => void;
            "notify::has-mipmap": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::id": (pspec: GObject.ParamSpec) => void;
            "notify::sync": (pspec: GObject.ParamSpec) => void;
            "notify::update-region": (pspec: GObject.ParamSpec) => void;
            "notify::update-texture": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            color_state: ColorState;
            colorState: ColorState;
            context: GLContext | null;
            format: MemoryFormat;
            has_mipmap: boolean;
            hasMipmap: boolean;
            height: number;
            id: number;
            sync: never;
            update_region: cairo.Region | null;
            updateRegion: cairo.Region | null;
            update_texture: Texture | null;
            updateTexture: Texture | null;
            width: number;
        }
    }

    class GLTextureBuilder extends GObject.Object {
        static $gtype: GObject.GType<GLTextureBuilder>;

        // Properties
        get color_state(): ColorState;
        set color_state(val: ColorState);

        get colorState(): ColorState;
        set colorState(val: ColorState);

        get context(): GLContext | null;
        set context(val: GLContext | null);

        get format(): MemoryFormat;
        set format(val: MemoryFormat);

        get has_mipmap(): boolean;
        set has_mipmap(val: boolean);

        get hasMipmap(): boolean;
        set hasMipmap(val: boolean);

        get height(): number;
        set height(val: number);

        get id(): number;
        set id(val: number);

        get sync(): null;
        set sync(val: never);

        get update_region(): cairo.Region | null;
        set update_region(val: cairo.Region | null);

        get updateRegion(): cairo.Region | null;
        set updateRegion(val: cairo.Region | null);

        get update_texture(): Texture | null;
        set update_texture(val: Texture | null);

        get updateTexture(): Texture | null;
        set updateTexture(val: Texture | null);

        get width(): number;
        set width(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: GLTextureBuilder.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<GLTextureBuilder.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): GLTextureBuilder;

        // Signals
        /** @signal */
        connect<K extends keyof GLTextureBuilder.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GLTextureBuilder.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof GLTextureBuilder.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GLTextureBuilder.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof GLTextureBuilder.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<GLTextureBuilder.SignalSignatures[K]>): void;

        // Methods
        build(data: null): Texture;

        get_color_state(): ColorState;

        get_context(): GLContext | null;

        get_format(): MemoryFormat;

        get_has_mipmap(): boolean;

        get_height(): number;

        get_id(): number;

        get_sync(): null;

        get_update_region(): cairo.Region | null;

        get_update_texture(): Texture | null;

        get_width(): number;

        set_color_state(color_state: ColorState): void;

        set_context(context: GLContext | null): void;

        set_format(format: MemoryFormat): void;

        set_has_mipmap(has_mipmap: boolean): void;

        set_height(height: number): void;

        set_id(id: number): void;

        set_sync(sync: null): void;

        set_update_region(region: cairo.Region | null): void;

        set_update_texture(texture: Texture | null): void;

        set_width(width: number): void;
    }


    namespace GrabBrokenEvent {
        // Signal signatures
        interface SignalSignatures extends Event.SignalSignatures {}
    }

    class GrabBrokenEvent extends Event {
        static $gtype: GObject.GType<GrabBrokenEvent>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof GrabBrokenEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GrabBrokenEvent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof GrabBrokenEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GrabBrokenEvent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof GrabBrokenEvent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<GrabBrokenEvent.SignalSignatures[K]>): void;

        // Methods
        get_grab_surface(): Surface;

        get_implicit(): boolean;
    }


    namespace KeyEvent {
        // Signal signatures
        interface SignalSignatures extends Event.SignalSignatures {}
    }

    class KeyEvent extends Event {
        static $gtype: GObject.GType<KeyEvent>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof KeyEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, KeyEvent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof KeyEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, KeyEvent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof KeyEvent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<KeyEvent.SignalSignatures[K]>): void;

        // Methods
        get_consumed_modifiers(): ModifierType;

        get_keycode(): number;

        get_keyval(): number;

        get_layout(): number;

        get_level(): number;

        get_match(): [boolean, number, ModifierType];

        is_modifier(): boolean;

        matches(keyval: number, modifiers: ModifierType): KeyMatch;
    }


    namespace MemoryTexture {
        // Signal signatures
        interface SignalSignatures extends Texture.SignalSignatures, Paintable.SignalSignatures {
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Texture.ConstructorProps, Paintable.ConstructorProps, Gio.Icon.ConstructorProps, Gio.LoadableIcon.ConstructorProps {}
    }

    class MemoryTexture extends Texture implements Paintable, Gio.Icon, Gio.LoadableIcon {
        static $gtype: GObject.GType<MemoryTexture>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MemoryTexture.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MemoryTexture.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](width: number, height: number, format: MemoryFormat, bytes: GLib.Bytes | Uint8Array, stride: bigint | number): MemoryTexture;

        // Signals
        /** @signal */
        connect<K extends keyof MemoryTexture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MemoryTexture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MemoryTexture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MemoryTexture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MemoryTexture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MemoryTexture.SignalSignatures[K]>): void;

        compute_concrete_size(specified_width: number, specified_height: number, default_width: number, default_height: number): [number, number];

        get_current_image(): Paintable;

        get_flags(): PaintableFlags;

        get_intrinsic_aspect_ratio(): number;

        get_intrinsic_height(): number;

        get_intrinsic_width(): number;

        invalidate_contents(): void;

        invalidate_size(): void;

        snapshot(snapshot: Snapshot, width: number, height: number): void;

        vfunc_get_current_image(): Paintable;

        vfunc_get_flags(): PaintableFlags;

        vfunc_get_intrinsic_aspect_ratio(): number;

        vfunc_get_intrinsic_height(): number;

        vfunc_get_intrinsic_width(): number;

        vfunc_snapshot(snapshot: Snapshot, width: number, height: number): void;

        equal(icon2: Gio.Icon | null): boolean;

        hash(): number;

        serialize(): GLib.Variant | null;

        to_string(): string | null;

        vfunc_equal(icon2: Gio.Icon | null): boolean;

        vfunc_hash(): number;

        vfunc_serialize(): GLib.Variant | null;

        vfunc_to_tokens(): [boolean, string[], number];

        load(size: number, cancellable: Gio.Cancellable | null): [Gio.InputStream, string];

        load_async(size: number, cancellable: Gio.Cancellable | null): globalThis.Promise<[Gio.InputStream, string]>;

        load_async(size: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        load_async(size: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<[Gio.InputStream, string]> | void;

        load_finish(res: Gio.AsyncResult): [Gio.InputStream, string];

        vfunc_load(size: number, cancellable: Gio.Cancellable | null): [Gio.InputStream, string];

        vfunc_load_async(size: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_load_finish(res: Gio.AsyncResult): [Gio.InputStream, string];
    }


    namespace MemoryTextureBuilder {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::bytes": (pspec: GObject.ParamSpec) => void;
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::format": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::stride": (pspec: GObject.ParamSpec) => void;
            "notify::update-region": (pspec: GObject.ParamSpec) => void;
            "notify::update-texture": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            bytes: GLib.Bytes | Uint8Array | null;
            color_state: ColorState;
            colorState: ColorState;
            format: MemoryFormat;
            height: number;
            stride: bigint | number;
            update_region: cairo.Region | null;
            updateRegion: cairo.Region | null;
            update_texture: Texture | null;
            updateTexture: Texture | null;
            width: number;
        }
    }

    class MemoryTextureBuilder extends GObject.Object {
        static $gtype: GObject.GType<MemoryTextureBuilder>;

        // Properties
        get bytes(): GLib.Bytes | null;
        set bytes(val: GLib.Bytes | Uint8Array | null);

        get color_state(): ColorState;
        set color_state(val: ColorState);

        get colorState(): ColorState;
        set colorState(val: ColorState);

        get format(): MemoryFormat;
        set format(val: MemoryFormat);

        get height(): number;
        set height(val: number);

        get stride(): number;
        set stride(val: bigint | number);

        get update_region(): cairo.Region | null;
        set update_region(val: cairo.Region | null);

        get updateRegion(): cairo.Region | null;
        set updateRegion(val: cairo.Region | null);

        get update_texture(): Texture | null;
        set update_texture(val: Texture | null);

        get updateTexture(): Texture | null;
        set updateTexture(val: Texture | null);

        get width(): number;
        set width(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MemoryTextureBuilder.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MemoryTextureBuilder.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): MemoryTextureBuilder;

        // Signals
        /** @signal */
        connect<K extends keyof MemoryTextureBuilder.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MemoryTextureBuilder.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MemoryTextureBuilder.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MemoryTextureBuilder.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MemoryTextureBuilder.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MemoryTextureBuilder.SignalSignatures[K]>): void;

        // Methods
        build(): Texture;

        get_bytes(): GLib.Bytes | null;

        get_color_state(): ColorState;

        get_format(): MemoryFormat;

        get_height(): number;

        get_offset(plane: number): number;

        get_stride(): number;

        get_stride_for_plane(plane: number): number;

        get_update_region(): cairo.Region | null;

        get_update_texture(): Texture | null;

        get_width(): number;

        set_bytes(bytes: GLib.Bytes | Uint8Array | null): void;

        set_color_state(color_state: ColorState): void;

        set_format(format: MemoryFormat): void;

        set_height(height: number): void;

        set_offset(plane: number, offset: bigint | number): void;

        set_stride(stride: bigint | number): void;

        set_stride_for_plane(plane: number, stride: bigint | number): void;

        set_update_region(region: cairo.Region | null): void;

        set_update_texture(texture: Texture | null): void;

        set_width(width: number): void;
    }


    namespace Monitor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            invalidate: () => void;
            "notify::connector": (pspec: GObject.ParamSpec) => void;
            "notify::description": (pspec: GObject.ParamSpec) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::geometry": (pspec: GObject.ParamSpec) => void;
            "notify::height-mm": (pspec: GObject.ParamSpec) => void;
            "notify::manufacturer": (pspec: GObject.ParamSpec) => void;
            "notify::model": (pspec: GObject.ParamSpec) => void;
            "notify::refresh-rate": (pspec: GObject.ParamSpec) => void;
            "notify::scale": (pspec: GObject.ParamSpec) => void;
            "notify::scale-factor": (pspec: GObject.ParamSpec) => void;
            "notify::subpixel-layout": (pspec: GObject.ParamSpec) => void;
            "notify::valid": (pspec: GObject.ParamSpec) => void;
            "notify::width-mm": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            connector: string | null;
            description: string | null;
            display: Display;
            geometry: Rectangle;
            height_mm: number;
            heightMm: number;
            manufacturer: string | null;
            model: string | null;
            refresh_rate: number;
            refreshRate: number;
            scale: number;
            scale_factor: number;
            scaleFactor: number;
            subpixel_layout: SubpixelLayout;
            subpixelLayout: SubpixelLayout;
            valid: boolean;
            width_mm: number;
            widthMm: number;
        }
    }

    class Monitor extends GObject.Object {
        static $gtype: GObject.GType<Monitor>;

        // Properties
        get connector(): string | null;

        get description(): string | null;

        get display(): Display;

        get geometry(): Rectangle;

        get height_mm(): number;

        get heightMm(): number;

        get manufacturer(): string | null;

        get model(): string | null;

        get refresh_rate(): number;

        get refreshRate(): number;

        get scale(): number;

        get scale_factor(): number;

        get scaleFactor(): number;

        get subpixel_layout(): SubpixelLayout;

        get subpixelLayout(): SubpixelLayout;

        get valid(): boolean;

        get width_mm(): number;

        get widthMm(): number;

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
        get_connector(): string | null;

        get_description(): string | null;

        get_display(): Display;

        get_geometry(): Rectangle;

        get_height_mm(): number;

        get_manufacturer(): string | null;

        get_model(): string | null;

        get_refresh_rate(): number;

        get_scale(): number;

        get_scale_factor(): number;

        get_subpixel_layout(): SubpixelLayout;

        get_width_mm(): number;

        is_valid(): boolean;
    }


    namespace MotionEvent {
        // Signal signatures
        interface SignalSignatures extends Event.SignalSignatures {}
    }

    class MotionEvent extends Event {
        static $gtype: GObject.GType<MotionEvent>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof MotionEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MotionEvent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MotionEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MotionEvent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MotionEvent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MotionEvent.SignalSignatures[K]>): void;
    }


    namespace PadEvent {
        // Signal signatures
        interface SignalSignatures extends Event.SignalSignatures {}
    }

    class PadEvent extends Event {
        static $gtype: GObject.GType<PadEvent>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof PadEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PadEvent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PadEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PadEvent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PadEvent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PadEvent.SignalSignatures[K]>): void;

        // Methods
        get_axis_value(): [number, number];

        get_button(): number;

        get_group_mode(): [number, number];
    }


    namespace ProximityEvent {
        // Signal signatures
        interface SignalSignatures extends Event.SignalSignatures {}
    }

    class ProximityEvent extends Event {
        static $gtype: GObject.GType<ProximityEvent>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ProximityEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ProximityEvent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ProximityEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ProximityEvent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ProximityEvent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ProximityEvent.SignalSignatures[K]>): void;
    }


    namespace ScrollEvent {
        // Signal signatures
        interface SignalSignatures extends Event.SignalSignatures {}
    }

    class ScrollEvent extends Event {
        static $gtype: GObject.GType<ScrollEvent>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ScrollEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ScrollEvent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ScrollEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ScrollEvent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ScrollEvent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ScrollEvent.SignalSignatures[K]>): void;

        // Methods
        get_deltas(): [number, number];

        get_direction(): ScrollDirection;

        get_relative_direction(): ScrollRelativeDirection;

        get_unit(): ScrollUnit;

        is_stop(): boolean;
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

        get_devices(capabilities: SeatCapabilities): Device[];

        get_display(): Display;

        get_keyboard(): Device | null;

        get_pointer(): Device | null;

        get_tools(): DeviceTool[];
    }


    namespace Snapshot {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class Snapshot extends GObject.Object {
        static $gtype: GObject.GType<Snapshot>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Snapshot.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Snapshot.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Snapshot.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Snapshot.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Snapshot.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Snapshot.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Snapshot.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Snapshot.SignalSignatures[K]>): void;
    }


    namespace Surface {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "enter-monitor": (monitor: Monitor) => void;
            /** @signal */
            event: (event: Event) => boolean | void;
            /** @signal */
            layout: (width: number, height: number) => void;
            /** @signal */
            "leave-monitor": (monitor: Monitor) => void;
            /** @signal */
            render: (region: cairo.Region) => boolean | void;
            "notify::cursor": (pspec: GObject.ParamSpec) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::frame-clock": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::mapped": (pspec: GObject.ParamSpec) => void;
            "notify::scale": (pspec: GObject.ParamSpec) => void;
            "notify::scale-factor": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            cursor: Cursor | null;
            display: Display;
            frame_clock: FrameClock;
            frameClock: FrameClock;
            height: number;
            mapped: boolean;
            scale: number;
            scale_factor: number;
            scaleFactor: number;
            width: number;
        }
    }

    abstract class Surface extends GObject.Object {
        static $gtype: GObject.GType<Surface>;

        // Properties
        get cursor(): Cursor | null;
        set cursor(val: Cursor | null);

        get display(): Display;

        get frame_clock(): FrameClock;

        get frameClock(): FrameClock;

        get height(): number;

        get mapped(): boolean;

        get scale(): number;

        get scale_factor(): number;

        get scaleFactor(): number;

        get width(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Surface.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Surface.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_popup(parent: Surface, autohide: boolean): Surface;

        static new_toplevel(display: Display): Surface;

        // Signals
        /** @signal */
        connect<K extends keyof Surface.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Surface.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Surface.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Surface.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Surface.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Surface.SignalSignatures[K]>): void;

        // Methods
        beep(): void;

        create_cairo_context(): CairoContext;

        create_gl_context(): GLContext;

        create_similar_surface(content: cairo.Content, width: number, height: number): cairo.Surface;

        create_vulkan_context(): VulkanContext;

        destroy(): void;

        get_cursor(): Cursor | null;

        get_device_cursor(device: Device): Cursor | null;

        get_device_position(device: Device): [boolean, number, number, ModifierType | null];

        get_display(): Display;

        get_frame_clock(): FrameClock;

        get_height(): number;

        get_mapped(): boolean;

        get_scale(): number;

        get_scale_factor(): number;

        get_width(): number;

        hide(): void;

        is_destroyed(): boolean;

        queue_render(): void;

        request_layout(): void;

        set_cursor(cursor: Cursor | null): void;

        set_device_cursor(device: Device, cursor: Cursor): void;

        set_input_region(region: cairo.Region | null): void;

        set_opaque_region(region: cairo.Region | null): void;

        translate_coordinates(to: Surface, x: number, y: number): [boolean, number, number];
    }


    namespace Texture {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, Paintable.SignalSignatures {
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Paintable.ConstructorProps, Gio.Icon.ConstructorProps, Gio.LoadableIcon.ConstructorProps {
            color_state: ColorState;
            colorState: ColorState;
            height: number;
            width: number;
        }
    }

    abstract class Texture extends GObject.Object implements Paintable, Gio.Icon, Gio.LoadableIcon {
        static $gtype: GObject.GType<Texture>;

        // Properties
        get color_state(): ColorState;

        get colorState(): ColorState;

        get height(): number;

        get width(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Texture.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Texture.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_for_pixbuf(pixbuf: GdkPixbuf.Pixbuf): Texture;

        static new_from_bytes(bytes: GLib.Bytes | Uint8Array): Texture;

        static new_from_file(file: Gio.File): Texture;

        static new_from_filename(path: string): Texture;

        static new_from_resource(resource_path: string): Texture;

        // Signals
        /** @signal */
        connect<K extends keyof Texture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Texture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Texture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Texture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Texture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Texture.SignalSignatures[K]>): void;

        // Methods
        download(data: Uint8Array | string, stride: bigint | number): void;

        get_color_state(): ColorState;

        get_format(): MemoryFormat;

        get_height(): number;

        get_width(): number;

        save_to_png(filename: string): boolean;

        save_to_png_bytes(): GLib.Bytes;

        save_to_tiff(filename: string): boolean;

        save_to_tiff_bytes(): GLib.Bytes;

        compute_concrete_size(specified_width: number, specified_height: number, default_width: number, default_height: number): [number, number];

        get_current_image(): Paintable;

        get_flags(): PaintableFlags;

        get_intrinsic_aspect_ratio(): number;

        get_intrinsic_height(): number;

        get_intrinsic_width(): number;

        invalidate_contents(): void;

        invalidate_size(): void;

        snapshot(snapshot: Snapshot, width: number, height: number): void;

        vfunc_get_current_image(): Paintable;

        vfunc_get_flags(): PaintableFlags;

        vfunc_get_intrinsic_aspect_ratio(): number;

        vfunc_get_intrinsic_height(): number;

        vfunc_get_intrinsic_width(): number;

        vfunc_snapshot(snapshot: Snapshot, width: number, height: number): void;

        equal(icon2: Gio.Icon | null): boolean;

        hash(): number;

        serialize(): GLib.Variant | null;

        to_string(): string | null;

        vfunc_equal(icon2: Gio.Icon | null): boolean;

        vfunc_hash(): number;

        vfunc_serialize(): GLib.Variant | null;

        vfunc_to_tokens(): [boolean, string[], number];

        load(size: number, cancellable: Gio.Cancellable | null): [Gio.InputStream, string];

        load_async(size: number, cancellable: Gio.Cancellable | null): globalThis.Promise<[Gio.InputStream, string]>;

        load_async(size: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        load_async(size: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<[Gio.InputStream, string]> | void;

        load_finish(res: Gio.AsyncResult): [Gio.InputStream, string];

        vfunc_load(size: number, cancellable: Gio.Cancellable | null): [Gio.InputStream, string];

        vfunc_load_async(size: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_load_finish(res: Gio.AsyncResult): [Gio.InputStream, string];
    }


    namespace TouchEvent {
        // Signal signatures
        interface SignalSignatures extends Event.SignalSignatures {}
    }

    class TouchEvent extends Event {
        static $gtype: GObject.GType<TouchEvent>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof TouchEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TouchEvent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TouchEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TouchEvent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TouchEvent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TouchEvent.SignalSignatures[K]>): void;

        // Methods
        get_emulating_pointer(): boolean;
    }


    namespace TouchpadEvent {
        // Signal signatures
        interface SignalSignatures extends Event.SignalSignatures {}
    }

    class TouchpadEvent extends Event {
        static $gtype: GObject.GType<TouchpadEvent>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof TouchpadEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TouchpadEvent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TouchpadEvent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TouchpadEvent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TouchpadEvent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TouchpadEvent.SignalSignatures[K]>): void;

        // Methods
        get_deltas(): [number, number];

        get_gesture_phase(): TouchpadGesturePhase;

        get_n_fingers(): number;

        get_pinch_angle_delta(): number;

        get_pinch_scale(): number;
    }


    namespace VulkanContext {
        // Signal signatures
        interface SignalSignatures extends DrawContext.SignalSignatures {
            /** @signal */
            "images-updated": () => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::surface": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends DrawContext.ConstructorProps {}
    }

    abstract class VulkanContext extends DrawContext {
        static $gtype: GObject.GType<VulkanContext>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: VulkanContext.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<VulkanContext.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof VulkanContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VulkanContext.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof VulkanContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VulkanContext.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof VulkanContext.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<VulkanContext.SignalSignatures[K]>): void;
    }


    type AppLaunchContextClass = typeof AppLaunchContext;

    type CairoContextClass = typeof CairoContext;

    type CicpParamsClass = typeof CicpParams;

    type ClipboardClass = typeof Clipboard;

    abstract class ColorState {
        static $gtype: GObject.GType<ColorState>;

        // Static methods
        static get_oklab(): ColorState;

        static get_oklch(): ColorState;

        static get_rec2100_linear(): ColorState;

        static get_rec2100_pq(): ColorState;

        static get_srgb(): ColorState;

        static get_srgb_linear(): ColorState;

        // Methods
        create_cicp_params(): CicpParams | null;

        equal(other: ColorState): boolean;

        equivalent(other: ColorState): boolean;

        ref(): ColorState;

        unref(): void;
    }


    type ContentDeserializerClass = typeof ContentDeserializer;

    class ContentFormats {
        static $gtype: GObject.GType<ContentFormats>;

        // Constructors
        constructor(mime_types: string[] | null);

        static ["new"](mime_types: string[] | null): ContentFormats;

        static new_for_gtype(type: GObject.GType): ContentFormats;

        // Static methods
        static parse(string: string): ContentFormats | null;

        // Methods
        contain_gtype(type: GObject.GType): boolean;

        contain_mime_type(mime_type: string): boolean;

        get_gtypes(): GObject.GType[] | null;

        get_mime_types(): string[] | null;

        is_empty(): boolean;

        match(second: ContentFormats): boolean;

        match_gtype(second: ContentFormats): GObject.GType;

        match_mime_type(second: ContentFormats): string | null;

        print(string: GLib.String): void;

        ref(): ContentFormats;

        to_string(): string;

        union(second: ContentFormats): ContentFormats;

        union_deserialize_gtypes(): ContentFormats;

        union_deserialize_mime_types(): ContentFormats;

        union_serialize_gtypes(): ContentFormats;

        union_serialize_mime_types(): ContentFormats;

        unref(): void;
    }


    class ContentFormatsBuilder {
        static $gtype: GObject.GType<ContentFormatsBuilder>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): ContentFormatsBuilder;

        // Methods
        add_formats(formats: ContentFormats): void;

        add_gtype(type: GObject.GType): void;

        add_mime_type(mime_type: string): void;

        ref(): ContentFormatsBuilder;

        to_formats(): ContentFormats;

        unref(): void;
    }


    type ContentProviderClass = typeof ContentProvider;

    type ContentSerializerClass = typeof ContentSerializer;

    type CursorClass = typeof Cursor;

    type DeviceClass = typeof Device;

    abstract class DevicePadClass {
        static $gtype: GObject.GType<DevicePadClass>;
    }


    type DevicePadInterface = typeof DevicePad;

    type DeviceToolClass = typeof DeviceTool;

    type DisplayClass = typeof Display;

    type DisplayManagerClass = typeof DisplayManager;

    abstract class DmabufFormats {
        static $gtype: GObject.GType<DmabufFormats>;

        // Methods
        contains(fourcc: number, modifier: bigint | number): boolean;

        equal(formats2: DmabufFormats | null): boolean;

        get_format(idx: bigint | number): [number, number];

        get_n_formats(): number;

        ref(): DmabufFormats;

        unref(): void;
    }


    type DmabufTextureBuilderClass = typeof DmabufTextureBuilder;

    type DmabufTextureClass = typeof DmabufTexture;

    type DragClass = typeof Drag;

    type DragSurfaceInterface = typeof DragSurface;

    abstract class DragSurfaceSize {
        static $gtype: GObject.GType<DragSurfaceSize>;

        // Methods
        set_size(width: number, height: number): void;
    }


    type DrawContextClass = typeof DrawContext;

    type DropClass = typeof Drop;

    abstract class EventSequence {
        static $gtype: GObject.GType<EventSequence>;
    }


    class FileList {
        static $gtype: GObject.GType<FileList>;

        // Constructors
        constructor(files: Gio.File[]);

        static new_from_array(files: Gio.File[]): FileList;

        static new_from_list(files: Gio.File[]): FileList;

        // Methods
        get_files(): Gio.File[];
    }


    type FrameClockClass = typeof FrameClock;

    abstract class FrameTimings {
        static $gtype: GObject.GType<FrameTimings>;

        // Methods
        get_complete(): boolean;

        get_frame_counter(): number;

        get_frame_time(): number;

        get_predicted_presentation_time(): number;

        get_presentation_time(): number;

        get_refresh_interval(): number;

        get_result(): FrameResult;

        ref(): FrameTimings;

        unref(): void;
    }


    type GLContextClass = typeof GLContext;

    type GLTextureBuilderClass = typeof GLTextureBuilder;

    type GLTextureClass = typeof GLTexture;

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


    type MemoryTextureBuilderClass = typeof MemoryTextureBuilder;

    type MemoryTextureClass = typeof MemoryTexture;

    type MonitorClass = typeof Monitor;

    type PaintableInterface = typeof Paintable;

    type PopupInterface = typeof Popup;

    class PopupLayout {
        static $gtype: GObject.GType<PopupLayout>;

        // Constructors
        constructor(anchor_rect: Rectangle, rect_anchor: Gravity, surface_anchor: Gravity);

        static ["new"](anchor_rect: Rectangle, rect_anchor: Gravity, surface_anchor: Gravity): PopupLayout;

        // Methods
        copy(): PopupLayout;

        equal(other: PopupLayout): boolean;

        get_anchor_hints(): AnchorHints;

        get_anchor_rect(): Rectangle;

        get_offset(): [number, number];

        get_rect_anchor(): Gravity;

        get_shadow_width(): [number, number, number, number];

        get_surface_anchor(): Gravity;

        ref(): PopupLayout;

        set_anchor_hints(anchor_hints: AnchorHints): void;

        set_anchor_rect(anchor_rect: Rectangle): void;

        set_offset(dx: number, dy: number): void;

        set_rect_anchor(anchor: Gravity): void;

        set_shadow_width(left: number, right: number, top: number, bottom: number): void;

        set_surface_anchor(anchor: Gravity): void;

        unref(): void;
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

        is_clear(): boolean;

        is_opaque(): boolean;

        parse(spec: string): boolean;

        print(string: GLib.String): GLib.String;

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
        contains_point(x: number, y: number): boolean;

        equal(rect2: Rectangle): boolean;

        intersect(src2: Rectangle): [boolean, Rectangle | null];

        union(src2: Rectangle): Rectangle;
    }


    type SeatClass = typeof Seat;

    type SnapshotClass = typeof Snapshot;

    type SurfaceClass = typeof Surface;

    type TextureClass = typeof Texture;

    class TextureDownloader {
        static $gtype: GObject.GType<TextureDownloader>;

        // Constructors
        constructor(texture: Texture);

        static ["new"](texture: Texture): TextureDownloader;

        // Methods
        copy(): TextureDownloader;

        download_bytes(): [GLib.Bytes, number];

        download_bytes_with_planes(): [GLib.Bytes, number[], number[]];

        download_into(data: Uint8Array | string, stride: bigint | number): void;

        free(): void;

        get_color_state(): ColorState;

        get_format(): MemoryFormat;

        get_texture(): Texture;

        set_color_state(color_state: ColorState): void;

        set_format(format: MemoryFormat): void;

        set_texture(texture: Texture): void;
    }


    class TimeCoord {
        static $gtype: GObject.GType<TimeCoord>;

        // Fields
        time: number;

        flags: AxisFlags;

        axes: number[];
    }


    type ToplevelInterface = typeof Toplevel;

    class ToplevelLayout {
        static $gtype: GObject.GType<ToplevelLayout>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): ToplevelLayout;

        // Methods
        copy(): ToplevelLayout;

        equal(other: ToplevelLayout): boolean;

        get_fullscreen(): [boolean, boolean];

        get_fullscreen_monitor(): Monitor | null;

        get_maximized(): [boolean, boolean];

        get_resizable(): boolean;

        ref(): ToplevelLayout;

        set_fullscreen(fullscreen: boolean, monitor: Monitor | null): void;

        set_maximized(maximized: boolean): void;

        set_resizable(resizable: boolean): void;

        unref(): void;
    }


    abstract class ToplevelSize {
        static $gtype: GObject.GType<ToplevelSize>;

        // Methods
        get_bounds(): [number, number];

        set_min_size(min_width: number, min_height: number): void;

        set_shadow_width(left: number, right: number, top: number, bottom: number): void;

        set_size(width: number, height: number): void;
    }


    type VulkanContextClass = typeof VulkanContext;

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

    namespace DragSurface {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "compute-size": (size: DragSurfaceSize) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Surface.ConstructorProps {}
    }

    export interface DragSurfaceNamespace {
        $gtype: GObject.GType<DragSurface>;
        prototype: DragSurface;
    }
    interface DragSurface extends Surface {

        // Methods
        present(width: number, height: number): boolean;
    }


    export const DragSurface: DragSurfaceNamespace & {
        new (): DragSurface; // This allows `obj instanceof DragSurface`
    };

    namespace Paintable {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "invalidate-contents": () => void;
            /** @signal */
            "invalidate-size": () => void;
        }
        /**
         * Interface for implementing Paintable.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_current_image(): Paintable;

            vfunc_get_flags(): PaintableFlags;

            vfunc_get_intrinsic_aspect_ratio(): number;

            vfunc_get_intrinsic_height(): number;

            vfunc_get_intrinsic_width(): number;

            vfunc_snapshot(snapshot: Snapshot, width: number, height: number): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface PaintableNamespace {
        $gtype: GObject.GType<Paintable>;
        prototype: Paintable;
        new_empty(intrinsic_width: number, intrinsic_height: number): Paintable;
    }
    interface Paintable extends GObject.Object, Paintable.Interface {

        // Methods
        compute_concrete_size(specified_width: number, specified_height: number, default_width: number, default_height: number): [number, number];

        get_current_image(): Paintable;

        get_flags(): PaintableFlags;

        get_intrinsic_aspect_ratio(): number;

        get_intrinsic_height(): number;

        get_intrinsic_width(): number;

        invalidate_contents(): void;

        invalidate_size(): void;

        snapshot(snapshot: Snapshot, width: number, height: number): void;
    }


    export const Paintable: PaintableNamespace & {
        new (): Paintable; // This allows `obj instanceof Paintable`
    };

    namespace Popup {

        // Constructor properties interface
        interface ConstructorProps extends Surface.ConstructorProps {
            autohide: boolean;
            parent: Surface | null;
        }
    }

    export interface PopupNamespace {
        $gtype: GObject.GType<Popup>;
        prototype: Popup;
    }
    interface Popup extends Surface {

        // Properties
        get autohide(): boolean;

        get parent(): Surface | null;

        // Methods
        get_autohide(): boolean;

        get_parent(): Surface | null;

        get_position_x(): number;

        get_position_y(): number;

        get_rect_anchor(): Gravity;

        get_surface_anchor(): Gravity;

        present(width: number, height: number, layout: PopupLayout): boolean;
    }


    export const Popup: PopupNamespace & {
        new (): Popup; // This allows `obj instanceof Popup`
    };

    namespace Toplevel {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            "compute-size": (size: ToplevelSize) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Surface.ConstructorProps {
            capabilities: ToplevelCapabilities;
            decorated: boolean;
            deletable: boolean;
            fullscreen_mode: FullscreenMode;
            fullscreenMode: FullscreenMode;
            gravity: Gravity;
            icon_list: never;
            iconList: never;
            modal: boolean;
            shortcuts_inhibited: boolean;
            shortcutsInhibited: boolean;
            startup_id: string;
            startupId: string;
            state: ToplevelState;
            title: string;
            transient_for: Surface;
            transientFor: Surface;
        }
    }

    export interface ToplevelNamespace {
        $gtype: GObject.GType<Toplevel>;
        prototype: Toplevel;
    }
    interface Toplevel extends Surface {

        // Properties
        get capabilities(): ToplevelCapabilities;

        get decorated(): boolean;
        set decorated(val: boolean);

        get deletable(): boolean;
        set deletable(val: boolean);

        get fullscreen_mode(): FullscreenMode;
        set fullscreen_mode(val: FullscreenMode);

        get fullscreenMode(): FullscreenMode;
        set fullscreenMode(val: FullscreenMode);

        get gravity(): Gravity;
        set gravity(val: Gravity);

        get icon_list(): null;
        set icon_list(val: never);

        get iconList(): null;
        set iconList(val: never);

        get modal(): boolean;
        set modal(val: boolean);

        get shortcuts_inhibited(): boolean;

        get shortcutsInhibited(): boolean;

        get startup_id(): string;
        set startup_id(val: string);

        get startupId(): string;
        set startupId(val: string);

        get state(): ToplevelState;

        get title(): string;
        set title(val: string);

        get transient_for(): Surface;
        set transient_for(val: Surface);

        get transientFor(): Surface;
        set transientFor(val: Surface);

        // Methods
        begin_move(device: Device, button: number, x: number, y: number, timestamp: number): void;

        begin_resize(edge: SurfaceEdge, device: Device | null, button: number, x: number, y: number, timestamp: number): void;

        focus(timestamp: number): void;

        get_capabilities(): ToplevelCapabilities;

        get_gravity(): Gravity;

        get_state(): ToplevelState;

        inhibit_system_shortcuts(event: Event | null): void;

        lower(): boolean;

        minimize(): boolean;

        present(layout: ToplevelLayout): void;

        restore_system_shortcuts(): void;

        set_decorated(decorated: boolean): void;

        set_deletable(deletable: boolean): void;

        set_gravity(gravity: Gravity): void;

        set_icon_list(surfaces: Texture[]): void;

        set_modal(modal: boolean): void;

        set_startup_id(startup_id: string): void;

        set_title(title: string): void;

        set_transient_for(parent: Surface): void;

        show_window_menu(event: Event): boolean;

        supports_edge_constraints(): boolean;

        titlebar_gesture(gesture: TitlebarGesture): boolean;
    }


    export const Toplevel: ToplevelNamespace & {
        new (): Toplevel; // This allows `obj instanceof Toplevel`
    };

    const __name__: string;

    const __version__: string;
}

export default Gdk;

}

declare module 'gi://Gdk' {
    import Gdk40 from 'gi://Gdk?version=4.0';
    export default Gdk40;
}
// END
