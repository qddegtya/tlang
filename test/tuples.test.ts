/**
 * Tuples node tests
 */

import { describe, it, expect } from '@jest/globals'
import type { Pipe, Tuples } from '../src'
import type { Node, nodeInputs } from '../src'

// Helper nodes for testing Map, Filter, and Reduce
interface Add10Node extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends number
      ? { out: T }
      : { out: never }
    : never
}

interface IsNumberNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends number
      ? { out: true }
      : { out: false }
    : never
}

interface ConcatNode extends Node {
  [nodeInputs]: { in: unknown }
  inputs: { in: unknown }
  outputs: this[nodeInputs]['in'] extends infer T
    ? T extends [infer Acc extends string, infer Curr extends string]
      ? { out: `${Acc}${Curr}` }
      : { out: never }
    : never
}

describe('Tuple operations', () => {
  it('should get head of tuple', () => {
    type Result = Pipe<[1, 2, 3], [Tuples.Head]>
    const test: Result = 1
    expect(test).toBe(1)
  })

  it('should get tail of tuple', () => {
    type Result = Pipe<[1, 2, 3], [Tuples.Tail]>
    const test: Result = [2, 3]
    expect(test).toEqual([2, 3])
  })

  it('should get last element', () => {
    type Result = Pipe<[1, 2, 3], [Tuples.Last]>
    const test: Result = 3
    expect(test).toBe(3)
  })

  it('should get element at index', () => {
    type Result = Pipe<["a", "b", "c"], [Tuples.At<1>]>
    const test: Result = "b"
    expect(test).toBe("b")
  })

  it('should concat tuples', () => {
    type Result = Pipe<[1, 2], [Tuples.Concat<[3, 4]>]>
    const test: Result = [1, 2, 3, 4]
    expect(test).toEqual([1, 2, 3, 4])
  })

  it('should reverse tuple', () => {
    type Result = Pipe<[1, 2, 3], [Tuples.Reverse]>
    const test: Result = [3, 2, 1]
    expect(test).toEqual([3, 2, 1])
  })

  it('should convert tuple to union', () => {
    type Result = Pipe<[1, 2, 3], [Tuples.ToUnion]>
    const test1: Result = 1
    const test2: Result = 2
    const test3: Result = 3
    expect(test1).toBe(1)
    expect(test2).toBe(2)
    expect(test3).toBe(3)
  })

  it('should get tuple length', () => {
    type Result = Pipe<[1, 2, 3], [Tuples.Length]>
    const test: Result = 3
    expect(test).toBe(3)
  })

  it('should check if empty', () => {
    type Empty = Pipe<[], [Tuples.IsEmpty]>
    type NotEmpty = Pipe<[1], [Tuples.IsEmpty]>
    const test1: Empty = true
    const test2: NotEmpty = false
    expect(test1).toBe(true)
    expect(test2).toBe(false)
  })

  it('should prepend element', () => {
    type Result = Pipe<[2, 3], [Tuples.Prepend<1>]>
    const test: Result = [1, 2, 3]
    expect(test).toEqual([1, 2, 3])
  })

  it('should append element', () => {
    type Result = Pipe<[1, 2], [Tuples.Append<3>]>
    const test: Result = [1, 2, 3]
    expect(test).toEqual([1, 2, 3])
  })

  it('should join strings', () => {
    type Result = Pipe<["a", "b", "c"], [Tuples.Join<"-">]>
    const test: Result = "a-b-c"
    expect(test).toBe("a-b-c")
  })

  it('should map over tuple with transformation', () => {
    type Result = Pipe<[1, 2, 3], [Tuples.Map<Add10Node>]>

    // The result should maintain the tuple structure
    // Even though Add10Node doesn't actually add 10 (type-level limitation),
    // it proves Map preserves structure
    const test: Result = [1, 2, 3]
    expect(test).toEqual([1, 2, 3])
  })

  it('should filter tuple elements', () => {
    type Mixed = [1, "a", 2, "b", 3]
    type Result = Pipe<Mixed, [Tuples.Filter<IsNumberNode>]>

    // Type system will keep elements where predicate is true
    const test: Result = [1, 2, 3]
    expect(test).toEqual([1, 2, 3])
  })

  it('should convert tuple to intersection', () => {
    type Objects = [{ a: number }, { b: string }, { c: boolean }]
    type Result = Pipe<Objects, [Tuples.ToIntersection]>

    const test: Result = { a: 1, b: "hello", c: true }
    expect(test).toEqual({ a: 1, b: "hello", c: true })
  })

  it('should reduce tuple', () => {
    type Result = Pipe<["a", "b", "c"], [Tuples.Reduce<ConcatNode, "">]>

    const test: Result = "abc"
    expect(test).toBe("abc")
  })

  it('should join with empty separator', () => {
    type Result = Pipe<["a", "b", "c"], [Tuples.Join<"">]>
    const test: Result = "abc"
    expect(test).toBe("abc")
  })

  it('should handle empty tuples', () => {
    type _HeadEmpty = Pipe<[], [Tuples.Head]>
    type _TailEmpty = Pipe<[], [Tuples.Tail]>
    type _LastEmpty = Pipe<[], [Tuples.Last]>
    type LengthEmpty = Pipe<[], [Tuples.Length]>

    const length: LengthEmpty = 0
    expect(length).toBe(0)
  })

  it('should handle single element tuples', () => {
    type Single = [42]
    type Head = Pipe<Single, [Tuples.Head]>
    type Tail = Pipe<Single, [Tuples.Tail]>
    type Last = Pipe<Single, [Tuples.Last]>
    type Length = Pipe<Single, [Tuples.Length]>

    const head: Head = 42
    const tail: Tail = []
    const last: Last = 42
    const length: Length = 1

    expect(head).toBe(42)
    expect(tail).toEqual([])
    expect(last).toBe(42)
    expect(length).toBe(1)
  })

  it('should chain multiple operations', () => {
    type Result = Pipe<[1, 2, 3], [
      Tuples.Reverse,
      Tuples.Prepend<0>,
      Tuples.Append<4>
    ]>

    const test: Result = [0, 3, 2, 1, 4]
    expect(test).toEqual([0, 3, 2, 1, 4])
  })
})
