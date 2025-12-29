/**
 * Dynamic input panel for entry nodes
 * Renders form fields based on node metadata
 */

import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import type { GraphNode, GraphEdge } from '../../types/graph'
import type { PortDefinition } from '../../types/node'

interface InputPanelProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  onUpdateNodeInputs: (nodeId: string, inputs: Record<string, unknown>) => void
}

export function InputPanel({ nodes, edges, onUpdateNodeInputs }: InputPanelProps) {
  // Find entry nodes (nodes with no incoming edges)
  const entryNodeIds = new Set(edges.map(e => e.target))
  const entryNodes = nodes.filter(node => !entryNodeIds.has(node.id))

  if (entryNodes.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Input Values
          </h2>
          <p className="text-xs text-gray-500 mt-1">Configure entry node inputs</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-500 text-sm">
          No entry nodes. Add nodes to the canvas or connect nodes to create entry points.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Input Values
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {entryNodes.length} entry node{entryNodes.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {entryNodes.map(node => (
          <NodeInputForm
            key={node.id}
            node={node}
            onUpdate={(inputs) => onUpdateNodeInputs(node.id, inputs)}
          />
        ))}
      </div>
    </div>
  )
}

interface NodeInputFormProps {
  node: GraphNode
  onUpdate: (inputs: Record<string, unknown>) => void
}

function NodeInputForm({ node, onUpdate }: NodeInputFormProps) {
  const [inputs, setInputs] = useState<Record<string, unknown>>(() => {
    // Initialize with default values on first render
    const initialInputs: Record<string, unknown> = { ...node.data.inputs }
    node.data.metadata.inputs.forEach(input => {
      if (input.required && !(input.id in initialInputs)) {
        initialInputs[input.id] = getDefaultValue(input)
      }
    })
    return initialInputs
  })

  // Sync with parent when inputs change
  useEffect(() => {
    onUpdate(inputs)
  }, [inputs, onUpdate])

  const handleChange = (inputId: string, value: unknown) => {
    const newInputs = { ...inputs, [inputId]: value }
    setInputs(newInputs)
    onUpdate(newInputs)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: node.data.metadata.style.color }}
        ></div>
        <h3 className="font-semibold text-gray-800">{node.data.label}</h3>
        <span className="text-xs text-gray-500">({node.data.metadata.category})</span>
      </div>

      <div className="space-y-3">
        {node.data.metadata.inputs.filter(input => input.required).map(input => (
          <InputField
            key={input.id}
            input={input}
            value={inputs[input.id]}
            onChange={(value) => handleChange(input.id, value)}
          />
        ))}
      </div>
    </div>
  )
}

interface InputFieldProps {
  input: PortDefinition
  value: unknown
  onChange: (value: unknown) => void
}

function InputField({ input, value, onChange }: InputFieldProps) {
  const [error, setError] = useState<string | null>(null)

  const handleStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setError(null)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value)
    if (!isNaN(num)) {
      onChange(num)
      setError(null)
    } else {
      setError('Invalid number')
    }
  }

  const handleBooleanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
    setError(null)
  }

  const handleJSONChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    try {
      const parsed = JSON.parse(text)
      onChange(parsed)
      setError(null)
    } catch (err) {
      setError('Invalid JSON')
      // Still update the raw text so user can continue editing
    }
  }

  const renderInput = () => {
    switch (input.type) {
      case 'string':
        return (
          <input
            type="text"
            value={(value as string) ?? ''}
            onChange={handleStringChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter ${input.label.toLowerCase()}...`}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={(value as number) ?? 0}
            onChange={handleNumberChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter ${input.label.toLowerCase()}...`}
          />
        )

      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={(value as boolean) ?? false}
              onChange={handleBooleanChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {(value as boolean) ? 'true' : 'false'}
            </span>
          </label>
        )

      case 'object':
      case 'array':
        return (
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={handleJSONChange}
            rows={4}
            className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            placeholder={input.type === 'object' ? '{ "key": "value" }' : '[1, 2, 3]'}
          />
        )

      default:
        return (
          <input
            type="text"
            value={String(value ?? '')}
            onChange={handleStringChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter ${input.label.toLowerCase()}...`}
          />
        )
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {input.label}
        {input.required && <span className="text-red-500 ml-1">*</span>}
        <span className="text-xs text-gray-500 ml-2">({input.type})</span>
      </label>
      {renderInput()}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}

function getDefaultValue(input: PortDefinition): unknown {
  switch (input.type) {
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
