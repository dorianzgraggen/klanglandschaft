<script setup lang="ts">
import { reactive } from 'vue';

const stats = reactive({
    traffic: { id: 1, name: "stats-traffic", description: "day traffic noise", percentageValue: 20, topColor: "#ff7b23", bottomColor: "#FF0000" },
    elevation: { id: 2, name: "stats-elevation", description: "elevation", percentageValue: 30, topColor: "#0BE72E", bottomColor: "#13C2A3" },
    wind: { id: 3, name: "stats-wind", description: "wind speed", percentageValue: 50, topColor: "#5915E9", bottomColor: "#BB0BE7" },
    data: { id: 4, name: "stats-data", description: "data", percentageValue: 70, topColor: "#1E45CD", bottomColor: "#5534D8" }
});


function updateTrafficPercentage() {
    stats.traffic.percentageValue += 10;
}

</script>

<template>
    <div id="title">stats</div>
    <div class="stats-container border-corners">
        <div class="stat-item" v-for="stat in stats" :key="stat.id">
            <span>{{ stat.description }}</span>
            <div class="bar">
                <div :id="stat.name" class="bar-percentage"
                    :style="{ width: stat.percentageValue + 'px', backgroundImage: `linear-gradient(to bottom, ${stat.topColor}, ${stat.bottomColor})`, boxShadow: `0 0 4px ${stat.bottomColor}` }">
                </div>
            </div>
        </div>
        <button id="button-traffic-update" @click="updateTrafficPercentage">update traffic stat</button>
    </div>
</template>

<style scoped>
#title {
    font-size: 18px;
    margin-bottom: 10px;
}

.stats-container {
    height: 250px;
    width: 250px;
    display: flex;
    flex-direction: column;
    justify-content: center;
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

#button-traffic-update {
    font-size: 10px;
    padding: 0;
    width: 100px;
    height: 40px;
}
</style>