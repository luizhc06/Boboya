import { linhas, totalCentavos } from './carrinho.js';

// A unica entrega da loja (pedido do grupo em 26/11/2026): um membro da garage
// leva em maos. O valor ja inclui o ICMS e e alto de proposito: o checkout
// existe, mas ninguem consegue pagar.
export const FRETE_BOBOYA = {
  nome: 'Um membro da BOBOYA garage entrega no seu endereço',
  detalhe: 'Única opção para o seu CEP e para todos os outros.',
  centavos: 9118337238,
};

// Resumo do checkout. Carrinho vazio nao tem frete: nao ha o que entregar.
export function resumoCheckout(carrinho, catalogo) {
  const itens = linhas(carrinho, catalogo);
  const subtotal = totalCentavos(carrinho, catalogo);
  const frete = itens.length > 0 ? FRETE_BOBOYA.centavos : 0;
  return { itens, subtotal, frete, total: subtotal + frete };
}
