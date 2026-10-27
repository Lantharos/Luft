/// <reference path="./cairo-1.0.d.ts" />
/// <reference path="./cairo.d.ts" />
/// <reference path="./gobject-2.0.d.ts" />
/// <reference path="./glib-2.0.d.ts" />
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

declare module 'gi://Pango?version=1.0' {

// Module dependencies
import type cairo from 'cairo';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';
import type HarfBuzz from 'gi://HarfBuzz?version=0.0';
import type freetype2 from 'gi://freetype2?version=2.0';
import type Gio from 'gi://Gio?version=2.0';
import type GModule from 'gi://GModule?version=2.0';

export namespace Pango {

    /**
     * Pango-1.0
     */


    export namespace Alignment {
        export const $gtype: GObject.GType<Alignment>;
    }

    enum Alignment {
        LEFT = 0,
        CENTER = 1,
        RIGHT = 2,
    }


    export namespace AttrType {
        export const $gtype: GObject.GType<AttrType>;
    }

    enum AttrType {
        INVALID = 0,
        LANGUAGE = 1,
        FAMILY = 2,
        STYLE = 3,
        WEIGHT = 4,
        VARIANT = 5,
        STRETCH = 6,
        SIZE = 7,
        FONT_DESC = 8,
        FOREGROUND = 9,
        BACKGROUND = 10,
        UNDERLINE = 11,
        STRIKETHROUGH = 12,
        RISE = 13,
        SHAPE = 14,
        SCALE = 15,
        FALLBACK = 16,
        LETTER_SPACING = 17,
        UNDERLINE_COLOR = 18,
        STRIKETHROUGH_COLOR = 19,
        ABSOLUTE_SIZE = 20,
        GRAVITY = 21,
        GRAVITY_HINT = 22,
        FONT_FEATURES = 23,
        FOREGROUND_ALPHA = 24,
        BACKGROUND_ALPHA = 25,
        ALLOW_BREAKS = 26,
        SHOW = 27,
        INSERT_HYPHENS = 28,
        OVERLINE = 29,
        OVERLINE_COLOR = 30,
        LINE_HEIGHT = 31,
        ABSOLUTE_LINE_HEIGHT = 32,
        TEXT_TRANSFORM = 33,
        WORD = 34,
        SENTENCE = 35,
        BASELINE_SHIFT = 36,
        FONT_SCALE = 37,
        WIDTH = 38,
    }


    export namespace BaselineShift {
        export const $gtype: GObject.GType<BaselineShift>;
    }

    enum BaselineShift {
        NONE = 0,
        SUPERSCRIPT = 1,
        SUBSCRIPT = 2,
    }


    export namespace BidiType {
        export const $gtype: GObject.GType<BidiType>;
    }

    enum BidiType {
        L = 0,
        LRE = 1,
        LRO = 2,
        R = 3,
        AL = 4,
        RLE = 5,
        RLO = 6,
        PDF = 7,
        EN = 8,
        ES = 9,
        ET = 10,
        AN = 11,
        CS = 12,
        NSM = 13,
        BN = 14,
        B = 15,
        S = 16,
        WS = 17,
        ON = 18,
        LRI = 19,
        RLI = 20,
        FSI = 21,
        PDI = 22,
    }


    export namespace CoverageLevel {
        export const $gtype: GObject.GType<CoverageLevel>;
    }

    enum CoverageLevel {
        NONE = 0,
        FALLBACK = 1,
        APPROXIMATE = 2,
        EXACT = 3,
    }


    export namespace Direction {
        export const $gtype: GObject.GType<Direction>;
    }

    enum Direction {
        LTR = 0,
        RTL = 1,
        TTB_LTR = 2,
        TTB_RTL = 3,
        WEAK_LTR = 4,
        WEAK_RTL = 5,
        NEUTRAL = 6,
    }


    export namespace EllipsizeMode {
        export const $gtype: GObject.GType<EllipsizeMode>;
    }

    enum EllipsizeMode {
        NONE = 0,
        START = 1,
        MIDDLE = 2,
        END = 3,
    }


    export namespace FontColor {
        export const $gtype: GObject.GType<FontColor>;
    }

    enum FontColor {
        FORBIDDEN = 0,
        REQUIRED = 1,
        DONT_CARE = 2,
    }


    export namespace FontScale {
        export const $gtype: GObject.GType<FontScale>;
    }

    enum FontScale {
        NONE = 0,
        SUPERSCRIPT = 1,
        SUBSCRIPT = 2,
        SMALL_CAPS = 3,
    }


    export namespace Gravity {
        export const $gtype: GObject.GType<Gravity>;
    }

    enum Gravity {
        SOUTH = 0,
        EAST = 1,
        NORTH = 2,
        WEST = 3,
        AUTO = 4,
    }


    export namespace GravityHint {
        export const $gtype: GObject.GType<GravityHint>;
    }

    enum GravityHint {
        NATURAL = 0,
        STRONG = 1,
        LINE = 2,
    }


    class LayoutDeserializeError extends GLib.Error {
        static $gtype: GObject.GType<GLib.Error>;

        // Static fields
        static INVALID: number;

        static INVALID_VALUE: number;

        static MISSING_VALUE: number;

        // Constructors
        constructor(options: { message: string; code: number });

        // Static methods
        static quark(): GLib.Quark;
    }


    export namespace Overline {
        export const $gtype: GObject.GType<Overline>;
    }

    enum Overline {
        NONE = 0,
        SINGLE = 1,
    }


    export namespace RenderPart {
        export const $gtype: GObject.GType<RenderPart>;
    }

    enum RenderPart {
        FOREGROUND = 0,
        BACKGROUND = 1,
        UNDERLINE = 2,
        STRIKETHROUGH = 3,
        OVERLINE = 4,
    }


    export namespace Script {
        export const $gtype: GObject.GType<Script>;
    }

