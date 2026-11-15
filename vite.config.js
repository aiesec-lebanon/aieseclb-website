import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // full-size originals of the photographs: large files, often still being copied in, and
      // never imported by the site (npm run images makes the web versions)
      ignored: ['**/src/assets/gen/originals/**'],
    },
  },
})
