<!-- SettingsModal.svelte -->
<script lang="ts">
  import NavigableModal from "../NavigableModal.svelte";
  import SettingsMain from "./SettingsMain.svelte";
  import AdvancedPrayerProtection from "./AdvancedPrayerProtection.svelte";
  import CreateDataPassphrase from "./CreateDataPassphrase.svelte";
  import RemoveDataPassphrase from "./RemoveDataPassphrase.svelte";

  let modalRef: NavigableModal;
  let currentPage = "main";

  // Define Settings pages
  const pages = {
    main: SettingsMain,
    "advanced-prayer-protection": AdvancedPrayerProtection,
    "create-data-passphrase": CreateDataPassphrase,
    "remove-data-passphrase": RemoveDataPassphrase,
  };

  // Conditionally set showClosePrompt based on current page
  let showClosePrompt: boolean;
  $: showClosePrompt =
    currentPage !== "create-data-passphrase" &&
    currentPage !== "remove-data-passphrase";

  // Open Settings Navigable Modal
  export const openSettings = () => {
    modalRef?.openModal();
  };
</script>

<NavigableModal bind:this={modalRef} bind:currentPage {pages} {showClosePrompt}>
  <svelte:fragment
    slot="default"
    let:currentPage
    let:navigateToPage
    let:navigateBack
    let:closeModal
  >
    {#if currentPage === "main"}
      <SettingsMain onNavigate={navigateToPage} onClose={closeModal} />
    {:else if currentPage === "advanced-prayer-protection"}
      <AdvancedPrayerProtection
        onNavigate={navigateToPage}
        onBack={navigateBack}
      />
    {:else if currentPage === "create-data-passphrase"}
      <CreateDataPassphrase onBack={navigateBack} />
    {:else if currentPage === "remove-data-passphrase"}
      <RemoveDataPassphrase onBack={navigateBack} />
    {/if}
  </svelte:fragment>
</NavigableModal>
