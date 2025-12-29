/**
 * Tests for core Pipe type
 * These tests verify type-level correctness at compile time
 */

import { describe, it, expect } from '@jest/globals'
import type { Pipe, Omit, Pick, Partial, Extend } from '../src'

describe('Flow type transformations', () => {
  it('should apply single transformation', () => {
    type User = {
      id: number
      email: string
      password: string
    }

    type PublicUser = Pipe<User, [Omit<'password'>]>

    // Type assertion tests (compile-time verification)
    const test: PublicUser = {
      id: 1,
      email: 'test@example.com'
      // password should not exist
    }

    expect(test).toBeDefined()
  })

  it('should chain multiple transformations', () => {
    type User = {
      id: number
      email: string
      password: string
      name: string
    }

    type Result = Pipe<User, [
      Omit<'password'>,
      Pick<'id' | 'name'>
    ]>

    const test: Result = {
      id: 1,
      name: 'Test'
      // email and password should not exist
    }

    expect(test).toBeDefined()
  })

  it('should handle Extend transformation', () => {
    type Base = {
      id: number
    }

    type Extended = Pipe<Base, [
      Extend<{
        createdAt: Date
        updatedAt: Date
      }>
    ]>

    const test: Extended = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    expect(test).toBeDefined()
  })

  it('should handle Partial transformation', () => {
    type User = {
      id: number
      name: string
      email: string
    }

    type PartialUser = Pipe<User, [Partial]>

    const test: PartialUser = {
      id: 1
      // name and email are optional
    }

    expect(test).toBeDefined()
  })

  it('should compose complex transformations', () => {
    type User = {
      id: number
      email: string
      password: string
      role: string
    }

    // First omit password, then extend with new field
    type UserDTO = Pipe<User, [
      Omit<'password' | 'role'>,
      Extend<{
        isActive: boolean
      }>
    ]>

    const test: UserDTO = {
      id: 1,
      email: 'test@example.com',
      isActive: true
    }

    expect(test).toBeDefined()
  })
})
