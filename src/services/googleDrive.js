import { config } from '../config';

const CLIENT_ID = config.googleClientId;
const API_KEY = config.googleApiKey;
const DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
];
const SCOPES = 'https://www.googleapis.com/auth/drive';

let tokenClient;
let gapiInited = false;
let gisInited = false;

export const driveService = {
    isAuthorized: false,

    loadGapiInside() {
        return new Promise((resolve) => {
            // Check if gapi is already loaded
            if (typeof gapi !== 'undefined') {
                resolve();
                return;
            }
            // Load gapi script
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => resolve();
            document.body.appendChild(script);
        });
    },

    loadGisInside() {
        return new Promise((resolve) => {
            if (typeof google !== 'undefined' && google.accounts) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = () => resolve();
            document.body.appendChild(script);
        });
    },

    async initClient() {
        await Promise.all([this.loadGapiInside(), this.loadGisInside()]);

        return new Promise((resolve, reject) => {
            if (API_KEY && API_KEY.startsWith('GOCSPX')) {
                console.error("ERRO CRÍTICO: Você colocou o Client Secret (começa com GOCSPX) no lugar da API Key. A API Key geralmente começa com 'AIza'.");
                reject("Configuração Inválida: Verifique o console. Você está usando o Client Secret no lugar da API Key.");
                return;
            }
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: API_KEY,
                        discoveryDocs: DISCOVERY_DOCS,
                    });
                    gapiInited = true;

                    tokenClient = google.accounts.oauth2.initTokenClient({
                        client_id: CLIENT_ID,
                        scope: SCOPES,
                        callback: (resp) => {
                            if (resp.error !== undefined) {
                                throw (resp);
                            }
                            this.isAuthorized = true;
                        },
                    });
                    gisInited = true;
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    },

    handleAuthClick() {
        return new Promise((resolve, reject) => {
            if (!tokenClient) reject("Token Client not initialized");

            // Override callback for this specific request if needed, or rely on the init one.
            // But initTokenClient callback is global. 
            // Better: requestAccessToken({prompt: ''}) wraps it.

            // We can wrap the callback logic.
            tokenClient.callback = (resp) => {
                if (resp.error) {
                    reject(resp);
                } else {
                    this.isAuthorized = true;
                    resolve(resp);
                }
            };

            if (gapi.client.getToken() === null) {
                tokenClient.requestAccessToken({ prompt: 'consent' });
            } else {
                tokenClient.requestAccessToken({ prompt: '' });
            }
        });
    },

    async findFile(filename = 'lista-filmes-series', folderId) {
        if (!this.isAuthorized) throw new Error("Not authorized");
        try {
            // Use provided folderId or fallback (though we should enforce folderId now)
            let query = `name = '${filename}' and mimeType != 'application/vnd.google-apps.folder' and trashed = false`;

            if (folderId) {
                query += ` and '${folderId}' in parents`;
            }

            const response = await gapi.client.drive.files.list({
                'pageSize': 10,
                'fields': "nextPageToken, files(id, name, mimeType)",
                'q': query
            });
            const files = response.result.files;
            if (files && files.length > 0) {
                return files[0];
            } else {
                return null;
            }
        } catch (err) {
            console.error("Error finding file", err);
            throw err;
        }
    },

    async listFolders(parentId = 'root', pageToken = null) {
        if (!this.isAuthorized) throw new Error("Not authorized");
        try {
            // Adjust query to look in specific parent
            const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

            const response = await gapi.client.drive.files.list({
                'pageSize': 100, // Increased limit
                'pageToken': pageToken, // Support pagination
                'fields': "nextPageToken, files(id, name)",
                'q': query,
                'orderBy': 'name'
            });
            return response.result; // Return full result including nextPageToken
        } catch (err) {
            console.error("Error listing folders", err);
            throw err;
        }
    },

    async createFolder(folderName, parentId) {
        if (!this.isAuthorized) throw new Error("Not authorized");
        try {
            const fileMetadata = {
                'name': folderName,
                'mimeType': 'application/vnd.google-apps.folder'
            };

            if (parentId) {
                fileMetadata.parents = [parentId];
            }

            const response = await gapi.client.drive.files.create({
                resource: fileMetadata,
                fields: 'id, name' // Request name too for UI
            });
            return response.result;
        } catch (err) {
            console.error("Error creating folder", err);
            throw err;
        }
    },

    async createFile(filename, folderId, content = '') {
        if (!this.isAuthorized) throw new Error("Not authorized");
        try {
            // 1. Create the file metadata
            const fileMetadata = {
                'name': filename,
                'mimeType': 'application/vnd.google-apps.document', // Google Doc
                'parents': [folderId]
            };

            // 2. Create the file (initially empty)
            const response = await gapi.client.drive.files.create({
                resource: fileMetadata,
                fields: 'id'
            });

            const newFileId = response.result.id;

            // 3. Insert content if provided (using updateDocContent logic)
            if (content) {
                await gapi.client.request({
                    path: `https://docs.googleapis.com/v1/documents/${newFileId}:batchUpdate`,
                    method: 'POST',
                    body: {
                        requests: [{
                            insertText: {
                                location: {
                                    index: 1
                                },
                                text: content
                            }
                        }]
                    }
                });
            }

            return response.result;

        } catch (err) {
            console.error("Error creating file", err);
            throw err;
        }
    },

    async readFileContent(fileId) {
        if (!this.isAuthorized) throw new Error("Not authorized");
        try {
            const response = await gapi.client.drive.files.export({
                fileId: fileId,
                mimeType: 'text/plain'
            });
            return response.body;
        } catch (err) {
            console.error("Error reading file", err);
            throw err;
        }
    },

    async listFiles(folderId, pageToken = null) {
        if (!this.isAuthorized) throw new Error("Not authorized");
        try {
            // mimeType for Docs and Plain Text
            const query = `'${folderId}' in parents and (mimeType = 'application/vnd.google-apps.document' or mimeType = 'text/plain') and trashed = false`;

            const response = await gapi.client.drive.files.list({
                'pageSize': 20,
                'pageToken': pageToken,
                'fields': "nextPageToken, files(id, name, mimeType)",
                'q': query,
                'orderBy': 'name' // folder, name might be better but mixing folders/files is complex
            });
            return response.result;
        } catch (err) {
            console.error("Error listing files", err);
            throw err;
        }
    },

    async updateDocContent(fileId, originalLine, newLine) {
        if (!this.isAuthorized) throw new Error("Not authorized");
        try {
            await gapi.client.request({
                path: `https://docs.googleapis.com/v1/documents/${fileId}:batchUpdate`,
                method: 'POST',
                body: {
                    requests: [{
                        replaceAllText: {
                            containsText: {
                                text: originalLine,
                                matchCase: true
                            },
                            replaceText: newLine
                        }
                    }]
                }
            });
        } catch (err) {
            console.error("Error updating Doc", err);
            if (err.status === 403) {
                const body = err.body ? JSON.parse(err.body) : null;
                if (body && body.error && body.error.message && body.error.message.includes('enable')) {
                    throw new Error("A API do Google Docs não está ativada. Ative-a no Google Cloud Console.");
                }
            }
            // Fallback for non-Docs (text/plain) - Naive Text Replacement
            // Note: This function signature suggests replacement, which is hard on raw text without downloading first.
            // We assume this is only called for Rating/Switching on known content.
            // For text files, we might need a different approach if the API call fails because it's not a google doc.
            if (err.status === 400 || (err.result && err.result.error && err.result.error.code === 400)) {
                // Likely not a Google Doc
                // log removed
                await this.updateTextFileHack(fileId, originalLine, newLine);
                return;
            }
            throw err;
        }
    },

    async updateTextFileHack(fileId, original, replacement) {
        // 1. Read content
        const content = await this.readFileContent(fileId);
        // 2. Replace
        const newContent = content.replace(original, replacement);
        // 3. Upload
        await this.uploadFileContent(fileId, newContent);
    },

    async uploadFileContent(fileId, content) {
        // Multipart upload to update file content
        const metadata = {
            mimeType: 'text/plain'
        };
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: text/plain\r\n\r\n' +
            content +
            close_delim;

        await gapi.client.request({
            path: `/upload/drive/v3/files/${fileId}`,
            method: 'PATCH',
            params: { uploadType: 'multipart' },
            headers: {
                'Content-Type': 'multipart/related; boundary="' + boundary + '"'
            },
            body: multipartRequestBody
        });
    },

    async appendToFile(fileId, mimeType, text) {
        if (!this.isAuthorized) throw new Error("Not authorized");
        const newLineText = `\n${text}`;

        if (mimeType === 'application/vnd.google-apps.document') {
            await gapi.client.request({
                path: `https://docs.googleapis.com/v1/documents/${fileId}:batchUpdate`,
                method: 'POST',
                body: {
                    requests: [{
                        insertText: {
                            endOfSegmentLocation: {
                                segmentId: "" // Body
                            },
                            text: newLineText
                        }
                    }]
                }
            });
        } else {
            // Text file append
            let content = await this.readFileContent(fileId);
            content += newLineText;
            await this.uploadFileContent(fileId, content);
        }
    },

    async updateFileContent(fileId, newContent) {
        await this.uploadFileContent(fileId, newContent);
    }
};
