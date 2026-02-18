'use client';

import { useApp } from '@/components/AppProvider';
import { AppSettings } from '@/lib/content/types';

export default function SettingsPage() {
  const { settings, updateSettings, resetProgress, profile } = useApp();

  const handleReset = () => {
    if (window.confirm('This will erase all your progress. Are you sure?')) {
      resetProgress();
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Profile status */}
      {profile && (
        <div className="bg-primary-light/10 border border-primary-light rounded-xl p-4 mb-6">
          <p className="text-sm font-medium mb-1">Learning Profile Active</p>
          <p className="text-xs text-text-muted">
            Settings marked with a star were set from your profile.
          </p>
        </div>
      )}

      {/* Display */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
          Display
        </h2>
        <div className="space-y-4">
          {/* Font family */}
          <div>
            <label className="text-sm font-medium block mb-2">Font</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'atkinson' as const, label: 'Atkinson' },
                { value: 'opendyslexic' as const, label: 'OpenDyslexic' },
                { value: 'system' as const, label: 'System' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateSettings({ fontFamily: opt.value })}
                  className={`py-2 px-3 rounded-lg text-sm border-2 transition-colors
                    ${settings.fontFamily === opt.value
                      ? 'border-primary bg-primary/10 font-semibold'
                      : 'border-border hover:border-primary/50'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div>
            <label className="text-sm font-medium block mb-2">Text Size</label>
            <div className="grid grid-cols-4 gap-2">
              {([
                { value: 'small' as const, label: 'S' },
                { value: 'medium' as const, label: 'M' },
                { value: 'large' as const, label: 'L' },
                { value: 'xlarge' as const, label: 'XL' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateSettings({ fontSize: opt.value })}
                  className={`py-2 px-3 rounded-lg text-sm border-2 transition-colors
                    ${settings.fontSize === opt.value
                      ? 'border-primary bg-primary/10 font-semibold'
                      : 'border-border hover:border-primary/50'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Letter spacing */}
          <div>
            <label className="text-sm font-medium block mb-2">Letter Spacing</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'normal' as const, label: 'Normal' },
                { value: 'wide' as const, label: 'Wide' },
                { value: 'wider' as const, label: 'Wider' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateSettings({ letterSpacing: opt.value })}
                  className={`py-2 px-3 rounded-lg text-sm border-2 transition-colors
                    ${settings.letterSpacing === opt.value
                      ? 'border-primary bg-primary/10 font-semibold'
                      : 'border-border hover:border-primary/50'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Line height */}
          <div>
            <label className="text-sm font-medium block mb-2">Line Spacing</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'normal' as const, label: 'Normal' },
                { value: 'relaxed' as const, label: 'Relaxed' },
                { value: 'loose' as const, label: 'Loose' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateSettings({ lineHeight: opt.value })}
                  className={`py-2 px-3 rounded-lg text-sm border-2 transition-colors
                    ${settings.lineHeight === opt.value
                      ? 'border-primary bg-primary/10 font-semibold'
                      : 'border-border hover:border-primary/50'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* High contrast */}
          <ToggleSetting
            label="High Contrast"
            description="Increase contrast for better visibility"
            value={settings.highContrast}
            onChange={(v) => updateSettings({ highContrast: v })}
          />

          {/* Reduced motion */}
          <ToggleSetting
            label="Reduced Motion"
            description="Minimize animations"
            value={settings.reducedMotion}
            onChange={(v) => updateSettings({ reducedMotion: v })}
            profileSet={profile?.recommended_settings.reduced_motion_default !== undefined}
          />
        </div>
      </section>

      {/* Audio */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
          Audio
        </h2>
        <div className="space-y-4">
          <ToggleSetting
            label="Audio Instructions"
            description="Read instructions and feedback aloud"
            value={settings.audioInstructions}
            onChange={(v) => updateSettings({ audioInstructions: v })}
            profileSet={profile?.recommended_settings.audio_instructions_default !== undefined}
          />
        </div>
      </section>

      {/* Session */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
          Session
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-1 mb-2">
              Session Length (minutes)
              {profile && <span className="text-primary text-xs">★ from profile</span>}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[4, 6, 8, 10].map(mins => (
                <button
                  key={mins}
                  onClick={() => updateSettings({ sessionMinutes: mins })}
                  className={`py-2 px-3 rounded-lg text-sm border-2 transition-colors
                    ${settings.sessionMinutes === mins
                      ? 'border-primary bg-primary/10 font-semibold'
                      : 'border-border hover:border-primary/50'
                    }`}
                >
                  {mins}
                </button>
              ))}
            </div>
          </div>

          <ToggleSetting
            label="Show Timers"
            description="Display countdown during games"
            value={settings.showTimers}
            onChange={(v) => updateSettings({ showTimers: v })}
            profileSet={profile?.recommended_settings.timers_default !== undefined}
          />

          <ToggleSetting
            label="Extended Hint Ladder"
            description="More hints available per item"
            value={settings.extendedHintLadder}
            onChange={(v) => updateSettings({ extendedHintLadder: v })}
            profileSet={profile?.recommended_settings.extended_hint_ladder !== undefined}
          />
        </div>
      </section>

      {/* Data */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
          Data
        </h2>
        <button
          onClick={handleReset}
          className="w-full py-3 rounded-xl border-2 border-error text-error font-medium
            hover:bg-error/10 transition-colors"
        >
          Reset All Progress
        </button>
        <p className="text-xs text-text-muted mt-2 text-center">
          This removes all saved progress. Settings will be preserved.
        </p>
      </section>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  value,
  onChange,
  profileSet,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  profileSet?: boolean;
}) {
  return (
    <div className="flex items-center justify-between bg-surface border border-border rounded-xl p-4">
      <div>
        <div className="text-sm font-medium flex items-center gap-1">
          {label}
          {profileSet && <span className="text-primary text-xs">★</span>}
        </div>
        <div className="text-xs text-text-muted">{description}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          value ? 'bg-primary' : 'bg-border'
        }`}
        role="switch"
        aria-checked={value}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
