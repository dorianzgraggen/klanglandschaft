<script setup lang="ts">
import { ref } from 'vue';

const settings = defineProps({
  mainTitle: {
    type: String,
    default: 'guide'
  },
  title: String,
  iconSize: {
    type: Number,
    default: 30
  },
  margin: {
    type: Number,
    default: 20
  },
  height: {
    type: String,
    default: '100%'
  },
  width: {
    type: String,
    default: '350px'
  },
  isQuestionMark: {
    type: Boolean,
    default: true
  }
});

const showGuide = ref(false);
</script>

<template>
  <div id="guide-container">
    <Transition name="slide">
      <div v-if="showGuide" id="guide-content">
        <button id="close-button" @click="showGuide = !showGuide">x</button>
        <span>{{ mainTitle }}</span>
        <p style="padding-top: 40px; margin: 0">{{ title }}</p>
        <slot />
      </div>
    </Transition>
    <button v-if="!showGuide" id="guide-button" @click="showGuide = !showGuide">
      <img v-if="isQuestionMark" src="../assets/questionmark-icon.png" alt="icon" />
      <img v-else src="../assets/info-icon.png" alt="icon" />
    </button>
  </div>
</template>

<style scoped>
button {
  background-color: transparent;
  border: none;
  padding: 0;
  pointer-events: all;
}

#guide-button {
  position: absolute;
  width: v-bind('settings.iconSize + "px"');
  height: v-bind('settings.iconSize + "px"');
  top: 0;
  right: 0;
  border: none;
  border-radius: 50%;
  pointer-events: all;
  margin: v-bind('settings.margin + "px"');
}

#guide-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

#close-button {
  position: fixed;
  font-size: 100%;
  padding-right: 8px;
  pointer-events: all;
  top: 18px;
  right: 18px;
}

#close-button:hover {
  text-shadow: 0 0 4px #ffffff;
}

img {
  position: relative;
  width: 100%;
  height: 100%;
}

#guide-content {
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 40px;
  padding-top: 60px;
  background-color: rgba(0, 0, 0, 0.691);
  border-radius: 20px;
  height: v-bind('settings.height');
  width: v-bind('settings.width');
  pointer-events: all;
  top: 0;
  right: 0;
}

/* #guide-content::-webkit-scrollbar {
  display: none;
} */

p {
  margin: 0;
  font-size: 90%;
}

span {
  font-size: 100%;
  font-weight: bold;
}

.slide-enter-active {
  transition: all 0.3s ease-out;
}

.slide-leave-active {
  transition: all 0.2s ease-in;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
