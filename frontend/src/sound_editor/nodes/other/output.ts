import { ClassicPreset } from 'rete';
import { SoundSocket } from '../../sockets';
import type { AudioEffect } from '../util';
import { BaseNode, type Inputs } from '../base_node';

export class OutputNode extends BaseNode {
  width = 140;
  height = 55;

  constructor(
    private handle_output: (
      output_tracks: Array<{ id: string; effects: Array<AudioEffect> }>
    ) => void
  ) {
    super('Sound Output');
    // this.addInput('sound_in', new ClassicPreset.Input(new SoundSocket(), 'Sound', true));
    this.addSoundInput();
  }

  execute() {}

  data(inputs: Inputs) {
    // if (typeof inputs['sound_in #1'] !== 'undefined' && inputs['sound_in #1'].length > 0) {
    //   // this.handle_output(inputs['sound_in #1'][0]);
    // }

    const results = Object.entries(inputs).map(([key, value]) => {
      // @ts-ignore
      return value[0];
    });

    this.handle_output(results);

    // console.log('inputs:', inputs, results);

    return { text: 'lol' };
  }
}
