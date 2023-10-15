import { ClassicPreset } from 'rete';
import { ActionSocket, TextSocket } from '../sockets';

export class OutputNode extends ClassicPreset.Node<{ exec: ClassicPreset.Socket }, {}, {}> {
  width = 180;
  height = 140;

  constructor() {
    super('Sound Output');
    this.addInput('exec', new ClassicPreset.Input(new ActionSocket(), 'Text'));
  }

  execute() {}

  data() {
    return {
      text: 'lol'
    };
  }
}
