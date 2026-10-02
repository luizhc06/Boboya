# Loja BOBOYA garage: design

Data: 2026-10-01
Repo: `luizhc06/Boboya` (publico, comeca vazio)
Pasta local: `C:\Users\Psych\Documents\Projetos\Boboya`

## Objetivo

Uma loja online da BOBOYA garage, com estetica Y2K geek anime e foco em adesivos de
carro. Substitui o site de merch que o amigo do Luiz vai desligar. O catalogo e os
precos vem desse site; o codigo e o visual sao novos. O site antigo era uma vitrine
estatica (carrinho de enfeite, links de rodape vazios), entao nao ha codigo a herdar.

Referencia de estrutura: unimaticwatches.com (editorial, foto grande, topo com relogio
ao vivo, botoes MENU e CART em pilula, fileira numerada "New arrivals 4/10", etiquetas
tecnicas por produto). Referencia de visual: as proprias estampas da Boboya.

## Fora do escopo da v1

- Pagamento dentro do site (gateway, Pix automatico, calculo de frete).
- Paginas de trocas, prazo de entrega, formas de pagamento e FAQ. O site antigo so tinha
  links vazios. Entram quando o dono passar as regras reais.
- Categorias "Sale" e "Outros" (estavam vazias no site antigo).
- Contatos pessoais do amigo (e-mail e @ do rodape antigo). Nao sao copiados.
- Medidas e especificacoes dos produtos. Nada e inventado: o campo existe no JSON e so
  aparece na pagina quando estiver preenchido.

## Regra de texto: sem travessao

Nenhum texto do site contem travessao (em dash, "\u2014"). O site antigo tinha em nomes de
produto, titulo e descricao. Na origem: o nome do produto e o tipo ficam em campos
separados ("Marisa" + "Camiseta Branca"). Na saida: um teste e uma verificacao de build
falham se o caractere aparecer em `src/`, `public/` ou nos dados.

## Stack

- Astro (estatico), a mesma stack do MeuSite, sem framework de componentes no cliente.
- JavaScript puro no navegador so para: relogio, carrinho, gaveta, aviso "em desenvolvimento".
- Publicacao no Cloudflare Pages.
- Testes com Vitest para a logica pura (carrinho, total, mensagem, formatacao de preco,
  checagem de travessao).
- `sharp` para converter imagens em um script de build de assets.

## Paginas

| Rota | Conteudo |
|---|---|
| `/` | Topo com relogio, hero (Reimu), faixa de categorias, "Novidades" numeradas, destaques |
| `/adesivos`, `/camisetas`, `/decorativos` | Listagem da categoria (uma rota dinamica `[categoria]`) |
| `/produto/<slug>` | Foto grande, nome, tipo, preco, selo, tamanho (camisetas), quantidade, adicionar ao carrinho, especificacoes quando existirem |
| `/404` | Pagina de erro no mesmo estilo |

O carrinho nao e uma pagina: e uma gaveta lateral aberta pelo botao CART em qualquer rota.

## Visual

- Base: papel claro, preto e o vermelho da Boboya (token do site antigo, `oklch(44% 0.215 22)`).
- Tipografia: serifada italica pesada para BOBOYA (o logo e em Times italico), blackletter
  para "garage" e destaques, monoespacada para precos e etiquetas.
- Cards com moldura preta grossa (a borda dos adesivos) e a ponta "descolando" no hover.
- Detalhes tirados das estampas: fileiras de estrelas, divisores `xxxxxxxx`, o kanji
  現実核爆弾 como textura, faixa rolando no topo.
- Adesivos em destaque: selo "BUMPER STICKER", edicao numerada (so quando o dono definir).
- Selos: NOVO (preto) e DESTAQUE (vermelho), como no site antigo.
- Movimento contido, respeitando `prefers-reduced-motion`.
- Responsivo desde 360px. Em tela pequena o menu de categorias desce para uma segunda
  linha do topo (so tres links, cabem sem botao de menu).

## Dados

`src/data/produtos.json`, uma lista de objetos:

```
{
  "slug": "marisa-camiseta-branca",
  "nome": "Marisa",
  "tipo": "Camiseta Branca",
  "categoria": "camisetas",        // camisetas | adesivos | decorativos
  "preco": 6990,                   // centavos, inteiro
  "selo": "novo",                  // novo | destaque | null
  "tamanhos": [],                  // vazio = sem seletor de tamanho (estado inicial, ate o dono definir)
  "imagens": ["mock_t0"],          // chaves do manifesto src/data/imagens.json (a pagina mostra a primeira)
  "specs": null                    // objeto opcional, so aparece se preenchido
}
```

Catalogo inicial (precos em reais):

