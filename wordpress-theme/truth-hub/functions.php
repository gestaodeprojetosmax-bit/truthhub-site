<?php
/** Theme integration for Truth Hub de Negócios. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function truth_hub_setup() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
    load_theme_textdomain( 'truth-hub', get_template_directory() . '/languages' );
}
add_action( 'after_setup_theme', 'truth_hub_setup' );

function truth_hub_assets() {
    $directory = get_template_directory();
    $uri = get_template_directory_uri();
    wp_enqueue_style( 'truth-hub-main', $uri . '/assets/styles.css', array(), (string) filemtime( $directory . '/assets/styles.css' ) );
    wp_enqueue_style( 'truth-hub-service-stack', $uri . '/assets/service-stack.css', array( 'truth-hub-main' ), (string) filemtime( $directory . '/assets/service-stack.css' ) );
    wp_enqueue_style( 'truth-hub-commercial-orbit', $uri . '/assets/commercial-orbit.css', array( 'truth-hub-main' ), (string) filemtime( $directory . '/assets/commercial-orbit.css' ) );
    wp_enqueue_style( 'truth-hub-method-connections', $uri . '/assets/method-connections.css', array( 'truth-hub-main' ), (string) filemtime( $directory . '/assets/method-connections.css' ) );
    wp_enqueue_style( 'truth-hub-section-motion', $uri . '/assets/section-motion.css', array( 'truth-hub-main' ), (string) filemtime( $directory . '/assets/section-motion.css' ) );
    wp_enqueue_style( 'truth-hub-theme', get_stylesheet_uri(), array( 'truth-hub-main' ), (string) filemtime( $directory . '/style.css' ) );
    wp_enqueue_script( 'truth-hub-main', $uri . '/assets/app.js', array(), (string) filemtime( $directory . '/assets/app.js' ), true );
    wp_enqueue_script( 'truth-hub-counters', $uri . '/assets/counters.js', array( 'truth-hub-main' ), (string) filemtime( $directory . '/assets/counters.js' ), true );
    wp_enqueue_script( 'truth-hub-service-stack', $uri . '/assets/service-stack.js', array( 'truth-hub-main' ), (string) filemtime( $directory . '/assets/service-stack.js' ), true );
    wp_enqueue_script( 'truth-hub-commercial-orbit', $uri . '/assets/commercial-orbit.js', array( 'truth-hub-main' ), (string) filemtime( $directory . '/assets/commercial-orbit.js' ), true );
    wp_enqueue_script( 'truth-hub-method-connections', $uri . '/assets/method-connections.js', array( 'truth-hub-main' ), (string) filemtime( $directory . '/assets/method-connections.js' ), true );
    wp_enqueue_script( 'truth-hub-section-motion', $uri . '/assets/section-motion.js', array( 'truth-hub-main' ), (string) filemtime( $directory . '/assets/section-motion.js' ), true );
    // WordPress 6.3+ honors the native loading strategy; earlier versions keep footer loading.
    wp_script_add_data( 'truth-hub-counters', 'strategy', 'defer' );
    wp_script_add_data( 'truth-hub-service-stack', 'strategy', 'defer' );
    wp_script_add_data( 'truth-hub-commercial-orbit', 'strategy', 'defer' );
    wp_script_add_data( 'truth-hub-method-connections', 'strategy', 'defer' );
    wp_script_add_data( 'truth-hub-section-motion', 'strategy', 'defer' );
}
add_action( 'wp_enqueue_scripts', 'truth_hub_assets' );

function truth_hub_page_url( $slug ) {
    $page = get_page_by_path( sanitize_title( $slug ), OBJECT, 'page' );
    return $page && 'publish' === $page->post_status ? get_permalink( $page ) : home_url( '/' . sanitize_title( $slug ) . '/' );
}

function truth_hub_document_title( $title ) {
    if ( is_front_page() ) {
        return 'Truth Hub de Negócios | Estratégia que vira resultado';
    }
    if ( is_page( array( 'politica-de-privacidade', 'termos-de-uso' ) ) ) {
        return get_the_title() . ' | Truth Hub de Negócios';
    }
    return $title;
}
add_filter( 'pre_get_document_title', 'truth_hub_document_title' );

function truth_hub_meta() {
    if ( ! has_site_icon() ) {
        printf( '<link rel="icon" href="%s" type="image/svg+xml">' . "\n", esc_url( get_template_directory_uri() . '/assets/favicon.svg' ) );
    }
    if ( ! is_front_page() ) { return; }
    $description = 'Estruture seu comercial e desenvolva sua equipe com a Truth Hub: treinamento, performance, processos, CRM e diagnóstico de maturidade comercial.';
    $title = 'Truth Hub de Negócios | Estratégia que vira resultado';
    $og_description = 'Treinamento, performance, estruturação comercial e experiências que conectam pessoas e negócios.';
    printf( '<meta name="description" content="%s">' . "\n", esc_attr( $description ) );
    printf( '<meta property="og:title" content="%s">' . "\n", esc_attr( $title ) );
    printf( '<meta property="og:description" content="%s">' . "\n", esc_attr( $og_description ) );
    printf( '<meta property="og:url" content="%s">' . "\n", esc_url( home_url( '/' ) ) );
    echo '<meta property="og:type" content="website">' . "\n";
    echo '<meta property="og:locale" content="pt_BR">' . "\n";
}
add_action( 'wp_head', 'truth_hub_meta', 5 );

function truth_hub_legal_class( $classes ) {
    if ( is_page( array( 'politica-de-privacidade', 'termos-de-uso' ) ) ) { $classes[] = 'legal-page'; }
    return $classes;
}
add_filter( 'body_class', 'truth_hub_legal_class' );

function truth_hub_home_shortcode() { return esc_url( home_url( '/' ) ); }
add_shortcode( 'truth_home_url', 'truth_hub_home_shortcode' );
function truth_hub_page_shortcode( $atts ) {
    $atts = shortcode_atts( array( 'slug' => '' ), $atts, 'truth_page_url' );
    return esc_url( truth_hub_page_url( $atts['slug'] ) );
}
add_shortcode( 'truth_page_url', 'truth_hub_page_shortcode' );

function truth_hub_create_legal_pages() {
    if ( ! current_user_can( 'edit_pages' ) ) { return; }
    $pages = array( 'politica-de-privacidade' => 'Política de Privacidade', 'termos-de-uso' => 'Termos de Uso' );
    foreach ( $pages as $slug => $title ) {
        // Existing pages are preserved, including their editorial content.
        if ( get_page_by_path( $slug, OBJECT, 'page' ) ) { continue; }
        $path = get_template_directory() . '/content/' . $slug . '.html';
        if ( ! is_readable( $path ) ) { continue; }
        wp_insert_post( array(
            'post_type' => 'page', 'post_status' => 'publish', 'post_name' => $slug,
            'post_title' => $title, 'post_content' => file_get_contents( $path ),
            'post_author' => get_current_user_id(),
        ) );
    }
}
add_action( 'after_switch_theme', 'truth_hub_create_legal_pages' );
