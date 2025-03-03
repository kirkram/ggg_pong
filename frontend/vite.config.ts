import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/app": {
        changeOrigin: true,
        rewrite: (path: string) => {
          if (path.startsWith("/app")) {
            return path.substring(4)
          }

          return path
        },
        target: `http://localhost:8080`
      }
    }
  }
})
