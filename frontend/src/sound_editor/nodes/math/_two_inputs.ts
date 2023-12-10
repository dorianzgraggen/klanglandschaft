import { ClassicPreset } from 'rete';
import { NumberSocket } from '../../sockets';

export class TwoInputsMathNode extends ClassicPreset.Node<
  { a: ClassicPreset.Socket; b: ClassicPreset.Socket }, // input
  { value_out: ClassicPreset.Socket }, // output
  {}
> {
  width = 180;
  height = 160;

  constructor(
    name: string,
    private operation: (a: number, b: number) => number
  ) {
    super(name);

    const a = new ClassicPreset.Input(new NumberSocket(), 'A');
    this.addInput('a', a);
    a.addControl(new ClassicPreset.InputControl('number', { initial: 0 }));

    const b = new ClassicPreset.Input(new NumberSocket(), 'B');
    this.addInput('b', b);
    b.addControl(new ClassicPreset.InputControl('number', { initial: 0 }));

    this.addOutput('value_out', new ClassicPreset.Output(new NumberSocket(), 'Value'));
  }

  execute() {}

  data(inputs: any) {
    let a = (this.inputs.a!.control as ClassicPreset.InputControl<'number'>).value ?? 0;
    let b = (this.inputs.b!.control as ClassicPreset.InputControl<'number'>).value ?? 0;

    if (typeof inputs.a !== 'undefined') {
      a = inputs.a[0];
    }

    if (typeof inputs.b !== 'undefined') {
      b = inputs.b[0];
    }

    return {
      value_out: this.operation(a, b)
    };
  }
}
