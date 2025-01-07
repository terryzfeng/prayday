/**
 * Audio engine for Prayday
 */
const audioUrl = "/static/";

// Sounds to load
export const FX: { [key: string]: string } = {
  PRAY: "prayFx.mp3",
  ADD: "addFx.mp3",
  ANSWER: "answerFx.mp3",
  UNANSWER: "unanswerFx.mp3",
  ERROR: "errorFx.mp3",
};

//-----------------------------------------------------------------------------
// HELPER FUNCTIONS
//-----------------------------------------------------------------------------
/**
 * Load an audio buffer from a URL
 */
async function getAudioBufferFromUrl(
  audioContext: AudioContext,
  url: string,
): Promise<AudioBuffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch (error: any) {
    throw new Error(`Failed to load audio ${url}: ${error.message}`);
  }
}

/**
 * Load multiple audio files in parallel
 */
async function loadMultipleAudioFiles(
  audioContext: AudioContext,
  files: { [key: string]: string },
): Promise<{ [key: string]: AudioBuffer }> {
  const buffers: { [key: string]: AudioBuffer } = {};
  const promises = Object.entries(files).map(async ([key, filename]) => {
    const url = audioUrl + filename;
    try {
      buffers[key] = await getAudioBufferFromUrl(audioContext, url);
    } catch (error) {
      throw error;
    }
  });

  await Promise.all(promises);
  return buffers;
}

//-----------------------------------------------------------------------------
// MAIN
//-----------------------------------------------------------------------------
// Initialize AudioContext
const audioContext = new AudioContext();
const outputGain = new GainNode(audioContext);
outputGain.connect(audioContext.destination);

let audioFxBuffers: { [key: string]: AudioBuffer };

// Load all audio buffers
async function init() {
  audioFxBuffers = await loadMultipleAudioFiles(audioContext, FX)
    .then((buffers) => {
      return buffers;
    })
    .catch((error) => {
      console.error("Failed to load audio files:", error);
      return {};
    });
}

init();

//-----------------------------------------------------------------------------
// RUNTIME FUNCTIONS
//-----------------------------------------------------------------------------
/**
 * Play a sfx
 * @param fx fx string from FX object
 */
export async function playFx(fx: string) {
  if (audioFxBuffers === undefined) {
    console.warn("Audio buffers not loaded yet");
    return;
  }
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const buffer = audioFxBuffers[fx];
  if (buffer) {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(outputGain);
    source.start();
  } else {
    console.warn(`Audio buffer not found for fx: ${fx}`);
  }
}

export function mute() {
  outputGain.gain.value = 0;
}

export function unmute() {
  outputGain.gain.value = 1;
}
