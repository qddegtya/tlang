/**
 * tlang
 *
 * Visual type system powered by Flow-Based Programming
 *
 * Core Philosophy:
 * - Types flow through nodes like data in FBP
 * - Each node is a pure function at the type level
 * - Pipe = sequential node execution
 * - Exec + Out = manual DAG orchestration
 *
 * @example
 * import type { Pipe, Omit, Pick } from 'tlang'
 *
 * type User = { id: number; email: string; password: string }
 *
 * type PublicUser = Pipe<User, [
 *   Omit<'password'>,
 *   Pick<'id' | 'email'>
 * ]>
 * // Result: { id: number; email: string }
 */

// Core FBP primitives
export type { Node, Exec, Out, Pipe, nodeInputs, TypeFlow, Connection } from './core'

// Basic transformation nodes
export type {
  Omit,
  Pick,
  Partial,
  Required,
  Readonly,
  Extend
} from './nodes/basic'

// Conditional flow control
export type {
  Identity
} from './nodes/conditional'

// Deep recursive transformations
export type {
  DeepPartial,
  DeepReadonly,
  DeepRequired
} from './nodes/deep'

// Union type operations
export type {
  UnionKeys,
  UnionToIntersection,
  ExcludeUnion,
  ExtractUnion,
  UnionMap
} from './nodes/union'

// Union namespace
export type * as Unions from './nodes/union'

// Tuple operations
export type * as Tuples from './nodes/tuples'

// String operations
export type * as Strings from './nodes/strings'

// Object advanced operations
export type * as Objects from './nodes/objects'

// Number operations
export type * as Numbers from './nodes/numbers'

// Boolean operations
export type * as Booleans from './nodes/booleans'

// Match pattern matching
export type * as Match from './nodes/match'

// Functions utilities
export type * as Functions from './nodes/functions'
