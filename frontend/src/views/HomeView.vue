<script setup lang="ts">
import StatisticsComp from '@/components/StatisticsComp.vue'
import MapComp from '@/components/MapComp.vue'
import GuideComp from '@/components/GuideComp.vue'
</script>
<template>
    <div id="guide-component">
        <GuideComp title="3D-view">
            <p class="border-corners-small" style="margin-bottom: 20px;">what you hear depends on the data that is currently
                visible in the view. have fun exploring lake
                lucerne!</p>
            <div id="guide-controls">
                <div id="control-item">
                    <div class="control-text">left click to move</div>
                    <img class="mouse-icon" src="../assets/left-click.png" alt="mouse left click" />
                </div>
                <div id="control-item">
                    <div class="control-text">right click to rotate</div>
                    <img class="mouse-icon" src="../assets/right-click.png" alt="mouse right click" />
                </div>
                <div id="control-item">
                    <div class="control-text">scroll to zoom</div>
                    <img class="mouse-icon" src="../assets/scroll.png" alt="mouse scroll" />
                </div>
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
    height: 70%;
    width: 300px;
    top: 0;
    right: 0;
    pointer-events: none;
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
    font-size: 12px;
    padding: 15px;
}


#guide-controls {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

#control-item {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 20px;
    justify-content: space-between;
    align-items: center;

}

.control-text {
    font-size: 11px;
}

.mouse-icon {
    width: 50px;
    height: 50px;
    margin: 0 5px;
    padding: 5px;
}
</style>
