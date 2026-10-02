// Revela os elementos .revela quando entram na tela. Quem aparece junto entra em
// cascata (60ms entre um e outro, no maximo 6 degraus): cascata curta lida como
// uma onda; longa vira fila de espera.
//
// O CSS so esconde .revela quando o <html> tem a classe .js, que o <head> poe
// apenas se o visitante nao pediu menos movimento. Sem isso, nada aqui roda.
const html = document.documentElement;

if (html.classList.contains('js') && 'IntersectionObserver' in window) {
  const revelar = (e, i) => {
    e.target.style.setProperty('--atraso', `${Math.min(i, 6) * 60}ms`);
    e.target.classList.add('visivel');
  };

  const olho = new IntersectionObserver((entradas) => {
    entradas
      .filter((e) => e.isIntersecting)
      // de cima pra baixo, da esquerda pra direita: a onda segue a leitura
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
      .forEach((e, i) => {
        revelar(e, i);
        olho.unobserve(e.target);
      });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

  for (const alvo of document.querySelectorAll('.revela')) olho.observe(alvo);
  window.__revelaOk = true;
}
