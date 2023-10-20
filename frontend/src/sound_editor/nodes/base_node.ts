import { ClassicPreset } from 'rete';
import { SoundSocket } from '../sockets';

export type InSockets = {
  [key in string]?: ClassicPreset.Socket;
};

export type Inputs = {
  [key in string]?: Array<any>;
};

export abstract class BaseNode extends ClassicPreset.Node<InSockets> {
  protected width = 180;
  protected height = 90;
  public needs_rerender = false;
  private sound_id = 1;

  constructor(name: string) {
    super(name);
  }

  public addSoundInput() {
    this.addInput(
      'sound_in #' + this.sound_id,
      new ClassicPreset.Input(new SoundSocket(), 'Sound ' + this.sound_id)
    );

    this.height += 36;
    this.sound_id++;
  }

  abstract data(inputs: Inputs): any;
}
