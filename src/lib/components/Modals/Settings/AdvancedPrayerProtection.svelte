<!-- AdvancedPrayerProtection.svelte -->
<script lang="ts">
  import Button from "lib/components/Button.svelte";
  import Toggle from "lib/components/Toggle.svelte";
  import backChevron from "lib/assets/back-chevron.svg";

  export let onNavigate: (page: string) => void;
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
    <div class="space-y-4">
      <p class="text-gray-600 leading-relaxed">
        Prayday always encrypts your data to keep it secure. Advanced Prayer Protection
        is an optional feature that enables end-to-end encryption to ensure that your prayers  
        can only be decrypted on your trusted devices, protecting your
        information even in the case of a data breach.<br />
        <br />
        Create a data passphrase to enable end-to-end encryption. If you ever lose your device, you 
        will need to enter this passphrase again.
      </p>

      <!-- <div class="bg-gray-50 rounded-lg p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <label
              for="e2ee-toggle"
              class="text-sm font-medium text-gray-900 cursor-pointer"
            >
              End-to-End Encryption
            </label>
            <p class="text-xs text-gray-500 mt-1">
              Prayday encrypts your data to keep it secure. Advanced Data
              protection uses end-to-end encryption to ensure that Prayers can
              only read by you, protecting your information even in the case of
              a data breach.
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
      </div> -->
    </div>

    <!-- Action Buttons -->
    <div class="flex space-x-3 pt-4">
      <!-- <Button text="Cancel" onClick={onBack} className="flex-1" />
      <Button
        color="blue"
        text="Save Settings"
        onClick={saveSettings}
        className="flex-1"
      /> -->
      <Button text="Enable Advanced Prayer Protection" onClick={() => onNavigate("create-data-passphrase")} color="blue" className={"w-full"}/>
    </div>
  </div>
</div>
