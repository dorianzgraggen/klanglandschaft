import { ClassicPreset } from 'rete';
import { ActionSocket, TextSocket } from '../sockets';

export class SoundNode extends ClassicPreset.Node<
  { text: ClassicPreset.Socket },
  { exec: ClassicPreset.Socket },
  {}
> {
  width = 180;
  height = 140;

  constructor() {
    super('Piano');
    this.addInput('text', new ClassicPreset.Input(new TextSocket(), 'Text'));
    this.addOutput('exec', new ClassicPreset.Output(new ActionSocket(), 'Sound'));
  }

  execute() {}

  data() {
    return {
      text: 'lol'
    };
  }
}
