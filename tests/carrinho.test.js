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
