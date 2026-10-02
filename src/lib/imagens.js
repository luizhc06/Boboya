import manifesto from '../data/imagens.json';

// Uma imagem so existe se o script de assets a gerou. Falhar no build, e nao
// no navegador, e o ponto: um nome errado vira erro aqui e nao um <img> quebrado.
export function img(nome, { mini = false } = {}) {
  const m = manifesto[nome];
  if (!m) throw new Error(`imagem desconhecida: ${nome}`);
  const usaMini = mini && m.mini;
  const dim = usaMini ? m.mini : m;
  return { src: `/img/${nome}${usaMini ? '-p' : ''}.webp`, width: dim.w, height: dim.h };
}
