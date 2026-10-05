<script lang="ts">
  import backChevron from "lib/assets/back-chevron.svg";
  export let onBack: () => void;

  const version = import.meta.env.VERSION;
</script>

<div class="modal-page">
  <!-- Updates Header -->
  <div class="w-full flex items-center space-x-3 line-section">
    <button
      on:click={onBack}
      class="p-2 rounded-lg hover:bg-secondary transition-colors"
      aria-label="Go back"
    >
      <img src={backChevron} alt="Go back" class="w-5 h-5" />
    </button>
    <h1 class="h1">What's New</h1>
  </div>

  <!-- Version Info Content -->
  <div class="space-y-6">
    <div class="bg-muted rounded-lg p-4 border border-border">
      <p class="text-sm text-secondary-foreground mb-1">Current Version</p>
      <p class="text-2xl font-semibold text-foreground">v{version}</p>
    </div>

    <div>
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-border mb-4"
      >
        <h2
          class="text-lg font-semibold text-foreground flex items-center gap-2"
        >
          May Updates
          <span
            class="text-xs font-medium px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full"
            >v1.0.3</span
          >
        </h2>
        <p class="text-sm text-secondary-foreground">May 2026</p>
      </div>
      <ul class="space-y-4 text-secondary-foreground">
        <li class="flex gap-3">
          <span class="text-blue-500">📖</span>
          <div>
            <strong
              >"I Created a Prayer App. Here's What I Learned About Prayer."</strong
            >
            <p class="mt-1">
              An article on Christian prayer and who God is, written by Terry
              Feng. Featured on <a
                href="https://evanklam.substack.com/p/i-created-a-prayer-app-heres-what"
                class="text-blue-500 hover:text-blue-600"
                target="_blank">CONNECTIONS</a
              >.
            </p>
          </div>
        </li>
        <li class="flex gap-3">
          <span class="text-blue-500">✓</span>
          <div>
            <strong>UI Updates</strong>
            <p class="mt-1">
              Improved user experience with new onboarding and UI.
            </p>
          </div>
        </li>
      </ul>
    </div>

    <div>
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-border mb-4"
      >
        <h2
          class="text-lg font-semibold text-foreground flex items-center gap-2"
        >
          Official Launch! 🚀
          <span
            class="text-xs font-medium px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full"
            >v1.0.2</span
          >
        </h2>
        <p class="text-sm text-secondary-foreground">January 2026</p>
      </div>
      <ul class="space-y-4 text-secondary-foreground">
        <li class="flex gap-3">
          <span class="text-blue-500">🎉</span>
          <div>
            <strong>Pray Everyday with Prayday</strong>
            <p class="mt-1">
              Watch the official
              <a
                href="https://www.youtube.com/watch?v=N9q6LDpjcyw"
                class="text-blue-500 hover:text-blue-600"
                target="_blank">Prayday trailer</a
              >.
            </p>
          </div>
        </li>
        <li class="flex gap-3">
          <span class="text-blue-500">✓</span>
          <div>
            <strong>Bug Fixes</strong>
            <p class="mt-1">
              Various bug fixes and UI improvements. Thanks for sharing your
              feedback!
            </p>
          </div>
        </li>
      </ul>
    </div>

    <div>
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-border mb-4"
      >
        <h2
          class="text-lg font-semibold text-foreground flex items-center gap-2"
        >
          Open Beta
          <span
            class="text-xs font-medium px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full"
            >v1.0.1-beta</span
          >
        </h2>
        <p class="text-sm text-secondary-foreground">December 2025</p>
      </div>
      <ul class="space-y-4 text-secondary-foreground">
        <li class="flex gap-3">
          <span class="text-blue-500">🔒</span>
          <div>
            <strong>Advanced Prayer Protection (End-to-End Encryption)</strong>
            <p class="mt-1">
              Your prayers are now protected with industry-standard encryption.
              Enable Advanced Prayer Protection to ensure only you can read your
              prayer requests, keeping your personal prayers...well personal.
            </p>
          </div>
        </li>
        <li class="flex gap-3">
          <span class="text-blue-500">✓</span>
          <div>
            <strong>Improved Data Storage</strong>
            <p class="mt-1">
              Your prayers load faster and persist more reliably across browser
              sessions.
            </p>
          </div>
        </li>
        <li class="flex gap-3">
          <span class="text-blue-500">✓</span>
          <div>
            <strong>Offline Support</strong>
            <p class="mt-1">
              Enhanced offline caching ensures you can access your prayers even
              without an internet connection.
            </p>
          </div>
        </li>
      </ul>
    </div>

    <div>
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-border mb-4"
      >
        <h2
          class="text-lg font-semibold text-foreground mb-1 flex items-center gap-2"
        >
          Alpha Release
          <span
            class="text-xs font-medium px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full"
            >v1.0.0-alpha</span
          >
        </h2>
        <p class="text-sm text-secondary-foreground">July 2025</p>
      </div>
      <ul class="space-y-4 text-secondary-foreground">
        <li class="flex gap-3">
          <span class="text-blue-500">🙏</span>
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
              See the collective impact of prayer with real-time updates of
              prayers offered worldwide.
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

    <div class="pt-4 border-t border-border"></div>
  </div>
</div>
