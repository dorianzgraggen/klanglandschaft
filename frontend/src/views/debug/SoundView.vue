<script setup lang="ts">
import { onMounted } from 'vue';

import * as Tone from 'tone';

onMounted(() => {
  const player1 = new Tone.Player({
    url: 'https://cdn.freesound.org/previews/629/629170_12574855-lq.mp3',
    loop: true,
    autostart: false
  });
  const vibrato1 = new Tone.Vibrato(9, 1);
  const gain1 = new Tone.Gain();

  const player2 = new Tone.Player({
    url: '/398867__gis_sweden__shaped-by-chaos.wav',
    loop: true,
    autostart: false
  });

  const gain2 = new Tone.Gain();

  const pitchshift = new Tone.PitchShift(-15);

  window.addEventListener('keydown', async (e) => {
    if (e.key == 'q') {
      await Tone.start();
    }
    if (e.key == 'w') {
      play();
    }
  });

  function play() {
    player1.chain(pitchshift, Tone.getDestination());
    // player1.toDestination() // tested if i can route one player to the destination multiple times.

    player1.start();
    // const oscillator = new Tone.Oscillator().connect(tremolo).start();
    console.log('play');

    // gain2.toDestination();
    // player2.connect(gain2).start();;

    update(0);
  }

  function update(t: number) {
    requestAnimationFrame(update);

    const depth = (Math.sin(t * 0.001) + 1.2) * 0.4;
    console.log({ depth });
    vibrato1.depth.value = depth;

    const depth2 = (Math.sin(t * 0.001 * 3) + 1) * 0.5;
    gain2.gain.value = depth2 * 0.4;
  }
});
</script>

<template>
  <div>lol</div>
</template>
