import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5176,
    proxy: {
      '/api': {
        // Local Studio/Admin must use the same deployed KV/R2 as production.
        target: 'https://izin-main.aldoramadhan16.workers.dev',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
