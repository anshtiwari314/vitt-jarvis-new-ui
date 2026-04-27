
i want to create a comp in react which which will measure my internet connectivity similar to google meet like if internet is poor i get notification that your internet is poor



for this i want to use two approaches "my internet speed" (by pinging google servers) & "my server connection speed" (via pinging my hosted server)



cuz there are possiblities that i have internet but still my server is unable to react with my current network



so that i will immediately know what's the issue , if internet speed is low then both shud be low



what the best approach to do this , i want this test to be run in every 15 seconds

gemini 3 pro resp 

This is a highly practical and standard architectural approach. Separating "general internet reachability" from "specific server reachability" is exactly how enterprise apps like Google Meet or Slack diagnose connection issues.

However, there is one crucial technical hurdle we need to address first: You cannot run a true ICMP "ping" from a web browser using JavaScript. Browsers restrict this for security reasons.

Instead, we use HTTP latency measurement. We measure how long it takes to request a tiny resource and get a response.

Here is the best approach to build this in React, using a custom hook for the logic and a component for the UI.

1. The Strategy
General Internet Check: We will attempt to load a tiny, highly reliable image (like the Google favicon). Using an <Image> object bypasses CORS (Cross-Origin Resource Sharing) restrictions that normally block JavaScript from reading requests to third-party domains.

Server Check: We will use fetch to hit a lightweight /health or /ping endpoint on your backend.

Cache Busting: We will append a timestamp (?cb=123456) to the URLs so the browser doesn't just return a cached version instantly.

Interval: We will wrap this in a setInterval that runs every 15 seconds.

2. The Custom Hook (useConnectionQuality)
This hook encapsulates all the measurement logic so your UI component stays clean.

JavaScript
import { useState, useEffect, useCallback } from 'react';

// Define latency thresholds (in milliseconds)
const THRESHOLDS = {
  POOR: 800, // Anything over 800ms is considered poor
  TIMEOUT: 5000 // Give up after 5 seconds
};

export const useConnectionQuality = (serverHealthUrl, intervalMs = 15000) => {
  const [networkStatus, setNetworkStatus] = useState({
    status: 'checking', // 'good', 'poor-internet', 'server-unreachable', 'offline'
    internetLatency: 0,
    serverLatency: 0,
  });

  const checkGeneralInternet = useCallback(() => {
    return new Promise((resolve) => {
      const start = Date.now();
      const img = new Image();
      
      // If it takes too long, force a timeout
      const timer = setTimeout(() => resolve(Infinity), THRESHOLDS.TIMEOUT);

      img.onload = () => {
        clearTimeout(timer);
        resolve(Date.now() - start);
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(Infinity);
      };
      
      // Google's favicon is tiny, highly available, and perfect for this
      img.src = `https://www.google.com/favicon.ico?cb=${start}`;
    });
  }, []);

  const checkServerConnection = useCallback(async () => {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), THRESHOLDS.TIMEOUT);
      
      // Make sure your server endpoint handles CORS appropriately!
      const response = await fetch(`${serverHealthUrl}?cb=${start}`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) return Infinity;
      return Date.now() - start;
    } catch (error) {
      return Infinity; // Network error or aborted
    }
  }, [serverHealthUrl]);

  useEffect(() => {
    const runChecks = async () => {
      // 1. Check if the browser natively thinks it's offline first
      if (!navigator.onLine) {
        setNetworkStatus((prev) => ({ ...prev, status: 'offline' }));
        return;
      }

      // 2. Run both checks simultaneously for efficiency
      const [internetTime, serverTime] = await Promise.all([
        checkGeneralInternet(),
        checkServerConnection()
      ]);

      // 3. Determine the actual status based on your logic
      let currentStatus = 'good';

      if (internetTime > THRESHOLDS.POOR || internetTime === Infinity) {
        currentStatus = 'poor-internet'; // Both will likely be bad here
      } else if (serverTime > THRESHOLDS.POOR || serverTime === Infinity) {
        currentStatus = 'server-unreachable'; // Internet is fine, but server is slow/down
      }

      setNetworkStatus({
        status: currentStatus,
        internetLatency: internetTime === Infinity ? 'Timeout' : internetTime,
        serverLatency: serverTime === Infinity ? 'Timeout' : serverTime,
      });
    };

    // Run immediately on mount, then set interval
    runChecks();
    const intervalId = setInterval(runChecks, intervalMs);

    return () => clearInterval(intervalId);
  }, [checkGeneralInternet, checkServerConnection, intervalMs]);

  return networkStatus;
};
3. The UI Component (NetworkMonitor)
Now, you can consume this hook anywhere in your app to show a Google Meet-style notification.

JavaScript
import React from 'react';
import { useConnectionQuality } from './useConnectionQuality';

const NetworkMonitor = () => {
  // Pass your actual backend health endpoint here
  const { status, internetLatency, serverLatency } = useConnectionQuality(
    'https://api.yourdomain.com/health', 
    15000 // 15 seconds
  );

  if (status === 'good' || status === 'checking') {
    // Optionally render nothing if everything is fine
    return null; 
  }

  return (
    <div style={styles.banner}>
      <span style={styles.icon}>⚠️</span>
      <div style={styles.textContainer}>
        {status === 'offline' && <strong>You are completely offline.</strong>}
        
        {status === 'poor-internet' && (
          <strong>Your internet connection is unstable or slow.</strong>
        )}
        
        {status === 'server-unreachable' && (
          <strong>Experiencing difficulties connecting to our servers.</strong>
        )}
        
        {/* Optional: Dev details to help you debug */}
        <div style={styles.debug}>
          Internet: {internetLatency}ms | Server: {serverLatency}ms
        </div>
      </div>
    </div>
  );
};

// Quick inline styles for demonstration
const styles = {
  banner: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '12px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    zIndex: 9999,
  },
  icon: { fontSize: '20px', marginRight: '12px' },
  textContainer: { display: 'flex', flexDirection: 'column' },
  debug: { fontSize: '11px', opacity: 0.7, marginTop: '4px' }
};

export default NetworkMonitor;
4. What you need on your Backend
For this to work smoothly, you must set up a route on your server (e.g., GET /health).

It should return a very lightweight response (e.g., a simple 200 OK with JSON {"status": "ok"}).

Crucial: It must have CORS headers enabled so your React frontend (running on a different origin/port during dev) is allowed to fetch it.

This setup gives you exactly what you need: a passive, 15-second heartbeat that intelligently distinguishes between a user's bad local Wi-Fi and your server having a bad day.