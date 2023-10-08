<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { init } from './3d/scene'

onMounted(() => {
  init()
})
</script>

<template>
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
</style>
