<!-- SettingsModal.svelte -->
<script lang="ts">
  import NavigableModal from "../NavigableModal.svelte";
  import SettingsMain from "./SettingsMain.svelte";
  import AdvancedPrayerProtection from "./AdvancedPrayerProtection.svelte";
  import CreateDataPassphrase from "./createDataPassphrase.svelte";
  import InputDataPassphrase from "./enterDataPassphrase.svelte";

  let modalRef: NavigableModal;
  let currentPage = "main";

  // Define Settings pages
  const pages = {
    main: SettingsMain,
    "advanced-prayer-protection": AdvancedPrayerProtection,
    "create-data-passphrase": InputDataPassphrase
  };

  // Open Settings Navigable Modal
  export const openSettings = () => {
    modalRef?.openModal();
  };
</script>

<NavigableModal bind:this={modalRef} bind:currentPage {pages}>
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
      <AdvancedPrayerProtection onNavigate={navigateToPage} onBack={navigateBack} onClose={closeModal} />
    {:else if currentPage === "create-data-passphrase"}
      <CreateDataPassphrase onBack={navigateBack} onClose={closeModal} />
    {/if}
  </svelte:fragment>
</NavigableModal>
