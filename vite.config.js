import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Escucha en todas las interfaces de red
    port: 5173, // Puedes cambiar el puerto si es necesario
    proxy: {
      '/api': {
        target: 'http://192.168.103.70:8003', //https://zdownload-dev.yes.com.sv   cambiar a esta si esta en dev
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        onProxyReq: (proxyReq, req, res) => {
          proxyReq.setHeader('origin', 'http://192.168.103.70:8003');
        }
      },
      '/auth': {
        target: 'http://10.10.4.139:3000', // Dirección IP de destino para autenticación
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, ''),
        secure: false,
        onProxyReq: (proxyReq, req, res) => {
          proxyReq.setHeader('origin', 'http://10.10.4.139:3000');
        }
      },
      '/eliminartourid': {
        target: 'http://10.10.4.139:3000', // Dirección IP de destino para autenticación
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/eliminartourid/, ''),
        secure: false,
        onProxyReq: (proxyReq, req, res) => {
          proxyReq.setHeader('origin', 'http://10.10.4.139:3000');
        }
      }
    },
    allowedHosts: [
      'zdownload.yes.com.sv' // Agregar a allowedHosts
    ]
  },
})