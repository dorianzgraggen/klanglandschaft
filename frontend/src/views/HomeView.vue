<script setup lang="ts">
import StatisticsComp from '@/components/StatisticsComp.vue';
import MapComp from '@/components/MapComp.vue';
import GuideComp from '@/components/GuideComp.vue';
</script>
<template>
  <GuideComp
    id="guide-component"
    title="dashboard"
    :icon-size="24"
    :height="`60%`"
    style="z-index: -1"
  >
    <div id="guide-description" class="border-corners-small">
      <p>what you hear depends on the data that is currently visible in the view</p>
      <p>
        you can explore lake lucerne by either moving around in the 3D view or by moving your
        location <button id="location-blob-icon"></button> in the minimap down below
      </p>
    </div>
    <div class="guide-controls scroll-style-1">
      <div id="control-item">
        <div class="control-text">
          left click & drag <br />
          3D view or your minimap location
        </div>
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
  <div id="stats-component">
    <StatisticsComp />
  </div>
  <div id="map-component">
    <MapComp />
  </div>
</template>

<style scoped>
#guide-component {
  pointer-events: none;
  overflow: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
}

#guide-description {
  font-size: 70%;
  padding: 15px;
  margin: 15px 0 15px 0;
}

#location-blob-icon {
  position: relative;
  width: 13px;
  height: 13px;
  background-color: rgba(78, 78, 78, 0.8);
  border-radius: 3px;
  padding: 0;
  margin: 3px;
}

.guide-controls {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin-top: 10%;
}

#control-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 15%;
  justify-content: flex-end;
  align-items: center;
}

.control-text {
  font-size: 60%;
  text-align: center;
  margin-bottom: 7px;
}

.mouse-icon {
  width: 50px;
  height: 50px;
  margin: 0 5px;
  padding: 5px;
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
  z-index: -1;
}
</style>
