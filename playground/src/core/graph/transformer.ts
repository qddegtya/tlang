/**
 * Transform ReactFlow graph to tlang Network code
 */

import type { GraphNode, GraphEdge } from '../../types/graph'

/**
 * Find nodes that have no incoming edges (entry points)
 */
function findEntryNodes(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const nodesWithInputs = new Set(edges.map(edge => edge.target))
  return nodes.filter(node => !nodesWithInputs.has(node.id))
}

/**
 * Generate unique variable name for a node
 */
function generateNodeVarName(nodeId: string): string {
  // Remove special characters and make camelCase
  return nodeId.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_')
}

/**
 * Extract unique namespaces and top-level types from node types
 * Returns: { namespaces: Set<string>, topLevelTypes: Set<string> }
 *
 * Single source of truth: This list matches tlang/src/index.ts exports exactly
 */
function extractImports(nodes: GraphNode[]): { namespaces: Set<string>; topLevelTypes: Set<string> } {
  const namespaces = new Set<string>()
  const topLevelTypes = new Set<string>()

  // Top-level exports from tlang/src/index.ts
  // These are exported directly, not in namespaces
  const topLevelExports = new Set([
    // From nodes/basic.ts
    'Omit', 'Pick', 'Partial', 'Required', 'Readonly', 'Extend',
    // From nodes/conditional.ts
    'Identity',
    // From nodes/deep.ts
    'DeepPartial', 'DeepReadonly', 'DeepRequired',
    // From nodes/union.ts
    'UnionKeys', 'UnionToIntersection', 'ExcludeUnion', 'ExtractUnion', 'UnionMap'
  ])

  nodes.forEach(node => {
    const tlangType = node.data.metadata.tlangType

    // Check if it's a top-level export (no dot in name)
    if (!tlangType.includes('.')) {
      if (topLevelExports.has(tlangType)) {
        topLevelTypes.add(tlangType)
      }
    } else {
      // Extract namespace (e.g., "Strings" from "Strings.Uppercase")
      const namespace = tlangType.split('.')[0]
      if (namespace) {
        namespaces.add(namespace)
      }
    }
  })

  return { namespaces, topLevelTypes }
}

/**
 * Generate tlang Network type definition from graph
 */
export function generateTLangCode(
  nodes: GraphNode[],
  edges: GraphEdge[],
  networkName: string = 'MyNetwork'
): string {
  if (nodes.length === 0) {
    return '// Add nodes to the canvas to generate code\n// Drag nodes from the left panel to start building your type system'
  }

  // Step 1: Generate imports
  const { namespaces, topLevelTypes } = extractImports(nodes)
  const namespaceList = Array.from(namespaces).sort()
  const topLevelList = Array.from(topLevelTypes).sort()

  // Generate proper imports
  // Always include Network, Exec, Out for DAG execution
  // Include namespaces (e.g., Strings, Objects) for namespace.Member access
  // Include top-level types (e.g., Partial, Readonly) used directly
  const typeImports = ['Network', 'Exec', 'Out', ...topLevelList, ...namespaceList]
  const imports = `import type { ${typeImports.join(', ')} } from 'tlang'`

  // Step 2: Generate node definitions
  const nodeDefinitions = nodes
    .map(node => {
      const varName = generateNodeVarName(node.id)
      const metadata = node.data.metadata
      return `    ${varName}: ${metadata.tlangType}`
    })
    .join(',\n')

  // Step 3: Generate connections
  const connections = edges
    .map(edge => {
      const sourceVar = generateNodeVarName(edge.source)
      const targetVar = generateNodeVarName(edge.target)
      return `    { from: { node: '${sourceVar}'; port: '${edge.sourceHandle ?? 'out'}' }; to: { node: '${targetVar}'; port: '${edge.targetHandle ?? 'in'}' } }`
    })
    .join(',\n')

  // Step 4: Generate initial data with proper type examples
  const entryNodes = findEntryNodes(nodes, edges)
  const initialData = entryNodes
    .map(node => {
      const varName = generateNodeVarName(node.id)
      const metadata = node.data.metadata

      // Generate example input based on node metadata
      const exampleInputs: Record<string, unknown> = {}
      metadata.inputs.forEach(input => {
        if (input.required) {
          // Provide type-appropriate default values
          switch (input.type) {
            case 'string':
              exampleInputs[input.id] = node.data.inputs?.[input.id] ?? 'hello_world'
              break
            case 'number':
              exampleInputs[input.id] = node.data.inputs?.[input.id] ?? 42
              break
            case 'boolean':
              exampleInputs[input.id] = node.data.inputs?.[input.id] ?? true
              break
            case 'object':
              exampleInputs[input.id] = node.data.inputs?.[input.id] ?? { id: 1, name: 'example' }
              break
            case 'array':
              exampleInputs[input.id] = node.data.inputs?.[input.id] ?? [1, 2, 3]
              break
            default:
              exampleInputs[input.id] = node.data.inputs?.[input.id] ?? null
          }
        }
      })

      const inputsStr = Object.keys(exampleInputs).length > 0
        ? JSON.stringify(exampleInputs, null, 2).split('\n').map((line, i) => i === 0 ? line : `      ${line}`).join('\n')
        : '{ /* No inputs required */ }'
      return `    ${varName}: ${inputsStr}`
    })
    .join(',\n')

  // Step 5: Generate manual execution code (tlang requires Exec + Out for DAG)
  const executionCode = generateExecutionCode(nodes, edges)

  // Step 6: Assemble complete code
  return `${imports}

/**
 * Type computation network: ${networkName}
 *
 * This defines a type-level computation using tlang's Network type.
 * The network computes types through a directed acyclic graph (DAG) of nodes.
 */
type ${networkName} = Network<
  // Node definitions
  {
${nodeDefinitions}
  },
  // Connections (data flow)
  [
${connections}
  ],
  // Initial input values
  {
${initialData}
  }
>

/**
 * Manual DAG execution
 *
 * TypeScript cannot auto-execute DAG networks due to circular type limitations.
 * We manually orchestrate execution using Exec + Out.
 */
${executionCode}

// Final result type - output from the last node in the DAG
type Result = ${findOutputNodeResult(nodes, edges)}

// You can now use Result in your TypeScript code
`
}

