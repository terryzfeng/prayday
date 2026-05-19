<script lang="ts">
  import PrayerList from "lib/components/PrayerList.svelte";
  import { accountPrayersLocked } from "lib/stores/accountPrayersLocked";
  import { showDataPassphraseModalStore } from "lib/stores/e2eeEnabledStore";
</script>

<div>
  {#if $accountPrayersLocked}
    <div class="text-center py-2 text-muted-foreground space-y-2">
      Your Prayers are currently encrypted.
      <br />
      <button
        class="text-blue-500 hover:text-blue-600"
        on:click={() => {
          showDataPassphraseModalStore.set(true);
        }}
      >
        Unlock Prayers
      </button>
    </div>
  {:else}
    <PrayerList />
  {/if}
</div>
