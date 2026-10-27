/// <reference path="./graphene-1.0.d.ts" />
/// <reference path="./gobject-2.0.d.ts" />
/// <reference path="./glib-2.0.d.ts" />
/// <reference path="./gdk-4.0.d.ts" />
/// <reference path="./cairo-1.0.d.ts" />
/// <reference path="./cairo.d.ts" />
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

declare module 'gi://Gsk?version=4.0' {

// Module dependencies
import type Graphene from 'gi://Graphene?version=1.0';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type Gdk from 'gi://Gdk?version=4.0';
import type cairo from 'cairo';
import type PangoCairo from 'gi://PangoCairo?version=1.0';
import type Pango from 'gi://Pango?version=1.0';
import type HarfBuzz from 'gi://HarfBuzz?version=0.0';
import type freetype2 from 'gi://freetype2?version=2.0';
import type Gio from 'gi://Gio?version=2.0';
import type GModule from 'gi://GModule?version=2.0';
import type GdkPixbuf from 'gi://GdkPixbuf?version=2.0';

export namespace Gsk {

    /**
     * Gsk-4.0
     */


    export namespace BlendMode {
        export const $gtype: GObject.GType<BlendMode>;
    }

    enum BlendMode {
        DEFAULT = 0,
        MULTIPLY = 1,
        SCREEN = 2,
        OVERLAY = 3,
        DARKEN = 4,
        LIGHTEN = 5,
        COLOR_DODGE = 6,
        COLOR_BURN = 7,
        HARD_LIGHT = 8,
        SOFT_LIGHT = 9,
        DIFFERENCE = 10,
        EXCLUSION = 11,
        COLOR = 12,
        HUE = 13,
        SATURATION = 14,
        LUMINOSITY = 15,
    }


    export namespace Corner {
        export const $gtype: GObject.GType<Corner>;
    }

    enum Corner {
        TOP_LEFT = 0,
        TOP_RIGHT = 1,
        BOTTOM_RIGHT = 2,
        BOTTOM_LEFT = 3,
    }


    export namespace FillRule {
        export const $gtype: GObject.GType<FillRule>;
    }

    enum FillRule {
        WINDING = 0,
        EVEN_ODD = 1,
    }


    export namespace GLUniformType {
        export const $gtype: GObject.GType<GLUniformType>;
    }

    enum GLUniformType {
        NONE = 0,
        FLOAT = 1,
        INT = 2,
        UINT = 3,
        BOOL = 4,
        VEC2 = 5,
        VEC3 = 6,
        VEC4 = 7,
    }


    export namespace LineCap {
        export const $gtype: GObject.GType<LineCap>;
    }

    enum LineCap {
        BUTT = 0,
        ROUND = 1,
        SQUARE = 2,
    }


    export namespace LineJoin {
        export const $gtype: GObject.GType<LineJoin>;
    }

    enum LineJoin {
        MITER = 0,
        ROUND = 1,
        BEVEL = 2,
    }


    export namespace MaskMode {
        export const $gtype: GObject.GType<MaskMode>;
    }

    enum MaskMode {
        ALPHA = 0,
        INVERTED_ALPHA = 1,
        LUMINANCE = 2,
        INVERTED_LUMINANCE = 3,
    }


    export namespace PathDirection {
        export const $gtype: GObject.GType<PathDirection>;
    }

    enum PathDirection {
        FROM_START = 0,
        TO_START = 1,
        TO_END = 2,
        FROM_END = 3,
    }


    export namespace PathIntersection {
        export const $gtype: GObject.GType<PathIntersection>;
    }

    enum PathIntersection {
        NONE = 0,
        NORMAL = 1,
        START = 2,
        END = 3,
    }


    export namespace PathOperation {
        export const $gtype: GObject.GType<PathOperation>;
    }

    enum PathOperation {
        MOVE = 0,
        CLOSE = 1,
        LINE = 2,
        QUAD = 3,
        CUBIC = 4,
        CONIC = 5,
    }


    export namespace PorterDuff {
        export const $gtype: GObject.GType<PorterDuff>;
    }

    enum PorterDuff {
        SOURCE = 0,
        DEST = 1,
        SOURCE_OVER_DEST = 2,
        DEST_OVER_SOURCE = 3,
        SOURCE_IN_DEST = 4,
        DEST_IN_SOURCE = 5,
        SOURCE_OUT_DEST = 6,
        DEST_OUT_SOURCE = 7,
        SOURCE_ATOP_DEST = 8,
        DEST_ATOP_SOURCE = 9,
        XOR = 10,
        CLEAR = 11,
    }


    export namespace RenderNodeType {
        export const $gtype: GObject.GType<RenderNodeType>;
    }

    enum RenderNodeType {
        NOT_A_RENDER_NODE = 0,
        CONTAINER_NODE = 1,
        CAIRO_NODE = 2,
        COLOR_NODE = 3,
        LINEAR_GRADIENT_NODE = 4,
        REPEATING_LINEAR_GRADIENT_NODE = 5,
        RADIAL_GRADIENT_NODE = 6,
        REPEATING_RADIAL_GRADIENT_NODE = 7,
        CONIC_GRADIENT_NODE = 8,
        BORDER_NODE = 9,
        TEXTURE_NODE = 10,
        INSET_SHADOW_NODE = 11,
        OUTSET_SHADOW_NODE = 12,
        TRANSFORM_NODE = 13,
        OPACITY_NODE = 14,
        COLOR_MATRIX_NODE = 15,
        REPEAT_NODE = 16,
        CLIP_NODE = 17,
        ROUNDED_CLIP_NODE = 18,
        SHADOW_NODE = 19,
        BLEND_NODE = 20,
        CROSS_FADE_NODE = 21,
        TEXT_NODE = 22,
        BLUR_NODE = 23,
        DEBUG_NODE = 24,
        GL_SHADER_NODE = 25,
        TEXTURE_SCALE_NODE = 26,
        MASK_NODE = 27,
        FILL_NODE = 28,
        STROKE_NODE = 29,
        SUBSURFACE_NODE = 30,
        COMPONENT_TRANSFER_NODE = 31,
        COPY_NODE = 32,
        PASTE_NODE = 33,
        COMPOSITE_NODE = 34,
        ISOLATION_NODE = 35,
        DISPLACEMENT_NODE = 36,
        ARITHMETIC_NODE = 37,
        TURBULENCE_NODE = 38,
    }


