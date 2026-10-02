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
