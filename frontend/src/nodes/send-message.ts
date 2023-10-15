import { ClassicPreset } from 'rete';
import { DataflowEngine } from 'rete-engine';
import { ActionSocket, TextSocket } from '../sockets';
import { type Schemes } from '../types';

export class SendMessage extends ClassicPreset.Node<
  { exec: ClassicPreset.Socket; text: ClassicPreset.Socket },
  {},
  {}
> {
  width = 180;
  height = 135;

  constructor(
    private dataflow: DataflowEngine<Schemes>,
    private respond: (text: string) => void
  ) {
    super('Send message');
    this.addInput('exec', new ClassicPreset.Input(new ActionSocket(), 'Action'));
    this.addInput('text', new ClassicPreset.Input(new TextSocket(), 'Text'));
  }

  async execute(_: never, forward: (output: 'exec') => void) {
    const inputs = await this.dataflow.fetchInputs(this.id);
    const text = (inputs.text && inputs.text[0]) || '';

    this.respond(text);
  }

  data() {
    return {};
  }
}
