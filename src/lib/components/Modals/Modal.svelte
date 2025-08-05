<!-- Modal.svelte -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { portal } from "lib/actions/portal.js";

  let modalDialog: HTMLDialogElement;
  let isClosing = false;

  // Show click outside modal to close help prompt
  export let showClosePrompt = true;
  // Callback for when modal should close (outside click, escape key, etc.)
  export let onClose: (() => void) | undefined = undefined;

  /**
   * Reset scroll position to top
   */
  export function resetScroll() {
    if (modalDialog) {
      modalDialog.scrollTop = 0;
    }
  }

  /**
   * Set modal state
   * @param state change modal to this state
   */
  export function showModal(state: boolean) {
    if (!modalDialog) return; // Ensure modalDialog is assigned
    if (state) {
      isClosing = false;
      modalDialog.showModal();
      document.body.style.overflow = "hidden";
      resetScroll(); // Use the new method
      modalDialog.focus(); // Disable focus on first modal element
    } else {
      // Start closing animation instead of immediately closing
      isClosing = true;
      document.body.style.overflow = "";
      // Wait for animation to complete before actually closing
      setTimeout(() => {
        if (modalDialog) {
          // Add safety check
          modalDialog.close();
          isClosing = false;
        }
      }, 200); // Match this with your CSS transition duration
    }
  }

  /**
   * Hide the modal if click outside
   * @param event
   */
  function handleClick(event: any) {
    if (event.target === modalDialog) {
      console.log("close outside");
      // Call the onClose callback instead of directly calling showModal
      if (onClose) {
        onClose();
      } else {
        // Fallback to direct close if no callback provided
        showModal(false);
      }
    }
  }

  /**
   * Handle escape key press
   * @param event
   */
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      // Call the onClose callback for escape key as well
      if (onClose) {
        onClose();
      } else {
        // Fallback to direct close if no callback provided
        showModal(false);
      }
    }
  }

  onMount(() => {
    if (modalDialog) {
      if (modalDialog.open) {
        // Modal was open before hot reload - sync the state
        showModal(true);
      } else {
        // Modal was closed - ensure everything is clean
        showModal(false);
      }
    }
  });

  // Cleanup if component is destroyed while modal is open
  onDestroy(() => {
    console.log("on destroy");
    showModal(false);
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  class="fixed inset-0 px-6 pt-6 m-auto !scroll-top bg-white w-full max-w-[90%] md:max-w-xl max-h-[80%] md:max-h-[75vh]
    rounded-xl overflow-x-hidden overflow-y-auto
    shadow-[8px_8px_16px_0px_rgba(0,0,0,0.08),-8px_-8px_16px_0px_rgba(255,255,255,0.8)]
    border border-gray-100
    backdrop:bg-white/50 backdrop:backdrop-blur-sm
    focus:outline-none"
  class:closing={isClosing}
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  bind:this={modalDialog}
  on:click={handleClick}
  on:keydown={handleKeydown}
  use:portal
>
  <slot />
  {#if showClosePrompt}
    <p class="text-center text-gray-400 pb-4">Click outside to close</p>
  {:else}
    <div class="h-6"></div>
  {/if}
</dialog>

<style lang="postcss">
  dialog {
    transition:
      display 0.2s,
      overlay 0.3s;
    animation: appear 0.2s forwards;
  }
  /* Use closing class instead of :not([open]) for Safari compatibility */
  dialog.closing {
    animation: disappear 0.2s forwards;
  }
  dialog::backdrop {
    /* background: rgba(255, 255, 255, 0.8); */
    /* backdrop-filter: blur(4px); */
    /* transition: opacity 0.3s ease; */
  }
  @keyframes appear {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes disappear {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
</style>
