import { ClassicPreset } from 'rete';
import { ActionSocket, TextSocket } from '../sockets';

export class SoundNode extends ClassicPreset.Node<
  { volume: ClassicPreset.Socket }, // input
  { sound_options: ClassicPreset.Socket } // output
> {
  width = 180;
  height = 140;

  constructor() {
    super('Piano');
    this.addInput('volume', new ClassicPreset.Input(new TextSocket(), 'Volume'));
    this.addOutput('sound_options', new ClassicPreset.Output(new ActionSocket(), 'Sound'));
  }

  execute() {}

  data(inputs: any) {
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
