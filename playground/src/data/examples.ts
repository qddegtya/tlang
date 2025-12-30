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
 * Example 5: RealWorld - Event Data Validation
 * Demonstrates complex nested object validation and transformation
 *
 * Business scenario: User event tracking with sensitive data filtering
 * Input: Full event envelope with user info, environment, and event data
 * Output: Validated, sanitized event ready for analytics pipeline
 */
export const exampleRealWorldEventValidation: Project = {
  id: 'example-realworld-event-validation',
  name: 'EventDataValidation',
  description: 'Complex nested object validation: extract required fields, remove sensitive data, and create readonly analytics event',
  nodes: [
    {
      id: 'pick_user_fields',
      type: 'tlangNode',
      position: { x: 100, y: 100 },
      data: {
        metadata: {
          id: 'Pick',
          name: 'Pick',
          category: 'Objects',
          description: 'Pick specific fields from object type',
          inputs: [{ id: 'in', label: 'Object', type: 'object', required: true }],
          outputs: [{ id: 'out', label: 'Picked', type: 'object', required: false }],
          tlangType: 'Pick<"id" | "sessionId">',
          style: { color: '#f59e0b' }
        },
        label: 'Pick User Fields',
        inputs: {
          in: {
            id: 'user_123',
            sessionId: 'session_456',
            email: 'user@example.com',
            passwordHash: 'secret_hash_value'
          }
        }
      }
    },
    {
      id: 'omit_sensitive',
      type: 'tlangNode',
      position: { x: 100, y: 250 },
      data: {
        metadata: {
          id: 'Omit',
          name: 'Omit',
          category: 'Objects',
          description: 'Omit sensitive fields from object type',
          inputs: [{ id: 'in', label: 'Object', type: 'object', required: true }],
          outputs: [{ id: 'out', label: 'Sanitized', type: 'object', required: false }],
          tlangType: 'Omit<"ipAddress" | "deviceFingerprint">',
          style: { color: '#f59e0b' }
        },
        label: 'Omit Sensitive Data',
        inputs: {
          in: {
            clientVersion: '2.1.0',
            platform: 'web',
            timezone: 'UTC',
            ipAddress: '192.168.1.1',
            deviceFingerprint: 'unique_device_id'
          }
        }
      }
    },
    {
      id: 'partial_metadata',
      type: 'tlangNode',
      position: { x: 450, y: 100 },
      data: {
        metadata: {
          id: 'Partial',
          name: 'Partial',
          category: 'Objects',
          description: 'Make all properties optional',
          inputs: [{ id: 'in', label: 'Object', type: 'object', required: true }],
          outputs: [{ id: 'out', label: 'Partial', type: 'object', required: false }],
          tlangType: 'Partial',
          style: { color: '#f59e0b' }
        },
        label: 'Partial Metadata'
      }
    },
    {
      id: 'readonly_event',
      type: 'tlangNode',
      position: { x: 450, y: 250 },
      data: {
        metadata: {
          id: 'DeepReadonly',
          name: 'DeepReadonly',
          category: 'Objects',
          description: 'Make entire object structure deeply readonly',
          inputs: [{ id: 'in', label: 'Object', type: 'object', required: true }],
          outputs: [{ id: 'out', label: 'Immutable', type: 'object', required: false }],
          tlangType: 'DeepReadonly',
          style: { color: '#f59e0b' }
        },
        label: 'DeepReadonly Event'
      }
    },
    {
      id: 'required_fields',
      type: 'tlangNode',
      position: { x: 750, y: 175 },
      data: {
        metadata: {
          id: 'Required',
          name: 'Required',
          category: 'Objects',
          description: 'Make all properties required (remove optionality)',
          inputs: [{ id: 'in', label: 'Object', type: 'object', required: true }],
          outputs: [{ id: 'out', label: 'Required', type: 'object', required: false }],
          tlangType: 'Required',
          style: { color: '#f59e0b' }
        },
        label: 'Require All Fields'
      }
    }
  ],
  edges: [
    {
      id: 'e1',
      source: 'pick_user_fields',
      sourceHandle: 'out',
      target: 'partial_metadata',
      targetHandle: 'in'
    },
    {
      id: 'e2',
      source: 'omit_sensitive',
      sourceHandle: 'out',
      target: 'readonly_event',
      targetHandle: 'in'
    },
    {
      id: 'e3',
      source: 'partial_metadata',
      sourceHandle: 'out',
      target: 'required_fields',
      targetHandle: 'in'
    },
    {
      id: 'e4',
      source: 'readonly_event',
      sourceHandle: 'out',
      target: 'required_fields',
      targetHandle: 'in'
    }
  ],
  createdAt: Date.now(),
  updatedAt: Date.now()
}

