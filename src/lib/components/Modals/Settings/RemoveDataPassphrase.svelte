<!-- RemoveDataPassphrase.svelte -->
<script lang="ts">
  import Button from "lib/components/Button.svelte";
  import backChevron from "lib/assets/back-chevron.svg";
  import { account } from "lib/stores/accountStore";

  export let onBack: () => void;

  let dataPassphrase = "";
  let errorMessage = "";
  let loading = false;

  async function handleSubmit() {
    loading = true;
    errorMessage = "";

    try {
      if (!dataPassphrase) {
        throw new Error("Please enter your current data passphrase.");
      }

      const result = await account.disableE2EE(dataPassphrase);
      if (!result) {
        throw new Error(
          "Failed to disable Advanced Prayer Protection. Please try again.",
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
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Go back"
        disabled={loading}
      >
        <img src={backChevron} alt="Go back" class="w-5 h-5" />
      </button>
      <h1 class="h1">Advanced Prayer Protection</h1>
    </div>

    <!-- Description -->
    <div class="space-y-3">
      <p class="text-gray-600 text-sm">
        Are you sure you want to disable Advanced Prayer Protection? Your prayers
        will no longer be end-to-end encrypted.
      </p>
      <!-- <div
        class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm"
      >
        <strong>Warning:</strong> After removing protection, your prayers will be
        stored without the additional encryption layer. This action cannot be undone.
      </div> -->
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
            class="block text-sm font-medium text-gray-700"
          >
            Enter Current Data Passphrase
          </label>
          <input
            id="passphrase"
            type="password"
            placeholder="Enter current data passphrase"
            bind:value={dataPassphrase}
            required
            autocomplete="current-password"
            class="text-sm w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={loading}
          />
        </div>
      </div>
    </form>

    <!-- Action Buttons -->
    <div class="flex flex-col items-center space-y-3 pt-4 mx-auto">
      <Button
        text={loading ? "Disabling..." : "Disable Advanced Prayer Protection"}
        color="red"
        className="w-full"
        disabled={loading || !dataPassphrase}
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
