<script setup lang="ts">
import { loaded_audios } from '@/global';
</script>

<template>
  <div>{{ Math.round(Math.pow(loaded_audios / 8, 1.8) * 100) / 1 }}%</div>
</template>

<style scoped>
div {
  align-self: center;
}
</style>
