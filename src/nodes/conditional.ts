/**
 * Conditional type transformation nodes
 *
 * Implements branching logic in type flows, similar to if-else statements
 * but at the type level.
 */

import type { Node, nodeInputs } from '../core'

/**
 * IdentityNode - Returns input type unchanged
 *
 * Useful as a no-op node or default branch in conditionals.
 *
 * @example
 * type Same<T> = Flow<T, [Identity]>
 * // T → T (no change)
 */
export interface IdentityNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: T }
    : never
}

/**
 * Exported identity node
 */
export type Identity = IdentityNode
