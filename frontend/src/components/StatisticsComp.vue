<script setup lang="ts">
import { reactive } from 'vue';
import { bridge } from '@/global';
import { computed } from 'vue';

let statMultiplier = 100;

const stats = reactive({
    elevation: computed(() => ({
        id: 1,
        name: "stats-elevation",
        description: "elevation",
        percentageValue: bridge.elevation * statMultiplier,
        topColor: "#0BE72E",
        bottomColor: "#13C2A3"
    })),
    traffic_noise: computed(() => ({
        id: 2,
        name: "stats-traffic",
        description: "traffic noise",
        percentageValue: bridge.traffic_noise * statMultiplier,
        topColor: "#ff7b23",
        bottomColor: "#FF0000"
    })),
    buildings: computed(() => ({
        id: 3,
        name: "stats-buildings",
        description: "buildings",
        percentageValue: bridge.buildings * statMultiplier,
        topColor: "#1E45CD",
        bottomColor: "#5534D8"
    })),
    water: computed(() => ({
        id: 4,
        name: "stats-water",
        description: "water",
        percentageValue: bridge.water * statMultiplier,
        topColor: "#1E45CD",
        bottomColor: "#5534D8"
    })),
    forest: computed(() => ({
        id: 5,
        name: "stats-forest",
        description: "forest",
        percentageValue: bridge.forest * statMultiplier,
        topColor: "#1E45CD",
        bottomColor: "#5534D8"
    })),
    wind: computed(() => ({
        id: 6,
        name: "stats-wind",
        description: "wind",
        percentageValue: bridge.wind * statMultiplier,
        topColor: "#5915E9",
        bottomColor: "#BB0BE7"
    }))
});
</script>

<template>
    <div class="component-title">stats</div>
    <div class="stats-container border-corners">
        <div class="stat-item" v-for="stat in stats" :key="stat.id">
            <span>{{ stat.description }}</span>
            <div class="bar">
                <div :id="stat.name" class="bar-percentage"
                    :style="{ width: stat.percentageValue + 'px', backgroundImage: `linear-gradient(to bottom, ${stat.topColor}, ${stat.bottomColor})`, boxShadow: `0 0 4px ${stat.bottomColor}` }">
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.stats-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 10px;
    height: 250px;
    width: 250px;
}

.stat-item {
    padding: 2%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.bar {
    background-color: #6E6E6E;
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