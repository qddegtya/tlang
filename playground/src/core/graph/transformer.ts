/**
 * Transform ReactFlow graph to tlang TypeFlow code
 *
 * Design Principles:
 * 1. No tricks - straightforward, readable logic
 * 2. Generalized - handles all valid inputs correctly
 * 3. Defensive - validates inputs, handles edge cases
 */

import ts from 'typescript'
import type { GraphNode, GraphEdge } from '../../types/graph'
import { TLANG_TOP_LEVEL_EXPORTS } from '../../generated/tlangSources'

/**
 * Find nodes that have no incoming edges (entry points)
 */
function findEntryNodes(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const nodesWithIncomingEdges = new Set(edges.map(edge => edge.target))
  return nodes.filter(node => !nodesWithIncomingEdges.has(node.id))
}

/**
 * Generate valid TypeScript variable name from node ID
 *
 * Rules:
 * - Must start with letter or underscore
 * - Can contain letters, numbers, underscores
 * - Replace invalid characters with underscore
 * - Merge consecutive underscores
 */
function generateNodeVarName(nodeId: string): string {
  if (!nodeId || nodeId.trim().length === 0) {
    return '_empty_node'
  }

  // Replace all non-alphanumeric characters with underscore
  let varName = nodeId.replace(/[^a-zA-Z0-9]/g, '_')

  // Merge consecutive underscores
  varName = varName.replace(/_+/g, '_')

  // Ensure starts with letter or underscore (not number)
  if (/^[0-9]/.test(varName)) {
    varName = '_' + varName
  }

  // Remove trailing underscores
  varName = varName.replace(/_+$/, '')

  return varName || '_node'
}

/**
 * Extract namespaces and top-level types from a type string
 * Uses TypeScript Compiler API for robust, correct parsing
 *
 * Examples:
 * - "Pick<'id'>" → { namespaces: [], topLevelTypes: [Pick] }
 * - "Strings.Uppercase" → { namespaces: [Strings], topLevelTypes: [] }
 * - "Objects.MapKeys<Strings.CamelCase>" → { namespaces: [Objects, Strings], topLevelTypes: [] }
 * - "Pick<'user.name'>" → { namespaces: [], topLevelTypes: [Pick] } (correctly ignores string literal)
 */
function extractImportsFromType(
  typeStr: string,
  namespaces: Set<string>,
  topLevelTypes: Set<string>,
  topLevelExports: Set<string>
): void {
  // Create a temporary TypeScript source file to parse the type string
  // This uses the official TypeScript parser, guaranteeing correctness
  const tempCode = `type _Temp = ${typeStr}`
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    tempCode,
    ts.ScriptTarget.Latest,
    true // setParentNodes
  )

  // Traverse the AST to find all type references
  function visit(node: ts.Node): void {
    // TypeReferenceNode represents type references like "Pick", "Strings.Uppercase", etc.
    if (ts.isTypeReferenceNode(node)) {
      const typeName = node.typeName

      // Check if it's a qualified name (e.g., "Strings.Uppercase")
      if (ts.isQualifiedName(typeName)) {
        // Extract the namespace: "Strings.Uppercase" → "Strings"
        // Walk up the qualified name chain to get the root namespace
        let current: ts.EntityName = typeName
        while (ts.isQualifiedName(current)) {
          current = current.left
        }

        // Now current is an Identifier (the root namespace)
        if (ts.isIdentifier(current)) {
          const namespace = current.text
          namespaces.add(namespace)
        }
      } else if (ts.isIdentifier(typeName)) {
        // It's a simple identifier (e.g., "Pick", "Omit")
        const typeIdentifier = typeName.text

        // Check if it's a known top-level export
        if (topLevelExports.has(typeIdentifier)) {
          topLevelTypes.add(typeIdentifier)
        }
      }
    }

    // Recursively visit child nodes
    ts.forEachChild(node, visit)
  }

  // Start traversal from the root
  visit(sourceFile)
}

/**
 * Extract namespaces and top-level types used in the graph
 *
 * Logic:
 * - Namespaced types contain a dot: "Strings.Uppercase"
 * - Top-level types don't: "Pick", "Partial"
 * - Recursively extracts from generic parameters: "Objects.MapKeys<Strings.CamelCase>"
 *
 * Returns: { namespaces: Set<string>, topLevelTypes: Set<string> }
 */
function extractImports(nodes: GraphNode[]): { namespaces: Set<string>; topLevelTypes: Set<string> } {
  const namespaces = new Set<string>()
  const topLevelTypes = new Set<string>()
  const topLevelExports = new Set(TLANG_TOP_LEVEL_EXPORTS)

  nodes.forEach(node => {
    const tlangType = node.data.metadata.tlangType
    extractImportsFromType(tlangType, namespaces, topLevelTypes, topLevelExports)
  })

  return { namespaces, topLevelTypes }
}

/**
 * Generate tlang TypeFlow code from visual graph
 */
