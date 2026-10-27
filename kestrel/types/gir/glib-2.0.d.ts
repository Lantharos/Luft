/// <reference path="./gobject-2.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://GLib?version=2.0' {

// Module dependencies
import type GObject from 'gi://GObject?version=2.0';

export namespace GLib {


// Advanced variant type inference for GLib.Variant
// Provides sophisticated type-level parsing of GVariant type signatures
// enabling automatic TypeScript type inference for variant operations.
// 
// Variant parsing inspired by https://github.com/jamiebuilds/json-parser-in-typescript-very-bad-idea-please-dont-use.
// 
// When disabled, basic Variant types from introspection are used instead.
// This reduces compilation time but loses advanced type safety features.

// Utility types for variant parsing
type VariantTypeError<T extends string> = { error: true } & T;

// === Core parsing utilities ===

/**
 * Maps basic GVariant type characters to TypeScript types
 */
type BasicTypeMap<T extends string> =
    T extends 'b' ? boolean :
    T extends 's' | 'o' | 'g' ? string :
    T extends 'n' | 'q' | 't' | 'd' | 'u' | 'i' | 'x' | 'y' ? number :
    T extends 'h' | '?' ? unknown :
    T extends 'v' ? Variant :
    never;

/**
 * Creates index type for dictionaries based on key type
 */
type CreateIndexType<Key extends string, Value extends any> =
    Key extends 's' | 'o' | 'g' ? { [key: string]: Value } :
    Key extends 'n' | 'q' | 't' | 'd' | 'u' | 'i' | 'x' | 'y' ? { [key: number]: Value } :
    never;

// === Deep unpacking types (deepUnpack method) ===

/**
 * Parses dictionary content for deep unpacking
 * For a{sv}, deepUnpack() preserves Variant values (GJS test behavior)
 */
type $ParseDeepVariantDict<State extends string> =
    string extends State
    ? VariantTypeError<"$ParseDeepVariantDict: 'string' is not a supported type.">
    : State extends `${infer Key}${infer AfterKey}`
    ? Key extends 's' | 'o' | 'g' | 'n' | 'q' | 't' | 'd' | 'u' | 'i' | 'x' | 'y'
      ? AfterKey extends `v}${infer Remaining}`
        ? [CreateIndexType<Key, Variant>, Remaining]  // a{sv} preserves Variant
        : $ParseDeepVariantValue<AfterKey> extends [infer V, `}${infer Remaining}`]
          ? [CreateIndexType<Key, V>, Remaining]
          : VariantTypeError<`Invalid dictionary value type in: ${AfterKey}`>
      : VariantTypeError<`Invalid dictionary key type: ${Key}`>
    : VariantTypeError<`Invalid dictionary format: ${State}`>;

/**
 * Parses tuple/struct content for deep unpacking
 */
type $ParseDeepVariantTuple<State extends string, Memo extends any[] = []> =
    string extends State
    ? VariantTypeError<"$ParseDeepVariantTuple: 'string' is not a supported type.">
    : State extends `)${infer Remaining}`
    ? [Memo, Remaining]
    : $ParseDeepVariantValue<State> extends [infer Value, infer NextState]
    ? NextState extends string
      ? $ParseDeepVariantTuple<NextState, [...Memo, Value]>
      : VariantTypeError<`$ParseDeepVariantTuple: NextState is not string`>
    : VariantTypeError<`$ParseDeepVariantTuple: Invalid state: ${State}`>;

/**
 * Parses key-value pair for deep unpacking
 */
type $ParseDeepVariantKeyValue<State extends string> =
    string extends State
    ? VariantTypeError<"$ParseDeepVariantKeyValue: 'string' is not a supported type.">
    : State extends `${infer Key}${infer AfterKey}`
    ? Key extends 's' | 'o' | 'g' | 'n' | 'q' | 't' | 'd' | 'u' | 'i' | 'x' | 'y'
      ? AfterKey extends `v}${infer Remaining}`
        ? [[BasicTypeMap<Key>, Variant], Remaining]  // Value remains Variant for 'v'
        : $ParseDeepVariantValue<AfterKey> extends [infer V, `}${infer Remaining}`]
          ? [[BasicTypeMap<Key>, V], Remaining]
          : VariantTypeError<`Invalid key-value value type in: ${AfterKey}`>
      : VariantTypeError<`Invalid key-value key type: ${Key}`>
    : VariantTypeError<`Invalid key-value format: ${State}`>;

/**
 * Main deep variant value parser
 */
type $ParseDeepVariantValue<State extends string> =
    string extends State
    ? unknown
    // Basic types
    : State extends `${infer Type}${infer Remaining}`
    ? Type extends 's' | 'o' | 'g' | 'b' | 'n' | 'q' | 't' | 'd' | 'u' | 'i' | 'x' | 'y' | 'h' | '?'
      ? [BasicTypeMap<Type>, Remaining]
      : Type extends 'v'
        ? [Variant, Remaining]
        // Container types
        : Type extends '('
          ? $ParseDeepVariantTuple<Remaining>
          : Type extends 'a'
            ? Remaining extends `y${infer Rest}`
              ? [Uint8Array, Rest]
              : Remaining extends `{${infer DictContent}`
                ? $ParseDeepVariantDict<DictContent>
                : $ParseDeepVariantValue<Remaining> extends [infer ElementType, infer Rest]
                  ? Rest extends string
                    ? [ElementType[], Rest]
                    : VariantTypeError<`Array parsing failed`>
                  : VariantTypeError<`Array element parsing failed`>
            : Type extends '{'
              ? $ParseDeepVariantKeyValue<Remaining>
              : Type extends 'm'
                ? $ParseDeepVariantValue<Remaining> extends [infer Value, infer Rest]
                  ? Rest extends string
                    ? [Value | null, Rest]
                    : VariantTypeError<`Maybe parsing failed`>
                  : VariantTypeError<`Maybe content parsing failed`>
                : VariantTypeError<`Unknown type: ${Type}`>
    : VariantTypeError<`Invalid variant string: ${State}`>;

/**
 * Main entry point for deep variant parsing
 */
type $ParseDeepVariant<T extends string> =
    $ParseDeepVariantValue<T> extends infer Result
    ? Result extends [infer Value, string]
      ? Value
      : Result extends VariantTypeError<any>
        ? Result
        : unknown
    : unknown;

// === Shallow unpacking types (unpack method) ===

/**
 * Main shallow variant value parser - only unpacks the top level
 */
type $ParseShallowVariantValue<State extends string> =
    string extends State
    ? unknown
    // Basic types
    : State extends `${infer Type}${infer Remaining}`
    ? Type extends 's' | 'o' | 'g' | 'b' | 'n' | 'q' | 't' | 'd' | 'u' | 'i' | 'x' | 'y' | 'h' | '?'
      ? [BasicTypeMap<Type>, Remaining]
      : Type extends 'v'
        ? [Variant, Remaining]
        // Container types - return Variant arrays/objects
        : Type extends '('
          ? $ParseShallowVariantTuple<Remaining>
          : Type extends 'a'
            ? Remaining extends `y${infer Rest}`
              ? [Uint8Array, Rest]
              : Remaining extends `{${infer DictContent}`
                ? $ParseShallowVariantDict<DictContent>
                : [Variant[], Remaining]  // Arrays contain Variant objects
            : Type extends '{'
              ? $ParseShallowVariantKeyValue<Remaining>
              : Type extends 'm'
                ? $ParseShallowVariantValue<Remaining> extends [infer Value, infer Rest]
                  ? Rest extends string
                    ? [Value | null, Rest]
                    : VariantTypeError<`Maybe parsing failed`>
                  : VariantTypeError<`Maybe content parsing failed`>
                : VariantTypeError<`Unknown type: ${Type}`>
    : VariantTypeError<`Invalid variant string: ${State}`>;

/**
 * Parses tuple for shallow unpacking - returns array of Variants
 */
type $ParseShallowVariantTuple<State extends string, Memo extends any[] = []> =
    string extends State
    ? VariantTypeError<"$ParseShallowVariantTuple: 'string' is not a supported type.">
    : State extends `)${infer Remaining}`
    ? [Memo, Remaining]
    : $SkipToNextElement<State> extends [infer NextState]
    ? NextState extends string
      ? $ParseShallowVariantTuple<NextState, [...Memo, Variant]>
      : VariantTypeError<`$ParseShallowVariantTuple: Invalid state`>
    : VariantTypeError<`$ParseShallowVariantTuple: Failed to skip element`>;

/**
 * Skips a single variant element to find the next element boundary
 */
type $SkipToNextElement<State extends string, Depth extends number = 0> =
    string extends State
    ? VariantTypeError<"Invalid state">
    // Basic types - single character
    : State extends `${infer Type}${infer Rest}`
    ? Type extends 's' | 'o' | 'g' | 'b' | 'n' | 'q' | 't' | 'd' | 'u' | 'i' | 'x' | 'y' | 'h' | '?' | 'v'
      ? [Rest]
      : Type extends 'a'
        ? Rest extends `y${infer R}`
          ? [R]
          : Rest extends `{${infer Inner}`
            ? $SkipUntil<Inner, '}'> extends [infer R]
              ? [R]
              : VariantTypeError<`Failed to skip dictionary`>
            : $SkipToNextElement<Rest> extends [infer R]
              ? [R]
              : VariantTypeError<`Failed to skip array element`>
        : Type extends 'm'
          ? $SkipToNextElement<Rest>
          : Type extends '('
            ? $SkipUntil<Rest, ')'> extends [infer R]
              ? [R]
              : VariantTypeError<`Failed to skip tuple`>
            : Type extends '{'
              ? $SkipUntil<Rest, '}'> extends [infer R]
                ? [R]
                : VariantTypeError<`Failed to skip key-value`>
              : VariantTypeError<`Unknown type: ${Type}`>
    : VariantTypeError<`Invalid format`>;

/**
 * Generic utility to skip until a closing delimiter
 */
type $SkipUntil<State extends string, Delimiter extends string, Depth extends number = 1> =
    string extends State
    ? never
    : Depth extends 0
    ? [State]
    : State extends `${infer Char}${infer Rest}`
    ? Char extends Delimiter
      ? Depth extends 1
        ? [Rest]
        : $SkipUntil<Rest, Delimiter, Depth extends 2 ? 1 : Depth extends 3 ? 2 : Depth extends 4 ? 3 : 1>
      : Char extends '(' | '{'  // Opening delimiters increase depth
        ? $SkipUntil<Rest, Delimiter, Depth extends 1 ? 2 : Depth extends 2 ? 3 : Depth extends 3 ? 4 : 4>
        : $SkipUntil<Rest, Delimiter, Depth>
    : never;

/**
 * Parses dictionary for shallow unpacking - values remain as Variants
 */
type $ParseShallowVariantDict<State extends string> =
    string extends State
    ? VariantTypeError<"$ParseShallowVariantDict: 'string' is not a supported type.">
    : $SkipUntil<State, '}'> extends [infer Remaining]
    ? Remaining extends string
      ? [{ [key: string]: Variant }, Remaining]
      : VariantTypeError<`Invalid dictionary format`>
    : VariantTypeError<`Invalid dictionary format`>;

/**
 * Parses key-value for shallow unpacking
 */
type $ParseShallowVariantKeyValue<State extends string> =
    string extends State
    ? VariantTypeError<"$ParseShallowVariantKeyValue: 'string' is not a supported type.">
    : $SkipUntil<State, '}'> extends [infer Remaining]
    ? Remaining extends string
      ? [[any, Variant], Remaining]
      : VariantTypeError<`Invalid key-value format`>
    : VariantTypeError<`Invalid key-value format`>;

/**
 * Main entry point for shallow variant parsing
 */
type $ParseShallowVariant<T extends string> =
    $ParseShallowVariantValue<T> extends infer Result
    ? Result extends [infer Value, string]
      ? Value
      : Result extends VariantTypeError<any>
        ? Result
        : unknown
    : unknown;

// === Recursive unpacking types (recursiveUnpack method) ===

/**
 * Main recursive variant value parser - unpacks all Variants to native values
 */
type $ParseRecursiveVariantValue<State extends string> =
    string extends State
    ? unknown
    // Basic types
    : State extends `${infer Type}${infer Remaining}`
    ? Type extends 's' | 'o' | 'g' | 'b' | 'n' | 'q' | 't' | 'd' | 'u' | 'i' | 'x' | 'y' | 'h' | '?'
      ? [BasicTypeMap<Type>, Remaining]
      : Type extends 'v'
        ? [unknown, Remaining]  // Variants are fully unpacked to unknown
        // Container types
        : Type extends '('
          ? $ParseRecursiveVariantTuple<Remaining>
          : Type extends 'a'
            ? Remaining extends `y${infer Rest}`
              ? [Uint8Array, Rest]
              : Remaining extends `{${infer DictContent}`
                ? $ParseRecursiveVariantDict<DictContent>
                : $ParseRecursiveVariantValue<Remaining> extends [infer ElementType, infer Rest]
                  ? Rest extends string
                    ? [ElementType[], Rest]
                    : VariantTypeError<`Array parsing failed`>
                  : VariantTypeError<`Array element parsing failed`>
            : Type extends '{'
              ? $ParseRecursiveVariantKeyValue<Remaining>
              : Type extends 'm'
                ? $ParseRecursiveVariantValue<Remaining> extends [infer Value, infer Rest]
                  ? Rest extends string
                    ? [Value | null, Rest]
                    : VariantTypeError<`Maybe parsing failed`>
                  : VariantTypeError<`Maybe content parsing failed`>
                : VariantTypeError<`Unknown type: ${Type}`>
    : VariantTypeError<`Invalid variant string: ${State}`>;

/**
 * Parses tuple for recursive unpacking - fully unpacks all elements
 */
type $ParseRecursiveVariantTuple<State extends string, Memo extends any[] = []> =
    string extends State
    ? VariantTypeError<"$ParseRecursiveVariantTuple: 'string' is not a supported type.">
    : State extends `)${infer Remaining}`
    ? [Memo, Remaining]
    : $ParseRecursiveVariantValue<State> extends [infer Value, infer NextState]
    ? NextState extends string
      ? $ParseRecursiveVariantTuple<NextState, [...Memo, Value]>
      : VariantTypeError<`$ParseRecursiveVariantTuple: Invalid state`>
    : VariantTypeError<`$ParseRecursiveVariantTuple: Parsing failed`>;

/**
 * Parses dictionary for recursive unpacking - fully unpacks all values
 */
type $ParseRecursiveVariantDict<State extends string> =
    string extends State
    ? VariantTypeError<"$ParseRecursiveVariantDict: 'string' is not a supported type.">
    : State extends `${infer Key}${infer AfterKey}`
    ? Key extends 's' | 'o' | 'g' | 'n' | 'q' | 't' | 'd' | 'u' | 'i' | 'x' | 'y'
      ? AfterKey extends `v}${infer Remaining}`
        ? [CreateIndexType<Key, unknown>, Remaining]  // a{sv} becomes unknown when recursively unpacked
        : $ParseRecursiveVariantValue<AfterKey> extends [infer V, `}${infer Remaining}`]
          ? [CreateIndexType<Key, V>, Remaining]
          : VariantTypeError<`Invalid dictionary value type in: ${AfterKey}`>
      : VariantTypeError<`Invalid dictionary key type: ${Key}`>
    : VariantTypeError<`Invalid dictionary format: ${State}`>;

/**
 * Parses key-value for recursive unpacking
 */
type $ParseRecursiveVariantKeyValue<State extends string> =
    string extends State
    ? VariantTypeError<"$ParseRecursiveVariantKeyValue: 'string' is not a supported type.">
    : State extends `${infer Key}${infer AfterKey}`
    ? Key extends 's' | 'o' | 'g' | 'n' | 'q' | 't' | 'd' | 'u' | 'i' | 'x' | 'y'
      ? AfterKey extends `v}${infer Remaining}`
        ? [[BasicTypeMap<Key>, unknown], Remaining]  // Value is fully unpacked to unknown
        : $ParseRecursiveVariantValue<AfterKey> extends [infer V, `}${infer Remaining}`]
          ? [[BasicTypeMap<Key>, V], Remaining]
          : VariantTypeError<`Invalid key-value value type in: ${AfterKey}`>
      : VariantTypeError<`Invalid key-value key type: ${Key}`>
    : VariantTypeError<`Invalid key-value format: ${State}`>;

/**
 * Main entry point for recursive variant parsing
 */
type $ParseRecursiveVariant<T extends string> =
    $ParseRecursiveVariantValue<T> extends infer Result
    ? Result extends [infer Value, string]
      ? Value
      : Result extends VariantTypeError<any>
        ? Result
        : unknown
    : unknown;

// === Constructor input types ===

/**
 * Parser for constructor input values
 */
type $ParseConstructorInputValue<State extends string> =
    string extends State
    ? unknown
    // Basic types
    : State extends `${infer Type}${infer Remaining}`
    ? Type extends 's' | 'o' | 'g' | 'b' | 'n' | 'q' | 't' | 'd' | 'u' | 'i' | 'x' | 'y' | 'h' | '?'
      ? [BasicTypeMap<Type>, Remaining]
      : Type extends 'v'
        ? [Variant, Remaining]
        // Container types
        : Type extends '('
          ? $ParseConstructorInputTuple<Remaining>
          : Type extends 'a'
            ? Remaining extends `y${infer Rest}`
              ? [Uint8Array | string, Rest]  // ay accepts both Uint8Array and string
              : Remaining extends `{${infer DictContent}`
                ? $ParseConstructorInputDict<DictContent>
                : $ParseConstructorInputValue<Remaining> extends [infer ElementType, infer Rest]
                  ? Rest extends string
                    ? [ElementType[], Rest]
                    : VariantTypeError<`Array parsing failed`>
                  : VariantTypeError<`Array element parsing failed`>
            : Type extends '{'
              ? $ParseConstructorInputKeyValue<Remaining>
              : Type extends 'm'
                ? $ParseConstructorInputValue<Remaining> extends [infer Value, infer Rest]
                  ? Rest extends string
                    ? [Value | null, Rest]
                    : VariantTypeError<`Maybe parsing failed`>
                  : VariantTypeError<`Maybe content parsing failed`>
                : VariantTypeError<`Unknown type: ${Type}`>
    : VariantTypeError<`Invalid variant string: ${State}`>;

/**
 * Parses tuple for constructor input
 */
type $ParseConstructorInputTuple<State extends string, Memo extends any[] = []> =
    string extends State
    ? VariantTypeError<"Invalid tuple state">
    : State extends `)${infer Remaining}`
    ? [Memo, Remaining]
    : $ParseConstructorInputValue<State> extends [infer Value, infer NextState]
    ? NextState extends string
      ? $ParseConstructorInputTuple<NextState, [...Memo, Value]>
      : VariantTypeError<`Invalid tuple parsing`>
    : VariantTypeError<`Tuple element parsing failed`>;

/**
 * Parses dictionary for constructor input
 */
type $ParseConstructorInputDict<State extends string> =
    string extends State
    ? VariantTypeError<"Invalid dictionary state">
    : State extends `${infer Key}${infer AfterKey}`
    ? Key extends 's' | 'o' | 'g' | 'n' | 'q' | 't' | 'd' | 'u' | 'i' | 'x' | 'y'
      ? $ParseConstructorInputValue<AfterKey> extends [infer V, `}${infer Remaining}`]
        ? [CreateIndexType<Key, V>, Remaining]
        : VariantTypeError<`Invalid dictionary value type`>
      : VariantTypeError<`Invalid dictionary key type`>
    : VariantTypeError<`Invalid dictionary format`>;

/**
 * Parses key-value for constructor input
 */
type $ParseConstructorInputKeyValue<State extends string> =
    string extends State
    ? VariantTypeError<"Invalid key-value state">
    : State extends `${infer Key}${infer AfterKey}`
    ? Key extends 's' | 'o' | 'g' | 'n' | 'q' | 't' | 'd' | 'u' | 'i' | 'x' | 'y'
      ? $ParseConstructorInputValue<AfterKey> extends [infer V, `}${infer Remaining}`]
        ? [[BasicTypeMap<Key>, V], Remaining]
        : VariantTypeError<`Invalid key-value value type`>
      : VariantTypeError<`Invalid key-value key type`>
    : VariantTypeError<`Invalid key-value format`>;

/**
 * Main entry point for constructor input parsing
 */
type $ParseConstructorInput<T extends string> =
    $ParseConstructorInputValue<T> extends infer Result
    ? Result extends [infer Value, string]
      ? Value
      : Result extends VariantTypeError<any>
        ? Result
        : any
    : any;

// === Type aliases for unpacking methods ===

type $ParseVariant<T extends string> = $ParseShallowVariant<T>;

// === Utility types for Variant and VariantBuilder ===

type $VariantTypeToString<T extends VariantType> = T extends VariantType<infer S> ? S : never;

type $ToTuple<T extends readonly Variant[]> =
    T extends [] ? '' :
    T extends [Variant<infer S>] ? `${S}` :
    T extends [Variant<infer S>, ...infer U] ? (
        U extends [...Variant[]] ? `${S}${$ToTuple<U>}` : never) :
    '?';

type $ToTupleVT<T extends readonly VariantType[]> =
    T extends [] ? '' :
    T extends [VariantType<infer S>] ? `${S}` :
    T extends [VariantType<infer S>, ...infer U] ? (
        U extends [...VariantType[]] ? `${S}${$ToTupleVT<U>}` : never) :
    '?';

type $ElementSig<E extends any> =
    E extends [infer Element] ? Element :
    E extends [infer Element, ...infer Elements] ? Element | $ElementSig<Elements> :
    E extends globalThis.Array<infer Element> ? Element : never;

/**
 * GLib.Variant is a value container whose types are determined at construction.
 * 
 * It serves as a reliable and efficient format for storing structured data that can be 
 * serialized while preserving type information. Comparable to JSON, but with strong typing
 * and support for special values like file handles.
 * 
 * GVariant is used throughout the GNOME Platform including GDBus, GSettings, GAction, 
 * GMenu and many other APIs. All D-Bus method, property and signal values are GVariant objects.
 * 
 * @example
 * ```typescript
 * // Create variants using constructor with type signature
 * const stringVariant = new GLib.Variant('s', 'Hello World');
 * const numberVariant = new GLib.Variant('i', 42);
 * const boolVariant = new GLib.Variant('b', true);
 * 
 * // Create complex variants like dictionaries
 * const dictVariant = new GLib.Variant('a{sv}', {
 *   'name': GLib.Variant.new_string('Mario'),
 *   'lives': GLib.Variant.new_uint32(3),
 *   'active': GLib.Variant.new_boolean(true)
 * });
 * 
 * // Unpack variants to JavaScript values
 * const stringValue = stringVariant.unpack(); // → "Hello World"
 * const dictValue = dictVariant.deepUnpack(); // → { name: Variant<"s">, lives: Variant<"u">, active: Variant<"b"> }
 * ```
 * 
 * @see {@link https://gjs.guide/guides/glib/gvariant.html|GJS Guide: GVariant}
 * @see {@link https://docs.gtk.org/glib/struct.Variant.html|GLib Documentation: GVariant}
 */
export class Variant<S extends string = any> {
    static $gtype: GObject.GType<Variant>;
    
