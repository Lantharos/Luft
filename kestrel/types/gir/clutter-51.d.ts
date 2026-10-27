/// <reference path="./pango-1.0.d.ts" />
/// <reference path="./cairo-1.0.d.ts" />
/// <reference path="./cairo.d.ts" />
/// <reference path="./gobject-2.0.d.ts" />
/// <reference path="./glib-2.0.d.ts" />
/// <reference path="./harfbuzz-0.0.d.ts" />
/// <reference path="./freetype2-2.0.d.ts" />
/// <reference path="./gio-2.0.d.ts" />
/// <reference path="./gmodule-2.0.d.ts" />
/// <reference path="./mtk-51.d.ts" />
/// <reference path="./graphene-1.0.d.ts" />
/// <reference path="./gl-1.0.d.ts" />
/// <reference path="./cogl-51.d.ts" />
/// <reference path="./atk-1.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://Clutter?version=51' {

// Module dependencies
import type Pango from 'gi://Pango?version=1.0';
import type cairo from 'cairo';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type HarfBuzz from 'gi://HarfBuzz?version=0.0';
import type freetype2 from 'gi://freetype2?version=2.0';
import type Gio from 'gi://Gio?version=2.0';
import type GModule from 'gi://GModule?version=2.0';
import type Mtk from 'gi://Mtk?version=51';
import type Graphene from 'gi://Graphene?version=1.0';
import type GL from 'gi://GL?version=1.0';
import type Cogl from 'gi://Cogl?version=51';
import type Atk from 'gi://Atk?version=1.0';

export namespace Clutter {

    /**
     * Clutter-51
     */


    export namespace ActorAlign {
        export const $gtype: GObject.GType<ActorAlign>;
    }

    enum ActorAlign {
        FILL = 0,
        START = 1,
        CENTER = 2,
        END = 3,
    }


    export namespace AlignAxis {
        export const $gtype: GObject.GType<AlignAxis>;
    }

    enum AlignAxis {
        X_AXIS = 0,
        Y_AXIS = 1,
        BOTH = 2,
    }


    export namespace AnimationMode {
        export const $gtype: GObject.GType<AnimationMode>;
    }

    enum AnimationMode {
        CUSTOM_MODE = 0,
        LINEAR = 1,
        EASE_IN_QUAD = 2,
        EASE_OUT_QUAD = 3,
        EASE_IN_OUT_QUAD = 4,
        EASE_IN_CUBIC = 5,
        EASE_OUT_CUBIC = 6,
        EASE_IN_OUT_CUBIC = 7,
        EASE_IN_QUART = 8,
        EASE_OUT_QUART = 9,
        EASE_IN_OUT_QUART = 10,
        EASE_IN_QUINT = 11,
        EASE_OUT_QUINT = 12,
        EASE_IN_OUT_QUINT = 13,
        EASE_IN_SINE = 14,
        EASE_OUT_SINE = 15,
        EASE_IN_OUT_SINE = 16,
        EASE_IN_EXPO = 17,
        EASE_OUT_EXPO = 18,
        EASE_IN_OUT_EXPO = 19,
        EASE_IN_CIRC = 20,
        EASE_OUT_CIRC = 21,
        EASE_IN_OUT_CIRC = 22,
        EASE_IN_ELASTIC = 23,
        EASE_OUT_ELASTIC = 24,
        EASE_IN_OUT_ELASTIC = 25,
        EASE_IN_BACK = 26,
        EASE_OUT_BACK = 27,
        EASE_IN_OUT_BACK = 28,
        EASE_IN_BOUNCE = 29,
        EASE_OUT_BOUNCE = 30,
        EASE_IN_OUT_BOUNCE = 31,
        STEPS = 32,
        STEP_START = 33,
        STEP_END = 34,
        CUBIC_BEZIER = 35,
        EASE = 36,
        EASE_IN = 37,
        EASE_OUT = 38,
        EASE_IN_OUT = 39,
        ANIMATION_LAST = 40,
    }


    export namespace BindCoordinate {
        export const $gtype: GObject.GType<BindCoordinate>;
    }

    enum BindCoordinate {
        X = 0,
        Y = 1,
        WIDTH = 2,
        HEIGHT = 3,
        POSITION = 4,
        SIZE = 5,
        ALL = 6,
    }


    export namespace ButtonState {
        export const $gtype: GObject.GType<ButtonState>;
    }

    enum ButtonState {
        RELEASED = 0,
        PRESSED = 1,
    }


    export namespace CicpPrimaries {
        export const $gtype: GObject.GType<CicpPrimaries>;
    }

    enum CicpPrimaries {
        SRGB = 1,
        PAL = 5,
        NTSC = 6,
        NTSC_2 = 7,
        BT2020 = 9,
        P3 = 12,
    }


    export namespace CicpTransfer {
        export const $gtype: GObject.GType<CicpTransfer>;
    }

    enum CicpTransfer {
        BT709 = 1,
        GAMMA22 = 4,
        GAMMA28 = 5,
        BT601 = 6,
        LINEAR = 8,
        SRGB = 13,
        BT2020 = 14,
        BT2020_2 = 15,
        PQ = 16,
        HLG = 18,
    }


    export namespace ColorimetryType {
        export const $gtype: GObject.GType<ColorimetryType>;
    }

    enum ColorimetryType {
        COLORSPACE = 0,
        PRIMARIES = 1,
    }


    export namespace Colorspace {
        export const $gtype: GObject.GType<Colorspace>;
    }

    enum Colorspace {
        SRGB = 0,
        BT2020 = 1,
        NTSC = 2,
        PAL = 3,
        P3 = 4,
    }


    export namespace ContentGravity {
        export const $gtype: GObject.GType<ContentGravity>;
    }

    enum ContentGravity {
        TOP_LEFT = 0,
        TOP = 1,
        TOP_RIGHT = 2,
        LEFT = 3,
        CENTER = 4,
        RIGHT = 5,
        BOTTOM_LEFT = 6,
        BOTTOM = 7,
        BOTTOM_RIGHT = 8,
        RESIZE_FILL = 9,
        RESIZE_ASPECT = 10,
    }


    export namespace CursorType {
        export const $gtype: GObject.GType<CursorType>;
    }

    enum CursorType {
        INHERIT = 0,
        NONE = 1,
        DEFAULT = 2,
        CONTEXT_MENU = 3,
        HELP = 4,
        POINTER = 5,
        PROGRESS = 6,
        WAIT = 7,
        CELL = 8,
        CROSSHAIR = 9,
        TEXT = 10,
        VERTICAL_TEXT = 11,
        ALIAS = 12,
        COPY = 13,
        MOVE = 14,
        NO_DROP = 15,
        NOT_ALLOWED = 16,
        GRAB = 17,
        GRABBING = 18,
        E_RESIZE = 19,
        N_RESIZE = 20,
        NE_RESIZE = 21,
        NW_RESIZE = 22,
        S_RESIZE = 23,
        SE_RESIZE = 24,
        SW_RESIZE = 25,
        W_RESIZE = 26,
        EW_RESIZE = 27,
        NS_RESIZE = 28,
        NESW_RESIZE = 29,
        NWSE_RESIZE = 30,
        COL_RESIZE = 31,
        ROW_RESIZE = 32,
        ALL_SCROLL = 33,
        ZOOM_IN = 34,
        ZOOM_OUT = 35,
        DND_ASK = 36,
        ALL_RESIZE = 37,
    }


    export namespace EOTFType {
        export const $gtype: GObject.GType<EOTFType>;
    }

    enum EOTFType {
        NAMED = 0,
        GAMMA = 1,
    }


    export namespace EncodingRequiredFormat {
        export const $gtype: GObject.GType<EncodingRequiredFormat>;
    }

    enum EncodingRequiredFormat {
        UINT8 = 0,
        UINT10 = 1,
        FP16 = 2,
    }


    export namespace EventPhase {
        export const $gtype: GObject.GType<EventPhase>;
    }

    enum EventPhase {
        CAPTURE = 0,
        TARGET = 1,
        BUBBLE = 2,
    }


    export namespace EventType {
        export const $gtype: GObject.GType<EventType>;
    }

    enum EventType {
        NOTHING = 0,
        KEY_PRESS = 1,
        KEY_RELEASE = 2,
        MOTION = 3,
        ENTER = 4,
        LEAVE = 5,
        BUTTON_PRESS = 6,
        BUTTON_RELEASE = 7,
        SCROLL = 8,
        TOUCH_BEGIN = 9,
        TOUCH_UPDATE = 10,
        TOUCH_END = 11,
        TOUCH_CANCEL = 12,
        TOUCHPAD_PINCH = 13,
        TOUCHPAD_SWIPE = 14,
        TOUCHPAD_HOLD = 15,
        PROXIMITY_IN = 16,
        PROXIMITY_OUT = 17,
        PAD_BUTTON_PRESS = 18,
        PAD_BUTTON_RELEASE = 19,
        PAD_STRIP = 20,
        PAD_RING = 21,
        PAD_DIAL = 22,
        DEVICE_ADDED = 23,
        DEVICE_REMOVED = 24,
        IM_COMMIT = 25,
        IM_DELETE = 26,
        IM_PREEDIT = 27,
        KEY_STATE = 28,
        EVENT_LAST = 29,
    }


    export namespace FrameClockMode {
        export const $gtype: GObject.GType<FrameClockMode>;
    }

    enum FrameClockMode {
        FIXED = 0,
        VARIABLE = 1,
        PASSIVE = 2,
    }


    export namespace FrameResult {
        export const $gtype: GObject.GType<FrameResult>;
    }

    enum FrameResult {
        PENDING_PRESENTED = 0,
        IDLE = 1,
        IGNORED = 2,
        DEFUNCT = 3,
    }


    export namespace GestureState {
        export const $gtype: GObject.GType<GestureState>;
    }

    enum GestureState {
        WAITING = 0,
        POSSIBLE = 1,
        RECOGNIZING = 2,
        COMPLETED = 3,
        CANCELLED = 4,
        CLUTTER_N_GESTURE_STATES = 5,
    }


    export namespace GraphicsRecoveryState {
        export const $gtype: GObject.GType<GraphicsRecoveryState>;
    }

    enum GraphicsRecoveryState {
        NORMAL = 0,
        RESET_IN_PROGRESS = 1,
        RESET_COMPLETED = 2,
        RESTORING = 3,
        FAILED = 4,
    }


    export namespace GridPosition {
        export const $gtype: GObject.GType<GridPosition>;
    }

    enum GridPosition {
        LEFT = 0,
        RIGHT = 1,
        TOP = 2,
        BOTTOM = 3,
    }


    export namespace InputAction {
        export const $gtype: GObject.GType<InputAction>;
    }

    enum InputAction {
        SUBMIT = 0,
        LAST = 1,
    }


    export namespace InputAxis {
        export const $gtype: GObject.GType<InputAxis>;
    }

    enum InputAxis {
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


    export namespace InputContentPurpose {
        export const $gtype: GObject.GType<InputContentPurpose>;
    }

    enum InputContentPurpose {
        NORMAL = 0,
        ALPHA = 1,
        DIGITS = 2,
        NUMBER = 3,
        PHONE = 4,
        URL = 5,
        EMAIL = 6,
        NAME = 7,
        PASSWORD = 8,
        DATE = 9,
        TIME = 10,
        DATETIME = 11,
        TERMINAL = 12,
    }


    export namespace InputDevicePadFeature {
        export const $gtype: GObject.GType<InputDevicePadFeature>;
    }

    enum InputDevicePadFeature {
        BUTTON = 0,
        RING = 1,
        STRIP = 2,
        DIAL = 3,
    }


    export namespace InputDevicePadSource {
        export const $gtype: GObject.GType<InputDevicePadSource>;
    }

    enum InputDevicePadSource {
        UNKNOWN = 0,
        FINGER = 1,
    }


    export namespace InputDeviceToolType {
        export const $gtype: GObject.GType<InputDeviceToolType>;
    }

    enum InputDeviceToolType {
        NONE = 0,
        PEN = 1,
        ERASER = 2,
        BRUSH = 3,
        PENCIL = 4,
        AIRBRUSH = 5,
        MOUSE = 6,
        LENS = 7,
    }


    export namespace InputDeviceType {
        export const $gtype: GObject.GType<InputDeviceType>;
    }

    enum InputDeviceType {
        POINTER_DEVICE = 0,
        KEYBOARD_DEVICE = 1,
        EXTENSION_DEVICE = 2,
        JOYSTICK_DEVICE = 3,
        TABLET_DEVICE = 4,
        TOUCHPAD_DEVICE = 5,
        TOUCHSCREEN_DEVICE = 6,
        PEN_DEVICE = 7,
        ERASER_DEVICE = 8,
        CURSOR_DEVICE = 9,
        PAD_DEVICE = 10,
        N_DEVICE_TYPES = 11,
    }


    export namespace InputPanelState {
        export const $gtype: GObject.GType<InputPanelState>;
    }

    enum InputPanelState {
        OFF = 0,
        ON = 1,
        TOGGLE = 2,
    }


    export namespace KeyState {
        export const $gtype: GObject.GType<KeyState>;
    }

    enum KeyState {
        RELEASED = 0,
        PRESSED = 1,
    }


    export namespace LuminanceType {
        export const $gtype: GObject.GType<LuminanceType>;
    }

    enum LuminanceType {
        DERIVED = 0,
        EXPLICIT = 1,
    }


    export namespace Orientation {
        export const $gtype: GObject.GType<Orientation>;
    }

    enum Orientation {
        HORIZONTAL = 0,
        VERTICAL = 1,
    }


    export namespace PanAxis {
        export const $gtype: GObject.GType<PanAxis>;
    }

    enum PanAxis {
        BOTH = 0,
        X = 1,
        Y = 2,
    }


    export namespace PickMode {
        export const $gtype: GObject.GType<PickMode>;
    }

    enum PickMode {
        NONE = 0,
        REACTIVE = 1,
        ALL = 2,
    }


    export namespace PipelineCapability {
        export const $gtype: GObject.GType<PipelineCapability>;
    }

    enum PipelineCapability {
        COLOR_STATE = 0,
        SHADER_EFFECT = 1,
    }


    export namespace PointerA11yDwellClickType {
        export const $gtype: GObject.GType<PointerA11yDwellClickType>;
    }

    enum PointerA11yDwellClickType {
        NONE = 0,
        PRIMARY = 1,
        SECONDARY = 2,
        MIDDLE = 3,
        DOUBLE = 4,
        DRAG = 5,
    }


    export namespace PointerA11yDwellDirection {
        export const $gtype: GObject.GType<PointerA11yDwellDirection>;
    }

    enum PointerA11yDwellDirection {
        NONE = 0,
        LEFT = 1,
        RIGHT = 2,
        UP = 3,
        DOWN = 4,
    }


    export namespace PointerA11yDwellMode {
        export const $gtype: GObject.GType<PointerA11yDwellMode>;
    }

    enum PointerA11yDwellMode {
        WINDOW = 0,
        GESTURE = 1,
    }


    export namespace PointerA11yTimeoutType {
        export const $gtype: GObject.GType<PointerA11yTimeoutType>;
    }

    enum PointerA11yTimeoutType {
        SECONDARY_CLICK = 0,
        DWELL = 1,
        GESTURE = 2,
    }


    export namespace PreeditResetMode {
        export const $gtype: GObject.GType<PreeditResetMode>;
    }

    enum PreeditResetMode {
        CLEAR = 0,
        COMMIT = 1,
    }


    export namespace PreeditStyleHint {
        export const $gtype: GObject.GType<PreeditStyleHint>;
    }

    enum PreeditStyleHint {
        NONE = 0,
        WHOLE = 1,
        SELECTION = 2,
        PREDICTION = 3,
        PREFIX = 4,
        SUFFIX = 5,
        SPELLING_ERROR = 6,
        COMPOSE_ERROR = 7,
    }


    export namespace RequestMode {
        export const $gtype: GObject.GType<RequestMode>;
    }

    enum RequestMode {
        HEIGHT_FOR_WIDTH = 0,
        WIDTH_FOR_HEIGHT = 1,
        CONTENT_SIZE = 2,
    }


    export namespace RotateAxis {
        export const $gtype: GObject.GType<RotateAxis>;
    }

    enum RotateAxis {
        X_AXIS = 0,
        Y_AXIS = 1,
        Z_AXIS = 2,
    }


    export namespace ScalingFilter {
        export const $gtype: GObject.GType<ScalingFilter>;
    }

    enum ScalingFilter {
        LINEAR = 0,
        NEAREST = 1,
        TRILINEAR = 2,
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


    export namespace ScrollSource {
        export const $gtype: GObject.GType<ScrollSource>;
    }

    enum ScrollSource {
        UNKNOWN = 0,
        WHEEL = 1,
        FINGER = 2,
        CONTINUOUS = 3,
    }


    export namespace SnapEdge {
        export const $gtype: GObject.GType<SnapEdge>;
    }

    enum SnapEdge {
        TOP = 0,
        RIGHT = 1,
        BOTTOM = 2,
        LEFT = 3,
    }


    export namespace SpriteRole {
        export const $gtype: GObject.GType<SpriteRole>;
    }

    enum SpriteRole {
        POINTER = 0,
        TABLET = 1,
        TOUCHPOINT = 2,
    }


    export namespace StepMode {
        export const $gtype: GObject.GType<StepMode>;
    }

    enum StepMode {
        START = 0,
        END = 1,
    }


    export namespace TextDirection {
        export const $gtype: GObject.GType<TextDirection>;
    }

    enum TextDirection {
        DEFAULT = 0,
        LTR = 1,
        RTL = 2,
    }


    export namespace TimelineDirection {
        export const $gtype: GObject.GType<TimelineDirection>;
    }

    enum TimelineDirection {
        FORWARD = 0,
        BACKWARD = 1,
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


    export namespace TransferFunction {
        export const $gtype: GObject.GType<TransferFunction>;
    }

    enum TransferFunction {
        SRGB_PIECEWISE = 0,
        GAMMA22 = 1,
        PQ = 2,
        BT1886 = 3,
        LINEAR = 4,
    }


    export namespace YcbcrCoefficients {
        export const $gtype: GObject.GType<YcbcrCoefficients>;
    }

    enum YcbcrCoefficients {
        IDENTITY_LIMITED = 0,
        BT601_FULL = 1,
        BT601_LIMITED = 2,
        BT709_FULL = 3,
        BT709_LIMITED = 4,
        BT2020_FULL = 5,
        BT2020_LIMITED = 6,
    }


    const BUTTON_MIDDLE: number;

    const BUTTON_PRIMARY: number;

    const BUTTON_SECONDARY: number;

    const CURRENT_TIME: number;

    const D50_X: number;

    const D50_Y: number;

    const D50_Z: number;

    const D65_X: number;

    const D65_Y: number;

    const D65_Z: number;

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

    const PRIORITY_REDRAW: number;

    const VIRTUAL_INPUT_DEVICE_MAX_TOUCH_SLOTS: number;

    function actor_box_alloc(): ActorBox;

    function actor_box_clamp_to_pixel(box: ActorBox): ActorBox;

    function add_debug_flags(debug_flags: DebugFlag, draw_flags: DrawDebugFlag, pick_flags: PickDebugFlag): void;

    function colorspace_to_primaries(colorspace: Colorspace): Primaries;

    function colorspace_to_string(colorspace: Colorspace): string;

    function cursor_type_to_name(cursor: CursorType): string;

    function debug_set_max_render_time_constant(max_render_time_constant_us: number): void;

    function event_add_filter(stage: Stage | null, func: EventFilterFunc): number;

    function event_get(): Event;

    function event_prepend_filter(stage: Stage | null, func: EventFilterFunc): number;

    function event_remove_filter(id: number): void;

    function events_pending(): boolean;

    function get_accessibility_enabled(): boolean;

    function get_current_event(): Event;

    function get_current_event_time(): number;

    function get_debug_flags(): [DebugFlag | null, DrawDebugFlag | null, PickDebugFlag | null];

    function get_default_text_direction(): TextDirection;

    function get_text_direction(): TextDirection;

    function keysym_to_unicode(keyval: number): number;

    function keyval_convert_case(symbol: number): [number, number];

    function keyval_get_aliases(keyval: number): number[] | null;

    function keyval_name(keyval: number): string | null;

    function keyval_to_lower(keyval: number): number;

    function keyval_to_upper(keyval: number): number;

    function luminance_get_default_sdr(): Luminance;

    function pipeline_capability_quark(): GLib.Quark;

    function remove_debug_flags(debug_flags: DebugFlag, draw_flags: DrawDebugFlag, pick_flags: PickDebugFlag): void;

    function threads_add_repaint_func(flags: RepaintFlags, func: GLib.SourceFunc): number;

    function threads_remove_repaint_func(handle_id: number): void;

    function unicode_to_keysym(wc: number): number;

    function value_dup_paint_node(value: GObject.Value | any): PaintNode;

    function value_get_paint_node(value: GObject.Value | any): PaintNode;

    function value_get_shader_float(value: GObject.Value | any): number[];

    function value_get_shader_int(value: GObject.Value | any): number[];

    function value_get_shader_matrix(value: GObject.Value | any): number[];

    function value_set_paint_node(value: GObject.Value | any, node: PaintNode | null): void;

    function value_set_shader_float(value: GObject.Value | any, floats: number[]): void;

    function value_set_shader_int(value: GObject.Value | any, ints: number[]): void;

    function value_set_shader_matrix(value: GObject.Value | any, matrix: number[]): void;

    function value_take_paint_node(value: GObject.Value | any, node: PaintNode | null): void;

    function xyY_to_XYZ(x: number, y: number, Y: number, XYZ: Graphene.Vec3): void;

    interface ActorCreateChildFunc<A = GObject.Object> {
        (item: A): Actor;
    }

    interface EventFilterFunc {
        (event: Event, event_actor: Actor): boolean;
    }

    interface ProgressFunc {
        (a: unknown, b: unknown, progress: number, retval: unknown): boolean;
    }

    interface StageInputForeachFunc {
        (stage: Stage, sprite: Sprite): boolean;
    }

    interface TimelineProgressFunc {
        (timeline: Timeline, elapsed: number, total: number): number;
    }

    export namespace ColorStateTransformFlags {
        export const $gtype: GObject.GType<ColorStateTransformFlags>;
    }

    enum ColorStateTransformFlags {
        OPAQUE = 1,
    }


    export namespace ContentRepeat {
        export const $gtype: GObject.GType<ContentRepeat>;
    }

    enum ContentRepeat {
        NONE = 0,
        X_AXIS = 1,
        Y_AXIS = 2,
        BOTH = 3,
    }


    export namespace DebugFlag {
        export const $gtype: GObject.GType<DebugFlag>;
    }

    enum DebugFlag {
        MISC = 1,
        ACTOR = 2,
        TEXTURE = 4,
        EVENT = 8,
        PAINT = 16,
        PANGO = 32,
        BACKEND = 64,
        SCHEDULER = 128,
        SCRIPT = 256,
        SHADER = 512,
        MULTISTAGE = 1024,
        ANIMATION = 2048,
        LAYOUT = 4096,
        PICK = 8192,
        EVENTLOOP = 16384,
        CLIPPING = 32768,
        OOB_TRANSFORMS = 65536,
        FRAME_TIMINGS = 131072,
        DETAILED_TRACE = 262144,
        GRABS = 524288,
        FRAME_CLOCK = 1048576,
        GESTURES = 2097152,
        RECOVERY = 4194304,
    }


    export namespace DrawDebugFlag {
        export const $gtype: GObject.GType<DrawDebugFlag>;
    }

    enum DrawDebugFlag {
        DISABLE_SWAP_EVENTS = 1,
        DISABLE_CLIPPED_REDRAWS = 2,
        REDRAWS = 4,
        PAINT_VOLUMES = 8,
        DISABLE_CULLING = 16,
        DISABLE_OFFSCREEN_REDIRECT = 32,
        CONTINUOUS_REDRAW = 64,
        PAINT_DEFORM_TILES = 128,
        PAINT_DAMAGE_REGION = 256,
        DISABLE_DYNAMIC_MAX_RENDER_TIME = 512,
        PAINT_MAX_RENDER_TIME = 1024,
        DISABLE_TRIPLE_BUFFERING = 2048,
    }


    export namespace EffectPaintFlags {
        export const $gtype: GObject.GType<EffectPaintFlags>;
    }

    enum EffectPaintFlags {
        ACTOR_DIRTY = 1,
        BYPASS_EFFECT = 2,
    }


    export namespace EventFlags {
        export const $gtype: GObject.GType<EventFlags>;
    }

    enum EventFlags {
        NONE = 0,
        FLAG_SYNTHETIC = 1,
        FLAG_INPUT_METHOD = 2,
        FLAG_REPEATED = 4,
        FLAG_RELATIVE_MOTION = 8,
        FLAG_GRAB_NOTIFY = 16,
        FLAG_POINTER_EMULATED = 32,
        FLAG_A11Y_MODIFIER_FIRST_CLICK = 64,
    }


    export namespace FrameInfoFlag {
        export const $gtype: GObject.GType<FrameInfoFlag>;
    }

    enum FrameInfoFlag {
        NONE = 0,
        HW_CLOCK = 1,
        ZERO_COPY = 2,
        VSYNC = 4,
    }


    export namespace InputActionFlags {
        export const $gtype: GObject.GType<InputActionFlags>;
    }

    enum InputActionFlags {
        NONE = 0,
        SUBMIT = 1,
        ALL = 1,
    }


    export namespace InputAxisFlags {
        export const $gtype: GObject.GType<InputAxisFlags>;
    }

    enum InputAxisFlags {
        NONE = 0,
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


    export namespace InputCapabilities {
        export const $gtype: GObject.GType<InputCapabilities>;
    }

    enum InputCapabilities {
        NONE = 0,
        POINTER = 1,
        KEYBOARD = 2,
        TOUCHPAD = 4,
        TOUCH = 8,
        TABLET_TOOL = 16,
        TABLET_PAD = 32,
        TRACKBALL = 64,
        TRACKPOINT = 128,
    }


    export namespace InputContentHintFlags {
        export const $gtype: GObject.GType<InputContentHintFlags>;
    }

    enum InputContentHintFlags {
        COMPLETION = 1,
        SPELLCHECK = 2,
        AUTO_CAPITALIZATION = 4,
        LOWERCASE = 8,
        UPPERCASE = 16,
        TITLECASE = 32,
        HIDDEN_TEXT = 64,
        SENSITIVE_DATA = 128,
        LATIN = 256,
        MULTILINE = 512,
        INHIBIT_OSK = 1024,
        NO_EMOJI = 2048,
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


