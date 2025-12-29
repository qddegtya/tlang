/**
 * Network DAG Examples - Demonstrating tlang's superior DAG capabilities
 *
 * These examples showcase computational graph structures that HotScript's Pipe cannot express:
 * - Branching (one output flows to multiple nodes)
 * - Merging (multiple outputs converge to one node)
 * - Complex DAG (arbitrary graph structures)
 */

import type { Exec, Out, Node, nodeInputs, Network } from 'tlang'

// ========================================
// Define Nodes
// ========================================

// Helper: Build tuple of length N
type BuildTuple<N extends number, Acc extends unknown[] = []> =
  Acc['length'] extends N ? Acc : BuildTuple<N, [...Acc, unknown]>

/**
 * DoubleNode - Multiply input by 2
 */
interface DoubleNode extends Node {
  [nodeInputs]: { in: number }
  inputs: { in: number }
  outputs: this[nodeInputs]['in'] extends infer N extends number
    ? { product: [...BuildTuple<N>, ...BuildTuple<N>]['length'] & number }
    : never
}

/**
 * IncrementNode - Add 1 to input
 */
interface IncrementNode extends Node {
  [nodeInputs]: { in: number }
  inputs: { in: number }
  outputs: this[nodeInputs]['in'] extends infer N extends number
    ? { sum: [...BuildTuple<N>, unknown]['length'] & number }
    : never
}

/**
 * AddNode - Add two inputs
 */
interface AddNode extends Node {
  [nodeInputs]: { a: number; b: number }
  inputs: { a: number; b: number }
  outputs: [
    this[nodeInputs]['a'],
    this[nodeInputs]['b']
  ] extends [infer A extends number, infer B extends number]
    ? { sum: [...BuildTuple<A>, ...BuildTuple<B>]['length'] & number }
    : never
}

/**
 * SplitNode - One input, two outputs (branching)
 */
interface SplitNode extends Node {
  [nodeInputs]: { value: number }
  inputs: { value: number }
  outputs: this[nodeInputs] extends { value: infer V extends number }
    ? {
        original: V
        doubled: [...BuildTuple<V>, ...BuildTuple<V>]['length'] & number
      }
    : never
}

// ========================================
// Example 1: Simple Branching (HotScript cannot express)
// ========================================

/**
 * Computation graph:
 *           /-> double -> 6
 *    3 -> split
 *           \-> increment -> 4
 *
 * HotScript cannot do: one node's different outputs flowing to different nodes
 */

// Manual DAG orchestration
type Splitter = Exec<SplitNode, { value: 3 }>
// Splitter = { original: 3, doubled: 6 }

type BranchA = Exec<DoubleNode, { in: Out<Splitter, 'original'> }>
// BranchA = { product: 6 }

type BranchB = Exec<IncrementNode, { in: Out<Splitter, 'original'> }>
// BranchB = { sum: 4 }

// Test results
const branchAResult: Out<BranchA, 'product'> = 6
const branchBResult: Out<BranchB, 'sum'> = 4

// Network definition (declarative)
type SimpleBranchNetwork = Network<
  {
    split: SplitNode
    doubleNode: DoubleNode
    incNode: IncrementNode
  },
  [
    { from: { node: 'split'; port: 'original' }; to: { node: 'doubleNode'; port: 'in' } },
    { from: { node: 'split'; port: 'original' }; to: { node: 'incNode'; port: 'in' } }
  ],
  { split: { value: 3 } }
>

// ========================================
// Example 2: Branch then Merge (HotScript completely cannot express)
// ========================================

/**
 * Computation graph:
 *           /-> double -> 6 \
 *    3 -> split                > add -> 12
 *           \-> original -> 6 /
 *
 * This is a true DAG!
 * - One node with two outputs
 * - Two branches converge to the same node
 * - HotScript's Pipe fundamentally cannot express this structure
 */

type Split = Exec<SplitNode, { value: 3 }>
// { original: 3, doubled: 6 }

type Path1 = Exec<DoubleNode, { in: Out<Split, 'original'> }>
// { product: 6 }

type Merge = Exec<AddNode, {
  a: Out<Path1, 'product'>  // From branch 1: 6
  b: Out<Split, 'doubled'>  // From branch 2: 6
}>
// { sum: 12 }

const mergeResult: Out<Merge, 'sum'> = 12

// Network definition
type MergeNetwork = Network<
  {
    split: SplitNode
    doubleNode: DoubleNode
    addNode: AddNode
  },
  [
    { from: { node: 'split'; port: 'original' }; to: { node: 'doubleNode'; port: 'in' } },
    { from: { node: 'doubleNode'; port: 'product' }; to: { node: 'addNode'; port: 'a' } },
    { from: { node: 'split'; port: 'doubled' }; to: { node: 'addNode'; port: 'b' } }
  ],
  { split: { value: 3 } }
>

// ========================================
// Example 3: Complex Multi-layer DAG
// ========================================

/**
 * Computation graph:
 *                    /-> double -> 4 \
 *         /-> split1                  > add1 -> 7 \
 *    2 -> split0    \-> +1 -> 3 ----/              \
 *         \                                          > add2 -> 11
 *          \-> double -> 4 -------------------------/
 *
 * This demonstrates:
 * - Multi-level branching
 * - Multiple merges
 * - Complex data flow paths
 */

type Split0 = Exec<SplitNode, { value: 2 }>
// { original: 2, doubled: 4 }

type Split1 = Exec<SplitNode, { value: Out<Split0, 'original'> }>
// { original: 2, doubled: 4 }

