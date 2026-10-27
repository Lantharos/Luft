/// <reference path="./meta-51.d.ts" />
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
/// <reference path="./gdkpixbuf-2.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://St?version=51' {

// Module dependencies
import type Meta from 'gi://Meta?version=51';
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
import type GdkPixbuf from 'gi://GdkPixbuf?version=2.0';

export namespace St {

    /**
     * St-51
     */


    export namespace BackgroundSize {
        export const $gtype: GObject.GType<BackgroundSize>;
    }

    enum BackgroundSize {
        AUTO = 0,
        CONTAIN = 1,
        COVER = 2,
        FIXED = 3,
    }


    export namespace ClipboardType {
        export const $gtype: GObject.GType<ClipboardType>;
    }

    enum ClipboardType {
        PRIMARY = 0,
        CLIPBOARD = 1,
    }


    export namespace Corner {
        export const $gtype: GObject.GType<Corner>;
    }

    enum Corner {
        TOPLEFT = 0,
        TOPRIGHT = 1,
        BOTTOMRIGHT = 2,
        BOTTOMLEFT = 3,
    }


    export namespace DirectionType {
        export const $gtype: GObject.GType<DirectionType>;
    }

    enum DirectionType {
        TAB_FORWARD = 0,
        TAB_BACKWARD = 1,
        UP = 2,
        DOWN = 3,
        LEFT = 4,
        RIGHT = 5,
    }


    export namespace GradientType {
        export const $gtype: GObject.GType<GradientType>;
    }

    enum GradientType {
        NONE = 0,
        VERTICAL = 1,
        HORIZONTAL = 2,
        RADIAL = 3,
    }


    export namespace IconStyle {
        export const $gtype: GObject.GType<IconStyle>;
    }

    enum IconStyle {
        REQUESTED = 0,
        REGULAR = 1,
        SYMBOLIC = 2,
    }


    class IconThemeError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static NOT_FOUND: number;

        static FAILED: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace PolicyType {
        export const $gtype: GObject.GType<PolicyType>;
    }

    enum PolicyType {
        ALWAYS = 0,
        AUTOMATIC = 1,
        NEVER = 2,
        EXTERNAL = 3,
    }


    export namespace ReducedMotion {
        export const $gtype: GObject.GType<ReducedMotion>;
    }

    enum ReducedMotion {
        NO_PREFERENCE = 0,
        REDUCE = 1,
    }


    export namespace Side {
        export const $gtype: GObject.GType<Side>;
    }

    enum Side {
        TOP = 0,
        RIGHT = 1,
        BOTTOM = 2,
        LEFT = 3,
    }


    export namespace SystemColorScheme {
        export const $gtype: GObject.GType<SystemColorScheme>;
    }

    enum SystemColorScheme {
        DEFAULT = 0,
        PREFER_DARK = 1,
        PREFER_LIGHT = 2,
    }


    export namespace TextAlign {
        export const $gtype: GObject.GType<TextAlign>;
    }

    enum TextAlign {
        LEFT = 0,
        CENTER = 1,
        RIGHT = 2,
        START = 3,
        END = 4,
        JUSTIFY = 5,
    }


    export namespace TextureCachePolicy {
        export const $gtype: GObject.GType<TextureCachePolicy>;
    }

    enum TextureCachePolicy {
        NONE = 0,
        FOREVER = 1,
    }


    function describe_actor(actor: Clutter.Actor): string;

    function icon_theme_error_quark(): GLib.Quark;

    interface ClipboardCallbackFunc {
        (clipboard: Clipboard, text: string): void;
    }

    interface ClipboardContentCallbackFunc {
        (clipboard: Clipboard, bytes: GLib.Bytes): void;
    }

    export namespace ButtonMask {
        export const $gtype: GObject.GType<ButtonMask>;
    }

    enum ButtonMask {
        PRIMARY = 1,
        MIDDLE = 2,
        SECONDARY = 4,
    }


    export namespace IconLookupFlags {
        export const $gtype: GObject.GType<IconLookupFlags>;
    }

    enum IconLookupFlags {
        NO_SVG = 1,
        FORCE_SVG = 2,
        GENERIC_FALLBACK = 4,
        FORCE_SIZE = 8,
        FORCE_REGULAR = 16,
        FORCE_SYMBOLIC = 32,
        DIR_LTR = 64,
        DIR_RTL = 128,
    }


    export namespace KeynavFlags {
        export const $gtype: GObject.GType<KeynavFlags>;
    }

    enum KeynavFlags {
        NONE = 0,
        WRAP_HORIZONTALLY = 1,
        WRAP_VERTICALLY = 2,
    }


    export namespace TextDecoration {
        export const $gtype: GObject.GType<TextDecoration>;
    }

    enum TextDecoration {
        UNDERLINE = 1,
        OVERLINE = 2,
        LINE_THROUGH = 4,
        BLINK = 8,
    }


    namespace Adjustment {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            changed: () => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::lower": (pspec: GObject.ParamSpec) => void;
            "notify::page-increment": (pspec: GObject.ParamSpec) => void;
            "notify::page-size": (pspec: GObject.ParamSpec) => void;
            "notify::step-increment": (pspec: GObject.ParamSpec) => void;
            "notify::upper": (pspec: GObject.ParamSpec) => void;
            "notify::value": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Clutter.Animatable.ConstructorProps {
            actor: Clutter.Actor;
            lower: number;
            page_increment: number;
            pageIncrement: number;
            page_size: number;
            pageSize: number;
            step_increment: number;
            stepIncrement: number;
            upper: number;
            value: number;
        }
    }

    class Adjustment extends GObject.Object implements Clutter.Animatable {
        static $gtype: GObject.GType<Adjustment>;

        // Properties
        get actor(): Clutter.Actor;
        set actor(val: Clutter.Actor);

        get lower(): number;
        set lower(val: number);

        get page_increment(): number;
        set page_increment(val: number);

        get pageIncrement(): number;
        set pageIncrement(val: number);

        get page_size(): number;
        set page_size(val: number);

        get pageSize(): number;
        set pageSize(val: number);

        get step_increment(): number;
        set step_increment(val: number);

        get stepIncrement(): number;
        set stepIncrement(val: number);

        get upper(): number;
        set upper(val: number);

        get value(): number;
        set value(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Adjustment.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Adjustment.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](actor: Clutter.Actor | null, value: number, lower: number, upper: number, step_increment: number, page_increment: number, page_size: number): Adjustment;

        // Signals
        /** @signal */
        connect<K extends keyof Adjustment.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Adjustment.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Adjustment.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Adjustment.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Adjustment.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Adjustment.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_changed(): void;

        // Methods
        add_transition(name: string, transition: Clutter.Transition): void;

        adjust_for_scroll_event(source: Clutter.ScrollSource, delta: number): void;

        clamp_page(lower: number, upper: number): void;

        get_actor(): Clutter.Actor;

        get_lower(): number;

        get_page_increment(): number;

        get_page_size(): number;

        get_step_increment(): number;

        get_transition(name: string): Clutter.Transition | null;

        get_upper(): number;

        get_value(): number;

        get_values(): [number, number, number, number, number, number];

        remove_transition(name: string): void;

        set_actor(actor: Clutter.Actor): void;

        set_lower(lower: number): void;

        set_page_increment(page: number): void;

        set_page_size(size: number): void;

        set_step_increment(step: number): void;

        set_upper(upper: number): void;

        set_value(value: number): void;

        set_values(value: number, lower: number, upper: number, step_increment: number, page_increment: number, page_size: number): void;

        find_property(property_name: string): GObject.ParamSpec;

        get_initial_state(property_name: string, value: GObject.Value | any): void;

        interpolate_value(property_name: string, interval: Clutter.Interval, progress: number): [boolean, unknown];

        set_final_state(property_name: string, value: GObject.Value | any): void;

        vfunc_find_property(property_name: string): GObject.ParamSpec;

        vfunc_get_actor(): Clutter.Actor;

        vfunc_get_initial_state(property_name: string, value: unknown): void;

        vfunc_interpolate_value(property_name: string, interval: Clutter.Interval, progress: number): [boolean, GObject.Value | any];

        vfunc_set_final_state(property_name: string, value: unknown): void;
    }


    namespace Bin {
        // Signal signatures
        interface SignalSignatures extends Widget.SignalSignatures {
            "notify::child": (pspec: GObject.ParamSpec) => void;
            "notify::can-focus": (pspec: GObject.ParamSpec) => void;
            "notify::hover": (pspec: GObject.ParamSpec) => void;
            "notify::keynav-flags": (pspec: GObject.ParamSpec) => void;
            "notify::label-actor": (pspec: GObject.ParamSpec) => void;
            "notify::pseudo-class": (pspec: GObject.ParamSpec) => void;
            "notify::style": (pspec: GObject.ParamSpec) => void;
            "notify::style-class": (pspec: GObject.ParamSpec) => void;
            "notify::track-hover": (pspec: GObject.ParamSpec) => void;
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
        interface ConstructorProps<A extends Clutter.Actor = Clutter.Actor> extends Widget.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {
            child: A;
        }
    }

    class Bin<A extends Clutter.Actor = Clutter.Actor> extends Widget implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<Bin>;

