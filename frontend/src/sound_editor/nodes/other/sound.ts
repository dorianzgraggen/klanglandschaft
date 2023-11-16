import { ClassicPreset } from 'rete';
import { SoundSocket } from '../../sockets';
import { use_default_sound } from '../util';

export const sound_urls: { [key: string]: string } = {
  piano: 'https://cdn.freesound.org/previews/629/629170_12574855-lq.mp3',
  percussion: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3',
  ambient: '/120365__stk13__untitled-13.wav',
  chaos: '/398867__gis_sweden__shaped-by-chaos.wav'
};

export class SoundNode extends ClassicPreset.Node<
  {}, // input
  { sound_out: ClassicPreset.Socket }, // output
  { sound_id: ClassicPreset.InputControl<'text'> }
> {
  width = 180;
  height = 130;

  constructor(track = 'piano') {
    super('Sound');
    // this.addInput('volume', new ClassicPreset.Input(new TextSocket(), 'Volume'));
    this.addControl('sound_id', new ClassicPreset.InputControl('text', { initial: track }));
    this.addOutput('sound_out', new ClassicPreset.Output(new SoundSocket(), 'Sound'));
  }

  execute() {}

  data(inputs: any) {
    const sound = use_default_sound();

    const id = this.controls.sound_id.value || '';
    const sound_url = sound_urls[id];

    sound.effects.push({
      type: 'source',
      meta: {
        url: sound_url,
        sound_id: id
      }
    });

    return {
      sound_out: sound
    };
  }
}
