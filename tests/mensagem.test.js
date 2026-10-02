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
