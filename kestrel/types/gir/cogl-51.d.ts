/// <reference path="./mtk-51.d.ts" />
/// <reference path="./graphene-1.0.d.ts" />
/// <reference path="./gobject-2.0.d.ts" />
/// <reference path="./glib-2.0.d.ts" />
/// <reference path="./gl-1.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://Cogl?version=51' {

// Module dependencies
import type Mtk from 'gi://Mtk?version=51';
import type Graphene from 'gi://Graphene?version=1.0';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type GL from 'gi://GL?version=1.0';

export namespace Cogl {

    /**
     * Cogl-51
     */


    export namespace AttributeType {
        export const $gtype: GObject.GType<AttributeType>;
    }

    enum AttributeType {
        BYTE = 5120,
        UNSIGNED_BYTE = 5121,
        SHORT = 5122,
        UNSIGNED_SHORT = 5123,
        FLOAT = 5126,
    }


    export namespace BufferBindTarget {
        export const $gtype: GObject.GType<BufferBindTarget>;
    }

    enum BufferBindTarget {
        PIXEL_PACK = 0,
        PIXEL_UNPACK = 1,
        ATTRIBUTE_BUFFER = 2,
        INDEX_BUFFER = 3,
        COUNT = 4,
    }


    export namespace BufferUpdateHint {
        export const $gtype: GObject.GType<BufferUpdateHint>;
    }

    enum BufferUpdateHint {
        STATIC = 0,
        DYNAMIC = 1,
        STREAM = 2,
    }


    export namespace DepthTestFunction {
        export const $gtype: GObject.GType<DepthTestFunction>;
    }

    enum DepthTestFunction {
        NEVER = 512,
        LESS = 513,
        EQUAL = 514,
        LEQUAL = 515,
        GREATER = 516,
        NOTEQUAL = 517,
        GEQUAL = 518,
        ALWAYS = 519,
    }


    enum DriverId {
        ANY = 0,
        NOP = 1,
        GL3 = 2,
        GLES2 = 3,
    }


    enum FeatureID {
        OGL_FEATURE_ID_UNSIGNED_INT_INDICES = 0,
        OGL_FEATURE_ID_MAP_BUFFER_FOR_READ = 1,
        OGL_FEATURE_ID_MAP_BUFFER_FOR_WRITE = 2,
        OGL_FEATURE_ID_TEXTURE_RG = 3,
        OGL_FEATURE_ID_TEXTURE_RGBA1010102 = 4,
        OGL_FEATURE_ID_TEXTURE_HALF_FLOAT = 5,
        OGL_FEATURE_ID_TEXTURE_NORM16 = 6,
        OGL_FEATURE_ID_BLIT_FRAMEBUFFER = 7,
        OGL_FEATURE_ID_TIMESTAMP_QUERY = 8,
        OGL_FEATURE_ID_TEXTURE_2D_FROM_EGL_IMAGE = 9,
        OGL_FEATURE_ID_MESA_PACK_INVERT = 10,
        OGL_FEATURE_ID_PBOS = 11,
        OGL_FEATURE_ID_EXT_PACKED_DEPTH_STENCIL = 12,
        OGL_FEATURE_ID_OES_PACKED_DEPTH_STENCIL = 13,
        OGL_FEATURE_ID_TEXTURE_FORMAT_BGRA8888 = 14,
        OGL_FEATURE_ID_TEXTURE_FORMAT_SIZED_RGBA = 15,
        OGL_FEATURE_ID_UNPACK_SUBIMAGE = 16,
        OGL_FEATURE_ID_SAMPLER_OBJECTS = 17,
        OGL_FEATURE_ID_READ_PIXELS_ANY_STRIDE = 18,
        OGL_FEATURE_ID_FORMAT_CONVERSION = 19,
        OGL_FEATURE_ID_QUERY_FRAMEBUFFER_BITS = 20,
        OGL_FEATURE_ID_ALPHA_TEXTURES = 21,
        OGL_FEATURE_ID_TEXTURE_SWIZZLE = 22,
        OGL_FEATURE_ID_TEXTURE_MAX_LEVEL = 23,
        OGL_FEATURE_ID_TEXTURE_LOD_BIAS = 24,
        OGL_FEATURE_ID_QUIRK_GENERATE_MIPMAP_NEEDS_FLUSH = 25,
    }


    enum FrameEvent {
        SYNC = 1,
        COMPLETE = 2,
    }


    enum FramebufferError {
        FRAMEBUFFER_ERROR_ALLOCATE = 0,
    }


    enum FramebufferState {
    }


    enum GraphicsResetStatus {
        NO_ERROR = 0,
        GUILTY_CONTEXT_RESET = 1,
        INNOCENT_CONTEXT_RESET = 2,
        UNKNOWN_CONTEXT_RESET = 3,
        PURGED_CONTEXT_RESET = 4,
    }


    export namespace IndicesType {
        export const $gtype: GObject.GType<IndicesType>;
    }

    enum IndicesType {
        BYTE = 0,
        SHORT = 1,
        INT = 2,
    }


    enum PipelineAlphaFunc {
        NEVER = 512,
        LESS = 513,
        EQUAL = 514,
        LEQUAL = 515,
        GREATER = 516,
        NOTEQUAL = 517,
        GEQUAL = 518,
        ALWAYS = 519,
    }


    enum PipelineCullFaceMode {
        NONE = 0,
        FRONT = 1,
        BACK = 2,
        BOTH = 3,
    }


    enum PipelineFilter {
        NEAREST = 9728,
        LINEAR = 9729,
        NEAREST_MIPMAP_NEAREST = 9984,
        LINEAR_MIPMAP_NEAREST = 9985,
        NEAREST_MIPMAP_LINEAR = 9986,
        LINEAR_MIPMAP_LINEAR = 9987,
    }


    enum PipelineWrapMode {
        REPEAT = 10497,
        MIRRORED_REPEAT = 33648,
        CLAMP_TO_EDGE = 33071,
        AUTOMATIC = 519,
    }


    export namespace PixelFormat {
        export const $gtype: GObject.GType<PixelFormat>;
    }

