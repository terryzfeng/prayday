<!-- EnterDataPassphrase.svelte -->
<script lang="ts">
  import Modal from "lib/components/Modals/Modal.svelte";
  import Button from "lib/components/Button.svelte";
  import { account } from "lib/stores/accountStore";
  import {
    e2eeEnabledStore,
    showPassphraseModalStore,
  } from "lib/stores/e2eeEnabledStore";
  export let showInputPassphrase: (state: boolean) => void;
  let dataPassphrase = "";
  let errorMessage = "";
  let loading = false;
  let isVisible = false;

  async function handleSubmit() {
    loading = true;
    errorMessage = "";
    try {
      if (!dataPassphrase) {
        throw new Error("Please enter your passphrase.");
      }
      // TODO: Add your decryption/verification logic here
      // const result = await verifyPassphrase(dataPassphrase);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // For demo purposes, simulate a failed attempt occasionally
      if (dataPassphrase === "wrong") {
        throw new Error("Incorrect passphrase. Please try again.");
      }
      // Success - reset form and close modal
      dataPassphrase = "";
      showInputPassphrase(false);
      showPassphraseModalStore.set(false);
    } catch (error: unknown) {
      errorMessage = (error as Error).message;
    } finally {
      loading = false;
    }
  }

  function closeInputDataPassphrase() {
    showInputPassphrase(false);
    showPassphraseModalStore.set(false);
    isVisible = false;
  }

  $: {
    // Once user logs in and if e2ee is enabled for this account
    if (
      $account?.isCloudAccount &&
      $showPassphraseModalStore &&
      $e2eeEnabledStore
    ) {
      if (!isVisible) {
        console.log("show input passphrase");
        console.log("is cloud account", $account?.isCloudAccount);
        console.log("show passphrase modal", $showPassphraseModalStore);
        console.log("e2ee enabled", $e2eeEnabledStore);
        showInputPassphrase(true);
        isVisible = true;
      }
    }
  }
</script>

<Modal
  bind:showModal={showInputPassphrase}
  showClosePrompt={false}
  onClose={closeInputDataPassphrase}
>
  <div class="flex flex-col items-center space-y-8 px-4 py-6">
    <h1
      class="text-4xl font-black font-title select-none text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-400"
    >
      Prayday
    </h1>

    <div class="w-full max-w-sm space-y-4">
      <div class="space-y-2 flex flex-col justify-center text-center">
        <h2 class="text-xl font-semibold text-center">Enter Data Passphrase</h2>
        <div class="pb-2 text-sm text-gray-500">
          Enter your passphrase to decrypt and access your protected prayers.
        </div>
      </div>

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

      <form
        class="space-y-4"
        on:submit|preventDefault={handleSubmit}
        autocomplete="off"
      >
        <div class="space-y-2">
          <div class="relative">
            <input
              type="password"
              placeholder="Enter your data passphrase"
              bind:value={dataPassphrase}
              required
              autocomplete="current-password"
              class="text-sm w-full px-4 py-2 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-300"
              disabled={loading}
            />
          </div>
        </div>

        <Button
          text={loading ? "Verifying..." : "Unlock Prayers"}
          color="blue"
          className="w-full"
          disabled={loading || !dataPassphrase}
        />
      </form>
    </div>
  </div>
</Modal>
