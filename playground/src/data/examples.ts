/**
 * Example projects for user guidance
 */

import type { Project } from '../types/project'

/**
 * Example 1: String Case Conversion Pipeline
 * Demonstrates string transformation with multiple nodes
 */
export const exampleStringTransform: Project = {
  id: 'example-string-transform',
  name: 'StringCaseConversion',
  description: 'Convert string through multiple case transformations',
  nodes: [
    {
      id: 'input_node',
      type: 'tlangNode',
      position: { x: 100, y: 200 },
      data: {
        metadata: {
          id: 'Strings.Lowercase',
          name: 'Lowercase',
          category: 'Strings',
          description: 'Transform string to lowercase',
          inputs: [{ id: 'in', label: 'String', type: 'string', required: true }],
          outputs: [{ id: 'out', label: 'Lowercase', type: 'string', required: false }],
          tlangType: 'Strings.Lowercase',
          style: { color: '#10b981' }
        },
        label: 'Lowercase'
      }
    },
    {
      id: 'camel_node',
      type: 'tlangNode',
      position: { x: 400, y: 200 },
      data: {
        metadata: {
          id: 'Strings.CamelCase',
          name: 'CamelCase',
          category: 'Strings',
          description: 'Convert to camelCase',
          inputs: [{ id: 'in', label: 'String', type: 'string', required: true }],
          outputs: [{ id: 'out', label: 'CamelCase', type: 'string', required: false }],
          tlangType: 'Strings.CamelCase',
          style: { color: '#10b981' }
        },
        label: 'CamelCase'
      }
    }
  ],
  edges: [
    {
      id: 'e1',
      source: 'input_node',
      sourceHandle: 'out',
      target: 'camel_node',
      targetHandle: 'in'
    }
  ],
  createdAt: Date.now(),
  updatedAt: Date.now()
}

/**
 * Example 2: Number Arithmetic
 * Demonstrates number operations and comparisons
 */
export const exampleNumberArithmetic: Project = {
  id: 'example-number-arithmetic',
  name: 'NumberCalculations',
  description: 'Add numbers and compare results',
  nodes: [
    {
      id: 'add_node',
      type: 'tlangNode',
      position: { x: 100, y: 150 },
      data: {
        metadata: {
          id: 'Numbers.Add',
          name: 'Add',
          category: 'Numbers',
          description: 'Add two numbers (a + b)',
          inputs: [
            { id: 'a', label: 'A', type: 'number', required: true },
            { id: 'b', label: 'B', type: 'number', required: true }
          ],
          outputs: [{ id: 'sum', label: 'Sum', type: 'number', required: false }],
          tlangType: 'Numbers.Add',
          style: { color: '#3b82f6' }
        },
        label: 'Add',
        inputs: { a: 10, b: 5 }
      }
    },
    {
      id: 'mul_node',
      type: 'tlangNode',
      position: { x: 100, y: 300 },
      data: {
        metadata: {
          id: 'Numbers.Mul',
          name: 'Multiply',
          category: 'Numbers',
          description: 'Multiply two numbers (a * b)',
          inputs: [
            { id: 'a', label: 'A', type: 'number', required: true },
            { id: 'b', label: 'B', type: 'number', required: true }
          ],
          outputs: [{ id: 'product', label: 'Product', type: 'number', required: false }],
          tlangType: 'Numbers.Mul',
          style: { color: '#3b82f6' }
        },
        label: 'Multiply',
        inputs: { a: 3, b: 4 }
      }
    },
    {
      id: 'compare_node',
      type: 'tlangNode',
      position: { x: 450, y: 225 },
      data: {
        metadata: {
          id: 'Numbers.GreaterThan',
          name: 'Greater Than',
          category: 'Numbers',
          description: 'Check if a > b',
          inputs: [
            { id: 'a', label: 'A', type: 'number', required: true },
            { id: 'b', label: 'B', type: 'number', required: true }
          ],
          outputs: [{ id: 'result', label: 'Result', type: 'boolean', required: false }],
          tlangType: 'Numbers.GreaterThan',
          style: { color: '#3b82f6' }
        },
        label: 'Greater Than'
      }
    }
  ],
  edges: [
    {
      id: 'e1',
      source: 'add_node',
      sourceHandle: 'sum',
      target: 'compare_node',
      targetHandle: 'a'
    },
    {
      id: 'e2',
      source: 'mul_node',
      sourceHandle: 'product',
      target: 'compare_node',
      targetHandle: 'b'
    }
  ],
  createdAt: Date.now(),
  updatedAt: Date.now()
}

