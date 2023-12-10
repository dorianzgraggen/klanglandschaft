import { ClassicPreset } from 'rete';
import { SoundSocket, NumberSocket } from '../../sockets';
import { use_default_sound_unless } from '../util';

export class ReverbNode extends ClassicPreset.Node<
  { wet: ClassicPreset.Socket; sound_in: ClassicPreset.Socket }, // input
  { sound_out: ClassicPreset.Socket }, // output
  { gain: ClassicPreset.InputControl<'number'> }
> {
  width = 180;
  height = 160;

  constructor(initial = 1) {
    super('Reverb');
    this.addInput('sound_in', new ClassicPreset.Input(new SoundSocket(), 'Sound'));

    const wet = new ClassicPreset.Input(new NumberSocket(), 'Wet');
    this.addInput('wet', wet);

    this.addOutput('sound_out', new ClassicPreset.Output(new SoundSocket(), 'Sound'));
    wet.addControl(new ClassicPreset.InputControl('number', { initial }));
  }

  execute() {}

  data(inputs: any) {
    const sound = use_default_sound_unless(inputs.sound_in);

    console.log('inputs', inputs);
    const control = this.inputs.wet?.control as ClassicPreset.InputControl<'number'>;
    let wet = control.value as number;

    if (typeof inputs.wet !== 'undefined') {
      wet = inputs.wet[0];
    }

    sound.effects.push({
      type: 'reverb',
      settings: {
        wet
      }
    });

    return {
      sound_out: sound
    };
  }
}