    enum Script {
        INVALID_CODE = -1,
        COMMON = 0,
        INHERITED = 1,
        ARABIC = 2,
        ARMENIAN = 3,
        BENGALI = 4,
        BOPOMOFO = 5,
        CHEROKEE = 6,
        COPTIC = 7,
        CYRILLIC = 8,
        DESERET = 9,
        DEVANAGARI = 10,
        ETHIOPIC = 11,
        GEORGIAN = 12,
        GOTHIC = 13,
        GREEK = 14,
        GUJARATI = 15,
        GURMUKHI = 16,
        HAN = 17,
        HANGUL = 18,
        HEBREW = 19,
        HIRAGANA = 20,
        KANNADA = 21,
        KATAKANA = 22,
        KHMER = 23,
        LAO = 24,
        LATIN = 25,
        MALAYALAM = 26,
        MONGOLIAN = 27,
        MYANMAR = 28,
        OGHAM = 29,
        OLD_ITALIC = 30,
        ORIYA = 31,
        RUNIC = 32,
        SINHALA = 33,
        SYRIAC = 34,
        TAMIL = 35,
        TELUGU = 36,
        THAANA = 37,
        THAI = 38,
        TIBETAN = 39,
        CANADIAN_ABORIGINAL = 40,
        YI = 41,
        TAGALOG = 42,
        HANUNOO = 43,
        BUHID = 44,
        TAGBANWA = 45,
        BRAILLE = 46,
        CYPRIOT = 47,
        LIMBU = 48,
        OSMANYA = 49,
        SHAVIAN = 50,
        LINEAR_B = 51,
        TAI_LE = 52,
        UGARITIC = 53,
        NEW_TAI_LUE = 54,
        BUGINESE = 55,
        GLAGOLITIC = 56,
        TIFINAGH = 57,
        SYLOTI_NAGRI = 58,
        OLD_PERSIAN = 59,
        KHAROSHTHI = 60,
        UNKNOWN = 61,
        BALINESE = 62,
        CUNEIFORM = 63,
        PHOENICIAN = 64,
        PHAGS_PA = 65,
        NKO = 66,
        KAYAH_LI = 67,
        LEPCHA = 68,
        REJANG = 69,
        SUNDANESE = 70,
        SAURASHTRA = 71,
        CHAM = 72,
        OL_CHIKI = 73,
        VAI = 74,
        CARIAN = 75,
        LYCIAN = 76,
        LYDIAN = 77,
        BATAK = 78,
        BRAHMI = 79,
        MANDAIC = 80,
        CHAKMA = 81,
        MEROITIC_CURSIVE = 82,
        MEROITIC_HIEROGLYPHS = 83,
        MIAO = 84,
        SHARADA = 85,
        SORA_SOMPENG = 86,
        TAKRI = 87,
        BASSA_VAH = 88,
        CAUCASIAN_ALBANIAN = 89,
        DUPLOYAN = 90,
        ELBASAN = 91,
        GRANTHA = 92,
        KHOJKI = 93,
        KHUDAWADI = 94,
        LINEAR_A = 95,
        MAHAJANI = 96,
        MANICHAEAN = 97,
        MENDE_KIKAKUI = 98,
        MODI = 99,
        MRO = 100,
        NABATAEAN = 101,
        OLD_NORTH_ARABIAN = 102,
        OLD_PERMIC = 103,
        PAHAWH_HMONG = 104,
        PALMYRENE = 105,
        PAU_CIN_HAU = 106,
        PSALTER_PAHLAVI = 107,
        SIDDHAM = 108,
        TIRHUTA = 109,
        WARANG_CITI = 110,
        AHOM = 111,
        ANATOLIAN_HIEROGLYPHS = 112,
        HATRAN = 113,
        MULTANI = 114,
        OLD_HUNGARIAN = 115,
        SIGNWRITING = 116,
    }


    export namespace Stretch {
        export const $gtype: GObject.GType<Stretch>;
    }

    enum Stretch {
        ULTRA_CONDENSED = 0,
        EXTRA_CONDENSED = 1,
        CONDENSED = 2,
        SEMI_CONDENSED = 3,
        NORMAL = 4,
        SEMI_EXPANDED = 5,
        EXPANDED = 6,
        EXTRA_EXPANDED = 7,
        ULTRA_EXPANDED = 8,
    }


    export namespace Style {
        export const $gtype: GObject.GType<Style>;
    }

    enum Style {
        NORMAL = 0,
        OBLIQUE = 1,
        ITALIC = 2,
    }


    export namespace TabAlign {
        export const $gtype: GObject.GType<TabAlign>;
    }

    enum TabAlign {
        LEFT = 0,
        RIGHT = 1,
        CENTER = 2,
        DECIMAL = 3,
    }


    export namespace TextTransform {
        export const $gtype: GObject.GType<TextTransform>;
    }

    enum TextTransform {
        NONE = 0,
        LOWERCASE = 1,
        UPPERCASE = 2,
        CAPITALIZE = 3,
    }


    export namespace Underline {
        export const $gtype: GObject.GType<Underline>;
    }

    enum Underline {
        NONE = 0,
        SINGLE = 1,
        DOUBLE = 2,
        LOW = 3,
        ERROR = 4,
        SINGLE_LINE = 5,
        DOUBLE_LINE = 6,
        ERROR_LINE = 7,
    }


    export namespace Variant {
        export const $gtype: GObject.GType<Variant>;
    }

    enum Variant {
        NORMAL = 0,
        SMALL_CAPS = 1,
        ALL_SMALL_CAPS = 2,
        PETITE_CAPS = 3,
        ALL_PETITE_CAPS = 4,
        UNICASE = 5,
        TITLE_CAPS = 6,
    }


    export namespace Weight {
        export const $gtype: GObject.GType<Weight>;
    }

    enum Weight {
        THIN = 100,
        ULTRALIGHT = 200,
        LIGHT = 300,
        SEMILIGHT = 350,
        BOOK = 380,
        NORMAL = 400,
        MEDIUM = 500,
        SEMIBOLD = 600,
        BOLD = 700,
        ULTRABOLD = 800,
        HEAVY = 900,
        ULTRAHEAVY = 1000,
    }


    export namespace Width {
        export const $gtype: GObject.GType<Width>;
    }

    enum Width {
        ULTRA_CONDENSED = 500,
        EXTRA_CONDENSED = 625,
        CONDENSED = 750,
        SEMI_CONDENSED = 875,
        NORMAL = 1000,
        SEMI_EXPANDED = 1125,
        EXPANDED = 1250,
        EXTRA_EXPANDED = 1500,
        ULTRA_EXPANDED = 2000,
    }


    export namespace WrapMode {
        export const $gtype: GObject.GType<WrapMode>;
    }

    enum WrapMode {
        WORD = 0,
        CHAR = 1,
        WORD_CHAR = 2,
        NONE = 3,
    }


    const ANALYSIS_FLAG_CENTERED_BASELINE: number;

    const ANALYSIS_FLAG_IS_ELLIPSIS: number;

    const ANALYSIS_FLAG_NEED_HYPHEN: number;

    const ATTR_INDEX_FROM_TEXT_BEGINNING: number;

    const ATTR_INDEX_TO_TEXT_END: number;

    const GLYPH_EMPTY: Glyph;

    const GLYPH_INVALID_INPUT: Glyph;

    const GLYPH_UNKNOWN_FLAG: Glyph;

    const RENDER_COMPONENT_ALL: number;

    const SCALE: number;

    const VERSION_MAJOR: number;

    const VERSION_MICRO: number;

    const VERSION_MINOR: number;

    const VERSION_STRING: string;

    function attr_allow_breaks_new(allow_breaks: boolean): Attribute;

    function attr_background_alpha_new(alpha: number): Attribute;

    function attr_background_new(red: number, green: number, blue: number): Attribute;

    function attr_baseline_shift_new(shift: number): Attribute;

