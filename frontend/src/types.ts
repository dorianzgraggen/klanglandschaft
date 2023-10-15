import { type GetSchemes } from 'rete';
import { Connection } from './connection';
import { DebugChat, Message, OnMessage, MatchMessage, SendMessage } from './nodes';

export type NodeProps = DebugChat | Message | OnMessage | MatchMessage | SendMessage;
export type ConnProps =
  | Connection<Message, SendMessage>
  | Connection<MatchMessage, SendMessage>
  | Connection<OnMessage, MatchMessage>;

export type Schemes = GetSchemes<NodeProps, ConnProps>;
