<!-- ThemeSettings.svelte -->
<script lang="ts">
  import backChevron from "lib/assets/back-chevron.svg";
  import { account } from "lib/stores/accountStore";
  import { Theme } from "lib/utils/settings";

  export let onBack: () => void;

  let currentTheme = $account?.settings.theme || Theme.System;

  async function updateTheme(theme: Theme) {
    currentTheme = theme;
    if ($account) {
      await account.updateSettings({ ...$account.settings, theme });
    }
  }
</script>

<div class="modal-page">
  <div class="w-full space-y-6">
    <!-- Header -->
    <div class="flex items-center space-x-3 line-section">
      <button
        on:click={onBack}
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Go back"
      >
        <img src={backChevron} alt="Go back" class="w-5 h-5 dark:invert" />
      </button>
      <h1 class="h1">Theme</h1>
    </div>

    <!-- Content -->
    <div class="space-y-4">
      <label class="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <input type="radio" name="theme" value={Theme.Light} checked={currentTheme === Theme.Light} on:change={() => updateTheme(Theme.Light)} class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
        <span class="text-gray-900 dark:text-gray-100 font-medium">Light</span>
      </label>
      
      <label class="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <input type="radio" name="theme" value={Theme.Dark} checked={currentTheme === Theme.Dark} on:change={() => updateTheme(Theme.Dark)} class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
        <span class="text-gray-900 dark:text-gray-100 font-medium">Dark</span>
      </label>
      
      <label class="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <input type="radio" name="theme" value={Theme.System} checked={currentTheme === Theme.System} on:change={() => updateTheme(Theme.System)} class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
        <span class="text-gray-900 dark:text-gray-100 font-medium">System Default</span>
      </label>
    </div>
  </div>
</div>
