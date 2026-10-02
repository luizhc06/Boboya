# Loja BOBOYA garage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a loja estatica da BOBOYA garage (home, categorias, produto, carrinho em gaveta que fecha no WhatsApp) com estetica Y2K geek anime.

**Architecture:** Astro estatico, sem framework no cliente. Toda a logica de negocio (preco, carrinho, mensagem) mora em modulos puros em `src/lib/` testados com Vitest. O navegador so roda um script fino (`src/scripts/carrinho-ui.js`) que liga esses modulos ao DOM. Catalogo em JSON, imagens convertidas para WebP por um script e guardadas em `public/img/`.

**Tech Stack:** Astro ^7.3.5, Vitest ^5.0.3, sharp ^0.35.5, Node >= 22.12.

**Spec:** `docs/superpowers/specs/2026-10-01-loja-boboya-design.md`

## Global Constraints

- **Nenhum travessao** (em dash, `\u2014`) em qualquer texto do site: `src/`, `public/`, dados. `npm run build` falha se aparecer.
- Texto do site em portugues do Brasil, com acentos corretos. Comentarios de codigo em portugues, no estilo do MeuSite (explicam o porque).
- Precos sao **centavos inteiros** (`6990` = R$ 69,90). Nunca ponto flutuante.
- O preco nao e guardado no carrinho: o total e calculado do catalogo.
- Nao inventar medidas, material, politicas de troca nem especificacoes. O campo `specs` so aparece na pagina se estiver preenchido.
- `imagens-originais/` fica **fora do git** (repo publico, ~37 MB). So o WebP gerado sobe.
- WhatsApp e Instagram nao existem ainda: com `config.whatsapp` ou `config.instagram` igual a `null`, o clique mostra o aviso "Em desenvolvimento" e nao navega.
- Nao copiar o e-mail nem o @ pessoais do dono do site antigo.
- Respeitar `prefers-reduced-motion`. Contraste AA. Navegacao por teclado com foco visivel. Responsivo desde 360px.
- Mensagens de commit terminam com a linha `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. **Nunca fazer `git push` sem o Luiz pedir.**
- Todos os comandos rodam em `C:\Users\Psych\Documents\Projetos\Boboya`. No PowerShell, se a politica de execucao bloquear `npm`, use `npm.cmd`.

## Estrutura de arquivos

```
Boboya/
  .gitignore  .node-version  package.json  astro.config.mjs  README.md
  .claude/launch.json
  scripts/
    assets.mjs              converte imagens-originais/ em public/img/*.webp + manifesto
    sem-travessao.mjs       varre src/ e public/ atras de em dash (exporta varrer)
  src/
    config.js               nome da loja, whatsapp (null), instagram (null)
    data/produtos.json      os 10 produtos
    data/imagens.json       manifesto gerado: largura e altura de cada WebP
    lib/preco.js            formatarPreco(centavos)
    lib/imagens.js          img(nome, {mini})
    lib/catalogo.js         produtos, CATEGORIAS, porSlug, porCategoria, comSelo
    lib/carrinho.js         funcoes puras do carrinho
    lib/armazenamento.js    carregar/salvar no localStorage com reserva
    lib/mensagem.js         montarMensagem, linkWhatsApp
    layouts/Base.astro      html, topo, rodape, gaveta, aviso, catalogo em JSON
    components/Topo.astro  Rodape.astro  Faixa.astro  Hero.astro
    components/CartaoProduto.astro  Gaveta.astro  Aviso.astro
    pages/index.astro  pages/[categoria].astro  pages/produto/[slug].astro  pages/404.astro
    scripts/relogio.js      relogio ao vivo
    scripts/carrinho-ui.js  liga carrinho, gaveta e aviso ao DOM
    styles/global.css
  tests/  preco  imagens  catalogo  carrinho  armazenamento  mensagem  travessao
  imagens-originais/        NAO versionada
  public/img/               WebP gerado, versionado
```

---

### Task 1: Esqueleto do projeto

**Files:**
- Create: `package.json`, `astro.config.mjs`, `.gitignore`, `.node-version`, `.claude/launch.json`, `src/pages/index.astro`, `tests/ambiente.test.js`

**Interfaces:**
- Produces: scripts npm `dev`, `build`, `preview`, `assets`, `test`, `texto`. Os scripts `assets.mjs` e `sem-travessao.mjs` sao criados nas Tasks 2 e 3, entao `build` e `assets` so funcionam depois delas.

- [ ] **Step 1: Criar `.gitignore` e `.node-version`**

`.gitignore`:

```
node_modules/
dist/
.astro/
.wrangler/
.env
.DS_Store

# os originais pesam ~37 MB e o repo e publico: so o WebP gerado sobe
imagens-originais/
```

`.node-version`:

```
22.12.0
```

- [ ] **Step 2: Criar `package.json`**

```json
{
  "name": "boboya",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "node scripts/sem-travessao.mjs && astro build",
    "preview": "astro preview",
    "assets": "node scripts/assets.mjs",
    "texto": "node scripts/sem-travessao.mjs",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^7.3.5"
  },
  "devDependencies": {
    "sharp": "^0.35.5",
    "vitest": "^5.0.3"
  }
}
```

- [ ] **Step 3: Criar `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

// Sem "site" por enquanto: o dominio ainda nao foi decidido. Quando for, e esta
// linha que ganha o endereco (e so entao vale ligar sitemap e og:image).
export default defineConfig({});
```

- [ ] **Step 4: Criar `.claude/launch.json`**

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "boboya",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 4321
    }
  ]
}
```

- [ ] **Step 5: Pagina provisoria e teste de ambiente**

`src/pages/index.astro` (sera substituida na Task 8):

```astro
---
---
<!doctype html>
<html lang="pt-BR">
  <head><meta charset="utf-8" /><title>BOBOYA garage</title></head>
  <body><h1>BOBOYA garage</h1></body>
</html>
```

`tests/ambiente.test.js`:

```js
import { describe, it, expect } from 'vitest';

describe('ambiente', () => {
  it('roda testes em ESM', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Instalar e verificar**

Run: `npm install`
Expected: termina sem erro e cria `package-lock.json` e `node_modules/`.

Run: `npm test`
Expected: `1 passed`.

Run: `npx astro build`
Expected: `Complete!` e a pasta `dist/index.html` existe. (Usa `npx astro build` direto porque `npm run build` ainda depende do script da Task 2.)

- [ ] **Step 7: Commit**

```bash
git add .gitignore .node-version package.json package-lock.json astro.config.mjs .claude/launch.json src/pages/index.astro tests/ambiente.test.js docs
git commit -m "chore: esqueleto Astro com Vitest, spec e plano"
```

(Incluir a linha `Co-Authored-By` das Global Constraints no corpo.)

---

### Task 2: Guarda contra travessao

**Files:**
- Create: `scripts/sem-travessao.mjs`
- Test: `tests/travessao.test.js`

**Interfaces:**
- Produces: `varrer(raizes: string[], base?: string): Promise<{ arquivo: string, linha: number }[]>` (lista vazia = limpo). CLI: `node scripts/sem-travessao.mjs` sai com codigo 1 se achar algo.

- [ ] **Step 1: Escrever o teste que falha**

`tests/travessao.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { varrer } from '../scripts/sem-travessao.mjs';

// O caractere e montado em tempo de execucao para o proprio teste nao conte-lo.
const EM = String.fromCodePoint(0x2014);

async function pastaCom(arquivos) {
  const base = await mkdtemp(join(tmpdir(), 'boboya-'));
  for (const [caminho, conteudo] of Object.entries(arquivos)) {
    const destino = join(base, caminho);
    await mkdir(join(destino, '..'), { recursive: true });
    await writeFile(destino, conteudo);
  }
  return base;
}

describe('varrer', () => {
  it('acha o em dash e diz arquivo e linha', async () => {
    const base = await pastaCom({ 'src/a.astro': `ok\nMarisa ${EM} Camiseta\n` });
    const achados = await varrer(['src'], base);
    expect(achados).toEqual([{ arquivo: 'src/a.astro', linha: 2 }]);
    await rm(base, { recursive: true });
  });

  it('devolve lista vazia quando esta limpo', async () => {
    const base = await pastaCom({ 'src/a.astro': 'Marisa, Camiseta\n' });
    expect(await varrer(['src'], base)).toEqual([]);
    await rm(base, { recursive: true });
  });

  it('ignora binarios e pastas que nao existem', async () => {
    const base = await pastaCom({ 'public/img/x.webp': `bin${EM}` });
    expect(await varrer(['public', 'nao-existe'], base)).toEqual([]);
    await rm(base, { recursive: true });
  });

  it('o projeto de verdade esta limpo', async () => {
    expect(await varrer(['src', 'public'])).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/travessao.test.js`
Expected: FAIL, nao acha o modulo `../scripts/sem-travessao.mjs`.

- [ ] **Step 3: Implementar**

`scripts/sem-travessao.mjs`:

```js
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/travessao.test.js`
Expected: 4 passed.

Run: `npm run texto`
Expected: `sem travessao`.

Run: `npm run build`
Expected: imprime `sem travessao` e depois `Complete!`.

- [ ] **Step 5: Commit**

```bash
git add scripts/sem-travessao.mjs tests/travessao.test.js
git commit -m "feat: guarda de build contra travessao nos textos"
```

---

### Task 3: Preco, imagens e script de assets

**Files:**
- Create: `src/lib/preco.js`, `src/lib/imagens.js`, `scripts/assets.mjs`
- Generate: `public/img/*.webp`, `src/data/imagens.json`
- Test: `tests/preco.test.js`, `tests/imagens.test.js`

**Interfaces:**
- Produces: `formatarPreco(centavos: number): string`, `img(nome: string, opcoes?: { mini?: boolean }): { src: string, width: number, height: number }` (lanca `Error` se o nome nao esta no manifesto). Manifesto `src/data/imagens.json`: `{ [nome]: { w, h, mini?: { w, h } } }`. Arquivos: `/img/<nome>.webp` e, para fotos de produto (`mock_*`), `/img/<nome>-p.webp` (480px).
- Nomes de imagem disponiveis: `logo marisa mock_a0 mock_a1 mock_a2 mock_d0 mock_d1 mock_d2 mock_d3 mock_t0 mock_t1 mock_t2 reimu shinji sparkle`.

- [ ] **Step 1: Teste de preco que falha**

`tests/preco.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { formatarPreco } from '../src/lib/preco.js';

describe('formatarPreco', () => {
  it('formata centavos em reais', () => {
    expect(formatarPreco(6990)).toBe('R$ 69,90');
    expect(formatarPreco(1990)).toBe('R$ 19,90');
  });
  it('mantem os zeros dos centavos', () => {
    expect(formatarPreco(5000)).toBe('R$ 50,00');
    expect(formatarPreco(5)).toBe('R$ 0,05');
  });
  it('separa milhares', () => {
    expect(formatarPreco(123456)).toBe('R$ 1.234,56');
  });
});
```

Run: `npx vitest run tests/preco.test.js`
Expected: FAIL (modulo nao existe).

- [ ] **Step 2: Implementar `preco.js`**

```js
// Preco e sempre centavos inteiros: somar 19,90 + 22,90 em ponto flutuante
// da 42.800000000000004, e somar 1990 + 2290 da 4280.
export function formatarPreco(centavos) {
  const reais = Math.floor(centavos / 100);
  const resto = String(centavos % 100).padStart(2, '0');
  return `R$ ${reais.toLocaleString('pt-BR')},${resto}`;
}
```

Run: `npx vitest run tests/preco.test.js`
Expected: 3 passed.

- [ ] **Step 3: Escrever o script de assets**

`scripts/assets.mjs`:

```js
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
```

- [ ] **Step 4: Rodar o script**

Run: `npm run assets`
Expected: 15 linhas `nome: LxA` e `manifesto: 15 imagens`. Em `public/img/` aparecem 15 arquivos grandes e 10 `-p.webp` (um por `mock_*`... sao 10: `mock_a0..a2`, `mock_d0..d3`, `mock_t0..t2`).

Run: `du -sh public/img`
Expected: abaixo de ~6 MB no total. Se passar de 10 MB, baixar `quality` para 75 e rodar de novo.

- [ ] **Step 5: Teste do helper de imagens (falha primeiro)**

`tests/imagens.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import manifesto from '../src/data/imagens.json';
import { img } from '../src/lib/imagens.js';

describe('img', () => {
  it('devolve src, width e height da versao grande', () => {
    const f = img('mock_t0');
    expect(f.src).toBe('/img/mock_t0.webp');
    expect(f.width).toBe(manifesto.mock_t0.w);
    expect(f.height).toBe(manifesto.mock_t0.h);
  });
  it('devolve a versao mini quando pedida', () => {
    const f = img('mock_t0', { mini: true });
    expect(f.src).toBe('/img/mock_t0-p.webp');
    expect(f.width).toBe(manifesto.mock_t0.mini.w);
  });
  it('cai na versao grande quando nao ha mini (arte)', () => {
    expect(img('reimu', { mini: true }).src).toBe('/img/reimu.webp');
  });
  it('lanca erro para nome desconhecido', () => {
    expect(() => img('nao-existe')).toThrow(/nao-existe/);
  });
  it('todo arquivo do manifesto existe em public/img', () => {
    for (const [nome, m] of Object.entries(manifesto)) {
      expect(existsSync(`public/img/${nome}.webp`), nome).toBe(true);
      if (m.mini) expect(existsSync(`public/img/${nome}-p.webp`), `${nome}-p`).toBe(true);
    }
  });
});
```

Run: `npx vitest run tests/imagens.test.js`
Expected: FAIL (modulo `imagens.js` nao existe).

- [ ] **Step 6: Implementar `imagens.js`**

```js
import manifesto from '../data/imagens.json';

// Uma imagem so existe se o script de assets a gerou. Falhar no build, e nao
// no navegador, e o ponto: um nome errado vira erro aqui e nao um <img> quebrado.
export function img(nome, { mini = false } = {}) {
  const m = manifesto[nome];
  if (!m) throw new Error(`imagem desconhecida: ${nome}`);
  const usaMini = mini && m.mini;
  const dim = usaMini ? m.mini : m;
  return { src: `/img/${nome}${usaMini ? '-p' : ''}.webp`, width: dim.w, height: dim.h };
}
```

Run: `npx vitest run tests/imagens.test.js`
Expected: 5 passed.

- [ ] **Step 7: Commit**

```bash
git add scripts/assets.mjs src/lib/preco.js src/lib/imagens.js src/data/imagens.json public/img tests/preco.test.js tests/imagens.test.js
git commit -m "feat: formatacao de preco e pipeline de imagens WebP"
```

---

### Task 4: Catalogo

**Files:**
- Create: `src/data/produtos.json`, `src/lib/catalogo.js`, `src/config.js`
- Test: `tests/catalogo.test.js`

**Interfaces:**
- Consumes: `img`/manifesto da Task 3 (o teste confere que toda imagem do catalogo existe).
- Produces: `produtos: Produto[]`, `CATEGORIAS: { [slug]: { titulo, legenda } }` na ordem `adesivos, camisetas, decorativos`, `porSlug(slug): Produto | undefined`, `porCategoria(cat): Produto[]`, `comSelo(selo): Produto[]`. `config: { nome, whatsapp, instagram }`.
- `Produto` = `{ slug, nome, tipo, categoria, preco, selo, tamanhos, imagens, specs, edicao? }`.

- [ ] **Step 1: Teste de integridade que falha**

`tests/catalogo.test.js`:

```js
import { describe, it, expect } from 'vitest';
import manifesto from '../src/data/imagens.json';
import { produtos, CATEGORIAS, porSlug, porCategoria, comSelo } from '../src/lib/catalogo.js';

const EM = String.fromCodePoint(0x2014);

describe('catalogo', () => {
  it('tem os 10 produtos do site antigo', () => {
    expect(produtos).toHaveLength(10);
    expect(porCategoria('camisetas')).toHaveLength(3);
    expect(porCategoria('adesivos')).toHaveLength(3);
    expect(porCategoria('decorativos')).toHaveLength(4);
  });
  it('slugs sao unicos e seguros para URL', () => {
    const slugs = produtos.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
  it('preco e centavo inteiro positivo', () => {
    for (const p of produtos) {
      expect(Number.isInteger(p.preco), p.slug).toBe(true);
      expect(p.preco, p.slug).toBeGreaterThan(0);
    }
  });
  it('categoria e selo sao valores conhecidos', () => {
    for (const p of produtos) {
      expect(Object.keys(CATEGORIAS), p.slug).toContain(p.categoria);
      expect([null, 'novo', 'destaque'], p.slug).toContain(p.selo);
    }
  });
  it('toda imagem citada existe no manifesto', () => {
    for (const p of produtos) {
      expect(p.imagens.length, p.slug).toBeGreaterThan(0);
      for (const nome of p.imagens) expect(manifesto[nome], `${p.slug}: ${nome}`).toBeDefined();
    }
  });
  it('nenhum texto tem travessao', () => {
    for (const p of produtos) {
      expect(`${p.nome}|${p.tipo}`.includes(EM), p.slug).toBe(false);
    }
  });
  it('precos batem com o site antigo', () => {
    const esperado = {
      'marisa-camiseta-branca': 6990,
      'reimu-camiseta-branca': 6990,
      'neon-genesis-ep-24': 7490,
      'marisa-pack-adesivos': 2290,
      'reimu-bumper-sticker': 1990,
      'colecao-ii-bumper-sticker': 1990,
      'shinji-almofada': 6490,
      'nadeko-ima-de-geladeira': 2490,
      'shinji-nadeko-chaveiro': 2990,
      'boboya-chinelo': 4990,
    };
    for (const [slug, preco] of Object.entries(esperado)) expect(porSlug(slug)?.preco, slug).toBe(preco);
  });
  it('comSelo filtra', () => {
    expect(comSelo('destaque').map((p) => p.slug)).toEqual(['shinji-almofada']);
    expect(comSelo('novo')).toHaveLength(6);
  });
});
```

Run: `npx vitest run tests/catalogo.test.js`
Expected: FAIL (modulo nao existe).

- [ ] **Step 2: Criar `src/data/produtos.json`**

```json
[
  { "slug": "marisa-camiseta-branca", "nome": "Marisa", "tipo": "Camiseta Branca", "categoria": "camisetas", "preco": 6990, "selo": "novo", "tamanhos": [], "imagens": ["mock_t0"], "specs": null },
  { "slug": "reimu-camiseta-branca", "nome": "Reimu 現実核爆弾", "tipo": "Camiseta Branca", "categoria": "camisetas", "preco": 6990, "selo": "novo", "tamanhos": [], "imagens": ["mock_t1"], "specs": null },
  { "slug": "neon-genesis-ep-24", "nome": "Neon Genesis BOBOYA Ep. 24", "tipo": "Camiseta Preta", "categoria": "camisetas", "preco": 7490, "selo": null, "tamanhos": [], "imagens": ["mock_t2"], "specs": null },
  { "slug": "marisa-pack-adesivos", "nome": "Marisa", "tipo": "Pack de Adesivos", "categoria": "adesivos", "preco": 2290, "selo": null, "tamanhos": [], "imagens": ["mock_a0"], "specs": null },
  { "slug": "reimu-bumper-sticker", "nome": "Reimu 現実核爆弾", "tipo": "Bumper Sticker", "categoria": "adesivos", "preco": 1990, "selo": "novo", "tamanhos": [], "imagens": ["mock_a1"], "specs": null },
  { "slug": "colecao-ii-bumper-sticker", "nome": "Coleção II", "tipo": "Bumper Sticker", "categoria": "adesivos", "preco": 1990, "selo": "novo", "tamanhos": [], "imagens": ["mock_a2"], "specs": null },
  { "slug": "shinji-almofada", "nome": "Shinji", "tipo": "Almofada", "categoria": "decorativos", "preco": 6490, "selo": "destaque", "tamanhos": [], "imagens": ["mock_d0"], "specs": null },
  { "slug": "nadeko-ima-de-geladeira", "nome": "Nadeko", "tipo": "Ímã de Geladeira", "categoria": "decorativos", "preco": 2490, "selo": "novo", "tamanhos": [], "imagens": ["mock_d1"], "specs": null },
  { "slug": "shinji-nadeko-chaveiro", "nome": "Shinji + Nadeko", "tipo": "Chaveiro", "categoria": "decorativos", "preco": 2990, "selo": null, "tamanhos": [], "imagens": ["mock_d2"], "specs": null },
  { "slug": "boboya-chinelo", "nome": "BOBOYA garage", "tipo": "Chinelo", "categoria": "decorativos", "preco": 4990, "selo": "novo", "tamanhos": [], "imagens": ["mock_d3"], "specs": null }
]
```

Observacao: a camiseta "Marisa" e a "Reimu" levam selo `novo`, como no site antigo. Contagem de `novo`: marisa-camiseta, reimu-camiseta, reimu-bumper, colecao-ii, nadeko, chinelo = 6.

- [ ] **Step 3: Criar `src/lib/catalogo.js` e `src/config.js`**

`src/lib/catalogo.js`:

```js
import produtos from '../data/produtos.json';

export { produtos };

// A ordem das chaves e a ordem em que as secoes aparecem na home. Adesivos
// primeiro: sao o foco da loja.
export const CATEGORIAS = {
  adesivos: { titulo: 'Adesivos', legenda: 'Bumper stickers e packs para o seu carro.' },
  camisetas: { titulo: 'Camisetas', legenda: 'Estampas da garage para vestir.' },
  decorativos: { titulo: 'Decorativos', legenda: 'Almofada, ímã, chaveiro e chinelo.' },
};

export const porSlug = (slug) => produtos.find((p) => p.slug === slug);
export const porCategoria = (categoria) => produtos.filter((p) => p.categoria === categoria);
export const comSelo = (selo) => produtos.filter((p) => p.selo === selo);
```

`src/config.js`:

```js
// O que muda com o dono da loja. Enquanto whatsapp e instagram forem null, o
// clique mostra "Em desenvolvimento" em vez de navegar.
//
// whatsapp: so digitos com DDI e DDD, ex: '5541999999999'
// instagram: URL completa, ex: 'https://instagram.com/boboya'
export const config = {
  nome: 'BOBOYA garage',
  whatsapp: null,
  instagram: null,
};
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/catalogo.test.js`
Expected: 8 passed.

- [ ] **Step 5: Commit**

```bash
git add src/data/produtos.json src/lib/catalogo.js src/config.js tests/catalogo.test.js
git commit -m "feat: catalogo com os 10 produtos e precos do site antigo"
```

---

### Task 5: Carrinho (logica pura) e armazenamento

**Files:**
- Create: `src/lib/carrinho.js`, `src/lib/armazenamento.js`
- Test: `tests/carrinho.test.js`, `tests/armazenamento.test.js`

**Interfaces:**
- Produces (item do carrinho = `{ slug: string, tamanho: string | null, qtd: number }`, tudo imutavel: cada funcao devolve um carrinho novo):
  - `adicionar(carrinho, { slug, tamanho = null, qtd = 1 })`
  - `alterarQtd(carrinho, slug, tamanho, delta)` (remove a linha se `qtd` chegar a 0)
  - `remover(carrinho, slug, tamanho)`
  - `quantidadeTotal(carrinho): number`
  - `linhas(carrinho, catalogo): { item, produto, subtotal }[]` (descarta slug que nao esta no catalogo)
  - `totalCentavos(carrinho, catalogo): number`
  - `higienizar(bruto, catalogo): item[]`
  - `MAX_QTD = 99`
- `carregar(catalogo, storage?) : item[]` e `salvar(carrinho, storage?) : boolean`, chave `boboya:carrinho`.

- [ ] **Step 1: Testes do carrinho que falham**

`tests/carrinho.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  adicionar, alterarQtd, remover, quantidadeTotal, linhas, totalCentavos, higienizar, MAX_QTD,
} from '../src/lib/carrinho.js';

const catalogo = [
  { slug: 'a', nome: 'A', tipo: 'Camiseta', preco: 6990, tamanhos: ['P', 'M'] },
  { slug: 'b', nome: 'B', tipo: 'Adesivo', preco: 1990, tamanhos: [] },
];

describe('adicionar', () => {
  it('cria a linha', () => {
    expect(adicionar([], { slug: 'b' })).toEqual([{ slug: 'b', tamanho: null, qtd: 1 }]);
  });
  it('soma na linha existente', () => {
    const c = adicionar(adicionar([], { slug: 'b' }), { slug: 'b', qtd: 2 });
    expect(c).toEqual([{ slug: 'b', tamanho: null, qtd: 3 }]);
  });
  it('tamanhos diferentes viram linhas diferentes', () => {
    const c = adicionar(adicionar([], { slug: 'a', tamanho: 'P' }), { slug: 'a', tamanho: 'M' });
    expect(c).toHaveLength(2);
  });
  it('nao passa do maximo', () => {
    const c = adicionar([{ slug: 'b', tamanho: null, qtd: MAX_QTD }], { slug: 'b' });
    expect(c[0].qtd).toBe(MAX_QTD);
  });
  it('nao altera o carrinho original', () => {
    const original = [{ slug: 'b', tamanho: null, qtd: 1 }];
    adicionar(original, { slug: 'b' });
    expect(original[0].qtd).toBe(1);
  });
});

describe('alterarQtd e remover', () => {
  const base = [{ slug: 'b', tamanho: null, qtd: 2 }];
  it('muda a quantidade', () => {
    expect(alterarQtd(base, 'b', null, 1)[0].qtd).toBe(3);
  });
  it('remove a linha quando chega a zero', () => {
    expect(alterarQtd(base, 'b', null, -2)).toEqual([]);
  });
  it('remover tira so a linha certa', () => {
    const c = [...base, { slug: 'a', tamanho: 'P', qtd: 1 }];
    expect(remover(c, 'a', 'P')).toEqual(base);
  });
});

describe('totais', () => {
  const c = [
    { slug: 'a', tamanho: 'P', qtd: 2 },
    { slug: 'b', tamanho: null, qtd: 3 },
  ];
  it('quantidadeTotal soma as quantidades', () => {
    expect(quantidadeTotal(c)).toBe(5);
  });
  it('totalCentavos soma em centavos', () => {
    expect(totalCentavos(c, catalogo)).toBe(2 * 6990 + 3 * 1990);
  });
  it('linhas descarta slug que saiu do catalogo', () => {
    const l = linhas([...c, { slug: 'sumiu', tamanho: null, qtd: 1 }], catalogo);
    expect(l).toHaveLength(2);
    expect(l[0].subtotal).toBe(13980);
  });
});

describe('higienizar', () => {
  it('devolve vazio se nao for lista', () => {
    expect(higienizar({ x: 1 }, catalogo)).toEqual([]);
    expect(higienizar(null, catalogo)).toEqual([]);
  });
  it('descarta slug desconhecido, quantidade ruim e lixo', () => {
    const bruto = [
      { slug: 'x', tamanho: null, qtd: 1 },
      { slug: 'b', tamanho: null, qtd: 0 },
      { slug: 'b', tamanho: null, qtd: 1.5 },
      'texto',
      null,
    ];
    expect(higienizar(bruto, catalogo)).toEqual([]);
  });
  it('exige tamanho valido quando o produto tem tamanhos', () => {
    expect(higienizar([{ slug: 'a', tamanho: 'GG', qtd: 1 }], catalogo)).toEqual([]);
    expect(higienizar([{ slug: 'a', tamanho: 'M', qtd: 1 }], catalogo)).toHaveLength(1);
  });
  it('forca tamanho null quando o produto nao tem tamanhos', () => {
    expect(higienizar([{ slug: 'b', tamanho: 'P', qtd: 1 }], catalogo)).toEqual([
      { slug: 'b', tamanho: null, qtd: 1 },
    ]);
  });
  it('limita a quantidade e junta linhas repetidas', () => {
    const r = higienizar([
      { slug: 'b', tamanho: null, qtd: 500 },
      { slug: 'b', tamanho: 'P', qtd: 2 },
    ], catalogo);
    expect(r).toEqual([{ slug: 'b', tamanho: null, qtd: MAX_QTD }]);
  });
});
```

Run: `npx vitest run tests/carrinho.test.js`
Expected: FAIL (modulo nao existe).

- [ ] **Step 2: Implementar `carrinho.js`**

```js
// Carrinho = lista de { slug, tamanho, qtd }. Nenhuma funcao aqui muda o que
// recebe: devolvem um carrinho novo, o que deixa o teste simples e a tela sem
// surpresa. Preco nao entra no carrinho: o total sai do catalogo, pra um preco
// antigo guardado no navegador nunca virar o valor do pedido.
export const MAX_QTD = 99;

const mesma = (item, slug, tamanho) => item.slug === slug && item.tamanho === tamanho;

export function adicionar(carrinho, { slug, tamanho = null, qtd = 1 }) {
  if (!carrinho.some((i) => mesma(i, slug, tamanho))) {
    return [...carrinho, { slug, tamanho, qtd: Math.min(qtd, MAX_QTD) }];
  }
  return carrinho.map((i) => (mesma(i, slug, tamanho) ? { ...i, qtd: Math.min(i.qtd + qtd, MAX_QTD) } : i));
}

export function alterarQtd(carrinho, slug, tamanho, delta) {
  return carrinho
    .map((i) => (mesma(i, slug, tamanho) ? { ...i, qtd: Math.min(i.qtd + delta, MAX_QTD) } : i))
    .filter((i) => i.qtd > 0);
}

export function remover(carrinho, slug, tamanho) {
  return carrinho.filter((i) => !mesma(i, slug, tamanho));
}

export function quantidadeTotal(carrinho) {
  return carrinho.reduce((soma, i) => soma + i.qtd, 0);
}

export function linhas(carrinho, catalogo) {
  const porSlug = new Map(catalogo.map((p) => [p.slug, p]));
  return carrinho.flatMap((item) => {
    const produto = porSlug.get(item.slug);
    return produto ? [{ item, produto, subtotal: produto.preco * item.qtd }] : [];
  });
}

export function totalCentavos(carrinho, catalogo) {
  return linhas(carrinho, catalogo).reduce((soma, l) => soma + l.subtotal, 0);
}

// O que vem do localStorage e texto de fora: pode ter sido editado a mao, ser de
// uma versao antiga da loja ou apontar pra produto que saiu do catalogo.
export function higienizar(bruto, catalogo) {
  if (!Array.isArray(bruto)) return [];
  const porSlug = new Map(catalogo.map((p) => [p.slug, p]));
  const limpo = [];
  for (const item of bruto) {
    if (!item || typeof item !== 'object') continue;
    const produto = porSlug.get(item.slug);
    if (!produto) continue;
    const qtd = Number(item.qtd);
    if (!Number.isInteger(qtd) || qtd < 1) continue;
    let tamanho = null;
    if (produto.tamanhos.length > 0) {
      if (!produto.tamanhos.includes(item.tamanho)) continue;
      tamanho = item.tamanho;
    }
    limpo.push({ slug: produto.slug, tamanho, qtd: Math.min(qtd, MAX_QTD) });
  }
  return limpo.reduce((acc, i) => adicionar(acc, i), []);
}
```

Run: `npx vitest run tests/carrinho.test.js`
Expected: 16 passed.

- [ ] **Step 3: Testes do armazenamento que falham**

`tests/armazenamento.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { carregar, salvar } from '../src/lib/armazenamento.js';

const catalogo = [{ slug: 'b', nome: 'B', tipo: 'Adesivo', preco: 1990, tamanhos: [] }];

function falso(inicial = {}) {
  const dados = { ...inicial };
  return {
    getItem: (k) => dados[k] ?? null,
    setItem: (k, v) => { dados[k] = String(v); },
  };
}
const quebrado = {
  getItem() { throw new Error('bloqueado'); },
  setItem() { throw new Error('bloqueado'); },
};

describe('armazenamento', () => {
  it('guarda e le de volta', () => {
    const s = falso();
    expect(salvar([{ slug: 'b', tamanho: null, qtd: 2 }], s)).toBe(true);
    expect(carregar(catalogo, s)).toEqual([{ slug: 'b', tamanho: null, qtd: 2 }]);
  });
  it('comeca vazio', () => {
    expect(carregar(catalogo, falso())).toEqual([]);
  });
  it('JSON quebrado vira carrinho vazio', () => {
    expect(carregar(catalogo, falso({ 'boboya:carrinho': '{nao e json' }))).toEqual([]);
  });
  it('higieniza o que le', () => {
    const s = falso({ 'boboya:carrinho': JSON.stringify([{ slug: 'sumiu', tamanho: null, qtd: 1 }]) });
    expect(carregar(catalogo, s)).toEqual([]);
  });
  it('storage bloqueado nao derruba: le vazio e salvar devolve false', () => {
    expect(carregar(catalogo, quebrado)).toEqual([]);
    expect(salvar([], quebrado)).toBe(false);
  });
});
```

Run: `npx vitest run tests/armazenamento.test.js`
Expected: FAIL (modulo nao existe).

- [ ] **Step 4: Implementar `armazenamento.js`**

```js
import { higienizar } from './carrinho.js';

const CHAVE = 'boboya:carrinho';

// localStorage pode nao existir ou lancar (janela anonima, dados de site
// bloqueados). Ate o acesso a `globalThis.localStorage` entra no try, porque em
// alguns navegadores e o proprio acesso que lanca. Sem storage o carrinho vive
// so em memoria, e a loja continua funcionando.
export function carregar(catalogo, storage) {
  try {
    const s = storage ?? globalThis.localStorage;
    return higienizar(JSON.parse(s.getItem(CHAVE) ?? '[]'), catalogo);
  } catch {
    return [];
  }
}

export function salvar(carrinho, storage) {
  try {
    const s = storage ?? globalThis.localStorage;
    s.setItem(CHAVE, JSON.stringify(carrinho));
    return true;
  } catch {
    return false;
  }
}
```

Run: `npx vitest run tests/armazenamento.test.js tests/carrinho.test.js`
Expected: 21 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/carrinho.js src/lib/armazenamento.js tests/carrinho.test.js tests/armazenamento.test.js
git commit -m "feat: logica pura do carrinho e armazenamento resiliente"
```

---

### Task 6: Mensagem do WhatsApp

**Files:**
- Create: `src/lib/mensagem.js`
- Test: `tests/mensagem.test.js`

**Interfaces:**
- Consumes: `formatarPreco` (Task 3); o formato de `linhas()` (Task 5): `{ item: { slug, tamanho, qtd }, produto: { nome, tipo, preco }, subtotal }`.
- Produces: `montarMensagem(linhas, totalCentavos, nomeLoja): string`, `linkWhatsApp(numero: string | null, texto: string): string | null` (devolve `null` se nao ha digitos no numero).

- [ ] **Step 1: Teste que falha**

`tests/mensagem.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { montarMensagem, linkWhatsApp } from '../src/lib/mensagem.js';

const EM = String.fromCodePoint(0x2014);
const linhas = [
  { item: { slug: 'a', tamanho: 'M', qtd: 2 }, produto: { nome: 'Marisa', tipo: 'Camiseta Branca', preco: 6990 }, subtotal: 13980 },
  { item: { slug: 'b', tamanho: null, qtd: 1 }, produto: { nome: 'Reimu 現実核爆弾', tipo: 'Bumper Sticker', preco: 1990 }, subtotal: 1990 },
];

describe('montarMensagem', () => {
  const texto = montarMensagem(linhas, 15970, 'BOBOYA garage');
  it('abre com a loja e lista os itens', () => {
    expect(texto).toContain('Quero fazer um pedido na BOBOYA garage');
    expect(texto).toContain('- 2x Marisa (Camiseta Branca), tam. M: R$ 139,80');
    expect(texto).toContain('- 1x Reimu 現実核爆弾 (Bumper Sticker): R$ 19,90');
  });
  it('fecha com o total', () => {
    expect(texto.trimEnd().endsWith('Total: R$ 159,70')).toBe(true);
  });
  it('nao usa travessao', () => {
    expect(texto.includes(EM)).toBe(false);
  });
});

describe('linkWhatsApp', () => {
  it('monta o link com texto codificado', () => {
    const link = linkWhatsApp('+55 (41) 99999-9999', 'Oi! 現実');
    expect(link).toBe(`https://wa.me/5541999999999?text=${encodeURIComponent('Oi! 現実')}`);
  });
  it('devolve null sem numero', () => {
    expect(linkWhatsApp(null, 'x')).toBeNull();
    expect(linkWhatsApp('', 'x')).toBeNull();
    expect(linkWhatsApp('abc', 'x')).toBeNull();
  });
});
```

Run: `npx vitest run tests/mensagem.test.js`
Expected: FAIL (modulo nao existe).

- [ ] **Step 2: Implementar**

```js
import { formatarPreco } from './preco.js';

// O pedido sai como texto simples: o WhatsApp nao renderiza nada alem disso, e
// o dono le a lista, combina pagamento e frete na conversa.
export function montarMensagem(linhas, totalCentavos, nomeLoja) {
  const itens = linhas.map(({ item, produto, subtotal }) => {
    const tamanho = item.tamanho ? `, tam. ${item.tamanho}` : '';
    return `- ${item.qtd}x ${produto.nome} (${produto.tipo})${tamanho}: ${formatarPreco(subtotal)}`;
  });
  return [
    `Oi! Quero fazer um pedido na ${nomeLoja}:`,
    '',
    ...itens,
    '',
    `Total: ${formatarPreco(totalCentavos)}`,
  ].join('\n');
}

// wa.me so aceita digitos, com DDI e DDD. Sem numero configurado devolve null, e
// quem chama mostra o aviso "em desenvolvimento" em vez de abrir um link morto.
export function linkWhatsApp(numero, texto) {
  const digitos = String(numero ?? '').replace(/\D/g, '');
  if (!digitos) return null;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`;
}
```

Run: `npx vitest run tests/mensagem.test.js`
Expected: 5 passed.

Run: `npm test`
Expected: todos os arquivos de teste passam.

- [ ] **Step 3: Commit**

```bash
git add src/lib/mensagem.js tests/mensagem.test.js
git commit -m "feat: mensagem e link do pedido no WhatsApp"
```

---

### Task 7: Base visual: CSS, layout, topo, rodape, gaveta, aviso

**Files:**
- Create: `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/Topo.astro`, `src/components/Rodape.astro`, `src/components/Faixa.astro`, `src/components/Gaveta.astro`, `src/components/Aviso.astro`, `src/scripts/relogio.js`
- Modify: `src/pages/index.astro` (provisoria, ate a Task 8)

**Interfaces:**
- Consumes: `config` (Task 4), `produtos` (Task 4), `img` (Task 3).
- Produces: `Base.astro` com props `{ titulo?: string, descricao?: string }` e um `<slot />` dentro de `<main id="conteudo">`. Na pagina existem sempre: `<dialog id="gaveta">`, `<dialog id="aviso">`, `<script id="catalogo" type="application/json">` com `[{ slug, nome, tipo, preco, tamanhos, imagem }]`, `[data-contador]` (numero no botao CART), `[data-abrir-gaveta]` (botao CART), `[data-em-dev]` (qualquer elemento que deve abrir o aviso).
- Dentro da gaveta: `#gaveta-itens` (`<ul>`), `#gaveta-vazio`, `[data-total]`, `#finalizar` (botao), `[data-fechar-gaveta]`.

- [ ] **Step 1: Escrever `src/styles/global.css`**

```css
/* ── Tokens ── */
:root {
  --papel: oklch(96.5% 0.012 85);
  --papel-2: oklch(92% 0.016 85);
  --tinta: oklch(12% 0.01 258);
  --tinta-2: oklch(38% 0.01 258);
  --vermelho: oklch(48% 0.215 22);
  --vermelho-escuro: oklch(36% 0.17 22);
  --creme: oklch(92% 0.08 95);
  --borda: 3px solid var(--tinta);
  /* cromo Y2K: faixa clara, linha de horizonte escura, reflexo embaixo */
  --cromo: linear-gradient(180deg, #fafafa 0%, #d5d8dd 45%, #9ea3ab 52%, #e8eaed 100%);
  --serifa: 'Times New Roman', Times, serif;
  --gotica: 'UnifrakturCook', 'Times New Roman', serif;
  --mono: ui-monospace, 'Courier New', monospace;
}

/* ── Base ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
img { display: block; max-width: 100%; height: auto; }
a { color: inherit; text-decoration: none; }
button { font: inherit; cursor: pointer; }
:focus-visible { outline: 3px solid var(--vermelho); outline-offset: 2px; }

body {
  background: var(--papel);
  /* retícula de pontos, como a meia-tinta das estampas */
  background-image: radial-gradient(oklch(80% 0.01 85) 1px, transparent 1px);
  background-size: 14px 14px;
  color: var(--tinta);
  font-family: var(--serifa);
  font-size: 1rem;
  line-height: 1.5;
}

