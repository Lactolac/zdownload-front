<template>
  <div class="d-flex align-items-center justify-content-center vh-100">
    <div class="card custom-card-width shadow border-top-primary">
      <div class="card-body">
        <form @submit.prevent="processLogin" ref="loginForm" novalidate>
          <div class="text-center mb-4">
            <img src="/src/assets/logo.png" style="height: 50px;" alt="Logo">
            <h2 class="mt-3 custom-text-color">zdownload</h2>
          </div>
          <div class="mb-3">
            <input type="text" class="form-control" id="user" v-model="login.user" placeholder="Usuario" required>
            <div class="invalid-feedback">Por favor, ingrese su usuario.</div>
          </div>
          <div class="mb-3">
            <input type="password" class="form-control" id="pass" v-model="login.pass" placeholder="Contraseña" required>
            <div class="invalid-feedback">Por favor, ingrese su contraseña.</div>
          </div>
          <button type="submit" class="btn btn-primary w-100 custom-button-color" :disabled="logging">
            <span v-if="logging" class="spinner-border spinner-border-sm"></span>
            <span v-else>Iniciar sesión</span>
          </button>
          <div v-if="loginMessage" class="mt-3">
            <div :class="['alert', messageAccent(logginSuccess)]" role="alert">
              {{ loginMessage }}
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/api-plugins/authStores';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logging = ref(false);
const login = ref({
  user: '',
  pass: ''
});
const loginMessage = ref('');
const logginSuccess = ref(false);
const loginForm = ref(null);

const processLogin = async () => {
  // Validar el formulario antes de continuar
  const form = loginForm.value;
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  logging.value = true;
  try {
    // Intentar iniciar sesión
    const response = await authStore.login(login.value.user, login.value.pass);

    let parsedResponse;
    // Si la respuesta es una cadena JSON, convertirla a objeto
    if (typeof response === 'string') {
      parsedResponse = JSON.parse(response);
    } else {
      parsedResponse = response;
    }

    // Validar si la respuesta tiene el formato esperado
    if (parsedResponse && typeof parsedResponse === 'object' && 'success' in parsedResponse) {
      if (parsedResponse.success) {
        // Si el inicio de sesión es exitoso
        logginSuccess.value = true;
        loginMessage.value = 'Inicio de sesión exitoso';

        // Redirigir al dashboard
        router.push({ name: 'dashboard' });
      } else {
        // Si la API devuelve "success: false"
        logginSuccess.value = false;
        loginMessage.value = parsedResponse.msj || 'Usuario o contraseña incorrecta';
      }
    } else {
      // Manejar respuestas inesperadas
      logginSuccess.value = false;
      loginMessage.value = 'Usuario o clave incorrecta.';
    }
  } catch (error) {
    // Si ocurre un error en la solicitud
    logginSuccess.value = false;
    loginMessage.value = error.message || 'Error al procesar la solicitud';
  } finally {
    logging.value = false;
  }
};

const messageAccent = (status) => {
  return status ? 'alert-success' : 'alert-danger';
};
</script>

<style scoped>
.custom-card-width {
  width: 400px; /* Ajusta el ancho según tus necesidades */
}

/* Estilo para el borde superior azul */
.border-top-primary {
  border-top: 10px solid #003d7f; /* Línea azul con el color especificado */
}

/* Aplica el fondo bg-light a todo el body */
body {
  background-color: #f8fafc;
}

/* Estilo personalizado para el texto y el botón */
.custom-text-color {
  color: #1c3d5a; /* Color azul especificado */
}

.custom-button-color {
  background-color: #003d7f; /* Color azul especificado */
  border-color: #003d7f; /* Color azul especificado */
}
</style>