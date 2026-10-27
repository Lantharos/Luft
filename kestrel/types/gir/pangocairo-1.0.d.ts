/// <reference path="./cairo-1.0.d.ts" />
/// <reference path="./cairo.d.ts" />
/// <reference path="./gobject-2.0.d.ts" />
/// <reference path="./glib-2.0.d.ts" />
/// <reference path="./pango-1.0.d.ts" />
/// <reference path="./harfbuzz-0.0.d.ts" />
/// <reference path="./freetype2-2.0.d.ts" />
/// <reference path="./gio-2.0.d.ts" />
/// <reference path="./gmodule-2.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://PangoCairo?version=1.0' {

// Module dependencies
import type cairo from 'cairo';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type Pango from 'gi://Pango?version=1.0';
import type HarfBuzz from 'gi://HarfBuzz?version=0.0';
import type freetype2 from 'gi://freetype2?version=2.0';
import type Gio from 'gi://Gio?version=2.0';
import type GModule from 'gi://GModule?version=2.0';

export namespace PangoCairo {

    /**
     * PangoCairo-1.0
     */


    function context_get_font_options(context: Pango.Context): cairo.FontOptions | null;

    function context_get_resolution(context: Pango.Context): number;

    function context_set_font_options(context: Pango.Context, options: cairo.FontOptions | null): void;

    function context_set_resolution(context: Pango.Context, dpi: number): void;

    function context_set_shape_renderer(context: Pango.Context, func: ShapeRendererFunc | null): void;

    function create_context(cr: cairo.Context): Pango.Context;

    function create_layout(cr: cairo.Context): Pango.Layout;

    function error_underline_path(cr: cairo.Context, x: number, y: number, width: number, height: number): void;

    function font_map_get_default(): Pango.FontMap;

    function font_map_new(): Pango.FontMap;

    function font_map_new_for_font_type(fonttype: cairo.FontType): Pango.FontMap | null;

    function glyph_string_path(cr: cairo.Context, font: Pango.Font, glyphs: Pango.GlyphString): void;

    function layout_line_path(cr: cairo.Context, line: Pango.LayoutLine): void;

    function layout_path(cr: cairo.Context, layout: Pango.Layout): void;

    function layout_path_for_components(cr: cairo.Context, layout: Pango.Layout, components: Pango.RenderComponent): void;

    function show_error_underline(cr: cairo.Context, x: number, y: number, width: number, height: number): void;

    function show_glyph_item(cr: cairo.Context, text: string, glyph_item: Pango.GlyphItem): void;

    function show_glyph_string(cr: cairo.Context, font: Pango.Font, glyphs: Pango.GlyphString): void;

    function show_layout(cr: cairo.Context, layout: Pango.Layout): void;

    function show_layout_line(cr: cairo.Context, line: Pango.LayoutLine): void;

    function update_context(cr: cairo.Context, context: Pango.Context): void;

    function update_layout(cr: cairo.Context, layout: Pango.Layout): void;

    interface ShapeRendererFunc {
        (cr: cairo.Context, attr: Pango.AttrShape, do_path: boolean): void;
    }

    namespace Font {

        // Constructor properties interface
        interface ConstructorProps extends Pango.Font.ConstructorProps {}
    }

    export interface FontNamespace {
        $gtype: GObject.GType<Font>;
        prototype: Font;
    }
    interface Font extends Pango.Font {

        // Methods
        get_scaled_font(): cairo.ScaledFont | null;
    }


    export const Font: FontNamespace & {
        new (): Font; // This allows `obj instanceof Font`
    };

    namespace FontMap {

        // Constructor properties interface
        interface ConstructorProps<A extends GObject.Object = GObject.Object> extends Pango.FontMap.ConstructorProps<A> {}
    }

    export interface FontMapNamespace {
        $gtype: GObject.GType<FontMap>;
        prototype: FontMap;
        get_default(): Pango.FontMap;
        ["new"](): Pango.FontMap;
        new_for_font_type(fonttype: cairo.FontType): Pango.FontMap | null;
    }
    interface FontMap<A extends GObject.Object = GObject.Object> extends Pango.FontMap {

        // Methods
        get_font_type(): cairo.FontType;

        get_resolution(): number;

        set_default(): void;

        set_resolution(dpi: number): void;
    }


    export const FontMap: FontMapNamespace & {
        new (): FontMap; // This allows `obj instanceof FontMap`
    };

    const __name__: string;

    const __version__: string;
}

export default PangoCairo;

}

declare module 'gi://PangoCairo' {
    import PangoCairo10 from 'gi://PangoCairo?version=1.0';
    export default PangoCairo10;
}
// END
