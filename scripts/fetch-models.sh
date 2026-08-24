#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"

OWW_SRC="node_modules/openwakeword-wasm-browser/models"
OWW_DST="public/openwakeword/models"
VAD_NESTED="node_modules/@ricky0123/vad-react/node_modules/@ricky0123/vad-web/dist"
VAD_TOP="node_modules/@ricky0123/vad-web/dist"
PUBLIC="public"

mkdir -p "$OWW_DST" "$PUBLIC"

if [ ! -d "$OWW_SRC" ]; then
  echo "fetch-models: run npm install first (missing $OWW_SRC)" >&2
  exit 1
fi

echo "Copying OpenWakeWord models from openwakeword-wasm-browser..."
cp "$OWW_SRC"/*.onnx "$OWW_DST/"

VAD_SRC="$VAD_NESTED"
if [ ! -d "$VAD_SRC" ]; then
  VAD_SRC="$VAD_TOP"
fi

if [ -d "$VAD_SRC" ]; then
  echo "Copying VAD assets to public/..."
  cp "$VAD_SRC/silero_vad_legacy.onnx" "$VAD_SRC/vad.worklet.bundle.min.js" "$PUBLIC/"
  if [ -f "$VAD_SRC/silero_vad.onnx" ]; then
    cp "$VAD_SRC/silero_vad.onnx" "$PUBLIC/"
  fi
fi

echo "fetch-models: done."
