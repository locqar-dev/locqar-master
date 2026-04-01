import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'
import { transform } from 'lightningcss'

// Strip @layer wrappers — Chrome 37 ignores ALL rules inside @layer (Chrome 99+)
function stripLayers(css) {
  let result = ''
  let i = 0
  while (i < css.length) {
    if (css.startsWith('@layer', i)) {
      let bracePos = css.indexOf('{', i)
      if (bracePos === -1) { result += css.substring(i); break }
      i = bracePos + 1
      let depth = 1
      let innerStart = i
      while (i < css.length && depth > 0) {
        if (css[i] === '{') depth++
        else if (css[i] === '}') depth--
        i++
      }
      result += css.substring(innerStart, i - 1)
    } else {
      result += css[i]
      i++
    }
  }
  return result
}

// Strip :where() and :is() pseudo-class wrappers — Chrome 88+
// Handles nested parens: :where(.foo, .bar) -> .foo, .bar
function stripPseudo(css, pseudo) {
  const token = ':' + pseudo + '('
  let result = ''
  let i = 0
  while (i < css.length) {
    const pos = css.indexOf(token, i)
    if (pos === -1) { result += css.substring(i); break }
    result += css.substring(i, pos)
    i = pos + token.length
    let depth = 1
    let innerStart = i
    while (i < css.length && depth > 0) {
      if (css[i] === '(') depth++
      else if (css[i] === ')') depth--
      i++
    }
    result += css.substring(innerStart, i - 1)
  }
  return result
}

// Resolve color-mix() to simple fallback — Chrome 111+
// Replace color-mix(in srgb, colorA X%, colorB) with colorA as a rough fallback
function stripColorMix(css) {
  return css.replace(/color-mix\(in\s+\w+,\s*([^,]+?)\s+\d+%,\s*[^)]+\)/g, '$1')
}

// Post-process all CSS assets for Chrome 37 compat
function cssDownlevel() {
  return {
    name: 'css-downlevel-chrome37',
    enforce: 'post',
    generateBundle(options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && chunk.type === 'asset') {
          let css = typeof chunk.source === 'string' ? chunk.source : chunk.source.toString()

          // Step 1: Strip @layer wrappers
          css = stripLayers(css)

          // Step 2: Strip :where() and :is() wrappers
          css = stripPseudo(css, 'where')
          css = stripPseudo(css, 'is')

          // Step 3: Strip color-mix() with fallback
          css = stripColorMix(css)

          // Step 4: Use Lightning CSS for oklch/lab -> rgb conversion
          try {
            const { code } = transform({
              filename: fileName,
              code: Buffer.from(css),
              targets: { chrome: 37 << 16 },
            })
            css = code.toString()
          } catch (e) {
            // If Lightning CSS fails, continue with manual fixes
          }

          chunk.source = css
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
