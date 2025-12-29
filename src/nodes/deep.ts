/**
 * Deep transformation nodes
 *
 * Apply transformations recursively through nested object structures.
 * These nodes traverse the entire type tree and apply transformations
 * at every level.
 */

import type { Node, nodeInputs } from '../core'

/**
 * DeepPartialNode - Recursively makes all properties optional
 *
 * Unlike standard Partial which only affects top-level properties,
 * this node makes ALL nested properties optional as well.
 *
 * @example
 * type User = {
 *   profile: {
 *     name: string
 *     settings: { theme: string }
 *   }
 * }
 * type PartialUser = Flow<User, [DeepPartial]>
 * // Result: {
 * //   profile?: {
 * //     name?: string
 * //     settings?: { theme?: string }
 * //   }
 * // }
 */
export interface DeepPartialNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends object
      ? { out: { [P in keyof T]?: DeepPartialImpl<T[P]> } }
      : { out: T }
    : never
}

type DeepPartialImpl<T> = T extends object
  ? { [P in keyof T]?: DeepPartialImpl<T[P]> }
  : T

/**
 * DeepReadonlyNode - Recursively makes all properties readonly
 *
 * Makes the entire type tree immutable, not just the top level.
 *
 * @example
 * type Config = {
 *   api: {
 *     endpoint: string
 *     timeout: number
 *   }
 * }
 * type ImmutableConfig = Flow<Config, [DeepReadonly]>
 * // All levels become readonly
 */
export interface DeepReadonlyNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends object
      ? { out: { readonly [P in keyof T]: DeepReadonlyImpl<T[P]> } }
      : { out: T }
    : never
}

type DeepReadonlyImpl<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonlyImpl<T[P]> }
  : T

/**
 * DeepRequiredNode - Recursively makes all properties required
 *
 * Removes all optional modifiers at every level of the type tree.
 *
 * @example
 * type User = {
 *   profile?: {
 *     name?: string
 *   }
 * }
 * type RequiredUser = Flow<User, [DeepRequired]>
 * // All '?' removed at all levels
 */
export interface DeepRequiredNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends object
      ? { out: { [P in keyof T]-?: DeepRequiredImpl<T[P]> } }
      : { out: T }
    : never
}

type DeepRequiredImpl<T> = T extends object
  ? { [P in keyof T]-?: DeepRequiredImpl<T[P]> }
  : T

/**
 * Exported node constructors
 */
export type DeepPartial = DeepPartialNode
export type DeepReadonly = DeepReadonlyNode
export type DeepRequired = DeepRequiredNode
