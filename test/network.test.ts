/**
 * Network execution tests
 *
 * Testing true FBP multi-port nodes and network execution
 * This is where tlang shows its power over HotScript!
 */

import { describe, it, expect } from '@jest/globals'
import type { Exec, Out, Pipe } from '../src'
import type { AddNode, DoubleNode, IncrementNode, SplitNode } from '../src/nodes/arithmetic'

describe('Multi-port node execution', () => {
  it('should execute a node with two inputs', () => {
    // Test multi-port execution with AddNode
    type Outputs = Exec<AddNode, { a: 2; b: 3 }>
    type Result = Out<Outputs, 'sum'>
    const test: Result = 5
    expect(test).toBe(5)
  })

  it('should execute a node with multiple outputs', () => {
    type Outputs = Exec<SplitNode, { value: 3 }>
    type Original = Out<Outputs, 'original'>
    type Doubled = Out<Outputs, 'doubled'>

    const original: Original = 3
    const doubled: Doubled = 6

    expect(original).toBe(3)
    expect(doubled).toBe(6)
  })
})

describe('Network definition and execution', () => {
  it('should define a simple network structure', () => {
    // Simple network: just one doubler node
    type SimpleNet = {
      nodes: {
        doubler: DoubleNode
      }
      connections: [
        { from: { node: 'input'; port: 'value' }; to: { node: 'doubler'; port: 'in' } }
      ]
      initial: {
        input: 5
      }
    }

    // For now, just test the type structure is valid
    type Net = SimpleNet
    const _net: Net = {
      nodes: { doubler: null as unknown as DoubleNode },
      connections: [
        { from: { node: 'input', port: 'value' }, to: { node: 'doubler', port: 'in' } }
      ],
      initial: { input: 5 }
    }

    expect(_net.initial.input).toBe(5)
  })

  it('should execute a network and extract results', () => {
    // Execute the network using manual orchestration
    // Network: input (4) -> doubler -> 8

    type DoublerOutputs = Exec<DoubleNode, { in: 4 }>
    type DoublerOutput = Out<DoublerOutputs, 'out'>

    const result: DoublerOutput = 8
    expect(result).toBe(8)
  })
})

describe('Connected networks with data flow', () => {
  it('should chain two nodes together', () => {
    // Network: input (3) -> double -> 6 -> increment -> 7
    // Manual orchestration using Exec + Out

    type Step1 = Exec<DoubleNode, { in: 3 }>
    type Step2 = Exec<IncrementNode, { in: Out<Step1, 'out'> }>
    type FinalOutput = Out<Step2, 'out'>

    const result: FinalOutput = 7
    expect(result).toBe(7)
  })

  it('should chain two nodes using Pipe sugar', () => {
    // Network: input (3) -> double -> 6 -> increment -> 7
    // Using Pipe syntax sugar

    type Result = Pipe<3, [DoubleNode, IncrementNode]>

    const result: Result = 7
    expect(result).toBe(7)
  })

  it('should handle multiple inputs from different sources', () => {
    // Network: two doublers feeding into one adder
    // input1 (2) -> double -> 4 \
    //                              > add -> 10
    // input2 (3) -> double -> 6 /

    type Doubler1 = Exec<DoubleNode, { in: 2 }>
    type Doubler2 = Exec<DoubleNode, { in: 3 }>
    type Adder = Exec<AddNode, {
      a: Out<Doubler1, 'out'>
      b: Out<Doubler2, 'out'>
    }>
    type FinalSum = Out<Adder, 'sum'>

    const result: FinalSum = 10
    expect(result).toBe(10)
  })

  it('should handle complex DAG with multiple paths', () => {
    // Network:
    //         /-> doubled -> 6 \
    // 3 -> split                > add -> 9
    //         \-> original -> 3 /

    type Splitter = Exec<SplitNode, { value: 3 }>
    type Adder = Exec<AddNode, {
      a: Out<Splitter, 'doubled'>
      b: Out<Splitter, 'original'>
    }>
    type Result = Out<Adder, 'sum'>

    const result: Result = 9
    expect(result).toBe(9)
  })
})
