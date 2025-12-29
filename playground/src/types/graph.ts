/**
 * Graph types for ReactFlow integration
 */

import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow'
import type { TLangNodeMetadata } from './node'

/**
 * Custom node data for our visual editor
 */
export interface CustomNodeData {
  /** Node metadata from registry */
  metadata: TLangNodeMetadata

  /** Display label */
  label: string

  /** Input values (for constant inputs) */
  inputs?: Record<string, unknown>
}

/**
 * Type-safe graph node extending ReactFlow's Node
 */
export type GraphNode = ReactFlowNode<CustomNodeData>

/**
 * Type-safe graph edge extending ReactFlow's Edge
 */
export type GraphEdge = ReactFlowEdge

/**
 * Complete graph state
 */
export interface GraphState {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
