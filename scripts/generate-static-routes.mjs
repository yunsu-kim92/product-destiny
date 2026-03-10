import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const sourceFile = path.join(distDir, 'index.html');

const staticRoutes = ['about', 'privacy', 'terms', 'refund', 'contact'];

await mkdir(distDir, { recursive: true });

await Promise.all(
  staticRoutes.map(async (route) => {
    const routeDir = path.join(distDir, route);
    await mkdir(routeDir, { recursive: true });
    await copyFile(sourceFile, path.join(routeDir, 'index.html'));
  }),
);
