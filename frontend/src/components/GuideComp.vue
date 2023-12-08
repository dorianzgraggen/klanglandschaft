<script setup lang="ts">
import { ref } from 'vue';

defineProps({
    title: String,
});
const showGuide = ref(false);

</script>

<template>
    <div id="guide-container">
        <Transition name="slide">
            <div v-if="showGuide" id="guide-content">
                <button id="close-button" @click="showGuide = !showGuide">x</button>
                <span>guide</span>
                <p style="padding-top: 40px; margin: 0;">{{ title }}</p>
                <slot />
            </div>
        </Transition>
        <button v-if="!showGuide" id="guide-button" @click="showGuide = !showGuide">
            <img src="../assets/questionmark-icon.png" alt="questionmark-icon" />
        </button>
    </div>
</template>

<style scoped>
#guide-container {
    overflow: hidden;
}

button {
    position: absolute;
    background-color: transparent;
    border: none;
    top: 20px;
    right: 20px;
    padding: 0;
}

#guide-button {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 50%;
}

#close-button {
    font-size: 20px;
    padding-right: 8px;
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
    position: relative;
    width: 200px;
    height: 550px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 40px;
    padding-top: 60px;
    background-color: rgba(0, 0, 0, 0.691);
    border-radius: 20px;
}

p {
    margin: 0;
    font-size: 15px;
}

span {
    font-size: 19px;
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
