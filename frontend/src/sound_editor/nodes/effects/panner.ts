import { ClassicPreset } from 'rete';
import { SoundSocket, NumberSocket } from '../../sockets';
import { clamp, use_default_sound_unless } from '../util';

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
    const sound = use_default_sound_unless(inputs.sound_in);

    if (inputs.value_in) {
      sound.effects.push({
        type: 'pan',
        settings: {
          pan: clamp(inputs.value_in[0], -1, 1)
        }
      });
    }

    return {
      sound_out: sound
    };
  }
}
