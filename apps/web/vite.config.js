import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: false,
    sourcemap: true
  },
  base: process.env.VITE_BASE_URL || "/"
})