/**
 * Type-level Flow-Based Programming
 *
 * Core FBP principles at the type level:
 * - Multiple inputs, multiple outputs per node
 * - Graph-based execution (DAG only, no cycles)
 * - Port-first architecture: connections are Port → Port
 *
 * Philosophy:
 * - Everything is a node with ports
 * - Data flows through port connections
 * - Manual orchestration for DAG execution
 */

/**
 * Port - A named input or output channel on a node
 *
 * In FBP, ports are the connection points where data packets flow.
 * Each port has a name and carries a specific type.
 */
export type Port<Name extends string = string, Type = unknown> = {
  name: Name
  type: Type
}

/**
 * Node - The fundamental unit in FBP
 *
 * All nodes have:
 * - inputs: Record of input port values
 * - outputs: Record of output port values
 * - nodeInputs symbol for value injection
 *
 * Single-port nodes are just nodes with { in } → { out }
 * Multi-port nodes have multiple named inputs/outputs
 */
export declare const nodeInputs: unique symbol
export type nodeInputs = typeof nodeInputs

export interface Node {
  [nodeInputs]: unknown
  inputs: Record<string, unknown>
  outputs: Record<string, unknown>
}

/**
 * Exec - Execute a node and get all output ports
 *
 * @template N - Node to execute
 * @template Inputs - Input ports { portName: value }
 * @returns Output ports { portName: value }
 *
 * @example
 * Exec<DoubleNode, { in: 5 }>          // { out: 10 }
 * Exec<AddNode, { a: 2, b: 3 }>        // { sum: 5 }
 */
export type Exec<
  N extends Node,
  Inputs extends Record<string, unknown>
> = (N & { [nodeInputs]: Inputs })['outputs']

/**
 * Out - Extract value from an output port
 *
 * @template Outputs - Output ports from Exec
 * @template PortName - Port name to extract
 *
 * @example
 * Out<Exec<DoubleNode, { in: 5 }>, 'out'>  // 10
 */
export type Out<
  Outputs extends Record<string, unknown>,
  PortName extends keyof Outputs
> = Outputs[PortName]

/**
 * Pipe - Chain single-port nodes sequentially
 *
 * Syntax sugar for connecting nodes with { in } → { out } ports.
 *
 * @template Input - Initial value
 * @template Nodes - Array of nodes to chain
 *
 * @example
 * Pipe<5, [DoubleNode, IncrementNode]>  // 11
 */
export type Pipe<Input, Nodes extends readonly unknown[]> =
  Nodes extends readonly [infer First extends Node, ...infer Rest]
    ? Pipe<Out<Exec<First, { in: Input }>, 'out'>, Rest>
    : Input

/**
 * Connection - Describes how ports are wired together
 *
 * In FBP, connections define the graph topology:
 * - from: Source node and port
 * - to: Destination node and port
 */
export type Connection = {
  from: { node: string; port: string }
  to: { node: string; port: string }
}

/**
 * Network - DAG of interconnected nodes
 *
 * Supports:
 * - Branching: one output to multiple inputs
 * - Merging: multiple outputs to one input
 *
 * Does NOT support:
 * - Cycles: TypeScript circular type limitation
 *
 * @template Nodes - Map of node names to node instances
 * @template Connections - Array of connections defining the graph
 * @template InitialData - Initial packets to inject into the network
 */
export type Network<
  Nodes extends Record<string, Node>,
  Connections extends readonly Connection[],
  InitialData extends Record<string, unknown>
> = {
  nodes: Nodes
  connections: Connections
  initial: InitialData
}

/**
 * Implementation Notes:
 *
 * TypeScript cannot auto-execute DAG networks due to circular type limitations.
 * Use manual orchestration with Exec + Out for complex graphs.
 *
 * Why Pipe works: linear dependency chain
 * Why DAG doesn't: circular dependencies lose literal types
 *
 * Solution: Manual composition
 * - Exec<Node, Inputs> → outputs
 * - Out<Outputs, Port> → value
 */
