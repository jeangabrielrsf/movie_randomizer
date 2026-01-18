import { defineStore } from 'pinia';
import { driveService } from '../services/googleDrive';
import { tmdbService } from '../services/tmdb';

export const useAppStore = defineStore('app', {
    state: () => ({
        isAuthorized: false,
        isLoading: false,
        folderId: null,
        fileId: null,
        fileMimeType: null, // New
        currentFileName: null, // New
        fileContent: '',
        parsedList: [],
        currentSelection: null,
        error: null,
    }),

    getters: {
        unwatchedList: (state) => state.parsedList.filter(item => !item.watched),
        canRandomize: (state) => state.isAuthorized && state.fileId && state.unwatchedList.length > 0, // Changed check
        isFolderSelected: (state) => !!state.folderId,
        displayTitle: (state) => {
            if (!state.currentSelection || !state.currentSelection.title) return '';
            return state.currentSelection.title.replace(/\s+\[(FILME|SÉRIE|TV)\]\s*$/i, '');
        },
    },

    actions: {
        async initializeFunctions() {
            try {
                await driveService.initClient();
                // Attempt to restore session
                if (driveService.restoreSession()) {
                    console.log("Session restored from storage");
                    this.isAuthorized = true;
                    // Restore state logic that usually happens in login
                    const storedFolder = localStorage.getItem('movie_randomizer_folder_id');
                    const storedFile = localStorage.getItem('movie_randomizer_file_id');
                    if (storedFolder) {
                        this.folderId = storedFolder;
                        if (storedFile) {
                            this.fileId = storedFile;
                            this.currentFileName = localStorage.getItem('movie_randomizer_file_name');
                            this.fileMimeType = localStorage.getItem('movie_randomizer_file_mime');
                            // Load file content in background
                            this.loadFile();
                        }
                    }
                }
            } catch (err) {
                console.error("Init Error", err);
            }
        },

        async mockLogin() {
            console.log("Mock Mode Activated");
            this.isLoading = true;
            this.isAuthorized = true;

            // Mock dummy folder and file
            this.folderId = 'mock-folder-id';
            this.fileId = 'mock-file-id';
            this.fileMimeType = 'application/vnd.google-apps.document';
            this.currentFileName = 'Lista Mockada';

            // Initial mock content
            const mockContent = `
Inception
The Matrix (1999) [FILME]
Breaking Bad [SÉRIE]
Interstellar
            `;
            this.fileContent = mockContent.trim();
            this.parseContent(this.fileContent);

            this.isLoading = false;
        },

        async login() {
            try {
                this.isLoading = true;

                // Check if we are in mock mode from URL query param
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('mock') === 'true') {
                    await this.mockLogin();
                    return;
                }

                if (!driveService.gisInited) await driveService.initClient();

                await driveService.handleAuthClick();
                this.isAuthorized = true;

                // Check localStorage for previous session?
                // For now, let's force re-selection or just restore folder but not file auto-magic
                const storedFolder = localStorage.getItem('movie_randomizer_folder_id');
                const storedFile = localStorage.getItem('movie_randomizer_file_id');

                if (storedFolder) {
                    this.folderId = storedFolder;
                    // If we have a file, try to load it
                    if (storedFile) {
                        // We need the ID, but maybe we should verify it exists?
                        // Let's rely on the user re-selecting if it fails, or try load.
                        this.fileId = storedFile;
                        this.currentFileName = localStorage.getItem('movie_randomizer_file_name');
                        this.fileMimeType = localStorage.getItem('movie_randomizer_file_mime');
                        await this.loadFile();
                    }
                }
                this.isLoading = false;
            } catch (err) {
                console.error("Login Error", err);
                this.error = "Falha no login Google.";
                this.isLoading = false;
            }
        },

        async selectFolder(folder) {
            this.folderId = folder.id;
            localStorage.setItem('movie_randomizer_folder_id', folder.id);
            // Reset file when changing folder
            this.setFile(null);
        },

        async setFile(file) {
            if (!file) {
                this.fileId = null;
                this.fileMimeType = null;
                this.currentFileName = null;
                localStorage.removeItem('movie_randomizer_file_id');
                return;
            }
            this.fileId = file.id;
            this.currentFileName = file.name;
            this.fileMimeType = file.mimeType;

            localStorage.setItem('movie_randomizer_file_id', file.id);
            localStorage.setItem('movie_randomizer_file_name', file.name);
            localStorage.setItem('movie_randomizer_file_mime', file.mimeType);

            await this.loadFile();
        },

        async loadFile() {
            if (!this.fileId) return;

            try {
                this.isLoading = true;
                const content = await driveService.readFileContent(this.fileId);
                this.fileContent = content;
                this.parseContent(content);
            } catch (err) {
                console.error("Load File Error", err);
                this.error = "Erro ao ler arquivo. Selecione outro.";
                this.setFile(null); // Reset
            } finally {
                this.isLoading = false;
            }
        },

        // createNewList replaced by UI logic calling driveService.createFile then setFile

        parseContent(content) {
            if (!content) {
                this.parsedList = [];
                return;
            }
            const lines = content.split(/\r?\n/);
            this.parsedList = lines.map(line => {
                const text = line.trim();
                if (!text) return null;

                const watchedRegex = /\[(WATCHED|ASSISTIDO).*\]/;
                const isWatched = watchedRegex.test(text);
                let title = text.replace(watchedRegex, '').trim();

                return {
                    originalLine: line,
                    title: title,
                    watched: isWatched,
                    cleanedLine: text
                };
            }).filter(Boolean);
        },

        async addItem(mediaItem) {
            if (!this.fileId) return;
            this.isLoading = true;
            try {
                // Format: Title (Year) [TYPE]
                const title = mediaItem.title || mediaItem.name;
                const releaseDate = mediaItem.release_date || mediaItem.first_air_date;
                const year = releaseDate ? releaseDate.split('-')[0] : '';
                const type = mediaItem.media_type === 'movie' ? 'FILME' : 'SÉRIE';

                let line = title;
                if (year) line += ` (${year})`;
                line += ` [${type}]`;

                if (this.fileId === 'mock-file-id') {
                    // Mock add
                    console.log("Mock Adding Item:", line);
                    // Append to local list
                    const newLine = {
                        originalLine: line,
                        title: title,
                        cleanedLine: line,
                        watched: false
                    };
                    this.parsedList.push(newLine);
                    return;
                }

                await driveService.appendToFile(this.fileId, this.fileMimeType, line);

                // Update local state by re-reading or just appending
                // Re-reading is safer for sync
                await this.loadFile();

            } catch (err) {
                console.error("Add Item Error", err);
                this.error = "Erro ao adicionar item.";
            } finally {
                this.isLoading = false;
            }
        },

        async randomize() {
            const candidates = this.unwatchedList;
            if (candidates.length === 0) return;

            this.isLoading = true;
            try {
                const array = new Uint32Array(1);
                window.crypto.getRandomValues(array);
                const randomIndex = array[0] % candidates.length;
                const selectedItem = candidates[randomIndex];

                // Parse Title
                // Expects: "Title (Year) [TYPE]" or just "Title"
                const fullTitle = selectedItem.title;

                // Regex to capture parts
                // 1: Name, 2: Year (optional), 3: Type (optional)
                const titleRegex = /^(.*?)(?:\s+\((\d{4})\))?(?:\s+\[(FILME|SÉRIE|TV)\])?$/i;
                const match = fullTitle.match(titleRegex);

                let cleanTitle = fullTitle;
                let year = null;
                let type = null;

                if (match) {
                    cleanTitle = match[1].trim();
                    year = match[2] ? match[2] : null;
                    const typeStr = match[3] ? match[3].toUpperCase() : null;
                    if (typeStr) {
                        if (typeStr === 'FILME') type = 'movie';
                        else if (typeStr === 'SÉRIE' || typeStr === 'TV') type = 'tv';
                    }
                }

                // Log removed

                // Fetch TMDB data using clean title
                const searchResults = await tmdbService.searchMedia(cleanTitle);

                let selectedMedia = null;
                let details = null;
                const alternatives = searchResults || [];

                // Logic to find best match
                if (alternatives && alternatives.length > 0) {
                    // Filter by Type
                    let filtered = alternatives;
                    if (type) {
                        filtered = filtered.filter(item => item.media_type === type);
                    }

                    // Filter by Year (if applicable)
                    if (year && filtered.length > 0) {
                        // Find exact year match
                        const yearMatches = filtered.filter(item => {
                            const date = item.release_date || item.first_air_date;
                            return date && date.startsWith(year);
                        });

                        if (yearMatches.length > 0) {
                            selectedMedia = yearMatches[0]; // Best match
                        } else {
                            selectedMedia = filtered[0]; // Fallback to first correct type
                        }
                    } else {
                        // No year or no match, take first
                        selectedMedia = filtered.length > 0 ? filtered[0] : alternatives[0];
                    }

                    if (selectedMedia) {
                        details = await tmdbService.getDetails(selectedMedia.id, selectedMedia.media_type);
                    }
                }

                // Fetch providers
                const mediaForProviders = selectedMedia || ((searchResults && searchResults.length > 0) ? searchResults[0] : null);
                let providers = null;
                if (mediaForProviders) {
                    providers = await tmdbService.getWatchProviders(mediaForProviders.id, mediaForProviders.media_type);
                }

                this.currentSelection = {
                    title: selectedItem.title, // Keep original file title for display/sync
                    data: details || selectedMedia,
                    originalItem: selectedItem,
                    alternatives: alternatives,
                    providers: providers
                };
            } catch (err) {
                console.error("Randomize Error", err);
            } finally {
                this.isLoading = false;
            }
        },

        async switchSelection(mediaItem) {
            if (!this.currentSelection) return;

            this.isLoading = true;
            try {
                const details = await tmdbService.getDetails(mediaItem.id, mediaItem.media_type);
                const providers = await tmdbService.getWatchProviders(mediaItem.id, mediaItem.media_type);

                // Update data and providers
                this.currentSelection.data = details || mediaItem;
                this.currentSelection.providers = providers;

                // FIX: Update the title to match the selected alternative AND update the file immediately
                // Movies use 'title', TV shows use 'name'
                const newTitle = mediaItem.title || mediaItem.name;
                const releaseDate = mediaItem.release_date || mediaItem.first_air_date;
                const year = releaseDate ? releaseDate.split('-')[0] : '';
                const type = mediaItem.media_type === 'movie' ? 'FILME' : 'SÉRIE';

                // Format: Title (Year) [TYPE]
                // Example: Breaking Bad (2008) [SÉRIE]
                let newLineText = newTitle;
                if (year) newLineText += ` (${year})`;
                newLineText += ` [${type}]`;

                if (newTitle) {
                    // Update file immediately
                    await driveService.updateDocContent(
                        this.fileId,
                        this.currentSelection.originalItem.cleanedLine,
                        newLineText
                    );

                    // Update local state
                    this.currentSelection.title = newLineText; // Display the full info as title? Or just partial?
                    // User said: "o nome do conteúdo na lista deve mudar, para ser compatível com as informações do imdb"
                    // And "disponibiliza suas informações na tela"

                    // Let's update the originalItem so further actions use the new valid text
                    this.currentSelection.originalItem.title = newLineText;
                    const oldLine = this.currentSelection.originalItem.cleanedLine;
                    this.currentSelection.originalItem.cleanedLine = newLineText;

                    // Update in parsedList to keep sync
                    const index = this.parsedList.findIndex(p => p.cleanedLine === oldLine);
                    if (index !== -1) {
                        this.parsedList[index].title = newLineText;
                        this.parsedList[index].cleanedLine = newLineText;
                    }
                }

            } catch (err) {
                console.error("Switch Error", err);
                this.error = "Erro ao atualizar conteúdo: " + err.message;
            } finally {
                this.isLoading = false;
            }
        },

        async rateSelection(ratingType) {
            // ratingType: 'positive', 'negative', 'heart'
            if (!this.currentSelection || !this.fileId) return;

            this.isLoading = true;
            try {
                const item = this.currentSelection.originalItem;
                // map rating to text
                let tag = '';
                switch (ratingType) {
                    case 'positive': tag = '[ASSISTIDO: BOM]'; break;
                    case 'negative': tag = '[ASSISTIDO: RUIM]'; break;
                    case 'heart': tag = '[ASSISTIDO: AMEI]'; break;
                    default: tag = '[ASSISTIDO]';
                }

                const newLine = `${item.title} ${tag}`;

                // Send to Drive using Docs API (find and replace)
                // We assume originalLine matches what is in the doc.
                // Note: originalLine includes the newline char potentially if we split by \n.
                // Text replacement in Docs API finds the string. 
                // We should search for the clean title or original line content.
                // item.cleanedLine is just the text, avoiding regex issues if possible.
                // But wait, if we used export, we have text. 
                // Let's replace the exact text we read.

                await driveService.updateDocContent(this.fileId, item.cleanedLine, newLine);

                // Update local list logic
                const index = this.parsedList.findIndex(p => p === item);
                if (index !== -1) {
                    this.parsedList[index].watched = true;
                    this.parsedList[index].cleanedLine = newLine;
                }

                this.currentSelection = null; // Clear selection after rating

            } catch (err) {
                console.error("Rate Error", err);
                this.error = err.message || "Erro ao salvar avaliação.";
            } finally {
                this.isLoading = false;
            }
        },

        logout() {
            this.isAuthorized = false;
            this.folderId = null;
            this.parsedList = [];
            this.fileId = null;
            this.fileMimeType = null;
            this.currentFileName = null;
            this.currentSelection = null;
            this.error = null;
            localStorage.removeItem('movie_randomizer_folder_id');
            localStorage.removeItem('movie_randomizer_file_id');
            localStorage.removeItem('movie_randomizer_file_name');
            localStorage.removeItem('movie_randomizer_file_mime');
            localStorage.removeItem('gdrive_session');
        }
    }
});