    /**
     * Creates a new GVariant with the specified type signature and value.
     * 
     * @param sig The GVariant type signature (e.g., 's' for string, 'i' for int32, 'a{sv}' for dictionary)
     * @param value The JavaScript value to pack into the variant
     * @example
     * ```typescript
     * const variant = new GLib.Variant('s', 'Hello');
     * const arrayVariant = new GLib.Variant('as', ['one', 'two', 'three']);
     * ```
     */
    constructor(sig: S, value: $ParseConstructorInput<S>);
    constructor(copy: Variant<S>);
    _init(sig: S, value: any): Variant<S>;
    
    // Constructors
    /**
     * Creates a new GVariant with the specified type signature and value.
     * 
     * This is equivalent to using the constructor directly.
     * 
     * @param sig The GVariant type signature
     * @param value The JavaScript value to pack
     * @returns A new GVariant instance
     */
    static ["new"]<S extends string>(sig: S, value: $ParseConstructorInput<S>): Variant<S>;
    static _new_internal<S extends string>(sig: S, value: $ParseConstructorInput<S>): Variant<S>;
    static new_array<C extends string = "a?">(
        child_type: VariantType<C> | null,
        children: typeof child_type extends VariantType<any>
          ? Variant<$VariantTypeToString<typeof child_type>>[]
          : Variant<C>[]
      ): Variant<`a${C}`>;
      
    /**
     * Creates a new boolean GVariant instance.
     * 
     * @param value The boolean value to pack
     * @returns A new GVariant with type signature 'b'
     * @example
     * ```typescript
     * const variant = GLib.Variant.new_boolean(true);
     * const unpacked = variant.get_boolean(); // → true
     * ```
     */
    static new_boolean(value: boolean): Variant<'b'>;
    
    static new_byte(value: number): Variant<'y'>;
    
    /**
     * Creates a new bytestring GVariant instance from a Uint8Array or string.
     * 
     * @param string The string or byte array to pack
     * @returns A new GVariant with type signature 'ay'
     */
    static new_bytestring(string: Uint8Array | string): Variant<'ay'>;
    
    static new_bytestring_array(strv: string[]): Variant<'aay'>;
    
    /**
     * Creates a new dictionary entry GVariant.
     * 
     * @param key The key variant
     * @param value The value variant  
     * @returns A new GVariant representing a key-value pair
     */
    static new_dict_entry(key: Variant, value: Variant): Variant<'{vv}'>;
    
    /**
     * Creates a new double-precision floating point GVariant.
     * 
     * @param value The number value to pack
     * @returns A new GVariant with type signature 'd'
     */
    static new_double(value: number): Variant<'d'>;
    
    static new_fixed_array<C extends string = 'a?'>(element_type: VariantType<C>, elements: Variant<$VariantTypeToString<typeof element_type>>[] | null, n_elements: number, element_size: number): Variant<`a${C}`>;
    static new_from_bytes<C extends string>(type: VariantType<C>, bytes: Bytes | Uint8Array, trusted: boolean): Variant<C>;
    static new_from_data<C extends string>(type: VariantType<C>, data: Uint8Array | string, trusted: boolean, user_data?: any | null): Variant<C>;
    static new_handle(value: number): Variant<'h'>;
    static new_int16(value: number): Variant<'n'>;
    
    /**
     * Creates a new 32-bit signed integer GVariant.
     * 
     * @param value The integer value to pack
     * @returns A new GVariant with type signature 'i'
     * @example
     * ```typescript
     * const variant = GLib.Variant.new_int32(-42);
     * const unpacked = variant.get_int32(); // → -42
     * ```
     */
    static new_int32(value: number): Variant<'i'>;
    
    /**
     * Creates a new 64-bit signed integer GVariant.
     * 
     * Note: As of GJS v1.68, all numeric types are still Number values,
     * so some 64-bit values may not be fully supported. BigInt support to come.
     * 
     * @param value The integer value to pack
     * @returns A new GVariant with type signature 'x'
     */
    static new_int64(value: number): Variant<'x'>;
    
    static new_maybe(child_type?: VariantType | null, child?: Variant | null): Variant<'mv'>;
    
    /**
     * Creates a new object path GVariant.
     * 
     * @param object_path A valid D-Bus object path string
     * @returns A new GVariant with type signature 'o'
     */
    static new_object_path(object_path: string): Variant<'o'>;
    
    static new_objv(strv: string[]): Variant<'ao'>;
    
    /**
     * Creates a new D-Bus signature GVariant.
     * 
     * @param signature A valid D-Bus type signature string
     * @returns A new GVariant with type signature 'g'
     */
    static new_signature(signature: string): Variant<'g'>;
    
    /**
     * Creates a new string GVariant instance.
     * 
     * @param string The string value to pack
     * @returns A new GVariant with type signature 's'
     * @example
     * ```typescript
     * const variant = GLib.Variant.new_string('Hello World');
     * const [value, length] = variant.get_string(); // → ['Hello World', 11]
     * const unpacked = variant.unpack(); // → 'Hello World'
     * ```
     */
    static new_string(string: string): Variant<'s'>;
    
    /**
     * Creates a new string array GVariant instance.
     * 
     * @param strv Array of strings to pack
     * @returns A new GVariant with type signature 'as'
     * @example
     * ```typescript
     * const variant = GLib.Variant.new_strv(['one', 'two', 'three']);
     * const unpacked = variant.get_strv(); // → ['one', 'two', 'three']
     * const deepUnpacked = variant.deepUnpack(); // → ['one', 'two', 'three']
     * ```
     */
    static new_strv(strv: string[]): Variant<'as'>;
    
    static new_tuple<Items extends (ReadonlyArray<Variant> | readonly [Variant])>(children: Items): Variant<`(${$ToTuple<Items>})`>;
    static new_uint16(value: number): Variant<'q'>;
    
    /**
     * Creates a new 32-bit unsigned integer GVariant.
     * 
     * @param value The unsigned integer value to pack
     * @returns A new GVariant with type signature 'u'
     */
    static new_uint32(value: number): Variant<'u'>;
    
    static new_uint64(value: number): Variant<'t'>;
    
    /**
     * Creates a new variant GVariant that contains another variant.
     * 
     * @param value The variant to wrap
     * @returns A new GVariant with type signature 'v'
     */
    static new_variant(value: Variant): Variant<'v'>;
    // Members
    byteswap(): Variant;
    check_format_string(format_string: string, copy_only: boolean): boolean;
    classify(): VariantClass;
    compare(two: Variant): number;
    dup_bytestring(): Uint8Array;
    dup_bytestring_array(): string[];
    dup_objv(): string[];
    dup_string(): [string, number];
    dup_strv(): string[];
    /**
     * Checks if two variants are equal.
     * 
     * @param two The variant to compare with
     * @returns true if the variants are equal, false otherwise
     * @example
     * ```typescript
     * const variant1 = GLib.Variant.new_string('test');
     * const variant2 = GLib.Variant.new_string('test');
     * const areEqual = variant1.equal(variant2); // → true
     * ```
     */
    equal(two: Variant): boolean;
    
    /**
     * Extracts a boolean value from a boolean variant.
     * 
     * @returns The boolean value
     * @throws Error if the variant is not of type 'b'
     */
    get_boolean(): boolean;
    
    get_byte(): number;
    
    /**
     * Extracts a bytestring from a bytestring variant.
     * 
     * @returns The byte array
     */
    get_bytestring(): Uint8Array;
    
    get_bytestring_array(): string[];
    
    /**
     * Gets a child variant by index from a container variant.
     * 
     * @param index_ The index of the child to retrieve
     * @returns The child variant at the specified index
     * @example
     * ```typescript
     * const tuple = new GLib.Variant('(si)', ['hello', 42]);
     * const firstChild = tuple.get_child_value(0); // → Variant<'s'> containing 'hello'
     * const secondChild = tuple.get_child_value(1); // → Variant<'i'> containing 42
     * ```
     */
    get_child_value(index_: number): Variant;
    
    get_data(): any | null;
    get_data_as_bytes(): Bytes;
    get_double(): number;
    get_handle(): number;
    get_int16(): number;
    
    /**
     * Extracts a 32-bit signed integer from an integer variant.
     * 
     * @returns The integer value
     * @throws Error if the variant is not of type 'i'
     */
    get_int32(): number;
    
    get_int64(): number;
    get_maybe(): Variant | null;
    get_normal_form(): Variant;
    get_objv(): string[];
    get_size(): number;
    
    /**
     * Extracts a string value from a string variant.
     * 
     * @returns A tuple containing the string value and its length
     * @example
     * ```typescript
     * const variant = GLib.Variant.new_string('hello');
     * const [value, length] = variant.get_string(); // → ['hello', 5]
     * ```
     */
    get_string(): [string, number | null];
    
    /**
     * Extracts a string array from a string array variant.
     * 
     * @returns Array of strings
     */
    get_strv(): string[];
    
    /**
     * Gets the type of the variant.
     * 
     * @returns The VariantType representing this variant's type
     */
    get_type(): VariantType<S>;
    
    /**
     * Gets the type signature string of the variant.
     * 
     * This is very useful for debugging and type checking.
     * 
     * @returns The type signature string (e.g., 's', 'i', 'a{sv}')
     * @example
     * ```typescript
     * const stringVariant = GLib.Variant.new_string('test');
     * const typeString = stringVariant.get_type_string(); // → 's'
     * 
     * const dictVariant = new GLib.Variant('a{sv}', {});
     * const dictType = dictVariant.get_type_string(); // → 'a{sv}'
     * ```
     */
    get_type_string(): string;
    
    get_uint16(): number;
    get_uint32(): number;
    get_uint64(): number;
    get_variant(): Variant;
    hash(): number;
    
    /**
     * Checks if the variant is a container type.
     * 
     * Container types include arrays, tuples, dictionaries, and maybes.
     * 
     * @returns true if the variant is a container
     */
    is_container(): boolean;
    
    is_floating(): boolean;
    is_normal_form(): boolean;
    is_of_type(type: VariantType): boolean;
    lookup_value(key: string, expected_type?: VariantType | null): Variant;
    
    /**
     * Gets the number of children in a container variant.
     * 
     * @returns The number of child elements
     * @example
     * ```typescript
     * const tuple = new GLib.Variant('(si)', ['hello', 42]);
     * const childCount = tuple.n_children(); // → 2
     * 
     * const array = GLib.Variant.new_strv(['a', 'b', 'c']);
     * const arrayLength = array.n_children(); // → 3
     * ```
     */
    n_children(): number;
    
    /**
     * Creates a string representation of the variant.
     * 
     * This is extremely useful for debugging GVariant structures.
     * 
     * @param type_annotate Whether to include type annotations in the output
     * @returns A string representation of the variant
     * @example
     * ```typescript
     * const variant = new GLib.Variant('a{sv}', {
     *   'name': GLib.Variant.new_string('Mario'),
     *   'lives': GLib.Variant.new_uint32(3)
     * });
     * 
     * // Without type annotations
     * print(variant.print(false)); // → "{'name': 'Mario', 'lives': 3}"
     * 
     * // With type annotations  
     * print(variant.print(true)); // → "{'name': <'Mario'>, 'lives': <uint32 3>}"
     * ```
     */
    print(type_annotate: boolean): string;
    ref(): Variant;
    ref_sink(): Variant;
    store(data: any): void;
    take_ref(): Variant;
    unref(): void;
    static is_object_path(string: string): boolean;
    static is_signature(string: string): boolean;
    static parse(type: VariantType | null, text: string, limit?: string | null, endptr?: string | null): Variant;
    static parse_error_print_context(error: Error, source_str: string): string;
    static parse_error_quark(): Quark;
    static parser_get_error_quark(): Quark;
    /**
     * Unpacks the variant's data into a JavaScript value.
     * 
     * This performs a **shallow unpacking operation** - only unpacking the top level.
     * For containers like arrays or dictionaries, child elements remain as Variant objects.
     * 
     * @example
     * ```typescript
     * // Simple types are fully unpacked
     * const boolVariant = GLib.Variant.new_boolean(true);
     * const boolValue = boolVariant.unpack(); // → true
     * 
     * // String values are unpacked (discarding length information)
     * const stringVariant = GLib.Variant.new_string("hello");
     * const stringValue = stringVariant.unpack(); // → "hello"
     * 
     * // Arrays are unpacked but elements remain as Variants
     * const arrayVariant = GLib.Variant.new_strv(["one", "two"]);
     * const arrayValue = arrayVariant.unpack(); // → [Variant<"s">, Variant<"s">]
     * ```
     * 
     * @returns The unpacked JavaScript value with child Variants preserved
     * @see {@link deepUnpack} for unpacking one level deeper
     * @see {@link recursiveUnpack} for full recursive unpacking
     */
    unpack(): $ParseShallowVariant<S>;
    unpack<T>(): T;
    unpack(): $ParseShallowVariant<S>; // Duplicate overload ensures optimal type inference for ReturnType<...>
    
    /**
     * Recursively unpacks the variant's data into JavaScript values.
     * 
     * This method unpacks a variant **and its direct children**, but only up to one level deep.
     * It's the most commonly used unpacking method for D-Bus operations and GSettings.
     * 
     * With advanced variants enabled, this method provides automatic type inference
     * based on the variant's type signature. You can also explicitly specify a type
     * parameter for backward compatibility.
     * 
     * @example
     * ```typescript
     * // Simple dictionary (a{ss}) - fully unpacked
     * const simpleDict = new GLib.Variant('a{ss}', {
     *   'key1': 'value1',
     *   'key2': 'value2'
     * });
     * const simple = simpleDict.deepUnpack(); // → { key1: "value1", key2: "value2" }
     * 
     * // Complex dictionary (a{sv}) - values remain as Variants
     * const complexDict = new GLib.Variant('a{sv}', {
     *   'name': GLib.Variant.new_string('Mario'),
     *   'active': GLib.Variant.new_boolean(true)
     * });
     * const complex = complexDict.deepUnpack(); // → { name: Variant<"s">, active: Variant<"b"> }
     * 
     * // Automatic type inference (Advanced Variants)
     * const autoInferred = variant.deepUnpack(); // Types inferred from signature
     * 
     * // Explicit type parameter (backward compatibility)
     * const explicit = variant.deepUnpack<{ [key: string]: GLib.Variant }>();
     * 
     * // String arrays are fully unpacked
     * const strArray = GLib.Variant.new_strv(['one', 'two']);
     * const strings = strArray.deepUnpack(); // → ["one", "two"]
     * ```
     * 
     * @template T The expected return type (defaults to automatically inferred type)
     * @returns The deeply unpacked JavaScript value with one level of children unpacked
     * @see {@link unpack} for shallow unpacking only
     * @see {@link recursiveUnpack} for full recursive unpacking
     */
    // Overloads: concrete first so call-sites infer precisely; generic allows explicit override; concrete repeated last so ReturnType<...> is precise
    deepUnpack(): $ParseDeepVariant<S>;
    deepUnpack<T>(): T;
    deepUnpack(): $ParseDeepVariant<S>; // Duplicate overload ensures optimal type inference for ReturnType<...>
    
    /**
     * Alias for {@link deepUnpack} method.
     * 
     * Recursively unpacks the variant's data into JavaScript values up to one level deep.
     * This is the snake_case version of the same functionality.
     * 
     * @returns The deeply unpacked JavaScript value
     * @see {@link deepUnpack} for the camelCase version with full documentation
     */
    deep_unpack(): $ParseDeepVariant<S>;
    deep_unpack<T>(): T;
    deep_unpack(): $ParseDeepVariant<S>; // Duplicate overload ensures optimal type inference for ReturnType<...>
    
    /**
     * Recursively unpacks the variant and **all its descendants** into native JavaScript values.
     * 
     * **Available since GJS 1.64 (GNOME 3.36)**
     * 
     * This method performs complete recursive unpacking, converting all nested Variants
     * to their native JavaScript equivalents. **Type information may be lost** during
     * this process, so you'll need to know the original types to repack values.
     * 
     * @example
     * ```typescript
     * // Complex nested structure fully unpacked
     * const complexDict = new GLib.Variant('a{sv}', {
     *   'name': GLib.Variant.new_string('Mario'),
     *   'lives': GLib.Variant.new_uint32(3),
     *   'active': GLib.Variant.new_boolean(true)
     * });
     * 
     * const fullyUnpacked = complexDict.recursiveUnpack();
     * // → { name: "Mario", lives: 3, active: true }
     * 
     * // All nested Variants are converted to native values
     * const nestedTuple = new GLib.Variant('(sa{sv})', [
     *   'player',
     *   { 'score': GLib.Variant.new_int32(100) }
     * ]);
     * const result = nestedTuple.recursiveUnpack();
     * // → ["player", { score: 100 }]
     * ```
     * 
     * @returns The recursively unpacked JavaScript value with all Variants converted to native types
     * @see {@link deepUnpack} for one-level unpacking with type preservation
     * @see {@link unpack} for shallow unpacking only
     * @since 1.64
     */
    recursiveUnpack(): $ParseRecursiveVariant<S>;
    recursiveUnpack<T>(): T;
    recursiveUnpack(): $ParseRecursiveVariant<S>; // Duplicate overload ensures optimal type inference for ReturnType<...>
}

/**
 * A utility class for building complex GVariant structures incrementally.
 * 
 * VariantBuilder is useful when you need to construct variants dynamically
 * or when dealing with complex nested structures. It provides a way to
 * build variants step by step rather than constructing the entire structure at once.
 * 
 * @example
 * ```typescript
 * // Building an array of variants
 * const builder = new GLib.VariantBuilder(new GLib.VariantType('av'));
 * builder.add_value(GLib.Variant.new_string('first'));
 * builder.add_value(GLib.Variant.new_int32(42));
 * builder.add_value(GLib.Variant.new_boolean(true));
 * const arrayVariant = builder.end(); // → Variant<'av'>
 * 
 * // Building a dictionary incrementally
 * const dictBuilder = new GLib.VariantBuilder(new GLib.VariantType('a{sv}'));
 * dictBuilder.add_value(GLib.Variant.new_dict_entry(
 *   GLib.Variant.new_string('name'),
 *   GLib.Variant.new_variant(GLib.Variant.new_string('Mario'))
 * ));
 * const dict = dictBuilder.end();
 * ```
 */
export class VariantBuilder<S extends string = 'a*'> {
    static $gtype: GObject.GType<VariantBuilder>;
    constructor(type: VariantType<S>);
    constructor(copy: VariantBuilder<S>);
    
    // Constructors
    /**
     * Creates a new VariantBuilder for the specified type.
     * 
     * @param type The type of variant to build
     * @returns A new VariantBuilder instance
     */
    static ["new"]<S extends string = 'a*'>(type: VariantType<S>): VariantBuilder<S>;
    
    // Members
    /**
     * Adds a value to the variant being built.
     * 
     * @param value The value to add (must match the expected element type)
     */
    add_value(value: $ElementSig<$ParseDeepVariant<S>>): void;
    
    /**
     * Closes the current container being built.
     */
    close(): void;
    
    /**
     * Completes the building process and returns the constructed variant.
     * 
     * @returns The completed variant
     */
    end(): Variant<S>;
    
    /**
     * Opens a new subcontainer of the specified type.
     * 
     * @param type The type of the subcontainer to open
     */
    open(type: VariantType): void;
    
    ref(): VariantBuilder;
    unref(): void;
}

export class VariantDict {
    static $gtype: GObject.GType<VariantDict>;
    constructor(from_asv?: Variant | null);
    constructor(copy: VariantDict);
    // Constructors
    static ["new"](from_asv?: Variant | null): VariantDict;
    // Members
    clear(): void;
    contains(key: string): boolean;
    end(): Variant;
    insert_value(key: string, value: Variant): void;
    lookup_value(key: string, expected_type?: VariantType | null): Variant;
    ref(): VariantDict;
    remove(key: string): boolean;
    unref(): void;
    lookup(key: any, variantType?: any, deep?: boolean): any;
}

export class VariantType<S extends string = any> {
    static $gtype: GObject.GType<VariantType>;
    constructor(type_string: S);
    constructor(copy: VariantType<S>);
    // Constructors
    static ["new"]<S extends string>(type_string: S): VariantType<S>;
    static new_array<S extends string>(element: VariantType<S>): VariantType<`a${S}`>;
    static new_dict_entry<K extends string, V extends string>(key: VariantType<K>, value: VariantType<V>): VariantType<`{${K}${V}}`>;
    static new_maybe<S extends string>(element: VariantType<S>): VariantType<`m${S}`>;
    static new_tuple<Items extends (ReadonlyArray<VariantType> | readonly [VariantType])>(items: Items): VariantType<`(${$ToTupleVT<Items>})`>;
    // Members
    copy(): VariantType<S>;
    dup_string(): string;
    element(): VariantType;
    equal(type2: VariantType): boolean;
    first(): VariantType;
    free(): void;
    get_string_length(): number;
    hash(): number;
    is_array(): boolean;
    is_basic(): boolean;
    is_container(): boolean;
    is_definite(): boolean;
    is_dict_entry(): boolean;
    is_maybe(): boolean;
    is_subtype_of(supertype: VariantType): boolean;
    is_tuple(): boolean;
    is_variant(): boolean;
    key(): VariantType;
    n_items(): number;
    next(): VariantType;
    value(): VariantType;
    static checked_(arg0: string): VariantType;
    static string_get_depth_(type_string: string): number;
    static string_is_valid(type_string: string): boolean;
    static string_scan(string: string, limit?: string | null): [boolean, string | null];
}


    /**
     * GLib-2.0
     */


    class BookmarkFileError extends Error {
        static $gtype: GObject.GType<Error>;

        // Static fields
        static INVALID_URI: number;

        static INVALID_VALUE: number;

        static APP_NOT_REGISTERED: number;

        static URI_NOT_FOUND: number;

        static READ: number;

        static UNKNOWN_ENCODING: number;

        static WRITE: number;

        static FILE_NOT_FOUND: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    enum ChecksumType {
        MD5 = 0,
        SHA1 = 1,
        SHA256 = 2,
        SHA512 = 3,
        SHA384 = 4,
    }


    class ConvertError extends Error {
        static $gtype: GObject.GType<Error>;

