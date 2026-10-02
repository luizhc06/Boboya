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
