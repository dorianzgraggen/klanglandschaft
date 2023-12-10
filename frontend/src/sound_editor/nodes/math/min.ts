import { TwoInputsMathNode } from './_two_inputs';

export class MinNode extends TwoInputsMathNode {
  constructor() {
    super('Min', (a, b) => Math.min(a, b));
  }
}
