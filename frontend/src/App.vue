<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { init } from './3d/scene'
import { createEditor } from './sound_editor/editor'
import SoundEditor from "./sound_editor/SoundEditor.vue"

const rete = ref()


onMounted(() => {
  init()
})
</script>

<template>
  <SoundEditor></SoundEditor>
  <div id="canvas-root"></div>
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
</style>
./sound_editor/editor./sound_editor/connections