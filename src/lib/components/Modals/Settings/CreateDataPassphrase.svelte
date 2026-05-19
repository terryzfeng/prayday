<!-- AdvancedPrayerProtection.svelte -->
<script lang="ts">
  import Button from "lib/components/Button.svelte";
  import backChevron from "lib/assets/back-chevron.svg";
  import { account } from "lib/stores/accountStore";

  export let onBack: () => void;

  let dataPassphrase = "";
  let dataPassphrase2 = "";
  let errorMessage = "";
  let loading = false;

  async function handleSubmit() {
    loading = true;
    errorMessage = "";

    try {
      if (dataPassphrase !== dataPassphrase2) {
        throw new Error("Passphrases do not match. Please try again.");
      }

      if (dataPassphrase.length < 8) {
        throw new Error("Passphrase must be at least 8 characters long.");
      }

      // TODO: Add your encryption setup logic here
      const result = await account.enableE2EE(dataPassphrase);
      if (!result) {
        throw new Error(
          "Failed to enable Advanced Prayer Protection. Please try again later.",
        );
      }

      // Success - close the modal or navigate back
      onBack();
    } catch (error: unknown) {
      errorMessage = (error as Error).message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="modal-page">
  <div class="w-full space-y-6">
    <!-- Header -->
    <div class="flex items-center space-x-3 line-section">
      <button
        on:click={onBack}
        class="p-2 rounded-lg hover:bg-secondary transition-colors"
        aria-label="Go back"
        disabled={loading}
      >
        <img src={backChevron} alt="Go back" class="w-5 h-5" />
      </button>
      <h1 class="h1">Advanced Prayer Protection</h1>
    </div>

    <!-- Description -->
    <div class="space-y-3">
      <p class="text-secondary-foreground text-sm">
        Create a secure data passphrase. This data passphrase will be required
        to unlock and view your prayers.
      </p>
      <div
        class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm"
      >
        <strong>Important:</strong> If you forget your data passphrase, your prayers
        cannot be recovered. Please store your data passphrase in a safe place.
      </div>
    </div>

    <!-- Error Message -->
    {#if errorMessage}
      <div
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm"
        role="alert"
      >
        {errorMessage}
        <button
          class="absolute top-0 bottom-0 right-0 px-4 py-2"
          on:click={() => (errorMessage = "")}
          disabled={loading}
        >
          ×
        </button>
      </div>
    {/if}

    <!-- Form -->
    <form
      class="space-y-4"
      on:submit|preventDefault={handleSubmit}
      autocomplete="off"
    >
      <div class="space-y-4">
        <div class="space-y-2">
          <label
            for="passphrase"
            class="block text-sm font-medium text-card-foreground"
          >
            Enter Data Passphrase
          </label>
          <input
            id="passphrase"
            type="password"
            placeholder="Enter data passphrase"
            bind:value={dataPassphrase}
            required
            autocomplete="new-password"
            class="text-sm w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={loading}
          />
        </div>

        <div class="space-y-2">
          <label
            for="confirm-passphrase"
            class="block text-sm font-medium text-card-foreground"
          >
            Confirm Data Passphrase
          </label>
          <input
            id="confirm-passphrase"
            type="password"
            placeholder="Confirm data passphrase"
            bind:value={dataPassphrase2}
            required
            autocomplete="new-password"
            class="text-sm w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={loading}
          />
        </div>
      </div>
    </form>

    <!-- Action Buttons -->
    <div class="flex flex-col items-center space-y-3 pt-4 mx-auto">
      <Button
        text={loading ? "Enabling..." : "Enable Advanced Prayer Protection"}
        color="blue"
        className="w-full"
        disabled={loading || !dataPassphrase || !dataPassphrase2}
        onClick={handleSubmit}
      />
      <Button
        text="Cancel"
        color="orange"
        className="w-full"
        onClick={onBack}
      />
    </div>
  </div>
</div>
