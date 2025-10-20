<script lang="ts">
  import Modal from "./Modal.svelte";
  import Button from "../Button.svelte";
  import { forgotPassword } from "lib/utils/firebase/auth";

  export let showForgotPassword: (state: boolean) => void;
  export let showLogIn: (state: boolean) => void;

  let email = "";
  let errorMessage = "";
  let loading = false;

  async function handleSubmit() {
    loading = true;
    errorMessage = "";

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        errorMessage = "Password reset email sent.";
      } else {
        throw new Error("Error sending password reset email.");
      }
    } catch (error: unknown) {
      errorMessage = (error as Error).message;
    } finally {
      loading = false;
    }
  }

  function toggleToLogIn() {
    showLogIn(true);
    showForgotPassword(false);
    email = "";
  }
</script>

<Modal bind:showModal={showForgotPassword} showClosePrompt={false}>
  <div class="flex flex-col items-center space-y-8 p-4">
    <h1
      class="text-4xl font-black font-title select-none text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-400"
    >
      Prayday
    </h1>
    <div class="w-full max-w-sm space-y-4">
      <div class="space-y-2 flex flex-col justify-center text-center">
        <h2 class="text-xl font-semibold text-center">Forgot Password</h2>
        <div class="pb-2 text-sm text-gray-500">
          Reset your Prayday password
        </div>
      </div>

      {#if errorMessage}
        <div
          class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded relative text-sm"
          role="alert"
        >
          {errorMessage}
          <button
            class="absolute top-0 bottom-0 right-0 px-4 py-2"
            on:click={() => (errorMessage = "")}
          >
            ×
          </button>
        </div>
      {/if}

      <form class="space-y-4" on:submit|preventDefault={handleSubmit}>
        <div class="space-y-2">
          <input
            type="email"
            placeholder="Email"
            bind:value={email}
            required
            class="text-sm w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <Button
          color="blue"
          className="w-full"
          text="Reset Password"
          disabled={loading}
        />
      </form>

      <div class="pt-4 flex flex-col justify-between items-center text-sm">
        <div class="text-center// text-gray-500 pb-2">
          Return to <button
            type="button"
            class="text-blue-500 hover:text-blue-600 ml-0.5"
            on:click={toggleToLogIn}
          >
            <b>Log In</b>
          </button>
        </div>
      </div>
    </div>
  </div>
</Modal>
