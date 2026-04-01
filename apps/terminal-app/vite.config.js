import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    legacy({
      targets: ['Chrome >= 37', 'Android >= 5'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      modernPolyfills: true,
    }),
  ],
  build: {
    target: 'es2015',
    cssTarget: 'chrome37',
  },
}))