/**
 * Example 6: RealWorld - Database to API Type Transformation
 * Demonstrates complex real-world scenario: converting database models to API responses
 *
 * Business scenario: Web API that returns user data
 * Challenge: Database uses snake_case with sensitive fields, API needs camelCase without secrets
 * Input: { user_id: 123, user_name: "john", email_address: "john@example.com", password_hash: "...", created_at: "2024-01-01" }
 * Output: { userId: 123, userName: "john", emailAddress: "john@example.com", createdAt: "2024-01-01" }
 *
 * This demonstrates:
 * 1. Security: Remove sensitive fields (password_hash, salt)
 * 2. Convention: snake_case → camelCase
 * 3. Zero runtime: All transformations happen at compile time
 * 4. Type safety: Compiler guarantees no field is leaked
 */
export const exampleDatabaseToAPI: Project = {
  id: 'example-database-to-api',
  name: 'DatabaseToAPI',
  description: 'Real-world: Convert database model (snake_case, with secrets) to API response (camelCase, sanitized) - zero runtime overhead',
  nodes: [
    {
      id: 'omit_secrets',
      type: 'tlangNode',
      position: { x: 100, y: 200 },
      data: {
        metadata: {
          id: 'Omit',
          name: 'Omit',
          category: 'Objects',
          description: 'Security: Remove sensitive fields before exposing to API',
          inputs: [{ id: 'in', label: 'Database Model', type: 'object', required: true }],
          outputs: [{ id: 'out', label: 'Sanitized', type: 'object', required: false }],
          tlangType: 'Omit<"password_hash" | "salt" | "internal_notes">',
          style: { color: '#ef4444' }
        },
        label: 'Remove Secrets',
        inputs: {
          in: {
            user_id: 12345,
            user_name: 'johndoe',
            email_address: 'john@example.com',
            password_hash: 'bcrypt_hash_secret',
            salt: 'random_salt_value',
            created_at: '2024-01-15T10:30:00Z',
            last_login: '2024-01-20T14:22:00Z',
            is_active: true,
            internal_notes: 'VIP customer - handle with care'
          }
        }
      }
    },
    {
      id: 'snake_to_camel',
      type: 'tlangNode',
      position: { x: 450, y: 200 },
      data: {
        metadata: {
          id: 'Objects.MapKeys',
          name: 'MapKeys',
          category: 'Objects',
          description: 'Convention: Transform all keys from snake_case to camelCase',
          inputs: [{ id: 'in', label: 'Object', type: 'object', required: true }],
          outputs: [{ id: 'out', label: 'Transformed', type: 'object', required: false }],
          tlangType: 'Objects.MapKeys<Strings.CamelCase>',
          style: { color: '#10b981' }
        },
        label: 'snake_case → camelCase'
      }
    },
    {
      id: 'make_readonly',
      type: 'tlangNode',
      position: { x: 800, y: 200 },
      data: {
        metadata: {
          id: 'Readonly',
          name: 'Readonly',
          category: 'Objects',
          description: 'Immutability: Make API response readonly to prevent accidental mutations',
          inputs: [{ id: 'in', label: 'Object', type: 'object', required: true }],
          outputs: [{ id: 'out', label: 'Immutable API Response', type: 'object', required: false }],
          tlangType: 'Readonly',
          style: { color: '#8b5cf6' }
        },
        label: 'Readonly Response'
      }
    }
  ],
  edges: [
    {
      id: 'e1',
      source: 'omit_secrets',
      sourceHandle: 'out',
      target: 'snake_to_camel',
      targetHandle: 'in'
    },
    {
      id: 'e2',
      source: 'snake_to_camel',
      sourceHandle: 'out',
      target: 'make_readonly',
      targetHandle: 'in'
    }
  ],
  createdAt: Date.now(),
  updatedAt: Date.now()
}

