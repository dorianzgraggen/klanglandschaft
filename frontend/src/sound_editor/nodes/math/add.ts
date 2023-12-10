import { TwoInputsMathNode } from './_two_inputs';

export class AddNode extends TwoInputsMathNode {
  constructor() {
    super('Add', (a, b) => a + b);
  }
}
