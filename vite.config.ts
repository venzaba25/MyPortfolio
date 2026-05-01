import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tabler/icons-react": path.resolve(__dirname, "node_modules/@tabler/icons-react/dist/esm/tabler-icons-react.mjs"),
    },
  },
  optimizeDeps: {
    include: ['@tabler/icons-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
})
