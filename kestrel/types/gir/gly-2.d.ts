/// <reference path="./gio-2.0.d.ts" />
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

declare module 'gi://Gly?version=2' {

// Module dependencies
import type Gio from 'gi://Gio?version=2.0';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type GModule from 'gi://GModule?version=2.0';

export namespace Gly {

    /**
     * Gly-2
     */


    export namespace ColorMode {
        export const $gtype: GObject.GType<ColorMode>;
    }

    enum ColorMode {
        SRGB = 1,
        CICP = 2,
        ICC_PROFILE = 3,
    }


    class LoaderError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static FAILED: number;

        static UNKNOWN_IMAGE_FORMAT: number;

        static NO_MORE_FRAMES: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
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
        R16G16B16A16_FLOAT = 13,
        R32G32B32_FLOAT = 14,
        R32G32B32A32_FLOAT_PREMULTIPLIED = 15,
        R32G32B32A32_FLOAT = 16,
        G8A8_PREMULTIPLIED = 17,
        G8A8 = 18,
        G8 = 19,
        G16A16_PREMULTIPLIED = 20,
        G16A16 = 21,
        G16 = 22,
    }


    export namespace PhysicalDimensionUnit {
        export const $gtype: GObject.GType<PhysicalDimensionUnit>;
    }

    enum PhysicalDimensionUnit {
        INCH = 1,
        PICA = 2,
        POINT = 3,
        METER = 4,
        CENTIMETER = 5,
        MILLIMETER = 6,
    }


    export namespace SandboxSelector {
        export const $gtype: GObject.GType<SandboxSelector>;
    }

    enum SandboxSelector {
        AUTO = 0,
        BWRAP = 1,
        FLATPAK_SPAWN = 2,
        NOT_SANDBOXED = 3,
    }


    function loader_error_quark(): GLib.Quark;

    function memory_format_has_alpha(memory_format: MemoryFormat): boolean;

    function memory_format_is_premultiplied(memory_format: MemoryFormat): boolean;

    interface LoaderGetMimeTypesDoneFunc {
        (mime_types: string[], data: null): void;
    }

    export namespace MemoryFormatSelection {
        export const $gtype: GObject.GType<MemoryFormatSelection>;
    }

    enum MemoryFormatSelection {
        B8G8R8A8_PREMULTIPLIED = 1,
        A8R8G8B8_PREMULTIPLIED = 2,
        R8G8B8A8_PREMULTIPLIED = 4,
        B8G8R8A8 = 8,
        A8R8G8B8 = 16,
        R8G8B8A8 = 32,
        A8B8G8R8 = 64,
        R8G8B8 = 128,
        B8G8R8 = 256,
        R16G16B16 = 512,
        R16G16B16A16_PREMULTIPLIED = 1024,
        R16G16B16A16 = 2048,
        R16G16B16_FLOAT = 4096,
        R16G16B16A16_FLOAT = 8192,
        R32G32B32_FLOAT = 16384,
        R32G32B32A32_FLOAT_PREMULTIPLIED = 32768,
        R32G32B32A32_FLOAT = 65536,
        G8A8_PREMULTIPLIED = 131072,
        G8A8 = 262144,
        G8 = 524288,
        G16A16_PREMULTIPLIED = 1048576,
        G16A16 = 2097152,
        G16 = 4194304,
    }


