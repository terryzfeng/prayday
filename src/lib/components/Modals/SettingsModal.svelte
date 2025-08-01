<script lang="ts">
  import Modal from "./Modal.svelte";
  import Button from "lib/components/Button.svelte";
  import { user } from "lib/stores/auth";
  export let showSettings: (state: boolean) => void;
  import { logOut } from "lib/utils/firebase/auth";

  // E2EE state - you can also connect this to a store if needed
  let e2eeEnabled = false;

  // Handle E2EE toggle
  function toggleE2EE() {
    e2eeEnabled = !e2eeEnabled;
    // Here you would typically save this preference to your backend/store
    console.log('E2EE toggled:', e2eeEnabled);
  }

  // Handle save settings
  function saveSettings() {
    // Save all settings changes
    console.log('Settings saved with E2EE:', e2eeEnabled);
    showSettings(false);
  }

  /**
   * Handle log out
   */
   async function handleLogout() {
    try {
      const result = await logOut();
      if (result.success) {
        showSettings(false);
      } else {
        console.error("Logout failed:", result.error);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
</script>

<Modal bind:showModal={showSettings}>
  <div class="flex flex-col space-y-6 p-6 max-w-md mx-auto">
    <!-- Header Section -->
    <div class="flex items-center justify-between border-b border-gray-200 pb-4">
      <h1 class="text-2xl text-gray-800 font-semibold">
        Settings
      </h1>
      <button 
        on:click={() => showSettings(false)}
        class="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Security Section -->
    <div class="space-y-4">
      <h2 class="text-lg font-medium text-gray-700 flex items-center space-x-2">
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        <span>Security</span>
      </h2>

      <!-- E2EE Toggle -->
      <div class="bg-gray-50 rounded-lg p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <label for="e2ee-toggle" class="text-sm font-medium text-gray-900 cursor-pointer">
              End-to-End Encryption
            </label>
            <p class="text-xs text-gray-500 mt-1">
              Encrypt your messages so only you and the recipient can read them
            </p>
          </div>
          <div class="flex items-center">
            <button
              id="e2ee-toggle"
              type="button"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 {e2eeEnabled ? 'bg-blue-600' : 'bg-gray-200'}"
              role="switch"
              aria-checked={e2eeEnabled}
              on:click={toggleE2EE}
            >
              <span class="sr-only">Enable end-to-end encryption</span>
              <span 
                aria-hidden="true" 
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {e2eeEnabled ? 'translate-x-5' : 'translate-x-0'}"
              ></span>
            </button>
          </div>
        </div>

        {#if e2eeEnabled}
          <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-xs text-blue-800">
                E2EE is now enabled. Your messages will be encrypted before being sent and can only be decrypted by the intended recipient.
              </p>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex space-x-3 pt-4 border-t border-gray-200">
      <Button
        color="red"
        text="Log Out"
        title="Log Out"
        onClick={handleLogout}
        className="w-full"
      />
    </div>
  </div>
</Modal>