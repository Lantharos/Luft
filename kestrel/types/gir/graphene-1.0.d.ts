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

declare module 'gi://Graphene?version=1.0' {

// Module dependencies
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';

export namespace Graphene {

    /**
     * Graphene-1.0
     */


    enum EulerOrder {
        DEFAULT = -1,
        XYZ = 0,
        YZX = 1,
        ZXY = 2,
        XZY = 3,
        YXZ = 4,
        ZYX = 5,
        SXYZ = 6,
        SXYX = 7,
        SXZY = 8,
        SXZX = 9,
        SYZX = 10,
        SYZY = 11,
        SYXZ = 12,
        SYXY = 13,
        SZXY = 14,
        SZXZ = 15,
        SZYX = 16,
        SZYZ = 17,
        RZYX = 18,
        RXYX = 19,
        RYZX = 20,
        RXZX = 21,
        RXZY = 22,
        RYZY = 23,
        RZXY = 24,
        RYXY = 25,
        RYXZ = 26,
        RZXZ = 27,
        RXYZ = 28,
        RZYZ = 29,
    }


    enum RayIntersectionKind {
        NONE = 0,
        ENTER = 1,
        LEAVE = 2,
    }


    const PI: number;

    const PI_2: number;

    const VEC2_LEN: number;

    const VEC3_LEN: number;

    const VEC4_LEN: number;

    function box_empty(): Box;

    function box_infinite(): Box;

    function box_minus_one(): Box;

    function box_one(): Box;

    function box_one_minus_one(): Box;

    function box_zero(): Box;

    function point3d_zero(): Point3D;

    function point_zero(): Point;

    function rect_alloc(): Rect;

    function rect_zero(): Rect;

    function size_zero(): Size;

    function vec2_one(): Vec2;

    function vec2_x_axis(): Vec2;

    function vec2_y_axis(): Vec2;

    function vec2_zero(): Vec2;

    function vec3_one(): Vec3;

    function vec3_x_axis(): Vec3;

    function vec3_y_axis(): Vec3;

    function vec3_z_axis(): Vec3;

    function vec3_zero(): Vec3;

    function vec4_one(): Vec4;

    function vec4_w_axis(): Vec4;

    function vec4_x_axis(): Vec4;

    function vec4_y_axis(): Vec4;

    function vec4_z_axis(): Vec4;

    function vec4_zero(): Vec4;

    class Box {
        static $gtype: GObject.GType<Box>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static alloc(): Box;

        // Static methods
        static empty(): Box;

        static infinite(): Box;

        static minus_one(): Box;

        static one(): Box;

        static one_minus_one(): Box;

        static zero(): Box;

        // Methods
        contains_box(b: Box): boolean;

        contains_point(point: Point3D): boolean;

        equal(b: Box): boolean;

        expand(point: Point3D): Box;

        expand_scalar(scalar: number): Box;

        expand_vec3(vec: Vec3): Box;

        free(): void;

        get_bounding_sphere(): Sphere;

        get_center(): Point3D;

        get_depth(): number;

        get_height(): number;

        get_max(): Point3D;

        get_min(): Point3D;

        get_size(): Vec3;

        get_vertices(): Vec3[];

        get_width(): number;

        init(min: Point3D | null, max: Point3D | null): Box;

        init_from_box(src: Box): Box;

        init_from_points(points: Point3D[]): Box;

        init_from_vec3(min: Vec3 | null, max: Vec3 | null): Box;

        init_from_vectors(vectors: Vec3[]): Box;

        intersection(b: Box): [boolean, Box | null];

        union(b: Box): Box;
    }


    class Euler {
        static $gtype: GObject.GType<Euler>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static alloc(): Euler;

        // Methods
        equal(b: Euler): boolean;

        free(): void;

        get_alpha(): number;

        get_beta(): number;

        get_gamma(): number;

        get_order(): EulerOrder;

        get_x(): number;

        get_y(): number;

        get_z(): number;

        init(x: number, y: number, z: number): Euler;

        init_from_euler(src: Euler | null): Euler;

        init_from_matrix(m: Matrix | null, order: EulerOrder): Euler;

        init_from_quaternion(q: Quaternion | null, order: EulerOrder): Euler;

        init_from_radians(x: number, y: number, z: number, order: EulerOrder): Euler;

