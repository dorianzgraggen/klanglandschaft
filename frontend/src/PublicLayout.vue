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
  <div id="debug-info" class="debug">
    <span></span> | <span class="r"></span> <span class="g"></span> <span class="b"></span>
    <span class="a"></span>
  </div>
  <div id="sound-info" class="debug"></div>
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

.debug {
  font-family: monospace;
  background-color: #00000060;
  color: white;
  padding: 3px;
  font-size: 11px;
  margin: 0;
}

#sound-info {
  position: absolute;
  right: 0px;
  bottom: 40px;
}

#debug-info {
  position: absolute;
  bottom: 0;
  left: 100px;
}

.r {
  color: #ff3333;
}

.b {
  color: #3333ff;
}

.g {
  color: #33ff33;
}

.a {
  color: #aaaaaa;
}
</style>
