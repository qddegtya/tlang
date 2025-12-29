/**
 * Match pattern matching
 *
 * Type-level pattern matching with extractors
 */

import type { Node, nodeInputs } from '../core'

/**
 * With clause - pattern and handler pair
 */
export type With<Pattern, Handler extends Node> = {
  pattern: Pattern
  handler: Handler
}

/**
 * DoesMatch - Check if value matches pattern
 */
type DoesMatch<Value, Pattern> = Value extends Pattern ? true : false

/**
 * MatchNode - Pattern matching with multiple clauses
 *
 * @example
 * type Result = Exec<MatchNode<[
 *   With<string, AppendNode<': is string'>>,
 *   With<number, ToStringNode>,
 *   With<unknown, ConstantNode<'unknown'>>
 * ]>, { in: 'hello' }>
 * // { out: 'hello: is string' }
 */
export interface MatchNode<Clauses extends readonly With<unknown, Node>[]> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer Value
    ? { out: MatchImpl<Value, Clauses> }
    : never
}

type MatchImpl<Value, Clauses extends readonly With<unknown, Node>[]> =
  Clauses extends readonly [
    With<infer Pattern, infer Handler extends Node>,
    ...infer Rest extends readonly With<unknown, Node>[]
  ]
    ? DoesMatch<Value, Pattern> extends true
      ? (Handler & { [nodeInputs]: { in: Value } })['outputs']['out']
      : MatchImpl<Value, Rest>
    : never

/**
 * Exported node constructor
 */
export type Match<Clauses extends readonly With<unknown, Node>[]> = MatchNode<Clauses>
