#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"

OWW_SRC="node_modules/openwakeword-wasm-browser/models"
OWW_DST="public/openwakeword/models"
ORT_SRC="node_modules/onnxruntime-web/dist"
ORT_DST="public/openwakeword/ort"
DAVOICE_DST="public/davoice/models"
DAVOICE_WASM_SRC="node_modules/web-wake-word/dist"
DAVOICE_WASM_DST="public/davoice/wasm"
PORCUPINE_DST="public/porcupine"

mkdir -p "$OWW_DST" "$ORT_DST" "$DAVOICE_DST" "$DAVOICE_WASM_DST" "$PORCUPINE_DST"

if [ ! -d "$OWW_SRC" ]; then
  echo "fetch-models: run npm install first (missing $OWW_SRC)" >&2
  exit 1
fi

if [ ! -d "$ORT_SRC" ]; then
  echo "fetch-models: run npm install first (missing $ORT_SRC)" >&2
  exit 1
fi

if [ ! -d "$DAVOICE_WASM_SRC" ]; then
  echo "fetch-models: run npm install first (missing $DAVOICE_WASM_SRC)" >&2
  exit 1
fi

echo "Copying OpenWakeWord models from openwakeword-wasm-browser..."
cp "$OWW_SRC"/*.onnx "$OWW_DST/"

echo "Copying ONNX Runtime WASM assets from onnxruntime-web..."
cp \
  "$ORT_SRC/ort-wasm-simd-threaded.mjs" \
  "$ORT_SRC/ort-wasm-simd-threaded.jsep.mjs" \
  "$ORT_SRC/ort-wasm-simd-threaded.wasm" \
  "$ORT_SRC/ort-wasm-simd-threaded.jsep.wasm" \
  "$ORT_DST/"

echo "Copying DaVoice feature models from openwakeword-wasm-browser..."
cp "$OWW_SRC/embedding_model.onnx" "$OWW_SRC/melspectrogram.onnx" "$DAVOICE_DST/"

echo "Copying DaVoice WASM runtime from web-wake-word..."
cp \
  "$DAVOICE_WASM_SRC/a78504425790fb1c7254.js" \
  "$DAVOICE_WASM_SRC/ort-wasm-simd.mjs" \
  "$DAVOICE_WASM_SRC/ort-wasm-simd.wasm" \
  "$DAVOICE_WASM_DST/"

echo "Downloading DaVoice need_help_now.onnx..."
curl -fsSL -o "$DAVOICE_DST/need_help_now.onnx" \
  "https://raw.githubusercontent.com/frymanofer/Web_WakeWordDetection/main/example/models/need_help_now.onnx"

echo "Downloading Porcupine params..."
curl -fsSL -o "$PORCUPINE_DST/porcupine_params.pv" \
  "https://github.com/Picovoice/porcupine/raw/master/lib/common/porcupine_params.pv"

echo "fetch-models: done."