/**
 * Example 3: Object Transformation
 * Demonstrates object manipulation operations
 */
export const exampleObjectTransform: Project = {
  id: 'example-object-transform',
  name: 'ObjectTransformation',
  description: 'Transform objects with Partial and Readonly',
  nodes: [
    {
      id: 'partial_node',
      type: 'tlangNode',
      position: { x: 150, y: 200 },
      data: {
        metadata: {
          id: 'Objects.Partial',
          name: 'Partial',
          category: 'Objects',
          description: 'Make all properties optional',
          inputs: [{ id: 'in', label: 'Object', type: 'object', required: true }],
          outputs: [{ id: 'out', label: 'Partial', type: 'object', required: false }],
          tlangType: 'Partial', // Top-level export from basic.ts
          style: { color: '#f59e0b' }
        },
        label: 'Partial'
      }
    },
    {
      id: 'readonly_node',
      type: 'tlangNode',
      position: { x: 450, y: 200 },
      data: {
        metadata: {
          id: 'Objects.Readonly',
          name: 'Readonly',
          category: 'Objects',
          description: 'Make all properties readonly',
          inputs: [{ id: 'in', label: 'Object', type: 'object', required: true }],
          outputs: [{ id: 'out', label: 'Readonly', type: 'object', required: false }],
          tlangType: 'Readonly', // Top-level export from basic.ts
          style: { color: '#f59e0b' }
        },
        label: 'Readonly'
      }
    }
  ],
  edges: [
    {
      id: 'e1',
      source: 'partial_node',
      sourceHandle: 'out',
      target: 'readonly_node',
      targetHandle: 'in'
    }
  ],
  createdAt: Date.now(),
  updatedAt: Date.now()
}

/**
 * Example 4: Boolean Logic Chain
 * Demonstrates boolean operations
 */
export const exampleBooleanLogic: Project = {
  id: 'example-boolean-logic',
  name: 'BooleanLogic',
  description: 'Combine boolean values with logic gates',
  nodes: [
    {
      id: 'and_node',
      type: 'tlangNode',
      position: { x: 150, y: 150 },
      data: {
        metadata: {
          id: 'Booleans.And',
          name: 'And',
          category: 'Booleans',
          description: 'Logical AND (a && b)',
          inputs: [
            { id: 'a', label: 'A', type: 'boolean', required: true },
            { id: 'b', label: 'B', type: 'boolean', required: true }
          ],
          outputs: [{ id: 'result', label: 'Result', type: 'boolean', required: false }],
          tlangType: 'Booleans.And',
          style: { color: '#ef4444' }
        },
        label: 'And',
        inputs: { a: true, b: true }
      }
    },
    {
      id: 'or_node',
      type: 'tlangNode',
      position: { x: 150, y: 300 },
      data: {
        metadata: {
          id: 'Booleans.Or',
          name: 'Or',
          category: 'Booleans',
          description: 'Logical OR (a || b)',
          inputs: [
            { id: 'a', label: 'A', type: 'boolean', required: true },
            { id: 'b', label: 'B', type: 'boolean', required: true }
          ],
          outputs: [{ id: 'result', label: 'Result', type: 'boolean', required: false }],
          tlangType: 'Booleans.Or',
          style: { color: '#ef4444' }
        },
        label: 'Or',
        inputs: { a: false, b: true }
      }
    },
    {
      id: 'xor_node',
      type: 'tlangNode',
      position: { x: 450, y: 225 },
      data: {
        metadata: {
          id: 'Booleans.Xor',
          name: 'Xor',
          category: 'Booleans',
          description: 'Logical XOR (exclusive or)',
          inputs: [
            { id: 'a', label: 'A', type: 'boolean', required: true },
            { id: 'b', label: 'B', type: 'boolean', required: true }
          ],
          outputs: [{ id: 'result', label: 'Result', type: 'boolean', required: false }],
          tlangType: 'Booleans.Xor',
          style: { color: '#ef4444' }
        },
        label: 'Xor'
      }
    }
  ],
  edges: [
    {
      id: 'e1',
      source: 'and_node',
      sourceHandle: 'result',
      target: 'xor_node',
      targetHandle: 'a'
    },
    {
      id: 'e2',
      source: 'or_node',
      sourceHandle: 'result',
      target: 'xor_node',
      targetHandle: 'b'
    }
  ],
  createdAt: Date.now(),
  updatedAt: Date.now()
}

/**
 * All example projects
 */
export const exampleProjects = [
  exampleStringTransform,
  exampleNumberArithmetic,
  exampleObjectTransform,
  exampleBooleanLogic
]