        // Static fields
        static NO_CONVERSION: number;

        static ILLEGAL_SEQUENCE: number;

        static FAILED: number;

        static PARTIAL_INPUT: number;

        static BAD_URI: number;

        static NOT_ABSOLUTE_PATH: number;

        static NO_MEMORY: number;

        static EMBEDDED_NUL: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    enum DateDMY {
        DAY = 0,
        MONTH = 1,
        YEAR = 2,
    }


    enum DateMonth {
        BAD_MONTH = 0,
        JANUARY = 1,
        FEBRUARY = 2,
        MARCH = 3,
        APRIL = 4,
        MAY = 5,
        JUNE = 6,
        JULY = 7,
        AUGUST = 8,
        SEPTEMBER = 9,
        OCTOBER = 10,
        NOVEMBER = 11,
        DECEMBER = 12,
    }


    enum DateWeekday {
        BAD_WEEKDAY = 0,
        MONDAY = 1,
        TUESDAY = 2,
        WEDNESDAY = 3,
        THURSDAY = 4,
        FRIDAY = 5,
        SATURDAY = 6,
        SUNDAY = 7,
    }


    enum ErrorType {
        UNKNOWN = 0,
        UNEXP_EOF = 1,
        UNEXP_EOF_IN_STRING = 2,
        UNEXP_EOF_IN_COMMENT = 3,
        NON_DIGIT_IN_CONST = 4,
        DIGIT_RADIX = 5,
        FLOAT_RADIX = 6,
        FLOAT_MALFORMED = 7,
    }


    class FileError extends Error {
        static $gtype: GObject.GType<Error>;

        // Static fields
        static EXIST: number;

        static ISDIR: number;

        static ACCES: number;

        static NAMETOOLONG: number;

        static NOENT: number;

        static NOTDIR: number;

        static NXIO: number;

        static NODEV: number;

        static ROFS: number;

        static TXTBSY: number;

        static FAULT: number;

        static LOOP: number;

        static NOSPC: number;

        static NOMEM: number;

        static MFILE: number;

        static NFILE: number;

        static BADF: number;

        static INVAL: number;

        static PIPE: number;

        static AGAIN: number;

        static INTR: number;

        static IO: number;

        static PERM: number;

        static NOSYS: number;