/**
 * Validate graph structure
 * Returns array of error messages, empty if valid
 */
export function validateGraph(nodes: GraphNode[], edges: GraphEdge[]): string[] {
  const errors: string[] = []

  if (nodes.length === 0) {
    return errors
  }

  // Check for cycles (DAG validation)
  if (hasCycle(nodes, edges)) {
    errors.push('Graph contains cycles. tlang networks must be acyclic (DAG).')
  }

  // Check for disconnected required inputs (excluding entry nodes without data)
  const nodeInputConnections = new Map<string, Set<string>>()
  edges.forEach(edge => {
    if (!nodeInputConnections.has(edge.target)) {
      nodeInputConnections.set(edge.target, new Set())
    }
    nodeInputConnections.get(edge.target)?.add(edge.targetHandle ?? 'in')
  })

  const entryNodes = new Set(findEntryNodes(nodes, edges).map(n => n.id))

  nodes.forEach(node => {
    const requiredInputs = node.data.metadata.inputs.filter(input => input.required)
    const connectedInputs = nodeInputConnections.get(node.id) ?? new Set()

    requiredInputs.forEach(input => {
      if (!connectedInputs.has(input.id)) {
        // Entry nodes are OK - code generator will provide default values
        // Only error for non-entry nodes with missing connections
        if (!entryNodes.has(node.id)) {
          errors.push(`Node "${node.data.label}" missing required input: ${input.label} (connect from another node or make it an entry node)`)
        }
      }
    })
  })

  return errors
}

/**
 * Detect cycles using DFS
 */
function hasCycle(nodes: GraphNode[], edges: GraphEdge[]): boolean {
  const adjacency = new Map<string, string[]>()

  // Build adjacency list
  nodes.forEach(node => adjacency.set(node.id, []))
  edges.forEach(edge => {
    const neighbors = adjacency.get(edge.source)
    if (neighbors) {
      neighbors.push(edge.target)
    }
  })

  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function dfs(nodeId: string): boolean {
    visited.add(nodeId)
    recursionStack.add(nodeId)

    const neighbors = adjacency.get(nodeId) ?? []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true
        }
      } else if (recursionStack.has(neighbor)) {
        return true // Cycle detected
      }
    }

    recursionStack.delete(nodeId)
    return false
  }

  // Check each node
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) {
        return true
      }
    }
  }

  return false
}

/**
 * Topological sort of nodes based on edge dependencies
 * Returns nodes in execution order (dependencies first)
 */
