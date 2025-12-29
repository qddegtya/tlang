/**
 * Basic type transformation nodes
 *
 * Single-port nodes with { in } → { out } structure
 */

import type { Node, nodeInputs } from '../core'

/**
 * OmitNode - Removes specified keys
 *
 * @example
 * Exec<Omit<'password'>, { in: User }>  // { out: SafeUser }
 */
export interface OmitNode<Keys extends PropertyKey> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: globalThis.Omit<T, Keys> }
    : never
}

/**
 * PickNode - Selects specified keys
 */
export interface PickNode<Keys extends PropertyKey> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: globalThis.Pick<T, Keys & keyof T> }
    : never
}

/**
 * PartialNode - Makes properties optional
 */
export interface PartialNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: globalThis.Partial<T> }
    : never
}

/**
 * RequiredNode - Makes properties required
 */
export interface RequiredNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: globalThis.Required<T> }
    : never
}

/**
 * ReadonlyNode - Makes properties readonly
 */
export interface ReadonlyNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: globalThis.Readonly<T> }
    : never
}

/**
 * ExtendNode - Adds properties
 */
export interface ExtendNode<Extension> extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? { out: T & Extension }
    : never
}

/**
 * Exported node constructors
 */
export type Omit<Keys extends PropertyKey> = OmitNode<Keys>
export type Pick<Keys extends PropertyKey> = PickNode<Keys>
export type Partial = PartialNode
export type Required = RequiredNode
export type Readonly = ReadonlyNode
export type Extend<Extension> = ExtendNode<Extension>
