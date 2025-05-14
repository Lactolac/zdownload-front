<template>
  <div class="container-fluid vh-100" v-if="!loading" v-cloak>
    <header>
      <nav class="navbar navbar-expand-lg navbar-dark bg-custom">
        <a class="navbar-brand" href="#">
          <img src="/src/assets/logo.png" alt="Logo" class="logo" />
        </a>
        <div class="ml-auto d-flex align-items-center">
          <span class="navbar-text mr-3">{{ username }}</span>
          <button class="btn btn-custom btn-small" @click="logout">
            <i class="pi pi-sign-out icon-small"></i>
          </button>
        </div>
      </nav>
    </header>
    <main class="container mt-4">
      <div class="d-flex justify-content-between mb-4">
        <div class="d-flex align-items-center">
          <input type="text" v-model="route" class="form-control form-control-sm mr-2" placeholder="Número de ruta" />
          <button class="btn btn-custom btn-small" @click="confirmProcessPartial">
            <i class="pi pi-download icon-small"></i> Procesar ruta
          </button>
        </div>
      </div>
      <div class="alert alert-info" role="alert">
        El sistema se actualizará todos los días a las {{ time }}
      </div>
      <div class="card mt-4">
        <div class="card-body">
          <table class="table table-striped table-sm">
            <thead>
              <tr>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Host/User</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in sortedLogs" :key="log.START_DATE">
                <td>{{ log.TYPE_N }}</td>
                <td>{{ formatDate(log.START_DATE) }}</td>
                <td>{{ formatDate(log.END_DATE) }}</td>
                <td>{{ log.HOST_N }}/{{ log.USUARIO }}</td>
                <td>{{ log.DETAILS }}</td>
              </tr>
              <tr v-for="log in externalLogs" :key="log.START_DATE">
                <td>{{ log.TYPE_N }}</td>
                <td>{{ formatDate(log.START_DATE) }}</td>
                <td>{{ formatDate(log.END_DATE) }}</td>
                <td>{{ log.HOST_N }}/{{ log.USUARIO }}</td>
                <td>{{ log.DETAILS }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
  <div v-else class="loading-overlay">
    <div class="loading-text">Por favor espera, esto puede tardar unos minutos...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/api-plugins/authStores';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const loading = ref(true);
const time = ref('04:00');
const route = ref('');
const logs = ref([]);
const externalLogs = ref([]);

const username = computed(() => authStore.user?.username || '');

const formatDate = (dateString) => {
  if (!dateString) return 'Invalid Date';
  const date = new Date(dateString);
  if (isNaN(date)) return 'Invalid Date';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  return date.toLocaleString('es-ES', options);
};

// Función para obtener logs desde el primer endpoint
const fetchLogs = () => {
  loading.value = true;
  axios.get('/api/bitacora')
    .then(response => {
      logs.value = response.data;
      logs.value.sort((a, b) => new Date(b.START_DATE) - new Date(a.START_DATE));
    })
    .catch(error => {
      console.error('Error al cargar datos:', error);
    })
    .finally(() => {
      loading.value = false;
    });
};

// Función para obtener logs desde el nuevo endpoint externo
const fetchExternalLogs = () => {
  axios.get('https://zdownload-dev.yes.com.sv/bitacora')
    .then(response => {
      externalLogs.value = response.data;
    })
    .catch(error => {
      console.error('Error al cargar datos externos:', error);
    });
};

// Obtener logs al montar el componente
onMounted(() => {
  fetchLogs();
  fetchExternalLogs();
});

// Computed property para los logs combinados
const sortedLogs = computed(() => {
  return logs.value.slice().sort((a, b) => new Date(b.START_DATE) - new Date(a.START_DATE));
});

// Función de logout
const logout = () => {
  authStore.logout();
};

// Función para confirmar y procesar descarga parcial
const confirmProcessPartial = () => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: '¿Deseas procesar esta ruta?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, procesar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      process_partial();
    }
  });
};

// Función para procesar descarga parcial con validación de "DG"
const process_partial = () => {
  const gestor = route.value;

  loading.value = true;

  // Verificar si el gestor comienza con "DG"
  if (gestor && gestor.startsWith('DG')) {
    // Usar el segundo endpoint
    axios.get(`https://zdownload-dev.yes.com.sv/zdownload?gestor=${gestor}`)
      .then(response => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Descarga parcial procesada correctamente con el segundo endpoint.',
          icon: 'success',
          confirmButtonText: 'Ok'
        });
        fetchLogs();
      })
      .catch(error => {
        console.error('Error al procesar la descarga parcial con el segundo endpoint:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al procesar la descarga parcial. Por favor, intente de nuevo.',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      })
      .finally(() => {
        loading.value = false;
      });
  } else {
    // Usar el primer endpoint
    axios.get(`/api/bitacora?gestor=${gestor}`)
      .then(response => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Descarga parcial procesada correctamente con el primer endpoint.',
          icon: 'success',
          confirmButtonText: 'Ok'
        });
        fetchLogs();
      })
      .catch(error => {
        console.error('Error al procesar la descarga parcial con el primer endpoint:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al procesar la descarga parcial. Por favor, intente de nuevo.',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      })
      .finally(() => {
        loading.value = false;
      });
  }
};
</script>

<style scoped>
/* Asegúrate de que el fondo del cuerpo sea blanco */
html, body {
  background-color: white;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

#app {
  height: 100%;
  width: 100%;
  background-color: white;
}

.container-fluid {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  margin: 0;
}

header {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #003d7f;
  color: white;
  width: 100%;
  padding: 0;
  margin: 0;
}

.bg-custom {
  background-color: #003d7f !important;
}

.logo {
  height: 30px;
}

.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
}

.loading-text {
  font-size: 18px;
  color: #333;
}

/* Clase personalizada para iconos pequeños */
.icon-small {
  font-size: 0.75em;
}

/* Clase personalizada para botones pequeños */
.btn-small {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #003d7f; /* Color de fondo igual al navbar */
  border: 1px solid #003d7f; /* Borde del mismo color */
  color: white; /* Color de texto blanco */
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: .1s;
  font-weight: 500;
  padding: 6px 10px; /* Ajusta el padding para hacer los botones más pequeños */
  font-size: 12px; /* Ajusta el tamaño de la fuente */
  border-radius: 4px;
}
</style>