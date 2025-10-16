<!-- SettingsMain.svelte -->
<script lang="ts">
  import Button from "lib/components/Button.svelte";
  import SettingsItem from "./SettingsItem.svelte";
  import { logOut } from "lib/utils/firebase/auth";
  import {
    e2eeEnabledStore,
    showDataPassphraseModalStore,
  } from "lib/stores/e2eeEnabledStore";
  import { account } from "lib/stores/accountStore";

  export let onNavigate: (page: string) => void;
  export let onClose: () => void;

  /**
   * Handle log out
   */
  async function handleLogout() {
    try {
      const result = await logOut();
      if (!result.success) {
        throw new Error(result.error);
      }
      // Logout success
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
</script>

<div class="modal-page">
  <div class="w-full space-y-6">
    <h1 class="h1 line-section">Settings</h1>

    <!-- Account Section -->
    <div class="space-y-3">
      <h2 class="h2">
        <span>Manage Your Account</span>
      </h2>
      {#if !$account?.initialized}
        <SettingsItem
          headline="Unlock Prayers"
          description="Prayers are currently encrypted"
          onClick={() => {
            showPassphraseModalStore.set(true);
            onClose();
          }}
        />
      {/if}
      <SettingsItem
        headline="Advanced Prayer Protection"
        description={$e2eeEnabledStore === true
          ? "Manage settings"
          : "Encrypt your prayers to keep them secure"}
        onClick={() => onNavigate("advanced-prayer-protection")}
      />
    </div>

    <!-- Log Out Section -->
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
</div>