/**
 * Example 7: RealWorld - REST API Route Parameter Extraction
 * Demonstrates type-level string parsing for route safety
 *
 * Business scenario: Type-safe REST API routing
 * Challenge: Extract parameter names from route strings at compile time
 * Input: "/api/users/:userId/posts/:postId/comments/:commentId"
 * Output: ["userId", "postId", "commentId"] → "userId, postId, commentId"
 *
 * This demonstrates:
 * 1. String parsing: Split route path by "/"
 * 2. Filter: Find segments starting with ":"
 * 3. Map: Remove ":" prefix from each parameter
 * 4. Join: Format as comma-separated list
 * 5. Zero runtime: Type-safe routes with no performance cost
 */
export const exampleRouteParameterExtraction: Project = {
  id: 'example-route-params',
  name: 'RouteParameters',
  description: 'Real-world: Extract type-safe parameters from REST API routes - like tRPC but zero runtime',
  nodes: [
    {
      id: 'split_route',
      type: 'tlangNode',
      position: { x: 100, y: 200 },
      data: {
        metadata: {
          id: 'Strings.Split',
          name: 'Split',
          category: 'Strings',
          description: 'Parse route: Split by "/" to get path segments',
          inputs: [{ id: 'in', label: 'Route String', type: 'string', required: true }],
          outputs: [{ id: 'out', label: 'Segments', type: 'array', required: false }],
          tlangType: 'Strings.Split<"/">',
          style: { color: '#10b981' }
        },
        label: 'Split Route Path',
        inputs: { in: '/api/users/:userId/posts/:postId/comments/:commentId' }
      }
    },
    {
      id: 'filter_params',
      type: 'tlangNode',
      position: { x: 400, y: 200 },
      data: {
        metadata: {
          id: 'Tuples.Filter',
          name: 'Filter',
          category: 'Tuples',
          description: 'Filter: Keep only segments starting with ":"',
          inputs: [{ id: 'in', label: 'Array', type: 'array', required: true }],
          outputs: [{ id: 'out', label: 'Filtered', type: 'array', required: false }],
          tlangType: 'Tuples.Filter<Strings.StartsWith<":">>',
          style: { color: '#f59e0b' }
        },
        label: 'Find Parameters'
      }
    },
    {
      id: 'clean_params',
      type: 'tlangNode',
      position: { x: 700, y: 200 },
      data: {
        metadata: {
          id: 'Tuples.Map',
          name: 'Map',
          category: 'Tuples',
          description: 'Map: Remove ":" prefix from each parameter',
          inputs: [{ id: 'in', label: 'Array', type: 'array', required: true }],
          outputs: [{ id: 'out', label: 'Mapped', type: 'array', required: false }],
          tlangType: 'Tuples.Map<Strings.TrimLeft<":">>',
          style: { color: '#f59e0b' }
        },
        label: 'Clean Names'
      }
    },
    {
      id: 'format_output',
      type: 'tlangNode',
      position: { x: 1000, y: 200 },
      data: {
        metadata: {
          id: 'Tuples.Join',
          name: 'Join',
          category: 'Tuples',
          description: 'Join: Format as comma-separated string',
          inputs: [{ id: 'in', label: 'Array', type: 'array', required: true }],
          outputs: [{ id: 'out', label: 'String', type: 'string', required: false }],
          tlangType: 'Tuples.Join<", ">',
          style: { color: '#f59e0b' }
        },
        label: 'Format Result'
      }
    }
  ],
  edges: [
    {
      id: 'e1',
      source: 'split_route',
      sourceHandle: 'out',
      target: 'filter_params',
      targetHandle: 'in'
    },
    {
      id: 'e2',
      source: 'filter_params',
      sourceHandle: 'out',
      target: 'clean_params',
      targetHandle: 'in'
    },
    {
      id: 'e3',
      source: 'clean_params',
      sourceHandle: 'out',
      target: 'format_output',
      targetHandle: 'in'
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
  exampleBooleanLogic,
  exampleRealWorldEventValidation,
  exampleDatabaseToAPI,
  exampleRouteParameterExtraction
]
