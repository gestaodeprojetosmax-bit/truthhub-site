# Truth Hub de Negócios

Versão com animações do site institucional. O repositório mantém o tema WordPress original recebido em `wordpress-theme/truth-hub/` e contém um exportador que converte os templates e o conteúdo legal em HTML estático para a Vercel.

## Publicação na Vercel

O projeto está configurado com `vercel.json`: a Vercel executa `npm run build` e publica apenas a pasta `dist/`. Não é necessário configurar PHP, WordPress, base de dados ou variáveis de ambiente para esta exportação estática.

Importe o repositório `gestaodeprojetosmax-bit/truthhub-site` em [vercel.com/new](https://vercel.com/new) e mantenha as definições do projeto detetadas a partir de `vercel.json`. A cada push para `main`, a integração Git da Vercel poderá reconstruir o site.

## Gerar e testar localmente

Requer Node.js 20 ou superior. Não há dependências npm externas.

```bash
npm run build
cd dist
python3 -m http.server 8000
```

Abra `http://localhost:8000`. As páginas legais ficam em `/politica-de-privacidade/` e `/termos-de-uso/`.

## Tema WordPress original

O diretório `wordpress-theme/truth-hub/` contém o tema PHP entregue no ZIP, preservado para instalação num WordPress compatível. Para o instalar, compacte a pasta `truth-hub` como ZIP e carregue-a em **Aparência → Temas → Adicionar tema → Carregar tema**, ou copie-a para `wp-content/themes/` e ative-a. O tema indica WordPress 6.0+ e PHP 7.4+.

A exportação estática usa os templates e as páginas legais do tema, mas não executa WordPress na Vercel. Assim, não há painel CMS nem atualização de conteúdo em tempo real; para editar conteúdo no futuro, altere os ficheiros fonte e volte a gerar ou publicar o site. Para usar o tema com WordPress dinâmico, o WordPress e a base de dados precisam de alojamento compatível; a Vercel serve a exportação estática deste repositório.

## Estrutura

- `scripts/build-static.mjs`: gera o HTML estático e copia assets.
- `wordpress-theme/truth-hub/`: tema WordPress e conteúdo fonte recebidos.
- `dist/`: resultado de produção gerado pelo build; não é versionado.
- `vercel.json`: build, diretório de publicação e cabeçalhos HTTP.
