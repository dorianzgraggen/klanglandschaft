import { ClassicPreset } from 'rete';
import { NumberSocket } from '../../sockets';
import { bridge } from '@/global';

export const data_types: { [key: string]: string } = {
  elevation: 'Elevation ⛰️',
  traffic_noise: 'Traffic Noise 🚘',
  wind: 'Wind Strength 🌬️',
  buildings: 'Buildings 🏠',
  water: 'Bodies of Water 🌊',
  forest: 'Forests 🌲',
  railway: 'Railway Tracks 🛤️'
};

export class DataNode extends ClassicPreset.Node<
  {}, // inputs
  { value_out: ClassicPreset.Socket }, // outputs
  { input_id: ClassicPreset.InputControl<'text'> }
> {
  width = 180;
  height = 86;

  sliders = {
    traffic_noise: document.getElementById('slider-traffic'),
    population: document.getElementById('slider-population'),
    elevation: document.getElementById('slider-elevation')
  } as { [key: string]: any };

  type = '';

  constructor(type = 'none') {
    super('Data Input');

    this.type = type;
    this.label = data_types[type];

    // this.addControl('input_id', new ClassicPreset.InputControl('text', { initial: type }));
    this.addOutput('value_out', new ClassicPreset.Output(new NumberSocket(), 'Amount'));
  }

  execute() {}

  data() {
    let value = 0.5;

    const prop = (bridge as any)[this.type as string];

    if (typeof prop !== 'undefined') {
      value = prop;
      // console.log('value', this.controls.input_id.value, value);
    } else {
      // console.warn('slider', this.controls.input_id.value, 'does not exst');
    }

    return {
      value_out: value
    };
  }
}
