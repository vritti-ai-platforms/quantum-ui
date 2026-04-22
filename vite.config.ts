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
        'components/Sidebar': resolve(__dirname, 'lib/components/Sidebar/index.ts'),
        'components/Breadcrumb': resolve(__dirname, 'lib/components/Breadcrumb/index.ts'),
        'components/Alert': resolve(__dirname, 'lib/components/Alert/index.ts'),
        'components/Avatar': resolve(__dirname, 'lib/components/Avatar/index.ts'),
        'components/Badge': resolve(__dirname, 'lib/components/Badge/index.ts'),
        'components/Button': resolve(__dirname, 'lib/components/Button/index.ts'),
        'components/Card': resolve(__dirname, 'lib/components/Card/index.ts'),
        'components/Chart': resolve(__dirname, 'lib/components/Chart/index.ts'),
        'components/Checkbox': resolve(__dirname, 'lib/components/Checkbox/index.ts'),
        'components/Collapsible': resolve(__dirname, 'lib/components/Collapsible/index.ts'),
        'components/OTPField': resolve(__dirname, 'lib/components/OTPField/index.ts'),
        'components/PageContent': resolve(__dirname, 'lib/components/PageContent/index.ts'),
        'components/PageHeader': resolve(__dirname, 'lib/components/PageHeader/index.ts'),
        'components/PasswordField': resolve(__dirname, 'lib/components/PasswordField/index.ts'),
        'components/PhoneField': resolve(__dirname, 'lib/components/PhoneField/index.ts'),
        'components/Progress': resolve(__dirname, 'lib/components/Progress/index.ts'),
        'components/DangerZone': resolve(__dirname, 'lib/components/DangerZone/index.ts'),
        'components/DetailField': resolve(__dirname, 'lib/components/DetailField/index.ts'),
        'components/DataTable': resolve(__dirname, 'lib/components/DataTable/index.ts'),
        'components/CheckboxGroup': resolve(__dirname, 'lib/components/CheckboxGroup/index.ts'),
        'components/RadioGroup': resolve(__dirname, 'lib/components/RadioGroup/index.ts'),
        'components/Select': resolve(__dirname, 'lib/components/Select/index.ts'),
        'components/Sortable': resolve(__dirname, 'lib/components/Sortable/index.ts'),
        'selects/cloud-provider': resolve(__dirname, 'lib/selects/cloud-provider/index.ts'),
        'selects/industry': resolve(__dirname, 'lib/selects/industry/index.ts'),
        'selects/region': resolve(__dirname, 'lib/selects/region/index.ts'),
        'selects/plan': resolve(__dirname, 'lib/selects/plan/index.ts'),
        'selects/currency': resolve(__dirname, 'lib/selects/currency/index.ts'),
        'selects/locale': resolve(__dirname, 'lib/selects/locale/index.ts'),
        'selects/timezone': resolve(__dirname, 'lib/selects/timezone/index.ts'),
        'selects/deployment': resolve(__dirname, 'lib/selects/deployment/index.ts'),
        'selects/feature': resolve(__dirname, 'lib/selects/feature/index.ts'),
        'selects/app': resolve(__dirname, 'lib/selects/app/index.ts'),
        'selects/batch': resolve(__dirname, 'lib/selects/batch/index.ts'),
        'selects/app-code': resolve(__dirname, 'lib/selects/app-code/index.ts'),
        'selects/bom': resolve(__dirname, 'lib/selects/bom/index.ts'),
        'selects/category': resolve(__dirname, 'lib/selects/category/index.ts'),
        'selects/inventory-item': resolve(__dirname, 'lib/selects/inventory-item/index.ts'),
        'selects/storage-location': resolve(__dirname, 'lib/selects/storage-location/index.ts'),
        'selects/supplier': resolve(__dirname, 'lib/selects/supplier/index.ts'),
        'selects/purchase-order': resolve(__dirname, 'lib/selects/purchase-order/index.ts'),
        'selects/uom': resolve(__dirname, 'lib/selects/uom/index.ts'),
        'selects/user': resolve(__dirname, 'lib/selects/user/index.ts'),
        'selects/microfrontend': resolve(__dirname, 'lib/selects/microfrontend/index.ts'),
        'components/TextField': resolve(__dirname, 'lib/components/TextField/index.ts'),
        'components/SearchBar': resolve(__dirname, 'lib/components/SearchBar/index.ts'),
        'components/TextArea': resolve(__dirname, 'lib/components/TextArea/index.ts'),
        'components/Typography': resolve(__dirname, 'lib/components/Typography/index.ts'),
        'components/ThemeToggle': resolve(__dirname, 'lib/components/ThemeToggle/index.ts'),
        'components/Form': resolve(__dirname, 'lib/components/Form/index.ts'),
        'components/HierarchyGraph': resolve(__dirname, 'lib/components/HierarchyGraph/index.ts'),
        'components/DatePicker': resolve(__dirname, 'lib/components/DatePicker/index.ts'),
        'components/DateTimePicker': resolve(__dirname, 'lib/components/DateTimePicker/index.ts'),
        'components/Dialog': resolve(__dirname, 'lib/components/Dialog/index.ts'),
        'components/DropdownMenu': resolve(__dirname, 'lib/components/DropdownMenu/index.ts'),
        'components/Empty': resolve(__dirname, 'lib/components/Empty/index.ts'),
        'components/ErrorBoundary': resolve(__dirname, 'lib/components/ErrorBoundary/index.ts'),
        'components/Separator': resolve(__dirname, 'lib/components/Separator/index.ts'),
        'components/Skeleton': resolve(__dirname, 'lib/components/Skeleton/index.ts'),
        'components/Sonner': resolve(__dirname, 'lib/components/Sonner/index.ts'),
        'components/Spinner': resolve(__dirname, 'lib/components/Spinner/index.ts'),
        'components/StepProgressIndicator': resolve(__dirname, 'lib/components/StepProgressIndicator/index.ts'),
        'components/Switch': resolve(__dirname, 'lib/components/Switch/index.ts'),
        'components/Tabs': resolve(__dirname, 'lib/components/Tabs/index.ts'),
        'components/Toggle': resolve(__dirname, 'lib/components/Toggle/index.ts'),
        'components/TreeView': resolve(__dirname, 'lib/components/TreeView/index.ts'),
        'components/FilePreview': resolve(__dirname, 'lib/components/FilePreview/index.ts'),
        'components/UploadFile': resolve(__dirname, 'lib/components/UploadFile/index.ts'),
        'components/ValueFilter': resolve(__dirname, 'lib/components/ValueFilter/index.ts'),
        'components/ViewTabs': resolve(__dirname, 'lib/components/ViewTabs/index.ts'),
        'components/RichTextEditor': resolve(__dirname, 'lib/components/Editor/index.tsx'),
        // shadcn entries
        'shadcn/shadcnField': resolve(__dirname, 'shadcn/shadcnField/index.ts'),
        // Hooks entries
        'hooks/index': resolve(__dirname, 'lib/hooks/index.ts'),
        // Context entries
        'context/index': resolve(__dirname, 'lib/context/index.ts'),
        // Theme entries (consolidated theme exports for Module Federation)
        'theme/index': resolve(__dirname, 'lib/theme/index.ts'),
        // Types entries
        'types/table-filter': resolve(__dirname, 'lib/types/table-filter.ts'),
        'types/api-response': resolve(__dirname, 'lib/types/api-response.ts'),
        // Utils entries
        'utils/axios': resolve(__dirname, 'lib/utils/axios.ts'),
        'utils/motion': resolve(__dirname, 'lib/utils/motion.ts'),
        'utils/slug': resolve(__dirname, 'lib/utils/slug.ts'),
        'utils/lodash': resolve(__dirname, 'lib/utils/lodash.ts'),
        'utils/locale': resolve(__dirname, 'lib/utils/locale.ts'),
        'utils/timezone': resolve(__dirname, 'lib/utils/timezone.ts'),
        'date-fns': resolve(__dirname, 'lib/date-fns.ts'),
      },
      name: 'QuantumUI',
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: (id, parentId) => {
        // Don't externalize axios when building the axios entry
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
