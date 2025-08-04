<!-- EnterDataPassphrase.svelte -->
<script lang="ts">
  import Button from "lib/components/Button.svelte";
  import backChevron from "lib/assets/back-chevron.svg";
  
  export let onBack: () => void;
  export let onClose: () => void;
  
  let password = "";
  let errorMessage = "";
  let loading = false;
  let showPassword = false;

  async function handleSubmit() {
    loading = true;
    errorMessage = "";

    try {
      if (!password) {
        throw new Error("Please enter your passphrase.");
      }

      // TODO: Add your decryption/verification logic here
      // const result = await verifyPassphrase(password);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, simulate a failed attempt occasionally
      if (password === "wrong") {
        throw new Error("Incorrect passphrase. Please try again.");
      }
      
      // Success - close the modal or perform next action
      onClose();
      
    } catch (error: any) {
      errorMessage = error.message;
    } finally {
      loading = false;
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>

<div class="modal-page">
  <div class="w-full space-y-6">
    <!-- Header -->
    <div class="flex items-center space-x-3 line-section">
      <button
        on:click={onBack}
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Go back"
        disabled={loading}
      >
        <img src={backChevron} alt="Go back" class="w-5 h-5" />
      </button>
      <h1 class="h1">Enter Data Passphrase</h1>
    </div>

    <!-- Description -->
    <div class="space-y-3">
      <p class="text-gray-600 text-sm">
        Enter your data passphrase to decrypt and access your protected prayers.
      </p>
    </div>

    <!-- Error Message -->
    {#if errorMessage}
      <div
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm"
        role="alert"
      >
        {errorMessage}
        <button
          class="absolute top-0 bottom-0 right-0 px-4 py-2"
          on:click={() => (errorMessage = "")}
          disabled={loading}
        >
          ×
        </button>
      </div>
    {/if}

    <!-- Form -->
    <form
      class="space-y-4"
      on:submit|preventDefault={handleSubmit}
      autocomplete="off"
    >
      <div class="space-y-4">
        <div class="space-y-2">
          <label for="passphrase" class="block text-sm font-medium text-gray-700">
            Data Passphrase
          </label>
          <div class="relative">
            <input
              id="passphrase"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your data passphrase"
              bind:value={password}
              required
              autocomplete="current-password"
              class="text-sm w-full px-4 py-2 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-300"
              disabled={loading}
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
              on:click={togglePasswordVisibility}
              disabled={loading}
              aria-label={showPassword ? "Hide passphrase" : "Show passphrase"}
            >
              {#if showPassword}
                <!-- Eye slash icon (hide) -->
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              {:else}
                <!-- Eye icon (show) -->
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/if}
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3 pt-4">
        <Button 
          text={loading ? "Verifying..." : "Unlock Prayers"} 
          color="blue" 
          className="w-full"
          disabled={loading || !password.trim()}
        />
      </div>
    </form>

    <!-- Forgot Passphrase -->
    <div class="pt-2 text-center">
      <button
        type="button"
        class="text-sm text-gray-500 hover:text-gray-700 underline"
        disabled={loading}
        on:click={() => {
          // TODO: Handle forgot passphrase logic
          alert("Forgot passphrase functionality - this would typically show recovery options or a warning about data loss");
        }}
      >
        Forgot your passphrase?
      </button>
    </div>
  </div>
</div>