.pular {
  position: absolute; left: 0.5rem; top: -4rem; z-index: 100;
  background: var(--tinta); color: #fff; padding: 0.5rem 1rem;
}
.pular:focus { top: 0.5rem; }

.miolo { max-width: 1240px; margin: 0 auto; padding: 0 1.25rem; }
.secao { padding: 3rem 0; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
}

/* ── Pilula de cromo (botoes MENU/CART da referencia, em versao Y2K) ── */
.pilula {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.35rem 0.9rem;
  border: 2px solid var(--tinta); border-radius: 999px;
  background: var(--cromo); color: var(--tinta);
  font: 700 0.7rem var(--mono); letter-spacing: 0.12em; text-transform: uppercase;
  box-shadow: inset 0 1px 0 #fff, 0 2px 0 oklch(30% 0 0);
}
.pilula:hover { background: linear-gradient(180deg, #fff, #e3e5e9 45%, #b3b7be 52%, #f3f4f6); }
.pilula:active { transform: translateY(1px); box-shadow: inset 0 1px 0 #fff; }

/* ── Topo ── */
.topo { position: sticky; top: 0; z-index: 50; background: var(--tinta); color: var(--papel); }
.topo-hud {
  display: flex; justify-content: space-between; gap: 1rem;
  padding: 0.35rem 1.25rem;
  font: 0.62rem/1 var(--mono); letter-spacing: 0.14em; text-transform: uppercase;
  color: oklch(74% 0.01 258);
  border-bottom: 1px solid oklch(26% 0.01 258);
}
.topo-hud b { color: var(--vermelho); font-weight: 700; }
.topo-barra {
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 1rem;
  padding: 0.65rem 1.25rem;
}
.topo-logo img { height: 28px; width: auto; filter: invert(1); }
.topo-nav { display: flex; gap: 1.6rem; list-style: none; }
.topo-nav a {
  font: 0.72rem var(--mono); letter-spacing: 0.15em; text-transform: uppercase;
  color: oklch(80% 0.01 258);
}
.topo-nav a:hover, .topo-nav a[aria-current='page'] { color: #fff; text-decoration: underline; text-underline-offset: 4px; }
.topo-fim { display: flex; justify-content: flex-end; }
.topo .pilula { border-color: oklch(62% 0 0); }

@media (max-width: 700px) {
  .topo-barra { grid-template-columns: 1fr auto; row-gap: 0.5rem; }
  .topo-nav { grid-column: 1 / -1; order: 3; justify-content: center; gap: 1.1rem; }
  .topo-hud span:last-child { display: none; }
}

/* ── Faixa rolando ── */
.faixa {
  background: var(--vermelho); color: #fff; overflow: hidden; white-space: nowrap;
  border-block: var(--borda);
  font: 700 0.85rem var(--mono); letter-spacing: 0.18em; text-transform: uppercase;
}
.faixa-trilho { display: inline-flex; padding: 0.5rem 0; animation: rolar 32s linear infinite; }
.faixa-trilho span { padding-inline: 1.1rem; }
@keyframes rolar { to { transform: translateX(-50%); } }

/* ── Hero ── */
.hero { background: var(--tinta); color: var(--papel); overflow: hidden; }
.hero-miolo {
  max-width: 1240px; margin: 0 auto; min-height: 480px;
  display: grid; grid-template-columns: 1fr 1fr; align-items: center;
}
.hero-corpo { padding: 3.5rem 1.25rem; }
.hero-etiqueta { font: 0.68rem var(--mono); letter-spacing: 0.22em; text-transform: uppercase; color: oklch(74% 0.01 258); margin-bottom: 1.6rem; }
.hero-logo { width: min(300px, 100%); filter: invert(1); margin-bottom: 1.6rem; }
.hero h1 { font: normal 400 clamp(3rem, 7vw, 5.5rem)/0.95 var(--gotica); color: var(--vermelho); margin-bottom: 0.8rem; }
.hero-sub { max-width: 34ch; color: oklch(80% 0.01 258); margin-bottom: 2rem; }
.hero-arte {
  position: relative; align-self: stretch; display: flex; align-items: center; justify-content: center;
  background-image:
    linear-gradient(oklch(20% 0.01 258 / 0.7) 1px, transparent 1px),
    linear-gradient(90deg, oklch(20% 0.01 258 / 0.7) 1px, transparent 1px);
  background-size: 44px 44px;
}
.hero-arte img { max-width: 560px; padding: 1.25rem; }
@media (max-width: 860px) {
  .hero-miolo { grid-template-columns: 1fr; }
  .hero-arte { display: none; }
}

/* ── Botao ── */
.botao {
  display: inline-block; padding: 0.75rem 1.9rem;
  background: var(--vermelho); color: #fff;
  border: var(--borda); border-color: var(--tinta);
  box-shadow: 4px 4px 0 var(--tinta);
  font: 700 0.78rem var(--mono); letter-spacing: 0.15em; text-transform: uppercase;
  transition: transform 0.12s, box-shadow 0.12s;
}
.hero .botao { border-color: #fff; box-shadow: 4px 4px 0 #fff; }
.botao:hover { background: var(--vermelho-escuro); transform: translate(-2px, -2px); box-shadow: 6px 6px 0 var(--tinta); }
.botao:disabled { background: var(--tinta-2); cursor: not-allowed; transform: none; box-shadow: none; }

/* ── Secao ── */
.cabeca { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; border-bottom: var(--borda); padding-bottom: 0.6rem; margin-bottom: 1.6rem; }
.cabeca h2 { font: italic 700 clamp(1.7rem, 3vw, 2.4rem)/1.1 var(--serifa); }
.cabeca-contagem { font: 0.8rem var(--mono); letter-spacing: 0.1em; color: var(--tinta-2); }
.cabeca-mais { font: 700 0.72rem var(--mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--vermelho); }
.cabeca-mais:hover { text-decoration: underline; }
.legenda { color: var(--tinta-2); margin: -0.8rem 0 1.6rem; }
.estrelas { font: 1rem var(--mono); letter-spacing: 0.3em; color: var(--tinta); }

/* ── Categorias (circulos) ── */
.cats { display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; padding: 2rem 1.25rem; border-bottom: var(--borda); background: var(--papel-2); }
.cat { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; transition: transform 0.2s; }
.cat:hover { transform: translateY(-3px); }
.cat-anel { width: 84px; height: 84px; border-radius: 50%; border: var(--borda); overflow: hidden; background: var(--creme); box-shadow: 3px 3px 0 var(--tinta); }
.cat-anel img { width: 100%; height: 100%; object-fit: cover; }
.cat-nome { font: 700 0.7rem var(--mono); letter-spacing: 0.15em; text-transform: uppercase; }

/* ── Trilho horizontal (novidades) ── */
.trilho { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(240px, 280px); gap: 1.25rem; overflow-x: auto; padding: 0.5rem 0.5rem 1.25rem 0; scroll-snap-type: x proximity; }
.trilho > * { scroll-snap-align: start; }

/* ── Grades ── */
.grade { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }

/* ── Cartao de produto ── */
.cartao { position: relative; display: flex; flex-direction: column; background: var(--papel); border: var(--borda); box-shadow: 5px 5px 0 var(--tinta); transition: transform 0.15s, box-shadow 0.15s; }
.cartao:hover { transform: translate(-2px, -2px); box-shadow: 7px 7px 0 var(--tinta); }
/* a ponta do adesivo descolando no canto: cresce no hover */
.cartao::after {
  content: ''; position: absolute; right: -3px; bottom: -3px; width: 0; height: 0;
  background: linear-gradient(135deg, transparent 50%, #c9ccd1 50%, #fff);
  border-top-left-radius: 6px; transition: width 0.18s, height 0.18s;
}
.cartao:hover::after { width: 30px; height: 30px; }
.cartao-foto { aspect-ratio: 1; background: var(--creme); border-bottom: var(--borda); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.cartao-foto img { width: 100%; height: 100%; object-fit: contain; padding: 0.6rem; }
.cartao-info { padding: 0.8rem 0.9rem 1rem; display: flex; flex-direction: column; gap: 0.15rem; }
.cartao-etiqueta { font: 0.66rem var(--mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--tinta-2); }
.cartao-nome { font: italic 700 1.15rem/1.2 var(--serifa); }
.cartao-edicao { font: 0.66rem var(--mono); letter-spacing: 0.1em; color: var(--vermelho); }
.cartao-preco { font: 700 0.95rem var(--mono); margin-top: 0.3rem; }
.selo { align-self: flex-start; padding: 0.1rem 0.5rem; margin-bottom: 0.3rem; font: 700 0.62rem var(--mono); letter-spacing: 0.12em; text-transform: uppercase; color: #fff; }
.selo-novo { background: var(--tinta); }
.selo-destaque { background: var(--vermelho); }

/* ── Pagina de produto ── */
.produto { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 2.5rem; padding: 2.5rem 0 3.5rem; align-items: start; }
.produto-foto { background: var(--creme); border: var(--borda); box-shadow: 6px 6px 0 var(--tinta); }
.produto-foto img { width: 100%; height: auto; padding: 1rem; }
.produto-trilha { font: 0.72rem var(--mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--tinta-2); margin-bottom: 1rem; }
.produto-trilha a:hover { color: var(--vermelho); text-decoration: underline; }
.produto h1 { font: italic 700 clamp(2rem, 4vw, 3rem)/1.05 var(--serifa); margin: 0.4rem 0; }
.produto-tipo { font: 0.8rem var(--mono); letter-spacing: 0.16em; text-transform: uppercase; color: var(--tinta-2); }
.produto-preco { font: 700 1.6rem var(--mono); margin: 1rem 0 1.4rem; }
.specs { margin-top: 1.6rem; border-top: var(--borda); padding-top: 1rem; display: grid; grid-template-columns: auto 1fr; gap: 0.3rem 1.2rem; font: 0.85rem var(--mono); }
.specs dt { color: var(--tinta-2); text-transform: uppercase; letter-spacing: 0.1em; }
.compra { display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; }
.tamanhos { border: 0; display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tamanhos legend { font: 700 0.72rem var(--mono); letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 0.5rem; }
.tamanho input { position: absolute; opacity: 0; }
.tamanho span { display: inline-block; min-width: 3rem; text-align: center; padding: 0.5rem 0.8rem; border: var(--borda); background: var(--papel); font: 700 0.85rem var(--mono); cursor: pointer; }
.tamanho input:checked + span { background: var(--tinta); color: #fff; }
.tamanho input:focus-visible + span { outline: 3px solid var(--vermelho); outline-offset: 2px; }
.qtd { display: flex; align-items: center; gap: 0.7rem; font: 700 0.72rem var(--mono); letter-spacing: 0.14em; text-transform: uppercase; }
.qtd input { width: 4.5rem; padding: 0.45rem; border: var(--borda); background: var(--papel); font: 700 1rem var(--mono); text-align: center; }
.erro { min-height: 1.2em; color: var(--vermelho); font: 700 0.8rem var(--mono); }
@media (max-width: 800px) { .produto { grid-template-columns: 1fr; gap: 1.5rem; } }

/* ── Rodape ── */
.rodape { background: var(--tinta); color: oklch(78% 0.01 258); margin-top: 2rem; }
.rodape-grade { max-width: 1240px; margin: 0 auto; padding: 2.5rem 1.25rem; display: grid; grid-template-columns: 1.6fr 1fr 1fr; gap: 2rem; }
.rodape img { height: 26px; width: auto; filter: invert(1); margin-bottom: 0.8rem; }
.rodape h2 { font: 700 0.7rem var(--mono); letter-spacing: 0.17em; text-transform: uppercase; color: #fff; margin-bottom: 0.8rem; }
.rodape ul { list-style: none; display: flex; flex-direction: column; gap: 0.45rem; }
.rodape a, .rodape button { font: 0.85rem var(--serifa); color: oklch(82% 0.01 258); background: none; border: 0; padding: 0; text-align: left; }
.rodape a:hover, .rodape button:hover { color: #fff; text-decoration: underline; }
.rodape-base { border-top: 1px solid oklch(26% 0.01 258); padding: 0.9rem 1.25rem; text-align: center; font: 0.68rem var(--mono); letter-spacing: 0.1em; }
@media (max-width: 700px) { .rodape-grade { grid-template-columns: 1fr; } }

/* ── Dialogos: gaveta do carrinho e aviso ── */
.gaveta::backdrop, .aviso::backdrop { background: oklch(10% 0.01 258 / 0.6); }
.gaveta {
  margin: 0 0 0 auto; height: 100dvh; max-height: none; width: min(420px, 100vw);
  border: 0; border-left: var(--borda); background: var(--papel); color: var(--tinta); padding: 0;
}
.gaveta[open] { display: flex; flex-direction: column; }
.gaveta-topo { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: var(--borda); background: var(--creme); }
.gaveta-topo h2 { font: italic 700 1.5rem var(--serifa); }
.gaveta-lista { list-style: none; flex: 1; overflow-y: auto; padding: 0.5rem 1.25rem; }
.gaveta-vazio { padding: 2rem 1.25rem; color: var(--tinta-2); }
.gaveta-item { display: grid; grid-template-columns: 72px 1fr; gap: 0.8rem; padding: 0.9rem 0; border-bottom: 1px solid var(--papel-2); }
.gaveta-item img { width: 72px; height: 72px; object-fit: contain; background: var(--creme); border: 2px solid var(--tinta); }
.gaveta-nome { font: italic 700 1rem/1.2 var(--serifa); }
.gaveta-meta { font: 0.7rem var(--mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--tinta-2); }
.gaveta-linha { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.4rem; font: 700 0.9rem var(--mono); }
.gaveta-linha .preco { margin-left: auto; }
.mini { width: 1.9rem; height: 1.9rem; border: 2px solid var(--tinta); background: var(--papel); font: 700 1rem/1 var(--mono); }
.mini:hover { background: var(--tinta); color: #fff; }
.remover { font: 0.7rem var(--mono); letter-spacing: 0.08em; text-transform: uppercase; background: none; border: 0; color: var(--vermelho); text-decoration: underline; }
.gaveta-fim { padding: 1rem 1.25rem; border-top: var(--borda); background: var(--creme); display: flex; flex-direction: column; gap: 0.8rem; }
.gaveta-total { display: flex; justify-content: space-between; font: 700 1.1rem var(--mono); }
.gaveta-fim .botao { width: 100%; text-align: center; }

.aviso { margin: auto; max-width: min(420px, 92vw); padding: 1.5rem; border: var(--borda); background: var(--creme); box-shadow: 6px 6px 0 var(--tinta); }
.aviso h2 { font: italic 700 1.6rem var(--serifa); margin-bottom: 0.5rem; }
.aviso p { margin-bottom: 1.2rem; }
```

- [ ] **Step 2: Criar `src/scripts/relogio.js`**

```js
// Relogio do topo, em horario de Brasilia. O HTML ja traz "--:--:--", entao
// quem abre sem JavaScript ve um mostrador parado e nao um buraco.
const alvos = document.querySelectorAll('[data-relogio]');

if (alvos.length > 0) {
  const formato = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    timeZone: 'America/Sao_Paulo',
  });
  const tic = () => {
    const agora = formato.format(new Date());
    for (const alvo of alvos) alvo.textContent = agora;
  };
  tic();
  setInterval(tic, 1000);
}
```

- [ ] **Step 3: Criar os componentes**

`src/components/Topo.astro`:

```astro
---
import { img } from '../lib/imagens.js';
import { CATEGORIAS } from '../lib/catalogo.js';

const logo = img('logo');
const atual = Astro.url.pathname.split('/').filter(Boolean)[0];
---
<header class="topo">
  <div class="topo-hud" aria-hidden="true">
    <span><b>●</b> GARAGE ABERTA</span>
    <span>SÃO PAULO <span data-relogio>--:--:--</span></span>
  </div>
  <div class="topo-barra">
    <a class="topo-logo" href="/" aria-label="BOBOYA garage, página inicial">
      <img src={logo.src} width={logo.width} height={logo.height} alt="BOBOYA garage" />
    </a>
    <nav aria-label="Categorias">
      <ul class="topo-nav">
        {Object.entries(CATEGORIAS).map(([slug, c]) => (
          <li><a href={`/${slug}/`} aria-current={atual === slug ? 'page' : undefined}>{c.titulo}</a></li>
        ))}
      </ul>
    </nav>
    <div class="topo-fim">
      <button class="pilula" type="button" data-abrir-gaveta aria-haspopup="dialog">
        Carrinho (<span data-contador>0</span>)
      </button>
    </div>
  </div>
</header>
```

Nota: o HUD diz "SÃO PAULO" porque o relogio usa `America/Sao_Paulo`. Se o Luiz preferir outra cidade, trocar o texto e o `timeZone` em `relogio.js` juntos.

`src/components/Faixa.astro`:

```astro
---
const frases = ['★ BOBOYA GARAGE', '現実核爆弾', '★ ADESIVOS DE CARRO', '☆☆☆☆☆☆☆☆', '★ CAMISETAS', '× × × × ×', '★ DECORATIVOS', '現実核爆弾'];
---
<div class="faixa" aria-hidden="true">
  <div class="faixa-trilho">
    {[0, 1].map(() => frases.map((f) => <span>{f}</span>))}
  </div>
</div>
```

`src/components/Aviso.astro`:

```astro
<dialog id="aviso" class="aviso" aria-labelledby="aviso-titulo">
  <h2 id="aviso-titulo">Em desenvolvimento</h2>
  <p>Essa parte da loja ainda não está pronta. Volta em breve.</p>
  <form method="dialog"><button class="botao" type="submit">Entendi</button></form>
</dialog>
```

`src/components/Gaveta.astro`:

```astro
<dialog id="gaveta" class="gaveta" aria-labelledby="gaveta-titulo">
  <div class="gaveta-topo">
    <h2 id="gaveta-titulo">Carrinho</h2>
    <button class="pilula" type="button" data-fechar-gaveta>Fechar</button>
  </div>
  <p class="gaveta-vazio" id="gaveta-vazio">Seu carrinho está vazio.</p>
  <ul class="gaveta-lista" id="gaveta-itens" hidden></ul>
  <div class="gaveta-fim">
    <div class="gaveta-total"><span>Total</span><span data-total>R$ 0,00</span></div>
    <button class="botao" type="button" id="finalizar" disabled>Finalizar no WhatsApp</button>
  </div>
</dialog>
```

`src/components/Rodape.astro`:

```astro
---
import { img } from '../lib/imagens.js';
import { CATEGORIAS } from '../lib/catalogo.js';
import { config } from '../config.js';

const logo = img('logo');
---
<footer class="rodape">
  <div class="rodape-grade">
    <div>
      <img src={logo.src} width={logo.width} height={logo.height} alt="BOBOYA garage" loading="lazy" />
      <p class="estrelas" aria-hidden="true">☆☆☆☆☆☆☆</p>
    </div>
    <div>
      <h2>Produtos</h2>
      <ul>
        {Object.entries(CATEGORIAS).map(([slug, c]) => <li><a href={`/${slug}/`}>{c.titulo}</a></li>)}
      </ul>
    </div>
    <div>
      <h2>Contato</h2>
      <ul>
        <li>
          {config.instagram
            ? <a href={config.instagram} target="_blank" rel="noopener">Instagram</a>
            : <button type="button" data-em-dev>Instagram</button>}
        </li>
        <li>
          {config.whatsapp
            ? <a href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener">WhatsApp</a>
            : <button type="button" data-em-dev>WhatsApp</button>}
        </li>
      </ul>
    </div>
  </div>
  <p class="rodape-base">© 2026 BOBOYA garage</p>
</footer>
```

- [ ] **Step 4: Criar `src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';
import Topo from '../components/Topo.astro';
import Rodape from '../components/Rodape.astro';
import Gaveta from '../components/Gaveta.astro';
import Aviso from '../components/Aviso.astro';
import { config } from '../config.js';
import { produtos } from '../lib/catalogo.js';
import { img } from '../lib/imagens.js';

const {
  titulo = config.nome,
  descricao = 'Adesivos de carro, camisetas e decorativos de anime e cultura geek. Merch Y2K da BOBOYA garage.',
} = Astro.props;

// O navegador precisa do catalogo pra montar o carrinho (nome, tipo, preco, foto).
// So vai o que a gaveta usa, e o preco vem daqui: nunca do localStorage.
const catalogoCliente = produtos.map((p) => ({
  slug: p.slug,
  nome: p.nome,
  tipo: p.tipo,
  preco: p.preco,
  tamanhos: p.tamanhos,
  imagem: img(p.imagens[0], { mini: true }).src,
}));
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{titulo}</title>
    <meta name="description" content={descricao} />
    <meta name="theme-color" content="#161616" />
    <meta property="og:title" content={titulo} />
    <meta property="og:description" content={descricao} />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <a class="pular" href="#conteudo">Ir para o conteúdo</a>
    <Topo />
    <main id="conteudo"><slot /></main>
    <Rodape />
    <Gaveta />
    <Aviso />
    <script id="catalogo" type="application/json" set:html={JSON.stringify(catalogoCliente)} />
    <script>
      import '../scripts/relogio.js';
    </script>
  </body>
</html>
```

Nota: o og:image fica de fora ate o dominio existir (precisa de URL absoluta). A fonte UnifrakturCook vem do Google Fonts; se falhar, cai em serifada.

- [ ] **Step 5: Pagina provisoria para ver a base**

Substituir `src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import Faixa from '../components/Faixa.astro';
---
<Base>
  <Faixa />
  <div class="miolo secao"><h2>Em construção</h2></div>
</Base>
```

- [ ] **Step 6: Verificar no navegador**

Run: `npm run texto`
Expected: `sem travessao`.

Iniciar o preview: `preview_start` com `{ name: "boboya" }`. Depois conferir:
- `read_console_messages` com `onlyErrors: true`: nenhum erro.
- Screenshot da home: topo preto com HUD e relogio andando, logo branca invertida, pilula de cromo "CARRINHO (0)", faixa vermelha rolando, rodape escuro.
- `javascript_tool`: `document.getElementById('gaveta').showModal()` abre a gaveta a direita; `Esc` fecha. `document.getElementById('aviso').showModal()` abre o aviso.
- `resize_window` `mobile` (375x812): topo vira duas linhas, sem rolagem horizontal da pagina. Voltar com `preset: "desktop"`.

- [ ] **Step 7: Commit**

```bash
git add src/styles src/layouts src/components src/scripts/relogio.js src/pages/index.astro
git commit -m "feat: base visual com topo, rodape, gaveta e aviso"
```

---

### Task 8: Paginas da loja

**Files:**
- Create: `src/components/Hero.astro`, `src/components/CartaoProduto.astro`, `src/pages/[categoria].astro`, `src/pages/produto/[slug].astro`, `src/pages/404.astro`
- Modify: `src/pages/index.astro` (versao final)

**Interfaces:**
- Consumes: `Base` (Task 7), `produtos`, `CATEGORIAS`, `porCategoria`, `comSelo` (Task 4), `img` (Task 3), `formatarPreco` (Task 3).
- Produces: rotas `/`, `/adesivos/`, `/camisetas/`, `/decorativos/`, `/produto/<slug>/` (10 paginas), `/404.html`. O formulario de compra da pagina de produto: `<form data-form-produto data-slug="...">` com `input[name=tamanho]` (radio, so se o produto tem tamanhos), `input[name=qtd]`, `[data-erro]` e botao `type=submit`. A Task 9 liga esse formulario.

- [ ] **Step 1: `src/components/CartaoProduto.astro`**

```astro
---
import { img } from '../lib/imagens.js';
import { formatarPreco } from '../lib/preco.js';

const { produto, prioridade = false } = Astro.props;
const foto = img(produto.imagens[0], { mini: true });
---
<a class="cartao" href={`/produto/${produto.slug}/`}>
  <div class="cartao-foto">
    <img
      src={foto.src} width={foto.width} height={foto.height}
      alt={`${produto.nome}, ${produto.tipo}`}
      loading={prioridade ? 'eager' : 'lazy'} decoding="async"
    />
  </div>
  <div class="cartao-info">
    {produto.selo && <span class={`selo selo-${produto.selo}`}>{produto.selo}</span>}
    <p class="cartao-etiqueta">{produto.tipo}</p>
    <h3 class="cartao-nome">{produto.nome}</h3>
    {produto.edicao && <p class="cartao-edicao">EDIÇÃO DE {produto.edicao}</p>}
    <p class="cartao-preco">{formatarPreco(produto.preco)}</p>
  </div>
</a>
```

- [ ] **Step 2: `src/components/Hero.astro`**

```astro
---
import { img } from '../lib/imagens.js';

const logo = img('logo');
const arte = img('reimu');
---
<section class="hero">
  <div class="hero-miolo">
    <div class="hero-corpo">
      <p class="hero-etiqueta">Adesivos de carro ★ Camisetas ★ Decorativos</p>
      <img class="hero-logo" src={logo.src} width={logo.width} height={logo.height} alt="BOBOYA garage" />
      <h1>garage merch</h1>
      <p class="hero-sub">Anime, cultura geek e estética Y2K, em adesivo, camiseta e coisa de casa.</p>
      <a class="botao" href="/adesivos/">Ver adesivos</a>
    </div>
    <div class="hero-arte">
      <img src={arte.src} width={arte.width} height={arte.height} alt="Reimu Hakurei, estampa 現実核爆弾" />
    </div>
  </div>
</section>
```

- [ ] **Step 3: `src/pages/index.astro` (final)**

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import Faixa from '../components/Faixa.astro';
import CartaoProduto from '../components/CartaoProduto.astro';
import { img } from '../lib/imagens.js';
import { produtos, CATEGORIAS, porCategoria, comSelo } from '../lib/catalogo.js';

const capas = { adesivos: 'mock_a0', camisetas: 'mock_t1', decorativos: 'mock_d0' };
const novos = comSelo('novo');
const dois = (n) => String(n).padStart(2, '0');
---
<Base>
  <Hero />
  <Faixa />

  <nav class="cats" aria-label="Categorias">
    {Object.entries(CATEGORIAS).map(([slug, c]) => {
      const foto = img(capas[slug], { mini: true });
      return (
        <a class="cat" href={`/${slug}/`}>
          <span class="cat-anel"><img src={foto.src} width={foto.width} height={foto.height} alt="" /></span>
          <span class="cat-nome">{c.titulo}</span>
        </a>
      );
    })}
  </nav>

  <div class="miolo">
    <section class="secao" aria-labelledby="novidades">
      <div class="cabeca">
        <h2 id="novidades">Novidades</h2>
        <span class="cabeca-contagem">{dois(novos.length)}/{dois(produtos.length)}</span>
      </div>
      <div class="trilho">
        {novos.map((p) => <CartaoProduto produto={p} />)}
      </div>
    </section>

    {Object.entries(CATEGORIAS).map(([slug, c]) => (
      <section class="secao" style="padding-top:0" aria-labelledby={`sec-${slug}`}>
        <div class="cabeca">
          <h2 id={`sec-${slug}`}>{c.titulo}</h2>
          <a class="cabeca-mais" href={`/${slug}/`}>Ver todos</a>
        </div>
        <div class="grade">
          {porCategoria(slug).map((p) => <CartaoProduto produto={p} />)}
        </div>
      </section>
    ))}
  </div>
</Base>
```

- [ ] **Step 4: `src/pages/[categoria].astro`**

```astro
---
import Base from '../layouts/Base.astro';
import CartaoProduto from '../components/CartaoProduto.astro';
import { CATEGORIAS, porCategoria } from '../lib/catalogo.js';

export function getStaticPaths() {
  return Object.keys(CATEGORIAS).map((categoria) => ({ params: { categoria } }));
}

const { categoria } = Astro.params;
const info = CATEGORIAS[categoria];
const itens = porCategoria(categoria);
---
<Base titulo={`${info.titulo} | BOBOYA garage`} descricao={info.legenda}>
  <div class="miolo secao">
    <div class="cabeca">
      <h1 style="font:italic 700 clamp(1.7rem,3vw,2.4rem)/1.1 var(--serifa)">{info.titulo}</h1>
      <span class="cabeca-contagem">{itens.length} itens</span>
    </div>
    <p class="legenda">{info.legenda}</p>
    <div class="grade">
      {itens.map((p, i) => <CartaoProduto produto={p} prioridade={i < 4} />)}
    </div>
  </div>
</Base>
```

- [ ] **Step 5: `src/pages/produto/[slug].astro`**

```astro
---
import Base from '../../layouts/Base.astro';
import { produtos, CATEGORIAS } from '../../lib/catalogo.js';
import { img } from '../../lib/imagens.js';
import { formatarPreco } from '../../lib/preco.js';

export function getStaticPaths() {
  return produtos.map((produto) => ({ params: { slug: produto.slug }, props: { produto } }));
}

const { produto } = Astro.props;
const foto = img(produto.imagens[0]);
const categoria = CATEGORIAS[produto.categoria];
const specs = produto.specs ? Object.entries(produto.specs) : [];
---
<Base titulo={`${produto.nome}, ${produto.tipo} | BOBOYA garage`} descricao={`${produto.nome}, ${produto.tipo}, por ${formatarPreco(produto.preco)}.`}>
  <div class="miolo produto">
    <div class="produto-foto">
      <img src={foto.src} width={foto.width} height={foto.height} alt={`${produto.nome}, ${produto.tipo}`} />
    </div>
    <div>
      <p class="produto-trilha"><a href="/">Início</a> / <a href={`/${produto.categoria}/`}>{categoria.titulo}</a></p>
      {produto.selo && <span class={`selo selo-${produto.selo}`}>{produto.selo}</span>}
      <p class="produto-tipo">{produto.tipo}</p>
      <h1>{produto.nome}</h1>
      {produto.edicao && <p class="cartao-edicao">EDIÇÃO DE {produto.edicao}</p>}
      <p class="produto-preco">{formatarPreco(produto.preco)}</p>

      <form class="compra" data-form-produto data-slug={produto.slug} novalidate>
        {produto.tamanhos.length > 0 && (
          <fieldset class="tamanhos">
            <legend>Tamanho</legend>
            {produto.tamanhos.map((t) => (
              <label class="tamanho"><input type="radio" name="tamanho" value={t} /><span>{t}</span></label>
            ))}
          </fieldset>
        )}
        <label class="qtd">Quantidade
          <input type="number" name="qtd" value="1" min="1" max="99" inputmode="numeric" />
        </label>
        <p class="erro" data-erro role="alert"></p>
        <button class="botao" type="submit">Adicionar ao carrinho</button>
      </form>

      {specs.length > 0 && (
        <dl class="specs">
          {specs.map(([nome, valor]) => (<><dt>{nome}</dt><dd>{valor}</dd></>))}
        </dl>
      )}
    </div>
  </div>
</Base>
```

- [ ] **Step 6: `src/pages/404.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base titulo="Página não encontrada | BOBOYA garage">
  <div class="miolo secao">
    <p class="estrelas" aria-hidden="true">☆☆☆☆☆☆</p>
    <div class="cabeca"><h1 style="font:italic 700 2.4rem var(--serifa)">Essa página não existe</h1></div>
    <p class="legenda" style="margin-top:0">O endereço mudou ou nunca existiu.</p>
    <a class="botao" href="/">Voltar para a loja</a>
  </div>
</Base>
```

- [ ] **Step 7: Build e checagem das rotas**

Run: `npm run build`
Expected: `sem travessao`, depois `Complete!`.

Run: `ls dist dist/produto`
Expected: `index.html`, `404.html`, `adesivos/`, `camisetas/`, `decorativos/` e 10 pastas em `dist/produto/`.

- [ ] **Step 8: Verificar no navegador**

`preview_start` `{ name: "boboya" }`. Conferir:
- Home: hero com a Reimu a direita, faixa, 3 circulos de categoria, "Novidades" com contador `06/10` e trilho, e as 3 secoes (adesivos primeiro).
- `read_console_messages` `onlyErrors`: nenhum erro, e nenhuma imagem 404 em `read_network_requests` (filtro `urlPattern: "/img/"`).
- `/adesivos/` mostra 3 cards; `/camisetas/` 3; `/decorativos/` 4.
- `/produto/reimu-bumper-sticker/`: foto grande, selo NOVO, preco `R$ 19,90`, campo de quantidade, botao. Sem seletor de tamanho (lista vazia).
- `/rota-que-nao-existe/`: pagina 404 no estilo.
- Mobile 375px: sem rolagem horizontal da pagina (o trilho de novidades rola so dentro dele).
- Hover num cartao: ele sobe e a ponta do adesivo aparece no canto.

- [ ] **Step 9: Commit**

```bash
git add src/components src/pages
git commit -m "feat: home, categorias, pagina de produto e 404"
```

---

### Task 9: Carrinho no navegador e aviso "em desenvolvimento"

**Files:**
- Create: `src/scripts/carrinho-ui.js`
- Modify: `src/layouts/Base.astro` (importar o script)

**Interfaces:**
- Consumes: `carregar`, `salvar` (Task 5, `armazenamento.js`); `adicionar`, `alterarQtd`, `remover`, `linhas`, `totalCentavos`, `quantidadeTotal` (`carrinho.js`); `formatarPreco`; `montarMensagem`, `linkWhatsApp`; `config`. DOM da Task 7 (`#gaveta`, `#aviso`, `#gaveta-itens`, `#gaveta-vazio`, `#finalizar`, `[data-total]`, `[data-contador]`, `[data-abrir-gaveta]`, `[data-fechar-gaveta]`, `[data-em-dev]`, `#catalogo`) e da Task 8 (`[data-form-produto]`).

- [ ] **Step 1: Escrever `src/scripts/carrinho-ui.js`**

```js
// Liga a logica pura do carrinho ao DOM. Nada de regra de negocio aqui: soma,
// limite e mensagem moram em src/lib e tem teste. Este arquivo so desenha e
// escuta cliques, e por isso e testado olhando a loja funcionar.
import { config } from '../config.js';
import { carregar, salvar } from '../lib/armazenamento.js';
import { adicionar, alterarQtd, remover, linhas, totalCentavos, quantidadeTotal } from '../lib/carrinho.js';
import { formatarPreco } from '../lib/preco.js';
import { montarMensagem, linkWhatsApp } from '../lib/mensagem.js';

const catalogo = JSON.parse(document.getElementById('catalogo').textContent);
const gaveta = document.getElementById('gaveta');
const aviso = document.getElementById('aviso');
const lista = document.getElementById('gaveta-itens');
const vazio = document.getElementById('gaveta-vazio');
const finalizar = document.getElementById('finalizar');

let carrinho = carregar(catalogo);

// Monta um elemento sem innerHTML: nome de produto entra como texto, nunca como HTML.
function el(tag, props = {}, ...filhos) {
  const no = Object.assign(document.createElement(tag), props);
  no.append(...filhos);
  return no;
}

function botaoMini(rotulo, acao, slug, tamanho, texto) {
  const b = el('button', { type: 'button', className: 'mini', textContent: texto });
  b.setAttribute('aria-label', rotulo);
  b.dataset.acao = acao;
  b.dataset.slug = slug;
  b.dataset.tamanho = tamanho ?? '';
  return b;
}

function desenhar() {
  const ls = linhas(carrinho, catalogo);
  for (const alvo of document.querySelectorAll('[data-contador]')) alvo.textContent = String(quantidadeTotal(carrinho));
  for (const alvo of document.querySelectorAll('[data-total]')) alvo.textContent = formatarPreco(totalCentavos(carrinho, catalogo));

  lista.replaceChildren(...ls.map(({ item, produto, subtotal }) => {
    const miniatura = el('img', { src: produto.imagem, alt: '', width: 72, height: 72 });
    const meta = [produto.tipo, item.tamanho ? `tam. ${item.tamanho}` : null].filter(Boolean).join(' · ');
    const remove = el('button', { type: 'button', className: 'remover', textContent: 'remover' });
    remove.dataset.acao = 'remover';
    remove.dataset.slug = item.slug;
    remove.dataset.tamanho = item.tamanho ?? '';
    return el('li', { className: 'gaveta-item' },
      miniatura,
      el('div', {},
        el('p', { className: 'gaveta-nome', textContent: produto.nome }),
        el('p', { className: 'gaveta-meta', textContent: meta }),
        el('div', { className: 'gaveta-linha' },
          botaoMini(`Diminuir ${produto.nome}`, 'menos', item.slug, item.tamanho, '−'),
          el('span', { textContent: String(item.qtd) }),
          botaoMini(`Aumentar ${produto.nome}`, 'mais', item.slug, item.tamanho, '+'),
          remove,
          el('span', { className: 'preco', textContent: formatarPreco(subtotal) }),
        ),
      ),
    );
  }));

  lista.hidden = ls.length === 0;
  vazio.hidden = ls.length > 0;
  finalizar.disabled = ls.length === 0;
}

function mudar(novo) {
  carrinho = novo;
  salvar(carrinho);
  desenhar();
}

function abrirGaveta() {
  if (!gaveta.open) gaveta.showModal();
}

// ── Gaveta ──
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-abrir-gaveta]')) abrirGaveta();
  if (e.target.closest('[data-fechar-gaveta]')) gaveta.close();
  if (e.target.closest('[data-em-dev]')) aviso.showModal();
});

// Clique no fundo escuro (o proprio <dialog>, fora do conteudo) fecha.
for (const d of [gaveta, aviso]) {
  d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
}

lista.addEventListener('click', (e) => {
  const b = e.target.closest('[data-acao]');
  if (!b) return;
  const { acao, slug } = b.dataset;
  const tamanho = b.dataset.tamanho || null;
  if (acao === 'mais') mudar(alterarQtd(carrinho, slug, tamanho, 1));
  if (acao === 'menos') mudar(alterarQtd(carrinho, slug, tamanho, -1));
  if (acao === 'remover') mudar(remover(carrinho, slug, tamanho));
});

// ── Pagina de produto ──
for (const form of document.querySelectorAll('[data-form-produto]')) {
  const erro = form.querySelector('[data-erro]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const dados = new FormData(form);
    const produto = catalogo.find((p) => p.slug === form.dataset.slug);
    const tamanho = dados.get('tamanho');
    if (produto.tamanhos.length > 0 && !tamanho) {
      erro.textContent = 'Escolha um tamanho.';
      return;
    }
    const qtd = Math.max(1, Math.min(99, parseInt(dados.get('qtd'), 10) || 1));
    erro.textContent = '';
    mudar(adicionar(carrinho, { slug: produto.slug, tamanho: tamanho || null, qtd }));
    abrirGaveta();
  });
}

// ── Finalizar ──
finalizar.addEventListener('click', () => {
  const ls = linhas(carrinho, catalogo);
  if (ls.length === 0) return;
  const link = linkWhatsApp(config.whatsapp, montarMensagem(ls, totalCentavos(carrinho, catalogo), config.nome));
  if (link) window.open(link, '_blank', 'noopener');
  else aviso.showModal();
});

// Outra aba mexeu no carrinho: acompanha.
window.addEventListener('storage', () => {
  carrinho = carregar(catalogo);
  desenhar();
});

desenhar();
```

- [ ] **Step 2: Importar o script no layout**

Em `src/layouts/Base.astro`, trocar o bloco `<script>` do final por:

```astro
    <script>
      import '../scripts/relogio.js';
      import '../scripts/carrinho-ui.js';
    </script>
```

- [ ] **Step 3: Verificar no navegador (fluxo completo)**

`preview_start` `{ name: "boboya" }`, em `/produto/reimu-bumper-sticker/`:
1. Clicar "Adicionar ao carrinho": a gaveta abre, mostra "Reimu 現実核爆弾", `Bumper Sticker`, qtd 1, `R$ 19,90`; o topo mostra `CARRINHO (1)`.
2. Fechar, ir para `/produto/marisa-pack-adesivos/`, mudar quantidade para 2, adicionar. Total da gaveta: `R$ 65,70` (19,90 + 2 x 22,90 = 65,70). Contador `3`.
3. Botao `+` sobe a quantidade, `−` ate zero remove a linha, "remover" tira a linha.
4. Recarregar a pagina (`navigate` na mesma URL): o carrinho persiste, com contador e total certos.
5. Com itens no carrinho, clicar "Finalizar no WhatsApp": abre o aviso "Em desenvolvimento", **sem navegar**, e o carrinho segue intacto. "Entendi" fecha.
6. Carrinho vazio: "Finalizar" fica desabilitado e a gaveta mostra "Seu carrinho esta vazio."
7. Rodape: clicar "Instagram" e "WhatsApp" abre o aviso.
8. Teclado: `Tab` ate "Carrinho" + `Enter` abre; o foco fica preso na gaveta; `Esc` fecha e o foco volta ao botao CART.
9. `javascript_tool`: `localStorage.setItem('boboya:carrinho','{lixo')` e recarregar: a loja abre normal, carrinho vazio, sem erro no console.
10. Teste do link real (so para conferir, nao deixar no codigo): `javascript_tool` nao altera `config`. Para ver o WhatsApp funcionando, trocar `whatsapp: null` por `'5541999999999'` em `src/config.js`, clicar "Finalizar" e conferir que abre `https://wa.me/5541999999999?text=...` com a lista; **depois voltar `config.js` para `null`**.
11. `read_console_messages` `onlyErrors`: nenhum erro durante todo o fluxo.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/carrinho-ui.js src/layouts/Base.astro
git commit -m "feat: carrinho em gaveta, persistencia e aviso em desenvolvimento"
```

---

### Task 10: README e verificacao final

**Files:**
- Create: `README.md`
- Modify: nenhum codigo, a menos que a verificacao ache problema.

- [ ] **Step 1: `README.md`**

````markdown
# BOBOYA garage, loja

Loja estatica de merch (adesivos de carro, camisetas, decorativos). Astro, sem
framework no cliente. Publicada no Cloudflare Pages.

## Rodar

```bash
npm install
npm run dev       # http://localhost:4321
npm test          # logica do carrinho, preco, mensagem, catalogo
npm run build     # falha se algum texto tiver travessao
```

No PowerShell, se a politica de execucao bloquear o `npm`, use `npm.cmd`.

## Mudar produto ou preco

Edite `src/data/produtos.json`. O preco e em **centavos** (`6990` = R$ 69,90).
Campos: `nome` e `tipo` ficam separados (a loja nao usa travessao). `selo` e
`novo`, `destaque` ou `null`. `tamanhos` vazio = sem seletor de tamanho. `specs`
(objeto, ex: `{ "Medida": "20 x 8 cm" }`) e `edicao` (numero) so aparecem se
preenchidos.

## Imagens

Os originais ficam em `imagens-originais/` (fora do git, ~37 MB). Para gerar o
WebP leve em `public/img/` e o manifesto `src/data/imagens.json`:

```bash
npm run assets
```

Produto novo: ponha `mock_xx.png` em `imagens-originais/`, rode `npm run assets`
e cite `mock_xx` em `imagens` no JSON.

## WhatsApp e Instagram

Preencha `src/config.js`. Enquanto estiverem `null`, o clique em "Finalizar" e nos
contatos do rodape mostra "Em desenvolvimento".

## Publicar

No Cloudflare Pages: conectar o repo, comando `npm run build`, saida `dist`.
Node 22 (o arquivo `.node-version` ja diz). Quando o dominio existir, ponha o
endereco em `site` no `astro.config.mjs`.
````

- [ ] **Step 2: Verificacao completa**

Run: `npm test`
Expected: todos os testes passam (preco, imagens, catalogo, carrinho, armazenamento, mensagem, travessao, ambiente).

Run: `npm run build`
Expected: `sem travessao` e `Complete!`.

Run: `npm run texto`
Expected: `sem travessao`.

Run: `git status --short`
Expected: so os arquivos do README. Nada de `imagens-originais/` nem `node_modules/`.

Run: `git ls-files | grep -c imagens-originais`
Expected: `0`.

Run: `du -sh dist`
Expected: abaixo de ~15 MB.

- [ ] **Step 3: Passada final no navegador**

`npm run preview` (via `preview_start` com uma configuracao `preview` se preferir, ou continuar no `dev`). Conferir nos tres tamanhos (360, 768, 1280):
- Nenhuma rolagem horizontal da pagina.
- Texto do hero e dos cards legivel, sem corte.
- Foco visivel (contorno vermelho) em links e botoes ao navegar por `Tab`.
- Com `prefers-reduced-motion` (emulado), a faixa nao anda.
- `read_network_requests` `urlPattern: "/img/"`: nenhum 404.

Se algo falhar, corrigir na tarefa de origem e repetir o passo.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: README da loja"
```

- [ ] **Step 5: Parar e perguntar ao Luiz antes do push**

Mostrar o `git log --oneline` e perguntar se pode dar `git push -u origin main`. O repo `luizhc06/Boboya` e **publico**: o push publica o codigo e o WebP. **Nao fazer o push sem um "sim" explicito.**
