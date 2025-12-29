/**
 * Central registry for all tlang node types
 * Maps tlang operations to visual node metadata
 */

import type { TLangNodeMetadata } from '../../types/node'

/**
 * Complete registry of all tlang nodes
 */
export const nodeRegistry: Record<string, TLangNodeMetadata> = {
  // ========================================
  // Numbers - Arithmetic Operations
  // ========================================
  'Numbers.Add': {
    id: 'Numbers.Add',
    name: 'Add',
    category: 'Numbers',
    description: 'Add two numbers (a + b)',
    inputs: [
      { id: 'a', label: 'A', type: 'number', required: true },
      { id: 'b', label: 'B', type: 'number', required: true }
    ],
    outputs: [
      { id: 'sum', label: 'Sum', type: 'number', required: false }
    ],
    tlangType: 'Numbers.Add',
    style: { color: '#3b82f6' }
  },

  'Numbers.Sub': {
    id: 'Numbers.Sub',
    name: 'Subtract',
    category: 'Numbers',
    description: 'Subtract two numbers (a - b)',
    inputs: [
      { id: 'a', label: 'A', type: 'number', required: true },
      { id: 'b', label: 'B', type: 'number', required: true }
    ],
    outputs: [
      { id: 'diff', label: 'Difference', type: 'number', required: false }
    ],
    tlangType: 'Numbers.Sub',
    style: { color: '#3b82f6' }
  },

  'Numbers.Mul': {
    id: 'Numbers.Mul',
    name: 'Multiply',
    category: 'Numbers',
    description: 'Multiply two numbers (a * b)',
    inputs: [
      { id: 'a', label: 'A', type: 'number', required: true },
      { id: 'b', label: 'B', type: 'number', required: true }
    ],
    outputs: [
      { id: 'product', label: 'Product', type: 'number', required: false }
    ],
    tlangType: 'Numbers.Mul',
    style: { color: '#3b82f6' }
  },

  'Numbers.Div': {
    id: 'Numbers.Div',
    name: 'Divide',
    category: 'Numbers',
    description: 'Divide two numbers (a / b) - integer division',
    inputs: [
      { id: 'a', label: 'A', type: 'number', required: true },
      { id: 'b', label: 'B', type: 'number', required: true }
    ],
    outputs: [
      { id: 'quotient', label: 'Quotient', type: 'number', required: false }
    ],
    tlangType: 'Numbers.Div',
    style: { color: '#3b82f6' }
  },

  'Numbers.Mod': {
    id: 'Numbers.Mod',
    name: 'Modulo',
    category: 'Numbers',
    description: 'Remainder after division (a % b)',
    inputs: [
      { id: 'a', label: 'A', type: 'number', required: true },
      { id: 'b', label: 'B', type: 'number', required: true }
    ],
    outputs: [
      { id: 'remainder', label: 'Remainder', type: 'number', required: false }
    ],
    tlangType: 'Numbers.Mod',
    style: { color: '#3b82f6' }
  },

  'Numbers.Max': {
    id: 'Numbers.Max',
    name: 'Maximum',
    category: 'Numbers',
    description: 'Return the larger of two numbers',
    inputs: [
      { id: 'a', label: 'A', type: 'number', required: true },
      { id: 'b', label: 'B', type: 'number', required: true }
    ],
    outputs: [
      { id: 'max', label: 'Max', type: 'number', required: false }
    ],
    tlangType: 'Numbers.Max',
    style: { color: '#3b82f6' }
  },

  'Numbers.Min': {
    id: 'Numbers.Min',
    name: 'Minimum',
    category: 'Numbers',
    description: 'Return the smaller of two numbers',
    inputs: [
      { id: 'a', label: 'A', type: 'number', required: true },
      { id: 'b', label: 'B', type: 'number', required: true }
    ],
    outputs: [
      { id: 'min', label: 'Min', type: 'number', required: false }
    ],
    tlangType: 'Numbers.Min',
    style: { color: '#3b82f6' }
  },

  'Numbers.Equal': {
    id: 'Numbers.Equal',
    name: 'Equal',
    category: 'Numbers',
    description: 'Check if two numbers are equal',
    inputs: [
      { id: 'a', label: 'A', type: 'number', required: true },
      { id: 'b', label: 'B', type: 'number', required: true }
    ],
    outputs: [
      { id: 'result', label: 'Result', type: 'boolean', required: false }
    ],
    tlangType: 'Numbers.Equal',
    style: { color: '#3b82f6' }
  },

  'Numbers.LessThan': {
    id: 'Numbers.LessThan',
    name: 'Less Than',
    category: 'Numbers',
    description: 'Check if a < b',
    inputs: [
      { id: 'a', label: 'A', type: 'number', required: true },
      { id: 'b', label: 'B', type: 'number', required: true }
    ],
    outputs: [
      { id: 'result', label: 'Result', type: 'boolean', required: false }
    ],
    tlangType: 'Numbers.LessThan',
    style: { color: '#3b82f6' }
  },

  'Numbers.GreaterThan': {
    id: 'Numbers.GreaterThan',
    name: 'Greater Than',
    category: 'Numbers',
    description: 'Check if a > b',
    inputs: [
      { id: 'a', label: 'A', type: 'number', required: true },
      { id: 'b', label: 'B', type: 'number', required: true }
    ],
    outputs: [
      { id: 'result', label: 'Result', type: 'boolean', required: false }
    ],
    tlangType: 'Numbers.GreaterThan',
    style: { color: '#3b82f6' }
  },

  // ========================================
  // Strings - Basic Operations
  // ========================================
  'Strings.Length': {
    id: 'Strings.Length',
    name: 'Length',
    category: 'Strings',
    description: 'Get the length of a string',
    inputs: [
      { id: 'in', label: 'String', type: 'string', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Length', type: 'number', required: false }
    ],
    tlangType: 'Strings.Length',
    style: { color: '#10b981' }
  },

  'Strings.ToTuple': {
    id: 'Strings.ToTuple',
    name: 'To Tuple',
    category: 'Strings',
    description: 'Convert string to tuple of characters',
    inputs: [
      { id: 'in', label: 'String', type: 'string', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Tuple', type: 'array', required: false }
    ],
    tlangType: 'Strings.ToTuple',
    style: { color: '#10b981' }
  },

  'Strings.ToString': {
    id: 'Strings.ToString',
    name: 'To String',
    category: 'Strings',
    description: 'Convert value to string',
    inputs: [
      { id: 'in', label: 'Value', type: 'any', required: true }
    ],
    outputs: [
      { id: 'out', label: 'String', type: 'string', required: false }
    ],
    tlangType: 'Strings.ToString',
    style: { color: '#10b981' }
  },

  'Strings.ToNumber': {
    id: 'Strings.ToNumber',
    name: 'To Number',
    category: 'Strings',
    description: 'Convert string to number',
    inputs: [
      { id: 'in', label: 'String', type: 'string', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Number', type: 'number', required: false }
    ],
    tlangType: 'Strings.ToNumber',
    style: { color: '#10b981' }
  },

  'Strings.Uppercase': {
    id: 'Strings.Uppercase',
    name: 'Uppercase',
    category: 'Strings',
    description: 'Transform string to UPPERCASE',
    inputs: [
      { id: 'in', label: 'String', type: 'string', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Uppercase', type: 'string', required: false }
    ],
    tlangType: 'Strings.Uppercase',
    style: { color: '#10b981' }
  },

  'Strings.Lowercase': {
    id: 'Strings.Lowercase',
    name: 'Lowercase',
    category: 'Strings',
    description: 'Transform string to lowercase',
    inputs: [
      { id: 'in', label: 'String', type: 'string', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Lowercase', type: 'string', required: false }
    ],
    tlangType: 'Strings.Lowercase',
    style: { color: '#10b981' }
  },

  'Strings.Capitalize': {
    id: 'Strings.Capitalize',
    name: 'Capitalize',
    category: 'Strings',
    description: 'Capitalize first character',
    inputs: [
      { id: 'in', label: 'String', type: 'string', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Capitalized', type: 'string', required: false }
    ],
    tlangType: 'Strings.Capitalize',
    style: { color: '#10b981' }
  },

  'Strings.Uncapitalize': {
    id: 'Strings.Uncapitalize',
    name: 'Uncapitalize',
    category: 'Strings',
    description: 'Uncapitalize first character',
    inputs: [
      { id: 'in', label: 'String', type: 'string', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Result', type: 'string', required: false }
    ],
    tlangType: 'Strings.Uncapitalize',
    style: { color: '#10b981' }
  },

  'Strings.CamelCase': {
    id: 'Strings.CamelCase',
    name: 'CamelCase',
    category: 'Strings',
    description: 'Convert to camelCase',
    inputs: [
      { id: 'in', label: 'String', type: 'string', required: true }
    ],
    outputs: [
      { id: 'out', label: 'CamelCase', type: 'string', required: false }
    ],
    tlangType: 'Strings.CamelCase',
    style: { color: '#10b981' }
  },

  'Strings.SnakeCase': {
    id: 'Strings.SnakeCase',
    name: 'SnakeCase',
    category: 'Strings',
    description: 'Convert to snake_case',
    inputs: [
      { id: 'in', label: 'String', type: 'string', required: true }
    ],
    outputs: [
      { id: 'out', label: 'snake_case', type: 'string', required: false }
    ],
    tlangType: 'Strings.SnakeCase',
    style: { color: '#10b981' }
  },

  'Strings.KebabCase': {
    id: 'Strings.KebabCase',
    name: 'KebabCase',
    category: 'Strings',
    description: 'Convert to kebab-case',
    inputs: [
      { id: 'in', label: 'String', type: 'string', required: true }
    ],
    outputs: [
      { id: 'out', label: 'kebab-case', type: 'string', required: false }
    ],
    tlangType: 'Strings.KebabCase',
    style: { color: '#10b981' }
  },

  // ========================================
  // Objects - Basic Transformations
  // ========================================
  'Objects.Partial': {
    id: 'Objects.Partial',
    name: 'Partial',
    category: 'Objects',
    description: 'Make all properties optional',
    inputs: [
      { id: 'in', label: 'Object', type: 'object', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Partial', type: 'object', required: false }
    ],
    tlangType: 'Partial', // Top-level export from basic.ts, not Objects namespace
    style: { color: '#f59e0b' }
  },

  'Objects.Required': {
    id: 'Objects.Required',
    name: 'Required',
    category: 'Objects',
    description: 'Make all properties required',
    inputs: [
      { id: 'in', label: 'Object', type: 'object', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Required', type: 'object', required: false }
    ],
    tlangType: 'Required', // Top-level export from basic.ts, not Objects namespace
    style: { color: '#f59e0b' }
  },

  'Objects.Readonly': {
    id: 'Objects.Readonly',
    name: 'Readonly',
    category: 'Objects',
    description: 'Make all properties readonly',
    inputs: [
      { id: 'in', label: 'Object', type: 'object', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Readonly', type: 'object', required: false }
    ],
    tlangType: 'Readonly', // Top-level export from basic.ts, not Objects namespace
    style: { color: '#f59e0b' }
  },

  'Objects.Keys': {
    id: 'Objects.Keys',
    name: 'Keys',
    category: 'Objects',
    description: 'Get object keys as tuple',
    inputs: [
      { id: 'in', label: 'Object', type: 'object', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Keys', type: 'array', required: false }
    ],
    tlangType: 'Objects.Keys',
    style: { color: '#f59e0b' }
  },

  'Objects.Values': {
    id: 'Objects.Values',
    name: 'Values',
    category: 'Objects',
    description: 'Get object values as tuple',
    inputs: [
      { id: 'in', label: 'Object', type: 'object', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Values', type: 'array', required: false }
    ],
    tlangType: 'Objects.Values',
    style: { color: '#f59e0b' }
  },

  'Objects.Entries': {
    id: 'Objects.Entries',
    name: 'Entries',
    category: 'Objects',
    description: 'Convert object to entries',
    inputs: [
      { id: 'in', label: 'Object', type: 'object', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Entries', type: 'array', required: false }
    ],
    tlangType: 'Objects.Entries',
    style: { color: '#f59e0b' }
  },

  'Objects.FromEntries': {
    id: 'Objects.FromEntries',
    name: 'FromEntries',
    category: 'Objects',
    description: 'Convert entries to object',
    inputs: [
      { id: 'in', label: 'Entries', type: 'array', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Object', type: 'object', required: false }
    ],
    tlangType: 'Objects.FromEntries',
    style: { color: '#f59e0b' }
  },

  // ========================================
  // Tuples - Array Operations
  // ========================================
  'Tuples.Head': {
    id: 'Tuples.Head',
    name: 'Head',
    category: 'Tuples',
    description: 'Get the first element of a tuple',
    inputs: [
      { id: 'in', label: 'Tuple', type: 'array', required: true }
    ],
    outputs: [
      { id: 'out', label: 'First', type: 'any', required: false }
    ],
    tlangType: 'Tuples.Head',
    style: { color: '#8b5cf6' }
  },

  'Tuples.Tail': {
    id: 'Tuples.Tail',
    name: 'Tail',
    category: 'Tuples',
    description: 'Get all elements except the first',
    inputs: [
      { id: 'in', label: 'Tuple', type: 'array', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Rest', type: 'array', required: false }
    ],
    tlangType: 'Tuples.Tail',
    style: { color: '#8b5cf6' }
  },

  'Tuples.Last': {
    id: 'Tuples.Last',
    name: 'Last',
    category: 'Tuples',
    description: 'Get the last element of a tuple',
    inputs: [
      { id: 'in', label: 'Tuple', type: 'array', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Last', type: 'any', required: false }
    ],
    tlangType: 'Tuples.Last',
    style: { color: '#8b5cf6' }
  },

  // ========================================
  // Booleans - Logic Operations
  // ========================================
  'Booleans.And': {
    id: 'Booleans.And',
    name: 'And',
    category: 'Booleans',
    description: 'Logical AND (a && b)',
    inputs: [
      { id: 'a', label: 'A', type: 'boolean', required: true },
      { id: 'b', label: 'B', type: 'boolean', required: true }
    ],
    outputs: [
      { id: 'result', label: 'Result', type: 'boolean', required: false }
    ],
    tlangType: 'Booleans.And',
    style: { color: '#ef4444' }
  },

  'Booleans.Or': {
    id: 'Booleans.Or',
    name: 'Or',
    category: 'Booleans',
    description: 'Logical OR (a || b)',
    inputs: [
      { id: 'a', label: 'A', type: 'boolean', required: true },
      { id: 'b', label: 'B', type: 'boolean', required: true }
    ],
    outputs: [
      { id: 'result', label: 'Result', type: 'boolean', required: false }
    ],
    tlangType: 'Booleans.Or',
    style: { color: '#ef4444' }
  },

  'Booleans.Not': {
    id: 'Booleans.Not',
    name: 'Not',
    category: 'Booleans',
    description: 'Logical NOT (!value)',
    inputs: [
      { id: 'in', label: 'Value', type: 'boolean', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Result', type: 'boolean', required: false }
    ],
    tlangType: 'Booleans.Not',
    style: { color: '#ef4444' }
  },

  'Booleans.Xor': {
    id: 'Booleans.Xor',
    name: 'Xor',
    category: 'Booleans',
    description: 'Logical XOR (exclusive or)',
    inputs: [
      { id: 'a', label: 'A', type: 'boolean', required: true },
      { id: 'b', label: 'B', type: 'boolean', required: true }
    ],
    outputs: [
      { id: 'result', label: 'Result', type: 'boolean', required: false }
    ],
    tlangType: 'Booleans.Xor',
    style: { color: '#ef4444' }
  },

  'Booleans.Equals': {
    id: 'Booleans.Equals',
    name: 'Equals',
    category: 'Booleans',
    description: 'Check if two booleans are equal',
    inputs: [
      { id: 'a', label: 'A', type: 'boolean', required: true },
      { id: 'b', label: 'B', type: 'boolean', required: true }
    ],
    outputs: [
      { id: 'result', label: 'Result', type: 'boolean', required: false }
    ],
    tlangType: 'Booleans.Equals',
    style: { color: '#ef4444' }
  },

  // ========================================
  // Unions - Union Type Operations
  // ========================================
  'Unions.UnionKeys': {
    id: 'Unions.UnionKeys',
    name: 'Union Keys',
    category: 'Unions',
    description: 'Extract all possible keys from a union',
    inputs: [
      { id: 'in', label: 'Union', type: 'any', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Keys', type: 'any', required: false }
    ],
    tlangType: 'UnionKeys', // Top-level export from union.ts
    style: { color: '#ec4899' }
  },

  'Unions.UnionToIntersection': {
    id: 'Unions.UnionToIntersection',
    name: 'Union → Intersection',
    category: 'Unions',
    description: 'Convert union to intersection (A | B → A & B)',
    inputs: [
      { id: 'in', label: 'Union', type: 'any', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Intersection', type: 'any', required: false }
    ],
    tlangType: 'UnionToIntersection', // Top-level export from union.ts
    style: { color: '#ec4899' }
  },

  // ========================================
  // Deep - Deep Recursive Transformations
  // ========================================
  'Deep.DeepPartial': {
    id: 'Deep.DeepPartial',
    name: 'Deep Partial',
    category: 'Deep',
    description: 'Make all properties optional recursively',
    inputs: [
      { id: 'in', label: 'Object', type: 'object', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Result', type: 'object', required: false }
    ],
    tlangType: 'DeepPartial', // Top-level export from deep.ts
    style: { color: '#06b6d4' }
  },

  'Deep.DeepReadonly': {
    id: 'Deep.DeepReadonly',
    name: 'Deep Readonly',
    category: 'Deep',
    description: 'Make all properties readonly recursively',
    inputs: [
      { id: 'in', label: 'Object', type: 'object', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Result', type: 'object', required: false }
    ],
    tlangType: 'DeepReadonly', // Top-level export from deep.ts
    style: { color: '#06b6d4' }
  },

  'Deep.DeepRequired': {
    id: 'Deep.DeepRequired',
    name: 'Deep Required',
    category: 'Deep',
    description: 'Make all properties required recursively',
    inputs: [
      { id: 'in', label: 'Object', type: 'object', required: true }
    ],
    outputs: [
      { id: 'out', label: 'Result', type: 'object', required: false }
    ],
    tlangType: 'DeepRequired', // Top-level export from deep.ts
    style: { color: '#06b6d4' }
  }
}

/**
 * Get all nodes for a specific category
 */
export function getNodesByCategory(category: string): TLangNodeMetadata[] {
  return Object.values(nodeRegistry).filter(node => node.category === category)
}

/**
 * Get node metadata by ID
 */
export function getNodeById(id: string): TLangNodeMetadata | undefined {
  return nodeRegistry[id]
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const categories = new Set(Object.values(nodeRegistry).map(node => node.category))
  return Array.from(categories).sort()
}
