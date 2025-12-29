/**
 * Objects advanced operations
 *
 * Higher-order object transformations
 */

import type { Node, nodeInputs } from '../core'

/**
 * MapValuesNode - Transform all values in an object
 *
 * @example
 * type Input = { a: 1, b: 2 }
 * type Outputs = Exec<MapValuesNode<DoubleNode>, { in: Input }>
 * // { out: { a: 2, b: 4 } }
 */
export interface MapValuesNode<Fn extends Node> extends Node {
  [nodeInputs]: { in: Record<string, unknown> }
  inputs: { in: Record<string, unknown> }
  outputs: this[nodeInputs]['in'] extends infer Obj extends Record<string, unknown>
    ? {
        out: {
          [K in keyof Obj]: (Fn & { [nodeInputs]: { in: Obj[K] } })['outputs']['out']
        }
      }
    : never
}

/**
 * MapKeysNode - Transform all keys in an object
 *
 * @example
 * type Input = { a: 1, b: 2 }
 * type Outputs = Exec<MapKeysNode<UppercaseNode>, { in: Input }>
 * // { out: { A: 1, B: 2 } }
 */
export interface MapKeysNode<Fn extends Node> extends Node {
  [nodeInputs]: { in: Record<string, unknown> }
  inputs: { in: Record<string, unknown> }
  outputs: this[nodeInputs]['in'] extends infer Obj extends Record<string, unknown>
    ? {
        out: {
          [K in keyof Obj as (Fn & { [nodeInputs]: { in: K } })['outputs']['out'] & string]: Obj[K]
        }
      }
    : never
}

/**
 * KeysNode - Get object keys as tuple
 */
export interface KeysNode extends Node {
  [nodeInputs]: { in: Record<string, unknown> }
  inputs: { in: Record<string, unknown> }
  outputs: this[nodeInputs]['in'] extends infer Obj extends Record<string, unknown>
    ? { out: (keyof Obj)[] }
    : never
}

/**
 * ValuesNode - Get object values as tuple
 */
export interface ValuesNode extends Node {
  [nodeInputs]: { in: Record<string, unknown> }
  inputs: { in: Record<string, unknown> }
  outputs: this[nodeInputs]['in'] extends infer Obj extends Record<string, unknown>
    ? { out: Obj[keyof Obj][] }
    : never
}

/**
 * EntriesNode - Convert object to entries
 */
export interface EntriesNode extends Node {
  [nodeInputs]: { in: Record<string, unknown> }
  inputs: { in: Record<string, unknown> }
  outputs: this[nodeInputs]['in'] extends infer Obj extends Record<string, unknown>
    ? {
        out: {
          [K in keyof Obj]: [K, Obj[K]]
        }[keyof Obj][]
      }
    : never
}

/**
 * FromEntriesNode - Convert entries to object
 */
export interface FromEntriesNode extends Node {
  [nodeInputs]: { in: readonly [PropertyKey, unknown][] }
  inputs: { in: readonly [PropertyKey, unknown][] }
  outputs: this[nodeInputs]['in'] extends infer Entries extends readonly [PropertyKey, unknown][]
    ? {
        out: {
          [E in Entries[number] as E extends [infer K extends PropertyKey, unknown]
            ? K
            : never]: E extends [PropertyKey, infer V] ? V : never
        }
      }
    : never
}

/**
 * Exported node constructors
 */
export type MapValues<Fn extends Node> = MapValuesNode<Fn>
export type MapKeys<Fn extends Node> = MapKeysNode<Fn>
export type Keys = KeysNode
export type Values = ValuesNode
export type Entries = EntriesNode
export type FromEntries = FromEntriesNode
