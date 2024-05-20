npm run build

cp ./lame.min.js ./dist
cp \
    node_modules/@ricky0123/vad-web/dist/*.onnx \
    node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js \
    node_modules/onnxruntime-web/dist/*.wasm \
    ./dist/