<template>
  <div class="countdown-container d-flex justify-center align-center">
    <div class="countdown-number text-h1 font-weight-black" :key="count" :class="{'zoom-effect': true}">
      {{ count }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  spinning: Boolean
});

const emit = defineEmits(['finished']);
const count = ref(3);

onMounted(() => {
    if (props.spinning) startCountdown();
});

watch(() => props.spinning, (val) => {
    if (val) startCountdown();
});

function startCountdown() {
    count.value = 3;
    const interval = setInterval(() => {
        count.value--;
        if (count.value === 0) {
            clearInterval(interval);
            // Small delay to show "1" briefly or directly finish?
            // User said "show randomized content AFTER 1 appears".
            // So after 1 is shown for a beat.
            // Wait 1 tick then show result? Actually let's just finish immediately or show "GO!"?
            // "Depois que o número 1 aparecer, você já mostra". 
            // So show 3.. 2.. 1.. (wait) -> Result.
            emit('finished');
        }
    }, 800); // 800ms beat
}
</script>

<style scoped>
.countdown-container {
    height: 300px; /* Occupy similar space */
    width: 100%;
}

.countdown-number {
    font-size: 8rem !important;
    background: linear-gradient(45deg, #FF512F, #DD2476);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: pulse 0.8s ease-in-out;
}

@keyframes pulse {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
}
</style>
