# BOBOYA garage, loja

Loja estatica de merch (adesivos de carro, camisetas, decorativos). Astro, sem
framework no cliente. Publicada no Cloudflare Pages.

## Rodar

```bash
npm install
npm run dev       # http://localhost:4321
npm test          # logica do carrinho, preco, mensagem, catalogo
npm run build     # falha se algum texto tiver travessao
```

No PowerShell, se a politica de execucao bloquear o `npm`, use `npm.cmd`.

### Se o Windows bloquear o binario do rolldown

Em maquinas com Controle de Aplicativo (Smart App Control), uma versao nova do
`rolldown` pode ser barrada ("Uma politica de Controle de Aplicativo bloqueou
este arquivo"). Sintoma: `npm test` e `npm run build` falham ao carregar
`rolldown-binding.win32-x64-msvc.node`. O `package-lock.json` deste projeto
trava o `rolldown 1.2.8`, que ja e aceito; nao rode `npm update` sem checar.

## Mudar produto ou preco

Edite `src/data/produtos.json`. O preco e em **centavos** (`6990` = R$ 69,90).
Campos: `nome` e `tipo` ficam separados (a loja nao usa travessao). `selo` e
`novo`, `destaque` ou `null`. `tamanhos` vazio = sem seletor de tamanho. `specs`
(objeto, ex: `{ "Medida": "20 x 8 cm" }`) e `edicao` (numero) so aparecem se
preenchidos.

## Imagens

Os originais ficam em `imagens-originais/` (fora do git, ~37 MB). Para gerar o
WebP leve em `public/img/` e o manifesto `src/data/imagens.json`:

```bash
npm run assets
```

Produto novo: ponha `mock_xx.png` em `imagens-originais/`, rode `npm run assets`
e cite `mock_xx` em `imagens` no JSON.

## WhatsApp e Instagram

Preencha `src/config.js`. Enquanto estiverem `null`, o clique em "Finalizar" e nos
contatos do rodape mostra "Em desenvolvimento".

## Movimento

As animacoes (entrada do hero, revelar ao rolar, gaveta, aviso, pulo do carrinho,
transicao entre paginas) ficam no bloco "Movimento" de `src/styles/global.css` e
em `src/scripts/animacoes.js`. Tudo so existe para quem nao pediu menos movimento
(`prefers-reduced-motion`): esses visitantes veem a loja parada e completa.

## Publicar

No Cloudflare Pages: conectar o repo, comando `npm run build`, saida `dist`.
Node 22 (o arquivo `.node-version` ja diz). Quando o dominio existir, ponha o
endereco em `site` no `astro.config.mjs`.
