<script lang="ts">
  import { onDestroy } from "svelte";
  import Modal from "../Modal.svelte";
  import globalPrayerCount from "lib/stores/globalPrayerCount";

  let prayerCount: number;
  const unsubscribe = globalPrayerCount.subscribe((value: number) => {
    prayerCount = value;
  });

  // Clean up when component is destroyed
  onDestroy(unsubscribe);

  export let showPrivacy: (state: boolean) => void;
  export let showAbout: (state: boolean) => void;

  function viewAbout() {
    showPrivacy(false);
    showAbout(true);
  }
</script>

<Modal bind:showModal={showPrivacy}>
  <div
    class="flex flex-col items-center space-y-8 py-6 px-2 md:max-w-2xl mx-auto"
  >
    <!-- Privacy Policy Content -->
    <div class="w-full md:max-w-md space-y-6">
      <button class="text-blue-500 hover:text-blue-600" on:click={viewAbout}>
        ← Back to About
      </button>

      <div class="space-y-6">
        <h2
          class="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2"
        >
          Privacy Policy
        </h2>
        <p class="text-gray-600 leading-relaxed">
          Prayday is committed to protecting your privacy. We collect two types
          of data:
        </p>
        <ol class="list-decimal list-outside ml-6 space-y-6 text-gray-600">
          <li>
            <strong>Global Prayer Count</strong>
            <p class="mt-2">
              We maintain a global, anonymized count of prayers, displayed
              within the app to share collective prayer activity. This count
              does not identify individual users or their specific prayer
              requests.
              <strong>Prayer is powerful when we pray together.</strong>
            </p>
          </li>
          <li>
            <strong>Personal Prayer Data</strong>
            <p class="mt-2">
              For users who create an account, we store prayer requests and
              related information on our servers to enable access across your
              devices. This data is private and accessible only to you. <strong
                >Prayer is a personal journey.</strong
              >
            </p>
          </li>
        </ol>
        <p class="text-gray-600 space-y-4">
          Additionally, Prayday is available for use without creating an
          account. All prayer data will be cached locally to your browser.
          Simply create an account to save your prayers at any time.
        </p>
        <p class="text-gray-600 space-y-4">
          We do not sell, share, or disclose your personal data to any third
          parties. Our servers use industry-standard encryption and security
          measures to protect your information. We continuously review and
          update our privacy practices to ensure your data remains safe.
        </p>
      </div>
    </div>
  </div>
</Modal>
