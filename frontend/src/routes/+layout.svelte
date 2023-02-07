<script lang="ts">
  import "../app.css";
</script>

<main>
  <slot />
</main>

<footer class="w-screen text-center">
  <p class="text-black dark:text-white fixed inset-x-0 bottom-0 mb-3">
    © 2022 - Parcetrace <br /><a
      href="https://raw.githubusercontent.com/gxjakkap/parcetrace/main/COPYING"
      target="_blank"
      rel="noreferer">Licensed under LGPL-3.0</a
    >
  </p>
</footer>
