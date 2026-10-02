// Falha o build se algum texto do site tiver travessao (em dash). O site antigo
// estava cheio deles em nomes de produto, titulo e descricao; aqui o nome e o
// tipo do produto vivem em campos separados, e esta guarda impede a volta.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Montado por codigo: o proprio arquivo nao contem o caractere que proibe.
const EM_DASH = String.fromCodePoint(0x2014);
const TEXTO = new Set(['.astro', '.js', '.mjs', '.json', '.css', '.html', '.md', '.txt', '.svg']);
const RAIZ_PROJETO = fileURLToPath(new URL('..', import.meta.url));

async function arquivosDe(pasta) {
  let entradas;
  try {
    entradas = await readdir(pasta, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
  const lista = [];
  for (const entrada of entradas) {
    const caminho = join(pasta, entrada.name);
    if (entrada.isDirectory()) lista.push(...(await arquivosDe(caminho)));
    else if (TEXTO.has(extname(entrada.name))) lista.push(caminho);
  }
  return lista;
}

export async function varrer(raizes, base = RAIZ_PROJETO) {
  const achados = [];
  for (const raiz of raizes) {
    for (const arquivo of await arquivosDe(join(base, raiz))) {
      const linhas = (await readFile(arquivo, 'utf8')).split('\n');
      linhas.forEach((linha, i) => {
        if (linha.includes(EM_DASH)) {
          achados.push({ arquivo: relative(base, arquivo).split('\\').join('/'), linha: i + 1 });
        }
      });
    }
  }
  return achados;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const achados = await varrer(['src', 'public']);
  if (achados.length > 0) {
    console.error('Travessao encontrado (troque por virgula, ponto ou dois pontos):');
    for (const { arquivo, linha } of achados) console.error(`  ${arquivo}:${linha}`);
    process.exit(1);
  }
  console.log('sem travessao');
}
