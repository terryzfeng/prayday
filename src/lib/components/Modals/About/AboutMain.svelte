<!-- AboutMain.svelte -->
<script lang="ts">
  import { onDestroy } from "svelte";
  import { globalPrayerCount } from "lib/stores/globalPrayerCount";
  import shareiOSSVG from "lib/assets/share-ios.svg";

  export let onNavigate: (page: string) => void;

  let prayerCount: number;
  const unsubscribe = globalPrayerCount.subscribe((value: number) => {
    prayerCount = value;
  });

  // Clean up when component is destroyed
  onDestroy(unsubscribe);
</script>

<div class="flex flex-col items-center space-y-8 pt-10 pb-3 px-2 md:max-w-2xl mx-auto;">
  <!-- About Header -->
  <h1 class="prayday-title animate-fade-in">Prayday</h1>

  <div class="text-center space-y-2">
    <div class="text-lg font-medium text-gray-400">Worldwide Prayer Count</div>
    <p class="text-4xl font-bold text-blue-500">{prayerCount}</p>
  </div>

  <!-- About Contant -->
  <div class="w-full space-y-6">
    <div class="space-y-3">
      <h1 class="h1 line-section">What is Prayday?</h1>
      <p class="text-gray-600 leading-relaxed">
        Prayday is a personal prayer companion app that organizes prayer
        requests and reminds you to pray! Create a prayer card with a topic that
        you want to pray for: a personal prayer item, a prayer request for a
        friend, or even a prayer of thanksgiving! Prayday will highlight a topic
        most in need of prayer. Just remember to pray everyday!
      </p>
      <p class="text-gray-600 leading-relaxed">
        <em>
          Rejoice always, pray continually, give thanks in all circumstances;
          for this is God's will for you in Christ Jesus.
        </em><br />
        <span class="text-gray-400">1 Thessalonians 5:16-18</span>
      </p>
    </div>

    <div class="space-y-3">
      <h1 class="h1 line-section">Prayday on Mobile</h1>
      <p class="text-gray-600 leading-relaxed">
        Get the Prayday app by simply adding this website to your mobile home
        screen! On iOS, tap the share
        <img
          src={shareiOSSVG}
          alt="Share on iOS"
          class="inline h-5 w-5 align-middle"
        />
        icon then scroll down and select "Add to Home Screen." On Android, tap the
        menu
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="inline h-5 w-5 align-middle"
          viewBox="0 0 12 24"
          fill="currentColor"
        >
          <circle cx="6" cy="6" r="2" />
          <circle cx="6" cy="12" r="2" />
          <circle cx="6" cy="18" r="2" />
        </svg>
        icon and then select "Add to Home Screen."
      </p>
      <div class="space-y-3">
        <h1 class="h1 line-section">Special Thanks</h1>
        <p class="text-gray-600 leading-relaxed">
          Prayday was created with love by Terry Feng for all who seek to
          cultivate a life of prayer.
        </p>
        <p class="text-gray-600 leading-relaxed">
          Click
          <a
            href="https://forms.gle/fmPFUiL6cckn2yoM7"
            class="text-blue-500 hover:text-blue-600"
            target="_blank">here</a
          > to share your feedback and experience!
        </p>
      </div>

      <!-- Privacy Policy Button -->
      <button class="text-blue-500 hover:text-blue-600" on:click={() => onNavigate("privacy-page")}>
        View Privacy Policy
      </button>
    </div>
  </div>
</div>
