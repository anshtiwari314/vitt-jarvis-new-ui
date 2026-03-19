from flask import Flask
from flask_sock import Sock
import json
import base64
from pathlib import Path

app = Flask(__name__)
sock = Sock(app)

# Find a greeting audio file to send on first connect.
# Priority: any supported file in `something_folder/` (wav/mp3/ogg), falling back to PinkPanther30.wav.
BASE_DIR = Path(__file__).resolve().parent
SOMETHING_FOLDER = BASE_DIR / 'something_folder'
SUPPORTED_AUDIO_EXTS = ['.wav', '.mp3', '.ogg']

def _find_greeting_audio_path() -> Path | None:
    # prefer audio inside something_folder
    if SOMETHING_FOLDER.is_dir():
        for ext in SUPPORTED_AUDIO_EXTS:
            candidates = list(SOMETHING_FOLDER.glob(f'*{ext}'))
            if candidates:
                return candidates[0]
    # fallback
    fallback = BASE_DIR / 'PinkPanther30.wav'
    return fallback if fallback.exists() else None

GREETING_AUDIO_PATH = _find_greeting_audio_path()
GREETING_AUDIO_DATA_URL = None

if GREETING_AUDIO_PATH:
    try:
        with open(GREETING_AUDIO_PATH, 'rb') as f:
            raw = f.read()
            b64 = base64.b64encode(raw).decode('ascii')
            ext = GREETING_AUDIO_PATH.suffix.lower()
            mime = 'audio/wav'
            if ext == '.mp3':
                mime = 'audio/mpeg'
            elif ext == '.ogg':
                mime = 'audio/ogg'
            GREETING_AUDIO_DATA_URL = f'data:{mime};base64,{b64}'
    except Exception as e:
        print('Failed to load greeting audio file:', e)
else:
    print('Warning: no greeting audio file found (looked in something_folder and PinkPanther30.wav)')


@sock.route('/register_client')
def register_client(ws):
    """WebSocket endpoint that supports a simple {type, data} protocol."""
    while True:
        message = ws.receive()
        if message is None:
            break  # client disconnected

        try:
            payload = json.loads(message)
        except Exception as e:
            print('Invalid JSON received:', e)
            continue

        msg_type = payload.get('type')
        data = payload.get('data')

        if msg_type == 'greeting':
            print('Greeting received:', data)

            response_data = {
                'text': 'Hello from backend (Flask)!',
                'received': data,
            }

            # Send the greeting audio as a data URL so the frontend can play it directly.
            if GREETING_AUDIO_DATA_URL:
                response_data['audio_url'] = GREETING_AUDIO_DATA_URL

            ws.send(json.dumps({
                'type': 'greeting_audio',
                'data': response_data,
            }))

        elif msg_type == 'transcribe_audio_req':
            # Example: echoing back a placeholder response.
            # Replace this block with your actual transcription logic.
            print('Transcription request received:', data)
            ws.send(json.dumps({
                'type': 'transcribe_audio_res',
                'data': {
                    'status': 'ok',
                    'messageid': 'dummy-123',
                    'text': 'This is a placeholder transcription response.',
                    'sessionid': data.get('sessionid'),
                }
            }))

        else:
            # Unknown message type, echo it back
            ws.send(json.dumps({
                'type': 'unknown',
                'data': {
                    'receivedType': msg_type,
                    'receivedData': data,
                }
            }))


if __name__ == '__main__':
    # Run on port 5000 as requested
    app.run(host='0.0.0.0', port=5000, debug=True)
