import { ClassicPreset } from 'rete';
import { SoundSocket } from '../../sockets';
import type { AudioEffect } from '../../editor';
import { BaseNode, type Inputs } from '../base_node';

export class OutputNode extends BaseNode {
  width = 180;
  height = 55;

  constructor(
    private handle_output: (output: { id: string; effects: Array<AudioEffect> }) => void
  ) {
    super('Sound Output');
    // this.addInput('sound_in', new ClassicPreset.Input(new SoundSocket(), 'Sound', true));
    this.addSoundInput();
  }

  execute() {}

  data(inputs: Inputs) {
    if (typeof inputs['sound_in #1'] !== 'undefined' && inputs['sound_in #1'].length > 0) {
      this.handle_output(inputs['sound_in #1'][0]);
    }

    // console.log(inputs);

    return { text: 'lol' };
  }
}
