import { ClassicPreset } from 'rete';
import { SoundSocket, NumberSocket } from '../../sockets';
import { use_default_sound_unless } from '../util';

export class VolumeNode extends ClassicPreset.Node<
  { value_in: ClassicPreset.Socket; sound_in: ClassicPreset.Socket }, // input
  { sound_out: ClassicPreset.Socket }, // output
  { gain: ClassicPreset.InputControl<'number'> }
> {
  width = 180;
  height = 200;

  constructor(initial = 1) {
    super('Volume');
    this.addInput('sound_in', new ClassicPreset.Input(new SoundSocket(), 'Sound'));
    this.addInput('value_in', new ClassicPreset.Input(new NumberSocket(), 'Volume'));
    this.addOutput('sound_out', new ClassicPreset.Output(new SoundSocket(), 'Sound'));
    this.addControl('gain', new ClassicPreset.InputControl('number', { initial }));
  }

  execute() {}

  data(inputs: any) {
    const sound = use_default_sound_unless(inputs.sound_in[0]);

    let gain = this.controls.gain.value as number;

    if (typeof inputs.value_in !== 'undefined') {
      gain = inputs.value_in[0];
    }

    console.log('gain is', gain);

    sound.effects.push({
      type: 'gain',
      settings: {
        gain
      }
    });

    return {
      sound_out: sound
    };
  }
}
