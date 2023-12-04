<script setup lang="ts">
import { reactive, ref, watch } from 'vue';

const locationBlob = reactive({
    size: 20,
    top: 55,
    left: 15,
    gap: 6
});

const mouseHold = ref(false);


function updateBlobLocation(event: MouseEvent) {
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        const rect = mapContainer.getBoundingClientRect();
        const x = event.clientX - rect.left - locationBlob.size / 2;
        const y = event.clientY - rect.top + locationBlob.size;
        if (x < 8 || x > rect.width - locationBlob.size - locationBlob.gap || y < 40 || y > 183) {
            return;
        }
        locationBlob.top = y;
        locationBlob.left = x;
    }
}

function toggleMouseHold() {
    mouseHold.value = !mouseHold.value;
}

watch(mouseHold, (newValue) => {
    if (newValue) {
        document.addEventListener('mousemove', updateBlobLocation);
    } else {
        document.removeEventListener('mousemove', updateBlobLocation);
    }
});

</script>

<template>
    <div class="component-title">map</div>
    <div @mousedown.prevent='toggleMouseHold' @mouseup.prevent='toggleMouseHold' @click='updateBlobLocation'
        class="map-container border-corners">
        <img src="../assets/outline_vierwaldstaettersee.png" alt="map" />
        <button id="location-blob"></button>
    </div>
</template>

<style scoped>
.map-container {
    width: 200px;
    height: 170px;
}

img {
    width: 100%;
}

#location-blob {
    position: absolute;
    height: v-bind('locationBlob.size + "px"');
    width: v-bind('locationBlob.size + "px"');
    padding: 0;
    top: v-bind('locationBlob.top + "px"');
    left: v-bind('locationBlob.left + "px"');
    background-color: rgba(78, 78, 78, 0.8);
    border-radius: 3px;
}
</style>