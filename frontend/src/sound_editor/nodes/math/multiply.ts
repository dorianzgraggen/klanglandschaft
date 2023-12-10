import { TwoInputsMathNode } from './_two_inputs';

export class MultiplyNode extends TwoInputsMathNode {
  constructor() {
    super('Multiply', (a, b) => a * b);
  }
}
