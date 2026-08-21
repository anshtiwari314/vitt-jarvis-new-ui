import React from 'react';
import { Mic, MicOff } from 'lucide-react';

export type AvatarState = 'listening' | 'processing' | 'speaking' | 'muted';

export function ActivityWaveform({ className = '' }: { className?: string }) {
  return (
    <span className={`activity-waveform ${className}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export default function AvatarStateOverlay({
  state,
  className = '',
}: {
  state: AvatarState;
  className?: string;
}) {
  return (
    <span className={`avatar-state-overlay state-${state} ${className}`} aria-hidden="true">
      {state === 'listening' && <Mic size={20} strokeWidth={2.4} />}
      {state === 'processing' && (
        <span className="processing-dots">
          <i />
          <i />
          <i />
        </span>
      )}
      {state === 'speaking' && <ActivityWaveform />}
      {state === 'muted' && <MicOff size={20} strokeWidth={2.4} />}
    </span>
  );
}