    enum PixelFormat {
        ANY = 0,
        A_8 = 17,
        RGB_565 = 4,
        RGBA_4444 = 21,
        RGBA_5551 = 22,
        YUV = 7,
        R_8 = 8,
        RG_88 = 9,
        RGB_888 = 2,
        BGR_888 = 34,
        RGBX_8888 = 3,
        RGBA_8888 = 19,
        BGRX_8888 = 35,
        BGRA_8888 = 51,
        XRGB_8888 = 67,
        ARGB_8888 = 83,
        XBGR_8888 = 99,
        ABGR_8888 = 115,
        RGBA_8888_PRE = 147,
        BGRA_8888_PRE = 179,
        ARGB_8888_PRE = 211,
        ABGR_8888_PRE = 243,
        RGBA_4444_PRE = 149,
        RGBA_5551_PRE = 150,
        RGBA_1010102 = 29,
        BGRA_1010102 = 61,
        XRGB_2101010 = 77,
        ARGB_2101010 = 93,
        XBGR_2101010 = 109,
        ABGR_2101010 = 125,
        RGBA_1010102_PRE = 157,
        BGRA_1010102_PRE = 189,
        ARGB_2101010_PRE = 221,
        ABGR_2101010_PRE = 253,
        RGBX_FP_16161616 = 11,
        RGBA_FP_16161616 = 27,
        BGRX_FP_16161616 = 43,
        BGRA_FP_16161616 = 59,
        XRGB_FP_16161616 = 75,
        ARGB_FP_16161616 = 91,
        XBGR_FP_16161616 = 107,
        ABGR_FP_16161616 = 123,
        RGBA_FP_16161616_PRE = 155,
        BGRA_FP_16161616_PRE = 187,
        ARGB_FP_16161616_PRE = 219,
        ABGR_FP_16161616_PRE = 251,
        RGBA_FP_32323232 = 28,
        RGBA_FP_32323232_PRE = 156,
        R_16 = 14,
        RG_1616 = 15,
        RGBX_16161616 = 10,
        RGBA_16161616 = 26,
        RGBA_16161616_PRE = 154,
        DEPTH_16 = 265,
        DEPTH_24_STENCIL_8 = 771,
    }


    export namespace RendererError {
        export const $gtype: GObject.GType<RendererError>;
    }

    enum RendererError {
        XLIB_DISPLAY_OPEN = 0,
        BAD_CONSTRAINT = 1,
    }


    class ScanoutError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static INHIBITED: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    enum SnippetHook {
        VERTEX = 0,
        VERTEX_TRANSFORM = 1,
        VERTEX_GLOBALS = 2,
        POINT_SIZE = 3,
        FRAGMENT = 2048,
        FRAGMENT_GLOBALS = 2049,
        TEXTURE_COORD_TRANSFORM = 4096,
        LAYER_FRAGMENT = 6144,
        TEXTURE_LOOKUP = 6145,
    }


    export namespace SystemError {
        export const $gtype: GObject.GType<SystemError>;
    }

    enum SystemError {
        COGL_SYSTEM_ERROR_UNSUPPORTED = 0,
        COGL_SYSTEM_ERROR_NO_MEMORY = 1,
    }


    enum TextureComponents {
        A = 1,
        RG = 2,
        RGB = 3,
        RGBA = 4,
        DEPTH = 5,
    }


    enum TextureError {
        SIZE = 0,
        FORMAT = 1,
        BAD_PARAMETER = 2,
        TYPE = 3,
    }


    export namespace VerticesMode {
        export const $gtype: GObject.GType<VerticesMode>;
    }

    enum VerticesMode {
        POINTS = 0,
        LINES = 1,
        LINE_LOOP = 2,
        LINE_STRIP = 3,
        TRIANGLES = 4,
        TRIANGLE_STRIP = 5,
        TRIANGLE_FAN = 6,
    }


    export namespace Winding {
        export const $gtype: GObject.GType<Winding>;
    }

    enum Winding {
        CLOCKWISE = 0,
        COUNTER_CLOCKWISE = 1,
    }


    enum WinsysError {
        INIT = 0,
        CREATE_CONTEXT = 1,
        CREATE_ONSCREEN = 2,
        MAKE_CURRENT = 3,
    }


    export namespace WinsysFeature {
        export const $gtype: GObject.GType<WinsysFeature>;
    }

    enum WinsysFeature {
        SWAP_REGION = 0,
        BUFFER_AGE = 1,
        SYNC_FD = 2,
        N_FEATURES = 3,
    }


    const AFIRST_BIT: number;

    const A_BIT: number;

    const BGR_BIT: number;

    const DEPTH_BIT: number;

    const MAX_EGL_CONFIG_ATTRIBS: number;

    const PIXEL_FORMAT_MAX_PLANES: number;

    const PREMULT_BIT: number;

    const STENCIL_BIT: number;

    const TEXTURE_MAX_WASTE: number;

    function can_blit_between_formats(src_format: PixelFormat, dst_format: PixelFormat): boolean;

    function check_extension(name: string, ext: string): boolean;

    function color_from_string(str: string): [boolean, Color];

    function color_init_from_hsl(hue: number, saturation: number, luminance: number): Color;

    function graphene_matrix_project_point(matrix: Graphene.Matrix, x: number, y: number, z: number, w: number): [number, number, number, number];

    function graphene_matrix_project_points_f3(matrix: Graphene.Matrix, stride_in: bigint | number, points_in: null, stride_out: bigint | number, points_out: null, n_points: number): void;

    function graphene_matrix_transform_points(matrix: Graphene.Matrix, n_components: number, stride_in: bigint | number, points_in: null, stride_out: bigint | number, points_out: null, n_points: number): void;

    function pixel_format_get_bytes_per_pixel(format: PixelFormat, plane: number): number;

    function pixel_format_get_n_planes(format: PixelFormat): number;

    function pixel_format_to_string(format: PixelFormat): string;

    function renderer_error_quark(): number;

    function scanout_error_quark(): GLib.Quark;

    function set_tracing_disabled_on_thread(data: null): void;

    function set_tracing_enabled_on_thread(data: null, group: string): void;

    function start_tracing_with_fd(fd: number): boolean;

    function start_tracing_with_path(filename: string): boolean;

    function stop_tracing(): void;

    function value_get_color(value: GObject.Value | any): Color;

    function value_set_color(value: GObject.Value | any, color: Color): void;

    interface AtlasUpdatePositionCallback {
        (user_data: null, new_texture: Texture, rect: Mtk.Rectangle): void;
    }

    interface FrameCallback {
        (onscreen: Onscreen, event: FrameEvent, info: FrameInfo): void;
    }

    interface PipelineLayerCallback {
        (pipeline: Pipeline, layer_index: number): boolean;
    }

    interface TextureForeachCallback {
        (sub_texture: Texture, sub_texture_coords: number, meta_coords: number): void;
    }

    enum AtlasFlags {
        CLEAR_TEXTURE = 1,
        DISABLE_MIGRATION = 2,
    }


    export namespace BufferAccess {
        export const $gtype: GObject.GType<BufferAccess>;
    }

    enum BufferAccess {
        READ = 1,
        WRITE = 2,
        READ_WRITE = 3,
    }


