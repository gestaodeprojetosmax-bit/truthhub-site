<?php
/** Truth Hub de Negócios. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#100e0b">
<meta name="facebook-domain-verification" content="tssi1ef3s8ghrtziignoht9fqfnfis">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
<header class="site-header"><div class="wrap header-inner">
<a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Truth Hub de Negócios — início"><svg viewBox="0 0 36 42" aria-hidden="true"><path d="M3 4h30v8H22v26h-8V12H3z"/><path class="brand-line" d="M27 18v20h6V18"/></svg><span><strong>TRUTH</strong><small>HUB DE NEGÓCIOS</small></span></a>
<button class="menu-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Abrir menu"><span></span><span></span></button>
<nav id="main-nav" aria-label="Menu principal"><a href="<?php echo esc_url( home_url( '/' ) . '#solucoes' ); ?>">Soluções</a><a href="<?php echo esc_url( home_url( '/' ) . '#metodo' ); ?>">Nosso método</a><a href="<?php echo esc_url( home_url( '/' ) . '#sobre' ); ?>">Quem somos</a><a class="button button-small button-champagne" data-wa="Olá! Gostaria de conhecer as soluções da Truth Hub." href="https://wa.me/5512991057907?text=Ol%C3%A1!%20Gostaria%20de%20conhecer%20as%20solu%C3%A7%C3%B5es%20da%20Truth%20Hub." target="_blank" rel="noopener noreferrer">Vamos conversar <span aria-hidden="true"><svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></span></a></nav>
</div></header>
