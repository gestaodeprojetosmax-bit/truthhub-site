# Truth Hub de Negócios

Site institucional estático da Truth Hub de Negócios, em português do Brasil. Não requer Node.js, dependências, framework ou etapa de compilação.

## Estrutura

- `index.html`: página principal.
- `privacidade.html` e `termos.html`: páginas legais.
- `assets/`: CSS, JavaScript e imagens locais.
- `vercel.json`: cabeçalhos HTTP para a publicação na Vercel.

## Executar localmente

Abra `index.html` no navegador ou inicie um servidor estático na raiz do repositório, por exemplo:

```bash
python3 -m http.server 8000
```

Depois aceda a `http://localhost:8000`.

## Publicar na Vercel

1. Importe este repositório em [vercel.com/new](https://vercel.com/new).
2. Selecione **Other** como framework, sem Build Command; mantenha a raiz do projeto como diretório de publicação (`.`).
3. Publique. A Vercel serve diretamente os ficheiros HTML e a pasta `assets/`.

Também é possível usar a CLI da Vercel na raiz do projeto: `vercel` para uma publicação de pré-visualização e `vercel --prod` para produção, depois de associar o projeto à conta pretendida.

## Domínio e SEO

O pacote original continha um URL canónico e um URL de organização estruturado que apontavam para um endereço de pré-visualização antigo. Foram retirados para evitar sinalizar esse endereço como URL oficial. Depois de escolher o domínio final, adicione um `<link rel="canonical">` ao `<head>` de cada página pública apropriada e atualize `url` no JSON-LD de `index.html` para o domínio publicado. Reveja também os metadados Open Graph se definir uma imagem social.

A Vercel pode criar um domínio `*.vercel.app` para o projeto; confirme o URL atribuído no painel antes de o usar como domínio canónico. Configure o domínio próprio no painel da Vercel, se aplicável.

## Notas

- Os contactos, textos, dados institucionais e imagens foram mantidos conforme recebidos no pacote.
- O ficheiro `LEIA-ME.txt` contém as notas editoriais originais da versão entregue.
- Não há variáveis de ambiente nem serviços de backend configurados neste site.
