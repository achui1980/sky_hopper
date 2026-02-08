import { mkdir, readFile, writeFile, copyFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const distDir = path.join(projectRoot, 'dist');
const distAssetsDir = path.join(distDir, 'assets');

async function ensureDir(dirPath) {
    await mkdir(dirPath, { recursive: true });
}

async function copyIfExists(from, to) {
    try {
        await access(from);
    } catch {
        return;
    }
    await copyFile(from, to);
}

function buildIndexHtml(sourceHtml) {
    return sourceHtml.replace(
        /<script\s+type="module"\s+src="js\/main\.js"><\/script>/,
        '<script src="assets/game.js"></script>'
    );
}

await ensureDir(distAssetsDir);

await build({
    entryPoints: [path.join(projectRoot, 'js/main.js')],
    bundle: true,
    minify: true,
    sourcemap: false,
    format: 'iife',
    target: ['es2017'],
    outfile: path.join(distAssetsDir, 'game.js')
});

const indexHtmlPath = path.join(projectRoot, 'index.html');
const indexHtml = await readFile(indexHtmlPath, 'utf8');
const distIndexHtml = buildIndexHtml(indexHtml);
await writeFile(path.join(distDir, 'index.html'), distIndexHtml, 'utf8');

await copyIfExists(path.join(projectRoot, 'style.css'), path.join(distDir, 'style.css'));
await copyIfExists(path.join(projectRoot, 'icon.png'), path.join(distDir, 'icon.png'));
