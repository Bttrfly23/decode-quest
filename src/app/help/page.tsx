'use client';

export default function HelpPage() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold mb-6">Help</h1>

      <div className="space-y-6">
        {/* What is decoding */}
        <section className="bg-surface border border-border rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-2">What is decoding?</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Decoding is the ability to look at written words and figure out how to
            read them. It involves connecting letters (graphemes) to their sounds
            (phonemes), blending those sounds together, and breaking longer words
            into manageable parts. Strong decoding skills help you read unfamiliar
            words accurately and with confidence.
          </p>
        </section>

        {/* How the games work */}
        <section className="bg-surface border border-border rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-3">How the games work</h2>
          <div className="space-y-4">
            <GameHelp
              icon="🎵"
              title="Sound Snap"
              description="Match letter patterns to their sounds, or sounds to their letter patterns. Builds your grapheme-phoneme connections."
            />
            <GameHelp
              icon="🔗"
              title="Blend Builder"
              description="Tap sounds in the right order to build a word. Strengthens your ability to blend sounds together smoothly."
            />
            <GameHelp
              icon="✂️"
              title="Syllable Sprint"
              description="Break words into syllables and find the stressed syllable. Helps you tackle longer, unfamiliar words."
            />
            <GameHelp
              icon="🧩"
              title="Morpheme Match"
              description="Combine word parts (prefixes, roots, suffixes) to build real words and learn their meanings."
            />
          </div>
        </section>

        {/* How hints work */}
        <section className="bg-surface border border-border rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-2">How hints work</h2>
          <p className="text-sm text-text-muted leading-relaxed mb-3">
            Every game has a hint ladder. If you get stuck, tap the hint button
            to get progressively more help. Hints are there to support your learning —
            using them is smart, not cheating.
          </p>
          <ul className="text-sm text-text-muted space-y-1">
            <li>Level 1: A small nudge in the right direction</li>
            <li>Level 2: More specific guidance</li>
            <li>Level 3: Shows the answer so you can learn from it</li>
            <li>Level 4 (extended): Full explanation</li>
          </ul>
        </section>

        {/* How scoring works */}
        <section className="bg-surface border border-border rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-2">Scoring and XP</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            You earn XP for every attempt — more for correct answers, especially
            without hints. You never lose XP. Your mastery score for each skill
            reflects how well you know it, and the app uses that to give you the
            right level of challenge. Accuracy always matters more than speed.
          </p>
        </section>

        {/* Today's Mission */}
        <section className="bg-surface border border-border rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-2">Today&apos;s Mission</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Each mission is a short session customized for you. It picks the skills
            and difficulty that match where you are right now. Items you missed
            recently come back for extra practice, and mastered skills get lighter
            review to keep them sharp.
          </p>
        </section>

        {/* Privacy */}
        <section className="bg-surface border border-border rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-2">Your Privacy</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            All your progress and settings are stored on this device only, in your
            browser&apos;s local storage. Nothing is sent to any server. No account
            is needed. If you clear your browser data, your progress will be reset.
            You can also reset your progress anytime in Settings.
          </p>
        </section>

        {/* Personalization */}
        <section className="bg-surface border border-border rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-2">Personalization</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            If a learning profile is available, DecodeQuest uses it to customize
            your experience: which games appear more often, how difficulty adjusts,
            session length, and accessibility defaults. You can override any of
            these in Settings.
          </p>
        </section>
      </div>

      <div className="text-center text-xs text-text-muted py-8">
        DecodeQuest &middot; Built for learners, by people who care
      </div>
    </div>
  );
}

function GameHelp({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <div className="font-medium text-sm">{title}</div>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
    </div>
  );
}
