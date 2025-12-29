/**
 * Project types for save/load functionality
 */

import type { GraphNode, GraphEdge } from './graph'

/**
 * Project metadata and graph data
 */
export interface Project {
  /** Unique identifier */
  id: string

  /** Project name */
  name: string

  /** Optional description */
  description?: string

  /** Graph nodes */
  nodes: GraphNode[]

  /** Graph edges/connections */
  edges: GraphEdge[]

  /** Creation timestamp */
  createdAt: number

  /** Last update timestamp */
  updatedAt: number
}

/**
 * Project list item for project selection
 */
export interface ProjectListItem {
  id: string
  name: string
  description?: string
  updatedAt: number
}
