<script lang="ts">
  export let selected: number;

  interface PriorityOption {
    label: string;
    value: number;
  }

  // Note: Priority is defined in the Todoist API opposite to that in the UI.
  // In the UI priority 4 = lowest, in the API 1 is the lowest.
  const options: PriorityOption[] = [
    {
      label: "4",
      value: 1,
    },
    {
      label: "3",
      value: 2,
    },
    {
      label: "2",
      value: 3,
    },
    {
      label: "1",
      value: 4,
    },
  ];
</script>

<div class="priority-container">
  {#each options as option}
    <div
      class="priority-option {option.value == selected
        ? 'priority-selected'
        : ''} priority-{option.label}"
      on:click={() => {
        selected = option.value;
      }}
    >
      <span>{option.label}</span>
    </div>
  {/each}
</div>

<style>
  .priority-container {
    display: flex;
    height: 42px;
  }

  .priority-option {
    width: 25%;
    height: 42px;
    text-align: center;
    border: 1px solid var(--background-modifier-border);
    background: var(--background-modifier-form-field);
  }

  .priority-option > span {
    line-height: 42px;
  }

  .priority-selected {
    border: 1px solid var(--interactive-accent);
    background: var(--background-modifier-form-field-highlighted);
  }

  .priority-container .priority-option:first-child {
    border-radius: 10px 0 0 10px;
  }

  .priority-container .priority-option:last-child {
    border-radius: 0 10px 10px 0;
  }
</style>
