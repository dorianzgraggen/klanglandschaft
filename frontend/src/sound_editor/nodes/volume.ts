import { ClassicPreset } from 'rete';
import { ActionSocket, TextSocket } from '../sockets';

export class VolumeNode extends ClassicPreset.Node<
  { value_in: ClassicPreset.Socket; sound_in: ClassicPreset.Socket }, // input
  { sound_out: ClassicPreset.Socket }, // output
  {}
> {
  width = 180;
  height = 160;

  constructor() {
    super('Volume');
    this.addInput('sound_in', new ClassicPreset.Input(new ActionSocket(), 'Sound'));
    this.addInput('value_in', new ClassicPreset.Input(new TextSocket(), 'Volume'));
    this.addOutput('sound_out', new ClassicPreset.Output(new ActionSocket(), 'Sound'));
  }

  execute() {}

  data(inputs: any) {
    let sound = {
      id: 'None',
      volume: 1,
      pan: 0.5
    };

    if (inputs.sound_in) {
      sound = inputs.sound_in[0];
    }

    if (inputs.value_in) {
      sound.volume = inputs.value_in[0];
    }

    return {
      sound_out: sound
    };
  }
}
