export type SoundInfo = {
  effects: Array<AudioEffect>;
};

export type AudioEffect = {
  type: SoundEffectKey;
  settings?: {
    [key: string]: number;
  };
  meta?: {
    [key: string]: number | string;
  };
};

export type SoundEffectKey = 'pan' | 'gain' | 'vibrato' | 'source' | 'pitch' | 'distortion';

export function use_default_sound_unless(sound_info: SoundInfo[]) {
  if (typeof sound_info !== 'undefined') {
    return sound_info[0];
  }

  return use_default_sound();
}

export function use_default_sound() {
  return {
    effects: new Array<AudioEffect>()
  };
}
