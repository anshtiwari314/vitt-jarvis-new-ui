/**
 * Standalone Test WebSocket Backend Server for Video Testing
 *
 * Features:
 * 1. Requires NO external npm packages (uses Node.js built-in http, fs, path & crypto modules).
 * 2. Sends video_playback_res / video_bytes_playback_res on ws://localhost:5000/ai_suggestion_req_ins_v2
 * 3. Default video URL: Pixabay sample mp4
 * 4. Interactive CLI menu for filler / non-filler / base64 / byte streaming tests
 *
 * Usage:
 *    node test-video-backend.js
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import readline from 'readline';

const PORT = 5000;
/** Must match frontend `dev_stream_req` / `wsEndpoint` in configuration.js */
const WS_PATH = '/ai_suggestion_req_ins_v2';
const VIDEO_URL = 'https://storage.googleapis.com/postfacto-audiofiles/recruito_files/vitt_into_video.mp4';
const VIDEO_FILE_PATH = path.join(process.cwd(), 'public', 'new_avatar_vid.mp4');

let connectedSockets = new Set();
let localVideoBuffer = null;
let ignoredWsUpgradeLogged = false;

// Read local video file on startup (used only for base64 / byte-chunk options)
function loadLocalVideoFile() {
  try {
    if (fs.existsSync(VIDEO_FILE_PATH)) {
      localVideoBuffer = fs.readFileSync(VIDEO_FILE_PATH);
      console.log(`[Server] ✅ Loaded local fallback video: public/new_avatar_vid.mp4 (${(localVideoBuffer.length / 1024 / 1024).toFixed(2)} MB)\n`);
    } else {
      console.warn(`[Server] ⚠️ Local file not found (base64/chunk options need it): ${VIDEO_FILE_PATH}`);
    }
  } catch (err) {
    console.error('[Server] Error reading local video file:', err);
  }
}

function getRequestPathname(req) {
  try {
    return new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`).pathname;
  } catch {
    return (req.url || '/').split('?')[0];
  }
}

// RFC6455 WebSocket Handshake & Frame Writer
function handleUpgrade(req, socket) {
  const pathname = getRequestPathname(req);
  if (pathname !== WS_PATH) {
    // Something else (e.g. tooling) often probes /ws — don't spam the CLI
    if (pathname === '/ws') {
      if (!ignoredWsUpgradeLogged) {
        console.warn(`[Server] Ignoring upgrades on "/ws" (clients must use ${WS_PATH})`);
        ignoredWsUpgradeLogged = true;
      }
    } else {
      console.warn(`[Server] ❌ Rejected upgrade on "${pathname}" (expected ${WS_PATH})`);
    }
    socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
    socket.destroy();
    return;
  }

  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.write('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
    socket.destroy();
    return;
  }

  const acceptKey = crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`,
    '\r\n'
  ];

  socket.write(headers.join('\r\n'));

  const ws = {
    socket,
    path: pathname,
    send(data) {
      if (socket.destroyed) return;
      const payload = Buffer.from(typeof data === 'string' ? data : JSON.stringify(data));
      const length = payload.length;

      let header;
      if (length <= 125) {
        header = Buffer.alloc(2);
        header[0] = 0x81;
        header[1] = length;
      } else if (length <= 65535) {
        header = Buffer.alloc(4);
        header[0] = 0x81;
        header[1] = 126;
        header.writeUInt16BE(length, 2);
      } else {
        header = Buffer.alloc(10);
        header[0] = 0x81;
        header[1] = 127;
        header.writeBigUInt64BE(BigInt(length), 2);
      }

      socket.write(Buffer.concat([header, payload]));
    }
  };

  connectedSockets.add(ws);
  console.log(`\n[Server] Client connected on ${pathname}! Active clients: ${connectedSockets.size}`);

  socket.on('close', () => {
    connectedSockets.delete(ws);
    console.log(`\n[Server] Client disconnected. Active clients: ${connectedSockets.size}`);
  });

  socket.on('error', () => {
    connectedSockets.delete(ws);
  });
}

// Create HTTP Server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`WebSocket Video Test Backend\nConnect clients to: ws://localhost:${PORT}${WS_PATH}\n`);
});

server.on('upgrade', (req, socket) => {
  handleUpgrade(req, socket);
});

server.listen(PORT, () => {
  console.clear();
  console.log('====================================================');
  console.log(` WebSocket Video Test Server`);
  console.log(` Endpoint: ws://localhost:${PORT}${WS_PATH}`);
  console.log(` Video URL: ${VIDEO_URL}`);
  console.log('====================================================\n');
  loadLocalVideoFile();
  printMenu();
});

// Interactive Terminal CLI Menu
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function buildVideoPlaybackPayload({
  videoUrl = null,
  videobase64 = null,
  filler = false,
  activateSpeaker = true,
} = {}) {
  // Matches production envelope: { route_type, data: { ... } }
  return {
    route_type: 'video_playback_res',
    data: {
      video_url: videoUrl,
      videobase64,
      filler,
      keep_button_active: false,
      activate_speaker: activateSpeaker,
    },
  };
}

function buildVideoBytesPlaybackPayload(chunkPayload, { filler = false, activateSpeaker = true } = {}) {
  return {
    route_type: 'video_bytes_playback_res',
    data: {
      activate_speaker: activateSpeaker,
      keep_button_active: false,
      filler,
      ...chunkPayload,
    },
  };
}

