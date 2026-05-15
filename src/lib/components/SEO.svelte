<script lang="ts">
  /**
   * SEO component to manage meta tags and dynamic head content.
   * Since this is a SPA, these will update the DOM dynamically.
   */
  export let title = "Prayday";
  export let description =
    "A prayer app to help you organize and track prayer. Pray every day with Prayday.";
  export let image =
    "https://prayday.app/favicon_io/android-chrome-512x512.png";
  export let url = "https://prayday.app/";
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={url} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={url} />
  <meta property="twitter:title" content={title} />
  <meta property="twitter:description" content={description} />
  <meta property="twitter:image" content={image} />
</svelte:head>
