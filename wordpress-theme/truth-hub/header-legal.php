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
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
<header class="legal-header wrap"><a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Truth Hub de Negócios — início">TRUTH<span>HUB DE NEGÓCIOS</span></a><a class="text-link" href="<?php echo esc_url( home_url( '/' ) ); ?>">Voltar ao início ↗</a></header>
