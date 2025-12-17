<script lang="ts">
  import backChevron from "lib/assets/back-chevron.svg";

  export let onBack: () => void;
</script>

<div class="modal-page">
  <!-- Privacy Policy Header -->
  <div class="w-full flex items-center space-x-3 line-section">
    <button
      on:click={onBack}
      class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label="Go back"
    >
      <img src={backChevron} alt="Go back" class="w-5 h-5" />
    </button>
    <h1 class="h1">Privacy Policy</h1>
  </div>

  <!-- Privacy Policy Content -->
  <div class="space-y-6">
    <p class="text-gray-600 leading-relaxed">
      Prayday is committed to protecting your privacy. We store two types of
      data:
    </p>
    <ol class="list-decimal list-outside ml-6 space-y-6 text-gray-600">
      <li>
        <strong>Global Prayer Count</strong>
        <p class="mt-2">
          We maintain a global, anonymized count of prayers, displayed within
          the app to share collective prayer activity. This count does not
          identify individual users or their specific prayer requests.
          <strong>Prayer is powerful when we pray together.</strong>
        </p>
      </li>
      <li>
        <strong>Personal Prayer Data</strong>
        <p class="mt-2">
          For users who create an account, we store prayer requests and related
          information on our servers to enable access across all your devices.
          This data is private and accessible only to you.
          <strong>Prayer is a personal journey.</strong>
        </p>
      </li>
    </ol>
    <p class="text-gray-600 space-y-4">
      Additionally, Prayday can be used without creating an account. Prayer data
      will be saved locally to your browser, but may not persist if browser
      cache is cleared. Create an account to save your prayers at any time.
    </p>
    <p class="text-gray-600 space-y-4">
      We do not sell, share, or disclose your personal data to any third
      parties. Our servers use industry-standard encryption and security
      measures to protect your information. We continuously review and update
      our privacy practices to ensure your data remains safe.
    </p>
  </div>
</div>
