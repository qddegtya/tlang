/**
 * Match pattern matching tests
 */

import { describe, it, expect } from '@jest/globals'
import type { Exec, Out, Node, nodeInputs, Match } from '../src'

// Helper nodes for testing
interface ToUpperNode extends Node {
  [nodeInputs]: { in: string }
  inputs: { in: string }
  outputs: this[nodeInputs]['in'] extends infer S extends string
    ? { out: Uppercase<S> }
    : never
}

interface ToStringNode extends Node {
  [nodeInputs]: { in: number }
  inputs: { in: number }
  outputs: this[nodeInputs]['in'] extends infer N extends number
    ? { out: `${N}` }
    : never
}

interface DefaultNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: { out: 'unknown' }
}

describe('Match pattern matching', () => {
  it('should match string pattern', () => {
    type Result = Exec<Match.Match<[
      Match.With<string, ToUpperNode>,
      Match.With<number, ToStringNode>,
      Match.With<unknown, DefaultNode>
    ]>, { in: 'hello' }>

    const test: Out<Result, 'out'> = 'HELLO'
    expect(test).toBe('HELLO')
  })

  it('should match number pattern', () => {
    type Result = Exec<Match.Match<[
      Match.With<string, ToUpperNode>,
      Match.With<number, ToStringNode>,
      Match.With<unknown, DefaultNode>
    ]>, { in: 42 }>

    const test: Out<Result, 'out'> = '42'
    expect(test).toBe('42')
  })

  it('should match default pattern', () => {
    type Result = Exec<Match.Match<[
      Match.With<string, ToUpperNode>,
      Match.With<number, ToStringNode>,
      Match.With<unknown, DefaultNode>
    ]>, { in: true }>

    const test: Out<Result, 'out'> = 'unknown'
    expect(test).toBe('unknown')
  })

  it('should match first matching pattern', () => {
    type Result = Exec<Match.Match<[
      Match.With<string, ToUpperNode>,
      Match.With<string | number, DefaultNode>
    ]>, { in: 'test' }>

    const test: Out<Result, 'out'> = 'TEST'
    expect(test).toBe('TEST')
  })
})
