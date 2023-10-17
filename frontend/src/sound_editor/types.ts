import { type GetSchemes } from 'rete';
import { Connection } from './connection';
import {
  DataNode,
  SoundNode,
  OutputNode,
  PanNode,
  MultiplyNode,
  VolumeNode,
  TimeNode,
  AddNode,
  SineNode
} from './nodes';

export type NodeProps =
  | DataNode
  | SoundNode
  | OutputNode
  | TimeNode
  | MultiplyNode
  | VolumeNode
  | SineNode
  | AddNode
  | PanNode;
export type ConnProps =
  | Connection<DataNode, SoundNode>
  | Connection<TimeNode, SoundNode>
  | Connection<MultiplyNode, VolumeNode>
  | Connection<AddNode, VolumeNode>
  | Connection<TimeNode, SineNode>
  | Connection<SineNode, VolumeNode>
  | Connection<SoundNode, VolumeNode>
  | Connection<SoundNode, PanNode>
  | Connection<PanNode, OutputNode>
  | Connection<VolumeNode, OutputNode>;

export type Schemes = GetSchemes<NodeProps, ConnProps>;

// TODO: make more generic
