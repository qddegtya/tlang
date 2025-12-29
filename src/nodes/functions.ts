/**
 * Functions utilities
 *
 * Type-level utilities for function types
 */

import type { Node, nodeInputs } from '../core'

/**
 * AnyFunction - Type alias for function types
 */
type AnyFunction = (...args: never[]) => unknown

/**
 * ParametersNode - Extract function parameters
 *
 * @example
 * type Result = Exec<ParametersNode, { in: (a: number, b: string) => void }>
 * // { out: [a: number, b: string] }
 */
export interface ParametersNode extends Node {
  [nodeInputs]: { in: AnyFunction }
  inputs: { in: AnyFunction }
  outputs: this[nodeInputs]['in'] extends infer F extends AnyFunction
    ? F extends (...args: infer P) => unknown
      ? { out: P }
      : never
    : never
}

/**
 * ReturnTypeNode - Extract function return type
 *
 * @example
 * type Result = Exec<ReturnTypeNode, { in: (a: number) => string }>
 * // { out: string }
 */
export interface ReturnTypeNode extends Node {
  [nodeInputs]: { in: AnyFunction }
  inputs: { in: AnyFunction }
  outputs: this[nodeInputs]['in'] extends infer F extends AnyFunction
    ? F extends (...args: never[]) => infer R
      ? { out: R }
      : never
    : never
}

/**
 * MapReturnTypeNode - Transform return type of a function
 *
 * @template Fn - Node to apply to return type
 *
 * @example
 * type Result = Exec<MapReturnTypeNode<ToStringNode>, {
 *   in: (a: number) => 1 | 2
 * }>
 * // { out: (a: number) => "1" | "2" }
 */
export interface MapReturnTypeNode<Fn extends Node> extends Node {
  [nodeInputs]: { in: AnyFunction }
  inputs: { in: AnyFunction }
  outputs: this[nodeInputs]['in'] extends infer F extends AnyFunction
    ? F extends (...args: infer P) => infer R
      ? {
          out: (...args: P) => (Fn & { [nodeInputs]: { in: R } })['outputs']['out']
        }
      : never
    : never
}

/**
 * ConstantNode - Always return a constant value
 *
 * @template Value - Constant value to return
 *
 * @example
 * type Result = Exec<ConstantNode<42>, { in: unknown }>
 * // { out: 42 }
 */
export interface ConstantNode<Value> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: { out: Value }
}

/**
 * Exported node constructors
 */
export type Parameters = ParametersNode
export type ReturnType = ReturnTypeNode
export type MapReturnType<Fn extends Node> = MapReturnTypeNode<Fn>
export type Constant<Value> = ConstantNode<Value>
