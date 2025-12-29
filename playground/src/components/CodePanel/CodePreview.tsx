/**
 * Code preview panel showing generated tlang code
 */

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodePreviewProps {
  code: string
  errors?: string[]
}

export function CodePreview({ code, errors = [] }: CodePreviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Generated Code</h2>
          <p className="text-xs text-gray-500 mt-1">
            tlang Network definition
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Code
            </>
          )}
        </button>
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="text-sm font-medium text-red-800 mb-2">
            Validation Errors:
          </div>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Code display */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <pre className="text-sm font-mono">
          <code className="language-typescript">{code}</code>
        </pre>
      </div>

      {/* Stats footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between">
        <span>{code.split('\n').length} lines</span>
        <span>{code.length} characters</span>
      </div>
    </div>
  )
}
