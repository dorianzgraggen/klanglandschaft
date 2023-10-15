import { ClassicPreset } from 'rete';
import { TextSocket } from '../sockets';

export class DataNode extends ClassicPreset.Node<
  {},
  { text: ClassicPreset.Socket },
  { value: ClassicPreset.InputControl<'text'> }
> {
  width = 180;
  height = 140;

  constructor(initial: string) {
    super('Population');
    this.addControl('value', new ClassicPreset.InputControl('text', { initial }));
    this.addOutput('text', new ClassicPreset.Output(new TextSocket(), 'Amount'));
  }

  execute() {}

  data() {
    return {
      text: this.controls.value.value || ''
    };
  }
}