    export namespace OffscreenRedirect {
        export const $gtype: GObject.GType<OffscreenRedirect>;
    }

    enum OffscreenRedirect {
        AUTOMATIC_FOR_OPACITY = 1,
        ALWAYS = 2,
        ON_IDLE = 4,
    }


    export namespace PaintFlag {
        export const $gtype: GObject.GType<PaintFlag>;
    }

    enum PaintFlag {
        NONE = 0,
        NO_CURSORS = 1,
        FORCE_CURSORS = 2,
        CLEAR = 4,
    }


    export namespace PickDebugFlag {
        export const $gtype: GObject.GType<PickDebugFlag>;
    }

    enum PickDebugFlag {
        PICKING = 1,
    }


    export namespace PointerA11yFlags {
        export const $gtype: GObject.GType<PointerA11yFlags>;
    }

    enum PointerA11yFlags {
        SECONDARY_CLICK_ENABLED = 1,
        DWELL_ENABLED = 2,
    }


    export namespace RepaintFlags {
        export const $gtype: GObject.GType<RepaintFlags>;
    }

    enum RepaintFlags {
        PRE_PAINT = 1,
        POST_PAINT = 2,
    }


    export namespace ScrollControllerFlags {
        export const $gtype: GObject.GType<ScrollControllerFlags>;
    }

    enum ScrollControllerFlags {
        NONE = 0,
        SCROLL_VERTICAL = 1,
        SCROLL_HORIZONTAL = 2,
        DISCRETE = 4,
        PHYSICAL_DIRECTION = 8,
    }


    export namespace ScrollFinishFlags {
        export const $gtype: GObject.GType<ScrollFinishFlags>;
    }

    enum ScrollFinishFlags {
        NONE = 0,
        HORIZONTAL = 1,
        VERTICAL = 2,
    }


    export namespace ScrollFlags {
        export const $gtype: GObject.GType<ScrollFlags>;
    }

    enum ScrollFlags {
        NONE = 0,
        INVERTED = 1,
    }


    export namespace VirtualDeviceType {
        export const $gtype: GObject.GType<VirtualDeviceType>;
    }

    enum VirtualDeviceType {
        NONE = 0,
        KEYBOARD = 1,
        POINTER = 2,
        TOUCHSCREEN = 4,
    }


    namespace Action {
        // Signal signatures
        interface SignalSignatures extends ActorMeta.SignalSignatures {
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends ActorMeta.ConstructorProps {}
    }

    abstract class Action extends ActorMeta {
        static $gtype: GObject.GType<Action>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Action.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Action.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Action.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Action.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Action.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Action.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Action.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Action.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_handle_event(event: Event): boolean;

        vfunc_register_sequence(event: Event): boolean;

        vfunc_sequence_cancelled(sprite: Sprite): void;

        vfunc_setup_sequence_relationship(action_2: Action, sprite: Sprite): number;

        // Methods
        get_phase(): EventPhase;
    }


    namespace Actor {
        // Signal signatures
        interface SignalSignatures extends GObject.InitiallyUnowned.SignalSignatures {
            /** @signal */
            "button-press-event": (event: Event) => boolean | void;
            /** @signal */
            "button-release-event": (event: Event) => boolean | void;
            /** @signal */
            "captured-event": (event: Event) => boolean | void;
            /** @signal */
            "child-added": (child: Actor) => void;
            /** @signal */
            "child-removed": (child: Actor) => void;
            /** @signal */
            cloned: (object: Clone) => void;
            /** @signal */
            decloned: (object: Clone) => void;
            /** @signal */
            destroy: () => void;
            /** @signal */
            "enter-event": (event: Event) => boolean | void;
            /** @signal */
            event: (event: Event) => boolean | void;
            /** @signal */
            hide: () => void;
            /** @signal */
            "key-focus-in": () => void;
            /** @signal */
            "key-focus-out": () => void;
            /** @signal */
            "key-press-event": (event: Event) => boolean | void;
            /** @signal */
            "key-release-event": (event: Event) => boolean | void;
            /** @signal */
            "leave-event": (event: Event) => boolean | void;
            /** @signal */
            "motion-event": (event: Event) => boolean | void;
            /** @signal */
            "parent-set": (old_parent: Actor | null) => void;
            /** @signal */
            pick: (pick_context: PickContext) => void;
            /** @signal */
            "queue-relayout": () => void;
            /** @signal */
            "real-resource-scale-changed": () => void;
            /** @signal */
            realize: () => void;
            /** @signal */
            "resource-scale-changed": () => void;
            /** @signal */
            "scroll-event": (event: Event) => boolean | void;
            /** @signal */
            show: () => void;
            /** @signal */
            "stage-views-changed": () => void;
            /** @signal */
            "touch-event": (event: Event) => boolean | void;
            /** @signal */
            "transition-removed": (transition: Transition, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transitions-completed": () => void;
            /** @signal */
            unrealize: () => void;
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
            /** @signal */
            "captured-event::accessible-name": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::accessible-role": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::actions": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::allocation": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::background-color": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::background-color-set": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::child-transform": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::child-transform-set": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::clip-rect": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::clip-to-allocation": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::color-state": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::constraints": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::content": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::content-box": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::content-gravity": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::content-repeat": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::context": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::cursor-type": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::effect": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::first-child": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::fixed-position-set": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::fixed-x": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::fixed-y": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::has-clip": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::has-pointer": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::height": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::last-child": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::layout-manager": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::magnification-filter": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::mapped": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::margin-bottom": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::margin-left": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::margin-right": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::margin-top": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::min-height": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::min-height-set": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::min-width": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::min-width-set": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::minification-filter": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::name": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::natural-height": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::natural-height-set": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::natural-width": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::natural-width-set": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::offscreen-redirect": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::opacity": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::pivot-point": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::pivot-point-z": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::position": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::reactive": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::realized": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::request-mode": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::rotation-angle-x": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::rotation-angle-y": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::rotation-angle-z": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::scale-x": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::scale-y": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::scale-z": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::show-on-set-parent": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::size": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::text-direction": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::transform": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::transform-set": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::translation-x": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::translation-y": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::translation-z": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::visible": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::width": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::x": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::x-align": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::x-expand": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::y": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::y-align": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::y-expand": (event: Event) => boolean | void;
            /** @signal */
            "captured-event::z-position": (event: Event) => boolean | void;
            [key: `captured-event::${string}`]: (event: Event) => boolean | void;
            /** @signal */
            "event::accessible-name": (event: Event) => boolean | void;
            /** @signal */
            "event::accessible-role": (event: Event) => boolean | void;
            /** @signal */
            "event::actions": (event: Event) => boolean | void;
            /** @signal */
            "event::allocation": (event: Event) => boolean | void;
            /** @signal */
            "event::background-color": (event: Event) => boolean | void;
            /** @signal */
            "event::background-color-set": (event: Event) => boolean | void;
            /** @signal */
            "event::child-transform": (event: Event) => boolean | void;
            /** @signal */
            "event::child-transform-set": (event: Event) => boolean | void;
            /** @signal */
            "event::clip-rect": (event: Event) => boolean | void;
            /** @signal */
            "event::clip-to-allocation": (event: Event) => boolean | void;
            /** @signal */
            "event::color-state": (event: Event) => boolean | void;
            /** @signal */
            "event::constraints": (event: Event) => boolean | void;
            /** @signal */
            "event::content": (event: Event) => boolean | void;
            /** @signal */
            "event::content-box": (event: Event) => boolean | void;
            /** @signal */
            "event::content-gravity": (event: Event) => boolean | void;
            /** @signal */
            "event::content-repeat": (event: Event) => boolean | void;
            /** @signal */
            "event::context": (event: Event) => boolean | void;
            /** @signal */
            "event::cursor-type": (event: Event) => boolean | void;
            /** @signal */
            "event::effect": (event: Event) => boolean | void;
            /** @signal */
            "event::first-child": (event: Event) => boolean | void;
            /** @signal */
            "event::fixed-position-set": (event: Event) => boolean | void;
            /** @signal */
            "event::fixed-x": (event: Event) => boolean | void;
            /** @signal */
            "event::fixed-y": (event: Event) => boolean | void;
            /** @signal */
            "event::has-clip": (event: Event) => boolean | void;
            /** @signal */
            "event::has-pointer": (event: Event) => boolean | void;
            /** @signal */
            "event::height": (event: Event) => boolean | void;
            /** @signal */
            "event::last-child": (event: Event) => boolean | void;
            /** @signal */
            "event::layout-manager": (event: Event) => boolean | void;
            /** @signal */
            "event::magnification-filter": (event: Event) => boolean | void;
            /** @signal */
            "event::mapped": (event: Event) => boolean | void;
            /** @signal */
            "event::margin-bottom": (event: Event) => boolean | void;
            /** @signal */
            "event::margin-left": (event: Event) => boolean | void;
            /** @signal */
            "event::margin-right": (event: Event) => boolean | void;
            /** @signal */
            "event::margin-top": (event: Event) => boolean | void;
            /** @signal */
            "event::min-height": (event: Event) => boolean | void;
            /** @signal */
            "event::min-height-set": (event: Event) => boolean | void;
            /** @signal */
            "event::min-width": (event: Event) => boolean | void;
            /** @signal */
            "event::min-width-set": (event: Event) => boolean | void;
            /** @signal */
            "event::minification-filter": (event: Event) => boolean | void;
            /** @signal */
            "event::name": (event: Event) => boolean | void;
            /** @signal */
            "event::natural-height": (event: Event) => boolean | void;
            /** @signal */
            "event::natural-height-set": (event: Event) => boolean | void;
            /** @signal */
            "event::natural-width": (event: Event) => boolean | void;
            /** @signal */
            "event::natural-width-set": (event: Event) => boolean | void;
            /** @signal */
            "event::offscreen-redirect": (event: Event) => boolean | void;
            /** @signal */
            "event::opacity": (event: Event) => boolean | void;
            /** @signal */
            "event::pivot-point": (event: Event) => boolean | void;
            /** @signal */
            "event::pivot-point-z": (event: Event) => boolean | void;
            /** @signal */
            "event::position": (event: Event) => boolean | void;
            /** @signal */
            "event::reactive": (event: Event) => boolean | void;
            /** @signal */
            "event::realized": (event: Event) => boolean | void;
            /** @signal */
            "event::request-mode": (event: Event) => boolean | void;
            /** @signal */
            "event::rotation-angle-x": (event: Event) => boolean | void;
            /** @signal */
            "event::rotation-angle-y": (event: Event) => boolean | void;
            /** @signal */
            "event::rotation-angle-z": (event: Event) => boolean | void;
            /** @signal */
            "event::scale-x": (event: Event) => boolean | void;
            /** @signal */
            "event::scale-y": (event: Event) => boolean | void;
            /** @signal */
            "event::scale-z": (event: Event) => boolean | void;
            /** @signal */
            "event::show-on-set-parent": (event: Event) => boolean | void;
            /** @signal */
            "event::size": (event: Event) => boolean | void;
            /** @signal */
            "event::text-direction": (event: Event) => boolean | void;
            /** @signal */
            "event::transform": (event: Event) => boolean | void;
            /** @signal */
            "event::transform-set": (event: Event) => boolean | void;
            /** @signal */
            "event::translation-x": (event: Event) => boolean | void;
            /** @signal */
            "event::translation-y": (event: Event) => boolean | void;
            /** @signal */
            "event::translation-z": (event: Event) => boolean | void;
            /** @signal */
            "event::visible": (event: Event) => boolean | void;
            /** @signal */
            "event::width": (event: Event) => boolean | void;
            /** @signal */
            "event::x": (event: Event) => boolean | void;
            /** @signal */
            "event::x-align": (event: Event) => boolean | void;
            /** @signal */
            "event::x-expand": (event: Event) => boolean | void;
            /** @signal */
            "event::y": (event: Event) => boolean | void;
            /** @signal */
            "event::y-align": (event: Event) => boolean | void;
            /** @signal */
            "event::y-expand": (event: Event) => boolean | void;
            /** @signal */
            "event::z-position": (event: Event) => boolean | void;
            [key: `event::${string}`]: (event: Event) => boolean | void;
            /** @signal */
            "transition-stopped::accessible-name": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::accessible-role": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::actions": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::allocation": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::background-color": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::background-color-set": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::child-transform": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::child-transform-set": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::clip-rect": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::clip-to-allocation": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::color-state": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::constraints": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::content": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::content-box": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::content-gravity": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::content-repeat": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::context": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::cursor-type": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::effect": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::first-child": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::fixed-position-set": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::fixed-x": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::fixed-y": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::has-clip": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::has-pointer": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::height": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::last-child": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::layout-manager": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::magnification-filter": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::mapped": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::margin-bottom": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::margin-left": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::margin-right": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::margin-top": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::min-height": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::min-height-set": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::min-width": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::min-width-set": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::minification-filter": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::name": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::natural-height": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::natural-height-set": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::natural-width": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::natural-width-set": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::offscreen-redirect": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::opacity": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::pivot-point": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::pivot-point-z": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::position": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::reactive": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::realized": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::request-mode": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::rotation-angle-x": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::rotation-angle-y": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::rotation-angle-z": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::scale-x": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::scale-y": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::scale-z": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::show-on-set-parent": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::size": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::text-direction": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::transform": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::transform-set": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::translation-x": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::translation-y": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::translation-z": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::visible": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::width": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::x": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::x-align": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::x-expand": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::y": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::y-align": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::y-expand": (name: string, is_finished: boolean) => void;
            /** @signal */
            "transition-stopped::z-position": (name: string, is_finished: boolean) => void;
            [key: `transition-stopped::${string}`]: (name: string, is_finished: boolean) => void;
        }

        // Constructor properties interface
        interface ConstructorProps<A extends LayoutManager = LayoutManager, B extends Content = Content> extends GObject.InitiallyUnowned.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Animatable.ConstructorProps {
            accessible_name: string;
            accessibleName: string;
            accessible_role: Atk.Role;
            accessibleRole: Atk.Role;
            actions: Action;
            allocation: ActorBox;
            background_color: Cogl.Color;
            backgroundColor: Cogl.Color;
            background_color_set: boolean;
            backgroundColorSet: boolean;
            child_transform: Graphene.Matrix;
            childTransform: Graphene.Matrix;
            child_transform_set: boolean;
            childTransformSet: boolean;
            clip_rect: Graphene.Rect;
            clipRect: Graphene.Rect;
            clip_to_allocation: boolean;
            clipToAllocation: boolean;
            color_state: ColorState;
            colorState: ColorState;
            constraints: Constraint;
            content: B;
            content_box: ActorBox;
            contentBox: ActorBox;
            content_gravity: ContentGravity;
            contentGravity: ContentGravity;
            content_repeat: ContentRepeat;
            contentRepeat: ContentRepeat;
            context: Context;
            cursor_type: CursorType;
            cursorType: CursorType;
            effect: Effect | null;
            first_child: Actor | null;
            firstChild: Actor | null;
            fixed_position_set: boolean;
            fixedPositionSet: boolean;
            fixed_x: number;
            fixedX: number;
            fixed_y: number;
            fixedY: number;
            has_clip: boolean;
            hasClip: boolean;
            has_pointer: boolean;
            hasPointer: boolean;
            height: number;
            last_child: Actor | null;
            lastChild: Actor | null;
            layout_manager: A;
            layoutManager: A;
            magnification_filter: ScalingFilter;
            magnificationFilter: ScalingFilter;
            mapped: boolean;
            margin_bottom: number;
            marginBottom: number;
            margin_left: number;
            marginLeft: number;
            margin_right: number;
            marginRight: number;
            margin_top: number;
            marginTop: number;
            min_height: number;
            minHeight: number;
            min_height_set: boolean;
            minHeightSet: boolean;
            min_width: number;
            minWidth: number;
            min_width_set: boolean;
            minWidthSet: boolean;
            minification_filter: ScalingFilter;
            minificationFilter: ScalingFilter;
            name: string | null;
            natural_height: number;
            naturalHeight: number;
            natural_height_set: boolean;
            naturalHeightSet: boolean;
            natural_width: number;
            naturalWidth: number;
            natural_width_set: boolean;
            naturalWidthSet: boolean;
            offscreen_redirect: OffscreenRedirect;
            offscreenRedirect: OffscreenRedirect;
            opacity: number;
            pivot_point: Graphene.Point;
            pivotPoint: Graphene.Point;
            pivot_point_z: number;
            pivotPointZ: number;
            position: Graphene.Point;
            reactive: boolean;
            realized: boolean;
            request_mode: RequestMode;
            requestMode: RequestMode;
            rotation_angle_x: number;
            rotationAngleX: number;
            rotation_angle_y: number;
            rotationAngleY: number;
            rotation_angle_z: number;
            rotationAngleZ: number;
            scale_x: number;
            scaleX: number;
            scale_y: number;
            scaleY: number;
            scale_z: number;
            scaleZ: number;
            show_on_set_parent: boolean;
            showOnSetParent: boolean;
            size: Graphene.Size;
            text_direction: TextDirection;
            textDirection: TextDirection;
            transform: Graphene.Matrix;
            transform_set: boolean;
            transformSet: boolean;
            translation_x: number;
            translationX: number;
            translation_y: number;
            translationY: number;
            translation_z: number;
            translationZ: number;
            visible: boolean;
            width: number;
            x: number;
            x_align: ActorAlign;
            xAlign: ActorAlign;
            x_expand: boolean;
            xExpand: boolean;
            y: number;
            y_align: ActorAlign;
            yAlign: ActorAlign;
            y_expand: boolean;
            yExpand: boolean;
            z_position: number;
            zPosition: number;
        }
    }

    class Actor<A extends LayoutManager = LayoutManager, B extends Content = Content> extends GObject.InitiallyUnowned implements Atk.ImplementorIface, Animatable {
        static $gtype: GObject.GType<Actor>;

        // Properties
        get accessible_name(): string;
        set accessible_name(val: string);

        get accessibleName(): string;
        set accessibleName(val: string);

        get accessible_role(): Atk.Role;
        set accessible_role(val: Atk.Role);

        get accessibleRole(): Atk.Role;
        set accessibleRole(val: Atk.Role);

        set actions(val: Action);

        get allocation(): ActorBox;

        get background_color(): Cogl.Color;
        set background_color(val: Cogl.Color);

        get backgroundColor(): Cogl.Color;
        set backgroundColor(val: Cogl.Color);

        get background_color_set(): boolean;

        get backgroundColorSet(): boolean;

        get child_transform(): Graphene.Matrix;
        set child_transform(val: Graphene.Matrix);

        get childTransform(): Graphene.Matrix;
        set childTransform(val: Graphene.Matrix);

        get child_transform_set(): boolean;

        get childTransformSet(): boolean;

        get clip_rect(): Graphene.Rect;
        set clip_rect(val: Graphene.Rect);

        get clipRect(): Graphene.Rect;
        set clipRect(val: Graphene.Rect);

        get clip_to_allocation(): boolean;
        set clip_to_allocation(val: boolean);

        get clipToAllocation(): boolean;
        set clipToAllocation(val: boolean);

        get color_state(): ColorState;
        set color_state(val: ColorState);

        get colorState(): ColorState;
        set colorState(val: ColorState);

        set constraints(val: Constraint);

        get content(): B;
        set content(val: B);

        get content_box(): ActorBox;

        get contentBox(): ActorBox;

        get content_gravity(): ContentGravity;
        set content_gravity(val: ContentGravity);

        get contentGravity(): ContentGravity;
        set contentGravity(val: ContentGravity);

        get content_repeat(): ContentRepeat;
        set content_repeat(val: ContentRepeat);

        get contentRepeat(): ContentRepeat;
        set contentRepeat(val: ContentRepeat);

        get context(): Context;

        get cursor_type(): CursorType;
        set cursor_type(val: CursorType);

        get cursorType(): CursorType;
        set cursorType(val: CursorType);

        set effect(val: Effect | null);

        get first_child(): Actor | null;

        get firstChild(): Actor | null;

        get fixed_position_set(): boolean;
        set fixed_position_set(val: boolean);

        get fixedPositionSet(): boolean;
        set fixedPositionSet(val: boolean);

        get fixed_x(): number;
        set fixed_x(val: number);

        get fixedX(): number;
        set fixedX(val: number);

        get fixed_y(): number;
        set fixed_y(val: number);

        get fixedY(): number;
        set fixedY(val: number);

        get has_clip(): boolean;

        get hasClip(): boolean;

        get has_pointer(): boolean;

        get hasPointer(): boolean;

        get height(): number;
        set height(val: number);

        get last_child(): Actor | null;

        get lastChild(): Actor | null;

        get layout_manager(): A;
        set layout_manager(val: A);

        get layoutManager(): A;
        set layoutManager(val: A);

        get magnification_filter(): ScalingFilter;
        set magnification_filter(val: ScalingFilter);

        get magnificationFilter(): ScalingFilter;
        set magnificationFilter(val: ScalingFilter);

        get mapped(): boolean;

        get margin_bottom(): number;
        set margin_bottom(val: number);

        get marginBottom(): number;
        set marginBottom(val: number);

        get margin_left(): number;
        set margin_left(val: number);

        get marginLeft(): number;
        set marginLeft(val: number);

        get margin_right(): number;
        set margin_right(val: number);

        get marginRight(): number;
        set marginRight(val: number);

        get margin_top(): number;
        set margin_top(val: number);

        get marginTop(): number;
        set marginTop(val: number);

        get min_height(): number;
        set min_height(val: number);

        get minHeight(): number;
        set minHeight(val: number);

        get min_height_set(): boolean;
        set min_height_set(val: boolean);

        get minHeightSet(): boolean;
        set minHeightSet(val: boolean);

        get min_width(): number;
        set min_width(val: number);

        get minWidth(): number;
        set minWidth(val: number);

        get min_width_set(): boolean;
        set min_width_set(val: boolean);

        get minWidthSet(): boolean;
        set minWidthSet(val: boolean);

        get minification_filter(): ScalingFilter;
        set minification_filter(val: ScalingFilter);

        get minificationFilter(): ScalingFilter;
        set minificationFilter(val: ScalingFilter);

        get name(): string | null;
        set name(val: string | null);

        get natural_height(): number;
        set natural_height(val: number);

        get naturalHeight(): number;
        set naturalHeight(val: number);

        get natural_height_set(): boolean;
        set natural_height_set(val: boolean);

        get naturalHeightSet(): boolean;
        set naturalHeightSet(val: boolean);

        get natural_width(): number;
        set natural_width(val: number);

        get naturalWidth(): number;
        set naturalWidth(val: number);

        get natural_width_set(): boolean;
        set natural_width_set(val: boolean);

        get naturalWidthSet(): boolean;
        set naturalWidthSet(val: boolean);

        get offscreen_redirect(): OffscreenRedirect;
        set offscreen_redirect(val: OffscreenRedirect);

        get offscreenRedirect(): OffscreenRedirect;
        set offscreenRedirect(val: OffscreenRedirect);

        get opacity(): number;
        set opacity(val: number);

        get pivot_point(): Graphene.Point;
        set pivot_point(val: Graphene.Point);

        get pivotPoint(): Graphene.Point;
        set pivotPoint(val: Graphene.Point);

        get pivot_point_z(): number;
        set pivot_point_z(val: number);

        get pivotPointZ(): number;
        set pivotPointZ(val: number);

        get position(): Graphene.Point;
        set position(val: Graphene.Point);

        get reactive(): boolean;
        set reactive(val: boolean);

        get realized(): boolean;

        get request_mode(): RequestMode;
        set request_mode(val: RequestMode);

        get requestMode(): RequestMode;
        set requestMode(val: RequestMode);

        get rotation_angle_x(): number;
        set rotation_angle_x(val: number);

        get rotationAngleX(): number;
        set rotationAngleX(val: number);

        get rotation_angle_y(): number;
        set rotation_angle_y(val: number);

        get rotationAngleY(): number;
        set rotationAngleY(val: number);

        get rotation_angle_z(): number;
        set rotation_angle_z(val: number);

        get rotationAngleZ(): number;
        set rotationAngleZ(val: number);

        get scale_x(): number;
        set scale_x(val: number);

        get scaleX(): number;
        set scaleX(val: number);

        get scale_y(): number;
        set scale_y(val: number);

        get scaleY(): number;
        set scaleY(val: number);

        get scale_z(): number;
        set scale_z(val: number);

        get scaleZ(): number;
        set scaleZ(val: number);

        get show_on_set_parent(): boolean;
        set show_on_set_parent(val: boolean);

        get showOnSetParent(): boolean;
        set showOnSetParent(val: boolean);

        get size(): Graphene.Size;
        set size(val: Graphene.Size);

        get text_direction(): TextDirection;
        set text_direction(val: TextDirection);

        get textDirection(): TextDirection;
        set textDirection(val: TextDirection);

        get transform(): Graphene.Matrix;
        set transform(val: Graphene.Matrix);

        get transform_set(): boolean;

        get transformSet(): boolean;

        get translation_x(): number;
        set translation_x(val: number);

        get translationX(): number;
        set translationX(val: number);

        get translation_y(): number;
        set translation_y(val: number);

        get translationY(): number;
        set translationY(val: number);

        get translation_z(): number;
        set translation_z(val: number);

        get translationZ(): number;
        set translationZ(val: number);

        get visible(): boolean;
        set visible(val: boolean);

        get width(): number;
        set width(val: number);

        get x(): number;
        set x(val: number);

        get x_align(): ActorAlign;
        set x_align(val: ActorAlign);

        get xAlign(): ActorAlign;
        set xAlign(val: ActorAlign);

        get x_expand(): boolean;
        set x_expand(val: boolean);

        get xExpand(): boolean;
        set xExpand(val: boolean);

        get y(): number;
        set y(val: number);

        get y_align(): ActorAlign;
        set y_align(val: ActorAlign);

        get yAlign(): ActorAlign;
        set yAlign(val: ActorAlign);

        get y_expand(): boolean;
        set y_expand(val: boolean);

        get yExpand(): boolean;
        set yExpand(val: boolean);

        get z_position(): number;
        set z_position(val: number);

