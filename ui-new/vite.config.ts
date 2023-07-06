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

  return defineConfig({
    plugins: [urbitPlugin({ base: 'quorum', target: SHIP_URL, secure: false }), reactRefresh()],
    server: { host: 'localhost', port: 3000 },
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  });
};
