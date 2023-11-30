<script setup lang="ts">
import StatisticsComp from '@/components/StatisticsComp.vue'
</script>
<template>
    <div>
        <StatisticsComp id="stats-component" />
    </div>
</template>

<style scoped>
#stats-component {
    position: absolute;
    bottom: 15px;
    left: 15px;
}
</style>
