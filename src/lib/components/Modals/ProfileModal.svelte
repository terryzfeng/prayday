<script lang="ts">
  import Modal from "./Modal.svelte";
  import ContributionGrid from "../ContributionGrid.svelte";
  import {
    prayerCount,
    answeredCount,
    unansweredCount,
  } from "lib/stores/prayerStore";
  import { user } from "lib/stores/auth";

  export let showProfile: (state: boolean) => void;
</script>

<Modal bind:showModal={showProfile}>
  <div class="flex flex-col items-center space-y-6 p-5 max-w-2xl mx-auto">
    <!-- Header Section -->
    <div class="flex items-center space-x-4">
      <div>
        <h1 class="text-2xl text-gray-700 font-semibold">
          {$user.userData?.name}'s Prayer Journey
        </h1>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
      <div class="bg-gray-50 p-4 rounded-lg text-center">
        <p class="text-3xl font-bold text-gray-400">{$unansweredCount}</p>
        <p class="text-sm text-gray-600">Open Prayer Requests</p>
      </div>
      <div class="bg-gray-50 p-4 rounded-lg text-center">
        <p class="text-3xl font-bold text-blue-400">{$prayerCount}</p>
        <p class="text-sm text-gray-600">Total Times Prayed</p>
      </div>
      <div
        class="bg-gray-50 p-4 rounded-lg text-center md:col-span-1 col-span-2"
      >
        <p class="text-3xl font-bold text-green-400">{$answeredCount}</p>
        <p class="text-sm text-gray-600">Prayers Answered</p>
      </div>
    </div>

    <!-- Contribution Grid -->
    <ContributionGrid />
  </div>
</Modal>
