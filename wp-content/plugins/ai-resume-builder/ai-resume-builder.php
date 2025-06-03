<?php
/**
 * Plugin Name: AI Resume Builder
 * Plugin URI: https://example.com/ai-resume-builder
 * Description: A WordPress plugin that uses AI to help users build resumes.
 * Version: 0.1.0
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL2
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ai-resume-builder
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Activation hook.
 */
function airb_activate() {
    // Add an option to mark activation.
    add_option( 'airb_activated', true );
}
register_activation_hook( __FILE__, 'airb_activate' );

/**
 * Deactivation hook.
 */
function airb_deactivate() {
    // Delete the option on deactivation.
    delete_option( 'airb_activated' );
}
register_deactivation_hook( __FILE__, 'airb_deactivate' );

/**
 * Add admin menu item.
 */
function airb_admin_menu() {
    add_menu_page(
        __( 'AI Resume Builder', 'ai-resume-builder' ),
        __( 'AI Resume Builder', 'ai-resume-builder' ),
        'manage_options',
        'ai-resume-builder',
        'airb_render_admin_page',
        'dashicons-text-page',
        6
    );
}
add_action( 'admin_menu', 'airb_admin_menu' );

/**
 * Render admin page.
 */
function airb_render_admin_page() {
    ?>
    <div class="wrap">
        <div id="ai-resume-builder-app"></div>
    </div>
    <?php
}

/**
 * Enqueue scripts and styles for the admin page.
 */
function airb_enqueue_admin_scripts( $hook_suffix ) {
    // Only load on our plugin's admin page.
    // The hook_suffix for a top-level menu page is 'toplevel_page_{menu_slug}'.
    if ( 'toplevel_page_ai-resume-builder' !== $hook_suffix ) {
        return;
    }

    $script_asset_path = plugin_dir_path( __FILE__ ) . 'dist/main.asset.php';
    if ( ! file_exists( $script_asset_path ) ) {
        // Fallback if asset file doesn't exist (e.g., build not run)
        $dependencies = array('wp-element'); // React is wp-element
        $version = filemtime( plugin_dir_path( __FILE__ ) . 'dist/main.js' );
    } else {
        $script_asset = require( $script_asset_path );
        $dependencies = $script_asset['dependencies'];
        $version = $script_asset['version'];
    }

    // Enqueue the bundled React app.
    wp_enqueue_script(
        'ai-resume-builder-app',
        plugin_dir_url( __FILE__ ) . 'dist/main.js',
        $dependencies,
        $version,
        true // Load in footer
    );

    // Make templates available to the script
    $templates = airb_get_resume_templates();
    wp_localize_script(
        'ai-resume-builder-app',
        'aiResumeBuilder', // Global JS object
        array(
            'templates'           => $templates,
            'ajax_url'            => admin_url( 'admin-ajax.php' ), // Pass ajaxurl
            'ai_suggestion_nonce' => wp_create_nonce( 'airb_ai_suggestion_nonce' ),
            // You can add other localized data here
        )
    );

    // Potentially enqueue a separate CSS file if Webpack is configured to extract CSS.
    // For now, styles are injected by 'style-loader'.
}
add_action( 'admin_enqueue_scripts', 'airb_enqueue_admin_scripts' );

/**
 * Register Resume Template Custom Post Type.
 */
