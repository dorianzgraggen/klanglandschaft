import { ClassicPreset } from 'rete';
import { SoundSocket } from '../sockets';

export type InSockets = {
  [key in string]?: ClassicPreset.Socket;
};

export type Inputs = {
  [key in string]?: Array<any>;
};

export abstract class BaseNode extends ClassicPreset.Node<InSockets> {
  protected width = 130;
  protected height = 90;
  public needs_rerender = false;
  private sound_id = 1;

  private open_input = '';

  constructor(name: string) {
    super(name);
  }

  public removeSoundInput(key: string) {
    this.removeInput(key);
    this.height -= 36;
  }

  public addSoundInput() {
    this.open_input = 'sound_in #' + this.sound_id;
    this.addInput(this.open_input, new ClassicPreset.Input(new SoundSocket(), '', false));
    this.height += 36;
    this.sound_id++;
  }

  public getOpenInput() {
    return this.open_input;
  }

  abstract data(inputs: Inputs): any;
}
