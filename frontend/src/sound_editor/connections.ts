import { type GetSchemes, ClassicPreset } from 'rete';
// import { Connection } from './connection';
import type {
  DataNode,
  SoundNode,
  OutputNode,
  PanNode,
  VolumeNode,
  TimeNode,
  AddNode,
  SineNode,
  VibratoNode
} from './nodes';
import type { DistortionNode } from './nodes/effects/distortion';
import type { ReverbNode } from './nodes/effects/reverb';
import type { SubtractNode } from './nodes/math/subtract';
import type { DivideNode } from './nodes/math/divide';
import type { MaxNode } from './nodes/math/max';
import type { MinNode } from './nodes/math/min';
import type { PowNode } from './nodes/math/pow';
import type { MultiplyNode } from './nodes/math/multiply';

export type EffectNode = VolumeNode | PanNode | DistortionNode | ReverbNode;
export type ValueChangeNode =
  | AddNode
  | MultiplyNode
  | SubtractNode
  | DivideNode
  | MaxNode
  | MinNode
  | SineNode
  | PowNode;

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
