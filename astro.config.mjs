import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// O endereco publico: sai daqui o sitemap, o canonical e o og:url.
// O og:image fica de fora: ainda nao ha uma imagem 1200x630 da loja.
export default defineConfig({
  site: 'https://boboya.insurge.space',
  // A 404 e o checkout nao sao destino: ninguem deve chegar neles por busca.
  integrations: [sitemap({ filter: (pagina) => !pagina.includes('/404') && !pagina.includes('/checkout') })],
});
