import { ClassicPreset } from 'rete';
import { SoundSocket } from '../sockets';
import type { AudioEffect } from '../editor';

export class OutputNode extends ClassicPreset.Node<{ sound_in: ClassicPreset.Socket }> {
  width = 180;
  height = 90;

  constructor(
    private handle_output: (output: { id: string; effects: Array<AudioEffect> }) => void
  ) {
    super('Sound Output');
    this.addInput('sound_in', new ClassicPreset.Input(new SoundSocket(), 'Sound', true));

    // this.addControl(
    //   'text',
    //   new ClassicPreset.InputControl('text', {
    //     readonly: true
    //   })
    // );

    // this.addOutput('text', new ClassicPreset.Output(new ActionSocket(), 'Number'));
  }

  execute() {}

  // data() {
  //   console.log('output', this);
  //   return {
  //     text: 'lol'
  //   };
  // }

  data(inputs: any) {
    // console.log('to play:', inputs.sound_in.length, JSON.stringify(inputs.sound_in));
    if (inputs.sound_in.length > 0) {
      this.handle_output(inputs.sound_in[0]);
    }

    return { text: 'lol' };
  }
}
