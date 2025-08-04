<!-- AdvancedPrayerProtection.svelte -->
<script lang="ts">
  import Button from "lib/components/Button.svelte";
  import Toggle from "lib/components/Toggle.svelte";

  export let onBack: () => void;
  export let onClose: () => void;

  // E2EE state - you can also connect this to a store if needed
  let e2eeEnabled = false;
  let autoDeleteEnabled = true;
  let encryptionLevel = "standard";

  // Handle E2EE toggle
  function toggleE2EE() {
    e2eeEnabled = !e2eeEnabled;
    console.log("E2EE toggled:", e2eeEnabled);
  }

  function toggleAutoDelete() {
    autoDeleteEnabled = !autoDeleteEnabled;
    console.log("Auto delete toggled:", autoDeleteEnabled);
  }

  // Handle save settings
  function saveSettings() {
    console.log("Prayer protection settings saved:", {
      e2eeEnabled,
      autoDeleteEnabled,
      encryptionLevel,
    });
    onClose();
  }
</script>

<div class="flex flex-col space-y-4 p-6">
  <!-- Header with back button -->
  <div class="flex items-center space-x-3 line-section">
    <button
      on:click={onBack}
      class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label="Go back"
    >
      <svg
        class="w-5 h-5 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        ></path>
      </svg>
    </button>
    <h1 class="h1">Advanced Prayer Protection</h1>
  </div>

  <!-- Settings Content -->
  <div class="space-y-4">
    <!-- End-to-End Encryption -->
    <div class="bg-gray-50 rounded-lg p-4 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <label
            for="e2ee-toggle"
            class="text-sm font-medium text-gray-900 cursor-pointer"
          >
            End-to-End Encryption
          </label>
          <p class="text-xs text-gray-500 mt-1">
            Encrypt your prayers so only you and God can read them
          </p>
        </div>
        <Toggle
          label="Enable end-to-end encryption"
          state={e2eeEnabled}
          onClick={toggleE2EE}
        />
      </div>
      {#if e2eeEnabled}
        <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div class="flex items-start space-x-2">
            <svg
              class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p class="text-xs text-blue-800">
              E2EE is now enabled. Your prayers will be encrypted before being
              sent and can only be decrypted by the intended recipient.
            </p>
          </div>
        </div>
      {/if}
    </div>

    <!-- Auto Delete -->
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <label
            for="auto-delete-toggle"
            class="text-sm font-medium text-gray-900 cursor-pointer"
          >
            Auto Delete Prayers
          </label>
          <p class="text-xs text-gray-500 mt-1">
            Automatically delete prayers after 30 days for privacy
          </p>
        </div>
        <Toggle
          label="Enable auto delete"
          state={autoDeleteEnabled}
          onClick={toggleAutoDelete}
        />
      </div>
    </div>

    <!-- Encryption Level -->
    <div class="bg-gray-50 rounded-lg p-4">
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label class="text-sm font-medium text-gray-900">Encryption Level</label>
      <p class="text-xs text-gray-500 mt-1 mb-3">
        Choose the strength of encryption for your prayers
      </p>
      <select
        bind:value={encryptionLevel}
        class="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="standard">Standard (256-bit)</option>
        <option value="high">High Security (512-bit)</option>
        <option value="military">Military Grade (1024-bit)</option>
      </select>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex space-x-3 pt-4 border-t border-gray-200">
    <Button text="Cancel" onClick={onBack} className="flex-1" />
    <Button
      color="blue"
      text="Save Settings"
      onClick={saveSettings}
      className="flex-1"
    />
  </div>
</div>
