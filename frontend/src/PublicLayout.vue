<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import SoundEditor from './sound_editor/SoundEditor.vue';
import { onMounted, ref } from 'vue';
import { init as init_3d_scene } from './3d/scene';
import { init_editor, play } from './sound_editor/editor';
import GuideComp from '@/components/GuideComp.vue';

const show_start_screen = ref(new URLSearchParams(window.location.search).get('nointro') === null);

const settings = ref({
  editor_open: false
});

function toggleOpen() {
  settings.value.editor_open = !settings.value.editor_open;
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

  <!-- TODO: Responsiveness -->
  <GuideComp v-show="settings.editor_open" id="guide-component" title="sound editor" :icon-size="24" :height="`100%`">
    <div class="border-corners-small guide-description">
      <p>the sound editor allows you to create your own soundscape with the help of nodes. make your very own connections
        to change what sounds you hear while moving around in
        the 3d view.</p>
    </div>
    <div class="guide-controls">
      <div class="control-item">
        <div class="control-text">open context menu</div>
        <img class="mouse-icon" src="./assets/right-click.png" alt="mouse right click" />
      </div>
      <div class="control-item">
        <div class="control-text">
          move around<br /> move nodes <br /> make connections
        </div>
        <img class="mouse-icon" src="./assets/left-click.png" alt="mouse left click" />
      </div>
      <div class="control-item">
        <div class="control-text">zoom</div>
        <img class="mouse-icon" src="./assets/scroll.png" alt="mouse scroll" />
      </div>
    </div>
    <div class="node-description">
      <div class="node-item">
        <p class="node-text">a data node has an "amount" socket representing the amount visible in the statistics
          component, which can be
          connected to any effect node to control its mix.</p>
        <img src="./assets/data-node.png" alt="data node" />
      </div>
      <div class="node-item">
        <p class="node-text">a sound node represents a specific sound, which can be edited with effect nodes.</p>
        <img src="./assets/sound-node.png" alt="sound node" />
      </div>
      <div class="node-item">
        <p class="node-text">effect nodes have a "mix" socket that can either be controlled manually or be
          influenced by a data node.</p>
        <div style="display: flex; flex-direction: column; align-items: center;">
          <img style="height: auto; width: 100px" src="./assets/effect-node-1.png" alt="data node 1" />
          <img style="height: 95px;" src="./assets/effect-node-2.png" alt="data node 2" />
        </div>
      </div>
      <!-- <p class="node-text">start by opening the context menu with all available nodes and choosing a few!</p> -->
    </div>

  </GuideComp>

  <!-- Button for toggling sound editor visibility -->
  <button id="editor-button" @click="toggleOpen">
    {{ settings.editor_open ? 'Back to exploring' : 'Edit Soundscape' }}
  </button>

  <!-- Three.js scene will be rendered here -->
  <div id="canvas-root"></div>

  <!-- Rendering Debug Information -->
  <div id="debug-info" class="debug">
    <span></span>
    | <span class="r"></span> <span class="g"></span> <span class="b"></span>
    <span class="a"></span> | <span class="r"></span> <span class="g"></span>
    <span class="b"></span> <span class="a"></span>
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

#guide-component {
  pointer-events: none;
  overflow: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
}

.guide-description {
  font-size: 0.9vi;
  padding: 13px;
  margin: 15px 0 15px 0;
}

.node-text {
  font-size: 0.8vi;
  padding: 10px;
}

.guide-controls {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding:
}

.node-description {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}

.control-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 10px;
  justify-content: flex-end;
  align-items: center;
}

.node-item {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding-bottom: 10px;
  padding-top: 10px;
}

.node-item img {
  height: 60px;
}

.control-text {
  font-size: 0.8vi;
  text-align: center;
  margin-bottom: 7px;
}

.mouse-icon {
  height: 50px;
  margin: 0 5px;
  padding: 5px;
}
</style>