| Produto | Categoria | Preco | Selo | Imagem |
|---|---|---|---|---|
| Marisa, Camiseta Branca | camisetas | 69,90 | novo | mock_t0 |
| Reimu 現実核爆弾, Camiseta Branca | camisetas | 69,90 | novo | mock_t1 |
| Neon Genesis BOBOYA Ep. 24 | camisetas | 74,90 | | mock_t2 |
| Marisa, Pack de Adesivos | adesivos | 22,90 | | mock_a0 |
| Reimu 現実核爆弾, Bumper Sticker | adesivos | 19,90 | novo | mock_a1 |
| Coleção II, Bumper Sticker | adesivos | 19,90 | novo | mock_a2 |
| Shinji, Almofada | decorativos | 64,90 | destaque | mock_d0 |
| Nadeko, Ímã de Geladeira | decorativos | 24,90 | novo | mock_d1 |
| Shinji + Nadeko, Chaveiro | decorativos | 29,90 | | mock_d2 |
| BOBOYA garage, Chinelo | decorativos | 49,90 | novo | mock_d3 |

Preco em centavos inteiros evita erro de ponto flutuante na soma do carrinho.

`src/config.js` guarda o que muda com o dono: `whatsapp` (numero, ou `null`), `instagram`
(URL, ou `null`), nome da loja.

## Imagens

- Originais ficam em `imagens-originais/`, **fora do git** (`.gitignore`). O repo e publico e
  os arquivos somam ~37 MB.
- `npm run assets` le `imagens-originais/` e grava em `public/img/` versoes WebP
  (largura maxima 1200px para fotos de produto, 1400px para a arte do hero) mais um
  tamanho de 480px para listagens e carrinho. Tambem grava `src/data/imagens.json`, um
  manifesto com largura e altura de cada arquivo, para todo `<img>` ter `width` e
  `height`. So essas versoes e o manifesto sobem para o git.
- Arte solta usada no visual: `logo`, `reimu` (hero), `marisa`, `shinji`, `sparkle`.
- O `.gitignore` tambem ignora `node_modules`, `dist` e `.astro`.

## Carrinho

- Estado: lista de `{ slug, tamanho, qtd }` em `localStorage` (chave `boboya:carrinho`).
- Preco nunca e guardado no carrinho. O total e calculado a partir do JSON do catalogo.
  Um item cujo slug nao existe mais no catalogo e descartado ao carregar.
- Se `localStorage` falhar (modo privado, bloqueado), o carrinho funciona so em memoria.
- Gaveta lateral: lista, +/- quantidade, remover, total, botao "Finalizar".
- O contador do CART no topo reflete a quantidade total.

## Finalizar

Com `config.whatsapp` preenchido: abre `https://wa.me/<numero>?text=<mensagem>` em outra
aba. A mensagem lista cada item (nome, tipo, tamanho, quantidade, subtotal) e o total.

Com `config.whatsapp` ausente (**estado inicial**): o clique em "Finalizar" abre um aviso
"Finalizacao em desenvolvimento", sem navegar. O carrinho continua funcionando e nao
perde itens. O mesmo vale para o link do Instagram no rodape: sem URL, o clique mostra
"Em desenvolvimento".

O aviso e um dialogo acessivel (`<dialog>`), fecha com Esc e com o botao.

## Acessibilidade e desempenho

- Navegacao por teclado em gaveta, dialogo e cards. Foco visivel. Gaveta prende o foco e
  devolve ao botao CART ao fechar.
- Todo `<img>` com `alt` descritivo, `width` e `height`, `loading="lazy"` fora da primeira dobra.
- Contraste AA nos textos. O cinza do site antigo (`oklch(28% ...)` sobre preto) nao passa
  e nao e reaproveitado.
- Quase nenhum JavaScript no carregamento: a loja renderiza sem ele, o carrinho hidrata depois.

## Testes e verificacao

Vitest (logica pura):
- soma do carrinho em centavos, incluindo quantidades e itens iguais com tamanhos diferentes;
- descarte de slug inexistente;
- montagem da mensagem do WhatsApp (formato, codificacao de URL, acentos e kanji);
- formatacao de preco `6990 -> "R$ 69,90"`;
- varredura de travessao em `src/`, `public/` e dados.

Manual no navegador (preview): adicionar, remover, recarregar a pagina e ver o carrinho
persistir, abrir o aviso "em desenvolvimento", tela de 360px, teclado.

## Implantacao

Cloudflare Pages ligado ao repo `luizhc06/Boboya`, branch `main`, comando `npm run build`,
saida `dist`. Dominio e decidido depois.

## Pendencias com o dono (nao bloqueiam a v1)

- Numero do WhatsApp e URL do Instagram.
- Tamanhos das camisetas (P, M, G, GG?).
- Medidas e material dos adesivos e demais produtos.
- Se o amigo autoriza usar o e-mail e o @ dele no rodape.
- Regras de troca, prazo e pagamento, para criar as paginas informativas.
