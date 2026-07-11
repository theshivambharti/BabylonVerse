import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 2000
  },
  assetsInclude: ['**/*.glb', '**/*.env', '**/*.hdr', '**/*.gltf']
});
