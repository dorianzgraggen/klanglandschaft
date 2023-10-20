<script setup lang="ts">
import { onMounted } from 'vue';

import * as Tone from 'tone';

onMounted(() => {
  window.addEventListener("keydown", e => {
    if (e.key == "w") {
      play()
    }
  })

})

function play() {
  const tremolo = new Tone.Vibrato(9, 1).toDestination();
  const oscillator = new Tone.Oscillator().connect(tremolo).start();
  console.log("play")
}
</script>


<template>
  <div>lol</div>
</template>