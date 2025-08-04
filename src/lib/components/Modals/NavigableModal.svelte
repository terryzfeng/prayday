<!-- NavigableModal.svelte - General Modal Component with Navigation -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Modal from "./Modal.svelte";

  let showModal = (state: boolean) => {};

  export let currentPage: string = "main"; // Default page
  export let pages: Record<string, any> = {};

  // Track if we're managing history
  let historyEntries = 0;
  let isModalOpen = false;

  onMount(() => {
    // Listen for popstate (back button/gesture)
    window.addEventListener("popstate", handlePopState);
  });

  onDestroy(() => {
    window.removeEventListener("popstate", handlePopState);
    cleanupHistory();
  });

  function handlePopState(event: PopStateEvent) {
    if (event.state?.modalPage) {
      const newPage = event.state.modalPage;
      currentPage = newPage;
      historyEntries = Math.max(0, historyEntries - 1);

      if (newPage === "main" && historyEntries <= 0) {
        // If we're back to main and this was the last entry, close modal
        closeModal();
      }
    } else if (isModalOpen && historyEntries > 0) {
      // Back gesture while modal is open - close modal
      closeModal();
    }
  }

  export function navigateToPage(page: string) {
    currentPage = page;

    // Push new state to history
    history.pushState(
      { modalPage: page },
      "",
      window.location.pathname + window.location.search,
    );
    historyEntries++;
  }

  export function navigateBack() {
    // Use browser back instead of manual navigation
    if (historyEntries > 1) {
      history.back();
    } else {
      // If we're at the first page, close the modal
      closeModal();
    }
  }

  export function openModal(initialPage: string = "main") {
    isModalOpen = true;
    currentPage = initialPage;

    // Push initial modal state
    history.pushState(
      { modalPage: initialPage },
      "",
      window.location.pathname + window.location.search,
    );
    historyEntries = 1; // Reset and set to 1

    showModal(true);
  }

  export function closeModal() {
    isModalOpen = false;
    const wasOnMainPage = currentPage === "main";
    currentPage = "main";

    // Only clean up history if we're not already on main page
    if (!wasOnMainPage) {
      cleanupHistory();
    } else {
      historyEntries = 0;
    }

    showModal(false);
  }

  function cleanupHistory() {
    // Go back through all our history entries
    if (historyEntries > 0) {
      history.go(-historyEntries);
      historyEntries = 0;
    }
  }
</script>

<Modal bind:showModal onClose={closeModal}>
  <div class="max-w-2xl mx-auto">
    <slot {currentPage} {navigateToPage} {navigateBack} {closeModal} {pages} />
  </div>
</Modal>
