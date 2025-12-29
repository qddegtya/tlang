/**
 * Custom node component for ReactFlow
 * Displays tlang nodes with inputs and outputs
 */

import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { CustomNodeData } from '../../types/graph'

export const CustomNode = memo(({ data }: NodeProps<CustomNodeData>) => {
  const { metadata } = data

  return (
    <div
      className="px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] bg-white"
      style={{
        borderColor: metadata.style.color
      }}
    >
      {/* Node header */}
      <div
        className="font-bold text-sm mb-2 flex items-center gap-2"
        style={{ color: metadata.style.color }}
      >
        <span>{metadata.name}</span>
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
