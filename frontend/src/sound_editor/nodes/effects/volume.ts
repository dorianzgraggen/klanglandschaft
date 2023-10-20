import { ClassicPreset } from 'rete';
import { SoundSocket, NumberSocket } from '../../sockets';
import { use_default_sound_or_else } from '../util';

export class VolumeNode extends ClassicPreset.Node<
  { value_in: ClassicPreset.Socket; sound_in: ClassicPreset.Socket }, // input
  { sound_out: ClassicPreset.Socket }, // output
  {}
> {
  width = 180;
  height = 160;

  constructor() {
    super('Volume');
    this.addInput('sound_in', new ClassicPreset.Input(new SoundSocket(), 'Sound'));
    this.addInput('value_in', new ClassicPreset.Input(new NumberSocket(), 'Volume'));
    this.addOutput('sound_out', new ClassicPreset.Output(new SoundSocket(), 'Sound'));
  }

  execute() {}

  data(inputs: any) {
    const sound = use_default_sound_or_else(inputs.sound_in[0]);

    if (inputs.value_in) {
      sound.effects.push({
        type: 'gain',
        settings: {
          gain: inputs.value_in[0]
        }
      });
    }

    return {
      sound_out: sound
    };
  }
}
