/**
 * Standalone Test WebSocket Backend Server for Video Testing
 * 
 * Uses local file: public/new_avatar_vid.mp4 (2.58 MB)
 * 
 * Features:
 * 1. Requires NO external npm packages (uses Node.js built-in http, fs, path & crypto modules).
 * 2. Loads public/new_avatar_vid.mp4 directly from local disk.
 * 3. Runs on ws://localhost:5000/ai_suggestion_req_ins_v2 (matching frontend configuration).
 * 4. Provides an interactive CLI terminal menu:
 *    [1] Send Video via direct URL (/new_avatar_vid.mp4)
 *    [2] Send Video via Base64 string (videobase64 from local file)
 *    [3] Send Video Byte-by-Byte Streaming Chunks (video_chunk from local file)
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
const VIDEO_FILE_PATH = path.join(process.cwd(), 'public', 'new_avatar_vid.mp4');
const RELATIVE_VIDEO_URL = '/new_avatar_vid.mp4';

let connectedSockets = new Set();
let localVideoBuffer = null;

// Read local video file on startup
function loadLocalVideoFile() {
  try {
    if (fs.existsSync(VIDEO_FILE_PATH)) {
      localVideoBuffer = fs.readFileSync(VIDEO_FILE_PATH);
      console.log(`[Server] ✅ Loaded local video: public/new_avatar_vid.mp4 (${(localVideoBuffer.length / 1024 / 1024).toFixed(2)} MB)\n`);
    } else {
      console.warn(`[Server] ⚠️ File not found: ${VIDEO_FILE_PATH}`);
    }
  } catch (err) {
    console.error('[Server] Error reading local video file:', err);
  }
}

// RFC6455 WebSocket Handshake & Frame Writer
function handleUpgrade(req, socket) {
  const key = req.headers['sec-websocket-key'];
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
  console.log(`\n[Server] Client connected! Active clients: ${connectedSockets.size}`);

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
  res.end('WebSocket Video Test Backend Server is running\n');
});

server.on('upgrade', (req, socket) => {
  handleUpgrade(req, socket);
});

server.listen(PORT, () => {
  console.clear();
  console.log('====================================================');
  console.log(` WebSocket Video Test Server running on ws://localhost:${PORT}`);
  console.log('====================================================\n');
  loadLocalVideoFile();
  printMenu();
});

// Interactive Terminal CLI Menu
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function printMenu() {
  console.log('Select test mode to send public/new_avatar_vid.mp4 to frontend:');
  console.log('  [1] Send Video via URL (/new_avatar_vid.mp4)');
  console.log('  [2] Send Video via Base64 string (videobase64)');
  console.log('  [3] Send Video Byte-by-Byte Streaming Chunks (video_chunk)');
  console.log('  [4] Exit');
  rl.question('\nEnter choice (1-4): ', handleMenuChoice);
}

function sendToAllClients(payload) {
  if (connectedSockets.size === 0) {
    console.log('⚠️  No active WebSocket clients connected! Please open frontend app in browser.');
    return false;
  }
  for (const client of connectedSockets) {
    client.send(payload);
  }
  return true;
}

async function handleMenuChoice(choice) {
  const trimmed = choice.trim();

  switch (trimmed) {
    case '1': {
      console.log(`\n--> Sending Video URL (${RELATIVE_VIDEO_URL})...`);
      const payload = {
        activate_speaker: true,
        keep_button_active: false,
        video_url: RELATIVE_VIDEO_URL
      };
      if (sendToAllClients(payload)) {
        console.log('✅ Sent video_url successfully!');
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
      const payload = {
        activate_speaker: true,
        keep_button_active: false,
        videobase64: `data:video/mp4;base64,${b64Data}`
      };
      if (sendToAllClients(payload)) {
        console.log(`✅ Sent videobase64 payload successfully! (${(b64Data.length / 1024 / 1024).toFixed(2)} MB Base64)`);
      }
      setTimeout(printMenu, 1000);
      break;
    }

    case '3': {
      console.log('\n--> Simulating Byte-by-Byte / Chunked Streaming of public/new_avatar_vid.mp4...');
      if (connectedSockets.size === 0) {
        console.log('⚠️  No active WebSocket clients connected!');
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

        const payload = {
          activate_speaker: true,
          keep_button_active: false,
          video_chunk: chunkBuffer.toString('base64'),
          chunk_index: i,
          total_chunks: totalChunks,
          is_last_chunk: isLast,
          mime_type: 'video/mp4'
        };

        sendToAllClients(payload);
        console.log(`   Sent chunk ${i + 1}/${totalChunks} (${chunkBuffer.length} bytes)${isLast ? ' [FINAL]' : ''}`);

        // 20ms interval between 64KB chunks
        await new Promise((res) => setTimeout(res, 20));
      }

      console.log('✅ Byte-by-byte video stream complete!');
      setTimeout(printMenu, 1000);
      break;
    }

    case '4':
      console.log('\nExiting test server.');
      process.exit(0);
      break;

    default:
      console.log('Invalid choice. Please enter 1, 2, 3, or 4.');
      setTimeout(printMenu, 500);
      break;
  }
}
