<script lang="ts">
  export let label = "";
  export let state = false;
  export let onClick = () => {};
  export let className = "";
  export let disabled = false;

  const toggleClasses = `relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 {e2eeEnabled ? 'bg-blue-600' : 'bg-gray-200'}`;
</script>

<div class="flex items-center">
  <button
    type="button"
    role="switch"
    on:click={onClick}
    class={`
    ${toggleClasses}
    ${className}
  `}
    aria-checked={state}
    {disabled}
  >
    <span class="sr-only">label</span>
    <span
      aria-hidden="true"
      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {state
        ? 'translate-x-5'
        : 'translate-x-0'}"
    ></span>
  </button>
</div>
