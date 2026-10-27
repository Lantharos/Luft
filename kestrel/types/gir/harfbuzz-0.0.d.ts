/// <reference path="./freetype2-2.0.d.ts" />
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

declare module 'gi://HarfBuzz?version=0.0' {

// Module dependencies
import type freetype2 from 'gi://freetype2?version=2.0';
import type GObject from 'gi://GObject?version=2.0';
import type GLib from 'gi://GLib?version=2.0';

export namespace HarfBuzz {

    /**
     * HarfBuzz-0.0
     */


    enum buffer_cluster_level_t {
        MONOTONE_GRAPHEMES = 0,
        MONOTONE_CHARACTERS = 1,
        CHARACTERS = 2,
        GRAPHEMES = 3,
        DEFAULT = 0,
    }


    enum buffer_content_type_t {
        INVALID = 0,
        UNICODE = 1,
        GLYPHS = 2,
    }


    enum direction_t {
        INVALID = 0,
        LTR = 4,
        RTL = 5,
        TTB = 6,
        BTT = 7,
    }


    enum draw_line_cap_t {
        BUTT = 0,
        SQUARE = 1,
    }


    enum memory_mode_t {
        DUPLICATE = 0,
        READONLY = 1,
        WRITABLE = 2,
        READONLY_MAY_MAKE_WRITABLE = 3,
    }


    enum ot_layout_glyph_class_t {
        UNCLASSIFIED = 0,
        BASE_GLYPH = 1,
        LIGATURE = 2,
        MARK = 3,
        COMPONENT = 4,
    }


    enum ot_math_constant_t {
        SCRIPT_PERCENT_SCALE_DOWN = 0,
        SCRIPT_SCRIPT_PERCENT_SCALE_DOWN = 1,
        DELIMITED_SUB_FORMULA_MIN_HEIGHT = 2,
        DISPLAY_OPERATOR_MIN_HEIGHT = 3,
        MATH_LEADING = 4,
        AXIS_HEIGHT = 5,
        ACCENT_BASE_HEIGHT = 6,
        FLATTENED_ACCENT_BASE_HEIGHT = 7,
        SUBSCRIPT_SHIFT_DOWN = 8,
        SUBSCRIPT_TOP_MAX = 9,
        SUBSCRIPT_BASELINE_DROP_MIN = 10,
        SUPERSCRIPT_SHIFT_UP = 11,
        SUPERSCRIPT_SHIFT_UP_CRAMPED = 12,
        SUPERSCRIPT_BOTTOM_MIN = 13,
        SUPERSCRIPT_BASELINE_DROP_MAX = 14,
        SUB_SUPERSCRIPT_GAP_MIN = 15,
        SUPERSCRIPT_BOTTOM_MAX_WITH_SUBSCRIPT = 16,
        SPACE_AFTER_SCRIPT = 17,
        UPPER_LIMIT_GAP_MIN = 18,
        UPPER_LIMIT_BASELINE_RISE_MIN = 19,
        LOWER_LIMIT_GAP_MIN = 20,
        LOWER_LIMIT_BASELINE_DROP_MIN = 21,
        STACK_TOP_SHIFT_UP = 22,
        STACK_TOP_DISPLAY_STYLE_SHIFT_UP = 23,
        STACK_BOTTOM_SHIFT_DOWN = 24,
        STACK_BOTTOM_DISPLAY_STYLE_SHIFT_DOWN = 25,
        STACK_GAP_MIN = 26,
        STACK_DISPLAY_STYLE_GAP_MIN = 27,
        STRETCH_STACK_TOP_SHIFT_UP = 28,
        STRETCH_STACK_BOTTOM_SHIFT_DOWN = 29,
        STRETCH_STACK_GAP_ABOVE_MIN = 30,
        STRETCH_STACK_GAP_BELOW_MIN = 31,
        FRACTION_NUMERATOR_SHIFT_UP = 32,
        FRACTION_NUMERATOR_DISPLAY_STYLE_SHIFT_UP = 33,
        FRACTION_DENOMINATOR_SHIFT_DOWN = 34,
        FRACTION_DENOMINATOR_DISPLAY_STYLE_SHIFT_DOWN = 35,
        FRACTION_NUMERATOR_GAP_MIN = 36,
        FRACTION_NUM_DISPLAY_STYLE_GAP_MIN = 37,
        FRACTION_RULE_THICKNESS = 38,
        FRACTION_DENOMINATOR_GAP_MIN = 39,
        FRACTION_DENOM_DISPLAY_STYLE_GAP_MIN = 40,
        SKEWED_FRACTION_HORIZONTAL_GAP = 41,
        SKEWED_FRACTION_VERTICAL_GAP = 42,
        OVERBAR_VERTICAL_GAP = 43,
        OVERBAR_RULE_THICKNESS = 44,
        OVERBAR_EXTRA_ASCENDER = 45,
        UNDERBAR_VERTICAL_GAP = 46,
        UNDERBAR_RULE_THICKNESS = 47,
        UNDERBAR_EXTRA_DESCENDER = 48,
        RADICAL_VERTICAL_GAP = 49,
        RADICAL_DISPLAY_STYLE_VERTICAL_GAP = 50,
        RADICAL_RULE_THICKNESS = 51,
        RADICAL_EXTRA_ASCENDER = 52,
        RADICAL_KERN_BEFORE_DEGREE = 53,
        RADICAL_KERN_AFTER_DEGREE = 54,
        RADICAL_DEGREE_BOTTOM_RAISE_PERCENT = 55,
    }


    enum ot_math_kern_t {
        TOP_RIGHT = 0,
        TOP_LEFT = 1,
        BOTTOM_RIGHT = 2,
        BOTTOM_LEFT = 3,
    }


    enum ot_name_id_predefined_t {
        COPYRIGHT = 0,
        FONT_FAMILY = 1,
        FONT_SUBFAMILY = 2,
        UNIQUE_ID = 3,
        FULL_NAME = 4,
        VERSION_STRING = 5,
        POSTSCRIPT_NAME = 6,
        TRADEMARK = 7,
        MANUFACTURER = 8,
        DESIGNER = 9,
        DESCRIPTION = 10,
        VENDOR_URL = 11,
        DESIGNER_URL = 12,
        LICENSE = 13,
        LICENSE_URL = 14,
        TYPOGRAPHIC_FAMILY = 16,
        TYPOGRAPHIC_SUBFAMILY = 17,
        MAC_FULL_NAME = 18,
        SAMPLE_TEXT = 19,
        CID_FINDFONT_NAME = 20,
        WWS_FAMILY = 21,
        WWS_SUBFAMILY = 22,
        LIGHT_BACKGROUND = 23,
        DARK_BACKGROUND = 24,
        VARIATIONS_PS_PREFIX = 25,
        INVALID = 65535,
    }


    enum paint_composite_mode_t {
        CLEAR = 0,
        SRC = 1,
        DEST = 2,
        SRC_OVER = 3,
        DEST_OVER = 4,
        SRC_IN = 5,
        DEST_IN = 6,
        SRC_OUT = 7,
        DEST_OUT = 8,
        SRC_ATOP = 9,
        DEST_ATOP = 10,
        XOR = 11,
        PLUS = 12,
        SCREEN = 13,
        OVERLAY = 14,
        DARKEN = 15,
        LIGHTEN = 16,
        COLOR_DODGE = 17,
        COLOR_BURN = 18,
        HARD_LIGHT = 19,
        SOFT_LIGHT = 20,
        DIFFERENCE = 21,
        EXCLUSION = 22,
        MULTIPLY = 23,
        HSL_HUE = 24,
        HSL_SATURATION = 25,
        HSL_COLOR = 26,
        HSL_LUMINOSITY = 27,
    }


    enum paint_extend_t {
        PAD = 0,
        REPEAT = 1,
        REFLECT = 2,
    }


    enum unicode_combining_class_t {
        NOT_REORDERED = 0,
        OVERLAY = 1,
        NUKTA = 7,
        KANA_VOICING = 8,
        VIRAMA = 9,
        CCC10 = 10,
        CCC11 = 11,
        CCC12 = 12,
        CCC13 = 13,
        CCC14 = 14,
        CCC15 = 15,
        CCC16 = 16,
        CCC17 = 17,
        CCC18 = 18,
        CCC19 = 19,
        CCC20 = 20,
        CCC21 = 21,
        CCC22 = 22,
        CCC23 = 23,
        CCC24 = 24,
        CCC25 = 25,
        CCC26 = 26,
        CCC27 = 27,
        CCC28 = 28,
        CCC29 = 29,
        CCC30 = 30,
        CCC31 = 31,
        CCC32 = 32,
        CCC33 = 33,
        CCC34 = 34,
        CCC35 = 35,
        CCC36 = 36,
        CCC84 = 84,
        CCC91 = 91,
        CCC103 = 103,
        CCC107 = 107,
        CCC118 = 118,
        CCC122 = 122,
        CCC129 = 129,
        CCC130 = 130,
        CCC132 = 132,
        ATTACHED_BELOW_LEFT = 200,
        ATTACHED_BELOW = 202,
        ATTACHED_ABOVE = 214,
        ATTACHED_ABOVE_RIGHT = 216,
        BELOW_LEFT = 218,
        BELOW = 220,
        BELOW_RIGHT = 222,
        LEFT = 224,
        RIGHT = 226,
        ABOVE_LEFT = 228,
        ABOVE = 230,
        ABOVE_RIGHT = 232,
        DOUBLE_BELOW = 233,
        DOUBLE_ABOVE = 234,
        IOTA_SUBSCRIPT = 240,
        INVALID = 255,
    }


    enum unicode_general_category_t {
        CONTROL = 0,
        FORMAT = 1,
        UNASSIGNED = 2,
        PRIVATE_USE = 3,
        SURROGATE = 4,
        LOWERCASE_LETTER = 5,
        MODIFIER_LETTER = 6,
        OTHER_LETTER = 7,
        TITLECASE_LETTER = 8,
        UPPERCASE_LETTER = 9,
        SPACING_MARK = 10,
        ENCLOSING_MARK = 11,
        NON_SPACING_MARK = 12,
        DECIMAL_NUMBER = 13,
        LETTER_NUMBER = 14,
        OTHER_NUMBER = 15,
        CONNECT_PUNCTUATION = 16,
        DASH_PUNCTUATION = 17,
        CLOSE_PUNCTUATION = 18,
        FINAL_PUNCTUATION = 19,
        INITIAL_PUNCTUATION = 20,
        OTHER_PUNCTUATION = 21,
        OPEN_PUNCTUATION = 22,
        CURRENCY_SYMBOL = 23,
        MODIFIER_SYMBOL = 24,
        MATH_SYMBOL = 25,
        OTHER_SYMBOL = 26,
        LINE_SEPARATOR = 27,
        PARAGRAPH_SEPARATOR = 28,
        SPACE_SEPARATOR = 29,
    }


    const AAT_LAYOUT_NO_SELECTOR_INDEX: number;

    const BUDGET_DEFAULT: number;

    const BUDGET_UNLIMITED: number;

    const BUFFER_REPLACEMENT_CODEPOINT_DEFAULT: number;

    const CODEPOINT_INVALID: codepoint_t;

    const FEATURE_GLOBAL_START: number;

    const FONT_NO_VAR_NAMED_INSTANCE: number;

    const LANGUAGE_INVALID: language_t;

    const OT_LAYOUT_DEFAULT_LANGUAGE_INDEX: number;

    const OT_LAYOUT_NO_FEATURE_INDEX: number;

    const OT_LAYOUT_NO_SCRIPT_INDEX: number;

    const OT_LAYOUT_NO_VARIATIONS_INDEX: number;

    const OT_MAX_TAGS_PER_LANGUAGE: number;

    const OT_MAX_TAGS_PER_SCRIPT: number;

    const OT_SHAPE_BUFFER_FORMAT_SERIAL: number;

    const OT_VAR_NO_AXIS_INDEX: number;

    const UNICODE_COMBINING_CLASS_CCC133: number;

    const UNICODE_MAX: number;

    const UNICODE_MAX_DECOMPOSITION_LEN: number;

    const VERSION_MAJOR: number;

    const VERSION_MICRO: number;

    const VERSION_MINOR: number;

    const VERSION_STRING: string;

    function aat_layout_feature_type_get_name_id(face: face_t, feature_type: aat_layout_feature_type_t): ot_name_id_t;

    function aat_layout_feature_type_get_selector_infos(face: face_t, feature_type: aat_layout_feature_type_t, start_offset: number): [number, aat_layout_feature_selector_info_t[] | null, number];

    function aat_layout_get_feature_types(face: face_t, start_offset: number): [number, aat_layout_feature_type_t[] | null];

    function aat_layout_has_positioning(face: face_t): bool_t;

    function aat_layout_has_substitution(face: face_t): bool_t;

    function aat_layout_has_tracking(face: face_t): bool_t;

    function blob_copy_writable_or_fail(blob: blob_t): blob_t;

    function blob_create_from_file(file_name: string): blob_t;

    function blob_create_from_file_or_fail(file_name: string): blob_t;

    function blob_create_sub_blob(parent: blob_t, offset: number, length: number): blob_t;

    function blob_get_data(blob: blob_t): string[] | null;

    function blob_get_data_writable(blob: blob_t): string[];

    function blob_get_empty(): blob_t;

    function blob_get_length(blob: blob_t): number;

    function blob_is_immutable(blob: blob_t): bool_t;

    function blob_make_immutable(blob: blob_t): void;

    function buffer_add(buffer: buffer_t, codepoint: codepoint_t, cluster: number): void;

    function buffer_add_codepoints(buffer: buffer_t, text: codepoint_t[], item_offset: number, item_length: number): void;

    function buffer_add_latin1(buffer: buffer_t, text: Uint8Array | string, item_offset: number, item_length: number): void;

    function buffer_add_utf16(buffer: buffer_t, text: number[], item_offset: number, item_length: number): void;

    function buffer_add_utf32(buffer: buffer_t, text: number[], item_offset: number, item_length: number): void;

    function buffer_add_utf8(buffer: buffer_t, text: Uint8Array | string, item_offset: number, item_length: number): void;

    function buffer_allocation_successful(buffer: buffer_t): bool_t;

    function buffer_append(buffer: buffer_t, source: buffer_t, start: number, end: number): void;

    function buffer_changed(buffer: buffer_t): void;

    function buffer_clear_contents(buffer: buffer_t): void;

    function buffer_create(): buffer_t;

    function buffer_create_similar(src: buffer_t): buffer_t;

    function buffer_deserialize_glyphs(buffer: buffer_t, buf: string[], font: font_t | null, format: buffer_serialize_format_t): [bool_t, string];

    function buffer_deserialize_unicode(buffer: buffer_t, buf: string[], format: buffer_serialize_format_t): [bool_t, string];