    export namespace ScalingFilter {
        export const $gtype: GObject.GType<ScalingFilter>;
    }

    enum ScalingFilter {
        LINEAR = 0,
        NEAREST = 1,
        TRILINEAR = 2,
    }


    class SerializationError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static UNSUPPORTED_FORMAT: number;

        static UNSUPPORTED_VERSION: number;

        static INVALID_DATA: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
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


    export namespace SnapDirection {
        export const $gtype: GObject.GType<SnapDirection>;
    }

    enum SnapDirection {
        NONE = 0,
        FLOOR = 1,
        CEIL = 2,
        ROUND = 3,
    }


    export namespace TransformCategory {
        export const $gtype: GObject.GType<TransformCategory>;
    }

    enum TransformCategory {
        UNKNOWN = 0,
        ANY = 1,
        "3D" = 2,
        "2D" = 3,
        "2D_AFFINE" = 4,
        "2D_TRANSLATE" = 5,
        IDENTITY = 6,
    }


    const RECT_SNAP_GROW: number;

    const RECT_SNAP_NONE: number;

    const RECT_SNAP_ROUND: number;

    const RECT_SNAP_SHRINK: number;

    function component_transfer_equal(self: never, other: never): boolean;

    function path_parse(string: string): Path | null;

    function rect_snap_get_direction(snap: RectSnap, side: Side): SnapDirection;

    function rect_snap_new(top: SnapDirection, right: SnapDirection, bottom: SnapDirection, left: SnapDirection): RectSnap;

    function serialization_error_quark(): GLib.Quark;

    function stroke_equal(stroke1: null, stroke2: null): boolean;

    function transform_parse(string: string): [boolean, Transform];

    function value_dup_render_node(value: GObject.Value | any): RenderNode | null;

    function value_get_render_node(value: GObject.Value | any): RenderNode | null;

    function value_set_render_node(value: GObject.Value | any, node: RenderNode): void;

    function value_take_render_node(value: GObject.Value | any, node: RenderNode | null): void;

    interface ParseErrorFunc {
        (start: ParseLocation, end: ParseLocation, error: GLib.Error): void;
    }

    interface PathForeachFunc {
        (op: PathOperation, pts: Graphene.Point[], weight: number): boolean;
    }

    interface PathIntersectionFunc {
        (path1: Path, point1: PathPoint, path2: Path, point2: PathPoint, kind: PathIntersection): boolean;
    }

    interface RenderReplayFontFilter {
        (replay: RenderReplay, font: Pango.Font): Pango.Font;
    }

    interface RenderReplayNodeFilter {
        (replay: RenderReplay, node: RenderNode): RenderNode | null;
    }

    interface RenderReplayTextureFilter {
        (replay: RenderReplay, texture: Gdk.Texture): Gdk.Texture;
    }

    export namespace Isolation {
        export const $gtype: GObject.GType<Isolation>;
    }

    enum Isolation {
        NONE = 0,
        BACKGROUND = 1,
        COPY_PASTE = 2,
        ALL = -1,
    }


    export namespace PathForeachFlags {
        export const $gtype: GObject.GType<PathForeachFlags>;
    }

    enum PathForeachFlags {
        ONLY_LINES = 0,
        QUAD = 1,
        CUBIC = 2,
        CONIC = 4,
    }


    namespace BlendNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class BlendNode extends RenderNode {
        static $gtype: GObject.GType<BlendNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](bottom: RenderNode, top: RenderNode, blend_mode: BlendMode): BlendNode;

        // Signals
        /** @signal */
        connect<K extends keyof BlendNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BlendNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BlendNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BlendNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BlendNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BlendNode.SignalSignatures[K]>): void;

        // Methods
        get_blend_mode(): BlendMode;

        get_bottom_child(): RenderNode;

