import { reactive, ref } from 'vue';

export const bridge = {
  elevation: -1,
  traffic_noise: -1,
  buildings: -1,
  water: -1,
  forest: -1,
  wind: -1,
  railway: -1
};

export const layers = {
  elevation: 0,
  traffic_noise: 0,
  buildings: 0,
  water: 0,
  forest: 0,
  wind: 0,
  railway: 0
};

export const settings = reactive({
  editor_open: false,
  rerender: false
});
