import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    dts({
      include: ['lib', 'shadcn'],
      exclude: ['**/*.stories.*', '**/*.test.*'],
      tsconfigPath: './tsconfig.lib.json',
      outDir: 'dist',
      insertTypesEntry: false,
      pathsToAliases: false,
      rollupTypes: false,
    }),
    tailwindcss(),
  ],
  build: {
    lib: {
      entry: {
        // Main entry point
        index: resolve(__dirname, 'lib/index.ts'),
        // Component entries
        'components/AppSidebar': resolve(__dirname, 'lib/components/AppSidebar/index.ts'),
        'components/Alert': resolve(__dirname, 'lib/components/Alert/index.ts'),
        'components/Avatar': resolve(__dirname, 'lib/components/Avatar/index.ts'),
        'components/Badge': resolve(__dirname, 'lib/components/Badge/index.ts'),
        'components/Button': resolve(__dirname, 'lib/components/Button/index.ts'),
        'components/Card': resolve(__dirname, 'lib/components/Card/index.ts'),
        'components/Chart': resolve(__dirname, 'lib/components/Chart/index.ts'),
        'components/Checkbox': resolve(__dirname, 'lib/components/Checkbox/index.ts'),
        'components/Collapsible': resolve(__dirname, 'lib/components/Collapsible/index.ts'),
        'components/OTPField': resolve(__dirname, 'lib/components/OTPField/index.ts'),
        'components/PasswordField': resolve(__dirname, 'lib/components/PasswordField/index.ts'),
        'components/PhoneField': resolve(__dirname, 'lib/components/PhoneField/index.ts'),
        'components/Progress': resolve(__dirname, 'lib/components/Progress/index.ts'),
        'components/DataTable': resolve(__dirname, 'lib/components/DataTable/index.ts'),
        'components/Select': resolve(__dirname, 'lib/components/Select/index.ts'),
        'components/selects/IndustrySelect': resolve(__dirname, 'lib/components/selects/IndustrySelect/index.ts'),
        'components/TextField': resolve(__dirname, 'lib/components/TextField/index.ts'),
        'components/TextArea': resolve(__dirname, 'lib/components/TextArea/index.ts'),
        'components/Typography': resolve(__dirname, 'lib/components/Typography/index.ts'),
        'components/ThemeToggle': resolve(__dirname, 'lib/components/ThemeToggle/index.ts'),
        'components/Form': resolve(__dirname, 'lib/components/Form/index.ts'),
        'components/DatePicker': resolve(__dirname, 'lib/components/DatePicker/index.ts'),
        'components/DropdownMenu': resolve(__dirname, 'lib/components/DropdownMenu/index.ts'),
        'components/Separator': resolve(__dirname, 'lib/components/Separator/index.ts'),
        'components/Sidebar': resolve(__dirname, 'lib/components/Sidebar/index.ts'),
        'components/Skeleton': resolve(__dirname, 'lib/components/Skeleton/index.ts'),
        'components/Sonner': resolve(__dirname, 'lib/components/Sonner/index.ts'),
        'components/Spinner': resolve(__dirname, 'lib/components/Spinner/index.ts'),
        'components/StepProgressIndicator': resolve(__dirname, 'lib/components/StepProgressIndicator/index.ts'),
        'components/Switch': resolve(__dirname, 'lib/components/Switch/index.ts'),
        'components/Toggle': resolve(__dirname, 'lib/components/Toggle/index.ts'),
        // shadcn entries
        'shadcn/shadcnField': resolve(__dirname, 'shadcn/shadcnField/index.ts'),
        // Hooks entries
        'hooks/index': resolve(__dirname, 'lib/hooks/index.ts'),
        // Context entries
        'context/index': resolve(__dirname, 'lib/context/index.ts'),
        // Theme entries (consolidated theme exports for Module Federation)
        'theme/index': resolve(__dirname, 'lib/theme/index.ts'),
        // Utils entries
        'utils/axios': resolve(__dirname, 'lib/utils/axios.ts'),
      },
      name: 'QuantumUI',
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: (id, parentId) => {
        // Don't externalize axios when building utils/axios entry
        if (parentId?.includes('lib/utils/axios')) {
          return ['react', 'react-dom', 'react/jsx-runtime', 'react-router-dom'].includes(id);
        }
        // Externalize all peer dependencies for other entries
        return [
          'react',
          'react-dom',
          'react/jsx-runtime',
          'axios',
          'react-router-dom',
          '@tanstack/react-query',
        ].includes(id);
      },
      output: {
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
    target: 'esnext',
    minify: false,
  },
});
