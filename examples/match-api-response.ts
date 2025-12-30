/**
 * Match Pattern Matching - Real-world API Response Handling
 *
 * This demonstrates Rust/TypeScript-style pattern matching for API responses
 */

import type { Exec, Out, Node, nodeInputs, Match } from '@atools/tlang'

// ========================================
// API Response Types (like Rust Result<T, E>)
// ========================================

export type ApiResponse<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: string; code: number }
  | { status: 'loading' }
  | { status: 'unauthorized'; redirectUrl: string }

export type User = {
  id: number
  name: string
  email: string
}

// ========================================
// Handler Nodes for Each Pattern
// ========================================

/**
 * SuccessHandler - Extract data from success response
 */
interface SuccessHandler<T> extends Node {
  [nodeInputs]: { in: { status: 'success'; data: T } }
  inputs: { in: { status: 'success'; data: T } }
  outputs: {
    out: {
      type: 'ok'
      value: T
    }
  }
}

/**
 * ErrorHandler - Format error message
 */
interface ErrorHandler extends Node {
  [nodeInputs]: { in: { status: 'error'; error: string; code: number } }
  inputs: { in: { status: 'error'; error: string; code: number } }
  outputs: this[nodeInputs]['in'] extends infer E extends { status: 'error'; error: string; code: number }
    ? {
        out: {
          type: 'error'
          message: `Error ${E['code']}: ${E['error']}`
        }
      }
    : never
}

/**
 * LoadingHandler - Return loading state
 */
interface LoadingHandler extends Node {
  [nodeInputs]: { in: { status: 'loading' } }
  inputs: { in: { status: 'loading' } }
  outputs: {
    out: {
      type: 'loading'
      message: 'Loading...'
    }
  }
}

/**
 * UnauthorizedHandler - Return redirect info
 */
interface UnauthorizedHandler extends Node {
  [nodeInputs]: { in: { status: 'unauthorized'; redirectUrl: string } }
  inputs: { in: { status: 'unauthorized'; redirectUrl: string } }
  outputs: this[nodeInputs]['in'] extends infer U extends { status: 'unauthorized'; redirectUrl: string }
    ? {
        out: {
          type: 'redirect'
          url: U['redirectUrl']
        }
      }
    : never
}

// ========================================
// Pattern Matching (Like Rust match!)
// ========================================

/**
 * This is equivalent to Rust:
 *
 * match api_response {
 *   ApiResponse::Success { data } => Ok(data),
 *   ApiResponse::Error { error, code } => Err(format!("Error {}: {}", code, error)),
 *   ApiResponse::Loading => Loading("Loading..."),
 *   ApiResponse::Unauthorized { redirect_url } => Redirect(redirect_url),
 * }
 */
type HandleApiResponse<T> = Match.Match<[
  Match.With<{ status: 'success'; data: T }, SuccessHandler<T>>,
  Match.With<{ status: 'error'; error: string; code: number }, ErrorHandler>,
  Match.With<{ status: 'loading' }, LoadingHandler>,
  Match.With<{ status: 'unauthorized'; redirectUrl: string }, UnauthorizedHandler>
]>

// ========================================
// Example 1: Success Response
// ========================================

type SuccessResult = Exec<HandleApiResponse<User>, {
  in: { status: 'success'; data: { id: 1; name: 'Alice'; email: 'alice@example.com' } }
}>

type SuccessOutput = Out<SuccessResult, 'out'>
// Result: { type: 'ok', value: { id: 1, name: 'Alice', email: 'alice@example.com' } }

const successCase: SuccessOutput = {
  type: 'ok',
  value: { id: 1, name: 'Alice', email: 'alice@example.com' }
}

// ========================================
// Example 2: Error Response
// ========================================

type ErrorResult = Exec<HandleApiResponse<User>, {
  in: { status: 'error'; error: 'Not Found'; code: 404 }
}>

type ErrorOutput = Out<ErrorResult, 'out'>
// Result: { type: 'error', message: 'Error 404: Not Found' }

