type EventHandler = (payload: any) => void

type HandlerMap = Map<string, Set<EventHandler>>

const RECONNECT_BASE_DELAY_MS = 1000
const RECONNECT_MAX_DELAY_MS = 30000

function normalizeWebSocketUrl(rawUrl: string, endpointPath: string) {
  const trimmedUrl = (rawUrl || "").trim()
  const safeEndpoint = endpointPath.startsWith("/") ? endpointPath : `/${endpointPath}`

  if (!trimmedUrl) {
    return ""
  }

  if (trimmedUrl.startsWith("ws://") || trimmedUrl.startsWith("wss://")) {
    const parsedUrl = new URL(trimmedUrl)
    if (parsedUrl.pathname === "/" || parsedUrl.pathname === "") {
      parsedUrl.pathname = safeEndpoint
    }
    return parsedUrl.toString()
  }

  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    const parsedUrl = new URL(trimmedUrl)
    parsedUrl.protocol = parsedUrl.protocol === "https:" ? "wss:" : "ws:"
    if (parsedUrl.pathname === "/" || parsedUrl.pathname === "") {
      parsedUrl.pathname = safeEndpoint
    }
    return parsedUrl.toString()
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  const parsedUrl = new URL(trimmedUrl, `${protocol}//${window.location.host}`)
  if (parsedUrl.pathname === "/" || parsedUrl.pathname === "") {
    parsedUrl.pathname = safeEndpoint
  }
  return parsedUrl.toString()
}

function emitToHandlers(handlers: HandlerMap, eventName: string, payload: any) {
  handlers.get(eventName)?.forEach((handler) => handler(payload))
}

