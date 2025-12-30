/**
 * Arithmetic nodes for multi-port typeflow operations
 *
 * These demonstrate the power of FBP-style multi-input nodes
 * compared to HotScript's single-parameter approach
 */

import type { Node, nodeInputs } from '../core'

// Helper: Build tuple of specific length (tail recursive)
type BuildTuple<N extends number, Acc extends unknown[] = []> =
  Acc['length'] extends N
    ? Acc
    : BuildTuple<N, [...Acc, unknown]>

/**
 * AddNode - Two-input addition node
 *
 * This is the FBP way: multiple named inputs!
 * Key: outputs is a simple property whose VALUE is an object type
 */
export interface AddNode extends Node {
  [nodeInputs]: { a: number; b: number }
  inputs: { a: number; b: number }
  outputs: [this[nodeInputs]['a'], this[nodeInputs]['b']] extends [infer A extends number, infer B extends number]
    ? { sum: [...BuildTuple<A>, ...BuildTuple<B>]['length'] & number }
    : never
}

export interface DoubleNode extends Node {
  [nodeInputs]: { in: number }
  inputs: { in: number }
  outputs: this[nodeInputs]['in'] extends infer N extends number
    ? { out: [...BuildTuple<N>, ...BuildTuple<N>]['length'] & number }
    : never
}

export interface IncrementNode extends Node {
  [nodeInputs]: { in: number }
  inputs: { in: number }
  outputs: this[nodeInputs]['in'] extends infer N extends number
    ? { out: [...BuildTuple<N>, unknown]['length'] & number }
    : never
}

/**
 * SplitNode - One input, multiple outputs
 *
 * Shows how FBP nodes can have multiple outputs
 */
export interface SplitNode extends Node {
  [nodeInputs]: { value: number }
  inputs: { value: number }
  outputs: this[nodeInputs] extends { value: infer V extends number }
    ? {
        original: V
        doubled: [...BuildTuple<V>, ...BuildTuple<V>]['length'] & number
      }
    : never
}
