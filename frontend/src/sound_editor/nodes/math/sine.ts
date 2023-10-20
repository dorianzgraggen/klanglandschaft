import { ClassicPreset } from 'rete';
import { NumberSocket } from '../../sockets';

export class SineNode extends ClassicPreset.Node<
  { value_in: ClassicPreset.Socket }, // input
  { value_out: ClassicPreset.Socket }, // output
  {}
> {
  width = 180;
  height = 130;

  constructor() {
    super('Sine');
    this.addInput('value_in', new ClassicPreset.Input(new NumberSocket(), 'Value'));
    this.addOutput('value_out', new ClassicPreset.Output(new NumberSocket(), 'Value'));
  }

  execute() {}

  data(inputs: any) {
    let value_in = 0;

    if (inputs.value_in) {
      value_in = inputs.value_in[0];
    }
    return {
      value_out: Math.sin(value_in)
    };
  }
}
