import { MathNodes, DataNode, OutputNode, PanNode, SoundNode, VibratoNode, VolumeNode } from '.';
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
    time: new MathNodes.TimeNode(),
    sine: new MathNodes.SineNode(),
    add: new MathNodes.AddNode(),
    multiply: new MathNodes.MultiplyNode(),
    multiply_time: new MathNodes.MultiplyNode(),
    pan: new PanNode(),
    vibrato: new VibratoNode(),
    sound2: new SoundNode(),
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

export const preset_traffic: NodeTreePreset = {
  nodes: {
    output: new OutputNode(handle_output),
    noise_levels: new DataNode('traffic_noise'),
    elevation: new DataNode('elevation'),

    ambient: new SoundNode('ambient'),
    chaos: new SoundNode('chaos'),

    volume1: new VolumeNode(),
    volume2: new VolumeNode(0.5)
  },
  connections: [
    new ConnectionInfo('chaos', 'sound_out', 'volume1', 'sound_in'),
    new ConnectionInfo('noise_levels', 'value_out', 'volume1', 'value_in'),
    new ConnectionInfo('volume1', 'sound_out', 'output', 'sound_in'),
    //
    new ConnectionInfo('ambient', 'sound_out', 'volume2', 'sound_in'),
    new ConnectionInfo('elevation', 'value_out', 'volume2', 'value_in'),
    new ConnectionInfo('volume2', 'sound_out', 'output', 'sound_in')
  ]
};

export const preset_elevation: NodeTreePreset = {
  nodes: {
    elevation: new DataNode('elevation'),
    ambient: new SoundNode('ambient'),
    vibrato: new VibratoNode(7),
    output: new OutputNode(handle_output)
  },
  connections: [
    new ConnectionInfo('ambient', 'sound_out', 'vibrato', 'sound_in'),
    new ConnectionInfo('elevation', 'value_out', 'vibrato', 'depth'),
    new ConnectionInfo('vibrato', 'sound_out', 'output', 'sound_in')
  ]
};
