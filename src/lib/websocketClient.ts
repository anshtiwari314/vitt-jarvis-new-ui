type EventHandler = (payload: any) => void

type HandlerMap = Map<string, Set<EventHandler>>

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

function resolveIncomingEvent(data: any) {
  if (!data || typeof data !== "object") {
    return { event: "message", payload: data }
  }

  const event =
    data.event ||
    data.channel ||
    data.action ||
    data.message_type ||
    data.socket_event ||
    data.topic

  if (event && typeof event === "string") {
    return {
      event,
      payload: Object.prototype.hasOwnProperty.call(data, "payload") ? data.payload : data,
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

export type AppWebSocket ={
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
  const socket = new WebSocket(wsUrl)
  const socketId = crypto?.randomUUID?.() ?? `ws-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const pendingMessages: string[] = []

  function flushPendingMessages() {
    while (socket.readyState === WebSocket.OPEN && pendingMessages.length > 0) {
      const nextMessage = pendingMessages.shift()
      if (nextMessage) {
        socket.send(nextMessage)
      }
    }
  }

  socket.addEventListener("open", () => {
    flushPendingMessages()
    emitToHandlers(handlers, "connect", { id: socketId })
  })

  socket.addEventListener("close", (event) => {
    if (event.code !== 1000) {
      console.warn(`WebSocket closed with code ${event.code}.`)
    }
    emitToHandlers(handlers, "disconnect", event)
  })

  socket.addEventListener("error", (event) => {
    emitToHandlers(handlers, "error", event)
  })

  socket.addEventListener("message", (event) => {
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
  })

  return {
    emit(eventName, payload = {}) {
      const message = JSON.stringify({
        event: eventName,
        ...payload,
      })

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(message)
        return true
      }

      if (socket.readyState === WebSocket.CONNECTING) {
        pendingMessages.push(message)
        console.info(`WebSocket still connecting. Queued emit for ${eventName}.`)
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
      socket.close()
    },
    get id() {
      return socketId
    },
    get readyState() {
      return socket.readyState
    },
  }
}
