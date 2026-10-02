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
