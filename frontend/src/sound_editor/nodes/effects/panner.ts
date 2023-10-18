import { ClassicPreset } from 'rete';
import { SoundSocket, NumberSocket } from '../../sockets';

export class PanNode extends ClassicPreset.Node<
  { value_in: ClassicPreset.Socket; sound_in: ClassicPreset.Socket }, // input
  { sound_out: ClassicPreset.Socket }, // output
  {}
> {
  width = 180;
  height = 160;

  constructor() {
    super('Panner');
    this.addInput('sound_in', new ClassicPreset.Input(new SoundSocket(), 'Sound'));
    this.addInput('value_in', new ClassicPreset.Input(new NumberSocket(), 'Pan'));
    this.addOutput('sound_out', new ClassicPreset.Output(new SoundSocket(), 'Sound'));
  }

  execute() {}

  data(inputs: any) {
    let sound = {
      id: 'None',
      volume: 1,
      pan: 0
    };

    if (inputs.sound_in) {
      sound = inputs.sound_in[0];
    }

    if (inputs.value_in) {
      sound.pan = inputs.value_in[0];
    }
    return {
      sound_out: sound
    };
  }
}