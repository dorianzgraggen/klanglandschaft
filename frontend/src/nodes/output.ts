import { ClassicPreset } from 'rete';
import { ActionSocket, TextSocket } from '../sockets';

export class OutputNode extends ClassicPreset.Node<
  { exec: ClassicPreset.Socket },
  {},
  { text: ClassicPreset.InputControl<'text'> }
> {
  width = 180;
  height = 140;

  constructor() {
    super('Sound Output');
    this.addInput('exec', new ClassicPreset.Input(new ActionSocket(), 'Text'));

    this.addControl(
      'text',
      new ClassicPreset.InputControl('text', {
        readonly: true
      })
    );

    // this.addOutput('text', new ClassicPreset.Output(new ActionSocket(), 'Number'));
  }

  execute() {}

  // data() {
  //   console.log('output', this);
  //   return {
  //     text: 'lol'
  //   };
  // }

  data(inputs: { left?: number[]; right?: number[] }) {
    // const control = this.inputs.exec?.control as ClassicPreset.InputControl<'text'>;

    // const { left, right } = inputs;
    // const value =
    //   (left ? left[0] : control.value || 0) + (right ? right[0] : rightControl.value || 0);

    this.controls.text.setValue('xd');
    console.log('inputs', this.inputs.exec);
    // const control = this.inputs.exec?.control as ClassicPreset.InputControl<'text'>;
    // console.log('controls', control.value);

    const a = this.inputs.exec;
    console.log('a', a);

    console.log('control', a?.control);
    // if (this.update) this.update(this.controls.value);

    return { text: 'lol' };
  }
}