        get zPosition(): number;
        set zPosition(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Actor.SignalSignatures;

        // Fields
        flags: number;

        // Constructors
        constructor(properties?: Partial<Actor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Actor;

        // Signals
        /** @signal */
        connect<K extends keyof Actor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Actor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Actor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Actor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Actor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Actor.SignalSignatures[K]>): void;

        // Static methods
        static get_binding_pool(): BindingPool;

        static get_layout_manager_type(): GObject.GType;

        static set_layout_manager_type(type: GObject.GType): void;

        // Virtual methods
        vfunc_allocate(box: ActorBox): void;

        vfunc_apply_transform(matrix: Graphene.Matrix): void;

        vfunc_button_press_event(event: Event): boolean;

        vfunc_button_release_event(event: Event): boolean;

        vfunc_calculate_resource_scale(phase: number): number;

        vfunc_captured_event(event: Event): boolean;

        vfunc_child_added(child: Actor): void;

        vfunc_child_removed(child: Actor): void;

        vfunc_destroy(): void;

        vfunc_enter_event(event: Event): boolean;

        vfunc_event(event: Event): boolean;

        vfunc_get_accessible(): Atk.Object;

        vfunc_get_paint_volume(volume: PaintVolume): boolean;

        vfunc_get_preferred_height(for_width: number): [number, number];

        vfunc_get_preferred_width(for_height: number): [number, number];

        vfunc_has_overlaps(): boolean;

        vfunc_hide(): void;

        vfunc_hide_all(): void;

        vfunc_key_focus_in(): void;

        vfunc_key_focus_out(): void;

        vfunc_key_press_event(event: Event): boolean;

        vfunc_key_release_event(event: Event): boolean;

        vfunc_leave_event(event: Event): boolean;

        vfunc_map(): void;

        vfunc_motion_event(event: Event): boolean;

        vfunc_paint(paint_context: PaintContext): void;

        vfunc_paint_node(root: PaintNode, paint_context: PaintContext): void;

        vfunc_parent_set(old_parent: Actor): void;

        vfunc_pick(pick_context: PickContext): void;

        vfunc_queue_relayout(): void;

        vfunc_realize(): void;

        vfunc_resource_scale_changed(): void;

        vfunc_scroll_event(event: Event): boolean;

        vfunc_show(): void;

        vfunc_touch_event(event: Event): boolean;

        vfunc_unmap(): void;

        vfunc_unrealize(): void;

        // Methods
        add_accessible_state(state: Atk.StateType): void;

        add_action(action: Action): void;

        add_action_full(name: string, phase: EventPhase, action: Action): void;

        add_action_with_name(name: string, action: Action): void;

        add_child(child: Actor): void;

        add_constraint(constraint: Constraint): void;

        add_constraint_with_name(name: string, constraint: Constraint): void;

        add_effect(effect: Effect): void;

        add_effect_with_name(name: string, effect: Effect): void;

        add_transition(name: string, transition: Transition): void;

        allocate(box: ActorBox): void;

        allocate_align_fill(box: ActorBox, x_align: number, y_align: number, x_fill: boolean, y_fill: boolean): void;

        allocate_available_size(x: number, y: number, available_width: number, available_height: number): void;

        allocate_preferred_size(x: number, y: number): void;

        apply_relative_transform_to_point(ancestor: Actor | null, point: Graphene.Point3D): Graphene.Point3D;

        apply_transform_to_point(point: Graphene.Point3D): Graphene.Point3D;

        bind_model(model: Gio.ListModel | null, create_child_func: ActorCreateChildFunc): void;

        clear_actions(): void;

        clear_constraints(): void;

        clear_effects(): void;

        contains(descendant: Actor): boolean;

        continue_paint(paint_context: PaintContext): void;

        continue_pick(pick_context: PickContext): void;

        create_pango_context(): Pango.Context;

        create_pango_layout(text: string | null): Pango.Layout;

        create_texture_paint_node(texture: Cogl.Texture): PaintNode;

        destroy(): void;

        destroy_all_children(): void;

        event(event: Event, capture: boolean): boolean;

        get_abs_allocation_vertices(): Graphene.Point3D[];

        get_accessible(): Atk.Object;

        get_accessible_name(): string;

        get_accessible_role(): Atk.Role;

        get_action(name: string): Action | null;

        get_actions(): Action[];

        get_allocation_box(): ActorBox;

        get_background_color(): Cogl.Color;

        get_child_at_index(index_: number): Actor | null;

        get_child_transform(): Graphene.Matrix;

        get_children(): Actor[];

        get_clip(): [number, number, number, number];

        get_clip_to_allocation(): boolean;

        get_color_state(): ColorState;

        get_constraint(name: string): Constraint | null;

        get_constraints(): Constraint[];

        get_content(): B | null;

        get_content_box(): ActorBox;

        get_content_gravity(): ContentGravity;

        get_content_repeat(): ContentRepeat;

        get_content_scaling_filters(): [ScalingFilter | null, ScalingFilter | null];

        get_context(): Context;

        get_cursor_type(): CursorType;

        get_easing_delay(): number;

        get_easing_duration(): number;

        get_easing_mode(): AnimationMode;

        get_effect(name: string): Effect | null;

        get_effects(): Effect[];

        get_first_child(): Actor | null;

        get_fixed_position(): [boolean, number, number];

        get_fixed_position_set(): boolean;

        get_height(): number;

        get_last_child(): Actor | null;

        get_layout_manager(): A | null;

        get_margin(): Margin;

        get_margin_bottom(): number;

        get_margin_left(): number;

        get_margin_right(): number;

        get_margin_top(): number;

        get_n_children(): number;

        get_name(): string | null;

        get_next_sibling(): Actor | null;

        get_offscreen_redirect(): OffscreenRedirect;

        get_opacity(): number;

        get_opacity_override(): number;

        get_paint_box(): [boolean, ActorBox];

        get_paint_opacity(): number;

        get_paint_visibility(): boolean;

        get_paint_volume(): PaintVolume | null;

        get_pango_context(): Pango.Context;

        get_parent(): Actor | null;

        get_pivot_point(): [number, number];

        get_pivot_point_z(): number;

        get_position(): [number, number];

        get_preferred_height(for_width: number): [number, number];

        get_preferred_size(): [number, number, number, number];

        get_preferred_width(for_height: number): [number, number];

        get_previous_sibling(): Actor | null;

        get_reactive(): boolean;

        get_real_resource_scale(): number;

        get_request_mode(): RequestMode;

        get_resource_scale(): number;

        get_rotation_angle(axis: RotateAxis): number;

        get_scale(): [number, number];

        get_scale_z(): number;

        get_size(): [number, number];

        get_stage(): Stage;

        get_text_direction(): TextDirection;

        get_transform(): Graphene.Matrix;

        get_transformed_extents(): Graphene.Rect;

        get_transformed_paint_volume(relative_to_ancestor: Actor): PaintVolume | null;

        get_transformed_position(): [number, number];

        get_transformed_size(): [number, number];

        get_transition(name: string): Transition | null;

        get_translation(): [number, number, number];

        get_width(): number;

        get_x(): number;

        get_x_align(): ActorAlign;

        get_x_expand(): boolean;

        get_y(): number;

        get_y_align(): ActorAlign;

        get_y_expand(): boolean;

        get_z_position(): number;

        grab_key_focus(): void;

        has_actions(): boolean;

        has_allocation(): boolean;

        has_constraints(): boolean;

        has_effects(): boolean;

        has_key_focus(): boolean;

        has_mapped_clones(): boolean;

        has_overlaps(): boolean;

        hide(): void;

        inhibit_culling(): void;

        insert_child_above(child: Actor, sibling: Actor | null): void;

        insert_child_at_index(child: Actor, index_: number): void;

        insert_child_below(child: Actor, sibling: Actor | null): void;

        invalidate_paint_volume(): void;

        invalidate_transform(): void;

        is_in_clone_paint(): boolean;

        is_mapped(): boolean;

        is_no_layout(): boolean;

        is_realized(): boolean;

        is_rotated(): boolean;

        is_scaled(): boolean;

        is_visible(): boolean;

        map(): void;

        move_by(dx: number, dy: number): void;

        needs_expand(orientation: Orientation): boolean;

        paint(paint_context: PaintContext): void;

        peek_stage_views(): StageView[];

        pick(pick_context: PickContext): void;

        pick_box(pick_context: PickContext, box: ActorBox): void;

        queue_redraw(): void;

        queue_redraw_with_clip(clip: Mtk.Rectangle | null): void;

        queue_relayout(): void;

        realize(): void;

        remove_accessible_state(state: Atk.StateType): void;

        remove_action(action: Action): void;

        remove_action_by_name(name: string): void;

        remove_all_children(): void;

        remove_all_transitions(): void;

        remove_child(child: Actor): void;

        remove_clip(): void;

        remove_constraint(constraint: Constraint): void;

        remove_constraint_by_name(name: string): void;

        remove_effect(effect: Effect): void;

        remove_effect_by_name(name: string): void;

        remove_transition(name: string): void;

        replace_child(old_child: Actor, new_child: Actor): void;

        restore_easing_state(): void;

        save_easing_state(): void;

        set_accessible(accessible: Atk.Object): void;

        set_accessible_name(name: string | null): void;

        set_accessible_role(role: Atk.Role): void;

        set_allocation(box: ActorBox): void;

        set_background_color(color: Cogl.Color | null): void;

        set_child_above_sibling(child: Actor, sibling: Actor | null): void;

        set_child_at_index(child: Actor, index_: number): void;

        set_child_below_sibling(child: Actor, sibling: Actor | null): void;

        set_child_transform(transform: Graphene.Matrix | null): void;

        set_clip(xoff: number, yoff: number, width: number, height: number): void;

        set_clip_to_allocation(clip_set: boolean): void;

        set_color_state(color_state: ColorState): void;

        set_content(content: B | null): void;

        set_content_gravity(gravity: ContentGravity): void;

        set_content_repeat(repeat: ContentRepeat): void;

        set_content_scaling_filters(min_filter: ScalingFilter, mag_filter: ScalingFilter): void;

        set_cursor_type(cursor_type: CursorType): void;

        set_easing_delay(msecs: number): void;

        set_easing_duration(msecs: number): void;

        set_easing_mode(mode: AnimationMode): void;

        set_fixed_position_set(is_set: boolean): void;

        set_height(height: number): void;

        set_layout_manager(manager: A | null): void;

        set_margin(margin: Margin): void;

        set_margin_bottom(margin: number): void;

        set_margin_left(margin: number): void;

        set_margin_right(margin: number): void;

        set_margin_top(margin: number): void;

        set_name(name: string | null): void;

        set_no_layout(no_layout: boolean): void;

        set_offscreen_redirect(redirect: OffscreenRedirect): void;

        set_opacity(opacity: number): void;

        set_opacity_override(opacity: number): void;

        set_pivot_point(pivot_x: number, pivot_y: number): void;

        set_pivot_point_z(pivot_z: number): void;

        set_position(x: number, y: number): void;

        set_reactive(reactive: boolean): void;

        set_request_mode(mode: RequestMode): void;

        set_rotation_angle(axis: RotateAxis, angle: number): void;

        set_scale(scale_x: number, scale_y: number): void;

        set_scale_z(scale_z: number): void;

        set_size(width: number, height: number): void;

        set_text_direction(text_dir: TextDirection): void;

        set_transform(transform: Graphene.Matrix | null): void;

        set_translation(translate_x: number, translate_y: number, translate_z: number): void;

        set_width(width: number): void;

        set_x(x: number): void;

        set_x_align(x_align: ActorAlign): void;

        set_x_expand(expand: boolean): void;

        set_y(y: number): void;

        set_y_align(y_align: ActorAlign): void;

        set_y_expand(expand: boolean): void;

        set_z_position(z_position: number): void;

        should_pick(pick_context: PickContext): boolean;

        show(): void;

        transform_stage_point(x: number, y: number): [boolean, number, number];

        uninhibit_culling(): void;

        unmap(): void;

        unrealize(): void;

        unset_color_state(): void;

        find_property(property_name: string): GObject.ParamSpec;

        get_actor(): Actor;

        get_initial_state(property_name: string, value: GObject.Value | any): void;

        interpolate_value(property_name: string, interval: Interval, progress: number): [boolean, unknown];

        set_final_state(property_name: string, value: GObject.Value | any): void;

        vfunc_find_property(property_name: string): GObject.ParamSpec;

        vfunc_get_actor(): Actor;

        vfunc_get_initial_state(property_name: string, value: unknown): void;

        vfunc_interpolate_value(property_name: string, interval: Interval, progress: number): [boolean, GObject.Value | any];

        vfunc_set_final_state(property_name: string, value: unknown): void;
    }


    namespace ActorAccessible {
        // Signal signatures
        interface SignalSignatures extends Atk.GObjectAccessible.SignalSignatures, Atk.Component.SignalSignatures {
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
        interface ConstructorProps extends Atk.GObjectAccessible.ConstructorProps, Atk.Component.ConstructorProps {}
    }

    class ActorAccessible extends Atk.GObjectAccessible implements Atk.Component {
        static $gtype: GObject.GType<ActorAccessible>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ActorAccessible.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ActorAccessible.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ActorAccessible.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ActorAccessible.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ActorAccessible.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ActorAccessible.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ActorAccessible.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ActorAccessible.SignalSignatures[K]>): void;

        contains(x: number, y: number, coord_type: Atk.CoordType): boolean;

        get_alpha(): number;

        get_extents(coord_type: Atk.CoordType): [number, number, number, number];

        get_layer(): Atk.Layer;

        get_mdi_zorder(): number;

        get_position(coord_type: Atk.CoordType): [number, number];

        get_size(): [number, number];

        grab_focus(): boolean;

        ref_accessible_at_point(x: number, y: number, coord_type: Atk.CoordType): Atk.Object | null;

        remove_focus_handler(handler_id: number): void;

        scroll_to(type: Atk.ScrollType): boolean;

        scroll_to_point(coords: Atk.CoordType, x: number, y: number): boolean;

        set_extents(x: number, y: number, width: number, height: number, coord_type: Atk.CoordType): boolean;

        set_position(x: number, y: number, coord_type: Atk.CoordType): boolean;

        set_size(width: number, height: number): boolean;

        vfunc_bounds_changed(bounds: Atk.Rectangle): void;

        vfunc_contains(x: number, y: number, coord_type: Atk.CoordType): boolean;

        vfunc_get_alpha(): number;

        vfunc_get_extents(coord_type: Atk.CoordType): [number, number, number, number];

        vfunc_get_layer(): Atk.Layer;

        vfunc_get_mdi_zorder(): number;

        vfunc_get_position(coord_type: Atk.CoordType): [number, number];

        vfunc_get_size(): [number, number];

        vfunc_grab_focus(): boolean;

        vfunc_ref_accessible_at_point(x: number, y: number, coord_type: Atk.CoordType): Atk.Object | null;

        vfunc_remove_focus_handler(handler_id: number): void;

        vfunc_scroll_to(type: Atk.ScrollType): boolean;

        vfunc_scroll_to_point(coords: Atk.CoordType, x: number, y: number): boolean;

        vfunc_set_extents(x: number, y: number, width: number, height: number, coord_type: Atk.CoordType): boolean;

        vfunc_set_position(x: number, y: number, coord_type: Atk.CoordType): boolean;

        vfunc_set_size(width: number, height: number): boolean;
    }


    namespace ActorMeta {
        // Signal signatures
        interface SignalSignatures extends GObject.InitiallyUnowned.SignalSignatures {
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.InitiallyUnowned.ConstructorProps {
            actor: Actor;
            enabled: boolean;
            name: string;
        }
    }

    abstract class ActorMeta extends GObject.InitiallyUnowned {
        static $gtype: GObject.GType<ActorMeta>;

        // Properties
        get actor(): Actor;

        get enabled(): boolean;
        set enabled(val: boolean);

        get name(): string;
        set name(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ActorMeta.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ActorMeta.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ActorMeta.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ActorMeta.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ActorMeta.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ActorMeta.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ActorMeta.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ActorMeta.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_set_actor(actor: Actor | null): void;

        vfunc_set_enabled(is_enabled: boolean): void;

        // Methods
        get_actor(): Actor;

        get_enabled(): boolean;

        get_name(): string;

        set_enabled(is_enabled: boolean): void;

        set_name(name: string): void;
    }


    namespace ActorNode {
        // Signal signatures
        interface SignalSignatures extends PaintNode.SignalSignatures {}
    }

    class ActorNode extends PaintNode {
        static $gtype: GObject.GType<ActorNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](actor: Actor, opacity: number): ActorNode;

        // Signals
        /** @signal */
        connect<K extends keyof ActorNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ActorNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ActorNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ActorNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ActorNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ActorNode.SignalSignatures[K]>): void;
    }


    namespace AlignConstraint {
        // Signal signatures
        interface SignalSignatures extends Constraint.SignalSignatures {
            "notify::align-axis": (pspec: GObject.ParamSpec) => void;
            "notify::factor": (pspec: GObject.ParamSpec) => void;
            "notify::pivot-point": (pspec: GObject.ParamSpec) => void;
            "notify::source": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Constraint.ConstructorProps {
            align_axis: AlignAxis;
            alignAxis: AlignAxis;
            factor: number;
            pivot_point: Graphene.Point;
            pivotPoint: Graphene.Point;
            source: Actor;
        }
    }

    class AlignConstraint extends Constraint {
        static $gtype: GObject.GType<AlignConstraint>;

        // Properties
        get align_axis(): AlignAxis;
        set align_axis(val: AlignAxis);

        get alignAxis(): AlignAxis;
        set alignAxis(val: AlignAxis);

        get factor(): number;
        set factor(val: number);

        get pivot_point(): Graphene.Point;
        set pivot_point(val: Graphene.Point);

        get pivotPoint(): Graphene.Point;
        set pivotPoint(val: Graphene.Point);

        get source(): Actor;
        set source(val: Actor);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AlignConstraint.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AlignConstraint.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](source: Actor | null, axis: AlignAxis, factor: number): AlignConstraint;

        // Signals
        /** @signal */
        connect<K extends keyof AlignConstraint.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AlignConstraint.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AlignConstraint.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AlignConstraint.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AlignConstraint.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AlignConstraint.SignalSignatures[K]>): void;

        // Methods
        get_align_axis(): AlignAxis;

        get_factor(): number;

        get_pivot_point(): Graphene.Point;

        get_source(): Actor;

        set_align_axis(axis: AlignAxis): void;

        set_factor(factor: number): void;

        set_pivot_point(pivot_point: Graphene.Point): void;

        set_source(source: Actor | null): void;
    }


    namespace Backend {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "font-changed": () => void;
            /** @signal */
            "resolution-changed": () => void;
            /** @signal */
            "settings-changed": () => void;
            "notify::context": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            context: Context;
        }
    }

    abstract class Backend extends GObject.Object {
        static $gtype: GObject.GType<Backend>;

        // Properties
        get context(): Context;

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
        get_cogl_context(): Cogl.Context;

        get_cursor(cursor_type: CursorType): Cursor;

        get_default_seat(): Seat;

        get_graphics_recovery_context(): GraphicsRecoveryContext;

        get_input_method(): InputMethod;

        get_key_focus(stage: Stage): KeyFocus;

        get_pointer_sprite(stage: Stage): Sprite;

        get_resolution(): number;

        get_sprite(stage: Stage, for_event: Event): Sprite | null;

        is_recovering(): boolean;

        set_input_method(method: InputMethod | null): void;
    }


    namespace BinLayout {
        // Signal signatures
        interface SignalSignatures extends LayoutManager.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends LayoutManager.ConstructorProps {}
    }

    class BinLayout extends LayoutManager {
        static $gtype: GObject.GType<BinLayout>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: BinLayout.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<BinLayout.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): BinLayout;

        // Signals
        /** @signal */
        connect<K extends keyof BinLayout.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BinLayout.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BinLayout.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BinLayout.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BinLayout.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BinLayout.SignalSignatures[K]>): void;
    }


    namespace BindConstraint {
        // Signal signatures
        interface SignalSignatures extends Constraint.SignalSignatures {
            "notify::coordinate": (pspec: GObject.ParamSpec) => void;
            "notify::offset": (pspec: GObject.ParamSpec) => void;
            "notify::source": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Constraint.ConstructorProps {
            coordinate: BindCoordinate;
            offset: number;
            source: Actor;
        }
    }

    class BindConstraint extends Constraint {
        static $gtype: GObject.GType<BindConstraint>;

        // Properties
        get coordinate(): BindCoordinate;
        set coordinate(val: BindCoordinate);

        get offset(): number;
        set offset(val: number);

        get source(): Actor;
        set source(val: Actor);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: BindConstraint.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<BindConstraint.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](source: Actor | null, coordinate: BindCoordinate, offset: number): BindConstraint;

        // Signals
        /** @signal */
        connect<K extends keyof BindConstraint.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BindConstraint.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BindConstraint.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BindConstraint.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BindConstraint.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BindConstraint.SignalSignatures[K]>): void;

        // Methods
        get_coordinate(): BindCoordinate;

        get_offset(): number;

        get_source(): Actor;

        set_coordinate(coordinate: BindCoordinate): void;

        set_offset(offset: number): void;

        set_source(source: Actor | null): void;
    }


    namespace BindingPool {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            name: string;
        }
    }

    class BindingPool extends GObject.Object {
        static $gtype: GObject.GType<BindingPool>;

        // Properties
        get name(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: BindingPool.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<BindingPool.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](name: string): BindingPool;

        // Signals
        /** @signal */
        connect<K extends keyof BindingPool.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BindingPool.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BindingPool.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BindingPool.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BindingPool.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BindingPool.SignalSignatures[K]>): void;

        // Static methods
        static find(name: string): BindingPool;

        static get_for_class(klass: null): BindingPool;

        // Methods
        activate(key_val: number, modifiers: ModifierType, gobject: GObject.Object): boolean;

        block_action(action_name: string): void;

        find_action(key_val: number, modifiers: ModifierType): string;

        install_action(action_name: string, key_val: number, modifiers: ModifierType, callback: GObject.Callback): void;

        install_closure(action_name: string, key_val: number, modifiers: ModifierType, closure: GObject.Closure): void;

        override_action(key_val: number, modifiers: ModifierType, callback: GObject.Callback): void;

        override_closure(key_val: number, modifiers: ModifierType, closure: GObject.Closure): void;

        remove_action(key_val: number, modifiers: ModifierType): void;

        unblock_action(action_name: string): void;
    }


    namespace BlitNode {
        // Signal signatures
        interface SignalSignatures extends PaintNode.SignalSignatures {}
    }

    class BlitNode extends PaintNode {
        static $gtype: GObject.GType<BlitNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](src: Cogl.Framebuffer): BlitNode;

        // Signals
        /** @signal */
        connect<K extends keyof BlitNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BlitNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BlitNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BlitNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BlitNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BlitNode.SignalSignatures[K]>): void;