function airb_register_resume_template_cpt() {
    $labels = array(
        'name'                  => _x( 'Resume Templates', 'Post type general name', 'ai-resume-builder' ),
        'singular_name'         => _x( 'Resume Template', 'Post type singular name', 'ai-resume-builder' ),
        'menu_name'             => _x( 'Resume Templates', 'Admin Menu text', 'ai-resume-builder' ),
        'name_admin_bar'        => _x( 'Resume Template', 'Add New on Toolbar', 'ai-resume-builder' ),
        'add_new'               => __( 'Add New', 'ai-resume-builder' ),
        'add_new_item'          => __( 'Add New Resume Template', 'ai-resume-builder' ),
        'new_item'              => __( 'New Resume Template', 'ai-resume-builder' ),
        'edit_item'             => __( 'Edit Resume Template', 'ai-resume-builder' ),
        'view_item'             => __( 'View Resume Template', 'ai-resume-builder' ),
        'all_items'             => __( 'All Resume Templates', 'ai-resume-builder' ),
        'search_items'          => __( 'Search Resume Templates', 'ai-resume-builder' ),
        'parent_item_colon'     => __( 'Parent Resume Templates:', 'ai-resume-builder' ),
        'not_found'             => __( 'No resume templates found.', 'ai-resume-builder' ),
        'not_found_in_trash'    => __( 'No resume templates found in Trash.', 'ai-resume-builder' ),
        'featured_image'        => _x( 'Resume Template Cover Image', 'Overrides the “Featured Image” phrase for this post type. Added in 4.3', 'ai-resume-builder' ),
        'set_featured_image'    => _x( 'Set cover image', 'Overrides the “Set featured image” phrase for this post type. Added in 4.3', 'ai-resume-builder' ),
        'remove_featured_image' => _x( 'Remove cover image', 'Overrides the “Remove featured image” phrase for this post type. Added in 4.3', 'ai-resume-builder' ),
        'use_featured_image'    => _x( 'Use as cover image', 'Overrides the “Use as featured image” phrase for this post type. Added in 4.3', 'ai-resume-builder' ),
        'archives'              => _x( 'Resume Template archives', 'The post type archive label used in nav menus. Default “Post Archives”. Added in 4.4', 'ai-resume-builder' ),
        'insert_into_item'      => _x( 'Insert into resume template', 'Overrides the “Insert into post”/”Insert into page” phrase (used when inserting media into a post). Added in 4.4', 'ai-resume-builder' ),
        'uploaded_to_this_item' => _x( 'Uploaded to this resume template', 'Overrides the “Uploaded to this post”/”Uploaded to this page” phrase (used when viewing media attached to a post). Added in 4.4', 'ai-resume-builder' ),
        'filter_items_list'     => _x( 'Filter resume templates list', 'Screen reader text for the filter links heading on the post type listing screen. Default “Filter posts list”/”Filter pages list”. Added in 4.4', 'ai-resume-builder' ),
        'items_list_navigation' => _x( 'Resume Templates list navigation', 'Screen reader text for the pagination heading on the post type listing screen. Default “Posts list navigation”/”Pages list navigation”. Added in 4.4', 'ai-resume-builder' ),
        'items_list'            => _x( 'Resume Templates list', 'Screen reader text for the items list heading on the post type listing screen. Default “Posts list”/”Pages list”. Added in 4.4', 'ai-resume-builder' ),
    );

    $args = array(
        'labels'             => $labels,
        'public'             => false, // Not public facing
        'show_ui'            => true,  // Show in admin UI
        'show_in_menu'       => true,  // Show in admin menu (can be string for submenu: 'ai-resume-builder')
        'menu_position'      => 20,    // Below Pages, or adjust as needed
        'menu_icon'          => 'dashicons-media-document', // Or a more fitting icon
        'capability_type'    => 'post',
        'hierarchical'       => false,
        'supports'           => array( 'title' ), // Only title, data in meta
        'has_archive'        => false,
        'rewrite'            => false, // No frontend permalinks
        'query_var'          => false,
        'can_export'         => true,
        'delete_with_user'   => false, // Keep templates if user is deleted
        'show_in_rest'       => true, // Enable Gutenberg editor and REST API access
    );

    register_post_type( 'resume_template', $args );

    // It's good practice to flush rewrite rules during plugin activation/deactivation
    // For now, remind user: "Remember to flush rewrite rules by visiting Settings > Permalinks if CPT links don't work."
}
add_action( 'init', 'airb_register_resume_template_cpt' );

/**
 * Add meta box for resume template data.
 */
function airb_add_resume_template_meta_box() {
    add_meta_box(
        'airb_resume_template_data', // ID
        __( 'Resume Template Data (JSON)', 'ai-resume-builder' ), // Title
        'airb_render_resume_template_meta_box_callback', // Callback
        'resume_template', // Post type
        'normal', // Context (normal, side, advanced)
        'high' // Priority (high, core, default, low)
    );
}
add_action( 'add_meta_boxes_resume_template', 'airb_add_resume_template_meta_box' ); // Specific hook for the CPT

/**
 * Callback function to render the meta box content.
 *
 * @param WP_Post $post The post object.
 */
