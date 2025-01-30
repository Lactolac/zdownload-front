import { useAuthStore } from '@/api-plugins/authStores';
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/auth/login' // Redirige a la ruta del login
    },
    {
        path: '/auth/login',
        name: 'login',
        component: () => import('@/components/Login.vue') // Ruta al login
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/components/Dashboard.vue'),
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    await authStore.loadSession(); // Cargar sesión si existe

    if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
        next({ name: 'login' }); // Redirigir al login si no está autenticado
    } else {
        next();
    }
});

export default router;