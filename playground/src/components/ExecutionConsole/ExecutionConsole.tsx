/**
 * Resizable execution console (Chrome DevTools style)
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronUp, ChevronDown, X, Play, Loader2 } from 'lucide-react'
import type { ExecutionResult } from '../../services/typeExecutor'

interface ExecutionConsoleProps {
  onRun: () => void
  executing: boolean
  result: ExecutionResult | null
  hasErrors: boolean
}

const MIN_HEIGHT = 40 // Just the header bar
const DEFAULT_HEIGHT = 200
const MAX_HEIGHT = 600

export function ExecutionConsole({ onRun, executing, result, hasErrors }: ExecutionConsoleProps) {
  const [height, setHeight] = useState(MIN_HEIGHT)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const consoleRef = useRef<HTMLDivElement>(null)

  const toggleExpand = () => {
    if (isExpanded) {
      setHeight(MIN_HEIGHT)
      setIsExpanded(false)
    } else {
      setHeight(DEFAULT_HEIGHT)
      setIsExpanded(true)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !consoleRef.current) return

      const container = consoleRef.current.parentElement
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const newHeight = containerRect.bottom - e.clientY

      if (newHeight >= MIN_HEIGHT && newHeight <= MAX_HEIGHT) {
        setHeight(newHeight)
        setIsExpanded(newHeight > MIN_HEIGHT)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // Auto-expand when we get results
  useEffect(() => {
    if (result && !isExpanded) {
      setHeight(DEFAULT_HEIGHT)
      setIsExpanded(true)
    }
  }, [result, isExpanded])

  return (
    <div
      ref={consoleRef}
      className="bg-white border-t border-gray-300 flex flex-col"
      style={{ height: `${height}px` }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`h-1 bg-gray-200 hover:bg-blue-400 cursor-row-resize transition-colors ${
          isDragging ? 'bg-blue-500' : ''
        }`}
      />

      {/* Header */}
      <div className="h-10 bg-gray-100 border-b border-gray-300 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleExpand}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
          <span className="text-sm font-semibold text-gray-700">Execution Console</span>
          {result && (
            <span className={`text-xs px-2 py-0.5 rounded ${
              result.success
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {result.success ? 'Success' : 'Failed'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRun}
            disabled={executing || hasErrors}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded transition-colors"
          >
            {executing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                Run
              </>
            )}
          </button>

          {result && (
            <button
              onClick={() => setHeight(MIN_HEIGHT)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex-1 overflow-auto p-4 bg-gray-50 text-sm font-mono">
          {!result && (
            <div className="text-gray-400 text-center py-8">
              Click "Run" to execute the type computation
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Computed Type Result - PROMINENT DISPLAY */}
              {result.success && result.computedType && (
                <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                  <div className="text-xs font-semibold text-blue-800 mb-2 uppercase tracking-wide">
                    ⚡ Computed Result Type
                  </div>
                  <div className="text-lg font-bold text-blue-900 font-mono break-all leading-relaxed">
                    {result.computedType}
                  </div>
                </div>
              )}

              {/* Success message */}
              {result.success && result.result && (
                <div className="text-green-700 text-sm whitespace-pre-wrap">
                  {result.result}
                </div>
              )}

              {/* Error message */}
              {result.error && (
                <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3">
                  <div className="font-semibold mb-1">Error:</div>
                  {result.error}
                </div>
              )}

              {/* Diagnostics */}
              {result.diagnostics && result.diagnostics.length > 0 && (
                <div className="border-t border-gray-300 pt-3">
                  <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Diagnostics
                  </div>
                  <ul className="space-y-1 text-sm">
                    {result.diagnostics.map((diagnostic, index) => (
                      <li key={index} className="text-gray-700">
                        {diagnostic}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
