<script lang="ts">
  import PrayerCard from "lib/components/PrayerCard.svelte";
  import PrayerRequest from "lib/utils/prayer-request";
  import { sortFilterPrayersView } from "lib/stores/filterStatesStore";
  import { flip } from "svelte/animate";

  let sortedPrayers: PrayerRequest[] = [];

  // Subscribe to the derived store
  sortFilterPrayersView.subscribe((value: PrayerRequest[]) => {
    sortedPrayers = value;
  });

  const flipOptions = {
    duration: 300,
  };
</script>

<div class="prayer-grid">
  {#if sortedPrayers.length === 0}
    <div class="text-center py-8 text-gray-400">
      Add a Prayer Request to get started
    </div>
  {:else}
    {#each sortedPrayers as prayer, index (prayer.uuid)}
      <div animate:flip={flipOptions}>
        <PrayerCard {prayer} highlight={index === 0} />
      </div>
    {/each}
  {/if}
</div>

<style>
  .prayer-grid {
    display: grid;
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
  }
</style>
