<script lang="ts">
  import backChevron from "lib/assets/back-chevron.svg";
  export let onBack: () => void;

  const version = import.meta.env.VERSION;
</script>

<div class="modal-page">
  <!-- Version Info Header -->
  <div class="w-full flex items-center space-x-3 line-section">
    <button
      on:click={onBack}
      class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label="Go back"
    >
      <img src={backChevron} alt="Go back" class="w-5 h-5" />
    </button>
    <h1 class="h1">Version Info</h1>
  </div>

  <!-- Version Info Content -->
  <div class="space-y-6">
    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <p class="text-sm text-gray-500 mb-1">Current Version</p>
      <p class="text-2xl font-semibold text-gray-900">v{version}</p>
    </div>

    <div>
      <div
        class="flex items-center justify-between pb-3 border-b border-gray-200 mb-4"
      >
        <h2 class="text-lg font-semibold text-gray-900">
          Open Beta: v1.0.1-beta
        </h2>
        <p class="text-sm text-gray-500">December 2025</p>
      </div>
      <!-- <h2 class="text-lg font-semibold text-gray-900 mb-1">What's New: v1.0.1-beta</h2>
      <p class="text-sm text-gray-500 mb-3">December 2025</p> -->
      <ul class="space-y-4 text-gray-600">
        <li class="flex gap-3">
          <span class="text-blue-500">🔒</span>
          <div>
            <strong>Advanced Prayer Protection (End-to-End Encryption)</strong>
            <p class="mt-1">
              Your prayers are now protected with industry-standard encryption.
              Enable Advanced Prayer Protection to ensure only you can read your
              prayer requests, even on our servers. Protected by a data
              passphrase that only you know.
            </p>
          </div>
        </li>
        <li class="flex gap-3">
          <span class="text-blue-500">✓</span>
          <div>
            <strong>Enhanced Security & Privacy</strong>
            <p class="mt-1">
              All account data is now encrypted by default. Prayer requests are
              stored securely using modern encryption standards, keeping your
              personal prayers...well personal.
            </p>
          </div>
        </li>
        <li class="flex gap-3">
          <span class="text-blue-500">✓</span>
          <div>
            <strong>Improved Data Storage</strong>
            <p class="mt-1">
              Migrated to IndexedDB for better local storage reliability and
              performance. Your prayers load faster and persist more reliably
              across browser sessions.
            </p>
          </div>
        </li>
        <li class="flex gap-3">
          <span class="text-blue-500">✓</span>
          <div>
            <strong>Better Account Management</strong>
            <p class="mt-1">
              Enhanced login and signup flows with improved error handling.
              Seamless encryption key management for secure access across all
              your devices.
            </p>
          </div>
        </li>
        <li class="flex gap-3">
          <span class="text-blue-500">✓</span>
          <div>
            <strong>Offline Support Improvements</strong>
            <p class="mt-1">
              Enhanced offline caching ensures you can access and add prayers
              even without an internet connection, with automatic sync when
              you're back online.
            </p>
          </div>
        </li>
      </ul>
    </div>

    <div>
      <div
        class="flex items-center justify-between pb-3 border-b border-gray-200 mb-4"
      >
        <h2 class="text-lg font-semibold text-gray-900 mb-1">
          Closed Alpha: v1.0.0-alpha
        </h2>
        <p class="text-sm text-gray-500">July 2025</p>
      </div>
      <ul class="space-y-4 text-gray-600">
        <li class="flex gap-3">
          <span class="text-blue-500">✓</span>
          <div>
            <strong>Introducing Prayday</strong>
            <p class="mt-1">
              Everyday is Prayday! Introducing Prayday, an app that helps you
              organize and keep track of your prayer requests.
            </p>
          </div>
        </li>
        <li class="flex gap-3">
          <span class="text-blue-500">✓</span>
          <div>
            <strong>Cross-Device Sync</strong>
            <p class="mt-1">
              Access your prayers seamlessly across all your devices when signed
              in to your account.
            </p>
          </div>
        </li>
        <li class="flex gap-3">
          <span class="text-blue-500">✓</span>
          <div>
            <strong>Global Prayer Counter</strong>
            <p class="mt-1">
              See the collective impact of our prayer community with real-time
              updates of prayers offered worldwide.
            </p>
          </div>
        </li>
        <li class="flex gap-3">
          <span class="text-blue-500">✓</span>
          <div>
            <strong>Prayer Stats</strong>
            <p class="mt-1">
              Review your month in prayer and build up consistent prayer habits.
            </p>
          </div>
        </li>
      </ul>
    </div>

    <div class="pt-4 border-t border-gray-200"></div>
  </div>
</div>
