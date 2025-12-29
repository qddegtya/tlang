/**
 * Tuple transformation nodes for tlang
 *
 * Operations on tuple types (arrays with fixed length and types).
 * These are essential for list processing at the type level.
 */

import type { Node, nodeInputs } from '../core'

/**
 * MapNode - Transform each element in a tuple
 *
 * @template Fn - The transformation function to apply to each element
 *
 * @example
 * type Numbers = [1, 2, 3]
 * type Strings = Flow<Numbers, [Tuples.Map<ToString>]>
 * // Result: ["1", "2", "3"]
 */
export interface MapNode<Fn extends Node> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: MapImpl<T, Fn> }
    : never
}

type MapImpl<Tuple, Fn extends Node> =
  Tuple extends readonly [infer Head, ...infer Tail]
    ? [(Fn & { [nodeInputs]: { in: Head } })['outputs']['out'], ...MapImpl<Tail, Fn>]
    : []

/**
 * FilterNode - Keep only elements that satisfy a predicate
 *
 * @template Fn - Predicate function (should return boolean)
 *
 * @example
 * type Mixed = [1, "a", 2, "b", 3]
 * type Numbers = Flow<Mixed, [Tuples.Filter<IsNumber>]>
 * // Result: [1, 2, 3]
 */
export interface FilterNode<Fn extends Node> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: FilterImpl<T, Fn> }
    : never
}

type FilterImpl<Tuple, Fn extends Node> =
  Tuple extends readonly [infer Head, ...infer Tail]
    ? (Fn & { [nodeInputs]: { in: Head } })['outputs']['out'] extends true
      ? [Head, ...FilterImpl<Tail, Fn>]
      : FilterImpl<Tail, Fn>
    : []

/**
 * HeadNode - Get the first element of a tuple
 *
 * @example
 * type Result = Flow<[1, 2, 3], [Tuples.Head]>
 * // Result: 1
 */
export interface HeadNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends readonly [infer Head, ...unknown[]]
      ? { out: Head }
      : { out: never }
    : never
}

/**
 * TailNode - Get all elements except the first
 *
 * @example
 * type Result = Flow<[1, 2, 3], [Tuples.Tail]>
 * // Result: [2, 3]
 */
export interface TailNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends readonly [unknown, ...infer Tail]
      ? { out: Tail }
      : { out: [] }
    : never
}

/**
 * LastNode - Get the last element of a tuple
 *
 * @example
 * type Result = Flow<[1, 2, 3], [Tuples.Last]>
 * // Result: 3
 */
export interface LastNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends readonly [...unknown[], infer Last]
      ? { out: Last }
      : { out: never }
    : never
}

/**
 * AtNode - Get element at specific index
 *
 * @template N - Index number
 *
 * @example
 * type Result = Flow<[1, 2, 3], [Tuples.At<1>]>
 * // Result: 2
 */
export interface AtNode<N extends number> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends readonly unknown[]
      ? { out: T[N] }
      : { out: never }
    : never
}

/**
 * ConcatNode - Concatenate two tuples
 *
 * @template Other - The tuple to append
 *
 * @example
 * type Result = Flow<[1, 2], [Tuples.Concat<[3, 4]>]>
 * // Result: [1, 2, 3, 4]
 */
export interface ConcatNode<Other extends readonly unknown[]> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends readonly unknown[]
      ? { out: [...T, ...Other] }
      : { out: never }
    : never
}

/**
 * ReverseNode - Reverse a tuple
 *
 * @example
 * type Result = Flow<[1, 2, 3], [Tuples.Reverse]>
 * // Result: [3, 2, 1]
 */
export interface ReverseNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: ReverseImpl<T> }
    : never
}

type ReverseImpl<Tuple> =
  Tuple extends readonly [infer Head, ...infer Tail]
    ? [...ReverseImpl<Tail>, Head]
    : []

/**
 * ToUnionNode - Convert tuple to union
 *
 * @example
 * type Result = Flow<[1, 2, 3], [Tuples.ToUnion]>
 * // Result: 1 | 2 | 3
 */
