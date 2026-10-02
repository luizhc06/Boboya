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
