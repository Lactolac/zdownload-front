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
    port: 3000, // Puedes cambiar el puerto si es necesario
    proxy: {
      '/api': {
        target: 'https://zdownload-dev.yes.com.sv',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        onProxyReq: (proxyReq, req, res) => {
          proxyReq.setHeader('origin', 'https://zdownload-dev.yes.com.sv');
        }
      }
    }
  },
})