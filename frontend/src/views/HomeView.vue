<script setup lang="ts">
import StatisticsComp from '@/components/StatisticsComp.vue'
import MapComp from '@/components/MapComp.vue'
import GuideComp from '@/components/GuideComp.vue'
</script>
<template>
    <div id="guide-component">
        <GuideComp title="3D-View">
            <p>guide description</p>
            <div id="guide-controls">
                <img class="mouse-icon" src="../assets/left-click.png" alt="mouse left click" />
                <img class="mouse-icon" src="../assets/right-click.png" alt="mouse right click" />
                <img class="mouse-icon" src="../assets/scroll.png" alt="mouse scroll" />
            </div>
        </GuideComp>
    </div>
    <div id="stats-component">
        <StatisticsComp />
    </div>
    <div id="map-component">
        <MapComp />
    </div>
</template>

<style scoped>
#guide-component {
    position: absolute;
    top: 0;
    right: 0;
}

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

p {
    font-size: 13px;
}

.mouse-icon {
    width: 50px;
    height: 50px;
    margin: 0 5px;
}
</style>
