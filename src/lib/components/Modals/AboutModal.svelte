<script lang="ts">
  import { onDestroy } from "svelte";
  import Modal from "../Modal.svelte";
  import globalPrayerCount from "lib/stores/globalPrayerCount";
  import shareiOSSVG from "lib/assets/share-ios.svg";

  let prayerCount: number;
  const unsubscribe = globalPrayerCount.subscribe((value: number) => {
    prayerCount = value;
  });
  // Clean up when component is destroyed
  onDestroy(unsubscribe);
  export let showAbout: (state: boolean) => void;
</script>

<Modal bind:showModal={showAbout}>
  <div
    class="flex flex-col items-center space-y-8 py-6 px-2 md:max-w-2xl mx-auto"
  >
    <h1
      class="text-5xl font-black font-title select-none text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-400 animate-fade-in"
    >
      Prayday
    </h1>

    <div class="text-center space-y-2">
      <div class="text-lg font-medium text-gray-400">
        Worldwide Prayer Count
      </div>
      <p class="text-4xl font-bold text-blue-500">{prayerCount}</p>
    </div>

    <div class="w-full md:max-w-md space-y-6">
      <div class="space-y-3">
        <h2
          class="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2"
        >
          What is Prayday?
        </h2>
        <p class="text-gray-600 leading-relaxed">
          Prayday is a personal prayer companion app that organizes prayer
          requests and reminds you to pray! Create a prayer card with a topic
          that you want to pray for: a personal prayer item, a prayer request
          for a friend, or even a prayer of thanksgiving! Prayday will 
          highlight a topic in need of prayer. Just remember to pray everyday!
          <br />
          <br />
          <em>
            Rejoice always, pray continually, give thanks in all circumstances;
            for this is God's will for you in Christ Jesus.
          </em><br />
          <span class="text-gray-400">1 Thessalonians 5:16-18</span>
        </p>
      </div>

      <div class="space-y-3">
        <h2
          class="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2"
        >
          Prayday on Mobile
        </h2>
        <p class="text-gray-600 leading-relaxed">
          Get the Prayday app by simply adding this website to your mobile home
          screen! On iOS, tap the share
          <img
            src={shareiOSSVG}
            alt="Share on iOS"
            class="inline h-5 w-5 align-middle"
          />
          icon then scroll down and select "Add to Home Screen." On Android, tap
          the menu
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
      </div>

      <!-- <div class="space-y-3">
        <h2
          class="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2"
        >
          How to Use Prayday
        </h2>
        <p class="text-gray-600 leading-relaxed">
          Simply tap the prayer button when you begin your prayer or meditation.
          Your contribution will be added to the global prayer count,
          representing your participation in this worldwide spiritual practice.
          You can return daily to maintain your prayer routine and see how the
          global community grows. Remember, each count represents a moment of
          peace, reflection, and connection shared with others around the world.
        </p>
      </div> -->
    </div>
  </div>
</Modal>
