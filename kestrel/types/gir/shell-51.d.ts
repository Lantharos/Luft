/// <reference path="./st-51.d.ts" />
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
/// <reference path="./polkitagent-1.0.d.ts" />
/// <reference path="./polkit-1.0.d.ts" />
/// <reference path="./nm-1.0.d.ts" />
/// <reference path="./giounix-2.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://Shell?version=51' {

// Module dependencies
import type St from 'gi://St?version=51';
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
import type PolkitAgent from 'gi://PolkitAgent?version=1.0';
import type Polkit from 'gi://Polkit?version=1.0';
import type NM from 'gi://NM?version=1.0';
import type GioUnix from 'gi://GioUnix?version=2.0';

export namespace Shell {

    /**
     * Shell-51
     */


    export namespace AppLaunchGpu {
        export const $gtype: GObject.GType<AppLaunchGpu>;
    }

    enum AppLaunchGpu {
        APP_PREF = 0,
        DISCRETE = 1,
        DEFAULT = 2,
    }


    export namespace AppState {
        export const $gtype: GObject.GType<AppState>;
    }

    enum AppState {
        STOPPED = 0,
        STARTING = 1,
        RUNNING = 2,
    }


    export namespace BlurMode {
        export const $gtype: GObject.GType<BlurMode>;
    }

    enum BlurMode {
        ACTOR = 0,
        BACKGROUND = 1,
    }


    export namespace NetworkAgentResponse {
        export const $gtype: GObject.GType<NetworkAgentResponse>;
    }

    enum NetworkAgentResponse {
        CONFIRMED = 0,
        USER_CANCELED = 1,
        INTERNAL_ERROR = 2,
    }


    const KEYRING_SK_TAG: string;

    const KEYRING_SN_TAG: string;

    const KEYRING_UUID_TAG: string;

    function fonts_add_bundled(datadir: string): void;

    function fonts_refresh(stage: Clutter.Actor, datadir: string): boolean;

    function systemd_get_oui_vendor(address: string): string | null;

    function systemd_start_app_scope(name: string | null, pid: number): void;

    function texture_file_encode(texture: Cogl.Texture, metadata: GLib.Bytes | Uint8Array | null): GLib.Bytes;