        // Properties
        get child(): A;
        set child(val: A);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Bin.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Bin.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Bin;

        // Signals
        /** @signal */
        connect<K extends keyof Bin.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Bin.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Bin.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Bin.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Bin.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Bin.SignalSignatures[K]>): void;

        // Methods
        get_child(): A | null;

        set_child(child: A | null): void;
    }


    namespace BorderImage {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class BorderImage extends GObject.Object {
        static $gtype: GObject.GType<BorderImage>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: BorderImage.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<BorderImage.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](file: Gio.File, border_top: number, border_right: number, border_bottom: number, border_left: number, scale_factor: number): BorderImage;

        // Signals
        /** @signal */
        connect<K extends keyof BorderImage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BorderImage.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BorderImage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BorderImage.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BorderImage.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BorderImage.SignalSignatures[K]>): void;

        // Methods
        equal(other: BorderImage): boolean;

        get_borders(border_top: number, border_right: number, border_bottom: number, border_left: number): void;

        get_file(): Gio.File;
    }


    namespace BoxLayout {
        // Signal signatures
        interface SignalSignatures extends Viewport.SignalSignatures {
            "notify::orientation": (pspec: GObject.ParamSpec) => void;
            "notify::clip-to-view": (pspec: GObject.ParamSpec) => void;
            "notify::can-focus": (pspec: GObject.ParamSpec) => void;
            "notify::hover": (pspec: GObject.ParamSpec) => void;
            "notify::keynav-flags": (pspec: GObject.ParamSpec) => void;
            "notify::label-actor": (pspec: GObject.ParamSpec) => void;
            "notify::pseudo-class": (pspec: GObject.ParamSpec) => void;
            "notify::style": (pspec: GObject.ParamSpec) => void;
            "notify::style-class": (pspec: GObject.ParamSpec) => void;
            "notify::track-hover": (pspec: GObject.ParamSpec) => void;
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
            "notify::hadjustment": (pspec: GObject.ParamSpec) => void;
            "notify::vadjustment": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Viewport.ConstructorProps<Clutter.BoxLayout>, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps, Scrollable.ConstructorProps {
            orientation: Clutter.Orientation;
        }
    }

    class BoxLayout extends Viewport<Clutter.BoxLayout> implements Atk.ImplementorIface, Clutter.Animatable, Scrollable {
        static $gtype: GObject.GType<BoxLayout>;

        // Properties
        get orientation(): Clutter.Orientation;
        set orientation(val: Clutter.Orientation);

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
        get_orientation(): Clutter.Orientation;

        set_orientation(orientation: Clutter.Orientation): void;

        /** @category Inherited from St.Scrollable */
        get hadjustment(): Adjustment;
        set hadjustment(val: Adjustment);

        /** @category Inherited from St.Scrollable */
        get vadjustment(): Adjustment;
        set vadjustment(val: Adjustment);

        get_adjustments(hadjustment: Adjustment, vadjustment: Adjustment): void;

        set_adjustments(hadjustment: Adjustment, vadjustment: Adjustment): void;

        vfunc_get_adjustments(hadjustment: Adjustment, vadjustment: Adjustment): void;

        vfunc_set_adjustments(hadjustment: Adjustment, vadjustment: Adjustment): void;
    }


    namespace Button {
        // Signal signatures
        interface SignalSignatures extends Bin.SignalSignatures {
            /** @signal */
            clicked: (clicked_button: number) => void;
            "notify::button-mask": (pspec: GObject.ParamSpec) => void;
            "notify::checked": (pspec: GObject.ParamSpec) => void;
            "notify::icon-name": (pspec: GObject.ParamSpec) => void;
            "notify::label": (pspec: GObject.ParamSpec) => void;
            "notify::pressed": (pspec: GObject.ParamSpec) => void;
            "notify::toggle-mode": (pspec: GObject.ParamSpec) => void;
            "notify::child": (pspec: GObject.ParamSpec) => void;
            "notify::can-focus": (pspec: GObject.ParamSpec) => void;
            "notify::hover": (pspec: GObject.ParamSpec) => void;
            "notify::keynav-flags": (pspec: GObject.ParamSpec) => void;
            "notify::label-actor": (pspec: GObject.ParamSpec) => void;
            "notify::pseudo-class": (pspec: GObject.ParamSpec) => void;
            "notify::style": (pspec: GObject.ParamSpec) => void;
            "notify::style-class": (pspec: GObject.ParamSpec) => void;
            "notify::track-hover": (pspec: GObject.ParamSpec) => void;
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
        interface ConstructorProps<A extends Clutter.Actor = Clutter.Actor> extends Bin.ConstructorProps<A>, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {
            button_mask: ButtonMask;
            buttonMask: ButtonMask;
            checked: boolean;
            icon_name: string | null;
            iconName: string | null;
            label: string;
            pressed: boolean;
            toggle_mode: boolean;
            toggleMode: boolean;
        }
    }

    class Button<A extends Clutter.Actor = Clutter.Actor> extends Bin<A> implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<Button>;

        // Properties
        get button_mask(): ButtonMask;
        set button_mask(val: ButtonMask);

        get buttonMask(): ButtonMask;
        set buttonMask(val: ButtonMask);

        get checked(): boolean;
        set checked(val: boolean);

        get icon_name(): string | null;
        set icon_name(val: string | null);

        get iconName(): string | null;
        set iconName(val: string | null);

        get label(): string;
        set label(val: string);

        get pressed(): boolean;

        get toggle_mode(): boolean;
        set toggle_mode(val: boolean);

        get toggleMode(): boolean;
        set toggleMode(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Button.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Button.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Button;

        static new_with_label(text: string): Button;

        // Signals
        /** @signal */
        connect<K extends keyof Button.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Button.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Button.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Button.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Button.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Button.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_clicked(clicked_button: number): void;

        // Methods
        fake_release(): void;

        get_button_mask(): ButtonMask;

        get_checked(): boolean;

        get_icon_name(): string | null;

        get_label(): string;

        get_pressed(): boolean;

        get_toggle_mode(): boolean;

        set_button_mask(mask: ButtonMask): void;

        set_checked(checked: boolean): void;

        set_icon_name(icon_name: string): void;

        set_label(text: string | null): void;

        set_toggle_mode(toggle: boolean): void;
    }


    namespace Clipboard {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Clipboard extends GObject.Object {
        static $gtype: GObject.GType<Clipboard>;

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

        // Static methods
        static get_default(): Clipboard;

        // Methods
        get_content(type: ClipboardType, mimetype: string, callback: ClipboardContentCallbackFunc): void;

        get_mimetypes(type: ClipboardType): string[];

        get_text(type: ClipboardType, callback: ClipboardCallbackFunc): void;

        set_content(type: ClipboardType, mimetype: string, bytes: GLib.Bytes | Uint8Array): void;

        set_text(type: ClipboardType, text: string): void;
    }


    namespace Cursor {
        // Signal signatures
        interface SignalSignatures extends Meta.Cursor.SignalSignatures {
            "notify::backend": (pspec: GObject.ParamSpec) => void;
            "notify::size": (pspec: GObject.ParamSpec) => void;
            "notify::theme-name": (pspec: GObject.ParamSpec) => void;
            "notify::color-state": (pspec: GObject.ParamSpec) => void;
            "notify::cursor-type": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Meta.Cursor.ConstructorProps, Gio.Initable.ConstructorProps {}
    }

    class Cursor extends Meta.Cursor implements Gio.Initable {
        static $gtype: GObject.GType<Cursor>;

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

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace DndStartGesture {
        // Signal signatures
        interface SignalSignatures extends Clutter.Gesture.SignalSignatures {
            "notify::manual-mode": (pspec: GObject.ParamSpec) => void;
            "notify::timeout-threshold": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Clutter.Gesture.ConstructorProps {
            manual_mode: boolean;
            manualMode: boolean;
            timeout_threshold: number;
            timeoutThreshold: number;
        }
    }

    class DndStartGesture extends Clutter.Gesture {
        static $gtype: GObject.GType<DndStartGesture>;

        // Properties
        get manual_mode(): boolean;
        set manual_mode(val: boolean);

        get manualMode(): boolean;
        set manualMode(val: boolean);

        get timeout_threshold(): number;
        set timeout_threshold(val: number);

        get timeoutThreshold(): number;
        set timeoutThreshold(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DndStartGesture.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DndStartGesture.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DndStartGesture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DndStartGesture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DndStartGesture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DndStartGesture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DndStartGesture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DndStartGesture.SignalSignatures[K]>): void;

        // Methods
        get_drag_triggering_event(): Clutter.Event;

        get_manual_mode(): boolean;

        get_point_begin_event(): Clutter.Event;

        get_timeout_threshold(): number;

        set_manual_mode(manual_mode: boolean): void;

        set_timeout_threshold(timeout_threshold_ms: number): void;

        start_drag(start_event: Clutter.Event): void;
    }


    namespace DrawingArea {
        // Signal signatures
        interface SignalSignatures extends Widget.SignalSignatures {
            /** @signal */
            repaint: () => void;
            "notify::can-focus": (pspec: GObject.ParamSpec) => void;
            "notify::hover": (pspec: GObject.ParamSpec) => void;
            "notify::keynav-flags": (pspec: GObject.ParamSpec) => void;
            "notify::label-actor": (pspec: GObject.ParamSpec) => void;
            "notify::pseudo-class": (pspec: GObject.ParamSpec) => void;
            "notify::style": (pspec: GObject.ParamSpec) => void;
            "notify::style-class": (pspec: GObject.ParamSpec) => void;
            "notify::track-hover": (pspec: GObject.ParamSpec) => void;
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
        interface ConstructorProps extends Widget.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {}
    }

    class DrawingArea extends Widget implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<DrawingArea>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DrawingArea.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DrawingArea.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DrawingArea.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DrawingArea.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DrawingArea.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DrawingArea.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DrawingArea.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DrawingArea.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_repaint(): void;

        // Methods
        get_context(): cairo.Context;

    // Conflicted with Clutter.Actor.get_context
        get_context(...args: never[]): any;

        get_surface_size(): [number, number];

        queue_repaint(): void;
    }


    namespace Entry {
        // Signal signatures
        interface SignalSignatures extends Widget.SignalSignatures {
            /** @signal */
            "primary-icon-clicked": () => void;
            /** @signal */
            "secondary-icon-clicked": () => void;
            "notify::clutter-text": (pspec: GObject.ParamSpec) => void;
            "notify::hint-actor": (pspec: GObject.ParamSpec) => void;
            "notify::hint-text": (pspec: GObject.ParamSpec) => void;
            "notify::input-hints": (pspec: GObject.ParamSpec) => void;
            "notify::input-purpose": (pspec: GObject.ParamSpec) => void;
            "notify::primary-icon": (pspec: GObject.ParamSpec) => void;
            "notify::secondary-icon": (pspec: GObject.ParamSpec) => void;
            "notify::text": (pspec: GObject.ParamSpec) => void;
            "notify::can-focus": (pspec: GObject.ParamSpec) => void;
            "notify::hover": (pspec: GObject.ParamSpec) => void;
            "notify::keynav-flags": (pspec: GObject.ParamSpec) => void;
            "notify::label-actor": (pspec: GObject.ParamSpec) => void;
            "notify::pseudo-class": (pspec: GObject.ParamSpec) => void;
            "notify::style": (pspec: GObject.ParamSpec) => void;
            "notify::style-class": (pspec: GObject.ParamSpec) => void;
            "notify::track-hover": (pspec: GObject.ParamSpec) => void;
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
        interface ConstructorProps extends Widget.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {
            clutter_text: Clutter.Text;
            clutterText: Clutter.Text;
            hint_actor: Clutter.Actor | null;
            hintActor: Clutter.Actor | null;
            hint_text: string | null;
            hintText: string | null;
            input_hints: Clutter.InputContentHintFlags;
            inputHints: Clutter.InputContentHintFlags;
            input_purpose: Clutter.InputContentPurpose;
            inputPurpose: Clutter.InputContentPurpose;
            primary_icon: Clutter.Actor | null;
            primaryIcon: Clutter.Actor | null;
            secondary_icon: Clutter.Actor | null;
            secondaryIcon: Clutter.Actor | null;
            text: string;
        }
    }

    class Entry extends Widget implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<Entry>;

        // Properties
        get clutter_text(): Clutter.Text;

        get clutterText(): Clutter.Text;

        get hint_actor(): Clutter.Actor | null;
        set hint_actor(val: Clutter.Actor | null);

        get hintActor(): Clutter.Actor | null;
        set hintActor(val: Clutter.Actor | null);

        get hint_text(): string | null;
        set hint_text(val: string | null);

        get hintText(): string | null;
        set hintText(val: string | null);

        get input_hints(): Clutter.InputContentHintFlags;
        set input_hints(val: Clutter.InputContentHintFlags);

        get inputHints(): Clutter.InputContentHintFlags;
        set inputHints(val: Clutter.InputContentHintFlags);

        get input_purpose(): Clutter.InputContentPurpose;
        set input_purpose(val: Clutter.InputContentPurpose);

        get inputPurpose(): Clutter.InputContentPurpose;
        set inputPurpose(val: Clutter.InputContentPurpose);

        get primary_icon(): Clutter.Actor | null;
        set primary_icon(val: Clutter.Actor | null);

        get primaryIcon(): Clutter.Actor | null;
        set primaryIcon(val: Clutter.Actor | null);

        get secondary_icon(): Clutter.Actor | null;
        set secondary_icon(val: Clutter.Actor | null);

        get secondaryIcon(): Clutter.Actor | null;
        set secondaryIcon(val: Clutter.Actor | null);

        get text(): string;
        set text(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Entry.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Entry.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](text: string | null): Entry;

        // Conflicted with Clutter.Actor.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof Entry.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Entry.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Entry.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Entry.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Entry.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Entry.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_primary_icon_clicked(): void;

        vfunc_secondary_icon_clicked(): void;

        // Methods
        get_clutter_text(): Clutter.Text;

        get_hint_actor(): Clutter.Actor | null;

        get_hint_text(): string | null;

        get_input_hints(): Clutter.InputContentHintFlags;

        get_input_purpose(): Clutter.InputContentPurpose;

        get_primary_icon(): Clutter.Actor | null;

        get_secondary_icon(): Clutter.Actor | null;

        get_text(): string;

        set_hint_actor(hint_actor: Clutter.Actor | null): void;

        set_hint_text(text: string | null): void;

        set_input_hints(hints: Clutter.InputContentHintFlags): void;

        set_input_purpose(purpose: Clutter.InputContentPurpose): void;

        set_primary_icon(icon: Clutter.Actor | null): void;

        set_secondary_icon(icon: Clutter.Actor | null): void;

        set_text(text: string | null): void;
    }


    namespace FocusManager {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class FocusManager extends GObject.Object {
        static $gtype: GObject.GType<FocusManager>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FocusManager.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FocusManager.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FocusManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FocusManager.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FocusManager.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FocusManager.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FocusManager.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FocusManager.SignalSignatures[K]>): void;

        // Static methods
        static get_for_stage(stage: Clutter.Stage): FocusManager;

        // Methods
        add_group(root: Widget): void;

        get_group(widget: Widget): Widget;

        remove_group(root: Widget): void;
    }


    namespace GenericAccessible {
        // Signal signatures
        interface SignalSignatures extends WidgetAccessible.SignalSignatures, Atk.Component.SignalSignatures, Atk.Value.SignalSignatures {
            /** @signal */
            "get-current-value": () => number;
            /** @signal */
            "get-maximum-value": () => number;
            /** @signal */
            "get-minimum-increment": () => number;
            /** @signal */
            "get-minimum-value": () => number;
            /** @signal */
            "set-current-value": (new_value: number) => void;
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
        interface ConstructorProps extends WidgetAccessible.ConstructorProps, Atk.Component.ConstructorProps, Atk.Value.ConstructorProps {}
    }

    class GenericAccessible extends WidgetAccessible implements Atk.Component, Atk.Value {
        static $gtype: GObject.GType<GenericAccessible>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: GenericAccessible.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<GenericAccessible.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_for_actor(actor: Clutter.Actor): GenericAccessible;

        // Signals
        /** @signal */
        connect<K extends keyof GenericAccessible.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GenericAccessible.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof GenericAccessible.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GenericAccessible.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof GenericAccessible.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<GenericAccessible.SignalSignatures[K]>): void;

        get_current_value(): unknown;

        get_increment(): number;

        get_maximum_value(): unknown;

        get_minimum_increment(): unknown;

        get_minimum_value(): unknown;

        get_range(): Atk.Range | null;

        get_sub_ranges(): Atk.Range[];

        get_value_and_text(): [number, string];

        set_current_value(value: GObject.Value | any): boolean;

        set_value(new_value: number): void;

        vfunc_get_current_value(): GObject.Value | any;

        vfunc_get_increment(): number;

        vfunc_get_maximum_value(): GObject.Value | any;

        vfunc_get_minimum_increment(): GObject.Value | any;

        vfunc_get_minimum_value(): GObject.Value | any;

        vfunc_get_range(): Atk.Range | null;

        vfunc_get_sub_ranges(): Atk.Range[];

        vfunc_get_value_and_text(): [number, string];

        vfunc_set_current_value(value: unknown): boolean;

        vfunc_set_value(new_value: number): void;
    }


    namespace Icon {
        // Signal signatures
        interface SignalSignatures extends Widget.SignalSignatures {
            "notify::fallback-gicon": (pspec: GObject.ParamSpec) => void;
            "notify::fallback-icon-name": (pspec: GObject.ParamSpec) => void;
            "notify::gicon": (pspec: GObject.ParamSpec) => void;
            "notify::icon-name": (pspec: GObject.ParamSpec) => void;
            "notify::icon-size": (pspec: GObject.ParamSpec) => void;
            "notify::is-symbolic": (pspec: GObject.ParamSpec) => void;
            "notify::can-focus": (pspec: GObject.ParamSpec) => void;
            "notify::hover": (pspec: GObject.ParamSpec) => void;
            "notify::keynav-flags": (pspec: GObject.ParamSpec) => void;
            "notify::label-actor": (pspec: GObject.ParamSpec) => void;
            "notify::pseudo-class": (pspec: GObject.ParamSpec) => void;
            "notify::style": (pspec: GObject.ParamSpec) => void;
            "notify::style-class": (pspec: GObject.ParamSpec) => void;
            "notify::track-hover": (pspec: GObject.ParamSpec) => void;
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
        interface ConstructorProps extends Widget.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {
            fallback_gicon: Gio.Icon;
            fallbackGicon: Gio.Icon;
            fallback_icon_name: string;
            fallbackIconName: string;
            gicon: Gio.Icon | null;
            icon_name: string | null;
            iconName: string | null;
            icon_size: number;
            iconSize: number;
            is_symbolic: boolean;
            isSymbolic: boolean;
        }
    }

    class Icon extends Widget implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<Icon>;

        // Properties
        get fallback_gicon(): Gio.Icon;
        set fallback_gicon(val: Gio.Icon);

        get fallbackGicon(): Gio.Icon;
        set fallbackGicon(val: Gio.Icon);

        get fallback_icon_name(): string;
        set fallback_icon_name(val: string);

        get fallbackIconName(): string;
        set fallbackIconName(val: string);

        get gicon(): Gio.Icon | null;
        set gicon(val: Gio.Icon | null);

        get icon_name(): string | null;
        set icon_name(val: string | null);

        get iconName(): string | null;
        set iconName(val: string | null);

        get icon_size(): number;
        set icon_size(val: number);

        get iconSize(): number;
        set iconSize(val: number);

        get is_symbolic(): boolean;

        get isSymbolic(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Icon.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Icon.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Icon;

        // Signals
        /** @signal */
        connect<K extends keyof Icon.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Icon.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Icon.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Icon.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Icon.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Icon.SignalSignatures[K]>): void;

        // Methods
        get_fallback_gicon(): Gio.Icon;

        get_fallback_icon_name(): string;

        get_gicon(): Gio.Icon | null;

        get_icon_name(): string | null;

        get_icon_size(): number;

        get_is_symbolic(): boolean;

        set_fallback_gicon(fallback_gicon: Gio.Icon | null): void;

        set_fallback_icon_name(fallback_icon_name: string | null): void;

        set_gicon(gicon: Gio.Icon | null): void;

        set_icon_name(icon_name: string | null): void;

        set_icon_size(size: number): void;
    }


    namespace IconInfo {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class IconInfo extends GObject.Object {
        static $gtype: GObject.GType<IconInfo>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: IconInfo.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<IconInfo.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_for_pixbuf(icon_theme: IconTheme, pixbuf: GdkPixbuf.Pixbuf): IconInfo;

        // Signals
        /** @signal */
        connect<K extends keyof IconInfo.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IconInfo.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof IconInfo.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IconInfo.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof IconInfo.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<IconInfo.SignalSignatures[K]>): void;

        // Methods
        get_base_scale(): number;

        get_base_size(): number;

        get_file(): Gio.File | null;

        get_filename(): string | null;

        is_symbolic(): boolean;

        load_icon(): GdkPixbuf.Pixbuf;

        load_icon_async(cancellable: Gio.Cancellable | null): globalThis.Promise<GdkPixbuf.Pixbuf>;

        load_icon_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        load_icon_async(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<GdkPixbuf.Pixbuf> | void;

        load_icon_finish(res: Gio.AsyncResult): GdkPixbuf.Pixbuf;

        load_symbolic(colors: IconColors): [GdkPixbuf.Pixbuf, boolean];

        load_symbolic_async(colors: IconColors, cancellable: Gio.Cancellable | null): globalThis.Promise<[GdkPixbuf.Pixbuf, boolean]>;

        load_symbolic_async(colors: IconColors, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        load_symbolic_async(colors: IconColors, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<[GdkPixbuf.Pixbuf, boolean]> | void;

        load_symbolic_finish(res: Gio.AsyncResult): [GdkPixbuf.Pixbuf, boolean];
    }


    namespace IconTheme {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            changed: () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class IconTheme extends GObject.Object {
        static $gtype: GObject.GType<IconTheme>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: IconTheme.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<IconTheme.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): IconTheme;

        // Signals
        /** @signal */
        connect<K extends keyof IconTheme.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IconTheme.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof IconTheme.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IconTheme.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof IconTheme.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<IconTheme.SignalSignatures[K]>): void;

        // Methods
        add_resource_path(path: string): void;

        append_search_path(path: string): void;

        choose_icon(icon_names: string[], size: number, flags: IconLookupFlags): IconInfo | null;

        choose_icon_for_scale(icon_names: string[], size: number, scale: number, flags: IconLookupFlags): IconInfo | null;

        get_icon_sizes(icon_name: string): number[];

        get_search_path(): string[] | null;

        has_icon(icon_name: string): boolean;

        list_contexts(): string[];

        list_icons(context: string | null): string[];

        load_icon(icon_name: string, size: number, flags: IconLookupFlags): GdkPixbuf.Pixbuf | null;

        load_icon_for_scale(icon_name: string, size: number, scale: number, flags: IconLookupFlags): GdkPixbuf.Pixbuf | null;

        lookup_by_gicon(icon: Gio.Icon, size: number, flags: IconLookupFlags): IconInfo | null;

        lookup_by_gicon_for_scale(icon: Gio.Icon, size: number, scale: number, flags: IconLookupFlags): IconInfo | null;

        lookup_icon(icon_name: string, size: number, flags: IconLookupFlags): IconInfo | null;

        lookup_icon_for_scale(icon_name: string, size: number, scale: number, flags: IconLookupFlags): IconInfo | null;

        prepend_search_path(path: string): void;

        rescan_if_needed(): boolean;

        set_search_path(path: string[]): void;
    }


    namespace ImageContent {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, Clutter.Content.SignalSignatures {
            "notify::preferred-height": (pspec: GObject.ParamSpec) => void;
            "notify::preferred-width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Clutter.Content.ConstructorProps, Gio.Icon.ConstructorProps, Gio.LoadableIcon.ConstructorProps {
            preferred_height: number;
            preferredHeight: number;
            preferred_width: number;
            preferredWidth: number;
        }
    }

    class ImageContent extends GObject.Object implements Clutter.Content, Gio.Icon, Gio.LoadableIcon {
        static $gtype: GObject.GType<ImageContent>;

        // Properties
        get preferred_height(): number;

        get preferredHeight(): number;

        get preferred_width(): number;

        get preferredWidth(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ImageContent.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ImageContent.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ImageContent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ImageContent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ImageContent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ImageContent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ImageContent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ImageContent.SignalSignatures[K]>): void;

        // Static methods
        static new_with_preferred_size(width: number, height: number): Clutter.Content;

        // Methods
        get_preferred_height(): number;

        get_preferred_width(): number;

        get_texture(): Cogl.Texture;

        set_bytes(cogl_context: Cogl.Context, data: GLib.Bytes | Uint8Array, pixel_format: Cogl.PixelFormat, width: number, height: number, row_stride: number): boolean;

        set_data(cogl_context: Cogl.Context, data: Uint8Array | string, pixel_format: Cogl.PixelFormat, width: number, height: number, row_stride: number): boolean;

    // Conflicted with GObject.Object.set_data
        set_data(...args: never[]): any;

        set_preferred_height(height: number): void;

        set_preferred_width(width: number): void;

        get_preferred_size(): [boolean, number, number];

        invalidate(): void;

        invalidate_size(): void;

        vfunc_attached(actor: Clutter.Actor): void;

        vfunc_detached(actor: Clutter.Actor): void;

        vfunc_get_preferred_size(): [boolean, number, number];

        vfunc_invalidate(): void;

        vfunc_invalidate_size(): void;

        vfunc_paint_content(actor: Clutter.Actor, node: Clutter.PaintNode, paint_context: Clutter.PaintContext): void;

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


    namespace Label {
        // Signal signatures
        interface SignalSignatures extends Widget.SignalSignatures {
            "notify::clutter-text": (pspec: GObject.ParamSpec) => void;
            "notify::text": (pspec: GObject.ParamSpec) => void;
            "notify::can-focus": (pspec: GObject.ParamSpec) => void;
            "notify::hover": (pspec: GObject.ParamSpec) => void;
            "notify::keynav-flags": (pspec: GObject.ParamSpec) => void;
            "notify::label-actor": (pspec: GObject.ParamSpec) => void;
            "notify::pseudo-class": (pspec: GObject.ParamSpec) => void;
            "notify::style": (pspec: GObject.ParamSpec) => void;
            "notify::style-class": (pspec: GObject.ParamSpec) => void;
            "notify::track-hover": (pspec: GObject.ParamSpec) => void;
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
        interface ConstructorProps extends Widget.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {
            clutter_text: Clutter.Text;
            clutterText: Clutter.Text;
            text: string;
        }
    }

    class Label extends Widget implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<Label>;

        // Properties
        get clutter_text(): Clutter.Text;

        get clutterText(): Clutter.Text;

        get text(): string;
        set text(val: string);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Label.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Label.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](text: string | null): Label;

        // Conflicted with Clutter.Actor.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof Label.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Label.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Label.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Label.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Label.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Label.SignalSignatures[K]>): void;

        // Methods
        get_clutter_text(): Clutter.Text;

        get_text(): string;

        set_text(text: string | null): void;
    }


    namespace PasswordEntry {
        // Signal signatures
        interface SignalSignatures extends Entry.SignalSignatures {
            "notify::password-visible": (pspec: GObject.ParamSpec) => void;
            "notify::show-peek-icon": (pspec: GObject.ParamSpec) => void;
            "notify::clutter-text": (pspec: GObject.ParamSpec) => void;
            "notify::hint-actor": (pspec: GObject.ParamSpec) => void;
            "notify::hint-text": (pspec: GObject.ParamSpec) => void;
            "notify::input-hints": (pspec: GObject.ParamSpec) => void;
            "notify::input-purpose": (pspec: GObject.ParamSpec) => void;
            "notify::primary-icon": (pspec: GObject.ParamSpec) => void;
            "notify::secondary-icon": (pspec: GObject.ParamSpec) => void;
            "notify::text": (pspec: GObject.ParamSpec) => void;
            "notify::can-focus": (pspec: GObject.ParamSpec) => void;
            "notify::hover": (pspec: GObject.ParamSpec) => void;
            "notify::keynav-flags": (pspec: GObject.ParamSpec) => void;
            "notify::label-actor": (pspec: GObject.ParamSpec) => void;
            "notify::pseudo-class": (pspec: GObject.ParamSpec) => void;
            "notify::style": (pspec: GObject.ParamSpec) => void;
            "notify::style-class": (pspec: GObject.ParamSpec) => void;
            "notify::track-hover": (pspec: GObject.ParamSpec) => void;
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
        interface ConstructorProps extends Entry.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {
            password_visible: boolean;
            passwordVisible: boolean;
            show_peek_icon: boolean;
            showPeekIcon: boolean;
        }
    }

    class PasswordEntry extends Entry implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<PasswordEntry>;

        // Properties
        get password_visible(): boolean;
        set password_visible(val: boolean);

        get passwordVisible(): boolean;
        set passwordVisible(val: boolean);

        get show_peek_icon(): boolean;
        set show_peek_icon(val: boolean);

        get showPeekIcon(): boolean;
        set showPeekIcon(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: PasswordEntry.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<PasswordEntry.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): PasswordEntry;

        // Signals
        /** @signal */
        connect<K extends keyof PasswordEntry.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PasswordEntry.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PasswordEntry.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PasswordEntry.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PasswordEntry.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PasswordEntry.SignalSignatures[K]>): void;

        // Methods
        get_password_visible(): boolean;

        get_show_peek_icon(): boolean;

        set_password_visible(value: boolean): void;

        set_show_peek_icon(value: boolean): void;
    }


    namespace ScrollBar {
        // Signal signatures
        interface SignalSignatures extends Widget.SignalSignatures {
            /** @signal */
            "scroll-start": () => void;
            /** @signal */
            "scroll-stop": () => void;
            "notify::adjustment": (pspec: GObject.ParamSpec) => void;
            "notify::orientation": (pspec: GObject.ParamSpec) => void;
            "notify::can-focus": (pspec: GObject.ParamSpec) => void;
            "notify::hover": (pspec: GObject.ParamSpec) => void;
            "notify::keynav-flags": (pspec: GObject.ParamSpec) => void;
            "notify::label-actor": (pspec: GObject.ParamSpec) => void;
            "notify::pseudo-class": (pspec: GObject.ParamSpec) => void;
            "notify::style": (pspec: GObject.ParamSpec) => void;
            "notify::style-class": (pspec: GObject.ParamSpec) => void;
            "notify::track-hover": (pspec: GObject.ParamSpec) => void;
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
        interface ConstructorProps extends Widget.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {
            adjustment: Adjustment;
            orientation: Clutter.Orientation;
        }
    }

    class ScrollBar extends Widget implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<ScrollBar>;

        // Properties
        get adjustment(): Adjustment;
        set adjustment(val: Adjustment);

        get orientation(): Clutter.Orientation;
        set orientation(val: Clutter.Orientation);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ScrollBar.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ScrollBar.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](adjustment: Adjustment): ScrollBar;

        // Conflicted with Clutter.Actor.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof ScrollBar.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ScrollBar.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ScrollBar.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ScrollBar.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ScrollBar.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ScrollBar.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_scroll_start(): void;

        vfunc_scroll_stop(): void;

        // Methods
        get_adjustment(): Adjustment;

        get_orientation(): Clutter.Orientation;

        set_adjustment(adjustment: Adjustment): void;

        set_orientation(orientation: Clutter.Orientation): void;
    }


    namespace ScrollView {
        // Signal signatures
        interface SignalSignatures extends Widget.SignalSignatures {
            "notify::child": (pspec: GObject.ParamSpec) => void;
            "notify::enable-mouse-scrolling": (pspec: GObject.ParamSpec) => void;
            "notify::enable-touch-scrolling": (pspec: GObject.ParamSpec) => void;
            "notify::hadjustment": (pspec: GObject.ParamSpec) => void;
            "notify::hscrollbar-policy": (pspec: GObject.ParamSpec) => void;
            "notify::hscrollbar-visible": (pspec: GObject.ParamSpec) => void;
            "notify::overlay-scrollbars": (pspec: GObject.ParamSpec) => void;
            "notify::vadjustment": (pspec: GObject.ParamSpec) => void;
            "notify::vscrollbar-policy": (pspec: GObject.ParamSpec) => void;
            "notify::vscrollbar-visible": (pspec: GObject.ParamSpec) => void;
            "notify::can-focus": (pspec: GObject.ParamSpec) => void;
            "notify::hover": (pspec: GObject.ParamSpec) => void;
            "notify::keynav-flags": (pspec: GObject.ParamSpec) => void;
            "notify::label-actor": (pspec: GObject.ParamSpec) => void;
            "notify::pseudo-class": (pspec: GObject.ParamSpec) => void;
            "notify::style": (pspec: GObject.ParamSpec) => void;
            "notify::style-class": (pspec: GObject.ParamSpec) => void;
            "notify::track-hover": (pspec: GObject.ParamSpec) => void;
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
        interface ConstructorProps<A extends Clutter.Actor = Clutter.Actor> extends Widget.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {
            child: Scrollable | null;
            enable_mouse_scrolling: boolean;
            enableMouseScrolling: boolean;
            enable_touch_scrolling: boolean;
            enableTouchScrolling: boolean;
            hadjustment: Adjustment;
            hscrollbar_policy: PolicyType;
            hscrollbarPolicy: PolicyType;
            hscrollbar_visible: boolean;
            hscrollbarVisible: boolean;
            overlay_scrollbars: boolean;
            overlayScrollbars: boolean;
            vadjustment: Adjustment;
            vscrollbar_policy: PolicyType;
            vscrollbarPolicy: PolicyType;
            vscrollbar_visible: boolean;
            vscrollbarVisible: boolean;
        }
    }

    class ScrollView<A extends Clutter.Actor = Clutter.Actor> extends Widget implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<ScrollView>;

        // Properties
        get child(): Scrollable | null;
        set child(val: Scrollable | null);

        get enable_mouse_scrolling(): boolean;
        set enable_mouse_scrolling(val: boolean);

        get enableMouseScrolling(): boolean;
        set enableMouseScrolling(val: boolean);

        get enable_touch_scrolling(): boolean;
        set enable_touch_scrolling(val: boolean);

        get enableTouchScrolling(): boolean;
        set enableTouchScrolling(val: boolean);

        get hadjustment(): Adjustment;

        get hscrollbar_policy(): PolicyType;
        set hscrollbar_policy(val: PolicyType);

        get hscrollbarPolicy(): PolicyType;
        set hscrollbarPolicy(val: PolicyType);

        get hscrollbar_visible(): boolean;

        get hscrollbarVisible(): boolean;

        get overlay_scrollbars(): boolean;
        set overlay_scrollbars(val: boolean);

        get overlayScrollbars(): boolean;
        set overlayScrollbars(val: boolean);

        get vadjustment(): Adjustment;

        get vscrollbar_policy(): PolicyType;
        set vscrollbar_policy(val: PolicyType);

        get vscrollbarPolicy(): PolicyType;
        set vscrollbarPolicy(val: PolicyType);

        get vscrollbar_visible(): boolean;

        get vscrollbarVisible(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ScrollView.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ScrollView.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): ScrollView;

        // Signals
        /** @signal */
        connect<K extends keyof ScrollView.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ScrollView.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ScrollView.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ScrollView.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ScrollView.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ScrollView.SignalSignatures[K]>): void;

        // Methods
        get_child(): Scrollable | null;

        get_column_size(): number;

        get_hadjustment(): Adjustment;

        get_hscrollbar_visible(): boolean;

        get_mouse_scrolling(): boolean;

        get_overlay_scrollbars(): boolean;

        get_row_size(): number;

        get_touch_scrolling(): boolean;

        get_vadjustment(): Adjustment;

        get_vscrollbar_visible(): boolean;

        set_child(child: Scrollable | null): void;

        set_column_size(column_size: number): void;

        set_mouse_scrolling(enabled: boolean): void;

        set_overlay_scrollbars(enabled: boolean): void;

        set_policy(hscroll: PolicyType, vscroll: PolicyType): void;

        set_row_size(row_size: number): void;

        set_touch_scrolling(enabled: boolean): void;

        update_fade_effect(fade_margins: Clutter.Margin): void;
    }


    namespace ScrollViewFade {
        // Signal signatures
        interface SignalSignatures extends Clutter.ShaderEffect.SignalSignatures {
            "notify::extend-fade-area": (pspec: GObject.ParamSpec) => void;
            "notify::fade-edges": (pspec: GObject.ParamSpec) => void;
            "notify::fade-margins": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Clutter.ShaderEffect.ConstructorProps {
            extend_fade_area: boolean;
            extendFadeArea: boolean;
            fade_edges: boolean;
            fadeEdges: boolean;
            fade_margins: Clutter.Margin;
            fadeMargins: Clutter.Margin;
        }
    }

    class ScrollViewFade extends Clutter.ShaderEffect {
        static $gtype: GObject.GType<ScrollViewFade>;

        // Properties
        get extend_fade_area(): boolean;
        set extend_fade_area(val: boolean);

        get extendFadeArea(): boolean;
        set extendFadeArea(val: boolean);

        get fade_edges(): boolean;
        set fade_edges(val: boolean);

        get fadeEdges(): boolean;
        set fadeEdges(val: boolean);

        get fade_margins(): Clutter.Margin;
        set fade_margins(val: Clutter.Margin);

        get fadeMargins(): Clutter.Margin;
        set fadeMargins(val: Clutter.Margin);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ScrollViewFade.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ScrollViewFade.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): ScrollViewFade;

        // Signals
        /** @signal */
        connect<K extends keyof ScrollViewFade.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ScrollViewFade.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ScrollViewFade.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ScrollViewFade.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ScrollViewFade.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ScrollViewFade.SignalSignatures[K]>): void;

        // Methods
        get_extend_fade_area(): boolean;

        get_fade_edges(): boolean;

        get_fade_margins(): Clutter.Margin;

        set_extend_fade_area(extend_fade_area: boolean): void;

        set_fade_edges(fade_edges: boolean): void;

        set_fade_margins(margins: Clutter.Margin): void;
    }


    namespace Settings {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::color-scheme": (pspec: GObject.ParamSpec) => void;
            "notify::disable-show-password": (pspec: GObject.ParamSpec) => void;
            "notify::drag-threshold": (pspec: GObject.ParamSpec) => void;
            "notify::enable-animations": (pspec: GObject.ParamSpec) => void;
            "notify::font-name": (pspec: GObject.ParamSpec) => void;
            "notify::gtk-icon-theme": (pspec: GObject.ParamSpec) => void;
            "notify::high-contrast": (pspec: GObject.ParamSpec) => void;
            "notify::magnifier-active": (pspec: GObject.ParamSpec) => void;
            "notify::primary-paste": (pspec: GObject.ParamSpec) => void;
            "notify::reduced-motion": (pspec: GObject.ParamSpec) => void;
            "notify::slow-down-factor": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            color_scheme: SystemColorScheme;
            colorScheme: SystemColorScheme;
            disable_show_password: boolean;
            disableShowPassword: boolean;
            drag_threshold: number;
            dragThreshold: number;
            enable_animations: boolean;
            enableAnimations: boolean;
            font_name: string;
            fontName: string;
            gtk_icon_theme: string;
            gtkIconTheme: string;
            high_contrast: boolean;
            highContrast: boolean;
            magnifier_active: boolean;
            magnifierActive: boolean;
            primary_paste: boolean;
            primaryPaste: boolean;
            reduced_motion: ReducedMotion;
            reducedMotion: ReducedMotion;
            slow_down_factor: number;
            slowDownFactor: number;
        }
    }

    class Settings extends GObject.Object {
        static $gtype: GObject.GType<Settings>;

        // Properties
        get color_scheme(): SystemColorScheme;

        get colorScheme(): SystemColorScheme;

        get disable_show_password(): boolean;

        get disableShowPassword(): boolean;

        get drag_threshold(): number;

        get dragThreshold(): number;

        get enable_animations(): boolean;

        get enableAnimations(): boolean;

        get font_name(): string;

        get fontName(): string;

        get gtk_icon_theme(): string;

        get gtkIconTheme(): string;

        get high_contrast(): boolean;

        get highContrast(): boolean;

        get magnifier_active(): boolean;

        get magnifierActive(): boolean;

        get primary_paste(): boolean;

        get primaryPaste(): boolean;

        get reduced_motion(): ReducedMotion;

        get reducedMotion(): ReducedMotion;

        get slow_down_factor(): number;
        set slow_down_factor(val: number);

        get slowDownFactor(): number;
        set slowDownFactor(val: number);

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

        // Static methods
        static get(): Settings;

        // Methods
        get_color_scheme(): SystemColorScheme;

        get_disable_show_password(): boolean;

        get_drag_threshold(): number;

        get_enable_animations(): boolean;

        get_font_name(): string;

        get_gtk_icon_theme(): string;

        get_high_contrast(): boolean;

        get_magnifier_active(): boolean;

        get_primary_paste(): boolean;

        get_reduced_motion(): ReducedMotion;

        get_slow_down_factor(): number;

        inhibit_animations(): void;

        set_slow_down_factor(factor: number): void;

        uninhibit_animations(): void;
    }


    namespace SpinnerContent {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, Clutter.Content.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Clutter.Content.ConstructorProps {}
    }

    class SpinnerContent extends GObject.Object implements Clutter.Content {
        static $gtype: GObject.GType<SpinnerContent>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SpinnerContent.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SpinnerContent.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof SpinnerContent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SpinnerContent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SpinnerContent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SpinnerContent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SpinnerContent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SpinnerContent.SignalSignatures[K]>): void;

        // Static methods
        static ["new"](): Clutter.Content;

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


    namespace StyledIcon {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::glyph-names": (pspec: GObject.ParamSpec) => void;
            "notify::ink": (pspec: GObject.ParamSpec) => void;
            "notify::plate": (pspec: GObject.ParamSpec) => void;
            "notify::rim": (pspec: GObject.ParamSpec) => void;
            "notify::shade": (pspec: GObject.ParamSpec) => void;
            "notify::source": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps, Gio.Icon.ConstructorProps {
            glyph_names: string[];
            glyphNames: string[];
            ink: Cogl.Color;
            plate: Cogl.Color;
            rim: number;
            shade: Cogl.Color;
            source: Gio.Icon;
        }
    }

    class StyledIcon extends GObject.Object implements Gio.Icon {
        static $gtype: GObject.GType<StyledIcon>;

        // Properties
        get glyph_names(): string[];

        get glyphNames(): string[];

        get ink(): Cogl.Color;

        get plate(): Cogl.Color;

        get rim(): number;

        get shade(): Cogl.Color;

        get source(): Gio.Icon;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: StyledIcon.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<StyledIcon.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof StyledIcon.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StyledIcon.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof StyledIcon.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StyledIcon.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof StyledIcon.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<StyledIcon.SignalSignatures[K]>): void;

        equal(icon2: Gio.Icon | null): boolean;

        hash(): number;

        serialize(): GLib.Variant | null;

        to_string(): string | null;

        vfunc_equal(icon2: Gio.Icon | null): boolean;

        vfunc_hash(): number;

        vfunc_serialize(): GLib.Variant | null;

        vfunc_to_tokens(): [boolean, string[], number];
    }


    namespace TextureCache {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "icon-theme-changed": () => void;
            /** @signal */
            "texture-file-changed": (file: Gio.File) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class TextureCache extends GObject.Object {
        static $gtype: GObject.GType<TextureCache>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: TextureCache.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<TextureCache.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof TextureCache.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextureCache.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TextureCache.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextureCache.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TextureCache.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TextureCache.SignalSignatures[K]>): void;

        // Static methods
        static get_default(): TextureCache;

        // Methods
        evict_styled_icons(): void;

        load_file_async(file: Gio.File, available_width: number, available_height: number, paint_scale: number, resource_scale: number): Clutter.Actor;

        load_file_to_cairo_surface(file: Gio.File, paint_scale: number, resource_scale: number): cairo.Surface;

        load_gicon(theme_node: ThemeNode | null, icon: Gio.Icon, size: number, paint_scale: number, resource_scale: number): Clutter.Actor | null;

        lookup_styled_icon_file(icon: StyledIcon, size: number): Gio.File | null;

        preload_file_to_cairo_surface(file: Gio.File, paint_scale: number, resource_scale: number): void;

        rescan_icon_theme(): boolean;

        save_styled_icon_async(icon: StyledIcon, size: number, path: string, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        save_styled_icon_async(icon: StyledIcon, size: number, path: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        save_styled_icon_async(icon: StyledIcon, size: number, path: string, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        save_styled_icon_finish(result: Gio.AsyncResult): boolean;
    }


    namespace Theme {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "custom-stylesheets-changed": () => void;
            "notify::application-stylesheet": (pspec: GObject.ParamSpec) => void;
            "notify::default-stylesheet": (pspec: GObject.ParamSpec) => void;
            "notify::theme-stylesheet": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            application_stylesheet: Gio.File;
            applicationStylesheet: Gio.File;
            default_stylesheet: Gio.File;
            defaultStylesheet: Gio.File;
            theme_stylesheet: Gio.File;
            themeStylesheet: Gio.File;
        }
    }

    class Theme extends GObject.Object {
        static $gtype: GObject.GType<Theme>;

        // Properties
        get application_stylesheet(): Gio.File;

        get applicationStylesheet(): Gio.File;

        get default_stylesheet(): Gio.File;

        get defaultStylesheet(): Gio.File;

        get theme_stylesheet(): Gio.File;

        get themeStylesheet(): Gio.File;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Theme.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Theme.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](application_stylesheet: Gio.File, theme_stylesheet: Gio.File, default_stylesheet: Gio.File): Theme;

        // Signals
        /** @signal */
        connect<K extends keyof Theme.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Theme.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Theme.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Theme.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Theme.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Theme.SignalSignatures[K]>): void;

        // Methods
        get_application_stylesheet(): Gio.File;

        get_custom_stylesheets(): Gio.File[];

        get_default_stylesheet(): Gio.File;

        get_theme_stylesheet(): Gio.File;

        load_stylesheet(file: Gio.File): boolean;

        unload_stylesheet(file: Gio.File): void;
    }


    namespace ThemeContext {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            changed: () => void;
            "notify::scale-factor": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            scale_factor: number;
            scaleFactor: number;
        }
    }

    class ThemeContext extends GObject.Object {
        static $gtype: GObject.GType<ThemeContext>;

        // Properties
        get scale_factor(): number;
        set scale_factor(val: number);

        get scaleFactor(): number;
        set scaleFactor(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ThemeContext.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ThemeContext.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ThemeContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ThemeContext.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ThemeContext.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ThemeContext.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ThemeContext.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ThemeContext.SignalSignatures[K]>): void;

        // Static methods
        static get_for_stage(stage: Clutter.Stage): ThemeContext;

        // Methods
        get_accent_color(): [Cogl.Color | null, Cogl.Color | null];

        get_font(): Pango.FontDescription;

        get_resolution(): number;

        get_root_node(): ThemeNode;

        get_scale_factor(): number;

        get_theme(): Theme;

        intern_node(node: ThemeNode): ThemeNode;

        set_font(font: Pango.FontDescription): void;

        set_scale_factor(factor: number): void;

        set_theme(theme: Theme): void;

        set_theme_and_accent_color(theme: Theme, color: Cogl.Color, fg_color: Cogl.Color): void;
    }


    namespace ThemeNode {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class ThemeNode extends GObject.Object {
        static $gtype: GObject.GType<ThemeNode>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ThemeNode.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ThemeNode.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](context: ThemeContext, parent_node: ThemeNode | null, theme: Theme | null, element_type: GObject.GType, element_id: string | null, element_class: string | null, pseudo_class: string | null, inline_style: string): ThemeNode;

        // Signals
        /** @signal */
        connect<K extends keyof ThemeNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ThemeNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ThemeNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ThemeNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ThemeNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ThemeNode.SignalSignatures[K]>): void;

        // Methods
        adjust_for_height(for_height: number): number;

        adjust_for_width(for_width: number): number;

        adjust_preferred_height(min_height_p: number, natural_height_p: number): [number, number];

        adjust_preferred_width(min_width_p: number, natural_width_p: number): [number, number];

        equal(node_b: ThemeNode): boolean;

        geometry_equal(other: ThemeNode): boolean;

        get_background_color(): Cogl.Color;

        get_background_gradient(): [GradientType, Cogl.Color, Cogl.Color];

        get_background_image(): Gio.File;

        get_background_image_shadow(): Shadow | null;

        get_background_paint_box(allocation: Clutter.ActorBox): Clutter.ActorBox;

        get_border_color(side: Side): Cogl.Color;

        get_border_image(): BorderImage;

        get_border_radius(corner: Corner): number;

        get_border_width(side: Side): number;

        get_box_shadow(): Shadow | null;

        get_color(property_name: string): Cogl.Color;

        get_content_box(allocation: Clutter.ActorBox): Clutter.ActorBox;

        get_double(property_name: string): number;

        get_element_classes(): string[];

        get_element_id(): string;

        get_element_type(): GObject.GType;

        get_font(): Pango.FontDescription;

        get_font_features(): string;

        get_foreground_color(): Cogl.Color;

        get_height(): number;

        get_horizontal_padding(): number;

        get_icon_colors(): IconColors;

        get_icon_style(): IconStyle;

        get_length(property_name: string): number;

        get_letter_spacing(): number;

        get_margin(side: Side): number;

        get_max_height(): number;

        get_max_width(): number;

        get_min_height(): number;

        get_min_width(): number;

        get_outline_color(): Cogl.Color;

        get_outline_width(): number;

        get_padding(side: Side): number;

        get_paint_box(allocation: Clutter.ActorBox): Clutter.ActorBox;

        get_parent(): ThemeNode | null;

        get_pseudo_classes(): string[];

        get_shadow(property_name: string): Shadow | null;

        get_text_align(): TextAlign;

        get_text_decoration(): TextDecoration;

        get_text_shadow(): Shadow | null;

        get_theme(): Theme;

        get_transition_duration(): number;

        get_url(property_name: string): Gio.File | null;

        get_vertical_padding(): number;

        get_width(): number;

        hash(): number;

        invalidate_background_image(): void;

        invalidate_border_image(): void;

        lookup_color(property_name: string, inherit: boolean): [boolean, Cogl.Color];

        lookup_double(property_name: string, inherit: boolean): [boolean, number];

        lookup_length(property_name: string, inherit: boolean): [boolean, number];

        lookup_shadow(property_name: string, inherit: boolean): [boolean, Shadow];

        lookup_time(property_name: string, inherit: boolean): [boolean, number];

        lookup_url(property_name: string, inherit: boolean): [boolean, Gio.File];

        paint_equal(other: ThemeNode | null): boolean;

        to_string(): string;
    }


    namespace Viewport {
        // Signal signatures
        interface SignalSignatures extends Widget.SignalSignatures {
            "notify::clip-to-view": (pspec: GObject.ParamSpec) => void;
            "notify::can-focus": (pspec: GObject.ParamSpec) => void;
            "notify::hover": (pspec: GObject.ParamSpec) => void;
            "notify::keynav-flags": (pspec: GObject.ParamSpec) => void;
            "notify::label-actor": (pspec: GObject.ParamSpec) => void;
            "notify::pseudo-class": (pspec: GObject.ParamSpec) => void;
            "notify::style": (pspec: GObject.ParamSpec) => void;
            "notify::style-class": (pspec: GObject.ParamSpec) => void;
            "notify::track-hover": (pspec: GObject.ParamSpec) => void;
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
            "notify::hadjustment": (pspec: GObject.ParamSpec) => void;
            "notify::vadjustment": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps<A extends Clutter.LayoutManager = Clutter.LayoutManager, B extends Clutter.Content = Clutter.Content> extends Widget.ConstructorProps<A, B>, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps, Scrollable.ConstructorProps {
            clip_to_view: boolean;
            clipToView: boolean;
        }
    }

    class Viewport<A extends Clutter.LayoutManager = Clutter.LayoutManager, B extends Clutter.Content = Clutter.Content> extends Widget<A, B> implements Atk.ImplementorIface, Clutter.Animatable, Scrollable {
        static $gtype: GObject.GType<Viewport>;

        // Properties
        get clip_to_view(): boolean;
        set clip_to_view(val: boolean);

        get clipToView(): boolean;
        set clipToView(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Viewport.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Viewport.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Viewport.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Viewport.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Viewport.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Viewport.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Viewport.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Viewport.SignalSignatures[K]>): void;

        // Methods
        get_clip_to_view(): boolean;

        set_clip_to_view(clip_to_view: boolean): void;

        /** @category Inherited from St.Scrollable */
        get hadjustment(): Adjustment;
        set hadjustment(val: Adjustment);

        /** @category Inherited from St.Scrollable */
        get vadjustment(): Adjustment;
        set vadjustment(val: Adjustment);

        get_adjustments(hadjustment: Adjustment, vadjustment: Adjustment): void;

        set_adjustments(hadjustment: Adjustment, vadjustment: Adjustment): void;

        vfunc_get_adjustments(hadjustment: Adjustment, vadjustment: Adjustment): void;

        vfunc_set_adjustments(hadjustment: Adjustment, vadjustment: Adjustment): void;
    }


    namespace Widget {
        // Signal signatures
        interface SignalSignatures extends Clutter.Actor.SignalSignatures {
            /** @signal */
            "popup-menu": () => void;
            /** @signal */
            "style-changed": () => void;
            "notify::can-focus": (pspec: GObject.ParamSpec) => void;
            "notify::hover": (pspec: GObject.ParamSpec) => void;
            "notify::keynav-flags": (pspec: GObject.ParamSpec) => void;
            "notify::label-actor": (pspec: GObject.ParamSpec) => void;
            "notify::pseudo-class": (pspec: GObject.ParamSpec) => void;
            "notify::style": (pspec: GObject.ParamSpec) => void;
            "notify::style-class": (pspec: GObject.ParamSpec) => void;
            "notify::track-hover": (pspec: GObject.ParamSpec) => void;
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
        interface ConstructorProps<A extends Clutter.LayoutManager = Clutter.LayoutManager, B extends Clutter.Content = Clutter.Content> extends Clutter.Actor.ConstructorProps<A, B>, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {
            can_focus: boolean;
            canFocus: boolean;
            hover: boolean;
            keynav_flags: KeynavFlags;
            keynavFlags: KeynavFlags;
            label_actor: Clutter.Actor;
            labelActor: Clutter.Actor;
            pseudo_class: string;
            pseudoClass: string;
            style: string | null;
            style_class: string;
            styleClass: string;
            track_hover: boolean;
            trackHover: boolean;
        }
    }

    class Widget<A extends Clutter.LayoutManager = Clutter.LayoutManager, B extends Clutter.Content = Clutter.Content> extends Clutter.Actor<A, B> implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<Widget>;

        // Properties
        get can_focus(): boolean;
        set can_focus(val: boolean);

        get canFocus(): boolean;
        set canFocus(val: boolean);

        get hover(): boolean;
        set hover(val: boolean);

        get keynav_flags(): KeynavFlags;
        set keynav_flags(val: KeynavFlags);

        get keynavFlags(): KeynavFlags;
        set keynavFlags(val: KeynavFlags);

        get label_actor(): Clutter.Actor;
        set label_actor(val: Clutter.Actor);

        get labelActor(): Clutter.Actor;
        set labelActor(val: Clutter.Actor);

        get pseudo_class(): string;
        set pseudo_class(val: string);

        get pseudoClass(): string;
        set pseudoClass(val: string);

        get style(): string | null;
        set style(val: string | null);

        get style_class(): string;
        set style_class(val: string);

        get styleClass(): string;
        set styleClass(val: string);

        get track_hover(): boolean;
        set track_hover(val: boolean);

        get trackHover(): boolean;
        set trackHover(val: boolean);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Widget.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Widget.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Widget.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Widget.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Widget.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Widget.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Widget.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Widget.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_focus_chain(): Clutter.Actor[];

        vfunc_navigate_focus(from: Clutter.Actor | null, direction: DirectionType): boolean;

        vfunc_popup_menu(): void;

        vfunc_style_changed(): void;

        // Methods
        add_style_class_name(style_class: string): void;

        add_style_pseudo_class(pseudo_class: string): void;

        ensure_style(): void;

        get_can_focus(): boolean;

        get_focus_chain(): Clutter.Actor[];

        get_hover(): boolean;

        get_keynav_flags(): KeynavFlags;

        get_label_actor(): Clutter.Actor;

        get_style(): string | null;

        get_style_class_name(): string;

        get_style_pseudo_class(): string;

        get_theme_node(): ThemeNode;

        get_track_hover(): boolean;

        has_style_class_name(style_class: string): boolean;

        has_style_pseudo_class(pseudo_class: string): boolean;

        navigate_focus(from: Clutter.Actor | null, direction: DirectionType, wrap_around: boolean): boolean;

        paint_background(node: Clutter.PaintNode, paint_context: Clutter.PaintContext): void;

        peek_theme_node(): ThemeNode;

        popup_menu(): void;

        remove_style_class_name(style_class: string): void;

        remove_style_pseudo_class(pseudo_class: string): void;

        set_can_focus(can_focus: boolean): void;

        set_hover(hover: boolean): void;

        set_keynav_flags(flags: KeynavFlags): void;

        set_label_actor(label: Clutter.Actor): void;

        set_style(style: string | null): void;

        set_style_class_name(style_class_list: string | null): void;

        set_style_pseudo_class(pseudo_class_list: string | null): void;

        set_track_hover(track_hover: boolean): void;

        style_changed(): void;

        sync_hover(): void;

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


    namespace WidgetAccessible {
        // Signal signatures
        interface SignalSignatures extends Clutter.ActorAccessible.SignalSignatures, Atk.Component.SignalSignatures {
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
        interface ConstructorProps extends Clutter.ActorAccessible.ConstructorProps, Atk.Component.ConstructorProps {}
    }

    class WidgetAccessible extends Clutter.ActorAccessible implements Atk.Component {
        static $gtype: GObject.GType<WidgetAccessible>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WidgetAccessible.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WidgetAccessible.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof WidgetAccessible.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WidgetAccessible.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WidgetAccessible.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WidgetAccessible.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WidgetAccessible.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WidgetAccessible.SignalSignatures[K]>): void;

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


    type AdjustmentClass = typeof Adjustment;

    type BinClass = typeof Bin;

    type BorderImageClass = typeof BorderImage;

    type BoxLayoutClass = typeof BoxLayout;

    abstract class BoxLayoutPrivate {
        static $gtype: GObject.GType<BoxLayoutPrivate>;
    }


    type ButtonClass = typeof Button;

    type ClipboardClass = typeof Clipboard;

    type CursorClass = typeof Cursor;

    type DndStartGestureClass = typeof DndStartGesture;

    type DrawingAreaClass = typeof DrawingArea;

    type EntryClass = typeof Entry;

    type FocusManagerClass = typeof FocusManager;

    type GenericAccessibleClass = typeof GenericAccessible;

    type IconClass = typeof Icon;

    class IconColors {
        static $gtype: GObject.GType<IconColors>;

        // Fields
        foreground: Cogl.Color;

        warning: Cogl.Color;

        error: Cogl.Color;

        success: Cogl.Color;

        // Constructors

        constructor(properties?: Partial<{
            foreground: Cogl.Color;
            warning: Cogl.Color;
            error: Cogl.Color;
            success: Cogl.Color;
        }>);

        static ["new"](): IconColors;

        // Methods
        copy(): IconColors;

        equal(other: IconColors): boolean;

        ref(): IconColors;

        unref(): void;
    }


    type IconInfoClass = typeof IconInfo;

    abstract class IconPrivate {
        static $gtype: GObject.GType<IconPrivate>;
    }


    type IconThemeClass = typeof IconTheme;

    type ImageContentClass = typeof ImageContent;

    type LabelClass = typeof Label;

    abstract class LabelPrivate {
        static $gtype: GObject.GType<LabelPrivate>;
    }


    type PasswordEntryClass = typeof PasswordEntry;

    type ScrollBarClass = typeof ScrollBar;

    type ScrollViewClass = typeof ScrollView;

    type ScrollViewFadeClass = typeof ScrollViewFade;

    type ScrollableInterface = typeof Scrollable;

    type SettingsClass = typeof Settings;

    class Shadow {
        static $gtype: GObject.GType<Shadow>;

        // Fields
        color: Cogl.Color;

        xoffset: number;

        yoffset: number;

        blur: number;

        spread: number;

        inset: boolean;

        // Constructors

        constructor(properties?: Partial<{
            color: Cogl.Color;
            xoffset: number;
            yoffset: number;
            blur: number;
            spread: number;
            inset: boolean;
        }>);

        static ["new"](color: Cogl.Color, xoffset: number, yoffset: number, blur: number, spread: number, inset: boolean): Shadow;

        // Methods
        equal(other: Shadow): boolean;

        get_box(actor_box: Clutter.ActorBox, shadow_box: Clutter.ActorBox): void;

        ref(): Shadow;

        unref(): void;
    }


    type SpinnerContentClass = typeof SpinnerContent;

    type StyledIconClass = typeof StyledIcon;

    type TextureCacheClass = typeof TextureCache;

    type ThemeClass = typeof Theme;

    type ThemeContextClass = typeof ThemeContext;

    type ThemeNodeClass = typeof ThemeNode;

    class ThemeNodePaintState {
        static $gtype: GObject.GType<ThemeNodePaintState>;

        // Fields
        node: ThemeNode;

        alloc_width: number;

        alloc_height: number;

        box_shadow_width: number;

        box_shadow_height: number;

        resource_scale: number;

        box_shadow_pipeline: Cogl.Pipeline;

        prerendered_texture: Cogl.Texture;

        prerendered_pipeline: Cogl.Pipeline;

        corner_pipeline: Cogl.Pipeline[];

        // Methods
        copy(other: ThemeNodePaintState): void;

        free(): void;

        init(): void;

        invalidate(): void;

        invalidate_for_file(file: Gio.File): boolean;

        set_node(node: ThemeNode): void;
    }


    type ViewportClass = typeof Viewport;

    type WidgetAccessibleClass = typeof WidgetAccessible;

    type WidgetClass = typeof Widget;

    namespace Scrollable {
        /**
         * Interface for implementing Scrollable.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_adjustments(hadjustment: Adjustment, vadjustment: Adjustment): void;

            vfunc_set_adjustments(hadjustment: Adjustment, vadjustment: Adjustment): void;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            hadjustment: Adjustment;
            vadjustment: Adjustment;
        }
    }

    export interface ScrollableNamespace {
        $gtype: GObject.GType<Scrollable>;
        prototype: Scrollable;
    }
    interface Scrollable extends GObject.Object, Scrollable.Interface {

        // Properties
        get hadjustment(): Adjustment;
        set hadjustment(val: Adjustment);

        get vadjustment(): Adjustment;
        set vadjustment(val: Adjustment);

        // Methods
        get_adjustments(hadjustment: Adjustment, vadjustment: Adjustment): void;

        set_adjustments(hadjustment: Adjustment, vadjustment: Adjustment): void;
    }


    export const Scrollable: ScrollableNamespace & {
        new (): Scrollable; // This allows `obj instanceof Scrollable`
    };

    const __name__: string;

    const __version__: string;
}

export default St;

}

declare module 'gi://St' {
    import St51 from 'gi://St?version=51';
    export default St51;
}
// END