    function attr_break(text: string, length: number, attr_list: AttrList, offset: number): LogAttr[];

    function attr_fallback_new(enable_fallback: boolean): Attribute;

    function attr_family_new(family: string): Attribute;

    function attr_font_desc_new(desc: FontDescription): Attribute;

    function attr_font_features_new(features: string): Attribute;

    function attr_font_scale_new(scale: FontScale): Attribute;

    function attr_foreground_alpha_new(alpha: number): Attribute;

    function attr_foreground_new(red: number, green: number, blue: number): Attribute;

    function attr_gravity_hint_new(hint: GravityHint): Attribute;

    function attr_gravity_new(gravity: Gravity): Attribute;

    function attr_insert_hyphens_new(insert_hyphens: boolean): Attribute;

    function attr_language_new(language: Language): Attribute;

    function attr_letter_spacing_new(letter_spacing: number): Attribute;

    function attr_line_height_new(factor: number): Attribute;

    function attr_line_height_new_absolute(height: number): Attribute;

    function attr_list_from_string(text: string): AttrList | null;

    function attr_overline_color_new(red: number, green: number, blue: number): Attribute;

    function attr_overline_new(overline: Overline): Attribute;

    function attr_rise_new(rise: number): Attribute;

    function attr_scale_new(scale_factor: number): Attribute;

    function attr_sentence_new(): Attribute;

    function attr_shape_new(ink_rect: Rectangle, logical_rect: Rectangle): Attribute;

    function attr_shape_new_with_data(ink_rect: Rectangle, logical_rect: Rectangle, data: null, copy_func: AttrDataCopyFunc | null): Attribute;

    function attr_show_new(flags: ShowFlags): Attribute;

    function attr_size_new(size: number): Attribute;

    function attr_size_new_absolute(size: number): Attribute;

    function attr_stretch_new(stretch: Stretch): Attribute;

    function attr_strikethrough_color_new(red: number, green: number, blue: number): Attribute;

    function attr_strikethrough_new(strikethrough: boolean): Attribute;

    function attr_style_new(style: Style): Attribute;

    function attr_text_transform_new(transform: TextTransform): Attribute;

    function attr_type_get_name(type: AttrType): string | null;

    function attr_type_register(name: string): AttrType;

    function attr_underline_color_new(red: number, green: number, blue: number): Attribute;

    function attr_underline_new(underline: Underline): Attribute;

    function attr_variant_new(variant: Variant): Attribute;

    function attr_weight_new(weight: Weight): Attribute;

    function attr_width_new(width: Width): Attribute;

    function attr_word_new(): Attribute;

    function bidi_type_for_unichar(ch: string): BidiType;

    function __break(text: string, length: number, analysis: Analysis): LogAttr[];

    function default_break(text: string, length: number, analysis: Analysis | null): LogAttr[];

    function extents_to_pixels(inclusive?: Rectangle, nearest?: Rectangle): [Rectangle, Rectangle];

    function find_base_dir(text: string, length: number): Direction;

    function find_paragraph_boundary(text: string, length: number): [number, number];

    function font_description_from_string(str: string): FontDescription;

    function get_log_attrs(text: string, length: number, level: number, language: Language): LogAttr[];

    function get_mirror_char(ch: string): [boolean, string];

    function gravity_get_for_matrix(matrix: Matrix | null): Gravity;

    function gravity_get_for_script(script: Script, base_gravity: Gravity, hint: GravityHint): Gravity;

    function gravity_get_for_script_and_width(script: Script, wide: boolean, base_gravity: Gravity, hint: GravityHint): Gravity;

    function gravity_to_rotation(gravity: Gravity): number;

    function is_zero_width(ch: string): boolean;

    function itemize(context: Context, text: string, start_index: number, length: number, attrs: AttrList, cached_iter: AttrIterator | null): Item[];

    function itemize_with_base_dir(context: Context, base_dir: Direction, text: string, start_index: number, length: number, attrs: AttrList, cached_iter: AttrIterator | null): Item[];

    function language_from_string(language: string | null): Language | null;

    function language_get_default(): Language;

    function language_get_preferred(): Language[] | null;

    function layout_deserialize_error_quark(): GLib.Quark;

    function log2vis_get_embedding_levels(text: string, length: number, pbase_dir: Direction): [Uint8Array, Direction];

    function markup_parser_finish(context: GLib.MarkupParseContext): [boolean, AttrList | null, string, string];

    function markup_parser_new(accel_marker: string): GLib.MarkupParseContext;

    function parse_enum(type: GObject.GType, str: string | null, warn: boolean): [boolean, number, string];

    function parse_markup(markup_text: string, length: number, accel_marker: string): [boolean, AttrList | null, string, string];

    function parse_stretch(str: string, warn: boolean): [boolean, Stretch];

    function parse_style(str: string, warn: boolean): [boolean, Style];

    function parse_variant(str: string, warn: boolean): [boolean, Variant];

    function parse_weight(str: string, warn: boolean): [boolean, Weight];

    function quantize_line_geometry(thickness: number, position: number): [number, number];

    function read_line(stream: null, str: GLib.String): number;

    function reorder_items(items: Item[]): Item[];

    function scan_int(pos: string): [boolean, string, number];

    function scan_string(pos: string, out: GLib.String): [boolean, string];

    function scan_word(pos: string, out: GLib.String): [boolean, string];

    function script_for_unichar(ch: string): Script;

    function script_get_sample_language(script: Script): Language | null;

    function shape(text: string, length: number, analysis: Analysis): GlyphString;

    function shape_full(item_text: string, item_length: number, paragraph_text: string | null, paragraph_length: number, analysis: Analysis): GlyphString;

    function shape_item(item: Item, paragraph_text: string | null, paragraph_length: number, log_attrs: LogAttr | null, flags: ShapeFlags): GlyphString;

    function shape_with_flags(item_text: string, item_length: number, paragraph_text: string | null, paragraph_length: number, analysis: Analysis, flags: ShapeFlags): GlyphString;

    function skip_space(pos: string): [boolean, string];

    function split_file_list(str: string): string[];

    function tab_array_from_string(text: string): TabArray | null;

    function tailor_break(text: string, length: number, analysis: Analysis, offset: number): LogAttr[];

    function trim_string(str: string): string;

    function unichar_direction(ch: string): Direction;

    function units_from_double(d: number): number;

    function units_to_double(i: number): number;

    function version(): number;

    function version_check(required_major: number, required_minor: number, required_micro: number): string | null;

    function version_string(): string;

    interface AttrDataCopyFunc {
        (user_data: null): null;
    }

    interface AttrFilterFunc {
        (attribute: Attribute): boolean;
    }

    interface FontsetForeachFunc {
        (fontset: Fontset, font: Font): boolean;
    }

    export namespace FontMask {
        export const $gtype: GObject.GType<FontMask>;
    }

