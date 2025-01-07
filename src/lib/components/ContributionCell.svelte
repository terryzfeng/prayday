<script lang="ts">
  export let dayCount: number;
  export let dateName: string;
  let showPopover = false;

  /**
   * Compute cell color based on prayer count
   * @param count prayer count
   */
  function getColor(count: number): string {
    if (count === 0) return "bg-gray-100";
    if (count <= 2) return "bg-blue-200";
    if (count <= 4) return "bg-blue-300";
    if (count <= 6) return "bg-blue-400";
    return "bg-blue-500";
  }

  /**
   * Handle mouse enter
   */
  function handleMouseEnter() {
    showPopover = true;
  }

  /**
   * Handle mouse leave
   */
  function handleMouseLeave() {
    showPopover = false;
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="w-full flex justify-center relative"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:focus={handleMouseEnter}
>
  <div
    class="w-8 h-8 sm:w-10 sm:h-10 rounded-sm
        {dayCount >= 0 ? getColor(dayCount) : 'bg-gray-50'} 
        {dayCount == -1 ? 'opacity-50' : ''} 
        {dayCount >= 0 ? 'hover:ring-2 hover:ring-gray-300' : ''} 
        transition-all duration-150"
  ></div>

  <!-- Date popover on hover -->
  {#if dayCount >= 0 && showPopover}
    <div
      class="absolute text-xs bottom-full mb-1 left-1/2 transform
      -translate-x-1/2 w-auto p-1.5 bg-gray-400 text-white rounded-md
      opacity-100 transition-opacity duration-200"
    >
      <p class="whitespace-nowrap">{dayCount} prayers on {dateName}</p>
    </div>
  {/if}
</div>
