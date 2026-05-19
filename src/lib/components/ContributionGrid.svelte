<script lang="ts">
  import {
    USER_HISTORY_SIZE,
    userHistoryPrayerCounts,
    userHistoryDates,
  } from "../stores/userHistoryStore";
  import { dayOfTheWeek } from "../utils/date-utils";
  import ContributionCell from "./ContributionCell.svelte";

  const MIN_DAYS = 29;

  export const data: number[] = Array(USER_HISTORY_SIZE).fill(0);

  /**
   * Compute the color based on prayer count
   * @param count
   */
  function getColor(count: number): string {
    if (count === 0) return "bg-secondary";
    if (count <= 2) return "bg-blue-200";
    if (count <= 4) return "bg-blue-300";
    if (count <= 6) return "bg-blue-400";
    return "bg-blue-500";
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let recentDayTotal: number;
  let countsForDisplay: number[];
  let datesForDisplay: string[];
  let weeks: number[][];
  let dayLabels: string[][];

  // Compute number of calendar days to display (max USER_HISTORY_SIZE)
  const numRecentDays = MIN_DAYS + dayOfTheWeek();
  const numPadDays = USER_HISTORY_SIZE - numRecentDays;

  const padDates: string[] = Array(numPadDays).fill("");
  const padCounts: number[] = Array(numPadDays).fill(-1);

  // Slice and append padding for date names
  $: {
    const recentDates = $userHistoryDates.slice(-numRecentDays);
    datesForDisplay = recentDates.concat(padDates);
  }

  // Dynamically update Contribution Grid
  $: {
    // Prayer counts array with trailing padding
    const recentDayCounts = $userHistoryPrayerCounts.slice(-numRecentDays);
    recentDayTotal = recentDayCounts.reduce((acc, curr) => acc + curr, 0);
    countsForDisplay = recentDayCounts.concat(padCounts);

    // Convert arrays to 2d for display
    weeks = [];
    dayLabels = [];
    for (let i = 0; i < recentDayCounts.length; i += 7) {
      weeks.push(countsForDisplay.slice(i, i + 7));
      dayLabels.push(datesForDisplay.slice(i, i + 7));
    }
  }
</script>

<div class="w-full bg-card rounded-lg pt-4 pb-2">
  <div class="flex flex-col sm:flex-row sm:justify-between align-middle pb-2">
    <div class="items-center pb-1 sm:pb-2">
      <span class="text-secondary-foreground font-medium"
        >{recentDayTotal} prayers in the last month</span
      >
    </div>
    <!-- Legend -->
    <div class="flex items-center space-x-1 self-start py-1">
      <span class="text-xs text-muted-foreground">Less</span>
      {#each [0, 2, 4, 6, 8] as level (level)}
        <div class="w-3 h-3 rounded-sm {getColor(level)}"></div>
      {/each}
      <span class="text-xs text-muted-foreground">More</span>
    </div>
  </div>

  <!-- Weekday headers -->
  <div class="grid grid-cols-7 gap-1 mb-1">
    {#each weekdays as day (day)}
      <div class="text-xs text-muted-foreground text-center">{day}</div>
    {/each}
  </div>

  <!-- Calendar grid -->
  <div class="grid gap-1">
    {#each weeks as week, indexWeek (indexWeek)}
      <div class="grid grid-cols-7 gap-1">
        {#each week as dayCount, indexDay (`${indexWeek}-${indexDay}`)}
          <ContributionCell
            {dayCount}
            dateName={dayLabels[indexWeek][indexDay]}
          />
        {/each}
      </div>
    {/each}
  </div>
</div>