    namespace Creator {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::mime-type": (pspec: GObject.ParamSpec) => void;
            "notify::sandbox-selector": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            mime_type: string;
            mimeType: string;
            sandbox_selector: SandboxSelector;
            sandboxSelector: SandboxSelector;
        }
    }

    class Creator extends GObject.Object {
        static $gtype: GObject.GType<Creator>;

        // Properties
        get mime_type(): string;

        get mimeType(): string;

        get sandbox_selector(): SandboxSelector;
        set sandbox_selector(val: SandboxSelector);

        get sandboxSelector(): SandboxSelector;
        set sandboxSelector(val: SandboxSelector);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Creator.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Creator.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](mime_type: string): Creator;

        // Signals
        /** @signal */
        connect<K extends keyof Creator.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Creator.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Creator.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Creator.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Creator.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Creator.SignalSignatures[K]>): void;

        // Methods
        add_frame(width: number, height: number, memory_format: MemoryFormat, texture: GLib.Bytes | Uint8Array): NewFrame;

        add_frame_with_stride(width: number, height: number, stride: number, memory_format: MemoryFormat, texture: GLib.Bytes | Uint8Array): NewFrame;

        add_metadata_key_value(key: string, value: string): boolean;

        create(): EncodedImage | null;

        create_async(cancellable: Gio.Cancellable | null): globalThis.Promise<EncodedImage>;

        create_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        create_async(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<EncodedImage> | void;

        create_finish(result: Gio.AsyncResult): EncodedImage;

        set_encoding_compression(compression: number): boolean;

        set_encoding_quality(quality: number): boolean;

        set_sandbox_selector(sandbox_selector: SandboxSelector): boolean;
    }


    namespace EncodedImage {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::data": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            data: GLib.Bytes | Uint8Array;
        }
    }

    class EncodedImage extends GObject.Object {
        static $gtype: GObject.GType<EncodedImage>;

        // Properties
        get data(): GLib.Bytes;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: EncodedImage.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<EncodedImage.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof EncodedImage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, EncodedImage.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof EncodedImage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, EncodedImage.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof EncodedImage.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<EncodedImage.SignalSignatures[K]>): void;

        // Methods
        get_data(): GLib.Bytes;

    // Conflicted with GObject.Object.get_data
        get_data(...args: never[]): any;
    }


    namespace Frame {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Frame extends GObject.Object {
        static $gtype: GObject.GType<Frame>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Frame.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Frame.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Frame.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Frame.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Frame.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Frame.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Frame.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Frame.SignalSignatures[K]>): void;

        // Methods
        get_buf_bytes(): GLib.Bytes;

        get_color_cicp(): Cicp | null;

        get_color_icc_profile(): GLib.Bytes | null;

        get_color_mode(): ColorMode;

        get_delay(): number;

        get_details(): FrameDetails;

        get_height(): number;

        get_memory_format(): MemoryFormat;

        get_stride(): number;

        get_width(): number;
    }


    namespace FrameDetails {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::pixel-density": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            pixel_density: PixelDensity;
            pixelDensity: PixelDensity;
        }
    }

    class FrameDetails extends GObject.Object {
        static $gtype: GObject.GType<FrameDetails>;

        // Properties
        get pixel_density(): PixelDensity;

        get pixelDensity(): PixelDensity;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FrameDetails.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FrameDetails.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FrameDetails.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FrameDetails.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FrameDetails.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FrameDetails.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FrameDetails.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FrameDetails.SignalSignatures[K]>): void;

        // Methods
        get_pixel_density(): PixelDensity;
    }


    namespace FrameRequest {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::loop-animation": (pspec: GObject.ParamSpec) => void;
            "notify::scale-height": (pspec: GObject.ParamSpec) => void;
            "notify::scale-width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            loop_animation: boolean;
            loopAnimation: boolean;
            scale_height: number;
            scaleHeight: number;
            scale_width: number;
            scaleWidth: number;
        }
    }

    class FrameRequest extends GObject.Object {
        static $gtype: GObject.GType<FrameRequest>;

        // Properties
        get loop_animation(): boolean;
        set loop_animation(val: boolean);

        get loopAnimation(): boolean;
        set loopAnimation(val: boolean);

        get scale_height(): number;

        get scaleHeight(): number;

        get scale_width(): number;

        get scaleWidth(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FrameRequest.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FrameRequest.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): FrameRequest;

        // Signals
        /** @signal */
        connect<K extends keyof FrameRequest.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FrameRequest.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FrameRequest.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FrameRequest.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FrameRequest.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FrameRequest.SignalSignatures[K]>): void;

        // Methods
        set_loop_animation(loop_animation: boolean): void;

        set_scale(width: number, height: number): void;
    }


    namespace Image {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Image extends GObject.Object {
        static $gtype: GObject.GType<Image>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Image.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Image.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Image.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Image.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Image.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Image.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Image.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Image.SignalSignatures[K]>): void;

        // Methods
        get_height(): number;

        get_metadata_key_value(key: string): string | null;

        get_metadata_keys(): string[];

        get_mime_type(): string;

        get_specific_frame(frame_request: FrameRequest): Frame;

        get_specific_frame_async(frame_request: FrameRequest, cancellable: Gio.Cancellable | null): globalThis.Promise<Frame>;

        get_specific_frame_async(frame_request: FrameRequest, cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        get_specific_frame_async(frame_request: FrameRequest, cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Frame> | void;

        get_specific_frame_finish(result: Gio.AsyncResult): Frame;

        get_transformation_orientation(): number;

        get_width(): number;

        next_frame(): Frame;

        next_frame_async(cancellable: Gio.Cancellable | null): globalThis.Promise<Frame>;

        next_frame_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        next_frame_async(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Frame> | void;

        next_frame_finish(result: Gio.AsyncResult): Frame;
    }


    namespace Loader {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::accepted-memory-formats": (pspec: GObject.ParamSpec) => void;
            "notify::apply-transformations": (pspec: GObject.ParamSpec) => void;
            "notify::bytes": (pspec: GObject.ParamSpec) => void;
            "notify::cancellable": (pspec: GObject.ParamSpec) => void;
            "notify::color-convert-icc-srgb": (pspec: GObject.ParamSpec) => void;
            "notify::file": (pspec: GObject.ParamSpec) => void;
            "notify::sandbox-selector": (pspec: GObject.ParamSpec) => void;
            "notify::stream": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            accepted_memory_formats: MemoryFormatSelection;
            acceptedMemoryFormats: MemoryFormatSelection;
            apply_transformations: boolean;
            applyTransformations: boolean;
            bytes: GLib.Bytes | Uint8Array;
            cancellable: Gio.Cancellable;
            color_convert_icc_srgb: boolean;
            colorConvertIccSrgb: boolean;
            file: Gio.File;
            sandbox_selector: SandboxSelector;
            sandboxSelector: SandboxSelector;
            stream: Gio.InputStream;
        }
    }

    class Loader extends GObject.Object {
        static $gtype: GObject.GType<Loader>;

        // Properties
        set accepted_memory_formats(val: MemoryFormatSelection);

        set acceptedMemoryFormats(val: MemoryFormatSelection);

        set apply_transformations(val: boolean);

        set applyTransformations(val: boolean);

        set bytes(val: GLib.Bytes | Uint8Array);

        get cancellable(): Gio.Cancellable;
        set cancellable(val: Gio.Cancellable);

        set color_convert_icc_srgb(val: boolean);

        set colorConvertIccSrgb(val: boolean);

        set file(val: Gio.File);

        set sandbox_selector(val: SandboxSelector);

        set sandboxSelector(val: SandboxSelector);

        set stream(val: Gio.InputStream);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Loader.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Loader.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](file: Gio.File): Loader;

        static new_for_bytes(bytes: GLib.Bytes | Uint8Array): Loader;

        static new_for_stream(stream: Gio.InputStream): Loader;

        // Signals
        /** @signal */
        connect<K extends keyof Loader.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Loader.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Loader.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Loader.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Loader.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Loader.SignalSignatures[K]>): void;

        // Static methods
        static get_mime_types(): string[];

        static get_mime_types_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<Loader> | null): void;

        static get_mime_types_finish(result: Gio.AsyncResult): string[];

        // Methods
        load(): Image;

        load_async(cancellable: Gio.Cancellable | null): globalThis.Promise<Image>;

        load_async(cancellable: Gio.Cancellable | null, callback: Gio.AsyncReadyCallback<this> | null): void;

        load_async(cancellable: Gio.Cancellable | null, callback?: Gio.AsyncReadyCallback<this> | null): globalThis.Promise<Image> | void;

        load_finish(result: Gio.AsyncResult): Image;

        set_accepted_memory_formats(memory_format_selection: MemoryFormatSelection): void;

        set_apply_transformations(apply_transformations: boolean): void;

        set_color_convert_icc_srgb(convert: boolean): void;

        set_sandbox_selector(sandbox_selector: SandboxSelector): void;
    }


    namespace NewFrame {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::color-icc-profile": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::memory-format": (pspec: GObject.ParamSpec) => void;
            "notify::stride": (pspec: GObject.ParamSpec) => void;
            "notify::texture": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            color_icc_profile: GLib.Bytes | Uint8Array;
            colorIccProfile: GLib.Bytes | Uint8Array;
            height: number;
            memory_format: MemoryFormat;
            memoryFormat: MemoryFormat;
            stride: number;
            texture: GLib.Bytes | Uint8Array;
            width: number;
        }
    }

    class NewFrame extends GObject.Object {
        static $gtype: GObject.GType<NewFrame>;

        // Properties
        get color_icc_profile(): GLib.Bytes;
        set color_icc_profile(val: GLib.Bytes | Uint8Array);

        get colorIccProfile(): GLib.Bytes;
        set colorIccProfile(val: GLib.Bytes | Uint8Array);

        get height(): number;

        get memory_format(): MemoryFormat;

        get memoryFormat(): MemoryFormat;

        get stride(): number;

        get texture(): GLib.Bytes;

        get width(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: NewFrame.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<NewFrame.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof NewFrame.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NewFrame.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof NewFrame.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NewFrame.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof NewFrame.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<NewFrame.SignalSignatures[K]>): void;

        // Methods
        set_color_icc_profile(icc_profile: GLib.Bytes | Uint8Array): boolean;

        set_pixel_density(pixel_density: PixelDensity): void;
    }


    namespace PixelDensity {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::x-unit": (pspec: GObject.ParamSpec) => void;
            "notify::x-value": (pspec: GObject.ParamSpec) => void;
            "notify::y-unit": (pspec: GObject.ParamSpec) => void;
            "notify::y-value": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            x_unit: PhysicalDimensionUnit;
            xUnit: PhysicalDimensionUnit;
            x_value: number;
            xValue: number;
            y_unit: PhysicalDimensionUnit;
            yUnit: PhysicalDimensionUnit;
            y_value: number;
            yValue: number;
        }
    }

    class PixelDensity extends GObject.Object {
        static $gtype: GObject.GType<PixelDensity>;

        // Properties
        get x_unit(): PhysicalDimensionUnit;
        set x_unit(val: PhysicalDimensionUnit);

        get xUnit(): PhysicalDimensionUnit;
        set xUnit(val: PhysicalDimensionUnit);

        get x_value(): number;
        set x_value(val: number);

        get xValue(): number;
        set xValue(val: number);

        get y_unit(): PhysicalDimensionUnit;
        set y_unit(val: PhysicalDimensionUnit);

        get yUnit(): PhysicalDimensionUnit;
        set yUnit(val: PhysicalDimensionUnit);

        get y_value(): number;
        set y_value(val: number);

        get yValue(): number;
        set yValue(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: PixelDensity.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<PixelDensity.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](x_value: number, x_unit: PhysicalDimensionUnit, y_value: number, y_unit: PhysicalDimensionUnit): PixelDensity;

        // Signals
        /** @signal */
        connect<K extends keyof PixelDensity.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PixelDensity.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PixelDensity.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PixelDensity.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PixelDensity.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PixelDensity.SignalSignatures[K]>): void;

        // Methods
        convert(unit: PhysicalDimensionUnit): PixelDensity;

        get_x_unit(): PhysicalDimensionUnit;

        get_x_value(): number;

        get_y_unit(): PhysicalDimensionUnit;

        get_y_value(): number;
    }


    class Cicp {
        static $gtype: GObject.GType<Cicp>;

        // Fields
        color_primaries: number;

        transfer_characteristics: number;

        matrix_coefficients: number;

        video_full_range_flag: number;

        // Constructors

        constructor(properties?: Partial<{
            color_primaries: number;
            transfer_characteristics: number;
            matrix_coefficients: number;
            video_full_range_flag: number;
        }>);

        // Methods
        copy(): Cicp;

        free(): void;
    }


    type CreatorClass = typeof Creator;

    type EncodedImageClass = typeof EncodedImage;

    type FrameClass = typeof Frame;

    type FrameDetailsClass = typeof FrameDetails;

    type FrameRequestClass = typeof FrameRequest;

    type ImageClass = typeof Image;

    type LoaderClass = typeof Loader;

    type NewFrameClass = typeof NewFrame;

    type PixelDensityClass = typeof PixelDensity;

    const __name__: string;

    const __version__: string;
}

export default Gly;

}

declare module 'gi://Gly' {
    import Gly2 from 'gi://Gly?version=2';
    export default Gly2;
}
// END