export function generateTLangCode(
  nodes: GraphNode[],
  edges: GraphEdge[],
  typeflowName: string = 'MyTypeFlow'
): string {
  if (nodes.length === 0) {
    return '// Add nodes to the canvas to generate code\n// Drag nodes from the left panel to start building your type system'
  }

  // Step 1: Generate imports
  const { namespaces, topLevelTypes } = extractImports(nodes)
  const importedTypes = [
    'TypeFlow',    // Always needed for DAG definition
    'Exec',        // Always needed for manual execution
    'Out',         // Always needed to extract outputs
    ...Array.from(topLevelTypes).sort(),   // User's top-level types (Pick, Partial, etc.)
    ...Array.from(namespaces).sort()       // User's namespaces (Strings, Objects, etc.)
  ]

  const imports = `import type { ${importedTypes.join(', ')} } from '@atools/tlang'`

  // Step 2: Generate node definitions
  const nodeDefinitions = nodes
    .map(node => {
      const varName = generateNodeVarName(node.id)
      const tlangType = node.data.metadata.tlangType
      return `    ${varName}: ${tlangType}`
    })
    .join(',\n')

  // Step 3: Generate connections
  const connections = edges
    .map(edge => {
      const sourceVar = generateNodeVarName(edge.source)
      const targetVar = generateNodeVarName(edge.target)
      const sourcePort = edge.sourceHandle || 'out'
      const targetPort = edge.targetHandle || 'in'
      return `    { from: { node: '${sourceVar}'; port: '${sourcePort}' }; to: { node: '${targetVar}'; port: '${targetPort}' } }`
    })
    .join(',\n')

  // Step 4: Generate initial data for entry nodes
  const entryNodes = findEntryNodes(nodes, edges)
  const initialData = entryNodes
    .map(node => {
      const varName = generateNodeVarName(node.id)
      const inputs = collectNodeInputs(node)

      // Format JSON with proper indentation (6 spaces for nested lines)
      const jsonStr = JSON.stringify(inputs, null, 2)
      const indentedJson = jsonStr
        .split('\n')
        .map((line, index) => index === 0 ? line : '      ' + line)
        .join('\n')

      return `    ${varName}: ${indentedJson}`
    })
    .join(',\n')

  // Step 5: Generate manual execution code
  const executionCode = generateExecutionCode(nodes, edges)

  // Step 6: Find result expression
  const resultExpr = findResultExpression(nodes, edges)

  // Assemble final code
  return `${imports}

/**
 * Type computation typeflow: ${typeflowName}
 *
 * This defines a type-level computation using tlang's TypeFlow type.
 * The typeflow computes types through a directed acyclic graph (DAG) of nodes.
 */
type ${typeflowName} = TypeFlow<
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
 * TypeScript cannot auto-execute DAG typeflows due to circular type limitations.
 * We manually orchestrate execution using Exec + Out.
 */
${executionCode}

// Final result type - output from the last node in the DAG
type Result = ${resultExpr}

// You can now use Result in your TypeScript code
`
}

/**
 * Collect inputs for a node, using user-provided values or defaults
 */
function collectNodeInputs(node: GraphNode): Record<string, unknown> {
  const inputs: Record<string, unknown> = {}

  node.data.metadata.inputs.forEach(input => {
    if (input.required) {
      // Use user-provided value if available, otherwise use type-appropriate default
      const userValue = node.data.inputs?.[input.id]
      if (userValue !== undefined) {
        inputs[input.id] = userValue
      } else {
        inputs[input.id] = getDefaultValueForType(input.type)
      }
    }
  })

  return inputs
}

/**
 * Get default value for a port type
 */
function getDefaultValueForType(portType: string): unknown {
  switch (portType) {
    case 'string':
      return 'hello_world'
    case 'number':
      return 42
    case 'boolean':
      return true
    case 'object':
      return { id: 1, name: 'example' }
    case 'array':
      return [1, 2, 3]
    default:
      return null
  }
}

/**
 * Generate manual execution code using topological sort
 */
function generateExecutionCode(nodes: GraphNode[], edges: GraphEdge[]): string {
  if (nodes.length === 0) {
    return '// No nodes to execute'
  }

  // Sort nodes in dependency order
  const sortedNodes = topologicalSort(nodes, edges)

  // Build input connections map
  const inputConnections = buildInputConnectionsMap(edges)

  // Generate Exec statement for each node
  const execStatements = sortedNodes.map(node => {
    const varName = generateNodeVarName(node.id)
    const tlangType = node.data.metadata.tlangType
    const nodeConnections = inputConnections.get(node.id)

    // Build inputs object
    const inputParts: string[] = []
    node.data.metadata.inputs.forEach(input => {
      const connection = nodeConnections?.get(input.id)
      if (connection) {
        // Connected input: use Out<SourceNode, 'port'>
        const sourceVar = generateNodeVarName(connection.sourceNode)
        inputParts.push(`${input.id}: Out<${sourceVar}, '${connection.sourcePort}'>`)
      } else {
        // Entry node input: use literal value
        const value = node.data.inputs?.[input.id]
        if (value !== undefined) {
          // IMPORTANT: Always use JSON.stringify for proper escaping
          const valueStr = JSON.stringify(value)
          inputParts.push(`${input.id}: ${valueStr}`)
        }
      }
    })

    const inputsStr = inputParts.length > 0 ? `{ ${inputParts.join('; ')} }` : '{}'
    return `type ${varName} = Exec<${tlangType}, ${inputsStr}>`
  })

  return execStatements.join('\n')
}