const errorCase: ErrorOutput = {
  type: 'error',
  message: 'Error 404: Not Found'
}

// ========================================
// Example 3: Loading State
// ========================================

type LoadingResult = Exec<HandleApiResponse<User>, {
  in: { status: 'loading' }
}>

type LoadingOutput = Out<LoadingResult, 'out'>
// Result: { type: 'loading', message: 'Loading...' }

const loadingCase: LoadingOutput = {
  type: 'loading',
  message: 'Loading...'
}

// ========================================
// Example 4: Unauthorized with Redirect
// ========================================

type UnauthorizedResult = Exec<HandleApiResponse<User>, {
  in: { status: 'unauthorized'; redirectUrl: '/login' }
}>

type UnauthorizedOutput = Out<UnauthorizedResult, 'out'>
// Result: { type: 'redirect', url: '/login' }

const unauthorizedCase: UnauthorizedOutput = {
  type: 'redirect',
  url: '/login'
}

// ========================================
// Real-world Usage Pattern
// ========================================

/**
 * In a real application, you would use this like:
 *
 * ```typescript
 * type UserResponse = ApiResponse<User>
 * type HandledResponse = Pipe<UserResponse, [HandleApiResponse<User>]>
 *
 * // Now HandledResponse is a normalized union:
 * // | { type: 'ok', value: User }
 * // | { type: 'error', message: string }
 * // | { type: 'loading', message: 'Loading...' }
 * // | { type: 'redirect', url: string }
 * ```
 *
 * This is EXACTLY like Rust's match expression:
 * - Exhaustive pattern matching
 * - Type-safe extraction
 * - Compile-time guarantees
 * - No runtime overhead (pure types!)
 */

// ========================================
// Advanced: Nested Matching
// ========================================

interface AdminHandler extends Node {
  [nodeInputs]: { in: { user: User; permissions: 'admin' } }
  inputs: { in: { user: User; permissions: 'admin' } }
  outputs: { out: 'admin-dashboard' }
}

interface UserHandler extends Node {
  [nodeInputs]: { in: { user: User; permissions: 'user' } }
  inputs: { in: { user: User; permissions: 'user' } }
  outputs: { out: 'user-dashboard' }
}

interface GuestHandler extends Node {
  [nodeInputs]: { in: { user: User; permissions: 'guest' } }
  inputs: { in: { user: User; permissions: 'guest' } }
  outputs: { out: 'public-page' }
}

/**
 * Nested matching like:
 *
 * match response {
 *   Success { data: { permissions: Admin, .. } } => "admin-dashboard",
 *   Success { data: { permissions: User, .. } } => "user-dashboard",
 *   Success { data: { permissions: Guest, .. } } => "public-page",
 * }
 */
type HandlePermissions = Match.Match<[
  Match.With<{ user: User; permissions: 'admin' }, AdminHandler>,
  Match.With<{ user: User; permissions: 'user' }, UserHandler>,
  Match.With<{ user: User; permissions: 'guest' }, GuestHandler>
]>

export type {
  successCase,
  errorCase,
  loadingCase,
  unauthorizedCase,
  HandleApiResponse,
  HandlePermissions
}

/**
 * Summary: Match vs Traditional TypeScript
 *
 * Traditional TypeScript:
 * ```typescript
 * if (response.status === 'success') {
 *   return { type: 'ok', value: response.data }
 * } else if (response.status === 'error') {
 *   return { type: 'error', message: `Error ${response.code}: ${response.error}` }
 * } // ... many more if-else
 * ```
 *
 * With tlang Match (Rust-style):
 * ```typescript
 * type Result = Exec<HandleApiResponse<User>, { in: response }>
 * ```
 *
 * Benefits:
 * - ✅ Exhaustive checking at compile time
 * - ✅ Type-safe extraction
 * - ✅ Single expression (no if-else chains)
 * - ✅ Declarative pattern description
 * - ✅ Zero runtime overhead (pure types!)
 *
 * This is EXACTLY what Rust's match does, but at the type level! 🚀
 */
