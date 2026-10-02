import produtos from '../data/produtos.json';

export { produtos };

// A ordem das chaves e a ordem em que as secoes aparecem na home. Adesivos
// primeiro: sao o foco da loja.
export const CATEGORIAS = {
  adesivos: { titulo: 'Adesivos', legenda: 'Bumper stickers e packs para o seu carro.' },
  camisetas: { titulo: 'Camisetas', legenda: 'Estampas da garage para vestir.' },
  decorativos: { titulo: 'Decorativos', legenda: 'Almofada, ímã, chaveiro e chinelo.' },
};

export const porSlug = (slug) => produtos.find((p) => p.slug === slug);
export const porCategoria = (categoria) => produtos.filter((p) => p.categoria === categoria);
export const comSelo = (selo) => produtos.filter((p) => p.selo === selo);
