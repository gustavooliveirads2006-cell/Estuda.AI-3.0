import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), {
      name: 'publish-only-approved-public-assets',
      apply: 'build',
      generateBundle() {
        // Prevent future reference uploads or backups in public/ from leaking into production.
        const files = [
          '.htaccess',
          'assets/aistudio/image_ba8a03b6.webp',
          'assets/aistudio/image_dd1656ca.webp',
          'assets/aistudio/image_8d4a50d3.webp',
          'assets/aistudio/image_a23913d1.webp',
          'assets/aistudio/image_fdcee1f9.webp',
          'assets/aistudio/image_7b46545a.webp',
        ];
        for (const fileName of files) {
          this.emitFile({ type: 'asset', fileName, source: readFileSync(path.join(__dirname, 'public', fileName)) });
        }
      },
    }],
    build: { copyPublicDir: false },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
