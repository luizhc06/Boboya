// Liga a logica pura do carrinho ao DOM. Nada de regra de negocio aqui: soma,
// limite e mensagem moram em src/lib e tem teste. Este arquivo so desenha e
// escuta cliques, e por isso e testado olhando a loja funcionar.
import { config } from '../config.js';
import { carregar, salvar } from '../lib/armazenamento.js';
import { adicionar, alterarQtd, remover, linhas, totalCentavos, quantidadeTotal } from '../lib/carrinho.js';
import { formatarPreco } from '../lib/preco.js';
import { montarMensagem, linkWhatsApp } from '../lib/mensagem.js';

const catalogo = JSON.parse(document.getElementById('catalogo').textContent);
const gaveta = document.getElementById('gaveta');
const aviso = document.getElementById('aviso');
const lista = document.getElementById('gaveta-itens');
const vazio = document.getElementById('gaveta-vazio');
const finalizar = document.getElementById('finalizar');

let carrinho = carregar(catalogo);

// Monta um elemento sem innerHTML: nome de produto entra como texto, nunca como HTML.
function el(tag, props = {}, ...filhos) {
  const no = Object.assign(document.createElement(tag), props);
  no.append(...filhos);
  return no;
}

function botaoMini(rotulo, acao, slug, tamanho, texto) {
  const b = el('button', { type: 'button', className: 'mini', textContent: texto });
  b.setAttribute('aria-label', rotulo);
  b.dataset.acao = acao;
  b.dataset.slug = slug;
  b.dataset.tamanho = tamanho ?? '';
  return b;
}

function desenhar() {
  const ls = linhas(carrinho, catalogo);
  for (const alvo of document.querySelectorAll('[data-contador]')) alvo.textContent = String(quantidadeTotal(carrinho));
  for (const alvo of document.querySelectorAll('[data-total]')) alvo.textContent = formatarPreco(totalCentavos(carrinho, catalogo));

  lista.replaceChildren(...ls.map(({ item, produto, subtotal }) => {
    const miniatura = el('img', { src: produto.imagem, alt: '', width: 72, height: 72 });
    const meta = [produto.tipo, item.tamanho ? `tam. ${item.tamanho}` : null].filter(Boolean).join(' · ');
    const remove = el('button', { type: 'button', className: 'remover', textContent: 'remover' });
    remove.dataset.acao = 'remover';
    remove.dataset.slug = item.slug;
    remove.dataset.tamanho = item.tamanho ?? '';
    return el('li', { className: 'gaveta-item' },
      miniatura,
      el('div', {},
        el('p', { className: 'gaveta-nome', textContent: produto.nome }),
        el('p', { className: 'gaveta-meta', textContent: meta }),
        el('div', { className: 'gaveta-linha' },
          botaoMini(`Diminuir ${produto.nome}`, 'menos', item.slug, item.tamanho, '−'),
          el('span', { textContent: String(item.qtd) }),
          botaoMini(`Aumentar ${produto.nome}`, 'mais', item.slug, item.tamanho, '+'),
          remove,
          el('span', { className: 'preco', textContent: formatarPreco(subtotal) }),
        ),
      ),
    );
  }));

  lista.hidden = ls.length === 0;
  vazio.hidden = ls.length > 0;
  finalizar.disabled = ls.length === 0;
}

// Pulinho no botao CARRINHO quando entra mais coisa: confirma a acao mesmo com a
// gaveta fechada. Tirar a classe e relê-la forca a animacao a recomecar se o
// visitante adiciona duas vezes seguidas.
function pulsar() {
  const botao = document.querySelector('[data-abrir-gaveta]');
  if (!botao) return;
  botao.classList.remove('pulou');
  void botao.offsetWidth;
  botao.classList.add('pulou');
  botao.addEventListener('animationend', () => botao.classList.remove('pulou'), { once: true });
}

function mudar(novo) {
  const entrouMais = quantidadeTotal(novo) > quantidadeTotal(carrinho);
  carrinho = novo;
  salvar(carrinho);
  desenhar();
  if (entrouMais) pulsar();
}

function abrirGaveta() {
  if (!gaveta.open) gaveta.showModal();
}

// ── Gaveta ──
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-abrir-gaveta]')) abrirGaveta();
  if (e.target.closest('[data-fechar-gaveta]')) gaveta.close();
  if (e.target.closest('[data-em-dev]')) aviso.showModal();
});

// Clique no fundo escuro (o proprio <dialog>, fora do conteudo) fecha.
for (const d of [gaveta, aviso]) {
  d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
}

lista.addEventListener('click', (e) => {
  const b = e.target.closest('[data-acao]');
  if (!b) return;
  const { acao, slug } = b.dataset;
  const tamanho = b.dataset.tamanho || null;
  if (acao === 'mais') mudar(alterarQtd(carrinho, slug, tamanho, 1));
  if (acao === 'menos') mudar(alterarQtd(carrinho, slug, tamanho, -1));
  if (acao === 'remover') mudar(remover(carrinho, slug, tamanho));
});

// ── Pagina de produto ──
for (const form of document.querySelectorAll('[data-form-produto]')) {
  const erro = form.querySelector('[data-erro]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const dados = new FormData(form);
    const produto = catalogo.find((p) => p.slug === form.dataset.slug);
    const tamanho = dados.get('tamanho');
    if (produto.tamanhos.length > 0 && !tamanho) {
      erro.textContent = 'Escolha um tamanho.';
      return;
    }
    const qtd = Math.max(1, Math.min(99, parseInt(dados.get('qtd'), 10) || 1));
    erro.textContent = '';
    mudar(adicionar(carrinho, { slug: produto.slug, tamanho: tamanho || null, qtd }));
    abrirGaveta();
  });
}

// ── Finalizar ──
finalizar.addEventListener('click', () => {
  const ls = linhas(carrinho, catalogo);
  if (ls.length === 0) return;
  const link = linkWhatsApp(config.whatsapp, montarMensagem(ls, totalCentavos(carrinho, catalogo), config.nome));
  if (link) window.open(link, '_blank', 'noopener');
  else aviso.showModal();
});

// Outra aba mexeu no carrinho: acompanha.
window.addEventListener('storage', () => {
  carrinho = carregar(catalogo);
  desenhar();
});

desenhar();
