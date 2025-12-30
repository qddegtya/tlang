/**
 * Basic usage examples for tlang
 */

import type { Pipe, Omit, Pick, Partial, Extend } from '@atools/tlang'

// Example type
type User = {
  id: number
  email: string
  password: string
  name: string
  avatar?: string
  profile: {
    bio: string
    website?: string
  }
}

/**
 * Example 1: Simple transformation
 * Remove sensitive fields
 */
type PublicUser = Pipe<User, [
  Omit<'password'>
]>

// Result: Omit<User, 'password'>

/**
 * Example 2: Chained transformations
 * Remove password, then pick specific fields
 */
type UserListItem = Pipe<User, [
  Omit<'password'>,
  Pick<'id' | 'name' | 'avatar'>
]>

// Result: Pick<Omit<User, 'password'>, 'id' | 'name' | 'avatar'>

/**
 * Example 3: Create input type
 * Remove id (auto-generated), make avatar optional
 */
type CreateUserInput = Pipe<User, [
  Omit<'id'>,
  Partial  // Makes all fields optional
]>

/**
 * Example 4: Extend with metadata
 * Add timestamps to user type
 */
type UserWithTimestamps = Pipe<User, [
  Omit<'password'>,
  Extend<{
    createdAt: Date
    updatedAt: Date
  }>
]>

/**
 * Example 5: Complex DTO transformation
 * Remove password, pick public fields, add metadata
 */
type UserDTO = Pipe<User, [
  Omit<'password'>,
  Pick<'id' | 'email' | 'name'>,
  Extend<{
    role: 'admin' | 'user'
    isActive: boolean
  }>
]>

export type {
  PublicUser,
  UserListItem,
  CreateUserInput,
  UserWithTimestamps,
  UserDTO
}