function airb_render_resume_template_meta_box_callback( $post ) {
    // Add a nonce field
    wp_nonce_field( 'airb_save_resume_template_data', 'airb_resume_template_nonce' );

    // Get existing meta value if any
    $template_data = get_post_meta( $post->ID, '_resume_template_data', true );

    // Ensure $template_data is a string for the textarea.
    // If it's an array or object (e.g. from older data or direct DB manipulation), json_encode it.
    if ( ! is_string( $template_data ) ) {
        $template_data = json_encode( $template_data, JSON_PRETTY_PRINT );
    }
    ?>
    <p>
        <label for="airb_template_data_textarea" class="screen-reader-text"><?php esc_html_e( 'Resume Template JSON Data', 'ai-resume-builder' ); ?></label>
        <textarea
            id="airb_template_data_textarea"
            name="airb_resume_template_data_field"
            rows="15"
            style="width:100%; font-family: monospace;"
            placeholder="<?php esc_attr_e( 'Paste your resume template JSON structure here.', 'ai-resume-builder' ); ?>"
        ><?php echo esc_textarea( $template_data ); ?></textarea>
    </p>
    <p class="description">
        <?php esc_html_e( 'Enter the JSON data for this resume template. This structure will be used by the AI to generate content and by the frontend to render the resume.', 'ai-resume-builder' ); ?>
    </p>
    <?php
}

/**
 * Save meta box data for resume template.
 *
 * @param int $post_id The ID of the post being saved.
 */
function airb_save_resume_template_meta_data( $post_id ) {
    // Check if our nonce is set.
    if ( ! isset( $_POST['airb_resume_template_nonce'] ) ) {
        return;
    }
    // Verify that the nonce is valid.
    if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['airb_resume_template_nonce'] ) ), 'airb_save_resume_template_data' ) ) {
        return;
    }

    // If this is an autosave, our form has not been submitted, so we don't want to do anything.
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }

    // Check the user's permissions.
    if ( ! current_user_can( 'edit_post', $post_id ) ) {
        return;
    }

    // Make sure that the field is set.
    if ( ! isset( $_POST['airb_resume_template_data_field'] ) ) {
        return;
    }

    // Sanitize user input.
    // For JSON data, we might want to validate if it's actual JSON.
    // For now, we'll save it as a string. wp_kses_post is too aggressive for JSON.
    // A better sanitization would be to use json_decode and then json_encode again,
    // or a custom sanitization function that ensures valid JSON structure.
    $template_json_data = wp_unslash( $_POST['airb_resume_template_data_field'] ); // Using wp_unslash for data from $_POST.

    // Validate JSON - if it's not valid, perhaps don't save or save an error?
    // For now, we save what's given, expecting valid JSON.
    // if ( ! empty( $template_json_data ) ) {
    //     json_decode( $template_json_data );
    //     if ( json_last_error() !== JSON_ERROR_NONE ) {
    //         // Handle invalid JSON - e.g., add an admin notice and don't update.
    //         // For simplicity in this step, we'll allow saving potentially invalid JSON.
    //         // Consider adding WP_Error and admin notices for feedback.
    //     }
    // }

    // Update the meta field in the database.
    update_post_meta( $post_id, '_resume_template_data', $template_json_data );
}
add_action( 'save_post_resume_template', 'airb_save_resume_template_meta_data' ); // Specific hook for the CPT

/**
 * Get all published resume templates.
 *
 * @return array Array of resume templates with title and data.
 */
function airb_get_resume_templates() { // Existing function ...
    $args = array(
        'post_type'      => 'resume_template',
        'post_status'    => 'publish',
        'posts_per_page' => -1, // Get all templates
        'orderby'        => 'title',
        'order'          => 'ASC',
    );

    $templates_query = new WP_Query( $args );
    $resume_templates = array();

    if ( $templates_query->have_posts() ) {
        while ( $templates_query->have_posts() ) {
            $templates_query->the_post();
            $post_id = get_the_ID();
            $template_title = get_the_title();
            $template_data_json = get_post_meta( $post_id, '_resume_template_data', true );

            // Attempt to decode JSON data. If it's invalid, we might skip or log error.
            $template_data = json_decode( $template_data_json, true );
            if ( json_last_error() !== JSON_ERROR_NONE ) {
                // Optionally log this error or handle it (e.g., skip template)
                // error_log("AI Resume Builder: Invalid JSON data for template ID $post_id: " . json_last_error_msg());
                $template_data = null; // Or some default error structure
            }

            if ( $template_data ) { // Only add if data is valid JSON
                 $resume_templates[] = array(
                    'id'    => $post_id,
                    'title' => $template_title,
                    'data'  => $template_data,
                );
            } else {
                // Fallback for templates with invalid or missing JSON
                 $resume_templates[] = array(
                    'id'    => $post_id,
                    'title' => $template_title . ' (Error: Invalid Data)',
                    'data'  => null, // Indicate data error
                );
            }
        }
        wp_reset_postdata(); // Restore original post data
    }

    return $resume_templates;
}

