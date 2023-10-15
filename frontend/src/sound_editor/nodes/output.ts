import { ClassicPreset } from 'rete';
import { ActionSocket, TextSocket } from '../sockets';

export class OutputNode extends ClassicPreset.Node<{ sound_options: ClassicPreset.Socket }> {
  width = 180;
  height = 140;

  constructor() {
    super('Sound Output');
    this.addInput('sound_options', new ClassicPreset.Input(new ActionSocket(), 'Text'));

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
    console.log('to play:', inputs.sound_options[0]);

    return { text: 'lol' };
  }
}
