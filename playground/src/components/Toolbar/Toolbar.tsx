/**
 * Top toolbar with actions and examples
 */

import { FileCode, Trash2 } from 'lucide-react'
import { exampleProjects } from '../../data/examples'
import type { Project } from '../../types/project'

interface ToolbarProps {
  onLoadExample: (project: Project) => void
  onClearCanvas: () => void
  nodeCount: number
  edgeCount: number
}

export function Toolbar({ onLoadExample, onClearCanvas, nodeCount, edgeCount }: ToolbarProps) {
  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-800">Tlang Playground</h1>
        <span className="text-sm text-gray-500">Visual Type System Editor</span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* Stats */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{nodeCount} nodes</span>
          <span>{edgeCount} connections</span>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300"></div>

        {/* Load Example Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <FileCode className="w-4 h-4" />
            Load Example
          </button>
          <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <div className="p-2 space-y-1">
              {exampleProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onLoadExample(project)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-800">{project.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{project.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clear Canvas */}
        <button
          onClick={onClearCanvas}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear Canvas
        </button>
      </div>
    </div>
  )
}
