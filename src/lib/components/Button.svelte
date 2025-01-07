<script lang="ts">
  export let text = "";
  export let onClick = () => {};
  export let color = "orange";
  export let title = "";
  export let className = "";
  export let disabled = false;

  // Base classes that are always applied
  const baseClasses =
    "group relative flex h-fit w-fit flex-col items-center justify-center rounded-lg transition-all duration-200";

  // Default style with disabled states
  const buttonClasses = `
    bg-${color}-100 
    text-${color}-400/90 
    shadow-[inset_2px_2px_4px_0px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_0px_rgba(255,255,255,0.8)]
    hover:shadow-[inset_3px_3px_6px_0px_rgba(0,0,0,0.08),inset_-3px_-3px_6px_0px_rgba(255,255,255,0.8)]
    active:shadow-[inset_4px_4px_8px_0px_rgba(0,0,0,0.12),inset_-2px_-2px_3px_0px_rgba(255,255,255,0.6)]
    active:translate-y-0.5
    disabled:opacity-50
    disabled:hover:shadow-[inset_2px_2px_4px_0px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_0px_rgba(255,255,255,0.8)]
    disabled:active:translate-y-0
  `;
</script>

<button
  on:click={onClick}
  class={`
    ${baseClasses} 
    ${buttonClasses} 
    px-6 py-2
    ${className}
  `}
  {title}
  {disabled}
>
  <slot />
  {#if text !== ""}
    <p
      class="text-sm md:text-md font-semibold transition-all duration-200 group-hover:scale-[0.98] group-active:scale-95 disabled:group-hover:scale-100 disabled:group-active:scale-100"
    >
      {text}
    </p>
  {/if}
</button>