type PathA = Exec<DoubleNode, { in: Out<Split1, 'original'> }>
// { product: 4 }

type PathB = Exec<IncrementNode, { in: Out<Split1, 'original'> }>
// { sum: 3 }

type Add1 = Exec<AddNode, {
  a: Out<PathA, 'product'>  // 4
  b: Out<PathB, 'sum'>      // 3
}>
// { sum: 7 }

type PathC = Exec<DoubleNode, { in: Out<Split0, 'doubled'> }>
// { product: 8 }

type Add2 = Exec<AddNode, {
  a: Out<Add1, 'sum'>        // 7
  b: Out<PathC, 'product'>   // 8
}>
// { sum: 15 }

const complexResult: Out<Add2, 'sum'> = 15

// Network definition
type ComplexDAGNetwork = Network<
  {
    split0: SplitNode
    split1: SplitNode
    double1: DoubleNode
    inc1: IncrementNode
    double2: DoubleNode
    add1: AddNode
    add2: AddNode
  },
  [
    { from: { node: 'split0'; port: 'original' }; to: { node: 'split1'; port: 'value' } },
    { from: { node: 'split1'; port: 'original' }; to: { node: 'double1'; port: 'in' } },
    { from: { node: 'split1'; port: 'original' }; to: { node: 'inc1'; port: 'in' } },
    { from: { node: 'double1'; port: 'product' }; to: { node: 'add1'; port: 'a' } },
    { from: { node: 'inc1'; port: 'sum' }; to: { node: 'add1'; port: 'b' } },
    { from: { node: 'split0'; port: 'doubled' }; to: { node: 'double2'; port: 'in' } },
    { from: { node: 'double2'; port: 'product' }; to: { node: 'add2'; port: 'a' } },
    { from: { node: 'add1'; port: 'sum' }; to: { node: 'add2'; port: 'b' } }
  ],
  { split0: { value: 2 } }
>

// ========================================
// Example 4: Real-world Application - Data Processing Pipeline
// ========================================

/**
 * Real scenario: User data processing
 *
 * Computation graph:
 *                      /-> validateEmail \
 *    userData -> split                    > merge -> finalUser
 *                      \-> hashPassword  /
 *
 * One input goes through two independent validation/transformation flows,
 * then converges
 */

interface UserData {
  email: string
  password: string
  name: string
}

interface UserSplitNode extends Node {
  [nodeInputs]: { user: UserData }
  inputs: { user: UserData }
  outputs: this[nodeInputs] extends { user: infer U extends UserData }
    ? {
        emailData: Pick<U, 'email'>
        passwordData: Pick<U, 'password'>
        baseData: Pick<U, 'name'>
      }
    : never
}

interface ValidateEmailNode extends Node {
  [nodeInputs]: { in: { email: string } }
  inputs: { in: { email: string } }
  outputs: {
    out: { validatedEmail: string }
  }
}

interface HashPasswordNode extends Node {
  [nodeInputs]: { in: { password: string } }
  inputs: { in: { password: string } }
  outputs: {
    out: { hashedPassword: string }
  }
}

interface MergeUserNode extends Node {
  [nodeInputs]: {
    base: { name: string }
    email: { validatedEmail: string }
    password: { hashedPassword: string }
  }
  inputs: {
    base: { name: string }
    email: { validatedEmail: string }
    password: { hashedPassword: string }
  }
  outputs: {
    out: {
      name: string
      validatedEmail: string
      hashedPassword: string
    }
  }
}

// Network definition for user processing
type UserProcessingNetwork = Network<
  {
    userSplit: UserSplitNode
    validateEmail: ValidateEmailNode
    hashPassword: HashPasswordNode
    mergeUser: MergeUserNode
  },
  [
    { from: { node: 'userSplit'; port: 'emailData' }; to: { node: 'validateEmail'; port: 'in' } },
    { from: { node: 'userSplit'; port: 'passwordData' }; to: { node: 'hashPassword'; port: 'in' } },
    { from: { node: 'userSplit'; port: 'baseData' }; to: { node: 'mergeUser'; port: 'base' } },
    { from: { node: 'validateEmail'; port: 'out' }; to: { node: 'mergeUser'; port: 'email' } },
    { from: { node: 'hashPassword'; port: 'out' }; to: { node: 'mergeUser'; port: 'password' } }
  ],
  { userSplit: { user: { email: 'test@example.com', password: 'secret', name: 'Alice' } } }
>

/**
 * DAG structure advantages:
 * 1. Clear data flow visualization
 * 2. Single responsibility for each node
 * 3. Independent testing and optimization per branch
 * 4. HotScript completely cannot express this structure!
 */

// ========================================
// Export example results
// ========================================

export type {
  branchAResult,
  branchBResult,
  mergeResult,
  complexResult,
  SimpleBranchNetwork,
  MergeNetwork,
  ComplexDAGNetwork,
  UserProcessingNetwork
}

/**
 * Summary: tlang vs HotScript
 *
 * ✅ tlang can express:
 * - Branching: one output flows to multiple nodes
 * - Merging: multiple outputs converge to one node
 * - Multi-input nodes: { a, b } naturally expressed
 * - Complex DAG: arbitrary graph structures
 * - Network declarative definition
 *
 * ❌ HotScript cannot express:
 * - Pipe only supports single-parameter linear flow
 * - Cannot express branching and merging
 * - Multi-input requires Apply/Call, cannot flow in Pipe
 *
 * This is our core advantage! 🚀
 */
