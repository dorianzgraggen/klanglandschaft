import { ClassicPreset } from 'rete';
import { NumberSocket } from '../sockets';

// ABSTRACT STUFF

export abstract class TwoInputsMathNode extends ClassicPreset.Node<
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

// TWO INPUTS NODES

export class AddNode extends TwoInputsMathNode {
  constructor() {
    super('Add', (a, b) => a + b);
  }
}

export class SubtractNode extends TwoInputsMathNode {
  constructor() {
    super('Subtract', (a, b) => a - b);
  }
}

export class MultiplyNode extends TwoInputsMathNode {
  constructor() {
    super('Multiply', (a, b) => a * b);
  }
}

export class DivideNode extends TwoInputsMathNode {
  constructor() {
    super('Divide', (a, b) => a / b);
  }
}

export class PowNode extends TwoInputsMathNode {
  constructor() {
    super('Pow', (a, b) => Math.pow(a, b));
  }
}

export class MinNode extends TwoInputsMathNode {
  constructor() {
    super('Min', (a, b) => Math.min(a, b));
  }
}

export class MaxNode extends TwoInputsMathNode {
  constructor() {
    super('Max', (a, b) => Math.max(a, b));
  }
}

// OTHER MATH NODES

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

export class TimeNode extends ClassicPreset.Node<
  {}, // inputs
  { seconds: ClassicPreset.Socket }, // outputs
  {}
> {
  width = 180;
  height = 120;

  constructor() {
    super('Time');
    this.addOutput('seconds', new ClassicPreset.Output(new NumberSocket(), 'Seconds'));
  }

  execute() {}

  data() {
    return {
      seconds: performance.now() / 1000
    };
  }
}
