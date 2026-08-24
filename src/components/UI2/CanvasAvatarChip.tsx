import React from 'react';
import { Maximize2 } from 'lucide-react';
import AvatarStateOverlay, { AvatarState } from './AvatarStateOverlay';
import CompanionVideo from './CompanionVideo';

interface CanvasAvatarChipProps {
  state: AvatarState;
  onMaximize?: () => void;
  portraitStyle?: React.CSSProperties;
  videoStyle?: React.CSSProperties;
  stateOverlayStyle?: React.CSSProperties;
  maxToggleStyle?: React.CSSProperties;
}

export default function CanvasAvatarChip({
  state,
  onMaximize,
  portraitStyle,
  videoStyle,
  stateOverlayStyle,
  maxToggleStyle,
}: CanvasAvatarChipProps) {
  return (
    <div
      className={`canvas-avatar-chip canvas-ai-indicator state-${state}`}
      aria-label={`AI avatar is ${state}`}
    >
      <div className="chip-portrait" style={portraitStyle}>
        <CompanionVideo
          className="companion-video companion-video--chip"
          style={videoStyle}
        />
      </div>

      <div className="chip-controls">
        <button
          type="button"
          className="avatar-maximize canvas-chip-maximize"
          style={maxToggleStyle}
          onClick={onMaximize}
          aria-label="Return to conversation view"
          title="Return to conversation view"
        >
          <Maximize2 size={11} strokeWidth={2.2} />
        </button>
        <AvatarStateOverlay state={state} style={stateOverlayStyle} />
      </div>
    </div>
  );
}
