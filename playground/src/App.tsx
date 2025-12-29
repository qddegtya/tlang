/**
 * Main application component
 */

import { useState, useCallback, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeTypes,
  type ReactFlowInstance,
  ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'

import { CustomNode } from './components/Canvas/CustomNode'
import { NodePalette } from './components/NodeLibrary/NodePalette'
import { CodePreview } from './components/CodePanel/CodePreview'
import { InputPanel } from './components/InputPanel/InputPanel'
import { Toolbar } from './components/Toolbar/Toolbar'
import { ExecutionConsole } from './components/ExecutionConsole/ExecutionConsole'
import { getNodeById } from './core/nodes/registry'
import { generateTLangCode, validateGraph } from './core/graph/transformer'
import { executeTypeScript, type ExecutionResult } from './services/typeExecutor'
import type { GraphNode, CustomNodeData } from './types/graph'
import type { Project } from './types/project'

const nodeTypes: NodeTypes = {
  tlangNode: CustomNode
}

let nodeIdCounter = 0

function AppContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [executing, setExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)

  // Validate connection based on node metadata
  const isValidConnection = useCallback((connection: Connection) => {
    // Prevent self-loops
    if (connection.source === connection.target) {
      return false
    }

    // Get source and target nodes
    const sourceNode = nodes.find(n => n.id === connection.source)
    const targetNode = nodes.find(n => n.id === connection.target)

    if (!sourceNode || !targetNode) {
      return false
    }

    // Get port definitions from metadata
    const sourceHandle = connection.sourceHandle ?? 'out'
    const targetHandle = connection.targetHandle ?? 'in'

    const sourcePort = sourceNode.data.metadata.outputs.find(p => p.id === sourceHandle)
    const targetPort = targetNode.data.metadata.inputs.find(p => p.id === targetHandle)

    if (!sourcePort || !targetPort) {
      return false
    }

    // Type compatibility check
    // 'any' type can connect to anything, and anything can connect to 'any'
    if (sourcePort.type === 'any' || targetPort.type === 'any') {
      return true
    }

    // Types must match
    return sourcePort.type === targetPort.type
  }, [nodes])

  // Handle connection between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      if (isValidConnection(params)) {
        setEdges((eds) => addEdge(params, eds))
      }
    },
    [setEdges, isValidConnection]
  )

  // Handle drag over canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // Handle drop on canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const nodeId = event.dataTransfer.getData('application/reactflow')
      if (!nodeId || !reactFlowWrapper.current || !reactFlowInstance) {
        return
      }

      const metadata = getNodeById(nodeId)
      if (!metadata) return

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      })

      const newNode: GraphNode = {
        id: `node_${nodeIdCounter++}`,
        type: 'tlangNode',
        position,
        data: {
          metadata,
          label: metadata.name,
          inputs: {}
        }
      }

      setNodes((nds) => [...nds, newNode])
    },
    [reactFlowInstance, setNodes]
  )

  // Load example project
  const loadExample = useCallback((project: Project) => {
    setNodes(project.nodes as GraphNode[])
    setEdges(project.edges)
  }, [setNodes, setEdges])

  // Clear canvas
  const clearCanvas = useCallback(() => {
    setNodes([])
    setEdges([])
  }, [setNodes, setEdges])

  // Update node inputs
  const updateNodeInputs = useCallback((nodeId: string, inputs: Record<string, unknown>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, inputs } }
          : node
      )
    )
  }, [setNodes])

  // Generate code
  const generatedCode = generateTLangCode(nodes, edges, 'MyNetwork')
  const validationErrors = validateGraph(nodes, edges)

  // Execute TypeScript code
  const handleRun = useCallback(async () => {
    setExecuting(true)
    setExecutionResult(null)

    try {
      const result = await executeTypeScript(generatedCode)
      setExecutionResult(result)
    } catch (error) {
      setExecutionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setExecuting(false)
    }
  }, [generatedCode])

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-100">
      {/* Top toolbar */}
      <Toolbar
        onLoadExample={loadExample}
        onClearCanvas={clearCanvas}
        nodeCount={nodes.length}
        edgeCount={edges.length}
      />

      {/* Main content area with console */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Node palette */}
          <NodePalette />

          {/* Center: Canvas */}
          <div className="flex-1" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              className="bg-gray-50"
            >
              <Background />
              <Controls />
              <MiniMap
                nodeColor={(node) => {
                  const customNode = node as GraphNode
                  return customNode.data?.metadata?.style?.color ?? '#999'
                }}
                className="bg-white"
              />
            </ReactFlow>
          </div>

          {/* Right: Input panel and code preview */}
          <div className="w-96 border-l border-gray-200 flex flex-col">
            {/* Input panel - top half */}
            <div className="flex-1 border-b border-gray-200 overflow-hidden">
              <InputPanel
                nodes={nodes}
                edges={edges}
                onUpdateNodeInputs={updateNodeInputs}
              />
            </div>

            {/* Code preview - bottom half */}
            <div className="flex-1 overflow-hidden">
              <CodePreview code={generatedCode} errors={validationErrors} />
            </div>
          </div>
        </div>

        {/* Bottom: Execution console */}
        <ExecutionConsole
          onRun={handleRun}
          executing={executing}
          result={executionResult}
          hasErrors={validationErrors.length > 0}
        />
      </div>
    </div>
  )
}

function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  )
}

export default App
