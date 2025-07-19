import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: '.',                      // renderer/
  base: './',                     // so build/index.html links assets relatively
  plugins: [react()],
  build: {
    outDir: 'dist',               // renderer/dist
    rollupOptions: {
      external: [                 // never bundle Electron/Node modules here
        'electron',
        'path',
        'fs',
        'active-win'
      ],
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})