<script lang="ts">
  export let error: Error;
</script>

<div class="todoist-error">
  <p>Oh no, something went wrong!</p>
  <code>{error}</code>
</div>
