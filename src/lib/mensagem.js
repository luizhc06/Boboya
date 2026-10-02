import { formatarPreco } from './preco.js';

// O pedido sai como texto simples: o WhatsApp nao renderiza nada alem disso, e
// o dono le a lista, combina pagamento e frete na conversa.
export function montarMensagem(linhas, totalCentavos, nomeLoja) {
  const itens = linhas.map(({ item, produto, subtotal }) => {
    const tamanho = item.tamanho ? `, tam. ${item.tamanho}` : '';
    return `- ${item.qtd}x ${produto.nome} (${produto.tipo})${tamanho}: ${formatarPreco(subtotal)}`;
  });
  return [
    `Oi! Quero fazer um pedido na ${nomeLoja}:`,
    '',
    ...itens,
    '',
    `Total: ${formatarPreco(totalCentavos)}`,
  ].join('\n');
}

// wa.me so aceita digitos, com DDI e DDD. Sem numero configurado devolve null, e
// quem chama mostra o aviso "em desenvolvimento" em vez de abrir um link morto.
export function linkWhatsApp(numero, texto) {
  const digitos = String(numero ?? '').replace(/\D/g, '');
  if (!digitos) return null;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`;
}