    function texture_file_load_async(file: Gio.File, io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<[Cogl.Texture, GLib.Bytes]>;
    function texture_file_load_async(file: Gio.File, io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Gio.File> | null): void;
    function texture_file_load_async(file: Gio.File, io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Gio.File> | null): globalThis.Promise<[Cogl.Texture, GLib.Bytes]> | void;

    function texture_file_load_finish(result: Gio.AsyncResult): [Cogl.Texture, GLib.Bytes];

    function texture_file_paint_actor(actor: Clutter.Actor): Cogl.Texture | null;

    function time_change_source_new(): GLib.Source;

    function util_create_pixbuf_from_data(data: Uint8Array | string, colorspace: GdkPixbuf.Colorspace, has_alpha: boolean, bits_per_sample: number, width: number, height: number, rowstride: number): GdkPixbuf.Pixbuf;

    function util_get_uid(): number;

    function util_get_week_start(locale: string): number;

    function util_paint_offscreen(actor: Clutter.Actor): void;

    function util_sd_notify(): void;

    function util_set_hidden_from_pick(actor: Clutter.Actor, hidden: boolean): void;

    function util_spawn_async(working_directory: string | null, argv: string[], envp: string[] | null, flags: GLib.SpawnFlags): GLib.Pid;

    function util_systemd_unit_exists(unit: string, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;
    function util_systemd_unit_exists(unit: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<string> | null): void;
    function util_systemd_unit_exists(unit: string, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<string> | null): globalThis.Promise<boolean> | void;

    function util_systemd_unit_exists_finish(res: Gio.AsyncResult): boolean;

    function util_translate_time_string(str: string): string;

    export namespace ActionMode {
        export const $gtype: GObject.GType<ActionMode>;
    }

    enum ActionMode {
        NONE = 0,
        NORMAL = 1,
        OVERVIEW = 2,
        LOCK_SCREEN = 4,
        UNLOCK_SCREEN = 8,
        LOGIN_SCREEN = 16,
        SYSTEM_MODAL = 32,
        LOOKING_GLASS = 64,
        POPUP = 128,
        ALL = -1,
    }


    export namespace MixerHeadset {
        export const $gtype: GObject.GType<MixerHeadset>;
    }

    enum MixerHeadset {
        HEADPHONES = 1,
        HEADSET = 2,
        MICROPHONE = 4,
    }


    namespace App {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "windows-changed": () => void;
            "notify::app-info": (pspec: GObject.ParamSpec) => void;
            "notify::icon": (pspec: GObject.ParamSpec) => void;
            "notify::id": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            app_info: GioUnix.DesktopAppInfo;
            appInfo: GioUnix.DesktopAppInfo;
            icon: Gio.Icon;
            id: string;
            state: AppState;
        }
    }

    class App extends GObject.Object {
        static $gtype: GObject.GType<App>;

        // Properties
        get app_info(): GioUnix.DesktopAppInfo;

        get appInfo(): GioUnix.DesktopAppInfo;

        get icon(): Gio.Icon;

        get id(): string;

        get state(): AppState;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: App.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<App.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof App.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, App.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof App.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, App.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof App.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<App.SignalSignatures[K]>): void;

        // Methods
        activate(): void;

        activate_action(action_name: string, parameter: GLib.Variant | null, timestamp: number, workspace: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        activate_action(action_name: string, parameter: GLib.Variant | null, timestamp: number, workspace: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        activate_action(action_name: string, parameter: GLib.Variant | null, timestamp: number, workspace: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        activate_action_finish(result: Gio.AsyncResult): boolean;

        activate_full(workspace: number, timestamp: number): void;

        activate_window(window: Meta.Window | null, timestamp: number): void;

        can_open_new_window(): boolean;

        compare(other: App): number;

        create_window_icon_texture(window: Meta.Window, size: number): Clutter.Actor;

        get_app_info(): GioUnix.DesktopAppInfo;

        get_icon(): Gio.Icon;

        get_id(): string;

        get_n_windows(): number;

        get_name(): string;

        get_pids(): number[];

        get_state(): AppState;

        get_windows(): Meta.Window[];

        is_window_backed(): boolean;

        launch(timestamp: number, workspace: number, gpu_pref: AppLaunchGpu): boolean;

        launch_action(action_name: string, timestamp: number, workspace: number): void;

        open_new_window(workspace: number): void;

        request_quit(): boolean;
    }


    namespace AppSystem {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "app-state-changed": (object: App) => void;
            /** @signal */
            "installed-changed": () => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class AppSystem extends GObject.Object {
        static $gtype: GObject.GType<AppSystem>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AppSystem.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AppSystem.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof AppSystem.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AppSystem.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AppSystem.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AppSystem.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AppSystem.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AppSystem.SignalSignatures[K]>): void;

        // Static methods
        static get_default(): AppSystem;

        // Methods
        get_installed(): Gio.AppInfo[];

        get_running(): App[];

        lookup_app(id: string): App;

        lookup_desktop_wmclass(wmclass: string | null): App;

        lookup_heuristic_basename(id: string): App;

        lookup_startup_wmclass(wmclass: string | null): App;
    }


    namespace BlurEffect {
        // Signal signatures
        interface SignalSignatures extends Clutter.Effect.SignalSignatures {
            "notify::bright-dim": (pspec: GObject.ParamSpec) => void;
            "notify::brightness": (pspec: GObject.ParamSpec) => void;
            "notify::corner-radius": (pspec: GObject.ParamSpec) => void;
            "notify::dark-lift": (pspec: GObject.ParamSpec) => void;
            "notify::mode": (pspec: GObject.ParamSpec) => void;
            "notify::radius": (pspec: GObject.ParamSpec) => void;
            "notify::saturation": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Clutter.Effect.ConstructorProps {
            bright_dim: number;
            brightDim: number;
            brightness: number;
            corner_radius: number;
            cornerRadius: number;
            dark_lift: number;
            darkLift: number;
            mode: BlurMode;
            radius: number;
            saturation: number;
        }
    }

    class BlurEffect extends Clutter.Effect {
        static $gtype: GObject.GType<BlurEffect>;

        // Properties
        get bright_dim(): number;
        set bright_dim(val: number);

        get brightDim(): number;
        set brightDim(val: number);

        get brightness(): number;
        set brightness(val: number);

        get corner_radius(): number;
        set corner_radius(val: number);

        get cornerRadius(): number;
        set cornerRadius(val: number);

        get dark_lift(): number;
        set dark_lift(val: number);

        get darkLift(): number;
        set darkLift(val: number);

        get mode(): BlurMode;
        set mode(val: BlurMode);

        get radius(): number;
        set radius(val: number);

        get saturation(): number;
        set saturation(val: number);

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

        // Methods
        get_brightness(): number;

        get_mode(): BlurMode;

        get_radius(): number;

        set_brightness(brightness: number): void;

        set_mode(mode: BlurMode): void;

        set_radius(radius: number): void;
    }


    namespace CameraMonitor {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::cameras-in-use": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            cameras_in_use: boolean;
            camerasInUse: boolean;
        }
    }

    class CameraMonitor extends GObject.Object {
        static $gtype: GObject.GType<CameraMonitor>;

        // Properties
        get cameras_in_use(): boolean;

        get camerasInUse(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: CameraMonitor.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<CameraMonitor.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof CameraMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CameraMonitor.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof CameraMonitor.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CameraMonitor.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof CameraMonitor.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<CameraMonitor.SignalSignatures[K]>): void;

        // Methods
        get_cameras_in_use(): boolean;
    }


    namespace EdgeDragGesture {
        // Signal signatures
        interface SignalSignatures extends Clutter.Gesture.SignalSignatures {
            /** @signal */
            progress: (progress_px: number) => void;
            "notify::side": (pspec: GObject.ParamSpec) => void;
            "notify::state": (pspec: GObject.ParamSpec) => void;
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Clutter.Gesture.ConstructorProps {
            side: Clutter.GestureState;
        }
    }

    class EdgeDragGesture extends Clutter.Gesture {
        static $gtype: GObject.GType<EdgeDragGesture>;

        // Properties
        get side(): Clutter.GestureState;
        set side(val: Clutter.GestureState);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: EdgeDragGesture.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<EdgeDragGesture.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof EdgeDragGesture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, EdgeDragGesture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof EdgeDragGesture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, EdgeDragGesture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof EdgeDragGesture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<EdgeDragGesture.SignalSignatures[K]>): void;

        // Methods
        get_side(): St.Side;

        set_side(side: St.Side): void;
    }


    namespace Global {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "locate-pointer": () => void;
            /** @signal */
            "notify-error": (object: string, p0: string) => void;
            /** @signal */
            shutdown: () => void;
            "notify::automation-script": (pspec: GObject.ParamSpec) => void;
            "notify::backend": (pspec: GObject.ParamSpec) => void;
            "notify::compositor": (pspec: GObject.ParamSpec) => void;
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::datadir": (pspec: GObject.ParamSpec) => void;
            "notify::display": (pspec: GObject.ParamSpec) => void;
            "notify::focus-manager": (pspec: GObject.ParamSpec) => void;
            "notify::force-animations": (pspec: GObject.ParamSpec) => void;
            "notify::screen-height": (pspec: GObject.ParamSpec) => void;
            "notify::screen-width": (pspec: GObject.ParamSpec) => void;
            "notify::session-mode": (pspec: GObject.ParamSpec) => void;
            "notify::settings": (pspec: GObject.ParamSpec) => void;
            "notify::stage": (pspec: GObject.ParamSpec) => void;
            "notify::top-window-group": (pspec: GObject.ParamSpec) => void;
            "notify::window-group": (pspec: GObject.ParamSpec) => void;
            "notify::window-manager": (pspec: GObject.ParamSpec) => void;
            "notify::workspace-manager": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            automation_script: Gio.File;
            automationScript: Gio.File;
            backend: Meta.Backend;
            compositor: Meta.Compositor;
            context: Meta.Context;
            datadir: string;
            display: Meta.Display;
            focus_manager: St.FocusManager;
            focusManager: St.FocusManager;
            force_animations: boolean;
            forceAnimations: boolean;
            screen_height: number;
            screenHeight: number;
            screen_width: number;
            screenWidth: number;
            session_mode: string;
            sessionMode: string;
            settings: Gio.Settings;
            stage: Clutter.Stage;
            top_window_group: Clutter.Actor;
            topWindowGroup: Clutter.Actor;
            window_group: Clutter.Actor;
            windowGroup: Clutter.Actor;
            window_manager: WM;
            windowManager: WM;
            workspace_manager: Meta.WorkspaceManager;
            workspaceManager: Meta.WorkspaceManager;
        }
    }

    class Global extends GObject.Object {
        static $gtype: GObject.GType<Global>;

        // Properties
        get automation_script(): Gio.File;

        get automationScript(): Gio.File;

        get backend(): Meta.Backend;

        get compositor(): Meta.Compositor;

        get context(): Meta.Context;

        get datadir(): string;

        get display(): Meta.Display;

        get focus_manager(): St.FocusManager;

        get focusManager(): St.FocusManager;

        get force_animations(): boolean;
        set force_animations(val: boolean);

        get forceAnimations(): boolean;
        set forceAnimations(val: boolean);

        get screen_height(): number;

        get screenHeight(): number;

        get screen_width(): number;

        get screenWidth(): number;

        get session_mode(): string;

        get sessionMode(): string;

        get settings(): Gio.Settings;

        get stage(): Clutter.Stage;

        get top_window_group(): Clutter.Actor;

        get topWindowGroup(): Clutter.Actor;

        get window_group(): Clutter.Actor;

        get windowGroup(): Clutter.Actor;

        get window_manager(): WM;

        get windowManager(): WM;

        get workspace_manager(): Meta.WorkspaceManager;

        get workspaceManager(): Meta.WorkspaceManager;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Global.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Global.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Global.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Global.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Global.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Global.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Global.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Global.SignalSignatures[K]>): void;

        // Static methods
        static get(): Global;

        // Methods
        create_app_launch_context(timestamp: number, workspace: number): Gio.AppLaunchContext;

        get_app_system(): AppSystem;

        get_automation_script(): Gio.File;

        get_backend(): Meta.Backend;

        get_compositor(): Meta.Compositor;

        get_context(): Meta.Context;

        get_current_time(): number;

        get_datadir(): string;

        get_display(): Meta.Display;

        get_focus_manager(): St.FocusManager;

        get_force_animations(): boolean;

        get_persistent_state(property_type: string, property_name: string): GLib.Variant;

        get_pointer(): [number, number, Clutter.ModifierType];

        get_screen_height(): number;

        get_screen_width(): number;

        get_session_mode(): string;

        get_settings(): Gio.Settings;

        get_stage(): Clutter.Stage;

        get_switcheroo_control(): Gio.DBusProxy;

        get_top_window_group(): Clutter.Actor;

        get_window_actors(): Meta.WindowActor[];

        get_window_group(): Clutter.Actor;

        get_window_manager(): WM;

        get_window_tracker(): WindowTracker;

        get_workspace_manager(): Meta.WorkspaceManager;

        notify_error(msg: string, details: string): void;

        set_force_animations(force: boolean): void;

        set_persistent_state(property_name: string, variant: GLib.Variant | null): void;
    }


    namespace GlyphRenderer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class GlyphRenderer extends GObject.Object {
        static $gtype: GObject.GType<GlyphRenderer>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: GlyphRenderer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<GlyphRenderer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_for_emoji(): GlyphRenderer;

        static new_for_text(family: string, color: Cogl.Color): GlyphRenderer;

        // Signals
        /** @signal */
        connect<K extends keyof GlyphRenderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GlyphRenderer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof GlyphRenderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GlyphRenderer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof GlyphRenderer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<GlyphRenderer.SignalSignatures[K]>): void;

        // Methods
        render(text: string, size: number, scale: number): Clutter.Content | null;
    }