    export namespace BufferBit {
        export const $gtype: GObject.GType<BufferBit>;
    }

    enum BufferBit {
        COLOR = 1,
        DEPTH = 2,
        STENCIL = 4,
    }


    export namespace BufferMapHint {
        export const $gtype: GObject.GType<BufferMapHint>;
    }

    enum BufferMapHint {
        DISCARD = 1,
        DISCARD_RANGE = 2,
    }


    enum DisplayFeature {
        NONE = 0,
        RESET_NOTIFICATION = 1,
    }


    enum DrmModifierFilter {
        NONE = 0,
        SINGLE_PLANE = 1,
        NOT_EXTERNAL_ONLY = 2,
    }


    enum EGLWinsysFeature {
        SWAP_REGION = 1,
        EGL_IMAGE_FROM_WAYLAND_BUFFER = 4,
        CREATE_CONTEXT = 8,
        BUFFER_AGE = 16,
        FENCE_SYNC = 32,
        SURFACELESS_CONTEXT = 64,
        CONTEXT_PRIORITY = 128,
        NO_CONFIG_CONTEXT = 256,
        NATIVE_FENCE_SYNC = 512,
        CREATE_CONTEXT_ROBUSTNESS = 1024,
    }


    enum EglImageFlags {
        NONE = 0,
        NO_GET_DATA = 1,
    }


    export namespace ReadPixelsFlags {
        export const $gtype: GObject.GType<ReadPixelsFlags>;
    }

    enum ReadPixelsFlags {
        COLOR_BUFFER = 1,
    }


    namespace Atlas {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Atlas extends GObject.Object {
        static $gtype: GObject.GType<Atlas>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Atlas.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Atlas.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Atlas.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Atlas.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Atlas.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Atlas.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Atlas.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Atlas.SignalSignatures[K]>): void;

        // Methods
        reserve_space(width: number, height: number, user_data: null): boolean;
    }


    namespace AtlasTexture {
        // Signal signatures
        interface SignalSignatures extends Texture.SignalSignatures {
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::format": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::loader": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Texture.ConstructorProps {}
    }

    class AtlasTexture extends Texture {
        static $gtype: GObject.GType<AtlasTexture>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AtlasTexture.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AtlasTexture.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_from_bitmap(bmp: Bitmap): AtlasTexture;

        static new_with_size(ctx: Context, width: number, height: number): AtlasTexture;

        // Signals
        /** @signal */
        connect<K extends keyof AtlasTexture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AtlasTexture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AtlasTexture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AtlasTexture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AtlasTexture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AtlasTexture.SignalSignatures[K]>): void;
    }


    namespace Attribute {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Attribute extends GObject.Object {
        static $gtype: GObject.GType<Attribute>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Attribute.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Attribute.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](attribute_buffer: AttributeBuffer, name: string, stride: bigint | number, offset: bigint | number, components: number, type: AttributeType): Attribute;

        // Signals
        /** @signal */
        connect<K extends keyof Attribute.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Attribute.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Attribute.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Attribute.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Attribute.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Attribute.SignalSignatures[K]>): void;

        // Methods
        get_buffer(): AttributeBuffer;

