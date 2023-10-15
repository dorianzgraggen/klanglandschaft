import { ClassicPreset } from 'rete';
import { TextSocket } from '../sockets';

export class DataNode extends ClassicPreset.Node<
  {}, // inputs
  { value: ClassicPreset.Socket } // outputs
> {
  width = 180;
  height = 90;

  constructor() {
    super('Population');
    // this.addControl(
    //   'value',
    //   new ClassicPreset.InputControl('number', { initial: 0, readonly: true })
    // );
    this.addOutput('value', new ClassicPreset.Output(new TextSocket(), 'Amount'));
  }

  execute() {}

  data() {
    const data_value = Math.random();

    // this.controls.value.setValue(data_value);

    console.log(data_value);

    return {
      value: Math.random()
    };
  }
}
