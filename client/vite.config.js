import {defineConfig} from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    proxy: {
      '/graphql': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})