<script lang="ts">
  import NavigableModal from "../NavigableModal.svelte";
  import AboutMain from "./AboutMain.svelte";
  import PrivacyPage from "./PrivacyPage.svelte";

  let modalRef: NavigableModal;
  let currentPage = "main";

  // Define Settings pages
  const pages = {
    main: AboutMain,
    "privacy-page": PrivacyPage,
  };

  // Open Settings Navigable Modal
  export const openAbout = () => {
    modalRef?.openModal();
  };
</script>

<NavigableModal bind:this={modalRef} bind:currentPage {pages}>
  <svelte:fragment
    slot="default"
    let:currentPage
    let:navigateToPage
    let:navigateBack
  >
    {#if currentPage === "main"}
      <AboutMain onNavigate={navigateToPage} />
    {:else if currentPage === "privacy-page"}
      <PrivacyPage onBack={navigateBack} />
    {/if}
  </svelte:fragment>
</NavigableModal>
