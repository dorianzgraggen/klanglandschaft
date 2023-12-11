import { reactive } from 'vue';
import { Vector3 } from 'three';

export const bridge = reactive({
  elevation: -1,
  traffic_noise: -1,
  buildings: -1,
  water: -1,
  forest: -1,
  wind: -1
});

export const user_controls_target = reactive(new Vector3());
