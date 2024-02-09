<script lang="ts">
  import { QueryErrorKind } from "../data";
  import ErrorDisplay from "./ErrorDisplay.svelte";

  export let kind: QueryErrorKind;

  $: errorMessage = message(kind);

  function message(kind: QueryErrorKind): string {
    switch (kind) {
      case QueryErrorKind.BadRequest:
        return "The Todoist API has rejected the request. Please check the filter to ensure it is valid.";
      case QueryErrorKind.Unauthorized:
        return "The Todoist API request is missing or has the incorreect credentials. Please check the API token in the settings.";
      default:
        return "Unknown error occurred. Please check the Console in the Developer Tools window for more information";
    }
  }
</script>

<ErrorDisplay error={errorMessage} />
