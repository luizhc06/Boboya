// Pagina de checkout: desenha os itens e o resumo a partir do mesmo carrinho da
// gaveta. A conta mora em src/lib/checkout.js e tem teste; aqui so tem DOM.
import { carregar } from '../lib/armazenamento.js';
import { resumoCheckout } from '../lib/checkout.js';
import { formatarPreco } from '../lib/preco.js';

const catalogo = JSON.parse(document.getElementById('catalogo').textContent);
const grade = document.querySelector('[data-checkout]');
const vazio = document.querySelector('[data-checkout-vazio]');
const lista = document.querySelector('[data-checkout-itens]');
const recusado = document.getElementById('recusado');

function el(tag, props = {}, ...filhos) {
  const no = Object.assign(document.createElement(tag), props);
  no.append(...filhos);
  return no;
}

function desenhar() {
  const r = resumoCheckout(carregar(catalogo), catalogo);
  grade.hidden = r.itens.length === 0;
  vazio.hidden = r.itens.length > 0;
  lista.replaceChildren(...r.itens.map(({ item, produto, subtotal }) => {
    const meta = [produto.tipo, item.tamanho ? `tam. ${item.tamanho}` : null, `${item.qtd} un.`].filter(Boolean).join(' · ');
    return el('li', { className: 'checkout-item' },
      el('img', { src: produto.imagem, alt: '', width: 64, height: 64 }),
      el('div', {},
        el('p', { className: 'gaveta-nome', textContent: produto.nome }),
        el('p', { className: 'gaveta-meta', textContent: meta }),
      ),
      el('span', { className: 'checkout-preco', textContent: formatarPreco(subtotal) }),
    );
  }));
  document.querySelector('[data-checkout-subtotal]').textContent = formatarPreco(r.subtotal);
  document.querySelector('[data-checkout-total]').textContent = formatarPreco(r.total);
}

document.querySelector('[data-pagar]').addEventListener('click', () => recusado.showModal());
recusado.addEventListener('click', (e) => { if (e.target === recusado) recusado.close(); });

// A gaveta continua aberta nesta pagina: mudou la, muda aqui.
document.addEventListener('carrinho:mudou', desenhar);
window.addEventListener('storage', desenhar);
desenhar();
