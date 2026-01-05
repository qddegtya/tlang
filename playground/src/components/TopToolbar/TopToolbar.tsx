/**
 * Top Toolbar - Global actions with icons
 */

import { FileText, Trash2, Database, Code2 } from 'lucide-react'
import logoSvg from '../../assets/logo-light.svg'

interface TopToolbarProps {
  onLoadExamples: () => void
  onClearCanvas: () => void
  onShowInputValues: () => void
  onShowGeneratedCode: () => void
  nodeCount: number
}

export function TopToolbar({
  onLoadExamples,
  onClearCanvas,
  onShowInputValues,
  onShowGeneratedCode,
  nodeCount
}: TopToolbarProps) {
  return (
    <div className="flex items-center justify-between h-12 px-4 bg-white border-b border-gray-300">
      {/* Left: Logo/Title */}
      <div className="flex items-center gap-3">
        <img src={logoSvg} alt="tlang" className="w-8 h-8" />
        <h1 className="text-lg font-bold text-gray-800">Tlang Playground</h1>
      </div>

      {/* Center: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onLoadExamples}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="Load Examples"
        >
          <FileText className="w-4 h-4" />
          <span>Examples</span>
        </button>

        <button
          onClick={onClearCanvas}
          disabled={nodeCount === 0}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded transition-colors"
          title="Clear Canvas"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear</span>
        </button>

        <div className="w-px h-6 bg-gray-300" />

        <button
          onClick={onShowInputValues}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="Input Values"
        >
          <Database className="w-4 h-4" />
          <span>Input Values</span>
        </button>

        <button
          onClick={onShowGeneratedCode}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="Generated Code"
        >
          <Code2 className="w-4 h-4" />
          <span>Generated Code</span>
        </button>
      </div>

      {/* Right: Reserved for future actions */}
      <div className="w-32" />
    </div>
  )
}
