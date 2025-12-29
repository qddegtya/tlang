/**
 * String transformation nodes for tlang
 *
 * Operations on string types for text manipulation at the type level.
 * Inspired by HotScript's Strings module.
 */

import type { Node, nodeInputs } from '../core'

/**
 * Stringifiable - Types that can be converted to string
 */
export type Stringifiable =
  | string
  | number
  | boolean
  | bigint
  | null
  | undefined

/**
 * LengthNode - Get the length of a string
 *
 * @example
 * type Result = Flow<"abc", [Strings.Length]>
 * // Result: 3
 *
 * @warning Does not work with emojis since they are multiple characters
 */
export interface LengthNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends string
      ? { out: LengthImpl<T> }
      : { out: never }
    : never
}

type LengthImpl<S extends string, Acc extends unknown[] = []> =
  S extends `${string}${infer Rest}`
    ? LengthImpl<Rest, [...Acc, unknown]>
    : Acc['length']

/**
 * SplitNode - Split a string into a tuple
 *
 * @template Sep - The separator to split on
 *
 * @example
 * type Result = Flow<"a,b,c", [Strings.Split<",">]>
 * // Result: ["a", "b", "c"]
 *
 * @warning Using empty separator with emojis will destroy the emoji
 */
export interface SplitNode<Sep extends string> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends string
      ? { out: SplitImpl<T, Sep> }
      : { out: never }
    : never
}

type SplitImpl<S extends string, Sep extends string> =
  Sep extends ''
    ? StringToTuple<S>
    : S extends `${infer First}${Sep}${infer Rest}`
      ? [First, ...SplitImpl<Rest, Sep>]
      : S extends ''
        ? []
        : [S]

/**
 * ToTupleNode - Convert string to tuple of characters
 *
 * @example
 * type Result = Flow<"abc", [Strings.ToTuple]>
 * // Result: ["a", "b", "c"]
 *
 * @warning Does not work with emojis since they are multiple characters
 */
export interface ToTupleNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends string
      ? { out: StringToTuple<T> }
      : { out: never }
    : never
}

type StringToTuple<S extends string, Acc extends string[] = []> =
  S extends `${infer First}${infer Rest}`
    ? StringToTuple<Rest, [...Acc, First]>
    : Acc

/**
 * ToStringNode - Convert stringifiable to string
 *
 * @example
 * type Result = Flow<123, [Strings.ToString]>
 * // Result: "123"
 */
export interface ToStringNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: `${Extract<T, Stringifiable>}` }
    : never
}

/**
 * ToNumberNode - Convert string to number or bigint
 *
 * @example
 * type Result = Flow<"123", [Strings.ToNumber]>
 * // Result: 123
 */
export interface ToNumberNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends `${infer N extends number | bigint}`
      ? { out: N }
      : { out: never }
    : never
}

/**
 * PrependNode - Prepend string to input
 *
 * @template Start - String to prepend
 *
 * @example
 * type Result = Flow<"def", [Strings.Prepend<"abc">]>
 * // Result: "abcdef"
 */
export interface PrependNode<Start extends string> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: `${Start}${Extract<T, Stringifiable>}` }
    : never
}

/**
 * AppendNode - Append string to input
 *
 * @template End - String to append
 *
 * @example
 * type Result = Flow<"abc", [Strings.Append<"def">]>
 * // Result: "abcdef"
 */
export interface AppendNode<End extends string> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: `${Extract<T, Stringifiable>}${End}` }
    : never
}

/**
 * UppercaseNode - Transform string to uppercase
 *
 * @example
 * type Result = Flow<"abc", [Strings.Uppercase]>
 * // Result: "ABC"
 */
export interface UppercaseNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: globalThis.Uppercase<Extract<T, string>> }
    : never
}

/**
 * LowercaseNode - Transform string to lowercase
 *
 * @example
 * type Result = Flow<"ABC", [Strings.Lowercase]>
 * // Result: "abc"
 */
export interface LowercaseNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: globalThis.Lowercase<Extract<T, string>> }
    : never
}

/**
 * CapitalizeNode - Capitalize first character
 *
 * @example
 * type Result = Flow<"abc", [Strings.Capitalize]>
 * // Result: "Abc"
 */
export interface CapitalizeNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: globalThis.Capitalize<Extract<T, string>> }
    : never
}