/**
 * Initialize plugin settings.
 */
function airb_settings_init() {
    // Register a setting for the API key
    register_setting(
        'ai_resume_builder_settings_group', // Option group
        'airb_gemini_api_key',           // Option name
        array(
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field', // Basic sanitization
            'default'           => '',
        )
    );

    // Add a settings section to the main plugin page
    // Note: The 'ai-resume-builder' is the $menu_slug from add_menu_page
    add_settings_section(
        'airb_api_settings_section',         // ID
        __( 'API Settings', 'ai-resume-builder' ), // Title
        'airb_api_settings_section_callback', // Callback function for description
        'ai-resume-builder'                  // Page slug where this section will be displayed
    );

    // Add the API key field
    add_settings_field(
        'airb_gemini_api_key_field',         // ID
        __( 'Gemini API Key', 'ai-resume-builder' ), // Title
        'airb_gemini_api_key_field_callback', // Callback function to render the field
        'ai-resume-builder',                  // Page slug
        'airb_api_settings_section'          // Section ID
    );
}
add_action( 'admin_init', 'airb_settings_init' );

/**
 * Callback for the API settings section description.
 */
function airb_api_settings_section_callback() {
    echo '<p>' . esc_html__( 'Configure settings for the AI Resume Builder plugin, including your Gemini API Key.', 'ai-resume-builder' ) . '</p>';
}

/**
 * Callback to render the API key field.
 */
function airb_gemini_api_key_field_callback() {
    $api_key = get_option( 'airb_gemini_api_key' );
    ?>
    <input type="password" name="airb_gemini_api_key" value="<?php echo esc_attr( $api_key ); ?>" class="regular-text">
    <p class="description">
        <?php esc_html_e( 'Enter your Google Gemini API Key. This is required for AI features.', 'ai-resume-builder' ); ?>
    </p>
    <?php
}

/**
 * Modify the main admin page rendering function to include settings fields.
 * The existing airb_render_admin_page is where the React app is mounted.
 * We need to add the WordPress settings API form around or within it.
 * For simplicity, settings will be on the same page as the React app.
 * This requires the page to have a form tag and submit button for settings.
 */
function airb_render_admin_page_with_settings() {
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'AI Resume Builder', 'ai-resume-builder' ); ?></h1>

        <form action="options.php" method="post">
            <?php
            // Output settings fields for the 'ai_resume_builder_settings_group'
            settings_fields( 'ai_resume_builder_settings_group' );
            // Output settings sections for the 'ai-resume-builder' page
            do_settings_sections( 'ai-resume-builder' );
            // Output save settings button
            submit_button( __( 'Save API Key', 'ai-resume-builder' ) );
            ?>
        </form>
        <hr>
        <h2><?php esc_html_e( 'Resume Editor', 'ai-resume-builder' ); ?></h2>
        <div id="ai-resume-builder-app">
            <!-- React app mounts here -->
            <p>Loading Resume Editor...</p>
        </div>
    </div>
    <?php
}

// We need to update the admin menu callback to point to this new function.
// First, remove the old action if it was already added.
remove_action( 'admin_menu', 'airb_admin_menu' ); // Remove old one if this script runs multiple times in a simulation

/**
 * Add admin menu item (updated to use the page with settings).
 */
function airb_admin_menu_updated() {
    add_menu_page(
        __( 'AI Resume Builder', 'ai-resume-builder' ),
        __( 'AI Resume Builder', 'ai-resume-builder' ),
        'manage_options', // Capability
        'ai-resume-builder', // Menu slug
        'airb_render_admin_page_with_settings', // Callback function for page content
        'dashicons-text-page',
        6
    );
}
add_action( 'admin_menu', 'airb_admin_menu_updated' );