        // Methods
        add_blit_rectangle(src_x: number, src_y: number, dst_x: number, dst_y: number, width: number, height: number): void;
    }


    namespace BlurEffect {
        // Signal signatures
        interface SignalSignatures extends OffscreenEffect.SignalSignatures {
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends OffscreenEffect.ConstructorProps {}
    }

    class BlurEffect extends OffscreenEffect {
        static $gtype: GObject.GType<BlurEffect>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: BlurEffect.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<BlurEffect.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): BlurEffect;

        // Signals
        /** @signal */
        connect<K extends keyof BlurEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BlurEffect.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BlurEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BlurEffect.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BlurEffect.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BlurEffect.SignalSignatures[K]>): void;
    }


    namespace BlurNode {
        // Signal signatures
        interface SignalSignatures extends LayerNode.SignalSignatures {}
    }

    class BlurNode extends LayerNode {
        static $gtype: GObject.GType<BlurNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](width: number, height: number, radius: number): BlurNode;

        // Signals
        /** @signal */
        connect<K extends keyof BlurNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BlurNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BlurNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BlurNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BlurNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BlurNode.SignalSignatures[K]>): void;
    }


    namespace BoxLayout {
        // Signal signatures
        interface SignalSignatures extends LayoutManager.SignalSignatures {
            "notify::homogeneous": (pspec: GObject.ParamSpec) => void;
            "notify::orientation": (pspec: GObject.ParamSpec) => void;
            "notify::spacing": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends LayoutManager.ConstructorProps {
            homogeneous: boolean;
            orientation: Orientation;
            spacing: number;
        }
    }

    class BoxLayout extends LayoutManager {
        static $gtype: GObject.GType<BoxLayout>;

        // Properties
        get homogeneous(): boolean;
        set homogeneous(val: boolean);

        get orientation(): Orientation;
        set orientation(val: Orientation);

        get spacing(): number;
        set spacing(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: BoxLayout.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<BoxLayout.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): BoxLayout;

        // Signals
        /** @signal */
        connect<K extends keyof BoxLayout.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BoxLayout.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BoxLayout.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BoxLayout.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BoxLayout.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BoxLayout.SignalSignatures[K]>): void;

        // Methods
        get_homogeneous(): boolean;

        get_orientation(): Orientation;

        get_spacing(): number;

        set_homogeneous(homogeneous: boolean): void;

        set_orientation(orientation: Orientation): void;

        set_spacing(spacing: number): void;
    }


    namespace BrightnessContrastEffect {
        // Signal signatures
        interface SignalSignatures extends OffscreenEffect.SignalSignatures {
            "notify::brightness": (pspec: GObject.ParamSpec) => void;
            "notify::contrast": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends OffscreenEffect.ConstructorProps {
            brightness: Cogl.Color;
            contrast: Cogl.Color;
        }
    }

    class BrightnessContrastEffect extends OffscreenEffect {
        static $gtype: GObject.GType<BrightnessContrastEffect>;

        // Properties
        get brightness(): Cogl.Color;
        set brightness(val: Cogl.Color);

        get contrast(): Cogl.Color;
        set contrast(val: Cogl.Color);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: BrightnessContrastEffect.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<BrightnessContrastEffect.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): BrightnessContrastEffect;

        // Signals
        /** @signal */
        connect<K extends keyof BrightnessContrastEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BrightnessContrastEffect.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BrightnessContrastEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BrightnessContrastEffect.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BrightnessContrastEffect.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BrightnessContrastEffect.SignalSignatures[K]>): void;

        // Methods
        get_brightness(): [number, number, number];

        get_contrast(): [number, number, number];

        set_brightness(brightness: number): void;

        set_brightness_full(red: number, green: number, blue: number): void;

        set_contrast(contrast: number): void;

        set_contrast_full(red: number, green: number, blue: number): void;
    }


    namespace ClickGesture {
        // Signal signatures
        interface SignalSignatures extends PressGesture.SignalSignatures {
            "notify::n-clicks-required": (pspec: GObject.ParamSpec) => void;
            "notify::recognize-on-press": (pspec: GObject.ParamSpec) => void;
            "notify::cancel-threshold": (pspec: GObject.ParamSpec) => void;
            "notify::long-press-duration-ms": (pspec: GObject.ParamSpec) => void;
            "notify::pressed": (pspec: GObject.ParamSpec) => void;
            "notify::required-button": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends PressGesture.ConstructorProps {
            n_clicks_required: number;
            nClicksRequired: number;
            recognize_on_press: boolean;
            recognizeOnPress: boolean;
        }
    }

    class ClickGesture extends PressGesture {
        static $gtype: GObject.GType<ClickGesture>;

        // Properties
        get n_clicks_required(): number;
        set n_clicks_required(val: number);

        get nClicksRequired(): number;
        set nClicksRequired(val: number);

        get recognize_on_press(): boolean;
        set recognize_on_press(val: boolean);

        get recognizeOnPress(): boolean;
        set recognizeOnPress(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ClickGesture.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ClickGesture.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): ClickGesture;

        // Signals
        /** @signal */
        connect<K extends keyof ClickGesture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ClickGesture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ClickGesture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ClickGesture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ClickGesture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ClickGesture.SignalSignatures[K]>): void;

        // Methods
        get_n_clicks_required(): number;

        get_recognize_on_press(): boolean;

        set_n_clicks_required(n_clicks_required: number): void;

        set_recognize_on_press(recognize_on_press: boolean): void;
    }


    namespace ClipNode {
        // Signal signatures
        interface SignalSignatures extends PaintNode.SignalSignatures {}
    }

    class ClipNode extends PaintNode {
        static $gtype: GObject.GType<ClipNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](): ClipNode;

        // Signals
        /** @signal */
        connect<K extends keyof ClipNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ClipNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ClipNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ClipNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ClipNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ClipNode.SignalSignatures[K]>): void;
    }


    namespace Clone {
        // Signal signatures
        interface SignalSignatures extends Actor.SignalSignatures {
            "notify::source": (pspec: GObject.ParamSpec) => void;
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
        interface ConstructorProps<A extends Actor = Actor> extends Actor.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Animatable.ConstructorProps {
            source: A;
        }
    }

    class Clone<A extends Actor = Actor> extends Actor implements Atk.ImplementorIface, Animatable {
        static $gtype: GObject.GType<Clone>;

        // Properties
        get source(): A;
        set source(val: A);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Clone.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Clone.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](source: Actor): Clone;

        // Conflicted with Clutter.Actor.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof Clone.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Clone.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Clone.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Clone.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Clone.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Clone.SignalSignatures[K]>): void;

        // Methods
        get_source(): A;

        set_source(source: A | null): void;

        find_property(property_name: string): GObject.ParamSpec;

        get_actor(): Actor;

        get_initial_state(property_name: string, value: GObject.Value | any): void;

        interpolate_value(property_name: string, interval: Interval, progress: number): [boolean, unknown];

        set_final_state(property_name: string, value: GObject.Value | any): void;

        vfunc_find_property(property_name: string): GObject.ParamSpec;

        vfunc_get_actor(): Actor;

        vfunc_get_initial_state(property_name: string, value: unknown): void;

        vfunc_interpolate_value(property_name: string, interval: Interval, progress: number): [boolean, GObject.Value | any];

        vfunc_set_final_state(property_name: string, value: unknown): void;
    }


    namespace ColorNode {
        // Signal signatures
        interface SignalSignatures extends PipelineNode.SignalSignatures {}
    }

    class ColorNode extends PipelineNode {
        static $gtype: GObject.GType<ColorNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](color: Cogl.Color | null): ColorNode;

        // Conflicted with Clutter.PipelineNode.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof ColorNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorNode.SignalSignatures[K]>): void;
    }


    namespace ColorOp {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class ColorOp extends GObject.Object {
        static $gtype: GObject.GType<ColorOp>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorOp.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorOp.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ColorOp.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOp.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorOp.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOp.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorOp.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorOp.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_do_transform(data: number, n_samples: number): void;

        vfunc_do_transform_one(input: number): number;

        vfunc_get_clamps_input(): boolean;

        vfunc_get_clamps_output(): boolean;

        vfunc_get_transforms_alpha(): boolean;

        vfunc_to_string(): string;

        // Methods
        ["3d_lut_get_data"](out_size: number, out_data: number): void;

        can_lower_to_3d_lut(): boolean;

        can_lower_to_curve_1d(n_samples: bigint | number): boolean;

        can_lower_to_matrix_4x4(): boolean;

        curve_1d_get_data(out_size: bigint | number, out_r: number, out_g: number, out_b: number, out_a: number): void;

        do_transform(data: number, n_samples: bigint | number): void;

        do_transform_one(input: number): number;

        gamma_power_get_power(): number;

        get_clamps_input(): boolean;

        get_clamps_output(): boolean;

        get_transforms_alpha(): boolean;

        lower_to_3d_lut(size: number): ColorOp | null;

        lower_to_curve_1d(n_samples: bigint | number): ColorOp | null;

        lower_to_matrix_4x4(): ColorOp | null;

        matrix_4x4_get_matrix(): Graphene.Matrix;

        multiply_get_value(): number;

        srgb_piecewise_eotf_get_unit_range_only(): boolean;

        srgb_piecewise_inv_eotf_get_unit_range_only(): boolean;

        to_string(): string;

        try_combine(b: ColorOp): ColorOp | null;

        ycbcr_matrix_get_coeffs(): YcbcrCoefficients;

        ycbcr_matrix_get_matrix(): Graphene.Matrix;
    }


    namespace ColorOp3DLut {
        // Signal signatures
        interface SignalSignatures extends ColorOp.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends ColorOp.ConstructorProps {}
    }

    class ColorOp3DLut extends ColorOp {
        static $gtype: GObject.GType<ColorOp3DLut>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorOp3DLut.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorOp3DLut.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](size: number, data: number): ColorOp3DLut;

        // Signals
        /** @signal */
        connect<K extends keyof ColorOp3DLut.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOp3DLut.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorOp3DLut.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOp3DLut.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorOp3DLut.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorOp3DLut.SignalSignatures[K]>): void;
    }


    namespace ColorOpClampUnit {
        // Signal signatures
        interface SignalSignatures extends ColorOp.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends ColorOp.ConstructorProps {}
    }

    class ColorOpClampUnit extends ColorOp {
        static $gtype: GObject.GType<ColorOpClampUnit>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorOpClampUnit.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorOpClampUnit.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): ColorOpClampUnit;

        // Signals
        /** @signal */
        connect<K extends keyof ColorOpClampUnit.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpClampUnit.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorOpClampUnit.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpClampUnit.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorOpClampUnit.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorOpClampUnit.SignalSignatures[K]>): void;
    }


    namespace ColorOpCurve1D {
        // Signal signatures
        interface SignalSignatures extends ColorOp.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends ColorOp.ConstructorProps {}
    }

    class ColorOpCurve1D extends ColorOp {
        static $gtype: GObject.GType<ColorOpCurve1D>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorOpCurve1D.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorOpCurve1D.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](size: bigint | number, r: number, g: number, b: number, a: number): ColorOpCurve1D;

        static new_rgb(size: bigint | number, v: number): ColorOpCurve1D;

        // Signals
        /** @signal */
        connect<K extends keyof ColorOpCurve1D.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpCurve1D.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorOpCurve1D.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpCurve1D.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorOpCurve1D.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorOpCurve1D.SignalSignatures[K]>): void;
    }


    namespace ColorOpGammaPower {
        // Signal signatures
        interface SignalSignatures extends ColorOp.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends ColorOp.ConstructorProps {}
    }

    class ColorOpGammaPower extends ColorOp {
        static $gtype: GObject.GType<ColorOpGammaPower>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorOpGammaPower.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorOpGammaPower.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](power: number): ColorOpGammaPower;

        // Signals
        /** @signal */
        connect<K extends keyof ColorOpGammaPower.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpGammaPower.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorOpGammaPower.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpGammaPower.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorOpGammaPower.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorOpGammaPower.SignalSignatures[K]>): void;
    }


    namespace ColorOpMatrix4x4 {
        // Signal signatures
        interface SignalSignatures extends ColorOp.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends ColorOp.ConstructorProps {}
    }

    class ColorOpMatrix4x4 extends ColorOp {
        static $gtype: GObject.GType<ColorOpMatrix4x4>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorOpMatrix4x4.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorOpMatrix4x4.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](matrix: Graphene.Matrix): ColorOpMatrix4x4;

        // Signals
        /** @signal */
        connect<K extends keyof ColorOpMatrix4x4.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpMatrix4x4.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorOpMatrix4x4.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpMatrix4x4.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorOpMatrix4x4.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorOpMatrix4x4.SignalSignatures[K]>): void;
    }


    namespace ColorOpMultiply {
        // Signal signatures
        interface SignalSignatures extends ColorOp.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends ColorOp.ConstructorProps {}
    }

    class ColorOpMultiply extends ColorOp {
        static $gtype: GObject.GType<ColorOpMultiply>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorOpMultiply.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorOpMultiply.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](value: number): ColorOpMultiply;

        // Signals
        /** @signal */
        connect<K extends keyof ColorOpMultiply.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpMultiply.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorOpMultiply.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpMultiply.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorOpMultiply.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorOpMultiply.SignalSignatures[K]>): void;
    }


    namespace ColorOpPqEotf {
        // Signal signatures
        interface SignalSignatures extends ColorOp.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends ColorOp.ConstructorProps {}
    }

    class ColorOpPqEotf extends ColorOp {
        static $gtype: GObject.GType<ColorOpPqEotf>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorOpPqEotf.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorOpPqEotf.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): ColorOpPqEotf;

        // Signals
        /** @signal */
        connect<K extends keyof ColorOpPqEotf.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpPqEotf.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorOpPqEotf.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpPqEotf.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorOpPqEotf.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorOpPqEotf.SignalSignatures[K]>): void;
    }


    namespace ColorOpPqInvEotf {
        // Signal signatures
        interface SignalSignatures extends ColorOp.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends ColorOp.ConstructorProps {}
    }

    class ColorOpPqInvEotf extends ColorOp {
        static $gtype: GObject.GType<ColorOpPqInvEotf>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorOpPqInvEotf.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorOpPqInvEotf.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): ColorOpPqInvEotf;

        // Signals
        /** @signal */
        connect<K extends keyof ColorOpPqInvEotf.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpPqInvEotf.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorOpPqInvEotf.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpPqInvEotf.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorOpPqInvEotf.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorOpPqInvEotf.SignalSignatures[K]>): void;
    }


    namespace ColorOpPremultiply {
        // Signal signatures
        interface SignalSignatures extends ColorOp.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends ColorOp.ConstructorProps {}
    }

    class ColorOpPremultiply extends ColorOp {
        static $gtype: GObject.GType<ColorOpPremultiply>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorOpPremultiply.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorOpPremultiply.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): ColorOpPremultiply;

        // Signals
        /** @signal */
        connect<K extends keyof ColorOpPremultiply.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpPremultiply.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorOpPremultiply.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpPremultiply.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorOpPremultiply.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorOpPremultiply.SignalSignatures[K]>): void;
    }


    namespace ColorOpSrgbPiecewiseEotf {
        // Signal signatures
        interface SignalSignatures extends ColorOp.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends ColorOp.ConstructorProps {}
    }

    class ColorOpSrgbPiecewiseEotf extends ColorOp {
        static $gtype: GObject.GType<ColorOpSrgbPiecewiseEotf>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorOpSrgbPiecewiseEotf.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorOpSrgbPiecewiseEotf.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](unit_range_only: boolean): ColorOpSrgbPiecewiseEotf;

        // Signals
        /** @signal */
        connect<K extends keyof ColorOpSrgbPiecewiseEotf.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpSrgbPiecewiseEotf.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorOpSrgbPiecewiseEotf.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpSrgbPiecewiseEotf.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorOpSrgbPiecewiseEotf.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorOpSrgbPiecewiseEotf.SignalSignatures[K]>): void;
    }


    namespace ColorOpSrgbPiecewiseInvEotf {
        // Signal signatures
        interface SignalSignatures extends ColorOp.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends ColorOp.ConstructorProps {}
    }

    class ColorOpSrgbPiecewiseInvEotf extends ColorOp {
        static $gtype: GObject.GType<ColorOpSrgbPiecewiseInvEotf>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorOpSrgbPiecewiseInvEotf.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorOpSrgbPiecewiseInvEotf.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](unit_range_only: boolean): ColorOpSrgbPiecewiseInvEotf;

        // Signals
        /** @signal */
        connect<K extends keyof ColorOpSrgbPiecewiseInvEotf.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpSrgbPiecewiseInvEotf.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorOpSrgbPiecewiseInvEotf.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpSrgbPiecewiseInvEotf.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorOpSrgbPiecewiseInvEotf.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorOpSrgbPiecewiseInvEotf.SignalSignatures[K]>): void;
    }


    namespace ColorOpUnpremultiply {
        // Signal signatures
        interface SignalSignatures extends ColorOp.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends ColorOp.ConstructorProps {}
    }

    class ColorOpUnpremultiply extends ColorOp {
        static $gtype: GObject.GType<ColorOpUnpremultiply>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorOpUnpremultiply.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorOpUnpremultiply.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): ColorOpUnpremultiply;

        // Signals
        /** @signal */
        connect<K extends keyof ColorOpUnpremultiply.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpUnpremultiply.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorOpUnpremultiply.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpUnpremultiply.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorOpUnpremultiply.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorOpUnpremultiply.SignalSignatures[K]>): void;
    }


    namespace ColorOpYcbcrMatrix {
        // Signal signatures
        interface SignalSignatures extends ColorOp.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends ColorOp.ConstructorProps {}
    }

    class ColorOpYcbcrMatrix extends ColorOp {
        static $gtype: GObject.GType<ColorOpYcbcrMatrix>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorOpYcbcrMatrix.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorOpYcbcrMatrix.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](coeffs: YcbcrCoefficients, matrix: Graphene.Matrix): ColorOpYcbcrMatrix;

        // Signals
        /** @signal */
        connect<K extends keyof ColorOpYcbcrMatrix.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpYcbcrMatrix.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorOpYcbcrMatrix.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorOpYcbcrMatrix.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorOpYcbcrMatrix.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorOpYcbcrMatrix.SignalSignatures[K]>): void;
    }


    namespace ColorPipeline {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class ColorPipeline extends GObject.Object {
        static $gtype: GObject.GType<ColorPipeline>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorPipeline.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorPipeline.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ColorPipeline.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorPipeline.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorPipeline.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorPipeline.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorPipeline.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorPipeline.SignalSignatures[K]>): void;

        // Static methods
        static shader_needs_color_state(source_color_state: ColorState, target_color_state: ColorState, flags: ColorStateTransformFlags): boolean;

        static shader_set_color_state(cogl_pipeline: Cogl.Pipeline, source_color_state: ColorState, target_color_state: ColorState, flags: ColorStateTransformFlags): void;

        // Methods
        add_op(op: ColorOp): void;

        append(other: ColorPipeline): void;

        combine(): void;

        do_transform(data: number, n_samples: bigint | number): void;

        get_ops(): ColorOp[];

        is_empty(): boolean;

        shader_add_transform(cogl_pipeline: Cogl.Pipeline): void;

        simplify(): void;

        take_op(op: ColorOp): void;

        to_string(): string;
    }


    namespace ColorState {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            destroyed: () => void;
            "notify::context": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            context: Context;
        }
    }

    class ColorState extends GObject.Object {
        static $gtype: GObject.GType<ColorState>;

        // Properties
        get context(): Context;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorState.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorState.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ColorState.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorState.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorState.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorState.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorState.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorState.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_equals(other_color_state: ColorState): boolean;

        vfunc_get_blending(force: boolean): ColorState;

        vfunc_get_luminance(): Luminance;

        vfunc_hash(): number;

        vfunc_required_format(): EncodingRequiredFormat;

        vfunc_to_string(): string;

        // Methods
        equals(other_color_state: ColorState): boolean;

        get_blending(force: boolean): ColorState;

        get_context(): Context;

        get_id(): number;

        get_luminance(): Luminance;

        hash(): number;

        required_format(): EncodingRequiredFormat;

        to_string(): string;
    }


    namespace ColorStateIcc {
        // Signal signatures
        interface SignalSignatures extends ColorState.SignalSignatures {
            "notify::context": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends ColorState.ConstructorProps {}
    }

    class ColorStateIcc extends ColorState {
        static $gtype: GObject.GType<ColorStateIcc>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorStateIcc.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorStateIcc.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](context: Context, icc_bytes: number, icc_length: number): ColorStateIcc;

        // Signals
        /** @signal */
        connect<K extends keyof ColorStateIcc.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorStateIcc.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorStateIcc.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorStateIcc.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorStateIcc.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorStateIcc.SignalSignatures[K]>): void;

        // Methods
        get_file(): Mtk.AnonymousFile;

        get_profile(): null;

        is_linearized(): boolean;
    }


    namespace ColorStateParams {
        // Signal signatures
        interface SignalSignatures extends ColorState.SignalSignatures {
            "notify::context": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends ColorState.ConstructorProps {}
    }

    class ColorStateParams extends ColorState {
        static $gtype: GObject.GType<ColorStateParams>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorStateParams.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorStateParams.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](context: Context, colorspace: Colorspace, transfer_function: TransferFunction): ColorStateParams;

        static new_from_cicp(context: Context, cicp: Cicp): ColorStateParams;

        static new_from_primitives(context: Context, colorimetry: Colorimetry, eotf: EOTF, luminance: Luminance): ColorStateParams;

        static new_full(context: Context, colorspace: Colorspace, transfer_function: TransferFunction, primaries: Primaries, gamma_exp: number, min_lum: number, max_lum: number, ref_lum: number, mastering_max_lum: number): ColorStateParams;

        // Signals
        /** @signal */
        connect<K extends keyof ColorStateParams.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorStateParams.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorStateParams.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorStateParams.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorStateParams.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorStateParams.SignalSignatures[K]>): void;

        // Methods
        get_colorimetry(): Colorimetry;

        get_eotf(): EOTF;

        get_luminance(): Luminance;
    }


    namespace ColorTransform {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class ColorTransform extends GObject.Object {
        static $gtype: GObject.GType<ColorTransform>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorTransform.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorTransform.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ColorTransform.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorTransform.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorTransform.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorTransform.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorTransform.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorTransform.SignalSignatures[K]>): void;
    }


    namespace ColorizeEffect {
        // Signal signatures
        interface SignalSignatures extends OffscreenEffect.SignalSignatures {
            "notify::tint": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends OffscreenEffect.ConstructorProps {
            tint: Cogl.Color;
        }
    }

    class ColorizeEffect extends OffscreenEffect {
        static $gtype: GObject.GType<ColorizeEffect>;

        // Properties
        get tint(): Cogl.Color;
        set tint(val: Cogl.Color);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ColorizeEffect.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ColorizeEffect.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](tint: Cogl.Color): ColorizeEffect;

        // Signals
        /** @signal */
        connect<K extends keyof ColorizeEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorizeEffect.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorizeEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorizeEffect.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorizeEffect.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorizeEffect.SignalSignatures[K]>): void;

        // Methods
        get_tint(): Cogl.Color;

        set_tint(tint: Cogl.Color): void;
    }


    namespace Constraint {
        // Signal signatures
        interface SignalSignatures extends ActorMeta.SignalSignatures {
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends ActorMeta.ConstructorProps {}
    }

    abstract class Constraint extends ActorMeta {
        static $gtype: GObject.GType<Constraint>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Constraint.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Constraint.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Constraint.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Constraint.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Constraint.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Constraint.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Constraint.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Constraint.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_update_allocation(actor: Actor, allocation: ActorBox): void;

        vfunc_update_preferred_size(actor: Actor, direction: Orientation, for_size: number, minimum_size: number, natural_size: number): [number, number];

        // Methods
        update_preferred_size(actor: Actor, direction: Orientation, for_size: number, minimum_size: number, natural_size: number): [number, number];
    }


    namespace Context {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Context extends GObject.Object {
        static $gtype: GObject.GType<Context>;

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
        get_backend(): Backend;

        get_default_color_state(): ColorState;

        get_settings(): Settings;

        get_text_direction(): TextDirection;
    }


    namespace Cursor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "image-changed": () => void;
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::cursor-type": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            color_state: ColorState;
            colorState: ColorState;
            cursor_type: CursorType;
            cursorType: CursorType;
        }
    }

    abstract class Cursor extends GObject.Object {
        static $gtype: GObject.GType<Cursor>;

        // Properties
        set color_state(val: ColorState);

        set colorState(val: ColorState);

        set cursor_type(val: CursorType);

        set cursorType(val: CursorType);

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

        // Virtual methods
        vfunc_get_current_frame_time(): number;

        vfunc_get_data(out_stride: number): number;

        vfunc_get_geometry(width: number, height: number, hot_x: number, hot_y: number): void;

        vfunc_invalidate(): void;

        vfunc_is_animated(): boolean;

        vfunc_prepare_at(best_scale: number, x: number, y: number): void;

        vfunc_tick_frame(): void;

        // Methods
        emit_image_changed(): void;

        get_cursor_type(): CursorType;

        reset_viewport_dst_size(): void;

        set_viewport_dst_size(dst_width: number, dst_height: number): void;
    }


    namespace DeformEffect {
        // Signal signatures
        interface SignalSignatures extends OffscreenEffect.SignalSignatures {
            "notify::back-pipeline": (pspec: GObject.ParamSpec) => void;
            "notify::x-tiles": (pspec: GObject.ParamSpec) => void;
            "notify::y-tiles": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends OffscreenEffect.ConstructorProps {
            back_pipeline: Cogl.Pipeline | null;
            backPipeline: Cogl.Pipeline | null;
            x_tiles: number;
            xTiles: number;
            y_tiles: number;
            yTiles: number;
        }
    }

    abstract class DeformEffect extends OffscreenEffect {
        static $gtype: GObject.GType<DeformEffect>;

        // Properties
        get back_pipeline(): Cogl.Pipeline | null;
        set back_pipeline(val: Cogl.Pipeline | null);

        get backPipeline(): Cogl.Pipeline | null;
        set backPipeline(val: Cogl.Pipeline | null);

        get x_tiles(): number;
        set x_tiles(val: number);

        get xTiles(): number;
        set xTiles(val: number);

        get y_tiles(): number;
        set y_tiles(val: number);

        get yTiles(): number;
        set yTiles(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DeformEffect.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DeformEffect.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DeformEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeformEffect.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DeformEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DeformEffect.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DeformEffect.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DeformEffect.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_deform_vertex(width: number, height: number, vertex: TextureVertex): void;

        // Methods
        get_back_pipeline(): Cogl.Pipeline | null;

        get_n_tiles(): [number, number];

        invalidate(): void;

        set_back_pipeline(pipeline: Cogl.Pipeline | null): void;

        set_n_tiles(x_tiles: number, y_tiles: number): void;
    }


    namespace DesaturateEffect {
        // Signal signatures
        interface SignalSignatures extends OffscreenEffect.SignalSignatures {
            "notify::factor": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends OffscreenEffect.ConstructorProps {
            factor: number;
        }
    }

    class DesaturateEffect extends OffscreenEffect {
        static $gtype: GObject.GType<DesaturateEffect>;

        // Properties
        get factor(): number;
        set factor(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DesaturateEffect.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DesaturateEffect.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](factor: number): DesaturateEffect;

        // Signals
        /** @signal */
        connect<K extends keyof DesaturateEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DesaturateEffect.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DesaturateEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DesaturateEffect.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DesaturateEffect.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DesaturateEffect.SignalSignatures[K]>): void;

        // Methods
        get_factor(): number;

        set_factor(factor: number): void;
    }


    namespace Effect {
        // Signal signatures
        interface SignalSignatures extends ActorMeta.SignalSignatures {
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends ActorMeta.ConstructorProps {}
    }

    abstract class Effect extends ActorMeta {
        static $gtype: GObject.GType<Effect>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Effect.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Effect.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Effect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Effect.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Effect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Effect.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Effect.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Effect.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_modify_paint_volume(volume: PaintVolume): boolean;

        vfunc_paint(node: PaintNode, paint_context: PaintContext, flags: EffectPaintFlags): void;

        vfunc_paint_node(node: PaintNode, paint_context: PaintContext, flags: EffectPaintFlags): void;

        vfunc_pick(pick_context: PickContext): void;

        vfunc_post_paint(node: PaintNode, paint_context: PaintContext): void;

        vfunc_pre_paint(node: PaintNode, paint_context: PaintContext): boolean;

        vfunc_realize(): void;

        vfunc_unrealize(): void;

        // Methods
        queue_repaint(): void;
    }


    namespace FixedLayout {
        // Signal signatures
        interface SignalSignatures extends LayoutManager.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends LayoutManager.ConstructorProps {}
    }

    class FixedLayout extends LayoutManager {
        static $gtype: GObject.GType<FixedLayout>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FixedLayout.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FixedLayout.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): FixedLayout;

        // Signals
        /** @signal */
        connect<K extends keyof FixedLayout.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FixedLayout.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FixedLayout.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FixedLayout.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FixedLayout.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FixedLayout.SignalSignatures[K]>): void;
    }


    namespace FlowLayout {
        // Signal signatures
        interface SignalSignatures extends LayoutManager.SignalSignatures {
            "notify::column-spacing": (pspec: GObject.ParamSpec) => void;
            "notify::homogeneous": (pspec: GObject.ParamSpec) => void;
            "notify::max-column-width": (pspec: GObject.ParamSpec) => void;
            "notify::max-row-height": (pspec: GObject.ParamSpec) => void;
            "notify::min-column-width": (pspec: GObject.ParamSpec) => void;
            "notify::min-row-height": (pspec: GObject.ParamSpec) => void;
            "notify::orientation": (pspec: GObject.ParamSpec) => void;
            "notify::row-spacing": (pspec: GObject.ParamSpec) => void;
            "notify::snap-to-grid": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends LayoutManager.ConstructorProps {
            column_spacing: number;
            columnSpacing: number;
            homogeneous: boolean;
            max_column_width: number;
            maxColumnWidth: number;
            max_row_height: number;
            maxRowHeight: number;
            min_column_width: number;
            minColumnWidth: number;
            min_row_height: number;
            minRowHeight: number;
            orientation: Orientation;
            row_spacing: number;
            rowSpacing: number;
            snap_to_grid: boolean;
            snapToGrid: boolean;
        }
    }

    class FlowLayout extends LayoutManager {
        static $gtype: GObject.GType<FlowLayout>;

        // Properties
        get column_spacing(): number;
        set column_spacing(val: number);

        get columnSpacing(): number;
        set columnSpacing(val: number);

        get homogeneous(): boolean;
        set homogeneous(val: boolean);

        get max_column_width(): number;
        set max_column_width(val: number);

        get maxColumnWidth(): number;
        set maxColumnWidth(val: number);

        get max_row_height(): number;
        set max_row_height(val: number);

        get maxRowHeight(): number;
        set maxRowHeight(val: number);

        get min_column_width(): number;
        set min_column_width(val: number);

        get minColumnWidth(): number;
        set minColumnWidth(val: number);

        get min_row_height(): number;
        set min_row_height(val: number);

        get minRowHeight(): number;
        set minRowHeight(val: number);

        get orientation(): Orientation;
        set orientation(val: Orientation);

        get row_spacing(): number;
        set row_spacing(val: number);

        get rowSpacing(): number;
        set rowSpacing(val: number);

        get snap_to_grid(): boolean;
        set snap_to_grid(val: boolean);

        get snapToGrid(): boolean;
        set snapToGrid(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FlowLayout.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FlowLayout.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](orientation: Orientation): FlowLayout;

        // Signals
        /** @signal */
        connect<K extends keyof FlowLayout.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FlowLayout.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FlowLayout.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FlowLayout.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FlowLayout.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FlowLayout.SignalSignatures[K]>): void;

        // Methods
        get_column_spacing(): number;

        get_column_width(): [number, number];

        get_homogeneous(): boolean;

        get_orientation(): Orientation;

        get_row_height(): [number, number];

        get_row_spacing(): number;

        get_snap_to_grid(): boolean;

        set_column_spacing(spacing: number): void;

        set_column_width(min_width: number, max_width: number): void;

        set_homogeneous(homogeneous: boolean): void;

        set_orientation(orientation: Orientation): void;

        set_row_height(min_height: number, max_height: number): void;

        set_row_spacing(spacing: number): void;

        set_snap_to_grid(snap_to_grid: boolean): void;
    }


    namespace Focus {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::stage": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            stage: Stage;
        }
    }

    class Focus extends GObject.Object {
        static $gtype: GObject.GType<Focus>;

        // Properties
        get stage(): Stage;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Focus.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Focus.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Focus.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Focus.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Focus.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Focus.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Focus.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Focus.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_notify_grab(grab: Grab, grab_actor: Actor, old_grab_actor: Actor): void;

        vfunc_propagate_event(event: Event): void;

        vfunc_set_current_actor(actor: Actor, source_device: InputDevice, time_ms: number): boolean;

        vfunc_update_from_event(event: Event): void;
    }


    namespace FrameClock {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            destroy: () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class FrameClock extends GObject.Object {
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
        add_future_time(when_us: bigint | number): void;

        add_timeline(timeline: Timeline): void;

        destroy(): void;

        dispatch(time_us: bigint | number): FrameResult;

        get_max_render_time_debug_info(): GLib.String;

        get_presentation_wait_us(): number;

        get_priority(): number;

        get_refresh_rate(): number;

        inhibit(): void;

        notify_ready(): void;

        record_flip_time(flip_time_us: bigint | number): void;

        remove_timeline(timeline: Timeline): void;

        schedule_flush_update(): void;

        schedule_update(): void;

        schedule_update_now(): void;

        schedule_update_throttled(): void;

        set_deadline_evasion(deadline_evasion_us: bigint | number): void;

        set_fullscreen_update_time(update_time_us: bigint | number): void;

        set_mode(mode: FrameClockMode): void;

        set_passive(driver: FrameClockDriver): void;

        uninhibit(): void;
    }


    namespace FrameClockDriver {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class FrameClockDriver extends GObject.Object {
        static $gtype: GObject.GType<FrameClockDriver>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FrameClockDriver.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FrameClockDriver.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FrameClockDriver.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FrameClockDriver.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FrameClockDriver.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FrameClockDriver.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FrameClockDriver.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FrameClockDriver.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_schedule_update(): void;
    }


    namespace Gesture {
        // Signal signatures
        interface SignalSignatures extends Action.SignalSignatures {
            /** @signal */
            cancel: () => void;
            /** @signal */
            end: () => void;
            /** @signal */
            "may-recognize": () => boolean | void;
            /** @signal */
            recognize: () => void;
            /** @signal */
            "should-handle-sequence": (sequence_begin_event: Event) => boolean | void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Action.ConstructorProps {
            state: GestureState;
        }
    }

    abstract class Gesture extends Action {
        static $gtype: GObject.GType<Gesture>;

        // Properties
        get state(): GestureState;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Gesture.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Gesture.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Gesture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Gesture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Gesture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Gesture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Gesture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Gesture.SignalSignatures[K]>): void;

        // Methods
        can_not_cancel(other_gesture: Gesture): void;

        cancel(): void;

        get_n_points(): number;

        get_point_begin_coords(point_index: number): Graphene.Point;

        get_point_coords(point_index: number): Graphene.Point;

        get_point_event(point_index: number): Event;

        get_point_previous_coords(point_index: number): Graphene.Point;

        get_points(): number[];

        get_state(): GestureState;
    }


    namespace Grab {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::revoked": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            revoked: boolean;
        }
    }

    class Grab extends GObject.Object {
        static $gtype: GObject.GType<Grab>;

        // Properties
        get revoked(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Grab.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Grab.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Grab.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Grab.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Grab.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Grab.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Grab.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Grab.SignalSignatures[K]>): void;

        // Methods
        activate(): void;

        dismiss(): void;

        is_revoked(): boolean;
    }


    namespace GraphicsRecoveryContext {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "graphics-restored": () => void;
            /** @signal */
            "realize-graphics": () => void;
            /** @signal */
            "recovery-failed": (error: GLib.Error) => void;
            /** @signal */
            "recreate-context": (error: null) => boolean | void;
            /** @signal */
            "reset-completed": () => void;
            /** @signal */
            "reset-detected": () => void;
            /** @signal */
            "unrealize-graphics": () => void;
            "notify::backend": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            backend: Backend;
        }
    }

    class GraphicsRecoveryContext extends GObject.Object {
        static $gtype: GObject.GType<GraphicsRecoveryContext>;

        // Properties
        set backend(val: Backend);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: GraphicsRecoveryContext.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<GraphicsRecoveryContext.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof GraphicsRecoveryContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GraphicsRecoveryContext.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof GraphicsRecoveryContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GraphicsRecoveryContext.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof GraphicsRecoveryContext.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<GraphicsRecoveryContext.SignalSignatures[K]>): void;

        // Methods
        get_state(): GraphicsRecoveryState;

        is_in_progress(): boolean;
    }


    namespace GridLayout {
        // Signal signatures
        interface SignalSignatures extends LayoutManager.SignalSignatures {
            "notify::column-homogeneous": (pspec: GObject.ParamSpec) => void;
            "notify::column-spacing": (pspec: GObject.ParamSpec) => void;
            "notify::orientation": (pspec: GObject.ParamSpec) => void;
            "notify::row-homogeneous": (pspec: GObject.ParamSpec) => void;
            "notify::row-spacing": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends LayoutManager.ConstructorProps {
            column_homogeneous: boolean;
            columnHomogeneous: boolean;
            column_spacing: number;
            columnSpacing: number;
            orientation: Orientation;
            row_homogeneous: boolean;
            rowHomogeneous: boolean;
            row_spacing: number;
            rowSpacing: number;
        }
    }

    class GridLayout extends LayoutManager {
        static $gtype: GObject.GType<GridLayout>;

        // Properties
        get column_homogeneous(): boolean;
        set column_homogeneous(val: boolean);

        get columnHomogeneous(): boolean;
        set columnHomogeneous(val: boolean);

        get column_spacing(): number;
        set column_spacing(val: number);

        get columnSpacing(): number;
        set columnSpacing(val: number);

        get orientation(): Orientation;
        set orientation(val: Orientation);

        get row_homogeneous(): boolean;
        set row_homogeneous(val: boolean);

        get rowHomogeneous(): boolean;
        set rowHomogeneous(val: boolean);

        get row_spacing(): number;
        set row_spacing(val: number);

        get rowSpacing(): number;
        set rowSpacing(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: GridLayout.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<GridLayout.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): GridLayout;

        // Signals
        /** @signal */
        connect<K extends keyof GridLayout.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GridLayout.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof GridLayout.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GridLayout.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof GridLayout.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<GridLayout.SignalSignatures[K]>): void;

        // Methods
        attach(child: Actor, left: number, top: number, width: number, height: number): void;

        attach_next_to(child: Actor, sibling: Actor | null, side: GridPosition, width: number, height: number): void;

        get_child_at(left: number, top: number): Actor;

        get_column_homogeneous(): boolean;

        get_column_spacing(): number;

        get_orientation(): Orientation;

        get_row_homogeneous(): boolean;

        get_row_spacing(): number;

        insert_column(position: number): void;

        insert_next_to(sibling: Actor, side: GridPosition): void;

        insert_row(position: number): void;

        set_column_homogeneous(homogeneous: boolean): void;

        set_column_spacing(spacing: number): void;

        set_orientation(orientation: Orientation): void;

        set_row_homogeneous(homogeneous: boolean): void;

        set_row_spacing(spacing: number): void;
    }


    namespace InputDevice {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::bus-type": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::device-node": (pspec: GObject.ParamSpec) => void;
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::n-buttons": (pspec: GObject.ParamSpec) => void;
            "notify::n-dials": (pspec: GObject.ParamSpec) => void;
            "notify::n-mode-groups": (pspec: GObject.ParamSpec) => void;
            "notify::n-rings": (pspec: GObject.ParamSpec) => void;
            "notify::n-strips": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::product-id": (pspec: GObject.ParamSpec) => void;
            "notify::seat": (pspec: GObject.ParamSpec) => void;
            "notify::vendor-id": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            bus_type: number;
            busType: number;
            capabilities: InputCapabilities;
            device_node: string;
            deviceNode: string;
            device_type: InputDeviceType;
            deviceType: InputDeviceType;
            n_buttons: number;
            nButtons: number;
            n_dials: number;
            nDials: number;
            n_mode_groups: number;
            nModeGroups: number;
            n_rings: number;
            nRings: number;
            n_strips: number;
            nStrips: number;
            name: string;
            product_id: number;
            productId: number;
            seat: Seat;
            vendor_id: number;
            vendorId: number;
        }
    }

    class InputDevice extends GObject.Object {
        static $gtype: GObject.GType<InputDevice>;

        // Properties
        get bus_type(): number;

        get busType(): number;

        get capabilities(): InputCapabilities;

        get device_node(): string;

        get deviceNode(): string;

        get device_type(): InputDeviceType;

        get deviceType(): InputDeviceType;

        get n_buttons(): number;

        get nButtons(): number;

        get n_dials(): number;

        get nDials(): number;

        get n_mode_groups(): number;

        get nModeGroups(): number;

        get n_rings(): number;

        get nRings(): number;

        get n_strips(): number;

        get nStrips(): number;

        get name(): string;

        get product_id(): number;

        get productId(): number;

        get seat(): Seat;

        get vendor_id(): number;

        get vendorId(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: InputDevice.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<InputDevice.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof InputDevice.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InputDevice.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof InputDevice.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InputDevice.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof InputDevice.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<InputDevice.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_dimensions(): [boolean, number, number];

        vfunc_get_group_n_modes(group: number): number;

        vfunc_get_pad_feature_group(feature: InputDevicePadFeature, n_feature: number): number;

        vfunc_is_grouped(other_device: InputDevice): boolean;

        vfunc_is_mode_switch_button(group: number, button: number): boolean;

        // Methods
        get_bus_type(): number;

        get_capabilities(): InputCapabilities;

        get_device_name(): string;

        get_device_node(): string;

        get_device_type(): InputDeviceType;

        get_dimensions(): [boolean, number, number];

        get_group_n_modes(group: number): number;

        get_mode_switch_button_group(button: number): number;

        get_n_buttons(): number;

        get_n_dials(): number;

        get_n_mode_groups(): number;

        get_n_rings(): number;

        get_n_strips(): number;

        get_pad_feature_group(feature: InputDevicePadFeature, n_feature: number): number;

        get_product_id(): number;

        get_seat(): Seat;

        get_vendor_id(): number;

        is_grouped(other_device: InputDevice): boolean;

        is_mode_switch_button(group: number, button: number): boolean;
    }


    namespace InputDeviceTool {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::axes": (pspec: GObject.ParamSpec) => void;
            "notify::eraser-button": (pspec: GObject.ParamSpec) => void;
            "notify::has-eraser-button": (pspec: GObject.ParamSpec) => void;
            "notify::id": (pspec: GObject.ParamSpec) => void;
            "notify::serial": (pspec: GObject.ParamSpec) => void;
            "notify::type": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            axes: InputAxisFlags;
            eraser_button: number;
            eraserButton: number;
            has_eraser_button: boolean;
            hasEraserButton: boolean;
            id: bigint | number;
            serial: bigint | number;
            type: InputDeviceToolType;
        }
    }

    abstract class InputDeviceTool extends GObject.Object {
        static $gtype: GObject.GType<InputDeviceTool>;

        // Properties
        get axes(): InputAxisFlags;

        get eraser_button(): number;

        get eraserButton(): number;

        get has_eraser_button(): boolean;

        get hasEraserButton(): boolean;

        get id(): number;

        get serial(): number;

        get type(): InputDeviceToolType;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: InputDeviceTool.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<InputDeviceTool.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof InputDeviceTool.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InputDeviceTool.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof InputDeviceTool.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InputDeviceTool.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof InputDeviceTool.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<InputDeviceTool.SignalSignatures[K]>): void;

        // Methods
        get_axes(): InputAxisFlags;

        get_eraser_button(): number;

        get_id(): number;

        get_serial(): number;

        get_tool_type(): InputDeviceToolType;
    }


    namespace InputFocus {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class InputFocus extends GObject.Object {
        static $gtype: GObject.GType<InputFocus>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: InputFocus.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<InputFocus.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof InputFocus.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InputFocus.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof InputFocus.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InputFocus.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof InputFocus.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<InputFocus.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_action(action: InputAction): void;

        vfunc_commit_text(text: string): void;

        vfunc_delete_surrounding(offset: number, len: number): void;

        vfunc_focus_in(input_method: InputMethod): void;

        vfunc_focus_out(): void;

        vfunc_request_surrounding(): void;

        vfunc_set_preedit_text(preedit: string, cursor: number, anchor: number, style_hints: PreeditAttribute, n_style_hints: number): void;

        // Methods
        filter_event(event: Event): boolean;

        is_focused(): boolean;

        process_event(event: Event): boolean;

        reset(): void;

        set_can_show_preedit(can_show_preedit: boolean): void;

        set_content_hints(hint: InputContentHintFlags): void;

        set_content_purpose(purpose: InputContentPurpose): void;

        set_cursor_location(rect: Graphene.Rect): void;

        set_handled_actions(actions: InputActionFlags): void;

        set_input_panel_state(state: InputPanelState): void;

        set_surrounding(text: string, cursor: number, anchor: number): void;
    }


    namespace InputMethod {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            commit: (object: string) => void;
            /** @signal */
            "cursor-location-changed": (object: Graphene.Rect) => void;
            /** @signal */
            "delete-surrounding": (object: number, p0: number) => void;
            /** @signal */
            "input-panel-state": (object: InputPanelState) => void;
            /** @signal */
            "request-surrounding": () => void;
            "notify::can-show-preedit": (pspec: GObject.ParamSpec) => void;
            "notify::content-hints": (pspec: GObject.ParamSpec) => void;
            "notify::content-purpose": (pspec: GObject.ParamSpec) => void;
            "notify::handled-actions": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            can_show_preedit: boolean;
            canShowPreedit: boolean;
            content_hints: InputContentHintFlags;
            contentHints: InputContentHintFlags;
            content_purpose: InputContentPurpose;
            contentPurpose: InputContentPurpose;
            handled_actions: InputActionFlags;
            handledActions: InputActionFlags;
        }
    }

    abstract class InputMethod extends GObject.Object {
        static $gtype: GObject.GType<InputMethod>;

        // Properties
        get can_show_preedit(): boolean;
        set can_show_preedit(val: boolean);

        get canShowPreedit(): boolean;
        set canShowPreedit(val: boolean);

        get content_hints(): InputContentHintFlags;
        set content_hints(val: InputContentHintFlags);

        get contentHints(): InputContentHintFlags;
        set contentHints(val: InputContentHintFlags);

        get content_purpose(): InputContentPurpose;
        set content_purpose(val: InputContentPurpose);

        get contentPurpose(): InputContentPurpose;
        set contentPurpose(val: InputContentPurpose);

        set handled_actions(val: InputActionFlags);

        set handledActions(val: InputActionFlags);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: InputMethod.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<InputMethod.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof InputMethod.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InputMethod.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof InputMethod.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InputMethod.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof InputMethod.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<InputMethod.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_filter_key_event(key: Event): boolean;

        vfunc_focus_in(actor: InputFocus): void;

        vfunc_focus_out(): void;

        vfunc_reset(): void;

        vfunc_set_cursor_location(rect: Graphene.Rect): void;

        vfunc_set_handled_actions(actions: InputActionFlags): void;

        vfunc_set_surrounding(text: string, cursor: number, anchor: number): void;

        vfunc_update_content_hints(hint: InputContentHintFlags): void;

        vfunc_update_content_purpose(purpose: InputContentPurpose): void;

        // Methods
        commit(text: string): void;

        delete_surrounding(offset: number, len: number): void;

        focus_in(focus: InputFocus): void;

        focus_out(): void;

        forward_key(keyval: number, keycode: number, state: number, time_: bigint | number, press: boolean): void;

        notify_key_event(event: Event, filtered: boolean): void;

        request_surrounding(): void;

        set_input_panel_state(state: InputPanelState): void;

        set_preedit_text(preedit: string | null, cursor: number, anchor: number, mode: PreeditResetMode): void;

        set_preedit_text_with_attrs(preedit: string | null, cursor: number, anchor: number, mode: PreeditResetMode, preedit_hints: PreeditAttribute[] | null): void;

        trigger_action(action: InputAction): void;
    }


    namespace Interval {
        // Signal signatures
        interface SignalSignatures extends GObject.InitiallyUnowned.SignalSignatures {
            "notify::final": (pspec: GObject.ParamSpec) => void;
            "notify::initial": (pspec: GObject.ParamSpec) => void;
            "notify::value-type": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.InitiallyUnowned.ConstructorProps {
            "final": GObject.Value | any;
            initial: GObject.Value | any;
            value_type: GObject.GTypeInput;
            valueType: GObject.GTypeInput;
        }
    }

    class Interval extends GObject.InitiallyUnowned {
        static $gtype: GObject.GType<Interval>;

        // Properties
        get "final"(): unknown;
        set "final"(val: GObject.Value | any);

        get initial(): unknown;
        set initial(val: GObject.Value | any);

        get value_type(): GObject.GType;

        get valueType(): GObject.GType;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Interval.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Interval.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_with_values(gtype: GObject.GType, initial: GObject.Value | any | null, _final: GObject.Value | any | null): Interval;

        // Signals
        /** @signal */
        connect<K extends keyof Interval.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Interval.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Interval.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Interval.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Interval.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Interval.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_compute_value(factor: number): [boolean, GObject.Value | any];

        vfunc_validate(pspec: GObject.ParamSpec): boolean;

        // Methods
        clone(): Interval;

        compute(factor: number): unknown;

        compute_value(factor: number): [boolean, unknown];

        get_final_value(): unknown;

        get_initial_value(): unknown;

        get_value_type(): GObject.GType;

        is_valid(): boolean;

        peek_final_value(): unknown;

        peek_initial_value(): unknown;

        set_final(value: GObject.Value | any): void;

        set_initial(value: GObject.Value | any): void;

        validate(pspec: GObject.ParamSpec): boolean;
    }


    namespace KeyController {
        // Signal signatures
        interface SignalSignatures extends Action.SignalSignatures {
            /** @signal */
            "key-press": () => boolean | void;
            /** @signal */
            "key-release": () => boolean | void;
            /** @signal */
            "modifier-change": () => void;
            "notify::im-focus": (pspec: GObject.ParamSpec) => void;
            "notify::trigger-keybindings": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Action.ConstructorProps {
            im_focus: InputFocus;
            imFocus: InputFocus;
            trigger_keybindings: boolean;
            triggerKeybindings: boolean;
        }
    }

    class KeyController extends Action {
        static $gtype: GObject.GType<KeyController>;

        // Properties
        set im_focus(val: InputFocus);

        set imFocus(val: InputFocus);

        get trigger_keybindings(): boolean;
        set trigger_keybindings(val: boolean);

        get triggerKeybindings(): boolean;
        set triggerKeybindings(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: KeyController.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<KeyController.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](im_focus: InputFocus | null): KeyController;

        // Signals
        /** @signal */
        connect<K extends keyof KeyController.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, KeyController.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof KeyController.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, KeyController.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof KeyController.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<KeyController.SignalSignatures[K]>): void;

        // Methods
        get_key(): [boolean, number, number, string];

        get_state(): [boolean, ModifierType, ModifierType, ModifierType];

        get_trigger_keybindings(): boolean;

        set_trigger_keybindings(trigger_keybindings: boolean): void;
    }


    namespace KeyFocus {
        // Signal signatures
        interface SignalSignatures extends Focus.SignalSignatures {
            "notify::stage": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Focus.ConstructorProps {}
    }

    class KeyFocus extends Focus {
        static $gtype: GObject.GType<KeyFocus>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: KeyFocus.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<KeyFocus.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof KeyFocus.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, KeyFocus.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof KeyFocus.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, KeyFocus.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof KeyFocus.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<KeyFocus.SignalSignatures[K]>): void;
    }


    namespace KeyframeTransition {
        // Signal signatures
        interface SignalSignatures extends PropertyTransition.SignalSignatures {
            "notify::property-name": (pspec: GObject.ParamSpec) => void;
            "notify::animatable": (pspec: GObject.ParamSpec) => void;
            "notify::interval": (pspec: GObject.ParamSpec) => void;
            "notify::remove-on-complete": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::auto-reverse": (pspec: GObject.ParamSpec) => void;
            "notify::delay": (pspec: GObject.ParamSpec) => void;
            "notify::direction": (pspec: GObject.ParamSpec) => void;
            "notify::duration": (pspec: GObject.ParamSpec) => void;
            "notify::frame-clock": (pspec: GObject.ParamSpec) => void;
            "notify::progress-mode": (pspec: GObject.ParamSpec) => void;
            "notify::repeat-count": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends PropertyTransition.ConstructorProps {}
    }

    class KeyframeTransition extends PropertyTransition {
        static $gtype: GObject.GType<KeyframeTransition>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: KeyframeTransition.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<KeyframeTransition.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](property_name: string): KeyframeTransition;

        // Conflicted with Clutter.PropertyTransition.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof KeyframeTransition.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, KeyframeTransition.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof KeyframeTransition.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, KeyframeTransition.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof KeyframeTransition.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<KeyframeTransition.SignalSignatures[K]>): void;

        // Methods
        clear(): void;

        get_key_frame(index_: number): [number, AnimationMode | null, unknown];

        get_n_key_frames(): number;

        set_key_frame(index_: number, key: number, mode: AnimationMode, value: GObject.Value | any): void;

        set_key_frames(key_frames: number[]): void;

        set_modes(modes: AnimationMode[]): void;

        set_values(values: (GObject.Value | any)[]): void;
    }


    namespace Keymap {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "state-changed": () => void;
            "notify::caps-lock-state": (pspec: GObject.ParamSpec) => void;
            "notify::num-lock-state": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            caps_lock_state: boolean;
            capsLockState: boolean;
            num_lock_state: boolean;
            numLockState: boolean;
        }
    }

    abstract class Keymap extends GObject.Object {
        static $gtype: GObject.GType<Keymap>;

        // Properties
        get caps_lock_state(): boolean;

        get capsLockState(): boolean;

        get num_lock_state(): boolean;

        get numLockState(): boolean;

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

        // Virtual methods
        vfunc_get_direction(): TextDirection;

        // Methods
        get_caps_lock_state(): boolean;

        get_current_display_name(): string | null;

        get_current_short_name(): string | null;

        get_direction(): TextDirection;

        get_num_lock_state(): boolean;
    }


    namespace LayerNode {
        // Signal signatures
        interface SignalSignatures extends PaintNode.SignalSignatures {}
    }

    class LayerNode extends PaintNode {
        static $gtype: GObject.GType<LayerNode>;

        // Constructors
        _init(...args: any[]): void;

        static new_to_framebuffer(framebuffer: Cogl.Framebuffer, pipeline: Cogl.Pipeline): LayerNode;

        // Signals
        /** @signal */
        connect<K extends keyof LayerNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LayerNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof LayerNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LayerNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof LayerNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<LayerNode.SignalSignatures[K]>): void;

        // Methods
        get_pipeline(): Cogl.Pipeline;
    }


    namespace LayoutManager {
        // Signal signatures
        interface SignalSignatures extends GObject.InitiallyUnowned.SignalSignatures {
            /** @signal */
            "layout-changed": () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.InitiallyUnowned.ConstructorProps {}
    }

    abstract class LayoutManager extends GObject.InitiallyUnowned {
        static $gtype: GObject.GType<LayoutManager>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: LayoutManager.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<LayoutManager.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof LayoutManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LayoutManager.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof LayoutManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LayoutManager.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof LayoutManager.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<LayoutManager.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_allocate(container: Actor, allocation: ActorBox): void;

        vfunc_get_child_meta_type(): GObject.GType;

        vfunc_get_preferred_height(container: Actor, for_width: number): [number, number];

        vfunc_get_preferred_width(container: Actor, for_height: number): [number, number];

        vfunc_layout_changed(): void;

        vfunc_set_container(container: Actor | null): void;

        // Methods
        allocate(container: Actor, allocation: ActorBox): void;

        child_get_property(container: Actor, actor: Actor, property_name: string, value: GObject.Value | any): void;

        child_set_property(container: Actor, actor: Actor, property_name: string, value: GObject.Value | any): void;

        find_child_property(name: string): GObject.ParamSpec;

        get_child_meta(container: Actor, actor: Actor): LayoutMeta;

        get_preferred_height(container: Actor, for_width: number): [number, number];

        get_preferred_width(container: Actor, for_height: number): [number, number];

        layout_changed(): void;

        list_child_properties(): GObject.ParamSpec[];

        set_container(container: Actor | null): void;
    }


    namespace LayoutMeta {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::container": (pspec: GObject.ParamSpec) => void;
            "notify::manager": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            actor: Actor;
            container: Actor;
            manager: LayoutManager;
        }
    }

    abstract class LayoutMeta extends GObject.Object {
        static $gtype: GObject.GType<LayoutMeta>;

        // Properties
        get actor(): Actor;

        get container(): Actor;

        get manager(): LayoutManager;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: LayoutMeta.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<LayoutMeta.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof LayoutMeta.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LayoutMeta.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof LayoutMeta.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LayoutMeta.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof LayoutMeta.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<LayoutMeta.SignalSignatures[K]>): void;

        // Methods
        get_actor(): Actor;

        get_container(): Actor;

        get_manager(): LayoutManager;

        is_for(manager: LayoutManager, container: Actor, actor: Actor): boolean;
    }


    namespace LongPressGesture {
        // Signal signatures
        interface SignalSignatures extends PressGesture.SignalSignatures {
            "notify::cancel-threshold": (pspec: GObject.ParamSpec) => void;
            "notify::long-press-duration-ms": (pspec: GObject.ParamSpec) => void;
            "notify::pressed": (pspec: GObject.ParamSpec) => void;
            "notify::required-button": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends PressGesture.ConstructorProps {}
    }

    class LongPressGesture extends PressGesture {
        static $gtype: GObject.GType<LongPressGesture>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: LongPressGesture.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<LongPressGesture.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): LongPressGesture;

        // Signals
        /** @signal */
        connect<K extends keyof LongPressGesture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LongPressGesture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof LongPressGesture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LongPressGesture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof LongPressGesture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<LongPressGesture.SignalSignatures[K]>): void;
    }


    namespace MotionController {
        // Signal signatures
        interface SignalSignatures extends Action.SignalSignatures {
            /** @signal */
            enter: (sprite: Sprite, x: number, y: number) => void;
            /** @signal */
            leave: (sprite: Sprite) => void;
            /** @signal */
            motion: (sprite: Sprite, x: number, y: number) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Action.ConstructorProps {}
    }

    class MotionController extends Action {
        static $gtype: GObject.GType<MotionController>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MotionController.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MotionController.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): MotionController;

        // Signals
        /** @signal */
        connect<K extends keyof MotionController.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MotionController.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MotionController.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MotionController.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MotionController.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MotionController.SignalSignatures[K]>): void;
    }


    namespace OffscreenEffect {
        // Signal signatures
        interface SignalSignatures extends Effect.SignalSignatures {
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Effect.ConstructorProps {}
    }

    abstract class OffscreenEffect extends Effect {
        static $gtype: GObject.GType<OffscreenEffect>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: OffscreenEffect.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<OffscreenEffect.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof OffscreenEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, OffscreenEffect.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof OffscreenEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, OffscreenEffect.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof OffscreenEffect.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<OffscreenEffect.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_create_texture(cogl_context: Cogl.Context, width: number, height: number): Cogl.Texture;

        vfunc_paint_target(node: PaintNode, paint_context: PaintContext): void;

        // Methods
        create_texture(context: Cogl.Context, width: number, height: number): Cogl.Texture;

        get_pipeline(): Cogl.Pipeline | null;

        get_target_size(): [boolean, number, number];

        get_texture(): Cogl.Texture;

        paint_target(node: PaintNode, paint_context: PaintContext): void;
    }


    namespace PageTurnEffect {
        // Signal signatures
        interface SignalSignatures extends DeformEffect.SignalSignatures {
            "notify::angle": (pspec: GObject.ParamSpec) => void;
            "notify::period": (pspec: GObject.ParamSpec) => void;
            "notify::radius": (pspec: GObject.ParamSpec) => void;
            "notify::back-pipeline": (pspec: GObject.ParamSpec) => void;
            "notify::x-tiles": (pspec: GObject.ParamSpec) => void;
            "notify::y-tiles": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends DeformEffect.ConstructorProps {
            angle: number;
            period: number;
            radius: number;
        }
    }

    class PageTurnEffect extends DeformEffect {
        static $gtype: GObject.GType<PageTurnEffect>;

        // Properties
        get angle(): number;
        set angle(val: number);

        get period(): number;
        set period(val: number);

        get radius(): number;
        set radius(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: PageTurnEffect.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<PageTurnEffect.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](period: number, angle: number, radius: number): PageTurnEffect;

        // Signals
        /** @signal */
        connect<K extends keyof PageTurnEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PageTurnEffect.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PageTurnEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PageTurnEffect.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PageTurnEffect.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PageTurnEffect.SignalSignatures[K]>): void;

        // Methods
        get_angle(): number;

        get_period(): number;

        get_radius(): number;

        set_angle(angle: number): void;

        set_period(period: number): void;

        set_radius(radius: number): void;
    }


    namespace PaintNode {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    abstract class PaintNode {
        static $gtype: GObject.GType<PaintNode>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof PaintNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PaintNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PaintNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PaintNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PaintNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PaintNode.SignalSignatures[K]>): void;

        // Methods
        add_child(child: PaintNode): void;

        add_multitexture_rectangle(rect: ActorBox, text_coords: number, text_coords_len: number): void;

        add_rectangle(rect: ActorBox): void;

        add_rectangles(coords: number[]): void;

        add_texture_rectangle(rect: ActorBox, x_1: number, y_1: number, x_2: number, y_2: number): void;

        add_texture_rectangles(coords: number[]): void;

        get_framebuffer(): Cogl.Framebuffer;

        paint(paint_context: PaintContext): void;

        ref(): PaintNode;

        set_name(name: string): void;

        unref(): void;
    }


    namespace PanGesture {
        // Signal signatures
        interface SignalSignatures extends Gesture.SignalSignatures {
            /** @signal */
            "pan-update": () => void;
            "notify::begin-threshold": (pspec: GObject.ParamSpec) => void;
            "notify::max-n-points": (pspec: GObject.ParamSpec) => void;
            "notify::max-npoints": (pspec: GObject.ParamSpec) => void;
            "notify::min-n-points": (pspec: GObject.ParamSpec) => void;
            "notify::min-npoints": (pspec: GObject.ParamSpec) => void;
            "notify::pan-axis": (pspec: GObject.ParamSpec) => void;
            "notify::required-button": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gesture.ConstructorProps {
            begin_threshold: number;
            beginThreshold: number;
            max_n_points: number;
            maxNPoints: number;
            min_n_points: number;
            minNPoints: number;
            pan_axis: PanAxis;
            panAxis: PanAxis;
            required_button: number;
            requiredButton: number;
        }
    }

    class PanGesture extends Gesture {
        static $gtype: GObject.GType<PanGesture>;

        // Properties
        get begin_threshold(): number;
        set begin_threshold(val: number);

        get beginThreshold(): number;
        set beginThreshold(val: number);

        get max_n_points(): number;
        set max_n_points(val: number);

        get maxNPoints(): number;
        set maxNPoints(val: number);

        get min_n_points(): number;
        set min_n_points(val: number);

        get minNPoints(): number;
        set minNPoints(val: number);

        get pan_axis(): PanAxis;
        set pan_axis(val: PanAxis);

        get panAxis(): PanAxis;
        set panAxis(val: PanAxis);

        get required_button(): number;
        set required_button(val: number);

        get requiredButton(): number;
        set requiredButton(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: PanGesture.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<PanGesture.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): PanGesture;

        // Signals
        /** @signal */
        connect<K extends keyof PanGesture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PanGesture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PanGesture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PanGesture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PanGesture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PanGesture.SignalSignatures[K]>): void;

        // Methods
        get_accumulated_delta(): Graphene.Vec2;

        get_accumulated_delta_abs(): Graphene.Vec2;

        get_begin_centroid(): Graphene.Point;

        get_begin_centroid_abs(): Graphene.Point;

        get_begin_threshold(): number;

        get_button(): number;

        get_centroid(): Graphene.Point;

        get_centroid_abs(): Graphene.Point;

        get_delta(): Graphene.Vec2;

        get_delta_abs(): Graphene.Vec2;

        get_max_n_points(): number;

        get_min_n_points(): number;

        get_pan_axis(): PanAxis;

        get_required_button(): number;

        get_state(): ModifierType;

    // Conflicted with Clutter.Gesture.get_state
        get_state(...args: never[]): any;

        get_velocity(): Graphene.Vec2;

        get_velocity_abs(): Graphene.Vec2;

        set_begin_threshold(begin_threshold: number): void;

        set_max_n_points(max_n_points: number): void;

        set_min_n_points(min_n_points: number): void;

        set_pan_axis(axis: PanAxis): void;

        set_required_button(required_button: number): void;
    }


    namespace PipelineNode {
        // Signal signatures
        interface SignalSignatures extends PaintNode.SignalSignatures {}
    }

    class PipelineNode extends PaintNode {
        static $gtype: GObject.GType<PipelineNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](pipeline: Cogl.Pipeline | null): PipelineNode;

        // Signals
        /** @signal */
        connect<K extends keyof PipelineNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PipelineNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PipelineNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PipelineNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PipelineNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PipelineNode.SignalSignatures[K]>): void;

        // Methods
        set_whole_pixels(whole_pixels: boolean): void;
    }


    namespace PressGesture {
        // Signal signatures
        interface SignalSignatures extends Gesture.SignalSignatures {
            "notify::cancel-threshold": (pspec: GObject.ParamSpec) => void;
            "notify::long-press-duration-ms": (pspec: GObject.ParamSpec) => void;
            "notify::pressed": (pspec: GObject.ParamSpec) => void;
            "notify::required-button": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gesture.ConstructorProps {
            cancel_threshold: number;
            cancelThreshold: number;
            long_press_duration_ms: number;
            longPressDurationMs: number;
            pressed: boolean;
            required_button: number;
            requiredButton: number;
        }
    }

    abstract class PressGesture extends Gesture {
        static $gtype: GObject.GType<PressGesture>;

        // Properties
        get cancel_threshold(): number;
        set cancel_threshold(val: number);

        get cancelThreshold(): number;
        set cancelThreshold(val: number);

        get long_press_duration_ms(): number;
        set long_press_duration_ms(val: number);

        get longPressDurationMs(): number;
        set longPressDurationMs(val: number);

        get pressed(): boolean;
        set pressed(val: boolean);

        get required_button(): number;
        set required_button(val: number);

        get requiredButton(): number;
        set requiredButton(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: PressGesture.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<PressGesture.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof PressGesture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PressGesture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PressGesture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PressGesture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PressGesture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PressGesture.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_long_press(): void;

        vfunc_press(): void;

        vfunc_release(): void;

        // Methods
        get_button(): number;

        get_cancel_threshold(): number;

        get_coords(): Graphene.Point;

        get_coords_abs(): Graphene.Point;

        get_long_press_duration_ms(): number;

        get_n_presses(): number;

        get_pressed(): boolean;

        get_required_button(): number;

        get_state(): ModifierType;

    // Conflicted with Clutter.Gesture.get_state
        get_state(...args: never[]): any;

        set_cancel_threshold(cancel_threshold: number): void;

        set_long_press_duration_ms(long_press_duration_ms: number): void;

        set_required_button(required_button: number): void;
    }


    namespace PropertyTransition {
        // Signal signatures
        interface SignalSignatures extends Transition.SignalSignatures {
            "notify::property-name": (pspec: GObject.ParamSpec) => void;
            "notify::animatable": (pspec: GObject.ParamSpec) => void;
            "notify::interval": (pspec: GObject.ParamSpec) => void;
            "notify::remove-on-complete": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::auto-reverse": (pspec: GObject.ParamSpec) => void;
            "notify::delay": (pspec: GObject.ParamSpec) => void;
            "notify::direction": (pspec: GObject.ParamSpec) => void;
            "notify::duration": (pspec: GObject.ParamSpec) => void;
            "notify::frame-clock": (pspec: GObject.ParamSpec) => void;
            "notify::progress-mode": (pspec: GObject.ParamSpec) => void;
            "notify::repeat-count": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Transition.ConstructorProps {
            property_name: string;
            propertyName: string;
        }
    }

    class PropertyTransition extends Transition {
        static $gtype: GObject.GType<PropertyTransition>;

        // Properties
        get property_name(): string;
        set property_name(val: string);

        get propertyName(): string;
        set propertyName(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: PropertyTransition.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<PropertyTransition.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](property_name: string | null): PropertyTransition;

        static new_for_actor(actor: Actor, property_name: string | null): PropertyTransition;

        // Conflicted with Clutter.Timeline.new_for_actor
        static new_for_actor(...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof PropertyTransition.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PropertyTransition.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PropertyTransition.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PropertyTransition.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PropertyTransition.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PropertyTransition.SignalSignatures[K]>): void;

        // Methods
        get_property_name(): string;

        set_property_name(property_name: string | null): void;
    }


    namespace RootNode {
        // Signal signatures
        interface SignalSignatures extends PaintNode.SignalSignatures {}
    }

    class RootNode extends PaintNode {
        static $gtype: GObject.GType<RootNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](framebuffer: Cogl.Framebuffer, color_state: ColorState, clear_color: Cogl.Color, clear_flags: Cogl.BufferBit): RootNode;

        // Signals
        /** @signal */
        connect<K extends keyof RootNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RootNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof RootNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RootNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof RootNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<RootNode.SignalSignatures[K]>): void;
    }


    namespace ScrollController {
        // Signal signatures
        interface SignalSignatures extends Action.SignalSignatures {
            /** @signal */
            scroll: (sprite: Sprite, source: ScrollSource, dx: number, dy: number) => void;
            "notify::flags": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Action.ConstructorProps {
            flags: ScrollControllerFlags;
        }
    }

    class ScrollController extends Action {
        static $gtype: GObject.GType<ScrollController>;

        // Properties
        get flags(): ScrollControllerFlags;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ScrollController.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ScrollController.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](flags: ScrollControllerFlags): ScrollController;

        // Signals
        /** @signal */
        connect<K extends keyof ScrollController.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ScrollController.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ScrollController.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ScrollController.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ScrollController.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ScrollController.SignalSignatures[K]>): void;
    }


    namespace Seat {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "device-added": (object: InputDevice) => void;
            /** @signal */
            "device-removed": (object: InputDevice) => void;
            /** @signal */
            "is-unfocus-inhibited-changed": () => void;
            /** @signal */
            "kbd-a11y-flags-changed": (settings_flags: number, changed_mask: number) => void;
            /** @signal */
            "kbd-a11y-mods-state-changed": (latched_mask: number, locked_mask: number) => void;
            /** @signal */
            "ptr-a11y-dwell-click-type-changed": (click_type: PointerA11yDwellClickType) => void;
            /** @signal */
            "ptr-a11y-timeout-started": (device: PointerA11yTimeoutType, timeout_type: number) => void;
            /** @signal */
            "ptr-a11y-timeout-stopped": (device: PointerA11yTimeoutType, timeout_type: boolean) => void;
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::touch-mode": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            context: Context;
            name: string;
            touch_mode: boolean;
            touchMode: boolean;
        }
    }

    abstract class Seat extends GObject.Object {
        static $gtype: GObject.GType<Seat>;

        // Properties
        get context(): Context;

        get name(): string;

        get touch_mode(): boolean;

        get touchMode(): boolean;

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

        // Virtual methods
        vfunc_bell_notify(): void;

        vfunc_consume_held_modifiers(): void;

        vfunc_create_virtual_device(device_type: InputDeviceType): VirtualInputDevice;

        vfunc_get_keymap(): Keymap;

        vfunc_handle_event_post(event: Event): boolean;

        vfunc_init_pointer_position(x: number, y: number): void;

        vfunc_is_unfocus_inhibited_changed(): void;

        vfunc_query_state(sprite: Sprite, coords: Graphene.Point, modifiers: ModifierType): boolean;

        vfunc_warp_pointer(x: number, y: number): void;

        // Methods
        bell_notify(): void;

        consume_held_modifiers(): void;

        create_virtual_device(device_type: InputDeviceType): VirtualInputDevice;

        ensure_a11y_state(): void;

        get_context(): Context;

        get_keymap(): Keymap;

        get_name(): string;

        get_pointer_a11y_settings(settings: PointerA11ySettings): void;

        get_touch_mode(): boolean;

        inhibit_unfocus(): void;

        is_unfocus_inhibited(): boolean;

        list_devices(): InputDevice[];

        set_pointer_a11y_dwell_click_type(click_type: PointerA11yDwellClickType): void;

        set_pointer_a11y_settings(settings: PointerA11ySettings): void;

        uninhibit_unfocus(): void;

        warp_pointer(x: number, y: number): void;
    }


    namespace Settings {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::dnd-drag-threshold": (pspec: GObject.ParamSpec) => void;
            "notify::double-click-distance": (pspec: GObject.ParamSpec) => void;
            "notify::double-click-time": (pspec: GObject.ParamSpec) => void;
            "notify::font-dpi": (pspec: GObject.ParamSpec) => void;
            "notify::font-name": (pspec: GObject.ParamSpec) => void;
            "notify::long-press-duration": (pspec: GObject.ParamSpec) => void;
            "notify::password-hint-time": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            dnd_drag_threshold: number;
            dndDragThreshold: number;
            double_click_distance: number;
            doubleClickDistance: number;
            double_click_time: number;
            doubleClickTime: number;
            font_dpi: number;
            fontDpi: number;
            font_name: string;
            fontName: string;
            long_press_duration: number;
            longPressDuration: number;
            password_hint_time: number;
            passwordHintTime: number;
        }
    }

    class Settings extends GObject.Object {
        static $gtype: GObject.GType<Settings>;

        // Properties
        get dnd_drag_threshold(): number;
        set dnd_drag_threshold(val: number);

        get dndDragThreshold(): number;
        set dndDragThreshold(val: number);

        get double_click_distance(): number;
        set double_click_distance(val: number);

        get doubleClickDistance(): number;
        set doubleClickDistance(val: number);

        get double_click_time(): number;
        set double_click_time(val: number);

        get doubleClickTime(): number;
        set doubleClickTime(val: number);

        get font_dpi(): number;
        set font_dpi(val: number);

        get fontDpi(): number;
        set fontDpi(val: number);

        get font_name(): string;
        set font_name(val: string);

        get fontName(): string;
        set fontName(val: string);

        get long_press_duration(): number;
        set long_press_duration(val: number);

        get longPressDuration(): number;
        set longPressDuration(val: number);

        get password_hint_time(): number;
        set password_hint_time(val: number);

        get passwordHintTime(): number;
        set passwordHintTime(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Settings.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Settings.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Settings.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Settings.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Settings.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Settings.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Settings.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Settings.SignalSignatures[K]>): void;
    }


    namespace ShaderEffect {
        // Signal signatures
        interface SignalSignatures extends OffscreenEffect.SignalSignatures {
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends OffscreenEffect.ConstructorProps {}
    }

    class ShaderEffect extends OffscreenEffect {
        static $gtype: GObject.GType<ShaderEffect>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ShaderEffect.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ShaderEffect.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_with_snippet(snippet: Cogl.Snippet): ShaderEffect;

        // Signals
        /** @signal */
        connect<K extends keyof ShaderEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ShaderEffect.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ShaderEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ShaderEffect.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ShaderEffect.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ShaderEffect.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_static_snippet(): Cogl.Snippet;

        // Methods
        set_uniform_float(name: string, n_components: number, value: number[]): void;

        set_uniform_value(name: string, value: GObject.Value | any): void;
    }


    namespace ShaderFloat {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    class ShaderFloat {
        static $gtype: GObject.GType<ShaderFloat>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ShaderFloat.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ShaderFloat.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ShaderFloat.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ShaderFloat.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ShaderFloat.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ShaderFloat.SignalSignatures[K]>): void;
    }


    namespace ShaderInt {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    class ShaderInt {
        static $gtype: GObject.GType<ShaderInt>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ShaderInt.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ShaderInt.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ShaderInt.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ShaderInt.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ShaderInt.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ShaderInt.SignalSignatures[K]>): void;
    }


    namespace ShaderMatrix {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    class ShaderMatrix {
        static $gtype: GObject.GType<ShaderMatrix>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ShaderMatrix.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ShaderMatrix.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ShaderMatrix.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ShaderMatrix.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ShaderMatrix.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ShaderMatrix.SignalSignatures[K]>): void;
    }


    namespace SnapConstraint {
        // Signal signatures
        interface SignalSignatures extends Constraint.SignalSignatures {
            "notify::from-edge": (pspec: GObject.ParamSpec) => void;
            "notify::offset": (pspec: GObject.ParamSpec) => void;
            "notify::source": (pspec: GObject.ParamSpec) => void;
            "notify::to-edge": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Constraint.ConstructorProps {
            from_edge: SnapEdge;
            fromEdge: SnapEdge;
            offset: number;
            source: Actor;
            to_edge: SnapEdge;
            toEdge: SnapEdge;
        }
    }

    class SnapConstraint extends Constraint {
        static $gtype: GObject.GType<SnapConstraint>;

        // Properties
        get from_edge(): SnapEdge;
        set from_edge(val: SnapEdge);

        get fromEdge(): SnapEdge;
        set fromEdge(val: SnapEdge);

        get offset(): number;
        set offset(val: number);

        get source(): Actor;
        set source(val: Actor);

        get to_edge(): SnapEdge;
        set to_edge(val: SnapEdge);

        get toEdge(): SnapEdge;
        set toEdge(val: SnapEdge);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SnapConstraint.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SnapConstraint.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](source: Actor | null, from_edge: SnapEdge, to_edge: SnapEdge, offset: number): SnapConstraint;

        // Signals
        /** @signal */
        connect<K extends keyof SnapConstraint.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SnapConstraint.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SnapConstraint.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SnapConstraint.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SnapConstraint.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SnapConstraint.SignalSignatures[K]>): void;

        // Methods
        get_edges(): [SnapEdge, SnapEdge];

        get_offset(): number;

        get_source(): Actor;

        set_edges(from_edge: SnapEdge, to_edge: SnapEdge): void;

        set_offset(offset: number): void;

        set_source(source: Actor | null): void;
    }


    namespace Sprite {
        // Signal signatures
        interface SignalSignatures extends Focus.SignalSignatures {
            "notify::role": (pspec: GObject.ParamSpec) => void;
            "notify::sequence": (pspec: GObject.ParamSpec) => void;
            "notify::sprite-device": (pspec: GObject.ParamSpec) => void;
            "notify::stage": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Focus.ConstructorProps {
            role: SpriteRole;
            sequence: EventSequence;
            sprite_device: InputDevice;
            spriteDevice: InputDevice;
        }
    }

    class Sprite extends Focus {
        static $gtype: GObject.GType<Sprite>;

        // Properties
        get role(): SpriteRole;

        get sequence(): EventSequence;

        get sprite_device(): InputDevice;

        get spriteDevice(): InputDevice;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Sprite.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Sprite.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Sprite.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Sprite.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Sprite.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Sprite.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Sprite.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Sprite.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_update_cursor(cursor: Cursor): void;

        // Methods
        get_coords(): Graphene.Point;

        get_role(): SpriteRole;
    }


    namespace Stage {
        // Signal signatures
        interface SignalSignatures extends Actor.SignalSignatures {
            /** @signal */
            "after-paint": (view: StageView, frame: Frame) => void;
            /** @signal */
            "after-update": (view: StageView, frame: Frame) => void;
            /** @signal */
            "before-paint": (view: StageView, frame: Frame) => void;
            /** @signal */
            "before-update": (view: StageView, frame: Frame) => void;
            /** @signal */
            "paint-view": (view: StageView, redraw_clip: Mtk.Region, frame: Frame) => void;
            /** @signal */
            "prepare-frame": (view: StageView, frame: Frame) => void;
            /** @signal */
            presented: (view: StageView, frame_info: null) => void;
            /** @signal */
            "skipped-paint": (view: StageView, frame: Frame) => void;
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
        interface ConstructorProps extends Actor.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Animatable.ConstructorProps {
            is_grabbed: boolean;
            isGrabbed: boolean;
            key_focus: Actor | null;
            keyFocus: Actor | null;
            perspective: Perspective;
        }
    }

    class Stage extends Actor implements Atk.ImplementorIface, Animatable {
        static $gtype: GObject.GType<Stage>;

        // Properties
        get is_grabbed(): boolean;

        get isGrabbed(): boolean;

        get key_focus(): Actor | null;
        set key_focus(val: Actor | null);

        get keyFocus(): Actor | null;
        set keyFocus(val: Actor | null);

        get perspective(): Perspective;

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

        // Virtual methods
        vfunc_before_paint(view: StageView, frame: Frame): void;

        vfunc_paint_view(view: StageView, redraw_clip: Mtk.Region, frame: Frame): void;

        vfunc_skipped_paint(view: StageView, frame: Frame): void;

        // Methods
        ensure_viewport(): void;

        foreach_sprite(func: StageInputForeachFunc): boolean;

        get_actor_at_pos(pick_mode: PickMode, x: number, y: number): Actor;

        get_capture_final_size(rect: Mtk.Rectangle): [boolean, number, number, number];

        get_event_actor(event: Event): Actor | null;

        get_grab_actor(): Actor | null;

        get_key_focus(): Actor | null;

        get_perspective(): Perspective | null;

        grab(actor: Actor): Grab;

        grab_inactive(actor: Actor): Grab;

        handle_event(event: Event): void;

        is_active(): boolean;

        paint_to_buffer(rect: Mtk.Rectangle, scale: number, data: Uint8Array | string, stride: number, format: Cogl.PixelFormat, color_state: ColorState | null, paint_flags: PaintFlag): boolean;

        paint_to_content(rect: Mtk.Rectangle, scale: number, color_state: ColorState | null, paint_flags: PaintFlag): Content;

        paint_to_framebuffer(framebuffer: Cogl.Framebuffer, rect: Mtk.Rectangle, scale: number, color_state: ColorState, paint_flags: PaintFlag): void;

        paint_to_framebuffer_clipped(framebuffer: Cogl.Framebuffer, rect: Mtk.Rectangle, scale: number, color_state: ColorState, redraw_clip: Mtk.Region, paint_flags: PaintFlag): void;

        read_pixels(x: number, y: number, width: number, height: number): Uint8Array;

        schedule_update(): void;

        set_active(is_active: boolean): void;

        set_key_focus(actor: Actor | null): void;

        find_property(property_name: string): GObject.ParamSpec;

        get_actor(): Actor;

        get_initial_state(property_name: string, value: GObject.Value | any): void;

        interpolate_value(property_name: string, interval: Interval, progress: number): [boolean, unknown];

        set_final_state(property_name: string, value: GObject.Value | any): void;

        vfunc_find_property(property_name: string): GObject.ParamSpec;

        vfunc_get_actor(): Actor;

        vfunc_get_initial_state(property_name: string, value: unknown): void;

        vfunc_interpolate_value(property_name: string, interval: Interval, progress: number): [boolean, GObject.Value | any];

        vfunc_set_final_state(property_name: string, value: unknown): void;
    }


    namespace StageView {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            destroy: () => void;
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::framebuffer": (pspec: GObject.ParamSpec) => void;
            "notify::layout": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
            "notify::output-color-state": (pspec: GObject.ParamSpec) => void;
            "notify::refresh-rate": (pspec: GObject.ParamSpec) => void;
            "notify::scale": (pspec: GObject.ParamSpec) => void;
            "notify::stage": (pspec: GObject.ParamSpec) => void;
            "notify::transform": (pspec: GObject.ParamSpec) => void;
            "notify::use-shadowfb": (pspec: GObject.ParamSpec) => void;
            "notify::vblank-duration-us": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            color_state: ColorState;
            colorState: ColorState;
            framebuffer: Cogl.Framebuffer;
            layout: Mtk.Rectangle;
            name: string;
            output_color_state: ColorState;
            outputColorState: ColorState;
            refresh_rate: number;
            refreshRate: number;
            scale: number;
            stage: Stage;
            transform: number;
            use_shadowfb: boolean;
            useShadowfb: boolean;
            vblank_duration_us: bigint | number;
            vblankDurationUs: bigint | number;
        }
    }

    class StageView extends GObject.Object {
        static $gtype: GObject.GType<StageView>;

        // Properties
        get color_state(): ColorState;
        set color_state(val: ColorState);

        get colorState(): ColorState;
        set colorState(val: ColorState);

        get framebuffer(): Cogl.Framebuffer;
        set framebuffer(val: Cogl.Framebuffer);

        get layout(): Mtk.Rectangle;
        set layout(val: Mtk.Rectangle);

        get name(): string;

        get output_color_state(): ColorState;
        set output_color_state(val: ColorState);

        get outputColorState(): ColorState;
        set outputColorState(val: ColorState);

        get refresh_rate(): number;
        set refresh_rate(val: number);

        get refreshRate(): number;
        set refreshRate(val: number);

        get scale(): number;
        set scale(val: number);

        get stage(): Stage;

        get transform(): number;

        get use_shadowfb(): boolean;

        get useShadowfb(): boolean;

        get vblank_duration_us(): number;

        get vblankDurationUs(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: StageView.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<StageView.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof StageView.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StageView.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof StageView.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StageView.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof StageView.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<StageView.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_default_paint_flags(): PaintFlag;

        vfunc_new_frame(): Frame;

        vfunc_schedule_update(): void;

        // Methods
        destroy(): void;

        get_default_paint_flags(): PaintFlag;

        get_framebuffer(): Cogl.Framebuffer;

        get_layout(rect: Mtk.Rectangle): void;

        get_offscreen_transformation_matrix(matrix: Graphene.Matrix): void;

        get_onscreen(): Cogl.Framebuffer;

        get_refresh_rate(): number;

        get_scale(): number;

        get_transform(): Mtk.MonitorTransform;

        has_shadowfb(): boolean;

        schedule_update_now(): void;
    }


    namespace Text {
        // Signal signatures
        interface SignalSignatures extends Actor.SignalSignatures {
            /** @signal */
            activate: () => void;
            /** @signal */
            "cursor-changed": () => void;
            /** @signal */
            "delete-text": (start_pos: number, end_pos: number) => void;
            /** @signal */
            "insert-text": (new_text: string, new_text_length: number, position: null) => void;
            /** @signal */
            "text-changed": () => void;
            "notify::activatable": (pspec: GObject.ParamSpec) => void;
            "notify::attributes": (pspec: GObject.ParamSpec) => void;
            "notify::buffer": (pspec: GObject.ParamSpec) => void;
            "notify::color": (pspec: GObject.ParamSpec) => void;
            "notify::cursor-color": (pspec: GObject.ParamSpec) => void;
            "notify::cursor-color-set": (pspec: GObject.ParamSpec) => void;
            "notify::cursor-position": (pspec: GObject.ParamSpec) => void;
            "notify::cursor-size": (pspec: GObject.ParamSpec) => void;
            "notify::cursor-visible": (pspec: GObject.ParamSpec) => void;
            "notify::editable": (pspec: GObject.ParamSpec) => void;
            "notify::ellipsize": (pspec: GObject.ParamSpec) => void;
            "notify::error-color": (pspec: GObject.ParamSpec) => void;
            "notify::error-color-set": (pspec: GObject.ParamSpec) => void;
            "notify::font-description": (pspec: GObject.ParamSpec) => void;
            "notify::font-name": (pspec: GObject.ParamSpec) => void;
            "notify::input-hints": (pspec: GObject.ParamSpec) => void;
            "notify::input-interceptor": (pspec: GObject.ParamSpec) => void;
            "notify::input-purpose": (pspec: GObject.ParamSpec) => void;
            "notify::justify": (pspec: GObject.ParamSpec) => void;
            "notify::line-alignment": (pspec: GObject.ParamSpec) => void;
            "notify::line-wrap": (pspec: GObject.ParamSpec) => void;
            "notify::line-wrap-mode": (pspec: GObject.ParamSpec) => void;
            "notify::max-length": (pspec: GObject.ParamSpec) => void;
            "notify::password-char": (pspec: GObject.ParamSpec) => void;
            "notify::selectable": (pspec: GObject.ParamSpec) => void;
            "notify::selected-text-color": (pspec: GObject.ParamSpec) => void;
            "notify::selected-text-color-set": (pspec: GObject.ParamSpec) => void;
            "notify::selection-bound": (pspec: GObject.ParamSpec) => void;
            "notify::selection-color": (pspec: GObject.ParamSpec) => void;
            "notify::selection-color-set": (pspec: GObject.ParamSpec) => void;
            "notify::single-line-mode": (pspec: GObject.ParamSpec) => void;
            "notify::text": (pspec: GObject.ParamSpec) => void;
            "notify::use-markup": (pspec: GObject.ParamSpec) => void;
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
        interface ConstructorProps extends Actor.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Animatable.ConstructorProps {
            activatable: boolean;
            attributes: Pango.AttrList;
            buffer: TextBuffer;
            color: Cogl.Color;
            cursor_color: Cogl.Color;
            cursorColor: Cogl.Color;
            cursor_color_set: boolean;
            cursorColorSet: boolean;
            cursor_position: number;
            cursorPosition: number;
            cursor_size: number;
            cursorSize: number;
            cursor_visible: boolean;
            cursorVisible: boolean;
            editable: boolean;
            ellipsize: Pango.EllipsizeMode;
            error_color: Cogl.Color;
            errorColor: Cogl.Color;
            error_color_set: boolean;
            errorColorSet: boolean;
            font_description: Pango.FontDescription;
            fontDescription: Pango.FontDescription;
            font_name: string;
            fontName: string;
            input_hints: InputContentHintFlags;
            inputHints: InputContentHintFlags;
            input_interceptor: Actor;
            inputInterceptor: Actor;
            input_purpose: InputContentPurpose;
            inputPurpose: InputContentPurpose;
            justify: boolean;
            line_alignment: Pango.Alignment;
            lineAlignment: Pango.Alignment;
            line_wrap: boolean;
            lineWrap: boolean;
            line_wrap_mode: Pango.WrapMode;
            lineWrapMode: Pango.WrapMode;
            max_length: number;
            maxLength: number;
            password_char: number;
            passwordChar: number;
            selectable: boolean;
            selected_text_color: Cogl.Color;
            selectedTextColor: Cogl.Color;
            selected_text_color_set: boolean;
            selectedTextColorSet: boolean;
            selection_bound: number;
            selectionBound: number;
            selection_color: Cogl.Color;
            selectionColor: Cogl.Color;
            selection_color_set: boolean;
            selectionColorSet: boolean;
            single_line_mode: boolean;
            singleLineMode: boolean;
            text: string;
            use_markup: boolean;
            useMarkup: boolean;
        }
    }

    class Text extends Actor implements Atk.ImplementorIface, Animatable {
        static $gtype: GObject.GType<Text>;

        // Properties
        get activatable(): boolean;
        set activatable(val: boolean);

        get attributes(): Pango.AttrList;
        set attributes(val: Pango.AttrList);

        get buffer(): TextBuffer;
        set buffer(val: TextBuffer);

        get color(): Cogl.Color;
        set color(val: Cogl.Color);

        get cursor_color(): Cogl.Color;
        set cursor_color(val: Cogl.Color);

        get cursorColor(): Cogl.Color;
        set cursorColor(val: Cogl.Color);

        get cursor_color_set(): boolean;

        get cursorColorSet(): boolean;

        get cursor_position(): number;
        set cursor_position(val: number);

        get cursorPosition(): number;
        set cursorPosition(val: number);

        get cursor_size(): number;
        set cursor_size(val: number);

        get cursorSize(): number;
        set cursorSize(val: number);

        get cursor_visible(): boolean;
        set cursor_visible(val: boolean);

        get cursorVisible(): boolean;
        set cursorVisible(val: boolean);

        get editable(): boolean;
        set editable(val: boolean);

        get ellipsize(): Pango.EllipsizeMode;
        set ellipsize(val: Pango.EllipsizeMode);

        get error_color(): Cogl.Color;
        set error_color(val: Cogl.Color);

        get errorColor(): Cogl.Color;
        set errorColor(val: Cogl.Color);

        get error_color_set(): boolean;

        get errorColorSet(): boolean;

        get font_description(): Pango.FontDescription;
        set font_description(val: Pango.FontDescription);

        get fontDescription(): Pango.FontDescription;
        set fontDescription(val: Pango.FontDescription);

        get font_name(): string;
        set font_name(val: string);

        get fontName(): string;
        set fontName(val: string);

        get input_hints(): InputContentHintFlags;
        set input_hints(val: InputContentHintFlags);

        get inputHints(): InputContentHintFlags;
        set inputHints(val: InputContentHintFlags);

        get input_interceptor(): Actor;
        set input_interceptor(val: Actor);

        get inputInterceptor(): Actor;
        set inputInterceptor(val: Actor);

        get input_purpose(): InputContentPurpose;
        set input_purpose(val: InputContentPurpose);

        get inputPurpose(): InputContentPurpose;
        set inputPurpose(val: InputContentPurpose);

        get justify(): boolean;
        set justify(val: boolean);

        get line_alignment(): Pango.Alignment;
        set line_alignment(val: Pango.Alignment);

        get lineAlignment(): Pango.Alignment;
        set lineAlignment(val: Pango.Alignment);

        get line_wrap(): boolean;
        set line_wrap(val: boolean);

        get lineWrap(): boolean;
        set lineWrap(val: boolean);

        get line_wrap_mode(): Pango.WrapMode;
        set line_wrap_mode(val: Pango.WrapMode);

        get lineWrapMode(): Pango.WrapMode;
        set lineWrapMode(val: Pango.WrapMode);

        get max_length(): number;
        set max_length(val: number);

        get maxLength(): number;
        set maxLength(val: number);

        get password_char(): number;
        set password_char(val: number);

        get passwordChar(): number;
        set passwordChar(val: number);

        get selectable(): boolean;
        set selectable(val: boolean);

        get selected_text_color(): Cogl.Color;
        set selected_text_color(val: Cogl.Color);

        get selectedTextColor(): Cogl.Color;
        set selectedTextColor(val: Cogl.Color);

        get selected_text_color_set(): boolean;

        get selectedTextColorSet(): boolean;

        get selection_bound(): number;
        set selection_bound(val: number);

        get selectionBound(): number;
        set selectionBound(val: number);

        get selection_color(): Cogl.Color;
        set selection_color(val: Cogl.Color);

        get selectionColor(): Cogl.Color;
        set selectionColor(val: Cogl.Color);

        get selection_color_set(): boolean;

        get selectionColorSet(): boolean;

        get single_line_mode(): boolean;
        set single_line_mode(val: boolean);

        get singleLineMode(): boolean;
        set singleLineMode(val: boolean);

        get text(): string;
        set text(val: string);

        get use_markup(): boolean;
        set use_markup(val: boolean);

        get useMarkup(): boolean;
        set useMarkup(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Text.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Text.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Text;

        static new_full(font_name: string, text: string, color: Cogl.Color): Text;

        static new_with_buffer(buffer: TextBuffer): Text;

        static new_with_text(font_name: string | null, text: string): Text;

        // Signals
        /** @signal */
        connect<K extends keyof Text.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Text.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Text.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Text.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Text.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Text.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_activate(): void;

        vfunc_cursor_changed(): void;

        vfunc_text_changed(): void;

        // Methods
        activate(): boolean;

        coords_to_position(x: number, y: number): number;

        delete_chars(n_chars: number): void;

        delete_selection(): boolean;

        delete_text(start_pos: bigint | number, end_pos: bigint | number): void;

        get_activatable(): boolean;

        get_attributes(): Pango.AttrList;

        get_buffer(): TextBuffer;

        get_chars(start_pos: bigint | number, end_pos: bigint | number): string;

        get_color(): Cogl.Color;

        get_cursor_color(): Cogl.Color;

        get_cursor_position(): number;

        get_cursor_rect(): Graphene.Rect;

        get_cursor_size(): number;

        get_cursor_visible(): boolean;

        get_editable(): boolean;

        get_ellipsize(): Pango.EllipsizeMode;

        get_error_color(): Cogl.Color;

        get_font_description(): Pango.FontDescription;

        get_font_name(): string;

        get_input_hints(): InputContentHintFlags;

        get_input_interceptor(): Actor;

        get_input_purpose(): InputContentPurpose;

        get_justify(): boolean;

        get_layout(): Pango.Layout;

        get_layout_offsets(): [number, number];

        get_line_alignment(): Pango.Alignment;

        get_line_wrap(): boolean;

        get_line_wrap_mode(): Pango.WrapMode;

        get_max_length(): number;

        get_password_char(): string;

        get_selectable(): boolean;

        get_selected_text_color(): Cogl.Color;

        get_selection(): string;

        get_selection_bound(): number;

        get_selection_color(): Cogl.Color;

        get_single_line_mode(): boolean;

        get_text(): string;

        get_use_markup(): boolean;

        has_preedit(): boolean;

        insert_text(text: string, position: bigint | number): void;

        insert_unichar(wc: string): void;

        position_to_coords(position: number): [boolean, number, number, number];

        set_activatable(activatable: boolean): void;

        set_attributes(attrs: Pango.AttrList | null): void;

        set_buffer(buffer: TextBuffer): void;

        set_color(color: Cogl.Color): void;

        set_cursor_color(color: Cogl.Color | null): void;

        set_cursor_position(position: number): void;

        set_cursor_size(size: number): void;

        set_cursor_visible(cursor_visible: boolean): void;

        set_editable(editable: boolean): void;

        set_ellipsize(mode: Pango.EllipsizeMode): void;

        set_error_color(color: Cogl.Color | null): void;

        set_font_description(font_desc: Pango.FontDescription): void;

        set_font_name(font_name: string | null): void;

        set_input_hints(hints: InputContentHintFlags): void;

        set_input_interceptor(input_interceptor: Actor | null): void;

        set_input_purpose(purpose: InputContentPurpose): void;

        set_justify(justify: boolean): void;

        set_line_alignment(alignment: Pango.Alignment): void;

        set_line_wrap(line_wrap: boolean): void;

        set_line_wrap_mode(wrap_mode: Pango.WrapMode): void;

        set_markup(markup: string | null): void;

        set_max_length(max: number): void;

        set_password_char(wc: string): void;

        set_preedit_string(preedit_str: string | null, preedit_attrs: Pango.AttrList | null, cursor_pos: number): void;

        set_selectable(selectable: boolean): void;

        set_selected_text_color(color: Cogl.Color | null): void;

        set_selection(start_pos: bigint | number, end_pos: bigint | number): void;

        set_selection_bound(selection_bound: number): void;

        set_selection_color(color: Cogl.Color | null): void;

        set_single_line_mode(single_line: boolean): void;

        set_text(text: string | null): void;

        set_use_markup(setting: boolean): void;

        find_property(property_name: string): GObject.ParamSpec;

        get_actor(): Actor;

        get_initial_state(property_name: string, value: GObject.Value | any): void;

        interpolate_value(property_name: string, interval: Interval, progress: number): [boolean, unknown];

        set_final_state(property_name: string, value: GObject.Value | any): void;

        vfunc_find_property(property_name: string): GObject.ParamSpec;

        vfunc_get_actor(): Actor;

        vfunc_get_initial_state(property_name: string, value: unknown): void;

        vfunc_interpolate_value(property_name: string, interval: Interval, progress: number): [boolean, GObject.Value | any];

        vfunc_set_final_state(property_name: string, value: unknown): void;
    }


    namespace TextBuffer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "deleted-text": (position: number, n_chars: number) => void;
            /** @signal */
            "inserted-text": (position: number, chars: string, n_chars: number) => void;
            "notify::length": (pspec: GObject.ParamSpec) => void;
            "notify::max-length": (pspec: GObject.ParamSpec) => void;
            "notify::text": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            length: number;
            max_length: number;
            maxLength: number;
            text: string;
        }
    }

    class TextBuffer extends GObject.Object {
        static $gtype: GObject.GType<TextBuffer>;

        // Properties
        get length(): number;

        get max_length(): number;
        set max_length(val: number);

        get maxLength(): number;
        set maxLength(val: number);

        get text(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TextBuffer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TextBuffer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): TextBuffer;

        static new_with_text(text: string | null, text_len: bigint | number): TextBuffer;

        // Signals
        /** @signal */
        connect<K extends keyof TextBuffer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextBuffer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TextBuffer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextBuffer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TextBuffer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TextBuffer.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_delete_text(position: number, n_chars: number): number;

        vfunc_deleted_text(position: number, n_chars: number): void;

        vfunc_get_length(): number;

        vfunc_get_text(n_bytes: number): string;

        vfunc_insert_text(position: number, chars: string, n_chars: number): number;

        vfunc_inserted_text(position: number, chars: string, n_chars: number): void;

        // Methods
        delete_text(position: number, n_chars: number): number;

        emit_deleted_text(position: number, n_chars: number): void;

        emit_inserted_text(position: number, chars: string, n_chars: number): void;

        get_bytes(): number;

        get_length(): number;

        get_max_length(): number;

        get_text(): string;

        insert_text(position: number, chars: string, n_chars: number): number;

        set_max_length(max_length: number): void;

        set_text(chars: string, n_chars: number): void;
    }


    namespace TextNode {
        // Signal signatures
        interface SignalSignatures extends PaintNode.SignalSignatures {}
    }

    class TextNode extends PaintNode {
        static $gtype: GObject.GType<TextNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](layout: Pango.Layout | null, color: Cogl.Color | null): TextNode;

        // Signals
        /** @signal */
        connect<K extends keyof TextNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TextNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TextNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TextNode.SignalSignatures[K]>): void;
    }


    namespace TextureContent {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, Content.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Content.ConstructorProps {}
    }

    class TextureContent extends GObject.Object implements Content {
        static $gtype: GObject.GType<TextureContent>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TextureContent.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TextureContent.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof TextureContent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextureContent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TextureContent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextureContent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TextureContent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TextureContent.SignalSignatures[K]>): void;

        // Static methods
        static new_from_texture(texture: Cogl.Texture, clip: Mtk.Rectangle | null): Content;

        // Methods
        get_texture(): Cogl.Texture;

        get_preferred_size(): [boolean, number, number];

        invalidate(): void;

        invalidate_size(): void;

        vfunc_attached(actor: Actor): void;

        vfunc_detached(actor: Actor): void;

        vfunc_get_preferred_size(): [boolean, number, number];

        vfunc_invalidate(): void;

        vfunc_invalidate_size(): void;

        vfunc_paint_content(actor: Actor, node: PaintNode, paint_context: PaintContext): void;
    }


    namespace TextureNode {
        // Signal signatures
        interface SignalSignatures extends PipelineNode.SignalSignatures {}
    }

    class TextureNode extends PipelineNode {
        static $gtype: GObject.GType<TextureNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](texture: Cogl.Texture, color: Cogl.Color | null, min_filter: ScalingFilter, mag_filter: ScalingFilter): TextureNode;

        // Conflicted with Clutter.PipelineNode.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof TextureNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextureNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TextureNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextureNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TextureNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TextureNode.SignalSignatures[K]>): void;
    }


    namespace Timeline {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            completed: () => void;
            /** @signal */
            "marker-reached": (marker_name: string, msecs: number) => void;
            /** @signal */
            "new-frame": (msecs: number) => void;
            /** @signal */
            paused: () => void;
            /** @signal */
            started: () => void;
            /** @signal */
            stopped: (is_finished: boolean) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::auto-reverse": (pspec: GObject.ParamSpec) => void;
            "notify::delay": (pspec: GObject.ParamSpec) => void;
            "notify::direction": (pspec: GObject.ParamSpec) => void;
            "notify::duration": (pspec: GObject.ParamSpec) => void;
            "notify::frame-clock": (pspec: GObject.ParamSpec) => void;
            "notify::progress-mode": (pspec: GObject.ParamSpec) => void;
            "notify::repeat-count": (pspec: GObject.ParamSpec) => void;
            /** @signal */
            "marker-reached::actor": (marker_name: string, msecs: number) => void;
            /** @signal */
            "marker-reached::auto-reverse": (marker_name: string, msecs: number) => void;
            /** @signal */
            "marker-reached::delay": (marker_name: string, msecs: number) => void;
            /** @signal */
            "marker-reached::direction": (marker_name: string, msecs: number) => void;
            /** @signal */
            "marker-reached::duration": (marker_name: string, msecs: number) => void;
            /** @signal */
            "marker-reached::frame-clock": (marker_name: string, msecs: number) => void;
            /** @signal */
            "marker-reached::progress-mode": (marker_name: string, msecs: number) => void;
            /** @signal */
            "marker-reached::repeat-count": (marker_name: string, msecs: number) => void;
            [key: `marker-reached::${string}`]: (marker_name: string, msecs: number) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            actor: Actor;
            auto_reverse: boolean;
            autoReverse: boolean;
            delay: number;
            direction: TimelineDirection;
            duration: number;
            frame_clock: FrameClock;
            frameClock: FrameClock;
            progress_mode: AnimationMode;
            progressMode: AnimationMode;
            repeat_count: number;
            repeatCount: number;
        }
    }

    class Timeline extends GObject.Object {
        static $gtype: GObject.GType<Timeline>;

        // Properties
        get actor(): Actor;
        set actor(val: Actor);

        get auto_reverse(): boolean;
        set auto_reverse(val: boolean);

        get autoReverse(): boolean;
        set autoReverse(val: boolean);

        get delay(): number;
        set delay(val: number);

        get direction(): TimelineDirection;
        set direction(val: TimelineDirection);

        get duration(): number;
        set duration(val: number);

        get frame_clock(): FrameClock;
        set frame_clock(val: FrameClock);

        get frameClock(): FrameClock;
        set frameClock(val: FrameClock);

        get progress_mode(): AnimationMode;
        set progress_mode(val: AnimationMode);

        get progressMode(): AnimationMode;
        set progressMode(val: AnimationMode);

        get repeat_count(): number;
        set repeat_count(val: number);

        get repeatCount(): number;
        set repeatCount(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Timeline.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Timeline.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_for_actor(actor: Actor, duration_ms: number): Timeline;

        static new_for_frame_clock(frame_clock: FrameClock, duration_ms: number): Timeline;

        // Signals
        /** @signal */
        connect<K extends keyof Timeline.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Timeline.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Timeline.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Timeline.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Timeline.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Timeline.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_completed(): void;

        vfunc_marker_reached(marker_name: string, msecs: number): void;

        vfunc_new_frame(msecs: number): void;

        vfunc_paused(): void;

        vfunc_started(): void;

        vfunc_stopped(is_finished: boolean): void;

        // Methods
        add_marker(marker_name: string, progress: number): void;

        add_marker_at_time(marker_name: string, msecs: number): void;

        advance(msecs: number): void;

        advance_to_marker(marker_name: string): void;

        get_actor(): Actor;

        get_auto_reverse(): boolean;

        get_cubic_bezier_progress(): [boolean, Graphene.Point, Graphene.Point];

        get_current_repeat(): number;

        get_delay(): number;

        get_delta(): number;

        get_direction(): TimelineDirection;

        get_duration(): number;

        get_duration_hint(): number;

        get_elapsed_time(): number;

        get_progress(): number;

        get_progress_mode(): AnimationMode;

        get_repeat_count(): number;

        get_step_progress(): [boolean, number, StepMode];

        has_marker(marker_name: string): boolean;

        is_playing(): boolean;

        list_markers(msecs: number): string[];

        pause(): void;

        remove_marker(marker_name: string): void;

        rewind(): void;

        set_actor(actor: Actor | null): void;

        set_auto_reverse(reverse: boolean): void;

        set_cubic_bezier_progress(c_1: Graphene.Point, c_2: Graphene.Point): void;

        set_delay(msecs: number): void;

        set_direction(direction: TimelineDirection): void;

        set_duration(msecs: number): void;

        set_frame_clock(frame_clock: FrameClock): void;

        set_progress_func(func: TimelineProgressFunc | null): void;

        set_progress_mode(mode: AnimationMode): void;

        set_repeat_count(count: number): void;

        set_step_progress(n_steps: number, step_mode: StepMode): void;

        skip(msecs: number): void;

        start(): void;

        stop(): void;
    }


    namespace TransformNode {
        // Signal signatures
        interface SignalSignatures extends PaintNode.SignalSignatures {}
    }

    class TransformNode extends PaintNode {
        static $gtype: GObject.GType<TransformNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](projection: Graphene.Matrix): TransformNode;

        // Signals
        /** @signal */
        connect<K extends keyof TransformNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TransformNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TransformNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TransformNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TransformNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TransformNode.SignalSignatures[K]>): void;
    }


    namespace Transition {
        // Signal signatures
        interface SignalSignatures extends Timeline.SignalSignatures {
            "notify::animatable": (pspec: GObject.ParamSpec) => void;
            "notify::interval": (pspec: GObject.ParamSpec) => void;
            "notify::remove-on-complete": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::auto-reverse": (pspec: GObject.ParamSpec) => void;
            "notify::delay": (pspec: GObject.ParamSpec) => void;
            "notify::direction": (pspec: GObject.ParamSpec) => void;
            "notify::duration": (pspec: GObject.ParamSpec) => void;
            "notify::frame-clock": (pspec: GObject.ParamSpec) => void;
            "notify::progress-mode": (pspec: GObject.ParamSpec) => void;
            "notify::repeat-count": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Timeline.ConstructorProps {
            animatable: Animatable;
            interval: Interval;
            remove_on_complete: boolean;
            removeOnComplete: boolean;
        }
    }

    abstract class Transition extends Timeline {
        static $gtype: GObject.GType<Transition>;

        // Properties
        get animatable(): Animatable;
        set animatable(val: Animatable);

        get interval(): Interval;
        set interval(val: Interval);

        get remove_on_complete(): boolean;
        set remove_on_complete(val: boolean);

        get removeOnComplete(): boolean;
        set removeOnComplete(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Transition.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Transition.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Transition.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Transition.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Transition.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Transition.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Transition.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Transition.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_attached(animatable: Animatable): void;

        vfunc_compute_value(animatable: Animatable, interval: Interval, progress: number): void;

        vfunc_detached(animatable: Animatable): void;

        // Methods
        get_animatable(): Animatable;

        get_interval(): Interval;

        get_remove_on_complete(): boolean;

        set_animatable(animatable: Animatable | null): void;

        set_from(value: GObject.Value | any): void;

        set_interval(interval: Interval | null): void;

        set_remove_on_complete(remove_complete: boolean): void;

        set_to(value: GObject.Value | any): void;
    }


    namespace TransitionGroup {
        // Signal signatures
        interface SignalSignatures extends Transition.SignalSignatures {
            "notify::animatable": (pspec: GObject.ParamSpec) => void;
            "notify::interval": (pspec: GObject.ParamSpec) => void;
            "notify::remove-on-complete": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::auto-reverse": (pspec: GObject.ParamSpec) => void;
            "notify::delay": (pspec: GObject.ParamSpec) => void;
            "notify::direction": (pspec: GObject.ParamSpec) => void;
            "notify::duration": (pspec: GObject.ParamSpec) => void;
            "notify::frame-clock": (pspec: GObject.ParamSpec) => void;
            "notify::progress-mode": (pspec: GObject.ParamSpec) => void;
            "notify::repeat-count": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Transition.ConstructorProps {}
    }

    class TransitionGroup extends Transition {
        static $gtype: GObject.GType<TransitionGroup>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TransitionGroup.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TransitionGroup.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): TransitionGroup;

        // Signals
        /** @signal */
        connect<K extends keyof TransitionGroup.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TransitionGroup.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TransitionGroup.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TransitionGroup.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TransitionGroup.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TransitionGroup.SignalSignatures[K]>): void;

        // Methods
        add_transition(transition: Transition): void;

        remove_all(): void;

        remove_transition(transition: Transition): void;
    }


    namespace VirtualInputDevice {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::device-type": (pspec: GObject.ParamSpec) => void;
            "notify::seat": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            device_type: InputDeviceType;
            deviceType: InputDeviceType;
            seat: Seat;
        }
    }

    class VirtualInputDevice extends GObject.Object {
        static $gtype: GObject.GType<VirtualInputDevice>;

        // Properties
        get device_type(): InputDeviceType;

        get deviceType(): InputDeviceType;

        get seat(): Seat;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: VirtualInputDevice.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<VirtualInputDevice.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof VirtualInputDevice.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VirtualInputDevice.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof VirtualInputDevice.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VirtualInputDevice.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof VirtualInputDevice.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<VirtualInputDevice.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_notify_absolute_motion(time_us: number, x: number, y: number): void;

        vfunc_notify_button(time_us: number, button: number, button_state: ButtonState): void;

        vfunc_notify_discrete_scroll(time_us: number, direction: ScrollDirection, scroll_source: ScrollSource): void;

        vfunc_notify_key(time_us: number, key: number, key_state: KeyState): void;

        vfunc_notify_keyval(time_us: number, keyval: number, key_state: KeyState): void;

        vfunc_notify_relative_motion(time_us: number, dx: number, dy: number): void;

        vfunc_notify_scroll_continuous(time_us: number, dx: number, dy: number, scroll_source: ScrollSource, finish_flags: ScrollFinishFlags): void;

        vfunc_notify_tablet_mode(tablet_mode: boolean): void;

        vfunc_notify_touch_down(time_us: number, slot: number, x: number, y: number): void;

        vfunc_notify_touch_motion(time_us: number, slot: number, x: number, y: number): void;

        vfunc_notify_touch_up(time_us: number, slot: number): void;

        vfunc_notify_touchpad_pinch(time_us: number, phase: TouchpadGesturePhase, fingers: number, dx: number, dy: number, angle_delta: number, scale: number): void;

        vfunc_notify_touchpad_swipe(time_us: number, phase: TouchpadGesturePhase, fingers: number, dx: number, dy: number): void;

        // Methods
        get_device_type(): number;

        get_seat(): Seat;

        notify_absolute_motion(time_us: bigint | number, x: number, y: number): void;

        notify_button(time_us: bigint | number, button: number, button_state: ButtonState): void;

        notify_discrete_scroll(time_us: bigint | number, direction: ScrollDirection, scroll_source: ScrollSource): void;

        notify_key(time_us: bigint | number, key: number, key_state: KeyState): void;

        notify_keyval(time_us: bigint | number, keyval: number, key_state: KeyState): void;

        notify_relative_motion(time_us: bigint | number, dx: number, dy: number): void;

        notify_scroll_continuous(time_us: bigint | number, dx: number, dy: number, scroll_source: ScrollSource, finish_flags: ScrollFinishFlags): void;

        notify_tablet_mode(tablet_mode: boolean): void;

        notify_touch_down(time_us: bigint | number, slot: number, x: number, y: number): void;

        notify_touch_motion(time_us: bigint | number, slot: number, x: number, y: number): void;

        notify_touch_up(time_us: bigint | number, slot: number): void;

        notify_touchpad_pinch(time_us: bigint | number, phase: TouchpadGesturePhase, fingers: number, dx: number, dy: number, angle_delta: number, scale: number): void;

        notify_touchpad_swipe(time_us: bigint | number, phase: TouchpadGesturePhase, fingers: number, dx: number, dy: number): void;
    }


    type ActionClass = typeof Action;

    type ActorAccessibleClass = typeof ActorAccessible;

    abstract class ActorAccessiblePrivate {
        static $gtype: GObject.GType<ActorAccessiblePrivate>;
    }


    class ActorBox {
        static $gtype: GObject.GType<ActorBox>;

        // Fields
        x1: number;

        y1: number;

        x2: number;

        y2: number;

        // Constructors

        constructor(properties?: Partial<{
            x1: number;
            y1: number;
            x2: number;
            y2: number;
        }>);

        static ["new"](x_1: number, y_1: number, x_2: number, y_2: number): ActorBox;

        // Static methods
        static alloc(): ActorBox;

        static clamp_to_pixel(box: ActorBox): ActorBox;

        // Methods
        contains(x: number, y: number): boolean;

        copy(): ActorBox;

        equal(box_b: ActorBox): boolean;

        free(): void;

        from_vertices(verts: Graphene.Point3D[]): void;

        get_area(): number;

        get_height(): number;

        get_origin(): [number, number];

        get_size(): [number, number];

        get_width(): number;

        get_x(): number;

        get_y(): number;

        init(x_1: number, y_1: number, x_2: number, y_2: number): ActorBox;

        init_rect(x: number, y: number, width: number, height: number): void;

        interpolate(_final: ActorBox, progress: number): ActorBox;

        is_initialized(): boolean;

        scale(scale: number): void;

        set_origin(x: number, y: number): void;

        set_size(width: number, height: number): void;

        union(b: ActorBox): ActorBox;
    }


    type ActorClass = typeof Actor;

    class ActorIter {
        static $gtype: GObject.GType<ActorIter>;

        // Constructors
        constructor(properties?: Partial<{}>);

        // Methods
        destroy(): void;

        init(root: Actor): void;

        is_valid(): boolean;

        next(): [boolean, Actor | null];

        prev(): [boolean, Actor | null];

        remove(): void;
    }


    type ActorMetaClass = typeof ActorMeta;

    abstract class ActorMetaPrivate {
        static $gtype: GObject.GType<ActorMetaPrivate>;
    }


    type ActorNodeClass = typeof ActorNode;

    abstract class ActorPrivate {
        static $gtype: GObject.GType<ActorPrivate>;
    }


    type AlignConstraintClass = typeof AlignConstraint;

    type AnimatableInterface = typeof Animatable;

    abstract class AnyEvent {
        static $gtype: GObject.GType<AnyEvent>;
    }


    type BackendClass = typeof Backend;

    type BinLayoutClass = typeof BinLayout;

    type BindConstraintClass = typeof BindConstraint;

    type BindingPoolClass = typeof BindingPool;

    type BlitNodeClass = typeof BlitNode;

    type BlurEffectClass = typeof BlurEffect;

    type BlurNodeClass = typeof BlurNode;

    type BoxLayoutClass = typeof BoxLayout;

    type BrightnessContrastEffectClass = typeof BrightnessContrastEffect;

    abstract class ButtonEvent {
        static $gtype: GObject.GType<ButtonEvent>;
    }


    class Cicp {
        static $gtype: GObject.GType<Cicp>;

        // Fields
        primaries: CicpPrimaries;

        transfer: CicpTransfer;

        matrix_coefficients: number;

        video_full_range_flag: number;
    }


    type ClickGestureClass = typeof ClickGesture;

    type ClipNodeClass = typeof ClipNode;

    type CloneClass = typeof Clone;

    type ColorNodeClass = typeof ColorNode;

    type ColorOp3DLutClass = typeof ColorOp3DLut;

    type ColorOpClampUnitClass = typeof ColorOpClampUnit;

    type ColorOpClass = typeof ColorOp;

    type ColorOpCurve1DClass = typeof ColorOpCurve1D;

    type ColorOpGammaPowerClass = typeof ColorOpGammaPower;

    type ColorOpMatrix4x4Class = typeof ColorOpMatrix4x4;

    type ColorOpMultiplyClass = typeof ColorOpMultiply;

    type ColorOpPqEotfClass = typeof ColorOpPqEotf;

    type ColorOpPqInvEotfClass = typeof ColorOpPqInvEotf;

    type ColorOpPremultiplyClass = typeof ColorOpPremultiply;

    type ColorOpSrgbPiecewiseEotfClass = typeof ColorOpSrgbPiecewiseEotf;

    type ColorOpSrgbPiecewiseInvEotfClass = typeof ColorOpSrgbPiecewiseInvEotf;

    type ColorOpUnpremultiplyClass = typeof ColorOpUnpremultiply;

    type ColorOpYcbcrMatrixClass = typeof ColorOpYcbcrMatrix;

    type ColorPipelineClass = typeof ColorPipeline;

    type ColorStateClass = typeof ColorState;

    type ColorStateIccClass = typeof ColorStateIcc;

    type ColorStateParamsClass = typeof ColorStateParams;

    type ColorTransformClass = typeof ColorTransform;

    class Colorimetry {
        static $gtype: GObject.GType<Colorimetry>;

        // Fields
        type: ColorimetryType;

        // Methods
        clear(): void;

        equal(other_colorimetry: Colorimetry): boolean;

        from_XYZ(from_XYZ: Graphene.Matrix): void;

        get_primaries(): Primaries;

        to_XYZ(to_XYZ: Graphene.Matrix): void;

        to_string(): string;
    }


    type ColorizeEffectClass = typeof ColorizeEffect;

    type ConstraintClass = typeof Constraint;

    type ContentInterface = typeof Content;

    type ContextClass = typeof Context;

    abstract class CrossingEvent {
        static $gtype: GObject.GType<CrossingEvent>;
    }


    type CursorClass = typeof Cursor;

    type DeformEffectClass = typeof DeformEffect;

    type DesaturateEffectClass = typeof DesaturateEffect;

    abstract class DeviceEvent {
        static $gtype: GObject.GType<DeviceEvent>;
    }


    class EOTF {
        static $gtype: GObject.GType<EOTF>;

        // Fields
        type: EOTFType;

        // Methods
        equal(other_eotf: EOTF): boolean;

        get_default_luminance(): Luminance;

        to_string(): string;
    }


    type EffectClass = typeof Effect;

    abstract class EventSequence {
        static $gtype: GObject.GType<EventSequence>;

        // Methods
        get_slot(): number;
    }


    type FixedLayoutClass = typeof FixedLayout;

    type FlowLayoutClass = typeof FlowLayout;

    type FocusClass = typeof Focus;

    abstract class Frame {
        static $gtype: GObject.GType<Frame>;

        // Methods
        get_cogl_frame_info(): Cogl.FrameInfo;

        get_count(): number;

        get_expected_presentation_time(expected_presentation_time_us: bigint | number): boolean;

        get_frame_deadline(frame_deadline_us: bigint | number): boolean;

        has_result(): boolean;

        ref(): Frame;

        set_result(result: FrameResult): void;

        take_cogl_frame_info(frame_info: Cogl.FrameInfo): void;

        unref(): void;
    }


    type FrameClockClass = typeof FrameClock;

    type FrameClockDriverClass = typeof FrameClockDriver;

    type GestureClass = typeof Gesture;

    type GrabClass = typeof Grab;

    type GraphicsRecoveryContextClass = typeof GraphicsRecoveryContext;

    type GridLayoutClass = typeof GridLayout;

    abstract class IMEvent {
        static $gtype: GObject.GType<IMEvent>;
    }


    type InputDeviceClass = typeof InputDevice;

    type InputDeviceToolClass = typeof InputDeviceTool;

    type InputFocusClass = typeof InputFocus;

    type InputMethodClass = typeof InputMethod;

    type IntervalClass = typeof Interval;

    type KeyControllerClass = typeof KeyController;

    abstract class KeyEvent {
        static $gtype: GObject.GType<KeyEvent>;
    }


    type KeyFocusClass = typeof KeyFocus;

    type KeyframeTransitionClass = typeof KeyframeTransition;

    type KeymapClass = typeof Keymap;

    type LayerNodeClass = typeof LayerNode;

    type LayoutManagerClass = typeof LayoutManager;

    type LayoutMetaClass = typeof LayoutMeta;

    type LongPressGestureClass = typeof LongPressGesture;

    class Luminance {
        static $gtype: GObject.GType<Luminance>;

        // Fields
        type: LuminanceType;

        min: number;

        max: number;

        ref: number;

        mastering_max: number;

        // Static methods
        static get_default_sdr(): Luminance;

        // Methods
        equal(other_lum: Luminance): boolean;
    }


    class Margin {
        static $gtype: GObject.GType<Margin>;

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

        static ["new"](): Margin;

        // Methods
        copy(): Margin;

        free(): void;
    }


    type MotionControllerClass = typeof MotionController;

    abstract class MotionEvent {
        static $gtype: GObject.GType<MotionEvent>;
    }


    type OffscreenEffectClass = typeof OffscreenEffect;

    abstract class PadButtonEvent {
        static $gtype: GObject.GType<PadButtonEvent>;
    }


    abstract class PadDialEvent {
        static $gtype: GObject.GType<PadDialEvent>;
    }


    abstract class PadRingEvent {
        static $gtype: GObject.GType<PadRingEvent>;
    }


    abstract class PadStripEvent {
        static $gtype: GObject.GType<PadStripEvent>;
    }


    type PageTurnEffectClass = typeof PageTurnEffect;

    class PaintContext {
        static $gtype: GObject.GType<PaintContext>;

        // Constructors
        constructor(framebuffer: Cogl.Framebuffer, redraw_clip: Mtk.Region, paint_flags: PaintFlag, color_state: ColorState);

        // Methods
        destroy(): void;

        get_framebuffer(): Cogl.Framebuffer;

        get_redraw_clip(): Mtk.Region;

        pop_color_state(): void;

        pop_framebuffer(): void;

        push_color_state(color_state: ColorState): void;

        push_framebuffer(framebuffer: Cogl.Framebuffer): void;

        ref(): PaintContext;

        unref(): void;
    }


    type PaintNodeClass = typeof PaintNode;

    abstract class PaintNodePrivate {
        static $gtype: GObject.GType<PaintNodePrivate>;
    }


    abstract class PaintVolume {
        static $gtype: GObject.GType<PaintVolume>;

        // Methods
        copy(): PaintVolume;

        free(): void;

        get_depth(): number;

        get_height(): number;

        get_origin(): Graphene.Point3D;

        get_width(): number;

        scale(x_scale: number, y_scale: number, z_scale: number): void;

        set_depth(depth: number): void;

        set_from_allocation(actor: Actor): boolean;

        set_height(height: number): void;

        set_origin(origin: Graphene.Point3D): void;

        set_width(width: number): void;

        union(another_pv: PaintVolume): void;

        union_box(box: ActorBox): void;
    }


    type PanGestureClass = typeof PanGesture;

    class Perspective {
        static $gtype: GObject.GType<Perspective>;

        // Fields
        fovy: number;

        aspect: number;

        z_near: number;

        z_far: number;

        // Constructors

        constructor(properties?: Partial<{
            fovy: number;
            aspect: number;
            z_near: number;
            z_far: number;
        }>);
    }


    abstract class PickContext {
        static $gtype: GObject.GType<PickContext>;

        // Methods
        destroy(): void;

        get_transform(): Graphene.Matrix;

        log_overlap(actor: Actor): void;

        log_pick(box: ActorBox, actor: Actor): void;

        pop_clip(): void;

        pop_transform(): void;

        push_clip(box: ActorBox): void;

        push_transform(transform: Graphene.Matrix): void;

        ref(): PickContext;

        unref(): void;
    }


    abstract class PipelineCache {
        static $gtype: GObject.GType<PipelineCache>;
    }


    type PipelineNodeClass = typeof PipelineNode;

    class PointerA11ySettings {
        static $gtype: GObject.GType<PointerA11ySettings>;

        // Fields
        controls: PointerA11yFlags;

        dwell_click_type: PointerA11yDwellClickType;

        dwell_mode: PointerA11yDwellMode;

        dwell_gesture_single: PointerA11yDwellDirection;

        dwell_gesture_double: PointerA11yDwellDirection;

        dwell_gesture_drag: PointerA11yDwellDirection;

        dwell_gesture_secondary: PointerA11yDwellDirection;

        secondary_click_delay: number;

        dwell_delay: number;

        dwell_threshold: number;
    }


    class PreeditAttribute {
        static $gtype: GObject.GType<PreeditAttribute>;

        // Fields
        hint: PreeditStyleHint;

        start: number;

        end: number;
    }


    type PressGestureClass = typeof PressGesture;

    class Primaries {
        static $gtype: GObject.GType<Primaries>;

        // Fields
        r_x: number;

        r_y: number;

        g_x: number;

        g_y: number;

        b_x: number;

        b_y: number;

        w_x: number;

        w_y: number;

        // Constructors

        constructor(properties?: Partial<{
            r_x: number;
            r_y: number;
            g_x: number;
            g_y: number;
            b_x: number;
            b_y: number;
            w_x: number;
            w_y: number;
        }>);

        // Methods
        ensure_normalized_range(): void;

        equal(other_primaries: Primaries): boolean;
    }


    type PropertyTransitionClass = typeof PropertyTransition;

    abstract class ProximityEvent {
        static $gtype: GObject.GType<ProximityEvent>;
    }


    type RootNodeClass = typeof RootNode;

    abstract class ScrollActor {
        static $gtype: GObject.GType<ScrollActor>;
    }


    type ScrollControllerClass = typeof ScrollController;

    abstract class ScrollEvent {
        static $gtype: GObject.GType<ScrollEvent>;
    }


    type SeatClass = typeof Seat;

    type SettingsClass = typeof Settings;

    type ShaderEffectClass = typeof ShaderEffect;

    type SnapConstraintClass = typeof SnapConstraint;

    type SpriteClass = typeof Sprite;

    type StageClass = typeof Stage;

    type StageViewClass = typeof StageView;

    type TextBufferClass = typeof TextBuffer;

    type TextClass = typeof Text;

    type TextNodeClass = typeof TextNode;

    type TextureContentClass = typeof TextureContent;

    type TextureNodeClass = typeof TextureNode;

    class TextureVertex {
        static $gtype: GObject.GType<TextureVertex>;

        // Fields
        x: number;

        y: number;

        z: number;

        tx: number;

        ty: number;

        color: Cogl.Color;

        // Constructors

        constructor(properties?: Partial<{
            x: number;
            y: number;
            z: number;
            tx: number;
            ty: number;
            color: Cogl.Color;
        }>);
    }


    type TimelineClass = typeof Timeline;

    abstract class TouchEvent {
        static $gtype: GObject.GType<TouchEvent>;
    }


    abstract class TouchpadHoldEvent {
        static $gtype: GObject.GType<TouchpadHoldEvent>;
    }


    abstract class TouchpadPinchEvent {
        static $gtype: GObject.GType<TouchpadPinchEvent>;
    }


    abstract class TouchpadSwipeEvent {
        static $gtype: GObject.GType<TouchpadSwipeEvent>;
    }


    type TransformNodeClass = typeof TransformNode;

    type TransitionClass = typeof Transition;

    type TransitionGroupClass = typeof TransitionGroup;

    type VirtualInputDeviceClass = typeof VirtualInputDevice;

    class Event {
        static $gtype: GObject.GType<Event>;

        // Static methods
        static add_filter(stage: Stage | null, func: EventFilterFunc): number;

        static get(): Event;

        static prepend_filter(stage: Stage | null, func: EventFilterFunc): number;

        static remove_filter(id: number): void;

        // Methods
        copy(): Event;

        free(): void;

        get_angle(target: Event): number;

        get_axes(): [number, number];

        get_button(): number;

        get_coords(): [number, number];

        get_device_tool(): InputDeviceTool;

        get_distance(target: Event): number;

        get_event_code(): number;

        get_event_sequence(): EventSequence;

        get_flags(): EventFlags;

        get_gesture_motion_delta(): [number, number];

        get_gesture_motion_delta_unaccelerated(): [number, number];

        get_gesture_phase(): TouchpadGesturePhase;

        get_gesture_pinch_angle_delta(): number;

        get_gesture_pinch_scale(): number;

        get_im_delete_length(): number;

        get_im_location(offset: number, anchor: number): boolean;

        get_im_preedit_hints(preedit_hints: PreeditAttribute, n_preedit_hints: number): boolean;

        get_im_preedit_reset_mode(): PreeditResetMode;

        get_im_text(): string;

        get_key_code(): number;

        get_key_state(): [ModifierType, ModifierType, ModifierType];

        get_key_symbol(): number;

        get_key_unicode(): string;

        get_mode_group(): number;

        get_pad_details(): [boolean, number, number, InputDevicePadSource | null, number];

        get_position(position: Graphene.Point): void;

        get_related(): Actor;

        get_relative_motion(dx: number, dy: number, dx_unaccel: number, dy_unaccel: number, dx_constrained: number, dy_constrained: number): boolean;

        get_scroll_delta(): [number, number];

        get_scroll_direction(): ScrollDirection;

        get_scroll_finish_flags(): ScrollFinishFlags;

        get_scroll_flags(): ScrollFlags;

        get_scroll_source(): ScrollSource;

        get_source(): Actor;

        get_source_device(): InputDevice;

        get_state(): ModifierType;

        get_time(): number;

        get_time_us(): number;

        get_touchpad_gesture_finger_count(): number;

        has_control_modifier(): boolean;

        has_shift_modifier(): boolean;

        is_pointer_emulated(): boolean;

        put(): void;

        type(): EventType;
    }


    namespace Animatable {
        /**
         * Interface for implementing Animatable.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_find_property(property_name: string): GObject.ParamSpec;

            vfunc_get_actor(): Actor;

            vfunc_get_initial_state(property_name: string, value: unknown): void;

            vfunc_interpolate_value(property_name: string, interval: Interval, progress: number): [boolean, GObject.Value | any];

            vfunc_set_final_state(property_name: string, value: unknown): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface AnimatableNamespace {
        $gtype: GObject.GType<Animatable>;
        prototype: Animatable;
    }
    interface Animatable extends GObject.Object, Animatable.Interface {

        // Methods
        find_property(property_name: string): GObject.ParamSpec;

        get_actor(): Actor;

        get_initial_state(property_name: string, value: GObject.Value | any): void;

        interpolate_value(property_name: string, interval: Interval, progress: number): [boolean, unknown];

        set_final_state(property_name: string, value: GObject.Value | any): void;
    }


    export const Animatable: AnimatableNamespace & {
        new (): Animatable; // This allows `obj instanceof Animatable`
    };

    namespace Content {
        // Signal signatures
        interface SignalSignatures {
            /** @signal */
            attached: (actor: Actor) => void;
            /** @signal */
            detached: (actor: Actor) => void;
        }
        /**
         * Interface for implementing Content.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_attached(actor: Actor): void;

            vfunc_detached(actor: Actor): void;

            vfunc_get_preferred_size(): [boolean, number, number];

            vfunc_invalidate(): void;

            vfunc_invalidate_size(): void;

            vfunc_paint_content(actor: Actor, node: PaintNode, paint_context: PaintContext): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ContentNamespace {
        $gtype: GObject.GType<Content>;
        prototype: Content;
    }
    interface Content extends GObject.Object, Content.Interface {

        // Methods
        get_preferred_size(): [boolean, number, number];

        invalidate(): void;

        invalidate_size(): void;
    }


    export const Content: ContentNamespace & {
        new (): Content; // This allows `obj instanceof Content`
    };

    const __name__: string;

    const __version__: string;
}

export default Clutter;

}

declare module 'gi://Clutter' {
    import Clutter51 from 'gi://Clutter?version=51';
    export default Clutter51;
}
// END
