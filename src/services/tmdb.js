import axios from 'axios';
import { config } from '../config';

const API_KEY = config.tmdbApiKey;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const tmdbClient = axios.create({
    baseURL: BASE_URL,
    params: {
        api_key: API_KEY,
        language: 'pt-BR', // Portuguese as per request user
    },
});

export const tmdbService = {
    async searchMedia(query) {
        if (!query) return null;
        try {
            const response = await tmdbClient.get('/search/multi', {
                params: { query },
            });
            // log removed
            // Return first relevant result usually
            const results = response.data.results.filter(
                item => item.media_type === 'movie' || item.media_type === 'tv'
            ).slice(0, 10);
            return results;
        } catch (err) {
            console.error('TMDB Search Error', err);
            return null;
        }
    },

    async getDetails(id, type) {
        try {
            const response = await tmdbClient.get(`/${type}/${id}`);
            return response.data;
        } catch (err) {
            console.error('TMDB Details Error', err);
            return null;
        }
    },

    async getWatchProviders(id, type) {
        try {
            const response = await tmdbClient.get(`/${type}/${id}/watch/providers`);
            // Return BR providers if available, or just the whole object
            const results = response.data.results;
            return results && results['BR'] ? results['BR'] : null;
        } catch (err) {
            console.error('TMDB Providers Error', err);
            return null;
        }
    },

    getImageUrl(path) {
        if (!path) return null; // Placeholder image could be returned here
        return `${IMAGE_BASE_URL}${path}`;
    }
};