/**
 * AJAX handler for fetching AI suggestions.
 */
function airb_get_ai_suggestion_ajax_handler() {
    // 1. Check Nonce
    // The nonce value is expected to be in a POST variable, e.g., 'security_nonce'.
    // The nonce action name should match what's used in wp_create_nonce.
    if ( ! isset( $_POST['security_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['security_nonce'] ) ), 'airb_ai_suggestion_nonce' ) ) {
        wp_send_json_error( array( 'message' => 'Nonce verification failed.' ), 403 );
        return;
    }

    // 2. Get API Key
    $api_key = get_option( 'airb_gemini_api_key' );
    if ( empty( $api_key ) ) {
        wp_send_json_error( array( 'message' => 'Gemini API key is not set in plugin settings.' ), 400 );
        return;
    }

    // 3. Get prompt from AJAX request
    if ( ! isset( $_POST['prompt'] ) || empty( $_POST['prompt'] ) ) {
        wp_send_json_error( array( 'message' => 'Prompt data is missing.' ), 400 );
        return;
    }
    $prompt_text = sanitize_textarea_field( wp_unslash( $_POST['prompt'] ) );

    // For Gemini's generative models, the content is usually structured.
    // Example: { "contents": [{ "parts": [{ "text": "User prompt here" }] }] }
    // The exact structure depends on the Gemini API model being used (e.g., generateContent)
    $request_body = json_encode( array(
        'contents' => array(
            array(
                'parts' => array(
                    array( 'text' => $prompt_text )
                )
            )
        )
        // Potentially add generationConfig, safetySettings etc. here
    ) );

    // 4. Make request to Gemini API
    // The URL depends on the specific Gemini API version and model.
    // This is a placeholder URL for the generateContent endpoint.
    // Example: projects/YOUR_PROJECT_ID/locations/YOUR_LOCATION/publishers/google/models/gemini-pro:generateContent
    // For simplicity, using the v1beta model URL structure.
    $gemini_api_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' . $api_key;

    $args = array(
        'method'  => 'POST',
        'headers' => array(
            'Content-Type' => 'application/json',
        ),
        'body'    => $request_body,
        'timeout' => 30, // seconds
    );

    $response = wp_remote_post( $gemini_api_url, $args );

    if ( is_wp_error( $response ) ) {
        wp_send_json_error( array( 'message' => 'Failed to connect to Gemini API: ' . $response->get_error_message() ), 500 );
        return;
    }

    $response_code = wp_remote_retrieve_response_code( $response );
    $response_body = wp_remote_retrieve_body( $response );
    $decoded_body = json_decode( $response_body, true );

    if ( $response_code >= 200 && $response_code < 300 ) {
        // Assuming the response structure contains generated text like:
        // { "candidates": [ { "content": { "parts": [ { "text": "Generated text" } ] } } ] }
        if ( isset( $decoded_body['candidates'][0]['content']['parts'][0]['text'] ) ) {
            wp_send_json_success( array( 'suggestion' => $decoded_body['candidates'][0]['content']['parts'][0]['text'] ) );
        } elseif (isset($decoded_body['promptFeedback'])) {
             wp_send_json_error( array( 'message' => 'AI content generation blocked.', 'details' => $decoded_body['promptFeedback'] ), 400 );
        } else {
            wp_send_json_error( array( 'message' => 'Unexpected response structure from AI.', 'details' => $decoded_body ), 500 );
        }
    } else {
        // Error from Gemini API
        $error_message = isset( $decoded_body['error']['message'] ) ? $decoded_body['error']['message'] : 'Unknown error from Gemini API.';
        wp_send_json_error( array( 'message' => $error_message, 'details' => $decoded_body, 'code' => $response_code ), $response_code );
    }
}
// Hook for logged-in users
add_action( 'wp_ajax_airb_get_ai_suggestion', 'airb_get_ai_suggestion_ajax_handler' );
// If you need to support non-logged-in users (unlikely for admin features):
// add_action( 'wp_ajax_nopriv_airb_get_ai_suggestion', 'airb_get_ai_suggestion_ajax_handler' );

?>
