<script setup lang="ts">
import { reactive } from 'vue';
import { bridge } from '@/global';
import { computed } from 'vue';

let statMultiplier = 100;

const stats = reactive({
  elevation: {
    id: 1,
    name: 'stats-elevation',
    description: 'elevation',
    percentageValue: computed(() => bridge.elevation * statMultiplier),
    topColor: '#ff4d6d',
    bottomColor: '#b100e8'
  },
  traffic_noise: {
    id: 2,
    name: 'stats-traffic',
    description: 'traffic noise',
    percentageValue: computed(() => bridge.traffic_noise * statMultiplier),
    topColor: '#ff7b23',
    bottomColor: '#FF0000'
  },
  buildings: {
    id: 3,
    name: 'stats-buildings',
    description: 'buildings',
    percentageValue: computed(() => bridge.buildings * statMultiplier),
    topColor: '#ffba08',
    bottomColor: '#f48c06'
  },
  water: {
    id: 4,
    name: 'stats-water',
    description: 'water',
    percentageValue: computed(() => bridge.water * statMultiplier),
    topColor: '#1e96fc',
    bottomColor: '#072ac8'
  },
  forest: {
    id: 5,
    name: 'stats-forest',
    description: 'forest',
    percentageValue: computed(() => bridge.forest * statMultiplier),
    topColor: '#0BE72E',
    bottomColor: '#13C2A3'
  },
  wind: {
    id: 6,
    name: 'stats-wind',
    description: 'wind',
    percentageValue: computed(() => bridge.wind * statMultiplier),
    topColor: '#BB0BE7',
    bottomColor: '#560bad'
  }
});
</script>

<template>
  <div class="component-title">stats</div>
  <div class="stats-container border-corners">
    <div class="stat-item" v-for="stat in stats" :key="stat.id">
      <span>{{ stat.description }}</span>
      <div class="bar">
        <div
          :id="stat.name"
          class="bar-percentage"
          :style="{
            width: stat.percentageValue + 'px',
            backgroundImage: `linear-gradient(to bottom, ${stat.topColor}, ${stat.bottomColor})`,
            boxShadow: `0 0 4px ${stat.bottomColor}`
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-container {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 15px;
  height: 11rem;
  width: 15rem;
}

.stat-item {
  padding: 2%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.bar {
  background-color: #6e6e6e;
  height: 10px;
  width: 100px;
  border-radius: 9px;
}

.bar-percentage {
  height: 10px;
  width: 20px;
  border-radius: 9px;
}
</style>
