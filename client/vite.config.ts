import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    ...configDefaults,
    globals: true,
    environment: 'jsdom',
    setupFiles: '/setupTests.ts',
    coverage: {
      thresholds: {
        lines: 50,
        branches: 50,
        functions: 50,
        statements: 50,
      },
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json'],
      exclude: ['**/*.js', '**/*.ts', '**/*.test.tsx'],
      reportOnFailure: true,
    }
  },
  build: {
    
    rollupOptions: {
      external: (id) => id.startsWith(path.resolve(__dirname, './src/FrontTests' )),
    }
  }
});
