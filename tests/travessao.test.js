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
