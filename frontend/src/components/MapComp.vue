<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useDraggable } from '@vueuse/core';

const locationBlobElement = ref<HTMLElement | null>(null);
const interactiveMapElement = ref<HTMLElement | null>(null);

const locationBlob = {
    size: 20,
};

onMounted(() => {
    locationBlobElement.value = document.getElementById('location-blob');
    interactiveMapElement.value = document.getElementById('map-container');
});

// `style` will be a helper computed for `left: ?px; top: ?px;`
const { x, y, style } = useDraggable(locationBlobElement, {
    containerElement: interactiveMapElement,
})

//TODO: send out location blob's position to backend

</script>

<template>
    <div class="component-title">map</div>
    <div id="map-container" class="border-corners">
        <div id="interactive-area" ref="interactiveMapElement">
            <img draggable=false src="../assets/outline_vierwaldstaettersee.png" alt="map" />
            <button id="location-blob" ref="locationBlobElement" :style="style"></button>
        </div>


    </div>
</template>

<style scoped>
#map-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
    height: 170px;
}

#interactive-area {
    position: relative;
    width: 98%;
    height: 98%;
}

img {
    width: 100%;
}

#location-blob {
    position: absolute;
    height: v-bind('locationBlob.size + "px"');
    width: v-bind('locationBlob.size + "px"');
    padding: 0;
    background-color: rgba(78, 78, 78, 0.8);
    border-radius: 3px;
}
</style>