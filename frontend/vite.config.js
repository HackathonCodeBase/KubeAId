import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/status': 'http://localhost:8000',
      '/simulate': 'http://localhost:8000',
      '/fix': 'http://localhost:8000',
      '/history': 'http://localhost:8000',
      '/reset': 'http://localhost:8000',
    },
  },
})
