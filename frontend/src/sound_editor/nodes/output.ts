import { ClassicPreset } from 'rete';
import { ActionSocket, TextSocket } from '../sockets';

export class OutputNode extends ClassicPreset.Node<{ sound_in: ClassicPreset.Socket }> {
  width = 180;
  height = 90;

  constructor() {
    super('Sound Output');
    this.addInput('sound_in', new ClassicPreset.Input(new ActionSocket(), 'Sound', true));

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
    console.log('to play:', inputs.sound_in.length, JSON.stringify(inputs.sound_in));

    return { text: 'lol' };
  }
}
