<script lang="ts">
  import Header from "lib/components/Header/Header.svelte";
  import AddPrayer from "lib/components/AddPrayer.svelte";
  import PraydayMain from "lib/components/PraydayMain.svelte";
  import ConfirmDialog from "lib/components/ConfirmDialog.svelte";
</script>

<main class="container relative">
  <Header />
  <AddPrayer />
  <PraydayMain />
</main>

<ConfirmDialog />

<style lang="postcss">
  .container {
    @apply mx-auto flex flex-col min-h-screen w-full md:w-[768px] md:border border-dashed border-blue-100;
  }
</style>