/**
 * Build map of input connections for each node
 * Returns: Map<targetNodeId, Map<targetPort, { sourceNode, sourcePort }>>
 */
function buildInputConnectionsMap(edges: GraphEdge[]): Map<string, Map<string, { sourceNode: string; sourcePort: string }>> {
  const map = new Map<string, Map<string, { sourceNode: string; sourcePort: string }>>()

  edges.forEach(edge => {
    if (!map.has(edge.target)) {
      map.set(edge.target, new Map())
    }

    const targetPort = edge.targetHandle || 'in'
    const sourcePort = edge.sourceHandle || 'out'

    map.get(edge.target)!.set(targetPort, {
      sourceNode: edge.source,
      sourcePort: sourcePort
    })
  })

  return map
}

/**
 * Find the final result expression
 * Prefers nodes with no outgoing edges (terminal nodes)
 * Falls back to last node in topological order
 */
function findResultExpression(nodes: GraphNode[], edges: GraphEdge[]): string {
  if (nodes.length === 0) {
    return 'never'
  }

  // Find terminal nodes (no outgoing edges)
  const nodesWithOutgoingEdges = new Set(edges.map(edge => edge.source))
  const terminalNodes = nodes.filter(node => !nodesWithOutgoingEdges.has(node.id))

  let outputNode: GraphNode | undefined

  if (terminalNodes.length > 0) {
    outputNode = terminalNodes[0]
  } else {
    // No terminal nodes, use last in topological order
    const sorted = topologicalSort(nodes, edges)
    outputNode = sorted[sorted.length - 1]
  }

  if (!outputNode) {
    return 'never'
  }

  const varName = generateNodeVarName(outputNode.id)
  const outputPort = outputNode.data.metadata.outputs[0]?.id || 'out'

  return `Out<${varName}, '${outputPort}'>`
}

/**
 * Topological sort using Kahn's algorithm
 * Returns nodes in dependency order (dependencies first)
 */
function topologicalSort(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  // Build adjacency list and in-degree count
  const adjacency = new Map<string, string[]>()
  const inDegree = new Map<string, number>()

  nodes.forEach(node => {
    adjacency.set(node.id, [])
    inDegree.set(node.id, 0)
  })

  edges.forEach(edge => {
    adjacency.get(edge.source)?.push(edge.target)
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
  })

  // Find entry nodes (in-degree = 0)
  const queue: string[] = []
  nodes.forEach(node => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id)
    }
  })

  // Process nodes in topological order
  const sorted: GraphNode[] = []
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    const node = nodeMap.get(nodeId)

    if (node) {
      sorted.push(node)
    }

    adjacency.get(nodeId)?.forEach(neighborId => {
      const degree = inDegree.get(neighborId) || 0
      inDegree.set(neighborId, degree - 1)

      if (degree - 1 === 0) {
        queue.push(neighborId)
      }
    })
  }

  return sorted
}

/**
 * Validate graph structure
 * Returns array of error messages (empty if valid)
 */
export function validateGraph(nodes: GraphNode[], edges: GraphEdge[]): string[] {
  const errors: string[] = []

  if (nodes.length === 0) {
    return errors
  }

  // Check for cycles
  if (hasCycle(nodes, edges)) {
    errors.push('Graph contains cycles. tlang typeflow must be acyclic (DAG).')
  }

  // Check for disconnected required inputs
  const inputConnections = buildInputConnectionsMap(edges)
  const entryNodeIds = new Set(findEntryNodes(nodes, edges).map(n => n.id))

  nodes.forEach(node => {
    const requiredInputs = node.data.metadata.inputs.filter(i => i.required)
    const connectedInputs = inputConnections.get(node.id)

    requiredInputs.forEach(input => {
      const isConnected = connectedInputs?.has(input.id)
      const isEntryNode = entryNodeIds.has(node.id)

      // Only error for non-entry nodes with unconnected required inputs
      if (!isConnected && !isEntryNode) {
        errors.push(
          `Node "${node.data.label}" missing required input: ${input.label} ` +
          `(connect from another node or provide initial value)`
        )
      }
    })
  })

  return errors
}

/**
 * Detect cycles using depth-first search
 * Returns true if cycle detected
 */
function hasCycle(nodes: GraphNode[], edges: GraphEdge[]): boolean {
  // Build adjacency list
  const adjacency = new Map<string, string[]>()
  nodes.forEach(node => adjacency.set(node.id, []))
  edges.forEach(edge => adjacency.get(edge.source)?.push(edge.target))

  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function dfs(nodeId: string): boolean {
    visited.add(nodeId)
    recursionStack.add(nodeId)

    const neighbors = adjacency.get(nodeId) || []
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

  // Check each component
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) {
        return true
      }
    }
  }

  return false
}
