<template>
    <v-footer class="bg-transparent d-flex flex-column py-4" style="max-height: 100px;">
        <div class="d-flex w-100 align-center justify-center">
            <v-btn variant="text" size="small" class="mx-2 text-caption text-grey-lighten-1" to="/privacy-policy">
                Política de Privacidade
            </v-btn>
            <span class="text-grey-lighten-2">•</span>
            <v-btn variant="text" size="small" class="mx-2 text-caption text-grey-lighten-1" to="/terms-of-service">
                Termos de Uso
            </v-btn>
        </div>
        <div class="text-caption text-grey-darken-1 mt-1">
            &copy; {{ new Date().getFullYear() }} Movie Randomizer
        </div>
    </v-footer>
</template>

<style scoped>
/* Optional: Ensure footer doesn't overlap content on mobile if needed */
</style>
