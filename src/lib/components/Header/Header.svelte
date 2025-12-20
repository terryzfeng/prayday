<script lang="ts">
  import Menu from "./Menu.svelte";
  import AboutModal from "../Modals/About/AboutModal.svelte";
  import { isLoading } from "lib/stores/isLoading";
  import { fade } from "svelte/transition";
  
  let openAbout: () => void;
</script>

<div
  class="h-12 w-full px-4 flex justify-between items-center select-none bg-white z-20 sticky top-0 drop-shadow-sm"
>
  <!-- Neumorphic bottom shadow container -->
  <div
    class="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"
  ></div>
  
  <!-- Subtle neumorphic effect for the entire header -->
  <div
    class="absolute inset-0 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.02)] bg-gradient-to-b from-white to-gray-50/50"
  ></div>
  
  <!-- Loading bar animation -->
  {#if $isLoading}
    <div 
      class="absolute inset-x-0 bottom-0 h-0.5 bg-gray-100 overflow-hidden"
      transition:fade={{ duration: 200 }}
    >
      <div class="loading-bar"></div>
    </div>
  {/if}
  
  <!-- Header container -->
  <div class="relative flex w-full justify-between items-center">
    <!-- Logo Prayday -->
    <button class="flex gap-1.5 cursor-pointer" on:click={openAbout}>
      <img
        src="/favicon_io/android-chrome-192x192.png"
        alt="Prayday logo"
        class="h-8 w-8 rounded-lg"
      />
      <h1
        class="text-2xl font-black font-title select-none text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-400"
      >
        Prayday
      </h1>
    </button>
    <!-- Dropdown Menu -->
    <Menu />
  </div>
</div>

<AboutModal bind:openAbout />

<style>
  .loading-bar {
    height: 100%;
    width: 40%;
    background: linear-gradient(to right, #60a5fa, #3b82f6, #60a5fa);
    animation: shimmer 1.5s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(350%);
    }
  }
</style>