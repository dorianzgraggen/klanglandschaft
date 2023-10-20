import type { AudioEffect } from '../editor';

export type SoundInfo = {
  effects: Array<AudioEffect>;
};

export function use_default_sound_or_else(sound_info: SoundInfo) {
  if (typeof sound_info !== 'undefined') {
    return sound_info;
  }

  return {
    id: 'None',
    effects: new Array<any>()
  };
}
