<script setup lang="ts">
import StatisticsComp from '@/components/StatisticsComp.vue'
import MapComp from '@/components/MapComp.vue'
</script>
<template>
    <div id="stats-component">
        <StatisticsComp />
    </div>
    <div id="map-component">
        <MapComp />
    </div>
</template>

<style scoped>
#stats-component {
    position: absolute;
    bottom: 15px;
    left: 15px;
}


#map-component {
    position: absolute;
    bottom: 15px;
    right: 15px;
}
</style>
