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
      <div class="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <!-- Botones de banderas -->
        <div class="d-flex align-items-center mb-2 mb-md-0">
          <a href="https://estado_de_rutas.yes.com.sv/EstadosDeRutas?pais=sv" target="_blank"
            class="btn btn-light btn-small mx-1 d-flex align-items-center" title="Ver rutas El Salvador">
            <span style="width:22px;height:16px;display:inline-block;margin-right:6px;">
              <svg viewBox="0 0 22 16" width="22" height="16" style="display:block;">
                <rect width="22" height="5.33" fill="#003893" />
                <rect y="5.33" width="22" height="5.33" fill="#fff" />
                <rect y="10.66" width="22" height="5.33" fill="#003893" />
              </svg>
            </span>
            El Salvador
          </a>
          <a href="https://estado_de_rutas.yes.com.sv/EstadosDeRutas?pais=gt" target="_blank"
            class="btn btn-light btn-small mx-1 d-flex align-items-center" title="Ver rutas Guatemala">
            <span style="width:22px;height:16px;display:inline-block;margin-right:6px;">
              <svg viewBox="0 0 22 16" width="22" height="16" style="display:block;">
                <rect width="7.33" height="16" fill="#4997D0" />
                <rect x="7.33" width="7.33" height="16" fill="#fff" />
                <rect x="14.66" width="7.34" height="16" fill="#4997D0" />
              </svg>
            </span>
            Guatemala
          </a>
        </div>

        <!-- Filtros y procesar ruta -->
        <div class="d-flex align-items-center mb-2 mb-md-0">
          <select v-model="selectedCountry" class="form-control form-control-sm mr-2" id="countrySelect" title="Filtrar bitacora por país">
            <option value="sv">El Salvador</option>
            <option value="gt">Guatemala</option>
          </select>
          <input type="text" v-model="route" class="form-control form-control-sm mr-2" placeholder="Número de ruta" />
          <button class="btn btn-custom btn-small" @click="confirmProcessPartial">
            <i class="pi pi-download icon-small"></i> Procesar ruta
          </button>
        </div>

        <!-- Botón eliminar Tour ID -->
        <div>
          <button class="btn btn-danger btn-small" @click="openDeleteTourIdModal">
            <i class="pi pi-trash icon-small"></i> Eliminar Tour ID
          </button>
        </div>
      </div>
      <div class="alert alert-info" role="alert">
        El sistema se actualizará todos los días a las {{ time }}
      </div>
      <div class="card mt-4">
        <div class="card-header font-weight-bold">
          Bitácora
        </div>
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
              <tr v-for="log in filteredLogs" :key="log.START_DATE">
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
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/api-plugins/authStores';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const loading = ref(true);
const time = ref('04:00');
const route = ref('');
const logs = ref([]);
const externalLogs = ref([]);
const selectedCountry = ref(localStorage.getItem('selectedCountry') || 'sv'); // Persistir filtro país

let refreshInterval = null;

const username = computed(() => authStore.user?.username || '');

const filteredLogs = computed(() => {
  let logsToShow = selectedCountry.value === 'sv' ? logs.value : externalLogs.value;
  // Si hay un número de ruta, filtra por ese número
  if (route.value && route.value.trim() !== '') {
    // Filtra si el campo DETAILS (o el que corresponda) contiene el número de ruta
    logsToShow = logsToShow.filter(
      log => String(log.DETAILS || '').toLowerCase().includes(route.value.trim().toLowerCase())
        || String(log.TYPE_N || '').toLowerCase().includes(route.value.trim().toLowerCase())
        || String(log.HOST_N || '').toLowerCase().includes(route.value.trim().toLowerCase())
        || String(log.USUARIO || '').toLowerCase().includes(route.value.trim().toLowerCase())
    );
  }
  return [...logsToShow].sort((a, b) => new Date(b.START_DATE) - new Date(a.START_DATE));
});
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
  loading.value = true;
  axios.get('https://zdownload-dev.yes.com.sv/bitacora')
    .then(response => {
      externalLogs.value = response.data;
      externalLogs.value.sort((a, b) => new Date(b.START_DATE) - new Date(a.START_DATE));
    })
    .catch(error => {
      console.error('Error al cargar datos externos:', error);
    })
    .finally(() => {
      loading.value = false;
    });
};

const fetchCurrentLogs = () => {
  if (selectedCountry.value === 'sv') {
    fetchLogs();
  } else {
    fetchExternalLogs();
  }
};

// Persistencia del filtro de país
watch(selectedCountry, (newValue) => {
  localStorage.setItem('selectedCountry', newValue);
  fetchCurrentLogs();
});

// Obtener logs al montar el componente y refrescar cada minuto
onMounted(() => {
  fetchCurrentLogs();
  refreshInterval = setInterval(fetchCurrentLogs, 60000); // 1 minuto
});

onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});

// Función de logout
const logout = () => {
  authStore.logout();
};
const openDeleteTourIdModal = () => {
  Swal.fire({
    title: 'Digite el Tour ID que desea limpiar',
    input: 'text',
    inputLabel: '',
    inputPlaceholder: 'Ingrese el Tour ID',
    showCancelButton: true,
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return 'Debes ingresar un Tour ID';
      }
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const tourId = result.value.trim();
      // Segundo modal de confirmación
      Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Seguro de eliminar el Tour ID: ${tourId}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No, cancelar'
      }).then((confirmResult) => {
        if (confirmResult.isConfirmed) {
          // Llama a tu endpoint por proxy
          deleteTourId(tourId);
        }
      });
    }
  });
};

const deleteTourId = (tourId) => {
  loading.value = true;
  axios.get(`/eliminartourid/functionfs?path=/DSD/ME_ADMIN_REMOVE_TOUR&where=IT_TOURID=${encodeURIComponent(tourId)}`)
    .then(response => {
      let data = response.data;
      let msg = data?.ET_RETURN?.MESSAGE || `El Tour ID ${tourId} fue eliminado correctamente.`;
      let isError = data?.ET_RETURN?.TYPE === 'E';
      Swal.fire({
        title: isError ? 'Error' : '¡Eliminado!',
        text: msg,
        icon: isError ? 'error' : 'success',
        confirmButtonText: 'Ok'
      });
      fetchCurrentLogs();
    })
    .catch(error => {
      Swal.fire({
        title: 'Error',
        text: `Error al eliminar el Tour ID: ${tourId}`,
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      console.error('Error al eliminar tour id:', error);
    })
    .finally(() => {
      loading.value = false;
    });
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
        fetchCurrentLogs();
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
        fetchCurrentLogs();
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
html,
body {
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

.icon-small {
  font-size: 0.75em;
}

.btn-small {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #003d7f;
  border: 1px solid #003d7f;
  color: white;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: .1s;
  font-weight: 500;
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 4px;
}

.btn-small svg {
  vertical-align: middle;
}
</style>