        set_normalized(normalized: boolean): void;
    }


    namespace AttributeBuffer {
        // Signal signatures
        interface SignalSignatures extends Buffer.SignalSignatures {
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::default-target": (pspec: GObject.ParamSpec) => void;
            "notify::size": (pspec: GObject.ParamSpec) => void;
            "notify::update-hint": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Buffer.ConstructorProps {}
    }

    class AttributeBuffer extends Buffer {
        static $gtype: GObject.GType<AttributeBuffer>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: AttributeBuffer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<AttributeBuffer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](context: Context, data: Uint8Array | string): AttributeBuffer;

        static new_with_size(context: Context, bytes: bigint | number): AttributeBuffer;

        // Signals
        /** @signal */
        connect<K extends keyof AttributeBuffer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AttributeBuffer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof AttributeBuffer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, AttributeBuffer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof AttributeBuffer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<AttributeBuffer.SignalSignatures[K]>): void;
    }


    namespace Bitmap {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Bitmap extends GObject.Object {
        static $gtype: GObject.GType<Bitmap>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Bitmap.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Bitmap.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_for_data(context: Context, width: number, height: number, format: PixelFormat, rowstride: number, data: Uint8Array | string): Bitmap;

        static new_from_buffer(buffer: Buffer, format: PixelFormat, width: number, height: number, rowstride: number, offset: number): Bitmap;

        static new_with_malloc_buffer(context: Context, width: number, height: number, format: PixelFormat): Bitmap;

        static new_with_size(context: Context, width: number, height: number, format: PixelFormat): Bitmap;

        // Signals
        /** @signal */
        connect<K extends keyof Bitmap.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Bitmap.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Bitmap.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Bitmap.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Bitmap.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Bitmap.SignalSignatures[K]>): void;

        // Methods
        get_buffer(): PixelBuffer;

        get_format(): PixelFormat;

        get_height(): number;

        get_rowstride(): number;

        get_width(): number;

        map(access: BufferAccess, hints: BufferMapHint): number | null;

        unmap(): void;
    }


    namespace Buffer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::default-target": (pspec: GObject.ParamSpec) => void;
            "notify::size": (pspec: GObject.ParamSpec) => void;
            "notify::update-hint": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            context: Context;
            default_target: BufferBindTarget;
            defaultTarget: BufferBindTarget;
            size: bigint | number;
            update_hint: BufferUpdateHint;
            updateHint: BufferUpdateHint;
        }
    }

    abstract class Buffer extends GObject.Object {
        static $gtype: GObject.GType<Buffer>;

        // Properties
        set context(val: Context);

        set default_target(val: BufferBindTarget);

        set defaultTarget(val: BufferBindTarget);

        set size(val: bigint | number);

        set update_hint(val: BufferUpdateHint);

        set updateHint(val: BufferUpdateHint);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Buffer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Buffer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Buffer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Buffer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Buffer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Buffer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Buffer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Buffer.SignalSignatures[K]>): void;

        // Methods
        get_size(): number;

        get_update_hint(): BufferUpdateHint;

        map(access: BufferAccess, hints: BufferMapHint): null;

        map_range(offset: bigint | number, size: bigint | number, access: BufferAccess, hints: BufferMapHint): null;

        set_data(offset: bigint | number, data: Uint8Array | string, size: bigint | number): boolean;

    // Conflicted with GObject.Object.set_data
        set_data(...args: never[]): any;

        set_update_hint(hint: BufferUpdateHint): void;

        unmap(): void;
    }


    namespace Context {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::display": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            display: Display;
        }
    }

    abstract class Context extends GObject.Object {
        static $gtype: GObject.GType<Context>;

        // Properties
        get display(): Display;

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
        flush(): void;

        get_display(): Display;

        get_driver(): Driver;

        get_named_pipeline(key: PipelineKey): Pipeline;

        get_rectangle_indices(n_rectangles: number): Indices;

        get_renderer(): Renderer;

        has_winsys_feature(feature: WinsysFeature): boolean;

        is_defunct(): boolean;

        set_named_pipeline(key: PipelineKey, pipeline: Pipeline | null): void;

        set_winsys_feature(feature: WinsysFeature, value: boolean): void;
    }


    namespace ContextEGL {
        // Signal signatures
        interface SignalSignatures extends Context.SignalSignatures {
            "notify::display": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Context.ConstructorProps {}
    }

    class ContextEGL extends Context {
        static $gtype: GObject.GType<ContextEGL>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: ContextEGL.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<ContextEGL.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](display: Display): ContextEGL;

        // Signals
        /** @signal */
        connect<K extends keyof ContextEGL.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ContextEGL.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ContextEGL.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ContextEGL.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ContextEGL.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ContextEGL.SignalSignatures[K]>): void;
    }


    namespace Display {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::renderer": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            renderer: Renderer;
        }
    }

    abstract class Display extends GObject.Object {
        static $gtype: GObject.GType<Display>;

        // Properties
        get renderer(): Renderer;

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

        // Virtual methods
        vfunc_destroy(): void;

        vfunc_setup(features: DisplayFeature): boolean;

        // Methods
        destroy(): void;

        get_renderer(): Renderer;

        setup(features: DisplayFeature): boolean;
    }


    namespace DisplayEGL {
        // Signal signatures
        interface SignalSignatures extends Display.SignalSignatures {
            "notify::renderer": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Display.ConstructorProps {}
    }

    class DisplayEGL extends Display {
        static $gtype: GObject.GType<DisplayEGL>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DisplayEGL.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DisplayEGL.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](renderer: Renderer): DisplayEGL;

        // Signals
        /** @signal */
        connect<K extends keyof DisplayEGL.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DisplayEGL.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DisplayEGL.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DisplayEGL.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DisplayEGL.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DisplayEGL.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_cleanup_context(): void;

        vfunc_context_created(): boolean;
    }


    namespace Driver {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class Driver extends GObject.Object {
        static $gtype: GObject.GType<Driver>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Driver.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Driver.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Driver.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Driver.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Driver.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Driver.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Driver.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Driver.SignalSignatures[K]>): void;

        // Methods
        format_supports_upload(format: PixelFormat): boolean;

        get_graphics_reset_status(): GraphicsResetStatus;

        get_vendor(): string;

        has_feature(feature: FeatureID): boolean;

        set_feature(feature: FeatureID, value: boolean): void;
    }


    namespace DriverGL {
        // Signal signatures
        interface SignalSignatures extends Driver.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends Driver.ConstructorProps {}
    }

    class DriverGL extends Driver {
        static $gtype: GObject.GType<DriverGL>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: DriverGL.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<DriverGL.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof DriverGL.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DriverGL.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DriverGL.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DriverGL.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DriverGL.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DriverGL.SignalSignatures[K]>): void;

        // Methods
        get_gl_error(): number;

        get_gl_extensions(renderer: Renderer): string[];
    }


    namespace FrameInfo {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class FrameInfo extends GObject.Object {
        static $gtype: GObject.GType<FrameInfo>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FrameInfo.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FrameInfo.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FrameInfo.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FrameInfo.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FrameInfo.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FrameInfo.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FrameInfo.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FrameInfo.SignalSignatures[K]>): void;

        // Methods
        get_frame_counter(): number;

        get_global_frame_counter(): number;

        get_is_symbolic(): boolean;

        get_kms_ready_time_us(): number;

        get_onscreen(): Onscreen;

        get_presentation_time_us(): number;

        get_refresh_rate(): number;

        get_sequence(): number;

        get_view_frame_counter(): number;

        is_hw_clock(): boolean;

        is_vsync(): boolean;

        is_zero_copy(): boolean;
    }


    namespace Framebuffer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            destroy: () => void;
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::driver-config": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            context: Context;
            driver_config: never;
            driverConfig: never;
            height: number;
            width: number;
        }
    }

    abstract class Framebuffer extends GObject.Object {
        static $gtype: GObject.GType<Framebuffer>;

        // Properties
        get context(): Context;

        get driver_config(): null;

        get driverConfig(): null;

        get height(): number;
        set height(val: number);

        get width(): number;
        set width(val: number);

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Framebuffer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Framebuffer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Framebuffer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Framebuffer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Framebuffer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Framebuffer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Framebuffer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Framebuffer.SignalSignatures[K]>): void;

        // Static methods
        static error_quark(): number;

        // Virtual methods
        vfunc_allocate(): boolean;

        vfunc_is_y_flipped(): boolean;

        // Methods
        allocate(): boolean;

        bind_renderbuffers(renderbuffers: Renderbuffers): void;

        blit(dst: Framebuffer, src_x: number, src_y: number, dst_x: number, dst_y: number, width: number, height: number): boolean;

        blit_region(dst: Framebuffer, src_region: Mtk.Region, dst_x_offset: number, dst_y_offset: number): boolean;

        clear(buffers: bigint | number, color: Color): void;

        clear4f(buffers: bigint | number, red: number, green: number, blue: number, alpha: number): void;

        discard_buffers(buffers: bigint | number): void;

        draw_multitextured_rectangle(pipeline: Pipeline, x_1: number, y_1: number, x_2: number, y_2: number, tex_coords: number[], tex_coords_len: number): void;

        draw_rectangle(pipeline: Pipeline, x_1: number, y_1: number, x_2: number, y_2: number): void;

        draw_rectangles(pipeline: Pipeline, coordinates: number[], n_rectangles: number): void;

        draw_textured_rectangle(pipeline: Pipeline, x_1: number, y_1: number, x_2: number, y_2: number, s_1: number, t_1: number, s_2: number, t_2: number): void;

        draw_textured_rectangles(pipeline: Pipeline, coordinates: number[], n_rectangles: number): void;

        finish(): void;

        flush(): void;

        frustum(left: number, right: number, bottom: number, top: number, z_near: number, z_far: number): void;

        get_alpha_bits(): number;

        get_blue_bits(): number;

        get_context(): Context;

        get_depth_write_enabled(): boolean;

        get_dither_enabled(): boolean;

        get_green_bits(): number;

        get_height(): number;

        get_modelview_matrix(): Graphene.Matrix;

        get_projection_matrix(): Graphene.Matrix;

        get_red_bits(): number;

        get_viewport4fv(): number[];

        get_viewport_height(): number;

        get_viewport_width(): number;

        get_viewport_x(): number;

        get_viewport_y(): number;

        get_width(): number;

        orthographic(x_1: number, y_1: number, x_2: number, y_2: number, near: number, far: number): void;

        peek_renderbuffers(): Renderbuffers;

        perspective(fov_y: number, aspect: number, z_near: number, z_far: number): void;

        pop_clip(): void;

        pop_matrix(): void;

        push_matrix(): void;

        push_rectangle_clip(x_1: number, y_1: number, x_2: number, y_2: number): void;

        push_region_clip(region: Mtk.Region): void;

        read_pixels(x: number, y: number, width: number, height: number, format: PixelFormat, pixels: number): boolean;

        read_pixels_into_bitmap(x: number, y: number, source: ReadPixelsFlags, bitmap: Bitmap): boolean;

        rotate(angle: number, x: number, y: number, z: number): void;

        scale(x: number, y: number, z: number): void;

        set_depth_write_enabled(depth_write_enabled: boolean): void;

        set_dither_enabled(dither_enabled: boolean): void;

        set_modelview_matrix(matrix: Graphene.Matrix): void;

        set_projection_matrix(matrix: Graphene.Matrix): void;

        set_viewport(x: number, y: number, width: number, height: number): void;

        transform(matrix: Graphene.Matrix): void;

        translate(x: number, y: number, z: number): void;
    }


    namespace IndexBuffer {
        // Signal signatures
        interface SignalSignatures extends Buffer.SignalSignatures {
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::default-target": (pspec: GObject.ParamSpec) => void;
            "notify::size": (pspec: GObject.ParamSpec) => void;
            "notify::update-hint": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Buffer.ConstructorProps {}
    }

    class IndexBuffer extends Buffer {
        static $gtype: GObject.GType<IndexBuffer>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: IndexBuffer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<IndexBuffer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](context: Context, bytes: bigint | number): IndexBuffer;

        // Signals
        /** @signal */
        connect<K extends keyof IndexBuffer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IndexBuffer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof IndexBuffer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IndexBuffer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof IndexBuffer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<IndexBuffer.SignalSignatures[K]>): void;
    }


    namespace Indices {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Indices extends GObject.Object {
        static $gtype: GObject.GType<Indices>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Indices.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Indices.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](context: Context, type: IndicesType, indices_data: null, n_indices: number): Indices;

        // Signals
        /** @signal */
        connect<K extends keyof Indices.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Indices.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Indices.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Indices.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Indices.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Indices.SignalSignatures[K]>): void;

        // Methods
        get_buffer(): IndexBuffer;

        get_indices_type(): IndicesType;
    }


    namespace MatrixStack {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class MatrixStack extends GObject.Object {
        static $gtype: GObject.GType<MatrixStack>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: MatrixStack.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<MatrixStack.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](ctx: Context): MatrixStack;

        // Signals
        /** @signal */
        connect<K extends keyof MatrixStack.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MatrixStack.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MatrixStack.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MatrixStack.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MatrixStack.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MatrixStack.SignalSignatures[K]>): void;

        // Methods
        frustum(left: number, right: number, bottom: number, top: number, z_near: number, z_far: number): void;

        get(): [Graphene.Matrix, Graphene.Matrix];

        get_entry(): MatrixEntry;

        load_identity(): void;

        multiply(matrix: Graphene.Matrix): void;

        pop(): void;

        push(): void;

        rotate(angle: number, x: number, y: number, z: number): void;

        rotate_euler(euler: Graphene.Euler): void;

        scale(x: number, y: number, z: number): void;

        set(matrix: Graphene.Matrix): void;

    // Conflicted with GObject.Object.set
        set(...args: never[]): any;

        translate(x: number, y: number, z: number): void;
    }


    namespace Offscreen {
        // Signal signatures
        interface SignalSignatures extends Framebuffer.SignalSignatures {
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::driver-config": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Framebuffer.ConstructorProps {}
    }

    class Offscreen extends Framebuffer {
        static $gtype: GObject.GType<Offscreen>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Offscreen.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Offscreen.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_from_formats(context: Context, formats: PixelFormat, n_formats: bigint | number, width: number, height: number): Offscreen;

        static new_with_texture(texture: Texture): Offscreen;

        // Signals
        /** @signal */
        connect<K extends keyof Offscreen.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Offscreen.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Offscreen.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Offscreen.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Offscreen.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Offscreen.SignalSignatures[K]>): void;

        // Methods
        get_texture(): Texture;
    }


    namespace Onscreen {
        // Signal signatures
        interface SignalSignatures extends Framebuffer.SignalSignatures {
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::driver-config": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Framebuffer.ConstructorProps {}
    }

    class Onscreen extends Framebuffer {
        static $gtype: GObject.GType<Onscreen>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Onscreen.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Onscreen.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Onscreen.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Onscreen.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Onscreen.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Onscreen.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Onscreen.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Onscreen.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_bind(): void;

        vfunc_direct_scanout(scanout: Scanout, info: FrameInfo): boolean;

        vfunc_get_buffer_age(): number;

        vfunc_get_window_handles(device_out: null, window_out: null): boolean;

        vfunc_queue_damage_region(region: Mtk.Region): void;

        vfunc_swap_buffers_with_damage(region: Mtk.Region, info: FrameInfo): boolean;

        vfunc_swap_region(region: Mtk.Region, info: FrameInfo): boolean;

        // Methods
        add_frame_callback(callback: FrameCallback): FrameClosure;

        direct_scanout(scanout: Scanout, info: FrameInfo, user_data: null): boolean;

        get_buffer_age(): number;

        get_frame_counter(): number;

        get_window_handles(device_out: null, window_out: null): boolean;

        queue_damage_region(region: Mtk.Region): void;

        remove_frame_callback(closure: FrameClosure): void;

        swap_buffers_with_damage(region: Mtk.Region, info: FrameInfo, user_data: null): void;

        swap_region(region: Mtk.Region, info: FrameInfo, user_data: null): void;
    }


    namespace OnscreenEgl {
        // Signal signatures
        interface SignalSignatures extends Onscreen.SignalSignatures {
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::driver-config": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Onscreen.ConstructorProps {}
    }

    class OnscreenEgl extends Onscreen {
        static $gtype: GObject.GType<OnscreenEgl>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: OnscreenEgl.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<OnscreenEgl.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof OnscreenEgl.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, OnscreenEgl.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof OnscreenEgl.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, OnscreenEgl.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof OnscreenEgl.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<OnscreenEgl.SignalSignatures[K]>): void;
    }


    namespace Pipeline {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Pipeline extends GObject.Object {
        static $gtype: GObject.GType<Pipeline>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Pipeline.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Pipeline.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](context: Context): Pipeline;

        // Signals
        /** @signal */
        connect<K extends keyof Pipeline.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Pipeline.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Pipeline.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Pipeline.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Pipeline.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Pipeline.SignalSignatures[K]>): void;

        // Methods
        add_capability(domain: GLib.Quark, capability: number): void;

        add_layer_snippet(layer: number, snippet: Snippet): void;

        add_snippet(snippet: Snippet): void;

        copy(): Pipeline;

        foreach_layer(callback: PipelineLayerCallback): void;

        get_alpha_test_function(): PipelineAlphaFunc;

        get_alpha_test_reference(): number;

        get_color(): Color;

        get_context(): Context;

        get_cull_face_mode(): PipelineCullFaceMode;

        get_depth_state(): DepthState;

        get_front_face_winding(): Winding;

        get_layer_filters(layer_index: number): [PipelineFilter, PipelineFilter];

        get_layer_point_sprite_coords_enabled(layer_index: number): boolean;

        get_layer_texture(layer_index: number): Texture;

        get_layer_wrap_mode_s(layer_index: number): PipelineWrapMode;

        get_layer_wrap_mode_t(layer_index: number): PipelineWrapMode;

        get_n_layers(): number;

        get_name(): string;

        get_per_vertex_point_size(): boolean;

        get_point_size(): number;

        get_uniform_location(uniform_name: string): number;

        has_capability(domain: GLib.Quark, capability: number): boolean;

        remove_layer(layer_index: number): void;

        set_alpha_test_function(alpha_func: PipelineAlphaFunc, alpha_reference: number): void;

        set_blend(blend_string: string): boolean;

        set_blend_constant(constant_color: Color): void;

        set_color(color: Color): void;

        set_cull_face_mode(cull_face_mode: PipelineCullFaceMode): void;

        set_depth_state(state: DepthState): boolean;

        set_front_face_winding(front_winding: Winding): void;

        set_layer_combine(layer_index: number, blend_string: string): boolean;

        set_layer_combine_constant(layer_index: number, constant: Color): void;

        set_layer_filters(layer_index: number, min_filter: PipelineFilter, mag_filter: PipelineFilter): void;

        set_layer_matrix(layer_index: number, matrix: Graphene.Matrix): void;

        set_layer_max_mipmap_level(layer: number, max_level: number): void;

        set_layer_null_texture(layer_index: number): void;

        set_layer_point_sprite_coords_enabled(layer_index: number, enable: boolean): boolean;

        set_layer_texture(layer_index: number, texture: Texture): void;

        set_layer_wrap_mode(layer_index: number, mode: PipelineWrapMode): void;

        set_layer_wrap_mode_s(layer_index: number, mode: PipelineWrapMode): void;

        set_layer_wrap_mode_t(layer_index: number, mode: PipelineWrapMode): void;

        set_per_vertex_point_size(enable: boolean): boolean;

        set_point_size(point_size: number): void;

        set_static_name(name: string): void;

        set_uniform_1f(uniform_location: number, value: number): void;

        set_uniform_1i(uniform_location: number, value: number): void;

        set_uniform_float(uniform_location: number, n_components: number, count: number, value: number[]): void;

        set_uniform_int(uniform_location: number, n_components: number, count: number, value: number[]): void;

        set_uniform_matrix(uniform_location: number, dimensions: number, count: number, transpose: boolean, value: number[]): void;
    }


    namespace PixelBuffer {
        // Signal signatures
        interface SignalSignatures extends Buffer.SignalSignatures {
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::default-target": (pspec: GObject.ParamSpec) => void;
            "notify::size": (pspec: GObject.ParamSpec) => void;
            "notify::update-hint": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Buffer.ConstructorProps {}
    }

    class PixelBuffer extends Buffer {
        static $gtype: GObject.GType<PixelBuffer>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: PixelBuffer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<PixelBuffer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](context: Context, data: Uint8Array | string): PixelBuffer;

        // Signals
        /** @signal */
        connect<K extends keyof PixelBuffer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PixelBuffer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PixelBuffer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PixelBuffer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PixelBuffer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PixelBuffer.SignalSignatures[K]>): void;
    }


    namespace Primitive {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Primitive extends GObject.Object {
        static $gtype: GObject.GType<Primitive>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Primitive.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Primitive.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_p2(context: Context, mode: VerticesMode, data: VertexP2[]): Primitive;

        static new_p2c4(context: Context, mode: VerticesMode, data: VertexP2C4[]): Primitive;

        static new_p2t2(context: Context, mode: VerticesMode, data: VertexP2T2[]): Primitive;

        static new_p3(context: Context, mode: VerticesMode, data: VertexP3[]): Primitive;

        static new_p3t2(context: Context, mode: VerticesMode, data: VertexP3T2[]): Primitive;

        static new_with_attributes(mode: VerticesMode, n_vertices: number, attributes: Attribute[]): Primitive;

        // Signals
        /** @signal */
        connect<K extends keyof Primitive.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Primitive.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Primitive.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Primitive.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Primitive.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Primitive.SignalSignatures[K]>): void;

        // Methods
        draw(framebuffer: Framebuffer, pipeline: Pipeline): void;

        set_first_vertex(first_vertex: number): void;

        set_indices(indices: Indices[]): void;

        set_n_vertices(n_vertices: number): void;
    }


    namespace Renderer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::driver": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            driver: Driver;
        }
    }

    abstract class Renderer extends GObject.Object {
        static $gtype: GObject.GType<Renderer>;

        // Properties
        get driver(): Driver;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Renderer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Renderer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Renderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Renderer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Renderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Renderer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Renderer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Renderer.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_bind_api(): void;

        vfunc_connect(): boolean;

        vfunc_get_implicit_drm_modifier(): bigint | number;

        vfunc_get_sync_fd(): number;

        vfunc_is_dma_buf_supported(): boolean;

        vfunc_is_hardware_accelerated(): boolean;

        vfunc_load_driver(driver_id: DriverId): boolean;

        vfunc_update_sync(): void;

        // Methods
        bind_api(): void;

        connect(): boolean;

        connect(...args: never[]): any;

        get_driver_id(): DriverId;

        get_implicit_drm_modifier(): number;

        get_latest_sync_fd(): number;

        get_proc_address(name: string): null;

        is_dma_buf_supported(): boolean;

        is_hardware_accelerated(): boolean;

        is_implicit_drm_modifier(modifier: bigint | number): boolean;
    }


    namespace RendererEGL {
        // Signal signatures
        interface SignalSignatures extends Renderer.SignalSignatures {
            "notify::driver": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Renderer.ConstructorProps {}
    }

    class RendererEGL extends Renderer {
        static $gtype: GObject.GType<RendererEGL>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: RendererEGL.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<RendererEGL.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): RendererEGL;

        // Signals
        /** @signal */
        connect_after<K extends keyof RendererEGL.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RendererEGL.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof RendererEGL.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<RendererEGL.SignalSignatures[K]>): void;

        // Methods
        has_feature(feature: EGLWinsysFeature): boolean;

        has_set_damage_region(): boolean;

        has_swap_buffers_with_damage(): boolean;
    }


    namespace Scanout {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            /** @signal */
            "scanout-failed": (object: Onscreen) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Scanout extends GObject.Object {
        static $gtype: GObject.GType<Scanout>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Scanout.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Scanout.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](scanout_buffer: ScanoutBuffer, dst_rect: Mtk.Rectangle): Scanout;

        // Signals
        /** @signal */
        connect<K extends keyof Scanout.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Scanout.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Scanout.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Scanout.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Scanout.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Scanout.SignalSignatures[K]>): void;

        // Methods
        copy_to_framebuffer(framebuffer: Framebuffer): boolean;

        get_buffer(): ScanoutBuffer;

        get_dst_rect(dst_rect: Mtk.Rectangle): void;

        get_src_rect(rect: Graphene.Rect): void;

        notify_failed(onscreen: Onscreen): void;

        set_src_rect(rect: Graphene.Rect): void;
    }


    namespace Snippet {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Snippet extends GObject.Object {
        static $gtype: GObject.GType<Snippet>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Snippet.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Snippet.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](hook: SnippetHook, declarations: string | null, post: string | null): Snippet;

        // Signals
        /** @signal */
        connect<K extends keyof Snippet.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Snippet.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Snippet.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Snippet.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Snippet.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Snippet.SignalSignatures[K]>): void;

        // Methods
        get_capability(): [boolean, GLib.Quark, number];

        get_declarations(): string;

        get_hook(): SnippetHook;

        get_post(): string;

        get_pre(): string;

        get_replace(): string;

        set_capability(domain: GLib.Quark, capability: number): void;

        set_declarations(declarations: string): void;

        set_post(post: string): void;

        set_pre(pre: string): void;

        set_replace(replace: string): void;
    }


    namespace SubTexture {
        // Signal signatures
        interface SignalSignatures extends Texture.SignalSignatures {
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::format": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::loader": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Texture.ConstructorProps {}
    }

    class SubTexture extends Texture {
        static $gtype: GObject.GType<SubTexture>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: SubTexture.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<SubTexture.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](ctx: Context, parent_texture: Texture, sub_x: number, sub_y: number, sub_width: number, sub_height: number): SubTexture;

        // Signals
        /** @signal */
        connect<K extends keyof SubTexture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SubTexture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SubTexture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SubTexture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SubTexture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SubTexture.SignalSignatures[K]>): void;
    }


    namespace Texture {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::format": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::loader": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            context: Context;
            format: PixelFormat;
            height: number;
            loader: never;
            width: number;
        }
    }

    abstract class Texture extends GObject.Object {
        static $gtype: GObject.GType<Texture>;

        // Properties
        set context(val: Context);

        set format(val: PixelFormat);

        set height(val: number);

        set loader(val: never);

        set width(val: number);

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

        // Signals
        /** @signal */
        connect<K extends keyof Texture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Texture.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Texture.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Texture.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Texture.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Texture.SignalSignatures[K]>): void;

        // Static methods
        static error_quark(): number;

        // Methods
        allocate(): boolean;

        foreach_in_region(tx_1: number, ty_1: number, tx_2: number, ty_2: number, wrap_s: PipelineWrapMode, wrap_t: PipelineWrapMode, callback: TextureForeachCallback): void;

        get_components(): TextureComponents;

        get_context(): Context;

        get_data(format: PixelFormat, rowstride: number, data: Uint8Array | string | null): number;

    // Conflicted with GObject.Object.get_data
        get_data(...args: never[]): any;

        get_format(): PixelFormat;

        get_gl_texture(): [boolean, number, number];

        get_height(): number;

        get_premultiplied(): boolean;

        get_width(): number;

        is_get_data_supported(): boolean;

        is_sliced(): boolean;

        set_components(components: TextureComponents): void;

        set_data(format: PixelFormat, rowstride: number, data: Uint8Array | string, level: number): boolean;

    // Conflicted with GObject.Object.set_data
        set_data(...args: never[]): any;

        set_premultiplied(premultiplied: boolean): void;

        set_region(src_x: number, src_y: number, dst_x: number, dst_y: number, dst_width: number, dst_height: number, width: number, height: number, format: PixelFormat, rowstride: number, data: Uint8Array | string): boolean;

        set_region_from_bitmap(src_x: number, src_y: number, dst_x: number, dst_y: number, dst_width: number, dst_height: number, bitmap: Bitmap): boolean;
    }


    namespace Texture2D {
        // Signal signatures
        interface SignalSignatures extends Texture.SignalSignatures {
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::format": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::loader": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Texture.ConstructorProps {}
    }

    abstract class Texture2D extends Texture {
        static $gtype: GObject.GType<Texture2D>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Texture2D.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Texture2D.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_from_bitmap(bitmap: Bitmap): Texture2D;

        static new_from_data(ctx: Context, width: number, height: number, format: PixelFormat, rowstride: number, data: Uint8Array | string): Texture2D;

        static new_with_format(ctx: Context, width: number, height: number, format: PixelFormat): Texture2D;

        static new_with_size(ctx: Context, width: number, height: number): Texture2D;

        // Signals
        /** @signal */
        connect<K extends keyof Texture2D.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Texture2D.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Texture2D.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Texture2D.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Texture2D.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Texture2D.SignalSignatures[K]>): void;

        // Methods
        set_auto_mipmap(value: boolean): void;
    }


    namespace Texture2DSliced {
        // Signal signatures
        interface SignalSignatures extends Texture.SignalSignatures {
            "notify::context": (pspec: GObject.ParamSpec) => void;
            "notify::format": (pspec: GObject.ParamSpec) => void;
            "notify::height": (pspec: GObject.ParamSpec) => void;
            "notify::loader": (pspec: GObject.ParamSpec) => void;
            "notify::width": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Texture.ConstructorProps {}
    }

    class Texture2DSliced extends Texture {
        static $gtype: GObject.GType<Texture2DSliced>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Texture2DSliced.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Texture2DSliced.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_from_bitmap(bmp: Bitmap, max_waste: number): Texture2DSliced;

        static new_with_size(ctx: Context, width: number, height: number, max_waste: number): Texture2DSliced;

        // Signals
        /** @signal */
        connect<K extends keyof Texture2DSliced.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Texture2DSliced.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Texture2DSliced.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Texture2DSliced.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Texture2DSliced.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Texture2DSliced.SignalSignatures[K]>): void;
    }


    type AtlasClass = typeof Atlas;

    type AtlasTextureClass = typeof AtlasTexture;

    type AttributeBufferClass = typeof AttributeBuffer;

    type AttributeClass = typeof Attribute;

    type BitmapClass = typeof Bitmap;

    type BufferClass = typeof Buffer;

    class Color {
        static $gtype: GObject.GType<Color>;

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

        // Static methods
        static from_string(str: string): [boolean, Color];

        static init_from_hsl(hue: number, saturation: number, luminance: number): Color;

        // Methods
        copy(): Color;

        equal(v2: Color): boolean;

        free(): void;

        get_alpha(): number;

        get_blue(): number;

        get_green(): number;

        get_red(): number;

        hash(): number;

        init_from_4f(red: number, green: number, blue: number, alpha: number): void;

        premultiply(): void;

        to_hsl(): [number, number, number];

        to_string(): string;
    }


    type ContextClass = typeof Context;

    type ContextEGLClass = typeof ContextEGL;

    class DepthState {
        static $gtype: GObject.GType<DepthState>;

        // Methods
        init(): void;

        set_range(near_val: number, far_val: number): void;

        set_test_enabled(enable: boolean): void;

        set_test_function(_function: DepthTestFunction): void;

        set_write_enabled(enable: boolean): void;
    }


    type DisplayClass = typeof Display;

    type DisplayEGLClass = typeof DisplayEGL;

    abstract class DmaBufHandle {
        static $gtype: GObject.GType<DmaBufHandle>;

        // Methods
        free(): void;

        get_bpp(): number;

        get_fd(plane: number): number;

        get_framebuffer(): Framebuffer;

        get_height(): number;

        get_modifier(): number;

        get_n_planes(): number;

        get_offset(plane: number): number;

        get_stride(plane: number): number;

        get_width(): number;

        mmap(): null;

        munmap(data: null): boolean;

        sync_read_end(): boolean;

        sync_read_start(): boolean;
    }


    type DriverClass = typeof Driver;

    type DriverGLClass = typeof DriverGL;

    abstract class DriverGLPrivate {
        static $gtype: GObject.GType<DriverGLPrivate>;
    }


    abstract class FrameClosure {
        static $gtype: GObject.GType<FrameClosure>;
    }


    type FrameInfoClass = typeof FrameInfo;

    type FramebufferClass = typeof Framebuffer;

    type IndexBufferClass = typeof IndexBuffer;

    type IndicesClass = typeof Indices;

    abstract class MatrixEntry {
        static $gtype: GObject.GType<MatrixEntry>;

        // Methods
        calculate_translation(entry1: MatrixEntry): [boolean, number, number, number];

        get(): [Graphene.Matrix, Graphene.Matrix];

        is_identity(): boolean;

        ref(): MatrixEntry;

        unref(): void;
    }


    type MatrixStackClass = typeof MatrixStack;

    type OffscreenClass = typeof Offscreen;

    type OnscreenClass = typeof Onscreen;

    type OnscreenEglClass = typeof OnscreenEgl;

    type PipelineClass = typeof Pipeline;

    type PixelBufferClass = typeof PixelBuffer;

    type PrimitiveClass = typeof Primitive;

    abstract class Renderbuffers {
        static $gtype: GObject.GType<Renderbuffers>;
    }


    type RendererClass = typeof Renderer;

    type RendererEGLClass = typeof RendererEGL;

    type ScanoutBufferInterface = typeof ScanoutBuffer;

    type ScanoutClass = typeof Scanout;

    type SnippetClass = typeof Snippet;

    type SubTextureClass = typeof SubTexture;

    type Texture2DClass = typeof Texture2D;

    type Texture2DSlicedClass = typeof Texture2DSliced;

    type TextureClass = typeof Texture;

    class VertexP2 {
        static $gtype: GObject.GType<VertexP2>;

        // Fields
        x: number;

        y: number;

        // Constructors

        constructor(properties?: Partial<{
            x: number;
            y: number;
        }>);
    }


    class VertexP2C4 {
        static $gtype: GObject.GType<VertexP2C4>;

        // Fields
        x: number;

        y: number;

        r: number;

        g: number;

        b: number;

        a: number;

        // Constructors

        constructor(properties?: Partial<{
            x: number;
            y: number;
            r: number;
            g: number;
            b: number;
            a: number;
        }>);
    }


    class VertexP2T2 {
        static $gtype: GObject.GType<VertexP2T2>;

        // Fields
        x: number;

        y: number;

        s: number;

        t: number;

        // Constructors

        constructor(properties?: Partial<{
            x: number;
            y: number;
            s: number;
            t: number;
        }>);
    }


    class VertexP3 {
        static $gtype: GObject.GType<VertexP3>;

        // Fields
        x: number;

        y: number;

        z: number;

        // Constructors

        constructor(properties?: Partial<{
            x: number;
            y: number;
            z: number;
        }>);
    }


    class VertexP3T2 {
        static $gtype: GObject.GType<VertexP3T2>;

        // Fields
        x: number;

        y: number;

        z: number;

        s: number;

        t: number;

        // Constructors

        constructor(properties?: Partial<{
            x: number;
            y: number;
            z: number;
            s: number;
            t: number;
        }>);
    }


    namespace ScanoutBuffer {
        /**
         * Interface for implementing ScanoutBuffer.
         * Contains only the virtual methods that need to be implemented.
         */
        interface Interface {

            // Virtual methods
            vfunc_get_height(): number;

            vfunc_get_width(): number;
        }


        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    export interface ScanoutBufferNamespace {
        $gtype: GObject.GType<ScanoutBuffer>;
        prototype: ScanoutBuffer;
    }
    interface ScanoutBuffer extends GObject.Object, ScanoutBuffer.Interface {

        // Methods
        get_height(): number;

        get_width(): number;
    }


    export const ScanoutBuffer: ScanoutBufferNamespace & {
        new (): ScanoutBuffer; // This allows `obj instanceof ScanoutBuffer`
    };

    type PipelineKey = string;

    const __name__: string;

    const __version__: string;
}

export default Cogl;

}

declare module 'gi://Cogl' {
    import Cogl51 from 'gi://Cogl?version=51';
    export default Cogl51;
}
// END
