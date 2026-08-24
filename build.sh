npm run fetch-models

npm run oldbuild

cp ./lame.min.js ./dist

echo node_modules/onnxruntime-web/dist/ort-wasm.wasm 

cp \
    node_modules/@ricky0123/vad-react/node_modules/@ricky0123/vad-web/dist/silero_vad_legacy.onnx \
    node_modules/@ricky0123/vad-react/node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js \
    node_modules/onnxruntime-web/dist/*.wasm \
    ./dist/