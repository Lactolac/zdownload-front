import router from '@/router';
import axios from 'axios';
import { defineStore } from 'pinia';
import Swal from 'sweetalert2'; // Importa SweetAlert2

const showAlert = (options) => {
    return Swal.fire(options); // Retorna la promesa
};

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        error: null,
    }),

    actions: {
        async login(user, pass) {
            try {
                const response = await axios.post('http://10.10.4.139:3000/login', {
                    user,
                    pass,
                });

                // Imprimir la respuesta del servidor para depurar
                console.log('Respuesta del servidor:', response.data);

                // Ajustar la verificación de los datos de la respuesta
                if (!response.data.username || !response.data.token) {
                    throw new Error('Credenciales incorrectas o falta de información en la respuesta.');
                }

                this.user = {
                    username: response.data.username,
                    userId: response.data.USER_ID
                };
                this.token = response.data.token;
                this.error = null;

                localStorage.setItem('user', JSON.stringify(this.user));
                localStorage.setItem('token', this.token);

                this.setAxiosToken(this.token);

                showAlert({
                    title: '¡Inicio de sesión exitoso!',
                    text: `Bienvenido, ${this.user.username}`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });

                router.push({ name: 'dashboard' });
            } catch (err) {
                console.error('Error al autenticar:', err);

                if (err.response && err.response.status === 401) {
                    this.error = 'Usuario o contraseña incorrectos.';
                } else if (err.response && err.response.status === 500) {
                    this.error = 'Error del servidor.';
                } else {
                    this.error = err.message || 'Ocurrió un error inesperado.';
                }
                showAlert({
                    title: 'Error',
                    text: this.error,
                    icon: 'error',
                    confirmButtonText: 'Intentar de nuevo'
                });
            }
        },

        setAxiosToken(token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        },

        loadSession() {
            const user = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (user && token) {
                try {
                    this.user = JSON.parse(user);
                    this.token = token;

                    this.setAxiosToken(this.token);
                    console.log('Sesión cargada:', this.user);
                } catch (error) {
                    console.error('Error al cargar la sesión:', error);
                }
            }
        },

        async logout() {
            showAlert({
                title: '¿Estás seguro de que deseas cerrar sesión?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    this.user = null;
                    this.token = null;

                    localStorage.removeItem('user');
                    localStorage.removeItem('token');

                    delete axios.defaults.headers.common['Authorization'];

                    showAlert({
                        title: 'Has cerrado sesión correctamente.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    router.push({ name: 'login' });
                }
            });
        },

        isAuthenticated() {
            return !!this.user && !!this.token;
        },
    },
});