# Plan: Replace Socket.io with `ws` and Create Branch VadDominantUseCaseWs

## 1. Current state

### 1.1 Where Socket.io is used

| File | Usage |
|------|--------|
| **DataWrapper.tsx** | Imports `io` from `socket.io-client`; creates socket in `useEffect` with `io(socketUrl)`; stores socket in state `[socket, setSocket]`; listens for `connect`, `disconnect`, `transcribe_audio_res`; provides `socket` and `setSocket` via context. **No cleanup on unmount** (socket is never closed). |
| **VadWrapper.tsx** | Uses `socket` from `useData()`; calls `socket.emit('transcribe_audio_req', data)` in `processAudioToBase64`. |
| **package.json** | Dependency: `"socket.io-client": "^4.7.5"`. |

No other files use the socket from context for communication (Page1, Page3, Cues3, NewUi use other values from `useData()` only).

### 1.2 Socket.io API in use

- **Connect:** `io(socketUrl)` → one-time in DataWrapper `useEffect` with `[]`.
- **Events listened (DataWrapper):** `connect`, `disconnect`, `transcribe_audio_res`.
- **Events emitted (VadWrapper):** `transcribe_audio_req` with payload `data`.

### 1.3 Backend / protocol note

- Current server: `https://recruito.vitti.insure/` (likely a **Socket.io** server).
- The **`ws`** library and native **WebSocket** use the standard WebSocket protocol; Socket.io uses its own protocol (Engine.IO + Socket.io packets). So a **raw WebSocket client cannot talk to a Socket.io server** without a backend change.
- **Assumption for this plan:** The backend will be (or is) updated to expose a **raw WebSocket endpoint** that accepts JSON messages with an **event type** and **payload** (e.g. `{ type: 'transcribe_audio_req', data: ... }` and sends `{ type: 'transcribe_audio_res', data: ... }`). If the backend remains Socket.io-only, this migration requires a corresponding server-side WebSocket implementation.

---

## 2. Goals

1. Replace Socket.io client with **`ws`** (or browser **WebSocket** API) in the app.
2. **Reconnect** automatically after disconnection (with backoff and optional max retries).
3. Create branch **VadDominantUseCaseWs** from **VadDominantUseCase**.
4. Avoid **memory leaks** and **unnecessary re-renders**.

---

## 3. Detailed implementation plan

### 3.1 Branch and repo setup

1. Ensure working tree is clean or stash changes.
2. Checkout branch **VadDominantUseCase**.
3. Create and checkout new branch **VadDominantUseCaseWs**.
4. Proceed with code and dependency changes on **VadDominantUseCaseWs**.

### 3.2 Dependency changes

- **Remove:** `socket.io-client`.
- **Add:** `ws` is primarily for Node; in the browser we should use the native **WebSocket** API (no extra dependency) or keep `ws` only if you need it for a Node/Electron environment. For a Vite/React browser app, **use the browser `WebSocket`** and do **not** add `ws` (browser doesn’t use Node `ws`). If the project runs in Node (e.g. SSR or Electron), add `ws` and use it only in that environment.
- **Conclusion:** For a standard browser React app, use **native `WebSocket`** and remove `socket.io-client`. Add `ws` only if you have a Node/Electron build.

### 3.3 Central WebSocket module (recommended)

- **Add:** e.g. `src/lib/wsClient.ts` (or `src/context/wsClient.ts`) to encapsulate:
  - Building WebSocket URL from current `socketUrl` (e.g. `wss://recruito.vitti.insure/` or whatever path the server exposes).
  - Creating and holding the **single** WebSocket instance in a **ref** (not in React state) to avoid re-renders when connection opens/closes.
  - **Reconnection logic:** on `close` or `error`, schedule reconnect with exponential backoff (e.g. 1s, 2s, 4s, max 30s) and optional max retry count; reset backoff on successful `open`.
  - **Message protocol:** send JSON: `{ type: string, data?: any }`; on message, parse JSON and expose by `type` (e.g. `transcribe_audio_res`).
  - **API:** `connect()`, `disconnect()`, `send(eventType, data)`, `on(eventType, callback)` / `off(eventType, callback)`, and optionally `getReadyState()` or `isConnected()` for UI.
  - **Cleanup:** `disconnect()` clears reconnect timers and closes the socket; no lingering listeners or timeouts.

