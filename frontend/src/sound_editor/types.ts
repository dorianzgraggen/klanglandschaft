import { type GetSchemes } from 'rete';
import { Connection } from './connection';
import { DataNode, SoundNode, OutputNode } from './nodes';

export type NodeProps = DataNode | SoundNode | OutputNode;
export type ConnProps = Connection<DataNode, SoundNode> | Connection<SoundNode, OutputNode>;

export type Schemes = GetSchemes<NodeProps, ConnProps>;
