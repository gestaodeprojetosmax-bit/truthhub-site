<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header( 'legal' );
?>
<main class="legal-content wrap" id="conteudo">
<?php while ( have_posts() ) : the_post(); the_content(); endwhile; ?>
</main>
<?php get_footer( 'legal' ); ?>
