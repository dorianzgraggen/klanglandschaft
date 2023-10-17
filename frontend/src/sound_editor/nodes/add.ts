import { ClassicPreset } from 'rete';
import { ActionSocket, TextSocket } from '../sockets';

export class AddNode extends ClassicPreset.Node<
  { value_in: ClassicPreset.Socket }, // input
  { value_out: ClassicPreset.Socket }, // output
  { summand: ClassicPreset.InputControl<'number'> }
> {
  width = 180;
  height = 160;

  constructor(addend = 0) {
    super('Add');
    this.addInput('value_in', new ClassicPreset.Input(new TextSocket(), 'Value'));
    this.addControl('summand', new ClassicPreset.InputControl('number', { initial: addend }));
    this.addOutput('value_out', new ClassicPreset.Output(new TextSocket(), 'Value'));
  }

  execute() {}

  data(inputs: any) {
    let value_in = 0;
    let summand = 0;

    if (this.controls.summand.value) {
      summand = this.controls.summand.value;
    }

    if (inputs.value_in) {
      value_in = inputs.value_in[0];
    }
    return {
      value_out: value_in + summand
    };
  }
}
