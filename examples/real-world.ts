/**
 * Real-world usage examples
 * Demonstrating practical patterns for tlang
 */

import type { Pipe, Omit, Pick, Partial, Extend, DeepPartial, DeepReadonly } from 'tlang'

/**
 * Scenario 1: API Response DTOs
 *
 * Common pattern: transform database entities to API responses
 */

// Database entity (has internal fields)
type UserEntity = {
  id: string
  email: string
  passwordHash: string
  passwordSalt: string
  emailVerified: boolean
  profile: {
    firstName: string
    lastName: string
    avatar?: string
    bio?: string
  }
  metadata: {
    createdAt: Date
    updatedAt: Date
    deletedAt?: Date
    loginCount: number
  }
}

// Public API response (remove sensitive fields)
type UserPublicResponse = Pipe<UserEntity, [
  Omit<'passwordHash' | 'passwordSalt'>
]>

// List view (minimal fields for performance)
type UserListResponse = Pipe<UserEntity, [
  Pick<'id' | 'email' | 'profile'>,
  Extend<{
    displayName: string  // Computed field
  }>
]>

// Admin view (everything except passwords)
type UserAdminResponse = Pipe<UserEntity, [
  Omit<'passwordHash' | 'passwordSalt'>,
  Extend<{
    permissions: string[]
    roles: string[]
  }>
]>

/**
 * Scenario 2: Form Input Types
 *
 * Common pattern: derive input types from entities
 */

// Create input (no id, no metadata)
type CreateUserInput = Pipe<UserEntity, [
  Omit<'id' | 'metadata' | 'passwordHash' | 'passwordSalt' | 'emailVerified'>,
  Extend<{
    password: string  // Plain password for registration
  }>,
  DeepPartial  // All fields optional for flexible forms
]>

// Update input (id required, rest optional)
type UpdateUserInput = Pipe<UserEntity, [
  Omit<'metadata' | 'passwordHash' | 'passwordSalt'>,
  Partial
]>

/**
 * Scenario 3: GraphQL-like Field Selection
 */

type Post = {
  id: string
  authorId: string
  title: string
  content: string
  excerpt: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  publishedAt?: Date
  tags: string[]
  metadata: {
    views: number
    likes: number
    comments: number
  }
  createdAt: Date
  updatedAt: Date
}

// Different views for different contexts
type PostCardView = Pipe<Post, [
  Pick<'id' | 'title' | 'excerpt' | 'slug' | 'publishedAt' | 'tags'>
]>

type PostDetailView = Pipe<Post, [
  Omit<'excerpt'>,
  Extend<{
    author: {
      id: string
      name: string
      avatar?: string
    }
    relatedPosts: PostCardView[]
  }>
]>

type PostEditorView = Pipe<Post, [
  Pick<'id' | 'title' | 'content' | 'status' | 'tags' | 'slug'>
]>

/**
 * Scenario 4: Configuration Objects
 */

type AppConfig = {
  api: {
    baseUrl: string
    timeout: number
    retryAttempts: number
    headers: Record<string, string>
  }
  features: {
    authentication: boolean
    analytics: boolean
    darkMode: boolean
  }
  cache: {
    enabled: boolean
    ttl: number
    strategy: 'memory' | 'localStorage' | 'sessionStorage'
  }
}

// Runtime config (mutable during initialization)
type RuntimeConfig = Pipe<AppConfig, [DeepPartial]>

// Final config (immutable after initialization)
type FinalConfig = Pipe<AppConfig, [DeepReadonly]>

/**
 * Scenario 5: Event System
 */

type BaseEvent = {
  id: string
  timestamp: Date
  source: string
}

type ClickEvent = {
  type: 'click'
  x: number
  y: number
  target: string
}

type KeyPressEvent = {
  type: 'keypress'
  key: string
  modifiers: string[]
}

// Add base event properties to all event types
type TrackedClickEvent = Pipe<ClickEvent, [
  Extend<BaseEvent>
]>

type TrackedKeyPressEvent = Pipe<KeyPressEvent, [
  Extend<BaseEvent>
]>

/**
 * Scenario 6: Type-safe API Client
 */

// Define API endpoints with their request/response types
type Endpoints = {
  'GET /users': {
    request: { page: number; limit: number }
    response: UserListResponse[]
  }
  'GET /users/:id': {
    request: { id: string }
    response: UserPublicResponse
  }
  'POST /users': {
    request: CreateUserInput
    response: UserPublicResponse
  }
  'PATCH /users/:id': {
    request: UpdateUserInput
    response: UserPublicResponse
  }
}

// Extract request type for an endpoint
type RequestType<E extends keyof Endpoints> = Endpoints[E]['request']

// Extract response type for an endpoint
type ResponseType<E extends keyof Endpoints> = Endpoints[E]['response']

// Usage
type CreateUserRequest = RequestType<'POST /users'>
type CreateUserResponse = ResponseType<'POST /users'>

export type {
  UserPublicResponse,
  UserListResponse,
  UserAdminResponse,
  CreateUserInput,
  UpdateUserInput,
  PostCardView,
  PostDetailView,
  PostEditorView,
  RuntimeConfig,
  FinalConfig,
  TrackedClickEvent,
  TrackedKeyPressEvent,
  CreateUserRequest,
  CreateUserResponse
}
