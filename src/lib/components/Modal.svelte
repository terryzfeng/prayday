<script lang="ts">
  import { onDestroy } from "svelte";
  import { portal } from "lib/actions/portal.js";
  let modalDialog: HTMLDialogElement;

  /**
   * Set modal state
   * @param state change modal to this state
   */
  export function showModal(state: boolean) {
    if (state) {
      modalDialog.showModal();
      document.body.style.overflow = "hidden";
      modalDialog.scrollTop = 0;
    } else {
      modalDialog.close();
      document.body.style.overflow = "";
    }
  }

  /**
   * Hide the modal if click outside
   * @param event
   */
  function handleClick(event: any) {
    if (event.target === modalDialog) {
      showModal(false);
    }
  }

  // Cleanup if component is destroyed while modal is open
  onDestroy(() => {
    document.body.style.overflow = "";
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  class="fixed inset-0 p-6 m-auto !scroll-top bg-white w-full max-w-[90%] md:max-w-xl max-h-[80%] md:max-h-[75vh]
    rounded-xl overflow-x-hidden overflow-y-auto
    shadow-[8px_8px_16px_0px_rgba(0,0,0,0.08),-8px_-8px_16px_0px_rgba(255,255,255,0.8)]
    border border-gray-100
    backdrop:bg-white/50 backdrop:backdrop-blur-sm
    focus:outline-none"
  bind:this={modalDialog}
  on:click={handleClick}
  use:portal
>
  <slot />
</dialog>

<style lang="postcss">
  dialog {
    transition:
      display 0.2s allow-discrete,
      overlay 0.3s allow-discrete;
    animation: appear 0.2s forwards;
  }
  dialog[open] {
    scroll-top: 0;
  }
  dialog:not([open]) {
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
