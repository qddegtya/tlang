/**
 * Advanced usage examples for tlang
 */

import type {
  Pipe,
  Omit,
  Pick,
  Partial,
  DeepPartial,
  DeepReadonly,
  UnionToIntersection,
  Extend
} from '@atools/tlang'

/**
 * Example 1: Deep transformations
 */
type User = {
  id: number
  profile: {
    name: string
    settings: {
      theme: 'light' | 'dark'
      notifications: {
        email: boolean
        push: boolean
      }
    }
  }
}

// Make entire structure partial
type UserFormData = Pipe<User, [DeepPartial]>

// Make entire structure readonly
type ImmutableUser = Pipe<User, [DeepReadonly]>

/**
 * Example 2: Union type operations
 */
type Shape =
  | { type: 'circle'; radius: number }
  | { type: 'rectangle'; width: number; height: number }
  | { type: 'triangle'; base: number; height: number }

// Convert union to intersection
type MergedShape = Pipe<Shape, [UnionToIntersection]>

// Result: all properties combined as intersection

/**
 * Example 3: Complex API response transformation
 */
type APIResponse<T> = {
  success: boolean
  data: T
  error?: string
  metadata: {
    timestamp: Date
    requestId: string
  }
}

// Extract just the data with success status
type SuccessResponse<T> = Pipe<APIResponse<T>, [
  Omit<'error'>,
  Extend<{ success: true }>
]>

/**
 * Example 4: Reusable type transformers
 *
 * Create commonly used transformation chains
 */

// Remove sensitive fields transformer
type RemoveSensitive = [
  Omit<'password' | 'secret' | 'token'>
]

// Add timestamp fields transformer
type AddTimestamps = [
  Extend<{
    createdAt: Date
    updatedAt: Date
  }>
]

// Combine transformers
type Account = {
  id: string
  email: string
  password: string
  secret: string
}

type PublicAccount = Pipe<Account, [
  ...RemoveSensitive,
  ...AddTimestamps
]>

// Result: Account without password/secret + timestamps

/**
 * Example 5: Type family pattern
 *
 * Define a family of related types from a base type
 */
type Post = {
  id: number
  authorId: number
  title: string
  content: string
  isDraft: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// Type family for Post entity
type PostTypes = {
  // List view
  List: Pipe<Post, [Pick<'id' | 'title' | 'authorId' | 'createdAt'>]>

  // Detail view
  Detail: Pipe<Post, [Omit<'isDraft'>]>

  // Create input
  Create: Pipe<Post, [
    Omit<'id' | 'createdAt' | 'updatedAt'>,
    DeepPartial
  ]>

  // Update input (requires id, other fields optional)
  Update: Pipe<Post, [
    Omit<'createdAt' | 'updatedAt'>,
    Partial
  ]>
}

// Usage
type PostListItem = PostTypes['List']
type CreatePostInput = PostTypes['Create']

/**
 * Example 6: Discriminated union handling
 */
type Event =
  | { type: 'click'; x: number; y: number }
  | { type: 'keypress'; key: string }
  | { type: 'scroll'; deltaY: number }

// Add timestamp to all events (each variant gets the timestamp)
type TimestampedEvent = Event & { timestamp: Date }

export type {
  UserFormData,
  ImmutableUser,
  MergedShape,
  SuccessResponse,
  PublicAccount,
  PostListItem,
  CreatePostInput,
  TimestampedEvent
}
