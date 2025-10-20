<script lang="ts">
  import Device from "svelte-device-info";
  import Button from "lib/components/Button.svelte";
  import PrayerRequest from "lib/utils/prayer-request";
  import xSVG from "lib/assets/x.svg";
  import { PrayerStore } from "lib/stores/prayerStore";
  import { playFx } from "lib/utils/audio-host";
  import { userHistoryService } from "../services/userHistoryService.js";
  import { getRelativeDate } from "../utils/date-utils";
  // import { subtractGlobalPrayerCount } from "../utils/firebase/prayer-stats";

  export let prayer: PrayerRequest;
  export let highlight: boolean = false;

  const isTouch = Device.isMobile;

  let cardElement: HTMLElement;
  let focusCard = false;
  let isPrayButtonDisabled = false;

  /**
   * Hover over prayer card
   * @param state to set prayer card hover
   */
  function hover(state: boolean) {
    if (!isTouch) {
      focusCard = state;
    }
  }

  /**
   * Delete the prayer on button click
   * @param MouseEvent
   */
  function deletePrayer(event: Event) {
    // TODO: remove when publish
    const confirmDelete =
      confirm("Are you sure you want to delete this prayer request?");
    if (confirmDelete) {
      event.stopPropagation();
      playFx("ERROR");
      PrayerStore.deletePrayer(prayer.uuid);
    }
  }

  /**
   * Increment Prayer counter when prayed
   */
  function prayIncrement() {
    if (isPrayButtonDisabled) return;

    playFx("PRAY");
    isPrayButtonDisabled = true;

    PrayerStore.incrementPrayCount(prayer.uuid);
    userHistoryService.pray();

    setTimeout(() => {
      isPrayButtonDisabled = false;
    }, 1000);
  }

  /**
   * Toggle answered state of PrayerRequest
   */
  function toggleAnswered() {
    playFx(prayer.answered ? "UNANSWER" : "ANSWER");
    PrayerStore.toggleAnswered(prayer.uuid);
  }

  /**
   * Focus the card when clicked on (mobile)
   */
  function handleCardClick() {
    if (isTouch) {
      focusCard = true;
    }
  }

  /**
   * Unfocus the card when clicked outside (mobile)
   */
  function handleClickOutside(event: MouseEvent) {
    const clickTarget = event.target as HTMLElement;
    if (cardElement && !cardElement.contains(clickTarget)) {
      focusCard = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  bind:this={cardElement}
  class="relative bg-white rounded-lg shadow-sm p-3 pt-4 transition-all duration-200
  ease-in-out hover:shadow-lg hover:-translate-y-0.5 cursor-default
  {prayer.answered ? '!bg-green-50 border-2 border-green-300' : ''} 
  {highlight && !prayer.answered
    ? 'border-4 border-blue-300 highlight-border text-xl'
    : ''}"
  on:mouseenter={() => hover(true)}
  on:mouseleave={() => hover(false)}
  on:click={handleCardClick}
  role="button"
  tabindex="0"
  aria-label="Prayer request: {prayer.prayer}. {prayer.answered
    ? 'Marked as answered.'
    : ''} Prayed {prayer.prayCount} {prayer.prayCount === 1
    ? 'time'
    : 'times'}. Last prayed {getRelativeDate(prayer.lastPrayed)}."
>
  {#if focusCard}
    <button
      class="absolute z-10 top-1.5 right-1.5 transition-transform
        duration-200 hover:scale-110"
      on:click={deletePrayer}
      aria-label="Delete prayer request"
    >
      <img src={xSVG} alt="x" class="w-5 h-5" />
    </button>
  {/if}
  <div class="pt-1.5">
    <p
      class="font-medium text-gray-900 leading-snug {highlight
        ? 'font-semibold'
        : ''}"
    >
      {prayer.prayer}
    </p>
    <div class="flex items-center gap-3 mt-3 text-xs text-gray-500">
      <span class="flex items-center" title="Last prayed">
        <svg
          class="w-3 h-3 mr-1"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {getRelativeDate(prayer.lastPrayed)}
      </span>
      <span class="flex items-center">
        <svg
          class="w-3 h-3 mr-1"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {prayer.prayCount}
        {prayer.prayCount === 1 ? "prayer" : "prayers"}
      </span>
    </div>

    <div class="flex justify-between gap-2 mt-3">
      <Button
        color="green"
        text={prayer.answered ? "✓ Answered" : "Mark Answered"}
        title={prayer.answered ? "Mark as unanswered" : "Mark as answered"}
        onClick={toggleAnswered}
      />
      <Button
        color="blue"
        text="🙏 Pray"
        title="Pray"
        onClick={prayIncrement}
        disabled={isPrayButtonDisabled}
      />
    </div>
  </div>
</div>

<style>
  @keyframes border-pulsate {
    0%,
    100% {
      border-color: rgba(147, 197, 253, 1);
    }
    50% {
      border-color: rgba(147, 197, 253, 0.6);
    }
  }
  .highlight-border {
    animation: border-pulsate 3s infinite;
  }
</style>
