<script lang="ts">
  import {
    ConfirmManager,
    type ConfirmRequest,
  } from "lib/stores/confirmManager";
  import Modal from "./Modals/Modal.svelte";
  import Button from "./Button.svelte";

  let showModal: (state: boolean) => void;
  let currentRequest: ConfirmRequest | null = null;

  ConfirmManager.subscribe((queue) => {
    currentRequest = queue[0] || null;
    if (showModal) {
      if (currentRequest) {
        showModal(true);
      } else {
        showModal(false);
      }
    }
  });

  function handleConfirm() {
    ConfirmManager.resolve(true);
  }

  function handleCancel() {
    ConfirmManager.resolve(false);
  }

  // Don't allow closing via backdrop for confirm dialogs
  function preventClose() {
    // Do nothing - user must click a button
  }
</script>

<Modal
  bind:showModal
  onClose={preventClose}
  showClosePrompt={false}
  preventEscapeClose={true}
>
  {#if currentRequest}
    <div class="pt-1 px-1">
      <!-- Title -->
      <h2 id="modal-title" class="text-xl font-semibold text-gray-700 mb-2">
        {currentRequest.title || "Confirm"}
      </h2>

      <!-- Message -->
      <p id="modal-description" class="text-gray-600 mb-6">
        {currentRequest.message}
      </p>

      <!-- Buttons -->
      <div class="flex gap-3 justify-end">
        <Button
          text={currentRequest.cancelText || "Cancel"}
          color="gray"
          variant="clear"
          onClick={handleCancel}
        />
        <Button
          text={currentRequest.confirmText || "Confirm"}
          color={currentRequest.warning ? "red" : "blue"}
          onClick={handleConfirm}
        />
      </div>
    </div>
  {/if}
</Modal>
