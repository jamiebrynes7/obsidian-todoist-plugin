<script lang="ts">
  import type { Moment } from "moment";
  import moment from "moment";
  import CalendarPicker from "./CalendarPicker.svelte";

  export let selected: Moment | undefined = undefined;

  let container: HTMLDivElement | undefined = undefined;
  let target: HTMLDivElement | undefined = undefined;
  let drawerOpen = false;

  function setDate(date: Moment | undefined) {
    selected = date;
    drawerOpen = false;
  }

  function handleWindowClick(ev: MouseEvent) {
    if (!drawerOpen || !target) {
      return;
    }

    const eventPath = ev.composedPath();
    const eventTarget = eventPath.length > 0 ? eventPath[0] : ev.target;

    if (target.contains(eventTarget as any)) {
      return;
    }

    drawerOpen = false;
  }

  function trackPosition() {
    if (!target || !container) {
      return;
    }

    const { height, width } = container.getBoundingClientRect();

    target.style.minWidth = `${width}px`;
    target.style.width = "auto";

    if (isOutOfViewport(target).bottom) {
      target.style.bottom = `${height + 5}px`;
    }
  }

  function isOutOfViewport(elem: HTMLDivElement) {
    const bounding = elem.getBoundingClientRect();
    const out = {
      top: false,
      left: false,
      bottom: false,
      right: false,
      any: false,
    };

    out.top = bounding.top < 0;
    out.left = bounding.left < 0;
    out.bottom =
      bounding.bottom >
      (window.innerHeight || document.documentElement.clientHeight);
    out.right =
      bounding.right >
      (window.innerWidth || document.documentElement.clientWidth);
    out.any = out.top || out.left || out.bottom || out.right;

    return out;
  }

  const resizeDrawer = (element: HTMLDivElement) => {
    target = element;
    trackPosition();
  };
</script>

<svelte:window on:resize={trackPosition} on:click={handleWindowClick} />

<div
  class="date-input"
  on:click={(ev) => {
    if (!drawerOpen) {
      ev.stopPropagation();
      drawerOpen = true;
    }
  }}
>
  {#if selected}
    <span class="date-preview">{selected.format("MMM D, YYYY")}</span>
    <span
      class="reset-date-button"
      on:click|stopPropagation={() => {
        setDate(undefined);
      }}
      ><svg
        width="100%"
        height="100%"
        viewBox="-2 -2 50 50"
        focusable="false"
        role="presentation"
        ><path
          fill="currentColor"
          d="M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124
          l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z"
        /></svg
      ></span
    >
  {:else}<span class="date-placeholder">No date selected.</span>{/if}
</div>
<div class="drawer-container" bind:this={container}>
  {#if drawerOpen}
    <div class="drawer-target" bind:this={target} use:resizeDrawer>
      <div
        class="specific-date-option"
        on:click={() => {
          setDate(moment());
        }}
      >
        Today
      </div>
      <div
        class="specific-date-option"
        on:click={() => {
          setDate(moment().add(1, "day"));
        }}
      >
        Tomorrow
      </div>
      <div class="calendar-container">
        <CalendarPicker {selected} on:selectDate={(ev) => setDate(ev.detail)} />
      </div>
    </div>
  {/if}
</div>

<style>
  .date-input {
    border: 1px solid var(--background-primary-alt);
    background-color: var(--background-modifier-form-field);
    line-height: 42px;
  }

  .date-input:hover {
    border: 1px solid var(--interactive-accent);
    background-color: var(--background-modifier-form-highlighted);
  }

  .date-preview {
    margin-left: 1em;
  }

  .reset-date-button {
    float: right;
    height: 42px;
    width: 20px;
    margin-right: 10px;
  }

  .date-placeholder {
    margin-left: 1em;
    color: var(--text-muted);
  }

  .drawer-target {
    position: fixed;
    z-index: 2;
    height: auto;
    background-color: var(--background-primary);
  }

  .specific-date-option {
    height: 42px;
    line-height: 42px;
    padding: 0 20px;
  }

  .specific-date-option:hover {
    background-color: var(--background-secondary);
  }

  .calendar-container {
    padding: 20px;
    border-top: 2px solid var(--background-modifier-border);
  }
</style>
