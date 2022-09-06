<script lang="ts">
  import "../app.css";
</script>

<main>
  <slot />
</main>

<footer class="w-screen text-center">
  <p class="text-black dark:text-white fixed inset-x-0 bottom-0">
    © 2022 - Parcetrace <br /><a
      href="https://raw.githubusercontent.com/gxjakkap/parcetrace/main/COPYING"
      target="_blank"
      rel="noreferer">Licensed under GPL-3.0-only</a
    >
  </p>
</footer>
