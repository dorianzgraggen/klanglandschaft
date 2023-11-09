import { ClassicPreset } from 'rete';
import { NumberSocket } from '../../sockets';
import { bridge } from '@/bridge';

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
    let value = 0.5;

    const prop = (bridge as any)[this.controls.input_id.value as string];

    if (typeof prop !== 'undefined') {
      value = prop;
      console.log('value', this.controls.input_id.value, value);
    } else {
      console.warn('slider', this.controls.input_id.value, 'does not exst');
    }

    return {
      value_out: value
    };
  }
}
