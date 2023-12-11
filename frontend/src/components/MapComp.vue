<script setup lang="ts">
import { onMounted, ref, reactive, watch, computed } from 'vue';
import { useDraggable } from '@vueuse/core';
import { user_controls_target } from '@/global';

const locationBlobElement = ref<HTMLElement | null>(null);
const interactiveMapElement = ref<HTMLElement | null>(null);

const locationBlob = {
  size: 20
};

const usable_map_width = computed(() => {
  if (interactiveMapElement.value == null || locationBlobElement.value == null) {
    return {
      x: 0,
      y: 0
    };
  }

  return {
    x: interactiveMapElement.value.offsetWidth - locationBlob.size,
    y: interactiveMapElement.value.offsetHeight - locationBlob.size
  };
});

const offset_x = 60;

const draggableElement = useDraggable(locationBlobElement, {
  containerElement: interactiveMapElement,
  onEnd: (position, event) => {
    const x = (position.x / usable_map_width.value.x) * (340 - offset_x) + offset_x;
    const z = (1.0 - position.y / usable_map_width.value.y) * -240;
    user_controls_target.set(x, 0, z);
  }
});

// `style` will be a helper computed for `left: ?px; top: ?px;`
const { x, y, style } = draggableElement;

watch(user_controls_target, (newVal) => {
  // manually set the position of the draggable element:
  draggableElement.position.value = {
    x: ((newVal.x - offset_x) / (340 - offset_x)) * usable_map_width.value.x,
    y: (1.0 - newVal.z / -240) * usable_map_width.value.y
  };
});
</script>

<template>
  <div class="component-title">map</div>
  <div id="map-container" class="border-corners" ref="interactiveBlobElement">
    <div id="interactive-area" ref="interactiveMapElement">
      <img draggable="false" src="../assets/outline_vierwaldstaettersee.png" alt="map" />
      <button id="location-blob" ref="locationBlobElement" :style="style"></button>
    </div>
  </div>
</template>

<style scoped>
#map-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 170px;
}

#interactive-area {
  position: relative;
  width: 98%;
  height: 98%;
}

img {
  width: 100%;
}

#location-blob {
  position: absolute;
  height: v-bind('locationBlob.size + "px"');
  width: v-bind('locationBlob.size + "px"');
  padding: 0;
  background-color: rgba(78, 78, 78, 0.8);
  border-radius: 3px;
}
</style>