This keeps DataWrapper and VadWrapper free of low-level WS and reconnection details and avoids duplicate reconnection logic.

### 3.4 DataWrapper.tsx changes

1. **Remove** `import { connect, io } from 'socket.io-client'` and any `io(...)` usage.
2. **Do not store the WebSocket (or wrapper) in React state** if it would change on every connect/disconnect and cause re-renders. Prefer:
   - A **ref** holding the ws client instance (or the wrapper from 3.3), and
   - Expose a **stable** value from context: e.g. a small object like `{ send: (event, data) => wsRef.current?.send(event, data), isConnected: ... }` where `isConnected` is the only part that might trigger re-renders, and only if the UI needs it (e.g. connection indicator). If UI doesn’t need connection status, keep everything in refs and don’t trigger re-renders on connect/disconnect.
3. **Lifecycle:**
   - In a `useEffect` with deps `[socketUrl]` (or empty if URL is fixed): create the ws client (from 3.3), assign to a ref, call `connect()`, and **return a cleanup** that calls `disconnect()` (and clears any reconnect timers). This prevents memory leaks on unmount.
4. **Event handling:**
   - In a separate `useEffect`, depend on the **stable ref** (e.g. ref to the ws client) and `SESSION_ID` / `currentUser`. Register a single listener for `transcribe_audio_res` that calls the same `receiveData` logic you have today. Use **refs** for `currentUser`, `SESSION_ID`, `setData`, `setMsgLoading`, `handleData`, `audioRef`, `audioQueueRef`, `isAudioStillPlaying` inside the listener so the effect doesn’t need to re-run when those change (and so you avoid stale closures and extra re-renders). Cleanup: remove the listener on unmount or when ref/SESSION_ID change.
5. **Context value:**
   - Expose a **stable** “socket-like” API: e.g. `send(event, data)` and optionally `isConnected`. Implement `send` by delegating to the ws client’s `send(eventType, data)`. Keep the context value **memoized** (e.g. `useMemo`) so consumers (VadWrapper, etc.) don’t re-render unnecessarily.
6. **Remove** `setSocket` from context if the socket is no longer in state and is managed internally by the wrapper module + refs.

### 3.5 VadWrapper.tsx changes

1. **Replace** `socket.emit('transcribe_audio_req', data)` with the new API, e.g. `send('transcribe_audio_req', data)` (from context).
2. **Remove** `setSocket` from `useData()` destructuring if it’s no longer provided.
3. Optionally guard: if `send` exists and connection is required, only call `send` when connected (or let the ws client queue/buffer if you add that later).

### 3.6 Reconnection behavior (inside ws client module)

- On **close** or **error**: don’t recreate the socket in a tight loop. Use a **single** timeout (or requestAnimationFrame) and increase delay each time (exponential backoff), e.g. `delay = min(initialDelay * 2^attempt, maxDelay)`.
- **Clear** this timeout in `disconnect()` and on unmount so there are no memory leaks.
- Optionally cap the number of retries (e.g. 10) and then stop; optionally expose “connection failed” so UI can show a message.
- On **open**, set a flag or callback so DataWrapper’s listener can be attached after reconnect; if the listener is registered once on a stable wrapper object that re-attaches to the new socket internally, no extra work in DataWrapper.

### 3.7 Memory leak checklist

- **DataWrapper:** Cleanup effect that calls `disconnect()` on the ws client when the component unmounts (or when `socketUrl` changes). No socket left open.
- **Ws client:** On `disconnect()`, clear all reconnect timeouts and remove all listeners; close the underlying WebSocket.
- **Event listener effect:** Cleanup removes the `transcribe_audio_res` listener so no callback holds references to React state/functions after unmount.
- **Stable refs:** Use refs for `currentUser`, `setData`, `handleData`, etc., inside the message listener so the effect dependency array doesn’t include them and you don’t re-subscribe unnecessarily; still use the latest values to avoid stale logic.

