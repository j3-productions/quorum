import packageJson from './package.json';
import { loadEnv, defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { urbitPlugin } from '@urbit/vite-plugin-urbit';
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default ({mode}: {mode: string;}) => {
  process.env.VITE_STORAGE_VERSION = mode === 'dev' ? Date.now().toString() : packageJson.version;
  Object.assign(process.env, loadEnv(mode, process.cwd()));
  const SHIP_URL = process.env.SHIP_URL || process.env.VITE_SHIP_URL || 'http://localhost:8080';
  console.log(SHIP_URL);

  const rollupOptions = {
    output: {
      manualChunks: {
        lodash: ['lodash'],
        'lodash/fp': ['lodash/fp'],
        '@urbit/api': ['@urbit/api'],
        '@urbit/http-api': ['@urbit/http-api'],
        '@tlon/sigil-js': ['@tlon/sigil-js'],
        'any-ascii': ['any-ascii'],
        'react-select': ['react-select'],
        'react-hook-form': ['react-hook-form'],
        'react-markdown': ['react-markdown'],
        'date-fns': ['date-fns'],
        'urbit-ob': ['urbit-ob'],
        '@radix-ui/react-dialog': ['@radix-ui/react-dialog'],
        '@radix-ui/react-dropdown-menu': ['@radix-ui/react-dropdown-menu'],
        '@radix-ui/react-tooltip': ['@radix-ui/react-tooltip'],
        '@radix-ui/react-icons': ['@radix-ui/react-icons'],
      },
    },
  };

  return defineConfig({
    build: { sourcemap: false, rollupOptions },
    plugins: [urbitPlugin({ base: 'quorum', target: SHIP_URL, secure: false }), reactRefresh()],
    server: { host: 'localhost', port: 3000 },
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  });
};
