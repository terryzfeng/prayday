<!-- AdvancedPrayerProtection.svelte -->
<script lang="ts">
  import Button from "lib/components/Button.svelte";
  import backChevron from "lib/assets/back-chevron.svg";
  import { e2eeEnabledStore } from "lib/stores/e2eeEnabledStore";

  export let onNavigate: (page: string) => void;
  export let onBack: () => void;
</script>

<div class="modal-page">
  <div class="w-full space-y-6">
    <!-- APP Header-->
    <div class="flex items-center space-x-3 line-section">
      <button
        on:click={onBack}
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Go back"
      >
        <img src={backChevron} alt="Go back" class="w-5 h-5" />
      </button>
      <h1 class="h1">Advanced Prayer Protection</h1>
    </div>

    <!-- APP Content -->
    <div class="space-y-4 text-gray-600 leading-relaxed">
      <p>
        Prayday always encrypts your data to keep it secure. Advanced Prayer
        Protection is an optional feature that enables end-to-end encryption to
        ensure that your prayers can only be decrypted on your trusted devices,
        protecting your information even in the case of a data breach.
      </p>
      {#if !$e2eeEnabledStore}
        <p>
          Create a data passphrase to enable Advanced Prayer Protection. If you
          ever lose your device, you will need to enter this data passphrase
          again.
        </p>
      {:else}
        <p class="text-gray-600 leading-relaxed">
          Advanced Prayer Protection is currently enabled. Your prayers can only
          be decrypted on your trusted devices.
        </p>
      {/if}
    </div>

    <!-- Action Buttons -->
    <div class="pt-4">
      {#if !$e2eeEnabledStore}
        <Button
          text="Enable Advanced Prayer Protection"
          onClick={() => onNavigate("create-data-passphrase")}
          color="blue"
          className="w-full"
        />
      {:else}
        <Button
          text="Disable Advanced Prayer Protection"
          onClick={() => onNavigate("remove-data-passphrase")}
          color="red"
          className="w-full"
        />
      {/if}
    </div>
  </div>
</div>