export interface ToUnionNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends readonly (infer U)[]
      ? { out: U }
      : { out: never }
    : never
}

/**
 * ToIntersectionNode - Convert tuple to intersection
 *
 * @example
 * type Result = Flow<[{ a: 1 }, { b: 2 }], [Tuples.ToIntersection]>
 * // Result: { a: 1 } & { b: 2 }
 */
export interface ToIntersectionNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: ToIntersectionImpl<T> }
    : never
}

type ToIntersectionImpl<Tuple> =
  Tuple extends readonly [infer Head, ...infer Tail]
    ? Head & ToIntersectionImpl<Tail>
    : unknown

/**
 * LengthNode - Get tuple length
 *
 * @example
 * type Result = Flow<[1, 2, 3], [Tuples.Length]>
 * // Result: 3
 */
export interface LengthNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends readonly unknown[]
      ? { out: T['length'] }
      : { out: never }
    : never
}

/**
 * IsEmptyNode - Check if tuple is empty
 *
 * @example
 * type Result = Flow<[], [Tuples.IsEmpty]>
 * // Result: true
 */
export interface IsEmptyNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends readonly []
      ? { out: true }
      : { out: false }
    : never
}

/**
 * PrependNode - Add element to beginning
 *
 * @template Element - Element to prepend
 *
 * @example
 * type Result = Flow<[2, 3], [Tuples.Prepend<1>]>
 * // Result: [1, 2, 3]
 */
export interface PrependNode<Element> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends readonly unknown[]
      ? { out: [Element, ...T] }
      : { out: never }
    : never
}

/**
 * AppendNode - Add element to end
 *
 * @template Element - Element to append
 *
 * @example
 * type Result = Flow<[1, 2], [Tuples.Append<3>]>
 * // Result: [1, 2, 3]
 */
export interface AppendNode<Element> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends readonly unknown[]
      ? { out: [...T, Element] }
      : { out: never }
    : never
}

/**
 * JoinNode - Join tuple elements into string
 *
 * @template Sep - Separator string
 *
 * @example
 * type Result = Flow<["a", "b", "c"], [Tuples.Join<"-">]>
 * // Result: "a-b-c"
 */
export interface JoinNode<Sep extends string = ""> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: JoinImpl<T, Sep> }
    : never
}

type JoinImpl<Tuple, Sep extends string> =
  Tuple extends readonly [infer Head extends string, ...infer Tail]
    ? Tail extends readonly []
      ? Head
      : Tail extends readonly string[]
        ? `${Head}${Sep}${JoinImpl<Tail, Sep>}`
        : Head
    : ""

/**
 * ReduceNode - Reduce tuple to single value
 *
 * @template Fn - Reducer function (acc, current) => acc
 * @template Init - Initial accumulator value
 *
 * @example
 * type Sum = Flow<[1, 2, 3], [Tuples.Reduce<Add, 0>]>
 * // Result: 6
 */
export interface ReduceNode<Fn extends Node, Init> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: ReduceImpl<T, Fn, Init> }
    : never
}

type ReduceImpl<Tuple, Fn extends Node, Acc> =
  Tuple extends readonly [infer Head, ...infer Tail]
    ? ReduceImpl<Tail, Fn, (Fn & { [nodeInputs]: { in: [Acc, Head] } })['outputs']['out']>
    : Acc

/**
 * Exported node constructors
 */
export type Map<Fn extends Node> = MapNode<Fn>
export type Filter<Fn extends Node> = FilterNode<Fn>
export type Head = HeadNode
export type Tail = TailNode
export type Last = LastNode
export type At<N extends number> = AtNode<N>
export type Concat<Other extends readonly unknown[]> = ConcatNode<Other>
export type Reverse = ReverseNode
export type ToUnion = ToUnionNode
export type ToIntersection = ToIntersectionNode
export type Length = LengthNode
export type IsEmpty = IsEmptyNode
export type Prepend<Element> = PrependNode<Element>
export type Append<Element> = AppendNode<Element>
export type Join<Sep extends string = ""> = JoinNode<Sep>
export type Reduce<Fn extends Node, Init> = ReduceNode<Fn, Init>
