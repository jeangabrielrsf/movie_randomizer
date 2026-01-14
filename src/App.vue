<template>
  <SpeedInsights />
  <v-app>
    <Navbar />
    <v-main class="d-flex align-center justify-center fill-height bg-deep-purple-darken-4">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAppStore } from './stores/appStore';
import { SpeedInsights } from "@vercel/speed-insights/vue"
import Navbar from './components/Navbar.vue';

const store = useAppStore();

onMounted(() => {
  store.initializeFunctions();
});
</script>

<style>
/* Global Premium Styles */
.v-application {
  font-family: 'Outfit', sans-serif !important;
}

/* Background gradient */
.bg-deep-purple-darken-4 {
  background: linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%) !important;
}
</style>
