import { TwoInputsMathNode } from './_two_inputs';

export class SubtractNode extends TwoInputsMathNode {
  constructor() {
    super('Subtract', (a, b) => a - b);
  }
}
