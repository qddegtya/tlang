/**
 * Boolean operations
 *
 * Type-level boolean logic operations
 */

import type { Node, nodeInputs } from '../core'

/**
 * AndNode - Logical AND of two booleans
 *
 * @example
 * type Result = Exec<AndNode, { a: true, b: true }>
 * // { result: true }
 */
export interface AndNode extends Node {
  [nodeInputs]: { a: boolean; b: boolean }
  inputs: { a: boolean; b: boolean }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends boolean, infer B extends boolean]
    ? { result: A extends true ? (B extends true ? true : false) : false }
    : never
}

/**
 * OrNode - Logical OR of two booleans
 *
 * @example
 * type Result = Exec<OrNode, { a: true, b: false }>
 * // { result: true }
 */
export interface OrNode extends Node {
  [nodeInputs]: { a: boolean; b: boolean }
  inputs: { a: boolean; b: boolean }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends boolean, infer B extends boolean]
    ? { result: A extends true ? true : (B extends true ? true : false) }
    : never
}

/**
 * NotNode - Logical NOT
 *
 * @example
 * type Result = Exec<NotNode, { in: true }>
 * // { out: false }
 */
export interface NotNode extends Node {
  [nodeInputs]: { in: boolean }
  inputs: { in: boolean }
  outputs: this[nodeInputs]['in'] extends infer B extends boolean
    ? { out: B extends true ? false : true }
    : never
}

/**
 * EqualsNode - Check if two booleans are equal
 *
 * @example
 * type Result = Exec<EqualsNode, { a: true, b: true }>
 * // { result: true }
 */
export interface EqualsNode extends Node {
  [nodeInputs]: { a: boolean; b: boolean }
  inputs: { a: boolean; b: boolean }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends boolean, infer B extends boolean]
    ? { result: A extends B ? true : false }
    : never
}

/**
 * XorNode - Logical XOR (exclusive or)
 *
 * @example
 * type Result = Exec<XorNode, { a: true, b: false }>
 * // { result: true }
 */
export interface XorNode extends Node {
  [nodeInputs]: { a: boolean; b: boolean }
  inputs: { a: boolean; b: boolean }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends boolean, infer B extends boolean]
    ? { result: A extends B ? false : true }
    : never
}

/**
 * Exported node constructors
 */
export type And = AndNode
export type Or = OrNode
export type Not = NotNode
export type Equals = EqualsNode
export type Xor = XorNode
