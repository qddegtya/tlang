/**
 * Bottom Status Bar - Display statistics
 */

import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'

interface StatusBarProps {
  nodeCount: number
  edgeCount: number
  errorMessages: string[]
}

export function StatusBar({ nodeCount, edgeCount, errorMessages }: StatusBarProps) {
  const [showErrors, setShowErrors] = useState(false)
  const errorCount = errorMessages.length

  return (
    <>
      <div className="h-6 bg-gray-100 border-t border-gray-300 flex items-center px-4 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>
            <span className="font-semibold">{nodeCount}</span> node{nodeCount !== 1 ? 's' : ''}
          </span>
          <span>·</span>
          <span>
            <span className="font-semibold">{edgeCount}</span> connection{edgeCount !== 1 ? 's' : ''}
          </span>
          {errorCount > 0 && (
            <>
              <span>·</span>
              <button
                onClick={() => setShowErrors(!showErrors)}
                className="text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer hover:underline"
                title="Click to see error details"
              >
                <AlertCircle className="w-3 h-3" />
                <span className="font-semibold">{errorCount}</span> error{errorCount !== 1 ? 's' : ''}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Details Panel */}
      {showErrors && errorCount > 0 && (
        <div className="absolute bottom-6 left-0 right-0 bg-red-50 border-t-2 border-red-400 shadow-lg max-h-48 overflow-y-auto z-50">
          <div className="flex items-center justify-between px-4 py-2 bg-red-100 border-b border-red-200">
            <div className="flex items-center gap-2 text-red-800 font-semibold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Validation Errors ({errorCount})</span>
            </div>
            <button
              onClick={() => setShowErrors(false)}
              className="text-red-600 hover:text-red-800"
              title="Close error panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 space-y-2">
            {errorMessages.map((error, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-xs text-red-800 bg-white border border-red-200 rounded px-3 py-2"
              >
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
