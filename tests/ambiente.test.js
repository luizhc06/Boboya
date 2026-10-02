import { describe, it, expect } from 'vitest';

describe('ambiente', () => {
  it('roda testes em ESM', () => {
    expect(1 + 1).toBe(2);
  });
});
