<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center">

    <!-- Login State -->
    <div v-if="!store.isAuthorized" class="text-center w-100 px-4" style="max-width: 900px;">

      <div class="mb-12">
        <v-icon icon="mdi-movie-open-star" size="80" class="text-grad mb-6" />
        <h1 class="text-h5 text-sm-h4 text-md-h2 text-lg-h1 font-weight-bold mb-4 text-white">
          Chega de Escolher.<br>
          <span class="text-grad">É Hora de Assistir.</span>
        </h1>

        <h2 class="text-subtitle-1 text-sm-h5 text-md-h4 font-weight-light text-grey-lighten-1 mb-6">
          Você gasta mais tempo navegando no catálogo do que assistindo? <br class="d-none d-md-block">
          O <strong>Movie Randomizer</strong> foi criado para eliminar a indecisão.
        </h2>

        <p class="text-body-1 text-grey-lighten-2 mx-auto" style="max-width: 700px;">
          Conecte sua lista do Google Drive, clique em "Randomizar" e deixe o destino decidir sua próxima maratona.
          Redescubra sua lista de filmes e séries esquecidos sem o peso da escolha.
        </p>

        <div class="mt-6">
          <v-btn to="/faq" variant="text" color="blue-lighten-2" prepend-icon="mdi-help-circle-outline"
            class="px-4 py-2 d-flex align-center" height="auto">
            <span class="text-wrap text-center text-caption text-sm-body-1"
              style="white-space: normal !important; display: block;">
              Novo por aqui? Leia as Dúvidas e saiba como começar
            </span>
          </v-btn>
        </div>
      </div>

      <v-btn color="primary" size="x-large" prepend-icon="mdi-google" elevation="12" height="64" rounded="xl"
        class="text-body-1 font-weight-bold px-8" :loading="store.isLoading" @click="store.login()">
        Entrar com Google
      </v-btn>
      <v-alert v-if="store.error" type="error" class="mt-8 mx-auto" style="max-width: 400px;" closable>{{ store.error
      }}</v-alert>
    </div>

    <!-- Main App State -->
    <div v-else class="text-center w-100" style="max-width: 600px;">

      <!-- File Selection State -->
      <div v-if="!store.fileId">
        <FolderPicker @select="handleFileSelect" />
        <!-- Show error if any -->
        <v-alert v-if="store.error" type="error" class="mt-4" closable @click:close="store.error = null">{{ store.error
        }}</v-alert>
      </div>

      <!-- App Content (only if file selected) -->
      <div v-else>

        <!-- Error Alert -->
        <v-alert v-if="store.error" type="error" class="mb-4" closable @click:close="store.error = null">
          {{ store.error }}
          <div class="mt-2" v-if="store.error.includes('ler arquivo')">
            <v-btn size="small" variant="outlined" @click="store.setFile(null)">Escolher Outro Arquivo</v-btn>
          </div>
          <div class="mt-2" v-else>
            <v-btn size="small" variant="outlined" @click="store.loadFile()">Tentar Novamente</v-btn>
          </div>
        </v-alert>

        <!-- Roulette Section -->
        <div v-if="spinning" class="mb-8">
          <Roulette :spinning="spinning" @finished="onSpinFinished" />
        </div>

        <!-- Result Section -->
        <div v-else-if="filesLoaded && showResult && store.currentSelection">
          <MediaCard :title="store.displayTitle" :data="store.currentSelection.data"
            :alternatives="store.currentSelection.alternatives" :providers="store.currentSelection.providers"
            @rate="handleRate" @switch="handleSwitch" />
          <v-btn class="mt-6" variant="text" @click="reset">Tentar Outro</v-btn>
        </div>

        <!-- Idle/Randomize Button -->
        <div v-else>
          <div v-if="store.isLoading">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="mt-4">Carregando lista...</p>
          </div>
          <div v-else>
            <!-- State: Ready (can be empty list) -->
            <div class="d-flex align-center justify-center mb-2 flex-column">
              <h2 class="text-h4 font-weight-bold">{{ store.currentFileName || 'Sua Lista' }}</h2>
              <div class="d-flex align-center mt-2">
                <span class="text-grey mr-2">{{ store.unwatchedList.length }} títulos disponíveis</span>
                <v-btn icon="mdi-refresh" variant="text" size="small" @click="store.loadFile()"
                  :loading="store.isLoading" color="grey"></v-btn>
                <v-btn icon="mdi-folder-open-outline" variant="text" size="small" @click="store.setFile(null)"
                  color="grey" title="Trocar Arquivo"></v-btn>
              </div>
            </div>

            <v-btn color="secondary" size="x-large" class="random-btn my-8" :height="$vuetify.display.xs ? 80 : 100"
              :width="$vuetify.display.xs ? 240 : 300" rounded="pill" elevation="12" @click="startRandomize"
              :disabled="store.unwatchedList.length === 0">
              <span class="text-h5 text-sm-h4">Randomizar</span>
            </v-btn>

            <div class="d-flex justify-center">
              <v-btn prepend-icon="mdi-plus" variant="tonal" color="primary" rounded="pill" size="large"
                @click="showAddModal = true">
                Adicionar Item
              </v-btn>
            </div>

            <div v-if="store.unwatchedList.length === 0 && !store.isLoading" class="mt-4 text-grey">
              <p>Sua lista está vazia ou todos os itens foram assistidos.</p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <AddItemModal v-model="showAddModal" @added="onItemAdded" />

    <v-snackbar v-model="snackbar" color="success" location="bottom" timeout="3000">
      {{ snackbarText }}

      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar = false">
          Fechar
        </v-btn>
      </template>
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAppStore } from '../stores/appStore';
import Roulette from '../components/Roulette.vue';
import MediaCard from '../components/MediaCard.vue';
import FolderPicker from '../components/FolderPicker.vue'; // Acts as FilePicker now
import AddItemModal from '../components/AddItemModal.vue';

const store = useAppStore();
const spinning = ref(false);
const showResult = ref(false);
const showAddModal = ref(false);
const snackbar = ref(false);
const snackbarText = ref('');

const filesLoaded = computed(() => store.parsedList.length >= 0); // Always show if context isn't loading

function onItemAdded(item) {
  const title = item.title || item.name;
  snackbarText.value = `"${title}" adicionado à lista com sucesso!`;
  snackbar.value = true;
}

function handleFileSelect(file) {
  store.setFile(file);
}

async function startRandomize() {
  if (store.unwatchedList.length === 0) return;

  // Start logic
  showResult.value = false;
  spinning.value = false; // Ensure spinning is reset

  // Trigger store randomize to get the target
  await store.randomize();

  if (store.currentSelection) {
    spinning.value = true;
  }
}

function onSpinFinished() {
  spinning.value = false;
  showResult.value = true;
}

function handleRate(type) {
  store.rateSelection(type);
  showResult.value = false; // Go back to main
}

function handleSwitch(item) {
  store.switchSelection(item);
}

function reset() {
  showResult.value = false;
  store.currentSelection = null;
}
</script>

<style scoped>
.text-grad {
  background: linear-gradient(45deg, #ff00cc, #3333ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.random-btn {
  background: linear-gradient(45deg, #FF512F 0%, #DD2476 51%, #FF512F 100%);
  transition: 0.5s;
  background-size: 200% auto;
}

.random-btn:hover {
  background-position: right center;
  transform: scale(1.05);
}
</style>
