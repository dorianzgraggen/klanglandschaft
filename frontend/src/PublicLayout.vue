<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import SoundEditor from './sound_editor/SoundEditor.vue';
import { onMounted, ref } from 'vue';
import { init as init_3d_scene } from './3d/scene';
import { init_editor, play } from './sound_editor/editor';

const show_start_screen = ref(true);

const settings = ref({
  editor_open: false
})

function toggleOpenEditor() {
  settings.value.editor_open = !settings.value.editor_open
}

function start() {
  show_start_screen.value = false;
  play();
}

onMounted(async () => {
  init_3d_scene(settings);
});
</script>

<template>
  <SoundEditor v-show="settings.editor_open"></SoundEditor>

  <!-- Button for toggling sound editor visibility -->
  <button id="editor-button" @click="toggleOpenEditor">
    {{ settings.editor_open ? 'Back to exploring' : 'Edit Soundscape' }}
  </button>

  <!-- Three.js scene will be rendered here -->
  <div id="canvas-root"></div>

  <!-- Rendering Debug Information -->
  <div id="debug-info" class="debug">
    <span></span> | <span class="r"></span> <span class="g"></span> <span class="b"></span>
    <span class="a"></span>
  </div>

  <RouterView />

  <!--
    Start Screen overlay that needs to be shown first because audio can only play
    after the user has interacted with the site
  -->
  <div id="start-screen" v-show="show_start_screen">
    <button @click="start">Start Exploring</button>
  </div>
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

#rete {
  background-color: rgba(0, 0, 0, 0.484);
  /* height: 20px; */
  flex: 1;
  backdrop-filter: blur(10px) saturate(0.6);
}

#editor-button {
  position: absolute;
  top: 15px;
  left: 15px;
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
