import { ClassicPreset } from 'rete';
import { SoundSocket } from '../../sockets';
import { use_default_sound } from '../util';

export const sound_urls: { [key: string]: { url: string; title: string } } = {
  piano: { url: 'https://cdn.freesound.org/previews/629/629170_12574855-lq.mp3', title: 'Piano' },
  percussion: {
    url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3',
    title: 'Percussion'
  },
  ambient: { url: '/120365__stk13__untitled-13.wav', title: 'Deep Abyss' },
  chaos: { url: '/398867__gis_sweden__shaped-by-chaos.wav', title: 'Chaos' }
};

export class SoundNode extends ClassicPreset.Node<
  {}, // input
  { sound_out: ClassicPreset.Socket }, // output
  { sound_id: ClassicPreset.InputControl<'text'> }
> {
  width = 180;
  height = 86;
  sound_id = '';

  constructor(track = 'piano') {
    super('Sound');
    this.label = sound_urls[track].title + ' 🎵';
    this.sound_id = track;
    // this.addInput('volume', new ClassicPreset.Input(new TextSocket(), 'Volume'));
    // this.addControl('sound_id', new ClassicPreset.InputControl('text', { initial: track }));

    // TODO: allow this node to have multiple output connections, but need to figure out why
    // fetching parents nodes values doesn't work as expected when allowing it
    this.addOutput('sound_out', new ClassicPreset.Output(new SoundSocket(), 'Sound', false));
  }

  execute() {}

  data(inputs: any) {
    const sound = use_default_sound();

    const id = this.sound_id;
    const sound_url = sound_urls[id];

    sound.effects.push({
      type: 'source',
      meta: {
        url: sound_url.url,
        sound_id: id
      }
    });

    return {
      sound_out: sound
    };
  }
}
