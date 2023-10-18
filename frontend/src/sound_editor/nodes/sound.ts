import { ClassicPreset } from 'rete';
import { SoundSocket } from '../sockets';

export class SoundNode extends ClassicPreset.Node<
  {}, // input
  { sound_out: ClassicPreset.Socket }, // output
  { sound_id: ClassicPreset.InputControl<'text'> }
> {
  width = 180;
  height = 130;

  constructor() {
    super('Sound');
    // this.addInput('volume', new ClassicPreset.Input(new TextSocket(), 'Volume'));
    this.addControl('sound_id', new ClassicPreset.InputControl('text', { initial: 'Piano' }));
    this.addOutput('sound_out', new ClassicPreset.Output(new SoundSocket(), 'Sound'));
  }

  execute() {}

  data(inputs: any) {
    return {
      sound_out: {
        volume: 1,
        pan: 0.5,
        track: 'Piano'
      }
    };
  }
}
