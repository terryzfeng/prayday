<script lang="ts">
  import { logIn } from "lib/utils/firebase/auth";
  import Modal from "../Modal.svelte";
  import Button from "../Button.svelte";

  export let showLogIn: (state: boolean) => void;
  export let showSignUp: (state: boolean) => void;

  let email = "";
  let password = "";
  let errorMessage = "";
  let loading = false;

  async function handleSubmit() {
    loading = true;
    errorMessage = "";

    try {
      const result = await logIn(email, password);

      if (result.success) {
        email = "";
        password = "";
        showLogIn(false);
      } else {
        errorMessage = result.error;
      }
    } catch (error) {
      errorMessage = "An unexpected error occurred. Please try again.";
    } finally {
      loading = false;
    }
  }

  function toggleToSignUp() {
    showSignUp(true);
    showLogIn(false);
    email = "";
    password = "";
  }
</script>

<Modal bind:showModal={showLogIn}>
  <div class="flex flex-col items-center space-y-8 p-4">
    <h1
      class="text-4xl font-black font-title select-none text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-400"
    >
      Prayday
    </h1>
    <div class="w-full max-w-sm space-y-4">
      <div class="space-y-2 flex flex-col justify-center text-center">
        <h2 class="text-xl font-semibold text-center">Log In</h2>
      </div>

      {#if errorMessage}
        <div
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm"
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
        <div class="space-y-2">
          <input
            type="password"
            placeholder="Password"
            bind:value={password}
            required
            class="text-sm w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <Button color="blue" className="w-full" text="Log In" />
      </form>

      <div class="pt-4 flex flex-col justify-between items-center">
        <div class="text-center text-sm text-gray-500 pb-2">
          Don't have an account?
          <button
            type="button"
            class="text-blue-500 hover:text-blue-600 ml-1"
            on:click={toggleToSignUp}
          >
            <b>Sign Up</b>
          </button>
        </div>
      </div>

      <div class="my-1 border-b border-gray-200"></div>

      <div class="pt-2 flex flex-col justify-between items-center">
        <div class="text-center text-sm text-gray-500">
          <div class="pb-2">
            Continue without an account and save prayers locally
          </div>
          <button
            type="button"
            class="text-blue-500 hover:text-blue-600 ml-1"
            on:click={() => showLogIn(false)}
          >
            Create account later
          </button>
        </div>
      </div>
    </div>
  </div>
</Modal>
