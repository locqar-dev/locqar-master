import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'
import { transform } from 'lightningcss'

// Post-process CSS to downlevel modern features for Chrome 37 (Android 5.1 WebView)
// Tailwind CSS v4 outputs @layer, :where(), oklch(), color-mix() which Chrome 37 ignores
function cssDownlevel() {
  return {
    name: 'css-downlevel-chrome37',
    enforce: 'post',
    generateBundle(options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && chunk.type === 'asset') {
          const { code } = transform({
            filename: fileName,
            code: Buffer.from(chunk.source),
            targets: { chrome: 37 << 16 },
          })
          chunk.source = code.toString()
        }
      }
    },
  }
}

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
    cssDownlevel(),
  ],
  build: {
    target: 'es2015',
    cssTarget: 'chrome37',
  },
}))
