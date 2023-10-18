import { ClassicPreset } from 'rete';
import { ActionSocket, TextSocket } from '../../sockets';

export class MultiplyNode extends ClassicPreset.Node<
  { value_in: ClassicPreset.Socket }, // input
  { value_out: ClassicPreset.Socket }, // output
  { multiplier: ClassicPreset.InputControl<'number'> }
> {
  width = 180;
  height = 160;

  constructor(multiplier = 1) {
    super('Multiply');
    this.addInput('value_in', new ClassicPreset.Input(new TextSocket(), 'Value'));
    this.addControl(
      'multiplier',
      new ClassicPreset.InputControl('number', { initial: multiplier })
    );
    this.addOutput('value_out', new ClassicPreset.Output(new TextSocket(), 'Value'));
  }

  execute() {}

  data(inputs: any) {
    let value_in = 0;
    let multiplier = 1;

    if (typeof this.controls.multiplier.value !== 'undefined') {
      multiplier = this.controls.multiplier.value;
    }

    if (inputs.value_in) {
      value_in = inputs.value_in[0];
    }
    return {
      value_out: value_in * multiplier
    };
  }
}
