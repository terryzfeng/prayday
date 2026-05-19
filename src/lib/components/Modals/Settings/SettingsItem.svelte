<script lang="ts">
  export let headline = "";
  export let description = "";
  export let onClick = () => {};
</script>

<button
  class="w-full bg-muted rounded-lg p-4 shadow-neu-sm hover:shadow-neu-sm-hover active:shadow-neu-sm-active transition-all duration-200"
  on:click={onClick}
>
  <div class="flex items-center justify-between">
    <div class="flex-1 text-left select-none">
      <h3 class="text-sm font-medium text-foreground">
        {headline}
      </h3>
      <p class="text-xs text-secondary-foreground mt-1">
        {description}
      </p>
    </div>
    <svg
      class="w-5 h-5 text-secondary-foreground"
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