/**
 * UncapitalizeNode - Uncapitalize first character
 *
 * @example
 * type Result = Flow<"ABC", [Strings.Uncapitalize]>
 * // Result: "aBC"
 */
export interface UncapitalizeNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: globalThis.Uncapitalize<Extract<T, string>> }
    : never
}

/**
 * TrimNode - Trim whitespace from both sides
 *
 * @template Sep - Separator to trim (default: " ")
 *
 * @example
 * type Result = Flow<"  abc  ", [Strings.Trim]>
 * // Result: "abc"
 */
export interface TrimNode<Sep extends string = ' '> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends string
      ? { out: TrimImpl<T, Sep> }
      : { out: never }
    : never
}

type TrimImpl<S extends string, Sep extends string> =
  TrimLeftImpl<TrimRightImpl<S, Sep>, Sep>

type TrimLeftImpl<S extends string, Sep extends string> =
  S extends `${Sep}${infer Rest}`
    ? TrimLeftImpl<Rest, Sep>
    : S

type TrimRightImpl<S extends string, Sep extends string> =
  S extends `${infer Rest}${Sep}`
    ? TrimRightImpl<Rest, Sep>
    : S

/**
 * TrimLeftNode - Trim whitespace from left side
 *
 * @template Sep - Separator to trim (default: " ")
 *
 * @example
 * type Result = Flow<"  abc", [Strings.TrimLeft]>
 * // Result: "abc"
 */
export interface TrimLeftNode<Sep extends string = ' '> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends string
      ? { out: TrimLeftImpl<T, Sep> }
      : { out: never }
    : never
}

/**
 * TrimRightNode - Trim whitespace from right side
 *
 * @template Sep - Separator to trim (default: " ")
 *
 * @example
 * type Result = Flow<"abc  ", [Strings.TrimRight]>
 * // Result: "abc"
 */
export interface TrimRightNode<Sep extends string = ' '> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends string
      ? { out: TrimRightImpl<T, Sep> }
      : { out: never }
    : never
}

/**
 * ReplaceNode - Replace all occurrences of substring
 *
 * @template From - Substring to replace
 * @template To - Replacement string
 *
 * @example
 * type Result = Flow<"a.b.c", [Strings.Replace<".", "/">]>
 * // Result: "a/b/c"
 */
export interface ReplaceNode<From extends string, To extends string> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends string
      ? { out: ReplaceImpl<T, From, To> }
      : { out: never }
    : never
}

type ReplaceImpl<S extends string, From extends string, To extends string> =
  From extends ''
    ? S
    : S extends `${infer Head}${From}${infer Tail}`
      ? `${Head}${To}${ReplaceImpl<Tail, From, To>}`
      : S

/**
 * RepeatNode - Repeat string N times
 *
 * @template N - Number of times to repeat
 *
 * @example
 * type Result = Flow<"abc", [Strings.Repeat<3>]>
 * // Result: "abcabcabc"
 */
export interface RepeatNode<N extends number> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends string
      ? { out: RepeatImpl<T, N> }
      : { out: never }
    : never
}

type RepeatImpl<
  S extends string,
  N extends number,
  Acc extends string = '',
  Count extends unknown[] = []
> = Count['length'] extends N
  ? Acc
  : RepeatImpl<S, N, `${Acc}${S}`, [...Count, unknown]>

/**
 * StartsWithNode - Check if string starts with substring
 *
 * @template Prefix - Prefix to check for
 *
 * @example
 * type Result = Flow<"abcdef", [Strings.StartsWith<"abc">]>
 * // Result: true
 */
export interface StartsWithNode<Prefix extends string> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends `${Prefix}${string}`
      ? { out: true }
      : { out: false }
    : never
}

/**
 * EndsWithNode - Check if string ends with substring
 *
 * @template Suffix - Suffix to check for
 *
 * @example
 * type Result = Flow<"abcdef", [Strings.EndsWith<"def">]>
 * // Result: true
 */
export interface EndsWithNode<Suffix extends string> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends `${string}${Suffix}`
      ? { out: true }
      : { out: false }
    : never
}

/**
 * IncludesNode - Check if string contains substring
 *
 * @template Search - Substring to search for
 *
 * @example
 * type Result = Flow<"abcdef", [Strings.Includes<"cde">]>
 * // Result: true
 */
