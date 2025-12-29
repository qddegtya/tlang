/**
 * Boolean operations tests
 */

import { describe, it, expect } from '@jest/globals'
import type { Exec, Out } from '../src'
import type { Booleans } from '../src'

describe('Boolean operations', () => {
  it('should perform logical AND', () => {
    type Result1 = Exec<Booleans.And, { a: true, b: true }>
    type Result2 = Exec<Booleans.And, { a: true, b: false }>
    type Result3 = Exec<Booleans.And, { a: false, b: false }>

    const test1: Out<Result1, 'result'> = true
    const test2: Out<Result2, 'result'> = false
    const test3: Out<Result3, 'result'> = false

    expect(test1).toBe(true)
    expect(test2).toBe(false)
    expect(test3).toBe(false)
  })

  it('should perform logical OR', () => {
    type Result1 = Exec<Booleans.Or, { a: true, b: true }>
    type Result2 = Exec<Booleans.Or, { a: true, b: false }>
    type Result3 = Exec<Booleans.Or, { a: false, b: false }>

    const test1: Out<Result1, 'result'> = true
    const test2: Out<Result2, 'result'> = true
    const test3: Out<Result3, 'result'> = false

    expect(test1).toBe(true)
    expect(test2).toBe(true)
    expect(test3).toBe(false)
  })

  it('should perform logical NOT', () => {
    type Result1 = Exec<Booleans.Not, { in: true }>
    type Result2 = Exec<Booleans.Not, { in: false }>

    const test1: Out<Result1, 'out'> = false
    const test2: Out<Result2, 'out'> = true

    expect(test1).toBe(false)
    expect(test2).toBe(true)
  })

  it('should check boolean equality', () => {
    type Result1 = Exec<Booleans.Equals, { a: true, b: true }>
    type Result2 = Exec<Booleans.Equals, { a: true, b: false }>
    type Result3 = Exec<Booleans.Equals, { a: false, b: false }>

    const test1: Out<Result1, 'result'> = true
    const test2: Out<Result2, 'result'> = false
    const test3: Out<Result3, 'result'> = true

    expect(test1).toBe(true)
    expect(test2).toBe(false)
    expect(test3).toBe(true)
  })

  it('should perform logical XOR', () => {
    type Result1 = Exec<Booleans.Xor, { a: true, b: true }>
    type Result2 = Exec<Booleans.Xor, { a: true, b: false }>
    type Result3 = Exec<Booleans.Xor, { a: false, b: false }>

    const test1: Out<Result1, 'result'> = false
    const test2: Out<Result2, 'result'> = true
    const test3: Out<Result3, 'result'> = false

    expect(test1).toBe(false)
    expect(test2).toBe(true)
    expect(test3).toBe(false)
  })
})
