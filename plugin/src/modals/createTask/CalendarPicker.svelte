<script lang="ts">
  import type { Moment } from "moment";
  import moment from "moment";
  import { createEventDispatcher } from "svelte";

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  export let selected: Moment | undefined;

  const dispatch = createEventDispatcher();

  type Month = Week[];
  type Week = Day[];
  type Day = Moment | null;

  $: year = selected?.year() ?? moment().year();
  $: month = selected?.month() ?? moment().month();
  $: monthData = getMonthData(month, year);

  function getMonthData(month: number, year: number): Month {
    let monthData = [];

    let day = moment(`${year}-${month + 1}-01 00:00:00`);
    let week = [];

    // Pad the front of the data with empty days in a week before the 1st of the month.
    for (let i = 0; i < day.day(); i++) {
      week.push(null);
    }

    // Fill in the weeks.
    while (day.month() == month) {
      week.push(day);
      day = day.clone().add(1, "day");

      if (week.length == 7) {
        monthData.push(week);
        week = [];
      }
    }

    // Now pad the end of the month such that the week is full.
    if (week.length != 0) {
      while (week.length != 7) {
        week.push(null);
      }

      monthData.push(week);
    }

    return monthData;
  }

  function decrementMonth() {
    month -= 1;

    if (month == -1) {
      month = 11;
      year -= 1;
    }
  }

  function incrementMonth() {
    month += 1;

    if (month == 12) {
      month = 0;
      year += 1;
    }
  }
</script>

<div class="month-controls">
  <span class="control-button" on:click={decrementMonth}
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
        clip-rule="evenodd"
      />
    </svg></span
  >
  <span class="current-month"
    >{moment(`${year}-${month + 1}-01 00:00:00`).format("MMM YYYY")}</span
  >
  <span class="control-button" on:click={incrementMonth}
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
        clip-rule="evenodd"
      />
      <path
        fill-rule="evenodd"
        d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
        clip-rule="evenodd"
      />
    </svg></span
  >
</div>
<div class="month-display">
  <div class="week week-header">
    {#each daysOfWeek as dow}
      <div class="day">{dow}</div>
    {/each}
  </div>
  {#each monthData as week}
    <div class="week">
      {#each week as day}
        {#if day}
          <div
            class="day {selected?.isSame(day, 'day')
              ? 'selected-day'
              : ''} {moment().isAfter(day, 'day') ? 'past-day' : ''}"
            on:click={() => dispatch("selectDate", day)}
          >
            {day.date()}
          </div>
        {:else}
          <div class="day" />
        {/if}
      {/each}
    </div>
  {/each}
</div>

<style>
  .week {
    display: flex;
  }

  .week-header {
    border-bottom: 1px solid var(--background-modifier-border);
  }

  .day {
    width: 14.28%;
    text-align: center;
    height: 1.5em;
  }

  .past-day {
    color: var(--text-muted);
  }

  .selected-day {
    background-color: var(--background-secondary);
    color: var(--text-accent);
  }

  .day:not(:empty):hover {
    background-color: var(--background-secondary);
  }

  .month-controls {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 10px;
  }

  .control-button {
    color: var(--text-muted);
  }

  .control-button > svg {
    height: 20px;
    width: 20px;
  }

  .current-month {
    margin: 0 10px;
  }
</style>
