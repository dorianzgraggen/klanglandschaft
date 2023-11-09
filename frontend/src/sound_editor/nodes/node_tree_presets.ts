import {
  AddNode,
  DataNode,
  MultiplyNode,
  OutputNode,
  PanNode,
  SineNode,
  SoundNode,
  TimeNode,
  VibratoNode,
  VolumeNode
} from '.';
import type { NodeProps } from '../connections';
import { handle_output } from '../editor';

export class ConnectionInfo {
  constructor(
    public source: string,
    public sourceOutput: string,
    public target: string,
    public targetInput: string
  ) {}
}

export type NodeTreePreset = {
  nodes: { [key: string]: NodeProps };
  connections: Array<ConnectionInfo>;
};

export const test_preset: NodeTreePreset = {
  nodes: {
    population: new DataNode(),
    sound: new SoundNode(),
    output: new OutputNode(handle_output),
    volume: new VolumeNode(),
    time: new TimeNode(),
    sine: new SineNode(),
    add: new AddNode(0),
    multiply: new MultiplyNode(1),
    multiply_time: new MultiplyNode(1),
    pan: new PanNode(),
    vibrato: new VibratoNode(),
    sound2: new SoundNode('percussion'),
    volume2: new VolumeNode(0.3)
  },
  connections: [
    new ConnectionInfo('sound', 'sound_out', 'volume', 'sound_in'),
    new ConnectionInfo('population', 'value_out', 'volume', 'value_in'),
    new ConnectionInfo('volume', 'sound_out', 'pan', 'sound_in'),

    new ConnectionInfo('time', 'seconds', 'multiply_time', 'value_in'),
    new ConnectionInfo('multiply_time', 'value_out', 'sine', 'value_in'),
    new ConnectionInfo('sine', 'value_out', 'add', 'value_in'),
    new ConnectionInfo('add', 'value_out', 'multiply', 'value_in'),
    new ConnectionInfo('multiply', 'value_out', 'pan', 'value_in'),

    new ConnectionInfo('pan', 'sound_out', 'vibrato', 'sound_in'),
    new ConnectionInfo('vibrato', 'sound_out', 'output', 'sound_in'),
    // new ConnectionInfo(vibrato, 'sound_out', output, 'sound_in')

    new ConnectionInfo('sound2', 'sound_out', 'volume2', 'sound_in'),
    new ConnectionInfo('volume2', 'sound_out', 'output', 'sound_in')
  ]
};
