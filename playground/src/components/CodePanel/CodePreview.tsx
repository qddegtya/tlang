/**
 * Code preview panel showing generated tlang code
 */

import { useState, useEffect, useRef } from 'react'
import { Copy, Check } from 'lucide-react'
import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/themes/prism-tomorrow.css'

interface CodePreviewProps {
  code: string
  errors?: string[]
}

export function CodePreview({ code, errors = [] }: CodePreviewProps) {
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLElement>(null)

  // Highlight code whenever it changes
  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current)
    }
  }, [code])

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
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Generated Code</h2>
          <p className="mt-1 text-xs text-gray-500">
            Tlang TypeFlow definition
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
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
        <div className="p-4 border-b border-red-200 bg-red-50">
          <div className="mb-2 text-sm font-medium text-red-800">
            Validation Errors:
          </div>
          <ul className="space-y-1 list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Code display */}
      <div className="flex-1 p-4 overflow-auto bg-gray-50">
        <pre className="font-mono text-sm">
          <code ref={codeRef} className="language-typescript">{code}</code>
        </pre>
      </div>

      {/* Stats footer */}
      <div className="flex justify-between p-3 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
        <span>{code.split('\n').length} lines</span>
        <span>{code.length} characters</span>
      </div>
    </div>
  )
}
