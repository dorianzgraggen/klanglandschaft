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

  constructor(name: string) {
    super(name);
  }

  abstract data(inputs: Inputs): any;
}