        init_from_vec3(v: Vec3 | null, order: EulerOrder): Euler;

        init_with_order(x: number, y: number, z: number, order: EulerOrder): Euler;

        reorder(order: EulerOrder): Euler;

        to_matrix(): Matrix;

        to_quaternion(): Quaternion;

        to_vec3(): Vec3;
    }


    class Frustum {
        static $gtype: GObject.GType<Frustum>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static alloc(): Frustum;

        // Methods
        contains_point(point: Point3D): boolean;

        equal(b: Frustum): boolean;

        free(): void;

        get_planes(): Plane[];

        init(p0: Plane, p1: Plane, p2: Plane, p3: Plane, p4: Plane, p5: Plane): Frustum;

        init_from_frustum(src: Frustum): Frustum;

        init_from_matrix(matrix: Matrix): Frustum;

        intersects_box(box: Box): boolean;

        intersects_sphere(sphere: Sphere): boolean;
    }


    class Matrix {
        static $gtype: GObject.GType<Matrix>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static alloc(): Matrix;

        // Methods
        decompose(): [boolean, Vec3, Vec3, Quaternion, Vec3, Vec4];

        determinant(): number;

        equal(b: Matrix): boolean;

        equal_fast(b: Matrix): boolean;

        free(): void;

        get_row(index_: number): Vec4;

        get_value(row: number, col: number): number;

        get_x_scale(): number;

        get_x_translation(): number;

        get_y_scale(): number;

        get_y_translation(): number;

        get_z_scale(): number;

        get_z_translation(): number;

        init_from_2d(xx: number, yx: number, xy: number, yy: number, x_0: number, y_0: number): Matrix;

        init_from_float(v: number[]): Matrix;

        init_from_matrix(src: Matrix): Matrix;

        init_from_vec4(v0: Vec4, v1: Vec4, v2: Vec4, v3: Vec4): Matrix;

        init_frustum(left: number, right: number, bottom: number, top: number, z_near: number, z_far: number): Matrix;

        init_identity(): Matrix;

        init_look_at(eye: Vec3, center: Vec3, up: Vec3): Matrix;

        init_ortho(left: number, right: number, top: number, bottom: number, z_near: number, z_far: number): Matrix;

        init_perspective(fovy: number, aspect: number, z_near: number, z_far: number): Matrix;

        init_rotate(angle: number, axis: Vec3): Matrix;

        init_scale(x: number, y: number, z: number): Matrix;

        init_skew(x_skew: number, y_skew: number): Matrix;

        init_translate(p: Point3D): Matrix;

        interpolate(b: Matrix, factor: number): Matrix;

        inverse(): [boolean, Matrix];

        is_2d(): boolean;

        is_backface_visible(): boolean;

        is_identity(): boolean;

        is_singular(): boolean;

        multiply(b: Matrix): Matrix;

        near(b: Matrix, epsilon: number): boolean;

        normalize(): Matrix;

        perspective(depth: number): Matrix;

        print(): void;

        project_point(p: Point): Point;

        project_rect(r: Rect): Quad;

        project_rect_bounds(r: Rect): Rect;

        rotate(angle: number, axis: Vec3): void;

        rotate_euler(e: Euler): void;

        rotate_quaternion(q: Quaternion): void;

        rotate_x(angle: number): void;

        rotate_y(angle: number): void;

        rotate_z(angle: number): void;

        scale(factor_x: number, factor_y: number, factor_z: number): void;

        skew_xy(factor: number): void;

        skew_xz(factor: number): void;

        skew_yz(factor: number): void;

        to_2d(): [boolean, number, number, number, number, number, number];

        to_float(): number[];

        transform_bounds(r: Rect): Rect;

        transform_box(b: Box): Box;

        transform_point(p: Point): Point;

        transform_point3d(p: Point3D): Point3D;

        transform_ray(r: Ray): Ray;

        transform_rect(r: Rect): Quad;

        transform_sphere(s: Sphere): Sphere;

        transform_vec3(v: Vec3): Vec3;

        transform_vec4(v: Vec4): Vec4;

        translate(pos: Point3D): void;

        transpose(): Matrix;

        unproject_point3d(modelview: Matrix, point: Point3D): Point3D;

        untransform_bounds(r: Rect, bounds: Rect): Rect;

