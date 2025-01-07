<script lang="ts">
  export let value: string;
  export let callback: () => void;
  export let type: "normal" | "danger" | "label" = "normal";
  export let isMenuOpen: boolean;
  export let disabled = false;

  // Map types to styles
  const styles = {
    normal: "text-gray-700 hover:bg-blue-50",
    danger: "text-red-500 hover:bg-red-50",
    label: "text-gray-500 font-semibold text-md cursor-default",
  };
</script>

<button
  on:click={() => {
    if (!disabled) {
      callback();
      isMenuOpen = false;
    }
  }}
  class="block w-full text-left text-md md:text-sm font-medium px-4 py-2 transition-colors {styles[
    type
  ]}"
  {disabled}
>
  {value}
</button>
