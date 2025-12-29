/**
 * Node metadata types for tlang visual editor
 */

export type NodeCategory = 'Numbers' | 'Strings' | 'Objects' | 'Tuples' | 'Booleans' | 'Match' | 'Functions' | 'Unions' | 'Deep'

export type PortType = 'number' | 'string' | 'object' | 'array' | 'boolean' | 'function' | 'any'

/**
 * Port definition for node inputs/outputs
 */
export interface PortDefinition {
  id: string
  label: string
  type: PortType
  required: boolean
}

/**
 * Visual style configuration for nodes
 */
export interface NodeStyle {
  color: string
  icon?: string
}

/**
 * Complete metadata for a tlang node type
 * This describes how the node appears and behaves in the visual editor
 */
export interface TLangNodeMetadata {
  /** Unique identifier (e.g., 'Numbers.Add') */
  id: string

  /** Display name (e.g., 'Add') */
  name: string

  /** Category for organization */
  category: NodeCategory

  /** Human-readable description */
  description: string

  /** Input port definitions */
  inputs: PortDefinition[]

  /** Output port definitions */
  outputs: PortDefinition[]

  /** Reference to tlang type (e.g., 'Numbers.Add') */
  tlangType: string

  /** Visual appearance */
  style: NodeStyle
}
