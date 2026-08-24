export type ObjectFitContentRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

function parseObjectPositionAxis(
  raw: string | undefined,
  axis: 'x' | 'y',
  containerSize: number,
  contentSize: number,
): number {
  if (!raw || raw === 'center') {
    return 0.5;
  }

  if (axis === 'x') {
    if (raw === 'left') return 0;
    if (raw === 'right') return 1;
  } else {
    if (raw === 'top') return 0;
    if (raw === 'bottom') return 1;
  }

  if (raw.endsWith('%')) {
    return Math.min(1, Math.max(0, parseFloat(raw) / 100));
  }

  if (raw.endsWith('px')) {
    const excess = containerSize - contentSize;
    if (excess <= 0) return 0;
    return Math.min(1, Math.max(0, parseFloat(raw) / excess));
  }

  return 0.5;
}

/** Returns the painted video content box inside a video element (object-fit / object-position). */
export function getObjectFitContentRect(
  video: HTMLVideoElement,
): ObjectFitContentRect | null {
  const { videoWidth, videoHeight, clientWidth, clientHeight } = video;
  if (!videoWidth || !videoHeight || !clientWidth || !clientHeight) {
    return null;
  }

  const style = getComputedStyle(video);
  const objectFit = style.objectFit || 'fill';
  const [rawX, rawY] = style.objectPosition.trim().split(/\s+/);

  let renderedWidth = clientWidth;
  let renderedHeight = clientHeight;

  if (objectFit === 'contain' || objectFit === 'scale-down') {
    const containScale = Math.min(
      clientWidth / videoWidth,
      clientHeight / videoHeight,
    );
    const scale =
      objectFit === 'scale-down' ? Math.min(1, containScale) : containScale;
    renderedWidth = videoWidth * scale;
    renderedHeight = videoHeight * scale;
  } else if (objectFit === 'cover') {
    const scale = Math.max(
      clientWidth / videoWidth,
      clientHeight / videoHeight,
    );
    renderedWidth = videoWidth * scale;
    renderedHeight = videoHeight * scale;
  } else if (objectFit === 'none') {
    renderedWidth = videoWidth;
    renderedHeight = videoHeight;
  }

  const excessX = clientWidth - renderedWidth;
  const excessY = clientHeight - renderedHeight;
  const positionX = parseObjectPositionAxis(
    rawX,
    'x',
    clientWidth,
    renderedWidth,
  );
  const positionY = parseObjectPositionAxis(
    rawY ?? rawX,
    'y',
    clientHeight,
    renderedHeight,
  );

  const left = excessX * positionX;
  const top = excessY * positionY;
  const right = left + renderedWidth;
  const bottom = top + renderedHeight;

  // Clip to the element box (cover crops overflow; only the visible area matters).
  const visibleLeft = Math.max(0, left);
  const visibleTop = Math.max(0, top);
  const visibleRight = Math.min(clientWidth, right);
  const visibleBottom = Math.min(clientHeight, bottom);

  return {
    left: visibleLeft,
    top: visibleTop,
    width: visibleRight - visibleLeft,
    height: visibleBottom - visibleTop,
    right: visibleRight,
    bottom: visibleBottom,
  };
}
