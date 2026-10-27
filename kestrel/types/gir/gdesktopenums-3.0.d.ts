/// <reference path="./gobject-2.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://GDesktopEnums?version=3.0' {

// Module dependencies
import type GObject from 'gi://GObject?version=2.0';

export namespace GDesktopEnums {

    /**
     * GDesktopEnums-3.0
     */


    enum AccentColor {
        BLUE = 0,
        TEAL = 1,
        GREEN = 2,
        YELLOW = 3,
        ORANGE = 4,
        RED = 5,
        PINK = 6,
        PURPLE = 7,
        SLATE = 8,
    }


    enum BackgroundShading {
        SOLID = 0,
        VERTICAL = 1,
        HORIZONTAL = 2,
    }


    enum BackgroundStyle {
        NONE = 0,
        WALLPAPER = 1,
        CENTERED = 2,
        SCALED = 3,
        STRETCHED = 4,
        ZOOM = 5,
        SPANNED = 6,
    }


    enum ClockFormat {
        "24H" = 0,
        "12H" = 1,
    }


    enum ColorScheme {
        DEFAULT = 0,
        PREFER_DARK = 1,
        PREFER_LIGHT = 2,
    }


    enum DeviceSendEvents {
        ENABLED = 0,
        DISABLED = 1,
        DISABLED_ON_EXTERNAL_MOUSE = 2,
    }


    enum FocusMode {
        CLICK = 0,
        SLOPPY = 1,
        MOUSE = 2,
    }


    enum FocusNewWindows {
        SMART = 0,
        STRICT = 1,
    }


    enum FontAntialiasingMode {
        NONE = 0,
        GRAYSCALE = 1,
        RGBA = 2,
    }


    enum FontHinting {
        NONE = 0,
        SLIGHT = 1,
        MEDIUM = 2,
        FULL = 3,
    }


    enum FontRendering {
        AUTOMATIC = 0,
        MANUAL = 1,
    }


    enum FontRgbaOrder {
        RGBA = 0,
        RGB = 1,
        BGR = 2,
        VRGB = 3,
        VBGR = 4,
    }


    enum LocationAccuracyLevel {
        COUNTRY = 0,
        CITY = 1,
        NEIGHBORHOOD = 2,
        STREET = 3,
        EXACT = 4,
    }


    enum MagnifierCaretTrackingMode {
        NONE = 0,
        CENTERED = 1,
        PROPORTIONAL = 2,
        PUSH = 3,
    }


    enum MagnifierFocusTrackingMode {
        NONE = 0,
        CENTERED = 1,
        PROPORTIONAL = 2,
        PUSH = 3,
    }


    enum MagnifierMouseTrackingMode {
        NONE = 0,
        CENTERED = 1,
        PROPORTIONAL = 2,
        PUSH = 3,
    }


    enum MagnifierScreenPosition {
        NONE = 0,
        FULL_SCREEN = 1,
        TOP_HALF = 2,
        BOTTOM_HALF = 3,
        LEFT_HALF = 4,
        RIGHT_HALF = 5,
    }


    enum MouseDwellDirection {
        LEFT = 0,
        RIGHT = 1,
        UP = 2,
        DOWN = 3,
    }


    enum MouseDwellMode {
        WINDOW = 0,
        GESTURE = 1,
    }


    enum MouseScrollMethod {
        DEFAULT = 0,
        NONE = 1,
        ON_BUTTON_DOWN = 2,
    }


    enum PadButtonAction {
        NONE = 0,
        HELP = 1,
        SWITCH_MONITOR = 2,
        KEYBINDING = 3,
    }


    enum PointerAccelProfile {
        DEFAULT = 0,
        FLAT = 1,
        ADAPTIVE = 2,
        CUSTOM = 3,
    }


    enum PointingStickScrollMethod {
        DEFAULT = 0,
        NONE = 1,
        ON_BUTTON_DOWN = 2,
    }


    enum ProxyMode {
        NONE = 0,
        MANUAL = 1,
        AUTO = 2,
    }


    enum ReducedMotion {
        NO_PREFERENCE = 0,
        REDUCE = 1,
    }


    enum ScreensaverMode {
        BLANK_ONLY = 0,
        RANDOM = 1,
        SINGLE = 2,
    }


    enum StylusButtonAction {
        DEFAULT = 0,
        MIDDLE = 1,
        RIGHT = 2,
        BACK = 3,
        FORWARD = 4,
        SWITCH_MONITOR = 5,
        KEYBINDING = 6,
    }


    enum StylusEraserButtonMode {
        DEFAULT = 0,
        BUTTON = 1,
    }


    enum TabletMapping {
        ABSOLUTE = 0,
        RELATIVE = 1,
    }


    enum TitlebarAction {
        TOGGLE_SHADE = 0,
        TOGGLE_MAXIMIZE = 1,
        TOGGLE_MAXIMIZE_HORIZONTALLY = 2,
        TOGGLE_MAXIMIZE_VERTICALLY = 3,
        MINIMIZE = 4,
        NONE = 5,
        LOWER = 6,
        MENU = 7,
    }


    enum ToolbarIconSize {
        SMALL = 0,
        LARGE = 1,
    }


    enum ToolbarStyle {
        BOTH = 0,
        BOTH_HORIZ = 1,
        ICONS = 2,
        TEXT = 3,
    }


    enum TouchpadClickMethod {
        DEFAULT = 0,
        NONE = 1,
        AREAS = 2,
        FINGERS = 3,
    }


    enum TouchpadHandedness {
        RIGHT = 0,
        LEFT = 1,
        MOUSE = 2,
    }


    enum TouchpadTapButtonMap {
        DEFAULT = 0,
        LRM = 1,
        LMR = 2,
    }


    enum UsbProtection {
        LOCKSCREEN = 0,
        ALWAYS = 1,
    }


    enum VisualBellType {
        FULLSCREEN_FLASH = 0,
        FRAME_FLASH = 1,
    }


    enum Weekday {
        DEFAULT = 0,
        MONDAY = 1,
        TUESDAY = 2,
        WEDNESDAY = 3,
        THURSDAY = 4,
        FRIDAY = 5,
        SATURDAY = 6,
        SUNDAY = 7,
    }


    const __name__: string;

    const __version__: string;
}

export default GDesktopEnums;

}

declare module 'gi://GDesktopEnums' {
    import GDesktopEnums30 from 'gi://GDesktopEnums?version=3.0';
    export default GDesktopEnums30;
}
// END
