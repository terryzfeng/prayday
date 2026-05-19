<script lang="ts">
  export let text = "";
  export let onClick = () => {};
  export let color = "orange";
  export let backgroundColor = "";
  export let title = "";
  export let className = "";
  export let disabled = false;
  export let variant: "default" | "clear" = "default";

  // Base classes that are always applied
  const baseClasses =
    "group relative flex h-fit w-fit flex-col items-center justify-center rounded-lg transition-all duration-200";

  // Default style with disabled states
  const defaultClasses = `
    bg-${backgroundColor || color}-100 
    text-${color}-400/90 
    shadow-neu-pressed
    hover:shadow-neu-pressed-hover
    active:shadow-neu-pressed-active
    active:translate-y-0.5
    disabled:opacity-50
    disabled:hover:shadow-neu-pressed
    disabled:active:translate-y-0
  `;

  // Clear style (no background)
  const clearClasses = `
    text-${color}-500
    hover:text-${color}-600
    disabled:opacity-50
  `;

  const buttonClasses = variant === "clear" ? clearClasses : defaultClasses;
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
