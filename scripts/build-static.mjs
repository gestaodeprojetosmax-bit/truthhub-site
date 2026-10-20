import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const themeRoot = path.join(projectRoot, 'wordpress-theme', 'truth-hub');
const outputRoot = path.join(projectRoot, 'dist');
const stylesheetFiles = [
  '/assets/fonts/fonts.css',
  '/assets/styles.css',
  '/assets/service-stack.css',
  '/assets/commercial-orbit.css',
  '/assets/method-connections.css',
  '/assets/section-motion.css',
  '/assets/theme-overrides.css',
];
const scriptFiles = [
  '/assets/app.js',
  '/assets/counters.js',
  '/assets/service-stack.js',
  '/assets/commercial-orbit.js',
  '/assets/method-connections.js',
  '/assets/section-motion.js',
];

const htmlEscape = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

function createHead(title, description, isHome) {
  const tags = [
    '<meta name="description" content="' + htmlEscape(description) + '">',
    '<meta property="og:title" content="' + htmlEscape(title) + '">',
    '<meta property="og:description" content="' + htmlEscape(description) + '">',
  ];
  if (isHome) {
    tags.push(
      '<meta property="og:type" content="website">',
      '<meta property="og:locale" content="pt_BR">',
      '<meta property="og:site_name" content="Truth Hub de Negócios">',
    );
  }
  tags.push('<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">');
  tags.push(...stylesheetFiles.map((href) => `<link rel="stylesheet" href="${href}">`));
  tags.push('<title>' + htmlEscape(title) + '</title>');
  return '\n' + tags.join('\n');
}

function createScripts() {
  return scriptFiles.map((src) => `\n<script src="${src}" defer></script>`).join('');
}

function stripInitialPhpBlock(template) {
  return template.replace(/^\s*<\?php[\s\S]*?\?>\s*/, '');
}

function renderPhpTemplate(template, { title, description, isHome }) {
  let result = stripInitialPhpBlock(template);
  result = result.replace(/<\?php\s*echo\s+esc_url\(\s*get_template_directory_uri\(\)\s*\.\s*'\/assets\/([^']+)'\s*\);\s*\?>/g, (_match, asset) => `/assets/${asset}`);
  result = result.replace(/<\?php\s*echo\s+esc_url\(\s*home_url\(\s*'\/'\s*\)\s*\.\s*'#([^']+)'\s*\);\s*\?>/g, (_match, fragment) => `/#${fragment}`);
  result = result.replace(/<\?php\s*echo\s+esc_url\(\s*home_url\(\s*'\/'\s*\)\s*\);\s*\?>/g, '/');
  result = result.replace(/<\?php\s*echo\s+esc_url\(\s*truth_hub_page_url\(\s*'politica-de-privacidade'\s*\)\s*\);\s*\?>/g, '/politica-de-privacidade/');
  result = result.replace(/<\?php\s*echo\s+esc_url\(\s*truth_hub_page_url\(\s*'termos-de-uso'\s*\)\s*\);\s*\?>/g, '/termos-de-uso/');

  result = result.replace(/<\?php([\s\S]*?)\?>/g, (_match, rawExpression) => {
    const expression = rawExpression.trim();
    if (expression === 'language_attributes();') return 'lang="pt-BR"';
    if (expression === "bloginfo( 'charset' );") return 'UTF-8';
    if (expression === 'wp_head();') return createHead(title, description, isHome);
    if (expression === 'body_class();') return isHome ? 'class="home-page"' : 'class="legal-page"';
    if (expression === 'wp_body_open();') return '';
    if (expression === 'wp_footer();') return isHome ? createScripts() : '';
    if (expression === 'get_footer();' || expression === "get_footer( 'legal' );") return '';
    throw new Error(`Template contém uma expressão PHP sem conversão: <?php ${expression} ?>`);
  });
  if (result.includes('<?php')) throw new Error('O HTML gerado ainda contém código PHP.');
  return result;
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await cp(path.join(themeRoot, 'assets'), path.join(outputRoot, 'assets'), { recursive: true });
await cp(path.join(themeRoot, 'style.css'), path.join(outputRoot, 'assets', 'theme-overrides.css'));

const pageTitle = 'Truth Hub de Negócios | Estratégia que vira resultado';
const pageDescription = 'Estruture seu comercial e desenvolva sua equipe com a Truth Hub: treinamento, performance, processos, CRM e diagnóstico de maturidade comercial.';
const homepageTemplate = await readFile(path.join(themeRoot, 'front-page.php'), 'utf8');
const homepageBody = renderPhpTemplate(homepageTemplate, {
  title: pageTitle,
  description: pageDescription,
  isHome: true,
});
const homepageHeader = renderPhpTemplate(await readFile(path.join(themeRoot, 'header.php'), 'utf8'), {
  title: pageTitle,
  description: pageDescription,
  isHome: true,
});
const homepageFooter = renderPhpTemplate(await readFile(path.join(themeRoot, 'footer.php'), 'utf8'), {
  title: pageTitle,
  description: pageDescription,
  isHome: true,
});
await writeFile(path.join(outputRoot, 'index.html'), homepageHeader + homepageBody + homepageFooter);

const legalPages = [
  {
    slug: 'politica-de-privacidade',
    source: 'politica-de-privacidade.html',
    title: 'Política de Privacidade | Truth Hub de Negócios',
    description: 'Política de Privacidade do site Truth Hub de Negócios.',
  },
  {
    slug: 'termos-de-uso',
    source: 'termos-de-uso.html',
    title: 'Termos de Uso | Truth Hub de Negócios',
    description: 'Termos de Uso do site Truth Hub de Negócios.',
  },
];

for (const page of legalPages) {
  const legalHeader = renderPhpTemplate(await readFile(path.join(themeRoot, 'header-legal.php'), 'utf8'), {
    title: page.title,
    description: page.description,
    isHome: false,
  });
  const legalFooter = renderPhpTemplate(await readFile(path.join(themeRoot, 'footer-legal.php'), 'utf8'), {
    title: page.title,
    description: page.description,
    isHome: false,
  });
  let content = await readFile(path.join(themeRoot, 'content', page.source), 'utf8');
  content = content
    .replaceAll("[truth_page_url slug='politica-de-privacidade']", '/politica-de-privacidade/')
    .replaceAll("[truth_page_url slug='termos-de-uso']", '/termos-de-uso/')
    .replaceAll('[truth_home_url]', '/');
  const contentWrapper = `\n<main class="legal-content wrap" id="conteudo">\n${content}\n</main>\n`;
  const pageOutput = path.join(outputRoot, page.slug, 'index.html');
  await mkdir(path.dirname(pageOutput), { recursive: true });
  await writeFile(pageOutput, legalHeader + contentWrapper + legalFooter);
}

console.log(`Site estático gerado em ${path.relative(projectRoot, outputRoot)}.`);
