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
