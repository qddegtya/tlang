/**
 * Custom node component for ReactFlow
 * Displays tlang nodes with inputs and outputs
 */

import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { ArrowRight, Target } from 'lucide-react'
import type { CustomNodeData } from '../../types/graph'

export const CustomNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => {
  const { metadata, isEntry, isExit } = data

  return (
    <div
      className={`px-4 py-3 rounded-lg min-w-[180px] bg-white transition-all ${
        selected
          ? 'border-4 shadow-2xl'
          : 'border-2 shadow-lg'
      }`}
      style={{
        borderColor: metadata.style.color,
        boxShadow: selected
          ? `0 0 0 4px ${metadata.style.color}20, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`
          : undefined
      }}
    >
      {/* Node header */}
      <div
        className="font-bold text-sm mb-2 flex items-center gap-2"
        style={{ color: metadata.style.color }}
      >
        {isEntry && (
          <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-medium flex items-center gap-1">
            <Target className="w-3 h-3" />
            Entry
          </span>
        )}
        <span>{metadata.name}</span>
        {isExit && (
          <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium flex items-center gap-1">
            <ArrowRight className="w-3 h-3" />
            Exit
          </span>
        )}
      </div>

      {/* Category badge */}
      <div className="text-xs text-gray-500 mb-3">
        {metadata.category}
      </div>

      {/* Input ports */}
      <div className="space-y-2 mb-2">
        {metadata.inputs.map((input) => (
          <div key={input.id} className="flex items-center relative">
            <Handle
              type="target"
              position={Position.Left}
              id={input.id}
              style={{
                background: metadata.style.color,
                width: '12px',
                height: '12px',
                left: '-6px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
              className="!border-2 !border-white"
            />
            <div className="ml-2 flex items-center gap-1">
              <span className="text-xs text-gray-600">{input.label}</span>
              {input.required && (
                <span className="text-red-500 text-xs">*</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Output ports */}
      <div className="space-y-2 mt-2 pt-2 border-t border-gray-200">
        {metadata.outputs.map((output) => (
          <div key={output.id} className="flex items-center justify-end relative">
            <span className="text-xs text-gray-600 mr-2">{output.label}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={output.id}
              style={{
                background: metadata.style.color,
                width: '12px',
                height: '12px',
                right: '-6px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
              className="!border-2 !border-white"
            />
          </div>
        ))}
      </div>

      {/* Description tooltip on hover */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic">
          {metadata.description}
        </p>
      </div>
    </div>
  )
})

CustomNode.displayName = 'CustomNode'
