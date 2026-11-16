# Site Estuda.AI — 3.1

Código editável da página. Não envie esta pasta ao public_html.

## Publicação na Hostinger

Use o ZIP `Site-Estuda-AI-3.1-Hostinger.zip`, com os arquivos já compilados.
Ele deve ser extraído diretamente no `public_html` do domínio correto.
O site não precisa de Node.js, Python, chave Gemini ou banco de dados na hospedagem.

## Desenvolvimento

Node.js 22.12+ ou 24 e pnpm instalado.

1. `pnpm install --frozen-lockfile`
2. `pnpm test`
3. `pnpm typecheck`
4. `pnpm dev`

## Gerar uma nova publicação

`pnpm release`

O site compilado fica em `dist/`; o ZIP fica em `release/`, fora da pasta pública.
Nunca publique `.aistudio`, capturas, arquivos de instruções, `node_modules`, ZIPs
de código ou outros backups dentro da pasta pública.

## Configurações

- Checkouts: `src/config/offer.ts`.
- Atribuição de campanha: `src/config/attribution.ts`.
- UTMify: `index.html`, com a configuração existente preservada.
- Esta página não recebe pagamentos nem precisa do token da Cakto no código.

As configurações de campanha, avisos e conteúdo comercial foram preservadas.
Os botões de termos e privacidade ainda exibem texto provisório herdado do original;
substitua pelos documentos reais do responsável antes de encerrar a publicação.
