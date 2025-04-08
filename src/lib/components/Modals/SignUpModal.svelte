<!-- src/lib/components/auth/SignUpModal.svelte -->
<script lang="ts">
  import { signUp } from "lib/utils/firebase/auth";
  import Modal from "../Modal.svelte";
  import Button from "../Button.svelte";

  export let showSignUp: (state: boolean) => void;
  export let showLogIn: (state: boolean) => void;

  let name = "";
  let email = "";
  let password = "";
  let password2 = "";
  let errorMessage = "";
  let loading = false;

  async function handleSubmit() {
    loading = true;
    errorMessage = "";
    name = name.trim();

    try {
      if (password !== password2) {
        throw new Error("Passwords do not match. Please try again.");
      }

      const result = await signUp(email, password, name);

      if (result.success) {
        // Reset form
        name = "";
        email = "";
        password = "";
        password2 = "";
        showSignUp(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      errorMessage = error.message;
    } finally {
      loading = false;
    }
  }

  function toggleToLogIn() {
    showLogIn(true);
    showSignUp(false);
    email = "";
    password = "";
    name = "";
  }
</script>

<Modal bind:showModal={showSignUp}>
  <div class="flex flex-col items-center space-y-8 p-4">
    <h1
      class="text-4xl font-black font-title select-none text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-400"
    >
      Prayday
    </h1>

    <div class="w-full max-w-sm space-y-4">
      <div class="space-y-2 flex flex-col justify-center text-center">
        <h2 class="text-xl font-semibold text-center">Sign Up</h2>
        <div class="pb-2 text-sm text-gray-500">
          Save and sync prayers across devices!
        </div>
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

      <form
        class="space-y-4"
        on:submit|preventDefault={handleSubmit}
        autocomplete="off"
      >
        <div class="space-y-2">
          <input
            type="text"
            placeholder="Name"
            bind:value={name}
            required
            minlength="2"
            class="text-sm w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={loading}
          />
        </div>

        <div class="space-y-2">
          <input
            type="email"
            placeholder="Email"
            bind:value={email}
            required
            class="text-sm w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={loading}
          />
        </div>

        <div class="space-y-2">
          <input
            type="password"
            placeholder="Password"
            bind:value={password}
            required
            minlength="6"
            class="text-sm w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={loading}
          />
        </div>

        <div class="space-y-2">
          <input
            type="password"
            placeholder="Re-enter password"
            bind:value={password2}
            required
            minlength="6"
            class="text-sm w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={loading}
          />
        </div>

        <Button
          text={loading ? "Signing up..." : "Sign Up"}
          color="blue"
          className="w-full"
          disabled={loading}
        />
      </form>

      <div class="pt-4 flex flex-col justify-between items-center">
        <div class="text-center text-sm text-gray-500 pb-2">
          Already have an account?
          <button
            type="button"
            class="text-blue-500 hover:text-blue-600 ml-1 font-semibold"
            on:click={toggleToLogIn}
            disabled={loading}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  </div>
</Modal>
