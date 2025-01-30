<template>
  <div class="d-flex align-items-center justify-content-center vh-100">
    <div class="card custom-card-width shadow border-top-primary">
      <div class="card-body">
        <form @submit.prevent="processLogin" ref="loginForm">
          <div class="text-center mb-4">
            <img src="/src/assets/logo.png" style="height: 50px;" alt="Logo">
            <h2 class="mt-3 custom-text-color">zdownload</h2>
          </div>
          <div class="mb-3">
            <input type="text" class="form-control" id="user" v-model="login.user" placeholder="Usuario" required>
          </div>
          <div class="mb-3">
            <input type="password" class="form-control" id="pass" v-model="login.pass" placeholder="Contraseña" required>
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
  if (!loginForm.value.checkValidity()) {
    loginForm.value.classList.add('was-validated');
    return;
  }
  logging.value = true;

  try {
    await authStore.login(login.value.user, login.value.pass);
    loginMessage.value = 'Inicio de sesión exitoso';
    logginSuccess.value = true;
    router.push({ name: 'dashboard' });
  } catch (error) {
    loginMessage.value = error.message || 'Error al iniciar sesión';
    logginSuccess.value = false;
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
  color: #1c3d5a;/* Color azul especificado */
}

.custom-button-color {
  background-color: #003d7f; /* Color azul especificado */
  border-color: #003d7f; /* Color azul especificado */
}

</style>