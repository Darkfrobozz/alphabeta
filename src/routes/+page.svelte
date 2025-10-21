<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="/tree">svelte.dev/docs/kit</a> to read the documentation
</p>

<style lang="scss">
  @use "sass:color" as c;

  $primary-color: red;

  h1 {
    color: $primary-color;

    &:hover {
      color: c.adjust($primary-color, $lightness: -10%);
    }
  }
</style>
