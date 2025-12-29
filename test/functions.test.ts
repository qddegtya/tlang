/**
 * Functions utilities tests
 */

import { describe, it, expect } from '@jest/globals'
import type { Exec, Out, Functions } from '../src'

describe('Functions utilities', () => {
  it('should extract function parameters', () => {
    type Fn = (a: number, b: string) => void
    type Result = Exec<Functions.Parameters, { in: Fn }>
    type Params = Out<Result, 'out'>

    const test: Params = [42, 'hello']
    expect(test).toEqual([42, 'hello'])
  })

  it('should extract return type', () => {
    type Fn = (a: number) => string
    type Result = Exec<Functions.ReturnType, { in: Fn }>
    type Return = Out<Result, 'out'>

    const test: Return = 'result'
    expect(test).toBe('result')
  })

  it('should return constant value', () => {
    type Result = Exec<Functions.Constant<42>, { in: unknown }>
    type Value = Out<Result, 'out'>

    const test: Value = 42
    expect(test).toBe(42)
  })

  it('should return constant string', () => {
    type Result = Exec<Functions.Constant<'hello'>, { in: number }>
    type Value = Out<Result, 'out'>

    const test: Value = 'hello'
    expect(test).toBe('hello')
  })
})
