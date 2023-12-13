import { ClassicPreset } from 'rete';
import { SoundSocket } from '../../sockets';
import { use_default_sound } from '../util';

export const sound_urls: { [key: string]: { url: string; title: string } } = {
  // ambient: { url: '/120365__stk13__untitled-13.wav', title: 'Sangfroid' },
  // chaos: { url: '/398867__gis_sweden__shaped-by-chaos.wav', title: 'Night Techno' },
  lilypad: {
    url: 'https://klanglandschaft.b-cdn.net/audios/BOS_CCS_Texture_One_Shot_Lily_Pad_B.mp3',
    title: 'Lilypad'
  },
  oxygen: {
    url: 'https://klanglandschaft.b-cdn.net/audios/BOS_CCS_Texture_One_Shot_Oxygen_Bm.Wav.mp3',
    title: 'Oxygen'
  },
  drone_bass: {
    url: 'https://klanglandschaft.b-cdn.net/audios/DroneBass_BW.31204.mp3',
    title: 'Drone Bass'
  },
  atmosphere_midnight: {
    url: 'https://klanglandschaft.b-cdn.net/audios/KMRBI_RHXS_atmosphere_one_shot_midnight.mp3',
    title: 'Midnight Atmosphere'
  },
  trumpet_phrase_venus: {
    url: 'https://klanglandschaft.b-cdn.net/audios/LEX_KB_trumpet_one_shot_phrase_venus_G.mp3',
    title: 'Venus'
  },
  modular_forest: {
    url: 'https://klanglandschaft.b-cdn.net/audios/RD_fx_modular_forest_06.mp3',
    title: 'Digital Jungle'
  },
  guitar_soundscapes: {
    url: 'https://klanglandschaft.b-cdn.net/audios/SC_RS_147_guitar_soundscapes_Gmaj.mp3',
    title: 'Guitar Soundscapes'
  },
  percussion: {
    url: 'https://klanglandschaft.b-cdn.net/audios/tt_drum_125_brief_perc2.mp3',
    title: 'Percussion'
  }
};

export class SoundNode extends ClassicPreset.Node<
  {}, // input
  { sound_out: ClassicPreset.Socket }, // output
  { sound_id: ClassicPreset.InputControl<'text'> }
> {
  width = 200;
  height = 86;
  sound_id = '';

  constructor(track = 'drone_bass') {
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
