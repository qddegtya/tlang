/**
 * Numbers operations
 *
 * Type-level number arithmetic using tuple length manipulation
 * Supports literal number types for compile-time computation
 */

import type { Node, nodeInputs } from '../core'

// ========================================
// Helper: Build tuple of length N
// ========================================

type BuildTuple<N extends number, Acc extends unknown[] = []> =
  Acc['length'] extends N ? Acc : BuildTuple<N, [...Acc, unknown]>

// ========================================
// Arithmetic Operations
// ========================================

/**
 * AddNode - Add two numbers
 *
 * @example
 * type Result = Exec<AddNode, { a: 2, b: 3 }>
 * // { sum: 5 }
 */
export interface AddNode extends Node {
  [nodeInputs]: { a: number; b: number }
  inputs: { a: number; b: number }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends number, infer B extends number]
    ? { sum: [...BuildTuple<A>, ...BuildTuple<B>]['length'] & number }
    : never
}

/**
 * SubNode - Subtract two numbers
 *
 * @example
 * type Result = Exec<SubNode, { a: 5, b: 3 }>
 * // { diff: 2 }
 */
export interface SubNode extends Node {
  [nodeInputs]: { a: number; b: number }
  inputs: { a: number; b: number }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends number, infer B extends number]
    ? BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest]
      ? { diff: Rest['length'] & number }
      : { diff: 0 }
    : never
}

/**
 * MulNode - Multiply two numbers
 *
 * @example
 * type Result = Exec<MulNode, { a: 3, b: 4 }>
 * // { product: 12 }
 */
export interface MulNode extends Node {
  [nodeInputs]: { a: number; b: number }
  inputs: { a: number; b: number }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends number, infer B extends number]
    ? { product: MulHelper<A, B> }
    : never
}

type MulHelper<A extends number, B extends number, Acc extends unknown[] = []> =
  B extends 0
    ? Acc['length'] & number
    : B extends 1
      ? [...Acc, ...BuildTuple<A>]['length'] & number
      : MulHelper<A, SubOne<B>, [...Acc, ...BuildTuple<A>]>

type SubOne<N extends number> =
  BuildTuple<N> extends [unknown, ...infer Rest]
    ? Rest['length'] & number
    : 0

/**
 * DivNode - Divide two numbers (integer division)
 *
 * @example
 * type Result = Exec<DivNode, { a: 10, b: 3 }>
 * // { quotient: 3 }
 */
export interface DivNode extends Node {
  [nodeInputs]: { a: number; b: number }
  inputs: { a: number; b: number }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends number, infer B extends number]
    ? { quotient: DivHelper<A, B> }
    : never
}

type DivHelper<A extends number, B extends number, Count extends unknown[] = []> =
  B extends 0
    ? never  // Division by zero
    : A extends 0
      ? Count['length'] & number
      : BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest]
        ? DivHelper<Rest['length'] & number, B, [...Count, unknown]>
        : Count['length'] & number

/**
 * ModNode - Modulo operation
 *
 * @example
 * type Result = Exec<ModNode, { a: 10, b: 3 }>
 * // { remainder: 1 }
 */
export interface ModNode extends Node {
  [nodeInputs]: { a: number; b: number }
  inputs: { a: number; b: number }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends number, infer B extends number]
    ? { remainder: ModHelper<A, B> }
    : never
}

type ModHelper<A extends number, B extends number> =
  B extends 0
    ? never  // Division by zero
    : A extends 0
      ? 0
      : BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest]
        ? ModHelper<Rest['length'] & number, B>
        : A

/**
 * NegateNode - Negate a number (not supported at type level, returns 0)
 *
 * Note: TypeScript literal types don't support negative numbers well
 */
export interface NegateNode extends Node {
  [nodeInputs]: { in: number }
  inputs: { in: number }
  outputs: { out: 0 }  // Placeholder: negative numbers aren't well supported
}

/**
 * AbsNode - Absolute value (identity for positive numbers)
 */
export interface AbsNode extends Node {
  [nodeInputs]: { in: number }
  inputs: { in: number }
  outputs: this[nodeInputs]['in'] extends infer N extends number
    ? { out: N }
    : never
}

// ========================================
// Comparison Operations
// ========================================

/**
 * MaxNode - Return maximum of two numbers
 */
export interface MaxNode extends Node {
  [nodeInputs]: { a: number; b: number }
  inputs: { a: number; b: number }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends number, infer B extends number]
    ? { max: CompareHelper<A, B> extends 1 ? A : B }
    : never
}

/**
 * MinNode - Return minimum of two numbers
 */
export interface MinNode extends Node {
  [nodeInputs]: { a: number; b: number }
  inputs: { a: number; b: number }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends number, infer B extends number]
    ? { min: CompareHelper<A, B> extends -1 ? A : B }
    : never
}

/**
 * CompareNode - Compare two numbers
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export interface CompareNode extends Node {
  [nodeInputs]: { a: number; b: number }
  inputs: { a: number; b: number }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends number, infer B extends number]
    ? { result: CompareHelper<A, B> }
    : never
}

type CompareHelper<A extends number, B extends number> =
  A extends B
    ? 0
    : BuildTuple<A> extends [...BuildTuple<B>, ...unknown[]]
      ? 1
      : -1

/**
 * EqualNode - Check if two numbers are equal
 */
export interface EqualNode extends Node {
  [nodeInputs]: { a: number; b: number }
  inputs: { a: number; b: number }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends number, infer B extends number]
    ? { result: A extends B ? true : false }
    : never
}

/**
 * LessThanNode - Check if a < b
 */
export interface LessThanNode extends Node {
  [nodeInputs]: { a: number; b: number }
  inputs: { a: number; b: number }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends number, infer B extends number]
    ? { result: CompareHelper<A, B> extends -1 ? true : false }
    : never
}

/**
 * GreaterThanNode - Check if a > b
 */
export interface GreaterThanNode extends Node {
  [nodeInputs]: { a: number; b: number }
  inputs: { a: number; b: number }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends number, infer B extends number]
    ? { result: CompareHelper<A, B> extends 1 ? true : false }
    : never
}

// ========================================
// Exported node constructors
// ========================================

export type Add = AddNode
export type Sub = SubNode
export type Mul = MulNode
export type Div = DivNode
export type Mod = ModNode
export type Negate = NegateNode
export type Abs = AbsNode
export type Max = MaxNode
export type Min = MinNode
export type Compare = CompareNode
export type Equal = EqualNode
export type LessThan = LessThanNode
export type GreaterThan = GreaterThanNode
