import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router'; // Asegúrate de importar el router
import 'primeicons/primeicons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// Crear la instancia de la aplicación
const app = createApp(App);

// Crear Pinia
const pinia = createPinia();

// Usar Pinia
app.use(pinia);
app.use(router); // Usar el router

// Montar la aplicación
app.mount('#app');