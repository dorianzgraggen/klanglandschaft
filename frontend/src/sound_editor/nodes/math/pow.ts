import { TwoInputsMathNode } from './_two_inputs';

export class PowNode extends TwoInputsMathNode {
  constructor() {
    super('Pow', (a, b) => Math.pow(a, b));
  }
}
