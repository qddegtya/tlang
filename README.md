# tlang

> Visual-first type system above TypeScript, powered by FBP

[![Tests](https://img.shields.io/badge/tests-97%20passing-brightgreen)](./test)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](./test)
[![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-blue)](https://www.typescriptlang.org/)

## 🎯 Philosophy

TypeScript's type system is Turing-complete, but complex type transformations often result in unreadable "type gymnastics". This library applies **Flow-Based Programming (FBP)** principles to the type level, making type transformations:

- **Composable**: Chain type transformations like data flows
- **Port-First**: Multi-port nodes for complex data routing
- **DAG-Capable**: Express computation graphs impossible in linear pipes
- **Declarative**: Define networks visually with structured topology

## 🚀 What Makes tlang Different?

### vs HotScript

| Feature | HotScript | tlang | Advantage |
|---------|-----------|-------|-----------|
| **Architecture** | Single-param Pipe | Multi-port Node + DAG | ✅ **Superior** |
| **Branching** | ❌ Not supported | ✅ Supported | 🚀 **Unique** |
| **Merging** | ❌ Not supported | ✅ Supported | 🚀 **Unique** |
| **Multi-input nodes** | Requires Apply/Call | Native support | 🚀 **Unique** |
| **Tuples** | 13 operations | 16+ operations | ✅ **Caught up** |
| **Strings** | 18 operations | 20+ operations | ✅ **Caught up** |
| **Objects** | Basic + Advanced | Basic + Advanced | ✅ **Caught up** |
| **Numbers** | BigInt arithmetic | Tuple-based | ✅ **Caught up** |
| **Booleans** | 4 operations | 5 operations | ✅ **Caught up** |
| **Unions** | Map, Extract, Exclude | Map, Extract, Exclude | ✅ **Caught up** |

**tlang = HotScript's features + FBP's powerful architecture** 💪

## 🔥 Core Examples

### Linear Pipeline (Like HotScript)

```typescript
import type { Pipe, Omit, Pick } from 'tlang'

type User = {
  id: number
  email: string
  password: string
  secret: string
}

// Simple linear transformation
type PublicUser = Pipe<User, [
  Omit<'password' | 'secret'>,
  Pick<'id' | 'email'>
]>
// Result: { id: number; email: string }
```

### DAG Networks (Unique to tlang!)

```typescript
import type { Exec, Out, Network } from 'tlang'

// Branching: One input, multiple outputs
type Split = Exec<SplitNode, { value: 3 }>
// { original: 3, doubled: 6 }

type BranchA = Exec<DoubleNode, { in: Out<Split, 'original'> }>
type BranchB = Exec<IncrementNode, { in: Out<Split, 'doubled'> }>

// Merging: Multiple inputs, one output
type Merged = Exec<AddNode, {
  a: Out<BranchA, 'out'>,  // From branch 1
  b: Out<BranchB, 'out'>   // From branch 2
}>
// { sum: 12 }

// Declarative Network Definition
type MyNetwork = Network<
  {
    split: SplitNode
    doubleNode: DoubleNode
    incNode: IncrementNode
    addNode: AddNode
  },
  [
    { from: { node: 'split'; port: 'original' }; to: { node: 'doubleNode'; port: 'in' } },
    { from: { node: 'split'; port: 'doubled' }; to: { node: 'incNode'; port: 'in' } },
    { from: { node: 'doubleNode'; port: 'out' }; to: { node: 'addNode'; port: 'a' } },
    { from: { node: 'incNode'; port: 'out' }; to: { node: 'addNode'; port: 'b' } }
  ],
  { split: { value: 3 } }
>
```

**HotScript's Pipe fundamentally cannot express these DAG structures!**

## 📦 Installation

```bash
npm install tlang
# or
pnpm add tlang
```

## 🏗️ Core Primitives

### Node
The fundamental unit - all nodes have inputs and outputs:

```typescript
interface MyNode extends Node {
  inputs: { a: number; b: number }
  outputs: { sum: number }
}
```

### Exec
Execute a node with inputs, get all outputs:

```typescript
type Result = Exec<AddNode, { a: 2, b: 3 }>
// { sum: 5 }
```

### Out
Extract value from a specific output port:

```typescript
type Sum = Out<Result, 'sum'>
// 5
```

### Pipe
Linear pipeline for single-port nodes `{ in } → { out }`:

```typescript
type Result = Pipe<5, [DoubleNode, IncrementNode]>
// 11
```

### Network
Declarative DAG definition:

```typescript
type MyNetwork = Network<
  { node1: Node1, node2: Node2 },
  [{ from: {...}, to: {...} }],
  { initialData }
>
```

## 📚 Available Operations

### Tuples (16+ operations)
`Map`, `Filter`, `Reduce`, `Join`, `Head`, `Tail`, `Last`, `At`, `Reverse`, `Concat`, `ToUnion`, `ToIntersection`, `Length`, `IsEmpty`, `Prepend`, `Append`

### Strings (20+ operations)
`Split`, `Join`, `Replace`, `Repeat`, `CamelCase`, `SnakeCase`, `KebabCase`, `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`, `Trim`, `TrimLeft`, `TrimRight`, `StartsWith`, `EndsWith`, `Includes`, `Length`, `ToTuple`, `ToString`, `ToNumber`, `Prepend`, `Append`

### Objects (6+ operations)
`MapValues`, `MapKeys`, `Keys`, `Values`, `Entries`, `FromEntries`, `Omit`, `Pick`, `Partial`, `Required`, `Readonly`, `Extend`

### Numbers (13+ operations)
`Add`, `Sub`, `Mul`, `Div`, `Mod`, `Abs`, `Negate`, `Max`, `Min`, `Compare`, `Equal`, `LessThan`, `GreaterThan`

### Booleans (5 operations)
`And`, `Or`, `Not`, `Equals`, `Xor`

### Unions (5 operations)
`Map`, `Extract`, `Exclude`, `UnionKeys`, `UnionToIntersection`

## 🎨 Real-World Use Cases

### API Data Transformation Pipeline

```typescript
// Transform backend data through validation and formatting
type UserProcessing = Network<
  {
    split: UserSplitNode,
    validateEmail: ValidateEmailNode,
    hashPassword: HashPasswordNode,
    merge: MergeUserNode
  },
  [
    { from: { node: 'split'; port: 'emailData' }; to: { node: 'validateEmail'; port: 'in' } },
    { from: { node: 'split'; port: 'passwordData' }; to: { node: 'hashPassword'; port: 'in' } },
    { from: { node: 'validateEmail'; port: 'out' }; to: { node: 'merge'; port: 'email' } },
    { from: { node: 'hashPassword'; port: 'out' }; to: { node: 'merge'; port: 'password' } }
  ],
  { initialUser }
>
```

### Complex Form Validation

```typescript
// One input branches to multiple validators, then merges results
type FormValidation = Network<
  { split: SplitInput, emailCheck: Email, phoneCheck: Phone, merge: CombineResults },
  [/* connections */],
  { formData }
>
```

## 🔮 Future Vision

The `Network` type's structured definition (nodes + connections) provides the foundation for visual tooling:

- 🎨 **Visual Editor** - Drag-and-drop type graph builder
- 🔍 **Type Debugger** - Step through type evaluation
- 📊 **DAG Visualizer** - Understand computation flow

The declarative Network structure makes visual representation natural and straightforward.

## 📊 Statistics

- **Lines of Code**: ~3700+ type definitions
- **Test Coverage**: 89 tests, 100% passing
- **Feature Parity**: 100% of HotScript core features
- **Unique Features**: DAG support (HotScript 0%)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

---

**tlang: Type-level programming, evolved. 🚀**