### 3.8 Unnecessary re-render checklist

- **No socket in state:** Don’t put the WebSocket (or wrapper) in React state; keep it in a ref so connect/disconnect don’t trigger re-renders.
- **Stable context value:** Memoize the object passed to `Context.Provider` (e.g. `useMemo` with correct deps) so that only when necessary values (e.g. `data`, `SESSION_ID`, `send`) actually change do consumers re-render.
- **Optional connection status:** If you add `isConnected`, keep it in a ref and only update a minimal state (e.g. a boolean) when it actually changes, or use a separate small context to limit re-renders to a “connection status” component only.

### 3.9 Message format (client ↔ server)

- **Client → Server:** JSON string, e.g. `{ "type": "transcribe_audio_req", "data": { ... } }`.
- **Server → Client:** JSON string, e.g. `{ "type": "transcribe_audio_res", "data": { ... } }` (or the payload at top level if the server sends only the payload; then client can treat the whole message as `data` and still dispatch by a fixed type like `transcribe_audio_res`).

Adjust parsing in the ws client’s `onmessage` to match what the server actually sends (e.g. `result` in your current code might be the whole message or `message.data`).

### 3.10 WebSocket URL

- Current base: `https://recruito.vitti.insure/`. WebSocket typically uses `wss://` and a path (e.g. `wss://recruito.vitti.insure/ws` or `/socket.io` is Socket.io-specific). Confirm the exact **path** and **host** for the new raw WebSocket endpoint with the backend and use that in the ws client (e.g. `const wsUrl = socketUrl.replace(/^https?/, 'wss') + 'ws'` or a config constant).

### 3.11 Files to touch (summary)

| Action | File |
|--------|------|
| Create | `src/lib/wsClient.ts` (or `src/context/wsClient.ts`) – WebSocket + reconnection + event-style API |
| Edit | `src/context/DataWrapper.tsx` – use ws client ref, cleanup, stable context, listener with refs |
| Edit | `src/context/VadWrapper.tsx` – use `send('transcribe_audio_req', data)` from context |
| Edit | `package.json` – remove `socket.io-client`; add `ws` only if Node/Electron is used |
| Optional | Add a small type definition for the ws client API used by DataWrapper/VadWrapper |

---

## 4. Execution order

1. Create branch **VadDominantUseCaseWs** from **VadDominantUseCase**.
2. Update **package.json** (remove socket.io-client; add ws only if needed).
3. Implement **ws client module** with connect, disconnect, send, on/off, reconnection with backoff, and cleanup.
4. Refactor **DataWrapper**: integrate ws client in ref, cleanup on unmount, stable context, single `transcribe_audio_res` listener with refs for latest values.
5. Refactor **VadWrapper**: use context `send('transcribe_audio_req', data)`.
6. Test: connect, send message from VadWrapper, receive and render in DataWrapper; disconnect server and verify reconnect; unmount and verify no leaks (e.g. no open sockets or timers).
7. Optionally add a connection-status indicator and test re-renders (only that part should re-render on connect/disconnect).

---

## 5. Risks and notes

- **Server protocol:** If the server is still Socket.io, the raw WebSocket client will not work until the server exposes a WebSocket endpoint and the same message semantics (event types + payloads).
- **CORS / secure:** Ensure `wss://` and same-origin or correct CORS if the front-end is on a different origin.
- **TypeScript:** Define a small interface for the ws client (e.g. `connect`, `disconnect`, `send(type, data)`, `on`, `off`) so DataWrapper and VadWrapper stay type-safe.

This plan, when followed, gives you a single place for WebSocket and reconnection, no Socket.io dependency, automatic reconnect, and minimal re-renders and no intentional memory leaks.