    enum FontMask {
        FAMILY = 1,
        STYLE = 2,
        VARIANT = 4,
        WEIGHT = 8,
        WIDTH = 16,
        STRETCH = 16,
        SIZE = 32,
        GRAVITY = 64,
        VARIATIONS = 128,
        FEATURES = 256,
        COLOR = 512,
    }


    export namespace LayoutDeserializeFlags {
        export const $gtype: GObject.GType<LayoutDeserializeFlags>;
    }

    enum LayoutDeserializeFlags {
        DEFAULT = 0,
        CONTEXT = 1,
    }


    export namespace LayoutSerializeFlags {
        export const $gtype: GObject.GType<LayoutSerializeFlags>;
    }

    enum LayoutSerializeFlags {
        DEFAULT = 0,
        CONTEXT = 1,
        OUTPUT = 2,
    }


    export namespace RenderComponent {
        export const $gtype: GObject.GType<RenderComponent>;
    }

    enum RenderComponent {
        NONE = 0,
        PLAIN_GLYPH = 2,
        COLOR_GLYPH = 4,
        BACKGROUND = 8,
        UNDERLINE = 8,
        STRIKETHROUGH = 16,
        OVERLINE = 32,
    }


    export namespace ShapeFlags {
        export const $gtype: GObject.GType<ShapeFlags>;
    }

    enum ShapeFlags {
        NONE = 0,
        ROUND_POSITIONS = 1,
    }


    export namespace ShowFlags {
        export const $gtype: GObject.GType<ShowFlags>;
    }

    enum ShowFlags {
        NONE = 0,
        SPACES = 1,
        LINE_BREAKS = 2,
        IGNORABLES = 4,
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

        static ["new"](): Context;

        // Signals
        /** @signal */
        connect<K extends keyof Context.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Context.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Context.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Context.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Context.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Context.SignalSignatures[K]>): void;

        // Methods
        changed(): void;

        get_base_dir(): Direction;

        get_base_gravity(): Gravity;

        get_font_description(): FontDescription | null;

        get_font_map(): FontMap | null;

        get_gravity(): Gravity;

        get_gravity_hint(): GravityHint;

        get_language(): Language;

        get_matrix(): Matrix | null;

        get_metrics(desc: FontDescription | null, language: Language | null): FontMetrics;

        get_round_glyph_positions(): boolean;

        get_serial(): number;

        list_families(): FontFamily[];

        load_font(desc: FontDescription): Font | null;

        load_fontset(desc: FontDescription, language: Language): Fontset | null;

        set_base_dir(direction: Direction): void;

        set_base_gravity(gravity: Gravity): void;

        set_font_description(desc: FontDescription): void;

        set_font_map(font_map: FontMap | null): void;

        set_gravity_hint(hint: GravityHint): void;

        set_language(language: Language | null): void;

        set_matrix(matrix: Matrix | null): void;

        set_round_glyph_positions(round_positions: boolean): void;
    }


    namespace Coverage {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Coverage extends GObject.Object {
        static $gtype: GObject.GType<Coverage>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Coverage.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Coverage.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](): Coverage;

        // Signals
        /** @signal */
        connect<K extends keyof Coverage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Coverage.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Coverage.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Coverage.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Coverage.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Coverage.SignalSignatures[K]>): void;

        // Static methods
        static from_bytes(bytes: Uint8Array | string): Coverage | null;

        // Methods
        copy(): Coverage;

        get(index_: number): CoverageLevel;

        max(other: Coverage): void;

        ref(): Coverage;

        set(index_: number, level: CoverageLevel): void;

    // Conflicted with GObject.Object.set
        set(...args: never[]): any;

        to_bytes(): Uint8Array;

