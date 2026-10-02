// Carrinho = lista de { slug, tamanho, qtd }. Nenhuma funcao aqui muda o que
// recebe: devolvem um carrinho novo, o que deixa o teste simples e a tela sem
// surpresa. Preco nao entra no carrinho: o total sai do catalogo, pra um preco
// antigo guardado no navegador nunca virar o valor do pedido.
export const MAX_QTD = 99;

const mesma = (item, slug, tamanho) => item.slug === slug && item.tamanho === tamanho;

export function adicionar(carrinho, { slug, tamanho = null, qtd = 1 }) {
  if (!carrinho.some((i) => mesma(i, slug, tamanho))) {
    return [...carrinho, { slug, tamanho, qtd: Math.min(qtd, MAX_QTD) }];
  }
  return carrinho.map((i) => (mesma(i, slug, tamanho) ? { ...i, qtd: Math.min(i.qtd + qtd, MAX_QTD) } : i));
}

export function alterarQtd(carrinho, slug, tamanho, delta) {
  return carrinho
    .map((i) => (mesma(i, slug, tamanho) ? { ...i, qtd: Math.min(i.qtd + delta, MAX_QTD) } : i))
    .filter((i) => i.qtd > 0);
}

export function remover(carrinho, slug, tamanho) {
  return carrinho.filter((i) => !mesma(i, slug, tamanho));
}

export function quantidadeTotal(carrinho) {
  return carrinho.reduce((soma, i) => soma + i.qtd, 0);
}

export function linhas(carrinho, catalogo) {
  const porSlug = new Map(catalogo.map((p) => [p.slug, p]));
  return carrinho.flatMap((item) => {
    const produto = porSlug.get(item.slug);
    return produto ? [{ item, produto, subtotal: produto.preco * item.qtd }] : [];
  });
}

export function totalCentavos(carrinho, catalogo) {
  return linhas(carrinho, catalogo).reduce((soma, l) => soma + l.subtotal, 0);
}

// O que vem do localStorage e texto de fora: pode ter sido editado a mao, ser de
// uma versao antiga da loja ou apontar pra produto que saiu do catalogo.
export function higienizar(bruto, catalogo) {
  if (!Array.isArray(bruto)) return [];
  const porSlug = new Map(catalogo.map((p) => [p.slug, p]));
  const limpo = [];
  for (const item of bruto) {
    if (!item || typeof item !== 'object') continue;
    const produto = porSlug.get(item.slug);
    if (!produto) continue;
    const qtd = Number(item.qtd);
    if (!Number.isInteger(qtd) || qtd < 1) continue;
    let tamanho = null;
    if (produto.tamanhos.length > 0) {
      if (!produto.tamanhos.includes(item.tamanho)) continue;
      tamanho = item.tamanho;
    }
    limpo.push({ slug: produto.slug, tamanho, qtd: Math.min(qtd, MAX_QTD) });
  }
  return limpo.reduce((acc, i) => adicionar(acc, i), []);
}
