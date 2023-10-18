import { ClassicPreset } from 'rete';

export class SoundSocket extends ClassicPreset.Socket {
  constructor() {
    super('Action');
  }

  isCompatibleWith(socket: ClassicPreset.Socket) {
    return socket instanceof SoundSocket;
  }
}

export class NumberSocket extends ClassicPreset.Socket {
  constructor() {
    super('Text');
  }

  isCompatibleWith(socket: ClassicPreset.Socket) {
    return socket instanceof NumberSocket;
  }
}
