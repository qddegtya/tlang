/**
 * Individual node card in the palette
 * Draggable to canvas
 */

import type { TLangNodeMetadata } from '../../types/node'

interface NodeCardProps {
  node: TLangNodeMetadata
}

export function NodeCard({ node }: NodeCardProps) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', node.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="w-full text-left p-3 rounded border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all bg-white cursor-grab active:cursor-grabbing group"
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: node.style.color
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Node name */}
          <div className="font-medium text-sm text-gray-800 mb-0.5 truncate">{node.name}</div>

          {/* Description */}
          <div className="text-xs text-gray-500 line-clamp-2 mb-1.5">{node.description}</div>

          {/* Ports summary */}
          <div className="flex gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              {node.inputs.length} in
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: node.style.color }}></span>
              {node.outputs.length} out
            </span>
          </div>
        </div>

        {/* Drag indicator */}
        <div className="text-gray-300 group-hover:text-gray-400 transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
          </svg>
        </div>
      </div>
    </div>
  )
}
