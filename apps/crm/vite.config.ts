import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.VITE_BASE_CRM ?? '/crm/',
  plugins: [react()],
  server: { port: 5174 },
  build: { outDir: 'dist', emptyOutDir: true, sourcemap: false },
})
