import { ClassicPreset } from 'rete';
import { SoundSocket, NumberSocket } from '../../sockets';
import { use_default_sound_unless } from '../util';

export class VibratoNode extends ClassicPreset.Node<
  { frequency: ClassicPreset.Socket; depth: ClassicPreset.Socket; sound_in: ClassicPreset.Socket }, // input
  { sound_out: ClassicPreset.Socket }, // output
  { frequency: ClassicPreset.InputControl<'number'>; depth: ClassicPreset.InputControl<'number'> }
> {
  width = 180;
  height = 270;

  constructor(frequency = 30, depth = 0.75) {
    super('Vibrato');
    this.addInput('sound_in', new ClassicPreset.Input(new SoundSocket(), 'Sound'));
    this.addInput('frequency', new ClassicPreset.Input(new NumberSocket(), 'Frequency'));
    this.addControl('frequency', new ClassicPreset.InputControl('number', { initial: frequency }));
    this.addInput('depth', new ClassicPreset.Input(new NumberSocket(), 'Depth'));
    this.addControl('depth', new ClassicPreset.InputControl('number', { initial: depth }));
    this.addOutput('sound_out', new ClassicPreset.Output(new SoundSocket(), 'Sound'));
  }

  data(inputs: any) {
    const sound = use_default_sound_unless(inputs.sound_in);

    let frequency = this.controls.frequency.value as number;

    if (typeof inputs.frequency !== 'undefined') {
      frequency = inputs.frequency[0];
    }

    let depth = this.controls.depth.value as number;

    if (typeof inputs.depth !== 'undefined') {
      depth = inputs.depth[0];
    }

    sound.effects.push({
      type: 'vibrato',
      settings: {
        frequency,
        depth
      }
    });

    // console.log('tremolo', sound);

    return {
      sound_out: sound
    };
  }
}
