import React, { FormEvent } from 'react';
import { Volume2, VolumeX, Mic, Send } from 'lucide-react';

interface ComposerProps {
  className?: string;
  draft: string;
  setDraft: (value: string) => void;
  onSend: (event: FormEvent<HTMLFormElement>) => void;
  voiceOn: boolean;
  onVoiceToggle: () => void;
  micOn: boolean;
  onMicToggle: () => void;
}

export default function Composer({
  className = '',
  draft,
  setDraft,
  onSend,
  voiceOn,
  onVoiceToggle,
  micOn,
  onMicToggle,
}: ComposerProps) {
  return (
    <form className={`social-composer ${className}`} onSubmit={onSend}>
      <button
        type="button"
        className="voice-output"
        onClick={onVoiceToggle}
        aria-label={voiceOn ? 'Mute AI voice' : 'Turn AI voice on'}
        aria-pressed={!voiceOn}
        title={voiceOn ? 'Mute AI voice' : 'Turn AI voice on'}
      >
        {voiceOn ? <Volume2 size={19} /> : <VolumeX size={19} />}
      </button>

      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Type a message…"
        aria-label="Message VITT AI"
      />

      <button
        type="button"
        className={`mic-input ${micOn ? 'active' : ''}`}
        onClick={onMicToggle}
        aria-label={micOn ? 'Stop voice input' : 'Start voice input'}
        aria-pressed={micOn}
        title={micOn ? 'Stop voice input' : 'Start voice input'}
      >
        <Mic size={19} />
        {micOn && <span className="mic-ripple" />}
      </button>

      <button
        type="submit"
        className="send-message"
        disabled={!draft.trim()}
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </form>
  );
}