    function buffer_diff(buffer: buffer_t, reference: buffer_t, dottedcircle_glyph: codepoint_t, position_fuzz: number): buffer_diff_flags_t;

    function buffer_get_cluster_level(buffer: buffer_t): buffer_cluster_level_t;

    function buffer_get_content_type(buffer: buffer_t): buffer_content_type_t;

    function buffer_get_direction(buffer: buffer_t): direction_t;

    function buffer_get_empty(): buffer_t;

    function buffer_get_flags(buffer: buffer_t): buffer_flags_t;

    function buffer_get_glyph_infos(buffer: buffer_t): glyph_info_t[];

    function buffer_get_glyph_positions(buffer: buffer_t): glyph_position_t[];

    function buffer_get_invisible_glyph(buffer: buffer_t): codepoint_t;

    function buffer_get_language(buffer: buffer_t): language_t;

    function buffer_get_length(buffer: buffer_t): number;

    function buffer_get_not_found_glyph(buffer: buffer_t): codepoint_t;

    function buffer_get_not_found_variation_selector_glyph(buffer: buffer_t): codepoint_t;

    function buffer_get_random_state(buffer: buffer_t): number;

    function buffer_get_replacement_codepoint(buffer: buffer_t): codepoint_t;

    function buffer_get_script(buffer: buffer_t): script_t;

    function buffer_get_segment_properties(buffer: buffer_t): segment_properties_t;

    function buffer_get_unicode_funcs(buffer: buffer_t): unicode_funcs_t;

    function buffer_guess_segment_properties(buffer: buffer_t): void;

    function buffer_has_positions(buffer: buffer_t): bool_t;

    function buffer_normalize_glyphs(buffer: buffer_t): void;

    function buffer_pre_allocate(buffer: buffer_t, size: number): bool_t;

    function buffer_reset(buffer: buffer_t): void;

    function buffer_reverse(buffer: buffer_t): void;

    function buffer_reverse_clusters(buffer: buffer_t): void;

    function buffer_reverse_range(buffer: buffer_t, start: number, end: number): void;

    function buffer_serialize(buffer: buffer_t, start: number, end: number, font: font_t | null, format: buffer_serialize_format_t, flags: buffer_serialize_flags_t): [number, Uint8Array, number];

    function buffer_serialize_format_from_string(str: Uint8Array | string): buffer_serialize_format_t;

    function buffer_serialize_format_to_string(format: buffer_serialize_format_t): string;

    function buffer_serialize_glyphs(buffer: buffer_t, start: number, end: number, font: font_t | null, format: buffer_serialize_format_t, flags: buffer_serialize_flags_t): [number, Uint8Array, number];

    function buffer_serialize_list_formats(): string[];

    function buffer_serialize_unicode(buffer: buffer_t, start: number, end: number, format: buffer_serialize_format_t, flags: buffer_serialize_flags_t): [number, Uint8Array, number];

    function buffer_set_cluster_level(buffer: buffer_t, cluster_level: buffer_cluster_level_t): void;

    function buffer_set_content_type(buffer: buffer_t, content_type: buffer_content_type_t): void;

    function buffer_set_direction(buffer: buffer_t, direction: direction_t): void;

    function buffer_set_flags(buffer: buffer_t, flags: buffer_flags_t): void;

    function buffer_set_invisible_glyph(buffer: buffer_t, invisible: codepoint_t): void;

    function buffer_set_language(buffer: buffer_t, language: language_t): void;

    function buffer_set_length(buffer: buffer_t, length: number): bool_t;

    function buffer_set_message_func(buffer: buffer_t, func: buffer_message_func_t, destroy: destroy_func_t | null): void;

    function buffer_set_not_found_glyph(buffer: buffer_t, not_found: codepoint_t): void;

    function buffer_set_not_found_variation_selector_glyph(buffer: buffer_t, not_found_variation_selector: codepoint_t): void;

    function buffer_set_random_state(buffer: buffer_t, state: number): void;

    function buffer_set_replacement_codepoint(buffer: buffer_t, replacement: codepoint_t): void;

    function buffer_set_script(buffer: buffer_t, script: script_t): void;

    function buffer_set_segment_properties(buffer: buffer_t, props: segment_properties_t): void;

    function buffer_set_unicode_funcs(buffer: buffer_t, unicode_funcs: unicode_funcs_t): void;

    function calloc(nmemb: bigint | number, size: bigint | number): null;

    function color_get_alpha(color: color_t): number;

    function color_get_blue(color: color_t): number;

    function color_get_green(color: color_t): number;

    function color_get_red(color: color_t): number;

    function color_line_get_color_stops(color_line: color_line_t, start: number): [number, color_stop_t[] | null];

    function color_line_get_extend(color_line: color_line_t): paint_extend_t;

    function direction_from_string(str: Uint8Array | string): direction_t;

    function direction_to_string(direction: direction_t): string;

    function draw_circle(dfuncs: draw_funcs_t, draw_data: null, st: draw_state_t, cx: number, cy: number, r: number, stroke_width: number): void;

    function draw_close_path(dfuncs: draw_funcs_t, draw_data: null, st: draw_state_t): void;

    function draw_cubic_to(dfuncs: draw_funcs_t, draw_data: null, st: draw_state_t, control1_x: number, control1_y: number, control2_x: number, control2_y: number, to_x: number, to_y: number): void;

    function draw_funcs_create(): draw_funcs_t;

    function draw_funcs_get_empty(): draw_funcs_t;

    function draw_funcs_is_immutable(dfuncs: draw_funcs_t): bool_t;

    function draw_funcs_make_immutable(dfuncs: draw_funcs_t): void;

    function draw_funcs_set_close_path_func(dfuncs: draw_funcs_t, func: draw_close_path_func_t, destroy: destroy_func_t | null): void;

    function draw_funcs_set_cubic_to_func(dfuncs: draw_funcs_t, func: draw_cubic_to_func_t, destroy: destroy_func_t | null): void;

    function draw_funcs_set_get_budget_func(dfuncs: draw_funcs_t, func: draw_get_budget_func_t, destroy: destroy_func_t | null): void;

    function draw_funcs_set_get_budget_remaining_func(dfuncs: draw_funcs_t, func: draw_get_budget_remaining_func_t, destroy: destroy_func_t | null): void;

    function draw_funcs_set_line_to_func(dfuncs: draw_funcs_t, func: draw_line_to_func_t, destroy: destroy_func_t | null): void;

    function draw_funcs_set_move_to_func(dfuncs: draw_funcs_t, func: draw_move_to_func_t, destroy: destroy_func_t | null): void;

    function draw_funcs_set_quadratic_to_func(dfuncs: draw_funcs_t, func: draw_quadratic_to_func_t, destroy: destroy_func_t | null): void;

    function draw_funcs_set_set_budget_func(dfuncs: draw_funcs_t, func: draw_set_budget_func_t, destroy: destroy_func_t | null): void;

    function draw_get_budget(dfuncs: draw_funcs_t, draw_data: null): number;

    function draw_get_budget_remaining(dfuncs: draw_funcs_t, draw_data: null): number;

    function draw_line(dfuncs: draw_funcs_t, draw_data: null, st: draw_state_t, x0: number, y0: number, w0: number, x1: number, y1: number, w1: number, cap: draw_line_cap_t): void;

    function draw_line_to(dfuncs: draw_funcs_t, draw_data: null, st: draw_state_t, to_x: number, to_y: number): void;

    function draw_move_to(dfuncs: draw_funcs_t, draw_data: null, st: draw_state_t, to_x: number, to_y: number): void;

    function draw_quadratic_to(dfuncs: draw_funcs_t, draw_data: null, st: draw_state_t, control_x: number, control_y: number, to_x: number, to_y: number): void;

    function draw_rectangle(dfuncs: draw_funcs_t, draw_data: null, st: draw_state_t, x: number, y: number, w: number, h: number, stroke_width: number): void;

    function draw_set_budget(dfuncs: draw_funcs_t, draw_data: null, budget: bigint | number): bool_t;

    function face_builder_add_table(face: face_t, tag: tag_t, blob: blob_t): bool_t;

    function face_builder_create(): face_t;

    function face_builder_sort_tables(face: face_t, tags: tag_t[]): void;

    function face_collect_nominal_glyph_mapping(face: face_t): [map_t, set_t | null];

    function face_collect_unicodes(face: face_t): set_t;

    function face_collect_variation_selectors(face: face_t): set_t;

    function face_collect_variation_unicodes(face: face_t, variation_selector: codepoint_t): set_t;

    function face_count(blob: blob_t): number;

    function face_create(blob: blob_t, index: number): face_t;

    function face_create_for_tables(reference_table_func: reference_table_func_t, destroy: destroy_func_t | null): face_t;

    function face_create_from_file_or_fail(file_name: string, index: number): face_t;

    function face_create_from_file_or_fail_using(file_name: string, index: number, loader_name: string | null): face_t;

    function face_create_or_fail(blob: blob_t, index: number): face_t;

    function face_create_or_fail_using(blob: blob_t, index: number, loader_name: string | null): face_t;

    function face_get_empty(): face_t;

    function face_get_glyph_count(face: face_t): number;

    function face_get_index(face: face_t): number;

    function face_get_table_tags(face: face_t, start_offset: number): [number, tag_t[] | null];

    function face_get_upem(face: face_t): number;

    function face_is_immutable(face: face_t): bool_t;

    function face_list_loaders(): string[];

    function face_make_immutable(face: face_t): void;

    function face_reference_blob(face: face_t): blob_t;

    function face_reference_table(face: face_t, tag: tag_t): blob_t;

    function face_set_get_table_tags_func(face: face_t, func: get_table_tags_func_t, destroy: destroy_func_t | null): void;

    function face_set_glyph_count(face: face_t, glyph_count: number): void;

    function face_set_index(face: face_t, index: number): void;

    function face_set_upem(face: face_t, upem: number): void;

    function feature_from_string(str: Uint8Array | string): [bool_t, feature_t];

    function feature_to_string(feature: feature_t): string[];

    function font_add_glyph_origin_for_direction(font: font_t, glyph: codepoint_t, direction: direction_t, x: position_t, y: position_t): [position_t, position_t];

    function font_changed(font: font_t): void;

    function font_create(face: face_t): font_t;

    function font_create_sub_font(parent: font_t): font_t;

    function font_draw_glyph(font: font_t, glyph: codepoint_t, dfuncs: draw_funcs_t, draw_data: null): void;

    function font_draw_glyph_or_fail(font: font_t, glyph: codepoint_t, dfuncs: draw_funcs_t, draw_data: null): bool_t;

    function font_funcs_create(): font_funcs_t;

    function font_funcs_get_empty(): font_funcs_t;

    function font_funcs_is_immutable(ffuncs: font_funcs_t): bool_t;

    function font_funcs_make_immutable(ffuncs: font_funcs_t): void;

