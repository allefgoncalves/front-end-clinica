// vite.config.ts
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente baseado no mode (development, production, etc)
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      open: true, // Abre o navegador automaticamente
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development', // Sourcemap apenas em desenvolvimento
      minify: mode === 'production' ? 'terser' : false,
    },
    // Define variáveis globais
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },
    // Resolve aliases (opcional, mas útil)
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  }
})