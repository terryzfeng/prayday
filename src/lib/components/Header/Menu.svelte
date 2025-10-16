<script lang="ts">
  import { fade } from "svelte/transition";
  import menuSVG from "lib/assets/menu.svg";
  import MenuItem from "./MenuItem.svelte";
  import SignUpModal from "../Modals/SignUpModal.svelte";
  import LogInModal from "../Modals/LogInModal.svelte";
  import ForgotPasswordModal from "../Modals/ForgotPasswordModal.svelte";
  import AboutModal from "../Modals/About/AboutModal.svelte";
  import ProfileModal from "../Modals/ProfileModal.svelte";
  import SettingsModal from "../Modals/Settings/SettingsModal.svelte";
  import InputDataPassphrase from "../Modals/Settings/InputDataPassphrase.svelte";
  import { account } from "lib/stores/accountStore";
  import { filterStatesStore } from "lib/stores/filterStatesStore";

  let isMenuOpen = false;

  // Modal state
  let showLogIn: (state: boolean) => void;
  let showSignUp: (state: boolean) => void;
  let showForgotPassword: (state: boolean) => void;
  let showProfile: (state: boolean) => void;
  let showInputPassphrase: (state: boolean) => void;

  let openAbout: () => {};
  let openSettings: () => {};

  // Filter defaults
  let hideAnsweredText = "Hide Answered";

  /**
   * Close Menu Container
   */
  function handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest(".menu-container")) {
      isMenuOpen = false;
    }
  }

  $: {
    if (isMenuOpen) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }
    hideAnsweredText = filterStatesStore.getFilterState("hideAnswered")
      ? "Show Answered"
      : "Hide Answered";
  }
</script>

<!-- Dropdown menu container -->
<div class="menu-container relative">
  <button
    on:click={() => (isMenuOpen = !isMenuOpen)}
    class="p-2 rounded-lg shadow-[2px_2px_4px_0px_rgba(0,0,0,0.08),-2px_-2px_4px_0px_rgba(255,255,255,0.8)] hover:shadow-[3px_3px_6px_0px_rgba(0,0,0,0.08),-3px_-3px_6px_0px_rgba(255,255,255,0.8)] active:shadow-[inset_2px_2px_4px_0px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_0px_rgba(255,255,255,0.8)] transition-all duration-200"
    aria-label="Menu"
  >
    <img src={menuSVG} alt="Menu" class="w-5 h-5" />
  </button>

  {#if isMenuOpen}
    <div
      transition:fade={{ duration: 75 }}
      class="absolute right-0 mt-2 w-48 md:w-40 rounded-lg bg-white shadow-[4px_4px_8px_0px_rgba(0,0,0,0.08),-4px_-4px_8px_0px_rgba(255,255,255,0.8)] py-0 z-50 overflow-hidden"
    >
      {#if $account!.isCloudAccount}
        <!-- Logged in state -->
        <MenuItem
          value="View Profile"
          callback={() => showProfile(true)}
          bind:isMenuOpen
        />
        <MenuItem
          value="What is Prayday?"
          callback={openAbout}
          bind:isMenuOpen
        />
        <MenuItem
          value={hideAnsweredText}
          callback={() => filterStatesStore.toggleFilterState("hideAnswered")}
          bind:isMenuOpen
        />
        <MenuItem value="Settings" callback={openSettings} bind:isMenuOpen />
      {:else}
        <!-- Logged out state -->
        <MenuItem
          value="Log In"
          callback={() => showLogIn(true)}
          bind:isMenuOpen
        />
        <MenuItem
          value="Sign Up"
          callback={() => showSignUp(true)}
          bind:isMenuOpen
        />
        <MenuItem
          value="What is Prayday?"
          callback={openAbout}
          bind:isMenuOpen
        />
        <MenuItem value="Settings" callback={openSettings} bind:isMenuOpen />
      {/if}
    </div>
  {/if}
</div>

<!-- Menu Modals -->
<ProfileModal bind:showProfile />
<AboutModal bind:openAbout />
<SettingsModal bind:openSettings />

<LogInModal bind:showLogIn bind:showSignUp bind:showForgotPassword />
<ForgotPasswordModal bind:showForgotPassword bind:showLogIn />
<SignUpModal bind:showSignUp bind:showLogIn />

<!-- Other Modals -->
<InputDataPassphrase bind:showInputDataPassphrase={showInputPassphrase} />
