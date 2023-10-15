<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { init } from './3d/scene'
// import { createEditor } from './editor'
import { createEditor } from './editor2'

const rete = ref()


onMounted(() => {
  init()
  createEditor(rete.value, (text, type) => {
    console.log("[rete]", text, type)
  })
})
</script>

<template>
  <div id="rete" ref="rete"></div>
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
