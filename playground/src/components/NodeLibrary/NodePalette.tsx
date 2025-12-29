/**
 * Node palette - displays available nodes by category for drag-and-drop
 * Accordion-style layout similar to n8n
 */

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { getAllCategories, getNodesByCategory } from '../../core/nodes/registry'
import { NodeCard } from './NodeCard'

export function NodePalette() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Numbers']))
  const categories = getAllCategories()

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  return (
    <div className="w-80 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Node Library</h2>
        <p className="text-xs text-gray-500 mt-1">Drag nodes to the canvas to build your type system</p>
      </div>

      {/* Accordion categories */}
      <div className="flex-1 overflow-y-auto">
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category)
          const nodes = getNodesByCategory(category)

          return (
            <div key={category} className="border-b border-gray-200">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="font-semibold text-sm text-gray-700">{category}</span>
                  <span className="text-xs text-gray-400">({nodes.length})</span>
                </div>
              </button>

              {/* Category nodes */}
              {isExpanded && (
                <div className="bg-gray-50 px-2 py-2 space-y-1">
                  {nodes.map((node) => (
                    <NodeCard key={node.id} node={node} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