export interface IncludesNode<Search extends string> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends string
      ? T extends `${string}${Search}${string}`
        ? { out: true }
        : { out: false }
      : { out: false }
    : never
}

/**
 * CamelCaseNode - Convert to camelCase
 *
 * @example
 * type Result = Flow<"hello_world", [Strings.CamelCase]>
 * // Result: "helloWorld"
 */
export interface CamelCaseNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends string
      ? { out: CamelCaseImpl<T> }
      : { out: never }
    : never
}

type CamelCaseImpl<S extends string> =
  S extends `${infer First}_${infer Rest}`
    ? `${globalThis.Lowercase<First>}${CapitalizeWords<Rest>}`
    : S extends `${infer First}-${infer Rest}`
      ? `${globalThis.Lowercase<First>}${CapitalizeWords<Rest>}`
      : S extends `${infer First} ${infer Rest}`
        ? `${globalThis.Lowercase<First>}${CapitalizeWords<Rest>}`
        : globalThis.Uncapitalize<S>

type CapitalizeWords<S extends string> =
  S extends `${infer First}_${infer Rest}`
    ? `${globalThis.Capitalize<globalThis.Lowercase<First>>}${CapitalizeWords<Rest>}`
    : S extends `${infer First}-${infer Rest}`
      ? `${globalThis.Capitalize<globalThis.Lowercase<First>>}${CapitalizeWords<Rest>}`
      : S extends `${infer First} ${infer Rest}`
        ? `${globalThis.Capitalize<globalThis.Lowercase<First>>}${CapitalizeWords<Rest>}`
        : globalThis.Capitalize<globalThis.Lowercase<S>>

/**
 * SnakeCaseNode - Convert to snake_case
 *
 * @example
 * type Result = Flow<"helloWorld", [Strings.SnakeCase]>
 * // Result: "hello_world"
 */
export interface SnakeCaseNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends string
      ? { out: SnakeCaseImpl<T> }
      : { out: never }
    : never
}

type SnakeCaseImpl<S extends string, IsFirst extends boolean = true> =
  S extends `${infer First}${infer Rest}`
    ? First extends globalThis.Uppercase<First>
      ? First extends globalThis.Lowercase<First>
        ? `${First}${SnakeCaseImpl<Rest, false>}`
        : IsFirst extends true
          ? `${globalThis.Lowercase<First>}${SnakeCaseImpl<Rest, false>}`
          : `_${globalThis.Lowercase<First>}${SnakeCaseImpl<Rest, false>}`
      : `${First}${SnakeCaseImpl<Rest, false>}`
    : S

/**
 * KebabCaseNode - Convert to kebab-case
 *
 * @example
 * type Result = Flow<"helloWorld", [Strings.KebabCase]>
 * // Result: "hello-world"
 */
export interface KebabCaseNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends string
      ? { out: KebabCaseImpl<T> }
      : { out: never }
    : never
}

type KebabCaseImpl<S extends string> =
  ReplaceImpl<SnakeCaseImpl<S>, '_', '-'>

/**
 * Exported node constructors
 */
export type Length = LengthNode
export type Split<Sep extends string> = SplitNode<Sep>
export type ToTuple = ToTupleNode
export type ToString = ToStringNode
export type ToNumber = ToNumberNode
export type Prepend<Start extends string> = PrependNode<Start>
export type Append<End extends string> = AppendNode<End>
export type Uppercase = UppercaseNode
export type Lowercase = LowercaseNode
export type Capitalize = CapitalizeNode
export type Uncapitalize = UncapitalizeNode
export type Trim<Sep extends string = ' '> = TrimNode<Sep>
export type TrimLeft<Sep extends string = ' '> = TrimLeftNode<Sep>
export type TrimRight<Sep extends string = ' '> = TrimRightNode<Sep>
export type Replace<From extends string, To extends string> = ReplaceNode<From, To>
export type Repeat<N extends number> = RepeatNode<N>
export type StartsWith<Prefix extends string> = StartsWithNode<Prefix>
export type EndsWith<Suffix extends string> = EndsWithNode<Suffix>
export type Includes<Search extends string> = IncludesNode<Search>
export type CamelCase = CamelCaseNode
export type SnakeCase = SnakeCaseNode
export type KebabCase = KebabCaseNode