        untransform_point(p: Point, bounds: Rect): [boolean, Point];
    }


    class Plane {
        static $gtype: GObject.GType<Plane>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static alloc(): Plane;

        // Methods
        distance(point: Point3D): number;

        equal(b: Plane): boolean;

        free(): void;

        get_constant(): number;

        get_normal(): Vec3;

        init(normal: Vec3 | null, constant: number): Plane;

        init_from_plane(src: Plane): Plane;

        init_from_point(normal: Vec3, point: Point3D): Plane;

        init_from_points(a: Point3D, b: Point3D, c: Point3D): Plane;

        init_from_vec4(src: Vec4): Plane;

        negate(): Plane;

        normalize(): Plane;

        transform(matrix: Matrix, normal_matrix: Matrix | null): Plane;
    }


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

        static alloc(): Point;

        // Static methods
        static zero(): Point;

        // Methods
        distance(b: Point): [number, number, number];

        equal(b: Point): boolean;

        free(): void;

        init(x: number, y: number): Point;

        init_from_point(src: Point): Point;

        init_from_vec2(src: Vec2): Point;

        interpolate(b: Point, factor: number): Point;

        near(b: Point, epsilon: number): boolean;

        to_vec2(): Vec2;
    }


    class Point3D {
        static $gtype: GObject.GType<Point3D>;

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

        static alloc(): Point3D;

        // Static methods
        static zero(): Point3D;

        // Methods
        cross(b: Point3D): Point3D;

        distance(b: Point3D): [number, Vec3 | null];

        dot(b: Point3D): number;

        equal(b: Point3D): boolean;

        free(): void;

        init(x: number, y: number, z: number): Point3D;

        init_from_point(src: Point3D): Point3D;

        init_from_vec3(v: Vec3): Point3D;

        interpolate(b: Point3D, factor: number): Point3D;

        length(): number;

        near(b: Point3D, epsilon: number): boolean;

        normalize(): Point3D;

        normalize_viewport(viewport: Rect, z_near: number, z_far: number): Point3D;

        scale(factor: number): Point3D;

        to_vec3(): Vec3;
    }


    class Quad {
        static $gtype: GObject.GType<Quad>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static alloc(): Quad;

        // Methods
        bounds(): Rect;

        contains(p: Point): boolean;

        free(): void;

        get_point(index_: number): Point;

        init(p1: Point, p2: Point, p3: Point, p4: Point): Quad;

        init_from_points(points: Point[]): Quad;

        init_from_rect(r: Rect): Quad;
    }


    class Quaternion {
        static $gtype: GObject.GType<Quaternion>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static alloc(): Quaternion;

        // Methods
        add(b: Quaternion): Quaternion;

        dot(b: Quaternion): number;

        equal(b: Quaternion): boolean;

        free(): void;

        init(x: number, y: number, z: number, w: number): Quaternion;

        init_from_angle_vec3(angle: number, axis: Vec3): Quaternion;

        init_from_angles(deg_x: number, deg_y: number, deg_z: number): Quaternion;

        init_from_euler(e: Euler): Quaternion;

        init_from_matrix(m: Matrix): Quaternion;

        init_from_quaternion(src: Quaternion): Quaternion;

        init_from_radians(rad_x: number, rad_y: number, rad_z: number): Quaternion;

        init_from_vec4(src: Vec4): Quaternion;

        init_identity(): Quaternion;

        invert(): Quaternion;

        multiply(b: Quaternion): Quaternion;

        normalize(): Quaternion;

        scale(factor: number): Quaternion;

        slerp(b: Quaternion, factor: number): Quaternion;

        to_angle_vec3(): [number, Vec3];

        to_angles(): [number, number, number];

        to_matrix(): Matrix;

        to_radians(): [number, number, number];

        to_vec4(): Vec4;
    }


    class Ray {
        static $gtype: GObject.GType<Ray>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static alloc(): Ray;

        // Methods
        equal(b: Ray): boolean;

        free(): void;

        get_closest_point_to_point(p: Point3D): Point3D;

        get_direction(): Vec3;

        get_distance_to_plane(p: Plane): number;

        get_distance_to_point(p: Point3D): number;

        get_origin(): Point3D;

        get_position_at(t: number): Point3D;

        init(origin: Point3D | null, direction: Vec3 | null): Ray;