        get_top_child(): RenderNode;
    }


    namespace BlurNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class BlurNode extends RenderNode {
        static $gtype: GObject.GType<BlurNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](child: RenderNode, radius: number): BlurNode;

        // Signals
        /** @signal */
        connect<K extends keyof BlurNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BlurNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BlurNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BlurNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BlurNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BlurNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;

        get_radius(): number;
    }


    namespace BorderNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class BorderNode extends RenderNode {
        static $gtype: GObject.GType<BorderNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](outline: RoundedRect, border_width: number[], border_color: Gdk.RGBA[]): BorderNode;

        // Signals
        /** @signal */
        connect<K extends keyof BorderNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BorderNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BorderNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BorderNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BorderNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BorderNode.SignalSignatures[K]>): void;

        // Methods
        get_border_snap(): RectSnap;

        get_colors(): Gdk.RGBA[];

        get_outline(): RoundedRect;

        get_snap(): RectSnap;

        get_widths(): number[];
    }


    namespace BroadwayRenderer {
        // Signal signatures
        interface SignalSignatures extends Renderer.SignalSignatures {
            "notify::realized": (pspec: GObject.ParamSpec) => void;
            "notify::surface": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Renderer.ConstructorProps {}
    }

    class BroadwayRenderer extends Renderer {
        static $gtype: GObject.GType<BroadwayRenderer>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: BroadwayRenderer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<BroadwayRenderer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): BroadwayRenderer;

        // Signals
        /** @signal */
        connect<K extends keyof BroadwayRenderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BroadwayRenderer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof BroadwayRenderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, BroadwayRenderer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof BroadwayRenderer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<BroadwayRenderer.SignalSignatures[K]>): void;
    }


    namespace CairoNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class CairoNode extends RenderNode {
        static $gtype: GObject.GType<CairoNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](bounds: Graphene.Rect): CairoNode;

        // Signals
        /** @signal */
        connect<K extends keyof CairoNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CairoNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof CairoNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CairoNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof CairoNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<CairoNode.SignalSignatures[K]>): void;

        // Methods
        get_draw_context(): cairo.Context;

        get_surface(): cairo.Surface;
    }


    namespace CairoRenderer {
        // Signal signatures
        interface SignalSignatures extends Renderer.SignalSignatures {
            "notify::realized": (pspec: GObject.ParamSpec) => void;
            "notify::surface": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Renderer.ConstructorProps {}
    }

    class CairoRenderer extends Renderer {
        static $gtype: GObject.GType<CairoRenderer>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: CairoRenderer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<CairoRenderer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): CairoRenderer;

        // Signals
        /** @signal */
        connect<K extends keyof CairoRenderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CairoRenderer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof CairoRenderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CairoRenderer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof CairoRenderer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<CairoRenderer.SignalSignatures[K]>): void;
    }


    namespace ClipNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class ClipNode extends RenderNode {
        static $gtype: GObject.GType<ClipNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](child: RenderNode, clip: Graphene.Rect): ClipNode;

        // Signals
        /** @signal */
        connect<K extends keyof ClipNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ClipNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ClipNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ClipNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ClipNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ClipNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;

        get_clip(): Graphene.Rect;

        get_snap(): RectSnap;
    }


    namespace ColorMatrixNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class ColorMatrixNode extends RenderNode {
        static $gtype: GObject.GType<ColorMatrixNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](child: RenderNode, color_matrix: Graphene.Matrix, color_offset: Graphene.Vec4): ColorMatrixNode;

        // Signals
        /** @signal */
        connect<K extends keyof ColorMatrixNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorMatrixNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorMatrixNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorMatrixNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorMatrixNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorMatrixNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;

        get_color_matrix(): Graphene.Matrix;

        get_color_offset(): Graphene.Vec4;

        get_snap(): RectSnap;
    }


    namespace ColorNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class ColorNode extends RenderNode {
        static $gtype: GObject.GType<ColorNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](rgba: Gdk.RGBA, bounds: Graphene.Rect): ColorNode;

        // Signals
        /** @signal */
        connect<K extends keyof ColorNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ColorNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ColorNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ColorNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ColorNode.SignalSignatures[K]>): void;

        // Methods
        get_color(): Gdk.RGBA;

        get_snap(): RectSnap;
    }


    namespace ComponentTransferNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class ComponentTransferNode extends RenderNode {
        static $gtype: GObject.GType<ComponentTransferNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](child: RenderNode, r: ComponentTransfer, g: ComponentTransfer, b: ComponentTransfer, a: ComponentTransfer): ComponentTransferNode;

        // Signals
        /** @signal */
        connect<K extends keyof ComponentTransferNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ComponentTransferNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ComponentTransferNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ComponentTransferNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ComponentTransferNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ComponentTransferNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;

        get_transfer(component: Gdk.ColorChannel): ComponentTransfer;
    }


    namespace CompositeNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class CompositeNode extends RenderNode {
        static $gtype: GObject.GType<CompositeNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](child: RenderNode, mask: RenderNode, op: PorterDuff): CompositeNode;

        // Signals
        /** @signal */
        connect<K extends keyof CompositeNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CompositeNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof CompositeNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CompositeNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof CompositeNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<CompositeNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;

        get_mask(): RenderNode;

        get_operator(): PorterDuff;
    }


    namespace ConicGradientNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class ConicGradientNode extends RenderNode {
        static $gtype: GObject.GType<ConicGradientNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](bounds: Graphene.Rect, center: Graphene.Point, rotation: number, color_stops: ColorStop[]): ConicGradientNode;

        // Signals
        /** @signal */
        connect<K extends keyof ConicGradientNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ConicGradientNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ConicGradientNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ConicGradientNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ConicGradientNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ConicGradientNode.SignalSignatures[K]>): void;

        // Methods
        get_angle(): number;

        get_center(): Graphene.Point;

        get_color_stops(): ColorStop[];

        get_n_color_stops(): number;

        get_rotation(): number;

        get_snap(): RectSnap;
    }


    namespace ContainerNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class ContainerNode extends RenderNode {
        static $gtype: GObject.GType<ContainerNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](children: RenderNode[]): ContainerNode;

        // Signals
        /** @signal */
        connect<K extends keyof ContainerNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ContainerNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ContainerNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ContainerNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ContainerNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ContainerNode.SignalSignatures[K]>): void;

        // Methods
        get_child(idx: number): RenderNode;

        get_n_children(): number;
    }


    namespace CopyNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class CopyNode extends RenderNode {
        static $gtype: GObject.GType<CopyNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](child: RenderNode): CopyNode;

        // Signals
        /** @signal */
        connect<K extends keyof CopyNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CopyNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof CopyNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CopyNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof CopyNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<CopyNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;
    }


    namespace CrossFadeNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class CrossFadeNode extends RenderNode {
        static $gtype: GObject.GType<CrossFadeNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](start: RenderNode, end: RenderNode, progress: number): CrossFadeNode;

        // Signals
        /** @signal */
        connect<K extends keyof CrossFadeNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CrossFadeNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof CrossFadeNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, CrossFadeNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof CrossFadeNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<CrossFadeNode.SignalSignatures[K]>): void;

        // Methods
        get_end_child(): RenderNode;

        get_progress(): number;

        get_start_child(): RenderNode;
    }


    namespace DebugNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class DebugNode extends RenderNode {
        static $gtype: GObject.GType<DebugNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](child: RenderNode, message: string): DebugNode;

        // Signals
        /** @signal */
        connect<K extends keyof DebugNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DebugNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof DebugNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, DebugNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof DebugNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<DebugNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;

        get_message(): string;
    }


    namespace FillNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class FillNode extends RenderNode {
        static $gtype: GObject.GType<FillNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](child: RenderNode, path: Path, fill_rule: FillRule): FillNode;

        // Signals
        /** @signal */
        connect<K extends keyof FillNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FillNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FillNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FillNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FillNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FillNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;

        get_fill_rule(): FillRule;

        get_path(): Path;
    }


    namespace GLRenderer {
        // Signal signatures
        interface SignalSignatures extends Renderer.SignalSignatures {
            "notify::realized": (pspec: GObject.ParamSpec) => void;
            "notify::surface": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Renderer.ConstructorProps {}
    }

    class GLRenderer extends Renderer {
        static $gtype: GObject.GType<GLRenderer>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: GLRenderer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<GLRenderer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): GLRenderer;

        // Signals
        /** @signal */
        connect<K extends keyof GLRenderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GLRenderer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof GLRenderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GLRenderer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof GLRenderer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<GLRenderer.SignalSignatures[K]>): void;
    }


    namespace GLShader {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::resource": (pspec: GObject.ParamSpec) => void;
            "notify::source": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            resource: string | null;
            source: GLib.Bytes | Uint8Array;
        }
    }

    class GLShader extends GObject.Object {
        static $gtype: GObject.GType<GLShader>;

        // Properties
        get resource(): string | null;

        get source(): GLib.Bytes;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: GLShader.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<GLShader.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static new_from_bytes(sourcecode: GLib.Bytes | Uint8Array): GLShader;

        static new_from_resource(resource_path: string): GLShader;

        // Signals
        /** @signal */
        connect<K extends keyof GLShader.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GLShader.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof GLShader.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GLShader.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof GLShader.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<GLShader.SignalSignatures[K]>): void;

        // Methods
        compile(renderer: Renderer): boolean;

        find_uniform_by_name(name: string): number;

        get_arg_bool(args: GLib.Bytes | Uint8Array, idx: number): boolean;

        get_arg_float(args: GLib.Bytes | Uint8Array, idx: number): number;

        get_arg_int(args: GLib.Bytes | Uint8Array, idx: number): number;

        get_arg_uint(args: GLib.Bytes | Uint8Array, idx: number): number;

        get_arg_vec2(args: GLib.Bytes | Uint8Array, idx: number, out_value: Graphene.Vec2): void;

        get_arg_vec3(args: GLib.Bytes | Uint8Array, idx: number, out_value: Graphene.Vec3): void;

        get_arg_vec4(args: GLib.Bytes | Uint8Array, idx: number, out_value: Graphene.Vec4): void;

        get_args_size(): number;

        get_n_textures(): number;

        get_n_uniforms(): number;

        get_resource(): string | null;

        get_source(): GLib.Bytes;

        get_uniform_name(idx: number): string;

        get_uniform_offset(idx: number): number;

        get_uniform_type(idx: number): GLUniformType;
    }


    namespace GLShaderNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class GLShaderNode extends RenderNode {
        static $gtype: GObject.GType<GLShaderNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](shader: GLShader, bounds: Graphene.Rect, args: GLib.Bytes | Uint8Array, children: RenderNode[] | null): GLShaderNode;

        // Signals
        /** @signal */
        connect<K extends keyof GLShaderNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GLShaderNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof GLShaderNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, GLShaderNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof GLShaderNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<GLShaderNode.SignalSignatures[K]>): void;

        // Methods
        get_args(): GLib.Bytes;

        get_child(idx: number): RenderNode;

        get_n_children(): number;

        get_shader(): GLShader;
    }


    namespace InsetShadowNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class InsetShadowNode extends RenderNode {
        static $gtype: GObject.GType<InsetShadowNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](outline: RoundedRect, color: Gdk.RGBA, dx: number, dy: number, spread: number, blur_radius: number): InsetShadowNode;

        // Signals
        /** @signal */
        connect<K extends keyof InsetShadowNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InsetShadowNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof InsetShadowNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, InsetShadowNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof InsetShadowNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<InsetShadowNode.SignalSignatures[K]>): void;

        // Methods
        get_blur_radius(): number;

        get_color(): Gdk.RGBA;

        get_dx(): number;

        get_dy(): number;

        get_outline(): RoundedRect;

        get_snap(): RectSnap;

        get_spread(): number;
    }


    namespace IsolationNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class IsolationNode extends RenderNode {
        static $gtype: GObject.GType<IsolationNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](child: RenderNode, isolations: Isolation): IsolationNode;

        // Signals
        /** @signal */
        connect<K extends keyof IsolationNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IsolationNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof IsolationNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, IsolationNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof IsolationNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<IsolationNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;

        get_isolations(): Isolation;
    }


    namespace LinearGradientNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class LinearGradientNode extends RenderNode {
        static $gtype: GObject.GType<LinearGradientNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](bounds: Graphene.Rect, start: Graphene.Point, end: Graphene.Point, color_stops: ColorStop[]): LinearGradientNode;

        // Signals
        /** @signal */
        connect<K extends keyof LinearGradientNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LinearGradientNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof LinearGradientNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, LinearGradientNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof LinearGradientNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<LinearGradientNode.SignalSignatures[K]>): void;

        // Methods
        get_color_stops(): ColorStop[];

        get_end(): Graphene.Point;

        get_n_color_stops(): number;

        get_snap(): RectSnap;

        get_start(): Graphene.Point;
    }


    namespace MaskNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class MaskNode extends RenderNode {
        static $gtype: GObject.GType<MaskNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](source: RenderNode, mask: RenderNode, mask_mode: MaskMode): MaskNode;

        // Signals
        /** @signal */
        connect<K extends keyof MaskNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MaskNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof MaskNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, MaskNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof MaskNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<MaskNode.SignalSignatures[K]>): void;

        // Methods
        get_mask(): RenderNode;

        get_mask_mode(): MaskMode;

        get_source(): RenderNode;
    }


    namespace NglRenderer {
        // Signal signatures
        interface SignalSignatures extends Renderer.SignalSignatures {
            "notify::realized": (pspec: GObject.ParamSpec) => void;
            "notify::surface": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Renderer.ConstructorProps {}
    }

    class NglRenderer extends Renderer {
        static $gtype: GObject.GType<NglRenderer>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: NglRenderer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<NglRenderer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): NglRenderer;

        // Signals
        /** @signal */
        connect<K extends keyof NglRenderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NglRenderer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof NglRenderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, NglRenderer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof NglRenderer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<NglRenderer.SignalSignatures[K]>): void;
    }


    namespace OpacityNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class OpacityNode extends RenderNode {
        static $gtype: GObject.GType<OpacityNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](child: RenderNode, opacity: number): OpacityNode;

        // Signals
        /** @signal */
        connect<K extends keyof OpacityNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, OpacityNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof OpacityNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, OpacityNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof OpacityNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<OpacityNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;

        get_opacity(): number;
    }


    namespace OutsetShadowNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class OutsetShadowNode extends RenderNode {
        static $gtype: GObject.GType<OutsetShadowNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](outline: RoundedRect, color: Gdk.RGBA, dx: number, dy: number, spread: number, blur_radius: number): OutsetShadowNode;

        // Signals
        /** @signal */
        connect<K extends keyof OutsetShadowNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, OutsetShadowNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof OutsetShadowNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, OutsetShadowNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof OutsetShadowNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<OutsetShadowNode.SignalSignatures[K]>): void;

        // Methods
        get_blur_radius(): number;

        get_color(): Gdk.RGBA;

        get_dx(): number;

        get_dy(): number;

        get_outline(): RoundedRect;

        get_snap(): RectSnap;

        get_spread(): number;
    }


    namespace PasteNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class PasteNode extends RenderNode {
        static $gtype: GObject.GType<PasteNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](bounds: Graphene.Rect, depth: bigint | number): PasteNode;

        // Signals
        /** @signal */
        connect<K extends keyof PasteNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PasteNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof PasteNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, PasteNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof PasteNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<PasteNode.SignalSignatures[K]>): void;

        // Methods
        get_depth(): number;

        get_snap(): RectSnap;
    }


    namespace RadialGradientNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class RadialGradientNode extends RenderNode {
        static $gtype: GObject.GType<RadialGradientNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](bounds: Graphene.Rect, center: Graphene.Point, hradius: number, vradius: number, start: number, end: number, color_stops: ColorStop[]): RadialGradientNode;

        // Signals
        /** @signal */
        connect<K extends keyof RadialGradientNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RadialGradientNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof RadialGradientNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RadialGradientNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof RadialGradientNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<RadialGradientNode.SignalSignatures[K]>): void;

        // Methods
        get_center(): Graphene.Point;

        get_color_stops(): ColorStop[];

        get_end(): number;

        get_hradius(): number;

        get_n_color_stops(): number;

        get_snap(): RectSnap;

        get_start(): number;

        get_vradius(): number;
    }


    namespace RenderNode {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    abstract class RenderNode {
        static $gtype: GObject.GType<RenderNode>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof RenderNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RenderNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof RenderNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RenderNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof RenderNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<RenderNode.SignalSignatures[K]>): void;

        // Static methods
        static deserialize(bytes: GLib.Bytes | Uint8Array, error_func: ParseErrorFunc | null): RenderNode | null;

        // Methods
        draw(cr: cairo.Context): void;

        get_bounds(): Graphene.Rect;

        get_children(): RenderNode[] | null;

        get_node_type(): RenderNodeType;

        get_opaque_rect(): [boolean, Graphene.Rect];

        ref(): RenderNode;

        serialize(): GLib.Bytes;

        unref(): void;

        write_to_file(filename: string): boolean;
    }


    namespace Renderer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {
            "notify::realized": (pspec: GObject.ParamSpec) => void;
            "notify::surface": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {
            realized: boolean;
            surface: Gdk.Surface | null;
        }
    }

    abstract class Renderer extends GObject.Object {
        static $gtype: GObject.GType<Renderer>;

        // Properties
        get realized(): boolean;

        get surface(): Gdk.Surface | null;

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

        static new_for_surface(surface: Gdk.Surface): Renderer;

        // Signals
        /** @signal */
        connect<K extends keyof Renderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Renderer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Renderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Renderer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Renderer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Renderer.SignalSignatures[K]>): void;

        // Methods
        get_surface(): Gdk.Surface | null;

        is_realized(): boolean;

        realize(surface: Gdk.Surface | null): boolean;

        realize_for_display(display: Gdk.Display): boolean;

        render(root: RenderNode, region: cairo.Region | null): void;

        render_texture(root: RenderNode, viewport: Graphene.Rect | null): Gdk.Texture;

        unrealize(): void;
    }


    namespace RepeatNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class RepeatNode extends RenderNode {
        static $gtype: GObject.GType<RepeatNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](bounds: Graphene.Rect, child: RenderNode, child_bounds: Graphene.Rect | null): RepeatNode;

        // Signals
        /** @signal */
        connect<K extends keyof RepeatNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RepeatNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof RepeatNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RepeatNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof RepeatNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<RepeatNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;

        get_child_bounds(): Graphene.Rect;

        get_child_snap(): RectSnap;

        get_snap(): RectSnap;
    }


    namespace RepeatingLinearGradientNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class RepeatingLinearGradientNode extends RenderNode {
        static $gtype: GObject.GType<RepeatingLinearGradientNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](bounds: Graphene.Rect, start: Graphene.Point, end: Graphene.Point, color_stops: ColorStop[]): RepeatingLinearGradientNode;

        // Signals
        /** @signal */
        connect<K extends keyof RepeatingLinearGradientNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RepeatingLinearGradientNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof RepeatingLinearGradientNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RepeatingLinearGradientNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof RepeatingLinearGradientNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<RepeatingLinearGradientNode.SignalSignatures[K]>): void;
    }


    namespace RepeatingRadialGradientNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class RepeatingRadialGradientNode extends RenderNode {
        static $gtype: GObject.GType<RepeatingRadialGradientNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](bounds: Graphene.Rect, center: Graphene.Point, hradius: number, vradius: number, start: number, end: number, color_stops: ColorStop[]): RepeatingRadialGradientNode;

        // Signals
        /** @signal */
        connect<K extends keyof RepeatingRadialGradientNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RepeatingRadialGradientNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof RepeatingRadialGradientNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RepeatingRadialGradientNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof RepeatingRadialGradientNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<RepeatingRadialGradientNode.SignalSignatures[K]>): void;
    }


    namespace RoundedClipNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class RoundedClipNode extends RenderNode {
        static $gtype: GObject.GType<RoundedClipNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](child: RenderNode, clip: RoundedRect): RoundedClipNode;

        // Signals
        /** @signal */
        connect<K extends keyof RoundedClipNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RoundedClipNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof RoundedClipNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, RoundedClipNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof RoundedClipNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<RoundedClipNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;

        get_clip(): RoundedRect;

        get_snap(): RectSnap;
    }


    namespace ShadowNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class ShadowNode extends RenderNode {
        static $gtype: GObject.GType<ShadowNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](child: RenderNode, shadows: Shadow[]): ShadowNode;

        // Signals
        /** @signal */
        connect<K extends keyof ShadowNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ShadowNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof ShadowNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, ShadowNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof ShadowNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<ShadowNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;

        get_n_shadows(): number;

        get_shadow(i: bigint | number): Shadow;
    }


    namespace StrokeNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class StrokeNode extends RenderNode {
        static $gtype: GObject.GType<StrokeNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](child: RenderNode, path: Path, stroke: Stroke): StrokeNode;

        // Signals
        /** @signal */
        connect<K extends keyof StrokeNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StrokeNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof StrokeNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, StrokeNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof StrokeNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<StrokeNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;

        get_path(): Path;

        get_stroke(): Stroke;
    }


    namespace SubsurfaceNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class SubsurfaceNode extends RenderNode {
        static $gtype: GObject.GType<SubsurfaceNode>;

        // Constructors
        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof SubsurfaceNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SubsurfaceNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof SubsurfaceNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, SubsurfaceNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof SubsurfaceNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<SubsurfaceNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;
    }


    namespace TextNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class TextNode extends RenderNode {
        static $gtype: GObject.GType<TextNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](font: Pango.Font, glyphs: Pango.GlyphString, color: Gdk.RGBA, offset: Graphene.Point): TextNode;

        // Signals
        /** @signal */
        connect<K extends keyof TextNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TextNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TextNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TextNode.SignalSignatures[K]>): void;

        // Methods
        get_color(): Gdk.RGBA;

        get_font(): Pango.Font;

        get_glyphs(): Pango.GlyphInfo[];

        get_num_glyphs(): number;

        get_offset(): Graphene.Point;

        has_color_glyphs(): boolean;
    }


    namespace TextureNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class TextureNode extends RenderNode {
        static $gtype: GObject.GType<TextureNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](texture: Gdk.Texture, bounds: Graphene.Rect): TextureNode;

        // Signals
        /** @signal */
        connect<K extends keyof TextureNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextureNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TextureNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextureNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TextureNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TextureNode.SignalSignatures[K]>): void;

        // Methods
        get_snap(): RectSnap;

        get_texture(): Gdk.Texture;
    }


    namespace TextureScaleNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class TextureScaleNode extends RenderNode {
        static $gtype: GObject.GType<TextureScaleNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](texture: Gdk.Texture, bounds: Graphene.Rect, filter: ScalingFilter): TextureScaleNode;

        // Signals
        /** @signal */
        connect<K extends keyof TextureScaleNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextureScaleNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TextureScaleNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TextureScaleNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TextureScaleNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TextureScaleNode.SignalSignatures[K]>): void;

        // Methods
        get_filter(): ScalingFilter;

        get_snap(): RectSnap;

        get_texture(): Gdk.Texture;
    }


    namespace TransformNode {
        // Signal signatures
        interface SignalSignatures extends RenderNode.SignalSignatures {}
    }

    class TransformNode extends RenderNode {
        static $gtype: GObject.GType<TransformNode>;

        // Constructors
        _init(...args: any[]): void;

        static ["new"](child: RenderNode, transform: Transform | null): TransformNode;

        // Signals
        /** @signal */
        connect<K extends keyof TransformNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TransformNode.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof TransformNode.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, TransformNode.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof TransformNode.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<TransformNode.SignalSignatures[K]>): void;

        // Methods
        get_child(): RenderNode;

        get_transform(): Transform;
    }


    namespace VulkanRenderer {
        // Signal signatures
        interface SignalSignatures extends Renderer.SignalSignatures {
            "notify::realized": (pspec: GObject.ParamSpec) => void;
            "notify::surface": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps extends Renderer.ConstructorProps {}
    }

    class VulkanRenderer extends Renderer {
        static $gtype: GObject.GType<VulkanRenderer>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: VulkanRenderer.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<VulkanRenderer.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): VulkanRenderer;

        // Signals
        /** @signal */
        connect<K extends keyof VulkanRenderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VulkanRenderer.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof VulkanRenderer.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, VulkanRenderer.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof VulkanRenderer.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<VulkanRenderer.SignalSignatures[K]>): void;
    }


    type BroadwayRendererClass = typeof BroadwayRenderer;

    type CairoRendererClass = typeof CairoRenderer;

    class ColorStop {
        static $gtype: GObject.GType<ColorStop>;

        // Fields
        offset: number;

        color: Gdk.RGBA;

        // Constructors

        constructor(properties?: Partial<{
            offset: number;
            color: Gdk.RGBA;
        }>);
    }


    class ComponentTransfer {
        static $gtype: GObject.GType<ComponentTransfer>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static new_discrete(values: number[]): ComponentTransfer;

        static new_gamma(amp: number, exp: number, ofs: number): ComponentTransfer;

        static new_identity(): ComponentTransfer;

        static new_levels(n: number): ComponentTransfer;

        static new_linear(m: number, b: number): ComponentTransfer;

        static new_table(values: number[]): ComponentTransfer;

        // Static methods
        static equal(self: never, other: never): boolean;

        // Methods
        copy(): ComponentTransfer;

        free(): void;
    }


    type GLRendererClass = typeof GLRenderer;

    type GLShaderClass = typeof GLShader;

    class ParseLocation {
        static $gtype: GObject.GType<ParseLocation>;

        // Fields
        bytes: number;

        chars: number;

        lines: number;

        line_bytes: number;

        line_chars: number;
    }


    abstract class Path {
        static $gtype: GObject.GType<Path>;

        // Static methods
        static parse(string: string): Path | null;

        // Methods
        equal(path2: Path): boolean;

        foreach(flags: PathForeachFlags, func: PathForeachFunc): boolean;

        foreach_intersection(path2: Path | null, func: PathIntersectionFunc): boolean;

        get_bounds(): [boolean, Graphene.Rect];

        get_closest_point(point: Graphene.Point, threshold: number): [boolean, PathPoint, number];

        get_end_point(): [boolean, PathPoint];

        get_next(point: PathPoint): [boolean, PathPoint];

        get_previous(point: PathPoint): [boolean, PathPoint];

        get_start_point(): [boolean, PathPoint];

        get_stroke_bounds(stroke: Stroke): [boolean, Graphene.Rect];

        get_tight_bounds(): [boolean, Graphene.Rect];

        in_fill(point: Graphene.Point, fill_rule: FillRule): boolean;

        is_closed(): boolean;

        is_empty(): boolean;

        print(string: GLib.String): void;

        ref(): Path;

        to_cairo(cr: cairo.Context): void;

        to_string(): string;

        unref(): void;
    }


    class PathBuilder {
        static $gtype: GObject.GType<PathBuilder>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): PathBuilder;

        // Methods
        add_cairo_path(path: cairo.Path): void;

        add_circle(center: Graphene.Point, radius: number): void;

        add_layout(layout: Pango.Layout): void;

        add_path(path: Path): void;

        add_rect(rect: Graphene.Rect): void;

        add_reverse_path(path: Path): void;

        add_rounded_rect(rect: RoundedRect): void;

        add_segment(path: Path, start: PathPoint, end: PathPoint): void;

        arc_to(x1: number, y1: number, x2: number, y2: number): void;

        close(): void;

        conic_to(x1: number, y1: number, x2: number, y2: number, weight: number): void;

        cubic_to(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;

        get_current_point(): Graphene.Point;

        html_arc_to(x1: number, y1: number, x2: number, y2: number, radius: number): void;

        line_to(x: number, y: number): void;

        move_to(x: number, y: number): void;

        quad_to(x1: number, y1: number, x2: number, y2: number): void;

        ref(): PathBuilder;

        rel_arc_to(x1: number, y1: number, x2: number, y2: number): void;

        rel_conic_to(x1: number, y1: number, x2: number, y2: number, weight: number): void;

        rel_cubic_to(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;

        rel_html_arc_to(x1: number, y1: number, x2: number, y2: number, radius: number): void;

        rel_line_to(x: number, y: number): void;

        rel_move_to(x: number, y: number): void;

        rel_quad_to(x1: number, y1: number, x2: number, y2: number): void;

        rel_svg_arc_to(rx: number, ry: number, x_axis_rotation: number, large_arc: boolean, positive_sweep: boolean, x: number, y: number): void;

        svg_arc_to(rx: number, ry: number, x_axis_rotation: number, large_arc: boolean, positive_sweep: boolean, x: number, y: number): void;

        to_path(): Path;

        unref(): void;
    }


    class PathMeasure {
        static $gtype: GObject.GType<PathMeasure>;

        // Constructors
        constructor(path: Path);

        static ["new"](path: Path): PathMeasure;

        static new_with_tolerance(path: Path, tolerance: number): PathMeasure;

        // Methods
        get_length(): number;

        get_path(): Path;

        get_point(distance: number): [boolean, PathPoint];

        get_tolerance(): number;

        ref(): PathMeasure;

        unref(): void;
    }


    class PathPoint {
        static $gtype: GObject.GType<PathPoint>;

        // Methods
        compare(point2: PathPoint): number;

        copy(): PathPoint;

        equal(point2: PathPoint): boolean;

        free(): void;

        get_curvature(path: Path, direction: PathDirection): [number, Graphene.Point | null];

        get_distance(measure: PathMeasure): number;

        get_position(path: Path): Graphene.Point;

        get_rotation(path: Path, direction: PathDirection): number;

        get_tangent(path: Path, direction: PathDirection): Graphene.Vec2;
    }


    class RenderReplay {
        static $gtype: GObject.GType<RenderReplay>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): RenderReplay;

        // Methods
        ["default"](node: RenderNode): RenderNode | null;

        filter_font(font: Pango.Font): Pango.Font;

        filter_node(node: RenderNode): RenderNode | null;

        filter_texture(texture: Gdk.Texture): Gdk.Texture;

        free(): void;

        set_font_filter(filter: RenderReplayFontFilter | null): void;

        set_node_filter(filter: RenderReplayNodeFilter | null): void;

        set_texture_filter(filter: RenderReplayTextureFilter | null): void;
    }


    type RendererClass = typeof Renderer;

    class RoundedRect {
        static $gtype: GObject.GType<RoundedRect>;

        // Fields
        bounds: Graphene.Rect;

        corner: Graphene.Size[];

        // Constructors

        constructor(properties?: Partial<{
            bounds: Graphene.Rect;
            corner: Graphene.Size[];
        }>);

        // Methods
        contains_point(point: Graphene.Point): boolean;

        contains_rect(rect: Graphene.Rect): boolean;

        init(bounds: Graphene.Rect, top_left: Graphene.Size, top_right: Graphene.Size, bottom_right: Graphene.Size, bottom_left: Graphene.Size): RoundedRect;

        init_copy(src: RoundedRect): RoundedRect;

        init_from_rect(bounds: Graphene.Rect, radius: number): RoundedRect;

        intersects_rect(rect: Graphene.Rect): boolean;

        is_rectilinear(): boolean;

        normalize(): RoundedRect;

        offset(dx: number, dy: number): RoundedRect;

        shrink(top: number, right: number, bottom: number, left: number): RoundedRect;
    }


    class ShaderArgsBuilder {
        static $gtype: GObject.GType<ShaderArgsBuilder>;

        // Constructors
        constructor(shader: GLShader, initial_values: GLib.Bytes | Uint8Array | null);

        static ["new"](shader: GLShader, initial_values: GLib.Bytes | Uint8Array | null): ShaderArgsBuilder;

        // Methods
        ref(): ShaderArgsBuilder;

        set_bool(idx: number, value: boolean): void;

        set_float(idx: number, value: number): void;

        set_int(idx: number, value: number): void;

        set_uint(idx: number, value: number): void;

        set_vec2(idx: number, value: Graphene.Vec2): void;

        set_vec3(idx: number, value: Graphene.Vec3): void;

        set_vec4(idx: number, value: Graphene.Vec4): void;

        to_args(): GLib.Bytes;

        unref(): void;
    }


    class Shadow {
        static $gtype: GObject.GType<Shadow>;

        // Fields
        color: Gdk.RGBA;

        dx: number;

        dy: number;

        radius: number;

        // Constructors

        constructor(properties?: Partial<{
            color: Gdk.RGBA;
            dx: number;
            dy: number;
            radius: number;
        }>);
    }


    class Stroke {
        static $gtype: GObject.GType<Stroke>;

        // Constructors
        constructor(line_width: number);

        static ["new"](line_width: number): Stroke;

        // Static methods
        static equal(stroke1: null, stroke2: null): boolean;

        // Methods
        copy(): Stroke;

        free(): void;

        get_dash(): number[] | null;

        get_dash_offset(): number;

        get_line_cap(): LineCap;

        get_line_join(): LineJoin;

        get_line_width(): number;

        get_miter_limit(): number;

        set_dash(dash: number[] | null): void;

        set_dash_offset(offset: number): void;

        set_line_cap(line_cap: LineCap): void;

        set_line_join(line_join: LineJoin): void;

        set_line_width(line_width: number): void;

        set_miter_limit(limit: number): void;

        to_cairo(cr: cairo.Context): void;
    }


    class Transform {
        static $gtype: GObject.GType<Transform>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): Transform;

        // Static methods
        static parse(string: string): [boolean, Transform];

        // Methods
        equal(second: Transform | null): boolean;

        get_category(): TransformCategory;

        invert(): Transform | null;

        matrix(matrix: Graphene.Matrix): Transform;

        matrix_2d(xx: number, yx: number, xy: number, yy: number, dx: number, dy: number): Transform | null;

        perspective(depth: number): Transform;

        print(string: GLib.String): void;

        ref(): Transform | null;

        rotate(angle: number): Transform | null;

        rotate_3d(angle: number, axis: Graphene.Vec3): Transform | null;

        scale(factor_x: number, factor_y: number): Transform | null;

        scale_3d(factor_x: number, factor_y: number, factor_z: number): Transform | null;

        skew(skew_x: number, skew_y: number): Transform | null;

        to_2d(): [number, number, number, number, number, number];

        to_2d_components(): [number, number, number, number, number, number, number];

        to_affine(): [number, number, number, number];

        to_matrix(): Graphene.Matrix;

        to_string(): string;

        to_translate(): [number, number];

        transform(other: Transform | null): Transform | null;

        transform_bounds(rect: Graphene.Rect): Graphene.Rect;

        transform_point(point: Graphene.Point): Graphene.Point;

        translate(point: Graphene.Point): Transform | null;

        translate_3d(point: Graphene.Point3D): Transform | null;

        unref(): void;
    }


    type VulkanRendererClass = typeof VulkanRenderer;

    type RectSnap = number;

    const __name__: string;

    const __version__: string;
}

export default Gsk;

}

declare module 'gi://Gsk' {
    import Gsk40 from 'gi://Gsk?version=4.0';
    export default Gsk40;
}
// END
