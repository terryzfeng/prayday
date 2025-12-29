<!-- SettingsMain.svelte -->
<script lang="ts">
  import Button from "lib/components/Button.svelte";
  import SettingsItem from "./SettingsItem.svelte";
  import { logOut } from "lib/utils/firebase/auth";
  import {
    e2eeEnabledStore,
    showDataPassphraseModalStore,
  } from "lib/stores/e2eeEnabledStore";
  import { accountPrayersLocked } from "lib/stores/accountPrayersLocked";

  export let onNavigate: (page: string) => void;
  export let onClose: () => void;

  // @ts-ignore
  const version = import.meta.env.VERSION;

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
  <div class="w-full space-y-4">
    <h1 class="h1 line-section">Settings</h1>
    <!-- Settings Items -->
    <div class="space-y-3">
      <!-- Account Section -->
      <div class="space-y-2">
        <h2 class="h2">Your Account</h2>
        {#if $accountPrayersLocked}
          <SettingsItem
            headline="Unlock Prayers"
            description="Prayers are currently encrypted"
            onClick={() => {
              showDataPassphraseModalStore.set(true);
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
      <!-- More Info-->
      <div class="space-y-2">
        <h2 class="h2">More Info</h2>
        <SettingsItem
          headline={"Prayday Version"}
          description="What's new in Prayday?"
          onClick={() => onNavigate("version-page")}
        />
      </div>
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
