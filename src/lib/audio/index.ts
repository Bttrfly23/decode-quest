/**
 * Web Speech API helpers with graceful degradation.
 */

let speechSupported: boolean | null = null;

export function isSpeechSupported(): boolean {
  if (speechSupported !== null) return speechSupported;
  if (typeof window === 'undefined') return false;
  speechSupported = 'speechSynthesis' in window;
  return speechSupported;
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
  return new Promise((resolve) => {
    if (!isSpeechSupported()) {
      resolve();
      return;
    }

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 0.9;
    utterance.pitch = options?.pitch ?? 1;
    utterance.volume = options?.volume ?? 1;
    utterance.lang = 'en-US';

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve(); // graceful degradation

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
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
