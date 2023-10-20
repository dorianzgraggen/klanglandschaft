import { type GetSchemes, ClassicPreset } from 'rete';
// import { Connection } from './connection';
import {
  DataNode,
  SoundNode,
  OutputNode,
  PanNode,
  MultiplyNode,
  VolumeNode,
  TimeNode,
  AddNode,
  SineNode,
  VibratoNode
} from './nodes';

export type EffectNode = VolumeNode | PanNode;
export type ValueChangeNode = AddNode | MultiplyNode | SineNode;

export type EffectNodeTwoInputs = VibratoNode;

export type NodeProps =
  | EffectNode
  | ValueChangeNode
  | DataNode
  | SoundNode
  | OutputNode
  | TimeNode
  | EffectNodeTwoInputs;

export type ConnProps =
  | Connection<ValueChangeNode, ValueChangeNode>
  | Connection<ValueChangeNode, EffectNode>
  | Connection<ValueChangeNode, EffectNodeTwoInputs>
  | Connection<TimeNode, ValueChangeNode>
  | Connection<SoundNode, EffectNode>
  | Connection<SoundNode, EffectNodeTwoInputs>
  | Connection<EffectNode, OutputNode>
  | Connection<EffectNodeTwoInputs, OutputNode>
  | Connection<SoundNode, OutputNode>;

export type Schemes = GetSchemes<NodeProps, ConnProps>;

export class Connection<A extends NodeProps, B extends NodeProps> extends ClassicPreset.Connection<
  A,
  B
> {
  isLoop?: boolean;
}
