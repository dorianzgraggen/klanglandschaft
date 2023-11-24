<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { init_editor, play } from './editor';


const rete = ref();


onMounted(async () => {
  init_editor(rete.value, (text, type) => {
    console.log('[rete]', text, type);
  });
});
</script>

<template>
  <div id="sound-editor">
    <div id="rete" ref="rete">
      <!-- rete.js nodes will be appended into this element -->
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
  backdrop-filter: blur(10px) saturate(0.6);
}

.bottom {
  background-color: rgb(29, 29, 29);
}

button {
  background-color: rgba(0, 0, 0, 0.691);
  color: white;
  font-size: 18px;
  border: 2px solid rgba(255, 255, 255, 0.168);
  border-radius: 5px;
  padding: 16px 20px;
}

#toggle {
  position: absolute;
  bottom: 12px;
  right: 12px;
}

#start-screen {
  background-color: black;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
