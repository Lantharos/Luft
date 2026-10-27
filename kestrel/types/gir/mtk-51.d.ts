/// <reference path="./graphene-1.0.d.ts" />
/// <reference path="./gobject-2.0.d.ts" />
/// <reference path="./glib-2.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://Mtk?version=51' {

// Module dependencies
import type Graphene from 'gi://Graphene?version=1.0';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';

export namespace Mtk {

    /**
     * Mtk-51
     */


    enum AnonymousFileMapmode {
        PRIVATE = 0,
        SHARED = 1,
    }


    class MonitorTransform {
        static $gtype: GObject.GType<MonitorTransform>;

        // Static fields
        static NORMAL: number;

        static "90": number;

        static "180": number;

        static "270": number;

        static FLIPPED: number;

        static FLIPPED_90: number;

        static FLIPPED_180: number;

        static FLIPPED_270: number;
    }


    enum RegionOverlap {
        OUT = 0,
        IN = 1,
        PART = 2,
    }


    enum RoundingStrategy {
        SHRINK = 0,
        GROW = 1,
        ROUND = 2,
    }


    const MONITOR_ALL_TRANSFORMS: number;

    const MONITOR_N_TRANSFORMS: number;

    const RECTANGLE_MAX_STACK_RECTS: number;

    const REGION_BUILDER_MAX_LEVELS: number;

    function compute_viewport_matrix(matrix: Graphene.Matrix, width: number, height: number, scale: number, transform: MonitorTransform, src_rect: Graphene.Rect): void;

    function extrapolate_next_interval_boundary(boundary_us: bigint | number, base_us: bigint | number, interval_us: bigint | number): number;

    function find_nearest_interval_boundary(boundary_us: bigint | number, base_us: bigint | number, interval_us: bigint | number): number;

    function idle_add(priority: number, _function: GLib.SourceFunc): number;

    function idle_add_once(_function: GLib.SourceOnceFunc): number;

    function is_fd_readable(fd: number): boolean;

    function monitor_transform_from_string(name: string): MonitorTransform;

    function monitor_transform_invert(transform: MonitorTransform): MonitorTransform;

    function monitor_transform_to_string(transform: MonitorTransform): string;

    function monitor_transform_transform(transform: MonitorTransform, other: MonitorTransform): MonitorTransform;

    function monitor_transform_transform_matrix(transform: MonitorTransform, matrix: Graphene.Matrix): void;

    function monitor_transform_transform_point(transform: MonitorTransform, area_width: number, area_height: number, point_x: number, point_y: number): void;

    function rectangle_from_graphene_rect(rect: Graphene.Rect, rounding_strategy: RoundingStrategy): Rectangle;

    function region_create(): Region;

    function region_create_rectangle(rect: Rectangle): Region;

    function region_create_rectangles(rects: Rectangle, n_rects: number): Region;

    function source_remove(tag: number): boolean;

    function source_set_name_by_id(tag: number, name: string): void;

    function timeout_add(priority: number, interval: number, _function: GLib.SourceFunc): number;

    function timeout_add_once(interval: number, _function: GLib.SourceOnceFunc): number;

    function timeout_add_seconds(priority: number, interval: number, _function: GLib.SourceFunc): number;

    function timeout_add_seconds_once(interval: number, _function: GLib.SourceOnceFunc): number;

    function x11_errors_deinit(): void;

    abstract class AnonymousFile {
        static $gtype: GObject.GType<AnonymousFile>;

        // Methods
        free(): void;
    }


    abstract class DbusPidfd {
        static $gtype: GObject.GType<DbusPidfd>;

        // Methods
        free(): void;

        get_pid(): never;

        get_pidfd(): number;
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

        static ["new"](x: number, y: number, width: number, height: number): Rectangle;

        static new_empty(): Rectangle;

        // Static methods
        static from_graphene_rect(rect: Graphene.Rect, rounding_strategy: RoundingStrategy): Rectangle;

        // Methods
        area(): number;

        contains_point(x: number, y: number): boolean;

        contains_pointf(x: number, y: number): boolean;

        contains_rect(inner_rect: Rectangle): boolean;

        copy(): Rectangle;

        could_fit_rect(inner_rect: Rectangle): boolean;

        crop_and_scale(src_rect: Graphene.Rect, dst_width: number, dst_height: number, dest: Rectangle): void;

        equal(src2: Rectangle): boolean;

        free(): void;

        horiz_overlap(rect2: Rectangle): boolean;

        intersect(src2: Rectangle): [boolean, Rectangle];

        is_adjacent_to(other: Rectangle): boolean;

        is_empty(): boolean;

        overlap(rect2: Rectangle): boolean;

        scale_double(scale: number, rounding_strategy: RoundingStrategy, dest: Rectangle): void;

        to_graphene_rect(): Graphene.Rect;

        transform(transform: MonitorTransform, width: number, height: number, dest: Rectangle): void;

        union(rect2: Rectangle): Rectangle;

        vert_overlap(rect2: Rectangle): boolean;
    }


    abstract class Region {
        static $gtype: GObject.GType<Region>;

        // Static methods
        static create(): Region;

        static create_rectangle(rect: Rectangle): Region;

        static create_rectangles(rects: Rectangle, n_rects: number): Region;

        // Methods
        apply_matrix_transform_expand(transform: Graphene.Matrix): Region;

        contains_point(x: number, y: number): boolean;

        contains_rectangle(rect: Rectangle): RegionOverlap;

        copy(): Region;

        crop_and_scale(src_rect: Graphene.Rect, dst_width: number, dst_height: number): Region;

        downscale(scale: number): Region;

        equal(other: Region): boolean;

        get_box(nth: number, x1: number, y1: number, x2: number, y2: number): void;

        get_extents(): Rectangle;

        get_rectangle(nth: number): Rectangle;

        intersect(other: Region): void;

        intersect_rectangle(rect: Rectangle): void;

        is_empty(): boolean;

        num_rectangles(): number;

        ref(): Region;

        scale(scale: number): Region;

        subtract(other: Region): void;

        subtract_rectangle(rect: Rectangle): void;

        translate(dx: number, dy: number): void;

        union(other: Region): void;

        union_rectangle(rect: Rectangle): void;

        unref(): void;
    }


    class RegionBuilder {
        static $gtype: GObject.GType<RegionBuilder>;

        // Fields
        n_levels: number;

        // Methods
        add_rectangle(x: number, y: number, width: number, height: number): void;

        finish(): Region;

        init(): void;
    }


    class RegionIterator {
        static $gtype: GObject.GType<RegionIterator>;

        // Fields
        rectangle: Rectangle;

        line_start: boolean;

        line_end: boolean;

        i: number;

        // Methods
        at_end(): boolean;

        init(region: Region): void;

        next(): void;
    }


    const __name__: string;

    const __version__: string;
}

export default Mtk;

}

declare module 'gi://Mtk' {
    import Mtk51 from 'gi://Mtk?version=51';
    export default Mtk51;
}
// END
