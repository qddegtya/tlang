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
 * Find all connected components in the graph
 * Returns array of node sets, each representing one connected component
 */
function findConnectedComponents(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[][] {
  if (nodes.length === 0) {
    return []
  }

  // Build adjacency list (undirected graph for connectivity)
  const adjacency = new Map<string, Set<string>>()
  nodes.forEach(node => adjacency.set(node.id, new Set()))

  edges.forEach(edge => {
    adjacency.get(edge.source)?.add(edge.target)
    adjacency.get(edge.target)?.add(edge.source)  // Undirected
  })

  // DFS to find connected components
  const visited = new Set<string>()
  const components: GraphNode[][] = []
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  function dfs(nodeId: string, component: GraphNode[]): void {
    if (visited.has(nodeId)) return
    visited.add(nodeId)

    const node = nodeMap.get(nodeId)
    if (node) {
      component.push(node)
    }

    const neighbors = adjacency.get(nodeId) || new Set()
    neighbors.forEach(neighborId => dfs(neighborId, component))
  }

  // Find all components
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const component: GraphNode[] = []
      dfs(node.id, component)
      if (component.length > 0) {
        components.push(component)
      }
    }
  })

  return components
}

/**
 * Generate code for a single connected component
 */
function generateComponentCode(
  componentNodes: GraphNode[],
  allEdges: GraphEdge[],
  componentIndex: number
): string {
  // Filter edges that belong to this component
  const nodeIds = new Set(componentNodes.map(n => n.id))
  const componentEdges = allEdges.filter(
    edge => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  )

  const typeflowName = `TypeFlow_${componentIndex + 1}`

  // Generate node definitions
  const nodeDefinitions = componentNodes
    .map(node => {
      const varName = generateNodeVarName(node.id)
      const tlangType = node.data.metadata.tlangType
      return `    ${varName}: ${tlangType}`
    })
    .join(',\n')

  // Generate connections
  const connections = componentEdges
    .map(edge => {
      const sourceVar = generateNodeVarName(edge.source)
      const targetVar = generateNodeVarName(edge.target)
      const sourcePort = edge.sourceHandle || 'out'
      const targetPort = edge.targetHandle || 'in'
      return `    { from: { node: '${sourceVar}'; port: '${sourcePort}' }; to: { node: '${targetVar}'; port: '${targetPort}' } }`
    })
    .join(',\n')

  // Generate initial data for entry nodes
  const entryNodes = findEntryNodes(componentNodes, componentEdges)
  const initialData = entryNodes
    .map(node => {
      const varName = generateNodeVarName(node.id)
      const inputs = collectNodeInputs(node)

      const jsonStr = JSON.stringify(inputs, null, 2)
      const indentedJson = jsonStr
        .split('\n')
        .map((line, index) => index === 0 ? line : '      ' + line)
        .join('\n')

      return `    ${varName}: ${indentedJson}`
    })
    .join(',\n')

  // Generate manual execution code
  const executionCode = generateExecutionCode(componentNodes, componentEdges)

  // Find result expression
  const resultExpr = findResultExpression(componentNodes, componentEdges)
  const resultTypeName = `Result_${componentIndex + 1}`

  return `
/**
 * Type computation typeflow ${componentIndex + 1}: ${typeflowName}
 *
 * Connected component with ${componentNodes.length} node${componentNodes.length !== 1 ? 's' : ''}
 * and ${componentEdges.length} connection${componentEdges.length !== 1 ? 's' : ''}
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
 * Manual execution for component ${componentIndex + 1}
 */
${executionCode}

// Result type for component ${componentIndex + 1}
type ${resultTypeName} = ${resultExpr}
`
}

/**
 * Generate tlang TypeFlow code from visual graph
 * Supports multiple disconnected components
 */
export function generateTLangCode(
  nodes: GraphNode[],
  edges: GraphEdge[],
  _typeflowName: string = 'MyTypeFlow'  // Legacy parameter, now auto-named as TypeFlow_1, TypeFlow_2, etc.
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

  // Step 2: Find connected components
  const components = findConnectedComponents(nodes, edges)

  // Step 3: Generate code for each component
  const componentCodes = components.map((component, index) =>
    generateComponentCode(component, edges, index)
  ).join('\n')

  // Step 4: Generate summary comment and main Result type
  const isSingleComponent = components.length === 1
  const summary = !isSingleComponent
    ? `/**
 * This graph contains ${components.length} independent connected components
 * Each component is executed separately and produces its own result type
 */`
    : ''

  // For backward compatibility: always define 'Result' type
  // Single component: Result = Result_1
  // Multiple components: Result = tuple of all results [Result_1, Result_2, ...]
  const mainResultType = isSingleComponent
    ? `\n// Final result type - output from the last node in the DAG\ntype Result = Result_1\n`
    : `\n// Multiple result types available: ${components.map((_, i) => `Result_${i + 1}`).join(', ')}\n// Combined result as tuple\ntype Result = [${components.map((_, i) => `Result_${i + 1}`).join(', ')}]\n`

  // Assemble final code
  return `${imports}

${summary}
${componentCodes}${mainResultType}
// You can now use Result${!isSingleComponent ? `_1, Result_2, etc.` : ''} in your TypeScript code
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

    // Validate number inputs for Numbers nodes to prevent type depth errors
    if (node.data.metadata.category === 'Numbers') {
      Object.entries(node.data.inputs || {}).forEach(([inputId, value]) => {
        if (typeof value === 'number') {
          // TypeScript type system has recursion depth limits (~50 levels)
          // Numbers.Add uses BuildTuple which creates tuples of length N
          // Large numbers will exceed this limit
          const MAX_SAFE_NUMBER = 100

          if (Math.abs(value) > MAX_SAFE_NUMBER) {
            errors.push(
              `Node "${node.data.label}" input "${inputId}" has value ${value} which exceeds safe limit (${MAX_SAFE_NUMBER}). ` +
              `TypeScript's type system uses tuple-based arithmetic and cannot handle large numbers. ` +
              `Please use a smaller value (≤ ${MAX_SAFE_NUMBER}).`
            )
          }
        }
      })
    }
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
