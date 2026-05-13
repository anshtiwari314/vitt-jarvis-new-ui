import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  WifiOff,
  ServerOff,
  Loader2,
  Signal,
  SignalMedium,
  SignalLow,
  SignalZero,
} from "lucide-react";
import { config as AppConfig } from "../../configuration";

const THRESHOLDS = {
  POOR: 800,
  TIMEOUT: 5000,
};

export type NetworkConnStatus =
  | "checking"
  | "good"
  | "poor-internet"
  | "server-unreachable"
  | "offline";

export interface NetworkStatus {
  status: NetworkConnStatus;
  internetLatency: number | "Timeout";
  serverLatency: number | "Timeout";
}

function wsToHttp(url: string) {
  if (!url) return url;
  return url.replace(/^wss:\/\//i, "https://").replace(/^ws:\/\//i, "http://");
}

export function defaultHealthUrl() {
  return `${wsToHttp(AppConfig.wsUrl)}/ping`;
}

export function useConnectionQuality(serverHealthUrl: string, intervalMs = 15000): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    status: "checking",
    internetLatency: 0,
    serverLatency: 0,
  });

  const checkGeneralInternet = useCallback((): Promise<number> => {
    return new Promise((resolve) => {
      const start = Date.now();
      const img = new Image();
      const timer = setTimeout(() => resolve(Infinity), THRESHOLDS.TIMEOUT);

      img.onload = () => {
        clearTimeout(timer);
        resolve(Date.now() - start);
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(Infinity);
      };

      img.src = `https://www.google.com/favicon.ico?cb=${start}`;
    });
  }, []);

  const checkServerConnection = useCallback(async (): Promise<number> => {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), THRESHOLDS.TIMEOUT);

      const response = await fetch(`${serverHealthUrl}?cb=${start}`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) return Infinity;
      return Date.now() - start;
    } catch {
      return Infinity;
    }
  }, [serverHealthUrl]);

  useEffect(() => {
    let cancelled = false;

    const runChecks = async () => {
      if (!navigator.onLine) {
        if (!cancelled) setNetworkStatus((prev) => ({ ...prev, status: "offline" }));
        return;
      }

      const [internetTime, serverTime] = await Promise.all([
        checkGeneralInternet(),
        checkServerConnection(),
      ]);

      let currentStatus: NetworkConnStatus = "good";
      if (internetTime > THRESHOLDS.POOR || internetTime === Infinity) {
        currentStatus = "poor-internet";
      } else if (serverTime > THRESHOLDS.POOR || serverTime === Infinity) {
        currentStatus = "server-unreachable";
      }

      if (!cancelled) {
        setNetworkStatus({
          status: currentStatus,
          internetLatency: internetTime === Infinity ? "Timeout" : internetTime,
          serverLatency: serverTime === Infinity ? "Timeout" : serverTime,
        });
      }
    };

    runChecks();
    const intervalId = setInterval(runChecks, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [checkGeneralInternet, checkServerConnection, intervalMs]);

  return networkStatus;
}

const STATUS_META: Record<NetworkConnStatus, { label: string; dot: string; tint: string }> = {
  checking: { label: "Checking connection…", dot: "bg-slate-400", tint: "text-slate-500" },
  good: { label: "Connection looks good", dot: "bg-green-500", tint: "text-green-600" },
  "poor-internet": { label: "Internet is unstable or slow", dot: "bg-red-500", tint: "text-red-600" },
  "server-unreachable": { label: "Trouble reaching our servers", dot: "bg-amber-500", tint: "text-amber-600" },
  offline: { label: "You are offline", dot: "bg-red-600", tint: "text-red-700" },
};

function StatusIconGlyph({ status, className }: { status: NetworkConnStatus; className?: string }) {
  if (status === "offline") return <SignalZero className={className} />;
  if (status === "poor-internet") return <SignalLow className={className} />;
  if (status === "server-unreachable") return <SignalMedium className={className} />;
  if (status === "checking") return <Loader2 className={`${className} animate-spin`} />;
  return <Signal className={className} />;
}

export function NetworkStatusIcon({ status, internetLatency, serverLatency, variant = 'default' }: NetworkStatus & { variant?: 'default' | 'bare' }) {
  const meta = STATUS_META[status];
  const formatLatency = (v: number | "Timeout") => (v === "Timeout" ? "Timeout" : `${v}ms`);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);

  const updateCoords = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateCoords();
    const onScrollOrResize = () => updateCoords();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updateCoords]);

  const showPopover = () => setOpen(true);
  const hidePopover = () => setOpen(false);

  const popover =
    open && coords && typeof document !== "undefined"
      ? createPortal(
          <div
            style={{ position: "fixed", top: coords.top, right: coords.right, zIndex: 10001 }}
            className="w-60"
            onMouseEnter={showPopover}
            onMouseLeave={hidePopover}
          >
            <div className="rounded-lg border border-white/40 bg-white/95 backdrop-blur-md shadow-lg px-3 py-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <span className={`inline-block h-2 w-2 rounded-full ${meta.dot}`} />
                {meta.label}
              </div>
              <div className="mt-2 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Internet</span>
                  <span>{formatLatency(internetLatency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Server</span>
                  <span>{formatLatency(serverLatency)}</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  const isBare = variant === 'bare';

  return (
    <div className={`relative flex items-center ${isBare ? '' : 'h-10 md:h-12'}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={meta.label}
        onMouseEnter={showPopover}
        onMouseLeave={hidePopover}
        onFocus={showPopover}
        onBlur={hidePopover}
        onClick={() => setOpen((v) => !v)}
        className={
          isBare
            ? `flex items-center justify-center ${meta.tint}`
            : `h-full px-3 md:px-4 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition shadow-sm ${meta.tint}`
        }
      >
        <span className="relative flex items-center">
          <StatusIconGlyph status={status} className={isBare ? 'w-5 h-5' : 'w-5 h-5 md:w-6 md:h-6'} />
          <span className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-white ${meta.dot}`} />
        </span>
      </button>

      {popover}
    </div>
  );
}

export function NetworkStatusBanner({ status, internetLatency, serverLatency }: NetworkStatus) {
  if (status === "good" || status === "checking") return null;

  const tint =
    status === "offline" || status === "poor-internet"
      ? "bg-red-100/80 border-red-200/60 text-red-900"
      : "bg-amber-100/80 border-amber-200/60 text-amber-900";

  const Icon =
    status === "offline" ? WifiOff : status === "poor-internet" ? AlertTriangle : ServerOff;

  const message =
    status === "offline"
      ? "You are offline."
      : status === "poor-internet"
      ? "Your internet connection is unstable or slow."
      : "Having trouble reaching our servers.";

  return (
    <div
      className={`fixed bottom-5 left-5 z-[9999] flex items-center gap-3 rounded-lg border px-4 py-3 shadow-md backdrop-blur-sm ${tint}`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div className="flex flex-col">
        <strong className="text-sm font-medium">{message}</strong>
        <span className="text-[11px] opacity-80">
          Internet: {String(internetLatency)}ms | Server: {String(serverLatency)}ms
        </span>
      </div>
    </div>
  );
}
