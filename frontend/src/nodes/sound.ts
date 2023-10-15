import { ClassicPreset } from 'rete';
import { ActionSocket, TextSocket } from '../sockets';

export class SoundNode extends ClassicPreset.Node<
  { volume: ClassicPreset.Socket }, // input
  { sound_options: ClassicPreset.Socket } // output
  // { exec: ClassicPreset.InputControl<'text'> } // controls
> {
  width = 180;
  height = 140;

  constructor() {
    super('Piano');
    this.addInput('volume', new ClassicPreset.Input(new TextSocket(), 'Volume'));
    this.addOutput('sound_options', new ClassicPreset.Output(new ActionSocket(), 'Sound'));

    // this.addControl(
    //   'exec',
    //   new ClassicPreset.InputControl('text', {
    //     readonly: false
    //   })
    // );
  }

  execute() {}

  data(inputs: any) {
    console.log('inputs', inputs.volume[0]);

    let volume = 0;

    if (inputs.volume) {
      volume = inputs.volume[0];
    }
    return {
      sound_options: {
        volume,
        track: 'Piano'
      }
    };
  }
}
