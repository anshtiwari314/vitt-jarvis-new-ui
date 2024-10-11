import React from 'react'
function bufferToWav(abuffer:ArrayBuffer, len:number) {
  //console.log("abuffer", abuffer, len);
  //@ts-ignore
  var numOfChan = abuffer.numberOfChannels,
    length = len * numOfChan * 2 + 44,
    buffer = new ArrayBuffer(length),
    view = new DataView(buffer),
    channels = [],
    i,
    sample,
    offset = 0,
    pos = 0;

  // write WAVE header

  //console.log("pos", pos, length);
  setUint32(0x46464952); // "RIFF"
  //console.log("pos", pos, length);
  setUint32(length - 8); // file length - 8
  //console.log("pos", pos, length);
  setUint32(0x45564157); // "WAVE"
  //console.log("pos", pos, length);
  setUint32(0x20746d66); // "fmt " chunk
  //console.log("pos", pos, length);
  setUint32(16); // length = 16
  //console.log("pos", pos, length);
  setUint16(1); // PCM (uncompressed)
  //console.log("pos", pos, length);
  setUint16(numOfChan);
  //console.log("pos", pos, length);
  //@ts-ignore
  setUint32(abuffer.sampleRate);
  //console.log("pos", pos, length);
  //@ts-ignore
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  //console.log("pos", pos, length);
  setUint16(numOfChan * 2); // block-align
  //console.log("pos", pos, length);
  setUint16(16); // 16-bit (hardcoded in this demo)
  //console.log("pos", pos, length);
  setUint32(0x61746164); // "data" - chunk
  //console.log("pos", pos, length);
  setUint32(length - pos - 4); // chunk length
  //console.log("pos", pos, length);

  // write interleaved data
  //@ts-ignore
  for (i = 0; i < abuffer.numberOfChannels; i++)
  //@ts-ignore
    channels.push(abuffer.getChannelData(i));

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true); // write 16-bit sample
      pos += 2;
    }
    offset++; // next source sample
  }

  return buffer;

  function setUint16(data:any) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data:any) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

function downsampleToWav(file:File, callback:CallableFunction) {
  //Browser compatibility
  // https://caniuse.com/?search=AudioContext

  //@ts-ignore
  const AudioContext =window.AudioContext || window.webkitAudioContext || AudioContext;
  const audioCtx = new AudioContext();
  const fileReader1 = new FileReader();
  fileReader1.onload = function (ev) {
    // Decode audio
    //@ts-ignore
    audioCtx.decodeAudioData(ev.target.result, (buffer) => {
      // this is where you down sample the audio, usually is 44100 samples per second
      const usingWebkit = !window.OfflineAudioContext;
      //console.log("usingWebkit", usingWebkit);
      //@ts-ignore
      const OfflineAudioContext =window.OfflineAudioContext || window.webkitOfflineAudioContext;
      // {
      //   numberOfChannels: 1,
      //   length: 16000 * buffer.duration,
      //   sampleRate: 16000
      // }
      var offlineAudioCtx = new OfflineAudioContext(
        1,
        16000 * buffer.duration,
        16000
      );

      let soundSource = offlineAudioCtx.createBufferSource();
      soundSource.buffer = buffer;
      soundSource.connect(offlineAudioCtx.destination);

      const reader2 = new FileReader();
      reader2.onload = function (ev) {
        const renderCompleteHandler = function (evt:any) {
          //console.log("renderCompleteHandler", evt, offlineAudioCtx);
          let renderedBuffer = usingWebkit ? evt.renderedBuffer : evt;
          const buffer = bufferToWav(renderedBuffer, renderedBuffer.length);
          if (callback) {
            callback(buffer);
          }
        };
        if (usingWebkit) {
          offlineAudioCtx.addEventListener("complete", renderCompleteHandler);
          offlineAudioCtx.startRendering();
        } else {
          offlineAudioCtx
            .startRendering()
            .then(renderCompleteHandler)
            .catch(function (err) {
              console.log(err);
            });
        }
      };
      reader2.readAsArrayBuffer(file);

      soundSource.start(0);
    });
  };

  fileReader1.readAsArrayBuffer(file);
}

function encodeMp3(arrayBuffer:ArrayBuffer) {
  //@ts-ignore
  const wav = lamejs.WavHeader.readHeader(new DataView(arrayBuffer));
  console.log("i am wav", wav);
  const dataView = new Int16Array(arrayBuffer, wav.dataOffset, wav.dataLen / 2);
  //@ts-ignore
  const mp3Encoder = new lamejs.Mp3Encoder(wav.channels, wav.sampleRate, 128);
  const maxSamples = 1152;

  console.log("wav", wav);

  const samplesLeft =
    wav.channels === 1
      ? dataView
      : new Int16Array(wav.dataLen / (2 * wav.channels));

  const samplesRight =
    wav.channels === 2
      ? new Int16Array(wav.dataLen / (2 * wav.channels))
      : undefined;

  if (wav.channels > 1) {
    //@ts-ignore
    for (var j = 0; j < samplesLeft.length; i++) {
      samplesLeft[j] = dataView[j * 2];
      //@ts-ignore
      samplesRight[j] = dataView[j * 2 + 1];
    }
  }

  let dataBuffer = [];
  let remaining = samplesLeft.length;
  for (var i = 0; remaining >= maxSamples; i += maxSamples) {
    var left = samplesLeft.subarray(i, i + maxSamples);
    var right;
    if (samplesRight) {
      right = samplesRight.subarray(i, i + maxSamples);
    }
    var mp3buf = mp3Encoder.encodeBuffer(left, right);
    dataBuffer.push(new Int8Array(mp3buf));
    remaining -= maxSamples;
  }

  const mp3Lastbuf = mp3Encoder.flush();
  dataBuffer.push(new Int8Array(mp3Lastbuf));
  return dataBuffer;
}
export default function WavToMp3(wavFileBlob:Blob) {
  let blob;
  //  @ts-ignore
  return new Promise((resolve,reject)=>{
    // @ts-ignore
    downsampleToWav(wavFileBlob,(buffer:AudioBuffer)=>{
      // @ts-ignore
      const mp3Buffer = encodeMp3(buffer)
      let tempBlob = new Blob(mp3Buffer,{type:"audio/mp3"});
      //console.log(tempBlob)
      //blob = tempBlob;
      resolve(tempBlob)
      if(!tempBlob)
      reject(new Error("could not get an mp3 file"))
    });
    
  })
  
 
  return blob; 
}
