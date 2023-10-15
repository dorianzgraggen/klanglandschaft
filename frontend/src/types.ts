import { type GetSchemes } from 'rete';
import { Connection } from './connection';
import {
  DebugChat,
  Message,
  OnMessage,
  MatchMessage,
  SendMessage,
  SoundNode,
  OutputNode
} from './nodes';

export type NodeProps =
  | DebugChat
  | Message
  | OnMessage
  | MatchMessage
  | SendMessage
  | SoundNode
  | OutputNode;
export type ConnProps =
  | Connection<Message, SendMessage>
  | Connection<MatchMessage, SendMessage>
  | Connection<OnMessage, MatchMessage>
  | Connection<MatchMessage, SoundNode>
  | Connection<SoundNode, OutputNode>;

export type Schemes = GetSchemes<NodeProps, ConnProps>;
