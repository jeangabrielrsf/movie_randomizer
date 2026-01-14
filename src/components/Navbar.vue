<template>
    <v-app-bar flat color="transparent" class="px-4 mt-2" scroll-behavior="hide" :elevation="0">
        <!-- Clickable Logo Area -->
        <div class="d-flex align-center cursor-pointer" @click="goHome">
            <img src="@/assets/logo.svg" alt="Movie Randomizer" height="32" width="32" class="me-2" />
            <span class="text-h6 font-weight-bold text-white d-none d-sm-block">Movie Randomizer</span>
        </div>

        <v-spacer></v-spacer>

        <div class="d-flex align-center">
            <!-- FAQ Link -->
            <v-btn to="/faq" variant="text" color="grey-lighten-1" class="me-2">
                Dúvidas
            </v-btn>

            <!-- Logout Button -->
            <v-btn v-if="store.isAuthorized" prepend-icon="mdi-logout" variant="tonal" color="error" rounded="pill"
                size="small" @click="handleLogout">
                Sair
            </v-btn>
        </div>
    </v-app-bar>
</template>

<script setup>
import { useAppStore } from '../stores/appStore';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();

function goHome() {
    router.push({ name: 'home' });
}

function handleLogout() {
    store.logout();
    router.push({ name: 'home' });
}
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
    transition: opacity 0.2s;
}

.cursor-pointer:hover {
    opacity: 0.8;
}
</style>
