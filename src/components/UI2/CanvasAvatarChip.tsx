import React from 'react';
import { UserRound } from 'lucide-react';
import AvatarStateOverlay, { AvatarState } from './AvatarStateOverlay';
import SectionVideoOverlay from './SectionVideoOverlay';

interface CanvasAvatarChipProps {
  state: AvatarState;
  onClick?: () => void;
}

export default function CanvasAvatarChip({
  state,
  onClick,
}: CanvasAvatarChipProps) {
  return (
    <button
      type="button"
      className={`canvas-avatar-chip canvas-ai-indicator state-${state}`}
      onClick={onClick}
      aria-label={`AI avatar is ${state}. Click to expand.`}
      title="Click to view avatar"
    >
      <div className="chip-portrait">
        <SectionVideoOverlay>
          <img className="avatar-image" src="/avatar-vitt-refined.png" alt="VITT AI Companion" />
        </SectionVideoOverlay>
      </div>
      <AvatarStateOverlay state={state} />
    </button>
  );
}
