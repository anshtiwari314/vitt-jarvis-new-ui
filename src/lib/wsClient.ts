type Listener = (data: any) => void;

interface WsClientConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectInterval?: number;
  maxRetries?: number;
}

export class WsClient {
  private url: string;
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<Listener>> = new Map();
  private reconnectTimer: any = null;
  private retryCount = 0;
  private config: WsClientConfig;
  private isExplicitDisconnect = false;

  constructor(config: WsClientConfig) {
    this.url = config.url;
    this.config = {
      reconnectInterval: 1000,
      maxReconnectInterval: 30000,
      maxRetries: 20,
      ...config,
    };
  }

  connect() {
    this.isExplicitDisconnect = false;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    console.log(`Connecting to ${this.url}...`);
    try {
      this.ws = new WebSocket(this.url);
    } catch (err) {
      console.error('WebSocket connection failed (invalid URL?):', err);
      this.emit('disconnect', null);
      // Schedule reconnect with backoff (if configured)
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.retryCount = 0;
      this.emit('connect', null);
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected', event.code, event.reason);
      this.emit('disconnect', null);
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error', error);
      // onerror is usually followed by onclose
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        // Expecting { type: string, data: any }
        if (message.type) {
          this.emit(message.type, message.data || message);
        } else {
            // Fallback if message doesn't have a type property at root
            // Depending on server implementation, we might need to adjust this.
            // For now, assume strict protocol or emit 'message'
            this.emit('message', message);
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message', e);
      }
    };
  }

  disconnect() {
    this.isExplicitDisconnect = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({ type, ...data }); // Flattening data into payload if needed, or { type, data }
      // Based on typical socket.io replacement, often it's { type: 'event', data: payload }
      // Let's stick to the plan: { type: string, data?: any }
      const message = JSON.stringify({ type, data });
      this.ws.send(message);
    } else {
      console.warn('WebSocket is not open. Cannot send message:', type);
    }
  }

  on(type: string, callback: Listener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(callback);
  }

  off(type: string, callback: Listener) {
    this.listeners.get(type)?.delete(callback);
  }

  private emit(type: string, data: any) {
    this.listeners.get(type)?.forEach((callback) => callback(data));
  }

  private scheduleReconnect() {
    if (this.isExplicitDisconnect) return;

    if (this.retryCount >= (this.config.maxRetries || 20)) {
      console.error('Max reconnect retries reached');
      return;
    }

    const delay = Math.min(
      (this.config.reconnectInterval || 1000) * Math.pow(2, this.retryCount),
      this.config.maxReconnectInterval || 30000
    );

    console.log(`Reconnecting in ${delay}ms... (Attempt ${this.retryCount + 1})`);
    
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    
    this.reconnectTimer = setTimeout(() => {
      this.retryCount++;
      this.connect();
    }, delay);
  }
}
