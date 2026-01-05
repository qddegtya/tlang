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
  ReactFlowProvider,
  type NodeMouseHandler
} from 'reactflow'
import 'reactflow/dist/style.css'

import { CustomNode } from './components/Canvas/CustomNode'
import { NodePalette } from './components/NodeLibrary/NodePalette'
import { CodePreview } from './components/CodePanel/CodePreview'
import { InputPanel } from './components/InputPanel/InputPanel'
import { TopToolbar } from './components/TopToolbar/TopToolbar'
import { StatusBar } from './components/StatusBar/StatusBar'
import { NodePropertiesPanel } from './components/NodePropertiesPanel/NodePropertiesPanel'
import { ExecutionConsole } from './components/ExecutionConsole/ExecutionConsole'
import { ExamplesDialog } from './components/ExamplesDialog/ExamplesDialog'
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

  // UI state
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [showInputValuesDialog, setShowInputValuesDialog] = useState(false)
  const [showCodeDialog, setShowCodeDialog] = useState(false)
  const [showExamplesDialog, setShowExamplesDialog] = useState(false)

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

  // Update node data (for properties panel)
  const updateNodeData = useCallback((nodeId: string, updates: Partial<GraphNode['data']>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    )
    // Update selected node
    if (selectedNode?.id === nodeId) {
      setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...updates } } : null)
    }
  }, [setNodes, selectedNode])

  // Handle node double click
  const onNodeDoubleClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node as GraphNode)
    // Mark this node as selected
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: n.id === node.id
      }))
    )
  }, [setNodes])

  // Calculate entry/exit nodes for visualization
  const nodesWithFlowInfo = nodes.map(node => {
    const hasIncomingEdge = edges.some(e => e.target === node.id)
    const hasOutgoingEdge = edges.some(e => e.source === node.id)
    return {
      ...node,
      data: {
        ...node.data,
        isEntry: !hasIncomingEdge && nodes.length > 1,
        isExit: !hasOutgoingEdge && nodes.length > 1
      }
    }
  })

  // Generate code
  const generatedCode = generateTLangCode(nodes, edges, 'MyTypeFlow')
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
      {/* Top Toolbar */}
      <TopToolbar
        onLoadExamples={() => setShowExamplesDialog(true)}
        onClearCanvas={clearCanvas}
        onShowInputValues={() => setShowInputValuesDialog(true)}
        onShowGeneratedCode={() => setShowCodeDialog(true)}
        nodeCount={nodes.length}
      />

      {/* Main content area with console */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Node palette */}
          <NodePalette />

          {/* Center: Canvas */}
          <div className="flex-1" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodesWithFlowInfo}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeDoubleClick={onNodeDoubleClick}
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

          {/* Right: Node properties panel (conditional) */}
          {selectedNode && (
            <NodePropertiesPanel
              node={selectedNode}
              nodes={nodes}
              edges={edges}
              onClose={() => {
                setSelectedNode(null)
                // Clear selection state
                setNodes((nds) => nds.map((n) => ({ ...n, selected: false })))
              }}
              onUpdate={updateNodeData}
            />
          )}
        </div>

        {/* Bottom: Status Bar */}
        <StatusBar
          nodeCount={nodes.length}
          edgeCount={edges.length}
          errorMessages={validationErrors}
        />

        {/* Bottom: Execution console */}
        <ExecutionConsole
          onRun={handleRun}
          executing={executing}
          result={executionResult}
          hasErrors={validationErrors.length > 0}
        />
      </div>

      {/* Dialogs */}
      {showExamplesDialog && (
        <ExamplesDialog
          onLoadExample={(project) => {
            loadExample(project)
            setShowExamplesDialog(false)
          }}
          onClose={() => setShowExamplesDialog(false)}
        />
      )}

      {showInputValuesDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[800px] h-[600px] flex flex-col">
            <div className="h-12 bg-gray-100 border-b border-gray-300 flex items-center justify-between px-4">
              <h2 className="font-semibold text-gray-800">Input Values</h2>
              <button
                onClick={() => setShowInputValuesDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <InputPanel
                nodes={nodes}
                edges={edges}
                onUpdateNodeInputs={updateNodeInputs}
              />
            </div>
          </div>
        </div>
      )}

      {showCodeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[800px] h-[600px] flex flex-col">
            <div className="h-12 bg-gray-100 border-b border-gray-300 flex items-center justify-between px-4">
              <h2 className="font-semibold text-gray-800">Generated Code</h2>
              <button
                onClick={() => setShowCodeDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CodePreview code={generatedCode} errors={validationErrors} />
            </div>
          </div>
        </div>
      )}
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