        init_from_ray(src: Ray): Ray;

        init_from_vec3(origin: Vec3 | null, direction: Vec3 | null): Ray;

        intersect_box(b: Box): [RayIntersectionKind, number];

        intersect_sphere(s: Sphere): [RayIntersectionKind, number];

        intersect_triangle(t: Triangle): [RayIntersectionKind, number];

        intersects_box(b: Box): boolean;

        intersects_sphere(s: Sphere): boolean;

        intersects_triangle(t: Triangle): boolean;
    }


    class Rect {
        static $gtype: GObject.GType<Rect>;

        // Fields
        origin: Point;

        size: Size;

        // Constructors

        constructor(properties?: Partial<{
            origin: Point;
            size: Size;
        }>);

        // Static methods
        static alloc(): Rect;

        static zero(): Rect;

        // Methods
        contains_point(p: Point): boolean;

        contains_rect(b: Rect): boolean;

        equal(b: Rect): boolean;

        expand(p: Point): Rect;

        free(): void;

        get_area(): number;

        get_bottom_left(): Point;

        get_bottom_right(): Point;

        get_center(): Point;

        get_height(): number;

        get_top_left(): Point;

        get_top_right(): Point;

        get_vertices(): Vec2[];

        get_width(): number;

        get_x(): number;

        get_y(): number;

        init(x: number, y: number, width: number, height: number): Rect;

        init_from_rect(src: Rect): Rect;

        inset(d_x: number, d_y: number): Rect;

        inset_r(d_x: number, d_y: number): Rect;

        interpolate(b: Rect, factor: number): Rect;

        intersection(b: Rect): [boolean, Rect | null];

        normalize(): Rect;

        normalize_r(): Rect;

        offset(d_x: number, d_y: number): Rect;

        offset_r(d_x: number, d_y: number): Rect;

        round(): Rect;

        round_extents(): Rect;

        round_to_pixel(): Rect;

        scale(s_h: number, s_v: number): Rect;

        union(b: Rect): Rect;
    }


    class Simd4F {
        static $gtype: GObject.GType<Simd4F>;

        // Constructors
        constructor(properties?: Partial<{}>);
    }


    class Simd4X4F {
        static $gtype: GObject.GType<Simd4X4F>;
    }


    class Size {
        static $gtype: GObject.GType<Size>;

        // Fields
        width: number;

        height: number;

        // Constructors

        constructor(properties?: Partial<{
            width: number;
            height: number;
        }>);

        static alloc(): Size;

        // Static methods
        static zero(): Size;

        // Methods
        equal(b: Size): boolean;

        free(): void;

        init(width: number, height: number): Size;

        init_from_size(src: Size): Size;

        interpolate(b: Size, factor: number): Size;

        scale(factor: number): Size;
    }


    class Sphere {
        static $gtype: GObject.GType<Sphere>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static alloc(): Sphere;

        // Methods
        contains_point(point: Point3D): boolean;

        distance(point: Point3D): number;

        equal(b: Sphere): boolean;

        free(): void;

        get_bounding_box(): Box;

        get_center(): Point3D;

        get_radius(): number;

        init(center: Point3D | null, radius: number): Sphere;

        init_from_points(points: Point3D[], center: Point3D | null): Sphere;

        init_from_vectors(vectors: Vec3[], center: Point3D | null): Sphere;

        is_empty(): boolean;

        translate(point: Point3D): Sphere;
    }


    class Triangle {
        static $gtype: GObject.GType<Triangle>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static alloc(): Triangle;

        // Methods
        contains_point(p: Point3D): boolean;

        equal(b: Triangle): boolean;

        free(): void;

        get_area(): number;

        get_barycoords(p: Point3D | null): [boolean, Vec2];

        get_bounding_box(): Box;

        get_midpoint(): Point3D;

        get_normal(): Vec3;

        get_plane(): Plane;

        get_points(): [Point3D | null, Point3D | null, Point3D | null];

        get_uv(p: Point3D | null, uv_a: Vec2, uv_b: Vec2, uv_c: Vec2): [boolean, Vec2];

        get_vertices(): [Vec3 | null, Vec3 | null, Vec3 | null];

        init_from_float(a: number[], b: number[], c: number[]): Triangle;

