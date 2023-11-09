import { ClassicPreset } from 'rete';
import { NumberSocket } from '../../sockets';

export class DataNode extends ClassicPreset.Node<
  {}, // inputs
  { value_out: ClassicPreset.Socket }, // outputs
  { input_id: ClassicPreset.InputControl<'text'> }
> {
  width = 180;
  height = 120;

  sliders = {
    traffic_noise: document.getElementById('slider-traffic'),
    population: document.getElementById('slider-population'),
    elevation: document.getElementById('slider-elevation')
  } as { [key: string]: any };

  constructor(type = 'none') {
    super('Data Input');

    this.addControl('input_id', new ClassicPreset.InputControl('text', { initial: type }));
    this.addOutput('value_out', new ClassicPreset.Output(new NumberSocket(), 'Amount'));
  }

  execute() {}

  data() {
    let value = 100;

    const slider = this.sliders[this.controls.input_id.value as string];

    if (slider) {
      value = slider.value;
      console.log('value', this.controls.input_id.value, value);
    } else {
      console.warn('slider', this.controls.input_id.value, 'does not exst');
    }

    return {
      value_out: value / 100
    };
  }
}
