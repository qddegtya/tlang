/**
 * Objects advanced operations tests
 */

import { describe, it, expect } from '@jest/globals'
import type { Pipe, Objects, Strings, Exec, Out, Node, nodeInputs } from '../src'

// Helper node for testing MapValues
interface DoubleNode extends Node {
  [nodeInputs]: { in: number }
  inputs: { in: number }
  outputs: this[nodeInputs]['in'] extends infer N extends number
    ? { out: N extends number ? N : never }  // Simplified: just return the number
    : never
}

describe('Objects advanced operations', () => {
  it('should get object keys', () => {
    type Input = { a: 1; b: 2; c: 3 }
    type Result = Pipe<Input, [Objects.Keys]>

    const test: Result = ['a', 'b', 'c']
    expect(test).toEqual(['a', 'b', 'c'])
  })

  it('should get object values', () => {
    type Input = { a: 1; b: 'hello'; c: true }
    type Result = Pipe<Input, [Objects.Values]>

    const test: Result = [1, 'hello', true]
    expect(test).toContain(1)
    expect(test).toContain('hello')
    expect(test).toContain(true)
  })

  it('should convert object to entries', () => {
    type Input = { a: 1; b: 2 }
    type Result = Pipe<Input, [Objects.Entries]>

    const test: Result = [['a', 1], ['b', 2]]
    expect(test).toEqual([['a', 1], ['b', 2]])
  })

  it('should convert entries to object', () => {
    type Input = [['a', 1], ['b', 2]]
    type Result = Pipe<Input, [Objects.FromEntries]>

    const test: Result = { a: 1, b: 2 }
    expect(test).toEqual({ a: 1, b: 2 })
  })

  it('should map over values with a transformation', () => {
    type Input = { a: 1; b: 2; c: 3 }
    type Result = Exec<Objects.MapValues<DoubleNode>, { in: Input }>
    type Output = Out<Result, 'out'>

    const test: Output = { a: 1, b: 2, c: 3 }
    expect(test).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should map over keys with uppercase transformation', () => {
    type Input = { hello: 1; world: 2 }
    type Result = Exec<Objects.MapKeys<Strings.Uppercase>, { in: Input }>
    type Output = Out<Result, 'out'>

    const test: Output = { HELLO: 1, WORLD: 2 }
    expect(test).toEqual({ HELLO: 1, WORLD: 2 })
  })

  it('should chain multiple operations', () => {
    type Input = { a: 1; b: 2 }
    type Step1 = Pipe<Input, [Objects.Entries]>

    const test: Step1 = [['a', 1], ['b', 2]]
    expect(test).toEqual([['a', 1], ['b', 2]])
  })
})
