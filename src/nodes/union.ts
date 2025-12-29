/**
 * Union type transformation nodes
 *
 * Special nodes for working with union types (A | B | C).
 * Union types are distributed over these operations.
 */

import type { Node, nodeInputs } from '../core'

/**
 * UnionKeysNode - Extract all possible keys from a union
 *
 * @example
 * type Shape = { type: 'circle'; radius: number } | { type: 'square'; size: number }
 * type Keys = Flow<Shape, [UnionKeys]>
 * // Result: 'type' | 'radius' | 'size'
 */
export interface UnionKeysNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: keyof T }
    : never
}

/**
 * UnionToIntersectionNode - Convert union to intersection
 *
 * Converts A | B | C to A & B & C
 *
 * @example
 * type Union = { a: string } | { b: number }
 * type Intersection = Flow<Union, [UnionToIntersection]>
 * // Result: { a: string } & { b: number }
 */
export interface UnionToIntersectionNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? (T extends unknown ? (k: T) => void : never) extends (k: infer I) => void
      ? { out: I }
      : { out: never }
    : never
}

/**
 * ExcludeUnionNode - Remove specific types from a union
 *
 * @template Excluded - Types to remove from the union
 *
 * @example
 * type Mixed = string | number | null
 * type NonNull = Flow<Mixed, [ExcludeUnion<null>]>
 * // Result: string | number
 */
export interface ExcludeUnionNode<Excluded> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: globalThis.Exclude<T, Excluded> }
    : never
}

/**
 * ExtractUnionNode - Keep only specific types from a union
 *
 * @template Extracted - Types to extract from the union
 *
 * @example
 * type Mixed = string | number | boolean
 * type Numeric = Flow<Mixed, [ExtractUnion<number>]>
 * // Result: number
 */
export interface ExtractUnionNode<Extracted> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: globalThis.Extract<T, Extracted> }
    : never
}

/**
 * UnionMapNode - Map a transformation over each member of a union
 *
 * @template Fn - Node to apply to each union member
 *
 * @example
 * type Union = 1 | 2 | 3
 * type Result = Exec<UnionMapNode<DoubleNode>, { in: Union }>
 * // { out: 2 | 4 | 6 }
 */
export interface UnionMapNode<Fn extends Node> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? {
        out: T extends unknown
          ? (Fn & { [nodeInputs]: { in: T } })['outputs']['out']
          : never
      }
    : never
}

/**
 * Exported node constructors
 */
export type UnionKeys = UnionKeysNode
export type UnionToIntersection = UnionToIntersectionNode
export type ExcludeUnion<Excluded> = ExcludeUnionNode<Excluded>
export type ExtractUnion<Extracted> = ExtractUnionNode<Extracted>
export type UnionMap<Fn extends Node> = UnionMapNode<Fn>
