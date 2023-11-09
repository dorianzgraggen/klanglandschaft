<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import SoundEditor from './sound_editor/SoundEditor.vue';
import { onMounted } from 'vue';
import { init } from './3d/scene';

onMounted(async () => {
  init();
});
</script>

<template>
  <SoundEditor></SoundEditor>
  <div id="canvas-root"></div>
  <div id="debug-info">lol</div>
  <div class="top-bar">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/edit">Edit</RouterLink>
  </div>
  <RouterView />
</template>

<style scoped>
#canvas-root {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: -1;
}

#rete {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
}

#debug-info {
  position: absolute;
  bottom: 0;
  left: 100px;
  color: white;
  background-color: #00000060;
  font-family: sans-serif;
  padding: 6px;
  font-size: 14px;
}
</style>
