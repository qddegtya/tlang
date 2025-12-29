/**
 * Numbers operations tests
 */

import { describe, it, expect } from '@jest/globals'
import type { Exec, Out, Numbers } from '../src'

describe('Numbers arithmetic operations', () => {
  it('should add two numbers', () => {
    type Result = Exec<Numbers.Add, { a: 2, b: 3 }>
    type Sum = Out<Result, 'sum'>

    const test: Sum = 5
    expect(test).toBe(5)
  })

  it('should subtract two numbers', () => {
    type Result = Exec<Numbers.Sub, { a: 5, b: 3 }>
    type Diff = Out<Result, 'diff'>

    const test: Diff = 2
    expect(test).toBe(2)
  })

  it('should multiply two numbers', () => {
    type Result = Exec<Numbers.Mul, { a: 3, b: 4 }>
    type Product = Out<Result, 'product'>

    const test: Product = 12
    expect(test).toBe(12)
  })

  it('should divide two numbers', () => {
    type Result = Exec<Numbers.Div, { a: 10, b: 3 }>
    type Quotient = Out<Result, 'quotient'>

    const test: Quotient = 3
    expect(test).toBe(3)
  })

  it('should compute modulo', () => {
    type Result = Exec<Numbers.Mod, { a: 10, b: 3 }>
    type Remainder = Out<Result, 'remainder'>

    const test: Remainder = 1
    expect(test).toBe(1)
  })

  it('should handle absolute value', () => {
    type Result = Exec<Numbers.Abs, { in: 5 }>
    type AbsValue = Out<Result, 'out'>

    const test: AbsValue = 5
    expect(test).toBe(5)
  })
})

describe('Numbers comparison operations', () => {
  it('should find maximum of two numbers', () => {
    type Result = Exec<Numbers.Max, { a: 5, b: 3 }>
    type Maximum = Out<Result, 'max'>

    const test: Maximum = 5
    expect(test).toBe(5)
  })

  it('should find minimum of two numbers', () => {
    type Result = Exec<Numbers.Min, { a: 5, b: 3 }>
    type Minimum = Out<Result, 'min'>

    const test: Minimum = 3
    expect(test).toBe(3)
  })

  it('should compare two numbers', () => {
    type Result1 = Exec<Numbers.Compare, { a: 5, b: 3 }>
    type Result2 = Exec<Numbers.Compare, { a: 3, b: 5 }>
    type Result3 = Exec<Numbers.Compare, { a: 3, b: 3 }>

    const test1: Out<Result1, 'result'> = 1
    const test2: Out<Result2, 'result'> = -1
    const test3: Out<Result3, 'result'> = 0

    expect(test1).toBe(1)
    expect(test2).toBe(-1)
    expect(test3).toBe(0)
  })

  it('should check equality', () => {
    type Result1 = Exec<Numbers.Equal, { a: 3, b: 3 }>
    type Result2 = Exec<Numbers.Equal, { a: 3, b: 5 }>

    const test1: Out<Result1, 'result'> = true
    const test2: Out<Result2, 'result'> = false

    expect(test1).toBe(true)
    expect(test2).toBe(false)
  })

  it('should check less than', () => {
    type Result1 = Exec<Numbers.LessThan, { a: 3, b: 5 }>
    type Result2 = Exec<Numbers.LessThan, { a: 5, b: 3 }>

    const test1: Out<Result1, 'result'> = true
    const test2: Out<Result2, 'result'> = false

    expect(test1).toBe(true)
    expect(test2).toBe(false)
  })

  it('should check greater than', () => {
    type Result1 = Exec<Numbers.GreaterThan, { a: 5, b: 3 }>
    type Result2 = Exec<Numbers.GreaterThan, { a: 3, b: 5 }>

    const test1: Out<Result1, 'result'> = true
    const test2: Out<Result2, 'result'> = false

    expect(test1).toBe(true)
    expect(test2).toBe(false)
  })
})
