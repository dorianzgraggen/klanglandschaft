<script setup lang="ts">
import { onMounted, ref, reactive, watch, computed } from 'vue';
import { useDraggable } from '@vueuse/core';
import { user_controls_target } from '@/global';

const locationBlobElement = ref<HTMLElement | null>(null);
const interactiveMapElement = ref<HTMLElement | null>(null);

const locationBlob = {
    size: 20,
};

onMounted(() => {
    locationBlobElement.value = document.getElementById('location-blob');
    interactiveMapElement.value = document.getElementById('map-container');
});

const draggableElement = useDraggable(locationBlobElement, {
    containerElement: interactiveMapElement,
    onEnd: (position, event) => {
        const x = position.x / 176 * 340;
        const z = (1.0 - position.y / 146) * -240
        user_controls_target.set(x, 0, z);
        console.log(user_controls_target, x, z)
    },
});

// `style` will be a helper computed for `left: ?px; top: ?px;`
const { x, y, style } = draggableElement;

// TODO: change graphic to match cutout or add offset
watch(user_controls_target, (newVal) => {
    // manually set the position of the draggable element:
    draggableElement.position.value = {
        x: newVal.x / 340 * 176,// TODO: read values from width/height
        y: (1.0 - (newVal.z / -240)) * 146
    };

    //console.log(draggableElement.position.value);
    //console.log(newVal.user_position);
});

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