function createSocketId() {
  return crypto?.randomUUID?.() ?? `ws-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function extractRoutePayload(data: Record<string, unknown>) {
  if (
    Object.prototype.hasOwnProperty.call(data, "payload") &&
    data.payload !== null &&
    typeof data.payload === "object" &&
    !Array.isArray(data.payload)
  ) {
    return data.payload
  }

  // WebSocket envelope: { route_type, data: { salesData, clientName, ... } }
  if (
    Object.prototype.hasOwnProperty.call(data, "data") &&
    data.data !== null &&
    typeof data.data === "object" &&
    !Array.isArray(data.data)
  ) {
    return data.data
  }

  const {
    route_type: _routeType,
    event: _event,
    channel: _channel,
    action: _action,
    message_type: _messageType,
    socket_event: _socketEvent,
    topic: _topic,
    ...rest
  } = data

  return Object.keys(rest).length > 0 ? rest : data
}

function resolveIncomingEvent(data: any) {
  if (!data || typeof data !== "object") {
    return { event: "message", payload: data }
  }

  const routeType =
    data.route_type ||
    data.event ||
    data.channel ||
    data.action ||
    data.message_type ||
    data.socket_event ||
    data.topic

  if (routeType && typeof routeType === "string") {
    return {
      event: routeType,
      payload: extractRoutePayload(data),
    }
  }

  if (typeof data.type === "string") {
    switch (data.type) {
      case "basic-info":
      case "financial-review":
      case "financial-goals":
      case "plan-summary":
      case "recommendations":
      case "value-modified":
      case "add-cues":
      case "update-cues":
        return { event: "ai_suggestion_res", payload: data }
      default:
        break
    }
  }

  if (Object.prototype.hasOwnProperty.call(data, "status") && Object.prototype.hasOwnProperty.call(data, "msg")) {
    return { event: "notifications", payload: data }
  }

  if (Object.prototype.hasOwnProperty.call(data, "audio_url") || Object.prototype.hasOwnProperty.call(data, "audiobase64")) {
    return { event: "audio_playback_res", payload: data }
  }

  if (
    Object.prototype.hasOwnProperty.call(data, "basicInfo") ||
    Object.prototype.hasOwnProperty.call(data, "financialReview") ||
    Object.prototype.hasOwnProperty.call(data, "recommendations")
  ) {
    return { event: "questions_loader_res", payload: data }
  }

  return { event: "message", payload: data }
}

export type AppWebSocket = {
  emit: (eventName: string, payload?: Record<string, unknown>) => boolean
  on: (eventName: string, handler: EventHandler) => () => void
  off: (eventName: string, handler?: EventHandler) => void
  disconnect: () => void
  readonly id: string | null
  readonly readyState: number
}

export function createAppWebSocket(rawUrl: string, endpointPath = "/ai_suggestion_req_ins_v2"): AppWebSocket {
  const wsUrl = normalizeWebSocketUrl(rawUrl, endpointPath)
  const handlers: HandlerMap = new Map()
  const pendingMessages: string[] = []

  let socket: WebSocket | null = null
  let socketId: string | null = null
  let manualDisconnect = false
  let reconnectAttempt = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  function clearReconnectTimer() {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  function getReconnectDelayMs() {
    const exponentialDelay = RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectAttempt)
    const cappedDelay = Math.min(exponentialDelay, RECONNECT_MAX_DELAY_MS)
    const jitter = Math.floor(Math.random() * 500)
    return cappedDelay + jitter
  }

  function flushPendingMessages() {
    while (socket?.readyState === WebSocket.OPEN && pendingMessages.length > 0) {
      const nextMessage = pendingMessages.shift()
      if (nextMessage) {
        socket.send(nextMessage)
      }
    }
  }

  function scheduleReconnect() {
    if (manualDisconnect || reconnectTimer !== null) {
      return
    }

    const delayMs = getReconnectDelayMs()
    console.info(`WebSocket reconnect scheduled in ${delayMs}ms (attempt ${reconnectAttempt + 1}).`)

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      reconnectAttempt += 1
      openConnection()
    }, delayMs)
  }

  function handleOpen() {
    reconnectAttempt = 0
    clearReconnectTimer()
    socketId = createSocketId()
    flushPendingMessages()
    emitToHandlers(handlers, "connect", { id: socketId })
  }

  function handleClose(event: CloseEvent) {
    if (event.code !== 1000) {
      console.warn(`WebSocket closed with code ${event.code}.`)
    }

    socket = null
    emitToHandlers(handlers, "disconnect", event)

    if (!manualDisconnect) {
      scheduleReconnect()
    }
  }

  function handleError(event: Event) {
    emitToHandlers(handlers, "error", event)
  }

  function handleMessage(event: MessageEvent) {
    let parsedData: any = event.data

    if (typeof event.data === "string") {
      try {
        parsedData = JSON.parse(event.data)
      } catch {
        parsedData = event.data
      }
    }

    const { event: eventName, payload } = resolveIncomingEvent(parsedData)
    emitToHandlers(handlers, eventName, payload)
    emitToHandlers(handlers, "message", parsedData)
  }

  function openConnection() {
    if (manualDisconnect || !wsUrl) {
      return
    }

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return
    }

    socket = new WebSocket(wsUrl)
    socket.addEventListener("open", handleOpen)
    socket.addEventListener("close", handleClose)
    socket.addEventListener("error", handleError)
    socket.addEventListener("message", handleMessage)
  }

  openConnection()

  return {
    emit(eventName, payload = {}) {
      const message = JSON.stringify({
        route_type: eventName,
        ...payload,
      })

      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(message)
        return true
      }

      if (!manualDisconnect && (socket?.readyState === WebSocket.CONNECTING || socket === null)) {
        pendingMessages.push(message)
        console.info(`WebSocket not ready. Queued emit for ${eventName}.`)
        return false
      }

      console.warn(`WebSocket is not open. Skipping emit for ${eventName}.`)
      return false
    },
    on(eventName, handler) {
      const nextHandlers = handlers.get(eventName) ?? new Set<EventHandler>()
      nextHandlers.add(handler)
      handlers.set(eventName, nextHandlers)

      return () => {
        this.off(eventName, handler)
      }
    },
    off(eventName, handler) {
      const eventHandlers = handlers.get(eventName)
      if (!eventHandlers) return

      if (!handler) {
        handlers.delete(eventName)
        return
      }

      eventHandlers.delete(handler)
      if (eventHandlers.size === 0) {
        handlers.delete(eventName)
      }
    },
    disconnect() {
      manualDisconnect = true
      clearReconnectTimer()
      pendingMessages.length = 0
      socket?.close(1000, "Client disconnect")
      socket = null
    },
    get id() {
      return socketId
    },
    get readyState() {
      return socket?.readyState ?? WebSocket.CLOSED
    },
  }
}
