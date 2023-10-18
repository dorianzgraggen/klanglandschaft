import { ClassicPreset } from 'rete';
import { NumberSocket } from '../sockets';

export class DataNode extends ClassicPreset.Node<
  {}, // inputs
  { value_out: ClassicPreset.Socket }, // outputs
  { input_id: ClassicPreset.InputControl<'text'> }
> {
  width = 180;
  height = 120;
  slider = document.getElementById('slider') as any;

  constructor() {
    super('Data Input');
    this.addControl('input_id', new ClassicPreset.InputControl('text', { initial: 'Population' }));
    this.addOutput('value_out', new ClassicPreset.Output(new NumberSocket(), 'Amount'));
  }

  execute() {}

  data() {
    let value = 1;

    if (this.slider) {
      value = this.slider.value;
      // console.log('value', value);
    }

    return {
      value_out: value / 100
    };
  }
}
