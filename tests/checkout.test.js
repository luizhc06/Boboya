import { describe, it, expect } from 'vitest';
import { FRETE_BOBOYA, resumoCheckout, salariosMinimos } from '../src/lib/checkout.js';
import { formatarPreco } from '../src/lib/preco.js';

const catalogo = [
  { slug: 'boboya-chinelo', nome: 'BOBOYA garage', tipo: 'Chinelo', preco: 2490, tamanhos: [] },
  { slug: 'reimu-bumper-sticker', nome: 'Reimu', tipo: 'Bumper Sticker', preco: 1990, tamanhos: [] },
];

describe('checkout', () => {
  it('frete + ICMS de R$ 91.183.372,38', () => {
    expect(formatarPreco(FRETE_BOBOYA.centavos)).toBe('R$ 91.183.372,38');
    expect(Number.isSafeInteger(FRETE_BOBOYA.centavos)).toBe(true);
  });
  it('soma o frete ao subtotal', () => {
    const r = resumoCheckout([{ slug: 'boboya-chinelo', tamanho: null, qtd: 1 }], catalogo);
    expect(r.subtotal).toBe(2490);
    expect(r.frete).toBe(FRETE_BOBOYA.centavos);
    expect(formatarPreco(r.total)).toBe('R$ 91.183.397,28');
  });
  it('o frete e um so, nao importa quantos itens', () => {
    const r = resumoCheckout([
      { slug: 'boboya-chinelo', tamanho: null, qtd: 3 },
      { slug: 'reimu-bumper-sticker', tamanho: null, qtd: 2 },
    ], catalogo);
    expect(r.itens).toHaveLength(2);
    expect(r.total).toBe(3 * 2490 + 2 * 1990 + FRETE_BOBOYA.centavos);
  });
  it('carrinho vazio nao tem frete', () => {
    expect(resumoCheckout([], catalogo)).toMatchObject({ subtotal: 0, frete: 0, total: 0 });
  });
  it('salarios minimos de R$ 1.621,00, arredondado pra cima', () => {
    expect(salariosMinimos(FRETE_BOBOYA.centavos)).toBe(56252);
    expect(salariosMinimos(162100)).toBe(1);
    expect(salariosMinimos(162101)).toBe(2);
    expect(Math.floor(162100 / 2490)).toBe(65);
  });
});
