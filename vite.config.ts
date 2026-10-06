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
      host: true, // Permite conexões de qualquer IP
      open: true, // Abre o navegador automaticamente
      // CORREÇÃO: Adiciona suporte para Cloudflare Tunnel
      allowedHosts: [
        'localhost',
        '.trycloudflare.com',  // Permite qualquer subdomínio trycloudflare
        '.cloudflare.com',      // Permite domínios cloudflare
        '.ngrok.io',            // Caso use ngrok também
        '*.ngrok-free.app',     // Ngrok free
        '*.serveo.net',         // Serveo
        '*.loca.lt'             // LocalTunnel
      ],
      cors: {
        origin: '*', // Permite CORS de qualquer origem (útil para túneis)
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
      },
      // Proxy para desenvolvimento: encaminha chamadas /api para o backend local
      // Evita problemas de CORS durante o desenvolvimento local
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
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
    // Resolve aliases
    resolve: {
      alias: {
        '@': '/src',
      }
    },
    preview: {
      port: 5173,
      host: true,
      allowedHosts: [
        'localhost',
        '.trycloudflare.com',
        '.cloudflare.com'
      ]
    }
  }
})