function printMenu() {
  console.log('Select test mode (payloads sent on /ai_suggestion_req_ins_v2):');
  console.log(`  [1] Send Video via URL — non-filler`);
  console.log('  [2] Send Video via Base64 string (local file) — non-filler');
  console.log('  [3] Send Video Byte-by-Byte Streaming Chunks (local file)');
  console.log('  [4] Send filler video (queues if another filler is playing)');
  console.log('  [5] Send non-filler video (clears queue immediately)');
  console.log('  [6] Exit');
  rl.question('\nEnter choice (1-6): ', handleMenuChoice);
}

function sendToAllClients(payload) {
  if (connectedSockets.size === 0) {
    console.log(`⚠️  No clients on ${WS_PATH}. Frontend must connect to ws://localhost:${PORT}${WS_PATH}`);
    return false;
  }
  for (const client of connectedSockets) {
    client.send(payload);
  }
  console.log(`[Server] → Sent on ${WS_PATH} to ${connectedSockets.size} client(s)`);
  return true;
}

async function handleMenuChoice(choice) {
  const trimmed = choice.trim();

  switch (trimmed) {
    case '1': {
      console.log(`\n--> Sending Video URL (${VIDEO_URL})...`);
      const payload = buildVideoPlaybackPayload({
        videoUrl: VIDEO_URL,
        videobase64: null,
        filler: false,
        activateSpeaker: true,
      });
      if (sendToAllClients(payload)) {
        console.log('✅ Sent video_playback_res (non-filler) successfully!');
      }
      setTimeout(printMenu, 1000);
      break;
    }

    case '2': {
      console.log('\n--> Sending Base64 Video from public/new_avatar_vid.mp4...');
      if (!localVideoBuffer) {
        console.log('⚠️  Local video buffer is empty!');
        setTimeout(printMenu, 1000);
        break;
      }
      const b64Data = localVideoBuffer.toString('base64');
      const payload = buildVideoPlaybackPayload({
        videoUrl: null,
        videobase64: `data:video/mp4;base64,${b64Data}`,
        filler: false,
      });
      if (sendToAllClients(payload)) {
        console.log(`✅ Sent video_playback_res (non-filler) successfully! (${(b64Data.length / 1024 / 1024).toFixed(2)} MB Base64)`);
      }
      setTimeout(printMenu, 1000);
      break;
    }

    case '3': {
      console.log('\n--> Simulating Byte-by-Byte / Chunked Streaming of public/new_avatar_vid.mp4...');
      if (connectedSockets.size === 0) {
        console.log(`⚠️  No clients on ${WS_PATH}!`);
        setTimeout(printMenu, 1000);
        break;
      }

      if (!localVideoBuffer) {
        console.log('⚠️  Local video buffer is empty!');
        setTimeout(printMenu, 1000);
        break;
      }

      const chunkSize = 64 * 1024; // 64KB per chunk
      const totalChunks = Math.ceil(localVideoBuffer.length / chunkSize);

      console.log(`Streaming ${localVideoBuffer.length} bytes in ${totalChunks} chunks (64KB per chunk)...`);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, localVideoBuffer.length);
        const chunkBuffer = localVideoBuffer.subarray(start, end);
        const isLast = i === totalChunks - 1;

        const payload = buildVideoBytesPlaybackPayload({
          video_chunk: chunkBuffer.toString('base64'),
          chunk_index: i,
          total_chunks: totalChunks,
          is_last_chunk: isLast,
          mime_type: 'video/mp4',
        });

        sendToAllClients(payload);
        console.log(`   Sent chunk ${i + 1}/${totalChunks} (${chunkBuffer.length} bytes)${isLast ? ' [FINAL]' : ''}`);

        // 20ms interval between 64KB chunks
        await new Promise((res) => setTimeout(res, 20));
      }

      console.log('✅ Byte-by-byte video stream complete!');
      setTimeout(printMenu, 1000);
      break;
    }

    case '4': {
      console.log(`\n--> Sending filler video URL (${VIDEO_URL})...`);
      const payload = buildVideoPlaybackPayload({
        videoUrl: VIDEO_URL,
        videobase64: null,
        filler: true,
        activateSpeaker: false,
      });
      if (sendToAllClients(payload)) {
        console.log('✅ Sent video_playback_res (filler) — will queue if another filler is playing.');
      }
      setTimeout(printMenu, 1000);
      break;
    }

    case '5': {
      console.log(`\n--> Sending non-filler video URL (${VIDEO_URL})...`);
      const payload = buildVideoPlaybackPayload({
        videoUrl: VIDEO_URL,
        videobase64: null,
        filler: false,
        activateSpeaker: true,
      });
      if (sendToAllClients(payload)) {
        console.log('✅ Sent video_playback_res (non-filler) — clears queue and plays immediately.');
      }
      setTimeout(printMenu, 1000);
      break;
    }

    case '6':
      console.log('\nExiting test server.');
      process.exit(0);
      break;

    default:
      console.log('Invalid choice. Please enter 1, 2, 3, 4, 5, or 6.');
      setTimeout(printMenu, 500);
      break;
  }
}