        static FAILED: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    class IOChannelError extends Error {
        static $gtype: GObject.GType<Error>;

        // Static fields
        static FBIG: number;

        static INVAL: number;

        static IO: number;

        static ISDIR: number;

        static NOSPC: number;

        static NXIO: number;

        static OVERFLOW: number;

        static PIPE: number;

        static FAILED: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    enum IOError {
        NONE = 0,
        AGAIN = 1,
        INVAL = 2,
        UNKNOWN = 3,
    }


    enum IOStatus {
        ERROR = 0,
        NORMAL = 1,
        EOF = 2,
        AGAIN = 3,
    }


    class KeyFileError extends Error {
        static $gtype: GObject.GType<Error>;

        // Static fields
        static UNKNOWN_ENCODING: number;

        static PARSE: number;

        static NOT_FOUND: number;

        static KEY_NOT_FOUND: number;

        static GROUP_NOT_FOUND: number;

        static INVALID_VALUE: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    enum LogWriterOutput {
        HANDLED = 1,
        UNHANDLED = 0,
    }


    class MarkupError extends Error {
        static $gtype: GObject.GType<Error>;

        // Static fields
        static BAD_UTF8: number;

        static EMPTY: number;

        static PARSE: number;

        static UNKNOWN_ELEMENT: number;

        static UNKNOWN_ATTRIBUTE: number;

        static INVALID_CONTENT: number;

        static MISSING_ATTRIBUTE: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    export namespace NormalizeMode {
        export const $gtype: GObject.GType<NormalizeMode>;
    }

    enum NormalizeMode {
        DEFAULT = 0,
        NFD = 0,
        DEFAULT_COMPOSE = 1,
        NFC = 1,
        ALL = 2,
        NFKD = 2,
        ALL_COMPOSE = 3,
        NFKC = 3,
    }


    class NumberParserError extends Error {
        static $gtype: GObject.GType<Error>;

        // Static fields
        static INVALID: number;

        static OUT_OF_BOUNDS: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    enum OnceStatus {
        NOTCALLED = 0,
        PROGRESS = 1,
        READY = 2,
    }


    enum OptionArg {
        NONE = 0,
        STRING = 1,
        INT = 2,
        CALLBACK = 3,
        FILENAME = 4,
        STRING_ARRAY = 5,
        FILENAME_ARRAY = 6,
        DOUBLE = 7,
        INT64 = 8,
    }


    class OptionError extends Error {
        static $gtype: GObject.GType<Error>;

        // Static fields
        static UNKNOWN_OPTION: number;

        static BAD_VALUE: number;

        static FAILED: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    class RegexError extends Error {
        static $gtype: GObject.GType<Error>;

        // Static fields
        static COMPILE: number;

        static OPTIMIZE: number;

        static REPLACE: number;

        static MATCH: number;

        static INTERNAL: number;

        static STRAY_BACKSLASH: number;

        static MISSING_CONTROL_CHAR: number;

        static UNRECOGNIZED_ESCAPE: number;

        static QUANTIFIERS_OUT_OF_ORDER: number;

        static QUANTIFIER_TOO_BIG: number;

        static UNTERMINATED_CHARACTER_CLASS: number;

        static INVALID_ESCAPE_IN_CHARACTER_CLASS: number;

        static RANGE_OUT_OF_ORDER: number;

        static NOTHING_TO_REPEAT: number;

        static UNRECOGNIZED_CHARACTER: number;

        static POSIX_NAMED_CLASS_OUTSIDE_CLASS: number;

        static UNMATCHED_PARENTHESIS: number;

        static INEXISTENT_SUBPATTERN_REFERENCE: number;

        static UNTERMINATED_COMMENT: number;

        static EXPRESSION_TOO_LARGE: number;

        static MEMORY_ERROR: number;

        static VARIABLE_LENGTH_LOOKBEHIND: number;

        static MALFORMED_CONDITION: number;

        static TOO_MANY_CONDITIONAL_BRANCHES: number;

        static ASSERTION_EXPECTED: number;

        static UNKNOWN_POSIX_CLASS_NAME: number;

        static POSIX_COLLATING_ELEMENTS_NOT_SUPPORTED: number;

        static HEX_CODE_TOO_LARGE: number;

        static INVALID_CONDITION: number;

        static SINGLE_BYTE_MATCH_IN_LOOKBEHIND: number;

        static INFINITE_LOOP: number;

        static MISSING_SUBPATTERN_NAME_TERMINATOR: number;

        static DUPLICATE_SUBPATTERN_NAME: number;

        static MALFORMED_PROPERTY: number;

        static UNKNOWN_PROPERTY: number;

        static SUBPATTERN_NAME_TOO_LONG: number;

        static TOO_MANY_SUBPATTERNS: number;

        static INVALID_OCTAL_VALUE: number;

        static TOO_MANY_BRANCHES_IN_DEFINE: number;

        static DEFINE_REPETION: number;

        static INCONSISTENT_NEWLINE_OPTIONS: number;

        static MISSING_BACK_REFERENCE: number;

        static INVALID_RELATIVE_REFERENCE: number;

        static BACKTRACKING_CONTROL_VERB_ARGUMENT_FORBIDDEN: number;

        static UNKNOWN_BACKTRACKING_CONTROL_VERB: number;

        static NUMBER_TOO_BIG: number;

        static MISSING_SUBPATTERN_NAME: number;

        static MISSING_DIGIT: number;

        static INVALID_DATA_CHARACTER: number;

        static EXTRA_SUBPATTERN_NAME: number;

        static BACKTRACKING_CONTROL_VERB_ARGUMENT_REQUIRED: number;

        static INVALID_CONTROL_CHAR: number;

        static MISSING_NAME: number;

        static NOT_SUPPORTED_IN_CLASS: number;

        static TOO_MANY_FORWARD_REFERENCES: number;

        static NAME_TOO_LONG: number;

        static CHARACTER_VALUE_TOO_LARGE: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    enum SeekType {
        CUR = 0,
        SET = 1,
        END = 2,
    }


    class ShellError extends Error {
        static $gtype: GObject.GType<Error>;

        // Static fields
        static BAD_QUOTING: number;

        static EMPTY_STRING: number;

        static FAILED: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    enum SliceConfig {
        ALWAYS_MALLOC = 1,
        BYPASS_MAGAZINES = 2,
        WORKING_SET_MSECS = 3,
        COLOR_INCREMENT = 4,
        CHUNK_SIZES = 5,
        CONTENTION_COUNTER = 6,
    }


    class SpawnError extends Error {
        static $gtype: GObject.GType<Error>;

        // Static fields
        static FORK: number;

        static READ: number;

        static CHDIR: number;

        static ACCES: number;

        static PERM: number;

        static TOO_BIG: number;

        static "2BIG": number;

        static NOEXEC: number;

        static NAMETOOLONG: number;

        static NOENT: number;

        static NOMEM: number;

        static NOTDIR: number;

        static LOOP: number;

        static TXTBUSY: number;

        static IO: number;

        static NFILE: number;

        static MFILE: number;

        static INVAL: number;

        static ISDIR: number;

        static LIBBAD: number;

        static FAILED: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    enum TestFileType {
        DIST = 0,
        BUILT = 1,
    }


    enum TestLogType {
        NONE = 0,
        ERROR = 1,
        START_BINARY = 2,
        LIST_CASE = 3,
        SKIP_CASE = 4,
        START_CASE = 5,
        STOP_CASE = 6,
        MIN_RESULT = 7,
        MAX_RESULT = 8,
        MESSAGE = 9,
        START_SUITE = 10,
        STOP_SUITE = 11,
    }


    enum TestResult {
        SUCCESS = 0,
        SKIPPED = 1,
        FAILURE = 2,
        INCOMPLETE = 3,
    }


    class ThreadError extends Error {
        static $gtype: GObject.GType<Error>;

        // Static fields
        static THREAD_ERROR_AGAIN: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    enum TimeType {
        STANDARD = 0,
        DAYLIGHT = 1,
        UNIVERSAL = 2,
    }


    enum TokenType {
        EOF = 0,
        LEFT_PAREN = 40,
        RIGHT_PAREN = 41,
        LEFT_CURLY = 123,
        RIGHT_CURLY = 125,
        LEFT_BRACE = 91,
        RIGHT_BRACE = 93,
        EQUAL_SIGN = 61,
        COMMA = 44,
        NONE = 256,
        ERROR = 257,
        CHAR = 258,
        BINARY = 259,
        OCTAL = 260,
        INT = 261,
        HEX = 262,
        FLOAT = 263,
        STRING = 264,
        SYMBOL = 265,
        IDENTIFIER = 266,
        IDENTIFIER_NULL = 267,
        COMMENT_SINGLE = 268,
        COMMENT_MULTI = 269,
    }


    enum TraverseType {
        IN_ORDER = 0,
        PRE_ORDER = 1,
        POST_ORDER = 2,
        LEVEL_ORDER = 3,
    }


    export namespace UnicodeBreakType {
        export const $gtype: GObject.GType<UnicodeBreakType>;
    }

    enum UnicodeBreakType {
        MANDATORY = 0,
        CARRIAGE_RETURN = 1,
        LINE_FEED = 2,
        COMBINING_MARK = 3,
        SURROGATE = 4,
        ZERO_WIDTH_SPACE = 5,
        INSEPARABLE = 6,
        NON_BREAKING_GLUE = 7,
        CONTINGENT = 8,
        SPACE = 9,
        AFTER = 10,
        BEFORE = 11,
        BEFORE_AND_AFTER = 12,
        HYPHEN = 13,
        NON_STARTER = 14,
        OPEN_PUNCTUATION = 15,
        CLOSE_PUNCTUATION = 16,
        QUOTATION = 17,
        EXCLAMATION = 18,
        IDEOGRAPHIC = 19,
        NUMERIC = 20,
        INFIX_SEPARATOR = 21,
        SYMBOL = 22,
        ALPHABETIC = 23,
        PREFIX = 24,
        POSTFIX = 25,
        COMPLEX_CONTEXT = 26,
        AMBIGUOUS = 27,
        UNKNOWN = 28,
        NEXT_LINE = 29,
        WORD_JOINER = 30,
        HANGUL_L_JAMO = 31,
        HANGUL_V_JAMO = 32,
        HANGUL_T_JAMO = 33,
        HANGUL_LV_SYLLABLE = 34,
        HANGUL_LVT_SYLLABLE = 35,
        CLOSE_PARANTHESIS = 36,
        CLOSE_PARENTHESIS = 36,
        CONDITIONAL_JAPANESE_STARTER = 37,
        HEBREW_LETTER = 38,
        REGIONAL_INDICATOR = 39,
        EMOJI_BASE = 40,
        EMOJI_MODIFIER = 41,
        ZERO_WIDTH_JOINER = 42,
        AKSARA = 43,
        AKSARA_PRE_BASE = 44,
        AKSARA_START = 45,
        VIRAMA_FINAL = 46,
        VIRAMA = 47,
        UNAMBIGUOUS_HYPHEN = 48,
    }


    export namespace UnicodeScript {
        export const $gtype: GObject.GType<UnicodeScript>;
    }

    enum UnicodeScript {
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
        AVESTAN = 78,
        BAMUM = 79,
        EGYPTIAN_HIEROGLYPHS = 80,
        IMPERIAL_ARAMAIC = 81,
        INSCRIPTIONAL_PAHLAVI = 82,
        INSCRIPTIONAL_PARTHIAN = 83,
        JAVANESE = 84,
        KAITHI = 85,
        LISU = 86,
        MEETEI_MAYEK = 87,
        OLD_SOUTH_ARABIAN = 88,
        OLD_TURKIC = 89,
        SAMARITAN = 90,
        TAI_THAM = 91,
        TAI_VIET = 92,
        BATAK = 93,
        BRAHMI = 94,
        MANDAIC = 95,
        CHAKMA = 96,
        MEROITIC_CURSIVE = 97,
        MEROITIC_HIEROGLYPHS = 98,
        MIAO = 99,
        SHARADA = 100,
        SORA_SOMPENG = 101,
        TAKRI = 102,
        BASSA_VAH = 103,
        CAUCASIAN_ALBANIAN = 104,
        DUPLOYAN = 105,
        ELBASAN = 106,
        GRANTHA = 107,
        KHOJKI = 108,
        KHUDAWADI = 109,
        LINEAR_A = 110,
        MAHAJANI = 111,
        MANICHAEAN = 112,
        MENDE_KIKAKUI = 113,
        MODI = 114,
        MRO = 115,
        NABATAEAN = 116,
        OLD_NORTH_ARABIAN = 117,
        OLD_PERMIC = 118,
        PAHAWH_HMONG = 119,
        PALMYRENE = 120,
        PAU_CIN_HAU = 121,
        PSALTER_PAHLAVI = 122,
        SIDDHAM = 123,
        TIRHUTA = 124,
        WARANG_CITI = 125,
        AHOM = 126,
        ANATOLIAN_HIEROGLYPHS = 127,
        HATRAN = 128,
        MULTANI = 129,
        OLD_HUNGARIAN = 130,
        SIGNWRITING = 131,
        ADLAM = 132,
        BHAIKSUKI = 133,
        MARCHEN = 134,
        NEWA = 135,
        OSAGE = 136,
        TANGUT = 137,
        MASARAM_GONDI = 138,
        NUSHU = 139,
        SOYOMBO = 140,
        ZANABAZAR_SQUARE = 141,
        DOGRA = 142,
        GUNJALA_GONDI = 143,
        HANIFI_ROHINGYA = 144,
        MAKASAR = 145,
        MEDEFAIDRIN = 146,
        OLD_SOGDIAN = 147,
        SOGDIAN = 148,
        ELYMAIC = 149,
        NANDINAGARI = 150,
        NYIAKENG_PUACHUE_HMONG = 151,
        WANCHO = 152,
        CHORASMIAN = 153,
        DIVES_AKURU = 154,
        KHITAN_SMALL_SCRIPT = 155,
        YEZIDI = 156,
        CYPRO_MINOAN = 157,
        OLD_UYGHUR = 158,
        TANGSA = 159,
        TOTO = 160,
        VITHKUQI = 161,
        MATH = 162,
        KAWI = 163,
        NAG_MUNDARI = 164,
        TODHRI = 165,
        GARAY = 166,
        TULU_TIGALARI = 167,
        SUNUWAR = 168,
        GURUNG_KHEMA = 169,
        KIRAT_RAI = 170,
        OL_ONAL = 171,
        SIDETIC = 172,
        TOLONG_SIKI = 173,
        TAI_YO = 174,
        BERIA_ERFE = 175,
    }


    export namespace UnicodeType {
        export const $gtype: GObject.GType<UnicodeType>;
    }

    enum UnicodeType {
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


    class UriError extends Error {
        static $gtype: GObject.GType<Error>;

        // Static fields
        static FAILED: number;

        static BAD_SCHEME: number;

        static BAD_USER: number;

        static BAD_PASSWORD: number;

        static BAD_AUTH_PARAMS: number;

        static BAD_HOST: number;

        static BAD_PORT: number;

        static BAD_PATH: number;

        static BAD_QUERY: number;

        static BAD_FRAGMENT: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    enum UserDirectory {
        DIRECTORY_DESKTOP = 0,
        DIRECTORY_DOCUMENTS = 1,
        DIRECTORY_DOWNLOAD = 2,
        DIRECTORY_MUSIC = 3,
        DIRECTORY_PICTURES = 4,
        DIRECTORY_PUBLIC_SHARE = 5,
        DIRECTORY_TEMPLATES = 6,
        DIRECTORY_VIDEOS = 7,
        DIRECTORY_PROJECTS = 8,
        N_DIRECTORIES = 9,
    }


    enum VariantClass {
        BOOLEAN = 98,
        BYTE = 121,
        INT16 = 110,
        UINT16 = 113,
        INT32 = 105,
        UINT32 = 117,
        INT64 = 120,
        UINT64 = 116,
        HANDLE = 104,
        DOUBLE = 100,
        STRING = 115,
        OBJECT_PATH = 111,
        SIGNATURE = 103,
        VARIANT = 118,
        MAYBE = 109,
        ARRAY = 97,
        TUPLE = 40,
        DICT_ENTRY = 123,
    }


    class VariantParseError extends Error {
        static $gtype: GObject.GType<Error>;

        // Static fields
        static FAILED: number;

        static BASIC_TYPE_EXPECTED: number;

        static CANNOT_INFER_TYPE: number;

        static DEFINITE_TYPE_EXPECTED: number;

        static INPUT_NOT_AT_END: number;

        static INVALID_CHARACTER: number;

        static INVALID_FORMAT_STRING: number;

        static INVALID_OBJECT_PATH: number;

        static INVALID_SIGNATURE: number;

        static INVALID_TYPE_STRING: number;

        static NO_COMMON_TYPE: number;

        static NUMBER_OUT_OF_RANGE: number;

        static NUMBER_TOO_BIG: number;

        static TYPE_ERROR: number;

        static UNEXPECTED_TOKEN: number;

        static UNKNOWN_KEYWORD: number;

        static UNTERMINATED_STRING_CONSTANT: number;

        static VALUE_EXPECTED: number;

        static RECURSION: number;

        // Constructors
        constructor(options: { message: string; code: number });
    }


    const ALLOCATOR_LIST: number;

    const ALLOCATOR_NODE: number;

    const ALLOCATOR_SLIST: number;

    const ALLOC_AND_FREE: number;

    const ALLOC_ONLY: number;

    const ANALYZER_ANALYZING: number;

    const ASCII_DTOSTR_BUF_SIZE: number;

    const ATOMIC_REF_COUNT_INIT: number;

    const BIG_ENDIAN: number;

    const CSET_A_2_Z: string;

    const CSET_DIGITS: string;

    const CSET_a_2_z: string;

    const C_STD_VERSION: number;

    const DATALIST_FLAGS_MASK: number;

    const DATE_BAD_DAY: number;

    const DATE_BAD_JULIAN: number;

    const DATE_BAD_YEAR: number;

    const DIR_SEPARATOR: number;

    const DIR_SEPARATOR_S: string;

    const E: number;

    const GINT16_FORMAT: string;

    const GINT16_MODIFIER: string;

    const GINT32_FORMAT: string;

    const GINT32_MODIFIER: string;

    const GINT64_FORMAT: string;

    const GINT64_MODIFIER: string;

    const GINTPTR_FORMAT: string;

    const GINTPTR_MODIFIER: string;

    const GNUC_FUNCTION: string;

    const GNUC_PRETTY_FUNCTION: string;

    const GSIZE_FORMAT: string;

    const GSIZE_MODIFIER: string;

    const GSSIZE_FORMAT: string;

    const GSSIZE_MODIFIER: string;

    const GUINT16_FORMAT: string;

    const GUINT32_FORMAT: string;

    const GUINT64_FORMAT: string;

    const GUINTPTR_FORMAT: string;

    const HAVE_GINT64: number;

    const HAVE_GNUC_VARARGS: number;

    const HAVE_GNUC_VISIBILITY: number;

    const HAVE_GROWING_STACK: number;

    const HAVE_ISO_VARARGS: number;

    const HOOK_FLAG_USER_SHIFT: number;

    const IEEE754_DOUBLE_BIAS: number;

    const IEEE754_FLOAT_BIAS: number;

    const KEY_FILE_DESKTOP_GROUP: string;

    const KEY_FILE_DESKTOP_KEY_ACTIONS: string;

    const KEY_FILE_DESKTOP_KEY_CATEGORIES: string;

    const KEY_FILE_DESKTOP_KEY_COMMENT: string;

    const KEY_FILE_DESKTOP_KEY_DBUS_ACTIVATABLE: string;

    const KEY_FILE_DESKTOP_KEY_EXEC: string;

    const KEY_FILE_DESKTOP_KEY_GENERIC_NAME: string;

    const KEY_FILE_DESKTOP_KEY_HIDDEN: string;

    const KEY_FILE_DESKTOP_KEY_ICON: string;

    const KEY_FILE_DESKTOP_KEY_MIME_TYPE: string;

    const KEY_FILE_DESKTOP_KEY_NAME: string;

    const KEY_FILE_DESKTOP_KEY_NOT_SHOW_IN: string;

    const KEY_FILE_DESKTOP_KEY_NO_DISPLAY: string;

    const KEY_FILE_DESKTOP_KEY_ONLY_SHOW_IN: string;

    const KEY_FILE_DESKTOP_KEY_PATH: string;

    const KEY_FILE_DESKTOP_KEY_STARTUP_NOTIFY: string;

    const KEY_FILE_DESKTOP_KEY_STARTUP_WM_CLASS: string;

    const KEY_FILE_DESKTOP_KEY_TERMINAL: string;

    const KEY_FILE_DESKTOP_KEY_TRY_EXEC: string;

    const KEY_FILE_DESKTOP_KEY_TYPE: string;

    const KEY_FILE_DESKTOP_KEY_URL: string;

    const KEY_FILE_DESKTOP_KEY_VERSION: string;

    const KEY_FILE_DESKTOP_TYPE_APPLICATION: string;

    const KEY_FILE_DESKTOP_TYPE_DIRECTORY: string;

    const KEY_FILE_DESKTOP_TYPE_LINK: string;

    const LITTLE_ENDIAN: number;

    const LN10: number;

    const LN2: number;

    const LOG_2_BASE_10: number;

    const LOG_DOMAIN: number;

    const LOG_FATAL_MASK: number;

    const LOG_LEVEL_USER_SHIFT: number;

    const MAJOR_VERSION: number;

    const MAXINT16: number;

    const MAXINT32: number;

    const MAXINT64: number;

    const MAXINT8: number;

    const MAXUINT16: number;

    const MAXUINT32: number;

    const MAXUINT64: number;

    const MAXUINT8: number;

    const MICRO_VERSION: number;

    const MININT16: number;

    const MININT32: number;

    const MININT64: number;

    const MININT8: number;

    const MINOR_VERSION: number;

    const MODULE_SUFFIX: string;

    const NSEC_PER_SEC: number;

    const OPTION_REMAINING: string;

    const PDP_ENDIAN: number;

    const PI: number;

    const PID_FORMAT: string;

    const PI_2: number;

    const PI_4: number;

    const POLLFD_FORMAT: string;

    const PRIORITY_DEFAULT: number;

    const PRIORITY_DEFAULT_IDLE: number;

    const PRIORITY_HIGH: number;

    const PRIORITY_HIGH_IDLE: number;

    const PRIORITY_LOW: number;

    const REF_COUNT_INIT: number;

    const SEARCHPATH_SEPARATOR: number;

    const SEARCHPATH_SEPARATOR_S: string;

    const SIZEOF_LONG: number;

    const SIZEOF_SIZE_T: number;

    const SIZEOF_SSIZE_T: number;

    const SIZEOF_VOID_P: number;

    const SOURCE_CONTINUE: boolean;

    const SOURCE_REMOVE: boolean;

    const SQRT2: number;

    const STR_DELIMITERS: string;

    const SYSDEF_AF_INET: number;

    const SYSDEF_AF_INET6: number;

    const SYSDEF_AF_UNIX: number;

    const SYSDEF_MSG_DONTROUTE: number;

    const SYSDEF_MSG_OOB: number;

    const SYSDEF_MSG_PEEK: number;

    const TEST_OPTION_ISOLATE_DIRS: string;

    const TEST_OPTION_NONFATAL_ASSERTIONS: string;

    const TEST_OPTION_NO_PRGNAME: string;

    const TIME_SPAN_DAY: number;

    const TIME_SPAN_HOUR: number;

    const TIME_SPAN_MILLISECOND: number;

    const TIME_SPAN_MINUTE: number;

    const TIME_SPAN_SECOND: number;

    const UNICHAR_MAX_DECOMPOSITION_LENGTH: number;

    const URI_RESERVED_CHARS_GENERIC_DELIMITERS: string;

    const URI_RESERVED_CHARS_SUBCOMPONENT_DELIMITERS: string;

    const USEC_PER_SEC: number;

    const VA_COPY_AS_ARRAY: number;

    const VERSION_MIN_REQUIRED: number;

    const WIN32_MSG_HANDLE: number;

    const macro__has_attribute___noreturn__: number;

    const macro__has_attribute_ifunc: number;

    const macro__has_attribute_no_sanitize_address: number;

    function access(filename: string, mode: number): number;

    function aligned_alloc(n_blocks: bigint | number, n_block_bytes: bigint | number, alignment: bigint | number): null;

    function aligned_alloc0(n_blocks: bigint | number, n_block_bytes: bigint | number, alignment: bigint | number): null;

    function aligned_free(mem: null): void;

    function aligned_free_sized(mem: null, alignment: bigint | number, size: bigint | number): void;

    function ascii_digit_value(c: number): number;

    function ascii_dtostr(buffer: string, buf_len: number, d: number): string;

    function ascii_formatd(buffer: string, buf_len: number, format: string, d: number): string;

    function ascii_strcasecmp(s1: string, s2: string): number;

    function ascii_strdown(str: string, len: bigint | number): string;

    function ascii_string_to_signed(str: string, base: number, min: bigint | number, max: bigint | number): [boolean, number];

    function ascii_string_to_unsigned(str: string, base: number, min: bigint | number, max: bigint | number): [boolean, number];

    function ascii_strncasecmp(s1: string, s2: string, n: bigint | number): number;

    function ascii_strtod(nptr: string): [number, string];

    function ascii_strtoll(nptr: string, base: number): [number, string];

    function ascii_strtoull(nptr: string, base: number): [number, string];

    function ascii_strup(str: string, len: bigint | number): string;

    function ascii_tolower(c: number): number;

    function ascii_toupper(c: number): number;

    function ascii_xdigit_value(c: number): number;

    function assert_warning(log_domain: string, file: string, line: number, pretty_function: string, expression: string): void;

    function assertion_message(domain: string, file: string, line: number, func: string, message: string): void;

    function assertion_message_cmpint(domain: string, file: string, line: number, func: string, expr: string, arg1: bigint | number, cmp: string, arg2: bigint | number, numtype: number): void;

    function assertion_message_cmpstr(domain: string, file: string, line: number, func: string, expr: string, arg1: string, cmp: string, arg2: string): void;

    function assertion_message_cmpstrv(domain: string, file: string, line: number, func: string, expr: string, arg1: string, arg2: string, first_wrong_idx: bigint | number): void;

    function assertion_message_error(domain: string, file: string, line: number, func: string, expr: string, error: Error, error_domain: Quark, error_code: number): void;

    function async_queue_new(): AsyncQueue;

    function async_queue_new_full(): AsyncQueue;

    function atexit(func: VoidFunc): void;

    function atomic_int_add(atomic: null, val: number): number;

    function atomic_int_and(atomic: null, val: number): number;

    function atomic_int_compare_and_exchange(atomic: null, oldval: number, newval: number): boolean;

    function atomic_int_compare_and_exchange_full(atomic: null, oldval: number, newval: number): [boolean, number];

    function atomic_int_dec_and_test(atomic: null): boolean;

    function atomic_int_exchange(atomic: null, newval: number): number;

    function atomic_int_exchange_and_add(atomic: null, val: number): number;

    function atomic_int_get(atomic: null): number;

    function atomic_int_inc(atomic: null): void;

    function atomic_int_or(atomic: null, val: number): number;

    function atomic_int_set(atomic: null, newval: number): void;

    function atomic_int_xor(atomic: null, val: number): number;

    function atomic_pointer_add(atomic: never, val: bigint | number): never;

    function atomic_pointer_and(atomic: never, val: bigint | number): number;

    function atomic_pointer_compare_and_exchange(atomic: never, oldval: null, newval: null): boolean;

    function atomic_pointer_compare_and_exchange_full(atomic: never, oldval: null, newval: null): [boolean, null];

    function atomic_pointer_exchange(atomic: null, newval: null): null;

    function atomic_pointer_get(atomic: never): null;

    function atomic_pointer_or(atomic: never, val: bigint | number): number;

    function atomic_pointer_set(atomic: never, newval: null): void;

    function atomic_pointer_xor(atomic: never, val: bigint | number): number;

    function atomic_rc_box_acquire(mem_block: never): null;

    function atomic_rc_box_alloc(block_size: bigint | number): null;

    function atomic_rc_box_alloc0(block_size: bigint | number): null;

    function atomic_rc_box_dup(block_size: bigint | number, mem_block: never): null;

    function atomic_rc_box_get_size(mem_block: never): number;

    function atomic_rc_box_release(mem_block: never): void;

    function atomic_rc_box_release_full(mem_block: never): void;

    function atomic_ref_count_compare(arc: number, val: number): boolean;

    function atomic_ref_count_dec(arc: number): boolean;

    function atomic_ref_count_inc(arc: number): void;

    function atomic_ref_count_init(): number;

    function base64_decode(text: string): Uint8Array;

    function base64_decode_inplace(text: Uint8Array | string): [number, Uint8Array];

    function base64_encode(data: Uint8Array | string | null): string;

    function base64_encode_close(break_lines: boolean, state: number, save: number): [number, Uint8Array, number, number];

    function base64_encode_step(_in: Uint8Array | string, break_lines: boolean, state: number, save: number): [number, Uint8Array, number, number];

    function basename(file_name: string): string;

    function bit_lock(address: null, lock_bit: number): void;

    function bit_lock_and_get(address: null, lock_bit: number): number;

    function bit_nth_lsf(mask: bigint | number, nth_bit: number): number;

    function bit_nth_msf(mask: bigint | number, nth_bit: number): number;

    function bit_storage(number: bigint | number): number;

    function bit_trylock(address: null, lock_bit: number): boolean;

    function bit_unlock(address: null, lock_bit: number): void;

    function bit_unlock_and_set(address: null, lock_bit: number, new_val: number, preserve_mask: number): void;

    function blow_chunks(): void;

    function bookmark_file_error_quark(): Quark;

    function build_filenamev(args: string[]): string;

    function build_pathv(separator: string, args: string[]): string;

    function byte_array_append(array: Uint8Array | string, data: Uint8Array | string): Uint8Array;

    function byte_array_free(array: Uint8Array | string, free_segment: boolean): Uint8Array | null;

    function byte_array_free_to_bytes(array: Uint8Array | string): Bytes;

    function byte_array_new(): Uint8Array;

    function byte_array_new_take(data: Uint8Array | string): Uint8Array;

    function byte_array_prepend(array: Uint8Array | string, data: Uint8Array | string): Uint8Array;

    function byte_array_ref(array: Uint8Array | string): Uint8Array;

    function byte_array_remove_index(array: Uint8Array | string, index_: number): Uint8Array;

    function byte_array_remove_index_fast(array: Uint8Array | string, index_: number): Uint8Array;

    function byte_array_remove_range(array: Uint8Array | string, index_: number, length: number): Uint8Array;

    function byte_array_set_size(array: Uint8Array | string, length: number): Uint8Array;

    function byte_array_sized_new(reserved_size: number): Uint8Array;

    function byte_array_sort(array: Uint8Array | string, compare_func: CompareFunc): void;

    function byte_array_sort_with_data(array: Uint8Array | string, compare_func: CompareDataFunc): void;

    function byte_array_steal(array: Uint8Array | string): Uint8Array;

    function byte_array_unref(array: Uint8Array | string): void;

    function canonicalize_filename(filename: string, relative_to: string | null): string;

    function chdir(path: string): number;

    function check_version(required_major: number, required_minor: number, required_micro: number): string | null;

    function checksum_type_get_length(checksum_type: ChecksumType): number;

    function child_watch_add(priority: number, pid: Pid, _function: ChildWatchFunc): number;

    function child_watch_source_new(pid: Pid): Source;

    function chmod(filename: string, mode: number): number;

    function clear_error(): void;

    function close(fd: number): boolean;

    function compute_checksum_for_bytes(checksum_type: ChecksumType, data: Bytes | Uint8Array): string | null;

    function compute_checksum_for_data(checksum_type: ChecksumType, data: Uint8Array | string): string | null;

    function compute_checksum_for_string(checksum_type: ChecksumType, str: string, length: bigint | number): string | null;

    function compute_hmac_for_bytes(digest_type: ChecksumType, key: Bytes | Uint8Array, data: Bytes | Uint8Array): string;

    function compute_hmac_for_data(digest_type: ChecksumType, key: Uint8Array | string, data: Uint8Array | string): string;

    function compute_hmac_for_string(digest_type: ChecksumType, key: Uint8Array | string, str: string, length: bigint | number): string;

    function convert(str: Uint8Array | string, to_codeset: string, from_codeset: string): [Uint8Array, number];

    function convert_error_quark(): Quark;

    function convert_with_fallback(str: Uint8Array | string, to_codeset: string, from_codeset: string, fallback: string): [Uint8Array, number];

    function creat(filename: string, mode: number): number;

    function datalist_foreach(datalist: Data, func: DataForeachFunc): void;

    function datalist_get_data(datalist: Data, key: string): null;

    function datalist_get_flags(datalist: Data): number;

    function datalist_id_get_data(datalist: Data, key_id: Quark): null;

    function datalist_id_remove_multiple(datalist: Data, keys: Quark[]): void;

    function datalist_set_flags(datalist: Data, flags: number): void;

    function datalist_unset_flags(datalist: Data, flags: number): void;

    function dataset_destroy(dataset_location: never): void;

    function dataset_foreach(dataset_location: never, func: DataForeachFunc): void;

    function dataset_id_get_data(dataset_location: never, key_id: Quark): null;

    function date_get_days_in_month(month: DateMonth, year: DateYear): number;

    function date_get_monday_weeks_in_year(year: DateYear): number;

    function date_get_sunday_weeks_in_year(year: DateYear): number;

    function date_get_weeks_in_year(year: DateYear, first_day_of_week: DateWeekday): number;

    function date_is_leap_year(year: DateYear): boolean;

    function date_strftime(s: string, slen: bigint | number, format: string, date: Date): number;

    function date_valid_day(day: DateDay): boolean;

    function date_valid_dmy(day: DateDay, month: DateMonth, year: DateYear): boolean;

    function date_valid_julian(julian_date: number): boolean;

    function date_valid_month(month: DateMonth): boolean;

    function date_valid_weekday(weekday: DateWeekday): boolean;

    function date_valid_year(year: DateYear): boolean;

    function dcgettext(domain: string | null, msgid: string, category: number): string;

    function dgettext(domain: string | null, msgid: string): string;

    function dir_make_tmp(tmpl: string | null): string;

    function direct_equal(v1: null, v2: null): boolean;

    function direct_hash(v: null): number;

    function dngettext(domain: string | null, msgid: string, msgid_plural: string, n: bigint | number): string;

    function double_equal(v1: never, v2: never): boolean;

    function double_hash(v: never): number;

    function dpgettext(domain: string | null, msgctxtid: string, msgidoffset: bigint | number): string;

    function dpgettext2(domain: string | null, context: string, msgid: string): string;

    function environ_getenv(envp: string[] | null, variable: string): string | null;

    function environ_setenv(envp: string[] | null, variable: string, value: string, overwrite: boolean): string[];

    function environ_unsetenv(envp: string[] | null, variable: string): string[];

    function error_domain_register(error_type_name: string, error_type_private_size: bigint | number, error_type_init: ErrorInitFunc, error_type_copy: ErrorCopyFunc, error_type_clear: ErrorClearFunc): Quark;

    function error_domain_register_static(error_type_name: string, error_type_private_size: bigint | number, error_type_init: ErrorInitFunc, error_type_copy: ErrorCopyFunc, error_type_clear: ErrorClearFunc): Quark;

    function file_error_from_errno(err_no: number): FileError;

    function file_error_quark(): Quark;

    function file_get_contents(filename: string): [boolean, Uint8Array];

    function file_open_tmp(tmpl: string | null): [number, string];

    function file_read_link(filename: string): string;

    function file_set_contents(filename: string, contents: Uint8Array | string): boolean;

    function file_set_contents_full(filename: string, contents: Uint8Array | string, flags: FileSetContentsFlags, mode: number): boolean;

    function file_test(filename: string, test: FileTest): boolean;

    function filename_display_basename(filename: string): string;

    function filename_display_name(filename: string): string;

    function filename_from_uri(uri: string): [string, string];

    function filename_from_utf8(utf8string: string, len: bigint | number): [string, number, number];

    function filename_to_uri(filename: string, hostname: string | null): string;

    function filename_to_utf8(opsysstring: string, len: bigint | number): [string, number, number];

    function find_program_in_path(program: string): string | null;

    function fopen(filename: string, mode: string): null;

    function format_size(size: bigint | number): string;

    function format_size_for_display(size: bigint | number): string;

    function format_size_full(size: bigint | number, flags: FormatSizeFlags): string;

    function free(mem: null): void;

    function free_sized(mem: null, size: bigint | number): void;

    function freopen(filename: string, mode: string, stream: null): null;

    function fsync(fd: number): number;

    function get_application_name(): string | null;

    function get_charset(): [boolean, string];

    function get_codeset(): string;

    function get_console_charset(): [boolean, string];

    function get_current_dir(): string;

    function get_current_time(result: TimeVal): void;

    function get_environ(): string[];

    function get_filename_charsets(): [boolean, string[]];

    function get_home_dir(): string;

    function get_host_name(): string;

    function get_language_names(): string[];

    function get_language_names_with_category(category_name: string): string[];

    function get_locale_variants(locale: string): string[];

    function get_monotonic_time(): number;

    function get_monotonic_time_ns(): number;

    function get_num_processors(): number;

    function get_os_info(key_name: string): string | null;

    function get_prgname(): string | null;

    function get_real_name(): string;

    function get_real_time(): number;

    function get_system_config_dirs(): string[];

    function get_system_data_dirs(): string[];

    function get_tmp_dir(): string;

    function get_user_cache_dir(): string;

    function get_user_config_dir(): string;

    function get_user_data_dir(): string;

    function get_user_name(): string;

    function get_user_runtime_dir(): string;

    function get_user_special_dir(directory: UserDirectory): string | null;

    function get_user_state_dir(): string;

    function getenv(variable: string): string | null;

    function hash_table_add(hash_table: never, key: null): boolean;

    function hash_table_contains(hash_table: never, key: null): boolean;

    function hash_table_destroy(hash_table: never): void;

    function hash_table_find(hash_table: never, predicate: HRFunc): null;

    function hash_table_foreach(hash_table: never, func: HFunc): void;

    function hash_table_foreach_remove(hash_table: never, func: HRFunc): number;

    function hash_table_foreach_steal(hash_table: never, func: HRFunc): number;

    function hash_table_insert(hash_table: never, key: null, value: null): boolean;

    function hash_table_lookup(hash_table: never, key: null): null;

    function hash_table_lookup_extended(hash_table: never, lookup_key: null): [boolean, null, null];

    function hash_table_new_similar(other_hash_table: never): never;

    function hash_table_ref(hash_table: never): never;

    function hash_table_remove(hash_table: never, key: null): boolean;

    function hash_table_remove_all(hash_table: never): void;

    function hash_table_replace(hash_table: never, key: null, value: null): boolean;

    function hash_table_size(hash_table: never): number;

    function hash_table_steal(hash_table: never, key: null): boolean;

    function hash_table_steal_all(hash_table: never): void;

    function hash_table_steal_extended(hash_table: never, lookup_key: null): [boolean, null, null];

    function hash_table_unref(hash_table: never): void;

    function hook_destroy(hook_list: HookList, hook_id: bigint | number): boolean;

    function hook_destroy_link(hook_list: HookList, hook: Hook): void;

    function hook_free(hook_list: HookList, hook: Hook): void;

    function hook_insert_before(hook_list: HookList, sibling: Hook | null, hook: Hook): void;

    function hook_insert_sorted(hook_list: HookList, hook: Hook, func: HookCompareFunc): void;

    function hook_prepend(hook_list: HookList, hook: Hook): void;

    function hook_unref(hook_list: HookList, hook: Hook): void;

    function hostname_is_ascii_encoded(hostname: string): boolean;

    function hostname_is_ip_address(hostname: string): boolean;

    function hostname_is_non_ascii(hostname: string): boolean;

    function hostname_to_ascii(hostname: string): string | null;

    function hostname_to_unicode(hostname: string): string | null;

    function idle_add(priority: number, _function: SourceFunc): number;

    function idle_remove_by_data(data: null): boolean;

    function idle_source_new(): Source;

    function int64_equal(v1: never, v2: never): boolean;

    function int64_hash(v: never): number;

    function int_equal(v1: never, v2: never): boolean;

    function int_hash(v: never): number;

    function intern_static_string(string: string | null): string;

    function intern_string(string: string | null): string;

    function io_add_watch(channel: IOChannel, priority: number, condition: IOCondition, func: IOFunc): number;

    function io_channel_error_from_errno(en: number): IOChannelError;

    function io_channel_error_quark(): Quark;

    function io_create_watch(channel: IOChannel, condition: IOCondition): Source;

    function key_file_error_quark(): Quark;

    function list_pop_allocator(): void;

    function list_push_allocator(allocator: Allocator): void;

    function listenv(): string[];

    function locale_from_utf8(utf8string: string, len: bigint | number): [Uint8Array, number];

    function locale_to_utf8(opsysstring: Uint8Array | string): [string, number, number];

    function log_default_handler(log_domain: string | null, log_level: LogLevelFlags, message: string | null, unused_data: null): void;

    function log_get_always_fatal(): LogLevelFlags;

    function log_get_debug_enabled(): boolean;

    function log_remove_handler(log_domain: string, handler_id: number): void;

    function log_set_always_fatal(fatal_mask: LogLevelFlags): LogLevelFlags;

    function log_set_debug_enabled(enabled: boolean): void;

    function log_set_fatal_mask(log_domain: string, fatal_mask: LogLevelFlags): LogLevelFlags;

    function log_set_handler(log_domain: string | null, log_levels: LogLevelFlags, log_func: LogFunc): number;

    function log_set_writer_func(func: LogWriterFunc): void;

    function log_structured_array(log_level: LogLevelFlags, fields: LogField[]): void;

    function log_variant(log_domain: string | null, log_level: LogLevelFlags, fields: Variant): void;

    function log_writer_default(log_level: LogLevelFlags, fields: LogField[], user_data: null): LogWriterOutput;

    function log_writer_default_set_debug_domains(domains: string | null): void;

    function log_writer_default_set_use_stderr(use_stderr: boolean): void;

    function log_writer_default_would_drop(log_level: LogLevelFlags, log_domain: string | null): boolean;

    function log_writer_format_fields(log_level: LogLevelFlags, fields: LogField[], use_color: boolean): string;

    function log_writer_is_journald(output_fd: number): boolean;

    function log_writer_journald(log_level: LogLevelFlags, fields: LogField[], user_data: null): LogWriterOutput;

    function log_writer_standard_streams(log_level: LogLevelFlags, fields: LogField[], user_data: null): LogWriterOutput;

    function log_writer_supports_color(output_fd: number): boolean;

    function log_writer_syslog(log_level: LogLevelFlags, fields: LogField[], user_data: null): LogWriterOutput;

    function lstat(filename: string, buf: StatBuf): number;

    function main_context_default(): MainContext;

    function main_context_get_thread_default(): MainContext | null;

    function main_context_ref_thread_default(): MainContext;

    function main_current_source(): Source | null;

    function main_depth(): number;

    function malloc(n_bytes: bigint | number): null;

    function malloc0(n_bytes: bigint | number): null;

    function malloc0_n(n_blocks: bigint | number, n_block_bytes: bigint | number): null;

    function malloc_n(n_blocks: bigint | number, n_block_bytes: bigint | number): null;

    function markup_error_quark(): Quark;

    function markup_escape_text(text: string, length: bigint | number): string;

    function mem_chunk_info(): void;

    function mem_is_system_malloc(): boolean;

    function mem_profile(): void;

    function mem_set_vtable(vtable: MemVTable): void;

    function memdup(mem: null, byte_size: number): null;

    function memdup2(mem: null, byte_size: bigint | number): null;

    function mkdir(filename: string, mode: number): number;

    function mkdir_with_parents(pathname: string, mode: number): number;

    function node_pop_allocator(): void;

    function node_push_allocator(allocator: Allocator): void;

    function nullify_pointer(nullify_location: never): void;

    function number_parser_error_quark(): Quark;

    function on_error_query(prg_name: string): void;

    function on_error_stack_trace(prg_name: string | null): void;

    function once_init_enter(location: never): [boolean, null];

    function once_init_enter_impl(location: bigint | number): boolean;

    function once_init_enter_pointer(location: never): boolean;

    function once_init_leave(location: never, result: bigint | number): null;

    function once_init_leave_pointer(location: never, result: null): void;

    function open(filename: string, flags: number, mode: number): number;

    function option_error_quark(): Quark;

    function parse_debug_string(string: string | null, keys: DebugKey[]): number;

    function path_buf_equal(v1: never, v2: never): boolean;

    function path_get_basename(file_name: string): string;

    function path_get_dirname(file_name: string): string;

    function path_is_absolute(file_name: string): boolean;

    function path_skip_root(file_name: string): string | null;

    function pattern_match_simple(pattern: string, string: string): boolean;

    function pointer_bit_lock(address: never, lock_bit: number): void;

    function pointer_bit_lock_and_get(address: never, lock_bit: number): number;

    function pointer_bit_lock_mask_ptr(ptr: null, lock_bit: number, set: boolean, preserve_mask: bigint | number, preserve_ptr: null): null;

    function pointer_bit_trylock(address: never, lock_bit: number): boolean;

    function pointer_bit_unlock(address: never, lock_bit: number): void;

    function pointer_bit_unlock_and_set(address: never, lock_bit: number, ptr: null, preserve_mask: bigint | number): void;

    function poll(fds: PollFD, nfds: number, timeout: number): number;

    function prefix_error_literal(err: Error | null, prefix: string): Error | null;

    function propagate_error(src: Error): Error | null;

    function qsort_with_data(pbase: never, total_elems: number, size: bigint | number, compare_func: CompareDataFunc): void;

    function quark_from_static_string(string: string | null): Quark;

    function quark_from_string(string: string | null): Quark;

    function quark_to_string(quark: Quark): string;

    function quark_try_string(string: string | null): Quark;

    function random_double(): number;

    function random_double_range(begin: number, end: number): number;

    function random_int(): number;

    function random_int_range(begin: number, end: number): number;

    function random_set_seed(seed: number): void;

    function rc_box_acquire(mem_block: never): null;

    function rc_box_alloc(block_size: bigint | number): null;

    function rc_box_alloc0(block_size: bigint | number): null;

    function rc_box_dup(block_size: bigint | number, mem_block: never): null;

    function rc_box_get_size(mem_block: never): number;

    function rc_box_release(mem_block: never): void;

    function rc_box_release_full(mem_block: never): void;

    function realloc(mem: null, n_bytes: bigint | number): null;

    function realloc_n(mem: null, n_blocks: bigint | number, n_block_bytes: bigint | number): null;

    function ref_count_compare(rc: number, val: number): boolean;

    function ref_count_dec(rc: number): [boolean, number];

    function ref_count_inc(rc: number): number;

    function ref_count_init(): number;

    function ref_string_acquire(str: string): string;

    function ref_string_equal(str1: string, str2: string): boolean;

    function ref_string_length(str: string): number;

    function ref_string_new(str: string): string;

    function ref_string_new_intern(str: string): string;

    function ref_string_new_len(str: string, len: bigint | number): string;

    function ref_string_release(str: string): void;

    function regex_check_replacement(replacement: string): [boolean, boolean];

    function regex_error_quark(): Quark;

    function regex_escape_nul(string: string, length: number): string;

    function regex_escape_string(string: string, length: number): string;

    function regex_match_simple(pattern: string, string: string, compile_options: RegexCompileFlags, match_options: RegexMatchFlags): boolean;

    function regex_split_simple(pattern: string, string: string, compile_options: RegexCompileFlags, match_options: RegexMatchFlags): string[];

    function reload_user_special_dirs_cache(): void;

    function remove(filename: string): number;

    function rename(oldfilename: string, newfilename: string): number;

    function rmdir(filename: string): number;

    function sequence_foreach_range(begin: SequenceIter, end: SequenceIter, func: Func): void;

    function sequence_get(iter: SequenceIter): null;

    function sequence_insert_before(iter: SequenceIter, data: null): SequenceIter;

    function sequence_move(src: SequenceIter, dest: SequenceIter): void;

    function sequence_move_range(dest: SequenceIter, begin: SequenceIter, end: SequenceIter): void;

    function sequence_range_get_midpoint(begin: SequenceIter, end: SequenceIter): SequenceIter;

    function sequence_remove(iter: SequenceIter): void;

    function sequence_remove_range(begin: SequenceIter, end: SequenceIter): void;

    function sequence_set(iter: SequenceIter, data: null): void;

    function sequence_sort_changed(iter: SequenceIter, cmp_func: CompareDataFunc): void;

    function sequence_sort_changed_iter(iter: SequenceIter, iter_cmp: SequenceIterCompareFunc): void;

    function sequence_swap(a: SequenceIter, b: SequenceIter): void;

    function set_application_name(application_name: string): void;

    function set_error_literal(domain: Quark, code: number, message: string): Error | null;

    function set_prgname(prgname: string): void;

    function set_prgname_once(prgname: string): boolean;

    function setenv(variable: string, value: string, overwrite: boolean): boolean;

    function shell_error_quark(): Quark;

    function shell_parse_argv(command_line: string): [boolean, string[] | null];

    function shell_quote(unquoted_string: string): string;

    function shell_unquote(quoted_string: string): string;

    function slice_alloc(block_size: bigint | number): null;

    function slice_alloc0(block_size: bigint | number): null;

    function slice_copy(block_size: bigint | number, mem_block: null): null;

    function slice_free1(block_size: bigint | number, mem_block: null): void;

    function slice_free_chain_with_offset(block_size: bigint | number, mem_chain: null, next_offset: bigint | number): void;

    function slice_get_config(ckey: SliceConfig): number;

    function slice_get_config_state(ckey: SliceConfig, address: bigint | number, n_values: number): number;

    function slice_set_config(ckey: SliceConfig, value: bigint | number): void;

    function slist_pop_allocator(): void;

    function slist_push_allocator(allocator: Allocator): void;

    function source_remove(tag: number): boolean;

    function source_remove_by_funcs_user_data(funcs: SourceFuncs, user_data: null): boolean;

    function source_remove_by_user_data(user_data: null): boolean;

    function source_set_name_by_id(tag: number, name: string): void;

    function spaced_primes_closest(num: number): number;

    function spawn_async(working_directory: string | null, argv: string[], envp: string[] | null, flags: SpawnFlags, child_setup: SpawnChildSetupFunc | null): [boolean, Pid | null];

    function spawn_async_with_fds(working_directory: string | null, argv: string[], envp: string[] | null, flags: SpawnFlags, child_setup: SpawnChildSetupFunc | null, stdin_fd: number, stdout_fd: number, stderr_fd: number): [boolean, Pid | null];

    function spawn_async_with_pipes(working_directory: string | null, argv: string[], envp: string[] | null, flags: SpawnFlags, child_setup: SpawnChildSetupFunc | null): [boolean, Pid | null, number, number, number];

    function spawn_async_with_pipes_and_fds(working_directory: string | null, argv: string[], envp: string[] | null, flags: SpawnFlags, child_setup: SpawnChildSetupFunc | null, stdin_fd: number, stdout_fd: number, stderr_fd: number, source_fds: number[] | null, target_fds: number[] | null): [boolean, Pid | null, number, number, number];

    function spawn_check_exit_status(wait_status: number): boolean;

    function spawn_check_wait_status(wait_status: number): boolean;

    function spawn_close_pid(pid: Pid): void;

    function spawn_command_line_async(command_line: string): boolean;

    function spawn_command_line_sync(command_line: string): [boolean, Uint8Array | null, Uint8Array | null, number];

    function spawn_error_quark(): Quark;

    function spawn_exit_error_quark(): Quark;

    function spawn_sync(working_directory: string | null, argv: string[], envp: string[] | null, flags: SpawnFlags, child_setup: SpawnChildSetupFunc | null): [boolean, Uint8Array | null, Uint8Array | null, number];

    function stat(filename: string, buf: StatBuf): number;

    function stpcpy(dest: string, src: string): string;

    function str_equal(v1: never, v2: never): boolean;

    function str_has_prefix(str: string, prefix: string): boolean;

    function str_has_suffix(str: string, suffix: string): boolean;

    function str_hash(v: never): number;

    function str_is_ascii(str: string): boolean;

    function str_match_string(search_term: string, potential_hit: string, accept_alternates: boolean): boolean;

    function str_to_ascii(str: string, from_locale: string | null): string;

    function str_tokenize_and_fold(string: string, translit_locale: string | null): [string[], string[] | null];

    function strcanon(string: string, valid_chars: string, substitutor: number): string;

    function strcasecmp(s1: string, s2: string): number;

    function strchomp(string: string): string;

    function strchug(string: string): string;

    function strcmp0(str1: string | null, str2: string | null): number;

    function strcompress(source: string): string;

    function strdelimit(string: string, delimiters: string | null, new_delimiter: number): string;

    function strdown(string: string): string;

    function strdup(str: string | null): string;

    function strdupv(str_array: string[] | null): string[] | null;

    function strerror(errnum: number): string;

    function strescape(source: string, exceptions: string | null): string;

    function strfreev(str_array: string[] | null): void;

    function strip_context(msgid: string, msgval: string): string;

    function strjoinv(separator: string | null, str_array: string[]): string;

    function strlcat(dest: string, src: string, dest_size: bigint | number): number;

    function strlcpy(dest: string, src: string, dest_size: bigint | number): number;

    function strncasecmp(s1: string, s2: string, n: number): number;

    function strndup(str: string | null, n: bigint | number): string | null;

    function strnfill(length: bigint | number, fill_char: number): string;

    function strreverse(string: string): string;

    function strrstr(haystack: string, needle: string): string | null;

    function strrstr_len(haystack: string, haystack_len: bigint | number, needle: string): string | null;

    function strsignal(signum: number): string;

    function strsplit(string: string, delimiter: string, max_tokens: number): string[];

    function strsplit_set(string: string, delimiters: Uint8Array | string, max_tokens: number): string[];

    function strstr_len(haystack: string, haystack_len: bigint | number, needle: string): string | null;

    function strtod(nptr: string): [number, string];

    function strup(string: string): string;

    function strv_contains(strv: string[], str: string): boolean;

    function strv_equal(strv1: string[], strv2: string[]): boolean;

    function strv_get_type(): GObject.GType;

    function strv_length(str_array: string[]): number;

    function test_add_data_func(testpath: string, test_data: null, test_func: TestDataFunc): void;

    function test_add_data_func_full(testpath: string, test_data: null, test_func: TestDataFunc): void;

    function test_add_func(testpath: string, test_func: TestFunc): void;

    function test_assert_expected_messages_internal(domain: string, file: string, line: number, func: string): void;

    function test_bug(bug_uri_snippet: string): void;

    function test_bug_base(uri_pattern: string): void;

    function test_disable_crash_reporting(): void;

    function test_expect_message(log_domain: string | null, log_level: LogLevelFlags, pattern: string): void;

    function test_fail(): void;

    function test_failed(): boolean;

    function test_get_dir(file_type: TestFileType): string;

    function test_get_path(): string;

    function test_incomplete(msg: string | null): void;

    function test_log_type_name(log_type: TestLogType): string;

    function test_queue_destroy(destroy_data: null): void;

    function test_queue_free(gfree_pointer: null): void;

    function test_rand_double(): number;

    function test_rand_double_range(range_start: number, range_end: number): number;

    function test_rand_int(): number;

    function test_rand_int_range(begin: number, end: number): number;

    function test_run(): number;

    function test_run_suite(suite: TestSuite): number;

    function test_set_nonfatal_assertions(): void;

    function test_skip(msg: string | null): void;

    function test_subprocess(): boolean;

    function test_summary(summary: string): void;

    function test_timer_elapsed(): number;

    function test_timer_last(): number;

    function test_timer_start(): void;

    function test_trap_assertions(domain: string, file: string, line: number, func: string, assertion_flags: bigint | number, pattern: string): void;

    function test_trap_fork(usec_timeout: bigint | number, test_trap_flags: TestTrapFlags): boolean;

    function test_trap_has_passed(): boolean;

    function test_trap_has_skipped(): boolean;

    function test_trap_reached_timeout(): boolean;

    function test_trap_subprocess(test_path: string | null, usec_timeout: bigint | number, test_flags: TestSubprocessFlags): void;

    function test_trap_subprocess_with_envp(test_path: string | null, envp: string[] | null, usec_timeout: bigint | number, test_flags: TestSubprocessFlags): void;

    function thread_error_quark(): Quark;

    function thread_exit(retval: null): void;

    function thread_pool_get_max_idle_time(): number;

    function thread_pool_get_max_unused_threads(): number;

    function thread_pool_get_num_unused_threads(): number;

    function thread_pool_set_max_idle_time(interval: number): void;

    function thread_pool_set_max_unused_threads(max_threads: number): void;

    function thread_pool_stop_unused_threads(): void;

    function thread_self(): Thread;

    function thread_yield(): void;

    function time_val_from_iso8601(iso_date: string): [boolean, TimeVal];

    function timeout_add(priority: number, interval: number, _function: SourceFunc): number;

    function timeout_add_seconds(priority: number, interval: number, _function: SourceFunc): number;

    function timeout_source_new(interval: number): Source;

    function timeout_source_new_ns(interval: bigint | number): Source;

    function timeout_source_new_seconds(interval: number): Source;

    function trash_stack_height(stack_p: TrashStack): number;

    function trash_stack_peek(stack_p: TrashStack): null;

    function trash_stack_pop(stack_p: TrashStack): null;

    function trash_stack_push(stack_p: TrashStack, data_p: never): void;

    function try_malloc(n_bytes: bigint | number): null;

    function try_malloc0(n_bytes: bigint | number): null;

    function try_malloc0_n(n_blocks: bigint | number, n_block_bytes: bigint | number): null;

    function try_malloc_n(n_blocks: bigint | number, n_block_bytes: bigint | number): null;

    function try_realloc(mem: null, n_bytes: bigint | number): null;

    function try_realloc_n(mem: null, n_blocks: bigint | number, n_block_bytes: bigint | number): null;

    function ucs4_to_utf16(str: string): [number, number, number];

    function ucs4_to_utf8(str: string): [string, number, number];

    function unichar_break_type(c: string): UnicodeBreakType;

    function unichar_combining_class(uc: string): number;

    function unichar_compose(a: string, b: string): [boolean, string];

    function unichar_decompose(ch: string): [boolean, string, string];

    function unichar_digit_value(c: string): number;

    function unichar_fully_decompose(ch: string, compat: boolean, result_len: bigint | number): [number, string];

    function unichar_get_mirror_char(ch: string): [boolean, string];

    function unichar_get_script(ch: string): UnicodeScript;

    function unichar_isalnum(c: string): boolean;

    function unichar_isalpha(c: string): boolean;

    function unichar_iscntrl(c: string): boolean;

    function unichar_isdefined(c: string): boolean;

    function unichar_isdigit(c: string): boolean;

    function unichar_isgraph(c: string): boolean;

    function unichar_islower(c: string): boolean;

    function unichar_ismark(c: string): boolean;

    function unichar_isprint(c: string): boolean;

    function unichar_ispunct(c: string): boolean;

    function unichar_isspace(c: string): boolean;

    function unichar_istitle(c: string): boolean;

    function unichar_isupper(c: string): boolean;

    function unichar_iswide(c: string): boolean;

    function unichar_iswide_cjk(c: string): boolean;

    function unichar_isxdigit(c: string): boolean;

    function unichar_iszerowidth(c: string): boolean;

    function unichar_to_utf8(c: string): [number, string];

    function unichar_tolower(c: string): string;

    function unichar_totitle(c: string): string;

    function unichar_toupper(c: string): string;

    function unichar_type(c: string): UnicodeType;

    function unichar_validate(ch: string): boolean;

    function unichar_xdigit_value(c: string): number;

    function unicode_canonical_decomposition(ch: string, result_len: bigint | number): string;

    function unicode_canonical_ordering(string: string): void;

    function unicode_script_from_iso15924(iso15924: number): UnicodeScript;

    function unicode_script_to_iso15924(script: UnicodeScript): number;

    function unlink(filename: string): number;

    function unsetenv(variable: string): void;

    function uri_build(flags: UriFlags, scheme: string, userinfo: string | null, host: string | null, port: number, path: string, query: string | null, fragment: string | null): Uri;

    function uri_build_with_user(flags: UriFlags, scheme: string, user: string | null, password: string | null, auth_params: string | null, host: string | null, port: number, path: string, query: string | null, fragment: string | null): Uri;

    function uri_error_quark(): Quark;

    function uri_escape_bytes(unescaped: Uint8Array | string, reserved_chars_allowed: string | null): string;

    function uri_escape_string(unescaped: string, reserved_chars_allowed: string | null, allow_utf8: boolean): string;

    function uri_is_valid(uri_string: string, flags: UriFlags): boolean;

    function uri_join(flags: UriFlags, scheme: string | null, userinfo: string | null, host: string | null, port: number, path: string, query: string | null, fragment: string | null): string;

    function uri_join_with_user(flags: UriFlags, scheme: string | null, user: string | null, password: string | null, auth_params: string | null, host: string | null, port: number, path: string, query: string | null, fragment: string | null): string;

    function uri_list_extract_uris(uri_list: string): string[];

    function uri_parse(uri_string: string, flags: UriFlags): Uri;

    function uri_parse_params(params: string, length: bigint | number, separators: string, flags: UriParamsFlags): { [key: string]: string };

    function uri_parse_scheme(uri: string): string | null;

    function uri_peek_scheme(uri: string): string | null;

    function uri_resolve_relative(base_uri_string: string | null, uri_ref: string, flags: UriFlags): string;

    function uri_split(uri_ref: string, flags: UriFlags): [boolean, string, string, string, number, string, string, string];

    function uri_split_network(uri_string: string, flags: UriFlags): [boolean, string, string, number];

    function uri_split_with_user(uri_ref: string, flags: UriFlags): [boolean, string, string, string, string, string, number, string, string, string];

    function uri_unescape_bytes(escaped_string: string, length: bigint | number, illegal_characters: string | null): Bytes;

    function uri_unescape_segment(escaped_string: string | null, escaped_string_end: string | null, illegal_characters: string | null): string | null;

    function uri_unescape_string(escaped_string: string, illegal_characters: string | null): string | null;

    function usleep(microseconds: bigint | number): void;

    function utf16_to_ucs4(str: number[]): [string, number, number];

    function utf16_to_utf8(str: number[]): [string, number, number];

    function utf8_casefold(str: string, len: bigint | number): string;

    function utf8_collate(str1: string, str2: string): number;

    function utf8_collate_key(str: string, len: bigint | number): string;

    function utf8_collate_key_for_filename(str: string, len: bigint | number): string;

    function utf8_find_next_char(p: string, end: string | null): string | null;

    function utf8_find_prev_char(str: string, p: string): string | null;

    function utf8_get_char(p: string): string;

    function utf8_get_char_validated(p: string, max_len: bigint | number): string;

    function utf8_make_valid(str: string, len: bigint | number): string;

    function utf8_normalize(str: string, len: bigint | number, mode: NormalizeMode): string | null;

    function utf8_offset_to_pointer(str: string, offset: bigint | number): string;

    function utf8_pointer_to_offset(str: string, pos: string): number;

    function utf8_prev_char(p: string): string;

    function utf8_strchr(p: string, len: bigint | number, c: string): string | null;

    function utf8_strdown(str: string, len: bigint | number): string;

    function utf8_strlen(p: string, max: bigint | number): number;

    function utf8_strncpy(dest: string, src: string, n: bigint | number): string;

    function utf8_strrchr(p: string, len: bigint | number, c: string): string | null;

    function utf8_strreverse(str: string, len: bigint | number): string;

    function utf8_strup(str: string, len: bigint | number): string;

    function utf8_substring(str: string, start_pos: bigint | number, end_pos: bigint | number): string;

    function utf8_to_ucs4(str: string, len: bigint | number): [string, number, number];

    function utf8_to_ucs4_fast(str: string, len: bigint | number): [string, number];

    function utf8_to_utf16(str: string, len: bigint | number): [number, number, number];

    function utf8_truncate_middle(string: string, truncate_length: bigint | number): string;

    function utf8_validate(str: Uint8Array | string): [boolean, Uint8Array | null];

    function utf8_validate_len(str: Uint8Array | string): [boolean, Uint8Array | null];

    function utime(filename: string, utb: null): number;

    function uuid_string_is_valid(str: string): boolean;

    function uuid_string_random(): string;

    function variant_get_gtype(): GObject.GType;

    function variant_is_object_path(string: string): boolean;

    function variant_is_signature(string: string): boolean;

    function variant_parse(type: VariantType | null, text: string, limit: string | null, endptr: string | null): Variant;

    function variant_parse_error_print_context(error: Error, source_str: string): string;

    function variant_parse_error_quark(): Quark;

    function variant_parser_get_error_quark(): Quark;

    function variant_type_checked_(type_string: string): VariantType;

    function variant_type_string_get_depth_(type_string: string): number;

    function variant_type_string_is_valid(type_string: string): boolean;

    function variant_type_string_scan(string: string, limit: string | null): [boolean, string];

    interface CacheDestroyFunc {
        (value: null): void;
    }

    interface CacheDupFunc {
        (value: null): null;
    }

    interface CacheNewFunc {
        (key: null): null;
    }

    interface ChildWatchFunc {
        (pid: Pid, wait_status: number): void;
    }

    interface ClearHandleFunc {
        (handle_id: number): void;
    }

    interface CompareDataFunc {
        (a: null, b: null): number;
    }

    interface CompareFunc {
        (a: null, b: null): number;
    }

    interface CompletionFunc {
        (item: null): string;
    }

    interface CompletionStrncmpFunc {
        (s1: string, s2: string, n: number): number;
    }

    interface CopyFunc {
        (src: null, data: null): never;
    }

    interface DataForeachFunc {
        (key_id: Quark, data: null): void;
    }

    interface DestroyNotify {
        (data: null): void;
    }

    interface DuplicateFunc {
        (data: null): null;
    }

    interface EqualFunc {
        (a: null, b: null): boolean;
    }

    interface EqualFuncFull {
        (a: null, b: null): boolean;
    }

    interface ErrorClearFunc {
        (error: Error): void;
    }

    interface ErrorCopyFunc {
        (src_error: Error, dest_error: Error): void;
    }

    interface ErrorInitFunc {
        (error: Error): void;
    }

    interface FreeFunc {
        (data: null): void;
    }

    interface Func {
        (data: null): void;
    }

    interface HFunc {
        (key: null, value: null): void;
    }

    interface HRFunc {
        (key: null, value: null): boolean;
    }

    interface HashFunc {
        (key: null): number;
    }

    interface HookCheckFunc {
        (data: null): boolean;
    }

    interface HookCheckMarshaller {
        (hook: Hook, marshal_data: null): boolean;
    }

    interface HookCompareFunc {
        (new_hook: Hook, sibling: Hook): number;
    }

    interface HookFinalizeFunc {
        (hook_list: HookList, hook: Hook): void;
    }

    interface HookFindFunc {
        (hook: Hook, data: null): boolean;
    }

    interface HookFunc {
        (data: null): void;
    }

    interface HookMarshaller {
        (hook: Hook, marshal_data: null): void;
    }

    interface IOFunc {
        (source: IOChannel, condition: IOCondition, data: null): boolean;
    }

    interface LogFunc {
        (log_domain: string | null, log_level: LogLevelFlags, message: string): void;
    }

    interface LogWriterFunc {
        (log_level: LogLevelFlags, fields: LogField[]): LogWriterOutput;
    }

    interface NodeForeachFunc {
        (node: Node, data: null): void;
    }

    interface NodeTraverseFunc {
        (node: Node, data: null): boolean;
    }

    interface OptionArgFunc {
        (option_name: string, value: string, data: null): boolean;
    }

    interface OptionErrorFunc {
        (context: OptionContext, group: OptionGroup, data: null): void;
    }

    interface OptionParseFunc {
        (context: OptionContext, group: OptionGroup, data: null): boolean;
    }

    interface PollFunc {
        (ufds: PollFD, nfsd: number, timeout_: number): number;
    }

    interface PrintFunc {
        (string: string): void;
    }

    interface RegexEvalCallback {
        (match_info: MatchInfo, result: String): boolean;
    }

    interface ScannerMsgFunc {
        (scanner: Scanner, message: string, error: boolean): void;
    }

    interface SequenceIterCompareFunc {
        (a: SequenceIter, b: SequenceIter, data: null): number;
    }

    interface SourceDisposeFunc {
        (source: Source): void;
    }

    interface SourceDummyMarshal {
        (): void;
    }

    interface SourceFunc {
        (user_data: null): boolean;
    }

    interface SourceFuncsCheckFunc {
        (source: Source): boolean;
    }

    interface SourceFuncsFinalizeFunc {
        (source: Source): void;
    }

    interface SourceFuncsPrepareFunc {
        (source: Source): boolean;
    }

    interface SourceOnceFunc {
        (user_data: null): void;
    }

    interface SpawnChildSetupFunc {
        (data: null): void;
    }

    interface TestDataFunc {
        (user_data: null): void;
    }

    interface TestFixtureFunc {
        (fixture: null): void;
    }

    interface TestFunc {
        (): void;
    }

    interface TestLogFatalFunc {
        (log_domain: string, log_level: LogLevelFlags, message: string): boolean;
    }

    interface ThreadFunc {
        (data: null): null;
    }

    interface TranslateFunc {
        (str: string, data: null): string;
    }

    interface TraverseFunc {
        (key: null, value: null, data: null): boolean;
    }

    interface TraverseNodeFunc {
        (node: TreeNode, data: null): boolean;
    }

    interface VoidFunc {
        (): void;
    }

    enum AsciiType {
        ALNUM = 1,
        ALPHA = 2,
        CNTRL = 4,
        DIGIT = 8,
        GRAPH = 16,
        LOWER = 32,
        PRINT = 64,
        PUNCT = 128,
        SPACE = 256,
        UPPER = 512,
        XDIGIT = 1024,
    }


    enum FileSetContentsFlags {
        NONE = 0,
        CONSISTENT = 1,
        DURABLE = 2,
        ONLY_EXISTING = 4,
    }


    enum FileTest {
        IS_REGULAR = 1,
        IS_SYMLINK = 2,
        IS_DIR = 4,
        IS_EXECUTABLE = 8,
        EXISTS = 16,
    }


    enum FormatSizeFlags {
        DEFAULT = 0,
        LONG_FORMAT = 1,
        IEC_UNITS = 2,
        BITS = 4,
        ONLY_VALUE = 8,
        ONLY_UNIT = 16,
    }


    enum HookFlagMask {
        ACTIVE = 1,
        IN_CALL = 2,
        RESERVED1 = 4,
    }


    export namespace IOCondition {
        export const $gtype: GObject.GType<IOCondition>;
    }

    enum IOCondition {
        IN = 1,
        OUT = 4,
        PRI = 2,
        ERR = 8,
        HUP = 16,
        NVAL = 32,
    }


    enum IOFlags {
        NONE = 0,
        APPEND = 1,
        NONBLOCK = 2,
        IS_READABLE = 4,
        IS_WRITABLE = 8,
        IS_WRITEABLE = 8,
        IS_SEEKABLE = 16,
        MASK = 31,
        GET_MASK = 31,
        SET_MASK = 3,
    }


    enum KeyFileFlags {
        NONE = 0,
        KEEP_COMMENTS = 1,
        KEEP_TRANSLATIONS = 2,
    }


    enum LogLevelFlags {
        FLAG_RECURSION = 1,
        FLAG_FATAL = 2,
        LEVEL_ERROR = 4,
        LEVEL_CRITICAL = 8,
        LEVEL_WARNING = 16,
        LEVEL_MESSAGE = 32,
        LEVEL_INFO = 64,
        LEVEL_DEBUG = 128,
        LEVEL_MASK = -4,
    }


    enum MainContextFlags {
        NONE = 0,
        OWNERLESS_POLLING = 1,
    }


    enum MarkupCollectType {
        INVALID = 0,
        STRING = 1,
        STRDUP = 2,
        BOOLEAN = 3,
        TRISTATE = 4,
        OPTIONAL = 65536,
    }


    enum MarkupParseFlags {
        DEFAULT_FLAGS = 0,
        DO_NOT_USE_THIS_UNSUPPORTED_FLAG = 1,
        TREAT_CDATA_AS_TEXT = 2,
        PREFIX_ERROR_POSITION = 4,
        IGNORE_QUALIFIED = 8,
    }


    enum OptionFlags {
        NONE = 0,
        HIDDEN = 1,
        IN_MAIN = 2,
        REVERSE = 4,
        NO_ARG = 8,
        FILENAME = 16,
        OPTIONAL_ARG = 32,
        NOALIAS = 64,
        DEPRECATED = 128,
    }


    enum RegexCompileFlags {
        DEFAULT = 0,
        CASELESS = 1,
        MULTILINE = 2,
        DOTALL = 4,
        EXTENDED = 8,
        ANCHORED = 16,
        DOLLAR_ENDONLY = 32,
        UNGREEDY = 512,
        RAW = 2048,
        NO_AUTO_CAPTURE = 4096,
        OPTIMIZE = 8192,
        FIRSTLINE = 262144,
        DUPNAMES = 524288,
        NEWLINE_CR = 1048576,
        NEWLINE_LF = 2097152,
        NEWLINE_RESERVED1 = 4194304,
    }


    enum RegexMatchFlags {
        DEFAULT = 0,
        ANCHORED = 16,
        NOTBOL = 128,
        NOTEOL = 256,
        NOTEMPTY = 1024,
        PARTIAL = 32768,
        NEWLINE_CR = 1048576,
        NEWLINE_LF = 2097152,
        NEWLINE_CRLF = 3145728,
        NEWLINE_ANY = 4194304,
        NEWLINE_ANYCRLF = 5242880,
        BSR_ANYCRLF = 8388608,
        BSR_ANY = 16777216,
        PARTIAL_SOFT = 32768,
        PARTIAL_HARD = 134217728,
        NOTEMPTY_ATSTART = 268435456,
    }


    enum SpawnFlags {
        DEFAULT = 0,
        LEAVE_DESCRIPTORS_OPEN = 1,
        DO_NOT_REAP_CHILD = 2,
        SEARCH_PATH = 4,
        STDOUT_TO_DEV_NULL = 8,
        STDERR_TO_DEV_NULL = 16,
        CHILD_INHERITS_STDIN = 32,
        FILE_AND_ARGV_ZERO = 64,
        SEARCH_PATH_FROM_ENVP = 128,
        CLOEXEC_PIPES = 256,
        CHILD_INHERITS_STDOUT = 512,
        CHILD_INHERITS_STDERR = 1024,
        STDIN_FROM_DEV_NULL = 2048,
    }


    enum TestSubprocessFlags {
        DEFAULT = 0,
        INHERIT_STDIN = 1,
        INHERIT_STDOUT = 2,
        INHERIT_STDERR = 4,
        INHERIT_DESCRIPTORS = 8,
    }


    enum TestTrapFlags {
        DEFAULT = 0,
        SILENCE_STDOUT = 128,
        SILENCE_STDERR = 256,
        INHERIT_STDIN = 512,
    }


    enum TraverseFlags {
        LEAVES = 1,
        NON_LEAVES = 2,
        ALL = 3,
        MASK = 3,
        LEAFS = 1,
        NON_LEAFS = 2,
    }


    enum UriFlags {
        NONE = 0,
        PARSE_RELAXED = 1,
        HAS_PASSWORD = 2,
        HAS_AUTH_PARAMS = 4,
        ENCODED = 8,
        NON_DNS = 16,
        ENCODED_QUERY = 32,
        ENCODED_PATH = 64,
        ENCODED_FRAGMENT = 128,
        SCHEME_NORMALIZE = 256,
    }


    enum UriHideFlags {
        NONE = 0,
        USERINFO = 1,
        PASSWORD = 2,
        AUTH_PARAMS = 4,
        QUERY = 8,
        FRAGMENT = 16,
    }


    enum UriParamsFlags {
        NONE = 0,
        CASE_INSENSITIVE = 1,
        WWW_FORM = 2,
        PARSE_RELAXED = 4,
    }


    abstract class Allocator {
        static $gtype: GObject.GType<Allocator>;

        // Methods
        free(): void;
    }


    class Array {
        static $gtype: GObject.GType<Array>;

        // Fields
        data: string;

        len: number;

        // Constructors

        constructor(properties?: Partial<{
            data: string;
            len: number;
        }>);

        // Static methods
        static copy(array: never[]): null[];

        static free(array: never[], free_segment: boolean): string;

        static ref(array: never[]): null[];

        static unref(array: never[]): void;
    }


    abstract class AsyncQueue {
        static $gtype: GObject.GType<AsyncQueue>;

        // Static methods
        static ["new"](): AsyncQueue;

        static new_full(): AsyncQueue;

        // Methods
        length(): number;

        length_unlocked(): number;

        lock(): void;

        pop(): null;

        pop_unlocked(): null;

        push(data: never): void;

        push_front(item: never): void;

        push_front_unlocked(item: never): void;

        push_sorted(data: never, func: CompareDataFunc): void;

        push_sorted_unlocked(data: never, func: CompareDataFunc): void;

        push_unlocked(data: never): void;

        ref(): AsyncQueue;

        ref_unlocked(): void;

        remove(item: never): boolean;

        remove_unlocked(item: never): boolean;

        sort(func: CompareDataFunc): void;

        sort_unlocked(func: CompareDataFunc): void;

        timed_pop(end_time: TimeVal): null;

        timed_pop_unlocked(end_time: TimeVal): null;

        timeout_pop(timeout: bigint | number): null;

        timeout_pop_unlocked(timeout: bigint | number): null;

        try_pop(): null;

        try_pop_unlocked(): null;

        unlock(): void;

        unref(): void;

        unref_and_unlock(): void;
    }


    class BookmarkFile {
        static $gtype: GObject.GType<BookmarkFile>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): BookmarkFile;

        // Static methods
        static error_quark(): Quark;

        // Methods
        add_application(uri: string, name: string | null, exec: string | null): void;

        add_group(uri: string, group: string): void;

        copy(): BookmarkFile;

        free(): void;

        get_added(uri: string): number;

        get_added_date_time(uri: string): DateTime;

        get_app_info(uri: string, name: string): [boolean, string, number, number];

        get_application_info(uri: string, name: string): [boolean, string, number, DateTime | null];

        get_applications(uri: string): string[];

        get_description(uri: string): string;

        get_groups(uri: string): string[];

        get_icon(uri: string): [boolean, string, string];

        get_is_private(uri: string): boolean;

        get_mime_type(uri: string): string;

        get_modified(uri: string): number;

        get_modified_date_time(uri: string): DateTime;

        get_size(): number;

        get_title(uri: string | null): string;

        get_uris(): string[];

        get_visited(uri: string): number;

        get_visited_date_time(uri: string): DateTime;

        has_application(uri: string, name: string): boolean;

        has_group(uri: string, group: string): boolean;

        has_item(uri: string): boolean;

        load_from_data(data: Uint8Array | string): boolean;

        load_from_data_dirs(file: string): [boolean, string];

        load_from_file(filename: string): boolean;

        move_item(old_uri: string, new_uri: string | null): boolean;

        remove_application(uri: string, name: string): boolean;

        remove_group(uri: string, group: string): boolean;

        remove_item(uri: string): boolean;

        set_added(uri: string, added: bigint | number): void;

        set_added_date_time(uri: string, added: DateTime): void;

        set_app_info(uri: string, name: string, exec: string, count: number, stamp: bigint | number): boolean;

        set_application_info(uri: string, name: string, exec: string, count: number, stamp: DateTime | null): boolean;

        set_description(uri: string | null, description: string): void;

        set_groups(uri: string, groups: string[] | null): void;

        set_icon(uri: string, href: string | null, mime_type: string): void;

        set_is_private(uri: string, is_private: boolean): void;

        set_mime_type(uri: string, mime_type: string): void;

        set_modified(uri: string, modified: bigint | number): void;

        set_modified_date_time(uri: string, modified: DateTime): void;

        set_title(uri: string | null, title: string): void;

        set_visited(uri: string, visited: bigint | number): void;

        set_visited_date_time(uri: string, visited: DateTime): void;

        to_data(): Uint8Array;

        to_file(filename: string): boolean;
    }


    class ByteArray {
        static $gtype: GObject.GType<ByteArray>;

        // Fields
        data: number;

        len: number;

        // Constructors

        constructor(properties?: Partial<{
            data: number;
            len: number;
        }>);

        // Static methods
        static append(array: Uint8Array | string, data: Uint8Array | string): Uint8Array;

        static free(array: Uint8Array | string, free_segment: boolean): Uint8Array | null;

        static free_to_bytes(array: Uint8Array | string): Bytes;

        static ["new"](): Uint8Array;

        static new_take(data: Uint8Array | string): Uint8Array;

        static prepend(array: Uint8Array | string, data: Uint8Array | string): Uint8Array;

        static ref(array: Uint8Array | string): Uint8Array;

        static remove_index(array: Uint8Array | string, index_: number): Uint8Array;

        static remove_index_fast(array: Uint8Array | string, index_: number): Uint8Array;

        static remove_range(array: Uint8Array | string, index_: number, length: number): Uint8Array;

        static set_size(array: Uint8Array | string, length: number): Uint8Array;

        static sized_new(reserved_size: number): Uint8Array;

        static sort(array: Uint8Array | string, compare_func: CompareFunc): void;

        static sort_with_data(array: Uint8Array | string, compare_func: CompareDataFunc): void;

        static steal(array: Uint8Array | string): Uint8Array;

        static unref(array: Uint8Array | string): void;
    }


    class Bytes {
        static $gtype: GObject.GType<Bytes>;

        // Constructors
        constructor(data: Uint8Array | string | null);

        static ["new"](data: Uint8Array | string | null): Bytes;

        static new_from_bytes(bytes: Bytes | Uint8Array, offset: bigint | number, length: bigint | number): Bytes;

        static new_take(data: Uint8Array | string | null): Bytes;

        // Methods
        compare(bytes2: Bytes | Uint8Array): number;

        equal(bytes2: Bytes | Uint8Array): boolean;

        get_data(): Uint8Array | null;

        get_region(element_size: bigint | number, offset: bigint | number, n_elements: bigint | number): null;

        get_size(): number;

        hash(): number;

        ref(): Bytes;

        unref(): void;

        unref_to_array(): Uint8Array;

        unref_to_data(): Uint8Array;

        toArray(): Uint8Array;
    }


    abstract class Cache {
        static $gtype: GObject.GType<Cache>;

        // Methods
        destroy(): void;

        insert(key: null): null;

        key_foreach(func: HFunc): void;

        remove(value: null): void;

        value_foreach(func: HFunc): void;
    }


    class Checksum {
        static $gtype: GObject.GType<Checksum>;

        // Constructors
        constructor(checksum_type: ChecksumType);

        static ["new"](checksum_type: ChecksumType): Checksum;

        // Static methods
        static type_get_length(checksum_type: ChecksumType): number;

        // Methods
        copy(): Checksum;

        free(): void;

        get_string(): string;

        reset(): void;

        update(data: Uint8Array | string): void;
    }


    class Completion {
        static $gtype: GObject.GType<Completion>;

        // Fields
        items: null[];

        func: CompletionFunc;

        prefix: string;

        cache: null[];

        strncmp_func: CompletionStrncmpFunc;

        // Methods
        clear_items(): void;

        complete_utf8(prefix: string, new_prefix: string): string[];

        free(): void;
    }


    class Cond {
        static $gtype: GObject.GType<Cond>;

        // Constructors
        constructor(properties?: Partial<{}>);

        // Methods
        broadcast(): void;

        clear(): void;

        free(): void;

        init(): void;

        signal(): void;

        wait(mutex: Mutex): void;

        wait_until(mutex: Mutex, end_time: bigint | number): boolean;
    }


    abstract class Data {
        static $gtype: GObject.GType<Data>;
    }


    class Date {
        static $gtype: GObject.GType<Date>;

        // Fields
        julian_days: number;

        julian: number;

        dmy: number;

        day: number;

        month: number;

        year: number;

        // Constructors

        constructor(properties?: Partial<{
            julian_days: number;
            julian: number;
            dmy: number;
            day: number;
            month: number;
            year: number;
        }>);

        static ["new"](): Date;

        static new_dmy(day: DateDay, month: DateMonth, year: DateYear): Date;

        static new_julian(julian_day: number): Date;

        // Static methods
        static get_days_in_month(month: DateMonth, year: DateYear): number;

        static get_monday_weeks_in_year(year: DateYear): number;

        static get_sunday_weeks_in_year(year: DateYear): number;

        static get_weeks_in_year(year: DateYear, first_day_of_week: DateWeekday): number;

        static is_leap_year(year: DateYear): boolean;

        static strftime(s: string, slen: bigint | number, format: string, date: Date): number;

        static valid_day(day: DateDay): boolean;

        static valid_dmy(day: DateDay, month: DateMonth, year: DateYear): boolean;

        static valid_julian(julian_date: number): boolean;

        static valid_month(month: DateMonth): boolean;

        static valid_weekday(weekday: DateWeekday): boolean;

        static valid_year(year: DateYear): boolean;

        // Methods
        add_days(n_days: number): void;

        add_months(n_months: number): void;

        add_years(n_years: number): void;

        clamp(min_date: Date, max_date: Date): void;

        clear(n_dates: number): void;

        compare(rhs: Date): number;

        copy(): Date;

        days_between(date2: Date): number;

        free(): void;

        get_day(): DateDay;

        get_day_of_year(): number;

        get_iso8601_week_of_year(): number;

        get_julian(): number;

        get_monday_week_of_year(): number;

        get_month(): DateMonth;

        get_sunday_week_of_year(): number;

        get_week_of_year(first_day_of_week: DateWeekday): number;

        get_weekday(): DateWeekday;

        get_year(): DateYear;

        is_first_of_month(): boolean;

        is_last_of_month(): boolean;

        order(date2: Date): void;

        set_day(day: DateDay): void;

        set_dmy(day: DateDay, month: DateMonth, y: DateYear): void;

        set_julian(julian_date: number): void;

        set_month(month: DateMonth): void;

        set_parse(str: string): void;

        set_time(time_: Time): void;

        set_time_t(timet: bigint | number): void;

        set_time_val(timeval: TimeVal): void;

        set_year(year: DateYear): void;

        subtract_days(n_days: number): void;

        subtract_months(n_months: number): void;

        subtract_years(n_years: number): void;

        to_struct_tm(tm: never): void;

        valid(): boolean;
    }


    class DateTime {
        static $gtype: GObject.GType<DateTime>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](tz: TimeZone, year: number, month: number, day: number, hour: number, minute: number, seconds: number): DateTime;

        static new_from_iso8601(text: string, default_tz: TimeZone | null): DateTime;

        static new_from_timeval_local(tv: TimeVal): DateTime;

        static new_from_timeval_utc(tv: TimeVal): DateTime;

        static new_from_unix_local(t: bigint | number): DateTime;

        static new_from_unix_local_usec(usecs: bigint | number): DateTime;

        static new_from_unix_utc(t: bigint | number): DateTime;

        static new_from_unix_utc_usec(usecs: bigint | number): DateTime;

        static new_local(year: number, month: number, day: number, hour: number, minute: number, seconds: number): DateTime;

        static new_now(tz: TimeZone): DateTime;

        static new_now_local(): DateTime;

        static new_now_utc(): DateTime;

        static new_utc(year: number, month: number, day: number, hour: number, minute: number, seconds: number): DateTime;

        // Methods
        add(timespan: TimeSpan): DateTime | null;

        add_days(days: number): DateTime | null;

        add_full(years: number, months: number, days: number, hours: number, minutes: number, seconds: number): DateTime | null;

        add_hours(hours: number): DateTime | null;

        add_minutes(minutes: number): DateTime | null;

        add_months(months: number): DateTime | null;

        add_seconds(seconds: number): DateTime | null;

        add_weeks(weeks: number): DateTime | null;

        add_years(years: number): DateTime | null;

        compare(dt2: DateTime): number;

        difference(begin: DateTime): TimeSpan;

        equal(dt2: DateTime): boolean;

        format(format: string): string | null;

        format_iso8601(): string | null;

        get_day_of_month(): number;

        get_day_of_week(): number;

        get_day_of_year(): number;

        get_hour(): number;

        get_microsecond(): number;

        get_minute(): number;

        get_month(): number;

        get_second(): number;

        get_seconds(): number;

        get_timezone(): TimeZone;

        get_timezone_abbreviation(): string;

        get_utc_offset(): TimeSpan;

        get_week_numbering_year(): number;

        get_week_of_year(): number;

        get_year(): number;

        get_ymd(): [number, number, number];

        hash(): number;

        is_daylight_savings(): boolean;

        ref(): DateTime;

        to_local(): DateTime | null;

        to_timeval(tv: TimeVal): boolean;

        to_timezone(tz: TimeZone): DateTime | null;

        to_unix(): number;

        to_unix_usec(): number;

        to_utc(): DateTime | null;

        unref(): void;
    }


    class DebugKey {
        static $gtype: GObject.GType<DebugKey>;

        // Fields
        key: string;

        value: number;

        // Constructors

        constructor(properties?: Partial<{
            key: string;
            value: number;
        }>);
    }


    class Dir {
        static $gtype: GObject.GType<Dir>;

        // Constructors
        constructor(path: string, flags: number);

        static open(path: string, flags: number): Dir;

        // Static methods
        static make_tmp(tmpl: string | null): string;

        // Methods
        close(): void;

        read_name(): string;

        ref(): Dir;

        rewind(): void;

        unref(): void;
    }


    class Error {
        static $gtype: GObject.GType<Error>;

        // Fields
        domain: Quark;

        code: number;

        message: string;

        stack: string;

        // Constructors

        constructor(properties?: Partial<{
            domain: Quark;
            code: number;
            message: string;
        }>);

        static new_literal(domain: ({ new(...args: any[] ): Error }) | Quark, code: number, message: string): Error;

        // Static methods
        static domain_register(error_type_name: string, error_type_private_size: bigint | number, error_type_init: ErrorInitFunc, error_type_copy: ErrorCopyFunc, error_type_clear: ErrorClearFunc): Quark;

        static domain_register_static(error_type_name: string, error_type_private_size: bigint | number, error_type_init: ErrorInitFunc, error_type_copy: ErrorCopyFunc, error_type_clear: ErrorClearFunc): Quark;

        // Methods
        copy(): Error;

        free(): void;

        matches(domain: ({ new(...args: any[] ): Error }) | Quark, code: number): boolean;
    }


    abstract class HashTable<A = string, B = any> {
        static $gtype: GObject.GType<HashTable>;

    [key: string]: B;


        // Static methods
        static add(hash_table: never, key: null): boolean;

        static contains(hash_table: never, key: null): boolean;

        static destroy(hash_table: never): void;

        static find(hash_table: never, predicate: HRFunc): null;

        static foreach(hash_table: never, func: HFunc): void;

        static foreach_remove(hash_table: never, func: HRFunc): number;

        static foreach_steal(hash_table: never, func: HRFunc): number;

        static insert(hash_table: never, key: null, value: null): boolean;

        static lookup(hash_table: never, key: null): null;

        static lookup_extended(hash_table: never, lookup_key: null): [boolean, null, null];

        static new_similar(other_hash_table: never): never;

        static ref(hash_table: never): never;

        static remove(hash_table: never, key: null): boolean;

        static remove_all(hash_table: never): void;

        static replace(hash_table: never, key: null, value: null): boolean;

        static size(hash_table: never): number;

        static steal(hash_table: never, key: null): boolean;

        static steal_all(hash_table: never): void;

        static steal_extended(hash_table: never, lookup_key: null): [boolean, null, null];

        static unref(hash_table: never): void;
    }


    class HashTableIter {
        static $gtype: GObject.GType<HashTableIter>;

        // Constructors
        constructor(properties?: Partial<{}>);

        // Methods
        get_hash_table(): never;

        init(hash_table: never): void;

        next(): [boolean, null, null];

        remove(): void;

        replace(value: null): void;

        steal(): void;
    }


    class Hmac {
        static $gtype: GObject.GType<Hmac>;

        // Constructors
        constructor(digest_type: ChecksumType, key: number, key_len: bigint | number);

        static ["new"](digest_type: ChecksumType, key: number, key_len: bigint | number): Hmac;

        // Methods
        copy(): Hmac;

        get_digest(buffer: number, digest_len: bigint | number): void;

        get_string(): string;

        ref(): Hmac;

        unref(): void;

        update(data: number, length: bigint | number): void;
    }


    class Hook {
        static $gtype: GObject.GType<Hook>;

        // Fields
        data: null;

        ref_count: number;

        hook_id: number;

        flags: number;

        func: null;

        destroy: DestroyNotify;

        // Static methods
        static destroy(hook_list: HookList, hook_id: bigint | number): boolean;

        static destroy_link(hook_list: HookList, hook: Hook): void;

        static free(hook_list: HookList, hook: Hook): void;

        static insert_before(hook_list: HookList, sibling: Hook | null, hook: Hook): void;

        static insert_sorted(hook_list: HookList, hook: Hook, func: HookCompareFunc): void;

        static prepend(hook_list: HookList, hook: Hook): void;

        static ref(hook_list: HookList, hook: Hook): Hook;

        static unref(hook_list: HookList, hook: Hook): void;

        // Methods
        compare_ids(sibling: Hook): number;
    }


    class HookList {
        static $gtype: GObject.GType<HookList>;

        // Fields
        seq_id: number;

        hook_size: number;

        is_setup: number;

        dummy3: null;

        finalize_hook: HookFinalizeFunc;

        dummy: null[];

        // Methods
        clear(): void;

        init(hook_size: number): void;

        invoke(may_recurse: boolean): void;

        invoke_check(may_recurse: boolean): void;

        marshal(may_recurse: boolean, marshaller: HookMarshaller): void;

        marshal_check(may_recurse: boolean, marshaller: HookCheckMarshaller): void;
    }


    class IOChannel {
        static $gtype: GObject.GType<IOChannel>;

        // Constructors
        constructor(filename: string, mode: string);

        static new_file(filename: string, mode: string): IOChannel;

        static unix_new(fd: number): IOChannel;

        // Static methods
        static error_from_errno(en: number): IOChannelError;

        static error_quark(): Quark;

        // Methods
        close(): void;

        flush(): IOStatus;

        get_buffer_condition(): IOCondition;

        get_buffer_size(): number;

        get_buffered(): boolean;

        get_close_on_unref(): boolean;

        get_encoding(): string;

        get_flags(): IOFlags;

        get_line_term(): [string, number];

        init(): void;

        read(buf: string, count: bigint | number, bytes_read: bigint | number): IOError;

        read_chars(): [IOStatus, Uint8Array, number];

        read_line(): [IOStatus, string, number, number];

        read_line_string(buffer: String, terminator_pos: bigint | number | null): IOStatus;

        read_to_end(): [IOStatus, Uint8Array];

        read_unichar(): [IOStatus, string];

        ref(): IOChannel;

        seek(offset: bigint | number, type: SeekType): IOError;

        seek_position(offset: bigint | number, type: SeekType): IOStatus;

        set_buffer_size(size: bigint | number): void;

        set_buffered(buffered: boolean): void;

        set_close_on_unref(do_close: boolean): void;

        set_encoding(encoding: string | null): IOStatus;

        set_flags(flags: IOFlags): IOStatus;

        set_line_term(line_term: string | null, length: number): void;

        shutdown(flush: boolean): IOStatus;

        unix_get_fd(): number;

        unref(): void;

        write(buf: string, count: bigint | number, bytes_written: bigint | number): IOError;

        write_chars(buf: Uint8Array | string, count: bigint | number): [IOStatus, number];

        write_unichar(thechar: string): IOStatus;
    }


    class IOFuncs {
        static $gtype: GObject.GType<IOFuncs>;
    }


    class KeyFile {
        static $gtype: GObject.GType<KeyFile>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): KeyFile;

        // Static methods
        static error_quark(): Quark;

        // Methods
        free(): void;

        get_boolean(group_name: string, key: string): boolean;

        get_boolean_list(group_name: string, key: string): boolean[];

        get_comment(group_name: string | null, key: string | null): string;

        get_double(group_name: string, key: string): number;

        get_double_list(group_name: string, key: string): number[];

        get_groups(): [string[], number];

        get_int64(group_name: string, key: string): number;

        get_integer(group_name: string, key: string): number;

        get_integer_list(group_name: string, key: string): number[];

        get_keys(group_name: string): [string[], number];

        get_locale_for_key(group_name: string, key: string, locale: string | null): string | null;

        get_locale_string(group_name: string, key: string, locale: string | null): string;

        get_locale_string_list(group_name: string, key: string, locale: string | null): string[];

        get_start_group(): string | null;

        get_string(group_name: string, key: string): string;

        get_string_list(group_name: string, key: string): string[];

        get_uint64(group_name: string, key: string): number;

        get_value(group_name: string, key: string): string;

        has_group(group_name: string): boolean;

        load_from_bytes(bytes: Bytes | Uint8Array, flags: KeyFileFlags): boolean;

        load_from_data(data: string, length: bigint | number, flags: KeyFileFlags): boolean;

        load_from_data_dirs(file: string, flags: KeyFileFlags): [boolean, string];

        load_from_dirs(file: string, search_dirs: string[], flags: KeyFileFlags): [boolean, string];

        load_from_file(file: string, flags: KeyFileFlags): boolean;

        load_unix_configurations(project: string | null, etc_subdir: string | null, run_subdir: string | null, usr_subdir: string | null, config_name: string, config_suffix: string | null, flags: KeyFileFlags): boolean;

        ref(): KeyFile;

        remove_comment(group_name: string | null, key: string | null): boolean;

        remove_group(group_name: string): boolean;

        remove_key(group_name: string, key: string): boolean;

        save_to_file(filename: string): boolean;

        set_boolean(group_name: string, key: string, value: boolean): void;

        set_boolean_list(group_name: string, key: string, list: boolean[]): void;

        set_comment(group_name: string | null, key: string | null, comment: string): boolean;

        set_double(group_name: string, key: string, value: number): void;

        set_double_list(group_name: string, key: string, list: number[]): void;

        set_int64(group_name: string, key: string, value: bigint | number): void;

        set_integer(group_name: string, key: string, value: number): void;

        set_integer_list(group_name: string, key: string, list: number[]): void;

        set_list_separator(separator: number): void;

        set_locale_string(group_name: string, key: string, locale: string, string: string): void;

        set_locale_string_list(group_name: string, key: string, locale: string, list: string[]): void;

        set_string(group_name: string, key: string, string: string): void;

        set_string_list(group_name: string, key: string, list: string[]): void;

        set_uint64(group_name: string, key: string, value: bigint | number): void;

        set_value(group_name: string, key: string, value: string): void;

        to_data(): [string, number];

        unref(): void;
    }


    class List {
        static $gtype: GObject.GType<List>;

        // Fields
        data: null;

        next: null[];

        prev: null[];

        // Constructors

        constructor(properties?: Partial<{
            data: null;
        }>);

        // Static methods
        static copy(list: never[]): null[];

        static free(list: never[]): void;

        static pop_allocator(): void;

        static push_allocator(allocator: Allocator): void;
    }


    class LogField {
        static $gtype: GObject.GType<LogField>;

        // Fields
        key: string;

        value: null;

        length: number;
    }


    class MainContext {
        static $gtype: GObject.GType<MainContext>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): MainContext;

        static new_with_flags(flags: MainContextFlags): MainContext;

        // Static methods
        static ["default"](): MainContext;

        static get_thread_default(): MainContext | null;

        static ref_thread_default(): MainContext;

        // Methods
        acquire(): boolean;

        add_poll(fd: PollFD, priority: number): void;

        check(max_priority: number, fds: PollFD[]): boolean;

        dispatch(): void;

        find_source_by_funcs_user_data(funcs: SourceFuncs, user_data: null): Source | null;

        find_source_by_id(source_id: number): Source;

        find_source_by_user_data(user_data: null): Source | null;

        invoke_full(priority: number, _function: SourceFunc): void;

        is_owner(): boolean;

        iteration(may_block: boolean): boolean;

        pending(): boolean;

        pop_thread_default(): void;

        prepare(): [boolean, number];

        push_thread_default(): void;

        pusher_new(): MainContextPusher;

        query(max_priority: number): [number, number, PollFD[]];

        ref(): MainContext;

        release(): void;

        remove_poll(fd: PollFD): void;

        unref(): void;

        wait(cond: Cond, mutex: Mutex): boolean;

        wakeup(): void;
    }


    class MainLoop {
        static $gtype: GObject.GType<MainLoop>;

        // Constructors
        constructor(context: MainContext | null, is_running: boolean);

        static ["new"](context: MainContext | null, is_running: boolean): MainLoop;

        // Methods
        get_context(): MainContext;

        is_running(): boolean;

        quit(): void;

        ref(): MainLoop;

        run(): void;

        unref(): void;

        runAsync(): Promise<void>;
    }


    class MappedFile {
        static $gtype: GObject.GType<MappedFile>;

        // Constructors
        constructor(filename: string, writable: boolean);

        static ["new"](filename: string, writable: boolean): MappedFile;

        static new_from_fd(fd: number, writable: boolean): MappedFile;

        // Methods
        free(): void;

        get_bytes(): Bytes;

        get_contents(): string | null;

        get_length(): number;

        ref(): MappedFile;

        unref(): void;
    }


    class MarkupParseContext {
        static $gtype: GObject.GType<MarkupParseContext>;

        // Constructors
        constructor(parser: MarkupParser, flags: MarkupParseFlags, user_data: null);

        static ["new"](parser: MarkupParser, flags: MarkupParseFlags, user_data: null): MarkupParseContext;

        // Methods
        end_parse(): boolean;

        free(): void;

        get_attribute_position(attr: number): [number, number, number, number, number, number];

        get_element(): string;

        get_element_stack(): string[];

        get_offset(): number;

        get_position(): [number, number];

        get_tag_start(): [number, number, number];

        get_user_data(): null;

        parse(text: string, text_len: bigint | number): boolean;

        pop(): null;

        push(parser: MarkupParser, user_data: null): void;

        ref(): MarkupParseContext;

        unref(): void;
    }


    class MarkupParser {
        static $gtype: GObject.GType<MarkupParser>;
    }


    abstract class MatchInfo {
        static $gtype: GObject.GType<MatchInfo>;

        // Methods
        expand_references(string_to_expand: string): string | null;

        fetch(match_num: number): string | null;

        fetch_all(): string[];

        fetch_named(name: string): string | null;

        fetch_named_pos(name: string): [boolean, number, number];

        fetch_pos(match_num: number): [boolean, number, number];

        free(): void;

        get_match_count(): number;

        get_regex(): Regex;

        get_string(): string;

        is_partial_match(): boolean;

        matches(): boolean;

        next(): boolean;

        ref(): MatchInfo;

        unref(): void;
    }


    abstract class MemChunk {
        static $gtype: GObject.GType<MemChunk>;

        // Static methods
        static info(): void;

        // Methods
        alloc(): null;

        alloc0(): null;

        clean(): void;

        destroy(): void;

        free(mem: null): void;

        print(): void;

        reset(): void;
    }


    class MemVTable {
        static $gtype: GObject.GType<MemVTable>;
    }


    class Node {
        static $gtype: GObject.GType<Node>;

        // Fields
        data: null;

        // Static methods
        static pop_allocator(): void;

        static push_allocator(allocator: Allocator): void;

        // Methods
        child_index(data: null): number;

        child_position(child: Node): number;

        children_foreach(flags: TraverseFlags, func: NodeForeachFunc): void;

        copy(): Node;

        depth(): number;

        destroy(): void;

        is_ancestor(descendant: Node): boolean;

        max_height(): number;

        n_children(): number;

        n_nodes(flags: TraverseFlags): number;

        reverse_children(): void;

        traverse(order: TraverseType, flags: TraverseFlags, max_depth: number, func: NodeTraverseFunc): void;

        unlink(): void;
    }


    class Once {
        static $gtype: GObject.GType<Once>;

        // Fields
        status: OnceStatus;

        retval: null;

        // Static methods
        static init_enter(location: never): [boolean, null];

        static init_enter_impl(location: bigint | number): boolean;

        static init_enter_pointer(location: never): boolean;

        static init_leave(location: never, result: bigint | number): null;

        static init_leave_pointer(location: never, result: null): void;
    }


    abstract class OptionContext {
        static $gtype: GObject.GType<OptionContext>;

        // Methods
        add_group(group: OptionGroup): void;

        add_main_entries(entries: OptionEntry[], translation_domain: string | null): void;

        free(): void;

        get_description(): string;

        get_help(main_help: boolean, group: OptionGroup | null): string;

        get_help_enabled(): boolean;

        get_ignore_unknown_options(): boolean;

        get_main_group(): OptionGroup;

        get_strict_posix(): boolean;

        get_summary(): string;

        parse(argv?: string[]): [boolean, string[]];

        parse_strv(_arguments?: string[]): [boolean, string[]];

        set_description(description: string | null): void;

        set_help_enabled(help_enabled: boolean): void;

        set_ignore_unknown_options(ignore_unknown: boolean): void;

        set_main_group(group: OptionGroup): void;

        set_strict_posix(strict_posix: boolean): void;

        set_summary(summary: string | null): void;

        set_translate_func(func: TranslateFunc | null): void;

        set_translation_domain(domain: string): void;
    }


    class OptionEntry {
        static $gtype: GObject.GType<OptionEntry>;

        // Fields
        long_name: string;

        short_name: number;

        flags: number;

        arg: OptionArg;

        arg_data: null;

        description: string;

        arg_description: string;
    }


    class OptionGroup {
        static $gtype: GObject.GType<OptionGroup>;

        // Constructors
        constructor(name: string, description: string, help_description: string, user_data: null);

        static ["new"](name: string, description: string, help_description: string, user_data: null): OptionGroup;

        // Methods
        add_entries(entries: OptionEntry[]): void;

        free(): void;

        ref(): OptionGroup;

        set_translate_func(func: TranslateFunc | null): void;

        set_translation_domain(domain: string): void;

        unref(): void;
    }


    class PathBuf {
        static $gtype: GObject.GType<PathBuf>;

        // Constructors
        constructor(properties?: Partial<{}>);

        // Static methods
        static equal(v1: never, v2: never): boolean;

        // Methods
        clear(): void;

        clear_to_path(): string | null;

        copy(): PathBuf;

        free(): void;

        free_to_path(): string | null;

        init(): PathBuf;

        init_from_path(path: string | null): PathBuf;

        pop(): boolean;

        push(path: string): PathBuf;

        set_extension(extension: string | null): boolean;

        set_filename(file_name: string): boolean;

        to_path(): string | null;
    }


    class PatternSpec {
        static $gtype: GObject.GType<PatternSpec>;

        // Constructors
        constructor(pattern: string);

        static ["new"](pattern: string): PatternSpec;

        // Methods
        copy(): PatternSpec;

        equal(pspec2: PatternSpec): boolean;

        free(): void;

        match(string_length: bigint | number, string: string, string_reversed: string | null): boolean;

        match_string(string: string): boolean;
    }


    class PollFD {
        static $gtype: GObject.GType<PollFD>;

        // Fields
        fd: number;

        events: number;

        revents: number;

        // Constructors

        constructor(properties?: Partial<{
            fd: number;
            events: number;
            revents: number;
        }>);
    }


    class Private {
        static $gtype: GObject.GType<Private>;

        // Methods
        get(): null;

        replace(value: null): void;

        set(value: null): void;
    }


    class PtrArray {
        static $gtype: GObject.GType<PtrArray>;

        // Fields
        pdata: null;

        len: number;

        // Constructors

        constructor(properties?: Partial<{
            pdata: null;
            len: number;
        }>);

        // Static methods
        static copy(array: never[], func: CopyFunc | null): null[];

        static free(array: never[], free_segment: boolean): null[] | null;

        static ref(array: never[]): null[];

        static unref(array: never[]): void;
    }


    class Queue {
        static $gtype: GObject.GType<Queue>;

        // Fields
        head: null[];

        tail: null[];

        length: number;

        // Constructors

        constructor(properties?: Partial<{
            length: number;
        }>);

        // Methods
        clear(): void;

        clear_full(): void;

        copy(): Queue;

        foreach(func: Func): void;

        free(): void;

        free_full(): void;

        get_length(): number;

        index(data: null): number;

        init(): void;

        insert_sorted(data: null, func: CompareDataFunc): void;

        is_empty(): boolean;

        peek_head(): null;

        peek_nth(n: number): null;

        peek_tail(): null;

        pop_head(): null;

        pop_nth(n: number): null;

        pop_tail(): null;

        push_head(data: null): void;

        push_nth(data: null, n: number): void;

        push_tail(data: null): void;

        remove(data: null): boolean;

        remove_all(data: null): number;

        reverse(): void;

        sort(compare_func: CompareDataFunc): void;
    }


    class RWLock {
        static $gtype: GObject.GType<RWLock>;

        // Constructors
        constructor(properties?: Partial<{}>);

        // Methods
        clear(): void;

        init(): void;

        reader_lock(): void;

        reader_trylock(): boolean;

        reader_unlock(): void;

        writer_lock(): void;

        writer_trylock(): boolean;

        writer_unlock(): void;
    }


    class Rand {
        static $gtype: GObject.GType<Rand>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): Rand;

        static new_with_seed(seed: number): Rand;

        static new_with_seed_array(seed: number, seed_length: number): Rand;

        // Methods
        copy(): Rand;

        double(): number;

        double_range(begin: number, end: number): number;

        free(): void;

        int(): number;

        int_range(begin: number, end: number): number;

        set_seed(seed: number): void;

        set_seed_array(seed: number, seed_length: number): void;
    }


    class RecMutex {
        static $gtype: GObject.GType<RecMutex>;

        // Constructors
        constructor(properties?: Partial<{}>);

        // Methods
        clear(): void;

        init(): void;

        lock(): void;

        trylock(): boolean;

        unlock(): void;
    }


    class Regex {
        static $gtype: GObject.GType<Regex>;

        // Constructors
        constructor(pattern: string, compile_options: RegexCompileFlags, match_options: RegexMatchFlags);

        static ["new"](pattern: string, compile_options: RegexCompileFlags, match_options: RegexMatchFlags): Regex;

        // Static methods
        static check_replacement(replacement: string): [boolean, boolean];

        static error_quark(): Quark;

        static escape_nul(string: string, length: number): string;

        static escape_string(string: string, length: number): string;

        static match_simple(pattern: string, string: string, compile_options: RegexCompileFlags, match_options: RegexMatchFlags): boolean;

        static split_simple(pattern: string, string: string, compile_options: RegexCompileFlags, match_options: RegexMatchFlags): string[];

        // Methods
        get_capture_count(): number;

        get_compile_flags(): RegexCompileFlags;

        get_has_cr_or_lf(): boolean;

        get_match_flags(): RegexMatchFlags;

        get_max_backref(): number;

        get_max_lookbehind(): number;

        get_pattern(): string;

        get_string_number(name: string): number;

        match(string: string, match_options: RegexMatchFlags): [boolean, MatchInfo | null];

        match_all(string: string, match_options: RegexMatchFlags): [boolean, MatchInfo | null];

        match_all_full(string: string, string_len: bigint | number, start_position: number, match_options: RegexMatchFlags): [boolean, MatchInfo | null];

        match_full(string: string, string_len: bigint | number, start_position: number, match_options: RegexMatchFlags): [boolean, MatchInfo | null];

        ref(): Regex;

        replace(string: string, string_len: bigint | number, start_position: number, replacement: string, match_options: RegexMatchFlags): string;

        replace_eval(string: string, string_len: bigint | number, start_position: number, match_options: RegexMatchFlags, _eval: RegexEvalCallback): string;

        replace_literal(string: string, string_len: bigint | number, start_position: number, replacement: string, match_options: RegexMatchFlags): string;

        split(string: string, match_options: RegexMatchFlags): string[];

        split_full(string: string, string_len: bigint | number, start_position: number, match_options: RegexMatchFlags, max_tokens: number): string[];

        unref(): void;
    }


    abstract class Relation {
        static $gtype: GObject.GType<Relation>;

        // Methods
        count(key: null, field: number): number;

        ["delete"](key: null, field: number): number;

        destroy(): void;

        print(): void;
    }


    class SList {
        static $gtype: GObject.GType<SList>;

        // Fields
        data: null;

        next: null[];

        // Constructors

        constructor(properties?: Partial<{
            data: null;
        }>);

        // Static methods
        static copy(list: never[]): null[];

        static free(list: never[]): void;

        static pop_allocator(): void;

        static push_allocator(allocator: Allocator): void;
    }


    class Scanner {
        static $gtype: GObject.GType<Scanner>;

        // Fields
        user_data: null;

        max_parse_errors: number;

        parse_errors: number;

        input_name: string;

        config: ScannerConfig;

        token: TokenType;

        line: number;

        position: number;

        next_token: TokenType;

        next_line: number;

        next_position: number;

        msg_handler: ScannerMsgFunc;

        // Methods
        cur_line(): number;

        cur_position(): number;

        cur_token(): TokenType;

        destroy(): void;

        eof(): boolean;

        get_next_token(): TokenType;

        input_file(input_fd: number): void;

        input_text(text: string, text_len: number): void;

        lookup_symbol(symbol: string): null;

        peek_next_token(): TokenType;

        scope_add_symbol(scope_id: number, symbol: string, value: null): void;

        scope_foreach_symbol(scope_id: number, func: HFunc): void;

        scope_lookup_symbol(scope_id: number, symbol: string): null;

        scope_remove_symbol(scope_id: number, symbol: string): void;

        set_scope(scope_id: number): number;

        sync_file_offset(): void;

        unexp_token(expected_token: TokenType, identifier_spec: string, symbol_spec: string, symbol_name: string, message: string, is_error: number): void;
    }


    class ScannerConfig {
        static $gtype: GObject.GType<ScannerConfig>;

        // Fields
        cset_skip_characters: string;

        cset_identifier_first: string;

        cset_identifier_nth: string;

        cpair_comment_single: string;

        case_sensitive: number;

        skip_comment_multi: number;

        skip_comment_single: number;

        scan_comment_multi: number;

        scan_identifier: number;

        scan_identifier_1char: number;

        scan_identifier_NULL: number;

        scan_symbols: number;

        scan_binary: number;

        scan_octal: number;

        scan_float: number;

        scan_hex: number;

        scan_hex_dollar: number;

        scan_string_sq: number;

        scan_string_dq: number;

        numbers_2_int: number;

        int_2_float: number;

        identifier_2_string: number;

        char_2_token: number;

        symbol_2_token: number;

        scope_0_fallback: number;

        store_int64: number;

        // Constructors

        constructor(properties?: Partial<{
            cset_skip_characters: string;
            cset_identifier_first: string;
            cset_identifier_nth: string;
            cpair_comment_single: string;
            case_sensitive: number;
            skip_comment_multi: number;
            skip_comment_single: number;
            scan_comment_multi: number;
            scan_identifier: number;
            scan_identifier_1char: number;
            scan_identifier_NULL: number;
            scan_symbols: number;
            scan_binary: number;
            scan_octal: number;
            scan_float: number;
            scan_hex: number;
            scan_hex_dollar: number;
            scan_string_sq: number;
            scan_string_dq: number;
            numbers_2_int: number;
            int_2_float: number;
            identifier_2_string: number;
            char_2_token: number;
            symbol_2_token: number;
            scope_0_fallback: number;
            store_int64: number;
        }>);
    }


    abstract class Sequence {
        static $gtype: GObject.GType<Sequence>;

        // Static methods
        static foreach_range(begin: SequenceIter, end: SequenceIter, func: Func): void;

        static get(iter: SequenceIter): null;

        static insert_before(iter: SequenceIter, data: null): SequenceIter;

        static move(src: SequenceIter, dest: SequenceIter): void;

        static move_range(dest: SequenceIter, begin: SequenceIter, end: SequenceIter): void;

        static range_get_midpoint(begin: SequenceIter, end: SequenceIter): SequenceIter;

        static remove(iter: SequenceIter): void;

        static remove_range(begin: SequenceIter, end: SequenceIter): void;

        static set(iter: SequenceIter, data: null): void;

        static sort_changed(iter: SequenceIter, cmp_func: CompareDataFunc): void;

        static sort_changed_iter(iter: SequenceIter, iter_cmp: SequenceIterCompareFunc): void;

        static swap(a: SequenceIter, b: SequenceIter): void;

        // Methods
        append(data: null): SequenceIter;

        foreach(func: Func): void;

        free(): void;

        get_begin_iter(): SequenceIter;

        get_end_iter(): SequenceIter;

        get_iter_at_pos(pos: number): SequenceIter;

        get_length(): number;

        insert_sorted(data: null, cmp_func: CompareDataFunc): SequenceIter;

        insert_sorted_iter(data: null, iter_cmp: SequenceIterCompareFunc): SequenceIter;

        is_empty(): boolean;

        lookup(data: null, cmp_func: CompareDataFunc): SequenceIter | null;

        lookup_iter(data: null, iter_cmp: SequenceIterCompareFunc): SequenceIter | null;

        prepend(data: null): SequenceIter;

        search(data: null, cmp_func: CompareDataFunc): SequenceIter;

        search_iter(data: null, iter_cmp: SequenceIterCompareFunc): SequenceIter;

        sort(cmp_func: CompareDataFunc): void;

        sort_iter(cmp_func: SequenceIterCompareFunc): void;
    }


    abstract class SequenceIter {
        static $gtype: GObject.GType<SequenceIter>;

        // Methods
        compare(b: SequenceIter): number;

        get_position(): number;

        get_sequence(): Sequence;

        is_begin(): boolean;

        is_end(): boolean;

        move(delta: number): SequenceIter;

        next(): SequenceIter;

        prev(): SequenceIter;
    }


    class Source {
        static $gtype: GObject.GType<Source>;

        // Constructors
        constructor(source_funcs: SourceFuncs, struct_size: number);

        static ["new"](source_funcs: SourceFuncs, struct_size: number): Source;

        // Static methods
        static remove(tag: number): boolean;

        static remove_by_funcs_user_data(funcs: SourceFuncs, user_data: null): boolean;

        static remove_by_user_data(user_data: null): boolean;

        static set_name_by_id(tag: number, name: string): void;

        // Methods
        add_child_source(child_source: Source): void;

        add_poll(fd: PollFD): void;

        add_unix_fd(fd: number, events: IOCondition): null;

        attach(context: MainContext | null): number;

        clear_ready_time(): void;

        destroy(): void;

        dup_context(): MainContext | null;

        get_can_recurse(): boolean;

        get_context(): MainContext | null;

        get_current_time(timeval: TimeVal): void;

        get_id(): number;

        get_name(): string | null;

        get_priority(): number;

        get_ready_time(): number;

        get_ready_time_ns(): [boolean, number];

        get_time(): number;

        get_time_ns(): number;

        is_destroyed(): boolean;

        modify_unix_fd(tag: never, new_events: IOCondition): void;

        query_unix_fd(tag: never): IOCondition;

        ref(): Source;

        remove_child_source(child_source: Source): void;

        remove_poll(fd: PollFD): void;

        remove_unix_fd(tag: never): void;

        set_callback(func: SourceFunc): void;

        set_callback_indirect(callback_data: null, callback_funcs: SourceCallbackFuncs): void;

        set_can_recurse(can_recurse: boolean): void;

        set_funcs(funcs: SourceFuncs): void;

        set_name(name: string): void;

        set_priority(priority: number): void;

        set_ready_time(ready_time: bigint | number): void;

        set_ready_time_ns(ready_time: bigint | number): void;

        set_static_name(name: string): void;

        unref(): void;
    }


    class SourceCallbackFuncs {
        static $gtype: GObject.GType<SourceCallbackFuncs>;
    }


    class SourceFuncs {
        static $gtype: GObject.GType<SourceFuncs>;

        // Fields
        prepare: SourceFuncsPrepareFunc;

        check: SourceFuncsCheckFunc;

        finalize: SourceFuncsFinalizeFunc;
    }


    abstract class SourcePrivate {
        static $gtype: GObject.GType<SourcePrivate>;
    }


    abstract class StatBuf {
        static $gtype: GObject.GType<StatBuf>;
    }


    class String {
        static $gtype: GObject.GType<String>;

        // Fields
        str: string;

        len: number;

        allocated_len: number;

        // Constructors
        constructor(init: string | null);

        static ["new"](init: string | null): String;

        static new_len(init: string, len: bigint | number): String;

        static new_take(init: string | null): String;

        static sized_new(dfl_size: bigint | number): String;

        // Methods
        append(val: string): String;

        append_c(c: number): String;

        append_len(val: string, len: bigint | number): String;

        append_unichar(wc: string): String;

        append_uri_escaped(unescaped: string, reserved_chars_allowed: string, allow_utf8: boolean): String;

        ascii_down(): String;

        ascii_up(): String;

        assign(rval: string): String;

        copy(): String;

        down(): String;

        equal(v2: String): boolean;

        erase(pos: bigint | number, len: bigint | number): String;

        free(free_segment: boolean): string | null;

        free_and_steal(): string;

        free_deep(): void;

        free_to_bytes(): Bytes;

        hash(): number;

        insert(pos: bigint | number, val: string): String;

        insert_c(pos: bigint | number, c: number): String;

        insert_len(pos: bigint | number, val: string, len: bigint | number): String;

        insert_unichar(pos: bigint | number, wc: string): String;

        overwrite(pos: bigint | number, val: string): String;

        overwrite_len(pos: bigint | number, val: string, len: bigint | number): String;

        prepend(val: string): String;

        prepend_c(c: number): String;

        prepend_len(val: string, len: bigint | number): String;

        prepend_unichar(wc: string): String;

        replace(find: string, replace: string, limit: number): number;

        set_size(len: bigint | number): String;

        truncate(len: bigint | number): String;

        up(): String;
    }


    abstract class StringChunk {
        static $gtype: GObject.GType<StringChunk>;

        // Methods
        clear(): void;

        free(): void;

        insert(string: string): string;

        insert_const(string: string): string;

        insert_len(string: string, len: bigint | number): string;
    }


    class StrvBuilder {
        static $gtype: GObject.GType<StrvBuilder>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](): StrvBuilder;

        // Methods
        add(value: string): void;

        addv(value: string[]): void;

        end(): string[];

        ref(): StrvBuilder;

        take(value: string): void;

        unref(): void;

        unref_to_strv(): string[];
    }


    abstract class TestCase {
        static $gtype: GObject.GType<TestCase>;

        // Methods
        free(): void;
    }


    class TestConfig {
        static $gtype: GObject.GType<TestConfig>;

        // Fields
        test_initialized: boolean;

        test_quick: boolean;

        test_perf: boolean;

        test_verbose: boolean;

        test_quiet: boolean;

        test_undefined: boolean;

        // Constructors

        constructor(properties?: Partial<{
            test_initialized: boolean;
            test_quick: boolean;
            test_perf: boolean;
            test_verbose: boolean;
            test_quiet: boolean;
            test_undefined: boolean;
        }>);
    }


    class TestLogBuffer {
        static $gtype: GObject.GType<TestLogBuffer>;

        // Methods
        free(): void;

        push(n_bytes: number, bytes: number): void;
    }


    class TestLogMsg {
        static $gtype: GObject.GType<TestLogMsg>;

        // Fields
        log_type: TestLogType;

        n_strings: number;

        strings: string;

        n_nums: number;

        // Methods
        free(): void;
    }


    abstract class TestSuite {
        static $gtype: GObject.GType<TestSuite>;

        // Methods
        add(test_case: TestCase): void;

        add_suite(nestedsuite: TestSuite): void;

        free(): void;
    }


    class Thread {
        static $gtype: GObject.GType<Thread>;

        // Constructors
        constructor(name: string | null, func: ThreadFunc);

        static ["new"](name: string | null, func: ThreadFunc): Thread;

        static try_new(name: string | null, func: ThreadFunc): Thread;

        // Static methods
        static error_quark(): Quark;

        static exit(retval: null): void;

        static self(): Thread;

        static ["yield"](): void;

        // Methods
        get_name(): string;

        join(): null;

        ref(): Thread;

        unref(): void;
    }


    class ThreadPool {
        static $gtype: GObject.GType<ThreadPool>;

        // Fields
        func: Func;

        user_data: null;

        exclusive: boolean;

        // Static methods
        static get_max_idle_time(): number;

        static get_max_unused_threads(): number;

        static get_num_unused_threads(): number;

        static set_max_idle_time(interval: number): void;

        static set_max_unused_threads(max_threads: number): void;

        static stop_unused_threads(): void;

        // Methods
        free(immediate: boolean, wait_: boolean): void;

        get_max_threads(): number;

        get_num_threads(): number;

        move_to_front(data: null): boolean;

        push(data: null): boolean;

        set_max_threads(max_threads: number): boolean;

        unprocessed(): number;
    }


    class TimeVal {
        static $gtype: GObject.GType<TimeVal>;

        // Fields
        tv_sec: number;

        tv_usec: number;

        // Static methods
        static from_iso8601(iso_date: string): [boolean, TimeVal];

        // Methods
        add(microseconds: bigint | number): void;

        to_iso8601(): string | null;
    }


    class TimeZone {
        static $gtype: GObject.GType<TimeZone>;

        // Constructors
        constructor(properties?: Partial<{}>);

        static ["new"](identifier: string | null): TimeZone;

        static new_identifier(identifier: string | null): TimeZone;

        static new_local(): TimeZone;

        static new_offset(seconds: number): TimeZone;

        static new_utc(): TimeZone;

        // Methods
        adjust_time(type: TimeType, time_: bigint | number): [number, number];

        find_interval(type: TimeType, time_: bigint | number): number;

        get_abbreviation(interval: number): string;

        get_identifier(): string;

        get_offset(interval: number): number;

        is_dst(interval: number): boolean;

        ref(): TimeZone;

        unref(): void;
    }


    abstract class Timer {
        static $gtype: GObject.GType<Timer>;

        // Methods
        ["continue"](): void;

        destroy(): void;

        elapsed(microseconds: bigint | number): number;

        is_active(): boolean;

        reset(): void;

        start(): void;

        stop(): void;
    }


    class TrashStack {
        static $gtype: GObject.GType<TrashStack>;

        // Static methods
        static height(stack_p: TrashStack): number;

        static peek(stack_p: TrashStack): null;

        static pop(stack_p: TrashStack): null;

        static push(stack_p: TrashStack, data_p: never): void;
    }


    class Tree {
        static $gtype: GObject.GType<Tree>;

        // Constructors
        constructor(key_compare_func: CompareFunc);

        static new_full(key_compare_func: CompareDataFunc): Tree;

        // Methods
        destroy(): void;

        foreach(func: TraverseFunc): void;

        foreach_node(func: TraverseNodeFunc): void;

        height(): number;

        insert(key: null, value: null): void;

        insert_node(key: null, value: null): TreeNode | null;

        lookup(key: null): null;

        lookup_extended(lookup_key: null): [boolean, null, null];

        lookup_node(key: null): TreeNode | null;

        lower_bound(key: null): TreeNode | null;

        nnodes(): number;

        node_first(): TreeNode | null;

        node_last(): TreeNode | null;

        ref(): Tree;

        remove(key: null): boolean;

        remove_all(): void;

        replace(key: null, value: null): void;

        replace_node(key: null, value: null): TreeNode | null;

        search(search_func: CompareFunc): null;

        search_node(search_func: CompareFunc): TreeNode | null;

        steal(key: null): boolean;

        traverse(traverse_func: TraverseFunc, traverse_type: TraverseType): void;

        unref(): void;

        upper_bound(key: null): TreeNode | null;
    }


    abstract class TreeNode {
        static $gtype: GObject.GType<TreeNode>;

        // Methods
        key(): null;

        next(): TreeNode | null;

        previous(): TreeNode | null;

        value(): null;
    }


    class Tuples {
        static $gtype: GObject.GType<Tuples>;

        // Fields
        len: number;

        // Constructors

        constructor(properties?: Partial<{
            len: number;
        }>);

        // Methods
        destroy(): void;

        index(index_: number, field: number): null;
    }


    abstract class Uri {
        static $gtype: GObject.GType<Uri>;

        // Static methods
        static build(flags: UriFlags, scheme: string, userinfo: string | null, host: string | null, port: number, path: string, query: string | null, fragment: string | null): Uri;

        static build_with_user(flags: UriFlags, scheme: string, user: string | null, password: string | null, auth_params: string | null, host: string | null, port: number, path: string, query: string | null, fragment: string | null): Uri;

        static error_quark(): Quark;

        static escape_bytes(unescaped: Uint8Array | string, reserved_chars_allowed: string | null): string;

        static escape_string(unescaped: string, reserved_chars_allowed: string | null, allow_utf8: boolean): string;

        static is_valid(uri_string: string, flags: UriFlags): boolean;

        static join(flags: UriFlags, scheme: string | null, userinfo: string | null, host: string | null, port: number, path: string, query: string | null, fragment: string | null): string;

        static join_with_user(flags: UriFlags, scheme: string | null, user: string | null, password: string | null, auth_params: string | null, host: string | null, port: number, path: string, query: string | null, fragment: string | null): string;

        static list_extract_uris(uri_list: string): string[];

        static parse(uri_string: string, flags: UriFlags): Uri;

        static parse_params(params: string, length: bigint | number, separators: string, flags: UriParamsFlags): { [key: string]: string };

        static parse_scheme(uri: string): string | null;

        static peek_scheme(uri: string): string | null;

        static resolve_relative(base_uri_string: string | null, uri_ref: string, flags: UriFlags): string;

        static split(uri_ref: string, flags: UriFlags): [boolean, string, string, string, number, string, string, string];

        static split_network(uri_string: string, flags: UriFlags): [boolean, string, string, number];

        static split_with_user(uri_ref: string, flags: UriFlags): [boolean, string, string, string, string, string, number, string, string, string];

        static unescape_bytes(escaped_string: string, length: bigint | number, illegal_characters: string | null): Bytes;

        static unescape_segment(escaped_string: string | null, escaped_string_end: string | null, illegal_characters: string | null): string | null;

        static unescape_string(escaped_string: string, illegal_characters: string | null): string | null;

        // Methods
        get_auth_params(): string | null;

        get_flags(): UriFlags;

        get_fragment(): string | null;

        get_host(): string | null;

        get_password(): string | null;

        get_path(): string;

        get_port(): number;

        get_query(): string | null;

        get_scheme(): string;

        get_user(): string | null;

        get_userinfo(): string | null;

        parse_relative(uri_ref: string, flags: UriFlags): Uri;

        ref(): Uri;

        to_string(): string;

        to_string_partial(flags: UriHideFlags): string;

        unref(): void;
    }


    class UriParamsIter {
        static $gtype: GObject.GType<UriParamsIter>;

        // Constructors
        constructor(properties?: Partial<{}>);

        // Methods
        init(params: string, length: bigint | number, separators: string, flags: UriParamsFlags): void;

        next(): [boolean, string, string];
    }


    class DoubleIEEE754 {
        static $gtype: GObject.GType<DoubleIEEE754>;

        // Fields
        v_double: number;

        // Constructors

        constructor(properties?: Partial<{
            v_double: number;
        }>);
    }


    class FloatIEEE754 {
        static $gtype: GObject.GType<FloatIEEE754>;

        // Fields
        v_float: number;

        // Constructors

        constructor(properties?: Partial<{
            v_float: number;
        }>);
    }


    class Mutex {
        static $gtype: GObject.GType<Mutex>;

        // Constructors
        constructor(properties?: Partial<{}>);

        // Methods
        clear(): void;

        free(): void;

        init(): void;

        lock(): void;

        trylock(): boolean;

        unlock(): void;
    }


    class TokenValue {
        static $gtype: GObject.GType<TokenValue>;

        // Fields
        v_symbol: null;

        v_identifier: string;

        v_binary: number;

        v_octal: number;

        v_int: number;

        v_int64: number;

        v_float: number;

        v_hex: number;

        v_string: string;

        v_comment: string;

        v_char: number;

        v_error: number;
    }


    type DateDay = number;

    type DateYear = number;

    type MainContextPusher = void;

    type MutexLocker = void;

    type Pid = number;

    type Quark = number;

    type RWLockReaderLocker = void;

    type RWLockWriterLocker = void;

    type RecMutexLocker = void;

    type RefString = number;

    type Strv = string;

    type Time = number;

    type TimeSpan = bigint | number;

    function log_structured(logDomain: any, logLevel: any, stringFields: any): any;

    function strstrip(str: string): string;

    const __name__: string;

    const __version__: string;

}

export default GLib;

}

declare module 'gi://GLib' {
    import GLib20 from 'gi://GLib?version=2.0';
    export default GLib20;
}
// END
