<script lang="ts">
  export let error: Error = null;
</script>

<div class="todoist-error">
  <p>Something went wrong!</p>
  <p>{error}</p>
</div>
