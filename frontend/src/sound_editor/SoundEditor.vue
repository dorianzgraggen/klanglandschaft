<script setup lang="ts">
import { onMounted, ref } from 'vue'

const rete = ref()


onMounted(async () => {
  console.log("soundi")
  const { init_editor } = await import("./editor")
  init_editor(rete.value, (text, type) => {
    console.log("[rete]", text, type)
  })
})

</script>

<template>
  <div id="sound-editor">
    <div class="top">
      Trees
      <input type="range" id="slider-trees">
      Population
      <input type="range" id="slider-population">
      Elevation
      <input type="range" id="slider-elevation">
    </div>

    <div id="rete" ref="rete"></div>
    <div class="bottom">
      ja haha
    </div>
  </div>
</template>

<style scoped>
#sound-editor {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
  display: flex;
  flex-direction: column;
}

.top {
  background-color: rgb(29, 29, 29);
}

#rete {
  background-color: rgba(0, 0, 0, 0.484);
  /* height: 20px; */
  flex: 1;
}

.bottom {
  background-color: rgb(29, 29, 29);
}
</style>