function topologicalSort(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const adjacency = new Map<string, string[]>()
  const inDegree = new Map<string, number>()

  // Initialize adjacency list and in-degree count
  nodes.forEach(node => {
    adjacency.set(node.id, [])
    inDegree.set(node.id, 0)
  })

  // Build adjacency list and calculate in-degrees
  edges.forEach(edge => {
    const neighbors = adjacency.get(edge.source)
    if (neighbors) {
      neighbors.push(edge.target)
    }
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1)
  })

  // Find all nodes with no incoming edges (entry points)
  const queue: string[] = []
  nodes.forEach(node => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id)
    }
  })

  // Kahn's algorithm for topological sort
  const sorted: GraphNode[] = []
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    const node = nodeMap.get(nodeId)
    if (node) {
      sorted.push(node)
    }

    const neighbors = adjacency.get(nodeId) ?? []
    neighbors.forEach(neighborId => {
      const degree = inDegree.get(neighborId) ?? 0
      inDegree.set(neighborId, degree - 1)
      if (degree - 1 === 0) {
        queue.push(neighborId)
      }
    })
  }

  return sorted
}

/**
 * Generate manual execution code using Exec + Out
 * TypeScript cannot auto-execute DAG networks, so we manually orchestrate
 */
function generateExecutionCode(nodes: GraphNode[], edges: GraphEdge[]): string {
  if (nodes.length === 0) {
    return '// No nodes to execute'
  }

  // Sort nodes in execution order
  const sortedNodes = topologicalSort(nodes, edges)

  // Build input connections map: nodeId -> { inputPort -> { sourceNode, sourcePort } }
  const inputConnections = new Map<string, Map<string, { sourceNode: string; sourcePort: string }>>()
  edges.forEach(edge => {
    if (!inputConnections.has(edge.target)) {
      inputConnections.set(edge.target, new Map())
    }
    inputConnections.get(edge.target)?.set(edge.targetHandle ?? 'in', {
      sourceNode: edge.source,
      sourcePort: edge.sourceHandle ?? 'out'
    })
  })

  // Generate Exec statements for each node
  const execStatements = sortedNodes.map(node => {
    const varName = generateNodeVarName(node.id)
    const metadata = node.data.metadata
    const connections = inputConnections.get(node.id)

    // Build inputs object
    const inputParts: string[] = []
    metadata.inputs.forEach(input => {
      const connection = connections?.get(input.id)
      if (connection) {
        // Connected input: use Out<SourceNode, 'port'>
        const sourceVar = generateNodeVarName(connection.sourceNode)
        inputParts.push(`${input.id}: Out<${sourceVar}, '${connection.sourcePort}'>`)
      } else {
        // Entry node input: use initial data value
        const value = node.data.inputs?.[input.id]
        if (value !== undefined) {
          const valueStr = typeof value === 'string' ? `"${value}"` : JSON.stringify(value)
          inputParts.push(`${input.id}: ${valueStr}`)
        }
      }
    })

    const inputsStr = inputParts.length > 0 ? `{ ${inputParts.join('; ')} }` : '{}'
    return `type ${varName} = Exec<${metadata.tlangType}, ${inputsStr}>`
  })

  return execStatements.join('\n')
}

/**
 * Find the output node result expression
 * Output nodes are nodes with no outgoing edges
 */
function findOutputNodeResult(nodes: GraphNode[], edges: GraphEdge[]): string {
  if (nodes.length === 0) {
    return 'never'
  }

  // Find nodes with no outgoing edges
  const nodesWithOutputs = new Set(edges.map(edge => edge.source))
  const outputNodes = nodes.filter(node => !nodesWithOutputs.has(node.id))

  if (outputNodes.length === 0) {
    // No clear output node, use the last node in topological order
    const sorted = topologicalSort(nodes, edges)
    const lastNode = sorted[sorted.length - 1]
    if (!lastNode) {
      return 'never'
    }
    const varName = generateNodeVarName(lastNode.id)
    const outputPort = lastNode.data.metadata.outputs[0]?.id ?? 'out'
    return `Out<${varName}, '${outputPort}'>`
  }

  // Use the first output node found
  const outputNode = outputNodes[0]
  if (!outputNode) {
    return 'never'
  }
  const varName = generateNodeVarName(outputNode.id)
  const outputPort = outputNode.data.metadata.outputs[0]?.id ?? 'out'
  return `Out<${varName}, '${outputPort}'>`
}
