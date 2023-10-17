import { ClassicPreset } from 'rete';
import { TextSocket } from '../sockets';

export class TimeNode extends ClassicPreset.Node<
  {}, // inputs
  { seconds: ClassicPreset.Socket }, // outputs
  {}
> {
  width = 180;
  height = 120;

  constructor() {
    super('Time');
    this.addOutput('seconds', new ClassicPreset.Output(new TextSocket(), 'Seconds'));
  }

  execute() {}

  data() {
    return {
      seconds: performance.now() / 1000
    };
  }
}
