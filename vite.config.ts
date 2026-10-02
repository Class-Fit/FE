import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8080'

  if (mode === 'production') {
    const configuredUrl = env.VITE_BACKEND_URL
    if (!configuredUrl) {
      throw new Error('VITE_BACKEND_URL must be set for production builds')
    }
    const parsedUrl = new URL(configuredUrl)
    if (parsedUrl.protocol !== 'https:' || parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash) {
      throw new Error('VITE_BACKEND_URL must be an HTTPS origin without a path')
    }
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': backendUrl,
        '/oauth2': backendUrl,
        '/login': backendUrl,
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
    },
  }
})
