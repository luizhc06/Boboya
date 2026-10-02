// Converte os originais (PNG/JPG de 3 a 7 MB cada) em WebP leve e grava um
// manifesto com as dimensoes, pra <img> ter width/height e nao dar salto de
// layout. Os originais ficam em imagens-originais/, fora do git.
import sharp from 'sharp';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGENS = new URL('../imagens-originais/', import.meta.url);
const SAIDA = new URL('../public/img/', import.meta.url);
const MANIFESTO = new URL('../src/data/imagens.json', import.meta.url);

// Largura maxima da versao grande. O que nao esta aqui e foto de produto.
const ARTE = { logo: 600, reimu: 1400, marisa: 900, shinji: 900, sparkle: 900 };
const LARGURA_FOTO = 1200;
const LARGURA_MINI = 480;

async function converter(origem, destino, largura) {
  const info = await sharp(origem)
    .resize({ width: largura, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(destino);
  return { w: info.width, h: info.height };
}

// fileURLToPath e nao URL.pathname: no Windows o pathname vem como /C:/Users/...
const caminho = (url) => fileURLToPath(url);

await mkdir(caminho(SAIDA), { recursive: true });
await mkdir(caminho(new URL('./', MANIFESTO)), { recursive: true });
const manifesto = {};

for (const arquivo of (await readdir(caminho(ORIGENS))).sort()) {
  const ext = extname(arquivo).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;
  const nome = basename(arquivo, extname(arquivo));
  const origem = caminho(new URL(arquivo, ORIGENS));
  const ehFoto = !(nome in ARTE);

  const grande = await converter(origem, caminho(new URL(`${nome}.webp`, SAIDA)), ARTE[nome] ?? LARGURA_FOTO);
  manifesto[nome] = grande;
  if (ehFoto) {
    manifesto[nome].mini = await converter(origem, caminho(new URL(`${nome}-p.webp`, SAIDA)), LARGURA_MINI);
  }
  console.log(`${nome}: ${grande.w}x${grande.h}`);
}

await writeFile(caminho(MANIFESTO), JSON.stringify(manifesto, null, 2) + '\n');
console.log(`manifesto: ${Object.keys(manifesto).length} imagens`);