    function font_funcs_set_draw_glyph_func(ffuncs: font_funcs_t, func: font_draw_glyph_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_draw_glyph_or_fail_func(ffuncs: font_funcs_t, func: font_draw_glyph_or_fail_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_font_h_extents_func(ffuncs: font_funcs_t, func: font_get_font_h_extents_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_font_v_extents_func(ffuncs: font_funcs_t, func: font_get_font_v_extents_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_contour_point_func(ffuncs: font_funcs_t, func: font_get_glyph_contour_point_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_extents_func(ffuncs: font_funcs_t, func: font_get_glyph_extents_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_from_name_func(ffuncs: font_funcs_t, func: font_get_glyph_from_name_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_func(ffuncs: font_funcs_t, func: font_get_glyph_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_h_advance_func(ffuncs: font_funcs_t, func: font_get_glyph_h_advance_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_h_advances_func(ffuncs: font_funcs_t, func: font_get_glyph_h_advances_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_h_kerning_func(ffuncs: font_funcs_t, func: font_get_glyph_h_kerning_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_h_origin_func(ffuncs: font_funcs_t, func: font_get_glyph_h_origin_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_h_origins_func(ffuncs: font_funcs_t, func: font_get_glyph_h_origins_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_name_func(ffuncs: font_funcs_t, func: font_get_glyph_name_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_shape_func(ffuncs: font_funcs_t, func: font_get_glyph_shape_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_v_advance_func(ffuncs: font_funcs_t, func: font_get_glyph_v_advance_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_v_advances_func(ffuncs: font_funcs_t, func: font_get_glyph_v_advances_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_v_kerning_func(ffuncs: font_funcs_t, func: font_get_glyph_v_kerning_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_v_origin_func(ffuncs: font_funcs_t, func: font_get_glyph_v_origin_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_glyph_v_origins_func(ffuncs: font_funcs_t, func: font_get_glyph_v_origins_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_nominal_glyph_func(ffuncs: font_funcs_t, func: font_get_nominal_glyph_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_nominal_glyphs_func(ffuncs: font_funcs_t, func: font_get_nominal_glyphs_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_paint_glyph_func(ffuncs: font_funcs_t, func: font_paint_glyph_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_paint_glyph_or_fail_func(ffuncs: font_funcs_t, func: font_paint_glyph_or_fail_func_t, destroy: destroy_func_t | null): void;

    function font_funcs_set_variation_glyph_func(ffuncs: font_funcs_t, func: font_get_variation_glyph_func_t, destroy: destroy_func_t | null): void;

    function font_get_empty(): font_t;

    function font_get_extents_for_direction(font: font_t, direction: direction_t): font_extents_t;

    function font_get_face(font: font_t): face_t;

    function font_get_glyph(font: font_t, unicode: codepoint_t, variation_selector: codepoint_t): [bool_t, codepoint_t];

    function font_get_glyph_advance_for_direction(font: font_t, glyph: codepoint_t, direction: direction_t): [position_t, position_t];

    function font_get_glyph_advances_for_direction(font: font_t, direction: direction_t, count: number, first_glyph: codepoint_t, glyph_stride: number): [position_t, number];

    function font_get_glyph_contour_point(font: font_t, glyph: codepoint_t, point_index: number): [bool_t, position_t, position_t];

    function font_get_glyph_contour_point_for_origin(font: font_t, glyph: codepoint_t, point_index: number, direction: direction_t): [bool_t, position_t, position_t];

    function font_get_glyph_extents(font: font_t, glyph: codepoint_t): [bool_t, glyph_extents_t];

    function font_get_glyph_extents_for_origin(font: font_t, glyph: codepoint_t, direction: direction_t): [bool_t, glyph_extents_t];

    function font_get_glyph_from_name(font: font_t, name: string[]): [bool_t, codepoint_t];

    function font_get_glyph_h_advance(font: font_t, glyph: codepoint_t): position_t;

    function font_get_glyph_h_advances(font: font_t, count: number, first_glyph: codepoint_t, glyph_stride: number, advance_stride: number): position_t;

    function font_get_glyph_h_kerning(font: font_t, left_glyph: codepoint_t, right_glyph: codepoint_t): position_t;

    function font_get_glyph_h_origin(font: font_t, glyph: codepoint_t): [bool_t, position_t, position_t];

    function font_get_glyph_h_origins(font: font_t, count: number, first_glyph: codepoint_t, glyph_stride: number, x_stride: number, y_stride: number): [bool_t, position_t, position_t];

    function font_get_glyph_kerning_for_direction(font: font_t, first_glyph: codepoint_t, second_glyph: codepoint_t, direction: direction_t): [position_t, position_t];

    function font_get_glyph_name(font: font_t, glyph: codepoint_t): [bool_t, string[]];

    function font_get_glyph_origin_for_direction(font: font_t, glyph: codepoint_t, direction: direction_t): [position_t, position_t];

    function font_get_glyph_shape(font: font_t, glyph: codepoint_t, dfuncs: draw_funcs_t, draw_data: null): void;

    function font_get_glyph_v_advance(font: font_t, glyph: codepoint_t): position_t;

    function font_get_glyph_v_advances(font: font_t, count: number, first_glyph: codepoint_t, glyph_stride: number): [position_t, number];

    function font_get_glyph_v_kerning(font: font_t, top_glyph: codepoint_t, bottom_glyph: codepoint_t): position_t;

    function font_get_glyph_v_origin(font: font_t, glyph: codepoint_t): [bool_t, position_t, position_t];

    function font_get_glyph_v_origins(font: font_t, count: number, first_glyph: codepoint_t, glyph_stride: number, x_stride: number, y_stride: number): [bool_t, position_t, position_t];

    function font_get_h_extents(font: font_t): [bool_t, font_extents_t];

    function font_get_nominal_glyph(font: font_t, unicode: codepoint_t): [bool_t, codepoint_t];

    function font_get_nominal_glyphs(font: font_t, count: number, first_unicode: codepoint_t, unicode_stride: number, glyph_stride: number): [number, codepoint_t];

    function font_get_parent(font: font_t): font_t;

    function font_get_ppem(font: font_t): [number, number];

    function font_get_ptem(font: font_t): number;

    function font_get_scale(font: font_t): [number, number];

    function font_get_serial(font: font_t): number;

    function font_get_synthetic_bold(font: font_t): [number, number, bool_t];

    function font_get_synthetic_slant(font: font_t): number;

    function font_get_v_extents(font: font_t): [bool_t, font_extents_t];

    function font_get_var_coords_design(font: font_t): [number, number];

    function font_get_var_coords_normalized(font: font_t): [number, number];

    function font_get_var_named_instance(font: font_t): number;

    function font_get_variation_glyph(font: font_t, unicode: codepoint_t, variation_selector: codepoint_t): [bool_t, codepoint_t];

    function font_glyph_from_string(font: font_t, s: Uint8Array | string): [bool_t, codepoint_t];

    function font_glyph_to_string(font: font_t, glyph: codepoint_t): string[];

    function font_is_immutable(font: font_t): bool_t;

    function font_is_synthetic(font: font_t): bool_t;

    function font_list_funcs(): string[];

    function font_make_immutable(font: font_t): void;

    function font_paint_glyph(font: font_t, glyph: codepoint_t, pfuncs: paint_funcs_t, paint_data: null, palette_index: number, foreground: color_t): void;

    function font_paint_glyph_or_fail(font: font_t, glyph: codepoint_t, pfuncs: paint_funcs_t, paint_data: null, palette_index: number, foreground: color_t): bool_t;

    function font_set_face(font: font_t, face: face_t): void;

    function font_set_funcs(font: font_t, klass: font_funcs_t, destroy: destroy_func_t | null): void;

    function font_set_funcs_data(font: font_t, destroy: destroy_func_t | null): void;

    function font_set_funcs_using(font: font_t, name: string): bool_t;

    function font_set_parent(font: font_t, parent: font_t): void;

    function font_set_ppem(font: font_t, x_ppem: number, y_ppem: number): void;

    function font_set_ptem(font: font_t, ptem: number): void;

    function font_set_scale(font: font_t, x_scale: number, y_scale: number): void;

    function font_set_synthetic_bold(font: font_t, x_embolden: number, y_embolden: number, in_place: bool_t): void;

    function font_set_synthetic_slant(font: font_t, slant: number): void;

    function font_set_var_coords_design(font: font_t, coords: number[]): void;

    function font_set_var_coords_normalized(font: font_t, coords: number[]): void;

    function font_set_var_named_instance(font: font_t, instance_index: number): void;

    function font_set_variation(font: font_t, tag: tag_t, value: number): void;

    function font_set_variations(font: font_t, variations: variation_t[]): void;

    function font_subtract_glyph_origin_for_direction(font: font_t, glyph: codepoint_t, direction: direction_t, x: position_t, y: position_t): [position_t, position_t];

    function free(ptr: null): void;

    function ft_face_create(ft_face: freetype2.Face, destroy: destroy_func_t | null): face_t;

    function ft_face_create_cached(ft_face: freetype2.Face): face_t;

    function ft_face_create_from_blob_or_fail(blob: blob_t, index: number): face_t;

    function ft_face_create_from_file_or_fail(file_name: string, index: number): face_t;

    function ft_face_create_referenced(ft_face: freetype2.Face): face_t;

    function ft_font_changed(font: font_t): void;

    function ft_font_create(ft_face: freetype2.Face, destroy: destroy_func_t | null): font_t;

    function ft_font_create_referenced(ft_face: freetype2.Face): font_t;

    function ft_font_get_load_flags(font: font_t): number;

    function ft_font_set_funcs(font: font_t): void;

    function ft_font_set_load_flags(font: font_t, load_flags: number): void;

    function ft_hb_font_changed(font: font_t): bool_t;

    function glib_blob_create(gbytes: GLib.Bytes | Uint8Array): blob_t;

    function glib_get_unicode_funcs(): unicode_funcs_t;

    function glib_script_from_script(script: script_t): GLib.UnicodeScript;

    function glib_script_to_script(script: GLib.UnicodeScript): script_t;

    function glyph_info_get_glyph_flags(info: glyph_info_t): glyph_flags_t;

    function language_from_string(str: Uint8Array | string): language_t;

    function language_get_default(): language_t;

    function language_matches(language: language_t, specific: language_t): bool_t;

    function language_to_string(language: language_t): string;

    function malloc(size: bigint | number): null;

    function map_allocation_successful(map: map_t): bool_t;

    function map_clear(map: map_t): void;

    function map_copy(map: map_t): map_t;

    function map_create(): map_t;

    function map_del(map: map_t, key: codepoint_t): void;

    function map_get(map: map_t, key: codepoint_t): codepoint_t;

    function map_get_empty(): map_t;

    function map_get_population(map: map_t): number;

    function map_has(map: map_t, key: codepoint_t): bool_t;

    function map_hash(map: map_t): number;

    function map_is_empty(map: map_t): bool_t;

    function map_is_equal(map: map_t, other: map_t): bool_t;

    function map_keys(map: map_t, keys: set_t): void;

    function map_next(map: map_t, idx: number): [bool_t, number, codepoint_t, codepoint_t];

    function map_set(map: map_t, key: codepoint_t, value: codepoint_t): void;

    function map_update(map: map_t, other: map_t): void;

    function map_values(map: map_t, values: set_t): void;

    function ot_color_get_svg_document_count(face: face_t): number;

    function ot_color_get_svg_document_glyph_range(face: face_t, svg_document_index: number): [bool_t, codepoint_t | null, codepoint_t | null];

    function ot_color_glyph_get_layers(face: face_t, glyph: codepoint_t, start_offset: number): [number, ot_color_layer_t[] | null];

    function ot_color_glyph_get_svg_document_index(face: face_t, glyph: codepoint_t): [bool_t, number];

    function ot_color_glyph_has_paint(face: face_t, glyph: codepoint_t): bool_t;

    function ot_color_glyph_reference_png(font: font_t, glyph: codepoint_t): blob_t;

    function ot_color_glyph_reference_svg(face: face_t, glyph: codepoint_t): blob_t;

    function ot_color_has_layers(face: face_t): bool_t;

    function ot_color_has_paint(face: face_t): bool_t;

    function ot_color_has_palettes(face: face_t): bool_t;

    function ot_color_has_png(face: face_t): bool_t;

    function ot_color_has_svg(face: face_t): bool_t;

    function ot_color_palette_color_get_name_id(face: face_t, color_index: number): ot_name_id_t;

    function ot_color_palette_get_colors(face: face_t, palette_index: number, start_offset: number): [number, color_t[] | null];

    function ot_color_palette_get_count(face: face_t): number;

    function ot_color_palette_get_flags(face: face_t, palette_index: number): ot_color_palette_flags_t;

    function ot_color_palette_get_name_id(face: face_t, palette_index: number): ot_name_id_t;

    function ot_fetch_bits(face: face_t, tag: ot_bits_tag_t): number;

    function ot_fetch_number(face: face_t, tag: ot_number_tag_t): number;

    function ot_font_set_funcs(font: font_t): void;

    function ot_layout_collect_features(face: face_t, table_tag: tag_t, scripts: tag_t[] | null, languages: tag_t[] | null, features: tag_t[] | null): set_t;

    function ot_layout_collect_features_map(face: face_t, table_tag: tag_t, script_index: number, language_index: number): map_t;

    function ot_layout_collect_lookups(face: face_t, table_tag: tag_t, scripts: tag_t[] | null, languages: tag_t[] | null, features: tag_t[] | null): set_t;

    function ot_layout_feature_get_characters(face: face_t, table_tag: tag_t, feature_index: number, start_offset: number): [number, codepoint_t[] | null];

    function ot_layout_feature_get_lookups(face: face_t, table_tag: tag_t, feature_index: number, start_offset: number): [number, number[] | null];

    function ot_layout_feature_get_name_ids(face: face_t, table_tag: tag_t, feature_index: number): [bool_t, ot_name_id_t | null, ot_name_id_t | null, ot_name_id_t | null, number, ot_name_id_t | null];

    function ot_layout_feature_with_variations_get_lookups(face: face_t, table_tag: tag_t, feature_index: number, variations_index: number, start_offset: number): [number, number[] | null];

    function ot_layout_get_attach_points(face: face_t, glyph: codepoint_t, start_offset: number): [number, number[] | null];

    function ot_layout_get_baseline(font: font_t, baseline_tag: ot_layout_baseline_tag_t, direction: direction_t, script_tag: tag_t, language_tag: tag_t): [bool_t, position_t | null];

    function ot_layout_get_baseline2(font: font_t, baseline_tag: ot_layout_baseline_tag_t, direction: direction_t, script: script_t, language: language_t | null): [bool_t, position_t | null];

    function ot_layout_get_baseline_with_fallback(font: font_t, baseline_tag: ot_layout_baseline_tag_t, direction: direction_t, script_tag: tag_t, language_tag: tag_t): position_t;

    function ot_layout_get_baseline_with_fallback2(font: font_t, baseline_tag: ot_layout_baseline_tag_t, direction: direction_t, script: script_t, language: language_t | null): position_t;

    function ot_layout_get_font_extents(font: font_t, direction: direction_t, script_tag: tag_t, language_tag: tag_t): [bool_t, font_extents_t | null];

    function ot_layout_get_font_extents2(font: font_t, direction: direction_t, script: script_t, language: language_t | null): [bool_t, font_extents_t | null];

    function ot_layout_get_glyph_class(face: face_t, glyph: codepoint_t): ot_layout_glyph_class_t;

    function ot_layout_get_glyphs_in_class(face: face_t, klass: ot_layout_glyph_class_t): set_t;

    function ot_layout_get_horizontal_baseline_tag_for_script(script: script_t): ot_layout_baseline_tag_t;

    function ot_layout_get_ligature_carets(font: font_t, direction: direction_t, glyph: codepoint_t, start_offset: number): [number, position_t[] | null];

    function ot_layout_get_size_params(face: face_t): [bool_t, number, number, ot_name_id_t, number, number];

    function ot_layout_has_glyph_classes(face: face_t): bool_t;

    function ot_layout_has_positioning(face: face_t): bool_t;

    function ot_layout_has_substitution(face: face_t): bool_t;

    function ot_layout_language_find_feature(face: face_t, table_tag: tag_t, script_index: number, language_index: number, feature_tag: tag_t): [bool_t, number];

    function ot_layout_language_get_feature_indexes(face: face_t, table_tag: tag_t, script_index: number, language_index: number, start_offset: number): [number, number[] | null];

    function ot_layout_language_get_feature_tags(face: face_t, table_tag: tag_t, script_index: number, language_index: number, start_offset: number): [number, tag_t[] | null];

    function ot_layout_language_get_required_feature(face: face_t, table_tag: tag_t, script_index: number, language_index: number): [bool_t, number, tag_t];

    function ot_layout_language_get_required_feature_index(face: face_t, table_tag: tag_t, script_index: number, language_index: number): [bool_t, number];

    function ot_layout_lookup_collect_glyph_alternates(face: face_t, lookup_index: number, alternate_count: map_t, alternate_glyphs: map_t): [bool_t, map_t, map_t];

    function ot_layout_lookup_collect_glyphs(face: face_t, table_tag: tag_t, lookup_index: number): [set_t | null, set_t | null, set_t | null, set_t | null];

    function ot_layout_lookup_get_glyph_alternates(face: face_t, lookup_index: number, glyph: codepoint_t, start_offset: number): [number, codepoint_t[] | null];

    function ot_layout_lookup_get_optical_bound(font: font_t, lookup_index: number, direction: direction_t, glyph: codepoint_t): position_t;

    function ot_layout_lookup_substitute_closure(face: face_t, lookup_index: number): set_t;

    function ot_layout_lookup_would_substitute(face: face_t, lookup_index: number, glyphs: codepoint_t, glyphs_length: number, zero_context: bool_t): bool_t;

    function ot_layout_lookups_substitute_closure(face: face_t, lookups: set_t): set_t;

    function ot_layout_script_find_language(face: face_t, table_tag: tag_t, script_index: number, language_tag: tag_t, language_index: number): bool_t;

    function ot_layout_script_get_language_tags(face: face_t, table_tag: tag_t, script_index: number, start_offset: number): [number, tag_t[] | null];

    function ot_layout_script_select_language(face: face_t, table_tag: tag_t, script_index: number, language_count: number, language_tags: tag_t): [bool_t, number];

    function ot_layout_script_select_language2(face: face_t, table_tag: tag_t, script_index: number, language_count: number, language_tags: tag_t): [bool_t, number, tag_t];

    function ot_layout_table_choose_script(face: face_t, table_tag: tag_t, script_tags: tag_t): [bool_t, number, tag_t];

    function ot_layout_table_find_feature_variations(face: face_t, table_tag: tag_t, coords: number, num_coords: number): [bool_t, number];

    function ot_layout_table_find_script(face: face_t, table_tag: tag_t, script_tag: tag_t): [bool_t, number];

    function ot_layout_table_get_feature_tags(face: face_t, table_tag: tag_t, start_offset: number): [number, tag_t[] | null];

    function ot_layout_table_get_lookup_count(face: face_t, table_tag: tag_t): number;

    function ot_layout_table_get_script_tags(face: face_t, table_tag: tag_t, start_offset: number): [number, tag_t[] | null];

    function ot_layout_table_select_script(face: face_t, table_tag: tag_t, script_count: number, script_tags: tag_t): [bool_t, number, tag_t | null];

    function ot_math_get_constant(font: font_t, constant: ot_math_constant_t): position_t;

    function ot_math_get_glyph_assembly(font: font_t, glyph: codepoint_t, direction: direction_t, start_offset: number): [number, ot_math_glyph_part_t[] | null, position_t];

    function ot_math_get_glyph_italics_correction(font: font_t, glyph: codepoint_t): position_t;

    function ot_math_get_glyph_kerning(font: font_t, glyph: codepoint_t, kern: ot_math_kern_t, correction_height: position_t): position_t;

    function ot_math_get_glyph_kernings(font: font_t, glyph: codepoint_t, kern: ot_math_kern_t, start_offset: number): [number, ot_math_kern_entry_t[] | null];

    function ot_math_get_glyph_top_accent_attachment(font: font_t, glyph: codepoint_t): position_t;

    function ot_math_get_glyph_variants(font: font_t, glyph: codepoint_t, direction: direction_t, start_offset: number): [number, ot_math_glyph_variant_t[] | null];

    function ot_math_get_min_connector_overlap(font: font_t, direction: direction_t): position_t;

    function ot_math_has_data(face: face_t): bool_t;

    function ot_math_is_glyph_extended_shape(face: face_t, glyph: codepoint_t): bool_t;

    function ot_meta_get_entry_tags(face: face_t, start_offset: number): [number, ot_meta_tag_t[] | null];

    function ot_meta_reference_entry(face: face_t, meta_tag: ot_meta_tag_t): blob_t;

    function ot_metrics_get_position(font: font_t, metrics_tag: ot_metrics_tag_t): [bool_t, position_t | null];

    function ot_metrics_get_position_with_fallback(font: font_t, metrics_tag: ot_metrics_tag_t): position_t | null;

    function ot_metrics_get_variation(font: font_t, metrics_tag: ot_metrics_tag_t): number;

    function ot_metrics_get_x_variation(font: font_t, metrics_tag: ot_metrics_tag_t): position_t;

    function ot_metrics_get_y_variation(font: font_t, metrics_tag: ot_metrics_tag_t): position_t;

    function ot_name_get_utf16(face: face_t, name_id: ot_name_id_t, language: language_t): [number, number[]];

    function ot_name_get_utf32(face: face_t, name_id: ot_name_id_t, language: language_t): [number, number[]];

    function ot_name_get_utf8(face: face_t, name_id: ot_name_id_t, language: language_t): [number, string[]];

    function ot_name_list_names(face: face_t): ot_name_entry_t[];

    function ot_shape_get_buffer_format_serial(): number;

    function ot_shape_glyphs_closure(font: font_t, buffer: buffer_t, features: feature_t[]): set_t;

    function ot_shape_plan_collect_lookups(shape_plan: shape_plan_t, table_tag: tag_t): set_t;

    function ot_shape_plan_get_feature_tags(shape_plan: shape_plan_t, start_offset: number): [number, tag_t[]];

    function ot_tag_from_language(language: language_t): tag_t;

    function ot_tag_to_language(tag: tag_t): language_t | null;

    function ot_tag_to_script(tag: tag_t): script_t;

    function ot_tags_from_script(script: script_t): [tag_t, tag_t];

    function ot_tags_from_script_and_language(script: script_t, language: language_t | null, script_count: number | null, language_count: number | null): [number | null, tag_t | null, number | null, tag_t | null];

    function ot_tags_to_script_and_language(script_tag: tag_t, language_tag: tag_t): [script_t | null, language_t | null];

    function ot_var_find_axis(face: face_t, axis_tag: tag_t, axis_index: number): [bool_t, ot_var_axis_t];

    function ot_var_find_axis_info(face: face_t, axis_tag: tag_t): [bool_t, ot_var_axis_info_t];

    function ot_var_get_axes(face: face_t, start_offset: number): [number, ot_var_axis_t[] | null];

    function ot_var_get_axis_count(face: face_t): number;

    function ot_var_get_axis_infos(face: face_t, start_offset: number): [number, ot_var_axis_info_t[] | null];

    function ot_var_get_named_instance_count(face: face_t): number;

    function ot_var_has_data(face: face_t): bool_t;

    function ot_var_named_instance_get_design_coords(face: face_t, instance_index: number): [number, number[] | null];

    function ot_var_named_instance_get_postscript_name_id(face: face_t, instance_index: number): ot_name_id_t;

    function ot_var_named_instance_get_subfamily_name_id(face: face_t, instance_index: number): ot_name_id_t;

    function ot_var_normalize_coords(face: face_t, coords_length: number, design_coords: number): number;

    function ot_var_normalize_variations(face: face_t, variations: variation_t, variations_length: number): number[];

    function paint_color(funcs: paint_funcs_t, paint_data: null, is_foreground: bool_t, color: color_t): void;

    function paint_color_glyph(funcs: paint_funcs_t, paint_data: null, glyph: codepoint_t, font: font_t): bool_t;

    function paint_custom_palette_color(funcs: paint_funcs_t, paint_data: null, color_index: number): [bool_t, color_t];

    function paint_fill_glyph(funcs: paint_funcs_t, paint_data: null, glyph: codepoint_t, font: font_t, is_foreground: bool_t, color: color_t): void;

    function paint_funcs_create(): paint_funcs_t;

    function paint_funcs_get_empty(): paint_funcs_t;

    function paint_funcs_is_immutable(funcs: paint_funcs_t): bool_t;

    function paint_funcs_make_immutable(funcs: paint_funcs_t): void;

    function paint_funcs_set_color_func(funcs: paint_funcs_t, func: paint_color_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_color_glyph_func(funcs: paint_funcs_t, func: paint_color_glyph_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_custom_palette_color_func(funcs: paint_funcs_t, func: paint_custom_palette_color_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_fill_glyph_func(funcs: paint_funcs_t, func: paint_fill_glyph_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_get_budget_func(funcs: paint_funcs_t, func: paint_get_budget_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_get_budget_remaining_func(funcs: paint_funcs_t, func: paint_get_budget_remaining_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_image_func(funcs: paint_funcs_t, func: paint_image_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_linear_gradient_func(funcs: paint_funcs_t, func: paint_linear_gradient_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_pop_clip_func(funcs: paint_funcs_t, func: paint_pop_clip_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_pop_group_func(funcs: paint_funcs_t, func: paint_pop_group_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_pop_transform_func(funcs: paint_funcs_t, func: paint_pop_transform_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_push_clip_glyph_func(funcs: paint_funcs_t, func: paint_push_clip_glyph_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_push_clip_path_end_func(funcs: paint_funcs_t, func: paint_push_clip_path_end_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_push_clip_path_start_func(funcs: paint_funcs_t, func: paint_push_clip_path_start_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_push_clip_rectangle_func(funcs: paint_funcs_t, func: paint_push_clip_rectangle_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_push_group_for_func(funcs: paint_funcs_t, func: paint_push_group_for_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_push_group_func(funcs: paint_funcs_t, func: paint_push_group_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_push_transform_func(funcs: paint_funcs_t, func: paint_push_transform_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_radial_gradient_func(funcs: paint_funcs_t, func: paint_radial_gradient_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_set_budget_func(funcs: paint_funcs_t, func: paint_set_budget_func_t, destroy: destroy_func_t | null): void;

    function paint_funcs_set_sweep_gradient_func(funcs: paint_funcs_t, func: paint_sweep_gradient_func_t, destroy: destroy_func_t | null): void;

    function paint_get_budget(funcs: paint_funcs_t, paint_data: null): number;

    function paint_get_budget_remaining(funcs: paint_funcs_t, paint_data: null): number;

    function paint_image(funcs: paint_funcs_t, paint_data: null, image: blob_t, width: number, height: number, format: tag_t, slant: number, extents: glyph_extents_t | null): void;

    function paint_linear_gradient(funcs: paint_funcs_t, paint_data: null, color_line: color_line_t, x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): void;

    function paint_normalize_color_line(stops: color_stop_t[]): [color_stop_t[], number, number];

    function paint_pop_clip(funcs: paint_funcs_t, paint_data: null): void;

    function paint_pop_group(funcs: paint_funcs_t, paint_data: null, mode: paint_composite_mode_t): void;

    function paint_pop_transform(funcs: paint_funcs_t, paint_data: null): void;

    function paint_push_clip_glyph(funcs: paint_funcs_t, paint_data: null, glyph: codepoint_t, font: font_t): void;

    function paint_push_clip_path_end(funcs: paint_funcs_t, paint_data: null): void;

    function paint_push_clip_path_start(funcs: paint_funcs_t, paint_data: null): [draw_funcs_t, null];

    function paint_push_clip_rectangle(funcs: paint_funcs_t, paint_data: null, xmin: number, ymin: number, xmax: number, ymax: number): void;

    function paint_push_font_transform(funcs: paint_funcs_t, paint_data: null, font: font_t): void;

    function paint_push_group(funcs: paint_funcs_t, paint_data: null): void;

    function paint_push_group_for(funcs: paint_funcs_t, paint_data: null, mode: paint_composite_mode_t): void;

    function paint_push_inverse_font_transform(funcs: paint_funcs_t, paint_data: null, font: font_t): void;

    function paint_push_transform(funcs: paint_funcs_t, paint_data: null, xx: number, yx: number, xy: number, yy: number, dx: number, dy: number): void;

    function paint_radial_gradient(funcs: paint_funcs_t, paint_data: null, color_line: color_line_t, x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): void;

    function paint_reduce_linear_anchors(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): [number, number, number, number];

    function paint_set_budget(funcs: paint_funcs_t, paint_data: null, budget: bigint | number): bool_t;

    function paint_sweep_gradient(funcs: paint_funcs_t, paint_data: null, color_line: color_line_t, x0: number, y0: number, start_angle: number, end_angle: number): void;

    function paint_sweep_gradient_tiles(stops: color_stop_t[], extend: paint_extend_t, start_angle: number, end_angle: number, emit_patch: paint_sweep_gradient_tile_func_t): color_stop_t[];

    function realloc(ptr: null, size: bigint | number): null;

    function script_from_iso15924_tag(tag: tag_t): script_t;

    function script_from_string(str: Uint8Array | string): script_t;

    function script_get_horizontal_direction(script: script_t): direction_t;

    function script_to_iso15924_tag(script: script_t): tag_t;

    function segment_properties_equal(a: segment_properties_t, b: segment_properties_t): bool_t;

    function segment_properties_hash(p: segment_properties_t): number;

    function segment_properties_overlay(p: segment_properties_t, src: segment_properties_t): void;

    function set_add(set: set_t, codepoint: codepoint_t): void;

    function set_add_range(set: set_t, first: codepoint_t, last: codepoint_t): void;

    function set_add_sorted_array(set: set_t, sorted_codepoints: codepoint_t[]): void;

    function set_allocation_successful(set: set_t): bool_t;

    function set_clear(set: set_t): void;

    function set_copy(set: set_t): set_t;

    function set_create(): set_t;

    function set_del(set: set_t, codepoint: codepoint_t): void;

    function set_del_range(set: set_t, first: codepoint_t, last: codepoint_t): void;

    function set_get_empty(): set_t;

    function set_get_max(set: set_t): codepoint_t;

    function set_get_min(set: set_t): codepoint_t;

    function set_get_population(set: set_t): number;

    function set_has(set: set_t, codepoint: codepoint_t): bool_t;

    function set_hash(set: set_t): number;

    function set_intersect(set: set_t, other: set_t): void;

    function set_intersects(set: set_t, other: set_t): bool_t;

    function set_invert(set: set_t): void;

    function set_is_empty(set: set_t): bool_t;

    function set_is_equal(set: set_t, other: set_t): bool_t;

    function set_is_inverted(set: set_t): bool_t;

    function set_is_subset(set: set_t, larger_set: set_t): bool_t;

    function set_next(set: set_t, codepoint: codepoint_t): [bool_t, codepoint_t];

    function set_next_many(set: set_t, codepoint: codepoint_t, out: codepoint_t[]): number;

    function set_next_range(set: set_t, last: codepoint_t): [bool_t, codepoint_t, codepoint_t];

    function set_previous(set: set_t, codepoint: codepoint_t): [bool_t, codepoint_t];

    function set_previous_range(set: set_t, first: codepoint_t): [bool_t, codepoint_t, codepoint_t];

    function set_set(set: set_t, other: set_t): void;

    function set_subtract(set: set_t, other: set_t): void;

    function set_symmetric_difference(set: set_t, other: set_t): void;

    function set_union(set: set_t, other: set_t): void;

    function shape(font: font_t, buffer: buffer_t, features: feature_t[] | null): void;

    function shape_full(font: font_t, buffer: buffer_t, features: feature_t[] | null, shaper_list: string[] | null): bool_t;

    function shape_list_shapers(): string[];

    function shape_plan_create(face: face_t, props: segment_properties_t, user_features: feature_t[], shaper_list: string[]): shape_plan_t;

    function shape_plan_create2(face: face_t, props: segment_properties_t, user_features: feature_t[], coords: number[], shaper_list: string[]): shape_plan_t;

    function shape_plan_create_cached(face: face_t, props: segment_properties_t, user_features: feature_t[], shaper_list: string[]): shape_plan_t;

    function shape_plan_create_cached2(face: face_t, props: segment_properties_t, user_features: feature_t[], coords: number[], shaper_list: string[]): shape_plan_t;

    function shape_plan_execute(shape_plan: shape_plan_t, font: font_t, buffer: buffer_t, features: feature_t[]): bool_t;

    function shape_plan_get_empty(): shape_plan_t;

    function shape_plan_get_shaper(shape_plan: shape_plan_t): string;

    function style_get_value(font: font_t, style_tag: style_tag_t): number;

    function tag_from_string(str: Uint8Array | string): tag_t;

    function tag_to_string(tag: tag_t): Uint8Array;

    function unicode_combining_class(ufuncs: unicode_funcs_t, unicode: codepoint_t): unicode_combining_class_t;

    function unicode_compose(ufuncs: unicode_funcs_t, a: codepoint_t, b: codepoint_t): [bool_t, codepoint_t];

    function unicode_decompose(ufuncs: unicode_funcs_t, ab: codepoint_t): [bool_t, codepoint_t, codepoint_t];

    function unicode_decompose_compatibility(ufuncs: unicode_funcs_t, u: codepoint_t): [number, codepoint_t];

    function unicode_eastasian_width(ufuncs: unicode_funcs_t, unicode: codepoint_t): number;

    function unicode_funcs_create(parent: unicode_funcs_t | null): unicode_funcs_t;

    function unicode_funcs_get_default(): unicode_funcs_t;

    function unicode_funcs_get_empty(): unicode_funcs_t;

    function unicode_funcs_get_parent(ufuncs: unicode_funcs_t): unicode_funcs_t;

    function unicode_funcs_is_immutable(ufuncs: unicode_funcs_t): bool_t;

    function unicode_funcs_make_immutable(ufuncs: unicode_funcs_t): void;

    function unicode_funcs_set_combining_class_func(ufuncs: unicode_funcs_t, func: unicode_combining_class_func_t, destroy: destroy_func_t | null): void;

    function unicode_funcs_set_compose_func(ufuncs: unicode_funcs_t, func: unicode_compose_func_t, destroy: destroy_func_t | null): void;

    function unicode_funcs_set_decompose_compatibility_func(ufuncs: unicode_funcs_t, func: unicode_decompose_compatibility_func_t, destroy: destroy_func_t | null): void;

    function unicode_funcs_set_decompose_func(ufuncs: unicode_funcs_t, func: unicode_decompose_func_t, destroy: destroy_func_t | null): void;

    function unicode_funcs_set_eastasian_width_func(ufuncs: unicode_funcs_t, func: unicode_eastasian_width_func_t, destroy: destroy_func_t | null): void;

    function unicode_funcs_set_general_category_func(ufuncs: unicode_funcs_t, func: unicode_general_category_func_t, destroy: destroy_func_t | null): void;

    function unicode_funcs_set_mirroring_func(ufuncs: unicode_funcs_t, func: unicode_mirroring_func_t, destroy: destroy_func_t | null): void;

    function unicode_funcs_set_script_func(ufuncs: unicode_funcs_t, func: unicode_script_func_t, destroy: destroy_func_t | null): void;

    function unicode_general_category(ufuncs: unicode_funcs_t, unicode: codepoint_t): unicode_general_category_t;

    function unicode_mirroring(ufuncs: unicode_funcs_t, unicode: codepoint_t): codepoint_t;

    function unicode_script(ufuncs: unicode_funcs_t, unicode: codepoint_t): script_t;

    function variation_from_string(str: Uint8Array | string): [bool_t, variation_t];

    function variation_to_string(variation: variation_t): string[];

    interface buffer_message_func_t {
        (buffer: buffer_t, font: font_t, message: string): bool_t;
    }

    interface color_line_get_color_stops_func_t {
        (color_line: color_line_t, color_line_data: null, start: number): number;
    }

    interface color_line_get_extend_func_t {
        (color_line: color_line_t, color_line_data: null): paint_extend_t;
    }

    interface destroy_func_t {
        (user_data: null): void;
    }

    interface draw_close_path_func_t {
        (dfuncs: draw_funcs_t, draw_data: null, st: draw_state_t): void;
    }

    interface draw_cubic_to_func_t {
        (dfuncs: draw_funcs_t, draw_data: null, st: draw_state_t, control1_x: number, control1_y: number, control2_x: number, control2_y: number, to_x: number, to_y: number): void;
    }

    interface draw_get_budget_func_t {
        (dfuncs: draw_funcs_t, draw_data: null): bigint | number;
    }

    interface draw_get_budget_remaining_func_t {
        (dfuncs: draw_funcs_t, draw_data: null): bigint | number | null;
    }

    interface draw_line_to_func_t {
        (dfuncs: draw_funcs_t, draw_data: null, st: draw_state_t, to_x: number, to_y: number): void;
    }

    interface draw_move_to_func_t {
        (dfuncs: draw_funcs_t, draw_data: null, st: draw_state_t, to_x: number, to_y: number): void;
    }

    interface draw_quadratic_to_func_t {
        (dfuncs: draw_funcs_t, draw_data: null, st: draw_state_t, control_x: number, control_y: number, to_x: number, to_y: number): void;
    }

    interface draw_set_budget_func_t {
        (dfuncs: draw_funcs_t, draw_data: null, budget: number): bool_t;
    }

    interface font_draw_glyph_func_t {
        (font: font_t, font_data: null, glyph: codepoint_t, draw_funcs: draw_funcs_t, draw_data: null): void;
    }

    interface font_draw_glyph_or_fail_func_t {
        (font: font_t, font_data: null, glyph: codepoint_t, draw_funcs: draw_funcs_t, draw_data: null): bool_t;
    }

    interface font_get_font_extents_func_t {
        (font: font_t, font_data: null): bool_t;
    }

    interface font_get_glyph_advance_func_t {
        (font: font_t, font_data: null, glyph: codepoint_t): position_t;
    }

    interface font_get_glyph_advances_func_t {
        (font: font_t, font_data: null, count: number, first_glyph: codepoint_t, glyph_stride: number, advance_stride: number): void;
    }

    interface font_get_glyph_contour_point_func_t {
        (font: font_t, font_data: null, glyph: codepoint_t, point_index: number): bool_t;
    }

    interface font_get_glyph_extents_func_t {
        (font: font_t, font_data: null, glyph: codepoint_t): bool_t;
    }

    interface font_get_glyph_from_name_func_t {
        (font: font_t, font_data: null, name: string[]): bool_t;
    }

    interface font_get_glyph_func_t {
        (font: font_t, font_data: null, unicode: codepoint_t, variation_selector: codepoint_t): bool_t;
    }

    interface font_get_glyph_kerning_func_t {
        (font: font_t, font_data: null, first_glyph: codepoint_t, second_glyph: codepoint_t): position_t;
    }

    interface font_get_glyph_name_func_t {
        (font: font_t, font_data: null, glyph: codepoint_t): bool_t;
    }

    interface font_get_glyph_origin_func_t {
        (font: font_t, font_data: null, glyph: codepoint_t): bool_t;
    }

    interface font_get_glyph_origins_func_t {
        (font: font_t, font_data: null, count: number, first_glyph: codepoint_t, glyph_stride: number, x_stride: number, y_stride: number): bool_t;
    }

    interface font_get_glyph_shape_func_t {
        (font: font_t, font_data: null, glyph: codepoint_t, draw_funcs: draw_funcs_t, draw_data: null): void;
    }

    interface font_get_nominal_glyph_func_t {
        (font: font_t, font_data: null, unicode: codepoint_t): bool_t;
    }

    interface font_get_nominal_glyphs_func_t {
        (font: font_t, font_data: null, count: number, first_unicode: codepoint_t, unicode_stride: number, glyph_stride: number): number;
    }

    interface font_get_variation_glyph_func_t {
        (font: font_t, font_data: null, unicode: codepoint_t, variation_selector: codepoint_t): bool_t;
    }

    interface font_paint_glyph_func_t {
        (font: font_t, font_data: null, glyph: codepoint_t, paint_funcs: paint_funcs_t, paint_data: null, palette_index: number, foreground: color_t): bool_t;
    }

    interface font_paint_glyph_or_fail_func_t {
        (font: font_t, font_data: null, glyph: codepoint_t, paint_funcs: paint_funcs_t, paint_data: null, palette_index: number, foreground: color_t): bool_t;
    }

    interface get_table_tags_func_t {
        (face: face_t, start_offset: number): number;
    }

    interface paint_color_func_t {
        (funcs: paint_funcs_t, paint_data: null, is_foreground: bool_t, color: color_t): void;
    }

    interface paint_color_glyph_func_t {
        (funcs: paint_funcs_t, paint_data: null, glyph: codepoint_t, font: font_t): bool_t;
    }

    interface paint_custom_palette_color_func_t {
        (funcs: paint_funcs_t, paint_data: null, color_index: number): bool_t;
    }

    interface paint_fill_glyph_func_t {
        (funcs: paint_funcs_t, paint_data: null, glyph: codepoint_t, font: font_t, is_foreground: bool_t, color: color_t): void;
    }

    interface paint_get_budget_func_t {
        (funcs: paint_funcs_t, paint_data: null): bigint | number;
    }

    interface paint_get_budget_remaining_func_t {
        (funcs: paint_funcs_t, paint_data: null): bigint | number | null;
    }

    interface paint_image_func_t {
        (funcs: paint_funcs_t, paint_data: null, image: blob_t, width: number, height: number, format: tag_t, slant: number, extents: glyph_extents_t | null): bool_t;
    }

    interface paint_linear_gradient_func_t {
        (funcs: paint_funcs_t, paint_data: null, color_line: color_line_t, x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): void;
    }

    interface paint_pop_clip_func_t {
        (funcs: paint_funcs_t, paint_data: null): void;
    }

    interface paint_pop_group_func_t {
        (funcs: paint_funcs_t, paint_data: null, mode: paint_composite_mode_t): void;
    }

    interface paint_pop_transform_func_t {
        (funcs: paint_funcs_t, paint_data: null): void;
    }

    interface paint_push_clip_glyph_func_t {
        (funcs: paint_funcs_t, paint_data: null, glyph: codepoint_t, font: font_t): void;
    }

    interface paint_push_clip_path_end_func_t {
        (funcs: paint_funcs_t, paint_data: null): void;
    }

    interface paint_push_clip_path_start_func_t {
        (funcs: paint_funcs_t, paint_data: null): draw_funcs_t;
    }

    interface paint_push_clip_rectangle_func_t {
        (funcs: paint_funcs_t, paint_data: null, xmin: number, ymin: number, xmax: number, ymax: number): void;
    }

    interface paint_push_group_for_func_t {
        (funcs: paint_funcs_t, paint_data: null, mode: paint_composite_mode_t): void;
    }

    interface paint_push_group_func_t {
        (funcs: paint_funcs_t, paint_data: null): void;
    }

    interface paint_push_transform_func_t {
        (funcs: paint_funcs_t, paint_data: null, xx: number, yx: number, xy: number, yy: number, dx: number, dy: number): void;
    }

    interface paint_radial_gradient_func_t {
        (funcs: paint_funcs_t, paint_data: null, color_line: color_line_t, x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): void;
    }

    interface paint_set_budget_func_t {
        (funcs: paint_funcs_t, paint_data: null, budget: number): bool_t;
    }

    interface paint_sweep_gradient_func_t {
        (funcs: paint_funcs_t, paint_data: null, color_line: color_line_t, x0: number, y0: number, start_angle: number, end_angle: number): void;
    }

    interface paint_sweep_gradient_tile_func_t {
        (a0: number, c0: color_t, a1: number, c1: color_t): void;
    }

    interface reference_table_func_t {
        (face: face_t, tag: tag_t): blob_t;
    }

    interface unicode_combining_class_func_t {
        (ufuncs: unicode_funcs_t, unicode: codepoint_t): unicode_combining_class_t;
    }

    interface unicode_compose_func_t {
        (ufuncs: unicode_funcs_t, a: codepoint_t, b: codepoint_t): bool_t;
    }

    interface unicode_decompose_compatibility_func_t {
        (ufuncs: unicode_funcs_t, u: codepoint_t, decomposed: codepoint_t): number;
    }

    interface unicode_decompose_func_t {
        (ufuncs: unicode_funcs_t, ab: codepoint_t): bool_t;
    }

    interface unicode_eastasian_width_func_t {
        (ufuncs: unicode_funcs_t, unicode: codepoint_t): number;
    }

    interface unicode_general_category_func_t {
        (ufuncs: unicode_funcs_t, unicode: codepoint_t): unicode_general_category_t;
    }

    interface unicode_mirroring_func_t {
        (ufuncs: unicode_funcs_t, unicode: codepoint_t): codepoint_t;
    }

    interface unicode_script_func_t {
        (ufuncs: unicode_funcs_t, unicode: codepoint_t): script_t;
    }

    enum aat_layout_feature_selector_t {
        B_AAT_LAYOUT_FEATURE_SELECTOR_INVALID = 65535,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ALL_TYPE_FEATURES_ON = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ALL_TYPE_FEATURES_OFF = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_REQUIRED_LIGATURES_ON = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_REQUIRED_LIGATURES_OFF = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_COMMON_LIGATURES_ON = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_COMMON_LIGATURES_OFF = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_RARE_LIGATURES_ON = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_RARE_LIGATURES_OFF = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_LOGOS_ON = 6,
        B_AAT_LAYOUT_FEATURE_SELECTOR_LOGOS_OFF = 7,
        B_AAT_LAYOUT_FEATURE_SELECTOR_REBUS_PICTURES_ON = 8,
        B_AAT_LAYOUT_FEATURE_SELECTOR_REBUS_PICTURES_OFF = 9,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DIPHTHONG_LIGATURES_ON = 10,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DIPHTHONG_LIGATURES_OFF = 11,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SQUARED_LIGATURES_ON = 12,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SQUARED_LIGATURES_OFF = 13,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ABBREV_SQUARED_LIGATURES_ON = 14,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ABBREV_SQUARED_LIGATURES_OFF = 15,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SYMBOL_LIGATURES_ON = 16,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SYMBOL_LIGATURES_OFF = 17,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CONTEXTUAL_LIGATURES_ON = 18,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CONTEXTUAL_LIGATURES_OFF = 19,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HISTORICAL_LIGATURES_ON = 20,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HISTORICAL_LIGATURES_OFF = 21,
        B_AAT_LAYOUT_FEATURE_SELECTOR_UNCONNECTED = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_PARTIALLY_CONNECTED = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CURSIVE = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_UPPER_AND_LOWER_CASE = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ALL_CAPS = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ALL_LOWER_CASE = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SMALL_CAPS = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_INITIAL_CAPS = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_INITIAL_CAPS_AND_SMALL_CAPS = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SUBSTITUTE_VERTICAL_FORMS_ON = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SUBSTITUTE_VERTICAL_FORMS_OFF = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_LINGUISTIC_REARRANGEMENT_ON = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_LINGUISTIC_REARRANGEMENT_OFF = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_MONOSPACED_NUMBERS = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_PROPORTIONAL_NUMBERS = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_THIRD_WIDTH_NUMBERS = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_QUARTER_WIDTH_NUMBERS = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_WORD_INITIAL_SWASHES_ON = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_WORD_INITIAL_SWASHES_OFF = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_WORD_FINAL_SWASHES_ON = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_WORD_FINAL_SWASHES_OFF = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_LINE_INITIAL_SWASHES_ON = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_LINE_INITIAL_SWASHES_OFF = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_LINE_FINAL_SWASHES_ON = 6,
        B_AAT_LAYOUT_FEATURE_SELECTOR_LINE_FINAL_SWASHES_OFF = 7,
        B_AAT_LAYOUT_FEATURE_SELECTOR_NON_FINAL_SWASHES_ON = 8,
        B_AAT_LAYOUT_FEATURE_SELECTOR_NON_FINAL_SWASHES_OFF = 9,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SHOW_DIACRITICS = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HIDE_DIACRITICS = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DECOMPOSE_DIACRITICS = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_NORMAL_POSITION = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SUPERIORS = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_INFERIORS = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ORDINALS = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SCIENTIFIC_INFERIORS = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_NO_FRACTIONS = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_VERTICAL_FRACTIONS = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DIAGONAL_FRACTIONS = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_PREVENT_OVERLAP_ON = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_PREVENT_OVERLAP_OFF = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HYPHENS_TO_EM_DASH_ON = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HYPHENS_TO_EM_DASH_OFF = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HYPHEN_TO_EN_DASH_ON = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HYPHEN_TO_EN_DASH_OFF = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SLASHED_ZERO_ON = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SLASHED_ZERO_OFF = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_FORM_INTERROBANG_ON = 6,
        B_AAT_LAYOUT_FEATURE_SELECTOR_FORM_INTERROBANG_OFF = 7,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SMART_QUOTES_ON = 8,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SMART_QUOTES_OFF = 9,
        B_AAT_LAYOUT_FEATURE_SELECTOR_PERIODS_TO_ELLIPSIS_ON = 10,
        B_AAT_LAYOUT_FEATURE_SELECTOR_PERIODS_TO_ELLIPSIS_OFF = 11,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HYPHEN_TO_MINUS_ON = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HYPHEN_TO_MINUS_OFF = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ASTERISK_TO_MULTIPLY_ON = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ASTERISK_TO_MULTIPLY_OFF = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SLASH_TO_DIVIDE_ON = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SLASH_TO_DIVIDE_OFF = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_INEQUALITY_LIGATURES_ON = 6,
        B_AAT_LAYOUT_FEATURE_SELECTOR_INEQUALITY_LIGATURES_OFF = 7,
        B_AAT_LAYOUT_FEATURE_SELECTOR_EXPONENTS_ON = 8,
        B_AAT_LAYOUT_FEATURE_SELECTOR_EXPONENTS_OFF = 9,
        B_AAT_LAYOUT_FEATURE_SELECTOR_MATHEMATICAL_GREEK_ON = 10,
        B_AAT_LAYOUT_FEATURE_SELECTOR_MATHEMATICAL_GREEK_OFF = 11,
        B_AAT_LAYOUT_FEATURE_SELECTOR_NO_ORNAMENTS = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DINGBATS = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_PI_CHARACTERS = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_FLEURONS = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DECORATIVE_BORDERS = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_INTERNATIONAL_SYMBOLS = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_MATH_SYMBOLS = 6,
        B_AAT_LAYOUT_FEATURE_SELECTOR_NO_ALTERNATES = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DESIGN_LEVEL1 = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DESIGN_LEVEL2 = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DESIGN_LEVEL3 = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DESIGN_LEVEL4 = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DESIGN_LEVEL5 = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_NO_STYLE_OPTIONS = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DISPLAY_TEXT = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ENGRAVED_TEXT = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ILLUMINATED_CAPS = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_TITLING_CAPS = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_TALL_CAPS = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_TRADITIONAL_CHARACTERS = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SIMPLIFIED_CHARACTERS = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_JIS1978_CHARACTERS = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_JIS1983_CHARACTERS = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_JIS1990_CHARACTERS = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_TRADITIONAL_ALT_ONE = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_TRADITIONAL_ALT_TWO = 6,
        B_AAT_LAYOUT_FEATURE_SELECTOR_TRADITIONAL_ALT_THREE = 7,
        B_AAT_LAYOUT_FEATURE_SELECTOR_TRADITIONAL_ALT_FOUR = 8,
        B_AAT_LAYOUT_FEATURE_SELECTOR_TRADITIONAL_ALT_FIVE = 9,
        B_AAT_LAYOUT_FEATURE_SELECTOR_EXPERT_CHARACTERS = 10,
        B_AAT_LAYOUT_FEATURE_SELECTOR_JIS2004_CHARACTERS = 11,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HOJO_CHARACTERS = 12,
        B_AAT_LAYOUT_FEATURE_SELECTOR_NLCCHARACTERS = 13,
        B_AAT_LAYOUT_FEATURE_SELECTOR_TRADITIONAL_NAMES_CHARACTERS = 14,
        B_AAT_LAYOUT_FEATURE_SELECTOR_LOWER_CASE_NUMBERS = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_UPPER_CASE_NUMBERS = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_PROPORTIONAL_TEXT = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_MONOSPACED_TEXT = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HALF_WIDTH_TEXT = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_THIRD_WIDTH_TEXT = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_QUARTER_WIDTH_TEXT = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ALT_PROPORTIONAL_TEXT = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ALT_HALF_WIDTH_TEXT = 6,
        B_AAT_LAYOUT_FEATURE_SELECTOR_NO_TRANSLITERATION = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HANJA_TO_HANGUL = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HIRAGANA_TO_KATAKANA = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_KATAKANA_TO_HIRAGANA = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_KANA_TO_ROMANIZATION = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ROMANIZATION_TO_HIRAGANA = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ROMANIZATION_TO_KATAKANA = 6,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HANJA_TO_HANGUL_ALT_ONE = 7,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HANJA_TO_HANGUL_ALT_TWO = 8,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HANJA_TO_HANGUL_ALT_THREE = 9,
        B_AAT_LAYOUT_FEATURE_SELECTOR_NO_ANNOTATION = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_BOX_ANNOTATION = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ROUNDED_BOX_ANNOTATION = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CIRCLE_ANNOTATION = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_INVERTED_CIRCLE_ANNOTATION = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_PARENTHESIS_ANNOTATION = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_PERIOD_ANNOTATION = 6,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ROMAN_NUMERAL_ANNOTATION = 7,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DIAMOND_ANNOTATION = 8,
        B_AAT_LAYOUT_FEATURE_SELECTOR_INVERTED_BOX_ANNOTATION = 9,
        B_AAT_LAYOUT_FEATURE_SELECTOR_INVERTED_ROUNDED_BOX_ANNOTATION = 10,
        B_AAT_LAYOUT_FEATURE_SELECTOR_FULL_WIDTH_KANA = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_PROPORTIONAL_KANA = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_FULL_WIDTH_IDEOGRAPHS = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_PROPORTIONAL_IDEOGRAPHS = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HALF_WIDTH_IDEOGRAPHS = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CANONICAL_COMPOSITION_ON = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CANONICAL_COMPOSITION_OFF = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_COMPATIBILITY_COMPOSITION_ON = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_COMPATIBILITY_COMPOSITION_OFF = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_TRANSCODING_COMPOSITION_ON = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_TRANSCODING_COMPOSITION_OFF = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_NO_RUBY_KANA = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_RUBY_KANA = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_RUBY_KANA_ON = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_RUBY_KANA_OFF = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_NO_CJK_SYMBOL_ALTERNATIVES = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CJK_SYMBOL_ALT_ONE = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CJK_SYMBOL_ALT_TWO = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CJK_SYMBOL_ALT_THREE = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CJK_SYMBOL_ALT_FOUR = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CJK_SYMBOL_ALT_FIVE = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_NO_IDEOGRAPHIC_ALTERNATIVES = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_IDEOGRAPHIC_ALT_ONE = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_IDEOGRAPHIC_ALT_TWO = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_IDEOGRAPHIC_ALT_THREE = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_IDEOGRAPHIC_ALT_FOUR = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_IDEOGRAPHIC_ALT_FIVE = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CJK_VERTICAL_ROMAN_CENTERED = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CJK_VERTICAL_ROMAN_HBASELINE = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_NO_CJK_ITALIC_ROMAN = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CJK_ITALIC_ROMAN = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CJK_ITALIC_ROMAN_ON = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CJK_ITALIC_ROMAN_OFF = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CASE_SENSITIVE_LAYOUT_ON = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CASE_SENSITIVE_LAYOUT_OFF = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CASE_SENSITIVE_SPACING_ON = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CASE_SENSITIVE_SPACING_OFF = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ALTERNATE_HORIZ_KANA_ON = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ALTERNATE_HORIZ_KANA_OFF = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ALTERNATE_VERT_KANA_ON = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_ALTERNATE_VERT_KANA_OFF = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_NO_STYLISTIC_ALTERNATES = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_ONE_ON = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_ONE_OFF = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_TWO_ON = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_TWO_OFF = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_THREE_ON = 6,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_THREE_OFF = 7,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_FOUR_ON = 8,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_FOUR_OFF = 9,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_FIVE_ON = 10,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_FIVE_OFF = 11,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_SIX_ON = 12,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_SIX_OFF = 13,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_SEVEN_ON = 14,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_SEVEN_OFF = 15,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_EIGHT_ON = 16,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_EIGHT_OFF = 17,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_NINE_ON = 18,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_NINE_OFF = 19,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_TEN_ON = 20,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_TEN_OFF = 21,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_ELEVEN_ON = 22,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_ELEVEN_OFF = 23,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_TWELVE_ON = 24,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_TWELVE_OFF = 25,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_THIRTEEN_ON = 26,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_THIRTEEN_OFF = 27,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_FOURTEEN_ON = 28,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_FOURTEEN_OFF = 29,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_FIFTEEN_ON = 30,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_FIFTEEN_OFF = 31,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_SIXTEEN_ON = 32,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_SIXTEEN_OFF = 33,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_SEVENTEEN_ON = 34,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_SEVENTEEN_OFF = 35,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_EIGHTEEN_ON = 36,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_EIGHTEEN_OFF = 37,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_NINETEEN_ON = 38,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_NINETEEN_OFF = 39,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_TWENTY_ON = 40,
        B_AAT_LAYOUT_FEATURE_SELECTOR_STYLISTIC_ALT_TWENTY_OFF = 41,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CONTEXTUAL_ALTERNATES_ON = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CONTEXTUAL_ALTERNATES_OFF = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SWASH_ALTERNATES_ON = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_SWASH_ALTERNATES_OFF = 3,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CONTEXTUAL_SWASH_ALTERNATES_ON = 4,
        B_AAT_LAYOUT_FEATURE_SELECTOR_CONTEXTUAL_SWASH_ALTERNATES_OFF = 5,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DEFAULT_LOWER_CASE = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_LOWER_CASE_SMALL_CAPS = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_LOWER_CASE_PETITE_CAPS = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DEFAULT_UPPER_CASE = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_UPPER_CASE_SMALL_CAPS = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_UPPER_CASE_PETITE_CAPS = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_HALF_WIDTH_CJK_ROMAN = 0,
        B_AAT_LAYOUT_FEATURE_SELECTOR_PROPORTIONAL_CJK_ROMAN = 1,
        B_AAT_LAYOUT_FEATURE_SELECTOR_DEFAULT_CJK_ROMAN = 2,
        B_AAT_LAYOUT_FEATURE_SELECTOR_FULL_WIDTH_CJK_ROMAN = 3,
    }


    enum aat_layout_feature_type_t {
        B_AAT_LAYOUT_FEATURE_TYPE_INVALID = 65535,
        B_AAT_LAYOUT_FEATURE_TYPE_ALL_TYPOGRAPHIC = 0,
        B_AAT_LAYOUT_FEATURE_TYPE_LIGATURES = 1,
        B_AAT_LAYOUT_FEATURE_TYPE_CURSIVE_CONNECTION = 2,
        B_AAT_LAYOUT_FEATURE_TYPE_LETTER_CASE = 3,
        B_AAT_LAYOUT_FEATURE_TYPE_VERTICAL_SUBSTITUTION = 4,
        B_AAT_LAYOUT_FEATURE_TYPE_LINGUISTIC_REARRANGEMENT = 5,
        B_AAT_LAYOUT_FEATURE_TYPE_NUMBER_SPACING = 6,
        B_AAT_LAYOUT_FEATURE_TYPE_SMART_SWASH_TYPE = 8,
        B_AAT_LAYOUT_FEATURE_TYPE_DIACRITICS_TYPE = 9,
        B_AAT_LAYOUT_FEATURE_TYPE_VERTICAL_POSITION = 10,
        B_AAT_LAYOUT_FEATURE_TYPE_FRACTIONS = 11,
        B_AAT_LAYOUT_FEATURE_TYPE_OVERLAPPING_CHARACTERS_TYPE = 13,
        B_AAT_LAYOUT_FEATURE_TYPE_TYPOGRAPHIC_EXTRAS = 14,
        B_AAT_LAYOUT_FEATURE_TYPE_MATHEMATICAL_EXTRAS = 15,
        B_AAT_LAYOUT_FEATURE_TYPE_ORNAMENT_SETS_TYPE = 16,
        B_AAT_LAYOUT_FEATURE_TYPE_CHARACTER_ALTERNATIVES = 17,
        B_AAT_LAYOUT_FEATURE_TYPE_DESIGN_COMPLEXITY_TYPE = 18,
        B_AAT_LAYOUT_FEATURE_TYPE_STYLE_OPTIONS = 19,
        B_AAT_LAYOUT_FEATURE_TYPE_CHARACTER_SHAPE = 20,
        B_AAT_LAYOUT_FEATURE_TYPE_NUMBER_CASE = 21,
        B_AAT_LAYOUT_FEATURE_TYPE_TEXT_SPACING = 22,
        B_AAT_LAYOUT_FEATURE_TYPE_TRANSLITERATION = 23,
        B_AAT_LAYOUT_FEATURE_TYPE_ANNOTATION_TYPE = 24,
        B_AAT_LAYOUT_FEATURE_TYPE_KANA_SPACING_TYPE = 25,
        B_AAT_LAYOUT_FEATURE_TYPE_IDEOGRAPHIC_SPACING_TYPE = 26,
        B_AAT_LAYOUT_FEATURE_TYPE_UNICODE_DECOMPOSITION_TYPE = 27,
        B_AAT_LAYOUT_FEATURE_TYPE_RUBY_KANA = 28,
        B_AAT_LAYOUT_FEATURE_TYPE_CJK_SYMBOL_ALTERNATIVES_TYPE = 29,
        B_AAT_LAYOUT_FEATURE_TYPE_IDEOGRAPHIC_ALTERNATIVES_TYPE = 30,
        B_AAT_LAYOUT_FEATURE_TYPE_CJK_VERTICAL_ROMAN_PLACEMENT_TYPE = 31,
        B_AAT_LAYOUT_FEATURE_TYPE_ITALIC_CJK_ROMAN = 32,
        B_AAT_LAYOUT_FEATURE_TYPE_CASE_SENSITIVE_LAYOUT = 33,
        B_AAT_LAYOUT_FEATURE_TYPE_ALTERNATE_KANA = 34,
        B_AAT_LAYOUT_FEATURE_TYPE_STYLISTIC_ALTERNATIVES = 35,
        B_AAT_LAYOUT_FEATURE_TYPE_CONTEXTUAL_ALTERNATIVES = 36,
        B_AAT_LAYOUT_FEATURE_TYPE_LOWER_CASE = 37,
        B_AAT_LAYOUT_FEATURE_TYPE_UPPER_CASE = 38,
        B_AAT_LAYOUT_FEATURE_TYPE_LANGUAGE_TAG_TYPE = 39,
        B_AAT_LAYOUT_FEATURE_TYPE_CJK_ROMAN_SPACING_TYPE = 103,
    }


    enum buffer_diff_flags_t {
        EQUAL = 0,
        CONTENT_TYPE_MISMATCH = 1,
        LENGTH_MISMATCH = 2,
        NOTDEF_PRESENT = 4,
        DOTTED_CIRCLE_PRESENT = 8,
        CODEPOINT_MISMATCH = 16,
        CLUSTER_MISMATCH = 32,
        GLYPH_FLAGS_MISMATCH = 64,
        POSITION_MISMATCH = 128,
    }


    enum buffer_flags_t {
        DEFAULT = 0,
        BOT = 1,
        EOT = 2,
        PRESERVE_DEFAULT_IGNORABLES = 4,
        REMOVE_DEFAULT_IGNORABLES = 8,
        DO_NOT_INSERT_DOTTED_CIRCLE = 16,
        VERIFY = 32,
        PRODUCE_UNSAFE_TO_CONCAT = 64,
        PRODUCE_SAFE_TO_INSERT_TATWEEL = 128,
        DEFINED = 255,
    }


    enum buffer_serialize_flags_t {
        DEFAULT = 0,
        NO_CLUSTERS = 1,
        NO_POSITIONS = 2,
        NO_GLYPH_NAMES = 4,
        GLYPH_EXTENTS = 8,
        GLYPH_FLAGS = 16,
        NO_ADVANCES = 32,
        DEFINED = 63,
    }


    enum buffer_serialize_format_t {
        TEXT = 1413830740,
        JSON = 1246973774,
        INVALID = 0,
    }


    enum glyph_flags_t {
        UNSAFE_TO_BREAK = 1,
        UNSAFE_TO_CONCAT = 2,
        SAFE_TO_INSERT_TATWEEL = 4,
        DEFINED = 7,
    }


    enum ot_bits_tag_t {
        B_OT_BITS_TAG_FS_TYPE = 1718842480,
        B_OT_BITS_TAG_FS_SELECTION = 1718842220,
        B_OT_BITS_TAG_MAC_STYLE = 1835234164,
        B_OT_BITS_TAG_IS_FIXED_PITCH = 1719169140,
        B_OT_BITS_TAG_UNICODE_RANGE_1 = 1970433585,
        B_OT_BITS_TAG_UNICODE_RANGE_2 = 1970433586,
        B_OT_BITS_TAG_UNICODE_RANGE_3 = 1970433587,
        B_OT_BITS_TAG_UNICODE_RANGE_4 = 1970433588,
        B_OT_BITS_TAG_CODE_PAGE_RANGE_1 = 1668313649,
        B_OT_BITS_TAG_CODE_PAGE_RANGE_2 = 1668313650,
    }


    enum ot_color_palette_flags_t {
        DEFAULT = 0,
        USABLE_WITH_LIGHT_BACKGROUND = 1,
        USABLE_WITH_DARK_BACKGROUND = 2,
    }


    enum ot_layout_baseline_tag_t {
        B_OT_LAYOUT_BASELINE_TAG_ROMAN = 1919905134,
        B_OT_LAYOUT_BASELINE_TAG_HANGING = 1751215719,
        B_OT_LAYOUT_BASELINE_TAG_IDEO_FACE_BOTTOM_OR_LEFT = 1768121954,
        B_OT_LAYOUT_BASELINE_TAG_IDEO_FACE_TOP_OR_RIGHT = 1768121972,
        B_OT_LAYOUT_BASELINE_TAG_IDEO_FACE_CENTRAL = 1231251043,
        B_OT_LAYOUT_BASELINE_TAG_IDEO_EMBOX_BOTTOM_OR_LEFT = 1768187247,
        B_OT_LAYOUT_BASELINE_TAG_IDEO_EMBOX_TOP_OR_RIGHT = 1768191088,
        B_OT_LAYOUT_BASELINE_TAG_IDEO_EMBOX_CENTRAL = 1231315813,
        B_OT_LAYOUT_BASELINE_TAG_MATH = 1835103336,
    }


    enum ot_math_glyph_part_flags_t {
        OT_MATH_GLYPH_PART_FLAG_EXTENDER = 1,
    }


    enum ot_meta_tag_t {
        B_OT_META_TAG_DESIGN_LANGUAGES = 1684827751,
        B_OT_META_TAG_SUPPORTED_LANGUAGES = 1936485991,
    }


    enum ot_metrics_tag_t {
        B_OT_METRICS_TAG_HORIZONTAL_ASCENDER = 1751216995,
        B_OT_METRICS_TAG_HORIZONTAL_DESCENDER = 1751413603,
        B_OT_METRICS_TAG_HORIZONTAL_LINE_GAP = 1751934832,
        B_OT_METRICS_TAG_HORIZONTAL_CLIPPING_ASCENT = 1751346273,
        B_OT_METRICS_TAG_HORIZONTAL_CLIPPING_DESCENT = 1751346276,
        B_OT_METRICS_TAG_VERTICAL_ASCENDER = 1986098019,
        B_OT_METRICS_TAG_VERTICAL_DESCENDER = 1986294627,
        B_OT_METRICS_TAG_VERTICAL_LINE_GAP = 1986815856,
        B_OT_METRICS_TAG_HORIZONTAL_CARET_RISE = 1751347827,
        B_OT_METRICS_TAG_HORIZONTAL_CARET_RUN = 1751347822,
        B_OT_METRICS_TAG_HORIZONTAL_CARET_OFFSET = 1751347046,
        B_OT_METRICS_TAG_VERTICAL_CARET_RISE = 1986228851,
        B_OT_METRICS_TAG_VERTICAL_CARET_RUN = 1986228846,
        B_OT_METRICS_TAG_VERTICAL_CARET_OFFSET = 1986228070,
        B_OT_METRICS_TAG_X_HEIGHT = 2020108148,
        B_OT_METRICS_TAG_CAP_HEIGHT = 1668311156,
        B_OT_METRICS_TAG_SUBSCRIPT_EM_X_SIZE = 1935833203,
        B_OT_METRICS_TAG_SUBSCRIPT_EM_Y_SIZE = 1935833459,
        B_OT_METRICS_TAG_SUBSCRIPT_EM_X_OFFSET = 1935833199,
        B_OT_METRICS_TAG_SUBSCRIPT_EM_Y_OFFSET = 1935833455,
        B_OT_METRICS_TAG_SUPERSCRIPT_EM_X_SIZE = 1936750707,
        B_OT_METRICS_TAG_SUPERSCRIPT_EM_Y_SIZE = 1936750963,
        B_OT_METRICS_TAG_SUPERSCRIPT_EM_X_OFFSET = 1936750703,
        B_OT_METRICS_TAG_SUPERSCRIPT_EM_Y_OFFSET = 1936750959,
        B_OT_METRICS_TAG_STRIKEOUT_SIZE = 1937011315,
        B_OT_METRICS_TAG_STRIKEOUT_OFFSET = 1937011311,
        B_OT_METRICS_TAG_UNDERLINE_SIZE = 1970168947,
        B_OT_METRICS_TAG_UNDERLINE_OFFSET = 1970168943,
    }


    enum ot_number_tag_t {
        B_OT_NUMBER_TAG_FONT_X_MIN = 2020436334,
        B_OT_NUMBER_TAG_FONT_Y_MIN = 2037213550,
        B_OT_NUMBER_TAG_FONT_X_MAX = 2020434296,
        B_OT_NUMBER_TAG_FONT_Y_MAX = 2037211512,
    }


    enum ot_var_axis_flags_t {
        B_OT_VAR_AXIS_FLAG_HIDDEN = 1,
    }


    enum script_t {
        B_SCRIPT_COMMON = 1517910393,
        B_SCRIPT_INHERITED = 1516858984,
        B_SCRIPT_UNKNOWN = 1517976186,
        B_SCRIPT_ARABIC = 1098015074,
        B_SCRIPT_ARMENIAN = 1098018158,
        B_SCRIPT_BENGALI = 1113943655,
        B_SCRIPT_CYRILLIC = 1132032620,
        B_SCRIPT_DEVANAGARI = 1147500129,
        B_SCRIPT_GEORGIAN = 1197830002,
        B_SCRIPT_GREEK = 1198679403,
        B_SCRIPT_GUJARATI = 1198877298,
        B_SCRIPT_GURMUKHI = 1198879349,
        B_SCRIPT_HANGUL = 1214344807,
        B_SCRIPT_HAN = 1214344809,
        B_SCRIPT_HEBREW = 1214603890,
        B_SCRIPT_HIRAGANA = 1214870113,
        B_SCRIPT_KANNADA = 1265525857,
        B_SCRIPT_KATAKANA = 1264676449,
        B_SCRIPT_LAO = 1281453935,
        B_SCRIPT_LATIN = 1281455214,
        B_SCRIPT_MALAYALAM = 1298954605,
        B_SCRIPT_ORIYA = 1332902241,
        B_SCRIPT_TAMIL = 1415671148,
        B_SCRIPT_TELUGU = 1415933045,
        B_SCRIPT_THAI = 1416126825,
        B_SCRIPT_TIBETAN = 1416192628,
        B_SCRIPT_BOPOMOFO = 1114599535,
        B_SCRIPT_BRAILLE = 1114792297,
        B_SCRIPT_CANADIAN_SYLLABICS = 1130458739,
        B_SCRIPT_CHEROKEE = 1130915186,
        B_SCRIPT_ETHIOPIC = 1165256809,
        B_SCRIPT_KHMER = 1265134962,
        B_SCRIPT_MONGOLIAN = 1299148391,
        B_SCRIPT_MYANMAR = 1299803506,
        B_SCRIPT_OGHAM = 1332175213,
        B_SCRIPT_RUNIC = 1383427698,
        B_SCRIPT_SINHALA = 1399418472,
        B_SCRIPT_SYRIAC = 1400468067,
        B_SCRIPT_THAANA = 1416126817,
        B_SCRIPT_YI = 1500080489,
        B_SCRIPT_DESERET = 1148416628,
        B_SCRIPT_GOTHIC = 1198486632,
        B_SCRIPT_OLD_ITALIC = 1232363884,
        B_SCRIPT_BUHID = 1114990692,
        B_SCRIPT_HANUNOO = 1214344815,
        B_SCRIPT_TAGALOG = 1416064103,
        B_SCRIPT_TAGBANWA = 1415669602,
        B_SCRIPT_CYPRIOT = 1131442804,
        B_SCRIPT_LIMBU = 1281977698,
        B_SCRIPT_LINEAR_B = 1281977954,
        B_SCRIPT_OSMANYA = 1332964705,
        B_SCRIPT_SHAVIAN = 1399349623,
        B_SCRIPT_TAI_LE = 1415670885,
        B_SCRIPT_UGARITIC = 1432838514,
        B_SCRIPT_BUGINESE = 1114990441,
        B_SCRIPT_COPTIC = 1131376756,
        B_SCRIPT_GLAGOLITIC = 1198285159,
        B_SCRIPT_KHAROSHTHI = 1265131890,
        B_SCRIPT_NEW_TAI_LUE = 1415670901,
        B_SCRIPT_OLD_PERSIAN = 1483761007,
        B_SCRIPT_SYLOTI_NAGRI = 1400466543,
        B_SCRIPT_TIFINAGH = 1415999079,
        B_SCRIPT_BALINESE = 1113681001,
        B_SCRIPT_CUNEIFORM = 1483961720,
        B_SCRIPT_NKO = 1315663727,
        B_SCRIPT_PHAGS_PA = 1349017959,
        B_SCRIPT_PHOENICIAN = 1349021304,
        B_SCRIPT_CARIAN = 1130459753,
        B_SCRIPT_CHAM = 1130914157,
        B_SCRIPT_KAYAH_LI = 1264675945,
        B_SCRIPT_LEPCHA = 1281716323,
        B_SCRIPT_LYCIAN = 1283023721,
        B_SCRIPT_LYDIAN = 1283023977,
        B_SCRIPT_OL_CHIKI = 1332503403,
        B_SCRIPT_REJANG = 1382706791,
        B_SCRIPT_SAURASHTRA = 1398895986,
        B_SCRIPT_SUNDANESE = 1400204900,
        B_SCRIPT_VAI = 1449224553,
        B_SCRIPT_AVESTAN = 1098281844,
        B_SCRIPT_BAMUM = 1113681269,
        B_SCRIPT_EGYPTIAN_HIEROGLYPHS = 1164409200,
        B_SCRIPT_IMPERIAL_ARAMAIC = 1098018153,
        B_SCRIPT_INSCRIPTIONAL_PAHLAVI = 1349020777,
        B_SCRIPT_INSCRIPTIONAL_PARTHIAN = 1349678185,
        B_SCRIPT_JAVANESE = 1247901281,
        B_SCRIPT_KAITHI = 1265920105,
        B_SCRIPT_LISU = 1281979253,
        B_SCRIPT_MEETEI_MAYEK = 1299473769,
        B_SCRIPT_OLD_SOUTH_ARABIAN = 1398895202,
        B_SCRIPT_OLD_TURKIC = 1332898664,
        B_SCRIPT_SAMARITAN = 1398893938,
        B_SCRIPT_TAI_THAM = 1281453665,
        B_SCRIPT_TAI_VIET = 1415673460,
        B_SCRIPT_BATAK = 1113683051,
        B_SCRIPT_BRAHMI = 1114792296,
        B_SCRIPT_MANDAIC = 1298230884,
        B_SCRIPT_CHAKMA = 1130457965,
        B_SCRIPT_MEROITIC_CURSIVE = 1298494051,
        B_SCRIPT_MEROITIC_HIEROGLYPHS = 1298494063,
        B_SCRIPT_MIAO = 1349284452,
        B_SCRIPT_SHARADA = 1399353956,
        B_SCRIPT_SORA_SOMPENG = 1399812705,
        B_SCRIPT_TAKRI = 1415670642,
        B_SCRIPT_BASSA_VAH = 1113682803,
        B_SCRIPT_CAUCASIAN_ALBANIAN = 1097295970,
        B_SCRIPT_DUPLOYAN = 1148547180,
        B_SCRIPT_ELBASAN = 1164730977,
        B_SCRIPT_GRANTHA = 1198678382,
        B_SCRIPT_KHOJKI = 1265135466,
        B_SCRIPT_KHUDAWADI = 1399418468,
        B_SCRIPT_LINEAR_A = 1281977953,
        B_SCRIPT_MAHAJANI = 1298229354,
        B_SCRIPT_MANICHAEAN = 1298230889,
        B_SCRIPT_MENDE_KIKAKUI = 1298493028,
        B_SCRIPT_MODI = 1299145833,
        B_SCRIPT_MRO = 1299345263,
        B_SCRIPT_NABATAEAN = 1315070324,
        B_SCRIPT_OLD_NORTH_ARABIAN = 1315009122,
        B_SCRIPT_OLD_PERMIC = 1348825709,
        B_SCRIPT_PAHAWH_HMONG = 1215131239,
        B_SCRIPT_PALMYRENE = 1348562029,
        B_SCRIPT_PAU_CIN_HAU = 1348564323,
        B_SCRIPT_PSALTER_PAHLAVI = 1349020784,
        B_SCRIPT_SIDDHAM = 1399415908,
        B_SCRIPT_TIRHUTA = 1416196712,
        B_SCRIPT_WARANG_CITI = 1466004065,
        B_SCRIPT_AHOM = 1097363309,
        B_SCRIPT_ANATOLIAN_HIEROGLYPHS = 1215067511,
        B_SCRIPT_HATRAN = 1214346354,
        B_SCRIPT_MULTANI = 1299541108,
        B_SCRIPT_OLD_HUNGARIAN = 1215655527,
        B_SCRIPT_SIGNWRITING = 1399287415,
        B_SCRIPT_ADLAM = 1097100397,
        B_SCRIPT_BHAIKSUKI = 1114139507,
        B_SCRIPT_MARCHEN = 1298231907,
        B_SCRIPT_OSAGE = 1332963173,
        B_SCRIPT_TANGUT = 1415671399,
        B_SCRIPT_NEWA = 1315272545,
        B_SCRIPT_MASARAM_GONDI = 1198485101,
        B_SCRIPT_NUSHU = 1316186229,
        B_SCRIPT_SOYOMBO = 1399814511,
        B_SCRIPT_ZANABAZAR_SQUARE = 1516334690,
        B_SCRIPT_DOGRA = 1148151666,
        B_SCRIPT_GUNJALA_GONDI = 1198485095,
        B_SCRIPT_HANIFI_ROHINGYA = 1383032935,
        B_SCRIPT_MAKASAR = 1298230113,
        B_SCRIPT_MEDEFAIDRIN = 1298490470,
        B_SCRIPT_OLD_SOGDIAN = 1399809903,
        B_SCRIPT_SOGDIAN = 1399809892,
        B_SCRIPT_ELYMAIC = 1164736877,
        B_SCRIPT_NANDINAGARI = 1315008100,
        B_SCRIPT_NYIAKENG_PUACHUE_HMONG = 1215131248,
        B_SCRIPT_WANCHO = 1466132591,
        B_SCRIPT_CHORASMIAN = 1130918515,
        B_SCRIPT_DIVES_AKURU = 1147756907,
        B_SCRIPT_KHITAN_SMALL_SCRIPT = 1265202291,
        B_SCRIPT_YEZIDI = 1499822697,
        B_SCRIPT_CYPRO_MINOAN = 1131441518,
        B_SCRIPT_OLD_UYGHUR = 1333094258,
        B_SCRIPT_TANGSA = 1416524641,
        B_SCRIPT_TOTO = 1416590447,
        B_SCRIPT_VITHKUQI = 1449751656,
        B_SCRIPT_MATH = 1517122664,
        B_SCRIPT_KAWI = 1264678761,
        B_SCRIPT_NAG_MUNDARI = 1315006317,
        B_SCRIPT_GARAY = 1197568609,
        B_SCRIPT_GURUNG_KHEMA = 1198877544,
        B_SCRIPT_KIRAT_RAI = 1265787241,
        B_SCRIPT_OL_ONAL = 1332633967,
        B_SCRIPT_SUNUWAR = 1400204917,
        B_SCRIPT_TODHRI = 1416586354,
        B_SCRIPT_TULU_TIGALARI = 1416983655,
        B_SCRIPT_BERIA_ERFE = 1113944678,
        B_SCRIPT_SIDETIC = 1399415924,
        B_SCRIPT_TAI_YO = 1415674223,
        B_SCRIPT_TOLONG_SIKI = 1416588403,
        B_SCRIPT_JURCHEN = 1249210979,
        B_SCRIPT_PROTO_CUNEIFORM = 1348695406,
        B_SCRIPT_SEAL = 1399153004,
        B_SCRIPT_INVALID = 0,
    }


    enum style_tag_t {
        B_STYLE_TAG_ITALIC = 1769234796,
        B_STYLE_TAG_OPTICAL_SIZE = 1869640570,
        B_STYLE_TAG_SLANT_ANGLE = 1936486004,
        B_STYLE_TAG_SLANT_RATIO = 1399615092,
        B_STYLE_TAG_WIDTH = 2003072104,
        B_STYLE_TAG_WEIGHT = 2003265652,
    }


    class aat_layout_feature_selector_info_t {
        static $gtype: GObject.GType<aat_layout_feature_selector_info_t>;

        // Fields
        name_id: ot_name_id_t;

        enable: aat_layout_feature_selector_t;

        disable: aat_layout_feature_selector_t;
    }


    abstract class blob_t {
        static $gtype: GObject.GType<blob_t>;
    }


    abstract class buffer_t {
        static $gtype: GObject.GType<buffer_t>;
    }


    class color_line_t {
        static $gtype: GObject.GType<color_line_t>;

        // Fields
        data: null;

        get_color_stops: color_line_get_color_stops_func_t;

        get_color_stops_user_data: null;

        get_extend: color_line_get_extend_func_t;

        get_extend_user_data: null;

        reserved0: null;

        reserved1: null;

        reserved2: null;

        reserved3: null;

        reserved5: null;

        reserved6: null;

        reserved7: null;

        reserved8: null;
    }


    class color_stop_t {
        static $gtype: GObject.GType<color_stop_t>;

        // Fields
        offset: number;

        is_foreground: bool_t;

        color: color_t;

        // Constructors

        constructor(properties?: Partial<{
            offset: number;
            is_foreground: bool_t;
            color: color_t;
        }>);
    }


    abstract class draw_funcs_t {
        static $gtype: GObject.GType<draw_funcs_t>;
    }


    class draw_state_t {
        static $gtype: GObject.GType<draw_state_t>;

        // Fields
        path_open: bool_t;

        path_start_x: number;

        path_start_y: number;

        current_x: number;

        current_y: number;

        // Constructors

        constructor(properties?: Partial<{
            path_open: bool_t;
            path_start_x: number;
            path_start_y: number;
            current_x: number;
            current_y: number;
        }>);
    }


    abstract class face_t {
        static $gtype: GObject.GType<face_t>;
    }


    class feature_t {
        static $gtype: GObject.GType<feature_t>;

        // Fields
        tag: tag_t;

        value: number;

        start: number;

        end: number;

        // Constructors

        constructor(properties?: Partial<{
            tag: tag_t;
            value: number;
            start: number;
            end: number;
        }>);

        // Methods
        _string(): string[];
    }


    class font_extents_t {
        static $gtype: GObject.GType<font_extents_t>;

        // Fields
        ascender: position_t;

        descender: position_t;

        line_gap: position_t;

        // Constructors

        constructor(properties?: Partial<{
            ascender: position_t;
            descender: position_t;
            line_gap: position_t;
        }>);
    }


    abstract class font_funcs_t {
        static $gtype: GObject.GType<font_funcs_t>;
    }


    abstract class font_t {
        static $gtype: GObject.GType<font_t>;
    }


    class glyph_extents_t {
        static $gtype: GObject.GType<glyph_extents_t>;

        // Fields
        x_bearing: position_t;

        y_bearing: position_t;

        width: position_t;

        height: position_t;

        // Constructors

        constructor(properties?: Partial<{
            x_bearing: position_t;
            y_bearing: position_t;
            width: position_t;
            height: position_t;
        }>);
    }


    class glyph_info_t {
        static $gtype: GObject.GType<glyph_info_t>;

        // Fields
        codepoint: codepoint_t;

        cluster: number;

        // Constructors

        constructor(properties?: Partial<{
            codepoint: codepoint_t;
            cluster: number;
        }>);
    }


    class glyph_position_t {
        static $gtype: GObject.GType<glyph_position_t>;

        // Fields
        x_advance: position_t;

        y_advance: position_t;

        x_offset: position_t;

        y_offset: position_t;

        // Constructors

        constructor(properties?: Partial<{
            x_advance: position_t;
            y_advance: position_t;
            x_offset: position_t;
            y_offset: position_t;
        }>);
    }


    abstract class language_t {
        static $gtype: GObject.GType<language_t>;

        // Methods
        _string(): string;
    }


    abstract class map_t {
        static $gtype: GObject.GType<map_t>;
    }


    class ot_color_layer_t {
        static $gtype: GObject.GType<ot_color_layer_t>;

        // Fields
        glyph: codepoint_t;

        color_index: number;

        // Constructors

        constructor(properties?: Partial<{
            glyph: codepoint_t;
            color_index: number;
        }>);
    }


    class ot_math_glyph_part_t {
        static $gtype: GObject.GType<ot_math_glyph_part_t>;

        // Fields
        glyph: codepoint_t;

        start_connector_length: position_t;

        end_connector_length: position_t;

        full_advance: position_t;

        flags: ot_math_glyph_part_flags_t;
    }


    class ot_math_glyph_variant_t {
        static $gtype: GObject.GType<ot_math_glyph_variant_t>;

        // Fields
        glyph: codepoint_t;

        advance: position_t;

        // Constructors

        constructor(properties?: Partial<{
            glyph: codepoint_t;
            advance: position_t;
        }>);
    }


    class ot_math_kern_entry_t {
        static $gtype: GObject.GType<ot_math_kern_entry_t>;

        // Fields
        max_correction_height: position_t;

        kern_value: position_t;

        // Constructors

        constructor(properties?: Partial<{
            max_correction_height: position_t;
            kern_value: position_t;
        }>);
    }


    class ot_name_entry_t {
        static $gtype: GObject.GType<ot_name_entry_t>;

        // Fields
        name_id: ot_name_id_t;
    }


    class ot_var_axis_info_t {
        static $gtype: GObject.GType<ot_var_axis_info_t>;

        // Fields
        axis_index: number;

        tag: tag_t;

        name_id: ot_name_id_t;

        flags: ot_var_axis_flags_t;

        min_value: number;

        default_value: number;

        max_value: number;
    }


    class ot_var_axis_t {
        static $gtype: GObject.GType<ot_var_axis_t>;

        // Fields
        tag: tag_t;

        name_id: ot_name_id_t;

        min_value: number;

        default_value: number;

        max_value: number;

        // Constructors

        constructor(properties?: Partial<{
            tag: tag_t;
            name_id: ot_name_id_t;
            min_value: number;
            default_value: number;
            max_value: number;
        }>);
    }


    abstract class paint_funcs_t {
        static $gtype: GObject.GType<paint_funcs_t>;
    }


    class segment_properties_t {
        static $gtype: GObject.GType<segment_properties_t>;

        // Fields
        direction: direction_t;

        script: script_t;
    }


    abstract class set_t {
        static $gtype: GObject.GType<set_t>;
    }


    abstract class shape_plan_t {
        static $gtype: GObject.GType<shape_plan_t>;
    }


    abstract class unicode_funcs_t {
        static $gtype: GObject.GType<unicode_funcs_t>;
    }


    class user_data_key_t {
        static $gtype: GObject.GType<user_data_key_t>;

        // Constructors
        constructor(properties?: Partial<{}>);
    }


    class variation_t {
        static $gtype: GObject.GType<variation_t>;

        // Fields
        tag: tag_t;

        value: number;

        // Constructors

        constructor(properties?: Partial<{
            tag: tag_t;
            value: number;
        }>);

        // Methods
        _string(): string[];
    }


    class var_int_t {
        static $gtype: GObject.GType<var_int_t>;

        // Fields
        u32: number;

        i32: number;

        u16: number[];

        i16: number[];

        u8: Uint8Array;

        i8: Uint8Array;

        // Constructors

        constructor(properties?: Partial<{
            u32: number;
            i32: number;
            u16: number[];
            i16: number[];
            u8: Uint8Array;
            i8: Uint8Array;
        }>);
    }


    class var_num_t {
        static $gtype: GObject.GType<var_num_t>;

        // Fields
        f: number;

        u32: number;

        i32: number;

        u16: number[];

        i16: number[];

        u8: Uint8Array;

        i8: Uint8Array;

        // Constructors

        constructor(properties?: Partial<{
            f: number;
            u32: number;
            i32: number;
            u16: number[];
            i16: number[];
            u8: Uint8Array;
            i8: Uint8Array;
        }>);
    }


    type bool_t = number;

    type codepoint_t = number;

    type color_t = number;

    type font_get_font_h_extents_func_t = font_get_font_extents_func_t;

    type font_get_font_v_extents_func_t = font_get_font_extents_func_t;

    type font_get_glyph_h_advance_func_t = font_get_glyph_advance_func_t;

    type font_get_glyph_h_advances_func_t = font_get_glyph_advances_func_t;

    type font_get_glyph_h_kerning_func_t = font_get_glyph_kerning_func_t;

    type font_get_glyph_h_origin_func_t = font_get_glyph_origin_func_t;

    type font_get_glyph_h_origins_func_t = font_get_glyph_origins_func_t;

    type font_get_glyph_v_advance_func_t = font_get_glyph_advance_func_t;

    type font_get_glyph_v_advances_func_t = font_get_glyph_advances_func_t;

    type font_get_glyph_v_kerning_func_t = font_get_glyph_kerning_func_t;

    type font_get_glyph_v_origin_func_t = font_get_glyph_origin_func_t;

    type font_get_glyph_v_origins_func_t = font_get_glyph_origins_func_t;

    type mask_t = number;

    type ot_name_id_t = number;

    type position_t = number;

    type tag_t = number;

    const __name__: string;

    const __version__: string;
}

export default HarfBuzz;

}

declare module 'gi://HarfBuzz' {
    import HarfBuzz00 from 'gi://HarfBuzz?version=0.0';
    export default HarfBuzz00;
}
// END
