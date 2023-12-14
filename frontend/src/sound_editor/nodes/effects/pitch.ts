import { ClassicPreset } from 'rete';
import { SoundSocket, NumberSocket } from '../../sockets';
import { use_default_sound_unless } from '../util';

export class PitchNode extends ClassicPreset.Node<
  { value_in: ClassicPreset.Socket; sound_in: ClassicPreset.Socket }, // input
  { sound_out: ClassicPreset.Socket }, // output
  { gain: ClassicPreset.InputControl<'number'> }
> {
  width = 180;
  height = 160;

  constructor(initial = 1) {
    super('Pitch');
    this.addInput('sound_in', new ClassicPreset.Input(new SoundSocket(), 'Sound'));
    const value_in = new ClassicPreset.Input(new NumberSocket(), 'Pitch');
    this.addInput('value_in', value_in);
    this.addOutput('sound_out', new ClassicPreset.Output(new SoundSocket(), 'Sound'));
    value_in.addControl(new ClassicPreset.InputControl('number', { initial }));
  }

  execute() {}

  data(inputs: any) {
    const sound = use_default_sound_unless(inputs.sound_in);

    const control = this.inputs.value_in?.control as ClassicPreset.InputControl<'number'>;
    let pitch = control.value as number;

    if (typeof inputs.value_in !== 'undefined') {
      pitch = inputs.value_in[0];
    }

    sound.effects.push({
      type: 'pitch',
      meta: {
        pitch: (pitch - 0.5) * 10 // TODO: stupid
      }
    });

    return {
      sound_out: sound
    };
  }
}
