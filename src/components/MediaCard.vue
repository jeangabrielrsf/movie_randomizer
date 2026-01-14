<template>
  <v-card class="media-card mx-auto" :max-width="$vuetify.display.xs ? '100%' : 450" width="100%" elevation="10"
    rounded="xl">
    <!-- Header with Title specific from User List -->
    <v-card-title class="text-h6 font-weight-bold pt-4 px-4 text-center text-wrap highlight-title">
      {{ title }}
    </v-card-title>

    <!-- Poster Area - Reduced Height -->
    <v-img :src="posterUrl" height="350" class="align-end mt-2 bg-black">
      <div class="fill-height d-flex align-end gradient-overlay">
        <!-- Optional Overlay Info if needed -->
      </div>
      <template v-slot:placeholder>
        <div class="d-flex align-center justify-center fill-height bg-grey-darken-4">
          <v-icon icon="mdi-movie-open" size="64" class="text-grey"></v-icon>
        </div>
      </template>
    </v-img>

    <v-card-text class="pt-4 pb-0">
      <!-- Wrong Movie Button -->
      <div class="text-center mb-2">
        <v-btn v-if="alternatives && alternatives.length > 1" variant="text" size="x-small" color="orange-accent-2"
          prepend-icon="mdi-alert-circle-outline" @click="showAlternatives = true">
          Não é esse filme/série?
        </v-btn>
      </div>

      <!-- Rating & Info -->
      <div class="d-flex align-center justify-center mb-2">
        <v-rating :model-value="rating" color="amber" density="compact" half-increments readonly
          size="small"></v-rating>
        <div class="text-grey ms-2 text-caption">{{ rating ? rating.toFixed(1) : 'N/A' }}</div>
        <v-divider vertical class="mx-2"></v-divider>
        <span class="text-caption text-grey">{{ year }}</span>
      </div>

      <!-- Overview (Collapsible) -->
      <div class="mb-2 text-center" @click="expandOverview = !expandOverview" style="cursor: pointer;">
        <div class="text-body-2" :class="{ 'text-truncate': !expandOverview }" style="max-height: 80px; overflow-y: auto;"
          v-if="expandOverview">
          {{ overview || 'Sinopse não disponível.' }}
        </div>
        <div class="text-body-2 text-truncate" v-else>
          {{ overview || 'Sinopse não disponível.' }}
        </div>
        <v-icon :icon="expandOverview ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="small" class="text-grey"></v-icon>
      </div>

      <!-- Watch Providers -->
      <div v-if="providers && (providers.flatrate || providers.rent || providers.buy)" class="mb-4">
        <p class="text-caption text-center text-grey mb-1">Onde Assistir</p>
        <div class="d-flex justify-center flex-wrap gap-2">
          <v-tooltip location="top" v-for="prov in (providers.flatrate || []).slice(0, 3)" :key="prov.provider_id"
            :text="prov.provider_name">
            <template v-slot:activator="{ props }">
              <v-avatar size="32" class="ma-1" v-bind="props" rounded="0">
                <v-img :src="getImage(prov.logo_path)"></v-img>
              </v-avatar>
            </template>
          </v-tooltip>
        </div>
      </div>

      <div class="text-center">
        <v-chip v-if="genres" size="x-small" variant="outlined">{{ genres }}</v-chip>
      </div>
    </v-card-text>

    <v-divider class="mt-2"></v-divider>

    <v-card-actions class="justify-space-evenly pa-2">
      <v-btn icon="mdi-thumb-down" color="red-lighten-1" variant="tonal" size="small"
        @click="$emit('rate', 'negative')"></v-btn>
      <v-btn icon="mdi-heart" color="pink-accent-3" variant="flat" size="large" elevation="4"
        @click="$emit('rate', 'heart')"></v-btn>
      <v-btn icon="mdi-thumb-up" color="green-lighten-1" variant="tonal" size="small"
        @click="$emit('rate', 'positive')"></v-btn>
    </v-card-actions>

    <!-- Alternatives Dialog -->
    <v-dialog v-model="showAlternatives" max-width="500">
      <v-card>
        <v-card-title>Selecionar Correto</v-card-title>
        <v-card-text style="max-height: 400px; overflow-y: auto;">
          <v-list lines="two">
            <v-list-item v-for="item in alternatives" :key="item.id" :title="item.title || item.name"
              :subtitle="getYear(item)" :prepend-avatar="getImage(item.poster_path)" @click="selectAlternative(item)">
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="Cancelar" @click="showAlternatives = false"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue';
import { tmdbService } from '../services/tmdb';

const props = defineProps({
  title: String,
  data: Object,
  alternatives: Array,
  providers: Object
});

const emit = defineEmits(['rate', 'switch']);

const showAlternatives = ref(false);
const expandOverview = ref(false);

const posterUrl = computed(() => props.data?.poster_path ? tmdbService.getImageUrl(props.data.poster_path) : null);

const overview = computed(() => props.data?.overview);
const rating = computed(() => props.data?.vote_average ? props.data.vote_average / 2 : 0);
const year = computed(() => getYear(props.data));
const genres = computed(() => {
  if (props.data?.genres) return props.data.genres.map(g => g.name).slice(0, 2).join(', ');
  return '';
});

function getYear(item) {
  const date = item?.release_date || item?.first_air_date;
  return date ? date.split('-')[0] : '';
}

function getImage(path) {
  return path ? tmdbService.getImageUrl(path) : null;
}

function selectAlternative(item) {
  emit('switch', item);
  showAlternatives.value = false;
}
</script>

<style scoped>
.gradient-overlay {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 50%);
}

.highlight-title {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  color: #ffd700;
  /* Gold */
  line-height: 1.2 !important;
}
</style>
