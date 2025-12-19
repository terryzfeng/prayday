<script lang="ts">
  export let headline = "";
  export let description = "";
  export let onClick = () => {};
</script>

<button
  class="w-full bg-gray-50 rounded-lg p-4 shadow-[1px_1px_2px_0px_rgba(0,0,0,0.06),-1px_-1px_2px_0px_rgba(255,255,255,0.6)] hover:shadow-[1px_1px_3px_0px_rgba(0,0,0,0.06),-1px_-1px_3px_0px_rgba(255,255,255,0.7)] active:shadow-[inset_1px_1px_2px_0px_rgba(0,0,0,0.06),inset_-1px_-1px_2px_0px_rgba(255,255,255,0.6)] transition-all duration-200"
  on:click={onClick}
>
  <div class="flex items-center justify-between">
    <div class="flex-1 text-left select-none">
      <h3 class="text-sm font-medium text-gray-900">
        {headline}
      </h3>
      <p class="text-xs text-gray-500 mt-1">
        {description}
      </p>
    </div>
    <svg
      class="w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 5l7 7-7 7"
      ></path>
    </svg>
  </div>
</button>