    namespace InvertLightnessEffect {
        // Signal signatures
        interface SignalSignatures extends Clutter.OffscreenEffect.SignalSignatures {
            "notify::actor": (pspec: GObject.ParamSpec) => void;
            "notify::enabled": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Clutter.OffscreenEffect.ConstructorProps {}
    }

    class InvertLightnessEffect extends Clutter.OffscreenEffect {
        static $gtype: GObject.GType<InvertLightnessEffect>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: InvertLightnessEffect.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<InvertLightnessEffect.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): InvertLightnessEffect;

        // Signals
        /** @signal */
        connect<K extends keyof InvertLightnessEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InvertLightnessEffect.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof InvertLightnessEffect.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InvertLightnessEffect.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof InvertLightnessEffect.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<InvertLightnessEffect.SignalSignatures[K]>): void;
    }


    namespace Mixer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "devices-changed": (object: boolean) => void;
            /** @signal */
            "headset-changed": (object: MixerHeadset) => void;
            /** @signal */
            "playback-started": (pid: number, app_id: string | null, binary: string | null, name: string | null) => void;
            "notify::dictating": (pspec: GObject.ParamSpec) => void;
            "notify::input": (pspec: GObject.ParamSpec) => void;
            "notify::output": (pspec: GObject.ParamSpec) => void;
            "notify::recording": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            dictating: boolean;
            input: MixerStream | null;
            output: MixerStream | null;
            recording: boolean;
        }
    }

    class Mixer extends GObject.Object {
        static $gtype: GObject.GType<Mixer>;

        // Properties
        get dictating(): boolean;

        get input(): MixerStream | null;

        get output(): MixerStream | null;

        get recording(): boolean;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Mixer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Mixer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Mixer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Mixer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Mixer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Mixer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Mixer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Mixer.SignalSignatures[K]>): void;

        // Static methods
        static get_default(): Mixer;

        static get_max_amplified(): number;

        // Methods
        activate_device(device: MixerDevice): void;

        choose_headset(choice: MixerHeadset): void;

        get_devices(output: boolean): MixerDevice[];

        get_dictating(): boolean;

        get_input(): MixerStream | null;

        get_output(): MixerStream | null;

        get_recording(): boolean;

        set_dictation_process(pid: number): void;

        set_level_meters(programs: string[] | null): void;
    }


    namespace MixerDevice {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class MixerDevice extends GObject.Object {
        static $gtype: GObject.GType<MixerDevice>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MixerDevice.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MixerDevice.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof MixerDevice.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MixerDevice.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MixerDevice.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MixerDevice.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MixerDevice.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MixerDevice.SignalSignatures[K]>): void;

        // Methods
        get_active(): boolean;

        get_description(): string;

        get_icon_name(): string;

        get_origin(): string | null;
    }


    namespace MixerStream {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::description": (pspec: GObject.ParamSpec) => void;
            "notify::form-factor": (pspec: GObject.ParamSpec) => void;
            "notify::muted": (pspec: GObject.ParamSpec) => void;
            "notify::port": (pspec: GObject.ParamSpec) => void;
            "notify::port-description": (pspec: GObject.ParamSpec) => void;
            "notify::running": (pspec: GObject.ParamSpec) => void;
            "notify::volume": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            description: string;
            form_factor: string | null;
            formFactor: string | null;
            muted: boolean;
            port: string | null;
            port_description: string | null;
            portDescription: string | null;
            running: boolean;
            volume: number;
        }
    }

    class MixerStream extends GObject.Object {
        static $gtype: GObject.GType<MixerStream>;

        // Properties
        get description(): string;

        get form_factor(): string | null;

        get formFactor(): string | null;

        get muted(): boolean;

        get port(): string | null;

        get port_description(): string | null;

        get portDescription(): string | null;

        get running(): boolean;

        get volume(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MixerStream.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MixerStream.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof MixerStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MixerStream.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MixerStream.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MixerStream.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MixerStream.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MixerStream.SignalSignatures[K]>): void;

        // Methods
        get_description(): string;

        get_form_factor(): string | null;

        get_muted(): boolean;

        get_port(): string | null;

        get_port_description(): string | null;

        get_running(): boolean;

        get_volume(): number;

        set_muted(muted: boolean): void;

        set_volume(volume: number): void;
    }


    namespace ModifierChord {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            activated: () => void;
            /** @signal */
            cancelled: () => void;
            /** @signal */
            released: () => void;
            "notify::modifiers": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            modifiers: Clutter.ModifierType;
        }
    }

    class ModifierChord extends GObject.Object {
        static $gtype: GObject.GType<ModifierChord>;

        // Properties
        get modifiers(): Clutter.ModifierType;
        set modifiers(val: Clutter.ModifierType);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ModifierChord.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ModifierChord.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof ModifierChord.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ModifierChord.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ModifierChord.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ModifierChord.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ModifierChord.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ModifierChord.SignalSignatures[K]>): void;

        // Methods
        get_modifiers(): Clutter.ModifierType;

        set_modifiers(modifiers: Clutter.ModifierType): void;
    }


    namespace MountOperation {
        // Signal signatures
        interface SignalSignatures extends Gio.MountOperation.SignalSignatures {
            /** @signal */
            "show-processes-2": () => void;
            "notify::anonymous": (pspec: GObject.ParamSpec) => void;
            "notify::choice": (pspec: GObject.ParamSpec) => void;
            "notify::domain": (pspec: GObject.ParamSpec) => void;
            "notify::is-tcrypt-hidden-volume": (pspec: GObject.ParamSpec) => void;
            "notify::is-tcrypt-system-volume": (pspec: GObject.ParamSpec) => void;
            "notify::password": (pspec: GObject.ParamSpec) => void;
            "notify::password-save": (pspec: GObject.ParamSpec) => void;
            "notify::pim": (pspec: GObject.ParamSpec) => void;
            "notify::username": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Gio.MountOperation.ConstructorProps {}
    }

    class MountOperation extends Gio.MountOperation {
        static $gtype: GObject.GType<MountOperation>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MountOperation.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MountOperation.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): MountOperation;

        // Signals
        /** @signal */
        connect<K extends keyof MountOperation.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MountOperation.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MountOperation.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MountOperation.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MountOperation.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MountOperation.SignalSignatures[K]>): void;

        // Methods
        get_show_processes_choices(): string[];

        get_show_processes_message(): string;

        get_show_processes_pids(): GLib.Pid[];
    }


    namespace NetworkAgent {
        // Signal signatures
        interface SignalSignatures extends NM.SecretAgentOld.SignalSignatures {
            /** @signal */
            "cancel-request": (object: string) => void;
            /** @signal */
            "new-request": (object: string, p0: NM.Connection, p1: string, p2: string[], p3: number) => void;
            "notify::auto-register": (pspec: GObject.ParamSpec) => void;
            "notify::capabilities": (pspec: GObject.ParamSpec) => void;
            "notify::dbus-connection": (pspec: GObject.ParamSpec) => void;
            "notify::identifier": (pspec: GObject.ParamSpec) => void;
            "notify::registered": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends NM.SecretAgentOld.ConstructorProps, Gio.AsyncInitable.ConstructorProps, Gio.Initable.ConstructorProps {}
    }

    class NetworkAgent extends NM.SecretAgentOld implements Gio.AsyncInitable<NetworkAgent>, Gio.Initable {
        static $gtype: GObject.GType<NetworkAgent>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: NetworkAgent.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<NetworkAgent.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof NetworkAgent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NetworkAgent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof NetworkAgent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NetworkAgent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof NetworkAgent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<NetworkAgent.SignalSignatures[K]>): void;

        // Methods
        add_vpn_secret(request_id: string, setting_key: string, setting_value: string): void;

        respond(request_id: string, response: NetworkAgentResponse): void;

        search_vpn_plugin(service: string): globalThis.Promise<NM.VpnPluginInfo | null>;

        search_vpn_plugin(service: string, callback: Gio.AsyncReadyCallback<this> | null): void;

        search_vpn_plugin(service: string, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<NM.VpnPluginInfo | null> | void;

        search_vpn_plugin_finish(result: Gio.AsyncResult): NM.VpnPluginInfo | null;

        set_password(request_id: string, setting_key: string, setting_value: string): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null): globalThis.Promise<boolean>;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<boolean> | void;

        init_finish(res: Gio.AsyncResult): boolean;

        new_finish(res: Gio.AsyncResult): NetworkAgent;

        vfunc_init_async(io_priority: number, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        vfunc_init_finish(res: Gio.AsyncResult): boolean;

        init(cancellable: Gio.Cancellable | null): boolean;

        vfunc_init(cancellable: Gio.Cancellable | null): boolean;
    }


    namespace PolkitAuthenticationAgent {
        // Signal signatures
        interface SignalSignatures extends PolkitAgent.Listener.SignalSignatures {
            /** @signal */
            cancel: () => void;
            /** @signal */
            initiate: (object: string, p0: string, p1: string, p2: string, p3: string[]) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends PolkitAgent.Listener.ConstructorProps {}
    }

    class PolkitAuthenticationAgent extends PolkitAgent.Listener {
        static $gtype: GObject.GType<PolkitAuthenticationAgent>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: PolkitAuthenticationAgent.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<PolkitAuthenticationAgent.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): PolkitAuthenticationAgent;

        // Signals
        /** @signal */
        connect<K extends keyof PolkitAuthenticationAgent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PolkitAuthenticationAgent.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PolkitAuthenticationAgent.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PolkitAuthenticationAgent.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PolkitAuthenticationAgent.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PolkitAuthenticationAgent.SignalSignatures[K]>): void;

        // Methods
        complete(dismissed: boolean): void;

        register(): void;

    // Conflicted with PolkitAgent.Listener.register
        register(...args: never[]): any;

        unregister(): void;
    }


    namespace Screenshot {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "screenshot-taken": (object: Mtk.Rectangle) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Screenshot extends GObject.Object {
        static $gtype: GObject.GType<Screenshot>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Screenshot.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Screenshot.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Screenshot;

        // Signals
        /** @signal */
        connect<K extends keyof Screenshot.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Screenshot.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Screenshot.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Screenshot.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Screenshot.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Screenshot.SignalSignatures[K]>): void;

        // Static methods
        static composite_to_stream(texture: Cogl.Texture, x: number, y: number, width: number, height: number, scale: number, cursor: Cogl.Texture | null, cursor_x: number, cursor_y: number, cursor_scale: number, stream: Gio.OutputStream, callback: Gio.AsyncReadyCallback<Screenshot> | null): void;

        static composite_to_stream_finish(result: Gio.AsyncResult): GdkPixbuf.Pixbuf | null;

        // Methods
        pick_color(x: number, y: number): globalThis.Promise<Cogl.Color>;

        pick_color(x: number, y: number, callback: Gio.AsyncReadyCallback<this> | null): void;

        pick_color(x: number, y: number, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Cogl.Color> | void;

        pick_color_finish(result: Gio.AsyncResult): [boolean, Cogl.Color];

        screenshot(include_cursor: boolean, stream: Gio.OutputStream): globalThis.Promise<Mtk.Rectangle>;

        screenshot(include_cursor: boolean, stream: Gio.OutputStream, callback: Gio.AsyncReadyCallback<this> | null): void;

        screenshot(include_cursor: boolean, stream: Gio.OutputStream, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Mtk.Rectangle> | void;

        screenshot_area(x: number, y: number, width: number, height: number, stream: Gio.OutputStream): globalThis.Promise<Mtk.Rectangle>;

        screenshot_area(x: number, y: number, width: number, height: number, stream: Gio.OutputStream, callback: Gio.AsyncReadyCallback<this> | null): void;

        screenshot_area(x: number, y: number, width: number, height: number, stream: Gio.OutputStream, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Mtk.Rectangle> | void;

        screenshot_area_finish(result: Gio.AsyncResult): [boolean, Mtk.Rectangle];

        screenshot_finish(result: Gio.AsyncResult): [boolean, Mtk.Rectangle];

        screenshot_stage_to_content(): globalThis.Promise<[Clutter.Content, number, Clutter.Content | null, Graphene.Point | null, number]>;

        screenshot_stage_to_content(callback: Gio.AsyncReadyCallback<this> | null): void;

        screenshot_stage_to_content(callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<[Clutter.Content, number, Clutter.Content | null, Graphene.Point | null, number]> | void;

        screenshot_stage_to_content_finish(result: Gio.AsyncResult): [Clutter.Content, number, Clutter.Content | null, Graphene.Point | null, number];

        screenshot_window(include_frame: boolean, include_cursor: boolean, stream: Gio.OutputStream): globalThis.Promise<Mtk.Rectangle>;

        screenshot_window(include_frame: boolean, include_cursor: boolean, stream: Gio.OutputStream, callback: Gio.AsyncReadyCallback<this> | null): void;

        screenshot_window(include_frame: boolean, include_cursor: boolean, stream: Gio.OutputStream, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Mtk.Rectangle> | void;

        screenshot_window_finish(result: Gio.AsyncResult): [boolean, Mtk.Rectangle];
    }


    namespace SoundPlayer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            played: (object: string) => void;
            /** @signal */
            started: (object: string, p0: number) => void;
        }

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

        // Static methods
        static get_default(): SoundPlayer;

        // Methods
        get_cached_bytes(): number;

        play(name: string): void;

        play_fd(fd: number): void;

        play_file(file: Gio.File): void;

        prepare(): void;
    }


    namespace SpringTransition {
        // Signal signatures
        interface SignalSignatures extends Clutter.PropertyTransition.SignalSignatures {
            "notify::bounce": (pspec: GObject.ParamSpec) => void;
            "notify::epsilon": (pspec: GObject.ParamSpec) => void;
            "notify::response": (pspec: GObject.ParamSpec) => void;
            "notify::target": (pspec: GObject.ParamSpec) => void;
            "notify::velocity": (pspec: GObject.ParamSpec) => void;
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
        interface ConstructorProps extends Clutter.PropertyTransition.ConstructorProps {
            bounce: number;
            epsilon: number;
            response: number;
            target: number;
            velocity: number;
        }
    }

    class SpringTransition extends Clutter.PropertyTransition {
        static $gtype: GObject.GType<SpringTransition>;

        // Properties
        get bounce(): number;

        get epsilon(): number;
        set epsilon(val: number);

        get response(): number;

        get target(): number;

        get velocity(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SpringTransition.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SpringTransition.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](property_name: string, target: number, duration: number, bounce: number, velocity: number): SpringTransition;

        // Conflicted with Clutter.PropertyTransition.new
        static ["new"](...args: never[]): any;

        // Signals
        /** @signal */
        connect<K extends keyof SpringTransition.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SpringTransition.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SpringTransition.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SpringTransition.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SpringTransition.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SpringTransition.SignalSignatures[K]>): void;

        // Methods
        get_target(): number;

        get_velocity(): number;
    }


    namespace Stack {
        // Signal signatures
        interface SignalSignatures extends St.Widget.SignalSignatures {
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
        interface ConstructorProps extends St.Widget.ConstructorProps, Atk.ImplementorIface.ConstructorProps, Clutter.Animatable.ConstructorProps {}
    }

    class Stack extends St.Widget implements Atk.ImplementorIface, Clutter.Animatable {
        static $gtype: GObject.GType<Stack>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Stack.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Stack.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Stack.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Stack.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Stack.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Stack.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Stack.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Stack.SignalSignatures[K]>): void;
    }


    namespace WM {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "confirm-display-change": () => void;
            /** @signal */
            "create-close-dialog": (window: Meta.Window) => Meta.CloseDialog;
            /** @signal */
            "create-inhibit-shortcuts-dialog": (window: Meta.Window) => Meta.InhibitShortcutsDialog;
            /** @signal */
            destroy: (object: Meta.WindowActor) => void;
            /** @signal */
            "filter-keybinding": (object: Meta.KeyBinding) => boolean | void;
            /** @signal */
            "hide-tile-preview": () => void;
            /** @signal */
            "kill-switch-workspace": () => void;
            /** @signal */
            "kill-window-effects": (object: Meta.WindowActor) => void;
            /** @signal */
            map: (object: Meta.WindowActor) => void;
            /** @signal */
            minimize: (object: Meta.WindowActor) => void;
            /** @signal */
            "show-tile-preview": (object: Meta.Window, p0: Mtk.Rectangle, p1: number) => void;
            /** @signal */
            "show-window-menu": (object: Meta.Window, p0: number, p1: Mtk.Rectangle) => void;
            /** @signal */
            "size-change": (object: Meta.WindowActor, p0: Meta.SizeChange, p1: Mtk.Rectangle, p2: Mtk.Rectangle) => void;
            /** @signal */
            "size-changed": (object: Meta.WindowActor) => void;
            /** @signal */
            "switch-workspace": (object: number, p0: number, p1: number) => void;
            /** @signal */
            unminimize: (object: Meta.WindowActor) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class WM extends GObject.Object {
        static $gtype: GObject.GType<WM>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WM.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WM.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](plugin: Meta.Plugin): WM;

        // Signals
        /** @signal */
        connect<K extends keyof WM.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WM.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WM.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WM.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WM.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WM.SignalSignatures[K]>): void;

        // Methods
        complete_display_change(ok: boolean): void;

        completed_destroy(actor: Meta.WindowActor): void;

        completed_map(actor: Meta.WindowActor): void;

        completed_minimize(actor: Meta.WindowActor): void;

        completed_size_change(actor: Meta.WindowActor): void;

        completed_switch_workspace(): void;

        completed_unminimize(actor: Meta.WindowActor): void;
    }


    namespace WindowTracker {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "startup-sequence-changed": (object: Meta.StartupSequence) => void;
            /** @signal */
            "tracked-windows-changed": () => void;
            "notify::focus-app": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            focus_app: App | null;
            focusApp: App | null;
        }
    }

    class WindowTracker extends GObject.Object {
        static $gtype: GObject.GType<WindowTracker>;

        // Properties
        get focus_app(): App | null;

        get focusApp(): App | null;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: WindowTracker.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<WindowTracker.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof WindowTracker.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WindowTracker.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof WindowTracker.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, WindowTracker.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof WindowTracker.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<WindowTracker.SignalSignatures[K]>): void;

        // Static methods
        static get_default(): WindowTracker;

        // Methods
        get_app_from_pid(pid: number): App;

        get_focus_app(): App | null;

        get_startup_sequences(): Meta.StartupSequence[];

        get_window_app(metawin: Meta.Window): App;
    }


    namespace XkbInfo {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class XkbInfo extends GObject.Object {
        static $gtype: GObject.GType<XkbInfo>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: XkbInfo.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<XkbInfo.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): XkbInfo;

        // Signals
        /** @signal */
        connect<K extends keyof XkbInfo.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, XkbInfo.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof XkbInfo.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, XkbInfo.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof XkbInfo.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<XkbInfo.SignalSignatures[K]>): void;

        // Methods
        get_languages_for_layout(id: string): string[];

        get_layout_info(id: string): [boolean, string, string, string, string];
    }


    type AppClass = typeof App;

    type AppSystemClass = typeof AppSystem;

    type BlurEffectClass = typeof BlurEffect;

    type CameraMonitorClass = typeof CameraMonitor;

    type EdgeDragGestureClass = typeof EdgeDragGesture;

    type GlobalClass = typeof Global;

    type GlyphRendererClass = typeof GlyphRenderer;

    type InvertLightnessEffectClass = typeof InvertLightnessEffect;

    type MixerClass = typeof Mixer;

    type MixerDeviceClass = typeof MixerDevice;

    type MixerStreamClass = typeof MixerStream;

    type ModifierChordClass = typeof ModifierChord;

    type MountOperationClass = typeof MountOperation;

    type NetworkAgentClass = typeof NetworkAgent;

    type PolkitAuthenticationAgentClass = typeof PolkitAuthenticationAgent;

    type ScreenshotClass = typeof Screenshot;

    type SoundPlayerClass = typeof SoundPlayer;

    type SpringTransitionClass = typeof SpringTransition;

    type StackClass = typeof Stack;

    type WMClass = typeof WM;

    type WindowTrackerClass = typeof WindowTracker;

    type XkbInfoClass = typeof XkbInfo;

    const __name__: string;

    const __version__: string;
}

export default Shell;

}

declare module 'gi://Shell' {
    import Shell51 from 'gi://Shell?version=51';
    export default Shell51;
}
// END
