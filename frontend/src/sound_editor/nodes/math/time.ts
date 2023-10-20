import { ClassicPreset } from 'rete';
import { NumberSocket } from '../../sockets';

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
