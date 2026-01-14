import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/faq',
            name: 'faq',
            component: () => import('../views/FaqView.vue')
        },
        {
            path: '/privacy-policy',
            name: 'privacy-policy',
            component: () => import('../views/PrivacyPolicy.vue')
        },
        {
            path: '/terms-of-service',
            name: 'terms-of-service',
            component: () => import('../views/TermsOfService.vue')
        }
    ]
})

export default router
