<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main class="legal-content wrap" id="conteudo">
<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
<article <?php post_class(); ?>><h1><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1><?php the_content(); ?></article>
<?php endwhile; the_posts_pagination(); else : ?>
<h1>Truth Hub de Negócios</h1><p>Conheça nossas soluções comerciais na página principal.</p>
<?php endif; ?>
</main>
<?php get_footer(); ?>
