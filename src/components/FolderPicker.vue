<template>
  <v-card class="pa-6" elevation="8" style="min-width: 300px; max-width: 500px">
    <div class="d-flex align-center mb-4">
      <v-btn v-if="breadcrumbs.length > 0" icon="mdi-arrow-left" variant="text" size="small" @click="goBack"
        class="mr-2"></v-btn>
      <h2 class="text-h6 text-truncate flex-grow-1">
        {{ currentFolderName }}
      </h2>
    </div>

    <p class="text-body-2 text-grey mb-4 text-center">
      Navegue pelas pastas e selecione o arquivo da sua lista (.txt ou Google Doc).
    </p>

    <div v-if="loading" class="d-flex justify-center my-4" style="height: 200px; align-items: center;">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-list v-else style="height: 300px; overflow-y: auto" lines="one" class="bg-grey-darken-4 rounded mb-4">
      <v-list-item v-for="item in items" :key="item.id" :value="item.id" @click="handleItemClick(item)"
        :prepend-icon="item.isFolder ? 'mdi-folder' : (item.mimeType === 'text/plain' ? 'mdi-file-document-outline' : 'mdi-file-document-edit-outline')"
        rounded="0" class="mb-0 border-b border-opacity-25" :class="{ 'text-primary': !item.isFolder }">
        <v-list-item-title>{{ item.name }}</v-list-item-title>
        <template v-slot:append>
          <v-icon v-if="item.isFolder" icon="mdi-chevron-right" size="small" color="grey"></v-icon>
          <v-icon v-else icon="mdi-check-circle-outline" size="small" color="primary"></v-icon>
        </template>
      </v-list-item>

      <div v-if="items.length === 0" class="text-center pa-4 text-grey">
        Nenhuma lista ou pasta encontrada aqui.
      </div>

      <!-- Load More Button -->
      <div v-if="nextPageToken" class="pa-2">
        <v-btn variant="text" block size="small" @click="loadMore" :loading="loadingMore">Carregar Mais</v-btn>
      </div>
    </v-list>

    <!-- Create New File Option -->
    <v-btn prepend-icon="mdi-plus" variant="text" block color="secondary" @click="openCreateDialog = true">
      Criar Nova Lista Aqui
    </v-btn>

    <!-- Simple Dialog for New File Name -->
    <v-dialog v-model="openCreateDialog" max-width="400">
      <v-card title="Nova Lista">
        <v-card-text>
          <p class="mb-2 text-grey-lighten-1">Nome do arquivo:</p>
          <v-text-field v-model="newFileName" label="Ex: Meus Filmes" autofocus
            @keyup.enter="createNewFile"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="Cancelar" @click="openCreateDialog = false"></v-btn>
          <v-btn text="Criar" color="primary" @click="createNewFile" :loading="creating"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { driveService } from '../services/googleDrive';

const emit = defineEmits(['select']);

const items = ref([]); // Mixed folders and files
const loading = ref(true);
const loadingMore = ref(false);
const creating = ref(false);
const openCreateDialog = ref(false);
const newFileName = ref('Filmes e Séries');

// Navigation State
const currentFolderId = ref('root');
const breadcrumbs = ref([]); // Array of {id, name}
const nextPageToken = ref(null);

const currentFolderName = computed(() => {
  if (breadcrumbs.value.length === 0) return 'Meu Drive';
  return breadcrumbs.value[breadcrumbs.value.length - 1].name;
});

async function loadContent(parentId = 'root', pageToken = null) {
  if (!pageToken) {
    loading.value = true;
    items.value = [];
  } else {
    loadingMore.value = true;
  }

  try {
    // 1. Folders
    let fetchedFolders = [];
    if (!pageToken) {
      // Only load folders on first page load of directory (simplification)
      const folderResult = await driveService.listFolders(parentId);
      fetchedFolders = folderResult.files || [];
    }

    // 2. Files
    const fileResult = await driveService.listFiles(parentId, pageToken);
    const newFiles = fileResult.files || [];

    // Merge: Folders always on top (if first page), then files
    const newItems = [...fetchedFolders.map(f => ({ ...f, isFolder: true })), ...newFiles.map(f => ({ ...f, isFolder: false }))];

    if (!pageToken) {
      items.value = newItems;
    } else {
      items.value = [...items.value, ...newItems.map(f => ({ ...f, isFolder: false }))]; // pagination only for files in this logic?
    }

    nextPageToken.value = fileResult.nextPageToken || null; // Paging determines file paging
    currentFolderId.value = parentId;

  } catch (err) {
    console.error("Failed to load content", err);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

function loadMore() {
  if (nextPageToken.value) {
    loadContent(currentFolderId.value, nextPageToken.value);
  }
}

function handleItemClick(item) {
  if (item.isFolder) {
    breadcrumbs.value.push({ id: item.id, name: item.name });
    loadContent(item.id);
  } else {
    // Select File
    confirmSelection(item);
  }
}

function goBack() {
  if (breadcrumbs.value.length === 0) return;
  breadcrumbs.value.pop();
  const prevFolder = breadcrumbs.value.length > 0 ? breadcrumbs.value[breadcrumbs.value.length - 1].id : 'root';
  loadContent(prevFolder);
}

function confirmSelection(file) {
  emit('select', file);
}

// Create New File logic
async function createNewFile() {
  if (!newFileName.value) return;
  creating.value = true;
  try {
    const parent = currentFolderId.value === 'root' ? null : currentFolderId.value;
    const newFile = await driveService.createFile(newFileName.value, parent, '');

    openCreateDialog.value = false;
    // Select it immediately
    emit('select', { id: newFile.id, name: newFileName.value, mimeType: 'application/vnd.google-apps.document' });
  } catch (err) {
    console.error("Failed to create file", err);
  } finally {
    creating.value = false;
  }
}

onMounted(() => {
  loadContent();
});
</script>