        init_from_point3d(a: Point3D | null, b: Point3D | null, c: Point3D | null): Triangle;

        init_from_vec3(a: Vec3 | null, b: Vec3 | null, c: Vec3 | null): Triangle;
    }


    class Vec2 {
        static $gtype: GObject.GType<Vec2>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static alloc(): Vec2;

        // Static methods
        static one(): Vec2;

        static x_axis(): Vec2;

        static y_axis(): Vec2;

        static zero(): Vec2;

        // Methods
        add(b: Vec2): Vec2;

        divide(b: Vec2): Vec2;

        dot(b: Vec2): number;

        equal(v2: Vec2): boolean;

        free(): void;

        get_x(): number;

        get_y(): number;

        init(x: number, y: number): Vec2;

        init_from_float(src: number[]): Vec2;

        init_from_vec2(src: Vec2): Vec2;

        interpolate(v2: Vec2, factor: number): Vec2;

        length(): number;

        max(b: Vec2): Vec2;

        min(b: Vec2): Vec2;

        multiply(b: Vec2): Vec2;

        near(v2: Vec2, epsilon: number): boolean;

        negate(): Vec2;

        normalize(): Vec2;

        scale(factor: number): Vec2;

        subtract(b: Vec2): Vec2;

        to_float(): number[];
    }


    class Vec3 {
        static $gtype: GObject.GType<Vec3>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static alloc(): Vec3;

        // Static methods
        static one(): Vec3;

        static x_axis(): Vec3;

        static y_axis(): Vec3;

        static z_axis(): Vec3;

        static zero(): Vec3;

        // Methods
        add(b: Vec3): Vec3;

        cross(b: Vec3): Vec3;

        divide(b: Vec3): Vec3;

        dot(b: Vec3): number;

        equal(v2: Vec3): boolean;

        free(): void;

        get_x(): number;

        get_xy(): Vec2;

        get_xy0(): Vec3;

        get_xyz0(): Vec4;

        get_xyz1(): Vec4;

        get_xyzw(w: number): Vec4;

        get_y(): number;

        get_z(): number;

        init(x: number, y: number, z: number): Vec3;

        init_from_float(src: number[]): Vec3;

        init_from_vec3(src: Vec3): Vec3;

        interpolate(v2: Vec3, factor: number): Vec3;

        length(): number;

        max(b: Vec3): Vec3;

        min(b: Vec3): Vec3;

        multiply(b: Vec3): Vec3;

        near(v2: Vec3, epsilon: number): boolean;

        negate(): Vec3;

        normalize(): Vec3;

        scale(factor: number): Vec3;

        subtract(b: Vec3): Vec3;

        to_float(): number[];
    }


    class Vec4 {
        static $gtype: GObject.GType<Vec4>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static alloc(): Vec4;

        // Static methods
        static one(): Vec4;

        static w_axis(): Vec4;

        static x_axis(): Vec4;

        static y_axis(): Vec4;

        static z_axis(): Vec4;

        static zero(): Vec4;

        // Methods
        add(b: Vec4): Vec4;

        divide(b: Vec4): Vec4;

        dot(b: Vec4): number;

        equal(v2: Vec4): boolean;

        free(): void;

        get_w(): number;

        get_x(): number;

        get_xy(): Vec2;

        get_xyz(): Vec3;

        get_y(): number;

        get_z(): number;

        init(x: number, y: number, z: number, w: number): Vec4;

        init_from_float(src: number[]): Vec4;

        init_from_vec2(src: Vec2, z: number, w: number): Vec4;

        init_from_vec3(src: Vec3, w: number): Vec4;

        init_from_vec4(src: Vec4): Vec4;

        interpolate(v2: Vec4, factor: number): Vec4;

        length(): number;

        max(b: Vec4): Vec4;

        min(b: Vec4): Vec4;

        multiply(b: Vec4): Vec4;

        near(v2: Vec4, epsilon: number): boolean;

        negate(): Vec4;

        normalize(): Vec4;

        scale(factor: number): Vec4;

        subtract(b: Vec4): Vec4;

        to_float(): number[];
    }


    const __name__: string;

    const __version__: string;
}

export default Graphene;

}

declare module 'gi://Graphene' {
    import Graphene10 from 'gi://Graphene?version=1.0';
    export default Graphene10;
}
// END
