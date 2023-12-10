import { TwoInputsMathNode } from './_two_inputs';

export class MaxNode extends TwoInputsMathNode {
  constructor() {
    super('Max', (a, b) => Math.max(a, b));
  }
}
