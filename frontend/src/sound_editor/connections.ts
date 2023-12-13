import { type GetSchemes, ClassicPreset } from 'rete';
// import { Connection } from './connection';
import {
  MathNodes,
  DataNode,
  OutputNode,
  PanNode,
  SoundNode,
  DistortionNode,
  ReverbNode,
  VibratoNode,
  VolumeNode
} from './nodes';


export type EffectNode = VolumeNode | PanNode | DistortionNode | ReverbNode;
export type ValueChangeNode =
  | MathNodes.AddNode
  | MathNodes.MultiplyNode
  | MathNodes.SubtractNode
  | MathNodes.DivideNode
  | MathNodes.MaxNode
  | MathNodes.MinNode
  | MathNodes.SineNode
  | MathNodes.PowNode;

export type EffectNodeTwoInputs = VibratoNode;

export type NodeProps =
  | EffectNode
  | ValueChangeNode
  | DataNode
  | SoundNode
  | OutputNode
  | MathNodes.TimeNode
  | EffectNodeTwoInputs;

export type ConnProps =
  | Connection<ValueChangeNode, ValueChangeNode>
  | Connection<ValueChangeNode, EffectNode>
  | Connection<ValueChangeNode, EffectNodeTwoInputs>
  | Connection<MathNodes.TimeNode, ValueChangeNode>
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
