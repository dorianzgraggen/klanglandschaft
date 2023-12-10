import { TwoInputsMathNode } from './_two_inputs';

export class DivideNode extends TwoInputsMathNode {
  constructor() {
    super('Divide', (a, b) => a / b);
  }
}
