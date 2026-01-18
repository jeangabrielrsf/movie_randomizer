<template>
    <v-dialog v-model="dialog" max-width="800" scrollable>
        <v-card class="bg-deep-purple-darken-4">
            <v-card-title class="pa-4 text-h5 font-weight-bold">
                Adicionar à Lista
            </v-card-title>

            <v-card-text style="height: 600px;">
                <!-- Search Input -->
                <v-text-field v-model="searchQuery" label="Buscar Filme ou Série" prepend-inner-icon="mdi-magnify"
                    variant="outlined" @update:model-value="debouncedSearch" :loading="loading" clearable
                    autofocus></v-text-field>

                <!-- Results List -->
                <div v-if="results.length > 0" class="mt-4">
                    <v-row>
                        <v-col v-for="item in results" :key="item.id" cols="12" sm="6">
                            <v-card @click="selectItem(item)" hover class="fill-height pb-2" color="#1e1e2e">
                                <div class="d-flex flex-no-wrap">
                                    <v-avatar class="ma-3" size="100" rounded="0">
                                        <v-img :src="getImage(item.poster_path)" cover></v-img>
                                    </v-avatar>
                                    <div class="d-flex flex-column flex-grow-1">
                                        <div class="d-flex justify-space-between align-start">
                                            <div>
                                                <v-card-title class="text-subtitle-1 text-wrap pt-3">
                                                    {{ item.title || item.name }}
                                                </v-card-title>
                                                <v-card-subtitle>
                                                    {{ getYear(item) }} • {{ getType(item) }}
                                                </v-card-subtitle>
                                            </div>
                                            <v-btn icon="mdi-plus" variant="text" color="primary" class="ma-2"
                                                @click.stop="quickAdd(item)" :loading="isItemAdding(item.id)"></v-btn>
                                        </div>
                                        <v-card-text class="text-caption text-grey py-1 line-clamp-3">
                                            {{ item.overview }}
                                        </v-card-text>
                                    </div>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>

                <div v-else-if="searchQuery && !loading" class="text-center mt-8 text-grey">
                    Nenhum resultado encontrado.
                </div>
            </v-card-text>

            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="close">Fechar</v-btn>
            </v-card-actions>
        </v-card>

        <!-- Detailed Confirmation Dialog -->
        <v-dialog v-model="confirmDialog" fullscreen transition="dialog-bottom-transition">
            <v-card v-if="selectedItem" class="bg-black">
                <v-toolbar color="transparent" density="compact">
                    <v-btn icon="mdi-close" @click="confirmDialog = false"></v-btn>
                    <v-toolbar-title class="text-body-1 font-weight-bold d-none d-sm-flex">Confirmar
                        Adição</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="confirmDialog = false">Cancelar</v-btn>
                    <v-btn color="primary" variant="flat" class="ml-2" @click="confirmAdd" :loading="adding">Adicionar à
                        Lista</v-btn>
                </v-toolbar>

                <div class="d-flex flex-column align-center justify-center pa-6" style="height: 100%;">
                    <v-row class="w-100" style="max-width: 1000px;" justify="center" align="center">
                        <v-col cols="12" md="5" class="d-flex justify-center">
                            <v-img :src="getImage(selectedItem.poster_path, 'w500')" max-width="400" rounded="lg"
                                elevation="12" cover></v-img>
                        </v-col>
                        <v-col cols="12" md="7">
                            <div class="pa-4">
                                <div class="text-overline mb-2 text-primary font-weight-bold">{{
                                    getType(selectedItem).toUpperCase() }} • {{ getYear(selectedItem) }}</div>
                                <h1 class="text-h4 text-md-h3 font-weight-bold mb-4">{{ selectedItem.title ||
                                    selectedItem.name }}
                                </h1>

                                <v-rating :model-value="selectedItem.vote_average / 2" color="amber" density="compact"
                                    half-increments readonly size="small" class="mb-4"></v-rating>

                                <p class="text-body-1 text-md-h6 text-grey-lighten-1 mb-6 font-weight-light"
                                    style="line-height: 1.6;">
                                    {{ selectedItem.overview || 'Sinopse não disponível.' }}
                                </p>

                                <div class="d-flex flex-column flex-sm-row gap-4 align-stretch align-sm-center">
                                    <v-btn size="x-large" color="primary" rounded="pill" prepend-icon="mdi-plus"
                                        @click="confirmAdd" :loading="adding"
                                        :width="$vuetify.display.xs ? '100%' : '200'">
                                        Adicionar
                                    </v-btn>
                                    <v-btn size="x-large" variant="outlined" rounded="pill" color="grey"
                                        @click="confirmDialog = false" :width="$vuetify.display.xs ? '100%' : 'auto'">
                                        Cancelar
                                    </v-btn>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </div>
            </v-card>
        </v-dialog>
    </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { tmdbService } from '../services/tmdb';
import { useAppStore } from '../stores/appStore';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const store = useAppStore();
const dialog = ref(false);
const confirmDialog = ref(false);
const searchQuery = ref('');
const results = ref([]);
const loading = ref(false);
const adding = ref(false);
const addingItems = ref({}); // Map of id -> boolean
const selectedItem = ref(null);

let debounceTimeout = null;

watch(() => props.modelValue, (val) => {
    dialog.value = val;
});

watch(dialog, (val) => {
    emit('update:modelValue', val);
    if (!val) {
        // Reset check
        searchQuery.value = '';
        results.value = [];
    }
});

function debouncedSearch(val) {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    if (!val || val.length < 3) {
        results.value = [];
        return;
    }

    loading.value = true;
    debounceTimeout = setTimeout(async () => {
        try {
            const res = await tmdbService.searchMedia(val);
            results.value = res || [];
        } catch (e) {
            console.error(e);
        } finally {
            loading.value = false;
        }
    }, 500);
}

function getImage(path, size = 'w200') {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://via.placeholder.com/200x300?text=No+Image';
}

function getYear(item) {
    const date = item.release_date || item.first_air_date;
    return date ? date.split('-')[0] : 'N/A';
}

function getType(item) {
    return item.media_type === 'movie' ? 'Filme' : 'Série';
}

function selectItem(item) {
    selectedItem.value = item;
    confirmDialog.value = true;
}

async function confirmAdd() {
    if (!selectedItem.value) return;
    adding.value = true;

    await store.addItem(selectedItem.value);

    adding.value = false;
    confirmDialog.value = false;

    if (!store.error) {
        // Emit success event
        emit('added', selectedItem.value);
        // Reset search to allow clean slate? Or keep it?
        // User might want to click another one.
        // Let's keep it.
    }
}


function isItemAdding(id) {
    return !!addingItems.value[id];
}

async function quickAdd(item) {
    if (addingItems.value[item.id]) return;

    addingItems.value[item.id] = true;
    try {
        await store.addItem(item);
        if (!store.error) {
            emit('added', item);
            // Optional: Show success snackbar or icon change?
            // For now, let's keep it simple or maybe change icon to checkmark?
            // But item stays in list.
        }
    } catch (e) {
        console.error(e);
    } finally {
        addingItems.value[item.id] = false;
    }
}

function close() {
    dialog.value = false;
}
</script>

<style scoped>
.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