        unref(): void;
    }


    namespace Font {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class Font extends GObject.Object {
        static $gtype: GObject.GType<Font>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Font.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Font.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Font.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Font.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Font.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Font.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Font.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Font.SignalSignatures[K]>): void;

        // Static methods
        static descriptions_free(descs: FontDescription[] | null): void;

        static deserialize(context: Context, bytes: GLib.Bytes | Uint8Array): Font | null;

        // Virtual methods
        vfunc_create_hb_font(): HarfBuzz.font_t;

        vfunc_describe(): FontDescription;

        vfunc_describe_absolute(): FontDescription;

        vfunc_get_coverage(language: Language): Coverage;

        vfunc_get_features(num_features: number): [HarfBuzz.feature_t[], number];

        vfunc_get_font_map(): FontMap | null;

        vfunc_get_glyph_extents(glyph: Glyph): [Rectangle | null, Rectangle | null];

        vfunc_get_metrics(language: Language | null): FontMetrics;

        // Methods
        describe(): FontDescription;

        describe_with_absolute_size(): FontDescription;

        get_coverage(language: Language): Coverage;

        get_face(): FontFace | null;

        get_features(num_features: number): [HarfBuzz.feature_t[], number];

        get_font_map(): FontMap | null;

        get_glyph_extents(glyph: Glyph): [Rectangle | null, Rectangle | null];

        get_languages(): Language[] | null;

        get_metrics(language: Language | null): FontMetrics;

        has_char(wc: string): boolean;

        serialize(): GLib.Bytes;
    }


    namespace FontFace {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class FontFace extends GObject.Object {
        static $gtype: GObject.GType<FontFace>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FontFace.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FontFace.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FontFace.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FontFace.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FontFace.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FontFace.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FontFace.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FontFace.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_describe(): FontDescription;

        vfunc_get_face_name(): string;

        vfunc_get_family(): FontFamily;

        vfunc_is_synthesized(): boolean;

        vfunc_list_sizes(): number[] | null;

        // Methods
        describe(): FontDescription;

        get_face_name(): string;

        get_family(): FontFamily;

        is_synthesized(): boolean;

        list_sizes(): number[] | null;
    }


    namespace FontFamily {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, Gio.ListModel.SignalSignatures {
            "notify::is-monospace": (pspec: GObject.ParamSpec) => void;
            "notify::is-variable": (pspec: GObject.ParamSpec) => void;
            "notify::item-type": (pspec: GObject.ParamSpec) => void;
            "notify::n-items": (pspec: GObject.ParamSpec) => void;
            "notify::name": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps<A extends GObject.Object = GObject.Object> extends GObject.Object.ConstructorProps, Gio.ListModel.ConstructorProps {
            is_monospace: boolean;
            isMonospace: boolean;
            is_variable: boolean;
            isVariable: boolean;
            item_type: GObject.GTypeInput;
            itemType: GObject.GTypeInput;
            n_items: number;
            nItems: number;
            name: string;
        }
    }

    abstract class FontFamily<A extends GObject.Object = GObject.Object> extends GObject.Object implements Gio.ListModel<A> {
        static $gtype: GObject.GType<FontFamily>;

        // Properties
        get is_monospace(): boolean;

        get isMonospace(): boolean;

        get is_variable(): boolean;

        get isVariable(): boolean;

        get item_type(): GObject.GType;

        get itemType(): GObject.GType;

        get n_items(): number;

        get nItems(): number;

        get name(): string;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FontFamily.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FontFamily.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FontFamily.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FontFamily.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FontFamily.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FontFamily.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FontFamily.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FontFamily.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_get_face(name: string | null): FontFace | null;

        vfunc_get_name(): string;

        vfunc_is_monospace(): boolean;

        vfunc_is_variable(): boolean;

        vfunc_list_faces(): FontFace[] | null;

        // Methods
        get_face(name: string | null): FontFace | null;

        get_name(): string;

        list_faces(): FontFace[] | null;

        get_item_type(): GObject.GType;

        get_n_items(): number;

        get_item(position: number): A | null;

        items_changed(position: number, removed: number, added: number): void;

        vfunc_get_item(position: number): A | null;

        vfunc_get_item_type(): GObject.GType;

        vfunc_get_n_items(): number;
    }


    namespace FontMap {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures, Gio.ListModel.SignalSignatures {
            "notify::item-type": (pspec: GObject.ParamSpec) => void;
            "notify::n-items": (pspec: GObject.ParamSpec) => void;
        }

        // Constructor properties interface
        interface ConstructorProps<A extends GObject.Object = GObject.Object> extends GObject.Object.ConstructorProps, Gio.ListModel.ConstructorProps {
            item_type: GObject.GTypeInput;
            itemType: GObject.GTypeInput;
            n_items: number;
            nItems: number;
        }
    }

    abstract class FontMap<A extends GObject.Object = GObject.Object> extends GObject.Object implements Gio.ListModel<A> {
        static $gtype: GObject.GType<FontMap>;

        // Properties
        get item_type(): GObject.GType;

        get itemType(): GObject.GType;

        get n_items(): number;

        get nItems(): number;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FontMap.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FontMap.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof FontMap.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FontMap.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FontMap.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FontMap.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FontMap.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FontMap.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_changed(): void;

        vfunc_get_family(name: string): FontFamily | null;

        vfunc_get_serial(): number;

        vfunc_list_families(): FontFamily[];

        vfunc_load_font(context: Context, desc: FontDescription): Font | null;

        vfunc_load_fontset(context: Context, desc: FontDescription, language: Language): Fontset | null;

        // Methods
        add_font_file(filename: string): boolean;

        changed(): void;

        create_context(): Context;

        get_family(name: string): FontFamily | null;

        get_serial(): number;

        list_families(): FontFamily[];

        load_font(context: Context, desc: FontDescription): Font | null;

        load_fontset(context: Context, desc: FontDescription, language: Language): Fontset | null;

        reload_font(font: Font, scale: number, context: Context | null, variations: string | null): Font;

        get_item_type(): GObject.GType;

        get_n_items(): number;

        get_item(position: number): A | null;

        items_changed(position: number, removed: number, added: number): void;

        vfunc_get_item(position: number): A | null;

        vfunc_get_item_type(): GObject.GType;

        vfunc_get_n_items(): number;
    }


    namespace Fontset {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class Fontset extends GObject.Object {
        static $gtype: GObject.GType<Fontset>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Fontset.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Fontset.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        // Signals
        /** @signal */
        connect<K extends keyof Fontset.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Fontset.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Fontset.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Fontset.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Fontset.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Fontset.SignalSignatures[K]>): void;

        // Virtual methods
        vfunc_foreach(func: FontsetForeachFunc): void;

        vfunc_get_font(wc: number): Font;

        vfunc_get_language(): Language;

        vfunc_get_metrics(): FontMetrics;

        // Methods
        foreach(func: FontsetForeachFunc): void;

        get_font(wc: number): Font;

        get_metrics(): FontMetrics;
    }


    namespace FontsetSimple {
        // Signal signatures
        interface SignalSignatures extends Fontset.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends Fontset.ConstructorProps {}
    }

    class FontsetSimple extends Fontset {
        static $gtype: GObject.GType<FontsetSimple>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: FontsetSimple.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<FontsetSimple.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](language: Language): FontsetSimple;

        // Signals
        /** @signal */
        connect<K extends keyof FontsetSimple.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FontsetSimple.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof FontsetSimple.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, FontsetSimple.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof FontsetSimple.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<FontsetSimple.SignalSignatures[K]>): void;

        // Methods
        append(font: Font): void;

        size(): number;
    }


    namespace Layout {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    class Layout extends GObject.Object {
        static $gtype: GObject.GType<Layout>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Layout.SignalSignatures;

        // Constructors
        constructor(properties?: Partial<Layout.ConstructorProps>, ...args: any[]);

        _init(...args: any[]): void;

        static ["new"](context: Context): Layout;

        // Signals
        /** @signal */
        connect<K extends keyof Layout.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Layout.SignalSignatures[K]>): number;

        /** @signal */
        connect_after<K extends keyof Layout.SignalSignatures>(signal: K, callback: GObject.SignalCallback<this, Layout.SignalSignatures[K]>): number;

        /** @signal */
        emit<K extends keyof Layout.SignalSignatures>(signal: K, ...args: GObject.GjsParameters<Layout.SignalSignatures[K]>): void;

        // Static methods
        static deserialize(context: Context, bytes: GLib.Bytes | Uint8Array, flags: LayoutDeserializeFlags): Layout | null;

        // Methods
        context_changed(): void;

        copy(): Layout;

        get_alignment(): Alignment;

        get_attributes(): AttrList | null;

        get_auto_dir(): boolean;

        get_baseline(): number;

        get_caret_pos(index_: number): [Rectangle | null, Rectangle | null];

        get_character_count(): number;

        get_context(): Context;

        get_cursor_pos(index_: number): [Rectangle | null, Rectangle | null];

        get_direction(index: number): Direction;

        get_ellipsize(): EllipsizeMode;

        get_extents(): [Rectangle | null, Rectangle | null];

        get_font_description(): FontDescription | null;

        get_height(): number;

        get_indent(): number;

        get_iter(): LayoutIter;

        get_justify(): boolean;

        get_justify_last_line(): boolean;

        get_line(line: number): LayoutLine | null;

        get_line_count(): number;

        get_line_readonly(line: number): LayoutLine | null;

        get_line_spacing(): number;

        get_lines(): LayoutLine[];

        get_lines_readonly(): LayoutLine[];

        get_log_attrs(): LogAttr[];

        get_log_attrs_readonly(): LogAttr[];

        get_pixel_extents(): [Rectangle | null, Rectangle | null];

        get_pixel_size(): [number, number];

        get_serial(): number;

        get_single_paragraph_mode(): boolean;

        get_size(): [number, number];

        get_spacing(): number;

        get_tabs(): TabArray | null;

        get_text(): string;

        get_unknown_glyphs_count(): number;

        get_width(): number;

        get_wrap(): WrapMode;

        index_to_line_x(index_: number, trailing: boolean): [number, number];

        index_to_pos(index_: number): Rectangle;

        is_ellipsized(): boolean;

        is_wrapped(): boolean;

        move_cursor_visually(strong: boolean, old_index: number, old_trailing: number, direction: number): [number, number];

        serialize(flags: LayoutSerializeFlags): GLib.Bytes;

        set_alignment(alignment: Alignment): void;

        set_attributes(attrs: AttrList | null): void;

        set_auto_dir(auto_dir: boolean): void;

        set_ellipsize(ellipsize: EllipsizeMode): void;

        set_font_description(desc: FontDescription | null): void;

        set_height(height: number): void;

        set_indent(indent: number): void;

        set_justify(justify: boolean): void;

        set_justify_last_line(justify: boolean): void;

        set_line_spacing(factor: number): void;

        set_markup(markup: string, length: number): void;

        set_markup_with_accel(markup: string, length: number, accel_marker: string): string;

        set_single_paragraph_mode(setting: boolean): void;

        set_spacing(spacing: number): void;

        set_tabs(tabs: TabArray | null): void;

        set_text(text: string, length: number): void;

        set_width(width: number): void;

        set_wrap(wrap: WrapMode): void;

        write_to_file(flags: LayoutSerializeFlags, filename: string): boolean;

        xy_to_index(x: number, y: number): [boolean, number, number];
    }


    namespace Renderer {
        // Signal signatures
        interface SignalSignatures extends GObject.Object.SignalSignatures {}

        // Constructor properties interface
        interface ConstructorProps extends GObject.Object.ConstructorProps {}
    }

    abstract class Renderer extends GObject.Object {
        static $gtype: GObject.GType<Renderer>;

        /**
         * Compile-time signal type information.
         *
         * This instance property is generated only for TypeScript type checking.
         * It is not defined at runtime and should not be accessed in JS code.
         * @internal
         */
        $signals: Renderer.SignalSignatures;

        // Fields
        matrix: Matrix;

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
        vfunc_begin(): void;

        vfunc_draw_error_underline(x: number, y: number, width: number, height: number): void;

        vfunc_draw_glyph(font: Font, glyph: Glyph, x: number, y: number): void;

        vfunc_draw_glyph_item(text: string | null, glyph_item: GlyphItem, x: number, y: number): void;

        vfunc_draw_glyphs(font: Font, glyphs: GlyphString, x: number, y: number): void;

        vfunc_draw_rectangle(part: RenderPart, x: number, y: number, width: number, height: number): void;

        vfunc_draw_shape(attr: AttrShape, x: number, y: number): void;

        vfunc_draw_trapezoid(part: RenderPart, y1_: number, x11: number, x21: number, y2: number, x12: number, x22: number): void;

        vfunc_end(): void;

        vfunc_part_changed(part: RenderPart): void;

        vfunc_prepare_run(run: LayoutRun): void;

        // Methods
        activate(): void;

        deactivate(): void;

        draw_error_underline(x: number, y: number, width: number, height: number): void;

        draw_glyph(font: Font, glyph: Glyph, x: number, y: number): void;

        draw_glyph_item(text: string | null, glyph_item: GlyphItem, x: number, y: number): void;

        draw_glyphs(font: Font, glyphs: GlyphString, x: number, y: number): void;

        draw_layout(layout: Layout, x: number, y: number): void;

        draw_layout_line(line: LayoutLine, x: number, y: number): void;

        draw_rectangle(part: RenderPart, x: number, y: number, width: number, height: number): void;

        draw_trapezoid(part: RenderPart, y1_: number, x11: number, x21: number, y2: number, x12: number, x22: number): void;

        get_alpha(part: RenderPart): number;

        get_color(part: RenderPart): Color | null;

        get_components(): RenderComponent;

        get_layout(): Layout | null;

        get_layout_line(): LayoutLine | null;

        get_matrix(): Matrix | null;

        part_changed(part: RenderPart): void;

        set_alpha(part: RenderPart, alpha: number): void;

        set_color(part: RenderPart, color: Color | null): void;

        set_components(components: RenderComponent): void;

        set_matrix(matrix: Matrix | null): void;
    }


    class Analysis {
        static $gtype: GObject.GType<Analysis>;

        // Fields
        shape_engine: null;

        lang_engine: null;

        font: Font;

        level: number;

        gravity: number;

        flags: number;

        script: number;

        extra_attrs: null[];
    }


    class AttrClass {
        static $gtype: GObject.GType<AttrClass>;

        // Fields
        type: AttrType;
    }


    class AttrColor {
        static $gtype: GObject.GType<AttrColor>;

        // Fields
        color: Color;
    }


    class AttrFloat {
        static $gtype: GObject.GType<AttrFloat>;

        // Fields
        value: number;
    }


    class AttrFontDesc {
        static $gtype: GObject.GType<AttrFontDesc>;

        // Static methods
        static ["new"](desc: FontDescription): Attribute;
    }


    class AttrFontFeatures {
        static $gtype: GObject.GType<AttrFontFeatures>;

        // Fields
        features: string;

        // Static methods
        static ["new"](features: string): Attribute;
    }


    class AttrInt {
        static $gtype: GObject.GType<AttrInt>;

        // Fields
        value: number;
    }


    abstract class AttrIterator {
        static $gtype: GObject.GType<AttrIterator>;

        // Methods
        copy(): AttrIterator;

        destroy(): void;

        get(type: AttrType): Attribute | null;

        get_attrs(): Attribute[];

        get_font(desc: FontDescription): [Language | null, Attribute[] | null];

        next(): boolean;

        range(): [number, number];
    }


    class AttrLanguage {
        static $gtype: GObject.GType<AttrLanguage>;

        // Static methods
        static ["new"](language: Language): Attribute;
    }


    class AttrList {
        static $gtype: GObject.GType<AttrList>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): AttrList;

        // Static methods
        static from_string(text: string): AttrList | null;

        // Methods
        change(attr: Attribute): void;

        copy(): AttrList | null;

        equal(other_list: AttrList): boolean;

        filter(func: AttrFilterFunc): AttrList | null;

        get_attributes(): Attribute[];

        get_iterator(): AttrIterator;

        insert(attr: Attribute): void;

        insert_before(attr: Attribute): void;

        ref(): AttrList;

        splice(other: AttrList, pos: number, len: number): void;

        to_string(): string;

        unref(): void;

        update(pos: number, remove: number, add: number): void;
    }


    class AttrShape {
        static $gtype: GObject.GType<AttrShape>;

        // Fields
        ink_rect: Rectangle;

        logical_rect: Rectangle;

        data: null;

        copy_func: AttrDataCopyFunc;

        destroy_func: GLib.DestroyNotify;

        // Static methods
        static ["new"](ink_rect: Rectangle, logical_rect: Rectangle): Attribute;

        static new_with_data(ink_rect: Rectangle, logical_rect: Rectangle, data: null, copy_func: AttrDataCopyFunc | null): Attribute;
    }


    class AttrSize {
        static $gtype: GObject.GType<AttrSize>;

        // Fields
        size: number;

        absolute: number;

        // Static methods
        static ["new"](size: number): Attribute;

        static new_absolute(size: number): Attribute;
    }


    class AttrString {
        static $gtype: GObject.GType<AttrString>;

        // Fields
        value: string;
    }


    class Attribute {
        static $gtype: GObject.GType<Attribute>;

        // Fields
        start_index: number;

        end_index: number;

        // Methods
        as_color(): AttrColor | null;

        as_float(): AttrFloat | null;

        as_font_desc(): AttrFontDesc | null;

        as_font_features(): AttrFontFeatures | null;

        as_int(): AttrInt | null;

        as_language(): AttrLanguage | null;

        as_shape(): AttrShape | null;

        as_size(): AttrSize | null;

        as_string(): AttrString | null;

        copy(): Attribute;

        destroy(): void;

        equal(attr2: Attribute): boolean;

        init(klass: AttrClass): void;
    }


    class Color {
        static $gtype: GObject.GType<Color>;

        // Fields
        red: number;

        green: number;

        blue: number;

        // Constructors

        constructor(properties?: Partial<{
            red: number;
            green: number;
            blue: number;
        }>);

        // Methods
        copy(): Color | null;

        free(): void;

        parse(spec: string): boolean;

        parse_with_alpha(spec: string): [boolean, number];

        to_string(): string;
    }


    type ContextClass = typeof Context;

    type FontClass = typeof Font;

    class FontDescription {
        static $gtype: GObject.GType<FontDescription>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): FontDescription;

        // Static methods
        static from_string(str: string): FontDescription;

        // Methods
        better_match(old_match: FontDescription | null, new_match: FontDescription): boolean;

        copy(): FontDescription | null;

        copy_static(): FontDescription | null;

        equal(desc2: FontDescription): boolean;

        free(): void;

        get_color(): FontColor;

        get_family(): string | null;

        get_features(): string | null;

        get_gravity(): Gravity;

        get_set_fields(): FontMask;

        get_size(): number;

        get_size_is_absolute(): boolean;

        get_stretch(): Stretch;

        get_style(): Style;

        get_variant(): Variant;

        get_variations(): string | null;

        get_weight(): Weight;

        get_width(): Width;

        hash(): number;

        merge(desc_to_merge: FontDescription | null, replace_existing: boolean): void;

        merge_static(desc_to_merge: FontDescription, replace_existing: boolean): void;

        set_absolute_size(size: number): void;

        set_color(color: FontColor): void;

        set_family(family: string): void;

        set_family_static(family: string): void;

        set_features(features: string | null): void;

        set_features_static(features: string): void;

        set_gravity(gravity: Gravity): void;

        set_size(size: number): void;

        set_stretch(stretch: Stretch): void;

        set_style(style: Style): void;

        set_variant(variant: Variant): void;

        set_variations(variations: string | null): void;

        set_variations_static(variations: string): void;

        set_weight(weight: Weight): void;

        set_width(width: Width): void;

        to_filename(): string | null;

        to_string(): string;

        unset_fields(to_unset: FontMask): void;
    }


    type FontFaceClass = typeof FontFace;

    type FontFamilyClass = typeof FontFamily;

    type FontMapClass = typeof FontMap;

    class FontMetrics {
        static $gtype: GObject.GType<FontMetrics>;

        // Constructors
        constructor(properties?: Partial<{}>);

        // Methods
        get_approximate_char_width(): number;

        get_approximate_digit_width(): number;

        get_ascent(): number;

        get_descent(): number;

        get_height(): number;

        get_strikethrough_position(): number;

        get_strikethrough_thickness(): number;

        get_underline_position(): number;

        get_underline_thickness(): number;

        ref(): FontMetrics | null;

        unref(): void;
    }


    type FontsetClass = typeof Fontset;

    type FontsetSimpleClass = typeof FontsetSimple;

    class GlyphGeometry {
        static $gtype: GObject.GType<GlyphGeometry>;

        // Fields
        width: GlyphUnit;

        x_offset: GlyphUnit;

        y_offset: GlyphUnit;

        // Constructors

        constructor(properties?: Partial<{
            width: GlyphUnit;
            x_offset: GlyphUnit;
            y_offset: GlyphUnit;
        }>);
    }


    class GlyphInfo {
        static $gtype: GObject.GType<GlyphInfo>;

        // Fields
        glyph: Glyph;

        geometry: GlyphGeometry;

        attr: GlyphVisAttr;

        // Constructors

        constructor(properties?: Partial<{
            glyph: Glyph;
            geometry: GlyphGeometry;
            attr: GlyphVisAttr;
        }>);
    }


    class GlyphItem {
        static $gtype: GObject.GType<GlyphItem>;

        // Fields
        glyphs: GlyphString;

        y_offset: number;

        start_x_offset: number;

        end_x_offset: number;

        // Methods
        apply_attrs(text: string, list: AttrList): GlyphItem[];

        copy(): GlyphItem | null;

        free(): void;

        get_logical_widths(text: string): number[];

        letter_space(text: string, log_attrs: LogAttr[], letter_spacing: number): void;

        split(text: string, split_index: number): GlyphItem | null;
    }


    class GlyphItemIter {
        static $gtype: GObject.GType<GlyphItemIter>;

        // Fields
        text: string;

        start_glyph: number;

        start_index: number;

        start_char: number;

        end_glyph: number;

        end_index: number;

        end_char: number;

        // Methods
        copy(): GlyphItemIter | null;

        free(): void;

        init_end(glyph_item: GlyphItem, text: string): boolean;

        init_start(glyph_item: GlyphItem, text: string): boolean;

        next_cluster(): boolean;

        prev_cluster(): boolean;
    }


    class GlyphString {
        static $gtype: GObject.GType<GlyphString>;

        // Fields
        num_glyphs: number;

        glyphs: GlyphInfo[];

        log_clusters: number;

        // Constructors

        constructor(properties?: Partial<{
            num_glyphs: number;
            glyphs: GlyphInfo[];
            log_clusters: number;
        }>);

        static ["new"](): GlyphString;

        // Methods
        copy(): GlyphString | null;

        extents(font: Font): [Rectangle | null, Rectangle | null];

        extents_range(start: number, end: number, font: Font): [Rectangle | null, Rectangle | null];

        free(): void;

        get_logical_widths(text: string, length: number, embedding_level: number): number[];

        get_width(): number;

        index_to_x(text: string, length: number, analysis: Analysis, index_: number, trailing: boolean): number;

        index_to_x_full(text: string, length: number, analysis: Analysis, attrs: LogAttr | null, index_: number, trailing: boolean): number;

        set_size(new_len: number): void;

        x_to_index(text: string, length: number, analysis: Analysis, x_pos: number): [number, number];
    }


    class GlyphVisAttr {
        static $gtype: GObject.GType<GlyphVisAttr>;

        // Fields
        is_cluster_start: number;

        is_color: number;

        // Constructors

        constructor(properties?: Partial<{
            is_cluster_start: number;
            is_color: number;
        }>);
    }


    class Item {
        static $gtype: GObject.GType<Item>;

        // Fields
        offset: number;

        length: number;

        num_chars: number;

        // Constructors

        constructor(properties?: Partial<{
            offset: number;
            length: number;
            num_chars: number;
            analysis: Analysis;
        }>);

        static ["new"](): Item;

        // Methods
        apply_attrs(iter: AttrIterator): void;

        copy(): Item | null;

        free(): void;

        get_char_offset(): number;

        split(split_index: number, split_offset: number): Item;
    }


    abstract class Language {
        static $gtype: GObject.GType<Language>;

        // Static methods
        static from_string(language: string | null): Language | null;

        static get_default(): Language;

        static get_preferred(): Language[] | null;

        // Methods
        get_sample_string(): string;

        get_scripts(): Script[] | null;

        includes_script(script: Script): boolean;

        matches(range_list: string): boolean;

        to_string(): string;
    }


    type LayoutClass = typeof Layout;

    abstract class LayoutIter {
        static $gtype: GObject.GType<LayoutIter>;

        // Methods
        at_last_line(): boolean;

        copy(): LayoutIter | null;

        free(): void;

        get_baseline(): number;

        get_char_extents(): Rectangle;

        get_cluster_extents(): [Rectangle | null, Rectangle | null];

        get_index(): number;

        get_layout(): Layout | null;

        get_layout_extents(): [Rectangle | null, Rectangle | null];

        get_line(): LayoutLine | null;

        get_line_extents(): [Rectangle | null, Rectangle | null];

        get_line_readonly(): LayoutLine | null;

        get_line_yrange(): [number, number];

        get_run(): LayoutRun | null;

        get_run_baseline(): number;

        get_run_extents(): [Rectangle | null, Rectangle | null];

        get_run_readonly(): LayoutRun | null;

        next_char(): boolean;

        next_cluster(): boolean;

        next_line(): boolean;

        next_run(): boolean;
    }


    class LayoutLine {
        static $gtype: GObject.GType<LayoutLine>;

        // Fields
        layout: Layout;

        start_index: number;

        length: number;

        runs: LayoutRun[];

        resolved_dir: number;

        // Methods
        get_extents(): [Rectangle | null, Rectangle | null];

        get_height(): number;

        get_length(): number;

        get_pixel_extents(): [Rectangle | null, Rectangle | null];

        get_resolved_direction(): Direction;

        get_start_index(): number;

        get_x_ranges(start_index: number, end_index: number): number[];

        index_to_x(index_: number, trailing: boolean): number;

        is_paragraph_start(): boolean;

        ref(): LayoutLine | null;

        unref(): void;

        x_to_index(x_pos: number): [boolean, number, number];
    }


    class LogAttr {
        static $gtype: GObject.GType<LogAttr>;

        // Fields
        is_line_break: number;

        is_mandatory_break: number;

        is_char_break: number;

        is_white: number;

        is_cursor_position: number;

        is_word_start: number;

        is_word_end: number;

        is_sentence_boundary: number;

        is_sentence_start: number;

        is_sentence_end: number;

        backspace_deletes_character: number;

        is_expandable_space: number;

        is_word_boundary: number;

        break_inserts_hyphen: number;

        break_removes_preceding: number;

        reserved: number;

        // Constructors

        constructor(properties?: Partial<{
            is_line_break: number;
            is_mandatory_break: number;
            is_char_break: number;
            is_white: number;
            is_cursor_position: number;
            is_word_start: number;
            is_word_end: number;
            is_sentence_boundary: number;
            is_sentence_start: number;
            is_sentence_end: number;
            backspace_deletes_character: number;
            is_expandable_space: number;
            is_word_boundary: number;
            break_inserts_hyphen: number;
            break_removes_preceding: number;
            reserved: number;
        }>);
    }


    class Matrix {
        static $gtype: GObject.GType<Matrix>;

        // Fields
        xx: number;

        xy: number;

        yx: number;

        yy: number;

        x0: number;

        y0: number;

        // Constructors

        constructor(properties?: Partial<{
            xx: number;
            xy: number;
            yx: number;
            yy: number;
            x0: number;
            y0: number;
        }>);

        // Methods
        concat(new_matrix: Matrix): void;

        copy(): Matrix | null;

        free(): void;

        get_font_scale_factor(): number;

        get_font_scale_factors(): [number, number];

        get_slant_ratio(): number;

        rotate(degrees: number): void;

        scale(scale_x: number, scale_y: number): void;

        transform_distance(dx: number, dy: number): [number, number];

        transform_pixel_rectangle(rect?: Rectangle): Rectangle;

        transform_point(x: number, y: number): [number, number];

        transform_rectangle(rect?: Rectangle): Rectangle;

        translate(tx: number, ty: number): void;
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
    }


    type RendererClass = typeof Renderer;

    abstract class RendererPrivate {
        static $gtype: GObject.GType<RendererPrivate>;
    }


    class ScriptIter {
        static $gtype: GObject.GType<ScriptIter>;

        // Constructors
        constructor(text: string, length: number);

        static ["new"](text: string, length: number): ScriptIter;

        // Methods
        free(): void;

        get_range(): [string, string, Script | null];

        next(): boolean;
    }


    class TabArray {
        static $gtype: GObject.GType<TabArray>;

        // Constructors
        constructor(initial_size: number, positions_in_pixels: boolean);

        static ["new"](initial_size: number, positions_in_pixels: boolean): TabArray;

        // Static methods
        static from_string(text: string): TabArray | null;

        // Methods
        copy(): TabArray;

        free(): void;

        get_decimal_point(tab_index: number): string;

        get_positions_in_pixels(): boolean;

        get_size(): number;

        get_tab(tab_index: number): [TabAlign | null, number];

        get_tabs(): [TabAlign | null, number[] | null];

        resize(new_size: number): void;

        set_decimal_point(tab_index: number, decimal_point: string): void;

        set_positions_in_pixels(positions_in_pixels: boolean): void;

        set_tab(tab_index: number, alignment: TabAlign, location: number): void;

        sort(): void;

        to_string(): string;
    }


    type Glyph = number;

    type GlyphUnit = number;

    type LayoutRun = GlyphItem;

    const __name__: string;

    const __version__: string;
}

export default Pango;

}

declare module 'gi://Pango' {
    import Pango10 from 'gi://Pango?version=1.0';
    export default Pango10;
}
// END
