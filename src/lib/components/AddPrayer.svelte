<script lang="ts">
  import Button from "lib/components/Button.svelte";
  import { PrayerStore } from "lib/stores/prayerStore";
  import { onMount } from "svelte";
  import { account } from "lib/stores/accountStore";
  import { playFx } from "lib/utils/audio-host";
  import { accountPrayersLocked } from "../stores/accountPrayersLocked";

  let prayerInput = "";
  let textArea;

  const prayerPlaceholders = [
    "Pray for patience with family",
    "Holy Spirit, would you be with me today",
    "Grant me wisdom to glorify You today",
    "Lord, I pray for courage and strength",
    "Help me to love others more",
    "Pray for work and upcoming tests",
    "Help me to trust in You",
    "Forgive me for sinning against You",
    "Thank you Lord for today is a new day",
    "Thank you God for you are good",
    "Fill me with peace through this difficult time",
  ];
  let prayerPrompt = rollPrayerPrompt();

  /**
   * Randomly select a prayer placeholder
   */
  function rollPrayerPrompt() {
    return prayerPlaceholders[
      Math.floor(Math.random() * prayerPlaceholders.length)
    ];
  }

  /**
   * Add a prayer request from input
   */
  function submitPrayer() {
    const prayerText = prayerInput.trim();
    if (prayerText) {
      playFx("ADD");
      PrayerStore.addPrayer(prayerText);
      prayerInput = "";
    }
  }

  /**
   * Auto-resize the textarea for long prayer input
   * @param event oninput event
   */
  // @eslint-disable-next-line @typescript-eslint/no-explicit-any
  function autoResize(event: Event) {
    const textarea = event.currentTarget as HTMLTextAreaElement;
    textarea.style.height = "auto"; // Reset height to recalculate
    textarea.style.height = `${textarea.scrollHeight}px`; // Set height to match content
  }

  /**
   * Reset textarea size if empty and not focused
   * @param event
   */
  // @eslint-disable-next-line @typescript-eslint/no-explicit-any
  function resetSize(event: Event) {
    const textarea = event.currentTarget as HTMLTextAreaElement;
    if (prayerInput.trim().length === 0) {
      textarea.style.height = "4rem";
    }
  }

  onMount(() => {
    // Listen for <enter> to submit prayer
    textArea!.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitPrayer();
      }
    });
  });
</script>

<div class="w-full p-5">
  <label class="block text-gray-700 font-semibold mb-2" for="pray-input">
    {#if $account?.isCloudAccount}
      Hi {$account?.name}! Add a prayer request:
    {:else}
      Prayer request:
    {/if}
  </label>
  <textarea
    class="text-sm font-mono custom-input w-full h-16 min-h-16 px-4 py-2 mb-2 border-2 border-gray-300 rounded-lg shadow-sm transition-all duration-300 ease-in-out transform focus:-translate-y-1 focus:border-orange-300 focus:outline-orange-300 hover:shadow-lg hover:border-orange-300 focus:outline-0 bg-gray-50"
    placeholder={prayerPrompt}
    id="pray-input"
    bind:value={prayerInput}
    on:input={autoResize}
    on:focusout={resetSize}
    bind:this={textArea}
  ></textarea>
  <Button
    text="Add"
    onClick={submitPrayer}
    title="Add prayer [Enter]"
    disabled={$accountPrayersLocked}
  />
</div>

<style>
  textarea {
    overflow: hidden;
    resize: none;
  }
</style>
