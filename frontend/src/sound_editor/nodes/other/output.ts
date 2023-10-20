import { ClassicPreset } from 'rete';
import { SoundSocket } from '../../sockets';
import type { AudioEffect } from '../../editor';
import { BaseNode, type Inputs } from '../base_node';

export class OutputNode extends BaseNode {
  width = 180;
  height = 90;

  constructor(
    private handle_output: (output: { id: string; effects: Array<AudioEffect> }) => void
  ) {
    super('Sound Output');
    this.addInput('sound_in', new ClassicPreset.Input(new SoundSocket(), 'Sound', true));

    window.setTimeout(() => {
      this.addInput('lol', new ClassicPreset.Input(new SoundSocket(), 'Sound 2', true));
      this.height += 30;
      // alert('lol');
      // this.

      this.needs_rerender = true;
    }, 1500);
  }

  execute() {}

  data(inputs: Inputs) {
    if (typeof inputs.sound_in !== 'undefined' && inputs.sound_in.length > 0) {
      this.handle_output(inputs.sound_in[0]);
    }

    return { text: 'lol' };
  }
}
