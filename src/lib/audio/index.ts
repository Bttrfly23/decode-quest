/**
 * Web Speech API helpers with graceful degradation.
 *
 * Known browser quirks handled:
 * - Chrome: voices load async; must wait for voiceschanged event
 * - Chrome: speechSynthesis stalls after ~15s; periodic resume() needed
 * - Safari: requires user gesture before first utterance
 * - All: cancel() before new speech to avoid queue buildup
 */

let speechSupported: boolean | null = null;
let voicesLoaded = false;
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

export function isSpeechSupported(): boolean {
  if (speechSupported !== null) return speechSupported;
  if (typeof window === 'undefined') return false;
  speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  return speechSupported;
}

/**
 * Wait for voices to be available (Chrome loads them async).
 */
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise((resolve) => {
    if (!isSpeechSupported()) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      resolve(voices);
      return;
    }

    // Chrome fires voiceschanged when voices are ready
    const handleVoicesChanged = () => {
      voicesLoaded = true;
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    // Fallback timeout — some browsers never fire the event
    setTimeout(() => {
      if (!voicesLoaded) {
        voicesLoaded = true;
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve(window.speechSynthesis.getVoices());
      }
    }, 2000);
  });

  return voicesPromise;
}

/**
 * Pick the best English voice available.
 */
async function getVoice(): Promise<SpeechSynthesisVoice | null> {
  const voices = await loadVoices();
  if (voices.length === 0) return null;

  // Prefer a natural-sounding US English voice
  const preferred = voices.find(
    v => v.lang === 'en-US' && (v.name.includes('Samantha') || v.name.includes('Natural') || v.name.includes('Enhanced'))
  );
  if (preferred) return preferred;

  // Fall back to any en-US voice
  const enUS = voices.find(v => v.lang === 'en-US');
  if (enUS) return enUS;

  // Fall back to any English voice
  const en = voices.find(v => v.lang.startsWith('en'));
  if (en) return en;

  return voices[0];
}

/**
 * Chrome workaround: speechSynthesis can pause/stall on long utterances.
 * Periodically call resume() to keep it going.
 */
let resumeInterval: ReturnType<typeof setInterval> | null = null;

function startChromeWorkaround() {
  stopChromeWorkaround();
  resumeInterval = setInterval(() => {
    if (isSpeechSupported() && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }
  }, 10000);
}

function stopChromeWorkaround() {
  if (resumeInterval) {
    clearInterval(resumeInterval);
    resumeInterval = null;
  }
}

/**
 * Speak text using Web Speech API.
 * Returns a promise that resolves when speech is done.
 */
export function speak(
  text: string,
  options?: {
    rate?: number;    // 0.1–10, default 0.9
    pitch?: number;   // 0–2, default 1
    volume?: number;  // 0–1, default 1
  }
): Promise<void> {
  return new Promise(async (resolve) => {
    if (!isSpeechSupported()) {
      resolve();
      return;
    }

    // Cancel any current speech to avoid queue buildup
    window.speechSynthesis.cancel();

    const voice = await getVoice();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 0.9;
    utterance.pitch = options?.pitch ?? 1;
    utterance.volume = options?.volume ?? 1;
    utterance.lang = 'en-US';
    if (voice) utterance.voice = voice;

    // Safety timeout — resolve even if speech never fires onend
    const timeout = setTimeout(() => {
      stopChromeWorkaround();
      resolve();
    }, Math.max(10000, text.length * 500));

    utterance.onend = () => {
      clearTimeout(timeout);
      stopChromeWorkaround();
      resolve();
    };

    utterance.onerror = () => {
      clearTimeout(timeout);
      stopChromeWorkaround();
      resolve();
    };

    startChromeWorkaround();
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Speak phonemes slowly with pauses between them.
 */
export async function speakPhonemes(
  phonemes: string[],
  pauseMs: number = 400
): Promise<void> {
  for (const phoneme of phonemes) {
    await speak(phoneme, { rate: 0.7 });
    await delay(pauseMs);
  }
}

/**
 * Speak a word with slow blending.
 */
export async function speakSlowBlend(word: string): Promise<void> {
  await speak(word, { rate: 0.5 });
}

/**
 * Speak a word with normal/smooth blending.
 */
export async function speakSmoothBlend(word: string): Promise<void> {
  await speak(word, { rate: 0.9 });
}

/**
 * Speak instruction text at a comfortable pace.
 */
export async function speakInstruction(text: string): Promise<void> {
  await speak(text, { rate: 0.85 });
}

/**
 * Stop any currently playing speech.
 */
export function stopSpeech(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
    stopChromeWorkaround();
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Initialize audio — call once after a user gesture (e.g. button click)
 * to unlock audio on Safari/iOS.
 */
export async function initAudio(): Promise<boolean> {
  if (!isSpeechSupported()) return false;
  await loadVoices();
  // Speak an empty string to "unlock" audio on Safari
  const utterance = new SpeechSynthesisUtterance('');
  utterance.volume = 0;
  window.speechSynthesis.speak(utterance);
  return true;
}
